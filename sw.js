// 游导学习笔记 Service Worker v4.0
const CACHE_NAME = 'youdao-v64';
const OFFLINE_CACHE = 'youdao-offline-v1';
const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>当前无网络 - 游导学习笔记</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;background-color:#F8F7FA;background-image:none;background-image:none;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
    .offline-card{background:#fff;border-radius:24px;padding:48px 40px;text-align:center;max-width:400px;box-shadow:0 8px 32px rgba(13,148,136,0.15)}
    .emoji{font-size:64px;margin-bottom:20px}
    h1{color:#0D9488;font-size:1.5rem;margin-bottom:12px}
    p{color:#4A4458;font-size:0.95rem;line-height:1.6;margin-bottom:16px}
    .tip{background:#F0FDFA;border-radius:12px;padding:16px;margin:20px 0;text-align:left}
    .tip-title{color:#0D9488;font-weight:700;margin-bottom:8px;font-size:0.9rem}
    .tip li{color:#4A4458;font-size:0.85rem;margin:6px 0;list-style:none}
    .btn{background:linear-gradient(135deg,#E65100,#FF6D00);color:#fff;border:none;padding:14px 32px;border-radius:30px;font-size:1rem;font-weight:700;cursor:pointer;text-decoration:none;display:inline-block;margin-top:16px;transition:transform 0.2s}
    .btn:hover{transform:translateY(-2px)}
    .slogan{color:#115E59;font-size:0.9rem;font-weight:600;margin-top:24px}
  </style>
</head>
<body>
  <div class="offline-card">
    <div class="emoji">📡</div>
    <h1>当前无网络连接</h1>
    <p>别慌！你可以继续使用以下功能：</p>
    <div class="tip">
      <div class="tip-title">📱 可离线使用的功能：</div>
      <ul>
        <li>✅ 闪卡复习（已缓存的知识点）</li>
        <li>✅ 面试计时器</li>
        <li>✅ 刷过的题目（错题本）</li>
        <li>✅ 已打开过的知识库页面</li>
      </ul>
    </div>
    <div class="tip">
      <div class="tip-title">🔒 需要网络的功能：</div>
      <ul>
        <li>⚠️ AI助手（暂时不可用）</li>
        <li>⚠️ 搜索功能（可用缓存内容）</li>
      </ul>
    </div>
    <a href="/" class="btn" onclick="window.location.reload();return false;">🔄 重试</a>
    <p class="slogan">走过弯路，所以更懂路</p>
  </div>
</body>
</html>
`;

// 核心页面（始终缓存）
const CORE_PAGES = [
  '/',
  '/index.html',
  '/travel-knowledge.html',
  '/exam-simulator.html',
  '/wrong-questions.html',
  '/free-materials.html',
  '/ai-assistant.html',
  '/interview.html',
  '/flashcard.html',
  '/study-roadmap.html',
  '/search.html',
  '/mistakes.html',
  '/after-pass.html',
  '/resources.html',
  '/chat.html',
  '/exam-guide.html',
  '/guides.html',
  '/travel-tools.html',
  '/voice.html',
  '/province-exam.html',
  '/privacy.html',
  '/activate.html',
  '/favorites.html',
  '/study-progress.html',
  '/interview-timer.html',
  '/knowledge/business/index.html',
  '/knowledge/local/index.html',
  '/404.html'
];

// 静态资源
const STATIC_ASSETS = [
  '/css/common.css',
  '/css/chapter.css',
  '/css/micro-interactions.css',
  '/css/style.css',
  '/js/achievements.js',
  '/js/analytics.js',
  '/js/common.js',
  '/js/emotional.js',
  '/js/flashcard-enhanced.js',
  '/js/study-progress.js',
  '/search-index.json',
  '/auth.js',
  '/manifest.json',
  '/favicon.svg'
];

// Install: cache core pages
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // 优先缓存核心页面
      try {
        await cache.addAll(CORE_PAGES.map(url => new Request(url, { cache: 'reload' })));
      } catch (e) {
        console.log('Some core pages failed to cache');
      }
      // 缓存静态资源
      try {
        await cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      } catch (e) {
        console.log('Some static assets failed to cache');
      }
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== OFFLINE_CACHE)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  // Skip chrome-extension and other protocols
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  const url = new URL(event.request.url);
  
  // API requests: network only with timeout
  if (url.pathname.includes('/api/') || url.pathname.includes('search')) {
    event.respondWith(
      Promise.race([
        fetch(event.request),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 5000)
        )
      ]).catch(() => {
        // 搜索降级：返回本地索引
        if (url.pathname.includes('search')) {
          return caches.match('/search-index.json').then(res => {
            if (res) return res;
            return new Response(JSON.stringify({ error: 'offline' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        }
        return new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }
  
  // AI assistant: special handling with timeout
  if (url.pathname.includes('ai-') || url.pathname.includes('chat')) {
    event.respondWith(
      Promise.race([
        fetch(event.request.clone(), { 
          signal: AbortSignal.timeout(10000)
        }),
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(new Response(JSON.stringify({ 
              error: 'timeout',
              message: 'AI响应超时，请稍后重试'
            }), {
              headers: { 'Content-Type': 'application/json' }
            }));
          }, 10000);
        })
      ]).catch(() => {
        return new Response(JSON.stringify({ 
          error: 'service_unavailable',
          message: 'AI服务暂时不可用，请检查网络连接'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }
  
  // Image CDN fallback
  if (url.hostname.includes('cdn') || url.pathname.includes('/images/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // 返回占位图
        return caches.match('/images/placeholder.svg').then(res => {
          if (res) return res;
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect fill="#FFF3E0" width="200" height="150"/><text x="50%" y="50%" fill="#E65100" text-anchor="middle" dy=".3em" font-size="14">图片加载中</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        });
      })
    );
    return;
  }
  
  // Default: network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone and cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then(cached => {
          // 如果是导航请求，返回offline页面
          if (event.request.mode === 'navigate') {
            return new Response(OFFLINE_HTML, {
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          }
          // Return cached page or 404
          return cached || caches.match('/404.html');
        });
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // 清除缓存指令
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
  }
  
  // 网络恢复同步指令
  if (event.data && event.data.type === 'SYNC_DATA') {
    console.log('收到同步指令，开始后台同步...');
    self.registration.sync.register('sync-data').catch(() => {
      syncUserData();
    });
  }
});

// 网络恢复同步处理
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncUserData());
  }
});

async function syncUserData() {
  // 用户数据同步逻辑（后续扩展）
  console.log('Background sync triggered at:', new Date().toISOString());
}

// 推送通知（可选）
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '游导学习笔记';
  const options = {
    body: data.body || '考试临近，记得复习哦！',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

});
