const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Transaction type is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  payment_method: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'digital_wallet', 'other'],
    default: 'cash',
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
  },
  receipt_url: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
transactionSchema.index({ user_id: 1, date: -1 });
transactionSchema.index({ user_id: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
