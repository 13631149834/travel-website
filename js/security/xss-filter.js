/**
 * ============================================
 * XSS安全过滤器 - 游导旅游平台
 * ============================================
 * 完整的XSS防护解决方案
 * 功能：输入过滤、输出编码、CSP配置管理
 */

(function() {
  'use strict';

  // ============================================
  // XSS防护配置
  // ============================================
  const XSSConfig = {
    // 允许的安全标签（白名单）
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'span', 'div'],
    
    // 允许的安全属性
    allowedAttributes: {
      'a': ['href', 'title', 'target', 'rel'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'span': ['class', 'style'],
      'div': ['class', 'style'],
      'p': ['class'],
      'code': ['class'],
      'pre': ['class']
    },
    
    // 危险标签（黑名单-直接移除）
    dangerousTags: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'base', 'link', 'meta', 'svg', 'math', 'style'],
    
    // 危险的URL协议
    dangerousProtocols: ['javascript', 'vbscript', 'data', 'jar', 'mhtml'],
    
    // 最大输入长度
    maxInputLength: 10000,
    
    // 是否启用严格模式
    strictMode: true
  };

  // ============================================
  // HTML实体编码映射
  // ============================================
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  // ============================================
  // 输入过滤
  // ============================================
  
  /**
   * HTML实体编码
   * @param {string} str - 待编码字符串
   * @returns {string} 编码后的字符串
   */
  function encodeHTML(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[&<>"'`=/]/g, char => htmlEntities[char] || char);
  }

  /**
   * HTML实体解码
   * @param {string} str - 待解码字符串
   * @returns {string} 解码后的字符串
   */
  function decodeHTML(str) {
    if (!str || typeof str !== 'string') return '';
    const entities = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#x27;': "'",
      '&#x2F;': '/',
      '&#x60;': '`',
      '&#x3D;': '='
    };
    return str.replace(/&(amp|lt|gt|quot|#x27|#x2F|#x60|#x3D);/g, match => entities[match] || match);
  }

  /**
   * URL编码
   * @param {string} str - 待编码字符串
   * @returns {string} URL编码后的字符串
   */
  function encodeURL(str) {
    if (!str) return '';
    return encodeURIComponent(str)
      .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  }

  /**
   * JavaScript字符串编码
   * @param {string} str - 待编码字符串
   * @returns {string} 编码后的字符串
   */
  function encodeJS(str) {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/</g, '\\x3C')
      .replace(/>/g, '\\x3E')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  }

  /**
   * CSS字符串编码
   * @param {string} str - 待编码字符串
   * @returns {string} 编码后的字符串
   */
  function encodeCSS(str) {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\22')
      .replace(/'/g, '\\27')
      .replace(/</g, '\\3C')
      .replace(/>/g, '\\3E')
      .replace(/&/g, '\\26')
      .replace(/%/g, '\\25');
  }

  /**
   * 基础XSS过滤（转义危险字符）
   * 适用于普通文本输入
   */
  function basicFilter(input) {
    if (!input || typeof input !== 'string') return '';
    
    let output = input;
    
    // 移除危险模式
    const dangerousPatterns = [
      { pattern: /javascript\s*:/gi, replacement: '' },
      { pattern: /vbscript\s*:/gi, replacement: '' },
      { pattern: /data\s*:\s*text\/html/gi, replacement: '' },
      { pattern: /\bon\w+\s*=/gi, replacement: '' },
      { pattern: /expression\s*\(/gi, replacement: '' },
      { pattern: /url\s*\(\s*["']?\s*javascript:/gi, replacement: '' }
    ];

    dangerousPatterns.forEach(({ pattern, replacement }) => {
      output = output.replace(pattern, replacement);
    });

    return encodeHTML(output);
  }

  /**
   * 严格XSS过滤（完全移除HTML标签）
   * 适用于需要纯文本的场景
   */
  function strictFilter(input) {
    if (!input || typeof input !== 'string') return '';
    
    let output = input.trim();
    
    // 限制长度
    if (output.length > XSSConfig.maxInputLength) {
      output = output.substring(0, XSSConfig.maxInputLength);
    }
    
    // 移除所有HTML标签
    output = output.replace(/<[^>]*>/g, '');
    
    // 移除危险标签
    XSSConfig.dangerousTags.forEach(tag => {
      const pattern = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
      output = output.replace(pattern, '');
      const selfClosing = new RegExp(`<${tag}[^>]*\\/?>`, 'gi');
      output = output.replace(selfClosing, '');
    });

    return encodeHTML(output);
  }

  /**
   * 表单输入过滤
   * 适用于所有表单字段
   */
  function formInputFilter(input) {
    if (!input || typeof input !== 'string') return '';
    
    let output = input.trim();
    
    // 限制长度
    if (output.length > XSSConfig.maxInputLength) {
      output = output.substring(0, XSSConfig.maxInputLength);
    }
    
    // 移除换行符中的危险字符
    output = output.replace(/[\r\n]+\s*</g, '\n<');
    
    return basicFilter(output);
  }

  /**
   * URL安全过滤
   * 验证URL协议和格式
   */
  function urlFilter(input) {
    if (!input || typeof input !== 'string') return '';
    
    let output = input.trim().toLowerCase();
    
    // 检查危险协议
    for (const protocol of XSSConfig.dangerousProtocols) {
      if (output.startsWith(`${protocol}:`)) {
        return '';
      }
    }
    
    // 验证URL格式
    try {
      const url = new URL(output.startsWith('http') ? output : `https://${output}`);
      // 只允许 http/https 协议
      if (!['http:', 'https:'].includes(url.protocol)) {
        return '';
      }
      return output.startsWith('http') ? output : `https://${output}`;
    } catch (e) {
      return '';
    }
  }

  /**
   * 富文本过滤（保留部分安全格式）
   * 适用于评论、帖子等需要格式化的场景
   */
  function richTextFilter(input) {
    if (!input || typeof input !== 'string') return '';
    
    let output = input;
    
    // 移除所有script标签及其内容
    output = output.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // 移除所有style标签及其内容
    output = output.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // 移除iframe标签
    output = output.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    
    // 移除事件属性
    output = output.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    output = output.replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '');
    
    // 移除javascript:协议
    output = output.replace(/\s*(href|src|action)\s*=\s*["']\s*javascript:[^"']*["']/gi, '');
    
    // 移除data:协议（除图片外）
    output = output.replace(/\s*(href|src)\s*=\s*["']\s*data:(?!image\/)[^"']*["']/gi, '');
    
    // 移除危险标签
    XSSConfig.dangerousTags.forEach(tag => {
      const pattern = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
      output = output.replace(pattern, '');
      const selfClosing = new RegExp(`<${tag}[^>]*\\/?>`, 'gi');
      output = output.replace(selfClosing, '');
    });
    
    // 限制长度
    if (output.length > XSSConfig.maxInputLength * 2) {
      output = output.substring(0, XSSConfig.maxInputLength * 2);
    }
    
    return output;
  }

  /**
   * 属性值过滤
   * 用于过滤HTML属性值
   */
  function attributeFilter(input) {
    if (!input || typeof input !== 'string') return '';
    
    let output = input.trim();
    
    // 移除引号内的危险内容
    output = output.replace(/['"]\s*javascript:[^"']*["']/gi, '');
    output = output.replace(/['"]\s*on\w+[^"']*["']/gi, '');
    
    // 移除表情符号（可能导致编码问题）
    // output = output.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
    
    return encodeHTML(output);
  }

  // ============================================
  // 输出编码
  // ============================================
  
  /**
   * 根据上下文选择合适的编码方式
   * @param {string} input - 输入文本
   * @param {string} context - 上下文类型：html, attribute, js, css, url
   * @returns {string} 编码后的文本
   */
  function contextualEncode(input, context = 'html') {
    if (!input) return '';
    
    switch (context) {
      case 'html':
        return encodeHTML(input);
      case 'attribute':
        return attributeFilter(input);
      case 'js':
        return encodeJS(input);
      case 'css':
        return encodeCSS(input);
      case 'url':
        return encodeURL(input);
      default:
        return encodeHTML(input);
    }
  }

  /**
   * DOM文本安全插入
   * @param {Element} element - 目标元素
   * @param {string} text - 要插入的文本
   */
  function safeSetText(element, text) {
    if (!element || !text) return;
    element.textContent = text;
  }

  /**
   * DOM HTML安全插入（仅在必要时使用）
   * @param {Element} element - 目标元素
   * @param {string} html - 要插入的HTML
   */
  function safeSetHTML(element, html) {
    if (!element || !html) return;
    element.innerHTML = richTextFilter(html);
  }

  /**
   * DOM安全属性设置
   * @param {Element} element - 目标元素
   * @param {string} attrName - 属性名
   * @param {string} value - 属性值
   */
  function safeSetAttribute(element, attrName, value) {
    if (!element || !attrName || value === undefined) return;
    
    // 危险属性黑名单
    const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'];
    if (dangerousAttrs.some(attr => attrName.toLowerCase().startsWith(attr))) {
      return;
    }
    
    // 特殊属性处理
    if (attrName === 'href' || attrName === 'src' || attrName === 'action') {
      const filteredUrl = urlFilter(value);
      if (filteredUrl) {
        element.setAttribute(attrName, filteredUrl);
      }
      return;
    }
    
    element.setAttribute(attrName, attributeFilter(String(value)));
  }

  // ============================================
  // CSP配置管理
  // ============================================
  
  /**
   * CSP策略管理器
   */
  const CSPManager = {
    // 默认策略
    defaultPolicy: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net', 'https://cdn.bootcdn.net'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdn.bootcdn.net'],
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'font-src': ["'self'", 'https://cdn.jsdelivr.net', 'https://cdn.bootcdn.net', 'data:'],
      'connect-src': ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co', 'https://api.coze.cn'],
      'frame-src': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"]
    },
    
    // 开发环境策略
    devPolicy: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'connect-src': ["'self'"]
    },
    
    /**
     * 生成CSP头字符串
     */
    generateHeader(policy = null) {
      const p = policy || this.defaultPolicy;
      return Object.entries(p)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ');
    },
    
    /**
     * 应用CSP策略到meta标签
     */
    applyMetaTag(policy = null) {
      const header = this.generateHeader(policy);
      
      // 查找或创建CSP meta标签
      let meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('http-equiv', 'Content-Security-Policy');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', header);
    }
  };

  // ============================================
  // 自动表单过滤
  // ============================================
  
  /**
   * 自动过滤表单输入
   * @param {string} formSelector - 表单选择器
   * @returns {boolean} 是否有变更
   */
  function filterForm(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return false;

    const inputs = form.querySelectorAll('input, textarea, select');
    let hasChanges = false;

    inputs.forEach(input => {
      if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;
      
      const originalValue = input.value;
      const filteredValue = formInputFilter(originalValue);
      
      if (originalValue !== filteredValue) {
        input.value = filteredValue;
        hasChanges = true;
      }
    });

    return hasChanges;
  }

  /**
   * 初始化表单自动过滤
   * @param {string} formSelector - 表单选择器
   * @param {Function} onSubmit - 提交前回调
   */
  function initFormProtection(formSelector, onSubmit) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    // 提交前过滤
    form.addEventListener('submit', function(e) {
      const hasChanges = filterForm(formSelector);
      if (hasChanges && XSSConfig.strictMode) {
        // 提示用户输入已被过滤
        console.warn('XSS: 部分输入已被过滤以确保安全');
      }
      
      if (typeof onSubmit === 'function') {
        return onSubmit(e);
      }
    });

    // 实时过滤（可选）
    const inputs = form.querySelectorAll('input[type="text"], textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        const filtered = formInputFilter(this.value);
        if (this.value !== filtered) {
          this.value = filtered;
        }
      });
    });
  }

  // ============================================
  // 导出API
  // ============================================
  
  window.XSSFilter = {
    // 编码函数
    encode: encodeHTML,
    encodeHTML,
    decode: decodeHTML,
    decodeHTML,
    encodeURL,
    encodeJS,
    encodeCSS,
    contextualEncode,
    
    // 过滤函数
    basic: basicFilter,
    strict: strictFilter,
    form: formInputFilter,
    url: urlFilter,
    richText: richTextFilter,
    attribute: attributeFilter,
    
    // DOM操作
    safeSetText,
    safeSetHTML,
    safeSetAttribute,
    
    // 表单保护
    filterForm,
    initFormProtection,
    
    // CSP管理
    CSP: CSPManager,
    
    // 配置
    config: XSSConfig
  };

  // 自动初始化（在DOM加载完成后）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // 可选：自动应用CSP
      // CSPManager.applyMetaTag();
    });
  }

})();
