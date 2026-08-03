const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/siempresalud';

async function checkUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB\n');

    // Check for specific user
    const email = 'hello@eticpro.com';
    const user = await User.findOne({ email });

    if (user) {
      console.log('✅ User found:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Profile:', user.userprofile || 'user');
      console.log('   Created:', user.createdAt);
      console.log('\n💡 Use this email and your password to login');
    } else {
      console.log('❌ User not found:', email);
      console.log('\n📝 Creating test user...\n');
      
      // Create test user
      const testUser = new User({
        name: 'Test User',
        email: 'hello@eticpro.com',
        password: '123456',
        userprofile: 'user',
        bitacora: []
      });

      await testUser.save();
      
      console.log('✅ Test user created successfully!');
      console.log('\n🔐 Login credentials:');
      console.log('   Email: hello@eticpro.com');
      console.log('   Password: 123456');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUser();
