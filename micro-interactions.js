/**
 * ===================================
 * 微交互动画 JavaScript
 * 管理骨架屏、反馈动画、表单动画
 * ===================================
 */

(function() {
  'use strict';

  // 等待DOM加载完成
  document.addEventListener('DOMContentLoaded', function() {
    initSkeletonLoaders();
    initButtonEffects();
    initFormAnimations();
    initPageTransitions();
    initFeedbackAnimations();
  });

  /**
   * ===================================
   * 1. 骨架屏加载器
   * ===================================
   */

  function initSkeletonLoaders() {
    // 为所有骨架屏容器添加加载完成类
    const skeletonContainers = document.querySelectorAll('.skeleton-container');
    skeletonContainers.forEach(container => {
      if (!container.classList.contains('loading')) {
        container.classList.add('loading');
      }
    });

    // 模拟数据加载完成
    window.showSkeletonContent = function(selector, delay = 800) {
      return new Promise(resolve => {
        setTimeout(() => {
          const container = document.querySelector(selector);
          if (container) {
            container.classList.remove('loading');
            container.classList.add('loaded');
            
            // 显示实际内容
            const actualContent = container.querySelector('.actual-content');
            const skeleton = container.querySelector('.skeleton-wrapper');
            
            if (actualContent && skeleton) {
              skeleton.style.display = 'none';
              actualContent.style.display = '';
              actualContent.classList.add('content-fade-in');
            }
          }
          resolve();
        }, delay);
      });
    };

    // 通用骨架屏切换
    window.hideSkeleton = function(containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.classList.add('fade-out');
        setTimeout(() => {
          container.style.display = 'none';
        }, 300);
      }
    };

    window.showContent = function(containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.style.display = '';
        container.classList.add('content-fade-in');
      }
    };
  }

  /**
   * ===================================
   * 2. 按钮效果
   * ===================================
   */

  function initButtonEffects() {
    // 为所有按钮添加涟漪效果
    const buttons = document.querySelectorAll('.btn, button, .btn-micro');
    
    buttons.forEach(btn => {
      if (!btn.classList.contains('btn-ripple-handled')) {
        btn.classList.add('btn-ripple-handled');
        
        btn.addEventListener('click', function(e) {
          // 如果已经有涟漪元素，先移除
          const existingRipple = btn.querySelector('.ripple-effect');
          if (existingRipple) {
            existingRipple.remove();
          }
          
          // 创建涟漪元素
          const ripple = document.createElement('span');
          ripple.className = 'ripple-effect';
          
          const rect = btn.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          
          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
          ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
          
          btn.appendChild(ripple);
          
          // 动画结束后移除
          setTimeout(() => ripple.remove(), 600);
        });
      }
    });

    // 按钮点击状态
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('button, .btn, [role="button"]');
      if (btn && !btn.disabled) {
        btn.classList.add('btn-clicked');
        setTimeout(() => btn.classList.remove('btn-clicked'), 150);
      }
    });
  }

  /**
   * ===================================
   * 3. 表单动画
   * ===================================
   */

  function initFormAnimations() {
    // 浮动标签
    const floatInputs = document.querySelectorAll('.form-float-input');
    floatInputs.forEach(input => {
      // 页面加载时检查是否有值
      if (input.value) {
        input.classList.add('has-value');
      }
      
      input.addEventListener('input', function() {
        this.classList.toggle('has-value', this.value.length > 0);
      });
    });

    // 输入框字符计数
    const charCounters = document.querySelectorAll('[maxlength]');
    charCounters.forEach(input => {
      const counter = document.createElement('div');
      counter.className = 'char-counter';
      const max = input.getAttribute('maxlength');
      const current = input.value.length;
      counter.innerHTML = `<span class="current">${current}</span> / ${max}`;
      
      input.parentNode.appendChild(counter);
      
      input.addEventListener('input', function() {
        const len = this.value.length;
        const countEl = counter.querySelector('.current');
        countEl.textContent = len;
        
        // 根据剩余字符数改变颜色
        const remaining = max - len;
        counter.classList.remove('warning', 'error');
        if (remaining <= 10) {
          counter.classList.add('error');
        } else if (remaining <= 20) {
          counter.classList.add('warning');
        }
      });
    });

    // 表单验证动画
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        const invalidFields = form.querySelectorAll(':invalid');
        invalidFields.forEach(field => {
          field.classList.add('error-flash');
          field.addEventListener('animationend', () => {
            field.classList.remove('error-flash');
          }, { once: true });
        });
      });
    });
  }

  /**
   * ===================================
   * 4. 页面过渡
   * ===================================
   */

  function initPageTransitions() {
    // 页面加载动画
    const pageTransition = document.querySelector('.page-transition-overlay');
    if (pageTransition) {
      setTimeout(() => {
        pageTransition.classList.add('fade-out');
        setTimeout(() => {
          pageTransition.style.display = 'none';
        }, 400);
      }, 600);
    }

    // 内容淡入动画
    const fadeElements = document.querySelectorAll('.fade-in-trigger');
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // 交错列表动画
    const staggerLists = document.querySelectorAll('.stagger-list');
    staggerLists.forEach(list => {
      list.classList.add('stagger-animated');
    });

    // 链接过渡
    const internalLinks = document.querySelectorAll('a[href^="#"], a[href$=".html"]');
    internalLinks.forEach(link => {
      if (!link.target || link.target === '_self') {
        link.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          if (href && href !== '#' && href !== 'javascript:void(0)') {
            const mainContent = document.querySelector('main') || document.body;
            mainContent.classList.add('page-transition');
            mainContent.classList.add('out');
          }
        });
      }
    });
  }

  /**
   * ===================================
   * 5. 反馈动画
   * ===================================
   */

  // Toast通知容器
  let toastContainer = null;

  function getToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 100000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  // 显示Toast
  window.showToast = function(message, type = 'info', duration = 3000) {
    const container = getToastContainer();
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast-feedback ${type}`;
    toast.innerHTML = `
      <span style="font-size: 18px;">${icons[type]}</span>
      <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // 自动移除
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, duration);
    
    return toast;
  };

  // 快捷方法
  window.toast = {
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    warning: (msg, duration) => showToast(msg, 'warning', duration),
    info: (msg, duration) => showToast(msg, 'info', duration)
  };

  // 成功反馈动画
  window.showSuccessFeedback = function(element, message) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;
    
    // 添加成功类
    el.classList.add('success-pulse');
    
    // 显示勾选图标
    const checkmark = document.createElement('span');
    checkmark.className = 'success-icon';
    checkmark.innerHTML = '✓';
    checkmark.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: #10B981;
      color: white;
      border-radius: 50%;
      margin-left: 8px;
      animation: btn-icon-pop 0.3s ease;
    `;
    el.appendChild(checkmark);
    
    // 显示消息
    if (message) {
      toast.success(message);
    }
    
    setTimeout(() => {
      el.classList.remove('success-pulse');
      checkmark.remove();
    }, 2000);
  };

  // 失败反馈动画
  window.showErrorFeedback = function(element, message) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;
    
    // 添加抖动
    el.classList.add('error-shake');
    
    // 添加红框闪烁
    el.classList.add('error-flash');
    
    // 显示消息
    if (message) {
      toast.error(message);
    }
    
    setTimeout(() => {
      el.classList.remove('error-shake', 'error-flash');
    }, 600);
  };

  // 按钮成功状态
  window.setButtonSuccess = function(button, originalText) {
    const btn = typeof button === 'string' ? document.querySelector(button) : button;
    if (!btn) return;
    
    const original = originalText || btn.textContent;
    btn.disabled = true;
    btn.classList.add('btn-success');
    btn.textContent = '成功';
    
    setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove('btn-success');
      btn.textContent = original;
    }, 2000);
  };

  // 按钮加载状态
  window.setButtonLoading = function(button, loadingText) {
    const btn = typeof button === 'string' ? document.querySelector(button) : button;
    if (!btn) return;
    
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.textContent = loadingText || '加载中...';
    btn.classList.add('btn-loading');
    
    return function resetButton() {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText;
      btn.classList.remove('btn-loading');
    };
  };

  /**
   * ===================================
   * 6. 辅助函数
   * ===================================
   */

  // 防抖
  window.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // 节流
  window.throttle = function(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

})();
