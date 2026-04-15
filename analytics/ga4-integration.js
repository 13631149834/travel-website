/**
 * 游导旅游 - Google Analytics 4 集成
 * 功能：GA4代码集成、转化目标配置、用户属性、增强电商追踪
 */

(function() {
    'use strict';

    // GA4 配置
    const GA4Config = {
        // 【重要】请替换为您的GA4测量ID
        measurementId: 'G-XXXXXXXXXX',
        
        // 是否启用调试模式
        debug: false,
        
        // 自动追踪配置
        autoTrack: {
            pageView: true,
            click: true,
            scroll: true,
            form: true,
            video: true,
            fileDownload: true
        },
        
        // 转化目标配置
        conversions: {
            // 注册成功
            register: {
                eventName: 'generate_lead',
                parameters: {
                    currency: 'CNY',
                    value: 0
                }
            },
            // 登录
            login: {
                eventName: 'login',
                parameters: {}
            },
            // 导游预约
            guideBooking: {
                eventName: 'purchase',
                parameters: {
                    currency: 'CNY'
                }
            },
            // 路线预订
            routeBooking: {
                eventName: 'purchase',
                parameters: {
                    currency: 'CNY'
                }
            },
            // 支付成功
            paymentSuccess: {
                eventName: 'purchase',
                parameters: {
                    currency: 'CNY'
                }
            },
            // 搜索
            search: {
                eventName: 'search',
                parameters: {}
            },
            // 内容浏览
            viewContent: {
                eventName: 'view_item',
                parameters: {
                    currency: 'CNY'
                }
            }
        },
        
        // 用户属性
        userProperties: {
            userType: { name: 'user_type' },          // 用户类型：游客/注册用户/会员
            membershipLevel: { name: 'membership_level' }, // 会员等级
            preferredDestination: { name: 'preferred_destination' }, // 偏好目的地
            preferredGuideType: { name: 'preferred_guide_type' } // 偏好导游类型
        }
    };

    // GA4 API 封装
    window.GA4Analytics = {
        config: GA4Config,
        isLoaded: false,
        
        // 初始化
        init: function(measurementId) {
            if (measurementId) {
                this.config.measurementId = measurementId;
            }
            
            this._loadScript();
            this._setupAutoTrack();
            
            console.log('[GA4Analytics] Initialized with measurementId:', this.config.measurementId);
        },
        
        // 加载GA4脚本
        _loadScript: function() {
            // GA4 异步追踪代码
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                window.dataLayer.push(arguments);
            }
            gtag('js', new Date());
            
            gtag('config', this.config.measurementId, {
                send_page_view: false, // 我们手动控制页面追踪
                cookie_flags: 'SameSite=None;Secure'
            });
            
            // 加载 gtag.js
            var script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=' + this.config.measurementId;
            var firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(script, firstScript);
            
            this.isLoaded = true;
        },
        
        // 设置自动追踪
        _setupAutoTrack: function() {
            var self = this;
            
            // 页面浏览追踪
            if (this.config.autoTrack.pageView) {
                this.trackPageView();
                // 监听 SPA 路由变化
                this._setupSPAMonitoring();
            }
            
            // 点击事件追踪
            if (this.config.autoTrack.click) {
                this._setupClickTracking();
            }
            
            // 滚动深度追踪
            if (this.config.autoTrack.scroll) {
                this._trackScrollDepth();
            }
            
            // 表单追踪
            if (this.config.autoTrack.form) {
                this._trackForms();
            }
            
            // 视频追踪
            if (this.config.autoTrack.video) {
                this._trackVideos();
            }
            
            // 文件下载追踪
            if (this.config.autoTrack.fileDownload) {
                this._trackFileDownloads();
            }
        },
        
        // SPA 路由监控
        _setupSPAMonitoring: function() {
            var self = this;
            var lastUrl = window.location.href;
            
            // 监听 popstate
            window.addEventListener('popstate', function() {
                if (window.location.href !== lastUrl) {
                    lastUrl = window.location.href;
                    setTimeout(function() {
                        self.trackPageView();
                    }, 100);
                }
            });
            
            // 监听 hashchange
            window.addEventListener('hashchange', function() {
                setTimeout(function() {
                    self.trackPageView();
                }, 100);
            });
            
            // MutationObserver 监控 DOM 变化（用于检测 SPA 路由）
            if (typeof MutationObserver !== 'undefined') {
                var observer = new MutationObserver(function(mutations) {
                    if (window.location.href !== lastUrl) {
                        lastUrl = window.location.href;
                        self.trackPageView();
                    }
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        },
        
        // 点击追踪
        _setupClickTracking: function() {
            var self = this;
            document.addEventListener('click', function(e) {
                var target = e.target.closest('[data-ga-click], [data-track], [data-action]');
                if (target) {
                    var category = target.dataset.gaCategory || 'engagement';
                    var action = target.dataset.gaAction || target.dataset.track || target.dataset.action || 'click';
                    var label = target.dataset.gaLabel || target.textContent.trim().substring(0, 100);
                    var value = parseInt(target.dataset.gaValue) || 0;
                    
                    self.trackEvent(category, action, label, value);
                }
            });
        },
        
        // 滚动深度追踪
        _trackScrollDepth: function() {
            var tracked = {};
            var thresholds = [10, 25, 50, 75, 90, 100];
            var self = this;
            
            window.addEventListener('scroll', this._debounce(function() {
                var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                var scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
                
                thresholds.forEach(function(threshold) {
                    if (scrollPercent >= threshold && !tracked[threshold]) {
                        tracked[threshold] = true;
                        self.trackEvent('page_scroll', 'scroll_depth', threshold + '%');
                    }
                });
            }, 500));
        },
        
        // 表单追踪
        _trackForms: function() {
            var self = this;
            document.addEventListener('submit', function(e) {
                var form = e.target;
                var formName = form.name || form.id || form.className || 'unknown';
                self.trackEvent('form', 'submit', formName.substring(0, 50));
            });
        },
        
        // 视频追踪
        _trackVideos: function() {
            var self = this;
            document.querySelectorAll('video').forEach(function(video) {
                // 播放事件
                video.addEventListener('play', function() {
                    self.trackEvent('video', 'play', self._getVideoName(video));
                });
                
                // 暂停事件
                video.addEventListener('pause', function() {
                    self.trackEvent('video', 'pause', self._getVideoName(video));
                });
                
                // 进度事件
                video.addEventListener('timeupdate', self._debounce(function() {
                    var percent = Math.round((video.currentTime / video.duration) * 100);
                    if (percent === 25 || percent === 50 || percent === 75 || percent === 90) {
                        self.trackEvent('video', 'progress_' + percent + '%', self._getVideoName(video));
                    }
                }, 5000));
                
                // 完成事件
                video.addEventListener('ended', function() {
                    self.trackEvent('video', 'complete', self._getVideoName(video));
                });
            });
        },
        
        // 文件下载追踪
        _trackFileDownloads: function() {
            var self = this;
            var fileExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'jpg', 'png', 'mp4'];
            
            document.addEventListener('click', function(e) {
                var link = e.target.closest('a');
                if (link && link.href) {
                    var extension = link.href.split('.').pop().toLowerCase();
                    if (fileExtensions.includes(extension)) {
                        self.trackEvent('file_download', extension, link.href.split('/').pop());
                    }
                }
            });
        },
        
        // 获取视频名称
        _getVideoName: function(video) {
            return video.id || video.className || video.src.split('/').pop() || 'unknown_video';
        },
        
        // 防抖
        _debounce: function(func, wait) {
            var timeout;
            return function() {
                var context = this;
                var args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    func.apply(context, args);
                }, wait);
            };
        },
        
        // 追踪页面浏览
        trackPageView: function(title, path) {
            if (!this.isLoaded) return;
            
            gtag('event', 'page_view', {
                page_title: title || document.title,
                page_location: window.location.href,
                page_path: path || window.location.pathname
            });
            
            this.log('Page view tracked:', title, path);
        },
        
        // 追踪事件
        trackEvent: function(category, action, label, value) {
            if (!this.isLoaded) return;
            
            var eventData = {
                event_category: category,
                event_label: label
            };
            
            if (value !== undefined) {
                eventData.value = value;
            }
            
            gtag('event', action, eventData);
            this.log('Event tracked:', category, action, label, value);
        },
        
        // 追踪搜索
        trackSearch: function(searchTerm) {
            if (!this.isLoaded) return;
            
            gtag('event', 'search', {
                search_term: searchTerm
            });
            
            this.log('Search tracked:', searchTerm);
        },
        
        // 追踪内容浏览 (增强电商)
        trackViewContent: function(itemId, itemName, itemCategory, price) {
            if (!this.isLoaded) return;
            
            gtag('event', 'view_item', {
                currency: 'CNY',
                value: price || 0,
                items: [{
                    item_id: itemId,
                    item_name: itemName,
                    item_category: itemCategory,
                    price: price || 0
                }]
            });
            
            this.log('View content tracked:', itemId, itemName);
        },
        
        // 追踪加入购物车 (增强电商)
        trackAddToCart: function(itemId, itemName, itemCategory, price, quantity) {
            if (!this.isLoaded) return;
            
            gtag('event', 'add_to_cart', {
                currency: 'CNY',
                value: price * quantity,
                items: [{
                    item_id: itemId,
                    item_name: itemName,
                    item_category: itemCategory,
                    price: price,
                    quantity: quantity || 1
                }]
            });
            
            this.log('Add to cart tracked:', itemId, itemName);
        },
        
        // 追踪从购物车移除
        trackRemoveFromCart: function(itemId, itemName, itemCategory, price) {
            if (!this.isLoaded) return;
            
            gtag('event', 'remove_from_cart', {
                currency: 'CNY',
                value: price,
                items: [{
                    item_id: itemId,
                    item_name: itemName,
                    item_category: itemCategory,
                    price: price
                }]
            });
            
            this.log('Remove from cart tracked:', itemId);
        },
        
        // 追踪结账开始
        trackBeginCheckout: function(value) {
            if (!this.isLoaded) return;
            
            gtag('event', 'begin_checkout', {
                currency: 'CNY',
                value: value || 0
            });
            
            this.log('Checkout begun');
        },
        
        // 追踪购买/转化 (增强电商)
        trackPurchase: function(transactionId, value, tax, shipping, items) {
            if (!this.isLoaded) return;
            
            gtag('event', 'purchase', {
                transaction_id: transactionId,
                currency: 'CNY',
                value: value,
                tax: tax || 0,
                shipping: shipping || 0,
                items: items || []
            });
            
            this.log('Purchase tracked:', transactionId, value);
        },
        
        // 追踪退款
        trackRefund: function(transactionId, value) {
            if (!this.isLoaded) return;
            
            gtag('event', 'refund', {
                transaction_id: transactionId,
                currency: 'CNY',
                value: value || 0
            });
            
            this.log('Refund tracked:', transactionId);
        },
        
        // 设置用户ID
        setUserId: function(userId) {
            if (!this.isLoaded) return;
            
            gtag('set', { user_id: userId });
            this.log('User ID set:', userId);
        },
        
        // 设置用户属性
        setUserProperty: function(name, value) {
            if (!this.isLoaded) return;
            
            gtag('set', { user_properties: { [name]: value } });
            this.log('User property set:', name, value);
        },
        
        // 设置用户属性 (新版API)
        setUserProperties: function(properties) {
            if (!this.isLoaded) return;
            
            gtag('event', 'user_properties', { user_properties: properties });
        },
        
        // 追踪登录
        trackLogin: function(method) {
            if (!this.isLoaded) return;
            
            gtag('event', 'login', {
                method: method || 'unknown'
            });
            
            this.log('Login tracked:', method);
        },
        
        // 追踪注册
        trackSignUp: function(method) {
            if (!this.isLoaded) return;
            
            gtag('event', 'sign_up', {
                method: method || 'unknown'
            });
            
            this.log('Sign up tracked:', method);
        },
        
        // 追踪分享
        trackShare: function(method, contentType, itemId) {
            if (!this.isLoaded) return;
            
            gtag('event', 'share', {
                method: method,
                content_type: contentType,
                item_id: itemId
            });
            
            this.log('Share tracked:', method, contentType);
        },
        
        // 追踪视频事件
        trackVideoEvent: function(videoId, eventType, videoTitle) {
            if (!this.isLoaded) return;
            
            gtag('event', 'video_' + eventType, {
                video_id: videoId,
                video_title: videoTitle || videoId
            });
        },
        
        // 日志
        log: function() {
            if (this.config.debug) {
                console.log('[GA4Analytics]', Array.prototype.slice.call(arguments).join(' '));
            }
        }
    };

    // 业务事件追踪快捷方法
    window.GA4Events = {
        // 用户事件
        onLogin: function(userId, method) {
            GA4Analytics.setUserId(userId);
            GA4Analytics.trackLogin(method || 'website');
        },
        
        onRegister: function(userId, method) {
            GA4Analytics.setUserId(userId);
            GA4Analytics.trackSignUp(method || 'website');
        },
        
        // 业务事件
        onGuideView: function(guideId, guideName, guideType) {
            GA4Analytics.trackViewContent(guideId, guideName, guideType || '导游');
        },
        
        onGuideBooking: function(guideId, guideName, price) {
            GA4Analytics.trackPurchase(
                'guide_' + guideId + '_' + Date.now(),
                price || 0,
                0,
                0,
                [{
                    item_id: guideId,
                    item_name: guideName,
                    item_category: '导游',
                    price: price || 0,
                    quantity: 1
                }]
            );
        },
        
        onRouteView: function(routeId, routeName, price) {
            GA4Analytics.trackViewContent(routeId, routeName, '路线', price);
        },
        
        onRouteBooking: function(routeId, routeName, price) {
            GA4Analytics.trackPurchase(
                'route_' + routeId + '_' + Date.now(),
                price || 0,
                0,
                0,
                [{
                    item_id: routeId,
                    item_name: routeName,
                    item_category: '路线',
                    price: price || 0,
                    quantity: 1
                }]
            );
        },
        
        onActivityView: function(activityId, activityName) {
            GA4Analytics.trackViewContent(activityId, activityName, '活动');
        },
        
        onActivityJoin: function(activityId, activityName) {
            GA4Analytics.trackEvent('activity', 'join', activityName);
        },
        
        // 支付事件
        onPaymentSuccess: function(orderId, totalAmount, items) {
            GA4Analytics.trackPurchase(orderId, totalAmount, 0, 0, items || []);
        },
        
        onPaymentFail: function(orderId, reason) {
            GA4Analytics.trackEvent('payment', 'failed', reason);
        },
        
        // 内容事件
        onSearch: function(keyword, resultCount) {
            GA4Analytics.trackSearch(keyword);
        },
        
        onShare: function(targetType, targetId, platform) {
            GA4Analytics.trackShare(platform, targetType, targetId);
        },
        
        onVideoPlay: function(videoId, videoTitle) {
            GA4Analytics.trackVideoEvent(videoId, 'play', videoTitle);
        },
        
        onImageGallery: function(galleryId, imageCount) {
            GA4Analytics.trackEvent('gallery', 'view', galleryId, imageCount);
        }
    };

    // 自动初始化（可选）
    // if (GA4Config.measurementId !== 'G-XXXXXXXXXX') {
    //     GA4Analytics.init();
    // }

})();
