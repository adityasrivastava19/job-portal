const express = require('express');
const { registerUser, loginUser, getProfile, updateProfile, followUser, searchUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile/:id', authMiddleware, getProfile);
router.put('/profile', authMiddleware, upload.single('profilePicture'), updateProfile);
router.put('/follow/:id', authMiddleware, followUser);
router.get('/search', authMiddleware, searchUsers);

module.exports = router;
