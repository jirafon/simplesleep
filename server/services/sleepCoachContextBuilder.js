/**
 * SleepCoachContextBuilder — minimal normalized payload for Ask SiempreSleep.
 * Never send full Mongo documents or raw phone package lists to an LLM.
 */

function pickBaseline(baselines = {}) {
  const p = baselines.primary || baselines.days14 || baselines.days7 || baselines || {};
  return {
    avgSleepMinutes: p.avgSleepMinutes ?? null,
    avgBedtimeMinutes: p.avgBedtimeMinutes ?? null,
    avgNightHr: p.avgNightHr ?? null,
    avgScreenToSleepMinutes: p.avgScreenToSleepMinutes ?? null,
    avgSteps: p.avgSteps ?? null,
    nightsUsed: p.nightsUsed ?? null
  };
}

function pickLastNight(night = {}, context = {}) {
  return {
    totalMinutes: night.totalMinutes ?? context?.sleep?.totalMinutes ?? null,
    deepMinutes: night.deep ?? context?.sleep?.deepMinutes ?? null,
    remMinutes: night.rem ?? context?.sleep?.remMinutes ?? null,
    awakeMinutes: night.awakeMinutes ?? context?.sleep?.awakeMinutes ?? null,
    wakingCount: night.wakingCount ?? context?.sleep?.wakingCount ?? null,
    bedtime: night.bedtimeClock ?? context?.sleep?.bedtime ?? null,
    sleepScore: context?.sleep?.sleepScore ?? null,
    screenToSleepMinutes: context?.phone?.screenToSleepMinutes ?? null,
    screenMinutesLast120m: context?.phone?.screenMinutesLast120m ?? null,
    nightUsageEvents: context?.phone?.nightUsageEvents ?? null,
    steps: context?.activity?.steps ?? null
  };
}

function pickTrend(nights = []) {
  const recent = nights.slice(0, 7);
  const totals = recent.map((n) => n.totalMinutes).filter((v) => typeof v === 'number');
  if (!totals.length) return { nights: 0, avgSleepMinutes: null };
  const avg = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
  return { nights: totals.length, avgSleepMinutes: avg };
}

function buildCoachContext({
  baselines = {},
  lastNight = {},
  nights = [],
  context = null,
  factors = [],
  experiments = [],
  insights = [],
  recommendation = null,
  morningBrief = null
} = {}) {
  return {
    baseline: pickBaseline(baselines),
    lastNight: pickLastNight(lastNight, context),
    recentTrend: pickTrend(nights),
    factors: (factors || []).slice(0, 6).map((f) => ({
      id: f.id,
      label: f.label,
      direction: f.direction,
      value: f.value,
      confidence: f.confidence
    })),
    experiments: (experiments || []).slice(0, 3).map((e) => ({
      id: e.experimentId || e.id,
      title: e.title,
      status: e.status,
      day: e.currentDay || e.day || null,
      resultSummary: e.result?.summary || e.resultSummary || null
    })),
    relevantInsights: (insights || []).slice(0, 4).map((i) => ({
      title: i.title,
      observation: i.observation || i.body,
      confidence: i.confidence,
      sampleSize: i.sampleSize
    })),
    tonightMove: recommendation
      ? {
          title: recommendation.title || recommendation.action,
          reason: recommendation.reason || recommendation.explanation,
          factor: recommendation.factor || recommendation.focusFactor
        }
      : null,
    morningBrief: morningBrief?.paragraphs || null
  };
}

const SYSTEM_PROMPT = `You are SiempreSleep, an AI sleep wellness coach.

You help the user understand personal sleep patterns.

You must:
- compare the user with their own baseline
- distinguish observation from causation
- avoid medical diagnosis
- avoid disease claims
- make advice simple and actionable
- acknowledge insufficient data
- prefer one practical action over many recommendations
- never invent phone content, messages, or private details
- use language like "associated with", "tends to", "may", "appears" — never "causes"

If the user asks about disease, medication changes, or clinical diagnosis, reply with a brief wellness boundary and suggest speaking with a qualified healthcare professional.`;

module.exports = {
  buildCoachContext,
  SYSTEM_PROMPT
};
