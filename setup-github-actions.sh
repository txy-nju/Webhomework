#!/bin/bash

# GitHub Actions 初始化脚本

echo "🚀 正在初始化 GitHub Actions 工作流..."

# 检查是否在git仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ 错误: 当前目录不是Git仓库"
    echo "请先运行: git init"
    exit 1
fi

# 检查是否有GitHub远程仓库
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  警告: 未找到GitHub远程仓库"
    echo "请确保已添加GitHub远程仓库: git remote add origin <your-repo-url>"
fi

# 检查package.json文件是否存在必要的脚本
echo "📋 检查项目配置..."

# 检查后端package.json
if [ -f "back/package.json" ]; then
    echo "✅ 后端package.json存在"
    
    # 检查必要的脚本
    if ! grep -q '"build"' back/package.json; then
        echo "⚠️  后端缺少build脚本，建议添加:"
        echo '  "build": "npm run build"'
    fi
    
    if ! grep -q '"test"' back/package.json; then
        echo "⚠️  后端缺少test脚本，建议添加:"
        echo '  "test": "jest"'
    fi
    
    if ! grep -q '"lint"' back/package.json; then
        echo "⚠️  后端缺少lint脚本，建议添加:"
        echo '  "lint": "eslint src --ext .ts"'
    fi
else
    echo "❌ 未找到后端package.json"
fi

# 检查前端package.json
if [ -f "frontier/package.json" ]; then
    echo "✅ 前端package.json存在"
    
    # 检查必要的脚本
    if ! grep -q '"build"' frontier/package.json; then
        echo "⚠️  前端缺少build脚本，建议添加:"
        echo '  "build": "vite build"'
    fi
    
    if ! grep -q '"test"' frontier/package.json; then
        echo "⚠️  前端缺少test脚本，建议添加:"
        echo '  "test": "vitest"'
    fi
    
    if ! grep -q '"lint"' frontier/package.json; then
        echo "⚠️  前端缺少lint脚本，建议添加:"
        echo '  "lint": "eslint src --ext .js,.jsx"'
    fi
else
    echo "❌ 未找到前端package.json"
fi

# 创建基本的环境配置文件
echo "📝 创建环境配置文件..."

# 前端环境配置
if [ ! -f "frontier/.env.example" ]; then
    cat > frontier/.env.example << EOF
VITE_API_BASE_URL=http://localhost:7001
NODE_ENV=development
EOF
    echo "✅ 创建了 frontier/.env.example"
fi

# 后端环境配置
if [ ! -f "back/.env.example" ]; then
    cat > back/.env.example << EOF
NODE_ENV=development
PORT=7001
DB_PATH=./db.sqlite
EOF
    echo "✅ 创建了 back/.env.example"
fi

# 创建.gitignore（如果不存在）
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
/back/dist/
/frontier/dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.sqlite
*.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker
.dockerignore

# Temporary files
tmp/
temp/
EOF
    echo "✅ 创建了 .gitignore"
fi

echo ""
echo "🎉 GitHub Actions 工作流初始化完成！"
echo ""
echo "📋 下一步操作："
echo "1. 检查并完善项目的package.json中的脚本"
echo "2. 在GitHub仓库设置中配置必要的Secrets（参考.github/README.md）"
echo "3. 提交代码到GitHub仓库："
echo "   git add ."
echo "   git commit -m 'feat: add GitHub Actions workflows'"
echo "   git push origin main"
echo "4. 创建一个标签来触发发布流程："
echo "   git tag v1.0.0"
echo "   git push origin v1.0.0"
echo ""
echo "📚 更多信息请查看 .github/README.md"
