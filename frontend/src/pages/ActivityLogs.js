import React, { useState, useEffect } from 'react';
import { activityLogsService } from '../services/api';
import Navigation from '../components/Navigation';
import './ActivityLogs.css';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    action_type: '',
    entity_type: '',
    user_id: ''
  });

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      const params = {};
      if (filter.action_type) params.action_type = filter.action_type;
      if (filter.entity_type) params.entity_type = filter.entity_type;
      if (filter.user_id) params.user_id = filter.user_id;

      const response = await activityLogsService.getAll(params);
      if (response.data.success) {
        setLogs(response.data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await activityLogsService.getStats();
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: '#28a745',
      UPDATE: '#17a2b8',
      DELETE: '#dc3545',
      LOGIN: '#6f42c1',
      VIEW: '#6c757d'
    };
    return colors[action] || '#6c757d';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading">Loading activity logs...</div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="activity-logs-page">
        <h1>Activity Logs</h1>

        {/* Stats Overview */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Actions</div>
              <div className="stat-value">{stats.total_actions}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Today</div>
              <div className="stat-value">{stats.today_actions}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Most Active User</div>
              <div className="stat-value-small">
                {stats.actions_by_user[0]?.username || 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters">
          <select
            value={filter.action_type}
            onChange={(e) => setFilter({ ...filter, action_type: e.target.value })}
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="VIEW">View</option>
          </select>

          <select
            value={filter.entity_type}
            onChange={(e) => setFilter({ ...filter, entity_type: e.target.value })}
          >
            <option value="">All Entities</option>
            <option value="INVENTORY">Inventory</option>
            <option value="JOB">Job</option>
            <option value="CUSTOMER">Customer</option>
            <option value="USER">User</option>
          </select>
        </div>

        {/* Activity Timeline */}
        <div className="activity-timeline">
          {logs.length === 0 ? (
            <div className="empty-state">
              <p>No activity logs found</p>
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="activity-item">
                <div 
                  className="activity-badge"
                  style={{ backgroundColor: getActionColor(log.action_type) }}
                >
                  {log.action_type}
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-user">{log.username}</span>
                    <span className="activity-entity">{log.entity_type}</span>
                  </div>
                  <div className="activity-description">{log.description}</div>
                  {log.entity_name && (
                    <div className="activity-target">
                      Target: <strong>{log.entity_name}</strong>
                    </div>
                  )}
                  <div className="activity-time">{formatDate(log.created_at)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ActivityLogs;
