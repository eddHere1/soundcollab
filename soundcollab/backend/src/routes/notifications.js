const express = require('express');
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, notificationController.list);
router.get('/unread-count', auth, notificationController.unreadCount);
router.patch('/read-all', auth, notificationController.markAllRead);
router.patch('/:id/read', auth, notificationController.markRead);

module.exports = router;
