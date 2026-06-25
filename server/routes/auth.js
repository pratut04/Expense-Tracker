const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, signToken } = require('../middleware/auth');

// Demo accounts (auto-fill on login page)
const DEMO_ACCOUNTS = [
  {
    name: 'Alice Demo',
    email: 'alice@demo.com',
    password: 'demo123',
    description: 'Personal finance tracker',
    avatar: 'A',
    color: '#6366f1',
  },
  {
    name: 'Bob Demo',
    email: 'bob@demo.com',
    password: 'demo123',
    description: 'Business expense tracker',
    avatar: 'B',
    color: '#8b5cf6',
  },
];

// @route   GET /api/auth/demo-accounts
// @desc    Return demo account list (passwords included for auto-fill)
// @access  Public
router.get('/demo-accounts', (req, res) => {
  res.json({ accounts: DEMO_ACCOUNTS });
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Create user — pre-save hook will hash the password
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    await user.save();

    const token = signToken(user._id);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
        created_at: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Register error:', error.name, error.message);

    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: error.message || 'Server error. Please try again.' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Fetch user with password field (select: false by default)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user._id);

    res.json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
        created_at: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error.name, error.message);
    res.status(500).json({ message: error.message || 'Server error. Please try again.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user
// @access  Protected
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
        created_at: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Get me error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
