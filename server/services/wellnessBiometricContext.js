const HealthData = require('../models/HealthData');

const getSleepMinutes = (record) => {
  const sleepData = record?.data?.sleepData;
  if (sleepData?.totalSleepDuration > 0) {
    return Math.round(sleepData.totalSleepDuration / 60);
  }

  const direct = record?.data?.sleepTotalMinutes ?? record?.data?.totalMinutes;
  return typeof direct === 'number' && direct > 0 ? direct : null;
};

const getMetric = (record, keys) => {
  for (const key of keys) {
    const value = key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), record?.data);
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }
  }
  return null;
};

const aggregateAverage = (values) => {
  const valid = values.filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (!valid.length) return null;
  return Math.round((valid.reduce((sum, v) => sum + v, 0) / valid.length) * 10) / 10;
};

const aggregateMax = (values) => {
  const valid = values.filter((v) => typeof v === 'number' && Number.isFinite(v));
  return valid.length ? Math.max(...valid) : null;
};

const buildDaySummary = (records) => {
  const sorted = [...records].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const hr = sorted.map((r) => getMetric(r, ['heartRate', 'frecuencia_cardiaca', 'heart_rate']));
  const hrv = sorted.map((r) => getMetric(r, ['hrv']));
  const stress = sorted.map((r) => getMetric(r, ['stress']));
  const steps = sorted.map((r) => getMetric(r, ['steps', 'steps_today']));
  const sleep = sorted.map((r) => getSleepMinutes(r));
  const systolic = sorted.map((r) => getMetric(r, ['bloodPressure.systolic', 'blood_pressure.systolic', 'presion_sistolica']));
  const diastolic = sorted.map((r) => getMetric(r, ['bloodPressure.diastolic', 'blood_pressure.diastolic', 'presion_diastolica']));

  return {
    recordCount: sorted.length,
    heartRateAvg: aggregateAverage(hr),
    heartRateMin: hr.filter(Boolean).length ? Math.min(...hr.filter(Boolean)) : null,
    heartRateMax: hr.filter(Boolean).length ? Math.max(...hr.filter(Boolean)) : null,
    hrvAvg: aggregateAverage(hrv),
    stressAvg: aggregateAverage(stress),
    stepsMax: aggregateMax(steps),
    sleepMinutes: sleep.filter(Boolean).length ? sleep.filter(Boolean).slice(-1)[0] : null,
    systolic: systolic.filter(Boolean).length ? systolic.filter(Boolean).slice(-1)[0] : null,
    diastolic: diastolic.filter(Boolean).length ? diastolic.filter(Boolean).slice(-1)[0] : null,
    lastTimestamp: sorted[sorted.length - 1]?.timestamp || null
  };
};

const formatDayKey = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getBiometricContextForUser = async (email, days = 14) => {
  if (!email) {
    return {
      hasData: false,
      recordCount: 0,
      latest: null,
      dailySummaries: [],
      averages: {}
    };
  }

  const since = new Date();
  since.setDate(since.getDate() - days);

  const records = await HealthData.find({
    email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    timestamp: { $gte: since }
  }).sort({ timestamp: 1 }).lean();

  if (!records.length) {
    return {
      hasData: false,
      recordCount: 0,
      latest: null,
      dailySummaries: [],
      averages: {}
    };
  }

  const byDay = records.reduce((acc, record) => {
    const key = formatDayKey(record.timestamp);
    if (!acc[key]) acc[key] = [];
    acc[key].push(record);
    return acc;
  }, {});

  const dailySummaries = Object.entries(byDay)
    .map(([dayKey, dayRecords]) => ({
      dayKey,
      ...buildDaySummary(dayRecords)
    }))
    .sort((a, b) => new Date(b.dayKey) - new Date(a.dayKey));

  const latestRecord = records[records.length - 1];
  const latest = buildDaySummary([latestRecord]);

  const allHr = records.map((r) => getMetric(r, ['heartRate', 'frecuencia_cardiaca']));
  const allHrv = records.map((r) => getMetric(r, ['hrv']));
  const allStress = records.map((r) => getMetric(r, ['stress']));
  const allSteps = records.map((r) => getMetric(r, ['steps', 'steps_today']));
  const allSleep = records.map((r) => getSleepMinutes(r));

  return {
    hasData: true,
    recordCount: records.length,
    deviceId: latestRecord.deviceId || null,
    latest,
    dailySummaries,
    averages: {
      heartRate: aggregateAverage(allHr),
      hrv: aggregateAverage(allHrv),
      stress: aggregateAverage(allStress),
      steps: aggregateAverage(allSteps),
      sleepMinutes: aggregateAverage(allSleep.filter(Boolean))
    }
  };
};

module.exports = {
  getBiometricContextForUser,
  buildDaySummary
};
