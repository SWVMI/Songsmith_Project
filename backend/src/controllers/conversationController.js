const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const VALID_STATUSES = [
  'Accepted',
  'In Discussion',
  'Booked',
  'Completed',
  'Closed',
  'Cancelled',
];

const CLOSED_STATUSES = ['Completed', 'Closed', 'Cancelled'];


const isParticipant = (conversation, userId) => {
  return (
    conversation.applicant.toString() === userId.toString() ||
    conversation.creator.toString() === userId.toString()
  );
};


const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [
        { applicant: req.user.id },
        { creator: req.user.id },
      ],
    })
      .sort({ lastMessageAt: -1 })
      .populate('post', 'title requiredCategory')
      .populate('applicant', 'username')
      .populate('creator', 'username');

    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to load conversations.',
      error: err.message,
    });
  }
};


const getConversationById = async (req, res) => {
  try {

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        message: 'Conversation not found.',
      });
    }

    if (!isParticipant(conversation, req.user.id)) {
      return res.status(403).json({
        message: 'You are not part of this conversation.',
      });
    }

 
    await conversation.populate([
      {
        path: 'post',
        select: 'title requiredCategory description',
      },
      {
        path: 'applicant',
        select: 'username categories',
      },
      {
        path: 'creator',
        select: 'username categories',
      },
    ]);

    const messages = await Message.find({
      conversation: conversation._id,
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'username');

    res.status(200).json({
      conversation,
      messages,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to load conversation.',
      error: err.message,
    });
  }
};


const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: 'Message cannot be empty.',
      });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        message: 'Conversation not found.',
      });
    }

    if (!isParticipant(conversation, req.user.id)) {
      return res.status(403).json({
        message: 'You are not part of this conversation.',
      });
    }

    if (CLOSED_STATUSES.includes(conversation.status)) {
      return res.status(400).json({
        message:
          'This conversation is closed and no longer accepting messages.',
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      content: content.trim(),
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMessage = await message.populate(
      'sender',
      'username'
    );

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to send message.',
      error: err.message,
    });
  }
};


const updateConversationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status.',
      });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        message: 'Conversation not found.',
      });
    }

if (conversation.creator.toString() !== req.user.id.toString()) {
  return res.status(403).json({
    message: 'Only the post creator can change the contract status.',
  });
}

conversation.status = status;

    await conversation.save();

    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to update conversation status.',
      error: err.message,
    });
  }
};

module.exports = {
  getConversations,
  getConversationById,
  sendMessage,
  updateConversationStatus,
};