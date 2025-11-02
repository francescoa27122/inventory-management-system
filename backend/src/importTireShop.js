const Database = require('better-sqlite3');
const xlsx = require('xlsx');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

console.log('🚀 Importing Tire Shop inventory...');

// Path to your FINAL Supplies Table.xlsx
const excelFilePath = '/Users/francescoassalone/Desktop/FINAL Supplies Table.xlsx';

try {
  // Read the Excel file
  const workbook = xlsx.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  console.log(`📊 Found ${data.length} rows in Excel file`);

  // Prepare insert statement
  const insert = db.prepare(`
    INSERT INTO inventory_items (
      item_name, description, category, quantity, unit_price,
      supplier, location, sku, section, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Tire Shop', 1)
  `);

  let successful = 0;
  let failed = 0;
  const errors = [];

  // Import each row
  data.forEach((row, index) => {
    try {
      // Try different possible column names
      const item_name = row['Item Name'] || row['item_name'] || row['Name'] || row['name'] || row['Item'] || row['Product'];
      const description = row['Description'] || row['description'] || row['Desc'] || '';
      const category = row['Category'] || row['category'] || row['Type'] || 'Tire Shop Supplies';
      const quantity = parseInt(row['Quantity'] || row['quantity'] || row['Qty'] || row['qty'] || row['Stock'] || 0);
      const unit_price = parseFloat(row['Unit Price'] || row['unit_price'] || row['Price'] || row['price'] || row['Cost'] || 0);
      const supplier = row['Supplier'] || row['supplier'] || row['Vendor'] || '';
      const location = row['Location'] || row['location'] || 'Tire Shop';
      const sku = row['SKU'] || row['sku'] || row['Part Number'] || row['part_number'] || null;

      if (!item_name) {
        failed++;
        errors.push({
          row: index + 2,
          error: 'Missing item name'
        });
        return;
      }

      insert.run(
        item_name,
        description,
        category,
        quantity,
        unit_price,
        supplier,
        location,
        sku
      );

      successful++;
    } catch (error) {
      failed++;
      errors.push({
        row: index + 2,
        item: row['Item Name'] || row['item_name'] || 'Unknown',
        error: error.message
      });
    }
  });

  console.log('\n📈 Import Summary:');
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  Errors:');
    errors.forEach(err => {
      console.log(`   Row ${err.row}: ${err.error}`);
    });
  }

  console.log('\n✅ Tire Shop inventory import complete!');

} catch (error) {
  console.error('❌ Error importing Excel file:', error.message);
  process.exit(1);
}

db.close();
