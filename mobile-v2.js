/* ===================================
   移动端优化脚本 v2.0
   功能：触摸手势、下拉刷新、底部导航、快捷操作
   =================================== */

(function() {
  'use strict';

  // 设备检测
  const DeviceInfo = {
    isTouch: ('ontouchstart' in window) || navigator.maxTouchPoints > 0,
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    isSafari: /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor),
    
    // 获取当前设备类型
    getDeviceType() {
      const width = window.innerWidth;
      if (width <= 480) return 'xs';
      if (width <= 768) return 'sm';
      if (width <= 1024) return 'md';
      if (width <= 1280) return 'lg';
      return 'xl';
    },
    
    // 检测是否为PWA环境
    isPWA() {
      return window.matchMedia('(display-mode: standalone)').matches || 
             window.navigator.standalone === true;
    },
    
    // 检测深色模式
    isDarkMode() {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    },
    
    // 检测减少动画偏好
    prefersReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  };

  // 视口高度修正（解决移动端地址栏问题）
  function setViewportHeight() {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH, { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100);
    }, { passive: true });
  }

  // 下拉刷新功能
  const PullToRefresh = {
    element: null,
    startY: 0,
    currentY: 0,
    isPulling: false,
    isRefreshing: false,
    threshold: 80,
    
    init(element) {
      this.element = element;
      if (!this.element) return;
      
      // 触摸事件
      this.element.addEventListener('touchstart', (e) => this.onStart(e), { passive: true });
      this.element.addEventListener('touchmove', (e) => this.onMove(e), { passive: true });
      this.element.addEventListener('touchend', (e) => this.onEnd(e), { passive: true });
      
      // 创建刷新指示器
      this.createIndicator();
    },
    
    createIndicator() {
      if (document.getElementById('ptr-indicator')) return;
      
      const indicator = document.createElement('div');
      indicator.id = 'ptr-indicator';
      indicator.className = 'ptr-indicator';
      indicator.innerHTML = `
        <div class="ptr-indicator-content">
          <div class="ptr-spinner"></div>
          <span class="ptr-text">下拉刷新</span>
        </div>
      `;
      indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 0;
        overflow: hidden;
        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: height 0.3s ease;
        z-index: 10001;
      `;
      document.body.appendChild(indicator);
      
      // 添加样式
      const style = document.createElement('style');
      style.textContent = `
        .ptr-indicator-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .ptr-indicator.show .ptr-indicator-content {
          opacity: 1;
        }
        .ptr-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: ptr-spin 0.8s linear infinite;
        }
        .ptr-text {
          font-size: 12px;
          font-weight: 500;
        }
        @keyframes ptr-spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    },
    
    onStart(e) {
      if (this.isRefreshing) return;
      if (window.scrollY > 0) return;
      
      this.startY = e.touches[0].clientY;
      this.isPulling = true;
    },
    
    onMove(e) {
      if (!this.isPulling || this.isRefreshing) return;
      if (window.scrollY > 0) return;
      
      this.currentY = e.touches[0].clientY;
      const pullDistance = Math.max(0, this.currentY - this.startY);
      
      if (pullDistance > 0) {
        e.preventDefault();
        const indicator = document.getElementById('ptr-indicator');
        const height = Math.min(pullDistance * 0.5, this.threshold * 1.5);
        indicator.style.height = `${height}px`;
        indicator.classList.add('show');
        
        // 更新文字
        const text = indicator.querySelector('.ptr-text');
        if (pullDistance > this.threshold) {
          text.textContent = '释放刷新';
        } else {
          text.textContent = '下拉刷新';
        }
      }
    },
    
    onEnd(e) {
      if (!this.isPulling) return;
      
      this.isPulling = false;
      const indicator = document.getElementById('ptr-indicator');
      
      const pullDistance = this.currentY - this.startY;
      
      if (pullDistance > this.threshold) {
        // 触发刷新
        this.isRefreshing = true;
        indicator.style.height = '60px';
        indicator.querySelector('.ptr-text').textContent = '刷新中...';
        
        // 触发自定义事件
        this.element.dispatchEvent(new CustomEvent('pulltorefresh', {
          bubbles: true
        }));
        
        // 模拟刷新完成
        setTimeout(() => {
          this.isRefreshing = false;
          indicator.style.height = '0';
          setTimeout(() => {
            indicator.classList.remove('show');
          }, 300);
        }, 1500);
      } else {
        indicator.style.height = '0';
        setTimeout(() => {
          indicator.classList.remove('show');
        }, 300);
      }
    }
  };

  // 底部导航栏管理
  const BottomNavigation = {
    init() {
      if (!DeviceInfo.isMobile) return;
      
      // 检测当前页面并高亮
      this.highlightCurrent();
      
      // 添加安全区域padding
      this.setupSafeArea();
      
      // 监听路由变化
      this.watchRouteChanges();
    },
    
    highlightCurrent() {
      const nav = document.querySelector('.bottom-nav');
      if (!nav) return;
      
      const links = nav.querySelectorAll('a');
      const currentPath = window.location.pathname;
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || 
            (href !== '/' && currentPath.includes(href))) {
          link.classList.add('active');
        }
      });
    },
    
    setupSafeArea() {
      if (CSS.supports('padding: env(safe-area-inset-bottom)')) {
        const nav = document.querySelector('.bottom-nav');
        if (nav) {
          nav.style.paddingBottom = 'env(safe-area-inset-bottom)';
        }
      }
    },
    
    watchRouteChanges() {
      // SPA路由监听
      let lastUrl = window.location.href;
      const observer = new MutationObserver(() => {
        if (window.location.href !== lastUrl) {
          lastUrl = window.location.href;
          this.highlightCurrent();
        }
      });
      
      observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
    }
  };

  // 触摸手势管理器
  const TouchGestures = {
    handlers: {},
    
    init() {
      if (!DeviceInfo.isTouch) return;
      
      // 双击缩放
      this.setupDoubleTap();
      
      // 滑动手势
      this.setupSwipe();
      
      // 长按菜单
      this.setupLongPress();
    },
    
    setupDoubleTap() {
      let lastTouchEnd = 0;
      const doubleTapDelay = 300;
      
      document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= doubleTapDelay) {
          e.preventDefault();
          this.emit('doubletap', {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY,
            target: e.target
          });
        }
        lastTouchEnd = now;
      }, { passive: false });
    },
    
    setupSwipe() {
      let startX, startY, startTime;
      const minSwipeDistance = 50;
      const maxSwipeTime = 500;
      
      document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
      }, { passive: true });
      
      document.addEventListener('touchend', (e) => {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = endX - startX;
        const diffY = endY - startY;
        const swipeTime = Date.now() - startTime;
        
        // 判断滑动方向
        if (swipeTime <= maxSwipeTime) {
          const absX = Math.abs(diffX);
          const absY = Math.abs(diffY);
          
          if (absX > absY && absX > minSwipeDistance) {
            // 水平滑动
            this.emit('swipe', {
              direction: diffX > 0 ? 'right' : 'left',
              distance: absX,
              startX, startY, endX, endY
            });
          } else if (absY > absX && absY > minSwipeDistance) {
            // 垂直滑动
            this.emit('swipe', {
              direction: diffY > 0 ? 'down' : 'up',
              distance: absY,
              startX, startY, endX, endY
            });
          }
        }
      }, { passive: true });
    },
    
    setupLongPress() {
      const longPressElements = document.querySelectorAll('[data-long-press]');
      
      longPressElements.forEach(el => {
        let pressTimer = null;
        
        el.addEventListener('touchstart', (e) => {
          pressTimer = setTimeout(() => {
            el.classList.add('long-press-active');
            this.emit('longpress', {
              target: el,
              x: e.touches[0].clientX,
              y: e.touches[0].clientY
            });
          }, 500);
        }, { passive: true });
        
        el.addEventListener('touchend', () => {
          clearTimeout(pressTimer);
          el.classList.remove('long-press-active');
        });
        
        el.addEventListener('touchmove', () => {
          clearTimeout(pressTimer);
          el.classList.remove('long-press-active');
        });
      });
    },
    
    on(event, handler) {
      if (!this.handlers[event]) {
        this.handlers[event] = [];
      }
      this.handlers[event].push(handler);
    },
    
    emit(event, data) {
      if (this.handlers[event]) {
        this.handlers[event].forEach(handler => handler(data));
      }
    }
  };

  // 移动端模态框
  const MobileModal = {
    activeModal: null,
    
    init() {
      // 模态框打开按钮
      document.querySelectorAll('[data-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
          const modalId = btn.dataset.modal;
          this.open(modalId);
        });
      });
      
      // 模态框关闭按钮
      document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => this.close());
      });
      
      // ESC关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.activeModal) {
          this.close();
        }
      });
      
      // 点击背景关闭
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('mobile-modal')) {
          this.close();
        }
      });
    },
    
    open(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      
      this.activeModal = modal;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      
      // 动画入场
      requestAnimationFrame(() => {
        modal.classList.add('show');
      });
      
      // 触发打开事件
      modal.dispatchEvent(new CustomEvent('modal:open'));
    },
    
    close() {
      if (!this.activeModal) return;
      
      const modal = this.activeModal;
      modal.classList.remove('show');
      
      setTimeout(() => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.activeModal = null;
      }, 300);
      
      // 触发关闭事件
      modal.dispatchEvent(new CustomEvent('modal:close'));
    }
  };

  // 移动端表单增强
  const MobileForms = {
    init() {
      if (!DeviceInfo.isMobile) return;
      
      // iOS日期输入优化
      this.setupDateInputs();
      
      // 自动聚焦优化
      this.setupAutoFocus();
      
      // 输入验证反馈
      this.setupValidation();
    },
    
    setupDateInputs() {
      const dateInputs = document.querySelectorAll('input[type="date"], input[type="time"], input[type="datetime-local"]');
      
      dateInputs.forEach(input => {
        // 确保iOS上显示正确
        input.addEventListener('focus', () => {
          input.style.minHeight = '48px';
        });
      });
    },
    
    setupAutoFocus() {
      const autoFocusInputs = document.querySelectorAll('[autofocus]');
      
      autoFocusInputs.forEach(input => {
        // 移动端延迟聚焦，避免键盘遮挡
        setTimeout(() => {
          input.focus();
        }, 300);
      });
    },
    
    setupValidation() {
      const forms = document.querySelectorAll('form');
      
      forms.forEach(form => {
        form.addEventListener('submit', (e) => {
          if (!form.checkValidity()) {
            e.preventDefault();
            this.showValidationErrors(form);
          }
        });
      });
    },
    
    showValidationErrors(form) {
      const invalidInputs = form.querySelectorAll(':invalid');
      
      invalidInputs.forEach(input => {
        input.classList.add('error');
        
        // 创建错误提示
        const errorEl = document.createElement('div');
        errorEl.className = 'field-error';
        errorEl.textContent = input.validationMessage;
        
        // 插入错误提示
        if (!input.parentNode.querySelector('.field-error')) {
          input.parentNode.appendChild(errorEl);
        }
        
        // 移除错误标记
        input.addEventListener('input', () => {
          input.classList.remove('error');
          const error = input.parentNode.querySelector('.field-error');
          if (error) error.remove();
        }, { once: true });
      });
      
      // 滚动到第一个错误
      if (invalidInputs.length > 0) {
        invalidInputs[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // 移动端滚动行为
  const MobileScroll = {
    init() {
      if (!DeviceInfo.isMobile) return;
      
      // 平滑滚动到锚点
      this.setupSmoothScroll();
      
      // 滚动时隐藏/显示底部导航
      this.setupNavAutoHide();
      
      // 无限滚动加载
      this.setupInfiniteScroll();
    },
    
    setupSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href');
          if (targetId === '#') return;
          
          const target = document.querySelector(targetId);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
            
            // 更新URL
            history.pushState(null, '', targetId);
          }
        });
      });
    },
    
    setupNavAutoHide() {
      const nav = document.querySelector('.bottom-nav');
      if (!nav) return;
      
      let lastScrollY = window.scrollY;
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
              // 向下滚动 - 隐藏导航
              nav.classList.add('hidden');
            } else {
              // 向上滚动 - 显示导航
              nav.classList.remove('hidden');
            }
            
            lastScrollY = currentScrollY;
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    },
    
    setupInfiniteScroll() {
      const loadMoreElements = document.querySelectorAll('[data-infinite-scroll]');
      
      if (loadMoreElements.length === 0) return;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.dispatchEvent(new CustomEvent('loadmore'));
          }
        });
      }, {
        rootMargin: '200px'
      });
      
      loadMoreElements.forEach(el => observer.observe(el));
    }
  };

  // 设备方向监听
  const OrientationHandler = {
    currentOrientation: 'portrait',
    
    init() {
      this.updateOrientation();
      
      window.addEventListener('orientationchange', () => {
        setTimeout(() => this.updateOrientation(), 100);
      });
      
      window.addEventListener('resize', () => {
        this.updateOrientation();
      });
    },
    
    updateOrientation() {
      const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      
      if (orientation !== this.currentOrientation) {
        this.currentOrientation = orientation;
        document.body.classList.remove('portrait', 'landscape');
        document.body.classList.add(orientation);
        
        // 触发事件
        document.dispatchEvent(new CustomEvent('orientationchange', {
          detail: { orientation }
        }));
      }
    }
  };

  // 网络状态监听
  const NetworkStatus = {
    isOnline: navigator.onLine,
    
    init() {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.showStatus('已恢复网络连接', 'success');
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.showStatus('当前无网络连接', 'warning');
      });
    },
    
    showStatus(message, type) {
      // 移除已有提示
      const existing = document.getElementById('network-status');
      if (existing) existing.remove();
      
      const status = document.createElement('div');
      status.id = 'network-status';
      status.className = `network-status network-status-${type}`;
      status.innerHTML = `
        <span class="network-status-icon">${type === 'success' ? '✓' : '⚡'}</span>
        <span class="network-status-text">${message}</span>
      `;
      
      // 样式
      const bgColors = {
        success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
      };
      
      status.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColors[type]};
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: statusSlideIn 0.3s ease;
      `;
      
      // 添加动画
      const style = document.createElement('style');
      style.textContent = `
        @keyframes statusSlideIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes statusSlideOut {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
      `;
      if (!document.querySelector('style[data-id="network-status"]')) {
        style.setAttribute('data-id', 'network-status');
        document.head.appendChild(style);
      }
      
      document.body.appendChild(status);
      
      // 自动隐藏
      setTimeout(() => {
        status.style.animation = 'statusSlideOut 0.3s ease forwards';
        setTimeout(() => status.remove(), 300);
      }, 3000);
    }
  };

  // 初始化所有移动端功能
  function initMobile() {
    setViewportHeight();
    BottomNavigation.init();
    MobileModal.init();
    MobileForms.init();
    MobileScroll.init();
    OrientationHandler.init();
    NetworkStatus.init();
    
    // 初始化下拉刷新
    const mainContent = document.querySelector('.mobile-content') || 
                        document.querySelector('main') || 
                        document.body;
    PullToRefresh.init(mainContent);
    
    // 初始化触摸手势
    TouchGestures.init();
    
    // 添加设备类名
    document.body.classList.add(`device-${DeviceInfo.getDeviceType()}`);
    if (DeviceInfo.isTouch) document.body.classList.add('touch-device');
    if (DeviceInfo.isPWA()) document.body.classList.add('pwa-mode');
    if (DeviceInfo.isDarkMode()) document.body.classList.add('dark-mode');
    if (DeviceInfo.prefersReducedMotion()) document.body.classList.add('reduced-motion');
    
    // 防抖处理resize事件
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        DeviceInfo.isMobile = window.innerWidth <= 768;
        DeviceInfo.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        DeviceInfo.isDesktop = window.innerWidth > 1024;
        
        document.body.classList.remove('device-xs', 'device-sm', 'device-md', 'device-lg', 'device-xl');
        document.body.classList.add(`device-${DeviceInfo.getDeviceType()}`);
      }, 250);
    });
    
    console.log('[Mobile] 移动端功能已初始化', DeviceInfo);
  }

  // DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobile);
  } else {
    initMobile();
  }

  // 导出全局对象
  window.MobileUtils = {
    DeviceInfo,
    PullToRefresh,
    BottomNavigation,
    TouchGestures,
    MobileModal,
    MobileForms,
    MobileScroll,
    NetworkStatus
  };

})();
