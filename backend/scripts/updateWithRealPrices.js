const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

console.log('🔧 Updating Tire Shop Prices with Real Data...\n');

// Prices from your Excel file
const prices = {
  'filmdiscs40': 40.0,
  'filmdiscs80': 42.3,
  'filmdiscs120': 15.0,
  'filmdiscs180': 36.5,
  'filmdiscs220': 36.5,
  'filmdiscs320': 36.5,
  'filmdiscs400': 36.5,
  'filmdiscs600': 36.5,
  'filmdiscs800': 36.5,
  'semirigidrepair': 57.0,
  'baremetalrepair': 46.0,
  'impactresistantadhesive': 85.31,
  'glazepuddy': 15.2,
  'yellowtape': 79.95,
  'bodywax': 56.8,
  'carcoversheeting': 33.99,
  'prestoneantifreezecoolant': 12.0,
  'bmwantifreeze': 42.99,
  'roweantifreeze': 29.99,
  'blackbumpercoating': 20.0,
  '400heavycutcompound': 156.86,
  'tackcloth8063': 18.0,
  'razorblades': 6.0,
  'fx800sheets': 57.55,
  'greyscuffroll': 45.99,
  'redscuffroll': 45.99,
  'fx600sheets': 57.55,
  'fx400sheets': 57.55,
  '2x36blaze': 55.0,
  'maroonprepbelts': 9.95,
  'acidbrushes': 38.59,
  'clearplasticrepair': 58.55,
  'kombiputtyzero': 23.0,
  '1000prepwipes': 159.0,
  '12x1860g': 38.43,
  '14green223': 6.99,
  'aerohondablack': 26.99,
  '3x50blaze': 55.99,
  'paintrefresh22oz': 20.4,
  '13oz125micron': 59.0
};

// Get all tire shop items
const items = db.prepare('SELECT id, item_name, unit_price FROM inventory_items WHERE section = ?').all('Tire Shop');

console.log(`Found ${items.length} items in Tire Shop\n`);

const updatePrice = db.prepare('UPDATE inventory_items SET unit_price = ? WHERE id = ?');

let updatedCount = 0;
let notFoundCount = 0;

function normalize(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

items.forEach(item => {
  const normalizedName = normalize(item.item_name);
  
  if (prices[normalizedName]) {
    updatePrice.run(prices[normalizedName], item.id);
    updatedCount++;
    console.log(`  ✓ ${item.item_name} → $${prices[normalizedName].toFixed(2)}`);
  } else {
    // Set default price for items not in Excel
    if (item.unit_price === 0 || item.unit_price === 50) {
      updatePrice.run(30, item.id);  // Default to $30 for unmapped items
      notFoundCount++;
      console.log(`  ⚠ ${item.item_name} → $30.00 (default)`);
    }
  }
});

console.log(`\n📊 Update Summary:`);
console.log(`   ✓ Updated from Excel: ${updatedCount} items`);
console.log(`   ⚠ Set to default ($30): ${notFoundCount} items`);
console.log(`   Total: ${items.length} items`);

const stats = db.prepare('SELECT COUNT(*) as count, SUM(unit_price * quantity) as total_value, AVG(unit_price) as avg_price, MIN(unit_price) as min_price, MAX(unit_price) as max_price FROM inventory_items WHERE section = ?').get('Tire Shop');

console.log(`\n=== Tire Shop Statistics ===`);
console.log(`  Total Items: ${stats.count}`);
console.log(`  Total Inventory Value: $${stats.total_value.toFixed(2)}`);
console.log(`  Average Unit Price: $${stats.avg_price.toFixed(2)}`);
console.log(`  Price Range: $${stats.min_price.toFixed(2)} - $${stats.max_price.toFixed(2)}`);

console.log('\n✅ Price update complete!\n');

db.close();
