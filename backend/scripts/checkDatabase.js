const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

console.log('🔍 Checking Database Structure...\n');

// Check table structure
console.log('=== TABLE STRUCTURE ===');
const tableInfo = db.prepare("PRAGMA table_info(inventory_items)").all();
console.log('Columns in inventory_items:');
tableInfo.forEach(col => {
  console.log(`  - ${col.name} (${col.type})`);
});

// Check all items
console.log('\n=== ALL ITEMS ===');
const allItems = db.prepare('SELECT id, item_name, section, unit_price FROM inventory_items LIMIT 10').all();
console.log(`Total items: ${db.prepare('SELECT COUNT(*) as count FROM inventory_items').get().count}`);
console.log('\nFirst 10 items:');
allItems.forEach(item => {
  console.log(`  ID: ${item.id}, Name: ${item.item_name}, Section: "${item.section}", Price: $${item.unit_price}`);
});

// Check distinct sections
console.log('\n=== SECTIONS ===');
const sections = db.prepare('SELECT DISTINCT section FROM inventory_items').all();
console.log('Available sections:');
sections.forEach(s => {
  const count = db.prepare('SELECT COUNT(*) as count FROM inventory_items WHERE section = ?').get(s.section);
  console.log(`  - "${s.section}" (${count.count} items)`);
});

db.close();
