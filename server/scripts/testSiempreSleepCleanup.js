/**
 * Server-side checks for SiempreSleep cleanup (no Jest required).
 * Run: node scripts/testSiempreSleepCleanup.js
 */
const assert = require('assert');
const { FEATURE_FLAGS, isFeatureEnabled } = require('../config/featureFlags');
const { requireFeature } = require('../middleware/featureGate');

function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  return res;
}

assert.strictEqual(FEATURE_FLAGS.MEDICAL_ALERTS, false);
assert.strictEqual(FEATURE_FLAGS.CLINICAL_ORDERS, false);
assert.strictEqual(FEATURE_FLAGS.HELP_BUTTON, true);
assert.strictEqual(isFeatureEnabled('EXPERIMENTAL_ECG'), false);

const gate = requireFeature('MEDICAL_ALERTS');
const res = mockRes();
let nextCalled = false;
gate({}, res, () => { nextCalled = true; });
assert.strictEqual(res.statusCode, 404);
assert.strictEqual(res.body.code, 'FEATURE_DISABLED');
assert.strictEqual(nextCalled, false);

const helpGate = requireFeature('HELP_BUTTON');
const res2 = mockRes();
let next2 = false;
helpGate({}, res2, () => { next2 = true; });
assert.strictEqual(next2, true);

console.log('✅ testSiempreSleepCleanup.js passed');
