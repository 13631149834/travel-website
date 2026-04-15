/**
 * 游导旅游网站 - 性能优化配置
 * 版本: 1.0.0
 * 性能目标: LCP < 2.5s, FID < 100ms, CLS < 0.1, 首屏 < 1.5s
 */

(function() {
  'use strict';

  // ============================================
  // 图片懒加载配置
  // ============================================
  const ImageLazyLoad = {
    // 懒加载配置
    config: {
      rootMargin: '50px 0px', // 提前50px加载
      threshold: 0.1,
      selector: 'img[data-src], [data-lazy]',
      backgroundSelector: '[data-bg-lazy]'
    },

    // 初始化
    init() {
      if ('IntersectionObserver' in window) {
        this.setupImageObserver();
        this.setupBackgroundObserver();
      } else {
        this.fallbackLoad();
      }
    },

    // 图片懒加载观察器
    setupImageObserver() {
      const images = document.querySelectorAll(this.config.selector);
      
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: this.config.rootMargin,
        threshold: this.config.threshold
      });

      images.forEach(img => imageObserver.observe(img));
    },

    // 背景图懒加载观察器
    setupBackgroundObserver() {
      const backgrounds = document.querySelectorAll(this.config.backgroundSelector);
      
      const bgObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadBackground(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: this.config.rootMargin,
        threshold: this.config.threshold
      });

      backgrounds.forEach(el => bgObserver.observe(el));
    },

    // 加载图片
    loadImage(img) {
      const src = img.dataset.src;
      if (!src) return;

      // 创建新图片预加载
      const tempImg = new Image();
      tempImg.onload = () => {
        img.src = src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
        img.classList.remove('lazy-placeholder');
        
        // 触发自定义事件
        img.dispatchEvent(new CustomEvent('lazyloaded'));
      };
      tempImg.onerror = () => {
        console.warn('图片加载失败:', src);
        img.classList.add('load-error');
      };
      tempImg.src = src;
    },

    // 加载背景图
    loadBackground(el) {
      const bg = el.dataset.bgLazy;
      if (!bg) return;
      
      el.style.backgroundImage = `url(${bg})`;
      el.removeAttribute('data-bg-lazy');
      el.classList.add('bg-loaded');
    },

    // 降级方案：立即加载所有图片
    fallbackLoad() {
      const images = document.querySelectorAll(this.config.selector);
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    }
  };

  // ============================================
  // 资源预加载配置
  // ============================================
  const ResourcePreload = {
    // 关键资源预加载
    preloadCritical(resources) {
      resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = resource.type === 'font' ? 'preload' : 'prefetch';
        link.href = resource.url;
        link.as = resource.type;
        
        if (resource.crossOrigin) {
          link.crossOrigin = resource.crossOrigin;
        }
        
        if (resource.type === 'font') {
          link.rel = 'preload';
          link.as = 'font';
          link.type = resource.mimeType || 'font/woff2';
          link.crossOrigin = 'anonymous';
        }
        
        document.head.appendChild(link);
      });
    },

    // DNS预解析
    prefetchDNS(domains) {
      domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
        
        // 同时添加 preconnect 以建立早起连接
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = domain;
        preconnect.crossOrigin = 'anonymous';
        document.head.appendChild(preconnect);
      });
    },

    // 预加载下一跳资源
    prefetchNext(nextUrl) {
      if (!nextUrl) return;
      
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = nextUrl;
      link.as = 'document';
      document.head.appendChild(link);
    }
  };

  // ============================================
  // 代码分割配置
  // ============================================
  const CodeSplit = {
    // 模块注册表
    modules: {},

    // 注册模块
    register(name, path, dependencies = []) {
      this.modules[name] = {
        path,
        dependencies,
        loaded: false,
        factory: null
      };
    },

    // 动态加载模块
    async load(name) {
      const module = this.modules[name];
      if (!module) {
        console.warn(`模块 "${name}" 未注册`);
        return null;
      }

      if (module.loaded && module.factory) {
        return module.factory;
      }

      // 加载依赖
      await Promise.all(
        module.dependencies.map(dep => this.load(dep))
      );

      // 动态导入
      try {
        const moduleFactory = await import(/* webpackChunkName: "[name]" */ module.path);
        module.factory = moduleFactory.default || moduleFactory;
        module.loaded = true;
        return module.factory;
      } catch (error) {
        console.error(`模块 "${name}" 加载失败:`, error);
        return null;
      }
    },

    // 预加载模块
    preload(name) {
      this.load(name).catch(console.warn);
    }
  };

  // ============================================
  // 缓存策略配置
  // ============================================
  const CacheStrategy = {
    // 缓存配置
    config: {
      CACHE_NAME: 'youdao-travel-v1',
      CACHE_VERSION: 'v1',
      MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7天
      resources: {
        static: { maxAge: 30 * 24 * 60 * 60 * 1000, strategy: 'cache-first' }, // 30天
        images: { maxAge: 7 * 24 * 60 * 60 * 1000, strategy: 'cache-first' }, // 7天
        api: { maxAge: 5 * 60 * 1000, strategy: 'network-first' }, // 5分钟
        fonts: { maxAge: 365 * 24 * 60 * 60 * 1000, strategy: 'cache-only' } // 1年
      }
    },

    // 注册Service Worker
    async registerSW() {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker 注册成功:', registration.scope);
          return registration;
        } catch (error) {
          console.warn('Service Worker 注册失败:', error);
          return null;
        }
      }
      return null;
    },

    // 缓存资源
    async cacheResource(url, cacheName = this.config.CACHE_NAME) {
      const cache = await caches.open(cacheName);
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response.clone());
      }
      return response;
    },

    // 获取缓存资源
    async getCached(url, cacheName = this.config.CACHE_NAME) {
      const cache = await caches.open(cacheName);
      const response = await cache.match(url);
      return response;
    },

    // 清除过期缓存
    async clearExpiredCache() {
      const cacheNames = await caches.keys();
      const now = Date.now();
      
      await Promise.all(
        cacheNames.map(async (name) => {
          if (name.startsWith('youdao-travel-')) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            
            await Promise.all(
              keys.map(async (request) => {
                const response = await cache.match(request);
                if (response) {
                  const dateHeader = response.headers.get('date');
                  if (dateHeader) {
                    const date = new Date(dateHeader).getTime();
                    if (now - date > this.config.MAX_AGE) {
                      await cache.delete(request);
                    }
                  }
                }
              })
            );
          }
        })
      );
    },

    // 缓存状态
    async getCacheStatus() {
      if (!('caches' in window)) {
        return { supported: false };
      }

      const cacheNames = await caches.keys();
      const status = {
        supported: true,
        caches: [],
        totalSize: 0
      };

      for (const name of cacheNames) {
        if (name.startsWith('youdao-travel-')) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          status.caches.push({
            name,
            count: keys.length
          });
        }
      }

      return status;
    }
  };

  // ============================================
  // 性能监控
  // ============================================
  const PerformanceMonitor = {
    // Core Web Vitals 指标
    metrics: {
      LCP: null,
      FID: null,
      CLS: 0,
      FCP: null,
      TTFB: null
    },

    // 观察器实例
    observers: [],

    // 初始化监控
    init() {
      this.observeLCP();
      this.observeFID();
      this.observeCLS();
      this.observeFCP();
      this.measureTTFB();
    },

    // LCP 监控
    observeLCP() {
      if (!('PerformanceObserver' in window)) return;

      try {
        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.LCP = lastEntry.renderTime || lastEntry.loadTime;
          
          // 检查是否达到目标
          if (this.metrics.LCP > 2500) {
            console.warn(`⚠️ LCP 超过目标: ${this.metrics.LCP}ms > 2500ms`);
          }
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        this.observers.push(observer);
      } catch (e) {
        console.warn('LCP 监控不支持:', e);
      }
    },

    // FID 监控
    observeFID() {
      if (!('PerformanceObserver' in window)) return;

      try {
        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            this.metrics.FID = entry.processingStart - entry.startTime;
            
            if (this.metrics.FID > 100) {
              console.warn(`⚠️ FID 超过目标: ${this.metrics.FID}ms > 100ms`);
            }
          });
        });

        observer.observe({ type: 'first-input', buffered: true });
        this.observers.push(observer);
      } catch (e) {
        console.warn('FID 监控不支持:', e);
      }
    },

    // CLS 监控
    observeCLS() {
      if (!('PerformanceObserver' in window)) return;

      let cumulativeScore = 0;

      try {
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              cumulativeScore += entry.value;
              this.metrics.CLS = cumulativeScore;
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });
        this.observers.push(observer);
      } catch (e) {
        console.warn('CLS 监控不支持:', e);
      }
    },

    // FCP 监控
    observeFCP() {
      if (!('PerformanceObserver' in window)) return;

      try {
        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const fcpEntry = entries.find(e => e.name === 'first-contentful-paint');
          if (fcpEntry) {
            this.metrics.FCP = fcpEntry.startTime;
          }
        });

        observer.observe({ type: 'paint', buffered: true });
        this.observers.push(observer);
      } catch (e) {
        console.warn('FCP 监控不支持:', e);
      }
    },

    // TTFB 测量
    measureTTFB() {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.metrics.TTFB = navigation.responseStart - navigation.requestStart;
      }
    },

    // 获取性能报告
    getReport() {
      return {
        metrics: this.metrics,
        targets: {
          LCP: { value: 2500, unit: 'ms', status: this.metrics.LCP <= 2500 ? 'pass' : 'fail' },
          FID: { value: 100, unit: 'ms', status: this.metrics.FID <= 100 ? 'pass' : 'fail' },
          CLS: { value: 0.1, unit: '', status: this.metrics.CLS <= 0.1 ? 'pass' : 'fail' }
        },
        timestamp: Date.now()
      };
    },

    // 销毁观察器
    destroy() {
      this.observers.forEach(observer => observer.disconnect());
      this.observers = [];
    }
  };

  // ============================================
  // 防抖与节流工具
  // ============================================
  const PerformanceUtils = {
    // 防抖
    debounce(func, wait = 250) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // 节流
    throttle(func, limit = 250) {
      let inThrottle;
      return function executedFunction(...args) {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    // 延迟执行
    defer(fn) {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(fn, { timeout: 2000 });
      } else {
        setTimeout(fn, 1);
      }
    },

    // 空闲时执行
    idleCallback(callback, options = {}) {
      if ('requestIdleCallback' in window) {
        return requestIdleCallback(callback, options);
      } else {
        return setTimeout(callback, 1);
      }
    }
  };

  // ============================================
  // 初始化
  // ============================================
  const TravelPerformance = {
    init() {
      // 初始化图片懒加载
      ImageLazyLoad.init();
      
      // 初始化性能监控
      PerformanceMonitor.init();
      
      // DNS预解析常用域名
      ResourcePreload.prefetchDNS([
        'https://cdn.tailwindcss.com',
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
      ]);

      console.log('✅ 游导旅游性能优化已初始化');
    }
  };

  // DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TravelPerformance.init());
  } else {
    TravelPerformance.init();
  }

  // 导出全局对象
  window.TravelPerformance = {
    ImageLazyLoad,
    ResourcePreload,
    CodeSplit,
    CacheStrategy,
    PerformanceMonitor,
    PerformanceUtils
  };

})();
