/**
 * =============================================
 * 游导旅游平台 - 用户体验优化脚本 V1.0
 * 包含：导航、表单、交互、移动端、无障碍、用户反馈
 * =============================================
 */

(function() {
  'use strict';

  // =============================================
  // 1. 导航优化模块
  // =============================================
  const NavigationUX = {
    // 初始化
    init() {
      this.initBreadcrumbs();
      this.initQuickNav();
      this.initSmartNav();
      this.initSearchUX();
    },

    // 面包屑导航
    initBreadcrumbs() {
      const breadcrumb = document.querySelector('.breadcrumb-nav');
      if (!breadcrumb) return;

      // 移动端折叠逻辑
      const handleResize = () => {
        if (window.innerWidth <= 480 && breadcrumb.children.length > 4) {
          breadcrumb.classList.add('breadcrumb-collapsed');
        } else {
          breadcrumb.classList.remove('breadcrumb-collapsed');
        }
      };
      
      window.addEventListener('resize', handleResize);
      handleResize();

      // 点击展开全部
      breadcrumb.addEventListener('click', (e) => {
        if (e.target.classList.contains('breadcrumb-toggle') || 
            e.target.closest('.breadcrumb-toggle')) {
          breadcrumb.classList.toggle('breadcrumb-collapsed');
        }
      });
    },

    // 快捷导航
    initQuickNav() {
      const trigger = document.querySelector('.quick-nav-trigger');
      const quickNav = document.querySelector('.quick-nav');
      
      if (!trigger || !quickNav) return;

      trigger.addEventListener('click', () => {
        trigger.classList.toggle('active');
        quickNav.classList.toggle('active');
        this.announceToScreenReader(
          quickNav.classList.contains('active') ? '快捷导航已打开' : '快捷导航已关闭'
        );
      });

      // ESC关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && quickNav.classList.contains('active')) {
          trigger.classList.remove('active');
          quickNav.classList.remove('active');
          trigger.focus();
        }
      });

      // 点击外部关闭
      document.addEventListener('click', (e) => {
        if (!quickNav.contains(e.target) && !trigger.contains(e.target)) {
          trigger.classList.remove('active');
          quickNav.classList.remove('active');
        }
      });
    },

    // 智能导航（学习用户习惯）
    initSmartNav() {
      const navItems = document.querySelectorAll('.nav-links > a:not(.nav-highlight)');
      if (!navItems.length) return;

      // 记录点击次数
      const navUsage = JSON.parse(localStorage.getItem('navUsage') || '{}');
      
      navItems.forEach(item => {
        const href = item.getAttribute('href');
        item.classList.add('nav-intelligence');
        
        // 显示常用提示
        if (navUsage[href] > 2) {
          const badge = document.createElement('span');
          badge.className = 'nav-intelligence-badge';
          badge.setAttribute('aria-hidden', 'true');
          item.appendChild(badge);
        }

        // 记录点击
        item.addEventListener('click', () => {
          navUsage[href] = (navUsage[href] || 0) + 1;
          localStorage.setItem('navUsage', JSON.stringify(navUsage));
        });
      });
    },

    // 搜索体验优化
    initSearchUX() {
      const searchInputs = document.querySelectorAll('.search-input, .smart-input input');
      
      searchInputs.forEach(input => {
        // 实时搜索建议
        const suggestContainer = this.createSuggestionContainer(input);
        
        input.addEventListener('input', this.debounce((e) => {
          const query = e.target.value.trim();
          if (query.length >= 2) {
            this.fetchSuggestions(query, suggestContainer);
          } else {
            suggestContainer.classList.remove('show');
          }
        }, 300));

        // 键盘导航
        input.addEventListener('keydown', (e) => {
          const items = suggestContainer.querySelectorAll('.autofill-item');
          const highlighted = suggestContainer.querySelector('.highlighted');
          
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = highlighted ? highlighted.nextElementSibling : items[0];
            if (next) {
              items.forEach(i => i.classList.remove('highlighted'));
              next.classList.add('highlighted');
              next.scrollIntoView({ block: 'nearest' });
            }
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = highlighted ? highlighted.previousElementSibling : items[items.length - 1];
            if (prev) {
              items.forEach(i => i.classList.remove('highlighted'));
              prev.classList.add('highlighted');
              prev.scrollIntoView({ block: 'nearest' });
            }
          } else if (e.key === 'Enter' && highlighted) {
            e.preventDefault();
            highlighted.click();
          } else if (e.key === 'Escape') {
            suggestContainer.classList.remove('show');
          }
        });

        // 点击外部关闭
        document.addEventListener('click', (e) => {
          if (!input.contains(e.target) && !suggestContainer.contains(e.target)) {
            suggestContainer.classList.remove('show');
          }
        });
      });
    },

    createSuggestionContainer(input) {
      const container = document.createElement('div');
      container.className = 'autofill-suggestions';
      container.setAttribute('role', 'listbox');
      input.parentElement.appendChild(container);
      return container;
    },

    async fetchSuggestions(query, container) {
      // 模拟搜索建议（实际项目中替换为API调用）
      const suggestions = [
        { icon: '📍', title: query + '热门景点', subtitle: '发现精彩目的地' },
        { icon: '🧭', title: query + '导游服务', subtitle: '专业持证导游' },
        { icon: '🗺️', title: query + '精品路线', subtitle: '精选旅行路线' },
        { icon: '📖', title: query + '旅行攻略', subtitle: '实用旅行建议' }
      ];

      container.innerHTML = suggestions.map((s, i) => `
        <div class="autofill-item" role="option" data-index="${i}">
          <span class="item-icon">${s.icon}</span>
          <div class="item-content">
            <div class="item-title">${s.title}</div>
            <div class="item-subtitle">${s.subtitle}</div>
          </div>
          <span class="item-action">回车选择</span>
        </div>
      `).join('');

      container.classList.add('show');

      // 点击建议
      container.querySelectorAll('.autofill-item').forEach(item => {
        item.addEventListener('click', () => {
          const title = item.querySelector('.item-title').textContent;
          const input = container.previousElementSibling;
          input.value = title.replace(/热门景点|导游服务|精品路线|旅行攻略$/, '');
          container.classList.remove('show');
          this.announceToScreenReader(`已选择: ${title}`);
        });
      });
    },

    announceToScreenReader(message) {
      const liveRegion = document.createElement('div');
      liveRegion.className = 'aria-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.textContent = message;
      document.body.appendChild(liveRegion);
      setTimeout(() => liveRegion.remove(), 1000);
    },

    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  };

  // =============================================
  // 2. 表单优化模块
  // =============================================
  const FormUX = {
    init() {
      this.initSmartInputs();
      this.initValidation();
      this.initAutofill();
      this.initAutoSave();
    },

    // 智能输入框
    initSmartInputs() {
      const inputs = document.querySelectorAll('.smart-input input, .smart-input textarea');
      
      inputs.forEach(input => {
        // 添加清除按钮
        this.addClearButton(input);
        
        // 字符计数
        this.addCharCount(input);
        
        // 浮动标签
        this.initFloatingLabel(input);
      });
    },

    addClearButton(input) {
      if (input.nextElementSibling?.classList.contains('input-clear')) return;
      
      const clearBtn = document.createElement('button');
      clearBtn.className = 'input-clear';
      clearBtn.type = 'button';
      clearBtn.innerHTML = '×';
      clearBtn.setAttribute('aria-label', '清除输入');
      clearBtn.setAttribute('tabindex', '-1');
      
      clearBtn.addEventListener('click', () => {
        input.value = '';
        input.focus();
        input.dispatchEvent(new Event('input'));
        this.announceToScreenReader('输入已清除');
      });
      
      input.parentElement.style.position = 'relative';
      input.parentElement.appendChild(clearBtn);
    },

    addCharCount(input) {
      const maxLength = input.getAttribute('maxlength');
      if (!maxLength) return;
      
      const countDiv = document.createElement('div');
      countDiv.className = 'input-char-count';
      countDiv.innerHTML = `<span class="current">0</span>/${maxLength}`;
      input.parentElement.appendChild(countDiv);
      
      input.addEventListener('input', () => {
        const len = input.value.length;
        countDiv.querySelector('.current').textContent = len;
        
        countDiv.classList.remove('warning', 'error');
        if (len > maxLength * 0.9) {
          countDiv.classList.add('warning');
        }
        if (len >= maxLength) {
          countDiv.classList.add('error');
        }
      });
    },

    initFloatingLabel(input) {
      if (!input.classList.contains('floating-label-input')) return;
      
      const label = input.nextElementSibling;
      if (!label || !label.classList.contains('floating-label')) return;
      
      // 初始化状态
      if (input.value) {
        label.classList.add('active');
      }
      
      input.addEventListener('focus', () => label.classList.add('active'));
      input.addEventListener('blur', () => {
        if (!input.value) label.classList.remove('active');
      });
    },

    // 实时验证
    initValidation() {
      const validatedInputs = document.querySelectorAll('[data-validate]');
      
      validatedInputs.forEach(input => {
        const rules = input.dataset.validate.split(',');
        const formGroup = input.closest('.form-group') || input.parentElement;
        const feedback = this.createFeedbackElement(formGroup);
        
        input.addEventListener('input', () => {
          this.validateInput(input, rules, feedback);
        });
        
        input.addEventListener('blur', () => {
          this.validateInput(input, rules, feedback, true);
        });
      });
    },

    createFeedbackElement(parent) {
      const feedback = document.createElement('div');
      feedback.className = 'validation-feedback';
      parent.appendChild(feedback);
      return feedback;
    },

    validateInput(input, rules, feedback, showAlways = false) {
      const value = input.value;
      let result = { valid: true, message: '', type: 'success' };
      
      for (const rule of rules) {
        switch (rule.trim()) {
          case 'required':
            if (!value.trim()) {
              result = { valid: false, message: '此字段为必填项', type: 'error' };
            }
            break;
          case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              result = { valid: false, message: '请输入有效的邮箱地址', type: 'error' };
            }
            break;
          case 'phone':
            if (value && !/^1[3-9]\d{9}$/.test(value)) {
              result = { valid: false, message: '请输入有效的手机号码', type: 'error' };
            }
            break;
          case 'min:6':
            if (value && value.length < 6) {
              result = { valid: false, message: '至少需要6个字符', type: 'error' };
            }
            break;
        }
      }
      
      // 更新样式
      const smartInput = input.closest('.smart-input');
      if (smartInput) {
        smartInput.classList.remove('valid', 'invalid', 'warning');
        if (result.valid && value) {
          smartInput.classList.add('valid');
        } else if (!result.valid) {
          smartInput.classList.add('invalid');
        }
      }
      
      // 更新反馈
      if (result.valid && !value) {
        feedback.classList.remove('show');
        return;
      }
      
      feedback.className = `validation-feedback ${result.type} ${showAlways || value ? 'show' : ''}`;
      feedback.innerHTML = `
        <span class="validation-icon">${result.type === 'success' ? '✓' : result.type === 'error' ? '!' : 'i'}</span>
        <span class="validation-message">${result.message}</span>
      `;
    },

    // 智能填充
    initAutofill() {
      const autofillInputs = document.querySelectorAll('[data-autofill]');
      
      autofillInputs.forEach(input => {
        const source = input.dataset.autofill;
        const container = this.createSuggestionContainer(input);
        
        input.addEventListener('focus', () => {
          if (input.value.length >= 1) {
            this.showAutofill(source, input.value, container);
          }
        });
        
        input.addEventListener('input', () => {
          if (input.value.length >= 2) {
            this.showAutofill(source, input.value, container);
          } else {
            container.classList.remove('show');
          }
        });
      });
    },

    createSuggestionContainer(input) {
      let container = input.parentElement.querySelector('.autofill-suggestions');
      if (!container) {
        container = document.createElement('div');
        container.className = 'autofill-suggestions';
        container.setAttribute('role', 'listbox');
        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(container);
      }
      return container;
    },

    showAutofill(source, query, container) {
      // 模拟数据（实际项目中替换为API调用）
      const data = this.getAutofillData(source, query);
      
      if (!data.length) {
        container.classList.remove('show');
        return;
      }
      
      container.innerHTML = data.map((item, i) => `
        <div class="autofill-item" role="option" data-index="${i}">
          <span class="item-icon">${item.icon || '📋'}</span>
          <div class="item-content">
            <div class="item-title">${item.title}</div>
            ${item.subtitle ? `<div class="item-subtitle">${item.subtitle}</div>` : ''}
          </div>
          <span class="item-action">回车选择</span>
        </div>
      `).join('');
      
      container.classList.add('show');
      
      container.querySelectorAll('.autofill-item').forEach(item => {
        item.addEventListener('click', () => {
          const dataItem = data[item.dataset.index];
          const input = container.previousElementSibling;
          input.value = dataItem.value || dataItem.title;
          container.classList.remove('show');
          input.dispatchEvent(new Event('input'));
        });
      });
    },

    getAutofillData(source, query) {
      const dataMap = {
        destination: [
          { icon: '🗼', title: '东京', subtitle: '日本 · 亚洲热门', value: '东京' },
          { icon: '🗽', title: '纽约', subtitle: '美国 · 北美经典', value: '纽约' },
          { icon: '🏰', title: '巴黎', subtitle: '法国 · 欧洲浪漫', value: '巴黎' },
          { icon: '⛩️', title: '京都', subtitle: '日本 · 古都风情', value: '京都' }
        ],
        guide: [
          { icon: '🧑‍🏫', title: '金牌导游-张明', subtitle: '日语、英语 · 10年经验', value: '张明' },
          { icon: '👩‍🏫', title: '专业导游-李华', subtitle: '法语、西语 · 8年经验', value: '李华' }
        ]
      };
      
      return (dataMap[source] || []).filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      );
    },

    // 自动保存
    initAutoSave() {
      const forms = document.querySelectorAll('[data-autosave]');
      
      forms.forEach(form => {
        const indicator = this.createAutoSaveIndicator(form);
        const storageKey = form.dataset.autosave;
        let saveTimeout;
        
        // 恢复保存的数据
        this.restoreFormData(form, storageKey);
        
        // 监听输入
        form.addEventListener('input', () => {
          clearTimeout(saveTimeout);
          this.showSaveStatus(indicator, 'saving');
          
          saveTimeout = setTimeout(() => {
            this.saveFormData(form, storageKey);
            this.showSaveStatus(indicator, 'saved');
          }, 1000);
        });
        
        // 提交后清除
        form.addEventListener('submit', () => {
          localStorage.removeItem(storageKey);
        });
      });
    },

    createAutoSaveIndicator(form) {
      const indicator = document.createElement('div');
      indicator.className = 'autosave-indicator';
      indicator.innerHTML = '<span class="autosave-icon">💾</span> 自动保存中...';
      form.parentElement.insertBefore(indicator, form);
      return indicator;
    },

    showSaveStatus(indicator, status) {
      indicator.classList.add('show', status);
      indicator.classList.remove('saving', 'saved', 'error');
      
      const iconMap = {
        saving: '<span class="autosave-spinner"></span>',
        saved: '✓',
        error: '✗'
      };
      
      const textMap = {
        saving: '自动保存中...',
        saved: '已自动保存',
        error: '保存失败'
      };
      
      indicator.innerHTML = `<span class="autosave-icon">${iconMap[status]}</span> ${textMap[status]}`;
      
      if (status === 'saved') {
        setTimeout(() => indicator.classList.remove('show'), 2000);
      }
    },

    saveFormData(form, key) {
      const data = new FormData(form);
      const obj = {};
      for (const [k, v] of data.entries()) {
        obj[k] = v;
      }
      localStorage.setItem(key, JSON.stringify({
        data: obj,
        time: Date.now()
      }));
    },

    restoreFormData(form, key) {
      const saved = localStorage.getItem(key);
      if (!saved) return;
      
      try {
        const { data, time } = JSON.parse(saved);
        // 1天内有效
        if (Date.now() - time < 86400000) {
          Object.entries(data).forEach(([k, v]) => {
            const input = form.elements[k];
            if (input && input.type !== 'password') {
              input.value = v;
            }
          });
        }
      } catch (e) {
        console.warn('Failed to restore form data');
      }
    },

    announceToScreenReader(message) {
      const liveRegion = document.createElement('div');
      liveRegion.className = 'aria-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.textContent = message;
      document.body.appendChild(liveRegion);
      setTimeout(() => liveRegion.remove(), 1000);
    }
  };

  // =============================================
  // 3. 交互优化模块
  // =============================================
  const InteractionUX = {
    init() {
      this.initHoverEffects();
      this.initRippleEffects();
      this.initClickFeedback();
      this.initLoadingStates();
      this.initSuccessAnimations();
    },

    // 悬停效果
    initHoverEffects() {
      document.querySelectorAll('.hover-lift, .hover-scale, .hover-glow').forEach(el => {
        // 确保在支持hover的设备上添加
        if (window.matchMedia('(hover: hover)').matches) {
          el.style.willChange = 'transform, box-shadow';
        }
      });
    },

    // 涟漪效果
    initRippleEffects() {
      document.querySelectorAll('.click-ripple, button, .ripple-target').forEach(el => {
        el.addEventListener('click', (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const ripple = document.createElement('span');
          ripple.className = 'ripple-effect';
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          
          // 创建容器
          let container = el.querySelector('.ripple-container');
          if (!container) {
            container = document.createElement('span');
            container.className = 'ripple-container';
            container.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;pointer-events:none;border-radius:inherit;';
            el.style.position = 'relative';
            el.appendChild(container);
          }
          
          container.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
        });
      });
    },

    // 点击反馈
    initClickFeedback() {
      document.querySelectorAll('.btn-press').forEach(btn => {
        btn.addEventListener('mousedown', () => {
          btn.classList.add('pressing');
        });
        btn.addEventListener('mouseup', () => {
          btn.classList.remove('pressing');
        });
        btn.addEventListener('mouseleave', () => {
          btn.classList.remove('pressing');
        });
      });
    },

    // 加载状态
    initLoadingStates() {
      // 显示骨架屏
      document.querySelectorAll('[data-loading]').forEach(el => {
        const original = el.innerHTML;
        const skeleton = `
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text medium"></div>
          <div class="skeleton skeleton-avatar"></div>
        `;
        
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = skeleton;
        el.style.position = 'relative';
        el.appendChild(overlay);
        
        // 模拟加载完成
        setTimeout(() => {
          overlay.classList.add('show');
          setTimeout(() => {
            overlay.classList.remove('show');
            overlay.remove();
          }, 300);
        }, 1000);
      });
    },

    // 成功动画
    initSuccessAnimations() {
      // 页面加载完成动画
      window.addEventListener('load', () => {
        document.querySelectorAll('[data-animate-on-load]').forEach((el, i) => {
          setTimeout(() => {
            el.classList.add('animate-in');
          }, i * 100);
        });
      });
    },

    // 显示成功提示
    showSuccess(message, duration = 3000) {
      const existing = document.querySelector('.success-toast');
      if (existing) existing.remove();
      
      const toast = document.createElement('div');
      toast.className = 'success-toast';
      toast.innerHTML = `
        <span class="icon">✓</span>
        <span class="message">${message}</span>
      `;
      document.body.appendChild(toast);
      
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });
      
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  };

  // =============================================
  // 4. 移动端优化模块
  // =============================================
  const MobileUX = {
    init() {
      if (!('ontouchstart' in window)) return;
      
      this.initTouchTargets();
      this.initSwipeActions();
      this.initPullToRefresh();
      this.initBottomNav();
    },

    // 触摸目标
    initTouchTargets() {
      // 确保所有可点击元素有足够大的触摸区域
      document.querySelectorAll('a, button, [role="button"], input[type="checkbox"], input[type="radio"]').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          el.classList.add('touch-friendly');
        }
      });
    },

    // 滑动操作
    initSwipeActions() {
      document.querySelectorAll('.swipe-action').forEach(el => {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        const content = el.querySelector('.swipe-action-content');
        const deleteZone = el.querySelector('.swipe-action-delete');
        if (!content) return;
        
        el.addEventListener('touchstart', (e) => {
          startX = e.touches[0].clientX;
          isDragging = true;
          content.style.transition = 'none';
        }, { passive: true });
        
        el.addEventListener('touchmove', (e) => {
          if (!isDragging) return;
          
          currentX = e.touches[0].clientX;
          let diff = startX - currentX;
          
          // 只允许向左滑动
          if (diff > 0) {
            diff = Math.min(diff, 100);
            content.style.transform = `translateX(-${diff}px)`;
          }
        }, { passive: true });
        
        el.addEventListener('touchend', () => {
          isDragging = false;
          content.style.transition = '';
          
          if (currentX < startX - 60) {
            el.classList.add('revealed');
          } else {
            el.classList.remove('revealed');
            content.style.transform = '';
          }
        });
      });
    },

    // 下拉刷新
    initPullToRefresh() {
      const container = document.querySelector('.pull-to-refresh');
      if (!container) return;
      
      let startY = 0;
      let pullDistance = 0;
      let isRefreshing = false;
      
      const indicator = document.createElement('div');
      indicator.className = 'pull-indicator';
      indicator.innerHTML = '<div class="pull-spinner"></div>';
      container.prepend(indicator);
      
      container.addEventListener('touchstart', (e) => {
        if (container.scrollTop === 0 && !isRefreshing) {
          startY = e.touches[0].clientY;
        }
      }, { passive: true });
      
      container.addEventListener('touchmove', (e) => {
        if (container.scrollTop > 0 || isRefreshing) return;
        
        const currentY = e.touches[0].clientY;
        pullDistance = currentY - startY;
        
        if (pullDistance > 0) {
          e.preventDefault();
          pullDistance = Math.min(pullDistance, 100);
          indicator.style.top = `${pullDistance - 60}px`;
          indicator.classList.add('pulling');
        }
      }, { passive: false });
      
      container.addEventListener('touchend', () => {
        if (pullDistance > 60) {
          isRefreshing = true;
          indicator.classList.remove('pulling');
          indicator.classList.add('refreshing');
          indicator.style.top = '10px';
          
          // 触发刷新回调
          container.dispatchEvent(new CustomEvent('refresh'));
          
          setTimeout(() => {
            isRefreshing = false;
            indicator.style.top = '-60px';
            indicator.classList.remove('refreshing');
            pullDistance = 0;
          }, 1000);
        } else {
          indicator.style.top = '-60px';
          indicator.classList.remove('pulling');
          pullDistance = 0;
        }
      });
    },

    // 底部导航
    initBottomNav() {
      const bottomNav = document.querySelector('.bottom-nav');
      if (!bottomNav) return;
      
      // 活动项高亮
      const currentPath = window.location.pathname;
      bottomNav.querySelectorAll('.bottom-nav-item').forEach(item => {
        if (item.getAttribute('href') === currentPath) {
          item.classList.add('active');
        }
      });
      
      // 点击反馈
      bottomNav.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.addEventListener('touchstart', () => {
          item.classList.add('touching');
        }, { passive: true });
        
        item.addEventListener('touchend', () => {
          setTimeout(() => item.classList.remove('touching'), 150);
        }, { passive: true });
      });
    }
  };

  // =============================================
  // 5. 无障碍优化模块
  // =============================================
  const AccessibilityUX = {
    init() {
      this.initKeyboardNav();
      this.initSkipLinks();
      this.initFocusManagement();
      this.initARIA();
      this.initAccessibilitySettings();
    },

    // 键盘导航
    initKeyboardNav() {
      // Tab键视觉提示
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          document.body.classList.add('keyboard-nav');
        }
      });
      
      document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
      });
    },

    // 跳转链接
    initSkipLinks() {
      const skipLink = document.querySelector('.skip-link');
      if (!skipLink) return;
      
      skipLink.addEventListener('click', (e) => {
        const target = document.querySelector(skipLink.getAttribute('href'));
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    },

    // 焦点管理
    initFocusManagement() {
      // 模态框焦点陷阱
      document.querySelectorAll('[role="dialog"], .modal').forEach(modal => {
        modal.addEventListener('keydown', (e) => {
          if (e.key !== 'Tab') return;
          
          const focusable = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        });
      });
    },

    // ARIA标签
    initARIA() {
      // 为图标按钮添加aria-label
      document.querySelectorAll('.icon-only, button:not(:has-text), [class*="icon"]').forEach(btn => {
        if (!btn.getAttribute('aria-label') && !btn.getAttribute('aria-labelledby')) {
          const icon = btn.querySelector('span, i, svg');
          if (icon) {
            btn.setAttribute('aria-label', icon.textContent.trim() || '按钮');
          }
        }
      });
    },

    // 无障碍设置
    initAccessibilitySettings() {
      const settings = localStorage.getItem('a11ySettings');
      if (settings) {
        try {
          const prefs = JSON.parse(settings);
          this.applyPreferences(prefs);
        } catch (e) {}
      }
      
      // 监听系统偏好
      if (window.matchMedia) {
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
          this.applyPreferences({ reducedMotion: true });
        });
      }
    },

    applyPreferences(prefs) {
      if (prefs.highContrast) {
        document.body.classList.add('high-contrast');
      }
      if (prefs.largeText) {
        document.body.classList.add('large-text');
      }
      if (prefs.reducedMotion) {
        document.body.classList.add('reduced-motion');
      }
    }
  };

  // =============================================
  // 6. 用户反馈模块
  // =============================================
  const FeedbackUX = {
    init() {
      this.initSurvey();
      this.initFeedbackForm();
      this.initFeedbackTracking();
    },

    // 满意度调查
    initSurvey() {
      const ratingContainers = document.querySelectorAll('.rating-stars');
      
      ratingContainers.forEach(container => {
        const stars = container.querySelectorAll('.rating-star');
        let currentRating = 0;
        
        stars.forEach((star, index) => {
          star.addEventListener('click', () => {
            currentRating = index + 1;
            this.updateStars(stars, currentRating);
            container.dataset.value = currentRating;
            this.announceToScreenReader(`您给出了${currentRating}星评价`);
          });
          
          star.addEventListener('mouseenter', () => {
            this.updateStars(stars, index + 1);
          });
          
          star.addEventListener('mouseleave', () => {
            this.updateStars(stars, currentRating);
          });
        });
      });
    },

    updateStars(stars, rating) {
      stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
        star.setAttribute('aria-pressed', index < rating ? 'true' : 'false');
      });
    },

    // 反馈表单
    initFeedbackForm() {
      const form = document.querySelector('.feedback-form');
      if (!form) return;
      
      // 分类选择
      form.querySelectorAll('.feedback-category-item').forEach(item => {
        item.addEventListener('click', () => {
          const isMulti = item.closest('.feedback-category').dataset.multiple;
          
          if (isMulti) {
            item.classList.toggle('selected');
          } else {
            item.parentElement.querySelectorAll('.feedback-category-item').forEach(i => {
              i.classList.remove('selected');
            });
            item.classList.add('selected');
          }
        });
      });
      
      // 提交处理
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitFeedback(form);
      });
    },

    async submitFeedback(form) {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // 添加分类
      const selectedCategories = [];
      form.querySelectorAll('.feedback-category-item.selected').forEach(item => {
        selectedCategories.push(item.dataset.category);
      });
      data.categories = selectedCategories;
      data.timestamp = Date.now();
      
      // 保存到本地（实际项目中发送到服务器）
      const feedbackList = JSON.parse(localStorage.getItem('userFeedbacks') || '[]');
      feedbackList.unshift(data);
      localStorage.setItem('userFeedbacks', JSON.stringify(feedbackList.slice(0, 10)));
      
      // 显示成功
      InteractionUX.showSuccess('感谢您的反馈！');
      
      // 重置表单
      form.reset();
      form.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    },

    // 反馈追踪
    initFeedbackTracking() {
      const trackingContainer = document.querySelector('.feedback-tracking');
      if (!trackingContainer) return;
      
      const feedbackList = JSON.parse(localStorage.getItem('userFeedbacks') || '[]');
      
      if (!feedbackList.length) {
        trackingContainer.innerHTML = '<p class="text-muted">暂无反馈记录</p>';
        return;
      }
      
      trackingContainer.innerHTML = feedbackList.slice(0, 5).map(feedback => {
        const date = new Date(feedback.timestamp);
        const status = this.getFeedbackStatus(feedback.timestamp);
        
        return `
          <div class="feedback-status">
            <span class="feedback-status-icon ${status.class}">${status.icon}</span>
            <div class="feedback-status-content">
              <div class="feedback-status-title">${feedback.categories?.join(', ') || '一般反馈'}</div>
              <div class="feedback-status-time">${this.formatDate(date)} · ${status.text}</div>
            </div>
          </div>
        `;
      }).join('');
    },

    getFeedbackStatus(timestamp) {
      const diff = Date.now() - timestamp;
      const hours = diff / (1000 * 60 * 60);
      
      if (hours < 1) return { class: 'submitted', icon: '📤', text: '已提交' };
      if (hours < 24) return { class: 'processing', icon: '⏳', text: '处理中' };
      return { class: 'resolved', icon: '✓', text: '已处理' };
    },

    formatDate(date) {
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
      return date.toLocaleDateString('zh-CN');
    },

    announceToScreenReader(message) {
      const liveRegion = document.createElement('div');
      liveRegion.className = 'aria-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.textContent = message;
      document.body.appendChild(liveRegion);
      setTimeout(() => liveRegion.remove(), 1000);
    }
  };

  // =============================================
  // 初始化
  // =============================================
  document.addEventListener('DOMContentLoaded', () => {
    NavigationUX.init();
    FormUX.init();
    InteractionUX.init();
    MobileUX.init();
    AccessibilityUX.init();
    FeedbackUX.init();
  });

  // 暴露给全局
  window.UX = {
    showSuccess: InteractionUX.showSuccess,
    Navigation: NavigationUX,
    Form: FormUX,
    Interaction: InteractionUX,
    Mobile: MobileUX,
    Accessibility: AccessibilityUX,
    Feedback: FeedbackUX
  };

})();
