const User = require('../models/User');
const Post = require('../models/Post');
const Application = require('../models/Application');

const listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load users.', error: err.message });
  }
};

const listPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('creator', 'username').sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load posts.', error: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    await Application.deleteMany({ post: post._id });
    await post.deleteOne();
    res.status(200).json({ message: 'Post removed by admin.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post.', error: err.message });
  }
};

const listApplications = async (req, res) => {
  try {
    const apps = await Application.find()
      .populate('post', 'title')
      .populate('applicant', 'username')
      .populate('postCreator', 'username')
      .sort({ createdAt: -1 });
    res.status(200).json(apps);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load applications.', error: err.message });
  }
};

module.exports = { listUsers, listPosts, deletePost, listApplications };
