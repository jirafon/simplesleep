const crypto = require('crypto-js');
const axios = require('axios');
const MockFlowService = require('./mockFlowService');

class FlowService {
  constructor() {
    this.runtimeEnvironment = process.env.NODE_ENV || 'development';
    this.flowEnvironment = this.resolveFlowEnvironment();
    this.apiKey = process.env.FLOW_API_KEY;
    this.secretKey = process.env.FLOW_SECRET_KEY;
    this.baseUrl = this.resolveBaseUrl();
    this.environment = this.flowEnvironment;
    
    // Verificar si las credenciales están disponibles
    this.isConfigured = !!(this.apiKey && this.secretKey);
    
    if (!this.isConfigured) {
      console.warn('⚠️ Flow API credentials not configured. Using Mock Flow Service for development.');
      console.warn('   To use real Flow: Set FLOW_API_KEY and FLOW_SECRET_KEY in .env');
      this.mockService = new MockFlowService();
    } else {
      console.log('✅ Flow API credentials configured for', this.flowEnvironment, 'using', this.baseUrl);
    }
  }

  resolveFlowEnvironment() {
    const rawFlowEnv = process.env.FLOW_ENV?.trim().toLowerCase();

    if (rawFlowEnv === 'production' || rawFlowEnv === 'sandbox') {
      return rawFlowEnv;
    }

    if (this.runtimeEnvironment === 'production') {
      return 'production';
    }

    return 'sandbox';
  }

  resolveBaseUrl() {
    const configuredBaseUrl = process.env.FLOW_BASE_URL?.trim();

    if (this.flowEnvironment === 'production') {
      return 'https://www.flow.cl/api';
    }

    if (this.flowEnvironment === 'sandbox') {
      return 'https://sandbox.flow.cl/api';
    }

    return configuredBaseUrl || 'https://sandbox.flow.cl/api';
  }

  /**
   * Determina si debe usar el servicio mock
   */
  shouldUseMock() {
    return !this.isConfigured && this.runtimeEnvironment === 'development';
  }

  /**
   * Genera la firma para Flow
   * @param {Object} params - Parámetros de la solicitud
   * @returns {string} Firma HMAC SHA256
   */
  generateSignature(params) {
    // Ordenar parámetros alfabéticamente
    const sortedParams = {};
    Object.keys(params).sort().forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        sortedParams[key] = params[key];
      }
    });

    // Flow requiere concatenar clave+valor sin separadores.
    const stringToSign = Object.keys(sortedParams)
      .map(key => `${key}${sortedParams[key]}`)
      .join('');

    // Generar HMAC SHA256
    return crypto.HmacSHA256(stringToSign, this.secretKey).toString();
  }

  /**
   * Crear un pago en Flow
   * @param {Object} paymentData - Datos del pago
   * @returns {Object} Respuesta de Flow con URL de pago
   */
  async createPayment(paymentData) {
    // Usar mock service si no está configurado
    if (this.shouldUseMock()) {
      console.log('🎭 Using Mock Flow Service for payment creation');
      return await this.mockService.createPayment(paymentData);
    }
    
    try {
      const {
        commerceOrder,
        subject,
        amount,
        email,
        urlConfirmation,
        urlReturn,
        currency = 'CLP',
        taxes = 0
      } = paymentData;

      // Parámetros para Flow
      const params = {
        apiKey: this.apiKey,
        commerceOrder: commerceOrder.toString(),
        subject: subject.substring(0, 255), // Flow limita a 255 caracteres
        currency,
        amount: parseInt(amount),
        email,
        urlConfirmation,
        urlReturn,
        taxes: parseInt(taxes)
      };

      // Generar firma
      params.s = this.generateSignature(params);

      // Realizar petición a Flow
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/payment/create`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: new URLSearchParams(params).toString()
      });

      const result = response.data;
      
      if (!result.url || !result.token) {
        return {
          success: false,
          error: result.message || 'Unexpected Flow response',
          errorCode: result.code,
          errorStatus: response.status
        };
      }

      return {
        success: true,
        token: result.token,
        url: result.url + '?token=' + result.token,
        flowOrder: result.flowOrder
      };

    } catch (error) {
      console.error('Error creating Flow payment:', error);
      const flowError = error.response?.data;
      return {
        success: false,
        error: flowError?.message || error.message,
        errorCode: flowError?.code,
        errorStatus: error.response?.status
      };
    }
  }

  /**
   * Confirmar un pago desde Flow
   * @param {string} token - Token de confirmación de Flow
   * @returns {Object} Información del pago confirmado
   */
  async getPaymentStatus(token) {
    // Usar mock service si no está configurado
    if (this.shouldUseMock()) {
      console.log('🎭 Using Mock Flow Service for payment status');
      return await this.mockService.getPaymentStatus(token);
    }
    
    try {
      const params = {
        apiKey: this.apiKey,
        token
      };

      // Generar firma
      params.s = this.generateSignature(params);

      // Realizar petición a Flow
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/payment/getStatus`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: new URLSearchParams(params).toString()
      });

      const result = response.data;

      if (result.status !== 1) {
        throw new Error(`Flow Error: ${result.message || 'Unknown error'}`);
      }

      return {
        success: true,
        paymentStatus: result.status === 2 ? 'completed' : 'pending',
        amount: result.amount,
        currency: result.currency,
        commerceOrder: result.commerceOrder,
        flowOrder: result.flowOrder,
        requestDate: result.requestDate,
        confirmationDate: result.confirmationDate,
        paymentMethod: result.paymentMethod,
        paymentData: result
      };

    } catch (error) {
      console.error('Error getting Flow payment status:', error);
      const flowError = error.response?.data;
      return {
        success: false,
        error: flowError?.message || error.message,
        errorCode: flowError?.code,
        errorStatus: error.response?.status
      };
    }
  }

  /**
   * Confirmation webhook from Flow
   * @param {Object} params - Parámetros recibidos del webhook
   * @returns {boolean} True si la confirmación es válida
   */
  validateConfirmation(params) {
    // Usar mock service si no está configurado
    if (this.shouldUseMock()) {
      console.log('🎭 Using Mock Flow Service for confirmation validation');
      return this.mockService.validateConfirmation(params);
    }
    
    try {
      const { s: receivedSignature, ...dataParams } = params;
      
      if (!receivedSignature) {
        return false;
      }

      const expectedSignature = this.generateSignature(dataParams);
      return receivedSignature === expectedSignature;
    } catch (error) {
      console.error('Error validating Flow confirmation:', error);
      return false;
    }
  }

  /**
   * Calcular el total con IVA (19% en Chile)
   * @param {number} amount - Monto base
   * @returns {Object} Desglose de precios
   */
  calculateTaxes(amount) {
    const baseAmount = parseInt(amount);
    const taxRate = 0.19; // IVA 19%
    const taxes = Math.round(baseAmount * taxRate);
    const totalAmount = baseAmount + taxes;

    return {
      baseAmount,
      taxes,
      totalAmount,
      currency: 'CLP'
    };
  }
}

module.exports = new FlowService();