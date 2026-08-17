import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SleepLayout from '../../components/sleep/SleepLayout';
import ExperimentResultCard from '../../components/sleep/ExperimentResultCard';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../i18n/useT';
import apiClient from '../../config/axios';
import FEATURE_FLAGS from '../../config/featureFlags';

const SUGGESTIONS = [
  'Why am I tired today?',
  'What should I do tonight?',
  'Does late screen time affect my sleep?',
  'What changed this week?',
  'Which habit seems to work best for me?'
];

function CoachPage() {
  const { isAuthenticated } = useAuth();
  const t = useT();
  const [tonight, setTonight] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [whatWorks, setWhatWorks] = useState([]);
  const [streaks, setStreaks] = useState(null);
  const [active, setActive] = useState(null);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(null);
  const [error, setError] = useState('');

  const [triedTonight, setTriedTonight] = useState(false);
  const [trying, setTrying] = useState(false);
  const [activatingBand, setActivatingBand] = useState(null);
  const [bandMsg, setBandMsg] = useState('');

  const load = async () => {
    setError('');
    try {
      const [todayRes, recRes] = await Promise.all([
        apiClient.get('/sleep/v1/today'),
        apiClient.get('/sleep/v1/experiments/recommended')
      ]);
      setTonight(todayRes.data?.recommendation || null);
      setTriedTonight(Boolean(todayRes.data?.recommendation?.tried));
      setStreaks(todayRes.data?.softStreaks || null);
      setRecommended(recRes.data?.recommended || []);
      setActive(recRes.data?.active || null);
      setWhatWorks(recRes.data?.whatWorks || []);
    } catch (err) {
      setError(err.response?.data?.message || t('app.coach.loadError'));
    }
  };

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  const ask = async (text) => {
    const q = (text || message).trim();
    if (!q || sending) return;
    setSending(true);
    setMessage('');
    setChat((c) => [...c, { role: 'user', text: q }]);
    try {
      const { data } = await apiClient.post('/sleep/v1/coach/chat', { message: q });
      setChat((c) => [...c, { role: 'assistant', text: data.reply, source: data.source }]);
    } catch (err) {
      setChat((c) => [
        ...c,
        { role: 'assistant', text: err.response?.data?.message || t('app.coach.chatError') }
      ]);
    } finally {
      setSending(false);
    }
  };

  const startExperiment = async (experimentId) => {
    setStarting(experimentId);
    try {
      await apiClient.post('/sleep/v1/experiments/start', { experimentId });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || t('app.coach.startError'));
    } finally {
      setStarting(null);
    }
  };

  const markTryTonight = async () => {
    if (triedTonight || trying) return;
    setTrying(true);
    setTriedTonight(true);
    try {
      await apiClient.post('/sleep/v1/recommendation/tonight/try', {
        title: tonight?.title || tonight?.action,
        reason: tonight?.reason || tonight?.explanation,
        factor: tonight?.factor || tonight?.focusFactor,
        confidence: tonight?.confidence,
        algorithmVersion: tonight?.algorithmVersion
      });
      await load();
    } catch {
      /* keep optimistic */
    } finally {
      setTrying(false);
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

  if (!isAuthenticated) {
    return (
      <SleepLayout title={t('app.coach.title')} subtitle={t('app.coach.subtitle')}>
        <Link to="/login" className="underline">
          {t('app.common.signInPrompt')}
        </Link>
      </SleepLayout>
    );
  }

  if (!FEATURE_FLAGS.AI_SLEEP_COACH) {
    return (
      <SleepLayout title={t('app.coach.title')}>
        <p className="text-sm text-slate-600">{t('app.coach.disabled')}</p>
        <Link to="/improve" className="text-teal-800 underline text-sm">
          {t('app.nav.improve')}
        </Link>
      </SleepLayout>
    );
  }

  const moveTitle = tonight?.title || tonight?.action;
  const moveReason = tonight?.reason || tonight?.explanation;
  const complianceRate =
    typeof active?.compliance === 'number'
      ? active.compliance
      : active?.compliance?.rate != null
        ? active.compliance.rate / 100
        : 0;

  return (
    <SleepLayout title={t('app.coach.title')} subtitle={t('app.coach.subtitle')}>
      <div className="max-w-2xl space-y-6">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-900 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <section className="rounded-3xl bg-slate-900 text-white p-6 shadow-lg shadow-slate-900/20">
          <p className="text-sm text-teal-200/80 mb-2 tracking-wide uppercase">{t('app.coach.tonight')}</p>
          {moveTitle ? (
            <>
              <p className="text-xl leading-snug" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                {moveTitle}
              </p>
              {moveReason && <p className="mt-3 text-sm text-sky-200/90">{moveReason}</p>}
            </>
          ) : (
            <p className="text-sm text-slate-300">{t('app.coach.noMove')}</p>
          )}
          <button
            type="button"
            onClick={markTryTonight}
            disabled={triedTonight || trying || !moveTitle}
            className="mt-5 inline-flex rounded-xl bg-teal-400/90 text-slate-950 px-4 py-2.5 text-sm font-medium disabled:opacity-70"
          >
            {triedTonight ? t('app.today.illTryDone') : t('app.coach.illTry')}
          </button>
          {Array.isArray(tonight?.bandReminders) && tonight.bandReminders.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-teal-200/80">{t('app.today.bandReminderHint')}</p>
              {tonight.bandReminders.map((br) => (
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

        {streaks?.items?.length > 0 && (
          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-teal-800/70 mb-2">
              {t('app.coach.consistency')}
            </p>
            <p className="text-sm text-slate-600 mb-3">{streaks.encouragement}</p>
            <ul className="grid sm:grid-cols-2 gap-3">
              {streaks.items.map((s) => (
                <li key={s.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-xl font-semibold text-teal-900 tabular-nums">{s.days}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.detail}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {active && (
          <section className="rounded-3xl border border-teal-200 bg-teal-50/50 p-5 space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-teal-800/70">
              {t('app.coach.activeExperiment')}
            </p>
            <h2 className="text-lg text-slate-900" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              {active.title}
            </h2>
            <p className="text-sm text-slate-600">
              {t('app.coach.dayProgress', {
                day: active.compliance?.completedDays ?? active.currentDay ?? '—',
                total: active.durationDays || 7
              })}
            </p>
            <div className="h-2 rounded-full bg-white overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full"
                style={{ width: `${Math.min(100, Math.round(complianceRate * 100))}%` }}
              />
            </div>
            {active.result && (
              <ExperimentResultCard result={active.result} compliance={active.compliance} />
            )}
            <Link to="/improve?tab=experiments" className="inline-block text-sm text-teal-900 underline">
              {t('app.coach.manageExperiment')}
            </Link>
          </section>
        )}

        {whatWorks.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-semibold text-slate-900">{t('app.coach.whatWorksTitle')}</h2>
            {whatWorks.map((w) => (
              <ExperimentResultCard
                key={w.id}
                title={w.title}
                result={w.result}
                compliance={w.compliance}
              />
            ))}
          </section>
        )}

        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-teal-800/70 mb-2">
            {t('app.coach.askTitle')}
          </p>
          <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
            {chat.length === 0 && <p className="text-sm text-slate-500">{t('app.coach.askHint')}</p>}
            {chat.map((m, i) => (
              <div
                key={i}
                className={`rounded-2xl px-4 py-3 text-sm ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white ml-8'
                    : 'bg-sky-50 text-slate-800 mr-8 border border-sky-100'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="text-xs rounded-full border border-slate-200 px-3 py-1.5 text-slate-600 hover:border-teal-400 hover:text-teal-900"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              ask();
            }}
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('app.coach.placeholder')}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={sending}
              className="rounded-xl bg-teal-800 text-white px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {sending ? '…' : t('app.coach.ask')}
            </button>
          </form>
        </section>

        {!active && recommended.length > 0 && (
          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-1">{t('app.coach.tryExperiment')}</h2>
            <p className="text-sm text-slate-500 mb-4">{t('app.coach.tryExperimentHint')}</p>
            <ul className="space-y-3">
              {recommended.slice(0, 4).map((exp) => (
                <li
                  key={exp.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium text-slate-900">{exp.title}</p>
                    <p className="text-sm text-slate-500">{exp.goal}</p>
                  </div>
                  <button
                    type="button"
                    disabled={starting === exp.id}
                    onClick={() => startExperiment(exp.id)}
                    className="shrink-0 rounded-xl border border-teal-700 text-teal-900 px-3 py-2 text-sm hover:bg-teal-50"
                  >
                    {starting === exp.id ? '…' : t('app.coach.start7')}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </SleepLayout>
  );
}

export default CoachPage;
