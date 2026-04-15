/**
 * 性能优化入口 - 游导旅游平台
 * 整合所有性能优化模块，提供统一的初始化接口
 */

(function(global) {
  'use strict';

  const PerformanceOptimizer = {
    // 配置
    config: {
      // 是否启用性能监控
      enableMonitor: true,
      // 是否启用资源优化
      enableResourceOptimizer: true,
      // 是否启用Service Worker
      enableServiceWorker: true,
      // 是否启用预测预加载
      enablePredictivePrefetch: true,
      // 调试模式
      debug: false,
      // 性能上报地址
      reportEndpoint: null
    },

    // 初始化
    async init(options = {}) {
      Object.assign(this.config, options);
      
      this.log('Initializing Performance Optimizer...');

      // 1. 初始化性能监控
      if (this.config.enableMonitor && global.PerformanceMonitor) {
        global.PerformanceMonitor.init({
          reportEndpoint: this.config.reportEndpoint,
          enableConsole: this.config.debug,
          enableLocalStorage: true
        });
        this.log('✓ Performance Monitor initialized');
      }

      // 2. 初始化资源优化
      if (this.config.enableResourceOptimizer && global.ResourceOptimizer) {
        global.ResourceOptimizer.init({
          debug: this.config.debug
        });
        this.log('✓ Resource Optimizer initialized');
      }

      // 3. 注册Service Worker
      if (this.config.enableServiceWorker) {
        await this.registerServiceWorker();
      }

      // 4. 执行首屏优化
      this.optimizeCriticalPath();

      // 5. 预测预加载
      if (this.config.enablePredictivePrefetch) {
        this.setupPredictivePrefetch();
      }

      // 6. 监听性能事件
      this.setupEventListeners();

      this.log('Performance Optimizer ready!');
      
      return this;
    },

    // 注册Service Worker
    async registerServiceWorker() {
      if (!('serviceWorker' in navigator)) {
        this.log('Service Worker not supported');
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新版本可用
              this.dispatch('sw:updateavailable');
            }
          });
        });

        this.log('✓ Service Worker registered');
      } catch (e) {
        this.log('Service Worker registration failed:', e);
      }
    },

    // 首屏关键路径优化
    optimizeCriticalPath() {
      // 移除首屏不需要的资源
      this.deferNonCritical();

      // 优先加载关键CSS
      this.prioritizeCriticalCSS();

      // 预连接关键域名
      this.preconnectCriticalDomains();

      // 预加载关键资源
      this.preloadCriticalResources();
    },

    // 延迟加载非关键资源
    deferNonCritical() {
      // 延迟加载分析脚本
      const analyticsScripts = document.querySelectorAll('script[data-defer]');
      analyticsScripts.forEach(script => {
        const src = script.dataset.defer;
        const newScript = document.createElement('script');
        newScript.src = src;
        newScript.async = true;
        script.parentNode.insertBefore(newScript, script);
        script.remove();
      });

      // 延迟加载非关键CSS
      const nonCriticalCSS = document.querySelectorAll('link[data-defer]');
      nonCriticalCSS.forEach(link => {
        link.rel = 'preload';
        link.as = 'style';
        link.onload = function() {
          this.onload = null;
          this.rel = 'stylesheet';
        };
      });
    },

    // 优先加载关键CSS
    prioritizeCriticalCSS() {
      // 确保关键CSS已加载
      const criticalCSS = document.querySelector('link[href*="critical"]');
      if (criticalCSS) {
        criticalCSS.rel = 'stylesheet';
      }
    },

    // 预连接关键域名
    preconnectCriticalDomains() {
      const domains = [
        'https://cdn.youdau-travel.com',
        'https://api.youdau-travel.com'
      ];

      domains.forEach(domain => {
        // DNS预解析
        const dnsPrefetch = document.createElement('link');
        dnsPrefetch.rel = 'dns-prefetch';
        dnsPrefetch.href = domain;
        document.head.appendChild(dnsPrefetch);

        // 预连接
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = domain;
        preconnect.crossOrigin = 'anonymous';
        document.head.appendChild(preconnect);
      });
    },

    // 预加载关键资源
    preloadCriticalResources() {
      const criticalResources = [
        { href: '/css/style.css', as: 'style' },
        { href: '/js/enhanced-common.js', as: 'script' },
        { href: '/images/logo.svg', as: 'image', type: 'image/svg+xml' }
      ];

      criticalResources.forEach(resource => {
        // 检查是否已存在
        const existing = document.querySelector(
          `link[href="${resource.href}"]`
        );
        if (existing) return;

        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        if (resource.type) {
          link.type = resource.type;
        }
        document.head.appendChild(link);
      });
    },

    // 设置预测预加载
    setupPredictivePrefetch() {
      const links = document.querySelectorAll('a[href]');
      let prefetchTimer = null;

      links.forEach(link => {
        link.addEventListener('mouseenter', () => {
          // 防抖处理
          clearTimeout(prefetchTimer);
          prefetchTimer = setTimeout(() => {
            const href = link.href;
            
            // 只处理同域名链接
            if (!href.startsWith(window.location.origin)) return;
            
            // 预取文档
            const prefetch = document.createElement('link');
            prefetch.rel = 'prefetch';
            prefetch.as = 'document';
            prefetch.href = href;
            document.head.appendChild(prefetch);
          }, 100);
        }, { passive: true });
      });
    },

    // 设置事件监听
    setupEventListeners() {
      // 页面可见性变化
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.dispatch('page:hidden');
        } else {
          this.dispatch('page:visible');
        }
      });

      // 网络状态变化
      window.addEventListener('online', () => {
        this.dispatch('network:online');
      });

      window.addEventListener('offline', () => {
        this.dispatch('network:offline');
      });

      // 性能报告完成
      if (global.PerformanceMonitor) {
        global.PerformanceMonitor.on('performance:complete', (data) => {
          this.dispatch('performance:complete', data);
        });
      }
    },

    // 获取性能报告
    getReport() {
      const report = {
        config: this.config,
        timestamp: Date.now()
      };

      if (global.PerformanceMonitor) {
        report.metrics = global.PerformanceMonitor.getReport();
      }

      return report;
    },

    // 获取性能评分
    getScore() {
      if (global.PerformanceMonitor && global.PerformanceMonitor.metrics.score) {
        return global.PerformanceMonitor.metrics.score;
      }
      return null;
    },

    // 事件系统
    listeners: {},

    on(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
      return this;
    },

    off(event, callback) {
      if (!this.listeners[event]) return this;
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      return this;
    },

    dispatch(event, data) {
      if (!this.listeners[event]) return;
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          this.log('Event callback error:', e);
        }
      });
    },

    // 调试日志
    log(...args) {
      if (this.config.debug) {
        console.log('[PerformanceOptimizer]', ...args);
      }
    }
  };

  // 导出到全局
  global.PerformanceOptimizer = PerformanceOptimizer;

  // 自动初始化（可选，需要用户显式调用）
  // 如果页面需要自动初始化，可以取消下面的注释
  // if (typeof document !== 'undefined') {
  //   if (document.readyState === 'loading') {
  //     document.addEventListener('DOMContentLoaded', () => PerformanceOptimizer.init());
  //   } else {
  //     PerformanceOptimizer.init();
  //   }
  // }

})(typeof window !== 'undefined' ? window : this);
