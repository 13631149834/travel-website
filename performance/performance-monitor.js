/**
 * 性能监控工具 - 游导旅游平台
 * 功能：页面加载时间统计、资源加载监控、性能报告生成
 */

class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      enableResourceTiming: options.enableResourceTiming !== false,
      enableNavigationTiming: options.enableNavigationTiming !== false,
      enablePaintTiming: options.enablePaintTiming !== false,
      reportUrl: options.reportUrl || null,
      sampleRate: options.sampleRate || 1.0,
      maxQueueSize: options.maxQueueSize || 100
    };

    this.metrics = {
      pageLoad: {},
      resources: [],
      paint: {},
      navigation: {},
      custom: []
    };

    this.queue = [];
    this.isInitialized = false;

    this.init();
  }

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 页面加载事件
    this.observePageLoad();
    
    // 资源加载监控
    if (this.options.enableResourceTiming) {
      this.observeResources();
    }

    // 绘制性能监控
    if (this.options.enablePaintTiming) {
      this.observePaint();
    }

    // 导航性能
    if (this.options.enableNavigationTiming) {
      this.observeNavigation();
    }

    // 错误监控
    this.observeErrors();

    // 定期清理
    setInterval(() => this.cleanup(), 60000);
  }

  // ==================== 页面加载时间 ====================
  observePageLoad() {
    if (!window.performance) return;

    const timing = window.performance.timing;
    
    // 等待页面加载完成
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perf = window.performance;
        const timing = perf.timing || {};
        const navigation = perf.navigation || {};

        this.metrics.pageLoad = {
          // 关键时间点
          fetchStart: timing.fetchStart || 0,
          domContentLoaded: timing.domContentLoadedEventEnd - timing.fetchStart,
          domComplete: timing.domComplete - timing.fetchStart,
          loadComplete: timing.loadEventEnd - timing.fetchStart,
          
          // DNS解析
          dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
          
          // TCP连接
          tcpConnect: timing.connectEnd - timing.connectStart,
          
          // SSL/TLS
          ssl: timing.secureConnectionStart ? 
            timing.connectEnd - timing.secureConnectionStart : 0,
          
          // 请求响应
          request: timing.responseStart - timing.requestStart,
          response: timing.responseEnd - timing.responseStart,
          
          // DOM解析
          domParse: timing.domInteractive - timing.domLoading,
          
          // 首字节时间
          ttfb: timing.responseStart - timing.requestStart,
          
          // 导航类型
          navigationType: navigation.type === 0 ? 'navigate' : 
                          navigation.type === 1 ? 'reload' : 'back_forward',
          
          // 重定向
          redirectCount: navigation.redirectCount || 0,
          
          // 传输大小
          transferSize: timing.transferSize || 0,
          encodedBodySize: timing.encodedBodySize || 0,
          decodedBodySize: timing.decodedBodySize || 0,
          
          timestamp: Date.now()
        };

        this.dispatchEvent('performance:pageLoaded', this.metrics.pageLoad);
        this.report();
      }, 0);
    });
  }

  // ==================== 资源加载监控 ====================
  observeResources() {
    if (!window.PerformanceObserver) return;

    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        const resource = {
          name: entry.name,
          type: entry.initiatorType,
          duration: entry.duration,
          transferSize: entry.transferSize || 0,
          encodedBodySize: entry.encodedBodySize || 0,
          decodedBodySize: entry.decodedBodySize || 0,
          dns: entry.domainLookupEnd - entry.domainLookupStart,
          tcp: entry.connectEnd - entry.connectStart,
          ssl: entry.secureConnectionStart ? 
            entry.connectEnd - entry.secureConnectionStart : 0,
          ttfb: entry.responseStart - entry.requestStart,
          download: entry.responseEnd - entry.responseStart,
          renderBlocking: entry.renderBlocking === 'blocking',
          status: entry.responseStatus || 0,
          timestamp: Date.now()
        };

        this.metrics.resources.push(resource);
        
        // 触发事件
        this.dispatchEvent('performance:resourceLoaded', resource);

        // 限制队列大小
        if (this.metrics.resources.length > this.options.maxQueueSize) {
          this.metrics.resources.shift();
        }
      });
    });

    resourceObserver.observe({ entryTypes: ['resource', 'paint'] });
  }

  // ==================== 绘制性能监控 ====================
  observePaint() {
    if (!window.PerformanceObserver) return;

    const paintObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        this.metrics.paint[entry.name] = entry.startTime;
        this.dispatchEvent('performance:paint', { name: entry.name, time: entry.startTime });
      });
    });

    paintObserver.observe({ entryTypes: ['paint'] });
  }

  // ==================== 导航性能 ====================
  observeNavigation() {
    if (!window.PerformanceObserver) return;

    const navObserver = new PerformanceObserver((list) => {
      const entry = list.getEntries()[0];
      if (entry) {
        this.metrics.navigation = {
          type: entry.type,
          redirectCount: entry.redirectCount,
          length: entry.navigationTiming?.length || 0,
          timestamp: Date.now()
        };
      }
    });

    navObserver.observe({ entryTypes: ['navigation'] });
  }

  // ==================== 错误监控 ====================
  observeErrors() {
    // JavaScript错误
    window.addEventListener('error', (event) => {
      this.addCustomMetric('js_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now()
      });
    });

    // 资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target && (event.target.tagName === 'IMG' || 
          event.target.tagName === 'SCRIPT' || 
          event.target.tagName === 'LINK')) {
        this.addCustomMetric('resource_error', {
          url: event.target.src || event.target.href,
          type: event.target.tagName,
          timestamp: Date.now()
        });
      }
    }, true);

    // Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.addCustomMetric('unhandled_rejection', {
        reason: event.reason?.message || String(event.reason),
        timestamp: Date.now()
      });
    });
  }

  // ==================== 自定义指标 ====================
  addCustomMetric(name, data) {
    this.metrics.custom.push({
      name,
      ...data
    });
    
    this.dispatchEvent('performance:custom', { name, data });
  }

  // ==================== 性能指标计算 ====================
  getMetrics() {
    const pageLoad = this.metrics.pageLoad;
    
    // Core Web Vitals
    const metrics = {
      // First Contentful Paint (FCP)
      fcp: this.metrics.paint['first-contentful-paint'] || 0,
      
      // Largest Contentful Paint (LCP) - 需要PerformanceObserver
      lcp: this.getLCP(),
      
      // First Input Delay (FID)
      fid: this.getFID(),
      
      // Cumulative Layout Shift (CLS)
      cls: this.getCLS(),
      
      // Time to First Byte (TTFB)
      ttfb: pageLoad.ttfb || 0,
      
      // Total Page Load Time
      loadTime: pageLoad.loadComplete || 0,
      
      // DOM Content Loaded
      domContentLoaded: pageLoad.domContentLoaded || 0,
      
      // DOM Complete
      domComplete: pageLoad.domComplete || 0,
      
      // Resource count
      resourceCount: this.metrics.resources.length,
      
      // Total transfer size
      totalTransferSize: this.metrics.resources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
    };

    // 计算评级
    metrics.ratings = {
      fcp: this.rateMetric(metrics.fcp, [1800, 3000]),
      ttfb: this.rateMetric(metrics.ttfb, [800, 1800]),
      loadTime: this.rateMetric(metrics.loadTime, [2500, 5000])
    };

    return metrics;
  }

  getLCP() {
    return new Promise(resolve => {
      if (!window.PerformanceObserver) {
        resolve(0);
        return;
      }

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        observer.disconnect();
        resolve(lastEntry?.startTime || 0);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    });
  }

  getFID() {
    return new Promise(resolve => {
      if (!window.PerformanceObserver) {
        resolve(0);
        return;
      }

      const observer = new PerformanceObserver((list) => {
        const firstEntry = list.getEntries()[0];
        observer.disconnect();
        resolve(firstEntry?.processingStart - firstEntry?.startTime || 0);
      });

      observer.observe({ entryTypes: ['first-input'] });
    });
  }

  getCLS() {
    return new Promise(resolve => {
      if (!window.PerformanceObserver) {
        resolve(0);
        return;
      }

      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      resolve(clsValue);
    });
  }

  rateMetric(value, thresholds) {
    if (value <= 0) return 'unknown';
    if (value <= thresholds[0]) return 'good';
    if (value <= thresholds[1]) return 'needs-improvement';
    return 'poor';
  }

  // ==================== 报告生成 ====================
  generateReport() {
    const metrics = this.getMetrics();
    const resources = this.metrics.resources;

    // 资源分类统计
    const resourceStats = {
      images: resources.filter(r => r.type === 'img'),
      scripts: resources.filter(r => r.type === 'script'),
      styles: resources.filter(r => r.type === 'link' || r.type === 'css'),
      xhr: resources.filter(r => r.type === 'xmlhttprequest' || r.type === 'fetch'),
      other: resources.filter(r => !['img', 'script', 'link', 'css', 'xmlhttprequest', 'fetch'].includes(r.type))
    };

    // 慢资源（超过1秒）
    const slowResources = resources.filter(r => r.duration > 1000);

    // 大资源（超过100KB）
    const largeResources = resources.filter(r => r.transferSize > 100 * 1024);

    // 错误资源
    const failedResources = resources.filter(r => r.status >= 400);

    return {
      summary: {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio,
        connectionType: navigator.connection?.effectiveType || 'unknown'
      },
      metrics,
      resourceStats: {
        total: resources.length,
        byType: {
          images: resourceStats.images.length,
          scripts: resourceStats.scripts.length,
          styles: resourceStats.styles.length,
          xhr: resourceStats.xhr.length,
          other: resourceStats.other.length
        },
        slowCount: slowResources.length,
        largeCount: largeResources.length,
        failedCount: failedResources.length
      },
      slowResources: slowResources.map(r => ({
        name: r.name,
        type: r.type,
        duration: Math.round(r.duration),
        transferSize: r.transferSize
      })),
      largeResources: largeResources.map(r => ({
        name: r.name,
        type: r.type,
        transferSize: Math.round(r.transferSize / 1024) + 'KB'
      })),
      failedResources: failedResources.map(r => ({
        name: r.name,
        type: r.type,
        status: r.status
      })),
      errors: this.metrics.custom.filter(m => m.name.includes('error')),
      recommendations: this.generateRecommendations(metrics, resources)
    };
  }

  generateRecommendations(metrics, resources) {
    const recommendations = [];

    // FCP建议
    if (metrics.fcp > 1800) {
      recommendations.push({
        metric: 'FCP',
        value: metrics.fcp,
        suggestion: '优化关键渲染路径，减少阻塞渲染的资源'
      });
    }

    // TTFB建议
    if (metrics.ttfb > 800) {
      recommendations.push({
        metric: 'TTFB',
        value: metrics.ttfb,
        suggestion: '启用服务器缓存，使用CDN加速'
      });
    }

    // 图片优化建议
    const largeImages = resources.filter(r => r.type === 'img' && r.transferSize > 100 * 1024);
    if (largeImages.length > 0) {
      recommendations.push({
        metric: 'Large Images',
        count: largeImages.length,
        suggestion: '压缩图片体积，转换为WebP格式，使用响应式图片'
      });
    }

    // 慢资源建议
    const slowScripts = resources.filter(r => r.type === 'script' && r.duration > 500);
    if (slowScripts.length > 0) {
      recommendations.push({
        metric: 'Slow Scripts',
        count: slowScripts.length,
        suggestion: '使用代码分割，按需加载脚本'
      });
    }

    return recommendations;
  }

  // ==================== 上报与清理 ====================
  report() {
    const report = this.generateReport();
    
    if (this.options.reportUrl) {
      this.queue.push(report);
      this.flushQueue();
    }

    return report;
  }

  flushQueue() {
    if (!this.options.reportUrl || this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.queue.length);
    
    fetch(this.options.reportUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch })
    }).catch(() => {
      // 上报失败，放回队列
      this.queue.push(...batch);
    });
  }

  cleanup() {
    const maxAge = 5 * 60 * 1000; // 5分钟
    const now = Date.now();
    
    this.metrics.resources = this.metrics.resources.filter(r => 
      now - r.timestamp < maxAge
    );
    this.metrics.custom = this.metrics.custom.filter(m =>
      now - m.timestamp < maxAge
    );
  }

  dispatchEvent(name, data) {
    window.dispatchEvent(new CustomEvent(name, { detail: data }));
  }
}

// ==================== 性能评分计算 ====================
class PerformanceScorer {
  static calculateScore(metrics) {
    let score = 100;

    // FCP扣分 (满分30)
    if (metrics.fcp > 0) {
      if (metrics.fcp > 3000) score -= 30;
      else if (metrics.fcp > 1800) score -= 15;
    }

    // TTFB扣分 (满分25)
    if (metrics.ttfb > 0) {
      if (metrics.ttfb > 1800) score -= 25;
      else if (metrics.ttfb > 800) score -= 10;
    }

    // 加载时间扣分 (满分25)
    if (metrics.loadTime > 0) {
      if (metrics.loadTime > 5000) score -= 25;
      else if (metrics.loadTime > 2500) score -= 10;
    }

    // 资源数量扣分 (满分20)
    if (metrics.resourceCount > 50) score -= 10;
    if (metrics.resourceCount > 100) score -= 10;

    return Math.max(0, Math.round(score));
  }

  static getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}

// ==================== 导出API ====================
const PerformanceAPI = {
  monitor: null,

  init(options = {}) {
    this.monitor = new PerformanceMonitor(options);
    return this.monitor;
  },

  getReport() {
    if (!this.monitor) return null;
    return this.monitor.generateReport();
  },

  getScore() {
    if (!this.monitor) return 0;
    const metrics = this.monitor.getMetrics();
    return PerformanceScorer.calculateScore(metrics);
  },

  getGrade() {
    return PerformanceScorer.getGrade(this.getScore());
  },

  // 快速检测
  quickCheck() {
    const result = {
      supported: !!window.PerformanceObserver,
      connectionType: navigator.connection?.effectiveType || 'unknown',
      effectiveType: navigator.connection?.effectiveType,
      downlink: navigator.connection?.downlink,
      rtt: navigator.connection?.rtt,
      saveData: navigator.connection?.saveData || false
    };
    return result;
  }
};

// 自动初始化（仅在开发/调试模式）
if (typeof window !== 'undefined' && 
    (window.location.search.includes('perf=true') || 
     localStorage.getItem('perf-debug') === 'true')) {
  PerformanceAPI.init();
  
  // 控制台输出
  window.addEventListener('performance:pageLoaded', () => {
    const score = PerformanceAPI.getScore();
    const grade = PerformanceAPI.getGrade();
    console.log(
      `%c 性能评分: ${score}分 (${grade}) `,
      `background: ${score >= 80 ? '#4CAF50' : score >= 60 ? '#FF9800' : '#F44336'}; color: white; padding: 4px 8px; border-radius: 4px;`
    );
  });
}

// 导出到全局
if (typeof window !== 'undefined') {
  window.PerformanceMonitor = PerformanceMonitor;
  window.PerformanceScorer = PerformanceScorer;
  window.PerformanceAPI = PerformanceAPI;
}
