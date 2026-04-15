/* ===================================
   移动端手势支持脚本
   功能：滑动、拖拽、长按、触摸反馈
   =================================== */

(function() {
  'use strict';

  // 检测是否为触摸设备
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // 初始化移动端优化
  function initMobileEnhancements() {
    if (!isTouchDevice) return;

    // 1. 触摸反馈效果
    initTouchFeedback();

    // 2. 滑动关闭菜单
    initSwipeCloseMenu();

    // 3. 长按菜单支持
    initLongPress();

    // 4. 滑动手势容器
    initSwipeContainers();

    // 5. 底部导航栏适配
    initBottomNav();

    // 6. 安全区域适配
    initSafeArea();
  }

  // 触摸反馈
  function initTouchFeedback() {
    const clickableElements = document.querySelectorAll(
      '.btn, .card, .clickable-card, a[href], button, [role="button"], .nav-links a'
    );

    clickableElements.forEach(el => {
      el.addEventListener('touchstart', function(e) {
        this.classList.add('touching');
      }, { passive: true });

      el.addEventListener('touchend', function(e) {
        this.classList.remove('touching');
        // 模拟点击效果
        this.classList.add('touched');
        setTimeout(() => this.classList.remove('touched'), 150);
      }, { passive: true });

      el.addEventListener('touchcancel', function() {
        this.classList.remove('touching');
      }, { passive: true });
    });
  }

  // 滑动关闭菜单
  function initSwipeCloseMenu() {
    const navLinks = document.querySelector('.nav-links');
    const navToggle = document.querySelector('.nav-toggle');

    if (!navLinks || !navToggle) return;

    let startX = 0;
    let currentX = 0;
    let isSwiping = false;

    navLinks.addEventListener('touchstart', function(e) {
      if (!navLinks.classList.contains('open')) return;
      startX = e.touches[0].clientX;
      isSwiping = true;
    }, { passive: true });

    navLinks.addEventListener('touchmove', function(e) {
      if (!isSwiping) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;

      // 从左向右滑动
      if (diff > 0 && diff < 150) {
        navLinks.style.transform = `translateX(${diff}px)`;
        navLinks.style.transition = 'none';
      }
    }, { passive: true });

    navLinks.addEventListener('touchend', function(e) {
      if (!isSwiping) return;
      isSwiping = false;

      const diff = currentX - startX;

      // 滑动超过80px关闭菜单
      if (diff > 80) {
        navLinks.classList.remove('open', 'active');
        navToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
      }

      navLinks.style.transform = '';
      navLinks.style.transition = '';
    }, { passive: true });
  }

  // 长按菜单
  function initLongPress() {
    const longPressElements = document.querySelectorAll('[data-long-press]');

    longPressElements.forEach(el => {
      let pressTimer = null;
      let isLongPress = false;

      const startPress = function(e) {
        isLongPress = false;
        pressTimer = setTimeout(function() {
          isLongPress = true;
          showLongPressMenu(el, e);

          // 触发长按事件
          el.dispatchEvent(new CustomEvent('longpress', {
            detail: { element: el }
          }));
        }, 500); // 500ms 长按触发
      };

      const cancelPress = function() {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      };

      const endPress = function() {
        if (!isLongPress) {
          // 短按 - 正常跳转
          if (el.tagName === 'A' && el.href) {
            window.location.href = el.href;
          }
        }
        cancelPress();
      };

      el.addEventListener('touchstart', startPress, { passive: false });
      el.addEventListener('touchend', endPress);
      el.addEventListener('touchmove', cancelPress);
    });
  }

  // 显示长按菜单
  function showLongPressMenu(el, event) {
    // 移除已存在的菜单
    const existingMenu = document.querySelector('.long-press-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.className = 'long-press-menu';

    // 获取长按菜单内容
    const menuContent = el.dataset.longPressMenu || '';
    if (menuContent) {
      menu.innerHTML = menuContent;
    } else {
      // 默认菜单项
      menu.innerHTML = `
        <a href="#" data-action="copy">复制链接</a>
        <a href="#" data-action="share">分享</a>
        <a href="#" data-action="favorite">收藏</a>
      `;
    }

    // 设置位置
    const rect = el.getBoundingClientRect();
    menu.style.top = `${rect.top}px`;
    menu.style.left = `${rect.left}px`;
    menu.classList.add('show');

    document.body.appendChild(menu);

    // 点击其他区域关闭
    const closeMenu = function(e) {
      if (!menu.contains(e.target)) {
        menu.classList.remove('show');
        setTimeout(() => menu.remove(), 200);
        document.removeEventListener('touchstart', closeMenu);
      }
    };

    setTimeout(() => {
      document.addEventListener('touchstart', closeMenu);
    }, 100);
  }

  // 滑动手势容器
  function initSwipeContainers() {
    const containers = document.querySelectorAll('.swipe-container');

    containers.forEach(container => {
      const content = container.querySelector('.swipe-content');
      if (!content) return;

      let startX = 0;
      let currentX = 0;
      let isDragging = false;
      let currentIndex = 0;

      // 获取子元素数量
      const items = content.querySelectorAll('.swipe-item');
      const itemCount = items.length;

      container.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        isDragging = true;
        content.style.transition = 'none';
      }, { passive: true });

      container.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        const offset = -currentIndex * container.offsetWidth + diff;
        content.style.transform = `translateX(${offset}px)`;
      }, { passive: true });

      container.addEventListener('touchend', function() {
        if (!isDragging) return;
        isDragging = false;

        const diff = currentX - startX;
        const threshold = container.offsetWidth * 0.2;

        if (diff < -threshold && currentIndex < itemCount - 1) {
          // 向左滑动 - 下一页
          currentIndex++;
        } else if (diff > threshold && currentIndex > 0) {
          // 向右滑动 - 上一页
          currentIndex--;
        }

        // 动画到正确位置
        content.style.transition = '';
        content.style.transform = `translateX(${-currentIndex * container.offsetWidth}px)`;

        // 更新指示器
        updateIndicators(container, currentIndex, itemCount);

        // 触发切换事件
        container.dispatchEvent(new CustomEvent('swipe', {
          detail: { index: currentIndex }
        }));
      }, { passive: true });
    });
  }

  // 更新指示器
  function updateIndicators(container, currentIndex, total) {
    const indicators = container.querySelector('.swipe-indicators');
    if (!indicators) return;

    const dots = indicators.querySelectorAll('.swipe-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  // 底部导航栏
  function initBottomNav() {
    // 为内容区域添加底部占位
    const mainContent = document.querySelector('main') || document.querySelector('.main-content');

    // 检查是否有底部导航
    const bottomNav = document.querySelector('.bottom-nav, .mobile-nav');
    if (bottomNav && mainContent) {
      mainContent.classList.add('has-bottom-nav');
    }

    // 底部导航高亮当前页
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.bottom-nav a, .mobile-nav a');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && currentPath.includes(href.replace('.html', ''))) {
        link.classList.add('active');
      }
    });
  }

  // 安全区域适配
  function initSafeArea() {
    // iOS 安全区域
    if (CSS.supports('padding', 'env(safe-area-inset-bottom)')) {
      document.documentElement.style.setProperty(
        '--safe-area-bottom',
        'env(safe-area-inset-bottom)'
      );
      document.documentElement.style.setProperty(
        '--safe-area-top',
        'env(safe-area-inset-top)'
      );
    }
  }

  // 导航菜单点击外部关闭
  function initOutsideClickClose() {
    document.addEventListener('click', function(e) {
      const navLinks = document.querySelector('.nav-links');
      const navToggle = document.querySelector('.nav-toggle');

      if (!navLinks || !navToggle) return;

      if (navLinks.classList.contains('open') &&
          !navLinks.contains(e.target) &&
          !navToggle.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
  }

  // 防止双击缩放
  function initPreventZoom() {
    let lastTouchEnd = 0;

    document.addEventListener('touchend', function(e) {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    document.addEventListener('gesturend', function(e) {
      e.preventDefault();
    });
  }

  // 键盘弹出时调整布局
  function initKeyboardAdjustment() {
    const inputs = document.querySelectorAll('input, textarea');

    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        document.body.classList.add('keyboard-open');
      });

      input.addEventListener('blur', function() {
        document.body.classList.remove('keyboard-open');
      });
    });
  }

  // 滚动阴影指示
  function initScrollShadows() {
    const scrollContainers = document.querySelectorAll('.scrollable, .smooth-scroll');

    scrollContainers.forEach(container => {
      container.addEventListener('scroll', function() {
        const scrollTop = this.scrollTop;
        const scrollHeight = this.scrollHeight;
        const clientHeight = this.clientHeight;

        // 顶部阴影
        if (scrollTop > 0) {
          this.classList.add('scroll-shadow-top');
        } else {
          this.classList.remove('scroll-shadow-top');
        }

        // 底部阴影
        if (scrollTop + clientHeight < scrollHeight - 1) {
          this.classList.add('scroll-shadow-bottom');
        } else {
          this.classList.remove('scroll-shadow-bottom');
        }
      }, { passive: true });
    });
  }

  // 图片懒加载增强
  function initLazyLoad() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '100px'
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // 导出函数供外部调用
  window.MobileEnhancements = {
    init: initMobileEnhancements,
    initTouchFeedback: initTouchFeedback,
    initSwipeCloseMenu: initSwipeCloseMenu,
    initLongPress: initLongPress,
    initBottomNav: initBottomNav,
    initSafeArea: initSafeArea
  };

  // 自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileEnhancements);
  } else {
    initMobileEnhancements();
  }

  // 额外的初始化
  document.addEventListener('DOMContentLoaded', function() {
    initOutsideClickClose();
    initPreventZoom();
    initKeyboardAdjustment();
    initScrollShadows();
    initLazyLoad();
  });

})();
