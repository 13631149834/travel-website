#!/usr/bin/env python3
"""第3轮优化：移动端UX深度优化"""
import re

# 修复底部tab触摸目标
def fix_bottom_tabs():
    files = ['free-materials.html', 'travel-knowledge.html', 'travel-tools.html', 
             'exam-guide.html', 'exam-simulator.html', 'voice.html', 
             'ai-assistant.html', 'resources.html']
    
    for filepath in files:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 修复底部tabs的触摸目标 (4px -> 10px 上下padding，使总高度>=44px)
            old = r'\.bottom-tabs a \{ ([^}]+)padding: 4px 0;([^}]+)\}'
            new = '.bottom-tabs a { \\1padding: 10px 0;\\2}'
            content = re.sub(old, new, content)
            
            # 如果没有找到上面的模式，直接替换
            content = content.replace(
                '.bottom-tabs a { color: #999999; display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 0.7rem; color: #4C8BF5; padding: 4px 0;',
                '.bottom-tabs a { color: #999999; display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 0.7rem; color: #4C8BF5; padding: 10px 0;'
            )
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ {filepath}: 修复底部tab触摸目标")
        except Exception as e:
            print(f"○ {filepath}: {e}")

def check_viewport():
    """检查所有页面的viewport设置"""
    import os
    pages = [f for f in os.listdir('.') if f.endswith('.html')]
    
    for page in pages:
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'viewport' not in content:
            print(f"⚠ {page}: 缺少viewport标签")
        elif 'width=device-width, initial-scale=1.0' not in content:
            print(f"⚠ {page}: viewport可能不完整")

if __name__ == '__main__':
    print("=" * 50)
    print("第3轮优化：移动端UX深度优化")
    print("=" * 50)
    
    fix_bottom_tabs()
    check_viewport()
    
    print("\n✅ 第3轮优化完成！")
