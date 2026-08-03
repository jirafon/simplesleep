/**
 * Diagnóstico de Configuración del Cliente
 * 
 * Este archivo te muestra exactamente a dónde está apuntando tu frontend.
 * Cópialo y pégalo en la consola del navegador cuando abras tu app en Render.
 */

console.log('\n🔍 ========== DIAGNÓSTICO DE CONFIGURACIÓN ==========\n');

// 1. Información del entorno
console.log('📍 INFORMACIÓN DEL ENTORNO:');
console.log('   URL actual:', window.location.href);
console.log('   Hostname:', window.location.hostname);
console.log('   Protocol:', window.location.protocol);
console.log('   Port:', window.location.port || 'default');
console.log('   NODE_ENV:', process.env.NODE_ENV);

// 2. Variables de entorno React
console.log('\n📍 VARIABLES DE ENTORNO REACT:');
console.log('   REACT_APP_BASE_URL:', process.env.REACT_APP_BASE_URL || 'NOT SET ⚠️');
console.log('   PUBLIC_URL:', process.env.PUBLIC_URL || 'NOT SET');

// 3. Configuración de API detectada
console.log('\n📍 CONFIGURACIÓN DE API:');
try {
  // Simular lo que hace getApiBaseUrl
  const explicitUrl = process.env.REACT_APP_BASE_URL;
  
  if (explicitUrl) {
    console.log('   Modo: SEPARATE SERVICES ✅');
    console.log('   Base URL:', explicitUrl);
    console.log('   Ejemplo API call:', explicitUrl + '/api/auth/login');
  } else {
    console.log('   Modo: SAME DOMAIN ✅');
    console.log('   Base URL: (relative paths)');
    console.log('   Ejemplo API call:', '/api/auth/login');
    console.log('   Resolverá a:', window.location.origin + '/api/auth/login');
  }
} catch (e) {
  console.error('   Error detectando configuración:', e.message);
}

// 4. Prueba de conectividad
console.log('\n📍 PRUEBA DE CONECTIVIDAD:');
console.log('   Probando endpoints...');

const testEndpoints = [
  '/health',
  '/api',
  '/api/auth/login',
  'https://siempresalud-server.onrender.com/health',
  'https://siempresalud-server.onrender.com/api'
];

async function testConnectivity() {
  for (const endpoint of testEndpoints) {
    try {
      console.log(`\n   Testing: ${endpoint}`);
      const response = await fetch(endpoint, { 
        method: endpoint.includes('login') ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: endpoint.includes('login') ? JSON.stringify({email:'test',password:'test'}) : undefined
      });
      console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
      
      const text = await response.text();
      if (text) {
        try {
          const json = JSON.parse(text);
          console.log(`   📦 Response:`, json);
        } catch {
          console.log(`   📦 Response (text):`, text.substring(0, 100));
        }
      }
    } catch (error) {
      console.error(`   ❌ Error:`, error.message);
    }
  }
}

// Ejecutar pruebas
testConnectivity().then(() => {
  console.log('\n🔍 ========== FIN DEL DIAGNÓSTICO ==========\n');
  console.log('📋 INTERPRETACIÓN:');
  console.log('');
  console.log('Si REACT_APP_BASE_URL = NOT SET:');
  console.log('  → El frontend usa URLs relativas');
  console.log('  → Las llamadas van a: ' + window.location.origin + '/api/...');
  console.log('  → Correcto para OPCIÓN A (un solo servicio)');
  console.log('');
  console.log('Si REACT_APP_BASE_URL = https://siempresalud-server.onrender.com:');
  console.log('  → El frontend usa URLs absolutas');
  console.log('  → Las llamadas van a: https://siempresalud-server.onrender.com/api/...');
  console.log('  → Se usa para OPCIÓN B (servicios separados)');
  console.log('');
  console.log('Si /health responde con 404 o error:');
  console.log('  → El servidor no está funcionando o no está en esa URL');
  console.log('');
  console.log('Si /health responde con 200:');
  console.log('  → ✅ El servidor está funcionando correctamente');
});
