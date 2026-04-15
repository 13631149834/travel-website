/**
 * 游导旅游 - 国际化 (i18n) 系统
 * 支持中文和英文切换，用户偏好保存到 localStorage
 */

// 语言配置
const I18N_CONFIG = {
  defaultLang: 'zh',           // 默认语言
  storageKey: 'youdao_lang',   // localStorage key
  supportedLangs: ['zh', 'en'] // 支持的语言
};

// 翻译数据
const translations = {
  // ===== 导航栏 =====
  nav: {
    home: { zh: '首页', en: 'Home' },
    guides: { zh: '找导游', en: 'Find Guides' },
    visa: { zh: '签证中心', en: 'Visa Center' },
    routes: { zh: '线路', en: 'Routes' },
    knowledge: { zh: '知识', en: 'Knowledge' },
    guideContent: { zh: '攻略', en: 'Guide' },
    tools: { zh: '工具', en: 'Tools' },
    about: { zh: '关于我们', en: 'About Us' },
    contact: { zh: '咨询', en: 'Contact' },
    login: { zh: '登录', en: 'Login' },
    register: { zh: '注册', en: 'Register' },
    search: { zh: '搜索', en: 'Search' },
    userCenter: { zh: '用户中心', en: 'User Center' },
    guideDashboard: { zh: '导游工作台', en: 'Guide Dashboard' },
    logout: { zh: '退出', en: 'Logout' }
  },

  // ===== 首页 Hero 区域 =====
  hero: {
    tagline: { zh: '旅行从此不同', en: 'Travel Differently' },
    title: { zh: '探索世界，从这里开始', en: 'Explore the World, Start Here' },
    subtitle: { zh: '连接优秀导游与旅行者，让每一次出发都充满期待', en: 'Connect with expert guides and travelers for unforgettable journeys' },
    forTourist: { zh: '开启旅程', en: 'Start Your Journey' },
    forTouristDesc: { zh: '发现专属导游', en: 'Find Your Perfect Guide' },
    forGuide: { zh: '成为导游', en: 'Become a Guide' },
    forGuideDesc: { zh: '开启事业新篇章', en: 'Start Your New Career' },
    searchPlaceholder: { zh: '搜索目的地、导游、线路...', en: 'Search destinations, guides, routes...' },
    searchBtn: { zh: '搜索', en: 'Search' },
    hotSearch: { zh: '热门搜索:', en: 'Hot Searches:' }
  },

  // ===== 首页 - 热门目的地 =====
  destinations: {
    title: { zh: '🌏 热门目的地', en: '🌏 Popular Destinations' },
    subtitle: { zh: '发现全球最受欢迎的旅行目的地，开启你的下一段旅程', en: 'Discover the world\'s most popular travel destinations' },
    viewAll: { zh: '查看全部 →', en: 'View All →' },
    japan: { zh: '日本', en: 'Japan' },
    japanDesc: { zh: '樱花温泉 · 和风文化', en: 'Cherry Blossoms · Japanese Culture' },
    thailand: { zh: '泰国', en: 'Thailand' },
    thailandDesc: { zh: '佛寺美食', en: 'Temples & Cuisine' },
    europe: { zh: '欧洲', en: 'Europe' },
    europeDesc: { zh: '古堡艺术', en: 'Castles & Art' },
    australia: { zh: '澳新', en: 'Australia & NZ' },
    australiaDesc: { zh: '自然冰川', en: 'Nature & Glaciers' },
    southeast: { zh: '东南亚', en: 'Southeast Asia' },
    southeastDesc: { zh: '海岛度假', en: 'Island Getaways' },
    guides: { zh: '位导游', en: ' Guides' }
  },

  // ===== 首页 - 为什么选择我们 =====
  whyUs: {
    title: { zh: '✨ 为什么选择游导', en: '✨ Why Choose YouDao' },
    subtitle: { zh: '专业、可信赖的旅行伙伴，让你的旅程更精彩', en: 'Your professional and trusted travel partner' },
    selectGuides: { zh: '严选导游', en: 'Vetted Guides' },
    selectGuidesDesc: { zh: '所有导游经过专业认证审核，确保服务品质', en: 'All guides are professionally certified for quality service' },
    safe: { zh: '安全保障', en: 'Safe & Secure' },
    safeDesc: { zh: '完善的评价体系，旅行更安心', en: 'Comprehensive review system for peace of mind' },
    efficient: { zh: '高效匹配', en: 'Smart Matching' },
    efficientDesc: { zh: '智能推荐系统，快速找到合适的导游', en: 'AI-powered matching to find the perfect guide' },
    value: { zh: '超值的优惠', en: 'Best Value' },
    valueDesc: { zh: '透明定价，无隐形费用', en: 'Transparent pricing, no hidden fees' }
  },

  // ===== 导游列表页 =====
  guides: {
    title: { zh: '找到合适的导游', en: 'Find Your Perfect Guide' },
    subtitle: { zh: '专业认证导游，为你定制专属旅程', en: 'Certified professional guides for your custom journey' },
    searchPlaceholder: { zh: '搜索导游姓名或擅长领域...', en: 'Search by name or specialty...' },
    searchBtn: { zh: '搜索', en: 'Search' },
    filterRegion: { zh: '地区', en: 'Region' },
    filterLanguage: { zh: '语言', en: 'Language' },
    filterSpecialty: { zh: '特长', en: 'Specialty' },
    filterAll: { zh: '全部', en: 'All' },
    resultCount: { zh: '共找到', en: 'Found' },
    resultGuides: { zh: '位导游', en: ' guides' },
    rating: { zh: '评分', en: 'Rating' },
    reviews: { zh: '条评价', en: ' reviews' },
    price: { zh: '元/天', en: '/day' },
    contactBtn: { zh: '立即咨询', en: 'Contact Now' },
    viewProfile: { zh: '查看详情', en: 'View Profile' }
  },

  // ===== 登录页面 =====
  login: {
    title: { zh: '登录', en: 'Login' },
    touristTab: { zh: '我是游客', en: 'I\'m a Tourist' },
    guideTab: { zh: '我是导游', en: 'I\'m a Guide' },
    email: { zh: '邮箱', en: 'Email' },
    emailPlaceholder: { zh: '请输入邮箱', en: 'Enter your email' },
    password: { zh: '密码', en: 'Password' },
    passwordPlaceholder: { zh: '请输入密码', en: 'Enter your password' },
    forgotPassword: { zh: '忘记密码？', en: 'Forgot Password?' },
    loginBtn: { zh: '登录', en: 'Login' },
    noAccount: { zh: '还没有账号？', en: 'Don\'t have an account?' },
    goRegister: { zh: '立即注册 →', en: 'Register Now →' },
    orContinue: { zh: '或使用以下方式继续', en: 'Or continue with' },
    wechatLogin: { zh: '微信登录', en: 'WeChat' },
    phoneLogin: { zh: '手机号登录', en: 'Phone Login' },
    rememberMe: { zh: '记住我', en: 'Remember me' }
  },

  // ===== 注册页面 =====
  register: {
    title: { zh: '注册', en: 'Register' },
    touristTab: { zh: '我是游客', en: 'I\'m a Tourist' },
    guideTab: { zh: '我是导游', en: 'I\'m a Guide' },
    email: { zh: '邮箱', en: 'Email' },
    emailPlaceholder: { zh: '请输入邮箱', en: 'Enter your email' },
    password: { zh: '设置密码', en: 'Set Password' },
    passwordPlaceholder: { zh: '请设置密码', en: 'Create a password' },
    confirmPassword: { zh: '确认密码', en: 'Confirm Password' },
    confirmPlaceholder: { zh: '请再次输入密码', en: 'Confirm your password' },
    phone: { zh: '手机号', en: 'Phone' },
    phonePlaceholder: { zh: '请输入手机号', en: 'Enter your phone number' },
    verifyCode: { zh: '验证码', en: 'Verification Code' },
    verifyPlaceholder: { zh: '请输入验证码', en: 'Enter code' },
    sendCode: { zh: '发送验证码', en: 'Send Code' },
    registerBtn: { zh: '注册', en: 'Register' },
    hasAccount: { zh: '已有账号？', en: 'Already have an account?' },
    goLogin: { zh: '立即登录 →', en: 'Login Now →' },
    agreeTerms: { zh: '我已阅读并同意', en: 'I agree to the' },
    terms: { zh: '《用户协议》', en: 'Terms of Service' },
    privacy: { zh: '《隐私政策》', en: 'Privacy Policy' },
    orContinue: { zh: '或使用以下方式注册', en: 'Or register with' }
  },

  // ===== 通用按钮和标签 =====
  common: {
    submit: { zh: '提交', en: 'Submit' },
    cancel: { zh: '取消', en: 'Cancel' },
    confirm: { zh: '确认', en: 'Confirm' },
    save: { zh: '保存', en: 'Save' },
    edit: { zh: '编辑', en: 'Edit' },
    delete: { zh: '删除', en: 'Delete' },
    back: { zh: '返回', en: 'Back' },
    next: { zh: '下一步', en: 'Next' },
    prev: { zh: '上一步', en: 'Previous' },
    loading: { zh: '加载中...', en: 'Loading...' },
    noData: { zh: '暂无数据', en: 'No Data' },
    success: { zh: '操作成功', en: 'Success' },
    error: { zh: '操作失败', en: 'Error' },
    warning: { zh: '警告', en: 'Warning' },
    required: { zh: '必填', en: 'Required' },
    optional: { zh: '选填', en: 'Optional' }
  },

  // ===== 页脚 =====
  footer: {
    about: { zh: '关于我们', en: 'About Us' },
    contact: { zh: '联系我们', en: 'Contact Us' },
    service: { zh: '服务条款', en: 'Terms of Service' },
    privacy: { zh: '隐私政策', en: 'Privacy Policy' },
    help: { zh: '帮助中心', en: 'Help Center' },
    copyright: { zh: '© 2024 游导旅游 版权所有', en: '© 2024 YouDao Travel. All rights reserved.' },
    ICP: { zh: '备案号', en: 'ICP' }
  }
};

// i18n 核心类
class I18n {
  constructor() {
    this.currentLang = this.getStoredLang();
  }

  // 获取存储的语言
  getStoredLang() {
    const stored = localStorage.getItem(I18N_CONFIG.storageKey);
    if (stored && I18N_CONFIG.supportedLangs.includes(stored)) {
      return stored;
    }
    // 检测浏览器语言
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) {
      return 'en';
    }
    return I18N_CONFIG.defaultLang;
  }

  // 保存语言偏好
  setLang(lang) {
    if (I18N_CONFIG.supportedLangs.includes(lang)) {
      this.currentLang = lang;
      localStorage.setItem(I18N_CONFIG.storageKey, lang);
      this.updatePage();
      this.updateLangButtons();
      // 触发语言切换事件
      window.dispatchEvent(new CustomEvent('langChange', { detail: { lang } }));
    }
  }

  // 获取翻译
  t(key) {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        console.warn(`Translation not found: ${key}`);
        return key;
      }
    }
    
    if (value && value[this.currentLang]) {
      return value[this.currentLang];
    }
    
    // 尝试返回中文默认值
    if (value && value.zh) {
      return value.zh;
    }
    
    return key;
  }

  // 更新页面所有标记了 data-i18n 的元素
  updatePage() {
    // 更新文本内容
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });

    // 更新 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });

    // 更新 title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });

    // 更新 html 内容（支持 HTML）
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      el.innerHTML = this.t(key);
    });

    // 更新文档标题
    const titleEl = document.querySelector('[data-i18n-doc-title]');
    if (titleEl) {
      document.title = this.t('[data-i18n-doc-title]');
    }

    // 更新 html lang 属性
    document.documentElement.lang = this.currentLang === 'en' ? 'en-US' : 'zh-CN';
  }

  // 更新语言切换按钮状态
  updateLangButtons() {
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      if (lang === this.currentLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // 获取当前语言
  getLang() {
    return this.currentLang;
  }

  // 是否是英文
  isEnglish() {
    return this.currentLang === 'en';
  }
}

// 创建全局实例
const i18n = new I18n();

// 初始化函数
function initI18n() {
  // 页面加载时应用语言
  i18n.updatePage();
  i18n.updateLangButtons();

  // 绑定语言切换按钮
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const lang = this.getAttribute('data-lang');
      i18n.setLang(lang);
    });
  });
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', initI18n);

// 导出给外部使用
window.i18n = i18n;
window.I18N_CONFIG = I18N_CONFIG;
