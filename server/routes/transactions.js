const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/transactions
// @desc    Get all transactions for current user
// @access  Protected
router.get('/', async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit = 500, page = 1 } = req.query;

    const filter = { user_id: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      filter.type = type;
    }
    if (category) {
      filter.category = { $regex: new RegExp(category, 'i') };
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions: transactions.map(t => ({
        id: t._id,
        user_id: t.user_id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description,
        payment_method: t.payment_method,
        date: t.date,
        receipt_url: t.receipt_url,
        created_at: t.createdAt,
        updated_at: t.updatedAt,
      })),
      total,
      page: parseInt(page),
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Protected
router.post('/', async (req, res) => {
  try {
    const { type, amount, category, description, payment_method, date } = req.body;

    if (!type || !amount || !category || !date) {
      return res.status(400).json({ message: 'Type, amount, category and date are required.' });
    }

    const transaction = await Transaction.create({
      user_id: req.user._id,
      type,
      amount: parseFloat(amount),
      category,
      description: description || '',
      payment_method: payment_method || 'cash',
      date,
    });

    res.status(201).json({
      message: 'Transaction added successfully!',
      transaction: {
        id: transaction._id,
        user_id: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        payment_method: transaction.payment_method,
        date: transaction.date,
        receipt_url: transaction.receipt_url,
        created_at: transaction.createdAt,
        updated_at: transaction.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Protected
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    const { type, amount, category, description, payment_method, date } = req.body;
    if (type) transaction.type = type;
    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (category) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (payment_method) transaction.payment_method = payment_method;
    if (date) transaction.date = date;

    await transaction.save();

    res.json({
      message: 'Transaction updated successfully!',
      transaction: {
        id: transaction._id,
        user_id: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        payment_method: transaction.payment_method,
        date: transaction.date,
        receipt_url: transaction.receipt_url,
        created_at: transaction.createdAt,
        updated_at: transaction.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Protected
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    res.json({ message: 'Transaction deleted successfully!' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
