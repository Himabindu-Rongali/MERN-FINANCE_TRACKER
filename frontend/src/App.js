import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import IncomeList from './components/IncomeList';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider, ThemeContext } from './components/ThemeContext';

import './App.css';

const AppContent = () => {
  const [transactions, setTransactions] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const { theme } = useContext(ThemeContext);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/transactions');
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleAddTransaction = () => {
    setSuccessMessage('Transaction added successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
    fetchTransactions();
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className={`app-container ${theme}`}>
      <nav className="navbar">
        <div className="right-side-nav">
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/transactions" className="nav-link">Transactions</Link>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/income" className="nav-link">Income</Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <Routes>
        <Route path="/" element={
          <div className={`home-page ${theme}`}>
            <h1>Personal Finance Manager</h1>
            <TransactionForm
              refreshTransactions={fetchTransactions}
              handleAddTransaction={handleAddTransaction}
            />
            {successMessage && <div className="success-message">{successMessage}</div>}
          </div>
        } />
        <Route path="/transactions" element={
          <div>
            <TransactionList
              transactions={transactions}
              deleteTransaction={deleteTransaction}
            />
          </div>
        } />
        <Route path="/dashboard" element={<Dashboard transactions={transactions} />} />
        <Route path="/income" element={<IncomeList />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
};

export default App;
