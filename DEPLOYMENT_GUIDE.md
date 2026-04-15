# 旅游网站 - 部署说明

## 🚀 快速部署

### 方式一：静态托管 (最简单)

将整个项目目录上传到静态托管服务即可。

#### GitHub Pages
```bash
# 1. 创建仓库
# 2. 上传所有文件
# 3. 访问 https://yourusername.github.io/repo-name/
```

#### Vercel / Netlify
```bash
# Vercel: vercel --prod
# Netlify: netlify deploy --prod
```

#### Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/travel-website;
    index index.html;
    
    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(css|js|images|fonts)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

### 方式二：Supabase后端配置

#### 1. 创建Supabase项目
1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 获取项目URL和anon key

#### 2. 配置数据库
```sql
-- 在Supabase SQL Editor中执行
supabase-schema.sql
```

#### 3. 更新配置文件
编辑 `js/supabase-config.js`:
```javascript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

---

## 📱 PWA部署

### Service Worker配置
`service-worker.js` 已配置好离线缓存功能。

确保在HTTPS环境下部署（或localhost）。

---

## ⚡ 性能优化

### 已启用优化
- ✅ CSS/JS 代码压缩
- ✅ 图片懒加载
- ✅ Service Worker缓存
- ✅ Gzip压缩
- ✅ 移动端适配

### CDN建议
建议将以下资源使用CDN加速：
- `images/` 目录
- `css/` 目录
- `js/` 目录

---

## 🔒 安全配置

### HTTPS (必需)
生产环境必须启用HTTPS。

### CSP配置
在服务器响应头添加：
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

---

## 🛠 常用命令

### 本地开发
```bash
# 使用Python服务器
python -m http.server 8080

# 使用Node.js
npx serve
```

### 批量优化
```bash
# 优化所有页面
./optimize-pages.sh

# 或使用Python
python optimize_batch.py
```

### 自动化更新
```bash
# 更新所有页面的页脚
./update-scripts.sh
```

---

## 📁 目录结构

```
travel-website/
├── index.html          # 首页
├── css/                # 样式文件
├── js/                 # JavaScript
├── images/             # 图片资源
├── components/          # 可复用组件
├── data/               # JSON数据
├── 推广资料/            # 推广文档
└── *.html              # 各功能页面
```

---

## ❓ 常见问题

### Q: 页面打不开？
检查是否缺少 `index.html` 同级目录下的 `css/` 和 `js/` 文件。

### Q: 图片不显示？
确认 `images/` 目录与HTML文件在同一路径下。

### Q: Service Worker不工作？
确保使用HTTPS或localhost访问。

### Q: 需要后端吗？
不需要，可作为纯静态网站使用。Supabase为可选扩展。

---

## 📞 技术支持

如有问题，请查看：
- `README.md` - 项目说明
- `SUPABASE_GUIDE.md` - Supabase配置指南
- `SEO_REPORT.md` - SEO优化报告
- `PERFORMANCE_OPTIMIZATION_REPORT.md` - 性能优化报告

---

**版本**: v2.0 Final  
**更新日期**: 2025-04-15
