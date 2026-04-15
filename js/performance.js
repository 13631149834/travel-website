/**
 * 性能优化工具 - 图片懒加载与资源优化
 * 包含：IntersectionObserver 图片懒加载、动态脚本加载、资源预加载
 */

// ==================== 图片懒加载 ====================
class LazyLoadImages {
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '100px',
      threshold: options.threshold || 0.1,
      selector: options.selector || 'img[data-src]'
    };
    this.init();
  }

  init() {
    if (!('IntersectionObserver' in window)) {
      // 降级处理：直接加载所有图片
      document.querySelectorAll(this.options.selector).forEach(img => {
        img.src = img.dataset.src;
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });

    document.querySelectorAll(this.options.selector).forEach(img => {
      observer.observe(img);
    });
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;
    
    img.src = src;
    img.removeAttribute('data-src');
    img.classList.add('lazy-loaded');
    
    img.addEventListener('load', () => {
      img.classList.add('loaded');
    });
  }
}

// ==================== 背景图片懒加载 ====================
class LazyLoadBackgrounds {
  constructor() {
    this.init();
  }

  init() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bg = entry.target.dataset.bg;
          if (bg) {
            entry.target.style.backgroundImage = `url(${bg})`;
            entry.target.removeAttribute('data-bg');
          }
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '100px', threshold: 0.1 });

    document.querySelectorAll('[data-bg]').forEach(el => {
      observer.observe(el);
    });
  }
}

// ==================== 动态脚本加载 ====================
const ResourceLoader = {
  // 加载脚本（支持async/defer）
  loadScript(src, options = {}) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      
      if (options.async) script.async = true;
      if (options.defer) script.defer = true;
      if (options.integrity) script.integrity = options.integrity;
      if (options.crossOrigin) script.crossOrigin = options.crossOrigin;
      
      script.onload = resolve;
      script.onerror = reject;
      
      if (options.appendTo) {
        options.appendTo.appendChild(script);
      } else {
        document.body.appendChild(script);
      }
    });
  },

  // 加载CSS
  loadCSS(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  },

  // 延迟加载非关键脚本
  deferLoad(src) {
    this.loadScript(src, { defer: true });
  },

  // 懒加载脚本（进入视口时加载）
  lazyLoadScript(src, container = document.body) {
    if (!('IntersectionObserver' in window)) {
      this.deferLoad(src);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.deferLoad(src);
          observer.disconnect();
        }
      });
    }, { rootMargin: '200px' });

    const placeholder = document.createElement('script');
    placeholder.dataset.src = src;
    placeholder.dataset.lazyScript = 'true';
    container.appendChild(placeholder);
    observer.observe(placeholder);
  }
};

// ==================== 资源预加载 ====================
const Preloader = {
  // 预加载关键资源
  preload(href, as, options = {}) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    
    if (options.type) link.type = options.type;
    if (options.media) link.media = options.media;
    if (options.crossOrigin) link.crossOrigin = options.crossOrigin;
    
    document.head.appendChild(link);
    return link;
  },

  // 预加载关键CSS
  preloadCSS(href) {
    return this.preload(href, 'style');
  },

  // 预加载关键JS
  preloadJS(href) {
    return this.preload(href, 'script');
  },

  // 预加载图片
  preloadImage(href) {
    return this.preload(href, 'image');
  },

  // 预加载字体
  preloadFont(href, options = {}) {
    return this.preload(href, 'font', { type: 'font/' + (options.type || 'woff2'), crossOrigin: 'anonymous' });
  },

  // DNS预解析
  dnsPrefetch(href) {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = href;
    document.head.appendChild(link);
  },

  // 预连接
  preconnect(href, crossOrigin = true) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    if (crossOrigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
};

// ==================== 初始化性能优化 ====================
function initPerformanceOptimizations() {
  // 初始化图片懒加载
  new LazyLoadImages();
  new LazyLoadBackgrounds();
  
  // 懒加载非关键脚本
  const lazyScripts = document.querySelectorAll('script[data-lazy-src]');
  lazyScripts.forEach(script => {
    const src = script.dataset.lazySrc;
    if (src) {
      ResourceLoader.lazyLoadScript(src);
      script.remove();
    }
  });
}

// ==================== 关键资源预加载配置 ====================
const CRITICAL_RESOURCES = {
  css: ['css/style.css', 'css/enhanced.css'],
  js: ['js/i18n.js'],
  fonts: []
};

// 页面加载完成后执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPerformanceOptimizations);
} else {
  initPerformanceOptimizations();
}

// 导出到全局
window.LazyLoadImages = LazyLoadImages;
window.LazyLoadBackgrounds = LazyLoadBackgrounds;
window.ResourceLoader = ResourceLoader;
window.Preloader = Preloader;
window.CRITICAL_RESOURCES = CRITICAL_RESOURCES;
