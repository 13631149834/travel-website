-- ============================================
-- 游导旅游网站数据库表结构 SQL
-- ============================================
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 点击 "New query"
-- 4. 粘贴本文件全部内容
-- 5. 点击 "RUN" 执行
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
-- 执行完成确认
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ 数据库表结构创建完成！';
    RAISE NOTICE '📋 已创建表: profiles, guide_profiles, orders, reviews, learning_records, learning_stats, favorites';
    RAISE NOTICE '🔐 已配置 RLS 行级安全策略';
    RAISE NOTICE '⚡ 已创建索引和触发器';
END $$;
