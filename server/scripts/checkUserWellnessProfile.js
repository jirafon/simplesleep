const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/User');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/siempresalud';

function getArgValue(flag) {
  const idx = process.argv.findIndex((arg) => arg === flag);
  if (idx === -1) return '';
  return String(process.argv[idx + 1] || '').trim();
}

function maskMongoUrl(url) {
  return String(url || '').replace(/\/\/.+@/, '//***:***@');
}

async function run() {
  const emailArg = getArgValue('--email') || getArgValue('-e');
  const email = emailArg.toLowerCase();

  if (!email) {
    console.error('❌ Debes enviar --email <correo>');
    console.error('Ejemplo: node server/scripts/checkUserWellnessProfile.js --email usuario@dominio.com');
    process.exit(1);
  }

  try {
    console.log('🔗 Conectando a MongoDB:', maskMongoUrl(MONGO_URL));
    await mongoose.connect(MONGO_URL);

    const user = await User.findOne({ email }).select(
      'email name phone rut wellnessProfile.importantReminders wellnessProfile.eventAlerts wellnessProfile.activityGoalSteps wellnessProfile.activityGoalCalories wellnessProfile.sleepGoalMinutes wellnessProfile.hydrationGoalMl'
    );

    if (!user) {
      console.log(`❌ Usuario no encontrado: ${email}`);
      process.exit(0);
    }

    const profile = user.wellnessProfile || {};

    const output = {
      user: {
        email: user.email || '',
        name: user.name || '',
        phone: user.phone || '',
        rut: user.rut || ''
      },
      wellnessProfile: {
        activityGoalSteps: profile.activityGoalSteps || 8000,
        activityGoalCalories: profile.activityGoalCalories || 500,
        sleepGoalMinutes: profile.sleepGoalMinutes || 480,
        hydrationGoalMl: profile.hydrationGoalMl || 2000,
        importantReminders: Array.isArray(profile.importantReminders) ? profile.importantReminders : [],
        eventAlerts: Array.isArray(profile.eventAlerts) ? profile.eventAlerts : []
      },
      summary: {
        importantRemindersCount: Array.isArray(profile.importantReminders) ? profile.importantReminders.length : 0,
        eventAlertsCount: Array.isArray(profile.eventAlerts) ? profile.eventAlerts.length : 0
      }
    };

    console.log('\n✅ Datos wellness en Mongo (healthusers):\n');
    console.log(JSON.stringify(output, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

run();
