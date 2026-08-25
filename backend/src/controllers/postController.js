const Post = require('../models/Post');
const Application = require('../models/Application');
const { isValidCategoryString } = require('../constants/categories');

const populateCreator = (query) => query.populate('creator', 'username categories');

const getPosts = async (req, res) => {
  try {
    const { category, q } = req.query;
    const filter = { status: 'Open' };

    if (category && category.trim()) {
      filter.requiredCategory = category.trim();
    }

    if (q && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const posts = await populateCreator(
      Post.find(filter).sort({ createdAt: -1 })
    );

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to load posts.',
      error: err.message,
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await populateCreator(Post.findById(req.params.id));
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load post.', error: err.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, description, requiredCategory, additionalRequirements, applicationQuestions } = req.body;

    if (!title || !title.trim() || !description || !description.trim()) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    if (!isValidCategoryString(requiredCategory)) {
      return res.status(400).json({ message: 'Please specify a valid required category.' });
    }

    let questions = [];
    if (applicationQuestions !== undefined) {
      if (!Array.isArray(applicationQuestions)) {
        return res.status(400).json({ message: 'Application questions must be a list.' });
      }
      questions = applicationQuestions
        .map((q) => (typeof q === 'string' ? q.trim() : ''))
        .filter((q) => q.length > 0);
    }

    const newPost = new Post({
      creator: req.user.id,
      title: title.trim(),
      description: description.trim(),
      requiredCategory: requiredCategory.trim(),
      additionalRequirements: additionalRequirements ? additionalRequirements.trim() : '',
      applicationQuestions: questions,
    });

    await newPost.save();
    const populated = await populateCreator(Post.findById(newPost._id));
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create post.', error: err.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    if (post.creator.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own posts.' });
    }

    const { title, description, requiredCategory, additionalRequirements, applicationQuestions, status } = req.body;

    if (title !== undefined) post.title = title.trim();
    if (description !== undefined) post.description = description.trim();
    if (requiredCategory !== undefined) {
      if (!isValidCategoryString(requiredCategory)) {
        return res.status(400).json({ message: 'Please specify a valid required category.' });
      }
      post.requiredCategory = requiredCategory.trim();
    }
    if (additionalRequirements !== undefined) post.additionalRequirements = additionalRequirements.trim();
    if (applicationQuestions !== undefined) {
      if (!Array.isArray(applicationQuestions)) {
        return res.status(400).json({ message: 'Application questions must be a list.' });
      }
      post.applicationQuestions = applicationQuestions
        .map((q) => (typeof q === 'string' ? q.trim() : ''))
        .filter((q) => q.length > 0);
    }
    if (status !== undefined && ['Open', 'Closed'].includes(status)) {
      post.status = status;
    }

    await post.save();
    const populated = await populateCreator(Post.findById(post._id));
    res.status(200).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update post.', error: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    if (post.creator.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own posts.' });
    }

    await Application.deleteMany({ post: post._id });
    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post.', error: err.message });
  }
};


const closePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    if (post.creator.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only the post creator can close this post.' });
    }
    if (post.status !== 'Open') {
      return res.status(400).json({ message: 'This post is already closed.' });
    }

    post.status = 'Closed';
    await post.save();

    await Application.updateMany(
      { post: post._id, status: 'Pending' },
      { $set: { status: 'Rejected' } }
    );

    const populated = await populateCreator(Post.findById(post._id));
    res.status(200).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to close post.', error: err.message });
  }
};

module.exports = { getPosts, getPostById, createPost, updatePost, deletePost, closePost };