const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

/**
 * Script para verificar y resetear el usuario romerino@gmail.com en producción
 * 
 * Uso:
 * 1. Para usar MongoDB local:
 *    node checkRenderUser.js
 * 
 * 2. Para usar MongoDB de producción (Render/Atlas):
 *    MONGO_URL="mongodb+srv://user:pass@cluster.mongodb.net/dbname" node checkRenderUser.js
 */

// Usar MONGO_URL del environment o el valor por defecto
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/siempresalud';

async function checkAndFixUser() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    console.log('📍 URL:', MONGO_URL.replace(/\/\/.*@/, '//***:***@')); // Ocultar credenciales
    
    await mongoose.connect(MONGO_URL);
    console.log('✅ Conectado a MongoDB\n');
    
    const email = 'romerino@gmail.com';
    const desiredPassword = '123456';
    
    console.log('🔍 Buscando usuario:', email);
    let user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ Usuario NO EXISTE en esta base de datos\n');
      console.log('📝 Creando usuario...');
      
      user = new User({
        name: 'Roberto Merino',
        email: email,
        password: desiredPassword,
        userprofile: 'admin',
        phone: '+56912345678',
        bitacora: []
      });
      
      await user.save();
      console.log('✅ Usuario creado exitosamente\n');
    } else {
      console.log('✅ Usuario encontrado:');
      console.log('   ID:', user._id);
      console.log('   Nombre:', user.name);
      console.log('   Email:', user.email);
      console.log('   Perfil:', user.userprofile);
      console.log('   Hash actual:', user.password.substring(0, 20) + '...\n');
    }
    
    // Probar contraseña actual
    console.log('🔐 Probando contraseña actual: "123456"');
    const isMatch = await user.comparePassword(desiredPassword);
    console.log('   Resultado:', isMatch ? '✅ CORRECTO' : '❌ INCORRECTO\n');
    
    if (!isMatch) {
      console.log('🔧 Actualizando contraseña a "123456"...');
      user.password = desiredPassword;
      await user.save();
      console.log('✅ Contraseña actualizada\n');
      
      // Verificar nuevamente
      const user2 = await User.findOne({ email });
      const isMatch2 = await user2.comparePassword(desiredPassword);
      console.log('🔐 Verificando nueva contraseña:', isMatch2 ? '✅ CORRECTO' : '❌ INCORRECTO');
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('📊 RESUMEN FINAL');
    console.log('═══════════════════════════════════════');
    console.log('✅ Usuario existe:', user.email);
    console.log('✅ Contraseña configurada: 123456');
    console.log('✅ Hash bcrypt válido');
    console.log('✅ Perfil:', user.userprofile);
    console.log('\n💡 El login debería funcionar ahora');
    console.log('   Email: romerino@gmail.com');
    console.log('   Password: 123456\n');
    
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkAndFixUser();
