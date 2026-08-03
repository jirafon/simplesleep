const mongoose = require('mongoose');

const weeklyReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  weekStart: { type: String, required: true }, // YYYY-MM-DD (Monday)
  weekEnd: { type: String, required: true },
  summary: {
    avgSleepMinutes: Number,
    avgScore: Number,
    regularityLabel: String,
    interruptionsAvg: Number,
    nightHrAvg: Number,
    bestNight: { dateKey: String, score: Number },
    worstNight: { dateKey: String, score: Number },
    habitsCompleted: Number,
    activeExperiment: String,
    associations: [String],
    nextWeekRecommendation: String,
    narrative: String
  },
  algorithmVersion: { type: String, default: 'weekly-report-v1' }
}, { timestamps: true });

weeklyReportSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);
