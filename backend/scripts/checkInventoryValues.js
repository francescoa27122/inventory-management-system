const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

console.log('🔍 Checking Inventory Values...\n');

// Get Tire Shop items
const tireShopItems = db.prepare(`
  SELECT item_name, quantity, unit_price, (quantity * unit_price) as total_value
  FROM inventory_items 
  WHERE section = ?
  ORDER BY total_value DESC
  LIMIT 10
`).all('Tire Shop');

console.log('=== TIRE SHOP (Top 10 by Value) ===');
tireShopItems.forEach(item => {
  const value = item.quantity * item.unit_price;
  console.log(`${item.item_name}: ${item.quantity} × $${item.unit_price.toFixed(2)} = $${value.toFixed(2)}`);
});

// Get total for all Tire Shop
const tireShopSum = db.prepare(`
  SELECT 
    COUNT(*) as count,
    SUM(quantity * unit_price) as total_value,
    SUM(quantity) as total_quantity
  FROM inventory_items 
  WHERE section = ?
`).get('Tire Shop');

console.log(`\nTire Shop Total: ${tireShopSum.count} items, ${tireShopSum.total_quantity} units`);
console.log(`Tire Shop Value: $${tireShopSum.total_value.toFixed(2)}`);

// Get Main Shop items
const mainShopItems = db.prepare(`
  SELECT item_name, quantity, unit_price, (quantity * unit_price) as total_value
  FROM inventory_items 
  WHERE section = ?
  ORDER BY total_value DESC
  LIMIT 10
`).all('Main Shop');

console.log('\n=== MAIN SHOP (Body Shop) - Top 10 by Value ===');
mainShopItems.forEach(item => {
  const value = item.quantity * item.unit_price;
  console.log(`${item.item_name}: ${item.quantity} × $${item.unit_price.toFixed(2)} = $${value.toFixed(2)}`);
});

// Get total for all Main Shop
const mainShopSum = db.prepare(`
  SELECT 
    COUNT(*) as count,
    SUM(quantity * unit_price) as total_value,
    SUM(quantity) as total_quantity
  FROM inventory_items 
  WHERE section = ?
`).get('Main Shop');

console.log(`\nMain Shop Total: ${mainShopSum.count} items, ${mainShopSum.total_quantity} units`);
console.log(`Main Shop Value: $${mainShopSum.total_value.toFixed(2)}`);

console.log('\n=== SUMMARY ===');
console.log(`Tire Shop: $${tireShopSum.total_value.toFixed(2)}`);
console.log(`Body Shop: $${mainShopSum.total_value.toFixed(2)}`);
console.log(`Total: $${(tireShopSum.total_value + mainShopSum.total_value).toFixed(2)}`);

db.close();
