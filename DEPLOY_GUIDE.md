# 游导伴旅 - 部署指南

> 本指南详细说明如何将游导伴旅网站部署到 GitHub Pages 或 Vercel，并配置 Supabase 后端服务。

---

## 📋 目录

1. [环境要求](#环境要求)
2. [方式一：Vercel 部署](#方式一-vercel-部署)
3. [方式二：GitHub Pages 部署](#方式二-github-pages-部署)
4. [Supabase 后端配置](#supabase-后端配置)
5. [域名绑定](#域名绑定)
6. [环境变量配置](#环境变量配置)

---

## 环境要求

| 要求 | 说明 |
|------|------|
| Node.js | v16.0.0+ (可选，用于本地预览) |
| Git | v2.30+ |
| Supabase 账号 | 免费注册 https://supabase.com |
| GitHub 账号 | 用于代码托管和自动部署 |

---

## 方式一：Vercel 部署

Vercel 提供免费托管服务，支持自动 HTTPS 和全球 CDN。

### 步骤 1：Fork 项目

1. 访问 GitHub 仓库：https://github.com/13631149834/travel-website
2. 点击右上角 **Fork** 按钮，复制仓库到你的 GitHub 账号

### 步骤 2：创建 Vercel 项目

1. 访问 https://vercel.com/new
2. 点击 **Import Git Repository**
3. 选择你 Fork 的仓库 `your-username/travel-website`
4. Vercel 会自动检测为 HTML 项目

### 步骤 3：配置项目

在 **Configure Project** 页面设置：

| 配置项 | 值 |
|--------|-----|
| Framework Preset | `Other` |
| Root Directory | `./` |
| Build Command | 留空 |
| Output Directory | `./` |

### 步骤 4：设置环境变量

点击 **Environment Variables**，添加：

| Name | Value |
|------|-------|
| `SUPABASE_URL` | 你的 Supabase 项目地址 |
| `SUPABASE_ANON_KEY` | 你的 Supabase anon public key |

### 步骤 5：完成部署

1. 点击 **Deploy**
2. 等待构建完成（约 1-2 分钟）
3. 获取部署 URL：`https://your-project.vercel.app`

---

## 方式二：GitHub Pages 部署

GitHub Pages 提供免费静态网站托管。

### 步骤 1：准备仓库

1. 在 GitHub 上创建新仓库 `travel-website`
2. 克隆仓库到本地：
```bash
git clone https://github.com/your-username/travel-website.git
cd travel-website
```

### 步骤 2：上传代码

```bash
# 方法1：直接复制所有文件到仓库目录
cp -r /path/to/travel-website/* .

# 方法2：通过 git subtree 添加远程
git remote add upstream https://github.com/13631149834/travel-website.git
git fetch upstream
git merge upstream/main --allow-unrelated-histories
```

### 步骤 3：推送代码

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 步骤 4：启用 GitHub Pages

1. 进入仓库 **Settings** > **Pages**
2. **Source** 选择 `Deploy from a branch`
3. **Branch** 选择 `main`，文件夹选择 `/ (root)`
4. 点击 **Save**

### 步骤 5：等待部署

1-5 分钟后，网站将发布到：`https://your-username.github.io/travel-website`

---

## Supabase 后端配置

### 步骤 1：创建 Supabase 项目

1. 访问 https://supabase.com
2. 点击 **New Project**
3. 填写项目信息：
   - **Name**: `travel-website`
   - **Database Password**: 设置强密码（保存备用）
   - **Region**: 选择离你最近的区域

4. 等待项目创建完成（约 2 分钟）

### 步骤 2：获取 API 密钥

1. 进入项目 **Settings** > **API**
2. 复制以下信息：

| 字段 | 用途 |
|------|------|
| `Project URL` | 前端配置 `SUPABASE_URL` |
| `anon public` key | 前端配置 `SUPABASE_ANON_KEY` |

### 步骤 3：创建数据库表

1. 进入 **SQL Editor**
2. 复制 `supabase-schema.sql` 文件内容
3. 点击 **Run** 执行

### 步骤 4：验证表创建

执行以下 SQL 验证：

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

应看到以下表：
- `profiles`
- `guide_profiles`
- `orders`
- `reviews`
- `favorites`
- `learning_records`
- `learning_stats`

### 步骤 5：配置前端

编辑 `js/supabase-config.js` 文件：

```javascript
// 替换为你的实际值
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## 域名绑定

### Vercel 域名绑定

1. 进入 Vercel 项目 **Settings** > **Domains**
2. 输入你的域名 `yourdomain.com`
3. 按提示在域名 DNS 添加记录：
   - **A 记录**: `@` → `76.76.21.21`
   - **CNAME 记录**: `www` → `cname.vercel-dns.com`

### GitHub Pages 自定义域名

1. 进入仓库 **Settings** > **Pages**
2. 在 **Custom domain** 输入你的域名
3. 在域名 DNS 添加 CNAME 记录：
   - **CNAME**: `www` → `your-username.github.io`

---

## 环境变量配置

### 本地开发

创建 `.env` 文件：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Vercel 环境变量

在 Vercel 项目 **Settings** > **Environment Variables** 中添加：

| Name | Value | Environments |
|------|-------|--------------|
| SUPABASE_URL | `https://xxx.supabase.co` | Production, Development |
| SUPABASE_ANON_KEY | `eyJhbG...` | Production, Development |

---

## 常见部署问题

### Q: Vercel 部署失败

**A:** 检查以下几点：
1. 确认 GitHub 仓库为 public 或 Vercel 有权限访问
2. 检查 `vercel.json` 配置是否正确
3. 查看 Vercel 构建日志获取详细错误

### Q: Supabase 连接失败

**A:** 
1. 确认 URL 和 Key 格式正确
2. 检查 Supabase 项目状态是否为 Active
3. 确认 RLS 策略已正确配置

### Q: 图片资源 404

**A:** 
1. 检查 `images/` 目录是否存在
2. 确认 CSS/JS 中的图片路径是否正确
3. Vercel 部署需等待 CDN 刷新（通常 1-2 分钟）

---

## 部署检查清单

部署完成后，确认以下功能正常：

- [ ] 首页可正常访问
- [ ] 用户注册/登录功能正常
- [ ] 导游搜索和筛选正常
- [ ] 订单提交功能正常
- [ ] 管理后台可访问（需管理员账号）
- [ ] 移动端显示正常

---

## 技术支持

- 📖 详细配置指南：`SUPABASE_GUIDE.md`
- 🚀 快速开始：`QUICK_START.md`
- 💬 GitHub Issues：https://github.com/13631149834/travel-website/issues
- 📧 技术支持邮箱：support@youdao-travel.com
