const express = require('express');
const auth = require('../middleware/auth');
const { localeMiddleware } = require('../middleware/locale');
const {
  getOnboarding,
  updateOnboarding,
  getToday,
  getHistory,
  postMorningCheckIn,
  postEveningCheckIn,
  getCheckIns,
  getWeeklyReport,
  listExperiments,
  startExperiment,
  logExperimentDay,
  completeExperiment,
  getInsights,
  postPhoneContext,
  getContextToday,
  getContextHistory,
  getBaseline,
  getFactors,
  getTonightRecommendation,
  getMorningBrief,
  getTimeline,
  postCoachChat,
  getRecommendedExperiments,
  getStreaks,
  postTryTonight,
  postActivateBandReminder
} = require('../controllers/sleepController');

const router = express.Router();

/** Public catalog — APK can probe without JWT (auth masks 404s otherwise). */
const SLEEP_V1_ROUTES = [
  'GET /api/sleep/v1/status',
  'GET/PUT /api/sleep/v1/onboarding',
  'GET /api/sleep/v1/today',
  'GET /api/sleep/v1/history',
  'POST /api/sleep/v1/checkins/morning',
  'POST /api/sleep/v1/checkins/evening',
  'GET /api/sleep/v1/checkins',
  'GET /api/sleep/v1/report/weekly',
  'GET /api/sleep/v1/insights',
  'GET /api/sleep/v1/experiments',
  'GET /api/sleep/v1/experiments/recommended',
  'POST /api/sleep/v1/experiments/start',
  'POST /api/sleep/v1/experiments/:id/log',
  'POST /api/sleep/v1/experiments/:id/complete',
  'POST /api/sleep/v1/context/phone',
  'GET /api/sleep/v1/context/today',
  'GET /api/sleep/v1/context/history',
  'GET /api/sleep/v1/baseline',
  'GET /api/sleep/v1/factors',
  'GET /api/sleep/v1/recommendation/tonight',
  'POST /api/sleep/v1/recommendation/tonight/try',
  'POST /api/sleep/v1/reminders/band/activate',
  'GET /api/sleep/v1/brief/morning',
  'GET /api/sleep/v1/timeline',
  'GET /api/sleep/v1/timeline/:date',
  'POST /api/sleep/v1/coach/chat',
  'GET /api/sleep/v1/streaks'
];

router.get('/status', (_req, res) => {
  res.json({
    success: true,
    service: 'sleep-v1',
    product: 'SiempreSleep',
    authRequired: true,
    note: 'All routes below (except this status) require Authorization: Bearer <jwt>',
    routes: SLEEP_V1_ROUTES
  });
});

router.use(auth);
router.use(localeMiddleware);

router.get('/onboarding', getOnboarding);
router.put('/onboarding', updateOnboarding);
router.get('/today', getToday);
router.get('/history', getHistory);
router.post('/checkins/morning', postMorningCheckIn);
router.post('/checkins/evening', postEveningCheckIn);
router.get('/checkins', getCheckIns);
router.get('/report/weekly', getWeeklyReport);
router.get('/insights', getInsights);
router.get('/experiments/recommended', getRecommendedExperiments);
router.get('/experiments', listExperiments);
router.post('/experiments/start', startExperiment);
router.post('/experiments/:id/log', logExperimentDay);
router.post('/experiments/:id/complete', completeExperiment);

// Sleep Context Coach
router.post('/context/phone', postPhoneContext);
router.get('/context/today', getContextToday);
router.get('/context/history', getContextHistory);
router.get('/baseline', getBaseline);
router.get('/factors', getFactors);
router.get('/recommendation/tonight', getTonightRecommendation);
router.post('/recommendation/tonight/try', postTryTonight);
router.post('/reminders/band/activate', postActivateBandReminder);
router.get('/brief/morning', getMorningBrief);
router.get('/timeline/:date', getTimeline);
router.get('/timeline', getTimeline);
router.post('/coach/chat', postCoachChat);
router.get('/streaks', getStreaks);

module.exports = router;
module.exports.SLEEP_V1_ROUTES = SLEEP_V1_ROUTES;
