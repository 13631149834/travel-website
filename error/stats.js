/**
 * 游导旅游 - 错误统计模块
 * 负责错误趋势、类型分布、影响用户数、修复追踪等统计
 */

const ErrorStats = (function() {
  'use strict';

  // 存储配置
  const storageConfig = {
    prefix: 'error_stats_',
    ttl: 7 * 24 * 60 * 60 * 1000 // 7天
  };

  // 统计数据
  let stats = {
    errors: [],           // 错误列表
    byType: {},           // 按类型统计
    byPage: {},          // 按页面统计
    byBrowser: {},       // 按浏览器统计
    byHour: {},          // 按小时统计
    byDay: {},           // 按天统计
    users: new Set(),    // 受影响用户
    total: 0,            // 总错误数
    today: 0,            // 今日错误数
    uniqueErrors: {}     // 去重后的错误
  };

  // 错误类型映射
  const errorTypeMap = {
    'js_error': 'JavaScript错误',
    'promise_error': 'Promise错误',
    'resource_error': '资源加载错误',
    'console_error': '控制台错误',
    'unhandledrejection': '未处理Promise拒绝',
    'network_error': '网络错误',
    'server_error': '服务器错误',
    'timeout_error': '超时错误',
    'auth_error': '认证错误',
    'api_error': 'API错误',
    'image_error': '图片错误',
    'page_reload': '页面刷新'
  };

  /**
   * 初始化
   */
  function init() {
    loadFromStorage();
    console.log('ErrorStats initialized');
  }

  /**
   * 记录错误
   */
  function recordError(errorInfo) {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const hour = date.getHours();
    const day = formatDate(date);
    const errorKey = generateErrorKey(errorInfo);

    // 添加到列表
    const record = Object.assign({}, errorInfo, {
      id: timestamp + '_' + Math.random().toString(36).substr(2, 9),
      timestamp: timestamp,
      date: day,
      hour: hour,
      errorKey: errorKey
    });

    stats.errors.unshift(record);

    // 限制列表大小
    if (stats.errors.length > 1000) {
      stats.errors.pop();
    }

    // 更新类型统计
    if (!stats.byType[errorInfo.type]) {
      stats.byType[errorInfo.type] = 0;
    }
    stats.byType[errorInfo.type]++;
    stats.total++;

    // 更新小时统计
    if (!stats.byHour[hour]) {
      stats.byHour[hour] = 0;
    }
    stats.byHour[hour]++;

    // 更新天统计
    if (!stats.byDay[day]) {
      stats.byDay[day] = 0;
    }
    stats.byDay[day]++;

    // 更新今日统计
    if (day === formatDate(new Date())) {
      stats.today++;
    }

    // 更新页面统计
    const page = errorInfo.url || 'unknown';
    if (!stats.byPage[page]) {
      stats.byPage[page] = 0;
    }
    stats.byPage[page]++;

    // 更新浏览器统计
    const browser = parseBrowser(errorInfo.userAgent);
    if (!stats.byBrowser[browser]) {
      stats.byBrowser[browser] = 0;
    }
    stats.byBrowser[browser]++;

    // 更新用户统计
    const userId = errorInfo.userId || errorInfo.environment?.userId || 'anonymous';
    stats.users.add(userId);

    // 更新去重错误
    if (!stats.uniqueErrors[errorKey]) {
      stats.uniqueErrors[errorKey] = {
        key: errorKey,
        message: errorInfo.message,
        type: errorInfo.type,
        count: 0,
        firstTime: timestamp,
        lastTime: timestamp,
        resolved: false
      };
    }
    stats.uniqueErrors[errorKey].count++;
    stats.uniqueErrors[errorKey].lastTime = timestamp;

    // 保存到存储
    saveToStorage();

    // 触发事件
    window.dispatchEvent(new CustomEvent('errorStatsUpdated', { detail: getSummary() }));

    return record;
  }

  /**
   * 生成错误Key
   */
  function generateErrorKey(errorInfo) {
    // 使用消息和堆栈的前100个字符作为Key
    const message = (errorInfo.message || '').substring(0, 100);
    const stack = (errorInfo.stack || '').substring(0, 100);
    const type = errorInfo.type || 'unknown';
    return type + '_' + hashCode(message + stack);
  }

  /**
   * 简单哈希
   */
  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 解析浏览器
   */
  function parseBrowser(ua) {
    if (!ua) return 'Unknown';

    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) return 'IE';
    if (ua.indexOf('Mobile') > -1) return 'Mobile';

    return 'Other';
  }

  /**
   * 格式化日期
   */
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  /**
   * 获取统计摘要
   */
  function getSummary() {
    const now = Date.now();
    const today = formatDate(new Date());
    const last24h = now - 24 * 60 * 60 * 1000;
    const last7d = now - 7 * 24 * 60 * 60 * 1000;

    // 计算错误趋势
    const last24hCount = stats.errors.filter(function(e) {
      return e.timestamp > last24h;
    }).length;

    const prev24hCount = stats.errors.filter(function(e) {
      return e.timestamp <= last24h && e.timestamp > last24h - 24 * 60 * 60 * 1000;
    }).length;

    const trend24h = prev24hCount > 0 ? 
      Math.round(((last24hCount - prev24hCount) / prev24hCount) * 100) : 0;

    return {
      total: stats.total,
      today: stats.today,
      last24h: last24hCount,
      trend24h: trend24h,
      uniqueCount: Object.keys(stats.uniqueErrors).length,
      affectedUsers: stats.users.size,
      byType: getTypeDistribution(),
      byHour: stats.byHour,
      byDay: getLast7DaysTrend(),
      topPages: getTopPages(5),
      topBrowsers: getBrowserDistribution()
    };
  }

  /**
   * 获取类型分布
   */
  function getTypeDistribution() {
    const distribution = [];
    const typeOrder = ['js_error', 'promise_error', 'resource_error', 'network_error', 'server_error'];

    typeOrder.forEach(function(type) {
      if (stats.byType[type]) {
        distribution.push({
          type: type,
          name: errorTypeMap[type] || type,
          count: stats.byType[type],
          percentage: Math.round((stats.byType[type] / stats.total) * 100)
        });
      }
    });

    // 其他类型
    let otherCount = 0;
    Object.keys(stats.byType).forEach(function(type) {
      if (typeOrder.indexOf(type) === -1) {
        otherCount += stats.byType[type];
      }
    });

    if (otherCount > 0) {
      distribution.push({
        type: 'other',
        name: '其他',
        count: otherCount,
        percentage: Math.round((otherCount / stats.total) * 100)
      });
    }

    return distribution.sort(function(a, b) {
      return b.count - a.count;
    });
  }

  /**
   * 获取最近7天趋势
   */
  function getLast7DaysTrend() {
    const trend = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStr = formatDate(date);
      const count = stats.byDay[dayStr] || 0;

      trend.push({
        date: dayStr,
        day: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
        count: count
      });
    }

    return trend;
  }

  /**
   * 获取Top页面
   */
  function getTopPages(limit) {
    const pages = [];
    const pageUrls = Object.keys(stats.byPage);

    pageUrls.forEach(function(url) {
      // 简化URL
      let shortUrl = url;
      try {
        const parsed = new URL(url);
        shortUrl = parsed.pathname || url;
      } catch (e) {}

      pages.push({
        url: url,
        shortUrl: shortUrl,
        count: stats.byPage[url]
      });
    });

    return pages.sort(function(a, b) {
      return b.count - a.count;
    }).slice(0, limit);
  }

  /**
   * 获取浏览器分布
   */
  function getBrowserDistribution() {
    const browsers = [];
    const total = Object.values(stats.byBrowser).reduce(function(a, b) { return a + b; }, 0);

    Object.keys(stats.byBrowser).forEach(function(browser) {
      browsers.push({
        browser: browser,
        count: stats.byBrowser[browser],
        percentage: total > 0 ? Math.round((stats.byBrowser[browser] / total) * 100) : 0
      });
    });

    return browsers.sort(function(a, b) {
      return b.count - a.count;
    });
  }

  /**
   * 获取错误列表
   */
  function getErrors(options = {}) {
    let errors = stats.errors.slice();

    // 筛选
    if (options.type) {
      errors = errors.filter(function(e) { return e.type === options.type; });
    }
    if (options.page) {
      errors = errors.filter(function(e) { return e.url === options.page; });
    }
    if (options.startTime) {
      errors = errors.filter(function(e) { return e.timestamp >= options.startTime; });
    }
    if (options.endTime) {
      errors = errors.filter(function(e) { return e.timestamp <= options.endTime; });
    }

    // 排序
    if (options.sortBy === 'type') {
      errors.sort(function(a, b) { return a.type.localeCompare(b.type); });
    } else if (options.sortBy === 'page') {
      errors.sort(function(a, b) { return a.url.localeCompare(b.url); });
    } else {
      errors.sort(function(a, b) { return b.timestamp - a.timestamp; });
    }

    // 分页
    const page = options.pageNum || 1;
    const pageSize = options.pageSize || 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      list: errors.slice(start, end),
      total: errors.length,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(errors.length / pageSize)
    };
  }

  /**
   * 获取唯一错误列表
   */
  function getUniqueErrors(options = {}) {
    let errors = Object.values(stats.uniqueErrors);

    // 筛选
    if (options.type) {
      errors = errors.filter(function(e) { return e.type === options.type; });
    }
    if (options.resolved !== undefined) {
      errors = errors.filter(function(e) { return e.resolved === options.resolved; });
    }

    // 排序
    errors.sort(function(a, b) {
      if (options.sortBy === 'count') {
        return b.count - a.count;
      }
      return b.lastTime - a.lastTime;
    });

    return errors;
  }

  /**
   * 标记错误已修复
   */
  function markResolved(errorKey) {
    if (stats.uniqueErrors[errorKey]) {
      stats.uniqueErrors[errorKey].resolved = true;
      stats.uniqueErrors[errorKey].resolvedTime = Date.now();
      saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * 获取错误详情
   */
  function getErrorDetail(errorId) {
    return stats.errors.find(function(e) { return e.id === errorId; });
  }

  /**
   * 获取错误趋势数据（用于图表）
   */
  function getTrendData(days) {
    days = days || 7;
    const trend = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStr = formatDate(date);

      const dayData = {
        date: dayStr,
        day: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
        total: 0,
        byType: {}
      };

      stats.errors.forEach(function(e) {
        if (e.date === dayStr) {
          dayData.total++;
          if (!dayData.byType[e.type]) {
            dayData.byType[e.type] = 0;
          }
          dayData.byType[e.type]++;
        }
      });

      trend.push(dayData);
    }

    return trend;
  }

  /**
   * 导出统计数据
   */
  function exportData(format) {
    format = format || 'json';

    const data = {
      summary: getSummary(),
      errors: stats.errors,
      uniqueErrors: stats.uniqueErrors,
      byType: stats.byType,
      byPage: stats.byPage,
      byBrowser: stats.byBrowser,
      byDay: stats.byDay,
      exportTime: Date.now()
    };

    if (format === 'csv') {
      return convertToCSV(data.errors);
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * 转换为CSV
   */
  function convertToCSV(errors) {
    const headers = ['时间', '类型', '消息', '页面', '浏览器'];
    const rows = errors.map(function(e) {
      return [
        new Date(e.timestamp).toLocaleString(),
        errorTypeMap[e.type] || e.type,
        (e.message || '').substring(0, 100),
        e.url,
        parseBrowser(e.userAgent)
      ].map(function(v) {
        return '"' + String(v).replace(/"/g, '""') + '"';
      }).join(',');
    });

    return [headers.join(','), rows.join('\n')].join('\n');
  }

  /**
   * 保存到存储
   */
  function saveToStorage() {
    try {
      const data = {
        errors: stats.errors.slice(0, 500), // 只保存最近500条
        byType: stats.byType,
        byPage: stats.byPage,
        byBrowser: stats.byBrowser,
        byDay: stats.byDay,
        uniqueErrors: stats.uniqueErrors,
        total: stats.total,
        lastUpdate: Date.now()
      };
      localStorage.setItem(storageConfig.prefix + 'data', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save error stats:', e);
    }
  }

  /**
   * 从存储加载
   */
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(storageConfig.prefix + 'data');
      if (stored) {
        const data = JSON.parse(stored);

        // 检查是否过期
        if (data.lastUpdate && (Date.now() - data.lastUpdate) > storageConfig.ttl) {
          clearStats();
          return;
        }

        stats.errors = data.errors || [];
        stats.byType = data.byType || {};
        stats.byPage = data.byPage || {};
        stats.byBrowser = data.byBrowser || {};
        stats.byDay = data.byDay || {};
        stats.uniqueErrors = data.uniqueErrors || {};
        stats.total = data.total || 0;

        // 重新计算今日和用户数
        const today = formatDate(new Date());
        stats.today = stats.errors.filter(function(e) { return e.date === today; }).length;
      }
    } catch (e) {
      console.error('Failed to load error stats:', e);
    }
  }

  /**
   * 清除统计
   */
  function clearStats() {
    stats = {
      errors: [],
      byType: {},
      byPage: {},
      byBrowser: {},
      byHour: {},
      byDay: {},
      users: new Set(),
      total: 0,
      today: 0,
      uniqueErrors: {}
    };
    localStorage.removeItem(storageConfig.prefix + 'data');
  }

  // 公开API
  return {
    init: init,
    recordError: recordError,
    getSummary: getSummary,
    getErrors: getErrors,
    getUniqueErrors: getUniqueErrors,
    getErrorDetail: getErrorDetail,
    markResolved: markResolved,
    getTrendData: getTrendData,
    getTypeDistribution: getTypeDistribution,
    getLast7DaysTrend: getLast7DaysTrend,
    getTopPages: getTopPages,
    getBrowserDistribution: getBrowserDistribution,
    exportData: exportData,
    clearStats: clearStats
  };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorStats;
}
