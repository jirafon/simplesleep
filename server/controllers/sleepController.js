const User = require('../models/User');
const HealthData = require('../models/HealthData');
const DailyCheckIn = require('../models/DailyCheckIn');
const WeeklyReport = require('../models/WeeklyReport');
const {
  computeSleepScore,
  buildTonightRecommendation,
  GOAL_OPTIONS,
  MORNING_FEELINGS,
  NIGHT_EVENTS,
  ALGORITHM_VERSION,
  minutesFromClock
} = require('../services/sleepScoreService');
const experimentService = require('../services/sleepExperimentService');
const insightsEngine = require('../services/sleepInsightsEngine');
const contextEngine = require('../services/sleepContextEngine');
const baselineService = require('../services/personalSleepBaselineService');
const { buildMorningBrief } = require('../services/morningBriefService');
const {
  buildSleepTimeline,
  buildNightPhoneInterruptionInsight
} = require('../services/sleepTimelineService');
const { buildWeeklyStory } = require('../services/weeklyStoryService');
const { buildCoachContext } = require('../services/sleepCoachContextBuilder');
const { coachChat } = require('../services/sleepCoachService');
const { computeSoftStreaks } = require('../services/softStreakService');
const tonightTryService = require('../services/tonightTryService');
const {
  attachBandReminders,
  activateBandReminder
} = require('../services/sleepBandReminderService');
const { isFeatureEnabled } = require('../config/featureFlags');
const { t: i18nT, localizeCatalogItem } = require('../i18n/sleepMessages');
const SleepContext = require('../models/SleepContext');

const dateKeyUTC = (d = new Date()) => d.toISOString().slice(0, 10);
const uid = (req) => req.user?._id || req.user?.id;

const extractSleepFromRecord = (record) => {
  const sleep = record?.data?.sleepData || record?.data?.sleepSummary || {};
  const total =
    sleep.totalMinutes ??
    sleep.total ??
    sleep.sleep_duration_total ??
    (typeof sleep.totalSleepDuration === 'number' ? Math.round(sleep.totalSleepDuration / 60) : null);
  const awake =
    sleep.awakeMinutes ??
    sleep.awake ??
    (typeof sleep.awakeDuration === 'number' ? Math.round(sleep.awakeDuration / 60) : null);
  const wakingCount = sleep.wakingCount ?? sleep.wakeCount ?? sleep.awakenings ?? null;
  const bedtimeClock = sleep.bedtime || sleep.sleepStartClock || sleep.startClock || null;
  const nightHr =
    record?.data?.heartRate ??
    record?.data?.sleepData?.avgHeartRate ??
    sleep.avgHr ??
    null;

  return {
    timestamp: record?.timestamp,
    totalMinutes: typeof total === 'number' ? total : null,
    awakeMinutes: typeof awake === 'number' ? awake : null,
    wakingCount: typeof wakingCount === 'number' ? wakingCount : null,
    bedtimeClock,
    nightHeartRate: typeof nightHr === 'number' ? nightHr : null,
    deep: sleep.deepMinutes ?? sleep.deep ?? null,
    light: sleep.lightMinutes ?? sleep.light ?? null,
    rem: sleep.remMinutes ?? sleep.rem ?? null
  };
};

const findUserSleepRecords = async (user, limit = 30) => {
  const email = user.email?.toLowerCase();
  const linkedDeviceIds = (user.mobilePushTokens || [])
    .map((t) => t.deviceId)
    .filter(Boolean);

  const orClauses = [
    { email },
    { 'data.email': email },
    { 'data.patientEmail': email },
    { 'data.userEmail': email }
  ];
  if (linkedDeviceIds.length) {
    orClauses.push({ deviceId: { $in: linkedDeviceIds } });
  }

  const records = await HealthData.find({ $or: orClauses })
    .sort({ timestamp: -1 })
    .limit(limit * 3)
    .lean();

  return records
    .map(extractSleepFromRecord)
    .filter((r) => r.totalMinutes != null || r.bedtimeClock)
    .slice(0, limit);
};

const buildBaseline = (nights) => {
  const bedtimes = nights
    .map((n) => minutesFromClock(n.bedtimeClock))
    .filter((v) => v != null);
  const totals = nights.map((n) => n.totalMinutes).filter((v) => typeof v === 'number');
  const hrs = nights.map((n) => n.nightHeartRate).filter((v) => typeof v === 'number');

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  return {
    avgBedtimeMinutes: avg(bedtimes) != null ? Math.round(avg(bedtimes)) : null,
    avgSleepMinutes: avg(totals) != null ? Math.round(avg(totals)) : null,
    avgNightHr: avg(hrs) != null ? Math.round(avg(hrs)) : null,
    updatedAt: new Date()
  };
};

const getOnboarding = async (req, res) => {
  try {
    const user = await User.findById(uid(req)).select('sleepProfile wellnessProfile.sleepGoalMinutes');
    const locale = req.locale || 'en';
    res.json({
      success: true,
      profile: user?.sleepProfile || {},
      sleepGoalMinutes: user?.wellnessProfile?.sleepGoalMinutes || 480,
      goalOptions: GOAL_OPTIONS.map((g) => ({
        ...g,
        label: i18nT(locale, `goal.${g.id}`)
      })),
      morningFeelings: MORNING_FEELINGS,
      nightEvents: NIGHT_EVENTS,
      locale
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOnboarding = async (req, res) => {
  try {
    const patch = req.body || {};
    const updates = {};
    const allowed = [
      'onboardingCompleted', 'onboardingStep', 'primaryGoal', 'wakeFeeling',
      'usualBedtime', 'usualWakeTime', 'targetBedtime', 'targetWakeTime',
      'awakeningsFrequency', 'caffeineHabit', 'alcoholHabit', 'dinnerTiming',
      'stressLevel', 'screenUse', 'nightSymptoms', 'vibrationPreference',
      'notificationConsent', 'locationConsent', 'windDownMinutes'
    ];

    allowed.forEach((key) => {
      if (patch[key] !== undefined) updates[`sleepProfile.${key}`] = patch[key];
    });

    if (patch.sleepGoalMinutes != null) {
      updates['wellnessProfile.sleepGoalMinutes'] = Number(patch.sleepGoalMinutes);
    }

    const user = await User.findByIdAndUpdate(
      uid(req),
      { $set: updates },
      { new: true }
    ).select('sleepProfile wellnessProfile.sleepGoalMinutes');

    res.json({ success: true, profile: user.sleepProfile, sleepGoalMinutes: user.wellnessProfile?.sleepGoalMinutes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getToday = async (req, res) => {
  try {
    const user = await User.findById(uid(req));
    const nights = await findUserSleepRecords(user, 21);
    const latest = nights[0] || {};
    const baseline = user.sleepProfile?.baseline?.avgSleepMinutes
      ? user.sleepProfile.baseline
      : buildBaseline(nights.slice(1));

    // Persist baseline opportunistically
    if (!user.sleepProfile?.baseline?.updatedAt && nights.length >= 3) {
      await User.updateOne(
        { _id: user._id },
        { $set: { 'sleepProfile.baseline': baseline } }
      );
    }

    const todayKey = dateKeyUTC();
    const checkIn = await DailyCheckIn.findOne({ userId: user._id, dateKey: todayKey }).lean();

    const scoreInput = {
      totalMinutes: latest.totalMinutes,
      sleepGoalMinutes: user.wellnessProfile?.sleepGoalMinutes || 480,
      bedtimeClock: latest.bedtimeClock,
      targetBedtime: user.sleepProfile?.targetBedtime || user.sleepProfile?.usualBedtime,
      avgBedtimeMinutes: baseline.avgBedtimeMinutes,
      awakeMinutes: latest.awakeMinutes,
      wakingCount: latest.wakingCount,
      nightHeartRate: latest.nightHeartRate,
      baselineNightHr: baseline.avgNightHr,
      morningFeeling: checkIn?.morning?.feeling || null
    };

    const scoreResult = computeSleepScore(scoreInput);
    scoreResult.qualityLabel = i18nT(req.locale || 'en', `quality.${scoreResult.quality}`);
    scoreResult.disclaimer = i18nT(req.locale || 'en', 'score.disclaimer');

    let recommendation = buildTonightRecommendation({
      targetBedtime: scoreInput.targetBedtime,
      windDownMinutes: user.sleepProfile?.windDownMinutes || 45,
      scoreResult,
      totalMinutes: latest.totalMinutes,
      sleepGoalMinutes: scoreInput.sleepGoalMinutes,
      locale: req.locale || 'en'
    });

    let sleepFactors = [];
    let phoneToSleep = null;
    let contextSummary = null;
    let baselines = null;

    if (isFeatureEnabled('SLEEP_CONTEXT_ENGINE')) {
      try {
        const built = await contextEngine.buildContextForNight({
          user,
          night: { ...latest, dateKey: latest.timestamp ? new Date(latest.timestamp).toISOString().slice(0, 10) : todayKey },
          nights,
          dateKey: latest.timestamp ? new Date(latest.timestamp).toISOString().slice(0, 10) : todayKey,
          locale: req.locale || 'en',
          scoreResult
        });
        if (built?.tonightMove) {
          recommendation = built.tonightMove;
        }
        sleepFactors = built?.factors || [];
        baselines = built?.baselines || null;
        const phone = built?.context?.phone;
        if (phone?.screenToSleepMinutes != null || phone?.lastInteractionAt) {
          phoneToSleep = {
            screenToSleepMinutes: phone.screenToSleepMinutes ?? null,
            lastInteractionAt: phone.lastInteractionAt || null,
            avgScreenToSleepMinutes: built?.context?.derived?.avgScreenToSleepMinutes ?? null
          };
        }
        contextSummary = {
          available: true,
          dataQuality: built?.context?.dataQuality || null,
          algorithmVersion: built?.context?.algorithmVersion || 'sleep-context-v1'
        };
      } catch (ctxErr) {
        console.warn('sleep context build skipped:', ctxErr.message);
      }
    }

    if (recommendation) {
      recommendation = attachBandReminders(recommendation, {
        locale: req.locale || 'en',
        targetBedtime: scoreInput.targetBedtime || user.sleepProfile?.targetBedtime
      });
    }

    let morningBrief = null;
    if (isFeatureEnabled('AI_MORNING_BRIEF')) {
      morningBrief = buildMorningBrief({
        locale: req.locale || 'en',
        lastNight: {
          totalMinutes: latest.totalMinutes,
          vsBaselineMinutes:
            latest.totalMinutes != null && baseline.avgSleepMinutes != null
              ? latest.totalMinutes - baseline.avgSleepMinutes
              : null,
          bedtimeDeviationMinutes: baselines?.primary
            ? baselineService.bedtimeDeviationMinutes(
                latest.bedtimeClock,
                baselines.primary.avgBedtimeMinutes
              )
            : null
        },
        baseline: baselines?.primary || baseline,
        phone: phoneToSleep
          ? {
              lastInteractionAt: phoneToSleep.lastInteractionAt,
              screenToSleepMinutes: phoneToSleep.screenToSleepMinutes
            }
          : {},
        recommendation,
        sleepScore: scoreResult.score,
        factors: sleepFactors
      });
    }

    const nextReminder = (user.wellnessProfile?.importantReminders || [])
      .filter((r) => r.enabled !== false)
      .sort((a, b) => String(a.startTime || a.time).localeCompare(String(b.startTime || b.time)))[0] || null;

    const vsBaseline =
      latest.totalMinutes != null && baseline.avgSleepMinutes != null
        ? latest.totalMinutes - baseline.avgSleepMinutes
        : null;

    let softStreaks = null;
    try {
      softStreaks = await computeSoftStreaks(user._id, {
        nights,
        locale: req.locale || 'en'
      });
    } catch (streakErr) {
      console.warn('soft streaks skipped:', streakErr.message);
    }

    let recommendationTried = false;
    try {
      const tryDoc = await tonightTryService.getTryForDate(user._id, todayKey);
      recommendationTried = Boolean(tryDoc?.tried);
    } catch (_) {
      /* optional */
    }

    res.json({
      success: true,
      dateKey: todayKey,
      sleepScore: scoreResult,
      lastNight: {
        ...latest,
        vsBaselineMinutes: vsBaseline
      },
      baseline,
      baselines: baselines?.windows || null,
      recommendation: recommendation
        ? { ...recommendation, tried: recommendationTried }
        : null,
      sleepFactors,
      phoneToSleep,
      context: contextSummary,
      morningBrief,
      softStreaks,
      checkIn: {
        morningDone: Boolean(checkIn?.morning?.completedAt),
        eveningDone: Boolean(checkIn?.evening?.completedAt),
        morning: checkIn?.morning || null,
        evening: checkIn?.evening || null
      },
      nextReminder: nextReminder
        ? {
            label: nextReminder.label,
            time: nextReminder.startTime || nextReminder.time,
            vibrationCount: nextReminder.vibrationCount
          }
        : null,
      onboardingCompleted: Boolean(user.sleepProfile?.onboardingCompleted),
      primaryGoal: user.sleepProfile?.primaryGoal || null
    });
  } catch (error) {
    console.error('sleep today:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const user = await User.findById(uid(req));
    const limit = Math.min(parseInt(req.query.limit || '30', 10) || 30, 90);
    const nights = await findUserSleepRecords(user, limit);
    const checkIns = await DailyCheckIn.find({ userId: user._id })
      .sort({ dateKey: -1 })
      .limit(limit)
      .lean();
    const byDate = Object.fromEntries(checkIns.map((c) => [c.dateKey, c]));

    const rows = nights.map((n) => {
      const key = n.timestamp ? new Date(n.timestamp).toISOString().slice(0, 10) : null;
      const ci = key ? byDate[key] : null;
      const score = ci?.sleepScore || computeSleepScore({
        totalMinutes: n.totalMinutes,
        sleepGoalMinutes: user.wellnessProfile?.sleepGoalMinutes || 480,
        bedtimeClock: n.bedtimeClock,
        targetBedtime: user.sleepProfile?.targetBedtime,
        avgBedtimeMinutes: user.sleepProfile?.baseline?.avgBedtimeMinutes,
        awakeMinutes: n.awakeMinutes,
        wakingCount: n.wakingCount,
        nightHeartRate: n.nightHeartRate,
        baselineNightHr: user.sleepProfile?.baseline?.avgNightHr,
        morningFeeling: ci?.morning?.feeling
      });
      return { dateKey: key, ...n, sleepScore: score, morningFeeling: ci?.morning?.feeling || null };
    });

    res.json({ success: true, nights: rows, algorithmVersion: ALGORITHM_VERSION });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const upsertCheckIn = async (userId, dateKey, branch, payload) => {
  const set = {};
  Object.entries(payload).forEach(([k, v]) => {
    set[`${branch}.${k}`] = v;
  });
  set[`${branch}.completedAt`] = new Date();

  return DailyCheckIn.findOneAndUpdate(
    { userId, dateKey },
    { $set: set, $setOnInsert: { userId, dateKey } },
    { upsert: true, new: true }
  );
};

const postMorningCheckIn = async (req, res) => {
  try {
    const dateKey = req.body.dateKey || dateKeyUTC();
    const feeling = req.body.feeling;
    if (!MORNING_FEELINGS.includes(feeling)) {
      return res.status(400).json({ success: false, message: 'feeling inválido' });
    }
    const nightEvents = Array.isArray(req.body.nightEvents) ? req.body.nightEvents : [];
    const doc = await upsertCheckIn(uid(req), dateKey, 'morning', { feeling, nightEvents });

    // Recompute score with subjective input
    const user = await User.findById(uid(req));
    const nights = await findUserSleepRecords(user, 14);
    const latest = nights[0] || {};
    const scoreResult = computeSleepScore({
      totalMinutes: latest.totalMinutes,
      sleepGoalMinutes: user.wellnessProfile?.sleepGoalMinutes || 480,
      bedtimeClock: latest.bedtimeClock,
      targetBedtime: user.sleepProfile?.targetBedtime,
      avgBedtimeMinutes: user.sleepProfile?.baseline?.avgBedtimeMinutes,
      awakeMinutes: latest.awakeMinutes,
      wakingCount: latest.wakingCount,
      nightHeartRate: latest.nightHeartRate,
      baselineNightHr: user.sleepProfile?.baseline?.avgNightHr,
      morningFeeling: feeling
    });

    doc.sleepScore = { ...scoreResult, computedAt: new Date() };
    await doc.save();

    res.json({ success: true, checkIn: doc, sleepScore: scoreResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const postEveningCheckIn = async (req, res) => {
  try {
    const dateKey = req.body.dateKey || dateKeyUTC();
    const evening = {
      caffeine: req.body.caffeine || { had: false },
      alcohol: req.body.alcohol || { had: false },
      lastMealTime: req.body.lastMealTime || null,
      dinnerSize: req.body.dinnerSize || null,
      exercise: req.body.exercise || { had: false },
      nap: req.body.nap || { had: false },
      stress: req.body.stress ?? null,
      screens: req.body.screens || { late: false },
      bedroomTemp: req.body.bedroomTemp || null,
      mood: req.body.mood || null,
      supplements: req.body.supplements || null,
      notes: req.body.notes || null
    };
    const doc = await upsertCheckIn(uid(req), dateKey, 'evening', evening);
    res.json({ success: true, checkIn: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCheckIns = async (req, res) => {
  try {
    const from = req.query.from;
    const to = req.query.to;
    const q = { userId: uid(req) };
    if (from || to) {
      q.dateKey = {};
      if (from) q.dateKey.$gte = from;
      if (to) q.dateKey.$lte = to;
    }
    const rows = await DailyCheckIn.find(q).sort({ dateKey: -1 }).limit(60).lean();
    res.json({ success: true, checkIns: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWeeklyReport = async (req, res) => {
  try {
    const user = await User.findById(uid(req));
    const nights = await findUserSleepRecords(user, 14);
    const weekNights = nights.slice(0, 7);
    const scores = weekNights.map((n) => computeSleepScore({
      totalMinutes: n.totalMinutes,
      sleepGoalMinutes: user.wellnessProfile?.sleepGoalMinutes || 480,
      bedtimeClock: n.bedtimeClock,
      targetBedtime: user.sleepProfile?.targetBedtime,
      avgBedtimeMinutes: user.sleepProfile?.baseline?.avgBedtimeMinutes,
      awakeMinutes: n.awakeMinutes,
      wakingCount: n.wakingCount,
      nightHeartRate: n.nightHeartRate,
      baselineNightHr: user.sleepProfile?.baseline?.avgNightHr
    }));

    const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
    const totals = weekNights.map((n) => n.totalMinutes).filter((v) => v != null);
    const scoreVals = scores.map((s) => s.score);
    const interrupts = weekNights.map((n) => n.wakingCount || 0);
    const hrs = weekNights.map((n) => n.nightHeartRate).filter((v) => v != null);

    let best = null;
    let worst = null;
    scores.forEach((s, i) => {
      const dateKey = weekNights[i]?.timestamp
        ? new Date(weekNights[i].timestamp).toISOString().slice(0, 10)
        : `night-${i}`;
      if (!best || s.score > best.score) best = { dateKey, score: s.score };
      if (!worst || s.score < worst.score) worst = { dateKey, score: s.score };
    });

    const prevTotals = nights.slice(7, 14).map((n) => n.totalMinutes).filter((v) => v != null);
    const delta = avg(totals) != null && avg(prevTotals) != null
      ? Math.round(avg(totals) - avg(prevTotals))
      : null;

    const locale = req.locale || 'en';
    const narrative = delta != null
      ? i18nT(locale, 'report.narrativeDelta', {
          abs: Math.abs(delta),
          dir: i18nT(locale, delta >= 0 ? 'report.narrativeLonger' : 'report.narrativeLess')
        })
      : i18nT(locale, 'report.narrativeGathering');

    const nextWeekRecommendation = user.sleepProfile?.targetBedtime
      ? i18nT(locale, 'report.nextWithTarget', { time: user.sleepProfile.targetBedtime })
      : i18nT(locale, 'report.nextNoTarget');

    const weekStart = dateKeyUTC(new Date(Date.now() - 6 * 86400000));
    const weekEnd = dateKeyUTC();

    let associations = [i18nT(locale, 'report.needLogs')];
    let activeExperiment = null;

    if (isFeatureEnabled('SLEEP_INSIGHTS_ENGINE')) {
      const scoredNights = weekNights.map((n, i) => ({
        ...n,
        sleepScore: scores[i]
      }));
      const fullNights = nights.map((n) => ({
        ...n,
        sleepScore: computeSleepScore({
          totalMinutes: n.totalMinutes,
          sleepGoalMinutes: user.wellnessProfile?.sleepGoalMinutes || 480,
          bedtimeClock: n.bedtimeClock,
          targetBedtime: user.sleepProfile?.targetBedtime,
          avgBedtimeMinutes: user.sleepProfile?.baseline?.avgBedtimeMinutes,
          awakeMinutes: n.awakeMinutes,
          wakingCount: n.wakingCount,
          nightHeartRate: n.nightHeartRate,
          baselineNightHr: user.sleepProfile?.baseline?.avgNightHr
        })
      }));
      const { insights } = await insightsEngine.computeInsights(user._id, fullNights, locale);
      if (insights.length) {
        associations = insights.map((i) => i.body);
      }
    }

    if (isFeatureEnabled('SLEEP_EXPERIMENTS')) {
      const active = await experimentService.refreshActiveProgress(user._id, nights, locale);
      if (active) {
        activeExperiment = {
          id: active._id,
          experimentId: active.experimentId,
          title: active.title,
          status: active.status,
          compliance: experimentService.complianceRate(active),
          resultSummary: active.result?.summary || null
        };
      }
    }

    const checkInCount = await DailyCheckIn.countDocuments({
      userId: user._id,
      dateKey: { $gte: weekStart, $lte: weekEnd },
      'evening.completedAt': { $exists: true }
    });

    const summary = {
      avgSleepMinutes: avg(totals) != null ? Math.round(avg(totals)) : null,
      avgScore: avg(scoreVals) != null ? Math.round(avg(scoreVals)) : null,
      regularityLabel: i18nT(locale, 'report.baseline'),
      interruptionsAvg: avg(interrupts) != null ? Math.round(avg(interrupts) * 10) / 10 : null,
      nightHrAvg: avg(hrs) != null ? Math.round(avg(hrs)) : null,
      bestNight: best,
      worstNight: worst,
      habitsCompleted: checkInCount,
      activeExperiment,
      associations,
      nextWeekRecommendation,
      narrative,
      sleepDeltaMinutes: delta
    };

    const weekContexts = await SleepContext.find({
      userId: user._id,
      dateKey: { $gte: weekStart, $lte: weekEnd }
    })
      .sort({ dateKey: -1 })
      .lean();

    const weeklyStory = buildWeeklyStory({
      locale,
      summary,
      contexts: weekContexts,
      insights: associations.map((body) => ({ body }))
    });
    summary.weeklyStory = weeklyStory;

    const report = await WeeklyReport.findOneAndUpdate(
      { userId: user._id, weekStart },
      { userId: user._id, weekStart, weekEnd, summary, algorithmVersion: 'weekly-report-v2' },
      { upsert: true, new: true }
    );

    const chartNights = weekNights.map((n, i) => ({
      dateKey: n.timestamp ? new Date(n.timestamp).toISOString().slice(0, 10) : `night-${i}`,
      timestamp: n.timestamp,
      totalMinutes: n.totalMinutes,
      wakingCount: n.wakingCount,
      nightHeartRate: n.nightHeartRate,
      deep: n.deep,
      light: n.light,
      rem: n.rem,
      sleepScore: scores[i]
    }));

    res.json({ success: true, report, nights: chartNights, weeklyStory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const listExperiments = async (req, res) => {
  try {
    if (!isFeatureEnabled('SLEEP_EXPERIMENTS')) {
      return res.json({
        success: true,
        enabled: false,
        message: i18nT(req.locale || 'en', 'err.disabledExperiments'),
        catalog: experimentService.listCatalog(req.locale || 'en')
      });
    }
    const locale = req.locale || 'en';
    const user = await User.findById(uid(req));
    const nights = await findUserSleepRecords(user, 14);
    const active = await experimentService.refreshActiveProgress(user._id, nights, locale);
    const assignments = await experimentService.listAssignments(user._id, { locale });
    res.json({
      success: true,
      enabled: true,
      locale,
      catalog: experimentService.listCatalog(locale),
      active: active
        ? {
            ...active,
            compliance: experimentService.complianceRate(active)
          }
        : null,
      assignments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const startExperiment = async (req, res) => {
  try {
    if (!isFeatureEnabled('SLEEP_EXPERIMENTS')) {
      return res.status(404).json({ success: false, code: 'FEATURE_DISABLED', feature: 'SLEEP_EXPERIMENTS' });
    }
    const { experimentId } = req.body || {};
    const user = await User.findById(uid(req));
    const nights = await findUserSleepRecords(user, 14);
    const baselineScored = nights.map((n) => ({
      ...n,
      sleepScore: computeSleepScore({
        totalMinutes: n.totalMinutes,
        sleepGoalMinutes: user.wellnessProfile?.sleepGoalMinutes || 480,
        bedtimeClock: n.bedtimeClock,
        targetBedtime: user.sleepProfile?.targetBedtime,
        avgBedtimeMinutes: user.sleepProfile?.baseline?.avgBedtimeMinutes,
        awakeMinutes: n.awakeMinutes,
        wakingCount: n.wakingCount,
        nightHeartRate: n.nightHeartRate,
        baselineNightHr: user.sleepProfile?.baseline?.avgNightHr
      })
    }));
    const assignment = await experimentService.startExperiment(
      user._id,
      experimentId,
      baselineScored
    );
    res.status(201).json({ success: true, assignment });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message,
      active: error.active || undefined
    });
  }
};

const logExperimentDay = async (req, res) => {
  try {
    if (!isFeatureEnabled('SLEEP_EXPERIMENTS')) {
      return res.status(404).json({ success: false, code: 'FEATURE_DISABLED' });
    }
    const { id } = req.params;
    const assignment = await experimentService.logCompliance(uid(req), id, req.body || {});
    res.json({
      success: true,
      assignment,
      compliance: experimentService.complianceRate(assignment)
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const completeExperiment = async (req, res) => {
  try {
    if (!isFeatureEnabled('SLEEP_EXPERIMENTS')) {
      return res.status(404).json({ success: false, code: 'FEATURE_DISABLED' });
    }
    const abandon = Boolean(req.body?.abandon);
    const user = await User.findById(uid(req));
    const nights = await findUserSleepRecords(user, 30);
    const activeMeta = await experimentService.getActiveForUser(user._id);
    const assignmentId = req.params.id || activeMeta?._id;
    if (!assignmentId) {
      return res.status(404).json({ success: false, message: i18nT(req.locale || 'en', 'err.noExperiment') });
    }
    const start = activeMeta?.startedAt ? new Date(activeMeta.startedAt) : null;
    const duringNights = nights
      .filter((n) => !start || (n.timestamp && new Date(n.timestamp) >= start))
      .map((n) => ({
        ...n,
        sleepScore: computeSleepScore({
          totalMinutes: n.totalMinutes,
          sleepGoalMinutes: user.wellnessProfile?.sleepGoalMinutes || 480,
          bedtimeClock: n.bedtimeClock,
          targetBedtime: user.sleepProfile?.targetBedtime,
          avgBedtimeMinutes: user.sleepProfile?.baseline?.avgBedtimeMinutes,
          awakeMinutes: n.awakeMinutes,
          wakingCount: n.wakingCount,
          nightHeartRate: n.nightHeartRate,
          baselineNightHr: user.sleepProfile?.baseline?.avgNightHr
        })
      }));
    const assignment = await experimentService.finalizeExperiment(
      user._id,
      assignmentId,
      duringNights,
      { abandon, locale: req.locale || 'en' }
    );
    res.json({ success: true, assignment });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getInsights = async (req, res) => {
  try {
    if (!isFeatureEnabled('SLEEP_INSIGHTS_ENGINE')) {
      return res.json({
        success: true,
        enabled: false,
        insights: [],
        message: i18nT(req.locale || 'en', 'err.disabledInsights')
      });
    }
    const locale = req.locale || 'en';
    const user = await User.findById(uid(req));
    const nights = await findUserSleepRecords(user, 45);
    const scored = nights.map((n) => ({
      ...n,
      sleepScore: computeSleepScore({
        totalMinutes: n.totalMinutes,
        sleepGoalMinutes: user.wellnessProfile?.sleepGoalMinutes || 480,
        bedtimeClock: n.bedtimeClock,
        targetBedtime: user.sleepProfile?.targetBedtime,
        avgBedtimeMinutes: user.sleepProfile?.baseline?.avgBedtimeMinutes,
        awakeMinutes: n.awakeMinutes,
        wakingCount: n.wakingCount,
        nightHeartRate: n.nightHeartRate,
        baselineNightHr: user.sleepProfile?.baseline?.avgNightHr
      })
    }));
    const result = await insightsEngine.computeInsights(user._id, scored, locale);
    res.json({ success: true, enabled: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const postPhoneContext = async (req, res) => {
  try {
    if (!isFeatureEnabled('SLEEP_CONTEXT_ENGINE') || !isFeatureEnabled('PHONE_USAGE_CONTEXT')) {
      return res.status(404).json({
        success: false,
        code: 'FEATURE_DISABLED',
        message: 'Phone usage context is not enabled.'
      });
    }
    const doc = await contextEngine.ingestPhoneContext(uid(req), req.body || {});
    res.json({
      success: true,
      context: {
        dateKey: doc.dateKey,
        phone: doc.phone,
        activity: doc.activity,
        dataQuality: doc.dataQuality
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getContextTodayEndpoint = async (req, res) => {
  try {
    if (!isFeatureEnabled('SLEEP_CONTEXT_ENGINE')) {
      return res.status(404).json({ success: false, code: 'FEATURE_DISABLED' });
    }
    const dateKey = req.query.dateKey || dateKeyUTC();
    const context = await contextEngine.getContextToday(uid(req), dateKey);
    res.json({ success: true, dateKey, context: context || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getContextHistory = async (req, res) => {
  try {
    if (!isFeatureEnabled('SLEEP_CONTEXT_ENGINE')) {
      return res.status(404).json({ success: false, code: 'FEATURE_DISABLED' });
    }
    const limit = Math.min(parseInt(req.query.limit || '14', 10) || 14, 60);
    const rows = await contextEngine.getContextHistory(uid(req), limit);
    res.json({ success: true, contexts: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBaseline = async (req, res) => {
  try {
    const user = await User.findById(uid(req));
    const nights = await findUserSleepRecords(user, 28);
    const contexts = await SleepContext.find({ userId: user._id }).sort({ dateKey: -1 }).limit(28).lean();
    const baselines = baselineService.computeBaselines(nights, contexts);
    res.json({ success: true, baselines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFactors = async (req, res) => {
  try {
    const dateKey = req.query.dateKey || dateKeyUTC();
    const context = await contextEngine.getContextToday(uid(req), dateKey);
    res.json({
      success: true,
      dateKey,
      factors: context?.factors || [],
      dataQuality: context?.dataQuality || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTonightRecommendation = async (req, res) => {
  try {
    const dateKey = req.query.dateKey || dateKeyUTC();
    const user = await User.findById(uid(req));
    const context = await contextEngine.getContextToday(uid(req), dateKey);
    let recommendation = context?.tonightMove || null;
    if (!recommendation) {
      const nights = await findUserSleepRecords(user, 14);
      const built = await contextEngine.buildContextForNight({
        user,
        night: nights[0] || {},
        nights,
        dateKey,
        locale: req.locale || 'en'
      });
      recommendation = built?.tonightMove || null;
    }
    if (recommendation) {
      recommendation = attachBandReminders(recommendation, {
        locale: req.locale || 'en',
        targetBedtime: user?.sleepProfile?.targetBedtime
      });
    }
    res.json({ success: true, recommendation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMorningBrief = async (req, res) => {
  try {
    if (!isFeatureEnabled('AI_MORNING_BRIEF')) {
      return res.status(404).json({ success: false, code: 'FEATURE_DISABLED' });
    }
    const user = await User.findById(uid(req));
    const nights = await findUserSleepRecords(user, 14);
    const latest = nights[0] || {};
    const dateKey = latest.timestamp
      ? new Date(latest.timestamp).toISOString().slice(0, 10)
      : dateKeyUTC();
    const built = await contextEngine.buildContextForNight({
      user,
      night: latest,
      nights,
      dateKey,
      locale: req.locale || 'en'
    });
    const brief = buildMorningBrief({
      locale: req.locale || 'en',
      lastNight: {
        totalMinutes: latest.totalMinutes,
        vsBaselineMinutes:
          latest.totalMinutes != null && built?.baselines?.primary?.avgSleepMinutes != null
            ? latest.totalMinutes - built.baselines.primary.avgSleepMinutes
            : null,
        bedtimeDeviationMinutes: built?.context?.derived?.bedtimeDeviationMinutes
      },
      baseline: built?.baselines?.primary || {},
      phone: built?.context?.phone || {},
      recommendation: built?.tonightMove || {},
      sleepScore: built?.context?.sleep?.sleepScore,
      factors: built?.factors || []
    });
    res.json({ success: true, dateKey, brief });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTimeline = async (req, res) => {
  try {
    if (!isFeatureEnabled('SLEEP_CONTEXT_TIMELINE')) {
      return res.status(404).json({ success: false, code: 'FEATURE_DISABLED' });
    }
    const user = await User.findById(uid(req));
    const dateKey = req.params.date || req.query.dateKey || dateKeyUTC();
    const nights = await findUserSleepRecords(user, 21);
    const night =
      nights.find((n) => n.timestamp && new Date(n.timestamp).toISOString().slice(0, 10) === dateKey) ||
      nights[0] ||
      {};
    let context = await contextEngine.getContextToday(user._id, dateKey);
    if (!context) {
      const built = await contextEngine.buildContextForNight({
        user,
        night,
        nights,
        dateKey,
        locale: req.locale || 'en'
      });
      context = built?.context?.toObject?.() || built?.context || null;
    }
    const timeline = buildSleepTimeline({
      night,
      phone: context?.phone || {},
      locale: req.locale || 'en'
    });
    const history = await contextEngine.getContextHistory(user._id, 28);
    const interruptionInsight = buildNightPhoneInterruptionInsight(history, req.locale || 'en');
    res.json({
      success: true,
      dateKey,
      timeline,
      interruptionInsight
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const postCoachChat = async (req, res) => {
  try {
    if (!isFeatureEnabled('AI_SLEEP_COACH')) {
      return res.status(404).json({ success: false, code: 'FEATURE_DISABLED' });
    }
    const message = String(req.body?.message || '').trim();
    if (!message) {
      return res.status(400).json({ success: false, message: 'message required' });
    }
    const locale = req.locale || 'en';
    const user = await User.findById(uid(req));
    const nights = await findUserSleepRecords(user, 21);
    const latest = nights[0] || {};
    const dateKey = latest.timestamp
      ? new Date(latest.timestamp).toISOString().slice(0, 10)
      : dateKeyUTC();
    const built = await contextEngine.buildContextForNight({
      user,
      night: latest,
      nights,
      dateKey,
      locale
    });
    let experiments = [];
    if (isFeatureEnabled('SLEEP_EXPERIMENTS') || isFeatureEnabled('PERSONAL_SLEEP_EXPERIMENTS')) {
      const assignments = await experimentService.listAssignments(user._id, { locale });
      experiments = assignments || [];
    }
    let insights = [];
    if (isFeatureEnabled('SLEEP_INSIGHTS_ENGINE')) {
      const scored = nights.map((n) => ({
        ...n,
        sleepScore: computeSleepScore({
          totalMinutes: n.totalMinutes,
          sleepGoalMinutes: user.wellnessProfile?.sleepGoalMinutes || 480,
          bedtimeClock: n.bedtimeClock,
          targetBedtime: user.sleepProfile?.targetBedtime,
          avgBedtimeMinutes: user.sleepProfile?.baseline?.avgBedtimeMinutes,
          awakeMinutes: n.awakeMinutes,
          wakingCount: n.wakingCount,
          nightHeartRate: n.nightHeartRate,
          baselineNightHr: user.sleepProfile?.baseline?.avgNightHr
        })
      }));
      const result = await insightsEngine.computeInsights(user._id, scored, locale);
      insights = result?.insights || [];
    }
    const brief = isFeatureEnabled('AI_MORNING_BRIEF')
      ? buildMorningBrief({
          locale,
          lastNight: latest,
          baseline: built?.baselines?.primary || {},
          phone: built?.context?.phone || {},
          recommendation: built?.tonightMove || {},
          factors: built?.factors || []
        })
      : null;
    const coachContext = buildCoachContext({
      baselines: built?.baselines || {},
      lastNight: latest,
      nights,
      context: built?.context,
      factors: built?.factors || [],
      experiments,
      insights,
      recommendation: built?.tonightMove || null,
      morningBrief: brief
    });
    const result = await coachChat({ message, coachContext, locale });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecommendedExperiments = async (req, res) => {
  try {
    const locale = req.locale || 'en';
    const catalog = experimentService.listCatalog(locale);
    const user = await User.findById(uid(req));
    const nights = await findUserSleepRecords(user, 14);
    const dateKey = nights[0]?.timestamp
      ? new Date(nights[0].timestamp).toISOString().slice(0, 10)
      : dateKeyUTC();
    const built = await contextEngine.buildContextForNight({
      user,
      night: nights[0] || {},
      nights,
      dateKey,
      locale
    });
    const negativeIds = new Set(
      (built?.factors || []).filter((f) => f.direction === 'negative').map((f) => f.id)
    );
    const preferred = [];
    const pushId = (id) => {
      const item = catalog.find((c) => c.id === id);
      if (item && !preferred.find((p) => p.id === id)) preferred.push(item);
    };
    if (negativeIds.has('late_screen') || negativeIds.has('phone_to_sleep') || negativeIds.has('screens_checkin')) {
      pushId('no_phone_30_before_bed');
      pushId('no_phone_60_before_bed');
    }
    if (negativeIds.has('bedtime_consistency')) pushId('consistent_bedtime');
    if (negativeIds.has('daily_activity')) pushId('morning_exercise');
    pushId('ten_min_wind_down');
    pushId('morning_sunlight');
    while (preferred.length < 4 && catalog.length) {
      const next = catalog.find((c) => !preferred.find((p) => p.id === c.id));
      if (!next) break;
      preferred.push(next);
    }
    const active = isFeatureEnabled('SLEEP_EXPERIMENTS')
      ? await experimentService.refreshActiveProgress(user._id, nights, locale)
      : null;

    const assignments = await experimentService.listAssignments(user._id, {
      includeCompleted: true,
      locale
    });
    const whatWorks = (assignments || [])
      .filter((a) => a.status === 'completed' && a.result)
      .slice(0, 5)
      .map((a) => ({
        id: a._id,
        experimentId: a.experimentId,
        title: a.title,
        result: {
          summary: a.result.summary,
          sleepDeltaMinutes: a.result.sleepDeltaMinutes ?? null,
          scoreDelta: a.result.scoreDelta ?? null,
          interruptionDeltaPct: a.result.interruptionDeltaPct ?? null,
          confidence: a.result.confidence || 'low',
          disclaimer: a.result.disclaimer
        },
        compliance: experimentService.complianceRate(a)
      }));

    res.json({
      success: true,
      recommended: preferred.slice(0, 5),
      active: active
        ? { ...active, compliance: experimentService.complianceRate(active) }
        : null,
      whatWorks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStreaks = async (req, res) => {
  try {
    const user = await User.findById(uid(req));
    const nights = await findUserSleepRecords(user, 40);
    const softStreaks = await computeSoftStreaks(user._id, {
      nights,
      locale: req.locale || 'en'
    });
    res.json({ success: true, softStreaks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const postTryTonight = async (req, res) => {
  try {
    const dateKey = req.body?.dateKey || dateKeyUTC();
    const doc = await tonightTryService.recordTryTonight(uid(req), {
      dateKey,
      title: req.body?.title,
      reason: req.body?.reason,
      factor: req.body?.factor,
      confidence: req.body?.confidence,
      algorithmVersion: req.body?.algorithmVersion,
      source: req.body?.source || 'tonight_move'
    });
    const streak = await tonightTryService.countTryStreak(uid(req), dateKey);
    res.json({
      success: true,
      recommendation: {
        dateKey: doc.dateKey,
        title: doc.title,
        tried: doc.tried,
        triedAt: doc.triedAt
      },
      tryStreak: streak
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const postActivateBandReminder = async (req, res) => {
  try {
    const result = await activateBandReminder(
      uid(req),
      {
        reminderId: req.body?.reminderId || req.body?.id,
        time: req.body?.time || req.body?.startTime,
        vibrationCount: req.body?.vibrationCount,
        label: req.body?.label,
        aiReason: req.body?.aiReason
      },
      req.locale || 'en'
    );
    res.json({
      success: true,
      reminder: result.reminder,
      reminders: result.reminders,
      syncHint:
        req.locale === 'es'
          ? 'Recordatorio guardado. En Android se sincroniza con la pulsera al conectar.'
          : 'Reminder saved. On Android it syncs to the band when connected.'
    });
  } catch (error) {
    const status = error.code === 'UNKNOWN_REMINDER' ? 400 : 500;
    res.status(status).json({ success: false, message: error.message, code: error.code });
  }
};

module.exports = {
  getOnboarding,
  updateOnboarding,
  getToday,
  getHistory,
  postMorningCheckIn,
  postEveningCheckIn,
  getCheckIns,
  getWeeklyReport,
  listExperiments,
  startExperiment,
  logExperimentDay,
  completeExperiment,
  getInsights,
  postPhoneContext,
  getContextToday: getContextTodayEndpoint,
  getContextHistory,
  getBaseline,
  getFactors,
  getTonightRecommendation,
  getMorningBrief,
  getTimeline,
  postCoachChat,
  getRecommendedExperiments,
  getStreaks,
  postTryTonight,
  postActivateBandReminder,
  listExperimentsStub: listExperiments
};
