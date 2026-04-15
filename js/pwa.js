/**
 * 游导旅游 PWA 初始化脚本
 * 版本: 1.0.0
 */

(function() {
  'use strict';

  // PWA 状态管理
  const PWA = {
    swRegistration: null,
    isInstalled: false,
    isOnline: navigator.onLine,
    updateAvailable: false,

    // 初始化
    async init() {
      console.log('[PWA] 初始化中...');
      
      // 检测是否已安装
      this.isInstalled = this.checkInstalled();
      
      // 监听网络状态
      this.setupNetworkListeners();
      
      // 注册 Service Worker
      if ('serviceWorker' in navigator) {
        await this.registerServiceWorker();
      }
      
      // 监听安装提示
      this.setupInstallPrompt();
      
      // 初始化推送通知
      await this.initPushNotifications();
      
      // 更新已访问的页面缓存
      this.trackVisitedPages();
      
      console.log('[PWA] 初始化完成', { isInstalled: this.isInstalled, isOnline: this.isOnline });
    },

    // 检测是否已安装
    checkInstalled() {
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone === true ||
             document.referrer.includes('android-app://');
    },

    // 注册 Service Worker
    async registerServiceWorker() {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('[PWA] Service Worker 注册成功');
        
        // 检查更新
        this.swRegistration.addEventListener('updatefound', () => {
          console.log('[PWA] 发现新版本');
          this.updateAvailable = true;
          this.notifyUpdate();
        });
        
        // 监听消息
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleSWMessage(event.data);
        });
        
        // 立即检查更新
        if (this.swRegistration.active) {
          this.swRegistration.active.postMessage({ type: 'GET_VERSION' });
        }
        
      } catch (error) {
        console.error('[PWA] Service Worker 注册失败:', error);
      }
    },

    // 设置网络监听
    setupNetworkListeners() {
      window.addEventListener('online', () => {
        console.log('[PWA] 网络已连接');
        this.isOnline = true;
        this.showToast('网络已连接', 'success');
        document.body.classList.remove('offline-mode');
      });

      window.addEventListener('offline', () => {
        console.log('[PWA] 网络已断开');
        this.isOnline = false;
        this.showToast('已进入离线模式', 'warning');
        document.body.classList.add('offline-mode');
      });
    },

    // 设置安装提示
    setupInstallPrompt() {
      let deferredPrompt = null;
      
      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('[PWA] 安装提示事件触发');
        e.preventDefault();
        deferredPrompt = e;
        
        // 显示安装按钮
        this.showInstallButton(deferredPrompt);
      });

      window.addEventListener('appinstalled', () => {
        console.log('[PWA] 应用已安装');
        this.isInstalled = true;
        deferredPrompt = null;
        this.hideInstallButton();
        this.showToast('安装成功！开始在主屏幕使用游导旅游', 'success');
        
        // 发送分析事件
        this.trackEvent('pwa_install');
      });
    },

    // 显示安装按钮
    showInstallButton(deferredPrompt) {
      let installBtn = document.getElementById('pwa-install-btn');
      
      if (!installBtn) {
        installBtn = document.createElement('button');
        installBtn.id = 'pwa-install-btn';
        installBtn.className = 'pwa-install-btn';
        installBtn.innerHTML = `
          <span class="icon">📱</span>
          <span class="text">安装应用</span>
        `;
        installBtn.style.cssText = `
          position: fixed;
          bottom: 100px;
          right: 20px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 4px 20px rgba(249, 115, 22, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
          animation: pwa-pulse 2s infinite;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pwa-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .pwa-install-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 25px rgba(249, 115, 22, 0.5);
          }
          .pwa-install-btn .icon { font-size: 18px; }
          @media (max-width: 640px) {
            .pwa-install-btn {
              bottom: 20px;
              right: 16px;
              padding: 10px 16px;
              font-size: 13px;
            }
          }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(installBtn);
        
        installBtn.addEventListener('click', async () => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('[PWA] 安装结果:', outcome);
            deferredPrompt = null;
            this.hideInstallButton();
          }
        });
      }
      
      installBtn.style.display = 'flex';
    },

    // 隐藏安装按钮
    hideInstallButton() {
      const installBtn = document.getElementById('pwa-install-btn');
      if (installBtn) {
        installBtn.style.display = 'none';
      }
    },

    // 通知有新版本
    notifyUpdate() {
      const updateBanner = document.createElement('div');
      updateBanner.id = 'pwa-update-banner';
      updateBanner.innerHTML = `
        <div class="update-content">
          <span class="icon">🔄</span>
          <span class="message">发现新版本可用</span>
        </div>
        <button class="update-btn" onclick="window.pwaUtils.update()">立即更新</button>
        <button class="close-btn" onclick="this.parentElement.remove()">×</button>
      `;
      
      const style = document.createElement('style');
      style.textContent = `
        #pwa-update-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          font-size: 14px;
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        .update-content { display: flex; align-items: center; gap: 8px; }
        .update-btn {
          padding: 6px 16px;
          background: white;
          color: #10b981;
          border: none;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          opacity: 0.8;
        }
        .close-btn:hover { opacity: 1; }
      `;
      document.head.appendChild(style);
      document.body.appendChild(updateBanner);
    },

    // 初始化推送通知
    async initPushNotifications() {
      if (!('Notification' in window)) {
        console.log('[PWA] 此浏览器不支持通知');
        return;
      }

      // 检查权限状态
      const permission = Notification.permission;
      
      if (permission === 'granted') {
        console.log('[PWA] 通知权限已授权');
        await this.subscribeToPush();
      } else if (permission === 'denied') {
        console.log('[PWA] 通知权限被拒绝');
      }
    },

    // 请求通知权限
    async requestNotificationPermission() {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          this.showToast('已开启推送通知', 'success');
          await this.subscribeToPush();
          return true;
        } else {
          this.showToast('通知权限被拒绝', 'error');
          return false;
        }
      } catch (error) {
        console.error('[PWA] 请求通知权限失败:', error);
        return false;
      }
    },

    // 订阅推送
    async subscribeToPush() {
      if (!this.swRegistration) return;

      try {
        const subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U')
        });
        
        console.log('[PWA] 推送订阅成功:', subscription);
        this.saveSubscription(subscription);
        return subscription;
      } catch (error) {
        console.error('[PWA] 推送订阅失败:', error);
        return null;
      }
    },

    // 保存订阅到服务器
    async saveSubscription(subscription) {
      // 由于是纯前端项目，这里使用 localStorage 模拟保存
      localStorage.setItem('pwa_push_subscription', JSON.stringify(subscription));
      console.log('[PWA] 订阅已保存');
    },

    // 工具函数：Base64 转 Uint8Array
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    },

    // 处理 Service Worker 消息
    handleSWMessage(data) {
      console.log('[PWA] 收到 SW 消息:', data);
      
      switch (data.type) {
        case 'SYNC_COMPLETE':
          this.showToast(data.message, 'success');
          break;
        case 'VERSION':
          console.log('[PWA] SW 版本:', data.version);
          break;
      }
    },

    // 更新应用
    async update() {
      if (!this.swRegistration) return;
      
      try {
        await this.swRegistration.unregister();
        window.location.reload();
      } catch (error) {
        console.error('[PWA] 更新失败:', error);
      }
    },

    // 显示 Toast 提示
    showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = `pwa-toast toast-${type}`;
      
      const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
      };
      
      const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
      };
      
      toast.innerHTML = `
        <span class="icon" style="color: ${colors[type]}">${icons[type]}</span>
        <span class="message">${message}</span>
      `;
      
      const style = document.createElement('style');
      style.textContent = `
        .pwa-toast {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10001;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          background: white;
          border-radius: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          font-size: 14px;
          animation: toastIn 0.3s ease;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .pwa-toast .icon { font-size: 18px; }
        .pwa-toast .icon { font-weight: bold; }
      `;
      if (!document.querySelector('style[data-toast]')) {
        style.setAttribute('data-toast', 'true');
        document.head.appendChild(style);
      }
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'toastIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    },

    // 追踪访问的页面
    trackVisitedPages() {
      const visitedPages = JSON.parse(localStorage.getItem('visited_pages') || '[]');
      const currentPage = window.location.pathname;
      
      if (!visitedPages.includes(currentPage)) {
        visitedPages.push(currentPage);
        localStorage.setItem('visited_pages', JSON.stringify(visitedPages));
      }
    },

    // 追踪事件
    trackEvent(eventName, eventData = {}) {
      console.log('[PWA] 事件追踪:', eventName, eventData);
      // 可以接入分析服务
    },

    // 获取缓存状态
    async getCacheStatus() {
      if (!this.swRegistration) return null;
      
      const cacheNames = await caches.keys();
      return cacheNames;
    },

    // 获取已缓存页面
    async getCachedPages() {
      return new Promise((resolve) => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'GET_CACHED_PAGES' });
          navigator.serviceWorker.addEventListener('message', function handler(event) {
            if (event.data.type === 'CACHED_PAGES') {
              resolve(event.data.pages);
              navigator.serviceWorker.removeEventListener('message', handler);
            }
          });
        } else {
          resolve([]);
        }
      });
    },

    // 清除缓存
    async clearCache() {
      return new Promise((resolve) => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
          navigator.serviceWorker.addEventListener('message', function handler(event) {
            if (event.data.success) {
              resolve(true);
              navigator.serviceWorker.removeEventListener('message', handler);
            }
          });
        } else {
          resolve(false);
        }
      });
    }
  };

  // 暴露工具函数
  window.pwaUtils = {
    update: () => PWA.update(),
    showInstallPrompt: () => {
      const event = new Event('beforeinstallprompt');
      window.dispatchEvent(event);
    },
    requestPermission: () => PWA.requestNotificationPermission(),
    getCacheStatus: () => PWA.getCacheStatus(),
    getCachedPages: () => PWA.getCachedPages(),
    clearCache: () => PWA.clearCache(),
    isOnline: () => PWA.isOnline,
    isInstalled: () => PWA.isInstalled
  };

  // 启动 PWA
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PWA.init());
  } else {
    PWA.init();
  }

})();
