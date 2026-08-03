const OpenAI = require('openai');

let openai = null;

const severityWeight = {
  info: 1,
  warning: 2,
  critical: 3
};

const getSleepMetricValue = (record, metricNames) => {
  const names = Array.isArray(metricNames) ? metricNames : [metricNames];
  const sleepData = record?.data?.sleepData;

  for (const metric of names) {
    const name = typeof metric === 'string' ? metric : metric.name;
    const transform = typeof metric === 'object' && typeof metric.transform === 'function'
      ? metric.transform
      : (value) => value;

    const sleepValue = sleepData?.[name];
    if (typeof sleepValue === 'number' && Number.isFinite(sleepValue)) {
      return transform(sleepValue);
    }

    const dataValue = record?.data?.[name];
    if (typeof dataValue === 'number' && Number.isFinite(dataValue)) {
      return transform(dataValue);
    }
  }

  return null;
};

const getPatientName = (record) => (
  record?.nombre ||
  record?.fullName ||
  record?.data?.patientName ||
  record?.data?.nombrePaciente ||
  record?.data?.fullName ||
  record?.data?.patient?.name ||
  record?.data?.user?.name ||
  record?.data?.ownerName ||
  record?.data?.name ||
  'Paciente no informado'
);

const getOpenAIClient = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPEN_API_KEY.trim()
    });
  }

  return openai;
};

const isAIAvailable = () => {
  const apiKey = process.env.OPEN_API_KEY?.trim();
  return Boolean(apiKey && apiKey.startsWith('sk-'));
};

const normalizeOxygenSaturation = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
};

const getLatestMetrics = (record) => ({
  heartRate: record?.data?.heartRate ?? record?.data?.frecuencia_cardiaca ?? record?.data?.heart_rate ?? null,
  oxygenSaturation: normalizeOxygenSaturation(
    record?.data?.oxygenSaturation ??
    record?.data?.saturacion_oxigeno ??
    record?.data?.spo2 ??
    record?.data?.bloodOxygen
  ),
  temperature: record?.data?.temperature ?? record?.data?.temperatura ?? record?.data?.temperatura_corporal ?? record?.data?.bodyTemperature ?? null,
  steps: record?.data?.steps ?? record?.data?.steps_today ?? null,
  stress: record?.data?.stress ?? null,
  hrv: record?.data?.hrv ?? null,
  systolic: record?.data?.bloodPressure?.systolic ?? record?.data?.blood_pressure?.systolic ?? record?.data?.presion_arterial_sistolica ?? record?.data?.presion_sistolica ?? null,
  diastolic: record?.data?.bloodPressure?.diastolic ?? record?.data?.blood_pressure?.diastolic ?? record?.data?.presion_arterial_diastolica ?? record?.data?.presion_diastolica ?? null,
  sleepTotalMinutes: getSleepMetricValue(record, ['totalMinutes', 'total', 'sleep_duration_total', { name: 'totalSleepDuration', transform: (value) => Math.round(value / 60) }])
});

const makeAlert = (severity, code, title, detail) => ({
  severity,
  severityWeight: severityWeight[severity] || 1,
  code,
  title,
  detail
});

const evaluateAlerts = (record) => {
  const { isFeatureEnabled } = require('../config/featureFlags');
  const metrics = getLatestMetrics(record);
  const alerts = [];

  // Medical / diagnostic alerts disabled for SiempreSleep product base
  if (!isFeatureEnabled('MEDICAL_ALERTS')) {
    return { metrics, alerts: [] };
  }

  const hasZeroMetric = [
    metrics.heartRate,
    metrics.oxygenSaturation,
    metrics.temperature,
    metrics.steps,
    metrics.stress,
    metrics.hrv,
    metrics.systolic,
    metrics.diastolic,
    metrics.sleepTotalMinutes
  ].some((value) => value === 0);

  // Si alguna metrica viene en 0, asumimos lectura invalida/sensor
  // y evitamos generar alertas clinicas para ese registro.
  if (hasZeroMetric) {
    return { metrics, alerts: [] };
  }

  if (typeof metrics.oxygenSaturation === 'number') {
    if (metrics.oxygenSaturation < 90) {
      alerts.push(makeAlert('critical', 'oxygen_critical', 'Oxígeno críticamente bajo', `Saturación en ${metrics.oxygenSaturation}%.`));
    } else if (metrics.oxygenSaturation < 94) {
      alerts.push(makeAlert('warning', 'oxygen_low', 'Oxígeno bajo', `Saturación en ${metrics.oxygenSaturation}%.`));
    }
  }

  if (typeof metrics.heartRate === 'number') {
    if (metrics.heartRate >= 130) {
      alerts.push(makeAlert('critical', 'hr_high_critical', 'Frecuencia cardiaca muy alta', `${metrics.heartRate} bpm.`));
    } else if (metrics.heartRate >= 110) {
      alerts.push(makeAlert('warning', 'hr_high', 'Frecuencia cardiaca alta', `${metrics.heartRate} bpm.`));
    } else if (metrics.heartRate <= 40) {
      alerts.push(makeAlert('critical', 'hr_low_critical', 'Frecuencia cardiaca muy baja', `${metrics.heartRate} bpm.`));
    } else if (metrics.heartRate <= 50) {
      alerts.push(makeAlert('warning', 'hr_low', 'Frecuencia cardiaca baja', `${metrics.heartRate} bpm.`));
    }
  }

  if (typeof metrics.temperature === 'number') {
    if (metrics.temperature >= 39) {
      alerts.push(makeAlert('critical', 'temp_high_critical', 'Temperatura alta crítica', `${metrics.temperature}°C.`));
    } else if (metrics.temperature >= 37.8) {
      alerts.push(makeAlert('warning', 'temp_high', 'Temperatura elevada', `${metrics.temperature}°C.`));
    }
  }

  if (isFeatureEnabled('EXPERIMENTAL_BP') && (typeof metrics.systolic === 'number' || typeof metrics.diastolic === 'number')) {
    if ((metrics.systolic ?? 0) >= 180 || (metrics.diastolic ?? 0) >= 120) {
      alerts.push(makeAlert('critical', 'bp_critical', 'Presión arterial (experimental)', `${metrics.systolic ?? 'N/A'}/${metrics.diastolic ?? 'N/A'} mmHg.`));
    } else if ((metrics.systolic ?? 0) >= 140 || (metrics.diastolic ?? 0) >= 90) {
      alerts.push(makeAlert('warning', 'bp_high', 'Presión arterial (experimental)', `${metrics.systolic ?? 'N/A'}/${metrics.diastolic ?? 'N/A'} mmHg.`));
    } else if ((metrics.systolic ?? Number.MAX_SAFE_INTEGER) <= 90 || (metrics.diastolic ?? Number.MAX_SAFE_INTEGER) <= 60) {
      alerts.push(makeAlert('warning', 'bp_low', 'Presión arterial (experimental)', `${metrics.systolic ?? 'N/A'}/${metrics.diastolic ?? 'N/A'} mmHg.`));
    }
  }

  if (typeof metrics.stress === 'number' && metrics.stress >= 85) {
    alerts.push(makeAlert(metrics.stress >= 95 ? 'critical' : 'warning', 'stress_high', 'Estrés muy alto', `Índice de estrés en ${metrics.stress}.`));
  }

  if (typeof metrics.hrv === 'number' && metrics.hrv <= 20) {
    alerts.push(makeAlert('warning', 'hrv_low', 'HRV bajo', `HRV en ${metrics.hrv} ms.`));
  }

  if (typeof metrics.sleepTotalMinutes === 'number') {
    if (metrics.sleepTotalMinutes < 180) {
      alerts.push(makeAlert('critical', 'sleep_very_low', 'Sueño muy bajo', `${metrics.sleepTotalMinutes} minutos de sueño total.`));
    } else if (metrics.sleepTotalMinutes < 240) {
      alerts.push(makeAlert('warning', 'sleep_low', 'Sueño insuficiente', `${metrics.sleepTotalMinutes} minutos de sueño total.`));
    }
  }

  return { metrics, alerts };
};

const getPriorityLabel = (severity) => {
  if (severity === 'critical') {
    return 'Critica';
  }

  if (severity === 'warning') {
    return 'Prioritaria';
  }

  return 'Observacion';
};

const buildFallbackRecommendation = (patient) => {
  const alertCodes = patient.alerts.map((alert) => alert.code);

  if (alertCodes.includes('oxygen_critical') || alertCodes.includes('bp_critical')) {
    return 'Priorizar contacto clinico inmediato y confirmar sintomas actuales, medicion repetida y contexto del paciente.';
  }

  if (alertCodes.includes('temp_high_critical') || alertCodes.includes('hr_high_critical') || alertCodes.includes('hr_low_critical')) {
    return 'Revisar de inmediato signos vitales, sintomas asociados y necesidad de evaluacion medica urgente.';
  }

  if (alertCodes.includes('sleep_very_low') || alertCodes.includes('stress_high')) {
    return 'Priorizar seguimiento hoy, revisar fatiga, sintomas funcionales y factores desencadenantes.';
  }

  return 'Monitorear la siguiente medicion, confirmar adherencia/condiciones de toma y evaluar si requiere contacto medico.';
};

const safeJsonParse = (value) => {
  try {
    const normalized = value
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');
    return JSON.parse(normalized);
  } catch (error) {
    return null;
  }
};

const generateAIRecommendations = async (patients) => {
  if (!patients.length || !isAIAvailable()) {
    return {
      aiUsed: false,
      patients: patients.map((patient) => ({
        ...patient,
        recommendation: buildFallbackRecommendation(patient)
      }))
    };
  }

  const promptPayload = patients.slice(0, 5).map((patient) => ({
    deviceId: patient.deviceId,
    patientName: patient.patientName,
    severity: patient.severity,
    timestamp: patient.timestamp,
    alerts: patient.alerts.map((alert) => ({
      severity: alert.severity,
      title: alert.title,
      detail: alert.detail
    })),
    metrics: patient.metrics
  }));

  const prompt = `Eres un copiloto clinico para un panel de monitoreo biometrico. Devuelve SOLO JSON valido con esta forma:
[
  {
    "deviceId": "string",
    "recommendation": "string breve para el admin/doctor",
    "doctorFocus": "string muy breve con el foco de revision"
  }
]

Pacientes con alertas:
${JSON.stringify(promptPayload, null, 2)}

Reglas:
- Escribe en espanol
- Prioriza accion practica para triage
- No entregues diagnostico definitivo
- Maximo 2 frases por recommendation
- Debes incluir un objeto por cada deviceId enviado`;

  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente clinico para monitoreo remoto. Entregas recomendaciones breves, prudentes y orientadas a triage. Respondes solo JSON valido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 900
    });

    const content = completion.choices?.[0]?.message?.content || '[]';
    const parsed = safeJsonParse(content);

    if (!Array.isArray(parsed)) {
      throw new Error('AI response is not a valid array');
    }

    const recommendationMap = new Map(parsed.map((item) => [item.deviceId, item]));

    return {
      aiUsed: true,
      patients: patients.map((patient) => {
        const aiItem = recommendationMap.get(patient.deviceId);
        return {
          ...patient,
          recommendation: aiItem?.recommendation || buildFallbackRecommendation(patient),
          doctorFocus: aiItem?.doctorFocus || null
        };
      })
    };
  } catch (error) {
    console.error('Error generating biometric AI recommendations:', error.message);
    return {
      aiUsed: false,
      patients: patients.map((patient) => ({
        ...patient,
        recommendation: buildFallbackRecommendation(patient)
      }))
    };
  }
};

const generateBiometricAlertReport = async (records) => {
  const patientsWithAlerts = records
    .map((record) => {
      const { metrics, alerts } = evaluateAlerts(record);

      if (alerts.length === 0) {
        return null;
      }

      const sortedAlerts = [...alerts].sort((a, b) => b.severityWeight - a.severityWeight);
      const highestSeverity = sortedAlerts[0]?.severity || 'info';

      return {
        deviceId: record.deviceId,
        patientName: getPatientName(record),
        email: record.email || '',
        telefono: record.telefono || '',
        idpersonal: record.idpersonal || '',
        timestamp: record.timestamp,
        severity: highestSeverity,
        priorityLabel: getPriorityLabel(highestSeverity),
        severityWeight: severityWeight[highestSeverity] || 1,
        alerts: sortedAlerts,
        metrics
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.severityWeight !== a.severityWeight) {
        return b.severityWeight - a.severityWeight;
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

  const enriched = await generateAIRecommendations(patientsWithAlerts);

  return {
    generatedAt: new Date().toISOString(),
    aiUsed: enriched.aiUsed,
    totalFlagged: enriched.patients.length,
    criticalCount: enriched.patients.filter((patient) => patient.severity === 'critical').length,
    warningCount: enriched.patients.filter((patient) => patient.severity === 'warning').length,
    patients: enriched.patients
  };
};

module.exports = {
  generateBiometricAlertReport
};
