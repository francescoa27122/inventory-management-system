import React, { useState, useEffect } from 'react';
import { Plus, X, Eye, Trash2, Package, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import Navigation from '../components/Navigation';
import { jobsService, inventoryService } from '../services/api';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddPartsModal, setShowAddPartsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    job_name: '',
    customer_name: '',
    customer_contact: '',
    description: '',
    start_date: ''
  });
  const [partForm, setPartForm] = useState({
    item_id: '',
    quantity: 1,
    status: 'ordered'
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

  const handlePartFormChange = (e) => {
    const { name, value } = e.target;
    setPartForm(prev => ({
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

  const handleDeleteJob = async (jobId, jobName) => {
    if (window.confirm(`Are you sure you want to delete "${jobName}"? This action cannot be undone.`)) {
      try {
        await jobsService.delete(jobId);
        alert('Job deleted successfully!');
        fetchJobs();
        if (showDetailsModal && selectedJob?.id === jobId) {
          setShowDetailsModal(false);
          setSelectedJob(null);
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job');
      }
    }
  };

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await jobsService.update(jobId, { status: newStatus });
      alert('Status updated successfully!');
      fetchJobs();
      if (selectedJob && selectedJob.id === jobId) {
        const response = await jobsService.getById(jobId);
        setSelectedJob(response.data.data);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleAddParts = () => {
    setShowAddPartsModal(true);
  };

  const handleAddPartToJob = async (e) => {
    e.preventDefault();
    try {
      await jobsService.addItems(selectedJob.id, [{
        item_id: parseInt(partForm.item_id),
        quantity_used: parseInt(partForm.quantity),
        status: partForm.status
      }]);
      alert('Part added successfully!');
      setShowAddPartsModal(false);
      setPartForm({ item_id: '', quantity: 1, status: 'ordered' });
      const response = await jobsService.getById(selectedJob.id);
      setSelectedJob(response.data.data);
      fetchJobs();
    } catch (error) {
      console.error('Error adding part:', error);
      alert('Failed to add part to job');
    }
  };

  const handleRemovePart = async (itemId) => {
    if (window.confirm('Remove this part from the job?')) {
      try {
        await jobsService.removeItem(selectedJob.id, itemId);
        alert('Part removed successfully!');
        const response = await jobsService.getById(selectedJob.id);
        setSelectedJob(response.data.data);
        fetchJobs();
      } catch (error) {
        console.error('Error removing part:', error);
        alert('Failed to remove part');
      }
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    // In a real implementation, you'd upload to your backend
    // For now, we'll simulate it
    alert(`File "${selectedFile.name}" uploaded successfully! (Simulated - implement backend storage)`);
    setShowUploadModal(false);
    setSelectedFile(null);
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

  const getPartStatusBadge = (status) => {
    switch (status) {
      case 'ordered':
        return <span className="part-status-badge ordered">Ordered</span>;
      case 'ordering':
        return <span className="part-status-badge ordering">Ordering...</span>;
      case 'received':
        return <span className="part-status-badge received">Received</span>;
      default:
        return <span className="part-status-badge">{status}</span>;
    }
  };

  const currentJobs = jobs.filter(job => job.status === 'active' || job.status === 'cancelled');
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const displayedJobs = activeTab === 'current' ? currentJobs : completedJobs;

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

        <div className="section-tabs">
          <button 
            className={`tab ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            Current Jobs ({currentJobs.length})
          </button>
          <button 
            className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed Jobs ({completedJobs.length})
          </button>
        </div>

        <div className="jobs-grid">
          {displayedJobs.length === 0 ? (
            <div className="empty-message">
              {activeTab === 'current' ? 'No current jobs' : 'No completed jobs'}
            </div>
          ) : (
            displayedJobs.map(job => (
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
                  {job.total_cost > 0 && (
                    <p className="job-cost">
                      <strong>Total Cost:</strong> ${job.total_cost.toFixed(2)}
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
                  <button 
                    className="btn btn-danger btn-small"
                    onClick={() => handleDeleteJob(job.id, job.job_name)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
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
              <form className="modal-form" onSubmit={handleCreateJob}>
                <div className="form-field">
                  <label>Job Name *</label>
                  <input
                    type="text"
                    name="job_name"
                    value={formData.job_name}
                    onChange={handleInputChange}
                    placeholder="e.g., BMW 5 Series Repair"
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
                  <button type="submit" className="btn btn-primary">
                    Create Job
                  </button>
                </div>
              </form>
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
                  <div className="section-header">
                    <h4>Parts Used</h4>
                    <button className="btn btn-primary btn-small" onClick={handleAddParts}>
                      <Package size={16} />
                      Add Parts
                    </button>
                  </div>
                  {selectedJob.items && selectedJob.items.length > 0 ? (
                    <div className="parts-list">
                      {selectedJob.items.map((item, index) => (
                        <div key={index} className="part-item">
                          <div className="part-details">
                            <div className="part-info">
                              <span className="part-name">{item.item_name}</span>
                              <span className="part-category">{item.category}</span>
                            </div>
                            {getPartStatusBadge(item.status || 'ordered')}
                          </div>
                          <div className="part-actions">
                            <div className="part-pricing">
                              <span>{item.quantity_used} × ${item.unit_price_at_time.toFixed(2)}</span>
                              <strong>${(item.quantity_used * item.unit_price_at_time).toFixed(2)}</strong>
                            </div>
                            <button 
                              className="icon-btn delete"
                              onClick={() => handleRemovePart(item.id)}
                              title="Remove part"
                            >
                              <Trash2 size={16} />
                            </button>
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

                <div className="files-section">
                  <div className="section-header">
                    <h4>Documents & Images</h4>
                    <button className="btn btn-secondary btn-small" onClick={() => setShowUploadModal(true)}>
                      <Upload size={16} />
                      Upload File
                    </button>
                  </div>
                  <p className="empty-message">No files uploaded yet</p>
                </div>

                <div className="modal-actions">
                  {selectedJob.status === 'active' && (
                    <>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleUpdateStatus(selectedJob.id, 'completed')}
                      >
                        Mark as Completed
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleUpdateStatus(selectedJob.id, 'cancelled')}
                      >
                        Cancel Job
                      </button>
                    </>
                  )}
                  {selectedJob.status === 'completed' && (
                    <button 
                      className="btn btn-warning"
                      onClick={() => handleUpdateStatus(selectedJob.id, 'active')}
                    >
                      Reopen Job
                    </button>
                  )}
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleDeleteJob(selectedJob.id, selectedJob.job_name);
                    }}
                  >
                    <Trash2 size={16} />
                    Delete Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Parts Modal */}
        {showAddPartsModal && (
          <div className="modal-overlay" onClick={() => setShowAddPartsModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Part to Job</h3>
                <button className="close-btn" onClick={() => setShowAddPartsModal(false)}>
                  <X size={24} />
                </button>
              </div>
              <form className="modal-form" onSubmit={handleAddPartToJob}>
                <div className="form-field">
                  <label>Select Part *</label>
                  <select
                    name="item_id"
                    value={partForm.item_id}
                    onChange={handlePartFormChange}
                    required
                  >
                    <option value="">Choose a part...</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.item_name} - ${item.unit_price.toFixed(2)} ({item.quantity} in stock)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={partForm.quantity}
                      onChange={handlePartFormChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Status *</label>
                    <select
                      name="status"
                      value={partForm.status}
                      onChange={handlePartFormChange}
                      required
                    >
                      <option value="ordered">Ordered</option>
                      <option value="ordering">Ordering in Progress</option>
                      <option value="received">Received</option>
                    </select>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddPartsModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Part
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upload File Modal */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Upload Document</h3>
                <button className="close-btn" onClick={() => setShowUploadModal(false)}>
                  <X size={24} />
                </button>
              </div>
              <form className="modal-form" onSubmit={handleFileUpload}>
                <div className="form-field">
                  <label>Select File</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileSelect}
                    className="file-input"
                  />
                  <p className="help-text">
                    Accepted: Images, PDFs, Word documents
                  </p>
                  {selectedFile && (
                    <div className="file-preview">
                      <FileText size={20} />
                      <span>{selectedFile.name}</span>
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
