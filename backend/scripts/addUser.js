const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const readline = require('readline');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function addUser() {
  console.log('\n=== Add New User ===\n');

  try {
    const username = await question('Username: ');
    const password = await question('Password: ');
    const fullName = await question('Full Name: ');
    const email = await question('Email (optional): ');
    const role = await question('Role (admin/user) [user]: ') || 'user';

    // Validate inputs
    if (!username || !password) {
      console.log('❌ Username and password are required!');
      rl.close();
      db.close();
      return;
    }

    // Check if username already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existingUser) {
      console.log('❌ Username already exists!');
      rl.close();
      db.close();
      return;
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    const insert = db.prepare(`
      INSERT INTO users (username, password_hash, full_name, email, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    insert.run(username, hashedPassword, fullName || username, email || null, role);

    console.log('\n✅ User created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Role: ${role}`);
    console.log(`Full Name: ${fullName || username}`);
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  }

  rl.close();
  db.close();
}

// Run the script
addUser();
