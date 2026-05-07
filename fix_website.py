#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
网站修复脚本 - youdao-travel.com
修复导航栏、添加购买入口、完善SEO等
"""

import os
import re

# 基础路径
BASE_PATH = "."

# 统一的导航栏HTML（完整版）
NAV_FULL = '''<!-- 导航栏 -->
<nav class="navbar">
  <a href="index.html" class="logo">🏠 导游证备考</a>
  <div class="nav-links">
    <a href="index.html">首页</a>
    <a href="ai-assistant.html">AI备考助手</a>
    <a href="guide-exam.html">资料套餐</a>
    <a href="free-materials.html">免费资料</a>
    <a href="#contact">联系客服</a>
  </div>
</nav>'''

# 简洁导航栏（用于简单页面如index和pricing）
NAV_SIMPLE = '''<!-- 导航栏 -->
<nav class="navbar">
  <a href="index.html" class="logo">🏠 导游证备考</a>
  <div class="nav-links">
    <a href="index.html">首页</a>
    <a href="ai-assistant.html">AI备考助手</a>
    <a href="guide-exam.html">资料套餐</a>
    <a href="free-materials.html">免费资料</a>
    <a href="pricing.html">价格</a>
  </div>
</nav>'''

# 闲鱼购买按钮HTML
XIANYU_BUY_HTML = '''    <!-- 闲鱼购买入口 -->
    <div class="xianyu-section" style="background: linear-gradient(135deg, #00A1D6 0%, #0073B1 100%); padding: 40px 24px; border-radius: 12px; text-align: center; margin: 32px 0;">
      <h2 style="color: #fff; font-size: 1.5rem; margin-bottom: 12px;">📦 需要完整备考资料包？</h2>
      <p style="color: rgba(255,255,255,0.9); font-size: 1rem; margin-bottom: 20px;">闲鱼搜索「2026导游证备考包+AI助手」，三档套餐任你选</p>
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 16px;">
        <span style="background: rgba(255,255,255,0.2); color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 0.9rem;">基础包 29.9元</span>
        <span style="background: rgba(255,255,255,0.2); color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 0.9rem;">升级包 57元</span>
        <span style="background: #fff; color: #0073B1; padding: 8px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 600;">全能包 99元 ⭐推荐</span>
      </div>
      <a href="https://www.xianyu.com" target="_blank" style="display: inline-block; background: #fff; color: #0073B1; padding: 14px 32px; border-radius: 50px; font-size: 1.1rem; font-weight: 700; text-decoration: none; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
        去闲鱼购买 📱
      </a>
      <p style="color: rgba(255,255,255,0.8); font-size: 0.85rem; margin-top: 12px;">或添加微信 ximao101 咨询购买</p>
    </div>'''

# 公众号页脚HTML
WECHAT_PUBLIC_HTML = '''
<!-- 公众号展示 -->
<div style="background: #f8fafc; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
  <h3 style="color: #1f2937; font-size: 1.1rem; margin-bottom: 12px;">📣 关注公众号「逢考必过」</h3>
  <p style="color: #666; font-size: 0.9rem; margin-bottom: 12px;">获取更多导游证备考资讯、干货分享</p>
  <p style="color: #2563eb; font-size: 0.85rem;">备考路上不孤单，我们一起加油！💪</p>
</div>'''

# 底部悬浮栏HTML（移动端）
MOBILE_FLOAT_BAR = '''
<!-- 移动端底部悬浮栏 -->
<div class="mobile-float-bar">
  <a href="https://www.xianyu.com" target="_blank" class="float-btn xianyu">
    <span class="float-icon">🛒</span>
    <span>去闲鱼购买</span>
  </a>
  <a href="weixin://dl/chat/ximao101" class="float-btn wechat">
    <span class="float-icon">💬</span>
    <span>微信咨询</span>
  </a>
</div>
<style>
.mobile-float-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 8px 12px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 999;
  gap: 8px;
}
.float-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}
.float-btn.xianyu {
  background: linear-gradient(135deg, #00A1D6, #0073B1);
  color: #fff;
}
.float-btn.wechat {
  background: #07c160;
  color: #fff;
}
@media (max-width: 768px) {
  .mobile-float-bar {
    display: flex;
  }
  body {
    padding-bottom: 70px;
  }
}
</style>'''

# 统一的Footer HTML
FOOTER_HTML = '''
<!-- Footer -->
<footer class="footer">
  <p>© 2025 导游证备考资料 | youdao-travel.com</p>
  <p style="margin-top: 8px;">关注公众号「逢考必过」获取更多备考资讯</p>
  <p style="margin-top: 8px;">咨询微信：ximao101 | <a href="pricing.html" style="color: #2563eb;">查看价格</a></p>
</footer>'''

def fix_index_html():
    """修复 index.html"""
    print("修复 index.html...")
    with open(f"{BASE_PATH}/index.html", "r", encoding="utf-8") as f:
        content = f.read()
    
    # 替换导航栏
    old_nav = re.search(r'<!-- 导航栏 -->.*?</nav>', content, re.DOTALL)
    if old_nav:
        content = content.replace(old_nav.group(), NAV_SIMPLE)
    
    # 在联系区域前添加闲鱼购买入口
    if "xianyu-section" not in content:
        content = content.replace(
            '<!-- 联系方式 -->',
            XIANYU_BUY_HTML + '\n  <!-- 联系方式 -->'
        )
    
    # 替换Footer
    if "公众号「逢考必过」" not in content:
        content = content.replace(
            '</body>',
            WECHAT_PUBLIC_HTML + FOOTER_HTML + '\n</body>'
        )
        # 删除旧的footer
        old_footer = re.search(r'<footer class="footer">.*?</footer>', content, re.DOTALL)
        if old_footer:
            content = content.replace(old_footer.group(), '')
    
    # 添加移动端悬浮栏
    if "mobile-float-bar" not in content:
        content = content.replace('</body>', MOBILE_FLOAT_BAR + '\n</body>')
    
    with open(f"{BASE_PATH}/index.html", "w", encoding="utf-8") as f:
        f.write(content)
    print("✓ index.html 修复完成")

def fix_pricing_html():
    """修复 pricing.html"""
    print("修复 pricing.html...")
    with open(f"{BASE_PATH}/pricing.html", "r", encoding="utf-8") as f:
        content = f.read()
    
    # 替换导航栏
    old_nav = re.search(r'<!-- 导航栏 -->.*?</nav>', content, re.DOTALL)
    if old_nav:
        content = content.replace(old_nav.group(), NAV_SIMPLE)
    
    # 在联系区域前添加闲鱼购买入口
    if "xianyu-section" not in content:
        content = content.replace(
            '<!-- 联系方式 -->',
            XIANYU_BUY_HTML.replace('margin: 32px 0', 'margin: 32px 0 0') + '\n  <!-- 联系方式 -->'
        )
    
    # 替换Footer
    if "公众号「逢考必过」" not in content:
        content = content.replace(
            '</body>',
            WECHAT_PUBLIC_HTML + FOOTER_HTML + '\n</body>'
        )
        old_footer = re.search(r'<footer class="footer">.*?</footer>', content, re.DOTALL)
        if old_footer:
            content = content.replace(old_footer.group(), '')
    
    # 添加移动端悬浮栏
    if "mobile-float-bar" not in content:
        content = content.replace('</body>', MOBILE_FLOAT_BAR + '\n</body>')
    
    with open(f"{BASE_PATH}/pricing.html", "w", encoding="utf-8") as f:
        f.write(content)
    print("✓ pricing.html 修复完成")

def fix_ai_assistant_html():
    """修复 ai-assistant.html"""
    print("修复 ai-assistant.html...")
    with open(f"{BASE_PATH}/ai-assistant.html", "r", encoding="utf-8") as f:
        content = f.read()
    
    # 替换导航栏
    old_nav = re.search(r'<!-- 导航栏 -->.*?</nav>', content, re.DOTALL)
    if old_nav:
        content = content.replace(old_nav.group(), NAV_FULL)
    
    # 确保导航链接正确
    content = content.replace('href="guide-exam.html">备考服务</a>', 'href="guide-exam.html">资料套餐</a>')
    
    # 添加闲鱼购买入口
    if "xianyu-section" not in content:
        content = content.replace(
            '</div>\n  \n  <!-- Footer -->',
            '</div>\n  \n  ' + XIANYU_BUY_HTML + '\n  <!-- Footer -->'
        )
    
    # 替换Footer
    if "公众号「逢考必过」" not in content:
        content = content.replace(
            '<!-- Footer -->',
            WECHAT_PUBLIC_HTML + '\n  <!-- Footer -->'
        )
    
    # 添加移动端悬浮栏
    if "mobile-float-bar" not in content:
        content = content.replace('</body>', MOBILE_FLOAT_BAR + '\n</body>')
    
    # 更新Coze SDK注释和Bot ID
    content = content.replace(
        'Bot ID: YOUR_BOT_ID',
        'Bot ID: 7633483506475532328'
    )
    
    with open(f"{BASE_PATH}/ai-assistant.html", "w", encoding="utf-8") as f:
        f.write(content)
    print("✓ ai-assistant.html 修复完成")

def fix_free_materials_html():
    """修复 free-materials.html"""
    print("修复 free-materials.html...")
    with open(f"{BASE_PATH}/free-materials.html", "r", encoding="utf-8") as f:
        content = f.read()
    
    # 替换导航栏
    old_nav = re.search(r'<!-- 导航栏 -->.*?</nav>', content, re.DOTALL)
    if old_nav:
        content = content.replace(old_nav.group(), NAV_FULL)
    
    # 确保导航链接正确
    content = content.replace('href="guide-exam.html">备考服务</a>', 'href="guide-exam.html">资料套餐</a>')
    
    # 添加移动端悬浮栏
    if "mobile-float-bar" not in content:
        content = content.replace('</body>', MOBILE_FLOAT_BAR + '\n</body>')
    
    with open(f"{BASE_PATH}/free-materials.html", "w", encoding="utf-8") as f:
        f.write(content)
    print("✓ free-materials.html 修复完成")

def fix_guide_exam_html():
    """修复 guide-exam.html"""
    print("修复 guide-exam.html...")
    with open(f"{BASE_PATH}/guide-exam.html", "r", encoding="utf-8") as f:
        content = f.read()
    
    # 替换导航栏
    old_nav = re.search(r'<!-- 导航栏 -->.*?</nav>', content, re.DOTALL)
    if old_nav:
        content = content.replace(old_nav.group(), NAV_FULL)
    
    # 确保导航链接正确
    content = content.replace('href="guide-exam.html">备考服务</a>', 'href="guide-exam.html">资料套餐</a>')
    
    # 添加移动端悬浮栏
    if "mobile-float-bar" not in content:
        content = content.replace('</body>', MOBILE_FLOAT_BAR + '\n</body>')
    
    with open(f"{BASE_PATH}/guide-exam.html", "w", encoding="utf-8") as f:
        f.write(content)
    print("✓ guide-exam.html 修复完成")

def create_seo_files():
    """创建SEO相关文件"""
    print("创建SEO文件...")
    
    # robots.txt
    robots_content = """User-agent: *
Allow: /

# Sitemap
Sitemap: https://youdao-travel.com/sitemap.xml

# Disallow unnecessary paths
Disallow: /analytics/
Disallow: /admin/
Disallow: /api/
"""
    with open(f"{BASE_PATH}/robots.txt", "w", encoding="utf-8") as f:
        f.write(robots_content)
    print("✓ robots.txt 创建完成")
    
    # sitemap.xml
    sitemap_content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://youdao-travel.com/</loc>
    <lastmod>2025-05-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://youdao-travel.com/index.html</loc>
    <lastmod>2025-05-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://youdao-travel.com/ai-assistant.html</loc>
    <lastmod>2025-05-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://youdao-travel.com/guide-exam.html</loc>
    <lastmod>2025-05-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://youdao-travel.com/free-materials.html</loc>
    <lastmod>2025-05-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://youdao-travel.com/pricing.html</loc>
    <lastmod>2025-05-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
"""
    with open(f"{BASE_PATH}/sitemap.xml", "w", encoding="utf-8") as f:
        f.write(sitemap_content)
    print("✓ sitemap.xml 创建完成")
    
    # favicon.ico (使用SVG格式的data URI)
    favicon_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="#f97316"/>
  <text x="50" y="65" font-size="50" text-anchor="middle" fill="white">📚</text>
</svg>
"""
    with open(f"{BASE_PATH}/favicon.svg", "w", encoding="utf-8") as f:
        f.write(favicon_content)
    print("✓ favicon.svg 创建完成")

def add_favicon_to_pages():
    """在所有页面添加favicon链接"""
    print("添加favicon链接...")
    
    pages = ['index.html', 'pricing.html', 'ai-assistant.html', 'free-materials.html', 'guide-exam.html']
    
    for page in pages:
        filepath = f"{BASE_PATH}/{page}"
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            # 添加favicon链接
            favicon_link = '<link rel="icon" type="image/svg+xml" href="favicon.svg">'
            if 'favicon.svg' not in content and '<head>' in content:
                content = content.replace('<head>', f'<head>\n  {favicon_link}')
                
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"✓ {page} 添加favicon完成")
    
    # 添加favicon到所有HTML文件
    for filename in os.listdir(BASE_PATH):
        if filename.endswith('.html') and filename not in pages:
            filepath = f"{BASE_PATH}/{filename}"
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            if '<head>' in content and 'favicon' not in content:
                favicon_link = '<link rel="icon" type="image/svg+xml" href="favicon.svg">'
                content = content.replace('<head>', f'<head>\n  {favicon_link}')
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)

def main():
    """主函数"""
    print("=" * 50)
    print("开始修复 youdao-travel.com 网站")
    print("=" * 50)
    
    # 修复各页面
    fix_index_html()
    fix_pricing_html()
    fix_ai_assistant_html()
    fix_free_materials_html()
    fix_guide_exam_html()
    
    # 创建SEO文件
    create_seo_files()
    add_favicon_to_pages()
    
    print("=" * 50)
    print("网站修复完成！")
    print("=" * 50)

if __name__ == "__main__":
    main()
