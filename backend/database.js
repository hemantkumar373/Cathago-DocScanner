const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("documents.db");

db.serialize(() => {
  // Unified users table with role system
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('user', 'admin')),
        approved INTEGER DEFAULT 0,
        credits INTEGER DEFAULT 20,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  // Credit requests table
  db.run(`CREATE TABLE IF NOT EXISTS credit_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT,
    credits INTEGER,
    approved_credits INTEGER,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    rejection_reason TEXT,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_email) REFERENCES users(email)
    )`);

  // Documents table
  db.run(`CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT,
        file_name TEXT,
        content TEXT,
        scan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        credits_used INTEGER DEFAULT 1,
        FOREIGN KEY(user_email) REFERENCES users(email)
    )`);
    
  // Add this table creation
  db.run(`CREATE TABLE IF NOT EXISTS document_similarity (
    document_id1 INTEGER,
    document_id2 INTEGER,
    similarity_percentage REAL NOT NULL,
    matching_passages TEXT,
    PRIMARY KEY (document_id1, document_id2),
    FOREIGN KEY(document_id1) REFERENCES documents(id),
    FOREIGN KEY(document_id2) REFERENCES documents(id)
    )`);
});

module.exports = db;
