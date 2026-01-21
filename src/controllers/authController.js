const bcrypt = require("bcrypt");
const validator = require("validator");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const LoginAttempt = require("../models/LoginAttempt");
const getClientIp = require("../utils/getClientIp");

// ✅ Register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Invalid email format" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "unknown";

    // Validation
    if (!email || !password) {
      await LoginAttempt.create({
        email: email || "unknown",
        ip,
        userAgent,
        status: "FAILED",
        reason: "Missing credentials",
      });

      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    // User not found
    if (!user) {
      await LoginAttempt.create({
        email,
        ip,
        userAgent,
        status: "FAILED",
        reason: "User not found",
      });

      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if locked (future lockout system)
    if (user.isLocked && user.lockUntil && user.lockUntil > new Date()) {
      await LoginAttempt.create({
        email,
        ip,
        userAgent,
        status: "FAILED",
        reason: "Account locked",
      });

      return res.status(403).json({
        message: "Account is locked. Try again later.",
        lockUntil: user.lockUntil,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // Wrong password
    if (!isMatch) {
      await LoginAttempt.create({
        email,
        ip,
        userAgent,
        status: "FAILED",
        reason: "Wrong password",
      });

      return res.status(400).json({ message: "Invalid credentials" });
    }

    // SUCCESS login
    await LoginAttempt.create({
      email,
      ip,
      userAgent,
      status: "SUCCESS",
      reason: "Login success",
    });

    return res.status(200).json({
      message: "Login successful",
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

