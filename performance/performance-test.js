/**
 * 性能测试工具 - 游导旅游平台
 * 功能：性能指标测试、Lighthouse集成、压力测试
 */

const PerformanceTest = {
  // 测试配置
  config: {
    iterations: 3,
    timeout: 30000,
    thresholds: {
      fcp: 1800,
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      ttfb: 600,
      pageLoad: 3000,
      speedIndex: 3000
    }
  },

  // 测试结果存储
  results: [],

  // ==================== 基础性能测试 ====================
  
  // 运行完整性能测试
  async runFullTest() {
    console.log('🚀 开始性能测试...');
    
    const results = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      metrics: {},
      coreWebVitals: {},
      resourceTimings: [],
      memory: this.getMemoryInfo()
    };

    // 收集Navigation Timing
    results.metrics.navigation = this.getNavigationTiming();
    
    // 收集Paint Timing
    results.metrics.paint = this.getPaintTiming();
    
    // 收集Resource Timing
    results.metrics.resources = this.getResourceTiming();
    
    // 收集Core Web Vitals
    results.coreWebVitals = await this.getCoreWebVitals();
    
    // 计算性能评分
    results.score = this.calculateScore(results.coreWebVitals);
    
    // 检查阈值
    results.passed = this.checkThresholds(results.coreWebVitals);
    
    this.results.push(results);
    
    this.outputResults(results);
    
    return results;
  },

  // 获取网络连接信息
  getConnectionInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return conn ? {
      effectiveType: conn.effectiveType,
      downlink: conn.downlink,
      rtt: conn.rtt,
      saveData: conn.saveData
    } : null;
  },

  // 获取内存信息
  getMemoryInfo() {
    if (performance.memory) {
      return {
        usedJSHeapSize: this.formatBytes(performance.memory.usedJSHeapSize),
        totalJSHeapSize: this.formatBytes(performance.memory.totalJSHeapSize),
        jsHeapSizeLimit: this.formatBytes(performance.memory.jsHeapSizeLimit),
        usagePercent: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(2) + '%'
      };
    }
    return null;
  },

  // 获取Navigation Timing
  getNavigationTiming() {
    const timing = performance.timing;
    const nav = performance.getEntriesByType('navigation')[0];
    
    if (!timing) return null;
    
    return {
      // 关键指标
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ttfb: timing.responseStart - timing.requestStart,
      contentDownload: timing.responseEnd - timing.responseStart,
      domParse: timing.domInteractive - timing.domLoading,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.domLoading,
      domComplete: timing.domComplete - timing.domLoading,
      pageLoad: timing.loadEventEnd - timing.fetchStart,
      
      // 总时间分解
      network: timing.domainLookupEnd - timing.fetchStart,
      frontend: timing.loadEventEnd - timing.responseEnd,
      
      // 原始时间戳
      fetchStart: timing.fetchStart,
      responseEnd: timing.responseEnd,
      loadEventEnd: timing.loadEventEnd
    };
  },

  // 获取Paint Timing
  getPaintTiming() {
    const entries = performance.getEntriesByType('paint');
    
    return entries.reduce((acc, entry) => {
      acc[entry.name] = entry.startTime;
      return acc;
    }, {});
  },

  // 获取Resource Timing
  getResourceTiming() {
    const resources = performance.getEntriesByType('resource');
    
    const summary = {
      total: resources.length,
      byType: {},
      largest: [],
      slowest: [],
      totalSize: 0
    };
    
    resources.forEach(r => {
      // 按类型统计
      const type = r.initiatorType || 'other';
      summary.byType[type] = (summary.byType[type] || 0) + 1;
      
      // 记录最大资源
      if (r.transferSize > 0) {
        summary.largest.push({
          name: r.name,
          size: r.transferSize,
          type: r.initiatorType
        });
      }
      
      // 记录最慢资源
      summary.slowest.push({
        name: r.name,
        duration: r.duration,
        type: r.initiatorType
      });
      
      // 累加大小
      summary.totalSize += r.transferSize || 0;
    });
    
    // 排序
    summary.largest.sort((a, b) => b.size - a.size);
    summary.slowest.sort((a, b) => b.duration - a.duration);
    
    // 取前5
    summary.largest = summary.largest.slice(0, 5);
    summary.slowest = summary.slowest.slice(0, 5);
    
    // 格式化大小
    summary.totalSizeFormatted = this.formatBytes(summary.totalSize);
    
    return summary;
  },

  // 获取Core Web Vitals
  async getCoreWebVitals() {
    return new Promise((resolve) => {
      const vitals = {};
      let completed = 0;
      const total = 3;
      
      const checkComplete = () => {
        completed++;
        if (completed >= total) {
          resolve(vitals);
        }
      };

      // LCP
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.lcp = Math.round(lastEntry.renderTime || lastEntry.loadTime);
            lcpObserver.disconnect();
            checkComplete();
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {
          checkComplete();
        }
        
        // CLS
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
          
          setTimeout(() => {
            vitals.cls = clsValue.toFixed(3);
            clsObserver.disconnect();
            checkComplete();
          }, 1000);
        } catch (e) {
          checkComplete();
        }
        
        // FID
        try {
          const fidObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
              vitals.fid = Math.round(entry.processingStart - entry.startTime);
            });
          });
          fidObserver.observe({ type: 'first-input', buffered: true });
        } catch (e) {
          // FID may not be available
        }
        setTimeout(checkComplete, 500);
      } else {
        resolve({});
      }
    });
  },

  // 计算性能评分
  calculateScore(vitals) {
    let score = 100;
    const { thresholds } = this.config;
    
    // FCP评分 (占25%)
    if (vitals.fcp > thresholds.fcp) {
      score -= 25 * Math.min(1, (vitals.fcp - thresholds.fcp) / thresholds.fcp);
    }
    
    // LCP评分 (占25%)
    if (vitals.lcp > thresholds.lcp) {
      score -= 25 * Math.min(1, (vitals.lcp - thresholds.lcp) / thresholds.lcp);
    }
    
    // CLS评分 (占25%)
    if (vitals.cls > thresholds.cls) {
      score -= 25 * Math.min(1, (vitals.cls - thresholds.cls) / thresholds.cls);
    }
    
    // FID评分 (占25%)
    if (vitals.fid > thresholds.fid) {
      score -= 25 * Math.min(1, (vitals.fid - thresholds.fid) / thresholds.fid);
    }
    
    return Math.round(Math.max(0, score));
  },

  // 检查阈值
  checkThresholds(vitals) {
    const { thresholds } = this.config;
    const passed = {};
    
    passed.fcp = (vitals.fcp || 0) <= thresholds.fcp;
    passed.lcp = (vitals.lcp || 0) <= thresholds.lcp;
    passed.cls = (vitals.cls || 0) <= thresholds.cls;
    passed.fid = (vitals.fid || 0) <= thresholds.fid;
    passed.ttfb = (vitals.ttfb || 0) <= thresholds.ttfb;
    
    passed.all = Object.values(passed).every(v => v);
    
    return passed;
  },

  // 输出结果
  outputResults(results) {
    console.group('📊 性能测试报告');
    console.log('⏱️ 时间戳:', new Date(results.timestamp).toLocaleString());
    console.log('🌐 页面:', results.url);
    
    if (results.connection) {
      console.log('📶 网络:', results.connection);
    }
    
    console.log('\n📈 Core Web Vitals:');
    console.table(results.coreWebVitals);
    
    console.log('\n🎯 性能评分:', results.score + '/100', this.getScoreLabel(results.score));
    
    console.log('\n✅ 阈值检查:');
    console.table(results.passed);
    
    console.log('\n📦 资源统计:');
    console.log('总数:', results.metrics.resources?.total);
    console.log('总大小:', results.metrics.resources?.totalSizeFormatted);
    
    console.log('\n💾 内存使用:');
    console.log(results.memory);
    
    console.groupEnd();
  },

  // 获取评分标签
  getScoreLabel(score) {
    if (score >= 90) return '🟢 优秀';
    if (score >= 70) return '🟡 良好';
    if (score >= 50) return '🟠 需要改进';
    return '🔴 较差';
  },

  // 格式化字节
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // ==================== Lighthouse集成 ====================
  
  // 模拟Lighthouse报告
  generateLighthouseReport() {
    const report = {
      categories: {
        performance: { score: 0 },
        accessibility: { score: 0 },
        bestPractices: { score: 0 },
        seo: { score: 0 }
      },
      audits: {},
      timing: {}
    };

    // 收集指标
    const vitals = this.results[this.results.length - 1]?.coreWebVitals || {};
    const nav = this.results[this.results.length - 1]?.metrics?.navigation || {};
    
    // 计算Performance分数
    const metrics = {
      fcp: { score: this.calcMetricScore(vitals.fcp, 1800, 3000) },
      lcp: { score: this.calcMetricScore(vitals.lcp, 2500, 4000) },
      cls: { score: this.calcMetricScore(vitals.cls * 100, 10, 25) },
      fid: { score: this.calcMetricScore(vitals.fid, 100, 300) },
      ttfb: { score: this.calcMetricScore(nav.ttfb, 600, 1800) },
      speedIndex: { score: this.calcMetricScore(nav.pageLoad, 3000, 6000) }
    };
    
    report.categories.performance.score = Object.values(metrics)
      .reduce((sum, m) => sum + m.score, 0) / Object.keys(metrics).length;
    
    report.audits = metrics;
    report.timing = nav;
    
    return report;
  },

  // 计算指标分数
  calcMetricScore(value, good, poor) {
    if (value <= good) return 1;
    if (value >= poor) return 0;
    return 1 - ((value - good) / (poor - good));
  },

  // ==================== 兼容性测试 ====================
  
  // 运行兼容性测试
  runCompatibilityTest() {
    const tests = {
      // 基础API
      intersectionObserver: 'IntersectionObserver' in window,
      performanceObserver: 'PerformanceObserver' in window,
      mutationObserver: 'MutationObserver' in window,
      resizeObserver: 'ResizeObserver' in window,
      
      // Service Worker
      serviceWorker: 'serviceWorker' in navigator,
      
      // 现代API
      fetch: 'fetch' in window,
      promises: 'Promise' in window,
      modules: 'noModule' in document.createElement('script'),
      
      // 存储
      localStorage: (() => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch (e) {
          return false;
        }
      })(),
      
      // 网络信息
      networkInfo: 'connection' in navigator,
      
      // 支付
      paymentRequest: 'PaymentRequest' in window,
      
      // WebAssembly
      webAssembly: 'WebAssembly' in window
    };
    
    console.group('🔧 兼容性测试');
    console.table(tests);
    console.log('\n支持率:', (Object.values(tests).filter(v => v).length / Object.keys(tests).length * 100).toFixed(1) + '%');
    console.groupEnd();
    
    return tests;
  }
};

// 导出
global.PerformanceTest = PerformanceTest;

// 自动运行测试（可选）
// PerformanceTest.runFullTest();
