/**
 * 游导旅游 - 统计分析模块使用示例
 * 
 * 此文件展示了如何在业务页面中集成和使用统计分析功能
 */

(function() {
    'use strict';

    // ============================================
    // 示例1: 页面初始化时引入统计脚本
    // ============================================
    
    // 在HTML的 </head> 前添加：
    /*
    <script src="js/analytics/init-analytics.js"></script>
    <script>
        // 可选：修改配置
        if (window.AnalyticsSetup) {
            window.AnalyticsSetup.baidu.enabled = true;
            window.AnalyticsSetup.baidu.siteId = 'your-site-id';
            window.AnalyticsSetup.ga4.enabled = true;
            window.AnalyticsSetup.ga4.measurementId = 'G-XXXXXXXXXX';
        }
    </script>
    */


    // ============================================
    // 示例2: 追踪用户登录
    // ============================================
    
    function handleLoginSuccess(userId, loginMethod) {
        // 使用统一接口追踪
        Analytics.onLogin(userId, loginMethod);
        
        // 或单独使用某个统计工具
        // BaiduEvents.onLogin(userId);
        // GA4Events.onLogin(userId, loginMethod);
    }


    // ============================================
    // 示例3: 追踪导游浏览
    // ============================================
    
    function trackGuideView(guideElement) {
        const guideId = guideElement.dataset.guideId;
        const guideName = guideElement.dataset.guideName;
        const guideType = guideElement.dataset.guideType || '普通导游';
        
        Analytics.onGuideView(guideId, guideName, guideType);
    }

    // 在导游卡片点击事件中使用
    document.addEventListener('click', function(e) {
        const guideCard = e.target.closest('.guide-card[data-guide-id]');
        if (guideCard) {
            trackGuideView(guideCard);
        }
    });


    // ============================================
    // 示例4: 追踪导游预约
    // ============================================
    
    function handleBookingSubmit(formData) {
        const guideId = formData.guideId;
        const guideName = formData.guideName;
        const price = parseFloat(formData.price);
        
        // 追踪预约事件
        Analytics.onGuideBooking(guideId, guideName, price);
    }


    // ============================================
    // 示例5: 追踪支付结果
    // ============================================
    
    function handlePaymentResult(result) {
        if (result.success) {
            const orderId = result.orderId;
            const amount = parseFloat(result.amount);
            
            // 追踪支付成功
            Analytics.onPaymentSuccess(orderId, amount, result.items);
        } else {
            // 追踪支付失败
            Analytics.onPaymentFail(result.orderId, result.errorMessage);
        }
    }


    // ============================================
    // 示例6: 追踪搜索行为
    // ============================================
    
    function trackSearch(searchInput) {
        const keyword = searchInput.value.trim();
        if (keyword) {
            const resultCount = document.querySelectorAll('.search-result-item').length;
            Analytics.onSearch(keyword, resultCount);
        }
    }

    // 在搜索表单提交时使用
    document.addEventListener('submit', function(e) {
        if (e.target.matches('.search-form')) {
            e.preventDefault();
            const keyword = e.target.querySelector('input[name="keyword"]').value;
            if (keyword) {
                Analytics.onSearch(keyword, 0);
                // 执行搜索...
            }
        }
    });


    // ============================================
    // 示例7: 追踪分享行为
    // ============================================
    
    function handleShare(targetType, targetId, platform) {
        Analytics.onShare(targetType, targetId, platform);
    }

    // 分享按钮点击事件
    document.addEventListener('click', function(e) {
        const shareBtn = e.target.closest('[data-share]');
        if (shareBtn) {
            const targetType = shareBtn.dataset.share;
            const targetId = shareBtn.dataset.id;
            const platform = shareBtn.dataset.platform || 'unknown';
            handleShare(targetType, targetId, platform);
        }
    });


    // ============================================
    // 示例8: 追踪视频播放
    // ============================================
    
    function setupVideoTracking() {
        document.querySelectorAll('video').forEach(function(video) {
            video.addEventListener('play', function() {
                const videoId = video.id || video.dataset.videoId || 'unknown';
                const videoTitle = video.dataset.title || videoId;
                Analytics.onVideoPlay(videoId, videoTitle);
            });
        });
    }


    // ============================================
    // 示例9: 追踪页面滚动深度
    // ============================================
    
    // 自动追踪已由 custom-tracker.js 处理
    // 如需手动触发：
    CustomTracker.track('scroll_depth', {
        depth: Math.round((window.scrollY / document.body.scrollHeight) * 100)
    });


    // ============================================
    // 示例10: 使用自定义事件
    // ============================================
    
    // 追踪任何自定义事件
    Analytics.track('button_click', {
        button_name: '立即预约',
        button_position: 'hero_section',
        page: 'guide_detail'
    });

    Analytics.track('form_field_focus', {
        form_id: 'booking_form',
        field_name: 'travel_date'
    });


    // ============================================
    // 示例11: 生成UTM追踪链接
    // ============================================
    
    // 为推广活动生成追踪链接
    function generateCampaignLink(campaignName, channel, medium) {
        const baseUrl = 'https://youdao-travel.com/guides.html';
        return Analytics.generateUTMLink(baseUrl, {
            source: channel,
            medium: medium,
            campaign: campaignName,
            term: '',  // 可选
            content: ''  // 可选
        });
    }

    // 示例：生成百度推广链接
    const baiduLink = generateCampaignLink('spring_2024', 'baidu', 'cpc');
    console.log('百度推广链接:', baiduLink);


    // ============================================
    // 示例12: 获取渠道报告
    // ============================================
    
    function showChannelReport() {
        const report = Analytics.getChannelReport();
        console.table(report);
        
        report.forEach(function(channel) {
            console.log(
                `${channel.name}: 访问${channel.sessions}次, ` +
                `转化${channel.conversions}次, ` +
                `ROI: ${channel.roi}%`
            );
        });
    }


    // ============================================
    // 示例13: 获取漏斗报告
    // ============================================
    
    function showFunnelReport() {
        const funnelNames = ['guideBooking', 'registration', 'routeBooking'];
        
        funnelNames.forEach(function(name) {
            const report = Analytics.getFunnelReport(name);
            if (report) {
                console.log(`\n=== ${report.funnelName} 漏斗报告 ===`);
                report.steps.forEach(function(step) {
                    console.log(
                        `步骤${step.step}: ${step.name} - ` +
                        `转化${step.conversions}次, 流失${step.dropOffs}次`
                    );
                });
                console.log(`整体转化率: ${report.overallConversionRate}`);
            }
        });
    }


    // ============================================
    // 示例14: 获取统计摘要
    // ============================================
    
    function showStatsSummary() {
        const summary = Analytics.getSummary();
        console.log('当前页面统计摘要:', summary);
    }


    // ============================================
    // 示例15: 在特定页面初始化追踪
    // ============================================
    
    function initPageTracking() {
        const pageName = window.location.pathname.split('/').pop() || 'index';
        
        switch (pageName) {
            case 'guide-detail.html':
                // 导游详情页额外追踪
                trackGuideDetailView();
                break;
                
            case 'route-booking.html':
                // 路线预订页追踪
                trackBookingPage();
                break;
                
            case 'payment.html':
                // 支付页追踪
                trackPaymentPage();
                break;
                
            default:
                // 其他页面基础追踪
                break;
        }
    }

    function trackGuideDetailView() {
        const guideId = document.querySelector('[data-guide-id]')?.dataset.guideId;
        const guideName = document.querySelector('.guide-name')?.textContent;
        const guideType = document.querySelector('[data-guide-type]')?.dataset.guideType;
        
        if (guideId) {
            Analytics.onGuideView(guideId, guideName, guideType);
        }
    }

    function trackBookingPage() {
        // 追踪预订表单开始填写
        document.querySelectorAll('.booking-form input, .booking-form select').forEach(function(input) {
            input.addEventListener('focus', function() {
                Analytics.track('booking_form_focus', {
                    field: input.name,
                    guide_id: document.querySelector('[data-guide-id]')?.dataset.guideId
                });
            }, { once: true });
        });
    }

    function trackPaymentPage() {
        const orderId = document.querySelector('[data-order-id]')?.dataset.orderId;
        const amount = document.querySelector('[data-amount]')?.dataset.amount;
        
        Analytics.track('payment_page_view', { orderId, amount });
    }


    // ============================================
    // 示例16: 设置用户属性（登录后）
    // ============================================
    
    function setUserProperties(userData) {
        // 设置用户类型
        if (window.GA4Analytics) {
            GA4Analytics.setUserProperty('user_type', userData.isVip ? 'vip' : 'normal');
            GA4Analytics.setUserProperty('membership_level', userData.level || 'none');
            GA4Analytics.setUserProperty('total_bookings', userData.bookingCount || 0);
        }
        
        // 设置百度统计用户属性
        if (window.BaiduTongji) {
            BaiduTongji.setUserProperty('user_type', userData.isVip ? 'vip' : 'normal');
        }
    }


    // ============================================
    // 示例17: 追踪错误
    // ============================================
    
    window.addEventListener('error', function(e) {
        Analytics.track('javascript_error', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            page: window.location.href
        });
    });

    window.addEventListener('unhandledrejection', function(e) {
        Analytics.track('promise_error', {
            message: e.reason?.message || 'Unknown error',
            page: window.location.href
        });
    });


    // ============================================
    // 示例18: API请求错误追踪
    // ============================================
    
    function trackAPIError(endpoint, status, message) {
        Analytics.track('api_error', {
            endpoint: endpoint,
            status: status,
            message: message,
            page: window.location.pathname
        });
    }

    // 使用fetch时自动追踪错误
    const originalFetch = window.fetch;
    window.fetch = function() {
        return originalFetch.apply(this, arguments)
            .then(function(response) {
                if (!response.ok) {
                    trackAPIError(
                        arguments[0],
                        response.status,
                        response.statusText
                    );
                }
                return response;
            });
    };


    // ============================================
    // 初始化页面追踪
    // ============================================
    
    document.addEventListener('DOMContentLoaded', function() {
        initPageTracking();
        setupVideoTracking();
    });

})();
