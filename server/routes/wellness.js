const express = require('express');
const auth = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getBiometricSummary,
  createLog,
  getHabitRecommendations,
  getImportantReminders,
  updateImportantReminders,
  getCycleData,
  getCycleRecommendations,
  getMenopauseData,
  getMenopauseRecommendations
} = require('../controllers/wellnessController');

const router = express.Router();

router.use(auth);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/biometrics/summary', getBiometricSummary);
router.post('/logs', createLog);

router.get('/habits/recommendations', getHabitRecommendations);
router.get('/reminders', getImportantReminders);
router.put('/reminders', updateImportantReminders);

router.get('/cycle', getCycleData);
router.get('/cycle/recommendations', getCycleRecommendations);

router.get('/menopause', getMenopauseData);
router.get('/menopause/recommendations', getMenopauseRecommendations);

module.exports = router;
