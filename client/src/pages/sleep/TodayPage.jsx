import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SleepLayout from '../../components/sleep/SleepLayout';
import {
  SleepScoreRing,
  SleepStagesBar,
  FactorImpactChart
} from '../../components/sleep/charts/SleepCharts';
import SleepContextTimeline from '../../components/sleep/SleepContextTimeline';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../i18n/useT';
import apiClient from '../../config/axios';
import FEATURE_FLAGS from '../../config/featureFlags';

function TodayPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const t = useT();
  const [data, setData] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [interruptionInsight, setInterruptionInsight] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [triedTonight, setTriedTonight] = useState(false);
  const [activatingBand, setActivatingBand] = useState(null);
  const [bandMsg, setBandMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: payload } = await apiClient.get('/sleep/v1/today');
      setData(payload);
      if (FEATURE_FLAGS.SLEEP_CONTEXT_TIMELINE) {
        try {
          const dateKey = payload?.lastNight?.timestamp
            ? new Date(payload.lastNight.timestamp).toISOString().slice(0, 10)
            : payload?.dateKey;
          const { data: tl } = await apiClient.get(
            dateKey ? `/sleep/v1/timeline/${dateKey}` : '/sleep/v1/timeline'
          );
          setTimeline(tl.timeline || null);
          setInterruptionInsight(tl.interruptionInsight || null);
        } catch {
          setTimeline(null);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || t('app.today.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  useEffect(() => {
    if (data?.recommendation?.tried) setTriedTonight(true);
  }, [data?.recommendation?.tried]);

  const markTryTonight = async () => {
    if (triedTonight) return;
    setTriedTonight(true);
    try {
      await apiClient.post('/sleep/v1/recommendation/tonight/try', {
        title: data?.recommendation?.title || data?.recommendation?.action,
        reason: data?.recommendation?.reason || data?.recommendation?.explanation,
        factor: data?.recommendation?.factor || data?.recommendation?.focusFactor,
        confidence: data?.recommendation?.confidence,
        algorithmVersion: data?.recommendation?.algorithmVersion
      });
      // refresh streaks quietly
      const { data: payload } = await apiClient.get('/sleep/v1/today');
      setData(payload);
    } catch {
      /* keep optimistic UI */
    }
  };

  const activateBandReminder = async (suggestion) => {
    if (!suggestion?.id || activatingBand) return;
    setActivatingBand(suggestion.id);
    setBandMsg('');
    try {
      const { data: res } = await apiClient.post('/sleep/v1/reminders/band/activate', {
        reminderId: suggestion.id,
        time: suggestion.startTime || suggestion.time,
        vibrationCount: suggestion.vibrationCount,
        label: suggestion.label,
        aiReason: suggestion.aiReason
      });
      setBandMsg(res.syncHint || t('app.today.bandReminderSaved'));
    } catch (err) {
      setBandMsg(err.response?.data?.message || t('app.today.bandReminderError'));
    } finally {
      setActivatingBand(null);
    }
  };
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
  const sleepFactors = data?.sleepFactors || [];
  const phoneToSleep = data?.phoneToSleep;
  const brief = data?.morningBrief;
  const softStreaks = data?.softStreaks;
  const scoreFactors = data?.sleepScore?.factors || [];
  const hasStages = [last.deep, last.light, last.rem, last.awakeMinutes].some(
    (v) => typeof v === 'number' && v > 0
  );
  const firstName = (user?.name || user?.firstName || '').toString().split(' ')[0];
  const moveTitle = rec.title || rec.action || '';
  const moveReason = rec.reason || rec.explanation || '';
  const chartFactors = sleepFactors.map((f) => ({
    id: f.id,
    label: f.label,
    detail: [f.value, f.detail].filter(Boolean).join(' · '),
    impact:
      f.direction === 'positive'
        ? (f.confidence || 0.5) * 10
        : f.direction === 'negative'
          ? -(f.confidence || 0.5) * 10
          : 0
  }));

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
          <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-900 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <header className="pt-1">
          <p className="text-xs uppercase tracking-[0.22em] text-teal-800/70 mb-2">{t('app.brand')}</p>
          <h1
            className="text-3xl sm:text-4xl text-slate-900 tracking-tight"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
          >
            {firstName
              ? t('app.today.greetingName', { name: firstName })
              : t('app.today.greeting')}
          </h1>
          <p className="mt-2 text-slate-600 text-sm max-w-lg">{t('app.today.promise')}</p>
        </header>

        {FEATURE_FLAGS.AI_MORNING_BRIEF && brief?.paragraphs?.length > 0 && (
          <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/90 to-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-teal-800/70 mb-3">
              {t('app.today.morningBrief')}
            </p>
            <div className="space-y-3 text-slate-700 text-sm leading-relaxed">
              {brief.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        )}

        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-b from-white via-white to-teal-50/40 px-6 py-8 shadow-[0_20px_50px_-28px_rgba(15,118,110,0.35)] text-center">
          <p className="relative text-sm text-slate-500 mb-2">{t('app.today.sleepScore')}</p>
          <div className="relative flex justify-center">
            <SleepScoreRing score={score} quality={quality} label={t('app.today.sleepScore')} />
          </div>
          <p
            className="relative mt-4 text-2xl text-slate-900 tabular-nums"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
          >
            {formatHours(last.totalMinutes)}
          </p>
          <p className="relative mt-1 text-sm text-slate-500">
            {typeof last.vsBaselineMinutes === 'number'
              ? t('app.today.vsBaselineLine', { delta: formatDelta(last.vsBaselineMinutes) })
              : t('app.today.closeToUsual')}
          </p>
        </section>

        {chartFactors.length > 0 && (
          <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <h2
              className="text-lg text-slate-900 mb-1"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
            >
              {t('app.today.whatShaped')}
            </h2>
            <p className="text-sm text-slate-500 mb-4">{t('app.today.whatShapedHint')}</p>
            <FactorImpactChart factors={chartFactors} title="" />
          </section>
        )}

        {(moveTitle || moveReason) && (
          <section className="rounded-3xl bg-slate-900 text-white p-6 shadow-lg">
            <p className="text-sm text-teal-200/80 mb-2 tracking-wide uppercase">
              {t('app.today.tonightMove')}
            </p>
            {moveTitle && (
              <p className="text-xl font-medium leading-snug" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                {moveTitle}
              </p>
            )}
            {moveReason && <p className="mt-3 text-sm text-sky-200/90">{moveReason}</p>}
            <button
              type="button"
              onClick={markTryTonight}
              disabled={triedTonight}
              className="mt-5 inline-flex rounded-xl bg-teal-400/90 text-slate-950 px-4 py-2.5 text-sm font-medium disabled:opacity-70"
            >
              {triedTonight ? t('app.today.illTryDone') : t('app.today.illTryThis')}
            </button>
            {Array.isArray(rec.bandReminders) && rec.bandReminders.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-teal-200/80">{t('app.today.bandReminderHint')}</p>
                {rec.bandReminders.map((br) => (
                  <button
                    key={br.id}
                    type="button"
                    onClick={() => activateBandReminder(br)}
                    disabled={activatingBand === br.id}
                    className="block w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-left text-sm text-white hover:bg-white/15 disabled:opacity-60"
                  >
                    {br.cta || t('app.today.bandReminderCta', { n: br.vibrationCount, time: br.time })}
                  </button>
                ))}
                {bandMsg && <p className="text-xs text-sky-200/90 pt-1">{bandMsg}</p>}
              </div>
            )}
          </section>
        )}

        {softStreaks?.items?.length > 0 && (
          <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-teal-800/70 mb-2">
              {t('app.today.consistency')}
            </p>
            <p className="text-sm text-slate-600 mb-3">{softStreaks.encouragement}</p>
            <div className="flex flex-wrap gap-3">
              {softStreaks.items
                .filter((s) => s.days > 0)
                .slice(0, 3)
                .map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-teal-100 bg-teal-50/50 px-3 py-2 min-w-[7rem]"
                  >
                    <p className="text-xs text-slate-500">{s.label}</p>
                    <p className="text-lg font-semibold text-teal-900 tabular-nums">{s.days}</p>
                  </div>
                ))}
            </div>
          </section>
        )}

        {phoneToSleep?.screenToSleepMinutes != null && (
          <section className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-sky-50/80 to-white p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-teal-800/70 mb-3">
              {t('app.today.phoneToSleep')}
            </p>
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <p className="text-xs text-slate-500">{t('app.today.phoneDown')}</p>
                <p className="text-lg text-slate-900 font-medium">
                  {formatClock(phoneToSleep.lastInteractionAt) || '—'}
                </p>
              </div>
              <div className="text-slate-300 text-xl">→</div>
              <div>
                <p className="text-xs text-slate-500">{t('app.today.sleepDetected')}</p>
                <p className="text-lg text-slate-900 font-medium">
                  {t('app.today.minutesShort', { n: phoneToSleep.screenToSleepMinutes })}
                </p>
              </div>
            </div>
          </section>
        )}

        {FEATURE_FLAGS.SLEEP_CONTEXT_TIMELINE && (
          <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-3">{t('app.today.timeline')}</h2>
            <SleepContextTimeline timeline={timeline} emptyLabel={t('app.today.timelineEmpty')} />
            {interruptionInsight && (
              <p className="mt-4 text-sm text-slate-600 border-t border-slate-100 pt-3">
                {interruptionInsight.observation}
              </p>
            )}
          </section>
        )}

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

        {scoreFactors.length > 0 && chartFactors.length === 0 && (
          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <FactorImpactChart factors={scoreFactors} title={t('app.today.factors')} />
          </section>
        )}

        <section className="rounded-3xl border border-dashed border-teal-200/80 bg-teal-50/40 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-teal-800/70 mb-2">
            {t('app.today.askTitle')}
          </p>
          <p className="text-slate-800" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            {t('app.today.askExample')}
          </p>
          <Link
            to={FEATURE_FLAGS.AI_SLEEP_COACH ? '/coach' : '/insights'}
            className="mt-3 inline-flex text-sm font-medium text-teal-900 underline underline-offset-4"
          >
            {t('app.today.askCta')}
          </Link>
        </section>

        <div className="flex flex-wrap justify-center gap-3 pb-8">
          <Link to="/device" className="text-sm underline text-slate-600">
            {t('app.nav.device')}
          </Link>
          <Link to="/reports" className="text-sm underline text-slate-600">
            {t('app.nav.reports')}
          </Link>
        </div>
      </div>
    </SleepLayout>
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

function formatClock(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default TodayPage;
