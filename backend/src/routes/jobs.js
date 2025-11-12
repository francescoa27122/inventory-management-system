const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const socketManager = require('../websocket/socketManager');
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

    // Add total cost to each job
    jobs.forEach(job => {
      const items = db.prepare(`
        SELECT quantity_used, unit_price_at_time
        FROM job_items
        WHERE job_id = ?
      `).all(job.id);

      job.total_cost = items.reduce((sum, item) => {
        return sum + (item.quantity_used * item.unit_price_at_time);
      }, 0);
    });

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

    // Broadcast the new job to all connected clients
    socketManager.broadcastJobUpdate('created', newJob);

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

    // Broadcast the update to all connected clients
    socketManager.broadcastJobUpdate('updated', updatedJob);

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
    // Get the job before deleting
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // First delete all job items
    db.prepare('DELETE FROM job_items WHERE job_id = ?').run(req.params.id);
    
    // Then delete the job
    db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id);

    // Broadcast the deletion to all connected clients
    socketManager.broadcastJobUpdate('deleted', job);

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

// Add items to job with status tracking
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
        job_id, inventory_item_id, quantity_used, unit_price_at_time, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const addedItems = [];

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        const inventoryItem = db.prepare('SELECT unit_price FROM inventory_items WHERE id = ?').get(item.item_id);
        
        if (inventoryItem) {
          const result = insert.run(
            req.params.id,
            item.item_id,
            item.quantity_used,
            inventoryItem.unit_price,
            item.status || 'ordered',
            item.notes || null
          );

          const newItem = db.prepare('SELECT * FROM job_items WHERE id = ?').get(result.lastInsertRowid);
          addedItems.push(newItem);
        }
      }
    });

    insertMany(items);

    // Broadcast each added item
    addedItems.forEach(item => {
      socketManager.broadcastJobItemUpdate(req.params.id, 'added', item);
    });

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

// Update item status in job
router.patch('/:jobId/items/:itemId/status', authenticateToken, (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const update = db.prepare(`
      UPDATE job_items 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND job_id = ?
    `);

    const result = update.run(status, req.params.itemId, req.params.jobId);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in job'
      });
    }

    const updatedItem = db.prepare('SELECT * FROM job_items WHERE id = ?').get(req.params.itemId);

    // Broadcast the item update
    socketManager.broadcastJobItemUpdate(req.params.jobId, 'updated', updatedItem);

    res.json({
      success: true,
      message: 'Item status updated successfully'
    });
  } catch (error) {
    console.error('Update item status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating item status'
    });
  }
});

// Remove item from job
router.delete('/:jobId/items/:itemId', authenticateToken, (req, res) => {
  try {
    // Get the item before deleting
    const item = db.prepare('SELECT * FROM job_items WHERE id = ? AND job_id = ?').get(
      req.params.itemId,
      req.params.jobId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in job'
      });
    }

    db.prepare('DELETE FROM job_items WHERE id = ? AND job_id = ?').run(
      req.params.itemId,
      req.params.jobId
    );

    // Broadcast the item removal
    socketManager.broadcastJobItemUpdate(req.params.jobId, 'removed', item);

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
