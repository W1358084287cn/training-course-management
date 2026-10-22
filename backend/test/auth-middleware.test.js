// 消课管理系统 —— 鉴权中间件单元测试
// 运行：node --test test/  （使用 Node 内置测试运行器，无需额外依赖）
process.env.JWT_SECRET = *** || "unit-test-secret";

const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { requireAuth, requireRole } = require("../src/middleware/auth");

/** 构造一个最小的 req / res，用来断言状态码与是否放行 */
function mockReqRes(headers = {}) {
  const req = { headers };
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  let passed = false;
  const next = () => {
    passed = true;
  };
  return { req, res, next, isPassed: () => passed };
}

test("无 Authorization 头 -> 401 Unauthorized", () => {
  const { req, res, next, isPassed } = mockReqRes({});
  requireAuth(req, res, next);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Unauthorized");
  assert.equal(isPassed(), false, "未通过鉴权时不能放行");
});

test("Authorization 格式不合法（缺 Bearer）-> 401", () => {
  const { req, res, next, isPassed } = mockReqRes({ authorization: "abc123" });
  requireAuth(req, res, next);
  assert.equal(res.statusCode, 401);
  assert.equal(isPassed(), false);
});

test("签名错误的 token -> 401（防止伪造身份）", () => {
  const bad = jwt.sign({ userId: 1, role: "admin" }, "another-secret");
  const { req, res, next, isPassed } = mockReqRes({ authorization: `Bearer ${bad}` });
  requireAuth(req, res, next);
  assert.equal(res.statusCode, 401);
  assert.equal(isPassed(), false);
});

test("已过期 token -> 401", () => {
  const expired = jwt.sign({ userId: 1, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "-1s" });
  const { req, res, next, isPassed } = mockReqRes({ authorization: `Bearer ${expired}` });
  requireAuth(req, res, next);
  assert.equal(res.statusCode, 401);
  assert.equal(isPassed(), false);
});

test("合法 token -> 放行并把用户信息挂到 req.user", () => {
  const payload = { userId: 7, orgId: 1, role: "coach", username: "李教练" };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  const { req, res, next, isPassed } = mockReqRes({ authorization: `Bearer ${token}` });
  requireAuth(req, res, next);
  assert.equal(isPassed(), true);
  assert.equal(req.user.role, "coach");
  assert.equal(req.user.userId, 7);
});

test("requireRole：角色匹配 -> 放行", () => {
  const { req, res, next, isPassed } = mockReqRes();
  req.user = { role: "admin" };
  requireRole(["admin"])(req, res, next);
  assert.equal(isPassed(), true);
});

test("requireRole：教练访问管理员接口 -> 403 Forbidden", () => {
  const { req, res, next, isPassed } = mockReqRes();
  req.user = { role: "coach" };
  requireRole(["admin"])(req, res, next);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, "Forbidden");
  assert.equal(isPassed(), false, "越权时必须拦截，不能放行");
});

test("requireRole：无用户信息（未经过 requireAuth）-> 403", () => {
  const { req, res, next, isPassed } = mockReqRes();
  requireRole(["admin"])(req, res, next);
  assert.equal(res.statusCode, 403);
  assert.equal(isPassed(), false);
});

test("requireRole：支持多角色放行", () => {
  const { req, res, next, isPassed } = mockReqRes();
  req.user = { role: "coach" };
  requireRole(["admin", "coach"])(req, res, next);
  assert.equal(isPassed(), true);
});
