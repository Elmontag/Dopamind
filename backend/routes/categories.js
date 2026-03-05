const express = require("express");
const { getPool } = require("../db/database");

const router = express.Router();

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT id, name, type, color, sort_order FROM categories WHERE user_id = $1 ORDER BY sort_order ASC, created_at ASC",
      [req.user.id]
    );
    res.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type || "area",
      color: r.color || "gray",
      sortOrder: r.sort_order,
    })));
  } catch (err) {
    console.error("GET /categories error:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// POST /api/categories
router.post("/", async (req, res) => {
  const { id, name, type, color, sortOrder } = req.body;
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "name is required" });
  }
  const catId = id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 4));
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO categories (id, user_id, name, type, color, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id, user_id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, updated_at = NOW()
       RETURNING id, name, type, color, sort_order`,
      [catId, req.user.id, name.trim(), type || "area", color || "gray", sortOrder || 0]
    );
    res.status(201).json({
      id: rows[0].id,
      name: rows[0].name,
      type: rows[0].type,
      color: rows[0].color,
      sortOrder: rows[0].sort_order,
    });
  } catch (err) {
    console.error("POST /categories error:", err);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// PUT /api/categories/:id
router.put("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { name, type, color, sortOrder } = req.body;

    const setClauses = [];
    const values = [];
    let idx = 1;
    if (name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(name); }
    if (type !== undefined) { setClauses.push(`type = $${idx++}`); values.push(type); }
    if (color !== undefined) { setClauses.push(`color = $${idx++}`); values.push(color); }
    if (sortOrder !== undefined) { setClauses.push(`sort_order = $${idx++}`); values.push(sortOrder); }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(req.params.id, req.user.id);
    const { rows } = await pool.query(
      `UPDATE categories SET ${setClauses.join(", ")} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING id, name, type, color, sort_order`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: "Category not found" });
    res.json({
      id: rows[0].id,
      name: rows[0].name,
      type: rows[0].type,
      color: rows[0].color,
      sortOrder: rows[0].sort_order,
    });
  } catch (err) {
    console.error("PUT /categories/:id error:", err);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// DELETE /api/categories/:id
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { rowCount } = await pool.query(
      "DELETE FROM categories WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE /categories/:id error:", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

module.exports = router;
