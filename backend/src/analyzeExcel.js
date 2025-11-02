const xlsx = require('xlsx');
const path = require('path');

// Read the Excel file
const filePath = '/Users/francescoassalone/Downloads/Final Part Sheet.xlsx';
const workbook = xlsx.readFile(filePath);

// Get the first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = xlsx.utils.sheet_to_json(worksheet);

console.log('=== EXCEL FILE ANALYSIS ===\n');
console.log(`Total rows: ${data.length}\n`);

if (data.length > 0) {
  console.log('Column headers:');
  console.log(Object.keys(data[0]));
  console.log('\nFirst 5 rows:');
  console.log(JSON.stringify(data.slice(0, 5), null, 2));
  
  // Analyze part numbers for patterns
  console.log('\n=== PART NUMBER ANALYSIS ===');
  const partNumbers = data.map(row => row['Part Number'] || row['part_number'] || row['PartNumber'] || '').filter(p => p);
  
  if (partNumbers.length > 0) {
    console.log(`\nTotal part numbers: ${partNumbers.length}`);
    console.log('\nSample part numbers:');
    partNumbers.slice(0, 10).forEach(pn => console.log(`  - ${pn}`));
    
    // Look for patterns
    const patterns = {};
    partNumbers.forEach(pn => {
      const prefix = pn.toString().substring(0, 3);
      patterns[prefix] = (patterns[prefix] || 0) + 1;
    });
    
    console.log('\nPart number prefixes (first 3 characters):');
    Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([prefix, count]) => {
        console.log(`  ${prefix}: ${count} parts`);
      });
  }
  
  // Analyze brands
  const brandColumn = Object.keys(data[0]).find(k => 
    k.toLowerCase().includes('brand') || 
    k.toLowerCase().includes('manufacturer') ||
    k.toLowerCase().includes('make')
  );
  
  if (brandColumn) {
    console.log('\n=== BRAND ANALYSIS ===');
    const brands = {};
    data.forEach(row => {
      const brand = row[brandColumn];
      if (brand) {
        brands[brand] = (brands[brand] || 0) + 1;
      }
    });
    
    console.log('\nBrands found:');
    Object.entries(brands)
      .sort((a, b) => b[1] - a[1])
      .forEach(([brand, count]) => {
        console.log(`  ${brand}: ${count} parts`);
      });
  }
}

// Save the data to a JSON file for review
const fs = require('fs');
fs.writeFileSync(
  path.join(__dirname, '..', 'excel-data-analysis.json'),
  JSON.stringify(data, null, 2)
);

console.log('\n✅ Full data saved to backend/excel-data-analysis.json');
