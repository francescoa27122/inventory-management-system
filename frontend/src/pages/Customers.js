import React, { useState, useEffect } from 'react';
import { customersService } from '../services/api';
import Navigation from '../components/Navigation';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../hooks/useConfirm';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: ''
  });

  const { showSuccess, showError } = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customersService.getAll();
      if (response.data.success) {
        setCustomers(response.data.customers);
      }
    } catch (err) {
      showError('Failed to fetch customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const response = await customersService.create(formData);
      if (response.data.success) {
        showSuccess('Customer added successfully!');
        setShowAddModal(false);
        resetForm();
        fetchCustomers();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add customer');
    }
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    try {
      const response = await customersService.update(selectedCustomer.id, formData);
      if (response.data.success) {
        showSuccess('Customer updated successfully!');
        setShowEditModal(false);
        setSelectedCustomer(null);
        resetForm();
        fetchCustomers();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update customer');
    }
  };

  const handleDeleteCustomer = async (customer) => {
    const confirmed = await confirm(`Are you sure you want to delete ${customer.name}?`);
    if (!confirmed) return;
    
    try {
      const response = await customersService.delete(customer.id);
      if (response.data.success) {
        showSuccess('Customer deleted successfully!');
        fetchCustomers();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zip: customer.zip || '',
      notes: customer.notes || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      notes: ''
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading">Loading customers...</div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="customers-page">
        <div className="header">
          <h1>Customers</h1>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            + Add Customer
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="customers-grid">
          {filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <p>No customers found</p>
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <div key={customer.id} className="customer-card">
                <div className="customer-header">
                  <h3>{customer.name}</h3>
                  <span className="job-count">{customer.job_count} jobs</span>
                </div>
                <div className="customer-details">
                  {customer.phone && (
                    <div className="detail-row">
                      <span className="label">Phone:</span>
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="detail-row">
                      <span className="label">Address:</span>
                      <span>{customer.address}</span>
                    </div>
                  )}
                </div>
                <div className="customer-actions">
                  <button className="btn-small" onClick={() => openEditModal(customer)}>
                    Edit
                  </button>
                  <button 
                    className="btn-small btn-danger" 
                    onClick={() => handleDeleteCustomer(customer)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Add New Customer</h2>
              <form onSubmit={handleAddCustomer}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={e => setFormData({...formData, state: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>ZIP</label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={e => setFormData({...formData, zip: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {showEditModal && selectedCustomer && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Edit Customer</h2>
              <form onSubmit={handleEditCustomer}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={e => setFormData({...formData, state: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>ZIP</label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={e => setFormData({...formData, zip: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Update Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Customers;
