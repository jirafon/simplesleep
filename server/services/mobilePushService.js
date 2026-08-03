const fs = require('fs');

let firebaseAdmin = null;
let firebaseReady = false;
let firebaseInitError = null;

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

const isPushEnabledByEnv = () => {
  const raw = String(process.env.MOBILE_PUSH_ENABLED || '').trim().toLowerCase();
  return TRUE_VALUES.has(raw);
};

const hasFirebaseCredentialConfig = () => {
  return Boolean(
    String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim() ||
    String(process.env.FIREBASE_SERVICE_ACCOUNT_FILE || '').trim()
  );
};

const parseServiceAccount = () => {
  const jsonFromEnv = String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim();
  if (jsonFromEnv) {
    return JSON.parse(jsonFromEnv);
  }

  const pathFromEnv = String(process.env.FIREBASE_SERVICE_ACCOUNT_FILE || '').trim();
  if (pathFromEnv) {
    const raw = fs.readFileSync(pathFromEnv, 'utf8');
    return JSON.parse(raw);
  }

  throw new Error('MISSING_FIREBASE_SERVICE_ACCOUNT');
};

const ensureFirebaseReady = () => {
  if (firebaseReady) return true;
  if (firebaseInitError) return false;
  if (!isPushEnabledByEnv()) return false;

  try {
    // Lazy import to avoid crashing boot when package is missing/misconfigured.
    firebaseAdmin = require('firebase-admin');

    if (!firebaseAdmin.apps.length) {
      const serviceAccount = parseServiceAccount();
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount)
      });
    }

    firebaseReady = true;
    return true;
  } catch (error) {
    firebaseInitError = error;
    console.error('mobilePushService init error:', error.message || error);
    return false;
  }
};

const normalizeTokens = (tokens = []) => {
  return Array.from(new Set(
    (Array.isArray(tokens) ? tokens : [])
      .map((token) => String(token || '').trim())
      .filter((token) => token.length >= 20)
  ));
};

const sendLiveLocationRequestPush = async ({
  tokens,
  requestId,
  requestedAt,
  expiresAt,
  email,
  deviceId
}) => {
  const normalizedTokens = normalizeTokens(tokens);
  if (!normalizedTokens.length) {
    return {
      enabled: isPushEnabledByEnv(),
      attempted: 0,
      successCount: 0,
      failureCount: 0,
      invalidTokens: [],
      skipped: true,
      reason: 'NO_TOKENS'
    };
  }

  const ready = ensureFirebaseReady();
  if (!ready) {
    return {
      enabled: false,
      attempted: normalizedTokens.length,
      successCount: 0,
      failureCount: 0,
      invalidTokens: [],
      skipped: true,
      reason: firebaseInitError ? (firebaseInitError.message || 'FIREBASE_INIT_ERROR') : 'PUSH_DISABLED'
    };
  }

  try {
    const payload = {
      tokens: normalizedTokens,
      data: {
        type: 'live_location_request',
        command: 'capture_current_location',
        reason: 'admin_live_location_request',
        requestId: String(requestId || ''),
        requestedAt: String(requestedAt || ''),
        expiresAt: String(expiresAt || ''),
        email: String(email || ''),
        deviceId: String(deviceId || '')
      },
      android: {
        priority: 'high',
        ttl: 60 * 1000
      }
    };

    const result = await firebaseAdmin.messaging().sendEachForMulticast(payload);
    const invalidTokens = [];

    result.responses.forEach((response, index) => {
      if (response.success) return;

      const code = response.error?.code || '';
      if (
        code.includes('registration-token-not-registered') ||
        code.includes('invalid-registration-token')
      ) {
        invalidTokens.push(normalizedTokens[index]);
      }
    });

    return {
      enabled: true,
      attempted: normalizedTokens.length,
      successCount: result.successCount,
      failureCount: result.failureCount,
      invalidTokens,
      skipped: false,
      reason: null
    };
  } catch (error) {
    return {
      enabled: true,
      attempted: normalizedTokens.length,
      successCount: 0,
      failureCount: normalizedTokens.length,
      invalidTokens: [],
      skipped: false,
      reason: error.message || 'FCM_SEND_ERROR'
    };
  }
};

const getMobilePushStatus = () => {
  return {
    enabledByEnv: isPushEnabledByEnv(),
    hasCredentialConfig: hasFirebaseCredentialConfig(),
    ready: firebaseReady,
    initError: firebaseInitError ? (firebaseInitError.message || String(firebaseInitError)) : null
  };
};

module.exports = {
  sendLiveLocationRequestPush,
  getMobilePushStatus
};
