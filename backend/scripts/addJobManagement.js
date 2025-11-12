const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

console.log('🔧 Adding Job Management Enhancements...\n');

try {
  // 1. Job Photos Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS job_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      photo_type TEXT DEFAULT 'general',
      caption TEXT,
      uploaded_by INTEGER,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )
  `);
  console.log('✅ Created job_photos table');

  // 2. Job Status History Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS job_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      old_status TEXT,
      new_status TEXT NOT NULL,
      changed_by INTEGER NOT NULL,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (changed_by) REFERENCES users(id)
    )
  `);
  console.log('✅ Created job_status_history table');

  // 3. Time Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS time_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      duration_minutes INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  console.log('✅ Created time_logs table');

  // 4. Job Templates Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS job_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_name TEXT NOT NULL,
      category TEXT,
      description TEXT,
      estimated_hours REAL,
      estimated_cost REAL,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);
  console.log('✅ Created job_templates table');

  // 5. Template Parts Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS template_parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      part_name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      notes TEXT,
      FOREIGN KEY (template_id) REFERENCES job_templates(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Created template_parts table');

  // Add new columns to jobs table if they don't exist
  const jobsColumns = db.prepare("PRAGMA table_info(jobs)").all();
  const columnNames = jobsColumns.map(col => col.name);

  if (!columnNames.includes('estimated_hours')) {
    db.exec('ALTER TABLE jobs ADD COLUMN estimated_hours REAL');
    console.log('✅ Added estimated_hours to jobs');
  }

  if (!columnNames.includes('actual_hours')) {
    db.exec('ALTER TABLE jobs ADD COLUMN actual_hours REAL');
    console.log('✅ Added actual_hours to jobs');
  }

  if (!columnNames.includes('labor_rate')) {
    db.exec('ALTER TABLE jobs ADD COLUMN labor_rate REAL DEFAULT 0');
    console.log('✅ Added labor_rate to jobs');
  }

  if (!columnNames.includes('template_id')) {
    db.exec('ALTER TABLE jobs ADD COLUMN template_id INTEGER REFERENCES job_templates(id)');
    console.log('✅ Added template_id to jobs');
  }

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_job_photos_job ON job_photos(job_id);
    CREATE INDEX IF NOT EXISTS idx_status_history_job ON job_status_history(job_id);
    CREATE INDEX IF NOT EXISTS idx_time_logs_job ON time_logs(job_id);
    CREATE INDEX IF NOT EXISTS idx_time_logs_user ON time_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_template_parts ON template_parts(template_id);
  `);
  console.log('✅ Created indexes');

  // Insert sample job templates
  const templateCount = db.prepare('SELECT COUNT(*) as count FROM job_templates').get().count;
  if (templateCount === 0) {
    const insertTemplate = db.prepare(`
      INSERT INTO job_templates (template_name, category, description, estimated_hours, estimated_cost)
      VALUES (?, ?, ?, ?, ?)
    `);

    const templates = [
      ['Oil Change', 'Maintenance', 'Standard oil change service', 0.5, 50],
      ['Brake Pad Replacement', 'Brakes', 'Replace front and rear brake pads', 2, 300],
      ['Tire Rotation', 'Tires', 'Rotate all four tires', 0.5, 40],
      ['Full Brake Service', 'Brakes', 'Replace pads, rotors, and brake fluid', 4, 600],
      ['Engine Diagnostic', 'Diagnostics', 'Complete engine diagnostic scan', 1, 100],
      ['Transmission Service', 'Transmission', 'Transmission fluid change and inspection', 2, 250],
      ['Battery Replacement', 'Electrical', 'Replace vehicle battery', 0.5, 150],
      ['Alignment Service', 'Suspension', 'Four-wheel alignment', 1, 120]
    ];

    templates.forEach(template => {
      insertTemplate.run(...template);
    });

    console.log('✅ Added sample job templates');
  }

  console.log('\n🎉 Job Management enhancements completed!');
  console.log('\nNew features added:');
  console.log('  - Photo attachments (before/after)');
  console.log('  - Status history tracking');
  console.log('  - Time logging system');
  console.log('  - Job templates with 8 common repairs');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  db.close();
}
