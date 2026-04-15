/**
 * 浏览器推送模块 - Browser Push Notification Module
 * 游导旅游平台
 * 功能：推送权限申请、订阅管理、消息处理、点击处理
 */

class BrowserPush {
  constructor() {
    this.storageKey = 'youdau_push_subscription';
    this.settingsKey = 'youdau_push_settings';
    this.swRegistration = null;
    this.subscription = null;
    this.isSupported = this.checkSupport();
    this.vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
    this.init();
  }

  // 检查浏览器支持
  checkSupport() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // 初始化
  async init() {
    if (!this.isSupported) {
      console.warn('当前浏览器不支持 Web Push 推送');
      return;
    }
    
    try {
      this.swRegistration = await navigator.serviceWorker.register('/service-worker.js');
      await this.getExistingSubscription();
    } catch (error) {
      console.error('Service Worker 注册失败:', error);
    }
  }

  // ========== 权限管理 ==========

  // 获取当前权限状态
  getPermissionState() {
    if (!this.isSupported) return 'unsupported';
    return Notification.permission; // 'granted' | 'denied' | 'default'
  }

  // 请求推送权限
  async requestPermission() {
    if (!this.isSupported) {
      return { success: false, error: '浏览器不支持 Web Push' };
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        await this.subscribe();
        return { success: true, permission: 'granted' };
      } else {
        return { success: false, error: '用户拒绝了推送权限' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ========== 订阅管理 ==========

  // 获取现有订阅
  async getExistingSubscription() {
    if (!this.swRegistration) return null;
    
    try {
      this.subscription = await this.swRegistration.pushManager.getSubscription();
      return this.subscription;
    } catch (error) {
      console.error('获取订阅失败:', error);
      return null;
    }
  }

  // 订阅推送
  async subscribe() {
    if (!this.swRegistration) {
      throw new Error('Service Worker 未注册');
    }

    // 检查权限
    if (Notification.permission !== 'granted') {
      throw new Error('没有推送权限');
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      this.subscription = subscription;
      this.saveSubscription(subscription);
      
      // 发送到服务器
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('订阅失败:', error);
      throw error;
    }
  }

  // 取消订阅
  async unsubscribe() {
    if (!this.subscription) return false;

    try {
      await this.subscription.unsubscribe();
      
      // 通知服务器删除订阅
      await this.removeSubscriptionFromServer(this.subscription.endpoint);
      
      this.subscription = null;
      this.removeSubscription();
      
      return true;
    } catch (error) {
      console.error('取消订阅失败:', error);
      return false;
    }
  }

  // 检查是否已订阅
  isSubscribed() {
    return this.subscription !== null;
  }

  // ========== 消息处理 ==========

  // 显示浏览器通知
  async showNotification(options) {
    const settings = this.getSettings();
    
    // 检查免打扰时段
    if (this.isInQuietHours(settings)) {
      return { success: false, reason: 'quiet_hours' };
    }

    // 检查推送类型开关
    if (!this.isNotificationTypeEnabled(options.type, settings)) {
      return { success: false, reason: 'type_disabled' };
    }

    try {
      const notificationOptions = {
        body: options.body || options.content,
        icon: options.icon || '/images/logo.png',
        badge: options.badge || '/images/badge.png',
        tag: options.tag || 'youdau-' + options.type,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        data: {
          url: options.url || '/',
          id: options.id || Date.now(),
          type: options.type || 'system',
          timestamp: Date.now()
        },
        actions: options.actions || [
          { action: 'open', title: '查看详情' },
          { action: 'dismiss', title: '忽略' }
        ]
      };

      // 添加自定义声音（如果启用）
      if (settings.sound && !notificationOptions.silent) {
        notificationOptions.silent = false;
      }

      // 使用 Service Worker 显示通知
      if (this.swRegistration) {
        await this.swRegistration.showNotification(options.title, notificationOptions);
      } else {
        // 后备方案：使用普通 Notification
        new Notification(options.title, notificationOptions);
      }

      // 记录统计
      this.recordNotificationSent(options);

      return { success: true };
    } catch (error) {
      console.error('显示通知失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 处理通知点击
  handleNotificationClick(event) {
    event.notification.close();

    const url = event.notification.data?.url || '/';
    const action = event.action;
    const notificationId = event.notification.data?.id;

    // 根据点击动作处理
    if (action === 'dismiss') {
      // 忽略，不做处理
      return;
    }

    // 记录点击统计
    this.recordNotificationClicked(notificationId, action);

    // 打开指定页面
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          // 如果有已打开的窗口，聚焦它
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus().then(() => {
                client.navigate(url);
              });
            }
          }
          // 否则打开新窗口
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }

  // 处理通知关闭
  handleNotificationClose(event) {
    const notificationId = event.notification.data?.id;
    console.log('通知已关闭:', notificationId);
  }

  // ========== 辅助函数 ==========

  // 获取推送设置
  getSettings() {
    try {
      const stored = localStorage.getItem(this.settingsKey);
      return stored ? JSON.parse(stored) : this.getDefaultSettings();
    } catch {
      return this.getDefaultSettings();
    }
  }

  // 默认设置
  getDefaultSettings() {
    return {
      enabled: true,
      types: {
        booking: true,      // 预约提醒
        payment: true,      // 支付提醒
        activity: true,    // 活动通知
        system: true,       // 系统公告
        interactive: true   // 互动消息
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      frequency: {
        maxPerDay: 10,
        minInterval: 300 // 最小间隔（秒）
      },
      sound: true,
      vibration: true
    };
  }

  // 保存订阅信息
  saveSubscription(subscription) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(subscription.toJSON()));
    } catch (error) {
      console.error('保存订阅失败:', error);
    }
  }

  // 删除订阅信息
  removeSubscription() {
    localStorage.removeItem(this.storageKey);
  }

  // 发送到服务器
  async sendSubscriptionToServer(subscription) {
    // 这里应该调用实际的后端 API
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription.toJSON())
      });
      return response.ok;
    } catch (error) {
      console.error('发送订阅到服务器失败:', error);
      // 即使失败，也保存到本地
      return false;
    }
  }

  // 从服务器删除订阅
  async removeSubscriptionFromServer(endpoint) {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint })
      });
    } catch (error) {
      console.error('从服务器删除订阅失败:', error);
    }
  }

  // 检查是否在免打扰时段
  isInQuietHours(settings) {
    if (!settings.quietHours?.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const startParts = settings.quietHours.start.split(':');
    const endParts = settings.quietHours.end.split(':');
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

    // 处理跨天的情况（如 22:00 - 08:00）
    if (startMinutes > endMinutes) {
      return currentTime >= startMinutes || currentTime <= endMinutes;
    } else {
      return currentTime >= startMinutes && currentTime <= endMinutes;
    }
  }

  // 检查通知类型是否启用
  isNotificationTypeEnabled(type, settings) {
    const typeMapping = {
      'booking': 'booking',
      'payment': 'payment',
      'order': 'payment',
      'activity': 'activity',
      'promotion': 'activity',
      'system': 'system',
      'interactive': 'interactive',
      'review': 'interactive'
    };

    const settingKey = typeMapping[type] || 'system';
    return settings.types?.[settingKey] !== false;
  }

  // VAPID 密钥转换
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // ========== 统计功能 ==========

  // 记录通知发送
  recordNotificationSent(notification) {
    const stats = this.getNotificationStats();
    stats.sent = stats.sent || [];
    stats.sent.push({
      id: notification.id,
      type: notification.type,
      timestamp: Date.now(),
      success: true
    });
    // 只保留最近 1000 条记录
    if (stats.sent.length > 1000) {
      stats.sent = stats.sent.slice(-1000);
    }
    this.saveNotificationStats(stats);
  }

  // 记录通知点击
  recordNotificationClicked(notificationId, action) {
    const stats = this.getNotificationStats();
    stats.clicked = stats.clicked || [];
    stats.clicked.push({
      id: notificationId,
      action,
      timestamp: Date.now()
    });
    if (stats.clicked.length > 1000) {
      stats.clicked = stats.clicked.slice(-1000);
    }
    this.saveNotificationStats(stats);
  }

  // 获取通知统计
  getNotificationStats() {
    try {
      const stored = localStorage.getItem('youdau_push_stats');
      return stored ? JSON.parse(stored) : { sent: [], clicked: [] };
    } catch {
      return { sent: [], clicked: [] };
    }
  }

  // 保存通知统计
  saveNotificationStats(stats) {
    try {
      localStorage.setItem('youdau_push_stats', JSON.stringify(stats));
    } catch (error) {
      console.error('保存统计失败:', error);
    }
  }

  // 获取推送状态摘要
  getStatus() {
    return {
      supported: this.isSupported,
      permission: this.getPermissionState(),
      subscribed: this.isSubscribed(),
      settings: this.getSettings()
    };
  }
}

// 导出全局实例
window.BrowserPush = BrowserPush;
