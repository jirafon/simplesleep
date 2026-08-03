/**
 * Help Button / Family Assistance — interaction contract
 *
 * Replaces panic/SOS/emergency framing. Does NOT contact 911 or medical services.
 *
 * Prepared flows (UI + mobile bridge should adopt these):
 * - long press activation
 * - countdown with cancel
 * - vibration confirmation
 * - activation audit log
 * - receipt confirmation to authorized contacts
 * - test mode (no real notifications)
 */

export const HELP_BUTTON_LABELS = {
  button: 'Help Button',
  request: 'Request Help',
  assistance: 'Assistance Request',
  family: 'Family Assistance',
  section: 'Connect',
  sectionAlt: 'Family Connection'
};

export const HELP_ACTION_VALUES = new Set([
  'help',
  'help_button',
  'request_help',
  'assistance',
  'family_assistance',
  // Legacy APK compatibility (treated as help, not medical SOS)
  'panic',
  'panic_button',
  'sos',
  'long_press'
]);

export const HELP_BUTTON_DEFAULTS = {
  activationMode: 'long_press', // 'single_press' | 'long_press'
  longPressMs: 2000,
  countdownSeconds: 5,
  cancelable: true,
  vibrateOnConfirm: true,
  vibratePatternMs: [200, 100, 200],
  requireConfirmation: true,
  testMode: false,
  notifyAuthorizedContactsOnly: true,
  promisesMedicalResponse: false,
  contactsEmergencyServices: false
};

/**
 * Builds a structured activation payload for audit + API.
 */
export function buildHelpActivationPayload({
  source = 'app',
  deviceId = null,
  mode = 'live',
  cancelled = false,
  confirmed = false,
  location = null,
  metadata = {}
} = {}) {
  return {
    type: mode === 'test' ? 'help_request_test' : 'help_request',
    // Keep panic_alert alias in logs for historical queries until migration completes
    legacyTypeAlias: 'panic_alert',
    source,
    deviceId,
    mode,
    cancelled,
    confirmed,
    triggeredAt: new Date().toISOString(),
    location: location && Number.isFinite(location.latitude) && Number.isFinite(location.longitude)
      ? { latitude: location.latitude, longitude: location.longitude }
      : null,
    framing: {
      label: HELP_BUTTON_LABELS.family,
      medicalEmergency: false,
      emergencyServices: false
    },
    interaction: { ...HELP_BUTTON_DEFAULTS },
    metadata
  };
}

export function isHelpAction(action) {
  return HELP_ACTION_VALUES.has(String(action || '').toLowerCase());
}
