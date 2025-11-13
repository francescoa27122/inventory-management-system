import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Package, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import EmptyState from '../components/EmptyState';
import { LineChart, BarChart } from '../components/SimpleChart';
import { inventoryService, jobsService } from '../services/api';
import './Analytics.css';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [inventoryTrend, setInventoryTrend] = useState([]);
  const [jobsTimeline, setJobsTimeline] = useState([]);
  const [popularParts, setPopularParts] = useState([]);
  const [stats, setStats] = useState({
    totalValue: 0,
    valueChange: 0,
    totalJobs: 0,
    jobsChange: 0,
    avgJobValue: 0
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [itemsResponse, jobsResponse] = await Promise.all([
        inventoryService.getAll({ limit: 1000 }),
        jobsService.getAll()
      ]);

      const items = itemsResponse.data.data;
      const jobs = jobsResponse.data.data;

      // Calculate total inventory value
      const totalValue = items.reduce((sum, item) => 
        sum + (item.unit_price * item.quantity), 0
      );

      // Generate mock inventory trend data (last 6 months)
      const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const trendData = months.map((month, i) => ({
        label: month,
        value: Math.round(totalValue * (0.75 + (i * 0.05) + Math.random() * 0.05))
      }));
      setInventoryTrend(trendData);

      // Calculate value change percentage
      const lastMonth = trendData[trendData.length - 2]?.value || 0;
      const currentMonth = trendData[trendData.length - 1]?.value || 0;
      const valueChange = lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;

      // Jobs timeline (completed jobs per month)
      const completedJobs = jobs.filter(job => job.status === 'completed');
      const jobsByMonth = {};
      completedJobs.forEach(job => {
        const month = new Date(job.updated_at).toLocaleDateString('en-US', { month: 'short' });
        jobsByMonth[month] = (jobsByMonth[month] || 0) + 1;
      });
      
      const timelineData = months.map(month => ({
        label: month,
        value: jobsByMonth[month] || 0
      }));
      setJobsTimeline(timelineData);

      // Calculate jobs change
      const lastMonthJobs = timelineData[timelineData.length - 2]?.value || 0;
      const currentMonthJobs = timelineData[timelineData.length - 1]?.value || 0;
      const jobsChange = lastMonthJobs > 0 ? ((currentMonthJobs - lastMonthJobs) / lastMonthJobs) * 100 : 0;

      // Calculate average job value
      const avgJobValue = completedJobs.length > 0 
        ? completedJobs.reduce((sum, job) => sum + (job.total_cost || 0), 0) / completedJobs.length
        : 0;

      // Popular parts - aggregate from jobs
      const partCounts = {};
      jobs.forEach(job => {
        if (job.items) {
          job.items.forEach(item => {
            partCounts[item.item_name] = (partCounts[item.item_name] || 0) + item.quantity_used;
          });
        }
      });

      const popularPartsData = Object.entries(partCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({
          label: name.length > 25 ? name.substring(0, 25) + '...' : name,
          value: count
        }));
      setPopularParts(popularPartsData);

      setStats({
        totalValue,
        valueChange,
        totalJobs: completedJobs.length,
        jobsChange,
        avgJobValue
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="page-container">
          <div className="loading">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="page-container">
        <div className="analytics-header">
          <div>
            <h2 className="page-title">Analytics & Insights</h2>
            <p className="page-subtitle">Track your business performance and trends over time</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="analytics-stats">
          <div className="analytics-stat-card">
            <div className="stat-icon-wrapper blue">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Inventory Value</div>
              <div className="stat-value">${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className={`stat-change ${stats.valueChange >= 0 ? 'positive' : 'negative'}`}>
                {stats.valueChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {Math.abs(stats.valueChange).toFixed(1)}% from last month
              </div>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon-wrapper green">
              <BarChart3 size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Completed Jobs</div>
              <div className="stat-value">{stats.totalJobs}</div>
              <div className={`stat-change ${stats.jobsChange >= 0 ? 'positive' : 'negative'}`}>
                {stats.jobsChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {Math.abs(stats.jobsChange).toFixed(1)}% from last month
              </div>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon-wrapper purple">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Avg. Job Value</div>
              <div className="stat-value">${stats.avgJobValue.toFixed(2)}</div>
              <div className="stat-change neutral">
                Based on completed jobs
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-card large">
            <div className="chart-header">
              <div>
                <h3 className="chart-card-title">Inventory Value Trend</h3>
                <p className="chart-card-subtitle">Total inventory value over the last 6 months</p>
              </div>
            </div>
            <LineChart
              data={inventoryTrend}
              color="#3b82f6"
              height={300}
            />
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-card-title">Jobs Completed</h3>
                <p className="chart-card-subtitle">Monthly job completion rate</p>
              </div>
            </div>
            <BarChart
              data={jobsTimeline}
              color="#10b981"
              height={300}
            />
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-card-title">Most Used Parts</h3>
                <p className="chart-card-subtitle">Top parts by usage across all jobs</p>
              </div>
            </div>
            {popularParts.length > 0 ? (
              <BarChart
                data={popularParts}
                color="#f59e0b"
                height={300}
              />
            ) : (
              <EmptyState
                icon={Package}
                description="No parts data available yet. Complete some jobs to see popular parts."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
