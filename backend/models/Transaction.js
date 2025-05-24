// backend/models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: ['Cash', 'Online Payment'], // You can add more payment methods if needed
  },
});

module.exports = mongoose.model('Transaction', TransactionSchema);