#!/usr/bin/env python3
"""第2轮优化：SEO深度优化"""
import re
import os

OG_SITE_NAME = '<meta property="og:site_name" content="游导旅游">'
CANONICAL_BASE = '<link rel="canonical" href="https://youdao-travel.com{}">'

PAGES = [
    ('index.html', 'https://youdao-travel.com/'),
    ('ai-assistant.html', 'https://youdao-travel.com/ai-assistant.html'),
    ('chat.html', 'https://youdao-travel.com/chat.html'),
    ('exam-guide.html', 'https://youdao-travel.com/exam-guide.html'),
    ('exam-simulator.html', 'https://youdao-travel.com/exam-simulator.html'),
    ('free-materials.html', 'https://youdao-travel.com/free-materials.html'),
    ('privacy.html', 'https://youdao-travel.com/privacy.html'),
    ('province-exam.html', 'https://youdao-travel.com/province-exam.html'),
    ('resources.html', 'https://youdao-travel.com/resources.html'),
    ('travel-knowledge.html', 'https://youdao-travel.com/travel-knowledge.html'),
    ('travel-tools.html', 'https://youdao-travel.com/travel-tools.html'),
    ('voice.html', 'https://youdao-travel.com/voice.html'),
]

def add_og_site_name(filepath, url):
    """添加og:site_name"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'og:site_name' in content:
        return False
    
    # 在og:url后面添加og:site_name
    pattern = r'(<meta property="og:url" content="[^"]+">)'
    replacement = r'\1\n  ' + OG_SITE_NAME
    new_content = re.sub(pattern, replacement, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def add_canonical(filepath, url):
    """添加canonical标签"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'rel="canonical"' in content:
        return False
    
    canonical = CANONICAL_BASE.format(url)
    
    # 在</head>前添加
    new_content = content.replace('</head>', f'  {canonical}\n</head>')
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def add_json_ld(filepath, url):
    """添加基础JSON-LD"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'application/ld+json' in content:
        return False
    
    # 提取标题
    title_match = re.search(r'<title>([^<]+)</title>', content)
    title = title_match.group(1) if title_match else '游导旅游'
    
    # 提取描述
    desc_match = re.search(r'<meta name="description" content="([^"]+)"', content)
    description = desc_match.group(1) if desc_match else '导游证AI智能备考平台'
    
    json_ld = f'''
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "{title}",
    "description": "{description}",
    "url": "{url}"
  }}
  </script>'''
    
    new_content = content.replace('</head>', f'{json_ld}\n</head>')
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

if __name__ == '__main__':
    print("=" * 50)
    print("第2轮优化：SEO深度优化")
    print("=" * 50)
    
    for filepath, url in PAGES:
        if not os.path.exists(filepath):
            continue
        
        og_fixed = add_og_site_name(filepath, url)
        canon_fixed = add_canonical(filepath, url)
        jsonld_fixed = add_json_ld(filepath, url)
        
        status = []
        if og_fixed: status.append("og:site_name")
        if canon_fixed: status.append("canonical")
        if jsonld_fixed: status.append("JSON-LD")
        
        if status:
            print(f"✓ {filepath}: 添加 {', '.join(status)}")
        else:
            print(f"○ {filepath}: 已完整")
    
    print("\n✅ 第2轮优化完成！")
