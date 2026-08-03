const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  apellidoPaterno: {
    type: String,
    trim: true
  },
  apellidoMaterno: {
    type: String,
    trim: true
  },
  rut: {
    type: String,
    trim: true,
    uppercase: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  userprofile: {
    type: String,
    enum: ['user', 'admin', 'superadmin', 'doctor'],
    default: 'user'
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  wellnessProfile: {
    hydrationGoalMl: { type: Number, default: 2000 },
    activityGoalSteps: { type: Number, default: 8000 },
    activityGoalCalories: { type: Number, default: 500 },
    sleepGoalMinutes: { type: Number, default: 480 },
    cycleLengthDays: { type: Number, default: 28 },
    periodLengthDays: { type: Number, default: 5 },
    lastPeriodStart: { type: Date, default: null },
    menopauseActive: { type: Boolean, default: false },
    menopauseStage: {
      type: String,
      enum: ['perimenopause', 'menopause', 'postmenopause', null],
      default: null
    },
    habitsGoalMode: {
      type: String,
      enum: ['athlete', 'healthy_life'],
      default: 'healthy_life'
    },
    primarySport: {
      type: String,
      default: 'vida_sana'
    },
    sportLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    weeklyTrainingDays: {
      type: Number,
      default: 3,
      min: 1,
      max: 7
    },
    importantReminders: [{
      id: { type: String, required: true },
      label: { type: String, required: true },
      vibrationCount: { type: Number, default: 1, min: 1, max: 10 },
      time: { type: String, default: '09:00' },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '21:00' },
      frequency: {
        type: String,
        enum: ['daily', 'weekdays', 'weekends', 'custom'],
        default: 'daily'
      },
      frequencyMinutes: { type: Number, default: 60, min: 5, max: 1440 },
      enabled: { type: Boolean, default: true },
      aiRecommended: { type: Boolean, default: true },
      aiReason: { type: String, default: '' }
    }],
    eventAlerts: [{
      id: { type: String, required: true },
      label: { type: String, required: true },
      type: {
        type: String,
        enum: ['whatsapp', 'phone_call', 'panic_button', 'help_button'],
        required: true
      },
      vibrationCount: { type: Number, default: 1, min: 1, max: 10 },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '21:00' },
      enabled: { type: Boolean, default: true },
      aiRecommended: { type: Boolean, default: true },
      aiReason: { type: String, default: '' }
    }],
    panicAlertContacts: {
      emails: [{
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido']
      }],
      whatsapp: {
        type: String,
        trim: true,
        default: ''
      }
    },
    // Alias readable for SiempreSleep (synced from panicAlertContacts; APK still uses panic*)
    helpContacts: {
      emails: [{
        type: String,
        lowercase: true,
        trim: true
      }],
      whatsapp: {
        type: String,
        trim: true,
        default: ''
      }
    },
    mobilePushTokens: [{
      token: {
        type: String,
        trim: true,
        required: true
      },
      platform: {
        type: String,
        trim: true,
        default: 'android'
      },
      deviceId: {
        type: String,
        trim: true,
        default: ''
      },
      appVersion: {
        type: String,
        trim: true,
        default: ''
      },
      lastSeenAt: {
        type: Date,
        default: Date.now
      },
      enabled: {
        type: Boolean,
        default: true
      }
    }]
  },
  wellnessLogs: [{
    module: {
      type: String,
      enum: ['habits', 'cycle', 'menopause', 'sleep']
    },
    logDate: {
      type: Date,
      default: Date.now
    },
    data: {
      type: Object,
      default: {}
    }
  }],
  sleepProfile: {
    onboardingCompleted: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 0 },
    primaryGoal: {
      type: String,
      enum: ['more_energy', 'fewer_interruptions', 'regular_schedule', 'bedtime_routine', 'understand_factors', null],
      default: null
    },
    wakeFeeling: { type: String, default: null },
    usualBedtime: { type: String, default: '22:30' },
    usualWakeTime: { type: String, default: '07:00' },
    targetBedtime: { type: String, default: '22:30' },
    targetWakeTime: { type: String, default: '07:00' },
    awakeningsFrequency: {
      type: String,
      enum: ['rarely', 'sometimes', 'often', 'every_night', null],
      default: null
    },
    caffeineHabit: { type: String, default: null },
    alcoholHabit: { type: String, default: null },
    dinnerTiming: { type: String, default: null },
    stressLevel: { type: Number, min: 0, max: 10, default: null },
    screenUse: { type: String, default: null },
    nightSymptoms: [{ type: String }],
    vibrationPreference: {
      intensity: { type: String, enum: ['gentle', 'medium', 'strong'], default: 'gentle' },
      enabled: { type: Boolean, default: true }
    },
    notificationConsent: { type: Boolean, default: false },
    locationConsent: { type: Boolean, default: false },
    windDownMinutes: { type: Number, default: 45 },
    baseline: {
      avgBedtimeMinutes: { type: Number, default: null },
      avgSleepMinutes: { type: Number, default: null },
      avgNightHr: { type: Number, default: null },
      updatedAt: { type: Date, default: null }
    }
  },
  bitacora: [{
    type: {
      type: String,
      enum: ['order', 'appointment', 'exam', 'control', 'consultation', 'consent'],
      required: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order' // Los exámenes pueden usar el modelo Order o crear uno nuevo
    },
    controlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order' // Los controles pueden usar el modelo Order o crear uno nuevo
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment' // Las consultas pueden usar el modelo Appointment o crear uno nuevo
    },
    consentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order' // Los consentimientos pueden usar un modelo nuevo o existente
    },
    // Campos adicionales para datos directos sin referencia
    title: String,
    description: String,
    status: String,
    date: {
      type: Date,
      default: Date.now
    },
    // Documentos asociados (PDFs, imágenes) almacenados en S3
    documents: [{
      fileName: String,
      s3Key: String, // Key en S3
      fileType: String, // pdf, image, etc.
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Explicitly set collection name to 'healthusers'
module.exports = mongoose.model('User', userSchema, 'healthusers');
