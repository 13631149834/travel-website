/**
 * ============================================
 * 安全模块主入口 - 游导旅游平台
 * ============================================
 * 统一加载和管理所有安全模块
 */

(function() {
  'use strict';

  // ============================================
  // 安全模块加载器
  // ============================================
  
  const SecurityLoader = {
    _loaded: false,
    _modules: {},
    
    /**
     * 初始化所有安全模块
     */
    async init(options = {}) {
      if (this._loaded) {
        console.warn('Security modules already initialized');
        return;
      }
      
      console.info('Initializing security modules...');
      
      const {
        enableXSS = true,
        enableCSRF = true,
        enableEncryption = true,
        enableAccessControl = true,
        enableAudit = true,
        enableCSP = false,
        config = {}
      } = options;
      
      try {
        // 加载XSS防护
        if (enableXSS && window.XSSFilter) {
          this._modules.xss = window.XSSFilter;
          console.debug('XSS protection loaded');
        }
        
        // 加载CSRF防护
        if (enableCSRF && window.CSRFProtection) {
          window.CSRFProtection.init(config.csrf);
          this._modules.csrf = window.CSRFProtection;
          console.debug('CSRF protection loaded');
        }
        
        // 加载加密模块
        if (enableEncryption && window.SecurityCrypto) {
          this._modules.crypto = window.SecurityCrypto;
          console.debug('Encryption module loaded');
        }
        
        // 加载访问控制
        if (enableAccessControl && window.AccessControl) {
          if (config.accessControl) {
            window.AccessControl.guard.init(config.accessControl.guards);
          }
          this._modules.access = window.AccessControl;
          console.debug('Access control loaded');
        }
        
        // 加载安全审计
        if (enableAudit && window.SecurityAudit) {
          window.SecurityAudit.auditor.init(config.audit);
          this._modules.audit = window.SecurityAudit;
          console.debug('Security audit loaded');
        }
        
        // 应用CSP
        if (enableCSP && window.XSSFilter?.CSP) {
          window.XSSFilter.CSP.applyMetaTag();
          console.debug('CSP applied');
        }
        
        // 设置全局错误处理
        this._setupGlobalErrorHandling();
        
        // 设置请求拦截
        this._setupRequestInterceptors();
        
        this._loaded = true;
        console.info('All security modules initialized successfully');
        
        // 记录初始化事件
        if (this._modules.audit) {
          this._modules.audit.logger.log('security.initialized', {
            modules: Object.keys(this._modules),
            options
          });
        }
        
      } catch (error) {
        console.error('Failed to initialize security modules:', error);
        throw error;
      }
    },
    
    /**
     * 获取已加载的模块
     */
    getModule(name) {
      return this._modules[name];
    },
    
    /**
     * 检查模块是否已加载
     */
    isLoaded(name) {
      return !!this._modules[name];
    },
    
    /**
     * 设置全局错误处理
     */
    _setupGlobalErrorHandling() {
      // JavaScript错误处理
      window.addEventListener('error', (event) => {
        if (this._modules.audit) {
          this._modules.audit.logger.logSecurity(
            'system.javascript_error',
            {
              message: event.message,
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno
            }
          );
        }
      });
      
      // 未捕获的Promise错误
      window.addEventListener('unhandledrejection', (event) => {
        if (this._modules.audit) {
          this._modules.audit.logger.logSecurity(
            'system.unhandled_rejection',
            {
              reason: event.reason?.message || String(event.reason)
            }
          );
        }
      });
    },
    
    /**
     * 设置请求拦截
     */
    _setupRequestInterceptors() {
      // 拦截fetch请求
      const originalFetch = window.fetch;
      
      window.fetch = async (input, init = {}) => {
        const startTime = Date.now();
        
        try {
          // 添加CSRF Token
          if (this._modules.csrf && init.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(init.method)) {
            init.headers = {
              ...init.headers,
              'X-CSRF-Token': this._modules.csrf.getToken()
            };
          }
          
          const response = await originalFetch(input, init);
          
          // 记录API访问
          if (this._modules.audit) {
            const duration = Date.now() - startTime;
            const url = typeof input === 'string' ? input : input.url;
            
            this._modules.audit.logger.log(
              'access.api',
              {
                url,
                method: init.method || 'GET',
                status: response.status,
                duration
              }
            );
          }
          
          return response;
        } catch (error) {
          if (this._modules.audit) {
            const url = typeof input === 'string' ? input : input.url;
            this._modules.audit.logger.logSecurity(
              'network.request_failed',
              { url, error: error.message }
            );
          }
          throw error;
        }
      };
    }
  };

  // ============================================
  // 安全检查工具
  // ============================================
  
  const SecurityUtils = {
    /**
     * 执行安全检查
     */
    async check() {
      const results = {
        timestamp: Date.now(),
        checks: []
      };
      
      // 检查HTTPS
      results.checks.push({
        name: 'HTTPS',
        passed: location.protocol === 'https:',
        message: location.protocol === 'https:' ? '使用HTTPS' : '未使用HTTPS'
      });
      
      // 检查CSP
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      results.checks.push({
        name: 'CSP',
        passed: !!cspMeta,
        message: cspMeta ? 'CSP已配置' : 'CSP未配置'
      });
      
      // 检查XSS防护
      results.checks.push({
        name: 'XSS Protection',
        passed: !!window.XSSFilter,
        message: window.XSSFilter ? 'XSS防护已启用' : 'XSS防护未启用'
      });
      
      // 检查会话
      const session = window.AccessControl?.session.get();
      results.checks.push({
        name: 'Session',
        passed: !!session,
        message: session ? `会话有效 (${session.role})` : '无活动会话'
      });
      
      // 检查未确认的告警
      const alerts = window.SecurityAudit?.alerter.getUnacknowledged() || [];
      results.checks.push({
        name: 'Security Alerts',
        passed: alerts.length === 0,
        message: alerts.length === 0 ? '无未处理告警' : `有 ${alerts.length} 条未处理告警`,
        alertCount: alerts.length
      });
      
      results.allPassed = results.checks.every(c => c.passed);
      
      return results;
    },
    
    /**
     * 获取安全状态摘要
     */
    getSummary() {
      const session = window.AccessControl?.session.get();
      const alerts = window.SecurityAudit?.alerter.getUnacknowledged() || [];
      const logs = window.SecurityAudit?.storage.getAll() || [];
      
      return {
        authenticated: !!session,
        userId: session?.userId,
        role: session?.role,
        alertCount: alerts.length,
        criticalAlerts: alerts.filter(a => a.level === 'critical' || a.level === 'high').length,
        recentLogs: logs.slice(-10),
        sessionExpiry: session?.expiresAt
      };
    },
    
    /**
     * 清除所有安全数据
     */
    clearAll() {
      // 清除会话
      window.AccessControl?.session.destroy();
      
      // 清除审计日志
      window.SecurityAudit?.storage.clear();
      
      // 清除加密存储
      window.SecurityCrypto?.storage.clear();
      
      // 清除告警
      localStorage.removeItem('yd_security_alerts');
      
      console.info('All security data cleared');
    }
  };

  // ============================================
  // 导出API
  // ============================================
  
  window.Security = {
    // 加载器
    loader: SecurityLoader,
    
    // 工具
    utils: SecurityUtils,
    
    // XSS防护
    xss: () => window.XSSFilter,
    
    // CSRF防护
    csrf: () => window.CSRFProtection,
    
    // 加密
    crypto: () => window.SecurityCrypto,
    
    // 访问控制
    access: () => window.AccessControl,
    
    // 审计
    audit: () => window.SecurityAudit,
    
    // 快速初始化
    async init(options) {
      return await SecurityLoader.init(options);
    },
    
    // 检查状态
    async check() {
      return await SecurityUtils.check();
    },
    
    // 获取摘要
    summary() {
      return SecurityUtils.getSummary();
    },
    
    // 版本信息
    version: '1.0.0'
  };

  // 自动初始化（可选）
  // 如果页面需要自动启用安全模块，可以在HTML中添加:
  // <script>Security.init({ enableAudit: true });</script>
  
})();
