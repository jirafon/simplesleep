import React, { useState } from 'react';
import vizoraLogo from '../assets/vizorablack.png';
import SpinoffCard from './SpinoffCard';
import SpinoffModal from './SpinoffModal';

const spinoffs = [
  {
    id: 1,
    name: 'Smartrisk',
    tagline: 'Gestión Integral de Riesgos y Matrices Organizacionales',
    logo: '',
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
    id: 2,
    name: 'Privax',
    tagline: 'La organización no puede demostrar cumplimiento continuo de la Ley 21.719: consentimientos no trazables, tratamientos sin inventario, y respuestas ARCO sin SLA ni evidencia',
    logo: '',
    description: 'Adaptarse a la nueva Ley de Datos Personales en Chile requiere herramientas para cumplir con transparencia, trazabilidad y consentimiento.',
    features: [
      'Registro de consentimientos, políticas y tratamientos',
      'Auditoría de flujos y bases de datos',
      'Gestión de solicitudes ARCO',
      'Flujos de aprobación y validación',
      'Reportabilidad legal',
      'Librería de consentimientos y políticas',

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
      id: 4,
      name: 'InsightX',
      tagline: 'Reportabilidad automatizada con clasificación de metadata',
      logo: '',
      description: 'Las organizaciones enfrentan preguntas complejas y repetitivas que requieren análisis, evidencia y respuestas estructuradas. InsightX automatiza este proceso con un clasificador de metadata.',
      features: [
        'Generador automático de reportes ejecutivos',
        'Clasificador inteligente de metadata por tipo de información',
        'Respuestas justificadas con trazabilidad documental',
        'Conexión a bases documentales internas y externas',
        'Soporte para preguntas complejas, regulatorias o analíticas',
      ],
      keyBenefit: 'Responde preguntas críticas con velocidad y  precisión sin poner en riesgo tus datos sensibles',
      salesMessage: 'Automatiza tu capacidad de análisis. InsightX convierte conocimiento en acción documentada.',
      prices: [
        {
          plan: 'Básico',
          limits: '3 reportes automáticos por mes',
          features: 'Motor base con templates y clasificación básica',
          support: 'Email',
          price: 'USD$ 220',
        },
        {
          plan: 'Pro',
          limits: '10 reportes + preguntas personalizadas',
          features: 'Motor completo + dashboard + soporte a fuentes internas',
          support: 'Chat onboarding',
          price: 'USD$ 790',
        },
        {
          plan: 'Enterprise',
          limits: 'Ilimitado',
          features: 'Clasificación avanzada + agentes IA + integración documental',
          support: 'Dedicado',
          price: 'USD$ 1.900+',
        },
      ],
    },
  
  {
    id: 5,
    name: 'Automatix',
    tagline: 'Automatización de Workflows y Mapeo Organizacional',
    logo: '',
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
    id: 6,
  name: 'Vizora',
    tagline: 'Monitoreo de Reputación, Riesgo Normativo y Legal',
  logo: typeof vizoraLogo === 'string' ? vizoraLogo : (vizoraLogo?.default || ''),
    description: 'La organización se entera tarde de riesgos reputacionales/noticias negativas y de cambios regulatorios relevantes; no hay correlación entre eventos externos y acciones internas.',
    features: [
      'Monitoreo de medios y reputación (Vizora)',
      'Monitoreo legal/regulatorio diario (LexMonitor)',
      'Seguimiento de RUTs de empresas/personas en bases públicas',
      'Clasificación de alertas y reportes por IA',
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
  {
    id: 7,
    name: 'CyberRisk360',
    tagline: 'Levantamiento y Mitigación de Riesgos de Ciberseguridad',
    logo: '',
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
    id: 8,
    name: 'Eticpro',
    tagline: 'Gestión Ética y Cumplimiento de Ley 21.595',
    logo: '',
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
];

const SpinoffGrid = ({ onOpenDemo }) => {
  const [selected, setSelected] = useState(null);

  return (
    <section id="spinoffs" className="w-full bg-black py-20 px-4 relative overflow-hidden">
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
            Nuestros Spinoffs
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Descubre nuestra familia de soluciones especializadas, todas construidas sobre la arquitectura Unbiax
          </p>
        </div>
        
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          {spinoffs.map((spinoff) => (
            <SpinoffCard
              key={spinoff.id}
              spinoff={{
                ...spinoff,
                logo: spinoff.name === 'Vizora' ? (typeof vizoraLogo === 'string' ? vizoraLogo : (vizoraLogo?.default || '')) : spinoff.logo
              }}
              onClick={() => setSelected(spinoff)}
            />
          ))}
        </div>
        
        {selected && (
          <SpinoffModal spinoff={selected} onClose={() => setSelected(null)} onOpenDemo={onOpenDemo} />
        )}
      </div>
    </section>
  );
};

export default SpinoffGrid; 