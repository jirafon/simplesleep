const DEFAULT_PROGRAMS = {
  male: {
    href: '/salud-hombre',
    label: 'Programa Salud Hombre'
  },
  female: {
    href: '/salud-mujer',
    label: 'Programa Salud Mujer'
  },
  fallback: {
    href: '/personaliza-tu-orden',
    label: 'Personalizar Orden'
  }
};

function toDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function calculateAge(dateOfBirth) {
  const birthDate = toDate(dateOfBirth);
  if (!birthDate) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  if (age < 0 || age > 120) {
    return null;
  }

  return age;
}

export function getRecommendedExamsByProfile({ gender, dateOfBirth }) {
  const normalizedGender = String(gender || '').toLowerCase();
  const age = calculateAge(dateOfBirth);

  if (!normalizedGender || age === null) {
    return {
      age,
      profileComplete: false,
      title: 'Completa tu perfil para recomendaciones personalizadas',
      description: 'Necesitamos tu genero y fecha de nacimiento para sugerir exámenes acordes a tu etapa de vida.',
      cta: {
        href: '/profile',
        label: 'Completar perfil'
      },
      recommendations: []
    };
  }

  if (normalizedGender === 'male') {
    if (age < 40) {
      return {
        age,
        profileComplete: true,
        title: 'Exámenes recomendados para hombre menor de 40',
        description: 'Foco en prevención metabólica y cardiovascular temprana.',
        cta: DEFAULT_PROGRAMS.male,
        recommendations: [
          'Hemograma y perfil bioquímico',
          'Perfil lipídico y glicemia',
          'Función hepática y renal',
          'TSH (evaluación tiroidea)'
        ]
      };
    }

    if (age < 50) {
      return {
        age,
        profileComplete: true,
        title: 'Exámenes recomendados para hombre entre 40 y 49',
        description: 'Se agrega tamizaje prostático y chequeo cardiometabólico ampliado.',
        cta: {
          href: '/orden-preventiva-hombre',
          label: 'Orden Preventiva Hombre'
        },
        recommendations: [
          'Perfil lipídico, glicemia y HbA1c',
          'PSA (antígeno prostático)',
          'Electrocardiograma basal',
          'Función renal y hepática'
        ]
      };
    }

    return {
      age,
      profileComplete: true,
      title: 'Exámenes recomendados para hombre de 50 o más',
      description: 'Prevención cardiovascular y oncológica de mayor prioridad.',
      cta: {
        href: '/orden-preventiva-hombre',
        label: 'Orden Preventiva Hombre'
      },
      recommendations: [
        'PSA y evaluación prostática',
        'Perfil cardiometabólico completo',
        'Sangre oculta en deposiciones',
        'Electrocardiograma y función renal'
      ]
    };
  }

  if (normalizedGender === 'female') {
    if (age < 35) {
      return {
        age,
        profileComplete: true,
        title: 'Exámenes recomendados para mujer menor de 35',
        description: 'Prevención ginecológica y evaluación hormonal temprana.',
        cta: DEFAULT_PROGRAMS.female,
        recommendations: [
          'Hemograma y perfil bioquímico',
          'Perfil tiroideo',
          'Papanicolau según indicación médica',
          'Perfil lipídico y glicemia'
        ]
      };
    }

    if (age < 50) {
      return {
        age,
        profileComplete: true,
        title: 'Exámenes recomendados para mujer entre 35 y 49',
        description: 'Se refuerza tamizaje mamario y riesgo cardiometabólico.',
        cta: {
          href: '/orden-preventiva-mujer',
          label: 'Orden Preventiva Mujer'
        },
        recommendations: [
          'Mamografía según edad y antecedentes',
          'Papanicolau y control ginecológico',
          'Perfil lipídico, glicemia y HbA1c',
          'Perfil tiroideo'
        ]
      };
    }

    return {
      age,
      profileComplete: true,
      title: 'Exámenes recomendados para mujer de 50 o más',
      description: 'Prioridad en tamizaje oncológico, cardiovascular y salud ósea.',
      cta: {
        href: '/orden-preventiva-mujer',
        label: 'Orden Preventiva Mujer'
      },
      recommendations: [
        'Mamografía y control ginecológico',
        'Perfil cardiometabólico completo',
        'Densitometría ósea (según evaluación)',
        'Función renal y hepática'
      ]
    };
  }

  return {
    age,
    profileComplete: true,
    title: 'Exámenes recomendados según edad',
    description: 'No pudimos clasificar tu perfil por género binario, así que mostramos una pauta general preventiva.',
    cta: DEFAULT_PROGRAMS.fallback,
    recommendations: [
      'Hemograma y perfil bioquímico',
      'Perfil lipídico y glicemia',
      'Función renal y hepática',
      'Chequeo preventivo anual'
    ]
  };
}
