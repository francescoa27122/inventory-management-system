const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../models/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, isAdmin, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, username, full_name, email, role, created_at, last_login, is_active
      FROM users
      ORDER BY created_at DESC
    `).all();

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Create new user (admin only)
router.post('/', authenticateToken, isAdmin, (req, res) => {
  try {
    const { username, password, full_name, email, role } = req.body;

    // Validate inputs
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Check if username already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    const insert = db.prepare(`
      INSERT INTO users (username, password_hash, full_name, email, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      username,
      hashedPassword,
      full_name || username,
      email || null,
      role || 'user'
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: result.lastInsertRowid,
        username,
        full_name: full_name || username,
        email,
        role: role || 'user'
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, role, is_active } = req.body;

    const update = db.prepare(`
      UPDATE users
      SET full_name = ?, email = ?, role = ?, is_active = ?
      WHERE id = ?
    `);

    update.run(full_name, email, role, is_active ? 1 : 0, id);

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
});

// Change password (admin only)
router.put('/:id/password', authenticateToken, isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const update = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    update.run(hashedPassword, id);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, message: 'Error updating password' });
  }
});

// Deactivate user (admin only)
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const update = db.prepare('UPDATE users SET is_active = 0 WHERE id = ?');
    update.run(id);

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ success: false, message: 'Error deactivating user' });
  }
});

module.exports = router;
