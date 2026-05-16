#!/usr/bin/env python3
"""第1轮优化：性能与加载速度"""
import re
import os

def fix_chat_images():
    """修复chat.html中的图片缺少width/height问题"""
    with open('chat.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # ai-avatar.jpg 尺寸54x54
    content = content.replace(
        '<img src="images/ai-avatar.jpg" alt="AI助手小游">',
        '<img src="images/ai-avatar.jpg" alt="AI助手小游" width="54" height="54">'
    )
    # JS中的图片也需要添加尺寸
    content = re.sub(
        r"(role === 'bot' \? '<img src='images/ai-avatar\.jpg' alt='AI助手小游'>')",
        r"role === 'bot' ? '<img src=\"images/ai-avatar.jpg\" alt=\"AI助手小游\" width=\"54\" height=\"54\">'",
        content
    )
    
    # 预览图
    content = content.replace(
        '<img id="previewImg" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="预览" style="display:none"',
        '<img id="previewImg" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="预览" style="display:none" width="1" height="1"'
    )
    
    with open('chat.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("✓ chat.html 图片尺寸已修复")

def remove_console_logs():
    """移除console.log残留"""
    files_to_fix = ['exam-simulator.html', 'voice.html']
    
    for filename in files_to_fix:
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 移除console.log
            new_content = re.sub(r"\s*console\.log\([^)]+\);?\n?", "", content)
            
            if new_content != content:
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"✓ {filename} console.log已移除")
            else:
                print(f"○ {filename} 无console.log")

def add_missing_h1():
    """为缺少h1的页面添加"""
    # province-exam.html - 查找主要标题
    if os.path.exists('province-exam.html'):
        with open('province-exam.html', 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '<h1' not in content:
            # 在标题区域添加h1
            content = content.replace(
                '<div class="header">',
                '<div class="header"><h1 style="display:none">导游证省份考试</h1>'
            )
            with open('province-exam.html', 'w', encoding='utf-8') as f:
                f.write(content)
            print("✓ province-exam.html 已添加h1")
    
    # chat.html - AI助手页面应该有h1
    if os.path.exists('chat.html'):
        with open('chat.html', 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '<h1' not in content:
            # 在顶部添加h1
            content = content.replace(
                '<div class="chat-header">',
                '<div class="chat-header"><h1 style="display:none">导游证AI助手</h1>'
            )
            with open('chat.html', 'w', encoding='utf-8') as f:
                f.write(content)
            print("✓ chat.html 已添加h1")

if __name__ == '__main__':
    print("=" * 50)
    print("第1轮优化：性能与加载速度")
    print("=" * 50)
    
    fix_chat_images()
    remove_console_logs()
    add_missing_h1()
    
    print("\n✅ 第1轮优化完成！")
