const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/siempresalud';

async function checkAndReset() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB\n');
    
    const email = 'chaquin@gmail.com';
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ Usuario chaquin@gmail.com NO existe en la base de datos');
      console.log('\n✅ Usa el usuario existente:');
      console.log('   Email: hello@eticpro.com');
      console.log('   Password: superdificldeobtener');
    } else {
      console.log('✅ Usuario encontrado:', user.email);
      console.log('   Nombre:', user.nombre || user.name);
      console.log('   Perfil:', user.perfil || user.profile);
      console.log('\n📝 Actualizando contraseña...');
      
      user.password = 'superdificldeobtener';
      await user.save();
      
      console.log('✅ Contraseña actualizada exitosamente!');
      console.log('\n🔐 Credenciales:');
      console.log('   Email: chaquin@gmail.com');
      console.log('   Password: superdificldeobtener');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndReset();
