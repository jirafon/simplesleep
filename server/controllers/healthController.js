const HealthData = require('../models/HealthData');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { generateBiometricAlertReport } = require('../services/biometricAlertService');
const {
  generateBiometricRiskAnalysis,
  buildRuleAnalysis,
  isAIAvailable: isRiskAIAvailable
} = require('../services/biometricRiskAnalysisService');

const toRoundedMinutes = (seconds) => {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) {
    return null;
  }

  return Math.round(seconds / 60);
};

const normalizeSleepData = (sleepData) => {
  if (!sleepData || typeof sleepData !== 'object' || Array.isArray(sleepData)) {
    return sleepData;
  }

  return {
    ...sleepData,
    totalMinutes: typeof sleepData.totalMinutes === 'number' ? sleepData.totalMinutes : toRoundedMinutes(sleepData.totalSleepDuration),
    deepMinutes: typeof sleepData.deepMinutes === 'number' ? sleepData.deepMinutes : toRoundedMinutes(sleepData.deepSleepDuration),
    lightMinutes: typeof sleepData.lightMinutes === 'number' ? sleepData.lightMinutes : toRoundedMinutes(sleepData.shallowSleepDuration),
    remMinutes: typeof sleepData.remMinutes === 'number' ? sleepData.remMinutes : toRoundedMinutes(sleepData.rapidDuration),
    awakeMinutes: typeof sleepData.awakeMinutes === 'number' ? sleepData.awakeMinutes : toRoundedMinutes(sleepData.awakeDuration),
    sleepTimeMinutes: typeof sleepData.sleepTimeMinutes === 'number' ? sleepData.sleepTimeMinutes : sleepData.sleepTime,
    wakeTimeMinutes: typeof sleepData.wakeTimeMinutes === 'number' ? sleepData.wakeTimeMinutes : sleepData.wakeTime
  };
};

const normalizeSleepHistory = (sleepHistory) => {
  if (!Array.isArray(sleepHistory)) {
    return sleepHistory;
  }

  return sleepHistory.map((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return entry;
    }

    return {
      ...entry,
      totalMinutes: typeof entry.totalMinutes === 'number'
        ? entry.totalMinutes
        : (entry.deepMinutes || 0) + (entry.lightMinutes || 0) + (entry.remMinutes || 0) + (entry.awakeMinutes || 0)
    };
  });
};

const normalizeOptionalString = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
};

const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const normalized = typeof value === 'string' ? value.trim().replace(',', '.') : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const pickFirstFiniteNumber = (...values) => {
  for (const value of values) {
    const parsed = toFiniteNumber(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const extractGpsLocation = (payload = {}, normalizedData = {}) => {
  const payloadLocation = payload?.location && typeof payload.location === 'object' ? payload.location : {};
  const payloadGps = payload?.gps && typeof payload.gps === 'object' ? payload.gps : {};
  const payloadCoords = payload?.coords && typeof payload.coords === 'object' ? payload.coords : {};

  const dataLocation = normalizedData?.location && typeof normalizedData.location === 'object' ? normalizedData.location : {};
  const dataGps = normalizedData?.gps && typeof normalizedData.gps === 'object' ? normalizedData.gps : {};
  const dataCoords = normalizedData?.coords && typeof normalizedData.coords === 'object' ? normalizedData.coords : {};
  const dataGpsLocation = normalizedData?.gpsLocation && typeof normalizedData.gpsLocation === 'object' ? normalizedData.gpsLocation : {};

  const latitude = pickFirstFiniteNumber(
    payload?.latitude,
    payload?.lat,
    payload?.gpsLatitude,
    payloadLocation?.latitude,
    payloadLocation?.lat,
    payloadGps?.latitude,
    payloadGps?.lat,
    payloadCoords?.latitude,
    payloadCoords?.lat,
    normalizedData?.latitude,
    normalizedData?.lat,
    normalizedData?.gpsLatitude,
    dataLocation?.latitude,
    dataLocation?.lat,
    dataGps?.latitude,
    dataGps?.lat,
    dataCoords?.latitude,
    dataCoords?.lat,
    dataGpsLocation?.latitude,
    dataGpsLocation?.lat
  );

  const longitude = pickFirstFiniteNumber(
    payload?.longitude,
    payload?.lng,
    payload?.lon,
    payload?.gpsLongitude,
    payloadLocation?.longitude,
    payloadLocation?.lng,
    payloadLocation?.lon,
    payloadGps?.longitude,
    payloadGps?.lng,
    payloadGps?.lon,
    payloadCoords?.longitude,
    payloadCoords?.lng,
    payloadCoords?.lon,
    normalizedData?.longitude,
    normalizedData?.lng,
    normalizedData?.lon,
    normalizedData?.gpsLongitude,
    dataLocation?.longitude,
    dataLocation?.lng,
    dataLocation?.lon,
    dataGps?.longitude,
    dataGps?.lng,
    dataGps?.lon,
    dataCoords?.longitude,
    dataCoords?.lng,
    dataCoords?.lon,
    dataGpsLocation?.longitude,
    dataGpsLocation?.lng,
    dataGpsLocation?.lon
  );

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const accuracy = pickFirstFiniteNumber(
    payload?.accuracy,
    payloadLocation?.accuracy,
    payloadGps?.accuracy,
    payloadCoords?.accuracy,
    normalizedData?.accuracy,
    dataLocation?.accuracy,
    dataGps?.accuracy,
    dataCoords?.accuracy,
    dataGpsLocation?.accuracy
  );

  const capturedAt = normalizeTimestampValue(
    payload?.gpsCapturedAt || payload?.capturedAt || payload?.locationTimestamp || payload?.gpsTimestamp
      || normalizedData?.gpsCapturedAt || normalizedData?.capturedAt || normalizedData?.locationTimestamp || normalizedData?.gpsTimestamp
      || dataGpsLocation?.capturedAt
  ) || null;

  return {
    latitude,
    longitude,
    accuracy: Number.isFinite(accuracy) ? accuracy : null,
    capturedAt,
    source: 'biometric_payload'
  };
};

const looksLikeMetricData = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
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
    'bloodPressure',
    'blood_pressure',
    'presion_arterial_sistolica',
    'presion_sistolica',
    'presion_arterial_diastolica',
    'presion_diastolica',
    'sleepData',
    'sleepHistory',
    'sleepSummary',
    'totalMinutes',
    'cgMobile',
    'exerciseSession',
    'gpsSession',
    'gpsLocation',
    'location',
    'coords',
    'gps',
    'latitude',
    'longitude',
    'lat',
    'lng'
  ];

  return metricKeys.some((key) => Object.prototype.hasOwnProperty.call(value, key));
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

const buildDataFromTopLevelPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }

  const excludedKeys = new Set([
    'deviceId',
    'deviceID',
    'device_id',
    'timestamp',
    'timeStamp',
    'nombre',
    'fullName',
    'email',
    'telefono',
    'phone',
    'idpersonal',
    'idPersonal',
    'riskMetadata'
  ]);

  return Object.entries(payload).reduce((acc, [key, value]) => {
    if (!excludedKeys.has(key)) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const normalizeHealthPayload = (payload) => {
  const payloadData = payload?.data;
  const hasValidDataObject = payloadData && typeof payloadData === 'object' && !Array.isArray(payloadData);
  const normalizedData = hasValidDataObject
    ? { ...payloadData }
    : buildDataFromTopLevelPayload(payload);

  if (!looksLikeMetricData(normalizedData)) {
    return {
      ...payload,
      deviceId: normalizeOptionalString(payload?.deviceId || payload?.deviceID || payload?.device_id),
      timestamp: normalizeTimestampValue(payload?.timestamp || payload?.timeStamp),
      nombre: normalizeOptionalString(payload?.nombre || payload?.fullName),
      email: normalizeOptionalString(payload?.email),
      telefono: normalizeOptionalString(payload?.telefono || payload?.phone),
      idpersonal: normalizeOptionalString(payload?.idpersonal || payload?.idPersonal),
      data: {}
    };
  }

  if (normalizedData?.sleepData) {
    normalizedData.sleepData = normalizeSleepData(normalizedData.sleepData);
  }
  if (normalizedData?.sleepHistory) {
    normalizedData.sleepHistory = normalizeSleepHistory(normalizedData.sleepHistory);
  }

  const gpsLocation = extractGpsLocation(payload, normalizedData);
  if (gpsLocation) {
    normalizedData.gpsLocation = gpsLocation;
  }

  return {
    ...payload,
    deviceId: normalizeOptionalString(payload?.deviceId || payload?.deviceID || payload?.device_id),
    timestamp: normalizeTimestampValue(payload?.timestamp || payload?.timeStamp),
    nombre: normalizeOptionalString(payload?.nombre || payload?.fullName),
    email: normalizeOptionalString(payload?.email),
    telefono: normalizeOptionalString(payload?.telefono || payload?.phone),
    idpersonal: normalizeOptionalString(payload?.idpersonal || payload?.idPersonal),
    data: normalizedData
  };
};

const getPatientName = (recordOrData) => {
  const data = recordOrData?.data && typeof recordOrData.data === 'object'
    ? recordOrData.data
    : recordOrData;

  return (
    recordOrData?.nombre ||
    recordOrData?.fullName ||
    data?.patientName ||
    data?.nombrePaciente ||
    data?.fullName ||
    data?.patient?.name ||
    data?.user?.name ||
    data?.ownerName ||
    data?.name ||
    null
  );
};

const getPatientContact = (recordOrData) => ({
  email: recordOrData?.email || '',
  telefono: recordOrData?.telefono || recordOrData?.phone || '',
  idpersonal: recordOrData?.idpersonal || recordOrData?.idPersonal || ''
});

const firstNumber = (...values) => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return null;
};

const positiveOrNull = (value) => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null);

const getMetricFromRecord = (record, metric) => {
  const data = record?.data || {};
  switch (metric) {
    case 'heartRate':
      return firstNumber(data.heartRate, data.frecuencia_cardiaca, data.heart_rate);
    case 'oxygenSaturation':
      return firstNumber(data.oxygenSaturation, data.saturacion_oxigeno, data.spo2, data.bloodOxygen);
    case 'temperature':
      return firstNumber(data.temperature, data.temperatura, data.temperatura_corporal, data.bodyTemperature);
    case 'steps':
      return firstNumber(data.steps, data.steps_today);
    case 'stress':
      return firstNumber(data.stress);
    case 'hrv':
      return firstNumber(data.hrv);
    case 'systolic':
      return firstNumber(data.bloodPressure?.systolic, data.blood_pressure?.systolic, data.presion_arterial_sistolica, data.presion_sistolica);
    case 'diastolic':
      return firstNumber(data.bloodPressure?.diastolic, data.blood_pressure?.diastolic, data.presion_arterial_diastolica, data.presion_diastolica);
    case 'sleepTotalMinutes':
      return firstNumber(data.sleepData?.totalMinutes, data.sleepSummary?.totalMinutes, data.totalMinutes);
    default:
      return null;
  }
};

const latestValidMetric = (records, metric) => {
  for (const record of records) {
    const value = getMetricFromRecord(record, metric);
    const normalized = positiveOrNull(value);
    if (normalized !== null) return normalized;
  }
  return null;
};

const buildLatestMetricsFromRecords = (records) => ({
  heartRate: latestValidMetric(records, 'heartRate'),
  oxygenSaturation: latestValidMetric(records, 'oxygenSaturation'),
  temperature: latestValidMetric(records, 'temperature'),
  steps: latestValidMetric(records, 'steps'),
  stress: latestValidMetric(records, 'stress'),
  hrv: latestValidMetric(records, 'hrv'),
  systolic: latestValidMetric(records, 'systolic'),
  diastolic: latestValidMetric(records, 'diastolic'),
  sleepTotalMinutes: latestValidMetric(records, 'sleepTotalMinutes')
});

// Middleware to validate health data
const validateHealthData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Save health data to the database
const saveHealthData = async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  const normalizedPayload = normalizeHealthPayload(req.body);
  
  try {
    console.log(`🚀 [${requestId}] POST /api/health/data - REQUEST START`);
    console.log(`📊 [${requestId}] Datos biométricos recibidos:`, {
      deviceId: normalizedPayload.deviceId,
      timestamp: normalizedPayload.timestamp,
      dataKeys: Object.keys(normalizedPayload.data || {}),
      clientIP: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      contentType: req.get('Content-Type')
    });
    if (normalizedPayload.data?.sleepData) {
      console.log(`😴 [${requestId}] SleepData normalizado:`, {
        totalMinutes: normalizedPayload.data.sleepData.totalMinutes,
        deepMinutes: normalizedPayload.data.sleepData.deepMinutes,
        lightMinutes: normalizedPayload.data.sleepData.lightMinutes,
        remMinutes: normalizedPayload.data.sleepData.remMinutes,
        awakeMinutes: normalizedPayload.data.sleepData.awakeMinutes,
        wakingCount: normalizedPayload.data.sleepData.wakingCount
      });
    }
    if (normalizedPayload.data?.gpsLocation) {
      console.log(`📍 [${requestId}] GPS adjunto:`, normalizedPayload.data.gpsLocation);
    }
    if (Array.isArray(normalizedPayload.data?.sleepHistory)) {
      const sleepHistory = normalizedPayload.data.sleepHistory;
      console.log(`📈 [${requestId}] Historial de sueño recibido:`, {
        nights: sleepHistory.length,
        latest: sleepHistory.length > 0 ? sleepHistory[sleepHistory.length - 1] : null
      });
    }
    console.log(`🔍 [${requestId}] JSON completo recibido:`, JSON.stringify(normalizedPayload));
    
    // Verificar conexión MongoDB ANTES de guardar
    console.log(`🔌 [${requestId}] Verificando conexión MongoDB...`);
    const dbState = mongoose.connection.readyState;
    const stateNames = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    console.log(`📊 [${requestId}] MongoDB estado:`, stateNames[dbState] || dbState);
    
    if (dbState !== 1) {
      console.error(`❌ [${requestId}] MongoDB no conectado. Estado: ${stateNames[dbState]}`);
      return res.status(503).json({
        success: false,
        message: 'Database not connected',
        debug: { mongoState: stateNames[dbState], requestId }
      });
    }

    console.log(`💾 [${requestId}] Creando documento HealthData...`);
    const healthData = new HealthData(normalizedPayload);
    console.log(`📝 [${requestId}] Documento creado, iniciando save()...`);
    
    // Configurar timeout para la operación de guardado
    const savePromise = healthData.save();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Save operation timeout')), 10000)
    );
    
    const savedData = await Promise.race([savePromise, timeoutPromise]);
    
    const duration = Date.now() - startTime;
    console.log(`✅ [${requestId}] Datos guardados exitosamente en ${duration}ms:`, {
      id: savedData._id,
      deviceId: savedData.deviceId,
      timestamp: savedData.timestamp
    });

    res.status(201).json({ 
      success: true, 
      data_id: savedData._id,
      message: 'Datos biométricos guardados exitosamente',
      debug: { duration: `${duration}ms`, requestId }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestId}] Error después de ${duration}ms:`, {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    
    // Diagnóstico específico por tipo de error
    if (error.message.includes('timeout')) {
      console.error(`⏰ [${requestId}] TIMEOUT DETECTADO - Posibles causas:`);
      console.error('  - MongoDB Atlas cluster pausado');
      console.error('  - IP no autorizada en Network Access');
      console.error('  - Conectividad de red lenta');
      console.error('  - Índices faltantes o consultas lentas');
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error(`🌐 [${requestId}] ERROR DE CONEXIÓN - Verificar:`);
      console.error('  - MONGO_URL en variables de entorno');
      console.error('  - Estado del cluster en MongoDB Atlas');
      console.error('  - Conectividad a internet');
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save health data', 
      error: error.message,
      debug: { 
        duration: `${duration}ms`, 
        requestId,
        errorCode: error.code,
        mongoState: mongoose.connection.readyState
      }
    });
  }
};

// Get server status
const getServerStatus = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const stateNames = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  
  res.status(200).json({ 
    status: 'Server is running',
    mongodb: {
      state: stateNames[dbState],
      stateCode: dbState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      port: mongoose.connection.port
    },
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV
  });
};

// MongoDB health check específico
const getMongoHealthCheck = async (req, res) => {
  const startTime = Date.now();
  try {
    console.log('🏥 MongoDB health check iniciado...');
    
    // Verificar estado de conexión
    const dbState = mongoose.connection.readyState;
    const stateNames = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    
    if (dbState !== 1) {
      return res.status(503).json({
        healthy: false,
        mongodb: { state: stateNames[dbState], connected: false },
        message: 'MongoDB not connected'
      });
    }
    
    // Test de escritura/lectura rápido
    const testDoc = new HealthData({
      deviceId: 'HEALTH_CHECK_DEVICE',
      timestamp: new Date(),
      data: { test: true, healthCheck: Date.now() }
    });
    
    const saved = await testDoc.save();
    await HealthData.deleteOne({ _id: saved._id });
    
    const duration = Date.now() - startTime;
    console.log(`✅ MongoDB health check exitoso en ${duration}ms`);
    
    res.status(200).json({
      healthy: true,
      mongodb: {
        state: stateNames[dbState],
        connected: true,
        host: mongoose.connection.host || 'unknown',
        dbName: mongoose.connection.name || 'unknown'
      },
      test: {
        writeRead: true,
        duration: `${duration}ms`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ MongoDB health check falló en ${duration}ms:`, error.message);
    
    res.status(503).json({
      healthy: false,
      mongodb: { connected: false, error: error.message },
      test: { writeRead: false, duration: `${duration}ms` },
      timestamp: new Date().toISOString()
    });
  }
};

// Get available device list
const getDeviceList = async (req, res) => {
  console.log('📋 Solicitando lista de dispositivos biométricos');

  try {
    const records = await HealthData.find({})
      .sort({ deviceId: 1, timestamp: -1 })
      .select('deviceId timestamp nombre email telefono idpersonal data')
      .lean();
    const byDevice = new Map();

    records.forEach((record) => {
      if (!byDevice.has(record.deviceId)) {
        byDevice.set(record.deviceId, []);
      }
      byDevice.get(record.deviceId).push(record);
    });

    const devices = Array.from(byDevice.entries())
      .map(([deviceId, deviceRecords]) => {
        const latestRecord = deviceRecords[0] || {};
        return {
          deviceId,
          totalRecords: deviceRecords.length,
          latestUpdate: latestRecord.timestamp,
          email: latestRecord.email || '',
          telefono: latestRecord.telefono || '',
          idpersonal: latestRecord.idpersonal || '',
          latestMetrics: buildLatestMetricsFromRecords(deviceRecords),
          patientName: getPatientName(latestRecord) || 'Paciente no informado'
        };
      })
      .sort((a, b) => new Date(b.latestUpdate || 0) - new Date(a.latestUpdate || 0) || a.deviceId.localeCompare(b.deviceId));

    console.log('📊 Dispositivos encontrados:', {
      totalDevices: devices.length,
      deviceIds: devices.map(device => device.deviceId)
    });

    res.status(200).json({
      success: true,
      data: devices
    });
  } catch (error) {
    console.error('❌ Error obteniendo lista de dispositivos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device list',
      error: error.message
    });
  }
};

// Get device history
const getDeviceHistory = async (req, res) => {
  const { deviceId } = req.params;
  console.log('📋 Solicitando historial de dispositivo:', deviceId);
  
  try {
    const data = await HealthData.find({ deviceId }).sort({ timestamp: -1 });
    const patientName = data.length > 0 ? getPatientName(data[0]) : null;
    const contact = data.length > 0 ? getPatientContact(data[0]) : { email: '', telefono: '' };
    
    console.log('📊 Historial encontrado:', {
      deviceId,
      recordsFound: data.length,
      latestRecord: data.length > 0 ? data[0].timestamp : null,
      patientName
    });
    
    res.status(200).json({ 
      success: true, 
      data,
      summary: {
        deviceId,
        patientName,
        email: contact.email,
        telefono: contact.telefono,
        idpersonal: contact.idpersonal,
        totalRecords: data.length,
        latestUpdate: data.length > 0 ? data[0].timestamp : null
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo historial de dispositivo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch device history', 
      error: error.message 
    });
  }
};

const getLatestRiskAnalysis = async (req, res) => {
  const { deviceId } = req.params;
  try {
    const recentRecords = await HealthData.find({ deviceId }).sort({ timestamp: -1 }).limit(30);
    const latest = recentRecords[0] || null;
    if (!latest) {
      return res.status(404).json({ success: false, message: 'Device data not found' });
    }

    const storedRisk = latest.riskMetadata;
    const riskMetadata = storedRisk?.context
      ? storedRisk
      : buildRuleAnalysis(latest, { contextRecords: recentRecords });
    res.json({
      success: true,
      deviceId,
      recordId: latest._id,
      timestamp: latest.timestamp,
      aiAvailable: isRiskAIAvailable(),
      ecgConsidered: Boolean(riskMetadata?.ecgConsidered),
      exerciseConsidered: Boolean(riskMetadata?.exerciseConsidered),
      riskMetadata
    });
  } catch (error) {
    console.error('❌ Error obteniendo riesgo:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch risk analysis', error: error.message });
  }
};

const analyzeDeviceRisk = async (req, res) => {
  const { deviceId } = req.params;
  try {
    const recentRecords = await HealthData.find({ deviceId }).sort({ timestamp: -1 }).limit(30);
    const latest = recentRecords[0] || null;
    if (!latest) {
      return res.status(404).json({ success: false, message: 'Device data not found' });
    }

    const riskMetadata = await generateBiometricRiskAnalysis(latest, { contextRecords: recentRecords });
    latest.riskMetadata = riskMetadata;
    if (latest.data && typeof latest.data === 'object') {
      latest.data.riskMetadata = riskMetadata;
    }
    await latest.save();

    res.json({
      success: true,
      deviceId,
      recordId: latest._id,
      timestamp: latest.timestamp,
      aiAvailable: isRiskAIAvailable(),
      ecgConsidered: Boolean(riskMetadata?.ecgConsidered),
      exerciseConsidered: Boolean(riskMetadata?.exerciseConsidered),
      riskMetadata
    });
  } catch (error) {
    console.error('❌ Error analizando riesgo:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze risk', error: error.message });
  }
};

const deleteBiometricRecord = async (req, res) => {
  const { recordId } = req.params;
  console.log('🗑️  Solicitud para borrar registro biométrico:', recordId);

  try {
    const deletedRecord = await HealthData.findByIdAndDelete(recordId);

    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Biometric record not found'
      });
    }

    console.log('✅ Registro biométrico borrado:', {
      recordId,
      deviceId: deletedRecord.deviceId,
      timestamp: deletedRecord.timestamp
    });

    res.status(200).json({
      success: true,
      message: 'Registro biométrico eliminado correctamente',
      deletedRecord: {
        _id: deletedRecord._id,
        deviceId: deletedRecord.deviceId,
        timestamp: deletedRecord.timestamp
      }
    });
  } catch (error) {
    console.error('❌ Error borrando registro biométrico:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete biometric record',
      error: error.message
    });
  }
};

const getBiometricAlerts = async (req, res) => {
  console.log('🚨 Solicitando pacientes con alertas biometricas');

  try {
    const latestRecords = await HealthData.aggregate([
      { $sort: { deviceId: 1, timestamp: -1 } },
      {
        $group: {
          _id: '$deviceId',
          latestRecord: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latestRecord' } },
      { $sort: { timestamp: -1 } }
    ]);

    const report = await generateBiometricAlertReport(latestRecords);

    res.status(200).json({
      success: true,
      ...report
    });
  } catch (error) {
    console.error('❌ Error generando alertas biometricas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate biometric alerts',
      error: error.message
    });
  }
};

// Delete device data
const deleteDeviceData = async (req, res) => {
  const { deviceId } = req.params;
  console.log('🗑️  Solicitud para borrar datos del dispositivo:', deviceId);
  
  try {
    const result = await HealthData.deleteMany({ deviceId });
    
    console.log('✅ Datos borrados:', {
      deviceId,
      deletedCount: result.deletedCount
    });
    
    res.status(200).json({ 
      success: true, 
      message: `Se eliminaron ${result.deletedCount} registros del dispositivo ${deviceId}`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error borrando datos del dispositivo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete device data', 
      error: error.message 
    });
  }
};

// Delete all biometric data
const deleteAllData = async (req, res) => {
  console.log('🗑️  Solicitud para borrar TODOS los datos biométricos');
  
  try {
    const result = await HealthData.deleteMany({});
    
    console.log('✅ Todos los datos borrados:', {
      deletedCount: result.deletedCount
    });
    
    res.status(200).json({ 
      success: true, 
      message: `Se eliminaron ${result.deletedCount} registros biométricos`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error borrando todos los datos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete all data', 
      error: error.message 
    });
  }
};

module.exports = {
  validateHealthData,
  saveHealthData,
  getServerStatus,
  getMongoHealthCheck,
  getDeviceList,
  getBiometricAlerts,
  getDeviceHistory,
  getLatestRiskAnalysis,
  analyzeDeviceRisk,
  deleteBiometricRecord,
  deleteDeviceData,
  deleteAllData,
};