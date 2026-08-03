const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const flowService = require('../services/flowService');
const { generateMedicalOrderPdf } = require('../services/orderPdfService');
const { sendOrderCompletedEmail } = require('../services/emailService');

function normalizeBaseUrl(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue.replace(/\/+$/, '');
}

function isLocalUrl(value) {
  if (!value) {
    return false;
  }

  return /localhost|127\.0\.0\.1/i.test(value);
}

function getRequestOrigin(req) {
  const forwardedProto = req.get('x-forwarded-proto');
  const protocol = (forwardedProto || req.protocol || 'https').split(',')[0].trim();
  const host = (req.get('x-forwarded-host') || req.get('host') || '').split(',')[0].trim();

  if (!host) {
    return null;
  }

  return `${protocol}://${host}`;
}

function pickPublicBaseUrl(candidates, { allowLocalhost = true } = {}) {
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeBaseUrl(candidate);

    if (!normalizedCandidate) {
      continue;
    }

    if (!allowLocalhost && isLocalUrl(normalizedCandidate)) {
      continue;
    }

    return normalizedCandidate;
  }

  return null;
}

function resolvePaymentBaseUrls(req) {
  const isProduction = process.env.NODE_ENV === 'production';
  const requestOrigin = getRequestOrigin(req);
  const backendUrl = pickPublicBaseUrl(
    [process.env.BACKEND_URL, process.env.SERVER_PUBLIC_URL, requestOrigin],
    { allowLocalhost: !isProduction }
  );
  const frontendUrl = pickPublicBaseUrl(
    [process.env.FRONTEND_URL, process.env.CLIENT_URL, requestOrigin, backendUrl],
    { allowLocalhost: !isProduction }
  );

  return {
    backendUrl,
    frontendUrl,
    requestOrigin
  };
}

function buildPaymentResultRedirectUrl(frontendUrl, paymentId, token) {
  const safeFrontendUrl = normalizeBaseUrl(frontendUrl);
  if (!safeFrontendUrl) {
    return null;
  }

  const resultUrl = new URL(`${safeFrontendUrl}/payment/result/${paymentId}`);
  if (token) {
    resultUrl.searchParams.set('token', token);
  }

  return resultUrl.toString();
}

/**
 * Test endpoint para verificar configuración de Flow
 * GET /api/payments/test-config
 */
router.get('/test-config', auth, async (req, res) => {
  try {
    console.log('🧪 Testing Flow configuration...');
    const resolvedUrls = resolvePaymentBaseUrls(req);
    
    const config = {
      environment: process.env.NODE_ENV || 'development',
      flowCredentials: {
        hasApiKey: !!process.env.FLOW_API_KEY,
        hasSecretKey: !!process.env.FLOW_SECRET_KEY,
        apiKeyLength: process.env.FLOW_API_KEY?.length || 0,
        secretKeyLength: process.env.FLOW_SECRET_KEY?.length || 0
      },
      urls: {
        backendUrl: process.env.BACKEND_URL || 'MISSING',
        frontendUrl: process.env.FRONTEND_URL || 'MISSING',
        hasBackendUrl: !!process.env.BACKEND_URL,
        hasFrontendUrl: !!process.env.FRONTEND_URL
      },
      resolvedUrls,
      flowService: {
        baseUrl: flowService.baseUrl || 'Unknown',
        environment: flowService.environment || 'Unknown'
      }
    };
    
    // Test básico de Flow Service
    let flowServiceTest = null;
    try {
      if (config.flowCredentials.hasApiKey && config.flowCredentials.hasSecretKey) {
        // Test de firma (no hace llamada real)
        const testParams = { test: 'value', apiKey: process.env.FLOW_API_KEY };
        const signature = flowService.generateSignature(testParams);
        flowServiceTest = {
          signatureGeneration: !!signature,
          signatureLength: signature?.length || 0
        };
      } else {
        flowServiceTest = {
          error: 'Flow credentials missing - cannot test signature'
        };
      }
    } catch (error) {
      flowServiceTest = {
        error: error.message
      };
    }
    
    console.log('🔍 Flow configuration check result:', config);
    
    res.json({
      message: 'Flow configuration test',
      config,
      flowServiceTest,
      recommendations: [
        !config.flowCredentials.hasApiKey ? 'Set FLOW_API_KEY environment variable' : null,
        !config.flowCredentials.hasSecretKey ? 'Set FLOW_SECRET_KEY environment variable' : null,
        !resolvedUrls.backendUrl ? 'Set BACKEND_URL or SERVER_PUBLIC_URL environment variable' : null,
        !resolvedUrls.frontendUrl ? 'Set FRONTEND_URL or CLIENT_URL environment variable' : null
      ].filter(Boolean),
      isReady: config.flowCredentials.hasApiKey && 
               config.flowCredentials.hasSecretKey && 
               !!resolvedUrls.backendUrl && 
               !!resolvedUrls.frontendUrl
    });
    
  } catch (error) {
    console.error('Error testing Flow configuration:', error);
    res.status(500).json({ 
      message: 'Error testing configuration',
      error: error.message 
    });
  }
});

/**
 * Calcular precio total de los exámenes seleccionados
 */
function calculateOrderTotal(exams) {
  const DEFAULT_ORDER_PRICE = 5990;

  let total = 0;
  const items = [];

  if (Array.isArray(exams)) {
    exams.forEach(examName => {
      const price = DEFAULT_ORDER_PRICE;
      total += price;
      items.push({
        name: examName,
        price: price,
        quantity: 1
      });
    });
  }

  return { total, items };
}

function isDuplicatePaymentNumberError(error) {
  if (!error || error.code !== 11000) {
    return false;
  }

  if (error.keyPattern?.paymentNumber) {
    return true;
  }

  const message = String(error.message || '');
  return message.includes('paymentNumber_1') || message.includes('paymentNumber');
}

function resolveOrderAmount(order) {
  const directAmount = Number(order?.totalAmount);
  if (Number.isFinite(directAmount) && directAmount > 0) {
    return Math.round(directAmount);
  }

  const fallback = calculateOrderTotal(order?.exams || []);
  const fallbackAmount = Number(fallback?.total);
  if (Number.isFinite(fallbackAmount) && fallbackAmount > 0) {
    return Math.round(fallbackAmount);
  }

  return null;
}

/**
 * Crear un pago para una orden médica
 * POST /api/payments/create
 */
router.post('/create', auth, async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  const startTime = Date.now();
  
  try {
    console.log(`🏦 [${requestId}] POST /api/payments/create - REQUEST START`);
    console.log(`📋 [${requestId}] Request body:`, req.body);
    console.log(`👤 [${requestId}] User:`, { id: req.user?.id, email: req.user?.email });
    
    const { orderId } = req.body;

    if (!orderId) {
      console.error(`❌ [${requestId}] Missing orderId in request`);
      return res.status(400).json({ 
        message: 'Order ID is required',
        debug: { requestId }
      });
    }

    console.log(`🔍 [${requestId}] Looking for order: ${orderId}`);
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`❌ [${requestId}] Order not found: ${orderId}`);
      return res.status(404).json({ 
        message: 'Order not found',
        debug: { requestId, orderId }
      });
    }
    
    console.log(`✅ [${requestId}] Order found:`, {
      id: order._id,
      totalAmount: order.totalAmount,
      status: order.status
    });

    if (order.userId?.toString() !== req.user?._id?.toString()) {
      console.error(`⛔ [${requestId}] User is not owner of order`, {
        orderId: order._id,
        orderUserId: order.userId,
        authUserId: req.user?._id
      });
      return res.status(403).json({
        message: 'You do not have access to this order',
        debug: { requestId, orderId }
      });
    }

    const resolvedAmount = resolveOrderAmount(order);
    const customerEmail = String(req.user?.email || '').trim();

    if (!resolvedAmount) {
      console.error(`❌ [${requestId}] Invalid order amount`, {
        orderId: order._id,
        totalAmount: order.totalAmount,
        examsCount: Array.isArray(order.exams) ? order.exams.length : 0
      });
      return res.status(422).json({
        message: 'Order amount is invalid for payment',
        debug: {
          requestId,
          orderId: order._id,
          totalAmount: order.totalAmount
        }
      });
    }

    if (!customerEmail) {
      console.error(`❌ [${requestId}] Authenticated user has no email`, {
        userId: req.user?._id,
        orderId: order._id
      });
      return res.status(422).json({
        message: 'Authenticated user email is required to create payment',
        debug: {
          requestId,
          userId: req.user?._id
        }
      });
    }

    // Verificar configuración de Flow ANTES de crear el pago
    console.log(`🔧 [${requestId}] Flow Configuration Check:`, {
      hasApiKey: !!process.env.FLOW_API_KEY,
      hasSecretKey: !!process.env.FLOW_SECRET_KEY,
      hasBackendUrl: !!process.env.BACKEND_URL,
      hasFrontendUrl: !!process.env.FRONTEND_URL,
      nodeEnv: process.env.NODE_ENV
    });
    
    const resolvedUrls = resolvePaymentBaseUrls(req);
    console.log(`🌍 [${requestId}] Resolved payment URLs:`, resolvedUrls);
    
    if (!process.env.FLOW_API_KEY || !process.env.FLOW_SECRET_KEY) {
      console.error(`❌ [${requestId}] Flow credentials not configured`);
      return res.status(503).json({ 
        message: 'Payment service not available - Flow credentials missing',
        debug: { 
          requestId,
          missingConfig: {
            flowApiKey: !process.env.FLOW_API_KEY,
            flowSecretKey: !process.env.FLOW_SECRET_KEY
          }
        }
      });
    }

    if (!resolvedUrls.backendUrl || !resolvedUrls.frontendUrl) {
      console.error(`❌ [${requestId}] Public payment URLs not configured correctly`, resolvedUrls);
      return res.status(503).json({
        message: 'Payment service not available - public callback URLs missing',
        debug: {
          requestId,
          resolvedUrls
        }
      });
    }

    console.log(`💾 [${requestId}] Creating Payment document...`);

    const paymentSchemaHasPaymentNumber = !!Payment.schema.path('paymentNumber');
    if (!paymentSchemaHasPaymentNumber) {
      console.error(`❌ [${requestId}] Runtime schema mismatch: paymentNumber path missing in Payment model`);
      return res.status(503).json({
        message: 'Payment service unavailable - outdated backend version',
        debug: {
          requestId,
          reason: 'paymentNumber field missing in runtime schema'
        }
      });
    }

    const payment = new Payment({
      // IDs requeridos
      orderId: order._id,
      userId: req.user._id,
      
      // Información de Flow 
      commerceOrder: `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      
      // Montos requeridos 
      amount: resolvedAmount,
      totalAmount: resolvedAmount,
      currency: 'CLP',
      
      // Información del usuario requerida
      customerEmail,
      
      // Subject requerido
      subject: `Pago por Orden #${order._id} - ${order.items?.length || 0} exámenes médicos`,
      
      // Estado inicial
      status: 'pending'
    });

    try {
      await payment.save();
    } catch (saveError) {
      if (isDuplicatePaymentNumberError(saveError)) {
        console.warn(`⚠️ [${requestId}] Duplicate paymentNumber detected, retrying once with a new value`, {
          previousPaymentNumber: payment.paymentNumber,
          keyValue: saveError.keyValue
        });

        payment.paymentNumber = undefined;
        await payment.save();
      } else {
        throw saveError;
      }
    }
    console.log(`✅ [${requestId}] Payment document created:`, {
      id: payment._id,
      paymentNumber: payment.paymentNumber,
      commerceOrder: payment.commerceOrder,
      amount: payment.amount
    });

    console.log(`🌐 [${requestId}] Calling flowService.createPayment...`);
    const flowPaymentData = {
      commerceOrder: payment.commerceOrder,
      subject: `Payment for Order #${order._id}`,
      amount: payment.amount,
      email: payment.customerEmail,
      urlConfirmation: `${resolvedUrls.backendUrl}/api/payments/confirm`,
      urlReturn: `${resolvedUrls.backendUrl}/api/payments/return/${payment._id}`,
    };
    
    console.log(`📡 [${requestId}] Flow payment data:`, {
      ...flowPaymentData,
      urlConfirmation: flowPaymentData.urlConfirmation || 'MISSING BACKEND_URL',
      urlReturn: flowPaymentData.urlReturn || 'MISSING FRONTEND_URL'
    });
    
    const flowResult = await flowService.createPayment(flowPaymentData);
    
    console.log(`🔄 [${requestId}] Flow service result:`, {
      success: flowResult.success,
      hasToken: !!flowResult.token,
      hasUrl: !!flowResult.url,
      error: flowResult.error
    });

    if (!flowResult.success) {
      console.error(`❌ [${requestId}] Flow payment creation failed:`, flowResult);
      payment.status = 'failed';
      payment.rawCreateResponse = flowResult;
      await payment.save();
      return res.status(500).json({ 
        message: 'Failed to create payment in Flow',
        debug: { 
          requestId,
          flowError: flowResult.error,
          paymentId: payment._id
        }
      });
    }

    console.log(`✅ [${requestId}] Flow payment created successfully`);
    payment.flowToken = flowResult.token;
    payment.rawCreateResponse = flowResult;
    payment.status = 'pending';
    await payment.save();

    const duration = Date.now() - startTime;
    console.log(`🎉 [${requestId}] Payment creation completed in ${duration}ms`);
    
    res.json({
      success: true,
      message: 'Payment created successfully',
      payment: {
        id: payment._id,
        paymentUrl: flowResult.url,
        token: flowResult.token,
        commerceOrder: payment.commerceOrder,
        amount: payment.amount,
        status: payment.status,
        isMock: flowResult.isMock || false
      },
      debug: { requestId, duration: `${duration}ms` }
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`💥 [${requestId}] Error creating payment after ${duration}ms:`, {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      requestBody: req.body,
      userId: req.user?.id
    });
    
    // Error específicos por tipo
    if (error.name === 'ValidationError') {
      console.error(`📋 [${requestId}] MongoDB Validation Error:`, error.errors);
    } else if (error.name === 'CastError') {
      console.error(`🔄 [${requestId}] MongoDB Cast Error - invalid ObjectId:`, error.path);
    } else if (error.code === 11000) {
      console.error(`🔁 [${requestId}] MongoDB Duplicate Key Error:`, error.keyPattern);
    }
    
    res.status(500).json({ 
      message: 'Internal server error creating payment',
      debug: { 
        requestId, 
        duration: `${duration}ms`,
        errorType: error.name,
        errorMessage: error.message
      }
    });
  }
});

/**
 * Retorno de Flow para el navegador del usuario
 * Flow puede volver por GET o POST; aquí normalizamos y redirigimos al frontend.
 */
router.all('/return/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const token = req.body?.token || req.query?.token || req.body?.token_ws || req.query?.token_ws;
    const resolvedUrls = resolvePaymentBaseUrls(req);

    const redirectUrl = buildPaymentResultRedirectUrl(resolvedUrls.frontendUrl, paymentId, token);
    if (!redirectUrl) {
      console.error('Flow return redirect failed - frontend URL not configured', {
        paymentId,
        resolvedUrls
      });
      return res.status(503).send('Frontend URL is not configured');
    }

    return res.redirect(303, redirectUrl);
  } catch (error) {
    console.error('Error handling Flow return redirect:', error.message);
    return res.status(500).send('Error handling payment return');
  }
});

/**
 * Confirmación de pago desde Flow (webhook)
 * POST /api/payments/confirm
 */
router.post('/confirm', async (req, res) => {
  try {
    console.log('Flow confirmation received:', req.body);

    // Validar la firma de Flow
    if (!flowService.validateConfirmation(req.body)) {
      console.error('Invalid Flow confirmation signature');
      return res.status(400).send('Invalid signature');
    }

    const { token } = req.body;

    if (!token) {
      console.error('No token provided in Flow confirmation');
      return res.status(400).send('Token required');
    }

    // Buscar el pago por token
    const payment = await Payment.findByFlowToken(token);
    if (!payment) {
      console.error('Payment not found for token:', token);
      return res.status(404).send('Payment not found');
    }

    // Obtener el estado del pago desde Flow
    const flowStatus = await flowService.getPaymentStatus(token);
    
    if (!flowStatus.success) {
      console.error('Error getting payment status from Flow:', flowStatus.error);
      payment.changeStatus('failed', `Error consultando estado: ${flowStatus.error}`);
      await payment.save();
      return res.status(500).send('Error checking payment status');
    }

    // Actualizar el pago según el estado de Flow
    if (flowStatus.paymentStatus === 'completed') {
      payment.changeStatus('completed', 'Pago confirmado por Flow', flowStatus);
      payment.confirmPayment(flowStatus);
      await payment.save();

      // Actualizar la orden
      const order = await Order.findById(payment.orderId);
      if (order) {
        order.paymentStatus = 'completed';
        order.status = 'payment_confirmed';
        order.logs.push({
          action: 'payment_completed',
          performedBy: null,
          performedByName: 'Flow',
          previousStatus: order.status,
          newStatus: 'payment_confirmed',
          notes: `Pago confirmado - Monto: $${payment.totalAmount.toLocaleString('es-CL')} CLP`
        });

        // Auto-aprobación si está habilitada
        const Settings = require('../models/Settings');
        const approvalMode = await Settings.getSetting('ORDER_APPROVAL_MODE') || 'auto';
        
        if (approvalMode === 'auto') {
          order.status = 'completed';
          order.approvedAt = new Date();
          order.logs.push({
            action: 'approved',
            performedBy: null,
            performedByName: 'Sistema (Aprobación automática)',
            previousStatus: 'payment_confirmed',
            newStatus: 'completed',
            notes: 'Aprobación automática después del pago'
          });

          // Generar PDF
          try {
            const user = await User.findById(order.userId);
            const { fileName, s3Key, s3Url } = await generateMedicalOrderPdf({ order, user });
            order.pdfLink = `/downloads/orders/${fileName}`;
            
            if (s3Key) {
              order.pdfS3Key = s3Key;
              if (s3Url) {
                order.digitalDownloadLink = s3Url;
              }
              order.logs.push({
                action: 'pdf_generated',
                performedBy: null,
                performedByName: 'Sistema',
                previousStatus: order.status,
                newStatus: order.status,
                notes: `PDF generado: ${fileName} y subido a S3: ${s3Key}`
              });
            }

            try {
              const frontendUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || '').replace(/\/+$/, '');
              await sendOrderCompletedEmail({
                to: user?.email,
                customerName: user?.name,
                orderId: order._id,
                exams: order.exams,
                bitacoraUrl: frontendUrl ? `${frontendUrl}/bitacora` : undefined,
                downloadUrl: s3Url || order.digitalDownloadLink || undefined
              });
            } catch (emailErr) {
              console.error('⚠️ Error sending payment completion email:', emailErr.message);
            }
          } catch (pdfErr) {
            console.error('⚠️ Error generating order PDF after payment:', pdfErr.message);
          }
        }

        await order.save();
      }

      console.log('Payment confirmed successfully:', payment.commerceOrder);
    } else {
      payment.changeStatus('pending', 'Pago aún pendiente en Flow', flowStatus);
      await payment.save();
    }

    // Flow espera una respuesta exitosa
    res.status(200).send('OK');

  } catch (error) {
    console.error('Error handling Flow confirmation:', error);
    res.status(500).send('Internal server error');
  }
});

/**
 * Obtener estado de un pago
 * GET /api/payments/:id/status
 */
router.get('/:id/status', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('orderId');
    
    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    // Verificar que el pago pertenece al usuario autenticado
    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acceso denegado a este pago' });
    }

    // Si el pago está pendiente, consultar el estado en Flow
    if (payment.status === 'processing' && payment.flowToken) {
      const flowStatus = await flowService.getPaymentStatus(payment.flowToken);
      
      if (flowStatus.success && flowStatus.paymentStatus === 'completed') {
        payment.changeStatus('completed', 'Pago confirmado al consultar estado');
        payment.confirmPayment(flowStatus);
        await payment.save();

        // También actualizar la orden
        if (payment.orderId) {
          payment.orderId.paymentStatus = 'completed';
          payment.orderId.status = 'payment_confirmed';
          await payment.orderId.save();
        }
      }
    }

    res.json({
      id: payment._id,
      status: payment.status,
      amount: payment.amount,
      taxes: payment.taxes,
      totalAmount: payment.totalAmount,
      currency: payment.currency,
      paymentUrl: payment.paymentUrl,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
      confirmedAt: payment.confirmedAt,
      order: payment.orderId && {
        id: payment.orderId._id,
        status: payment.orderId.status,
        examName: payment.orderId.examName,
        exams: payment.orderId.exams
      }
    });

  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ 
      message: 'Error al consultar el estado del pago',
      error: error.message 
    });
  }
});

/**
 * Listar pagos del usuario autenticado
 * GET /api/payments/my-payments
 */
router.get('/my-payments', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate('orderId', 'examName exams status')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      payments: payments.map(payment => ({
        id: payment._id,
        commerceOrder: payment.commerceOrder,
        status: payment.status,
        amount: payment.amount,
        taxes: payment.taxes,
        totalAmount: payment.totalAmount,
        currency: payment.currency,
        subject: payment.subject,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
        order: payment.orderId && {
          id: payment.orderId._id,
          examName: payment.orderId.examName,
          exams: payment.orderId.exams,
          status: payment.orderId.status
        }
      }))
    });

  } catch (error) {
    console.error('Error getting user payments:', error);
    res.status(500).json({ 
      message: 'Error al obtener los pagos del usuario',
      error: error.message 
    });
  }
});

module.exports = router;