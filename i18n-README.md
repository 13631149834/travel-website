# 国际化 (i18n) 系统使用说明

## 概述
游导旅游网站已支持中英文切换功能，用户选择的语言会自动保存到浏览器本地存储。

## 文件结构

### 创建的文件
- `js/i18n.js` - 国际化核心配置文件

### 修改的文件
1. `index.html` - 首页
2. `guides.html` - 导游列表页
3. `login.html` - 登录页
4. `register.html` - 注册页
5. `components/navbar.html` - 导航栏组件
6. `css/style.css` - 样式文件（添加语言切换按钮样式）

## 使用方法

### 1. 页面引入
在需要国际化的页面 `<head>` 中添加：
```html
<script src="js/i18n.js"></script>
```

### 2. 标记翻译文本
在 HTML 元素上添加 `data-i18n` 属性：

```html
<!-- 文本内容 -->
<h1 data-i18n="hero.title">探索世界，从这里开始</h1>

<!-- 占位符 -->
<input type="text" data-i18n-placeholder="hero.searchPlaceholder">

<!-- 标题属性 -->
<a href="#" data-i18n-title="nav.search">🔍</a>

<!-- HTML 内容（支持 HTML） -->
<div data-i18n-html="common.terms"><strong>协议</strong></div>
```

### 3. 语言切换按钮
在页面中添加语言切换按钮：
```html
<div class="lang-switcher">
  <button class="lang-btn active" data-lang="zh" data-lang-btn>中文</button>
  <button class="lang-btn" data-lang="en" data-lang-btn>EN</button>
</div>
```

## 翻译键值说明

翻译键值采用 `分类.键名` 的格式：

### 导航栏 (nav)
- `nav.home` - 首页
- `nav.guides` - 找导游
- `nav.visa` - 签证中心
- `nav.routes` - 线路
- `nav.knowledge` - 知识
- `nav.tools` - 工具
- `nav.contact` - 咨询
- `nav.login` - 登录
- `nav.register` - 注册

### 首页 Hero (hero)
- `hero.tagline` - 标语
- `hero.title` - 主标题
- `hero.subtitle` - 副标题
- `hero.forTourist` - 开启旅程
- `hero.forGuide` - 成为导游
- `hero.searchPlaceholder` - 搜索框占位符

### 热门目的地 (destinations)
- `destinations.title` - 热门目的地标题
- `destinations.japan` - 日本
- `destinations.thailand` - 泰国
- `destinations.europe` - 欧洲
- 等...

### 导游列表 (guides)
- `guides.title` - 页面标题
- `guides.searchPlaceholder` - 搜索占位符
- `guides.searchBtn` - 搜索按钮

### 登录页面 (login)
- `login.title` - 标题
- `login.email` - 邮箱/手机号标签
- `login.password` - 密码标签
- `login.loginBtn` - 登录按钮
- `login.forgotPassword` - 忘记密码
- `login.noAccount` - 还没有账号

### 注册页面 (register)
- `register.title` - 标题
- `register.phone` - 手机号
- `register.verifyCode` - 验证码
- `register.password` - 设置密码
- `register.registerBtn` - 注册按钮

## JavaScript API

### 翻译函数
```javascript
// 获取翻译
const text = i18n.t('hero.title'); // 返回当前语言的翻译

// 获取当前语言
const lang = i18n.getLang(); // 'zh' 或 'en'

// 设置语言
i18n.setLang('en'); // 切换到英文
i18n.setLang('zh'); // 切换到中文

// 是否是英文
if (i18n.isEnglish()) {
  // 英文环境下执行
}
```

### 事件监听
```javascript
// 监听语言切换事件
window.addEventListener('langChange', function(e) {
  console.log('Language changed to:', e.detail.lang);
  // 可以在这里执行其他需要语言切换时更新的操作
});
```

## localStorage 存储

语言偏好存储在浏览器的 localStorage 中：
- Key: `youdao_lang`
- Value: `zh` 或 `en`

页面加载时会自动读取并应用用户上次选择的语言。

## 添加新的翻译

在 `js/i18n.js` 文件的 `translations` 对象中添加新的翻译：

```javascript
const translations = {
  // 现有翻译...
  
  // 新增分类
  newCategory: {
    key1: { zh: '中文内容', en: 'English Content' },
    key2: { zh: '另一个', en: 'Another' }
  }
};
```

然后在 HTML 中使用：
```html
<span data-i18n="newCategory.key1">中文内容</span>
```

## 浏览器语言自动检测

首次访问时，系统会自动检测浏览器语言：
- 如果浏览器语言以 `en` 开头，自动设置为英文
- 否则默认为中文

## 注意事项

1. 确保 `js/i18n.js` 在页面底部 `<script>` 标签之前引入
2. `data-i18n` 属性会自动在 DOMContentLoaded 时初始化
3. 如果某个翻译键不存在，会在控制台输出警告并返回键名
