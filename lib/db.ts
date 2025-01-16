import * as sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { hash, compare } from 'bcrypt'

// Extend the database initialization
export async function initializeDb() {
  const db = await open({
    filename: './slowflux.db',
    driver: sqlite3.Database
  })
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS analysis_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      domain TEXT NOT NULL,
      dig_output TEXT NOT NULL,
      result TEXT NOT NULL,
      a_records INTEGER NOT NULL,
      ttl_value INTEGER NOT NULL,
      ns_records INTEGER NOT NULL,
      domain_length INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      analysis_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (analysis_id) REFERENCES analysis_history(id)
    );

    CREATE TABLE IF NOT EXISTS whitelisted_domains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT UNIQUE NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Insert default whitelisted domains
    INSERT OR IGNORE INTO whitelisted_domains (domain, reason) VALUES 
    ('google.com', 'Legitimate load balancer configuration');
  `)

  return db
}

export async function createUser(username: string, password: string) {
  const db = await initializeDb()
  const hashedPassword = await hash(password, 10)
  
  try {
    await db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    )
    return true
  } catch (error) {
    if ((error as any).code === 'SQLITE_CONSTRAINT') {
      return false // Username already exists
    }
    throw error
  }
}

export async function verifyUser(username: string, password: string) {
  const db = await initializeDb()
  const user = await db.get('SELECT * FROM users WHERE username = ?', username)
  
  if (!user) {
    return null
  }

  const valid = await compare(password, user.password)
  if (!valid) {
    return null
  }

  return { id: user.id, username: user.username }
}

