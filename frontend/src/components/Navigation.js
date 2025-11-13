import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User, Moon, Sun, Languages } from 'lucide-react';
import { authService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useConfirm } from '../hooks/useConfirm';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const confirm = useConfirm();

  const handleLogout = async () => {
    const confirmed = await confirm(t('nav.logoutConfirm'));
    if (confirmed) {
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
          <h1>{t('login.title')}</h1>
        </div>
        
        <div className="nav-links">
          <Link to="/dashboard" className={isActive('/dashboard')}>
            {t('nav.dashboard')}
          </Link>
          <Link to="/inventory" className={isActive('/inventory')}>
            {t('nav.inventory')}
          </Link>
          <Link to="/jobs" className={isActive('/jobs')}>
            {t('nav.jobs')}
          </Link>
          <Link to="/customers" className={isActive('/customers')}>
            {t('nav.customers')}
          </Link>
          <Link to="/analytics" className={isActive('/analytics')}>
            {t('nav.analytics')}
          </Link>
          <Link to="/reports" className={isActive('/reports')}>
            {t('nav.reports')}
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/users" className={isActive('/users')}>
                {t('nav.users')}
              </Link>
              <Link to="/activity" className={isActive('/activity')}>
                {t('nav.activity')}
              </Link>
            </>
          )}
        </div>
        
        <div className="nav-user">
          <button 
            onClick={toggleLanguage} 
            className="language-toggle" 
            title={`Switch to ${language === 'en' ? 'Español' : 'English'}`}
          >
            <Languages size={18} />
            <span className="language-label">{language === 'en' ? 'ES' : 'EN'}</span>
          </button>
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
          <button onClick={handleLogout} className="logout-button" title={t('nav.logout')}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
