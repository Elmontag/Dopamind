const express = require("express");
const { getDb, addAuditLog } = require("../db/database");
const { authenticate } = require("../middleware/auth");
const { encryptSettings, decryptSettings } = require("../utils/encryption");

const router = express.Router();

router.use(authenticate);

const VALID_TYPES = ["settings", "app_state", "time_tracking"];

// GET /api/user-data/:type
router.get("/:type", (req, res) => {
  try {
    const { type } = req.params;
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid data type" });
    }

    const db = getDb();
    const row = db
      .prepare("SELECT data, updated_at FROM user_data WHERE user_id = ? AND data_type = ?")
      .get(req.user.id, type);

    if (!row) {
      return res.json({ data: {}, updatedAt: null });
    }

    let data = JSON.parse(row.data);
    if (type === "settings") {
      data = decryptSettings(data);
    }

    res.json({ data, updatedAt: row.updated_at });
  } catch (err) {
    console.error(`Get user data (${req.params.type}) error:`, err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// PUT /api/user-data/:type
router.put("/:type", (req, res) => {
  try {
    const { type } = req.params;
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid data type" });
    }

    const { data } = req.body;
    if (data === undefined || data === null) {
      return res.status(400).json({ error: "Data is required" });
    }

    let toStore = data;
    if (type === "settings") {
      toStore = encryptSettings(data);
    }

    const db = getDb();
    db.prepare(
      `INSERT INTO user_data (user_id, data_type, data, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(user_id, data_type)
       DO UPDATE SET data = excluded.data, updated_at = datetime('now')`
    ).run(req.user.id, type, JSON.stringify(toStore));

    res.json({ message: "Data saved", updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error(`Save user data (${req.params.type}) error:`, err);
    res.status(500).json({ error: "Failed to save data" });
  }
});

module.exports = router;
