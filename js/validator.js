/**
 * 游导学习笔记 - 精致化5.0 输入验证工具
 * 品牌铁律：主色#E65100，深橙#BF360C，暖底#FFF3E0
 */
(function() {
  'use strict';

  // 验证规则定义
  const VALIDATION_RULES = {
    search: { minLength: 1, maxLength: 100, pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s\?\!\。\，\.\,\-\+]+$/ },
    activationCode: { pattern: /^XM\d{4}-[A-Z0-9]{4}$/, message: '激活码格式错误，示例：XM2026-ABCD' },
    timer: { minSeconds: 10, maxSeconds: 600, message: '计时时间需在10秒到10分钟之间' }
  };

  const Validator = {
    // 搜索验证
    validateSearch(query) {
      if (!query || query.trim() === '') return { valid: false, message: '请输入搜索关键词' };
      const trimmed = query.trim();
      if (trimmed.length > VALIDATION_RULES.search.maxLength) {
        return { valid: false, message: `搜索词过长，请控制在${VALIDATION_RULES.search.maxLength}字以内` };
      }
      return { valid: true, value: trimmed };
    },
    
    // 激活码验证
    validateActivationCode(code) {
      if (!code || code.trim() === '') return { valid: false, message: '请输入激活码' };
      const trimmed = code.trim().toUpperCase();
      if (!VALIDATION_RULES.activationCode.pattern.test(trimmed)) {
        return { valid: false, message: VALIDATION_RULES.activationCode.message };
      }
      return { valid: true, value: trimmed };
    },
    
    // 计时器数值验证
    validateTimerSeconds(seconds) {
      const num = parseInt(seconds, 10);
      if (isNaN(num)) return { valid: false, message: '请输入有效数字' };
      if (num < VALIDATION_RULES.timer.minSeconds) return { valid: false, message: `计时时间不能少于${VALIDATION_RULES.timer.minSeconds}秒` };
      if (num > VALIDATION_RULES.timer.maxSeconds) return { valid: false, message: `计时时间不能超过${VALIDATION_RULES.timer.maxSeconds}秒` };
      return { valid: true, value: num };
    },
    
    // XSS防护 - 转义HTML特殊字符
    escapeHtml(str) {
      if (typeof str !== 'string') return '';
      const htmlEscapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
      return str.replace(/[&<>"'\/]/g, char => htmlEscapes[char]);
    },
    
    // XSS防护 - 移除危险标签和属性
    sanitizeHtml(str) {
      if (typeof str !== 'string') return '';
      return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+=\'[^\']*\'/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '');
    },
    
    // 输入trim处理
    trimInput(input) {
      if (typeof input !== 'string') return '';
      return input.trim().replace(/\s+/g, ' ');
    }
  };

  window.Validator = Validator;
  window.VALIDATION_RULES = VALIDATION_RULES;

})();
