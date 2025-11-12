const express = require('express');
const db = require('../models/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get activity logs (admin only)
router.get('/', authenticateToken, isAdmin, (req, res) => {
  try {
    const { 
      user_id, 
      action_type, 
      entity_type, 
      limit = 100, 
      offset = 0,
      start_date,
      end_date
    } = req.query;

    let query = 'SELECT * FROM activity_logs WHERE 1=1';
    const params = [];

    if (user_id) {
      query += ' AND user_id = ?';
      params.push(user_id);
    }

    if (action_type) {
      query += ' AND action_type = ?';
      params.push(action_type);
    }

    if (entity_type) {
      query += ' AND entity_type = ?';
      params.push(entity_type);
    }

    if (start_date) {
      query += ' AND created_at >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND created_at <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const logs = db.prepare(query).all(...params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM activity_logs WHERE 1=1';
    const countParams = [];

    if (user_id) {
      countQuery += ' AND user_id = ?';
      countParams.push(user_id);
    }
    if (action_type) {
      countQuery += ' AND action_type = ?';
      countParams.push(action_type);
    }
    if (entity_type) {
      countQuery += ' AND entity_type = ?';
      countParams.push(entity_type);
    }
    if (start_date) {
      countQuery += ' AND created_at >= ?';
      countParams.push(start_date);
    }
    if (end_date) {
      countQuery += ' AND created_at <= ?';
      countParams.push(end_date);
    }

    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({ 
      success: true, 
      logs,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ success: false, message: 'Error fetching activity logs' });
  }
});

// Get recent activity (last 50 actions)
router.get('/recent', authenticateToken, (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT * FROM activity_logs 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all();

    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ success: false, message: 'Error fetching recent activity' });
  }
});

// Get activity stats
router.get('/stats', authenticateToken, isAdmin, (req, res) => {
  try {
    const stats = {
      total_actions: db.prepare('SELECT COUNT(*) as count FROM activity_logs').get().count,
      today_actions: db.prepare(`
        SELECT COUNT(*) as count FROM activity_logs 
        WHERE DATE(created_at) = DATE('now')
      `).get().count,
      actions_by_type: db.prepare(`
        SELECT action_type, COUNT(*) as count 
        FROM activity_logs 
        GROUP BY action_type
      `).all(),
      actions_by_user: db.prepare(`
        SELECT username, COUNT(*) as count 
        FROM activity_logs 
        GROUP BY username 
        ORDER BY count DESC 
        LIMIT 10
      `).all(),
      recent_entities: db.prepare(`
        SELECT entity_type, COUNT(*) as count 
        FROM activity_logs 
        WHERE created_at >= datetime('now', '-7 days')
        GROUP BY entity_type
      `).all()
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching activity stats' });
  }
});

module.exports = router;
