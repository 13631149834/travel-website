#!/usr/bin/env python3
"""全站白字修复脚本 v2"""
import re

# 保留白色的选择器模式
KEEP_WHITE = [
    r'\.btn\b', r'\.active\b', r'\.pricing-btn', r'mode-tab\.active',
    r'background.*#[4C8B]', r'background.*#[1565]', r'background.*#[1E88]',
    r'background.*#[0D47]', r'background.*#[2196]', r'background.*#[2E7D]',
    r'background.*#[2E4A]', r'linear-gradient',
    r'step-num', r'back-to-top', r'nav-item\.active', r'tab-btn\.active',
    r'detail-tab\.active', r'toc-item:hover', r'\.hero\b', r'\.header\b',
    r'\.feature\b',  # 卡片式feature
    r'\.card\b',  # 卡片
]

def should_keep_white(line):
    for p in KEEP_WHITE:
        if re.search(p, line, re.I):
            return True
    return False

def get_context_color(tag_match):
    """根据上下文决定颜色"""
    tag = tag_match.group(0).lower()
    
    # 保留蓝色背景上的白色
    if 'background' in tag:
        for bg in ['#4C8BF5', '#1565C0', '#1E88E5', '#2196F3', '#2E7D32', '#4CAF50', '#2E4A']:
            if bg in tag:
                return None  # 保留白色
    
    # 保留特殊元素
    if any(x in tag for x in ['step-num', 'back-to-top', 'nav-item.active', 'tab-btn.active', 'detail-tab.active', '.toc-item:hover']):
        return None
    
    # h标签 → #1A1A1A
    if re.match(r'<h[1-4][^>]*>', tag, re.I):
        return '#1A1A1A'
    
    # 微信号 → #4C8BF5
    if 'ximao' in tag:
        return '#4C8BF5'
    
    # strong标签 → #1A1A1A
    if re.match(r'<strong[^>]*>', tag, re.I):
        return '#1A1A1A'
    
    # 链接a标签 → #4C8BF5
    if re.match(r'<a[^>]*>', tag, re.I):
        return '#4C8BF5'
    
    # 默认 → #666666
    return '#666666'

def fix_css(content):
    """修复<style>标签内"""
    changes = []
    
    def replace_css(m):
        css = m.group(1)
        lines = css.split('\n')
        new_lines = []
        
        for line in lines:
            if 'color:' in line and '#ffffff' in line.lower():
                if should_keep_white(line):
                    new_lines.append(line)
                else:
                    new_line = re.sub(r'color:\s*#FFFFFF', 'color: #666666', line, flags=re.I)
                    if new_line != line:
                        changes.append(f"  CSS: {line.strip()[:60]}")
                        new_lines.append(new_line)
                    else:
                        new_lines.append(line)
            else:
                new_lines.append(line)
        
        return '<style>\n' + '\n'.join(new_lines) + '\n</style>'
    
    return re.sub(r'<style>(.*?)</style>', replace_css, content, flags=re.DOTALL), changes

def fix_inline(content):
    """修复inline style"""
    changes = []
    
    def replace_tag(m):
        tag = m.group(0)
        if 'color' not in tag.lower() or '#ffffff' not in tag.lower():
            return tag
        
        color = get_context_color(m)
        if color is None:
            return tag
        
        new_tag = re.sub(r'color:\s*#FFFFFF', f'color:{color}', tag, flags=re.I)
        if new_tag != tag:
            changes.append(f"  Inline: -> {color}")
        return new_tag
    
    return re.sub(r'<[^>]+style=["\'][^"\']*#[Ff]{1}[^"\']*["\'][^>]*>', replace_tag, content), changes

def fix_js(content):
    """修复JS"""
    changes = []
    
    def replace_js(m):
        js = m.group(0)
        if 'color' not in js.lower() or '#ffffff' not in js.lower():
            return js
        
        new_js = re.sub(r'["\']color["\']\s*:\s*["\']#FFFFFF["\']', '"color": "#1A1A1A"', js, flags=re.I)
        if new_js != js:
            changes.append("  JS: color fixed")
        return new_js
    
    return re.sub(r'<script[^>]*>(.*?)</script>', replace_js, content, flags=re.DOTALL), changes

def process_file(filepath):
    print(f"\n>>> {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    content, c1 = fix_css(content)
    content, c2 = fix_inline(content)
    content, c3 = fix_js(content)
    
    total = len(c1) + len(c2) + len(c3)
    
    if total > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ 修复 {total} 处")
        for c in (c1 + c2 + c3)[:15]:
            print(c)
        if total > 15:
            print(f"  ... 还有 {total-15} 处")
    else:
        print(f"  - 无需修改")
    
    return total

files = [
    'index.html', 'ai-assistant.html', 'chat.html', 'exam-guide.html',
    'province-exam.html', 'resources.html', 'travel-knowledge.html',
    'travel-tools.html', 'voice.html', 'free-materials.html', 'exam-simulator.html'
]

total = sum(process_file(f) for f in files if __import__('os').path.exists(f))
print(f"\n{'='*50}")
print(f"总计修复: {total} 处")
