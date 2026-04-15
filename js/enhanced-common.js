// ===== 旅游网站共用JS - 增强版 =====

// ==================== 页面加载动画 ====================
class PageLoader {
  constructor() {
    this.loader = null;
    this.init();
  }

  init() {
    // 创建加载动画HTML
    this.createLoaderHTML();
    // 监听页面加载
    window.addEventListener('load', () => this.hide());
    // 3秒超时自动隐藏
    setTimeout(() => this.hide(), 3000);
  }

  createLoaderHTML() {
    const loaderHTML = `
      <div class="page-loader" id="pageLoader">
        <div class="loader-content">
          <div class="loader-logo">🌍</div>
          <div class="loader-spinner"></div>
          <div class="loader-text">加载中...</div>
        </div>
      </div>
      <div class="skeleton-screen" id="skeletonScreen">
        <div class="skeleton-nav"></div>
        <div class="skeleton-hero"></div>
        <div class="skeleton-content">
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    this.loader = document.getElementById('pageLoader');
  }

  show() {
    this.loader && (this.loader.style.display = 'flex');
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this.loader && this.loader.classList.add('fade-out');
    const skeleton = document.getElementById('skeletonScreen');
    if (skeleton) {
      skeleton.classList.add('fade-out');
      setTimeout(() => skeleton.remove(), 300);
    }
    setTimeout(() => {
      if (this.loader) this.loader.remove();
      document.body.style.overflow = '';
    }, 300);
  }
}

// ==================== Toast 提示系统 ====================
class Toast {
  static container = null;

  static init() {
    if (this.container) return;
    const html = `
      <div class="toast-container" id="toastContainer">
        <div class="toast-wrapper"></div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    this.container = document.getElementById('toastContainer');
  }

  static show(message, type = 'info', duration = 3000) {
    this.init();
    const id = 'toast_' + Date.now();
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.id = id;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="Toast.remove('${id}')">×</button>
    `;
    this.container.querySelector('.toast-wrapper').appendChild(toast);
    
    // 触发动画
    requestAnimationFrame(() => toast.classList.add('show'));
    
    // 自动移除
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
    return id;
  }

  static remove(id) {
    const toast = document.getElementById(id);
    if (toast) {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }
  }

  static success(message, duration) { return this.show(message, 'success', duration); }
  static error(message, duration) { return this.show(message, 'error', duration); }
  static warning(message, duration) { return this.show(message, 'warning', duration); }
  static info(message, duration) { return this.show(message, 'info', duration); }
}

// ==================== 表单验证系统 ====================
class FormValidator {
  constructor(form, options = {}) {
    this.form = form;
    this.options = {
      validateOnBlur: true,
      validateOnInput: false,
      showErrorMessages: true,
      ...options
    };
    this.init();
  }

  init() {
    if (!this.form) return;
    
    // 添加 novalidate 禁用浏览器默认提示
    this.form.setAttribute('novalidate', 'true');
    
    // 绑定验证事件
    const inputs = this.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (this.options.validateOnBlur) {
        input.addEventListener('blur', () => this.validateField(input));
      }
      if (this.options.validateOnInput) {
        input.addEventListener('input', () => this.clearError(input));
      }
    });

    // 表单提交验证
    this.form.addEventListener('submit', (e) => {
      if (!this.validateAll()) {
        e.preventDefault();
        Toast.warning('请检查表单中的错误');
      }
    });
  }

  validateAll() {
    let isValid = true;
    const inputs = this.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    return isValid;
  }

  validateField(input) {
    const value = input.value.trim();
    const type = input.type;
    const required = input.hasAttribute('required');
    
    // 清除之前的错误
    this.clearError(input);

    // 必填验证
    if (required && !value) {
      this.showError(input, '此项为必填项');
      return false;
    }

    // 类型验证
    if (value) {
      switch (type) {
        case 'email':
          if (!this.isValidEmail(value)) {
            this.showError(input, '请输入有效的邮箱地址');
            return false;
          }
          break;
        case 'tel':
        case 'phone':
          if (!this.isValidPhone(value)) {
            this.showError(input, '请输入有效的手机号码');
            return false;
          }
          break;
        case 'url':
          if (!this.isValidURL(value)) {
            this.showError(input, '请输入有效的网址');
            return false;
          }
          break;
      }
    }

    // 自定义验证
    const customValidator = input.dataset.validator;
    if (customValidator && !this.runCustomValidator(input, customValidator, value)) {
      return false;
    }

    // 长度验证
    const minLength = input.dataset.minLength;
    const maxLength = input.dataset.maxLength;
    if (minLength && value.length < minLength) {
      this.showError(input, `至少需要 ${minLength} 个字符`);
      return false;
    }
    if (maxLength && value.length > maxLength) {
      this.showError(input, `最多只能输入 ${maxLength} 个字符`);
      return false;
    }

    // 成功状态
    if (value) {
      this.showSuccess(input);
    }
    return true;
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  }

  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  runCustomValidator(input, validator, value) {
    const validators = {
      password: () => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value) || this.showError(input, '密码需包含字母和数字，至少8位'),
      confirmPassword: () => {
        const password = this.form.querySelector('input[name="password"]') || this.form.querySelector('input[data-validator="password"]');
        return !password || value === password.value || this.showError(input, '两次密码输入不一致');
      },
      idCard: () => /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value) || this.showError(input, '请输入有效的身份证号码'),
      positiveNumber: () => /^[1-9]\d*$/.test(value) || this.showError(input, '请输入正整数'),
      range: () => {
        const min = parseFloat(input.dataset.min);
        const max = parseFloat(input.dataset.max);
        const num = parseFloat(value);
        return (num >= min && num <= max) || this.showError(input, `数值需在 ${min} - ${max} 之间`);
      }
    };
    return validators[validator] ? validators[validator]() : true;
  }

  showError(input, message) {
    input.classList.add('error');
    input.classList.remove('success');
    
    if (this.options.showErrorMessages) {
      const existingError = input.parentElement.querySelector('.field-error');
      if (existingError) existingError.remove();
      
      const errorEl = document.createElement('div');
      errorEl.className = 'field-error';
      errorEl.textContent = message;
      input.parentElement.appendChild(errorEl);
      
      // 添加抖动动画
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
    }
  }

  showSuccess(input) {
    input.classList.add('success');
    input.classList.remove('error');
    const errorEl = input.parentElement.querySelector('.field-error');
    if (errorEl) errorEl.remove();
  }

  clearError(input) {
    input.classList.remove('error', 'shake');
    const errorEl = input.parentElement.querySelector('.field-error');
    if (errorEl) errorEl.remove();
  }
}

// ==================== 返回顶部按钮 ====================
class BackToTop {
  constructor() {
    this.button = null;
    this.create();
  }

  create() {
    const html = `<button class="back-to-top" id="backToTop" aria-label="返回顶部">↑</button>`;
    document.body.insertAdjacentHTML('beforeend', html);
    this.button = document.getElementById('backToTop');
    this.bindEvents();
  }

  bindEvents() {
    // 点击返回顶部
    this.button.addEventListener('click', () => {
      this.button.classList.add('clicked');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => this.button.classList.remove('clicked'), 300);
    });

    // 滚动显示/隐藏
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY || document.documentElement.scrollTop;
          this.button.classList.toggle('visible', scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    });
  }
}

// ==================== 按钮效果增强 ====================
function enhanceButtons() {
  document.querySelectorAll('.btn').forEach(btn => {
    // 添加点击涟漪效果
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.cssText = `
        position: absolute;
        background: rgba(255,255,255,0.4);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        left: ${x}px;
        top: ${y}px;
        width: 100px;
        height: 100px;
        margin-left: -50px;
        margin-top: -50px;
      `;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      // 添加点击反馈
      this.classList.add('btn-clicked');
      setTimeout(() => this.classList.remove('btn-clicked'), 150);
    });
  });
}

// ==================== 图片懒加载增强 ====================
function lazyLoadImages() {
  // 使用原生loading属性（现代浏览器）
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.addEventListener('load', () => img.classList.add('loaded'));
    img.addEventListener('error', () => img.classList.add('error'));
  });

  // 使用IntersectionObserver（兼容性）
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.addEventListener('load', () => img.classList.add('loaded'));
          img.addEventListener('error', () => img.classList.add('error'));
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '100px', threshold: 0.1 });

    images.forEach(img => observer.observe(img));
  } else {
    // 降级处理
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

// ==================== 移动端触摸优化 ====================
function enhanceMobileTouch() {
  // 禁用双击缩放
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // 按钮触摸高亮
  document.querySelectorAll('.btn, button, a.btn, .card, .nav-links a').forEach(el => {
    el.addEventListener('touchstart', function() {
      this.classList.add('touch-active');
    });
    el.addEventListener('touchend', function() {
      setTimeout(() => this.classList.remove('touch-active'), 150);
    });
  });

  // 移动端表单自动聚焦优化
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    // 聚焦时滚动到可见区域
    input.addEventListener('focus', function() {
      setTimeout(() => {
        this.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    });
  });

  // 下拉刷新提示
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
  }
}

// ==================== 平滑滚动增强 ====================
function initSmoothScroll() {
  // 所有锚点链接平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80; // 导航栏偏移
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 设置CSS scroll-behavior
  document.documentElement.style.scrollBehavior = 'smooth';
}

// ==================== 滚动动画 ====================
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-in, .slide-up, .zoom-in').forEach(el => {
    observer.observe(el);
  });
}

// ==================== 原有功能增强 ====================

// 移动端导航切换
function toggleNav() {
  const nav = document.querySelector('.nav-links');
  const toggle = document.querySelector('.nav-toggle');
  if (nav && toggle) {
    nav.classList.toggle('open');
    toggle.classList.toggle('active');
    // 添加body滚动锁定
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  }
}

// 标签页切换
function switchTab(tabId, btnElement) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  
  const target = document.getElementById(tabId);
  if (target) {
    target.classList.add('active');
    target.classList.add('lazy-loaded');
  }
  if (btnElement) {
    btnElement.classList.add('active');
  }
}

// FAQ手风琴
function toggleFaq(element) {
  const item = element.closest('.faq-item');
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
  if (!wasOpen) {
    item.classList.add('open');
  }
}

// 导航高亮
function highlightNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .sidebar-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// 检查登录状态
async function checkAuthStatus() {
  const authLink = document.getElementById('authLink');
  if (!authLink) return;
  
  const sessionStr = localStorage.getItem('supabase.auth.token');
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session && session.currentSession) {
        authLink.href = 'user-center.html';
        authLink.innerHTML = '👤 我的';
        authLink.classList.add('logged-in');
        return;
      }
    } catch (e) {}
  }
  
  authLink.href = 'login.html';
  authLink.innerHTML = '🔐 登录';
  authLink.classList.remove('logged-in');
}

// 表单提交处理
function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const validator = new FormValidator(form);
  
  if (validator.validateAll()) {
    Toast.success('提交成功！我们会尽快与您联系');
    form.reset();
    // 清除成功状态
    form.querySelectorAll('.success').forEach(el => el.classList.remove('success'));
  }
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
  // 初始化页面加载动画
  new PageLoader();
  
  // 初始化返回顶部按钮
  new BackToTop();
  
  // 初始化各种功能
  highlightNav();
  checkAuthStatus();
  lazyLoadImages();
  enhanceButtons();
  enhanceMobileTouch();
  initSmoothScroll();
  initScrollAnimations();
  
  // 自动初始化表单验证
  document.querySelectorAll('form').forEach(form => {
    new FormValidator(form);
  });
  
  // 初始化第一个标签
  const firstTab = document.querySelector('.tab');
  if (firstTab) firstTab.click();
  
  // 初始化第一个FAQ
  const firstFaq = document.querySelector('.faq-question');
  if (firstFaq) firstFaq.click();
});

// 导出全局函数
window.toggleNav = toggleNav;
window.switchTab = switchTab;
window.toggleFaq = toggleFaq;
window.handleSubmit = handleSubmit;
window.Toast = Toast;
window.FormValidator = FormValidator;
