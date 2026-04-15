/**
 * ============================================
 * Supabase 配置 - 游导旅游网站
 * ============================================
 * 
 * ⚠️ 使用前请先完成以下步骤：
 * 
 * 步骤1: 注册 Supabase 账号
 *    - 访问 https://supabase.com
 *    - 使用 GitHub 或邮箱注册
 * 
 * 步骤2: 创建项目
 *    - 点击 "New Project"
 *    - 填写项目名称和密码
 *    - 等待项目创建完成
 * 
 * 步骤3: 创建数据库表
 *    - 进入 SQL Editor
 *    - 执行 supabase-schema.sql 文件中的所有 SQL
 * 
 * 步骤4: 获取 API 密钥
 *    - 进入 Settings -> API
 *    - 复制 Project URL 和 anon public 密钥
 * 
 * 步骤5: 替换下方配置
 *    - 将 SUPABASE_URL 替换为您的 Project URL
 *    - 将 SUPABASE_ANON_KEY 替换为您的 anon public 密钥
 * 
 * ============================================
 */

// 👇 请替换为您自己的 Supabase Project URL
// 格式: https://[项目ID].supabase.co
const SUPABASE_URL = 'https://your-project-id.supabase.co';

// 👇 请替换为您自己的 Supabase anon public 密钥
// 格式: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
const SUPABASE_ANON_KEY = 'your-anon-public-key-here';

// ============================================
// 以下代码无需修改
// ============================================

// 初始化 Supabase 客户端（在CDN加载后执行）
let supabaseClient = null;

/**
 * 初始化 Supabase 客户端
 * @returns {boolean} 是否初始化成功
 */
function initSupabase() {
    if (window.supabase && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase 客户端初始化成功');
        return true;
    }
    console.error('❌ Supabase SDK 未正确加载');
    return false;
}

// ============================================
// 用户认证工具类
// ============================================
const Auth = {
    /**
     * 获取当前用户
     * @returns {Promise<Object|null>} 用户对象或null
     */
    async getUser() {
        if (!supabaseClient) initSupabase();
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user;
    },

    /**
     * 获取当前会话
     * @returns {Promise<Object|null>} 会话对象或null
     */
    async getSession() {
        if (!supabaseClient) initSupabase();
        const { data: { session } } = await supabaseClient.auth.getSession();
        return session;
    },

    /**
     * 邮箱注册
     * @param {string} email 邮箱
     * @param {string} password 密码
     * @param {string} nickname 昵称（可选）
     * @returns {Promise<Object>} 包含 data 和 error
     */
    async signUp(email, password, nickname = '') {
        if (!supabaseClient) initSupabase();
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nickname: nickname || email.split('@')[0]
                }
            }
        });
        return { data, error };
    },

    /**
     * 邮箱登录
     * @param {string} email 邮箱
     * @param {string} password 密码
     * @returns {Promise<Object>} 包含 data 和 error
     */
    async signIn(email, password) {
        if (!supabaseClient) initSupabase();
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    },

    /**
     * 登出
     * @returns {Promise<Object>} 包含 error
     */
    async signOut() {
        if (!supabaseClient) initSupabase();
        const { error } = await supabaseClient.auth.signOut();
        return { error };
    },

    /**
     * 监听认证状态变化
     * @param {Function} callback 状态变化时的回调函数
     * @returns {Object} 取消订阅函数
     */
    onAuthStateChange(callback) {
        if (!supabaseClient) initSupabase();
        return supabaseClient.auth.onAuthStateChange(callback);
    },

    /**
     * 检查是否登录
     * @returns {Promise<boolean>} 是否已登录
     */
    async isLoggedIn() {
        const session = await this.getSession();
        return !!session;
    },

    /**
     * 发送密码重置邮件
     * @param {string} email 邮箱
     * @returns {Promise<Object>} 包含 data 和 error
     */
    async resetPassword(email) {
        if (!supabaseClient) initSupabase();
        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`
        });
        return { data, error };
    },

    /**
     * 更新用户密码
     * @param {string} newPassword 新密码
     * @returns {Promise<Object>} 包含 data 和 error
     */
    async updatePassword(newPassword) {
        if (!supabaseClient) initSupabase();
        const { data, error } = await supabaseClient.auth.updateUser({
            password: newPassword
        });
        return { data, error };
    }
};

// ============================================
// 数据库操作工具类
// ============================================
const DB = {
    // -----------------------------------------
    // 用户扩展信息表 (profiles)
    // -----------------------------------------
    profiles: {
        /**
         * 获取用户资料
         * @param {string} userId 用户ID
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async get(userId) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            return { data, error };
        },

        /**
         * 获取当前用户资料
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async getCurrent() {
            const session = await Auth.getSession();
            if (!session) return { data: null, error: new Error('未登录') };
            return this.get(session.user.id);
        },

        /**
         * 创建用户资料
         * @param {Object} profile 用户资料
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async create(profile) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('profiles')
                .insert(profile)
                .select()
                .single();
            return { data, error };
        },

        /**
         * 更新用户资料
         * @param {string} userId 用户ID
         * @param {Object} updates 更新内容
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async update(userId, updates) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();
            return { data, error };
        },

        /**
         * 更新当前用户资料
         * @param {Object} updates 更新内容
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async updateCurrent(updates) {
            const session = await Auth.getSession();
            if (!session) return { data: null, error: new Error('未登录') };
            return this.update(session.user.id, updates);
        }
    },

    // -----------------------------------------
    // 导游资料表 (guide_profiles)
    // -----------------------------------------
    guideProfiles: {
        /**
         * 通过用户ID获取导游资料
         * @param {string} userId 用户ID
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async getByUserId(userId) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('guide_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();
            return { data, error };
        },

        /**
         * 获取导游资料列表
         * @param {Object} filters 筛选条件
         * @param {number} limit 限制数量
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async list(filters = {}, limit = 20) {
            if (!supabaseClient) initSupabase();
            let query = supabaseClient
                .from('guide_profiles')
                .select('*')
                .eq('is_active', true)
                .order('rating', { ascending: false })
                .limit(limit);

            if (filters.city) {
                query = query.contains('cities', [filters.city]);
            }
            if (filters.language) {
                query = query.contains('languages', [filters.language]);
            }

            const { data, error } = await query;
            return { data, error };
        },

        /**
         * 创建导游资料
         * @param {Object} profile 导游资料
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async create(profile) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('guide_profiles')
                .insert(profile)
                .select()
                .single();
            return { data, error };
        },

        /**
         * 更新导游资料
         * @param {string} userId 用户ID
         * @param {Object} updates 更新内容
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async update(userId, updates) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('guide_profiles')
                .update(updates)
                .eq('user_id', userId)
                .select()
                .single();
            return { data, error };
        },

        /**
         * 创建或更新导游资料
         * @param {string} userId 用户ID
         * @param {Object} profileData 导游资料
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async upsert(userId, profileData) {
            if (!supabaseClient) initSupabase();
            const existing = await this.getByUserId(userId);
            if (existing.data) {
                return this.update(userId, profileData);
            } else {
                return this.create({ user_id: userId, ...profileData });
            }
        }
    },

    // -----------------------------------------
    // 订单表 (orders)
    // -----------------------------------------
    orders: {
        /**
         * 获取订单列表
         * @param {string} userId 用户ID
         * @param {string} type 类型：tourist/guide
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async list(userId, type = 'tourist') {
            if (!supabaseClient) initSupabase();
            const field = type === 'tourist' ? 'tourist_id' : 'guide_id';
            const { data, error } = await supabaseClient
                .from('orders')
                .select('*')
                .eq(field, userId)
                .order('created_at', { ascending: false });
            return { data, error };
        },

        /**
         * 获取订单详情
         * @param {string} orderId 订单ID
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async get(orderId) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();
            return { data, error };
        },

        /**
         * 获取订单详情（通过订单号）
         * @param {string} orderNumber 订单号
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async getByNumber(orderNumber) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('orders')
                .select('*')
                .eq('order_number', orderNumber)
                .single();
            return { data, error };
        },

        /**
         * 创建订单
         * @param {Object} order 订单数据
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async create(order) {
            if (!supabaseClient) initSupabase();
            // 生成订单号
            const { data: countData } = await supabaseClient
                .from('orders')
                .select('id', { count: 'exact' });
            const orderNumber = 'YD' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + 
                               String(countData?.length || 0 + 1).padStart(6, '0');

            const { data, error } = await supabaseClient
                .from('orders')
                .insert({ ...order, order_number: orderNumber })
                .select()
                .single();
            return { data, error };
        },

        /**
         * 更新订单状态
         * @param {string} orderId 订单ID
         * @param {Object} updates 更新内容
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async update(orderId, updates) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('orders')
                .update(updates)
                .eq('id', orderId)
                .select()
                .single();
            return { data, error };
        },

        /**
         * 取消订单
         * @param {string} orderId 订单ID
         * @param {string} reason 取消原因
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async cancel(orderId, reason = '') {
            return this.update(orderId, {
                status: 'cancelled',
                cancellation_reason: reason,
                cancelled_at: new Date().toISOString()
            });
        },

        /**
         * 获取订单统计
         * @param {string} userId 用户ID
         * @param {string} type 类型：tourist/guide
         * @returns {Promise<Object>} 统计结果
         */
        async getStats(userId, type = 'tourist') {
            const { data, error } = await this.list(userId, type);
            if (error) return { data: null, error };

            const stats = {
                total: data.length,
                pending: data.filter(o => o.status === 'pending').length,
                confirmed: data.filter(o => o.status === 'confirmed').length,
                completed: data.filter(o => o.status === 'completed').length,
                cancelled: data.filter(o => o.status === 'cancelled').length,
                totalSpent: data.reduce((sum, o) => sum + (o.total_price || 0), 0)
            };
            return { data: stats, error: null };
        }
    },

    // -----------------------------------------
    // 评价表 (reviews)
    // -----------------------------------------
    reviews: {
        /**
         * 获取导游的评价列表
         * @param {string} guideId 导游ID（用户ID）
         * @param {number} limit 限制数量
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async getByGuideId(guideId, limit = 20) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('reviews')
                .select('*, profiles:nickname, avatar_url')
                .eq('guide_id', guideId)
                .order('created_at', { ascending: false })
                .limit(limit);
            return { data, error };
        },

        /**
         * 获取评价详情
         * @param {string} reviewId 评价ID
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async get(reviewId) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('reviews')
                .select('*')
                .eq('id', reviewId)
                .single();
            return { data, error };
        },

        /**
         * 创建评价
         * @param {Object} review 评价数据
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async create(review) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('reviews')
                .insert(review)
                .select()
                .single();
            return { data, error };
        },

        /**
         * 导游回复评价
         * @param {string} reviewId 评价ID
         * @param {string} reply 回复内容
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async reply(reviewId, reply) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('reviews')
                .update({ guide_reply: reply, replied_at: new Date().toISOString() })
                .eq('id', reviewId)
                .select()
                .single();
            return { data, error };
        },

        /**
         * 获取导游评分统计
         * @param {string} guideId 导游ID（用户ID）
         * @returns {Promise<Object>} 统计结果
         */
        async getStats(guideId) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('reviews')
                .select('rating, service_score, professional_score, itinerary_score')
                .eq('guide_id', guideId);
            
            if (error) return { data: null, error };
            
            const total = data.length;
            if (total === 0) {
                return { data: { total: 0, avg: 0, avgService: 0, avgProfessional: 0, avgItinerary: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }, error: null };
            }
            
            const avg = data.reduce((sum, r) => sum + r.rating, 0) / total;
            const avgService = data.reduce((sum, r) => sum + r.service_score, 0) / total;
            const avgProfessional = data.reduce((sum, r) => sum + r.professional_score, 0) / total;
            const avgItinerary = data.reduce((sum, r) => sum + r.itinerary_score, 0) / total;
            
            const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            data.forEach(r => {
                const score = Math.round(r.rating);
                if (distribution[score] !== undefined) distribution[score]++;
            });
            
            return { 
                data: { 
                    total, 
                    avg: avg.toFixed(1), 
                    avgService: avgService.toFixed(1), 
                    avgProfessional: avgProfessional.toFixed(1), 
                    avgItinerary: avgItinerary.toFixed(1), 
                    distribution 
                }, 
                error: null 
            };
        }
    },

    // -----------------------------------------
    // 学习记录表 (learning_records)
    // -----------------------------------------
    learningRecords: {
        /**
         * 获取用户学习记录
         * @param {string} userId 用户ID
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async list(userId) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('learning_records')
                .select('*')
                .eq('user_id', userId)
                .order('answered_at', { ascending: false });
            return { data, error };
        },

        /**
         * 创建学习记录
         * @param {Object} record 记录数据
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async create(record) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('learning_records')
                .insert(record)
                .select()
                .single();
            return { data, error };
        },

        /**
         * 获取学习统计
         * @param {string} userId 用户ID
         * @returns {Promise<Object>} 统计结果
         */
        async getStats(userId) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('learning_records')
                .select('is_correct')
                .eq('user_id', userId);
            
            if (error) return { data: null, error };
            
            const total = data.length;
            const correct = data.filter(r => r.is_correct).length;
            const accuracy = total > 0 ? (correct / total * 100).toFixed(1) : 0;
            
            return { data: { total, correct, accuracy }, error: null };
        }
    },

    // -----------------------------------------
    // 学习统计表 (learning_stats)
    // -----------------------------------------
    learningStats: {
        /**
         * 获取用户学习统计
         * @param {string} userId 用户ID
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async get(userId) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('learning_stats')
                .select('*')
                .eq('user_id', userId)
                .single();
            return { data, error };
        },

        /**
         * 创建或更新学习统计
         * @param {string} userId 用户ID
         * @param {Object} stats 统计数据
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async upsert(userId, stats) {
            if (!supabaseClient) initSupabase();
            const existing = await this.get(userId);
            
            if (existing.data) {
                const { data, error } = await supabaseClient
                    .from('learning_stats')
                    .update(stats)
                    .eq('user_id', userId)
                    .select()
                    .single();
                return { data, error };
            } else {
                const { data, error } = await supabaseClient
                    .from('learning_stats')
                    .insert({ user_id: userId, ...stats })
                    .select()
                    .single();
                return { data, error };
            }
        }
    },

    // -----------------------------------------
    // 收藏表 (favorites)
    // -----------------------------------------
    favorites: {
        /**
         * 获取用户收藏列表
         * @param {string} userId 用户ID
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async list(userId) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('favorites')
                .select('*, guide_profiles(*)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            return { data, error };
        },

        /**
         * 添加收藏
         * @param {string} userId 用户ID
         * @param {string} guideId 导游ID（用户ID）
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async add(userId, guideId) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('favorites')
                .insert({ user_id: userId, guide_id: guideId })
                .select()
                .single();
            return { data, error };
        },

        /**
         * 取消收藏
         * @param {string} userId 用户ID
         * @param {string} guideId 导游ID（用户ID）
         * @returns {Promise<Object>} 包含 data 和 error
         */
        async remove(userId, guideId) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('guide_id', guideId);
            return { data, error };
        },

        /**
         * 检查是否已收藏
         * @param {string} userId 用户ID
         * @param {string} guideId 导游ID（用户ID）
         * @returns {Promise<boolean>} 是否已收藏
         */
        async isFavorited(userId, guideId) {
            if (!supabaseClient) initSupabase();
            const { data } = await supabaseClient
                .from('favorites')
                .select('id')
                .eq('user_id', userId)
                .eq('guide_id', guideId)
                .single();
            return !!data;
        }
    }
};

// ============================================
// 工具函数
// ============================================
const Utils = {
    /**
     * 显示提示消息
     * @param {string} message 消息内容
     * @param {string} type 消息类型：success/error/warning/info
     */
    showToast(message, type = 'info') {
        // 移除已存在的 toast
        document.querySelectorAll('.supabase-toast').forEach(el => el.remove());
        
        const toast = document.createElement('div');
        toast.className = `supabase-toast supabase-toast-${type}`;
        toast.textContent = message;
        
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 14px 24px;
            border-radius: 10px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            background: ${colors[type] || colors.info};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
            max-width: 320px;
        `;
        
        document.body.appendChild(toast);
        
        // 自动移除
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * 格式化日期
     * @param {string|Date} date 日期
     * @returns {string} 格式化后的日期字符串
     */
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    /**
     * 格式化日期时间
     * @param {string|Date} date 日期
     * @returns {string} 格式化后的日期时间字符串
     */
    formatDateTime(date) {
        const d = new Date(date);
        return d.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * 从 localStorage 迁移数据到 Supabase
     * @param {string} userId 用户ID
     */
    async migrateFromLocalStorage(userId) {
        const results = { success: 0, failed: 0 };

        // 迁移导游资料
        const profileData = localStorage.getItem('guide_profile');
        if (profileData) {
            try {
                const profile = JSON.parse(profileData);
                await DB.guideProfiles.upsert(userId, profile);
                localStorage.removeItem('guide_profile');
                results.success++;
            } catch (e) {
                results.failed++;
            }
        }

        // 迁移评价数据
        const reviewsData = localStorage.getItem('guide_reviews');
        if (reviewsData) {
            try {
                const reviews = JSON.parse(reviewsData);
                for (const review of reviews) {
                    await DB.reviews.create({
                        guide_id: userId,
                        ...review
                    });
                }
                localStorage.removeItem('guide_reviews');
                results.success++;
            } catch (e) {
                results.failed++;
            }
        }

        // 迁移学习记录
        const learningData = localStorage.getItem('learning_user_data');
        if (learningData) {
            try {
                const data = JSON.parse(learningData);
                await DB.learningStats.upsert(userId, {
                    total_answered: data.stats?.totalAnswered || 0,
                    total_correct: data.stats?.totalCorrect || 0,
                    total_points: data.stats?.totalPoints || 0,
                    current_streak: data.stats?.currentStreak || 0,
                    learning_days: data.stats?.learningDays?.length || 0,
                    last_study_date: data.stats?.lastStudyDate || null,
                    unlocked_badges: data.stats?.unlockedBadges || []
                });
                localStorage.removeItem('learning_user_data');
                results.success++;
            } catch (e) {
                results.failed++;
            }
        }

        // 迁移收藏数据
        const favoritesData = localStorage.getItem('guide_favorites');
        if (favoritesData) {
            try {
                const favorites = JSON.parse(favoritesData);
                for (const guideId of favorites) {
                    await DB.favorites.add(userId, guideId);
                }
                localStorage.removeItem('guide_favorites');
                results.success++;
            } catch (e) {
                results.failed++;
            }
        }

        return results;
    },

    /**
     * 检查 Supabase 配置是否已设置
     * @returns {boolean} 是否已配置
     */
    isConfigured() {
        return SUPABASE_URL !== 'https://your-project-id.supabase.co' && 
               SUPABASE_ANON_KEY !== 'your-anon-public-key-here';
    },

    /**
     * 生成订单号
     * @returns {string} 订单号
     */
    generateOrderNumber() {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        return `YD${dateStr}${random}`;
    }
};

// ============================================
// 导出到全局作用域
// ============================================
window.supabaseClient = supabaseClient;
window.Auth = Auth;
window.DB = DB;
window.Utils = Utils;
window.initSupabase = initSupabase;
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

// ============================================
// 添加 CSS 动画样式（如果页面没有）
// ============================================
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// 自动初始化（如果已加载 Supabase SDK）
// ============================================
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        // 延迟初始化，等待 Supabase SDK 加载
        setTimeout(() => {
            if (Utils.isConfigured()) {
                initSupabase();
            } else {
                console.warn('⚠️ Supabase 尚未配置，请参考 SUPABASE_GUIDE.md 进行配置');
            }
        }, 500);
    });
}

// ============================================
// 配置检查与警告
// ============================================

/**
 * 检查Supabase配置是否已正确设置
 */
function checkSupabaseConfig() {
  const isPlaceholder = 
    SUPABASE_URL === 'https://your-project-id.supabase.co' ||
    SUPABASE_ANON_KEY === 'your-anon-public-key-here' ||
    !SUPABASE_URL.includes('.supabase.co') ||
    !SUPABASE_ANON_KEY.startsWith('eyJ');
  
  if (isPlaceholder) {
    console.warn('⚠️ [游导旅游] Supabase配置未完成!');
    console.warn('请在 js/supabase-config.js 中设置正确的 SUPABASE_URL 和 SUPABASE_ANON_KEY');
    console.warn('访问 https://supabase.com/dashboard 获取您的API密钥');
    
    // 显示Toast提示（如果toast.js已加载）
    if (typeof window.toast !== 'undefined') {
      setTimeout(() => {
        window.toast.warning('⚠️ 请先配置Supabase才能使用完整功能');
      }, 1000);
    }
    return false;
  }
  return true;
}

// 页面加载时检查配置
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    // 延迟检查，确保console已就绪
    setTimeout(checkSupabaseConfig, 500);
  });
}

// 导出检查函数
window.checkSupabaseConfig = checkSupabaseConfig;
