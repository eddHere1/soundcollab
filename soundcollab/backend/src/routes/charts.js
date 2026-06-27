const express = require('express');
const chartsController = require('../controllers/chartsController');

const router = express.Router();

router.get('/', chartsController.getCharts);

module.exports = router;
