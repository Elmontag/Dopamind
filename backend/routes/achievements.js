const express = require("express");
const { getPool } = require("../db/database");

const router = express.Router();

// GET /api/achievements
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT id, unlocked_at FROM achievements WHERE user_id = $1 ORDER BY unlocked_at ASC",
      [req.user.id]
    );
    res.json(rows.map((r) => ({ id: r.id, unlockedAt: r.unlocked_at })));
  } catch (err) {
    console.error("GET /achievements error:", err);
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

// POST /api/achievements
router.post("/", async (req, res) => {
  const { id } = req.body;
  if (typeof id !== "string" || id.trim() === "") {
    return res.status(400).json({ error: "id is required" });
  }

  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO achievements (id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [id.trim(), req.user.id]
    );
    res.status(201).json({ id: id.trim(), unlockedAt: new Date().toISOString() });
  } catch (err) {
    console.error("POST /achievements error:", err);
    res.status(500).json({ error: "Failed to unlock achievement" });
  }
});

module.exports = router;
