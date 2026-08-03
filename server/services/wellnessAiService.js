const OpenAI = require('openai');
const { predictCycle } = require('./cyclePredictionService');
const { analyzeMenopauseTrends } = require('./menopauseTrendService');
const { getSportDefinition, buildSportFallbackFocus } = require('../data/wellnessSports');

let openai = null;

const getOpenAIClient = () => {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY.trim() });
  }
  return openai;
};

const isAIAvailable = () => {
  const apiKey = process.env.OPEN_API_KEY?.trim();
  return Boolean(apiKey && apiKey.startsWith('sk-'));
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

const callWellnessAI = async (systemPrompt, userPrompt, maxTokens = 1200) => {
  if (!isAIAvailable()) {
    return null;
  }

  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.35,
      max_tokens: maxTokens
    });

    const content = completion.choices?.[0]?.message?.content || '';
    return safeJsonParse(content);
  } catch (error) {
    console.error('Wellness AI error:', error.message);
    return null;
  }
};

const DETOX_45_DAY_PLAN = {
  title: 'Manual Personal Detox 45 días',
  summary: 'Plan simple, alto en proteína y de baja carga inflamatoria para cocinar poco y sostener hábitos durante 45 días.',
  durationDays: 45,
  fridgeBase: [
    'Yogurt griego natural',
    'Muffins o queque de plátano + huevos + cacao + harina de coco o avena',
    'Huevos',
    'Trucha',
    'Almendras tostadas',
    'Leche descremada sin lactosa',
    'Cilantro y ciboulette'
  ],
  weeklyPrep: [
    'Preparar yogurt',
    'Preparar muffins o queque detox',
    'Preparar couscous',
    'Dejar huevos cocidos'
  ],
  basePlates: [
    {
      name: 'Yogurt dulce',
      ingredients: 'Yogurt + plátano + cacao + cranberries + almendras'
    },
    {
      name: 'Yogurt salado',
      ingredients: 'Yogurt + aceite de oliva + cilantro + ciboulette + pimienta + mostaza + merkén'
    },
    {
      name: 'Couscous detox',
      ingredients: 'Couscous + yogurt + cilantro + ciboulette + curry o cúrcuma + carne slices'
    },
    {
      name: 'Trucha',
      ingredients: 'Trucha + pimienta + merkén + ciboulette + pimentón'
    },
    {
      name: 'Muffin detox',
      ingredients: 'Plátano + huevos + cacao + harina de coco o avena'
    }
  ],
  allowedFoods: {
    proteinas: ['Huevos', 'Trucha', 'Carne roja ocasional', 'Yogurt griego'],
    grasas: ['Almendras', 'Aceite de oliva solo para aderezar', 'Mantequilla de maní'],
    vegetalesEspecias: ['Cilantro', 'Ciboulette', 'Pimentón', 'Rocoto', 'Cúrcuma', 'Curry', 'Merkén', 'Mostaza', 'Pimienta'],
    otros: ['Café', 'Agua', 'Agua tónica cero']
  },
  prohibitedFoods: [
    'Azúcar',
    'Endulzantes',
    'Alcohol',
    'Pan',
    'Harinas refinadas',
    'Tallarines',
    'Arroz',
    'Quesos',
    'Cecinas',
    'Mayonesa',
    'Mantequilla',
    'Aceite para cocinar',
    'Pollo',
    'Salmón',
    'Bebidas con sabor'
  ],
  rules: [
    'Última comida a las 19:00.',
    'Si aparece hambre, usar un trozo de muffin detox como apoyo.',
    'Base diaria: yogurt, huevos, trucha y muffins.'
  ],
  phases: [
    {
      range: 'Días 1-15',
      focus: 'Adaptación y limpieza del refrigerador',
      actions: [
        'Armar la base del refrigerador y retirar prohibidos visibles.',
        'Repetir platos base sin buscar variedad excesiva.',
        'Registrar hambre, sueño y energía para ajustar porciones.'
      ]
    },
    {
      range: 'Días 16-30',
      focus: 'Consistencia metabólica',
      actions: [
        'Mantener preparación semanal de 1 hora.',
        'Usar yogurt salado o couscous detox como comida rápida.',
        'Priorizar proteína en cada comida y agua durante el día.'
      ]
    },
    {
      range: 'Días 31-45',
      focus: 'Consolidación y salida ordenada',
      actions: [
        'Revisar biométricos: sueño, pasos, estrés y recuperación.',
        'Mantener prohibidos fuera hasta terminar el día 45.',
        'Elegir 3 platos base para sostener después del plan.'
      ]
    }
  ],
  benefits: [
    'No pasar hambre',
    'Cocinar poco',
    'Alta proteína',
    'Baja inflamación',
    'Detox metabólico'
  ],
  disclaimer: 'Plan de hábitos alimentarios. Ajustar ante alergias, enfermedades, embarazo, lactancia o indicación médica.'
};

const getTodayHabitCompletions = (habitLogs = []) => {
  const today = new Date().toDateString();
  return habitLogs
    .filter((log) => new Date(log.logDate).toDateString() === today && log.data?.type === 'habit_check')
    .reduce((acc, log) => {
      if (log.data?.habitId) {
        acc[log.data.habitId] = true;
      }
      return acc;
    }, {});
};

const buildHabitReminderPlan = (biometrics, profile, habitLogs = []) => {
  const avgSteps = biometrics.averages?.steps || biometrics.latest?.stepsMax || 0;
  const avgSleep = biometrics.averages?.sleepMinutes || biometrics.latest?.sleepMinutes || 0;
  const avgStress = biometrics.averages?.stress || biometrics.latest?.stressAvg || null;
  const goalSteps = profile?.activityGoalSteps || 8000;
  const goalSleep = profile?.sleepGoalMinutes || 480;
  const completed = getTodayHabitCompletions(habitLogs);

  const triggers = [];
  if (avgSleep && avgSleep < goalSleep * 0.85) {
    triggers.push('Sueño bajo detectado por la pulsera: hoy conviene adelantar la última comida y bajar intensidad.');
  }
  if (avgStress && avgStress > 60) {
    triggers.push('Estrés elevado detectado: prioriza agua, comida simple y respiración breve antes de comer.');
  }
  if (avgSteps && avgSteps < goalSteps * 0.6) {
    triggers.push('Actividad baja detectada: agrega una caminata suave después de una comida.');
  }
  if (!triggers.length && biometrics.hasData) {
    triggers.push('Pulsera estable: mantén el plan base y registra adherencia.');
  }

  const dailyChecklist = [
    {
      id: 'detox_yogurt_base',
      label: 'Consumir base diaria de yogurt griego',
      time: '08:00',
      source: 'Plan 45 días',
      completed: Boolean(completed.detox_yogurt_base)
    },
    {
      id: 'detox_hydration_morning',
      label: 'Tomar agua al despertar y dejar botella visible',
      time: '09:00',
      source: 'Pulsera + hidratación',
      completed: Boolean(completed.detox_hydration_morning)
    },
    {
      id: 'detox_protein_main',
      label: 'Asegurar proteína del día: huevos o trucha',
      time: '13:00',
      source: 'Plan 45 días',
      completed: Boolean(completed.detox_protein_main)
    },
    {
      id: 'detox_last_meal',
      label: 'Cerrar última comida antes de las 19:00',
      time: '18:30',
      source: avgSleep && avgSleep < goalSleep * 0.85 ? 'Sueño detectado por pulsera' : 'Regla del plan',
      completed: Boolean(completed.detox_last_meal)
    },
    {
      id: 'detox_movement_after_meal',
      label: avgSteps && avgSteps < goalSteps * 0.6
        ? 'Caminata suave 10-15 min para activar pasos'
        : 'Movilidad o caminata ligera para sostener el hábito',
      time: '19:15',
      source: 'Pasos detectados por pulsera',
      completed: Boolean(completed.detox_movement_after_meal)
    }
  ];

  const nextReminder = dailyChecklist.find((item) => !item.completed) || null;

  return {
    title: 'Recordatorios inteligentes del plan',
    summary: biometrics.hasData
      ? 'La pulsera ajusta los recordatorios usando sueño, estrés y pasos recientes.'
      : 'Conecta la pulsera para que los recordatorios se ajusten con biométricos.',
    triggers,
    dailyChecklist,
    nextReminder
  };
};

const buildFallbackHabitRecommendations = (biometrics, profile, hydrationLogs = []) => {
  const avgSteps = biometrics.averages?.steps || biometrics.latest?.stepsMax || 0;
  const avgSleep = biometrics.averages?.sleepMinutes || biometrics.latest?.sleepMinutes || 0;
  const avgStress = biometrics.averages?.stress || biometrics.latest?.stressAvg || null;
  const goalSteps = profile?.activityGoalSteps || 8000;
  const goalSleep = profile?.sleepGoalMinutes || 480;
  const goalWater = profile?.hydrationGoalMl || 2000;
  const mode = profile?.habitsGoalMode || 'healthy_life';
  const sportFocus = buildSportFallbackFocus(profile);
  const sport = getSportDefinition(profile?.primarySport || (mode === 'athlete' ? 'run' : 'vida_sana'));
  const habitReminders = buildHabitReminderPlan(biometrics, profile, hydrationLogs);

  const todayWater = hydrationLogs
    .filter((log) => {
      const d = new Date(log.logDate);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    })
    .reduce((sum, log) => sum + (log.data?.ml || 0), 0);

  const trainingRecommendations = mode === 'athlete'
    ? [
        `Enfócate en ${sport.label.toLowerCase()} ${profile?.weeklyTrainingDays || 3} días/semana con progresión gradual.`,
        ...sportFocus.recommendations.slice(0, 2),
        'Registra sesiones en la pulsera para ajustar carga según sueño y HRV.'
      ]
    : [
        avgSteps < goalSteps * 0.6
          ? 'Empieza con 15–20 min diarios de caminata o movilidad; sube 5 min cada semana.'
          : 'Mantén constancia e incorpora 1 actividad complementaria nueva esta semana.',
        ...sportFocus.recommendations.slice(0, 2)
      ];

  return {
    aiUsed: false,
    sportFocus,
    categories: {
      entrenamiento: {
        score: avgSteps ? Math.min(100, Math.round((avgSteps / goalSteps) * 100)) : null,
        summary: mode === 'athlete'
          ? `Modo deportista · ${sport.label} · nivel ${profile?.sportLevel || 'beginner'}.`
          : avgSteps
            ? `Vida sana · promedio ${Math.round(avgSteps)} pasos en los últimos días.`
            : 'Vida sana · sin datos de actividad del wearable.',
        recommendations: trainingRecommendations
      },
      sueno: {
        score: avgSleep ? Math.min(100, Math.round((avgSleep / goalSleep) * 100)) : null,
        summary: avgSleep
          ? `Sueño promedio de ${Math.floor(avgSleep / 60)}h ${avgSleep % 60}m.`
          : 'Sin datos de sueño del wearable.',
        recommendations: [
          'Mantén horario fijo de dormir y despertar.',
          'Evita pantallas 60 minutos antes de acostarte.',
          avgStress && avgStress > 60 ? 'Prueba respiración 4-7-8 si el estrés está elevado.' : 'Ambiente oscuro y fresco para mejor descanso.'
        ]
      },
      alimentacion: {
        score: null,
        summary: `${DETOX_45_DAY_PLAN.title}: proteína alta, cocina simple y reglas claras durante 45 días.`,
        recommendations: [
          'Prepara una vez por semana yogurt, muffins/queque, couscous y huevos cocidos.',
          'Usa platos base: yogurt dulce o salado, couscous detox, trucha y muffin detox.',
          avgStress && avgStress > 55 ? 'Mantén última comida 19:00 y reduce café si altera sueño o estrés.' : 'Mantén última comida 19:00 y usa muffin detox si aparece hambre.'
        ]
      },
      hidratacion: {
        score: todayWater ? Math.min(100, Math.round((todayWater / goalWater) * 100)) : null,
        summary: todayWater
          ? `Has registrado ${todayWater} ml hoy (meta ${goalWater} ml).`
          : `Meta diaria sugerida: ${goalWater} ml.`,
        recommendations: [
          'Bebe un vaso de agua al despertar.',
          'Lleva botella visible y configura recordatorios cada 2 horas.',
          'Aumenta ingesta si entrenas o hace calor.'
        ]
      }
    },
    nutritionPlan: DETOX_45_DAY_PLAN,
    habitReminders,
    priorityAction: avgSleep && avgSleep < goalSleep * 0.85
      ? 'Prioriza mejorar el sueño esta semana: es la base de recuperación y hábitos.'
      : 'Mantén constancia en movimiento e hidratación durante la semana.',
    disclaimer: 'Orientación de bienestar. No reemplaza evaluación médica ni nutricional personalizada.'
  };
};

const generateHabitRecommendations = async ({ user, profile, biometrics, hydrationLogs = [] }) => {
  const fallback = buildFallbackHabitRecommendations(biometrics, profile, hydrationLogs);
  const mode = profile?.habitsGoalMode || 'healthy_life';
  const sport = getSportDefinition(profile?.primarySport || (mode === 'athlete' ? 'run' : 'vida_sana'));

  const payload = {
    user: {
      name: user?.name,
      gender: user?.gender,
      age: user?.dateOfBirth ? Math.floor((Date.now() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null
    },
    goals: {
      steps: profile?.activityGoalSteps || 8000,
      sleepMinutes: profile?.sleepGoalMinutes || 480,
      hydrationMl: profile?.hydrationGoalMl || 2000
    },
    sportProfile: {
      mode,
      modeLabel: mode === 'athlete' ? 'Deportista' : 'Vida sana',
      primarySport: profile?.primarySport,
      sportLabel: sport.label,
      sportFocusAreas: sport.focus,
      level: profile?.sportLevel || 'beginner',
      weeklyTrainingDays: profile?.weeklyTrainingDays || 3
    },
    biometrics: {
      hasData: biometrics.hasData,
      averages: biometrics.averages,
      latest: biometrics.latest,
      recentDays: biometrics.dailySummaries?.slice(0, 7) || []
    },
    hydrationTodayMl: hydrationLogs
      .filter((log) => new Date(log.logDate).toDateString() === new Date().toDateString())
      .reduce((sum, log) => sum + (log.data?.ml || 0), 0)
  };

  const modeInstructions = mode === 'athlete'
    ? `El usuario es DEPORTISTA y quiere mejorar en ${sport.label}. Personaliza entrenamiento, recuperación, alimentación e hidratación para ese deporte y nivel. Incluye consejos técnicos y de prevención de lesiones cuando aplique.`
    : `El usuario busca VIDA SANA. Promueve actividades complementarias accesibles, rutinas de inicio progresivas y hábitos sostenibles. Evita lenguaje de alto rendimiento.`;

  const parsed = await callWellnessAI(
    'Eres un coach de hábitos saludables en Chile. Usas datos biométricos de pulsera (FC, HRV, estrés, pasos, sueño) para personalizar consejos. No diagnosticas. Respondes SOLO JSON válido.',
    `Genera recomendaciones de hábitos en español con esta forma exacta:
{
  "categories": {
    "entrenamiento": { "score": 0-100|null, "summary": "string", "recommendations": ["string","string"] },
    "sueno": { "score": 0-100|null, "summary": "string", "recommendations": ["string","string","string"] },
    "alimentacion": { "score": 0-100|null, "summary": "string", "recommendations": ["string","string","string"] },
    "hidratacion": { "score": 0-100|null, "summary": "string", "recommendations": ["string","string","string"] }
  },
  "sportFocus": {
    "title": "string",
    "summary": "string",
    "recommendations": ["string","string","string"],
    "complementaryActivities": ["string","string","string"],
    "warmupRoutine": { "title": "string", "steps": ["string","string","string"] }
  },
  "nutritionPlanNotes": ["string","string","string"],
  "habitReminderNotes": ["string","string","string"],
  "priorityAction": "string",
  "disclaimer": "string breve"
}

Datos:
${JSON.stringify(payload, null, 2)}

${modeInstructions}

Reglas: máximo 3 recomendaciones por categoría; score null si no hay datos; tono empático y práctico; sportFocus debe reflejar el deporte o plan vida sana con rutina de calentamiento/inicio concreta.`
  );

  if (!parsed?.categories) {
    return fallback;
  }

  return {
    aiUsed: true,
    ...parsed,
    sportFocus: parsed.sportFocus || fallback.sportFocus,
    nutritionPlan: {
      ...DETOX_45_DAY_PLAN,
      aiNotes: parsed.nutritionPlanNotes || []
    },
    habitReminders: {
      ...fallback.habitReminders,
      aiNotes: parsed.habitReminderNotes || []
    },
    disclaimer: parsed.disclaimer || fallback.disclaimer
  };
};

const buildFallbackCycleRecommendations = (predictions, biometrics, recentLogs) => {
  const tips = [];

  if (predictions.isInFertileWindow) {
    tips.push('Estás en ventana fértil estimada. Si buscas concebir, este es un periodo clave.');
  }
  if (predictions.isInPeriod) {
    tips.push('Durante el periodo, prioriza descanso, hierro en alimentación e hidratación.');
  }
  if (biometrics.averages?.stress > 55) {
    tips.push('El estrés elevado puede influir en el ciclo. Incorpora pausas respiratorias diarias.');
  }
  if (biometrics.averages?.sleepMinutes && biometrics.averages.sleepMinutes < 420) {
    tips.push('El sueño corto puede afectar regularidad hormonal. Intenta acostarte 30 min antes esta semana.');
  }

  const symptoms = recentLogs.flatMap((log) => log.data?.symptoms || []);
  if (symptoms.includes('cólicos') || symptoms.includes('colicos')) {
    tips.push('Para cólicos leves: calor local, movimiento suave y consultar si el dolor es incapacitante.');
  }

  return {
    aiUsed: false,
    aiInsight: predictions.hasPrediction
      ? `Próximo periodo estimado: ${predictions.nextPeriodStart}. Ventana fértil: ${predictions.fertileWindowStart} a ${predictions.fertileWindowEnd}.`
      : 'Registra el inicio de tu periodo para obtener predicciones personalizadas.',
    recommendations: tips.length ? tips : [
      'Registra síntomas diarios para mejorar las recomendaciones.',
      'Combina calendario del ciclo con datos de sueño y estrés del wearable.',
      'Consulta a tu ginecólogo ante ciclos irregulares persistentes.'
    ],
    symptomTips: [
      'Registra flujo, dolor, humor y energía cada día.',
      'La predicción es orientativa; no sustituye métodos anticonceptivos ni planificación clínica.'
    ],
    disclaimer: 'Predicción calendario orientativa. No es anticoncepción ni diagnóstico médico.'
  };
};

const generateCycleRecommendations = async ({ user, profile, biometrics, cycleLogs = [] }) => {
  const predictions = predictCycle(profile, cycleLogs);
  const recentLogs = cycleLogs.slice(0, 14);
  const fallback = buildFallbackCycleRecommendations(predictions, biometrics, recentLogs);

  const payload = {
    user: { name: user?.name, gender: user?.gender },
    profile: {
      cycleLengthDays: profile?.cycleLengthDays,
      periodLengthDays: profile?.periodLengthDays,
      lastPeriodStart: profile?.lastPeriodStart
    },
    predictions,
    biometrics: {
      averages: biometrics.averages,
      latest: biometrics.latest
    },
    recentLogs: recentLogs.map((log) => ({
      date: log.logDate,
      ...log.data
    }))
  };

  const parsed = await callWellnessAI(
    'Eres asistente de salud femenina para seguimiento de ciclo menstrual y fertilidad en Chile. Das orientación prudente, no diagnósticos ni anticoncepción médica. Respondes SOLO JSON válido.',
    `Genera recomendaciones en español con esta forma:
{
  "aiInsight": "string breve integrando ciclo + biométricos",
  "recommendations": ["string","string","string"],
  "symptomTips": ["string","string"],
  "disclaimer": "string"
}

Datos:
${JSON.stringify(payload, null, 2)}`
  );

  return {
    predictions,
    ...(parsed || fallback),
    aiUsed: Boolean(parsed),
    disclaimer: parsed?.disclaimer || fallback.disclaimer
  };
};

const buildFallbackMenopauseRecommendations = (biometrics, recentLogs, trends) => {
  const tips = [];
  const lifestyleTips = [
    'Mantén horarios regulares de sueño y despertar, incluso fines de semana.',
    'Viste capas de ropa para manejar bochornos y mantén ventilación en el dormitorio.',
    'Actividad física moderada (caminata, yoga) puede mejorar ánimo y sueño.',
    'Limita alcohol, cafeína y comidas picantes especialmente en la tarde-noche.'
  ];
  const seekMedicalCare = [
    'Sangrado abundante o muy prolongado.',
    'Palpitaciones intensas, dolor torácico o mareos frecuentes.',
    'Síntomas que afectan gravemente sueño, ánimo o calidad de vida.',
    'Síntomas que no mejoran con cambios de estilo de vida.'
  ];

  (trends?.patternAlerts || []).forEach((alert) => tips.push(alert.message));

  if (trends?.metrics?.hotFlashes?.thisWeek >= 3 && !tips.length) {
    tips.push('Bochornos frecuentes: evita desencadenantes (café, alcohol, estrés) y mantén ambiente fresco.');
  }
  if (biometrics.averages?.sleepMinutes && biometrics.averages.sleepMinutes < 390) {
    tips.push('Sueño corto según tu pulsera: prioriza rutina nocturna y temperatura fresca en la habitación.');
  }
  if (biometrics.averages?.stress > 50) {
    tips.push('Estrés elevado en biométricos: prueba respiración diafragmática 5 min antes de dormir.');
  }

  const personalizedMessage = trends?.patternAlerts?.[0]?.message
    || (trends?.metrics?.hotFlashes?.thisWeek
      ? `Esta semana registraste un promedio de ${trends.metrics.hotFlashes.thisWeek} bochornos por día. Lleva un registro de desencadenantes y considera ajustes de estilo de vida; consulta a tu médica si persisten.`
      : 'Registra tus síntomas a diario para recibir recomendaciones personalizadas que integren tu pulsera y tus registros.');

  return {
    aiUsed: false,
    personalizedMessage,
    aiInsight: personalizedMessage,
    weeklyTrends: trends,
    recommendations: tips.length ? tips : [
      'Registra bochornos, sueño, ánimo y fatiga cada día para detectar patrones.',
      'Los cambios de estilo de vida pueden ayudar con sueño, bochornos y ánimo; algunas mujeres requieren tratamiento médico.',
      'Combina tu registro con HRV, estrés y sueño del wearable para ver correlaciones.'
    ],
    lifestyleTips,
    symptomTips: [
      'Escala bochornos y anota desencadenantes (café, alcohol, cenas tardías, estrés).',
      'La sequedad vaginal es opcional de registrar; solo si tú decides hacerlo.',
      'Brain fog suele mejorar con sueño regular, hidratación y pausas cognitivas.'
    ],
    seekMedicalCare,
    disclaimer: 'Orientación de bienestar basada en Mayo Clinic y guías generales de menopausia/perimenopausia. No reemplaza evaluación ni tratamiento médico personalizado.'
  };
};

const generateMenopauseRecommendations = async ({ user, profile, biometrics, menopauseLogs = [] }) => {
  const recentLogs = menopauseLogs.slice(0, 30);
  const trends = analyzeMenopauseTrends(recentLogs, biometrics);
  const fallback = buildFallbackMenopauseRecommendations(biometrics, recentLogs, trends);

  const payload = {
    user: {
      name: user?.name,
      age: user?.dateOfBirth
        ? Math.floor((Date.now() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
        : null
    },
    profile: {
      menopauseStage: profile?.menopauseStage,
      menopauseActive: profile?.menopauseActive
    },
    weeklyTrends: trends,
    biometrics: {
      averages: biometrics.averages,
      dailySummaries: biometrics.dailySummaries?.slice(0, 14) || []
    },
    recentLogs: recentLogs.map((log) => ({
      date: log.logDate,
      hotFlashes: log.data?.hotFlashes,
      nightSweats: log.data?.nightSweats,
      nightSweatEpisodes: log.data?.nightSweatEpisodes,
      sleepInterrupted: log.data?.sleepInterrupted,
      sleepQuality: log.data?.sleepQuality,
      mood: log.data?.mood,
      fatigue: log.data?.fatigue,
      energy: log.data?.energy,
      palpitations: log.data?.palpitations,
      weightGain: log.data?.weightGain,
      bloodPressureChange: log.data?.bloodPressureChange,
      recoveryChange: log.data?.recoveryChange,
      stressLevel: log.data?.stressLevel,
      menstrualIrregularity: log.data?.menstrualIrregularity,
      vaginalDryness: log.data?.vaginalDryness,
      brainFog: log.data?.brainFog,
      notes: log.data?.notes
    })),
    clinicalContext: 'Síntomas comunes perimenopausia/menopausia: periodos irregulares, bochornos, sudoración nocturna, sueño interrumpido, cambios de ánimo, fatiga, palpitaciones, brain fog. Estilo de vida puede ayudar; algunas mujeres necesitan tratamiento médico.'
  };

  const parsed = await callWellnessAI(
    'Eres acompañante digital para mujeres en perimenopausia y menopausia en Chile. Integras registros de síntomas, tendencias semanales y biométricos (sueño, HRV, estrés, FC, presión referencial). Das orientación prudente al estilo Mayo Clinic: estilo de vida primero, derivar a médico cuando corresponde. No prescribes hormonas ni diagnosticas. Respondes SOLO JSON válido.',
    `Genera recomendaciones en español con esta forma:
{
  "personalizedMessage": "string narrativo en 2-3 frases, como: Tus despertares nocturnos aumentaron esta semana y registraste bochornos. Prueba reducir alcohol/cafeína...",
  "aiInsight": "string breve resumen",
  "recommendations": ["string","string","string"],
  "lifestyleTips": ["string","string","string","string"],
  "symptomTips": ["string","string"],
  "seekMedicalCare": ["string","string"],
  "disclaimer": "string"
}

Usa weeklyTrends.patternAlerts y métricas up/down. Menciona síntomas registrados cuando existan.

Datos:
${JSON.stringify(payload, null, 2)}`
  );

  return {
    weeklyTrends: trends,
    ...(parsed || fallback),
    personalizedMessage: parsed?.personalizedMessage || parsed?.aiInsight || fallback.personalizedMessage,
    lifestyleTips: parsed?.lifestyleTips || fallback.lifestyleTips,
    seekMedicalCare: parsed?.seekMedicalCare || fallback.seekMedicalCare,
    aiUsed: Boolean(parsed),
    disclaimer: parsed?.disclaimer || fallback.disclaimer
  };
};

module.exports = {
  generateHabitRecommendations,
  generateCycleRecommendations,
  generateMenopauseRecommendations,
  isAIAvailable
};
