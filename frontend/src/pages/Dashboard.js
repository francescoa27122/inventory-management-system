import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Wrench, AlertTriangle } from 'lucide-react';
import Navigation from '../components/Navigation';
import { inventoryService, jobsService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    tireShopValue: 0,
    mainShopValue: 0,
    lowStockCount: 0,
    activeJobs: 0
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [itemsResponse, jobsResponse] = await Promise.all([
        inventoryService.getAll({ limit: 1000 }),
        jobsService.getAll()
      ]);

      const items = itemsResponse.data.data;
      const jobs = jobsResponse.data.data;

      // Only show Tire Shop items in low stock alerts
      const lowStock = items.filter(item => item.section === 'Tire Shop' && item.quantity < 100);
      const activeJobs = jobs.filter(job => job.status === 'active').length;

      // Calculate total value and split by section
      const totalValue = items.reduce((sum, item) => 
        sum + (item.unit_price * item.quantity), 0
      );

      // Calculate Tire Shop value
      const tireShopValue = items
        .filter(item => item.section === 'Tire Shop')
        .reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

      // Calculate Main Shop value (Body Shop)
      const mainShopValue = items
        .filter(item => item.section === 'Main Shop')
        .reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

      setStats({
        totalItems: items.length,
        totalValue,
        tireShopValue,
        mainShopValue,
        lowStockCount: lowStock.length,
        activeJobs
      });

      // Sort by quantity (lowest first) and take top 10
      setLowStockItems(lowStock.sort((a, b) => a.quantity - b.quantity).slice(0, 10));
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
        <h2 className="page-title">Dashboard</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <Package className="stat-icon" />
              <span className="stat-label">Total Items</span>
            </div>
            <div className="stat-value">{stats.totalItems}</div>
          </div>

          <div className="stat-card value-card">
            <div className="stat-header">
              <DollarSign className="stat-icon" />
              <span className="stat-label">Tire Shop Value</span>
            </div>
            <div className="stat-value">${stats.tireShopValue.toFixed(2)}</div>
            <div className="stat-sublabel">Current inventory value</div>
          </div>

          <div className="stat-card value-card">
            <div className="stat-header">
              <DollarSign className="stat-icon" />
              <span className="stat-label">Body Shop Value</span>
            </div>
            <div className="stat-value">${stats.mainShopValue.toFixed(2)}</div>
            <div className="stat-sublabel">Current inventory value</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <Wrench className="stat-icon" />
              <span className="stat-label">Active Jobs</span>
            </div>
            <div className="stat-value">{stats.activeJobs}</div>
          </div>
        </div>

        <div className="alerts-section">
          <div className="alert-card">
            <div className="alert-header">
              <AlertTriangle className="alert-icon" />
              <h3>Low Stock Alert - Tire Shop</h3>
              {stats.lowStockCount > 0 && (
                <span className="alert-count">{stats.lowStockCount} items</span>
              )}
            </div>
            {lowStockItems.length > 0 ? (
              <>
                <div className="low-stock-table">
                  <div className="table-header">
                    <div className="col-item">Item Name</div>
                    <div className="col-category">Category</div>
                    <div className="col-quantity">Current Stock</div>
                    <div className="col-status">Status</div>
                  </div>
                  <div className="table-body">
                    {lowStockItems.map(item => (
                      <div key={item.id} className="table-row">
                        <div className="col-item">
                          <span className="item-name">{item.item_name}</span>
                        </div>
                        <div className="col-category">
                          <span className="category-badge">{item.category || 'Uncategorized'}</span>
                        </div>
                        <div className="col-quantity">
                          <span className="quantity-text">{item.quantity} units</span>
                        </div>
                        <div className="col-status">
                          <span className={`status-badge ${item.quantity < 50 ? 'critical' : item.quantity < 75 ? 'warning' : 'low'}`}>
                            {item.quantity < 50 ? 'Critical' : item.quantity < 75 ? 'Warning' : 'Low'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {stats.lowStockCount > 10 && (
                  <div className="alert-footer">
                    <span className="alert-more">
                      + {stats.lowStockCount - 10} more items below stock threshold
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="alert-empty">
                <Package size={48} className="empty-icon" />
                <p>All Tire Shop items are well stocked!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
