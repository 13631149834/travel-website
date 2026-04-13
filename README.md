# 游导伴旅 - 导游与游客的全平台

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/deploy-vercel-000000.svg" alt="Deploy">
</p>

> 一站式旅行知识平台，为导游和游客提供全方位的服务支持

**网站**: [youdao-travel.com](https://youdao-travel.com)  
**GitHub**: [travel-website](https://github.com/13631149834/travel-website)

---

## 📖 平台简介

### 什么是游导伴旅？

游导伴旅是一个专门为导游和游客打造的全方位旅行服务平台。我们致力于连接优秀的持证导游与有出行需求的游客，提供从行程规划、导游预约到旅行分享的一站式服务。

### 服务对象

- **导游群体**: 持证导游可以通过平台展示个人专业能力、接收预约、管理客户评价、提升收入
- **游客群体**: 计划出行的游客可以搜索心仪导游、获取签证攻略、规划旅行路线、学习避坑经验

### 核心功能

| 功能模块 | 说明 |
|---------|------|
| 导游搜索与预约 | 搜索认证导游，查看资质和评价，实现在线预约 |
| 导游工具箱 | 为导游提供知识库、应急预案、路线规划等实用工具 |
| 签证中心 | 全球热门国家签证攻略，一键查询所需材料 |
| 避坑指南 | 真实踩坑经历总结，帮助游客少走弯路 |
| 精品路线 | 精选主题路线推荐，满足不同旅行需求 |
| 旅行社区 | 旅行经验分享、故事投稿、世界奇趣推荐 |

---

## 🏗 技术架构

### 技术栈

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层                                 │
├─────────────────────────────────────────────────────────────┤
│  HTML5 + CSS3 + Vanilla JavaScript                          │
│  • 响应式设计，支持移动端/桌面端                              │
│  • 模块化 CSS 架构                                          │
│  • 无框架依赖，轻量高效                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        数据层                                 │
├─────────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL + Auth + Storage)                     │
│  • 用户认证系统                                             │
│  • 实时数据库                                               │
│  • 文件存储（头像、证书图片）                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        部署层                                 │
├─────────────────────────────────────────────────────────────┤
│  Vercel + GitHub Integration                                │
│  • 自动部署                                                 │
│  • 全球 CDN 加速                                            │
│  • 免费 HTTPS 证书                                          │
└─────────────────────────────────────────────────────────────┘
```

### 项目结构

```
travel-website/
├── index.html              # 首页
├── login.html              # 登录页
├── register.html           # 注册页
├── contact.html            # 联系我们
│
├── [游客端]
│   ├── guides.html         # 导游搜索列表
│   ├── guide-detail.html   # 导游详情页
│   ├── routes.html         # 精品路线
│   ├── trip-planner.html   # 行程规划
│   ├── my-orders.html      # 我的订单
│   ├── my-favorites.html   # 我的收藏
│   ├── my-reviews.html     # 我的评价
│   └── profile.html        # 个人中心
│
├── [导游端]
│   ├── guide-apply.html   # 导游申请入驻
│   ├── guide-tools.html    # 导游工具箱
│   ├── guide-stats.html    # 数据统计
│   ├── knowledge-base.html # 景点知识库
│   ├── schedule.html       # 团期管理
│   ├── route-planner.html  # 路线规划
│   └── finance.html        # 财务管理
│
├── [内容页]
│   ├── visa.html           # 签证中心
│   ├── pitfall.html        # 避坑指南
│   ├── tips.html           # 旅行经验
│   ├── stories.html        # 旅行故事
│   ├── wonders.html        # 世界奇趣
│   ├── learning.html       # 导游学习
│   ├── emergency.html      # 应急资源
│   └── faq.html            # 常见问题
│
├── [管理后台]
│   ├── admin.html          # 管理主面板
│   ├── admin-users.html    # 用户管理
│   ├── admin-guides.html   # 导游管理
│   └── admin-reviews.html  # 评价管理
│
├── css/
│   ├── style.css           # 全局样式
│   └── guide/              # 导游端样式
│
├── js/
│   ├── supabase-config.js  # Supabase 配置
│   ├── common.js           # 公共函数
│   ├── chatbot.js          # 智能客服
│   └── guide/              # 导游端脚本
│
└── images/                  # 图片资源
```

---

## ✨ 功能清单

### 🧳 游客端功能

| 功能 | 描述 | 页面 |
|------|------|------|
| 导游搜索 | 按城市、语言、评分筛选导游 | `guides.html` |
| 导游详情 | 查看导游资质、服务评价、联系方式 | `guide-detail.html` |
| 在线预约 | 选择导游服务时段，提交预约请求 | `guide-detail.html` |
| 行程规划 | 创建个人旅行计划，添加景点和日程 | `trip-planner.html` |
| 签证查询 | 查询各国签证要求，准备材料清单 | `visa.html` |
| 避坑指南 | 阅读真实踩坑经历，避免旅行陷阱 | `pitfall.html` |
| 路线推荐 | 浏览精选旅行路线，获取灵感 | `routes.html` |
| 我的订单 | 管理预约订单，查看历史记录 | `my-orders.html` |
| 我的收藏 | 收藏心仪导游和路线 | `my-favorites.html` |
| 评价服务 | 对导游服务进行评价打分 | `review-submit.html` |
| 个人中心 | 编辑个人信息，管理账号设置 | `profile.html` |

### 🎤 导游端功能

| 功能 | 描述 | 页面 |
|------|------|------|
| 入驻申请 | 提交导游资质，申请平台认证 | `guide-apply.html` |
| 个人主页 | 展示导游名片，支持分享推广 | `profile-preview.html` |
| 知识库 | 景点介绍、历史背景、解说词参考 | `knowledge-base.html` |
| 路线规划 | 创建和编辑旅行路线模板 | `route-planner.html` |
| 团期管理 | 设置可预约时间，管理日程 | `schedule.html` |
| 应急预案 | 查看急救电话、应急处理流程 | `emergency.html` |
| 财务管理 | 记录收入支出，统计月度报表 | `finance.html` |
| 数据统计 | 查看预约量、评分趋势、收入分析 | `guide-stats.html` |
| 评价管理 | 回复游客评价，查看反馈 | `my-reviews.html` |
| 学习中心 | 导游培训资料，专业技能提升 | `learning.html` |

### 🔧 管理后台功能

| 功能 | 描述 | 页面 |
|------|------|------|
| 数据概览 | 平台用户、导游、订单统计 | `admin.html` |
| 用户管理 | 查看/禁用/删除用户账号 | `admin-users.html` |
| 导游管理 | 审核导游资质，管理导游状态 | `admin-guides.html` |
| 评价管理 | 审核游客评价，处理投诉 | `admin-reviews.html` |

---

## 🚀 部署指南

### 方式一：Vercel 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/13631149834/travel-website)

1. 点击上方按钮，进入 Vercel 控制台
2. 点击 **Import Git Repository**，选择你的 GitHub 仓库
3. Vercel 会自动识别为 HTML 项目，点击 **Deploy** 即可
4. 部署完成后，你会获得一个 `.vercel.app` 域名

### 方式二：本地部署

```bash
# 1. 克隆项目
git clone https://github.com/13631149834/travel-website.git

# 2. 进入目录
cd travel-website

# 3. 本地预览（使用任意静态服务器）
npx serve .

# 或使用 Python
python -m http.server 8080
```

### 配置 Supabase

1. **创建 Supabase 项目**
   - 访问 [supabase.com](https://supabase.com) 注册并登录
   - 创建新项目，获取 **Project URL** 和 **anon public key**

2. **配置环境变量**
   
   在 Vercel 控制台的 **Settings > Environment Variables** 中添加：

   | 变量名 | 说明 |
   |--------|------|
   | `VITE_SUPABASE_URL` | 你的 Supabase 项目 URL |
   | `VITE_SUPABASE_ANON_KEY` | 你的 Supabase anon public key |

3. **更新代码配置**
   
   编辑 `js/supabase-config.js`：
   ```javascript
   const SUPABASE_URL = '你的项目URL';
   const SUPABASE_ANON_KEY = '你的anon key';
   ```

4. **创建数据库表**
   
   在 Supabase Dashboard 的 **SQL Editor** 中执行以下建表语句：

   ```sql
   -- 用户表
   create table users (
     id uuid references auth.users primary key,
     email text,
     nickname text,
     avatar_url text,
     role text default 'tourist', -- tourist/guide/admin
     created_at timestamp with time zone default now()
   );

   -- 导游表
   create table guides (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references users(id),
     name text,
     license_number text,
     license_level text, -- 初级/中级/高级/特级
     languages text[],
     cities text[],
     services text[], -- 跟团/定制/私家团
     intro text,
     rating decimal(2,1) default 0,
     review_count integer default 0,
     status text default 'pending', -- pending/approved/rejected
     created_at timestamp with time zone default now()
   );

   -- 订单表
   create table orders (
     id uuid primary key default gen_random_uuid(),
     tourist_id uuid references users(id),
     guide_id uuid references guides(id),
     date date,
     days integer,
     status text default 'pending',
     total_price decimal(10,2),
     created_at timestamp with time zone default now()
   );

   -- 评价表
   create table reviews (
     id uuid primary key default gen_random_uuid(),
     order_id uuid references orders(id),
     guide_id uuid references guides(id),
     tourist_name text,
     rating integer check (rating >= 1 and rating <= 5),
     service_rating integer,
     professional_rating integer,
     itinerary_rating integer,
     content text,
     created_at timestamp with time zone default now()
   );
   ```

5. **启用 Row Level Security (RLS)**
   
   ```sql
   -- 启用 RLS
   alter table users enable row level security;
   alter table guides enable row level security;
   alter table orders enable row level security;
   alter table reviews enable row level security;
   ```

---

## 📊 数据库结构

### users 用户表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 用户唯一标识 |
| email | text | 邮箱地址 |
| nickname | text | 昵称 |
| avatar_url | text | 头像URL |
| role | text | 角色：tourist/guide/admin |
| created_at | timestamp | 创建时间 |

### guides 导游表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 导游ID |
| user_id | uuid | 关联用户ID |
| name | text | 真实姓名 |
| license_number | text | 导游证号 |
| license_level | text | 导游等级 |
| languages | text[] | 服务语言 |
| cities | text[] | 服务城市 |
| services | text[] | 服务类型 |
| intro | text | 个人简介 |
| rating | decimal | 平均评分 |
| review_count | integer | 评价数量 |
| status | text | 审核状态 |
| created_at | timestamp | 入驻时间 |

### orders 订单表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 订单ID |
| tourist_id | uuid | 游客ID |
| guide_id | uuid | 导游ID |
| date | date | 预约日期 |
| days | integer | 天数 |
| status | text | 订单状态 |
| total_price | decimal | 总价 |
| created_at | timestamp | 下单时间 |

### reviews 评价表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 评价ID |
| order_id | uuid | 关联订单 |
| guide_id | uuid | 被评导游 |
| tourist_name | text | 游客昵称 |
| rating | integer | 综合评分(1-5) |
| service_rating | integer | 服务态度评分 |
| professional_rating | integer | 专业程度评分 |
| itinerary_rating | integer | 行程安排评分 |
| content | text | 评价内容 |
| created_at | timestamp | 评价时间 |

---

## 🛠 开发计划

### 已完成 ✅

- [x] 基础页面架构搭建
- [x] 用户注册登录系统
- [x] 导游搜索与详情展示
- [x] 导游申请入驻流程
- [x] 评价系统基础功能
- [x] 签证中心内容页
- [x] 避坑指南内容页
- [x] 导游工具箱基础功能
- [x] 管理后台基础框架
- [x] 响应式设计适配

### 待开发 🔨

#### 第三阶段
- [ ] 导游个人主页增强
  - 头像上传功能
  - 资质证书展示
  - 个人主页分享二维码
- [ ] 评价系统完善
  - 评分统计图表
  - 评价数据导出

#### 第四阶段
- [ ] 订单管理流程优化
- [ ] 在线支付集成
- [ ] 消息通知系统
- [ ] 行程规划工具增强

### 优化方向 📈

- **性能优化**: 首屏加载优化，图片懒加载
- **SEO优化**: 语义化HTML，Meta标签完善
- **体验优化**: 加载状态反馈，空状态设计
- **安全加固**: 输入验证，XSS防护

---

## 📞 联系方式

| 方式 | 信息 |
|------|------|
| 📧 邮箱 | 2173381363@qq.com |
| 💬 微信 | ximao101 |

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可。

---

<p align="center">
  <strong>🌍 游导伴旅 - 让旅行更简单</strong>
</p>
