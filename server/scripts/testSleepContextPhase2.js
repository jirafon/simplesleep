/**
 * Phase 2–3 smoke tests for Sleep Context Coach services (no DB required).
 */
const assert = require('assert');
const { buildMorningBrief } = require('../services/morningBriefService');
const { buildSleepTimeline, buildNightPhoneInterruptionInsight } = require('../services/sleepTimelineService');
const { buildWeeklyStory } = require('../services/weeklyStoryService');
const { buildCoachContext } = require('../services/sleepCoachContextBuilder');
const { deterministicReply } = require('../services/sleepCoachService');
const { buildTonightMove } = require('../services/tonightRecommendationService');

const brief = buildMorningBrief({
  locale: 'en',
  lastNight: { totalMinutes: 412, vsBaselineMinutes: -38, bedtimeDeviationMinutes: 41 },
  baseline: { avgSleepMinutes: 450 },
  phone: { lastInteractionAt: '2026-08-15T04:36:00.000Z', screenToSleepMinutes: 26 },
  recommendation: { title: 'Put your phone down by 10:45 PM' },
  sleepScore: 74,
  factors: [{ id: 'late_screen', direction: 'negative', label: 'Late screen', detail: 'Higher than usual.' }]
});
assert.ok(brief.paragraphs.length >= 2 && brief.paragraphs.length <= 3, 'brief paragraphs');
assert.ok(brief.text.includes('Good morning'), 'brief greeting');

const timeline = buildSleepTimeline({
  night: {
    bedtimeClock: '23:30',
    totalMinutes: 420,
    deep: 80,
    light: 200,
    rem: 100,
    awakeMinutes: 20
  },
  phone: {
    lastInteractionAt: new Date('2026-08-15T03:00:00Z').toISOString(),
    screenMinutesLast120m: 55,
    screenToSleepMinutes: 25,
    nightUsageEvents: 2,
    nightUsageMinutes: 12
  },
  locale: 'en'
});
assert.ok(timeline.events.some((e) => e.id === 'sleep_start'), 'timeline sleep start');
assert.ok(timeline.bands.some((b) => b.stage === 'deep'), 'timeline deep band');

const contexts = Array.from({ length: 10 }).map((_, i) => ({
  phone: { nightUsageEvents: i % 2, nightUsageMinutes: i % 2 ? 10 : 0 },
  sleep: { totalMinutes: i % 2 ? 380 : 430 }
}));
// May be null if thresholds not met — that's OK
buildNightPhoneInterruptionInsight(contexts, 'en');

const story = buildWeeklyStory({
  locale: 'en',
  summary: {
    avgSleepMinutes: 428,
    avgScore: 81,
    sleepDeltaMinutes: 18,
    narrative: 'You slept a bit longer this week.',
    associations: ['Earlier phone-down was associated with stronger nights.'],
    nextWeekRecommendation: 'Keep phone-down near 10:45 PM.'
  },
  contexts: []
});
assert.strictEqual(story.title, 'Your Week in Sleep');
assert.ok(story.whatChanged);

const move = buildTonightMove({
  locale: 'en',
  targetBedtime: '22:30',
  factors: [{ id: 'late_screen', direction: 'negative', confidence: 0.8, label: 'Late screen' }],
  baseline: { avgScreenToSleepMinutes: 30 }
});
assert.ok(move.title.toLowerCase().includes('phone'), 'tonight move phone');

const ctx = buildCoachContext({
  baselines: { primary: { avgSleepMinutes: 450, nightsUsed: 14 } },
  lastNight: { totalMinutes: 400 },
  nights: [{ totalMinutes: 400 }, { totalMinutes: 420 }],
  factors: [{ id: 'late_screen', label: 'Late screen', direction: 'negative', value: '74 min', confidence: 0.7 }],
  recommendation: move,
  experiments: [],
  insights: []
});
const reply = deterministicReply('What should I do tonight?', ctx, 'en');
assert.ok(reply.toLowerCase().includes('phone') || reply.toLowerCase().includes('tonight'), 'coach reply');

console.log('✅ testSleepContextPhase2.js passed', {
  briefParas: brief.paragraphs.length,
  timelineEvents: timeline.events.length,
  story: story.title,
  tonight: move.title,
  coachSnippet: reply.slice(0, 60)
});
