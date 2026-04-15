/**
 * ============================================
 * 安全审计模块 - 游导旅游平台
 * ============================================
 * 操作日志、异常检测、安全告警
 */

(function() {
  'use strict';

  // ============================================
  // 审计配置
  // ============================================
  const AuditConfig = {
    // 日志存储
    storage: {
      maxLogs: 1000,
      retentionDays: 30,
      key: 'yd_audit_logs',
      asyncKey: 'yd_audit_async'
    },
    
    // 审计事件类型
    eventTypes: {
      // 认证事件
      AUTH_LOGIN: 'auth.login',
      AUTH_LOGOUT: 'auth.logout',
      AUTH_LOGIN_FAILED: 'auth.login_failed',
      AUTH_LOCKED: 'auth.locked',
      AUTH_SESSION_EXPIRED: 'auth.session_expired',
      AUTH_PASSWORD_CHANGED: 'auth.password_changed',
      
      // 访问事件
      ACCESS_PAGE: 'access.page',
      ACCESS_API: 'access.api',
      ACCESS_DENIED: 'access.denied',
      
      // 数据操作
      DATA_CREATE: 'data.create',
      DATA_UPDATE: 'data.update',
      DATA_DELETE: 'data.delete',
      DATA_EXPORT: 'data.export',
      DATA_IMPORT: 'data.import',
      
      // 安全事件
      SECURITY_XSS_ATTEMPT: 'security.xss_attempt',
      SECURITY_CSRF_ATTEMPT: 'security.csrf_attempt',
      SECURITY_SUSPICIOUS: 'security.suspicious',
      SECURITY_BOT_DETECTED: 'security.bot_detected',
      
      // 业务事件
      BOOKING_CREATED: 'booking.created',
      BOOKING_CANCELLED: 'booking.cancelled',
      PAYMENT_INITIATED: 'payment.initiated',
      PAYMENT_COMPLETED: 'payment.completed',
      REVIEW_SUBMITTED: 'review.submitted'
    },
    
    // 告警级别
    alertLevels: {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    },
    
    // 异常检测阈值
    thresholds: {
      failedLoginAttempts: 5,
      rapidRequests: 20,
      unusualActivity: 10
    },
    
    // 是否启用实时上报
    realtimeReport: false,
    reportEndpoint: '/api/audit/report'
  };

  // ============================================
  // 日志存储
  // ============================================
  
  const LogStorage = {
    /**
     * 获取所有日志
     */
    getAll() {
      const stored = localStorage.getItem(AuditConfig.storage.key);
      if (!stored) return [];
      
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse audit logs:', e);
        return [];
      }
    },
    
    /**
     * 保存日志
     */
    save(logs) {
      // 限制日志数量
      if (logs.length > AuditConfig.storage.maxLogs) {
        logs = logs.slice(-AuditConfig.storage.maxLogs);
      }
      
      // 清理过期日志
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - AuditConfig.storage.retentionDays);
      logs = logs.filter(log => new Date(log.timestamp) > expiryDate);
      
      localStorage.setItem(AuditConfig.storage.key, JSON.stringify(logs));
    },
    
    /**
     * 添加日志
     */
    add(log) {
      const logs = this.getAll();
      logs.push(log);
      this.save(logs);
    },
    
    /**
     * 清除所有日志
     */
    clear() {
      localStorage.removeItem(AuditConfig.storage.key);
      localStorage.removeItem(AuditConfig.storage.asyncKey);
    },
    
    /**
     * 获取指定条件的日志
     */
    query(filter = {}) {
      let logs = this.getAll();
      
      if (filter.eventType) {
        logs = logs.filter(log => log.eventType === filter.eventType);
      }
      
      if (filter.userId) {
        logs = logs.filter(log => log.userId === filter.userId);
      }
      
      if (filter.level) {
        logs = logs.filter(log => log.level === filter.level);
      }
      
      if (filter.startTime) {
        logs = logs.filter(log => log.timestamp >= filter.startTime);
      }
      
      if (filter.endTime) {
        logs = logs.filter(log => log.timestamp <= filter.endTime);
      }
      
      return logs;
    }
  };

  // ============================================
  // 操作日志
  // ============================================
  
  const OperationLogger = {
    /**
     * 记录操作日志
     */
    log(eventType, data = {}, options = {}) {
      const logEntry = {
        id: this._generateId(),
        timestamp: Date.now(),
        eventType,
        userId: this._getCurrentUserId(),
        sessionId: this._getSessionId(),
        ip: options.ip || 'client',
        userAgent: navigator.userAgent,
        level: options.level || 'info',
        data,
        metadata: {
          page: location.href,
          referrer: document.referrer
        }
      };
      
      // 存储日志
      LogStorage.add(logEntry);
      
      // 检查是否需要告警
      SecurityAuditor.checkAlert(logEntry);
      
      // 异步上报（如果启用）
      if (AuditConfig.realtimeReport) {
        this._asyncReport(logEntry);
      }
      
      return logEntry;
    },
    
    /**
     * 生成唯一ID
     */
    _generateId() {
      return 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
    },
    
    /**
     * 获取当前用户ID
     */
    _getCurrentUserId() {
      const session = window.AccessControl?.session.get();
      return session?.userId || 'anonymous';
    },
    
    /**
     * 获取会话ID
     */
    _getSessionId() {
      return sessionStorage.getItem('yd_session_id') || 'no_session';
    },
    
    /**
     * 异步上报
     */
    _asyncReport(logEntry) {
      // 存储到待上报队列
      const queue = JSON.parse(localStorage.getItem(AuditConfig.storage.asyncKey) || '[]');
      queue.push(logEntry);
      localStorage.setItem(AuditConfig.storage.asyncKey, JSON.stringify(queue));
      
      // 尝试发送
      this._flushAsyncQueue();
    },
    
    /**
     * 刷新异步队列
     */
    async _flushAsyncQueue() {
      const queue = JSON.parse(localStorage.getItem(AuditConfig.storage.asyncKey) || '[]');
      if (queue.length === 0) return;
      
      try {
        // 在实际环境中，这里会发送到服务器
        // await fetch(AuditConfig.reportEndpoint, {
        //   method: 'POST',
        //   body: JSON.stringify(queue)
        // });
        
        // 清空队列
        localStorage.removeItem(AuditConfig.storage.asyncKey);
      } catch (e) {
        console.error('Failed to report audit logs:', e);
      }
    },
    
    /**
     * 记录认证事件
     */
    logAuth(eventType, username, success, details = {}) {
      return this.log(eventType, {
        username,
        success,
        ...details
      }, {
        level: success ? 'info' : 'warning'
      });
    },
    
    /**
     * 记录页面访问
     */
    logPageAccess(page, duration = 0) {
      return this.log(AuditConfig.eventTypes.ACCESS_PAGE, {
        page,
        duration
      });
    },
    
    /**
     * 记录数据操作
     */
    logDataOperation(operation, entity, entityId, before, after) {
      return this.log(operation, {
        entity,
        entityId,
        before,
        after
      }, {
        level: operation === AuditConfig.eventTypes.DATA_DELETE ? 'warning' : 'info'
      });
    },
    
    /**
     * 记录安全事件
     */
    logSecurity(eventType, details = {}) {
      const level = eventType.includes('critical') ? 'critical' : 
                   eventType.includes('high') ? 'high' : 'warning';
      
      return this.log(eventType, details, { level });
    }
  };

  // ============================================
  // 异常检测
  // ============================================
  
  const AnomalyDetector = {
    // 活动窗口
    _activityWindow: {
      requests: [],
      logins: []
    },
    
    /**
     * 检测异常登录
     */
    detectLoginAnomaly(username) {
      const now = Date.now();
      const windowStart = now - 60 * 60 * 1000; // 1小时窗口
      
      // 获取失败登录尝试
      const logs = LogStorage.query({
        eventType: AuditConfig.eventTypes.AUTH_LOGIN_FAILED,
        startTime: windowStart
      }).filter(log => log.data.username === username);
      
      if (logs.length >= AuditConfig.thresholds.failedLoginAttempts) {
        return {
          detected: true,
          type: 'brute_force',
          severity: 'high',
          details: {
            username,
            attempts: logs.length,
            window: '1小时'
          }
        };
      }
      
      return { detected: false };
    },
    
    /**
     * 检测快速请求
     */
    detectRapidRequests() {
      const now = Date.now();
      const windowStart = now - 60 * 1000; // 1分钟窗口
      
      // 清理旧记录
      this._activityWindow.requests = this._activityWindow.requests.filter(t => t > windowStart);
      
      // 添加当前请求
      this._activityWindow.requests.push(now);
      
      if (this._activityWindow.requests.length >= AuditConfig.thresholds.rapidRequests) {
        return {
          detected: true,
          type: 'rapid_requests',
          severity: 'medium',
          details: {
            count: this._activityWindow.requests.length,
            window: '1分钟'
          }
        };
      }
      
      return { detected: false };
    },
    
    /**
     * 检测异常时间活动
     */
    detectUnusualTimeActivity() {
      const hour = new Date().getHours();
      
      // 定义正常活动时间（假设为6:00-23:00）
      if (hour < 6 || hour > 23) {
        return {
          detected: true,
          type: 'unusual_time',
          severity: 'low',
          details: {
            hour,
            message: '在非正常时间访问'
          }
        };
      }
      
      return { detected: false };
    },
    
    /**
     * 检测可疑模式
     */
    detectSuspiciousPattern(data) {
      const suspiciousPatterns = [
        { pattern: /<script/i, name: 'script_tag' },
        { pattern: /javascript:/i, name: 'javascript_protocol' },
        { pattern: /on\w+\s*=/i, name: 'event_handler' },
        { pattern: /union\s+select/i, name: 'sql_injection' },
        { pattern: /\.\.\//g, name: 'path_traversal' }
      ];
      
      for (const { pattern, name } of suspiciousPatterns) {
        if (typeof data === 'string' && pattern.test(data)) {
          return {
            detected: true,
            type: name,
            severity: 'high',
            details: { pattern: name, data }
          };
        }
      }
      
      return { detected: false };
    },
    
    /**
     * 检测Bot行为
     */
    detectBot() {
      // 简单的Bot检测
      const indicators = [];
      
      // 检测自动化工具
      if (navigator.webdriver) {
        indicators.push('webdriver_detected');
      }
      
      // 检测无头浏览器特征
      if (navigator.userAgent.includes('HeadlessChrome')) {
        indicators.push('headless_browser');
      }
      
      // 检测异常导航模式
      if (document.referrer === '' && sessionStorage.getItem('yd_first_visit') !== 'true') {
        indicators.push('direct_navigation_no_history');
      }
      
      if (indicators.length > 0) {
        return {
          detected: true,
          type: 'bot_suspected',
          severity: 'medium',
          details: { indicators }
        };
      }
      
      return { detected: false };
    }
  };

  // ============================================
  // 安全告警
  // ============================================
  
  const SecurityAlerter = {
    // 告警处理器
    _handlers: [],
    
    /**
     * 添加告警处理器
     */
    addHandler(handler) {
      this._handlers.push(handler);
    },
    
    /**
     * 触发告警
     */
    alert(level, title, message, details = {}) {
      const alert = {
        id: this._generateId(),
        timestamp: Date.now(),
        level,
        title,
        message,
        details,
        acknowledged: false
      };
      
      // 存储告警
      this._storeAlert(alert);
      
      // 调用所有处理器
      this._handlers.forEach(handler => {
        try {
          handler(alert);
        } catch (e) {
          console.error('Alert handler error:', e);
        }
      });
      
      // 浏览器通知
      if (level === AuditConfig.alertLevels.CRITICAL && 'Notification' in window) {
        this._sendBrowserNotification(alert);
      }
      
      return alert;
    },
    
    /**
     * 生成告警ID
     */
    _generateId() {
      return 'alert_' + Date.now().toString(36);
    },
    
    /**
     * 存储告警
     */
    _storeAlert(alert) {
      const alerts = JSON.parse(localStorage.getItem('yd_security_alerts') || '[]');
      alerts.push(alert);
      
      // 只保留最近100条告警
      if (alerts.length > 100) {
        alerts.shift();
      }
      
      localStorage.setItem('yd_security_alerts', JSON.stringify(alerts));
    },
    
    /**
     * 获取未确认的告警
     */
    getUnacknowledged() {
      const alerts = JSON.parse(localStorage.getItem('yd_security_alerts') || '[]');
      return alerts.filter(a => !a.acknowledged);
    },
    
    /**
     * 确认告警
     */
    acknowledge(alertId) {
      const alerts = JSON.parse(localStorage.getItem('yd_security_alerts') || '[]');
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        localStorage.setItem('yd_security_alerts', JSON.stringify(alerts));
      }
    },
    
    /**
     * 发送浏览器通知
     */
    _sendBrowserNotification(alert) {
      if (Notification.permission === 'granted') {
        new Notification('安全告警 - 游导旅游', {
          body: `${alert.title}: ${alert.message}`,
          icon: '/images/security-icon.png',
          tag: alert.id
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            this._sendBrowserNotification(alert);
          }
        });
      }
    },
    
    /**
     * 快捷告警方法
     */
    critical(title, message, details) {
      return this.alert(AuditConfig.alertLevels.CRITICAL, title, message, details);
    },
    
    high(title, message, details) {
      return this.alert(AuditConfig.alertLevels.HIGH, title, message, details);
    },
    
    medium(title, message, details) {
      return this.alert(AuditConfig.alertLevels.MEDIUM, title, message, details);
    },
    
    low(title, message, details) {
      return this.alert(AuditConfig.alertLevels.LOW, title, message, details);
    }
  };

  // ============================================
  // 安全审计主控制器
  // ============================================
  
  const SecurityAuditor = {
    /**
     * 初始化审计系统
     */
    init(config = {}) {
      // 合并配置
      Object.assign(AuditConfig, config);
      
      // 标记首次访问
      if (!sessionStorage.getItem('yd_first_visit')) {
        sessionStorage.setItem('yd_first_visit', 'true');
      }
      
      // 添加默认告警处理器
      SecurityAlerter.addHandler(this._defaultAlertHandler.bind(this));
      
      // 启动自动检测
      this._startAutoDetection();
      
      // 记录初始化
      OperationLogger.log('system.initialized', {
        version: '1.0.0',
        userAgent: navigator.userAgent
      });
      
      console.info('Security Audit System initialized');
    },
    
    /**
     * 检查是否需要告警
     */
    checkAlert(logEntry) {
      // 检查登录失败
      if (logEntry.eventType === AuditConfig.eventTypes.AUTH_LOGIN_FAILED) {
        const anomaly = AnomalyDetector.detectLoginAnomaly(logEntry.data.username);
        if (anomaly.detected) {
          SecurityAlerter.critical(
            '暴力破解检测',
            `检测到对账户 ${logEntry.data.username} 的暴力破解尝试`,
            anomaly.details
          );
        }
      }
      
      // 检查可疑模式
      const suspicious = AnomalyDetector.detectSuspiciousPattern(logEntry.data);
      if (suspicious.detected) {
        SecurityAlerter.high(
          '可疑输入检测',
          `检测到可疑输入模式: ${suspicious.type}`,
          suspicious.details
        );
      }
      
      // 检查Bot
      if (logEntry.eventType === AuditConfig.eventTypes.ACCESS_PAGE) {
        const bot = AnomalyDetector.detectBot();
        if (bot.detected) {
          SecurityAlerter.medium(
            'Bot检测',
            '检测到可能的自动化工具',
            bot.details
          );
        }
      }
    },
    
    /**
     * 启动自动检测
     */
    _startAutoDetection() {
      // 每分钟检测快速请求
      setInterval(() => {
        const anomaly = AnomalyDetector.detectRapidRequests();
        if (anomaly.detected) {
          SecurityAlerter.medium(
            '请求频率异常',
            `检测到异常快速的请求: ${anomaly.details.count}次/分钟`,
            anomaly.details
          );
        }
      }, 60 * 1000);
      
      // 每小时检测异常时间
      setInterval(() => {
        const anomaly = AnomalyDetector.detectUnusualTimeActivity();
        if (anomaly.detected) {
          SecurityAlerter.low(
            '非正常时间活动',
            anomaly.details.message,
            anomaly.details
          );
        }
      }, 60 * 60 * 1000);
    },
    
    /**
     * 默认告警处理器
     */
    _defaultAlertHandler(alert) {
      // 控制台输出
      const logFn = alert.level === 'critical' ? console.error :
                    alert.level === 'high' ? console.error :
                    alert.level === 'medium' ? console.warn : console.info;
      
      logFn(`[Security Alert - ${alert.level.toUpperCase()}] ${alert.title}: ${alert.message}`, alert.details);
      
      // 可以在这里添加更多处理，如发送到服务器
    },
    
    /**
     * 获取审计报告
     */
    getReport(timeRange = {}) {
      const logs = LogStorage.query({
        startTime: timeRange.start,
        endTime: timeRange.end
      });
      
      // 统计信息
      const stats = {
        total: logs.length,
        byType: {},
        byLevel: {},
        byUser: {},
        securityEvents: [],
        anomalies: []
      };
      
      logs.forEach(log => {
        // 按类型统计
        stats.byType[log.eventType] = (stats.byType[log.eventType] || 0) + 1;
        
        // 按级别统计
        stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
        
        // 按用户统计
        stats.byUser[log.userId] = (stats.byUser[log.userId] || 0) + 1;
        
        // 收集安全事件
        if (log.eventType.startsWith('security.')) {
          stats.securityEvents.push(log);
        }
      });
      
      return stats;
    },
    
    /**
     * 导出日志
     */
    exportLogs(format = 'json', timeRange = {}) {
      const logs = LogStorage.query(timeRange);
      
      if (format === 'json') {
        return JSON.stringify(logs, null, 2);
      }
      
      if (format === 'csv') {
        if (logs.length === 0) return '';
        
        const headers = ['ID', 'Timestamp', 'Event Type', 'User ID', 'Level', 'Data'];
        const rows = logs.map(log => [
          log.id,
          new Date(log.timestamp).toISOString(),
          log.eventType,
          log.userId,
          log.level,
          JSON.stringify(log.data)
        ]);
        
        return [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
      }
      
      return '';
    }
  };

  // ============================================
  // 导出API
  // ============================================
  
  window.SecurityAudit = {
    // 配置
    config: AuditConfig,
    
    // 日志
    logger: OperationLogger,
    
    // 检测
    detector: AnomalyDetector,
    
    // 告警
    alerter: SecurityAlerter,
    
    // 存储
    storage: LogStorage,
    
    // 主控制器
    auditor: SecurityAuditor,
    
    // 事件类型
    events: AuditConfig.eventTypes,
    
    // 告警级别
    levels: AuditConfig.alertLevels
  };

})();
