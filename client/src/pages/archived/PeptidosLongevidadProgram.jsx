import React from 'react';
import ProgramLandingPage from '../components/doctor911/ProgramLandingPage';

function PeptidosLongevidadProgram() {
  return (
    <ProgramLandingPage
      badge="Programa"
      title="Péptidos y Longevidad"
      subtitle="Ruta de bienestar avanzado con enfoque en vitalidad, rendimiento y longevidad con acompañamiento clínico."
      heroGradient="from-amber-700 via-orange-700 to-slate-900"
      highlights={[
        'Enfoque de bienestar avanzado',
        'Orientación clínica especializada',
        'Plan de seguimiento'
      ]}
      cards={[
        {
          title: 'Evaluación inicial',
          description: 'Revisión del estado general para orientar una estrategia segura y personalizada.'
        },
        {
          title: 'Vitalidad y rendimiento',
          description: 'Objetivos enfocados en energía, recuperación y bienestar funcional.'
        },
        {
          title: 'Longevidad',
          description: 'Plan de largo plazo centrado en hábitos, monitoreo y continuidad clínica.'
        }
      ]}
      primaryCta={{ label: 'Solicitar orientación', href: '/contacto' }}
      secondaryCta={{ label: 'Crear cuenta', href: '/register' }}
      note="Programa en desarrollo. Puedes contactarnos para evaluación inicial y próximos pasos personalizados."
      leadForm={{
        title: 'Solicita orientación en péptidos y longevidad',
        description: 'Déjanos tus datos y te contactaremos para evaluar si este enfoque es adecuado para ti.',
        interest: 'revision',
        optionLabel: 'Interés principal',
        options: ['Bienestar y vitalidad', 'Rendimiento y recuperación', 'Plan de longevidad'],
        submitLabel: 'Enviar solicitud de orientación',
        successMessage: 'Solicitud enviada. Te contactaremos para evaluar tu caso y próximos pasos.'
      }}
    />
  );
}

export default PeptidosLongevidadProgram;
