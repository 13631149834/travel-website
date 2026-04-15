/**
 * 游导旅游 - 统计分析配置模板
 * 
 * 使用说明：
 * 1. 复制此文件为 analytics-config.js
 * 2. 填入您的实际统计ID
 * 3. 在页面中引入此文件
 */

window.AnalyticsConfig = {
    // ============================================
    // 百度统计配置
    // ============================================
    baidu: {
        enabled: false,  // 设置为 true 启用
        siteId: '',     // 填入您的百度统计站点ID
        debug: false
    },

    // ============================================
    // Google Analytics 4 配置
    // ============================================
    ga4: {
        enabled: false,      // 设置为 true 启用
        measurementId: '',   // 填入您的GA4测量ID (G-XXXXXXXXXX)
        debug: false
    },

    // ============================================
    // 自定义追踪配置
    // ============================================
    custom: {
        enabled: true,       // 推荐启用，用于本地数据收集
        debug: false,
        storageKey: 'youdao_analytics',
        sessionTimeout: 30 * 60 * 1000,  // 30分钟会话超时
        maxEvents: 100        // 最大本地缓存事件数
    },

    // ============================================
    // 渠道追踪配置
    // ============================================
    channel: {
        enabled: true,        // 推荐启用，用于UTM追踪
        utmKeys: {
            source: 'utm_source',
            medium: 'utm_medium',
            campaign: 'utm_campaign',
            term: 'utm_term',
            content: 'utm_content'
        },
        attribution: 'lastClick'  // 归因模型: firstClick, lastClick, linear, positionBased
    },

    // ============================================
    // 转化目标配置
    // ============================================
    conversions: {
        // 注册成功
        register: {
            id: 'register_success',
            name: '注册成功',
            value: 0  // 注册通常无直接收益，可设置预估LTV
        },
        // 登录
        login: {
            id: 'login_success',
            name: '登录成功',
            value: 0
        },
        // 导游预约
        guideBooking: {
            id: 'guide_booking',
            name: '导游预约',
            value: 0  // 动态获取订单金额
        },
        // 路线预订
        routeBooking: {
            id: 'route_booking',
            name: '路线预订',
            value: 0
        },
        // 支付成功
        paymentSuccess: {
            id: 'payment_success',
            name: '支付成功',
            value: 0  // 动态获取订单金额
        }
    },

    // ============================================
    // 漏斗配置
    // ============================================
    funnels: {
        // 用户注册漏斗
        registration: [
            { step: 1, name: '首页访问', event: 'page_view', page: 'index.html' },
            { step: 2, name: '注册页面', event: 'page_view', page: 'register.html' },
            { step: 3, name: '注册完成', event: 'user_register' },
            { step: 4, name: '登录成功', event: 'user_login' }
        ],

        // 导游预约漏斗
        guideBooking: [
            { step: 1, name: '首页访问', event: 'page_view', page: 'index.html' },
            { step: 2, name: '导游列表', event: 'page_view', page: 'guides.html' },
            { step: 3, name: '导游详情', event: 'guide_view' },
            { step: 4, name: '预约确认', event: 'guide_booking' },
            { step: 5, name: '支付完成', event: 'payment_success' }
        ],

        // 路线预订漏斗
        routeBooking: [
            { step: 1, name: '首页访问', event: 'page_view', page: 'index.html' },
            { step: 2, name: '路线列表', event: 'page_view', page: 'routes.html' },
            { step: 3, name: '路线详情', event: 'route_view' },
            { step: 4, name: '预订确认', event: 'route_booking' },
            { step: 5, name: '支付完成', event: 'payment_success' }
        ],

        // 搜索转化漏斗
        searchToBooking: [
            { step: 1, name: '发起搜索', event: 'search' },
            { step: 2, name: '浏览结果', event: 'page_view', page: 'search.html' },
            { step: 3, name: '查看详情', event: 'guide_view' },
            { step: 4, name: '完成预约', event: 'guide_booking' }
        ]
    },

    // ============================================
    // 渠道配置
    // ============================================
    channels: {
        // 搜索引擎
        'google': { name: 'Google', medium: 'organic', category: '搜索引擎' },
        'baidu': { name: '百度', medium: 'organic', category: '搜索引擎' },
        'bing': { name: 'Bing', medium: 'organic', category: '搜索引擎' },
        
        // 社交媒体
        'weibo': { name: '微博', medium: 'social', category: '社交媒体' },
        'weixin': { name: '微信', medium: 'social', category: '社交媒体' },
        'xiaohongshu': { name: '小红书', medium: 'social', category: '社交媒体' },
        'douyin': { name: '抖音', medium: 'social', category: '社交媒体' },
        'bilibili': { name: 'B站', medium: 'social', category: '社交媒体' },
        
        // 付费广告
        'baidu_sem': { name: '百度推广', medium: 'cpc', category: '付费广告' },
        'google_ads': { name: 'Google Ads', medium: 'cpc', category: '付费广告' },
        'toutiao_ads': { name: '头条广告', medium: 'cpc', category: '付费广告' },
        
        // 邮件营销
        'email': { name: '邮件营销', medium: 'email', category: '邮件' },
        'newsletter': { name: 'Newsletter', medium: 'email', category: '邮件' },
        
        // 直接流量
        'direct': { name: '直接访问', medium: 'none', category: '直接' },
        
        // 引荐流量
        'referral': { name: '引荐链接', medium: 'referral', category: '引荐' }
    },

    // ============================================
    // 预算配置（用于ROI计算）
    // ============================================
    budgets: {
        // 渠道月预算配置
        // 'baidu_sem': 15000,
        // 'google_ads': 10000,
        // 'toutiao_ads': 8000,
        // 'weibo_ads': 5000
    },

    // ============================================
    // 追踪事件映射
    // ============================================
    events: {
        // 页面事件
        pageView: 'page_view',
        pageLeave: 'page_leave',
        
        // 用户事件
        userLogin: 'user_login',
        userRegister: 'user_register',
        userLogout: 'user_logout',
        
        // 业务事件
        guideView: 'guide_view',
        guideBooking: 'guide_booking',
        routeView: 'route_view',
        routeBooking: 'route_booking',
        activityView: 'activity_view',
        activityJoin: 'activity_join',
        search: 'search',
        filter: 'filter',
        
        // 转化事件
        checkoutStart: 'checkout_start',
        checkoutComplete: 'checkout_complete',
        paymentSuccess: 'payment_success',
        paymentFail: 'payment_fail',
        
        // 交互事件
        buttonClick: 'button_click',
        scrollDepth: 'scroll_depth',
        videoPlay: 'video_play',
        imageView: 'image_view',
        copyText: 'copy_text',
        share: 'share',
        
        // 错误事件
        error: 'error',
        apiError: 'api_error'
    },

    // ============================================
    // 排除配置
    // ============================================
    exclude: {
        // 排除追踪的页面路径
        paths: [
            '/admin/',
            '/api/',
            '/internal/'
        ],
        
        // 排除追踪的用户角色
        roles: [
            'admin',
            'tester'
        ]
    }
};

// 应用配置到各统计模块
function applyAnalyticsConfig() {
    const config = window.AnalyticsConfig;
    
    // 应用到百度统计
    if (config.baidu.enabled && config.baidu.siteId) {
        if (window.BaiduTongjiConfig) {
            window.BaiduTongjiConfig.siteId = config.baidu.siteId;
            window.BaiduTongjiConfig.debug = config.baidu.debug;
        }
    }
    
    // 应用到GA4
    if (config.ga4.enabled && config.ga4.measurementId) {
        if (window.GA4Config) {
            window.GA4Config.measurementId = config.ga4.measurementId;
            window.GA4Config.debug = config.ga4.debug;
        }
    }
    
    // 应用到自定义追踪
    if (config.custom.enabled) {
        if (window.AnalyticsConfig) {
            window.AnalyticsConfig.custom.debug = config.custom.debug;
        }
    }
}

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.AnalyticsConfig;
}
