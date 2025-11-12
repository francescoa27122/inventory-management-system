const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { logActivity, ACTION_TYPES, ENTITY_TYPES } = require('../middleware/activityLogger');
const router = express.Router();

// Get all customers
router.get('/', authenticateToken, (req, res) => {
  try {
    const { search, sortBy = 'name', order = 'ASC' } = req.query;
    
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY ${sortBy} ${order}`;

    const customers = db.prepare(query).all(...params);

    // Get job count for each customer
    const customersWithJobCount = customers.map(customer => {
      const jobCount = db.prepare('SELECT COUNT(*) as count FROM jobs WHERE customer_id = ?')
        .get(customer.id);
      return {
        ...customer,
        job_count: jobCount.count
      };
    });

    res.json({ success: true, customers: customersWithJobCount });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Error fetching customers' });
  }
});

// Get customer by ID with jobs
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Get customer's jobs
    const jobs = db.prepare(`
      SELECT j.*, 
             (SELECT COUNT(*) FROM job_items WHERE job_id = j.id) as item_count
      FROM jobs j
      WHERE j.customer_id = ?
      ORDER BY j.created_at DESC
    `).all(id);

    res.json({ success: true, customer: { ...customer, jobs } });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ success: false, message: 'Error fetching customer' });
  }
});

// Create new customer
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, email, phone, address, city, state, zip, notes } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }

    const insert = db.prepare(`
      INSERT INTO customers (name, email, phone, address, city, state, zip, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(name, email, phone, address, city, state, zip, notes, req.user.id);

    // Log activity
    logActivity(
      req,
      ACTION_TYPES.CREATE,
      ENTITY_TYPES.CUSTOMER,
      result.lastInsertRowid,
      name,
      `Created customer: ${name}`
    );

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer: { id: result.lastInsertRowid, name, email, phone }
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ success: false, message: 'Error creating customer' });
  }
});

// Update customer
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, city, state, zip, notes } = req.body;

    // Get old values for logging
    const oldCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    
    if (!oldCustomer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const update = db.prepare(`
      UPDATE customers 
      SET name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zip = ?, notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    update.run(name, email, phone, address, city, state, zip, notes, id);

    // Log activity
    logActivity(
      req,
      ACTION_TYPES.UPDATE,
      ENTITY_TYPES.CUSTOMER,
      id,
      name,
      `Updated customer: ${name}`,
      oldCustomer,
      { name, email, phone, address, city, state, zip, notes }
    );

    res.json({ success: true, message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ success: false, message: 'Error updating customer' });
  }
});

// Delete customer
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Check if customer has jobs
    const jobCount = db.prepare('SELECT COUNT(*) as count FROM jobs WHERE customer_id = ?').get(id);
    
    if (jobCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customer with ${jobCount.count} associated job(s). Please remove or reassign jobs first.`
      });
    }

    db.prepare('DELETE FROM customers WHERE id = ?').run(id);

    // Log activity
    logActivity(
      req,
      ACTION_TYPES.DELETE,
      ENTITY_TYPES.CUSTOMER,
      id,
      customer.name,
      `Deleted customer: ${customer.name}`
    );

    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ success: false, message: 'Error deleting customer' });
  }
});

module.exports = router;
