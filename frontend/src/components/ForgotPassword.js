import React, { useState, useContext } from 'react'; // Import useContext
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './ForgotPassword.css';
import { ThemeContext } from './ThemeContext'; // Import ThemeContext

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate
  const { theme } = useContext(ThemeContext); // Use ThemeContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email,
        newPassword,
      });
      setMessage(response.data.msg + " You will be redirected to login shortly.");
      setTimeout(() => {
        navigate('/login'); // Redirect to login page
      }, 3000); // Redirect after 3 seconds
    } catch (err) {
      setError(err.response?.data?.msg || 'Error resetting password. Please try again.');
    }
  };

  return (
    <div className={`forgot-password-container ${theme}`}> {/* Apply theme class */}
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <h2>Reset Password</h2>
        <p>Enter your email and new password to reset your password.</p>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="form-control"
          />
        </div>
        <button type="submit" className="btn-submit">Reset Password</button>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;
