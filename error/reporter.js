/**
 * 游导旅游 - 错误上报模块
 * 负责收集错误信息、环境信息、用户行为，并上报到服务器
 */

const ErrorReporter = (function() {
  'use strict';

  // 上报配置
  const config = {
    apiUrl: '/api/error/report',           // 上报接口
    batchSize: 10,                          // 批量上报数量
    interval: 5000,                         // 上报间隔(ms)
    maxQueueSize: 100,                      // 最大队列大小
    retryTimes: 3,                          // 重试次数
    retryDelay: 1000,                       // 重试延迟(ms)
    enableBeacon: true,                     // 是否使用sendBeacon
    enableImgReport: false,                 // 是否使用图片上报
    env: 'production',                      // 环境
    version: '1.0.0',                       // 版本号
    appName: 'youdao-travel'               // 应用名称
  };

  // 上报队列
  let reportQueue = [];
  let isReporting = false;
  let reportTimer = null;

  // 用户行为追踪
  let behaviorTracker = {
    actions: [],
    maxActions: 50,
    lastUrl: '',
    lastClick: null,
    lastInput: null
  };

  /**
   * 初始化上报模块
   */
  function init(options = {}) {
    Object.assign(config, options);

    // 启动定时上报
    startIntervalReport();

    // 收集环境信息
    collectEnvironmentInfo();

    console.log('ErrorReporter initialized');
  }

  /**
   * 收集环境信息
   */
  function collectEnvironmentInfo() {
    return {
      // 浏览器信息
      browser: {
        ua: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      },
      // 屏幕信息
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio
      },
      // 视口信息
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      // 性能信息
      performance: getPerformanceInfo(),
      // 内存信息
      memory: getMemoryInfo(),
      // 地理位置
      geo: getGeoInfo(),
      // 时间信息
      timestamp: Date.now(),
      // 页面信息
      page: {
        url: window.location.href,
        referrer: document.referrer,
        title: document.title
      }
    };
  }

  /**
   * 获取性能信息
   */
  function getPerformanceInfo() {
    if (!window.performance) return null;

    const timing = window.performance.timing;
    const navigation = window.performance.navigation;

    return {
      // 页面加载时间
      pageLoadTime: timing.loadEventEnd - timing.navigationStart,
      // DOM解析时间
      domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
      // 白屏时间
      firstPaint: timing.loadEventEnd - timing.fetchStart,
      // 重定向时间
      redirectTime: timing.redirectEnd - timing.redirectStart,
      // DNS解析时间
      dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
      // TCP连接时间
      tcpTime: timing.connectEnd - timing.connectStart,
      // SSL时间
      sslTime: timing.secureConnectionStart > 0 ? 
        timing.connectEnd - timing.secureConnectionStart : 0,
      // TTFB
      ttfb: timing.responseStart - timing.requestStart,
      // 资源加载时间
      resourceLoadTime: timing.loadEventEnd - timing.domContentLoadedEventEnd
    };
  }

  /**
   * 获取内存信息
   */
  function getMemoryInfo() {
    if (performance.memory) {
      return {
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        usedJSHeapSize: performance.memory.usedJSHeapSize
      };
    }
    return null;
  }

  /**
   * 获取地理位置
   */
  function getGeoInfo() {
    return new Promise(function(resolve) {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        function(position) {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        function() {
          resolve(null);
        },
        { timeout: 3000 }
      );
    });
  }

  /**
   * 上报错误
   */
  function report(errorInfo) {
    // 合并环境信息
    const reportData = Object.assign({}, errorInfo, {
      env: config.env,
      version: config.version,
      appName: config.appName,
      environment: collectEnvironmentInfo()
    });

    // 添加用户行为
    reportData.behavior = getRecentBehaviors();

    // 添加到队列
    addToQueue(reportData);
  }

  /**
   * 添加到上报队列
   */
  function addToQueue(data) {
    reportQueue.push(data);

    // 限制队列大小
    if (reportQueue.length > config.maxQueueSize) {
      reportQueue.shift();
    }

    // 如果达到批量大小，立即上报
    if (reportQueue.length >= config.batchSize) {
      flushQueue();
    }
  }

  /**
   * 启动定时上报
   */
  function startIntervalReport() {
    if (reportTimer) {
      clearInterval(reportTimer);
    }

    reportTimer = setInterval(function() {
      if (reportQueue.length > 0) {
        flushQueue();
      }
    }, config.interval);
  }

  /**
   * 刷新队列
   */
  function flushQueue() {
    if (isReporting || reportQueue.length === 0) return;

    isReporting = true;
    const dataToReport = reportQueue.slice(0, config.batchSize);
    reportQueue = reportQueue.slice(config.batchSize);

    sendReport(dataToReport)
      .then(function() {
        isReporting = false;
      })
      .catch(function() {
        isReporting = false;
        // 重试
        retryReport(dataToReport);
      });
  }

  /**
   * 发送上报
   */
  function sendReport(data) {
    return new Promise(function(resolve, reject) {
      // 优先使用sendBeacon
      if (config.enableBeacon && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const result = navigator.sendBeacon(config.apiUrl, blob);
        if (result) {
          resolve(result);
          return;
        }
      }

      // 使用fetch
      fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        keepalive: true
      })
      .then(function(response) {
        if (response.ok) {
          resolve(response);
        } else {
          reject(new Error('Report failed: ' + response.status));
        }
      })
      .catch(reject);
    });
  }

  /**
   * 重试上报
   */
  function retryReport(data, times) {
    times = times || 0;
    
    if (times >= config.retryTimes) {
      console.error('Error report retry failed:', data);
      return;
    }

    setTimeout(function() {
      sendReport(data)
        .catch(function() {
          retryReport(data, times + 1);
        });
    }, config.retryDelay * (times + 1));
  }

  /**
   * 追踪用户行为
   */
  function trackBehavior(action, data) {
    const behavior = {
      action: action,
      data: data,
      timestamp: Date.now(),
      url: window.location.href
    };

    behaviorTracker.actions.push(behavior);

    // 限制行为数量
    if (behaviorTracker.actions.length > behaviorTracker.maxActions) {
      behaviorTracker.actions.shift();
    }
  }

  /**
   * 追踪页面访问
   */
  function trackPageView(url) {
    trackBehavior('page_view', {
      from: behaviorTracker.lastUrl,
      to: url || window.location.href
    });
    behaviorTracker.lastUrl = window.location.href;
  }

  /**
   * 追踪点击
   */
  function trackClick(element) {
    trackBehavior('click', {
      tag: element.tagName,
      id: element.id,
      className: element.className,
      text: element.innerText?.substring(0, 50),
      href: element.href
    });
    behaviorTracker.lastClick = element;
  }

  /**
   * 追踪输入
   */
  function trackInput(element, value) {
    trackBehavior('input', {
      tag: element.tagName,
      id: element.id,
      name: element.name,
      valueLength: value?.length || 0
    });
    behaviorTracker.lastInput = element;
  }

  /**
   * 追踪AJAX请求
   */
  function trackAjax(url, method, status, duration) {
    trackBehavior('ajax', {
      url: url,
      method: method,
      status: status,
      duration: duration
    });
  }

  /**
   * 追踪路由变化
   */
  function trackRouteChange(from, to) {
    trackBehavior('route_change', {
      from: from,
      to: to
    });
  }

  /**
   * 获取最近行为
   */
  function getRecentBehaviors() {
    return behaviorTracker.actions.slice(-20);
  }

  /**
   * 初始化行为追踪
   */
  function initBehaviorTracker() {
    // 追踪页面访问
    trackPageView();
    window.addEventListener('popstate', function() {
      trackPageView();
    });

    // 追踪点击
    document.addEventListener('click', function(e) {
      const target = e.target || e.srcElement;
      if (target) {
        trackClick(target);
      }
    }, true);

    // 追踪输入
    document.addEventListener('input', function(e) {
      const target = e.target || e.srcElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        trackInput(target, target.value);
      }
    }, true);

    // 拦截fetch
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      const startTime = Date.now();
      return originalFetch.apply(this, arguments)
        .then(function(response) {
          const duration = Date.now() - startTime;
          trackAjax(url, options?.method || 'GET', response.status, duration);
          return response;
        })
        .catch(function(error) {
          const duration = Date.now() - startTime;
          trackAjax(url, options?.method || 'GET', 'error', duration);
          throw error;
        });
    };
  }

  /**
   * 设置用户标识
   */
  function setUserId(userId) {
    localStorage.setItem('error_user_id', userId);
  }

  /**
   * 获取用户标识
   */
  function getUserId() {
    let userId = localStorage.getItem('error_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('error_user_id', userId);
    }
    return userId;
  }

  /**
   * 设置会话ID
   */
  function setSessionId(sessionId) {
    localStorage.setItem('error_session_id', sessionId);
  }

  /**
   * 获取会话ID
   */
  function getSessionId() {
    let sessionId = localStorage.getItem('error_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('error_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * 获取队列状态
   */
  function getQueueStatus() {
    return {
      queueLength: reportQueue.length,
      isReporting: isReporting,
      config: config
    };
  }

  /**
   * 手动上报
   */
  function reportNow(data) {
    report(data);
    flushQueue();
  }

  // 公开API
  return {
    init: init,
    report: report,
    reportNow: reportNow,
    trackBehavior: trackBehavior,
    trackPageView: trackPageView,
    trackClick: trackClick,
    trackInput: trackInput,
    trackAjax: trackAjax,
    trackRouteChange: trackRouteChange,
    initBehaviorTracker: initBehaviorTracker,
    setUserId: setUserId,
    getUserId: getUserId,
    setSessionId: setSessionId,
    getSessionId: getSessionId,
    getQueueStatus: getQueueStatus,
    getRecentBehaviors: getRecentBehaviors,
    collectEnvironmentInfo: collectEnvironmentInfo
  };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorReporter;
}
