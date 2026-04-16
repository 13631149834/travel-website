# 导游证备考网站 - 部署指南

## 📋 网站概述

极简导游证备考引流站，包含3个核心页面：
1. **index.html** - 首页（添加备考入口）
2. **guide-exam.html** - 备考服务落地页
3. **free-materials.html** - 免费资料领取页

---

## 📁 文件结构

```
├── index.html              # 首页
├── guide-exam.html         # 备考落地页
├── free-materials.html     # 资料领取页
├── css/
│   └── style.css          # 共享样式
├── js/
│   └── common.js          # 通用脚本
└── README.md              # 本文档
```

---

## 🚀 部署步骤

### 方式一：GitHub Pages 部署

1. **登录 GitHub**
   - 访问 https://github.com/13631149834/travel-website

2. **删除不需要的文件**
   - 进入仓库，删除除以下文件外的所有内容：
   ```
   保留:
   - index.html
   - guide-exam.html
   - free-materials.html
   - css/style.css
   - js/common.js
   - README.md
   
   删除（示例）:
   - guides.html
   - routes.html
   - visa.html
   - 所有以 _update/ 开头的目录
   - 所有其他 .html 文件
   ```

3. **上传新文件**
   - 将 `导游证备考/精简网站/` 目录下的所有文件上传到仓库根目录

4. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main"，文件夹选择 "/ (root)"
   - 点击 Save

5. **等待部署**
   - 几分钟后网站将上线：https://13631149834.github.io/travel-website/

---

### 方式二：Vercel 部署

1. **准备本地文件夹**
   ```bash
   cd 导游证备考/精简网站
   ```

2. **连接 Vercel**
   - 访问 https://vercel.com
   - 导入 GitHub 仓库
   - 选择仓库

3. **配置**
   - Framework Preset: Other
   - Root Directory: ./
   - 点击 Deploy

---

### 方式三：FTP/虚拟主机

1. **打包文件**
   ```bash
   cd 导游证备考/精简网站
   # 上传所有文件到网站根目录
   ```

2. **上传到 youdao-travel.com**
   - 使用 FTP 或文件管理器
   - 上传到 `/public_html/` 或 `/www/` 目录

---

## 🗑️ 需要删除的文件清单

### HTML 文件（删除以下所有）

| 文件 | 说明 |
|------|------|
| guides.html | 找导游 |
| routes.html | 精品路线 |
| visa.html | 签证中心 |
| pitfall.html | 避坑指南 |
| emergency.html | 应急资源 |
| faq.html | 常见问题 |
| stories.html | 旅行故事 |
| tips.html | 旅行经验 |
| wonders.html | 世界奇趣 |
| contact.html | 联系我们 |
| login.html | 登录 |
| register.html | 注册 |
| guide-tools.html | 导游工具 |
| guide-detail.html | 导游详情 |
| route-detail.html | 路线详情 |
| route-booking.html | 路线预订 |
| tourist-center.html | 旅游中心 |
| trip-planner.html | 行程规划 |
| guide-stats.html | 导游统计 |
| promotion.html | 推广 |
| my-*.html | 用户中心相关 |
| user-center.html | 用户中心 |
| about.html | 关于我们 |
| about-*.html | 关于页面 |
| admin-*.html | 管理后台 |
| analytics/ | 分析统计 |
| ar/ | AR功能 |
| audio/ | 音频功能 |
| audio-guide/ | 导览音频 |
| bot/ | 机器人 |
| capsule/ | 胶囊内容 |
| careers/ | 招聘 |
| checkin/ | 签到 |
| components/ | 组件 |
| css/ (除style.css外) | 其他样式 |
| destinations/ | 目的地 |
| festival*/ | 节日活动 |
| food/ | 美食 |
| games/ | 游戏 |
| growth/ | 成长系统 |
| health/ | 健康 |
| images/ | 图片 |
| js/ (除common.js外) | 其他脚本 |
| legal/ | 法律 |
| magazine/ | 杂志 |
| map/ | 地图 |
| member/ | 会员 |
| news/ | 新闻 |
| partners/ | 合作伙伴 |
| payment/ | 支付 |
| photos/ | 图片库 |
| points/ | 积分 |
| postcard/ | 明信片 |
| recommend/ | 推荐 |
| seo/ | SEO |
| services/ | 服务 |
| share/ | 分享 |
| shopping/ | 购物 |
| social/ | 社交 |
| special/ | 专题 |
| support/ | 支持 |
| templates/ | 模板 |
| videos-library/ | 视频库 |
| visa/ | 签证 |
| wallpapers/ | 壁纸 |
| weather/ | 天气 |
| wishlist/ | 愿望清单 |
| 其他页面.html | 所有其他页面 |

### 目录（删除以下所有）

```
_update/
all_update/
fix_package/
full_update/
name_fix/
name_fix2/
stage6/
stage7/
其他非核心目录...
```

---

## ✅ 保留的文件

| 文件/目录 | 说明 |
|----------|------|
| `index.html` | 首页（已改造） |
| `guide-exam.html` | 备考落地页（新增） |
| `free-materials.html` | 资料领取页（新增） |
| `css/style.css` | 共享样式 |
| `js/common.js` | 通用脚本 |
| `README.md` | 说明文档 |
| `robots.txt` | SEO |
| `sitemap.xml` | 网站地图 |

---

## 🔧 自定义配置

### 修改联系方式

在三个页面中搜索 `ximao101`，替换为你的微信号：
```bash
# 批量替换
sed -i 's/ximao101/你的微信号/g' *.html
```

### 修改邮箱

搜索 `2173381363@qq.com`，替换为你的邮箱。

### 修改统计数字

在 `guide-exam.html` 中修改：
- 学员通过率 (98%)
- 服务学员数 (500+)
- 从业年限 (8年+)

---

## 📱 移动端适配

页面已内置响应式设计：
- 导航栏自动适配移动端
- 卡片网格自动换行
- 按钮大小触控友好
- 微信ID突出显示

---

## 🔗 页面跳转逻辑

```
首页 (index.html)
    ├── 导航栏 → 导游证备考
    ├── 横幅入口 → guide-exam.html
    └── 入口卡片 → guide-exam.html

备考落地页 (guide-exam.html)
    ├── 立即咨询 → 底部微信
    ├── 免费领取资料 → free-materials.html
    └── 悬浮CTA → 底部微信

资料领取页 (free-materials.html)
    ├── 表单提交 → 弹窗提示加微信
    └── 微信直领 → 突出显示微信号
```

---

## 💡 运营建议

### 1. 微信公众号引流
- 在公众号菜单添加"备考资料"入口
- 自动回复引导访问网站

### 2. 小红书/抖音推广
- 笔记/视频中添加网站链接
- 强调"免费资料包"吸引点击

### 3. 朋友圈广告
- 直接展示微信号 ximao101
- 引导复制添加

### 4. SEO优化
- 提交 sitemap.xml 到搜索站长
- 定期更新网站内容

---

## 📞 联系方式

- 微信号：ximao101
- 邮箱：2173381363@qq.com
- 网站：https://youdao-travel.com

---

*最后更新：2024年*
