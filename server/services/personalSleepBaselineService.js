/**
 * Personal sleep baseline — YOU vs YOUR recent nights (7 / 14 / 28).
 * Extends sleepProfile.baseline without replacing sleep-score-v1.
 */

const { minutesFromClock, circularDiffMinutes } = require('./sleepScoreService');

const WINDOWS = [7, 14, 28];

const avg = (arr) => {
  const nums = (arr || []).filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

const confidenceFromCount = (n) => {
  if (n >= 28) return 'high';
  if (n >= 14) return 'medium';
  if (n >= 7) return 'low';
  return 'insufficient';
};

/**
 * @param {Array<object>} nights - newest first preferred
 * @param {Array<object>} [contexts] - SleepContext docs newest first
 */
function computeBaselines(nights = [], contexts = []) {
  const chronological = [...nights].reverse();
  const ctxByDate = Object.fromEntries(
    (contexts || []).map((c) => [c.dateKey, c])
  );

  const windows = {};
  WINDOWS.forEach((size) => {
    const slice = chronological.slice(-size);
    const bedtimes = slice
      .map((n) => minutesFromClock(n.bedtimeClock))
      .filter((v) => v != null);
    const totals = slice.map((n) => n.totalMinutes);
    const deep = slice.map((n) => n.deep);
    const rem = slice.map((n) => n.rem);
    const wakes = slice.map((n) => n.wakingCount);
    const hrs = slice.map((n) => n.nightHeartRate);
    const steps = slice.map((n) => {
      const ctx = ctxByDate[n.dateKey || (n.timestamp ? new Date(n.timestamp).toISOString().slice(0, 10) : null)];
      return ctx?.activity?.steps;
    });
    const screenToSleep = slice.map((n) => {
      const key = n.dateKey || (n.timestamp ? new Date(n.timestamp).toISOString().slice(0, 10) : null);
      return ctxByDate[key]?.phone?.screenToSleepMinutes;
    });
    const nightPhone = slice.map((n) => {
      const key = n.dateKey || (n.timestamp ? new Date(n.timestamp).toISOString().slice(0, 10) : null);
      return ctxByDate[key]?.phone?.nightUsageMinutes;
    });
    const screen120 = slice.map((n) => {
      const key = n.dateKey || (n.timestamp ? new Date(n.timestamp).toISOString().slice(0, 10) : null);
      return ctxByDate[key]?.phone?.screenMinutesLast120m;
    });

    windows[`d${size}`] = {
      nightsUsed: slice.length,
      confidence: confidenceFromCount(slice.length),
      avgBedtimeMinutes: avg(bedtimes) != null ? Math.round(avg(bedtimes)) : null,
      avgSleepMinutes: avg(totals) != null ? Math.round(avg(totals)) : null,
      avgDeepMinutes: avg(deep) != null ? Math.round(avg(deep)) : null,
      avgRemMinutes: avg(rem) != null ? Math.round(avg(rem)) : null,
      avgWakingCount: avg(wakes) != null ? Math.round(avg(wakes) * 10) / 10 : null,
      avgNightHr: avg(hrs) != null ? Math.round(avg(hrs)) : null,
      avgSteps: avg(steps) != null ? Math.round(avg(steps)) : null,
      avgScreenToSleepMinutes: avg(screenToSleep) != null ? Math.round(avg(screenToSleep)) : null,
      avgNightPhoneMinutes: avg(nightPhone) != null ? Math.round(avg(nightPhone)) : null,
      avgScreenMinutesLast120m: avg(screen120) != null ? Math.round(avg(screen120)) : null
    };
  });

  const primary = windows.d14.nightsUsed >= 7 ? windows.d14 : windows.d7.nightsUsed ? windows.d7 : windows.d28;

  return {
    windows,
    primary,
    updatedAt: new Date().toISOString()
  };
}

function bedtimeDeviationMinutes(bedtimeClock, avgBedtimeMinutes) {
  const actual = minutesFromClock(bedtimeClock);
  if (actual == null || typeof avgBedtimeMinutes !== 'number') return null;
  // signed-ish: positive = later than baseline (using shortest circular direction)
  let d = (actual - avgBedtimeMinutes) % 1440;
  if (d > 720) d -= 1440;
  if (d < -720) d += 1440;
  return d;
}

function consistencyScore(nights = [], avgBedtimeMinutes) {
  if (typeof avgBedtimeMinutes !== 'number' || nights.length < 3) return null;
  const drifts = nights
    .map((n) => minutesFromClock(n.bedtimeClock))
    .filter((v) => v != null)
    .map((b) => circularDiffMinutes(b, avgBedtimeMinutes));
  if (!drifts.length) return null;
  const mean = avg(drifts);
  if (mean == null) return null;
  if (mean <= 15) return 90;
  if (mean <= 30) return 75;
  if (mean <= 60) return 55;
  if (mean <= 90) return 35;
  return 20;
}

module.exports = {
  WINDOWS,
  computeBaselines,
  bedtimeDeviationMinutes,
  consistencyScore,
  confidenceFromCount,
  avg
};
