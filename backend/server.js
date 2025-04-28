// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const transactionRoutes = require('./routes/transactions');

const app = express();
const PORT = 5000;


app.use(cors({
  origin: 'http://localhost:3000', // allow frontend server
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use('/transactions', transactionRoutes);
mongoose.connect('mongodb://127.0.0.1:27017/financeapp')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
