const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  nombre: { type: String, default: '' },
  email: { type: String, default: '' },
  telefono: { type: String, default: '' },
  idpersonal: { type: String, default: '' },
  data: { type: Object, required: true },
  riskMetadata: { type: Object, default: null },
}, { timestamps: true });

module.exports = mongoose.model('HealthData', healthDataSchema);