/**
 * NEW标记自动消失功能
 * 新增内容标记7天后自动隐藏
 */
(function() {
  'use strict';
  
  // NEW标记配置
  var NEW_MARK_DAYS = 7;
  var STORAGE_KEY = 'new_items_hidden';
  
  // 隐藏过期的NEW标记
  function hideExpiredNewMarks() {
    var hiddenItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    var now = Date.now();
    var changed = false;
    
    // 检查是否需要隐藏
    Object.keys(hiddenItems).forEach(function(key) {
      if (hiddenItems[key] && now > hiddenItems[key]) {
        var el = document.querySelector('[data-new-id="' + key + '"]');
        if (el) {
          el.style.display = 'none';
        }
        delete hiddenItems[key];
        changed = true;
      }
    });
    
    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hiddenItems));
    }
  }
  
  // 标记元素为NEW（添加data属性供后续隐藏）
  window.markAsNew = function(elementOrSelector, itemId) {
    if (!itemId) {
      console.warn('markAsNew需要提供itemId参数');
      return;
    }
    
    var el = typeof elementOrSelector === 'string' 
      ? document.querySelector(elementOrSelector) 
      : elementOrSelector;
    
    if (!el) return;
    
    // 检查是否已过期
    var hiddenItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (hiddenItems[itemId] && Date.now() > hiddenItems[itemId]) {
      el.style.display = 'none';
      return;
    }
    
    // 设置过期时间
    var expiresAt = Date.now() + (NEW_MARK_DAYS * 24 * 60 * 60 * 1000);
    hiddenItems[itemId] = expiresAt;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hiddenItems));
    
    // 添加data属性
    el.setAttribute('data-new-id', itemId);
    
    // 如果已过期则隐藏
    if (Date.now() > expiresAt) {
      el.style.display = 'none';
    }
  };
  
  // 标记为已更新（立即生效，只保留视觉标记）
  window.markAsUpdated = function(elementOrSelector) {
    var el = typeof elementOrSelector === 'string' 
      ? document.querySelector(elementOrSelector) 
      : elementOrSelector;
    
    if (el) {
      el.classList.add('mark-updated');
      el.innerHTML = '已更新 ' + el.innerHTML;
    }
  };
  
  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideExpiredNewMarks);
  } else {
    hideExpiredNewMarks();
  }
})();

/**
 * 防抖/节流工具
 */
var Debounce = {
  // 防抖函数
  debounce: function(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  },
  
  // 节流函数
  throttle: function(func, wait) {
    var lastTime = 0;
    return function() {
      var now = Date.now();
      if (now - lastTime >= wait) {
        func.apply(this, arguments);
        lastTime = now;
      }
    };
  }
};

/**
 * localStorage数据隔离（多标签页）
 */
(function() {
  // 监听其他标签页的修改
  window.addEventListener('storage', function(e) {
    if (e.key && e.key.startsWith('study_')) {
      // 触发自定义事件通知页面更新
      window.dispatchEvent(new CustomEvent('dataChanged', {
        detail: { key: e.key, value: e.newValue }
      }));
    }
  });
  
  // 数据版本控制（防止旧数据覆盖）
  var DATA_VERSION = 'v2';
  
  window.getStorageData = function(key, defaultValue) {
    try {
      var data = localStorage.getItem(key);
      if (!data) return defaultValue;
      
      var parsed = JSON.parse(data);
      // 如果数据有版本号且版本不同，尝试迁移
      if (parsed._version && parsed._version !== DATA_VERSION) {
        // 这里可以添加数据迁移逻辑
        parsed._version = DATA_VERSION;
      }
      return parsed;
    } catch (e) {
      return defaultValue;
    }
  };
  
  window.setStorageData = function(key, value) {
    try {
      var data = typeof value === 'object' ? value : { value: value };
      data._version = DATA_VERSION;
      data._updated = Date.now();
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('存储失败:', e);
      return false;
    }
  };
})();
