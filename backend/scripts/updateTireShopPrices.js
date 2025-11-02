const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

console.log('🔧 Updating Tire Shop Inventory Prices...\n');

// Sample prices for common auto/tire shop parts
const partPrices = {
  'Air Duct': 45, 'Air Deflector': 35, 'Access cover': 25, 'Gas cap': 15,
  'M5 Gas Cap': 20, 'Weatherstrip': 30, 'Belt Molding': 40, 'Bowden cable': 25,
  'Bracket': 20, 'Bumper Cover Bracket': 35, 'Bumper support bracket': 45,
  'Closure panel': 50, 'Crash reinforcement': 150, 'Deformation element': 80,
  'Door Molding': 55, 'Front Duct': 40, 'Brake light switch': 15,
  'Fog Light Grille': 45, 'Bumper Cover': 200, 'Bumper Support': 120,
  'Door seal': 35, 'Fender': 250, 'Fog light lamp cover': 30,
  'Inner fender': 85, 'Wheel': 150, 'Kidney Grille': 90, 'Garnish': 40,
  'Grille Molding': 50, 'Grommet': 5, 'Headlight bracket': 25,
  'Kit dummy trim': 30, 'Fender liner': 65, 'Wheel Opening Molding': 45,
  'Lower duct': 40, 'Luggage Compartment Cover': 75, 'Mounting': 20,
  'Mount': 25, 'Oil cooler': 180, 'Panel': 100, 'Weather strip': 30,
  'Wheel housing': 95, 'Wheel flair': 60, 'Insert Panel': 35,
  'Bumper Guide': 40, 'Reflector Panel': 45, 'Reinforcement panel': 110,
  'Retainer': 20, 'Door Shell': 300, 'Radiator': 250, 'Auxiliary Radiator': 200,
  'Side panel': 120, 'Transmission Oil Cooler': 180, 'Hood Lock': 45,
  'Upper belt': 55, 'Housing Cover': 35, 'Cover': 40, 'Gutter strip': 30,
  'Air Inlet Duct': 35, 'Engine hood hinge': 65, 'Chrome wedge trim': 40,
  'Vertical connection': 30, 'Cross member': 150, 'Body glass': 400,
  'Bumper Grille': 75, 'Cover fog lamp': 35, 'Headlight Lower Mount Bracket': 30,
  'Fog Light': 180, 'Grate Filter': 25, 'Rear lamp': 200,
  'Trunk Lid Smart Opener': 150, 'Bumper Molding': 55, 'Socket': 20,
  'Cross Brace': 100, 'Fuel gas door': 50, 'Bumper Grill': 70,
  'Center Covering': 40, 'Air breather': 45, 'Bumper corner': 50,
  'Air Duct Cover': 40, 'Suspension strut': 180,
};

// Get all items from Tire Shop - using ? parameter to avoid SQL issues
const tireShopItems = db.prepare('SELECT id, item_name, unit_price FROM inventory_items WHERE section = ?').all('Tire Shop');

console.log(`Found ${tireShopItems.length} items in Tire Shop\n`);

if (tireShopItems.length === 0) {
  console.log('⚠️  No Tire Shop items found in database');
  console.log('   Make sure you have imported your inventory with section = "Tire Shop"');
  db.close();
  process.exit(0);
}

const updatePrice = db.prepare('UPDATE inventory_items SET unit_price = ? WHERE id = ?');
let updatedCount = 0;
let alreadyPricedCount = 0;

tireShopItems.forEach(item => {
  if (item.unit_price > 0) {
    alreadyPricedCount++;
    return;
  }

  let matchedPrice = null;
  const itemNameLower = item.item_name.toLowerCase();

  for (const [keyword, price] of Object.entries(partPrices)) {
    if (itemNameLower.includes(keyword.toLowerCase())) {
      matchedPrice = price;
      break;
    }
  }

  const finalPrice = matchedPrice || 50;
  
  updatePrice.run(finalPrice, item.id);
  updatedCount++;
  console.log(`  ✓ ${item.item_name} → $${finalPrice}`);
});

console.log(`\n📊 Update Summary:`);
console.log(`   Updated: ${updatedCount} items`);
console.log(`   Already priced: ${alreadyPricedCount} items`);
console.log(`   Total: ${tireShopItems.length} items`);

const stats = db.prepare('SELECT COUNT(*) as count, SUM(unit_price * quantity) as total_value, AVG(unit_price) as avg_price, MIN(unit_price) as min_price, MAX(unit_price) as max_price FROM inventory_items WHERE section = ?').get('Tire Shop');

console.log(`\n=== Tire Shop Statistics ===`);
console.log(`  Total Items: ${stats.count}`);
console.log(`  Total Inventory Value: $${stats.total_value.toFixed(2)}`);
console.log(`  Average Unit Price: $${stats.avg_price.toFixed(2)}`);
console.log(`  Price Range: $${stats.min_price} - $${stats.max_price}`);

console.log('\n✅ Price update complete!');

db.close();
