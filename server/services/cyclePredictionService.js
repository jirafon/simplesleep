const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const toIsoDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().slice(0, 10);
};

const resolveLastPeriodStart = (profile, cycleLogs = []) => {
  if (profile?.lastPeriodStart) {
    return new Date(profile.lastPeriodStart);
  }

  const periodStarts = cycleLogs
    .filter((log) => log.data?.type === 'period_start' || log.data?.periodStart)
    .map((log) => new Date(log.logDate))
    .sort((a, b) => b - a);

  return periodStarts[0] || null;
};

const predictCycle = (profile, cycleLogs = []) => {
  const cycleLength = profile?.cycleLengthDays || 28;
  const periodLength = profile?.periodLengthDays || 5;
  const lastPeriodStart = resolveLastPeriodStart(profile, cycleLogs);

  if (!lastPeriodStart) {
    return {
      hasPrediction: false,
      message: 'Registra el inicio de tu último periodo para activar predicciones.',
      cycleLength,
      periodLength
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cursor = new Date(lastPeriodStart);
  cursor.setHours(0, 0, 0, 0);

  while (addDays(cursor, cycleLength) <= today) {
    cursor = addDays(cursor, cycleLength);
  }

  const currentCycleStart = cursor;
  const nextPeriodStart = addDays(currentCycleStart, cycleLength);
  const ovulationDate = addDays(currentCycleStart, Math.max(cycleLength - 14, 10));
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = addDays(ovulationDate, 1);
  const currentPeriodEnd = addDays(currentCycleStart, periodLength - 1);

  const isInPeriod = today >= currentCycleStart && today <= currentPeriodEnd;
  const isInFertileWindow = today >= fertileWindowStart && today <= fertileWindowEnd;

  return {
    hasPrediction: true,
    cycleLength,
    periodLength,
    lastPeriodStart: toIsoDate(lastPeriodStart),
    currentCycleStart: toIsoDate(currentCycleStart),
    currentPeriodEnd: toIsoDate(currentPeriodEnd),
    nextPeriodStart: toIsoDate(nextPeriodStart),
    ovulationDate: toIsoDate(ovulationDate),
    fertileWindowStart: toIsoDate(fertileWindowStart),
    fertileWindowEnd: toIsoDate(fertileWindowEnd),
    isInPeriod,
    isInFertileWindow,
    daysUntilNextPeriod: Math.max(0, Math.ceil((nextPeriodStart - today) / (1000 * 60 * 60 * 24))),
    daysUntilOvulation: Math.ceil((ovulationDate - today) / (1000 * 60 * 60 * 24))
  };
};

module.exports = {
  predictCycle,
  resolveLastPeriodStart
};
