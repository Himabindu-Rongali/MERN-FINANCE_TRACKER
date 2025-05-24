// src/components/IncomeList.js
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import IncomeForm from './IncomeForm';
import { ThemeContext } from './ThemeContext';
import './IncomeList.css';

const IncomeList = () => {
  const [incomes, setIncomes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { theme } = useContext(ThemeContext);

  const fetchIncomes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/income');
      setIncomes(res.data);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/income/${id}`);
      fetchIncomes(); // Refresh the income list
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    fetchIncomes();
    setSuccessMessage('Income added successfully!');
    setTimeout(() => setSuccessMessage(''), 3000); // Hide after 3 seconds
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const currentMonthIncomes = incomes.filter(income => {
    const incomeDate = new Date(income.date);
    return (
      incomeDate.getFullYear() === currentYear &&
      incomeDate.getMonth() === currentMonth
    );
  });
  return (
    <div className={`income-container ${theme}`}>
      <h2 className="income-heading">
        Income List ({currentDate.toLocaleString('default', { month: 'long' })} {currentYear})
      </h2>

      {successMessage && (
        <div className="income-success-message">{successMessage}</div>
      )}

      {currentMonthIncomes.length === 0 ? (
        <p className="income-no-data">No income records found for this month.</p>
      ) : (
        <div className="income-list">
          {currentMonthIncomes.map((income) => (
            <div key={income._id} className="income-card">
              <div className="income-amount">₹{income.amount}</div>
              <div className="income-details">
                <span>{income.source}</span>
                <span className="income-date">{new Date(income.date).toLocaleDateString()}</span>
              </div>
              <button
                className="income-delete-button"
                onClick={() => handleDelete(income._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="income-form-container">
          <IncomeForm onSuccess={handleFormSubmit} />
        </div>
      )}

      {!showForm && (
        <div className="income-add-btn-container">
          <button className="income-add-button" onClick={() => setShowForm(true)}>Add Income</button>
        </div>
      )}
    </div>
  );
};

// Styles moved to IncomeList.css

export default IncomeList;