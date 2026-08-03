/**
 * Demo seed for SiempreSleep MVP (non-destructive upsert by email).
 * Usage: node scripts/seedSleepDemo.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const HealthData = require('../models/HealthData');
const DailyCheckIn = require('../models/DailyCheckIn');

const EMAIL = process.env.SLEEP_DEMO_EMAIL || 'demo.sleep@siempresleep.local';

async function main() {
  const mongo = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/siempresalud';
  await mongoose.connect(mongo);

  let user = await User.findOne({ email: EMAIL });
  if (!user) {
    user = await User.create({
      name: 'Demo',
      email: EMAIL,
      password: await bcrypt.hash('demo1234', 10),
      gender: 'female',
      sleepProfile: {
        onboardingCompleted: true,
        primaryGoal: 'fewer_interruptions',
        targetBedtime: '22:30',
        usualBedtime: '22:45',
        windDownMinutes: 45,
        notificationConsent: true
      },
      wellnessProfile: { sleepGoalMinutes: 480 }
    });
    console.log('Created demo user', EMAIL, 'password demo1234');
  } else {
    console.log('Demo user exists', EMAIL);
  }

  const deviceId = 'demo-sleep-band-001';
  for (let i = 0; i < 7; i++) {
    const day = new Date();
    day.setUTCDate(day.getUTCDate() - i);
    day.setUTCHours(7, 0, 0, 0);
    const total = 420 + (i % 3) * 25 - (i === 2 ? 80 : 0);
    await HealthData.findOneAndUpdate(
      { deviceId, timestamp: day },
      {
        deviceId,
        timestamp: day,
        email: EMAIL,
        data: {
          email: EMAIL,
          heartRate: 55 + i,
          sleepData: {
            totalMinutes: total,
            awakeMinutes: 15 + i * 5,
            wakingCount: i % 4,
            deepMinutes: 80,
            lightMinutes: 200,
            remMinutes: 90,
            bedtime: i === 2 ? '00:30' : '22:40'
          }
        }
      },
      { upsert: true }
    );

    const dateKey = day.toISOString().slice(0, 10);
    await DailyCheckIn.findOneAndUpdate(
      { userId: user._id, dateKey },
      {
        userId: user._id,
        dateKey,
        morning: {
          feeling: i % 2 === 0 ? 'okay' : 'tired',
          nightEvents: i === 2 ? ['hot_flash', 'bathroom'] : ['nothing_unusual'],
          completedAt: day
        }
      },
      { upsert: true }
    );
  }

  console.log('Seeded 7 nights + check-ins for', EMAIL);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
