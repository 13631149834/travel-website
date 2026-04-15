# 游导旅游 - 微信小程序

## 项目说明

本目录包含游导旅游平台的微信小程序版本代码，采用了与网页版一致的设计风格。

## 文件结构

```
miniprogram/
├── app.js              # 小程序入口文件
├── app.json            # 全局配置文件
├── app.wxss            # 全局样式文件
├── sitemap.json        # 站点地图配置
├── assets/             # 静态资源
│   └── icons/          # TabBar图标（需自行添加）
└── pages/              # 页面目录
    ├── index/          # 首页
    ├── guide/          # 导游相关
    │   └── list/       # 导游列表页
    ├── destination/    # 目的地相关
    │   └── list/       # 目的地列表页
    └── profile/        # 个人中心
        └── index/      # 个人中心页
```

## 使用步骤

### 1. 获取 AppID
1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 注册并登录微信小程序账号
3. 在「开发」→「开发管理」→「开发设置」中获取 AppID

### 2. 替换 AppID
编辑 `app.js` 文件，将 `YOUR_APP_ID` 替换为您的实际 AppID：
```javascript
const APP_ID = 'YOUR_APP_ID';  // 替换为实际AppID
```

### 3. 添加 TabBar 图标
在 `assets/icons/` 目录下添加以下图标文件（建议尺寸 81x81 像素）：
- `home.png` / `home-active.png` - 首页图标
- `guide.png` / `guide-active.png` - 导游图标
- `destination.png` / `destination-active.png` - 目的地图标
- `profile.png` / `profile-active.png` - 个人中心图标

### 4. 导入项目
1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具
3. 选择「导入项目」
4. 选择本目录作为项目目录
5. 填写 AppID（已在步骤2替换）
6. 点击「确认」导入

## 功能模块

### 首页 (pages/index)
- 搜索栏
- Banner轮播
- 快捷入口（找导游、目的地、签证、工具）
- 明星导游推荐
- 热门目的地
- 旅行工具箱
- 平台数据展示

### 导游列表 (pages/guide/list)
- 筛选功能（全部/热门/优选）
- 排序功能（评分/价格/评价数）
- 导游卡片展示
- 加载更多

### 目的地 (pages/destination/list)
- 热门目的地轮播推荐
- 分类筛选（亚洲/欧洲/美洲/大洋洲）
- 目的地网格展示
- 价格和导游数量显示

### 个人中心 (pages/profile)
- 用户信息展示
- 会员卡
- 订单入口
- 功能菜单（收藏/评价/优惠券等）
- 退出登录

## 设计规范

### 主题色
- 主色：#4F86F7（清新蓝）
- 辅助色：#10B981（清新绿）
- 强调色：#764ba2（紫色）
- 文字色：#424242（深灰）
- 背景色：#FAFAFA（浅灰）

### 圆角
- 小圆角：8rpx
- 中圆角：12rpx
- 大圆角：16rpx

### 字体
- 小程序默认字体
- 建议使用 rpx 单位适配不同屏幕

## 注意事项

1. **API 接口**：当前代码使用静态数据，需在 `app.js` 中配置实际 API 地址
2. **登录功能**：登录模块为演示状态，需接入实际微信登录能力
3. **图标资源**：TabBar 图标需手动添加
4. **发布上线**：发布前需完成小程序备案和审核

## 后续开发

- 导游详情页
- 目的地详情页
- 订单详情页
- 聊天功能
- 支付功能
- 地图功能
- 分享功能

## 联系方式

如有问题，请联系开发团队。
