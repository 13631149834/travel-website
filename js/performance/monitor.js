/**
 * 极致性能监控模块 - 游导旅游平台 v2.0
 * 功能：首屏时间、白屏时间、资源加载时间、性能评分
 */

(function(global) {
  'use strict';

  const PerformanceMonitor = {
    // 配置
    config: {
      sampleRate: 1.0,
      maxMetrics: 500,
      reportEndpoint: null,
      enableConsole: true,
      enableLocalStorage: true,
      enableResourceHints: true,
      scoreThresholds: {
        excellent: 90,
        good: 70,
        needsImprovement: 50
      },
      timingThresholds: {
        fcp: 1800,        // 首屏内容绘制 < 1.8s
        lcp: 2500,        // 最大内容绘制 < 2.5s
        fid: 100,         // 首次输入延迟 < 100ms
        cls: 0.1,         // 累积布局偏移 < 0.1
        ttfb: 600,        // 首字节时间 < 600ms
        pageLoad: 3000    // 页面加载 < 3s
      }
    },

    // 指标存储
    metrics: {
      pageLoad: null,
      resourceTimings: [],
      paintTimings: {},
      navigationTiming: null,
      customTimings: [],
      memory: null,
      network: null,
      coreWebVitals: {},
      performanceScore: null,
      longTasks: [],
      networkRequests: []
    },

    // 时间戳
    startTime: Date.now(),
    isInitialized: false,

    // 初始化
    init(options = {}) {
      if (this.isInitialized) return this;
      
      Object.assign(this.config, options);
      this.isInitialized = true;

      // 白屏时间监控
      this.observeWhiteScreen();

      // 收集基础性能指标
      this.collectNavigationTiming();
      this.collectPaintTimings();
      this.collectCoreWebVitals();
      this.observeResourceTimings();
      this.observeLongTasks();
      this.observeMemory();
      
      // 页面加载完成后收集完整指标
      if (document.readyState === 'complete') {
        this.collectFullMetrics();
      } else {
        window.addEventListener('load', () => this.collectFullMetrics());
      }

      // 监听页面可见性变化
      this.observeVisibilityChange();

      // 监听在线/离线状态
      this.observeNetworkChange();

      // 打印初始化完成标记
      this.markTiming('monitor-init');

      return this;
    },

    // ==================== 白屏时间监控 ====================
    observeWhiteScreen() {
      // 使用PerformanceNavigationTiming获取更精确的白屏时间
      if (window.PerformanceNavigationTiming) {
        const observeNav = () => {
          const entries = performance.getEntriesByType('navigation');
          if (entries.length > 0) {
            const nav = entries[0];
            this.metrics.paintTimings.whiteScreenTime = nav.responseStart || nav.fetchStart;
            this.metrics.paintTimings.domLoadingTime = nav.domLoading;
          }
        };

        if (document.readyState === 'complete') {
          observeNav();
        } else {
          window.addEventListener('load', observeNav);
        }
      }

      // 使用MutationObserver监控DOM变化
      const observer = new MutationObserver(() => {
        if (!this.metrics.paintTimings.firstDomChange) {
          this.metrics.paintTimings.firstDomChange = performance.now();
        }
      });
      
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    },

    // ==================== 收集核心Web Vitals ====================
    collectCoreWebVitals() {
      // LCP - 最大内容绘制
      this.observeLCP();

      // FID - 首次输入延迟
      this.observeFID();

      // CLS - 累积布局偏移
      this.observeCLS();

      // FCP - 首次内容绘制
      this.observeFCP();

      // TTFB - 首字节时间
      this.observeTTFB();
    },

    observeLCP() {
      if (!('PerformanceObserver' in window)) return;

      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          this.metrics.coreWebVitals.lcp = {
            value: lastEntry.renderTime || lastEntry.loadTime,
            element: lastEntry.element ? this.getElementSelector(lastEntry.element) : null,
            time: Date.now()
          };
        });
        
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        this.log('LCP观察失败:', e);
      }
    },

    observeFID() {
      if (!('PerformanceObserver' in window)) return;

      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.metrics.coreWebVitals.fid = {
              value: entry.processingStart - entry.startTime,
              eventType: entry.name,
              time: Date.now()
            };
          });
        });
        
        observer.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        this.log('FID观察失败:', e);
      }
    },

    observeCLS() {
      if (!('PerformanceObserver' in window)) return;

      let clsValue = 0;
      let clsEntries = [];

      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              clsEntries.push({
                value: entry.value,
                time: entry.startTime
              });
            }
          });
        });
        
        observer.observe({ type: 'layout-shift', buffered: true });

        // 保存CLS计算器
        this.metrics.coreWebVitals.cls = {
          getValue: () => clsValue,
          getEntries: () => clsEntries
        };
      } catch (e) {
        this.log('CLS观察失败:', e);
      }
    },

    observeFCP() {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcp) {
        this.metrics.coreWebVitals.fcp = {
          value: fcp.startTime,
          time: Date.now()
        };
      }
    },

    observeTTFB() {
      const entries = performance.getEntriesByType('navigation');
      if (entries.length > 0) {
        const nav = entries[0];
        this.metrics.coreWebVitals.ttfb = {
          value: nav.responseStart - nav.requestStart,
          time: Date.now()
        };
      }
    },

    // ==================== 收集导航时间 ====================
    collectNavigationTiming() {
      if (!window.performance || !window.performance.timing) return;

      const timing = window.performance.timing;
      const navigation = window.performance.navigation;

      this.metrics.navigationTiming = {
        // 关键时间点
        fetchStart: timing.fetchStart,
        domainLookupStart: timing.domainLookupStart,
        domainLookupEnd: timing.domainLookupEnd,
        connectStart: timing.connectStart,
        connectEnd: timing.connectEnd,
        secureConnectionStart: timing.secureConnectionStart,
        requestStart: timing.requestStart,
        responseStart: timing.responseStart,
        responseEnd: timing.responseEnd,
        domLoading: timing.domLoading,
        domInteractive: timing.domInteractive,
        domContentLoadedEventStart: timing.domContentLoadedEventStart,
        domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
        domComplete: timing.domComplete,
        loadEventStart: timing.loadEventStart,
        loadEventEnd: timing.loadEventEnd,

        // 计算指标
        dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
        tcpTime: timing.connectEnd - timing.connectStart,
        sslTime: timing.secureConnectionStart ? 
          timing.connectEnd - timing.secureConnectionStart : 0,
        ttfb: timing.responseStart - timing.requestStart,
        contentDownload: timing.responseEnd - timing.responseStart,
        domParseTime: timing.domInteractive - timing.domLoading,
        domReadyTime: timing.domContentLoadedEventEnd - timing.domLoading,
        pageLoadTime: timing.loadEventEnd - timing.fetchStart,
        
        // 首屏相关
        firstPaint: this.getFirstPaint(),
        fcp: this.getFirstContentfulPaint(),
        
        // 导航信息
        navigationType: navigation.type,
        redirectCount: navigation.redirectCount,
        timestamp: Date.now()
      };
    },

    // 获取首次绘制时间
    getFirstPaint() {
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      return firstPaint ? firstPaint.startTime : null;
    },

    // 获取首次内容绘制时间
    getFirstContentfulPaint() {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcp ? fcp.startTime : null;
    },

    // 观察资源加载时间
    observeResourceTimings() {
      if (!('PerformanceObserver' in window)) return;

      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            this.metrics.resourceTimings.push({
              name: entry.name,
              type: entry.initiatorType,
              duration: entry.duration,
              size: entry.transferSize,
              encodedBodySize: entry.encodedBodySize,
              decodedBodySize: entry.decodedBodySize,
              startTime: entry.startTime,
              responseEnd: entry.responseEnd,
              dns: entry.domainLookupEnd - entry.domainLookupStart,
              tcp: entry.connectEnd - entry.connectStart,
              ttfb: entry.responseStart - entry.requestStart,
              timestamp: Date.now()
            });

            // 记录网络请求
            if (entry.initiatorType !== 'navigation') {
              this.metrics.networkRequests.push({
                url: entry.name,
                type: entry.initiatorType,
                size: entry.transferSize,
                duration: entry.duration
              });
            }
          });
        });
        
        observer.observe({ entryTypes: ['resource', 'paint'] });
      } catch (e) {
        this.log('资源观察失败:', e);
      }
    },

    // 观察长任务
    observeLongTasks() {
      if (!('PerformanceObserver' in window) || !('PerformanceLongTaskTiming' in window)) return;

      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            this.metrics.longTasks.push({
              duration: entry.duration,
              startTime: entry.startTime,
              attribution: entry.attribution ? entry.attribution.map(a => ({
                name: a.name,
                type: a.type
              })) : []
            });
          });
        });
        
        observer.observe({ type: 'longtask', buffered: true });
      } catch (e) {
        this.log('长任务观察失败:', e);
      }
    },

    // 观察内存使用
    observeMemory() {
      if (performance.memory) {
        this.metrics.memory = {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          usagePercent: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100).toFixed(2)
        };
      }
    },

    // 观察页面可见性
    observeVisibilityChange() {
      document.addEventListener('visibilitychange', () => {
        this.metrics.paintTimings.visibilityChange = {
          state: document.visibilityState,
          timestamp: Date.now()
        };
      });
    },

    // 观察网络变化
    observeNetworkChange() {
      window.addEventListener('online', () => {
        this.metrics.network = {
          online: true,
          effectiveType: navigator.connection?.effectiveType,
          downlink: navigator.connection?.downlink,
          timestamp: Date.now()
        };
      });

      window.addEventListener('offline', () => {
        this.metrics.network = {
          online: false,
          timestamp: Date.now()
        };
      });
    },

    // ==================== 收集完整指标 ====================
    collectFullMetrics() {
      this.markTiming('full-metrics-collected');
      
      // 计算性能评分
      this.calculatePerformanceScore();

      // 保存到localStorage
      if (this.config.enableLocalStorage) {
        this.saveMetrics();
      }

      // 输出到控制台
      if (this.config.enableConsole) {
        this.outputMetrics();
      }

      // 上报到服务器
      if (this.config.reportEndpoint) {
        this.reportMetrics();
      }
    },

    // ==================== 性能评分计算 ====================
    calculatePerformanceScore() {
      const { fcp, lcp, fid, ttfb, pageLoadTime } = this.getMetricSummary();
      const thresholds = this.config.timingThresholds;
      let score = 100;

      // FCP评分 (权重 20%)
      if (fcp > thresholds.fcp) {
        score -= Math.min(20, ((fcp - thresholds.fcp) / thresholds.fcp) * 30);
      }

      // LCP评分 (权重 25%)
      if (lcp && lcp > thresholds.lcp) {
        score -= Math.min(25, ((lcp - thresholds.lcp) / thresholds.lcp) * 30);
      }

      // FID评分 (权重 15%)
      if (fid && fid > thresholds.fid) {
        score -= Math.min(15, ((fid - thresholds.fid) / thresholds.fid) * 30);
      }

      // TTFB评分 (权重 20%)
      if (ttfb > thresholds.ttfb) {
        score -= Math.min(20, ((ttfb - thresholds.ttfb) / thresholds.ttfb) * 30);
      }

      // 页面加载时间评分 (权重 20%)
      if (pageLoadTime > thresholds.pageLoad) {
        score -= Math.min(20, ((pageLoadTime - thresholds.pageLoad) / thresholds.pageLoad) * 30);
      }

      this.metrics.performanceScore = Math.max(0, Math.round(score));
    },

    // 获取指标摘要
    getMetricSummary() {
      const nav = this.metrics.navigationTiming || {};
      const cwv = this.metrics.coreWebVitals || {};
      
      return {
        fcp: nav.fcp || cwv.fcp?.value || 0,
        lcp: cwv.lcp?.value || 0,
        fid: cwv.fid?.value || 0,
        cls: typeof cwv.cls?.getValue === 'function' ? cwv.cls.getValue() : 0,
        ttfb: nav.ttfb || cwv.ttfb?.value || 0,
        pageLoadTime: nav.pageLoadTime || (Date.now() - this.startTime),
        dnsTime: nav.dnsTime || 0,
        tcpTime: nav.tcpTime || 0,
        domParseTime: nav.domParseTime || 0,
        domReadyTime: nav.domReadyTime || 0
      };
    },

    // 保存指标
    saveMetrics() {
      try {
        const key = 'youdau_perf_' + Date.now();
        const data = {
          url: window.location.href,
          score: this.metrics.performanceScore,
          summary: this.getMetricSummary(),
          timestamp: Date.now()
        };
        
        // 限制存储数量
        const existingKeys = Object.keys(localStorage).filter(k => k.startsWith('youdau_perf_'));
        if (existingKeys.length >= this.config.maxMetrics) {
          existingKeys.slice(0, -this.config.maxMetrics + 1).forEach(k => localStorage.removeItem(k));
        }
        
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        this.log('保存指标失败:', e);
      }
    },

    // 输出指标
    outputMetrics() {
      const summary = this.getMetricSummary();
      const score = this.metrics.performanceScore;
      
      console.group('🚀 游导旅游性能监控');
      console.log('📊 性能评分:', score, this.getScoreLabel(score));
      console.log('⏱️ 指标摘要:', summary);
      console.log('🌐 核心Web Vitals:', this.metrics.coreWebVitals);
      console.log('📦 资源加载:', this.metrics.resourceTimings.length, '个请求');
      console.log('⚠️ 长任务:', this.metrics.longTasks.length, '个');
      console.log('💾 内存使用:', this.metrics.memory);
      console.groupEnd();
    },

    // 获取评分标签
    getScoreLabel(score) {
      if (score >= this.config.scoreThresholds.excellent) return '🟢 优秀';
      if (score >= this.config.scoreThresholds.good) return '🟡 良好';
      if (score >= this.config.scoreThresholds.needsImprovement) return '🟠 需要改进';
      return '🔴 较差';
    },

    // 上报指标
    reportMetrics() {
      const data = {
        url: window.location.href,
        metrics: this.metrics,
        timestamp: Date.now()
      };

      navigator.sendBeacon?.(this.config.reportEndpoint, JSON.stringify(data)) ||
      fetch(this.config.reportEndpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        keepalive: true
      });
    },

    // 标记时间点
    markTiming(name) {
      this.metrics.customTimings.push({
        name,
        time: Date.now(),
        duration: Date.now() - this.startTime
      });
    },

    // 获取元素选择器
    getElementSelector(element) {
      if (!element) return null;
      
      if (element.id) return '#' + element.id;
      if (element.className) return '.' + element.className.split(' ')[0];
      return element.tagName.toLowerCase();
    },

    // 日志
    log(...args) {
      if (this.config.enableConsole) {
        console.log('[性能监控]', ...args);
      }
    },

    // ==================== 公开API ====================
    getMetrics() {
      return this.metrics;
    },

    getScore() {
      return this.metrics.performanceScore;
    },

    getReport() {
      return {
        score: this.metrics.performanceScore,
        scoreLabel: this.getScoreLabel(this.metrics.performanceScore),
        summary: this.getMetricSummary(),
        webVitals: this.metrics.coreWebVitals,
        resourceCount: this.metrics.resourceTimings.length,
        longTaskCount: this.metrics.longTasks.length,
        memory: this.metrics.memory,
        timestamp: Date.now()
      };
    }
  };

  // 导出
  global.PerformanceMonitor = PerformanceMonitor;

  // 自动初始化
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => PerformanceMonitor.init(window.PerformanceConfig));
    } else {
      PerformanceMonitor.init(window.PerformanceConfig);
    }
  }

})(typeof window !== 'undefined' ? window : this);
