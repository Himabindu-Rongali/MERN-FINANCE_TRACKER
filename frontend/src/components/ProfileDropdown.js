import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './ProfileDropdown.css'; // We'll create this CSS file next

const ProfileDropdown = () => {
  const { user, logout, updateUser } = useContext(AuthContext); // Add updateUser
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (user && user.username) {
      setNewUsername(user.username);
    }
  }, [user]);

  const getDisplayUsername = () => {
    if (user?.username) {
      return user.username;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return null; // Or some fallback UI if needed when user is not loaded yet
  }

  const handleUsernameChange = async (e) => {
    console.log('[FRONTEND ProfileDropdown] handleUsernameChange started. New username:', newUsername); // ADDED THIS LINE
    e.preventDefault();
    setEditError('');
    if (!newUsername || newUsername.length < 3) {
      setEditError('Username must be at least 3 characters long.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/auth/username', 
        { username: newUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateUser({ username: response.data.username }); // Update context
      setIsEditingUsername(false);
      setEditError('');
    } catch (error) {
      console.error('Failed to update username (frontend catch):', error); // Log the whole error object
      if (error.response) {
        console.error('Error response data (frontend):', error.response.data);
        console.error('Error response status (frontend):', error.response.status);
        console.error('Error response headers (frontend):', error.response.headers);
      } else if (error.request) {
        console.error('Error request (frontend):', error.request);
      } else {
        console.error('Error message (frontend):', error.message);
      }

      let errorMessage = 'Failed to update username.';
      if (error.response && error.response.data) {
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          errorMessage = error.response.data.errors[0].msg; // Use the first validation error
        } else if (error.response.data.msg) {
          errorMessage = error.response.data.msg; // Use the general message if available
        }
      }
      setEditError(errorMessage);
    }
  };

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="profile-button">
        <div className="profile-icon">
          {getDisplayUsername().substring(0, 1).toUpperCase()}
        </div>
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <p className="username">{getDisplayUsername()}</p>
            <p className="email">{user.email}</p>
          </div>
          {isEditingUsername ? (
            <form onSubmit={handleUsernameChange} className="username-edit-form">
              <input 
                type="text" 
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="New username"
                className="username-edit-input"
              />
              {editError && <p className="error-message">{editError}</p>}
              <div className="username-edit-actions">
                <button type="submit" className="save-button">Save</button>
                <button type="button" onClick={() => { setIsEditingUsername(false); setEditError(''); setNewUsername(user?.username || ''); }} className="cancel-button">Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={() => { setIsEditingUsername(true); setNewUsername(user?.username || ''); }} className="dropdown-item">
              Change Username
            </button>
          )}
          <button onClick={logout} className="dropdown-item logout-button">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
