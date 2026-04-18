#!/bin/bash

# 导游证备考网站 - 自动部署脚本
# 使用方法：在云电脑终端运行 bash deploy.sh

echo "=========================================="
echo "  导游证备考网站 - 自动部署脚本"
echo "=========================================="

# 设置变量
REPO_URL="https://github.com/13631149834/travel-website.git"
TEMP_DIR="/tmp/travel-website-deploy"
SOURCE_DIR="$(pwd)"

echo ""
echo "📦 步骤1：克隆GitHub仓库..."
rm -rf $TEMP_DIR
git clone $REPO_URL $TEMP_DIR
cd $TEMP_DIR

echo ""
echo "🗑️ 步骤2：清理旧文件（保留必要文件）..."
# 删除所有HTML文件
find . -maxdepth 1 -name "*.html" -type f -delete
# 删除所有文件夹（保留.git）
find . -maxdepth 1 -type d ! -name "." ! -name ".git" -exec rm -rf {} +

echo ""
echo "📁 步骤3：创建目录结构..."
mkdir -p css js

echo ""
echo "📤 步骤4：复制新文件..."
cp "$SOURCE_DIR/index.html" ./
cp "$SOURCE_DIR/guide-exam.html" ./
cp "$SOURCE_DIR/free-materials.html" ./
cp "$SOURCE_DIR/css/style.css" ./css/
cp "$SOURCE_DIR/js/common.js" ./js/

echo ""
echo "📝 步骤5：提交到Git..."
git add -A
git commit -m "更新：导游证备考精简网站 - $(date '+%Y-%m-%d %H:%M')"

echo ""
echo "🚀 步骤6：推送到GitHub..."
git push origin main

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "🌐 网站地址："
echo "   https://youdao-travel.com"
echo "   https://13631149834.github.io/travel-website/"
echo ""
echo "⏳ GitHub Pages 需要几分钟生效，请耐心等待"
echo ""
