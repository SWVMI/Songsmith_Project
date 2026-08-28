const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requiredCategory: { type: String, required: true },
  additionalRequirements: { type: String, default: '' },
  applicationQuestions: { type: [String], default: [] },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
