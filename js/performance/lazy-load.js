/**
 * 高级图片懒加载 - 游导旅游平台
 * 功能：IntersectionObserver实现、图片占位符、加载动画效果
 */

class EnhancedLazyLoad {
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '100px 0px',
      threshold: options.threshold || 0.1,
      selector: options.selector || 'img[data-src]',
      placeholderClass: options.placeholderClass || 'lazy-placeholder',
      loadedClass: options.loadedClass || 'lazy-loaded',
      errorClass: options.errorClass || 'lazy-error',
      onLoad: options.onLoad || null,
      onError: options.onError || null
    };
    
    this.loadedCount = 0;
    this.errorCount = 0;
    this.observer = null;
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    if (!('IntersectionObserver' in window)) {
      this.fallbackLoad();
      return;
    }

    this.setupPlaceholderStyles();
    this.createObserver();
    this.observeElements();
    this.observeBackgrounds();
    this.observeVideos();
  }

  setupPlaceholderStyles() {
    if (document.getElementById('lazy-load-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'lazy-load-styles';
    styles.textContent = `
      .lazy-placeholder {
        background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
        position: relative;
        overflow: hidden;
      }
      .lazy-placeholder::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.4),
          transparent
        );
        animation: shimmer 1.5s infinite;
      }
      .lazy-placeholder::after {
        content: '🖼️';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 2rem;
        opacity: 0.3;
      }
      @keyframes shimmer {
        100% { left: 100%; }
      }
      img.lazy-loaded {
        animation: fadeIn 0.4s ease-out forwards;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      img.lazy-error {
        filter: grayscale(100%);
      }
      .bg-lazy {
        transition: background-image 0.3s ease;
      }
      video.lazy-loaded {
        animation: fadeIn 0.4s ease-out forwards;
      }
    `;
    document.head.appendChild(styles);
  }

  createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadElement(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });
  }

  observeElements() {
    document.querySelectorAll(this.options.selector).forEach(el => {
      el.classList.add(this.options.placeholderClass);
      el.dataset.originalAlt = el.alt || '';
      el.alt = '加载中...';
      this.observer.observe(el);
    });
  }

  observeBackgrounds() {
    document.querySelectorAll('[data-bg]').forEach(el => {
      el.classList.add('bg-lazy');
      el.style.backgroundImage = 'none';
      this.observer.observe(el);
    });
  }

  observeVideos() {
    document.querySelectorAll('video[data-src]').forEach(el => {
      this.observer.observe(el);
    });
  }

  loadElement(el) {
    const tagName = el.tagName.toLowerCase();

    if (tagName === 'img') {
      this.loadImage(el);
    } else if (tagName === 'video') {
      this.loadVideo(el);
    } else {
      this.loadBackground(el);
    }
  }

  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    const sizes = img.dataset.sizes;

    if (!src) return;

    const tempImage = new Image();
    
    tempImage.onload = () => {
      img.src = src;
      if (srcset) img.srcset = srcset;
      if (sizes) img.sizes = sizes;
      img.alt = img.dataset.originalAlt || '';
      img.classList.remove(this.options.placeholderClass);
      img.classList.add(this.options.loadedClass);
      this.loadedCount++;
      
      if (this.options.onLoad) {
        this.options.onLoad(img, this.loadedCount);
      }

      this.dispatchEvent('lazyload:loaded', { element: img, count: this.loadedCount });
    };

    tempImage.onerror = () => {
      img.classList.remove(this.options.placeholderClass);
      img.classList.add(this.options.errorClass);
      img.alt = img.dataset.originalAlt || '图片加载失败';
      this.errorCount++;
      
      if (this.options.onError) {
        this.options.onError(img, this.errorCount);
      }

      this.dispatchEvent('lazyload:error', { element: img, count: this.errorCount });
    };

    tempImage.src = src;
  }

  loadVideo(video) {
    const src = video.dataset.src;
    if (!src) return;

    video.src = src;
    video.classList.add(this.options.loadedClass);
    this.loadedCount++;
    
    if (video.dataset.poster) {
      video.poster = video.dataset.poster;
    }

    this.dispatchEvent('lazyload:loaded', { element: video, count: this.loadedCount });
  }

  loadBackground(el) {
    const bg = el.dataset.bg;
    if (!bg) return;

    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage = `url(${bg})`;
      el.classList.add(this.options.loadedClass);
      el.removeAttribute('data-bg');
      this.loadedCount++;
      
      this.dispatchEvent('lazyload:loaded', { element: el, count: this.loadedCount });
    };
    img.onerror = () => {
      el.classList.add(this.options.errorClass);
      this.errorCount++;
    };
    img.src = bg;
  }

  fallbackLoad() {
    document.querySelectorAll(this.options.selector).forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.add(this.options.loadedClass);
      }
    });
    
    document.querySelectorAll('[data-bg]').forEach(el => {
      if (el.dataset.bg) {
        el.style.backgroundImage = `url(${el.dataset.bg})`;
      }
    });
  }

  dispatchEvent(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  getStats() {
    return {
      loaded: this.loadedCount,
      errors: this.errorCount,
      total: this.loadedCount + this.errorCount
    };
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// ==================== 图片预加载器 ====================
class ImagePreloader {
  constructor() {
    this.queue = [];
    this.loading = false;
    this.maxConcurrent = 3;
    this.currentLoading = 0;
  }

  add(url, options = {}) {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, options, resolve, reject });
      this.processQueue();
    });
  }

  addBatch(urls, options = {}) {
    return Promise.all(urls.map(url => this.add(url, options)));
  }

  processQueue() {
    if (this.loading || this.currentLoading >= this.maxConcurrent) return;
    
    const item = this.queue.shift();
    if (!item) return;

    this.loading = true;
    this.currentLoading++;

    const img = new Image();
    img.onload = () => {
      this.currentLoading--;
      this.loading = false;
      item.resolve(img);
      this.processQueue();
    };
    img.onerror = () => {
      this.currentLoading--;
      this.loading = false;
      item.reject(new Error(`Failed to load: ${item.url}`));
      this.processQueue();
    };
    img.src = item.url;
  }

  clear() {
    this.queue = [];
  }
}

// ==================== 响应式图片处理 ====================
const ResponsiveImages = {
  // 获取最佳图片源
  getBestSource(img) {
    const sources = img.dataset.sources;
    if (!sources) return null;

    try {
      const parsedSources = JSON.parse(sources);
      const viewportWidth = window.innerWidth;
      const dpr = window.devicePixelRatio || 1;

      for (const source of parsedSources) {
        if (viewportWidth <= source.maxWidth) {
          return {
            src: source.src,
            srcset: source.srcset,
            type: source.type
          };
        }
      }
      return parsedSources[parsedSources.length - 1];
    } catch (e) {
      return null;
    }
  },

  // 初始化响应式图片
  init() {
    document.querySelectorAll('img[data-sources]').forEach(img => {
      const best = this.getBestSource(img);
      if (best && best.src) {
        img.dataset.src = best.src;
      }
    });

    window.addEventListener('resize', this.debounce(() => {
      document.querySelectorAll('img[data-sources]').forEach(img => {
        const best = this.getBestSource(img);
        if (best && best.src && img.src !== best.src) {
          img.dataset.src = best.src;
        }
      });
    }, 300));
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// ==================== WebP格式检测与切换 ====================
const WebPDetector = {
  supported: null,

  async check() {
    if (this.supported !== null) return this.supported;

    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        this.supported = img.width === 1;
        resolve(this.supported);
      };
      img.onerror = () => {
        this.supported = false;
        resolve(false);
      };
      img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    });
  },

  getImageUrl(originalUrl) {
    if (!this.supported) return originalUrl;
    
    // 替换扩展名为.webp
    return originalUrl.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
  }
};

// ==================== 导出API ====================
const LazyLoadAPI = {
  lazyLoader: null,
  preloader: new ImagePreloader(),

  init(options = {}) {
    this.lazyLoader = new EnhancedLazyLoad(options);
    ResponsiveImages.init();
    WebPDetector.check();
    return this.lazyLoader;
  },

  preloadImages(urls) {
    return this.preloader.addBatch(urls);
  },

  getSupported() {
    return 'IntersectionObserver' in window;
  }
};

// 自动初始化
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LazyLoadAPI.init());
  } else {
    LazyLoadAPI.init();
  }
}

// 导出到全局
if (typeof window !== 'undefined') {
  window.EnhancedLazyLoad = EnhancedLazyLoad;
  window.ImagePreloader = ImagePreloader;
  window.LazyLoadAPI = LazyLoadAPI;
  window.WebPDetector = WebPDetector;
}
