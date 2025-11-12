const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { logActivity, ACTION_TYPES, ENTITY_TYPES } = require('../middleware/activityLogger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/job-photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'job-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});

// Upload photo to job
router.post('/:jobId/photos', authenticateToken, upload.single('photo'), (req, res) => {
  try {
    const { jobId } = req.params;
    const { photo_type, caption } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const insert = db.prepare(`
      INSERT INTO job_photos (job_id, file_name, file_path, file_type, photo_type, caption, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      jobId,
      req.file.filename,
      `/uploads/job-photos/${req.file.filename}`,
      req.file.mimetype,
      photo_type || 'general',
      caption || null,
      req.user.id
    );

    // Log activity
    logActivity(
      req,
      ACTION_TYPES.CREATE,
      'JOB_PHOTO',
      result.lastInsertRowid,
      req.file.filename,
      `Uploaded photo to job ${jobId}`
    );

    res.status(201).json({
      success: true,
      photo: {
        id: result.lastInsertRowid,
        file_name: req.file.filename,
        file_path: `/uploads/job-photos/${req.file.filename}`,
        photo_type: photo_type || 'general',
        caption: caption || null
      }
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ success: false, message: 'Error uploading photo' });
  }
});

// Get all photos for a job
router.get('/:jobId/photos', authenticateToken, (req, res) => {
  try {
    const { jobId } = req.params;
    
    const photos = db.prepare(`
      SELECT p.*, u.username as uploaded_by_name
      FROM job_photos p
      LEFT JOIN users u ON p.uploaded_by = u.id
      WHERE p.job_id = ?
      ORDER BY p.uploaded_at DESC
    `).all(jobId);

    res.json({ success: true, photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ success: false, message: 'Error fetching photos' });
  }
});

// Delete photo
router.delete('/:jobId/photos/:photoId', authenticateToken, (req, res) => {
  try {
    const { photoId } = req.params;
    
    const photo = db.prepare('SELECT * FROM job_photos WHERE id = ?').get(photoId);
    
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../..', photo.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    db.prepare('DELETE FROM job_photos WHERE id = ?').run(photoId);

    // Log activity
    logActivity(
      req,
      ACTION_TYPES.DELETE,
      'JOB_PHOTO',
      photoId,
      photo.file_name,
      `Deleted photo from job ${photo.job_id}`
    );

    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ success: false, message: 'Error deleting photo' });
  }
});

module.exports = router;
