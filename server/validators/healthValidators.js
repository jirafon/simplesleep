const { check } = require('express-validator');

const hasTopLevelBiometricMetrics = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return false;
  }

  const metricKeys = [
    'heartRate',
    'frecuencia_cardiaca',
    'heart_rate',
    'oxygenSaturation',
    'saturacion_oxigeno',
    'spo2',
    'bloodOxygen',
    'temperature',
    'temperatura',
    'temperatura_corporal',
    'bodyTemperature',
    'steps',
    'steps_today',
    'stress',
    'hrv',
    'sleepData',
    'sleepHistory',
    'sleepSummary',
    'bloodPressure',
    'blood_pressure',
    'presion_arterial_sistolica',
    'presion_sistolica',
    'presion_arterial_diastolica',
    'presion_diastolica',
    'cgMobile',
    'exerciseSession',
    'gpsSession'
  ];

  return metricKeys.some((key) => Object.prototype.hasOwnProperty.call(body, key));
};

const isValidTimestamp = (value) => {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const epochMs = value < 1e11 ? value * 1000 : value;
    return !Number.isNaN(new Date(epochMs).getTime());
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return false;

    if (/^\d+$/.test(trimmed)) {
      const numeric = Number(trimmed);
      if (!Number.isFinite(numeric)) return false;
      const epochMs = numeric < 1e11 ? numeric * 1000 : numeric;
      return !Number.isNaN(new Date(epochMs).getTime());
    }

    return !Number.isNaN(new Date(trimmed).getTime());
  }

  return false;
};

const healthDataValidationRules = [
  check('deviceId')
    .custom((value, { req }) => {
      const candidate = value ?? req.body?.deviceID ?? req.body?.device_id;
      return typeof candidate === 'string' && candidate.trim().length > 0;
    })
    .withMessage('Device ID is required'),
  check('timestamp')
    .custom((value, { req }) => {
      const candidate = value ?? req.body?.timeStamp;
      return isValidTimestamp(candidate);
    })
    .withMessage('Timestamp must be a valid date (ISO, epoch ms, or epoch seconds)'),
  check('data')
    .custom((value, { req }) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return true;
      }
      return hasTopLevelBiometricMetrics(req.body);
    })
    .withMessage('Data must be a valid JSON object or include biometric metrics at top-level'),
];

module.exports = healthDataValidationRules;