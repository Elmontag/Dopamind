const express = require("express");
const cors = require("cors");
const mailRoutes = require("./routes/mail");
const calendarRoutes = require("./routes/calendar");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

app.use("/api/mail", mailRoutes);
app.use("/api/calendar", calendarRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Dopamind API running on port ${PORT}`);
});
