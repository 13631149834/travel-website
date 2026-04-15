/* ===================================
   PWA 完整功能模块 v2.0
   功能：离线缓存、安装提示、推送通知、后台同步
   =================================== */

(function() {
  'use strict';

  // PWA 配置
  const PWAConfig = {
    appName: '游导旅游',
    appShortName: '游导',
    appVersion: '2.0.0',
    enableNotifications: true,
    enableBackgroundSync: true,
    notificationInterval: 3600000, // 1小时
    cacheStrategy: 'stale-while-revalidate'
  };

  // ===== Service Worker 注册 =====
  async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });
        
        console.log('[PWA] Service Worker 注册成功', registration.scope);
        
        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateNotification();
            }
          });
        });
        
        return registration;
      } catch (error) {
        console.error('[PWA] Service Worker 注册失败', error);
        return null;
      }
    }
    return null;
  }

  // ===== 安装提示管理 =====
  const PWAInstall = {
    deferredPrompt: null,
    isInstalled: false,
    
    init() {
      this.checkInstalled();
      this.listenEvents();
    },
    
    checkInstalled() {
      this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone === true;
      
      if (this.isInstalled) {
        this.hideInstallButton();
      }
    },
    
    listenEvents() {
      // beforeinstallprompt 事件
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        
        // 检查是否应该显示
        if (!this.shouldShowPrompt()) return;
        
        this.showInstallBanner();
      });
      
      // appinstalled 事件
      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.isInstalled = true;
        this.hideInstallBanner();
        this.showSuccessToast();
        
        // 发送分析事件
        this.trackEvent('pwa_install');
      });
      
      // 显示模式变化
      window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
        this.isInstalled = e.matches;
        if (this.isInstalled) {
          this.hideInstallBanner();
        }
      });
    },
    
    shouldShowPrompt() {
      // 检查用户是否之前拒绝过
      const dismissedTime = localStorage.getItem('pwa_install_dismissed');
      if (dismissedTime) {
        const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
        if (hoursSinceDismissed < 24) return false;
      }
      
      // 检查是否在24小时内安装过
      const installedTime = localStorage.getItem('pwa_installed_time');
      if (installedTime) {
        const daysSinceInstalled = (Date.now() - parseInt(installedTime)) / (1000 * 60 * 60 * 24);
        if (daysSinceInstalled < 7) return false;
      }
      
      return true;
    },
    
    async showInstallBanner() {
      // 移除已存在的Banner
      this.hideInstallBanner();
      
      const banner = document.createElement('div');
      banner.id = 'pwa-install-banner';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-label', `安装 ${PWAConfig.appName}`);
      banner.innerHTML = `
        <div class="pwa-banner-content">
          <div class="pwa-banner-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="white" fill-opacity="0.2"/>
              <path d="M20 8L12 16V32H28V16L20 8Z" stroke="white" stroke-width="2" fill="none"/>
              <circle cx="20" cy="22" r="4" fill="white"/>
            </svg>
          </div>
          <div class="pwa-banner-text">
            <strong>添加到主屏幕</strong>
            <span>快速访问 · 离线浏览</span>
          </div>
          <button id="pwa-install-btn" class="pwa-btn-install">
            立即安装
          </button>
          <button id="pwa-dismiss-btn" class="pwa-btn-dismiss" aria-label="关闭">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="pwa-banner-progress" style="display: none;">
          <div class="pwa-progress-bar"></div>
        </div>
      `;
      
      // 添加样式
      this.injectStyles();
      
      document.body.appendChild(banner);
      
      // 触发动画
      requestAnimationFrame(() => {
        banner.classList.add('show');
      });
      
      // 绑定事件
      document.getElementById('pwa-install-btn').addEventListener('click', () => this.install());
      document.getElementById('pwa-dismiss-btn').addEventListener('click', () => this.dismiss());
      
      // 记录显示
      this.trackEvent('pwa_install_shown');
    },
    
    hideInstallBanner() {
      const banner = document.getElementById('pwa-install-banner');
      if (banner) {
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 300);
      }
    },
    
    injectStyles() {
      if (document.getElementById('pwa-install-styles')) return;
      
      const styles = document.createElement('style');
      styles.id = 'pwa-install-styles';
      styles.textContent = `
        #pwa-install-banner {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(249, 115, 22, 0.4);
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          max-width: calc(100vw - 32px);
          overflow: hidden;
        }
        
        #pwa-install-banner.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
        
        .pwa-banner-content {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 18px;
        }
        
        .pwa-banner-icon {
          flex-shrink: 0;
        }
        
        .pwa-banner-text {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .pwa-banner-text strong {
          font-size: 15px;
          font-weight: 600;
          white-space: nowrap;
        }
        
        .pwa-banner-text span {
          font-size: 12px;
          opacity: 0.9;
        }
        
        .pwa-btn-install {
          flex-shrink: 0;
          background: white;
          color: #f97316;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .pwa-btn-install:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .pwa-btn-install:active {
          transform: scale(0.98);
        }
        
        .pwa-btn-dismiss {
          flex-shrink: 0;
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        
        .pwa-btn-dismiss:hover {
          background: rgba(255,255,255,0.3);
        }
        
        .pwa-banner-progress {
          height: 3px;
          background: rgba(255,255,255,0.2);
        }
        
        .pwa-progress-bar {
          height: 100%;
          background: white;
          width: 0;
          transition: width 0.3s;
        }
        
        #pwa-install-banner.installing .pwa-progress-bar {
          animation: pwa-progress 2s ease forwards;
        }
        
        @keyframes pwa-progress {
          0% { width: 0; }
          100% { width: 100%; }
        }
        
        /* 成功提示 */
        #pwa-success-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%) translateY(-100px);
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 14px 24px;
          border-radius: 12px;
          z-index: 10001;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 15px;
          font-weight: 500;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        #pwa-success-toast.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
        
        /* 离线提示 */
        #pwa-offline-indicator {
          position: fixed;
          top: 70px;
          left: 50%;
          transform: translateX(-50%) translateY(-100px);
          background: linear-gradient(135deg, #64748b 0%, #475569 100%);
          color: white;
          padding: 12px 20px;
          border-radius: 25px;
          font-size: 14px;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 15px rgba(100, 116, 139, 0.4);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        #pwa-offline-indicator.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
        
        /* 更新提示 */
        #pwa-update-banner {
          position: fixed;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 14px 20px;
          border-radius: 12px;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        #pwa-update-banner.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
        
        @media (max-width: 480px) {
          .pwa-banner-content {
            flex-wrap: wrap;
          }
          
          .pwa-banner-text {
            flex-basis: calc(100% - 64px);
          }
          
          .pwa-btn-install {
            flex: 1;
          }
        }
      `;
      
      document.head.appendChild(styles);
    },
    
    async install() {
      if (!this.deferredPrompt) return;
      
      const banner = document.getElementById('pwa-install-banner');
      banner.classList.add('installing');
      document.getElementById('pwa-install-btn').textContent = '安装中...';
      
      // 显示进度
      const progress = banner.querySelector('.pwa-banner-progress');
      progress.style.display = 'block';
      
      // 触发安装提示
      this.deferredPrompt.prompt();
      
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_installed_time', Date.now().toString());
        this.trackEvent('pwa_install_accepted');
      } else {
        this.dismiss();
        this.trackEvent('pwa_install_declined');
      }
      
      this.deferredPrompt = null;
    },
    
    dismiss() {
      this.hideInstallBanner();
      localStorage.setItem('pwa_install_dismissed', Date.now().toString());
      this.trackEvent('pwa_install_dismissed');
    },
    
    showSuccessToast() {
      const toast = document.createElement('div');
      toast.id = 'pwa-success-toast';
      toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span>安装成功！开始在主屏幕使用</span>
      `;
      
      document.body.appendChild(toast);
      
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });
      
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    },
    
    hideInstallButton() {
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.remove();
    },
    
    trackEvent(name) {
      // 简单的分析事件追踪
      if (typeof gtag !== 'undefined') {
        gtag('event', name, { 'event_category': 'PWA' });
      }
      console.log('[PWA Track]', name);
    }
  };

  // ===== 更新通知 =====
  function showUpdateNotification() {
    let banner = document.getElementById('pwa-update-banner');
    if (banner) return;
    
    banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
      </svg>
      <span>发现新版本，刷新页面更新</span>
      <button id="pwa-update-btn" style="background: white; color: #3b82f6; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">
        立即更新
      </button>
    `;
    
    document.body.appendChild(banner);
    
    requestAnimationFrame(() => {
      banner.classList.add('show');
    });
    
    document.getElementById('pwa-update-btn').addEventListener('click', () => {
      window.location.reload();
    });
  }

  // ===== 离线/在线状态管理 =====
  const NetworkManager = {
    init() {
      this.updateStatus();
      
      window.addEventListener('online', () => this.onOnline());
      window.addEventListener('offline', () => this.onOffline());
    },
    
    updateStatus() {
      this.isOnline = navigator.onLine;
      document.body.classList.toggle('offline', !this.isOnline);
      document.body.classList.toggle('online', this.isOnline);
    },
    
    onOnline() {
      this.isOnline = true;
      document.body.classList.remove('offline');
      document.body.classList.add('online');
      
      this.showOfflineIndicator(false);
      
      // 触发同步
      if ('serviceWorker' in navigator && 'sync' in window.registration) {
        navigator.serviceWorker.ready.then(reg => {
          return reg.sync.register('sync-data');
        }).catch(err => {
          console.log('[PWA] 后台同步注册失败', err);
        });
      }
    },
    
    onOffline() {
      this.isOnline = false;
      document.body.classList.add('offline');
      document.body.classList.remove('online');
      
      this.showOfflineIndicator(true);
    },
    
    showOfflineIndicator(show) {
      let indicator = document.getElementById('pwa-offline-indicator');
      
      if (show) {
        if (!indicator) {
          indicator = document.createElement('div');
          indicator.id = 'pwa-offline-indicator';
          indicator.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/>
              <path d="M5 12.55a10.94 10.94 0 015.17-2.39"/>
              <path d="M10.71 5.05A16 16 0 0122.58 9"/>
              <path d="M1.42 9a15.91 15.91 0 014.7-2.88"/>
              <path d="M8.53 16.11a6 6 0 016.95 0"/>
              <circle cx="12" cy="20" r="1"/>
            </svg>
            <span>当前处于离线模式</span>
          `;
          document.body.appendChild(indicator);
        }
        
        requestAnimationFrame(() => {
          indicator.classList.add('show');
        });
      } else {
        if (indicator) {
          indicator.classList.remove('show');
          setTimeout(() => indicator.remove(), 300);
        }
      }
    }
  };

  // ===== 推送通知 =====
  const PushNotifications = {
    permission: 'default',
    
    async init() {
      if (!PWAConfig.enableNotifications) return;
      if (!('Notification' in window)) return;
      if (!('serviceWorker' in navigator)) return;
      
      this.permission = Notification.permission;
      
      if (this.permission === 'granted') {
        this.showPermissionStatus('已开启');
      } else if (this.permission === 'denied') {
        this.showPermissionStatus('已拒绝');
      } else {
        this.showEnableButton();
      }
    },
    
    async requestPermission() {
      try {
        const permission = await Notification.requestPermission();
        this.permission = permission;
        
        if (permission === 'granted') {
          this.showPermissionStatus('已开启');
          this.subscribeToPush();
        } else {
          this.showPermissionStatus('已拒绝');
        }
        
        return permission;
      } catch (error) {
        console.error('[PWA] 通知权限请求失败', error);
        return 'denied';
      }
    },
    
    async subscribeToPush() {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(PWAConfig.vapidPublicKey || 'YOUR_PUBLIC_KEY')
      });
      
      console.log('[PWA] 推送订阅成功', subscription.endpoint);
      
      // 发送到服务器
      // await fetch('/api/push/subscribe', {
      //   method: 'POST',
      //   body: JSON.stringify(subscription),
      //   headers: { 'Content-Type': 'application/json' }
      // });
    },
    
    showEnableButton() {
      const container = document.getElementById('notification-container');
      if (!container) return;
      
      container.innerHTML = `
        <button id="enable-notifications" class="notification-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span>开启推送通知</span>
        </button>
      `;
      
      document.getElementById('enable-notifications').addEventListener('click', () => {
        this.requestPermission();
      });
    },
    
    showPermissionStatus(status) {
      const container = document.getElementById('notification-container');
      if (!container) return;
      
      container.innerHTML = `
        <div class="notification-status">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span>通知: ${status}</span>
        </div>
      `;
    },
    
    async show(title, options = {}) {
      if (this.permission !== 'granted') return;
      
      const registration = await navigator.serviceWorker.ready;
      
      const defaultOptions = {
        icon: '/images/icon-192.png',
        badge: '/images/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
          url: options.url || '/'
        },
        actions: [
          { action: 'open', title: '查看' },
          { action: 'close', title: '关闭' }
        ]
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      registration.showNotification(title, mergedOptions);
    },
    
    // 工具方法
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
  };

  // ===== 分享 API =====
  const ShareManager = {
    async init() {
      if (!('share' in navigator)) {
        this.hideShareButton();
        return;
      }
      
      // Web Share API 可用
      document.addEventListener('click', async (e) => {
        const shareButton = e.target.closest('[data-share]');
        if (!shareButton) return;
        
        e.preventDefault();
        
        const shareData = {
          title: shareButton.dataset.title || document.title,
          text: shareButton.dataset.text || '',
          url: shareButton.dataset.url || window.location.href
        };
        
        try {
          await navigator.share(shareData);
          this.trackShare(shareData);
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('[Share] 分享失败', err);
          }
        }
      });
    },
    
    hideShareButton() {
      document.querySelectorAll('[data-share]').forEach(btn => {
        btn.style.display = 'none';
      });
    },
    
    trackShare(data) {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
          method: 'Web Share API',
          content_type: data.url,
          item_id: data.title
        });
      }
    }
  };

  // ===== 支付请求 API =====
  const PaymentRequest = {
    async canMakePayments() {
      if (!('PaymentRequest' in window)) return false;
      
      try {
        const request = new PaymentRequest([
          {
            supportedMethods: 'basic-card',
            data: {
              supportedNetworks: ['visa', 'mastercard', 'unionpay'],
              supportedTypes: ['credit', 'debit']
            }
          }
        ], {
          total: { label: '总计', amount: { currency: 'CNY', value: '0' } }
        });
        
        return await request.canMakePayment();
      } catch (e) {
        return false;
      }
    }
  };

  // ===== 后台同步 =====
  const BackgroundSync = {
    async register(tag = 'sync-data') {
      if (!('serviceWorker' in navigator)) return;
      if (!('sync' in window.registration)) return;
      
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(tag);
        console.log('[PWA] 后台同步已注册', tag);
      } catch (error) {
        console.error('[PWA] 后台同步注册失败', error);
      }
    }
  };

  // ===== 媒体查询功能检测 =====
  const FeatureDetection = {
    init() {
      this.detect = {
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        notifications: 'Notification' in window,
        paymentRequest: 'PaymentRequest' in window,
        share: 'share' in navigator,
        standalone: window.matchMedia('(display-mode: standalone)').matches,
        fullscreen: 'requestFullscreen' in document.documentElement,
        clipboard: 'clipboard' in navigator,
        storage: this.checkStorage(),
        connection: navigator.connection?.effectiveType || 'unknown'
      };
      
      // 添加特征类名
      Object.entries(this.detect).forEach(([feature, supported]) => {
        if (supported) {
          document.body.classList.add(`support-${feature}`);
        } else {
          document.body.classList.add(`no-support-${feature}`);
        }
      });
      
      console.log('[PWA] 功能检测结果', this.detect);
    },
    
    checkStorage() {
      try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    }
  };

  // ===== 初始化 =====
  async function initPWA() {
    // 功能检测
    FeatureDetection.init();
    
    // 注册 Service Worker
    const registration = await registerServiceWorker();
    window.registration = registration;
    
    // 安装提示
    PWAInstall.init();
    
    // 网络状态
    NetworkManager.init();
    
    // 推送通知
    PushNotifications.init();
    
    // 分享
    ShareManager.init();
    
    console.log('[PWA] 初始化完成');
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPWA);
  } else {
    initPWA();
  }

  // 导出全局对象
  window.PWA = {
    config: PWAConfig,
    install: PWAInstall,
    network: NetworkManager,
    notifications: PushNotifications,
    share: ShareManager,
    sync: BackgroundSync,
    features: FeatureDetection
  };

})();
