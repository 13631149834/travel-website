# 用户体验增强功能说明

## 已完成的功能

### 1. 页面加载动画/骨架屏效果
- 添加了简洁的页面加载动画（logo + 旋转加载器）
- 添加了骨架屏效果，模拟页面布局结构
- 页面加载完成后自动淡出消失
- 3秒超时自动隐藏

### 2. 表单验证提示
- 实时表单验证（失焦时验证）
- 支持多种验证类型：邮箱、手机、URL、密码、身份证等
- 友好的错误提示样式（红色边框 + 错误图标）
- 成功状态样式（绿色边框）
- 抖动动画反馈

### 3. Toast 提示系统
- 四种类型：success（成功）、error（错误）、warning（警告）、info（信息）
- 自动居中显示
- 支持手动关闭
- 自动消失（默认3秒）
- 使用示例：
  ```javascript
  Toast.success('提交成功！');
  Toast.error('操作失败，请重试');
  Toast.warning('请检查输入');
  Toast.info('这是一条提示');
  ```

### 4. 按钮效果优化
- 悬停时轻微上浮效果
- 点击时涟漪动画效果
- 点击反馈（缩小效果）
- 阴影增强效果
- 禁用状态样式

### 5. 平滑滚动效果
- 所有锚点链接平滑滚动
- 考虑导航栏高度偏移
- 支持减 motion 偏好设置

### 6. 图片懒加载
- 支持原生 `loading="lazy"` 属性
- 支持 `data-src` 自定义懒加载
- 淡入动画效果
- 错误状态处理

### 7. 返回顶部按钮
- 滚动超过400px时显示
- 平滑滚动回顶部
- 悬停和点击效果
- 移动端自适应尺寸

### 8. 移动端触摸体验优化
- 禁用双击缩放
- 按钮触摸高亮反馈
- 表单聚焦时自动滚动到可见区域
- iOS 设备字体大小优化（防止缩放）
- 卡片触摸反馈效果
- 导航滚动优化

## 修改的文件列表

### 新增文件
1. `js/enhanced-common.js` - 增强的JavaScript功能
2. `css/enhanced.css` - 增强的CSS样式
3. `update-scripts.sh` - 批量更新脚本

### 修改的文件
所有HTML文件已添加以下引用：
- `css/enhanced.css`
- `js/enhanced-common.js`

主要修改的页面：
- `index.html`
- `contact.html`
- `guide-apply.html`
- `guides.html`
- `faq.html`
- `visa.html`
- 以及其他所有HTML页面

## 使用方法

增强功能已自动加载，无需额外配置。

### 自定义表单验证

在表单中添加 `data-validator` 属性：
```html
<input type="password" data-validator="password" placeholder="密码">
<input type="password" data-validator="confirmPassword" placeholder="确认密码">
<input type="text" data-min-length="2" placeholder="最少2个字符">
<input type="number" data-min="1" data-max="100" placeholder="1-100">
```

### 使用 Toast 提示
```javascript
// 成功提示
Toast.success('操作成功！');

// 错误提示
Toast.error('出错了，请重试');

// 警告提示
Toast.warning('请注意以下事项');

// 信息提示
Toast.info('这是一条提示');

// 自定义显示时长（毫秒）
Toast.success('5秒后消失', 5000);

// 手动关闭
const id = Toast.info('可手动关闭');
Toast.remove(id);
```

### 自定义表单验证
```javascript
// 手动验证表单
const form = document.querySelector('form');
const validator = new FormValidator(form);
if (validator.validateAll()) {
  // 表单验证通过
}
```

## 注意事项

1. 所有动画效果都遵循 `prefers-reduced-motion` 媒体查询
2. 移动端自动隐藏加载动画，避免影响首屏渲染
3. Toast 提示在移动端显示在屏幕底部，更易操作
4. 保持页面简洁，不添加过多装饰性动画
