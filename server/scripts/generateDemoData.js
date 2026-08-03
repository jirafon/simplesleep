#!/usr/bin/env node

/**
 * Script para generar datos de ejemplo en la bitácora del usuario hello@eticpro.com
 * 
 * Uso: node scripts/generateDemoData.js
 * 
 * Requiere: MONGO_URL configurado en server/.env
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const TARGET_EMAIL = 'hello@eticpro.com';

// Generate comprehensive demo data
function generateDemoData() {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  return [
    // Exámenes (10 registros)
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
    {
      type: 'exam',
      title: 'Prueba de Función Tiroidea (TSH, T3, T4)',
      description: 'Análisis de hormonas tiroideas. Valores dentro de rango normal. Función tiroidea adecuada.',
      status: 'completed',
      date: new Date(now - 70 * oneDay)
    },
    {
      type: 'exam',
      title: 'Densitometría Ósea',
      description: 'Estudio de densidad mineral ósea. Resultados normales para la edad. Sin indicios de osteoporosis.',
      status: 'completed',
      date: new Date(now - 80 * oneDay)
    },
    // Controles (10 registros)
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
    {
      type: 'control',
      title: 'Control de Medicamentos',
      description: 'Revisión de medicamentos en uso. Sin interacciones. Dosis adecuadas. Continuar con tratamiento actual.',
      status: 'completed',
      date: new Date(now - 75 * oneDay)
    },
    {
      type: 'control',
      title: 'Control de Alergias',
      description: 'Revisión de alergias conocidas. Sin nuevas alergias detectadas. Mantener precauciones con alérgenos conocidos.',
      status: 'completed',
      date: new Date(now - 85 * oneDay)
    },
    // Consultas (12 registros)
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
    {
      type: 'consultation',
      title: 'Consulta con Dr. Andrés Morales - Endocrinólogo',
      description: 'Evaluación endocrinológica. Función tiroidea normal. Metabolismo estable. Sin alteraciones hormonales.',
      status: 'completed',
      date: new Date(now - 90 * oneDay)
    },
    {
      type: 'consultation',
      title: 'Consulta Telemedicina - Seguimiento',
      description: 'Consulta de seguimiento vía telemedicina. Revisión de síntomas. Tratamiento efectivo. Próxima consulta presencial en 2 meses.',
      status: 'completed',
      date: new Date(now - 95 * oneDay)
    },
    // Consentimientos (8 registros)
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
    },
    {
      type: 'consent',
      title: 'Consentimiento para Uso de Imágenes Médicas',
      description: 'Autorización para uso de imágenes médicas (radiografías, ecografías) con fines educativos y de investigación. Anonimización garantizada.',
      status: 'signed',
      date: new Date(now - 50 * oneDay)
    },
    {
      type: 'consent',
      title: 'Consentimiento para Tratamiento con Medicamentos Controlados',
      description: 'Autorización para tratamiento con medicamentos de control especial. Información sobre dependencia y efectos secundarios proporcionada.',
      status: 'signed',
      date: new Date(now - 35 * oneDay)
    }
  ];
}

async function main() {
  try {
    // Connect to MongoDB
    const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/siempresalud';
    console.log('\n🔗 Connecting to MongoDB...');
    console.log('   MONGO_URL (sanitized):', MONGO_URL.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB\n');

    // Find user
    console.log(`🔍 Looking for user: ${TARGET_EMAIL}`);
    const user = await User.findOne({ email: TARGET_EMAIL });
    
    if (!user) {
      console.error(`❌ User not found: ${TARGET_EMAIL}`);
      console.log('\n💡 Please make sure the user exists in the database.');
      process.exit(1);
    }

    console.log(`✅ User found: ${user.name} (${user.email})`);
    console.log(`   Current bitácora items: ${user.bitacora.length}\n`);

    // Generate demo data
    const demoData = generateDemoData();
    console.log(`📝 Generating ${demoData.length} demo records...`);
    
    // Count by type
    const counts = demoData.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('   Breakdown:');
    Object.entries(counts).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count} records`);
    });
    console.log('');

    // Add demo data to bitácora
    user.bitacora.push(...demoData);
    await user.save();

    console.log(`✅ Demo data generated successfully!`);
    console.log(`   Total bitácora items: ${user.bitacora.length}`);
    console.log(`   New items added: ${demoData.length}\n`);

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    console.log('\n✨ Done!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run script
main();
