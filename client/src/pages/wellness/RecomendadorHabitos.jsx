import React, { useEffect, useState } from 'react';
import {
  FaDumbbell,
  FaBed,
  FaUtensils,
  FaTint,
  FaSyncAlt,
  FaRunning,
  FaHeart,
  FaFire,
  FaSave,
  FaBell,
  FaCheckCircle
} from 'react-icons/fa';
import apiClient from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import {
  HABITS_GOAL_MODES,
  SPORT_LEVELS,
  getSportsForMode,
  getSportLabel
} from '../../data/wellnessSports';
import WellnessModuleLayout, {
  WellnessLoginPrompt,
  AiBadge
} from '../../components/wellness/WellnessModuleLayout';

const CATEGORY_META = {
  entrenamiento: { label: 'Entrenamiento', icon: FaDumbbell, color: '#059669' },
  sueno: { label: 'Sueño', icon: FaBed, color: '#4F46E5' },
  alimentacion: { label: 'Alimentación', icon: FaUtensils, color: '#EA580C' },
  hidratacion: { label: 'Hidratación', icon: FaTint, color: '#0284C7' }
};

const DEFAULT_PROFILE = {
  habitsGoalMode: 'healthy_life',
  primarySport: 'vida_sana',
  sportLevel: 'beginner',
  weeklyTrainingDays: 3
};

function RecomendadorHabitos() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [data, setData] = useState(null);
  const [profileForm, setProfileForm] = useState(DEFAULT_PROFILE);
  const [hydrationMl, setHydrationMl] = useState('');
  const [error, setError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  const fetchRecommendations = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/wellness/habits/recommendations');
      setData(response.data);
      if (response.data.profile) {
        setProfileForm({
          habitsGoalMode: response.data.profile.habitsGoalMode || 'healthy_life',
          primarySport: response.data.profile.primarySport || 'vida_sana',
          sportLevel: response.data.profile.sportLevel || 'beginner',
          weeklyTrainingDays: response.data.profile.weeklyTrainingDays || 3
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar las recomendaciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchRecommendations();
  }, [isAuthenticated]);

  const handleModeChange = (mode) => {
    const sports = getSportsForMode(mode);
    const defaultSport = mode === 'athlete' ? sports[0]?.id || 'run' : 'vida_sana';
    setProfileForm((prev) => ({
      ...prev,
      habitsGoalMode: mode,
      primarySport: sports.some((s) => s.id === prev.primarySport) ? prev.primarySport : defaultSport
    }));
    setProfileSaved(false);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    setError('');
    setProfileSaved(false);

    try {
      await apiClient.put('/wellness/profile', profileForm);
      setProfileSaved(true);
      await fetchRecommendations(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar tu perfil de hábitos');
    } finally {
      setSavingProfile(false);
    }
  };

  const logHydration = async (event) => {
    event.preventDefault();
    const ml = parseInt(hydrationMl, 10);
    if (!ml || ml <= 0) return;

    try {
      await apiClient.post('/wellness/logs', {
        module: 'habits',
        logDate: new Date().toISOString(),
        data: { ml, type: 'hydration' }
      });
      setHydrationMl('');
      await fetchRecommendations(true);
    } catch (err) {
      setError('Error al registrar hidratación');
    }
  };

  const completeHabitReminder = async (habit) => {
    if (!habit?.id || habit.completed) return;
    setError('');

    try {
      await apiClient.post('/wellness/logs', {
        module: 'habits',
        logDate: new Date().toISOString(),
        data: {
          type: 'habit_check',
          habitId: habit.id,
          label: habit.label,
          source: habit.source
        }
      });
      await fetchRecommendations(true);
    } catch (err) {
      setError('Error al marcar el hábito como completado');
    }
  };

  const categories = data?.recommendations?.categories || {};
  const sportFocus = data?.recommendations?.sportFocus;
  const nutritionPlan = data?.recommendations?.nutritionPlan;
  const habitReminders = data?.recommendations?.habitReminders;
  const isAthlete = profileForm.habitsGoalMode === 'athlete';
  const availableSports = getSportsForMode(profileForm.habitsGoalMode);
  const dailyChecklist = habitReminders?.dailyChecklist || [];
  const completedCount = dailyChecklist.filter((habit) => habit.completed).length;
  const progress = dailyChecklist.length ? Math.round((completedCount / dailyChecklist.length) * 100) : 0;
  const nextHabit = habitReminders?.nextReminder;
  const biometrics = data?.biometrics;
  const biometricSummary = biometrics?.hasData
    ? [
        biometrics.averages?.steps ? `${Math.round(biometrics.averages.steps)} pasos prom.` : null,
        biometrics.averages?.sleepMinutes
          ? `${Math.floor(biometrics.averages.sleepMinutes / 60)}h ${biometrics.averages.sleepMinutes % 60}m sueño`
          : null,
        biometrics.averages?.stress ? `estrés ${biometrics.averages.stress}` : null
      ].filter(Boolean).join(' · ')
    : 'Sin datos recientes de pulsera';

  if (!authLoading && !isAuthenticated) {
    return <WellnessLoginPrompt />;
  }

  return (
    <WellnessModuleLayout
      title="Recomendador de hábitos"
      subtitle="Acciones simples para completar hoy"
      loading={loading || authLoading}
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-5 mb-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <FaRunning className="text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-900">Objetivo</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {HABITS_GOAL_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleModeChange(mode.id)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    profileForm.habitsGoalMode === mode.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {isAthlete && (
                <select
                  aria-label="Deporte principal"
                  value={profileForm.primarySport}
                  onChange={(e) => {
                    setProfileForm((prev) => ({ ...prev, primarySport: e.target.value }));
                    setProfileSaved(false);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {availableSports.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.label}
                    </option>
                  ))}
                </select>
              )}

              <select
                aria-label="Nivel"
                value={profileForm.sportLevel}
                onChange={(e) => {
                  setProfileForm((prev) => ({ ...prev, sportLevel: e.target.value }));
                  setProfileSaved(false);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {SPORT_LEVELS.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.label}
                  </option>
                ))}
              </select>

              {isAthlete && (
                <select
                  aria-label="Días de entrenamiento por semana"
                  value={profileForm.weeklyTrainingDays}
                  onChange={(e) => {
                    setProfileForm((prev) => ({ ...prev, weeklyTrainingDays: parseInt(e.target.value, 10) }));
                    setProfileSaved(false);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {[2, 3, 4, 5, 6].map((days) => (
                    <option key={days} value={days}>
                      {days} días/sem
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={saveProfile}
              disabled={savingProfile}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              <FaSave />
              {savingProfile ? 'Guardando…' : 'Guardar'}
            </button>
            {profileSaved && <span className="text-xs text-emerald-700 text-center">Actualizado</span>}
          </div>
        </div>
      </div>

      {data && (
        <>
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <AiBadge aiUsed={data.aiUsed} aiAvailable={data.aiAvailable} />
                <span className="text-sm text-gray-600">{biometricSummary}</span>
              </div>
              <button
                type="button"
                onClick={() => fetchRecommendations(true)}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                <FaSyncAlt className={refreshing ? 'animate-spin' : ''} />
                Actualizar
              </button>
            </div>
          </div>

          {nextHabit && (
            <div className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-xl shadow-lg p-6 mb-6">
              <p className="text-sm opacity-90 mb-1">Haz esto ahora</p>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-2xl font-bold">{nextHabit.time}</p>
                  <p className="text-lg font-semibold">{nextHabit.label}</p>
                  <p className="text-sm opacity-90 mt-1">{nextHabit.source}</p>
                </div>
                <button
                  type="button"
                  onClick={() => completeHabitReminder(nextHabit)}
                  className="bg-white text-sky-700 font-semibold px-5 py-3 rounded-lg hover:bg-sky-50"
                >
                  Lo hice
                </button>
              </div>
            </div>
          )}

          {habitReminders && (
            <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6 mb-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FaBell className="text-sky-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Hábitos de hoy</h3>
                  </div>
                  <p className="text-sm text-gray-500">{completedCount} de {dailyChecklist.length} completados</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-sky-700">{progress}%</p>
                  <div className="w-24 h-2 bg-sky-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dailyChecklist.map((habit) => (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => completeHabitReminder(habit)}
                    disabled={habit.completed}
                    className={`text-left rounded-lg border p-4 transition ${
                      habit.completed
                        ? 'bg-emerald-50 border-emerald-200 cursor-default'
                        : 'bg-white border-gray-200 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{habit.time}</p>
                        <p className="font-medium text-gray-900">{habit.label}</p>
                      </div>
                      {habit.completed ? (
                        <FaCheckCircle className="text-emerald-500 shrink-0 mt-1" />
                      ) : (
                        <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full shrink-0">
                          Marcar
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {(habitReminders.triggers?.[0] || habitReminders.aiNotes?.[0]) && (
                <div className="mt-4 bg-sky-50 border border-sky-100 rounded-lg p-3 text-sm text-sky-900">
                  {habitReminders.aiNotes?.[0] || habitReminders.triggers?.[0]}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {sportFocus && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  {isAthlete ? (
                    <FaFire className="text-orange-500" />
                  ) : (
                    <FaHeart className="text-rose-500" />
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wide text-emerald-700 font-medium">
                      {isAthlete ? getSportLabel(profileForm.primarySport) : 'Vida sana'}
                    </p>
                    <h3 className="font-semibold text-gray-900">Moverme</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{sportFocus.recommendations?.[0] || sportFocus.summary}</p>
              </div>
            )}

            {nutritionPlan && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FaUtensils className="text-orange-600" />
                  <h3 className="font-semibold text-gray-900">Comida de hoy</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  {(nutritionPlan.rules || []).slice(0, 3).map((rule) => (
                    <li key={rule} className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FaTint className="text-cyan-600" />
                <h3 className="font-semibold text-gray-900">Agua</h3>
              </div>
              <form onSubmit={logHydration} className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="250 ml"
                  value={hydrationMl}
                  onChange={(e) => setHydrationMl(e.target.value)}
                  className="min-w-0 flex-1 border border-cyan-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm">
                  +
                </button>
              </form>
              <p className="text-xs text-cyan-800 mt-2">{categories.hidratacion?.summary}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            {Object.entries(CATEGORY_META).map(([key, meta]) => {
              const category = categories[key] || {};
              const Icon = meta.icon;
              return (
                <div key={key} className="bg-white rounded-xl shadow border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon style={{ color: meta.color }} />
                    <h3 className="font-semibold text-gray-900 text-sm">{meta.label}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{category.recommendations?.[0] || category.summary || 'Sin acción por ahora.'}</p>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-500 text-center">
            {data.recommendations?.disclaimer || 'Orientación de bienestar. No reemplaza evaluación médica.'}
          </p>
        </>
      )}
    </WellnessModuleLayout>
  );
}

export default RecomendadorHabitos;
