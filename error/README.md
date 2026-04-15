# 游导旅游 - 错误处理系统使用指南

## 概述

错误处理系统是一个完整的客户端错误捕获、上报、展示、恢复和统计解决方案，包含以下模块：

- `global-handler.js` - 全局错误捕获
- `reporter.js` - 错误上报
- `display.js` - 错误展示
- `recovery.js` - 错误恢复
- `stats.js` - 错误统计
- `index.js` - 统一入口

## 快速开始

### 1. 引入脚本

```html
<!-- 错误处理系统 -->
<script src="js/error/global-handler.js" defer></script>
<script src="js/error/reporter.js" defer></script>
<script src="js/error/display.js" defer></script>
<script src="js/error/recovery.js" defer></script>
<script src="js/error/stats.js" defer></script>
<script src="js/error/index.js" defer></script>
```

### 2. 初始化

```javascript
// 页面加载后初始化
document.addEventListener('DOMContentLoaded', function() {
  ErrorHandling.init({
    apiUrl: '/api/error/report',
    env: 'production',
    version: '1.0.0'
  });
});
```

## 核心功能

### 全局错误捕获

自动捕获以下错误：

- JavaScript运行时错误
- Promise未处理拒绝
- 资源加载失败（图片、脚本、样式等）
- 控制台错误
- 页面崩溃

```javascript
// 自动初始化，无需手动调用
// 错误会被自动捕获并处理
```

### 错误展示

```javascript
// Toast提示
ErrorHandling.showErrorToast({
  type: 'network',
  message: '网络连接失败，请检查网络',
  canRetry: true,
  onRetry: function() {
    location.reload();
  }
});

// 模态框提示
ErrorHandling.showErrorModal({
  type: 'server',
  message: '服务器繁忙，请稍后再试',
  canRetry: true
});

// 友好错误提示
ErrorDisplay.toast({
  type: 'validation',
  message: '请输入正确的手机号'
});
```

### 错误恢复

```javascript
// 带重试的请求
async function fetchData() {
  const result = await ErrorHandling.retryOperation(
    function() {
      return fetch('/api/data').then(r => r.json());
    },
    {
      maxRetries: 3,
      baseDelay: 1000,
      onRetry: function(error, attempt) {
        console.log('重试第', attempt, '次:', error);
      }
    }
  );
  
  if (result.success) {
    console.log('数据:', result.result);
  } else {
    console.error('最终失败:', result.error);
  }
}

// 带缓存的请求
async function getCachedData() {
  const result = await ErrorHandling.cachedRequest(
    'user-list',
    function() {
      return fetch('/api/users').then(r => r.json());
    },
    { ttl: 5 * 60 * 1000 } // 缓存5分钟
  );
  
  if (result.fromCache) {
    console.log('来自缓存');
  }
  return result.data;
}

// 网络状态监听
const unsubscribe = ErrorHandling.onOfflineStatusChange(function(isOffline) {
  if (isOffline) {
    ErrorHandling.showErrorToast({
      type: 'network',
      message: '网络已断开，部分功能可能不可用'
    });
  }
});
```

### 错误统计

```javascript
// 获取错误统计摘要
const stats = ErrorHandling.getErrorStats();
console.log('错误总数:', stats.total);
console.log('今日错误:', stats.today);
console.log('受影响用户:', stats.affectedUsers);

// 获取错误列表
const errors = ErrorHandling.getErrorList({
  type: 'js_error',
  pageNum: 1,
  pageSize: 20
});
console.log('错误列表:', errors.list);

// 导出错误数据
const csvData = ErrorHandling.exportErrors('csv');
const jsonData = ErrorHandling.exportErrors('json');

// 标记错误已修复
ErrorHandling.markErrorResolved('error_key_here');

// 清除统计数据
ErrorHandling.clearErrorStats();
```

## 管理后台

访问 `admin/error-monitoring.html` 可以查看：

- **总览** - 错误趋势图、类型分布、浏览器分布
- **错误列表** - 所有错误记录，支持筛选和搜索
- **数据分析** - Top错误页面、时段分布、重复错误追踪
- **告警配置** - 实时告警、邮件通知、阈值设置

## 错误类型

| 类型 | 说明 | 是否可重试 |
|------|------|-----------|
| network | 网络连接失败 | ✅ |
| server | 服务器错误 | ✅ |
| timeout | 请求超时 | ✅ |
| auth | 认证失败 | ❌ |
| permission | 权限不足 | ❌ |
| validation | 数据验证失败 | ❌ |
| resource | 资源加载失败 | ✅ |
| unknown | 未知错误 | ✅ |

## 配置选项

```javascript
ErrorHandling.init({
  apiUrl: '/api/error/report',  // 上报接口
  env: 'production',              // 环境
  version: '1.0.0'               // 版本号
});
```

## 与后端对接

### 上报接口

系统会自动POST错误数据到指定接口：

```json
POST /api/error/report
Content-Type: application/json

{
  "type": "js_error",
  "message": "Uncaught TypeError",
  "stack": "...",
  "timestamp": 1699999999999,
  "url": "https://youdao-travel.com/index.html",
  "userAgent": "Mozilla/5.0...",
  "environment": {
    "browser": "Chrome",
    "screen": { "width": 1920, "height": 1080 },
    "performance": { ... }
  },
  "behavior": [...]
}
```

### 数据库设计建议

```sql
CREATE TABLE error_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  error_key VARCHAR(64) UNIQUE,
  type VARCHAR(32),
  message TEXT,
  stack TEXT,
  url VARCHAR(500),
  user_agent VARCHAR(500),
  browser VARCHAR(32),
  user_id VARCHAR(64),
  session_id VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved TINYINT DEFAULT 0,
  resolved_at TIMESTAMP NULL,
  INDEX idx_type (type),
  INDEX idx_created (created_at),
  INDEX idx_resolved (resolved)
);
```

## 最佳实践

1. **生产环境必须启用** - 确保所有错误被捕获和追踪
2. **合理设置采样率** - 高流量场景可适当降低采样
3. **忽略无关错误** - 使用 `ignoreErrors` 过滤第三方SDK错误
4. **及时处理告警** - 配置合理的告警阈值和通知渠道
5. **定期复盘** - 使用统计数据优化代码质量

## 兼容性

- 支持所有现代浏览器（Chrome, Firefox, Safari, Edge）
- 部分功能在IE11下可能受限
- 需要 localStorage 支持（错误缓存）
- 需要 navigator.onLine API（网络状态检测）

## 许可证

内部使用，版权归游导旅游所有。
