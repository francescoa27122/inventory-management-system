const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, 'Jobs_Updated.js');
const targetFile = path.join(__dirname, '..', '..', 'frontend', 'src', 'pages', 'Jobs.js');

console.log('🔧 Updating Jobs.js with tabs for Current/Completed jobs...\n');

try {
  // Read the updated content
  const content = fs.readFileSync(sourceFile, 'utf8');
  
  // Backup the original file
  if (fs.existsSync(targetFile)) {
    const backupFile = targetFile + '.backup';
    fs.copyFileSync(targetFile, backupFile);
    console.log('✅ Backup created at:', backupFile);
  }
  
  // Write the new content
  fs.writeFileSync(targetFile, content, 'utf8');
  
  console.log('✅ Jobs.js updated successfully!\n');
  console.log('Changes made:');
  console.log('  • Added tabs to switch between Current and Completed jobs');
  console.log('  • Current Jobs: Shows Active and Cancelled jobs');
  console.log('  • Completed Jobs: Shows only completed jobs');
  console.log('  • Added "Reopen Job" button for completed jobs');
  console.log('  • Shows job counts in each tab');
  console.log('\nNext steps:');
  console.log('  1. Restart your frontend server (Ctrl+C then npm start)');
  console.log('  2. Refresh your browser');
  console.log('  3. Navigate to Jobs page to see the new tabs\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\nTroubleshooting:');
  console.error('  • Make sure the frontend folder exists');
  console.error('  • Check that Jobs.js exists in frontend/src/pages/');
  console.error('  • Verify you have write permissions');
  process.exit(1);
}
