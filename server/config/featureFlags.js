/**
 * Feature flags — SiempreSleep backend
 *
 * Env overrides: FF_<NAME>=true|false
 * Example: FF_MEDICAL_ALERTS=false FF_EXPERIMENTAL_ECG=false
 */

const envFlag = (name, defaultValue) => {
  const raw = process.env[`FF_${name}`] ?? process.env[`FEATURE_${name}`];
  if (raw === undefined || raw === '') return defaultValue;
  return String(raw).toLowerCase() === 'true';
};

const FEATURE_FLAGS = {
  SLEEP_MVP: envFlag('SLEEP_MVP', true),
  SLEEP_EXPERIMENTS: envFlag('SLEEP_EXPERIMENTS', true),
  SLEEP_INSIGHTS_ENGINE: envFlag('SLEEP_INSIGHTS_ENGINE', true),
  CLINICAL_ORDERS: envFlag('CLINICAL_ORDERS', false),
  DOCTOR_PORTAL: envFlag('DOCTOR_PORTAL', false),
  COMMERCE: envFlag('COMMERCE', false),
  CYCLE_MENOPAUSE: envFlag('CYCLE_MENOPAUSE', false),
  EXPERIMENTAL_ECG: envFlag('EXPERIMENTAL_ECG', false),
  EXPERIMENTAL_BP: envFlag('EXPERIMENTAL_BP', false),
  MEDICAL_ALERTS: envFlag('MEDICAL_ALERTS', false),
  RISK_ANALYSIS: envFlag('RISK_ANALYSIS', false),
  SPORTS_TRACKING: envFlag('SPORTS_TRACKING', false),
  OPTIONAL_LOCATION: envFlag('OPTIONAL_LOCATION', true),
  HELP_BUTTON: envFlag('HELP_BUTTON', true),
  /** Keep legacy /panic path for APK compatibility while preferring /help */
  LEGACY_PANIC_ALIAS: envFlag('LEGACY_PANIC_ALIAS', true)
};

const isFeatureEnabled = (flagName) => Boolean(FEATURE_FLAGS[flagName]);

const getFeatureFlags = () => ({ ...FEATURE_FLAGS });

module.exports = {
  FEATURE_FLAGS,
  isFeatureEnabled,
  getFeatureFlags
};
