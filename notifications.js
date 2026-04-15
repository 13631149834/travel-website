/**
 * 通知系统 - 核心模块
 * 支持：浏览器通知、站内消息、通知设置、历史记录
 */

class NotificationSystem {
  constructor() {
    this.storageKey = 'travel_notifications';
    this.settingsKey = 'notification_settings';
    this.notifications = [];
    this.settings = this.getDefaultSettings();
    this.isSupported = 'Notification' in window;
    this.init();
  }

  // 默认设置
  getDefaultSettings() {
    return {
      browser: true,           // 浏览器通知
      inApp: true,             // 站内消息
      system: true,            // 系统通知
      activity: true,          // 活动通知
      order: true,              // 订单通知
      reminder: true,           // 预约提醒
      sound: true,             // 声音提醒
      badge: true,             // 角标提醒
      lastClean: Date.now()    // 最后清理时间
    };
  }

  // 初始化
  init() {
    this.loadNotifications();
    this.loadSettings();
    this.setupBrowserNotification();
    this.createUI();
    this.renderNotificationBadge();
  }

  // 加载通知
  loadNotifications() {
    const stored = localStorage.getItem(this.storageKey);
    this.notifications = stored ? JSON.parse(stored) : [];
  }

  // 保存通知
  saveNotifications() {
    // 最多保存100条
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(-100);
    }
    localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
  }

  // 加载设置
  loadSettings() {
    const stored = localStorage.getItem(this.settingsKey);
    if (stored) {
      const saved = JSON.parse(stored);
      this.settings = { ...this.getDefaultSettings(), ...saved };
    }
  }

  // 保存设置
  saveSettings() {
    localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
  }

  // 设置浏览器通知权限
  async setupBrowserNotification() {
    if (!this.isSupported) return;
    
    if (Notification.permission === 'default') {
      // 可以在这里提示用户开启通知
    }
  }

  // 请求通知权限
  async requestPermission() {
    if (!this.isSupported) return false;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // 发送浏览器通知
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

  // 创建通知
  createNotification(type, title, content, options = {}) {
    const notification = {
      id: this.generateId(),
      type: type, // system, activity, order, reminder
      title: title,
      content: content,
      timestamp: Date.now(),
      read: false,
      url: options.url || null,
      icon: options.icon || this.getTypeIcon(type),
      sticky: options.sticky || false,
      duration: options.duration || 0 // 0表示不自动消失
    };

    this.notifications.unshift(notification);
    this.saveNotifications();
    this.renderNotificationBadge();

    // 浏览器通知
    if (this.shouldSendBrowserNotification(type)) {
      this.sendBrowserNotification(title, {
        body: content,
        tag: `travel-${type}-${notification.id}`,
        url: options.url
      });
    }

    // 显示站内弹窗
    if (this.settings.inApp && !notification.sticky) {
      this.showToast(notification);
    }

    // 触发回调
    if (options.onCreate) {
      options.onCreate(notification);
    }

    return notification;
  }

  // 是否发送浏览器通知
  shouldSendBrowserNotification(type) {
    const typeMap = {
      'system': this.settings.system,
      'activity': this.settings.activity,
      'order': this.settings.order,
      'reminder': this.settings.reminder
    };
    return typeMap[type] && this.settings.browser;
  }

  // 获取类型图标
  getTypeIcon(type) {
    const icons = {
      system: '⚙️',
      activity: '🎉',
      order: '📦',
      reminder: '⏰'
    };
    return icons[type] || '🔔';
  }

  // 显示Toast提示
  showToast(notification) {
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
      ${notification.url ? '<a class="toast-link" href="' + notification.url + '">查看详情</a>' : ''}
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

    // 自动消失
    if (notification.duration > 0) {
      setTimeout(() => {
        this.hideToast(toast);
      }, notification.duration);
    } else {
      // 默认5秒消失
      setTimeout(() => {
        this.hideToast(toast);
      }, 5000);
    }

    // 标记已读
    this.markAsRead(notification.id);
  }

  // 隐藏Toast
  hideToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }

  // 标记已读
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true;
      notification.readAt = Date.now();
      this.saveNotifications();
      this.renderNotificationBadge();
    }
  }

  // 标记所有已读
  markAllAsRead() {
    this.notifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        n.readAt = Date.now();
      }
    });
    this.saveNotifications();
    this.renderNotificationBadge();
    
    // 更新UI
    const items = document.querySelectorAll('.notification-item.unread');
    items.forEach(item => item.classList.remove('unread'));
  }

  // 删除通知
  deleteNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
    this.renderNotificationBadge();
  }

  // 清空所有通知
  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.renderNotificationBadge();
    this.settings.lastClean = Date.now();
    this.saveSettings();
  }

  // 获取未读数
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // 获取所有通知
  getAll() {
    return [...this.notifications];
  }

  // 按类型获取
  getByType(type) {
    return this.notifications.filter(n => n.type === type);
  }

  // 渲染角标
  renderNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (!badge) return;

    const count = this.getUnreadCount();
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  // 生成ID
  generateId() {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // ========== UI 相关 ==========

  // 创建UI
  createUI() {
    this.createToastContainer();
    this.createNotificationPanel();
    this.createNotificationButton();
  }

  // 创建Toast容器
  createToastContainer() {
    if (document.getElementById('notification-toast-container')) return;
    
    const container = document.createElement('div');
    container.id = 'notification-toast-container';
    container.className = 'notification-toast-container';
    document.body.appendChild(container);
  }

  // 创建通知面板
  createNotificationPanel() {
    if (document.getElementById('notification-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'notification-panel';
    panel.className = 'notification-panel';
    panel.innerHTML = this.getPanelTemplate();
    document.body.appendChild(panel);

    this.bindPanelEvents();
  }

  // 获取面板模板
  getPanelTemplate() {
    return `
      <div class="notification-panel-header">
        <h3>通知消息</h3>
        <div class="notification-panel-actions">
          <button class="btn-mark-all-read" data-i18n-title="标记全部已读">全部已读</button>
          <button class="btn-settings" aria-label="通知设置">⚙️</button>
          <button class="btn-close-panel" aria-label="关闭">&times;</button>
        </div>
      </div>
      <div class="notification-tabs">
        <button class="tab-btn active" data-tab="all">全部</button>
        <button class="tab-btn" data-tab="system">系统</button>
        <button class="tab-btn" data-tab="activity">活动</button>
        <button class="tab-btn" data-tab="order">订单</button>
        <button class="tab-btn" data-tab="reminder">提醒</button>
      </div>
      <div class="notification-list"></div>
      <div class="notification-settings-panel" style="display:none;">
        <h4>通知设置</h4>
        <div class="setting-item">
          <label>
            <input type="checkbox" id="setting-browser" ${this.settings.browser ? 'checked' : ''}>
            浏览器通知
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input type="checkbox" id="setting-inapp" ${this.settings.inApp ? 'checked' : ''}>
            站内消息
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input type="checkbox" id="setting-sound" ${this.settings.sound ? 'checked' : ''}>
            声音提醒
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input type="checkbox" id="setting-badge" ${this.settings.badge ? 'checked' : ''}>
            角标提醒
          </label>
        </div>
        <hr>
        <h5>通知类型</h5>
        <div class="setting-item">
          <label>
            <input type="checkbox" id="setting-system" ${this.settings.system ? 'checked' : ''}>
            系统通知
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input type="checkbox" id="setting-activity" ${this.settings.activity ? 'checked' : ''}>
            活动通知
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input type="checkbox" id="setting-order" ${this.settings.order ? 'checked' : ''}>
            订单通知
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input type="checkbox" id="setting-reminder" ${this.settings.reminder ? 'checked' : ''}>
            预约提醒
          </label>
        </div>
        <button class="btn-save-settings">保存设置</button>
        <button class="btn-clear-all">清空所有通知</button>
      </div>
    `;
  }

  // 绑定面板事件
  bindPanelEvents() {
    const panel = document.getElementById('notification-panel');
    if (!panel) return;

    // 关闭按钮
    panel.querySelector('.btn-close-panel')?.addEventListener('click', () => {
      this.closePanel();
    });

    // 标记全部已读
    panel.querySelector('.btn-mark-all-read')?.addEventListener('click', () => {
      this.markAllAsRead();
    });

    // 设置按钮
    panel.querySelector('.btn-settings')?.addEventListener('click', () => {
      const settingsPanel = panel.querySelector('.notification-settings-panel');
      settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    });

    // Tab切换
    panel.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        panel.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderNotificationList(btn.dataset.tab);
      });
    });

    // 设置保存
    panel.querySelector('.btn-save-settings')?.addEventListener('click', () => {
      this.saveSettingsFromPanel();
    });

    // 清空所有
    panel.querySelector('.btn-clear-all')?.addEventListener('click', () => {
      if (confirm('确定要清空所有通知吗？')) {
        this.clearAll();
        this.renderNotificationList('all');
      }
    });

    // 点击外部关闭
    panel.addEventListener('click', (e) => {
      if (e.target.classList.contains('notification-panel')) {
        this.closePanel();
      }
    });

    // ESC关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        this.closePanel();
      }
    });
  }

  // 从面板保存设置
  saveSettingsFromPanel() {
    this.settings.browser = document.getElementById('setting-browser')?.checked || false;
    this.settings.inApp = document.getElementById('setting-inapp')?.checked || false;
    this.settings.sound = document.getElementById('setting-sound')?.checked || false;
    this.settings.badge = document.getElementById('setting-badge')?.checked || false;
    this.settings.system = document.getElementById('setting-system')?.checked || false;
    this.settings.activity = document.getElementById('setting-activity')?.checked || false;
    this.settings.order = document.getElementById('setting-order')?.checked || false;
    this.settings.reminder = document.getElementById('setting-reminder')?.checked || false;
    this.saveSettings();

    // 如果开启浏览器通知但未授权
    if (this.settings.browser && Notification.permission !== 'granted') {
      this.requestPermission();
    }

    this.showToast({
      type: 'system',
      icon: '✅',
      title: '设置已保存',
      content: '您的通知设置已更新'
    });
  }

  // 创建通知按钮
  createNotificationButton() {
    if (document.querySelector('.notification-btn')) return;

    const navContainer = document.querySelector('.nav-container') || document.querySelector('.navbar .container');
    if (!navContainer) return;

    const btn = document.createElement('button');
    btn.className = 'notification-btn';
    btn.setAttribute('aria-label', '通知');
    btn.innerHTML = `
      <span class="notification-icon">🔔</span>
      <span class="notification-badge" style="display:none;">0</span>
    `;

    btn.addEventListener('click', () => {
      this.togglePanel();
    });

    // 插入到logo旁边
    const logo = navContainer.querySelector('.logo');
    if (logo && logo.nextSibling) {
      navContainer.insertBefore(btn, logo.nextSibling);
    } else if (logo) {
      logo.parentNode.appendChild(btn);
    } else {
      navContainer.appendChild(btn);
    }

    this.renderNotificationBadge();
  }

  // 切换面板
  togglePanel() {
    const panel = document.getElementById('notification-panel');
    if (!panel) return;

    const isOpen = panel.classList.toggle('open');
    if (isOpen) {
      this.renderNotificationList('all');
      // 恢复设置面板隐藏
      panel.querySelector('.notification-settings-panel').style.display = 'none';
    }
  }

  // 关闭面板
  closePanel() {
    const panel = document.getElementById('notification-panel');
    if (panel) {
      panel.classList.remove('open');
    }
  }

  // 渲染通知列表
  renderNotificationList(filter = 'all') {
    const container = document.querySelector('.notification-list');
    if (!container) return;

    let filtered = this.notifications;
    if (filter !== 'all') {
      filtered = this.notifications.filter(n => n.type === filter);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="notification-empty">
          <span class="empty-icon">📭</span>
          <p>暂无通知</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(notif => `
      <div class="notification-item ${notif.read ? '' : 'unread'}" data-id="${notif.id}">
        <div class="item-icon">${notif.icon}</div>
        <div class="item-content">
          <div class="item-header">
            <span class="item-type">${this.getTypeLabel(notif.type)}</span>
            <span class="item-time">${this.formatTime(notif.timestamp)}</span>
          </div>
          <div class="item-title">${notif.title}</div>
          <div class="item-text">${notif.content}</div>
          ${notif.url ? `<a href="${notif.url}" class="item-link">查看详情 →</a>` : ''}
        </div>
        <div class="item-actions">
          ${notif.read ? '' : '<button class="btn-mark-read" title="标记已读">✓</button>'}
          <button class="btn-delete" title="删除">🗑️</button>
        </div>
      </div>
    `).join('');

    // 绑定事件
    container.querySelectorAll('.notification-item').forEach(item => {
      const id = item.dataset.id;

      item.querySelector('.btn-mark-read')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.markAsRead(id);
        item.classList.remove('unread');
        item.querySelector('.btn-mark-read')?.remove();
      });

      item.querySelector('.btn-delete')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteNotification(id);
        item.remove();
        if (document.querySelectorAll('.notification-item').length === 0) {
          this.renderNotificationList(filter);
        }
      });

      // 点击跳转到链接
      if (notif.url) {
        item.addEventListener('click', (e) => {
          if (!e.target.closest('.item-actions')) {
            this.markAsRead(id);
            window.location.href = notif.url;
          }
        });
      }
    });
  }

  // 获取类型标签
  getTypeLabel(type) {
    const labels = {
      system: '系统',
      activity: '活动',
      order: '订单',
      reminder: '提醒'
    };
    return labels[type] || '通知';
  }

  // 格式化时间
  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return '刚刚';
    if (diff < hour) return Math.floor(diff / minute) + '分钟前';
    if (diff < day) return Math.floor(diff / hour) + '小时前';
    if (diff < 7 * day) return Math.floor(diff / day) + '天前';
    
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  // ========== 便捷方法 ==========

  // 系统通知
  systemNotify(title, content, options) {
    return this.createNotification('system', title, content, options);
  }

  // 活动通知
  activityNotify(title, content, options) {
    return this.createNotification('activity', title, content, options);
  }

  // 订单通知
  orderNotify(title, content, options) {
    return this.createNotification('order', title, content, options);
  }

  // 预约提醒
  reminderNotify(title, content, options) {
    return this.createNotification('reminder', title, content, options);
  }
}

// 全局实例
let notificationSystem;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  notificationSystem = new NotificationSystem();
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationSystem;
}
