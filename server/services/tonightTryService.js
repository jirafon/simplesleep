/**
 * Tonight's Move acceptance — persist "I'll try this" without gamified punishment.
 */

const SleepRecommendation = require('../models/SleepRecommendation');

function dateKeyUTC(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

async function recordTryTonight(userId, payload = {}) {
  const dateKey = payload.dateKey || dateKeyUTC();
  const doc = await SleepRecommendation.findOneAndUpdate(
    { userId, dateKey },
    {
      $set: {
        title: payload.title || null,
        reason: payload.reason || null,
        factor: payload.factor || null,
        confidence: typeof payload.confidence === 'number' ? payload.confidence : null,
        algorithmVersion: payload.algorithmVersion || 'tonight-move-v1',
        tried: true,
        triedAt: new Date(),
        source: payload.source || 'tonight_move'
      },
      $setOnInsert: { userId, dateKey }
    },
    { upsert: true, new: true }
  );
  return doc;
}

async function getTryForDate(userId, dateKey) {
  return SleepRecommendation.findOne({ userId, dateKey }).lean();
}

async function countTryStreak(userId, fromDateKey = dateKeyUTC(), maxLookback = 28) {
  const rows = await SleepRecommendation.find({
    userId,
    tried: true,
    dateKey: { $lte: fromDateKey }
  })
    .sort({ dateKey: -1 })
    .limit(maxLookback)
    .lean();

  const byDate = new Set(rows.map((r) => r.dateKey));
  let count = 0;
  const start = new Date(`${fromDateKey}T12:00:00.000Z`);
  for (let i = 0; i < maxLookback; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (byDate.has(key)) count += 1;
    else break;
  }
  return count;
}

module.exports = {
  recordTryTonight,
  getTryForDate,
  countTryStreak,
  dateKeyUTC
};
