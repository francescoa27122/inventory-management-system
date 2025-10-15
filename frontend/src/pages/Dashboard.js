import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, DollarSign, Package, Plus, Upload, AlertTriangle } from 'lucide-react';
import Navigation from '../components/Navigation';
import { inventoryService, jobsService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    activeJobs: 0,
    lowStockItems: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [inventoryResponse, jobsResponse] = await Promise.all([
        inventoryService.getAll({ limit: 1000 }),
        jobsService.getAll()
      ]);

      const items = inventoryResponse.data.data;
      const jobs = jobsResponse.data.data;

      const totalValue = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);

      const lowStock = items.filter(item => item.quantity < 100);
      const activeJobs = jobs.filter(job => job.status === 'active').length;

      setStats({
        totalItems: items.length,
        totalValue: totalValue.toFixed(2),
        activeJobs,
        lowStockItems: lowStock
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="page-container">
          <div className="loading">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="page-container">
        <h2 className="page-title">Dashboard Overview</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Total Items</p>
                <p className="stat-value">{stats.totalItems}</p>
              </div>
              <div className="stat-icon blue">
                <Package size={24} />
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Total Value</p>
                <p className="stat-value">${stats.totalValue}</p>
              </div>
              <div className="stat-icon green">
                <DollarSign size={24} />
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Active Jobs</p>
                <p className="stat-value">{stats.activeJobs}</p>
              </div>
              <div className="stat-icon purple">
                <Briefcase size={24} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-content">
          <div className="dashboard-section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="action-buttons">
              <button 
                className="action-button blue"
                onClick={() => navigate('/inventory')}
              >
                <Plus size={20} />
                <span>Add New Item</span>
              </button>
              <button 
                className="action-button green"
                onClick={() => navigate('/inventory')}
              >
                <Upload size={20} />
                <span>Import from Excel</span>
              </button>
              <button 
                className="action-button purple"
                onClick={() => navigate('/jobs')}
              >
                <Briefcase size={20} />
                <span>Create New Job</span>
              </button>
            </div>
          </div>
          
          <div className="dashboard-section">
            <h3 className="section-title">Low Stock Alert</h3>
            {stats.lowStockItems.length === 0 ? (
              <p className="empty-message">All items are well stocked!</p>
            ) : (
              <div className="low-stock-list">
                {stats.lowStockItems.map(item => (
                  <div key={item.id} className="low-stock-item">
                    <div className="item-details">
                      <p className="item-name">{item.item_name}</p>
                      <p className="item-quantity">Quantity: {item.quantity}</p>
                    </div>
                    <div className="alert-badge">
                      <AlertTriangle size={16} />
                      Low
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
