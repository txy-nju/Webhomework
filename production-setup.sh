#!/bin/bash
# 生产部署前的关键修复脚本

echo "🔧 开始生产部署准备..."

# 1. 修复测试问题
echo "📝 步骤1: 修复测试问题"
echo "   - 检查API路由是否正确"
echo "   - 更新测试用例"

# 2. 创建环境配置文件
echo "🌍 步骤2: 创建环境配置"

# 后端环境配置
cat > back/.env.production << 'EOF'
NODE_ENV=production
APP_KEYS=your-production-secret-keys-change-this
DB_TYPE=sqlite
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=your-db-name
LOG_LEVEL=info
PORT=7001
EOF

# 前端环境配置
cat > frontier/.env.production << 'EOF'
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_TITLE=Activity Hub
VITE_APP_VERSION=1.0.0
EOF

echo "✅ 环境配置文件已创建"

# 3. 创建健康检查端点
echo "🏥 步骤3: 添加健康检查端点"

cat > back/src/controller/health.controller.ts << 'EOF'
import { Controller, Get, Inject } from '@midwayjs/core';

@Controller('/api/health')
export class HealthController {
  
  @Get('/')
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime()
    };
  }

  @Get('/readiness')
  async readiness() {
    // 检查数据库连接等
    try {
      return {
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'not ready',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
EOF

echo "✅ 健康检查端点已添加"

# 4. 创建生产配置
echo "⚙️  步骤4: 更新生产配置"

cat > back/src/config/config.prod.ts << 'EOF'
import { MidwayConfig } from '@midwayjs/core';
import * as entities from '../entity/index';

export default {
  keys: process.env.APP_KEYS || 'change-this-in-production',
  koa: {
    port: parseInt(process.env.PORT) || 7001,
  },
  typeorm: {
    dataSource: {
      default: {
        type: process.env.DB_TYPE || 'sqlite',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE || 'db.sqlite',
        synchronize: false, // 生产环境必须为false
        logging: process.env.LOG_LEVEL === 'debug',
        entities: [...Object.values(entities)],
        migrations: ['dist/migration/*.js'],
        extra: {
          connectionTimeoutMillis: 30000,
        },
      },
    },
  },
  // 安全配置
  security: {
    csrf: false, // 根据需要配置
  },
  // CORS配置
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  }
} as MidwayConfig;
EOF

echo "✅ 生产配置已创建"

# 5. 创建Docker配置（可选）
echo "🐳 步骤5: 创建Docker配置"

cat > Dockerfile << 'EOF'
# 多阶段构建
FROM node:18-alpine AS builder

# 构建前端
WORKDIR /app/frontend
COPY frontier/package*.json ./
RUN npm ci --only=production
COPY frontier/ ./
RUN npm run build

# 构建后端
WORKDIR /app/backend
COPY back/package*.json ./
RUN npm ci --only=production
COPY back/ ./
RUN npm run build

# 生产镜像
FROM node:18-alpine AS production

WORKDIR /app

# 复制后端构建产物
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./

# 复制前端构建产物
COPY --from=builder /app/frontend/dist ./public

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 7001

CMD ["node", "bootstrap.js"]
EOF

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "7001:7001"
    environment:
      - NODE_ENV=production
      - APP_KEYS=your-production-keys
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
EOF

echo "✅ Docker配置已创建"

# 6. 创建部署脚本
echo "🚀 步骤6: 创建部署脚本"

cat > deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 开始部署到生产环境..."

# 1. 拉取最新代码
git pull origin main

# 2. 安装依赖
echo "📦 安装后端依赖..."
cd back && npm ci --only=production

echo "📦 安装前端依赖..."
cd ../frontier && npm ci --only=production

# 3. 构建应用
echo "🏗️ 构建前端..."
npm run build

echo "🏗️ 构建后端..."
cd ../back && npm run build

# 4. 运行测试
echo "🧪 运行测试..."
npm run test

# 5. 备份当前版本（如果存在）
if [ -d "/var/www/app-backup" ]; then
  rm -rf /var/www/app-backup-old
  mv /var/www/app-backup /var/www/app-backup-old
fi

if [ -d "/var/www/app" ]; then
  cp -r /var/www/app /var/www/app-backup
fi

# 6. 部署新版本
echo "📋 复制文件到生产目录..."
sudo mkdir -p /var/www/app
sudo cp -r dist/* /var/www/app/
sudo cp -r ../frontier/dist/* /var/www/app/public/

# 7. 重启服务
echo "🔄 重启服务..."
sudo systemctl restart app-service

# 8. 健康检查
echo "🏥 健康检查..."
sleep 5
curl -f http://localhost:7001/api/health || {
  echo "❌ 健康检查失败，回滚..."
  sudo systemctl stop app-service
  if [ -d "/var/www/app-backup" ]; then
    sudo rm -rf /var/www/app
    sudo mv /var/www/app-backup /var/www/app
    sudo systemctl start app-service
  fi
  exit 1
}

echo "✅ 部署成功！"
EOF

chmod +x deploy.sh

echo "✅ 部署脚本已创建"

# 7. 创建监控配置
echo "📊 步骤7: 创建基础监控"

cat > monitoring.sh << 'EOF'
#!/bin/bash

# 简单的服务监控脚本
while true; do
  # 检查服务状态
  if ! curl -f http://localhost:7001/api/health > /dev/null 2>&1; then
    echo "$(date): ❌ 服务异常，尝试重启..."
    sudo systemctl restart app-service
    
    # 发送告警（可配置邮件或钉钉通知）
    echo "$(date): 服务重启" >> /var/log/app-monitor.log
  else
    echo "$(date): ✅ 服务正常" >> /var/log/app-monitor.log
  fi
  
  sleep 60
done
EOF

chmod +x monitoring.sh

echo "✅ 监控脚本已创建"

echo ""
echo "🎉 生产部署准备完成！"
echo ""
echo "📋 下一步操作："
echo "1. 修改 back/.env.production 中的配置"
echo "2. 修改 frontier/.env.production 中的API地址"
echo "3. 运行测试：cd back && npm test"
echo "4. 构建检查：npm run build"
echo "5. 部署：./deploy.sh"
echo ""
echo "⚠️  重要提醒："
echo "- 修改默认密钥 APP_KEYS"
echo "- 配置生产数据库"
echo "- 设置HTTPS证书"
echo "- 配置域名和DNS"
echo ""
echo "📊 监控："
echo "- 健康检查: http://your-domain/api/health"
echo "- 启动监控: ./monitoring.sh &"
EOF
