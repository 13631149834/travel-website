# 游导旅游网站 Supabase 数据库接入指南

## 📋 目录
1. [Supabase 注册与项目创建](#第一步-supabase-注册与项目创建)
2. [数据库表结构创建](#第二步-数据库表结构创建)
3. [获取 API 密钥](#第三步-获取-api-密钥)
4. [配置网站代码](#第四步-配置网站代码)
5. [验证与测试](#第五步-验证与测试)

---

## 第一步：Supabase 注册与项目创建

### 1.1 访问 Supabase 官网

打开浏览器，访问 [https://supabase.com](https://supabase.com)

![Supabase官网](https://s.coze.cn/image/img/20250415/supabase_home.png)

### 1.2 注册账号

1. 点击右上角的 **"Sign up"** 按钮

2. 您可以使用以下方式注册：
   - **GitHub 账号**（推荐，快速方便）
   - **Google 账号**
   - **邮箱注册**（需要验证邮箱）

![注册方式](https://s.coze.cn/image/img/20250415/supabase_signup.png)

#### 使用 GitHub 注册（推荐）：
1. 点击 "Continue with GitHub"
2. 在弹出窗口中授权 Supabase 访问您的 GitHub 账号
3. 完成 GitHub 的授权流程

#### 使用邮箱注册：
1. 输入您的邮箱地址
2. 设置密码（至少6位字符）
3. 点击 "Sign up"
4. 登录邮箱，点击验证链接

### 1.3 创建新项目

注册并登录后，您会看到 Supabase 控制台 Dashboard：

1. 点击 **"New Project"** 按钮（通常在右上角或 Projects 区域）

![新建项目](https://s.coze.cn/image/img/20250415/supabase_new_project.png)

### 1.4 填写项目信息

在创建项目页面，填写以下信息：

| 字段 | 说明 | 示例 |
|------|------|------|
| **Organization** | 选择所属组织 | 选择您的个人账号或创建新组织 |
| **Name** | 项目名称 | `youdau-travel` 或 `游导旅游` |
| **Database Password** | 数据库密码 | 建议使用强密码，**务必记录保存** |
| **Region** | 服务器区域 | 选择离您用户最近的区域：`Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)` |

⚠️ **重要提示**：
- 数据库密码**必须记录保存**，后续配置需要用到
- 建议勾选 "Generate a strong password" 自动生成

![填写项目信息](https://s.coze.cn/image/img/20250415/supabase_project_info.png)

### 1.5 等待项目创建

点击 "Create new project" 后，Supabase 会自动创建您的项目。这个过程通常需要 **1-3 分钟**。

创建完成后，您会看到项目的 Dashboard 界面。

![项目创建中](https://s.coze.cn/image/img/20250415/supabase_creating.png)

---

## 第二步：数据库表结构创建

项目创建完成后，您需要创建数据表。请按照以下步骤操作：

### 2.1 进入 SQL Editor

1. 在左侧菜单中，点击 **"SQL Editor"**（数据库图标）

![SQL Editor](https://s.coze.cn/image/img/20250415/supabase_sql_editor.png)

### 2.2 创建表结构

1. 点击 **"New query"** 按钮创建新查询

2. 将以下 SQL 代码**完整复制**粘贴到编辑器中：

```sql
-- ============================================
-- 游导旅游网站数据库表结构
-- 执行时间：预计 30 秒
-- ============================================

-- 启用 UUID 扩展（如果尚未启用）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------
-- 1. 用户扩展信息表 (profiles)
-- 存储用户的基本信息（与 Supabase Auth 配合使用）
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    nickname TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    wechat TEXT DEFAULT '',
    user_type TEXT DEFAULT 'tourist' CHECK (user_type IN ('tourist', 'guide', 'admin')),
    is_guide_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS (行级安全策略)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- -----------------------------------------
-- 2. 导游资料表 (guide_profiles)
-- 存储导游的详细信息
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS public.guide_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    nickname TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    intro TEXT DEFAULT '',
    years INTEGER DEFAULT 0,
    languages TEXT[] DEFAULT '{}',
    license_number TEXT DEFAULT '',
    license_level TEXT DEFAULT '初级',
    license_image TEXT DEFAULT '',
    expertise TEXT[] DEFAULT '{}',
    routes TEXT[] DEFAULT '{}',
    cities TEXT[] DEFAULT '{}',
    service_types TEXT[] DEFAULT '{}',
    phone TEXT DEFAULT '',
    wechat TEXT DEFAULT '',
    email TEXT DEFAULT '',
    hourly_rate DECIMAL(10, 2) DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.guide_profiles ENABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_guide_profiles_user_id ON public.guide_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_guide_profiles_rating ON public.guide_profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_guide_profiles_cities ON public.guide_profiles USING GIN(cities);

-- -----------------------------------------
-- 3. 订单表 (orders)
-- 存储游客的导游预约订单
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    tourist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guide_id UUID REFERENCES public.guide_profiles(user_id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    service_type TEXT DEFAULT 'guide',
    city TEXT DEFAULT '',
    route TEXT DEFAULT '',
    travel_date DATE,
    travel_time TIME,
    duration INTEGER DEFAULT 4,
    adults INTEGER DEFAULT 1,
    children INTEGER DEFAULT 0,
    total_price DECIMAL(10, 2) DEFAULT 0,
    contact_name TEXT DEFAULT '',
    contact_phone TEXT DEFAULT '',
    contact_wechat TEXT DEFAULT '',
    special_requests TEXT DEFAULT '',
    tourist_notes TEXT DEFAULT '',
    guide_notes TEXT DEFAULT '',
    cancellation_reason TEXT DEFAULT '',
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_orders_tourist_id ON public.orders(tourist_id);
CREATE INDEX IF NOT EXISTS idx_orders_guide_id ON public.orders(guide_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_travel_date ON public.orders(travel_date);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- -----------------------------------------
-- 4. 评价表 (reviews)
-- 存储游客对导游的评价
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    guide_id UUID REFERENCES public.guide_profiles(user_id) ON DELETE CASCADE,
    tourist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating DECIMAL(3, 2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    service_score DECIMAL(3, 2) DEFAULT 5,
    professional_score DECIMAL(3, 2) DEFAULT 5,
    itinerary_score DECIMAL(3, 2) DEFAULT 5,
    content TEXT DEFAULT '',
    guide_reply TEXT DEFAULT '',
    replied_at TIMESTAMP WITH TIME ZONE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_reviews_guide_id ON public.reviews(guide_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- -----------------------------------------
-- 5. 学习记录表 (learning_records)
-- 存储导游的学习答题记录
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    question_type TEXT DEFAULT 'choice',
    user_answer TEXT,
    correct_answer TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    points_earned INTEGER DEFAULT 0,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.learning_records ENABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_learning_records_user_id ON public.learning_records(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_answered_at ON public.learning_records(answered_at DESC);

-- -----------------------------------------
-- 6. 学习统计表 (learning_stats)
-- 存储用户的累计学习统计数据
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    total_answered INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    learning_days INTEGER DEFAULT 0,
    last_study_date DATE,
    unlocked_badges TEXT[] DEFAULT '{}',
    exam_history JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.learning_stats ENABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_learning_stats_user_id ON public.learning_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_stats_points ON public.learning_stats(total_points DESC);

-- -----------------------------------------
-- 7. 收藏表 (favorites)
-- 存储用户收藏的导游
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    guide_id UUID REFERENCES public.guide_profiles(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, guide_id)
);

-- 启用 RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_guide_id ON public.favorites(guide_id);

-- ============================================
-- RLS 策略定义
-- ============================================

-- profiles 表策略
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- guide_profiles 表策略
CREATE POLICY "Anyone can view active guide profiles" ON public.guide_profiles
    FOR SELECT USING (is_active = true OR auth.uid() = user_id);

CREATE POLICY "Guides can update own profile" ON public.guide_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Guides can insert own profile" ON public.guide_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- orders 表策略
CREATE POLICY "Tourists can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = tourist_id);

CREATE POLICY "Guides can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = guide_id);

CREATE POLICY "Tourists can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = tourist_id);

CREATE POLICY "Tourists can update own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = tourist_id AND status = 'pending');

CREATE POLICY "Guides can update assigned orders" ON public.orders
    FOR UPDATE USING (auth.uid() = guide_id);

-- reviews 表策略
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Tourists can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = tourist_id);

CREATE POLICY "Guides can reply to reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = guide_id);

-- learning_records 表策略
CREATE POLICY "Users can view own learning records" ON public.learning_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning records" ON public.learning_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- learning_stats 表策略
CREATE POLICY "Users can view own learning stats" ON public.learning_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own learning stats" ON public.learning_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning stats" ON public.learning_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- favorites 表策略
CREATE POLICY "Users can manage own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guide_profiles_updated_at BEFORE UPDATE ON public.guide_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_stats_updated_at BEFORE UPDATE ON public.learning_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 触发器：自动创建 profiles
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nickname)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 当新用户注册时自动创建 profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 存储过程：生成订单号
-- ============================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_order_number TEXT;
    sequence_num INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO sequence_num FROM public.orders;
    new_order_number := 'YD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(sequence_num::TEXT, 6, '0');
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 存储过程：更新导游评分
-- ============================================

CREATE OR REPLACE FUNCTION update_guide_rating()
RETURNS TRIGGER AS $$
DECLARE
    guide_user_id UUID;
    avg_rating DECIMAL(3, 2);
    total_reviews INTEGER;
BEGIN
    IF TG_TABLE_NAME = 'reviews' THEN
        guide_user_id := NEW.guide_id;
    ELSE
        RETURN NEW;
    END IF;
    
    SELECT AVG(rating), COUNT(*) INTO avg_rating, total_reviews
    FROM public.reviews
    WHERE guide_id = guide_user_id;
    
    UPDATE public.guide_profiles
    SET rating = COALESCE(avg_rating, 0),
        total_reviews = total_reviews
    WHERE user_id = guide_user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_guide_rating_trigger
    AFTER INSERT OR UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_guide_rating();

-- ============================================
-- 完成提示
-- ============================================

-- 添加一条注释来确认执行成功
DO $$
BEGIN
    RAISE NOTICE '✅ 数据库表结构创建完成！';
END $$;
```

### 2.3 执行 SQL

1. 确认 SQL 代码已完整粘贴
2. 点击 **"RUN"** 按钮（或使用快捷键 Ctrl+Enter）

![执行SQL](https://s.coze.cn/image/img/20250415/supabase_run_sql.png)

### 2.4 验证表创建成功

1. 在左侧菜单点击 **"Table Editor"**
2. 您应该能看到以下数据表：
   - `profiles`（用户扩展信息）
   - `guide_profiles`（导游资料）
   - `orders`（订单）
   - `reviews`（评价）
   - `learning_records`（学习记录）
   - `learning_stats`（学习统计）
   - `favorites`（收藏）

![验证表创建](https://s.coze.cn/image/img/20250415/supabase_tables.png)

---

## 第三步：获取 API 密钥

### 3.1 进入项目设置

1. 点击左侧菜单底部的 **"Settings"**（齿轮图标）

2. 在设置菜单中选择 **"API"**

![API设置](https://s.coze.cn/image/img/20250415/supabase_settings.png)

### 3.2 复制密钥

在 API 设置页面，您会看到两个重要的密钥：

| 密钥名称 | 用途 | 可见性 |
|---------|------|--------|
| **Project URL** | 项目访问地址 | 公开（可在前端使用）|
| **anon public** | 前端 API 密钥 | 公开（可在前端使用）|
| **service_role** | 后端 API 密钥 | **私密**（仅后端使用）|

1. 复制 **Project URL**
2. 复制 **anon public** 密钥

⚠️ **重要提示**：
- `anon public` 密钥是**公开**的，可以安全地在前端代码中使用
- 请勿泄露 `service_role` 密钥！

![复制密钥](https://s.coze.cn/image/img/20250415/supabase_api_keys.png)

---

## 第四步：配置网站代码

### 4.1 更新配置文件

找到项目中的 `js/supabase-config.js` 文件，将以下内容替换为您自己的配置：

```javascript
// ============================================
// Supabase 配置 - 请替换为您自己的值
// ============================================

// 👇 在这里填入您的 Project URL（从 Supabase Dashboard -> Settings -> API 获取）
const SUPABASE_URL = 'https://[您的项目ID].supabase.co';

// 👇 在这里填入您的 anon public 密钥
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';


// ============================================
// 以下代码不需要修改
// ============================================
```

### 4.2 找到您的配置值

在 Supabase Dashboard -> Settings -> API 页面：

```
Project URL:  https://xxxxx.supabase.co
anon key:     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 第五步：验证与测试

### 5.1 测试注册功能

1. 打开网站的注册页面
2. 填写邮箱和密码
3. 点击注册按钮
4. 检查 Supabase Dashboard -> Authentication -> Users，应该能看到新用户

### 5.2 测试登录功能

1. 使用刚注册的账号登录
2. 应该能成功登录并跳转到首页

### 5.3 验证数据库连接

1. 登录后，在 Supabase Dashboard -> Table Editor
2. 打开 `profiles` 表
3. 应该能看到新注册用户的 profile 信息

---

## 📊 表结构说明

### 核心表关系图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   profiles  │────<│guide_profiles│     │   orders    │
│   (用户)    │     │   (导游)    │     │   (订单)    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│learning_stats│    │   reviews   │     │  favorites  │
│  (学习统计) │     │   (评价)    │     │   (收藏)    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 表字段说明

#### profiles（用户表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，关联 auth.users |
| email | TEXT | 用户邮箱 |
| nickname | TEXT | 昵称 |
| avatar_url | TEXT | 头像 URL |
| user_type | TEXT | 用户类型：tourist/guide/admin |
| is_guide_verified | BOOLEAN | 导游是否认证 |

#### guide_profiles（导游资料表）
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | UUID | 关联 profiles |
| name | TEXT | 真实姓名 |
| languages | TEXT[] | 擅长语言 |
| cities | TEXT[] | 服务城市 |
| rating | DECIMAL | 评分 |
| hourly_rate | DECIMAL | 时薪 |

#### orders（订单表）
| 字段 | 类型 | 说明 |
|------|------|------|
| order_number | TEXT | 订单号 |
| tourist_id | UUID | 游客 ID |
| guide_id | UUID | 导游 ID |
| status | TEXT | 订单状态 |
| travel_date | DATE | 旅行日期 |
| total_price | DECIMAL | 总价 |

#### reviews（评价表）
| 字段 | 类型 | 说明 |
|------|------|------|
| guide_id | UUID | 被评价的导游 |
| rating | DECIMAL | 综合评分 |
| service_score | DECIMAL | 服务评分 |
| content | TEXT | 评价内容 |

---

## ❓ 常见问题

### Q1: 忘记了数据库密码怎么办？
A: 在 Supabase Dashboard -> Settings -> Database，可以重置数据库密码。

### Q2: 免费套餐的限制是什么？
A: Supabase 免费套餐包括：
- 500MB 数据库空间
- 每月 2GB 传输量
- 每月 50,000 月活跃用户
- 适合个人项目或小型网站

### Q3: 如何导出数据库？
A: 在 Table Editor 中，点击表名旁边的三点菜单，选择 Export -> CSV。

### Q4: 遇到 RLS 权限错误怎么办？
A: 检查您的 RLS 策略是否正确配置。可以暂时禁用 RLS 进行测试：
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### Q5: 如何备份数据？
A: Supabase 提供自动每日备份。可以在 Settings -> Database -> Backups 查看。

---

## 📞 获取帮助

如果遇到问题，您可以：
1. 查看 [Supabase 官方文档](https://supabase.com/docs)
2. 查看 [Supabase Discord 社区](https://discord.gg/supabase)
3. 提交 GitHub Issue 到项目仓库

---

**祝您配置顺利！🎉**
