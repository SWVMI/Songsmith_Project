const mongoose = require('mongoose');

const aiMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'model'], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const aiConversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Conversation' },
  messages: { type: [aiMessageSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('AiConversation', aiConversationSchema);
