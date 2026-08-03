const mongoose = require('mongoose');
const HealthData = require('../models/HealthData');
require('dotenv').config();

console.log('🔧 MongoDB Connection Test Tool');
console.log('================================');

async function testMongoConnection() {
  try {
    // 1. Verificar variables de entorno
    console.log('📋 Verificando variables de entorno...');
    const mongoUri = process.env.MONGO_URL;
    console.log('   MONGO_URL existe:', !!mongoUri);
    console.log('   MONGO_URL (primeros 20 chars):', mongoUri?.substring(0, 20) + '...');
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    
    if (!mongoUri) {
      throw new Error('MONGO_URL no está definida en variables de entorno');
    }

    // 2. Intentar conexión con timeout
    console.log('\n🔌 Intentando conectar a MongoDB...');
    const connectPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 15000,
    });
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000)
    );
    
    const startTime = Date.now();
    await Promise.race([connectPromise, timeoutPromise]);
    const connectTime = Date.now() - startTime;
    
    console.log(`✅ Conectado exitosamente en ${connectTime}ms`);
    console.log('   Estado:', mongoose.connection.readyState);
    console.log('   Host:', mongoose.connection.host);
    console.log('   DB Name:', mongoose.connection.name);

    // 3. Test de escritura/lectura
    console.log('\n📝 Probando operación de escritura...');
    const testData = new HealthData({
      deviceId: 'CONNECTION_TEST_DEVICE',
      timestamp: new Date(),
      data: {
        heartRate: 75,
        bloodPressure: { systolic: 120, diastolic: 80 },
        test: true,
        timestamp: Date.now()
      }
    });

    const writeStart = Date.now();
    const savedDoc = await testData.save();
    const writeTime = Date.now() - writeStart;
    
    console.log(`✅ Escritura exitosa en ${writeTime}ms`);
    console.log('   Document ID:', savedDoc._id);

    // 4. Test de lectura
    console.log('\n📖 Probando operación de lectura...');
    const readStart = Date.now();
    const foundDoc = await HealthData.findById(savedDoc._id);
    const readTime = Date.now() - readStart;
    
    console.log(`✅ Lectura exitosa en ${readTime}ms`);
    console.log('   Device ID leído:', foundDoc.deviceId);

    // 5. Limpieza
    console.log('\n🧹 Limpiando datos de prueba...');
    await HealthData.deleteOne({ _id: savedDoc._id });
    console.log('✅ Documento de prueba eliminado');

    // 6. Estadísticas de colección
    console.log('\n📊 Estadísticas de la colección:');
    const totalDocs = await HealthData.countDocuments();
    console.log('   Total documentos:', totalDocs);

    if (totalDocs > 0) {
      const latestDoc = await HealthData.findOne().sort({ timestamp: -1 });
      console.log('   Documento más reciente:', {
        id: latestDoc._id,
        deviceId: latestDoc.deviceId,
        timestamp: latestDoc.timestamp
      });
    }

    console.log('\n🎉 TODAS LAS PRUEBAS PASARON - MongoDB funcionando correctamente');
    
  } catch (error) {
    console.error('\n❌ ERROR EN PRUEBA DE CONEXIÓN:');
    console.error('   Tipo:', error.name);
    console.error('   Mensaje:', error.message);
    
    if (error.message.includes('timeout')) {
      console.error('\n⏰ DIAGNÓSTICO TIMEOUT:');
      console.error('   - Verificar que el cluster de MongoDB Atlas esté activo');
      console.error('   - Revisar Network Access List (whitelist IP)');
      console.error('   - Verificar conectividad de red');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n🌐 DIAGNÓSTICO DNS/CONECTIVIDAD:');
      console.error('   - Host no encontrado en MONGO_URL');
      console.error('   - Verificar formato de connection string');
      console.error('   - Revisar configuración de DNS');
    }
    
    if (error.message.includes('authentication failed')) {
      console.error('\n🔐 DIAGNÓSTICO AUTENTICACIÓN:');
      console.error('   - Usuario/contraseña incorrectos');
      console.error('   - Usuario no tiene permisos en la base de datos');
      console.error('   - Verificar credenciales en MongoDB Atlas');
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  }
}

// Ejecutar el test
testMongoConnection();