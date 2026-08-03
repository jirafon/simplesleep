#!/usr/bin/env node

/**
 * Script para generar datos biométricos de demo directamente en MongoDB
 */

const mongoose = require('mongoose');
const HealthData = require('../models/HealthData');
require('dotenv').config();

async function generateBiometricData() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/siempresalud');
    console.log('✅ Conectado a MongoDB\n');
    
    console.log('🧪 Generando datos biométricos de demo...\n');
    
    // Limpiar datos anteriores (opcional)
    await HealthData.deleteMany({});
    console.log('🗑️  Datos anteriores limpiados');
    
    // Datos de ejemplo para diferentes dispositivos
    const testData = [
      {
        deviceId: "DEVICE_001",
        timestamp: new Date(),
        data: {
          temperatura_corporal: 36.5,
          frecuencia_cardiaca: 72,
          saturacion_oxigeno: 98,
          presion_arterial_sistolica: 120,
          presion_arterial_diastolica: 80,
          estado_dispositivo: "normal",
          bateria: 85,
          ubicacion: "consultorio_1"
        }
      },
      {
        deviceId: "OXIMETRO_001", 
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
        data: {
          saturacion_oxigeno: 97,
          frecuencia_cardiaca: 75,
          perfusion_index: 2.1,
          temperatura: 36.3,
          estado_sensor: "activo",
          calidad_señal: "excelente",
          bateria: 92
        }
      },
      {
        deviceId: "TENSIOMETRO_001",
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutos atrás
        data: {
          presion_sistolica: 118,
          presion_diastolica: 78,
          frecuencia_cardiaca: 69,
          presion_arterial_media: 91,
          clasificacion: "normal",
          fecha_calibracion: "2026-04-01",
          bateria: 78
        }
      },
      {
        deviceId: "SLEEP_TRACKER_001",
        timestamp: new Date(Date.now() - 480 * 60 * 1000), // 8 horas atrás (datos de la noche)
        data: {
          sleep_duration_total: 450, // 7h 30m en minutos
          sleep_duration_deep: 120,  // 2h sueño profundo
          sleep_duration_light: 240, // 4h sueño ligero
          sleep_duration_rem: 90,    // 1h 30m fase REM
          sleep_quality_score: 85,
          sleep_interruptions: 2,
          heart_rate_avg_sleep: 58,
          heart_rate_min_sleep: 48,
          heart_rate_max_sleep: 75,
          temperatura_ambiente: 22.5,
          bateria: 45,
          sleep_efficiency: 92
        }
      },
      {
        deviceId: "WEARABLE_001",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        data: {
          steps_today: 8542,
          calories_burned: 320,
          distance_km: 6.2,
          active_minutes: 45,
          frecuencia_cardiaca: 78,
          stress_level: "bajo",
          bateria: 65,
          temperatura_corporal: 36.4,
          hydration_reminder: true,
          last_sync: new Date(Date.now() - 15 * 60 * 1000)
        }
      },
      // Datos adicionales para DEVICE_001 (más registros históricos)
      {
        deviceId: "DEVICE_001",
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
        data: {
          temperatura_corporal: 36.7,
          frecuencia_cardiaca: 68,
          saturacion_oxigeno: 99,
          presion_arterial_sistolica: 115,
          presion_arterial_diastolica: 75,
          estado_dispositivo: "normal",
          bateria: 83,
          ubicacion: "consultorio_1"
        }
      },
      {
        deviceId: "DEVICE_001",
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hora atrás
        data: {
          temperatura_corporal: 36.2,
          frecuencia_cardiaca: 70,
          saturacion_oxigeno: 97,
          presion_arterial_sistolica: 122,
          presion_arterial_diastolica: 82,
          estado_dispositivo: "normal",
          bateria: 80,
          ubicacion: "consultorio_2"
        }
      },
      // Datos adicionales para OXIMETRO_001
      {
        deviceId: "OXIMETRO_001",
        timestamp: new Date(Date.now() - 120 * 60 * 1000), // 2 horas atrás
        data: {
          saturacion_oxigeno: 96,
          frecuencia_cardiaca: 73,
          perfusion_index: 1.8,
          temperatura: 36.1,
          estado_sensor: "activo",
          calidad_señal: "buena",
          bateria: 89
        }
      },
      // Datos adicionales para WEARABLE_001 (actividad durante el día)
      {
        deviceId: "WEARABLE_001",
        timestamp: new Date(Date.now() - 180 * 60 * 1000), // 3 horas atrás
        data: {
          steps_today: 6200,
          calories_burned: 250,
          distance_km: 4.5,
          active_minutes: 32,
          frecuencia_cardiaca: 82,
          stress_level: "medio",
          bateria: 70,
          temperatura_corporal: 36.6,
          hydration_reminder: false,
          last_sync: new Date(Date.now() - 180 * 60 * 1000)
        }
      }
    ];
    
    // Insertar datos en MongoDB
    const savedRecords = await HealthData.insertMany(testData);
    console.log(`✅ ${savedRecords.length} registros biométricos generados exitosamente\n`);
    
    // Mostrar resumen de dispositivos creados
    const devices = await HealthData.distinct('deviceId');
    console.log('📱 Dispositivos con datos generados:');
    
    for (const deviceId of devices) {
      const count = await HealthData.countDocuments({ deviceId });
      const latest = await HealthData.findOne({ deviceId }).sort({ timestamp: -1 });
      console.log(`   - ${deviceId}: ${count} registros, último: ${latest.timestamp.toLocaleString('es-CL')}`);
    }
    
    console.log('\n🎉 ¡Datos de demo generados! Ahora puedes ver los dispositivos en el frontend.');
    console.log('📝 Nota: Estos son datos de demostración para pruebas.');
    
    mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error generando datos:', error.message);
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
}

generateBiometricData();