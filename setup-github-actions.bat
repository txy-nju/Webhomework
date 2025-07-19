@echo off
setlocal enabledelayedexpansion

echo 🚀 正在初始化 GitHub Actions 工作流...

:: 检查是否在git仓库中
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 当前目录不是Git仓库
    echo 请先运行: git init
    exit /b 1
)

:: 检查是否有GitHub远程仓库
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  警告: 未找到GitHub远程仓库
    echo 请确保已添加GitHub远程仓库: git remote add origin ^<your-repo-url^>
)

echo 📋 检查项目配置...

:: 检查后端package.json
if exist "back\package.json" (
    echo ✅ 后端package.json存在
    
    findstr /C:"\"build\"" back\package.json >nul
    if !errorlevel! neq 0 (
        echo ⚠️  后端缺少build脚本，建议添加:
        echo   "build": "npm run build"
    )
    
    findstr /C:"\"test\"" back\package.json >nul
    if !errorlevel! neq 0 (
        echo ⚠️  后端缺少test脚本，建议添加:
        echo   "test": "jest"
    )
    
    findstr /C:"\"lint\"" back\package.json >nul
    if !errorlevel! neq 0 (
        echo ⚠️  后端缺少lint脚本，建议添加:
        echo   "lint": "eslint src --ext .ts"
    )
) else (
    echo ❌ 未找到后端package.json
)

:: 检查前端package.json
if exist "frontier\package.json" (
    echo ✅ 前端package.json存在
    
    findstr /C:"\"build\"" frontier\package.json >nul
    if !errorlevel! neq 0 (
        echo ⚠️  前端缺少build脚本，建议添加:
        echo   "build": "vite build"
    )
    
    findstr /C:"\"test\"" frontier\package.json >nul
    if !errorlevel! neq 0 (
        echo ⚠️  前端缺少test脚本，建议添加:
        echo   "test": "vitest"
    )
    
    findstr /C:"\"lint\"" frontier\package.json >nul
    if !errorlevel! neq 0 (
        echo ⚠️  前端缺少lint脚本，建议添加:
        echo   "lint": "eslint src --ext .js,.jsx"
    )
) else (
    echo ❌ 未找到前端package.json
)

echo 📝 创建环境配置文件...

:: 前端环境配置
if not exist "frontier\.env.example" (
    (
    echo VITE_API_BASE_URL=http://localhost:7001
    echo NODE_ENV=development
    ) > frontier\.env.example
    echo ✅ 创建了 frontier\.env.example
)

:: 后端环境配置
if not exist "back\.env.example" (
    (
    echo NODE_ENV=development
    echo PORT=7001
    echo DB_PATH=./db.sqlite
    ) > back\.env.example
    echo ✅ 创建了 back\.env.example
)

:: 创建.gitignore（如果不存在）
if not exist ".gitignore" (
    (
    echo # Dependencies
    echo node_modules/
    echo npm-debug.log*
    echo yarn-debug.log*
    echo yarn-error.log*
    echo.
    echo # Production builds
    echo /back/dist/
    echo /frontier/dist/
    echo.
    echo # Environment variables
    echo .env
    echo .env.local
    echo .env.development.local
    echo .env.test.local
    echo .env.production.local
    echo.
    echo # Database
    echo *.sqlite
    echo *.db
    echo.
    echo # Logs
    echo logs/
    echo *.log
    echo.
    echo # Runtime data
    echo pids/
    echo *.pid
    echo *.seed
    echo *.pid.lock
    echo.
    echo # Coverage directory used by tools like istanbul
    echo coverage/
    echo *.lcov
    echo.
    echo # IDE
    echo .vscode/
    echo .idea/
    echo *.swp
    echo *.swo
    echo.
    echo # OS
    echo .DS_Store
    echo Thumbs.db
    echo.
    echo # Docker
    echo .dockerignore
    echo.
    echo # Temporary files
    echo tmp/
    echo temp/
    ) > .gitignore
    echo ✅ 创建了 .gitignore
)

echo.
echo 🎉 GitHub Actions 工作流初始化完成！
echo.
echo 📋 下一步操作：
echo 1. 检查并完善项目的package.json中的脚本
echo 2. 在GitHub仓库设置中配置必要的Secrets（参考.github\README.md）
echo 3. 提交代码到GitHub仓库：
echo    git add .
echo    git commit -m "feat: add GitHub Actions workflows"
echo    git push origin main
echo 4. 创建一个标签来触发发布流程：
echo    git tag v1.0.0
echo    git push origin v1.0.0
echo.
echo 📚 更多信息请查看 .github\README.md

pause
