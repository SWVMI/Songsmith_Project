const Application = require('../models/Application');
const Post = require('../models/Post');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

const submitApplication = async (req, res) => {
  try {
    const { postId, answers } = req.body;

    if (!postId) {
      return res.status(400).json({ message: 'A post must be specified.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.status !== 'Open') {
      return res.status(400).json({ message: 'This collaboration opportunity is no longer accepting applications.' });
    }

    if (post.creator.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'You cannot apply to your own post.' });
    }

    const applicant = await User.findById(req.user.id);
    if (!applicant.categories.includes(post.requiredCategory)) {
      return res.status(403).json({
        message: `You do not have the required category ("${post.requiredCategory}") on your profile, so you cannot apply to this post.`,
      });
    }

    const existing = await Application.findOne({ post: postId, applicant: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this post.' });
    }

    const providedAnswers = Array.isArray(answers) ? answers : [];
    const finalAnswers = post.applicationQuestions.length > 0
      ? post.applicationQuestions.map((question, i) => ({
          question,
          answer: (providedAnswers[i] && typeof providedAnswers[i].answer === 'string')
            ? providedAnswers[i].answer.trim()
            : (typeof providedAnswers[i] === 'string' ? providedAnswers[i].trim() : ''),
        }))
      : (providedAnswers.length > 0
          ? providedAnswers
              .filter((a) => a && (a.answer || typeof a === 'string'))
              .map((a) => ({ question: a.question || 'Message', answer: typeof a === 'string' ? a : a.answer }))
          : []);

    const newApplication = new Application({
      post: post._id,
      applicant: req.user.id,
      postCreator: post.creator,
      answers: finalAnswers,
      status: 'Pending',
    });

    await newApplication.save();
    res.status(201).json(newApplication);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already applied to this post.' });
    }
    res.status(500).json({ message: 'Failed to submit application.', error: err.message });
  }
};

const getApplications = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type === 'incoming'
      ? { postCreator: req.user.id }
      : { applicant: req.user.id };

    const apps = await Application.find(filter)
      .sort({ createdAt: -1 })
      .populate('post', 'title requiredCategory status')
      .populate('applicant', 'username categories')
      .populate('postCreator', 'username');

    res.status(200).json(apps);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load applications.', error: err.message });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate('post')
      .populate('applicant', 'username categories email')
      .populate('postCreator', 'username');

    if (!app) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const userId = req.user.id.toString();
    if (app.applicant._id.toString() !== userId && app.postCreator._id.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to view this application.' });
    }

    res.status(200).json(app);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load application.', error: err.message });
  }
};

const reviewApplication = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Accepted or Rejected.' });
    }

    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    if (app.postCreator.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only the post creator can review this application.' });
    }

    if (app.status !== 'Pending') {
      return res.status(400).json({ message: `This application has already been ${app.status.toLowerCase()}.` });
    }

    app.status = status;
    await app.save();

    let conversation = null;
    if (status === 'Accepted') {
      conversation = await Conversation.create({
        post: app.post,
        application: app._id,
        applicant: app.applicant,
        creator: app.postCreator,
        status: 'Accepted',
      });
    }

    const populated = await Application.findById(app._id)
      .populate('post', 'title requiredCategory status')
      .populate('applicant', 'username categories')
      .populate('postCreator', 'username');

    res.status(200).json({ application: populated, conversation });
  } catch (err) {
    res.status(500).json({ message: 'Failed to review application.', error: err.message });
  }
};

module.exports = { submitApplication, getApplications, getApplicationById, reviewApplication };
