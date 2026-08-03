const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/siempresalud';

async function checkUser() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB\n');
    
    const email = 'romerino@gmail.com';
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ Usuario ${email} NO EXISTE en la base de datos`);
      console.log('\n¿Deseas crear este usuario? Ejecuta el script de registro.');
    } else {
      console.log('✅ Usuario encontrado:');
      console.log('   ID:', user._id);
      console.log('   Nombre:', user.name);
      console.log('   Email:', user.email);
      console.log('   Perfil:', user.userprofile);
      console.log('   Password Hash:', user.password);
      console.log('   Password Hash length:', user.password.length);
      
      // Test password "123456"
      console.log('\n🔐 Probando contraseña: 123456');
      const isMatch = await user.comparePassword('123456');
      console.log('   Resultado:', isMatch ? '✅ CORRECTO' : '❌ INCORRECTO');
      
      // Check if password looks like a bcrypt hash
      const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
      console.log('\n🔍 Análisis del hash:');
      console.log('   Es hash bcrypt válido:', isBcryptHash ? '✅ SÍ' : '❌ NO');
      
      if (!isBcryptHash) {
        console.log('\n⚠️  PROBLEMA: La contraseña NO es un hash bcrypt válido');
        console.log('   Esto significa que la contraseña no fue hasheada correctamente');
        console.log('   Hay que resetear la contraseña del usuario');
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkUser();
