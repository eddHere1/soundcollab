const express = require('express');
const beatController = require('../controllers/beatController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', beatController.getMarketplace);
router.post('/:postId/purchase', auth, beatController.purchase);
router.get('/purchases', auth, beatController.getMyPurchases);
router.get('/sales', auth, beatController.getMySales);

module.exports = router;
