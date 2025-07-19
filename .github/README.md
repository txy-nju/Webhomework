# GitHub Actions 环境变量配置指南

## 必需的 Secrets 配置

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中配置以下 secrets：

### 基础配置

- `GITHUB_TOKEN`: 自动提供，用于 GitHub API 访问

### 部署配置（如果使用服务器部署）

- `HOST`: 部署服务器的 IP 地址或域名
- `USERNAME`: SSH 用户名
- `SSH_KEY`: SSH 私钥
- `PORT`: SSH 端口（默认 22）

### 云服务配置

#### Vercel（前端部署）

- `VERCEL_TOKEN`: Vercel API Token
- `ORG_ID`: Vercel 组织 ID
- `PROJECT_ID`: Vercel 项目 ID

#### Heroku（后端部署）

- `HEROKU_API_KEY`: Heroku API 密钥
- `HEROKU_EMAIL`: Heroku 账户邮箱

### 代码质量工具

#### SonarQube

- `SONAR_TOKEN`: SonarQube 认证 Token
- `SONAR_HOST_URL`: SonarQube 服务器 URL

#### Snyk

- `SNYK_TOKEN`: Snyk API Token

### 通知配置

#### Slack

- `SLACK_WEBHOOK`: Slack Webhook URL

### 应用配置

- `API_BASE_URL`: 生产环境 API 基础 URL

## 环境变量说明

### 开发环境 (.env.development)

```
VITE_API_BASE_URL=http://localhost:7001
NODE_ENV=development
```

### 生产环境 (.env.production)

```
VITE_API_BASE_URL=https://your-api-domain.com
NODE_ENV=production
```

### 测试环境 (.env.test)

```
VITE_API_BASE_URL=http://localhost:7001
NODE_ENV=test
```

## Docker 环境变量

### 后端容器

- `NODE_ENV`: 运行环境 (production/development/test)
- `PORT`: 应用端口 (默认 7001)
- `DB_PATH`: 数据库文件路径

### 前端容器

- `VITE_API_BASE_URL`: API 服务地址

## 使用说明

1. 将此项目推送到 GitHub 仓库
2. 在仓库设置中配置必要的 Secrets
3. 创建分支并提交代码时会自动触发 CI 流程
4. 推送 tag 时会触发发布流程
5. 手动触发部署工作流进行部署

## 工作流文件说明

- `ci.yml`: 持续集成，包括构建、测试、代码质量检查
- `deploy.yml`: 部署工作流，支持多环境部署
- `release.yml`: 发布管理，自动创建 GitHub Release

## 本地测试

使用 Docker Compose 在本地测试：

```bash
# 构建并启动服务
docker-compose up --build

# 后台运行
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```
