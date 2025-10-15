import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { inventoryService } from '../services/api';
import './Compare.css';

const Compare = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await inventoryService.getAll({ limit: 1000 });
      setItems(response.data.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleCompare = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to compare');
      return;
    }

    try {
      const response = await inventoryService.compare(selectedItems);
      setComparison(response.data);
    } catch (error) {
      console.error('Error comparing items:', error);
      alert('Failed to compare items');
    }
  };

  const clearComparison = () => {
    setComparison(null);
    setSelectedItems([]);
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="page-container">
          <div className="loading">Loading items...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="page-container">
        <h2 className="page-title">Price Comparison</h2>

        <div className="compare-section">
          <div className="selection-panel">
            <h3 className="section-subtitle">Select Items to Compare</h3>
            <div className="items-list">
              {items.map(item => (
                <label key={item.id} className="item-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                  />
                  <div className="item-info">
                    <span className="item-label">{item.item_name}</span>
                    <span className="item-price">${item.unit_price.toFixed(2)}</span>
                  </div>
                </label>
              ))}
            </div>
            <div className="compare-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleCompare}
                disabled={selectedItems.length === 0}
              >
                Compare Selected ({selectedItems.length})
              </button>
              {selectedItems.length > 0 && (
                <button className="btn btn-secondary" onClick={clearComparison}>
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          {comparison && (
            <div className="results-panel">
              <div className="results-header">
                <h3 className="section-subtitle">Comparison Results</h3>
                <button className="btn btn-secondary" onClick={clearComparison}>
                  Clear
                </button>
              </div>

              <div className="summary-cards">
                <div className="summary-card">
                  <p className="summary-label">Lowest Price</p>
                  <p className="summary-value">${comparison.summary.lowest_price.price.toFixed(2)}</p>
                </div>
                <div className="summary-card">
                  <p className="summary-label">Highest Price</p>
                  <p className="summary-value">${comparison.summary.highest_price.price.toFixed(2)}</p>
                </div>
                <div className="summary-card">
                  <p className="summary-label">Average Price</p>
                  <p className="summary-value">${comparison.summary.average_price.toFixed(2)}</p>
                </div>
              </div>

              <div className="comparison-grid">
                {comparison.comparison.map(item => (
                  <div key={item.id} className="comparison-card">
                    <h4 className="comparison-item-name">{item.item_name}</h4>
                    <div className="comparison-details">
                      <div className="detail-row">
                        <span className="detail-label">Unit Price:</span>
                        <span className="detail-value">${item.unit_price.toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Category:</span>
                        <span className="detail-value">{item.category || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Supplier:</span>
                        <span className="detail-value">{item.supplier || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">In Stock:</span>
                        <span className="detail-value">{item.quantity}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Total Value:</span>
                        <span className="detail-value bold">${item.total_value.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compare;
