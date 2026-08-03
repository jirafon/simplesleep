/**
 * Unit tests for Sleep Score v1
 * Run: node server/scripts/testSleepScore.js
 */
const assert = require('assert');
const {
  computeSleepScore,
  buildTonightRecommendation,
  ALGORITHM_VERSION
} = require('../services/sleepScoreService');

const solid = computeSleepScore({
  totalMinutes: 480,
  sleepGoalMinutes: 480,
  bedtimeClock: '22:30',
  targetBedtime: '22:30',
  avgBedtimeMinutes: 22 * 60 + 30,
  awakeMinutes: 10,
  wakingCount: 1,
  nightHeartRate: 58,
  baselineNightHr: 56,
  morningFeeling: 'rested'
});

assert.strictEqual(solid.algorithmVersion, ALGORITHM_VERSION);
assert.ok(solid.score >= 80, `expected high score, got ${solid.score}`);
assert.ok(solid.factors.some((f) => f.id === 'subjective' && f.impact > 0));

const interrupted = computeSleepScore({
  totalMinutes: 300,
  sleepGoalMinutes: 480,
  bedtimeClock: '01:00',
  targetBedtime: '22:30',
  avgBedtimeMinutes: 22 * 60 + 30,
  awakeMinutes: 90,
  wakingCount: 5,
  morningFeeling: 'exhausted'
});

assert.ok(interrupted.score < solid.score);
assert.ok(interrupted.score >= 0 && interrupted.score <= 100);

const rec = buildTonightRecommendation({
  targetBedtime: '22:30',
  windDownMinutes: 45,
  scoreResult: interrupted,
  totalMinutes: 300,
  sleepGoalMinutes: 480
});
assert.ok(rec.action.includes('wind-down'));
assert.ok(rec.explanation.length > 10);

console.log('✅ testSleepScore.js passed', { solid: solid.score, interrupted: interrupted.score });
