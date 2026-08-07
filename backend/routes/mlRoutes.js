const express = require('express');
const router = express.Router();
const {
  predictPropertyPrice,
  validateCSV,
  getBuilderAnalytics,
  getWhatIfCurve,
  generatePDFReport
} = require('../controllers/mlController');

router.post('/', predictPropertyPrice);
router.post('/predict', predictPropertyPrice);
router.post('/validate-csv', validateCSV);
router.post('/builder-analytics', getBuilderAnalytics);
router.post('/what-if-curve', getWhatIfCurve);
router.post('/generate-pdf-report', generatePDFReport);

module.exports = router;
