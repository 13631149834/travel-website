/**
 * ============================================
 * XSS 防护增强模块 - 游导旅游平台
 * ============================================
 * 提供全面的XSS攻击防护功能
 * 
 * 功能特性:
 * - HTML实体编码/解码
 * - URL参数过滤与净化
 * - 输入内容深度净化
 * - DOM textContent安全输出
 */

(function(global) {
  'use strict';

  // ============================================
  // HTML 实体编码
  // ============================================
  
  /**
   * HTML实体编码 - 将危险字符转换为安全实体
   * @param {string} str - 待编码字符串
   * @returns {string} 编码后的安全字符串
   */
  function encodeHTML(str) {
    if (str === null || str === undefined) return '';
    
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;',
      '{': '&#x123;',
      '}': '&#x125;'
    };
    
    return String(str).replace(/[&<>"'`=/{}]/g, function(match) {
      return entityMap[match];
    });
  }

  /**
   * HTML实体解码 - 将实体还原为字符
   * @param {string} str - 待解码字符串
   * @returns {string} 解码后的字符串
   */
  function decodeHTML(str) {
    if (!str) return '';
    
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  }

  /**
   * 属性值编码 - 专为属性值设计的高强度编码
   * @param {string} str - 待编码字符串
   * @returns {string} 编码后的安全字符串
   */
  function encodeAttrValue(str) {
    if (str === null || str === undefined) return '';
    
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/ /g, '&#x20;')
      .replace(/\t/g, '&#x9;')
      .replace(/\n/g, '&#xA;')
      .replace(/\r/g, '&#xD;');
  }

  // ============================================
  // URL 参数过滤
  // ============================================
  
  /**
   * URL参数XSS过滤
   * @param {string} url - 待过滤URL
   * @returns {string} 过滤后的安全URL
   */
  function sanitizeURL(url) {
    if (!url) return '';
    
    // 移除危险协议
    const dangerousProtocols = [
      'javascript:',
      'vbscript:',
      'data:',
      'javascripts:'
    ];
    
    let sanitized = url.trim().toLowerCase();
    
    for (const protocol of dangerousProtocols) {
      if (sanitized.startsWith(protocol)) {
        console.warn('[XSS Protection] Blocked dangerous protocol:', protocol);
        return '#';
      }
    }
    
    // 过滤URL中的危险字符
    sanitized = sanitized.replace(/[<>]/g, '');
    
    return sanitized;
  }

  /**
   * 获取并过滤URL参数
   * @param {string} paramName - 参数名
   * @returns {string} 过滤后的参数值
   */
  function getSanitizedURLParam(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(paramName);
    
    if (value === null) return '';
    
    return sanitizeUserInput(value);
  }

  /**
   * 安全重定向
   * @param {string} url - 目标URL
   * @param {boolean} allowSelfRedirect - 是否允许站内重定向
   */
  function safeRedirect(url, allowSelfRedirect = true) {
    if (!url) return;
    
    const sanitized = sanitizeURL(url);
    
    // 检查是否为站内链接（防止开放重定向）
    if (allowSelfRedirect) {
      try {
        const targetUrl = new URL(sanitized, window.location.origin);
        const currentHost = window.location.hostname;
        
        if (targetUrl.hostname !== currentHost) {
          console.warn('[XSS Protection] Blocked external redirect:', sanitized);
          window.location.href = '/';
          return;
        }
      } catch (e) {
        console.warn('[XSS Protection] Invalid redirect URL:', sanitized);
        window.location.href = '/';
        return;
      }
    }
    
    window.location.href = sanitized;
  }

  // ============================================
  // 输入内容净化
  // ============================================
  
  /**
   * 用户输入全面净化
   * @param {string} input - 用户输入内容
   * @param {Object} options - 净化选项
   * @returns {string} 净化后的安全内容
   */
  function sanitizeUserInput(input, options = {}) {
    const {
      allowLineBreaks = true,
      allowImages = false,
      maxLength = 10000
    } = options;
    
    if (input === null || input === undefined) return '';
    
    let sanitized = String(input);
    
    // 1. 移除script标签及其内容
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // 2. 移除style标签及其内容
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // 3. 移除事件处理器属性
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '');
    
    // 4. 移除javascript:协议
    sanitized = sanitized.replace(/javascript\s*:/gi, '');
    
    // 5. 移除data:协议
    sanitified = sanitized.replace(/data\s*:/gi, '');
    
    // 6. 移除危险标签
    const dangerousTags = [
      'iframe', 'object', 'embed', 'form', 'input', 
      'button', 'textarea', 'select', 'base', 'link',
      'meta', 'svg', 'math'
    ];
    
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}\\b[^>]*>(?:[^<]*|<(?!${tag}\\b))*</${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
      const selfClosing = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
      sanitized = sanitized.replace(selfClosing, '');
    });
    
    // 7. 移除危险属性
    sanitized = sanitized.replace(/\s*(href|src|action)\s*=\s*["'][^"']*(javascript:|vbscript:)/gi, ' $1="-"');
    sanitized = sanitized.replace(/\s*style\s*=\s*["'][^"']*(expression|javascript:|url\()/gi, ' style=""');
    
    // 8. 过滤危险字符
    if (!allowLineBreaks) {
      sanitized = sanitized.replace(/[\r\n]/g, ' ');
    }
    
    // 9. 过滤图片（可选）
    if (!allowImages) {
      sanitized = sanitized.replace(/<img\b[^>]*>/gi, '');
    }
    
    // 10. 限制长度
    sanitized = sanitized.substring(0, maxLength);
    
    return sanitized.trim();
  }

  /**
   * 富文本HTML净化（保留部分标签）
   * @param {string} html - HTML内容
   * @returns {string} 净化后的HTML
   */
  function sanitizeRichHTML(html) {
    if (!html) return '';
    
    // 白名单标签
    const allowedTags = ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const allowedAttributes = {
      'a': ['href', 'title', 'target']
    };
    
    let sanitized = html;
    
    // 移除所有不在白名单中的标签（但保留内容）
    const allTagsRegex = /<(\/?)([\w]+)[^>]*>/gi;
    sanitized = sanitized.replace(allTagsRegex, (match, isClosing, tagName) => {
      const tag = tagName.toLowerCase();
      if (allowedTags.includes(tag)) {
        // 验证属性
        const attrMatch = match.match(/<[\w]+([^>]*)>/i);
        if (attrMatch && attrMatch[1]) {
          const attrs = attrMatch[1];
          const allowedAttrs = allowedAttributes[tag] || [];
          
          // 只保留白名单属性
          const filteredAttrs = allowedAttrs
            .map(attr => {
              const attrRegex = new RegExp(`${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
              const m = attrs.match(attrRegex);
              return m ? m[0] : null;
            })
            .filter(Boolean)
            .join(' ');
          
          return `<${isClosing}${tag}${filteredAttrs ? ' ' + filteredAttrs : ''}>`;
        }
        return match;
      }
      return '';
    });
    
    // 移除事件处理器
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '');
    
    return sanitized;
  }

  // ============================================
  // DOM 安全输出
  // ============================================
  
  /**
   * 安全设置元素文本内容（防止XSS）
   * @param {HTMLElement} element - 目标元素
   * @param {string} text - 文本内容
   */
  function safeSetText(element, text) {
    if (!element) return;
    
    // 使用textContent而不是innerHTML，自动转义
    element.textContent = text;
  }

  /**
   * 安全设置元素HTML内容（已净化）
   * @param {HTMLElement} element - 目标元素
   * @param {string} html - HTML内容
   * @param {boolean} isRich - 是否为富文本
   */
  function safeSetHTML(element, html, isRich = false) {
    if (!element) return;
    
    if (isRich) {
      element.innerHTML = sanitizeRichHTML(html);
    } else {
      element.innerHTML = encodeHTML(html);
    }
  }

  /**
   * 安全设置元素属性
   * @param {HTMLElement} element - 目标元素
   * @param {string} attrName - 属性名
   * @param {string} value - 属性值
   */
  function safeSetAttribute(element, attrName, value) {
    if (!element || !attrName) return;
    
    const safeAttrName = attrName.toLowerCase().trim();
    
    // 危险属性黑名单
    const dangerousAttrs = ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'];
    if (dangerousAttrs.includes(safeAttrName)) {
      console.warn('[XSS Protection] Blocked dangerous attribute:', safeAttrName);
      return;
    }
    
    element.setAttribute(safeAttrName, encodeAttrValue(String(value)));
  }

  // ============================================
  // Cookie 安全
  // ============================================
  
  /**
   * 安全设置Cookie
   * @param {string} name - Cookie名称
   * @param {string} value - Cookie值
   * @param {Object} options - Cookie选项
   */
  function safeSetCookie(name, value, options = {}) {
    const {
      expires = 7,
      path = '/',
      sameSite = 'Strict',
      secure = true
    } = options;
    
    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    // 设置过期时间
    if (expires) {
      const date = new Date();
      date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
      cookieStr += `; expires=${date.toUTCString()}`;
    }
    
    cookieStr += `; path=${path}`;
    cookieStr += `; SameSite=${sameSite}`;
    
    if (secure && window.location.protocol === 'https:') {
      cookieStr += '; Secure';
    }
    
    document.cookie = cookieStr;
  }

  // ============================================
  // 初始化与导出
  // ============================================
  
  // 自动为所有用户输入添加防护
  function initAutoProtection() {
    // 监听表单提交，自动过滤输入
    document.addEventListener('submit', function(e) {
      const form = e.target;
      if (!form || form.method.toLowerCase() === 'get') return;
      
      const inputs = form.querySelectorAll('input:not([type="hidden"]), textarea');
      inputs.forEach(input => {
        if (input.value) {
          input.value = sanitizeUserInput(input.value);
        }
      });
    }, true);
    
    // 阻止恶意URL加载
    window.addEventListener('DOMContentLoaded', function() {
      const currentScript = document.currentScript;
      if (currentScript && currentScript.src) {
        const url = sanitizeURL(currentScript.src);
        if (url !== currentScript.src) {
          console.error('[XSS Protection] Suspicious script source detected');
        }
      }
    });
  }

  // 导出API
  const XSSProtection = {
    // 编码函数
    encodeHTML,
    decodeHTML,
    encodeAttrValue,
    
    // URL安全
    sanitizeURL,
    getSanitizedURLParam,
    safeRedirect,
    
    // 输入净化
    sanitizeUserInput,
    sanitizeRichHTML,
    
    // DOM安全
    safeSetText,
    safeSetHTML,
    safeSetAttribute,
    
    // Cookie安全
    safeSetCookie,
    
    // 初始化
    initAutoProtection
  };

  // 挂载到全局
  global.XSSProtection = XSSProtection;

  // AMD/CommonJS兼容
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = XSSProtection;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return XSSProtection; });
  }

})(typeof window !== 'undefined' ? window : this);
