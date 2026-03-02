const express = require("express");
const { ImapFlow } = require("imapflow");
const nodemailer = require("nodemailer");
const { simpleParser } = require("mailparser");

const router = express.Router();

// Create IMAP client from request headers (credentials per-request)
function createImapClient(config) {
  return new ImapFlow({
    host: config.host,
    port: config.port || 993,
    secure: config.tls !== false,
    auth: { user: config.user, pass: config.password },
    logger: false,
  });
}

function getMailConfig(req) {
  const cfg = req.headers["x-mail-config"];
  if (!cfg) return null;
  try { return JSON.parse(Buffer.from(cfg, "base64").toString()); }
  catch { return null; }
}

// GET /api/mail?folder=INBOX
router.get("/", async (req, res) => {
  const config = getMailConfig(req);
  if (!config) return res.status(400).json({ error: "Mail not configured" });

  const client = createImapClient(config);
  try {
    await client.connect();
    const folder = req.query.folder || "INBOX";
    const lock = await client.getMailboxLock(folder);

    try {
      const messages = [];
      // Fetch last 50 messages
      const totalMessages = client.mailbox.exists;
      const startSeq = Math.max(1, totalMessages - 49);

      for await (const msg of client.fetch(`${startSeq}:*`, {
        uid: true,
        envelope: true,
        flags: true,
        bodyStructure: true,
        source: { maxLength: 2048 },
      })) {
        const parsed = msg.source ? await simpleParser(msg.source) : null;
        messages.push({
          uid: msg.uid,
          subject: msg.envelope.subject || "(no subject)",
          from: msg.envelope.from?.[0]?.address || "unknown",
          fromName: msg.envelope.from?.[0]?.name || "",
          date: msg.envelope.date?.toISOString(),
          seen: msg.flags.has("\\Seen"),
          flagged: msg.flags.has("\\Flagged"),
          preview: parsed?.text?.slice(0, 200) || "",
          tags: [],
        });
      }

      res.json(messages.reverse());
    } finally {
      lock.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.logout().catch(() => {});
  }
});

// GET /api/mail/:uid - full message
router.get("/:uid", async (req, res) => {
  const config = getMailConfig(req);
  if (!config) return res.status(400).json({ error: "Mail not configured" });

  const client = createImapClient(config);
  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      const msg = await client.fetchOne(req.params.uid, { source: true }, { uid: true });
      const parsed = await simpleParser(msg.source);
      res.json({
        uid: Number(req.params.uid),
        subject: parsed.subject,
        from: parsed.from?.text || "",
        to: parsed.to?.text || "",
        cc: parsed.cc?.text || "",
        date: parsed.date?.toISOString(),
        body: parsed.text || "",
        html: parsed.html || "",
      });
    } finally {
      lock.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.logout().catch(() => {});
  }
});

// PUT /api/mail/:uid/seen
router.put("/:uid/seen", async (req, res) => {
  const config = getMailConfig(req);
  if (!config) return res.status(400).json({ error: "Mail not configured" });

  const client = createImapClient(config);
  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      await client.messageFlagsAdd(req.params.uid, ["\\Seen"], { uid: true });
      res.json({ success: true });
    } finally {
      lock.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.logout().catch(() => {});
  }
});

// DELETE /api/mail/:uid - permanent delete
router.delete("/:uid", async (req, res) => {
  const config = getMailConfig(req);
  if (!config) return res.status(400).json({ error: "Mail not configured" });

  const client = createImapClient(config);
  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      await client.messageFlagsAdd(req.params.uid, ["\\Deleted"], { uid: true });
      await client.messageDelete(req.params.uid, { uid: true });
      res.json({ success: true });
    } finally {
      lock.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.logout().catch(() => {});
  }
});

// PUT /api/mail/:uid/archive - move to Archive folder
router.put("/:uid/archive", async (req, res) => {
  const config = getMailConfig(req);
  if (!config) return res.status(400).json({ error: "Mail not configured" });

  const client = createImapClient(config);
  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      await client.messageMove(req.params.uid, "Archive", { uid: true });
      res.json({ success: true });
    } finally {
      lock.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.logout().catch(() => {});
  }
});

// PUT /api/mail/:uid/tag - add IMAP keyword as tag
router.put("/:uid/tag", async (req, res) => {
  const config = getMailConfig(req);
  if (!config) return res.status(400).json({ error: "Mail not configured" });

  const { tag } = req.body;
  if (!tag) return res.status(400).json({ error: "Tag required" });

  const client = createImapClient(config);
  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      // Use IMAP keywords for tags
      await client.messageFlagsAdd(req.params.uid, [`$dopamind_${tag}`], { uid: true });
      res.json({ success: true });
    } finally {
      lock.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.logout().catch(() => {});
  }
});

// POST /api/mail/send - send via SMTP
router.post("/send", async (req, res) => {
  const config = getMailConfig(req);
  if (!config?.smtp) return res.status(400).json({ error: "SMTP not configured" });

  const { to, cc, subject, body } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port || 587,
      secure: config.smtp.tls,
      auth: { user: config.smtp.user, pass: config.smtp.password },
    });

    await transporter.sendMail({
      from: config.smtp.user,
      to,
      cc: cc || undefined,
      subject,
      text: body,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
