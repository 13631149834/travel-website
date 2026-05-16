#!/usr/bin/env python3
"""全站链接完整性深度扫描"""
import re
import os
import urllib.request
import urllib.error
from urllib.parse import urljoin, urlparse

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
base_url = "https://youdao-travel.com/"

def extract_links(html_content, current_file):
    """从HTML中提取所有链接"""
    links = {
        'internal': [],
        'external': [],
        'anchors': [],
        'images': [],
        'css': [],
        'js': []
    }
    
    # href链接
    href_pattern = re.compile(r'<a[^>]+href=["\']([^"\']+)["\']', re.I)
    for match in href_pattern.finditer(html_content):
        href = match.group(1)
        if href.startswith('#'):
            links['anchors'].append(href)
        elif href.startswith('http'):
            links['external'].append(href)
        else:
            links['internal'].append(href)
    
    # 图片
    img_pattern = re.compile(r'<img[^>]+src=["\']([^"\']+)["\']', re.I)
    for match in img_pattern.finditer(html_content):
        src = match.group(1)
        if src.startswith('http'):
            links['external'].append(src)
        elif not src.startswith('data:'):
            links['images'].append(src)
    
    # CSS
    css_pattern = re.compile(r'<link[^>]+href=["\']([^"\']+\.css[^"\']*)["\']', re.I)
    for match in css_pattern.finditer(html_content):
        href = match.group(1)
        if href.startswith('http'):
            links['external'].append(href)
        else:
            links['css'].append(href)
    
    # JS
    js_pattern = re.compile(r'<script[^>]+src=["\']([^"\']+\.js[^"\']*)["\']', re.I)
    for match in js_pattern.finditer(html_content):
        href = match.group(1)
        if href.startswith('http'):
            links['external'].append(href)
        else:
            links['js'].append(href)
    
    return links

def check_internal_links(links, current_file):
    """检查内部链接是否存在"""
    broken = []
    for link in links:
        # 去掉锚点
        clean_link = link.split('#')[0]
        if not clean_link:
            continue
        # 相对路径处理
        if not clean_link.startswith('/'):
            # 相对于当前文件
            dir_path = os.path.dirname(current_file)
            full_path = os.path.join(dir_path, clean_link)
            full_path = os.path.normpath(full_path)
        else:
            full_path = clean_link.lstrip('/')
        
        if not os.path.exists(full_path):
            broken.append((link, '文件不存在'))
    
    return broken

print("=== 全站链接完整性扫描 ===\n")

all_broken = []
all_internal_files = set()

for html_file in sorted(html_files):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    links = extract_links(content, html_file)
    broken = check_internal_links(links['internal'], html_file)
    broken.extend(check_internal_links(links['images'], html_file))
    broken.extend(check_internal_links(links['css'], html_file))
    broken.extend(check_internal_links(links['js'], html_file))
    
    if broken:
        print(f"❌ {html_file}:")
        for link, reason in broken:
            print(f"   - {link} ({reason})")
            all_broken.append((html_file, link, reason))
    else:
        print(f"✓ {html_file}")

print(f"\n=== 汇总 ===")
print(f"检查文件数: {len(html_files)}")
print(f"断裂链接数: {len(all_broken)}")

if all_broken:
    print("\n断裂链接详情:")
    for html, link, reason in all_broken:
        print(f"  {html}: {link}")
