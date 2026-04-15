/**
 * 推送模块初始化 - Push Module Initializer
 * 游导旅游平台
 * 统一导出所有推送相关模块
 */

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 初始化各个模块
  window.pushSettings = new PushSettings();
  window.pushManager = new PushManager();
  window.pushStatistics = new PushStatistics();

  // 设置 Service Worker 消息监听
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
  }

  // 监听标签页可见性变化，更新统计
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

// 处理 Service Worker 消息
function handleServiceWorkerMessage(event) {
  const { type, data } = event.data;

  switch (type) {
    case 'notification_shown':
      window.pushStatistics.recordImpression(data.messageId);
      break;
    case 'notification_clicked':
      window.pushStatistics.recordClick(data.messageId, data.action);
      break;
    case 'notification_dismissed':
      window.pushStatistics.recordDismiss(data.messageId);
      break;
    case 'push_received':
      console.log('收到推送:', data);
      break;
    default:
      console.log('未知消息类型:', type);
  }
}

// 处理页面可见性变化
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    // 页面可见时刷新数据
    if (window.pushManager) {
      window.pushManager.updateBadge();
    }
  }
}

// 便捷函数
const PushAPI = {
  // 发送各类消息
  async send(type, options) {
    const messageOptions = {
      type,
      ...options
    };
    return window.pushManager.sendPush(messageOptions);
  },

  // 预约提醒
  async sendBookingReminder(bookingData) {
    return window.pushManager.sendBookingReminder(bookingData);
  },

  // 预约确认
  async sendBookingConfirm(bookingData) {
    return window.pushManager.sendBookingConfirm(bookingData);
  },

  // 支付提醒
  async sendPaymentReminder(orderData) {
    return window.pushManager.sendPaymentReminder(orderData);
  },

  // 支付成功
  async sendPaymentSuccess(orderData) {
    return window.pushManager.sendPaymentSuccess(orderData);
  },

  // 活动通知
  async sendActivityNotification(activityData) {
    return window.pushManager.sendActivityNotification(activityData);
  },

  // 系统公告
  async sendAnnouncement(announcementData) {
    return window.pushManager.sendAnnouncement(announcementData);
  },

  // 互动消息
  async sendInteractiveMessage(messageData) {
    return window.pushManager.sendInteractiveMessage(messageData);
  },

  // 获取未读数
  getUnreadCount() {
    return window.pushManager.getUnreadCount();
  },

  // 获取各分类未读数
  getUnreadCountByCategory() {
    return window.pushManager.getUnreadCountByCategory();
  },

  // 标记已读
  markAsRead(messageId) {
    return window.pushManager.markAsRead(messageId);
  },

  // 全部标记已读
  markAllAsRead(filter = {}) {
    return window.pushManager.markAllAsRead(filter);
  },

  // 删除消息
  deleteMessage(messageId) {
    return window.pushManager.deleteMessage(messageId);
  },

  // 获取消息
  getMessages(filter = {}) {
    return window.pushManager.getMessages(filter);
  },

  // 统计
  getStats(dateRange = null) {
    return window.pushStatistics.getBasicStats(dateRange);
  },

  // 获取类型统计
  getStatsByType(dateRange = null) {
    return window.pushStatistics.getStatsByType(dateRange);
  },

  // 生成报告
  generateReport(dateRange = 'week') {
    return window.pushStatistics.generateReport(dateRange);
  },

  // 导出数据
  exportData(format = 'json') {
    return window.pushStatistics.exportData(format);
  },

  // 设置
  getSettings() {
    return window.pushSettings.getSettings();
  },

  // 更新设置
  updateSettings(updates) {
    Object.assign(window.pushSettings.settings, updates);
    return window.pushSettings.saveSettings();
  },

  // 请求浏览器权限
  async requestBrowserPermission() {
    return window.pushSettings.requestBrowserPermission();
  },

  // 获取浏览器推送状态
  getBrowserPushStatus() {
    return window.pushSettings.getBrowserPushStatus();
  },

  // 检查是否可以发送
  canSend() {
    return window.pushSettings.canSend();
  }
};

// 导出全局 API
window.PushAPI = PushAPI;
