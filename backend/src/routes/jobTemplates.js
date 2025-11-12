const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { logActivity, ACTION_TYPES } = require('../middleware/activityLogger');

const router = express.Router();

// Get all job templates
router.get('/', authenticateToken, (req, res) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM job_templates WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY template_name ASC';

    const templates = db.prepare(query).all(...params);

    // Get parts for each template
    const templatesWithParts = templates.map(template => {
      const parts = db.prepare('SELECT * FROM template_parts WHERE template_id = ?').all(template.id);
      return { ...template, parts };
    });

    res.json({ success: true, templates: templatesWithParts });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ success: false, message: 'Error fetching templates' });
  }
});

// Get single template
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const template = db.prepare('SELECT * FROM job_templates WHERE id = ?').get(id);
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const parts = db.prepare('SELECT * FROM template_parts WHERE template_id = ?').all(id);
    
    res.json({ success: true, template: { ...template, parts } });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ success: false, message: 'Error fetching template' });
  }
});

// Create job template
router.post('/', authenticateToken, (req, res) => {
  try {
    const { template_name, category, description, estimated_hours, estimated_cost, parts } = req.body;

    if (!template_name) {
      return res.status(400).json({ success: false, message: 'Template name is required' });
    }

    const insert = db.prepare(`
      INSERT INTO job_templates (template_name, category, description, estimated_hours, estimated_cost, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      template_name,
      category || null,
      description || null,
      estimated_hours || null,
      estimated_cost || null,
      req.user.id
    );

    const templateId = result.lastInsertRowid;

    // Add parts if provided
    if (parts && Array.isArray(parts) && parts.length > 0) {
      const insertPart = db.prepare(`
        INSERT INTO template_parts (template_id, part_name, quantity, notes)
        VALUES (?, ?, ?, ?)
      `);

      parts.forEach(part => {
        insertPart.run(templateId, part.part_name, part.quantity || 1, part.notes || null);
      });
    }

    // Log activity
    logActivity(
      req,
      ACTION_TYPES.CREATE,
      'JOB_TEMPLATE',
      templateId,
      template_name,
      `Created job template: ${template_name}`
    );

    res.status(201).json({
      success: true,
      template: { id: templateId, template_name }
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ success: false, message: 'Error creating template' });
  }
});

// Update template
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { template_name, category, description, estimated_hours, estimated_cost } = req.body;

    const update = db.prepare(`
      UPDATE job_templates
      SET template_name = ?, category = ?, description = ?, 
          estimated_hours = ?, estimated_cost = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    update.run(template_name, category, description, estimated_hours, estimated_cost, id);

    res.json({ success: true, message: 'Template updated successfully' });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ success: false, message: 'Error updating template' });
  }
});

// Delete template
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const template = db.prepare('SELECT * FROM job_templates WHERE id = ?').get(id);
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    db.prepare('DELETE FROM job_templates WHERE id = ?').run(id);

    // Log activity
    logActivity(
      req,
      ACTION_TYPES.DELETE,
      'JOB_TEMPLATE',
      id,
      template.template_name,
      `Deleted job template: ${template.template_name}`
    );

    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ success: false, message: 'Error deleting template' });
  }
});

// Create job from template
router.post('/:id/create-job', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { job_name, customer_name, customer_contact, start_date } = req.body;

    const template = db.prepare('SELECT * FROM job_templates WHERE id = ?').get(id);
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Create job from template
    const insertJob = db.prepare(`
      INSERT INTO jobs (job_name, customer_name, customer_contact, start_date, description, 
                       estimated_hours, total_estimated_cost, template_id, created_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `);

    const result = insertJob.run(
      job_name || template.template_name,
      customer_name || null,
      customer_contact || null,
      start_date || null,
      template.description,
      template.estimated_hours,
      template.estimated_cost,
      id,
      req.user.id
    );

    res.status(201).json({
      success: true,
      job: {
        id: result.lastInsertRowid,
        job_name: job_name || template.template_name,
        template_used: template.template_name
      }
    });
  } catch (error) {
    console.error('Error creating job from template:', error);
    res.status(500).json({ success: false, message: 'Error creating job from template' });
  }
});

module.exports = router;
