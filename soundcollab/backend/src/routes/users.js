const express = require('express');
const userController = require('../controllers/userController');
const { auth, optionalAuth } = require('../middleware/auth');
const { requireSelf } = require('../middleware/requireSelf');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/search', auth, userController.searchUsers);
router.get('/suggested', auth, userController.getSuggested);
router.post('/:id/tip', auth, userController.sendTip);
router.get('/:id/stats', auth, userController.getStats);
router.get('/:id', optionalAuth, userController.getProfile);
router.put(
  '/:id',
  auth,
  requireSelf,
  upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }]),
  userController.updateProfile
);

module.exports = router;
