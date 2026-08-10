const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  // Ordered by proficiency: index 0 = strongest skill.
  categories: { type: [String], default: [] },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
