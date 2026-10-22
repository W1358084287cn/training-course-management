const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { getPool } = require("./db");

async function initSchema(pool) {
  const schemaPath = path.join(__dirname, "..", "sql", "schema.sql");

  if (!fs.existsSync(schemaPath)) {
    console.log("[bootstrap] schema.sql 文件不存在，跳过建表步骤");
    return;
  }

  const sql = fs.readFileSync(schemaPath, "utf8");

  // 按分号拆分 SQL 语句，过滤掉空语句和注释行
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    try {
      await pool.query(statement);
    } catch (err) {
      // CREATE TABLE IF NOT EXISTS 重复执行是安全的
      // 其他错误则抛出
      if (err.code !== "ER_TABLE_EXISTS_ERROR") {
        console.error("[bootstrap] SQL 执行失败:", err.message);
        console.error("[bootstrap] SQL 语句:", statement.substring(0, 120));
        throw err;
      }
    }
  }

  console.log("[bootstrap] 数据库表初始化完成");
}

async function bootstrapIfNeeded() {
  const pool = getPool();
  console.log("[bootstrap] 正在检查数据库表结构...");
  await initSchema(pool);
  const [orgRows] = await pool.query("SELECT id FROM `组织机构` LIMIT 1");

  if (orgRows.length === 0) {
    const orgName = process.env.BOOTSTRAP_ORG_NAME || "default";
    await pool.query("INSERT INTO `组织机构` (name) VALUES (?)", [orgName]);
    console.log("[bootstrap] 已创建默认组织机构:", orgName);
  }

  const [userRows] = await pool.query("SELECT id FROM `用户` LIMIT 1");
  if (userRows.length === 0) {
    const [org] = await pool.query(
      "SELECT id FROM `组织机构` ORDER BY id ASC LIMIT 1",
    );
    const orgId = org[0].id;
    const username = process.env.BOOTSTRAP_ADMIN_USERNAME || "admin";
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || "admin123";
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO `用户` (org_id, username, password_hash, role) VALUES (?,?,?, 'admin')",
      [orgId, username, passwordHash],
    );
    console.log("[bootstrap] 已创建默认管理员账号:", username);
  }

  console.log("[bootstrap] 初始化检查完成");
}

module.exports = { bootstrapIfNeeded };
