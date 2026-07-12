const fs = require("fs");
const path = require("path");

// Plain JSON-file store instead of a native SQL database on purpose: this
// app is used by two people with a small task list, and a native module
// (like better-sqlite3) is one more thing that can fail to compile on a
// host you haven't set up before. A JSON file is enough here and removes
// that whole failure mode. If the business grows into something that
// needs real concurrency/scale, swap this file for a real database —
// tasks.js and claude.js only talk to the functions exported here, so the
// rest of the app doesn't need to change.

const DATA_DIR = path.join(__dirname, "..", "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(
      STORE_PATH,
      JSON.stringify({ nextTaskId: 1, tasks: [], messages: [] }, null, 2)
    );
  }
}

function load() {
  ensureStore();
  return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
}

function save(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

module.exports = { load, save };
