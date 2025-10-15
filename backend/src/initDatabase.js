const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      email TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      is_active INTEGER DEFAULT 1
    )
  `);

  // Inventory items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      quantity INTEGER NOT NULL DEFAULT 0,
      unit_price REAL NOT NULL,
      supplier TEXT,
      supplier_contact TEXT,
      location TEXT,
      sku TEXT UNIQUE,
      minimum_stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER,
      notes TEXT,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Jobs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_name TEXT NOT NULL,
      customer_name TEXT,
      customer_contact TEXT,
      status TEXT DEFAULT 'active',
      start_date TEXT,
      end_date TEXT,
      description TEXT,
      total_estimated_cost REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Job items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS job_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      inventory_item_id INTEGER NOT NULL,
      quantity_used INTEGER NOT NULL,
      unit_price_at_time REAL,
      notes TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id)
    )
  `);

  // Import logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS import_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT,
      imported_by INTEGER,
      import_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      rows_processed INTEGER,
      rows_successful INTEGER,
      rows_failed INTEGER,
      error_log TEXT,
      status TEXT,
      FOREIGN KEY (imported_by) REFERENCES users(id)
    )
  `);

  console.log('✅ Database tables created successfully');
};

// Create indexes
const createIndexes = () => {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_item_name ON inventory_items(item_name);
    CREATE INDEX IF NOT EXISTS idx_category ON inventory_items(category);
    CREATE INDEX IF NOT EXISTS idx_supplier ON inventory_items(supplier);
    CREATE INDEX IF NOT EXISTS idx_job_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_customer ON jobs(customer_name);
    CREATE INDEX IF NOT EXISTS idx_job_id ON job_items(job_id);
    CREATE INDEX IF NOT EXISTS idx_inventory_item_id ON job_items(inventory_item_id);
  `);
  console.log('✅ Database indexes created successfully');
};

// Create default admin user
const createDefaultUser = () => {
  const checkUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  
  if (!checkUser) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const insert = db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role)
      VALUES (?, ?, ?, ?)
    `);
    
    insert.run('admin', hashedPassword, 'Administrator', 'admin');
    console.log('✅ Default admin user created (username: admin, password: admin123)');
  } else {
    console.log('ℹ️  Admin user already exists');
  }
};

// Add sample data
const addSampleData = () => {
  const itemCount = db.prepare('SELECT COUNT(*) as count FROM inventory_items').get();
  
  if (itemCount.count === 0) {
    const insertItem = db.prepare(`
      INSERT INTO inventory_items (item_name, description, category, quantity, unit_price, supplier, location, sku)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleItems = [
      ['Steel Pipe 2"', 'Galvanized steel pipe', 'Plumbing', 150, 12.50, 'ABC Supply', 'Warehouse A', 'SP-2IN-001'],
      ['Copper Wire 12AWG', '100ft spool copper wire', 'Electrical', 500, 0.85, 'Electric Co', 'Warehouse B', 'CW-12-002'],
      ['Wood Plank 2x4x8', 'Standard lumber plank', 'Lumber', 300, 8.99, 'Lumber Yard', 'Warehouse A', 'WP-2X4-003'],
      ['PVC Pipe 1.5"', 'White PVC pipe', 'Plumbing', 200, 6.75, 'ABC Supply', 'Warehouse A', 'PVC-15-004'],
      ['LED Bulb 60W', 'Energy efficient LED', 'Electrical', 100, 4.50, 'Electric Co', 'Warehouse C', 'LED-60-005'],
      ['Drywall Sheet 4x8', 'Standard drywall panel', 'Building Materials', 75, 15.99, 'Builder Supply', 'Warehouse A', 'DW-4X8-006'],
      ['Paint Gallon White', 'Interior white paint', 'Paint', 50, 32.00, 'Paint Store', 'Warehouse C', 'PT-WHT-007'],
      ['Screws 2" Box', 'Box of 100 wood screws', 'Hardware', 200, 8.50, 'Hardware Plus', 'Warehouse B', 'SCR-2-008'],
      ['Concrete Mix 80lb', 'Quick-set concrete', 'Building Materials', 120, 6.25, 'Builder Supply', 'Warehouse A', 'CON-80-009'],
      ['Wire Nuts Assorted', 'Pack of 50 wire nuts', 'Electrical', 300, 5.99, 'Electric Co', 'Warehouse B', 'WN-AST-010']
    ];

    sampleItems.forEach(item => {
      insertItem.run(...item);
    });

    console.log('✅ Sample inventory data added');
  } else {
    console.log('ℹ️  Sample data already exists');
  }
};

// Initialize database
const initializeDatabase = () => {
  console.log('🚀 Initializing database...');
  createTables();
  createIndexes();
  createDefaultUser();
  addSampleData();
  console.log('✅ Database initialization complete!');
  db.close();
};

// Run if executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase, db };
