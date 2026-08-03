import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SleepLayout from '../../components/sleep/SleepLayout';
import { ScoreTrendChart, DurationBars } from '../../components/sleep/charts/SleepCharts';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/axios';
import { useT } from '../../i18n/useT';

function SleepHistoryPage() {
  const { isAuthenticated } = useAuth();
  const t = useT();
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await apiClient.get('/sleep/v1/history', { params: { limit: 30 } });
        if (!cancelled) {
          setRows(data?.nights || []);
          if (!(data?.nights || []).length) {
            setMessage(t('app.sleepHistory.empty'));
          }
        }
      } catch {
        if (!cancelled) setMessage(t('app.sleepHistory.unavailable'));
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated, t]);

  if (!isAuthenticated) {
    return (
      <SleepLayout title={t('app.sleepHistory.title')} subtitle={t('app.sleepHistory.signInSubtitle')}>
        <Link to="/login" className="underline">{t('app.common.signInPrompt')}</Link>
      </SleepLayout>
    );
  }

  const avgScore = (() => {
    const scores = rows.map((r) => r.sleepScore?.score).filter((v) => typeof v === 'number');
    if (!scores.length) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  })();

  return (
    <SleepLayout
      title={t('app.sleepHistory.title')}
      subtitle={t('app.sleepHistory.subtitle')}
    >
      {message && <p className="mb-4 text-sm text-slate-600">{message}</p>}

      {rows.length > 0 && (
        <div className="space-y-6 max-w-3xl">
          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">{t('app.sleepHistory.scoreTrend')}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{t('app.sleepHistory.scoreTrendHint')}</p>
              </div>
              {avgScore != null && (
                <p className="text-sm text-slate-600">
                  {t('app.sleepHistory.avgScore')}{' '}
                  <span
                    className="text-lg font-semibold text-teal-800 tabular-nums"
                    style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                  >
                    {avgScore}
                  </span>
                </p>
              )}
            </div>
            <ScoreTrendChart nights={rows} emptyLabel={t('app.sleepHistory.empty')} />
          </section>

          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-1">{t('app.sleepHistory.durationTrend')}</h2>
            <p className="text-xs text-slate-500 mb-3">{t('app.sleepHistory.durationHint')}</p>
            <DurationBars nights={rows} emptyLabel={t('app.sleepHistory.empty')} />
          </section>

          <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/80 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">{t('app.sleepHistory.colDate')}</th>
                  <th className="px-4 py-3 font-medium">{t('app.sleepHistory.colScore')}</th>
                  <th className="px-4 py-3 font-medium">{t('app.sleepHistory.colTotal')}</th>
                  <th className="px-4 py-3 font-medium">{t('app.sleepHistory.colWakes')}</th>
                  <th className="px-4 py-3 font-medium">{t('app.sleepHistory.colFeeling')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.dateKey || row.timestamp} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      {row.dateKey || (row.timestamp ? new Date(row.timestamp).toLocaleDateString() : '—')}
                    </td>
                    <td className="px-4 py-3 font-semibold tabular-nums text-teal-900">
                      {row.sleepScore?.score ?? '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{formatMin(row.totalMinutes)}</td>
                    <td className="px-4 py-3">{row.wakingCount ?? '—'}</td>
                    <td className="px-4 py-3 capitalize">{row.morningFeeling || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SleepLayout>
  );
}

function formatMin(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const h = Math.floor(value / 60);
  const m = Math.round(value % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default SleepHistoryPage;
