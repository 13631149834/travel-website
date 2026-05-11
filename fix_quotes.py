#!/usr/bin/env python3
with open('province-exam.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 替换中文引号
content = content.replace('\u201c', '\\"')  # 左双引号 "
content = content.replace('\u201d', '\\"')  # 右双引号 "
content = content.replace('\u2018', "'")    # 左单引号 '
content = content.replace('\u2019', "'")    # 右单引号 '

with open('province-exam.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('引号修复完成')
