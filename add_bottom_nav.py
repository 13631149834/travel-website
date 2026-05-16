#!/usr/bin/env python3
"""为缺少底部导航的页面添加底部导航栏"""

bottom_nav = '''
<nav class="bottom-tabs">
  <a class="tab-item" href="index.html"><span>🏠</span><span>首页</span></a>
  <a class="tab-item" href="exam-guide.html"><span>📚</span><span>学习</span></a>
  <a class="tab-item" href="exam-simulator.html"><span>✏️</span><span>刷题</span></a>
  <a class="tab-item" href="chat.html"><span>💬</span><span>AI</span></a>
  <a class="tab-item" href="resources.html"><span>👤</span><span>我的</span></a>
</nav>
'''

# 底部导航样式
bottom_nav_style = '''
<style>
.bottom-tabs{display:flex;position:fixed;bottom:0;left:0;right:0;background:#FFF;border-top:1px solid #F0F0F0;padding:6px 0;padding-bottom:calc(6px + env(safe-area-inset-bottom));z-index:99;box-shadow:0 -2px 10px rgba(0,0,0,0.05)}
.bottom-tabs .tab-item{display:flex;flex-direction:column;align-items:center;flex:1;font-size:0.65rem;color:#999;gap:2px;padding:4px 0}
.bottom-tabs .tab-item span:first-child{font-size:1.25rem}
.bottom-tabs .tab-active{color:#4C8BF5}
.bottom-tabs a{color:#999;text-decoration:none}
</style>
'''

pages_need_nav = ['chat.html', 'exam-guide.html', 'exam-simulator.html', 'free-materials.html', 
                  'index.html', 'province-exam.html', 'resources.html', 
                  'travel-knowledge.html', 'travel-tools.html', 'voice.html']

for page in pages_need_nav:
    try:
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已有bottom-tabs
        if 'class="bottom-tabs"' in content or "class='bottom-tabs'" in content:
            print(f"✓ {page} 已有底部导航")
            continue
        
        # 检查是否已有nav class="bottom
        if '<nav class="bottom' in content:
            print(f"✓ {page} 已有nav")
            continue
        
        # 添加样式（在</head>前）
        if '<style>' in content and bottom_nav_style.split('\n')[2].strip() not in content:
            # 找到第一个</style>标签，在其后插入
            idx = content.find('</style>')
            if idx > 0:
                content = content[:idx+8] + '\n' + bottom_nav_style + content[idx+8:]
        
        # 添加导航（在</body>前）
        if '</body>' in content:
            content = content.replace('</body>', bottom_nav + '\n</body>')
        
        with open(page, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ {page} 已添加底部导航")
    except Exception as e:
        print(f"✗ {page} 错误: {e}")

print("\n底部导航添加完成！")
