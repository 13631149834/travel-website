#!/usr/bin/env python3
"""
第1轮修复：全站视觉一致性深度审查
修复内容：
1. 统一 glass-card 圆角为 16px
2. 统一卡片基础样式
3. 统一阴影风格
"""

import re
import os

def fix_visual_consistency():
    """批量修复视觉一致性问题"""
    
    html_files = [
        'index.html',
        'exam-simulator.html', 
        'exam-guide.html',
        'chat.html',
        'resources.html',
        'free-materials.html',
        'travel-knowledge.html',
        'travel-tools.html',
        'voice.html',
        'ai-assistant.html',
        'province-exam.html'
    ]
    
    changes = []
    
    for filename in html_files:
        if not os.path.exists(filename):
            continue
            
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        file_changes = []
        
        # 1. 统一 glass-card 圆角为 16px
        patterns_to_fix = [
            (r'\.glass-card\s*\{([^}]*?)border-radius:\s*14px', '.glass-card {\\1border-radius: 16px'),
            (r'\.glass-card\s*\{([^}]*?)border-radius:\s*20px', '.glass-card {\\1border-radius: 16px'),
            (r'\.glass-card\s*\{([^}]*?)border-radius:\s*18px', '.glass-card {\\1border-radius: 16px'),
        ]
        
        for pattern, replacement in patterns_to_fix:
            new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                if "glass-card 圆角" not in file_changes:
                    file_changes.append("glass-card 圆角统一为16px")
                content = new_content
        
        # 2. 统一 key-point 颜色为 #4C8BF5
        if '.key-point' in content:
            new_content = re.sub(
                r'\.key-point\s*\{\s*([^}]*?)color:\s*#1A237E',
                '.key-point {\\1color: #4C8BF5',
                content
            )
            if new_content != content:
                file_changes.append("key-point 颜色统一")
                content = new_content
        
        # 3. 统一阴影风格
        shadow_replacements = [
            (r'box-shadow:\s*0\s+1px\s+4px\s+rgba\(0,0,0,0\.04\)', 'box-shadow: 0 2px 8px rgba(0,0,0,0.06)'),
            (r'box-shadow:\s*0\s+1px\s+4px\s+rgba\(0,0,0,0\.06\)', 'box-shadow: 0 2px 8px rgba(0,0,0,0.06)'),
        ]
        
        for pattern, replacement in shadow_replacements:
            new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                content = new_content
        
        if content != original:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            changes.append(f"{filename}: {', '.join(file_changes) if file_changes else '样式统一'}")
            print(f"✓ 已修复: {filename}")
        else:
            print(f"- 无需修改: {filename}")
    
    return changes

if __name__ == '__main__':
    os.chdir('/tmp/travel-website')
    print("=== 第1轮修复：全站视觉一致性深度审查 ===\n")
    changes = fix_visual_consistency()
    print(f"\n共修复 {len(changes)} 个文件")
    for c in changes:
        print(f"  • {c}")
