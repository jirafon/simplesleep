import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SleepLayout from '../../components/sleep/SleepLayout';
import {
  SleepScoreRing,
  SleepStagesBar,
  FactorImpactChart
} from '../../components/sleep/charts/SleepCharts';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../i18n/useT';
import apiClient from '../../config/axios';

function TodayPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const t = useT();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: payload } = await apiClient.get('/sleep/v1/today');
      setData(payload);
    } catch (err) {
      setError(err.response?.data?.message || t('app.today.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  if (authLoading || (isAuthenticated && loading && !data)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50/80 via-slate-50 to-sky-50/50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-800" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <SleepLayout title={t('app.today.title')} subtitle={t('app.today.signInSubtitle')}>
        <Link to="/login" className="inline-flex rounded-xl bg-slate-900 text-white px-5 py-3">
          {t('app.nav.signIn')}
        </Link>
      </SleepLayout>
    );
  }

  const score = data?.sleepScore?.score;
  const quality = data?.sleepScore?.quality;
  const last = data?.lastNight || {};
  const rec = data?.recommendation || {};
  const factors = data?.sleepScore?.factors || [];
  const hasStages = [last.deep, last.light, last.rem, last.awakeMinutes].some(
    (v) => typeof v === 'number' && v > 0
  );

  return (
    <SleepLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {!data?.onboardingCompleted && (
          <Link
            to="/onboarding"
            className="block rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950"
          >
            {t('app.today.onboardingBanner')}
          </Link>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-900 px-4 py-3 text-sm">{error}</div>
        )}

        <header className="text-center pt-1">
          <p className="text-xs uppercase tracking-[0.22em] text-teal-800/70 mb-2">{t('app.brand')}</p>
          <h1
            className="text-3xl sm:text-4xl text-slate-900 tracking-tight"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
          >
            {t('app.today.headline')}
          </h1>
          <p className="mt-2 text-slate-600 text-sm max-w-md mx-auto">{t('app.today.promise')}</p>
        </header>

        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-b from-white via-white to-teal-50/40 px-6 py-8 shadow-[0_20px_50px_-28px_rgba(15,118,110,0.35)] text-center">
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.35), transparent 70%)' }}
          />
          <div
            className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.3), transparent 70%)' }}
          />
          <p className="relative text-sm text-slate-500 mb-4">{t('app.today.sleepScore')}</p>
          <div className="relative flex justify-center">
            <SleepScoreRing score={score} quality={quality} label={t('app.today.sleepScore')} />
          </div>
          <p className="relative mt-4 text-xs text-slate-400 max-w-sm mx-auto">{data?.sleepScore?.disclaimer}</p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Stat label={t('app.today.hoursSlept')} value={formatHours(last.totalMinutes)} />
          <Stat label={t('app.today.vsBaseline')} value={formatDelta(last.vsBaselineMinutes)} />
          <Stat
            label={t('app.today.interruptions')}
            value={last.wakingCount != null ? String(last.wakingCount) : '—'}
          />
          <Stat
            label={t('app.today.nightPulse')}
            value={last.nightHeartRate != null ? `${Math.round(last.nightHeartRate)} bpm` : '—'}
          />
        </section>

        {hasStages && (
          <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">{t('app.today.stages')}</h2>
            <SleepStagesBar
              deep={last.deep}
              light={last.light}
              rem={last.rem}
              awake={last.awakeMinutes}
              labels={{
                deep: t('app.device.sleepDeep'),
                light: t('app.device.sleepLight'),
                rem: t('app.device.sleepRem'),
                awake: t('app.device.sleepAwake')
              }}
            />
          </section>
        )}

        <section className="rounded-3xl bg-slate-900 text-white p-6 shadow-lg shadow-slate-900/20">
          <p className="text-sm text-teal-200/80 mb-2 tracking-wide uppercase">{t('app.today.recommendation')}</p>
          <p className="text-lg font-medium leading-snug" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            {rec.explanation}
          </p>
          <p className="mt-4 text-sm text-sky-200">{rec.action}</p>
        </section>

        {factors.length > 0 && (
          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <FactorImpactChart factors={factors} title={t('app.today.factors')} />
          </section>
        )}

        <section className="grid sm:grid-cols-2 gap-3">
          <ActionCard
            title={t('app.today.morningCta')}
            body={t('app.improve.morningTitle')}
            to="/improve?tab=morning"
            done={data?.checkIn?.morningDone}
          />
          <ActionCard
            title={t('app.today.eveningCta')}
            body={t('app.improve.eveningTitle')}
            to="/improve?tab=evening"
            done={data?.checkIn?.eveningDone}
          />
        </section>

        <div className="flex flex-wrap justify-center gap-3 pb-8">
          <Link to="/reports" className="text-sm underline text-slate-600">
            {t('app.nav.reports')}
          </Link>
          <Link to="/device" className="text-sm underline text-slate-600">
            {t('app.nav.device')}
          </Link>
        </div>
      </div>
    </SleepLayout>
  );
}

function Stat({ label, value }) {
  return (
    <div className="sleep-chart-fade rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className="text-xl font-semibold text-slate-900 mt-1 tabular-nums"
        style={{ fontFamily: 'Fraunces, Georgia, serif' }}
      >
        {value}
      </p>
    </div>
  );
}

function ActionCard({ title, body, to, done }) {
  return (
    <Link
      to={to}
      className={`block rounded-2xl border p-4 transition ${
        done ? 'border-teal-200 bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-300'
      }`}
    >
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-1">{body}</p>
    </Link>
  );
}

function formatHours(minutes) {
  if (typeof minutes !== 'number') return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

function formatDelta(minutes) {
  if (typeof minutes !== 'number') return '—';
  const sign = minutes > 0 ? '+' : '';
  return `${sign}${Math.round(minutes)} min`;
}

export default TodayPage;
