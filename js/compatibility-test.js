/* ===================================
   兼容性测试脚本
   支持：浏览器、设备、系统检测
   =================================== */

(function() {
  'use strict';

  const CompatibilityTest = {
    results: {
      timestamp: new Date().toISOString(),
      browser: {},
      device: {},
      features: {},
      recommendations: []
    },

    // 运行所有测试
    async runAll() {
      console.log('开始兼容性测试...');
      
      this.testBrowser();
      this.testDevice();
      await this.testFeatures();
      this.generateRecommendations();
      
      return this.results;
    },

    // 浏览器检测
    testBrowser() {
      const ua = navigator.userAgent;
      const browser = {
        userAgent: ua,
        name: 'Unknown',
        version: 'Unknown',
        majorVersion: 0,
        engine: 'Unknown',
        engineVersion: 'Unknown',
        isModern: false,
        isSupported: false
      };

      // 检测浏览器
      if (ua.includes('Firefox')) {
        browser.name = 'Firefox';
        browser.engine = 'Gecko';
        const match = ua.match(/Firefox\/(\d+)/);
        browser.majorVersion = match ? parseInt(match[1]) : 0;
        browser.version = ua.match(/Firefox\/[\d.]+/)?.[0] || 'Unknown';
        browser.engineVersion = ua.match(/Gecko\/[\d.]+/)?.[0] || 'Unknown';
      } else if (ua.includes('Edg/')) {
        browser.name = 'Edge';
        browser.engine = 'Blink';
        const match = ua.match(/Edg\/(\d+)/);
        browser.majorVersion = match ? parseInt(match[1]) : 0;
        browser.version = ua.match(/Edg\/[\d.]+/)?.[0] || 'Unknown';
        browser.engineVersion = browser.version;
      } else if (ua.includes('Chrome')) {
        browser.name = 'Chrome';
        browser.engine = 'Blink';
        const match = ua.match(/Chrome\/(\d+)/);
        browser.majorVersion = match ? parseInt(match[1]) : 0;
        browser.version = ua.match(/Chrome\/[\d.]+/)?.[0] || 'Unknown';
        browser.engineVersion = browser.version;
      } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
        browser.name = 'Safari';
        browser.engine = 'WebKit';
        const match = ua.match(/Version\/(\d+)/);
        browser.majorVersion = match ? parseInt(match[1]) : 0;
        browser.version = ua.match(/Version\/[\d.]+/)?.[0] || 'Unknown';
        browser.engineVersion = ua.match(/AppleWebKit\/[\d.]+/)?.[0] || 'Unknown';
      } else if (ua.includes('Opera') || ua.includes('OPR')) {
        browser.name = 'Opera';
        browser.engine = 'Blink';
        browser.majorVersion = parseInt(ua.match(/Version\/(\d+)/)?.[1] || 0);
        browser.version = ua.match(/(?:Opera|OPR)\/[\d.]+/)?.[0] || 'Unknown';
      }

      // 检测是否为现代浏览器
      browser.isModern = browser.majorVersion >= 90;

      // 检测是否支持
      browser.isSupported = 
        browser.majorVersion >= 80 ||
        (browser.name === 'Safari' && browser.majorVersion >= 14) ||
        (browser.name === 'Firefox' && browser.majorVersion >= 78);

      this.results.browser = browser;
    },

    // 设备检测
    testDevice() {
      const device = {
        type: 'Desktop',
        os: 'Unknown',
        osVersion: 'Unknown',
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isTouch: false,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        pixelRatio: window.devicePixelRatio || 1,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        orientation: window.screen?.orientation?.type || 'landscape-primary',
        colorDepth: window.screen?.colorDepth || 24,
        hardwareConcurrency: navigator.hardwareConcurrency || 4,
        memory: navigator.deviceMemory || 'Unknown',
        connectionType: 'Unknown'
      };

      // 检测操作系统
      const ua = navigator.userAgent;
      if (ua.includes('Windows')) {
        device.os = 'Windows';
        const match = ua.match(/Windows NT (\d+\.\d+)/);
        const versions = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
        device.osVersion = match ? (versions[match[1]] || match[1]) : 'Unknown';
      } else if (ua.includes('Mac OS X')) {
        device.os = 'macOS';
        device.osVersion = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
      } else if (ua.includes('Android')) {
        device.os = 'Android';
        device.osVersion = ua.match(/Android (\d+\.?\d*)/)?.[1] || 'Unknown';
        device.isMobile = true;
      } else if (ua.includes('iPhone') || ua.includes('iPad')) {
        device.os = 'iOS';
        device.osVersion = ua.match(/OS (\d+[._]\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
        device.isMobile = ua.includes('iPhone');
        device.isTablet = ua.includes('iPad');
      } else if (ua.includes('Linux')) {
        device.os = 'Linux';
        device.osVersion = 'Unknown';
      }

      // 确定设备类型
      if (window.innerWidth <= 480 && device.isMobile) {
        device.type = 'Mobile';
      } else if (window.innerWidth <= 1024 && (device.isTablet || navigator.maxTouchPoints > 1)) {
        device.type = 'Tablet';
        device.isTablet = true;
      } else {
        device.type = 'Desktop';
        device.isDesktop = true;
      }

      // 检测触摸支持
      device.isTouch = 
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        window.matchMedia('(pointer: coarse)').matches;

      // 网络连接类型
      if (navigator.connection) {
        device.connectionType = navigator.connection.effectiveType || 'Unknown';
        device.downlink = navigator.connection.downlink;
        device.rtt = navigator.connection.rtt;
        device.saveData = navigator.connection.saveData;
      }

      this.results.device = device;
    },

    // 功能检测
    async testFeatures() {
      const features = {
        // PWA 相关
        serviceWorker: 'serviceWorker' in navigator,
        manifest: 'manifest' in document.createElement('link'),
        beforeInstallPrompt: typeof window.BeforeInstallPromptEvent !== 'undefined',
        
        // Web APIs
        notification: 'Notification' in window,
        notificationPermission: Notification?.permission || 'not-supported',
        pushManager: 'PushManager' in window,
        
        // 存储
        localStorage: this.testLocalStorage(),
        sessionStorage: this.testSessionStorage(),
        indexedDB: 'indexedDB' in window,
        cookies: navigator.cookieEnabled,
        
        // 网络
        online: navigator.onLine,
        fetch: 'fetch' in window,
        websocket: 'WebSocket' in window,
        
        // 媒体
        webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
        mediaDevices: 'mediaDevices' in navigator,
        getUserMedia: 'getUserMedia' in navigator,
        
        // 图形
        webGL: this.testWebGL(),
        webGL2: this.testWebGL2(),
        canvas: !!document.createElement('canvas').getContext,
        
        // 性能
        intersectionObserver: 'IntersectionObserver' in window,
        mutationObserver: 'MutationObserver' in window,
        performanceObserver: 'PerformanceObserver' in window,
        
        // 输入
        touchEvents: 'ontouchstart' in window,
        pointerEvents: 'PointerEvent' in window,
        keyboardEvents: 'KeyboardEvent' in window,
        
        // 设备
        geolocation: 'geolocation' in navigator,
        deviceMotion: 'DeviceMotionEvent' in window,
        deviceOrientation: 'DeviceOrientationEvent' in window,
        
        // 文件
        fileReader: 'FileReader' in window,
        fileInput: 'File' in window,
        
        // 通信
        webSocket: 'WebSocket' in window,
        eventSource: 'EventSource' in window,
        broadcastChannel: 'BroadcastChannel' in window,
        messageChannel: 'MessageChannel' in window,
        
        // CSS
        cssGrid: CSS?.supports?.('display', 'grid') ?? false,
        cssFlexbox: CSS?.supports?.('display', 'flex') ?? false,
        cssCustomProperties: CSS?.supports?.('--custom', '0') ?? false,
        cssAspectRatio: CSS?.supports?.('aspect-ratio', '1/1') ?? false,
        
        // 动画
        webAnimations: 'animate' in Element.prototype,
        cssAnimations: CSS?.supports?.('animation', 'name') ?? false,
        
        // 视口
        viewportUnits: CSS?.supports?.('width', '100vw') ?? false,
        dynamicViewport: 'visualViewport' in window,
        
        // 安全
        https: location.protocol === 'https:',
        secureContext: window.isSecureContext ?? (location.protocol === 'https:' || location.hostname === 'localhost'),
        
        // 其他
        clipboard: 'clipboard' in navigator,
        share: 'share' in navigator,
        paymentRequest: 'PaymentRequest' in window,
        fullscreen: 'requestFullscreen' in document.documentElement,
        pointerLock: 'requestPointerLock' in Element.prototype,
        
        // ES6+
        promises: 'Promise' in window,
        asyncAwait: true,
        modules: 'noModule' in HTMLScriptElement.prototype
      };

      this.results.features = features;
    },

    // 存储检测
    testLocalStorage() {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    },

    testSessionStorage() {
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    },

    // WebGL 检测
    testWebGL() {
      try {
        const canvas = document.createElement('canvas');
        return !!(
          canvas.getContext('webgl') || 
          canvas.getContext('experimental-webgl')
        );
      } catch (e) {
        return false;
      }
    },

    testWebGL2() {
      try {
        const canvas = document.createElement('canvas');
        return !!canvas.getContext('webgl2');
      } catch (e) {
        return false;
      }
    },

    // 生成建议
    generateRecommendations() {
      const recs = this.results.recommendations;
      const b = this.results.browser;
      const d = this.results.device;
      const f = this.results.features;

      // 浏览器建议
      if (!b.isSupported) {
        recs.push({
          level: 'error',
          category: 'browser',
          message: `您的浏览器 ${b.name} ${b.majorVersion} 不再受支持，建议升级到最新版本`
        });
      } else if (!b.isModern) {
        recs.push({
          level: 'warning',
          category: 'browser',
          message: `建议升级 ${b.name} 到最新版本以获得更好的体验`
        });
      }

      // HTTPS建议
      if (!f.https) {
        recs.push({
          level: 'error',
          category: 'security',
          message: '网站需要在 HTTPS 环境下才能使用全部功能'
        });
      }

      // Service Worker建议
      if (!f.serviceWorker) {
        recs.push({
          level: 'warning',
          category: 'pwa',
          message: '您的浏览器不支持 Service Worker，离线功能将不可用'
        });
      }

      // 通知建议
      if (f.notification && f.notificationPermission === 'default') {
        recs.push({
          level: 'info',
          category: 'notification',
          message: '建议开启通知权限以获取最新旅游资讯'
        });
      }

      // 存储建议
      if (!f.localStorage) {
        recs.push({
          level: 'warning',
          category: 'storage',
          message: '本地存储不可用，部分功能可能受限'
        });
      }

      // 触摸设备建议
      if (d.isMobile && !f.touchEvents) {
        recs.push({
          level: 'info',
          category: 'device',
          message: '建议使用触摸操作以获得最佳体验'
        });
      }

      // 网络建议
      if (d.connectionType === 'slow-2g' || d.connectionType === '2g') {
        recs.push({
          level: 'warning',
          category: 'network',
          message: '当前网络连接较慢，建议开启省流模式'
        });
      }

      // iOS Safari特殊处理
      if (d.os === 'iOS' && b.name === 'Safari') {
        recs.push({
          level: 'info',
          category: 'ios',
          message: 'iOS Safari 可能不支持某些 PWA 功能，建议使用主屏幕快捷方式访问'
        });
      }

      // Android Chrome建议
      if (d.os === 'Android' && b.name === 'Chrome') {
        recs.push({
          level: 'info',
          category: 'android',
          message: '建议添加到主屏幕以获得完整的 PWA 体验'
        });
      }

      // 深色模式
      if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        recs.push({
          level: 'info',
          category: 'display',
          message: '检测到系统使用深色模式，网站将自动适配'
        });
      }

      // 减少动画
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        recs.push({
          level: 'info',
          category: 'accessibility',
          message: '检测到系统开启减少动画，将自动禁用动画效果'
        });
      }
    },

    // 生成HTML报告
    generateHTMLReport() {
      const report = this.results;
      
      const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>兼容性测试报告 - 游导旅游</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; background: #f5f5f5; }
    .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
    h1 { font-size: 1.75rem; margin-bottom: 20px; color: #1a1a1a; }
    h2 { font-size: 1.25rem; margin: 24px 0 12px; color: #333; border-bottom: 2px solid #f97316; padding-bottom: 8px; }
    .card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .item { padding: 12px; background: #fafafa; border-radius: 8px; }
    .item-label { font-size: 0.85rem; color: #666; margin-bottom: 4px; }
    .item-value { font-size: 1rem; font-weight: 500; color: #333; }
    .tag { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .tag-success { background: #dcfce7; color: #16a34a; }
    .tag-error { background: #fee2e2; color: #dc2626; }
    .tag-warning { background: #fef3c7; color: #d97706; }
    .tag-info { background: #dbeafe; color: #2563eb; }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
    .feature { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f9f9f9; border-radius: 6px; font-size: 0.9rem; }
    .feature-icon { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
    .feature-yes .feature-icon { background: #dcfce7; color: #16a34a; }
    .feature-no .feature-icon { background: #fee2e2; color: #dc2626; }
    .recommendation { padding: 16px; border-radius: 8px; margin-bottom: 8px; display: flex; align-items: flex-start; gap: 12px; }
    .recommendation.error { background: #fef2f2; border-left: 4px solid #dc2626; }
    .recommendation.warning { background: #fffbeb; border-left: 4px solid #d97706; }
    .recommendation.info { background: #eff6ff; border-left: 4px solid #2563eb; }
    .timestamp { color: #666; font-size: 0.85rem; margin-bottom: 16px; }
    .summary { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
    .summary-item { flex: 1; min-width: 150px; padding: 16px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; border-radius: 10px; }
    .summary-item.secondary { background: linear-gradient(135deg, #64748b 0%, #475569 100%); }
    .summary-number { font-size: 2rem; font-weight: 700; }
    .summary-label { font-size: 0.9rem; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧭 兼容性测试报告</h1>
    <p class="timestamp">测试时间：${new Date(report.timestamp).toLocaleString('zh-CN')}</p>
    
    <div class="summary">
      <div class="summary-item">
        <div class="summary-number">${report.browser.majorVersion || 0}</div>
        <div class="summary-label">${report.browser.name} 版本</div>
      </div>
      <div class="summary-item secondary">
        <div class="summary-number">${report.device.type}</div>
        <div class="summary-label">${report.device.os} ${report.device.osVersion}</div>
      </div>
    </div>

    <h2>📱 浏览器信息</h2>
    <div class="card">
      <div class="grid">
        <div class="item">
          <div class="item-label">浏览器</div>
          <div class="item-value">${report.browser.name} ${report.browser.version}</div>
        </div>
        <div class="item">
          <div class="item-label">渲染引擎</div>
          <div class="item-value">${report.browser.engine}</div>
        </div>
        <div class="item">
          <div class="item-label">支持状态</div>
          <div class="item-value">
            <span class="tag ${report.browser.isSupported ? 'tag-success' : 'tag-error'}">
              ${report.browser.isSupported ? '支持' : '不支持'}
            </span>
          </div>
        </div>
        <div class="item">
          <div class="item-label">现代浏览器</div>
          <div class="item-value">
            <span class="tag ${report.browser.isModern ? 'tag-success' : 'tag-warning'}">
              ${report.browser.isModern ? '是' : '否'}
            </span>
          </div>
        </div>
      </div>
    </div>

    <h2>📱 设备信息</h2>
    <div class="card">
      <div class="grid">
        <div class="item">
          <div class="item-label">设备类型</div>
          <div class="item-value">${report.device.type}</div>
        </div>
        <div class="item">
          <div class="item-label">操作系统</div>
          <div class="item-value">${report.device.os} ${report.device.osVersion}</div>
        </div>
        <div class="item">
          <div class="item-label">屏幕尺寸</div>
          <div class="item-value">${report.device.screenWidth} × ${report.device.screenHeight}px</div>
        </div>
        <div class="item">
          <div class="item-label">触控点</div>
          <div class="item-value">${report.device.maxTouchPoints}</div>
        </div>
        <div class="item">
          <div class="item-label">连接类型</div>
          <div class="item-value">${report.device.connectionType}</div>
        </div>
        <div class="item">
          <div class="item-label">在线状态</div>
          <div class="item-value">
            <span class="tag ${report.features.online ? 'tag-success' : 'tag-error'}">
              ${report.features.online ? '在线' : '离线'}
            </span>
          </div>
        </div>
      </div>
    </div>

    <h2>✅ 功能支持</h2>
    <div class="card">
      <h3>PWA 相关</h3>
      <div class="feature-grid">
        ${this.renderFeature('Service Worker', report.features.serviceWorker)}
        ${this.renderFeature('Web Manifest', report.features.manifest)}
        ${this.renderFeature('推送通知', report.features.pushManager)}
      </div>
      
      <h3>存储</h3>
      <div class="feature-grid">
        ${this.renderFeature('LocalStorage', report.features.localStorage)}
        ${this.renderFeature('SessionStorage', report.features.sessionStorage)}
        ${this.renderFeature('IndexedDB', report.features.indexedDB)}
        ${this.renderFeature('Cookies', report.features.cookies)}
      </div>
      
      <h3>图形</h3>
      <div class="feature-grid">
        ${this.renderFeature('Canvas', report.features.canvas)}
        ${this.renderFeature('WebGL', report.features.webGL)}
        ${this.renderFeature('WebGL 2.0', report.features.webGL2)}
      </div>
      
      <h3>网络</h3>
      <div class="feature-grid">
        ${this.renderFeature('Fetch API', report.features.fetch)}
        ${this.renderFeature('WebSocket', report.features.websocket)}
        ${this.renderFeature('EventSource', report.features.eventSource)}
      </div>
      
      <h3>CSS</h3>
      <div class="feature-grid">
        ${this.renderFeature('CSS Grid', report.features.cssGrid)}
        ${this.renderFeature('CSS Flexbox', report.features.cssFlexbox)}
        ${this.renderFeature('CSS 变量', report.features.cssCustomProperties)}
        ${this.renderFeature('aspect-ratio', report.features.cssAspectRatio)}
      </div>
      
      <h3>动画</h3>
      <div class="feature-grid">
        ${this.renderFeature('Web Animations', report.features.webAnimations)}
        ${this.renderFeature('CSS Animations', report.features.cssAnimations)}
      </div>
      
      <h3>输入</h3>
      <div class="feature-grid">
        ${this.renderFeature('触摸事件', report.features.touchEvents)}
        ${this.renderFeature('Pointer Events', report.features.pointerEvents)}
        ${this.renderFeature('地理位置', report.features.geolocation)}
      </div>
    </div>

    <h2>💡 建议</h2>
    <div class="card">
      ${report.recommendations.length > 0 ? report.recommendations.map(rec => `
        <div class="recommendation ${rec.level}">
          <span class="tag tag-${rec.level === 'error' ? 'error' : rec.level === 'warning' ? 'warning' : 'info'}">
            ${rec.level === 'error' ? '❌' : rec.level === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <div>
            <strong>${rec.category}</strong>
            <p>${rec.message}</p>
          </div>
        </div>
      `).join('') : '<p>您的浏览器完全支持所有功能！</p>'}
    </div>
  </div>
</body>
</html>`;
      
      return html;
    },

    renderFeature(name, supported) {
      return `
        <div class="feature ${supported ? 'feature-yes' : 'feature-no'}">
          <span class="feature-icon">${supported ? '✓' : '✗'}</span>
          <span>${name}</span>
        </div>
      `;
    }
  };

  // 导出
  window.CompatibilityTest = CompatibilityTest;
  
  // 自动运行并显示报告
  if (window.location.pathname.includes('compatibility-test')) {
    CompatibilityTest.runAll().then(results => {
      document.body.innerHTML = CompatibilityTest.generateHTMLReport();
    });
  }

})();
