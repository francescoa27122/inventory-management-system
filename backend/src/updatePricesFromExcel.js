const xlsx = require('xlsx');
const db = require('./models/database');
const path = require('path');

/**
 * This script updates inventory prices from the FINAL Supplies Table Excel file
 * Run with: node src/updatePricesFromExcel.js
 */

const updatePricesFromExcel = () => {
  console.log('Starting price update from Excel...\n');

  // Path to your Excel file - update this if needed
  const excelFilePath = path.join(__dirname, '../../../FINAL Supplies Table.xlsx');
  
  try {
    // Read the Excel file
    console.log(`Reading Excel file from: ${excelFilePath}`);
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`Found ${data.length} rows in Excel file\n`);

    let updatedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    // Prepare update statement
    const updateStmt = db.prepare(`
      UPDATE inventory_items 
      SET unit_price = ? 
      WHERE item_name = ? OR LOWER(item_name) = LOWER(?)
    `);

    // Process each row
    data.forEach((row, index) => {
      try {
        // Try different column name variations for item name
        const itemName = row['Item Name'] || row['item_name'] || row['Name'] || row['name'] || row['Item'];
        
        // Try different column name variations for price
        const price = parseFloat(
          row['Unit Price'] || row['unit_price'] || row['Price'] || row['price'] || 
          row['Unit Cost'] || row['unit_cost'] || row['Cost'] || row['cost'] || 0
        );

        if (!itemName) {
          console.log(`Row ${index + 2}: Skipping - no item name found`);
          errorCount++;
          return;
        }

        if (!price || price === 0) {
          console.log(`Row ${index + 2}: Skipping "${itemName}" - no valid price found`);
          errorCount++;
          return;
        }

        // Try to update the item
        const result = updateStmt.run(price, itemName, itemName);

        if (result.changes > 0) {
          console.log(`✓ Updated "${itemName}" to $${price.toFixed(2)}`);
          updatedCount++;
        } else {
          console.log(`✗ Item not found: "${itemName}" (price: $${price.toFixed(2)})`);
          notFoundCount++;
        }
      } catch (error) {
        console.error(`Error processing row ${index + 2}:`, error.message);
        errorCount++;
      }
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('UPDATE SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total rows processed: ${data.length}`);
    console.log(`✓ Successfully updated: ${updatedCount}`);
    console.log(`✗ Items not found in database: ${notFoundCount}`);
    console.log(`⚠ Errors/Skipped: ${errorCount}`);
    console.log('='.repeat(60));

    // Show current prices in database
    console.log('\nCurrent inventory prices in database:');
    console.log('='.repeat(60));
    const items = db.prepare('SELECT item_name, unit_price, section FROM inventory_items ORDER BY section, item_name').all();
    items.forEach(item => {
      console.log(`${item.section || 'N/A'} | ${item.item_name}: $${item.unit_price.toFixed(2)}`);
    });

  } catch (error) {
    console.error('\nError reading or processing Excel file:', error.message);
    console.error('Please make sure:');
    console.error('1. The Excel file exists at the specified path');
    console.error('2. The file has columns for item names and prices');
    console.error('3. You have the xlsx package installed (npm install xlsx)');
    process.exit(1);
  }
};

// Run the update
if (require.main === module) {
  updatePricesFromExcel();
}

module.exports = { updatePricesFromExcel };
