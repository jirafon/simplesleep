const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Order = require('../models/Order');
const User = require('../models/User');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/siempresalud';

// Exam types and names
const examTypes = ['PAP', 'thyroid', 'hypertension', 'mammography', 'custom'];
const examNames = [
  'Hemograma Completo',
  'Perfil Lipídico',
  'Glicemia en Ayunas',
  'Perfil Hepático',
  'Radiografía de Tórax',
  'Ecografía Abdominal',
  'Electrocardiograma (ECG)',
  'Análisis de Orina',
  'Papanicolaou',
  'Mamografía',
  'Ecografía de Tiroides',
  'Densitometría Ósea',
  'Colonoscopia',
  'Endoscopia',
  'Tomografía Computarizada',
  'Resonancia Magnética',
  'Prueba de Esfuerzo',
  'Holter de 24 horas',
  'Espirometría',
  'Prueba de Alergias',
  'Biopsia de Piel',
  'Análisis de Sangre Completo',
  'Prueba de Función Renal',
  'Prueba de Función Tiroidea',
  'Marcadores Tumorales',
  'Prueba de Coagulación',
  'Serología',
  'Cultivo de Orina',
  'Examen de Heces',
  'Prueba de Glucosa',
  'Hemoglobina Glicosilada',
  'Vitamina D',
  'Ácido Fólico',
  'Vitamina B12',
  'Ferritina',
  'PSA (Antígeno Prostático)',
  'Prueba de Embarazo',
  'Prueba de VIH',
  'Hepatitis B y C',
  'Prueba de Tuberculosis'
];

const statuses = ['pending', 'processing', 'completed', 'cancelled'];
const doctorNames = ['Roberto Merino', 'Dr. Carlos Ramírez', 'Dra. María González', 'Dr. Luis Fernández', 'Dra. Ana Martínez'];

async function generateRecords() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Find or create the user
    let user = await User.findOne({ email: 'hello@eticpro.com' });
    
    if (!user) {
      console.log('⚠️  User hello@eticpro.com not found. Creating user...');
      user = new User({
        name: 'Usuario de Prueba',
        email: 'hello@eticpro.com',
        password: 'password123', // Will be hashed by pre-save hook
        bitacora: []
      });
      await user.save();
      console.log('✅ User created');
    } else {
      console.log('✅ User found:', user.email);
    }

    console.log(`\n📝 Generating 50 records for user: ${user.email}...\n`);

    const records = [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Generate 50 records with variety
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
      const createdAt = new Date(now - (daysAgo * oneDay));
      
      const examType = examTypes[Math.floor(Math.random() * examTypes.length)];
      const examName = examNames[Math.floor(Math.random() * examNames.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const doctorName = doctorNames[Math.floor(Math.random() * doctorNames.length)];
      
      // Generate multiple exams for some orders
      const numExams = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 2 : 1;
      const exams = [];
      for (let j = 0; j < numExams; j++) {
        exams.push(examNames[Math.floor(Math.random() * examNames.length)]);
      }
      const uniqueExams = [...new Set(exams)]; // Remove duplicates

      const order = new Order({
        userId: user._id,
        type: examType,
        examName: examName,
        exams: uniqueExams,
        status: status,
        doctorName: doctorName,
        notes: `Registro generado automáticamente para pruebas. Orden #${i + 1}`,
        orderDate: createdAt,
        createdAt: createdAt
      });

      // Add creation log
      order.logs.push({
        action: 'created',
        performedBy: user._id,
        performedByName: user.name || user.email,
        previousStatus: null,
        newStatus: 'pending',
        notes: 'Orden médica creada',
        timestamp: createdAt
      });

      // If status is completed, add approval log
      if (status === 'completed') {
        const approvedAt = new Date(createdAt.getTime() + Math.random() * 7 * oneDay);
        order.approvedAt = approvedAt;
        order.approvedBy = user._id; // In real scenario, this would be an admin
        
        order.logs.push({
          action: 'approved',
          performedBy: user._id,
          performedByName: 'Sistema (Aprobación automática)',
          previousStatus: 'pending',
          newStatus: 'completed',
          notes: 'Aprobación automática',
          timestamp: approvedAt
        });
      }

      // If status is cancelled, add rejection log
      if (status === 'cancelled') {
        const rejectedAt = new Date(createdAt.getTime() + Math.random() * 3 * oneDay);
        order.logs.push({
          action: 'rejected',
          performedBy: user._id,
          performedByName: 'Sistema',
          previousStatus: 'pending',
          newStatus: 'cancelled',
          notes: 'Orden rechazada por el sistema',
          timestamp: rejectedAt
        });
      }

      // If status is processing, add status change log
      if (status === 'processing') {
        const processingAt = new Date(createdAt.getTime() + Math.random() * 2 * oneDay);
        order.logs.push({
          action: 'status_changed',
          performedBy: user._id,
          performedByName: 'Sistema',
          previousStatus: 'pending',
          newStatus: 'processing',
          notes: 'Orden en proceso',
          timestamp: processingAt
        });
      }

      records.push(order);
    }

    // Save all records
    console.log('💾 Saving records to database...');
    await Order.insertMany(records);
    console.log(`✅ Successfully created ${records.length} records`);

    // Add records to user's bitácora
    console.log('📋 Adding records to user bitácora...');
    for (const order of records) {
      user.bitacora.push({
        type: 'order',
        orderId: order._id,
        date: order.createdAt
      });
    }
    await user.save();
    console.log('✅ Records added to user bitácora');

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Total records created: ${records.length}`);
    console.log(`   Pending: ${records.filter(r => r.status === 'pending').length}`);
    console.log(`   Processing: ${records.filter(r => r.status === 'processing').length}`);
    console.log(`   Completed: ${records.filter(r => r.status === 'completed').length}`);
    console.log(`   Cancelled: ${records.filter(r => r.status === 'cancelled').length}`);
    console.log(`   User: ${user.email}`);
    console.log(`   User ID: ${user._id}`);

    console.log('\n✅ All records generated successfully!');
    console.log('👨‍⚕️ Doctors can now view these records at /doctor/records\n');

  } catch (error) {
    console.error('❌ Error generating records:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
if (require.main === module) {
  generateRecords()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = generateRecords;
