/**
 * 推送管理器 - Push Manager
 * 游导旅游平台
 * 功能：实时消息、离线消息、消息分类、消息聚合
 */

class PushManager {
  constructor() {
    this.storageKey = 'youdau_push_messages';
    this.browserPush = null;
    this.messageQueue = [];
    this.websocket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnected = false;
    this.init();
  }

  // 初始化
  init() {
    // 初始化浏览器推送
    if (window.BrowserPush) {
      this.browserPush = new BrowserPush();
    }

    // 加载离线消息
    this.loadOfflineMessages();
    
    // 设置 WebSocket 连接
    this.setupWebSocket();
    
    // 监听在线/离线状态
    this.setupNetworkListeners();
  }

  // ========== 消息发送 ==========

  // 发送推送消息
  async sendPush(options) {
    const message = this.createMessage(options);
    
    // 1. 发送到服务器
    const serverResult = await this.sendToServer(message);
    
    // 2. 实时推送（如果在线）
    if (this.isConnected) {
      this.sendViaWebSocket(message);
    } else {
      // 离线消息，存入队列
      this.queueOfflineMessage(message);
    }
    
    // 3. 浏览器通知
    if (this.browserPush?.isSubscribed()) {
      await this.browserPush.showNotification({
        id: message.id,
        title: message.title,
        body: message.content,
        icon: message.icon,
        url: message.url,
        type: message.type,
        tag: `youdau-${message.type}`
      });
    }

    // 4. 保存到本地历史
    this.saveMessage(message);

    return { success: true, message };
  }

  // 创建消息对象
  createMessage(options) {
    return {
      id: options.id || this.generateId(),
      type: options.type || 'system',
      category: options.category || this.getCategoryByType(options.type),
      title: options.title,
      content: options.content,
      data: options.data || {},
      url: options.url || '/',
      icon: options.icon || this.getIconByType(options.type),
      priority: options.priority || 'normal', // high, normal, low
      timestamp: Date.now(),
      read: false,
      dismissed: false
    };
  }

  // 获取消息分类
  getCategoryByType(type) {
    const categoryMap = {
      'booking': 'reminder',
      'booking_reminder': 'reminder',
      'booking_confirm': 'reminder',
      'payment': 'payment',
      'payment_success': 'payment',
      'payment_failed': 'payment',
      'refund': 'payment',
      'activity': 'activity',
      'promotion': 'activity',
      'campaign': 'activity',
      'system': 'system',
      'announcement': 'system',
      'interactive': 'interactive',
      'review': 'interactive',
      'like': 'interactive',
      'comment': 'interactive',
      'follow': 'interactive'
    };
    return categoryMap[type] || 'system';
  }

  // 根据类型获取图标
  getIconByType(type) {
    const iconMap = {
      'booking': '📅',
      'payment': '💳',
      'activity': '🎉',
      'system': '🔔',
      'interactive': '💬',
      'review': '⭐'
    };
    return iconMap[type] || '📢';
  }

  // ========== 推送场景 ==========

  // 预约提醒
  async sendBookingReminder(bookingData) {
    return this.sendPush({
      type: 'booking_reminder',
      title: '行程提醒',
      content: `您预约的${bookingData.guideName}的导游服务将于${bookingData.date} ${bookingData.time}开始，请提前做好准备。`,
      data: bookingData,
      url: `/guide-bookings.html?id=${bookingData.id}`,
      priority: 'high'
    });
  }

  // 预约确认
  async sendBookingConfirm(bookingData) {
    return this.sendPush({
      type: 'booking_confirm',
      title: '预约成功',
      content: `您预约的${bookingData.guideName}已确认，服务时间：${bookingData.date} ${bookingData.time}`,
      data: bookingData,
      url: `/guide-bookings.html?id=${bookingData.id}`,
      priority: 'high'
    });
  }

  // 支付提醒
  async sendPaymentReminder(orderData) {
    return this.sendPush({
      type: 'payment',
      title: '待支付订单',
      content: `您有订单待支付，金额：¥${orderData.amount}，请在${orderData.expireTime}前完成支付。`,
      data: orderData,
      url: `/payment.html?order=${orderData.id}`,
      priority: 'high'
    });
  }

  // 支付成功
  async sendPaymentSuccess(orderData) {
    return this.sendPush({
      type: 'payment_success',
      title: '支付成功',
      content: `您的订单已支付成功，金额：¥${orderData.amount}`,
      data: orderData,
      url: `/my-orders.html?id=${orderData.id}`,
      priority: 'high'
    });
  }

  // 活动通知
  async sendActivityNotification(activityData) {
    return this.sendPush({
      type: 'activity',
      title: activityData.title || '活动通知',
      content: activityData.description,
      data: activityData,
      url: `/activity-detail.html?id=${activityData.id}`,
      priority: 'normal'
    });
  }

  // 系统公告
  async sendAnnouncement(announcementData) {
    return this.sendPush({
      type: 'system',
      title: announcementData.title || '系统公告',
      content: announcementData.content,
      data: announcementData,
      url: announcementData.url || '/announcement.html',
      priority: announcementData.priority || 'normal'
    });
  }

  // 互动消息
  async sendInteractiveMessage(messageData) {
    const typeMessages = {
      'review': `${messageData.userName}评价了您的服务`,
      'like': `${messageData.userName}点赞了您的内容`,
      'comment': `${messageData.userName}评论了您的内容`,
      'follow': `${messageData.userName}关注了您`
    };

    return this.sendPush({
      type: messageData.interactionType,
      title: '新消息提醒',
      content: typeMessages[messageData.interactionType] || messageData.content,
      data: messageData,
      url: messageData.url || '/messages.html',
      priority: 'low'
    });
  }

  // ========== 消息管理 ==========

  // 获取所有消息
  getMessages(filter = {}) {
    let messages = this.loadMessages();

    // 按类型筛选
    if (filter.type) {
      messages = messages.filter(m => m.type === filter.type);
    }

    // 按分类筛选
    if (filter.category) {
      messages = messages.filter(m => m.category === filter.category);
    }

    // 按已读状态筛选
    if (filter.read !== undefined) {
      messages = messages.filter(m => m.read === filter.read);
    }

    // 按时间范围筛选
    if (filter.startTime) {
      messages = messages.filter(m => m.timestamp >= filter.startTime);
    }
    if (filter.endTime) {
      messages = messages.filter(m => m.timestamp <= filter.endTime);
    }

    // 排序
    messages.sort((a, b) => b.timestamp - a.timestamp);

    // 分页
    if (filter.page && filter.pageSize) {
      const start = (filter.page - 1) * filter.pageSize;
      messages = messages.slice(start, start + filter.pageSize);
    }

    return messages;
  }

  // 获取未读消息数
  getUnreadCount(filter = {}) {
    const messages = this.getMessages({ ...filter, read: false });
    return messages.length;
  }

  // 获取各分类未读数
  getUnreadCountByCategory() {
    const messages = this.loadMessages().filter(m => !m.read);
    const counts = {
      reminder: 0,
      payment: 0,
      activity: 0,
      system: 0,
      interactive: 0
    };

    messages.forEach(m => {
      if (counts[m.category] !== undefined) {
        counts[m.category]++;
      } else {
        counts.system++;
      }
    });

    return counts;
  }

  // 标记消息已读
  markAsRead(messageId) {
    const messages = this.loadMessages();
    const message = messages.find(m => m.id === messageId);
    if (message) {
      message.read = true;
      this.saveMessages(messages);
      this.updateBadge();
    }
    return message;
  }

  // 标记所有消息已读
  markAllAsRead(filter = {}) {
    const messages = this.loadMessages();
    const now = Date.now();
    
    messages.forEach(m => {
      if (m.read) return;
      
      // 应用筛选条件
      if (filter.category && m.category !== filter.category) return;
      if (filter.type && m.type !== filter.type) return;
      
      m.read = true;
      m.readTime = now;
    });

    this.saveMessages(messages);
    this.updateBadge();
  }

  // 删除消息
  deleteMessage(messageId) {
    const messages = this.loadMessages();
    const index = messages.findIndex(m => m.id === messageId);
    if (index > -1) {
      messages.splice(index, 1);
      this.saveMessages(messages);
    }
    return index > -1;
  }

  // 清空消息
  clearMessages(filter = {}) {
    let messages = this.loadMessages();
    
    if (Object.keys(filter).length === 0) {
      messages = [];
    } else {
      messages = messages.filter(m => {
        if (filter.category && m.category === filter.category) return false;
        if (filter.type && m.type === filter.type) return false;
        if (filter.read === true && m.read) return false;
        return true;
      });
    }

    this.saveMessages(messages);
    this.updateBadge();
  }

  // ========== 消息聚合 ==========

  // 聚合消息
  aggregateMessages(messages, groupBy = 'type') {
    const groups = {};

    messages.forEach(m => {
      let key;
      switch (groupBy) {
        case 'type':
          key = m.type;
          break;
        case 'category':
          key = m.category;
          break;
        case 'date':
          key = this.formatDate(m.timestamp);
          break;
        case 'hour':
          key = this.formatHour(m.timestamp);
          break;
        default:
          key = 'other';
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(m);
    });

    return Object.entries(groups).map(([key, items]) => ({
      key,
      count: items.length,
      latest: items[0],
      items,
      title: this.getGroupTitle(key)
    }));
  }

  // 获取聚合组标题
  getGroupTitle(key) {
    const titles = {
      'booking_reminder': '行程提醒',
      'payment': '支付通知',
      'activity': '活动通知',
      'system': '系统公告',
      'interactive': '互动消息',
      'reminder': '提醒',
      'payment_type': '支付',
      'activity_type': '活动',
      'system_type': '系统',
      'interactive_type': '互动'
    };
    return titles[key] || key;
  }

  // ========== 消息存储 ==========

  loadMessages() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveMessages(messages) {
    try {
      // 限制存储数量
      if (messages.length > 500) {
        messages = messages.slice(0, 500);
      }
      localStorage.setItem(this.storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error('保存消息失败:', error);
    }
  }

  saveMessage(message) {
    const messages = this.loadMessages();
    // 检查是否已存在
    const index = messages.findIndex(m => m.id === message.id);
    if (index > -1) {
      messages[index] = message;
    } else {
      messages.unshift(message);
    }
    this.saveMessages(messages);
  }

  // ========== 离线消息 ==========

  loadOfflineMessages() {
    return this.loadMessages().filter(m => !m.read);
  }

  queueOfflineMessage(message) {
    this.messageQueue.push(message);
    this.saveOfflineQueue();
  }

  saveOfflineQueue() {
    try {
      localStorage.setItem('youdau_push_queue', JSON.stringify(this.messageQueue));
    } catch (error) {
      console.error('保存离线队列失败:', error);
    }
  }

  processOfflineQueue() {
    if (!this.isConnected || this.messageQueue.length === 0) return;

    const queue = [...this.messageQueue];
    this.messageQueue = [];
    this.saveOfflineQueue();

    queue.forEach(message => {
      this.sendViaWebSocket(message);
    });
  }

  // ========== WebSocket ==========

  setupWebSocket() {
    // 检查是否已在其他标签页连接
    if (sessionStorage.getItem('ws_connected')) {
      return;
    }

    const wsUrl = this.getWebSocketUrl();
    if (!wsUrl) return;

    try {
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        sessionStorage.setItem('ws_connected', 'true');
        console.log('WebSocket 已连接');
        
        // 发送离线队列
        this.processOfflineQueue();
      };

      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleReceivedMessage(message);
        } catch (error) {
          console.error('解析消息失败:', error);
        }
      };

      this.websocket.onclose = () => {
        this.isConnected = false;
        sessionStorage.removeItem('ws_connected');
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket 错误:', error);
      };
    } catch (error) {
      console.error('创建 WebSocket 失败:', error);
    }
  }

  getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws/push`;
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('WebSocket 重连次数已达上限');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`${delay/1000}秒后尝试重连...`);
    setTimeout(() => this.setupWebSocket(), delay);
  }

  sendViaWebSocket(message) {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  handleReceivedMessage(message) {
    // 保存消息
    this.saveMessage(message);
    
    // 触发事件
    window.dispatchEvent(new CustomEvent('push:message', { detail: message }));
    
    // 更新徽章
    this.updateBadge();
  }

  // ========== 网络状态监听 ==========

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('网络已连接');
      this.setupWebSocket();
    });

    window.addEventListener('offline', () => {
      console.log('网络已断开');
      this.isConnected = false;
      if (this.websocket) {
        this.websocket.close();
      }
    });
  }

  // ========== 工具方法 ==========

  generateId() {
    return 'push_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) return '今天';
    if (diff < 172800000) return '昨天';
    if (diff < 604800000) return '本周';
    return date.toLocaleDateString('zh-CN');
  }

  formatHour(timestamp) {
    const date = new Date(timestamp);
    const hour = date.getHours();
    if (hour < 6) return '凌晨';
    if (hour < 9) return '早上';
    if (hour < 12) return '上午';
    if (hour < 14) return '中午';
    if (hour < 18) return '下午';
    if (hour < 22) return '晚上';
    return '深夜';
  }

  updateBadge() {
    const unreadCount = this.getUnreadCount();
    
    // 更新页面标题
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) 游导旅游`;
    } else {
      document.title = '游导旅游';
    }

    // 更新浏览器徽章
    if ('setAppBadge' in navigator) {
      navigator.setAppBadge(unreadCount).catch(() => {});
    }
  }

  // 发送到服务器（模拟）
  async sendToServer(message) {
    // 实际项目中应该调用 API
    console.log('发送消息到服务器:', message);
    return { success: true };
  }
}

// 导出全局实例
window.PushManager = PushManager;
