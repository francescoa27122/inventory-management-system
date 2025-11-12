const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

console.log('\n=== Quick Add User Script ===\n');
console.log('This script adds users directly to the database.\n');

// Example users - MODIFY THESE to add your actual users
const usersToAdd = [
  {
    username: 'john',
    password: 'password123',  // Change this!
    full_name: 'John Doe',
    email: 'john@example.com',
    role: 'user'  // 'user' or 'admin'
  },
  {
    username: 'jane',
    password: 'password123',  // Change this!
    full_name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'admin'
  }
  // Add more users here as needed
];

const addUsers = () => {
  const insert = db.prepare(`
    INSERT INTO users (username, password_hash, full_name, email, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  const checkUser = db.prepare('SELECT username FROM users WHERE username = ?');

  let added = 0;
  let skipped = 0;

  usersToAdd.forEach(user => {
    const exists = checkUser.get(user.username);
    
    if (exists) {
      console.log(`⚠️  Skipped: ${user.username} (already exists)`);
      skipped++;
    } else {
      const hashedPassword = bcrypt.hashSync(user.password, 10);
      insert.run(
        user.username,
        hashedPassword,
        user.full_name,
        user.email,
        user.role
      );
      console.log(`✅ Added: ${user.username} (${user.role})`);
      added++;
    }
  });

  console.log(`\n📊 Summary: ${added} added, ${skipped} skipped`);
};

try {
  addUsers();
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  db.close();
}
