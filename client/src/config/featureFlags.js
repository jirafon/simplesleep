/**
 * Feature flags — SiempreSleep product base
 *
 * Clinical / medical / commerce features are OFF by default.
 * Experimental wearable signals (ECG, BP) stay ingestible but hidden from primary UX.
 *
 * Override at build time with REACT_APP_FF_<NAME>=true|false
 */

const envFlag = (name, defaultValue) => {
  const raw = process.env[`REACT_APP_FF_${name}`];
  if (raw === undefined || raw === '') return defaultValue;
  return String(raw).toLowerCase() === 'true';
};

const FEATURE_FLAGS = {
  /** Sleep MVP product surfaces */
  SLEEP_MVP: envFlag('SLEEP_MVP', true),
  SLEEP_EXPERIMENTS: envFlag('SLEEP_EXPERIMENTS', true),
  SLEEP_INSIGHTS_ENGINE: envFlag('SLEEP_INSIGHTS_ENGINE', true),
  /** Órdenes médicas, telemedicina, bitácora clínica, catálogo de exámenes */
  CLINICAL_ORDERS: envFlag('CLINICAL_ORDERS', false),
  /** Portal doctor / copiloto clínico */
  DOCTOR_PORTAL: envFlag('DOCTOR_PORTAL', false),
  /** Carrito, checkout, pagos Flow */
  COMMERCE: envFlag('COMMERCE', false),
  /** Ciclo / fertilidad / menopausia (fuera del foco sueño) */
  CYCLE_MENOPAUSE: envFlag('CYCLE_MENOPAUSE', false),
  /** ECG en UI (datos siguen guardándose si el hardware los envía) */
  EXPERIMENTAL_ECG: envFlag('EXPERIMENTAL_ECG', false),
  /** Presión arterial en UI principal */
  EXPERIMENTAL_BP: envFlag('EXPERIMENTAL_BP', false),
  /** Alertas biométricas con lenguaje médico / diagnóstico */
  MEDICAL_ALERTS: envFlag('MEDICAL_ALERTS', false),
  /** Análisis de riesgo clínico por IA */
  RISK_ANALYSIS: envFlag('RISK_ANALYSIS', false),
  /** Sesiones de ejercicio / GPS deportivo en dashboard de sueño */
  SPORTS_TRACKING: envFlag('SPORTS_TRACKING', false),
  /** Solicitud opcional de ubicación a contactos autorizados */
  OPTIONAL_LOCATION: envFlag('OPTIONAL_LOCATION', true),
  /** Botón de ayuda familiar (antes pánico/SOS) */
  HELP_BUTTON: envFlag('HELP_BUTTON', true),
  /** Rutas legacy Smartrisk / spinoffs */
  LEGACY_SPINOFFS: envFlag('LEGACY_SPINOFFS', false)
};

export const isFeatureEnabled = (flagName) => Boolean(FEATURE_FLAGS[flagName]);

export const getFeatureFlags = () => ({ ...FEATURE_FLAGS });

export default FEATURE_FLAGS;
