const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { bootstrapIfNeeded } = require("./bootstrap");
const authRoutes = require("./routes/auth");
const stateRoutes = require("./routes/state");
const usersRoutes = require("./routes/users");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/state", stateRoutes);
app.use("/api/users", usersRoutes);

const projectRoot = path.resolve(__dirname, "..", "..");
const legacyIndexPath = path.join(projectRoot, "index.html");
const dataJsonPath = path.join(projectRoot, "data.json");
const emagePath = path.join(projectRoot, "emage");
const videoPath = path.join(projectRoot, "video");
const vendorPath = path.join(projectRoot, "vendor");

if (fs.existsSync(vendorPath)) {
  app.use("/vendor", express.static(vendorPath));
}

if (fs.existsSync(emagePath)) {
  app.use("/emage", express.static(emagePath));
}
if (fs.existsSync(videoPath)) {
  app.use("/video", express.static(videoPath));
}

if (fs.existsSync(dataJsonPath)) {
  app.get("/data.json", (req, res) => {
    res.sendFile(dataJsonPath);
  });
}

if (fs.existsSync(legacyIndexPath)) {
  app.get("/legacy", (req, res) => {
    res.sendFile(legacyIndexPath);
  });
  app.get("/legacy/index.html", (req, res) => {
    res.sendFile(legacyIndexPath);
  });
}

const frontendDist = path.join(projectRoot, "frontend", "dist");
const frontendIndex = path.join(frontendDist, "index.html");

console.log("========================================");
console.log("  消课管理系统 - 后端服务");
console.log("========================================");
let port = Number(process.env.PORT || 3001);
console.log("项目根目录:", projectRoot);
console.log("后端端口:", port);
console.log("数据库:", process.env.DB_NAME || "(未配置)");
console.log("数据库地址:", process.env.DB_HOST || "(未配置)");

if (fs.existsSync(frontendDist) && fs.existsSync(frontendIndex)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    res.sendFile(frontendIndex);
  });
  console.log("前端托管: frontend/dist (生产模式)");
} else {
  app.get("/", (req, res) => {
    res.type("text/plain").send("Frontend not built. Build frontend/dist first.");
  });
  console.log("前端托管: 未构建 (开发模式请启动 Vite dev server)");
}

app.use((err, req, res, next) => {
  if (!err) {
    next();
    return;
  }
  console.error("[server] 错误:", err.message || err);
  res.status(500).json({ message: "Internal Server Error" });
});

console.log("----------------------------------------");

// 仅监听本地回环：生产环境由 Nginx 反代，后端端口不对外暴露
const host = process.env.HOST || "127.0.0.1";

bootstrapIfNeeded()
  .then(() => {
    app.listen(port, host, () => {
      console.log("✓ 后端服务启动成功！");
      console.log("  监听地址: " + host + ":" + port);
      console.log("  健康检查: http://localhost:" + port + "/api/health");
      console.log("  旧版业务页: http://localhost:" + port + "/legacy");
      console.log("========================================");
    });
  })
  .catch((err) => {
    console.error("========================================");
    console.error("  ✗ 后端启动失败！");
    console.error("  错误:", err && err.message ? err.message : err);
    console.error("========================================");
    console.error("  请检查：");
    console.error("  1. MySQL 服务是否正在运行？");
    console.error("  2. .env 文件中的数据库配置是否正确？");
    console.error("  3. 数据库 " + (process.env.DB_NAME || "?") + " 是否存在？");
    console.error("========================================");
    process.exit(1);
  });
