import React, { useMemo } from 'react';

/**
 * Horizontal Sleep Context Timeline — evening phone + sleep stages + night phone.
 * Teal/sky aesthetic. SVG custom (no heavy chart libs).
 */
export default function SleepContextTimeline({ timeline, emptyLabel = 'Not enough timeline data yet.' }) {
  const width = 640;
  const height = 160;
  const padX = 24;
  const padY = 28;
  const innerW = width - padX * 2;
  const span = timeline?.window?.spanMinutes || 18 * 60;

  const xFor = (offset) => {
    if (offset == null || !Number.isFinite(offset)) return null;
    return padX + (Math.max(0, Math.min(span, offset)) / span) * innerW;
  };

  const hours = useMemo(() => {
    // Labels from 18:00 across midnight to 12:00
    const labels = [];
    for (let h = 18; h <= 24; h += 2) {
      labels.push({ hour: h === 24 ? 0 : h, offset: (h - 18) * 60 });
    }
    for (let h = 2; h <= 12; h += 2) {
      labels.push({ hour: h, offset: (24 - 18) * 60 + h * 60 });
    }
    return labels;
  }, []);

  if (!timeline || (!timeline.bands?.length && !timeline.events?.length)) {
    return (
      <p className="text-sm text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-2xl">
        {emptyLabel}
      </p>
    );
  }

  const formatHour = (h) => {
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  };

  return (
    <div className="sleep-chart-fade w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[320px] h-auto"
        role="img"
        aria-label="Sleep context timeline"
      >
        {/* hour ticks */}
        {hours.map((h) => {
          const x = xFor(h.offset);
          return (
            <g key={`h-${h.hour}-${h.offset}`}>
              <line x1={x} y1={padY} x2={x} y2={height - 18} stroke="#e2e8f0" strokeWidth="1" />
              <text x={x} y={height - 4} textAnchor="middle" fill="#94a3b8" fontSize="10">
                {formatHour(h.hour)}
              </text>
            </g>
          );
        })}

        {/* bands */}
        {(timeline.bands || []).map((b, i) => {
          const x1 = xFor(b.startOffset);
          const x2 = xFor(b.endOffset);
          if (x1 == null || x2 == null || x2 <= x1) return null;
          const y = b.stage === 'screen' ? padY + 8 : padY + 36;
          const h = b.stage === 'screen' ? 10 : 18;
          return (
            <rect
              key={`band-${i}`}
              x={x1}
              y={y}
              width={Math.max(2, x2 - x1)}
              height={h}
              rx={4}
              fill={b.color || '#0f766e'}
              opacity={b.stage === 'screen' ? 0.55 : 0.85}
            >
              <title>{b.stage}</title>
            </rect>
          );
        })}

        {/* events */}
        {(timeline.events || []).map((ev, i) => {
          const x = xFor(ev.offsetMinutes);
          if (x == null) return null;
          const isPhone = ev.type === 'phone_down' || ev.type === 'night_phone';
          const color = isPhone ? '#0369a1' : ev.type === 'awake' ? '#d97706' : '#0f766e';
          const y = isPhone ? padY + 4 : padY + 52;
          return (
            <g key={ev.id || `ev-${i}`}>
              <line x1={x} y1={y} x2={x} y2={y + 28} stroke={color} strokeWidth="1.5" />
              <circle cx={x} cy={y} r={4} fill={color} />
              <text
                x={x}
                y={y - 6}
                textAnchor="middle"
                fill="#475569"
                fontSize="9"
                style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
              >
                {ev.label}
              </text>
            </g>
          );
        })}
      </svg>

      {timeline.phoneToSleepMinutes != null && (
        <p className="mt-2 text-center text-sm text-slate-600">
          Phone → Sleep:{' '}
          <span className="font-semibold text-teal-800">{timeline.phoneToSleepMinutes} min</span>
        </p>
      )}
    </div>
  );
}
