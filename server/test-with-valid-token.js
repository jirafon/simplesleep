const jwt = require('jsonwebtoken');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔧 Creating valid JWT token for testing...');

async function createValidTokenAndTest() {
  try {
    // CONECTAR A MONGODB PRIMERO
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB successfully');
    
    // PASO 1: Crear un usuario real en MongoDB para las pruebas
    console.log('👤 Creating test user in database...');
    
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    // Borrar usuario de prueba si existe
    await User.deleteOne({ email: 'test@siempresalud.com' });
    
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('TestPassword123', 12);
    const testUser = new User({
      name: 'Usuario de Prueba',
      email: 'test@siempresalud.com', 
      password: hashedPassword,
      isVerified: true
    });
    
    const savedUser = await testUser.save();
    console.log('✅ Test user created with ID:', savedUser._id);

    // PASO 2: Crear token JWT válido usando userId (no id)
    const tokenPayload = {
      userId: savedUser._id.toString(), // Usar userId que es lo que busca el middleware
      email: savedUser.email,
      name: savedUser.name
    };
    
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('🎫 Generated valid JWT token for real user');
    
    const BASE_URL = 'http://localhost:5001';
    
    // Test del endpoint de Flow configuration
    console.log('\n🔧 Testing Flow configuration...');
    const configResponse = await axios.get(`${BASE_URL}/api/payments/test-config`, { 
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('📋 Flow Configuration:', {
      isReady: configResponse.data.isReady,
      recommendations: configResponse.data.recommendations,
      flowCredentials: configResponse.data.config.flowCredentials,
      urls: configResponse.data.config.urls
    });
    
    // Crear una orden ficticia primero
    console.log('\n📦 Creating test order...');
    const orderResponse = await axios.post(`${BASE_URL}/api/orders/create`, {
      type: 'custom',
      exams: [
        { name: 'Test Exam 1', quantity: 1 },
        { name: 'Test Exam 2', quantity: 1 }
      ],
      notes: 'Orden de prueba para testing de pagos'
    }, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const orderId = orderResponse.data.order._id;
    console.log('✅ Test order created:', orderId);
    
    // Ahora probar el endpoint de payments
    console.log('\n💳 Testing payment creation with real order...');
    const paymentResponse = await axios.post(`${BASE_URL}/api/payments/create`, {
      orderId: orderId
    }, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Payment creation successful!', {
      success: paymentResponse.data.success,
      paymentId: paymentResponse.data.payment?.id,
      paymentUrl: paymentResponse.data.payment?.paymentUrl,
      isMock: paymentResponse.data.payment?.isMock,
      message: paymentResponse.data.message
    });
    
    if (paymentResponse.data.payment?.isMock) {
      console.log('🎭 Using Mock Flow Service (expected in development)');
      console.log('🎯 To use real Flow: Configure FLOW_API_KEY and FLOW_SECRET_KEY in .env');
    }
    
  } catch (error) {
    console.error('\n❌ Error occurred:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorMessage: error.response?.data?.message,
      debugInfo: error.response?.data?.debug,
      fullError: error.response?.data
    });
    
    if (error.response?.status === 500) {
      console.log('\n🚨 500 ERROR REPRODUCED! This matches the reported issue.');
      console.log('📋 Server error details:', JSON.stringify(error.response.data, null, 2));
      
      // Análisis específico del error
      if (error.response.data.debug?.errorType) {
        console.log('🔍 Error analysis:', {
          type: error.response.data.debug.errorType,
          message: error.response.data.debug.errorMessage,
          requestId: error.response.data.debug.requestId
        });
      }
    }
    
    if (error.response?.status === 404) {
      console.log('\n📋 Order not found - this is expected if using fictional orderId');
    }
    
    return false;
  } finally {
    // Limpiar: cerrar conexión MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
  
  console.log('\n🎉 All tests completed successfully!');
  return true;
}

// Ejecutar tests
createValidTokenAndTest()
  .then(success => {
    if (success) {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error.message);
    process.exit(1);
  });