import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User, Moon, Sun } from 'lucide-react';
import { authService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      authService.logout();
      navigate('/login');
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>Inventory Manager</h1>
        </div>
        
        <div className="nav-links">
          <Link to="/dashboard" className={isActive('/dashboard')}>
            Dashboard
          </Link>
          <Link to="/inventory" className={isActive('/inventory')}>
            Inventory
          </Link>
          <Link to="/jobs" className={isActive('/jobs')}>
            Jobs
          </Link>
          <Link to="/customers" className={isActive('/customers')}>
            Customers
          </Link>
          <Link to="/reports" className={isActive('/reports')}>
            Reports
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/users" className={isActive('/users')}>
                Users
              </Link>
              <Link to="/activity" className={isActive('/activity')}>
                Activity
              </Link>
            </>
          )}
        </div>
        
        <div className="nav-user">
          <button 
            onClick={toggleTheme} 
            className="theme-toggle" 
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <div className="user-info">
            <User size={18} />
            <span>{user?.username || 'User'}</span>
          </div>
          <button onClick={handleLogout} className="logout-button" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
