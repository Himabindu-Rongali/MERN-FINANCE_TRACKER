import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import './ProfileDropdown.css'; // We'll create this CSS file next

const ProfileDropdown = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getUsername = (email) => {
    if (!email) return 'User';
    return email.split('@')[0];
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

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="profile-button">
        {/* Simple initials as profile icon for now, can be replaced with an SVG icon */}
        <div className="profile-icon">
          {getUsername(user.email).substring(0, 1).toUpperCase()}
        </div>
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <p className="username">{getUsername(user.email)}</p>
            <p className="email">{user.email}</p>
          </div>
          <button onClick={logout} className="dropdown-item logout-button">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
