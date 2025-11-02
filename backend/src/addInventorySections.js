const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

console.log('🚀 Adding inventory sections...');

// Add section column to inventory_items table
try {
  db.exec(`
    ALTER TABLE inventory_items ADD COLUMN section TEXT DEFAULT 'Main Shop';
  `);
  console.log('✅ Added section column to inventory_items table');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('ℹ️  Section column already exists');
  } else {
    console.error('❌ Error adding section column:', error.message);
    process.exit(1);
  }
}

// Create index on section column
try {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_section ON inventory_items(section);
  `);
  console.log('✅ Created index on section column');
} catch (error) {
  console.error('❌ Error creating index:', error.message);
}

console.log('✅ Migration complete!');
console.log('ℹ️  All existing items are set to "Main Shop" by default');

db.close();
