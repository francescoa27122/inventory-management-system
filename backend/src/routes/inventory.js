const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed'));
    }
  }
});

// Get all inventory items with filtering and pagination
router.get('/', authenticateToken, (req, res) => {
  try {
    const { search, category, section, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM inventory_items WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (item_name LIKE ? OR category LIKE ? OR supplier LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (section) {
      query += ' AND section = ?';
      params.push(section);
    }

    query += ' ORDER BY item_name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const items = db.prepare(query).all(...params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM inventory_items WHERE 1=1';
    const countParams = [];

    if (search) {
      countQuery += ' AND (item_name LIKE ? OR category LIKE ? OR supplier LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    if (section) {
      countQuery += ' AND section = ?';
      countParams.push(section);
    }

    const totalCount = db.prepare(countQuery).get(...countParams).count;

    res.json({
      success: true,
      data: items,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory'
    });
  }
});

// Get single item
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching item'
    });
  }
});

// Add new item
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      item_name,
      description,
      category,
      quantity,
      unit_price,
      supplier,
      supplier_contact,
      location,
      sku,
      minimum_stock,
      notes,
      section
    } = req.body;

    if (!item_name || quantity === undefined || unit_price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Item name, quantity, and unit price are required'
      });
    }

    const insert = db.prepare(`
      INSERT INTO inventory_items (
        item_name, description, category, quantity, unit_price,
        supplier, supplier_contact, location, sku, minimum_stock, notes, section, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      item_name, description, category, quantity, unit_price,
      supplier, supplier_contact, location, sku, minimum_stock || 0, notes, section || 'Main Shop', req.user.id
    );

    const newItem = db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Item added successfully',
      data: newItem
    });
  } catch (error) {
    console.error('Add item error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error adding item'
    });
  }
});

// Update item
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const {
      item_name,
      description,
      category,
      quantity,
      unit_price,
      supplier,
      supplier_contact,
      location,
      sku,
      minimum_stock,
      notes,
      section
    } = req.body;

    const update = db.prepare(`
      UPDATE inventory_items SET
        item_name = COALESCE(?, item_name),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        quantity = COALESCE(?, quantity),
        unit_price = COALESCE(?, unit_price),
        supplier = COALESCE(?, supplier),
        supplier_contact = COALESCE(?, supplier_contact),
        location = COALESCE(?, location),
        sku = COALESCE(?, sku),
        minimum_stock = COALESCE(?, minimum_stock),
        notes = COALESCE(?, notes),
        section = COALESCE(?, section),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = update.run(
      item_name, description, category, quantity, unit_price,
      supplier, supplier_contact, location, sku, minimum_stock, notes, section, req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const updatedItem = db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(req.params.id);

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating item'
    });
  }
});

// Delete item
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM inventory_items WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting item'
    });
  }
});

// Compare prices
router.post('/compare', authenticateToken, (req, res) => {
  try {
    const { item_ids } = req.body;

    if (!item_ids || !Array.isArray(item_ids) || item_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Item IDs array is required'
      });
    }

    const placeholders = item_ids.map(() => '?').join(',');
    const query = `SELECT * FROM inventory_items WHERE id IN (${placeholders})`;
    const items = db.prepare(query).all(...item_ids);

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No items found'
      });
    }

    const comparison = items.map(item => ({
      ...item,
      total_value: item.quantity * item.unit_price
    }));

    const prices = items.map(item => item.unit_price);
    const summary = {
      lowest_price: {
        item_id: items.reduce((min, item) => item.unit_price < min.unit_price ? item : min).id,
        price: Math.min(...prices)
      },
      highest_price: {
        item_id: items.reduce((max, item) => item.unit_price > max.unit_price ? item : max).id,
        price: Math.max(...prices)
      },
      average_price: prices.reduce((sum, price) => sum + price, 0) / prices.length
    };

    res.json({
      success: true,
      comparison,
      summary
    });
  } catch (error) {
    console.error('Compare error:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing items'
    });
  }
});

// Import from Excel
router.post('/import', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    let successful = 0;
    let failed = 0;
    const errors = [];

    const insert = db.prepare(`
      INSERT INTO inventory_items (
        item_name, description, category, quantity, unit_price,
        supplier, location, sku, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    data.forEach((row, index) => {
      try {
        const item_name = row['Item Name'] || row['item_name'] || row['Name'] || row['name'];
        const quantity = parseInt(row['Quantity'] || row['quantity'] || row['Qty'] || 0);
        const unit_price = parseFloat(row['Unit Price'] || row['unit_price'] || row['Price'] || row['price'] || 0);

        if (!item_name || !quantity || !unit_price) {
          failed++;
          errors.push({
            row: index + 2,
            error: 'Missing required fields: Item Name, Quantity, or Unit Price'
          });
          return;
        }

        insert.run(
          item_name,
          row['Description'] || row['description'] || '',
          row['Category'] || row['category'] || '',
          quantity,
          unit_price,
          row['Supplier'] || row['supplier'] || '',
          row['Location'] || row['location'] || '',
          row['SKU'] || row['sku'] || null,
          req.user.id
        );

        successful++;
      } catch (error) {
        failed++;
        errors.push({
          row: index + 2,
          error: error.message
        });
      }
    });

    // Log import
    db.prepare(`
      INSERT INTO import_logs (
        filename, imported_by, rows_processed, rows_successful, rows_failed, error_log, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.file.originalname,
      req.user.id,
      data.length,
      successful,
      failed,
      JSON.stringify(errors),
      failed === 0 ? 'success' : (successful > 0 ? 'partial' : 'failed')
    );

    res.json({
      success: true,
      message: 'Import completed',
      stats: {
        total_rows: data.length,
        successful,
        failed,
        errors
      }
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      success: false,
      message: 'Error importing file: ' + error.message
    });
  }
});

// Get categories
router.get('/meta/categories', authenticateToken, (req, res) => {
  try {
    const categories = db.prepare('SELECT DISTINCT category FROM inventory_items WHERE category IS NOT NULL AND category != "" ORDER BY category').all();
    res.json({
      success: true,
      data: categories.map(c => c.category)
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

module.exports = router;
