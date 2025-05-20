import React, { useState, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from './ThemeContext';
import './TransactionForm.css';

const TransactionForm = ({ refreshTransactions, handleAddTransaction }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');  // State for payment method
  const { theme } = useContext(ThemeContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTransaction = { amount, category, date, description, paymentMethod };

    try {
      await axios.post('http://localhost:5000/transactions', newTransaction);
      handleAddTransaction();  // Call the function to show success message
      setAmount('');
      setCategory('');
      setDate('');
      setDescription('');
      setPaymentMethod('');  // Reset payment method after submission
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };
  return (
    <div className={`transaction-form-container ${theme}`}>
      <h2 className="form-section-title">Add New Transaction</h2>
      <form onSubmit={handleSubmit} className="transaction-form">
        <label>
          Amount:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="Enter amount"
          />
        </label>

        <label>
          Category:
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            placeholder="e.g., Groceries, Utilities, Entertainment"
          />
        </label>

        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <label>
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description (optional)"
          />
        </label>

        {/* Payment Method Dropdown */}
        <label>
          Payment Method:
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="">Select Payment Method</option>
            <option value="Cash">Cash</option>
          <option value="Online Payment">Online Payment</option>
          </select>
        </label>
        
        <div style={{ textAlign: 'center' }}>
          <button type="submit">Add Transaction</button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
