# 后端Dockerfile
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源码
COPY . .

# 构建应用
RUN npm run build

# 生产环境镜像
FROM node:20-alpine AS production

# 创建app用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# 设置工作目录
WORKDIR /app

# 从builder阶段复制文件
COPY --from=builder --chown=backend:nodejs /app/dist ./dist
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /app/package*.json ./

# 创建日志目录
RUN mkdir -p logs && chown -R backend:nodejs logs

# 切换到非root用户
USER backend

# 暴露端口
EXPOSE 7001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7001/api/health || exit 1

# 启动应用
CMD ["npm", "start"]
