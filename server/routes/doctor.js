const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const doctor = require('../middleware/doctor');
const Order = require('../models/Order');
const User = require('../models/User');
const { analyzePatientRecords } = require('../services/aiAnalysisService');
const { analyzeLongitudinalPatterns, generateDoctorCopilotSummary } = require('../services/clinicalEngineService');

// Get all patient records (doctor only)
router.get('/records', auth, doctor, async (req, res) => {
  try {
    const { status, page = 1, limit = 50, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search functionality - search in name, email, exam name, and status
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      
      // Search in user fields (name, email)
      const users = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      const userIds = users.map(u => u._id);

      // Build search query
      const searchQuery = {
        $or: [
          { userId: { $in: userIds } },
          { examName: searchRegex },
          { 'exams': { $in: [searchRegex] } },
          { status: searchRegex }
        ]
      };

      // Merge with existing query
      Object.assign(query, searchQuery);
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email phone dateOfBirth gender')
      .populate('approvedBy', 'name email')
      .populate('logs.performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching patient records:', error);
    res.status(500).json({ 
      message: 'Error al obtener los registros de pacientes',
      error: error.message 
    });
  }
});

// Get patient record details
router.get('/records/:orderId', auth, doctor, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('userId', 'name email phone dateOfBirth gender address')
      .populate('approvedBy', 'name email')
      .populate('logs.performedBy', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching record details:', error);
    res.status(500).json({ 
      message: 'Error al obtener los detalles del registro',
      error: error.message 
    });
  }
});

// AI Analysis of selected patient records
router.post('/records/ai-analysis', auth, doctor, async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: 'Debes seleccionar al menos un registro para analizar' });
    }

    if (orderIds.length > 10) {
      return res.status(400).json({ message: 'Puedes analizar máximo 10 registros a la vez' });
    }

    // Fetch the selected orders with full details
    const orders = await Order.find({ _id: { $in: orderIds } })
      .populate('userId', 'name email phone dateOfBirth gender address')
      .populate('approvedBy', 'name email')
      .populate('logs.performedBy', 'name email');

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No se encontraron los registros seleccionados' });
    }

    // Analyze with AI
    const analysis = await analyzePatientRecords(orders);

    res.json({
      message: 'Análisis completado exitosamente',
      analysis,
      recordsAnalyzed: orders.length
    });
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ 
      message: 'Error al realizar el análisis con IA',
      error: error.message 
    });
  }
});

// Get clinical timeline and patterns for a patient
router.get('/records/:orderId/clinical-timeline', auth, doctor, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    const analysis = await analyzeLongitudinalPatterns(order.userId);
    res.json(analysis);
  } catch (error) {
    console.error('Error getting clinical timeline:', error);
    res.status(500).json({ 
      message: 'Error al obtener el análisis clínico',
      error: error.message 
    });
  }
});

// Get doctor copilot summary before consultation
router.post('/records/copilot-summary', auth, doctor, async (req, res) => {
  try {
    const { userId, orderIds } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId es requerido' });
    }

    const summary = await generateDoctorCopilotSummary(userId, orderIds);
    res.json(summary);
  } catch (error) {
    console.error('Error generating doctor copilot summary:', error);
    res.status(500).json({ 
      message: 'Error al generar el resumen del copiloto',
      error: error.message 
    });
  }
});

module.exports = router;
