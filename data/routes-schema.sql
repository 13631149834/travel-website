-- =====================================================
-- 游导伴旅平台 - 路线模块数据库Schema
-- =====================================================

-- 路线主表
CREATE TABLE IF NOT EXISTS routes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '路线标题',
    subtitle VARCHAR(300) COMMENT '路线副标题/简介',
    destination VARCHAR(100) NOT NULL COMMENT '目的地名称（如：澳大利亚、新西兰）',
    country VARCHAR(100) NOT NULL COMMENT '所属国家',
    region VARCHAR(50) NOT NULL COMMENT '区域分类：oceania-澳新, western_europe-西欧, spain-西班牙, egypt-埃及, other-其他',
    days INTEGER NOT NULL COMMENT '行程天数',
    nights INTEGER GENERATED ALWAYS AS (days - 1) STORED COMMENT '住宿夜数',
    price DECIMAL(10,2) NOT NULL COMMENT '成人价格',
    price_child DECIMAL(10,2) COMMENT '儿童价格',
    price_note VARCHAR(200) COMMENT '价格说明（如：不含机票）',
    currency VARCHAR(10) DEFAULT 'CNY' COMMENT '货币类型',
    
    -- 亮点和特色
    highlights JSONB DEFAULT '[]' COMMENT '行程亮点数组',
    themes JSONB DEFAULT '[]' COMMENT '主题标签：摄影、美食、文化、自然、购物等',
    
    -- 行程安排
    itinerary JSONB DEFAULT '[]' COMMENT '详细行程，格式：[{"day": 1, "title": "Day 1", "city": "城市名", "summary": "概述", "meals": "含早餐", "activities": ["活动1", "活动2"], "hotel": "住宿酒店", "tips": "温馨提示"}]',
    
    -- 费用说明
    includes JSONB DEFAULT '[]' COMMENT '费用包含',
    excludes JSONB DEFAULT '[]' COMMENT '费用不含',
    
    -- 成团信息
    departure_dates JSONB DEFAULT '[]' COMMENT '可选出发日期数组，格式：[{"date": "2024-06-15", "status": "available", "places_left": 12}]',
    min_people INTEGER DEFAULT 1 COMMENT '最少成团人数',
    max_people INTEGER DEFAULT 30 COMMENT '最大收客人数',
    current_enrolled INTEGER DEFAULT 0 COMMENT '当前已报名人数',
    
    -- 导游信息
    guide_id BIGINT REFERENCES guides(id) ON DELETE SET NULL COMMENT '负责导游ID',
    has_guide BOOLEAN DEFAULT TRUE COMMENT '是否含导游服务',
    
    -- 图片
    cover_image VARCHAR(500) COMMENT '封面图片URL',
    gallery JSONB DEFAULT '[]' COMMENT '相册图片URL数组',
    
    -- 预订须知
    visa_info TEXT COMMENT '签证说明',
    insurance_info TEXT COMMENT '保险说明',
    cancellation_policy TEXT COMMENT '退改政策',
    tips TEXT COMMENT '其他提示',
    
    -- 状态和分类
    status VARCHAR(20) DEFAULT 'draft' COMMENT '状态：draft-草稿, published-已发布, suspended-已停售',
    is_featured BOOLEAN DEFAULT FALSE COMMENT '是否精选推荐',
    is_hot BOOLEAN DEFAULT FALSE COMMENT '是否热门',
    sort_order INTEGER DEFAULT 0 COMMENT '排序，数字越小越靠前',
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 路线预订表
CREATE TABLE IF NOT EXISTS route_bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单编号',
    
    -- 关联路线
    route_id BIGINT NOT NULL REFERENCES routes(id) ON DELETE RESTRICT,
    
    -- 预订人信息
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL COMMENT '预订用户ID（可为空为游客预订）',
    contact_name VARCHAR(50) NOT NULL COMMENT '联系人姓名',
    contact_phone VARCHAR(30) NOT NULL COMMENT '联系电话',
    contact_email VARCHAR(100) COMMENT '联系邮箱',
    wechat VARCHAR(50) COMMENT '微信号',
    
    -- 预订信息
    departure_date DATE NOT NULL COMMENT '出发日期',
    adults INTEGER DEFAULT 1 COMMENT '成人人数',
    children INTEGER DEFAULT 0 COMMENT '儿童人数',
    total_price DECIMAL(10,2) NOT NULL COMMENT '总价格',
    
    -- 特殊需求
    special_requirements TEXT COMMENT '特殊需求备注',
    dietary_requirements VARCHAR(100) COMMENT '饮食要求',
    
    -- 订单状态
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending-待确认, confirmed-已确认, paid-已付款, cancelled-已取消, completed-已完成',
    
    -- 支付信息
    payment_method VARCHAR(30) COMMENT '支付方式',
    payment_status VARCHAR(20) DEFAULT 'unpaid' COMMENT '支付状态：unpaid-未支付, paid-已支付, refunded-已退款',
    paid_at TIMESTAMP WITH TIME ZONE COMMENT '支付时间',
    
    -- 内部备注
    admin_notes TEXT COMMENT '管理员备注',
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP WITH TIME ZONE COMMENT '取消时间',
    cancel_reason TEXT COMMENT '取消原因'
);

-- 路线收藏表
CREATE TABLE IF NOT EXISTS route_favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    route_id BIGINT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, route_id)
);

-- 路线浏览记录表
CREATE TABLE IF NOT EXISTS route_views (
    id BIGSERIAL PRIMARY KEY,
    route_id BIGINT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    view_date DATE NOT NULL DEFAULT CURRENT_DATE,
    view_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(route_id, user_id, view_date)
);

-- =====================================================
-- 索引
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_routes_region ON routes(region);
CREATE INDEX IF NOT EXISTS idx_routes_destination ON routes(destination);
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_featured ON routes(is_featured);
CREATE INDEX IF NOT EXISTS idx_routes_days ON routes(days);
CREATE INDEX IF NOT EXISTS idx_routes_price ON routes(price);
CREATE INDEX IF NOT EXISTS idx_routes_guide ON routes(guide_id);
CREATE INDEX IF NOT EXISTS idx_routes_created ON routes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_route ON route_bookings(route_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON route_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON route_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON route_bookings(departure_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON route_bookings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON route_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_route ON route_favorites(route_id);

CREATE INDEX IF NOT EXISTS idx_views_route ON route_views(route_id);
CREATE INDEX IF NOT EXISTS idx_views_date ON route_views(view_date);

-- =====================================================
-- 行级安全策略 (RLS)
-- =====================================================

-- 路线表RLS
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Routes are viewable by everyone" ON routes
    FOR SELECT USING (status = 'published');

CREATE POLICY "Guides can insert their own routes" ON routes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM guides WHERE 
            guides.id = routes.guide_id AND 
            guides.user_id = auth.uid()
        )
    );

CREATE POLICY "Guides can update their own routes" ON routes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM guides WHERE 
            guides.id = routes.guide_id AND 
            guides.user_id = auth.uid()
        )
    );

-- 预订表RLS
ALTER TABLE route_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings" ON route_bookings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can create bookings" ON route_bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own bookings" ON route_bookings
    FOR UPDATE USING (user_id = auth.uid());

-- 收藏表RLS
ALTER TABLE route_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites" ON route_favorites
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- 触发器
-- =====================================================

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_routes_updated_at
    BEFORE UPDATE ON routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_bookings_updated_at
    BEFORE UPDATE ON route_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 更新路线浏览次数触发器
CREATE OR REPLACE FUNCTION increment_route_view()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO route_views (route_id, user_id, view_date)
    VALUES (NEW.route_id, NEW.user_id, CURRENT_DATE)
    ON CONFLICT (route_id, user_id, view_date)
    DO UPDATE SET view_count = route_views.view_count + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 示例数据
-- =====================================================

-- 插入示例路线
INSERT INTO routes (title, subtitle, destination, country, region, days, price, price_child, highlights, themes, itinerary, includes, excludes, departure_dates, min_people, max_people, cover_image, status, is_featured, visa_info, insurance_info, cancellation_policy, tips) VALUES
(
    '澳大利亚大堡礁深度9日游',
    '悉尼进凯恩斯出，一次玩遍澳东精华',
    '澳大利亚',
    '澳大利亚',
    'oceania',
    9,
    18999.00,
    15999.00,
    '["悉尼歌剧院入内参观", "大堡礁出海浮潜", "蓝山国家公园", "热带雨林缆车", "澳式BBQ体验"]'::jsonb,
    '["自然", "海岛", "美食"]'::jsonb,
    '[{"day": 1, "title": "Day 1", "city": "悉尼", "summary": "抵达悉尼，接机入住酒店", "meals": "-", "activities": ["机场接机", "酒店入住"], "tips": "建议提前3小时到达机场"}, {"day": 2, "title": "Day 2", "city": "悉尼", "summary": "悉尼市区经典游览", "meals": "含早餐、午餐", "activities": ["悉尼歌剧院", "海港大桥", "岩石区", "环形码头"], "tips": "歌剧院建议提前预约入内参观"}, {"day": 3, "title": "Day 3", "city": "悉尼-蓝山", "summary": "蓝山国家公园一日游", "meals": "含早餐、午餐", "activities": ["蓝山缆车", "回声角", "三姐妹峰"], "tips": "山区温差大，请携带外套"}, {"day": 4, "title": "Day 4", "city": "悉尼", "summary": "自由活动/推荐邦迪海滩", "meals": "含早餐", "activities": ["邦迪海滩", "悉尼塔"], "tips": "海滩紫外线强，注意防晒"}, {"day": 5, "title": "Day 5", "city": "悉尼-凯恩斯", "summary": "飞往凯恩斯，热带雨林探秘", "meals": "含早餐、午餐", "activities": ["库兰达雨林", "缆车观光"], "tips": "雨林蚊虫较多，建议带驱蚊水"}, {"day": 6, "title": "Day 6", "city": "凯恩斯", "summary": "大堡礁一日游", "meals": "含早餐、午餐", "activities": ["出海浮潜", "玻璃底船", "珊瑚礁观光"], "tips": "请自带泳衣和防晒霜"}, {"day": 7, "title": "Day 7", "city": "凯恩斯", "summary": "大堡礁深海体验", "meals": "含早餐、午餐", "activities": ["半潜水艇", "海底漫步", "直升机观光（自费）"], "tips": "直升机需提前预约"}, {"day": 8, "title": "Day 8", "city": "凯恩斯", "summary": "自由活动/推荐棕榈湾", "meals": "含早餐", "activities": ["棕榈湾", "夜市"], "tips": "凯恩斯夜市每周五开放"}, {"day": 9, "title": "Day 9", "city": "凯恩斯-返回", "summary": "退房送机，结束行程", "meals": "含早餐", "activities": ["酒店退房", "送机"], "tips": "建议提前2小时到达机场"}]'::jsonb,
    '["全程4-5星酒店住宿", "行程所列餐食", "空调旅游巴士", "中文导游服务", "景点首道门票", "澳洲境内机票"]'::jsonb,
    '["国际往返机票", "护照及签证费用", "单房差", "自费项目", "个人消费", "旅游保险"]'::jsonb,
    '[{"date": "2024-06-15", "status": "available", "places_left": 15}, {"date": "2024-07-01", "status": "available", "places_left": 20}, {"date": "2024-07-20", "status": "available", "places_left": 18}]'::jsonb,
    8,
    25,
    'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800',
    'published',
    true,
    '澳大利亚访客签证（600类别），需提供在职证明、银行流水、行程单等材料',
    '建议购买境外旅游保险，覆盖医疗、意外、行李延误等',
    '出发前30天以上取消：退还费用的80%；15-30天：退还50%；15天内：不予退款'
),

(
    '新西兰南北岛全景12日',
    '纯净中土世界，峡湾冰川雪山一次揽尽',
    '新西兰',
    '新西兰',
    'oceania',
    12,
    25800.00,
    21800.00,
    '["皇后镇缆车360°观景", "米尔福德峡湾游船", "弗朗茨约瑟夫冰川", "霍比特人村", "萤火虫洞"]'::jsonb,
    '["自然", "徒步", "摄影"]'::jsonb,
    '[{"day": 1, "title": "Day 1", "city": "奥克兰", "summary": "抵达奥克兰", "meals": "-", "activities": ["机场接机", "奥克兰市区观光"]}, {"day": 2, "title": "Day 2", "city": "奥克兰-罗托鲁阿", "summary": "前往地热之城", "meals": "含早餐、晚餐", "activities": ["霍比特人村", "毛利文化村"]}, {"day": 3, "title": "Day 3", "city": "罗托鲁阿-陶波湖", "summary": "湖光山色", "meals": "含早餐、午餐", "activities": ["陶波湖", "胡卡瀑布"]}]'::jsonb,
    '["全程4星酒店", "行程所列餐食", "中文导游", "行程门票", "内陆航班"]'::jsonb,
    '["国际机票", "签证", "个人消费", "小费"]'::jsonb,
    '[{"date": "2024-08-10", "status": "available", "places_left": 12}]'::jsonb,
    10,
    20,
    'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800',
    'published',
    true,
    '新西兰访客签证，需提供行程计划、住宿预订单、资金证明',
    '强烈建议购买旅游保险，新西兰医疗费用较高',
    '出发前45天以上取消退还90%；30-45天退还70%；30天内退还50%'
),

(
    '法意瑞三国12日经典游',
    '浪漫欧洲，从埃菲尔铁塔到阿尔卑斯山',
    '欧洲',
    '法国/意大利/瑞士',
    'western_europe',
    12,
    29800.00,
    25800.00,
    '["巴黎埃菲尔铁塔", "卢浮宫专业讲解", "瑞士金色山口列车", "意大利罗马斗兽场", "威尼斯贡多拉"]'::jsonb,
    '["文化", "购物", "美食"]'::jsonb,
    '[{"day": 1, "title": "Day 1", "city": "巴黎", "summary": "抵达巴黎", "meals": "-", "activities": ["接机入住", "自由活动"]}, {"day": 2, "title": "Day 2", "city": "巴黎", "summary": "巴黎市区游览", "meals": "含早餐、午餐", "activities": ["埃菲尔铁塔", "凯旋门", "香榭丽舍大道"]}, {"day": 3, "title": "Day 3", "city": "巴黎", "summary": "卢浮宫与凡尔赛", "meals": "含早餐、午餐", "activities": ["卢浮宫", "凡尔赛宫"]}]'::jsonb,
    '["3-4星酒店", "含早餐", "中文导游", "旅游巴士", "行程门票"]'::jsonb,
    '["机票", "签证", "午晚餐", "小费", "个人消费"]'::jsonb,
    '[{"date": "2024-09-15", "status": "available", "places_left": 18}, {"date": "2024-10-01", "status": "available", "places_left": 22}]'::jsonb,
    15,
    30,
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    'published',
    true,
    '申根签证（法国为主申请国），需提供行程单、机票酒店订单、保险',
    '必须购买申根保险，最低保额3万欧元',
    '出发前30天退80%；15-30天退50%；15天内不退'
),

(
    '西班牙全景10日深度游',
    '弗拉门戈与高迪，邂逅热情伊比利亚',
    '西班牙',
    '西班牙',
    'spain',
    10,
    22800.00,
    19800.00,
    '["圣家堂入内", "普拉多美术馆", "弗拉门戈表演", "阿尔罕布拉宫", "西班牙海鲜饭体验"]'::jsonb,
    '["文化", "美食", "建筑"]'::jsonb,
    '[{"day": 1, "title": "Day 1", "city": "巴塞罗那", "summary": "抵达巴塞罗那", "meals": "-", "activities": ["接机", "兰布拉大道漫步"]}, {"day": 2, "title": "Day 2", "city": "巴塞罗那", "summary": "高迪建筑之旅", "meals": "含早餐", "activities": ["圣家堂", "米拉之家", "巴特罗之家"]}]'::jsonb,
    '["4星酒店", "含早餐", "中文导游", "行程交通", "首道门票"]'::jsonb,
    '["机票", "签证", "午晚餐", "小费", "个人消费"]'::jsonb,
    '[{"date": "2024-07-20", "status": "available", "places_left": 16}]'::jsonb,
    10,
    25,
    'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    'published',
    true,
    '西班牙申根签证，需提供工作证明、银行流水、行程计划',
    '建议购买境外旅游保险',
    '出发前30天退80%；15-30天退50%；15天内不退'
),

(
    '埃及尼罗河10日探秘',
    '金字塔与神庙，穿越四千年的文明',
    '埃及',
    '埃及',
    'egypt',
    10,
    16800.00,
    14800.00,
    '["吉萨金字塔群", "狮身人面像", "埃及博物馆", "尼罗河游轮", "阿布辛贝勒神庙"]'::jsonb,
    '["历史", "文化", "考古"]'::jsonb,
    '[{"day": 1, "title": "Day 1", "city": "开罗", "summary": "抵达开罗", "meals": "-", "activities": ["接机入住"]}, {"day": 2, "title": "Day 2", "city": "开罗", "summary": "金字塔之旅", "meals": "含早餐、午餐", "activities": ["吉萨金字塔", "狮身人面像", "骑骆驼体验"]}]'::jsonb,
    '["5星酒店+游轮", "含全餐", "中文导游", "行程交通", "门票"]'::jsonb,
    '["机票", "签证", "小费", "个人消费"]'::jsonb,
    '[{"date": "2024-10-10", "status": "available", "places_left": 20}]'::jsonb,
    8,
    30,
    'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800',
    'published',
    true,
    '埃及落地签证（25美元），或提前申请贴纸签',
    '建议购买含沙漠项目的旅游保险',
    '出发前30天退80%；15-30天退50%；15天内不退'
);
