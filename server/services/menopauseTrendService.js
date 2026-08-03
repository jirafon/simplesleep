const MS_DAY = 24 * 60 * 60 * 1000;

const avg = (values) => {
  const valid = values.filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (!valid.length) return null;
  return Math.round((valid.reduce((s, v) => s + v, 0) / valid.length) * 10) / 10;
};

const countTrue = (logs, field) => logs.filter((log) => Boolean(log.data?.[field])).length;

const trendDirection = (current, previous) => {
  if (current === null || previous === null) return 'unknown';
  if (current > previous * 1.15) return 'up';
  if (current < previous * 0.85) return 'down';
  return 'stable';
};

const splitWeeks = (logs) => {
  const now = Date.now();
  const weekMs = 7 * MS_DAY;

  const thisWeek = logs.filter((log) => now - new Date(log.logDate).getTime() <= weekMs);
  const lastWeek = logs.filter((log) => {
    const age = now - new Date(log.logDate).getTime();
    return age > weekMs && age <= weekMs * 2;
  });

  return { thisWeek, lastWeek };
};

const fieldAvg = (logs, field) => avg(logs.map((log) => log.data?.[field]));

const buildBiometricWeekTrend = (dailySummaries = []) => {
  const now = Date.now();
  const weekMs = 7 * MS_DAY;

  const thisWeek = dailySummaries.filter((day) => now - new Date(day.dayKey).getTime() <= weekMs);
  const lastWeek = dailySummaries.filter((day) => {
    const age = now - new Date(day.dayKey).getTime();
    return age > weekMs && age <= weekMs * 2;
  });

  return {
    stress: {
      thisWeek: avg(thisWeek.map((d) => d.stressAvg)),
      lastWeek: avg(lastWeek.map((d) => d.stressAvg))
    },
    hrv: {
      thisWeek: avg(thisWeek.map((d) => d.hrvAvg)),
      lastWeek: avg(lastWeek.map((d) => d.hrvAvg))
    },
    sleepMinutes: {
      thisWeek: avg(thisWeek.map((d) => d.sleepMinutes)),
      lastWeek: avg(lastWeek.map((d) => d.sleepMinutes))
    },
    heartRate: {
      thisWeek: avg(thisWeek.map((d) => d.heartRateAvg)),
      lastWeek: avg(lastWeek.map((d) => d.heartRateAvg))
    }
  };
};

const analyzeMenopauseTrends = (menopauseLogs = [], biometrics = {}) => {
  const { thisWeek, lastWeek } = splitWeeks(menopauseLogs);
  const biometricWeeks = buildBiometricWeekTrend(biometrics.dailySummaries || []);

  const metrics = {
    hotFlashes: {
      label: 'Bochornos',
      thisWeek: fieldAvg(thisWeek, 'hotFlashes'),
      lastWeek: fieldAvg(lastWeek, 'hotFlashes'),
      unit: 'por día'
    },
    nightSweats: {
      label: 'Sudoración nocturna',
      thisWeek: countTrue(thisWeek, 'nightSweats'),
      lastWeek: countTrue(lastWeek, 'nightSweats'),
      unit: 'días'
    },
    sleepInterrupted: {
      label: 'Sueño interrumpido',
      thisWeek: fieldAvg(thisWeek, 'sleepInterrupted'),
      lastWeek: fieldAvg(lastWeek, 'sleepInterrupted'),
      unit: '1-5'
    },
    mood: {
      label: 'Cambios de ánimo',
      thisWeek: fieldAvg(thisWeek, 'mood'),
      lastWeek: fieldAvg(lastWeek, 'mood'),
      unit: '1-5'
    },
    fatigue: {
      label: 'Fatiga',
      thisWeek: fieldAvg(thisWeek, 'fatigue'),
      lastWeek: fieldAvg(lastWeek, 'fatigue'),
      unit: '1-5'
    },
    brainFog: {
      label: 'Brain fog',
      thisWeek: fieldAvg(thisWeek, 'brainFog'),
      lastWeek: fieldAvg(lastWeek, 'brainFog'),
      unit: '1-5'
    },
    stressLevel: {
      label: 'Estrés percibido',
      thisWeek: fieldAvg(thisWeek, 'stressLevel'),
      lastWeek: fieldAvg(lastWeek, 'stressLevel'),
      unit: '1-5'
    }
  };

  Object.keys(metrics).forEach((key) => {
    const m = metrics[key];
    m.direction = trendDirection(m.thisWeek, m.lastWeek);
  });

  const symptomFrequency = {
    palpitations: countTrue(thisWeek, 'palpitations'),
    weightGain: countTrue(thisWeek, 'weightGain'),
    bloodPressureChange: countTrue(thisWeek, 'bloodPressureChange'),
    menstrualIrregularity: countTrue(thisWeek, 'menstrualIrregularity'),
    vaginalDryness: countTrue(thisWeek, 'vaginalDryness')
  };

  const patternAlerts = [];

  if (metrics.hotFlashes.direction === 'up' && metrics.sleepInterrupted.direction === 'up') {
    patternAlerts.push({
      code: 'hot_flashes_sleep',
      severity: 'warning',
      message: 'Tus despertares nocturnos aumentaron esta semana y registraste más bochornos. Prueba reducir alcohol/cafeína en la tarde, mantener la habitación fresca y registrar si los síntomas se repiten.'
    });
  }

  if (metrics.nightSweats.thisWeek >= 3 && metrics.sleepInterrupted.direction === 'up') {
    patternAlerts.push({
      code: 'night_sweats_sleep',
      severity: 'warning',
      message: 'La sudoración nocturna fue frecuente esta semana junto con sueño más interrumpido. Ropa ligera en capas, ambiente fresco y evitar cenas pesadas pueden ayudar.'
    });
  }

  if (metrics.mood.direction === 'down' || metrics.fatigue.direction === 'up') {
    patternAlerts.push({
      code: 'mood_fatigue',
      severity: 'info',
      message: 'Detectamos más fatiga o baja en el ánimo esta semana. Caminatas suaves, horarios de sueño regulares y pausas durante el día pueden apoyar tu bienestar emocional.'
    });
  }

  if (metrics.brainFog.direction === 'up') {
    patternAlerts.push({
      code: 'brain_fog',
      severity: 'info',
      message: 'Reportaste más dificultad de concentración. Listas cortas, descansos y reducir multitarea pueden facilitar el día a día.'
    });
  }

  if (biometricWeeks.stress.thisWeek && biometricWeeks.stress.lastWeek
    && biometricWeeks.stress.thisWeek > biometricWeeks.stress.lastWeek * 1.1) {
    patternAlerts.push({
      code: 'wearable_stress',
      severity: 'info',
      message: 'Tu pulsera muestra estrés promedio más alto esta semana. Considera técnicas de relajación antes de dormir.'
    });
  }

  if (biometricWeeks.hrv.thisWeek && biometricWeeks.hrv.lastWeek
    && biometricWeeks.hrv.thisWeek < biometricWeeks.hrv.lastWeek * 0.9) {
    patternAlerts.push({
      code: 'recovery_drop',
      severity: 'info',
      message: 'Tu HRV bajó respecto a la semana anterior, lo que puede reflejar peor recuperación. Prioriza descanso e hidratación.'
    });
  }

  if (symptomFrequency.palpitations >= 2) {
    patternAlerts.push({
      code: 'palpitations',
      severity: 'warning',
      message: 'Registraste palpitaciones varias veces esta semana. Si son intensas o persistentes, consulta con tu médico.'
    });
  }

  return {
    thisWeekLogCount: thisWeek.length,
    lastWeekLogCount: lastWeek.length,
    metrics,
    symptomFrequency,
    biometricWeeks,
    patternAlerts
  };
};

module.exports = {
  analyzeMenopauseTrends
};
