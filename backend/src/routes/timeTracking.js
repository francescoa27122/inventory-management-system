const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { logActivity, ACTION_TYPES, ENTITY_TYPES } = require('../middleware/activityLogger');

const router = express.Router();

// Start time tracking for a job
router.post('/:jobId/time/start', authenticateToken, (req, res) => {
  try {
    const { jobId } = req.params;
    const { notes } = req.body;

    // Check if there's already an active timer for this user on this job
    const activeTimer = db.prepare(`
      SELECT * FROM time_logs 
      WHERE job_id = ? AND user_id = ? AND end_time IS NULL
    `).get(jobId, req.user.id);

    if (activeTimer) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an active timer for this job' 
      });
    }

    const insert = db.prepare(`
      INSERT INTO time_logs (job_id, user_id, start_time, notes)
      VALUES (?, ?, datetime('now'), ?)
    `);

    const result = insert.run(jobId, req.user.id, notes || null);

    res.status(201).json({
      success: true,
      timeLog: {
        id: result.lastInsertRowid,
        job_id: jobId,
        user_id: req.user.id,
        start_time: new Date().toISOString(),
        notes
      }
    });
  } catch (error) {
    console.error('Error starting timer:', error);
    res.status(500).json({ success: false, message: 'Error starting timer' });
  }
});

// Stop time tracking
router.post('/:jobId/time/stop', authenticateToken, (req, res) => {
  try {
    const { jobId } = req.params;

    const activeTimer = db.prepare(`
      SELECT * FROM time_logs 
      WHERE job_id = ? AND user_id = ? AND end_time IS NULL
    `).get(jobId, req.user.id);

    if (!activeTimer) {
      return res.status(400).json({ 
        success: false, 
        message: 'No active timer found for this job' 
      });
    }

    const update = db.prepare(`
      UPDATE time_logs 
      SET end_time = datetime('now'),
          duration_minutes = CAST((julianday(datetime('now')) - julianday(start_time)) * 24 * 60 AS INTEGER)
      WHERE id = ?
    `);

    update.run(activeTimer.id);

    // Get updated log
    const updatedLog = db.prepare('SELECT * FROM time_logs WHERE id = ?').get(activeTimer.id);

    // Update job's actual hours
    const totalMinutes = db.prepare(`
      SELECT SUM(duration_minutes) as total FROM time_logs WHERE job_id = ?
    `).get(jobId);
    
    db.prepare('UPDATE jobs SET actual_hours = ? WHERE id = ?')
      .run((totalMinutes.total || 0) / 60, jobId);

    // Log activity
    logActivity(
      req,
      ACTION_TYPES.UPDATE,
      ENTITY_TYPES.JOB,
      jobId,
      null,
      `Logged ${updatedLog.duration_minutes} minutes of work`
    );

    res.json({
      success: true,
      timeLog: updatedLog
    });
  } catch (error) {
    console.error('Error stopping timer:', error);
    res.status(500).json({ success: false, message: 'Error stopping timer' });
  }
});

// Get time logs for a job
router.get('/:jobId/time', authenticateToken, (req, res) => {
  try {
    const { jobId } = req.params;

    const logs = db.prepare(`
      SELECT t.*, u.username, u.full_name
      FROM time_logs t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.job_id = ?
      ORDER BY t.start_time DESC
    `).all(jobId);

    const summary = db.prepare(`
      SELECT 
        SUM(duration_minutes) as total_minutes,
        COUNT(*) as session_count
      FROM time_logs
      WHERE job_id = ? AND duration_minutes IS NOT NULL
    `).get(jobId);

    res.json({
      success: true,
      logs,
      summary: {
        total_hours: (summary.total_minutes || 0) / 60,
        total_minutes: summary.total_minutes || 0,
        session_count: summary.session_count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching time logs:', error);
    res.status(500).json({ success: false, message: 'Error fetching time logs' });
  }
});

// Add manual time entry
router.post('/:jobId/time/manual', authenticateToken, (req, res) => {
  try {
    const { jobId } = req.params;
    const { hours, notes } = req.body;

    if (!hours || hours <= 0) {
      return res.status(400).json({ success: false, message: 'Valid hours required' });
    }

    const minutes = Math.round(hours * 60);

    const insert = db.prepare(`
      INSERT INTO time_logs (job_id, user_id, start_time, end_time, duration_minutes, notes)
      VALUES (?, ?, datetime('now', '-' || ? || ' minutes'), datetime('now'), ?, ?)
    `);

    const result = insert.run(jobId, req.user.id, minutes, minutes, notes || null);

    // Update job's actual hours
    const totalMinutes = db.prepare(`
      SELECT SUM(duration_minutes) as total FROM time_logs WHERE job_id = ?
    `).get(jobId);
    
    db.prepare('UPDATE jobs SET actual_hours = ? WHERE id = ?')
      .run((totalMinutes.total || 0) / 60, jobId);

    res.status(201).json({
      success: true,
      timeLog: {
        id: result.lastInsertRowid,
        duration_minutes: minutes,
        hours: hours
      }
    });
  } catch (error) {
    console.error('Error adding manual time:', error);
    res.status(500).json({ success: false, message: 'Error adding manual time' });
  }
});

// Delete time log
router.delete('/:jobId/time/:logId', authenticateToken, (req, res) => {
  try {
    const { jobId, logId } = req.params;

    const log = db.prepare('SELECT * FROM time_logs WHERE id = ? AND job_id = ?').get(logId, jobId);
    
    if (!log) {
      return res.status(404).json({ success: false, message: 'Time log not found' });
    }

    db.prepare('DELETE FROM time_logs WHERE id = ?').run(logId);

    // Update job's actual hours
    const totalMinutes = db.prepare(`
      SELECT SUM(duration_minutes) as total FROM time_logs WHERE job_id = ?
    `).get(jobId);
    
    db.prepare('UPDATE jobs SET actual_hours = ? WHERE id = ?')
      .run((totalMinutes.total || 0) / 60, jobId);

    res.json({ success: true, message: 'Time log deleted successfully' });
  } catch (error) {
    console.error('Error deleting time log:', error);
    res.status(500).json({ success: false, message: 'Error deleting time log' });
  }
});

module.exports = router;
