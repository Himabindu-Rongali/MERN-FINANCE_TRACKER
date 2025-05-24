const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const transactionRoutes = require('./routes/transactions');
const incomeRoutes = require('./routes/income');
const transactionsUploadRoutes = require('./routes/transactions-upload');
const authRoutes = require('./routes/auth'); // Add this line

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Added PUT
  credentials: true
}));
app.use(express.json()); // ✅ Moved above the routes

// Routes
app.use('/transactions', transactionRoutes);
app.use('/api/income', incomeRoutes); // ✅ This now has access to req.body
app.use('/transactions/upload', transactionsUploadRoutes);
app.use('/api/auth', authRoutes); // Add this line

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/financeapp')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));