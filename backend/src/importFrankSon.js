const xlsx = require('xlsx');
const Database = require('better-sqlite3');
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

const filePath = '/Users/francescoassalone/Downloads/Final Part Sheet.xlsx';

console.log('🚀 Importing Frank & Son Auto Body inventory...\n');

// Read the Excel file
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);

console.log(`📊 Found ${data.length} parts to import\n`);

// Clear existing sample data first
console.log('🗑️  Clearing sample data...');
db.exec(`DELETE FROM inventory_items WHERE supplier IN ('ABC Supply', 'Electric Co', 'Builder Supply', 'Hardware Plus', 'Lumber Yard', 'Paint Store')`);
console.log('✓ Sample data cleared\n');

// Function to detect brand from part number or name
function detectBrand(partNumber, partName) {
  const pn = String(partNumber || '').toUpperCase();
  const name = String(partName || '').toUpperCase();
  
  // BMW detection
  if (pn.includes('51') || pn.includes('BMW') || name.includes('BMW') || name.includes('M5') || name.includes('M4')) {
    return 'BMW';
  }
  
  // Land Rover detection
  if (pn.startsWith('LR') || name.includes('LAND ROVER') || name.includes('RANGE ROVER') || name.includes('DEFENDER')) {
    return 'Land Rover';
  }
  
  // Mercedes detection
  if (pn.startsWith('A') && pn.length > 10 || name.includes('MERCEDES') || name.includes('BENZ')) {
    return 'Mercedes-Benz';
  }
  
  // Lexus detection
  if (name.includes('LEXUS')) {
    return 'Lexus';
  }
  
  // Toyota detection
  if (name.includes('TOYOTA')) {
    return 'Toyota';
  }
  
  // Audi detection
  if (pn.startsWith('4') && pn.length > 10 || name.includes('AUDI')) {
    return 'Audi';
  }
  
  // Volkswagen detection
  if (name.includes('VOLKSWAGEN') || name.includes('TIGUAN')) {
    return 'Volkswagen';
  }
  
  // Porsche detection
  if (name.includes('PORSCHE')) {
    return 'Porsche';
  }
  
  // Subaru detection
  if (name.includes('SUBARU')) {
    return 'Subaru';
  }
  
  // Mazda detection
  if (name.includes('MAZDA')) {
    return 'Mazda';
  }
  
  // Chevy detection
  if (name.includes('CHEVY') || name.includes('CHEVROLET')) {
    return 'Chevrolet';
  }
  
  // Generic detection
  if (name.includes('GAS CAP') || name.includes('FUEL')) {
    return 'Universal';
  }
  
  return 'BMW'; // Default to BMW since most parts appear to be BMW
}

// Function to categorize parts
function categorizepart(partName) {
  const name = String(partName || '').toUpperCase();
  
  if (name.includes('AIR') && (name.includes('DUCT') || name.includes('DEFLECTOR') || name.includes('INLET') || name.includes('BREATHER'))) {
    return 'Air System';
  }
  if (name.includes('GAS CAP') || name.includes('FUEL')) {
    return 'Fuel System';
  }
  if (name.includes('COVER') || name.includes('ACCESS') || name.includes('PANEL') || name.includes('TRIM')) {
    return 'Body Panels';
  }
  if (name.includes('BUMPER')) {
    return 'Bumper Parts';
  }
  if (name.includes('GRILLE') || name.includes('GRILL') || name.includes('KIDNEY')) {
    return 'Grilles';
  }
  if (name.includes('LIGHT') || name.includes('LAMP')) {
    return 'Lighting';
  }
  if (name.includes('MIRROR')) {
    return 'Mirrors';
  }
  if (name.includes('HOOD') || name.includes('BONNET')) {
    return 'Hood Parts';
  }
  if (name.includes('DOOR') || name.includes('WEATHERSTRIP')) {
    return 'Doors & Seals';
  }
  if (name.includes('FENDER') || name.includes('WING') || name.includes('LINER')) {
    return 'Fenders';
  }
  if (name.includes('BRACKET') || name.includes('SUPPORT') || name.includes('MOUNT')) {
    return 'Brackets & Supports';
  }
  if (name.includes('MOLDING') || name.includes('GARNISH')) {
    return 'Exterior Trim';
  }
  if (name.includes('RADIATOR') || name.includes('COOLER')) {
    return 'Cooling System';
  }
  if (name.includes('WHEEL') || name.includes('TIRE')) {
    return 'Wheels & Tires';
  }
  if (name.includes('SUSPENSION') || name.includes('STRUT')) {
    return 'Suspension';
  }
  if (name.includes('TRANSMISSION')) {
    return 'Transmission';
  }
  if (name.includes('BELT')) {
    return 'Belts & Cables';
  }
  if (name.includes('GLASS') || name.includes('WINDOW')) {
    return 'Glass';
  }
  if (name.includes('TRUNK') || name.includes('TAILGATE')) {
    return 'Trunk Parts';
  }
  
  return 'General Parts';
}

// Import function
const importData = () => {
  const insert = db.prepare(`
    INSERT INTO inventory_items (
      item_name, sku, quantity, unit_price, category, supplier, location, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let successful = 0;
  let failed = 0;
  const errors = [];

  console.log('Importing parts:\n');

  data.forEach((row, index) => {
    try {
      const partNumber = row['Part #'] || '';
      const partName = row['Part Name'] || '';
      const quantity = parseInt(row['Quantity']) || 1;
      const binNumber = row['Bin #'] || '';
      
      if (!partName || !partNumber) {
        failed++;
        errors.push(`Row ${index + 2}: Missing part name or number`);
        return;
      }

      const brand = detectBrand(partNumber, partName);
      const category = categorizepart(partName);
      
      // Set default price (you can update these later)
      const unitPrice = 0.00;
      
      // Format part number as SKU
      const sku = String(partNumber).replace(/\s+/g, '-');
      
      // Set location based on bin number
      const location = binNumber ? `Bin ${binNumber}` : 'Shop Floor';
      
      // Create notes with original part number
      const notes = `Part #: ${partNumber}`;
      
      insert.run(
        partName,
        sku,
        quantity,
        unitPrice,
        category,
        brand,
        location,
        notes
      );

      successful++;
      
      // Show progress every 10 items
      if (successful % 10 === 0) {
        console.log(`  ✓ Imported ${successful} parts...`);
      }
    } catch (error) {
      failed++;
      errors.push(`Row ${index + 2}: ${error.message}`);
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log('📈 IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully imported: ${successful} parts`);
  console.log(`❌ Failed: ${failed} parts`);
  
  if (errors.length > 0 && errors.length < 10) {
    console.log('\n⚠️  Errors:');
    errors.forEach(err => console.log(`   ${err}`));
  }
  
  // Show brand distribution
  console.log('\n' + '='.repeat(50));
  console.log('🏢 PARTS BY BRAND');
  console.log('='.repeat(50));
  
  const brandStats = db.prepare(`
    SELECT supplier as brand, COUNT(*) as count 
    FROM inventory_items 
    WHERE supplier IS NOT NULL 
    GROUP BY supplier 
    ORDER BY count DESC
  `).all();
  
  brandStats.forEach(stat => {
    console.log(`   ${stat.brand}: ${stat.count} parts`);
  });
  
  // Show category distribution
  console.log('\n' + '='.repeat(50));
  console.log('📦 PARTS BY CATEGORY');
  console.log('='.repeat(50));
  
  const categoryStats = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM inventory_items 
    WHERE category IS NOT NULL 
    GROUP BY category 
    ORDER BY count DESC
  `).all();
  
  categoryStats.forEach(stat => {
    console.log(`   ${stat.category}: ${stat.count} parts`);
  });
  
  // Show location distribution
  console.log('\n' + '='.repeat(50));
  console.log('📍 PARTS BY LOCATION');
  console.log('='.repeat(50));
  
  const locationStats = db.prepare(`
    SELECT location, COUNT(*) as count 
    FROM inventory_items 
    WHERE location IS NOT NULL 
    GROUP BY location 
    ORDER BY count DESC
  `).all();
  
  locationStats.forEach(stat => {
    console.log(`   ${stat.location}: ${stat.count} parts`);
  });
  
  console.log('\n✨ Import complete! Your Frank & Son Auto Body inventory is ready!\n');
};

// Run the import
try {
  importData();
  db.close();
} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error(error);
  db.close();
  process.exit(1);
}
