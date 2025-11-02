const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'pages', 'Dashboard.js');

console.log('🔧 Updating Dashboard.js...\n');

try {
  let content = fs.readFileSync(dashboardPath, 'utf8');
  
  if (content.includes('item.section === \'Tire Shop\'')) {
    console.log('✅ Dashboard is already updated!');
    process.exit(0);
  }
  
  const oldPattern = /const lowStock = items\.filter\(item => item\.quantity < 100\);/;
  
  if (!oldPattern.test(content)) {
    console.log('⚠️  Could not find the expected code pattern.');
    console.log('   Please manually update the Dashboard.js file.');
    process.exit(1);
  }
  
  const newCode = `// Only show Tire Shop items in low stock alerts
      const lowStock = items.filter(item => item.section === 'Tire Shop' && item.quantity < 100);`;
  
  content = content.replace(oldPattern, newCode);
  fs.writeFileSync(dashboardPath, content, 'utf8');
  
  console.log('✅ Dashboard.js updated successfully!');
  console.log('\nChanges made:');
  console.log('  • Low stock alerts now ONLY show Tire Shop items');
  console.log('  • Main Shop items will not appear in low stock alerts');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
