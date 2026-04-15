/**
 * ============================================
 * XSS 安全过滤工具 - 游导旅游网站
 * ============================================
 * 用于过滤用户输入中的危险字符，防止XSS攻击
 */

(function() {
  'use strict';

  /**
   * XSS过滤配置
   */
  const XSS_CONFIG = {
    // 允许的HTML标签（白名单）
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li'],
    // 允许的属性
    allowedAttributes: {
      'a': ['href', 'title', 'target']
    },
    // 危险标签（直接移除）
    dangerousTags: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select']
  };

  /**
   * HTML实体编码
   */
  function encodeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * 解码HTML实体
   */
  function decodeHtml(str) {
    if (!str) return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  }

  /**
   * 基础XSS过滤（转义危险字符）
   * 适用于普通文本输入
   */
  function basicFilter(input) {
    if (!input || typeof input !== 'string') return '';
    
    let output = input;
    
    // 移除或替换危险模式
    const dangerousPatterns = [
      // JavaScript伪协议
      { pattern: /javascript\s*:/gi, replacement: '' },
      // 事件处理器
      { pattern: /\bon\w+\s*=/gi, replacement: '' },
      // 数据URI
      { pattern: /data\s*:\s*text\/html/gi, replacement: '' },
      // SVG/XML
      { pattern: /<svg[^>]*>.*?<\/svg>/gi, replacement: '' },
      // expression
      { pattern: /expression\s*\(/gi, replacement: '' },
      // vbscript
      { pattern: /vbscript\s*:/gi, replacement: '' }
    ];

    dangerousPatterns.forEach(({ pattern, replacement }) => {
      output = output.replace(pattern, replacement);
    });

    return encodeHtml(output);
  }

  /**
   * 严格XSS过滤（完全移除HTML标签）
   * 适用于需要纯文本的场景
   */
  function strictFilter(input) {
    if (!input || typeof input !== 'string') return '';
    
    let output = input;
    
    // 移除所有HTML标签
    output = output.replace(/<[^>]+>/g, '');
    
    // 移除危险标签
    XSS_CONFIG.dangerousTags.forEach(tag => {
      const pattern = new RegExp(`<${tag}[^>]*>.*?<\\/${tag}>`, 'gi');
      output = output.replace(pattern, '');
    });

    return encodeHtml(output);
  }

  /**
   * 表单输入过滤（适用于所有表单字段）
   */
  function formInputFilter(input) {
    if (!input || typeof input !== 'string') return '';
    
    // 去除首尾空白
    let output = input.trim();
    
    // 限制长度（防止长脚本注入）
    const MAX_LENGTH = 10000;
    if (output.length > MAX_LENGTH) {
      output = output.substring(0, MAX_LENGTH);
    }
    
    // 移除换行符中的危险字符（防止绕过）
    output = output.replace(/[\r\n]+\s*</g, '\n<');
    
    return basicFilter(output);
  }

  /**
   * URL过滤（验证URL安全性）
   */
  function urlFilter(input) {
    if (!input || typeof input !== 'string') return '';
    
    // 移除危险协议
    const dangerousProtocols = ['javascript', 'vbscript', 'data', 'jar'];
    
    let output = input.trim().toLowerCase();
    
    dangerousProtocols.forEach(protocol => {
      if (output.startsWith(`${protocol}:`)) {
        return '';
      }
    });
    
    // 确保是合法URL
    try {
      const url = new URL(output);
      // 只允许 http/https 协议
      if (!['http:', 'https:'].includes(url.protocol)) {
        return '';
      }
      return output;
    } catch (e) {
      // 如果不是完整URL，添加协议后重试
      if (!output.startsWith('http')) {
        output = 'https://' + output;
        try {
          new URL(output);
          return output;
        } catch (e2) {
          return '';
        }
      }
      return '';
    }
  }

  /**
   * 评论/富文本过滤（保留部分格式）
   */
  function richTextFilter(input) {
    if (!input || typeof input !== 'string') return '';
    
    let output = input;
    
    // 移除所有script标签及其内容
    output = output.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // 移除所有style标签及其内容
    output = output.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // 移除事件属性
    output = output.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    output = output.replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '');
    
    // 移除危险属性
    output = output.replace(/\s*(href|src|action)\s*=\s*["']\s*javascript:[^"']*["']/gi, '');
    
    // 移除危险标签
    XSS_CONFIG.dangerousTags.forEach(tag => {
      const pattern = new RegExp(`<${tag}[^>]*>.*?<\\/${tag}>`, 'gi');
      output = output.replace(pattern, '');
      const selfClosing = new RegExp(`<${tag}[^>]*\\/?>`, 'gi');
      output = output.replace(selfClosing, '');
    });
    
    return output;
  }

  // 导出到全局
  window.XSSFilter = {
    basic: basicFilter,
    strict: strictFilter,
    form: formInputFilter,
    url: urlFilter,
    richText: richTextFilter,
    encode: encodeHtml,
    decode: decodeHtml
  };

  /**
   * 自动过滤表单输入
   * 使用方法：在表单提交时调用
   */
  window.filterForm = function(formSelector) {
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
  };

})();
