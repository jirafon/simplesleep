import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SleepLayout from '../../components/sleep/SleepLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/axios';
import { useT } from '../../i18n/useT';

const FEELINGS = [
  { id: 'rested', labelKey: 'app.improve.rested' },
  { id: 'okay', labelKey: 'app.improve.okay' },
  { id: 'tired', labelKey: 'app.improve.tired' },
  { id: 'exhausted', labelKey: 'app.improve.exhausted' }
];

const NIGHT_EVENT_IDS = [
  'hot_flash', 'night_sweat', 'racing_heart', 'bathroom', 'stressful_thoughts',
  'noise', 'partner_movement', 'pain', 'nothing_unusual'
];

function ImprovePage() {
  const { isAuthenticated } = useAuth();
  const t = useT();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'morning';
  const [feeling, setFeeling] = useState(null);
  const [events, setEvents] = useState([]);
  const [evening, setEvening] = useState({
    caffeine: { had: false, time: '' },
    alcohol: { had: false, amount: '' },
    lastMealTime: '',
    dinnerSize: 'normal',
    stress: 5,
    screens: { late: false },
    bedroomTemp: 'comfortable'
  });
  const [msg, setMsg] = useState('');
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const { data } = await apiClient.get('/wellness/reminders');
        setReminders(data?.reminders || data?.importantReminders || []);
      } catch {
        /* optional */
      }
    })();
  }, [isAuthenticated]);

  const setTab = (t) => setParams({ tab: t });

  const toggleEvent = (id) => {
    setEvents((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submitMorning = async () => {
    if (!feeling) {
      setMsg(t('app.improve.pickFeeling'));
      return;
    }
    try {
      const { data } = await apiClient.post('/sleep/v1/checkins/morning', {
        feeling,
        nightEvents: events
      });
      setMsg(`Saved. Your Sleep Score is now ${data.sleepScore?.score ?? '—'}.`);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not save');
    }
  };

  const submitEvening = async () => {
    try {
      await apiClient.post('/sleep/v1/checkins/evening', evening);
      setMsg(t('app.improve.eveningSaved'));
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not save');
    }
  };

  const reminderTypes = useMemo(
    () => [
      'Begin wind-down routine',
      'Stop caffeine',
      'Evening check-in',
      'Go to bed',
      'Morning check-in',
      'Screen-free time'
    ],
    []
  );

  if (!isAuthenticated) {
    return (
      <SleepLayout title={t('app.improve.title')}>
        <Link to="/login" className="underline">Sign in</Link>
      </SleepLayout>
    );
  }

  return (
    <SleepLayout
      title={t('app.improve.title')}
      subtitle={t('app.improve.subtitle')}
    >
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'morning', label: t('app.improve.tabMorning') },
          { id: 'evening', label: t('app.improve.tabEvening') },
          { id: 'reminders', label: t('app.improve.tabReminders') },
          { id: 'experiments', label: t('app.improve.tabExperiments') }
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-3 py-2 rounded-lg text-sm border ${
              tab === item.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'morning' && (
        <section className="max-w-lg space-y-4">
          <h2 className="font-semibold text-lg">{t('app.improve.morningTitle')}</h2>
          <div className="grid grid-cols-2 gap-2">
            {FEELINGS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFeeling(f.id)}
                className={`rounded-xl border px-3 py-3 text-sm ${
                  feeling === f.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200'
                }`}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>
          <h3 className="font-medium text-sm text-slate-700 pt-2">{t('app.improve.nightEventsTitle')} ({t('app.common.optional')})</h3>
          <div className="flex flex-wrap gap-2">
            {NIGHT_EVENT_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleEvent(id)}
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  events.includes(id) ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'border-slate-200'
                }`}
              >
                {t(`app.nightEvents.${id}`)}
              </button>
            ))}
          </div>
          <button type="button" onClick={submitMorning} className="rounded-xl bg-slate-900 text-white px-5 py-3 text-sm font-medium">
            {t('app.improve.saveMorning')}
          </button>
        </section>
      )}

      {tab === 'evening' && (
        <section className="max-w-lg space-y-4">
          <h2 className="font-semibold text-lg">{t('app.improve.eveningTitle')}</h2>
          <Toggle
            label={t('app.improve.caffeine')}
            on={evening.caffeine.had}
            onChange={(had) => setEvening({ ...evening, caffeine: { ...evening.caffeine, had } })}
          />
          {evening.caffeine.had && (
            <input
              type="time"
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={evening.caffeine.time}
              onChange={(e) => setEvening({ ...evening, caffeine: { ...evening.caffeine, time: e.target.value } })}
            />
          )}
          <Toggle
            label={t('app.improve.alcohol')}
            on={evening.alcohol.had}
            onChange={(had) => setEvening({ ...evening, alcohol: { ...evening.alcohol, had } })}
          />
          <label className="block text-sm">
            Last meal
            <input
              type="time"
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2"
              value={evening.lastMealTime}
              onChange={(e) => setEvening({ ...evening, lastMealTime: e.target.value })}
            />
          </label>
          <div className="flex gap-2">
            {['light', 'normal', 'heavy'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setEvening({ ...evening, dinnerSize: s })}
                className={`px-3 py-2 rounded-lg text-sm border capitalize ${
                  evening.dinnerSize === s ? 'bg-slate-900 text-white' : 'border-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <Toggle
            label={t('app.improve.screensLate')}
            on={evening.screens.late}
            onChange={(late) => setEvening({ ...evening, screens: { late } })}
          />
          <label className="block text-sm">
            {t('app.improve.stress')}
            <input
              type="range"
              min={0}
              max={10}
              value={evening.stress}
              onChange={(e) => setEvening({ ...evening, stress: Number(e.target.value) })}
              className="w-full"
            />
          </label>
          <button type="button" onClick={submitEvening} className="rounded-xl bg-slate-900 text-white px-5 py-3 text-sm font-medium">
            {t('app.improve.saveEvening')}
          </button>
        </section>
      )}

      {tab === 'reminders' && (
        <section className="max-w-lg space-y-4">
          <h2 className="font-semibold text-lg">{t('app.improve.remindersTitle')}</h2>
          <p className="text-sm text-slate-600">
            Manage band vibrations in Device reminders. Suggested types for sleep:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 text-slate-700">
            {reminderTypes.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <Link to="/wellness/recordatorios" className="inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm">
            {t('app.improve.openReminders')}
          </Link>
          {reminders.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-3 text-sm">
              <p className="font-medium mb-2">{t('app.improve.activeReminders')}</p>
              {reminders.filter((r) => r.enabled !== false).slice(0, 6).map((r) => (
                <p key={r.id} className="text-slate-600">
                  {r.label} · {r.startTime || r.time} · {r.vibrationCount || 1}× vibe
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'experiments' && <ExperimentsPanel onMessage={setMsg} />}

      {msg && <p className="mt-6 text-sm text-emerald-800">{msg}</p>}
    </SleepLayout>
  );
}

function ExperimentsPanel({ onMessage }) {
  const t = useT();
  const [catalog, setCatalog] = useState([]);
  const [active, setActive] = useState(null);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/sleep/v1/experiments');
      setEnabled(data.enabled !== false);
      setCatalog(data.catalog || []);
      setActive(data.active || null);
    } catch (err) {
      onMessage(err.response?.data?.message || 'Could not load experiments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const start = async (experimentId) => {
    try {
      await apiClient.post('/sleep/v1/experiments/start', { experimentId });
      onMessage('Experiment started. Log each day you stick with it.');
      load();
    } catch (err) {
      onMessage(err.response?.data?.message || 'Could not start');
    }
  };

  const logToday = async (completed) => {
    if (!active?._id) return;
    try {
      await apiClient.post(`/sleep/v1/experiments/${active._id}/log`, { completed });
      onMessage(completed ? 'Marked done for today.' : 'Logged a miss for today.');
      load();
    } catch (err) {
      onMessage(err.response?.data?.message || 'Could not log');
    }
  };

  const finish = async (abandon) => {
    if (!active?._id) return;
    try {
      const { data } = await apiClient.post(`/sleep/v1/experiments/${active._id}/complete`, {
        abandon
      });
      onMessage(data.assignment?.result?.summary || 'Experiment closed.');
      load();
    } catch (err) {
      onMessage(err.response?.data?.message || 'Could not complete');
    }
  };

  if (loading) return <p className="text-sm text-slate-500">{t('app.improve.loadingExperiments')}</p>;

  if (!enabled) {
    return (
      <section className="max-w-lg rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
        {t('app.improve.experimentsDisabled')}
      </section>
    );
  }

  return (
    <section className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-semibold text-lg">{t('app.improve.experimentsTitle')}</h2>
        <p className="text-sm text-slate-600 mt-1">
          {t('app.improve.experimentsIntro')}
        </p>
      </div>

      {active && (
        <article className="rounded-2xl border border-slate-900 bg-slate-900 text-white p-5 space-y-3">
          <p className="text-xs uppercase tracking-widest text-slate-400">{t('app.improve.active')}</p>
          <h3 className="text-xl font-semibold">{active.title}</h3>
          <p className="text-sm text-slate-300">{active.dailyAction}</p>
          <p className="text-sm">
            {t('app.improve.compliance')}: {active.compliance?.completedDays ?? 0}/{active.durationDays} days (
            {active.compliance?.rate ?? 0}%)
          </p>
          {active.result?.summary && (
            <p className="text-sm text-indigo-200">{active.result.summary}</p>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => logToday(true)}
              className="rounded-lg bg-white text-slate-900 px-3 py-2 text-sm"
            >
              {t('app.improve.doneToday')}
            </button>
            <button
              type="button"
              onClick={() => logToday(false)}
              className="rounded-lg border border-white/40 px-3 py-2 text-sm"
            >
              {t('app.improve.missedToday')}
            </button>
            <button
              type="button"
              onClick={() => finish(false)}
              className="rounded-lg border border-emerald-300/50 text-emerald-100 px-3 py-2 text-sm"
            >
              {t('app.improve.completeCompare')}
            </button>
            <button
              type="button"
              onClick={() => finish(true)}
              className="rounded-lg border border-white/20 text-slate-300 px-3 py-2 text-sm"
            >
              {t('app.improve.stopEarly')}
            </button>
          </div>
        </article>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {catalog.map((exp) => (
          <article key={exp.id} className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col">
            <h3 className="font-medium text-slate-900">{exp.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{exp.durationDays} {t('app.improve.days')}</p>
            <p className="text-sm text-slate-600 mt-2 flex-1">{exp.goal}</p>
            <button
              type="button"
              disabled={Boolean(active)}
              onClick={() => start(exp.id)}
              className="mt-3 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm disabled:opacity-40"
            >
              {active ? t('app.improve.finishCurrentFirst') : t('app.improve.start')}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Toggle({ label, on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`w-full flex justify-between items-center rounded-xl border px-4 py-3 text-sm ${
        on ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
      }`}
    >
      <span>{label}</span>
      <span className="font-medium">{on ? 'Yes' : 'No'}</span>
    </button>
  );
}

export default ImprovePage;
