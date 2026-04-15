// Service Worker for 游导旅游 PWA - 优化版缓存策略
const CACHE_VERSION = 'v2';
const STATIC_CACHE_NAME = `youdau-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `youdau-dynamic-${CACHE_VERSION}`;
const API_CACHE_NAME = `youdau-api-${CACHE_VERSION}`;

// 缓存配置
const CACHE_CONFIG = {
  // 静态资源缓存期限（7天）
  staticMaxAge: 7 * 24 * 60 * 60 * 1000,
  // 动态内容缓存期限（1天）
  dynamicMaxAge: 24 * 60 * 60 * 1000,
  // API缓存期限（5分钟）
  apiMaxAge: 5 * 60 * 1000,
  // 最大缓存数量
  maxCacheItems: 100
};

// 核心静态资源 - 应用外壳
const CORE_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/style.css',
  '/css/enhanced.css',
  '/css/animations.css',
  '/css/loading.css',
  '/css/mobile.css',
  '/css/performance.css',
  '/manifest.json'
];

// 所有静态资源模式
const STATIC_ASSET_PATTERNS = [
  /\.css$/,
  /\.js$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.gif$/,
  /\.svg$/,
  /\.ico$/,
  /\.woff2?$/,
  /\.woff$/,
  /\.ttf$/,
  /\.eot$/
];

// API路径模式
const API_PATTERNS = [
  /\/api\//,
  /\/data\//,
  /\/json\//,
  /fetch.*\.json$/
];

// 图片路径模式
const IMAGE_PATTERNS = [
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.gif$/,
  /\.svg$/,
  /\.webp$/,
  /\.ico$/
];

// 导航页面
const NAVIGATION_PAGES = [
  '/index.html',
  '/guides.html',
  '/routes.html',
  '/visa.html',
  '/knowledge.html',
  '/tools.html',
  '/about.html',
  '/contact.html',
  '/faq.html',
  '/weather.html',
  '/exchange.html',
  '/community.html',
  '/destinations.html',
  '/books.html',
  '/apps.html'
];

// ============================================
// 安装事件 - 预缓存核心资源
// ============================================
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker v' + CACHE_VERSION + '...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[SW] Precaching core shell assets');
        return cache.addAll(CORE_SHELL);
      })
      .then(() => {
        console.log('[SW] Skip waiting to activate immediately');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Install failed:', err);
      })
  );
});

// ============================================
// 激活事件 - 清理旧版本缓存
// ============================================
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => {
              // 删除不属于当前版本的所有缓存
              return !name.includes(CACHE_VERSION);
            })
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
  
  // 立即触发一次缓存预热
  event.waitUntil(warmUpCache());
});

// ============================================
// 缓存预热 - 预加载常用页面
// ============================================
async function warmUpCache() {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    
    // 预缓存导航页面
    const pagesToPrecache = [...CORE_SHELL, ...NAVIGATION_PAGES];
    
    await Promise.all(
      pagesToPrecache.map(async (page) => {
        try {
          const response = await fetch(page);
          if (response.ok) {
            await cache.put(page, response);
            console.log('[SW] Pre-cached:', page);
          }
        } catch (e) {
          console.log('[SW] Skipped:', page);
        }
      })
    );
    
    console.log('[SW] Cache warm-up completed');
  } catch (e) {
    console.error('[SW] Cache warm-up failed:', e);
  }
}

// ============================================
// 请求拦截 - 智能缓存策略
// ============================================
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }
  
  // 忽略 chrome-extension 和其他非http(s)请求
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // 根据请求类型应用不同策略
  if (isStaticAsset(request)) {
    // 静态资源：缓存优先 (Cache First)
    event.respondWith(cacheFirst(request));
  } else if (isApiRequest(request)) {
    // API请求：网络优先，失败时用缓存 (Network First, Fallback to Cache)
    event.respondWith(networkFirst(request, API_CACHE_NAME));
  } else if (isImageRequest(request)) {
    // 图片：缓存优先 (Cache First)
    event.respondWith(cacheFirst(request));
  } else if (request.mode === 'navigate') {
    // HTML页面：网络优先，失败时用缓存 (Stale-While-Revalidate)
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // 其他请求：网络优先
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
  }
});

// ============================================
// 缓存策略实现
// ============================================

/**
 * 缓存优先策略 - 适用于静态资源（CSS/JS/图片）
 * 先返回缓存，同时在后台更新缓存
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // 返回缓存，同时在后台更新
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  // 缓存未命中，从网络获取
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(getCacheName(request));
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache-first fetch failed for:', request.url);
    // 返回离线占位符
    return getOfflinePlaceholder(request);
  }
}

/**
 * 网络优先策略 - 适用于API和动态内容
 * 先尝试网络，失败时返回缓存
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      // 存储响应和时间戳
      const responseToCache = networkResponse.clone();
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network-first falling back to cache for:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // API请求没有缓存时返回空
    if (isApiRequest(request)) {
      return new Response(JSON.stringify({ error: 'offline', message: '离线状态' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return getOfflinePlaceholder(request);
  }
}

/**
 * Stale-While-Revalidate策略 - 适用于HTML页面
 * 立即返回缓存，同时在后台更新
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // 同时发起网络请求
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);
  
  // 优先返回缓存，如果没有缓存则等待网络
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }
  
  // 都失败时返回离线页面
  return getOfflinePage();
}

// ============================================
// 后台缓存更新
// ============================================
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cacheName = getCacheName(request);
      const cache = await caches.open(cacheName);
      
      // 检查缓存大小限制
      const cacheKeys = await cache.keys();
      if (cacheKeys.length >= CACHE_CONFIG.maxCacheItems) {
        // 删除最早的缓存项
        await cache.delete(cacheKeys[0]);
      }
      
      await cache.put(request, networkResponse);
    }
  } catch (e) {
    // 后台更新失败不影响主流程
  }
}

// ============================================
// 离线页面和占位符
// ============================================
async function getOfflinePage() {
  // 尝试匹配缓存中的离线页面
  const offlinePage = await caches.match('/offline.html');
  if (offlinePage) {
    return offlinePage;
  }
  
  // 如果没有专门的离线页面，返回index.html
  return caches.match('/index.html');
}

async function getOfflinePlaceholder(request) {
  const url = new URL(request.url);
  
  // 根据请求类型返回合适的占位符
  if (isImageRequest(request)) {
    // 返回一个简单的SVG占位图
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect fill="#e5e7eb" width="200" height="200"/>
        <text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="14">
          离线状态
        </text>
      </svg>`,
      {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
  
  // 返回简单的文本占位符
  return new Response('离线状态 - 请检查网络连接', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
}

// ============================================
// 辅助函数
// ============================================

function isStaticAsset(request) {
  return STATIC_ASSET_PATTERNS.some(pattern => pattern.test(request.url));
}

function isApiRequest(request) {
  return API_PATTERNS.some(pattern => pattern.test(request.url));
}

function isImageRequest(request) {
  return IMAGE_PATTERNS.some(pattern => pattern.test(request.url));
}

function getCacheName(request) {
  if (isStaticAsset(request)) {
    return STATIC_CACHE_NAME;
  }
  if (isApiRequest(request)) {
    return API_CACHE_NAME;
  }
  if (isImageRequest(request)) {
    return STATIC_CACHE_NAME;
  }
  return DYNAMIC_CACHE_NAME;
}

// ============================================
// 定期清理过期缓存
// ============================================
async function cleanExpiredCache() {
  try {
    const cacheNames = await caches.keys();
    
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      
      // 如果缓存超过最大限制，删除最老的项
      if (keys.length > CACHE_CONFIG.maxCacheItems * 2) {
        for (let i = 0; i < keys.length - CACHE_CONFIG.maxCacheItems; i++) {
          await cache.delete(keys[i]);
        }
        console.log('[SW] Cleaned expired cache items from:', name);
      }
    }
  } catch (e) {
    console.error('[SW] Cache cleanup failed:', e);
  }
}

// ============================================
// 后台同步
// ============================================
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  } else if (event.tag === 'update-content') {
    event.waitUntil(updateCache());
  } else if (event.tag === 'clean-cache') {
    event.waitUntil(cleanExpiredCache());
  }
});

async function syncOfflineData() {
  console.log('[SW] Syncing offline data...');
  // 实现离线数据同步逻辑
}

async function updateCache() {
  try {
    // 重新预热缓存
    await warmUpCache();
    console.log('[SW] Content update completed');
  } catch (e) {
    console.error('[SW] Content update failed:', e);
  }
}

// ============================================
// 推送通知
// ============================================
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || '您有新的消息',
    icon: '/images/icon-192.png',
    badge: '/images/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: '查看详情' },
      { action: 'dismiss', title: '稍后再说' }
    ],
    requireInteraction: false,
    silent: false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || '游导旅游', options)
  );
});

// ============================================
// 通知点击处理
// ============================================
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // 尝试聚焦已打开的窗口
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // 没有则打开新窗口
        return clients.openWindow(urlToOpen);
      })
  );
});

// ============================================
// 消息处理 - 与主线程通信
// ============================================
self.addEventListener('message', event => {
  if (!event.data) return;
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: CACHE_VERSION });
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearAllCache());
      event.ports[0]?.postMessage({ success: true });
      break;
      
    case 'PRELOAD_PAGE':
      if (payload?.url) {
        event.waitUntil(preloadPage(payload.url));
      }
      break;
  }
});

async function clearAllCache() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('[SW] All caches cleared');
}

async function preloadPage(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(url, response);
      console.log('[SW] Preloaded:', url);
    }
  } catch (e) {
    console.error('[SW] Preload failed:', url);
  }
}

console.log('[SW] Service Worker loaded - Version', CACHE_VERSION);
