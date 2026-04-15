/**
 * Service Worker 缓存策略配置 - 游导旅游平台
 * 此文件定义了增强的缓存策略配置
 */

const CACHE_CONFIG = {
  // 缓存版本
  version: 'v3.1',
  
  // 各类型资源的缓存策略
  strategies: {
    // 静态资源 (CSS, JS, Font) - Cache First, 30天
    static: {
      name: 'static-assets',
      pattern: /\.(css|js|woff2?|ttf|eot|otf)$/,
      strategy: 'cache-first',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      maxItems: 100,
      description: '静态资源长期缓存，减少重复请求'
    },
    
    // 图片资源 - Stale While Revalidate, 7天
    images: {
      name: 'image-cache',
      pattern: /\.(jpg|jpeg|png|gif|webp|avif|ico|svg)$/,
      strategy: 'stale-while-revalidate',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      maxItems: 200,
      description: '图片缓存兼顾速度与更新'
    },
    
    // HTML页面 - Network First, 1天
    pages: {
      name: 'page-cache',
      pattern: /\.html$/,
      strategy: 'network-first',
      maxAge: 24 * 60 * 60 * 1000,
      maxItems: 50,
      description: 'HTML页面优先获取最新内容'
    },
    
    // API请求 - Network First, 5分钟
    api: {
      name: 'api-cache',
      pattern: /\/api\//,
      strategy: 'network-first',
      maxAge: 5 * 60 * 1000,
      maxItems: 100,
      description: 'API请求保持实时性'
    },
    
    // JSON数据 - Network First, 10分钟
    json: {
      name: 'json-cache',
      pattern: /\.json$/,
      strategy: 'network-first',
      maxAge: 10 * 60 * 1000,
      maxItems: 50,
      description: 'JSON数据缓存'
    }
  },
  
  // 核心应用外壳 (App Shell) - 安装时预缓存
  appShell: [
    '/',
    '/index.html',
    '/offline.html',
    '/loading.html',
    '/manifest.json',
    '/css/style.css',
    '/css/enhanced.css',
    '/css/mobile.css',
    '/css/loading.css',
    '/css/animations.css',
    '/js/enhanced-common.js',
    '/js/theme.js'
  ],
  
  // 导航页面 - 预缓存
  navigationPages: [
    '/index.html',
    '/guides.html',
    '/routes.html',
    '/activities.html',
    '/visa.html',
    '/knowledge.html',
    '/tools.html',
    '/about.html',
    '/contact.html',
    '/faq.html'
  ],
  
  // 常用页面 - 预缓存 (用于快速访问)
  popularPages: [
    '/weather.html',
    '/exchange.html',
    '/community.html',
    '/destinations.html',
    '/books.html'
  ],
  
  // 需要预加载的图片
  preloadImages: [
    '/images/logo.png',
    '/images/placeholder.png'
  ],
  
  // 排除的URL模式 (不缓存)
  excludePatterns: [
    /\/admin-/,
    /\/guide-/,
    /\/user-/,
    /\/api\/auth/,
    /\/api\/payment/,
    /track/,
    /analytics/
  ],
  
  // 缓存大小限制
  sizeLimits: {
    maxCacheSize: 100 * 1024 * 1024, // 100MB
    maxItemSize: 5 * 1024 * 1024     // 5MB
  }
};

// HTTP缓存头配置建议
const HTTP_CACHE_HEADERS = {
  // 静态资源
  static: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Vary': 'Accept-Encoding'
  },
  
  // 图片资源
  images: {
    'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
    'Vary': 'Accept-Encoding'
  },
  
  // HTML页面
  pages: {
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Vary': 'Accept-Encoding'
  },
  
  // API请求
  api: {
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CACHE_CONFIG, HTTP_CACHE_HEADERS };
}
