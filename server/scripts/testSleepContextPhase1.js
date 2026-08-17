/**
 * Smoke tests for Sleep Context Engine / Tonight Move / Baseline (Phase 1).
 */
const assert = require('assert');
const baseline = require('../services/personalSleepBaselineService');
const { buildSleepFactors, attachActivityFactor } = require('../services/sleepFactorsService');
const { buildTonightMove } = require('../services/tonightRecommendationService');
const { computeScreenToSleepMinutes, dataConfidence } = require('../services/sleepContextEngine');

const nights = [
  { dateKey: '2026-08-14', totalMinutes: 420, bedtimeClock: '23:00', wakingCount: 2, nightHeartRate: 58, deep: 80, rem: 90 },
  { dateKey: '2026-08-13', totalMinutes: 390, bedtimeClock: '23:40', wakingCount: 3, nightHeartRate: 60, deep: 70, rem: 85 },
  { dateKey: '2026-08-12', totalMinutes: 450, bedtimeClock: '22:50', wakingCount: 1, nightHeartRate: 55, deep: 95, rem: 100 },
  { dateKey: '2026-08-11', totalMinutes: 410, bedtimeClock: '23:10', wakingCount: 2, nightHeartRate: 57, deep: 75, rem: 88 },
  { dateKey: '2026-08-10', totalMinutes: 430, bedtimeClock: '22:55', wakingCount: 1, nightHeartRate: 56, deep: 88, rem: 92 },
  { dateKey: '2026-08-09', totalMinutes: 400, bedtimeClock: '23:20', wakingCount: 2, nightHeartRate: 59, deep: 72, rem: 80 },
  { dateKey: '2026-08-08', totalMinutes: 440, bedtimeClock: '22:40', wakingCount: 1, nightHeartRate: 54, deep: 90, rem: 95 }
];

const contexts = nights.map((n) => ({
  dateKey: n.dateKey,
  phone: { screenMinutesLast120m: 70, screenToSleepMinutes: 35, nightUsageMinutes: 0 },
  activity: { steps: 7000 }
}));

const b = baseline.computeBaselines(nights, contexts);
assert.ok(b.windows.d7.nightsUsed === 7);
assert.ok(b.primary.avgSleepMinutes > 0);

let factors = buildSleepFactors({
  night: nights[0],
  phone: { screenMinutesLast120m: 95, screenToSleepMinutes: 55 },
  habits: { caffeineLate: false, alcohol: false, screensLate: false },
  baseline: b.primary,
  locale: 'en'
});
factors = attachActivityFactor(factors, 9200, b.primary.avgSteps, 'en');
assert.ok(factors.some((f) => f.id === 'late_screen'));
assert.ok(factors.some((f) => f.id === 'daily_activity'));

const move = buildTonightMove({
  locale: 'en',
  targetBedtime: '22:30',
  factors,
  baseline: b.primary,
  scoreResult: { score: 72, factors: [{ id: 'duration', impact: -10 }] },
  totalMinutes: 390,
  sleepGoalMinutes: 480
});
assert.ok(move.title);
assert.ok(move.action);
assert.strictEqual(move.algorithmVersion, 'tonight-move-v1');

const sts = computeScreenToSleepMinutes('2026-08-14T03:00:00.000Z', '2026-08-14T03:25:00.000Z');
assert.strictEqual(sts, 25);

assert.strictEqual(dataConfidence({ band: true, phoneUsage: true, checkIn: true, nightsUsed: 14 }), 'high');
assert.strictEqual(dataConfidence({ band: false, phoneUsage: false, checkIn: false, nightsUsed: 2 }), 'insufficient');

console.log('✅ testSleepContextPhase1.js passed', {
  avgSleep: b.primary.avgSleepMinutes,
  factors: factors.map((f) => f.id),
  tonight: move.title
});
