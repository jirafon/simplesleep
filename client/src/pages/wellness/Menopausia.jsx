import React, { useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt,
  FaFire,
  FaMoon,
  FaBrain,
  FaHeartbeat,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaStethoscope
} from 'react-icons/fa';
import apiClient from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import WellnessModuleLayout, {
  WellnessLoginPrompt,
  RecommendationList,
  BiometricMiniSummary,
  AiBadge
} from '../../components/wellness/WellnessModuleLayout';

const STAGE_LABELS = {
  perimenopause: 'Perimenopausia',
  menopause: 'Menopausia',
  postmenopause: 'Postmenopausia'
};

const SYMPTOM_GUIDE = [
  { label: 'Bochornos', desc: 'Sensación súbita de calor intenso, a veces con enrojecimiento y sudor.' },
  { label: 'Sudoración nocturna', desc: 'Episodios de sudor durante la noche que pueden interrumpir el sueño.' },
  { label: 'Sueño interrumpido', desc: 'Despertares frecuentes o dificultad para mantener el descanso.' },
  { label: 'Cambios de ánimo', desc: 'Irritabilidad, ansiedad o bajones emocionales.' },
  { label: 'Fatiga', desc: 'Cansancio persistente a pesar de descansar.' },
  { label: 'Palpitaciones', desc: 'Percepción de latidos fuertes o irregulares.' },
  { label: 'Brain fog', desc: 'Niebla mental, olvidos o dificultad para concentrarse.' },
  { label: 'Irregularidad menstrual', desc: 'Ciclos más cortos, largos o impredecibles (perimenopausia).' }
];

const DEFAULT_LOG_FORM = {
  hotFlashes: 0,
  nightSweats: false,
  nightSweatEpisodes: 0,
  sleepInterrupted: 3,
  sleepQuality: 3,
  mood: 3,
  fatigue: 3,
  energy: 3,
  palpitations: false,
  weightGain: false,
  bloodPressureChange: false,
  recoveryChange: 3,
  stressLevel: 3,
  menstrualIrregularity: false,
  vaginalDryness: false,
  brainFog: 3,
  notes: ''
};

const TrendBadge = ({ direction }) => {
  if (direction === 'up') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
        <FaArrowUp /> Sube
      </span>
    );
  }
  if (direction === 'down') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
        <FaArrowDown /> Baja
      </span>
    );
  }
  if (direction === 'stable') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
        <FaMinus /> Estable
      </span>
    );
  }
  return <span className="text-xs text-gray-400">Sin comparación</span>;
};

function Menopausia() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [moduleData, setModuleData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');
  const [profileForm, setProfileForm] = useState({
    menopauseActive: true,
    menopauseStage: 'perimenopause'
  });
  const [logForm, setLogForm] = useState(DEFAULT_LOG_FORM);

  const loadAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const [dataRes, recRes] = await Promise.all([
        apiClient.get('/wellness/menopause'),
        apiClient.get('/wellness/menopause/recommendations')
      ]);
      setModuleData(dataRes.data);
      setRecommendations(recRes.data);

      const profile = dataRes.data.profile || {};
      setProfileForm({
        menopauseActive: profile.menopauseActive ?? true,
        menopauseStage: profile.menopauseStage || 'perimenopause'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el módulo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadAll();
  }, [isAuthenticated]);

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      await apiClient.put('/wellness/profile', profileForm);
      await loadAll(true);
    } catch {
      setError('Error al guardar perfil');
    }
  };

  const submitLog = async (event) => {
    event.preventDefault();
    try {
      await apiClient.post('/wellness/logs', {
        module: 'menopause',
        logDate: new Date().toISOString(),
        data: {
          ...logForm,
          hotFlashes: Number(logForm.hotFlashes),
          nightSweatEpisodes: Number(logForm.nightSweatEpisodes),
          sleepInterrupted: Number(logForm.sleepInterrupted),
          sleepQuality: Number(logForm.sleepQuality),
          mood: Number(logForm.mood),
          fatigue: Number(logForm.fatigue),
          energy: Number(logForm.energy),
          recoveryChange: Number(logForm.recoveryChange),
          stressLevel: Number(logForm.stressLevel),
          brainFog: Number(logForm.brainFog)
        }
      });
      setLogForm(DEFAULT_LOG_FORM);
      await loadAll(true);
    } catch {
      setError('Error al guardar registro');
    }
  };

  const recentLogs = moduleData?.menopauseLogs || [];
  const trends = recommendations?.weeklyTrends;
  const trendMetrics = trends?.metrics ? Object.entries(trends.metrics) : [];

  const summaryCards = useMemo(() => {
    if (!trends?.metrics) return [];
    return [
      { icon: FaFire, label: 'Bochornos/día', value: trends.metrics.hotFlashes?.thisWeek ?? '—', direction: trends.metrics.hotFlashes?.direction },
      { icon: FaMoon, label: 'Sueño interrumpido', value: trends.metrics.sleepInterrupted?.thisWeek ?? '—', direction: trends.metrics.sleepInterrupted?.direction },
      { icon: FaBrain, label: 'Brain fog', value: trends.metrics.brainFog?.thisWeek ?? '—', direction: trends.metrics.brainFog?.direction },
      { icon: FaHeartbeat, label: 'Fatiga', value: trends.metrics.fatigue?.thisWeek ?? '—', direction: trends.metrics.fatigue?.direction }
    ];
  }, [trends]);

  if (!authLoading && !isAuthenticated) {
    return <WellnessLoginPrompt />;
  }

  return (
    <WellnessModuleLayout
      title="Perimenopausia y menopausia"
      subtitle="Acompañamiento de síntomas con IA, tendencias semanales y datos de tu pulsera"
      loading={loading || authLoading}
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {moduleData && (
        <>
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-2xl p-6 mb-6">
            <p className="text-sm opacity-90 mb-1">Módulo para mujeres · {STAGE_LABELS[profileForm.menopauseStage] || 'Perimenopausia'}</p>
            <h2 className="text-2xl font-bold mb-2">Tu acompañamiento en esta etapa</h2>
            <p className="text-violet-100 text-sm max-w-3xl">
              Registra bochornos, sudoración nocturna, sueño, ánimo, fatiga y más. La IA cruza tus síntomas con biométricos
              (HRV, estrés, sueño, presión referencial) para entregarte recomendaciones prácticas de estilo de vida.
            </p>
          </div>

          {recommendations?.personalizedMessage && (
            <div className="bg-white border-l-4 border-violet-500 rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                <p className="text-sm font-semibold text-violet-900">Recomendación personalizada de la semana</p>
                <AiBadge aiUsed={recommendations.aiUsed} aiAvailable={recommendations.aiAvailable} />
              </div>
              <p className="text-lg text-gray-800 leading-relaxed">{recommendations.personalizedMessage}</p>
              <button
                type="button"
                onClick={() => loadAll(true)}
                disabled={refreshing}
                className="mt-4 text-sm text-violet-700 hover:text-violet-900 flex items-center gap-2"
              >
                <FaSyncAlt className={refreshing ? 'animate-spin' : ''} />
                Actualizar con IA
              </button>
            </div>
          )}

          {summaryCards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {summaryCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="bg-white rounded-xl shadow border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                      <Icon className="text-violet-500" />
                      {card.label}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <div className="mt-2"><TrendBadge direction={card.direction} /></div>
                  </div>
                );
              })}
            </div>
          )}

          {trends?.patternAlerts?.length > 0 && (
            <div className="space-y-3 mb-6">
              {trends.patternAlerts.map((alert) => (
                <div
                  key={alert.code}
                  className={`rounded-xl p-4 border ${
                    alert.severity === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-100'
                  }`}
                >
                  <p className="text-sm text-gray-800">{alert.message}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <form onSubmit={saveProfile} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tu etapa</h3>
              <div className="space-y-4">
                <label className="block text-sm">
                  <span className="text-gray-600">¿En qué etapa te encuentras?</span>
                  <select
                    value={profileForm.menopauseStage}
                    onChange={(e) => setProfileForm({ ...profileForm, menopauseStage: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                  >
                    <option value="perimenopause">Perimenopausia</option>
                    <option value="menopause">Menopausia</option>
                    <option value="postmenopause">Postmenopausia</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={profileForm.menopauseActive}
                    onChange={(e) => setProfileForm({ ...profileForm, menopauseActive: e.target.checked })}
                  />
                  Activar seguimiento de síntomas
                </label>
                <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded-lg w-full">
                  Guardar etapa
                </button>
              </div>
            </form>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Síntomas que acompañamos</h3>
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                {SYMPTOM_GUIDE.map((item) => (
                  <div key={item.label} className="text-sm border-b border-gray-50 pb-2">
                    <p className="font-medium text-gray-800">{item.label}</p>
                    <p className="text-gray-500 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Referencia: síntomas frecuentes en perimenopausia/menopausia incluyen periodos irregulares, bochornos,
                sudoración nocturna, sueño alterado, cambios de ánimo y niebla mental.
              </p>
            </div>
          </div>

          <form onSubmit={submitLog} className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Registro de hoy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <label className="block text-sm">
                <span className="text-gray-600">Bochornos (cantidad hoy)</span>
                <input type="number" min="0" max="30" value={logForm.hotFlashes}
                  onChange={(e) => setLogForm({ ...logForm, hotFlashes: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2" />
              </label>

              <label className="block text-sm">
                <span className="text-gray-600">Episodios sudoración nocturna</span>
                <input type="number" min="0" max="10" value={logForm.nightSweatEpisodes}
                  onChange={(e) => setLogForm({ ...logForm, nightSweatEpisodes: e.target.value, nightSweats: Number(e.target.value) > 0 })}
                  className="mt-1 w-full border rounded-lg px-3 py-2" />
              </label>

              {[
                { key: 'sleepInterrupted', label: 'Sueño interrumpido (1-5)' },
                { key: 'sleepQuality', label: 'Calidad de sueño (1-5)' },
                { key: 'mood', label: 'Ánimo / cambios emocionales (1-5)' },
                { key: 'fatigue', label: 'Fatiga (1-5)' },
                { key: 'energy', label: 'Energía (1-5)' },
                { key: 'stressLevel', label: 'Estrés (1-5)' },
                { key: 'brainFog', label: 'Brain fog / concentración (1-5)' },
                { key: 'recoveryChange', label: 'Recuperación física (1-5)' }
              ].map((field) => (
                <label key={field.key} className="block text-sm">
                  <span className="text-gray-600">{field.label}</span>
                  <input type="range" min="1" max="5" value={logForm[field.key]}
                    onChange={(e) => setLogForm({ ...logForm, [field.key]: e.target.value })}
                    className="mt-1 w-full" />
                  <span className="text-xs text-gray-400">{logForm[field.key]}/5</span>
                </label>
              ))}

              <div className="md:col-span-2 xl:col-span-3">
                <p className="text-sm text-gray-600 mb-2">Síntomas presentes hoy</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'palpitations', label: 'Palpitaciones' },
                    { key: 'weightGain', label: 'Aumento de peso' },
                    { key: 'bloodPressureChange', label: 'Cambios presión arterial' },
                    { key: 'menstrualIrregularity', label: 'Irregularidad menstrual' },
                    { key: 'vaginalDryness', label: 'Sequedad vaginal (opcional)' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setLogForm({ ...logForm, [item.key]: !logForm[item.key] })}
                      className={`text-xs px-3 py-1.5 rounded-full border ${
                        logForm[item.key] ? 'bg-violet-100 border-violet-300 text-violet-800' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 xl:col-span-3">
                <textarea
                  placeholder="Notas: desencadenantes, medicamentos, cómo te sentiste..."
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
            </div>
            <button type="submit" className="mt-4 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-lg">
              Guardar registro de hoy
            </button>
          </form>

          {recommendations && (
            <div className="space-y-4 mb-6">
              <BiometricMiniSummary biometrics={recommendations.biometrics} />

              {trendMetrics.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Tendencia semanal (vs semana anterior)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {trendMetrics.map(([key, metric]) => (
                      <div key={key} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
                        <span className="text-gray-700">{metric.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">
                            {metric.thisWeek ?? '—'} {metric.unit !== '1-5' ? metric.unit : ''}
                          </span>
                          <TrendBadge direction={metric.direction} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Esta semana: {trends?.thisWeekLogCount ?? 0} registros · Semana anterior: {trends?.lastWeekLogCount ?? 0}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RecommendationList title="Recomendaciones personalizadas" items={recommendations.recommendations || []} tone="bg-violet-50 border-violet-100" />
                <RecommendationList title="Estilo de vida (puede ayudar)" items={recommendations.lifestyleTips || []} tone="bg-emerald-50 border-emerald-100" />
                <RecommendationList title="Tips por síntoma" items={recommendations.symptomTips || []} tone="bg-gray-50 border-gray-100" />
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <FaStethoscope />
                    Cuándo consultar a tu médica
                  </h4>
                  <ul className="space-y-2">
                    {(recommendations.seekMedicalCare || []).map((item, index) => (
                      <li key={`care-${index}`} className="text-sm text-red-800 flex gap-2">
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center px-4">
                {recommendations.disclaimer || 'Los cambios de estilo de vida pueden ayudar a manejar síntomas; algunas mujeres pueden requerir tratamiento médico.'}
              </p>
            </div>
          )}

          {recentLogs.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Historial reciente ({recentLogs.length})</h3>
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-3">Fecha</th>
                      <th className="py-2 pr-3">Bochornos</th>
                      <th className="py-2 pr-3">Sudor noche</th>
                      <th className="py-2 pr-3">Sueño</th>
                      <th className="py-2 pr-3">Ánimo</th>
                      <th className="py-2 pr-3">Fatiga</th>
                      <th className="py-2 pr-3">Brain fog</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.slice(0, 14).map((log) => (
                      <tr key={log._id} className="border-b border-gray-50">
                        <td className="py-2 pr-3 whitespace-nowrap">{new Date(log.logDate).toLocaleDateString('es-CL')}</td>
                        <td className="py-2 pr-3">{log.data?.hotFlashes ?? '—'}</td>
                        <td className="py-2 pr-3">{log.data?.nightSweats ? 'Sí' : '—'}</td>
                        <td className="py-2 pr-3">{log.data?.sleepInterrupted ?? '—'}</td>
                        <td className="py-2 pr-3">{log.data?.mood ?? '—'}</td>
                        <td className="py-2 pr-3">{log.data?.fatigue ?? '—'}</td>
                        <td className="py-2 pr-3">{log.data?.brainFog ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </WellnessModuleLayout>
  );
}

export default Menopausia;
