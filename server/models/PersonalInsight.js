const mongoose = require('mongoose');

const personalInsightSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    insightKey: { type: String, required: true },
    title: { type: String, default: '' },
    body: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'caffeine',
        'alcohol',
        'dinner',
        'stress',
        'screens',
        'schedule',
        'exercise',
        'symptoms',
        'temperature',
        'general'
      ],
      default: 'general'
    },
    sampleSize: { type: Number, default: 0 },
    confidence: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    evidence: { type: Object, default: {} },
    algorithmVersion: { type: String, default: 'insights-v1' },
    active: { type: Boolean, default: true },
    computedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

personalInsightSchema.index({ userId: 1, insightKey: 1 }, { unique: true });

module.exports = mongoose.model('PersonalInsight', personalInsightSchema);
