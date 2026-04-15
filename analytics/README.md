# 数据统计系统

## 概述

游导旅游平台数据统计系统，提供完整的用户分析、业务分析、内容分析、运营分析功能，以及数据看板和报表系统。

## 目录结构

```
js/analytics/
├── user-analytics.js       # 用户分析模块
├── business-analytics.js    # 业务分析模块
├── content-analytics.js     # 内容分析模块
├── operation-analytics.js   # 运营分析模块
├── data-export.js           # 数据导出模块
├── analytics-config-template.js  # 配置模板
├── analytics-usage-example.js    # 使用示例
├── baidu-tongji.js          # 百度统计集成
├── channel-tracker.js       # 渠道追踪
├── custom-tracker.js        # 自定义事件追踪
├── ga4-integration.js       # GA4集成
└── init-analytics.js        # 初始化脚本
```

## 模块说明

### 1. 用户分析 (user-analytics.js)

**功能：**
- 用户画像分析（年龄、性别、地域、兴趣）
- 用户行为分析（浏览、搜索、收藏、下单）
- 用户留存分析（次日、3日、7日、14日、30日留存）
- 用户活跃度分析（DAU、WAU、MAU、使用频率）

**主要方法：**
```javascript
// 初始化
UserAnalytics.init();

// 获取用户画像数据
const profile = await UserAnalytics.loadUserProfile();

// 获取行为数据
const behavior = await UserAnalytics.loadBehaviorData();

// 获取留存数据
const retention = await UserAnalytics.loadRetentionData();

// 获取活跃度数据
const activity = await UserAnalytics.loadActivityData();

// 导出数据
await UserAnalytics.exportUserData('excel');
```

### 2. 业务分析 (business-analytics.js)

**功能：**
- 订单统计（总量、状态分布、支付方式）
- 营收分析（日报、周报、月报、预测）
- 导游分析（评分分布、专业领域、地区分布）
- 转化漏斗（访问→浏览→下单→支付）

**主要方法：**
```javascript
// 初始化
BusinessAnalytics.init();

// 获取订单数据
const orders = await BusinessAnalytics.loadOrderData();

// 获取营收数据
const revenue = await BusinessAnalytics.loadRevenueData();

// 获取导游数据
const guides = await BusinessAnalytics.loadGuideData();

// 获取转化数据
const conversion = await BusinessAnalytics.loadConversionData();

// 导出数据
await BusinessAnalytics.exportBusinessData('excel');
```

### 3. 内容分析 (content-analytics.js)

**功能：**
- 页面访问分析（PV、UV、跳出率、停留时间）
- 热门内容排行（热门路线、热门导游）
- 搜索分析（关键词、搜索意图、零结果率）
- 分享分析（分享平台、分享内容类型）

**主要方法：**
```javascript
// 初始化
ContentAnalytics.init();

// 获取页面访问数据
const pageAccess = await ContentAnalytics.loadPageAccessData();

// 获取热门内容数据
const hotContent = await ContentAnalytics.loadHotContentData();

// 获取搜索数据
const search = await ContentAnalytics.loadSearchData();

// 获取分享数据
const share = await ContentAnalytics.loadShareData();

// 导出数据
await ContentAnalytics.exportContentData('excel');
```

### 4. 运营分析 (operation-analytics.js)

**功能：**
- 活动效果分析（投入产出、参与率、转化率）
- 优惠券分析（发放量、使用量、使用率）
- 推广渠道分析（各渠道ROI、CPA、LTV）
- ROI分析（投资回报、用户生命周期价值）

**主要方法：**
```javascript
// 初始化
OperationAnalytics.init();

// 获取活动数据
const activities = await OperationAnalytics.loadActivityData();

// 获取优惠券数据
const coupons = await OperationAnalytics.loadCouponData();

// 获取渠道数据
const channels = await OperationAnalytics.loadChannelData();

// 获取ROI数据
const roi = await OperationAnalytics.loadROIData();

// 导出数据
await OperationAnalytics.exportOperationData('excel');
```

### 5. 数据导出 (data-export.js)

**功能：**
- 支持多种格式导出（Excel、CSV、PDF、JSON）
- 批量导出
- 自定义报表生成

**主要方法：**
```javascript
// 导出为Excel
DataExporter.export(data, 'filename', 'excel');

// 导出为CSV
DataExporter.export(data, 'filename', 'csv');

// 导出为JSON
DataExporter.export(data, 'filename', 'json');

// 导出为PDF
DataExporter.export(data, 'filename', 'pdf');

// 导出用户分析
await DataExporter.exportUserAnalytics();

// 导出完整报表
await DataExporter.exportFullReport();
```

## 页面文件

### 数据看板 (admin/data-dashboard.html)

实时数据可视化页面，展示：
- 实时数据监控
- 核心指标卡片
- 趋势图表
- 对比分析
- 排行榜

### 报表中心 (admin/reports.html)

报表管理页面，支持：
- 日报生成
- 周报生成
- 月报生成
- 自定义报表
- 定时任务订阅

## 使用示例

### 基础使用

```javascript
// 在HTML中引入
<script src="js/analytics/user-analytics.js"></script>
<script src="js/analytics/business-analytics.js"></script>

// 初始化各模块
UserAnalytics.init();
BusinessAnalytics.init();
```

### 在页面中使用图表

```html
<canvas id="userGrowthChart"></canvas>
<canvas id="orderVolumeChart"></canvas>

<script>
UserAnalytics.renderUserGrowthChart(data.dailyActive);
BusinessAnalytics.renderOrderTrendChart(data.daily);
</script>
```

### 数据导出

```javascript
// 导出用户数据
async function exportData() {
    await DataExporter.exportUserAnalytics();
}

// 导出完整报表
async function exportFullReport() {
    await DataExporter.exportFullReport();
}
```

## 数据结构

### 用户画像数据
```javascript
{
    total: 12568,
    newToday: 156,
    active: 8942,
    activeRate: 71.1,
    demographics: {
        age: [...],
        gender: [...],
        region: [...],
        interest: [...]
    }
}
```

### 订单数据
```javascript
{
    summary: {
        totalOrders: 3568,
        pendingOrders: 156,
        completedOrders: 3292
    },
    daily: {
        labels: [...],
        orders: [...],
        revenue: [...]
    }
}
```

## 配置

各模块支持自定义配置：

```javascript
UserAnalytics.config = {
    apiEndpoint: '/api/analytics/user',
    cacheTime: 5 * 60 * 1000,  // 5分钟缓存
    chartColors: ['#667eea', '#764ba2', ...]
};
```

## 注意事项

1. 所有模块使用本地缓存，缓存时间默认为5分钟
2. 图表使用Chart.js库，需要先引入
3. 数据导出依赖浏览器下载功能
4. PDF导出通过打印功能实现
5. 实际使用时需要替换为真实API接口

## 更新日志

### v1.0.0 (2024-07)
- 初始版本发布
- 用户分析、业务分析、内容分析、运营分析模块
- 数据看板页面
- 报表系统页面
- 数据导出功能
