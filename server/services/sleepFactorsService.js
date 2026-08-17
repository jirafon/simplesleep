/**
 * Sleep Factors — what may have shaped last night (context layer).
 * Separate from sleep-score-v1 factors (what happened during sleep).
 * Language: associated with / tends to / may — never causation.
 */

const LABELS = {
  en: {
    late_screen: 'Late screen time',
    phone_to_sleep: 'Phone-to-sleep',
    night_phone: 'Night phone use',
    bedtime_consistency: 'Bedtime consistency',
    daily_activity: 'Daily activity',
    evening_stress: 'Evening stress',
    sleep_duration: 'Sleep duration',
    caffeine_late: 'Late caffeine',
    alcohol: 'Alcohol',
    screens_checkin: 'Late screens (check-in)'
  },
  es: {
    late_screen: 'Pantalla tarde',
    phone_to_sleep: 'Teléfono → sueño',
    night_phone: 'Uso nocturno del teléfono',
    bedtime_consistency: 'Consistencia de hora de dormir',
    daily_activity: 'Actividad del día',
    evening_stress: 'Estrés nocturno',
    sleep_duration: 'Duración del sueño',
    caffeine_late: 'Cafeína tarde',
    alcohol: 'Alcohol',
    screens_checkin: 'Pantallas tarde (check-in)'
  }
};

function label(locale, id) {
  return (LABELS[locale] || LABELS.en)[id] || id;
}

function fmtMin(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
  const h = Math.floor(Math.abs(n) / 60);
  const m = Math.round(Math.abs(n) % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

/**
 * Build context factors from night + phone context + baseline + check-in.
 */
function buildSleepFactors({
  night = {},
  phone = {},
  habits = {},
  baseline = {},
  locale = 'en'
} = {}) {
  const factors = [];
  const avgScreen120 = baseline.avgScreenMinutesLast120m;
  const avgSteps = baseline.avgSteps;
  const avgSleep = baseline.avgSleepMinutes;
  const avgSts = baseline.avgScreenToSleepMinutes;

  if (typeof phone.screenMinutesLast120m === 'number') {
    const v = phone.screenMinutesLast120m;
    let direction = 'neutral';
    let detail =
      locale === 'es'
        ? 'Tiempo de pantalla en las 2 horas antes de dormir.'
        : 'Screen time in the 2 hours before sleep.';
    let confidence = 0.55;
    if (typeof avgScreen120 === 'number' && avgScreen120 > 0) {
      if (v > avgScreen120 * 1.25) {
        direction = 'negative';
        detail =
          locale === 'es'
            ? 'Mayor que tu promedio reciente de pantallas por la noche.'
            : 'Higher than your usual evening screen time.';
        confidence = 0.72;
      } else if (v < avgScreen120 * 0.75) {
        direction = 'positive';
        detail =
          locale === 'es'
            ? 'Menor que tu promedio reciente de pantallas por la noche.'
            : 'Lower than your usual evening screen time.';
        confidence = 0.7;
      }
    } else if (v >= 60) {
      direction = 'negative';
      detail =
        locale === 'es'
          ? 'Bastante tiempo de pantalla cerca de la hora de dormir.'
          : 'Quite a bit of screen time near bedtime.';
      confidence = 0.5;
    }
    factors.push({
      id: 'late_screen',
      label: label(locale, 'late_screen'),
      value: fmtMin(v),
      direction,
      confidence,
      detail
    });
  }

  if (typeof phone.screenToSleepMinutes === 'number') {
    const v = phone.screenToSleepMinutes;
    let direction = 'neutral';
    let detail =
      locale === 'es'
        ? 'Minutos entre última actividad del teléfono y sueño detectado.'
        : 'Minutes between last phone activity and detected sleep.';
    let confidence = 0.6;
    if (typeof avgSts === 'number') {
      if (v < avgSts * 0.7 && v <= 45) {
        direction = 'positive';
        detail =
          locale === 'es'
            ? 'Apagaste el teléfono antes que en tus noches típicas.'
            : 'You put the phone down earlier than on your typical nights.';
        confidence = 0.74;
      } else if (v > avgSts * 1.3 || v > 60) {
        direction = 'negative';
        detail =
          locale === 'es'
            ? 'El teléfono estuvo activo más cerca de la hora de dormir.'
            : 'Phone stayed active closer to sleep than usual.';
        confidence = 0.72;
      }
    } else if (v <= 30) {
      direction = 'positive';
      confidence = 0.55;
    } else if (v >= 60) {
      direction = 'negative';
      confidence = 0.55;
    }
    factors.push({
      id: 'phone_to_sleep',
      label: label(locale, 'phone_to_sleep'),
      value: fmtMin(v),
      direction,
      confidence,
      detail
    });
  }

  if (typeof phone.nightUsageMinutes === 'number' && phone.nightUsageMinutes > 0) {
    factors.push({
      id: 'night_phone',
      label: label(locale, 'night_phone'),
      value: fmtMin(phone.nightUsageMinutes),
      direction: phone.nightUsageMinutes >= 10 ? 'negative' : 'neutral',
      confidence: 0.58,
      detail:
        locale === 'es'
          ? 'Uso del teléfono detectado durante la noche.'
          : 'Phone use detected during the night.'
    });
  }

  if (typeof night.totalMinutes === 'number' && typeof avgSleep === 'number') {
    const delta = night.totalMinutes - avgSleep;
    factors.push({
      id: 'sleep_duration',
      label: label(locale, 'sleep_duration'),
      value: fmtMin(night.totalMinutes),
      direction: delta >= 15 ? 'positive' : delta <= -20 ? 'negative' : 'neutral',
      confidence: 0.8,
      detail:
        locale === 'es'
          ? `${delta >= 0 ? '+' : ''}${Math.round(delta)} min vs tu promedio reciente.`
          : `${delta >= 0 ? '+' : ''}${Math.round(delta)} min vs your recent average.`
    });
  }

  if (typeof habits.stressLevel === 'number') {
    factors.push({
      id: 'evening_stress',
      label: label(locale, 'evening_stress'),
      value: String(habits.stressLevel),
      direction: habits.stressLevel >= 7 ? 'negative' : habits.stressLevel <= 3 ? 'positive' : 'neutral',
      confidence: 0.5,
      detail:
        locale === 'es'
          ? 'Estrés reportado en el check-in de la noche.'
          : 'Stress reported in your evening check-in.'
    });
  }

  if (habits.caffeineLate === true) {
    factors.push({
      id: 'caffeine_late',
      label: label(locale, 'caffeine_late'),
      value: locale === 'es' ? 'Sí' : 'Yes',
      direction: 'negative',
      confidence: 0.55,
      detail:
        locale === 'es'
          ? 'Cafeína reportada tarde en el día.'
          : 'Caffeine reported later in the day.'
    });
  }

  if (habits.alcohol === true) {
    factors.push({
      id: 'alcohol',
      label: label(locale, 'alcohol'),
      value: locale === 'es' ? 'Sí' : 'Yes',
      direction: 'negative',
      confidence: 0.55,
      detail:
        locale === 'es'
          ? 'Alcohol reportado antes de dormir.'
          : 'Alcohol reported before sleep.'
    });
  }

  if (habits.screensLate === true && !factors.some((f) => f.id === 'late_screen')) {
    factors.push({
      id: 'screens_checkin',
      label: label(locale, 'screens_checkin'),
      value: locale === 'es' ? 'Sí' : 'Yes',
      direction: 'negative',
      confidence: 0.45,
      detail:
        locale === 'es'
          ? 'Indicaste pantallas tarde en el check-in.'
          : 'You noted late screens in your check-in.'
    });
  }

  if (typeof phone.activitySteps === 'number' || typeof baseline.avgSteps === 'number') {
    // activity may arrive on phone payload as steps via activity block — handled by caller
  }

  return factors.filter((f) => f.direction !== 'unknown' || f.value);
}

function attachActivityFactor(factors, steps, avgSteps, locale = 'en') {
  if (typeof steps !== 'number') return factors;
  let direction = 'neutral';
  let detail =
    locale === 'es' ? 'Pasos del día.' : 'Steps for the day.';
  let confidence = 0.5;
  if (typeof avgSteps === 'number' && avgSteps > 0) {
    if (steps >= avgSteps * 1.15) {
      direction = 'positive';
      detail =
        locale === 'es'
          ? 'Más actividad que tu promedio reciente.'
          : 'More activity than your recent average.';
      confidence = 0.65;
    } else if (steps <= avgSteps * 0.7) {
      direction = 'negative';
      detail =
        locale === 'es'
          ? 'Menos actividad que tu promedio reciente.'
          : 'Less activity than your recent average.';
      confidence = 0.6;
    }
  } else if (steps >= 8000) {
    direction = 'positive';
    confidence = 0.45;
  }
  return [
    {
      id: 'daily_activity',
      label: label(locale, 'daily_activity'),
      value: steps.toLocaleString(),
      direction,
      confidence,
      detail
    },
    ...factors
  ];
}

module.exports = {
  buildSleepFactors,
  attachActivityFactor,
  fmtMin
};
