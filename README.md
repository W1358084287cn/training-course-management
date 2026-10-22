# 消课管理系统（前后端 + MySQL）

当前目录包含：

- 前端：Vue 3（用于登录/用户管理/承载旧版业务页）
- 旧版业务页：根目录 [index.html](file:///c:/Users/Administrator/Desktop/管理系统/index.html)（已改为通过后端 API + MySQL 持久化）
- 后端：Node.js + Express + MySQL（提供登录/用户管理/业务数据存取）

## 1. MySQL 初始化

1. 创建数据库（示例：`management_system`）
2. 执行建表 SQL：
   - [schema.sql](file:///c:/Users/Administrator/Desktop/管理系统/backend/sql/schema.sql)

## 2. 后端启动

进入后端目录：

```bash
cd backend
```

复制环境变量文件并填写 MySQL 信息：

```bash
copy .env.example .env
```

安装依赖并启动：

```bash
npm install
npm run dev
```

说明：

- 库里没有用户时，会自动创建默认管理员账号（由 `.env` 的 `BOOTSTRAP_ADMIN_USERNAME/BOOTSTRAP_ADMIN_PASSWORD` 控制）
- 后端默认端口：`3001`
- 旧版业务页入口：`http://localhost:3001/legacy`

## 3. 前端启动（Vue）

进入前端目录：

```bash
cd frontend
npm install
npm run dev
```

前端默认端口由 Vite 输出，访问后会先到登录页，登录后进入“业务页面” `/legacy-page`（iframe 承载后端提供的 `/legacy` 旧版界面）。

## 4. 生产部署

1. 构建前端：

```bash
cd frontend
npm install
npm run build
```

2. 启动后端（后端会在检测到 `frontend/dist` 存在时，把它作为静态站点托管）：

```bash
cd backend
npm install
npm run start
```

## 5. 数据接口说明

- 登录：`POST /api/auth/login`
- 当前用户：`GET /api/auth/me`
- 用户管理（仅 admin）：`GET/POST/PATCH/DELETE /api/users`
- 业务数据（整包读写，旧版页面使用）：`GET/PUT /api/state`
