const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'expense-tracker-super-secret-jwt-key-2024';

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated. Please log in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please log in again.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({ message: 'Authentication error.' });
  }
};

const signToken = (id) => {
  const secret = process.env.JWT_SECRET || 'expense-tracker-super-secret-jwt-key-2024';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

module.exports = { protect, signToken };
