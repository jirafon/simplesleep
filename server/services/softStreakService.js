/**
 * Soft streaks — encouraging consistency without punishing bad sleep.
 * Never labels the user as failed / bad sleeper.
 */

const SleepContext = require('../models/SleepContext');
const DailyCheckIn = require('../models/DailyCheckIn');

function dateKeyUTC(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function addDays(dateKey, delta) {
  const d = new Date(`${dateKey}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/**
 * Count consecutive days backwards from today where predicate(dateKey) is true.
 */
function streakFrom(todayKey, maxLookback, predicate) {
  let count = 0;
  for (let i = 0; i < maxLookback; i++) {
    const key = addDays(todayKey, -i);
    if (predicate(key)) count += 1;
    else break;
  }
  return count;
}

/**
 * @returns soft streak summary for coaching UI
 */
async function computeSoftStreaks(userId, { nights = [], contexts = [], locale = 'en' } = {}) {
  const es = locale === 'es';
  const today = dateKeyUTC();

  const ctxList =
    contexts.length > 0
      ? contexts
      : await SleepContext.find({ userId }).sort({ dateKey: -1 }).limit(40).lean();

  const ctxByDate = Object.fromEntries(ctxList.map((c) => [c.dateKey, c]));

  const nightKeys = new Set(
    (nights || [])
      .map((n) => (n.timestamp ? new Date(n.timestamp).toISOString().slice(0, 10) : n.dateKey))
      .filter(Boolean)
  );

  // Phone-down streak: screenToSleep within a gentle target (≤ 45 min) or evening screens not late
  const phoneDownStreak = streakFrom(today, 28, (key) => {
    const c = ctxByDate[key];
    if (!c?.phone) return false;
    const sts = c.phone.screenToSleepMinutes;
    if (typeof sts === 'number') return sts <= 45;
    return (c.phone.screenMinutesLast60m || 0) <= 25;
  });

  // Sleep routine: band night present (wear / sync), not "good score"
  const routineStreak = streakFrom(today, 28, (key) => nightKeys.has(key) || Boolean(ctxByDate[key]?.sleep?.totalMinutes));

  // Check-in streak (morning or evening)
  const checkIns = await DailyCheckIn.find({ userId })
    .sort({ dateKey: -1 })
    .limit(40)
    .lean();
  const checkByDate = Object.fromEntries(checkIns.map((c) => [c.dateKey, c]));
  const checkInStreak = streakFrom(today, 28, (key) => {
    const c = checkByDate[key];
    return Boolean(c?.morning?.completedAt || c?.evening?.completedAt);
  });

  // Experiment completion count (gentle badge, not a streak of guilt)
  const ExperimentAssignment = require('../models/ExperimentAssignment');
  const completedExperiments = await ExperimentAssignment.countDocuments({
    userId,
    status: 'completed'
  });

  let tryStreak = 0;
  try {
    const tonightTry = require('./tonightTryService');
    tryStreak = await tonightTry.countTryStreak(userId, today);
  } catch (_) {
    /* optional */
  }

  const items = [
    {
      id: 'phone_down',
      label: es ? 'Noches con teléfono temprano' : 'Earlier phone-down nights',
      days: phoneDownStreak,
      detail:
        phoneDownStreak >= 3
          ? es
            ? `${phoneDownStreak} noches seguidas cerca de tu objetivo de pantalla.`
            : `${phoneDownStreak} nights in a row near your phone-down target.`
          : es
            ? 'Estamos aprendiendo tu ritmo de pantalla nocturna.'
            : "We're still learning your evening phone rhythm."
    },
    {
      id: 'ill_try',
      label: es ? 'Noches con “lo intentaré”' : "I'll-try nights",
      days: tryStreak,
      detail:
        tryStreak >= 2
          ? es
            ? `${tryStreak} noches seguidas aceptando la acción de esta noche.`
            : `${tryStreak} nights in a row accepting tonight's move.`
          : es
            ? 'Marca “Lo voy a intentar” cuando quieras probar la acción.'
            : 'Tap “I\'ll try this” when you want to attempt tonight\'s move.'
    },
    {
      id: 'sleep_routine',
      label: es ? 'Rutina de sync' : 'Sync routine',
      days: routineStreak,
      detail:
        routineStreak >= 3
          ? es
            ? `${routineStreak} noches con datos de sueño.`
            : `${routineStreak} nights with sleep data.`
          : es
            ? 'Sync tu pulsera para construir tu línea base.'
            : 'Sync your band to build your baseline.'
    },
    {
      id: 'check_in',
      label: es ? 'Check-ins' : 'Check-ins',
      days: checkInStreak,
      detail:
        checkInStreak >= 2
          ? es
            ? `${checkInStreak} días con check-in.`
            : `${checkInStreak} days with a check-in.`
          : es
            ? 'Un check-in breve ayuda a personalizar insights.'
            : 'A short check-in helps personalize insights.'
    },
    {
      id: 'experiments_done',
      label: es ? 'Experimentos completados' : 'Experiments completed',
      days: completedExperiments,
      detail:
        completedExperiments > 0
          ? es
            ? `${completedExperiments} experimento(s) terminados — resultados personales.`
            : `${completedExperiments} experiment(s) finished — personal results.`
          : es
            ? 'Prueba un cambio durante 7 noches cuando quieras.'
            : 'Try one change for 7 nights whenever you like.'
    }
  ];

  return {
    items,
    encouragement:
      phoneDownStreak >= 5 || routineStreak >= 5
        ? es
          ? 'Buena constancia. Eso ayuda a descubrir qué te funciona.'
          : 'Nice consistency. That helps reveal what works for you.'
        : es
          ? 'Sin presión — cada noche con datos suma.'
          : 'No pressure — every night with data helps.',
    algorithmVersion: 'soft-streaks-v1'
  };
}

module.exports = {
  computeSoftStreaks,
  streakFrom,
  dateKeyUTC
};
