/**
 * ============================================
 * CSRF 防护模块 - 游导旅游平台
 * ============================================
 * 提供CSRF攻击防护功能
 * 
 * 功能特性:
 * - Token生成与存储
 * - Token验证机制
 * - 表单Token自动注入
 * - AJAX请求Token自动添加
 */

(function(global) {
  'use strict';

  // ============================================
  // 配置
  // ============================================
  
  const CSRF_CONFIG = {
    tokenName: '_csrf_token',
    headerName: 'X-CSRF-Token',
    tokenLength: 32,
    storageKey: 'csrf_token_storage',
    tokenRefreshInterval: 3600000, // 1小时
    excludedDomains: []
  };

  // ============================================
  // Token 生成与存储
  // ============================================
  
  /**
   * 生成随机Token
   * @param {number} length - Token长度
   * @returns {string} 生成的Token
   */
  function generateToken(length = CSRF_CONFIG.tokenLength) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    // 使用更安全的随机数生成
    const array = new Uint8Array(length);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      // 降级方案
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    
    for (let i = 0; i < length; i++) {
      token += chars[array[i] % chars.length];
    }
    
    return token;
  }

  /**
   * 生成带时间戳的Token（更安全）
   * @returns {Object} 包含token和时间戳的对象
   */
  function generateSecureToken() {
    const token = generateToken();
    const timestamp = Date.now();
    const combined = `${token}.${timestamp}`;
    
    return {
      token: combined,
      timestamp: timestamp
    };
  }

  /**
   * 存储Token到本地
   * @param {string} token - Token值
   * @param {number} expiresIn - 过期时间（毫秒）
   */
  function storeToken(token, expiresIn = 3600000) {
    const tokenData = {
      value: token,
      expires: Date.now() + expiresIn
    };
    
    try {
      sessionStorage.setItem(CSRF_CONFIG.storageKey, JSON.stringify(tokenData));
    } catch (e) {
      // 如果sessionStorage不可用，使用内存存储
      console.warn('[CSRF Protection] sessionStorage unavailable, using memory storage');
      CSRF_CONFIG.memoryToken = tokenData;
    }
  }

  /**
   * 获取存储的Token
   * @returns {string|null} Token值或null
   */
  function getStoredToken() {
    try {
      const stored = sessionStorage.getItem(CSRF_CONFIG.storageKey);
      if (!stored) return null;
      
      const tokenData = JSON.parse(stored);
      
      // 检查是否过期
      if (tokenData.expires < Date.now()) {
        sessionStorage.removeItem(CSRF_CONFIG.storageKey);
        return null;
      }
      
      return tokenData.value;
    } catch (e) {
      return CSRF_CONFIG.memoryToken?.value || null;
    }
  }

  /**
   * 清除存储的Token
   */
  function clearToken() {
    try {
      sessionStorage.removeItem(CSRF_CONFIG.storageKey);
    } catch (e) {
      CSRF_CONFIG.memoryToken = null;
    }
  }

  // ============================================
  // Token 管理
  // ============================================
  
  /**
   * 获取当前Token（不存在则生成）
   * @returns {string} 当前Token
   */
  function getToken() {
    let token = getStoredToken();
    
    if (!token) {
      const secureToken = generateSecureToken();
      token = secureToken.token;
      storeToken(token, CSRF_CONFIG.tokenRefreshInterval);
    }
    
    return token;
  }

  /**
   * 刷新Token
   * @returns {string} 新的Token
   */
  function refreshToken() {
    clearToken();
    return getToken();
  }

  // ============================================
  // Token 验证
  // ============================================
  
  /**
   * 验证Token格式
   * @param {string} token - 待验证Token
   * @returns {boolean} 是否有效
   */
  function validateTokenFormat(token) {
    if (!token || typeof token !== 'string') return false;
    
    // 检查基本格式
    const parts = token.split('.');
    if (parts.length < 1 || parts.length > 2) return false;
    
    // Token主体应该是32-64字符
    const mainToken = parts[0];
    if (mainToken.length < 16 || mainToken.length > 128) return false;
    
    // Token应该只包含字母数字
    if (!/^[A-Za-z0-9]+$/.test(mainToken)) return false;
    
    // 如果有时间戳，检查是否过期
    if (parts.length === 2) {
      const timestamp = parseInt(parts[1], 10);
      if (isNaN(timestamp)) return false;
      if (timestamp < Date.now() - CSRF_CONFIG.tokenRefreshInterval) return false;
    }
    
    return true;
  }

  /**
   * 验证请求Token（用于服务端验证）
   * @param {string} requestToken - 请求中的Token
   * @param {string} sessionToken - Session中的Token
   * @returns {boolean} 是否匹配
   */
  function verifyToken(requestToken, sessionToken) {
    if (!requestToken || !sessionToken) return false;
    
    // 时序攻击安全比较
    if (requestToken.length !== sessionToken.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < requestToken.length; i++) {
      result |= requestToken.charCodeAt(i) ^ sessionToken.charCodeAt(i);
    }
    
    return result === 0;
  }

  // ============================================
  // 表单自动注入
  // ============================================
  
  /**
   * 为表单注入CSRF Token
   * @param {HTMLFormElement} form - 表单元素
   */
  function injectTokenToForm(form) {
    if (!form) return;
    
    // 检查是否已有Token字段
    const existingToken = form.querySelector(`[name="${CSRF_CONFIG.tokenName}"]`);
    if (existingToken) {
      existingToken.value = getToken();
      return;
    }
    
    // 创建隐藏的Token字段
    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = CSRF_CONFIG.tokenName;
    tokenInput.value = getToken();
    
    // 添加到表单
    form.appendChild(tokenInput);
  }

  /**
   * 自动为所有POST/PUT/DELETE表单注入Token
   */
  function autoInjectForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const method = form.method?.toLowerCase() || 'get';
      
      // 只为非GET请求注入Token
      if (['post', 'put', 'delete', 'patch'].includes(method)) {
        injectTokenToForm(form);
      }
    });
  }

  // ============================================
  // AJAX 请求拦截
  // ============================================
  
  /**
   * 获取XMLHttpRequest的原型
   */
  let originalXHROpen;
  let originalXHRSend;

  /**
   * 初始化AJAX拦截
   */
  function initAjaxInterception() {
    if (typeof XMLHttpRequest === 'undefined') return;
    
    originalXHROpen = XMLHttpRequest.prototype.open;
    originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      this._method = method.toUpperCase();
      this._url = url;
      return originalXHROpen.apply(this, [method, url, ...rest]);
    };
    
    XMLHttpRequest.prototype.send = function(data, ...rest) {
      // 为非GET请求添加Token
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(this._method)) {
        this.setRequestHeader(CSRF_CONFIG.headerName, getToken());
      }
      
      return originalXHRSend.apply(this, [data, ...rest]);
    };
  }

  /**
   * Fetch请求拦截
   */
  const originalFetch = window.fetch;

  window.fetch = async function(input, init = {}) {
    const url = typeof input === 'string' ? input : input.url;
    const method = (init.method || 'GET').toUpperCase();
    
    // 准备headers
    init.headers = init.headers || {};
    
    // 为非GET请求添加Token
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      // 如果headers是Headers对象
      if (init.headers instanceof Headers) {
        if (!init.headers.has(CSRF_CONFIG.headerName)) {
          const newHeaders = new Headers(init.headers);
          newHeaders.set(CSRF_CONFIG.headerName, getToken());
          init.headers = newHeaders;
        }
      } else if (Array.isArray(init.headers)) {
        // 如果是数组格式
        const hasToken = init.headers.some(([k]) => k === CSRF_CONFIG.headerName);
        if (!hasToken) {
          init.headers.push([CSRF_CONFIG.headerName, getToken()]);
        }
      } else if (typeof init.headers === 'object') {
        // 如果是普通对象
        if (!init.headers[CSRF_CONFIG.headerName]) {
          init.headers[CSRF_CONFIG.headerName] = getToken();
        }
      } else {
        // 没有headers
        init.headers = {
          [CSRF_CONFIG.headerName]: getToken()
        };
      }
    }
    
    return originalFetch.apply(this, [input, init]);
  };

  // ============================================
  // Referer 验证
  // ============================================
  
  /**
   * 验证请求来源
   * @param {string} requestUrl - 请求URL
   * @returns {boolean} 是否允许
   */
  function validateReferer(requestUrl) {
    // 排除的域名
    const currentHost = window.location.hostname;
    const excludedDomains = CSRF_CONFIG.excludedDomains;
    
    try {
      const url = new URL(requestUrl);
      
      // 同源请求总是允许
      if (url.hostname === currentHost) return true;
      
      // 检查排除列表
      for (const domain of excludedDomains) {
        if (url.hostname === domain || url.hostname.endsWith('.' + domain)) {
          return true;
        }
      }
      
      // 检查Referer头
      const referer = document.referrer;
      if (referer) {
        const refererUrl = new URL(referer);
        if (refererUrl.hostname === currentHost) return true;
      }
      
      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * 检查当前页面是否安全（通过meta标签）
   */
  function isPageSecure() {
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const metaXFrame = document.querySelector('meta[http-equiv="X-Frame-Options"]');
    
    // 如果有安全头，认为是安全的
    return !!(metaCSP || metaXFrame);
  }

  // ============================================
  // 初始化
  // ============================================
  
  /**
   * 初始化CSRF防护
   * @param {Object} options - 配置选项
   */
  function init(options = {}) {
    // 合并配置
    Object.assign(CSRF_CONFIG, options);
    
    // 生成初始Token
    getToken();
    
    // 为现有表单注入Token
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoInjectForms);
    } else {
      autoInjectForms();
    }
    
    // 初始化AJAX拦截
    initAjaxInterception();
    
    // 设置Token刷新定时器
    if (CSRF_CONFIG.tokenRefreshInterval) {
      setInterval(refreshToken, CSRF_CONFIG.tokenRefreshInterval);
    }
    
    console.log('[CSRF Protection] Initialized');
  }

  // ============================================
  // 导出API
  // ============================================
  
  const CSRFProtection = {
    // 配置
    config: CSRF_CONFIG,
    
    // Token管理
    generateToken,
    generateSecureToken,
    getToken,
    refreshToken,
    clearToken,
    
    // 验证
    validateTokenFormat,
    verifyToken,
    validateReferer,
    isPageSecure,
    
    // 表单
    injectTokenToForm,
    autoInjectForms,
    
    // 初始化
    init
  };

  // 挂载到全局
  global.CSRFProtection = CSRFProtection;

  // AMD/CommonJS兼容
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSRFProtection;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return CSRFProtection; });
  }

})(typeof window !== 'undefined' ? window : this);
