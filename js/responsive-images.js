/**
 * 游导旅游平台 - 响应式图片工具
 * 
 * 功能：
 * - 自动生成 srcset 属性
 * - 艺术指导 (Art Direction)
 * - 格式回退支持
 * - 智能尺寸计算
 */

class ResponsiveImage {
  constructor(options = {}) {
    this.sizes = options.sizes || {
      thumbnail: 320,
      small: 640,
      medium: 1024,
      large: 1920,
      xlarge: 2560
    };
    this.quality = options.quality || 80;
    this.formats = options.formats || ['webp', 'avif', 'jpeg'];
    this.enableLazy = options.enableLazy !== false;
    this.enableLQIP = options.enableLQIP || false;
    this.lqipDir = options.lqipDir || 'images/lqip/';
  }

  /**
   * 生成响应式图片 HTML
   */
  generateResponsive({
    src,
    alt,
    className = '',
    sizes = '100vw',
    breakpoints = {},
    lazy = this.enableLazy,
    lqip = this.enableLQIP,
    pictureClass = ''
  }) {
    // 获取基础文件名
    const baseName = this.getBaseName(src);
    const ext = this.getExtension(src);
    const dir = this.getDirectory(src);
    
    // 生成所有格式和尺寸的 srcset
    const sources = [];
    
    // AVIF (最佳压缩)
    if (this.formats.includes('avif')) {
      sources.push({
        type: 'image/avif',
        srcset: this.generateSrcset(dir, baseName, 'avif'),
        sizes
      });
    }
    
    // WebP (广泛支持)
    if (this.formats.includes('webp')) {
      sources.push({
        type: 'image/webp',
        srcset: this.generateSrcset(dir, baseName, 'webp'),
        sizes
      });
    }
    
    // JPEG 回退
    sources.push({
      type: 'image/jpeg',
      srcset: this.generateSrcset(dir, baseName, 'jpg'),
      sizes
    });
    
    // 生成 HTML
    let html = '';
    
    if (sources.length > 1) {
      html += `<picture class="${pictureClass}">\n`;
      for (const source of sources) {
        html += `  <source type="${source.type}" srcset="${source.srcset}" sizes="${source.sizes}">\n`;
      }
    }
    
    // 构建 img 标签
    const defaultSrcset = this.generateSrcset(dir, baseName, 'jpg');
    const loading = lazy ? 'lazy' : 'eager';
    const decoding = lazy ? 'async' : 'sync';
    
    if (lqip) {
      // LQIP 版本
      const lqipSrc = `${this.lqipDir}${baseName}-lqip.jpg`;
      html += `  <div class="image-wrapper ${className}">\n`;
      html += `    <img class="image-lqip" src="${lqipSrc}" alt="" aria-hidden="true">\n`;
      html += `    <img class="image-full" src="${src}" srcset="${defaultSrcset}" sizes="${sizes}" alt="${alt}" loading="${loading}" decoding="${decoding}">\n`;
      html += `  </div>\n`;
    } else {
      html += `  <img src="${src}" srcset="${defaultSrcset}" sizes="${sizes}" alt="${alt}" class="${className}" loading="${loading}" decoding="${decoding}">\n`;
    }
    
    if (sources.length > 1) {
      html += `</picture>`;
    }
    
    return html;
  }

  /**
   * 生成艺术指导图片
   */
  generateArtDirection({
    mobile,
    tablet,
    desktop,
    alt,
    className = '',
    lazy = true
  }) {
    const loading = lazy ? 'lazy' : 'eager';
    const decoding = lazy ? 'async' : 'sync';
    
    let html = `<picture class="${className}">\n`;
    
    // 移动端优先
    if (mobile.webp) {
      html += `  <source media="(max-width: 639px)" type="image/webp" srcset="${mobile.webp}">\n`;
    }
    if (mobile.avif) {
      html += `  <source media="(max-width: 639px)" type="image/avif" srcset="${mobile.avif}">\n`;
    }
    html += `  <source media="(max-width: 639px)" srcset="${mobile.src}">\n`;
    
    // 平板
    if (tablet.webp) {
      html += `  <source media="(min-width: 640px) and (max-width: 1023px)" type="image/webp" srcset="${tablet.webp}">\n`;
    }
    if (tablet.avif) {
      html += `  <source media="(min-width: 640px) and (max-width: 1023px)" type="image/avif" srcset="${tablet.avif}">\n`;
    }
    html += `  <source media="(min-width: 640px) and (max-width: 1023px)" srcset="${tablet.src}">\n`;
    
    // 桌面
    if (desktop.webp) {
      html += `  <source media="(min-width: 1024px)" type="image/webp" srcset="${desktop.webp}">\n`;
    }
    if (desktop.avif) {
      html += `  <source media="(min-width: 1024px)" type="image/avif" srcset="${desktop.avif}">\n`;
    }
    html += `  <source media="(min-width: 1024px)" srcset="${desktop.src}">\n`;
    
    // 默认回退
    html += `  <img src="${desktop.src}" alt="${alt}" loading="${loading}" decoding="${decoding}">\n`;
    html += `</picture>`;
    
    return html;
  }

  /**
   * 生成 srcset 字符串
   */
  generateSrcset(dir, baseName, format) {
    const parts = [];
    
    for (const [name, width] of Object.entries(this.sizes)) {
      const fileName = `${baseName}-${width}w.${format}`;
      const fullPath = `${dir}/${fileName}`;
      parts.push(`${fullPath} ${width}w`);
    }
    
    return parts.join(',\n           ');
  }

  /**
   * 生成 sizes 属性
   */
  static generateSizes(breakpoints = {}) {
    const defaults = {
      full: '(max-width: 100%) 100vw',
      half: '(max-width: 100%) 50vw',
      third: '(max-width: 100%) 33vw',
      sidebar: '300px',
      hero: '100vw'
    };
    
    const result = [];
    
    for (const [name, size] of Object.entries({ ...defaults, ...breakpoints })) {
      result.push(size);
    }
    
    return result.join(', ');
  }

  /**
   * 生成 LQIP HTML
   */
  generateLQIP(src, alt = '', options = {}) {
    const {
      blur = 20,
      transition = 'opacity 0.3s ease',
      className = 'lazy-image'
    } = options;
    
    const baseName = this.getBaseName(src);
    const lqipSrc = `${this.lqipDir}${baseName}-lqip.jpg`;
    
    return `
<div class="${className}-wrapper" style="position: relative; overflow: hidden;">
  <img src="${lqipSrc}" 
       class="${className}-placeholder"
       alt=""
       aria-hidden="true"
       style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(${blur}px); transform: scale(1.1);">
  <img src="${src}" 
       class="${className}-full"
       alt="${alt}"
       loading="lazy"
       decoding="async"
       style="width: 100%; height: auto; opacity: 0; transition: ${transition};">
</div>
<style>
.${className}-full.loaded {
  opacity: 1 !important;
  position: relative;
}
.${className}-placeholder {
  transition: opacity 0.3s ease;
}
.${className}-full.loaded ~ .${className}-placeholder {
  opacity: 0;
}
</style>
<script>
document.querySelectorAll('.${className}-full').forEach(img => {
  if (img.complete) {
    img.classList.add('loaded');
  } else {
    img.addEventListener('load', () => img.classList.add('loaded'));
  }
});
</script>`;
  }

  /**
   * 生成渐进式 JPEG HTML
   */
  generateProgressive(src, alt = '', className = '') {
    return `
<img src="${src}" 
     alt="${alt}" 
     class="${className}"
     loading="lazy"
     decoding="async"
     style="background: linear-gradient(to bottom, #f0f0f0, #e0e0e0);">
<script>
(function() {
  const img = document.querySelector('img[src="${src}"]');
  if (img) {
    img.onload = function() {
      img.style.background = 'none';
    };
  }
})();
</script>`;
  }

  /**
   * 生成 CSS background-image 响应式
   */
  generateBackgroundResponsive({
    src,
    className,
    breakpoints = {}
  }) {
    const baseName = this.getBaseName(src);
    const dir = this.getDirectory(src);
    
    let css = `.${className} {\n`;
    css += `  background-image: url('${dir}/${baseName}-1920w.jpg');\n`;
    css += `  background-image: -webkit-image-set(\n`;
    
    for (const [name, width] of Object.entries(this.sizes)) {
      css += `    url('${dir}/${baseName}-${width}w.jpg') ${width}w`;
      if (width !== Object.values(this.sizes).pop()) {
        css += ',\n';
      }
    }
    
    css += `\n  );\n`;
    
    // 响应式断点
    for (const [breakpoint, size] of Object.entries(breakpoints)) {
      css += `  @media (max-width: ${breakpoint}) {\n`;
      css += `    background-image: url('${dir}/${baseName}-${size}w.jpg');\n`;
      css += `  }\n`;
    }
    
    css += `}`;
    
    return css;
  }

  /**
   * 生成 CSS 背景图 (WebP 回退)
   */
  generateBackgroundWebP(src, className, options = {}) {
    const { fallback = 'jpg' } = options;
    const baseName = this.getBaseName(src);
    const dir = this.getDirectory(src);
    
    return `
.${className} {
  background-image: url('${dir}/${baseName}.${fallback}');
}
@supports (background-image: url('${dir}/${baseName}.webp')) {
  .${className} {
    background-image: url('${dir}/${baseName}.webp');
  }
}`;
  }

  // ========== 辅助方法 ==========

  getBaseName(src) {
    return path.basename(src, path.extname(src));
  }

  getExtension(src) {
    return path.extname(src);
  }

  getDirectory(src) {
    const dir = path.dirname(src);
    return dir === '.' ? 'images' : dir;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponsiveImage;
}

// ========== 快捷函数 ==========

/**
 * 快速生成响应式图片
 */
function responsive(src, alt, options = {}) {
  const ri = new ResponsiveImage(options);
  return ri.generateResponsive({ src, alt, ...options });
}

/**
 * 快速生成艺术指导
 */
function artDirection(mobile, tablet, desktop, alt, options = {}) {
  const ri = new ResponsiveImage(options);
  return ri.generateArtDirection({ mobile, tablet, desktop, alt, ...options });
}

/**
 * 快速生成 LQIP
 */
function lqip(src, alt, options = {}) {
  const ri = new ResponsiveImage(options);
  return ri.generateLQIP(src, alt, options);
}

// 浏览器环境
if (typeof window !== 'undefined') {
  window.ResponsiveImage = ResponsiveImage;
  window.responsive = responsive;
  window.artDirection = artDirection;
  window.lqip = lqip;
}
