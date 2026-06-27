const express = require('express');
const opportunityController = require('../controllers/opportunityController');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, opportunityController.list);
router.post('/', auth, opportunityController.create);
router.get('/:id', optionalAuth, opportunityController.getOne);
router.patch('/:id/close', auth, opportunityController.close);

module.exports = router;
