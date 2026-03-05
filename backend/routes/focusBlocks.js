const express = require("express");
const { getPool } = require("../db/database");

const router = express.Router();

// GET /api/focus-blocks?date=YYYY-MM-DD
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const { date } = req.query;

    let query, params;
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      query = `SELECT * FROM focus_blocks WHERE user_id = $1 AND date = $2 ORDER BY created_at ASC`;
      params = [req.user.id, date];
    } else {
      query = `SELECT * FROM focus_blocks WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`;
      params = [req.user.id];
    }

    const { rows } = await pool.query(query, params);
    res.json(rows.map((r) => ({
      id: r.id,
      date: r.date,
      startTime: r.start_time,
      durationMinutes: r.duration_minutes,
      type: r.type,
      createdAt: r.created_at,
    })));
  } catch (err) {
    console.error("GET /focus-blocks error:", err);
    res.status(500).json({ error: "Failed to fetch focus blocks" });
  }
});

// POST /api/focus-blocks
router.post("/", async (req, res) => {
  const { date, startTime, durationMinutes, type } = req.body;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
    return res.status(400).json({ error: "date is required (YYYY-MM-DD)" });
  }
  if (typeof durationMinutes !== "number" || durationMinutes <= 0) {
    return res.status(400).json({ error: "durationMinutes must be a positive number" });
  }

  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO focus_blocks (user_id, date, start_time, duration_minutes, type)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, date, startTime || null, durationMinutes, type || "focus"]
    );
    const r = rows[0];
    res.status(201).json({
      id: r.id,
      date: r.date,
      startTime: r.start_time,
      durationMinutes: r.duration_minutes,
      type: r.type,
      createdAt: r.created_at,
    });
  } catch (err) {
    console.error("POST /focus-blocks error:", err);
    res.status(500).json({ error: "Failed to log focus block" });
  }
});

module.exports = router;
