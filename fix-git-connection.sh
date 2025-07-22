# 🔧 GitHub连接问题解决脚本

echo "🔍 检查当前Git配置..."
git remote -v

echo ""
echo "🔄 尝试切换到SSH方式..."

# 切换到SSH
git remote set-url origin git@github.com:txy-nju/Webhomework.git

echo "✅ 已切换到SSH方式"
echo ""
echo "📋 当前远程仓库配置："
git remote -v

echo ""
echo "🔑 接下来需要配置SSH密钥："
echo "1. 如果你还没有SSH密钥，运行："
echo "   ssh-keygen -t ed25519 -C \"你的邮箱@example.com\""
echo ""
echo "2. 复制公钥到GitHub："
echo "   cat ~/.ssh/id_ed25519.pub"
echo ""
echo "3. 在GitHub网站 -> Settings -> SSH and GPG keys -> New SSH key"
echo "   粘贴刚才复制的公钥内容"
echo ""
echo "4. 测试连接："
echo "   ssh -T git@github.com"
echo ""
echo "5. 如果连接成功，就可以push了："
echo "   git push"

echo ""
echo "🌐 如果SSH也不行，可能需要配置代理或等网络恢复"
