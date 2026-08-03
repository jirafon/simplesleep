const WELLNESS_SPORTS = {
  run: {
    label: 'Correr / running',
    group: 'resistencia',
    focus: ['volumen gradual', 'economía de carrera', 'prevención de lesiones']
  },
  walk: {
    label: 'Caminar',
    group: 'resistencia',
    focus: ['pasos diarios', 'ritmo constante', 'postura']
  },
  cycle: {
    label: 'Ciclismo',
    group: 'resistencia',
    focus: ['cadencia', 'fuerza de pierna', 'hidratación en ruta']
  },
  hike: {
    label: 'Senderismo',
    group: 'outdoor',
    focus: ['resistencia aeróbica', 'tobillos y rodillas', 'nutrición en trail']
  },
  swim: {
    label: 'Natación',
    group: 'acuatico',
    focus: ['técnica de brazada', 'respiración bilateral', 'movilidad de hombro']
  },
  gps_run: {
    label: 'GPS running',
    group: 'resistencia',
    focus: ['ritmos por zona', 'terreno variado', 'recuperación entre tiradas']
  },
  indoor_run: {
    label: 'Cinta / indoor',
    group: 'resistencia',
    focus: ['inclinación controlada', 'zona aeróbica', 'aburrimiento y constancia']
  },
  yoga: {
    label: 'Yoga',
    group: 'mind-body',
    focus: ['movilidad', 'respiración', 'recuperación activa']
  },
  calisthenics: {
    label: 'Calistenia',
    group: 'fuerza',
    focus: ['progresiones', 'control del core', 'descanso entre series']
  },
  pilates: {
    label: 'Pilates',
    group: 'mind-body',
    focus: ['control motor', 'cadera y columna', 'respiración']
  },
  surf: {
    label: 'Surf',
    group: 'acuatico',
    focus: ['remada', 'equilibrio', 'lectura de olas', 'recuperación de hombro']
  },
  windsurf: {
    label: 'Windsurf',
    group: 'acuatico',
    focus: ['core y piernas', 'vela y viento', 'resistencia en agua']
  },
  kitesurf: {
    label: 'Kitesurf',
    group: 'acuatico',
    focus: ['potencia de pierna', 'coordinación', 'seguridad y viento']
  },
  wingfoil: {
    label: 'Wingfoil',
    group: 'acuatico',
    focus: ['equilibrio', 'brazos y core', 'progresión en foil']
  },
  vida_sana: {
    label: 'Bienestar general',
    group: 'general',
    focus: ['movimiento diario', 'hábitos sostenibles', 'rutinas de inicio']
  }
};

const COMPLEMENTARY_BY_MODE = {
  healthy_life: [
    'Caminata activa 20–30 min',
    'Movilidad articular 10 min',
    'Estiramientos suaves',
    'Natación o aquagym suave',
    'Yoga restaurativo'
  ],
  athlete: [
    'Movilidad pre-sesión',
    'Trabajo de core',
    'Estiramientos dinámicos',
    'Sueño y recuperación activa'
  ]
};

const DEFAULT_WARMUP = {
  athlete: [
    '3–5 min movilidad articular (tobillos, cadera, hombros)',
    '5 min activación: sentadillas sin peso, balanceo de piernas, rotaciones',
    '2–3 progresiones específicas del deporte a baja intensidad'
  ],
  healthy_life: [
    '2 min caminata en el lugar o movilidad suave',
    '3 min estiramientos dinámicos (cuello, hombros, cadera)',
    '5 min actividad ligera elegida (caminata, movilidad o yoga suave)'
  ]
};

const getSportDefinition = (sportId) => WELLNESS_SPORTS[sportId] || WELLNESS_SPORTS.vida_sana;

const buildSportFallbackFocus = (profile) => {
  const mode = profile?.habitsGoalMode || 'healthy_life';
  const sport = getSportDefinition(profile?.primarySport || (mode === 'athlete' ? 'run' : 'vida_sana'));
  const level = profile?.sportLevel || 'beginner';

  if (mode === 'healthy_life') {
    return {
      title: 'Plan vida sana',
      summary: `Enfoque en ${sport.label.toLowerCase()} con rutinas accesibles para ${level === 'beginner' ? 'iniciar' : 'mantener'} hábitos.`,
      recommendations: [
        'Combina 150 min semanales de actividad moderada (caminata, bici suave, natación).',
        'Alterna días activos con movilidad o estiramientos para evitar abandono.',
        'Usa tu pulsera para vigilar sueño y estrés: son la base del progreso.'
      ],
      complementaryActivities: COMPLEMENTARY_BY_MODE.healthy_life,
      warmupRoutine: {
        title: 'Rutina de inicio (10 min)',
        steps: DEFAULT_WARMUP.healthy_life
      }
    };
  }

  const sportTips = {
    surf: ['Prioriza remada y core 3×/sem', 'Trabaja hombro y rotadores en días off', 'Hidrátate extra en sesiones largas'],
    kitesurf: ['Refuerza piernas y core', 'Calienta cadera y tobillos antes de entrar', 'Registra fatiga: el viento exige mucho'],
    run: ['Progresa volumen máx 10% semanal', 'Incluye 1 día de fuerza de pierna', 'Cuida zapatillas y superficie'],
    swim: ['Técnica antes que distancia', 'Movilidad de hombro diaria', 'Combina pull y pierna en sesiones cortas'],
    calisthenics: ['Progresiones antes que volumen', 'Descansa 48 h entre grupos musculares', 'Prioriza forma en cada repetición']
  };

  return {
    title: `Enfoque deportista: ${sport.label}`,
    summary: `Nivel ${level}. Prioridades: ${sport.focus.slice(0, 3).join(', ')}.`,
    recommendations: sportTips[profile?.primarySport] || [
      `Estructura 3–4 sesiones/semana de ${sport.label.toLowerCase()}.`,
      'Incluye 1 día de movilidad o deporte cruzado.',
      'Monitorea HRV y sueño para ajustar intensidad.'
    ],
    complementaryActivities: COMPLEMENTARY_BY_MODE.athlete,
    warmupRoutine: {
      title: `Calentamiento ${sport.label}`,
      steps: DEFAULT_WARMUP.athlete
    }
  };
};

module.exports = {
  WELLNESS_SPORTS,
  getSportDefinition,
  buildSportFallbackFocus,
  COMPLEMENTARY_BY_MODE
};
