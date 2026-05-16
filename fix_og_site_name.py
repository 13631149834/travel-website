#!/usr/bin/env python3
"""修复og:site_name添加问题"""
import re

OG_SITE_NAME = '<meta property="og:site_name" content="游导旅游">'

pages = ['ai-assistant.html', 'chat.html', 'exam-guide.html', 'exam-simulator.html', 
         'free-materials.html', 'privacy.html', 'province-exam.html', 'resources.html',
         'travel-knowledge.html', 'travel-tools.html', 'voice.html', 'index.html']

for filepath in pages:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'og:site_name' in content:
        continue
    
    # 同时匹配自闭合和普通标签
    pattern = r'(<meta property="og:url" content="[^"]+"/?>)'
    replacement = r'\1\n  ' + OG_SITE_NAME
    
    new_content = re.sub(pattern, replacement, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✓ {filepath}: 添加og:site_name")
    else:
        print(f"○ {filepath}: 无og:url")

print("\n完成！")
