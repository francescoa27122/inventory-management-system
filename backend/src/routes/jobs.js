const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all jobs
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, customer } = req.query;

    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (customer) {
      query += ' AND customer_name LIKE ?';
      params.push(`%${customer}%`);
    }

    query += ' ORDER BY created_at DESC';

    const jobs = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs'
    });
  }
});

// Get single job with items
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const items = db.prepare(`
      SELECT ji.*, ii.item_name, ii.category, ii.supplier
      FROM job_items ji
      JOIN inventory_items ii ON ji.inventory_item_id = ii.id
      WHERE ji.job_id = ?
    `).all(req.params.id);

    const total_cost = items.reduce((sum, item) => {
      return sum + (item.quantity_used * item.unit_price_at_time);
    }, 0);

    res.json({
      success: true,
      data: {
        ...job,
        items,
        total_cost
      }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job'
    });
  }
});

// Create new job
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      job_name,
      customer_name,
      customer_contact,
      description,
      start_date
    } = req.body;

    if (!job_name) {
      return res.status(400).json({
        success: false,
        message: 'Job name is required'
      });
    }

    const insert = db.prepare(`
      INSERT INTO jobs (
        job_name, customer_name, customer_contact, description, start_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      job_name,
      customer_name,
      customer_contact,
      description,
      start_date,
      req.user.id
    );

    const newJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: newJob
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job'
    });
  }
});

// Update job
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const {
      job_name,
      customer_name,
      customer_contact,
      status,
      start_date,
      end_date,
      description
    } = req.body;

    const update = db.prepare(`
      UPDATE jobs SET
        job_name = COALESCE(?, job_name),
        customer_name = COALESCE(?, customer_name),
        customer_contact = COALESCE(?, customer_contact),
        status = COALESCE(?, status),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        description = COALESCE(?, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = update.run(
      job_name,
      customer_name,
      customer_contact,
      status,
      start_date,
      end_date,
      description,
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const updatedJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job'
    });
  }
});

// Delete job
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job'
    });
  }
});

// Add items to job
router.post('/:id/items', authenticateToken, (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    const insert = db.prepare(`
      INSERT INTO job_items (
        job_id, inventory_item_id, quantity_used, unit_price_at_time, notes
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        const inventoryItem = db.prepare('SELECT unit_price FROM inventory_items WHERE id = ?').get(item.inventory_item_id);
        
        if (inventoryItem) {
          insert.run(
            req.params.id,
            item.inventory_item_id,
            item.quantity_used,
            inventoryItem.unit_price,
            item.notes || null
          );
        }
      }
    });

    insertMany(items);

    res.json({
      success: true,
      message: 'Items added to job successfully'
    });
  } catch (error) {
    console.error('Add items to job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding items to job'
    });
  }
});

// Remove item from job
router.delete('/:jobId/items/:itemId', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM job_items WHERE id = ? AND job_id = ?').run(
      req.params.itemId,
      req.params.jobId
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in job'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from job successfully'
    });
  } catch (error) {
    console.error('Remove item from job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from job'
    });
  }
});

module.exports = router;
