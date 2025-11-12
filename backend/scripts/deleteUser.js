const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

const username = process.argv[2] || 'asdf'; // Get username from command line or default to 'asdf'

try {
  // Find the user
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (user) {
    // Delete the user
    db.prepare('DELETE FROM users WHERE username = ?').run(username);
    console.log(`✅ User "${username}" has been deleted`);
  } else {
    console.log(`❌ User "${username}" not found`);
  }

  // Show remaining users
  const users = db.prepare('SELECT id, username, role FROM users').all();
  console.log('\n📋 Remaining users:');
  users.forEach(u => console.log(`  - ${u.username} (${u.role})`));
  
} catch (error) {
  console.error('Error:', error.message);
} finally {
  db.close();
}
