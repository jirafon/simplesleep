/**
 * Soft streaks + ambient ingest smoke (no DB).
 */
const assert = require('assert');
const { streakFrom } = require('../services/softStreakService');
const { buildMorningBrief } = require('../services/morningBriefService');

const map = {
  '2026-08-15': true,
  '2026-08-14': true,
  '2026-08-13': true,
  '2026-08-12': false
};
const s = streakFrom('2026-08-15', 10, (k) => Boolean(map[k]));
assert.strictEqual(s, 3, 'streak length');

const brief = buildMorningBrief({
  locale: 'es',
  lastNight: { totalMinutes: 400, vsBaselineMinutes: -20 },
  baseline: { avgSleepMinutes: 420 },
  recommendation: { title: 'Guarda el teléfono a las 22:30' }
});
assert.ok(brief.paragraphs[0].includes('Buenos días'), 'es brief');

console.log('✅ testSoftStreaks.js passed', { streak: s, briefParas: brief.paragraphs.length });
