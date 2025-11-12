const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Inventory reports
router.get('/inventory/summary', authenticateToken, (req, res) => {
  try {
    const summary = {
      total_items: db.prepare('SELECT COUNT(*) as count FROM inventory_items').get().count,
      total_value: db.prepare('SELECT SUM(quantity * unit_price) as value FROM inventory_items').get().value || 0,
      low_stock_count: db.prepare(`
        SELECT COUNT(*) as count FROM inventory_items 
        WHERE quantity <= minimum_stock AND minimum_stock > 0
      `).get().count,
      by_category: db.prepare(`
        SELECT category, COUNT(*) as item_count, SUM(quantity) as total_quantity, 
               SUM(quantity * unit_price) as category_value
        FROM inventory_items 
        GROUP BY category 
        ORDER BY category_value DESC
      `).all(),
      by_section: db.prepare(`
        SELECT location as section, COUNT(*) as item_count, 
               SUM(quantity * unit_price) as section_value
        FROM inventory_items 
        GROUP BY location
      `).all(),
      top_value_items: db.prepare(`
        SELECT item_name, category, quantity, unit_price, 
               (quantity * unit_price) as total_value
        FROM inventory_items 
        ORDER BY total_value DESC 
        LIMIT 10
      `).all()
    };

    res.json({ success: true, summary });
  } catch (error) {
    console.error('Error generating inventory summary:', error);
    res.status(500).json({ success: false, message: 'Error generating inventory summary' });
  }
});

// Job reports
router.get('/jobs/summary', authenticateToken, (req, res) => {
  try {
    const summary = {
      total_jobs: db.prepare('SELECT COUNT(*) as count FROM jobs').get().count,
      active_jobs: db.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'active'").get().count,
      completed_jobs: db.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'completed'").get().count,
      total_estimated_value: db.prepare('SELECT SUM(total_estimated_cost) as value FROM jobs').get().value || 0,
      jobs_by_status: db.prepare(`
        SELECT status, COUNT(*) as count, SUM(total_estimated_cost) as total_value
        FROM jobs 
        GROUP BY status
      `).all(),
      recent_completions: db.prepare(`
        SELECT job_name, customer_name, total_estimated_cost, end_date
        FROM jobs 
        WHERE status = 'completed'
        ORDER BY end_date DESC 
        LIMIT 10
      `).all(),
      jobs_with_most_parts: db.prepare(`
        SELECT j.id, j.job_name, j.customer_name, COUNT(ji.id) as part_count
        FROM jobs j
        LEFT JOIN job_items ji ON j.id = ji.job_id
        GROUP BY j.id
        ORDER BY part_count DESC
        LIMIT 10
      `).all()
    };

    res.json({ success: true, summary });
  } catch (error) {
    console.error('Error generating jobs summary:', error);
    res.status(500).json({ success: false, message: 'Error generating jobs summary' });
  }
});

// Customer reports
router.get('/customers/summary', authenticateToken, (req, res) => {
  try {
    const summary = {
      total_customers: db.prepare('SELECT COUNT(*) as count FROM customers').get().count,
      customers_with_jobs: db.prepare(`
        SELECT COUNT(DISTINCT customer_id) as count 
        FROM jobs 
        WHERE customer_id IS NOT NULL
      `).get().count,
      top_customers: db.prepare(`
        SELECT c.id, c.name, c.phone, c.email,
               COUNT(j.id) as job_count,
               SUM(j.total_estimated_cost) as total_spent
        FROM customers c
        LEFT JOIN jobs j ON c.id = j.customer_id
        GROUP BY c.id
        ORDER BY job_count DESC
        LIMIT 10
      `).all(),
      recent_customers: db.prepare(`
        SELECT * FROM customers 
        ORDER BY created_at DESC 
        LIMIT 10
      `).all()
    };

    res.json({ success: true, summary });
  } catch (error) {
    console.error('Error generating customers summary:', error);
    res.status(500).json({ success: false, message: 'Error generating customers summary' });
  }
});

// Activity reports
router.get('/activity/summary', authenticateToken, (req, res) => {
  try {
    const { days = 30 } = req.query;

    const summary = {
      total_actions: db.prepare(`
        SELECT COUNT(*) as count FROM activity_logs 
        WHERE created_at >= datetime('now', '-${days} days')
      `).get().count,
      actions_by_day: db.prepare(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM activity_logs 
        WHERE created_at >= datetime('now', '-${days} days')
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `).all(),
      actions_by_type: db.prepare(`
        SELECT action_type, COUNT(*) as count
        FROM activity_logs 
        WHERE created_at >= datetime('now', '-${days} days')
        GROUP BY action_type
      `).all(),
      most_active_users: db.prepare(`
        SELECT username, COUNT(*) as action_count
        FROM activity_logs 
        WHERE created_at >= datetime('now', '-${days} days')
        GROUP BY username
        ORDER BY action_count DESC
        LIMIT 5
      `).all()
    };

    res.json({ success: true, summary });
  } catch (error) {
    console.error('Error generating activity summary:', error);
    res.status(500).json({ success: false, message: 'Error generating activity summary' });
  }
});

// Combined dashboard report
router.get('/dashboard', authenticateToken, (req, res) => {
  try {
    const report = {
      inventory: {
        total_items: db.prepare('SELECT COUNT(*) as count FROM inventory_items').get().count,
        total_value: db.prepare('SELECT SUM(quantity * unit_price) as value FROM inventory_items').get().value || 0,
        low_stock_count: db.prepare(`
          SELECT COUNT(*) as count FROM inventory_items 
          WHERE quantity <= minimum_stock AND minimum_stock > 0
        `).get().count
      },
      jobs: {
        total: db.prepare('SELECT COUNT(*) as count FROM jobs').get().count,
        active: db.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'active'").get().count,
        completed_this_month: db.prepare(`
          SELECT COUNT(*) as count FROM jobs 
          WHERE status = 'completed' 
          AND DATE(end_date) >= DATE('now', 'start of month')
        `).get().count
      },
      customers: {
        total: db.prepare('SELECT COUNT(*) as count FROM customers').get().count,
        new_this_month: db.prepare(`
          SELECT COUNT(*) as count FROM customers 
          WHERE DATE(created_at) >= DATE('now', 'start of month')
        `).get().count
      },
      activity: {
        today: db.prepare(`
          SELECT COUNT(*) as count FROM activity_logs 
          WHERE DATE(created_at) = DATE('now')
        `).get().count,
        this_week: db.prepare(`
          SELECT COUNT(*) as count FROM activity_logs 
          WHERE created_at >= datetime('now', '-7 days')
        `).get().count
      }
    };

    res.json({ success: true, report });
  } catch (error) {
    console.error('Error generating dashboard report:', error);
    res.status(500).json({ success: false, message: 'Error generating dashboard report' });
  }
});

module.exports = router;
