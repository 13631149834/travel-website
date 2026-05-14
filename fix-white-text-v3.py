#!/usr/bin/env python3
"""全站白字修复脚本 v3 - 处理遗漏"""
import re

# 保留白色的模式（深色/蓝色背景）
KEEP_WHITE_PATTERNS = [
    r'\.btn\b', r'\.active\b', r'\.pricing-btn', r'mode-tab\.active',
    r'background.*#[4C8B]', r'background.*#[1565]', r'background.*#[1E88]',
    r'background.*#[0D47]', r'background.*#[2196]', r'background.*#[2E7D]',
    r'background.*#[2E4A]', r'linear-gradient',
    r'step-num', r'back-to-top', r'nav-item\.active', r'tab-btn\.active',
    r'detail-tab\.active', r'toc-item:hover', r'\.hero\b', r'\.header\b',
    r'\.hero\s*\{[^}]*background', r'linear-gradient.*#[4C8B]',
]

def in_keep_context(line_num, lines, content):
    """检查上下文是否在深色背景区域"""
    # 向前查找50行内的background或gradient
    start = max(0, line_num - 50)
    end = min(len(lines), line_num + 10)
    context = '\n'.join(lines[start:end])
    
    for p in KEEP_WHITE_PATTERNS:
        if re.search(p, context, re.I):
            return True
    
    # 检查是否是.hero或.feature类的card
    if re.search(r'\.hero\b|\.feature\b|\.card\b', context):
        # 但如果是白色背景就不保留
        if 'background.*#FFFFFF' in context or 'background:\s*#fff' in context.lower():
            return False
        if 'background:rgba(255,255,255' in context:
            return False
    return False

def fix_content(content):
    changes = []
    
    # 处理 <style> 块
    def fix_css(m):
        css = m.group(1)
        lines = css.split('\n')
        new_lines = []
        
        for i, line in enumerate(lines):
            if ('color:' in line.lower() and ('#ffffff' in line.lower() or '#fff' in line.lower())):
                # 检查上下文
                if in_keep_context(i, lines, css):
                    new_lines.append(line)
                else:
                    # 替换
                    new_line = re.sub(r'color:\s*#FFFFFF', 'color: #666666', line, flags=re.I)
                    new_line = re.sub(r'color:\s*#fff\b', 'color: #666666', new_line, flags=re.I)
                    if new_line != line:
                        changes.append(f"  CSS: {line.strip()[:50]}")
                        new_lines.append(new_line)
                    else:
                        new_lines.append(line)
            else:
                new_lines.append(line)
        
        return '<style>\n' + '\n'.join(new_lines) + '\n</style>'
    
    content = re.sub(r'<style>(.*?)</style>', fix_css, content, flags=re.DOTALL)
    
    # 处理 inline style
    def fix_inline(m):
        tag = m.group(0)
        if 'color' not in tag.lower():
            return tag
        
        has_white = '#ffffff' in tag.lower() or '#fff' in tag.lower()
        if not has_white:
            return tag
        
        # 保留蓝色背景上的白色
        if 'background' in tag.lower():
            for bg in ['#4C8BF5', '#1565C0', '#1E88E5', '#2196F3', '#2E7D32', '#4CAF50', '#2E4A']:
                if bg in tag:
                    return tag
        
        # 保留特殊元素
        if any(x in tag.lower() for x in ['step-num', 'back-to-top', '.active', 'nav-item']):
            return tag
        
        # h标签 → #1A1A1A
        if re.match(r'<h[1-4][^>]*>', tag, re.I):
            new_tag = re.sub(r'color:\s*#F+\b', 'color:#1A1A1A', tag, flags=re.I)
            if new_tag != tag:
                changes.append("  Inline h: -> #1A1A1A")
            return new_tag
        
        # 微信号 → #4C8BF5
        if 'ximao' in tag.lower():
            new_tag = re.sub(r'color:\s*#F+\b', 'color:#4C8BF5', tag, flags=re.I)
            return new_tag
        
        # 默认改为 #666666
        new_tag = re.sub(r'color:\s*#F+\b', 'color:#666666', tag, flags=re.I)
        if new_tag != tag:
            changes.append("  Inline: -> #666666")
        return new_tag
    
    content = re.sub(r'<[^>]+style=["\'][^"\']*["\'][^>]*>', fix_inline, content)
    
    # 处理 JS
    def fix_js(m):
        js = m.group(0)
        if 'color' not in js.lower() or '#ffffff' not in js.lower():
            return js
        
        new_js = re.sub(r'["\']color["\']\s*:\s*["\']#FFFFFF["\']', '"color": "#1A1A1A"', js, flags=re.I)
        if new_js != js:
            changes.append("  JS: fixed")
        return new_js
    
    content = re.sub(r'<script[^>]*>(.*?)</script>', fix_js, content, flags=re.DOTALL)
    
    return content, changes

files = [
    'index.html', 'ai-assistant.html', 'chat.html', 'exam-guide.html',
    'province-exam.html', 'resources.html', 'travel-knowledge.html',
    'travel-tools.html', 'voice.html', 'free-materials.html', 'exam-simulator.html'
]

total = 0
for f in files:
    if __import__('os').path.exists(f):
        print(f"\n>>> {f}")
        with open(f, 'r', encoding='utf-8') as fp:
            content = fp.read()
        
        content, changes = fix_content(content)
        
        if changes:
            with open(f, 'w', encoding='utf-8') as fp:
                fp.write(content)
            print(f"  ✓ 修复 {len(changes)} 处")
            for c in changes[:10]:
                print(c)
            if len(changes) > 10:
                print(f"  ... 还有 {len(changes)-10} 处")
            total += len(changes)
        else:
            print(f"  - 无需修改")

print(f"\n{'='*50}")
print(f"本次修复: {total} 处")
