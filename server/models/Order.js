const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: {
    type: String,
    default: 'Roberto Merino'
  },
  type: {
    type: String,
    required: [true, 'El tipo de examen es requerido'],
    enum: ['PAP', 'thyroid', 'hypertension', 'mammography', 'custom'],
    default: 'custom'
  },
  // Lista de exámenes comprados (cuando el usuario compra varios en una sola orden)
  exams: {
    type: [String],
    default: []
  },
  examName: {
    type: String,
    required: [true, 'El nombre del examen es requerido']
  },
  status: {
    type: String,
    enum: ['pending', 'awaiting_payment', 'payment_confirmed', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  pdfLink: {
    type: String,
    default: null
  },
  pdfS3Key: {
    type: String,
    default: null
  },
  digitalDownloadLink: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  // Logs de registro (historial de cambios)
  logs: [{
    action: {
      type: String,
      enum: ['created', 'status_changed', 'approved', 'rejected', 'pdf_generated', 'updated', 'payment_initiated', 'payment_completed', 'payment_failed'],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedByName: String,
    previousStatus: String,
    newStatus: String,
    notes: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Aprobación
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  approvalMode: {
    type: String,
    enum: ['auto', 'manual'],
    default: 'auto'
  },
  
  // Payment information
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  pricingSummary: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  cartItems: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  currency: {
    type: String,
    default: 'CLP'
  },
  requiresPayment: {
    type: Boolean,
    default: true
  },
  appliedDiscount: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
