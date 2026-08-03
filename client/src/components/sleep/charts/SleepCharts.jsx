import React, { useId, useMemo } from 'react';

const scoreTone = (score) => {
  if (typeof score !== 'number') return { stroke: '#94a3b8', soft: '#e2e8f0', label: 'slate' };
  if (score >= 80) return { stroke: '#0f766e', soft: '#99f6e4', label: 'teal' };
  if (score >= 60) return { stroke: '#0369a1', soft: '#bae6fd', label: 'sky' };
  return { stroke: '#b45309', soft: '#fde68a', label: 'amber' };
};

/** Animated sleep score donut — hero visual for Today. */
export function SleepScoreRing({
  score,
  quality,
  label = 'Sleep Score',
  size = 200,
  strokeWidth = 14
}) {
  const uid = useId().replace(/:/g, '');
  const tone = scoreTone(score);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = typeof score === 'number' ? Math.max(0, Math.min(100, score)) : null;
  const offset =
    normalized === null ? circumference : circumference - (normalized / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="sleep-chart-fade relative inline-flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        role="img"
        aria-label={`${label}: ${normalized ?? '—'}`}
      >
        <defs>
          <linearGradient id={`score-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tone.stroke} />
            <stop offset="100%" stopColor={tone.soft} />
          </linearGradient>
          <filter id={`score-glow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={`url(#score-grad-${uid})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          filter={`url(#score-glow-${uid})`}
          className="sleep-ring-draw"
          style={{ '--ring-circumference': circumference, '--ring-offset': offset }}
        />
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          className="fill-slate-900"
          style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: size * 0.22, fontWeight: 600 }}
        >
          {normalized === null ? '—' : Math.round(normalized)}
        </text>
        <text
          x={cx}
          y={cy + size * 0.12}
          textAnchor="middle"
          fill="#64748b"
          style={{ fontSize: size * 0.07, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          {quality || label}
        </text>
      </svg>
    </div>
  );
}

/** Stacked horizontal composition of sleep stages. */
export function SleepStagesBar({
  deep,
  light,
  rem,
  awake,
  labels = { deep: 'Deep', light: 'Light', rem: 'REM', awake: 'Awake' }
}) {
  const parts = useMemo(() => {
    const raw = [
      { key: 'deep', value: toMinutes(deep), color: '#0f766e', label: labels.deep },
      { key: 'light', value: toMinutes(light), color: '#38bdf8', label: labels.light },
      { key: 'rem', value: toMinutes(rem), color: '#0369a1', label: labels.rem },
      { key: 'awake', value: toMinutes(awake), color: '#f59e0b', label: labels.awake }
    ].filter((p) => p.value > 0);
    const total = raw.reduce((s, p) => s + p.value, 0);
    return { parts: raw, total };
  }, [deep, light, rem, awake, labels]);

  if (!parts.total) return null;

  return (
    <div className="sleep-chart-fade space-y-3">
      <div className="flex h-3.5 overflow-hidden rounded-full bg-slate-100 shadow-inner">
        {parts.parts.map((p, i) => (
          <div
            key={p.key}
            className="sleep-bar-grow h-full first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${(p.value / parts.total) * 100}%`,
              backgroundColor: p.color,
              animationDelay: `${i * 80}ms`
            }}
            title={`${p.label}: ${formatMin(p.value)}`}
          />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {parts.parts.map((p) => (
          <li key={p.key} className="flex items-center gap-2 text-xs text-slate-600">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="font-medium text-slate-800">{p.label}</span>
            <span className="tabular-nums text-slate-500">{formatMin(p.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Area + dots trend for nightly scores. */
export function ScoreTrendChart({
  nights = [],
  height = 160,
  emptyLabel = 'No nights yet'
}) {
  const uid = useId().replace(/:/g, '');
  const series = useMemo(() => {
    const chronological = [...nights]
      .map((n) => ({
        dateKey: n.dateKey || (n.timestamp ? new Date(n.timestamp).toISOString().slice(0, 10) : null),
        score: typeof n.sleepScore?.score === 'number' ? n.sleepScore.score : typeof n.score === 'number' ? n.score : null,
        minutes: typeof n.totalMinutes === 'number' ? n.totalMinutes : null
      }))
      .filter((n) => n.score != null)
      .reverse();
    return chronological;
  }, [nights]);

  if (series.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  const pad = { top: 16, right: 12, bottom: 28, left: 28 };
  const width = 560;
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const minY = Math.max(0, Math.min(...series.map((s) => s.score)) - 8);
  const maxY = Math.min(100, Math.max(...series.map((s) => s.score)) + 8);
  const rangeY = Math.max(1, maxY - minY);

  const points = series.map((s, i) => {
    const x = pad.left + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
    const y = pad.top + innerH - ((s.score - minY) / rangeY) * innerH;
    return { ...s, x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${pad.top + innerH} L ${points[0].x} ${pad.top + innerH} Z`;
  const latest = points[points.length - 1];

  return (
    <div className="sleep-chart-fade w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Sleep score trend">
        <defs>
          <linearGradient id={`trend-fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f766e" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id={`trend-stroke-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => {
          const y = pad.top + innerH * t;
          return (
            <line
              key={t}
              x1={pad.left}
              x2={width - pad.right}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="4 6"
            />
          );
        })}
        <path d={areaPath} fill={`url(#trend-fill-${uid})`} className="sleep-area-in" />
        <path
          d={linePath}
          fill="none"
          stroke={`url(#trend-stroke-${uid})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="sleep-line-draw"
        />
        {points.map((p) => (
          <circle key={p.dateKey || p.x} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#0f766e" strokeWidth="2" />
        ))}
        <circle cx={latest.x} cy={latest.y} r="6" fill="#0f766e" className="sleep-pulse-dot" />
        <text x={pad.left} y={height - 8} fill="#94a3b8" fontSize="11">
          {points[0].dateKey?.slice(5) || ''}
        </text>
        <text x={width - pad.right} y={height - 8} fill="#94a3b8" fontSize="11" textAnchor="end">
          {latest.dateKey?.slice(5) || ''}
        </text>
        <text x={pad.left - 6} y={pad.top + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
          {Math.round(maxY)}
        </text>
        <text x={pad.left - 6} y={pad.top + innerH} fill="#94a3b8" fontSize="10" textAnchor="end">
          {Math.round(minY)}
        </text>
      </svg>
    </div>
  );
}

/** Vertical bars for duration (hours) across nights. */
export function DurationBars({
  nights = [],
  height = 140,
  goalMinutes = 480,
  emptyLabel = 'No nights yet'
}) {
  const series = useMemo(() => {
    return [...nights]
      .map((n) => ({
        dateKey: n.dateKey || (n.timestamp ? new Date(n.timestamp).toISOString().slice(0, 10) : null),
        minutes: typeof n.totalMinutes === 'number' ? n.totalMinutes : null
      }))
      .filter((n) => n.minutes != null)
      .reverse()
      .slice(-14);
  }, [nights]);

  if (!series.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  const maxMin = Math.max(goalMinutes, ...series.map((s) => s.minutes), 1);
  const width = Math.max(280, series.length * 28);
  const pad = { top: 12, right: 8, bottom: 24, left: 8 };
  const innerH = height - pad.top - pad.bottom;
  const barW = Math.min(18, (width - pad.left - pad.right) / series.length - 4);
  const goalY = pad.top + innerH - (goalMinutes / maxMin) * innerH;

  return (
    <div className="sleep-chart-fade w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto min-w-full" role="img" aria-label="Sleep duration">
        <line
          x1={pad.left}
          x2={width - pad.right}
          y1={goalY}
          y2={goalY}
          stroke="#94a3b8"
          strokeDasharray="3 5"
          strokeWidth="1"
        />
        {series.map((s, i) => {
          const x = pad.left + i * ((width - pad.left - pad.right) / series.length) + 2;
          const h = (s.minutes / maxMin) * innerH;
          const y = pad.top + innerH - h;
          const good = s.minutes >= goalMinutes * 0.9;
          return (
            <g key={s.dateKey || i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx="6"
                fill={good ? '#0f766e' : '#7dd3fc'}
                className="sleep-bar-grow"
                style={{ animationDelay: `${i * 40}ms`, transformOrigin: `${x + barW / 2}px ${pad.top + innerH}px` }}
              >
                <title>{`${s.dateKey}: ${formatMin(s.minutes)}`}</title>
              </rect>
              {(i === 0 || i === series.length - 1 || i % 3 === 0) && (
                <text x={x + barW / 2} y={height - 6} textAnchor="middle" fill="#94a3b8" fontSize="9">
                  {s.dateKey?.slice(8) || ''}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Horizontal impact bars for score factors. */
export function FactorImpactChart({ factors = [], title }) {
  const items = (factors || []).slice(0, 6);
  if (!items.length) return null;
  const maxAbs = Math.max(1, ...items.map((f) => Math.abs(f.impact || 0)));

  return (
    <div className="sleep-chart-fade space-y-3">
      {title && <h2 className="font-semibold text-slate-900">{title}</h2>}
      <ul className="space-y-3">
        {items.map((f, i) => {
          const impact = Number(f.impact) || 0;
          const pct = (Math.abs(impact) / maxAbs) * 50;
          const positive = impact > 0;
          const neutral = impact === 0;
          return (
            <li key={f.id || f.label} className="text-sm">
              <div className="mb-1 flex justify-between gap-2">
                <span className="font-medium text-slate-800">{f.label}</span>
                <span
                  className={`tabular-nums font-semibold ${
                    neutral ? 'text-slate-400' : positive ? 'text-teal-700' : 'text-amber-700'
                  }`}
                >
                  {impact > 0 ? `+${impact}` : impact}
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-slate-100">
                <div className="absolute left-1/2 top-0 h-full w-px bg-slate-300" />
                <div
                  className={`sleep-bar-grow absolute top-0 h-full rounded-full ${
                    neutral ? 'bg-slate-300' : positive ? 'bg-teal-600' : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${Math.max(neutral ? 2 : 6, pct)}%`,
                    left: positive || neutral ? '50%' : `calc(50% - ${Math.max(6, pct)}%)`,
                    animationDelay: `${i * 60}ms`
                  }}
                />
              </div>
              {f.detail && <p className="mt-1 text-xs text-slate-500">{f.detail}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Compact comparison bars (e.g. best vs average vs toughest). */
export function ComparisonBars({ items = [] }) {
  const valid = items.filter((i) => typeof i.value === 'number');
  if (!valid.length) return null;
  const max = Math.max(...valid.map((i) => i.value), 1);

  return (
    <div className="sleep-chart-fade space-y-2.5">
      {valid.map((item, i) => (
        <div key={item.label} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-2 text-sm">
          <span className="truncate text-slate-600">{item.label}</span>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="sleep-bar-grow h-full rounded-full"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || '#0f766e',
                animationDelay: `${i * 70}ms`
              }}
            />
          </div>
          <span className="tabular-nums text-right font-semibold text-slate-800">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function toMinutes(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 0;
  // Band sometimes sends seconds for stages
  if (value > 24 * 60) return Math.round(value / 60);
  return Math.round(value);
}

function formatMin(minutes) {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes)) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
