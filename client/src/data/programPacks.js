import { examenesMedicosHombre } from './examenesMedicos';

const MUJER_PACKS_SOURCE = [
  {
    categoryName: 'Mujer',
    packs: [
      {
        id: 'preventivo-mujer-18-29',
        nombre: 'Control Preventivo Mujer 18 a 29 anos',
        objetivo: 'Prevencion integral de salud femenina en etapa joven adulta.',
        duracionEstimada: '2-3 horas',
        preparacion: 'Ayuno de 8-12 horas para perfil de laboratorio. Resto segun indicacion clinica.',
        precio: 29900,
        examenes: [
          'Hemograma y VHS',
          'Perfil Lipidico',
          'Creatinina',
          'Electrolitos plasmaticos (Sodio, Potasio, Cloro)',
          'Electrocardiograma de reposo (12 derivadas)',
          'Perfil Hepatico',
          'Hemoglobina glicosilada (HbA1c)',
          'Pruebas tiroideas (TSH, T4 libre, T3)',
          'Papanicolau (PAP)',
          'Test de ELISA para VIH',
          'VDRL',
          'Test de Elisa para VHC',
          'Hepatitis B, Antigeno de Superficie (HBsAg)',
          'Herpes Simplex (HSV-1 HSV-2) Serologia IgG',
          'InBody - Composicion corporal por Bioimpedancia',
          'Ecografia mamaria bilateral'
        ]
      },
      {
        id: 'preventivo-mujer-30-39',
        nombre: 'Control Preventivo Mujer 30 a 39 anos',
        objetivo: 'Seguimiento preventivo con mayor foco cardiovascular y salud ginecologica.',
        duracionEstimada: '2-3 horas',
        preparacion: 'Ayuno de 8-12 horas. Preparacion adicional se confirma segun examenes seleccionados.',
        precio: 32900,
        examenes: ['Perfil cardiovascular', 'PAP', 'Ecografia mamaria preventiva']
      },
      {
        id: 'preventivo-mujer-40-49',
        nombre: 'Control Preventivo Mujer 40 a 49 anos',
        objetivo: 'Deteccion temprana de factores metabolicos y oncologicos de alta prevalencia.',
        duracionEstimada: '3-4 horas',
        preparacion: 'Ayuno de 8-12 horas y coordinacion de imagenologia preventiva.',
        precio: 35900,
        examenes: ['Mamografia', 'Papanicolau', 'Perfil metabolico completo']
      },
      {
        id: 'preventivo-mujer-50-59',
        nombre: 'Control Preventivo Mujer 50 a 59 anos',
        objetivo: 'Control preventivo orientado a transicion hormonal y salud osea.',
        duracionEstimada: '3-4 horas',
        preparacion: 'Ayuno de 8-12 horas. Instrucciones especificas para imagenologia al reservar.',
        precio: 39900,
        examenes: ['Mamografia', 'Perfil hormonal', 'Densitometria osea']
      },
      {
        id: 'preventivo-mujer-60-plus',
        nombre: 'Control Preventivo Mujer 60+',
        objetivo: 'Evaluacion integral preventiva en adulto mayor con enfoque funcional.',
        duracionEstimada: '4-5 horas',
        preparacion: 'Ayuno de 8-12 horas y coordinacion anticipada para examenes de apoyo.',
        precio: 42900,
        examenes: ['Densitometria', 'Evaluacion cardiovascular', 'Perfil completo adulto mayor']
      }
    ]
  },
  {
    categoryName: 'Chequeos Generales',
    packs: [
      {
        id: 'chequeo-adulto-mayor',
        nombre: 'Chequeo General Adulto Mayor',
        objetivo: 'Tamizaje clinico general para control preventivo periodico.',
        duracionEstimada: '2-3 horas',
        preparacion: 'Ayuno sugerido de 8 horas para laboratorio.',
        precio: 27900,
        examenes: ['Perfil general adulto mayor']
      },
      {
        id: 'chequeo-general',
        nombre: 'Chequeo General de Salud',
        objetivo: 'Evaluacion base de estado metabolico, hematologico y funcional.',
        duracionEstimada: '2-3 horas',
        preparacion: 'Ayuno de 8-12 horas.',
        precio: 25900,
        examenes: ['Perfil general de laboratorio']
      }
    ]
  },
  {
    categoryName: 'Nutricional y Metabolico',
    packs: [
      {
        id: 'deficit-nutricional',
        nombre: 'Evaluacion Deficit Nutricional',
        objetivo: 'Deteccion de deficiencias de micronutrientes y marcadores nutricionales.',
        duracionEstimada: '2 horas',
        preparacion: 'Ayuno de 8 horas.',
        precio: 24900,
        examenes: ['Panel nutricional', 'Vitaminas y minerales']
      },
      {
        id: 'veganos',
        nombre: 'Chequeo Veganos / Vegetarianos',
        objetivo: 'Monitoreo de parametros criticos para dietas basadas en plantas.',
        duracionEstimada: '2 horas',
        preparacion: 'Ayuno de 8 horas.',
        precio: 24900,
        examenes: ['Vitamina B12', 'Ferritina', 'Perfil nutricional']
      },
      {
        id: 'tiroides',
        nombre: 'Evaluacion de Tiroides',
        objetivo: 'Analisis de funcion tiroidea y marcadores relacionados.',
        duracionEstimada: '1-2 horas',
        preparacion: 'No requiere ayuno estricto.',
        precio: 19900,
        examenes: ['TSH', 'T4 Libre', 'T3']
      },
      {
        id: 'diabetes',
        nombre: 'Deteccion Diabetes e Insulino Resistencia',
        objetivo: 'Deteccion temprana de alteraciones del metabolismo glucidico.',
        duracionEstimada: '2 horas',
        preparacion: 'Ayuno de 8-12 horas.',
        precio: 23900,
        examenes: ['Glucosa', 'HbA1c', 'Insulina']
      },
      {
        id: 'diabetes-hipertension',
        nombre: 'Control Diabetes e Hipertension',
        objetivo: 'Seguimiento combinado de riesgo cardiometabolico.',
        duracionEstimada: '2-3 horas',
        preparacion: 'Ayuno de 8 horas.',
        precio: 25900,
        examenes: ['Perfil cardiometabolico', 'Control tensional']
      }
    ]
  },
  {
    categoryName: 'Mujer y Hormonal',
    packs: [
      {
        id: 'menopausia',
        nombre: 'Deteccion de Menopausia',
        objetivo: 'Evaluacion hormonal para transicion menopausica.',
        duracionEstimada: '1-2 horas',
        preparacion: 'Sin preparacion especial.',
        precio: 21900,
        examenes: ['Perfil hormonal femenino']
      },
      {
        id: 'embarazo',
        nombre: 'Prueba de Embarazo (Test Sanguineo)',
        objetivo: 'Confirmacion bioquimica temprana de embarazo.',
        duracionEstimada: '30-60 min',
        preparacion: 'Sin preparacion especial.',
        precio: 9900,
        examenes: ['HCG beta cuantitativa']
      }
    ]
  },
  {
    categoryName: 'Ginecologico e Imagen',
    packs: [
      {
        id: 'mamografia',
        nombre: 'Mamografia Bilateral',
        objetivo: 'Tamizaje mamario preventivo.',
        duracionEstimada: '45 min',
        preparacion: 'Sin desodorante ni talco el dia del examen.',
        precio: 18900,
        examenes: ['Mamografia bilateral']
      },
      {
        id: 'eco-mamaria',
        nombre: 'Ecografia Mamaria Preventiva',
        objetivo: 'Complemento diagnostico de evaluacion mamaria.',
        duracionEstimada: '45 min',
        preparacion: 'Sin preparacion especial.',
        precio: 16900,
        examenes: ['Ecografia mamaria']
      },
      {
        id: 'eco-ginecologica',
        nombre: 'Ecografia Ginecologica Transvaginal',
        objetivo: 'Evaluacion de utero y anexos en control ginecologico.',
        duracionEstimada: '45 min',
        preparacion: 'Segun indicacion clinica al agendar.',
        precio: 16900,
        examenes: ['Ecografia transvaginal']
      },
      {
        id: 'eco-abdominal',
        nombre: 'Ecografia Abdominal',
        objetivo: 'Evaluacion de organos abdominales.',
        duracionEstimada: '45 min',
        preparacion: 'Ayuno de 6-8 horas.',
        precio: 15900,
        examenes: ['Ecografia abdominal']
      },
      {
        id: 'eco-renal',
        nombre: 'Ecografia Renal',
        objetivo: 'Evaluacion preventiva de estructura renal.',
        duracionEstimada: '45 min',
        preparacion: 'Hidratacion previa segun indicacion.',
        precio: 15900,
        examenes: ['Ecografia renal']
      },
      {
        id: 'eco-hepatica',
        nombre: 'Ecografia Hepatica',
        objetivo: 'Evaluacion preventiva de estructura hepatica.',
        duracionEstimada: '45 min',
        preparacion: 'Ayuno de 6-8 horas.',
        precio: 15900,
        examenes: ['Ecografia hepatica']
      }
    ]
  },
  {
    categoryName: 'Otros',
    packs: [
      {
        id: 'ets',
        nombre: 'Deteccion de ETS',
        objetivo: 'Tamizaje de infecciones de transmision sexual.',
        duracionEstimada: '1-2 horas',
        preparacion: 'Sin preparacion especial.',
        precio: 19900,
        examenes: ['VIH', 'VDRL', 'Hepatitis B', 'Hepatitis C', 'Herpes']
      },
      {
        id: 'renal-orina',
        nombre: 'Perfil Renal y Orina',
        objetivo: 'Evaluacion basica de funcion renal y urinaria.',
        duracionEstimada: '1-2 horas',
        preparacion: 'Primera orina de la manana para mayor precision.',
        precio: 16900,
        examenes: ['Creatinina', 'Urea', 'Orina completa']
      },
      {
        id: 'drogas',
        nombre: 'Deteccion de Drogas',
        objetivo: 'Screening toxicologico en panel basico.',
        duracionEstimada: '1 hora',
        preparacion: 'Sin preparacion especial.',
        precio: 14900,
        examenes: ['Panel toxicologico']
      },
      {
        id: 'grupo-sanguineo',
        nombre: 'Grupo Sanguineo',
        objetivo: 'Determinacion de grupo ABO y factor Rh.',
        duracionEstimada: '30 min',
        preparacion: 'Sin preparacion especial.',
        precio: 7900,
        examenes: ['Grupo sanguineo ABO y Rh']
      },
      {
        id: 'capilar',
        nombre: 'Evaluacion Caida del Cabello',
        objetivo: 'Busqueda de causas nutricionales, hormonales o metabolicas.',
        duracionEstimada: '1-2 horas',
        preparacion: 'Ayuno de 8 horas para laboratorio.',
        precio: 19900,
        examenes: ['Perfil capilar integral']
      },
      {
        id: 'sibo',
        nombre: 'Evaluacion Intolerancia Alimentaria - SIBO',
        objetivo: 'Evaluacion digestiva para sintomas compatibles con disbiosis e intolerancia.',
        duracionEstimada: '2-3 horas',
        preparacion: 'Preparacion dietaria previa segun protocolo.',
        precio: 25900,
        examenes: ['Test respiratorio y panel digestivo']
      }
    ]
  }
];

function toExamItem(rawExam, fallbackId) {
  if (rawExam && typeof rawExam === 'object') {
    return {
      id: rawExam.id || fallbackId,
      nombre: rawExam.nombre || rawExam.name || 'Examen',
      paraQueSirve: rawExam.paraQueSirve || rawExam.queEvalua || 'Evaluacion clinica preventiva.',
      tipo: rawExam.tipo || 'laboratorio'
    };
  }

  return {
    id: fallbackId,
    nombre: String(rawExam || 'Examen'),
    paraQueSirve: 'Evaluacion clinica preventiva dentro del objetivo del pack.',
    tipo: 'laboratorio'
  };
}

function extractAgeRange(pack) {
  // Si el pack tiene edadMinima, usarlo directamente
  if (typeof pack.edadMinima === 'number') {
    return pack.edadMinima;
  }
  
  // Si no, intentar extraer del nombre del pack (ej: "Control Preventivo Mujer 18 a 29 anos")
  const nameMatch = pack.nombre?.match(/(\d+)\s*(?:a|-|años|anos)/i);
  if (nameMatch) {
    return parseInt(nameMatch[1], 10);
  }
  
  // Fallback: asignar edad alta para packs sin edad específica
  return 999;
}

function sortPacksByAge(packs) {
  return [...packs].sort((a, b) => extractAgeRange(a) - extractAgeRange(b));
}

function mapHombreProgramPacks() {
  const allPacks = examenesMedicosHombre.categorias.flatMap((category) =>
    category.paquetes.map((pack) => ({
      ...pack,
      categoryId: category.id,
      categoryName: category.nombre,
      categoryDescription: category.descripcion,
      examenes: (pack.examenes || []).map((exam, index) =>
        toExamItem(exam, `${pack.id}-exam-${index + 1}`)
      )
    }))
  );
  
  return sortPacksByAge(allPacks);
}

function mapMujerProgramPacks() {
  const allPacks = MUJER_PACKS_SOURCE.flatMap((category) =>
    category.packs.map((pack) => ({
      ...pack,
      categoryName: category.categoryName,
      examenes: (pack.examenes || []).map((exam, index) => ({
        id: `${pack.id}-${index + 1}`,
        nombre: String(exam),
        paraQueSirve: 'Evaluacion clinica preventiva dentro del objetivo del pack.',
        tipo: category.categoryName.toLowerCase().includes('imagen') ? 'imagen' : 'laboratorio'
      }))
    }))
  );
  
  return sortPacksByAge(allPacks);
}

const PROGRAM_PACKS_BY_SEGMENT = {
  hombre: mapHombreProgramPacks(),
  mujer: mapMujerProgramPacks()
};

const PROGRAM_CONTENT_BY_SEGMENT = {
  hombre: {
    badge: 'Programa',
    title: 'Salud Hombre',
    subtitle:
      'Ruta clinica enfocada en prevencion cardiometabolica, control integral y salud masculina por etapa de vida.',
    aboutTitle: 'De que se trata este programa?',
    aboutText:
      'Este programa organiza examenes por objetivo preventivo y edad para facilitar decisiones clinicas y reducir pasos innecesarios. Aqui puedes revisar los packs disponibles con el detalle completo de examenes, tiempos y preparacion antes de personalizar tu orden.',
    availablePacksCta: 'Ver packs de examenes disponibles',
    hidePacksCta: 'Ocultar packs de examenes disponibles',
    customizeCta: 'Personalizar la orden'
  },
  mujer: {
    badge: 'Programa',
    title: 'Salud Mujer',
    subtitle:
      'Ruta clinica enfocada en prevencion, bienestar hormonal y controles de salud femenina segun etapa de vida.',
    aboutTitle: 'De que se trata este programa?',
    aboutText:
      'Este programa organiza examenes por objetivo preventivo y etapa de vida para facilitar decisiones clinicas y reducir pasos innecesarios. Aqui puedes revisar los packs disponibles con el detalle completo de examenes, tiempos y preparacion antes de personalizar tu orden.',
    availablePacksCta: 'Ver packs de examenes disponibles',
    hidePacksCta: 'Ocultar packs de examenes disponibles',
    customizeCta: 'Personalizar la orden'
  }
};

export function getProgramPacks(segment) {
  const key = String(segment || '').toLowerCase();
  return PROGRAM_PACKS_BY_SEGMENT[key] || [];
}

export function getProgramContent(segment) {
  const key = String(segment || '').toLowerCase();
  return PROGRAM_CONTENT_BY_SEGMENT[key] || PROGRAM_CONTENT_BY_SEGMENT.hombre;
}
