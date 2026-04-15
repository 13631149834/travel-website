# 新用户引导系统 - 使用说明

## 创建的文件

| 文件路径 | 说明 |
|---------|------|
| `css/onboarding.css` | 引导系统样式文件 |
| `js/onboarding.js` | 引导系统逻辑文件 |
| `components/onboarding.html` | 引导组件说明文件 |

## 已集成的页面

- `index.html` - 首页
- `guides.html` - 找导游
- `routes.html` - 精品路线
- `tools.html` - 实用工具
- `community.html` - 旅行社区

## 功能特性

### 1. 首次访问检测
- 使用 localStorage 存储 `travel_onboarded` 标记
- 首次访问自动触发引导

### 2. 分步骤引导
引导包含6个步骤：
1. **欢迎页** - 网站介绍
2. **找导游** - 导游筛选、评价、预约功能介绍
3. **精品路线** - 路线浏览功能介绍
4. **实用工具** - 工具集介绍
5. **旅行社区** - 社区互动介绍
6. **帮助入口** - 帮助菜单入口

### 3. 跳过/完成记录
- 点击"跳过"直接完成引导
- 完成后存储 localStorage 标记
- 不会再自动触发

### 4. 可重新触发
提供两种方式重新触发：
```javascript
// 方式1：调用全局函数
window.showOnboarding();

// 方式2：直接调用系统方法
window.onboardingSystem.restart();
```

## 视觉特性

- 遮罩层高亮目标元素
- 引导卡片跟随定位
- 进度点指示当前步骤
- 动画过渡效果
- 响应式移动端适配

## 帮助入口

页面左下角有永久显示的帮助入口按钮（❓），点击可打开帮助菜单：
- 查看新手引导
- 联系客服
- 常见问题

## 自定义修改

如需修改引导步骤内容，编辑 `js/onboarding.js` 中的 `ONBOARDING_STEPS` 数组：

```javascript
const ONBOARDING_STEPS = [
  {
    id: 'step-id',
    icon: '🎯',
    title: '步骤标题',
    content: '步骤描述文字',
    position: 'bottom', // 位置：center/bottom/top/left/right/bottom-left/bottom-right
    arrow: 'top',       // 箭头方向：top/bottom/left/right
    target: 'a[href="xxx.html"]', // 高亮目标选择器
    showSkip: true      // 是否显示跳过按钮
  }
];
```

## 兼容性

- 支持所有现代浏览器
- 支持响应式布局
- 支持暗色主题（通过 `data-theme="dark"` 属性）
