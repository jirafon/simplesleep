/**
 * Sleep Context Timeline — evening phone + sleep stages + night phone events.
 * Flag: SLEEP_CONTEXT_TIMELINE
 */

const ALGORITHM_VERSION = 'sleep-timeline-v1';

function parseClockToMinutes(clock) {
  if (!clock || typeof clock !== 'string') return null;
  const [h, m] = clock.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function isoToMinutes(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.getHours() * 60 + d.getMinutes();
}

/**
 * Normalize a minute-of-day into timeline space where evening (18:00) → next noon (12:00)
 * maps to [0, 1080] minutes from 18:00.
 */
function toTimelineOffset(minuteOfDay) {
  if (minuteOfDay == null) return null;
  const start = 18 * 60; // 18:00
  if (minuteOfDay >= start) return minuteOfDay - start;
  // After midnight until noon
  if (minuteOfDay <= 12 * 60) return minuteOfDay + (24 * 60 - start);
  return null;
}

/**
 * Build timeline segments for one night.
 * Does not invent events — only uses available fields.
 */
function buildSleepTimeline({
  night = {},
  phone = {},
  locale = 'en'
} = {}) {
  const es = locale === 'es';
  const events = [];
  const bands = [];

  const bedtimeMin = parseClockToMinutes(night.bedtimeClock || night?.sleep?.bedtime);
  const sleepStartOffset = toTimelineOffset(bedtimeMin);

  // Approximate stage bands after sleep start using minutes
  const deep = night.deep ?? night.deepMinutes ?? night?.sleep?.deepMinutes ?? 0;
  const light = night.light ?? night.lightMinutes ?? night?.sleep?.lightMinutes ?? 0;
  const rem = night.rem ?? night.remMinutes ?? night?.sleep?.remMinutes ?? 0;
  const awake = night.awakeMinutes ?? night?.sleep?.awakeMinutes ?? 0;
  const total = night.totalMinutes ?? night?.sleep?.totalMinutes ?? deep + light + rem;

  if (sleepStartOffset != null && total > 0) {
    events.push({
      id: 'sleep_start',
      type: 'marker',
      offsetMinutes: sleepStartOffset,
      label: es ? 'Inicio del sueño' : 'Sleep start'
    });

    // Rough sequential composition (not clinical hypnogram)
    let cursor = sleepStartOffset;
    const pushBand = (stage, minutes, color) => {
      if (!minutes || minutes <= 0) return;
      bands.push({
        stage,
        startOffset: cursor,
        endOffset: cursor + minutes,
        color
      });
      cursor += minutes;
    };
    // Order: light → deep → rem → light remainder style composition
    pushBand('light', Math.round(light * 0.55), '#7dd3fc');
    pushBand('deep', deep, '#0f766e');
    pushBand('rem', rem, '#0369a1');
    pushBand('light', Math.round(light * 0.45), '#7dd3fc');
    if (awake > 0) {
      events.push({
        id: 'awake_block',
        type: 'awake',
        offsetMinutes: sleepStartOffset + Math.round(total * 0.45),
        durationMinutes: Math.min(awake, 40),
        label: es ? 'Despierto detectado' : 'Awake detected'
      });
    }
    events.push({
      id: 'final_wake',
      type: 'marker',
      offsetMinutes: sleepStartOffset + total,
      label: es ? 'Despertar' : 'Final wake'
    });
  }

  // Phone down / last interaction
  const lastPhoneMin = isoToMinutes(phone.lastInteractionAt);
  const phoneDownOffset = toTimelineOffset(lastPhoneMin);
  if (phoneDownOffset != null) {
    events.push({
      id: 'phone_down',
      type: 'phone_down',
      offsetMinutes: phoneDownOffset,
      label: es ? 'Teléfono guardado' : 'Phone down'
    });
  }

  // Evening screen band (last 120m before sleep approx)
  if (typeof phone.screenMinutesLast120m === 'number' && phone.screenMinutesLast120m > 0 && sleepStartOffset != null) {
    const screenDur = Math.min(120, phone.screenMinutesLast120m);
    bands.push({
      stage: 'screen',
      startOffset: Math.max(0, sleepStartOffset - screenDur - (phone.screenToSleepMinutes || 0)),
      endOffset: Math.max(0, sleepStartOffset - (phone.screenToSleepMinutes || 0)),
      color: '#94a3b8'
    });
  }

  // Night phone interruptions (aggregated — no per-app content)
  const nightEvents = phone.nightUsageEvents || 0;
  const nightMins = phone.nightUsageMinutes || 0;
  const interruptions = [];
  if (nightEvents > 0 && sleepStartOffset != null && total > 0) {
    const count = Math.min(3, nightEvents);
    for (let i = 0; i < count; i++) {
      const frac = (i + 1) / (count + 1);
      interruptions.push({
        id: `night_phone_${i}`,
        type: 'night_phone',
        offsetMinutes: Math.round(sleepStartOffset + total * frac),
        durationMinutes: Math.max(3, Math.round(nightMins / count)),
        label: es ? 'Teléfono activo' : 'Phone active'
      });
    }
    events.push(...interruptions);
  }

  // Insight when enough signal
  let interruptionInsight = null;
  if (nightEvents >= 1 && typeof phone.screenToSleepMinutes === 'number') {
    interruptionInsight = {
      observation: es
        ? 'En noches con uso del teléfono tras despertar, puede costar más volver a dormir. Esto es una observación, no una prueba de causa.'
        : 'On nights when you use your phone after waking, it may take longer to return to sleep. This is an observation, not proof of cause.',
      sampleHint: nightEvents,
      confidence: nightEvents >= 3 ? 'medium' : 'low'
    };
  }

  return {
    window: { startHour: 18, endHour: 12, spanMinutes: 18 * 60 },
    events: events.sort((a, b) => (a.offsetMinutes || 0) - (b.offsetMinutes || 0)),
    bands,
    phoneToSleepMinutes: phone.screenToSleepMinutes ?? null,
    interruptionInsight,
    dataAvailable: {
      sleep: total > 0,
      phone: Boolean(phone.lastInteractionAt || phone.screenMinutesLast120m != null || nightEvents > 0)
    },
    algorithmVersion: ALGORITHM_VERSION
  };
}

/**
 * Personal association: nights with night phone use vs return-to-sleep proxy.
 * Requires MIN_OBSERVATIONS contexts with phone data.
 */
function buildNightPhoneInterruptionInsight(contexts = [], locale = 'en') {
  const es = locale === 'es';
  const MIN = 7;
  const usable = (contexts || []).filter(
    (c) =>
      c?.phone &&
      (c.phone.nightUsageEvents > 0 || c.phone.nightUsageMinutes > 0) &&
      typeof c.sleep?.totalMinutes === 'number'
  );
  const withPhone = usable.filter((c) => (c.phone.nightUsageEvents || 0) > 0);
  const withoutPhone = (contexts || []).filter(
    (c) =>
      c?.phone &&
      (c.phone.nightUsageEvents || 0) === 0 &&
      typeof c.sleep?.totalMinutes === 'number'
  );

  if (withPhone.length < MIN || withoutPhone.length < 3) {
    return null;
  }

  const avg = (arr, fn) => {
    const vals = arr.map(fn).filter((v) => typeof v === 'number');
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const avgWith = avg(withPhone, (c) => c.sleep.totalMinutes);
  const avgWithout = avg(withoutPhone, (c) => c.sleep.totalMinutes);
  if (avgWith == null || avgWithout == null) return null;
  const delta = Math.round(avgWithout - avgWith);
  if (Math.abs(delta) < 10) return null;

  return {
    title: es ? 'Uso nocturno del teléfono' : 'Night phone usage',
    observation:
      delta > 0
        ? es
          ? `En noches con uso del teléfono durante la noche, sueles dormir unos ${delta} minutos menos en promedio.`
          : `On nights with nighttime phone use, you tend to sleep about ${delta} minutes less on average.`
        : es
          ? `En noches con uso del teléfono, tu duración promedio fue distinta (${Math.abs(delta)} min). Seguimos observando.`
          : `On nights with phone use, your average duration differed by ${Math.abs(delta)} min. We're still learning.`,
    sampleSize: withPhone.length + withoutPhone.length,
    confidence: withPhone.length >= 14 ? 'medium' : 'low',
    factor: 'night_phone',
    metric: 'totalSleepMinutes',
    disclaimer: es
      ? 'Este es un patrón observado, no una prueba de causa.'
      : 'This is an observed pattern, not proof of cause.'
  };
}

module.exports = {
  ALGORITHM_VERSION,
  buildSleepTimeline,
  buildNightPhoneInterruptionInsight,
  toTimelineOffset
};
