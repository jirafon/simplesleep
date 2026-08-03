#!/usr/bin/env node

/**
 * Script para probar el envío de datos biométricos al backend
 * Simula datos de ejemplo de diferentes dispositivos médicos
 */

const axios = require('axios');

// Configuración del servidor
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const API_ENDPOINT = `${BASE_URL}/api/health/data`;

// Datos de ejemplo para diferentes dispositivos
const testData = [
  {
    deviceId: "DEVICE_001",
    timestamp: new Date().toISOString(),
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
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutos atrás
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
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutos atrás
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
    timestamp: new Date(Date.now() - 480 * 60 * 1000).toISOString(), // 8 horas atrás (datos de la noche)
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
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
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
      last_sync: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  },
  {
    deviceId: "DEVICE_001",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutos atrás
    data: {
      temperatura_corporal: 36.7,
      frecuencia_cardiaca: 68,
      saturacion_oxigeno: 99,
      presion_arterial_sistolica: 115,
      presion_arterial_diastolica: 75,
      estado_dispositivo: "normal",
      bateria: 83,
      ubicacion: "consultorio_2"
    }
  },
  {
    deviceId: "SLEEP_TRACKER_001",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hora atrás (siesta)
    data: {
      nap_duration: 25, // siesta de 25 minutos
      nap_quality: "buena",
      heart_rate_avg_nap: 65,
      sleep_stage: "ligero",
      bateria: 43,
      room_temperature: 24.0,
      noise_level: "bajo"
    }
  }
];

async function enviarDatosPrueba() {
  console.log('🔄 Iniciando envío de datos biométricos de prueba...\n');
  console.log(`📡 Endpoint: ${API_ENDPOINT}\n`);

  for (let i = 0; i < testData.length; i++) {
    const data = testData[i];
    
    try {
      console.log(`📤 Enviando datos ${i + 1}/${testData.length}:`);
      console.log(`   Dispositivo: ${data.deviceId}`);
      console.log(`   Timestamp: ${data.timestamp}`);
      console.log(`   Datos: ${Object.keys(data.data).length} parámetros`);
      
      const response = await axios.post(API_ENDPOINT, data, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log(`✅ Respuesta exitosa:`, response.data);
      console.log('---');
      
    } catch (error) {
      console.error(`❌ Error enviando datos ${i + 1}:`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.error(`   Error: ${error.message}`);
      }
      console.log('---');
    }

    // Pausa de 1 segundo entre envíos
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🏁 Envío de datos biométricos completado.');
  
  // Probar obtener datos de dispositivos
  console.log('\n📋 Verificando datos guardados...');
  const devicesToCheck = ['DEVICE_001', 'SLEEP_TRACKER_001', 'WEARABLE_001'];
  
  for (const deviceId of devicesToCheck) {
    try {
      const response = await axios.get(`${BASE_URL}/api/health/devices/${deviceId}`);
      console.log(`✅ Datos obtenidos del ${deviceId}:`, {
        totalRegistros: response.data.data.length,
        ultimoRegistro: response.data.data[0]?.timestamp,
        tiposDatos: response.data.data[0] ? Object.keys(response.data.data[0].data) : []
      });
    } catch (error) {
      console.error(`❌ Error obteniendo datos de ${deviceId}:`, error.message);
    }
  }
}

// Función para verificar estado del servidor
async function verificarServidor() {
  try {
    console.log('🔍 Verificando estado del servidor...');
    const response = await axios.get(`${BASE_URL}/api/health/status`, {
      timeout: 5000
    });
    console.log('✅ Servidor activo:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Servidor no disponible:', error.message);
    console.error('   Asegúrate de que el servidor esté ejecutándose en:', BASE_URL);
    return false;
  }
}

// Ejecutar el script
async function main() {
  console.log('🚀 Script de prueba de datos biométricos\n');
  
  const servidorActivo = await verificarServidor();
  if (!servidorActivo) {
    process.exit(1);
  }
  
  await enviarDatosPrueba();
}

// Ejecutar si el archivo se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { enviarDatosPrueba, verificarServidor };