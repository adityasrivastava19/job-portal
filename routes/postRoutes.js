const express = require('express');
const { createPost, getPosts, likePost, addComment } = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createPost);
router.get('/', getPosts);
router.put('/like/:id', authMiddleware, likePost);
router.post('/comment/:id', authMiddleware, addComment);

module.exports = router;
