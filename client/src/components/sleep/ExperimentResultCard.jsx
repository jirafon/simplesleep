import React from 'react';
import { useT } from '../../i18n/useT';

/** Personal experiment result — association language, never absolute causation. */
export default function ExperimentResultCard({ result, title, compliance }) {
  const t = useT();
  if (!result) return null;

  const delta = (v, suffix = 'min') => {
    if (typeof v !== 'number') return null;
    const sign = v > 0 ? '+' : '';
    return `${sign}${Math.round(v)} ${suffix}`;
  };

  const sleep = delta(result.sleepDeltaMinutes, 'min');
  const score = delta(result.scoreDelta, '');
  const interrupt =
    typeof result.interruptionDeltaPct === 'number'
      ? `${result.interruptionDeltaPct > 0 ? '+' : ''}${Math.round(result.interruptionDeltaPct)}%`
      : null;

  return (
    <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white p-4">
      {title && (
        <p className="text-xs uppercase tracking-[0.16em] text-teal-800/70 mb-1">
          {t('app.coach.yourExperiment')}
        </p>
      )}
      {title && (
        <h3 className="text-lg text-slate-900 mb-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          {title}
        </h3>
      )}
      {(sleep || score || interrupt) && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {sleep && (
            <Metric label={t('app.coach.metricSleep')} value={sleep} positive={result.sleepDeltaMinutes >= 0} />
          )}
          {score && (
            <Metric label={t('app.coach.metricScore')} value={score} positive={result.scoreDelta >= 0} />
          )}
          {interrupt && (
            <Metric
              label={t('app.coach.metricInterrupt')}
              value={interrupt}
              positive={result.interruptionDeltaPct <= 0}
            />
          )}
        </div>
      )}
      <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
      <p className="mt-2 text-xs text-slate-500">
        {result.disclaimer || t('app.insights.associationNote')}
        {result.confidence ? ` · ${t('app.insights.confidence')} ${result.confidence}` : ''}
        {compliance?.rate != null ? ` · ${t('app.improve.compliance')} ${compliance.rate}%` : ''}
      </p>
    </div>
  );
}

function Metric({ label, value, positive }) {
  return (
    <div className="rounded-xl bg-white/80 border border-slate-100 p-2 text-center">
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={`text-sm font-semibold tabular-nums ${positive ? 'text-teal-800' : 'text-amber-700'}`}
      >
        {value}
      </p>
    </div>
  );
}
