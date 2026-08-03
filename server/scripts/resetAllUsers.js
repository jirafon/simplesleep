const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/siempresalud';

const users = [
  'hello@eticpro.com',
  'contacto@unbiax.com',
  'romerino@gmail.com',
  'chaquin@gmail.com',
  'hadesdes@gmail.com',
  'hello@eticpro2.com',
  'hello@eticpro3.com'
];

async function resetAllPasswords() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB\n');
    
    const newPassword = '123456';
    console.log('🔐 Reseteando contraseñas a:', newPassword);
    console.log('==========================================\n');
    
    for (const email of users) {
      const user = await User.findOne({ email });
      
      if (!user) {
        console.log(`❌ ${email} - NO EXISTE`);
        continue;
      }
      
      user.password = newPassword;
      await user.save();
      console.log(`✅ ${email} - Contraseña actualizada`);
    }
    
    console.log('\n==========================================');
    console.log('✅ Todas las contraseñas actualizadas exitosamente!');
    console.log('\n🔐 Credenciales para todos los usuarios:');
    console.log('   Password: 123456\n');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAllPasswords();
