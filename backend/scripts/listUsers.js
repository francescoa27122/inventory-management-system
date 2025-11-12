const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  console.log('\n=== Current Users ===');
  const users = db.prepare('SELECT id, username, role, is_active, last_login FROM users').all();
  
  if (users.length === 0) {
    console.log('No users found in database!');
  } else {
    users.forEach(user => {
      console.log(`\nID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Role: ${user.role}`);
      console.log(`Active: ${user.is_active ? 'Yes' : 'No'}`);
      console.log(`Last Login: ${user.last_login || 'Never'}`);
    });
  }
  
  console.log(`\n📊 Total users: ${users.length}`);
  
  db.close();
} catch (error) {
  console.error('Error:', error.message);
}
