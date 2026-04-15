/**
 * ============================================
 * 输入验证与敏感信息保护模块 - 游导旅游平台
 * ============================================
 * 提供全面的输入验证和敏感数据处理功能
 * 
 * 功能特性:
 * - 邮箱验证
 * - 手机号验证
 * - 密码强度验证
 * - 文件类型验证
 * - 敏感信息脱敏处理
 */

(function(global) {
  'use strict';

  // ============================================
  // 正则表达式库
  // ============================================
  
  const REGEX_PATTERNS = {
    // 中国大陆手机号（支持虚拟号段）
    chineseMobile: /^1[3-9]\d{9}$/,
    
    // 香港手机号
    hkMobile: /^(\+852)?[569]\d{7}$/,
    
    // 台湾手机号
    twMobile: /^(\+886)?[0-9]{9,10}$/,
    
    // 澳门手机号
    moMobile: /^(\+853)?[6]\d{7}$/,
    
    // 国际手机号
    internationalMobile: /^\+?[1-9]\d{6,14}$/,
    
    // 邮箱（通用）
    email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    
    // 中国邮箱
    chineseEmail: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.cn|\.com\.cn|\.net\.cn|\.org\.cn|\.gov\.cn)*$/,
    
    // URL
    url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    
    // 身份证号（18位）
    chineseId18: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
    
    // 护照号
    passport: /^[a-zA-Z]{1,2}[0-9]{6,9}$/,
    
    // 银行卡号（简单验证）
    bankCard: /^[0-9]{16,19}$/,
    
    // 用户名（字母开头，4-20位）
    username: /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/,
    
    // 密码强度（至少8位）
    password: /^.{8,}$/,
    
    // 强密码（8位以上，包含大小写字母、数字和特殊字符）
    strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    
    // 中等强度密码（8位以上，包含字母和数字）
    mediumPassword: /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
    
    // 邮政编码
    postalCode: /^[1-9]\d{5}$/,
    
    // IP地址
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    
    // 纯数字
    numberOnly: /^\d+$/,
    
    // 字母
    letterOnly: /^[a-zA-Z]+$/,
    
    // 中文
    chinese: /^[\u4e00-\u9fa5]+$/,
    
    // 字母数字
    alphanumeric: /^[a-zA-Z0-9]+$/
  };

  // ============================================
  // 输入验证
  // ============================================
  
  /**
   * 验证结果对象
   */
  class ValidationResult {
    constructor(valid, message = '') {
      this.valid = valid;
      this.message = message;
    }
  }

  /**
   * 验证邮箱
   * @param {string} email - 邮箱地址
   * @param {Object} options - 验证选项
   * @returns {ValidationResult} 验证结果
   */
  function validateEmail(email, options = {}) {
    const { allowEmpty = false, strict = false } = options;
    
    if (!email || !email.trim()) {
      return new ValidationResult(allowEmpty, '邮箱地址不能为空');
    }
    
    const trimmed = email.trim();
    const pattern = strict ? REGEX_PATTERNS.chineseEmail : REGEX_PATTERNS.email;
    
    if (!pattern.test(trimmed)) {
      return new ValidationResult(false, '邮箱格式不正确');
    }
    
    // 检查长度
    if (trimmed.length > 254) {
      return new ValidationResult(false, '邮箱地址过长');
    }
    
    // 检查危险字符
    const dangerousChars = ['<', '>', '"', "'", 'script', 'javascript'];
    for (const char of dangerousChars) {
      if (trimmed.toLowerCase().includes(char)) {
        return new ValidationResult(false, '邮箱地址包含非法字符');
      }
    }
    
    return new ValidationResult(true, '验证通过');
  }

  /**
   * 验证手机号
   * @param {string} phone - 手机号
   * @param {Object} options - 验证选项
   * @returns {ValidationResult} 验证结果
   */
  function validatePhone(phone, options = {}) {
    const { 
      allowEmpty = false, 
      region = 'auto' // 'auto', 'cn', 'hk', 'tw', 'mo', 'intl'
    } = options;
    
    if (!phone || !phone.trim()) {
      return new ValidationResult(allowEmpty, '手机号不能为空');
    }
    
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    let pattern;
    switch (region) {
      case 'cn':
        pattern = REGEX_PATTERNS.chineseMobile;
        break;
      case 'hk':
        pattern = REGEX_PATTERNS.hkMobile;
        break;
      case 'tw':
        pattern = REGEX_PATTERNS.twMobile;
        break;
      case 'mo':
        pattern = REGEX_PATTERNS.moMobile;
        break;
      case 'intl':
        pattern = REGEX_PATTERNS.internationalMobile;
        break;
      default:
        // 自动检测
        if (/^1[3-9]/.test(cleaned)) {
          pattern = REGEX_PATTERNS.chineseMobile;
        } else if (/^\+?852/.test(cleaned)) {
          pattern = REGEX_PATTERNS.hkMobile;
        } else if (/^\+?886/.test(cleaned)) {
          pattern = REGEX_PATTERNS.twMobile;
        } else if (/^\+?853/.test(cleaned)) {
          pattern = REGEX_PATTERNS.moMobile;
        } else {
          pattern = REGEX_PATTERNS.internationalMobile;
        }
    }
    
    if (!pattern.test(cleaned)) {
      return new ValidationResult(false, '手机号格式不正确');
    }
    
    return new ValidationResult(true, '验证通过');
  }

  /**
   * 验证密码强度
   * @param {string} password - 密码
   * @param {Object} options - 验证选项
   * @returns {Object} 验证结果和强度信息
   */
  function validatePassword(password, options = {}) {
    const { 
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumber = true,
      requireSpecial = false,
      allowEmpty = false
    } = options;
    
    if (!password || !password.trim()) {
      return { 
        valid: allowEmpty, 
        message: '密码不能为空',
        strength: 0,
        level: 'none'
      };
    }
    
    // 基本长度检查
    if (password.length < minLength) {
      return { 
        valid: false, 
        message: `密码至少需要${minLength}个字符`,
        strength: 0,
        level: 'none'
      };
    }
    
    let strength = 0;
    const checks = [];
    
    // 检查小写字母
    if (/[a-z]/.test(password)) {
      strength += 20;
      checks.push('lowercase');
    } else if (requireLowercase) {
      checks.push('lowercase_missing');
    }
    
    // 检查大写字母
    if (/[A-Z]/.test(password)) {
      strength += 20;
      checks.push('uppercase');
    } else if (requireUppercase) {
      checks.push('uppercase_missing');
    }
    
    // 检查数字
    if (/\d/.test(password)) {
      strength += 20;
      checks.push('number');
    } else if (requireNumber) {
      checks.push('number_missing');
    }
    
    // 检查特殊字符
    if (/[@$!%*?&]/.test(password)) {
      strength += 20;
      checks.push('special');
    } else if (requireSpecial) {
      checks.push('special_missing');
    }
    
    // 长度加成
    if (password.length >= 12) strength += 15;
    if (password.length >= 16) strength += 5;
    
    // 确定强度等级
    let level, valid, message;
    
    if (strength >= 80) {
      level = 'strong';
      valid = true;
      message = '密码强度很强';
    } else if (strength >= 50) {
      level = 'medium';
      valid = true;
      message = '密码强度中等';
    } else if (strength >= 30) {
      level = 'weak';
      valid = true;
      message = '密码强度较弱，建议增强';
    } else {
      level = 'very_weak';
      valid = false;
      message = '密码强度不足';
    }
    
    // 检查是否有缺失的必要条件
    if (checks.some(c => c.includes('_missing'))) {
      const missing = checks
        .filter(c => c.endsWith('_missing'))
        .map(c => c.replace('_missing', ''));
      
      const names = {
        lowercase: '小写字母',
        uppercase: '大写字母',
        number: '数字',
        special: '特殊字符'
      };
      
      message = `缺少必要条件: ${missing.map(m => names[m]).join('、')}`;
      valid = false;
    }
    
    return { valid, message, strength, level, checks };
  }

  /**
   * 验证文件类型
   * @param {File} file - 文件对象
   * @param {Object} options - 验证选项
   * @returns {ValidationResult} 验证结果
   */
  function validateFile(file, options = {}) {
    const {
      allowedTypes = [],
      allowedExtensions = [],
      maxSize = 10 * 1024 * 1024, // 10MB
      minSize = 0,
      allowEmpty = false
    } = options;
    
    if (!file) {
      return new ValidationResult(allowEmpty, '请选择文件');
    }
    
    // 检查文件大小
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return new ValidationResult(false, `文件大小不能超过${maxSizeMB}MB`);
    }
    
    if (file.size < minSize) {
      return new ValidationResult(false, '文件大小不符合要求');
    }
    
    // 检查文件类型
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    // 检查MIME类型
    if (allowedTypes.length > 0) {
      const typeMatch = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          // 通配符类型（如 image/*）
          const prefix = type.replace('/*', '');
          return fileType.startsWith(prefix);
        }
        return fileType === type.toLowerCase();
      });
      
      if (!typeMatch) {
        return new ValidationResult(false, '文件类型不允许');
      }
    }
    
    // 检查扩展名
    if (allowedExtensions.length > 0) {
      const ext = fileName.split('.').pop();
      if (!allowedExtensions.map(e => e.toLowerCase()).includes(ext)) {
        return new ValidationResult(false, `只允许上传${allowedExtensions.join('、')}格式`);
      }
    }
    
    // 安全检查：文件名
    const dangerousPatterns = [
      /<script/i,
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.vbs$/i,
      /\.scr$/i,
      /\.pif$/i,
      /\.com$/i,
      /\.msi$/i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(fileName)) {
        return new ValidationResult(false, '文件名包含危险字符或禁止的扩展名');
      }
    }
    
    return new ValidationResult(true, '验证通过');
  }

  /**
   * 验证身份证号
   * @param {string} id - 身份证号
   * @param {Object} options - 验证选项
   * @returns {ValidationResult} 验证结果
   */
  function validateIdCard(id, options = {}) {
    const { allowEmpty = false } = options;
    
    if (!id || !id.trim()) {
      return new ValidationResult(allowEmpty, '身份证号不能为空');
    }
    
    const cleaned = id.trim().toUpperCase();
    
    // 18位身份证验证
    if (!REGEX_PATTERNS.chineseId18.test(cleaned)) {
      return new ValidationResult(false, '身份证号格式不正确');
    }
    
    // 校验位验证
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(cleaned[i]) * weights[i];
    }
    
    const checkCode = checkCodes[sum % 11];
    if (checkCode !== cleaned[17]) {
      return new ValidationResult(false, '身份证号校验失败');
    }
    
    return new ValidationResult(true, '验证通过');
  }

  /**
   * 通用字符串验证
   * @param {string} str - 待验证字符串
   * @param {Object} rules - 验证规则
   * @returns {ValidationResult} 验证结果
   */
  function validateString(str, rules = {}) {
    const {
      minLength,
      maxLength,
      pattern,
      patternName = '格式',
      allowEmpty = false,
      trim = true
    } = rules;
    
    const value = trim ? str?.trim() : str;
    
    if (!value) {
      return new ValidationResult(allowEmpty, '内容不能为空');
    }
    
    if (minLength !== undefined && value.length < minLength) {
      return new ValidationResult(false, `内容长度不能少于${minLength}个字符`);
    }
    
    if (maxLength !== undefined && value.length > maxLength) {
      return new ValidationResult(false, `内容长度不能超过${maxLength}个字符`);
    }
    
    if (pattern && !pattern.test(value)) {
      return new ValidationResult(false, `${patternName}格式不正确`);
    }
    
    return new ValidationResult(true, '验证通过');
  }

  // ============================================
  // 敏感信息脱敏
  // ============================================
  
  /**
   * 手机号脱敏
   * @param {string} phone - 手机号
   * @param {string} maskChar - 脱敏字符，默认*
   * @returns {string} 脱敏后的手机号
   */
  function maskPhone(phone, maskChar = '*') {
    if (!phone) return '';
    
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    if (cleaned.length < 7) {
      return maskChar.repeat(cleaned.length);
    }
    
    const visiblePrefix = cleaned.substring(0, 3);
    const visibleSuffix = cleaned.substring(cleaned.length - 4);
    const maskedMiddle = maskChar.repeat(4);
    
    return `${visiblePrefix}${maskedMiddle}${visibleSuffix}`;
  }

  /**
   * 邮箱脱敏
   * @param {string} email - 邮箱
   * @param {string} maskChar - 脱敏字符，默认*
   * @returns {string} 脱敏后的邮箱
   */
  function maskEmail(email, maskChar = '*') {
    if (!email) return '';
    
    const parts = email.split('@');
    if (parts.length !== 2) return maskChar.repeat(5);
    
    const [local, domain] = parts;
    
    if (local.length <= 2) {
      return `${local[0]}${maskChar}@${domain}`;
    }
    
    const visibleChars = Math.ceil(local.length * 0.3);
    const visiblePrefix = local.substring(0, visibleChars);
    const maskedMiddle = maskChar.repeat(Math.max(local.length - visibleChars, 2));
    
    return `${visiblePrefix}${maskedMiddle}@${domain}`;
  }

  /**
   * 身份证号脱敏
   * @param {string} idCard - 身份证号
   * @param {string} maskChar - 脱敏字符，默认*
   * @returns {string} 脱敏后的身份证号
   */
  function maskIdCard(idCard, maskChar = '*') {
    if (!idCard) return '';
    
    const cleaned = idCard.toUpperCase();
    
    if (cleaned.length < 10) {
      return maskChar.repeat(cleaned.length);
    }
    
    const visiblePrefix = cleaned.substring(0, 4);
    const visibleSuffix = cleaned.substring(cleaned.length - 2);
    const maskedMiddle = maskChar.repeat(cleaned.length - 6);
    
    return `${visiblePrefix}${maskedMiddle}${visibleSuffix}`;
  }

  /**
   * 银行卡号脱敏
   * @param {string} bankCard - 银行卡号
   * @param {string} maskChar - 脱敏字符，默认*
   * @returns {string} 脱敏后的银行卡号
   */
  function maskBankCard(bankCard, maskChar = '*') {
    if (!bankCard) return '';
    
    const cleaned = bankCard.replace(/\s/g, '');
    
    if (cleaned.length < 8) {
      return maskChar.repeat(cleaned.length);
    }
    
    const visiblePrefix = cleaned.substring(0, 4);
    const visibleSuffix = cleaned.substring(cleaned.length - 4);
    const maskedMiddle = maskChar.repeat(cleaned.length - 8);
    
    return `${visiblePrefix}${maskedMiddle}${visibleSuffix}`;
  }

  /**
   * 姓名脱敏
   * @param {string} name - 姓名
   * @param {string} maskChar - 脱敏字符，默认*
   * @returns {string} 脱敏后的姓名
   */
  function maskName(name, maskChar = '*') {
    if (!name) return '';
    
    const trimmed = name.trim();
    
    if (trimmed.length === 1) {
      return maskChar;
    }
    
    if (trimmed.length === 2) {
      return `${trimmed[0]}${maskChar}`;
    }
    
    // 3个字及以上，保留首尾
    const visiblePrefix = trimmed[0];
    const visibleSuffix = trimmed[trimmed.length - 1];
    const maskedMiddle = maskChar.repeat(trimmed.length - 2);
    
    return `${visiblePrefix}${maskedMiddle}${visibleSuffix}`;
  }

  /**
   * 地址脱敏
   * @param {string} address - 地址
   * @param {number} keepStart - 保留前N个字符
   * @param {number} keepEnd - 保留后N个字符
   * @param {string} maskChar - 脱敏字符，默认*
   * @returns {string} 脱敏后的地址
   */
  function maskAddress(address, keepStart = 6, keepEnd = 4, maskChar = '*') {
    if (!address) return '';
    
    const trimmed = address.trim();
    
    if (trimmed.length <= keepStart + keepEnd) {
      return maskChar.repeat(Math.min(trimmed.length, 8));
    }
    
    const visiblePrefix = trimmed.substring(0, keepStart);
    const visibleSuffix = trimmed.substring(trimmed.length - keepEnd);
    const maskedMiddle = maskChar.repeat(Math.min(8, trimmed.length - keepStart - keepEnd));
    
    return `${visiblePrefix}${maskedMiddle}${visibleSuffix}`;
  }

  // ============================================
  // 验证辅助函数
  // ============================================
  
  /**
   * 创建实时验证器
   * @param {HTMLElement} input - 输入元素
   * @param {Function} validatorFn - 验证函数
   * @param {Object} options - 选项
   * @returns {Function} 移除监听器的函数
   */
  function createRealtimeValidator(input, validatorFn, options = {}) {
    const {
      debounce = 300,
      showMessage = true,
      errorClass = 'is-invalid',
      successClass = 'is-valid'
    } = options;
    
    let debounceTimer;
    
    const validate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const result = validatorFn(input.value);
        
        if (showMessage) {
          input.classList.remove(errorClass, successClass);
          input.classList.add(result.valid ? successClass : errorClass);
          
          // 查找或创建错误消息元素
          let messageEl = input.parentElement.querySelector('.validation-message');
          if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'validation-message small mt-1';
            input.parentElement.appendChild(messageEl);
          }
          
          messageEl.textContent = result.message || '';
          messageEl.style.color = result.valid ? 'var(--success-color, #28a745)' : 'var(--error-color, #dc3545)';
        }
      }, debounce);
    };
    
    input.addEventListener('input', validate);
    input.addEventListener('blur', validate);
    
    // 返回清理函数
    return () => {
      clearTimeout(debounceTimer);
      input.removeEventListener('input', validate);
      input.removeEventListener('blur', validate);
    };
  }

  /**
   * 批量验证表单
   * @param {HTMLFormElement} form - 表单元素
   * @param {Object} validators - 验证器配置
   * @returns {Object} 验证结果
   */
  function validateForm(form, validators = {}) {
    const results = {};
    let allValid = true;
    
    for (const [fieldName, validatorFn] of Object.entries(validators)) {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (!field) continue;
      
      const result = validatorFn(field.value);
      results[fieldName] = result;
      
      if (!result.valid) {
        allValid = false;
        field.classList.add('is-invalid');
        
        let messageEl = field.parentElement.querySelector('.validation-message');
        if (!messageEl) {
          messageEl = document.createElement('div');
          messageEl.className = 'validation-message small mt-1';
          field.parentElement.appendChild(messageEl);
        }
        messageEl.textContent = result.message || '验证失败';
      } else {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
      }
    }
    
    return { valid: allValid, results };
  }

  // ============================================
  // 导出
  // ============================================
  
  const InputValidator = {
    // 正则表达式
    patterns: REGEX_PATTERNS,
    
    // 验证函数
    validateEmail,
    validatePhone,
    validatePassword,
    validateFile,
    validateIdCard,
    validateString,
    validateForm,
    
    // 脱敏函数
    maskPhone,
    maskEmail,
    maskIdCard,
    maskBankCard,
    maskName,
    maskAddress,
    
    // 辅助函数
    createRealtimeValidator,
    
    // 类导出
    ValidationResult
  };

  // 挂载到全局
  global.InputValidator = InputValidator;

  // AMD/CommonJS兼容
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputValidator;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return InputValidator; });
  }

})(typeof window !== 'undefined' ? window : this);
