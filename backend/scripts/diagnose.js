const Database = require('better-sqlite3');
const path = require('path');

console.log('🔍 DIAGNOSTIC CHECK - Inventory System\n');
console.log('=' .repeat(60));

// Check 1: Database file exists
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const fs = require('fs');

console.log('\n1. DATABASE FILE CHECK');
console.log('   Path:', dbPath);
if (fs.existsSync(dbPath)) {
  console.log('   ✅ Database file exists');
  const stats = fs.statSync(dbPath);
  console.log('   Size:', (stats.size / 1024).toFixed(2), 'KB');
} else {
  console.log('   ❌ Database file NOT FOUND');
  process.exit(1);
}

// Check 2: Can connect to database
console.log('\n2. DATABASE CONNECTION CHECK');
try {
  const db = new Database(dbPath);
  console.log('   ✅ Successfully connected to database');
  
  // Check 3: Tables exist
  console.log('\n3. TABLES CHECK');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('   Found tables:', tables.map(t => t.name).join(', '));
  
  if (tables.find(t => t.name === 'inventory_items')) {
    console.log('   ✅ inventory_items table exists');
  } else {
    console.log('   ❌ inventory_items table NOT FOUND');
    db.close();
    process.exit(1);
  }
  
  // Check 4: Data exists
  console.log('\n4. DATA CHECK');
  const itemCount = db.prepare('SELECT COUNT(*) as count FROM inventory_items').get();
  console.log('   Total items:', itemCount.count);
  
  if (itemCount.count > 0) {
    console.log('   ✅ Database has data');
    
    // Show breakdown by section
    const sections = db.prepare(`
      SELECT section, COUNT(*) as count 
      FROM inventory_items 
      GROUP BY section
    `).all();
    
    console.log('\n   Items by section:');
    sections.forEach(s => {
      console.log(`   - ${s.section}: ${s.count} items`);
    });
    
    // Check for items with prices
    const withPrices = db.prepare('SELECT COUNT(*) as count FROM inventory_items WHERE unit_price > 0').get();
    const withoutPrices = db.prepare('SELECT COUNT(*) as count FROM inventory_items WHERE unit_price = 0').get();
    
    console.log('\n   Price status:');
    console.log(`   - With prices: ${withPrices.count} items`);
    console.log(`   - Without prices (0): ${withoutPrices.count} items`);
    
  } else {
    console.log('   ⚠️  Database is empty - run npm run init-db');
  }
  
  // Check 5: Sample query (what the API does)
  console.log('\n5. API QUERY SIMULATION');
  try {
    const sampleItems = db.prepare('SELECT id, item_name, section, quantity, unit_price FROM inventory_items LIMIT 5').all();
    console.log('   ✅ Successfully queried items');
    console.log('\n   Sample items:');
    sampleItems.forEach(item => {
      console.log(`   - ${item.item_name} (${item.section}): $${item.unit_price}`);
    });
  } catch (error) {
    console.log('   ❌ Query failed:', error.message);
  }
  
  db.close();
  
} catch (error) {
  console.log('   ❌ Database connection failed:', error.message);
  process.exit(1);
}

// Check 6: Backend server file
console.log('\n6. BACKEND SERVER CHECK');
const serverPath = path.join(__dirname, '..', 'src', 'server.js');
if (fs.existsSync(serverPath)) {
  console.log('   ✅ server.js exists');
} else {
  console.log('   ❌ server.js NOT FOUND');
}

// Check 7: Routes file
console.log('\n7. ROUTES CHECK');
const routesPath = path.join(__dirname, '..', 'src', 'routes', 'inventory.js');
if (fs.existsSync(routesPath)) {
  console.log('   ✅ inventory.js routes exist');
} else {
  console.log('   ❌ inventory.js routes NOT FOUND');
}

console.log('\n' + '='.repeat(60));
console.log('\n📋 NEXT STEPS:\n');
console.log('1. Make sure backend is running:');
console.log('   cd ~/Desktop/inventory-management-system/backend');
console.log('   npm start');
console.log('');
console.log('2. Check backend terminal for errors');
console.log('');
console.log('3. Test backend directly:');
console.log('   curl http://localhost:3001/api/health');
console.log('');
console.log('4. If backend not responding, restart it');
console.log('');
