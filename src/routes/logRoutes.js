const express = require("express");
const { getLoginAttempts } = require("../controllers/logController");

const router = express.Router();

router.get("/login-attempts", getLoginAttempts);

module.exports = router;
