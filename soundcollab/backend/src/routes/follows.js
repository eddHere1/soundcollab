const express = require('express');
const followController = require('../controllers/followController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/:id', auth, followController.follow);
router.delete('/:id', auth, followController.unfollow);
router.get('/:id/followers', followController.getFollowers);
router.get('/:id/following', followController.getFollowing);

module.exports = router;
