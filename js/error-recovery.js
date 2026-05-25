/**
 * 精致化5.0 - 全局错误恢复系统
 * JS执行错误降级显示静态内容
 * 数据读取错误显示默认值
 * 网络请求错误显示缓存数据+更新提示
 */
(function() {
  'use strict';
  
  // 错误日志收集
  const errorLog = [];
  const MAX_ERROR_LOG = 50;
  
  function logError(type, message, details) {
    const entry = {
      type: type,
      message: message,
      details: details,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
    errorLog.push(entry);
    if (errorLog.length > MAX_ERROR_LOG) errorLog.shift();
    
    // 输出到console便于排查
    console.warn('[ErrorRecovery]', type, message, details);
  }
  
  // 暴露错误日志获取接口
  window.getErrorLog = function() {
    return errorLog.slice(-10); // 返回最近10条
  };
  
  // ==================== JS执行错误处理 ====================
  window.onerror = function(message, source, lineno, colno, error) {
    logError('js_error', message, { source, lineno, colno });
    
    // 显示友好的错误提示（仅首次）
    if (errorLog.filter(e => e.type === 'js_error').length === 1) {
      const fallbackContent = document.createElement('div');
      fallbackContent.id = 'error-fallback';
      fallbackContent.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #F0FDFA;
        border: 1px solid #0D9488;
        color: #115E59;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 0.85rem;
        z-index: 99998;
        max-width: 90vw;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      `;
      fallbackContent.textContent = '⚠️ 部分内容加载异常，请尝试刷新页面';
      document.body.appendChild(fallbackContent);
      
      setTimeout(() => {
        if (fallbackContent.parentNode) {
          fallbackContent.style.opacity = '0';
          setTimeout(() => fallbackContent.remove(), 300);
        }
      }, 5000);
    }
    
    return false; // 不阻止默认错误处理
  };
  
  // ==================== Promise rejection处理 ====================
  window.addEventListener('unhandledrejection', function(event) {
    logError('unhandled_rejection', event.reason, {
      promise: event.promise ? 'Promise object' : 'N/A'
    });
  });
  
  // ==================== 资源加载失败处理 ====================
  window.addEventListener('error', function(event) {
    if (event.target && (event.target.tagName === 'IMG' || event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
      const target = event.target;
      const resourceType = target.tagName === 'IMG' ? 'image' : 
                          target.tagName === 'SCRIPT' ? 'script' : 'style';
      
      logError('resource_error', `Failed to load ${resourceType}`, { 
        src: target.src || target.href,
        id: target.id || 'N/A'
      });
      
      // 图片加载失败使用占位图
      if (resourceType === 'image' && target.tagName === 'IMG') {
        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI0ZGRkZGRiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
        target.style.opacity = '0.5';
      }
      
      // JS加载失败尝试回退
      if (resourceType === 'script') {
        logError('script_fallback', 'Attempting to recover from script error', { src: target.src });
      }
    }
  }, true); // 捕获阶段
  
  // ==================== 网络请求封装（带缓存回退） ====================
  window.safeFetch = async function(url, options = {}) {
    const cacheKey = 'fetch_cache_' + btoa(url).slice(0, 20);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Cache-Control': 'no-cache',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 缓存成功响应
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: data,
          timestamp: Date.now()
        }));
      } catch (e) {}
      
      return { success: true, data: data };
    } catch (error) {
      logError('fetch_error', error.message, { url });
      
      // 尝试使用缓存
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || '{}');
        if (cached.data && cached.timestamp && (Date.now() - cached.timestamp < 3600000)) { // 1小时缓存
          return { 
            success: false, 
            data: cached.data, 
            fromCache: true,
            warning: '数据来自缓存，可能不是最新'
          };
        }
      } catch (e) {}
      
      return { success: false, error: error.message };
    }
  };
  
  // ==================== localStorage安全操作 ====================
  window.safeStorage = {
    get: function(key, defaultValue = null) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
      } catch (e) {
        logError('storage_error', 'Failed to read localStorage', { key, error: e.message });
        return defaultValue;
      }
    },
    
    set: function(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        logError('storage_error', 'Failed to write localStorage', { key, error: e.message });
        // 尝试清理后重试
        if (e.name === 'QuotaExceededError') {
          try {
            const keys = Object.keys(localStorage).slice(0, 10);
            keys.forEach(k => localStorage.removeItem(k));
            localStorage.setItem(key, JSON.stringify(value));
            return true;
          } catch (e2) {}
        }
        return false;
      }
    },
    
    remove: function(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        return false;
      }
    }
  };
  
  // ==================== 数据回退默认值 ====================
  window.DEFAULT_DATA = {
    // 用户未登录时的默认值
    user: {
      isLoggedIn: false,
      isActivated: false,
      memberLevel: 'free'
    },
    
    // 学习进度默认值
    progress: {
      totalTasks: 0,
      completedTasks: 0,
      lastStudyDate: null
    },
    
    // AI助手默认值
    ai: {
      welcomeMessage: '导游证备考助手',
      quickQuestions: [
        '导游证报名条件是什么？',
        '帮我制定一个30天备考计划',
        '导游业务笔试重点有哪些？'
      ]
    },
    
    // 考试信息
    exam: {
      date: '2026-11-21',
      daysLeft: function() {
        const exam = new Date(this.date);
        return Math.ceil((exam - new Date()) / (1000 * 60 * 60 * 24));
      }
    }
  };
  
  // ==================== 样式加载失败处理 ====================
  document.addEventListener('DOMContentLoaded', function() {
    // 检查关键元素是否存在
    const criticalElements = ['navbar', 'footer', 'main-content'];
    criticalElements.forEach(id => {
      const el = document.getElementById(id) || document.querySelector('.' + id);
      if (!el) {
        logError('missing_element', 'Critical element not found', { id });
      }
    });
  });
  
  console.log('[ErrorRecovery] Global error handling initialized');
})();
