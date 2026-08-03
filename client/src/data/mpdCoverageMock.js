export const MPD_CONTROLS = [
  { id: 'canal_denuncias', label: 'Canal de denuncias', module: 'Eticpro' },
  { id: 'dd_terceros', label: 'Due diligence terceros', module: 'Eticpro' },
  { id: 'conflictos', label: 'Declaración de conflictos', module: 'Eticpro' },
  { id: 'capacitacion', label: 'Capacitación MPD', module: 'Eticpro' },
  { id: 'regalos', label: 'Matriz de regalos e invitaciones', module: 'Eticpro' },
  { id: 'aprobaciones', label: 'Aprobaciones de contratos', module: 'Eticpro' },
  { id: 'monitoreo', label: 'Monitoreo continuo', module: 'Eticpro' },
  { id: 'oficial_cumplimiento', label: 'Oficial de cumplimiento', module: 'Eticpro' }
];

export const COVERAGE_LEVELS = {
  alto: { label: 'Alto', color: '#22C55E', factor: 1.0, bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/40' },
  medio: { label: 'Medio', color: '#EAB308', factor: 0.6, bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40' },
  bajo: { label: 'Bajo', color: '#F97316', factor: 0.3, bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40' },
  sin: { label: 'Sin cobertura', color: '#EF4444', factor: 0, bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40' }
};

export const CRITICALITY_WEIGHTS = {
  critica: 5,
  alta: 4,
  media: 3,
  baja: 2
};

/** Delitos aplicables con criticidad, cobertura y mapeo a controles Eticpro */
export const APPLICABLE_CRIMES = [
  {
    id: 'cohecho',
    name: 'Cohecho a funcionario público',
    article: 'Art. 250 CP',
    criticality: 'critica',
    coverage: 'medio',
    controls: ['canal_denuncias', 'dd_terceros', 'capacitacion'],
    controlMatrix: { canal_denuncias: 'alto', dd_terceros: 'medio', conflictos: 'bajo', capacitacion: 'alto', regalos: 'medio', aprobaciones: 'sin', monitoreo: 'bajo', oficial_cumplimiento: 'alto' },
    evidence: 'Canal activo · DD parcial en proveedores críticos',
    gap: null,
    topRank: 2
  },
  {
    id: 'lavado',
    name: 'Lavado de activos',
    article: 'Art. 27 Ley 19.913',
    criticality: 'critica',
    coverage: 'alto',
    controls: ['dd_terceros', 'monitoreo', 'aprobaciones', 'oficial_cumplimiento'],
    controlMatrix: { canal_denuncias: 'medio', dd_terceros: 'alto', conflictos: 'medio', capacitacion: 'alto', regalos: 'medio', aprobaciones: 'alto', monitoreo: 'alto', oficial_cumplimiento: 'alto' },
    evidence: 'DD completa · Monitoreo mensual · Evidencia trazable',
    gap: null,
    topRank: 1
  },
  {
    id: 'colusion',
    name: 'Colusión en licitaciones',
    article: 'Art. 287 bis CP',
    criticality: 'critica',
    coverage: 'bajo',
    controls: ['aprobaciones', 'capacitacion'],
    controlMatrix: { canal_denuncias: 'medio', dd_terceros: 'bajo', conflictos: 'bajo', capacitacion: 'medio', regalos: 'sin', aprobaciones: 'bajo', monitoreo: 'sin', oficial_cumplimiento: 'medio' },
    evidence: 'Aprobaciones sin trazabilidad completa en licitaciones',
    gap: { type: 'brecha', title: 'Brecha: colusión en procesos de compra', action: 'Plan de acción 90 días' },
    topRank: 3
  },
  {
    id: 'fraude_fisco',
    name: 'Fraude al Fisco',
    article: 'Art. 97 N°4 CT',
    criticality: 'alta',
    coverage: 'medio',
    controls: ['monitoreo', 'oficial_cumplimiento', 'capacitacion'],
    controlMatrix: { canal_denuncias: 'medio', dd_terceros: 'medio', conflictos: 'medio', capacitacion: 'alto', regalos: 'bajo', aprobaciones: 'medio', monitoreo: 'medio', oficial_cumplimiento: 'alto' },
    evidence: 'Monitoreo trimestral · Capacitación al 92%',
    gap: null,
    topRank: 5
  },
  {
    id: 'receptacion',
    name: 'Receptación',
    article: 'Art. 456 bis A CP',
    criticality: 'alta',
    coverage: 'alto',
    controls: ['dd_terceros', 'canal_denuncias', 'monitoreo'],
    controlMatrix: { canal_denuncias: 'alto', dd_terceros: 'alto', conflictos: 'medio', capacitacion: 'alto', regalos: 'medio', aprobaciones: 'medio', monitoreo: 'alto', oficial_cumplimiento: 'alto' },
    evidence: 'DD proveedores · Alertas activas',
    gap: null,
    topRank: 7
  },
  {
    id: 'corrupcion_priv',
    name: 'Corrupción entre particulares',
    article: 'Art. 287 quater CP',
    criticality: 'alta',
    coverage: 'sin',
    controls: [],
    controlMatrix: { canal_denuncias: 'bajo', dd_terceros: 'sin', conflictos: 'sin', capacitacion: 'medio', regalos: 'sin', aprobaciones: 'sin', monitoreo: 'sin', oficial_cumplimiento: 'medio' },
    evidence: 'Sin controles específicos mapeados',
    gap: { type: 'brecha', title: 'Brecha crítica: corrupción entre particulares', action: 'Campaña MPD + control adicional' },
    topRank: 4
  },
  {
    id: 'administracion_desleal',
    name: 'Administración desleal',
    article: 'Art. 470 N°11 CP',
    criticality: 'media',
    coverage: 'medio',
    controls: ['aprobaciones', 'monitoreo', 'conflictos'],
    controlMatrix: { canal_denuncias: 'medio', dd_terceros: 'medio', conflictos: 'alto', capacitacion: 'medio', regalos: 'medio', aprobaciones: 'medio', monitoreo: 'medio', oficial_cumplimiento: 'alto' },
    evidence: 'Matriz de conflictos vigente',
    gap: null,
    topRank: 12
  },
  {
    id: 'falsificacion',
    name: 'Falsificación de instrumento público',
    article: 'Art. 193 CP',
    criticality: 'media',
    coverage: 'bajo',
    controls: ['capacitacion'],
    controlMatrix: { canal_denuncias: 'bajo', dd_terceros: 'sin', conflictos: 'sin', capacitacion: 'medio', regalos: 'sin', aprobaciones: 'bajo', monitoreo: 'sin', oficial_cumplimiento: 'medio' },
    evidence: 'Solo capacitación genérica',
    gap: { type: 'plan', title: 'Plan: reforzar controles documentales', action: 'Control adicional sugerido' },
    topRank: 18
  },
  {
    id: 'apremios',
    name: 'Apremios ilegítimos',
    article: 'Art. 263 CP',
    criticality: 'baja',
    coverage: 'alto',
    controls: ['canal_denuncias', 'capacitacion', 'oficial_cumplimiento'],
    controlMatrix: { canal_denuncias: 'alto', dd_terceros: 'medio', conflictos: 'medio', capacitacion: 'alto', regalos: 'medio', aprobaciones: 'medio', monitoreo: 'medio', oficial_cumplimiento: 'alto' },
    evidence: 'Canal y capacitaciones completas',
    gap: null,
    topRank: 22
  },
  {
    id: 'financiamiento_terrorismo',
    name: 'Financiamiento del terrorismo',
    article: 'Art. 8 Ley 18.314',
    criticality: 'critica',
    coverage: 'medio',
    controls: ['dd_terceros', 'monitoreo', 'oficial_cumplimiento'],
    controlMatrix: { canal_denuncias: 'medio', dd_terceros: 'medio', conflictos: 'bajo', capacitacion: 'alto', regalos: 'bajo', aprobaciones: 'medio', monitoreo: 'medio', oficial_cumplimiento: 'alto' },
    evidence: 'Listas restrictivas · DD en revisión',
    gap: null,
    topRank: 6
  }
];

export const AUTO_GAPS = [
  { id: 1, crime: 'Colusión en licitaciones', severity: 'critica', coverage: 'bajo', action: 'Plan de acción 90 días', status: 'Abierta', eticproLink: 'Due diligence terceros' },
  { id: 2, crime: 'Corrupción entre particulares', severity: 'critica', coverage: 'sin', action: 'Campaña MPD + control adicional', status: 'Abierta', eticproLink: 'Canal de denuncias' },
  { id: 3, crime: 'Falsificación de instrumento público', severity: 'media', coverage: 'bajo', action: 'Control adicional sugerido', status: 'En planificación', eticproLink: 'Aprobaciones de contratos' }
];

export function computeCoverageStats(crimes) {
  const total = crimes.length;
  const byLevel = { alto: 0, medio: 0, bajo: 0, sin: 0 };
  let weightedSum = 0;
  let weightTotal = 0;

  crimes.forEach((crime) => {
    byLevel[crime.coverage] += 1;
    const w = CRITICALITY_WEIGHTS[crime.criticality] || 1;
    const factor = COVERAGE_LEVELS[crime.coverage]?.factor ?? 0;
    weightedSum += w * factor;
    weightTotal += w;
  });

  const covered = byLevel.alto + byLevel.medio;
  const criticalCrimes = crimes.filter((c) => c.criticality === 'critica' || c.criticality === 'alta');
  const top10 = [...crimes].sort((a, b) => a.topRank - b.topRank).slice(0, 10);

  return {
    total,
    covered,
    coveredPct: total ? Math.round((covered / total) * 100) : 0,
    criticalMitigatedPct: weightTotal ? Math.round((weightedSum / weightTotal) * 100) : 0,
    byLevel,
    criticalCount: criticalCrimes.length,
    top10,
    gapsCount: crimes.filter((c) => c.gap).length
  };
}
