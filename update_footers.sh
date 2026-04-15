#!/bin/bash

# 查找所有包含旧联系方式格式的HTML文件
files=$(grep -l "邮箱：2173381363@qq.com" *.html 2>/dev/null)

for file in $files; do
  # 检查是否已包含微信
  if grep -q "微信" "$file" | grep -q "ximao101" "$file"; then
    continue
  fi
  
  # 检查是否是contact.html（已处理）
  if [[ "$file" == "contact.html" ]]; then
    continue
  fi
  
  echo "Processing: $file"
  
  # 使用sed替换
  sed -i 's/<p>邮箱：2173381363@qq.com<\/p>/<p>📧 2173381363@qq.com<\/p>\n          <p>💬 微信：ximao101<\/p>/g' "$file"
  sed -i 's/<p>网址：youdao-travel.com<\/p>/<p>🌐 youdao-travel.com<\/p>/g' "$file"
done

echo "Done!"
