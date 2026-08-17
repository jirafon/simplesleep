/**
 * tonight try + soft streak smoke
 */
const assert = require('assert');
const { countTryStreak } = require('../services/tonightTryService');
const { streakFrom } = require('../services/softStreakService');

assert.strictEqual(typeof countTryStreak, 'function');
assert.strictEqual(streakFrom('2026-08-15', 3, () => true), 3);

console.log('✅ testTonightTry.js passed');
