const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['Accepted', 'In Discussion', 'Booked', 'Completed', 'Closed', 'Cancelled'],
    default: 'Accepted',
  },
  lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
