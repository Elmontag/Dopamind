const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data", "dopamind.db");

let db;

function getDb() {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema();
    ensureAdminExists();
  }
  return db;
}

function initSchema() {
  const d = db;

  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      email_verified INTEGER NOT NULL DEFAULT 0,
      verification_token TEXT,
      reset_token TEXT,
      reset_token_expires INTEGER,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login TEXT
    );
  `);

  d.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      action TEXT NOT NULL,
      detail TEXT,
      ip TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);
}

function ensureAdminExists() {
  const d = db;
  const admin = d.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (!admin) {
    const bcrypt = require("bcryptjs");
    const { v4: uuidv4 } = require("uuid");
    const defaultEmail = process.env.ADMIN_EMAIL || "admin@dopamind.local";
    const defaultPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString("hex");
    const hash = bcrypt.hashSync(defaultPassword, 12);
    d.prepare(
      "INSERT INTO users (id, email, name, password_hash, role, email_verified, active) VALUES (?, ?, ?, ?, 'admin', 1, 1)"
    ).run(uuidv4(), defaultEmail, "Admin", hash);
    if (!process.env.ADMIN_PASSWORD) {
      console.log(`\n=== Default admin created ===`);
      console.log(`Email:    ${defaultEmail}`);
      console.log(`Password: ${defaultPassword}`);
      console.log(`Change this password immediately!\n`);
    }
  }
}

function addAuditLog(userId, action, detail, ip) {
  const d = getDb();
  d.prepare("INSERT INTO audit_log (user_id, action, detail, ip) VALUES (?, ?, ?, ?)").run(
    userId || null,
    action,
    detail || null,
    ip || null
  );
}

module.exports = { getDb, addAuditLog };
