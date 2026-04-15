/**
 * 资源优化工具 - 游导旅游平台
 * 功能：图片优化、WebP转换、字体优化、缓存策略
 */

(function(global) {
  'use strict';

  const ResourceOptimizer = {
    // 配置
    config: {
      enableWebP: true,
      enableImageLazy: true,
      enableFont优化: true,
      enableResourceHints: true,
      breakpoints: [320, 640, 768, 1024, 1280, 1920],
      quality: {
        jpeg: 85,
        png: 90,
        webp: 80
      },
      lazyOffset: '100px',
      lazyThreshold: 0.1
    },

    // 初始化
    init(options = {}) {
      Object.assign(this.config, options);
      
      if (this.config.enableWebP) {
        this.initWebPDetection();
        this.initResponsiveImages();
      }
      
      if (this.config.enableImageLazy) {
        this.initLazyLoading();
      }
      
      if (this.config.enableFont优化) {
        this.initFontOptimization();
      }
      
      if (this.config.enableResourceHints) {
        this.initResourceHints();
      }

      return this;
    },

    // ==================== WebP检测与转换 ====================
    initWebPDetection() {
      // 检测浏览器是否支持WebP
      const checkWebPSupport = () => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img.width === 1);
          img.onerror = () => resolve(false);
          img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
        });
      };

      checkWebPSupport().then(supported => {
        document.documentElement.classList.toggle('webp-supported', supported);
        document.documentElement.classList.toggle('webp-unsupported', !supported);
        
        if (supported) {
          this.convertImagesToWebP();
        }
      });
    },

    // 转换图片到WebP（数据层面提示，非实际转换）
    convertImagesToWebP() {
      // 标记支持WebP的图片
      document.querySelectorAll('img[src$=".jpg"], img[src$=".jpeg"], img[src$=".png"]').forEach(img => {
        const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        img.dataset.webpSrc = webpSrc;
        img.classList.add('webp-available');
      });
    },

    // ==================== 响应式图片 ====================
    initResponsiveImages() {
      // 为响应式图片添加srcset支持
      document.querySelectorAll('img[data-srcset]').forEach(img => {
        img.srcset = img.dataset.srcset;
      });

      // 监听视口变化，重新评估图片
      if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(() => {
          this.updateVisibleImages();
        });
        observer.observe(document.body);
      }
    },

    // 更新可见图片
    updateVisibleImages() {
      const viewportWidth = window.innerWidth;
      const breakpoint = this.getBreakpoint(viewportWidth);
      
      document.querySelectorAll('img[data-breakpoints]').forEach(img => {
        const src = img.dataset[`src${breakpoint}`] || img.dataset.src;
        if (src && img.src !== src) {
          img.dataset.src = src;
        }
      });
    },

    // 获取当前断点
    getBreakpoint(width) {
      const breakpoints = this.config.breakpoints;
      for (let i = breakpoints.length - 1; i >= 0; i--) {
        if (width >= breakpoints[i]) {
          return breakpoints[i];
        }
      }
      return breakpoints[0];
    },

    // ==================== 图片懒加载 ====================
    initLazyLoading() {
      if (!('IntersectionObserver' in window)) {
        // 降级处理：直接加载所有图片
        document.querySelectorAll('img[data-src]').forEach(img => {
          img.src = img.dataset.src;
        });
        return;
      }

      // 图片懒加载
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // 处理不同类型的数据属性
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }
            if (img.dataset.bg) {
              img.style.backgroundImage = `url(${img.dataset.bg})`;
              img.removeAttribute('data-bg');
            }
            
            img.classList.add('lazy-loaded');
            img.addEventListener('load', () => {
              img.classList.add('loaded');
            });
            
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: this.config.lazyOffset,
        threshold: this.config.lazyThreshold
      });

      // 观察所有需要懒加载的图片
      document.querySelectorAll('img[data-src], [data-bg]').forEach(el => {
        imageObserver.observe(el);
      });

      // 背景图片懒加载
      const bgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const bg = el.dataset.bg;
            if (bg) {
              el.style.backgroundImage = `url(${bg})`;
              el.removeAttribute('data-bg');
              el.classList.add('bg-lazy-loaded');
            }
            bgObserver.unobserve(el);
          }
        });
      }, {
        rootMargin: this.config.lazyOffset,
        threshold: this.config.lazyThreshold
      });

      document.querySelectorAll('[data-bg]').forEach(el => {
        if (!el.tagName === 'IMG') {
          bgObserver.observe(el);
        }
      });
    },

    // ==================== 字体优化 ====================
    initFontOptimization() {
      // 检测字体加载状态
      if ('fonts' in document) {
        this.observeFontLoad();
      }

      // 添加字体显示策略
      this.applyFontDisplay();
    },

    // 观察字体加载
    observeFontLoad() {
      document.fonts.ready.then(() => {
        document.documentElement.classList.add('fonts-loaded');
        console.log('[资源优化] 字体加载完成');
      });
    },

    // 应用字体显示策略
    applyFontDisplay() {
      // 为所有@font-face添加font-display: swap
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'LocalFont';
          font-display: swap;
        }
        
        body {
          font-display: swap;
        }
        
        /* 预加载关键字体 */
        .critical-font {
          font-display: optional;
        }
      `;
      document.head.appendChild(style);
    },

    // ==================== 资源提示 ====================
    initResourceHints() {
      // DNS预解析
      this.addDnsPrefetch([
        'cdn.youdau-travel.com',
        'api.youdau-travel.com',
        'fonts.googleapis.com',
        'fonts.gstatic.com'
      ]);

      // 预连接
      this.addPreconnect([
        { href: 'https://cdn.youdau-travel.com', crossorigin: true },
        { href: 'https://api.youdau-travel.com', crossorigin: true },
        { href: 'https://fonts.googleapis.com', crossorigin: true },
        { href: 'https://fonts.gstatic.com', crossorigin: true }
      ]);

      // 预获取
      this.addPrefetch([
        'guides.html',
        'routes.html',
        'visa.html',
        'search.html'
      ]);
    },

    // 添加DNS预解析
    addDnsPrefetch(hosts) {
      hosts.forEach(host => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${host}`;
        document.head.appendChild(link);
      });
    },

    // 添加预连接
    addPreconnect(connections) {
      connections.forEach(conn => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = conn.href;
        if (conn.crossorigin) {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      });
    },

    // 添加预获取
    addPrefetch(urls) {
      urls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    },

    // ==================== 工具方法 ====================
    
    // 格式化文件大小
    formatSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 获取图片信息
    getImageInfo(img) {
      return {
        src: img.src,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: img.src.length,
        type: this.getImageType(img.src)
      };
    },

    // 获取图片类型
    getImageType(src) {
      const match = src.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
      return match ? match[1].toLowerCase() : 'unknown';
    },

    // 计算节省空间
    calculateSavings(originalSize, optimizedSize) {
      const saved = originalSize - optimizedSize;
      const percent = ((saved / originalSize) * 100).toFixed(1);
      return {
        saved,
        percent,
        formatted: `${this.formatSize(saved)} (${percent}%)`
      };
    }
  };

  // 导出
  global.ResourceOptimizer = ResourceOptimizer;

  // 自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ResourceOptimizer.init(window.ResourceOptimizerConfig));
  } else {
    ResourceOptimizer.init(window.ResourceOptimizerConfig);
  }

})(typeof window !== 'undefined' ? window : this);
