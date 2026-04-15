/**
 * 游导旅游网站 - 资源加载器
 * 实现按需加载、预加载、延迟加载和优先级管理
 */

(function() {
  'use strict';

  const ResourceLoader = {
    // 加载状态
    state: {
      loaded: new Map(),
      loading: new Map(),
      failed: new Map()
    },

    // 默认配置
    config: {
      timeout: 10000,
      retryCount: 2,
      retryDelay: 1000
    },

    // ============================================
    // 按需加载模块
    // ============================================
    async loadModule(name, path) {
      // 如果已加载，直接返回
      if (this.state.loaded.has(name)) {
        return this.state.loaded.get(name);
      }

      // 如果正在加载，等待
      if (this.state.loading.has(name)) {
        return this.state.loading.get(name);
      }

      // 开始加载
      const loadPromise = this._importModule(path)
        .then(module => {
          this.state.loaded.set(name, module);
          this.state.loading.delete(name);
          return module;
        })
        .catch(error => {
          this.state.failed.set(name, error);
          this.state.loading.delete(name);
          throw error;
        });

      this.state.loading.set(name, loadPromise);
      return loadPromise;
    },

    // 内部导入方法
    async _importModule(path) {
      return new Promise((resolve, reject) => {
        import(/* webpackChunkName: "[request]" */ path)
          .then(resolve)
          .catch(reject);
      });
    },

    // ============================================
    // 脚本加载
    // ============================================
    loadScript(url, options = {}) {
      const {
        async = false,
        defer = true,
        timeout = this.config.timeout,
        retry = this.config.retryCount
      } = options;

      return new Promise((resolve, reject) => {
        // 检查是否已加载
        if (this.state.loaded.has(`script:${url}`)) {
          resolve(this.state.loaded.get(`script:${url}`));
          return;
        }

        const script = document.createElement('script');
        script.src = url;
        script.async = async;
        script.defer = defer;

        let timeoutId;
        let retries = 0;

        const loadHandler = () => {
          clearTimeout(timeoutId);
          this.state.loaded.set(`script:${url}`, script);
          resolve(script);
          cleanup();
        };

        const errorHandler = (error) => {
          clearTimeout(timeoutId);
          
          if (retries < retry) {
            retries++;
            console.warn(`脚本加载失败，${this.config.retryDelay}ms 后重试 (${retries}/${retry})`);
            setTimeout(() => {
              script.src = `${url}?v=${Date.now()}`;
              script.addEventListener('load', loadHandler, { once: true });
              script.addEventListener('error', errorHandler, { once: true });
            }, this.config.retryDelay);
          } else {
            this.state.failed.set(`script:${url}`, error);
            reject(new Error(`脚本加载失败: ${url}`));
          }
          cleanup();
        };

        const cleanup = () => {
          script.removeEventListener('load', loadHandler);
          script.removeEventListener('error', errorHandler);
        };

        // 设置超时
        timeoutId = setTimeout(() => {
          script.remove();
          this.state.failed.set(`script:${url}`, new Error('加载超时'));
          reject(new Error(`脚本加载超时: ${url}`));
        }, timeout);

        script.addEventListener('load', loadHandler, { once: true });
        script.addEventListener('error', errorHandler, { once: true });
        
        document.head.appendChild(script);
      });
    },

    // ============================================
    // 样式加载
    // ============================================
    loadStyle(url, options = {}) {
      const {
        media = 'all',
        timeout = this.config.timeout
      } = options;

      return new Promise((resolve, reject) => {
        if (this.state.loaded.has(`style:${url}`)) {
          resolve(this.state.loaded.get(`style:${url}`));
          return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.media = media;

        const timeoutId = setTimeout(() => {
          this.state.failed.set(`style:${url}`, new Error('加载超时'));
          reject(new Error(`样式加载超时: ${url}`));
        }, timeout);

        link.addEventListener('load', () => {
          clearTimeout(timeoutId);
          this.state.loaded.set(`style:${url}`, link);
          resolve(link);
        }, { once: true });

        link.addEventListener('error', () => {
          clearTimeout(timeoutId);
          this.state.failed.set(`style:${url}`, new Error('加载失败'));
          reject(new Error(`样式加载失败: ${url}`));
        }, { once: true });

        document.head.appendChild(link);
      });
    },

    // ============================================
    // 图片预加载
    // ============================================
    preloadImage(url, options = {}) {
      const { type = 'image/webp' } = options;

      return new Promise((resolve, reject) => {
        if (this.state.loaded.has(`image:${url}`)) {
          resolve(this.state.loaded.get(`image:${url}`));
          return;
        }

        const img = new Image();
        
        img.onload = () => {
          this.state.loaded.set(`image:${url}`, img);
          resolve(img);
        };

        img.onerror = () => {
          this.state.failed.set(`image:${url}`, new Error('图片加载失败'));
          reject(new Error(`图片加载失败: ${url}`));
        };

        img.src = url;
      });
    },

    // ============================================
    // 批量预加载资源
    // ============================================
    async preloadBatch(resources, options = {}) {
      const { parallel = true, onProgress = null } = options;
      
      const results = [];
      const total = resources.length;
      let completed = 0;

      const updateProgress = () => {
        completed++;
        if (onProgress) {
          onProgress({
            completed,
            total,
            progress: Math.round((completed / total) * 100)
          });
        }
      };

      if (parallel) {
        const promises = resources.map(async (resource) => {
          try {
            const result = await this.loadResource(resource);
            updateProgress();
            return { success: true, resource, result };
          } catch (error) {
            updateProgress();
            return { success: false, resource, error };
          }
        });
        
        return Promise.all(promises);
      } else {
        // 串行加载
        for (const resource of resources) {
          try {
            const result = await this.loadResource(resource);
            results.push({ success: true, resource, result });
          } catch (error) {
            results.push({ success: false, resource, error });
          }
          updateProgress();
        }
        return results;
      }
    },

    // 加载单个资源
    async loadResource(resource) {
      const { type, url, options = {} } = resource;

      switch (type) {
        case 'script':
          return this.loadScript(url, options);
        case 'style':
          return this.loadStyle(url, options);
        case 'image':
          return this.preloadImage(url, options);
        case 'module':
          return this.loadModule(options.name, url);
        default:
          throw new Error(`未知资源类型: ${type}`);
      }
    },

    // ============================================
    // 延迟加载（非关键资源）
    // ============================================
    lazyLoad(element, options = {}) {
      const {
        rootMargin = '100px',
        threshold = 0.1
      } = options;

      return new Promise((resolve) => {
        if (!('IntersectionObserver' in window)) {
          resolve();
          return;
        }

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const target = entry.target;
              const resource = target.dataset.resource;
              
              if (resource) {
                try {
                  const resourceObj = JSON.parse(resource);
                  this.loadResource(resourceObj)
                    .then(resolve)
                    .catch(resolve);
                } catch {
                  resolve();
                }
              } else {
                resolve();
              }

              observer.unobserve(target);
            }
          });
        }, { rootMargin, threshold });

        observer.observe(element);
      });
    },

    // ============================================
    // 空闲时加载
    // ============================================
    idleLoad(resources, options = {}) {
      const { idleTimeout = 2000, priority = 'low' } = options;

      return new Promise((resolve) => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(async () => {
            const results = await this.preloadBatch(resources, { parallel: false });
            resolve(results);
          }, { timeout: idleTimeout });
        } else {
          setTimeout(async () => {
            const results = await this.preloadBatch(resources, { parallel: false });
            resolve(results);
          }, 1);
        }
      });
    },

    // ============================================
    // 优先级管理
    // ============================================
    PriorityManager: {
      // 资源优先级
      PRIORITY: {
        CRITICAL: 'critical',    // 立即加载
        HIGH: 'high',            // 高优先级
        NORMAL: 'normal',        // 普通优先级
        LOW: 'low',              // 低优先级
        IDLE: 'idle'             // 空闲时加载
      },

      // 优先级队列
      queues: {
        critical: [],
        high: [],
        normal: [],
        low: [],
        idle: []
      },

      // 添加到队列
      enqueue(resource, priority = 'normal') {
        this.queues[priority].push(resource);
        this.processQueue(priority);
      },

      // 处理队列
      async processQueue(priority) {
        if (priority === 'idle') {
          ResourceLoader.idleLoad(this.queues.idle.splice(0));
          return;
        }

        const resources = this.queues[priority];
        while (resources.length > 0) {
          const resource = resources.shift();
          try {
            await ResourceLoader.loadResource(resource);
          } catch (error) {
            console.warn(`资源加载失败:`, resource, error);
          }
        }
      },

      // 按优先级预加载
      async preload(resources) {
        // 按优先级分组
        const grouped = {
          critical: [],
          high: [],
          normal: [],
          low: [],
          idle: []
        };

        resources.forEach(r => {
          const p = r.priority || 'normal';
          grouped[p].push(r);
        });

        // 按优先级执行
        if (grouped.critical.length) {
          await ResourceLoader.preloadBatch(grouped.critical, { parallel: true });
        }
        if (grouped.high.length) {
          await ResourceLoader.preloadBatch(grouped.high, { parallel: true });
        }
        if (grouped.normal.length) {
          await ResourceLoader.preloadBatch(grouped.normal, { parallel: true });
        }
        if (grouped.low.length) {
          await ResourceLoader.preloadBatch(grouped.low, { parallel: false });
        }
        if (grouped.idle.length) {
          await ResourceLoader.idleLoad(grouped.idle);
        }
      }
    },

    // ============================================
    // 资源状态查询
    // ============================================
    getStatus(name) {
      if (this.state.loaded.has(name)) {
        return 'loaded';
      }
      if (this.state.loading.has(name)) {
        return 'loading';
      }
      if (this.state.failed.has(name)) {
        return 'failed';
      }
      return 'pending';
    },

    getLoadedCount() {
      return this.state.loaded.size;
    },

    getFailedCount() {
      return this.state.failed.size;
    },

    // ============================================
    // 清理
    // ============================================
    clearCache() {
      this.state.loaded.clear();
      this.state.loading.clear();
      this.state.failed.clear();
    }
  };

  // ============================================
  // 导出
  // ============================================
  window.ResourceLoader = ResourceLoader;

})();
