const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Read the Excel data that was exported
const excelDataPath = path.join(__dirname, '..', 'tire_shop_prices.json');

if (!fs.existsSync(excelDataPath)) {
  console.error('❌ Excel data file not found at:', excelDataPath);
  console.error('   The tire_shop_prices.json file should be in the backend folder');
  process.exit(1);
}

const excelData = JSON.parse(fs.readFileSync(excelDataPath, 'utf8'));

// Connect to database
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

console.log('🔧 Updating Tire Shop Prices from Excel File...\n');
console.log(`Found ${excelData.length} items in Excel file\n`);

// Get all tire shop items from database
const dbItems = db.prepare('SELECT id, item_name, unit_price FROM inventory_items WHERE section = ?').all('Tire Shop');
console.log(`Found ${dbItems.length} items in Tire Shop database\n`);

const updatePrice = db.prepare('UPDATE inventory_items SET unit_price = ? WHERE id = ?');

let updatedCount = 0;
let notFoundCount = 0;
let skippedCount = 0;

// Function to normalize names for matching
function normalizeName(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

// Create a map of Excel items for faster lookup
const excelMap = new Map();
excelData.forEach(item => {
  const normalizedName = normalizeName(item['Item Name'] || '');
  const price = parseFloat(item['Price per unit']);
  if (normalizedName && !isNaN(price) && price > 0) {
    excelMap.set(normalizedName, price);
  }
});

console.log('Matching items and updating prices...\n');

dbItems.forEach(dbItem => {
  const normalizedDbName = normalizeName(dbItem.item_name);
  
  // Try to find match in Excel data
  if (excelMap.has(normalizedDbName)) {
    const excelPrice = excelMap.get(normalizedDbName);
    updatePrice.run(excelPrice, dbItem.id);
    updatedCount++;
    console.log(`  ✓ ${dbItem.item_name} → $${excelPrice.toFixed(2)}`);
  } else {
    // No match found - keep default $50 or existing price
    if (dbItem.unit_price === 0 || dbItem.unit_price === 50) {
      notFoundCount++;
      console.log(`  ⚠ ${dbItem.item_name} - No match in Excel (keeping $50)`);
    } else {
      skippedCount++;
    }
  }
});

console.log(`\n📊 Update Summary:`);
console.log(`   ✓ Updated from Excel: ${updatedCount} items`);
console.log(`   ⚠ Not found in Excel: ${notFoundCount} items (kept at $50)`);
console.log(`   • Already had prices: ${skippedCount} items`);
console.log(`   Total: ${dbItems.length} items`);

// Show statistics
const stats = db.prepare('SELECT COUNT(*) as count, SUM(unit_price * quantity) as total_value, AVG(unit_price) as avg_price, MIN(unit_price) as min_price, MAX(unit_price) as max_price FROM inventory_items WHERE section = ?').get('Tire Shop');

console.log(`\n=== Tire Shop Statistics ===`);
console.log(`  Total Items: ${stats.count}`);
console.log(`  Total Inventory Value: $${stats.total_value.toFixed(2)}`);
console.log(`  Average Unit Price: $${stats.avg_price.toFixed(2)}`);
console.log(`  Price Range: $${stats.min_price.toFixed(2)} - $${stats.max_price.toFixed(2)}`);

console.log('\n✅ Price update complete!');
console.log('   Prices updated from your Excel file\n');

db.close();
