const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Settings = require('../models/Settings');
const DiscountCode = require('../models/DiscountCode');
const { generateMedicalOrderPdf } = require('../services/orderPdfService');
const { getPresignedUrl } = require('../services/s3Service');
const { sendOrderCompletedEmail } = require('../services/emailService');

const TERMINAL_ORDER_STATUSES = new Set(['completed', 'cancelled']);

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

function hasPackItems(order) {
  if (!order || !Array.isArray(order.cartItems)) {
    return false;
  }

  return order.cartItems.some((item) => String(item?.pricingType || '').toLowerCase() === 'pack');
}

// Get all orders (admin only)
router.get('/orders', auth, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 50, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      // Search by user name or email
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = users.map(u => u._id);
      query.userId = { $in: userIds };
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders: orders.map(serializeOrderWithTypeLabel),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      message: 'Error al obtener las órdenes',
      error: error.message 
    });
  }
});

// Get order details with full logs
router.get('/orders/:orderId', auth, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('userId', 'name email phone')
      .populate('approvedBy', 'name email')
      .populate('logs.performedBy', 'name email');

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

// Get presigned/local URL for order PDF (admin). Generates PDF if missing.
router.get('/orders/:orderId/pdf-url', auth, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    if (!order.pdfS3Key && !order.pdfLink) {
      const orderUser = await User.findById(order.userId).select('name email');
      if (!orderUser) {
        return res.status(404).json({ message: 'Usuario de la orden no encontrado' });
      }

      const { fileName, s3Key, s3Url } = await generateMedicalOrderPdf({ order, user: orderUser });
      order.pdfLink = `/downloads/orders/${fileName}`;
      if (s3Key) {
        order.pdfS3Key = s3Key;
        if (s3Url) {
          order.digitalDownloadLink = s3Url;
        }
      }

      order.logs.push({
        action: 'pdf_generated',
        performedBy: req.user._id,
        performedByName: 'Administrador',
        previousStatus: order.status,
        newStatus: order.status,
        notes: 'PDF generado bajo demanda desde panel admin'
      });

      await order.save();
    }

    if (order.pdfS3Key) {
      const presignedUrl = await getPresignedUrl(order.pdfS3Key, 3600);
      return res.json({ url: presignedUrl, source: 's3' });
    }

    return res.json({ url: toAbsoluteDownloadUrl(req, order.pdfLink), source: 'local' });
  } catch (error) {
    console.error('Error getting admin PDF URL:', error);
    res.status(500).json({
      message: 'Error al obtener la URL del PDF de la orden',
      error: error.message
    });
  }
});

// Resend completed order email to customer (admin)
router.post('/orders/:orderId/resend-email', auth, admin, async (req, res) => {
  try {
    const { targetEmail } = req.body || {};

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    const orderUser = await User.findById(order.userId).select('name email');
    if (!orderUser?.email) {
      return res.status(400).json({ message: 'La orden no tiene un usuario con email válido' });
    }

    const destinationEmail = String(targetEmail || '').trim() || orderUser.email;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinationEmail);
    if (!isValidEmail) {
      return res.status(400).json({ message: 'El correo destino no es válido' });
    }

    if (!order.pdfS3Key && !order.pdfLink) {
      const { fileName, s3Key, s3Url } = await generateMedicalOrderPdf({ order, user: orderUser });
      order.pdfLink = `/downloads/orders/${fileName}`;
      if (s3Key) {
        order.pdfS3Key = s3Key;
        if (s3Url) {
          order.digitalDownloadLink = s3Url;
        }
      }
      order.logs.push({
        action: 'pdf_generated',
        performedBy: req.user._id,
        performedByName: 'Administrador',
        previousStatus: order.status,
        newStatus: order.status,
        notes: 'PDF generado para reenvío de correo desde panel admin'
      });
    }

    let downloadUrl = order.digitalDownloadLink || undefined;
    if (!downloadUrl && order.pdfS3Key) {
      try {
        downloadUrl = await getPresignedUrl(order.pdfS3Key, 3600);
      } catch (urlErr) {
        console.error('⚠️ Error generating presigned URL for resend email:', urlErr.message);
      }
    }

    if (!downloadUrl) {
      downloadUrl = toAbsoluteDownloadUrl(req, order.pdfLink) || undefined;
    }

    const frontendUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || '').replace(/\/+$/, '');
    await sendOrderCompletedEmail({
      to: destinationEmail,
      customerName: orderUser.name,
      orderId: order._id,
      exams: order.exams,
      bitacoraUrl: frontendUrl ? `${frontendUrl}/bitacora` : undefined,
      downloadUrl
    });

    order.logs.push({
      action: 'updated',
      performedBy: req.user._id,
      performedByName: 'Administrador',
      previousStatus: order.status,
      newStatus: order.status,
      notes: `Correo de orden reenviado manualmente a ${destinationEmail}`
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

// Update approval mode (auto/manual)
router.put('/settings/approval-mode', auth, admin, async (req, res) => {
  try {
    const { mode } = req.body;
    
    if (!['auto', 'manual'].includes(mode)) {
      return res.status(400).json({ message: 'Modo inválido. Debe ser "auto" o "manual"' });
    }

    // Store in database
    await Settings.setSetting('ORDER_APPROVAL_MODE', mode, req.user._id);
    
    // Also update environment variable for immediate effect
    process.env.ORDER_APPROVAL_MODE = mode;

    res.json({
      message: `Modo de aprobación actualizado a: ${mode === 'auto' ? 'AUTOMÁTICO' : 'MANUAL'}`,
      mode
    });
  } catch (error) {
    console.error('Error updating approval mode:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el modo de aprobación',
      error: error.message 
    });
  }
});

// Get current approval mode
router.get('/settings/approval-mode', auth, admin, async (req, res) => {
  try {
    // Try to get from database first, fallback to environment variable, then default
    const mode = await Settings.getSetting('ORDER_APPROVAL_MODE') 
      || process.env.ORDER_APPROVAL_MODE 
      || 'auto';
    
    res.json({ mode });
  } catch (error) {
    console.error('Error fetching approval mode:', error);
    // Fallback to environment variable or default
    const mode = process.env.ORDER_APPROVAL_MODE || 'auto';
    res.json({ mode });
  }
});

// Approve orders (batch or single)
router.post('/orders/approve', auth, admin, async (req, res) => {
  try {
    const { orderIds } = req.body; // Array of order IDs

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: 'Debes proporcionar al menos un ID de orden' });
    }

    const uniqueOrderIds = [...new Set(orderIds.map((id) => String(id)))];
    const selectedOrderIdSet = new Set(uniqueOrderIds);

    const selectedOrders = await Order.find({ _id: { $in: uniqueOrderIds } })
      .select('_id paymentId status cartItems')
      .lean();

    const foundOrderIdSet = new Set(selectedOrders.map((order) => String(order._id)));
    const missingOrderIds = uniqueOrderIds.filter((id) => !foundOrderIdSet.has(id));

    if (missingOrderIds.length > 0) {
      return res.status(404).json({
        message: 'Una o más órdenes no existen',
        missingOrderIds
      });
    }

    const packOrdersWithPayment = selectedOrders.filter((order) => hasPackItems(order) && order.paymentId);

    if (packOrdersWithPayment.length > 0) {
      const paymentIds = [...new Set(packOrdersWithPayment.map((order) => String(order.paymentId)))];

      const relatedPendingOrders = await Order.find({
        paymentId: { $in: paymentIds },
        status: { $nin: ['completed', 'cancelled'] }
      })
        .select('_id paymentId')
        .lean();

      const missingRelatedOrderIds = relatedPendingOrders
        .map((order) => String(order._id))
        .filter((id) => !selectedOrderIdSet.has(id));

      if (missingRelatedOrderIds.length > 0) {
        return res.status(400).json({
          message: 'Para órdenes de pack debes aprobar el grupo completo asociado al pago.',
          missingOrderIds: [...new Set(missingRelatedOrderIds)],
          paymentIds
        });
      }
    }

    const adminUser = await User.findById(req.user._id);
    const adminActor = adminUser?.name || adminUser?.email || 'Administrador';
    const approvedOrders = [];
    const errors = [];

    for (const orderId of uniqueOrderIds) {
      try {
        const order = await Order.findById(orderId);
        if (!order) {
          errors.push({ orderId, error: 'Orden no encontrada' });
          continue;
        }

        if (TERMINAL_ORDER_STATUSES.has(order.status)) {
          order.logs.push({
            action: 'status_changed',
            performedBy: req.user._id,
            performedByName: adminActor,
            previousStatus: order.status,
            newStatus: order.status,
            notes: order.status === 'completed'
              ? 'Intento bloqueado: el administrador intento aprobar una orden ya aprobada.'
              : 'Intento bloqueado: el administrador intento aprobar una orden ya rechazada.'
          });
          await order.save();

          errors.push({
            orderId,
            error: order.status === 'completed'
              ? 'La orden ya está aprobada (completada) y no puede modificarse'
              : 'La orden ya está rechazada (cancelada) y no puede modificarse'
          });
          continue;
        }

        // Update order
        const previousStatus = order.status;
        order.status = 'completed';
        order.approvedBy = req.user._id;
        order.approvedAt = new Date();

        // Add log
        order.logs.push({
          action: 'approved',
          performedBy: req.user._id,
          performedByName: adminActor,
          previousStatus,
          newStatus: 'completed',
          notes: `Aprobada manualmente por ${adminActor}`
        });

        await order.save();
        approvedOrders.push(order);

        try {
          const orderUser = await User.findById(order.userId).select('name email');
          if (orderUser?.email) {
            const frontendUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || '').replace(/\/+$/, '');
            await sendOrderCompletedEmail({
              to: orderUser.email,
              customerName: orderUser.name,
              orderId: order._id,
              exams: order.exams,
              bitacoraUrl: frontendUrl ? `${frontendUrl}/bitacora` : undefined,
              downloadUrl: order.digitalDownloadLink || undefined
            });
          }
        } catch (emailErr) {
          console.error('⚠️ Error sending manual approval email:', emailErr.message);
        }
      } catch (err) {
        errors.push({ orderId, error: err.message });
      }
    }

    res.json({
      message: `${approvedOrders.length} orden(es) aprobada(s) exitosamente`,
      approved: approvedOrders.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error approving orders:', error);
    res.status(500).json({ 
      message: 'Error al aprobar las órdenes',
      error: error.message 
    });
  }
});

// Reject orders (batch or single)
router.post('/orders/reject', auth, admin, async (req, res) => {
  try {
    const { orderIds, reason } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: 'Debes proporcionar al menos un ID de orden' });
    }

    const uniqueOrderIds = [...new Set(orderIds.map((id) => String(id)))];

    const adminUser = await User.findById(req.user._id);
    const adminActor = adminUser?.name || adminUser?.email || 'Administrador';
    const rejectedOrders = [];
    const refundRequiredOrders = [];
    const errors = [];

    for (const orderId of uniqueOrderIds) {
      try {
        const order = await Order.findById(orderId);
        if (!order) {
          errors.push({ orderId, error: 'Orden no encontrada' });
          continue;
        }

        if (TERMINAL_ORDER_STATUSES.has(order.status)) {
          order.logs.push({
            action: 'status_changed',
            performedBy: req.user._id,
            performedByName: adminActor,
            previousStatus: order.status,
            newStatus: order.status,
            notes: order.status === 'completed'
              ? 'Intento bloqueado: el administrador intento rechazar una orden ya aprobada.'
              : 'Intento bloqueado: el administrador intento rechazar una orden ya rechazada.'
          });
          await order.save();

          errors.push({
            orderId,
            error: order.status === 'completed'
              ? 'La orden ya está aprobada (completada) y no puede modificarse'
              : 'La orden ya está rechazada (cancelada) y no puede modificarse'
          });
          continue;
        }

        const previousStatus = order.status;
        order.status = 'cancelled';

        const requiresRefund = order.paymentStatus === 'completed';
        if (requiresRefund) {
          order.logs.push({
            action: 'status_changed',
            performedBy: req.user._id,
            performedByName: adminActor,
            previousStatus,
            newStatus: 'cancelled',
            notes: 'Pago completado detectado: gestionar devolución manual con cliente. Orden queda rechazada.'
          });

          if (order.paymentId) {
            try {
              await Payment.findByIdAndUpdate(order.paymentId, {
                $push: {
                  logs: {
                    action: 'refund_required',
                    notes: `Orden rechazada por ${adminActor}. Requiere gestion de devolucion con cliente.`,
                    timestamp: new Date(),
                    data: {
                      orderId: order._id,
                      previousOrderStatus: previousStatus,
                      newOrderStatus: 'cancelled'
                    }
                  }
                }
              });
            } catch (paymentLogErr) {
              console.error('⚠️ Error registering refund requirement on payment:', paymentLogErr.message);
            }
          }

          refundRequiredOrders.push(String(order._id));
        }

        order.logs.push({
          action: 'rejected',
          performedBy: req.user._id,
          performedByName: adminActor,
          previousStatus,
          newStatus: 'cancelled',
          notes: reason || `Rechazada por ${adminActor}`
        });

        await order.save();
        rejectedOrders.push(order);
      } catch (err) {
        errors.push({ orderId, error: err.message });
      }
    }

    res.json({
      message: `${rejectedOrders.length} orden(es) rechazada(s) exitosamente`,
      rejected: rejectedOrders.length,
      refundRequiredOrders: refundRequiredOrders.length > 0 ? refundRequiredOrders : undefined,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error rejecting orders:', error);
    res.status(500).json({ 
      message: 'Error al rechazar las órdenes',
      error: error.message 
    });
  }
});

// Delete orders (batch or single)
router.post('/orders/delete', auth, admin, async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: 'Debes proporcionar al menos un ID de orden' });
    }

    const uniqueOrderIds = [...new Set(orderIds.map((id) => String(id)))];
    const existingOrders = await Order.find({ _id: { $in: uniqueOrderIds } }).select('_id').lean();
    const existingOrderIds = new Set(existingOrders.map((order) => String(order._id)));
    const missingOrderIds = uniqueOrderIds.filter((id) => !existingOrderIds.has(id));

    const deleteResult = await Order.deleteMany({ _id: { $in: uniqueOrderIds } });

    res.json({
      message: `${deleteResult.deletedCount} orden(es) eliminada(s) exitosamente`,
      deleted: deleteResult.deletedCount,
      missingOrderIds: missingOrderIds.length > 0 ? missingOrderIds : undefined
    });
  } catch (error) {
    console.error('Error deleting orders:', error);
    res.status(500).json({
      message: 'Error al eliminar las órdenes',
      error: error.message
    });
  }
});

// Update order status
router.put('/orders/:orderId/status', auth, admin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    const adminUser = await User.findById(req.user._id);
    const adminActor = adminUser?.name || adminUser?.email || 'Administrador';

    if (TERMINAL_ORDER_STATUSES.has(order.status) && order.status !== status) {
      order.logs.push({
        action: 'status_changed',
        performedBy: req.user._id,
        performedByName: adminActor,
        previousStatus: order.status,
        newStatus: order.status,
        notes: `Intento bloqueado: cambio de estado solicitado a ${status} sobre una orden terminal (${order.status}).`
      });
      await order.save();

      return res.status(400).json({
        message: order.status === 'completed'
          ? 'La orden ya está aprobada (completada) y no puede cambiar de estado'
          : 'La orden ya está rechazada (cancelada) y no puede cambiar de estado'
      });
    }

    const previousStatus = order.status;
    order.status = status;

    if (status === 'completed') {
      order.approvedBy = req.user._id;
      order.approvedAt = new Date();
    }

    order.logs.push({
      action: 'status_changed',
      performedBy: req.user._id,
      performedByName: adminActor,
      previousStatus,
      newStatus: status,
      notes: notes || `Estado cambiado a ${status} por ${adminActor}`
    });

    await order.save();

    res.json({
      message: 'Estado de la orden actualizado',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el estado',
      error: error.message 
    });
  }
});

// Get KPI statistics
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    
    // 30 days ago for moving average
    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Órdenes hoy vs promedio móvil últimos 30 días
    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });

    // Calculate moving average for last 30 days (excluding today)
    const ordersLast30Days = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo, $lt: todayStart }
    });
    const movingAverage30Days = ordersLast30Days / 30;

    // 2. Exámenes más pedidos (top 5)
    const topExams = await Order.aggregate([
      {
        $group: {
          _id: '$examName',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          examName: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // 3. Órdenes pendientes
    const pendingOrders = await Order.countDocuments({
      status: 'pending'
    });

    // 4. Usuarios nuevos hoy
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });

    // 5. Tasa de aprobación (completadas vs total)
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({
      status: 'completed'
    });
    const approvalRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // Bonus: Órdenes en proceso
    const processingOrders = await Order.countDocuments({
      status: 'processing'
    });

    // Bonus: Citas agendadas hoy
    const appointmentsToday = await Appointment.countDocuments({
      appointmentDate: { $gte: todayStart, $lt: todayEnd }
    });

    res.json({
      ordersToday,
      movingAverage30Days: Math.round(movingAverage30Days * 100) / 100,
      ordersTodayVsAverage: movingAverage30Days > 0 
        ? Math.round(((ordersToday - movingAverage30Days) / movingAverage30Days) * 100 * 100) / 100 
        : 0,
      topExams,
      pendingOrders,
      newUsersToday,
      approvalRate: Math.round(approvalRate * 100) / 100,
      processingOrders,
      appointmentsToday,
      totalOrders,
      completedOrders
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      message: 'Error al obtener las estadísticas',
      error: error.message 
    });
  }
});

// Get audit events for watch button and panic alerts
router.get('/watch-events', auth, admin, async (req, res) => {
  try {
    const requestedLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 200)
      : 50;

    const typeFilterRaw = String(req.query.type || '').trim().toLowerCase();
    const allowedTypes = ['watch_button_event', 'panic_alert'];
    const selectedTypes = allowedTypes.includes(typeFilterRaw)
      ? [typeFilterRaw]
      : allowedTypes;

    const events = await User.aggregate([
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          rut: 1,
          wellnessLogs: 1
        }
      },
      {
        $unwind: {
          path: '$wellnessLogs',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          'wellnessLogs.module': 'habits',
          'wellnessLogs.data.type': { $in: selectedTypes }
        }
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          userName: '$name',
          userEmail: '$email',
          userPhone: '$phone',
          userRut: '$rut',
          logDate: '$wellnessLogs.logDate',
          data: '$wellnessLogs.data'
        }
      },
      {
        $sort: {
          logDate: -1
        }
      },
      {
        $limit: limit
      }
    ]);

    res.json({
      success: true,
      count: events.length,
      limit,
      types: selectedTypes,
      events
    });
  } catch (error) {
    console.error('Error fetching watch events:', error);
    res.status(500).json({
      message: 'Error al obtener auditoría de eventos de pulsera',
      error: error.message
    });
  }
});

// Delete historical audit events for watch button and panic alerts
router.delete('/watch-events', auth, admin, async (_req, res) => {
  try {
    const trackedTypes = ['watch_button_event', 'panic_alert'];

    const beforeCountResult = await User.aggregate([
      {
        $project: {
          matchingEventsCount: {
            $size: {
              $filter: {
                input: { $ifNull: ['$wellnessLogs', []] },
                as: 'log',
                cond: {
                  $and: [
                    { $eq: ['$$log.module', 'habits'] },
                    { $in: ['$$log.data.type', trackedTypes] }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$matchingEventsCount' }
        }
      }
    ]);

    const totalBefore = beforeCountResult?.[0]?.total || 0;

    const updateResult = await User.updateMany(
      {},
      {
        $pull: {
          wellnessLogs: {
            module: 'habits',
            'data.type': { $in: trackedTypes }
          }
        }
      }
    );

    res.json({
      success: true,
      message: 'Eventos históricos de pulsera/pánico eliminados correctamente',
      deletedCount: totalBefore,
      usersMatched: updateResult.matchedCount || 0,
      usersModified: updateResult.modifiedCount || 0
    });
  } catch (error) {
    console.error('Error deleting watch events:', error);
    res.status(500).json({
      message: 'Error al borrar eventos históricos de pulsera/pánico',
      error: error.message
    });
  }
});

// ─────────────────────────────────────────────
// DISCOUNT CODES (admin management)
// ─────────────────────────────────────────────

// GET /api/admin/discount-codes – list all
router.get('/discount-codes', auth, admin, async (req, res) => {
  try {
    const codes = await DiscountCode.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ codes });
  } catch (err) {
    console.error('Error fetching discount codes:', err);
    res.status(500).json({ message: 'Error al obtener los códigos de descuento' });
  }
});

// POST /api/admin/discount-codes – create
router.post('/discount-codes', auth, admin, async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxUsages, expiresAt } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ message: 'Código, tipo y valor son requeridos' });
    }

    if (!['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({ message: 'El tipo debe ser "percentage" o "fixed"' });
    }

    if (discountType === 'percentage' && (discountValue < 1 || discountValue > 100)) {
      return res.status(400).json({ message: 'El porcentaje debe estar entre 1 y 100' });
    }

    if (discountValue < 0) {
      return res.status(400).json({ message: 'El valor del descuento no puede ser negativo' });
    }

    const existing = await DiscountCode.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'Ya existe un código con ese nombre' });
    }

    const discountCode = new DiscountCode({
      code: code.toUpperCase().trim(),
      description: description || '',
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxUsages: maxUsages ? Number(maxUsages) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id
    });

    await discountCode.save();
    res.status(201).json({ message: 'Código creado exitosamente', discountCode });
  } catch (err) {
    console.error('Error creating discount code:', err);
    res.status(500).json({ message: 'Error al crear el código de descuento' });
  }
});

// PUT /api/admin/discount-codes/:id – update
router.put('/discount-codes/:id', auth, admin, async (req, res) => {
  try {
    const { description, discountType, discountValue, minOrderAmount, maxUsages, expiresAt, active } = req.body;

    const discountCode = await DiscountCode.findById(req.params.id);
    if (!discountCode) {
      return res.status(404).json({ message: 'Código no encontrado' });
    }

    if (description !== undefined) discountCode.description = description;
    if (discountType !== undefined) discountCode.discountType = discountType;
    if (discountValue !== undefined) discountCode.discountValue = Number(discountValue);
    if (minOrderAmount !== undefined) discountCode.minOrderAmount = Number(minOrderAmount);
    if (maxUsages !== undefined) discountCode.maxUsages = maxUsages ? Number(maxUsages) : null;
    if (expiresAt !== undefined) discountCode.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (active !== undefined) discountCode.active = Boolean(active);

    await discountCode.save();
    res.json({ message: 'Código actualizado', discountCode });
  } catch (err) {
    console.error('Error updating discount code:', err);
    res.status(500).json({ message: 'Error al actualizar el código' });
  }
});

// DELETE /api/admin/discount-codes/:id – delete
router.delete('/discount-codes/:id', auth, admin, async (req, res) => {
  try {
    const discountCode = await DiscountCode.findByIdAndDelete(req.params.id);
    if (!discountCode) {
      return res.status(404).json({ message: 'Código no encontrado' });
    }
    res.json({ message: 'Código eliminado' });
  } catch (err) {
    console.error('Error deleting discount code:', err);
    res.status(500).json({ message: 'Error al eliminar el código' });
  }
});

// POST /api/admin/discount-codes/validate – validate a code (requires auth, not admin)
router.post('/discount-codes/validate', auth, async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'El código es requerido' });
    }

    const discountCode = await DiscountCode.findOne({ code: code.toUpperCase().trim() });

    if (!discountCode || !discountCode.active) {
      return res.status(404).json({ message: 'Código inválido o inactivo' });
    }

    if (discountCode.expiresAt && new Date() > discountCode.expiresAt) {
      return res.status(400).json({ message: 'Este código ha expirado' });
    }

    if (discountCode.maxUsages !== null && discountCode.usedCount >= discountCode.maxUsages) {
      return res.status(400).json({ message: 'Este código ha alcanzado su límite de usos' });
    }

    const total = Number(orderTotal) || 0;
    if (discountCode.minOrderAmount > 0 && total < discountCode.minOrderAmount) {
      return res.status(400).json({
        message: `El monto mínimo para usar este código es $${discountCode.minOrderAmount.toLocaleString('es-CL')}`
      });
    }

    let discountAmount = 0;
    if (discountCode.discountType === 'percentage') {
      discountAmount = Math.round(total * (discountCode.discountValue / 100));
    } else {
      discountAmount = Math.min(discountCode.discountValue, total);
    }

    res.json({
      valid: true,
      code: discountCode.code,
      description: discountCode.description,
      discountType: discountCode.discountType,
      discountValue: discountCode.discountValue,
      discountAmount,
      finalTotal: Math.max(0, total - discountAmount)
    });
  } catch (err) {
    console.error('Error validating discount code:', err);
    res.status(500).json({ message: 'Error al validar el código' });
  }
});

module.exports = router;
