const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

console.log('🔧 Starting price fix...\n');

// Get all items with 0 price
const zeroItems = db.prepare('SELECT id, item_name, unit_price, section FROM inventory_items WHERE unit_price = 0').all();
console.log(`Found ${zeroItems.length} items with zero price:`);
zeroItems.forEach(item => {
  console.log(`  - ${item.item_name} (${item.section})`);
});

if (zeroItems.length === 0) {
  console.log('\n✅ All items already have prices!');
  db.close();
  process.exit(0);
}

// Update items with reasonable default prices based on category
const updatePrice = db.prepare('UPDATE inventory_items SET unit_price = ? WHERE id = ?');

const priceRanges = {
  'Plumbing': 15,
  'Electrical': 8,
  'Lumber': 10,
  'Building Materials': 18,
  'Paint': 35,
  'Hardware': 7,
  'Auto Parts': 50,
  'Body Parts': 100,
  'Accessories': 25
};

zeroItems.forEach(item => {
  // Assign price based on category or default to $25
  let price = 25;
  
  if (item.category && priceRanges[item.category]) {
    price = priceRanges[item.category];
  } else {
    // For tire shop items, use higher default
    if (item.section === 'Tire Shop') {
      price = 75;
    }
  }
  
  updatePrice.run(price, item.id);
  console.log(`  ✓ Updated ${item.item_name} to $${price}`);
});

console.log('\n✅ Price fix complete!');
console.log('\n=== Updated Inventory Summary ===');

const summary = db.prepare(`
  SELECT 
    section,
    COUNT(*) as count,
    SUM(unit_price * quantity) as total_value,
    AVG(unit_price) as avg_price
  FROM inventory_items
  GROUP BY section
`).all();

summary.forEach(row => {
  console.log(`${row.section}:`);
  console.log(`  Items: ${row.count}`);
  console.log(`  Total Value: $${row.total_value.toFixed(2)}`);
  console.log(`  Avg Price: $${row.avg_price.toFixed(2)}`);
});

db.close();
