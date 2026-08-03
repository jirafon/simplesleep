import React, { useState } from 'react';
import StartupCard from './StartupCard';
import StartupModal from './StartupModal';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import VizoraLogo from '../assets/vizorablack.png';
import EticproLogo from '../assets/eticprologo1.png';
import PrivaxLogo from '../assets/privaxlow.png';
import SmartriskLogo from '../assets/smartrisk.png';
import InsightXLogo from '../assets/insightx.png';
// Usar el logo específico de Automatix en la sección de inicio
import AutomatixLogo from '../assets/automatix.png';

const módulos  = [
  // SEGMENTO: Cumplimiento de Ley
  {
    id: 1,
    name: 'Privax',
    segment: 'Cumplimiento de Ley',
    tagline: 'Gestión de Privacidad y Cumplimiento de Ley de Datos Personales',
    logo: PrivaxLogo,
    description: 'Adaptarse a la nueva Ley de Datos Personales en Chile requiere herramientas para cumplir con transparencia, trazabilidad y consentimiento.',
    features: [
      'Registro de consentimientos, políticas y bases de datos',
      'Scoring de cumplimiento, gestión documental y reportabilidad',
      'Análisis de brecha y auditoría',
      'Gestión ARCO con KYC y seguimiento',
      'Librería de cláusulas y políticas reutilizables'
    ],
    keyBenefit: 'Cumple con la ley chilena de datos personales con trazabilidad total y bajo costo operativo.',
    salesMessage: 'Privax asegura tu cumplimiento legal en protección de datos con simplicidad y evidencia.',
    prices: [
      { plan: 'Básico', limits: 'Hasta 5.000 bases activas', features: 'Registro y consentimiento, solicitud ARCO', support: 'Email', price: 'USD$ 290' },
      { plan: 'Pro', limits: 'Hasta 50.000 bases activas', features: 'Todo + flujos internos, políticas, alertas', support: 'Chat onboarding', price: 'USD$ 890' },
      { plan: 'Enterprise', limits: 'Ilimitado', features: 'Todo + API, auditoría legal, dashboard avanzado', support: 'Dedicado', price: 'USD$ 2.000+' },
    ],
  },
  {
    id: 2,
    name: 'Eticpro',
    segment: 'Cumplimiento de Ley',
    tagline: 'Gestión Ética y Cumplimiento de Ley 21.595',
    logo: EticproLogo,
    description: 'Falta de evidencia y sistematización en cumplimiento ético, conflictos de interés y declaraciones internas.',
    features: [
      'Declaraciones de conflictos de interés y regalos',
      'Canal de denuncias con trazabilidad',
      'Repositorio con Articulations (lectura y aceptación)',
      'Registro de reuniones con PET (Personas Expuestas)',
      'Trazabilidad y flujos de aprobación',
    ],
    keyBenefit: 'Minimiza el riesgo penal y reputacional con una cultura ética respaldada con evidencia.',
    salesMessage: 'Eticpro convierte la ética en acción. Cumple con la Ley 21.595 y más.',
    prices: [
      { plan: 'Ver planes en Eticpro.com', limits: '', features: '', support: '', price: '' },
    ],
    link: 'https://eticpro.com',
  },
  {
    id: 3,
    name: 'Vizora',
    segment: 'Cumplimiento de Ley',
    tagline: 'Monitoreo de Reputación, Riesgo Normativo y Legal',
    logo: VizoraLogo,
    description: 'Las empresas no pueden enterarse a tiempo de riesgos reputacionales, noticias negativas o cambios normativos que las afectan.',
    features: [
      'Monitoreo de medios y reputación (Vizora)',
      'Monitoreo legal/regulatorio diario (LexMonitor)',
      'Seguimiento de RUTs de empresas/personas en bases públicas',
      'Asignacion de tareas y workflow de análisis de brechas y plan de acción',
      'Auditoría histórica y trazabilidad',
    ],
    keyBenefit: 'Detecta riesgos reputacionales y regulatorios con anticipación, protegiendo marca y cumplimiento.',
    salesMessage: 'Monitorea tu entorno, protege tu reputación y cumple sin sorpresas con Vizora.',
    prices: [
      { plan: 'Básico', limits: 'Hasta 25 RUTs monitoreados', features: 'Reputación, alertas, panel de incidentes', support: 'Email', price: 'USD$ 320' },
      { plan: 'Pro', limits: 'Hasta 100 RUTs monitoreados', features: 'Todo + regulación diaria, clasificación de alertas', support: 'Chat onboarding', price: 'USD$ 980' },
      { plan: 'Enterprise', limits: 'Ilimitado', features: 'Todo + monitoreo internacional, dashboards ejecutivos', support: 'Dedicado', price: 'USD$ 2.200+' },
    ],
  },
  // SEGMENTO: Agentes y Datos
  {
    id: 6,
    name: 'Automatix',
    segment: 'Agentes y Datos',
    tagline: 'Automatización de Workflows y Mapeo Organizacional',
    logo: AutomatixLogo,
    description: 'Falta de trazabilidad y sistematización en procesos repetitivos o regulados, y desconocimiento del mapa real de la organización.',
    features: [
      'Constructor de flujos (claims, agendamientos, registros)',
      'Mapeo digital de áreas, procesos, objetivos, certificaciones',
      'Integración con agentes IA que actúan en cada paso',
      'Aprobaciones jerárquicas y asignaciones automáticas',
      'Registro de evidencia por paso (archivos, firmas, timestamps)',
    ],
    keyBenefit: 'Agiliza y controla cualquier proceso repetitivo con trazabilidad total y agentes IA integrados.',
    salesMessage: 'Mapea, automatiza y controla. Automatix convierte tu operación en eficiencia inteligente.',
    prices: [
      { plan: 'Básico', limits: 'Hasta 3 flujos activos', features: 'Constructor básico, mapeo inicial, agentes por paso', support: 'Email', price: 'USD$ 390' },
      { plan: 'Pro', limits: 'Hasta 10 flujos activos', features: 'Todo + dashboards, roles, aprobaciones múltiples', support: 'Chat onboarding', price: 'USD$ 990' },
      { plan: 'Enterprise', limits: 'Ilimitado', features: 'Todo + módulos especializados, integración con otros sistemas', support: 'Dedicado', price: 'USD$ 2.300+' },
    ],
  },
  {
    id: 8,
    name: 'InsightX',
    segment: 'Agentes y Datos',
    tagline: 'Reportabilidad de Datos de alta complejidad',
    logo: InsightXLogo,
    description: 'Las empresas no deben usar Chatgpt para trabajar con sus datos sensibles, pero tenemos un innovador sistema de trabajar sus datos con metadata y al avez protegerce las privaicdad de estos para poder crear reportes de alta complejidad financieros u otros.',
    features: [
      'Constructor de encuestas dinámico (SurveyX)',
      'Almacenamiento estructurado de respuestas y metadata Seguro',
      'Analítica automática e informes ejecutivos finaicero o de alta complejidad',
     
    ],
    keyBenefit: 'Responde preguntas críticas con velocidad y  precisión sin poner en riesgo tus datos sensibles',
    salesMessage: 'Automatiza tu capacidad de análisis. InsightX convierte conocimiento en acción documentada.',

    prices: [
      { plan: 'Básico', limits: '3 encuestas activas', features: 'Constructor simple, resultados en tabla', support: 'Email', price: 'USD$ 180' },
      { plan: 'Pro', limits: '10 encuestas activas', features: 'Todo + filtros, analítica, seguimiento y reportes', support: 'Chat onboarding', price: 'USD$ 680' },
      { plan: 'Enterprise', limits: 'Ilimitado', features: 'Todo + motor de clasificación IA y dashboard externo', support: 'Dedicado', price: 'USD$ 1.600+' },
    ],
  },
  {
    id: 8.5,
    name: 'Extrax',
    segment: 'Agentes y Datos',
    tagline: 'Plataforma RAG como Servicio con IA Multilingüe',
    logo: AutomatixLogo,
    description: 'Plataforma de RAG (Retrieval-Augmented Generation) como servicio que permite consultar recursos propios con análisis en tiempo real, integración OCR y salidas personalizables.',
    features: [
      'RAG (Retrieval-Augmented Generation) como servicio',
      'Soporte multilingüe avanzado',
      'APIs bajo demanda y personalizables',
      'Integración OCR para documentos',
      'Análisis en tiempo real',
      'Capacidades de ajuste fino (fine-tuning)',
      'Salidas personalizables según necesidades',
      'Consulta de recursos propios de forma segura'
    ],
    keyBenefit: 'Consulta tus recursos con IA avanzada, análisis en tiempo real y soporte multilingüe sin comprometer la seguridad.',
    salesMessage: 'Extrax transforma tus datos en conocimiento accionable con RAG personalizado y APIs bajo demanda.',
    prices: [
      { plan: 'Básico', limits: 'Hasta 1.000 consultas/mes', features: 'RAG básico, OCR, 2 idiomas', support: 'Email', price: 'USD$ 290' },
      { plan: 'Pro', limits: 'Hasta 10.000 consultas/mes', features: 'Todo + multilingüe completo, APIs, fine-tuning', support: 'Chat onboarding', price: 'USD$ 890' },
      { plan: 'Enterprise', limits: 'Ilimitado', features: 'Todo + personalización completa, SLA dedicado, integración avanzada', support: 'Dedicado', price: 'USD$ 2.200+' }
    ],
  },
  // SEGMENTO: Riesgos y Acción
  {
    id: 9,
    name: 'Smartrisk',
    segment: 'Riesgos y Acción',
    tagline: 'Gestión Integral de Riesgos y Matrices Organizacionales',
    logo: SmartriskLogo,
    description: 'Las empresas carecen de herramientas integradas para identificar, mapear y mitigar riesgos críticos a nivel de procesos, objetivos y áreas.',
    features: [
      'Matriz de riesgos por criticidad, impacto, probabilidad',
      'Registro de mitigaciones, tareas, y responsables',
      'Votaciones sobre riesgos en comités',
      'Timeline de eventos e intervenciones',
      'Gestión documental y evidencia',
      'Dashboard ejecutivo y trazabilidad',
    ],
    keyBenefit: 'Visibilidad total de riesgos críticos con trazabilidad y respuesta accionable en un solo lugar.',
    salesMessage: 'Transforma el riesgo en decisión. Smartrisk gestiona lo crítico con claridad y control.',
    prices: [
      { plan: 'Básico', limits: 'Hasta 10 usuarios', features: 'Matriz básica, tareas, votaciones, timeline', support: 'Email', price: 'USD$ 390' },
      { plan: 'Pro', limits: 'Hasta 50 usuarios', features: 'Todo + dashboards, roles avanzados, validación y evidencia', support: 'Chat onboarding', price: 'USD$ 980' },
      { plan: 'Enterprise', limits: 'Ilimitado', features: 'Todo + exportaciones legales, auditoría externa, API', support: 'Dedicado', price: 'USD$ 2.200+' },
    ],
  },
  {
    id: 10,
    name: 'Fortax',
    segment: 'Riesgos y Acción',
    tagline: 'Levantamiento y Mitigación de Riesgos de Ciberseguridad',
    logo: SmartriskLogo,
    description: 'Falta de trazabilidad y control de riesgos en ciberseguridad con propuestas automáticas de mitigación.',
    features: [
      'Levantamiento estructurado de riesgos',
      'Matriz de impacto, criticidad y probabilidad',
      'Copiloto IA que sugiere mitigaciones según NIST/ISO27001',
      'Panel de control con tareas, alertas y evidencias',
      'Dashboard CISO',
    ],
    keyBenefit: 'Fortalece la postura cibernética con mitigación inteligente, alineada a estándares globales.',
    salesMessage: 'Protege tus activos digitales con inteligencia. CyberRisk360 automatiza tu ciberseguridad.',
    prices: [
      { plan: 'Básico', limits: 'Hasta 10 usuarios', features: 'Levantamiento manual, matriz base, tareas', support: 'Email', price: 'USD$ 330' },
      { plan: 'Pro', limits: 'Hasta 50 usuarios', features: 'Todo + copiloto IA, sugerencias automáticas, reportes avanzados', support: 'Chat onboarding', price: 'USD$ 950' },
      { plan: 'Enterprise', limits: 'Ilimitado', features: 'Todo + integración con SIEM, estándares NIST/ISO, dashboard CISO', support: 'Dedicado', price: 'USD$ 2.200+' },
    ],
  },
  {
    id: 11,
    name: 'LMS',
    segment: 'Agentes y Datos',
    tagline: 'Plataforma de Aprendizaje y Gestión de Cursos',
    logo: null, // Agrega logo si está disponible
    description: 'Potente sistema de gestión de aprendizaje para crear, impartir y seguir cursos en línea.',
    features: [
      'Creación y gestión de cursos',
      'Seguimiento de progreso y evaluaciones',
      'Integración con herramientas externas',
      'Reportes y analítica de aprendizaje',
    ],
    keyBenefit: 'Centraliza la formación y mejora el aprendizaje organizacional.',
    salesMessage: 'Impulsa el conocimiento de tu equipo con LMS, tu plataforma de aprendizaje todo-en-uno.',
    prices: [
      { plan: 'Ver planes en sitio', limits: '', features: '', support: '', price: '' },
    ],
    link: 'https://lms-client-ct7h.onrender.com',
  },
  {
    id: 12,
    name: 'Batonpass',
    segment: 'Riesgos y Acción',
    tagline: 'Gestión de Herencia Familiar',
    logo: SmartriskLogo,
    description: 'Plataforma para planificar, documentar y transferir patrimonio familiar de forma segura y transparente.',
    features: [],
    keyBenefit: 'Simplifica la planificación sucesoria con trazabilidad y cumplimiento.',
    salesMessage: 'Asegura tu legado familiar con Batonpass.',
    prices: [],
    link: ''
  },
];

const StartupGrid = ({ onOpenDemo, allowedNames }) => {
  const { language } = useLanguage();
  const [selected, setSelected] = useState(null);

  return (
    <section id="startups" className="w-full bg-black py-20 px-4 relative overflow-hidden scroll-mt-24 md:scroll-mt-28">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div 
          className="text-center mb-16"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300 mb-6">
            {t('startups.title', language)}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('startups.subtitle', language)}
          </p>
        </div>

        
        
        {/* Segmentos organizados */}
        {(() => {
          // Agrupar módulos por segmento
          const segmentos = {};
          const allowedSet = new Set(
            Array.isArray(allowedNames) && allowedNames.length > 0
              ? allowedNames
              : ['Privax', 'Automatix', 'Automatix - Ai Peer', 'Smartrisk']
          );
          módulos
            .filter((s) => allowedSet.has(s.name))
            .forEach((startup) => {
            if (!segmentos[startup.segment]) {
              segmentos[startup.segment] = [];
            }
            segmentos[startup.segment].push(startup);
          });

          return Object.entries(segmentos).map(([segmento, startups], segmentIndex) => (
            <div key={segmento} className="mb-16">
              {/* Título del segmento */}
              <div 
                className="text-center mb-12"
                data-aos="fade-up"
                data-aos-delay={segmentIndex * 200}
              >
                <h3 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
                  {t(`segments.${segmento === 'Cumplimiento de Ley' ? 'compliance' : segmento === 'Riesgos y Acción' ? 'risks' : 'data'}`, language)}
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full"></div>
              </div>
              
              {/* Grid de módulos del segmento */}
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center"
                data-aos="fade-up"
                data-aos-delay={segmentIndex * 200 + 200}
              >
                {startups.map((startup) => {
                  // Mapeo explícito de nombres a claves de traducción
                  const moduleKeyMap = {
                    'Smartrisk': 'smartrisk',
                    'Privax': 'privax',
                    // Eticpro mapeado una sola vez; ajustar si hay variantes por id
                    'Eticpro': startup.id === 8 ? 'eticprogov' : 'eticPro',
                    'InsightX': 'insightx',
                    'Extrax': 'extrax',
                    'Automatix': 'automatix',
                    'Automatix - Ai Peer': 'aipeer',
                    'Vizora': 'vizora',
                    'CyberRisk360': 'cyberrisk360',
                    'Fortax': 'cyberrisk360',
                    'Batonpass': 'batonpass',
                    'LMS': 'lms'
                  };
                  
                  const moduleKey = moduleKeyMap[startup.name] || startup.name.toLowerCase().replace(/[^a-z]/g, '');

                  const translatedStartup = {
                    ...startup,
                    name: t(`modules.${moduleKey}.name`, language) || startup.name,
                    tagline: t(`modules.${moduleKey}.tagline`, language) || startup.tagline,
                    description: t(`modules.${moduleKey}.description`, language) || startup.description,
                    keyBenefit: t(`modules.${moduleKey}.keyBenefit`, language) || startup.keyBenefit,
                    salesMessage: t(`modules.${moduleKey}.salesMessage`, language) || startup.salesMessage,
                    features: t(`modules.${moduleKey}.features`, language) || startup.features,
                    problem: t(`modules.${moduleKey}.problem`, language) || startup.problem,
                    prices: t(`modules.${moduleKey}.prices`, language) || startup.prices
                  };

                  // Campos derivados para mejor UI/UX en tarjetas y modal
                  const featuresShort = Array.isArray(translatedStartup.features)
                    ? translatedStartup.features.slice(0, 3)
                    : [];

                  const smartriskSubmodules = [
                    'Eticpro',
                    'Vizora',
                    'CyberRisk360',
                    'Índice capital social',
                    'Índice de cumplimiento minero',
                    'AML',
                    'Batonpass (análisis de sesgos y herencia de activos)'
                  ];
                  const enhancedStartup = {
                    ...translatedStartup,
                    featuresShort,
                    submodules: translatedStartup.name === 'Smartrisk' ? smartriskSubmodules : undefined
                  };
                  
                  return (
                    <StartupCard 
                      key={startup.id} 
                      startup={enhancedStartup} 
                      onClick={() => setSelected(enhancedStartup)} 
                    />
                  );
                })}
              </div>
            </div>
          ));
        })()}
        
        {selected && (
          <StartupModal startup={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </section>
  );
};

export default StartupGrid; 