const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: {
    type: String,
    default: 'Roberto Merino'
  },
  appointmentDate: {
    type: Date,
    required: [true, 'La fecha de la cita es requerida']
  },
  appointmentTime: {
    type: String,
    required: [true, 'La hora de la cita es requerida']
  },
  durationMinutes: {
    type: Number,
    enum: [15, 30, 45, 60],
    default: 30
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  consultationType: {
    type: String,
    enum: ['general', 'specialist', 'follow-up'],
    default: 'general'
  },
  notes: {
    type: String,
    default: ''
  },
  meetingLink: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
