const express = require("express");
const router = express.Router();

// In-memory store for demo (CalDAV integration would replace this)
// CalDAV implementation requires the caldav-client library and a real server.
// This provides the API contract for the frontend.
let events = [];

// GET /api/calendar?start=...&end=...
router.get("/", (req, res) => {
  const { start, end } = req.query;
  let filtered = events;
  if (start) filtered = filtered.filter((e) => (e.date || e.start) >= start);
  if (end) filtered = filtered.filter((e) => (e.date || e.start) <= end);
  res.json(filtered);
});

// POST /api/calendar
router.post("/", (req, res) => {
  const event = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ...req.body,
  };
  events.push(event);
  res.status(201).json(event);
});

// PUT /api/calendar/:id
router.put("/:id", (req, res) => {
  const idx = events.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Event not found" });
  events[idx] = { ...events[idx], ...req.body };
  res.json(events[idx]);
});

// DELETE /api/calendar/:id
router.delete("/:id", (req, res) => {
  events = events.filter((e) => e.id !== req.params.id);
  res.json({ success: true });
});

module.exports = router;
