const OpenAI = require('openai');
const Order = require('../models/Order');
const User = require('../models/User');

// Initialize OpenAI client - will be set when function is called
let openai = null;

function getOpenAIClient() {
  if (!openai) {
    const apiKey = process.env.OPEN_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('OPEN_API_KEY no está configurada en las variables de entorno');
    }
    console.log('🔑 Initializing OpenAI client with OPEN_API_KEY:', apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 4));
    openai = new OpenAI({
      apiKey: apiKey
    });
  }
  return openai;
}

/**
 * Analyze longitudinal patterns in patient records
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Analysis with patterns, alerts, and timeline
 */
async function analyzeLongitudinalPatterns(userId) {
  try {
    // Get all orders for the user
    const orders = await Order.find({ userId })
      .populate('userId', 'name email dateOfBirth gender')
      .sort({ createdAt: 1 }); // Oldest first for timeline

    if (orders.length === 0) {
      return {
        patterns: [],
        alerts: [],
        timeline: [],
        riskFactors: []
      };
    }

    const user = orders[0].userId;
    const age = user.dateOfBirth 
      ? Math.floor((new Date() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    // Group exams by type
    const examGroups = {};
    orders.forEach(order => {
      const exams = Array.isArray(order.exams) && order.exams.length > 0 
        ? order.exams 
        : [order.examName];
      
      exams.forEach(exam => {
        if (!examGroups[exam]) {
          examGroups[exam] = [];
        }
        examGroups[exam].push({
          date: order.createdAt,
          status: order.status,
          orderId: order._id
        });
      });
    });

    // Detect patterns
    const patterns = detectPatterns(examGroups, age, user.gender);
    const alerts = generateProactiveAlerts(orders, patterns, age, user.gender);
    const timeline = buildTimeline(orders);
    const riskFactors = assessRiskFactors(orders, age, user.gender);

    return {
      patterns,
      alerts,
      timeline,
      riskFactors,
      summary: {
        totalRecords: orders.length,
        dateRange: {
          start: orders[0].createdAt,
          end: orders[orders.length - 1].createdAt
        },
        patientAge: age,
        gender: user.gender
      }
    };
  } catch (error) {
    console.error('Error analyzing longitudinal patterns:', error);
    throw error;
  }
}

/**
 * Detect patterns in repeated exams
 */
function detectPatterns(examGroups, age, gender) {
  const patterns = [];

  Object.keys(examGroups).forEach(examName => {
    const exams = examGroups[examName];
    if (exams.length >= 2) {
      // Repeated exam detected
      const timeSpan = new Date(exams[exams.length - 1].date) - new Date(exams[0].date);
      const daysBetween = timeSpan / (1000 * 60 * 60 * 24);
      const frequency = exams.length / (daysBetween / 365); // Per year

      patterns.push({
        examName,
        frequency: frequency.toFixed(2),
        count: exams.length,
        firstDate: exams[0].date,
        lastDate: exams[exams.length - 1].date,
        type: 'repeated_exam',
        significance: frequency > 4 ? 'high' : frequency > 2 ? 'medium' : 'low'
      });
    }
  });

  return patterns;
}

/**
 * Generate proactive alerts
 */
function generateProactiveAlerts(orders, patterns, age, gender) {
  const alerts = [];

  // Alert: Repeated exams with high frequency
  patterns.forEach(pattern => {
    if (pattern.significance === 'high') {
      alerts.push({
        type: 'repeated_exam_high_frequency',
        severity: 'medium',
        title: 'Examen repetido con alta frecuencia',
        message: `El examen "${pattern.examName}" se ha realizado ${pattern.count} veces en un período corto. Considera revisar la necesidad de seguimiento continuo.`,
        examName: pattern.examName,
        recommendation: 'Evaluar si se requiere seguimiento especializado o cambio en el plan de tratamiento.'
      });
    }
  });

  // Alert: Diabetes risk detection
  const diabetesAlerts = detectDiabetesRisk(orders, age, gender);
  alerts.push(...diabetesAlerts);

  // Alert: Hypertension risk detection
  const hypertensionAlerts = detectHypertensionRisk(orders, age, gender);
  alerts.push(...hypertensionAlerts);

  // Alert: Cholesterol/Lipid risk
  const lipidAlerts = detectLipidRisk(orders, age, gender);
  alerts.push(...lipidAlerts);

  // Alert: Thyroid risk
  const thyroidAlerts = detectThyroidRisk(orders, age, gender);
  alerts.push(...thyroidAlerts);

  // Alert: Kidney function risk
  const kidneyAlerts = detectKidneyRisk(orders, age, gender);
  alerts.push(...kidneyAlerts);

  // Alert: Liver function risk
  const liverAlerts = detectLiverRisk(orders, age, gender);
  alerts.push(...liverAlerts);

  // Alert: Cancer screening recommendations
  const cancerAlerts = detectCancerScreeningNeeds(orders, age, gender);
  alerts.push(...cancerAlerts);

  // Alert: Cardiovascular risk (based on age and exam types)
  if (age && age >= 40) {
    const hasCardioExams = orders.some(order => {
      const exams = Array.isArray(order.exams) ? order.exams : [order.examName];
      return exams.some(exam => 
        exam.toLowerCase().includes('cardio') || 
        exam.toLowerCase().includes('corazón') ||
        exam.toLowerCase().includes('ecg') ||
        exam.toLowerCase().includes('electro')
      );
    });

    if (hasCardioExams) {
      alerts.push({
        type: 'cardiovascular_risk',
        severity: 'high',
        title: 'Riesgo Cardiovascular',
        message: `Paciente de ${age} años con exámenes cardiovasculares. Se recomienda evaluación de factores de riesgo cardiovascular.`,
        recommendation: 'Considerar evaluación de presión arterial, colesterol, y factores de riesgo cardiovascular adicionales.'
      });
    }
  }

  // Alert: Preventive care based on age and gender
  if (age && gender) {
    if (gender === 'female' && age >= 21 && age <= 65) {
      const hasPap = orders.some(order => {
        const exams = Array.isArray(order.exams) ? order.exams : [order.examName];
        return exams.some(exam => exam.toLowerCase().includes('pap') || exam.toLowerCase().includes('papanicolaou'));
      });

      if (!hasPap) {
        alerts.push({
          type: 'preventive_care',
          severity: 'low',
          title: 'Cuidado Preventivo Recomendado',
          message: `Paciente mujer de ${age} años. Se recomienda realizar Papanicolaou según guías de salud preventiva.`,
          recommendation: 'Consultar con médico sobre exámenes preventivos recomendados para tu edad y género.'
        });
      }
    }

    if (age >= 50) {
      alerts.push({
        type: 'preventive_care_age',
        severity: 'medium',
        title: 'Exámenes Preventivos por Edad',
        message: `Paciente de ${age} años. Se recomienda revisar exámenes preventivos según edad (colonoscopia, mamografía, etc.).`,
        recommendation: 'Consultar con médico sobre exámenes de detección temprana recomendados para tu edad.'
      });
    }
  }

  // Alert: Long time without exams
  if (orders.length > 0) {
    const lastExamDate = new Date(orders[orders.length - 1].createdAt);
    const daysSinceLastExam = (new Date() - lastExamDate) / (1000 * 60 * 60 * 24);

    if (daysSinceLastExam > 365) {
      alerts.push({
        type: 'long_time_without_exams',
        severity: 'low',
        title: 'Tiempo prolongado sin exámenes',
        message: `Han pasado ${Math.floor(daysSinceLastExam / 30)} meses desde el último examen.`,
        recommendation: 'Considera realizar un control médico de rutina.'
      });
    }
  }

  return alerts;
}

/**
 * Detect diabetes risk based on exams and patterns
 */
function detectDiabetesRisk(orders, age, gender) {
  const alerts = [];
  const diabetesKeywords = ['glucosa', 'glicemia', 'hemoglobina glicosilada', 'hba1c', 'diabetes', 'glicemia en ayunas', 'tolerancia a la glucosa'];
  
  const diabetesExams = orders.filter(order => {
    const exams = Array.isArray(order.exams) ? order.exams : [order.examName];
    return exams.some(exam => 
      diabetesKeywords.some(keyword => exam.toLowerCase().includes(keyword))
    );
  });

  if (diabetesExams.length > 0) {
    // High risk if age >= 45 or has multiple diabetes-related exams
    if (age && age >= 45) {
      alerts.push({
        type: 'diabetes_risk',
        severity: 'high',
        title: 'Riesgo de Diabetes',
        message: `Paciente de ${age} años con exámenes relacionados con diabetes. La edad es un factor de riesgo importante para diabetes tipo 2.`,
        recommendation: 'Se recomienda monitoreo regular de glucosa, mantener un peso saludable, dieta balanceada y ejercicio regular. Consultar con endocrinólogo si los valores están alterados.'
      });
    } else if (diabetesExams.length >= 2) {
      alerts.push({
        type: 'diabetes_monitoring',
        severity: 'medium',
        title: 'Monitoreo de Diabetes',
        message: `Se han realizado ${diabetesExams.length} exámenes relacionados con diabetes. Es importante mantener un seguimiento regular.`,
        recommendation: 'Continuar con controles periódicos de glucosa según indicación médica. Mantener hábitos de vida saludables.'
      });
    } else if (age && age >= 35) {
      alerts.push({
        type: 'diabetes_prevention',
        severity: 'low',
        title: 'Prevención de Diabetes',
        message: `Paciente de ${age} años. Se recomienda evaluación periódica de riesgo de diabetes.`,
        recommendation: 'Realizar exámenes de glucosa en ayunas anualmente. Mantener peso saludable y actividad física regular.'
      });
    }
  }

  return alerts;
}

/**
 * Detect hypertension risk
 */
function detectHypertensionRisk(orders, age, gender) {
  const alerts = [];
  const hypertensionKeywords = ['presión arterial', 'tensión arterial', 'hipertensión', 'monitoreo ambulatorio', 'mapa'];
  
  const hypertensionExams = orders.filter(order => {
    const exams = Array.isArray(order.exams) ? order.exams : [order.examName];
    return exams.some(exam => 
      hypertensionKeywords.some(keyword => exam.toLowerCase().includes(keyword))
    );
  });

  if (hypertensionExams.length > 0) {
    if (age && age >= 40) {
      alerts.push({
        type: 'hypertension_risk',
        severity: 'high',
        title: 'Riesgo de Hipertensión',
        message: `Paciente de ${age} años con exámenes relacionados con presión arterial. La hipertensión es más común después de los 40 años.`,
        recommendation: 'Monitorear presión arterial regularmente. Reducir consumo de sodio, mantener peso saludable, ejercicio regular y evitar tabaco. Consultar con cardiólogo si hay valores elevados persistentes.'
      });
    } else if (hypertensionExams.length >= 2) {
      alerts.push({
        type: 'hypertension_monitoring',
        severity: 'medium',
        title: 'Monitoreo de Hipertensión',
        message: `Se han realizado ${hypertensionExams.length} exámenes relacionados con presión arterial.`,
        recommendation: 'Continuar con controles regulares. Mantener dieta baja en sodio y actividad física.'
      });
    }
  } else if (age && age >= 40) {
    // Preventive alert if no hypertension exams but age is risk factor
    alerts.push({
      type: 'hypertension_screening',
      severity: 'low',
      title: 'Evaluación de Presión Arterial Recomendada',
      message: `Paciente de ${age} años. Se recomienda evaluación periódica de presión arterial.`,
      recommendation: 'Realizar medición de presión arterial al menos una vez al año. Consultar con médico si hay antecedentes familiares de hipertensión.'
    });
  }

  return alerts;
}

/**
 * Detect lipid/cholesterol risk
 */
function detectLipidRisk(orders, age, gender) {
  const alerts = [];
  const lipidKeywords = ['colesterol', 'triglicéridos', 'perfil lipídico', 'hdl', 'ldl', 'dislipidemia'];
  
  const lipidExams = orders.filter(order => {
    const exams = Array.isArray(order.exams) ? order.exams : [order.examName];
    return exams.some(exam => 
      lipidKeywords.some(keyword => exam.toLowerCase().includes(keyword))
    );
  });

  if (lipidExams.length > 0) {
    if (age && age >= 45) {
      alerts.push({
        type: 'cardiovascular_lipid_risk',
        severity: 'high',
        title: 'Riesgo Cardiovascular - Perfil Lipídico',
        message: `Paciente de ${age} años con exámenes de perfil lipídico. Los niveles de colesterol son importantes para la salud cardiovascular.`,
        recommendation: 'Mantener dieta baja en grasas saturadas, ejercicio regular, y controlar peso. Si los valores están alterados, seguir tratamiento médico indicado.'
      });
    } else if (lipidExams.length >= 2) {
      alerts.push({
        type: 'lipid_monitoring',
        severity: 'medium',
        title: 'Monitoreo de Perfil Lipídico',
        message: `Se han realizado ${lipidExams.length} exámenes de perfil lipídico.`,
        recommendation: 'Continuar con controles según indicación médica. Mantener hábitos alimenticios saludables.'
      });
    }
  } else if (age && age >= 40) {
    alerts.push({
      type: 'lipid_screening',
      severity: 'low',
      title: 'Evaluación de Colesterol Recomendada',
      message: `Paciente de ${age} años. Se recomienda evaluación de perfil lipídico cada 5 años.`,
      recommendation: 'Realizar perfil lipídico completo para evaluar riesgo cardiovascular.'
    });
  }

  return alerts;
}

/**
 * Detect thyroid risk
 */
function detectThyroidRisk(orders, age, gender) {
  const alerts = [];
  const thyroidKeywords = ['tiroides', 'tsh', 't4', 't3', 'hormona tiroidea', 'hipotiroidismo', 'hipertiroidismo'];
  
  const thyroidExams = orders.filter(order => {
    const exams = Array.isArray(order.exams) ? order.exams : [order.examName];
    return exams.some(exam => 
      thyroidKeywords.some(keyword => exam.toLowerCase().includes(keyword))
    );
  });

  if (thyroidExams.length > 0) {
    // Thyroid issues are more common in women
    if (gender === 'female' && age && age >= 30) {
      alerts.push({
        type: 'thyroid_risk_female',
        severity: 'medium',
        title: 'Monitoreo de Función Tiroidea',
        message: `Paciente mujer de ${age} años con exámenes de tiroides. Las mujeres tienen mayor riesgo de problemas tiroideos.`,
        recommendation: 'Continuar con controles regulares de función tiroidea. Consultar con endocrinólogo si hay síntomas como fatiga, cambios de peso o alteraciones del ánimo.'
      });
    } else if (thyroidExams.length >= 2) {
      alerts.push({
        type: 'thyroid_monitoring',
        severity: 'medium',
        title: 'Monitoreo de Tiroides',
        message: `Se han realizado ${thyroidExams.length} exámenes de función tiroidea.`,
        recommendation: 'Mantener seguimiento según indicación médica. Estar atento a síntomas de disfunción tiroidea.'
      });
    }
  } else if (gender === 'female' && age && age >= 35) {
    alerts.push({
      type: 'thyroid_screening_female',
      severity: 'low',
      title: 'Evaluación de Tiroides Recomendada',
      message: `Paciente mujer de ${age} años. Se recomienda evaluación de función tiroidea periódicamente.`,
      recommendation: 'Considerar evaluación de TSH si hay síntomas como fatiga, cambios de peso, o antecedentes familiares de problemas tiroideos.'
    });
  }

  return alerts;
}

/**
 * Detect kidney function risk
 */
function detectKidneyRisk(orders, age, gender) {
  const alerts = [];
  const kidneyKeywords = ['creatinina', 'urea', 'función renal', 'filtrado glomerular', 'proteinuria', 'riñón'];
  
  const kidneyExams = orders.filter(order => {
    const exams = Array.isArray(order.exams) ? order.exams : [order.examName];
    return exams.some(exam => 
      kidneyKeywords.some(keyword => exam.toLowerCase().includes(keyword))
    );
  });

  if (kidneyExams.length > 0) {
    if (age && age >= 50) {
      alerts.push({
        type: 'kidney_function_risk',
        severity: 'medium',
        title: 'Monitoreo de Función Renal',
        message: `Paciente de ${age} años con exámenes de función renal. La función renal puede disminuir con la edad.`,
        recommendation: 'Mantener hidratación adecuada, controlar presión arterial y diabetes si están presentes. Evitar medicamentos nefrotóxicos sin supervisión médica.'
      });
    } else if (kidneyExams.length >= 2) {
      alerts.push({
        type: 'kidney_monitoring',
        severity: 'medium',
        title: 'Monitoreo de Función Renal',
        message: `Se han realizado ${kidneyExams.length} exámenes de función renal.`,
        recommendation: 'Continuar con controles según indicación médica. Mantener buena hidratación.'
      });
    }
  } else if (age && age >= 50) {
    alerts.push({
      type: 'kidney_screening',
      severity: 'low',
      title: 'Evaluación de Función Renal Recomendada',
      message: `Paciente de ${age} años. Se recomienda evaluación de función renal periódicamente.`,
      recommendation: 'Realizar exámenes de creatinina y urea anualmente, especialmente si hay diabetes o hipertensión.'
    });
  }

  return alerts;
}

/**
 * Detect liver function risk
 */
function detectLiverRisk(orders, age, gender) {
  const alerts = [];
  const liverKeywords = ['transaminasas', 'alt', 'ast', 'bilirrubina', 'función hepática', 'perfil hepático', 'hígado'];
  
  const liverExams = orders.filter(order => {
    const exams = Array.isArray(order.exams) ? order.exams : [order.examName];
    return exams.some(exam => 
      liverKeywords.some(keyword => exam.toLowerCase().includes(keyword))
    );
  });

  if (liverExams.length > 0) {
    if (liverExams.length >= 2) {
      alerts.push({
        type: 'liver_monitoring',
        severity: 'medium',
        title: 'Monitoreo de Función Hepática',
        message: `Se han realizado ${liverExams.length} exámenes de función hepática.`,
        recommendation: 'Continuar con controles según indicación médica. Evitar consumo excesivo de alcohol y mantener peso saludable.'
      });
    }
  } else if (age && age >= 40) {
    alerts.push({
      type: 'liver_screening',
      severity: 'low',
      title: 'Evaluación de Función Hepática Recomendada',
      message: `Paciente de ${age} años. Se recomienda evaluación de función hepática periódicamente.`,
      recommendation: 'Realizar perfil hepático completo, especialmente si hay factores de riesgo como consumo de alcohol, obesidad o medicamentos que afecten el hígado.'
    });
  }

  return alerts;
}

/**
 * Detect cancer screening needs
 */
function detectCancerScreeningNeeds(orders, age, gender) {
  const alerts = [];
  
  // Mammography for women
  if (gender === 'female') {
    const mammographyExams = orders.filter(order => {
      const exams = Array.isArray(order.exams) ? order.exams : [order.examName];
      return exams.some(exam => 
        exam.toLowerCase().includes('mamografía') || exam.toLowerCase().includes('mammography')
      );
    });

    if (age && age >= 40 && age <= 75 && mammographyExams.length === 0) {
      alerts.push({
        type: 'mammography_screening',
        severity: 'high',
        title: 'Mamografía Preventiva Recomendada',
        message: `Paciente mujer de ${age} años. Se recomienda mamografía anual o bianual según guías de salud.`,
        recommendation: 'Realizar mamografía de detección temprana de cáncer de mama. Consultar con médico sobre frecuencia según factores de riesgo personales.'
      });
    } else if (age && age >= 50 && mammographyExams.length === 0) {
      alerts.push({
        type: 'mammography_urgent',
        severity: 'high',
        title: 'Mamografía Urgente Recomendada',
        message: `Paciente mujer de ${age} años sin mamografías recientes. La detección temprana es crucial.`,
        recommendation: 'Agendar mamografía lo antes posible. La detección temprana mejora significativamente el pronóstico.'
      });
    }
  }

  // PAP for women
  if (gender === 'female') {
    const papExams = orders.filter(order => {
      const exams = Array.isArray(order.exams) ? order.exams : [order.examName];
      return exams.some(exam => 
        exam.toLowerCase().includes('pap') || exam.toLowerCase().includes('papanicolaou') || exam.toLowerCase().includes('citología')
      );
    });

    if (age && age >= 21 && age <= 65 && papExams.length === 0) {
      alerts.push({
        type: 'pap_screening',
        severity: 'high',
        title: 'Papanicolaou Preventivo Recomendado',
        message: `Paciente mujer de ${age} años. Se recomienda Papanicolaou cada 3 años (o cada 5 años con prueba de VPH).`,
        recommendation: 'Realizar Papanicolaou para detección temprana de cáncer cervicouterino. Consultar con ginecólogo sobre frecuencia según guías actuales.'
      });
    } else if (age && age >= 21 && papExams.length > 0) {
      const lastPap = papExams[papExams.length - 1];
      const daysSinceLastPap = (new Date() - new Date(lastPap.createdAt)) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastPap > 1095) { // More than 3 years
        alerts.push({
          type: 'pap_due',
          severity: 'medium',
          title: 'Papanicolaou Pendiente',
          message: `Han pasado más de 3 años desde el último Papanicolaou.`,
          recommendation: 'Agendar nuevo Papanicolaou según recomendaciones de tu ginecólogo.'
        });
      }
    }
  }

  // Colonoscopy for both genders
  if (age && age >= 50) {
    const colonoscopyExams = orders.filter(order => {
      const exams = Array.isArray(order.exams) ? order.exams : [order.examName];
      return exams.some(exam => 
        exam.toLowerCase().includes('colonoscopia') || exam.toLowerCase().includes('colonoscopy') ||
        exam.toLowerCase().includes('sangre oculta') || exam.toLowerCase().includes('test de sangre oculta')
      );
    });

    if (colonoscopyExams.length === 0) {
      alerts.push({
        type: 'colonoscopy_screening',
        severity: 'high',
        title: 'Detección de Cáncer Colorrectal Recomendada',
        message: `Paciente de ${age} años. Se recomienda detección de cáncer colorrectal a partir de los 50 años.`,
        recommendation: 'Realizar colonoscopia cada 10 años o test de sangre oculta en heces anualmente. Consultar con gastroenterólogo sobre el método más adecuado.'
      });
    }
  }

  // Prostate screening for men
  if (gender === 'male' && age && age >= 50) {
    const prostateExams = orders.filter(order => {
      const exams = Array.isArray(order.exams) ? order.exams : [order.examName];
      return exams.some(exam => 
        exam.toLowerCase().includes('psa') || exam.toLowerCase().includes('próstata') || exam.toLowerCase().includes('prostate')
      );
    });

    if (prostateExams.length === 0) {
      alerts.push({
        type: 'prostate_screening',
        severity: 'medium',
        title: 'Evaluación de Próstata Recomendada',
        message: `Paciente hombre de ${age} años. Se recomienda evaluación de próstata a partir de los 50 años.`,
        recommendation: 'Consultar con urólogo sobre evaluación de PSA y examen digital rectal. Discutir beneficios y riesgos del screening.'
      });
    }
  }

  return alerts;
}

/**
 * Build timeline of health events
 */
function buildTimeline(orders) {
  return orders.map(order => {
    const exams = Array.isArray(order.exams) && order.exams.length > 0 
      ? order.exams 
      : [order.examName];

    return {
      date: order.createdAt,
      type: 'exam',
      title: exams.join(', '),
      status: order.status,
      orderId: order._id,
      doctorName: order.doctorName,
      notes: order.notes
    };
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Assess risk factors
 */
function assessRiskFactors(orders, age, gender) {
  const riskFactors = [];

  if (age && age >= 50) {
    riskFactors.push({
      factor: 'age',
      level: 'medium',
      description: `Edad ${age} años - Mayor riesgo de ciertas condiciones`
    });
  }

  // Check for diabetes-related exams
  const hasDiabetesExams = orders.some(order => {
    const exams = Array.isArray(order.exams) ? order.exams : [order.examName];
    return exams.some(exam => 
      exam.toLowerCase().includes('glucosa') || 
      exam.toLowerCase().includes('glicemia') ||
      exam.toLowerCase().includes('diabetes')
    );
  });

  if (hasDiabetesExams && age && age >= 45) {
    riskFactors.push({
      factor: 'diabetes_risk',
      level: 'medium',
      description: 'Exámenes relacionados con diabetes detectados'
    });
  }

  return riskFactors;
}

/**
 * Generate doctor copilot summary before consultation
 */
async function generateDoctorCopilotSummary(userId, orderIds = null) {
  try {
    let orders;
    if (orderIds) {
      orders = await Order.find({ _id: { $in: orderIds }, userId })
        .populate('userId', 'name email phone dateOfBirth gender address')
        .sort({ createdAt: -1 });
    } else {
      // Get recent orders (last 10)
      orders = await Order.find({ userId })
        .populate('userId', 'name email phone dateOfBirth gender address')
        .sort({ createdAt: -1 })
        .limit(10);
    }

    if (orders.length === 0) {
      return {
        summary: 'No hay registros disponibles para este paciente.',
        suggestedQuestions: [],
        keyPoints: []
      };
    }

    const user = orders[0].userId;
    const age = user.dateOfBirth 
      ? Math.floor((new Date() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    // Format data for AI
    const formattedData = orders.map((order, idx) => {
      const exams = Array.isArray(order.exams) && order.exams.length > 0 
        ? order.exams.join(', ') 
        : order.examName || 'N/A';
      
      return `
Registro #${idx + 1}:
- Fecha: ${new Date(order.createdAt).toLocaleDateString('es-CL')}
- Exámenes: ${exams}
- Estado: ${order.status}
- Notas: ${order.notes || 'Sin notas'}
`;
    }).join('\n');

    const prompt = `Eres un asistente médico experto. Genera un resumen clínico conciso para una consulta médica.

Paciente:
- Nombre: ${user.name}
- Edad: ${age || 'N/A'} años
- Género: ${user.gender || 'N/A'}

Registros médicos:
${formattedData}

Genera:
1. **Resumen Ejecutivo**: 2-3 párrafos con los puntos más importantes del historial
2. **Preguntas Clínicas Sugeridas**: 5-7 preguntas específicas que el médico debería hacer basadas en el historial
3. **Puntos Clave**: Lista de 3-5 puntos críticos a revisar en la consulta

Formato la respuesta en español, de manera profesional y concisa.`;

    if (!process.env.OPEN_API_KEY || !process.env.OPEN_API_KEY.trim()) {
      console.warn('⚠️ OPEN_API_KEY no configurada, usando resumen básico');
      return generateBasicSummary(orders, user, age);
    }

    // Validate API key format
    const apiKey = process.env.OPEN_API_KEY.trim();
    if (!apiKey.startsWith('sk-')) {
      console.warn('⚠️ OPEN_API_KEY no parece ser una API key válida de OpenAI (debería comenzar con "sk-")');
      return generateBasicSummary(orders, user, age);
    }

    try {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente médico experto que genera resúmenes clínicos y sugerencias de preguntas para consultas médicas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const aiResponse = completion.choices[0].message.content;
      return parseAIResponse(aiResponse);
    } catch (aiError) {
      console.error('Error with AI, using basic summary:', aiError);
      return generateBasicSummary(orders, user, age);
    }
  } catch (error) {
    console.error('Error generating doctor copilot summary:', error);
    throw error;
  }
}

/**
 * Generate patient copilot (translation and recommendations)
 */
async function generatePatientCopilot(userId) {
  try {
    const orders = await Order.find({ userId })
      .populate('userId', 'name email dateOfBirth gender')
      .sort({ createdAt: -1 })
      .limit(5);

    if (orders.length === 0) {
      return {
        translation: 'No hay registros médicos recientes.',
        recommendations: [],
        healthTips: []
      };
    }

    const user = orders[0].userId;
    const age = user.dateOfBirth 
      ? Math.floor((new Date() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    // Get recent orders summary
    const recentExams = orders.map(order => {
      const exams = Array.isArray(order.exams) && order.exams.length > 0 
        ? order.exams.join(', ') 
        : order.examName || 'N/A';
      return `${exams} (${new Date(order.createdAt).toLocaleDateString('es-CL')})`;
    }).join(', ');

    const prompt = `Eres un asistente médico que ayuda a pacientes a entender su salud en lenguaje simple y claro.

Paciente:
- Edad: ${age || 'N/A'} años
- Género: ${user.gender || 'N/A'}

Exámenes recientes realizados:
${recentExams}

Genera:
1. **Traducción Médica**: Explica en lenguaje simple y comprensible qué significan estos exámenes y por qué son importantes
2. **Recomendaciones Personalizadas**: 3-5 recomendaciones específicas de salud basadas en la edad, género y exámenes realizados
3. **Consejos de Salud**: Tips prácticos y fáciles de seguir para mantener una buena salud

Usa lenguaje claro, sin jerga médica compleja. Sé positivo y alentador.`;

    if (!process.env.OPEN_API_KEY || !process.env.OPEN_API_KEY.trim()) {
      console.warn('⚠️ OPEN_API_KEY no configurada, usando información básica');
      return generateBasicPatientInfo(orders, user, age);
    }

    // Validate API key format
    const apiKey = process.env.OPEN_API_KEY.trim();
    if (!apiKey.startsWith('sk-')) {
      console.warn('⚠️ OPEN_API_KEY no parece ser una API key válida de OpenAI (debería comenzar con "sk-")');
      return generateBasicPatientInfo(orders, user, age);
    }

    try {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente médico amigable que explica conceptos médicos en lenguaje simple y proporciona recomendaciones de salud personalizadas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500
      });

      const aiResponse = completion.choices[0].message.content;
      return parsePatientAIResponse(aiResponse);
    } catch (aiError) {
      console.error('Error with AI, using basic info:', aiError);
      return generateBasicPatientInfo(orders, user, age);
    }
  } catch (error) {
    console.error('Error generating patient copilot:', error);
    throw error;
  }
}

// Helper functions
function generateBasicSummary(orders, user, age) {
  return {
    summary: `Paciente ${user.name} (${age || 'N/A'} años). Total de ${orders.length} registros médicos. Último examen: ${new Date(orders[0].createdAt).toLocaleDateString('es-CL')}.`,
    suggestedQuestions: [
      '¿Cómo se ha sentido desde el último examen?',
      '¿Ha notado algún cambio en su salud?',
      '¿Está tomando algún medicamento nuevo?',
      '¿Tiene alguna preocupación específica sobre su salud?'
    ],
    keyPoints: [
      'Revisar historial de exámenes recientes',
      'Evaluar necesidad de seguimiento',
      'Verificar adherencia a tratamientos'
    ]
  };
}

function generateBasicPatientInfo(orders, user, age) {
  return {
    translation: `Has realizado ${orders.length} exámenes médicos recientemente. Estos exámenes ayudan a monitorear tu salud y detectar cualquier cambio temprano.`,
    recommendations: [
      'Mantén un estilo de vida saludable',
      'Realiza controles médicos regulares',
      'Sigue las recomendaciones de tu médico'
    ],
    healthTips: [
      'Alimentación balanceada',
      'Ejercicio regular',
      'Descanso adecuado'
    ]
  };
}

function parseAIResponse(response) {
  // Simple parsing - in production, use more sophisticated parsing
  const summaryMatch = response.match(/resumen[^:]*:?\s*([^\n]+(?:\n[^\n]+)*?)(?=\d\.|preguntas|puntos|$)/i);
  const questionsMatch = response.match(/preguntas[^:]*:?\s*([^\n]+(?:\n[^\n]+)*?)(?=\d\.|puntos|$)/i);
  const pointsMatch = response.match(/puntos[^:]*:?\s*([^\n]+(?:\n[^\n]+)*?)$/i);

  return {
    summary: summaryMatch ? summaryMatch[1].trim() : response.split('\n')[0],
    suggestedQuestions: questionsMatch 
      ? questionsMatch[1].split(/\d+[\.\)]\s*/).filter(q => q.trim()).map(q => q.trim())
      : [],
    keyPoints: pointsMatch
      ? pointsMatch[1].split(/\d+[\.\)]\s*/).filter(p => p.trim()).map(p => p.trim())
      : []
  };
}

function parsePatientAIResponse(response) {
  const translationMatch = response.match(/traducción[^:]*:?\s*([^\n]+(?:\n[^\n]+)*?)(?=recomendaciones|consejos|$)/i);
  const recommendationsMatch = response.match(/recomendaciones[^:]*:?\s*([^\n]+(?:\n[^\n]+)*?)(?=consejos|$)/i);
  const tipsMatch = response.match(/consejos[^:]*:?\s*([^\n]+(?:\n[^\n]+)*?)$/i);

  return {
    translation: translationMatch ? translationMatch[1].trim() : response.split('\n')[0],
    recommendations: recommendationsMatch
      ? recommendationsMatch[1].split(/\d+[\.\)]\s*/).filter(r => r.trim()).map(r => r.trim())
      : [],
    healthTips: tipsMatch
      ? tipsMatch[1].split(/\d+[\.\)]\s*/).filter(t => t.trim()).map(t => t.trim())
      : []
  };
}

module.exports = {
  analyzeLongitudinalPatterns,
  generateDoctorCopilotSummary,
  generatePatientCopilot
};
