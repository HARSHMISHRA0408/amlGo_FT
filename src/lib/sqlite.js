import sqlite3 from "sqlite3";
import { open } from "sqlite";

let db;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: "./monthly-reports.db",
      driver: sqlite3.Database,
    });

    // Create monthly_reports table if it does not exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS monthly_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        month TEXT NOT NULL,
        totalSpent REAL NOT NULL,
        topCategory TEXT,
        overbudgetCategories TEXT,
        UNIQUE(userId, month)
      )
    `);
  }
  return db;
}
