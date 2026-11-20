const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// GET /api/auth/check-username?username=xyz
const checkUsername = async (req, res, next) => {
  try {
    const raw = req.query.username;
    if (!raw || !raw.trim()) {
      return res.status(400).json({ available: false, message: 'Username is required' });
    }
    const cleanUsername = raw.trim().toLowerCase().replace(/\s+/g, '_');

    // Check format: 3-30 characters, letters, numbers, underscores
    const validFormat = /^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername);
    if (!validFormat) {
      return res.status(400).json({
        available: false,
        message: 'Username must be 3-30 characters and contain only letters, numbers, or underscores',
      });
    }

    const query = {
      username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') },
    };

    // If authenticated user is checking their own username, exclude self
    if (req.user?.id) {
      query._id = { $ne: req.user.id };
    }

    const existing = await User.findOne(query);

    if (existing) {
      return res.json({
        available: false,
        cleanUsername,
        message: 'This username is already taken',
      });
    }

    return res.json({
      available: true,
      cleanUsername,
      message: 'This username is available!',
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, fullName, email, password } = req.body;
    const cleanUsername = (username || '').trim().toLowerCase().replace(/\s+/g, '_');
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Check if username already exists (case-insensitive)
    const existingUsername = await User.findOne({
      username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') },
    });
    if (existingUsername) {
      return res.status(400).json({
        message: 'This username is already taken. Please choose another username.',
      });
    }

    // 2. Check if email already exists
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        message: 'An account with this email already exists. Please log in.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username: cleanUsername,
      fullName: fullName.trim(),
      email: cleanEmail,
      password: hashedPassword,
    });
    await user.save();

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ token, user: userObj });
  } catch (err) {
    if (err.code === 11000) {
      const isUsername =
        err.keyPattern?.username || (err.message && err.message.includes('username'));
      if (isUsername) {
        return res.status(400).json({
          message: 'This username is already taken. Please choose another username.',
        });
      }
      return res.status(400).json({
        message: 'An account with this email already exists. Please log in.',
      });
    }
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    res.json({ token, user: userObj });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { checkUsername, register, login, getMe };
