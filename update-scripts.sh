#!/bin/bash
# 更新HTML文件以引用增强的JS和CSS

# 需要更新的文件列表
HTML_FILES=(
  "index.html"
  "contact.html"
  "guide-apply.html"
  "guides.html"
  "faq.html"
  "visa.html"
)

for file in "${HTML_FILES[@]}"; do
  if [ -f "$file" ]; then
    # 检查是否已经引用了 enhanced-common.js
    if ! grep -q "enhanced-common.js" "$file"; then
      # 添加 enhanced.css 引用（在 style.css 之后）
      sed -i 's|<link rel="stylesheet" href="css/style.css">|<link rel="stylesheet" href="css/style.css">\n  <link rel="stylesheet" href="css/enhanced.css">|' "$file"
      
      # 添加 enhanced-common.js 引用（在 body 结束标签之前）
      sed -i 's|</body>|  <script src="js/enhanced-common.js"></script>\n</body>|' "$file"
      
      echo "Updated: $file"
    else
      echo "Already updated: $file"
    fi
  fi
done

echo "Done!"
