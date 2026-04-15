/**
 * 游导旅游 - 百度统计集成
 * 功能：百度统计代码、转化跟踪、事件跟踪、热力图配置
 */

(function() {
    'use strict';

    // 百度统计配置
    const BaiduTongjiConfig = {
        // 【重要】请替换为您的百度统计站点ID
        siteId: 'YOUR_BAIDU_SITE_ID',
        
        // 是否启用调试模式
        debug: false,
        
        // 自动追踪配置
        autoTrack: {
            pageView: true,      // 自动追踪页面浏览
            click: true,         // 自动追踪点击
            scroll: true,        // 自动追踪滚动深度
            form: true           // 自动追踪表单提交
        },
        
        // 转化配置
        conversions: {
            // 关键转化目标
            goals: [
                {
                    id: 'register_success',
                    name: '注册成功',
                    type: 'event',
                    category: '用户',
                    action: '注册',
                    label: '完成'
                },
                {
                    id: 'login_success',
                    name: '登录成功',
                    type: 'event',
                    category: '用户',
                    action: '登录',
                    label: '成功'
                },
                {
                    id: 'guide_booking',
                    name: '导游预约',
                    type: 'event',
                    category: '业务',
                    action: '预约',
                    label: '导游'
                },
                {
                    id: 'route_booking',
                    name: '路线预订',
                    type: 'event',
                    category: '业务',
                    action: '预订',
                    label: '路线'
                },
                {
                    id: 'payment_success',
                    name: '支付成功',
                    type: 'event',
                    category: '支付',
                    action: '支付',
                    label: '成功'
                }
            ]
        }
    };

    // 百度统计API封装
    window.BaiduTongji = {
        config: BaiduTongjiConfig,
        
        // 初始化
        init: function(siteId) {
            if (siteId) {
                this.config.siteId = siteId;
            }
            
            // 加载百度统计代码
            this._loadScript();
            
            // 设置自动追踪
            if (this.config.autoTrack.pageView) {
                this._setupAutoTrack();
            }
            
            console.log('[BaiduTongji] Initialized with siteId:', this.config.siteId);
        },
        
        // 加载百度统计脚本
        _loadScript: function() {
            // 百度统计异步加载代码
            var _hmt = _hmt || [];
            (function() {
                var hm = document.createElement("script");
                hm.src = "https://hm.baidu.com/hm.js?" + BaiduTongjiConfig.siteId;
                var s = document.getElementsByTagName("script")[0]; 
                s.parentNode.insertBefore(hm, s);
            })();
            
            // 确保 _hmt 可用
            window._hmt = window._hmt || [];
        },
        
        // 设置自动追踪
        _setupAutoTrack: function() {
            var self = this;
            
            // 页面浏览追踪
            if (this.config.autoTrack.pageView) {
                this.trackPageView();
            }
            
            // 点击事件追踪
            if (this.config.autoTrack.click) {
                document.addEventListener('click', function(e) {
                    var target = e.target.closest('[data-track], [data-action]');
                    if (target) {
                        var action = target.dataset.track || target.dataset.action;
                        var label = target.dataset.label || target.textContent.trim().substring(0, 50);
                        self.trackEvent(
                            target.dataset.category || '点击',
                            action,
                            label
                        );
                    }
                });
            }
            
            // 滚动深度追踪
            if (this.config.autoTrack.scroll) {
                this._trackScrollDepth();
            }
            
            // 表单提交追踪
            if (this.config.autoTrack.form) {
                this._trackForms();
            }
        },
        
        // 追踪滚动深度
        _trackScrollDepth: function() {
            var tracked = {};
            var thresholds = [25, 50, 75, 90, 100];
            
            window.addEventListener('scroll', function() {
                var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                var scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
                
                thresholds.forEach(function(threshold) {
                    if (scrollPercent >= threshold && !tracked[threshold]) {
                        tracked[threshold] = true;
                        BaiduTongji.trackEvent('页面', '滚动深度', threshold + '%');
                    }
                });
            });
        },
        
        // 追踪表单提交
        _trackForms: function() {
            var self = this;
            document.addEventListener('submit', function(e) {
                var form = e.target;
                var formName = form.name || form.id || 'unknown_form';
                self.trackEvent('表单', '提交', formName);
            });
        },
        
        // 追踪页面浏览
        trackPageView: function(path) {
            var pagePath = path || window.location.pathname;
            if (window._hmt) {
                window._hmt.push(['_setAutoPageView', true]);
                window._hmt.push(['_trackPageview', pagePath]);
            }
            this.log('Page view tracked:', pagePath);
        },
        
        // 追踪事件
        trackEvent: function(category, action, label, value) {
            if (window._hmt) {
                var eventData = ['_trackEvent', category, action, label];
                if (value !== undefined) {
                    eventData.push(value);
                }
                window._hmt.push(eventData);
            }
            this.log('Event tracked:', category, action, label, value);
        },
        
        // 追踪转化
        trackConversion: function(goalId, conversionType) {
            var goal = this.config.conversions.goals.find(function(g) {
                return g.id === goalId;
            });
            
            if (goal) {
                this.trackEvent(goal.category, goal.action, goal.label);
                this.log('Conversion tracked:', goalId);
            }
        },
        
        // 设置用户ID
        setUserId: function(userId) {
            if (window._hmt) {
                window._hmt.push(['_setCustomVar', 1, 'user_id', userId, 2]);
            }
            this.log('User ID set:', userId);
        },
        
        // 设置用户属性
        setUserProperty: function(property, value) {
            if (window._hmt) {
                window._hmt.push(['_setCustomVar', 2, property, value, 2]);
            }
        },
        
        // 追踪搜索
        trackSearch: function(keyword) {
            this.trackEvent('搜索', '关键词', keyword);
        },
        
        // 追踪预订
        trackBooking: function(bookingType, bookingId, amount) {
            this.trackEvent('预订', bookingType, bookingId, amount);
        },
        
        // 追踪分享
        trackShare: function(platform, target) {
            this.trackEvent('分享', platform, target);
        },
        
        // 获取热力图配置
        getHeatmapConfig: function() {
            return {
                // 热力图类型: 1-点击图, 2-注意力图, 3-链接点击图
                heatmap: {
                    zy: 1  // 启用点击图
                }
            };
        },
        
        // 日志
        log: function() {
            if (this.config.debug) {
                console.log('[BaiduTongji]', Array.prototype.slice.call(arguments).join(' '));
            }
        }
    };

    // 业务事件追踪快捷方法
    window.BaiduEvents = {
        // 用户相关
        onLogin: function(userId) {
            BaiduTongji.setUserId(userId);
            BaiduTongji.trackConversion('login_success');
        },
        
        onRegister: function(userId) {
            BaiduTongji.setUserId(userId);
            BaiduTongji.trackConversion('register_success');
        },
        
        // 业务相关
        onGuideView: function(guideId, guideName) {
            BaiduTongji.trackEvent('导游', '浏览', guideName || guideId);
        },
        
        onGuideBooking: function(guideId, guideName, amount) {
            BaiduTongji.trackEvent('导游', '预约', guideName || guideId, amount);
            BaiduTongji.trackConversion('guide_booking');
        },
        
        onRouteView: function(routeId, routeName) {
            BaiduTongji.trackEvent('路线', '浏览', routeName || routeId);
        },
        
        onRouteBooking: function(routeId, routeName, amount) {
            BaiduTongji.trackEvent('路线', '预订', routeName || routeId, amount);
            BaiduTongji.trackConversion('route_booking');
        },
        
        onActivityView: function(activityId, activityName) {
            BaiduTongji.trackEvent('活动', '浏览', activityName || activityId);
        },
        
        onActivityJoin: function(activityId, activityName) {
            BaiduTongji.trackEvent('活动', '参与', activityName || activityId);
        },
        
        // 支付相关
        onPaymentSuccess: function(orderId, amount) {
            BaiduTongji.trackEvent('支付', '成功', orderId, amount);
            BaiduTongji.trackConversion('payment_success');
        },
        
        onPaymentFail: function(orderId, reason) {
            BaiduTongji.trackEvent('支付', '失败', orderId);
        },
        
        // 内容相关
        onSearch: function(keyword, resultCount) {
            BaiduTongji.trackEvent('搜索', keyword, '结果数:' + resultCount);
        },
        
        onShare: function(targetType, targetId, platform) {
            BaiduTongji.trackShare(platform, targetType + '_' + targetId);
        },
        
        onVideoPlay: function(videoId, duration) {
            BaiduTongji.trackEvent('视频', '播放', videoId, duration);
        },
        
        onImageView: function(imageType, imageId) {
            BaiduTongji.trackEvent('图片', '查看', imageType + '_' + imageId);
        }
    };

    // 自动初始化（可选，可通过 BaiduTongji.init(siteId) 手动初始化）
    // 如果有预定义siteId，则自动初始化
    // if (BaiduTongjiConfig.siteId !== 'YOUR_BAIDU_SITE_ID') {
    //     BaiduTongji.init();
    // }

})();
