#!/usr/bin/env node

console.log('🚀 Starting Inventory Management System Updates\n');
console.log('='.repeat(60));
console.log('\nThis script will:');
console.log('  1. Fix prices for all Tire Shop inventory items');
console.log('  2. Update Dashboard to show only Tire Shop low stock alerts');
console.log('\n' + '='.repeat(60) + '\n');

const { execSync } = require('child_process');
const path = require('path');

console.log('📝 STEP 1: Updating Tire Shop Prices\n');
try {
  const priceScript = path.join(__dirname, 'updateTireShopPrices.js');
  execSync(`node "${priceScript}"`, { stdio: 'inherit' });
  console.log('\n');
} catch (error) {
  console.error('❌ Failed to update prices');
  process.exit(1);
}

console.log('📝 STEP 2: Updating Dashboard\n');
try {
  const dashboardScript = path.join(__dirname, 'updateDashboard.js');
  execSync(`node "${dashboardScript}"`, { stdio: 'inherit' });
  console.log('\n');
} catch (error) {
  console.error('❌ Failed to update dashboard');
  process.exit(1);
}

console.log('='.repeat(60));
console.log('\n✅ ALL UPDATES COMPLETED SUCCESSFULLY!\n');
console.log('Next steps:');
console.log('  1. Restart your backend server');
console.log('  2. Restart your frontend server');
console.log('  3. Refresh your browser\n');
console.log('='.repeat(60) + '\n');
