#!/usr/bin/env python3
"""
第6轮修复：图片与媒体资源审计
修复内容：
1. 修复 favicon.svg 颜色为网站主色 #4C8BF5
2. 删除未使用的 .html.png 截图文件
3. 为用户发送的图片添加默认 alt 属性
"""

import os
import re

def fix_images():
    """修复图片资源问题"""
    
    # 1. 修复 favicon.svg 颜色
    favicon_path = '/tmp/travel-website/favicon.svg'
    if os.path.exists(favicon_path):
        with open(favicon_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 将橙色改为蓝色
        new_content = content.replace('#f97316', '#4C8BF5')
        
        if new_content != content:
            with open(favicon_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print("✓ 已修复: favicon.svg 颜色统一为 #4C8BF5")
    
    # 2. 删除未使用的截图文件
    unused_files = [
        '/tmp/travel-website/images/chat.html.png',
        '/tmp/travel-website/images/exam-guide.html.png',
        '/tmp/travel-website/images/exam-simulator.html.png',
        '/tmp/travel-website/images/free-materials.html.png',
        '/tmp/travel-website/images/index.png',
        '/tmp/travel-website/images/province-exam.html.png',
        '/tmp/travel-website/images/resources.html.png',
        '/tmp/travel-website/images/voice.html.png',
    ]
    
    for filepath in unused_files:
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"✓ 已删除未使用文件: {os.path.basename(filepath)}")
    
    # 3. 修复 chat.html 中用户发送图片的 alt 属性
    chat_path = '/tmp/travel-website/chat.html'
    if os.path.exists(chat_path):
        with open(chat_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # 为用户发送的图片添加 alt 属性
        content = content.replace(
            "var imgHtml = '<img class=\"msg-image\" src=\"' + pendingImage + '\"",
            "var imgHtml = '<img class=\"msg-image\" src=\"' + pendingImage + '\" alt=\"用户发送的图片\""
        )
        
        if content != original:
            with open(chat_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("✓ 已修复: chat.html 用户图片添加 alt 属性")

if __name__ == '__main__':
    print("=== 第6轮修复：图片与媒体资源审计 ===\n")
    fix_images()
    print("\n修复完成")
