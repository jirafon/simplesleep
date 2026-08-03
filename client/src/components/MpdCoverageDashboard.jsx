import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  APPLICABLE_CRIMES,
  AUTO_GAPS,
  COVERAGE_LEVELS,
  CRITICALITY_WEIGHTS,
  MPD_CONTROLS,
  computeCoverageStats
} from '../data/mpdCoverageMock';

const CRITICALITY_LABELS = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja'
};

const CRITICALITY_STYLES = {
  critica: 'bg-red-500/20 text-red-300 border-red-500/30',
  alta: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  media: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  baja: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
};

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'heatmap', label: 'Delito × Control' },
  { id: 'tabla', label: 'Por delito' },
  { id: 'acciones', label: 'Brechas y planes' }
];

function CoverageBadge({ level }) {
  const cfg = COVERAGE_LEVELS[level] || COVERAGE_LEVELS.sin;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

function CriticalityBadge({ level }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${CRITICALITY_STYLES[level]}`}>
      {CRITICALITY_LABELS[level]}
    </span>
  );
}

function HeatmapCell({ level, crimeName, controlLabel, onClick }) {
  const cfg = COVERAGE_LEVELS[level] || COVERAGE_LEVELS.sin;
  return (
    <button
      type="button"
      title={`${crimeName} · ${controlLabel}: ${cfg.label}`}
      onClick={onClick}
      className="w-full aspect-square rounded-sm border border-white/5 hover:ring-2 hover:ring-blue-400/50 transition-all"
      style={{ backgroundColor: `${cfg.color}33` }}
    >
      <span className="sr-only">{cfg.label}</span>
    </button>
  );
}

function TopCoverageChart({ crimes, limit = 10 }) {
  const items = [...crimes].sort((a, b) => a.topRank - b.topRank).slice(0, limit);
  const counts = { alto: 0, medio: 0, bajo: 0, sin: 0 };
  items.forEach((c) => { counts[c.coverage] += 1; });
  const total = items.length || 1;

  return (
    <div className="space-y-3">
      <div className="flex h-8 rounded-lg overflow-hidden border border-white/10">
        {Object.entries(counts).map(([level, count]) => (
          count > 0 && (
            <div
              key={level}
              className="h-full transition-all"
              style={{ width: `${(count / total) * 100}%`, backgroundColor: COVERAGE_LEVELS[level].color }}
              title={`${COVERAGE_LEVELS[level].label}: ${count}`}
            />
          )
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
        {Object.entries(counts).filter(([, c]) => c > 0).map(([level, count]) => (
          <span key={level} className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COVERAGE_LEVELS[level].color }} />
            {COVERAGE_LEVELS[level].label}: {count}
          </span>
        ))}
      </div>
    </div>
  );
}

function GaugeCard({ pct, label }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1f2937" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-black text-white">{pct}%</span>
      </div>
      <p className="text-sm text-gray-400 text-center mt-2 max-w-[160px]">{label}</p>
    </div>
  );
}

const MpdCoverageDashboard = ({ embedded = false }) => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [filterCriticality, setFilterCriticality] = useState('all');
  const [filterCoverage, setFilterCoverage] = useState('all');
  const [topLimit, setTopLimit] = useState(10);
  const [selectedCrime, setSelectedCrime] = useState(null);

  const filteredCrimes = useMemo(() => {
    return APPLICABLE_CRIMES.filter((crime) => {
      if (filterCriticality !== 'all' && crime.criticality !== filterCriticality) return false;
      if (filterCoverage !== 'all' && crime.coverage !== filterCoverage) return false;
      return true;
    });
  }, [filterCriticality, filterCoverage]);

  const stats = useMemo(() => computeCoverageStats(APPLICABLE_CRIMES), []);

  const selected = selectedCrime
    ? APPLICABLE_CRIMES.find((c) => c.id === selectedCrime)
    : null;

  return (
    <div className={`${embedded ? '' : 'min-h-screen bg-gray-950'} text-gray-100`}>
      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                  Mock interactivo
                </span>
                <span className="text-xs text-gray-500">SmartRisk × Eticpro MPD</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white">
                Cobertura MPD por Delito y Control
              </h1>
              <p className="text-sm text-gray-400 mt-1 max-w-2xl">
                Cruce de delitos aplicables, criticidad de la matriz de riesgos y controles prediseñados Eticpro.
              </p>
            </div>
            {!embedded && (
              <Link
                to="/smartrisk"
                className="text-sm text-blue-400 hover:text-blue-300 whitespace-nowrap"
              >
                ← Volver a SmartRisk
              </Link>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Filtros globales */}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filterCriticality}
            onChange={(e) => setFilterCriticality(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200"
          >
            <option value="all">Todas las criticidades</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
          <select
            value={filterCoverage}
            onChange={(e) => setFilterCoverage(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200"
          >
            <option value="all">Toda la cobertura</option>
            <option value="alto">Alto</option>
            <option value="medio">Medio</option>
            <option value="bajo">Bajo</option>
            <option value="sin">Sin cobertura</option>
          </select>
          <span className="text-xs text-gray-500 ml-auto">
            {filteredCrimes.length} delitos · Datos demo Ley 21.595
          </span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Delitos aplicables', value: stats.total, sub: 'Catálogo activo' },
            { label: 'Con cobertura', value: `${stats.covered}/${stats.total}`, sub: `${stats.coveredPct}% alto o medio` },
            { label: 'Riesgo crítico mitigado', value: `${stats.criticalMitigatedPct}%`, sub: 'Ponderado por matriz', highlight: true },
            { label: 'Brechas abiertas', value: stats.gapsCount, sub: 'Auto-generadas', alert: stats.gapsCount > 0 },
            { label: 'Controles Eticpro', value: MPD_CONTROLS.length, sub: 'Prediseñados MPD' }
          ].map((kpi) => (
            <div
              key={kpi.label}
              className={`rounded-xl border p-4 ${
                kpi.alert ? 'bg-red-500/10 border-red-500/30' : kpi.highlight ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'
              }`}
            >
              <p className="text-xs text-gray-400">{kpi.label}</p>
              <p className={`text-2xl font-black mt-1 ${kpi.highlight ? 'text-blue-300' : kpi.alert ? 'text-red-300' : 'text-white'}`}>
                {kpi.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {activeTab === 'resumen' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center relative">
              <GaugeCard pct={stats.criticalMitigatedPct} label="Riesgo penal crítico mitigado por controles trazables" />
            </div>

            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Top delitos críticos</h2>
                <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
                  {[10, 25].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTopLimit(n)}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${topLimit === n ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                    >
                      Top {n}
                    </button>
                  ))}
                </div>
              </div>
              <TopCoverageChart crimes={APPLICABLE_CRIMES} limit={topLimit} />
              <ul className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {[...APPLICABLE_CRIMES].sort((a, b) => a.topRank - b.topRank).slice(0, topLimit).map((crime) => (
                  <li key={crime.id} className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-gray-300 truncate flex-1">
                      <span className="text-gray-500 mr-2">#{crime.topRank}</span>
                      {crime.name}
                    </span>
                    <CriticalityBadge level={crime.criticality} />
                    <CoverageBadge level={crime.coverage} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3 grid sm:grid-cols-4 gap-3">
              {Object.entries(COVERAGE_LEVELS).map(([key, cfg]) => (
                <div key={key} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
                  <p className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</p>
                  <p className="text-3xl font-black text-white mt-1">{stats.byLevel[key]}</p>
                  <p className="text-xs text-gray-400 mt-1">delitos</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 overflow-x-auto">
            <h2 className="text-lg font-bold text-white mb-4">Mapa de calor: Delito × Control Eticpro</h2>
            <div className="min-w-[720px]">
              <div className="grid gap-1" style={{ gridTemplateColumns: `180px repeat(${MPD_CONTROLS.length}, minmax(48px, 1fr))` }}>
                <div />
                {MPD_CONTROLS.map((ctrl) => (
                  <div key={ctrl.id} className="text-[10px] text-gray-400 text-center px-0.5 leading-tight pb-2" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 100 }}>
                    {ctrl.label}
                  </div>
                ))}
                {filteredCrimes.map((crime) => (
                  <React.Fragment key={crime.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedCrime(crime.id)}
                      className="text-left text-xs text-gray-300 pr-2 py-2 hover:text-white truncate"
                      title={crime.name}
                    >
                      {crime.name}
                    </button>
                    {MPD_CONTROLS.map((ctrl) => (
                      <HeatmapCell
                        key={`${crime.id}-${ctrl.id}`}
                        level={crime.controlMatrix[ctrl.id] || 'sin'}
                        crimeName={crime.name}
                        controlLabel={ctrl.label}
                        onClick={() => setSelectedCrime(crime.id)}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10 text-xs">
              {Object.entries(COVERAGE_LEVELS).map(([key, cfg]) => (
                <span key={key} className="inline-flex items-center gap-2 text-gray-400">
                  <span className="w-4 h-4 rounded" style={{ backgroundColor: `${cfg.color}55` }} />
                  {cfg.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tabla' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-gray-400">
                    <th className="px-4 py-3 font-medium">Delito</th>
                    <th className="px-4 py-3 font-medium">Criticidad</th>
                    <th className="px-4 py-3 font-medium">Cobertura</th>
                    <th className="px-4 py-3 font-medium">Controles Eticpro</th>
                    <th className="px-4 py-3 font-medium">Evidencia</th>
                    <th className="px-4 py-3 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCrimes.map((crime) => (
                    <tr
                      key={crime.id}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                      onClick={() => setSelectedCrime(crime.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{crime.name}</p>
                        <p className="text-xs text-gray-500">{crime.article}</p>
                      </td>
                      <td className="px-4 py-3"><CriticalityBadge level={crime.criticality} /></td>
                      <td className="px-4 py-3"><CoverageBadge level={crime.coverage} /></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {crime.controls.length === 0 ? (
                            <span className="text-red-400 text-xs">Ninguno</span>
                          ) : (
                            crime.controls.map((cid) => {
                              const ctrl = MPD_CONTROLS.find((c) => c.id === cid);
                              return ctrl ? (
                                <span key={cid} className="text-xs bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded">
                                  {ctrl.label}
                                </span>
                              ) : null;
                            })
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px]">{crime.evidence}</td>
                      <td className="px-4 py-3">
                        {crime.gap ? (
                          <span className="text-xs text-orange-300">{crime.gap.action}</span>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'acciones' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Brechas auto-generadas</h2>
              <div className="space-y-3">
                {AUTO_GAPS.map((gap) => (
                  <div key={gap.id} className="border border-orange-500/30 bg-orange-500/5 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white">{gap.crime}</p>
                        <p className="text-sm text-orange-200 mt-1">{gap.action}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Eticpro: {gap.eticproLink} · Criticidad {gap.severity}
                        </p>
                      </div>
                      <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full shrink-0">
                        {gap.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="mt-3 text-xs text-blue-400 hover:text-blue-300"
                    >
                      Abrir en Eticpro →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Reglas de automatización</h2>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-red-400 font-bold">1</span>
                  <span><strong className="text-white">Sin cobertura + criticidad crítica</strong> → crea brecha automática y notifica al oficial de cumplimiento.</span>
                </li>
                <li className="flex gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-orange-400 font-bold">2</span>
                  <span><strong className="text-white">Cobertura baja + top 25</strong> → genera plan de acción con plazo sugerido de 90 días.</span>
                </li>
                <li className="flex gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-yellow-400 font-bold">3</span>
                  <span><strong className="text-white">Patrón recurrente</strong> (ej. corrupción) → lanza campaña MPD y sugiere control adicional del catálogo Eticpro.</span>
                </li>
                <li className="flex gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-green-400 font-bold">4</span>
                  <span><strong className="text-white">Cobertura alta sostenida</strong> → cierra brecha y archiva evidencia en SmartRisk.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Panel lateral detalle delito */}
        {selected && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setSelectedCrime(null)} aria-label="Cerrar" />
            <aside className="relative w-full max-w-md bg-gray-900 border-l border-white/10 p-6 overflow-y-auto shadow-2xl">
              <button type="button" onClick={() => setSelectedCrime(null)} className="text-gray-400 hover:text-white text-sm mb-4">
                ✕ Cerrar
              </button>
              <h3 className="text-xl font-bold text-white">{selected.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{selected.article}</p>
              <div className="flex gap-2 mt-4">
                <CriticalityBadge level={selected.criticality} />
                <CoverageBadge level={selected.coverage} />
                <span className="text-xs text-gray-500 self-center">Peso matriz: {CRITICALITY_WEIGHTS[selected.criticality]}</span>
              </div>
              <p className="text-sm text-gray-400 mt-4">{selected.evidence}</p>

              <h4 className="text-sm font-semibold text-white mt-6 mb-3">Cobertura por control</h4>
              <div className="space-y-2">
                {MPD_CONTROLS.map((ctrl) => {
                  const level = selected.controlMatrix[ctrl.id] || 'sin';
                  const cfg = COVERAGE_LEVELS[level];
                  return (
                    <div key={ctrl.id} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-300">{ctrl.label}</span>
                      <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>

              {selected.gap && (
                <div className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                  <p className="text-sm font-semibold text-orange-200">{selected.gap.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{selected.gap.action}</p>
                  <button type="button" className="mt-3 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
                    Crear plan en Eticpro
                  </button>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default MpdCoverageDashboard;
