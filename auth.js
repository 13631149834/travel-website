/**
 * 会员激活鉴权系统 v2
 * - 激活码有效期1年，到期需续费
 * - 未激活用户只能访问首页和激活页
 */

(function() {
  var publicPages = ['index.html', 'activate.html', 'privacy.html', '404.html', ''];
  var path = window.location.pathname;
  var page = path.split('/').pop() || 'index.html';

  if (publicPages.indexOf(page) !== -1) return;

  var activated = localStorage.getItem('youdao_activated');
  var expireTime = localStorage.getItem('youdao_expire');

  // 未激活
  if (activated !== 'true' || !expireTime) {
    window.location.href = 'activate.html';
    return;
  }

  // 已过期
  var now = new Date().getTime();
  var expire = new Date(expireTime).getTime();
  if (now > expire) {
    localStorage.removeItem('youdao_activated');
    localStorage.removeItem('youdao_expire');
    localStorage.setItem('youdao_expired', 'true');
    window.location.href = 'activate.html';
  }
})();

/**
 * 验证激活码
 */
function verifyCode(code) {
  if (!code) return false;
  code = code.trim().toUpperCase();
  var pattern = /^XM2026-[A-Z0-9]{4}$/;
  if (!pattern.test(code)) return false;
  var suffix = code.split('-')[1];
  var sum = 0;
  for (var i = 0; i < suffix.length; i++) {
    sum += suffix.charCodeAt(i);
  }
  return sum % 2 === 0;
}

/**
 * 激活 - 有效期1年
 */
function doActivate(code) {
  if (!verifyCode(code)) return false;

  var now = new Date();
  var expire = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  localStorage.setItem('youdao_activated', 'true');
  localStorage.setItem('youdao_activate_time', now.toISOString());
  localStorage.setItem('youdao_expire', expire.toISOString());
  localStorage.setItem('youdao_code', code.trim().toUpperCase());
  localStorage.removeItem('youdao_expired');
  return true;
}

/**
 * 检查激活状态
 */
function isActivated() {
  var activated = localStorage.getItem('youdao_activated');
  var expireTime = localStorage.getItem('youdao_expire');
  if (activated !== 'true' || !expireTime) return false;
  var now = new Date().getTime();
  var expire = new Date(expireTime).getTime();
  return now <= expire;
}

/**
 * 获取到期日期
 */
function getExpireDate() {
  var expireTime = localStorage.getItem('youdao_expire');
  if (!expireTime) return null;
  var d = new Date(expireTime);
  return d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日';
}

/**
 * 获取剩余天数
 */
function getRemainDays() {
  var expireTime = localStorage.getItem('youdao_expire');
  if (!expireTime) return 0;
  var now = new Date().getTime();
  var expire = new Date(expireTime).getTime();
  var days = Math.ceil((expire - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

/**
 * 生成激活码
 */
function generateCode() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var suffix = '';
  var sum = 0;
  for (var i = 0; i < 3; i++) {
    var c = chars[Math.floor(Math.random() * chars.length)];
    suffix += c;
    sum += c.charCodeAt(0);
  }
  var lastChars = chars.split('').filter(function(ch) {
    return (sum + ch.charCodeAt(0)) % 2 === 0;
  });
  suffix += lastChars[Math.floor(Math.random() * lastChars.length)];
  return 'XM2026-' + suffix;
}

/**
 * 精致化5.0 - 激活码防重复使用增强
 */
(function() {
  'use strict';
  
  // 已使用激活码黑名单（存储最后使用的5个，防止同一设备重复使用）
  var USED_CODES_KEY = 'youdao_used_codes';
  var MAX_USED_CODES = 5;
  
  // 记录已使用的激活码
  window.recordUsedCode = function(code) {
    try {
      var usedCodes = JSON.parse(localStorage.getItem(USED_CODES_KEY) || '[]');
      var upperCode = code.trim().toUpperCase();
      
      // 检查是否已使用
      if (usedCodes.indexOf(upperCode) !== -1) {
        return false; // 已使用过
      }
      
      // 添加到已使用列表
      usedCodes.unshift(upperCode);
      
      // 保持最大数量
      if (usedCodes.length > MAX_USED_CODES) {
        usedCodes = usedCodes.slice(0, MAX_USED_CODES);
      }
      
      localStorage.setItem(USED_CODES_KEY, JSON.stringify(usedCodes));
      return true;
    } catch (e) {
      console.warn('[Auth] 记录激活码失败:', e.message);
      return true; // 失败时允许使用
    }
  };
  
  // 检查激活码是否已使用
  window.isCodeUsed = function(code) {
    try {
      var usedCodes = JSON.parse(localStorage.getItem(USED_CODES_KEY) || '[]');
      var upperCode = code.trim().toUpperCase();
      return usedCodes.indexOf(upperCode) !== -1;
    } catch (e) {
      return false;
    }
  };
  
  // 获取已使用激活码列表（用于调试）
  window.getUsedCodes = function() {
    try {
      return JSON.parse(localStorage.getItem(USED_CODES_KEY) || '[]');
    } catch (e) {
      return [];
    }
  };
  
  // 增强doActivate函数（前置检查）
  var originalDoActivate = window.doActivate;
  window.doActivate = function(code) {
    // 精致化5.0: 激活前检查是否已使用
    if (window.isCodeUsed && window.isCodeUsed(code)) {
      console.warn('[Auth] 激活码已使用过:', code);
      return false;
    }
    
    // 执行原始激活逻辑
    var result = originalDoActivate ? originalDoActivate(code) : false;
    
    // 激活成功后记录
    if (result) {
      window.recordUsedCode(code);
    }
    
    return result;
  };
  
  // 激活码时效性验证（24小时内有效）
  var CODE_EXPIRY_KEY = 'youdao_code_expiry';
  window.setCodeExpiry = function(code, expiryHours) {
    try {
      var expiry = JSON.parse(localStorage.getItem(CODE_EXPIRY_KEY) || '{}');
      expiry[code.trim().toUpperCase()] = Date.now() + (expiryHours * 60 * 60 * 1000);
      localStorage.setItem(CODE_EXPIRY_KEY, JSON.stringify(expiry));
    } catch (e) {}
  };
  
  window.isCodeExpired = function(code) {
    try {
      var expiry = JSON.parse(localStorage.getItem(CODE_EXPIRY_KEY) || '{}');
      var codeUpper = code.trim().toUpperCase();
      if (expiry[codeUpper]) {
        return Date.now() > expiry[codeUpper];
      }
      return false; // 没有设置过期时间
    } catch (e) {
      return false;
    }
  };
  
  console.log('[Auth] 激活码防重复使用增强已加载');
})();
