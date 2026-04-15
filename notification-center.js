/**
 * 通知中心模块 - Notification Center Module
 * 游导旅游平台
 * 功能：通知列表渲染、一键已读、通知删除、通知数量徽章
 */

class NotificationCenter {
  constructor() {
    this.storageKey = 'youdau_notifications';
    this.settingsKey = 'youdau_notification_settings';
    this.notifications = [];
    this.settings = this.getDefaultSettings();
    this.currentFilter = 'all';
    this.currentTab = 'all';
    this.isSupported = 'Notification' in window;
    this.init();
  }

  // 默认设置
  getDefaultSettings() {
    return {
      browser: true,
      inApp: true,
      sound: true,
      email: false,
      system: true,
      activity: true,
      order: true,
      reminder: true,
      evaluation: true,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      emailAddress: '',
      lastClean: Date.now()
    };
  }

  // 初始化
  init() {
    this.loadNotifications();
    this.loadSettings();
    this.setupBrowserNotification();
  }

  // ========== 数据管理 ==========

  loadNotifications() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.notifications = stored ? JSON.parse(stored) : this.getSampleNotifications();
      if (!stored && this.notifications.length === 0) {
        this.notifications = this.getSampleNotifications();
        this.saveNotifications();
      }
    } catch (e) {
      this.notifications = [];
    }
  }

  // 示例通知数据
  getSampleNotifications() {
    const now = Date.now();
    return [
      {
        id: this.generateId(),
        type: 'system',
        title: '欢迎使用游导旅游',
        content: '感谢您选择游导旅游平台，祝您旅途愉快！我们为您准备了新用户专享优惠，快去看看吧。',
        timestamp: now - 1000 * 60 * 5,
        read: false,
        url: 'activities.html',
        icon: '👋'
      },
      {
        id: this.generateId(),
        type: 'order',
        title: '导游预约成功',
        content: '您预约的张导已确认，明日10:00在故宫门口集合，请提前15分钟到达。',
        timestamp: now - 1000 * 60 * 30,
        read: false,
        url: 'orders.html',
        icon: '✅'
      },
      {
        id: this.generateId(),
        type: 'activity',
        title: '新用户专享优惠',
        content: '首次预约立减50元，限时一周，快来抢购吧！优惠券已发放到您的账户。',
        timestamp: now - 1000 * 60 * 60 * 2,
        read: true,
        url: 'activities.html',
        icon: '🎁'
      },
      {
        id: this.generateId(),
        type: 'reminder',
        title: '行程提醒',
        content: '明天有导游预约，请提前确认行程安排。记得查看天气情况。',
        timestamp: now - 1000 * 60 * 60 * 24,
        read: true,
        url: 'my-bookings.html',
        icon: '⏰'
      },
      {
        id: this.generateId(),
        type: 'system',
        title: '账户安全提醒',
        content: '您的账户在新的设备上登录，如非本人操作请及时修改密码。',
        timestamp: now - 1000 * 60 * 60 * 48,
        read: true,
        url: 'profile.html',
        icon: '🔒'
      },
      {
        id: this.generateId(),
        type: 'order',
        title: '订单已完成',
        content: '您的导游服务已完成，欢迎对本次服务进行评价，您的反馈对我们很重要。',
        timestamp: now - 1000 * 60 * 60 * 72,
        read: true,
        url: 'orders.html',
        icon: '📝'
      },
      {
        id: this.generateId(),
        type: 'evaluation',
        title: '评价提醒',
        content: '您有一笔订单等待评价，完成评价可获得50积分奖励。',
        timestamp: now - 1000 * 60 * 60 * 96,
        read: false,
        url: 'orders.html',
        icon: '⭐'
      },
      {
        id: this.generateId(),
        type: 'activity',
        title: '春季特惠活动开启',
        content: '春季限时特惠，精选路线8折起，报名即送旅行周边礼包。',
        timestamp: now - 1000 * 60 * 60 * 120,
        read: true,
        url: 'activities.html',
        icon: '🌸'
      }
    ];
  }

  saveNotifications() {
    try {
      if (this.notifications.length > 100) {
        this.notifications = this.notifications.slice(-100);
      }
      localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
      this.updateBadge();
    } catch (e) {
      console.warn('通知存储失败:', e);
    }
  }

  loadSettings() {
    try {
      const stored = localStorage.getItem(this.settingsKey);
      if (stored) {
        const saved = JSON.parse(stored);
        this.settings = { ...this.getDefaultSettings(), ...saved };
      }
    } catch (e) {
      this.settings = this.getDefaultSettings();
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('设置保存失败:', e);
    }
  }

  // ========== 通知操作 ==========

  // 生成唯一ID
  generateId() {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 获取未读数量
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // 获取各类型数量
  getCountByType(type) {
    if (type === 'all') return this.notifications.length;
    return this.notifications.filter(n => n.type === type).length;
  }

  // 标记单条已读
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true;
      this.saveNotifications();
      this.updateBadge();
      return true;
    }
    return false;
  }

  // 标记全部已读
  markAllAsRead() {
    this.notifications.forEach(n => {
      n.read = true;
    });
    this.saveNotifications();
    this.updateBadge();
  }

  // 删除通知
  deleteNotification(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.saveNotifications();
      return true;
    }
    return false;
  }

  // 清空所有通知
  clearAll() {
    this.notifications = [];
    this.saveNotifications();
  }

  // 清空已读通知
  clearRead() {
    this.notifications = this.notifications.filter(n => !n.read);
    this.saveNotifications();
  }

  // 创建通知
  createNotification(type, title, content, options = {}) {
    const notification = {
      id: this.generateId(),
      type: type,
      title: title,
      content: content,
      timestamp: Date.now(),
      read: false,
      url: options.url || null,
      icon: options.icon || this.getTypeIcon(type)
    };

    this.notifications.unshift(notification);
    this.saveNotifications();

    // 浏览器通知
    if (this.shouldSendBrowserNotification(type)) {
      this.sendBrowserNotification(title, {
        body: content,
        tag: `travel-${type}-${notification.id}`,
        url: options.url
      });
    }

    // 显示站内Toast
    if (this.settings.inApp) {
      this.showToast(notification);
    }

    return notification;
  }

  // 是否发送浏览器通知
  shouldSendBrowserNotification(type) {
    const typeMap = {
      'system': this.settings.system,
      'activity': this.settings.activity,
      'order': this.settings.order,
      'reminder': this.settings.reminder,
      'evaluation': this.settings.evaluation
    };
    
    // 检查免打扰时段
    if (this.settings.quietHoursEnabled && this.isInQuietHours()) {
      return false;
    }
    
    return typeMap[type] && this.settings.browser && Notification.permission === 'granted';
  }

  // 是否在免打扰时段
  isInQuietHours() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = this.settings.quietHoursStart.split(':').map(Number);
    const [endH, endM] = this.settings.quietHoursEnd.split(':').map(Number);
    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  // 获取类型图标
  getTypeIcon(type) {
    const icons = {
      system: '⚙️',
      activity: '🎉',
      order: '📦',
      reminder: '⏰',
      evaluation: '⭐'
    };
    return icons[type] || '🔔';
  }

  // 获取类型名称
  getTypeName(type) {
    const names = {
      system: '系统通知',
      activity: '活动通知',
      order: '预约提醒',
      reminder: '行程提醒',
      evaluation: '评价提醒'
    };
    return names[type] || '通知';
  }

  // ========== 浏览器通知 ==========

  setupBrowserNotification() {
    if (!this.isSupported) return;
    
    if (Notification.permission === 'default') {
      // 可以提示用户开启通知
      console.log('通知权限待授权');
    }
  }

  async requestPermission() {
    if (!this.isSupported) return false;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async sendBrowserNotification(title, options = {}) {
    if (!this.isSupported || !this.settings.browser) return;
    if (Notification.permission !== 'granted') return;

    const notification = new Notification(title, {
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>',
      tag: options.tag || 'travel-notification',
      requireInteraction: options.requireInteraction || false,
      silent: !this.settings.sound,
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.url) {
        window.location.href = options.url;
      }
    };

    return notification;
  }

  // ========== Toast 提示 ==========

  createToastContainer() {
    if (document.getElementById('notification-toast-container')) return;
    
    const container = document.createElement('div');
    container.id = 'notification-toast-container';
    container.className = 'notification-toast-container';
    document.body.appendChild(container);
  }

  showToast(notification) {
    this.createToastContainer();
    const container = document.getElementById('notification-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `notification-toast notification-toast-${notification.type}`;
    toast.dataset.id = notification.id;
    toast.innerHTML = `
      <div class="toast-icon">${notification.icon}</div>
      <div class="toast-content">
        <div class="toast-title">${notification.title}</div>
        <div class="toast-text">${notification.content}</div>
      </div>
      <button class="toast-close" aria-label="关闭">&times;</button>
      ${notification.url ? `<a class="toast-link" href="${notification.url}">查看详情</a>` : ''}
    `;

    container.appendChild(toast);

    // 入场动画
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // 关闭按钮
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.hideToast(toast);
    });

    // 标记已读
    toast.addEventListener('click', (e) => {
      if (!e.target.classList.contains('toast-close') && !e.target.classList.contains('toast-link')) {
        this.markAsRead(notification.id);
        if (notification.url) {
          window.location.href = notification.url;
        }
      }
    });

    // 自动消失
    setTimeout(() => {
      this.hideToast(toast);
    }, 5000);
  }

  hideToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  // ========== 渲染 ==========

  // 更新时间显示
  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  // 渲染通知列表
  renderNotificationList(containerId, filter = 'all', readFilter = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let filtered = this.notifications;
    
    // 类型筛选
    if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }
    
    // 已读/未读筛选
    if (readFilter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (readFilter === 'read') {
      filtered = filtered.filter(n => n.read);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="notification-empty">
          <div class="icon">📭</div>
          <h3>暂无通知</h3>
          <p>您目前没有${filter === 'all' ? '' : this.getTypeName(filter)}相关通知</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(notification => `
      <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
        <div class="notification-icon-wrap ${notification.type}">
          ${notification.icon}
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <h4 class="notification-title">${notification.title}</h4>
            <span class="notification-time">${this.formatTime(notification.timestamp)}</span>
          </div>
          <p class="notification-text">${notification.content}</p>
          <span class="notification-tag ${notification.type}">${this.getTypeName(notification.type)}</span>
          <div class="notification-actions-btn">
            ${notification.url ? `<a href="${notification.url}" class="action-btn">查看详情</a>` : ''}
            <button class="action-btn ${notification.read ? '' : 'mark-read'}" data-action="toggle-read">${notification.read ? '标记未读' : '标记已读'}</button>
            <button class="action-btn delete" data-action="delete">删除</button>
          </div>
        </div>
      </div>
    `).join('');

    // 绑定事件
    this.bindNotificationEvents(container);
  }

  // 绑定通知项事件
  bindNotificationEvents(container) {
    // 点击整个通知项
    container.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.notification-actions-btn')) return;
        
        const id = item.dataset.id;
        const notification = this.notifications.find(n => n.id === id);
        
        if (notification) {
          this.markAsRead(id);
          item.classList.remove('unread');
          
          if (notification.url) {
            window.location.href = notification.url;
          }
        }
      });
    });

    // 操作按钮
    container.querySelectorAll('.notification-actions-btn button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = btn.closest('.notification-item');
        const id = item.dataset.id;
        const action = btn.dataset.action;

        if (action === 'toggle-read') {
          const notification = this.notifications.find(n => n.id === id);
          if (notification) {
            notification.read = !notification.read;
            this.saveNotifications();
            
            // 更新按钮文字
            btn.textContent = notification.read ? '标记未读' : '标记已读';
            item.classList.toggle('unread', !notification.read);
          }
        } else if (action === 'delete') {
          this.deleteNotification(id);
          item.style.animation = 'fadeOut 0.3s ease';
          setTimeout(() => {
            item.remove();
            this.updateEmptyState();
          }, 300);
        }
      });
    });
  }

  // 更新空状态
  updateEmptyState() {
    const container = document.getElementById('notification-list');
    if (!container) return;

    const filter = this.currentFilter;
    let filtered = this.notifications;
    
    if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="notification-empty">
          <div class="icon">📭</div>
          <h3>暂无通知</h3>
          <p>您目前没有${filter === 'all' ? '' : this.getTypeName(filter)}相关通知</p>
        </div>
      `;
    }
  }

  // 更新徽章
  updateBadge() {
    const badges = document.querySelectorAll('.notification-badge');
    const count = this.getUnreadCount();
    
    badges.forEach(badge => {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.remove('zero');
      } else {
        badge.textContent = '0';
        badge.classList.add('zero');
      }
    });
  }

  // 更新侧边栏数量
  updateSidebarCounts() {
    const counts = {
      all: this.notifications.length,
      system: this.getCountByType('system'),
      order: this.getCountByType('order'),
      activity: this.getCountByType('activity'),
      reminder: this.getCountByType('reminder')
    };

    Object.keys(counts).forEach(type => {
      const countEl = document.querySelector(`.sidebar-menu [data-type="${type}"] .count`);
      if (countEl) {
        countEl.textContent = counts[type] || '0';
        countEl.classList.toggle('empty', counts[type] === 0);
      }
    });
  }

  // ========== 设置相关 ==========

  // 渲染设置页面
  renderSettings() {
    // 渲染通知开关
    const toggles = ['browser', 'inApp', 'sound', 'email'];
    toggles.forEach(key => {
      const toggle = document.getElementById(`toggle-${key}`);
      if (toggle) {
        toggle.checked = this.settings[key];
        toggle.addEventListener('change', (e) => {
          this.settings[key] = e.target.checked;
          this.saveSettings();
        });
      }
    });

    // 渲染通知类型
    const types = ['system', 'activity', 'order', 'reminder', 'evaluation'];
    types.forEach(type => {
      const toggle = document.getElementById(`toggle-type-${type}`);
      if (toggle) {
        toggle.checked = this.settings[type];
        toggle.addEventListener('change', (e) => {
          this.settings[type] = e.target.checked;
          this.saveSettings();
        });
      }
    });

    // 渲染免打扰时段
    const quietToggle = document.getElementById('toggle-quiet');
    const quietTimeRange = document.getElementById('quiet-time-range');
    
    if (quietToggle) {
      quietToggle.checked = this.settings.quietHoursEnabled;
      quietToggle.addEventListener('change', (e) => {
        this.settings.quietHoursEnabled = e.target.checked;
        this.saveSettings();
        if (quietTimeRange) {
          quietTimeRange.style.opacity = e.target.checked ? '1' : '0.5';
          quietTimeRange.style.pointerEvents = e.target.checked ? 'auto' : 'none';
        }
      });
    }

    if (quietTimeRange) {
      quietTimeRange.style.opacity = this.settings.quietHoursEnabled ? '1' : '0.5';
      quietTimeRange.style.pointerEvents = this.settings.quietHoursEnabled ? 'auto' : 'none';
    }

    const startTime = document.getElementById('quiet-start');
    const endTime = document.getElementById('quiet-end');
    
    if (startTime) {
      startTime.value = this.settings.quietHoursStart;
      startTime.addEventListener('change', (e) => {
        this.settings.quietHoursStart = e.target.value;
        this.saveSettings();
      });
    }
    
    if (endTime) {
      endTime.value = this.settings.quietHoursEnd;
      endTime.addEventListener('change', (e) => {
        this.settings.quietHoursEnd = e.target.value;
        this.saveSettings();
      });
    }

    // 渲染邮箱
    const emailInput = document.getElementById('email-address');
    if (emailInput) {
      emailInput.value = this.settings.emailAddress || '';
      emailInput.addEventListener('change', (e) => {
        this.settings.emailAddress = e.target.value;
        this.saveSettings();
      });
    }
  }

  // ========== 工具方法 ==========

  // 模拟新通知（用于测试）
  simulateNewNotification() {
    const types = ['system', 'order', 'activity', 'reminder', 'evaluation'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const sampleData = {
      system: { title: '系统升级通知', content: '平台将于今晚23:00-次日01:00进行系统升级，请提前做好准备。', icon: '🔧' },
      order: { title: '新的预约请求', content: '您有一笔新的导游预约请求，请尽快确认。', icon: '📋' },
      activity: { title: '限时优惠活动', content: '【限时】今日报名享受8折优惠，名额有限，先到先得！', icon: '🔥' },
      reminder: { title: '行程即将开始', content: '您预约的导游行程将在2小时后开始，请做好准备。', icon: '⏰' },
      evaluation: { title: '服务评价提醒', content: '您对本次导游服务的评价还未提交，请给出您的宝贵意见。', icon: '⭐' }
    };

    const data = sampleData[type];
    this.createNotification(type, data.title, data.content, { icon: data.icon });
  }
}

// ========== 全局实例 ==========
window.NotificationCenter = NotificationCenter;

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  // 延迟初始化确保DOM已加载
  setTimeout(() => {
    if (typeof window.notificationCenter === 'undefined') {
      window.notificationCenter = new NotificationCenter();
    }
  }, 100);
});

// 添加淡出动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    to {
      opacity: 0;
      transform: translateX(-20px);
    }
  }
`;
document.head.appendChild(style);
