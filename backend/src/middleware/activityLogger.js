const db = require('../models/database');

// Activity logging helper
const logActivity = (req, actionType, entityType, entityId, entityName, description, oldValues = null, newValues = null) => {
  try {
    const user = req.user; // From JWT token
    const ipAddress = req.ip || req.connection.remoteAddress;

    const insert = db.prepare(`
      INSERT INTO activity_logs 
      (user_id, username, action_type, entity_type, entity_id, entity_name, description, old_values, new_values, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      user.id,
      user.username,
      actionType,
      entityType,
      entityId,
      entityName,
      description,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      ipAddress
    );
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - logging failure shouldn't break the request
  }
};

// Action types
const ACTION_TYPES = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT'
};

// Entity types
const ENTITY_TYPES = {
  INVENTORY: 'INVENTORY',
  JOB: 'JOB',
  CUSTOMER: 'CUSTOMER',
  USER: 'USER'
};

module.exports = {
  logActivity,
  ACTION_TYPES,
  ENTITY_TYPES
};
