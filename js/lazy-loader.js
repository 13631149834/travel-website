/**
 * 游导旅游平台 - 增强型懒加载组件
 * 
 * 功能：
 * - 渐进式加载 (Progressive Loading)
 * - LQIP 占位预览 (Low Quality Image Placeholder)
 * - 模糊预览 (Blur-up)
 * - Intersection Observer 优化
 * - 占位图/骨架屏支持
 */

class LazyLoader {
  constructor(options = {}) {
    this.options = {
      root: options.root || null,
      rootMargin: options.rootMargin || '50px 0px',
      threshold: options.threshold || 0.01,
      loadDelay: options.loadDelay || 100,
      fadeIn: options.fadeIn !== false,
      fadeDuration: options.fadeDuration || 300,
      blurAmount: options.blurAmount || 20,
      placeholderType: options.placeholderType || 'blur', // blur | skeleton | color | lqip
      defaultColor: options.defaultColor || '#f0f0f0',
      skipHidden: options.skipHidden !== false,
      forceLoad: options.forceLoad || false,
      onLoad: options.onLoad || null,
      onError: options.onError || null,
      ...options
    };
    
    this.observer = null;
    this.loadedImages = new Set();
    this.init();
  }

  init() {
    if (typeof IntersectionObserver === 'undefined') {
      // 回退到立即加载
      this.loadAllImages();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: this.options.root,
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    );

    this.observeImages();
    
    // 监听动态添加的图片
    if (typeof MutationObserver !== 'undefined') {
      this.setupMutationObserver();
    }
  }

  /**
   * 观察所有需要懒加载的图片
   */
  observeImages() {
    const images = document.querySelectorAll('img[data-src], [data-bg-src]');
    
    images.forEach(img => {
      // 跳过已加载的
      if (this.loadedImages.has(img)) return;
      
      // 跳过隐藏的（可选）
      if (this.options.skipHidden && this.isHidden(img)) return;
      
      this.observer.observe(img);
    });
  }

  /**
   * 处理交叉观察回调
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        
        if (target.tagName === 'IMG') {
          this.loadImage(target);
        } else if (target.hasAttribute('data-bg-src')) {
          this.loadBackground(target);
        }
        
        this.observer.unobserve(target);
      }
    });
  }

  /**
   * 加载图片
   */
  async loadImage(img) {
    if (this.loadedImages.has(img)) return;
    if (img.src && img.src.includes(img.dataset.src)) return;
    
    const src = img.dataset.src;
    if (!src) return;

    this.loadedImages.add(img);
    
    // 设置占位状态
    this.applyPlaceholder(img);
    
    // 延迟加载
    await this.delay(this.options.loadDelay);
    
    // 创建新图片预加载
    const tempImg = new Image();
    
    tempImg.onload = () => {
      img.src = src;
      
      if (this.options.fadeIn) {
        this.fadeIn(img);
      } else {
        img.style.opacity = '1';
      }
      
      // 移除占位样式
      this.removePlaceholder(img);
      
      // 触发回调
      if (typeof this.options.onLoad === 'function') {
        this.options.onLoad(img);
      }
      
      // 触发事件
      img.dispatchEvent(new CustomEvent('lazyloaded', { detail: { src } }));
    };
    
    tempImg.onerror = () => {
      img.style.opacity = '1';
      this.removePlaceholder(img);
      
      if (typeof this.options.onError === 'function') {
        this.options.onError(img, src);
      }
      
      img.dispatchEvent(new CustomEvent('lazyerror', { detail: { src } }));
    };
    
    tempImg.src = src;
  }

  /**
   * 加载背景图
   */
  loadBackground(element) {
    const src = element.dataset.bgSrc;
    if (!src) return;
    
    // 预加载图片
    const img = new Image();
    img.onload = () => {
      element.style.backgroundImage = `url('${src}')`;
      element.classList.add('bg-loaded');
    };
    img.src = src;
  }

  /**
   * 应用占位状态
   */
  applyPlaceholder(img) {
    const placeholderType = img.dataset.placeholder || this.options.placeholderType;
    
    switch (placeholderType) {
      case 'blur':
        img.style.filter = `blur(${this.options.blurAmount}px)`;
        img.style.transition = `filter ${this.options.fadeDuration}ms ease-out`;
        break;
        
      case 'skeleton':
        const wrapper = img.closest('.image-wrapper') || this.createWrapper(img);
        wrapper.classList.add('skeleton-loading');
        break;
        
      case 'color':
        const bgColor = img.dataset.bgColor || this.options.defaultColor;
        img.style.backgroundColor = bgColor;
        break;
        
      case 'lqip':
        if (img.dataset.lqip) {
          img.style.backgroundImage = `url('${img.dataset.lqip}')`;
          img.style.backgroundSize = 'cover';
          img.style.backgroundPosition = 'center';
          img.style.filter = `blur(${this.options.blurAmount}px)`;
        }
        break;
    }
  }

  /**
   * 移除占位状态
   */
  removePlaceholder(img) {
    img.style.filter = 'none';
    img.style.backgroundColor = '';
    img.style.backgroundImage = '';
    
    const wrapper = img.closest('.image-wrapper');
    if (wrapper) {
      wrapper.classList.remove('skeleton-loading');
    }
  }

  /**
   * 淡入效果
   */
  fadeIn(img) {
    img.style.opacity = '0';
    
    requestAnimationFrame(() => {
      img.style.transition = `opacity ${this.options.fadeDuration}ms ease-out`;
      img.style.opacity = '1';
    });
  }

  /**
   * 创建包裹元素
   */
  createWrapper(img) {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-wrapper';
    wrapper.style.cssText = 'position: relative; overflow: hidden;';
    
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    
    return wrapper;
  }

  /**
   * 检查元素是否隐藏
   */
  isHidden(element) {
    return !element.offsetWidth && !element.offsetHeight;
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 设置 MutationObserver 监听动态内容
   */
  setupMutationObserver() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.tagName === 'IMG' && node.dataset.src) {
              this.observer.observe(node);
            }
            
            // 检查子元素
            const images = node.querySelectorAll?.('img[data-src]');
            images?.forEach(img => this.observer.observe(img));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * 加载所有图片（无 IntersectionObserver 回退）
   */
  loadAllImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => this.loadImage(img));
  }

  /**
   * 重新观察（内容更新后）
   */
  refresh() {
    this.observeImages();
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// ==================== HTML 增强工具 ====================

/**
 * 增强图片 HTML - 添加懒加载支持
 */
function enhanceImageHTML(img, options = {}) {
  const {
    lazy = true,
    lqip = null,
    sizes = '100vw',
    srcset = null,
    className = 'lazy-image'
  } = options;

  // 复制属性
  const enhanced = img.cloneNode(false);
  
  // 设置懒加载属性
  if (lazy) {
    enhanced.dataset.src = img.src || img.dataset.src;
    enhanced.removeAttribute('src');
    enhanced.setAttribute('loading', 'lazy');
    enhanced.setAttribute('decoding', 'async');
    
    if (className) {
      enhanced.className = [...(enhanced.className || '').split(' '), className].filter(Boolean).join(' ');
    }
    
    // LQIP
    if (lqip) {
      enhanced.dataset.lqip = lqip;
    }
  }
  
  // srcset
  if (srcset) {
    enhanced.setAttribute('srcset', srcset);
    enhanced.setAttribute('sizes', sizes);
  }
  
  return enhanced;
}

/**
 * 生成骨架屏占位 HTML
 */
function generateSkeletonHTML(width, height, className = 'skeleton') {
  const aspectRatio = height / width * 100;
  
  return `
<div class="${className}-container" style="position: relative; width: 100%; padding-bottom: ${aspectRatio}%;">
  <div class="${className} ${className}-animate" style="
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
  "></div>
</div>
<style>
.${className}-animate {
  animation: ${className}-shimmer 1.5s infinite;
}
@keyframes ${className}-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>`;
}

/**
 * 生成 LQIP HTML
 */
function generateLQIPHTML(src, lqipSrc, alt, options = {}) {
  const {
    blur = 20,
    fadeDuration = 300,
    className = 'lazy-image',
    wrapperClass = 'image-lazy-wrapper'
  } = options;

  return `
<div class="${wrapperClass}" style="position: relative; overflow: hidden;">
  <!-- LQIP 占位 -->
  <img src="${lqipSrc}" 
       alt=""
       aria-hidden="true"
       class="${className}-lqip"
       style="
         position: absolute;
         top: 0;
         left: 0;
         width: 100%;
         height: 100%;
         object-fit: cover;
         filter: blur(${blur}px);
         transform: scale(1.1);
         transition: opacity ${fadeDuration}ms ease;
       ">
  <!-- 真实图片 -->
  <img src="${src}" 
       alt="${alt}"
       class="${className}"
       loading="lazy"
       decoding="async"
       data-lqip="${lqipSrc}"
       style="
         width: 100%;
         height: auto;
         opacity: 0;
         transition: opacity ${fadeDuration}ms ease;
       ">
</div>
<style>
.${className}.loaded {
  opacity: 1 !important;
}
.${className}.loaded ~ .${className}-lqip {
  opacity: 0;
}
</style>
<script>
document.querySelectorAll('.${className}').forEach(img => {
  if (img.complete && img.naturalWidth > 0) {
    img.classList.add('loaded');
  } else {
    img.addEventListener('load', () => img.classList.add('loaded'));
    img.addEventListener('error', () => img.classList.add('loaded'));
  }
});
</script>`;
}

// ==================== 导出 ====================

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LazyLoader, enhanceImageHTML, generateSkeletonHTML, generateLQIPHTML };
}

// 浏览器环境
if (typeof window !== 'undefined') {
  window.LazyLoader = LazyLoader;
  window.enhanceImageHTML = enhanceImageHTML;
  window.generateSkeletonHTML = generateSkeletonHTML;
  window.generateLQIPHTML = generateLQIPHTML;
}

// 自动初始化
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // 不自动初始化，让用户控制
    // window.lazyLoader = new LazyLoader();
  });
}
