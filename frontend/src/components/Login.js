import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext'; // Assuming you'll create an AuthContext
import './Login.css';
import { ThemeContext } from './ThemeContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // const { login } = useContext(AuthContext); // Placeholder for AuthContext
  const { theme } = useContext(ThemeContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      // login(res.data.token); // Placeholder for AuthContext action
      localStorage.setItem('token', res.data.token); // Store token
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      navigate('/'); // Redirect to dashboard or home page
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className={`login-container ${theme}`}>
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
