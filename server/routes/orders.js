const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Settings = require('../models/Settings');
const DiscountCode = require('../models/DiscountCode');
const { generateMedicalOrderPdf } = require('../services/orderPdfService');
const { getPresignedUrl } = require('../services/s3Service');
const { sendOrderCompletedEmail, sendManualApprovalOrderNotification } = require('../services/emailService');

const DEFAULT_ORDER_PRICE = 5990;
const PACKS_PER_BLOCK = 3;
const CUSTOM_EXAMS_PER_BLOCK = 9;

function getOrderTypeLabel(orderType) {
  const normalizedType = String(orderType || '').toLowerCase();
  const labels = {
    custom: 'Personalizada',
    pap: 'PAP',
    thyroid: 'Tiroides',
    hypertension: 'Hipertension',
    mammography: 'Mamografia'
  };

  return labels[normalizedType] || (orderType ? String(orderType) : 'N/A');
}

function isPackOrder(order) {
  return Array.isArray(order?.cartItems)
    && order.cartItems.some((item) => String(item?.pricingType || '').toLowerCase() === 'pack');
}

function serializeOrderWithTypeLabel(order) {
  if (!order) {
    return order;
  }

  const plainOrder = typeof order.toObject === 'function' ? order.toObject() : { ...order };
  plainOrder.typeLabel = isPackOrder(plainOrder) ? 'Pack' : getOrderTypeLabel(plainOrder.type);
  return plainOrder;
}

function getBackendBaseUrl(req) {
  const explicitBaseUrl =
    process.env.BACKEND_URL ||
    process.env.API_BASE_URL ||
    process.env.BASE_URL ||
    process.env.RENDER_EXTERNAL_URL;

  if (explicitBaseUrl) {
    return String(explicitBaseUrl).replace(/\/+$/, '');
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'];
  const protocol = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) || req.protocol || 'http';
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) || req.get('host') || 'localhost:5001';

  if (process.env.NODE_ENV !== 'production' && String(host).includes(':3000')) {
    return `${protocol}://${String(host).replace(':3000', ':5001')}`;
  }

  return `${protocol}://${host}`;
}

function toAbsoluteDownloadUrl(req, maybeRelativeUrl) {
  if (!maybeRelativeUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(maybeRelativeUrl)) {
    return maybeRelativeUrl;
  }

  const normalizedPath = maybeRelativeUrl.startsWith('/') ? maybeRelativeUrl : `/${maybeRelativeUrl}`;
  return `${getBackendBaseUrl(req)}${normalizedPath}`;
}

function toSafeQuantity(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getUserFullName(user) {
  const fullName = [user?.name, user?.apellidoPaterno, user?.apellidoMaterno]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' ');

  return fullName || user?.name || user?.email || 'Paciente';
}

function getLocalPdfPathFromLink(pdfLink) {
  if (!pdfLink) {
    return null;
  }

  const match = String(pdfLink).match(/\/downloads\/orders\/([^?#]+)/i);
  if (!match || !match[1]) {
    return null;
  }

  const fileName = decodeURIComponent(match[1]);
  return path.join(__dirname, '..', 'downloads', 'orders', fileName);
}

async function ensureOrderPdfAvailable(order, user, performedById, performedByName, note, options = {}) {
  const { forceRegeneration = false } = options;
  const localPdfPath = getLocalPdfPathFromLink(order.pdfLink);
  const localPdfExists = localPdfPath ? fs.existsSync(localPdfPath) : false;
  const needsRegeneration = forceRegeneration || (!order.pdfS3Key && (!order.pdfLink || !localPdfExists));

  if (!needsRegeneration) {
    return;
  }

  const { fileName, s3Key, s3Url } = await generateMedicalOrderPdf({ order, user });
  order.pdfLink = `/downloads/orders/${fileName}`;

  if (s3Key) {
    order.pdfS3Key = s3Key;
    if (s3Url) {
      order.digitalDownloadLink = s3Url;
    }
  }

  order.logs.push({
    action: 'pdf_generated',
    performedBy: performedById || null,
    performedByName: performedByName || user.name || user.email,
    previousStatus: order.status,
    newStatus: order.status,
    notes: note
  });

  await order.save();
}

function isPackItem(item) {
  if (!item || typeof item !== 'object') {
    return false;
  }

  if (item.pricingType === 'pack') {
    return true;
  }

  if (Array.isArray(item.exams) && item.exams.length > 0) {
    return true;
  }

  return String(item.category || '').toLowerCase().includes('pack');
}

function normalizeCartItems(cartItems) {
  if (!Array.isArray(cartItems)) {
    return [];
  }

  return cartItems
    .map((item) => {
      const name = String(item?.name || '').trim();
      if (!name) {
        return null;
      }

      const quantity = toSafeQuantity(item?.quantity);
      const exams = Array.isArray(item?.exams)
        ? item.exams.map((exam) => String(exam).trim()).filter(Boolean)
        : [];

      const pack = isPackItem(item);

      return {
        id: String(item?.id || name),
        name,
        quantity,
        category: item?.category || (pack ? 'Pack' : 'Personalizado'),
        pricingType: pack ? 'pack' : 'custom_exam',
        exams
      };
    })
    .filter(Boolean);
}

function normalizeExamsInput(exams, examName) {
  if (Array.isArray(exams) && exams.length > 0) {
    return exams.flatMap((exam) => {
      if (typeof exam === 'string') {
        const normalizedName = exam.trim();
        return normalizedName ? [normalizedName] : [];
      }

      if (exam && typeof exam === 'object') {
        const normalizedName = String(exam.name || '').trim();
        const quantity = Math.max(1, Number.parseInt(exam.quantity, 10) || 1);
        return normalizedName ? Array(quantity).fill(normalizedName) : [];
      }

      return [];
    });
  }

  const normalizedExamName = String(examName || '').trim();
  return normalizedExamName ? [normalizedExamName] : [];
}

function calculateOrderTotal(exams, cartItems = []) {
  const normalizedItems = normalizeCartItems(cartItems);

  let packUnits = 0;
  let customExamUnits = 0;

  if (normalizedItems.length > 0) {
    normalizedItems.forEach((item) => {
      if (item.pricingType === 'pack') {
        packUnits += item.quantity;
      } else {
        customExamUnits += item.quantity;
      }
    });
  } else {
    customExamUnits = Array.isArray(exams) ? exams.length : 0;
  }

  const packBlocks = Math.ceil(packUnits / PACKS_PER_BLOCK);
  const customExamBlocks = Math.ceil(customExamUnits / CUSTOM_EXAMS_PER_BLOCK);
  const total = (packBlocks + customExamBlocks) * DEFAULT_ORDER_PRICE;

  return {
    total,
    cartItems: normalizedItems,
    pricingSummary: {
      blockPrice: DEFAULT_ORDER_PRICE,
      packsPerBlock: PACKS_PER_BLOCK,
      customExamsPerBlock: CUSTOM_EXAMS_PER_BLOCK,
      packUnits,
      customExamUnits,
      packBlocks,
      customExamBlocks,
      packsAmount: packBlocks * DEFAULT_ORDER_PRICE,
      customAmount: customExamBlocks * DEFAULT_ORDER_PRICE,
      total,
      taxes: 0,
      currency: 'CLP'
    }
  };
}

// Create a new medical order
router.post('/create', auth, async (req, res) => {
  try {
    const { type, examName, notes, exams, doctorName, cartItems, discountCode: rawDiscountCode } = req.body;

    const normalizedExams = normalizeExamsInput(exams, examName);
    const normalizedExamName = normalizedExams[0] || '';
    const billing = calculateOrderTotal(normalizedExams, cartItems);

    // Validate and apply discount code if provided
    let appliedDiscount = null;
    let finalTotal = billing.total;

    if (rawDiscountCode) {
      const codeStr = String(rawDiscountCode).toUpperCase().trim();
      const foundCode = await DiscountCode.findOne({ code: codeStr });

      if (foundCode && foundCode.active) {
        const now = new Date();
        const notExpired = !foundCode.expiresAt || now <= foundCode.expiresAt;
        const usageOk = foundCode.maxUsages === null || foundCode.usedCount < foundCode.maxUsages;
        const meetsMin = billing.total >= (foundCode.minOrderAmount || 0);

        if (notExpired && usageOk && meetsMin) {
          let discountAmount = 0;
          if (foundCode.discountType === 'percentage') {
            discountAmount = Math.round(billing.total * (foundCode.discountValue / 100));
          } else {
            discountAmount = Math.min(foundCode.discountValue, billing.total);
          }
          finalTotal = Math.max(0, billing.total - discountAmount);
          appliedDiscount = {
            code: foundCode.code,
            discountType: foundCode.discountType,
            discountValue: foundCode.discountValue,
            discountAmount
          };
          // Increment usage count
          await DiscountCode.findByIdAndUpdate(foundCode._id, { $inc: { usedCount: 1 } });
        }
      }
    }

    // Backward compatible validation: either `examName` or `exams[]`
    if (!normalizedExamName && normalizedExams.length === 0) {
      return res.status(400).json({ 
        message: 'Debes indicar al menos un examen (examName o exams[])'
      });
    }

    const approvalMode = await Settings.getSetting('ORDER_APPROVAL_MODE', 'auto');
    const isAutoApproval = approvalMode === 'auto';

    const order = new Order({
      userId: req.user._id,
      type: type || 'custom',
      doctorName: doctorName || undefined,
      // `examName` stays as a primary label (for older UIs); `exams` holds the full list
      examName: normalizedExamName || normalizedExams[0],
      exams: normalizedExams.length > 0 ? normalizedExams : (normalizedExamName ? [normalizedExamName] : []),
      notes: notes || '',
      status: isAutoApproval ? 'completed' : 'pending',
      approvalMode,
      requiresPayment: !isAutoApproval,
      paymentStatus: isAutoApproval ? 'completed' : 'pending',
      totalAmount: finalTotal,
      pricingSummary: billing.pricingSummary,
      cartItems: billing.cartItems,
      appliedDiscount
    });

    // Add initial log
    const user = await User.findById(req.user._id);
    order.logs.push({
      action: 'created',
      performedBy: req.user._id,
      performedByName: user.name || user.email,
      previousStatus: null,
      newStatus: order.status,
      notes: isAutoApproval
        ? 'Orden médica creada y aprobada automáticamente'
        : 'Orden médica creada - Requiere pago'
    });

    if (isAutoApproval) {
      order.approvedAt = new Date();
      order.logs.push({
        action: 'approved',
        performedBy: null,
        performedByName: 'Sistema (Aprobación automática)',
        previousStatus: 'pending',
        newStatus: 'completed',
        notes: 'Aprobación automática por modo de administración'
      });
    }

    await order.save();

    // Add to user's bitácora
    user.bitacora.push({
      type: 'order',
      orderId: order._id,
      date: new Date()
    });
    await user.save();

    // In auto mode generate PDF immediately, in manual mode it will be generated after approval/payment
    if (isAutoApproval) {
      try {
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

        await order.save();

        try {
          const frontendUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || '').replace(/\/+$/, '');
          await sendOrderCompletedEmail({
            to: user.email,
            customerName: getUserFullName(user),
            orderId: order._id,
            exams: order.exams,
            bitacoraUrl: frontendUrl ? `${frontendUrl}/bitacora` : undefined,
            downloadUrl: s3Url || undefined
          });
        } catch (emailErr) {
          console.error('⚠️ Error sending auto-approval order email:', emailErr.message);
        }
      } catch (pdfErr) {
        console.error('⚠️ Error generating order PDF in auto approval mode:', pdfErr.message);
      }
    } else {
      try {
        await sendManualApprovalOrderNotification({
          orderId: order._id,
          customerName: user.name,
          customerEmail: user.email,
          exams: order.exams,
          totalAmount: order.totalAmount,
        });
      } catch (manualNotifyErr) {
        console.error('⚠️ Error sending manual approval order notification:', manualNotifyErr.message);
      }
    }

    res.status(201).json({
      message: isAutoApproval
        ? 'Orden médica creada y aprobada automáticamente.'
        : 'Orden médica creada exitosamente. Debe proceder al pago.',
      order: {
        _id: order._id,
        type: order.type,
        typeLabel: isPackOrder(order) ? 'Pack' : getOrderTypeLabel(order.type),
        examName: order.examName,
        exams: order.exams,
        status: order.status,
        requiresPayment: order.requiresPayment,
        notes: order.notes,
        totalAmount: order.totalAmount,
        pricingSummary: order.pricingSummary,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: 'Error al crear la orden médica',
      error: error.message 
    });
  }
});

// Get all orders for the authenticated user
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      orders: orders.map(serializeOrderWithTypeLabel),
      total: orders.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      message: 'Error al obtener las órdenes',
      error: error.message 
    });
  }
});

// Get a specific order
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    res.json(serializeOrderWithTypeLabel(order));
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      message: 'Error al obtener la orden',
      error: error.message 
    });
  }
});

// Get presigned URL for order PDF from S3
router.get('/:orderId/pdf-url', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    const user = await User.findById(req.user._id).select('name apellidoPaterno apellidoMaterno rut email');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await ensureOrderPdfAvailable(
      order,
      user,
      req.user._id,
      user.name || user.email,
      'PDF generado bajo demanda desde bitácora del usuario',
      { forceRegeneration: true }
    );

    if (!order.pdfS3Key) {
      // Fallback to local PDF link if S3 is not available
      return res.json({
        url: toAbsoluteDownloadUrl(req, order.pdfLink),
        source: 'local'
      });
    }

    // Generate presigned URL (valid for 1 hour)
    const presignedUrl = await getPresignedUrl(order.pdfS3Key, 3600);

    res.json({
      url: presignedUrl,
      source: 's3'
    });
  } catch (error) {
    console.error('Error getting PDF URL:', error);
    res.status(500).json({ 
      message: 'Error al obtener la URL del PDF',
      error: error.message 
    });
  }
});

// Resend order email to the authenticated user
router.post('/:orderId/resend-email', auth, async (req, res) => {
  try {
    const { targetEmail } = req.body || {};

    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    const user = await User.findById(req.user._id).select('name apellidoPaterno apellidoMaterno rut email');
    if (!user?.email) {
      return res.status(400).json({ message: 'No se encontró un email válido para tu cuenta' });
    }

    const destinationEmail = String(targetEmail || '').trim() || user.email;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinationEmail);
    if (!isValidEmail) {
      return res.status(400).json({ message: 'El correo destino no es válido' });
    }

    await ensureOrderPdfAvailable(
      order,
      user,
      req.user._id,
      user.name || user.email,
      'PDF generado para reenvío de correo desde bitácora',
      { forceRegeneration: true }
    );

    let downloadUrl = order.digitalDownloadLink || undefined;
    if (!downloadUrl && order.pdfS3Key) {
      try {
        downloadUrl = await getPresignedUrl(order.pdfS3Key, 3600);
      } catch (urlErr) {
        console.error('⚠️ Error generating presigned URL for user resend email:', urlErr.message);
      }
    }

    if (!downloadUrl) {
      downloadUrl = toAbsoluteDownloadUrl(req, order.pdfLink) || undefined;
    }

    const frontendUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || '').replace(/\/+$/, '');
    await sendOrderCompletedEmail({
      to: destinationEmail,
      customerName: getUserFullName(user),
      orderId: order._id,
      exams: order.exams,
      bitacoraUrl: frontendUrl ? `${frontendUrl}/bitacora` : undefined,
      downloadUrl
    });

    order.logs.push({
      action: 'updated',
      performedBy: req.user._id,
      performedByName: user.name || user.email,
      previousStatus: order.status,
      newStatus: order.status,
      notes: `Correo de orden reenviado por el usuario a ${destinationEmail}`
    });

    await order.save();

    res.json({
      message: 'Correo reenviado correctamente',
      email: destinationEmail
    });
  } catch (error) {
    console.error('Error resending order email:', error);
    res.status(500).json({
      message: 'Error al reenviar correo de la orden',
      error: error.message
    });
  }
});

// Update order status (for admin use in future)
router.put('/:orderId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    order.status = status;
    await order.save();

    res.json({
      message: 'Estado de la orden actualizado',
      order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      message: 'Error al actualizar la orden',
      error: error.message 
    });
  }
});

module.exports = router;
