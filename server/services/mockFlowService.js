/**
 * Mock Flow Service para desarrollo
 * Simula las respuestas de Flow cuando las credenciales no están disponibles
 */

class MockFlowService {
  constructor() {
    this.isEnabled = false;
    console.warn('⚠️ Using Mock Flow Service - payments will be simulated');
  }

  async createPayment(paymentData) {
    console.log('🎭 Mock Flow: Creating simulated payment...', {
      commerceOrder: paymentData.commerceOrder,
      amount: paymentData.amount,
      email: paymentData.email
    });
    
    // Simular demora de API real
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retornar respuesta simulada
    return {
      success: true,
      token: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: `http://localhost:3000/mock-payment/${paymentData.commerceOrder}`,
      flowOrder: `mock_order_${Date.now()}`,
      isMock: true
    };
  }

  async getPaymentStatus(token) {
    console.log('🎭 Mock Flow: Getting simulated payment status for token:', token);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simular pago exitoso
    return {
      success: true,
      status: 2, // Flow status: 2 = paid
      paymentData: {
        commerceOrder: token.replace('mock_token_', '').split('_')[0],
        amount: 50000,
        currency: 'CLP',
        status: 2,
        subject: 'Mock Payment Test',
        paymentId: Date.now(),
        paymentMethod: 'mock_webpay'
      },
      isMock: true
    };
  }

  validateConfirmation(data) {
    console.log('🎭 Mock Flow: Validating confirmation (always true for mock):', data);
    return true; // Mock always validates
  }

  generateSignature(params) {
    // Generar firma mock (no válida para Flow real)
    return 'mock_signature_' + JSON.stringify(params).length;
  }
}

module.exports = MockFlowService;