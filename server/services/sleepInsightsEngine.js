/**
 * Personal insights engine v1 — associations only, minimum sample sizes.
 * Avoid: caused, diagnosed, disease, prevented, treated.
 */

const DailyCheckIn = require('../models/DailyCheckIn');
const PersonalInsight = require('../models/PersonalInsight');
const { minutesFromClock } = require('./sleepScoreService');
const { t: i18nT } = require('../i18n/sleepMessages');

const MIN_GROUP = 4;
const ALGORITHM_VERSION = 'insights-v1';

const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

const joinNightsWithCheckIns = (nights, checkInsByDate) =>
  nights
    .map((n) => {
      const key = n.timestamp
        ? new Date(n.timestamp).toISOString().slice(0, 10)
        : null;
      const checkIn = key ? checkInsByDate[key] : null;
      return { ...n, dateKey: key, checkIn };
    })
    .filter((n) => n.dateKey);

const groupAvg = (rows, pick) => {
  const vals = rows.map(pick).filter((v) => typeof v === 'number');
  return avg(vals);
};

const confidence = (nA, nB) => {
  const n = Math.min(nA, nB);
  if (n >= 8) return 'high';
  if (n >= 5) return 'medium';
  return 'low';
};

/**
 * @param {string|ObjectId} userId
 * @param {Array} nights - from sleepController extract (totalMinutes, wakingCount, bedtimeClock, sleepScore, timestamp)
 */
const computeInsights = async (userId, nights = [], locale = 'en') => {
  if (!nights || nights.length < MIN_GROUP) {
    return {
      insights: [],
      meta: {
        reason: 'need_more_nights',
        minNights: MIN_GROUP,
        have: nights?.length || 0,
        algorithmVersion: ALGORITHM_VERSION
      }
    };
  }

  const checkIns = await DailyCheckIn.find({ userId }).sort({ dateKey: -1 }).limit(60).lean();
  const byDate = Object.fromEntries(checkIns.map((c) => [c.dateKey, c]));
  const rows = joinNightsWithCheckIns(nights.slice(0, 45), byDate);

  const candidates = [];

  // Caffeine after ~15:00 vs sleep start
  const withLateCaf = rows.filter((r) => {
    const t = r.checkIn?.evening?.caffeine?.time;
    if (!r.checkIn?.evening?.caffeine?.had || !t) return false;
    const m = minutesFromClock(t);
    return m != null && m >= 15 * 60;
  });
  const noLateCaf = rows.filter((r) => {
    if (!r.checkIn?.evening) return false;
    if (!r.checkIn.evening.caffeine?.had) return true;
    const t = r.checkIn.evening.caffeine.time;
    const m = minutesFromClock(t);
    return m != null && m < 15 * 60;
  });
  if (withLateCaf.length >= MIN_GROUP && noLateCaf.length >= MIN_GROUP) {
    const bedLate = groupAvg(withLateCaf, (r) => minutesFromClock(r.bedtimeClock));
    const bedEarly = groupAvg(noLateCaf, (r) => minutesFromClock(r.bedtimeClock));
    if (bedLate != null && bedEarly != null && bedLate - bedEarly >= 20) {
      candidates.push({
        insightKey: 'caffeine_after_3_later_sleep',
        category: 'caffeine',
        params: { minutes: Math.round(bedLate - bedEarly) },
        sampleSize: withLateCaf.length + noLateCaf.length,
        confidence: confidence(withLateCaf.length, noLateCaf.length),
        evidence: { withLateCaf: withLateCaf.length, noLateCaf: noLateCaf.length, minutes: Math.round(bedLate - bedEarly) }
      });
    }
  }

  // Alcohol vs interruptions
  const withAlc = rows.filter((r) => r.checkIn?.evening?.alcohol?.had === true);
  const noAlc = rows.filter((r) => r.checkIn?.evening?.alcohol?.had === false);
  if (withAlc.length >= MIN_GROUP && noAlc.length >= MIN_GROUP) {
    const intA = groupAvg(withAlc, (r) => r.wakingCount);
    const intB = groupAvg(noAlc, (r) => r.wakingCount);
    if (intA != null && intB != null && intA > intB + 0.4) {
      candidates.push({
        insightKey: 'alcohol_more_interruptions',
        category: 'alcohol',
        params: { delta: (intA - intB).toFixed(1) },
        sampleSize: withAlc.length + noAlc.length,
        confidence: confidence(withAlc.length, noAlc.length),
        evidence: { withAlc: withAlc.length, noAlc: noAlc.length, delta: (intA - intB).toFixed(1) }
      });
    }
  }

  // Consistent bedtime vs morning energy
  const targetSpread = 30;
  const bedtimes = rows
    .map((r) => minutesFromClock(r.bedtimeClock))
    .filter((v) => v != null);
  const meanBed = avg(bedtimes);
  if (meanBed != null) {
    const consistent = rows.filter((r) => {
      const b = minutesFromClock(r.bedtimeClock);
      if (b == null) return false;
      let d = Math.abs(b - meanBed);
      if (d > 12 * 60) d = 24 * 60 - d;
      return d <= targetSpread;
    });
    const restedConsistent = consistent.filter((r) =>
      ['rested', 'okay'].includes(r.checkIn?.morning?.feeling)
    );
    if (
      consistent.length >= MIN_GROUP &&
      restedConsistent.length >= Math.ceil(consistent.length * 0.5)
    ) {
      candidates.push({
        insightKey: 'consistent_bedtime_morning_energy',
        category: 'schedule',
        params: { good: restedConsistent.length, total: consistent.length },
        sampleSize: consistent.length,
        confidence: confidence(consistent.length, restedConsistent.length),
        evidence: { consistent: consistent.length, restedOrOkay: restedConsistent.length }
      });
    }
  }

  // Late screens vs shorter sleep
  const lateScreens = rows.filter((r) => r.checkIn?.evening?.screens?.late === true);
  const earlyScreens = rows.filter((r) => r.checkIn?.evening?.screens?.late === false);
  if (lateScreens.length >= MIN_GROUP && earlyScreens.length >= MIN_GROUP) {
    const shortLate = groupAvg(lateScreens, (r) => r.totalMinutes);
    const shortEarly = groupAvg(earlyScreens, (r) => r.totalMinutes);
    if (shortLate != null && shortEarly != null && shortEarly - shortLate >= 20) {
      candidates.push({
        insightKey: 'late_screens_shorter_sleep',
        category: 'screens',
        params: { minutes: Math.round(shortEarly - shortLate) },
        sampleSize: lateScreens.length + earlyScreens.length,
        confidence: confidence(lateScreens.length, earlyScreens.length),
        evidence: { lateScreens: lateScreens.length, earlyScreens: earlyScreens.length, minutes: Math.round(shortEarly - shortLate) }
      });
    }
  }

  // High stress vs interruptions
  const highStress = rows.filter((r) => (r.checkIn?.evening?.stress ?? 0) >= 7);
  const lowStress = rows.filter((r) => {
    const s = r.checkIn?.evening?.stress;
    return typeof s === 'number' && s <= 4;
  });
  if (highStress.length >= MIN_GROUP && lowStress.length >= MIN_GROUP) {
    const iH = groupAvg(highStress, (r) => r.wakingCount);
    const iL = groupAvg(lowStress, (r) => r.wakingCount);
    if (iH != null && iL != null && iH > iL + 0.5) {
      candidates.push({
        insightKey: 'high_stress_interruptions',
        category: 'stress',
        params: {},
        sampleSize: highStress.length + lowStress.length,
        confidence: confidence(highStress.length, lowStress.length),
        evidence: { highStress: highStress.length, lowStress: lowStress.length }
      });
    }
  }

  // Heavy dinner vs morning tired
  const heavy = rows.filter((r) => r.checkIn?.evening?.dinnerSize === 'heavy');
  const light = rows.filter((r) =>
    ['light', 'normal'].includes(r.checkIn?.evening?.dinnerSize)
  );
  if (heavy.length >= MIN_GROUP && light.length >= MIN_GROUP) {
    const tiredHeavy = heavy.filter((r) =>
      ['tired', 'exhausted'].includes(r.checkIn?.morning?.feeling)
    ).length;
    const tiredLight = light.filter((r) =>
      ['tired', 'exhausted'].includes(r.checkIn?.morning?.feeling)
    ).length;
    const rateH = tiredHeavy / heavy.length;
    const rateL = tiredLight / light.length;
    if (rateH >= rateL + 0.2) {
      candidates.push({
        insightKey: 'heavy_dinner_morning_tired',
        category: 'dinner',
        params: {},
        sampleSize: heavy.length + light.length,
        confidence: confidence(heavy.length, light.length),
        evidence: { heavy: heavy.length, lightOrNormal: light.length }
      });
    }
  }

  // Night symptoms (hot flash / sweat) vs score
  const withSym = rows.filter((r) => {
    const ev = r.checkIn?.morning?.nightEvents || [];
    return ev.some((e) => ['hot_flash', 'night_sweat'].includes(e));
  });
  const noSym = rows.filter((r) => {
    const ev = r.checkIn?.morning?.nightEvents || [];
    return ev.length && !ev.some((e) => ['hot_flash', 'night_sweat'].includes(e));
  });
  if (withSym.length >= MIN_GROUP && noSym.length >= MIN_GROUP) {
    const sA = groupAvg(withSym, (r) => r.sleepScore?.score);
    const sB = groupAvg(noSym, (r) => r.sleepScore?.score);
    if (sA != null && sB != null && sB - sA >= 5) {
      candidates.push({
        insightKey: 'night_heat_lower_score',
        category: 'symptoms',
        params: {},
        sampleSize: withSym.length + noSym.length,
        confidence: confidence(withSym.length, noSym.length),
        evidence: { withSymptoms: withSym.length, without: noSym.length }
      });
    }
  }

  const top = candidates.slice(0, 5);

  const localize = (c) => {
    const params = c.params || c.evidence || {};
    return {
      insightKey: c.insightKey,
      category: c.category,
      title: i18nT(locale, `insight.${c.insightKey}.title`),
      body: i18nT(locale, `insight.${c.insightKey}.body`, params),
      sampleSize: c.sampleSize,
      confidence: c.confidence,
      evidence: c.evidence,
      disclaimer: i18nT(locale, 'disclaimer.association'),
      algorithmVersion: ALGORITHM_VERSION
    };
  };

  const localized = top.map(localize);

  for (const c of localized) {
    await PersonalInsight.findOneAndUpdate(
      { userId, insightKey: c.insightKey },
      {
        userId,
        insightKey: c.insightKey,
        category: c.category,
        title: c.title,
        body: c.body,
        sampleSize: c.sampleSize,
        confidence: c.confidence,
        evidence: c.evidence,
        algorithmVersion: ALGORITHM_VERSION,
        active: true,
        computedAt: new Date()
      },
      { upsert: true, new: true }
    );
  }

  return {
    insights: localized,
    meta: {
      algorithmVersion: ALGORITHM_VERSION,
      candidates: candidates.length,
      nightsUsed: rows.length,
      checkInsUsed: checkIns.length
    }
  };
};

const getStoredInsights = async (userId, limit = 10) =>
  PersonalInsight.find({ userId, active: true })
    .sort({ computedAt: -1 })
    .limit(limit)
    .lean();

module.exports = {
  computeInsights,
  getStoredInsights,
  ALGORITHM_VERSION,
  MIN_GROUP
};
