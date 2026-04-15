#!/bin/bash
echo "=== 页面链接测试 ==="
echo ""

# 获取所有HTML文件
html_files=$(find . -name "*.html" -type f | sort)

# 统计变量
total_html=0
total_links=0
missing_links=0
broken_links=()

# 检查每个HTML文件中的链接
for file in $html_files; do
  total_html=$((total_html + 1))
  
  # 提取 href 链接
  links=$(grep -oP 'href=["\x27][^"\x27]+' "$file" 2>/dev/null | sed 's/href=["\x27]//g' | grep -v '^#' | grep -v '^javascript' | grep -v '^mailto' | grep -v '^http' | grep -v '^tel')
  
  for link in $links; do
    total_links=$((total_links + 1))
    
    # 清理链接（移除查询参数和锚点）
    clean_link=$(echo "$link" | sed 's/?.*$//' | sed 's/#.*$//')
    
    if [ -n "$clean_link" ]; then
      if [ ! -f "$clean_link" ] && [ ! -d "$clean_link" ]; then
        missing_links=$((missing_links + 1))
        broken_links+=("$file -> $link")
      fi
    fi
  done
done

echo "HTML文件总数: $total_html"
echo "检查的内部链接数: $total_links"
echo "缺失的链接数: $missing_links"
echo ""

if [ ${#broken_links[@]} -gt 0 ]; then
  echo "=== 缺失的链接 ==="
  for bl in "${broken_links[@]}"; do
    echo "  $bl"
  done
else
  echo "✓ 所有内部链接正常"
fi

echo ""
echo "=== 测试完成 ==="
