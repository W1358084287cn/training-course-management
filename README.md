# 教培机构消课管理系统

给教培机构用的会员与课时管理：会员建档、课时余额、续费、排课、消课、活动课程、班级学生，支持 Excel 批量导入导出与管理员 / 教练两级权限。Vue 3 + Express + MySQL，一条 Docker 命令启动。

**在线演示**：http://49.232.131.254:3001/ （账号 `admin`，密码 `admin123`，演示数据会定期重置）

## 工程结构

| 目录 | 说明 | 端口 |
|------|------|------|
| `backend/` | Node.js 22 + Express + MySQL，登录鉴权、用户管理、业务数据整包读写 | 3001 |
| `frontend/` | Vue 3 + Vite，登录页、会员管理、排课管理、用户管理 | 5173（开发） |
| `index.html` | 旧版业务页，登录后由后端以 `/legacy` 提供，页面数据通过 `/api/state` 落库 | — |
| `vendor/` `emage/` | 旧版业务页用的 xlsx、Tailwind、Font Awesome 与图片（本地内置，无外网依赖） | — |
| `Dockerfile` `docker-compose.yml` | 生产部署：Node 22 运行时 + MySQL 8.4 | 3001 |

## 快速启动（Docker，推荐）

```bash
docker compose up -d
```

打开 http://localhost:3001 ，默认管理员 `admin / admin123`。

- 首次启动由 MySQL 自动执行 `backend/sql/schema.sql` 建表，再由后端自动创建机构与管理员账号
- 想改密码就在 `.env` 里覆盖：`MYSQL_PASSWORD`、`JWT_SECRET`、`ADMIN_USERNAME`、`ADMIN_PASSWORD`
- 前端在镜像构建阶段编译，运行时不依赖宿主机 Node

## 本地开发

```bash
# 后端
cd backend
copy .env.example .env     # 填 MySQL 地址与库名
npm install
npm run dev                # http://localhost:3001

# 前端
cd frontend
npm install
npm run dev                # 打开后先登录，再进入业务页 /legacy-page
```

生产模式（不用 Docker）时，先 `cd frontend && npm run build`，后端检测到 `frontend/dist` 会直接托管静态站点。

## 演示账号

| 账号 | 密码 | 角色 | 可见范围 |
|------|------|------|----------|
| `admin` | `admin123` | 管理员 | 会员、排课、用户管理全部功能 |
| 其它账号 | — | 教练 | 会员与排课，不能进入用户管理 |

## 核心特性

- **会员管理**：建档、卡类型、有效期、剩余课时，按姓名搜索，续费课时直接累加
- **活动课程**：按活动维度维护会员名单，活动会员与普通会员分开查看
- **排课管理**：排课时段、班级、待定课程与非常规课程，按日期 / 姓名 / 课程检索
- **消课与余额**：消课记录写回会员课时，余额实时可查
- **Excel 导入导出**：会员表、排课表支持 xlsx 批量导出与导入，导入前校验字段
- **权限控制**：管理员 / 教练两级角色，接口层校验，非管理员看不到用户管理
- **数据持久化**：全部数据落 MySQL，同一机构多账号共享，浏览器换机器不丢数据

## 技术栈

| 层 | 技术 |
|----|------|
| 后端 | Node.js 22 + Express 4 + JWT + bcryptjs |
| 数据库 | MySQL 8.4（utf8mb4，中文表名沿用既有结构） |
| 前端 | Vue 3 + Vue Router + Vite 5 |
| 旧版业务页 | 原生 HTML + Tailwind + xlsx.js + Font Awesome（本地 vendor） |
| 部署 | Docker 单镜像 + docker compose，前端构建固化进镜像 |

## 数据表

`组织机构`、`用户`、`会员`、`活动课程`、`活动会员记录`、`排课时段`、`待定课程`、`非常规课程`、`班级学生`、`机构状态元数据`

## 说明

- `backend/.env` 不入库，仓库只保留 `.env.example`
- 演示环境的数据为脱敏样例，会定期重置，请勿录入真实个人信息
