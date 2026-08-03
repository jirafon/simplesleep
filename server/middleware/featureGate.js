const { isFeatureEnabled } = require('../config/featureFlags');

/**
 * Express middleware: returns 404 (product-hidden) when a feature flag is off.
 * Keeps APIs dormant without deleting historical data or breaking wearable ingest.
 */
function requireFeature(flagName, options = {}) {
  const status = options.status || 404;
  const message = options.message || 'Esta función no está disponible en SiempreSleep.';

  return (req, res, next) => {
    if (!isFeatureEnabled(flagName)) {
      return res.status(status).json({
        success: false,
        code: 'FEATURE_DISABLED',
        feature: flagName,
        message
      });
    }
    return next();
  };
}

module.exports = { requireFeature };
