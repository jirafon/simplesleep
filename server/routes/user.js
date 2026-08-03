const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');
const Appointment = require('../models/Appointment');
const { normalizeRut, isValidChileanRut } = require('../utils/rut');
const { uploadBitacoraDocumentToS3, getPresignedUrl } = require('../services/s3Service');
const { analyzeLongitudinalPatterns, generatePatientCopilot } = require('../services/clinicalEngineService');

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

function enrichBitacoraOrderType(item) {
  const bitacoraItem = typeof item?.toObject === 'function' ? item.toObject() : { ...(item || {}) };

  if (bitacoraItem.type !== 'order' || !bitacoraItem.orderId || typeof bitacoraItem.orderId !== 'object') {
    return bitacoraItem;
  }

  const order = typeof bitacoraItem.orderId.toObject === 'function'
    ? bitacoraItem.orderId.toObject()
    : { ...bitacoraItem.orderId };

  order.typeLabel = isPackOrder(order) ? 'Pack' : getOrderTypeLabel(order.type);
  bitacoraItem.orderId = order;

  return bitacoraItem;
}

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDFs and images
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten PDFs e imágenes.'));
    }
  },
});

// Get user's bitácora (personal log)
router.get('/bitacora', auth, async (req, res) => {
  try {
    console.log('📋 Fetching bitácora for user:', req.user._id);
    
    const user = await User.findById(req.user._id)
      .populate('bitacora.orderId')
      .populate('bitacora.appointmentId')
      .populate('bitacora.examId')
      .populate('bitacora.controlId')
      .populate('bitacora.consultationId')
      .populate('bitacora.consentId');

    if (!user) {
      console.error('❌ User not found:', req.user._id);
      return res.status(404).json({ 
        message: 'Usuario no encontrado'
      });
    }

    // Ensure bitacora exists and is an array
    const bitacora = user.bitacora || [];

    console.log('📋 Bitácora items found:', bitacora.length);

    // Sort bitácora by date (most recent first)
    const sortedBitacora = bitacora.sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB - dateA;
    });

    // Group by type for summary
    const summary = {
      orders: sortedBitacora.filter(item => item.type === 'order').length,
      appointments: sortedBitacora.filter(item => item.type === 'appointment').length,
      exams: sortedBitacora.filter(item => item.type === 'exam').length,
      controls: sortedBitacora.filter(item => item.type === 'control').length,
      consultations: sortedBitacora.filter(item => item.type === 'consultation').length,
      consents: sortedBitacora.filter(item => item.type === 'consent').length
    };

    const normalizedBitacora = sortedBitacora.map(enrichBitacoraOrderType);

    console.log('✅ Bitácora fetched successfully', summary);
    res.json({
      bitacora: normalizedBitacora,
      totalItems: normalizedBitacora.length,
      summary
    });
  } catch (error) {
    console.error('❌ Error fetching bitácora:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error al obtener la bitácora',
      error: error.message 
    });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      message: 'Error al obtener el perfil',
      error: error.message 
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, apellidoPaterno, apellidoMaterno, rut, email, phone, dateOfBirth, gender, address } = req.body;
    const user = await User.findById(req.user._id);

    const normalizedName = String(name || '').trim();
    const normalizedApellidoPaterno = String(apellidoPaterno || '').trim();
    const normalizedApellidoMaterno = String(apellidoMaterno || '').trim();
    const normalizedRut = normalizeRut(rut);
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const normalizedGender = String(gender || '').trim().toLowerCase();
    const allowedGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
    const birthDate = dateOfBirth ? new Date(dateOfBirth) : null;

    if (!normalizedName || !normalizedApellidoPaterno || !normalizedApellidoMaterno || !normalizedRut) {
      return res.status(400).json({
        message: 'Nombre, apellido paterno, apellido materno y RUT son obligatorios'
      });
    }

    if (!isValidChileanRut(normalizedRut)) {
      return res.status(400).json({
        message: 'El RUT ingresado no es valido'
      });
    }

    if (!birthDate || Number.isNaN(birthDate.getTime())) {
      return res.status(400).json({
        message: 'La fecha de nacimiento es obligatoria y debe ser válida'
      });
    }

    if (birthDate > new Date()) {
      return res.status(400).json({
        message: 'La fecha de nacimiento no puede ser futura'
      });
    }

    if (!allowedGenders.includes(normalizedGender)) {
      return res.status(400).json({
        message: 'El género es obligatorio'
      });
    }

    user.name = normalizedName;
    user.apellidoPaterno = normalizedApellidoPaterno;
    user.apellidoMaterno = normalizedApellidoMaterno;
    user.rut = normalizedRut;

    if (normalizedEmail) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Este email ya está en uso' });
      }
      user.email = normalizedEmail;
    }
    if (phone !== undefined) user.phone = phone;
    user.dateOfBirth = birthDate;
    user.gender = normalizedGender;
    if (address) {
      if (address.street !== undefined) user.address.street = address.street;
      if (address.city !== undefined) user.address.city = address.city;
      if (address.state !== undefined) user.address.state = address.state;
      if (address.zipCode !== undefined) user.address.zipCode = address.zipCode;
      if (address.country !== undefined) user.address.country = address.country;
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).select('-password');
    res.json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el perfil',
      error: error.message 
    });
  }
});

// Generate demo data for a user
router.post('/bitacora/generate-demo', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Sample data for each type - More realistic and varied data
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const demoData = [
      // Exámenes (8 registros)
      {
        type: 'exam',
        title: 'Hemograma Completo',
        description: 'Análisis de sangre completo: glóbulos rojos, blancos, plaquetas y hemoglobina. Resultados dentro de parámetros normales.',
        status: 'completed',
        date: new Date(now - 5 * oneDay)
      },
      {
        type: 'exam',
        title: 'Perfil Lipídico',
        description: 'Análisis de colesterol total, HDL, LDL y triglicéridos. Colesterol total: 185 mg/dL (normal).',
        status: 'completed',
        date: new Date(now - 12 * oneDay)
      },
      {
        type: 'exam',
        title: 'Radiografía de Tórax PA y Lateral',
        description: 'Estudio radiológico del tórax. Sin alteraciones patológicas. Pulmones y corazón de tamaño normal.',
        status: 'completed',
        date: new Date(now - 18 * oneDay)
      },
      {
        type: 'exam',
        title: 'Glicemia en Ayunas',
        description: 'Nivel de glucosa en sangre en ayunas: 92 mg/dL (normal). Sin indicios de diabetes.',
        status: 'completed',
        date: new Date(now - 25 * oneDay)
      },
      {
        type: 'exam',
        title: 'Perfil Hepático',
        description: 'Análisis de enzimas hepáticas (ALT, AST, bilirrubina). Todos los valores dentro de rango normal.',
        status: 'completed',
        date: new Date(now - 35 * oneDay)
      },
      {
        type: 'exam',
        title: 'Ecografía Abdominal',
        description: 'Estudio ecográfico de abdomen completo. Hígado, riñones y vesícula biliar sin alteraciones.',
        status: 'completed',
        date: new Date(now - 42 * oneDay)
      },
      {
        type: 'exam',
        title: 'Electrocardiograma (ECG)',
        description: 'Registro de actividad eléctrica del corazón. Ritmo sinusal normal, sin alteraciones.',
        status: 'completed',
        date: new Date(now - 50 * oneDay)
      },
      {
        type: 'exam',
        title: 'Análisis de Orina Completo',
        description: 'Examen físico, químico y microscópico de orina. Sin presencia de proteínas, glucosa ni células anormales.',
        status: 'completed',
        date: new Date(now - 60 * oneDay)
      },
      // Controles (8 registros)
      {
        type: 'control',
        title: 'Control de Presión Arterial',
        description: 'Presión: 120/80 mmHg. Peso: 72 kg. IMC: 23.5 (normal). Sin síntomas de hipertensión.',
        status: 'completed',
        date: new Date(now - 3 * oneDay)
      },
      {
        type: 'control',
        title: 'Control de Peso y Nutrición',
        description: 'Control nutricional mensual. Peso estable. Plan alimentario balanceado. Recomendaciones: mantener hidratación adecuada.',
        status: 'completed',
        date: new Date(now - 10 * oneDay)
      },
      {
        type: 'control',
        title: 'Control de Glucosa',
        description: 'Control de glucosa capilar: 95 mg/dL. Hemoglobina glicosilada: 5.2% (excelente control).',
        status: 'completed',
        date: new Date(now - 17 * oneDay)
      },
      {
        type: 'control',
        title: 'Control Cardiológico',
        description: 'Revisión cardiológica. Frecuencia cardíaca: 68 lpm. Sin arritmias. Recomendación: continuar ejercicio regular.',
        status: 'completed',
        date: new Date(now - 28 * oneDay)
      },
      {
        type: 'control',
        title: 'Control de Vacunación',
        description: 'Revisión de esquema de vacunación. Al día con vacunas obligatorias. Próxima dosis: refuerzo en 6 meses.',
        status: 'completed',
        date: new Date(now - 38 * oneDay)
      },
      {
        type: 'control',
        title: 'Control de Visión',
        description: 'Revisión oftalmológica. Agudeza visual: 20/20. Sin cambios en la prescripción. Recomendación: uso de lentes de sol.',
        status: 'completed',
        date: new Date(now - 45 * oneDay)
      },
      {
        type: 'control',
        title: 'Control Odontológico',
        description: 'Limpieza dental y revisión. Sin caries. Encías sanas. Próxima cita: en 6 meses.',
        status: 'completed',
        date: new Date(now - 55 * oneDay)
      },
      {
        type: 'control',
        title: 'Control de Salud Mental',
        description: 'Evaluación psicológica de rutina. Estado de ánimo estable. Estrés laboral manejable. Sin indicadores de ansiedad o depresión.',
        status: 'completed',
        date: new Date(now - 65 * oneDay)
      },
      // Consultas (10 registros)
      {
        type: 'consultation',
        title: 'Consulta con Dr. Roberto Merino - Medicina Familiar',
        description: 'Consulta general de medicina familiar. Revisión de síntomas menores. Prescripción de analgésicos para dolor de cabeza ocasional.',
        status: 'completed',
        date: new Date(now - 7 * oneDay)
      },
      {
        type: 'consultation',
        title: 'Consulta con Dra. María González - Cardiólogo',
        description: 'Evaluación cardiológica de rutina. Electrocardiograma normal. Presión arterial controlada. Continuar con estilo de vida saludable.',
        status: 'completed',
        date: new Date(now - 15 * oneDay)
      },
      {
        type: 'consultation',
        title: 'Consulta con Dr. Carlos Ramírez - Dermatólogo',
        description: 'Revisión de lesiones cutáneas. Lunares sin cambios. Recomendación: protección solar diaria. Próxima revisión en 1 año.',
        status: 'completed',
        date: new Date(now - 22 * oneDay)
      },
      {
        type: 'consultation',
        title: 'Consulta de Seguimiento - Medicina General',
        description: 'Seguimiento de tratamiento para resfriado común. Mejoría completa. Sin complicaciones.',
        status: 'completed',
        date: new Date(now - 30 * oneDay)
      },
      {
        type: 'consultation',
        title: 'Consulta con Dra. Ana Martínez - Nutricionista',
        description: 'Evaluación nutricional y plan de alimentación personalizado. Objetivo: mantener peso saludable. Seguimiento en 3 meses.',
        status: 'completed',
        date: new Date(now - 40 * oneDay)
      },
      {
        type: 'consultation',
        title: 'Consulta con Dr. Luis Fernández - Traumatólogo',
        description: 'Evaluación de dolor lumbar. Diagnóstico: contractura muscular. Tratamiento: fisioterapia y antiinflamatorios.',
        status: 'completed',
        date: new Date(now - 48 * oneDay)
      },
      {
        type: 'consultation',
        title: 'Consulta de Urgencia - Medicina General',
        description: 'Consulta por fiebre y malestar general. Diagnóstico: infección viral. Reposo y medicación sintomática.',
        status: 'completed',
        date: new Date(now - 58 * oneDay)
      },
      {
        type: 'consultation',
        title: 'Consulta con Dra. Patricia Silva - Ginecólogo',
        description: 'Control ginecológico anual. Papanicolaou y examen físico normal. Próximo control en 1 año.',
        status: 'completed',
        date: new Date(now - 70 * oneDay)
      },
      {
        type: 'consultation',
        title: 'Consulta con Dr. Jorge Torres - Oftalmólogo',
        description: 'Revisión oftalmológica de rutina. Agudeza visual estable. Sin cambios en la prescripción de lentes.',
        status: 'completed',
        date: new Date(now - 75 * oneDay)
      },
      {
        type: 'consultation',
        title: 'Consulta de Medicina Preventiva',
        description: 'Consulta de medicina preventiva. Revisión de factores de riesgo. Plan de salud personalizado. Vacunación al día.',
        status: 'completed',
        date: new Date(now - 85 * oneDay)
      },
      // Consentimientos (6 registros)
      {
        type: 'consent',
        title: 'Consentimiento Informado - Procedimiento Quirúrgico Menor',
        description: 'Autorización para procedimiento de extracción de quiste sebáceo. Firma digital registrada. Procedimiento completado exitosamente.',
        status: 'signed',
        date: new Date(now - 20 * oneDay)
      },
      {
        type: 'consent',
        title: 'Consentimiento para Anestesia Local',
        description: 'Autorización para uso de anestesia local durante procedimiento quirúrgico. Sin alergias conocidas a anestésicos.',
        status: 'signed',
        date: new Date(now - 20 * oneDay)
      },
      {
        type: 'consent',
        title: 'Consentimiento para Tratamiento Médico',
        description: 'Autorización para tratamiento con antibióticos prescrito. Información sobre efectos secundarios proporcionada y comprendida.',
        status: 'signed',
        date: new Date(now - 32 * oneDay)
      },
      {
        type: 'consent',
        title: 'Consentimiento para Compartir Información Médica',
        description: 'Autorización para compartir información médica con especialistas del equipo de salud. Válido por 1 año.',
        status: 'signed',
        date: new Date(now - 45 * oneDay)
      },
      {
        type: 'consent',
        title: 'Consentimiento para Procedimiento Diagnóstico',
        description: 'Autorización para realización de ecografía abdominal. Información sobre el procedimiento proporcionada.',
        status: 'signed',
        date: new Date(now - 42 * oneDay)
      },
      {
        type: 'consent',
        title: 'Consentimiento para Participación en Estudio Clínico',
        description: 'Autorización para participación en estudio de seguimiento de salud preventiva. Consentimiento informado completo.',
        status: 'signed',
        date: new Date(now - 60 * oneDay)
      }
    ];

    // Add demo data to bitácora
    user.bitacora.push(...demoData);
    await user.save();

    console.log(`✅ Demo data generated for user: ${user.email}, ${demoData.length} items added`);
    res.json({
      message: `Datos de ejemplo generados exitosamente. Se agregaron ${demoData.length} registros a tu bitácora.`,
      itemsAdded: demoData.length,
      bitacora: user.bitacora
    });
  } catch (error) {
    console.error('❌ Error generating demo data:', error);
    res.status(500).json({ 
      message: 'Error al generar datos de ejemplo',
      error: error.message 
    });
  }
});

// Add exam to bitácora (with optional file upload)
router.post('/bitacora/exam', auth, upload.array('documents', 5), async (req, res) => {
  try {
    const { title, description, status, examId, date } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'El título del examen es requerido' });
    }

    const user = await User.findById(req.user._id);
    const bitacoraItem = {
      type: 'exam',
      title,
      description: description || '',
      status: status || 'completed',
      examId: examId || null,
      date: date ? new Date(date) : new Date(),
      documents: []
    };

    // Upload files to S3 if provided
    if (req.files && req.files.length > 0 && process.env.AWS_S3_BUCKET_NAME) {
      for (const file of req.files) {
        try {
          const s3Result = await uploadBitacoraDocumentToS3(
            file.buffer,
            file.originalname,
            user._id.toString(),
            'exam'
          );
          
          bitacoraItem.documents.push({
            fileName: file.originalname,
            s3Key: s3Result.key,
            fileType: file.mimetype.includes('pdf') ? 'pdf' : 'image',
            uploadedAt: new Date()
          });
        } catch (uploadError) {
          console.error('Error uploading file to S3:', uploadError);
          // Continue even if one file fails
        }
      }
    }

    user.bitacora.push(bitacoraItem);
    await user.save();

    console.log('✅ Exam added to bitácora:', bitacoraItem.title);
    res.status(201).json({
      message: 'Examen agregado a tu bitácora exitosamente',
      bitacoraItem
    });
  } catch (error) {
    console.error('❌ Error adding exam to bitácora:', error);
    res.status(500).json({ 
      message: 'Error al agregar el examen a la bitácora',
      error: error.message 
    });
  }
});

// Add control to bitácora (with optional file upload)
router.post('/bitacora/control', auth, upload.array('documents', 5), async (req, res) => {
  try {
    const { title, description, status, controlId, date } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'El título del control es requerido' });
    }

    const user = await User.findById(req.user._id);
    const bitacoraItem = {
      type: 'control',
      title,
      description: description || '',
      status: status || 'completed',
      controlId: controlId || null,
      date: date ? new Date(date) : new Date(),
      documents: []
    };

    // Upload files to S3 if provided
    if (req.files && req.files.length > 0 && process.env.AWS_S3_BUCKET_NAME) {
      for (const file of req.files) {
        try {
          const s3Result = await uploadBitacoraDocumentToS3(
            file.buffer,
            file.originalname,
            user._id.toString(),
            'control'
          );
          
          bitacoraItem.documents.push({
            fileName: file.originalname,
            s3Key: s3Result.key,
            fileType: file.mimetype.includes('pdf') ? 'pdf' : 'image',
            uploadedAt: new Date()
          });
        } catch (uploadError) {
          console.error('Error uploading file to S3:', uploadError);
        }
      }
    }

    user.bitacora.push(bitacoraItem);
    await user.save();

    console.log('✅ Control added to bitácora:', bitacoraItem.title);
    res.status(201).json({
      message: 'Control agregado a tu bitácora exitosamente',
      bitacoraItem
    });
  } catch (error) {
    console.error('❌ Error adding control to bitácora:', error);
    res.status(500).json({ 
      message: 'Error al agregar el control a la bitácora',
      error: error.message 
    });
  }
});

// Add consultation to bitácora (with optional file upload)
router.post('/bitacora/consultation', auth, upload.array('documents', 5), async (req, res) => {
  try {
    const { title, description, status, consultationId, date } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'El título de la consulta es requerido' });
    }

    const user = await User.findById(req.user._id);
    const bitacoraItem = {
      type: 'consultation',
      title,
      description: description || '',
      status: status || 'completed',
      consultationId: consultationId || null,
      date: date ? new Date(date) : new Date(),
      documents: []
    };

    // Upload files to S3 if provided
    if (req.files && req.files.length > 0 && process.env.AWS_S3_BUCKET_NAME) {
      for (const file of req.files) {
        try {
          const s3Result = await uploadBitacoraDocumentToS3(
            file.buffer,
            file.originalname,
            user._id.toString(),
            'consultation'
          );
          
          bitacoraItem.documents.push({
            fileName: file.originalname,
            s3Key: s3Result.key,
            fileType: file.mimetype.includes('pdf') ? 'pdf' : 'image',
            uploadedAt: new Date()
          });
        } catch (uploadError) {
          console.error('Error uploading file to S3:', uploadError);
        }
      }
    }

    user.bitacora.push(bitacoraItem);
    await user.save();

    console.log('✅ Consultation added to bitácora:', bitacoraItem.title);
    res.status(201).json({
      message: 'Consulta agregada a tu bitácora exitosamente',
      bitacoraItem
    });
  } catch (error) {
    console.error('❌ Error adding consultation to bitácora:', error);
    res.status(500).json({ 
      message: 'Error al agregar la consulta a la bitácora',
      error: error.message 
    });
  }
});

// Add consent to bitácora (with optional file upload)
router.post('/bitacora/consent', auth, upload.array('documents', 5), async (req, res) => {
  try {
    const { title, description, status, consentId, date } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'El título del consentimiento es requerido' });
    }

    const user = await User.findById(req.user._id);
    const bitacoraItem = {
      type: 'consent',
      title,
      description: description || '',
      status: status || 'signed',
      consentId: consentId || null,
      date: date ? new Date(date) : new Date(),
      documents: []
    };

    // Upload files to S3 if provided
    if (req.files && req.files.length > 0 && process.env.AWS_S3_BUCKET_NAME) {
      for (const file of req.files) {
        try {
          const s3Result = await uploadBitacoraDocumentToS3(
            file.buffer,
            file.originalname,
            user._id.toString(),
            'consent'
          );
          
          bitacoraItem.documents.push({
            fileName: file.originalname,
            s3Key: s3Result.key,
            fileType: file.mimetype.includes('pdf') ? 'pdf' : 'image',
            uploadedAt: new Date()
          });
        } catch (uploadError) {
          console.error('Error uploading file to S3:', uploadError);
        }
      }
    }

    user.bitacora.push(bitacoraItem);
    await user.save();

    console.log('✅ Consent added to bitácora:', bitacoraItem.title);
    res.status(201).json({
      message: 'Consentimiento agregado a tu bitácora exitosamente',
      bitacoraItem
    });
  } catch (error) {
    console.error('❌ Error adding consent to bitácora:', error);
    res.status(500).json({ 
      message: 'Error al agregar el consentimiento a la bitácora',
      error: error.message 
    });
  }
});

// Get presigned URL for a document in bitácora
router.get('/bitacora/document/:s3Key', auth, async (req, res) => {
  try {
    const { s3Key } = req.params;
    const decodedS3Key = decodeURIComponent(s3Key);
    
    // Verify the document belongs to the user
    const user = await User.findById(req.user._id);
    const userHasDocument = user.bitacora.some(item => 
      item.documents && item.documents.some(doc => doc.s3Key === decodedS3Key)
    );

    if (!userHasDocument) {
      return res.status(403).json({ message: 'No tienes acceso a este documento' });
    }

    // Generate presigned URL (valid for 1 hour)
    const presignedUrl = await getPresignedUrl(decodedS3Key, 3600);

    res.json({
      url: presignedUrl
    });
  } catch (error) {
    console.error('Error getting document URL:', error);
    res.status(500).json({ 
      message: 'Error al obtener la URL del documento',
      error: error.message 
    });
  }
});

// Get clinical timeline and patterns analysis
router.get('/clinical/timeline', auth, async (req, res) => {
  try {
    const analysis = await analyzeLongitudinalPatterns(req.user._id);
    res.json(analysis);
  } catch (error) {
    console.error('Error getting clinical timeline:', error);
    res.status(500).json({ 
      message: 'Error al obtener el análisis clínico',
      error: error.message 
    });
  }
});

// Get patient copilot (translation and recommendations)
router.get('/clinical/copilot', auth, async (req, res) => {
  try {
    const copilot = await generatePatientCopilot(req.user._id);
    res.json(copilot);
  } catch (error) {
    console.error('Error getting patient copilot:', error);
    res.status(500).json({ 
      message: 'Error al obtener el copiloto del paciente',
      error: error.message 
    });
  }
});

// Get current authenticated user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    // Return user in the same format as login/register
    res.json({ 
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        apellidoPaterno: user.apellidoPaterno,
        apellidoMaterno: user.apellidoMaterno,
        rut: user.rut,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        userprofile: user.userprofile || 'user',
        address: user.address
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ 
      message: 'Error al obtener el usuario actual',
      error: error.message 
    });
  }
});

// Delete a specific bitácora entry
router.delete('/bitacora/:entryId', auth, async (req, res) => {
  try {
    const { entryId } = req.params;
    console.log('🗑️ Deleting bitácora entry:', entryId, 'for user:', req.user._id);
    
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('❌ User not found:', req.user._id);
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    // Find and remove the bitácora entry
    const originalLength = user.bitacora.length;
    user.bitacora = user.bitacora.filter(entry => entry._id.toString() !== entryId);
    
    if (user.bitacora.length === originalLength) {
      console.error('❌ Bitácora entry not found:', entryId);
      return res.status(404).json({ 
        success: false, 
        message: 'Registro de bitácora no encontrado' 
      });
    }

    await user.save();
    
    console.log('✅ Bitácora entry deleted successfully:', entryId);
    res.status(200).json({ 
      success: true, 
      message: 'Registro eliminado exitosamente',
      deletedId: entryId
    });
  } catch (error) {
    console.error('❌ Error deleting bitácora entry:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al eliminar el registro' 
    });
  }
});

// Delete all bitácora entries for user
router.delete('/bitacora', auth, async (req, res) => {
  try {
    console.log('🗑️ Deleting ALL bitácora entries for user:', req.user._id);
    
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('❌ User not found:', req.user._id);
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    const deletedCount = user.bitacora.length;
    user.bitacora = [];
    await user.save();
    
    console.log('✅ All bitácora entries deleted, count:', deletedCount);
    res.status(200).json({ 
      success: true, 
      message: `Se eliminaron ${deletedCount} registros de la bitácora`,
      deletedCount
    });
  } catch (error) {
    console.error('❌ Error deleting all bitácora entries:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al eliminar todos los registros' 
    });
  }
});

module.exports = router;
