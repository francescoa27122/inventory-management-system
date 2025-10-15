import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { authService } from '../services/api';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

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
          <Link to="/compare" className={isActive('/compare')}>
            Compare
          </Link>
          <Link to="/jobs" className={isActive('/jobs')}>
            Jobs
          </Link>
        </div>
        
        <div className="nav-user">
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
