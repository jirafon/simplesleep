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
  getInsights
} = require('../controllers/sleepController');

const router = express.Router();

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
router.get('/experiments', listExperiments);
router.post('/experiments/start', startExperiment);
router.post('/experiments/:id/log', logExperimentDay);
router.post('/experiments/:id/complete', completeExperiment);

module.exports = router;
