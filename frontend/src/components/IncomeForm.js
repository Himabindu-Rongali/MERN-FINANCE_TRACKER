// src/components/IncomeForm.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from './ThemeContext';
import './IncomeForm.css';

const IncomeForm = ({ onSuccess }) => {
  const { theme } = useContext(ThemeContext);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/income', {
        source,
        amount,
        date,
      });
      setSource('');
      setAmount('');
      setDate('');
      if (onSuccess) onSuccess(); // Notify parent
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };
  return (
    <form onSubmit={handleSubmit} className={`income-form ${theme}`}>
      <h3 className="income-form-title">Add New Income</h3>
      
      <div className="income-form-group">
        <label className="income-label">Amount</label>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="income-input"
        />
      </div>
      
      <div className="income-form-group">
        <label className="income-label">Source</label>
        <input
          type="text"
          placeholder="e.g., Salary, Freelance, Investment"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          required
          className="income-input"
        />
      </div>
      
      <div className="income-form-group">
        <label className="income-label">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="income-input"
        />
      </div>
      
      <button type="submit" className="income-submit-button">Add Income</button>
    </form>
  );
};

// Styles moved to IncomeForm.css

export default IncomeForm;