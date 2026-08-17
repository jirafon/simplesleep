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
  LEGACY_PANIC_ALIAS: envFlag('LEGACY_PANIC_ALIAS', true),

  /** AI Sleep Context Coach — Phase 1+ */
  SLEEP_CONTEXT_ENGINE: envFlag('SLEEP_CONTEXT_ENGINE', true),
  PHONE_USAGE_CONTEXT: envFlag('PHONE_USAGE_CONTEXT', true),
  PHONE_ENVIRONMENT_CONTEXT: envFlag('PHONE_ENVIRONMENT_CONTEXT', true),
  HEALTH_CONNECT: envFlag('HEALTH_CONNECT', true),
  AI_MORNING_BRIEF: envFlag('AI_MORNING_BRIEF', true),
  AI_SLEEP_COACH: envFlag('AI_SLEEP_COACH', true),
  SLEEP_CONTEXT_TIMELINE: envFlag('SLEEP_CONTEXT_TIMELINE', true),
  PERSONAL_SLEEP_EXPERIMENTS: envFlag('PERSONAL_SLEEP_EXPERIMENTS', true)
};

const isFeatureEnabled = (flagName) => Boolean(FEATURE_FLAGS[flagName]);

const getFeatureFlags = () => ({ ...FEATURE_FLAGS });

module.exports = {
  FEATURE_FLAGS,
  isFeatureEnabled,
  getFeatureFlags
};
