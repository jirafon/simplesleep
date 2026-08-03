const OpenAI = require('openai');

let openai = null;

const RISK_AI_TIMEOUT_MS = Math.min(
  Math.max(parseInt(process.env.RISK_AI_TIMEOUT_MS || '12000', 10) || 12000, 2000),
  30000
);

const isAIAvailable = () => {
  const apiKey = process.env.OPEN_API_KEY?.trim();
  return Boolean(apiKey && apiKey.startsWith('sk-'));
};

const getOpenAIClient = () => {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY.trim() });
  }
  return openai;
};

const safeJsonParse = (value) => {
  try {
    const normalized = String(value)
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');
    return JSON.parse(normalized);
  } catch {
    return null;
  }
};

const asNumber = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.');
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const asIsoDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const toTimestampMs = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

const getMetricValue = (record, paths) => {
  for (const path of paths) {
    const value = path.split('.').reduce((acc, key) => acc?.[key], record?.data);
    const numeric = asNumber(value);
    if (numeric !== null) return numeric;
  }
  return null;
};

const pathOrNull = (source, path) => path.reduce((acc, key) => acc?.[key], source);

const getStressValue = (record) => {
  const numeric = getMetricValue(record, ['stress', 'stressLevel', 'stress_index', 'stressIndex']);
  if (numeric !== null) return numeric;

  const categoricalRaw = pathOrNull(record?.data, ['stress_level', 'stressLevelLabel']);
  const categorical = typeof categoricalRaw === 'string' ? categoricalRaw.toLowerCase() : '';
  if (!categorical) return null;
  if (categorical.includes('alto') || categorical.includes('high')) return 90;
  if (categorical.includes('medio') || categorical.includes('moderate')) return 70;
  if (categorical.includes('bajo') || categorical.includes('low')) return 40;
  return null;
};

const getHrvValue = (record) => getMetricValue(record, ['hrv', 'heartRateVariability', 'rmssd', 'hrvMs']);

const getSleepMinutes = (record) => {
  const direct = getMetricValue(record, [
    'sleepData.totalMinutes',
    'sleepSummary.totalMinutes',
    'totalMinutes'
  ]);
  if (direct !== null) return direct;

  const seconds = getMetricValue(record, ['sleepData.totalSleepDuration']);
  return seconds !== null ? Math.round(seconds / 60) : null;
};

const extractEcgSnapshot = (record) => {
  const cgMobile = record?.data?.cgMobile;
  if (!cgMobile || typeof cgMobile !== 'object') return null;

  const averageHeartRate = asNumber(cgMobile.averageHeartRate);
  const minHeartRate = asNumber(cgMobile.minHeartRate);
  const maxHeartRate = asNumber(cgMobile.maxHeartRate);
  const sampleCount = asNumber(cgMobile.sampleCount);
  const durationSeconds = asNumber(cgMobile.durationSeconds);

  if ([averageHeartRate, minHeartRate, maxHeartRate, sampleCount].every((value) => value === null)) {
    return null;
  }

  return {
    timestamp: asIsoDate(record?.timestamp),
    averageHeartRate,
    minHeartRate,
    maxHeartRate,
    sampleCount,
    durationSeconds,
    source: cgMobile.mode || 'cg_mobile'
  };
};

const extractExerciseSnapshot = (record) => {
  const exercise = record?.data?.exerciseSession;
  if (!exercise || typeof exercise !== 'object') return null;

  const durationSeconds = asNumber(exercise.durationSeconds) ?? asNumber(exercise.durationSec);
  const averageHeartRate = asNumber(exercise.averageHeartRate) ?? asNumber(exercise.avgBpm);
  const calories = asNumber(exercise.calories);
  const distanceMeters = asNumber(exercise.distanceMeters);
  const elevationGainMeters = asNumber(exercise.elevationGainMeters);
  const route = Array.isArray(exercise.route) ? exercise.route : [];

  if ([durationSeconds, averageHeartRate, calories, distanceMeters].every((value) => value === null)) {
    return null;
  }

  const source = exercise.source
    || ((route.length >= 2 || (distanceMeters !== null && distanceMeters > 0)) ? 'gps_phone' : 'watch');

  return {
    timestamp: asIsoDate(record?.timestamp),
    source,
    sportType: asNumber(exercise.sportType),
    sportName: exercise.sportName || exercise.name || '',
    durationSeconds,
    averageHeartRate,
    calories,
    distanceMeters,
    elevationGainMeters,
    hasRoute: Boolean(exercise.hasRoute) || route.length >= 2,
    routePointCount: route.length
  };
};

const formatExerciseDistanceKm = (meters) => {
  if (meters === null || meters <= 0) return null;
  return `${(meters / 1000).toFixed(2)} km`;
};

const buildTrendForMetric = (records, metricKey) => {
  const series = records
    .map((record) => ({
      timestamp: asIsoDate(record?.timestamp),
      value: metricDefinitions.find((m) => m.key === metricKey)?.value(record)
    }))
    .filter((item) => typeof item.value === 'number' && Number.isFinite(item.value));

  if (series.length < 2) return null;

  const latest = series[0];
  const previous = series[1];
  const delta = latest.value - previous.value;

  return {
    metric: metricKey,
    latest: latest.value,
    previous: previous.value,
    delta,
    direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable',
    latestTimestamp: latest.timestamp,
    previousTimestamp: previous.timestamp
  };
};

const buildContextSnapshot = (record, contextRecords = []) => {
  const normalizedRecords = Array.isArray(contextRecords)
    ? contextRecords.filter(Boolean)
    : [];

  const records = normalizedRecords.length ? normalizedRecords : [record].filter(Boolean);
  const sorted = [...records].sort((a, b) => {
    const aTs = toTimestampMs(a?.timestamp) || 0;
    const bTs = toTimestampMs(b?.timestamp) || 0;
    return bTs - aTs;
  });

  const latestTs = sorted[0]?.timestamp ? asIsoDate(sorted[0].timestamp) : null;
  const previousTs = sorted[1]?.timestamp ? asIsoDate(sorted[1].timestamp) : null;
  const recentEcg = sorted.map(extractEcgSnapshot).find(Boolean) || null;
  const recentExercise = sorted.map(extractExerciseSnapshot).find(Boolean) || null;

  return {
    recordsConsidered: sorted.length,
    latestTimestamp: latestTs,
    previousTimestamp: previousTs,
    recentEcg,
    recentExercise,
    trends: [
      buildTrendForMetric(sorted, 'heartRate'),
      buildTrendForMetric(sorted, 'oxygenSaturation'),
      buildTrendForMetric(sorted, 'systolic'),
      buildTrendForMetric(sorted, 'diastolic'),
      buildTrendForMetric(sorted, 'stress'),
      buildTrendForMetric(sorted, 'hrv')
    ].filter(Boolean)
  };
};

const metricDefinitions = [
  {
    key: 'heartRate',
    label: 'Frecuencia cardiaca',
    unit: 'bpm',
    value: (record) => getMetricValue(record, ['heartRate', 'frecuencia_cardiaca', 'heart_rate']),
    evaluate: (value) => {
      if (value >= 130) return ['critical', 'Muy alta'];
      if (value > 100) return ['warning', 'Alta'];
      if (value <= 40) return ['critical', 'Muy baja'];
      if (value < 50) return ['warning', 'Baja'];
      return ['normal', 'Normal'];
    },
    normalRange: '50-100 bpm en reposo'
  },
  {
    key: 'ecgAverageHeartRate',
    label: 'ECG reciente (promedio FC)',
    unit: 'bpm',
    value: (record) => getMetricValue(record, ['cgMobile.averageHeartRate']),
    evaluate: (value) => {
      if (value >= 130) return ['critical', 'Muy alta'];
      if (value > 100) return ['warning', 'Alta'];
      if (value <= 40) return ['critical', 'Muy baja'];
      if (value < 50) return ['warning', 'Baja'];
      return ['normal', 'Normal'];
    },
    normalRange: '50-100 bpm en reposo'
  },
  {
    key: 'exerciseAverageHeartRate',
    label: 'FC en ejercicio reciente',
    unit: 'bpm',
    value: (record) => getMetricValue(record, ['exerciseSession.averageHeartRate', 'exerciseSession.avgBpm']),
    evaluate: (value) => {
      if (value >= 200) return ['critical', 'Muy alta durante esfuerzo'];
      if (value >= 185) return ['warning', 'Elevada durante esfuerzo'];
      if (value < 50) return ['warning', 'Baja para el nivel de actividad'];
      return ['normal', 'Coherente con esfuerzo'];
    },
    normalRange: '60-180 bpm durante actividad'
  },
  {
    key: 'oxygenSaturation',
    label: 'Oxígeno en sangre',
    unit: '%',
    value: (record) => getMetricValue(record, ['oxygenSaturation', 'saturacion_oxigeno', 'spo2', 'bloodOxygen']),
    evaluate: (value) => {
      if (value < 90) return ['critical', 'Críticamente bajo'];
      if (value < 94) return ['warning', 'Bajo'];
      return ['normal', 'Normal'];
    },
    normalRange: '94-100%'
  },
  {
    key: 'temperature',
    label: 'Temperatura',
    unit: '°C',
    value: (record) => getMetricValue(record, ['temperature', 'temperatura', 'temperatura_corporal', 'bodyTemperature']),
    evaluate: (value) => {
      if (value >= 39 || value < 35) return ['critical', value >= 39 ? 'Fiebre alta' : 'Baja'];
      if (value >= 37.8) return ['warning', 'Elevada'];
      return ['normal', 'Normal'];
    },
    normalRange: '35-37.7 °C'
  },
  {
    key: 'systolic',
    label: 'Presión sistólica',
    unit: 'mmHg',
    value: (record) => getMetricValue(record, ['bloodPressure.systolic', 'blood_pressure.systolic', 'presion_arterial_sistolica', 'presion_sistolica']),
    evaluate: (value) => {
      if (value >= 180 || value < 80) return ['critical', value >= 180 ? 'Crítica alta' : 'Muy baja'];
      if (value >= 140 || value < 90) return ['warning', value >= 140 ? 'Alta' : 'Baja'];
      return ['normal', 'Normal'];
    },
    normalRange: '90-139 mmHg'
  },
  {
    key: 'diastolic',
    label: 'Presión diastólica',
    unit: 'mmHg',
    value: (record) => getMetricValue(record, ['bloodPressure.diastolic', 'blood_pressure.diastolic', 'presion_arterial_diastolica', 'presion_diastolica']),
    evaluate: (value) => {
      if (value >= 120 || value < 50) return ['critical', value >= 120 ? 'Crítica alta' : 'Muy baja'];
      if (value >= 90 || value < 60) return ['warning', value >= 90 ? 'Alta' : 'Baja'];
      return ['normal', 'Normal'];
    },
    normalRange: '60-89 mmHg'
  },
  {
    key: 'stress',
    label: 'Estrés',
    unit: 'índice',
    value: getStressValue,
    evaluate: (value) => {
      if (value >= 95) return ['critical', 'Muy alto'];
      if (value >= 85) return ['warning', 'Alto'];
      return ['normal', 'Normal'];
    },
    normalRange: '<85'
  },
  {
    key: 'hrv',
    label: 'HRV',
    unit: 'ms',
    value: getHrvValue,
    evaluate: (value) => {
      if (value <= 15) return ['critical', 'Muy bajo'];
      if (value <= 25) return ['warning', 'Bajo'];
      return ['normal', 'Normal'];
    },
    normalRange: '>25 ms'
  },
  {
    key: 'sleepTotalMinutes',
    label: 'Sueño total',
    unit: 'min',
    value: getSleepMinutes,
    evaluate: (value) => {
      if (value < 180) return ['critical', 'Críticamente bajo'];
      if (value < 360) return ['warning', 'Insuficiente'];
      return ['normal', 'Normal'];
    },
    normalRange: '360-540 min'
  },
  {
    key: 'steps',
    label: 'Pasos',
    unit: 'pasos',
    value: (record) => getMetricValue(record, ['steps', 'steps_today']),
    evaluate: (value) => {
      if (value < 1000) return ['warning', 'Muy bajo'];
      return ['normal', 'Normal'];
    },
    normalRange: '>=1000 al día'
  }
];

const severityRank = { normal: 0, info: 1, warning: 2, critical: 3 };

const isExerciseFocusedRecord = (record) => Boolean(record?.data?.exerciseSession);

const buildRuleAnalysis = (record, options = {}) => {
  const context = buildContextSnapshot(record, options.contextRecords);
  const ecgConsidered = Boolean(context.recentEcg);
  const exerciseConsidered = Boolean(context.recentExercise);

  const measurements = metricDefinitions
    .map((definition) => {
      if (definition.key === 'heartRate' && isExerciseFocusedRecord(record)) {
        return null;
      }
      const value = definition.value(record);
      if (value === null || value === 0) return null;
      const [status, interpretation] = definition.evaluate(value);
      return {
        key: definition.key,
        label: definition.label,
        value,
        unit: definition.unit,
        status,
        interpretation,
        normalRange: definition.normalRange,
        outOfRange: status !== 'normal'
      };
    })
    .filter(Boolean);

  const outOfRange = measurements.filter((item) => item.outOfRange);
  const riskLevel = outOfRange.reduce((level, item) => (
    severityRank[item.status] > severityRank[level] ? item.status : level
  ), 'normal');

  let diagnosis = outOfRange.length
    ? `Se detectan ${outOfRange.length} mediciones fuera de rango: ${outOfRange.map((item) => item.label).join(', ')}.`
    : 'Las mediciones disponibles están dentro de rangos esperados para una lectura general.';

  if (context.recentExercise) {
    const ex = context.recentExercise;
    diagnosis += ` Sesión reciente de ${ex.sportName || 'ejercicio'} (${Math.round((ex.durationSeconds || 0) / 60)} min, FC media ${ex.averageHeartRate ?? '—'} bpm durante actividad).`;
  }

  const recommendations = [
    riskLevel === 'critical'
      ? 'Repetir medición en reposo y considerar evaluación médica inmediata si hay síntomas.'
      : riskLevel === 'warning'
        ? 'Repetir medición, revisar contexto de toma y observar tendencia en las próximas horas.'
        : 'Mantener seguimiento habitual y hábitos de sueño, hidratación y actividad.',
    'Esta interpretación es orientativa y no reemplaza diagnóstico médico.'
  ];

  if (context.recentEcg) {
    recommendations.splice(1, 0, `Se consideró ECG reciente (${context.recentEcg.sampleCount || 0} muestras, ${context.recentEcg.durationSeconds || 0}s).`);
  }

  if (context.recentExercise) {
    const ex = context.recentExercise;
    const distanceLabel = formatExerciseDistanceKm(ex.distanceMeters) || 'sin distancia GPS';
    const sportLabel = ex.sportName || (ex.source === 'gps_phone' ? 'ejercicio GPS' : 'ejercicio');
    recommendations.splice(1, 0, `Se consideró sesión reciente de ${sportLabel} (${Math.round((ex.durationSeconds || 0) / 60)} min, ${distanceLabel}, FC media ${ex.averageHeartRate || '—'} bpm).`);
  }

  if (context.trends.length) {
    recommendations.splice(1, 0, 'El riesgo incorpora tendencia reciente de signos vitales (no solo la última medición).');
  }

  return {
    riskLevel,
    generatedBy: 'rules',
    diagnosis,
    recommendations,
    measurements,
    outOfRange,
    ecgConsidered,
    ecgSummary: context.recentEcg
      ? {
          sampleCount: context.recentEcg.sampleCount,
          durationSeconds: context.recentEcg.durationSeconds,
          averageHeartRate: context.recentEcg.averageHeartRate,
          minHeartRate: context.recentEcg.minHeartRate,
          maxHeartRate: context.recentEcg.maxHeartRate,
          timestamp: context.recentEcg.timestamp
        }
      : null,
    exerciseConsidered,
    exerciseSummary: context.recentExercise
      ? {
          source: context.recentExercise.source,
          sportName: context.recentExercise.sportName,
          durationSeconds: context.recentExercise.durationSeconds,
          averageHeartRate: context.recentExercise.averageHeartRate,
          calories: context.recentExercise.calories,
          distanceMeters: context.recentExercise.distanceMeters,
          elevationGainMeters: context.recentExercise.elevationGainMeters,
          hasRoute: context.recentExercise.hasRoute,
          routePointCount: context.recentExercise.routePointCount,
          timestamp: context.recentExercise.timestamp
        }
      : null,
    context,
    generatedAt: new Date().toISOString()
  };
};

const enrichWithAI = async (record, analysis, options = {}) => {
  if (!isAIAvailable()) return analysis;

  const context = buildContextSnapshot(record, options.contextRecords);

  const recentRecordsSummary = (Array.isArray(options.contextRecords) ? options.contextRecords : [])
    .slice(0, 8)
    .map((item) => ({
      timestamp: asIsoDate(item?.timestamp),
      heartRate: getMetricValue(item, ['heartRate', 'frecuencia_cardiaca', 'heart_rate']),
      oxygenSaturation: getMetricValue(item, ['oxygenSaturation', 'saturacion_oxigeno', 'spo2', 'bloodOxygen']),
      temperature: getMetricValue(item, ['temperature', 'temperatura', 'temperatura_corporal', 'bodyTemperature']),
      steps: getMetricValue(item, ['steps', 'steps_today']),
      sleepMinutes: getSleepMinutes(item),
      stress: getStressValue(item),
      hrv: getHrvValue(item),
      systolic: getMetricValue(item, ['bloodPressure.systolic', 'blood_pressure.systolic', 'presion_arterial_sistolica', 'presion_sistolica']),
      diastolic: getMetricValue(item, ['bloodPressure.diastolic', 'blood_pressure.diastolic', 'presion_arterial_diastolica', 'presion_diastolica']),
      ecg: extractEcgSnapshot(item),
      exercise: extractExerciseSnapshot(item)
    }));

  const prompt = `Analiza estas mediciones biométricas y devuelve SOLO JSON válido con:
{
  "diagnosis": "diagnóstico orientativo, no definitivo",
  "recommendations": ["3 recomendaciones concretas"],
  "riskSummary": "resumen breve"
}

No des diagnóstico definitivo. Indica urgencia si hay valores críticos.
Si hay context.recentEcg, incorpóralo al diagnóstico (ritmo/FC en reposo).
Si hay context.recentExercise, incorpóralo al diagnóstico (esfuerzo, recuperación, FC durante actividad, distancia/altitud GPS si aplica).
Diferencia claramente lecturas en reposo vs durante ejercicio.
Datos:
${JSON.stringify({ timestamp: record.timestamp, analysis, context, recentRecordsSummary }, null, 2)}`;

  try {
    const completion = await Promise.race([
      getOpenAIClient().chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente clínico de triage. Responde en español, breve y prudente. Usa ECG reciente y sesiones de ejercicio/GPS del contexto cuando estén disponibles.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.25,
        max_tokens: 700
      }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`RISK_AI_TIMEOUT_${RISK_AI_TIMEOUT_MS}MS`)), RISK_AI_TIMEOUT_MS);
      })
    ]);
    const parsed = safeJsonParse(completion.choices?.[0]?.message?.content || '');
    if (!parsed) return analysis;
    return {
      ...analysis,
      generatedBy: 'ai',
      diagnosis: parsed.diagnosis || analysis.diagnosis,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : analysis.recommendations,
      riskSummary: parsed.riskSummary || analysis.riskSummary
    };
  } catch (error) {
    console.error('biometric risk AI error:', error.message);
    return analysis;
  }
};

const generateBiometricRiskAnalysis = async (record, options = {}) => {
  const base = buildRuleAnalysis(record, options);
  return enrichWithAI(record, base, options);
};

module.exports = {
  generateBiometricRiskAnalysis,
  buildRuleAnalysis,
  isAIAvailable
};
