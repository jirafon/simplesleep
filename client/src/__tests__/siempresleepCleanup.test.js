/**
 * @jest-environment jsdom
 */
import { isFeatureEnabled, getFeatureFlags } from '../config/featureFlags';
import { HELP_BUTTON_LABELS, isHelpAction, buildHelpActivationPayload } from '../utils/helpButton';

describe('SiempreSleep feature flags', () => {
  test('clinical and medical surfaces are off by default', () => {
    const flags = getFeatureFlags();
    expect(flags.CLINICAL_ORDERS).toBe(false);
    expect(flags.DOCTOR_PORTAL).toBe(false);
    expect(flags.COMMERCE).toBe(false);
    expect(flags.MEDICAL_ALERTS).toBe(false);
    expect(flags.RISK_ANALYSIS).toBe(false);
    expect(flags.EXPERIMENTAL_ECG).toBe(false);
    expect(flags.EXPERIMENTAL_BP).toBe(false);
    expect(flags.SPORTS_TRACKING).toBe(false);
  });

  test('sleep-supporting flags stay on', () => {
    expect(isFeatureEnabled('HELP_BUTTON')).toBe(true);
    expect(isFeatureEnabled('OPTIONAL_LOCATION')).toBe(true);
    expect(isFeatureEnabled('SLEEP_MVP')).toBe(true);
    expect(isFeatureEnabled('SLEEP_EXPERIMENTS')).toBe(true);
    expect(isFeatureEnabled('SLEEP_INSIGHTS_ENGINE')).toBe(true);
  });
});

describe('Help button contract', () => {
  test('uses non-medical labels', () => {
    expect(HELP_BUTTON_LABELS.button).toBe('Help Button');
    expect(HELP_BUTTON_LABELS.family).toBe('Family Assistance');
    expect(HELP_BUTTON_LABELS.section).toBe('Connect');
  });

  test('accepts help and legacy panic actions as help', () => {
    expect(isHelpAction('help_button')).toBe(true);
    expect(isHelpAction('request_help')).toBe(true);
    expect(isHelpAction('panic')).toBe(true);
    expect(isHelpAction('sos')).toBe(true);
  });

  test('activation payload never promises emergency services', () => {
    const payload = buildHelpActivationPayload({ mode: 'test', confirmed: true });
    expect(payload.framing.medicalEmergency).toBe(false);
    expect(payload.framing.emergencyServices).toBe(false);
    expect(payload.type).toBe('help_request_test');
  });
});

describe('Retired product routes (inventory contract)', () => {
  const RETIRED_PATHS = [
    '/bitacora',
    '/orden-hombre',
    '/orden-mujer',
    '/salud-hombre',
    '/salud-mujer',
    '/telemedicina',
    '/doctor/records',
    '/cart',
    '/smartrisk',
    '/seguimiento-eventos'
  ];

  const PRIMARY_PATHS = [
    '/dashboard',
    '/sleep',
    '/improve',
    '/insights',
    '/connect',
    '/device',
    '/account'
  ];

  test('retired paths are listed for FeatureGate / redirect coverage', () => {
    expect(RETIRED_PATHS.length).toBeGreaterThan(5);
    expect(RETIRED_PATHS).toContain('/bitacora');
    expect(RETIRED_PATHS).toContain('/telemedicina');
  });

  test('primary Sleep navigation paths are defined', () => {
    expect(PRIMARY_PATHS).toEqual([
      '/dashboard',
      '/sleep',
      '/improve',
      '/insights',
      '/connect',
      '/device',
      '/account'
    ]);
  });
});
