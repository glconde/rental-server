// blockchain logic and backend
// glc 2025
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
const crypto = require("node:crypto");

const dbFile = path.join(__dirname, "data", "blockchain.db");

if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile); // reset db
}

const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS blocks (id INTEGER PRIMARY KEY, prev_hash TEXT, data TEXT, timestamp TEXT)"
  );
});

// create blocks
function createBlock(data, prevHash) {
  const timestamp = new Date().toISOString();
  const block = {
    data,
    prevHash,
    timestamp,
    hash: crypto
      .createHash("sha256")
      .update(data + prevHash + timestamp)
      .digest("hex"),
  };

  // add to the chain
  db.run("INSERT INTO blocks (prev_hash, data, timestamp) VALUES (?, ?, ?)", [
    prevHash,
    JSON.stringify(data),
    timestamp,
  ]);
  return block;
}

// get data
function getBlocks(callback) {
  db.all("SELECT * FROM blocks ORDER BY id", (err, rows) => {
    callback(rows);
  });
}

module.exports = { createBlock, getBlocks };
