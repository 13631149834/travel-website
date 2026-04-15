/**
 * 推送设置模块 - Push Settings Module
 * 游导旅游平台
 * 功能：推送开关、类型选择、免打扰时段、频率控制
 */

class PushSettings {
  constructor() {
    this.storageKey = 'youdau_push_settings';
    this.settings = this.getDefaultSettings();
    this.browserPush = null;
    this.init();
  }

  // 初始化
  init() {
    this.loadSettings();
    
    if (window.BrowserPush) {
      this.browserPush = new BrowserPush();
    }

    // 监听设置变更
    this.setupListeners();
  }

  // 获取默认设置
  getDefaultSettings() {
    return {
      // 基础开关
      enabled: true,
      browser: true,
      inApp: true,
      sound: true,
      vibration: true,

      // 推送类型开关
      types: {
        booking: {
          enabled: true,
          label: '预约提醒',
          description: '导游预约成功、变更、取消等通知',
          icon: '📅'
        },
        payment: {
          enabled: true,
          label: '支付提醒',
          description: '订单支付、退款到账等通知',
          icon: '💳'
        },
        activity: {
          enabled: true,
          label: '活动通知',
          description: '平台活动、优惠促销等通知',
          icon: '🎉'
        },
        system: {
          enabled: true,
          label: '系统公告',
          description: '重要系统通知、安全提醒等',
          icon: '🔔'
        },
        interactive: {
          enabled: true,
          label: '互动消息',
          description: '评价、点赞、评论、关注等通知',
          icon: '💬'
        }
      },

      // 免打扰时段
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        label: '免打扰时段'
      },

      // 推送频率
      frequency: {
        maxPerDay: 20,          // 每日最大推送数
        maxPerHour: 5,          // 每小时最大推送数
        minInterval: 60,        // 最小推送间隔（秒）
        batchMode: false        // 是否合并推送
      },

      // 接收渠道
      channels: {
        browser: {
          enabled: true,
          permission: 'default' // default, granted, denied
        },
        email: {
          enabled: false,
          address: ''
        },
        sms: {
          enabled: false,
          phone: ''
        }
      },

      // 高级设置
      advanced: {
        showPreview: true,        // 通知预览
        requireInteraction: false, // 需用户交互才关闭
        priorityMode: 'balanced', // balanced, performance, battery
        dataRetention: 30          // 数据保留天数
      },

      // 统计信息
      stats: {
        totalReceived: 0,
        lastUpdated: null,
        firstEnabled: null
      }
    };
  }

  // 加载设置
  loadSettings() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 合并默认设置，确保新字段存在
        this.settings = this.mergeSettings(this.getDefaultSettings(), parsed);
      }
    } catch (error) {
      console.error('加载设置失败:', error);
      this.settings = this.getDefaultSettings();
    }
    return this.settings;
  }

  // 合并设置
  mergeSettings(defaults, stored) {
    const merged = { ...defaults };

    for (const key in stored) {
      if (typeof stored[key] === 'object' && stored[key] !== null && !Array.isArray(stored[key])) {
        merged[key] = { ...defaults[key], ...stored[key] };
        
        // 深度合并类型设置
        if (key === 'types') {
          for (const typeKey in stored[key]) {
            if (defaults.types[typeKey]) {
              merged.types[typeKey] = { ...defaults.types[typeKey], ...stored[key][typeKey] };
            }
          }
        }
      } else {
        merged[key] = stored[key];
      }
    }

    return merged;
  }

  // 保存设置
  saveSettings() {
    try {
      this.settings.stats.lastUpdated = Date.now();
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
      
      // 触发设置变更事件
      window.dispatchEvent(new CustomEvent('push:settingsChanged', { 
        detail: this.settings 
      }));
      
      return true;
    } catch (error) {
      console.error('保存设置失败:', error);
      return false;
    }
  }

  // 重置设置
  resetSettings() {
    this.settings = this.getDefaultSettings();
    this.saveSettings();
    return this.settings;
  }

  // ========== 设置操作 ==========

  // 启用/禁用推送
  setEnabled(enabled) {
    this.settings.enabled = enabled;
    
    if (!enabled) {
      // 禁用时取消浏览器订阅
      if (this.browserPush?.isSubscribed()) {
        this.browserPush.unsubscribe();
      }
    }
    
    return this.saveSettings();
  }

  // 切换类型开关
  toggleType(type, enabled) {
    if (this.settings.types[type]) {
      this.settings.types[type].enabled = enabled;
      return this.saveSettings();
    }
    return false;
  }

  // 设置免打扰时段
  setQuietHours(enabled, start, end) {
    this.settings.quietHours.enabled = enabled;
    if (start !== undefined) this.settings.quietHours.start = start;
    if (end !== undefined) this.settings.quietHours.end = end;
    return this.saveSettings();
  }

  // 设置推送频率
  setFrequency(frequency) {
    this.settings.frequency = {
      ...this.settings.frequency,
      ...frequency
    };
    return this.saveSettings();
  }

  // 设置渠道
  setChannel(channel, options) {
    if (this.settings.channels[channel]) {
      this.settings.channels[channel] = {
        ...this.settings.channels[channel],
        ...options
      };
      return this.saveSettings();
    }
    return false;
  }

  // 设置高级选项
  setAdvanced(key, value) {
    if (this.settings.advanced.hasOwnProperty(key)) {
      this.settings.advanced[key] = value;
      return this.saveSettings();
    }
    return false;
  }

  // ========== 浏览器推送 ==========

  // 请求浏览器推送权限
  async requestBrowserPermission() {
    if (!this.browserPush) {
      return { success: false, error: 'BrowserPush 未初始化' };
    }

    const result = await this.browserPush.requestPermission();
    
    if (result.success) {
      this.settings.channels.browser.permission = 'granted';
      this.settings.channels.browser.enabled = true;
      if (!this.settings.stats.firstEnabled) {
        this.settings.stats.firstEnabled = Date.now();
      }
      this.saveSettings();
    } else {
      this.settings.channels.browser.permission = 'denied';
      this.saveSettings();
    }

    return result;
  }

  // 获取浏览器推送状态
  getBrowserPushStatus() {
    if (!this.browserPush) {
      return { supported: false };
    }
    return {
      supported: this.browserPush.isSupported,
      permission: this.browserPush.getPermissionState(),
      subscribed: this.browserPush.isSubscribed()
    };
  }

  // ========== 设置验证 ==========

  // 验证设置
  validateSettings(settings = this.settings) {
    const errors = [];

    // 验证免打扰时段
    if (settings.quietHours.enabled) {
      if (!this.isValidTime(settings.quietHours.start)) {
        errors.push('免打扰开始时间格式不正确');
      }
      if (!this.isValidTime(settings.quietHours.end)) {
        errors.push('免打扰结束时间格式不正确');
      }
    }

    // 验证频率设置
    if (settings.frequency.maxPerDay < 1) {
      errors.push('每日最大推送数必须大于0');
    }
    if (settings.frequency.maxPerHour < 1) {
      errors.push('每小时最大推送数必须大于0');
    }
    if (settings.frequency.minInterval < 1) {
      errors.push('最小推送间隔必须大于0秒');
    }

    // 验证邮箱格式
    if (settings.channels.email.enabled && settings.channels.email.address) {
      if (!this.isValidEmail(settings.channels.email.address)) {
        errors.push('邮箱格式不正确');
      }
    }

    // 验证手机号格式
    if (settings.channels.sms.enabled && settings.channels.sms.phone) {
      if (!this.isValidPhone(settings.channels.sms.phone)) {
        errors.push('手机号格式不正确');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 验证时间格式
  isValidTime(time) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
  }

  // 验证邮箱
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // 验证手机号
  isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  }

  // ========== 频率控制 ==========

  // 检查是否可以推送
  canSend() {
    if (!this.settings.enabled) return { can: false, reason: '推送已关闭' };

    // 检查免打扰时段
    if (this.isInQuietHours()) {
      return { can: false, reason: '免打扰时段' };
    }

    // 检查频率限制
    const todayCount = this.getTodaySendCount();
    if (todayCount >= this.settings.frequency.maxPerDay) {
      return { can: false, reason: '已达到每日推送上限' };
    }

    const hourCount = this.getHourSendCount();
    if (hourCount >= this.settings.frequency.maxPerHour) {
      return { can: false, reason: '已达到每小时推送上限' };
    }

    // 检查最小间隔
    const lastSend = this.getLastSendTime();
    if (lastSend && (Date.now() - lastSend) < this.settings.frequency.minInterval * 1000) {
      return { can: false, reason: '推送间隔过短' };
    }

    return { can: true };
  }

  // 检查是否在免打扰时段
  isInQuietHours() {
    if (!this.settings.quietHours.enabled) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [startH, startM] = this.settings.quietHours.start.split(':').map(Number);
    const [endH, endM] = this.settings.quietHours.end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // 跨天情况（如 22:00 - 08:00）
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
    
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  // 获取今日发送数
  getTodaySendCount() {
    const today = new Date().toDateString();
    const count = parseInt(localStorage.getItem('youdau_push_today_count') || '0');
    const storedDate = localStorage.getItem('youdau_push_count_date');

    if (storedDate !== today) {
      // 新的一天，重置计数
      localStorage.setItem('youdau_push_today_count', '0');
      localStorage.setItem('youdau_push_count_date', today);
      return 0;
    }

    return count;
  }

  // 获取本小时发送数
  getHourSendCount() {
    const hour = new Date().getHours();
    const storedHour = localStorage.getItem('youdau_push_hour');
    const count = parseInt(localStorage.getItem('youdau_push_hour_count') || '0');

    if (storedHour !== String(hour)) {
      localStorage.setItem('youdau_push_hour', String(hour));
      localStorage.setItem('youdau_push_hour_count', '0');
      return 0;
    }

    return count;
  }

  // 获取上次发送时间
  getLastSendTime() {
    return parseInt(localStorage.getItem('youdau_push_last_send') || '0');
  }

  // 记录发送
  recordSend() {
    const now = Date.now();
    
    // 更新计数
    const todayCount = this.getTodaySendCount();
    localStorage.setItem('youdau_push_today_count', String(todayCount + 1));

    const hourCount = this.getHourSendCount();
    localStorage.setItem('youdau_push_hour_count', String(hourCount + 1));

    // 更新最后发送时间
    localStorage.setItem('youdau_push_last_send', String(now));

    // 更新统计
    this.settings.stats.totalReceived++;
    this.settings.stats.lastUpdated = now;
    this.saveSettings();
  }

  // ========== 导出/导入 ==========

  // 导出设置
  exportSettings() {
    return JSON.stringify(this.settings, null, 2);
  }

  // 导入设置
  importSettings(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      const merged = this.mergeSettings(this.getDefaultSettings(), imported);
      this.settings = merged;
      this.saveSettings();
      return { success: true, settings: this.settings };
    } catch (error) {
      return { success: false, error: 'JSON 格式错误' };
    }
  }

  // ========== 监听器 ==========

  setupListeners() {
    // 监听标签页可见性变化，更新免打扰时段状态
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // 页面可见时检查设置变更
        this.loadSettings();
      }
    });

    // 监听系统通知权限变更
    if ('Notification' in window) {
      setInterval(() => {
        const currentPermission = Notification.permission;
        if (this.settings.channels.browser.permission !== currentPermission) {
          this.settings.channels.browser.permission = currentPermission;
          this.saveSettings();
          window.dispatchEvent(new CustomEvent('push:permissionChanged', {
            detail: { permission: currentPermission }
          }));
        }
      }, 5000);
    }
  }

  // ========== 获取完整设置 ==========

  getSettings() {
    return { ...this.settings };
  }

  // 获取类型设置
  getTypeSettings(type) {
    return this.settings.types[type] || null;
  }

  // 获取所有启用的类型
  getEnabledTypes() {
    return Object.entries(this.settings.types)
      .filter(([_, config]) => config.enabled)
      .map(([type, _]) => type);
  }
}

// 导出全局实例
window.PushSettings = PushSettings;
