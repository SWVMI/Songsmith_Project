const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Denormalized for fast "incoming applications for my posts" queries.
  postCreator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{
    question: { type: String, required: true },
    answer: { type: String, default: '' },
  }],
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
}, { timestamps: true });

// A user may only apply once per post.
applicationSchema.index({ post: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
