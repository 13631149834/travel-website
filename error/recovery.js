/**
 * 游导旅游 - 错误恢复模块
 * 负责自动重试、降级处理、缓存回退、离线模式等
 */

const ErrorRecovery = (function() {
  'use strict';

  // 配置
  const config = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
    enableCache: true,
    cachePrefix: 'error_recovery_',
    cacheTTL: 5 * 60 * 1000, // 5分钟
    enableOfflineMode: true,
    offlineCheckInterval: 5000
  };

  // 重试记录
  let retryHistory = [];
  const maxHistorySize = 100;

  // 降级策略
  const degradationStrategies = {
    image: {
      fallback: function(url) {
        // 返回默认占位图
        return 'data:image/svg+xml,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
            <rect fill="#f3f4f6" width="200" height="150"/>
            <text fill="#9ca3af" font-family="Arial" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">图片加载失败</text>
          </svg>
        `);
      }
    },
    api: {
      fallback: function(originalFn, cacheKey) {
        // 尝试从缓存获取
        const cached = getCache(cacheKey);
        if (cached) {
          return Promise.resolve(cached);
        }
        return Promise.reject(new Error('API unavailable and no cache'));
      }
    },
    script: {
      fallback: function(src) {
        console.warn('Script load failed:', src);
        return false;
      }
    },
    style: {
      fallback: function(href) {
        console.warn('Style load failed:', href);
        return false;
      }
    }
  };

  // 离线状态
  let isOffline = false;
  let offlineListeners = [];

  /**
   * 初始化
   */
  function init(options) {
    if (options) {
      Object.assign(config, options);
    }

    // 监听网络状态
    if (config.enableOfflineMode) {
      initOfflineDetection();
    }

    console.log('ErrorRecovery initialized');
  }

  /**
   * 初始化离线检测
   */
  function initOfflineDetection() {
    // 检查初始状态
    updateOnlineStatus();

    // 监听网络变化
    window.addEventListener('online', function() {
      isOffline = false;
      notifyOfflineListeners(false);
      console.log('Network online');
    });

    window.addEventListener('offline', function() {
      isOffline = true;
      notifyOfflineListeners(true);
      console.log('Network offline');
    });

    // 定期检查
    setInterval(function() {
      updateOnlineStatus();
    }, config.offlineCheckInterval);
  }

  /**
   * 更新在线状态
   */
  function updateOnlineStatus() {
    const wasOffline = isOffline;
    isOffline = !navigator.onLine;

    if (wasOffline !== isOffline) {
      notifyOfflineListeners(isOffline);
    }
  }

  /**
   * 通知离线监听器
   */
  function notifyOfflineListeners(offline) {
    offlineListeners.forEach(function(listener) {
      try {
        listener(offline);
      } catch (e) {
        console.error('Offline listener error:', e);
      }
    });
  }

  /**
   * 监听离线状态
   */
  function onOfflineStatusChange(callback) {
    offlineListeners.push(callback);
    return function() {
      offlineListeners = offlineListeners.filter(function(l) { return l !== callback; });
    };
  }

  /**
   * 检查是否离线
   */
  function checkOnline() {
    updateOnlineStatus();
    return !isOffline;
  }

  /**
   * 自动重试
   */
  async function retry(fn, options = {}) {
    const maxRetries = options.maxRetries || config.maxRetries;
    const baseDelay = options.baseDelay || config.baseDelay;
    const maxDelay = options.maxDelay || config.maxDelay;
    const context = options.context || {};
    const onRetry = options.onRetry;
    const shouldRetry = options.shouldRetry;

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn(context);
        
        // 成功后记录
        if (attempt > 0) {
          recordRetry(context, attempt, true);
        }
        
        return { success: true, result: result, attempts: attempt + 1 };
      } catch (error) {
        lastError = error;

        // 检查是否应该重试
        if (shouldRetry && !shouldRetry(error, attempt)) {
          break;
        }

        // 已经是最后一次尝试
        if (attempt === maxRetries) {
          break;
        }

        // 计算延迟
        const delay = calculateDelay(attempt, baseDelay, maxDelay);

        // 记录重试
        recordRetry(context, attempt + 1, false, error);

        // 调用重试回调
        if (onRetry) {
          onRetry(error, attempt + 1, delay);
        }

        // 等待
        await sleep(delay);
      }
    }

    return { success: false, error: lastError, attempts: maxRetries + 1 };
  }

  /**
   * 计算重试延迟
   */
  function calculateDelay(attempt, baseDelay, maxDelay) {
    // 指数退避
    let delay = baseDelay * Math.pow(config.backoffMultiplier, attempt);
    
    // 添加抖动
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    // 限制最大延迟
    return Math.min(delay, maxDelay);
  }

  /**
   * 记录重试
   */
  function recordRetry(context, attempt, success, error) {
    const record = {
      context: context,
      attempt: attempt,
      success: success,
      error: error?.message || String(error),
      timestamp: Date.now(),
      url: window.location.href
    };

    retryHistory.unshift(record);

    // 限制历史大小
    if (retryHistory.length > maxHistorySize) {
      retryHistory.pop();
    }
  }

  /**
   * 获取重试历史
   */
  function getRetryHistory() {
    return retryHistory;
  }

  /**
   * 缓存操作
   */
  function getCache(key) {
    if (!config.enableCache) return null;

    const cacheKey = config.cachePrefix + key;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    try {
      const data = JSON.parse(cached);
      
      // 检查过期
      if (data.expires && data.expires < Date.now()) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return data.value;
    } catch (e) {
      return null;
    }
  }

  /**
   * 设置缓存
   */
  function setCache(key, value, ttl) {
    if (!config.enableCache) return false;

    const cacheKey = config.cachePrefix + key;
    const data = {
      value: value,
      expires: ttl ? Date.now() + ttl : Date.now() + config.cacheTTL
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      return true;
    } catch (e) {
      // 缓存可能已满，尝试清理
      clearExpiredCache();
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        return true;
      } catch (e2) {
        return false;
      }
    }
  }

  /**
   * 清除过期缓存
   */
  function clearExpiredCache() {
    const now = Date.now();
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.indexOf(config.cachePrefix) === 0) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.expires && data.expires < now) {
            keysToRemove.push(key);
          }
        } catch (e) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(function(key) {
      localStorage.removeItem(key);
    });

    return keysToRemove.length;
  }

  /**
   * 降级处理
   */
  function degrade(type, originalValue, fallbackOptions) {
    const strategy = degradationStrategies[type];

    if (!strategy || !strategy.fallback) {
      console.warn('No degradation strategy for type:', type);
      return originalValue;
    }

    try {
      return strategy.fallback(originalValue, fallbackOptions);
    } catch (e) {
      console.error('Degradation failed:', e);
      return originalValue;
    }
  }

  /**
   * 带缓存的API请求
   */
  async function cachedRequest(key, fn, options = {}) {
    const ttl = options.ttl || config.cacheTTL;
    const forceRefresh = options.forceRefresh;

    // 检查缓存
    if (!forceRefresh) {
      const cached = getCache(key);
      if (cached) {
        return { fromCache: true, data: cached };
      }
    }

    // 检查离线
    if (!checkOnline()) {
      const cached = getCache(key);
      if (cached) {
        return { fromCache: true, data: cached, offline: true };
      }
      throw new Error('Network unavailable and no cache');
    }

    // 发起请求
    try {
      const data = await fn();
      setCache(key, data, ttl);
      return { fromCache: false, data: data };
    } catch (error) {
      // 请求失败，尝试缓存
      const cached = getCache(key);
      if (cached) {
        return { fromCache: true, data: cached, fallback: true };
      }
      throw error;
    }
  }

  /**
   * 图片降级
   */
  function degradeImage(img) {
    if (img.dataset.originalSrc) {
      img.src = img.dataset.originalSrc;
    } else {
      img.dataset.originalSrc = img.src;
    }
    
    // 降级处理
    img.onerror = function() {
      this.onerror = null;
      this.src = degradationStrategies.image.fallback(img.src);
    };
  }

  /**
   * 脚本加载降级
   */
  function degradeScript(src, fallbackFn) {
    const script = document.createElement('script');
    script.src = src;
    script.onerror = function() {
      console.warn('Script degraded:', src);
      if (fallbackFn) {
        fallbackFn();
      }
    };
    document.head.appendChild(script);
  }

  /**
   * API降级策略
   */
  async function apiDegrade(apiName, originalFn, cacheKey) {
    // 先检查缓存
    const cached = getCache(cacheKey || apiName);
    if (cached) {
      return { data: cached, degraded: true, fromCache: true };
    }

    // 尝试降级API
    const degradedFn = getDegradedApi(apiName);
    if (degradedFn) {
      try {
        const data = await degradedFn();
        return { data: data, degraded: true };
      } catch (e) {
        console.error('Degraded API also failed:', e);
      }
    }

    // 都失败，抛出原始错误
    return originalFn().catch(function(error) {
      throw error;
    });
  }

  /**
   * 获取降级API
   */
  function getDegradedApi(apiName) {
    // 这里可以定义各个API的降级实现
    const degradedApis = {
      // 示例
      // 'search': function() { return Promise.resolve([]); },
      // 'recommendations': function() { return Promise.resolve([]); }
    };
    return degradedApis[apiName];
  }

  /**
   * 设置降级策略
   */
  function setDegradationStrategy(type, strategy) {
    degradationStrategies[type] = strategy;
  }

  /**
   * 离线模式处理
   */
  async function offlineFallback(onlineFn, offlineFn) {
    if (!checkOnline()) {
      if (offlineFn) {
        return offlineFn();
      }
      throw new Error('Offline');
    }

    try {
      return await onlineFn();
    } catch (error) {
      if (offlineFn) {
        return offlineFn();
      }
      throw error;
    }
  }

  /**
   * 批量操作回退
   */
  async function batchWithRollback(operations, rollbackFn) {
    const completed = [];
    const errors = [];

    for (let i = 0; i < operations.length; i++) {
      try {
        const result = await operations[i]();
        completed.push({ index: i, result: result });
      } catch (error) {
        errors.push({ index: i, error: error });

        // 执行回滚
        if (rollbackFn) {
          try {
            await rollbackFn(completed);
          } catch (e) {
            console.error('Rollback failed:', e);
          }
        }

        break;
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        completed: completed,
        errors: errors
      };
    }

    return {
      success: true,
      completed: completed
    };
  }

  /**
   * 睡眠
   */
  function sleep(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  }

  /**
   * 获取状态
   */
  function getStatus() {
    return {
      isOffline: isOffline,
      retryHistory: retryHistory,
      config: config
    };
  }

  // 公开API
  return {
    init: init,
    retry: retry,
    getRetryHistory: getRetryHistory,
    getCache: getCache,
    setCache: setCache,
    clearExpiredCache: clearExpiredCache,
    degrade: degrade,
    degradeImage: degradeImage,
    degradeScript: degradeScript,
    apiDegrade: apiDegrade,
    setDegradationStrategy: setDegradationStrategy,
    offlineFallback: offlineFallback,
    batchWithRollback: batchWithRollback,
    cachedRequest: cachedRequest,
    onOfflineStatusChange: onOfflineStatusChange,
    checkOnline: checkOnline,
    getStatus: getStatus,
    sleep: sleep
  };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorRecovery;
}
