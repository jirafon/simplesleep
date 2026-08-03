export const HABITS_GOAL_MODES = [
  {
    id: 'athlete',
    label: 'Deportista',
    description: 'Quiero mejorar en un deporte concreto con entrenamiento, recuperación y nutrición orientada al rendimiento.'
  },
  {
    id: 'healthy_life',
    label: 'Vida sana',
    description: 'Quiero moverme más, crear hábitos sostenibles y rutinas de inicio con actividades complementarias.'
  }
];

export const SPORT_LEVELS = [
  { id: 'beginner', label: 'Principiante' },
  { id: 'intermediate', label: 'Intermedio' },
  { id: 'advanced', label: 'Avanzado' }
];

export const WELLNESS_SPORTS = [
  { id: 'run', label: 'Correr / running', athlete: true },
  { id: 'walk', label: 'Caminar', athlete: true },
  { id: 'cycle', label: 'Ciclismo', athlete: true },
  { id: 'hike', label: 'Senderismo', athlete: true },
  { id: 'swim', label: 'Natación', athlete: true },
  { id: 'gps_run', label: 'GPS running', athlete: true },
  { id: 'indoor_run', label: 'Cinta / indoor', athlete: true },
  { id: 'yoga', label: 'Yoga', athlete: true },
  { id: 'calisthenics', label: 'Calistenia', athlete: true },
  { id: 'pilates', label: 'Pilates', athlete: true },
  { id: 'surf', label: 'Surf', athlete: true },
  { id: 'windsurf', label: 'Windsurf', athlete: true },
  { id: 'kitesurf', label: 'Kitesurf', athlete: true },
  { id: 'wingfoil', label: 'Wingfoil', athlete: true },
  { id: 'vida_sana', label: 'Bienestar general', athlete: false }
];

export const getSportsForMode = (mode) => {
  if (mode === 'athlete') {
    return WELLNESS_SPORTS.filter((sport) => sport.athlete);
  }
  return WELLNESS_SPORTS.filter((sport) => !sport.athlete || sport.id === 'walk' || sport.id === 'yoga');
};

export const getSportLabel = (sportId) => {
  return WELLNESS_SPORTS.find((sport) => sport.id === sportId)?.label || sportId;
};
