// backend/routes/transactions.js
const express = require('express');
const Transaction = require('../models/Transaction');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Import auth middleware

// GET all transactions with optional date filtering
router.get('/', authMiddleware, async (req, res) => { // Protect with authMiddleware
  try {
    const { startDate, endDate, year, month } = req.query;
    let filter = { user: req.user.id };

    // Add date filtering
    if (startDate || endDate || year || month) {
      filter.date = {};
      
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1); // Include end date
        filter.date.$lt = end;
      }
      
      if (year && !startDate && !endDate) {
        const y = parseInt(year);
        if (!isNaN(y)) {
          if (month !== undefined && month !== '') {
            const m = parseInt(month);
            if (!isNaN(m)) {
              filter.date = {
                $gte: new Date(y, m, 1),
                $lt: new Date(y, m + 1, 1)
              };
            }
          } else {
            filter.date = {
              $gte: new Date(y, 0, 1),
              $lt: new Date(y + 1, 0, 1)
            };
          }
        }
      }
    }

    // Modify to fetch transactions for the logged-in user with date filtering
    const transactions = await Transaction.find(filter).sort({ date: -1 }); 
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new transaction
router.post('/', authMiddleware, async (req, res) => { // Protect with authMiddleware
  const { amount, category, description, date, paymentMethod } = req.body;
  // Add user ID to the transaction
  const transaction = new Transaction({ 
    amount, 
    category, 
    description, 
    date, 
    paymentMethod, 
    user: req.user.id // Associate transaction with the logged-in user
  });

  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a transaction
router.delete('/:id', authMiddleware, async (req, res) => { // Protect with authMiddleware
  try {
    // Optional: Add check to ensure user can only delete their own transactions
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
    res.json(deletedTransaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;