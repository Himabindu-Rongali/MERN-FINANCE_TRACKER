import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="theme-toggle">
      <input
        type="checkbox"
        id="theme-toggle"
        checked={theme === 'dark'}
        onChange={toggleTheme}
      />
      <label htmlFor="theme-toggle" className="toggle-label">
        <span className="toggle-icon">
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
      </label>
    </div>
  );
};

export default ThemeToggle;
