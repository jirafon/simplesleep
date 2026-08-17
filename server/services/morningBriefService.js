/**
 * AI Morning Brief — short deterministic daily summary.
 * Prefer templates; never dump raw phone content into an LLM.
 * Flag: AI_MORNING_BRIEF
 */

const ALGORITHM_VERSION = 'morning-brief-v1';

function formatHours(minutes, locale = 'en') {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes)) return null;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return locale === 'es' ? `${h}h ${m}m` : `${h}h ${m}m`;
}

function formatClock(isoOrClock) {
  if (!isoOrClock) return null;
  if (typeof isoOrClock === 'string' && /^\d{1,2}:\d{2}/.test(isoOrClock)) {
    return isoOrClock.slice(0, 5);
  }
  const d = new Date(isoOrClock);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/**
 * Build a 2–3 paragraph morning brief from normalized context.
 */
function buildMorningBrief({
  locale = 'en',
  lastNight = {},
  baseline = {},
  phone = {},
  recommendation = {},
  sleepScore = null,
  factors = []
} = {}) {
  const es = locale === 'es';
  const duration = formatHours(lastNight.totalMinutes, locale);
  const vs =
    typeof lastNight.totalMinutes === 'number' && typeof baseline.avgSleepMinutes === 'number'
      ? Math.round(lastNight.totalMinutes - baseline.avgSleepMinutes)
      : null;

  const paragraphs = [];

  // P1 — greeting + duration vs baseline
  if (duration) {
    if (vs == null) {
      paragraphs.push(
        es
          ? `Buenos días. Anoche dormiste ${duration}.`
          : `Good morning. You slept ${duration} last night.`
      );
    } else if (Math.abs(vs) < 20) {
      paragraphs.push(
        es
          ? `Buenos días. Dormiste ${duration}, cerca de tu promedio reciente.`
          : `Good morning. You slept ${duration}, close to your recent average.`
      );
    } else if (vs < 0) {
      paragraphs.push(
        es
          ? `Buenos días. Dormiste ${duration}, unas ${Math.abs(vs)} minutos por debajo de tu duración habitual.`
          : `Good morning. You slept ${duration}, about ${Math.abs(vs)} minutes below your usual duration.`
      );
    } else {
      paragraphs.push(
        es
          ? `Buenos días. Dormiste ${duration}, unas ${vs} minutos por encima de tu duración habitual.`
          : `Good morning. You slept ${duration}, about ${vs} minutes above your usual duration.`
      );
    }
  } else {
    paragraphs.push(
      es
        ? 'Buenos días. Todavía estamos reuniendo datos de tu última noche.'
        : "Good morning. We're still gathering data from your last night."
    );
  }

  // P2 — context (bedtime deviation / phone)
  const bits = [];
  if (typeof lastNight.bedtimeDeviationMinutes === 'number' && Math.abs(lastNight.bedtimeDeviationMinutes) >= 20) {
    const late = lastNight.bedtimeDeviationMinutes > 0;
    bits.push(
      es
        ? late
          ? `Tu hora de dormir se movió ${Math.abs(lastNight.bedtimeDeviationMinutes)} minutos más tarde que tu línea base.`
          : `Te acostaste ${Math.abs(lastNight.bedtimeDeviationMinutes)} minutos antes que tu línea base.`
        : late
          ? `Your bedtime moved ${Math.abs(lastNight.bedtimeDeviationMinutes)} minutes later than your recent baseline.`
          : `You went to bed ${Math.abs(lastNight.bedtimeDeviationMinutes)} minutes earlier than your recent baseline.`
    );
  } else if (typeof lastNight.vsBaselineMinutes === 'number' && Math.abs(lastNight.vsBaselineMinutes) >= 25) {
    // already covered in p1; skip duplicate
  }

  const phoneDown = formatClock(phone.lastInteractionAt);
  const sts = phone.screenToSleepMinutes;
  if (phoneDown && typeof sts === 'number') {
    bits.push(
      es
        ? `Estuviste activo en el teléfono hasta las ${phoneDown} y el sueño se detectó unos ${sts} minutos después.`
        : `You were active on your phone until ${phoneDown} and sleep was detected about ${sts} minutes later.`
    );
  } else if (typeof phone.screenMinutesLast120m === 'number' && phone.screenMinutesLast120m >= 40) {
    bits.push(
      es
        ? `Hubo bastante uso de pantalla en las dos horas previas a dormir (${phone.screenMinutesLast120m} min).`
        : `There was notable screen use in the two hours before sleep (${phone.screenMinutesLast120m} min).`
    );
  }

  const topNeg = (factors || []).find((f) => f.direction === 'negative');
  if (topNeg && bits.length < 2) {
    bits.push(topNeg.detail || topNeg.label);
  }

  if (bits.length) {
    paragraphs.push(bits.join(' '));
  } else if (typeof sleepScore === 'number') {
    paragraphs.push(
      es
        ? `Tu Sleep Score fue ${Math.round(sleepScore)}. Seguimos aprendiendo tus patrones personales.`
        : `Your Sleep Score was ${Math.round(sleepScore)}. We're still learning your personal patterns.`
    );
  }

  // P3 — tonight's move
  const move = recommendation.title || recommendation.action;
  if (move) {
    paragraphs.push(
      es ? `Esta noche, prueba: ${move}` : `Tonight, try: ${move}`
    );
  } else {
    paragraphs.push(
      es
        ? 'Esta noche, apunta a una rutina simple y consistente cerca de tu hora habitual.'
        : 'Tonight, aim for one simple, consistent wind-down near your usual bedtime.'
    );
  }

  return {
    paragraphs: paragraphs.slice(0, 3),
    text: paragraphs.slice(0, 3).join('\n\n'),
    algorithmVersion: ALGORITHM_VERSION,
    disclaimer: es
      ? 'Resumen de bienestar basado en tus datos. No es un diagnóstico médico.'
      : 'A wellness summary based on your data. Not a medical diagnosis.'
  };
}

module.exports = {
  ALGORITHM_VERSION,
  buildMorningBrief
};
