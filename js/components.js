/**
 * 网站精致化2.0 - 通用工具库 (批次L)
 * 包含：安全/数据持久化/通知/动画规范/空状态
 */

// ========================
// 1. 安全工具
// ========================
const Security = {
  // XSS过滤 - 避免innerHTML拼接用户输入
  escapeHtml(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // 安全创建元素（使用textContent而非innerHTML）
  safeCreateElement(tag, text, attributes = {}) {
    const el = document.createElement(tag);
    el.textContent = text;
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
    return el;
  },

  // 外部链接安全
  safeExternalLink(url) {
    const a = document.createElement('a');
    a.href = url;
    a.rel = 'noopener noreferrer';
    a.target = '_blank';
    return a;
  },

  // 搜索输入过滤
  sanitizeSearchInput(input) {
    return this.escapeHtml(input.trim().substring(0, 200));
  },

  // 验证URL
  isSafeUrl(url) {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
};

// ========================
// 2. 数据持久化管理
// ========================
const StorageManager = {
  PREFIX: 'yd_',
  VERSION: '1.0',

  // 容量检测
  isAvailable() {
    try {
      localStorage.setItem('__test__', '1');
      localStorage.removeItem('__test__');
      return true;
    } catch (e) {
      console.warn('localStorage不可用:', e);
      return false;
    }
  },

  // 获取数据（带版本控制）
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      if (!raw) return defaultValue;
      const parsed = JSON.parse(raw);
      // 版本检查
      if (parsed.version !== this.VERSION) {
        console.warn(`数据版本不匹配: ${key}`, parsed.version, '->', this.VERSION);
        // 可选：迁移或清除旧数据
        // return this.migrate(key, parsed) || defaultValue;
      }
      return parsed.data ?? defaultValue;
    } catch (e) {
      console.error(`读取数据失败: ${key}`, e);
      return defaultValue;
    }
  },

  // 保存数据（带版本号）
  set(key, value) {
    try {
      const data = {
        version: this.VERSION,
        data: value,
        timestamp: Date.now()
      };
      localStorage.setItem(this.PREFIX + key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`保存数据失败: ${key}`, e);
      // 容量满时尝试清理
      if (e.name === 'QuotaExceededError') {
        this.cleanup();
        try {
          localStorage.setItem(this.PREFIX + key, JSON.stringify({ version: this.VERSION, data: value, timestamp: Date.now() }));
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  },

  // 删除数据
  remove(key) {
    localStorage.removeItem(this.PREFIX + key);
  },

  // 备份数据
  backup() {
    const backup = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        backup[key] = localStorage.getItem(key);
      }
    }
    try {
      localStorage.setItem(this.PREFIX + 'backup', JSON.stringify({
        ...backup,
        _backupTime: Date.now()
      }));
      return true;
    } catch (e) {
      console.warn('备份失败:', e);
      return false;
    }
  },

  // 清理过期数据
  cleanup() {
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30天
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.PREFIX) && key !== this.PREFIX + 'backup') {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.timestamp && now - parsed.timestamp > maxAge) {
              localStorage.removeItem(key);
            }
          }
        } catch {}
      }
    }
  },

  // 清除所有数据（带恢复引导）
  clearAll() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));
    Notification.toast('数据已清除', 'info');
    // 提示用户如何恢复
    setTimeout(() => {
      Notification.alert('如需恢复数据，请刷新页面', '提示');
    }, 500);
  }
};

// ========================
// 3. 通知系统
// ========================
const Notification = {
  container: null,

  // 初始化容器
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.id = 'toastContainer';
      this.container.style.cssText = 'position:fixed;top:70px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;max-width:90vw;';
      document.body.appendChild(this.container);
    }
  },

  // Toast提示 - 2-3秒自动消失
  toast(message, type = 'info', duration = 2500) {
    this.init();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = 'background:#FFFFFF;border-radius:12px;padding:14px 20px;box-shadow:0 4px 24px rgba(0,0,0,0.15);display:flex;align-items:center;gap:12px;min-width:280px;animation:toastIn 0.3s ease;pointer-events:auto;';

    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const colors = { success: '#0D9488', error: '#0F766E', warning: '#D97706', info: '#2563EB' };

    toast.innerHTML = `
      <span style="font-size:1.2rem;flex-shrink:0;color:${colors[type]}">${icons[type]}</span>
      <span style="flex:1;font-size:0.88rem;color:#333;max-width:300px;word-break:break-word">${Security.escapeHtml(message)}</span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;font-size:1rem;cursor:pointer;color:#999;padding:4px;flex-shrink:0">×</button>
    `;

    this.container.appendChild(toast);

    // 自动消失
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);

    return toast;
  },

  // Alert页面内嵌提示
  alert(message, type = 'info') {
    const colors = {
      info: { bg: '#EFF6FF', border: '#2563EB' },
      success: { bg: '#F0FDFA', border: '#0D9488' },
      error: { bg: '#FFF5F5', border: '#0F766E' },
      warning: { bg: '#FFFBEB', border: '#D97706' }
    };
    const color = colors[type] || colors.info;
    return `<div style="padding:14px 18px;border-radius:10px;margin:12px 0;font-size:0.88rem;background:${color.bg};border-left:4px solid ${color.border};display:flex;align-items:flex-start;gap:10px;">
      <span style="flex:1;color:#333">${Security.escapeHtml(message)}</span>
    </div>`;
  },

  // Modal弹窗
  modal(options = {}) {
    const { title = '', content = '', confirmText = '确定', cancelText = '取消', onConfirm = null, onCancel = null } = options;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';

    overlay.innerHTML = `
      <div class="modal" style="background:#FFFFFF;border-radius:16px;max-width:420px;width:100%;max-height:80vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <div style="padding:20px 24px 16px;border-bottom:1px solid #F0F0F0;display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:1.05rem;font-weight:700;color:#333">${Security.escapeHtml(title)}</span>
          <button class="modal-close" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#999;padding:0;line-height:1">×</button>
        </div>
        <div style="padding:20px 24px;color:#666;font-size:0.9rem;line-height:1.6">${content}</div>
        <div style="padding:16px 24px 20px;display:flex;gap:12px;justify-content:flex-end;border-top:1px solid #F0F0F0;">
          <button class="modal-btn modal-btn-cancel" style="padding:10px 24px;border-radius:8px;font-size:0.88rem;font-weight:600;cursor:pointer;transition:all 0.2s;border:none;background:#F5F5F5;color:#666">${Security.escapeHtml(cancelText)}</button>
          <button class="modal-btn modal-btn-confirm" style="padding:10px 24px;border-radius:8px;font-size:0.88rem;font-weight:600;cursor:pointer;transition:all 0.2s;border:none;background:#0D9488;color:#FFF">${Security.escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // 关闭事件
    const close = () => {
      overlay.style.display = 'none';
      overlay.remove();
      onCancel?.();
    };

    overlay.querySelector('.modal-close').onclick = close;
    overlay.querySelector('.modal-btn-cancel').onclick = close;
    overlay.querySelector('.modal-btn-confirm').onclick = () => {
      onConfirm?.();
      overlay.remove();
    };

    // Esc关闭
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    return { close };
  },

  // 确认框
  confirm(message, onConfirm, onCancel) {
    return this.modal({
      title: '确认',
      content: message,
      confirmText: '确定',
      cancelText: '取消',
      onConfirm,
      onCancel
    });
  }
};

// ========================
// 4. 动画工具
// ========================
const Animation = {
  // prefers-reduced-motion检测
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // 安全动画（考虑用户偏好）
  animate(element, keyframes, options = {}) {
    if (this.prefersReducedMotion()) {
      if (typeof options.onEnd === 'function') options.onEnd();
      return null;
    }
    return element.animate(keyframes, {
      duration: options.duration || 300,
      easing: options.easing || 'ease-out',
      fill: options.fill || 'forwards',
      ...options
    });
  },

  // 淡入
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    this.animate(element, [{ opacity: 0 }, { opacity: 1 }], { duration });
    return new Promise(resolve => setTimeout(resolve, duration));
  },

  // 淡出
  fadeOut(element, duration = 300) {
    return new Promise(resolve => {
      this.animate(element, [{ opacity: 1 }, { opacity: 0 }], {
        duration,
        onEnd: () => {
          element.style.display = 'none';
          resolve();
        }
      });
    });
  },

  // 滑入
  slideIn(element, direction = 'down', duration = 300) {
    const transforms = {
      down: [{ transform: 'translateY(-20px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
      up: [{ transform: 'translateY(20px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
      left: [{ transform: 'translateX(20px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }],
      right: [{ transform: 'translateX(-20px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }]
    };
    element.style.opacity = '0';
    this.animate(element, transforms[direction] || transforms.down, { duration });
  }
};

// ========================
// 5. 空状态管理
// ========================
const EmptyState = {
  // 预定义空状态
  templates: {
    search: {
      icon: '🔍',
      title: '没有找到相关内容',
      desc: '试试换个关键词，或者看看下面的推荐内容'
    },
    favorite: {
      icon: '⭐',
      title: '暂无收藏',
      desc: '看到有用的内容，点击收藏随时查看'
    },
    record: {
      icon: '📚',
      title: '还没有学习记录',
      desc: '开始学习，记录你的备考之路'
    },
    mistakes: {
      icon: '🎉',
      title: '错题本空空如也',
      desc: '太棒了！继续保持，稳稳通过！'
    },
    list: {
      icon: '📋',
      title: '暂无数据',
      desc: '内容正在整理中，请稍后再来'
    }
  },

  // 渲染空状态
  render(type, options = {}) {
    const template = this.templates[type] || this.templates.list;
    const { icon, title, desc } = { ...template, ...options };

    return `
      <div class="empty-state" style="text-align:center;padding:60px 20px;">
        <div class="empty-icon" style="font-size:4rem;margin-bottom:16px;opacity:0.8;">${icon}</div>
        <h3 class="empty-title" style="font-size:1.1rem;color:#333;font-weight:600;margin-bottom:8px;">${Security.escapeHtml(title)}</h3>
        <p class="empty-desc" style="font-size:0.88rem;color:#999;margin-bottom:20px;max-width:300px;margin-left:auto;margin-right:auto;">${Security.escapeHtml(desc)}</p>
        ${options.action ? `
          <a href="${Security.escapeHtml(options.actionUrl || '#')}" class="empty-action" style="display:inline-flex;align-items:center;gap:6px;padding:12px 24px;background:#0D9488;color:#FFF;border-radius:20px;font-size:0.9rem;font-weight:600;text-decoration:none;transition:all 0.2s;">
            ${Security.escapeHtml(options.action)}
          </a>
        ` : ''}
      </div>
    `;
  },

  // 插入空状态到容器
  insert(container, type, options = {}) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (container) {
      container.innerHTML = this.render(type, options);
    }
  }
};

// ========================
// 6. 加载状态管理
// ========================
const LoadingState = {
  // 显示全屏loading
  showGlobal(message = '加载中...') {
    const loading = document.createElement('div');
    loading.id = 'globalLoading';
    loading.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#F0FDFA;z-index:99998;';
    loading.innerHTML = `
      <div style="text-align:center;">
        <div style="width:40px;height:40px;border:3px solid #CCFBF1;border-top-color:#0D9488;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;"></div>
        <p style="color:#0D9488;font-size:0.9rem;">${Security.escapeHtml(message)}</p>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    `;
    document.body.appendChild(loading);
    return loading;
  },

  // 隐藏全屏loading
  hideGlobal() {
    const loading = document.getElementById('globalLoading');
    if (loading) {
      loading.style.opacity = '0';
      loading.style.transition = 'opacity 0.3s';
      setTimeout(() => loading.remove(), 300);
    }
  },

  // 骨架屏模板
  skeleton(type = 'card') {
    const templates = {
      card: `<div class="skeleton-card" style="padding:16px;background:#FFF;border-radius:12px;border:1px solid #F0F0F0;">
        <div class="skeleton skeleton-title" style="height:20px;width:70%;margin-bottom:12px;"></div>
        <div class="skeleton skeleton-text" style="height:14px;width:100%;"></div>
        <div class="skeleton skeleton-text" style="height:14px;width:80%;"></div>
      </div>`,
      list: `<div style="padding:12px 16px;border-bottom:1px solid #EEE;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="skeleton skeleton-avatar" style="width:40px;height:40px;border-radius:50%;flex-shrink:0;"></div>
          <div style="flex:1;">
            <div class="skeleton skeleton-text" style="height:14px;width:60%;"></div>
            <div class="skeleton skeleton-text" style="height:12px;width:40%;"></div>
          </div>
        </div>
      </div>`,
      text: `<div>
        <div class="skeleton skeleton-text" style="height:14px;width:100%;"></div>
        <div class="skeleton skeleton-text" style="height:14px;width:90%;"></div>
        <div class="skeleton skeleton-text" style="height:14px;width:70%;"></div>
      </div>`
    };
    return templates[type] || templates.card;
  },

  // 按钮loading状态
  setButtonLoading(button, loading = true) {
    if (loading) {
      button.dataset.originalText = button.innerHTML;
      button.disabled = true;
      button.style.position = 'relative';
      button.style.pointerEvents = 'none';
      button.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#FFF;border-radius:50%;animation:spin 0.6s linear infinite;vertical-align:middle;margin-right:8px;"></span>处理中...';
    } else {
      button.disabled = false;
      button.style.pointerEvents = 'auto';
      button.innerHTML = button.dataset.originalText || button.innerHTML;
    }
  }
};

// ========================
// 7. 图片懒加载
// ========================
const LazyImage = {
  observer: null,

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.add('loaded');
              img.removeAttribute('data-src');
            }
            this.observer.unobserve(img);
          }
        });
      }, { rootMargin: '50px' });
    }
  },

  observe(img) {
    if (this.observer) {
      img.classList.add('img-lazy');
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease';
      img.addEventListener('load', () => {
        img.classList.add('loaded');
        img.style.opacity = '1';
      });
      this.observer.observe(img);
    } else {
      // 降级：直接加载
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    }
  }
};

// ========================
// 8. 响应式检测
// ========================
const Responsive = {
  breakpoints: { xs: 376, sm: 431, md: 769, lg: 1200 },

  isXs() { return window.innerWidth < this.breakpoints.xs; },
  isSm() { return window.innerWidth >= this.breakpoints.xs && window.innerWidth < this.breakpoints.sm; },
  isMd() { return window.innerWidth >= this.breakpoints.sm && window.innerWidth < this.breakpoints.md; },
  isLg() { return window.innerWidth >= this.breakpoints.md; },

  onResize(callback) {
    let timeout;
    window.addEventListener('resize', () => {
      clearTimeout(timeout);
      timeout = setTimeout(callback, 100);
    });
  }
};

// ========================
// 9. 键盘导航
// ========================
const KeyboardNav = {
  init(container) {
    // Tab顺序由DOM顺序决定
    // focus样式在CSS中定义
    // Esc关闭弹窗
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.querySelector('.modal-overlay:not([style*="display: none"])');
        if (modal) {
          modal.remove();
        }
      }
      // Enter触发按钮
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
        const btn = e.target.closest('[role="button"], .btn, button');
        if (btn && !btn.disabled) {
          btn.click();
        }
      }
    });
  }
};

// ========================
// 10. 导出初始化函数
// ========================
function initSiteComponents() {
  LazyImage.init();
  KeyboardNav.init();
  // StorageManager.backup(); // 启动时备份
}

// 自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSiteComponents);
} else {
  initSiteComponents();
}

// 导出到全局
window.Security = Security;
window.StorageManager = StorageManager;
window.Notification = Notification;
window.Animation = Animation;
window.EmptyState = EmptyState;
window.LoadingState = LoadingState;
window.LazyImage = LazyImage;
window.Responsive = Responsive;
window.KeyboardNav = KeyboardNav;
