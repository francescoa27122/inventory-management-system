const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

console.log('🔧 Setting Default Prices for Main Shop (Body Shop) Items...\n');

// Get all Main Shop items with $0 price
const zeroItems = db.prepare('SELECT id, item_name, unit_price FROM inventory_items WHERE section = ? AND unit_price = 0').all('Main Shop');

console.log(`Found ${zeroItems.length} Main Shop items with $0 price\n`);

if (zeroItems.length === 0) {
  console.log('✅ All Main Shop items already have prices!');
  db.close();
  process.exit(0);
}

// Default prices for auto body shop parts (these are generic BMW parts from the database)
const defaultPriceMap = {
  'air duct': 45,
  'air deflector': 35,
  'access cover': 25,
  'gas cap': 15,
  'weatherstrip': 30,
  'belt molding': 40,
  'bowden cable': 25,
  'bracket': 35,
  'bumper': 150,
  'closure panel': 50,
  'crash reinforcement': 150,
  'deformation': 80,
  'door molding': 55,
  'door seal': 35,
  'fender': 250,
  'fog light': 180,
  'grille': 90,
  'grommet': 5,
  'headlight': 200,
  'hood': 300,
  'lamp': 100,
  'panel': 100,
  'radiator': 250,
  'reinforcement': 110,
  'trim': 40,
  'wheel': 150,
  'cover': 40,
  'mount': 25,
  'support': 120,
  'sensor': 85,
  'motor': 180,
  'actuator': 95,
  'switch': 45,
  'relay': 35,
  'connector': 15,
  'harness': 60,
  'module': 250,
  'controller': 200,
  'pump': 180,
  'filter': 25,
  'seal': 15,
  'gasket': 12,
  'hose': 30,
  'clamp': 8,
  'bolt': 5,
  'nut': 3,
  'screw': 2,
  'clip': 4,
  'retainer': 6
};

const updatePrice = db.prepare('UPDATE inventory_items SET unit_price = ? WHERE id = ?');
let updatedCount = 0;

function normalize(name) {
  return name.toLowerCase().trim();
}

function findPrice(itemName) {
  const normalized = normalize(itemName);
  
  // Check for keyword matches
  for (const [keyword, price] of Object.entries(defaultPriceMap)) {
    if (normalized.includes(keyword)) {
      return price;
    }
  }
  
  // Default price based on item name length/complexity
  if (normalized.length > 50) {
    return 100; // Complex/large part
  } else if (normalized.length > 30) {
    return 60; // Medium part
  } else {
    return 35; // Small part
  }
}

console.log('Updating prices...\n');

zeroItems.forEach(item => {
  const price = findPrice(item.item_name);
  updatePrice.run(price, item.id);
  updatedCount++;
  console.log(`  ✓ ${item.item_name} → $${price.toFixed(2)}`);
});

console.log(`\n📊 Update Summary:`);
console.log(`   Updated: ${updatedCount} Main Shop items`);

// Show new statistics
const stats = db.prepare(`
  SELECT 
    section,
    COUNT(*) as count,
    SUM(unit_price * quantity) as total_value,
    AVG(unit_price) as avg_price,
    MIN(unit_price) as min_price,
    MAX(unit_price) as max_price
  FROM inventory_items
  GROUP BY section
`).all();

console.log(`\n=== Updated Inventory Statistics ===`);
stats.forEach(row => {
  console.log(`\n${row.section}:`);
  console.log(`  Items: ${row.count}`);
  console.log(`  Total Value: $${row.total_value.toFixed(2)}`);
  console.log(`  Avg Price: $${row.avg_price.toFixed(2)}`);
  console.log(`  Price Range: $${row.min_price.toFixed(2)} - $${row.max_price.toFixed(2)}`);
});

console.log('\n✅ All Main Shop items now have prices!');
console.log('   Refresh your Dashboard to see updated Body Shop Value\n');

db.close();
