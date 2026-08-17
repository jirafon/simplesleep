import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SleepLayout from '../../components/sleep/SleepLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/axios';
import { useT } from '../../i18n/useT';

const STEPS = [
  { key: 'intro', titleKey: 'app.onboarding.introTitle' },
  { key: 'goal', titleKey: 'app.onboarding.goalTitle' },
  { key: 'schedule', titleKey: 'app.onboarding.scheduleTitle' },
  { key: 'habits', titleKey: 'app.onboarding.habitsTitle' },
  { key: 'perms', titleKey: 'app.onboarding.permsTitle' }
];

function OnboardingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const [step, setStep] = useState(0);
  const [introIdx, setIntroIdx] = useState(0);
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
    sleepContextInterest: false,
    onboardingStep: 0
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const introSlides = [
    { title: t('app.onboarding.intro1Title'), body: t('app.onboarding.intro1Body') },
    { title: t('app.onboarding.intro2Title'), body: t('app.onboarding.intro2Body') },
    { title: t('app.onboarding.intro3Title'), body: t('app.onboarding.intro3Body') },
    { title: t('app.onboarding.intro4Title'), body: t('app.onboarding.intro4Body') }
  ];

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
          if (data.profile.onboardingStep) {
            setStep(Math.min(data.profile.onboardingStep, STEPS.length - 1));
          }
        }
      } catch {
        setMessage(t('app.onboarding.loadError'));
      }
    })();
  }, [isAuthenticated, t]);

  const save = async (extra = {}) => {
    setSaving(true);
    setMessage('');
    try {
      await apiClient.put('/sleep/v1/onboarding', {
        ...form,
        ...extra,
        onboardingStep: step
      });
      setMessage(t('app.onboarding.saved'));
    } catch (err) {
      setMessage(err.response?.data?.message || t('app.onboarding.saveError'));
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
      setMessage(err.response?.data?.message || t('app.onboarding.finishError'));
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SleepLayout title={t('app.onboarding.title')}>
        <Link to="/login" className="underline">
          {t('app.common.signInPrompt')}
        </Link>
      </SleepLayout>
    );
  }

  const current = STEPS[step];

  return (
    <SleepLayout title={t('app.onboarding.title')} subtitle={t('app.onboarding.subtitle')}>
      <div className="max-w-lg mx-auto">
        <div className="flex gap-1 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-slate-900' : 'bg-slate-200'}`}
            />
          ))}
        </div>

        {current.key === 'intro' && (
          <div className="space-y-4">
            <h2
              className="text-2xl text-slate-900"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
            >
              {introSlides[introIdx].title}
            </h2>
            <p className="text-slate-600 leading-relaxed">{introSlides[introIdx].body}</p>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white"
              onClick={() => {
                if (introIdx < introSlides.length - 1) setIntroIdx(introIdx + 1);
                else setStep(1);
              }}
            >
              {t('app.onboarding.next')}
            </button>
          </div>
        )}

        {current.key !== 'intro' && (
          <h2 className="text-xl font-semibold text-slate-900 mb-4">{t(current.titleKey)}</h2>
        )}

        {current.key === 'goal' && (
          <div className="space-y-2">
            {goalOptions.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setForm({ ...form, primaryGoal: g.id })}
                className={`w-full text-left rounded-xl border px-4 py-3 text-sm ${
                  form.primaryGoal === g.id
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}

        {current.key === 'schedule' && (
          <div className="grid grid-cols-2 gap-3">
            <Field
              label={t('app.onboarding.usualBedtime')}
              type="time"
              value={form.usualBedtime}
              onChange={(v) => setForm({ ...form, usualBedtime: v, targetBedtime: v })}
            />
            <Field
              label={t('app.onboarding.usualWake')}
              type="time"
              value={form.usualWakeTime}
              onChange={(v) => setForm({ ...form, usualWakeTime: v, targetWakeTime: v })}
            />
            <Field
              label={t('app.onboarding.targetBedtime')}
              type="time"
              value={form.targetBedtime}
              onChange={(v) => setForm({ ...form, targetBedtime: v })}
            />
            <Field
              label={t('app.onboarding.sleepGoal')}
              type="number"
              value={form.sleepGoalMinutes}
              onChange={(v) => setForm({ ...form, sleepGoalMinutes: Number(v) })}
            />
          </div>
        )}

        {current.key === 'habits' && (
          <div className="space-y-3">
            <Field
              label={t('app.improve.caffeine')}
              value={form.caffeineHabit}
              onChange={(v) => setForm({ ...form, caffeineHabit: v })}
            />
            <Field
              label={t('app.improve.alcohol')}
              value={form.alcoholHabit}
              onChange={(v) => setForm({ ...form, alcoholHabit: v })}
            />
            <Field
              label={t('app.improve.lastMeal')}
              value={form.dinnerTiming}
              onChange={(v) => setForm({ ...form, dinnerTiming: v })}
            />
            <Field
              label={t('app.improve.screensLate')}
              value={form.screenUse}
              onChange={(v) => setForm({ ...form, screenUse: v })}
            />
          </div>
        )}

        {current.key === 'perms' && (
          <div className="space-y-4 text-sm">
            <p className="text-slate-600">{t('app.onboarding.permsIntro')}</p>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">{t('app.onboarding.permBand')}</p>
              <p className="text-slate-500">{t('app.onboarding.permBandHint')}</p>
            </div>
            <label className="flex items-start gap-2 rounded-2xl border border-slate-200 p-4">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.notificationConsent}
                onChange={(e) => setForm({ ...form, notificationConsent: e.target.checked })}
              />
              <span>
                <span className="font-medium text-slate-900 block">{t('app.onboarding.permNotif')}</span>
                {t('app.onboarding.permNotifHint')}
              </span>
            </label>
            <label className="flex items-start gap-2 rounded-2xl border border-slate-200 p-4">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.sleepContextInterest}
                onChange={(e) => setForm({ ...form, sleepContextInterest: e.target.checked })}
              />
              <span>
                <span className="font-medium text-slate-900 block">{t('app.onboarding.permContext')}</span>
                {t('app.onboarding.permContextHint')}
              </span>
            </label>
            <label className="flex items-start gap-2 rounded-2xl border border-slate-200 p-4">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.locationConsent}
                onChange={(e) => setForm({ ...form, locationConsent: e.target.checked })}
              />
              <span>
                <span className="font-medium text-slate-900 block">{t('app.onboarding.permLocation')}</span>
                {t('app.onboarding.permLocationHint')}
              </span>
            </label>
            <p className="text-xs text-slate-500">{t('app.onboarding.permHcHint')}</p>
          </div>
        )}

        {current.key !== 'intro' && (
          <div className="flex flex-wrap gap-2 mt-8">
            {step > 0 && (
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-slate-300"
                onClick={() => setStep(step - 1)}
              >
                {t('app.onboarding.back')}
              </button>
            )}
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
              <button
                type="button"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white"
                onClick={finish}
              >
                {t('app.onboarding.finish')}
              </button>
            )}
            <button
              type="button"
              className="px-4 py-2 text-sm text-slate-500 underline"
              onClick={() => navigate('/dashboard')}
            >
              {t('app.onboarding.skip')}
            </button>
          </div>
        )}
        {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      </div>
    </SleepLayout>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block text-sm text-slate-700 col-span-2 sm:col-span-1">
      {label}
      <input
        type={type}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default OnboardingPage;
