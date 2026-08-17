import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SleepLayout from '../../components/sleep/SleepLayout';
import {
  ScoreTrendChart,
  DurationBars,
  ComparisonBars
} from '../../components/sleep/charts/SleepCharts';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/axios';
import { useT } from '../../i18n/useT';

function ReportsPage() {
  const { isAuthenticated } = useAuth();
  const t = useT();
  const [report, setReport] = useState(null);
  const [nights, setNights] = useState([]);
  const [weeklyStory, setWeeklyStory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const { data } = await apiClient.get('/sleep/v1/report/weekly');
        setReport(data?.report);
        setNights(data?.nights || []);
        setWeeklyStory(data?.weeklyStory || data?.report?.summary?.weeklyStory || null);
      } catch (err) {
        setError(err.response?.data?.message || t('app.reports.unavailable'));
      }
    })();
  }, [isAuthenticated, t]);

  if (!isAuthenticated) {
    return (
      <SleepLayout title={t('app.reports.title')}>
        <Link to="/login" className="underline">{t('app.common.signInPrompt')}</Link>
      </SleepLayout>
    );
  }

  const s = report?.summary;
  const dataStory = weeklyStory;

  return (
    <SleepLayout
      title={t('app.reports.title')}
      subtitle={t('app.reports.subtitle')}
    >
      {error && <p className="text-sm text-rose-700">{error}</p>}

      {!s ? (
        <p className="text-sm text-slate-600">{t('app.common.loading')}</p>
      ) : (
        <div className="max-w-2xl space-y-5">
          {(s.weeklyStory || dataStory) && (
            <section className="rounded-3xl bg-slate-900 text-white p-6 shadow-lg">
              <p className="text-xs uppercase tracking-[0.2em] text-teal-200/80 mb-2">
                {(s.weeklyStory || dataStory).title || t('app.reports.weekStory')}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs text-slate-400">{t('app.reports.avgSleep')}</p>
                  <p className="text-2xl" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    {(s.weeklyStory || dataStory).stats?.avgSleepLabel ||
                      (s.avgSleepMinutes != null
                        ? `${Math.round((s.avgSleepMinutes / 60) * 10) / 10} h`
                        : '—')}
                  </p>
                  {(s.weeklyStory || dataStory).stats?.avgSleepDeltaMinutes != null && (
                    <p className="text-sm text-sky-200">
                      {(s.weeklyStory || dataStory).stats.avgSleepDeltaMinutes >= 0 ? '↑' : '↓'}{' '}
                      {Math.abs((s.weeklyStory || dataStory).stats.avgSleepDeltaMinutes)} min
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400">{t('app.reports.avgScore')}</p>
                  <p className="text-2xl" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    {(s.weeklyStory || dataStory).stats?.avgScore ?? s.avgScore ?? '—'}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm text-slate-200">
                <div>
                  <p className="text-xs uppercase tracking-wide text-teal-200/70">{t('app.reports.whatChanged')}</p>
                  <p className="mt-1">{(s.weeklyStory || dataStory).whatChanged}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-teal-200/70">{t('app.reports.nextWeek')}</p>
                  <p className="mt-1">{(s.weeklyStory || dataStory).nextWeek || s.nextWeekRecommendation}</p>
                </div>
              </div>
            </section>
          )}

          <p
            className="text-xl text-slate-800 leading-relaxed"
            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
          >
            {s.narrative}
          </p>

          {nights.length > 1 && (
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-3">{t('app.reports.weekScores')}</h2>
              <ScoreTrendChart nights={nights} height={150} emptyLabel={t('app.sleepHistory.empty')} />
            </section>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Tile
              label={t('app.reports.avgSleep')}
              value={s.avgSleepMinutes != null ? `${Math.round((s.avgSleepMinutes / 60) * 10) / 10} h` : '—'}
            />
            <Tile label={t('app.reports.avgScore')} value={s.avgScore ?? '—'} />
            <Tile label={t('app.reports.interruptions')} value={s.interruptionsAvg ?? '—'} />
            <Tile
              label={t('app.reports.nightPulse')}
              value={s.nightHrAvg != null ? `${s.nightHrAvg} bpm` : '—'}
            />
          </div>

          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-3">{t('app.reports.scoreSpread')}</h2>
            <ComparisonBars
              items={[
                { label: t('app.reports.bestNight'), value: s.bestNight?.score, color: '#0f766e' },
                { label: t('app.reports.avgScore'), value: s.avgScore, color: '#0369a1' },
                { label: t('app.reports.worstNight'), value: s.worstNight?.score, color: '#d97706' }
              ]}
            />
            <div className="mt-4 text-sm text-slate-600 space-y-1">
              <p>
                {t('app.reports.bestNight')}: <strong>{s.bestNight?.dateKey || '—'}</strong> (
                {s.bestNight?.score ?? '—'})
              </p>
              <p>
                {t('app.reports.worstNight')}: <strong>{s.worstNight?.dateKey || '—'}</strong> (
                {s.worstNight?.score ?? '—'})
              </p>
            </div>
          </section>

          {nights.length > 0 && (
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-3">{t('app.reports.durationWeek')}</h2>
              <DurationBars nights={nights} emptyLabel={t('app.sleepHistory.empty')} />
            </section>
          )}

          <div className="rounded-3xl bg-teal-50 border border-teal-100 p-5">
            <p className="text-sm font-medium text-teal-950">{t('app.reports.nextWeek')}</p>
            <p className="text-teal-900 mt-1">{s.nextWeekRecommendation}</p>
          </div>

          <p className="text-xs text-slate-400">
            algorithm {report.algorithmVersion} · {t('app.reports.baselineNote')}
          </p>
        </div>
      )}
    </SleepLayout>
  );
}

function Tile({ label, value }) {
  return (
    <div className="sleep-chart-fade rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className="text-xl font-semibold mt-1 tabular-nums text-slate-900"
        style={{ fontFamily: 'Fraunces, Georgia, serif' }}
      >
        {value}
      </p>
    </div>
  );
}

export default ReportsPage;
