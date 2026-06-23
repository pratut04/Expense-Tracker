const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

// @route   GET /api/settings
// @desc    Get user settings
// @access  Protected
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('settings name email');
    res.json({ settings: user.settings, name: user.name, email: user.email });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   PUT /api/settings
// @desc    Update user settings
// @access  Protected
router.put('/', async (req, res) => {
  try {
    const { currency, language, month_start_day, notifications_enabled, dark_mode, name } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (currency) user.settings.currency = currency;
    if (language) user.settings.language = language;
    if (month_start_day !== undefined) user.settings.month_start_day = parseInt(month_start_day);
    if (notifications_enabled !== undefined) user.settings.notifications_enabled = Boolean(notifications_enabled);
    if (dark_mode !== undefined) user.settings.dark_mode = Boolean(dark_mode);

    await user.save();

    res.json({
      message: 'Settings updated successfully!',
      settings: user.settings,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   PUT /api/settings/password
// @desc    Change user password
// @access  Protected
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
