#!/usr/bin/env python3
"""
第2轮修复：导航系统深度优化
修复内容：
1. 统一 nav-toggle span 颜色为 #1A1A1A
2. 统一移动端导航切换方式为 .show
3. 修复 province-exam.html 导航链接默认色
"""

import re
import os

def fix_navigation():
    """批量修复导航系统问题"""
    
    html_files = [
        'exam-simulator.html',
    ]
    
    changes = []
    
    for filename in html_files:
        if not os.path.exists(filename):
            continue
            
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        file_changes = []
        
        # 1. 修复 nav-toggle span 白色为黑色
        content = content.replace(
            '.nav-toggle span{width:22px;height:2px;background:#fff',
            '.nav-toggle span{width:22px;height:2px;background:#1A1A1A'
        )
        if '.nav-toggle span{width:22px;height:2px;background:#1A1A1A' in content:
            file_changes.append("nav-toggle线条颜色统一为#1A1A1A")
        
        # 2. 统一移动端导航切换方式为 .show
        # 检查是否有 .open 但没有 .show
        if '.nav-links.open' in content and '.nav-links.show' not in content:
            content = content.replace('.nav-links.open', '.nav-links.show')
            content = content.replace("classList.toggle('open')", "classList.toggle('show')")
            file_changes.append("移动端导航切换方式统一为.show")
        
        if content != original:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            changes.append(f"{filename}: {', '.join(file_changes)}")
            print(f"✓ 已修复: {filename}")
        else:
            print(f"- 无需修改: {filename}")
    
    # 单独处理 province-exam.html
    filename = 'province-exam.html'
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        file_changes = []
        
        # 修复导航链接默认色为 #666666
        content = content.replace(
            '.nav-links a{padding:8px 12px;border-radius:10px;font-size:0.88rem;color:#4C8BF5;transition:all 0.3s}',
            '.nav-links a{padding:8px 12px;border-radius:10px;font-size:0.88rem;color:#666666;transition:all 0.3s}'
        )
        if '#666666;transition:all 0.3s' in content:
            file_changes.append("导航链接默认颜色统一为#666666")
        
        if content != original:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            changes.append(f"{filename}: {', '.join(file_changes)}")
            print(f"✓ 已修复: {filename}")
        else:
            print(f"- 无需修改: {filename}")
    
    return changes

if __name__ == '__main__':
    os.chdir('/tmp/travel-website')
    print("=== 第2轮修复：导航系统深度优化 ===\n")
    changes = fix_navigation()
    print(f"\n共修复 {len(changes)} 个文件")
    for c in changes:
        print(f"  • {c}")
