/**
 * ============================================
 * 访问控制模块 - 游导旅游平台
 * ============================================
 * 登录验证、权限控制、会话管理、防暴力破解
 */

(function() {
  'use strict';

  // ============================================
  // 配置
  // ============================================
  const AccessControlConfig = {
    // 会话配置
    session: {
      storageKey: 'yd_session',
      expiryKey: 'yd_session_expiry',
      refreshThreshold: 5 * 60 * 1000, // 5分钟
      defaultDuration: 2 * 60 * 60 * 1000 // 2小时
    },
    
    // 登录限制
    login: {
      maxAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15分钟
      attemptWindow: 60 * 60 * 1000 // 1小时窗口
    },
    
    // 权限配置
    permissions: {
      admin: ['all'],
      guide: ['view_routes', 'edit_routes', 'view_bookings', 'manage_calendar', 'view_stats'],
      user: ['view_routes', 'book_tours', 'write_reviews', 'view_profile'],
      guest: ['view_routes', 'view_guides']
    },
    
    // 安全检查间隔
    securityCheckInterval: 60 * 1000 // 1分钟
  };

  // ============================================
  // 会话管理
  // ============================================
  
  const SessionManager = {
    _currentUser: null,
    _sessionTimer: null,
    _activityListeners: [],
    
    /**
     * 创建会话
     */
    create(userData, duration = AccessControlConfig.session.defaultDuration) {
      const session = {
        userId: userData.id,
        username: userData.username,
        role: userData.role,
        permissions: AccessControlConfig.permissions[userData.role] || [],
        createdAt: Date.now(),
        expiresAt: Date.now() + duration,
        lastActivity: Date.now(),
        deviceId: this._generateDeviceId()
      };
      
      // 存储会话
      sessionStorage.setItem(AccessControlConfig.session.storageKey, JSON.stringify(session));
      sessionStorage.setItem(AccessControlConfig.session.expiryKey, session.expiresAt.toString());
      
      this._currentUser = session;
      
      // 设置过期检查
      this._startExpiryCheck();
      
      // 记录活动
      this._recordActivity('login', session);
      
      return session;
    },
    
    /**
     * 获取当前会话
     */
    get() {
      if (this._currentUser) return this._currentUser;
      
      const stored = sessionStorage.getItem(AccessControlConfig.session.storageKey);
      if (!stored) return null;
      
      try {
        const session = JSON.parse(stored);
        
        // 检查是否过期
        if (Date.now() > session.expiresAt) {
          this.destroy();
          return null;
        }
        
        this._currentUser = session;
        this._startExpiryCheck();
        return session;
      } catch (e) {
        this.destroy();
        return null;
      }
    },
    
    /**
     * 更新会话活动
     */
    updateActivity() {
      const session = this.get();
      if (session) {
        session.lastActivity = Date.now();
        sessionStorage.setItem(AccessControlConfig.session.storageKey, JSON.stringify(session));
        
        // 触发活动监听器
        this._activityListeners.forEach(listener => listener(session));
      }
    },
    
    /**
     * 刷新会话
     */
    refresh(duration = AccessControlConfig.session.defaultDuration) {
      const session = this.get();
      if (session) {
        session.expiresAt = Date.now() + duration;
        session.lastActivity = Date.now();
        sessionStorage.setItem(AccessControlConfig.session.storageKey, JSON.stringify(session));
        sessionStorage.setItem(AccessControlConfig.session.expiryKey, session.expiresAt.toString());
        
        this._startExpiryCheck();
      }
    },
    
    /**
     * 销毁会话
     */
    destroy() {
      const session = this.get();
      if (session) {
        this._recordActivity('logout', session);
      }
      
      sessionStorage.removeItem(AccessControlConfig.session.storageKey);
      sessionStorage.removeItem(AccessControlConfig.session.expiryKey);
      this._currentUser = null;
      
      if (this._sessionTimer) {
        clearTimeout(this._sessionTimer);
        this._sessionTimer = null;
      }
      
      // 触发活动监听器
      this._activityListeners.forEach(listener => listener(null));
    },
    
    /**
     * 延长会话
     */
    extend(duration) {
      const session = this.get();
      if (session) {
        session.expiresAt += duration;
        sessionStorage.setItem(AccessControlConfig.session.storageKey, JSON.stringify(session));
        sessionStorage.setItem(AccessControlConfig.session.expiryKey, session.expiresAt.toString());
      }
    },
    
    /**
     * 添加活动监听器
     */
    onActivityChange(callback) {
      this._activityListeners.push(callback);
      return () => {
        const index = this._activityListeners.indexOf(callback);
        if (index > -1) this._activityListeners.splice(index, 1);
      };
    },
    
    /**
     * 生成设备ID
     */
    _generateDeviceId() {
      const storageKey = 'yd_device_id';
      let deviceId = localStorage.getItem(storageKey);
      
      if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem(storageKey, deviceId);
      }
      
      return deviceId;
    },
    
    /**
     * 启动过期检查
     */
    _startExpiryCheck() {
      if (this._sessionTimer) {
        clearTimeout(this._sessionTimer);
      }
      
      const session = this.get();
      if (session) {
        const timeUntilExpiry = session.expiresAt - Date.now();
        this._sessionTimer = setTimeout(() => {
          this.destroy();
          // 可以触发会话过期提示
          if (typeof window.showSessionExpired === 'function') {
            window.showSessionExpired();
          }
        }, timeUntilExpiry);
      }
    },
    
    /**
     * 记录活动
     */
    _recordActivity(action, session) {
      const activity = {
        action,
        userId: session?.userId,
        timestamp: Date.now(),
        deviceId: session?.deviceId || this._generateDeviceId(),
        userAgent: navigator.userAgent,
        url: location.href
      };
      
      // 发送到服务器（如果可用）
      this._sendActivityLog(activity);
    },
    
    /**
     * 发送活动日志
     */
    _sendActivityLog(activity) {
      // 可以在此发送到服务器
      console.debug('Session Activity:', activity);
    }
  };

  // ============================================
  // 登录管理（防暴力破解）
  // ============================================
  
  const LoginManager = {
    _attemptStore: 'yd_login_attempts',
    
    /**
     * 获取登录尝试记录
     */
    _getAttempts() {
      const stored = localStorage.getItem(this._attemptStore);
      if (!stored) return { count: 0, timestamps: [], locked: false, lockUntil: 0 };
      
      try {
        const data = JSON.parse(stored);
        
        // 清理过期记录
        const now = Date.now();
        const recentTimestamps = data.timestamps.filter(t => now - t < AccessControlConfig.login.attemptWindow);
        
        return {
          count: recentTimestamps.length,
          timestamps: recentTimestamps,
          locked: data.locked && data.lockUntil > now,
          lockUntil: data.lockUntil
        };
      } catch (e) {
        return { count: 0, timestamps: [], locked: false, lockUntil: 0 };
      }
    },
    
    /**
     * 记录登录尝试
     */
    _recordAttempt(success) {
      const attempts = this._getAttempts();
      
      if (success) {
        // 成功登录，清除记录
        localStorage.removeItem(this._attemptStore);
      } else {
        // 失败，记录尝试
        attempts.count++;
        attempts.timestamps.push(Date.now());
        
        // 检查是否需要锁定
        if (attempts.count >= AccessControlConfig.login.maxAttempts) {
          attempts.locked = true;
          attempts.lockUntil = Date.now() + AccessControlConfig.login.lockoutDuration;
        }
        
        localStorage.setItem(this._attemptStore, JSON.stringify(attempts));
      }
    },
    
    /**
     * 检查是否被锁定
     */
    isLocked() {
      const attempts = this._getAttempts();
      return attempts.locked;
    },
    
    /**
     * 获取剩余锁定时间
     */
    getLockRemaining() {
      const attempts = this._getAttempts();
      if (!attempts.locked) return 0;
      return Math.max(0, attempts.lockUntil - Date.now());
    },
    
    /**
     * 验证登录
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @param {Function} verifyFn - 验证函数（应调用后端API）
     */
    async login(username, password, verifyFn) {
      // 检查是否被锁定
      if (this.isLocked()) {
        const remaining = Math.ceil(this.getLockRemaining() / 1000 / 60);
        throw new Error(`账户已被锁定，请 ${remaining} 分钟后再试`);
      }
      
      // 清理过期尝试
      this._getAttempts();
      
      try {
        // 调用验证函数
        const result = await verifyFn(username, password);
        
        if (result.success) {
          this._recordAttempt(true);
          SessionManager.create(result.user);
          return result;
        } else {
          this._recordAttempt(false);
          const attempts = this._getAttempts();
          const remaining = AccessControlConfig.login.maxAttempts - attempts.count;
          
          if (remaining > 0) {
            throw new Error(`用户名或密码错误，剩余 ${remaining} 次尝试机会`);
          } else {
            throw new Error('账户已被锁定，请稍后再试');
          }
        }
      } catch (e) {
        this._recordAttempt(false);
        throw e;
      }
    },
    
    /**
     * 登出
     */
    logout() {
      SessionManager.destroy();
    },
    
    /**
     * 验证码
     */
    async verifyCode(phone, code, verifyFn) {
      const result = await verifyFn(phone, code);
      if (result.success) {
        SessionManager.create(result.user);
      }
      return result;
    }
  };

  // ============================================
  // 权限控制
  // ============================================
  
  const PermissionManager = {
    /**
     * 检查是否有权限
     */
    has(permission) {
      const session = SessionManager.get();
      if (!session) return false;
      
      // 管理员拥有所有权限
      if (session.permissions.includes('all')) return true;
      
      return session.permissions.includes(permission);
    },
    
    /**
     * 检查是否有多个权限（任一）
     */
    hasAny(permissions) {
      return permissions.some(p => this.has(p));
    },
    
    /**
     * 检查是否有所有权限
     */
    hasAll(permissions) {
      return permissions.every(p => this.has(p));
    },
    
    /**
     * 检查用户角色
     */
    isRole(role) {
      const session = SessionManager.get();
      return session?.role === role;
    },
    
    /**
     * 检查是否已登录
     */
    isAuthenticated() {
      return !!SessionManager.get();
    },
    
    /**
     * 检查是否是管理员
     */
    isAdmin() {
      return this.isRole('admin');
    },
    
    /**
     * 检查是否是导游
     */
    isGuide() {
      return this.isRole('guide');
    }
  };

  // ============================================
  // 路由守卫
  // ============================================
  
  const RouteGuard = {
    /**
     * 路由守卫配置
     */
    guards: {},
    
    /**
     * 添加路由守卫
     */
    add(path, guard) {
      this.guards[path] = guard;
    },
    
    /**
     * 检查路由权限
     */
    check(path) {
      const guard = this.guards[path];
      if (!guard) return { allowed: true };
      
      const { requiresAuth, requiredPermissions, requiredRole, redirectTo, message } = guard;
      
      // 检查登录
      if (requiresAuth && !PermissionManager.isAuthenticated()) {
        return {
          allowed: false,
          redirect: redirectTo || '/login.html',
          message: message || '请先登录'
        };
      }
      
      // 检查角色
      if (requiredRole && !PermissionManager.isRole(requiredRole)) {
        return {
          allowed: false,
          redirect: redirectTo || '/403.html',
          message: '您没有访问此页面的权限'
        };
      }
      
      // 检查权限
      if (requiredPermissions) {
        if (!PermissionManager.hasAll(requiredPermissions)) {
          return {
            allowed: false,
            redirect: redirectTo || '/403.html',
            message: '您没有访问此页面的权限'
          };
        }
      }
      
      return { allowed: true };
    },
    
    /**
     * 初始化路由守卫
     */
    init(guardConfig) {
      if (guardConfig) {
        this.guards = guardConfig;
      }
      
      // 绑定路由检查
      window.checkRoute = (path) => this.check(path);
      
      // 添加自动检查
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._autoCheck());
      } else {
        this._autoCheck();
      }
    },
    
    /**
     * 自动检查当前路由
     */
    _autoCheck() {
      const path = location.pathname;
      const result = this.check(path);
      
      if (!result.allowed) {
        console.warn('Route Guard:', result.message);
        
        if (result.redirect) {
          const redirectUrl = result.redirect + (result.redirect.includes('?') ? '&' : '?') + 
                            'redirect=' + encodeURIComponent(location.href);
          location.href = redirectUrl;
        }
      }
    }
  };

  // ============================================
  // 页面访问控制
  // ============================================
  
  /**
   * 保护页面（需要登录）
   */
  function requireAuth(redirectTo = '/login.html') {
    if (!PermissionManager.isAuthenticated()) {
      location.href = redirectTo + '?redirect=' + encodeURIComponent(location.href);
      return false;
    }
    return true;
  }

  /**
   * 保护页面（需要特定角色）
   */
  function requireRole(role, redirectTo = '/403.html') {
    if (!PermissionManager.isRole(role)) {
      location.href = redirectTo;
      return false;
    }
    return true;
  }

  /**
   * 保护页面（需要特定权限）
   */
  function requirePermission(permission, redirectTo = '/403.html') {
    if (!PermissionManager.has(permission)) {
      location.href = redirectTo;
      return false;
    }
    return true;
  }

  /**
   * 隐藏需要权限的元素
   */
  function initPermissionUI() {
    document.querySelectorAll('[data-permission]').forEach(el => {
      const permission = el.getAttribute('data-permission');
      if (!PermissionManager.has(permission)) {
        el.style.display = 'none';
      }
    });
    
    document.querySelectorAll('[data-role]').forEach(el => {
      const role = el.getAttribute('data-role');
      if (!PermissionManager.isRole(role)) {
        el.style.display = 'none';
      }
    });
    
    document.querySelectorAll('[data-auth]').forEach(el => {
      const requiresAuth = el.getAttribute('data-auth') === 'true';
      if (requiresAuth && !PermissionManager.isAuthenticated()) {
        el.style.display = 'none';
      }
    });
  }

  // ============================================
  // 安全检查
  // ============================================
  
  const SecurityChecker = {
    _checks: [],
    
    /**
     * 添加安全检查
     */
    addCheck(name, checkFn) {
      this._checks.push({ name, checkFn });
    },
    
    /**
     * 运行所有安全检查
     */
    async runAll() {
      const results = [];
      
      for (const { name, checkFn } of this._checks) {
        try {
          const result = await checkFn();
          results.push({ name, passed: result, error: null });
        } catch (e) {
          results.push({ name, passed: false, error: e.message });
        }
      }
      
      return results;
    },
    
    /**
     * 启动定期安全检查
     */
    startPeriodicCheck() {
      // 检查会话状态
      setInterval(() => {
        if (!SessionManager.get()) {
          console.warn('Session expired');
          if (typeof window.handleSessionExpired === 'function') {
            window.handleSessionExpired();
          }
        }
      }, AccessControlConfig.securityCheckInterval);
      
      // 检查活动状态
      let lastActivity = Date.now();
      
      ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
        document.addEventListener(event, () => {
          const now = Date.now();
          if (now - lastActivity > 5 * 60 * 1000) { // 5分钟无活动
            SessionManager.updateActivity();
          }
          lastActivity = now;
        }, { passive: true });
      });
    }
  };

  // ============================================
  // 导出API
  // ============================================
  
  window.AccessControl = {
    // 会话管理
    session: SessionManager,
    
    // 登录管理
    login: LoginManager,
    
    // 权限管理
    permission: PermissionManager,
    
    // 路由守卫
    guard: RouteGuard,
    
    // 页面保护
    requireAuth,
    requireRole,
    requirePermission,
    initPermissionUI,
    
    // 安全检查
    security: SecurityChecker,
    
    // 配置
    config: AccessControlConfig
  };

  // 自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      SecurityChecker.startPeriodicCheck();
      initPermissionUI();
    });
  } else {
    SecurityChecker.startPeriodicCheck();
    initPermissionUI();
  }

})();
