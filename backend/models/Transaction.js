// backend/models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
