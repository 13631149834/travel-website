#!/usr/bin/env python3
"""修复旅游网站的所有bug和补充品牌元素"""

import re

# ============= 修复 resources.html =============
print("修复 resources.html...")

with open('resources.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 修复B包链接：查看样本→ 应该打开弹窗而不是跳转
content = re.sub(
    r'<li>广东面试12景点导游词 <a href="province-exam\.html"[^>]*>查看样本→</a></li>',
    '<li>广东面试12景点导游词 <a href="javascript:;" onclick="openSampleModal()" style="color:#4C8BF5;font-size:0.82rem;text-decoration:underline;">查看样本→</a></li>',
    content
)

# 2. 在CSS区域添加 content-detail 相关样式
# 找到 </style> 前的位置插入新样式
style_end = content.find('/* Footer */')
if style_end != -1:
    new_styles = '''
    /* 内容详情展开 */
    .content-detail-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #F0F5FF, #E0E8FF);
      border: 1px solid #D0DCFF;
      border-radius: 12px;
      color: #4C8BF5;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 12px;
      transition: all 0.3s;
      text-align: center;
    }
    .content-detail-btn:hover {
      background: linear-gradient(135deg, #E8F0FF, #D0E0FF);
      transform: translateY(-1px);
    }
    .content-detail-btn.active {
      background: linear-gradient(135deg, #4C8BF5, #3B7AE0);
      color: #FFF;
    }
    .content-detail-list {
      display: none;
      margin-top: 12px;
      padding: 16px;
      background: #F8FAFF;
      border-radius: 12px;
      border: 1px solid #E8F0FF;
      text-align: left;
    }
    .content-detail-list.show {
      display: block;
    }
    .content-detail-list h4 {
      font-size: 0.9rem;
      color: #4C8BF5;
      font-weight: 700;
      margin: 12px 0 8px 0;
    }
    .content-detail-list h4:first-child {
      margin-top: 0;
    }
    .content-detail-list ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .content-detail-list li {
      font-size: 0.85rem;
      color: #666;
      padding: 4px 0;
      padding-left: 16px;
      position: relative;
    }
    .content-detail-list li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #4C8BF5;
    }

    /* 样本预览弹窗修复 */
    #sampleModal {
      display: none !important;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      z-index: 99999 !important;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    #sampleModal.show {
      display: flex !important;
    }
'''
    content = content[:style_end] + new_styles + content[style_end:]

# 3. 修复弹窗按钮的onclick，使用新的show类方式
content = re.sub(
    r'onclick="document\.getElementById\(\'sampleModal\'\)\.style\.display=\'flex\'"',
    "onclick=\"openSampleModal()\"",
    content
)

# 4. 添加水印到样本预览弹窗内容底部
content = re.sub(
    r'(完整28页笔记在B包中解锁</div>)',
    r'\1\n        <div style="text-align:center;margin-top:20px;padding-top:16px;border-top:1px dashed #E5E7EB;">\n          <div style="font-size:0.8rem;color:#FF6B6B;font-weight:600;">ximao101独家整理</div>\n        </div>',
    content
)

# 5. 添加公众号名称到页脚
old_footer = '<div class="footer">\n  <p>© 2026 游导学习笔记 · <a href="index.html">返回首页</a></p>\n</div>'
new_footer = '''<div class="footer">
  <p>© 2026 游导学习笔记 · <a href="index.html">返回首页</a></p>
  <p style="margin-top:8px;color:#999;font-size:0.8rem;">公众号：逢考必过 & 证好有你</p>
</div>'''
content = content.replace(old_footer, new_footer)

# 6. 在JS部分添加缺失的函数
old_script = '''function toggleFaq(el) {
  el.classList.toggle('open');
  el.nextElementSibling.classList.toggle('open');
}

'''
new_script = '''function toggleFaq(el) {
  el.classList.toggle('open');
  el.nextElementSibling.classList.toggle('open');
}

function toggleDetail(id) {
  var detail = document.getElementById(id);
  var btn = detail.previousElementSibling;
  if (detail.classList.contains('show')) {
    detail.classList.remove('show');
    if (btn && btn.classList) btn.classList.remove('active');
  } else {
    detail.classList.add('show');
    if (btn && btn.classList) btn.classList.add('active');
  }
}

function openSampleModal() {
  var modal = document.getElementById('sampleModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('show');
  }
}

function closeSampleModal() {
  var modal = document.getElementById('sampleModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
  }
}

'''
content = content.replace(old_script, new_script)

# 7. 修复关闭按钮的onclick
content = re.sub(
    r'onclick="document\.getElementById\(\'sampleModal\'\)\.style\.display=\'none\'"',
    "onclick=\"closeSampleModal()\"",
    content
)

with open('resources.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ resources.html 修复完成")

# ============= 修复 index.html =============
print("修复 index.html...")

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 添加Slogan到hero区域，在标题下方
old_hero = '''    <div class="hero">
      <h1>游导学习笔记</h1>
      <p>导游证备考资料 | 历年真题 | 面试问答 | 思维导图</p>'''

new_hero = '''    <div class="hero">
      <h1>游导学习笔记</h1>
      <p class="hero-slogan">走过弯路，所以更懂路</p>
      <p>导游证备考资料 | 历年真题 | 面试问答 | 思维导图</p>'''

content = content.replace(old_hero, new_hero)

# 添加Slogan的CSS样式
style_pattern = r'\.hero p \{ font-size: 1\.1rem; color: #666666;font-weight:500; max-width: 560px; margin: 0 auto 28px; \}'
new_style = '''.hero p { font-size: 1.1rem; color: #666666;font-weight:500; max-width: 560px; margin: 0 auto 28px; }
    .hero-slogan {
      font-size: 1.2rem;
      color: #4C8BF5;
      font-weight: 700;
      margin-bottom: 12px;
      letter-spacing: 1px;
    }'''
content = re.sub(style_pattern, new_style, content)

# 添加公众号名称到页脚
if '<div class="footer">' in content:
    old_footer_idx = content.find('<div class="footer">')
    footer_end = content.find('</div>', old_footer_idx) + 6
    old_footer_full = content[old_footer_idx:footer_end]
    
    if old_footer_full.strip().endswith('</div>') and '公众号' not in old_footer_full:
        new_footer_full = old_footer_full.replace(
            '</div>\n</div>',
            '<p style="margin-top:8px;color:#999;font-size:0.8rem;">公众号：逢考必过 & 证好有你</p>\n</div>\n</div>'
        )
        content = content.replace(old_footer_full, new_footer_full)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ index.html 修复完成")

# ============= 修复其他页面，添加公众号名称 =============
print("修复其他页面的页脚...")

html_files = ['exam-guide.html', 'exam-simulator.html', 'travel-knowledge.html', 
              'travel-tools.html', 'voice.html', 'chat.html', 'free-materials.html',
              'ai-assistant.html', 'privacy.html']

for filename in html_files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '<div class="footer">' in content and '公众号' not in content:
            old_footer_idx = content.find('<div class="footer">')
            footer_end = content.find('</div>', old_footer_idx) + 6
            old_footer_full = content[old_footer_idx:footer_end]
            
            if old_footer_full.strip().endswith('</div>'):
                new_footer_full = old_footer_full.replace(
                    '</div>\n</div>',
                    '<p style="margin-top:8px;color:#999;font-size:0.8rem;">公众号：逢考必过 & 证好有你</p>\n</div>\n</div>'
                )
                content = content.replace(old_footer_full, new_footer_full)
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✓ {filename} 修复完成")
    except Exception as e:
        print(f"⚠ {filename}: {e}")

print("\n=== 所有修复完成 ===")
