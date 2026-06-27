const express = require('express');
const groupController = require('../controllers/groupController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', auth, groupController.list);
router.post('/', auth, groupController.create);
router.get('/:id/messages', auth, groupController.getMessages);
router.post('/:id/messages', auth, upload.single('attachment'), groupController.sendMessage);
router.post('/:id/members', auth, groupController.addMember);

module.exports = router;
