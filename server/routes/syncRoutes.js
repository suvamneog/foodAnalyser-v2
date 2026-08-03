const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const UserSync = require("../models/userSync");

/**
 * GET /api/sync
 * Pull the user's cloud snapshot.
 */
router.get("/", auth, async (req, res) => {
  try {
    const doc = await UserSync.findOne({ userID: req.user.id }).lean();
    if (!doc) {
      return res.json({
        exists: false,
        logsByDate: {},
        target: null,
        waterByDate: {},
        activityByDate: {},
        progress: null,
        clientUpdatedAt: 0,
      });
    }
    return res.json({
      exists: true,
      logsByDate: doc.logsByDate || {},
      target: doc.target || null,
      waterByDate: doc.waterByDate || {},
      activityByDate: doc.activityByDate || {},
      progress: doc.progress || null,
      clientUpdatedAt: doc.clientUpdatedAt || 0,
      updatedAt: doc.updatedAt,
    });
  } catch (err) {
    console.error("Sync GET error:", err);
    return res.status(500).json({ error: "Failed to load sync data" });
  }
});

/**
 * PUT /api/sync
 * Merge local snapshot into cloud (client wins for overlapping dates/fields
 * when clientUpdatedAt is newer or equal).
 */
router.put("/", auth, async (req, res) => {
  try {
    const {
      logsByDate = {},
      target = null,
      waterByDate = {},
      activityByDate = {},
      progress = null,
      clientUpdatedAt = Date.now(),
    } = req.body || {};

    let doc = await UserSync.findOne({ userID: req.user.id });
    if (!doc) {
      doc = new UserSync({ userID: req.user.id });
    }

    const mergeMaps = (prev, next) => {
      const out = { ...(prev && typeof prev === "object" ? prev : {}) };
      if (next && typeof next === "object") {
        for (const [k, v] of Object.entries(next)) {
          if (v !== undefined) out[k] = v;
        }
      }
      return out;
    };

    doc.logsByDate = mergeMaps(doc.logsByDate, logsByDate);
    doc.waterByDate = mergeMaps(doc.waterByDate, waterByDate);
    doc.activityByDate = mergeMaps(doc.activityByDate, activityByDate);
    if (target !== undefined) doc.target = target;
    if (progress !== undefined && progress !== null) doc.progress = progress;
    doc.clientUpdatedAt = Number(clientUpdatedAt) || Date.now();

    await doc.save();

    return res.json({
      ok: true,
      clientUpdatedAt: doc.clientUpdatedAt,
      updatedAt: doc.updatedAt,
    });
  } catch (err) {
    console.error("Sync PUT error:", err);
    return res.status(500).json({ error: "Failed to save sync data" });
  }
});

module.exports = router;
