#!/bin/bash
# 批量优化HTML页面性能

echo "开始优化HTML页面..."

# 优化头部 - 添加预加载和DNS预解析
optimize_header() {
  local file="$1"
  
  # 检查是否已经优化过
  if grep -q "performance.css" "$file"; then
    echo "  $file 已优化，跳过"
    return
  fi
  
  # 检查是否有重复的theme-color
  local theme_count=$(grep -c 'name="theme-color"' "$file" 2>/dev/null || echo 0)
  if [ "$theme_count" -gt 1 ]; then
    # 移除重复的theme-color，只保留第一个
    sed -i '/<meta name="theme-color"/{ /#4f46e5/d; }' "$file"
    echo "  $file 移除重复theme-color"
  fi
  
  # 添加DNS预解析
  if ! grep -q 'dns-prefetch' "$file"; then
    sed -i '/<link rel="stylesheet" href="css\/style.css">/a\  <link rel="dns-prefetch" href="//cdn.jsdelivr.net">' "$file"
  fi
  
  # 添加performance.css（非阻塞加载）
  if ! grep -q 'performance.css' "$file"; then
    sed -i '/<link rel="stylesheet" href="css\/enhanced.css">/a\  <link rel="stylesheet" href="css/performance.css" media="print" onload="this.media='"'"'all'"'"'">' "$file"
  fi
  
  # 移除重复的meta标签
  sed -i '/<meta name="googlebot"/d' "$file"
  sed -i '/<meta name="baiduspider"/d' "$file"
  
  echo "  $file 头部优化完成"
}

# 优化尾部 - 添加defer属性和性能脚本
optimize_footer() {
  local file="$1"
  
  # 检查是否已经优化过
  if grep -q 'src="js/performance.js"' "$file"; then
    return
  fi
  
  # 添加performance.js
  if grep -q 'src="js/enhanced-common.js"' "$file"; then
    sed -i 's|<script src="js/enhanced-common.js"></script>|<script src="js/performance.js" defer></script>\n  <script src="js/enhanced-common.js" defer></script>|' "$file"
  fi
  
  # 添加defer到pwa.js
  sed -i 's|<script src="js/pwa.js"></script>|<script src="js/pwa.js" defer></script>|' "$file"
  
  # 添加defer到chatbot.js
  sed -i 's|<script src="js/chatbot.js"></script>|<script src="js/chatbot.js" defer></script>|' "$file"
  
  echo "  $file 尾部优化完成"
}

# 优化i18n.js加载
optimize_i18n() {
  local file="$1"
  
  # 将同步加载的i18n.js改为defer
  sed -i 's|<script src="js/i18n.js"></script>|<script src="js/i18n.js" defer></script>|' "$file"
  sed -i 's|<script src="js/i18n.js" defer></script>|<script src="js/i18n.js" defer></script>|' "$file" 2>/dev/null
  
  # 添加preload for i18n
  if ! grep -q 'rel="preload" href="js/i18n.js"' "$file" && grep -q 'rel="stylesheet"' "$file"; then
    sed -i '/<link rel="stylesheet" href="css\/style.css">/a\  <link rel="preload" href="js/i18n.js" as="script">' "$file"
  fi
}

# 处理所有HTML文件
count=0
for file in ./travel-website/*.html; do
  if [ -f "$file" ]; then
    optimize_header "$file"
    optimize_footer "$file"
    optimize_i18n "$file"
    count=$((count + 1))
  fi
done

echo "优化完成！共处理 $count 个文件"
