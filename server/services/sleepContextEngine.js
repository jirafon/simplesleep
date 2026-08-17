/**
 * Sleep Context Engine — normalize band + phone + habits into SleepContext.
 * Does NOT replace sleep-score-v1; adds "what may have shaped" layer.
 */

const SleepContext = require('../models/SleepContext');
const DailyCheckIn = require('../models/DailyCheckIn');
const baselineService = require('./personalSleepBaselineService');
const { buildSleepFactors, attachActivityFactor } = require('./sleepFactorsService');
const { buildTonightMove } = require('./tonightRecommendationService');
const { computeSleepScore } = require('./sleepScoreService');
const { isFeatureEnabled } = require('../config/featureFlags');

const ALGORITHM_VERSION = 'sleep-context-v1';

function dateKeyFromDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function computeScreenToSleepMinutes(lastInteractionAt, sleepDetectedAt) {
  if (!lastInteractionAt || !sleepDetectedAt) return null;
  const a = new Date(lastInteractionAt).getTime();
  const b = new Date(sleepDetectedAt).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null;
  return Math.round((b - a) / 60000);
}

function dataConfidence({ band, phoneUsage, checkIn, nightsUsed }) {
  let score = 0;
  if (band) score += 2;
  if (phoneUsage) score += 2;
  if (checkIn) score += 1;
  if (nightsUsed >= 14) score += 2;
  else if (nightsUsed >= 7) score += 1;
  if (score >= 6) return 'high';
  if (score >= 4) return 'medium';
  if (score >= 2) return 'low';
  return 'insufficient';
}

/**
 * Upsert phone usage payload for a night dateKey.
 */
async function ingestPhoneContext(userId, payload = {}) {
  const dateKey = payload.dateKey || dateKeyFromDate();
  const phone = {
    lastInteractionAt: payload.lastInteractionAt ? new Date(payload.lastInteractionAt) : null,
    screenMinutesLast30m: numOrNull(payload.screenMinutesLast30m),
    screenMinutesLast60m: numOrNull(payload.screenMinutesLast60m),
    screenMinutesLast120m: numOrNull(payload.screenMinutesLast120m),
    screenToSleepMinutes: numOrNull(payload.screenToSleepMinutes),
    nightUsageEvents: numOrNull(payload.nightUsageEvents),
    nightUsageMinutes: numOrNull(payload.nightUsageMinutes),
    categoryMinutes: payload.categoryMinutes || undefined,
    capturedAt: new Date(),
    source: payload.source || 'android_usage_stats'
  };

  const activity = {
    steps: numOrNull(payload.steps),
    activeMinutes: numOrNull(payload.activeMinutes)
  };

  const envPayload = payload.environment || payload.ambient || null;
  const environment = envPayload
    ? {
        ambientLightBeforeBed: numOrNull(envPayload.ambientLightBeforeBed ?? envPayload.ambientLightLux),
        ambientLightLux: numOrNull(envPayload.ambientLightLux ?? envPayload.ambientLightBeforeBed),
        phoneStationaryAt: envPayload.phoneStationaryAt
          ? new Date(envPayload.phoneStationaryAt)
          : envPayload.phoneStationary
            ? new Date()
            : null,
        phoneStationary:
          typeof envPayload.phoneStationary === 'boolean' ? envPayload.phoneStationary : null,
        devicePickedUp:
          typeof envPayload.devicePickedUp === 'boolean' ? envPayload.devicePickedUp : null,
        capturedAt: new Date(),
        source: envPayload.source || 'android_ambient'
      }
    : undefined;

  const setDoc = {
    phone,
    ...(activity.steps != null || activity.activeMinutes != null ? { activity } : {}),
    ...(environment ? { environment } : {}),
    'dataQuality.phoneUsage': true,
    algorithmVersion: ALGORITHM_VERSION
  };
  if (payload.healthConnect === true) {
    setDoc['dataQuality.healthConnect'] = true;
  }

  const doc = await SleepContext.findOneAndUpdate(
    { userId, dateKey },
    {
      $set: setDoc,
      $setOnInsert: { userId, dateKey }
    },
    { upsert: true, new: true }
  );

  return doc;
}

function numOrNull(v) {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/**
 * Rebuild / enrich SleepContext for one night using band + check-in + phone.
 */
async function buildContextForNight({
  user,
  night,
  nights = [],
  dateKey,
  locale = 'en',
  scoreResult = null
}) {
  if (!isFeatureEnabled('SLEEP_CONTEXT_ENGINE')) {
    return null;
  }

  const key =
    dateKey ||
    night?.dateKey ||
    (night?.timestamp ? new Date(night.timestamp).toISOString().slice(0, 10) : dateKeyFromDate());

  let ctx = await SleepContext.findOne({ userId: user._id, dateKey: key });
  const checkIn = await DailyCheckIn.findOne({ userId: user._id, dateKey: key }).lean();

  const recentContexts = await SleepContext.find({ userId: user._id })
    .sort({ dateKey: -1 })
    .limit(28)
    .lean();

  const baselines = baselineService.computeBaselines(nights, recentContexts);
  const primary = baselines.primary || {};

  // Derive screen-to-sleep if phone last interaction + night bedtime available
  let phone = ctx?.phone ? { ...ctx.phone.toObject?.() || ctx.phone } : {};
  if (
    phone.screenToSleepMinutes == null &&
    phone.lastInteractionAt &&
    night?.timestamp
  ) {
    // Approximate sleep detected at night timestamp
    phone.screenToSleepMinutes = computeScreenToSleepMinutes(
      phone.lastInteractionAt,
      night.timestamp
    );
  }

  const habits = {
    caffeineLate: Boolean(checkIn?.evening?.caffeine?.had && isLateCaffeine(checkIn.evening.caffeine.time)),
    alcohol: Boolean(checkIn?.evening?.alcohol?.had),
    exerciseLate: Boolean(checkIn?.evening?.exercise?.had),
    stressLevel: typeof checkIn?.evening?.stress === 'number' ? checkIn.evening.stress : null,
    screensLate: Boolean(checkIn?.evening?.screens?.late)
  };

  const sleepBlock = {
    bedtime: night?.bedtimeClock || null,
    wakeTime: null,
    totalMinutes: night?.totalMinutes ?? null,
    deepMinutes: night?.deep ?? null,
    remMinutes: night?.rem ?? null,
    lightMinutes: night?.light ?? null,
    awakeMinutes: night?.awakeMinutes ?? null,
    wakingCount: night?.wakingCount ?? null,
    nightHeartRate: night?.nightHeartRate ?? null,
    hrv: null,
    spo2: null,
    sleepScore: scoreResult?.score ?? null
  };

  const bedtimeDev = baselineService.bedtimeDeviationMinutes(
    night?.bedtimeClock,
    primary.avgBedtimeMinutes
  );
  const consistency = baselineService.consistencyScore(nights.slice(0, 14), primary.avgBedtimeMinutes);

  let factors = buildSleepFactors({
    night,
    phone,
    habits,
    baseline: primary,
    locale
  });
  const steps = ctx?.activity?.steps ?? null;
  factors = attachActivityFactor(factors, steps, primary.avgSteps, locale);

  if (typeof consistency === 'number') {
    factors.unshift({
      id: 'bedtime_consistency',
      label: locale === 'es' ? 'Consistencia de hora de dormir' : 'Bedtime consistency',
      value: consistency >= 75 ? (locale === 'es' ? 'Buena' : 'Good') : consistency >= 50 ? (locale === 'es' ? 'Regular' : 'Fair') : (locale === 'es' ? 'Variable' : 'Variable'),
      direction: consistency >= 75 ? 'positive' : consistency < 50 ? 'negative' : 'neutral',
      confidence: 0.7,
      detail:
        locale === 'es'
          ? 'Según tu línea base personal de hora de dormir.'
          : 'Based on your personal bedtime baseline.'
    });
  }

  const tonightMove = buildTonightMove({
    locale,
    targetBedtime: user.sleepProfile?.targetBedtime || user.sleepProfile?.usualBedtime,
    windDownMinutes: user.sleepProfile?.windDownMinutes || 45,
    scoreResult:
      scoreResult ||
      computeSleepScore({
        totalMinutes: night?.totalMinutes,
        sleepGoalMinutes: user.wellnessProfile?.sleepGoalMinutes || 480,
        bedtimeClock: night?.bedtimeClock,
        targetBedtime: user.sleepProfile?.targetBedtime,
        avgBedtimeMinutes: primary.avgBedtimeMinutes,
        awakeMinutes: night?.awakeMinutes,
        wakingCount: night?.wakingCount,
        nightHeartRate: night?.nightHeartRate,
        baselineNightHr: primary.avgNightHr,
        morningFeeling: checkIn?.morning?.feeling || null
      }),
    totalMinutes: night?.totalMinutes,
    sleepGoalMinutes: user.wellnessProfile?.sleepGoalMinutes || 480,
    factors,
    baseline: primary,
    phone
  });

  const band = typeof night?.totalMinutes === 'number';
  const phoneUsage = Boolean(phone?.capturedAt || phone?.screenMinutesLast120m != null);
  const hasCheckIn = Boolean(checkIn?.morning?.completedAt || checkIn?.evening?.completedAt);

  const payload = {
    sleep: sleepBlock,
    phone,
    habits,
    derived: {
      bedtimeDeviationMinutes: bedtimeDev,
      wakeTimeDeviationMinutes: null,
      sleepConsistencyScore: consistency,
      avgScreenToSleepMinutes: primary.avgScreenToSleepMinutes
    },
    factors,
    tonightMove,
    dataQuality: {
      band,
      phoneUsage,
      healthConnect: false,
      checkIn: hasCheckIn,
      confidence: dataConfidence({
        band,
        phoneUsage,
        checkIn: hasCheckIn,
        nightsUsed: primary.nightsUsed || 0
      })
    },
    algorithmVersion: ALGORITHM_VERSION
  };

  if (ctx?.activity) {
    payload.activity = ctx.activity.toObject?.() || ctx.activity;
  }

  ctx = await SleepContext.findOneAndUpdate(
    { userId: user._id, dateKey: key },
    { $set: payload, $setOnInsert: { userId: user._id, dateKey: key } },
    { upsert: true, new: true }
  );

  // Persist compact baseline on user for legacy clients
  if (primary.avgSleepMinutes != null) {
    await require('../models/User').updateOne(
      { _id: user._id },
      {
        $set: {
          'sleepProfile.baseline': {
            avgBedtimeMinutes: primary.avgBedtimeMinutes,
            avgSleepMinutes: primary.avgSleepMinutes,
            avgNightHr: primary.avgNightHr,
            updatedAt: new Date()
          }
        }
      }
    );
  }

  return {
    context: ctx,
    baselines,
    factors,
    tonightMove
  };
}

function isLateCaffeine(time) {
  if (!time || typeof time !== 'string') return true;
  const [h] = time.split(':').map(Number);
  return Number.isFinite(h) && h >= 15;
}

async function getContextToday(userId, dateKey) {
  return SleepContext.findOne({ userId, dateKey }).lean();
}

async function getContextHistory(userId, limit = 14) {
  return SleepContext.find({ userId }).sort({ dateKey: -1 }).limit(limit).lean();
}

module.exports = {
  ALGORITHM_VERSION,
  ingestPhoneContext,
  buildContextForNight,
  getContextToday,
  getContextHistory,
  computeScreenToSleepMinutes,
  dataConfidence
};
