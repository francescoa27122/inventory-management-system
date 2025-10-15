import React, { useState, useEffect } from 'react';
import { Plus, X, Eye } from 'lucide-react';
import Navigation from '../components/Navigation';
import { jobsService, inventoryService } from '../services/api';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    job_name: '',
    customer_name: '',
    customer_contact: '',
    description: '',
    start_date: ''
  });

  useEffect(() => {
    fetchJobs();
    fetchItems();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobsService.getAll();
      setJobs(response.data.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await inventoryService.getAll({ limit: 1000 });
      setItems(response.data.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await jobsService.create(formData);
      alert('Job created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job');
    }
  };

  const handleViewDetails = async (jobId) => {
    try {
      const response = await jobsService.getById(jobId);
      setSelectedJob(response.data.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching job details:', error);
      alert('Failed to load job details');
    }
  };

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await jobsService.update(jobId, { status: newStatus });
      alert('Status updated successfully!');
      fetchJobs();
      if (selectedJob && selectedJob.id === jobId) {
        setShowDetailsModal(false);
        setSelectedJob(null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      job_name: '',
      customer_name: '',
      customer_contact: '',
      description: '',
      start_date: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="page-container">
          <div className="loading">Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title">Jobs Management</h2>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            Create Job
          </button>
        </div>

        <div className="jobs-grid">
          {jobs.length === 0 ? (
            <div className="empty-message">No jobs created yet</div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h3 className="job-title">{job.job_name}</h3>
                  <span className={`status-badge ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                <div className="job-details">
                  <p className="job-customer">
                    <strong>Customer:</strong> {job.customer_name || 'N/A'}
                  </p>
                  {job.customer_contact && (
                    <p className="job-contact">
                      <strong>Contact:</strong> {job.customer_contact}
                    </p>
                  )}
                  {job.start_date && (
                    <p className="job-date">
                      <strong>Start Date:</strong> {new Date(job.start_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="job-actions">
                  <button 
                    className="btn btn-secondary btn-small"
                    onClick={() => handleViewDetails(job.id)}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  {job.status === 'active' && (
                    <button 
                      className="btn btn-success btn-small"
                      onClick={() => handleUpdateStatus(job.id, 'completed')}
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Job Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Create New Job</h3>
                <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-form" onSubmit={handleCreateJob}>
                <div className="form-field">
                  <label>Job Name *</label>
                  <input
                    type="text"
                    name="job_name"
                    value={formData.job_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Kitchen Renovation"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Customer Name</label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>Customer Contact</label>
                    <input
                      type="text"
                      name="customer_contact"
                      value={formData.customer_contact}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Job details and requirements..."
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" onClick={handleCreateJob}>
                    Create Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Job Details Modal */}
        {showDetailsModal && selectedJob && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{selectedJob.job_name}</h3>
                <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-body">
                <div className="job-info-section">
                  <h4>Job Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Status:</span>
                      <span className={`status-badge ${getStatusColor(selectedJob.status)}`}>
                        {selectedJob.status}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Customer:</span>
                      <span>{selectedJob.customer_name || 'N/A'}</span>
                    </div>
                    {selectedJob.customer_contact && (
                      <div className="info-item">
                        <span className="info-label">Contact:</span>
                        <span>{selectedJob.customer_contact}</span>
                      </div>
                    )}
                    {selectedJob.start_date && (
                      <div className="info-item">
                        <span className="info-label">Start Date:</span>
                        <span>{new Date(selectedJob.start_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  {selectedJob.description && (
                    <div className="description-section">
                      <strong>Description:</strong>
                      <p>{selectedJob.description}</p>
                    </div>
                  )}
                </div>

                <div className="parts-section">
                  <h4>Parts Used</h4>
                  {selectedJob.items && selectedJob.items.length > 0 ? (
                    <div className="parts-list">
                      {selectedJob.items.map((item, index) => (
                        <div key={index} className="part-item">
                          <div className="part-details">
                            <span className="part-name">{item.item_name}</span>
                            <span className="part-category">{item.category}</span>
                          </div>
                          <div className="part-pricing">
                            <span>{item.quantity_used} × ${item.unit_price_at_time.toFixed(2)}</span>
                            <strong>${(item.quantity_used * item.unit_price_at_time).toFixed(2)}</strong>
                          </div>
                        </div>
                      ))}
                      <div className="total-cost">
                        <strong>Total Cost:</strong>
                        <strong className="total-amount">${selectedJob.total_cost.toFixed(2)}</strong>
                      </div>
                    </div>
                  ) : (
                    <p className="empty-message">No parts assigned to this job yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
