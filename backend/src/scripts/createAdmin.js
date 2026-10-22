const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { getPool } = require("../db");

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];
  const role = process.argv[4] || "admin";

  if (!username || !password) {
    process.stdout.write(
      "Usage: npm run create-admin -- <username> <password> [role]\n",
    );
    process.exit(1);
  }

  if (!["admin", "coach"].includes(role)) {
    process.stdout.write("Role must be admin or coach\n");
    process.exit(1);
  }

  const pool = getPool();
  const [orgRows] = await pool.query("SELECT id FROM `组织机构` LIMIT 1");
  if (orgRows.length === 0) {
    const orgName = process.env.BOOTSTRAP_ORG_NAME || "default";
    await pool.query("INSERT INTO `组织机构` (name) VALUES (?)", [orgName]);
  }

  const [[org]] = await pool.query(
    "SELECT id FROM `组织机构` ORDER BY id ASC LIMIT 1",
  );
  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO `用户` (org_id, username, password_hash, role) VALUES (?,?,?,?)",
    [org.id, username, passwordHash, role],
  );

  process.stdout.write("OK\n");
  process.exit(0);
}

main().catch((e) => {
  process.stderr.write(String(e && e.message ? e.message : e) + "\n");
  process.exit(1);
});
