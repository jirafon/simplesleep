/**
 * Sleep API locale messages — EN default, ES via Accept-Language / ?lang=
 */

const MESSAGES = {
  en: {
    'disclaimer.association':
      'Personal association — not medical causation or diagnosis.',
    'disclaimer.associationOnly':
      'Personal association only — not medical causation, diagnosis, or treatment advice.',
    'goal.more_energy': 'Wake up with more energy',
    'goal.fewer_interruptions': 'Reduce nighttime interruptions',
    'goal.regular_schedule': 'Maintain a regular sleep schedule',
    'goal.bedtime_routine': 'Build a better bedtime routine',
    'goal.understand_factors': 'Understand what affects my sleep',
    'quality.restorative': 'restorative',
    'quality.good': 'good',
    'quality.fair': 'fair',
    'quality.challenging': 'challenging',
    'rec.windDown': 'Start your wind-down routine at {{time}}.',
    'rec.interrupted':
      'Your sleep was more interrupted than usual. Guarding a calmer wind-down may help tonight.',
    'rec.short':
      'You slept less than your goal. An earlier wind-down often tracks with longer nights for you.',
    'rec.late':
      'You went to bed later than your usual pattern. Aiming closer to your target bedtime is a gentle next step.',
    'rec.default':
      'Keep your evening check-in and a steady bedtime — small habits compound.',
    'factor.duration': 'Duration',
    'factor.duration.short': 'Shorter than your sleep goal',
    'factor.duration.ok': 'Close to your sleep goal',
    'factor.regularity': 'Regularity',
    'factor.regularity.detail': 'Bedtime vs your recent average',
    'factor.continuity': 'Continuity',
    'factor.continuity.detail': 'Interruptions / time awake',
    'factor.bedtime': 'Bedtime',
    'factor.bedtime.detail': 'Distance from your target bedtime',
    'factor.hr': 'Night heart rate',
    'factor.hr.detail': 'Vs your personal night baseline',
    'factor.subjective': 'Morning feeling',
    'factor.subjective.detail': 'How you said you felt this morning',
    'score.disclaimer':
      'Sleep Score reflects your patterns and habits — not a medical diagnosis.',
    'insight.caffeine_after_3_later_sleep.title': 'Caffeine timing',
    'insight.caffeine_after_3_later_sleep.body':
      'On days when you drank caffeine after 3 PM, your sleep started later (about {{minutes}} minutes later on average in your logs).',
    'insight.alcohol_more_interruptions.title': 'Alcohol and continuity',
    'insight.alcohol_more_interruptions.body':
      'Nights after alcohol showed more interruptions in your logs (about {{delta}} more wake events on average).',
    'insight.consistent_bedtime_morning_energy.title': 'Bedtime consistency',
    'insight.consistent_bedtime_morning_energy.body':
      'You reported better morning energy on nights with a consistent bedtime ({{good}} of {{total}} steadier nights felt rested or okay).',
    'insight.late_screens_shorter_sleep.title': 'Screens before bed',
    'insight.late_screens_shorter_sleep.body':
      'On evenings with late screens, your logged sleep was about {{minutes}} minutes shorter on average.',
    'insight.high_stress_interruptions.title': 'Stress and wake-ups',
    'insight.high_stress_interruptions.body':
      'Higher evening stress days lined up with more nighttime interruptions in your own data.',
    'insight.heavy_dinner_morning_tired.title': 'Dinner size',
    'insight.heavy_dinner_morning_tired.body':
      'After heavier dinners, you more often logged feeling tired or exhausted the next morning.',
    'insight.night_heat_lower_score.title': 'Nighttime heat comfort',
    'insight.night_heat_lower_score.body':
      'Nights when you noted heat-related wake-ups tended to have a lower Sleep Score in your history — a comfort cue, not a diagnosis.',
    'exp.no_caffeine_after_2pm.title': 'No caffeine after 2 PM',
    'exp.no_caffeine_after_2pm.goal':
      'See if later caffeine tracks with later sleep or more interruptions for you.',
    'exp.no_caffeine_after_2pm.action': 'Skip caffeine after 2:00 PM.',
    'exp.no_alcohol_7d.title': 'No alcohol for seven days',
    'exp.no_alcohol_7d.goal':
      'Notice whether alcohol-free nights feel more continuous for you.',
    'exp.no_alcohol_7d.action': 'Skip alcohol today.',
    'exp.dinner_three_hours_before_bed.title': 'Dinner three hours before bed',
    'exp.dinner_three_hours_before_bed.goal':
      'Explore earlier dinners vs your usual bedtime comfort.',
    'exp.dinner_three_hours_before_bed.action':
      'Finish dinner at least 3 hours before bed.',
    'exp.consistent_bedtime.title': 'Consistent bedtime',
    'exp.consistent_bedtime.goal':
      'Keep bedtime within ~30 minutes of your target for two weeks.',
    'exp.consistent_bedtime.action': 'Aim for your target bedtime.',
    'exp.cooler_bedroom.title': 'Cooler bedroom',
    'exp.cooler_bedroom.goal':
      'Try a cooler sleep environment and note morning energy.',
    'exp.cooler_bedroom.action': 'Sleep in a cooler bedroom if comfortable.',
    'exp.ten_min_wind_down.title': 'Ten-minute wind-down',
    'exp.ten_min_wind_down.goal':
      'A short wind-down before bed — breathing, stretch, or quiet time.',
    'exp.ten_min_wind_down.action': 'Do a 10-minute wind-down before lights out.',
    'exp.no_screens_before_bed.title': 'No screens before bed',
    'exp.no_screens_before_bed.goal':
      'Screen-free wind-down and how it tracks with your sleep start.',
    'exp.no_screens_before_bed.action': 'Avoid screens in the hour before bed.',
    'exp.morning_exercise.title': 'Morning exercise',
    'exp.morning_exercise.goal':
      'Light morning movement and next-night sleep patterns.',
    'exp.morning_exercise.action':
      'Move your body in the morning (walk or gentle exercise).',
    'exp.evening_walk.title': 'Evening walk',
    'exp.evening_walk.goal':
      'A short evening walk and how you feel the next morning.',
    'exp.evening_walk.action': 'Take a short evening walk.',
    'exp.reduce_liquids_before_sleep.title': 'Reduce liquids before sleeping',
    'exp.reduce_liquids_before_sleep.goal':
      'Fewer late liquids and bathroom wake-ups — for your own pattern only.',
    'exp.reduce_liquids_before_sleep.action':
      'Ease off liquids in the 2 hours before bed.',
    'exp.result.sleepUp': 'your average sleep duration increased by {{n}} minutes',
    'exp.result.sleepDown': 'your average sleep duration decreased by {{n}} minutes',
    'exp.result.intDown': 'nighttime interruptions decreased by {{n}}%',
    'exp.result.intUp': 'nighttime interruptions increased by {{n}}%',
    'exp.result.needData':
      'we need a few more logged nights to compare before and after',
    'exp.result.summary':
      'During this experiment, {{parts}}. This is a personal association — not medical causation.',
    'err.unknownExperiment': 'Unknown experiment',
    'err.activeExists':
      'Finish or abandon your current experiment before starting another.',
    'err.notFound': 'Experiment not found',
    'err.notActive': 'Experiment is not active',
    'err.disabledExperiments': 'Sleep Experiments are disabled by feature flag.',
    'err.disabledInsights': 'Insights engine is disabled by feature flag.',
    'err.noExperiment': 'No experiment to complete',
    'report.narrativeDelta':
      'You slept {{abs}} minutes {{dir}} per night than the previous week. Your bedtime consistency and interruptions are tracked against your own baseline — not a medical standard.',
    'report.narrativeLonger': 'longer',
    'report.narrativeLess': 'less',
    'report.narrativeGathering':
      'We’re gathering enough nights to compare week over week. Keep syncing your band and completing morning check-ins.',
    'report.nextWithTarget':
      'Keep your wind-down anchored so you’re in bed near {{time}}.',
    'report.nextNoTarget':
      'Set a target bedtime in onboarding to sharpen next week’s recommendation.',
    'report.needLogs':
      'Keep logging evenings and mornings — patterns need a few comparable nights.',
    'report.baseline': 'Personal baseline'
  },
  es: {
    'disclaimer.association':
      'Asociación personal — no es causalidad médica ni diagnóstico.',
    'disclaimer.associationOnly':
      'Solo asociación personal — no es causalidad médica, diagnóstico ni consejo de tratamiento.',
    'goal.more_energy': 'Despertar con más energía',
    'goal.fewer_interruptions': 'Reducir interrupciones nocturnas',
    'goal.regular_schedule': 'Mantener un horario de sueño regular',
    'goal.bedtime_routine': 'Construir una mejor rutina antes de dormir',
    'goal.understand_factors': 'Entender qué afecta mi sueño',
    'quality.restorative': 'reparador',
    'quality.good': 'bueno',
    'quality.fair': 'aceptable',
    'quality.challenging': 'difícil',
    'rec.windDown': 'Empieza tu rutina de relajación a las {{time}}.',
    'rec.interrupted':
      'Tu sueño fue más interrumpido de lo habitual. Una relajación más calmada puede ayudar esta noche.',
    'rec.short':
      'Dormiste menos que tu meta. Acostarte un poco antes suele asociarse con noches más largas.',
    'rec.late':
      'Te acostaste más tarde que tu patrón habitual. Acercarte a tu hora objetivo es un buen siguiente paso.',
    'rec.default':
      'Mantén el check-in nocturno y una hora de acostarte estable — los hábitos pequeños suman.',
    'factor.duration': 'Duración',
    'factor.duration.short': 'Más corto que tu meta de sueño',
    'factor.duration.ok': 'Cerca de tu meta de sueño',
    'factor.regularity': 'Regularidad',
    'factor.regularity.detail': 'Hora de acostarte vs tu promedio reciente',
    'factor.continuity': 'Continuidad',
    'factor.continuity.detail': 'Interrupciones / tiempo despierto',
    'factor.bedtime': 'Hora de acostarte',
    'factor.bedtime.detail': 'Distancia a tu hora objetivo',
    'factor.hr': 'Pulso nocturno',
    'factor.hr.detail': 'Vs tu línea base personal nocturna',
    'factor.subjective': 'Sensación al despertar',
    'factor.subjective.detail': 'Cómo dijiste que te sentías esta mañana',
    'score.disclaimer':
      'El Sleep Score refleja tus patrones y hábitos — no es un diagnóstico médico.',
    'insight.caffeine_after_3_later_sleep.title': 'Horario de cafeína',
    'insight.caffeine_after_3_later_sleep.body':
      'En días con cafeína después de las 15:00, tu sueño empezó más tarde (unos {{minutes}} minutos más tarde en promedio en tus registros).',
    'insight.alcohol_more_interruptions.title': 'Alcohol y continuidad',
    'insight.alcohol_more_interruptions.body':
      'Las noches tras alcohol mostraron más interrupciones (unos {{delta}} despertares más en promedio).',
    'insight.consistent_bedtime_morning_energy.title': 'Consistencia al acostarte',
    'insight.consistent_bedtime_morning_energy.body':
      'Reportaste mejor energía matutina en noches con hora de acostarte estable ({{good}} de {{total}} noches más estables te sentiste descansada o bien).',
    'insight.late_screens_shorter_sleep.title': 'Pantallas antes de dormir',
    'insight.late_screens_shorter_sleep.body':
      'En noches con pantallas tarde, tu sueño registrado fue unos {{minutes}} minutos más corto en promedio.',
    'insight.high_stress_interruptions.title': 'Estrés y despertares',
    'insight.high_stress_interruptions.body':
      'Los días con más estrés vespertino coincidieron con más interrupciones nocturnas en tus propios datos.',
    'insight.heavy_dinner_morning_tired.title': 'Tamaño de la cena',
    'insight.heavy_dinner_morning_tired.body':
      'Tras cenas más abundantes, con más frecuencia registraste cansancio o agotamiento a la mañana siguiente.',
    'insight.night_heat_lower_score.title': 'Confort térmico nocturno',
    'insight.night_heat_lower_score.body':
      'Las noches con despertares por calor tendieron a un Sleep Score más bajo en tu historial — una pista de confort, no un diagnóstico.',
    'exp.no_caffeine_after_2pm.title': 'Sin cafeína después de las 14:00',
    'exp.no_caffeine_after_2pm.goal':
      'Ver si la cafeína tarde se asocia con dormir más tarde o más interrupciones.',
    'exp.no_caffeine_after_2pm.action': 'Evita cafeína después de las 14:00.',
    'exp.no_alcohol_7d.title': 'Sin alcohol durante siete días',
    'exp.no_alcohol_7d.goal':
      'Notar si las noches sin alcohol se sienten más continuas.',
    'exp.no_alcohol_7d.action': 'Hoy sin alcohol.',
    'exp.dinner_three_hours_before_bed.title': 'Cena tres horas antes de dormir',
    'exp.dinner_three_hours_before_bed.goal':
      'Explorar cenas más tempranas frente a tu confort habitual.',
    'exp.dinner_three_hours_before_bed.action':
      'Termina la cena al menos 3 horas antes de acostarte.',
    'exp.consistent_bedtime.title': 'Hora de acostarte consistente',
    'exp.consistent_bedtime.goal':
      'Mantén la hora de acostarte a ~30 minutos de tu objetivo durante dos semanas.',
    'exp.consistent_bedtime.action': 'Apunta a tu hora objetivo de acostarte.',
    'exp.cooler_bedroom.title': 'Dormitorio más fresco',
    'exp.cooler_bedroom.goal':
      'Probar un ambiente más fresco y notar la energía matutina.',
    'exp.cooler_bedroom.action': 'Duerme en un dormitorio más fresco si te resulta cómodo.',
    'exp.ten_min_wind_down.title': 'Relajación de diez minutos',
    'exp.ten_min_wind_down.goal':
      'Una breve relajación antes de dormir — respiración, estiramiento o silencio.',
    'exp.ten_min_wind_down.action': 'Haz 10 minutos de relajación antes de apagar la luz.',
    'exp.no_screens_before_bed.title': 'Sin pantallas antes de dormir',
    'exp.no_screens_before_bed.goal':
      'Relajación sin pantallas y cómo se asocia con el inicio del sueño.',
    'exp.no_screens_before_bed.action': 'Evita pantallas en la hora previa a dormir.',
    'exp.morning_exercise.title': 'Ejercicio matutino',
    'exp.morning_exercise.goal':
      'Movimiento suave por la mañana y patrones de la noche siguiente.',
    'exp.morning_exercise.action':
      'Muévete por la mañana (caminata o ejercicio suave).',
    'exp.evening_walk.title': 'Caminata nocturna',
    'exp.evening_walk.goal':
      'Una caminata breve por la tarde/noche y cómo te sientes al día siguiente.',
    'exp.evening_walk.action': 'Da una caminata corta por la tarde.',
    'exp.reduce_liquids_before_sleep.title': 'Menos líquidos antes de dormir',
    'exp.reduce_liquids_before_sleep.goal':
      'Menos líquidos tarde y despertares al baño — solo tu propio patrón.',
    'exp.reduce_liquids_before_sleep.action':
      'Reduce líquidos en las 2 horas previas a dormir.',
    'exp.result.sleepUp': 'tu duración media de sueño aumentó {{n}} minutos',
    'exp.result.sleepDown': 'tu duración media de sueño bajó {{n}} minutos',
    'exp.result.intDown': 'las interrupciones nocturnas bajaron un {{n}}%',
    'exp.result.intUp': 'las interrupciones nocturnas subieron un {{n}}%',
    'exp.result.needData':
      'necesitamos unas noches más registradas para comparar antes y después',
    'exp.result.summary':
      'Durante este experimento, {{parts}}. Es una asociación personal — no causalidad médica.',
    'err.unknownExperiment': 'Experimento desconocido',
    'err.activeExists':
      'Termina o abandona tu experimento actual antes de empezar otro.',
    'err.notFound': 'Experimento no encontrado',
    'err.notActive': 'El experimento no está activo',
    'err.disabledExperiments': 'Los experimentos están desactivados por feature flag.',
    'err.disabledInsights': 'El motor de insights está desactivado por feature flag.',
    'err.noExperiment': 'No hay experimento para completar',
    'report.narrativeDelta':
      'Dormiste {{abs}} minutos {{dir}} por noche que la semana anterior. La regularidad y las interrupciones se comparan con tu propia línea base — no con un estándar médico.',
    'report.narrativeLonger': 'más',
    'report.narrativeLess': 'menos',
    'report.narrativeGathering':
      'Estamos reuniendo noches suficientes para comparar semana a semana. Sigue sincronizando la pulsera y completando el check-in matutino.',
    'report.nextWithTarget':
      'Ancla tu relajación para acostarte cerca de las {{time}}.',
    'report.nextNoTarget':
      'Define una hora objetivo en el onboarding para afinar la recomendación de la próxima semana.',
    'report.needLogs':
      'Sigue registrando noches y mañanas — los patrones necesitan noches comparables.',
    'report.baseline': 'Línea base personal'
  }
};

function normalizeLocale(raw) {
  if (!raw) return 'en';
  const s = String(raw).toLowerCase();
  if (s.startsWith('es')) return 'es';
  if (s.startsWith('en')) return 'en';
  return 'en';
}

function parseAcceptLanguage(header) {
  if (!header) return null;
  const first = String(header).split(',')[0]?.trim().split(';')[0];
  return first || null;
}

function resolveLocale(req) {
  const q = req?.query?.lang || req?.headers?.['x-language'];
  if (q) return normalizeLocale(q);
  return normalizeLocale(parseAcceptLanguage(req?.headers?.['accept-language']));
}

function t(locale, key, vars = {}) {
  const lang = normalizeLocale(locale);
  let value = MESSAGES[lang]?.[key] ?? MESSAGES.en[key] ?? key;
  Object.entries(vars).forEach(([k, v]) => {
    value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
  });
  return value;
}

function localizeCatalogItem(item, locale) {
  if (!item) return item;
  const id = item.id;
  return {
    ...item,
    title: t(locale, `exp.${id}.title`) || item.title,
    goal: t(locale, `exp.${id}.goal`) || item.goal,
    dailyAction: t(locale, `exp.${id}.action`) || item.dailyAction
  };
}

module.exports = {
  MESSAGES,
  t,
  resolveLocale,
  normalizeLocale,
  localizeCatalogItem
};
