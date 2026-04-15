/**
 * 游导旅游广告管理系统
 * 广告加载、轮播、统计与过滤
 */

(function() {
    'use strict';

    // 广告配置
    const AdConfig = {
        // 防误点配置
        antiFraud: {
            minClickInterval: 1000,      // 最小点击间隔(毫秒)
            maxClicksPerDay: 50,         // 每天最大点击次数
            excludeBots: true,            // 排除机器人
            clickDelay: 300               // 点击延迟确认(毫秒)
        },
        // 统计配置
        stats: {
            trackImpressions: true,
            trackClicks: true,
            trackHoverTime: true,
            sessionTimeout: 1800000      // 30分钟会话超时
        },
        // 轮播配置
        carousel: {
            defaultInterval: 5000,
            transitionDuration: 500,
            pauseOnHover: true
        }
    };

    // 广告状态存储
    let AdState = {
        impressions: {},
        clicks: {},
        lastClickTime: {},
        clickCount: {},
        currentSlide: {},
        isPaused: {},
        sessionId: null
    };

    /**
     * 初始化广告系统
     */
    function initAds() {
        generateSessionId();
        loadAdState();
        setupAntiFraud();
        setupVisibilityObserver();
        bindEventListeners();
        initAllCarousels();
        trackPageView();
        console.log('[AdSystem] 广告系统初始化完成');
    }

    /**
     * 生成会话ID
     */
    function generateSessionId() {
        if (!AdState.sessionId) {
            AdState.sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return AdState.sessionId;
    }

    /**
     * 加载广告状态
     */
    function loadAdState() {
        try {
            const saved = localStorage.getItem('adState');
            if (saved) {
                const parsed = JSON.parse(saved);
                AdState.clicks = parsed.clicks || {};
                AdState.clickCount = parsed.clickCount || {};
                AdState.currentSlide = parsed.currentSlide || {};
                // 清理过期数据
                cleanExpiredData();
            }
        } catch (e) {
            console.warn('[AdSystem] 无法加载广告状态:', e);
        }
    }

    /**
     * 保存广告状态
     */
    function saveAdState() {
        try {
            const toSave = {
                clicks: AdState.clicks,
                clickCount: AdState.clickCount,
                currentSlide: AdState.currentSlide,
                lastSave: Date.now()
            };
            localStorage.setItem('adState', JSON.stringify(toSave));
        } catch (e) {
            console.warn('[AdSystem] 无法保存广告状态:', e);
        }
    }

    /**
     * 清理过期数据
     */
    function cleanExpiredData() {
        const today = new Date().toDateString();
        const now = Date.now();
        
        // 清理旧点击数据
        Object.keys(AdState.clickCount).forEach(key => {
            if (key !== today) {
                delete AdState.clickCount[key];
            }
        });
        
        // 清理超过30分钟的点击间隔记录
        Object.keys(AdState.lastClickTime).forEach(key => {
            if (now - AdState.lastClickTime[key] > AdConfig.stats.sessionTimeout) {
                delete AdState.lastClickTime[key];
            }
        });
    }

    /**
     * 设置防欺诈机制
     */
    function setupAntiFraud() {
        // 阻止可疑的点击行为
        document.addEventListener('click', function(e) {
            const adElement = e.target.closest('[data-ad-slot]');
            if (!adElement) return;
            
            const slotId = adElement.dataset.adSlot;
            if (isSuspiciousClick(slotId)) {
                e.preventDefault();
                e.stopPropagation();
                showClickWarning();
                return false;
            }
        }, true);
    }

    /**
     * 检测可疑点击
     */
    function isSuspiciousClick(slotId) {
        const now = Date.now();
        const today = new Date().toDateString();

        // 检查今日点击次数
        if (!AdState.clickCount[today]) {
            AdState.clickCount[today] = 0;
        }
        if (AdState.clickCount[today] >= AdConfig.antiFraud.maxClicksPerDay) {
            return true;
        }

        // 检查点击间隔
        if (AdState.lastClickTime[slotId]) {
            const interval = now - AdState.lastClickTime[slotId];
            if (interval < AdConfig.antiFraud.minClickInterval) {
                return true;
            }
        }

        // 检测机器人特征
        if (AdConfig.antiFraud.excludeBots) {
            if (isBot()) return true;
        }

        return false;
    }

    /**
     * 检测机器人行为
     */
    function isBot() {
        // 简化的机器人检测
        const navInfo = navigator.userAgent;
        const suspiciousPatterns = [
            'bot', 'crawler', 'spider', 'curl', 'wget', 'headless', 'phantom'
        ];
        
        for (const pattern of suspiciousPatterns) {
            if (navInfo.toLowerCase().includes(pattern)) {
                return true;
            }
        }
        
        // 检测无头浏览器特征
        if (navigator.webdriver || window.callPhantom || window._phantom) {
            return true;
        }
        
        return false;
    }

    /**
     * 显示点击警告
     */
    function showClickWarning() {
        showToast('检测到异常点击行为，请稍后再试', 'warning');
    }

    /**
     * 设置可见性观察器
     */
    function setupVisibilityObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const adSlot = entry.target.closest('[data-ad-slot]');
                    if (!adSlot) return;
                    
                    const slotId = adSlot.dataset.adSlot;
                    
                    if (entry.isIntersecting) {
                        // 广告进入视口
                        recordImpression(slotId);
                        if (!AdState.isPaused[slotId]) {
                            startAutoPlay(slotId);
                        }
                    } else {
                        // 广告离开视口
                        stopAutoPlay(slotId);
                    }
                });
            }, {
                threshold: 0.5
            });

            document.querySelectorAll('[data-ad-slot]').forEach(el => {
                observer.observe(el);
            });
        }
    }

    /**
     * 绑定事件监听器
     */
    function bindEventListeners() {
        // 轮播箭头点击
        document.addEventListener('click', (e) => {
            const arrow = e.target.closest('.ad-carousel-arrow');
            if (arrow) {
                const carousel = arrow.closest('.ad-carousel');
                const slotId = carousel.dataset.adSlot;
                const direction = arrow.classList.contains('ad-carousel-arrow-prev') ? 'prev' : 'next';
                goToSlide(slotId, direction);
            }
        });

        // 广告点击
        document.addEventListener('click', (e) => {
            const adLink = e.target.closest('.ad-content-link');
            if (adLink) {
                e.preventDefault();
                const adSlot = adLink.closest('[data-ad-slot]');
                const slotId = adSlot.dataset.adSlot;
                const adIndex = parseInt(adSlot.dataset.adIndex) || 0;
                
                handleAdClick(slotId, adIndex, adLink.href);
            }
        });

        // 关闭按钮
        document.addEventListener('click', (e) => {
            const closeBtn = e.target.closest('.ad-close-btn');
            if (closeBtn) {
                const adSlot = closeBtn.closest('[data-ad-slot]');
                const slotId = adSlot.dataset.adSlot;
                closeAd(slotId);
            }
        });

        // 悬停统计
        document.addEventListener('mouseenter', (e) => {
            const adSlot = e.target.closest('[data-ad-slot]');
            if (adSlot) {
                const slotId = adSlot.dataset.adSlot;
                trackHoverTime(slotId, 'start');
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const adSlot = e.target.closest('[data-ad-slot]');
            if (adSlot) {
                const slotId = adSlot.dataset.adSlot;
                trackHoverTime(slotId, 'end');
            }
        }, true);
    }

    /**
     * 初始化所有轮播
     */
    function initAllCarousels() {
        document.querySelectorAll('.ad-carousel[data-ad-slot]').forEach(carousel => {
            const slotId = carousel.dataset.adSlot;
            AdState.currentSlide[slotId] = 0;
            AdState.isPaused[slotId] = false;
            
            // 初始显示
            updateCarouselDisplay(slotId);
            
            // 自动播放
            if (carousel.dataset.autoPlay !== 'false') {
                startAutoPlay(slotId);
            }
        });
    }

    /**
     * 开始自动播放
     */
    function startAutoPlay(slotId) {
        const carousel = document.querySelector(`.ad-carousel[data-ad-slot="${slotId}"]`);
        if (!carousel || AdState.isPaused[slotId]) return;

        const interval = parseInt(carousel.dataset.interval) || AdConfig.carousel.defaultInterval;
        
        carousel.dataset.autoPlayTimer = setInterval(() => {
            goToSlide(slotId, 'next');
        }, interval).toString();
    }

    /**
     * 停止自动播放
     */
    function stopAutoPlay(slotId) {
        const carousel = document.querySelector(`.ad-carousel[data-ad-slot="${slotId}"]`);
        if (!carousel) return;

        const timerId = carousel.dataset.autoPlayTimer;
        if (timerId) {
            clearInterval(parseInt(timerId));
            carousel.dataset.autoPlayTimer = null;
        }
    }

    /**
     * 切换幻灯片
     */
    function goToSlide(slotId, direction) {
        const carousel = document.querySelector(`.ad-carousel[data-ad-slot="${slotId}"]`);
        if (!carousel) return;

        const slides = carousel.querySelectorAll('.ad-carousel-item');
        if (slides.length <= 1) return;

        let current = AdState.currentSlide[slotId] || 0;
        let newIndex;

        if (direction === 'next') {
            newIndex = (current + 1) % slides.length;
        } else if (direction === 'prev') {
            newIndex = (current - 1 + slides.length) % slides.length;
        } else {
            newIndex = parseInt(direction);
        }

        AdState.currentSlide[slotId] = newIndex;
        updateCarouselDisplay(slotId);
    }

    /**
     * 更新轮播显示
     */
    function updateCarouselDisplay(slotId) {
        const carousel = document.querySelector(`.ad-carousel[data-ad-slot="${slotId}"]`);
        if (!carousel) return;

        const slides = carousel.querySelectorAll('.ad-carousel-item');
        const indicators = carousel.querySelectorAll('.ad-carousel-indicator');
        const current = AdState.currentSlide[slotId] || 0;

        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === current);
            slide.style.display = index === current ? 'block' : 'none';
        });

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === current);
        });
    }

    /**
     * 记录曝光
     */
    function recordImpression(slotId) {
        if (!AdConfig.stats.trackImpressions) return;

        const today = new Date().toDateString();
        if (!AdState.impressions[today]) {
            AdState.impressions[today] = {};
        }
        if (!AdState.impressions[today][slotId]) {
            AdState.impressions[today][slotId] = 0;
        }
        AdState.impressions[today][slotId]++;
        
        // 发送统计请求
        sendStats('impression', {
            slotId: slotId,
            sessionId: AdState.sessionId,
            timestamp: Date.now()
        });
    }

    /**
     * 处理广告点击
     */
    function handleAdClick(slotId, adIndex, targetUrl) {
        if (!AdConfig.stats.trackClicks) return;

        const now = Date.now();
        const today = new Date().toDateString();

        // 记录点击
        if (!AdState.clicks[today]) {
            AdState.clicks[today] = {};
        }
        if (!AdState.clicks[today][slotId]) {
            AdState.clicks[today][slotId] = [];
        }
        
        AdState.lastClickTime[slotId] = now;
        AdState.clickCount[today] = (AdState.clickCount[today] || 0) + 1;
        
        AdState.clicks[today][slotId].push({
            index: adIndex,
            time: now
        });

        saveAdState();

        // 发送统计请求
        sendStats('click', {
            slotId: slotId,
            adIndex: adIndex,
            sessionId: AdState.sessionId,
            timestamp: now
        });

        // 显示点击确认动画
        showClickAnimation(slotId);

        // 延迟跳转，防止误点
        setTimeout(() => {
            if (targetUrl) {
                window.open(targetUrl, '_blank');
            }
        }, AdConfig.antiFraud.clickDelay);
    }

    /**
     * 显示点击动画
     */
    function showClickAnimation(slotId) {
        const carousel = document.querySelector(`.ad-carousel[data-ad-slot="${slotId}"]`);
        if (!carousel) return;

        const indicator = carousel.querySelector('.ad-carousel-indicator.active');
        if (indicator) {
            indicator.classList.add('clicking');
            setTimeout(() => {
                indicator.classList.remove('clicking');
            }, 300);
        }
    }

    /**
     * 跟踪悬停时间
     */
    function trackHoverTime(slotId, action) {
        const key = `hover_${slotId}`;
        
        if (action === 'start') {
            AdState[key] = Date.now();
        } else if (action === 'end' && AdState[key]) {
            const duration = Date.now() - AdState[key];
            sendStats('hover', {
                slotId: slotId,
                duration: duration,
                timestamp: Date.now()
            });
            delete AdState[key];
        }
    }

    /**
     * 关闭广告
     */
    function closeAd(slotId) {
        const carousel = document.querySelector(`.ad-carousel[data-ad-slot="${slotId}"]`);
        if (!carousel) return;

        stopAutoPlay(slotId);
        carousel.style.display = 'none';
        
        // 记录关闭
        sendStats('close', {
            slotId: slotId,
            timestamp: Date.now()
        });

        // 如果是弹窗广告，设置会话标记
        if (carousel.classList.contains('ad-popup')) {
            sessionStorage.setItem(`ad_closed_${slotId}`, 'true');
        }

        showToast('广告已关闭');
    }

    /**
     * 发送统计数据
     */
    function sendStats(eventType, data) {
        // 实际项目中这里会发送到服务器
        console.log(`[AdStats] ${eventType}:`, data);
        
        // 模拟发送
        // fetch('/api/ad-stats', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ eventType, data, sessionId: AdState.sessionId })
        // });
    }

    /**
     * 跟踪页面浏览
     */
    function trackPageView() {
        sendStats('pageview', {
            url: window.location.href,
            referrer: document.referrer,
            timestamp: Date.now()
        });
    }

    /**
     * 加载广告内容
     */
    function loadAdContent(slotId, ads) {
        const carousel = document.querySelector(`.ad-carousel[data-ad-slot="${slotId}"]`);
        if (!carousel || !ads || ads.length === 0) return;

        const container = carousel.querySelector('.ad-carousel-slides');
        const indicators = carousel.querySelector('.ad-carousel-indicators');
        
        if (!container) return;

        // 清空现有内容
        container.innerHTML = '';
        if (indicators) indicators.innerHTML = '';

        // 生成广告幻灯片
        ads.forEach((ad, index) => {
            const slide = createAdSlide(ad, index, slotId);
            container.appendChild(slide);

            if (indicators) {
                const indicator = document.createElement('span');
                indicator.className = `ad-carousel-indicator${index === 0 ? ' active' : ''}`;
                indicators.appendChild(indicator);
            }
        });

        // 更新显示
        updateCarouselDisplay(slotId);
    }

    /**
     * 创建广告幻灯片
     */
    function createAdSlide(ad, index, slotId) {
        const slide = document.createElement('div');
        slide.className = `ad-carousel-item${index === 0 ? ' active' : ''}`;
        slide.style.display = index === 0 ? 'block' : 'none';

        const content = document.createElement('a');
        content.href = ad.targetUrl || '#';
        content.className = 'ad-content-link';
        content.target = '_blank';
        content.rel = 'noopener noreferrer';

        if (ad.type === 'image' || !ad.type) {
            content.innerHTML = `
                <img src="${ad.imageUrl}" alt="${ad.title || '广告'}" loading="lazy">
                <div class="ad-content-overlay">
                    <h4 class="ad-title">${ad.title || ''}</h4>
                    <p class="ad-description">${ad.description || ''}</p>
                    <span class="ad-cta">${ad.ctaText || '了解更多'}</span>
                </div>
            `;
        } else if (ad.type === 'video') {
            content.innerHTML = `
                <video src="${ad.videoUrl}" autoplay muted loop></video>
                <div class="ad-content-overlay">
                    <h4 class="ad-title">${ad.title || ''}</h4>
                </div>
            `;
        } else if (ad.type === 'text') {
            content.className += ' ad-text-only';
            content.innerHTML = `
                <div class="ad-text-content">
                    <h4 class="ad-title">${ad.title || ''}</h4>
                    <p class="ad-description">${ad.description || ''}</p>
                    <span class="ad-cta">${ad.ctaText || '点击查看'}</span>
                </div>
            `;
        }

        slide.appendChild(content);

        // 添加关闭按钮（如果是弹窗）
        const carousel = document.querySelector(`.ad-carousel[data-ad-slot="${slotId}"]`);
        if (carousel && carousel.classList.contains('ad-popup')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'ad-close-btn';
            closeBtn.innerHTML = '✕';
            closeBtn.setAttribute('aria-label', '关闭广告');
            slide.appendChild(closeBtn);
        }

        return slide;
    }

    /**
     * 显示提示消息
     */
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `ad-toast ad-toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    /**
     * 广告过滤检测
     */
    function checkAdFilter() {
        // 检测广告过滤插件
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox ad-banner';
        testAd.style.position = 'absolute';
        testAd.style.left = '-9999px';
        document.body.appendChild(testAd);

        const isBlocked = testAd.offsetHeight === 0 || 
                          getComputedStyle(testAd).display === 'none' ||
                          getComputedStyle(testAd).visibility === 'hidden';

        document.body.removeChild(testAd);

        if (isBlocked) {
            console.log('[AdSystem] 检测到广告过滤插件');
            sendStats('filter_detected', {
                timestamp: Date.now()
            });
        }

        return isBlocked;
    }

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAds);
    } else {
        initAds();
    }

    // 导出公共API
    window.AdSystem = {
        loadAdContent,
        goToSlide,
        startAutoPlay,
        stopAutoPlay,
        closeAd,
        recordImpression,
        checkAdFilter,
        getState: () => AdState,
        config: AdConfig
    };

})();
