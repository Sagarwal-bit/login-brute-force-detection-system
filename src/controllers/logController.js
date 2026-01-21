const LoginAttempt = require("../models/LoginAttempt");

// GET recent login attempts
exports.getLoginAttempts = async (req, res) => {
  try {
    const logs = await LoginAttempt.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
