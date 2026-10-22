const express = require("express");
const { getPool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

async function loadState(orgId) {
  const pool = getPool();

  const [[meta]] = await pool.query(
    "SELECT updated_at AS updatedAt FROM `机构状态元数据` WHERE org_id = ?",
    [orgId],
  );

  const [members] = await pool.query(
    "SELECT name, card_type AS cardType, age, start_date AS startDate, end_date AS endDate, total_classes AS totalClasses, remaining_classes AS remainingClasses, remark FROM `会员` WHERE org_id = ? ORDER BY id ASC",
    [orgId],
  );

  const [schedule] = await pool.query(
    "SELECT time, monday, tuesday, wednesday, thursday, friday, saturday, sunday FROM `排课时段` WHERE org_id = ? ORDER BY id ASC",
    [orgId],
  );

  const [uncertain] = await pool.query(
    "SELECT date, time, name, course, remark FROM `待定课程` WHERE org_id = ? ORDER BY id ASC",
    [orgId],
  );

  const [irregular] = await pool.query(
    "SELECT date, time, name, course, remark FROM `非常规课程` WHERE org_id = ? ORDER BY id ASC",
    [orgId],
  );

  const [classStudentRows] = await pool.query(
    "SELECT class_name AS className, student_name AS studentName FROM `班级学生` WHERE org_id = ? ORDER BY class_name ASC, student_name ASC",
    [orgId],
  );

  const classStudents = {};
  for (const row of classStudentRows) {
    if (!classStudents[row.className]) classStudents[row.className] = [];
    classStudents[row.className].push(row.studentName);
  }

  const [activityRows] = await pool.query(
    "SELECT id, name FROM `活动课程` WHERE org_id = ? ORDER BY id ASC",
    [orgId],
  );

  const activities = activityRows.map((r) => r.name);
  const activityMembers = {};

  if (activityRows.length > 0) {
    const ids = activityRows.map((r) => r.id);
    const [amRows] = await pool.query(
      `SELECT activity_id AS activityId, name, card_type AS cardType, age, start_date AS startDate, end_date AS endDate, total_classes AS totalClasses, remaining_classes AS remainingClasses, remark FROM \`活动会员记录\` WHERE org_id = ? AND activity_id IN (${ids.map(() => "?").join(",")}) ORDER BY id ASC`,
      [orgId, ...ids],
    );

    const activityIdToName = new Map(activityRows.map((r) => [r.id, r.name]));
    for (const row of amRows) {
      const activityName = activityIdToName.get(row.activityId);
      if (!activityName) continue;
      if (!activityMembers[activityName]) activityMembers[activityName] = [];
      activityMembers[activityName].push({
        name: row.name,
        cardType: row.cardType,
        age: row.age || "",
        startDate: row.startDate,
        endDate: row.endDate,
        totalClasses: Number(row.totalClasses || 0),
        remainingClasses: Number(row.remainingClasses || 0),
        remark: row.remark || "",
      });
    }
  }

  return {
    updatedAt: meta ? meta.updatedAt : null,
    members: members.map((m) => ({
      name: m.name,
      cardType: m.cardType,
      age: m.age || "",
      startDate: m.startDate,
      endDate: m.endDate,
      totalClasses: Number(m.totalClasses || 0),
      remainingClasses: Number(m.remainingClasses || 0),
      remark: m.remark || "",
    })),
    activityMembers,
    activities,
    schedule: schedule.map((s) => ({
      time: s.time,
      monday: s.monday || "",
      tuesday: s.tuesday || "",
      wednesday: s.wednesday || "",
      thursday: s.thursday || "",
      friday: s.friday || "",
      saturday: s.saturday || "",
      sunday: s.sunday || "",
    })),
    uncertain: uncertain.map((u) => ({
      date: u.date,
      time: u.time,
      name: u.name || "",
      course: u.course,
      remark: u.remark || "",
    })),
    irregular: irregular.map((i) => ({
      date: i.date,
      time: i.time,
      name: i.name || "",
      course: i.course,
      remark: i.remark || "",
    })),
    classStudents,
  };
}

function normalizeStateInput(body) {
  const input = body || {};
  return {
    members: Array.isArray(input.members) ? input.members : [],
    activities: Array.isArray(input.activities) ? input.activities : [],
    activityMembers:
      input.activityMembers && typeof input.activityMembers === "object"
        ? input.activityMembers
        : {},
    schedule: Array.isArray(input.schedule) ? input.schedule : [],
    uncertain: Array.isArray(input.uncertain) ? input.uncertain : [],
    irregular: Array.isArray(input.irregular) ? input.irregular : [],
    classStudents:
      input.classStudents && typeof input.classStudents === "object"
        ? input.classStudents
        : {},
  };
}

router.get("/", requireAuth, async (req, res) => {
  const state = await loadState(req.user.orgId);
  res.json({ state });
});

router.put("/", requireAuth, async (req, res) => {
  const orgId = req.user.orgId;
  const state = normalizeStateInput(req.body);
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query("DELETE FROM `会员` WHERE org_id = ?", [orgId]);
    await conn.query("DELETE FROM `排课时段` WHERE org_id = ?", [orgId]);
    await conn.query("DELETE FROM `待定课程` WHERE org_id = ?", [orgId]);
    await conn.query("DELETE FROM `非常规课程` WHERE org_id = ?", [orgId]);
    await conn.query("DELETE FROM `班级学生` WHERE org_id = ?", [orgId]);
    await conn.query("DELETE FROM `活动会员记录` WHERE org_id = ?", [orgId]);
    await conn.query("DELETE FROM `活动课程` WHERE org_id = ?", [orgId]);

    if (state.members.length > 0) {
      const values = state.members.map((m) => [
        orgId,
        m.name || "",
        m.cardType || "",
        m.age || "",
        String(m.startDate || ""),
        String(m.endDate || ""),
        Number(m.totalClasses || 0),
        Number(m.remainingClasses || 0),
        m.remark || "",
      ]);
      await conn.query(
        "INSERT INTO `会员` (org_id, name, card_type, age, start_date, end_date, total_classes, remaining_classes, remark) VALUES ?",
        [values],
      );
    }

    const activityNameToId = new Map();
    if (state.activities.length > 0) {
      const activityValues = state.activities
        .map((name) => String(name || "").trim())
        .filter(Boolean)
        .map((name) => [orgId, name]);
      if (activityValues.length > 0) {
        await conn.query(
          "INSERT INTO `活动课程` (org_id, name) VALUES ?",
          [activityValues],
        );
        const [rows] = await conn.query(
          "SELECT id, name FROM `活动课程` WHERE org_id = ? ORDER BY id ASC",
          [orgId],
        );
        for (const r of rows) {
          activityNameToId.set(r.name, r.id);
        }
      }
    }

    const amInsertRows = [];
    for (const [activityName, list] of Object.entries(state.activityMembers)) {
      const activityId = activityNameToId.get(activityName);
      if (!activityId) continue;
      if (!Array.isArray(list) || list.length === 0) continue;
      for (const m of list) {
        amInsertRows.push([
          orgId,
          activityId,
          m.name || "",
          m.cardType || "",
          m.age || "",
          String(m.startDate || ""),
          String(m.endDate || ""),
          Number(m.totalClasses || 0),
          Number(m.remainingClasses || 0),
          m.remark || "",
        ]);
      }
    }

    if (amInsertRows.length > 0) {
      await conn.query(
        "INSERT INTO `活动会员记录` (org_id, activity_id, name, card_type, age, start_date, end_date, total_classes, remaining_classes, remark) VALUES ?",
        [amInsertRows],
      );
    }

    if (state.schedule.length > 0) {
      const scheduleValues = state.schedule.map((s) => [
        orgId,
        String(s.time || ""),
        s.monday || "",
        s.tuesday || "",
        s.wednesday || "",
        s.thursday || "",
        s.friday || "",
        s.saturday || "",
        s.sunday || "",
      ]);
      await conn.query(
        "INSERT INTO `排课时段` (org_id, time, monday, tuesday, wednesday, thursday, friday, saturday, sunday) VALUES ?",
        [scheduleValues],
      );
    }

    if (state.uncertain.length > 0) {
      const uncertainValues = state.uncertain.map((u) => [
        orgId,
        String(u.date || ""),
        String(u.time || ""),
        u.name || "",
        String(u.course || ""),
        u.remark || "",
      ]);
      await conn.query(
        "INSERT INTO `待定课程` (org_id, date, time, name, course, remark) VALUES ?",
        [uncertainValues],
      );
    }

    if (state.irregular.length > 0) {
      const irregularValues = state.irregular.map((i) => [
        orgId,
        String(i.date || ""),
        String(i.time || ""),
        i.name || "",
        String(i.course || ""),
        i.remark || "",
      ]);
      await conn.query(
        "INSERT INTO `非常规课程` (org_id, date, time, name, course, remark) VALUES ?",
        [irregularValues],
      );
    }

    const csRows = [];
    for (const [className, students] of Object.entries(state.classStudents)) {
      if (!Array.isArray(students)) continue;
      for (const studentName of students) {
        const name = String(studentName || "").trim();
        if (!name) continue;
        csRows.push([orgId, String(className || ""), name]);
      }
    }

    if (csRows.length > 0) {
      await conn.query(
        "INSERT INTO `班级学生` (org_id, class_name, student_name) VALUES ?",
        [csRows],
      );
    }

    await conn.query(
      "INSERT INTO `机构状态元数据` (org_id) VALUES (?) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP",
      [orgId],
    );

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }

  const updated = await loadState(orgId);
  res.json({ state: updated });
});

module.exports = router;
