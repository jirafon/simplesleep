/**
 * SleepRecommendation — Tonight's Move acceptance / "I'll try this".
 */
const mongoose = require('mongoose');

const sleepRecommendationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dateKey: { type: String, required: true, index: true },
    title: String,
    reason: String,
    factor: String,
    confidence: Number,
    algorithmVersion: { type: String, default: 'tonight-move-v1' },
    tried: { type: Boolean, default: false },
    triedAt: Date,
    source: { type: String, default: 'tonight_move' }
  },
  { timestamps: true }
);

sleepRecommendationSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('SleepRecommendation', sleepRecommendationSchema);
