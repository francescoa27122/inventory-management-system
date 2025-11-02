const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

console.log('🔧 Adding status column to job_items table...\n');

try {
  // Check if status column exists
  const tableInfo = db.prepare("PRAGMA table_info(job_items)").all();
  const hasStatusColumn = tableInfo.some(col => col.name === 'status');

  if (hasStatusColumn) {
    console.log('✅ Status column already exists!');
  } else {
    // Add status column
    db.prepare(`
      ALTER TABLE job_items 
      ADD COLUMN status TEXT DEFAULT 'ordered'
    `).run();
    
    console.log('✅ Status column added successfully!');
  }

  // Verify the column was added
  const updatedTableInfo = db.prepare("PRAGMA table_info(job_items)").all();
  console.log('\nCurrent job_items table structure:');
  updatedTableInfo.forEach(col => {
    console.log(`  - ${col.name}: ${col.type}${col.dflt_value ? ` (default: ${col.dflt_value})` : ''}`);
  });

  console.log('\n✅ Database migration completed successfully!');
  console.log('   Jobs can now track part status: ordered, ordering, received\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\nTroubleshooting:');
  console.error('  • Make sure the backend is not running');
  console.error('  • Check database file permissions');
  console.error('  • Verify database.sqlite exists');
} finally {
  db.close();
}
