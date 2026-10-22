const bcrypt = require("bcryptjs");
const express = require("express");
const { getPool } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, requireRole(["admin"]), async (req, res) => {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT id, org_id AS orgId, username, role, created_at AS createdAt, updated_at AS updatedAt FROM `用户` WHERE org_id = ? ORDER BY id ASC",
    [req.user.orgId],
  );
  res.json({ users: rows });
});

router.post("/", requireAuth, requireRole(["admin"]), async (req, res) => {
  const { username, password, role } = req.body || {};
  if (!username || !password) {
    res.status(400).json({ message: "Missing username or password" });
    return;
  }
  if (role && !["admin", "coach"].includes(role)) {
    res.status(400).json({ message: "Invalid role" });
    return;
  }

  const pool = getPool();
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const [result] = await pool.query(
      "INSERT INTO `用户` (org_id, username, password_hash, role) VALUES (?,?,?,?)",
      [req.user.orgId, username, passwordHash, role || "coach"],
    );
    res.status(201).json({
      user: { id: result.insertId, orgId: req.user.orgId, username, role: role || "coach" },
    });
  } catch (e) {
    if (String(e && e.code) === "ER_DUP_ENTRY") {
      res.status(409).json({ message: "Username already exists" });
      return;
    }
    throw e;
  }
});

router.patch("/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
  const userId = Number(req.params.id);
  const { password, role } = req.body || {};
  if (!userId) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }
  if (!password && !role) {
    res.status(400).json({ message: "Nothing to update" });
    return;
  }
  if (role && !["admin", "coach"].includes(role)) {
    res.status(400).json({ message: "Invalid role" });
    return;
  }

  const pool = getPool();
  const fields = [];
  const values = [];
  if (password) {
    fields.push("password_hash = ?");
    values.push(await bcrypt.hash(password, 10));
  }
  if (role) {
    fields.push("role = ?");
    values.push(role);
  }
  values.push(req.user.orgId, userId);
  const [result] = await pool.query(
    `UPDATE \`用户\` SET ${fields.join(", ")} WHERE org_id = ? AND id = ?`,
    values,
  );
  if (result.affectedRows === 0) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ ok: true });
});

router.delete("/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }
  if (userId === req.user.userId) {
    res.status(400).json({ message: "Cannot delete yourself" });
    return;
  }
  const pool = getPool();
  const [result] = await pool.query(
    "DELETE FROM `用户` WHERE org_id = ? AND id = ?",
    [req.user.orgId, userId],
  );
  if (result.affectedRows === 0) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ ok: true });
});

module.exports = router;
