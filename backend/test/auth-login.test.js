// 消课管理系统 —— 登录接口单元测试（数据库用内存桩替换，不连真实 MySQL）
process.env.JWT_SECRET = *** || "unit-test-secret";

const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");

// 在 routes/auth 之前把 src/db 换成桩模块：routes/auth.js 里 require("../db")
// 拿到的是同一个模块缓存中的导出对象。
const dbPath = require.resolve("../src/db");
const PASSWORD_HASH = bcrypt.hashSync("admin123", 8);
let queryArgs = null;
const fakePool = {
  query(sql, params) {
    queryArgs = { sql, params };
    if (params && params[0] === "admin") {
      return Promise.resolve([
        [{ id: 1, org_id: 1, username: "admin", password_hash: PASSWORD_HASH, role: "admin" }],
      ]);
    }
    return Promise.resolve([[]]);
  },
};
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  path: dbPath,
  loaded: true,
  exports: { getPool: () => fakePool, __esModule: false },
};

const express = require("express");
const authRoutes = require("../src/routes/auth");

/** 用 express 起一个只挂 /api/auth 的迷你应用，真实走一遍路由与中间件 */
function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use((err, req, res, next) => res.status(500).json({ message: "server error" }));
  return app;
}

/** 用真实的 http 监听发一次请求，返回 {status, body} */
async function postLogin(payload) {
  const app = buildApp();
  const server = app.listen(0);
  await new Promise((r) => server.once("listening", r));
  const { port } = server.address();
  const res = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  await new Promise((r) => server.close(r));
  return { status: res.status, body };
}

test("登录：账号密码正确 -> 返回 token 与用户信息，且不含密码哈希", async () => {
  const { status, body } = await postLogin({ username: "admin", password: "admin123" });
  assert.equal(status, 200);
  assert.ok(body.token, "应返回 JWT token");
  assert.equal(body.user.username, "admin");
  assert.equal(body.user.role, "admin");
  assert.equal(body.user.password_hash, undefined, "绝不能把密码哈希返回给前端");
});

test("登录：密码错误 -> 401", async () => {
  const { status, body } = await postLogin({ username: "admin", password: "wrong-password" });
  assert.equal(status, 401);
  assert.equal(body.message, "Invalid credentials");
});

test("登录：用户名不存在 -> 401（不泄露账号是否存在）", async () => {
  const { status } = await postLogin({ username: "nobody", password: "whatever" });
  assert.equal(status, 401);
});

test("登录：缺少用户名或密码 -> 400", async () => {
  assert.equal((await postLogin({ password: "x" })).status, 400);
  assert.equal((await postLogin({ username: "admin" })).status, 400);
  assert.equal((await postLogin({})).status, 400);
});

test("登录：SQL 使用参数化查询（防注入），用户名以参数形式传入", async () => {
  await postLogin({ username: "admin", password: "admin123" });
  assert.ok(queryArgs, "应执行一次数据库查询");
  assert.ok(/WHERE username = \?/.test(queryArgs.sql), "必须用占位符而不是字符串拼接: " + queryArgs.sql);
  assert.deepEqual(queryArgs.params, ["admin"]);
});
