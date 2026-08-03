const mongoose = require('mongoose');

const PAYMENT_COUNTER_ID = 'paymentNumber';

function formatPaymentNumber(sequence) {
  return `PAY-${String(sequence).padStart(8, '0')}`;
}

async function getNextPaymentSequence() {
  const countersCollection = mongoose.connection.db.collection('counters');
  const result = await countersCollection.findOneAndUpdate(
    { _id: PAYMENT_COUNTER_ID },
    {
      $inc: { seq: 1 },
      $setOnInsert: { createdAt: new Date(), seq: 0 }
    },
    {
      upsert: true,
      returnDocument: 'after'
    }
  );

  return result.value.seq;
}

const paymentSchema = new mongoose.Schema({
  // Información básica del pago
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Información de Flow
  flowToken: {
    type: String,
    unique: true,
    sparse: true
  },
  flowOrder: {
    type: String,
    unique: true,
    sparse: true
  },
  commerceOrder: {
    type: String,
    required: true,
    unique: true
  },
  paymentNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Montos y detalles
  amount: {
    type: Number,
    required: true
  },
  taxes: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'CLP',
    enum: ['CLP', 'USD', 'EUR']
  },
  
  // Estado del pago
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // URLs de Flow
  paymentUrl: String,
  
  // Método de pago usado (información de Flow)
  paymentMethod: String,
  
  // Fechas importantes
  createdAt: {
    type: Date,
    default: Date.now
  },
  paidAt: Date,
  confirmedAt: Date,
  
  // Descripción del pago
  subject: {
    type: String,
    required: true
  },
  
  // Información del usuario
  customerEmail: {
    type: String,
    required: true
  },
  
  // Datos adicionales de Flow (response completo)
  flowData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Historial de cambios de estado
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String,
    flowResponse: mongoose.Schema.Types.Mixed
  }],
  
  // Información de confirmación
  confirmation: {
    confirmed: {
      type: Boolean,
      default: false
    },
    confirmationData: mongoose.Schema.Types.Mixed,
    confirmationDate: Date
  },
  
  // Detalles de los items (exámenes médicos)
  items: [{
    name: String,
    quantity: {
      type: Number,
      default: 1
    },
    price: Number,
    category: String
  }],
  
  // Información de error si algo falla
  errorMessage: String,
  errorDetails: mongoose.Schema.Types.Mixed,
  
  // Logs adicionales
  logs: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    data: mongoose.Schema.Types.Mixed,
    notes: String
  }]
});

// Índices para mejorar el rendimiento
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
// commerceOrder and flowToken indexes are automatically created by unique: true
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Middleware para generar identificadores únicos antes de validar
paymentSchema.pre('validate', async function() {
  if (!this.commerceOrder) {
    this.commerceOrder = `SS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
  }

  if (!this.paymentNumber) {
    const nextSequence = await getNextPaymentSequence();
    this.paymentNumber = formatPaymentNumber(nextSequence);
  }
});

// Método para agregar log
paymentSchema.methods.addLog = function(action, data = {}, notes = '') {
  this.logs.push({
    action,
    data,
    notes,
    timestamp: new Date()
  });
};

// Método para cambiar estado
paymentSchema.methods.changeStatus = function(newStatus, notes = '', flowResponse = null) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  this.statusHistory.push({
    status: newStatus,
    notes,
    flowResponse,
    timestamp: new Date()
  });
  
  this.addLog('status_change', { from: oldStatus, to: newStatus }, notes);
  
  // Actualizar fechas según el estado
  if (newStatus === 'completed' && !this.paidAt) {
    this.paidAt = new Date();
  }
};

// Método para confirmar pago
paymentSchema.methods.confirmPayment = function(confirmationData) {
  this.confirmation = {
    confirmed: true,
    confirmationData,
    confirmationDate: new Date()
  };
  
  if (!this.confirmedAt) {
    this.confirmedAt = new Date();
  }
  
  this.addLog('payment_confirmed', confirmationData, 'Pago confirmado por Flow');
};

// Método estático para buscar por commerceOrder
paymentSchema.statics.findByCommerceOrder = function(commerceOrder) {
  return this.findOne({ commerceOrder });
};

// Método estático para buscar por Flow token
paymentSchema.statics.findByFlowToken = function(flowToken) {
  return this.findOne({ flowToken });
};

module.exports = mongoose.model('Payment', paymentSchema);