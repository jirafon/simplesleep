import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SleepLayout from '../../components/sleep/SleepLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/axios';
import { useT } from '../../i18n/useT';

const STEPS = [
  {
    key: 'goal',
    title: 'What do you want to improve?',
    fields: ['primaryGoal']
  },
  {
    key: 'schedule',
    title: 'Your sleep schedule',
    fields: ['usualBedtime', 'usualWakeTime', 'targetBedtime', 'targetWakeTime', 'sleepGoalMinutes']
  },
  {
    key: 'habits',
    title: 'Evening habits (optional)',
    fields: ['caffeineHabit', 'alcoholHabit', 'dinnerTiming', 'stressLevel', 'screenUse']
  },
  {
    key: 'prefs',
    title: 'Reminders & privacy',
    fields: ['vibrationPreference', 'notificationConsent', 'locationConsent']
  }
];

function OnboardingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const [step, setStep] = useState(0);
  const [goalOptions, setGoalOptions] = useState([]);
  const [form, setForm] = useState({
    primaryGoal: null,
    usualBedtime: '22:30',
    usualWakeTime: '07:00',
    targetBedtime: '22:30',
    targetWakeTime: '07:00',
    sleepGoalMinutes: 480,
    caffeineHabit: '',
    alcoholHabit: '',
    dinnerTiming: '',
    stressLevel: 5,
    screenUse: '',
    vibrationPreference: { intensity: 'gentle', enabled: true },
    notificationConsent: false,
    locationConsent: false,
    onboardingStep: 0
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const { data } = await apiClient.get('/sleep/v1/onboarding');
        setGoalOptions(data.goalOptions || []);
        if (data.profile) {
          setForm((f) => ({
            ...f,
            ...data.profile,
            sleepGoalMinutes: data.sleepGoalMinutes || 480,
            vibrationPreference: data.profile.vibrationPreference || f.vibrationPreference
          }));
          if (data.profile.onboardingStep) setStep(Math.min(data.profile.onboardingStep, STEPS.length - 1));
        }
      } catch {
        setMessage('Could not load onboarding.');
      }
    })();
  }, [isAuthenticated]);

  const save = async (extra = {}) => {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        ...form,
        ...extra,
        onboardingStep: step
      };
      await apiClient.put('/sleep/v1/onboarding', payload);
      setMessage('Saved');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    setSaving(true);
    try {
      await apiClient.put('/sleep/v1/onboarding', {
        ...form,
        onboardingCompleted: true,
        onboardingStep: STEPS.length
      });
      navigate('/dashboard');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not finish');
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SleepLayout title={t('app.onboarding.title')}>
        <Link to="/login" className="underline">{t('app.common.signInPrompt')}</Link>
      </SleepLayout>
    );
  }

  const current = STEPS[step];

  return (
    <SleepLayout title={t('app.onboarding.title')} subtitle={t('app.onboarding.subtitle')}>
      <div className="max-w-lg mx-auto">
        <div className="flex gap-1 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-slate-900' : 'bg-slate-200'}`} />
          ))}
        </div>

        <h2 className="text-xl font-semibold text-slate-900 mb-4">{current.title}</h2>

        {current.key === 'goal' && (
          <div className="space-y-2">
            {goalOptions.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setForm({ ...form, primaryGoal: g.id })}
                className={`w-full text-left rounded-xl border px-4 py-3 text-sm ${
                  form.primaryGoal === g.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}

        {current.key === 'schedule' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Usual bedtime" type="time" value={form.usualBedtime} onChange={(v) => setForm({ ...form, usualBedtime: v, targetBedtime: v })} />
            <Field label="Usual wake" type="time" value={form.usualWakeTime} onChange={(v) => setForm({ ...form, usualWakeTime: v, targetWakeTime: v })} />
            <Field label="Target bedtime" type="time" value={form.targetBedtime} onChange={(v) => setForm({ ...form, targetBedtime: v })} />
            <Field label="Sleep goal (min)" type="number" value={form.sleepGoalMinutes} onChange={(v) => setForm({ ...form, sleepGoalMinutes: Number(v) })} />
          </div>
        )}

        {current.key === 'habits' && (
          <div className="space-y-3">
            <Field label="Caffeine" value={form.caffeineHabit} onChange={(v) => setForm({ ...form, caffeineHabit: v })} placeholder="e.g. coffee until 3 PM" />
            <Field label="Alcohol" value={form.alcoholHabit} onChange={(v) => setForm({ ...form, alcoholHabit: v })} placeholder="e.g. occasional wine" />
            <Field label="Dinner timing" value={form.dinnerTiming} onChange={(v) => setForm({ ...form, dinnerTiming: v })} placeholder="e.g. around 8 PM" />
            <Field label="Screen use at night" value={form.screenUse} onChange={(v) => setForm({ ...form, screenUse: v })} placeholder="e.g. phone in bed" />
            <label className="block text-sm text-slate-700">
              Stress (0–10)
              <input
                type="range"
                min={0}
                max={10}
                value={form.stressLevel ?? 5}
                onChange={(e) => setForm({ ...form, stressLevel: Number(e.target.value) })}
                className="w-full mt-1"
              />
            </label>
          </div>
        )}

        {current.key === 'prefs' && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.notificationConsent}
                onChange={(e) => setForm({ ...form, notificationConsent: e.target.checked })}
              />
              Allow reminder notifications
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.locationConsent}
                onChange={(e) => setForm({ ...form, locationConsent: e.target.checked })}
              />
              Optional location for Connect (family) — off by default
            </label>
            <p className="text-xs text-slate-500">
              Vibration preferences sync with your band reminders. We never use this for medical diagnosis.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-8">
          {step > 0 && (
            <button type="button" className="px-4 py-2 rounded-xl border border-slate-300" onClick={() => setStep(step - 1)}>
              {t('app.onboarding.back')}
            </button>
          )}
          <button
            type="button"
            disabled={saving}
            className="px-4 py-2 rounded-xl border border-slate-300"
            onClick={() => save()}
          >
            {t('app.common.save')}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white"
              onClick={async () => {
                await save({ onboardingStep: step + 1 });
                setStep(step + 1);
              }}
            >
              {t('app.onboarding.next')}
            </button>
          ) : (
            <button type="button" disabled={saving} className="px-4 py-2 rounded-xl bg-slate-900 text-white" onClick={finish}>
              {t('app.onboarding.finish')}
            </button>
          )}
          <button type="button" className="px-4 py-2 text-sm text-slate-500 underline" onClick={() => navigate('/dashboard')}>
            {t('app.onboarding.skip')}
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      </div>
    </SleepLayout>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label className="block text-sm text-slate-700 col-span-2 sm:col-span-1">
      {label}
      <input
        type={type}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default OnboardingPage;
