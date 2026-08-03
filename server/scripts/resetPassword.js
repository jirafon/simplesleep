const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/siempresalud';

async function resetPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB\n');

    // Find user
    const email = 'hello@eticpro.com';
    const newPassword = 'superdificldeobtener';
    
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found:', email);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    console.log('📝 Resetting password...\n');

    // Update password (this will trigger the pre-save hook to hash it)
    user.password = newPassword;
    await user.save();

    console.log('✅ Password reset successfully!\n');
    console.log('🔐 New login credentials:');
    console.log('   Email:', email);
    console.log('   Password:', newPassword);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

resetPassword();
