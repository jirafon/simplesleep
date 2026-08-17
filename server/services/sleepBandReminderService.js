/**
 * Band sleep reminders suggested by Tonight's Move / Coach.
 * Patterns (learnable by the user):
 *  - 3 vibrations → put phone down (wind-down)
 *  - 7 vibrations → bedtime
 * Always opt-in; never auto-enable without user action.
 */

const PHONE_DOWN_ID = 'sleep_phone_down';
const BEDTIME_ID = 'sleep_bedtime';

const TEMPLATES = {
  [PHONE_DOWN_ID]: {
    id: PHONE_DOWN_ID,
    vibrationCount: 3,
    frequency: 'daily',
    frequencyMinutes: 1440,
    enabled: false,
    aiRecommended: true
  },
  [BEDTIME_ID]: {
    id: BEDTIME_ID,
    vibrationCount: 7,
    frequency: 'daily',
    frequencyMinutes: 1440,
    enabled: false,
    aiRecommended: true
  }
};

function isValidTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function clockFromMinutes(total) {
  const m = ((total % 1440) + 1440) % 1440;
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function minutesFromClock(clock) {
  if (!isValidTime(clock)) return null;
  const [h, m] = clock.split(':').map(Number);
  return h * 60 + m;
}

function labels(locale, id) {
  const es = locale === 'es';
  if (id === PHONE_DOWN_ID) {
    return {
      label: es ? 'Deja el teléfono' : 'Put phone down',
      cta: (time, vib) =>
        es
          ? `Activar ${vib} vibraciones a las ${time}`
          : `Enable ${vib} watch vibrations at ${time}`,
      reason: es
        ? 'La pulsera te avisa con 3 vibraciones para guardar el teléfono antes de dormir.'
        : 'Your band will pulse 3 times to remind you to put the phone down before sleep.'
    };
  }
  return {
    label: es ? 'Hora de dormir' : 'Bedtime',
    cta: (time, vib) =>
      es
        ? `Activar ${vib} vibraciones a las ${time}`
        : `Enable ${vib} watch vibrations at ${time}`,
    reason: es
      ? 'La pulsera te avisa con 7 vibraciones cuando es hora de ir a dormir.'
      : 'Your band will pulse 7 times when it is time to go to sleep.'
  };
}

/**
 * Attach opt-in band reminder suggestions to a Tonight's Move object.
 */
function attachBandReminders(move, { locale = 'en', targetBedtime } = {}) {
  if (!move || typeof move !== 'object') return move;

  const phoneTime =
    (isValidTime(move.windDownAt) && move.windDownAt) ||
    (() => {
      const bed = minutesFromClock(targetBedtime) ?? 22 * 60 + 30;
      return clockFromMinutes(bed - 45);
    })();

  const bedTime = isValidTime(targetBedtime)
    ? targetBedtime
    : isValidTime(move.windDownAt)
      ? clockFromMinutes((minutesFromClock(move.windDownAt) ?? 22 * 60) + 45)
      : '22:30';

  const factor = move.factor || move.focusFactor || '';
  const phoneFocused = ['late_screen', 'phone_to_sleep', 'screens_checkin'].includes(factor);

  const suggestions = [];

  const phoneL = labels(locale, PHONE_DOWN_ID);
  suggestions.push({
    ...TEMPLATES[PHONE_DOWN_ID],
    label: phoneL.label,
    time: phoneTime,
    startTime: phoneTime,
    endTime: phoneTime,
    aiReason: phoneL.reason,
    cta: phoneL.cta(phoneTime, 3),
    primary: phoneFocused
  });

  const bedL = labels(locale, BEDTIME_ID);
  suggestions.push({
    ...TEMPLATES[BEDTIME_ID],
    label: bedL.label,
    time: bedTime,
    startTime: bedTime,
    endTime: bedTime,
    aiReason: bedL.reason,
    cta: bedL.cta(bedTime, 7),
    primary: !phoneFocused
  });

  return {
    ...move,
    bandReminders: suggestions
  };
}

function buildReminderRecord(template, overrides = {}, locale = 'en') {
  const L = labels(locale, template.id);
  const time = isValidTime(overrides.time)
    ? overrides.time
    : isValidTime(overrides.startTime)
      ? overrides.startTime
      : template.time || '22:00';
  const vib = Math.min(
    Math.max(parseInt(overrides.vibrationCount, 10) || template.vibrationCount, 1),
    10
  );
  return {
    id: template.id,
    label: typeof overrides.label === 'string' && overrides.label.trim() ? overrides.label.trim() : L.label,
    vibrationCount: vib,
    time,
    startTime: time,
    endTime: time,
    frequency: 'daily',
    frequencyMinutes: 1440,
    enabled: overrides.enabled !== undefined ? Boolean(overrides.enabled) : true,
    aiRecommended: true,
    aiReason:
      typeof overrides.aiReason === 'string' && overrides.aiReason.trim()
        ? overrides.aiReason.trim()
        : L.reason
  };
}

/**
 * Enable / upsert one sleep band reminder on the user's wellness profile.
 */
async function activateBandReminder(userId, payload = {}, locale = 'en') {
  const User = require('../models/User');
  const reminderId = payload.reminderId || payload.id;
  const template = TEMPLATES[reminderId];
  if (!template) {
    const err = new Error('Unknown band reminder id');
    err.code = 'UNKNOWN_REMINDER';
    throw err;
  }

  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  const next = buildReminderRecord(
    { ...template, time: payload.time || payload.startTime || '22:00' },
    {
      time: payload.time || payload.startTime,
      vibrationCount: payload.vibrationCount,
      label: payload.label,
      aiReason: payload.aiReason,
      enabled: true
    },
    locale
  );

  const existing = Array.isArray(user.wellnessProfile?.importantReminders)
    ? [...user.wellnessProfile.importantReminders.map((r) => (r.toObject ? r.toObject() : { ...r }))]
    : [];

  const byId = new Map(existing.map((r) => [r.id, r]));
  byId.set(next.id, next);

  Object.values(TEMPLATES).forEach((t) => {
    if (!byId.has(t.id)) {
      byId.set(t.id, buildReminderRecord({ ...t, time: '22:00' }, { enabled: false }, locale));
    }
  });

  const reminders = Array.from(byId.values());
  user.wellnessProfile = user.wellnessProfile || {};
  user.wellnessProfile.importantReminders = reminders;
  user.markModified('wellnessProfile.importantReminders');
  await user.save();

  return { reminder: next, reminders };
}

module.exports = {
  PHONE_DOWN_ID,
  BEDTIME_ID,
  TEMPLATES,
  attachBandReminders,
  activateBandReminder,
  buildReminderRecord
};
