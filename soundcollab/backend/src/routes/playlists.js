const express = require('express');
const playlistController = require('../controllers/playlistController');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, playlistController.list);
router.post('/', auth, playlistController.create);
router.get('/:id', optionalAuth, playlistController.getOne);
router.post('/:id/items', auth, playlistController.addItem);
router.delete('/:id/items/:postId', auth, playlistController.removeItem);

module.exports = router;
