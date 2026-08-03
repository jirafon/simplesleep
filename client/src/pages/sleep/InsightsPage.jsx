import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SleepLayout from '../../components/sleep/SleepLayout';
import { ScoreTrendChart, ComparisonBars, DurationBars } from '../../components/sleep/charts/SleepCharts';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/axios';
import { useT } from '../../i18n/useT';

function InsightsPage() {
  const { isAuthenticated } = useAuth();
  const t = useT();
  const [report, setReport] = useState(null);
  const [weekNights, setWeekNights] = useState([]);
  const [insights, setInsights] = useState([]);
  const [meta, setMeta] = useState(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const [r, i] = await Promise.all([
          apiClient.get('/sleep/v1/report/weekly'),
          apiClient.get('/sleep/v1/insights')
        ]);
        setReport(r.data?.report);
        setWeekNights(r.data?.nights || []);
        setEnabled(i.data?.enabled !== false);
        setInsights(i.data?.insights || []);
        setMeta(i.data?.meta || null);
      } catch {
        /* empty */
      }
    })();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <SleepLayout title={t('app.insights.title')}>
        <Link to="/login" className="underline">
          {t('app.common.signInPrompt')}
        </Link>
      </SleepLayout>
    );
  }

  const summary = report?.summary;
  const associations = summary?.associations || [];
  const comparison = [
    { label: t('app.reports.bestNight'), value: summary?.bestNight?.score, color: '#0f766e' },
    { label: t('app.reports.avgScore'), value: summary?.avgScore, color: '#0369a1' },
    { label: t('app.reports.worstNight'), value: summary?.worstNight?.score, color: '#d97706' }
  ];

  return (
    <SleepLayout title={t('app.insights.title')} subtitle={t('app.insights.subtitle')}>
      <div className="space-y-5 max-w-2xl">
        {weekNights.length > 1 && (
          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-1">{t('app.insights.weekTrend')}</h2>
            <p className="text-xs text-slate-500 mb-3">{t('app.insights.weekTrendHint')}</p>
            <ScoreTrendChart nights={weekNights} height={150} emptyLabel={t('app.sleepHistory.empty')} />
            <div className="mt-5">
              <ComparisonBars items={comparison} />
            </div>
          </section>
        )}

        {!enabled && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            {t('app.insights.engineOff')}
          </div>
        )}

        {enabled && insights.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
            {t('app.insights.needData')}
            {meta?.minNights ? ` (${meta.minNights}+)` : ''}
          </div>
        )}

        {insights.map((insight) => (
          <article
            key={insight.insightKey || insight.body}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            {insight.title && (
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">{insight.title}</p>
            )}
            <p className="text-slate-800 leading-relaxed">{insight.body}</p>
            <p className="text-xs text-slate-400 mt-2">
              {t('app.insights.associationNote')} · {t('app.insights.confidence')}{' '}
              {insight.confidence || 'low'}
            </p>
          </article>
        ))}

        {enabled &&
          insights.length === 0 &&
          associations.length > 0 &&
          associations.slice(0, 3).map((body) => (
            <article key={body} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-slate-800 leading-relaxed">{body}</p>
            </article>
          ))}

        {summary?.activeExperiment && (
          <article className="rounded-2xl border border-teal-100 bg-teal-50 p-5 text-sm text-teal-950">
            <p className="font-medium">{t('app.insights.activeExperiment')}</p>
            <p className="mt-1">{summary.activeExperiment.title}</p>
            {typeof summary.activeExperiment.compliance === 'number' && (
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-teal-800">
                  <span>{t('app.insights.compliance')}</span>
                  <span className="tabular-nums font-semibold">
                    {Math.round(summary.activeExperiment.compliance * 100)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-teal-100 overflow-hidden">
                  <div
                    className="sleep-bar-grow h-full rounded-full bg-teal-600"
                    style={{ width: `${Math.round(summary.activeExperiment.compliance * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {summary.activeExperiment.resultSummary && (
              <p className="mt-2 text-teal-800">{summary.activeExperiment.resultSummary}</p>
            )}
            <Link to="/improve?tab=experiments" className="inline-block mt-3 underline">
              {t('app.insights.openExperiments')}
            </Link>
          </article>
        )}

        {summary?.narrative && (
          <article className="rounded-3xl bg-slate-900 text-white p-5">
            <p className="text-sm text-teal-200/80 mb-2">{t('app.insights.thisWeek')}</p>
            <p style={{ fontFamily: 'Fraunces, Georgia, serif' }} className="text-lg leading-snug">
              {summary.narrative}
            </p>
            <p className="mt-3 text-sky-200 text-sm">{summary.nextWeekRecommendation}</p>
            {weekNights.length > 0 && (
              <div className="mt-4 rounded-2xl bg-white/5 p-3">
                <DurationBars nights={weekNights} height={110} emptyLabel={t('app.sleepHistory.empty')} />
              </div>
            )}
            <Link to="/reports" className="inline-block mt-4 text-sm underline text-white/80">
              {t('app.insights.fullReport')}
            </Link>
          </article>
        )}
      </div>
    </SleepLayout>
  );
}

export default InsightsPage;
