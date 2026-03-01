const express = require('express');
const { createPost, getPosts, likePost, addComment, deletePost, getUserPosts, getFeed } = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.post('/', authMiddleware, upload.single('image'), createPost);
router.get('/', getPosts);
router.get('/feed', authMiddleware, getFeed);
router.get('/user/:userId', getUserPosts);
router.put('/like/:id', authMiddleware, likePost);
router.post('/comment/:id', authMiddleware, addComment);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
