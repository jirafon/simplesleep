import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaSyncAlt, FaPlus } from 'react-icons/fa';
import apiClient from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import WellnessModuleLayout, {
  WellnessLoginPrompt,
  RecommendationList,
  BiometricMiniSummary,
  AiBadge
} from '../../components/wellness/WellnessModuleLayout';

const SYMPTOM_OPTIONS = ['cólicos', 'hinchazón', 'fatiga', 'dolor de cabeza', 'sensibilidad mamaria', 'acné', 'insomnio'];

function CicloFertilidad() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cycleData, setCycleData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');
  const [profileForm, setProfileForm] = useState({
    cycleLengthDays: 28,
    periodLengthDays: 5,
    lastPeriodStart: ''
  });
  const [logForm, setLogForm] = useState({
    flow: 'medium',
    mood: 3,
    energy: 3,
    symptoms: [],
    notes: ''
  });

  const loadAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const [cycleRes, recRes] = await Promise.all([
        apiClient.get('/wellness/cycle'),
        apiClient.get('/wellness/cycle/recommendations')
      ]);
      setCycleData(cycleRes.data);
      setRecommendations(recRes.data);

      const profile = cycleRes.data.profile || {};
      setProfileForm({
        cycleLengthDays: profile.cycleLengthDays || 28,
        periodLengthDays: profile.periodLengthDays || 5,
        lastPeriodStart: profile.lastPeriodStart
          ? new Date(profile.lastPeriodStart).toISOString().slice(0, 10)
          : ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar módulo de ciclo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadAll();
  }, [isAuthenticated]);

  if (!authLoading && !isAuthenticated) {
    return <WellnessLoginPrompt />;
  }

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      await apiClient.put('/wellness/profile', profileForm);
      await loadAll(true);
    } catch {
      setError('Error al guardar perfil del ciclo');
    }
  };

  const registerPeriodStart = async () => {
    try {
      await apiClient.post('/wellness/logs', {
        module: 'cycle',
        logDate: new Date().toISOString(),
        data: { type: 'period_start', periodStart: true }
      });
      await loadAll(true);
    } catch {
      setError('Error al registrar inicio de periodo');
    }
  };

  const submitDailyLog = async (event) => {
    event.preventDefault();
    try {
      await apiClient.post('/wellness/logs', {
        module: 'cycle',
        logDate: new Date().toISOString(),
        data: {
          type: 'daily',
          flow: logForm.flow,
          mood: Number(logForm.mood),
          energy: Number(logForm.energy),
          symptoms: logForm.symptoms,
          notes: logForm.notes
        }
      });
      setLogForm({ flow: 'medium', mood: 3, energy: 3, symptoms: [], notes: '' });
      await loadAll(true);
    } catch {
      setError('Error al guardar registro diario');
    }
  };

  const toggleSymptom = (symptom) => {
    setLogForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const predictions = cycleData?.predictions || recommendations?.predictions;

  return (
    <WellnessModuleLayout
      title="Ciclo y fertilidad"
      subtitle="Registro de periodo, predicción de ventana fértil, síntomas y recomendaciones con IA"
      loading={loading || authLoading}
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {cycleData && (
        <>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaCalendarAlt className="text-pink-500" />
                Predicción del ciclo
              </h3>
              <div className="flex gap-2">
                <AiBadge aiUsed={recommendations?.aiUsed} aiAvailable={recommendations?.aiAvailable} />
                <button type="button" onClick={() => loadAll(true)} disabled={refreshing} className="text-sm bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <FaSyncAlt className={refreshing ? 'animate-spin' : ''} />
                  Actualizar
                </button>
              </div>
            </div>

            {predictions?.hasPrediction ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Próximo periodo', value: predictions.nextPeriodStart, highlight: predictions.isInPeriod },
                  { label: 'Ovulación estimada', value: predictions.ovulationDate },
                  { label: 'Ventana fértil', value: `${predictions.fertileWindowStart} → ${predictions.fertileWindowEnd}`, highlight: predictions.isInFertileWindow },
                  { label: 'Días al próximo periodo', value: predictions.daysUntilNextPeriod },
                  { label: 'Duración ciclo', value: `${predictions.cycleLength} días` },
                  { label: 'Duración periodo', value: `${predictions.periodLength} días` }
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-lg p-4 border ${item.highlight ? 'bg-pink-50 border-pink-200' : 'bg-gray-50 border-gray-100'}`}
                  >
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-lg font-semibold text-gray-900">{item.value ?? 'N/A'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">{predictions?.message || 'Configura tu ciclo para ver predicciones.'}</p>
            )}

            <button
              type="button"
              onClick={registerPeriodStart}
              className="mt-4 flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              <FaPlus />
              Registrar inicio de periodo hoy
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <form onSubmit={saveProfile} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Configuración del ciclo</h3>
              <div className="space-y-4">
                <label className="block text-sm">
                  <span className="text-gray-600">Duración del ciclo (días)</span>
                  <input type="number" min="21" max="45" value={profileForm.cycleLengthDays}
                    onChange={(e) => setProfileForm({ ...profileForm, cycleLengthDays: Number(e.target.value) })}
                    className="mt-1 w-full border rounded-lg px-3 py-2" />
                </label>
                <label className="block text-sm">
                  <span className="text-gray-600">Duración del periodo (días)</span>
                  <input type="number" min="2" max="10" value={profileForm.periodLengthDays}
                    onChange={(e) => setProfileForm({ ...profileForm, periodLengthDays: Number(e.target.value) })}
                    className="mt-1 w-full border rounded-lg px-3 py-2" />
                </label>
                <label className="block text-sm">
                  <span className="text-gray-600">Último inicio de periodo</span>
                  <input type="date" value={profileForm.lastPeriodStart}
                    onChange={(e) => setProfileForm({ ...profileForm, lastPeriodStart: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2" />
                </label>
                <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg w-full">Guardar configuración</button>
              </div>
            </form>

            <form onSubmit={submitDailyLog} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Registro diario</h3>
              <div className="space-y-4">
                <label className="block text-sm">
                  <span className="text-gray-600">Flujo</span>
                  <select value={logForm.flow} onChange={(e) => setLogForm({ ...logForm, flow: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2">
                    <option value="light">Ligero</option>
                    <option value="medium">Moderado</option>
                    <option value="heavy">Abundante</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-gray-600">Ánimo (1-5)</span>
                  <input type="range" min="1" max="5" value={logForm.mood}
                    onChange={(e) => setLogForm({ ...logForm, mood: e.target.value })}
                    className="mt-1 w-full" />
                </label>
                <label className="block text-sm">
                  <span className="text-gray-600">Energía (1-5)</span>
                  <input type="range" min="1" max="5" value={logForm.energy}
                    onChange={(e) => setLogForm({ ...logForm, energy: e.target.value })}
                    className="mt-1 w-full" />
                </label>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Síntomas</p>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOM_OPTIONS.map((symptom) => (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className={`text-xs px-3 py-1 rounded-full border ${
                          logForm.symptoms.includes(symptom) ? 'bg-pink-100 border-pink-300 text-pink-800' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Notas opcionales"
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={2}
                />
                <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded-lg w-full">Guardar registro</button>
              </div>
            </form>
          </div>

          {recommendations && (
            <div className="space-y-4 mb-6">
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-5">
                <p className="text-sm font-semibold text-violet-900 mb-2">Insight de IA</p>
                <p className="text-violet-800">{recommendations.aiInsight}</p>
              </div>
              <BiometricMiniSummary biometrics={recommendations.biometrics} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RecommendationList title="Recomendaciones" items={recommendations.recommendations || []} tone="bg-pink-50 border-pink-100" />
                <RecommendationList title="Tips de síntomas" items={recommendations.symptomTips || []} tone="bg-gray-50 border-gray-100" />
              </div>
              <p className="text-xs text-gray-500">{recommendations.disclaimer}</p>
            </div>
          )}

          {cycleData.cycleLogs?.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Registros recientes</h3>
              <div className="space-y-2 max-h-48 overflow-auto">
                {cycleData.cycleLogs.slice(0, 10).map((log) => (
                  <div key={log._id} className="text-sm border-b border-gray-100 py-2 flex justify-between gap-4">
                    <span className="text-gray-500">{new Date(log.logDate).toLocaleDateString('es-CL')}</span>
                    <span className="text-gray-800">{log.data?.type === 'period_start' ? 'Inicio periodo' : `Flujo: ${log.data?.flow || '—'}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </WellnessModuleLayout>
  );
}

export default CicloFertilidad;
