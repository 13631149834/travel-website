// PWA 安装提示组件
const PWAInstallPrompt = {
  deferredPrompt: null,
  isDismissed: false,

  init() {
    // 监听 beforeinstallprompt 事件
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // 监听 appinstalled 事件
    window.addEventListener('appinstalled', () => {
      this.hideInstallButton();
      this.showSuccessMessage();
      this.deferredPrompt = null;
    });

    // 检查是否已安装
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.hideInstallButton();
    }
  },

  showInstallButton() {
    if (this.isDismissed) return;
    
    // 检查是否已存在
    if (document.getElementById('pwa-install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="pwa-banner-content">
        <span class="pwa-banner-icon">🧭</span>
        <div class="pwa-banner-text">
          <strong>添加到桌面</strong>
          <span>快速访问游导旅游</span>
        </div>
        <button id="pwa-install-btn" class="pwa-btn-primary">安装</button>
        <button id="pwa-dismiss-btn" class="pwa-btn-secondary" aria-label="关闭">×</button>
      </div>
    `;

    // 添加样式
    if (!document.getElementById('pwa-styles')) {
      const style = document.createElement('style');
      style.id = 'pwa-styles';
      style.textContent = `
        #pwa-install-banner {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: pwa-slide-up 0.3s ease-out;
          max-width: 90vw;
        }
        @keyframes pwa-slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .pwa-banner-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pwa-banner-icon {
          font-size: 2rem;
          line-height: 1;
        }
        .pwa-banner-text {
          display: flex;
          flex-direction: column;
        }
        .pwa-banner-text strong {
          font-size: 1rem;
          font-weight: 600;
        }
        .pwa-banner-text span {
          font-size: 0.75rem;
          opacity: 0.9;
        }
        .pwa-btn-primary {
          background: white;
          color: #3b82f6;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .pwa-btn-primary:hover {
          transform: scale(1.05);
        }
        .pwa-btn-secondary {
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          font-size: 1.2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pwa-btn-secondary:hover {
          background: rgba(255,255,255,0.3);
        }
        #pwa-success-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          z-index: 10001;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: pwa-toast-in 0.3s ease-out;
        }
        @keyframes pwa-toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @media (max-width: 480px) {
          .pwa-banner-text span { display: none; }
          .pwa-btn-primary { padding: 8px 12px; font-size: 0.875rem; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(banner);

    // 绑定按钮事件
    document.getElementById('pwa-install-btn').addEventListener('click', () => this.install());
    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => this.dismiss());
  },

  async install() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted PWA install');
    } else {
      console.log('User dismissed PWA install');
      this.dismiss();
    }
    this.deferredPrompt = null;
  },

  dismiss() {
    this.isDismissed = true;
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.style.animation = 'pwa-slide-down 0.3s ease-out forwards';
      setTimeout(() => banner.remove(), 300);
    }
  },

  hideInstallButton() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.remove();
  },

  showSuccessMessage() {
    const toast = document.createElement('div');
    toast.id = 'pwa-success-toast';
    toast.textContent = '✓ 已成功安装到桌面！';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
};

// Service Worker 注册
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('[App] Service Worker registered:', registration.scope);
          
          // 检查更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 发现新版本
                showUpdateNotification();
              }
            });
          });
        })
        .catch(err => {
          console.log('[App] Service Worker registration failed:', err);
        });
    });

    // 离线检测
    window.addEventListener('offline', () => {
      showOfflineIndicator();
    });

    window.addEventListener('online', () => {
      hideOfflineIndicator();
    });
  }
}

function showUpdateNotification() {
  const updateBanner = document.createElement('div');
  updateBanner.id = 'pwa-update-banner';
  updateBanner.innerHTML = `
    <span>有新版本可用</span>
    <button onclick="location.reload()">刷新更新</button>
  `;
  updateBanner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #f59e0b;
    color: white;
    padding: 12px;
    text-align: center;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  `;
  document.body.appendChild(updateBanner);
}

function showOfflineIndicator() {
  // 如果已经有离线提示，不再重复添加
  if (document.getElementById('offline-indicator')) return;
  
  const indicator = document.createElement('div');
  indicator.id = 'offline-indicator';
  indicator.innerHTML = `
    <span>📴 离线模式</span>
    <a href="/offline.html" style="color: white; margin-left: 10px; text-decoration: underline;">查看详情</a>
  `;
  indicator.style.cssText = `
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: #64748b;
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    display: flex;
    align-items: center;
  `;
  document.body.appendChild(indicator);
  
  // 延迟隐藏，让用户看到提示
  setTimeout(() => {
    hideOfflineIndicator();
  }, 5000);
}

function hideOfflineIndicator() {
  const indicator = document.getElementById('offline-indicator');
  if (indicator) indicator.remove();
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  PWAInstallPrompt.init();
});
