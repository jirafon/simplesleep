const mongoose = require('mongoose');

const dailyCheckInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  dateKey: { type: String, required: true, index: true }, // YYYY-MM-DD in user local or UTC
  morning: {
    feeling: { type: String, enum: ['rested', 'okay', 'tired', 'exhausted', null], default: null },
    nightEvents: [{ type: String }],
    completedAt: Date
  },
  evening: {
    caffeine: { had: Boolean, time: String },
    alcohol: { had: Boolean, amount: String },
    lastMealTime: String,
    dinnerSize: { type: String, enum: ['light', 'normal', 'heavy', null], default: null },
    exercise: { had: Boolean, time: String },
    nap: { had: Boolean, minutes: Number },
    stress: { type: Number, min: 0, max: 10 },
    screens: { late: Boolean },
    bedroomTemp: { type: String, enum: ['cool', 'comfortable', 'warm', null], default: null },
    mood: String,
    supplements: String,
    notes: String,
    completedAt: Date
  },
  sleepScore: {
    score: Number,
    quality: String,
    algorithmVersion: String,
    factors: [{ id: String, label: String, impact: Number, detail: String }],
    computedAt: Date
  }
}, { timestamps: true });

dailyCheckInSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('DailyCheckIn', dailyCheckInSchema);
