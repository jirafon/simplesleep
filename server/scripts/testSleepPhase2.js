/**
 * Unit tests — experiment catalog + insights language rules
 * Run: node server/scripts/testSleepPhase2.js
 */
const assert = require('assert');
const { EXPERIMENT_CATALOG, getCatalogItem } = require('../services/sleepExperimentCatalog');
const { snapshotFromNights, complianceRate } = require('../services/sleepExperimentService');
const { MIN_GROUP, ALGORITHM_VERSION } = require('../services/sleepInsightsEngine');

assert.ok(EXPERIMENT_CATALOG.length >= 10);
assert.strictEqual(getCatalogItem('no_caffeine_after_2pm').durationDays, 7);
assert.strictEqual(getCatalogItem('missing'), null);

const snap = snapshotFromNights([
  { totalMinutes: 400, wakingCount: 2, bedtimeClock: '22:30', sleepScore: { score: 70 } },
  { totalMinutes: 440, wakingCount: 1, bedtimeClock: '22:40', sleepScore: { score: 80 } }
]);
assert.strictEqual(snap.nights, 2);
assert.ok(snap.avgSleepMinutes >= 400);

const rate = complianceRate({
  durationDays: 7,
  dayLogs: [{ completed: true }, { completed: true }, { completed: false }]
});
assert.strictEqual(rate.completedDays, 2);
assert.strictEqual(rate.rate, Math.round((2 / 7) * 100));

assert.ok(MIN_GROUP >= 3);
assert.strictEqual(ALGORITHM_VERSION, 'insights-v1');

const banned = ['caused', 'diagnosed', 'detected disease', 'prevented', 'treated'];
for (const item of EXPERIMENT_CATALOG) {
  const blob = `${item.title} ${item.goal} ${item.dailyAction}`.toLowerCase();
  for (const w of banned) {
    assert.ok(!blob.includes(w), `catalog must avoid "${w}"`);
  }
}

console.log('✅ testSleepPhase2.js passed', {
  catalog: EXPERIMENT_CATALOG.length,
  avgSleep: snap.avgSleepMinutes
});
