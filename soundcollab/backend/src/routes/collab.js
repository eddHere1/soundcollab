const express = require('express');
const collabController = require('../controllers/collabController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/:postId', auth, upload.single('attachment'), collabController.createRequest);
router.get('/post/:postId', auth, collabController.getRequestsForPost);
router.get('/mine', auth, collabController.getMyRequests);
router.get('/incoming', auth, collabController.getIncomingRequests);
router.patch('/:id', auth, collabController.respondToRequest);

module.exports = router;
