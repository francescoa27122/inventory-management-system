import React, { useState, useEffect } from 'react';
import { reportsService } from '../services/api';
import Navigation from '../components/Navigation';
import './Reports.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Report data
  const [dashboardData, setDashboardData] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [jobsReport, setJobsReport] = useState(null);
  const [customersReport, setCustomersReport] = useState(null);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      const [dashboard, inventory, jobs, customers] = await Promise.all([
        reportsService.getDashboard(),
        reportsService.getInventorySummary(),
        reportsService.getJobsSummary(),
        reportsService.getCustomersSummary()
      ]);

      setDashboardData(dashboard.data.report);
      setInventoryReport(inventory.data.summary);
      setJobsReport(jobs.data.summary);
      setCustomersReport(customers.data.summary);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading">Loading reports...</div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="reports-page">
        <h1>Reports & Analytics</h1>

        {/* Tabs */}
        <div className="report-tabs">
          <button
            className={activeTab === 'overview' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'inventory' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button
            className={activeTab === 'jobs' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('jobs')}
          >
            Jobs
          </button>
          <button
            className={activeTab === 'customers' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('customers')}
          >
            Customers
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div className="report-content">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Inventory</h3>
                <div className="metric">
                  <span className="metric-label">Total Items</span>
                  <span className="metric-value">{dashboardData.inventory.total_items}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Total Value</span>
                  <span className="metric-value">{formatCurrency(dashboardData.inventory.total_value)}</span>
                </div>
                <div className="metric warning">
                  <span className="metric-label">Low Stock Items</span>
                  <span className="metric-value">{dashboardData.inventory.low_stock_count}</span>
                </div>
              </div>

              <div className="overview-card">
                <h3>Jobs</h3>
                <div className="metric">
                  <span className="metric-label">Total Jobs</span>
                  <span className="metric-value">{dashboardData.jobs.total}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Active Jobs</span>
                  <span className="metric-value">{dashboardData.jobs.active}</span>
                </div>
                <div className="metric success">
                  <span className="metric-label">Completed This Month</span>
                  <span className="metric-value">{dashboardData.jobs.completed_this_month}</span>
                </div>
              </div>

              <div className="overview-card">
                <h3>Customers</h3>
                <div className="metric">
                  <span className="metric-label">Total Customers</span>
                  <span className="metric-value">{dashboardData.customers.total}</span>
                </div>
                <div className="metric success">
                  <span className="metric-label">New This Month</span>
                  <span className="metric-value">{dashboardData.customers.new_this_month}</span>
                </div>
              </div>

              <div className="overview-card">
                <h3>Activity</h3>
                <div className="metric">
                  <span className="metric-label">Actions Today</span>
                  <span className="metric-value">{dashboardData.activity.today}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Actions This Week</span>
                  <span className="metric-value">{dashboardData.activity.this_week}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && inventoryReport && (
          <div className="report-content">
            <div className="report-section">
              <h2>Inventory Summary</h2>
              <div className="summary-stats">
                <div className="summary-item">
                  <span className="summary-label">Total Items</span>
                  <span className="summary-value">{inventoryReport.total_items}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Value</span>
                  <span className="summary-value">{formatCurrency(inventoryReport.total_value)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Low Stock Items</span>
                  <span className="summary-value warning">{inventoryReport.low_stock_count}</span>
                </div>
              </div>
            </div>

            <div className="report-section">
              <h2>By Category</h2>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Items</th>
                    <th>Quantity</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport.by_category.map((cat, idx) => (
                    <tr key={idx}>
                      <td>{cat.category}</td>
                      <td>{cat.item_count}</td>
                      <td>{cat.total_quantity}</td>
                      <td>{formatCurrency(cat.category_value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="report-section">
              <h2>Top Value Items</h2>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport.top_value_items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.item_name}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unit_price)}</td>
                      <td><strong>{formatCurrency(item.total_value)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && jobsReport && (
          <div className="report-content">
            <div className="report-section">
              <h2>Jobs Summary</h2>
              <div className="summary-stats">
                <div className="summary-item">
                  <span className="summary-label">Total Jobs</span>
                  <span className="summary-value">{jobsReport.total_jobs}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Active Jobs</span>
                  <span className="summary-value">{jobsReport.active_jobs}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Completed</span>
                  <span className="summary-value success">{jobsReport.completed_jobs}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Value</span>
                  <span className="summary-value">{formatCurrency(jobsReport.total_estimated_value)}</span>
                </div>
              </div>
            </div>

            <div className="report-section">
              <h2>Recent Completions</h2>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Job Name</th>
                    <th>Customer</th>
                    <th>Value</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {jobsReport.recent_completions.map((job, idx) => (
                    <tr key={idx}>
                      <td>{job.job_name}</td>
                      <td>{job.customer_name}</td>
                      <td>{formatCurrency(job.total_estimated_cost)}</td>
                      <td>{job.end_date ? new Date(job.end_date).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && customersReport && (
          <div className="report-content">
            <div className="report-section">
              <h2>Customer Summary</h2>
              <div className="summary-stats">
                <div className="summary-item">
                  <span className="summary-label">Total Customers</span>
                  <span className="summary-value">{customersReport.total_customers}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">With Active Jobs</span>
                  <span className="summary-value">{customersReport.customers_with_jobs}</span>
                </div>
              </div>
            </div>

            <div className="report-section">
              <h2>Top Customers</h2>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Jobs</th>
                    <th>Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {customersReport.top_customers.map((customer) => (
                    <tr key={customer.id}>
                      <td><strong>{customer.name}</strong></td>
                      <td>{customer.phone || 'N/A'}</td>
                      <td>{customer.job_count}</td>
                      <td>{formatCurrency(customer.total_spent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Reports;
