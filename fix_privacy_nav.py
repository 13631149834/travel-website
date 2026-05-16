import re

# 读取privacy.html
with open('privacy.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 添加底部导航样式
if '.bottom-tabs' not in content:
    style_addition = '''
    .bottom-tabs{position:fixed;bottom:0;left:0;right:0;background:#FFF;border-top:1px solid #F0F0F0;display:flex;justify-content:space-around;padding:8px 0;z-index:100}
    .bottom-tabs .tab-item{display:flex;flex-direction:column;align-items:center;font-size:0.7rem;color:#999;gap:2px}
    .bottom-tabs .tab-item span:first-child{font-size:1.3rem}
    .bottom-tabs .tab-active{color:#4C8BF5}
    body{padding-bottom:70px}
'''
    content = content.replace('.footer a{color:#4C8BF5}', '.footer a{color:#4C8BF5}' + style_addition)

# 在</body>前添加底部导航
bottom_nav = '''
<nav class="bottom-tabs">
  <a class="tab-item" href="index.html"><span>🏠</span><span>首页</span></a>
  <a class="tab-item" href="exam-guide.html"><span>📚</span><span>学习</span></a>
  <a class="tab-item" href="exam-simulator.html"><span>✏️</span><span>刷题</span></a>
  <a class="tab-item" href="chat.html"><span>💬</span><span>AI</span></a>
  <a class="tab-item" href="resources.html"><span>👤</span><span>我的</span></a>
</nav>
'''

content = content.replace('</body>', bottom_nav + '\n</body>')

# 写回文件
with open('privacy.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("privacy.html 底部导航已添加")
