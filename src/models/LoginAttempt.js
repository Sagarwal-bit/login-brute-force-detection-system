const mongoose = require("mongoose");

const LoginAttemptSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    ip: { type: String, required: true },
    userAgent: { type: String, default: "unknown" },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true,
    },

    reason: { type: String, default: "" }, // eg: wrong password, locked, etc
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoginAttempt", LoginAttemptSchema);
