import React from 'react';
import ProgramLandingPage from '../components/doctor911/ProgramLandingPage';

function PerdidaPesoProgram() {
  return (
    <ProgramLandingPage
      badge="Programa"
      title="Pérdida de Peso"
      subtitle="Ruta orientada a composición corporal, salud metabólica y seguimiento clínico para objetivos sostenibles."
      heroGradient="from-emerald-700 via-teal-700 to-slate-900"
      highlights={[
        'Evaluación metabólica inicial',
        'Enfoque en hábitos sostenibles',
        'Acompañamiento clínico'
      ]}
      cards={[
        {
          title: 'Composición corporal',
          description: 'Análisis de estado corporal y variables clave para definir una estrategia personalizada.'
        },
        {
          title: 'Perfil metabólico',
          description: 'Revisión de marcadores clínicos para orientar decisiones de salud y nutrición.'
        },
        {
          title: 'Seguimiento',
          description: 'Plan de continuidad para medir avances y ajustar objetivos de forma segura.'
        }
      ]}
      primaryCta={{ label: 'Solicitar orientación', href: '/contacto' }}
      secondaryCta={{ label: 'Crear cuenta', href: '/register' }}
      note="Estamos preparando una experiencia especializada para pérdida de peso. Mientras tanto, te orientamos por contacto."
      leadForm={{
        title: 'Solicita una evaluación inicial de pérdida de peso',
        description: 'Completa este formulario y te contactaremos con una propuesta de evaluación personalizada.',
        interest: 'revision',
        optionLabel: 'Objetivo principal',
        options: ['Bajar grasa corporal', 'Mejorar metabolismo', 'Plan integral de hábitos'],
        submitLabel: 'Enviar solicitud de evaluación',
        successMessage: 'Tu solicitud fue enviada. Te contactaremos para coordinar la evaluación inicial.'
      }}
    />
  );
}

export default PerdidaPesoProgram;
