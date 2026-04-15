/**
 * 游导旅游平台 - 图片组件
 * 
 * 快速生成符合最佳实践的图片 HTML
 */

class ImageComponent {
  /**
   * 生成响应式图片 HTML
   * 
   * @param {Object} options - 配置选项
   * @param {string} options.src - 原始图片路径
   * @param {string} options.alt - 图片描述
   * @param {string} options.className - CSS 类名
   * @param {string} options.sizes - sizes 属性
   * @param {boolean} options.lazy - 是否懒加载
   * @param {boolean} options.lqip - 是否使用 LQIP
   * @param {string} options.lqipSrc - LQIP 占位图路径
   * @param {number} options.quality - 压缩质量
   * @param {string} options.dir - 基础目录
   */
  static responsive(options = {}) {
    const {
      src,
      alt = '',
      className = 'img-responsive',
      sizes = '100vw',
      lazy = true,
      lqip = false,
      lqipSrc = null,
      quality = 80,
      dir = 'images'
    } = options;

    // 获取文件名和目录
    const fileName = src.split('/').pop();
    const baseName = fileName.replace(/\.[^.]+$/, '');
    const ext = fileName.split('.').pop();

    // 生成多格式 srcset
    const webpSrcset = [
      `${dir}/webp/${baseName}-320w.webp 320w`,
      `${dir}/webp/${baseName}-640w.webp 640w`,
      `${dir}/webp/${baseName}-1024w.webp 1024w`,
      `${dir}/webp/${baseName}-1920w.webp 1920w`
    ].join(', ');

    const avifSrcset = [
      `${dir}/avif/${baseName}-320w.avif 320w`,
      `${dir}/avif/${baseName}-640w.avif 640w`,
      `${dir}/avif/${baseName}-1024w.avif 1024w`,
      `${dir}/avif/${baseName}-1920w.avif 1920w`
    ].join(', ');

    const jpgSrcset = [
      `${dir}/responsive/${baseName}-320w.${ext} 320w`,
      `${dir}/responsive/${baseName}-640w.${ext} 640w`,
      `${dir}/responsive/${baseName}-1024w.${ext} 1024w`,
      `${dir}/responsive/${baseName}-1920w.${ext} 1920w`
    ].join(', ');

    const loading = lazy ? 'lazy' : 'eager';
    const decoding = lazy ? 'async' : 'sync';

    // LQIP 样式
    const lqipStyle = lqip && lqipSrc 
      ? `background-image: url('${lqipSrc}'); background-size: cover; filter: blur(20px);`
      : '';

    return `<picture>
  <source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}">
  <source type="image/webp" srcset="${webpSrcset}" sizes="${sizes}">
  <img 
    src="${src}" 
    srcset="${jpgSrcset}" 
    sizes="${sizes}"
    alt="${alt}" 
    class="${className}"
    loading="${loading}"
    decoding="${decoding}"
    style="${lqipStyle}"
  >
</picture>`;
  }

  /**
   * 生成 LQIP 图片 HTML
   */
  static lqip(options = {}) {
    const {
      src,
      lqipSrc,
      alt = '',
      className = 'lazy-image',
      wrapperClass = 'image-wrapper',
      blur = 20,
      fadeDuration = 300
    } = options;

    return `<div class="${wrapperClass}" style="position: relative; overflow: hidden;">
  <img 
    src="${lqipSrc}" 
    alt=""
    aria-hidden="true"
    class="${className}-placeholder"
    style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(${blur}px);
      transform: scale(1.1);
    "
  >
  <img 
    src="${src}" 
    alt="${alt}"
    class="${className}"
    loading="lazy"
    decoding="async"
    style="
      width: 100%;
      height: auto;
      opacity: 0;
      transition: opacity ${fadeDuration}ms ease;
    "
  >
</div>
<script>
document.querySelectorAll('.${className}').forEach(img => {
  if (img.complete) {
    img.classList.add('loaded');
  } else {
    img.addEventListener('load', () => img.classList.add('loaded'));
  }
});
</script>
<style>
.${className}.loaded {
  opacity: 1 !important;
  position: relative;
}
</style>`;
  }

  /**
   * 生成艺术指导图片
   */
  static artDirection(options = {}) {
    const {
      mobile,
      tablet,
      desktop,
      alt = '',
      className = 'img-art-direction'
    } = options;

    return `<picture class="${className}">
  <source media="(max-width: 639px)" srcset="${mobile}">
  <source media="(min-width: 640px) and (max-width: 1023px)" srcset="${tablet}">
  <source media="(min-width: 1024px)" srcset="${desktop}">
  <img src="${desktop}" alt="${alt}" loading="lazy" decoding="async">
</picture>`;
  }

  /**
   * 生成图集轮播 HTML
   */
  static gallery(images = [], options = {}) {
    const {
      className = 'image-gallery',
      thumbSize = 120,
      lazy = true
    } = options;

    if (!images.length) return '';

    const loading = lazy ? 'lazy' : 'eager';

    // 主图
    const mainImage = `<div class="${className}-main">
  <img 
    src="${images[0].src}" 
    alt="${images[0].alt || ''}"
    loading="${loading}"
    id="${className}-main-image"
  >
</div>`;

    // 缩略图
    const thumbs = images.map((img, index) => `
  <button 
    type="button"
    class="${className}-thumb ${index === 0 ? 'active' : ''}"
    onclick="document.getElementById('${className}-main-image').src='${img.src}'; this.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active')); this.classList.add('active');"
  >
    <img src="${img.src}" alt="" width="${thumbSize}">
  </button>`).join('');

    return `<div class="${className}">
  ${mainImage}
  <div class="${className}-thumbs">
    ${thumbs}
  </div>
</div>`;
  }

  /**
   * 生成头像组件
   */
  static avatar(options = {}) {
    const {
      src,
      alt = '用户头像',
      size = 48,
      shape = 'circle', // circle | square | rounded
      className = 'avatar'
    } = options;

    const borderRadius = shape === 'circle' ? '50%' : shape === 'rounded' ? '8px' : '0';

    return `<img 
  src="${src}" 
  alt="${alt}"
  class="${className}"
  width="${size}"
  height="${size}"
  loading="lazy"
  decoding="async"
  style="border-radius: ${borderRadius}; object-fit: cover;"
>`;
  }

  /**
   * 生成品牌 Logo
   */
  static logo(options = {}) {
    const {
      type = 'horizontal', // horizontal | vertical | icon | compass
      size = 'medium', // small | medium | large
      dark = false,
      className = 'brand-logo'
    } = options;

    const sizes = {
      small: { width: 80, height: 'auto' },
      medium: { width: 120, height: 'auto' },
      large: { width: 200, height: 'auto' }
    };

    const fileName = dark ? `logo-${type}-dark.svg` : `logo-${type}.svg`;

    return `<img 
  src="images/${fileName}"
  alt="游导旅行"
  class="${className}"
  width="${sizes[size].width}"
  height="${sizes[size].height}"
  loading="lazy"
>`;
  }

  /**
   * 生成目的地图标
   */
  static destination(country, options = {}) {
    const {
      size = 48,
      className = 'destination-icon'
    } = options;

    const countryMap = {
      japan: 'destination-japan.svg',
      thailand: 'destination-thailand.svg',
      france: 'destination-france.svg',
      australia: 'destination-australia.svg'
    };

    const fileName = countryMap[country.toLowerCase()] || countryMap.japan;

    return `<img 
  src="images/${fileName}"
  alt="${country}"
  class="${className}"
  width="${size}"
  height="${size}"
  loading="lazy"
>`;
  }

  /**
   * 生成占位图
   */
  static placeholder(options = {}) {
    const {
      width = 300,
      height = 200,
      text = '',
      className = 'placeholder',
      bgColor = '#f0f0f0',
      textColor = '#999'
    } = options;

    return `<div 
  class="${className}"
  style="
    width: ${width}px;
    height: ${height}px;
    background-color: ${bgColor};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${textColor};
    font-size: 14px;
  "
>
  ${text || `${width}×${height}`}
</div>`;
  }

  /**
   * 生成骨架屏
   */
  static skeleton(options = {}) {
    const {
      width = '100%',
      height = 200,
      className = 'skeleton'
    } = options;

    return `<div 
  class="${className}"
  style="
    width: ${width};
    height: ${typeof height === 'number' ? height + 'px' : height};
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s infinite;
  "
></div>
<style>
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>`;
  }
}

// ========== 快捷生成函数 ==========

/**
 * 生成响应式图片 (简洁版)
 */
function img(src, alt, options = {}) {
  return ImageComponent.responsive({ src, alt, ...options });
}

/**
 * 生成头像
 */
function avatar(src, size, options = {}) {
  return ImageComponent.avatar({ src, size, ...options });
}

/**
 * 生成 Logo
 */
function logo(type = 'horizontal', size = 'medium') {
  return ImageComponent.logo({ type, size });
}

/**
 * 生成目的地图标
 */
function destination(country, size = 48) {
  return ImageComponent.destination(country, { size });
}

/**
 * 生成占位图
 */
function placeholder(width, height, text = '') {
  return ImageComponent.placeholder({ width, height, text });
}

/**
 * 生成骨架屏
 */
function skeleton(width = '100%', height = 200) {
  return ImageComponent.skeleton({ width, height });
}

// ========== 导出 ==========

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ImageComponent,
    img,
    avatar,
    logo,
    destination,
    placeholder,
    skeleton
  };
}

if (typeof window !== 'undefined') {
  window.ImageComponent = ImageComponent;
  window.img = img;
  window.avatar = avatar;
  window.logo = logo;
  window.destination = destination;
  window.placeholder = placeholder;
  window.skeleton = skeleton;
}
