/**
 * Sleep Experiments catalog — Phase 2
 * Associations only; never medical causation.
 */

const EXPERIMENT_CATALOG = [
  {
    id: 'no_caffeine_after_2pm',
    title: 'No caffeine after 2 PM',
    goal: 'See if later caffeine tracks with later sleep or more interruptions for you.',
    durationDays: 7,
    dailyAction: 'Skip caffeine after 2:00 PM.',
    reminderHint: 'Stop caffeine',
    checkField: 'caffeine'
  },
  {
    id: 'no_alcohol_7d',
    title: 'No alcohol for seven days',
    goal: 'Notice whether alcohol-free nights feel more continuous for you.',
    durationDays: 7,
    dailyAction: 'Skip alcohol today.',
    reminderHint: 'Evening check-in',
    checkField: 'alcohol'
  },
  {
    id: 'dinner_three_hours_before_bed',
    title: 'Dinner three hours before bed',
    goal: 'Explore earlier dinners vs your usual bedtime comfort.',
    durationDays: 10,
    dailyAction: 'Finish dinner at least 3 hours before bed.',
    reminderHint: 'Begin wind-down routine',
    checkField: 'meal'
  },
  {
    id: 'consistent_bedtime',
    title: 'Consistent bedtime',
    goal: 'Keep bedtime within ~30 minutes of your target for two weeks.',
    durationDays: 14,
    dailyAction: 'Aim for your target bedtime.',
    reminderHint: 'Go to bed',
    checkField: 'bedtime'
  },
  {
    id: 'cooler_bedroom',
    title: 'Cooler bedroom',
    goal: 'Try a cooler sleep environment and note morning energy.',
    durationDays: 7,
    dailyAction: 'Sleep in a cooler bedroom if comfortable.',
    reminderHint: 'Evening check-in',
    checkField: 'bedroomTemp'
  },
  {
    id: 'ten_min_wind_down',
    title: 'Ten-minute wind-down',
    goal: 'A short wind-down before bed — breathing, stretch, or quiet time.',
    durationDays: 7,
    dailyAction: 'Do a 10-minute wind-down before lights out.',
    reminderHint: 'Begin wind-down routine',
    checkField: 'windDown'
  },
  {
    id: 'no_screens_before_bed',
    title: 'No screens before bed',
    goal: 'Screen-free wind-down and how it tracks with your sleep start.',
    durationDays: 7,
    dailyAction: 'Avoid screens in the hour before bed.',
    reminderHint: 'Screen-free time',
    checkField: 'screens'
  },
  {
    id: 'morning_exercise',
    title: 'Morning exercise',
    goal: 'Light morning movement and next-night sleep patterns.',
    durationDays: 10,
    dailyAction: 'Move your body in the morning (walk or gentle exercise).',
    reminderHint: 'Short walk',
    checkField: 'exercise'
  },
  {
    id: 'evening_walk',
    title: 'Evening walk',
    goal: 'A short evening walk and how you feel the next morning.',
    durationDays: 7,
    dailyAction: 'Take a short evening walk.',
    reminderHint: 'Short walk',
    checkField: 'exercise'
  },
  {
    id: 'no_phone_30_before_bed',
    title: 'No phone 30 min before bed',
    goal: 'See whether putting the phone down earlier is associated with longer or calmer nights for you.',
    durationDays: 7,
    dailyAction: 'Put your phone down at least 30 minutes before sleep.',
    reminderHint: 'Screen-free time',
    checkField: 'screens'
  },
  {
    id: 'no_phone_60_before_bed',
    title: 'No phone 60 min before bed',
    goal: 'A longer phone-free wind-down to compare against your personal baseline.',
    durationDays: 7,
    dailyAction: 'Put your phone down at least 60 minutes before sleep.',
    reminderHint: 'Screen-free time',
    checkField: 'screens'
  },
  {
    id: 'morning_sunlight',
    title: 'Morning sunlight',
    goal: 'Morning light exposure and how your next nights feel.',
    durationDays: 7,
    dailyAction: 'Get a few minutes of morning daylight if you can.',
    reminderHint: 'Short walk',
    checkField: 'exercise'
  },
  {
    id: 'bedroom_darker',
    title: 'Bedroom darker',
    goal: 'A darker sleep environment and your morning energy.',
    durationDays: 7,
    dailyAction: 'Make the bedroom as dark as comfortable tonight.',
    reminderHint: 'Evening check-in',
    checkField: 'bedroomTemp'
  },
  {
    id: 'reduce_liquids_before_sleep',
    title: 'Reduce liquids before sleeping',
    goal: 'Fewer late liquids and bathroom wake-ups — for your own pattern only.',
    durationDays: 7,
    dailyAction: 'Ease off liquids in the 2 hours before bed.',
    reminderHint: 'Go to bed',
    checkField: 'liquids'
  }
];

const getCatalogItem = (id) => EXPERIMENT_CATALOG.find((e) => e.id === id) || null;

module.exports = { EXPERIMENT_CATALOG, getCatalogItem };
