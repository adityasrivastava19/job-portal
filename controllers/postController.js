// Post controller handling feed and social interactions
const Post = require('../database/models/Post');
const User = require('../database/models/User');


const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Post text is required' });
        }
        const image = req.file ? req.file.path : '';
        const newPost = new Post({ user: req.user.id, text, image });
        await newPost.save();

        const populatedPost = await Post.findById(newPost._id).populate('user', 'username profilePicture');
        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'username profilePicture')
            .populate('comments.user', 'username profilePicture')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const isLiked = post.likes.some(id => id.toString() === req.user.id);

        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== req.user.id);
        } else {
            post.likes.push(req.user.id);
        }
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({ user: req.user.id, text });
        await post.save();

        const updatedPost = await Post.findById(req.params.id)
            .populate('user', 'username profilePicture')
            .populate('comments.user', 'username profilePicture');
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.user.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId })
            .populate('user', 'username profilePicture')
            .populate('comments.user', 'username profilePicture')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFeed = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) return res.status(404).json({ message: 'User not found' });

        const following = currentUser.following;
        const posts = await Post.find({
            $or: [
                { user: { $in: following } },
                { user: req.user.id }
            ]
        })
            .populate('user', 'username profilePicture')
            .populate('comments.user', 'username profilePicture')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createPost, getPosts, likePost, addComment, deletePost, getUserPosts, getFeed };
