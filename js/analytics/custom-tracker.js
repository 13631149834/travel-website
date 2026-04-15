/**
 * 游导旅游 - 自定义统计分析模块
 * 功能：关键事件统计、漏斗统计、用户行为分析
 */

(function() {
    'use strict';

    // 统计配置
    const AnalyticsConfig = {
        appId: 'youdao-travel',
        appName: '游导旅游',
        debug: false, // 生产环境设为 false
        storageKey: 'youdao_analytics',
        sessionTimeout: 30 * 60 * 1000, // 30分钟会话超时
        maxEvents: 100, // 最大本地缓存事件数
    };

    // 事件类型枚举
    const EventTypes = {
        // 页面事件
        PAGE_VIEW: 'page_view',
        PAGE_LEAVE: 'page_leave',
        
        // 用户事件
        USER_LOGIN: 'user_login',
        USER_REGISTER: 'user_register',
        USER_LOGOUT: 'user_logout',
        
        // 业务事件
        GUIDE_VIEW: 'guide_view',           // 导游浏览
        GUIDE_BOOKING: 'guide_booking',     // 导游预约
        ROUTE_VIEW: 'route_view',           // 路线浏览
        ROUTE_BOOKING: 'route_booking',     // 路线预订
        ACTIVITY_VIEW: 'activity_view',     // 活动浏览
        ACTIVITY_JOIN: 'activity_join',     // 活动参与
        SEARCH: 'search',                   // 搜索
        FILTER: 'filter',                   // 筛选
        
        // 转化事件
        CHECKOUT_START: 'checkout_start',  // 结账开始
        CHECKOUT_COMPLETE: 'checkout_complete', // 结账完成
        PAYMENT_SUCCESS: 'payment_success', // 支付成功
        PAYMENT_FAIL: 'payment_fail',       // 支付失败
        
        // 交互事件
        BUTTON_CLICK: 'button_click',
        SCROLL_DEPTH: 'scroll_depth',
        VIDEO_PLAY: 'video_play',
        IMAGE_VIEW: 'image_view',
        COPY_TEXT: 'copy_text',
        SHARE: 'share',
        
        // 错误事件
        ERROR: 'error',
        API_ERROR: 'api_error'
    };

    // 漏斗定义
    const Funnels = {
        // 用户注册漏斗
        registration: [
            { step: 1, name: '首页访问', event: EventTypes.PAGE_VIEW, page: 'index.html' },
            { step: 2, name: '注册页面', event: EventTypes.PAGE_VIEW, page: 'register.html' },
            { step: 3, name: '注册完成', event: EventTypes.USER_REGISTER },
            { step: 4, name: '登录成功', event: EventTypes.USER_LOGIN }
        ],
        
        // 导游预约漏斗
        guideBooking: [
            { step: 1, name: '首页访问', event: EventTypes.PAGE_VIEW, page: 'index.html' },
            { step: 2, name: '导游列表', event: EventTypes.PAGE_VIEW, page: 'guides.html' },
            { step: 3, name: '导游详情', event: EventTypes.GUIDE_VIEW },
            { step: 4, name: '预约确认', event: EventTypes.GUIDE_BOOKING },
            { step: 5, name: '支付完成', event: EventTypes.PAYMENT_SUCCESS }
        ],
        
        // 路线预订漏斗
        routeBooking: [
            { step: 1, name: '首页访问', event: EventTypes.PAGE_VIEW, page: 'index.html' },
            { step: 2, name: '路线列表', event: EventTypes.PAGE_VIEW, page: 'routes.html' },
            { step: 3, name: '路线详情', event: EventTypes.ROUTE_VIEW },
            { step: 4, name: '预订确认', event: EventTypes.ROUTE_BOOKING },
            { step: 5, name: '支付完成', event: EventTypes.PAYMENT_SUCCESS }
        ],
        
        // 搜索转化漏斗
        searchToBooking: [
            { step: 1, name: '发起搜索', event: EventTypes.SEARCH },
            { step: 2, name: '浏览结果', event: EventTypes.PAGE_VIEW },
            { step: 3, name: '查看详情', event: EventTypes.GUIDE_VIEW },
            { step: 4, name: '完成预约', event: EventTypes.GUIDE_BOOKING }
        ]
    };

    // 统计工具类
    class Analytics {
        constructor() {
            this.sessionId = this._generateSessionId();
            this.userId = this._getUserId();
            this.startTime = Date.now();
            this.events = [];
            this.funnelProgress = {};
            this.pageStartTime = null;
            this.scrollDepths = {};
            this.isInitialized = false;
            
            this._init();
        }

        // 初始化
        _init() {
            if (this.isInitialized) return;
            
            // 加载本地缓存事件
            this._loadLocalEvents();
            
            // 设置页面监听
            this._setupPageListeners();
            
            // 设置用户交互监听
            this._setupInteractionListeners();
            
            // 启动会话心跳
            this._startSessionHeartbeat();
            
            this.isInitialized = true;
            this._log('Analytics initialized', { sessionId: this.sessionId });
        }

        // 生成会话ID
        _generateSessionId() {
            return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
        }

        // 获取用户ID
        _getUserId() {
            const user = localStorage.getItem('user');
            if (user) {
                try {
                    const userData = JSON.parse(user);
                    return userData.id || null;
                } catch (e) {
                    return null;
                }
            }
            return null;
        }

        // 记录事件
        track(eventType, properties = {}) {
            const event = {
                event: eventType,
                timestamp: Date.now(),
                sessionId: this.sessionId,
                userId: this.userId,
                url: window.location.href,
                referrer: document.referrer,
                properties: {
                    ...properties,
                    userAgent: navigator.userAgent,
                    screenWidth: window.screen.width,
                    screenHeight: window.screen.height,
                    language: navigator.language
                }
            };

            // 存储事件
            this.events.push(event);
            
            // 更新漏斗进度
            this._updateFunnelProgress(eventType, properties);
            
            // 保存到本地
            this._saveLocalEvents();
            
            // 发送到服务器
            this._sendToServer(event);
            
            // 输出调试信息
            this._log('Event tracked:', event);
            
            return event;
        }

        // 页面浏览追踪
        trackPageView(pageName, pageUrl) {
            return this.track(EventTypes.PAGE_VIEW, {
                pageName: pageName,
                pageUrl: pageUrl || window.location.pathname,
                title: document.title
            });
        }

        // 漏斗追踪
        trackFunnelStep(funnelName, stepIndex, properties = {}) {
            return this.track('funnel_step', {
                funnelName,
                stepIndex,
                ...properties
            });
        }

        // 漏斗进度更新
        _updateFunnelProgress(eventType, properties) {
            for (const [funnelName, steps] of Object.entries(Funnels)) {
                const currentProgress = this.funnelProgress[funnelName] || 0;
                
                for (let i = currentProgress; i < steps.length; i++) {
                    const step = steps[i];
                    let matched = false;
                    
                    if (step.event === eventType) {
                        if (step.page) {
                            matched = window.location.pathname.includes(step.page);
                        } else {
                            matched = true;
                        }
                    }
                    
                    if (matched) {
                        this.funnelProgress[funnelName] = i + 1;
                        this._saveFunnelProgress();
                        
                        // 记录漏斗步骤
                        this.track('funnel_progress', {
                            funnelName,
                            step: i + 1,
                            stepName: step.name,
                            isCompleted: i + 1 === steps.length
                        });
                        break;
                    }
                }
            }
        }

        // 获取漏斗报告
        getFunnelReport(funnelName) {
            const steps = Funnels[funnelName];
            if (!steps) return null;

            const report = {
                funnelName,
                steps: steps.map((step, index) => ({
                    step: index + 1,
                    name: step.name,
                    event: step.event,
                    conversions: this._countFunnelConversions(funnelName, index + 1),
                    dropOffs: this._countFunnelDropOffs(funnelName, index + 1)
                })),
                overallConversionRate: this._calculateOverallConversion(funnelName)
            };

            return report;
        }

        // 计算漏斗转化次数
        _countFunnelConversions(funnelName, step) {
            const key = `funnel_${funnelName}_step_${step}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data).length : 0;
        }

        // 计算漏斗流失次数
        _countFunnelDropOffs(funnelName, step) {
            const current = this._countFunnelConversions(funnelName, step);
            const previous = step > 1 ? this._countFunnelConversions(funnelName, step - 1) : current;
            return Math.max(0, previous - current);
        }

        // 计算整体转化率
        _calculateOverallConversion(funnelName) {
            const steps = Funnels[funnelName];
            const first = this._countFunnelConversions(funnelName, 1);
            const last = this._countFunnelConversions(funnelName, steps.length);
            
            if (first === 0) return 0;
            return ((last / first) * 100).toFixed(2);
        }

        // 设置页面监听
        _setupPageListeners() {
            // 页面加载
            window.addEventListener('load', () => {
                this.pageStartTime = Date.now();
                const pageName = this._getPageName();
                this.trackPageView(pageName);
            });

            // 页面离开
            window.addEventListener('beforeunload', () => {
                if (this.pageStartTime) {
                    const duration = Date.now() - this.pageStartTime;
                    this.track(EventTypes.PAGE_LEAVE, {
                        duration: duration,
                        pageName: this._getPageName()
                    });
                }
            });

            // 滚动深度追踪
            this._setupScrollTracking();
        }

        // 滚动深度追踪
        _setupScrollTracking() {
            let maxScroll = 0;
            const thresholds = [25, 50, 75, 90, 100];
            const tracked = new Set();

            window.addEventListener('scroll', () => {
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollTop = window.scrollY;
                const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
                
                maxScroll = Math.max(maxScroll, scrollPercent);

                thresholds.forEach(threshold => {
                    if (maxScroll >= threshold && !tracked.has(threshold)) {
                        tracked.add(threshold);
                        this.track(EventTypes.SCROLL_DEPTH, {
                            depth: threshold,
                            pageName: this._getPageName()
                        });
                    }
                });
            });
        }

        // 设置交互监听
        _setupInteractionListeners() {
            // 点击事件代理
            document.addEventListener('click', (e) => {
                const target = e.target.closest('[data-track], [data-action]');
                if (target) {
                    const action = target.dataset.track || target.dataset.action;
                    const label = target.dataset.label || target.textContent?.trim() || '';
                    
                    this.track(EventTypes.BUTTON_CLICK, {
                        action,
                        label,
                        href: target.href || null,
                        className: target.className
                    });
                }
            });

            // 搜索事件
            const searchInputs = document.querySelectorAll('input[type="search"], input[name="q"], input[name="keyword"]');
            searchInputs.forEach(input => {
                input.addEventListener('search', (e) => {
                    if (e.target.value) {
                        this.track(EventTypes.SEARCH, {
                            keyword: e.target.value,
                            pageName: this._getPageName()
                        });
                    }
                });
            });

            // 视频播放
            document.querySelectorAll('video').forEach(video => {
                video.addEventListener('play', () => {
                    this.track(EventTypes.VIDEO_PLAY, {
                        src: video.src,
                        currentTime: video.currentTime
                    });
                });
            });

            // 分享事件
            document.addEventListener('click', (e) => {
                const shareBtn = e.target.closest('[data-share], .share-btn, [onclick*="share"]');
                if (shareBtn) {
                    this.track(EventTypes.SHARE, {
                        platform: shareBtn.dataset.platform || 'unknown',
                        pageName: this._getPageName()
                    });
                }
            });

            // 复制文本
            document.addEventListener('copy', (e) => {
                const selection = window.getSelection().toString();
                if (selection.length > 10) {
                    this.track(EventTypes.COPY_TEXT, {
                        length: selection.length,
                        pageName: this._getPageName()
                    });
                }
            });
        }

        // 会话心跳
        _startSessionHeartbeat() {
            setInterval(() => {
                const lastActivity = parseInt(sessionStorage.getItem('lastActivity') || '0');
                const now = Date.now();
                
                if (now - lastActivity > AnalyticsConfig.sessionTimeout) {
                    // 会话超时，创建新会话
                    this.sessionId = this._generateSessionId();
                    this._log('New session created');
                }
                
                sessionStorage.setItem('lastActivity', now.toString());
            }, 60000); // 每分钟检查一次
        }

        // 获取页面名称
        _getPageName() {
            const path = window.location.pathname;
            const filename = path.split('/').pop() || 'index.html';
            return filename.replace('.html', '');
        }

        // 本地存储操作
        _loadLocalEvents() {
            try {
                const data = localStorage.getItem(AnalyticsConfig.storageKey);
                if (data) {
                    const parsed = JSON.parse(data);
                    this.events = parsed.events || [];
                    this.funnelProgress = parsed.funnelProgress || {};
                }
            } catch (e) {
                this._log('Error loading local events:', e);
            }
        }

        _saveLocalEvents() {
            try {
                // 只保留最近的 maxEvents 条
                if (this.events.length > AnalyticsConfig.maxEvents) {
                    this.events = this.events.slice(-AnalyticsConfig.maxEvents);
                }
                
                localStorage.setItem(AnalyticsConfig.storageKey, JSON.stringify({
                    events: this.events,
                    funnelProgress: this.funnelProgress,
                    lastUpdated: Date.now()
                }));
            } catch (e) {
                this._log('Error saving local events:', e);
            }
        }

        _saveFunnelProgress() {
            try {
                const data = localStorage.getItem(AnalyticsConfig.storageKey);
                const parsed = data ? JSON.parse(data) : {};
                parsed.funnelProgress = this.funnelProgress;
                parsed.lastUpdated = Date.now();
                localStorage.setItem(AnalyticsConfig.storageKey, JSON.stringify(parsed));
            } catch (e) {
                this._log('Error saving funnel progress:', e);
            }
        }

        // 发送到服务器
        _sendToServer(event) {
            // 实际项目中，这里应该发送到你的后端API
            // 这里简化为打印到控制台
            if (AnalyticsConfig.debug) {
                console.log('[Analytics]', event);
            }

            // 示例：发送到后端
            // fetch('/api/analytics/track', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(event)
            // }).catch(err => console.error('Analytics error:', err));
        }

        // 获取统计数据
        getStats() {
            return {
                totalEvents: this.events.length,
                sessionId: this.sessionId,
                userId: this.userId,
                funnelProgress: this.funnelProgress,
                eventCounts: this._countEventsByType(),
                pageViews: this._countPageViews(),
                sessionDuration: Date.now() - this.startTime
            };
        }

        _countEventsByType() {
            const counts = {};
            this.events.forEach(e => {
                counts[e.event] = (counts[e.event] || 0) + 1;
            });
            return counts;
        }

        _countPageViews() {
            return this.events.filter(e => e.event === EventTypes.PAGE_VIEW).length;
        }

        // 清除统计数据
        clearStats() {
            this.events = [];
            this.funnelProgress = {};
            localStorage.removeItem(AnalyticsConfig.storageKey);
            this._log('Stats cleared');
        }

        // 导出数据
        exportData() {
            return {
                config: AnalyticsConfig,
                events: this.events,
                funnelProgress: this.funnelProgress,
                exportedAt: new Date().toISOString()
            };
        }

        // 日志
        _log(...args) {
            if (AnalyticsConfig.debug) {
                console.log('[CustomTracker]', ...args);
            }
        }
    }

    // 导出到全局
    window.CustomTracker = {
        init: () => new Analytics(),
        EventTypes,
        Funnels,
        instance: null,
        
        // 便捷方法
        track: (eventType, properties) => {
            if (!window.CustomTracker.instance) {
                window.CustomTracker.instance = new Analytics();
            }
            return window.CustomTracker.instance.track(eventType, properties);
        },
        
        trackPageView: (pageName, pageUrl) => {
            if (!window.CustomTracker.instance) {
                window.CustomTracker.instance = new Analytics();
            }
            return window.CustomTracker.instance.trackPageView(pageName, pageUrl);
        },
        
        getStats: () => {
            if (!window.CustomTracker.instance) {
                window.CustomTracker.instance = new Analytics();
            }
            return window.CustomTracker.instance.getStats();
        },
        
        getFunnelReport: (funnelName) => {
            if (!window.CustomTracker.instance) {
                window.CustomTracker.instance = new Analytics();
            }
            return window.CustomTracker.instance.getFunnelReport(funnelName);
        },
        
        exportData: () => {
            if (!window.CustomTracker.instance) {
                window.CustomTracker.instance = new Analytics();
            }
            return window.CustomTracker.instance.exportData();
        }
    };

    // 自动初始化
    document.addEventListener('DOMContentLoaded', () => {
        window.CustomTracker.instance = new Analytics();
    });

})();
