// backend/routes/transactions.js
const express = require('express');
const Transaction = require('../models/Transaction');
const router = express.Router();

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new transaction
router.post('/', async (req, res) => {
  const { amount, category, description, date,paymentMethod} = req.body;
  const transaction = new Transaction({ amount, category, description, date,paymentMethod});

  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a transaction
router.delete('/:id', async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
    res.json(deletedTransaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;