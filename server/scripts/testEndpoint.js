const axios = require('axios');

console.log('📱 Android App Simulator - POST /api/health/data Test');
console.log('====================================================');

// Configurar la URL base del servidor
const BASE_URL = process.env.API_URL || 'http://localhost:5001';
const ENDPOINT = `${BASE_URL}/api/health/data`;

console.log('🎯 Target endpoint:', ENDPOINT);

// Datos de ejemplo que enviaría una app Android
const sampleHealthData = [
  {
    deviceId: 'ANDROID_DEVICE_001',
    timestamp: new Date(),
    data: {
      heartRate: 72,
      bloodPressure: {
        systolic: 120,
        diastolic: 80
      },
      oxygenSaturation: 98,
      temperature: 36.5,
      steps: 8543,
      appVersion: '1.0.0',
      platform: 'Android'
    }
  },
  {
    deviceId: 'ANDROID_DEVICE_002', 
    timestamp: new Date(Date.now() - 60000), // 1 minuto atrás
    data: {
      heartRate: 68,
      bloodPressure: {
        systolic: 118,
        diastolic: 78
      },
      oxygenSaturation: 99,
      temperature: 36.3,
      steps: 12450,
      sleepHours: 7.5,
      appVersion: '1.0.0',
      platform: 'Android'
    }
  },
  {
    deviceId: 'ANDROID_DEVICE_003',
    timestamp: new Date(),
    data: {
      heartRate: 75,
      bloodPressure: {
        systolic: 125,
        diastolic: 85
      },
      oxygenSaturation: 97,
      temperature: 36.8,
      steps: 6789,
      weight: 70.5,
      height: 175,
      bmi: 23.0,
      appVersion: '1.0.0',
      platform: 'Android'
    }
  }
];

async function testSinglePost(data, testNumber) {
  const startTime = Date.now();
  
  try {
    console.log(`\n🧪 Test #${testNumber} - Device: ${data.deviceId}`);
    console.log(`📊 Datos a enviar:`, JSON.stringify(data, null, 2));
    
    const response = await axios.post(ENDPOINT, data, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Siempresalud-Android/1.0.0',
        'X-Requested-With': 'com.siempresalud.app'
      },
      timeout: 30000, // 30 segundos timeout
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Test #${testNumber} EXITOSO en ${duration}ms`);
    console.log(`📝 Respuesta del servidor:`, {
      status: response.status,
      data_id: response.data.data_id,
      message: response.data.message,
      debug: response.data.debug
    });
    
    return { success: true, duration, dataId: response.data.data_id };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`❌ Test #${testNumber} FALLÓ después de ${duration}ms`);
    
    if (error.response) {
      console.error(`🛑 Error del servidor:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      console.error(`🌐 Error de red/timeout:`, {
        code: error.code,
        message: error.message,
        timeout: error.code === 'ECONNABORTED'
      });
    } else {
      console.error(`⚠️ Error de configuración:`, error.message);
    }
    
    return { success: false, duration, error: error.message };
  }
}

async function testConcurrentPosts() {
  console.log('🚀 Iniciando pruebas concurrentes...');
  const startTime = Date.now();
  
  try {
    const promises = sampleHealthData.map((data, index) => 
      testSinglePost(data, index + 1)
    );
    
    const results = await Promise.allSettled(promises);
    const totalDuration = Date.now() - startTime;
    
    console.log('\n📈 RESUMEN DE PRUEBAS CONCURRENTES:');
    console.log('=====================================');
    console.log(`⏱️ Tiempo total: ${totalDuration}ms`);
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;
    
    console.log(`✅ Exitosos: ${successful}/${results.length}`);
    console.log(`❌ Fallidos: ${failed}/${results.length}`);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { success, duration, dataId, error } = result.value;
        if (success) {
          console.log(`  Test ${index + 1}: ✅ ${duration}ms (ID: ${dataId})`);
        } else {
          console.log(`  Test ${index + 1}: ❌ ${duration}ms (Error: ${error})`);
        }
      } else {
        console.log(`  Test ${index + 1}: ❌ Promise rejected: ${result.reason}`);
      }
    });
    
    if (failed > 0) {
      console.log('\n🔍 DIAGNÓSTICO DE FALLOS:');
      if (failed === results.length) {
        console.log('   ⚠️ TODOS los tests fallaron - problema crítico del servidor');
      } else {
        console.log('   ⚠️ Fallos parciales - posible problema de concurrencia/recursos');
      }
    }
    
  } catch (error) {
    console.error('\n💥 Error en pruebas concurrentes:', error.message);
  }
}

async function testSequentialPosts() {
  console.log('\n🔄 Iniciando pruebas secuenciales...');
  const results = [];
  
  for (let i = 0; i < sampleHealthData.length; i++) {
    const result = await testSinglePost(sampleHealthData[i], i + 1);
    results.push(result);
    
    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 RESUMEN DE PRUEBAS SECUENCIALES:');
  console.log('=====================================');
  
  const successful = results.filter(r => r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  console.log(`✅ Exitosos: ${successful}/${results.length}`);
  console.log(`⏱️ Duración promedio: ${Math.round(avgDuration)}ms`);
  
  if (successful < results.length) {
    console.log('\n🔍 ANÁLISIS DE FALLOS SECUENCIALES:');
    console.log('   - Si fallan en secuencia: problema de conexión/configuración');
    console.log('   - Si algunos funcionan: problema de concurrencia/recursos');
  }
}

async function runAllTests() {
  console.log(`🕐 Iniciando tests a las ${new Date().toLocaleString()}`);
  console.log(`🌐 Verificando conectividad al servidor...`);
  
  try {
    // Primero verificar que el servidor esté running
    const healthCheck = await axios.get(`${BASE_URL}/api/health/status`, { timeout: 5000 });
    console.log(`✅ Servidor funcionando:`, healthCheck.data.status);
    
    // Verificar MongoDB health check
    try {
      const mongoCheck = await axios.get(`${BASE_URL}/api/health/mongodb`, { timeout: 10000 });
      console.log(`✅ MongoDB health:`, mongoCheck.data.healthy ? 'HEALTHY' : 'UNHEALTHY');
      if (mongoCheck.data.test) {
        console.log(`📊 MongoDB test duration: ${mongoCheck.data.test.duration}`);
      }
    } catch (mongoError) {
      console.error(`❌ MongoDB health check falló:`, mongoError.response?.data || mongoError.message);
      console.log(`⚠️ Continuando con tests del endpoint principal...`);
    }
    
  } catch (serverError) {
    console.error(`❌ No se puede conectar al servidor:`, serverError.message);
    console.log('🔍 Verificar que el servidor esté ejecutándose en puerto 5001');
    process.exit(1);
  }
  
  // Ejecutar tests
  console.log('\n🎯 EJECUTANDO TESTS DEL ENDPOINT POST /api/health/data');
  console.log('==================================================');
  
  await testSequentialPosts();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Pausa entre tipos de test
  await testConcurrentPosts();
  
  console.log('\n🏁 Tests completados');
}

// Ejecutar todos los tests
runAllTests().catch(error => {
  console.error('\n💥 Error fatal en tests:', error);
  process.exit(1);
});