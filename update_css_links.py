#!/usr/bin/env python3
"""更新所有页面引用common.css"""

pages = ['index.html', 'exam-guide.html', 'exam-simulator.html', 'chat.html',
         'free-materials.html', 'ai-assistant.html', 'travel-knowledge.html',
         'travel-tools.html', 'voice.html', 'province-exam.html', 'resources.html']

for page in pages:
    try:
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已有common.css引用
        if 'common.css' in content:
            print(f"✓ {page} 已有common.css引用")
            continue
        
        # 添加common.css引用（在</head>前第一个link或style前）
        common_css_link = '<link rel="stylesheet" href="css/common.css">\n'
        
        # 找到</head>或<link rel="stylesheet">的位置
        import re
        
        # 在</head>前添加
        if '</head>' in content:
            content = content.replace('</head>', common_css_link + '</head>')
        elif '<link rel="stylesheet"' in content:
            # 在第一个link标签后添加
            first_link = re.search(r'(<link rel="stylesheet"[^>]+>)', content)
            if first_link:
                content = content.replace(first_link.group(1), 
                    first_link.group(1) + '\n  ' + common_css_link.strip())
        
        with open(page, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ {page} 已添加common.css引用")
    except Exception as e:
        print(f"✗ {page} 错误: {e}")

print("\n完成!")
