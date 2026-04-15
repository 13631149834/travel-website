# 游导旅游平台 - 消息推送系统

## 概述

完善的消息推送系统，支持浏览器推送、站内推送、多种推送场景、个性化设置和完整的统计分析。

## 模块结构

```
js/push/
├── browser-push.js      # 浏览器推送模块
├── push-manager.js      # 推送管理器
├── push-settings.js     # 推送设置
├── push-statistics.js   # 推送统计
├── push-init.js         # 模块初始化
└── push-export.js       # 统一导出
```

## 快速开始

### 引入推送模块

```html
<script src="js/push/push-export.js"></script>
```

### 初始化

模块会在 DOMContentLoaded 后自动初始化。

## 核心功能

### 1. 浏览器推送 (BrowserPush)

```javascript
const browserPush = new BrowserPush();

// 检查支持
browserPush.isSupported;        // boolean
browserPush.getPermissionState(); // 'granted' | 'denied' | 'default'

// 请求权限
const result = await browserPush.requestPermission();

// 订阅状态
browserPush.isSubscribed();

// 显示通知
await browserPush.showNotification({
    title: '行程提醒',
    body: '您预约的导游服务即将开始',
    icon: '/images/icon.png',
    url: '/orders.html',
    type: 'reminder',
    tag: 'youdau-reminder'
});

// 取消订阅
await browserPush.unsubscribe();
```

### 2. 推送管理器 (PushManager)

```javascript
const pushManager = new PushManager();

// 发送各类推送
await pushManager.sendBookingReminder({
    id: 'booking_123',
    guideName: '张导',
    date: '2024-01-20',
    time: '10:00'
});

await pushManager.sendPaymentSuccess({
    id: 'order_456',
    amount: 299
});

await pushManager.sendActivityNotification({
    id: 'activity_789',
    title: '春季特惠',
    description: '精选路线8折起'
});

// 获取消息
const messages = pushManager.getMessages({ category: 'payment', read: false });
const unread = pushManager.getUnreadCount();
const byCategory = pushManager.getUnreadCountByCategory();

// 标记已读
pushManager.markAsRead(messageId);
pushManager.markAllAsRead({ category: 'payment' });

// 删除消息
pushManager.deleteMessage(messageId);
```

### 3. 推送设置 (PushSettings)

```javascript
const settings = new PushSettings();

// 获取设置
settings.getSettings();
settings.getTypeSettings('booking');

// 更新设置
settings.setEnabled(true);
settings.toggleType('payment', true);
settings.setQuietHours(true, '22:00', '08:00');

// 检查是否可以发送
settings.canSend();  // { can: true } 或 { can: false, reason: '免打扰时段' }

// 请求浏览器权限
await settings.requestBrowserPermission();

// 重置设置
settings.resetSettings();
```

### 4. 推送统计 (PushStatistics)

```javascript
const stats = new PushStatistics();

// 记录事件
stats.recordSend({ id: 'msg_1', type: 'booking', title: '预约提醒' });
stats.recordClick(messageId);
stats.recordConversion(messageId, 'order', 299);

// 获取统计
stats.getBasicStats('week');  // 基础统计
stats.getStatsByType();       // 按类型统计
stats.getTimeStats('day');    // 按时间统计
stats.getBestTimeSlots();     // 最佳推送时段
stats.getTypeRanking();       // 类型排行

// 生成报告
const report = stats.generateReport('month');

// 导出数据
stats.exportData('json');
stats.exportData('csv');
```

### 5. 统一 API (PushAPI)

推荐使用统一的 API 接口：

```javascript
// 发送推送
await PushAPI.send('booking', {
    title: '预约提醒',
    content: '您预约的服务即将开始'
});

// 便捷方法
await PushAPI.sendBookingReminder(bookingData);
await PushAPI.sendPaymentSuccess(orderData);
await PushAPI.sendActivityNotification(activityData);
await PushAPI.sendAnnouncement(announcementData);

// 消息管理
const unread = PushAPI.getUnreadCount();
const messages = PushAPI.getMessages({ type: 'payment' });
PushAPI.markAsRead(messageId);
PushAPI.markAllAsRead();

// 统计
const stats = PushAPI.getStats('week');
const report = PushAPI.generateReport('month');

// 设置
const settings = PushAPI.getSettings();
await PushAPI.requestBrowserPermission();
```

## 推送场景

| 场景 | 方法 | 类型标识 |
|------|------|----------|
| 预约提醒 | `sendBookingReminder()` | booking |
| 预约确认 | `sendBookingConfirm()` | booking |
| 支付提醒 | `sendPaymentReminder()` | payment |
| 支付成功 | `sendPaymentSuccess()` | payment |
| 活动通知 | `sendActivityNotification()` | activity |
| 系统公告 | `sendAnnouncement()` | system |
| 互动消息 | `sendInteractiveMessage()` | interactive |

## 消息分类

- `reminder` - 预约提醒
- `payment` - 支付通知
- `activity` - 活动通知
- `system` - 系统公告
- `interactive` - 互动消息

## 存储结构

### 推送消息 (localStorage: youdau_push_messages)

```javascript
{
    id: 'push_xxx',
    type: 'booking',
    category: 'reminder',
    title: '行程提醒',
    content: '您预约的导游服务即将开始',
    timestamp: 1705312800000,
    read: false,
    url: '/orders.html'
}
```

### 推送设置 (localStorage: youdau_push_settings)

```javascript
{
    enabled: true,
    types: {
        booking: { enabled: true, label: '预约提醒' },
        payment: { enabled: true, label: '支付提醒' },
        activity: { enabled: true, label: '活动通知' },
        system: { enabled: true, label: '系统公告' },
        interactive: { enabled: true, label: '互动消息' }
    },
    quietHours: { enabled: false, start: '22:00', end: '08:00' },
    frequency: { maxPerDay: 20, maxPerHour: 5, minInterval: 60 }
}
```

### 推送统计 (localStorage: youdau_push_events)

```javascript
[
    { id: 'stat_xxx', type: 'send', messageType: 'booking', timestamp: 1705312800000 },
    { id: 'stat_xxx', type: 'click', messageId: 'push_xxx', timestamp: 1705312900000 }
]
```

## 页面文件

| 页面 | 路径 | 说明 |
|------|------|------|
| 推送设置 | `/notification-settings.html` | 用户端推送设置页面 |
| 推送管理 | `/admin/push-management.html` | 管理后台推送管理 |

## Service Worker 集成

在 `service-worker.js` 中添加推送处理：

```javascript
// 监听推送消息
self.addEventListener('push', function(event) {
    const data = event.data.json();
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            data: { url: data.url }
        })
    );
});

// 监听通知点击
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
```

## 最佳实践

1. **权限请求时机**：在用户主动行为后请求推送权限，避免首次访问就弹窗
2. **消息去重**：使用 tag 参数确保同一类型的通知不会重复显示
3. **免打扰时段**：尊重用户设置的非推送时段
4. **频率控制**：避免短时间内发送过多通知，建议设置每日上限
5. **数据追踪**：记录每次推送的发送、点击、转化数据用于分析

## 浏览器兼容性

- Chrome 42+
- Firefox 44+
- Safari 10+ (需要 HTTPS)
- Edge 17+
- 移动端 Chrome/Firefox

## 后端 API (需实现)

```
POST /api/push/subscribe     - 订阅推送
POST /api/push/unsubscribe   - 取消订阅
POST /api/push/send          - 发送推送
GET  /api/push/stats         - 获取推送统计
```

## 注意事项

1. 浏览器推送需要 HTTPS 环境或 localhost
2. 消息内容建议控制在 100 字以内
3. 定期清理过期的消息和统计数据
4. 敏感信息不要通过推送发送
