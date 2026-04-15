# 分享功能 API 文档

## 概述
分享功能模块支持微信、微博、QQ、QQ空间和复制链接等多平台分享。

## 文件结构
```
travel-website/
├── js/
│   └── share.js          # 分享功能核心脚本
├── css/
│   └── share.css          # 分享功能样式
├── components/
│   └── share.html         # 分享按钮 HTML 组件
└── share-demo.html        # 功能演示页面
```

## 快速开始

### 1. 引入文件
```html
<link rel="stylesheet" href="css/share.css">
<script src="js/share.js"></script>
```

### 2. 在页面中添加分享容器
```html
<!-- 自动初始化 -->
<div class="share-container" data-type="guide" data-id="123"></div>
```

### 3. 分享类型说明
| 类型 | data-type 值 | 说明 |
|------|-------------|------|
| 导游分享 | `guide` | 导游详情页分享 |
| 目的地分享 | `destination` | 目的地页分享 |
| 线路分享 | `route` | 旅游线路分享 |
| 攻略分享 | `knowledge` | 攻略文章分享 |

---

## API 参考

### ShareModule.init(containerSelector, config)
初始化分享按钮

**参数：**
- `containerSelector` (string): CSS 选择器，如 `#share` 或 `.share-container`
- `config` (object): 配置对象
  - `url` (string): 分享链接
  - `title` (string): 分享标题
  - `description` (string): 分享描述
  - `image` (string): 分享图片 URL
  - `platforms` (array): 启用的平台，默认 `['wechat', 'weibo', 'qq', 'copy']`

**示例：**
```javascript
ShareModule.init('#share', {
  url: 'https://example.com/guide-detail.html?id=123',
  title: '金牌导游李明',
  description: '10年导游经验，精通多语言',
  image: 'https://example.com/images/guide-123.jpg',
  platforms: ['wechat', 'weibo', 'qq', 'copy']
});
```

---

### ShareModule.shareToWechat(data)
分享到微信（弹出二维码模态框）

**参数：**
- `data` (object): 分享数据
  - `url` (string): 分享链接

**示例：**
```javascript
ShareModule.shareToWechat({
  url: 'https://example.com/page'
});
```

---

### ShareModule.shareToWeibo(data)
分享到微博

**参数：**
- `data` (object): 分享数据
  - `url` (string): 分享链接
  - `title` (string): 分享标题
  - `image` (string): 分享图片

**示例：**
```javascript
ShareModule.shareToWeibo({
  url: location.href,
  title: document.title,
  image: 'https://example.com/og-image.jpg'
});
```

---

### ShareModule.shareToQQ(data)
分享到 QQ

**参数：**
- `data` (object): 分享数据
  - `url` (string): 分享链接
  - `title` (string): 分享标题
  - `description` (string): 分享描述

**示例：**
```javascript
ShareModule.shareToQQ({
  url: location.href,
  title: document.title,
  description: '页面描述'
});
```

---

### ShareModule.copyLink(data)
复制链接到剪贴板

**参数：**
- `data` (object): 分享数据
  - `url` (string): 分享链接

**示例：**
```javascript
ShareModule.copyLink({
  url: location.href
});
```

---

### ShareModule.generateShareData(type, item)
为详情页生成分享数据

**参数：**
- `type` (string): 分享类型 (`guide`, `destination`, `route`, `knowledge`)
- `item` (object): 分享内容数据
  - `id` (string/number): 内容 ID
  - `name` (string): 名称（可选）
  - `title` (string): 标题（可选）
  - `description` (string): 描述（可选）
  - `image` (string): 图片 URL（可选）

**示例：**
```javascript
const data = ShareModule.generateShareData('guide', {
  id: '123',
  name: '李明',
  bio: '金牌导游'
});
// 返回: { url, title, description, image }
```

---

### ShareModule.generateShareCard(data)
生成分享卡片预览 HTML

**参数：**
- `data` (object): 分享数据

**示例：**
```javascript
const html = ShareModule.generateShareCard({
  url: 'https://example.com',
  title: '标题',
  description: '描述',
  image: 'https://example.com/image.jpg'
});
document.getElementById('preview').innerHTML = html;
```

---

### ShareModule.createShareButtons(config)
生成分享按钮 HTML

**参数：**
- `config` (object): 同 `init` 的 config

**示例：**
```javascript
const html = ShareModule.createShareButtons({
  url: location.href,
  title: document.title,
  platforms: ['wechat', 'weibo', 'qq', 'copy']
});
document.getElementById('share').innerHTML = html;
```

---

### ShareModule.getStats()
获取分享统计数据

**返回值：**
```javascript
{
  wechat: 0,  // 微信扫码次数
  weibo: 0,   // 微博分享次数
  qq: 0,      // QQ分享次数
  copy: 0,    // 复制链接次数
  total: 0    // 总分享次数
}
```

---

## 分享统计
分享数据存储在浏览器的 `localStorage` 中，键名为 `travel_share_stats`。

**数据格式：**
```javascript
{
  wechat: 5,
  weibo: 3,
  qq: 2,
  copy: 10,
  total: 20
}
```

---

## 样式定制

### CSS 变量
```css
:root {
  --share-wechat-color: #07c160;
  --share-weibo-color: #e6162d;
  --share-qq-color: #1296db;
  --share-qzone-color: #f6c83a;
  --share-copy-color: #667eea;
}
```

### 按钮样式
```css
.share-buttons {
  display: flex;
  gap: 12px;
}

.share-btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
}
```

---

## 注意事项

1. **微信分享限制**：由于微信限制，需要用户手动长按识别二维码，无法直接唤起微信
2. **图片兼容性**：分享图片建议使用 HTTPS 链接，PNG 格式
3. **跨域限制**：部分分享平台可能不支持跨域分享，请确保网站已部署
4. **统计本地存储**：分享统计存储在浏览器本地，切换浏览器或清除缓存会重置

---

## 浏览器兼容性
- Chrome 40+
- Firefox 40+
- Safari 9+
- Edge 12+
- IE 11 (部分功能)

---

## 更新日志

### v1.0.0 (2024-04)
- 初始版本
- 支持微信、微博、QQ、复制链接分享
- 支持分享统计
- 支持分享卡片预览
