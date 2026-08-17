const mongoose = require('mongoose');

/**
 * SleepContext — behavioral + band context for one night window (~18:00 → 12:00).
 * Incomplete data is OK; dataQuality tracks what arrived.
 */
const sleepContextSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dateKey: { type: String, required: true, index: true },

    sleep: {
      bedtime: String,
      wakeTime: String,
      totalMinutes: Number,
      deepMinutes: Number,
      remMinutes: Number,
      lightMinutes: Number,
      awakeMinutes: Number,
      wakingCount: Number,
      nightHeartRate: Number,
      hrv: Number,
      spo2: Number,
      sleepScore: Number
    },

    phone: {
      lastInteractionAt: Date,
      screenMinutesLast30m: Number,
      screenMinutesLast60m: Number,
      screenMinutesLast120m: Number,
      screenToSleepMinutes: Number,
      nightUsageEvents: Number,
      nightUsageMinutes: Number,
      categoryMinutes: {
        social: Number,
        video: Number,
        gaming: Number,
        communication: Number,
        productivity: Number,
        other: Number
      },
      capturedAt: Date,
      source: { type: String, default: 'android_usage_stats' }
    },

    activity: {
      steps: Number,
      activeMinutes: Number
    },

    environment: {
      ambientLightBeforeBed: Number,
      ambientLightLux: Number,
      phoneStationaryAt: Date,
      phoneStationary: Boolean,
      devicePickedUp: Boolean,
      capturedAt: Date,
      source: String
    },

    habits: {
      caffeineLate: Boolean,
      alcohol: Boolean,
      exerciseLate: Boolean,
      stressLevel: Number,
      screensLate: Boolean
    },

    derived: {
      bedtimeDeviationMinutes: Number,
      wakeTimeDeviationMinutes: Number,
      sleepConsistencyScore: Number,
      avgScreenToSleepMinutes: Number
    },

    factors: [
      {
        id: String,
        label: String,
        value: String,
        direction: { type: String, enum: ['positive', 'negative', 'neutral', 'unknown'], default: 'unknown' },
        confidence: Number,
        detail: String
      }
    ],

    tonightMove: {
      title: String,
      reason: String,
      factor: String,
      confidence: Number,
      actionable: { type: Boolean, default: true },
      algorithmVersion: String
    },

    dataQuality: {
      band: { type: Boolean, default: false },
      phoneUsage: { type: Boolean, default: false },
      healthConnect: { type: Boolean, default: false },
      checkIn: { type: Boolean, default: false },
      confidence: {
        type: String,
        enum: ['high', 'medium', 'low', 'insufficient'],
        default: 'insufficient'
      }
    },

    algorithmVersion: { type: String, default: 'sleep-context-v1' }
  },
  { timestamps: true }
);

sleepContextSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('SleepContext', sleepContextSchema);
