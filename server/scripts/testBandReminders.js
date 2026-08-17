/**
 * Band sleep reminder suggestions + activate (no DB required for attach).
 */
const assert = require('assert');
const {
  attachBandReminders,
  PHONE_DOWN_ID,
  BEDTIME_ID
} = require('../services/sleepBandReminderService');
const { buildTonightMove } = require('../services/tonightRecommendationService');

const phoneMove = attachBandReminders(
  {
    title: 'Put your phone down by 21:45',
    windDownAt: '21:45',
    factor: 'phone_to_sleep'
  },
  { locale: 'en', targetBedtime: '22:30' }
);

assert.ok(Array.isArray(phoneMove.bandReminders), 'bandReminders array');
assert.strictEqual(phoneMove.bandReminders.length, 2, 'two suggestions');
const phone = phoneMove.bandReminders.find((r) => r.id === PHONE_DOWN_ID);
const bed = phoneMove.bandReminders.find((r) => r.id === BEDTIME_ID);
assert.ok(phone, 'phone down reminder');
assert.ok(bed, 'bedtime reminder');
assert.strictEqual(phone.vibrationCount, 3);
assert.strictEqual(bed.vibrationCount, 7);
assert.strictEqual(phone.time, '21:45');
assert.strictEqual(bed.time, '22:30');
assert.strictEqual(phone.primary, true);
assert.strictEqual(bed.primary, false);
assert.ok(phone.cta.toLowerCase().includes('3'), 'cta mentions 3');

const moveEs = buildTonightMove({
  locale: 'es',
  targetBedtime: '23:00',
  factors: [{ id: 'phone_to_sleep', direction: 'negative', confidence: 0.8 }]
});
assert.ok(moveEs.bandReminders?.length === 2, 'buildTonightMove attaches');
assert.ok(moveEs.bandReminders[0].cta.includes('vibraciones'), 'es cta');

console.log('✅ testBandReminders.js passed', {
  phone: phone.cta,
  bed: bed.cta,
  tonight: moveEs.title
});
