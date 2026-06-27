const express = require('express');
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/conversations', auth, messageController.getConversations);
router.get('/inbox', auth, messageController.getInbox);
router.post('/', auth, upload.single('attachment'), messageController.sendMessage);
router.post('/dm', auth, upload.single('attachment'), messageController.sendDM);
router.get('/collab-threads', auth, messageController.getCollabThreads);
router.get('/collab/:threadId', auth, messageController.getCollabThreadMessages);
router.post('/collab/:threadId', auth, messageController.sendCollabMessage);
router.get('/dm/:userId', auth, messageController.getConversation);
router.get('/:conversationId', auth, messageController.getConversationById);

module.exports = router;
