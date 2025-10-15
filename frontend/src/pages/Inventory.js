import React, { useState, useEffect } from 'react';
import { Search, Plus, Upload, Edit2, Trash2, X } from 'lucide-react';
import Navigation from '../components/Navigation';
import { inventoryService } from '../services/api';
import './Inventory.css';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    category: '',
    quantity: '',
    unit_price: '',
    supplier: '',
    supplier_contact: '',
    location: '',
    sku: '',
    minimum_stock: '',
    notes: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getAll({ limit: 1000 });
      setItems(response.data.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.create({
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        unit_price: parseFloat(formData.unit_price) || 0,
        minimum_stock: parseInt(formData.minimum_stock) || 0
      });
      alert('Item added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
      alert(error.response?.data?.message || 'Failed to add item');
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.update(editingItem.id, {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        unit_price: parseFloat(formData.unit_price) || 0,
        minimum_stock: parseInt(formData.minimum_stock) || 0
      });
      alert('Item updated successfully!');
      setShowEditModal(false);
      setEditingItem(null);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      alert(error.response?.data?.message || 'Failed to update item');
    }
  };

  const handleDeleteItem = async (id, itemName) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      try {
        await inventoryService.delete(id);
        alert('Item deleted successfully!');
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name || '',
      description: item.description || '',
      category: item.category || '',
      quantity: item.quantity || '',
      unit_price: item.unit_price || '',
      supplier: item.supplier || '',
      supplier_contact: item.supplier_contact || '',
      location: item.location || '',
      sku: item.sku || '',
      minimum_stock: item.minimum_stock || '',
      notes: item.notes || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      item_name: '',
      description: '',
      category: '',
      quantity: '',
      unit_price: '',
      supplier: '',
      supplier_contact: '',
      location: '',
      sku: '',
      minimum_stock: '',
      notes: ''
    });
  };

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await inventoryService.import(file);
      const stats = response.data.stats;
      alert(`Import completed!\nSuccessful: ${stats.successful}\nFailed: ${stats.failed}`);
      setShowImportModal(false);
      fetchItems();
    } catch (error) {
      console.error('Error importing file:', error);
      alert(error.response?.data?.message || 'Failed to import file');
    }
  };

  const filteredItems = items.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="page-container">
          <div className="loading">Loading inventory...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title">All Inventory</h2>
          <div className="header-actions">
            <button className="btn btn-success" onClick={() => setShowImportModal(true)}>
              <Upload size={18} />
              Import Excel
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              Add Item
            </button>
          </div>
        </div>

        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, category, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Supplier</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    {searchTerm ? 'No items found matching your search' : 'No inventory items yet'}
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id}>
                    <td className="item-name">{item.item_name}</td>
                    <td>{item.category || '-'}</td>
                    <td>{item.quantity}</td>
                    <td>${item.unit_price.toFixed(2)}</td>
                    <td>{item.supplier || '-'}</td>
                    <td>{item.location || '-'}</td>
                    <td className="actions-cell">
                      <button 
                        className="icon-btn edit"
                        onClick={() => openEditModal(item)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="icon-btn delete"
                        onClick={() => handleDeleteItem(item.id, item.item_name)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add New Item</h3>
                <button className="close-btn" onClick={() => setShowAddModal(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-form" onSubmit={handleAddItem}>
                <div className="form-row">
                  <div className="form-field">
                    <label>Item Name *</label>
                    <input
                      type="text"
                      name="item_name"
                      value={formData.item_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Category</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Unit Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="unit_price"
                      value={formData.unit_price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Supplier</label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" onClick={handleAddItem}>
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit Item</h3>
                <button className="close-btn" onClick={() => setShowEditModal(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-form" onSubmit={handleEditItem}>
                <div className="form-row">
                  <div className="form-field">
                    <label>Item Name *</label>
                    <input
                      type="text"
                      name="item_name"
                      value={formData.item_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Category</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Unit Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="unit_price"
                      value={formData.unit_price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Supplier</label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" onClick={handleEditItem}>
                    Update Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
            <div className="modal small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Import from Excel</h3>
                <button className="close-btn" onClick={() => setShowImportModal(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-body">
                <p>Upload an Excel file (.xlsx, .xls) or CSV file with your inventory data.</p>
                <p className="help-text">Required columns: Item Name, Quantity, Unit Price</p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportFile}
                  className="file-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
