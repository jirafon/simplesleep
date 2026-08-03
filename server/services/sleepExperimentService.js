const ExperimentAssignment = require('../models/ExperimentAssignment');
const DailyCheckIn = require('../models/DailyCheckIn');
const { EXPERIMENT_CATALOG, getCatalogItem } = require('./sleepExperimentCatalog');
const { minutesFromClock } = require('./sleepScoreService');
const { t: i18nT, localizeCatalogItem } = require('../i18n/sleepMessages');

const dateKeyUTC = (d = new Date()) => d.toISOString().slice(0, 10);

const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

const snapshotFromNights = (nights) => {
  const totals = nights.map((n) => n.totalMinutes).filter((v) => typeof v === 'number');
  const interrupts = nights.map((n) => n.wakingCount).filter((v) => typeof v === 'number');
  const scores = nights
    .map((n) => n.sleepScore?.score)
    .filter((v) => typeof v === 'number');
  const beds = nights
    .map((n) => minutesFromClock(n.bedtimeClock))
    .filter((v) => v != null);

  return {
    nights: nights.length,
    avgSleepMinutes: avg(totals) != null ? Math.round(avg(totals)) : null,
    avgInterruptions: avg(interrupts) != null ? Math.round(avg(interrupts) * 10) / 10 : null,
    avgScore: avg(scores) != null ? Math.round(avg(scores)) : null,
    avgBedtimeMinutes: avg(beds) != null ? Math.round(avg(beds)) : null
  };
};

const confidenceFromSamples = (baselineNights, duringNights, complianceRate) => {
  if (duringNights < 3 || baselineNights < 3 || complianceRate < 0.4) return 'low';
  if (duringNights >= 7 && baselineNights >= 5 && complianceRate >= 0.7) return 'high';
  return 'medium';
};

const buildResult = (assignment, duringSnap, locale = 'en') => {
  const base = assignment.baseline || {};
  const sleepDelta =
    base.avgSleepMinutes != null && duringSnap.avgSleepMinutes != null
      ? duringSnap.avgSleepMinutes - base.avgSleepMinutes
      : null;
  const interruptDeltaPct =
    base.avgInterruptions != null &&
    duringSnap.avgInterruptions != null &&
    base.avgInterruptions > 0
      ? Math.round(
          ((duringSnap.avgInterruptions - base.avgInterruptions) / base.avgInterruptions) * 100
        )
      : null;
  const scoreDelta =
    base.avgScore != null && duringSnap.avgScore != null
      ? duringSnap.avgScore - base.avgScore
      : null;

  const completedDays = (assignment.dayLogs || []).filter((d) => d.completed).length;
  const expected = Math.max(1, assignment.durationDays);
  const complianceRate = completedDays / expected;
  const confidence = confidenceFromSamples(base.nights || 0, duringSnap.nights || 0, complianceRate);

  const parts = [];
  if (sleepDelta != null) {
    const abs = Math.abs(sleepDelta);
    parts.push(
      i18nT(locale, sleepDelta >= 0 ? 'exp.result.sleepUp' : 'exp.result.sleepDown', { n: abs })
    );
  }
  if (interruptDeltaPct != null) {
    parts.push(
      i18nT(locale, interruptDeltaPct <= 0 ? 'exp.result.intDown' : 'exp.result.intUp', {
        n: Math.abs(interruptDeltaPct)
      })
    );
  }
  if (!parts.length) {
    parts.push(i18nT(locale, 'exp.result.needData'));
  }

  return {
    summary: i18nT(locale, 'exp.result.summary', { parts: parts.join(locale === 'es' ? ' y ' : ' and ') }),
    sleepDeltaMinutes: sleepDelta,
    interruptionDeltaPct: interruptDeltaPct,
    scoreDelta,
    confidence,
    disclaimer: i18nT(locale, 'disclaimer.associationOnly')
  };
};

const listCatalog = (locale = 'en') =>
  EXPERIMENT_CATALOG.map((item) => localizeCatalogItem(item, locale));

const getActiveForUser = async (userId) =>
  ExperimentAssignment.findOne({ userId, status: 'active' }).sort({ startedAt: -1 });

const listAssignments = async (userId, { includeCompleted = true, locale = 'en' } = {}) => {
  const q = { userId };
  if (!includeCompleted) q.status = 'active';
  const rows = await ExperimentAssignment.find(q).sort({ startedAt: -1 }).limit(20);
  return rows.map((row) => {
    const o = row.toObject();
    const loc = localizeCatalogItem({ id: o.experimentId }, locale);
    return {
      ...o,
      title: loc.title || o.title,
      goal: loc.goal || o.goal,
      dailyAction: loc.dailyAction || o.dailyAction
    };
  });
};

const startExperiment = async (userId, experimentId, baselineNights = []) => {
  const item = getCatalogItem(experimentId);
  if (!item) {
    const err = new Error(i18nT('en', 'err.unknownExperiment'));
    err.status = 400;
    throw err;
  }

  const existing = await getActiveForUser(userId);
  if (existing) {
    const err = new Error(i18nT('en', 'err.activeExists'));
    err.status = 409;
    err.active = existing;
    throw err;
  }

  const startedAt = new Date();
  const endsAt = new Date(startedAt);
  endsAt.setUTCDate(endsAt.getUTCDate() + item.durationDays);

  const baseline = snapshotFromNights(baselineNights.slice(0, 14));

  return ExperimentAssignment.create({
    userId,
    experimentId: item.id,
    title: item.title,
    goal: item.goal,
    dailyAction: item.dailyAction,
    durationDays: item.durationDays,
    status: 'active',
    startedAt,
    endsAt,
    baseline,
    dayLogs: []
  });
};

const logCompliance = async (userId, assignmentId, { dateKey, completed, notes } = {}) => {
  const assignment = await ExperimentAssignment.findOne({ _id: assignmentId, userId });
  if (!assignment) {
    const err = new Error('Experiment not found');
    err.status = 404;
    throw err;
  }
  if (assignment.status !== 'active') {
    const err = new Error('Experiment is not active');
    err.status = 400;
    throw err;
  }

  const key = dateKey || dateKeyUTC();
  const logs = assignment.dayLogs || [];
  const idx = logs.findIndex((d) => d.dateKey === key);
  const entry = {
    dateKey: key,
    completed: Boolean(completed),
    notes: notes || '',
    loggedAt: new Date()
  };
  if (idx >= 0) logs[idx] = entry;
  else logs.push(entry);
  assignment.dayLogs = logs;
  await assignment.save();
  return assignment;
};

const finalizeExperiment = async (userId, assignmentId, duringNights, { abandon = false, locale = 'en' } = {}) => {
  const assignment = await ExperimentAssignment.findOne({ _id: assignmentId, userId });
  if (!assignment) {
    const err = new Error(i18nT(locale, 'err.notFound'));
    err.status = 404;
    throw err;
  }

  const during = snapshotFromNights(duringNights || []);
  assignment.during = during;
  assignment.result = buildResult(assignment, during, locale);
  assignment.status = abandon ? 'abandoned' : 'completed';
  assignment.completedAt = new Date();
  await assignment.save();
  return assignment;
};

const refreshActiveProgress = async (userId, nights, locale = 'en') => {
  const active = await getActiveForUser(userId);
  if (!active) return null;

  const start = active.startedAt ? new Date(active.startedAt) : null;
  const duringNights = (nights || []).filter((n) => {
    if (!start || !n.timestamp) return true;
    return new Date(n.timestamp) >= start;
  });
  active.during = snapshotFromNights(duringNights);
  active.result = buildResult(active, active.during, locale);

  if (new Date() >= active.endsAt && active.status === 'active') {
    active.status = 'completed';
    active.completedAt = new Date();
  }
  await active.save();

  const loc = localizeCatalogItem({ id: active.experimentId }, locale);
  const obj = active.toObject();
  return {
    ...obj,
    title: loc.title || obj.title,
    goal: loc.goal || obj.goal,
    dailyAction: loc.dailyAction || obj.dailyAction
  };
};

const complianceRate = (assignment) => {
  const completed = (assignment.dayLogs || []).filter((d) => d.completed).length;
  const durationDays = assignment.durationDays || 1;
  return {
    completedDays: completed,
    durationDays,
    rate: Math.round((completed / durationDays) * 100)
  };
};

module.exports = {
  listCatalog,
  getCatalogItem,
  getActiveForUser,
  listAssignments,
  startExperiment,
  logCompliance,
  finalizeExperiment,
  refreshActiveProgress,
  complianceRate,
  snapshotFromNights,
  dateKeyUTC
};
