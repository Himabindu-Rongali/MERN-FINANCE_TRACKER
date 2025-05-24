import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import IncomeList from './components/IncomeList';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider, ThemeContext } from './components/ThemeContext';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProfileDropdown from './components/ProfileDropdown';
import ForgotPassword from './components/ForgotPassword';

import './App.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const [transactions, setTransactions] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const { theme } = useContext(ThemeContext);
  const { isAuthenticated, token } = useContext(AuthContext);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/transactions');
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
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
    if (token) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [token]);

  return (
    <div className={`app-container ${theme}`}>
      <nav className="navbar">
        <div className="navbar-content-right">
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            {isAuthenticated() && (
              <>
                <Link to="/transactions" className="nav-link">Transactions</Link>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/income" className="nav-link">Income</Link>
              </>
            )}
          </div>
          <div className="nav-auth-controls">
            {isAuthenticated() ? (
              <ProfileDropdown />
            ) : (
              <div className="auth-links-group">
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Register</Link>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <div className={`home-page ${theme}`}>
                <h1>Personal Finance Manager</h1>
                <TransactionForm
                  refreshTransactions={fetchTransactions}
                  handleAddTransaction={handleAddTransaction}
                />
                {successMessage && <div className="success-message">{successMessage}</div>}
              </div>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/transactions" 
          element={
            <PrivateRoute>
              <div>
                <TransactionList
                  transactions={transactions}
                  deleteTransaction={deleteTransaction}
                />
              </div>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard transactions={transactions} />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/income" 
          element={
            <PrivateRoute>
              <IncomeList />
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;