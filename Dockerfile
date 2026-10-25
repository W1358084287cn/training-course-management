# ============================================
# 教培机构消课管理系统 —— 生产镜像
#   阶段一：构建 Vue 前端
#   阶段二：Node 22 运行时（后端同时托管前端与旧版业务页）
# ============================================
FROM node:22-alpine AS web

WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm config set registry https://registry.npmmirror.com \
    && (npm ci --no-audit --no-fund || npm install --no-audit --no-fund)

COPY frontend/ ./
RUN npm run build


FROM node:22-alpine

RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

ENV TZ=Asia/Shanghai \
    NODE_ENV=production

WORKDIR /app

# 后端依赖先装，利用层缓存
COPY backend/package.json backend/package-lock.json /app/backend/
RUN cd /app/backend \
    && npm config set registry https://registry.npmmirror.com \
    && (npm ci --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund)

COPY backend/src /app/backend/src
COPY backend/sql /app/backend/sql

# 旧版业务页与静态资源（后端以 /legacy 提供）
COPY index.html data.json /app/
COPY vendor /app/vendor
COPY emage /app/emage

# 前端构建产物（后端检测到 frontend/dist 即托管）
COPY --from=web /build/dist /app/frontend/dist

RUN addgroup -g 10003 -S appuser \
    && adduser -u 10003 -S appuser -G appuser \
    && mkdir -p /app/.uploads \
    && chown -R appuser:appuser /app

USER appuser

WORKDIR /app/backend

EXPOSE 3001

CMD ["node", "src/server.js"]
