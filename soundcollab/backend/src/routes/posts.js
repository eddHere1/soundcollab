const express = require('express');
const postController = require('../controllers/postController');
const { auth, optionalAuth } = require('../middleware/auth');
const { postUpload } = require('../middleware/postUpload');

const router = express.Router();

router.get('/feed', optionalAuth, postController.getFeed);
router.get('/saved', auth, postController.getSaved);
router.get('/liked', auth, postController.getLiked);
router.get('/recent', auth, postController.getRecent);
router.post('/', auth, postUpload, postController.createPost);
router.post('/:id/play', auth, postController.recordPlay);
router.get('/:id', optionalAuth, postController.getPost);
router.put('/:id', auth, postUpload, postController.updatePost);
router.delete('/:id', auth, postController.deletePost);
router.post('/:id/like', auth, postController.toggleLike);
router.post('/:id/save', auth, postController.toggleSave);
router.get('/:id/comments', postController.getComments);
router.post('/:id/comments', auth, postController.addComment);

module.exports = router;
