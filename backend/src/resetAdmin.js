const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

console.log('🔄 Resetting admin user...');

// Delete existing admin user
try {
  db.prepare('DELETE FROM users WHERE username = ?').run('admin');
  console.log('✅ Old admin user deleted');
} catch (err) {
  console.log('ℹ️  No existing admin user to delete');
}

// Create fresh admin user
const hashedPassword = bcrypt.hashSync('admin123', 10);
const insert = db.prepare(`
  INSERT INTO users (username, password_hash, full_name, role, is_active)
  VALUES (?, ?, ?, ?, ?)
`);

insert.run('admin', hashedPassword, 'Administrator', 'admin', 1);
console.log('✅ New admin user created');
console.log('');
console.log('Login credentials:');
console.log('  Username: admin');
console.log('  Password: admin123');
console.log('');

// Verify the user was created correctly
const user = db.prepare('SELECT username, role, is_active FROM users WHERE username = ?').get('admin');
console.log('✅ Verification:', user);

db.close();
console.log('');
console.log('✅ Done! You can now login with admin/admin123');
