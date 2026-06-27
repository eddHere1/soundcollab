const express = require('express');
const friendController = require('../controllers/friendController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/request', auth, friendController.sendRequest);
router.post('/accept', auth, friendController.acceptRequest);
router.post('/reject', auth, friendController.rejectRequest);
router.get('/list', auth, friendController.listFriends);
router.get('/requests', auth, friendController.listIncoming);
router.delete('/:id', auth, friendController.removeFriend);

module.exports = router;
