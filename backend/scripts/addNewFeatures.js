const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

console.log('🔧 Adding Activity Logging System...\n');

try {
  // Create activity_logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      action_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      entity_name TEXT,
      description TEXT,
      old_values TEXT,
      new_values TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('✅ Created activity_logs table');

  // Create index for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_logs(action_type);
    CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_logs(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_logs(created_at);
  `);

  console.log('✅ Created indexes for activity_logs');

  // Create customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  console.log('✅ Created customers table');

  // Create indexes for customers
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_customer_name ON customers(name);
    CREATE INDEX IF NOT EXISTS idx_customer_email ON customers(email);
    CREATE INDEX IF NOT EXISTS idx_customer_phone ON customers(phone);
  `);

  console.log('✅ Created indexes for customers');

  // Add customer_id to jobs table if it doesn't exist
  const jobsTableInfo = db.prepare("PRAGMA table_info(jobs)").all();
  const hasCustomerId = jobsTableInfo.some(col => col.name === 'customer_id');

  if (!hasCustomerId) {
    db.exec(`
      ALTER TABLE jobs ADD COLUMN customer_id INTEGER REFERENCES customers(id);
    `);
    console.log('✅ Added customer_id column to jobs table');
  } else {
    console.log('ℹ️  customer_id column already exists in jobs table');
  }

  // Create customer index in jobs
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_job_customer ON jobs(customer_id);
  `);

  console.log('✅ Created customer index in jobs table');

  console.log('\n🎉 Database updates completed successfully!');
  console.log('\nNew features added:');
  console.log('  - Activity Logging System');
  console.log('  - Customer Management');
  console.log('  - Customer-Job Relationships');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  db.close();
}
