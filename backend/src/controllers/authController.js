const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { isValidCategoryString } = require('../constants/categories');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  categories: user.categories,
  role: user.role,
  createdAt: user.createdAt,
});

const validateCategories = (categories) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return 'Please select at least one category/skill, or specify a custom one.';
  }
  for (const cat of categories) {
    if (!isValidCategoryString(cat)) {
      return 'One or more categories are invalid.';
    }
  }
  return null;
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password, categories } = req.body;

    if (!username || !username.trim() || !email || !email.trim() || !password) {
      return res.status(400).json({ message: 'Username, email, and password are all required.' });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const categoryError = validateCategories(categories);
    if (categoryError) {
      return res.status(400).json({ message: categoryError });
    }

    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      return res.status(400).json({ message: 'This username is already taken. Please choose another.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      categories,
    });

    await newUser.save();
    res.status(201).json({ message: 'Registration successful. You can now log in.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'An account with that email or username already exists.' });
    }
    res.status(500).json({ message: 'Something went wrong during registration.', error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both your email and password.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong during login.', error: err.message });
  }
};

const getMe = async (req, res) => {
  res.status(200).json({ user: sanitizeUser(req.user) });
};

const updateProfile = async (req, res) => {
  try {
    const { username, categories, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (username && username.trim() && username.trim() !== user.username) {
      const existingUsername = await User.findOne({ username: username.trim(), _id: { $ne: user._id } });
      if (existingUsername) {
        return res.status(400).json({ message: 'This username is already taken. Please choose another.' });
      }
      user.username = username.trim();
    }

    if (categories !== undefined) {
      const categoryError = validateCategories(categories);
      if (categoryError) {
        return res.status(400).json({ message: categoryError });
      }
      user.categories = categories;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Please enter your current password to set a new one.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully.', user: sanitizeUser(user) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'This username is already taken.' });
    }
    res.status(500).json({ message: 'Failed to update profile.', error: err.message });
  }
};

module.exports = { registerUser, loginUser, getMe, updateProfile };
