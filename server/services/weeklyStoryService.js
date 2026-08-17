/**
 * Weekly Story — storytelling layer on top of weekly report numbers.
 * Association language only.
 */

function buildWeeklyStory({
  locale = 'en',
  summary = {},
  contexts = [],
  insights = []
} = {}) {
  const es = locale === 'es';
  const avgSleep = summary.avgSleepMinutes;
  const avgScore = summary.avgScore;
  const delta = summary.sleepDeltaMinutes ?? null;

  const formatH = (min) => {
    if (typeof min !== 'number') return null;
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return `${h}h ${String(m).padStart(2, '0')}m`;
  };

  // Screen trend from contexts
  const phoneCtx = (contexts || []).filter((c) => c?.phone?.screenMinutesLast120m != null);
  let screenTrend = null;
  if (phoneCtx.length >= 4) {
    const mid = Math.floor(phoneCtx.length / 2);
    const recent = phoneCtx.slice(0, mid);
    const older = phoneCtx.slice(mid);
    const avg = (arr) =>
      arr.reduce((a, c) => a + (c.phone.screenMinutesLast120m || 0), 0) / (arr.length || 1);
    const r = avg(recent);
    const o = avg(older);
    if (o > 0) {
      const pct = Math.round(((r - o) / o) * 100);
      if (Math.abs(pct) >= 10) screenTrend = pct;
    }
  }

  const whatChanged =
    (insights && insights[0] && (insights[0].observation || insights[0].body)) ||
    summary.associations?.[0] ||
    (es
      ? 'Seguimos reuniendo noches suficientes para destacar un cambio claro.'
      : "We're still gathering enough nights to highlight a clear change.");

  const nextWeek =
    summary.nextWeekRecommendation ||
    (es
      ? 'Mantén una sola acción simple esta semana — preferiblemente tu Tonight’s Move.'
      : "Keep one simple action this week — preferably your Tonight's Move.");

  return {
    title: es ? 'Tu semana de sueño' : 'Your Week in Sleep',
    stats: {
      avgSleepLabel: formatH(avgSleep),
      avgSleepDeltaMinutes: delta,
      avgScore,
      scoreDelta: summary.scoreDelta ?? null,
      bedtimeConsistency: summary.regularityLabel || null,
      lateScreenTrendPct: screenTrend
    },
    whatChanged,
    nextWeek,
    narrative: summary.narrative || null
  };
}

module.exports = { buildWeeklyStory };
