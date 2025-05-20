// src/components/IncomeList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import IncomeForm from './IncomeForm';

const IncomeList = () => {
  const [incomes, setIncomes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
    <div style={styles.container}>
      <h2 style={styles.heading}>
        Income List ({currentDate.toLocaleString('default', { month: 'long' })} {currentYear})
      </h2>

      {successMessage && (
        <div style={styles.successMessage}>{successMessage}</div>
      )}

      {currentMonthIncomes.length === 0 ? (
        <p style={styles.noData}>No income records found for this month.</p>
      ) : (
        <div style={styles.list}>
          {currentMonthIncomes.map((income) => (
            <div key={income._id} style={styles.card}>
              <div style={styles.amount}>₹{income.amount}</div>
              <div style={styles.details}>
                <span>{income.source}</span>
                <span style={styles.date}>{new Date(income.date).toLocaleDateString()}</span>
              </div>
              <button
                style={styles.deleteButton}
                onClick={() => handleDelete(income._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={styles.formContainer}>
          <IncomeForm onSuccess={handleFormSubmit} />
        </div>
      )}

      {!showForm && (
        <div style={styles.addBtnContainer}>
          <button style={styles.addButton} onClick={() => setShowForm(true)}>Add Income</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '1.5rem',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
    color: 'black',
    textAlign: 'center',
    borderBottom: '2px solid #eee',
    paddingBottom: '0.5rem'
  },
  successMessage: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  addBtnContainer: {
    textAlign: 'center',
    marginTop: '2rem'
  },
  addButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: 'brown',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  formContainer: {
    marginTop: '1.5rem'
  },
  noData: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  card: {
    padding: '1rem',
    backgroundColor: '#f4f6f8',
    borderRadius: '6px',
    border: '1px solid #ddd',
    transition: '0.3s ease',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  amount: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: 'black'
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    color: '#555'
  },
  date: {
    fontSize: '0.9rem',
    color: '#888'
  },
  deleteButton: {
    padding: '6px 12px',
    fontSize: '0.9rem',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: '0.3s ease',
  }
};

export default IncomeList;
