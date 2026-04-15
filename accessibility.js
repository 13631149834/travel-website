/**
 * 游导旅游 - 可访问性增强脚本
 * 符合 WCAG 2.1 AA 标准
 * 
 * 功能：
 * - 跳转链接 (Skip Links)
 * - 焦点管理
 * - 键盘导航增强
 * - 可访问性设置存储
 * - 屏幕阅读器支持
 */

(function() {
  'use strict';

  // ========================================
  // 初始化
  // ========================================
  
  document.addEventListener('DOMContentLoaded', function() {
    initSkipLinks();
    initAccessibilitySettings();
    initFocusManagement();
    initKeyboardEnhancements();
    initAnnouncer();
  });

  // ========================================
  // 跳转链接 (Skip Links)
  // ========================================
  
  function initSkipLinks() {
    // 为所有页面动态添加跳转链接
    if (!document.querySelector('.skip-link')) {
      const skipLinkMain = document.createElement('a');
      skipLinkMain.href = '#main-content';
      skipLinkMain.className = 'skip-link';
      skipLinkMain.textContent = '跳转到主要内容';
      skipLinkMain.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.getElementById('main-content') || document.querySelector('main');
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
      document.body.insertBefore(skipLinkMain, document.body.firstChild);
    }

    // 为所有跳转链接添加点击处理
    document.querySelectorAll('.skip-link').forEach(function(link) {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
          e.preventDefault();
          const targetId = href.substring(1);
          const target = document.getElementById(targetId);
          if (target) {
            target.setAttribute('tabindex', '-1');
            target.focus();
            target.scrollIntoView({ behavior: 'smooth' });
            
            // 移除焦点以获得更好的视觉体验
            setTimeout(function() {
              target.removeAttribute('tabindex');
            }, 1000);
          }
        }
      });
    });
  }

  // ========================================
  // 可访问性设置
  // ========================================
  
  const AccessibilitySettings = {
    storageKey: 'youdao_accessibility_settings',
    
    defaults: {
      fontSize: 'medium',
      highContrast: false,
      theme: 'auto',
      reducedMotion: false
    },
    
    // 加载设置
    load: function() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          return { ...this.defaults, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.warn('无法加载可访问性设置:', e);
      }
      return { ...this.defaults };
    },
    
    // 保存设置
    save: function(settings) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(settings));
      } catch (e) {
        console.warn('无法保存可访问性设置:', e);
      }
    },
    
    // 应用设置
    apply: function(settings) {
      // 字体大小
      document.body.setAttribute('data-font-size', settings.fontSize);
      
      // 高对比度
      document.body.setAttribute('data-high-contrast', settings.highContrast);
      
      // 主题
      if (settings.theme === 'auto') {
        document.body.removeAttribute('data-theme');
      } else {
        document.body.setAttribute('data-theme', settings.theme);
      }
      
      // 减少动画
      if (settings.reducedMotion) {
        document.documentElement.style.setProperty('--reduced-motion', 'reduce');
        document.querySelectorAll('*, *::before, *::after').forEach(function(el) {
          el.style.animationDuration = '0.01ms !important';
          el.style.transitionDuration = '0.01ms !important';
        });
      } else {
        document.documentElement.style.removeProperty('--reduced-motion');
      }
    },
    
    // 重置为默认值
    reset: function() {
      this.save(this.defaults);
      this.apply(this.defaults);
    }
  };

  function initAccessibilitySettings() {
    const settings = AccessibilitySettings.load();
    AccessibilitySettings.apply(settings);

    // 监听系统减少动画偏好
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      mediaQuery.addEventListener('change', function(e) {
        if (e.matches && !AccessibilitySettings.load().reducedMotion) {
          // 系统偏好开启，但用户未设置
          document.documentElement.style.setProperty('--reduced-motion', 'reduce');
        }
      });
    }

    // 监听系统深色模式偏好
    if (window.matchMedia) {
      const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkQuery.addEventListener('change', function(e) {
        const settings = AccessibilitySettings.load();
        if (settings.theme === 'auto') {
          document.body.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  // ========================================
  // 焦点管理
  // ========================================
  
  function initFocusManagement() {
    // 处理 aria-hidden 元素的焦点
    document.addEventListener('focusin', function(e) {
      const target = e.target;
      if (target && !isVisible(target)) {
        // 如果焦点元素不可见，将其移到下一个可见元素
        e.preventDefault();
        moveFocusToVisibleElement(target);
      }
    });

    // 处理模态框焦点陷阱
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeModals();
      }
    });

    // 检测焦点离开模态框
    document.addEventListener('focusout', function(e) {
      const activeModal = document.querySelector('[role="dialog"][aria-modal="true"]:not([aria-hidden="true"])');
      if (activeModal && !activeModal.contains(e.relatedTarget)) {
        // 焦点离开模态框，重新聚焦到模态框内
        const focusableElements = getFocusableElements(activeModal);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    });
  }

  // 获取可聚焦元素
  function getFocusableElements(container) {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    
    return Array.from(container.querySelectorAll(selector)).filter(function(el) {
      return isVisible(el);
    });
  }

  // 检查元素是否可见
  function isVisible(el) {
    return el.offsetParent !== null && 
           getComputedStyle(el).visibility !== 'hidden' &&
           getComputedStyle(el).display !== 'none';
  }

  // 移动焦点到可见元素
  function moveFocusToVisibleElement(current) {
    const focusable = getFocusableElements(document.body);
    const currentIndex = focusable.indexOf(current);
    if (currentIndex >= 0 && currentIndex < focusable.length - 1) {
      focusable[currentIndex + 1].focus();
    } else if (focusable.length > 0) {
      focusable[0].focus();
    }
  }

  // 关闭模态框
  function closeModals() {
    const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]:not([aria-hidden="true"])');
    modals.forEach(function(modal) {
      const closeButton = modal.querySelector('[aria-label="关闭"], .modal-close, [data-dismiss="modal"]');
      if (closeButton) {
        closeButton.click();
      } else {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
      }
    });
  }

  // ========================================
  // 键盘导航增强
  // ========================================
  
  function initKeyboardEnhancements() {
    // Roving tabindex 管理
    document.querySelectorAll('[role="menu"], [role="menubar"]').forEach(function(menu) {
      setupRovingTabindex(menu);
    });

    // 标签页键盘支持
    document.querySelectorAll('[role="tablist"]').forEach(function(tablist) {
      setupTablistKeyboard(tablist);
    });

    // 下拉菜单键盘支持
    document.querySelectorAll('[role="menuitem"][aria-haspopup="true"]').forEach(function(item) {
      setupDropdownKeyboard(item);
    });
  }

  // Roving tabindex 实现
  function setupRovingTabindex(container) {
    const items = container.querySelectorAll('[role="menuitem"]');
    if (items.length === 0) return;

    let currentIndex = 0;
    
    // 设置初始焦点
    items[0].setAttribute('tabindex', '0');
    
    container.addEventListener('keydown', function(e) {
      switch(e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          items[currentIndex].setAttribute('tabindex', '-1');
          currentIndex = (currentIndex + 1) % items.length;
          items[currentIndex].setAttribute('tabindex', '0');
          items[currentIndex].focus();
          break;
          
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          items[currentIndex].setAttribute('tabindex', '-1');
          currentIndex = (currentIndex - 1 + items.length) % items.length;
          items[currentIndex].setAttribute('tabindex', '0');
          items[currentIndex].focus();
          break;
          
        case 'Home':
          e.preventDefault();
          items[currentIndex].setAttribute('tabindex', '-1');
          currentIndex = 0;
          items[currentIndex].setAttribute('tabindex', '0');
          items[currentIndex].focus();
          break;
          
        case 'End':
          e.preventDefault();
          items[currentIndex].setAttribute('tabindex', '-1');
          currentIndex = items.length - 1;
          items[currentIndex].setAttribute('tabindex', '0');
          items[currentIndex].focus();
          break;
      }
    });
  }

  // 标签页键盘支持
  function setupTablistKeyboard(tablist) {
    const tabs = tablist.querySelectorAll('[role="tab"]');
    if (tabs.length === 0) return;

    tablist.addEventListener('keydown', function(e) {
      const currentTab = tablist.querySelector('[role="tab"][aria-selected="true"]');
      let currentIndex = Array.from(tabs).indexOf(currentTab);
      
      switch(e.key) {
        case 'ArrowRight':
          e.preventDefault();
          currentIndex = (currentIndex + 1) % tabs.length;
          break;
          
        case 'ArrowLeft':
          e.preventDefault();
          currentIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          break;
          
        case 'Home':
          e.preventDefault();
          currentIndex = 0;
          break;
          
        case 'End':
          e.preventDefault();
          currentIndex = tabs.length - 1;
          break;
          
        default:
          return;
      }
      
      tabs[currentIndex].click();
      tabs[currentIndex].focus();
    });
  }

  // 下拉菜单键盘支持
  function setupDropdownKeyboard(trigger) {
    trigger.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', !expanded);
        
        if (!expanded) {
          const menu = document.getElementById(trigger.getAttribute('aria-controls'));
          if (menu) {
            const firstItem = menu.querySelector('[role="menuitem"]');
            if (firstItem) {
              setTimeout(function() {
                firstItem.focus();
              }, 100);
            }
          }
        }
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });
  }

  // ========================================
  // 屏幕阅读器公告
  // ========================================
  
  const Announcer = {
    element: null,
    
    init: function() {
      if (!this.element) {
        this.element = document.createElement('div');
        this.element.setAttribute('role', 'status');
        this.element.setAttribute('aria-live', 'polite');
        this.element.setAttribute('aria-atomic', 'true');
        this.element.className = 'sr-only';
        document.body.appendChild(this.element);
      }
    },
    
    announce: function(message, priority) {
      this.init();
      
      // 设置优先级
      this.element.setAttribute('aria-live', priority || 'polite');
      
      // 清空并设置新消息（触发屏幕阅读器重新读取）
      this.element.textContent = '';
      setTimeout(function() {
        Announcer.element.textContent = message;
      }, 100);
    },
    
    // 礼貌性公告（等待当前操作完成）
    polite: function(message) {
      this.announce(message, 'polite');
    },
    
    // 断言性公告（立即打断当前朗读）
    assertive: function(message) {
      this.announce(message, 'assertive');
    }
  };

  function initAnnouncer() {
    // 将 Announcer 暴露到全局
    window.AccessibilityAnnouncer = Announcer;
  }

  // ========================================
  // 公共 API
  // ========================================
  
  window.YoudaoAccessibility = {
    settings: AccessibilitySettings,
    announcer: Announcer,
    
    // 公开方法
    setFontSize: function(size) {
      const settings = this.settings.load();
      settings.fontSize = size;
      this.settings.save(settings);
      this.settings.apply(settings);
    },
    
    toggleHighContrast: function(enabled) {
      const settings = this.settings.load();
      settings.highContrast = enabled;
      this.settings.save(settings);
      this.settings.apply(settings);
    },
    
    setTheme: function(theme) {
      const settings = this.settings.load();
      settings.theme = theme;
      this.settings.save(settings);
      this.settings.apply(settings);
    },
    
    toggleReducedMotion: function(enabled) {
      const settings = this.settings.load();
      settings.reducedMotion = enabled;
      this.settings.save(settings);
      this.settings.apply(settings);
    },
    
    reset: function() {
      this.settings.reset();
    },
    
    // 获取当前设置
    getSettings: function() {
      return this.settings.load();
    }
  };

})();
