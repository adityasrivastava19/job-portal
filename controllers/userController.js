// User controller handling authentication logic
const User = require('../database/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePicture: newUser.profilePicture,
                bio: newUser.bio,
                followers: [],
                following: []
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { identifier, email, password } = req.body;
        // Support both 'email' and 'identifier' (which can be email or username)
        const loginQuery = identifier
            ? { $or: [{ email: identifier }, { username: identifier }] }
            : { email: email };

        const user = await User.findOne(loginQuery);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { _id: user._id, username: user.username, email: user.email, profilePicture: user.profilePicture, bio: user.bio } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').populate('followers', 'username profilePicture').populate('following', 'username profilePicture');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { username, bio } = req.body;

        // Check if username is taken by another user
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: req.user.id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
        }

        let updateData = {};
        if (username) updateData.username = username;
        if (bio) updateData.bio = bio;

        if (req.file) {
            updateData.profilePicture = req.file.path;
        }
        const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true })
            .select('-password')
            .populate('followers', 'username profilePicture')
            .populate('following', 'username profilePicture');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const followUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow || !currentUser) return res.status(404).json({ message: 'User not found' });

        const isFollowing = currentUser.following.some(id => id.toString() === userToFollow._id.toString());

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollow._id.toString());
            userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUser._id.toString());
        } else {
            // Follow
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
        }

        await currentUser.save();
        await userToFollow.save();

        res.json({ message: 'Action successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: 'Query is required' });

        // Escape regex special characters
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const users = await User.find({
            $or: [
                { username: { $regex: escapedQuery, $options: 'i' } },
                { email: { $regex: escapedQuery, $options: 'i' } }
            ]
        }).select('username profilePicture bio');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile, followUser, searchUsers };
