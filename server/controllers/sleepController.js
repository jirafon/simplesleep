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
const { isFeatureEnabled } = require('../config/featureFlags');
const { t: i18nT, localizeCatalogItem } = require('../i18n/sleepMessages');

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
    const recommendation = buildTonightRecommendation({
      targetBedtime: scoreInput.targetBedtime,
      windDownMinutes: user.sleepProfile?.windDownMinutes || 45,
      scoreResult,
      totalMinutes: latest.totalMinutes,
      sleepGoalMinutes: scoreInput.sleepGoalMinutes,
      locale: req.locale || 'en'
    });

    const nextReminder = (user.wellnessProfile?.importantReminders || [])
      .filter((r) => r.enabled !== false)
      .sort((a, b) => String(a.startTime || a.time).localeCompare(String(b.startTime || b.time)))[0] || null;

    const vsBaseline =
      latest.totalMinutes != null && baseline.avgSleepMinutes != null
        ? latest.totalMinutes - baseline.avgSleepMinutes
        : null;

    res.json({
      success: true,
      dateKey: todayKey,
      sleepScore: scoreResult,
      lastNight: {
        ...latest,
        vsBaselineMinutes: vsBaseline
      },
      baseline,
      recommendation,
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
      narrative
    };

    const report = await WeeklyReport.findOneAndUpdate(
      { userId: user._id, weekStart },
      { userId: user._id, weekStart, weekEnd, summary, algorithmVersion: 'weekly-report-v1' },
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

    res.json({ success: true, report, nights: chartNights });
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
  listExperimentsStub: listExperiments
};
