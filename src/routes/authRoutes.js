const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/register", (req, res) => {
  res.send("Register endpoint working. Use POST method to register.");
});

module.exports = router;
