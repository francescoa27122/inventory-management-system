import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Wrench, AlertTriangle } from 'lucide-react';
import Navigation from '../components/Navigation';
import EmptyState from '../components/EmptyState';
import { inventoryService, jobsService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useLanguage();
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
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="page-container">
        <h2 className="page-title">{t('dashboard.title')}</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <Package className="stat-icon" />
              <span className="stat-label">{t('dashboard.totalItems')}</span>
            </div>
            <div className="stat-value">{stats.totalItems}</div>
          </div>

          <div className="stat-card value-card">
            <div className="stat-header">
              <DollarSign className="stat-icon" />
              <span className="stat-label">{t('dashboard.tireShopValue')}</span>
            </div>
            <div className="stat-value">${stats.tireShopValue.toFixed(2)}</div>
            <div className="stat-sublabel">{t('dashboard.currentInventoryValue')}</div>
          </div>

          <div className="stat-card value-card">
            <div className="stat-header">
              <DollarSign className="stat-icon" />
              <span className="stat-label">{t('dashboard.bodyShopValue')}</span>
            </div>
            <div className="stat-value">${stats.mainShopValue.toFixed(2)}</div>
            <div className="stat-sublabel">{t('dashboard.currentInventoryValue')}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <Wrench className="stat-icon" />
              <span className="stat-label">{t('dashboard.activeJobs')}</span>
            </div>
            <div className="stat-value">{stats.activeJobs}</div>
          </div>
        </div>

        <div className="alerts-section">
          <div className="alert-card">
            <div className="alert-header">
              <AlertTriangle className="alert-icon" />
              <h3>{t('dashboard.lowStockAlert')}</h3>
              {stats.lowStockCount > 0 && (
                <span className="alert-count">{stats.lowStockCount} {t('dashboard.items')}</span>
              )}
            </div>
            {lowStockItems.length > 0 ? (
              <>
                <div className="low-stock-table">
                  <div className="table-header">
                    <div className="col-item">{t('dashboard.itemName')}</div>
                    <div className="col-category">{t('inventory.category')}</div>
                    <div className="col-quantity">{t('dashboard.currentStock')}</div>
                    <div className="col-status">{t('dashboard.status')}</div>
                  </div>
                  <div className="table-body">
                    {lowStockItems.map(item => (
                      <div key={item.id} className="table-row">
                        <div className="col-item">
                          <span className="item-name">{item.item_name}</span>
                        </div>
                        <div className="col-category">
                          <span className="category-badge">{item.category || t('inventory.uncategorized')}</span>
                        </div>
                        <div className="col-quantity">
                          <span className="quantity-text">{item.quantity} {t('dashboard.units')}</span>
                        </div>
                        <div className="col-status">
                          <span className={`status-badge ${item.quantity < 50 ? 'critical' : item.quantity < 75 ? 'warning' : 'low'}`}>
                            {item.quantity < 50 ? t('dashboard.critical') : item.quantity < 75 ? t('dashboard.warning') : t('dashboard.low')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {stats.lowStockCount > 10 && (
                  <div className="alert-footer">
                    <span className="alert-more">
                      + {stats.lowStockCount - 10} {t('dashboard.moreItemsBelowThreshold')}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={Package}
                title={t('dashboard.allStockedUp')}
                description={t('dashboard.allStockedUpDesc')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
