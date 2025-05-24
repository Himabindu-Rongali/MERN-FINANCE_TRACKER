import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // Optional: store user details
  const [loading, setLoading] = useState(true);

  // Placeholder for fetching user details - implement if you have an endpoint
  const fetchUser = async () => {
    // Example:
    // try {
    //   const res = await axios.get('/api/auth/me'); // Assuming you have an endpoint to get user details
    //   setUser(res.data);
    // } catch (error) {
    //   console.error("Failed to fetch user", error);
    //   // Handle error, maybe logout user if token is invalid
    //   logout();
    // }
    console.log("fetchUser called, implement API call if needed");
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      setToken(storedToken);
      fetchUser(); // Fetch user details if token exists
    }
    setLoading(false);
  }, []);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    fetchUser(); // Fetch user details on login
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!token;
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
