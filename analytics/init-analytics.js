/**
 * 游导旅游 - 统计分析系统统一入口
 * 
 * 使用方法：
 * 1. 复制此文件到项目目录
 * 2. 在 </head> 前引入：<script src="js/analytics/init-analytics.js"></script>
 * 3. 根据需要初始化不同的统计工具
 */

(function() {
    'use strict';

    // 统计配置 - 请根据实际情况修改
    const AnalyticsSetup = {
        // 百度统计配置
        baidu: {
            enabled: false,  // 是否启用百度统计
            siteId: ''       // 填入您的百度统计站点ID
        },
        
        // Google Analytics 4 配置
        ga4: {
            enabled: false,      // 是否启用GA4
            measurementId: ''   // 填入您的GA4测量ID
        },
        
        // 自定义追踪配置
        custom: {
            enabled: true,   // 是否启用自定义追踪（本地存储）
            debug: false     // 是否开启调试模式
        },
        
        // 渠道追踪配置
        channel: {
            enabled: true    // 是否启用渠道追踪
        }
    };

    // 判断是否应该初始化（排除后台页面）
    function shouldInitialize() {
        const path = window.location.pathname;
        const adminPaths = ['/admin', '/admin-', '/data-backup'];
        
        // 排除后台页面
        for (const adminPath of adminPaths) {
            if (path.includes(adminPath)) {
                return false;
            }
        }
        return true;
    }

    // 初始化统计分析
    function initAnalytics() {
        if (!shouldInitialize()) {
            console.log('[Analytics Setup] 后台页面，跳过统计分析初始化');
            return;
        }

        console.log('[Analytics Setup] 开始初始化统计分析系统...');

        // 动态加载脚本
        const scripts = [];
        
        if (AnalyticsSetup.custom.enabled) {
            scripts.push('js/analytics/custom-tracker.js');
        }
        
        if (AnalyticsSetup.channel.enabled) {
            scripts.push('js/analytics/channel-tracker.js');
        }

        // 加载脚本的Promise
        function loadScript(src) {
            return new Promise((resolve, reject) => {
                // 检查是否已加载
                const existing = document.querySelector(`script[src="${src}"]`);
                if (existing) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        // 依次加载并初始化
        async function loadAll() {
            // 加载基础脚本
            for (const src of scripts) {
                try {
                    await loadScript(src);
                    console.log(`[Analytics Setup] 已加载: ${src}`);
                } catch (e) {
                    console.error(`[Analytics Setup] 加载失败: ${src}`, e);
                }
            }

            // 加载完成后初始化
            if (AnalyticsSetup.baidu.enabled && AnalyticsSetup.baidu.siteId) {
                try {
                    await loadScript('js/analytics/baidu-tongji.js');
                    BaiduTongji.init(AnalyticsSetup.baidu.siteId);
                    console.log('[Analytics Setup] 百度统计已初始化');
                } catch (e) {
                    console.error('[Analytics Setup] 百度统计初始化失败', e);
                }
            }

            if (AnalyticsSetup.ga4.enabled && AnalyticsSetup.ga4.measurementId) {
                try {
                    await loadScript('js/analytics/ga4-integration.js');
                    GA4Analytics.init(AnalyticsSetup.ga4.measurementId);
                    console.log('[Analytics Setup] GA4已初始化');
                } catch (e) {
                    console.error('[Analytics Setup] GA4初始化失败', e);
                }
            }

            // 页面浏览追踪
            if (AnalyticsSetup.custom.enabled && window.CustomTracker) {
                const pageName = getPageName();
                CustomTracker.trackPageView(pageName);
                console.log(`[Analytics Setup] 页面浏览已追踪: ${pageName}`);
            }

            console.log('[Analytics Setup] 统计分析系统初始化完成');
        }

        // 执行加载
        loadAll();
    }

    // 获取页面名称
    function getPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename.replace('.html', '');
    }

    // 快捷追踪方法
    window.Analytics = {
        // 用户事件
        onLogin: function(userId, method) {
            if (window.BaiduEvents) BaiduEvents.onLogin(userId);
            if (window.GA4Events) GA4Events.onLogin(userId, method);
            if (window.CustomTracker) CustomTracker.track('user_login', { userId, method });
        },

        onRegister: function(userId, method) {
            if (window.BaiduEvents) BaiduEvents.onRegister(userId);
            if (window.GA4Events) GA4Events.onRegister(userId, method);
            if (window.CustomTracker) CustomTracker.track('user_register', { userId, method });
            
            // 记录转化
            if (window.ChannelTracker) ChannelTracker.recordConversion('register', 0, userId);
        },

        // 导游相关
        onGuideView: function(guideId, guideName, guideType) {
            if (window.BaiduEvents) BaiduEvents.onGuideView(guideId, guideName);
            if (window.GA4Events) GA4Events.onGuideView(guideId, guideName, guideType);
            if (window.CustomTracker) CustomTracker.track('guide_view', { guideId, guideName, guideType });
        },

        onGuideBooking: function(guideId, guideName, price) {
            if (window.BaiduEvents) BaiduEvents.onGuideBooking(guideId, guideName, price);
            if (window.GA4Events) GA4Events.onGuideBooking(guideId, guideName, price);
            if (window.CustomTracker) CustomTracker.track('guide_booking', { guideId, guideName, price });
            
            // 记录转化
            if (window.ChannelTracker) ChannelTracker.recordConversion('guide_booking', price, guideId);
        },

        // 路线相关
        onRouteView: function(routeId, routeName, price) {
            if (window.BaiduEvents) BaiduEvents.onRouteView(routeId, routeName);
            if (window.GA4Events) GA4Events.onRouteView(routeId, routeName, price);
            if (window.CustomTracker) CustomTracker.track('route_view', { routeId, routeName, price });
        },

        onRouteBooking: function(routeId, routeName, price) {
            if (window.BaiduEvents) BaiduEvents.onRouteBooking(routeId, routeName, price);
            if (window.GA4Events) GA4Events.onRouteBooking(routeId, routeName, price);
            if (window.CustomTracker) CustomTracker.track('route_booking', { routeId, routeName, price });
            
            // 记录转化
            if (window.ChannelTracker) ChannelTracker.recordConversion('route_booking', price, routeId);
        },

        // 支付相关
        onPaymentSuccess: function(orderId, amount, items) {
            if (window.BaiduEvents) BaiduEvents.onPaymentSuccess(orderId, amount);
            if (window.GA4Events) GA4Events.onPaymentSuccess(orderId, amount, items);
            if (window.CustomTracker) CustomTracker.track('payment_success', { orderId, amount });
            
            // 记录转化
            if (window.ChannelTracker) ChannelTracker.recordConversion('payment', amount, orderId);
        },

        onPaymentFail: function(orderId, reason) {
            if (window.BaiduEvents) BaiduEvents.onPaymentFail(orderId, reason);
            if (window.GA4Events) GA4Events.onPaymentFail(orderId, reason);
            if (window.CustomTracker) CustomTracker.track('payment_fail', { orderId, reason });
        },

        // 内容相关
        onSearch: function(keyword, resultCount) {
            if (window.BaiduEvents) BaiduEvents.onSearch(keyword, resultCount);
            if (window.GA4Events) GA4Events.onSearch(keyword);
            if (window.CustomTracker) CustomTracker.track('search', { keyword, resultCount });
        },

        onShare: function(targetType, targetId, platform) {
            if (window.BaiduEvents) BaiduEvents.onShare(targetType, targetId, platform);
            if (window.GA4Events) GA4Events.onShare(targetType, targetId, platform);
            if (window.CustomTracker) CustomTracker.track('share', { targetType, targetId, platform });
        },

        onVideoPlay: function(videoId, videoTitle) {
            if (window.BaiduEvents) BaiduEvents.onVideoPlay(videoId);
            if (window.GA4Events) GA4Events.onVideoPlay(videoId, videoTitle);
            if (window.CustomTracker) CustomTracker.track('video_play', { videoId, videoTitle });
        },

        // 自定义事件
        track: function(eventName, properties) {
            if (window.CustomTracker) CustomTracker.track(eventName, properties);
            if (window.BaiduTongji) BaiduTongji.trackEvent('Custom', eventName, JSON.stringify(properties));
        },

        // 获取统计摘要
        getSummary: function() {
            const summary = {
                timestamp: new Date().toISOString(),
                url: window.location.href,
                pageName: getPageName()
            };

            if (window.CustomTracker) {
                const stats = CustomTracker.getStats();
                summary.customStats = stats;
            }

            if (window.ChannelTracker) {
                const channel = ChannelTracker.getChannelInfo();
                summary.channel = channel;
            }

            return summary;
        },

        // 生成UTM链接
        generateUTMLink: function(baseUrl, params) {
            if (window.ChannelTracker) {
                return ChannelTracker.generateUTMLink(baseUrl, params);
            }
            
            // 备用实现
            const url = new URL(baseUrl);
            Object.keys(params).forEach(key => {
                if (params[key]) {
                    url.searchParams.set('utm_' + key, params[key]);
                }
            });
            return url.toString();
        },

        // 获取渠道报告
        getChannelReport: function() {
            if (window.ChannelTracker) {
                return ChannelTracker.getChannelReport();
            }
            return [];
        },

        // 获取漏斗报告
        getFunnelReport: function(funnelName) {
            if (window.CustomTracker) {
                return CustomTracker.getFunnelReport(funnelName);
            }
            return null;
        }
    };

    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnalytics);
    } else {
        initAnalytics();
    }

    // 导出初始化函数供手动调用
    window.initAnalytics = initAnalytics;

})();
