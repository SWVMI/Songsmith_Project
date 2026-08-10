const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  // The single category/skill an applicant must have to be eligible.
  requiredCategory: { type: String, required: true },
  // Optional free-text extras (location/remote, additional requirements).
  additionalRequirements: { type: String, default: '' },
  // Questions the creator wants applicants to answer (Google-Forms style).
  applicationQuestions: { type: [String], default: [] },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
