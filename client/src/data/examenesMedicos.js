/**
 * SISTEMA DE ÓRDENES DE EXÁMENES MÉDICOS - Siempresalud
 * 
 * Arquitectura de Contenidos de Salud Digital
 * Estructura jerárquica completa basada en protocolos clínicos
 * 
 * Segmento: HOMBRE
 */

export const examenesMedicosHombre = {
  segmento: 'Hombre',
  categorias: [
    {
      id: 'preventivo-hombre',
      nombre: 'Preventivo Hombre',
      descripcion: 'Exámenes de rutina para detección temprana de patologías comunes en hombres',
      paquetes: [
        {
          id: 'ph-30-39',
          nombre: 'Preventivo Hombre 30-39 años',
          edadMinima: 30,
          edadMaxima: 39,
          objetivo: 'Detección temprana de factores de riesgo cardiovascular, metabólicos y oncológicos en hombres jóvenes',
          requiereAyuno: true,
          duracionEstimada: '2-3 horas',
          preparacion: 'Ayuno de 8-12 horas. Evitar ejercicio intenso 24 horas antes. No consumir alcohol 48 horas antes.',
          precio: 29900,
          examenes: [
            {
              id: 'ph-30-39-1',
              nombre: 'Hemograma Completo con VHS',
              tipo: 'laboratorio',
              queEvalua: 'Recuento de células sanguíneas (glóbulos rojos, blancos, plaquetas), hemoglobina, hematocrito y velocidad de sedimentación globular',
              paraQueSirve: 'Detecta anemia, infecciones, procesos inflamatorios, alteraciones en la coagulación y posibles trastornos hematológicos',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'ph-30-39-2',
              nombre: 'Perfil Lipídico Completo',
              tipo: 'laboratorio',
              queEvalua: 'Colesterol total, HDL (colesterol bueno), LDL (colesterol malo), triglicéridos y cálculo de índice aterogénico',
              paraQueSirve: 'Evalúa riesgo cardiovascular, dislipidemias y necesidad de intervención preventiva. Fundamental para prevenir infartos y accidentes cerebrovasculares',
              requiereAyuno: true,
              preparacion: 'Ayuno de 12 horas. Evitar alcohol 48 horas antes',
              precio: 2990
            },
            {
              id: 'ph-30-39-3',
              nombre: 'Perfil Hepático Completo',
              tipo: 'laboratorio',
              queEvalua: 'Transaminasas (ALT, AST), bilirrubina total y fraccionada, fosfatasa alcalina, GGT y proteínas totales',
              paraQueSirve: 'Detecta daño hepático, hepatitis, esteatosis hepática (hígado graso), alteraciones en la función hepática y consumo excesivo de alcohol',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8 horas',
              precio: 2990
            },
            {
              id: 'ph-30-39-4',
              nombre: 'Creatinina en Sangre',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de creatinina sérica como marcador de función renal',
              paraQueSirve: 'Evalúa función renal, detecta insuficiencia renal temprana y permite calcular la tasa de filtración glomerular (TFG)',
              requiereAyuno: false,
              preparacion: 'Evitar ejercicio intenso 24 horas antes',
              precio: 1990
            },
            {
              id: 'ph-30-39-5',
              nombre: 'Glicemia en Ayunas',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de glucosa en sangre después de ayuno prolongado',
              paraQueSirve: 'Detecta diabetes mellitus, prediabetes, resistencia a la insulina y alteraciones del metabolismo de la glucosa',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8-12 horas',
              precio: 1990
            },
            {
              id: 'ph-30-39-6',
              nombre: 'Ácido Úrico',
              tipo: 'laboratorio',
              queEvalua: 'Concentración de ácido úrico en sangre',
              paraQueSirve: 'Detecta hiperuricemia, riesgo de gota, cálculos renales y puede asociarse a síndrome metabólico',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8 horas. Evitar alimentos ricos en purinas 48 horas antes',
              precio: 1990
            },
            {
              id: 'ph-30-39-7',
              nombre: 'Orina Completa con Sedimento',
              tipo: 'laboratorio',
              queEvalua: 'Análisis físico-químico y microscópico de la orina',
              paraQueSirve: 'Detecta infecciones urinarias, enfermedad renal, diabetes, alteraciones metabólicas y patologías del tracto urinario',
              requiereAyuno: false,
              preparacion: 'Primera orina de la mañana. Limpieza genital previa',
              precio: 1990
            },
            {
              id: 'ph-30-39-8',
              nombre: 'Electrocardiograma de Reposo (12 derivadas)',
              tipo: 'funcional',
              queEvalua: 'Actividad eléctrica del corazón en reposo',
              paraQueSirve: 'Detecta arritmias, bloqueos, signos de isquemia, hipertrofia ventricular y alteraciones del ritmo cardíaco',
              requiereAyuno: false,
              preparacion: 'No requiere preparación. Evitar cremas o lociones en el tórax',
              precio: 3990
            },
            {
              id: 'ph-30-39-9',
              nombre: 'Antígeno Prostático Específico (PSA) Total',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de PSA en sangre como marcador tumoral prostático',
              paraQueSirve: 'Screening de cáncer de próstata, evaluación de hiperplasia prostática benigna y seguimiento post-tratamiento',
              requiereAyuno: false,
              preparacion: 'Evitar eyaculación 48 horas antes. No realizar tacto rectal 7 días antes',
              precio: 3990
            }
          ]
        },
        {
          id: 'ph-40-49',
          nombre: 'Preventivo Hombre 40-49 años',
          edadMinima: 40,
          edadMaxima: 49,
          objetivo: 'Vigilancia intensificada de factores de riesgo cardiovascular y oncológicos en la cuarta década de vida',
          requiereAyuno: true,
          duracionEstimada: '3-4 horas',
          preparacion: 'Ayuno de 8-12 horas. Evitar ejercicio intenso 24 horas antes. No consumir alcohol 48 horas antes.',
          precio: 34900,
          examenes: [
            {
              id: 'ph-40-49-1',
              nombre: 'Hemograma Completo con VHS',
              tipo: 'laboratorio',
              queEvalua: 'Recuento de células sanguíneas (glóbulos rojos, blancos, plaquetas), hemoglobina, hematocrito y velocidad de sedimentación globular',
              paraQueSirve: 'Detecta anemia, infecciones, procesos inflamatorios, alteraciones en la coagulación y posibles trastornos hematológicos',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'ph-40-49-2',
              nombre: 'Perfil Lipídico Completo',
              tipo: 'laboratorio',
              queEvalua: 'Colesterol total, HDL, LDL, triglicéridos y cálculo de índice aterogénico',
              paraQueSirve: 'Evalúa riesgo cardiovascular, dislipidemias y necesidad de intervención preventiva',
              requiereAyuno: true,
              preparacion: 'Ayuno de 12 horas',
              precio: 2990
            },
            {
              id: 'ph-40-49-3',
              nombre: 'Perfil Hepático Completo',
              tipo: 'laboratorio',
              queEvalua: 'Transaminasas, bilirrubina, fosfatasa alcalina, GGT y proteínas totales',
              paraQueSirve: 'Detecta daño hepático, esteatosis hepática y alteraciones en la función hepática',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8 horas',
              precio: 2990
            },
            {
              id: 'ph-40-49-4',
              nombre: 'Creatinina en Sangre',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de creatinina sérica como marcador de función renal',
              paraQueSirve: 'Evalúa función renal y detecta insuficiencia renal temprana',
              requiereAyuno: false,
              preparacion: 'Evitar ejercicio intenso 24 horas antes',
              precio: 1990
            },
            {
              id: 'ph-40-49-5',
              nombre: 'Glicemia en Ayunas',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de glucosa en sangre después de ayuno prolongado',
              paraQueSirve: 'Detecta diabetes mellitus y prediabetes',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8-12 horas',
              precio: 1990
            },
            {
              id: 'ph-40-49-6',
              nombre: 'Hemoglobina Glicosilada (HbA1c)',
              tipo: 'laboratorio',
              queEvalua: 'Promedio de glucosa en sangre de los últimos 2-3 meses',
              paraQueSirve: 'Diagnóstico y seguimiento de diabetes, evaluación del control glucémico a largo plazo',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'ph-40-49-7',
              nombre: 'Ácido Úrico',
              tipo: 'laboratorio',
              queEvalua: 'Concentración de ácido úrico en sangre',
              paraQueSirve: 'Detecta hiperuricemia y riesgo de gota',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8 horas',
              precio: 1990
            },
            {
              id: 'ph-40-49-8',
              nombre: 'Orina Completa con Sedimento',
              tipo: 'laboratorio',
              queEvalua: 'Análisis físico-químico y microscópico de la orina',
              paraQueSirve: 'Detecta infecciones urinarias y enfermedad renal',
              requiereAyuno: false,
              preparacion: 'Primera orina de la mañana',
              precio: 1990
            },
            {
              id: 'ph-40-49-9',
              nombre: 'Electrocardiograma de Reposo (12 derivadas)',
              tipo: 'funcional',
              queEvalua: 'Actividad eléctrica del corazón en reposo',
              paraQueSirve: 'Detecta arritmias y signos de isquemia',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 3990
            },
            {
              id: 'ph-40-49-10',
              nombre: 'Antígeno Prostático Específico (PSA) Total',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de PSA en sangre como marcador tumoral prostático',
              paraQueSirve: 'Screening de cáncer de próstata',
              requiereAyuno: false,
              preparacion: 'Evitar eyaculación 48 horas antes',
              precio: 3990
            },
            {
              id: 'ph-40-49-11',
              nombre: 'Test de Hemorragias Ocultas en Deposiciones',
              tipo: 'laboratorio',
              queEvalua: 'Presencia de sangre oculta en heces',
              paraQueSirve: 'Screening de cáncer colorrectal y detección de sangrado digestivo',
              requiereAyuno: false,
              preparacion: 'Evitar carnes rojas, medicamentos con hierro y vitamina C 3 días antes',
              precio: 2990
            }
          ]
        },
        {
          id: 'ph-50-59',
          nombre: 'Preventivo Hombre 50-59 años',
          edadMinima: 50,
          edadMaxima: 59,
          objetivo: 'Vigilancia intensificada de patologías oncológicas y cardiovasculares en la quinta década',
          requiereAyuno: true,
          duracionEstimada: '4-5 horas',
          preparacion: 'Ayuno de 8-12 horas. Evitar ejercicio intenso 24 horas antes.',
          precio: 39900,
          examenes: [
            {
              id: 'ph-50-59-1',
              nombre: 'Hemograma Completo con VHS',
              tipo: 'laboratorio',
              queEvalua: 'Recuento de células sanguíneas, hemoglobina, hematocrito y VHS',
              paraQueSirve: 'Detecta anemia, infecciones y procesos inflamatorios',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'ph-50-59-2',
              nombre: 'Perfil Lipídico Completo',
              tipo: 'laboratorio',
              queEvalua: 'Colesterol total, HDL, LDL, triglicéridos',
              paraQueSirve: 'Evalúa riesgo cardiovascular',
              requiereAyuno: true,
              preparacion: 'Ayuno de 12 horas',
              precio: 2990
            },
            {
              id: 'ph-50-59-3',
              nombre: 'Perfil Hepático Completo',
              tipo: 'laboratorio',
              queEvalua: 'Transaminasas, bilirrubina, fosfatasa alcalina, GGT',
              paraQueSirve: 'Detecta daño hepático',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8 horas',
              precio: 2990
            },
            {
              id: 'ph-50-59-4',
              nombre: 'Creatinina en Sangre',
              tipo: 'laboratorio',
              queEvalua: 'Función renal',
              paraQueSirve: 'Evalúa función renal',
              requiereAyuno: false,
              preparacion: 'Evitar ejercicio intenso 24 horas antes',
              precio: 1990
            },
            {
              id: 'ph-50-59-5',
              nombre: 'Glicemia en Ayunas',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de glucosa',
              paraQueSirve: 'Detecta diabetes',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8-12 horas',
              precio: 1990
            },
            {
              id: 'ph-50-59-6',
              nombre: 'Hemoglobina Glicosilada (HbA1c)',
              tipo: 'laboratorio',
              queEvalua: 'Control glucémico a largo plazo',
              paraQueSirve: 'Diagnóstico y seguimiento de diabetes',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 2990
            },
            {
              id: 'ph-50-59-7',
              nombre: 'Ácido Úrico',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de ácido úrico',
              paraQueSirve: 'Detecta hiperuricemia',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8 horas',
              precio: 1990
            },
            {
              id: 'ph-50-59-8',
              nombre: 'Orina Completa con Sedimento',
              tipo: 'laboratorio',
              queEvalua: 'Análisis de orina',
              paraQueSirve: 'Detecta infecciones y enfermedad renal',
              requiereAyuno: false,
              preparacion: 'Primera orina de la mañana',
              precio: 1990
            },
            {
              id: 'ph-50-59-9',
              nombre: 'Electrocardiograma de Reposo (12 derivadas)',
              tipo: 'funcional',
              queEvalua: 'Actividad eléctrica del corazón',
              paraQueSirve: 'Detecta arritmias e isquemia',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 3990
            },
            {
              id: 'ph-50-59-10',
              nombre: 'Antígeno Prostático Específico (PSA) Total',
              tipo: 'laboratorio',
              queEvalua: 'Marcador tumoral prostático',
              paraQueSirve: 'Screening de cáncer de próstata',
              requiereAyuno: false,
              preparacion: 'Evitar eyaculación 48 horas antes',
              precio: 3990
            },
            {
              id: 'ph-50-59-11',
              nombre: 'Test de Hemorragias Ocultas en Deposiciones',
              tipo: 'laboratorio',
              queEvalua: 'Sangre oculta en heces',
              paraQueSirve: 'Screening de cáncer colorrectal',
              requiereAyuno: false,
              preparacion: 'Evitar carnes rojas 3 días antes',
              precio: 2990
            },
            {
              id: 'ph-50-59-12',
              nombre: 'Ecografía Abdominal Completa',
              tipo: 'imagen',
              queEvalua: 'Estructura y tamaño de hígado, vesícula, riñones, páncreas, bazo y grandes vasos',
              paraQueSirve: 'Detecta masas, cálculos, alteraciones estructurales y patologías de órganos abdominales',
              requiereAyuno: true,
              preparacion: 'Ayuno de 6-8 horas. Beber 1 litro de agua 1 hora antes',
              precio: 3990
            }
          ]
        }
      ]
    },
    {
      id: 'ecografias-preventivas',
      nombre: 'Ecografías Preventivas',
      descripcion: 'Estudios de imagen no invasivos para evaluación de órganos y estructuras',
      paquetes: [
        {
          id: 'ep-completo',
          nombre: 'Paquete Ecografías Preventivas Completo',
          edadMinima: 30,
          edadMaxima: null,
          objetivo: 'Evaluación integral de órganos abdominales, tiroides y sistema cardiovascular mediante ecografía',
          requiereAyuno: true,
          duracionEstimada: '2-3 horas',
          preparacion: 'Ayuno de 6-8 horas para ecografía abdominal. No requiere ayuno para ecografías de tiroides y carótidas.',
          precio: 17900,
          examenes: [
            {
              id: 'ep-1',
              nombre: 'Ecografía Abdominal Completa',
              tipo: 'imagen',
              queEvalua: 'Hígado, vesícula biliar, vías biliares, páncreas, riñones, bazo, grandes vasos abdominales y retroperitoneo',
              paraQueSirve: 'Detecta cálculos biliares, masas hepáticas, quistes renales, alteraciones pancreáticas, linfadenopatías y patologías vasculares',
              requiereAyuno: true,
              preparacion: 'Ayuno de 6-8 horas. Beber 1 litro de agua 1 hora antes para mejor visualización renal',
              precio: 3990
            },
            {
              id: 'ep-2',
              nombre: 'Ecografía de Tiroides',
              tipo: 'imagen',
              queEvalua: 'Tamaño, forma, ecogenicidad y estructura del tiroides, presencia de nódulos, quistes o masas',
              paraQueSirve: 'Detecta nódulos tiroideos, bocio, tiroiditis, cáncer de tiroides y evalúa función estructural de la glándula',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 3990
            },
            {
              id: 'ep-3',
              nombre: 'Ecografía Renal Preventiva',
              tipo: 'imagen',
              queEvalua: 'Tamaño, forma, posición y estructura de ambos riñones, presencia de cálculos, quistes o masas',
              paraQueSirve: 'Detecta litiasis renal, quistes renales, masas, hidronefrosis y alteraciones estructurales renales',
              requiereAyuno: false,
              preparacion: 'Beber 1 litro de agua 1 hora antes para mejor visualización',
              precio: 3990
            },
            {
              id: 'ep-4',
              nombre: 'Ecografía de Hígado',
              tipo: 'imagen',
              queEvalua: 'Tamaño, forma, ecogenicidad y estructura del hígado, presencia de masas, quistes o esteatosis',
              paraQueSirve: 'Detecta esteatosis hepática (hígado graso), masas hepáticas, quistes, cirrosis y alteraciones estructurales',
              requiereAyuno: true,
              preparacion: 'Ayuno de 6-8 horas',
              precio: 3990
            },
            {
              id: 'ep-5',
              nombre: 'Ecografía Doppler de Carótidas',
              tipo: 'imagen',
              queEvalua: 'Flujo sanguíneo, velocidad y presencia de estenosis en arterias carótidas y vertebrales',
              paraQueSirve: 'Detecta estenosis carotídea, placas ateroscleróticas, riesgo de accidente cerebrovascular y enfermedad vascular cerebral',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 4990
            },
            {
              id: 'ep-6',
              nombre: 'Ecografía Cardíaca Doppler Transtorácica',
              tipo: 'imagen',
              queEvalua: 'Estructura cardíaca, función de válvulas, contractilidad miocárdica, fracción de eyección y flujos sanguíneos',
              paraQueSirve: 'Detecta valvulopatías, miocardiopatías, alteraciones de la contractilidad, derrames pericárdicos y evaluación de función cardíaca',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 5990
            }
          ]
        }
      ]
    },
    {
      id: 'evaluacion-cardiovascular',
      nombre: 'Evaluación Cardiovascular',
      descripcion: 'Evaluación integral del sistema cardiovascular para detección de factores de riesgo y patologías cardíacas',
      paquetes: [
        {
          id: 'ec-basico',
          nombre: 'Evaluación Cardiovascular Básica',
          edadMinima: 40,
          edadMaxima: null,
          objetivo: 'Detección de factores de riesgo cardiovascular y evaluación funcional básica del corazón',
          requiereAyuno: true,
          duracionEstimada: '2-3 horas',
          preparacion: 'Ayuno de 8-12 horas. Evitar ejercicio intenso 24 horas antes. No fumar el día del examen.',
          precio: 24900,
          examenes: [
            {
              id: 'ec-b-1',
              nombre: 'Electrocardiograma de Reposo (12 derivadas)',
              tipo: 'funcional',
              queEvalua: 'Actividad eléctrica del corazón en reposo, ritmo cardíaco, conducción y signos de isquemia',
              paraQueSirve: 'Detecta arritmias, bloqueos de conducción, signos de isquemia miocárdica, hipertrofia ventricular y alteraciones del ritmo',
              requiereAyuno: false,
              preparacion: 'No requiere preparación. Evitar cremas en el tórax',
              precio: 3990
            },
            {
              id: 'ec-b-2',
              nombre: 'Perfil Lipídico Completo',
              tipo: 'laboratorio',
              queEvalua: 'Colesterol total, HDL, LDL, triglicéridos, relación colesterol/HDL y cálculo de riesgo aterogénico',
              paraQueSirve: 'Evalúa riesgo de enfermedad cardiovascular, dislipidemias, necesidad de tratamiento hipolipemiante y efectividad de intervenciones',
              requiereAyuno: true,
              preparacion: 'Ayuno de 12 horas. Evitar alcohol 48 horas antes',
              precio: 2990
            },
            {
              id: 'ec-b-3',
              nombre: 'PCR Ultrasensible',
              tipo: 'laboratorio',
              queEvalua: 'Proteína C reactiva de alta sensibilidad como marcador de inflamación vascular',
              paraQueSirve: 'Evalúa riesgo cardiovascular independiente, inflamación vascular subclínica y predicción de eventos cardiovasculares',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'ec-b-4',
              nombre: 'Hemoglobina Glicosilada (HbA1c)',
              tipo: 'laboratorio',
              queEvalua: 'Promedio de glucosa en sangre de los últimos 2-3 meses',
              paraQueSirve: 'Evalúa control glucémico a largo plazo, factor de riesgo cardiovascular y detección de diabetes no diagnosticada',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'ec-b-5',
              nombre: 'Creatinina en Sangre',
              tipo: 'laboratorio',
              queEvalua: 'Función renal mediante nivel de creatinina sérica',
              paraQueSirve: 'Evalúa función renal, factor de riesgo cardiovascular independiente y cálculo de TFG',
              requiereAyuno: false,
              preparacion: 'Evitar ejercicio intenso 24 horas antes',
              precio: 1990
            },
            {
              id: 'ec-b-6',
              nombre: 'Microalbuminuria',
              tipo: 'laboratorio',
              queEvalua: 'Excreción urinaria de albúmina en pequeñas cantidades',
              paraQueSirve: 'Detecta daño renal temprano, predictor de enfermedad cardiovascular y complicaciones de diabetes e hipertensión',
              requiereAyuno: false,
              preparacion: 'Primera orina de la mañana o muestra de 24 horas según indicación',
              precio: 2990
            },
            {
              id: 'ec-b-7',
              nombre: 'Ecografía Doppler de Carótidas',
              tipo: 'imagen',
              queEvalua: 'Flujo sanguíneo, velocidad y presencia de estenosis en arterias carótidas',
              paraQueSirve: 'Detecta enfermedad aterosclerótica carotídea, riesgo de ACV y necesidad de intervención preventiva',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 4990
            }
          ]
        },
        {
          id: 'ec-avanzado',
          nombre: 'Evaluación Cardiovascular Avanzada',
          edadMinima: 50,
          edadMaxima: null,
          objetivo: 'Evaluación exhaustiva del sistema cardiovascular con estudios funcionales y de imagen',
          requiereAyuno: true,
          duracionEstimada: '4-5 horas',
          preparacion: 'Ayuno de 8-12 horas. Suspender betabloqueadores 24 horas antes (consultar con médico). No fumar el día del examen.',
          precio: 49900,
          examenes: [
            {
              id: 'ec-a-1',
              nombre: 'Electrocardiograma de Reposo (12 derivadas)',
              tipo: 'funcional',
              queEvalua: 'Actividad eléctrica del corazón en reposo',
              paraQueSirve: 'Detecta arritmias e isquemia',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 3990
            },
            {
              id: 'ec-a-2',
              nombre: 'Test de Esfuerzo (Ergometría)',
              tipo: 'funcional',
              queEvalua: 'Respuesta cardiovascular al ejercicio, capacidad funcional, signos de isquemia inducida por ejercicio y arritmias',
              paraQueSirve: 'Detecta enfermedad coronaria, evalúa capacidad funcional, pronóstico cardiovascular y efectividad de tratamientos',
              requiereAyuno: true,
              preparacion: 'Ayuno de 2 horas. Suspender betabloqueadores 24 horas antes (consultar médico). Ropa cómoda y zapatillas',
              precio: 4990
            },
            {
              id: 'ec-a-3',
              nombre: 'Holter de Ritmo (24 horas)',
              tipo: 'funcional',
              queEvalua: 'Registro continuo del ritmo cardíaco durante 24 horas en actividad normal',
              paraQueSirve: 'Detecta arritmias intermitentes, pausas, taquicardias y bradicardias no detectables en ECG de reposo',
              requiereAyuno: false,
              preparacion: 'No requiere preparación. Mantener actividad normal durante el registro',
              precio: 4990
            },
            {
              id: 'ec-a-4',
              nombre: 'Holter de Presión Arterial (24 horas)',
              tipo: 'funcional',
              queEvalua: 'Registro continuo de presión arterial durante 24 horas en condiciones normales',
              paraQueSirve: 'Diagnóstico de hipertensión, evaluación de control tensional, hipertensión de bata blanca y variabilidad tensional',
              requiereAyuno: false,
              preparacion: 'No requiere preparación. Mantener actividad normal',
              precio: 4990
            },
            {
              id: 'ec-a-5',
              nombre: 'Ecografía Cardíaca Doppler Transtorácica',
              tipo: 'imagen',
              queEvalua: 'Estructura y función cardíaca, válvulas, contractilidad, fracción de eyección y flujos',
              paraQueSirve: 'Evalúa función cardíaca, detecta valvulopatías, miocardiopatías y alteraciones estructurales',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 5990
            },
            {
              id: 'ec-a-6',
              nombre: 'Ecografía Doppler de Carótidas',
              tipo: 'imagen',
              queEvalua: 'Flujo y estenosis en arterias carótidas',
              paraQueSirve: 'Detecta enfermedad aterosclerótica carotídea',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 4990
            },
            {
              id: 'ec-a-7',
              nombre: 'Perfil Lipídico Completo',
              tipo: 'laboratorio',
              queEvalua: 'Colesterol total, HDL, LDL, triglicéridos',
              paraQueSirve: 'Evalúa riesgo cardiovascular',
              requiereAyuno: true,
              preparacion: 'Ayuno de 12 horas',
              precio: 2990
            },
            {
              id: 'ec-a-8',
              nombre: 'PCR Ultrasensible',
              tipo: 'laboratorio',
              queEvalua: 'Marcador de inflamación vascular',
              paraQueSirve: 'Evalúa riesgo cardiovascular',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 2990
            },
            {
              id: 'ec-a-9',
              nombre: 'Hemoglobina Glicosilada (HbA1c)',
              tipo: 'laboratorio',
              queEvalua: 'Control glucémico a largo plazo',
              paraQueSirve: 'Evalúa diabetes y riesgo cardiovascular',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 2990
            },
            {
              id: 'ec-a-10',
              nombre: 'Creatinina en Sangre',
              tipo: 'laboratorio',
              queEvalua: 'Función renal',
              paraQueSirve: 'Evalúa función renal',
              requiereAyuno: false,
              preparacion: 'Evitar ejercicio intenso 24 horas antes',
              precio: 1990
            },
            {
              id: 'ec-a-11',
              nombre: 'Microalbuminuria',
              tipo: 'laboratorio',
              queEvalua: 'Daño renal temprano',
              paraQueSirve: 'Predictor de enfermedad cardiovascular',
              requiereAyuno: false,
              preparacion: 'Primera orina de la mañana',
              precio: 2990
            }
          ]
        }
      ]
    },
    {
      id: 'evaluacion-nutricional',
      nombre: 'Evaluación Nutricional',
      descripcion: 'Evaluación completa del estado nutricional, metabólico y composición corporal',
      paquetes: [
        {
          id: 'en-completo',
          nombre: 'Evaluación Nutricional Completa',
          edadMinima: 18,
          edadMaxima: null,
          objetivo: 'Evaluación integral del estado nutricional, metabólico y composición corporal',
          requiereAyuno: true,
          duracionEstimada: '2-3 horas',
          preparacion: 'Ayuno de 8-12 horas. Evitar ejercicio intenso 24 horas antes.',
          precio: 27900,
          examenes: [
            {
              id: 'en-1',
              nombre: 'Hemograma Completo con VHS',
              tipo: 'laboratorio',
              queEvalua: 'Recuento de células sanguíneas, hemoglobina y parámetros hematológicos',
              paraQueSirve: 'Detecta anemia nutricional (ferropénica, B12, folato), infecciones y procesos inflamatorios',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'en-2',
              nombre: 'Glicemia en Ayunas',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de glucosa en sangre en ayunas',
              paraQueSirve: 'Evalúa metabolismo de carbohidratos, detecta diabetes y resistencia a la insulina',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8-12 horas',
              precio: 1990
            },
            {
              id: 'en-3',
              nombre: 'Hemoglobina Glicosilada (HbA1c)',
              tipo: 'laboratorio',
              queEvalua: 'Promedio de glucosa de los últimos 2-3 meses',
              paraQueSirve: 'Evalúa control glucémico a largo plazo y riesgo de diabetes',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'en-4',
              nombre: 'Perfil Lipídico Completo',
              tipo: 'laboratorio',
              queEvalua: 'Colesterol total, HDL, LDL, triglicéridos',
              paraQueSirve: 'Evalúa metabolismo lipídico y riesgo cardiovascular relacionado con nutrición',
              requiereAyuno: true,
              preparacion: 'Ayuno de 12 horas',
              precio: 2990
            },
            {
              id: 'en-5',
              nombre: 'Vitamina D (25-OH Vitamina D)',
              tipo: 'laboratorio',
              queEvalua: 'Nivel sérico de 25-hidroxivitamina D',
              paraQueSirve: 'Detecta deficiencia de vitamina D, importante para salud ósea, inmunidad y función muscular',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 3990
            },
            {
              id: 'en-6',
              nombre: 'Vitamina B12 (Cobalamina)',
              tipo: 'laboratorio',
              queEvalua: 'Nivel sérico de vitamina B12',
              paraQueSirve: 'Detecta deficiencia de B12, causa de anemia megaloblástica y alteraciones neurológicas',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'en-7',
              nombre: 'Ácido Fólico (Folato)',
              tipo: 'laboratorio',
              queEvalua: 'Nivel sérico de ácido fólico',
              paraQueSirve: 'Detecta deficiencia de folato, importante para síntesis de ADN y prevención de anemia',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'en-8',
              nombre: 'InBody - Composición Corporal por Bioimpedancia',
              tipo: 'funcional',
              queEvalua: 'Masa grasa, masa muscular, agua corporal total, índice de masa corporal y metabolismo basal',
              paraQueSirve: 'Evalúa composición corporal precisa, distribución de grasa, masa muscular y estado nutricional objetivo',
              requiereAyuno: false,
              preparacion: 'Ayuno de 2 horas. Evitar ejercicio 12 horas antes. Orinar 30 minutos antes',
              precio: 4990
            }
          ]
        }
      ]
    },
    {
      id: 'diabeticos-hipertensos',
      nombre: 'Diabéticos e Hipertensos',
      descripcion: 'Evaluación especializada para pacientes con diabetes mellitus e hipertensión arterial',
      paquetes: [
        {
          id: 'dh-control',
          nombre: 'Control Diabéticos e Hipertensos',
          edadMinima: 18,
          edadMaxima: null,
          objetivo: 'Evaluación integral del control metabólico y cardiovascular en pacientes diabéticos e hipertensos',
          requiereAyuno: true,
          duracionEstimada: '3-4 horas',
          preparacion: 'Ayuno de 8-12 horas. Tomar medicamentos habituales con agua (consultar con médico).',
          precio: 34900,
          examenes: [
            {
              id: 'dh-1',
              nombre: 'Glicemia en Ayunas',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de glucosa en sangre después de ayuno prolongado',
              paraQueSirve: 'Evalúa control glucémico basal y efectividad del tratamiento antidiabético',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8-12 horas. Tomar medicamentos con agua',
              precio: 1990
            },
            {
              id: 'dh-2',
              nombre: 'Hemoglobina Glicosilada (HbA1c)',
              tipo: 'laboratorio',
              queEvalua: 'Promedio de glucosa de los últimos 2-3 meses',
              paraQueSirve: 'Evalúa control glucémico a largo plazo, principal marcador de control en diabetes',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'dh-3',
              nombre: 'PTGO - Prueba de Tolerancia a la Glucosa Oral',
              tipo: 'laboratorio',
              queEvalua: 'Respuesta glucémica a carga oral de glucosa (75g)',
              paraQueSirve: 'Diagnóstico de diabetes, prediabetes y evaluación de resistencia a la insulina',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8-12 horas. Dieta normal 3 días antes',
              precio: 3990
            },
            {
              id: 'dh-4',
              nombre: 'Test de HOMA - Resistencia a la Insulina',
              tipo: 'laboratorio',
              queEvalua: 'Índice HOMA calculado a partir de glicemia e insulina en ayunas',
              paraQueSirve: 'Evalúa resistencia a la insulina, predictor de diabetes tipo 2 y síndrome metabólico',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8-12 horas',
              precio: 2990
            },
            {
              id: 'dh-5',
              nombre: 'Creatinina en Sangre',
              tipo: 'laboratorio',
              queEvalua: 'Función renal mediante creatinina sérica',
              paraQueSirve: 'Evalúa función renal, complicación frecuente en diabetes e hipertensión',
              requiereAyuno: false,
              preparacion: 'Evitar ejercicio intenso 24 horas antes',
              precio: 1990
            },
            {
              id: 'dh-6',
              nombre: 'Microalbuminuria',
              tipo: 'laboratorio',
              queEvalua: 'Excreción urinaria de albúmina en pequeñas cantidades',
              paraQueSirve: 'Detecta nefropatía diabética temprana y daño renal en hipertensión',
              requiereAyuno: false,
              preparacion: 'Primera orina de la mañana o muestra de 24 horas',
              precio: 2990
            },
            {
              id: 'dh-7',
              nombre: 'Electrolitos Plasmáticos (Sodio, Potasio, Cloro)',
              tipo: 'laboratorio',
              queEvalua: 'Concentración de electrolitos en sangre',
              paraQueSirve: 'Evalúa equilibrio electrolítico, importante en hipertensión y efectos de medicamentos',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'dh-8',
              nombre: 'Holter de Presión Arterial (24 horas)',
              tipo: 'funcional',
              queEvalua: 'Registro continuo de presión arterial durante 24 horas',
              paraQueSirve: 'Evalúa control tensional, efectividad de tratamiento antihipertensivo y variabilidad',
              requiereAyuno: false,
              preparacion: 'Mantener actividad normal durante el registro',
              precio: 4990
            },
            {
              id: 'dh-9',
              nombre: 'Electrocardiograma de Reposo (12 derivadas)',
              tipo: 'funcional',
              queEvalua: 'Actividad eléctrica del corazón',
              paraQueSirve: 'Detecta complicaciones cardíacas de diabetes e hipertensión',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 3990
            },
            {
              id: 'dh-10',
              nombre: 'Perfil Lipídico Completo',
              tipo: 'laboratorio',
              queEvalua: 'Colesterol total, HDL, LDL, triglicéridos',
              paraQueSirve: 'Evalúa dislipidemia asociada a diabetes y riesgo cardiovascular',
              requiereAyuno: true,
              preparacion: 'Ayuno de 12 horas',
              precio: 2990
            }
          ]
        }
      ]
    },
    {
      id: 'control-sobrepeso',
      nombre: 'Control de Sobrepeso',
      descripcion: 'Evaluación metabólica y cardiovascular para pacientes con sobrepeso y obesidad',
      paquetes: [
        {
          id: 'cs-completo',
          nombre: 'Control de Sobrepeso Completo',
          edadMinima: 18,
          edadMaxima: null,
          objetivo: 'Evaluación integral metabólica, cardiovascular y composición corporal en sobrepeso/obesidad',
          requiereAyuno: true,
          duracionEstimada: '3-4 horas',
          preparacion: 'Ayuno de 8-12 horas. Evitar ejercicio intenso 24 horas antes.',
          precio: 38900,
          examenes: [
            {
              id: 'cs-1',
              nombre: 'Glicemia en Ayunas',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de glucosa en ayunas',
              paraQueSirve: 'Detecta resistencia a la insulina y diabetes asociada a obesidad',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8-12 horas',
              precio: 1990
            },
            {
              id: 'cs-2',
              nombre: 'Hemoglobina Glicosilada (HbA1c)',
              tipo: 'laboratorio',
              queEvalua: 'Control glucémico a largo plazo',
              paraQueSirve: 'Evalúa riesgo de diabetes en obesidad',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 2990
            },
            {
              id: 'cs-3',
              nombre: 'Perfil Lipídico Completo',
              tipo: 'laboratorio',
              queEvalua: 'Colesterol y triglicéridos',
              paraQueSirve: 'Evalúa dislipidemia asociada a obesidad',
              requiereAyuno: true,
              preparacion: 'Ayuno de 12 horas',
              precio: 2990
            },
            {
              id: 'cs-4',
              nombre: 'Perfil Hepático Completo',
              tipo: 'laboratorio',
              queEvalua: 'Función hepática',
              paraQueSirve: 'Detecta esteatosis hepática (hígado graso) asociada a obesidad',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8 horas',
              precio: 2990
            },
            {
              id: 'cs-5',
              nombre: 'Creatinina en Sangre',
              tipo: 'laboratorio',
              queEvalua: 'Función renal',
              paraQueSirve: 'Evalúa función renal',
              requiereAyuno: false,
              preparacion: 'Evitar ejercicio intenso 24 horas antes',
              precio: 1990
            },
            {
              id: 'cs-6',
              nombre: 'Ácido Úrico',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de ácido úrico',
              paraQueSirve: 'Evalúa riesgo de gota asociado a obesidad',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8 horas',
              precio: 1990
            },
            {
              id: 'cs-7',
              nombre: 'Test de HOMA - Resistencia a la Insulina',
              tipo: 'laboratorio',
              queEvalua: 'Resistencia a la insulina',
              paraQueSirve: 'Evalúa resistencia a la insulina en obesidad',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8-12 horas',
              precio: 2990
            },
            {
              id: 'cs-8',
              nombre: 'Vitamina D (25-OH Vitamina D)',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de vitamina D',
              paraQueSirve: 'Evalúa deficiencia de vitamina D común en obesidad',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 3990
            },
            {
              id: 'cs-9',
              nombre: 'InBody - Composición Corporal por Bioimpedancia',
              tipo: 'funcional',
              queEvalua: 'Composición corporal precisa',
              paraQueSirve: 'Evalúa masa grasa, masa muscular y distribución corporal',
              requiereAyuno: false,
              preparacion: 'Ayuno de 2 horas. Evitar ejercicio 12 horas antes',
              precio: 4990
            },
            {
              id: 'cs-10',
              nombre: 'Electrocardiograma de Reposo (12 derivadas)',
              tipo: 'funcional',
              queEvalua: 'Actividad eléctrica del corazón',
              paraQueSirve: 'Evalúa complicaciones cardíacas de obesidad',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 3990
            },
            {
              id: 'cs-11',
              nombre: 'Test de Esfuerzo (Ergometría)',
              tipo: 'funcional',
              queEvalua: 'Capacidad funcional y respuesta cardiovascular al ejercicio',
              paraQueSirve: 'Evalúa capacidad funcional y riesgo cardiovascular en obesidad',
              requiereAyuno: true,
              preparacion: 'Ayuno de 2 horas. Ropa cómoda',
              precio: 4990
            }
          ]
        }
      ]
    },
    {
      id: 'caida-cabello',
      nombre: 'Caída del Cabello',
      descripcion: 'Evaluación de causas nutricionales y metabólicas de alopecia',
      paquetes: [
        {
          id: 'cc-basico',
          nombre: 'Evaluación Caída del Cabello',
          edadMinima: 18,
          edadMaxima: null,
          objetivo: 'Identificar causas nutricionales y metabólicas de alopecia',
          requiereAyuno: false,
          duracionEstimada: '30 minutos',
          preparacion: 'No requiere preparación especial',
          precio: 2990,
          examenes: [
            {
              id: 'cc-1',
              nombre: 'Cinética de Fierro (Hierro)',
              tipo: 'laboratorio',
              queEvalua: 'Hierro sérico, ferritina, transferrina y capacidad total de fijación de hierro (TIBC)',
              paraQueSirve: 'Detecta deficiencia de hierro, causa frecuente de alopecia, especialmente en mujeres. Evalúa reservas de hierro y capacidad de transporte',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial. Evitar suplementos de hierro 24 horas antes',
              precio: 2990
            }
          ]
        }
      ]
    },
    {
      id: 'tercera-edad',
      nombre: 'Tercera Edad',
      descripcion: 'Evaluación geriátrica integral para hombres mayores de 60 años',
      paquetes: [
        {
          id: 'te-60-69',
          nombre: 'Tercera Edad 60-69 años',
          edadMinima: 60,
          edadMaxima: 69,
          objetivo: 'Evaluación geriátrica integral con enfoque en prevención de fragilidad y detección de patologías prevalentes',
          requiereAyuno: true,
          duracionEstimada: '4-5 horas',
          preparacion: 'Ayuno de 8-12 horas. Continuar medicamentos habituales con agua.',
          precio: 59900,
          examenes: [
            {
              id: 'te-60-69-1',
              nombre: 'Hemograma Completo con VHS',
              tipo: 'laboratorio',
              queEvalua: 'Recuento celular completo y velocidad de sedimentación',
              paraQueSirve: 'Detecta anemia, infecciones, procesos inflamatorios y alteraciones hematológicas comunes en adultos mayores',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'te-60-69-2',
              nombre: 'Perfil Bioquímico Completo',
              tipo: 'laboratorio',
              queEvalua: 'Glucosa, creatinina, urea, ácido úrico, electrolitos y función hepática básica',
              paraQueSirve: 'Evaluación integral de función renal, hepática y metabólica en adultos mayores',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8-12 horas',
              precio: 3990
            },
            {
              id: 'te-60-69-3',
              nombre: 'Perfil Lipídico Completo',
              tipo: 'laboratorio',
              queEvalua: 'Colesterol total, HDL, LDL, triglicéridos',
              paraQueSirve: 'Evalúa riesgo cardiovascular en adultos mayores',
              requiereAyuno: true,
              preparacion: 'Ayuno de 12 horas',
              precio: 2990
            },
            {
              id: 'te-60-69-4',
              nombre: 'Creatinina en Sangre',
              tipo: 'laboratorio',
              queEvalua: 'Función renal',
              paraQueSirve: 'Evalúa función renal, importante en adultos mayores',
              requiereAyuno: false,
              preparacion: 'Evitar ejercicio intenso 24 horas antes',
              precio: 1990
            },
            {
              id: 'te-60-69-5',
              nombre: 'Ácido Úrico',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de ácido úrico',
              paraQueSirve: 'Evalúa riesgo de gota y función renal',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8 horas',
              precio: 1990
            },
            {
              id: 'te-60-69-6',
              nombre: 'Vitamina D (25-OH Vitamina D)',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de vitamina D',
              paraQueSirve: 'Detecta deficiencia de vitamina D, común en adultos mayores, importante para salud ósea',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 3990
            },
            {
              id: 'te-60-69-7',
              nombre: 'Vitamina B12 (Cobalamina)',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de vitamina B12',
              paraQueSirve: 'Detecta deficiencia de B12, causa de anemia y alteraciones neurológicas en adultos mayores',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 2990
            },
            {
              id: 'te-60-69-8',
              nombre: 'Ácido Fólico (Folato)',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de ácido fólico',
              paraQueSirve: 'Detecta deficiencia de folato, importante en adultos mayores',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 2990
            },
            {
              id: 'te-60-69-9',
              nombre: 'Calcio Total',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de calcio en sangre',
              paraQueSirve: 'Evalúa metabolismo del calcio y salud ósea',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 1990
            },
            {
              id: 'te-60-69-10',
              nombre: 'Fosfato',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de fosfato en sangre',
              paraQueSirve: 'Evalúa metabolismo del fósforo y función renal',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 1990
            },
            {
              id: 'te-60-69-11',
              nombre: 'Electrocardiograma de Reposo (12 derivadas)',
              tipo: 'funcional',
              queEvalua: 'Actividad eléctrica del corazón',
              paraQueSirve: 'Detecta arritmias e isquemia en adultos mayores',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 3990
            },
            {
              id: 'te-60-69-12',
              nombre: 'Holter de Ritmo (24 horas)',
              tipo: 'funcional',
              queEvalua: 'Ritmo cardíaco durante 24 horas',
              paraQueSirve: 'Detecta arritmias intermitentes comunes en adultos mayores',
              requiereAyuno: false,
              preparacion: 'Mantener actividad normal',
              precio: 4990
            },
            {
              id: 'te-60-69-13',
              nombre: 'Densitometría Ósea',
              tipo: 'imagen',
              queEvalua: 'Densidad mineral ósea en columna lumbar y cadera',
              paraQueSirve: 'Diagnóstico de osteoporosis, evaluación de riesgo de fracturas y seguimiento de tratamiento',
              requiereAyuno: false,
              preparacion: 'No requiere preparación. Evitar suplementos de calcio 24 horas antes',
              precio: 4990
            },
            {
              id: 'te-60-69-14',
              nombre: 'Ecografía Abdominal Completa',
              tipo: 'imagen',
              queEvalua: 'Estructura de órganos abdominales',
              paraQueSirve: 'Detecta patologías abdominales comunes en adultos mayores',
              requiereAyuno: true,
              preparacion: 'Ayuno de 6-8 horas',
              precio: 3990
            },
            {
              id: 'te-60-69-15',
              nombre: 'Test de Hemorragias Ocultas en Deposiciones',
              tipo: 'laboratorio',
              queEvalua: 'Sangre oculta en heces',
              paraQueSirve: 'Screening de cáncer colorrectal en adultos mayores',
              requiereAyuno: false,
              preparacion: 'Evitar carnes rojas 3 días antes',
              precio: 2990
            },
            {
              id: 'te-60-69-16',
              nombre: 'Antígeno Prostático Específico (PSA) Total',
              tipo: 'laboratorio',
              queEvalua: 'Marcador tumoral prostático',
              paraQueSirve: 'Screening de cáncer de próstata en adultos mayores',
              requiereAyuno: false,
              preparacion: 'Evitar eyaculación 48 horas antes',
              precio: 3990
            },
            {
              id: 'te-60-69-17',
              nombre: 'Orina Completa con Sedimento',
              tipo: 'laboratorio',
              queEvalua: 'Análisis completo de orina',
              paraQueSirve: 'Detecta infecciones urinarias y enfermedad renal',
              requiereAyuno: false,
              preparacion: 'Primera orina de la mañana',
              precio: 1990
            }
          ]
        },
        {
          id: 'te-70-plus',
          nombre: 'Tercera Edad 70+ años',
          edadMinima: 70,
          edadMaxima: null,
          objetivo: 'Evaluación geriátrica avanzada con enfoque en fragilidad y prevención de complicaciones',
          requiereAyuno: true,
          duracionEstimada: '4-5 horas',
          preparacion: 'Ayuno de 8-12 horas. Continuar medicamentos habituales.',
          precio: 59900,
          examenes: [
            // Similar estructura pero adaptado para 70+
            {
              id: 'te-70-1',
              nombre: 'Hemograma Completo con VHS',
              tipo: 'laboratorio',
              queEvalua: 'Recuento celular completo',
              paraQueSirve: 'Detecta anemia y procesos inflamatorios',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 2990
            },
            {
              id: 'te-70-2',
              nombre: 'Perfil Bioquímico Completo',
              tipo: 'laboratorio',
              queEvalua: 'Función renal, hepática y metabólica',
              paraQueSirve: 'Evaluación integral en adultos mayores',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8-12 horas',
              precio: 3990
            },
            {
              id: 'te-70-3',
              nombre: 'Perfil Lipídico Completo',
              tipo: 'laboratorio',
              queEvalua: 'Colesterol y triglicéridos',
              paraQueSirve: 'Evalúa riesgo cardiovascular',
              requiereAyuno: true,
              preparacion: 'Ayuno de 12 horas',
              precio: 2990
            },
            {
              id: 'te-70-4',
              nombre: 'Creatinina en Sangre',
              tipo: 'laboratorio',
              queEvalua: 'Función renal',
              paraQueSirve: 'Evalúa función renal',
              requiereAyuno: false,
              preparacion: 'Evitar ejercicio intenso 24 horas antes',
              precio: 1990
            },
            {
              id: 'te-70-5',
              nombre: 'Ácido Úrico',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de ácido úrico',
              paraQueSirve: 'Evalúa riesgo de gota',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8 horas',
              precio: 1990
            },
            {
              id: 'te-70-6',
              nombre: 'Vitamina D (25-OH Vitamina D)',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de vitamina D',
              paraQueSirve: 'Detecta deficiencia de vitamina D',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 3990
            },
            {
              id: 'te-70-7',
              nombre: 'Vitamina B12 (Cobalamina)',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de vitamina B12',
              paraQueSirve: 'Detecta deficiencia de B12',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 2990
            },
            {
              id: 'te-70-8',
              nombre: 'Ácido Fólico (Folato)',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de ácido fólico',
              paraQueSirve: 'Detecta deficiencia de folato',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 2990
            },
            {
              id: 'te-70-9',
              nombre: 'Calcio Total',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de calcio',
              paraQueSirve: 'Evalúa metabolismo del calcio',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 1990
            },
            {
              id: 'te-70-10',
              nombre: 'Fosfato',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de fosfato',
              paraQueSirve: 'Evalúa metabolismo del fósforo',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 1990
            },
            {
              id: 'te-70-11',
              nombre: 'Electrocardiograma de Reposo (12 derivadas)',
              tipo: 'funcional',
              queEvalua: 'Actividad eléctrica del corazón',
              paraQueSirve: 'Detecta arritmias e isquemia',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 3990
            },
            {
              id: 'te-70-12',
              nombre: 'Holter de Ritmo (24 horas)',
              tipo: 'funcional',
              queEvalua: 'Ritmo cardíaco durante 24 horas',
              paraQueSirve: 'Detecta arritmias intermitentes',
              requiereAyuno: false,
              preparacion: 'Mantener actividad normal',
              precio: 4990
            },
            {
              id: 'te-70-13',
              nombre: 'Densitometría Ósea',
              tipo: 'imagen',
              queEvalua: 'Densidad mineral ósea',
              paraQueSirve: 'Diagnóstico de osteoporosis',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 4990
            },
            {
              id: 'te-70-14',
              nombre: 'Ecografía Abdominal Completa',
              tipo: 'imagen',
              queEvalua: 'Estructura de órganos abdominales',
              paraQueSirve: 'Detecta patologías abdominales',
              requiereAyuno: true,
              preparacion: 'Ayuno de 6-8 horas',
              precio: 3990
            },
            {
              id: 'te-70-15',
              nombre: 'Test de Hemorragias Ocultas en Deposiciones',
              tipo: 'laboratorio',
              queEvalua: 'Sangre oculta en heces',
              paraQueSirve: 'Screening de cáncer colorrectal',
              requiereAyuno: false,
              preparacion: 'Evitar carnes rojas 3 días antes',
              precio: 2990
            },
            {
              id: 'te-70-16',
              nombre: 'Antígeno Prostático Específico (PSA) Total',
              tipo: 'laboratorio',
              queEvalua: 'Marcador tumoral prostático',
              paraQueSirve: 'Screening de cáncer de próstata',
              requiereAyuno: false,
              preparacion: 'Evitar eyaculación 48 horas antes',
              precio: 3990
            },
            {
              id: 'te-70-17',
              nombre: 'Orina Completa con Sedimento',
              tipo: 'laboratorio',
              queEvalua: 'Análisis completo de orina',
              paraQueSirve: 'Detecta infecciones urinarias',
              requiereAyuno: false,
              preparacion: 'Primera orina de la mañana',
              precio: 1990
            }
          ]
        }
      ]
    },
    {
      id: 'cuarta-edad',
      nombre: 'Cuarta Edad',
      descripcion: 'Evaluación geriátrica avanzada para hombres mayores de 80 años',
      paquetes: [
        {
          id: 'ce-80-plus',
          nombre: 'Cuarta Edad 80+ años',
          edadMinima: 80,
          edadMaxima: null,
          objetivo: 'Evaluación geriátrica especializada con enfoque en fragilidad, polifarmacia y prevención de caídas',
          requiereAyuno: true,
          duracionEstimada: '4-5 horas',
          preparacion: 'Ayuno de 8-12 horas. Continuar medicamentos habituales. Considerar evaluación previa de capacidad funcional.',
          precio: 59900,
          examenes: [
            // Similar a Tercera Edad pero con consideraciones especiales para 80+
            {
              id: 'ce-1',
              nombre: 'Hemograma Completo con VHS',
              tipo: 'laboratorio',
              queEvalua: 'Recuento celular completo',
              paraQueSirve: 'Detecta anemia y procesos inflamatorios',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 2990
            },
            {
              id: 'ce-2',
              nombre: 'Perfil Bioquímico Completo',
              tipo: 'laboratorio',
              queEvalua: 'Función renal, hepática y metabólica',
              paraQueSirve: 'Evaluación integral en adultos mayores',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8-12 horas',
              precio: 3990
            },
            {
              id: 'ce-3',
              nombre: 'Perfil Lipídico Completo',
              tipo: 'laboratorio',
              queEvalua: 'Colesterol y triglicéridos',
              paraQueSirve: 'Evalúa riesgo cardiovascular',
              requiereAyuno: true,
              preparacion: 'Ayuno de 12 horas',
              precio: 2990
            },
            {
              id: 'ce-4',
              nombre: 'Creatinina en Sangre',
              tipo: 'laboratorio',
              queEvalua: 'Función renal',
              paraQueSirve: 'Evalúa función renal',
              requiereAyuno: false,
              preparacion: 'Evitar ejercicio intenso 24 horas antes',
              precio: 1990
            },
            {
              id: 'ce-5',
              nombre: 'Ácido Úrico',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de ácido úrico',
              paraQueSirve: 'Evalúa riesgo de gota',
              requiereAyuno: true,
              preparacion: 'Ayuno de 8 horas',
              precio: 1990
            },
            {
              id: 'ce-6',
              nombre: 'Vitamina D (25-OH Vitamina D)',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de vitamina D',
              paraQueSirve: 'Detecta deficiencia de vitamina D',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 3990
            },
            {
              id: 'ce-7',
              nombre: 'Vitamina B12 (Cobalamina)',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de vitamina B12',
              paraQueSirve: 'Detecta deficiencia de B12',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 2990
            },
            {
              id: 'ce-8',
              nombre: 'Ácido Fólico (Folato)',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de ácido fólico',
              paraQueSirve: 'Detecta deficiencia de folato',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 2990
            },
            {
              id: 'ce-9',
              nombre: 'Calcio Total',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de calcio',
              paraQueSirve: 'Evalúa metabolismo del calcio',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 1990
            },
            {
              id: 'ce-10',
              nombre: 'Fosfato',
              tipo: 'laboratorio',
              queEvalua: 'Nivel de fosfato',
              paraQueSirve: 'Evalúa metabolismo del fósforo',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 1990
            },
            {
              id: 'ce-11',
              nombre: 'Electrocardiograma de Reposo (12 derivadas)',
              tipo: 'funcional',
              queEvalua: 'Actividad eléctrica del corazón',
              paraQueSirve: 'Detecta arritmias e isquemia',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 3990
            },
            {
              id: 'ce-12',
              nombre: 'Holter de Ritmo (24 horas)',
              tipo: 'funcional',
              queEvalua: 'Ritmo cardíaco durante 24 horas',
              paraQueSirve: 'Detecta arritmias intermitentes',
              requiereAyuno: false,
              preparacion: 'Mantener actividad normal',
              precio: 4990
            },
            {
              id: 'ce-13',
              nombre: 'Densitometría Ósea',
              tipo: 'imagen',
              queEvalua: 'Densidad mineral ósea',
              paraQueSirve: 'Diagnóstico de osteoporosis',
              requiereAyuno: false,
              preparacion: 'No requiere preparación',
              precio: 4990
            },
            {
              id: 'ce-14',
              nombre: 'Ecografía Abdominal Completa',
              tipo: 'imagen',
              queEvalua: 'Estructura de órganos abdominales',
              paraQueSirve: 'Detecta patologías abdominales',
              requiereAyuno: true,
              preparacion: 'Ayuno de 6-8 horas',
              precio: 3990
            },
            {
              id: 'ce-15',
              nombre: 'Test de Hemorragias Ocultas en Deposiciones',
              tipo: 'laboratorio',
              queEvalua: 'Sangre oculta en heces',
              paraQueSirve: 'Screening de cáncer colorrectal',
              requiereAyuno: false,
              preparacion: 'Evitar carnes rojas 3 días antes',
              precio: 2990
            },
            {
              id: 'ce-16',
              nombre: 'Antígeno Prostático Específico (PSA) Total',
              tipo: 'laboratorio',
              queEvalua: 'Marcador tumoral prostático',
              paraQueSirve: 'Screening de cáncer de próstata',
              requiereAyuno: false,
              preparacion: 'Evitar eyaculación 48 horas antes',
              precio: 3990
            },
            {
              id: 'ce-17',
              nombre: 'Orina Completa con Sedimento',
              tipo: 'laboratorio',
              queEvalua: 'Análisis completo de orina',
              paraQueSirve: 'Detecta infecciones urinarias',
              requiereAyuno: false,
              preparacion: 'Primera orina de la mañana',
              precio: 1990
            }
          ]
        }
      ]
    },
    {
      id: 'examenes-especiales',
      nombre: 'Exámenes Especiales',
      descripcion: 'Exámenes específicos para detección de enfermedades infecciosas, toxicológicas y funcionales',
      paquetes: [
        {
          id: 'ee-infecciosas',
          nombre: 'Panel Enfermedades Infecciosas',
          edadMinima: 18,
          edadMaxima: null,
          objetivo: 'Detección de enfermedades infecciosas de transmisión sexual y otras patologías infecciosas',
          requiereAyuno: false,
          duracionEstimada: '1-2 horas',
          preparacion: 'No requiere preparación especial',
          precio: 14900,
          examenes: [
            {
              id: 'ee-i-1',
              nombre: 'Test de ELISA para VIH',
              tipo: 'laboratorio',
              queEvalua: 'Anticuerpos contra el virus de inmunodeficiencia humana (VIH)',
              paraQueSirve: 'Detección de infección por VIH, screening de rutina y diagnóstico de SIDA',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'ee-i-2',
              nombre: 'Test de ELISA para VHC (Hepatitis C)',
              tipo: 'laboratorio',
              queEvalua: 'Anticuerpos contra el virus de hepatitis C',
              paraQueSirve: 'Detección de infección por hepatitis C, screening de rutina y evaluación de riesgo',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'ee-i-3',
              nombre: 'Hepatitis B, Antígeno de Superficie (HBsAg)',
              tipo: 'laboratorio',
              queEvalua: 'Antígeno de superficie del virus de hepatitis B',
              paraQueSirve: 'Detección de infección activa por hepatitis B, screening y evaluación de portadores',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'ee-i-4',
              nombre: 'VDRL (Sífilis)',
              tipo: 'laboratorio',
              queEvalua: 'Anticuerpos no treponémicos para detección de sífilis',
              paraQueSirve: 'Screening de sífilis, detección de infección activa y seguimiento de tratamiento',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            },
            {
              id: 'ee-i-5',
              nombre: 'Herpes Simplex (HSV-1 HSV-2) Serología IgG',
              tipo: 'laboratorio',
              queEvalua: 'Anticuerpos IgG contra virus herpes simplex tipo 1 y 2',
              paraQueSirve: 'Detección de infección previa por herpes, evaluación de riesgo y diagnóstico de recurrencias',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            }
          ]
        },
        {
          id: 'ee-toxicologicos',
          nombre: 'Panel Toxicológico',
          edadMinima: 18,
          edadMaxima: null,
          objetivo: 'Detección de sustancias psicoactivas en orina',
          requiereAyuno: false,
          duracionEstimada: '30 minutos',
          preparacion: 'No requiere preparación especial. Muestra de orina fresca.',
          precio: 19900,
          examenes: [
            {
              id: 'ee-t-1',
              nombre: 'Test de Opiáceos',
              tipo: 'laboratorio',
              queEvalua: 'Presencia de opiáceos (morfina, codeína, heroína) en orina',
              paraQueSirve: 'Detección de consumo de opiáceos, screening ocupacional y evaluación de adicciones',
              requiereAyuno: false,
              preparacion: 'Muestra de orina fresca. No requiere ayuno',
              precio: 3990
            },
            {
              id: 'ee-t-2',
              nombre: 'Test de Anfetaminas',
              tipo: 'laboratorio',
              queEvalua: 'Presencia de anfetaminas y metanfetaminas en orina',
              paraQueSirve: 'Detección de consumo de anfetaminas, screening ocupacional y evaluación de uso de sustancias',
              requiereAyuno: false,
              preparacion: 'Muestra de orina fresca',
              precio: 3990
            },
            {
              id: 'ee-t-3',
              nombre: 'Test de THC (Cannabis)',
              tipo: 'laboratorio',
              queEvalua: 'Presencia de metabolitos de tetrahidrocannabinol (THC) en orina',
              paraQueSirve: 'Detección de consumo de cannabis, screening ocupacional y evaluación de uso de marihuana',
              requiereAyuno: false,
              preparacion: 'Muestra de orina fresca',
              precio: 3990
            },
            {
              id: 'ee-t-4',
              nombre: 'Test de Cocaína',
              tipo: 'laboratorio',
              queEvalua: 'Presencia de metabolitos de cocaína (benzoylecgonina) en orina',
              paraQueSirve: 'Detección de consumo de cocaína, screening ocupacional y evaluación de adicciones',
              requiereAyuno: false,
              preparacion: 'Muestra de orina fresca',
              precio: 3990
            },
            {
              id: 'ee-t-5',
              nombre: 'Test de Benzodiacepinas',
              tipo: 'laboratorio',
              queEvalua: 'Presencia de benzodiacepinas en orina',
              paraQueSirve: 'Detección de consumo de benzodiacepinas, screening ocupacional y evaluación de uso de medicamentos',
              requiereAyuno: false,
              preparacion: 'Muestra de orina fresca',
              precio: 3990
            }
          ]
        },
        {
          id: 'ee-funcionales',
          nombre: 'Panel Funcional',
          edadMinima: 18,
          edadMaxima: null,
          objetivo: 'Evaluación de función respiratoria y auditiva',
          requiereAyuno: false,
          duracionEstimada: '1-2 horas',
          preparacion: 'No requiere preparación especial',
          precio: 10900,
          examenes: [
            {
              id: 'ee-f-1',
              nombre: 'Espirometría Basal',
              tipo: 'funcional',
              queEvalua: 'Volúmenes y flujos pulmonares, capacidad vital forzada (CVF), volumen espiratorio forzado en 1 segundo (VEF1) y relación VEF1/CVF',
              paraQueSirve: 'Diagnóstico de enfermedad pulmonar obstructiva crónica (EPOC), asma, evaluación de función pulmonar y capacidad respiratoria',
              requiereAyuno: false,
              preparacion: 'No fumar 2 horas antes. Evitar broncodilatadores 12 horas antes (consultar médico)',
              precio: 3990
            },
            {
              id: 'ee-f-2',
              nombre: 'Audiometría Bilateral',
              tipo: 'funcional',
              queEvalua: 'Umbral auditivo en diferentes frecuencias (250-8000 Hz) en ambos oídos',
              paraQueSirve: 'Diagnóstico de hipoacusia, evaluación de pérdida auditiva, screening ocupacional y evaluación de capacidad auditiva',
              requiereAyuno: false,
              preparacion: 'Evitar exposición a ruido intenso 16 horas antes',
              precio: 3990
            },
            {
              id: 'ee-f-3',
              nombre: 'Impedanciometría',
              tipo: 'funcional',
              queEvalua: 'Impedancia acústica del oído medio, movilidad del tímpano y función de la trompa de Eustaquio',
              paraQueSirve: 'Diagnóstico de otitis media, perforaciones timpánicas, disfunción de trompa de Eustaquio y evaluación del oído medio',
              requiereAyuno: false,
              preparacion: 'No requiere preparación especial',
              precio: 2990
            }
          ]
        }
      ]
    }
  ]
};

export default examenesMedicosHombre;
