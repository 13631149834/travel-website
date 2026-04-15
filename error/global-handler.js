/**
 * 游导旅游 - 全局错误捕获模块
 * 负责捕获JS错误、Promise错误、资源加载错误等
 */

const GlobalErrorHandler = (function() {
  'use strict';

  // 错误配置
  const config = {
    enableConsoleCapture: true,     // 是否捕获控制台错误
    enableResourceCapture: true,    // 是否捕获资源加载错误
    enablePromiseCapture: true,     // 是否捕获Promise错误
    enableVueErrorCapture: true,    // 是否捕获Vue错误
    enableReactErrorCapture: true,  // 是否捕获React错误
    maxErrors: 50,                  // 最大缓存错误数
    samplingRate: 1,                // 采样率 0-1
    ignoreErrors: [                 // 忽略的错误关键词
      'ResizeObserver',
      'Non-Error promise rejection',
      'Network Error',
      'Failed to fetch'
    ],
    ignoreUrls: [                  // 忽略的错误URL
      'baidu.com',
      'google-analytics.com',
      'googletagmanager.com'
    ]
  };

  // 错误缓存
  let errorCache = [];
  
  // 错误回调
  let errorCallback = null;

  /**
   * 初始化错误捕获
   */
  function init(options = {}, callback) {
    if (options) {
      Object.assign(config, options);
    }
    errorCallback = callback;

    // 捕获JS运行时错误
    captureRuntimeErrors();
    
    // 捕获Promise错误
    if (config.enablePromiseCapture) {
      capturePromiseErrors();
    }
    
    // 捕获资源加载错误
    if (config.enableResourceCapture) {
      captureResourceErrors();
    }
    
    // 捕获控制台错误
    if (config.enableConsoleCapture) {
      captureConsoleErrors();
    }
    
    // 捕获unhandledrejection
    captureUnhandledRejection();
    
    // 捕获页面错误
    capturePageErrors();

    console.log('GlobalErrorHandler initialized');
  }

  /**
   * 捕获JS运行时错误
   */
  function captureRuntimeErrors() {
    window.onerror = function(message, source, lineno, colno, error) {
      // 采样控制
      if (Math.random() > config.samplingRate) return;
      
      // 忽略特定错误
      if (shouldIgnoreError(message)) return;

      const errorInfo = {
        type: 'js_error',
        message: message,
        source: source,
        lineno: lineno,
        colno: colno,
        stack: error?.stack || '',
        name: error?.name || 'Error',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      handleError(errorInfo);
      return false;
    };
  }

  /**
   * 捕获Promise错误
   */
  function capturePromiseErrors() {
    window.addEventListener('unhandledrejection', function(event) {
      const error = event.reason;
      
      // 忽略特定错误
      if (shouldIgnoreError(error?.message || error)) return;

      const errorInfo = {
        type: 'promise_error',
        message: typeof error === 'string' ? error : (error?.message || 'Unhandled Promise Rejection'),
        stack: error?.stack || '',
        name: error?.name || 'UnhandledRejection',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        promise: true
      };

      handleError(errorInfo);
    });
  }

  /**
   * 捕获资源加载错误
   */
  function captureResourceErrors() {
    document.addEventListener('error', function(event) {
      const target = event.target || event.srcElement;
      
      // 只处理有src属性的元素
      if (!target || !target.src) return;
      
      // 忽略特定URL
      if (shouldIgnoreUrl(target.src)) return;

      const errorInfo = {
        type: 'resource_error',
        message: `资源加载失败: ${target.tagName}`,
        resourceUrl: target.src,
        resourceType: target.tagName.toLowerCase(),
        element: target.outerHTML.substring(0, 200),
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      handleError(errorInfo);
    }, true);

    // 捕获图片加载错误
    document.addEventListener('DOMContentLoaded', function() {
      const images = document.querySelectorAll('img');
      images.forEach(function(img) {
        img.addEventListener('error', function() {
          const errorInfo = {
            type: 'image_error',
            message: '图片加载失败',
            resourceUrl: img.src,
            resourceType: 'img',
            element: img.outerHTML.substring(0, 200),
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
          };
          handleError(errorInfo);
        });
      });
    });
  }

  /**
   * 捕获控制台错误
   */
  function captureConsoleErrors() {
    const originalError = console.error;
    console.error = function() {
      const args = Array.prototype.slice.call(arguments);
      const message = args.map(function(arg) {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg);
          } catch (e) {
            return String(arg);
          }
        }
        return arg;
      }).join(' ');

      if (shouldIgnoreError(message)) return;

      const errorInfo = {
        type: 'console_error',
        message: message,
        args: args,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      handleError(errorInfo);
      
      // 调用原始方法
      originalError.apply(console, arguments);
    };
  }

  /**
   * 捕获unhandledrejection
   */
  function captureUnhandledRejection() {
    window.addEventListener('unhandledrejection', function(event) {
      const error = event.reason;
      
      if (shouldIgnoreError(error?.message || error)) return;

      const errorInfo = {
        type: 'unhandledrejection',
        message: error?.message || String(error),
        stack: error?.stack || '',
        name: error?.name || 'UnhandledRejection',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      handleError(errorInfo);
    });
  }

  /**
   * 捕获页面错误
   */
  function capturePageErrors() {
    // 页面卸载前记录
    window.addEventListener('beforeunload', function() {
      // 发送缓存的错误
      flushErrors();
    });

    // 捕获页面崩溃
    window.addEventListener('load', function() {
      if (window.performance && window.performance.navigation.type === 1) {
        // 页面刷新
        const errorInfo = {
          type: 'page_reload',
          message: '页面刷新',
          timestamp: Date.now(),
          url: window.location.href
        };
        handleError(errorInfo);
      }
    });
  }

  /**
   * 处理错误
   */
  function handleError(errorInfo) {
    // 添加到缓存
    errorCache.push(errorInfo);
    
    // 限制缓存大小
    if (errorCache.length > config.maxErrors) {
      errorCache.shift();
    }

    // 调用回调
    if (errorCallback) {
      errorCallback(errorInfo);
    }

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('errorCaptured', { detail: errorInfo }));
  }

  /**
   * 判断是否忽略错误
   */
  function shouldIgnoreError(message) {
    if (!message) return true;
    return config.ignoreErrors.some(function(keyword) {
      return message.indexOf(keyword) !== -1;
    });
  }

  /**
   * 判断是否忽略URL
   */
  function shouldIgnoreUrl(url) {
    if (!url) return true;
    return config.ignoreUrls.some(function(ignoreUrl) {
      return url.indexOf(ignoreUrl) !== -1;
    });
  }

  /**
   * 刷新错误缓存
   */
  function flushErrors() {
    const errors = errorCache.slice();
    errorCache = [];
    return errors;
  }

  /**
   * 获取错误缓存
   */
  function getErrorCache() {
    return errorCache;
  }

  /**
   * 清空错误缓存
   */
  function clearErrorCache() {
    errorCache = [];
  }

  /**
   * 手动上报错误
   */
  function reportError(error, context) {
    const errorInfo = {
      type: 'manual_report',
      message: error?.message || String(error),
      stack: error?.stack || '',
      name: error?.name || 'ManualReport',
      context: context || {},
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    handleError(errorInfo);
    return errorInfo;
  }

  /**
   * 获取错误统计
   */
  function getErrorStats() {
    const stats = {
      total: errorCache.length,
      byType: {},
      byHour: {}
    };

    errorCache.forEach(function(error) {
      // 按类型统计
      if (!stats.byType[error.type]) {
        stats.byType[error.type] = 0;
      }
      stats.byType[error.type]++;

      // 按小时统计
      const hour = new Date(error.timestamp).getHours();
      if (!stats.byHour[hour]) {
        stats.byHour[hour] = 0;
      }
      stats.byHour[hour]++;
    });

    return stats;
  }

  // 公开API
  return {
    init: init,
    reportError: reportError,
    getErrorCache: getErrorCache,
    clearErrorCache: clearErrorCache,
    flushErrors: flushErrors,
    getErrorStats: getErrorStats,
    config: config
  };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlobalErrorHandler;
}
