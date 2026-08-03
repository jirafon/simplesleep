const mongoose = require('mongoose');

const dayLogSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true },
    completed: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    loggedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const metricsSnapshotSchema = new mongoose.Schema(
  {
    nights: { type: Number, default: 0 },
    avgSleepMinutes: { type: Number, default: null },
    avgInterruptions: { type: Number, default: null },
    avgScore: { type: Number, default: null },
    avgBedtimeMinutes: { type: Number, default: null }
  },
  { _id: false }
);

const experimentAssignmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    experimentId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    goal: { type: String, default: '' },
    dailyAction: { type: String, default: '' },
    durationDays: { type: Number, required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
      index: true
    },
    startedAt: { type: Date, default: Date.now },
    endsAt: { type: Date, required: true },
    completedAt: { type: Date, default: null },
    baseline: { type: metricsSnapshotSchema, default: () => ({}) },
    during: { type: metricsSnapshotSchema, default: () => ({}) },
    dayLogs: { type: [dayLogSchema], default: [] },
    result: {
      summary: { type: String, default: '' },
      sleepDeltaMinutes: { type: Number, default: null },
      interruptionDeltaPct: { type: Number, default: null },
      scoreDelta: { type: Number, default: null },
      confidence: {
        type: String,
        enum: ['low', 'medium', 'high', null],
        default: null
      },
      disclaimer: {
        type: String,
        default:
          'Personal association only — not medical causation, diagnosis, or treatment advice.'
      }
    },
    algorithmVersion: { type: String, default: 'experiment-v1' }
  },
  { timestamps: true }
);

experimentAssignmentSchema.index({ userId: 1, status: 1 });
experimentAssignmentSchema.index({ userId: 1, experimentId: 1, status: 1 });

module.exports = mongoose.model('ExperimentAssignment', experimentAssignmentSchema);
