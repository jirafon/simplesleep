/**
 * Tonight's Move — ONE actionable recommendation for tonight.
 * Based on baseline + recent context factors. Not medical advice.
 * algorithmVersion: tonight-move-v1
 */

const { buildTonightRecommendation, minutesFromClock } = require('./sleepScoreService');
const { t: i18nT } = require('../i18n/sleepMessages');
const { attachBandReminders } = require('./sleepBandReminderService');

const ALGORITHM_VERSION = 'tonight-move-v1';

function clockFromMinutes(total) {
  const m = ((total % 1440) + 1440) % 1440;
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Prefer context-aware single move; fall back to classic wind-down tip.
 */
function buildTonightMove({
  locale = 'en',
  targetBedtime,
  windDownMinutes = 45,
  scoreResult,
  totalMinutes,
  sleepGoalMinutes,
  factors = [],
  baseline = {},
  phone = {}
} = {}) {
  const negatives = (factors || [])
    .filter((f) => f.direction === 'negative')
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

  const top = negatives[0];

  const targetBed = minutesFromClock(targetBedtime) ?? 22 * 60 + 30;
  const avgSts = baseline.avgScreenToSleepMinutes;
  const buffer =
    typeof avgSts === 'number' && avgSts > 0 ? Math.min(60, Math.max(20, Math.round(avgSts))) : 45;
  const phoneDownAt = clockFromMinutes(targetBed - buffer);

  let move;
  if (top?.id === 'late_screen' || top?.id === 'phone_to_sleep' || top?.id === 'screens_checkin') {
    move = {
      title:
        locale === 'es'
          ? `Guarda el teléfono a las ${phoneDownAt}`
          : `Put your phone down by ${phoneDownAt}`,
      reason:
        locale === 'es'
          ? 'Tus mejores noches suelen seguir a menos pantalla cerca de dormir.'
          : 'Your better nights tend to follow earlier phone inactivity.',
      factor: top.id,
      confidence: top.confidence || 0.7,
      actionable: true,
      algorithmVersion: ALGORITHM_VERSION,
      explanation:
        locale === 'es'
          ? 'Tus mejores noches suelen seguir a menos pantalla cerca de dormir.'
          : 'Your better nights tend to follow earlier phone inactivity.',
      action:
        locale === 'es'
          ? `Guarda el teléfono a las ${phoneDownAt}`
          : `Put your phone down by ${phoneDownAt}`,
      windDownAt: phoneDownAt,
      focusFactor: top.id
    };
  } else if (top?.id === 'daily_activity') {
    move = {
      title:
        locale === 'es'
          ? 'Suma ~20 minutos más de actividad hoy'
          : 'Get about 20 more minutes of activity today',
      reason:
        locale === 'es'
          ? 'Los días con más movimiento tienden a asociarse con noches más sólidas para ti.'
          : 'Days with more movement tend to associate with stronger nights for you.',
      factor: top.id,
      confidence: top.confidence || 0.6,
      actionable: true,
      algorithmVersion: ALGORITHM_VERSION,
      explanation:
        locale === 'es'
          ? 'Los días con más movimiento tienden a asociarse con noches más sólidas para ti.'
          : 'Days with more movement tend to associate with stronger nights for you.',
      action:
        locale === 'es'
          ? 'Suma ~20 minutos más de actividad hoy'
          : 'Get about 20 more minutes of activity today',
      windDownAt: phoneDownAt,
      focusFactor: top.id
    };
  } else if (top?.id === 'caffeine_late') {
    move = {
      title:
        locale === 'es'
          ? 'Evita cafeína después de las 2:00 PM'
          : 'Skip caffeine after 2:00 PM',
      reason:
        locale === 'es'
          ? 'La cafeína tarde a menudo se asocia con un sueño menos continuo.'
          : 'Late caffeine often associates with less continuous sleep.',
      factor: top.id,
      confidence: 0.62,
      actionable: true,
      algorithmVersion: ALGORITHM_VERSION,
      explanation:
        locale === 'es'
          ? 'La cafeína tarde a menudo se asocia con un sueño menos continuo.'
          : 'Late caffeine often associates with less continuous sleep.',
      action:
        locale === 'es'
          ? 'Evita cafeína después de las 2:00 PM'
          : 'Skip caffeine after 2:00 PM',
      windDownAt: phoneDownAt,
      focusFactor: top.id
    };
  } else if (top?.id === 'alcohol') {
    move = {
      title:
        locale === 'es'
          ? 'Prueba una noche sin alcohol'
          : 'Try an alcohol-free night',
      reason:
        locale === 'es'
          ? 'En tus registros, el alcohol suele asociarse con más interrupciones.'
          : 'In your logs, alcohol tends to associate with more interruptions.',
      factor: top.id,
      confidence: 0.6,
      actionable: true,
      algorithmVersion: ALGORITHM_VERSION,
      explanation:
        locale === 'es'
          ? 'En tus registros, el alcohol suele asociarse con más interrupciones.'
          : 'In your logs, alcohol tends to associate with more interruptions.',
      action:
        locale === 'es'
          ? 'Prueba una noche sin alcohol'
          : 'Try an alcohol-free night',
      windDownAt: phoneDownAt,
      focusFactor: top.id
    };
  } else {
    const classic = buildTonightRecommendation({
      targetBedtime,
      windDownMinutes,
      scoreResult,
      totalMinutes,
      sleepGoalMinutes,
      locale
    });
    move = {
      title: classic.action || i18nT(locale, 'rec.windDown', { time: classic.windDownAt }),
      reason: classic.explanation,
      factor: classic.focusFactor || 'bedtime',
      confidence: 0.55,
      actionable: true,
      algorithmVersion: ALGORITHM_VERSION,
      explanation: classic.explanation,
      action: classic.action,
      windDownAt: classic.windDownAt,
      focusFactor: classic.focusFactor
    };
  }

  return attachBandReminders(move, { locale, targetBedtime });
}

module.exports = {
  ALGORITHM_VERSION,
  buildTonightMove
};
