const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const { getPool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    res.status(400).json({ message: "Missing username or password" });
    return;
  }

  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT id, org_id, username, password_hash, role FROM `用户` WHERE username = ? LIMIT 1",
    [username],
  );

  if (rows.length === 0) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, orgId: user.org_id, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.json({
    token,
    user: { id: user.id, orgId: user.org_id, username: user.username, role: user.role },
  });
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({
    user: {
      id: req.user.userId,
      orgId: req.user.orgId,
      username: req.user.username,
      role: req.user.role,
    },
  });
});

module.exports = router;
