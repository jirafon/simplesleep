const express = require('express');
const crypto = require('crypto');
const HealthData = require('../models/HealthData');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { generateBiometricRiskAnalysis, buildRuleAnalysis } = require('../services/biometricRiskAnalysisService');
const emailService = require('../services/emailService');
const { sendLiveLocationRequestPush, getMobilePushStatus } = require('../services/mobilePushService');

const router = express.Router();

const DEFAULT_EVENT_ALERTS = [
  {
    id: 'whatsapp_message',
    label: 'Mensaje WhatsApp',
    type: 'whatsapp',
    startTime: '09:00',
    endTime: '21:00',
    enabled: true,
    vibrationCount: 2,
    aiRecommended: true,
    aiReason: 'Alerta por evento: solo vibra si llega un mensaje dentro de la ventana.'
  },
  {
    id: 'phone_call',
    label: 'Llamada teléfono',
    type: 'phone_call',
    startTime: '08:00',
    endTime: '22:00',
    enabled: true,
    vibrationCount: 3,
    aiRecommended: true,
    aiReason: 'Alerta por evento: solo vibra si entra una llamada dentro de la ventana.'
  },
  {
    id: 'help_button',
    label: 'Help Button / Family Assistance',
    type: 'help_button',
    // legacy id kept in parallel lookups
    legacyId: 'panic_button',
    startTime: '00:00',
    endTime: '23:59',
    enabled: true,
    vibrationCount: 5,
    aiRecommended: true,
    aiReason: 'Si activas Request Help en la pulsera (presión prolongada), se notifica a contactos autorizados. No contacta 911 ni servicios médicos.'
  },
  {
    id: 'panic_button',
    label: 'Help Button (compat)',
    type: 'help_button',
    startTime: '00:00',
    endTime: '23:59',
    enabled: true,
    vibrationCount: 5,
    aiRecommended: false,
    aiReason: 'Alias de compatibilidad con APK legacy. Usar Help Button / Family Assistance.'
  }
];

const RISK_REFRESH_TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const MOBILE_RISK_AI_TIMEOUT_MS = Math.min(
  Math.max(parseInt(process.env.MOBILE_RISK_AI_TIMEOUT_MS || '8000', 10) || 8000, 2000),
  20000
);

const mobileHabitsPayload = {
  success: true,
  title: 'Hábitos SiempreSleep',
  subtitle: 'Plan orientado a sueño, recuperación e hidratación. Sin seguimiento deportivo competitivo ni nutrición clínica.',
  priorityAction: 'Haz esto ahora: fija hora de dormir, deja el teléfono fuera del dormitorio y toma un vaso de agua.',
  reminders: [
    { time: '07:30', label: 'Luz natural al despertar', source: 'Higiene de sueño' },
    { time: '09:00', label: 'Agua y movimiento suave', source: 'Pulsera + hidratación' },
    { time: '18:30', label: 'Cerrar cafeína y cenas pesadas', source: 'Recuperación' },
    { time: '21:00', label: 'Modo descanso: pantallas abajo', source: 'Rutina nocturna' },
    { time: '22:30', label: 'Hora objetivo de sueño', source: 'Meta de sueño' }
  ],
  categories: [
    {
      title: 'Sueño',
      summary: 'El sueño manda la intensidad del día. Si dormiste poco, baja carga y adelanta la cena.',
      actions: ['Dormir/despertar a horario fijo', 'Sin pantallas 60 min antes', 'Ambiente fresco y oscuro']
    },
    {
      title: 'Recuperación',
      summary: 'Movimiento suave y pausas para consolidar hábitos de descanso.',
      actions: ['Caminata suave 10-15 min', 'Estiramientos cortos', 'Respiración 2 min']
    },
    {
      title: 'Hidratación',
      summary: 'Deja el agua visible y usa la pulsera como recordatorio.',
      actions: ['Agua al despertar', 'Botella visible', 'Agua antes de café']
    }
  ],
  eventAlerts: DEFAULT_EVENT_ALERTS,
  detoxPlan: null
};

const normalizeQueryValue = (value) => String(value || '').trim();
const normalizePushToken = (value) => String(value || '').trim();

const PANIC_ACTION_VALUES = new Set([
  'help',
  'help_button',
  'request_help',
  'assistance',
  'family_assistance',
  'panic',
  'panic_button',
  'sos',
  'long_press'
]);
const { isFeatureEnabled } = require('../config/featureFlags');
const CAMERA_NOTIFY_PANIC_SIGNATURES = ['camernotifyrsp@', 'cameranotifyrsp@'];
const MOBILE_PANIC_CAMERA_NOTIFY_ENABLED =
  String(process.env.MOBILE_PANIC_CAMERA_NOTIFY_ENABLED || 'false').toLowerCase() === 'true';
const LIVE_LOCATION_REQUEST_TIMEOUT_SECONDS = Math.min(
  Math.max(parseInt(process.env.MOBILE_LOCATION_REQUEST_TIMEOUT_SECONDS || '45', 10) || 45, 8),
  90
);
const liveLocationRequests = new Map();

const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const normalized = typeof value === 'string' ? value.trim().replace(',', '.') : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeTimestampValue = (value) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const epochMs = value < 1e11 ? value * 1000 : value;
    const parsed = new Date(epochMs);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^\d+$/.test(trimmed)) {
      const numeric = Number(trimmed);
      if (Number.isFinite(numeric)) {
        const epochMs = numeric < 1e11 ? numeric * 1000 : numeric;
        const parsedFromEpoch = new Date(epochMs);
        if (!Number.isNaN(parsedFromEpoch.getTime())) {
          return parsedFromEpoch.toISOString();
        }
      }
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  return null;
};

const pickFirstFiniteNumber = (...candidates) => {
  for (const candidate of candidates) {
    const parsed = toFiniteNumber(candidate);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const safeParseJson = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || !trimmed.startsWith('{')) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
};

const extractCoordinatesFromRawText = (rawText) => {
  const text = String(rawText || '');
  if (!text) return { latitude: null, longitude: null };

  const latitudeMatch = text.match(/(?:latitude|lat)\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);
  const longitudeMatch = text.match(/(?:longitude|lng|lon)\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);

  return {
    latitude: toFiniteNumber(latitudeMatch?.[1]),
    longitude: toFiniteNumber(longitudeMatch?.[1])
  };
};

const extractCoordinatesFromPayload = (payload = {}) => {
  const location = payload?.location && typeof payload.location === 'object' ? payload.location : {};
  const gps = payload?.gps && typeof payload.gps === 'object' ? payload.gps : {};
  const coords = payload?.coords && typeof payload.coords === 'object' ? payload.coords : {};
  const gpsLocation = payload?.gpsLocation && typeof payload.gpsLocation === 'object' ? payload.gpsLocation : {};
  const data = payload?.data && typeof payload.data === 'object' ? payload.data : {};
  const dataLocation = data?.location && typeof data.location === 'object' ? data.location : {};
  const dataGps = data?.gps && typeof data.gps === 'object' ? data.gps : {};
  const dataCoords = data?.coords && typeof data.coords === 'object' ? data.coords : {};
  const dataGpsLocation = data?.gpsLocation && typeof data.gpsLocation === 'object' ? data.gpsLocation : {};

  const rawDataCandidate = payload?.rawData || payload?.raw || payload?.dataRaw || '';
  const parsedRawData = (rawDataCandidate && typeof rawDataCandidate === 'object')
    ? rawDataCandidate
    : safeParseJson(rawDataCandidate);
  const rawLocation = parsedRawData?.location && typeof parsedRawData.location === 'object' ? parsedRawData.location : {};
  const rawGps = parsedRawData?.gps && typeof parsedRawData.gps === 'object' ? parsedRawData.gps : {};
  const rawCoords = parsedRawData?.coords && typeof parsedRawData.coords === 'object' ? parsedRawData.coords : {};
  const rawGpsLocation = parsedRawData?.gpsLocation && typeof parsedRawData.gpsLocation === 'object' ? parsedRawData.gpsLocation : {};
  const rawTextCoordinates = extractCoordinatesFromRawText(
    typeof rawDataCandidate === 'string' ? rawDataCandidate : ''
  );

  const latitude = pickFirstFiniteNumber(
    payload.latitude,
    payload.lat,
    payload.gpsLatitude,
    payload.locationLatitude,
    payload.latitudeE7,
    payload.latitudeE6,
    location.latitude,
    location.lat,
    gps.latitude,
    gps.lat,
    coords.latitude,
    coords.lat,
    gpsLocation.latitude,
    gpsLocation.lat,
    data.latitude,
    data.lat,
    data.gpsLatitude,
    dataLocation.latitude,
    dataLocation.lat,
    dataGps.latitude,
    dataGps.lat,
    dataCoords.latitude,
    dataCoords.lat,
    dataGpsLocation.latitude,
    dataGpsLocation.lat,
    parsedRawData?.latitude,
    parsedRawData?.lat,
    parsedRawData?.gpsLatitude,
    rawLocation.latitude,
    rawLocation.lat,
    rawGps.latitude,
    rawGps.lat,
    rawCoords.latitude,
    rawCoords.lat,
    rawGpsLocation.latitude,
    rawGpsLocation.lat,
    rawTextCoordinates.latitude
  );

  const longitude = pickFirstFiniteNumber(
    payload.longitude,
    payload.lng,
    payload.lon,
    payload.gpsLongitude,
    payload.locationLongitude,
    payload.longitudeE7,
    payload.longitudeE6,
    location.longitude,
    location.lng,
    location.lon,
    gps.longitude,
    gps.lng,
    gps.lon,
    coords.longitude,
    coords.lng,
    coords.lon,
    gpsLocation.longitude,
    gpsLocation.lng,
    gpsLocation.lon,
    data.longitude,
    data.lng,
    data.lon,
    data.gpsLongitude,
    dataLocation.longitude,
    dataLocation.lng,
    dataLocation.lon,
    dataGps.longitude,
    dataGps.lng,
    dataGps.lon,
    dataCoords.longitude,
    dataCoords.lng,
    dataCoords.lon,
    dataGpsLocation.longitude,
    dataGpsLocation.lng,
    dataGpsLocation.lon,
    parsedRawData?.longitude,
    parsedRawData?.lng,
    parsedRawData?.lon,
    parsedRawData?.gpsLongitude,
    rawLocation.longitude,
    rawLocation.lng,
    rawLocation.lon,
    rawGps.longitude,
    rawGps.lng,
    rawGps.lon,
    rawCoords.longitude,
    rawCoords.lng,
    rawCoords.lon,
    rawGpsLocation.longitude,
    rawGpsLocation.lng,
    rawGpsLocation.lon,
    rawTextCoordinates.longitude
  );

  // Some mobile SDKs send scaled coordinates as integers (E6/E7).
  const normalizedLatitude = Math.abs(latitude) > 180
    ? latitude / (Math.abs(latitude) > 10000000 ? 10000000 : 1000000)
    : latitude;
  const normalizedLongitude = Math.abs(longitude) > 180
    ? longitude / (Math.abs(longitude) > 10000000 ? 10000000 : 1000000)
    : longitude;

  return {
    latitude: normalizedLatitude,
    longitude: normalizedLongitude
  };
};

const pruneExpiredLiveLocationRequests = () => {
  const now = Date.now();
  for (const [requestId, request] of liveLocationRequests.entries()) {
    if (request.status === 'pending' && request.expiresAtMs <= now) {
      liveLocationRequests.set(requestId, {
        ...request,
        status: 'expired',
        expiredAt: new Date(now).toISOString(),
        error: 'LOCATION_REQUEST_TIMEOUT'
      });
      continue;
    }

    const terminalStatus = request.status === 'completed' || request.status === 'failed' || request.status === 'expired';
    if (terminalStatus && request.createdAtMs < (now - (6 * 60 * 60 * 1000))) {
      liveLocationRequests.delete(requestId);
    }
  }
};

const buildLiveLocationRequestSnapshot = (request) => {
  if (!request) return null;

  return {
    requestId: request.requestId,
    status: request.status,
    email: request.email,
    deviceId: request.deviceId,
    requestedAt: request.requestedAt,
    expiresAt: request.expiresAt,
    respondedAt: request.respondedAt || null,
    expiredAt: request.expiredAt || null,
    lastMobilePollAt: request.lastMobilePollAt || null,
    mobilePollCount: Number.isFinite(request.mobilePollCount) ? request.mobilePollCount : 0,
    error: request.error || null,
    gps: request.gps || null,
    source: request.responseSource || null,
    mapUrl: request.gps?.mapUrl || null,
    matchedUser: Boolean(request.userId)
  };
};

const setNoCacheHeaders = (res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
};

const matchesLiveLocationRequest = (request, { email, deviceId }) => {
  if (!request || request.status !== 'pending') return false;

  const requestEmail = String(request.email || '').toLowerCase();
  const requestDeviceId = String(request.deviceId || '');
  const hasRequestEmail = Boolean(requestEmail);
  const hasRequestDeviceId = Boolean(requestDeviceId);
  const hasCandidateEmail = Boolean(email);
  const hasCandidateDevice = Boolean(deviceId);

  const emailMatches = hasRequestEmail && hasCandidateEmail && requestEmail === email;
  const deviceMatches = hasRequestDeviceId && hasCandidateDevice && requestDeviceId === deviceId;

  if (hasRequestEmail && hasRequestDeviceId) {
    return emailMatches || deviceMatches;
  }

  if (hasRequestEmail) {
    return emailMatches;
  }

  if (hasRequestDeviceId) {
    return deviceMatches;
  }

  return false;
};

const getNextPendingLiveLocationRequest = ({ email, deviceId }) => {
  pruneExpiredLiveLocationRequests();

  const normalizedEmail = normalizeQueryValue(email).toLowerCase();
  const normalizedDeviceId = normalizeIdentifier(deviceId);

  const allPending = Array.from(liveLocationRequests.values())
    .filter((request) => request.status === 'pending')
    .sort((left, right) => left.createdAtMs - right.createdAtMs);

  const pending = allPending
    .filter((request) => matchesLiveLocationRequest(request, {
      email: normalizedEmail,
      deviceId: normalizedDeviceId
    }))
    .sort((left, right) => left.createdAtMs - right.createdAtMs);

  const nextRequest = pending[0] || allPending[0] || null;
  if (!nextRequest) return null;

  return {
    requestId: nextRequest.requestId,
    email: nextRequest.email,
    deviceId: nextRequest.deviceId,
    requestedAt: nextRequest.requestedAt,
    expiresAt: nextRequest.expiresAt,
    command: 'capture_current_location',
    reason: 'admin_live_location_request'
  };
};

const isCameraNotifyPanicEvent = ({ action, rawData }) => {
  const normalizedValues = [action, rawData]
    .map((value) => String(value || '').toLowerCase().trim())
    .filter(Boolean);

  return normalizedValues.some((value) =>
    CAMERA_NOTIFY_PANIC_SIGNATURES.some((signature) => value.includes(signature))
  );
};

const normalizePanicAlertContacts = (contacts = {}, fallbackEmail = '') => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  const normalizedFallbackEmail = String(fallbackEmail || '').trim().toLowerCase();
  const rawEmails = Array.isArray(contacts?.emails) ? contacts.emails : [];
  const parsedEmails = rawEmails
    .map((email) => String(email || '').trim().toLowerCase())
    .filter((email) => emailRegex.test(email));

  const uniqueEmails = [];

  if (normalizedFallbackEmail && emailRegex.test(normalizedFallbackEmail)) {
    uniqueEmails.push(normalizedFallbackEmail);
  }

  parsedEmails.forEach((email) => {
    if (!uniqueEmails.includes(email)) uniqueEmails.push(email);
  });

  const whatsapp = String(contacts?.whatsapp || '')
    .trim()
    .replace(/[^0-9+]/g, '')
    .slice(0, 20);

  return {
    emails: uniqueEmails.slice(0, 4),
    whatsapp
  };
};

const buildPanicLogData = ({ source, deviceId, dataType, rawData, triggeredAt, latitude, longitude, notificationTargets, testMode = false }) => ({
  type: testMode ? 'help_request_test' : 'help_request',
  legacyType: 'panic_alert',
  framing: {
    label: 'Family Assistance',
    medicalEmergency: false,
    emergencyServices: false
  },
  source,
  deviceId,
  dataType,
  rawData,
  triggeredAt,
  testMode: Boolean(testMode),
  location: (Number.isFinite(latitude) && Number.isFinite(longitude))
    ? { latitude, longitude }
    : null,
  mapUrl: (Number.isFinite(latitude) && Number.isFinite(longitude))
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : null,
  notificationTargets
});

const registerPanicAlertForUser = async ({ user, source, deviceId, dataType, rawData, latitude, longitude, testMode = false }) => {
  if (!isFeatureEnabled('HELP_BUTTON')) {
    return {
      alert: null,
      emailNotification: { sent: false, skipped: true, error: 'HELP_BUTTON disabled', recipients: [] },
      whatsappNotification: { sent: false, skipped: true, error: 'HELP_BUTTON disabled', to: null }
    };
  }

  const triggeredAt = new Date().toISOString();
  const panicContacts = normalizePanicAlertContacts(user?.wellnessProfile?.panicAlertContacts, user?.email);
  const panicData = buildPanicLogData({
    source,
    deviceId,
    dataType,
    rawData,
    triggeredAt,
    latitude,
    longitude,
    notificationTargets: panicContacts,
    testMode
  });

  await User.updateOne(
    { _id: user._id },
    {
      $push: {
        wellnessLogs: {
          $each: [{ module: 'habits', logDate: new Date(), data: panicData }],
          $position: 0,
          $slice: 300
        }
      }
    }
  );

  const emailNotification = {
    sent: false,
    skipped: false,
    error: null,
    recipients: panicContacts.emails
  };
  const whatsappNotification = {
    sent: false,
    skipped: false,
    error: null,
    to: panicContacts.whatsapp || null
  };

  if (testMode) {
    emailNotification.skipped = true;
    emailNotification.error = 'test_mode';
    whatsappNotification.skipped = true;
    whatsappNotification.error = 'test_mode';
    return {
      alert: panicData,
      emailNotification,
      whatsappNotification
    };
  }

  const emailEnabled = emailService?.isConfigured && emailService.isConfigured();
  const whatsappEnabled = emailService?.isWhatsAppConfigured && emailService.isWhatsAppConfigured();

  if (!emailEnabled) {
    emailNotification.skipped = true;
    emailNotification.error = 'Mailgun no configurado';
  }

  if (!(whatsappEnabled && panicContacts.whatsapp)) {
    whatsappNotification.skipped = true;
    whatsappNotification.error = whatsappEnabled
      ? 'No hay número WhatsApp configurado'
      : 'Twilio WhatsApp no configurado';
  }

  const [emailResult, whatsappResult] = await Promise.allSettled([
    emailEnabled
      ? emailService.sendPanicAlertEmail({
          to: panicContacts.emails,
          userName: user.name,
          source,
          deviceId,
          dataType,
          rawData,
          triggeredAt,
          latitude,
          longitude
        })
      : Promise.resolve(null),
    (whatsappEnabled && panicContacts.whatsapp)
      ? emailService.sendPanicAlertWhatsApp({
          to: panicContacts.whatsapp,
          userName: user.name,
          source,
          deviceId,
          dataType,
          rawData,
          triggeredAt,
          latitude,
          longitude
        })
      : Promise.resolve(null)
  ]);

  if (emailResult.status === 'fulfilled' && emailEnabled) {
    emailNotification.sent = true;
  }
  if (emailResult.status === 'rejected' && emailEnabled) {
    emailNotification.error = emailResult.reason?.message || String(emailResult.reason);
    console.error('mobile help email:', emailResult.reason);
  }

  if (whatsappResult.status === 'fulfilled' && whatsappEnabled && panicContacts.whatsapp) {
    whatsappNotification.sent = true;
  }
  if (whatsappResult.status === 'rejected' && whatsappEnabled && panicContacts.whatsapp) {
    whatsappNotification.error = whatsappResult.reason?.message || String(whatsappResult.reason);
    console.error('mobile help whatsapp:', whatsappResult.reason);
  }

  return {
    alert: panicData,
    emailNotification,
    whatsappNotification
  };
};

const findMobileUser = async (query) => {
  const email = normalizeQueryValue(query.email).toLowerCase();
  const phone = normalizeQueryValue(query.phone || query.telefono);
  const idPersonal = normalizeQueryValue(query.idPersonal || query.idpersonal);
  const clauses = [];

  if (email) clauses.push({ email });
  if (phone) clauses.push({ phone });
  if (idPersonal) clauses.push({ rut: idPersonal.toUpperCase() });
  if (!clauses.length) return null;

  return User.findOne({ $or: clauses }).select('name email phone rut wellnessProfile wellnessLogs');
};

const formatHabitLogDate = (date) => {
  try {
    return new Date(date).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
  } catch {
    return '';
  }
};

const normalizeIdentifier = (value) => String(value || '').trim();

const normalizePhoneDigits = (value) => normalizeIdentifier(value).replace(/\D/g, '');

const pickMetric = (record, keys = []) => {
  const data = record?.data || {};
  for (const key of keys) {
    const path = key.split('.');
    let value = data;
    for (const segment of path) {
      value = value?.[segment];
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return null;
};

const serializeMobileBiometricRecord = (record) => {
  if (!record) return null;

  const data = record.data || {};

  return {
    recordId: record._id,
    deviceId: record.deviceId,
    timestamp: record.timestamp,
    patient: {
      nombre: record.nombre || data.fullName || data.patientName || '',
      email: record.email || '',
      telefono: record.telefono || '',
      idpersonal: record.idpersonal || data.idPersonal || data.idpersonal || ''
    },
    metrics: {
      heartRate: pickMetric(record, ['heartRate', 'frecuencia_cardiaca', 'heart_rate']),
      oxygenSaturation: pickMetric(record, ['oxygenSaturation', 'saturacion_oxigeno', 'spo2', 'bloodOxygen']),
      temperature: pickMetric(record, ['temperature', 'temperatura', 'temperatura_corporal', 'bodyTemperature']),
      steps: pickMetric(record, ['steps', 'steps_today']),
      systolic: pickMetric(record, ['bloodPressure.systolic', 'blood_pressure.systolic', 'presion_arterial_sistolica', 'presion_sistolica']),
      diastolic: pickMetric(record, ['bloodPressure.diastolic', 'blood_pressure.diastolic', 'presion_arterial_diastolica', 'presion_diastolica'])
    },
    rawData: data
  };
};

const buildRiskInputs = (riskMetadata = {}) => {
  const measurementKeys = new Set((riskMetadata.measurements || []).map((item) => item.key));
  return {
    heartRate: measurementKeys.has('heartRate') || measurementKeys.has('ecgAverageHeartRate') || measurementKeys.has('exerciseAverageHeartRate'),
    oxygenSaturation: measurementKeys.has('oxygenSaturation'),
    temperature: measurementKeys.has('temperature'),
    bloodPressure: measurementKeys.has('systolic') || measurementKeys.has('diastolic'),
    stress: measurementKeys.has('stress'),
    hrv: measurementKeys.has('hrv'),
    sleep: measurementKeys.has('sleepTotalMinutes'),
    steps: measurementKeys.has('steps')
  };
};

const buildMobileRiskSummary = (riskMetadata = {}, timestamp = null) => {
  const warningCount = (riskMetadata.outOfRange || []).filter((item) => item.status === 'warning').length;
  const criticalCount = (riskMetadata.outOfRange || []).filter((item) => item.status === 'critical').length;

  const riskTitle = riskMetadata.riskLevel === 'critical'
    ? 'Riesgo alto detectado'
    : riskMetadata.riskLevel === 'warning'
      ? 'Riesgo moderado detectado'
      : 'Riesgo actual estable';

  return {
    highlightTop: true,
    title: riskTitle,
    riskLevel: riskMetadata.riskLevel || 'normal',
    summary: riskMetadata.riskSummary || riskMetadata.diagnosis || 'Sin resumen de riesgo disponible',
    source: riskMetadata.generatedBy || 'rules',
    warningCount,
    criticalCount,
    ecgConsidered: Boolean(riskMetadata.ecgConsidered),
    exerciseConsidered: Boolean(riskMetadata.exerciseConsidered),
    analysisInputs: buildRiskInputs(riskMetadata),
    updatedAt: timestamp || riskMetadata.generatedAt || null
  };
};

const shouldRefreshRisk = (query = {}) => {
  const value = normalizeQueryValue(query.refreshRisk || query.updateRiskAI || query.runRiskAI).toLowerCase();
  return RISK_REFRESH_TRUE_VALUES.has(value);
};

const withRiskRefreshFallback = async (latest, records, refreshRisk) => {
  const baseRiskMetadata = latest?.riskMetadata?.context
    ? latest.riskMetadata
    : buildRuleAnalysis(latest, { contextRecords: records });

  if (!refreshRisk) {
    return {
      riskMetadata: baseRiskMetadata,
      refreshed: false,
      aiRefreshFallback: false,
      refreshError: null
    };
  }

  try {
    const aiRiskMetadata = await Promise.race([
      generateBiometricRiskAnalysis(latest, { contextRecords: records }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`RISK_AI_TIMEOUT_${MOBILE_RISK_AI_TIMEOUT_MS}MS`)), MOBILE_RISK_AI_TIMEOUT_MS);
      })
    ]);

    return {
      riskMetadata: aiRiskMetadata,
      refreshed: true,
      aiRefreshFallback: false,
      refreshError: null
    };
  } catch (error) {
    console.warn('mobile risk refresh fallback:', error.message || error);
    return {
      riskMetadata: baseRiskMetadata,
      refreshed: false,
      aiRefreshFallback: true,
      refreshError: error.message || 'RISK_AI_REFRESH_ERROR'
    };
  }
};

const buildHealthLookupFilters = (query) => {
  const deviceId = normalizeIdentifier(query.deviceId || query.deviceID || query.device_id);
  const email = normalizeIdentifier(query.email).toLowerCase();
  const phone = normalizeIdentifier(query.phone || query.telefono);
  const idPersonal = normalizeIdentifier(query.idPersonal || query.idpersonal).toUpperCase();
  const filters = [];

  if (deviceId) {
    filters.push({ deviceId });
  }
  if (email) {
    filters.push({ email });
    filters.push({ 'data.email': email });
  }
  if (phone) {
    filters.push({ telefono: phone });
    filters.push({ 'data.telefono': phone });
    filters.push({ 'data.phone': phone });
  }
  if (idPersonal) {
    filters.push({ idpersonal: idPersonal });
    filters.push({ 'data.idpersonal': idPersonal });
    filters.push({ 'data.idPersonal': idPersonal });
  }

  return {
    deviceId,
    email,
    phone,
    idPersonal,
    filters
  };
};

const getUserPushTokens = (user, { deviceId } = {}) => {
  const normalizedDeviceId = normalizeIdentifier(deviceId);
  const tokens = Array.isArray(user?.wellnessProfile?.mobilePushTokens)
    ? user.wellnessProfile.mobilePushTokens
    : [];

  const normalized = tokens
    .filter((entry) => entry && entry.enabled !== false)
    .filter((entry) => {
      if (!normalizedDeviceId) return true;
      const entryDeviceId = normalizeIdentifier(entry.deviceId);
      return !entryDeviceId || entryDeviceId === normalizedDeviceId;
    })
    .map((entry) => normalizePushToken(entry.token))
    .filter((token) => token.length >= 20);

  return Array.from(new Set(normalized));
};

const saveUserPushToken = async ({ user, token, deviceId, platform, appVersion }) => {
  const normalizedToken = normalizePushToken(token);
  if (normalizedToken.length < 20) {
    throw new Error('PUSH_TOKEN_INVALID');
  }

  const tokens = Array.isArray(user?.wellnessProfile?.mobilePushTokens)
    ? [...user.wellnessProfile.mobilePushTokens]
    : [];

  const now = new Date();
  const nextEntry = {
    token: normalizedToken,
    deviceId: normalizeIdentifier(deviceId),
    platform: normalizeQueryValue(platform) || 'android',
    appVersion: normalizeQueryValue(appVersion),
    lastSeenAt: now,
    enabled: true
  };

  const existingIndex = tokens.findIndex((entry) => normalizePushToken(entry?.token) === normalizedToken);
  if (existingIndex >= 0) {
    tokens[existingIndex] = {
      ...tokens[existingIndex],
      ...nextEntry
    };
  } else {
    tokens.unshift(nextEntry);
  }

  user.wellnessProfile = user.wellnessProfile || {};
  user.wellnessProfile.mobilePushTokens = tokens.slice(0, 12);
  await user.save();
};

const disableUserPushToken = async ({ user, token }) => {
  const normalizedToken = normalizePushToken(token);
  if (!normalizedToken) return false;

  const tokens = Array.isArray(user?.wellnessProfile?.mobilePushTokens)
    ? [...user.wellnessProfile.mobilePushTokens]
    : [];
  const idx = tokens.findIndex((entry) => normalizePushToken(entry?.token) === normalizedToken);

  if (idx < 0) return false;

  tokens[idx] = {
    ...tokens[idx],
    enabled: false,
    lastSeenAt: new Date()
  };

  user.wellnessProfile = user.wellnessProfile || {};
  user.wellnessProfile.mobilePushTokens = tokens;
  await user.save();
  return true;
};

router.get('/push/status', auth, admin, async (req, res) => {
  try {
    return res.json({
      success: true,
      status: getMobilePushStatus()
    });
  } catch (error) {
    console.error('mobile push status:', error);
    return res.status(500).json({ success: false, message: 'Error al consultar estado push', error: error.message });
  }
});

router.post('/push/register', async (req, res) => {
  try {
    const email = normalizeQueryValue(req.body?.email).toLowerCase();
    const token = normalizePushToken(req.body?.token);
    const deviceId = normalizeIdentifier(req.body?.deviceId || req.body?.deviceID || req.body?.device_id);
    const platform = normalizeQueryValue(req.body?.platform || 'android');
    const appVersion = normalizeQueryValue(req.body?.appVersion || req.body?.versionName);

    if (!email) {
      return res.status(400).json({ success: false, message: 'Debe enviar email para registrar token push.' });
    }
    if (token.length < 20) {
      return res.status(400).json({ success: false, message: 'Token push inválido.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado para registrar token push.' });
    }

    await saveUserPushToken({ user, token, deviceId, platform, appVersion });
    const activeTokens = getUserPushTokens(user, { deviceId: '' }).length;

    return res.json({
      success: true,
      message: 'Token push registrado correctamente.',
      activeTokens,
      status: getMobilePushStatus()
    });
  } catch (error) {
    console.error('mobile push register:', error);
    return res.status(500).json({ success: false, message: 'Error al registrar token push', error: error.message });
  }
});

router.post('/push/unregister', async (req, res) => {
  try {
    const email = normalizeQueryValue(req.body?.email).toLowerCase();
    const token = normalizePushToken(req.body?.token);
    if (!email || !token) {
      return res.status(400).json({ success: false, message: 'Debe enviar email y token para desregistrar push.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado para desregistrar token push.' });
    }

    const removed = await disableUserPushToken({ user, token });
    return res.json({
      success: true,
      removed,
      message: removed
        ? 'Token push desregistrado correctamente.'
        : 'Token push no estaba registrado para este usuario.'
    });
  } catch (error) {
    console.error('mobile push unregister:', error);
    return res.status(500).json({ success: false, message: 'Error al desregistrar token push', error: error.message });
  }
});

const findRecentRecordsForMobile = async (query, limit = 20) => {
  const { deviceId, email, phone, idPersonal, filters } = buildHealthLookupFilters(query);

  if (!filters.length) {
    return [];
  }

  const records = await HealthData.find({ $or: filters })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();

  if (!phone) return records;

  const requestedDigits = normalizePhoneDigits(phone);
  if (!requestedDigits) return records;

  return records.filter((record) => {
    const candidates = [record.telefono, record?.data?.telefono, record?.data?.phone]
      .map(normalizePhoneDigits)
      .filter(Boolean);

    return (
      candidates.some((candidate) => candidate.endsWith(requestedDigits) || requestedDigits.endsWith(candidate)) ||
      Boolean(deviceId && record.deviceId === deviceId) ||
      Boolean(email && String(record.email || '').toLowerCase() === email) ||
      Boolean(idPersonal && String(record.idpersonal || '').toUpperCase() === idPersonal)
    );
  });
};

const ROUTE_WINDOW_MS = {
  '1h': 1 * 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000
};

const resolveRouteWindow = (windowRaw) => {
  const key = normalizeQueryValue(windowRaw).toLowerCase() || '1h';
  if (ROUTE_WINDOW_MS[key]) {
    return { key, ms: ROUTE_WINDOW_MS[key] };
  }
  return { key: '1h', ms: ROUTE_WINDOW_MS['1h'] };
};

const parseRoutePoint = (point, fallbackTimestampMs) => {
  if (Array.isArray(point)) {
    const latitude = toFiniteNumber(point[0]);
    const longitude = toFiniteNumber(point[1]);
    const timestampMs = toFiniteNumber(point[2]) || fallbackTimestampMs;
    const altitude = toFiniteNumber(point[3]);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return {
      latitude,
      longitude,
      timestampMs,
      altitude: Number.isFinite(altitude) ? altitude : null
    };
  }

  if (point && typeof point === 'object') {
    const latitude = pickFirstFiniteNumber(point.latitude, point.lat);
    const longitude = pickFirstFiniteNumber(point.longitude, point.lng, point.lon);
    const pointTimestamp = normalizeTimestampValue(point.timestamp || point.capturedAt || point.time);
    const timestampMs = pointTimestamp ? new Date(pointTimestamp).getTime() : fallbackTimestampMs;
    const altitude = toFiniteNumber(point.altitude || point.altitudeMeters);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return {
      latitude,
      longitude,
      timestampMs,
      altitude: Number.isFinite(altitude) ? altitude : null
    };
  }

  return null;
};

const extractRoutePointsFromRecord = (record) => {
  const data = record?.data && typeof record.data === 'object' ? record.data : {};
  const normalizedRecordTimestamp = normalizeTimestampValue(record?.timestamp);
  const fallbackTimestampMs = normalizedRecordTimestamp ? new Date(normalizedRecordTimestamp).getTime() : Date.now();

  const route = data?.exerciseSession?.route;
  if (Array.isArray(route) && route.length) {
    return route
      .map((point) => parseRoutePoint(point, fallbackTimestampMs))
      .filter(Boolean)
      .map((point) => ({
        ...point,
        source: 'exercise_route',
        recordId: String(record?._id || '')
      }));
  }

  const gpsLocation = data?.gpsLocation && typeof data.gpsLocation === 'object' ? data.gpsLocation : null;
  if (gpsLocation) {
    const latitude = pickFirstFiniteNumber(gpsLocation.latitude, gpsLocation.lat);
    const longitude = pickFirstFiniteNumber(gpsLocation.longitude, gpsLocation.lng, gpsLocation.lon);
    const capturedAt = normalizeTimestampValue(gpsLocation.capturedAt);
    const timestampMs = capturedAt ? new Date(capturedAt).getTime() : fallbackTimestampMs;
    const altitude = toFiniteNumber(gpsLocation.altitude || gpsLocation.altitudeMeters);

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return [{
        latitude,
        longitude,
        timestampMs,
        altitude: Number.isFinite(altitude) ? altitude : null,
        source: 'gps_location',
        recordId: String(record?._id || '')
      }];
    }
  }

  return [];
};

const distanceMetersBetween = (left, right) => {
  const toRad = (deg) => deg * (Math.PI / 180);
  const earthRadius = 6371000;

  const dLat = toRad(right.latitude - left.latitude);
  const dLon = toRad(right.longitude - left.longitude);
  const lat1 = toRad(left.latitude);
  const lat2 = toRad(right.latitude);

  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

const buildHabitsPayloadFromUser = (user) => {
  const profile = user?.wellnessProfile || {};
  const logs = Array.isArray(user?.wellnessLogs) ? user.wellnessLogs : [];
  const habitLogs = logs
    .filter((log) => log.module === 'habits')
    .sort((a, b) => new Date(b.logDate) - new Date(a.logDate));
  const hydrationToday = habitLogs
    .filter((log) => {
      const date = new Date(log.logDate);
      const today = new Date();
      return date.toDateString() === today.toDateString() && log.data?.type === 'hydration';
    })
    .reduce((sum, log) => sum + (Number(log.data?.ml) || 0), 0);
  const completedToday = habitLogs
    .filter((log) => {
      const date = new Date(log.logDate);
      const today = new Date();
      return date.toDateString() === today.toDateString() && log.data?.type === 'habit_check';
    })
    .map((log) => log.data?.label)
    .filter(Boolean);
  const programmedReminders = Array.isArray(profile.importantReminders)
    ? profile.importantReminders.filter((item) => item.enabled)
    : [];
  const eventAlerts = Array.isArray(profile.eventAlerts)
    ? profile.eventAlerts
    : DEFAULT_EVENT_ALERTS;
  const mode = profile.habitsGoalMode === 'athlete' ? 'Deportista' : 'Vida sana';
  const sport = profile.primarySport || 'vida_sana';

  return {
    ...mobileHabitsPayload,
    source: 'database',
    title: 'Hábitos saludables',
    subtitle: `Plan desde base de datos · ${mode}${sport !== 'vida_sana' ? ` · ${sport}` : ''}`,
    priorityAction: programmedReminders[0]
      ? `Próximo hábito: ${programmedReminders[0].label} entre ${programmedReminders[0].startTime || programmedReminders[0].time} y ${programmedReminders[0].endTime || '--:--'}.`
      : mobileHabitsPayload.priorityAction,
    reminders: programmedReminders.length
      ? programmedReminders.map((item) => ({
        time: `${item.startTime || item.time}-${item.endTime || item.startTime || item.time}`,
        label: item.label,
        source: `Cada ${item.frequencyMinutes || 60} min · ${item.vibrationCount || 1} vib`
      }))
      : mobileHabitsPayload.reminders,
    eventAlerts: eventAlerts.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      startTime: item.startTime || '09:00',
      endTime: item.endTime || '21:00',
      enabled: item.enabled !== false,
      vibrationCount: Math.min(Math.max(parseInt(item.vibrationCount, 10) || 1, 1), 10),
      aiRecommended: item.aiRecommended !== false,
      aiReason: item.aiReason || ''
    })),
    categories: [
      {
        title: 'Perfil de hábitos',
        summary: `${mode}. Meta pasos: ${profile.activityGoalSteps || 8000}. Meta kcal: ${profile.activityGoalCalories || 500}. Sueño meta: ${profile.sleepGoalMinutes || 480} min.`,
        actions: [
          profile.habitsGoalMode === 'athlete'
            ? `Entrenar ${profile.weeklyTrainingDays || 3} días/semana con foco en ${sport}.`
            : 'Mantener caminata, movilidad y hábitos simples diarios.',
          `Hidratación meta: ${profile.hydrationGoalMl || 2000} ml. Hoy registrado: ${hydrationToday} ml.`
        ]
      },
      {
        title: 'Completado hoy',
        summary: completedToday.length ? 'Hábitos marcados desde la web.' : 'Aún no hay hábitos marcados hoy.',
        actions: completedToday.length ? completedToday : ['Abrir la web para marcar avance diario.']
      },
      ...mobileHabitsPayload.categories
    ],
    recentLogs: habitLogs.slice(0, 5).map((log) => ({
      date: formatHabitLogDate(log.logDate),
      label: log.data?.label || (log.data?.type === 'hydration' ? `${log.data?.ml || 0} ml agua` : log.data?.type || 'Registro'),
      source: log.data?.source || 'Base de datos'
    }))
  };
};

router.post('/goals', async (req, res) => {
  try {
    const email = normalizeQueryValue(req.body?.email).toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: 'Debe enviar email para actualizar objetivos.' });
    }

    const steps = Number(req.body?.activityGoalSteps);
    const calories = Number(req.body?.activityGoalCalories);
    const nextSteps = Number.isFinite(steps) ? Math.min(Math.max(Math.round(steps), 1000), 50000) : null;
    const nextCalories = Number.isFinite(calories) ? Math.min(Math.max(Math.round(calories), 100), 5000) : null;

    if (nextSteps === null && nextCalories === null) {
      return res.status(400).json({ success: false, message: 'Debe enviar activityGoalSteps o activityGoalCalories.' });
    }

    const set = {};
    if (nextSteps !== null) set['wellnessProfile.activityGoalSteps'] = nextSteps;
    if (nextCalories !== null) set['wellnessProfile.activityGoalCalories'] = nextCalories;

    const user = await User.findOneAndUpdate(
      { email },
      { $set: set },
      { new: true }
    ).select('name email phone rut wellnessProfile');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado para actualizar objetivos.' });
    }

    return res.json({
      success: true,
      message: 'Objetivos diarios actualizados',
      goals: {
        activityGoalSteps: user?.wellnessProfile?.activityGoalSteps || 8000,
        activityGoalCalories: user?.wellnessProfile?.activityGoalCalories || 500
      }
    });
  } catch (error) {
    console.error('mobile goals:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar objetivos diarios', error: error.message });
  }
});

router.post('/help', async (req, res) => {
  try {
    if (!isFeatureEnabled('HELP_BUTTON')) {
      return res.status(404).json({ success: false, code: 'FEATURE_DISABLED', message: 'Help Button no está disponible.' });
    }

    const email = normalizeQueryValue(req.body?.email).toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Debe enviar email para registrar Assistance Request.' });
    }

    const source = normalizeQueryValue(req.body?.source || 'help_button');
    const deviceId = normalizeQueryValue(req.body?.deviceId || req.body?.deviceID || req.body?.device_id);
    const dataType = Number.isFinite(Number(req.body?.dataType)) ? Number(req.body.dataType) : null;
    const rawData = normalizeQueryValue(req.body?.rawData || req.body?.raw || 'help_button');
    const testMode = req.body?.testMode === true || req.body?.testMode === 'true';
    const { latitude, longitude } = extractCoordinatesFromPayload(req.body || {});

    const user = await User.findOne({ email }).select('email name wellnessProfile.panicAlertContacts');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado para registrar Assistance Request.' });
    }

    const helpResult = await registerPanicAlertForUser({
      user,
      source,
      deviceId,
      dataType,
      rawData,
      latitude,
      longitude,
      testMode
    });

    return res.json({
      success: true,
      message: testMode
        ? 'Modo de prueba: Assistance Request registrada sin notificar contactos.'
        : 'Assistance Request registrada. Se notificó a contactos autorizados (no es emergencia médica ni 911).',
      alert: helpResult.alert,
      emailNotification: helpResult.emailNotification,
      whatsappNotification: helpResult.whatsappNotification
    });
  } catch (error) {
    console.error('mobile help:', error);
    return res.status(500).json({ success: false, message: 'Error al registrar Assistance Request', error: error.message });
  }
});

router.post('/panic', async (req, res) => {
  try {
    if (!isFeatureEnabled('LEGACY_PANIC_ALIAS') && !isFeatureEnabled('HELP_BUTTON')) {
      return res.status(404).json({ success: false, code: 'FEATURE_DISABLED', message: 'Endpoint legacy desactivado.' });
    }

    const email = normalizeQueryValue(req.body?.email).toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Debe enviar email para registrar Assistance Request.' });
    }

    const source = normalizeQueryValue(req.body?.source || 'watch_button');
    const deviceId = normalizeQueryValue(req.body?.deviceId || req.body?.deviceID || req.body?.device_id);
    const dataType = Number.isFinite(Number(req.body?.dataType)) ? Number(req.body.dataType) : null;
    const rawData = normalizeQueryValue(req.body?.rawData || req.body?.raw || '');
    const { latitude, longitude } = extractCoordinatesFromPayload(req.body || {});

    const user = await User.findOne({ email }).select('email name wellnessProfile.panicAlertContacts');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado para registrar Assistance Request.' });
    }

    const panicResult = await registerPanicAlertForUser({
      user,
      source,
      deviceId,
      dataType,
      rawData,
      latitude,
      longitude
    });

    return res.json({
      success: true,
      message: 'Assistance Request registrada (alias legacy /panic). No es emergencia médica ni 911.',
      deprecated: true,
      prefer: '/api/mobile/help',
      alert: panicResult.alert,
      emailNotification: panicResult.emailNotification,
      whatsappNotification: panicResult.whatsappNotification
    });
  } catch (error) {
    console.error('mobile panic:', error);
    return res.status(500).json({ success: false, message: 'Error al registrar Assistance Request', error: error.message });
  }
});

router.post('/watch-button', async (req, res) => {
  try {
    const email = normalizeQueryValue(req.body?.email).toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Debe enviar email para registrar evento del botón de pulsera.' });
    }

    const actionRaw = normalizeQueryValue(req.body?.action || req.body?.buttonAction || req.body?.event || 'unknown');
    const action = actionRaw.toLowerCase();
    const source = normalizeQueryValue(req.body?.source || 'watch_button');
    const deviceId = normalizeQueryValue(req.body?.deviceId || req.body?.deviceID || req.body?.device_id);
    const dataType = Number.isFinite(Number(req.body?.dataType)) ? Number(req.body.dataType) : null;
    const rawData = normalizeQueryValue(req.body?.rawData || req.body?.raw || '');
    const { latitude, longitude } = extractCoordinatesFromPayload(req.body || {});
    const triggerPanic = req.body?.triggerPanic === true || req.body?.triggerPanic === 'true'
      || req.body?.triggerHelp === true || req.body?.triggerHelp === 'true';
    const testMode = req.body?.testMode === true || req.body?.testMode === 'true';

    const user = await User.findOne({ email }).select('email name wellnessProfile.eventAlerts wellnessProfile.panicAlertContacts');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado para registrar evento de pulsera.' });
    }

    const buttonEventLog = {
      module: 'habits',
      logDate: new Date(),
      data: {
        type: 'watch_button_event',
        action,
        source,
        deviceId,
        dataType,
        rawData,
        triggeredAt: new Date().toISOString(),
        location: (Number.isFinite(latitude) && Number.isFinite(longitude))
          ? { latitude, longitude }
          : null,
        mapUrl: (Number.isFinite(latitude) && Number.isFinite(longitude))
          ? `https://www.google.com/maps?q=${latitude},${longitude}`
          : null
      }
    };

    await User.updateOne(
      { _id: user._id },
      {
        $push: {
          wellnessLogs: {
            $each: [buttonEventLog],
            $position: 0,
            $slice: 300
          }
        }
      }
    );

    const profileAlerts = Array.isArray(user?.wellnessProfile?.eventAlerts)
      ? user.wellnessProfile.eventAlerts
      : [];
    const panicAlertConfig = profileAlerts.find((item) => item?.id === 'panic_button' || item?.id === 'help_button');
    const panicAlertEnabled = panicAlertConfig ? panicAlertConfig.enabled !== false : true;
    const cameraNotifyPanic = MOBILE_PANIC_CAMERA_NOTIFY_ENABLED && isCameraNotifyPanicEvent({ action, rawData });
    const shouldTriggerPanic = isFeatureEnabled('HELP_BUTTON')
      && panicAlertEnabled
      && (PANIC_ACTION_VALUES.has(action) || triggerPanic || cameraNotifyPanic);

    if (!shouldTriggerPanic) {
      return res.json({
        success: true,
        action,
        panicTriggered: false,
        helpTriggered: false,
        panicAlertEnabled,
        message: 'Evento de botón registrado sin activar Assistance Request.'
      });
    }

    const panicResult = await registerPanicAlertForUser({
      user,
      source,
      deviceId,
      dataType,
      rawData: rawData || `watch_action:${action}`,
      latitude,
      longitude,
      testMode
    });

    return res.json({
      success: true,
      action,
      panicTriggered: true,
      helpTriggered: true,
      cameraNotifyPanic,
      panicAlertEnabled,
      message: 'Evento de botón registrado y Assistance Request activada (no es 911 ni emergencia médica).',
      alert: panicResult.alert,
      emailNotification: panicResult.emailNotification,
      whatsappNotification: panicResult.whatsappNotification
    });
  } catch (error) {
    console.error('mobile watch-button:', error);
    return res.status(500).json({ success: false, message: 'Error al registrar evento de botón de pulsera', error: error.message });
  }
});

// Temporary endpoint to validate GPS payloads from the phone without triggering help alerts.
router.post('/gps-check', async (req, res) => {
  try {
    const { latitude, longitude } = extractCoordinatesFromPayload(req.body || {});
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'No se recibieron coordenadas validas. Envie latitude/longitude, lat/lng o location.latitude/location.longitude.'
      });
    }

    const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const email = normalizeQueryValue(req.body?.email).toLowerCase();

    let matchedUser = false;
    if (email) {
      const user = await User.findOne({ email }).select('_id');
      matchedUser = Boolean(user);
    }

    return res.json({
      success: true,
      message: 'GPS recibido correctamente.',
      gps: {
        latitude,
        longitude,
        mapUrl
      },
      matchedUser,
      receivedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('mobile gps-check:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al validar GPS',
      error: error.message
    });
  }
});

// Admin creates a live GPS request for mobile app to resolve in real time.
router.post('/location-requests', auth, admin, async (req, res) => {
  try {
    setNoCacheHeaders(res);
    pruneExpiredLiveLocationRequests();

    const email = normalizeQueryValue(req.body?.email).toLowerCase();
    const deviceId = normalizeIdentifier(req.body?.deviceId || req.body?.deviceID || req.body?.device_id);
    const timeoutSecondsInput = parseInt(req.body?.timeoutSeconds, 10);
    const timeoutSeconds = Number.isFinite(timeoutSecondsInput)
      ? Math.min(Math.max(timeoutSecondsInput, 8), 90)
      : LIVE_LOCATION_REQUEST_TIMEOUT_SECONDS;

    if (!email && !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Debe enviar email o deviceId para solicitar ubicación en vivo.'
      });
    }

    const user = email
      ? await User.findOne({ email }).select('_id email wellnessProfile.mobilePushTokens')
      : null;

    const requestId = crypto.randomUUID();
    const createdAtMs = Date.now();
    const requestedAt = new Date(createdAtMs).toISOString();
    const expiresAtMs = createdAtMs + (timeoutSeconds * 1000);
    const expiresAt = new Date(expiresAtMs).toISOString();

    liveLocationRequests.set(requestId, {
      requestId,
      status: 'pending',
      email,
      deviceId,
      userId: user?._id ? String(user._id) : null,
      requestedBy: req.user?._id ? String(req.user._id) : null,
      createdAtMs,
      requestedAt,
      expiresAtMs,
      expiresAt,
      respondedAt: null,
      gps: null,
      responseSource: null,
      responsePayload: null,
      error: null,
      expiredAt: null,
      lastMobilePollAt: null,
      mobilePollCount: 0
    });

    let pushDispatch = null;
    if (user) {
      const pushTokens = getUserPushTokens(user, { deviceId });
      pushDispatch = await sendLiveLocationRequestPush({
        tokens: pushTokens,
        requestId,
        requestedAt,
        expiresAt,
        email,
        deviceId
      });

      if (Array.isArray(pushDispatch?.invalidTokens) && pushDispatch.invalidTokens.length) {
        for (const invalidToken of pushDispatch.invalidTokens) {
          await disableUserPushToken({ user, token: invalidToken });
        }
      }
    }

    return res.json({
      success: true,
      message: 'Solicitud de ubicación creada. Esperando respuesta de app móvil.',
      requestId,
      requestedAt,
      expiresAt,
      timeoutSeconds,
      matchedUser: Boolean(user),
      pushDispatch
    });
  } catch (error) {
    console.error('mobile location-requests create:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear solicitud de ubicación en vivo',
      error: error.message
    });
  }
});

// Mobile app polls pending live GPS requests.
router.get('/location-requests/pending', async (req, res) => {
  try {
    setNoCacheHeaders(res);
    pruneExpiredLiveLocationRequests();

    const email = normalizeQueryValue(req.query?.email).toLowerCase();
    const deviceId = normalizeIdentifier(req.query?.deviceId || req.query?.deviceID || req.query?.device_id);

    if (!email && !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Debe enviar email o deviceId para consultar solicitudes pendientes.'
      });
    }

    const allPending = Array.from(liveLocationRequests.values())
      .filter((request) => request.status === 'pending')
      .sort((left, right) => left.createdAtMs - right.createdAtMs);

    const pending = allPending
      .filter((request) => matchesLiveLocationRequest(request, { email, deviceId }))
      .sort((left, right) => left.createdAtMs - right.createdAtMs);

    const nextRequest = pending[0] || allPending[0] || null;
    if (!nextRequest) {
      return res.json({
        success: true,
        hasPendingRequest: false,
        request: null
      });
    }

    liveLocationRequests.set(nextRequest.requestId, {
      ...nextRequest,
      lastMobilePollAt: new Date().toISOString(),
      mobilePollCount: (Number(nextRequest.mobilePollCount) || 0) + 1
    });

    return res.json({
      success: true,
      hasPendingRequest: true,
      matchedByFilter: pending.length > 0,
      request: {
        requestId: nextRequest.requestId,
        email: nextRequest.email,
        deviceId: nextRequest.deviceId,
        requestedAt: nextRequest.requestedAt,
        expiresAt: nextRequest.expiresAt,
        command: 'capture_current_location',
        reason: 'admin_live_location_request'
      }
    });
  } catch (error) {
    console.error('mobile location-requests pending:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes pendientes',
      error: error.message
    });
  }
});

// Mobile app resolves a pending live GPS request.
router.post('/location-requests/:requestId/response', async (req, res) => {
  try {
    setNoCacheHeaders(res);
    pruneExpiredLiveLocationRequests();

    const requestId = normalizeIdentifier(req.params?.requestId);
    const request = liveLocationRequests.get(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Solicitud de ubicación no encontrada.' });
    }
    if (request.status !== 'pending') {
      return res.status(409).json({ success: false, message: 'La solicitud ya no está pendiente.', status: request.status });
    }

    const responseEmail = normalizeQueryValue(req.body?.email).toLowerCase();
    const responseDeviceId = normalizeIdentifier(req.body?.deviceId || req.body?.deviceID || req.body?.device_id);

    if (request.email && responseEmail && request.email !== responseEmail) {
      return res.status(403).json({ success: false, message: 'Email no coincide con la solicitud pendiente.' });
    }
    if (request.deviceId && responseDeviceId && request.deviceId !== responseDeviceId) {
      return res.status(403).json({ success: false, message: 'deviceId no coincide con la solicitud pendiente.' });
    }

    const { latitude, longitude } = extractCoordinatesFromPayload(req.body || {});
    const responseError = normalizeQueryValue(req.body?.error || req.body?.reason);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      if (!responseError) {
        return res.status(400).json({
          success: false,
          message: 'No se recibieron coordenadas válidas para responder solicitud en vivo.'
        });
      }

      const failedRequest = {
        ...request,
        status: 'failed',
        respondedAt: new Date().toISOString(),
        error: responseError,
        responseSource: normalizeQueryValue(req.body?.source || 'mobile_app')
      };
      liveLocationRequests.set(requestId, failedRequest);

      return res.json({
        success: true,
        status: 'failed',
        message: 'Solicitud marcada como fallida por la app móvil.',
        request: buildLiveLocationRequestSnapshot(failedRequest)
      });
    }

    const gps = {
      latitude,
      longitude,
      mapUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
      accuracy: toFiniteNumber(req.body?.accuracy ?? req.body?.location?.accuracy ?? req.body?.gps?.accuracy ?? req.body?.coords?.accuracy)
    };

    const completedRequest = {
      ...request,
      status: 'completed',
      respondedAt: new Date().toISOString(),
      gps,
      responseSource: normalizeQueryValue(req.body?.source || 'mobile_app_live'),
      responsePayload: req.body || null,
      error: null
    };
    liveLocationRequests.set(requestId, completedRequest);

    return res.json({
      success: true,
      status: 'completed',
      message: 'Ubicación en vivo recibida correctamente.',
      request: buildLiveLocationRequestSnapshot(completedRequest)
    });
  } catch (error) {
    console.error('mobile location-requests response:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al responder solicitud de ubicación en vivo',
      error: error.message
    });
  }
});

// Admin polls request status until mobile app responds.
router.get('/location-requests/:requestId/status', auth, admin, async (req, res) => {
  try {
    setNoCacheHeaders(res);
    pruneExpiredLiveLocationRequests();

    const requestId = normalizeIdentifier(req.params?.requestId);
    const request = liveLocationRequests.get(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Solicitud de ubicación no encontrada.' });
    }

    const snapshot = buildLiveLocationRequestSnapshot(request);
    const statusMessage = request.status === 'completed'
      ? 'Ubicación recibida desde app móvil.'
      : request.status === 'failed'
        ? 'La app móvil respondió sin coordenadas válidas.'
        : request.status === 'expired'
          ? 'La solicitud expiró sin respuesta de la app móvil.'
          : (!request.lastMobilePollAt
            ? 'Esperando respuesta de la app móvil (aún no consulta pendientes).'
            : 'Esperando respuesta de la app móvil (ya consultó pendientes).');

    return res.json({
      success: true,
      ...snapshot,
      message: statusMessage,
      receivedPayload: request.responsePayload || null
    });
  } catch (error) {
    console.error('mobile location-requests status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar estado de solicitud en vivo',
      error: error.message
    });
  }
});

router.get('/habits', async (req, res) => {
  try {
    const requestDeviceId = normalizeIdentifier(req.query.deviceId || req.query.deviceID || req.query.device_id);
    const requestEmail = normalizeQueryValue(req.query.email).toLowerCase();
    const user = await findMobileUser(req.query);
    const payload = user ? buildHabitsPayloadFromUser(user) : { ...mobileHabitsPayload, source: 'server-default' };
    const pendingLiveLocationRequest = getNextPendingLiveLocationRequest({
      email: requestEmail || user?.email,
      deviceId: requestDeviceId
    });

    res.json({
      ...payload,
      generatedAt: new Date().toISOString(),
      matchedUser: Boolean(user),
      pendingLiveLocationRequest
    });
  } catch (error) {
    console.error('mobile habits:', error);
    res.status(500).json({ success: false, message: 'Error al obtener hábitos', error: error.message });
  }
});

router.get('/biometrics/latest', async (req, res) => {
  try {
    const refreshRisk = shouldRefreshRisk(req.query);
    const records = await findRecentRecordsForMobile(req.query, refreshRisk ? 30 : 1);
    const latest = records[0] || null;

    if (!latest) {
      return res.status(200).json({
        success: true,
        hasData: false,
        message: 'No hay lecturas biométricas para los filtros enviados',
        record: null
      });
    }

    const riskResult = await withRiskRefreshFallback(latest, records, refreshRisk);

    res.json({
      success: true,
      hasData: true,
      record: serializeMobileBiometricRecord(latest),
      risk: {
        refreshed: riskResult.refreshed,
        aiRefreshFallback: riskResult.aiRefreshFallback,
        refreshError: riskResult.refreshError,
        riskMetadata: riskResult.riskMetadata,
        homeSummary: buildMobileRiskSummary(riskResult.riskMetadata, latest.timestamp)
      }
    });
  } catch (error) {
    console.error('mobile biometrics latest:', error);
    res.status(500).json({ success: false, message: 'Error al obtener última lectura biométrica', error: error.message });
  }
});

router.get('/biometrics/history', async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 200) : 30;
    const records = await findRecentRecordsForMobile(req.query, limit);

    res.json({
      success: true,
      count: records.length,
      records: records.map(serializeMobileBiometricRecord)
    });
  } catch (error) {
    console.error('mobile biometrics history:', error);
    res.status(500).json({ success: false, message: 'Error al obtener historial biométrico', error: error.message });
  }
});

router.get('/routes/history', async (req, res) => {
  try {
    const { filters } = buildHealthLookupFilters(req.query || {});
    if (!filters.length) {
      return res.status(400).json({
        success: false,
        message: 'Debe enviar al menos un filtro (email, deviceId, phone o idPersonal).'
      });
    }

    const { key: windowKey, ms: windowMs } = resolveRouteWindow(req.query.window);
    const nowMs = Date.now();
    const sinceMs = nowMs - windowMs;

    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 50), 2000)
      : 800;

    const records = await findRecentRecordsForMobile(req.query, limit);
    const windowedRecords = records.filter((record) => {
      const normalized = normalizeTimestampValue(record?.timestamp);
      if (!normalized) return false;
      const timestampMs = new Date(normalized).getTime();
      return Number.isFinite(timestampMs) && timestampMs >= sinceMs;
    });

    const points = windowedRecords
      .flatMap(extractRoutePointsFromRecord)
      .filter((point) => Number.isFinite(point.timestampMs) && point.timestampMs >= sinceMs)
      .sort((a, b) => a.timestampMs - b.timestampMs);

    const dedupedPoints = [];
    points.forEach((point) => {
      const prev = dedupedPoints[dedupedPoints.length - 1];
      if (
        prev
        && prev.latitude === point.latitude
        && prev.longitude === point.longitude
        && Math.abs(prev.timestampMs - point.timestampMs) < 1000
      ) {
        return;
      }
      dedupedPoints.push(point);
    });

    let totalDistanceMeters = 0;
    for (let index = 1; index < dedupedPoints.length; index += 1) {
      totalDistanceMeters += distanceMetersBetween(dedupedPoints[index - 1], dedupedPoints[index]);
    }

    return res.json({
      success: true,
      window: windowKey,
      since: new Date(sinceMs).toISOString(),
      until: new Date(nowMs).toISOString(),
      recordsScanned: records.length,
      recordsInWindow: windowedRecords.length,
      pointsCount: dedupedPoints.length,
      totalDistanceMeters: Math.round(totalDistanceMeters),
      points: dedupedPoints.map((point) => ({
        latitude: point.latitude,
        longitude: point.longitude,
        timestamp: new Date(point.timestampMs).toISOString(),
        altitude: point.altitude,
        source: point.source,
        recordId: point.recordId
      }))
    });
  } catch (error) {
    console.error('mobile routes history:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener historial de rutas',
      error: error.message
    });
  }
});

router.get('/biometrics/devices', async (req, res) => {
  try {
    const records = await findRecentRecordsForMobile(req.query, 200);
    const byDevice = new Map();

    records.forEach((record) => {
      if (!record.deviceId) return;
      if (!byDevice.has(record.deviceId)) {
        byDevice.set(record.deviceId, {
          deviceId: record.deviceId,
          latestTimestamp: record.timestamp,
          latestRecord: serializeMobileBiometricRecord(record),
          records: 1
        });
      } else {
        const current = byDevice.get(record.deviceId);
        current.records += 1;
      }
    });

    res.json({
      success: true,
      count: byDevice.size,
      devices: Array.from(byDevice.values())
    });
  } catch (error) {
    console.error('mobile biometrics devices:', error);
    res.status(500).json({ success: false, message: 'Error al obtener dispositivos biométricos', error: error.message });
  }
});

// Alias simple para integraciones móviles que consultan /api/mobile/biometrics
router.get('/biometrics', async (req, res) => {
  try {
    const refreshRisk = shouldRefreshRisk(req.query);
    const records = await findRecentRecordsForMobile(req.query, refreshRisk ? 30 : 1);
    const latest = records[0] || null;

    const riskResult = latest
      ? await withRiskRefreshFallback(latest, records, refreshRisk)
      : null;

    return res.json({
      success: true,
      hasData: Boolean(latest),
      record: serializeMobileBiometricRecord(latest),
      risk: latest
        ? {
            refreshed: riskResult.refreshed,
            aiRefreshFallback: riskResult.aiRefreshFallback,
            refreshError: riskResult.refreshError,
            riskMetadata: riskResult.riskMetadata,
            homeSummary: buildMobileRiskSummary(riskResult.riskMetadata, latest.timestamp)
          }
        : null
    });
  } catch (error) {
    console.error('mobile biometrics alias:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener biométricos', error: error.message });
  }
});

router.get('/risk/:deviceId', async (req, res) => {
  try {
    const recentRecords = await HealthData.find({ deviceId: req.params.deviceId }).sort({ timestamp: -1 }).limit(30);
    const latest = recentRecords[0] || null;
    if (!latest) {
      return res.status(404).json({ success: false, message: 'Sin análisis de riesgo disponible' });
    }

    const riskResult = await withRiskRefreshFallback(latest, recentRecords, true);
    const riskMetadata = riskResult.riskMetadata;
    latest.riskMetadata = riskMetadata;
    if (latest.data && typeof latest.data === 'object') {
      latest.data.riskMetadata = riskMetadata;
    }
    await latest.save();

    res.json({
      success: true,
      deviceId: req.params.deviceId,
      timestamp: latest.timestamp,
      refreshed: riskResult.refreshed,
      aiRefreshFallback: riskResult.aiRefreshFallback,
      refreshError: riskResult.refreshError,
      ecgConsidered: Boolean(riskMetadata?.ecgConsidered),
      exerciseConsidered: Boolean(riskMetadata?.exerciseConsidered),
      riskMetadata,
      homeSummary: buildMobileRiskSummary(riskMetadata, latest.timestamp)
    });
  } catch (error) {
    console.error('mobile risk:', error);
    res.status(500).json({ success: false, message: 'Error al obtener riesgo', error: error.message });
  }
});

module.exports = router;
