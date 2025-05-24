import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      setToken(storedToken);
      // Fetch user for the initially loaded token
      axios.get('http://localhost:5000/api/auth/me')
        .then(res => {
          setUser(res.data);
        })
        .catch(error => {
          console.error("Failed to fetch user on initial load:", error.response ? error.response.data : error.message);
          // Token might be invalid, clear it and user state
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setLoading(false); // Initial auth check (and user fetch attempt) is complete
        });
    } else {
      setLoading(false); // No token, so not loading, initial auth check complete
    }
  }, []); // Runs once on mount

  const login = useCallback(async (newToken) => {
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken); // Set token immediately for isAuthenticated to be true
    setLoading(true); // Start loading for login process
    
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me');
      setUser(res.data);
    } catch (error) {
      console.error("Failed to fetch user on login:", error.response ? error.response.data : error.message);
      // If fetching user fails during login, this is a critical error.
      // Revert auth state to prevent partial login.
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      // Potentially throw the error or return a status so Login.js can notify the user
      throw error;
    } finally {
      setLoading(false); // Login process (including user fetch) is complete
    }
  }, []); // setToken and setUser from useState are stable, so empty array is acceptable here

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setLoading(false); // Not loading after logout
  }, []); // setToken and setUser from useState are stable

  // isAuthenticated will be re-created if `token` changes, due to `useCallback` dependency
  const isAuthenticated = useCallback(() => !!token, [token]);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  }), [token, user, loading, login, logout, isAuthenticated]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
