const User = require('../models/User');
const { getBiometricContextForUser } = require('../services/wellnessBiometricContext');
const { predictCycle } = require('../services/cyclePredictionService');
const {
  generateHabitRecommendations,
  generateCycleRecommendations,
  generateMenopauseRecommendations,
  isAIAvailable
} = require('../services/wellnessAiService');

const DEFAULT_WELLNESS_PROFILE = {
  hydrationGoalMl: 2000,
  activityGoalSteps: 8000,
  activityGoalCalories: 500,
  sleepGoalMinutes: 480,
  cycleLengthDays: 28,
  periodLengthDays: 5,
  lastPeriodStart: null,
  menopauseActive: false,
  menopauseStage: null,
  habitsGoalMode: 'healthy_life',
  primarySport: 'vida_sana',
  sportLevel: 'beginner',
  weeklyTrainingDays: 3
};

const DEFAULT_IMPORTANT_REMINDERS = [
  {
    id: 'drink_water',
    label: 'Tomar agua',
    vibrationCount: 3,
    time: '09:30',
    startTime: '09:30',
    endTime: '19:00',
    frequency: 'daily',
    frequencyMinutes: 120,
    enabled: true,
    aiRecommended: true,
    aiReason: 'Mejor durante la mañana para iniciar hidratación temprano.'
  },
  {
    id: 'meditate',
    label: 'Meditar',
    vibrationCount: 8,
    time: '21:30',
    startTime: '21:30',
    endTime: '22:30',
    frequency: 'daily',
    frequencyMinutes: 1440,
    enabled: true,
    aiRecommended: true,
    aiReason: 'La noche favorece bajar estrés y preparar sueño.'
  },
  {
    id: 'here_now_pause',
    label: 'Pausa here and now',
    vibrationCount: 4,
    time: '15:30',
    startTime: '15:30',
    endTime: '18:30',
    frequency: 'weekdays',
    frequencyMinutes: 180,
    enabled: true,
    aiRecommended: true,
    aiReason: 'Una pausa de tarde ayuda a cortar estrés y recuperar foco.'
  }
];

const DEFAULT_EVENT_ALERTS = [
  {
    id: 'whatsapp_message',
    label: 'Mensaje WhatsApp',
    type: 'whatsapp',
    vibrationCount: 2,
    startTime: '09:00',
    endTime: '21:00',
    enabled: true,
    aiRecommended: true,
    aiReason: 'Alerta por evento: solo vibra si llega un mensaje dentro de la ventana.'
  },
  {
    id: 'phone_call',
    label: 'Llamada teléfono',
    type: 'phone_call',
    vibrationCount: 3,
    startTime: '08:00',
    endTime: '22:00',
    enabled: true,
    aiRecommended: true,
    aiReason: 'Alerta por evento: solo vibra si entra una llamada dentro de la ventana.'
  },
  {
    id: 'panic_button',
    label: 'Help Button / Family Assistance',
    type: 'help_button',
    vibrationCount: 5,
    startTime: '00:00',
    endTime: '23:59',
    enabled: true,
    aiRecommended: true,
    aiReason: 'Request Help notifica a contactos autorizados. No contacta 911 ni servicios médicos.'
  }
];

const DEFAULT_PANIC_ALERT_CONTACTS = {
  emails: [],
  whatsapp: ''
};

const MAX_WELLNESS_LOGS = 300;

const normalizeReminder = (input = {}) => {
  const fallback = DEFAULT_IMPORTANT_REMINDERS.find((item) => item.id === input.id) || DEFAULT_IMPORTANT_REMINDERS[0];
  const frequency = ['daily', 'weekdays', 'weekends', 'custom'].includes(input.frequency)
    ? input.frequency
    : fallback.frequency;
  const isValidTime = (value) => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  const startTime = isValidTime(input.startTime)
    ? input.startTime
    : isValidTime(input.time)
      ? input.time
      : fallback.startTime || fallback.time;
  const endTime = isValidTime(input.endTime)
    ? input.endTime
    : fallback.endTime || startTime;

  return {
    id: fallback.id,
    label: typeof input.label === 'string' && input.label.trim() ? input.label.trim() : fallback.label,
    vibrationCount: Math.min(Math.max(parseInt(input.vibrationCount, 10) || fallback.vibrationCount, 1), 10),
    time: startTime,
    startTime,
    endTime,
    frequency,
    frequencyMinutes: Math.min(Math.max(parseInt(input.frequencyMinutes, 10) || fallback.frequencyMinutes || 60, 5), 1440),
    enabled: input.enabled !== undefined ? Boolean(input.enabled) : fallback.enabled,
    aiRecommended: input.aiRecommended !== undefined ? Boolean(input.aiRecommended) : true,
    aiReason: typeof input.aiReason === 'string' && input.aiReason.trim() ? input.aiReason.trim() : fallback.aiReason
  };
};

const normalizeImportantReminders = (reminders = []) => {
  const byId = new Map((Array.isArray(reminders) ? reminders : []).map((item) => [item.id, item]));
  return DEFAULT_IMPORTANT_REMINDERS.map((fallback) => normalizeReminder({ ...fallback, ...(byId.get(fallback.id) || {}) }));
};

const normalizeEventAlert = (input = {}) => {
  const fallback = DEFAULT_EVENT_ALERTS.find((item) => item.id === input.id) || DEFAULT_EVENT_ALERTS[0];
  const isValidTime = (value) => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  return {
    id: fallback.id,
    label: fallback.label,
    type: fallback.type,
    vibrationCount: Math.min(Math.max(parseInt(input.vibrationCount, 10) || fallback.vibrationCount || 1, 1), 10),
    startTime: isValidTime(input.startTime) ? input.startTime : fallback.startTime,
    endTime: isValidTime(input.endTime) ? input.endTime : fallback.endTime,
    enabled: input.enabled !== undefined ? Boolean(input.enabled) : fallback.enabled,
    aiRecommended: input.aiRecommended !== undefined ? Boolean(input.aiRecommended) : true,
    aiReason: typeof input.aiReason === 'string' && input.aiReason.trim() ? input.aiReason.trim() : fallback.aiReason
  };
};

const normalizeEventAlerts = (alerts = []) => {
  const byId = new Map((Array.isArray(alerts) ? alerts : []).map((item) => [item.id, item]));
  return DEFAULT_EVENT_ALERTS.map((fallback) => normalizeEventAlert({ ...fallback, ...(byId.get(fallback.id) || {}) }));
};

const normalizePanicAlertContacts = (input = {}) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  const normalizedEmails = (Array.isArray(input?.emails) ? input.emails : [])
    .map((email) => String(email || '').trim().toLowerCase())
    .filter((email) => emailRegex.test(email));

  const uniqueEmails = [];
  normalizedEmails.forEach((email) => {
    if (!uniqueEmails.includes(email)) {
      uniqueEmails.push(email);
    }
  });

  const normalizedWhatsapp = String(input?.whatsapp || '')
    .trim()
    .replace(/[^0-9+]/g, '')
    .slice(0, 20);

  return {
    emails: uniqueEmails.slice(0, 3),
    whatsapp: normalizedWhatsapp
  };
};

const normalizeProfile = (profile) => ({
  ...DEFAULT_WELLNESS_PROFILE,
  ...(profile && typeof profile.toObject === 'function' ? profile.toObject() : profile || {}),
  importantReminders: normalizeImportantReminders(
    (profile && typeof profile.toObject === 'function' ? profile.toObject() : profile || {})?.importantReminders
  ),
  eventAlerts: normalizeEventAlerts(
    (profile && typeof profile.toObject === 'function' ? profile.toObject() : profile || {})?.eventAlerts
  ),
  panicAlertContacts: normalizePanicAlertContacts(
    (profile && typeof profile.toObject === 'function' ? profile.toObject() : profile || {})?.panicAlertContacts
      || DEFAULT_PANIC_ALERT_CONTACTS
  )
});

const getUserWellness = async (userId) => {
  const user = await User.findById(userId).select('wellnessProfile wellnessLogs email name phone gender dateOfBirth');
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  return user;
};

const getProfile = async (req, res) => {
  try {
    const user = await getUserWellness(req.user._id);
    res.json({
      success: true,
      profile: normalizeProfile(user.wellnessProfile),
      aiAvailable: isAIAvailable()
    });
  } catch (error) {
    console.error('getProfile wellness:', error);
    res.status(500).json({ success: false, message: 'Error al obtener perfil de bienestar' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowed = [
      'hydrationGoalMl',
      'activityGoalSteps',
      'activityGoalCalories',
      'sleepGoalMinutes',
      'cycleLengthDays',
      'periodLengthDays',
      'lastPeriodStart',
      'menopauseActive',
      'menopauseStage',
      'habitsGoalMode',
      'primarySport',
      'sportLevel',
      'weeklyTrainingDays'
    ];

    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[`wellnessProfile.${key}`] = req.body[key];
      }
    });

    if (updates['wellnessProfile.lastPeriodStart']) {
      updates['wellnessProfile.lastPeriodStart'] = new Date(updates['wellnessProfile.lastPeriodStart']);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('wellnessProfile');

    res.json({ success: true, profile: normalizeProfile(user?.wellnessProfile) });
  } catch (error) {
    console.error('updateProfile wellness:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar perfil de bienestar' });
  }
};

const getBiometricSummary = async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 14, 30);
    const biometrics = await getBiometricContextForUser(req.user.email, days);
    res.json({ success: true, biometrics, aiAvailable: isAIAvailable() });
  } catch (error) {
    console.error('getBiometricSummary:', error);
    res.status(500).json({ success: false, message: 'Error al obtener resumen biométrico' });
  }
};

const getLogsForUser = (user, module, limit = 60) => {
  const logs = (user.wellnessLogs || [])
    .filter((log) => log.module === module)
    .sort((a, b) => new Date(b.logDate) - new Date(a.logDate))
    .slice(0, limit)
    .map((log) => ({
      _id: log._id,
      logDate: log.logDate,
      module: log.module,
      data: log.data || {}
    }));

  return logs;
};

const createLog = async (req, res) => {
  try {
    const { module, logDate, data } = req.body;
    if (!['habits', 'cycle', 'menopause'].includes(module)) {
      return res.status(400).json({ success: false, message: 'Módulo inválido' });
    }

    const entry = {
      module,
      logDate: logDate ? new Date(logDate) : new Date(),
      data: data || {}
    };

    const update = {
      $push: {
        wellnessLogs: {
          $each: [entry],
          $position: 0,
          $slice: MAX_WELLNESS_LOGS
        }
      }
    };

    if (module === 'cycle' && (data?.type === 'period_start' || data?.periodStart)) {
      update.$set = { 'wellnessProfile.lastPeriodStart': entry.logDate };
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('wellnessLogs wellnessProfile');
    const created = user?.wellnessLogs?.[0];

    res.status(201).json({
      success: true,
      log: created
        ? { _id: created._id, logDate: created.logDate, module: created.module, data: created.data }
        : entry
    });
  } catch (error) {
    console.error('createLog wellness:', error);
    res.status(500).json({ success: false, message: 'Error al guardar registro' });
  }
};

const getHabitRecommendations = async (req, res) => {
  try {
    const user = await getUserWellness(req.user._id);
    const profile = normalizeProfile(user.wellnessProfile);
    const biometrics = await getBiometricContextForUser(req.user.email, 14);
    const hydrationLogs = getLogsForUser(user, 'habits', 30);

    const recommendations = await generateHabitRecommendations({
      user: req.user,
      profile,
      biometrics,
      hydrationLogs
    });

    res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      aiAvailable: isAIAvailable(),
      aiUsed: recommendations.aiUsed,
      profile,
      biometrics,
      recommendations
    });
  } catch (error) {
    console.error('getHabitRecommendations:', error);
    res.status(500).json({ success: false, message: 'Error al generar recomendaciones de hábitos' });
  }
};

const getImportantReminders = async (req, res) => {
  try {
    const user = await getUserWellness(req.user._id);
    const profile = normalizeProfile(user.wellnessProfile);
    res.json({
      success: true,
      aiAvailable: isAIAvailable(),
      generatedAt: new Date().toISOString(),
      reminders: profile.importantReminders,
      defaults: DEFAULT_IMPORTANT_REMINDERS,
      eventAlerts: profile.eventAlerts,
      eventDefaults: DEFAULT_EVENT_ALERTS,
      panicAlertContacts: profile.panicAlertContacts,
      panicAlertContactsDefaults: DEFAULT_PANIC_ALERT_CONTACTS,
      accountEmail: user.email,
      accountPhone: user.phone || ''
    });
  } catch (error) {
    console.error('getImportantReminders:', error);
    res.status(500).json({ success: false, message: 'Error al obtener recordatorios' });
  }
};

const updateImportantReminders = async (req, res) => {
  try {
    const reminders = normalizeImportantReminders(req.body?.reminders);
    const eventAlerts = normalizeEventAlerts(req.body?.eventAlerts);
    const panicAlertContacts = normalizePanicAlertContacts(req.body?.panicAlertContacts || {});
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'wellnessProfile.importantReminders': reminders,
          'wellnessProfile.eventAlerts': eventAlerts,
          'wellnessProfile.panicAlertContacts': panicAlertContacts
        }
      },
      { runValidators: true }
    );
    res.json({ success: true, reminders, eventAlerts, panicAlertContacts });
  } catch (error) {
    console.error('updateImportantReminders:', error);
    res.status(500).json({ success: false, message: 'Error al guardar recordatorios' });
  }
};

const getCycleData = async (req, res) => {
  try {
    const user = await getUserWellness(req.user._id);
    const profile = normalizeProfile(user.wellnessProfile);
    const cycleLogs = getLogsForUser(user, 'cycle', 90);
    const predictions = predictCycle(profile, cycleLogs);

    res.json({ success: true, profile, cycleLogs, predictions });
  } catch (error) {
    console.error('getCycleData:', error);
    res.status(500).json({ success: false, message: 'Error al obtener datos del ciclo' });
  }
};

const getCycleRecommendations = async (req, res) => {
  try {
    const user = await getUserWellness(req.user._id);
    const profile = normalizeProfile(user.wellnessProfile);
    const biometrics = await getBiometricContextForUser(req.user.email, 14);
    const cycleLogs = getLogsForUser(user, 'cycle', 90);

    const result = await generateCycleRecommendations({
      user: req.user,
      profile,
      biometrics,
      cycleLogs
    });

    res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      aiAvailable: isAIAvailable(),
      aiUsed: result.aiUsed,
      biometrics,
      ...result
    });
  } catch (error) {
    console.error('getCycleRecommendations:', error);
    res.status(500).json({ success: false, message: 'Error al generar recomendaciones del ciclo' });
  }
};

const getMenopauseData = async (req, res) => {
  try {
    const user = await getUserWellness(req.user._id);
    const profile = normalizeProfile(user.wellnessProfile);
    const menopauseLogs = getLogsForUser(user, 'menopause', 90);

    res.json({ success: true, profile, menopauseLogs });
  } catch (error) {
    console.error('getMenopauseData:', error);
    res.status(500).json({ success: false, message: 'Error al obtener datos de menopausia' });
  }
};

const getMenopauseRecommendations = async (req, res) => {
  try {
    const user = await getUserWellness(req.user._id);
    const profile = normalizeProfile(user.wellnessProfile);
    const biometrics = await getBiometricContextForUser(req.user.email, 14);
    const menopauseLogs = getLogsForUser(user, 'menopause', 90);

    const result = await generateMenopauseRecommendations({
      user: req.user,
      profile,
      biometrics,
      menopauseLogs
    });

    res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      aiAvailable: isAIAvailable(),
      aiUsed: result.aiUsed,
      biometrics,
      ...result
    });
  } catch (error) {
    console.error('getMenopauseRecommendations:', error);
    res.status(500).json({ success: false, message: 'Error al generar recomendaciones de menopausia' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getBiometricSummary,
  createLog,
  getHabitRecommendations,
  getImportantReminders,
  updateImportantReminders,
  getCycleData,
  getCycleRecommendations,
  getMenopauseData,
  getMenopauseRecommendations
};
