const express = require('express');
const router = express.Router();
const { predictPropertyPrice } = require('../controllers/mlController');

router.post('/', predictPropertyPrice);
router.post('/predict', predictPropertyPrice);

module.exports = router;
