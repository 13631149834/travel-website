#!/usr/bin/env python3
"""修复og标签顺序不同的页面"""
import re

OG_SITE_NAME = '<meta property="og:site_name" content="游导旅游">'

pages = ['exam-simulator.html', 'privacy.html']

for filepath in pages:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'og:site_name' in content:
        print(f"○ {filepath}: 已有og:site_name")
        continue
    
    # 匹配 property 在后面的 og:url
    pattern = r'(<meta content="https://youdao-travel\.com/[^"]+" property="og:url"/?>)'
    replacement = r'\1\n  ' + OG_SITE_NAME
    
    new_content = re.sub(pattern, replacement, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✓ {filepath}: 添加og:site_name")
    else:
        print(f"○ {filepath}: 未找到og:url")
