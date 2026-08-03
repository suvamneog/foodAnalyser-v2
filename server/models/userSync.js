const mongoose = require("mongoose");

/**
 * Cloud snapshot of tracker + progression for one user.
 * Client remains localStorage-first; this is the durable backup when logged in.
 */
const userSyncSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    /** { "2026-08-02": [entries...] } */
    logsByDate: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    target: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    /** { "2026-08-02": ml } */
    waterByDate: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    /** { "2026-08-02": { steps, workoutMinutes, workoutKcal, note } } */
    activityByDate: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    /** Full fa-progress blob */
    progress: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    clientUpdatedAt: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSync", userSyncSchema);
