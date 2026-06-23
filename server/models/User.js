const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  avatar_url: {
    type: String,
    default: null,
  },
  settings: {
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },
    month_start_day: { type: Number, default: 1 },
    notifications_enabled: { type: Boolean, default: true },
    dark_mode: { type: Boolean, default: false },
  },
  isDemo: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// ✅ Mongoose 7+/8+: async pre-save WITHOUT calling next()
// Just return — Mongoose awaits the promise automatically
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err; // Let Mongoose catch and propagate the error
  }
});

// Compare candidate password against stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw err;
  }
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
