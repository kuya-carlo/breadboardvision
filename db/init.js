const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');

// Ensure parent directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  }
});

function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. STUDENT_SESSION Table
      db.run(`
        CREATE TABLE IF NOT EXISTS STUDENT_SESSION (
          session_id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL
        )
      `, (err) => { if (err) reject(err); });

      // 2. CIRCUIT_SUBMISSION Table
      db.run(`
        CREATE TABLE IF NOT EXISTS CIRCUIT_SUBMISSION (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          submission_type TEXT NOT NULL,
          file_path TEXT,
          netlist_content TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY (session_id) REFERENCES STUDENT_SESSION(session_id)
        )
      `, (err) => { if (err) reject(err); });

      // 3. FEEDBACK_LOG Table
      db.run(`
        CREATE TABLE IF NOT EXISTS FEEDBACK_LOG (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          submission_id INTEGER NOT NULL,
          status TEXT NOT NULL,
          detected_errors TEXT NOT NULL,
          guide_steps TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (submission_id) REFERENCES CIRCUIT_SUBMISSION(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database initialized successfully at:', dbPath);
          resolve();
        }
      });
    });
  });
}

// If run directly
if (require.main === module) {
  initDb().then(() => {
    db.close();
  }).catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
}

module.exports = {
  db,
  initDb
};
