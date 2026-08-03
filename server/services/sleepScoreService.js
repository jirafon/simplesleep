/**
 * Sleep Score v1 — transparent, self-referenced, non-diagnostic.
 * algorithmVersion: sleep-score-v1
 */

const ALGORITHM_VERSION = 'sleep-score-v1';

const DEFAULT_WEIGHTS = {
  durationMax: 25,
  regularityMax: 20,
  continuityMax: 20,
  bedtimeMax: 15,
  hrNightMax: 10,
  subjectiveMax: 10
};

const GOAL_OPTIONS = [
  { id: 'more_energy', label: 'Wake up with more energy' },
  { id: 'fewer_interruptions', label: 'Reduce nighttime interruptions' },
  { id: 'regular_schedule', label: 'Maintain a regular sleep schedule' },
  { id: 'bedtime_routine', label: 'Build a better bedtime routine' },
  { id: 'understand_factors', label: 'Understand what affects my sleep' }
];

const MORNING_FEELINGS = ['rested', 'okay', 'tired', 'exhausted'];

const NIGHT_EVENTS = [
  'hot_flash',
  'night_sweat',
  'racing_heart',
  'bathroom',
  'stressful_thoughts',
  'noise',
  'partner_movement',
  'pain',
  'nothing_unusual'
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function minutesFromClock(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return null;
  const [h, m] = hhmm.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function circularDiffMinutes(a, b) {
  let d = Math.abs(a - b) % 1440;
  if (d > 720) d = 1440 - d;
  return d;
}

/**
 * @param {object} input
 * @param {number|null} input.totalMinutes
 * @param {number} input.sleepGoalMinutes
 * @param {string|null} input.bedtimeClock - actual bedtime HH:MM
 * @param {string|null} input.targetBedtime - goal HH:MM
 * @param {number|null} input.avgBedtimeMinutes - baseline bedtime as minutes-from-midnight
 * @param {number|null} input.awakeMinutes
 * @param {number|null} input.wakingCount
 * @param {number|null} input.nightHeartRate
 * @param {number|null} input.baselineNightHr
 * @param {string|null} input.morningFeeling - rested|okay|tired|exhausted
 * @param {object} [weights]
 */
function computeSleepScore(input, weights = DEFAULT_WEIGHTS) {
  const w = { ...DEFAULT_WEIGHTS, ...weights };
  const factors = [];
  let score = 100;

  // Duration
  let durationPenalty = 0;
  const goal = input.sleepGoalMinutes || 480;
  if (typeof input.totalMinutes === 'number' && Number.isFinite(input.totalMinutes)) {
    const ratio = input.totalMinutes / goal;
    if (ratio < 0.7) durationPenalty = w.durationMax;
    else if (ratio < 0.85) durationPenalty = Math.round(w.durationMax * 0.7);
    else if (ratio < 0.95) durationPenalty = Math.round(w.durationMax * 0.35);
    else if (ratio > 1.25) durationPenalty = Math.round(w.durationMax * 0.25);
    else durationPenalty = 0;
    factors.push({
      id: 'duration',
      label: 'Duración',
      impact: -durationPenalty,
      detail: `${Math.round(input.totalMinutes)} min vs meta ${goal} min`
    });
  } else {
    factors.push({ id: 'duration', label: 'Duración', impact: 0, detail: 'Sin datos de duración' });
  }
  score -= durationPenalty;

  // Regularity (vs personal baseline bedtime)
  let regularityPenalty = 0;
  const actualBed = minutesFromClock(input.bedtimeClock);
  if (actualBed != null && typeof input.avgBedtimeMinutes === 'number') {
    const drift = circularDiffMinutes(actualBed, input.avgBedtimeMinutes);
    if (drift > 90) regularityPenalty = w.regularityMax;
    else if (drift > 60) regularityPenalty = Math.round(w.regularityMax * 0.7);
    else if (drift > 30) regularityPenalty = Math.round(w.regularityMax * 0.4);
    else if (drift > 15) regularityPenalty = Math.round(w.regularityMax * 0.2);
    factors.push({
      id: 'regularity',
      label: 'Regularidad',
      impact: -regularityPenalty,
      detail: drift === 0
        ? 'Misma hora que tu promedio'
        : `${drift} min respecto a tu promedio`
    });
  } else {
    factors.push({ id: 'regularity', label: 'Regularidad', impact: 0, detail: 'Construyendo tu línea base' });
  }
  score -= regularityPenalty;

  // Continuity / interruptions
  let continuityPenalty = 0;
  const awake = typeof input.awakeMinutes === 'number' ? input.awakeMinutes : null;
  const wakes = typeof input.wakingCount === 'number' ? input.wakingCount : null;
  if (awake != null || wakes != null) {
    const a = awake || 0;
    const wk = wakes || 0;
    continuityPenalty = clamp(Math.round(a / 5) + wk * 3, 0, w.continuityMax);
    factors.push({
      id: 'continuity',
      label: 'Continuidad',
      impact: -continuityPenalty,
      detail: `${wk} interrupciones · ${a} min despierto`
    });
  } else {
    factors.push({ id: 'continuity', label: 'Continuidad', impact: 0, detail: 'Sin datos de interrupciones' });
  }
  score -= continuityPenalty;

  // Bedtime vs target
  let bedtimePenalty = 0;
  const target = minutesFromClock(input.targetBedtime);
  if (actualBed != null && target != null) {
    const drift = circularDiffMinutes(actualBed, target);
    if (drift > 75) bedtimePenalty = w.bedtimeMax;
    else if (drift > 45) bedtimePenalty = Math.round(w.bedtimeMax * 0.7);
    else if (drift > 20) bedtimePenalty = Math.round(w.bedtimeMax * 0.4);
    factors.push({
      id: 'bedtime',
      label: 'Hora de acostarse',
      impact: -bedtimePenalty,
      detail: drift === 0 ? 'En tu hora objetivo' : `${drift} min vs objetivo`
    });
  } else {
    factors.push({ id: 'bedtime', label: 'Hora de acostarse', impact: 0, detail: 'Define tu hora objetivo en onboarding' });
  }
  score -= bedtimePenalty;

  // Night HR vs baseline
  let hrPenalty = 0;
  if (
    typeof input.nightHeartRate === 'number' &&
    typeof input.baselineNightHr === 'number' &&
    input.baselineNightHr > 0
  ) {
    const delta = input.nightHeartRate - input.baselineNightHr;
    if (delta > 12) hrPenalty = w.hrNightMax;
    else if (delta > 8) hrPenalty = Math.round(w.hrNightMax * 0.7);
    else if (delta > 4) hrPenalty = Math.round(w.hrNightMax * 0.35);
    else if (delta < -8) hrPenalty = 0; // lower can be fine
    factors.push({
      id: 'night_hr',
      label: 'Pulso nocturno',
      impact: -hrPenalty,
      detail: `${Math.round(input.nightHeartRate)} bpm vs tu base ${Math.round(input.baselineNightHr)}`
    });
  } else {
    factors.push({ id: 'night_hr', label: 'Pulso nocturno', impact: 0, detail: 'Sin baseline aún' });
  }
  score -= hrPenalty;

  // Subjective morning feeling
  let subjective = 0;
  const feeling = input.morningFeeling;
  if (feeling === 'rested') subjective = w.subjectiveMax;
  else if (feeling === 'okay') subjective = Math.round(w.subjectiveMax * 0.3);
  else if (feeling === 'tired') subjective = -Math.round(w.subjectiveMax * 0.5);
  else if (feeling === 'exhausted') subjective = -w.subjectiveMax;
  if (feeling) {
    factors.push({
      id: 'subjective',
      label: 'Cómo te sentiste',
      impact: subjective,
      detail: feeling
    });
  }
  score += subjective;

  const finalScore = clamp(Math.round(score), 0, 100);
  const quality =
    finalScore >= 85 ? 'restorative'
      : finalScore >= 70 ? 'good'
        : finalScore >= 55 ? 'fair'
          : 'challenging';

  return {
    score: finalScore,
    quality,
    algorithmVersion: ALGORITHM_VERSION,
    weights: w,
    factors: factors.sort((a, b) => a.impact - b.impact),
    disclaimer: 'Este puntaje compara tu noche contigo misma. No es un diagnóstico médico.'
  };
}

function buildTonightRecommendation({
  targetBedtime,
  windDownMinutes = 45,
  scoreResult,
  totalMinutes,
  sleepGoalMinutes,
  locale = 'en'
}) {
  const { t: i18nT } = require('../i18n/sleepMessages');
  const target = minutesFromClock(targetBedtime) ?? 22 * 60 + 30;
  const wind = clamp(target - (windDownMinutes || 45), 0, 1439);
  const hh = String(Math.floor(wind / 60)).padStart(2, '0');
  const mm = String(wind % 60).padStart(2, '0');
  const time = `${hh}:${mm}`;

  const worst = (scoreResult?.factors || []).filter((f) => f.impact < 0)[0];
  let explanation = i18nT(locale, 'rec.default');
  if (worst?.id === 'continuity') {
    explanation = i18nT(locale, 'rec.interrupted');
  } else if (worst?.id === 'duration') {
    explanation = i18nT(locale, 'rec.short');
  } else if (worst?.id === 'regularity' || worst?.id === 'bedtime') {
    explanation = i18nT(locale, 'rec.late');
  } else if (scoreResult?.score >= 80) {
    explanation = i18nT(locale, 'rec.default');
  }

  return {
    explanation,
    action: i18nT(locale, 'rec.windDown', { time }),
    windDownAt: time,
    focusFactor: worst?.id || null
  };
}

module.exports = {
  ALGORITHM_VERSION,
  DEFAULT_WEIGHTS,
  GOAL_OPTIONS,
  MORNING_FEELINGS,
  NIGHT_EVENTS,
  computeSleepScore,
  buildTonightRecommendation,
  minutesFromClock,
  circularDiffMinutes
};
