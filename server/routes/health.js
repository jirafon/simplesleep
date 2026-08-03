const express = require('express');
const router = express.Router();
const {
  validateHealthData,
  saveHealthData,
  getDeviceList,
  getBiometricAlerts,
  getDeviceHistory,
  getLatestRiskAnalysis,
  analyzeDeviceRisk,
  getServerStatus,
  getMongoHealthCheck,
  deleteBiometricRecord,
  deleteDeviceData,
  deleteAllData
} = require('../controllers/healthController');
const healthDataValidationRules = require('../validators/healthValidators');
const { requireFeature } = require('../middleware/featureGate');

// Wearable ingest — always available
router.post('/data', healthDataValidationRules, validateHealthData, saveHealthData);

router.get('/status', getServerStatus);
router.get('/mongodb', getMongoHealthCheck);
router.get('/devices', getDeviceList);

// Medical alerts hidden unless FF_MEDICAL_ALERTS=true
router.get('/alerts', requireFeature('MEDICAL_ALERTS'), getBiometricAlerts);

router.get('/devices/:deviceId', getDeviceHistory);

router.get('/devices/:deviceId/risk-analysis', requireFeature('RISK_ANALYSIS'), getLatestRiskAnalysis);
router.post('/devices/:deviceId/risk-analysis', requireFeature('RISK_ANALYSIS'), analyzeDeviceRisk);

router.delete('/records/:recordId', deleteBiometricRecord);
router.delete('/devices/:deviceId', deleteDeviceData);
router.delete('/data', deleteAllData);

module.exports = router;
