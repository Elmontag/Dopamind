const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const DATA_FILE = path.join(__dirname, "..", "data", "events.json");

// --- Persistence layer (file-based, upgradeable to CalDAV) ---

function loadEvents() {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
  } catch {}
  return [];
}

function saveEvents(events) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
}

// --- CalDAV helpers (used when caldav config is present) ---

function getCalDavConfig(req) {
  const cfg = req.headers["x-caldav-config"];
  if (!cfg) return null;
  try {
    return JSON.parse(Buffer.from(cfg, "base64").toString());
  } catch {
    return null;
  }
}

async function caldavRequest(url, method, body, auth) {
  const headers = {
    "Content-Type": method === "PUT" ? "text/calendar; charset=utf-8" : "application/xml; charset=utf-8",
    Authorization: "Basic " + Buffer.from(`${auth.user}:${auth.password}`).toString("base64"),
    Depth: "1",
  };

  const res = await fetch(url, { method, headers, body });
  return { status: res.status, text: await res.text() };
}

function toIcal(event) {
  const uid = event.id || Date.now().toString(36);
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  let dtstart, dtend;

  if (event.allDay) {
    dtstart = `DTSTART;VALUE=DATE:${event.date.replace(/-/g, "")}`;
    dtend = "";
  } else {
    const date = event.date.replace(/-/g, "");
    dtstart = `DTSTART:${date}T${(event.start || "09:00").replace(":", "")}00`;
    dtend = `DTEND:${date}T${(event.end || "10:00").replace(":", "")}00`;
  }

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dopamind//Calendar//EN",
    "BEGIN:VEVENT",
    `UID:${uid}@dopamind`,
    `DTSTAMP:${now}`,
    dtstart,
    dtend,
    `SUMMARY:${event.title || ""}`,
    event.description ? `DESCRIPTION:${event.description}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

// --- CalDAV fetch events ---
async function fetchCalDavEvents(config, start, end) {
  const calendarUrl = config.url.replace(/\/$/, "");
  const reportBody = `<?xml version="1.0" encoding="UTF-8"?>
<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:getetag/>
    <c:calendar-data/>
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        ${start ? `<c:time-range start="${start.replace(/-/g, "")}T000000Z" end="${end.replace(/-/g, "")}T235959Z"/>` : ""}
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`;

  const res = await caldavRequest(calendarUrl, "REPORT", reportBody, config);
  if (res.status >= 400) throw new Error(`CalDAV REPORT failed: ${res.status}`);

  // Parse very basic iCal from multistatus response
  const events = [];
  const calDataRegex = /<c(?:al)?:calendar-data[^>]*>([\s\S]*?)<\/c(?:al)?:calendar-data>/gi;
  let match;
  while ((match = calDataRegex.exec(res.text)) !== null) {
    const ical = match[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    const ev = parseIcalEvent(ical);
    if (ev) events.push(ev);
  }
  return events;
}

function parseIcalEvent(ical) {
  const get = (key) => {
    const re = new RegExp(`^${key}[;:](.*)$`, "m");
    const m = ical.match(re);
    return m ? m[1].trim() : null;
  };

  const uid = get("UID");
  const summary = get("SUMMARY");
  const dtstart = get("DTSTART");
  const dtend = get("DTEND");
  const description = get("DESCRIPTION");

  if (!uid || !summary) return null;

  let date, start, end, allDay = false;

  if (dtstart && dtstart.length === 8) {
    // VALUE=DATE format: 20260302
    date = `${dtstart.slice(0, 4)}-${dtstart.slice(4, 6)}-${dtstart.slice(6, 8)}`;
    allDay = true;
  } else if (dtstart) {
    const raw = dtstart.replace(/^.*:/, ""); // strip params
    if (raw.length >= 15) {
      date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      start = `${raw.slice(9, 11)}:${raw.slice(11, 13)}`;
    } else if (raw.length === 8) {
      date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      allDay = true;
    }
  }

  if (dtend && !allDay) {
    const raw = dtend.replace(/^.*:/, "");
    if (raw.length >= 15) {
      end = `${raw.slice(9, 11)}:${raw.slice(11, 13)}`;
    }
  }

  return {
    id: uid.replace(/@.*/, ""),
    title: summary,
    description: description || "",
    date: date || new Date().toISOString().slice(0, 10),
    start: start || null,
    end: end || null,
    allDay,
  };
}

// --- Routes ---

// GET /api/calendar?start=...&end=...
router.get("/", async (req, res) => {
  const caldavConfig = getCalDavConfig(req);
  const { start, end } = req.query;

  if (caldavConfig?.url) {
    try {
      const events = await fetchCalDavEvents(caldavConfig, start, end);
      return res.json(events);
    } catch (err) {
      console.error("CalDAV fetch error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // Fallback: local file storage
  let events = loadEvents();
  if (start) events = events.filter((e) => (e.date || "") >= start);
  if (end) events = events.filter((e) => (e.date || "") <= end);
  res.json(events);
});

// POST /api/calendar
router.post("/", async (req, res) => {
  const caldavConfig = getCalDavConfig(req);
  const event = {
    ...req.body,
    id: req.body.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
  };

  if (caldavConfig?.url) {
    try {
      const calendarUrl = caldavConfig.url.replace(/\/$/, "");
      const ical = toIcal(event);
      const putUrl = `${calendarUrl}/${event.id}.ics`;
      const result = await caldavRequest(putUrl, "PUT", ical, caldavConfig);
      if (result.status >= 400) throw new Error(`CalDAV PUT failed: ${result.status}`);
      return res.status(201).json(event);
    } catch (err) {
      console.error("CalDAV create error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // Fallback: local storage
  const events = loadEvents();
  events.push(event);
  saveEvents(events);
  res.status(201).json(event);
});

// PUT /api/calendar/:id
router.put("/:id", async (req, res) => {
  const caldavConfig = getCalDavConfig(req);
  const event = { ...req.body, id: req.params.id };

  if (caldavConfig?.url) {
    try {
      const calendarUrl = caldavConfig.url.replace(/\/$/, "");
      const ical = toIcal(event);
      const putUrl = `${calendarUrl}/${req.params.id}.ics`;
      const result = await caldavRequest(putUrl, "PUT", ical, caldavConfig);
      if (result.status >= 400) throw new Error(`CalDAV PUT failed: ${result.status}`);
      return res.json(event);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const events = loadEvents();
  const idx = events.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Event not found" });
  events[idx] = { ...events[idx], ...req.body };
  saveEvents(events);
  res.json(events[idx]);
});

// DELETE /api/calendar/:id
router.delete("/:id", async (req, res) => {
  const caldavConfig = getCalDavConfig(req);

  if (caldavConfig?.url) {
    try {
      const calendarUrl = caldavConfig.url.replace(/\/$/, "");
      const delUrl = `${calendarUrl}/${req.params.id}.ics`;
      const result = await caldavRequest(delUrl, "DELETE", null, caldavConfig);
      if (result.status >= 400 && result.status !== 404) {
        throw new Error(`CalDAV DELETE failed: ${result.status}`);
      }
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  let events = loadEvents();
  events = events.filter((e) => e.id !== req.params.id);
  saveEvents(events);
  res.json({ success: true });
});

// POST /api/calendar/test
router.post("/test", async (req, res) => {
  const caldavConfig = getCalDavConfig(req);
  if (!caldavConfig?.url) return res.status(400).json({ error: "CalDAV not configured" });

  try {
    const result = await caldavRequest(caldavConfig.url, "PROPFIND", null, caldavConfig);
    if (result.status >= 400) throw new Error(`HTTP ${result.status}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
