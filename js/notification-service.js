/**
 * 通知服务 (Notification Service)
 * 独立的通知管理服务，支持：
 * - 通知数据管理
 * - 浏览器原生通知
 * - 本地存储持久化
 * - 下拉面板组件
 */

class NotificationService {
  constructor() {
    this.storageKey = 'youdau_notifications';
    this.settingsKey = 'youdau_notification_settings';
    this.notifications = [];
    this.settings = this.getDefaultSettings();
    this.isSupported = 'Notification' in window;
    this.dropDownPanel = null;
    this.init();
  }

  // 默认设置
  getDefaultSettings() {
    return {
      browser: true,        // 浏览器通知
      inApp: true,          // 站内消息
      system: true,         // 系统通知
      activity: true,       // 活动通知
      order: true,          // 订单通知
      reminder: true,       // 预约提醒
      sound: true,          // 声音提醒
      badge: true,          // 角标提醒
      lastClean: Date.now()
    };
  }

  // 初始化
  init() {
    this.loadNotifications();
    this.loadSettings();
    this.createToastContainer();
    this.createDropdownPanel();
    this.updateBadge();
  }

  // ========== 数据管理 ==========

  // 加载通知
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
        content: '感谢您选择游导旅游平台，祝您旅途愉快！',
        timestamp: now - 1000 * 60 * 5,
        read: false,
        url: null,
        icon: '👋'
      },
      {
        id: this.generateId(),
        type: 'order',
        title: '导游预约成功',
        content: '您预约的张导已确认，明日10:00在故宫门口集合。',
        timestamp: now - 1000 * 60 * 30,
        read: false,
        url: 'orders.html',
        icon: '✅'
      },
      {
        id: this.generateId(),
        type: 'activity',
        title: '新用户专享优惠',
        content: '首次预约立减50元，限时一周，快来抢购吧！',
        timestamp: now - 1000 * 60 * 60 * 2,
        read: true,
        url: 'activities.html',
        icon: '🎁'
      },
      {
        id: this.generateId(),
        type: 'reminder',
        title: '行程提醒',
        content: '明天有导游预约，请提前确认行程安排。',
        timestamp: now - 1000 * 60 * 60 * 24,
        read: true,
        url: 'routes.html',
        icon: '⏰'
      }
    ];
  }

  // 保存通知
  saveNotifications() {
    try {
      if (this.notifications.length > 100) {
        this.notifications = this.notifications.slice(-100);
      }
      localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
    } catch (e) {
      console.warn('通知存储失败:', e);
    }
  }

  // 加载设置
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

  // 保存设置
  saveSettings() {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('设置保存失败:', e);
    }
  }

  // ========== 通知操作 ==========

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
      icon: options.icon || this.getTypeIcon(type),
      sticky: options.sticky || false,
      duration: options.duration || 5000
    };

    this.notifications.unshift(notification);
    this.saveNotifications();
    this.updateBadge();
    this.renderDropdownList();

    // 浏览器通知
    if (this.shouldSendBrowserNotification(type)) {
      this.sendBrowserNotification(title, {
        body: content,
        tag: `youdau-${type}-${notification.id}`,
        url: options.url
      });
    }

    // Toast提示
    if (this.settings.inApp && !notification.sticky) {
      this.showToast(notification);
    }

    return notification;
  }

  // 标记已读
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true;
      notification.readAt = Date.now();
      this.saveNotifications();
      this.updateBadge();
      this.renderDropdownList();
    }
  }

  // 标记所有已读
  markAllAsRead() {
    const now = Date.now();
    this.notifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        n.readAt = now;
      }
    });
    this.saveNotifications();
    this.updateBadge();
    this.renderDropdownList();
  }

  // 删除通知
  deleteNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
    this.updateBadge();
    this.renderDropdownList();
  }

  // 清空所有通知
  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.updateBadge();
    this.settings.lastClean = Date.now();
    this.saveSettings();
    this.renderDropdownList();
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

  // ========== 浏览器通知 ==========

  // 请求通知权限
  async requestPermission() {
    if (!this.isSupported) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // 发送浏览器通知
  async sendBrowserNotification(title, options = {}) {
    if (!this.isSupported || !this.settings.browser) return;
    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    const notification = new Notification(title, {
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>',
      tag: options.tag || 'youdau-notification',
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

  // 是否发送浏览器通知
  shouldSendBrowserNotification(type) {
    const typeMap = {
      'system': this.settings.system,
      'activity': this.settings.activity,
      'order': this.settings.order,
      'reminder': this.settings.reminder
    };
    return typeMap[type] && this.settings.browser && Notification.permission === 'granted';
  }

  // ========== Toast 提示 ==========

  // 创建Toast容器
  createToastContainer() {
    if (document.getElementById('notification-toast-container')) return;
    const container = document.createElement('div');
    container.id = 'notification-toast-container';
    container.className = 'notification-toast-container';
    document.body.appendChild(container);
  }

  // 显示Toast
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
      ${notification.url ? `<a class="toast-link" href="${notification.url}">查看详情</a>` : ''}
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.hideToast(toast);
    });

    setTimeout(() => {
      this.hideToast(toast);
    }, notification.duration || 5000);

    this.markAsRead(notification.id);
  }

  // 隐藏Toast
  hideToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }

  // ========== 下拉面板 ==========

  // 创建下拉面板
  createDropdownPanel() {
    if (document.getElementById('notification-dropdown-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'notification-dropdown-panel';
    panel.className = 'notification-dropdown-panel';
    panel.innerHTML = this.getDropdownTemplate();
    document.body.appendChild(panel);

    this.dropDownPanel = panel;
    this.bindDropdownEvents();
    this.renderDropdownList();
    this.addBellToNavbar();
  }

  // 下拉面板模板
  getDropdownTemplate() {
    const unreadCount = this.getUnreadCount();
    return `
      <div class="dropdown-header">
        <h4>通知消息</h4>
        <div class="dropdown-actions">
          <button class="btn-mark-all-read" ${unreadCount === 0 ? 'disabled' : ''}>
            ${unreadCount > 0 ? '全部已读' : '已读'}
          </button>
        </div>
      </div>
      <div class="dropdown-list"></div>
      <div class="dropdown-footer">
        <a href="notifications.html">查看全部 →</a>
      </div>
    `;
  }

  // 绑定下拉面板事件
  bindDropdownEvents() {
    const panel = document.getElementById('notification-dropdown-panel');
    if (!panel) return;

    // 全部已读按钮
    panel.querySelector('.btn-mark-all-read')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.markAllAsRead();
      this.showToast({
        type: 'system',
        icon: '✅',
        title: '操作完成',
        content: '已全部标记为已读'
      });
    });

    // 点击外部关闭
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !e.target.closest('.notification-bell-btn')) {
        panel.classList.remove('show');
      }
    });

    // ESC关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('show')) {
        panel.classList.remove('show');
      }
    });
  }

  // 渲染下拉列表
  renderDropdownList() {
    const panel = document.getElementById('notification-dropdown-panel');
    if (!panel) return;

    const list = panel.querySelector('.dropdown-list');
    const recent = this.notifications.slice(0, 5);
    const unreadCount = this.getUnreadCount();

    // 更新全部已读按钮状态
    const markAllBtn = panel.querySelector('.btn-mark-all-read');
    if (markAllBtn) {
      markAllBtn.disabled = unreadCount === 0;
      markAllBtn.textContent = unreadCount > 0 ? '全部已读' : '已读';
    }

    if (recent.length === 0) {
      list.innerHTML = `
        <div class="dropdown-empty">
          <span>📭</span>
          <p>暂无通知</p>
        </div>
      `;
      return;
    }

    list.innerHTML = recent.map(notif => `
      <div class="dropdown-item ${notif.read ? '' : 'unread'}" data-id="${notif.id}">
        <span class="dropdown-item-icon">${notif.icon}</span>
        <div class="dropdown-item-content">
          <div class="dropdown-item-title">${notif.title}</div>
          <div class="dropdown-item-time">${this.formatTime(notif.timestamp)}</div>
        </div>
        <div class="dropdown-item-actions">
          ${notif.read ? '' : `<button class="btn-read" title="标记已读">✓</button>`}
          <button class="btn-delete" title="删除">×</button>
        </div>
      </div>
    `).join('');

    // 绑定事件
    list.querySelectorAll('.dropdown-item').forEach(item => {
      const id = item.dataset.id;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.dropdown-item-actions')) return;
        const notif = this.notifications.find(n => n.id === id);
        if (notif) {
          this.markAsRead(id);
          if (notif.url) {
            window.location.href = notif.url;
          }
        }
      });

      item.querySelector('.btn-read')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.markAsRead(id);
      });

      item.querySelector('.btn-delete')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteNotification(id);
      });
    });
  }

  // 切换下拉面板
  toggleDropdown() {
    const panel = document.getElementById('notification-dropdown-panel');
    if (!panel) return;
    
    const isOpen = panel.classList.toggle('show');
    if (isOpen) {
      this.renderDropdownList();
    }
  }

  // ========== 导航栏铃铛 ==========

  // 添加铃铛到导航栏
  addBellToNavbar() {
    if (document.querySelector('.notification-bell-btn')) return;

    const navContainer = document.querySelector('.nav-container, .navbar .container');
    if (!navContainer) return;

    const btn = document.createElement('button');
    btn.className = 'notification-bell-btn';
    btn.setAttribute('aria-label', '通知');
    btn.innerHTML = `
      <span class="bell-icon">🔔</span>
      <span class="bell-badge" style="display: none;">0</span>
    `;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDropdown();
    });

    // 插入到logo旁边或导航链接前面
    const logo = navContainer.querySelector('.logo');
    if (logo && logo.nextSibling) {
      navContainer.insertBefore(btn, logo.nextSibling);
    } else if (logo) {
      logo.parentNode.appendChild(btn);
    } else {
      const searchBtn = navContainer.querySelector('.nav-search-btn');
      if (searchBtn) {
        navContainer.insertBefore(btn, searchBtn);
      } else {
        navContainer.appendChild(btn);
      }
    }

    this.updateBadge();
  }

  // 更新角标
  updateBadge() {
    const badge = document.querySelector('.bell-badge');
    if (!badge) return;

    const count = this.getUnreadCount();
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  // ========== 工具方法 ==========

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

  // 生成ID
  generateId() {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
let notificationService;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  notificationService = new NotificationService();
  
  // 如果页面没有导航栏，直接初始化组件
  if (!document.querySelector('.navbar')) {
    setTimeout(() => {
      notificationService.createToastContainer();
      notificationService.createDropdownPanel();
    }, 100);
  }
});

// 兼容旧版本
const NotificationSystem = NotificationService;

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationService;
}
