/**
 * 游导旅游 PWA Service Worker
 * 版本: 1.0.0
 * 功能: 缓存策略、离线支持、后台同步、推送通知
 */

const CACHE_NAME = 'youdau-travel-v1.0.0';
const STATIC_CACHE_NAME = 'youdau-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'youdau-dynamic-v1.0.0';
const IMAGE_CACHE_NAME = 'youdau-images-v1.0.0';

// 静态资源 - 应用外壳
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/install.html',
  '/offline.html',
  '/pwa-features.html',
  '/push-config.html',
  '/manifest.json',
  '/css/tailwind.min.css',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/icons/icon-72x72.png',
  '/images/icons/icon-96x96.png',
  '/images/icons/icon-128x128.png',
  '/images/icons/icon-384x384.png'
];

// 安装阶段 - 预缓存核心资源
self.addEventListener('install', (event) => {
  console.log('[SW] 安装中...');
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] 预缓存静态资源');
        return cache.addAll(STATIC_ASSETS);
      }),
      // 确保 SW 立即激活
      self.skipWaiting()
    ])
  );
});

// 激活阶段 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('youdau-') && 
                   name !== STATIC_CACHE_NAME && 
                   name !== DYNAMIC_CACHE_NAME && 
                   name !== IMAGE_CACHE_NAME;
          })
          .map((name) => {
            console.log('[SW] 删除旧缓存:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // 立即接管所有页面
      return self.clients.claim();
    })
  );
});

// 请求拦截 - 缓存策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非 GET 请求
  if (request.method !== 'GET') return;

  // 跳过跨域请求
  if (url.origin !== location.origin) return;

  // 跳过 Chrome 扩展等
  if (!url.protocol.startsWith('http')) return;

  // 根据请求类型选择缓存策略
  if (isStaticAsset(url)) {
    // 静态资源: Cache First (缓存优先)
    event.respondWith(cacheFirst(request));
  } else if (isImage(request)) {
    // 图片: Stale While Revalidate (返回缓存同时更新)
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE_NAME));
  } else if (isAPI(url)) {
    // API: Network First (网络优先)
    event.respondWith(networkFirst(request));
  } else {
    // 页面和动态资源: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME));
  }
});

// 判断是否为静态资源
function isStaticAsset(url) {
  const staticExtensions = ['.css', '.js', '.woff', '.woff2', '.ttf', '.ico', '.png', '.jpg', '.svg', '.json'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
         url.pathname.includes('/fonts/') ||
         url.pathname.includes('/icons/');
}

// 判断是否为图片
function isImage(request) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'];
  return imageExtensions.some(ext => request.url.endsWith(ext)) ||
         request.destination === 'image';
}

// 判断是否为 API 请求
function isAPI(url) {
  return url.pathname.includes('/api/') || 
         url.pathname.includes('/data/') ||
         url.search.includes('api=');
}

/**
 * 缓存策略实现
 */

// Cache First - 缓存优先
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache First 请求失败:', error);
    return caches.match('/offline.html');
  }
}

// Network First - 网络优先
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network First 回退到缓存:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return caches.match('/offline.html');
  }
}

// Stale While Revalidate - 返回缓存同时更新
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);

  return cachedResponse || fetchPromise || caches.match('/offline.html');
}

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('[SW] 后台同步:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // 模拟后台同步数据
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      message: '数据同步完成'
    });
  });
}

// 推送通知
self.addEventListener('push', (event) => {
  console.log('[SW] 收到推送:', event);
  
  let data = {
    title: '游导旅游',
    body: '您有一条新消息',
    icon: '/images/icon-192.png',
    badge: '/images/icons/icon-72x72.png',
    tag: 'default',
    requireInteraction: false
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: data.requireInteraction,
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'open', title: '查看' },
      { action: 'close', title: '关闭' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 通知点击
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 通知点击:', event);
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 优先聚焦已打开的窗口
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // 否则打开新窗口
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// 消息处理
self.addEventListener('message', (event) => {
  console.log('[SW] 收到消息:', event.data);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
    case 'CLEAR_CACHE':
      clearAllCache();
      event.ports[0].postMessage({ success: true });
      break;
    case 'CACHE_URLS':
      cacheUrls(event.data.urls);
      event.ports[0].postMessage({ success: true });
      break;
    case 'GET_CACHED_PAGES':
      getCachedPages().then(pages => {
        event.ports[0].postMessage({ pages });
      });
      break;
  }
});

// 清除所有缓存
async function clearAllCache() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
}

// 缓存指定 URL
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (e) {
      console.log('[SW] 缓存失败:', url, e);
    }
  }
}

// 获取已缓存的页面列表
async function getCachedPages() {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const keys = await cache.keys();
  return keys.map(request => request.url);
}

// 定期清理图片缓存
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'clean-images') {
    event.waitUntil(cleanImageCache());
  }
});

async function cleanImageCache() {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const keys = await cache.keys();
  
  // 保留最近 50 张图片
  if (keys.length > 50) {
    const toDelete = keys.slice(0, keys.length - 50);
    await Promise.all(toDelete.map(key => cache.delete(key)));
  }
}
