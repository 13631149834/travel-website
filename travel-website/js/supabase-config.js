// Supabase 配置
const SUPABASE_URL = 'https://jaxqsypcocrlsbmmbqh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qQ1ifHjOofpEsEeMWEnI0A_kwKrH2sh';

// 初始化 Supabase 客户端（在CDN加载后执行）
let supabaseClient = null;

function initSupabase() {
    if (window.supabase && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return true;
    }
    return false;
}

// 用户认证工具类
const Auth = {
    // 获取当前用户
    async getUser() {
        if (!supabaseClient) initSupabase();
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user;
    },

    // 获取当前会话
    async getSession() {
        if (!supabaseClient) initSupabase();
        const { data: { session } } = await supabaseClient.auth.getSession();
        return session;
    },

    // 邮箱注册
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

    // 邮箱登录
    async signIn(email, password) {
        if (!supabaseClient) initSupabase();
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    },

    // 登出
    async signOut() {
        if (!supabaseClient) initSupabase();
        const { error } = await supabaseClient.auth.signOut();
        return { error };
    },

    // 监听认证状态变化
    onAuthStateChange(callback) {
        if (!supabaseClient) initSupabase();
        return supabaseClient.auth.onAuthStateChange(callback);
    },

    // 检查是否登录
    async isLoggedIn() {
        const session = await this.getSession();
        return !!session;
    }
};

// 数据库操作工具类
const DB = {
    // 用户相关
    users: {
        async get(userId) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            return { data, error };
        },

        async create(user) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('users')
                .insert(user)
                .select()
                .single();
            return { data, error };
        },

        async update(userId, updates) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('users')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();
            return { data, error };
        }
    },

    // 导游资料相关
    guideProfiles: {
        async getByUserId(userId) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('guide_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();
            return { data, error };
        },

        async create(profile) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('guide_profiles')
                .insert(profile)
                .select()
                .single();
            return { data, error };
        },

        async update(userId, updates) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('guide_profiles')
                .update(updates)
                .eq('user_id', userId)
                .select()
                .single();
            return { data, error };
        }
    },

    // 评价相关
    reviews: {
        async getByGuideId(guideId, limit = 20) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('reviews')
                .select('*')
                .eq('guide_id', guideId)
                .order('created_at', { ascending: false })
                .limit(limit);
            return { data, error };
        },

        async create(review) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('reviews')
                .insert(review)
                .select()
                .single();
            return { data, error };
        },

        async getStats(guideId) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('reviews')
                .select('rating')
                .eq('guide_id', guideId);
            
            if (error) return { data: null, error };
            
            const total = data.length;
            const avg = total > 0 ? data.reduce((sum, r) => sum + r.rating, 0) / total : 0;
            const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            data.forEach(r => distribution[r.rating]++);
            
            return { data: { total, avg, distribution }, error: null };
        }
    },

    // 学习记录相关
    learningRecords: {
        async getByUserId(userId) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('learning_records')
                .select('*')
                .eq('user_id', userId)
                .order('answered_at', { ascending: false });
            return { data, error };
        },

        async create(record) {
            if (!supabaseClient) initSupabase();
            const { data, error } = await supabaseClient
                .from('learning_records')
                .insert(record)
                .select()
                .single();
            return { data, error };
        },

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
    }
};

// 工具函数
const Utils = {
    // 显示提示
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            z-index: 9999;
            animation: slideDown 0.3s ease;
        `;
        
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        toast.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // 格式化日期
    formatDate(date) {
        return new Date(date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    // 本地存储迁移助手
    async migrateFromLocalStorage(userId) {
        // 迁移导游资料
        const profileData = localStorage.getItem('guideProfile');
        if (profileData) {
            const profile = JSON.parse(profileData);
            await DB.guideProfiles.create({
                user_id: userId,
                ...profile
            });
            localStorage.removeItem('guideProfile');
        }

        // 迁移评价数据
        const reviewsData = localStorage.getItem('reviews');
        if (reviewsData) {
            const reviews = JSON.parse(reviewsData);
            for (const review of reviews) {
                await DB.reviews.create({
                    guide_id: userId,
                    ...review
                });
            }
            localStorage.removeItem('reviews');
        }

        // 迁移学习记录
        const learningData = localStorage.getItem('learningRecords');
        if (learningData) {
            const records = JSON.parse(learningData);
            for (const record of records) {
                await DB.learningRecords.create({
                    user_id: userId,
                    ...record
                });
            }
            localStorage.removeItem('learningRecords');
        }
    }
};

// 导出
window.supabaseClient = supabaseClient;
window.Auth = Auth;
window.DB = DB;
window.Utils = Utils;
window.initSupabase = initSupabase;
