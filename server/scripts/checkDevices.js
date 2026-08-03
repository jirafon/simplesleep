const mongoose = require('mongoose');
const HealthData = require('../models/HealthData');
require('dotenv').config();

async function checkDevices() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/siempresalud');
    console.log('✅ Conectado a MongoDB\n');
    
    console.log('📊 ANÁLISIS DE DISPOSITIVOS EN MONGODB');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Obtener todos los dispositivos únicos
    const devices = await HealthData.distinct('deviceId');
    console.log('🔍 Dispositivos encontrados:', devices);
    console.log('📊 Total de dispositivos:', devices.length, '\n');
    
    if (devices.length === 0) {
      console.log('⚠️  No se encontraron dispositivos en la base de datos');
      mongoose.connection.close();
      return;
    }
    
    // Analizar cada dispositivo
    for (const deviceId of devices) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📱 DISPOSITIVO:', deviceId);
      
      const count = await HealthData.countDocuments({ deviceId });
      const latestRecord = await HealthData.findOne({ deviceId }).sort({ timestamp: -1 });
      const oldestRecord = await HealthData.findOne({ deviceId }).sort({ timestamp: 1 });
      
      console.log('   📈 Total registros:', count);
      
      if (latestRecord) {
        console.log('   🕐 Último registro:', new Date(latestRecord.timestamp).toLocaleString('es-CL'));
        console.log('   🕐 Primer registro:', new Date(oldestRecord.timestamp).toLocaleString('es-CL'));
        
        // Mostrar tipos de datos disponibles
        if (latestRecord.data) {
          const dataKeys = Object.keys(latestRecord.data);
          console.log('   🔑 Tipos de datos (' + dataKeys.length + '):', dataKeys.join(', '));
          
          // Mostrar muestra de datos para identificar si son demo o reales
          console.log('   📊 Muestra de datos del último registro:');
          let count = 0;
          for (const [key, value] of Object.entries(latestRecord.data)) {
            console.log('       -', key + ':', value);
            count++;
            if (count >= 3) break; // Solo mostrar primeros 3 campos
          }
        }
        
        // Verificar si parece data de demo (valores muy regulares, nombres obvios, etc.)
        const isLikelyDemo = deviceId.includes('DEMO') || 
                           deviceId.includes('TEST') || 
                           (latestRecord.data && 
                            JSON.stringify(latestRecord.data).includes('demo'));
        
        console.log('   🎭 ¿Parece demo?:', isLikelyDemo ? 'SÍ' : 'NO');
        
        // Verificar actividad reciente
        const recentCount = await HealthData.countDocuments({
          deviceId,
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        console.log('   ⏱️  Registros últimas 24h:', recentCount);
        
      } else {
        console.log('   ⚠️  Sin registros encontrados');
      }
      console.log('');
    }
    
    // Estadísticas generales
    console.log('📊 ESTADÍSTICAS GENERALES:');
    const totalRecords = await HealthData.countDocuments();
    console.log('   Total registros en BD:', totalRecords);
    
    const recentRecords = await HealthData.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    console.log('   Registros últimas 24h:', recentRecords);
    
    const recentDevices = await HealthData.aggregate([
      { $match: { timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
      { $group: { _id: '$deviceId' } }
    ]);
    console.log('   Dispositivos activos últimas 24h:', recentDevices.map(d => d._id));
    
    mongoose.connection.close();
    console.log('\n✅ Análisis completado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
}

checkDevices();