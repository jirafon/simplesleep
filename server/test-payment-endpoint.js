const axios = require('axios');

console.log('🧪 Testing /api/payments/create endpoint directly...');

async function testPaymentsEndpoint() {
  const BASE_URL = 'http://localhost:5001';
  
  try {
    // Primero verificar que el servidor esté funcionando
    console.log('🔍 Checking if server is running...');
    const healthCheck = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    console.log('✅ Server status:', healthCheck.data.status);
    
    // Verificar configuración de Flow
    console.log('🔧 Checking Flow configuration...');
    const configCheck = await axios.get(`${BASE_URL}/api/payments/test-config`, { 
      timeout: 10000,
      headers: {
        'Authorization': 'Bearer dummy_token_for_testing'
      }
    });
    console.log('📋 Flow config:', configCheck.data);
    
    // Test del endpoint de payments directamente
    console.log('💳 Testing payment creation endpoint...');
    const paymentTest = await axios.post(`${BASE_URL}/api/payments/create`, {
      orderId: '507f1f77bcf86cd799439011' // ObjectId ficticio para test
    }, {
      timeout: 10000,
      headers: {
        'Authorization': 'Bearer dummy_token_for_testing',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Payment test successful:', {
      status: paymentTest.status,
      data: paymentTest.data
    });
    
  } catch (error) {
    console.error('❌ Test failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText, 
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    if (error.response?.status === 500) {
      console.log('🚨 500 Error confirmed - this matches the reported issue');
      console.log('📋 Server error details:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Server not running - need to start server first');
    }
  }
}

testPaymentsEndpoint();