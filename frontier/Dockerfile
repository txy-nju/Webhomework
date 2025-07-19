# 前端Dockerfile
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源码
COPY . .

# 构建应用
RUN npm run build

# 生产环境镜像
FROM nginx:alpine AS production

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从builder阶段复制构建结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
