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

  // ========== 下拉刷新功能 ==========
  window.PullToRefresh = {
    init: function(options = {}) {
      const config = {
        container: options.container || document.body,
        onRefresh: options.onRefresh || function() { return Promise.resolve(); },
        threshold: options.threshold || 60,
        maxPull: options.maxPull || 80
      };

      const container = typeof config.container === 'string' 
        ? document.querySelector(config.container) 
        : config.container;
      
      if (!container) return;

      // 添加样式类
      container.classList.add('pull-to-refresh');
      
      // 创建刷新指示器
      const indicator = document.createElement('div');
      indicator.className = 'pull-to-refresh-indicator';
      indicator.innerHTML = `
        <div class="spinner"></div>
        <span class="pull-text">下拉刷新</span>
      `;
      container.insertBefore(indicator, container.firstChild);

      let startY = 0;
      let currentY = 0;
      let isPulling = false;
      let isRefreshing = false;

      container.addEventListener('touchstart', function(e) {
        if (isRefreshing) return;
        if (container.scrollTop > 0) return;
        
        startY = e.touches[0].clientY;
        isPulling = true;
        indicator.querySelector('.pull-text').textContent = '下拉刷新';
      }, { passive: true });

      container.addEventListener('touchmove', function(e) {
        if (!isPulling || isRefreshing) return;
        
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        if (diff > 0) {
          e.preventDefault();
          const pullDistance = Math.min(diff * 0.5, config.maxPull);
          container.style.transform = `translateY(${pullDistance}px)`;
          container.style.transition = 'none';
          
          if (pullDistance >= config.threshold) {
            container.classList.add('pulling');
            indicator.querySelector('.pull-text').textContent = '释放刷新';
          } else {
            container.classList.remove('pulling');
            indicator.querySelector('.pull-text').textContent = '下拉刷新';
          }
        }
      }, { passive: false });

      container.addEventListener('touchend', function() {
        if (!isPulling) return;
        isPulling = false;
        
        container.style.transform = '';
        container.style.transition = '';
        
        const diff = currentY - startY;
        if (diff >= config.threshold && !isRefreshing) {
          isRefreshing = true;
          container.classList.add('refreshing');
          container.classList.remove('pulling');
          indicator.querySelector('.pull-text').textContent = '加载中...';
          
          config.onRefresh().finally(function() {
            isRefreshing = false;
            container.classList.remove('refreshing');
            indicator.querySelector('.pull-text').textContent = '刷新成功';
            
            setTimeout(function() {
              indicator.querySelector('.pull-text').textContent = '下拉刷新';
            }, 1000);
          });
        }
        
        container.classList.remove('pulling');
        currentY = 0;
        startY = 0;
      }, { passive: true });
    }
  };

  // ========== 上拉加载更多功能 ==========
  window.LoadMore = {
    init: function(options = {}) {
      const config = {
        container: options.container || null,
        selector: options.selector || '.load-more-trigger',
        onLoadMore: options.onLoadMore || function() { return Promise.resolve(); },
        threshold: options.threshold || 100
      };

      const trigger = config.container 
        ? config.container.querySelector(config.selector)
        : document.querySelector(config.selector);
      
      if (!trigger) return;

      let isLoading = false;
      let isEnd = false;

      // 无限滚动观察器
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting && !isLoading && !isEnd) {
              loadMore();
            }
          });
        }, {
          rootMargin: config.threshold + 'px'
        });

        observer.observe(trigger);
      }

      function loadMore() {
        isLoading = true;
        trigger.classList.add('loading');
        
        config.onLoadMore().then(function(result) {
          if (result && result.end) {
            isEnd = true;
            trigger.classList.add('end');
            trigger.classList.remove('loading');
            trigger.querySelector('.text').textContent = '没有更多了';
            observer.disconnect();
          } else {
            trigger.classList.remove('loading');
          }
          isLoading = false;
        }).catch(function() {
          isLoading = false;
          trigger.classList.remove('loading');
        });
      }

      // 手动点击加载
      trigger.addEventListener('click', function() {
        if (!isLoading && !isEnd) {
          loadMore();
        }
      });

      return {
        setEnd: function() {
          isEnd = true;
          trigger.classList.add('end');
          trigger.querySelector('.text').textContent = '没有更多了';
        }
      };
    }
  };

  // ========== 左滑删除功能 ==========
  window.SwipeToDelete = {
    init: function(options = {}) {
      const config = {
        selector: options.selector || '.swipe-to-delete',
        onDelete: options.onDelete || function(element) { return Promise.resolve(); },
        onConfirm: options.onConfirm !== undefined ? options.onConfirm : true
      };

      const elements = document.querySelectorAll(config.selector);
      
      elements.forEach(function(el) {
        const content = el.querySelector('.swipe-to-delete-content');
        const actions = el.querySelector('.swipe-to-delete-actions');
        
        if (!content || !actions) return;

        let startX = 0;
        let currentX = 0;
        let isSwiping = false;
        let startY = 0;
        let deltaY = 0;
        let maxDistance = parseInt(getComputedStyle(el).getPropertyValue('--swipe-max-distance')) || 80;

        el.addEventListener('touchstart', function(e) {
          // 如果是垂直滚动，跳过
          startY = e.touches[0].clientY;
          startX = e.touches[0].clientX;
          isSwiping = true;
          content.style.transition = 'none';
        }, { passive: true });

        el.addEventListener('touchmove', function(e) {
          if (!isSwiping) return;
          
          currentX = e.touches[0].clientX;
          deltaY = Math.abs(e.touches[0].clientY - startY);
          
          // 如果垂直移动大于水平移动，停止处理
          if (deltaY > 10 && Math.abs(currentX - startX) < deltaY) {
            return;
          }
          
          e.preventDefault();
          
          const diff = startX - currentX; // 反向：向左滑为正
          
          if (diff > 0) {
            const translateX = Math.min(diff * 0.8, maxDistance);
            content.style.transform = `translateX(-${translateX}px)`;
            
            if (translateX >= maxDistance * 0.5) {
              el.classList.add('swiped');
            } else {
              el.classList.remove('swiped');
            }
          }
        }, { passive: false });

        el.addEventListener('touchend', function() {
          if (!isSwiping) return;
          isSwiping = false;
          
          const diff = startX - currentX;
          
          content.style.transition = '';
          
          if (diff >= maxDistance * 0.5) {
            // 显示操作按钮
            content.style.transform = `translateX(-${maxDistance}px)`;
            el.classList.add('swiped');
          } else {
            // 恢复原位
            content.style.transform = '';
            el.classList.remove('swiped');
          }
        }, { passive: true });

        // 删除按钮点击
        const deleteBtn = actions.querySelector('.swipe-action-delete');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (config.onConfirm) {
              showDeleteConfirm(el);
            } else {
              performDelete(el);
            }
          });
        }

        // 点击其他地方关闭
        el.addEventListener('click', function(e) {
          if (el.classList.contains('swiped') && !actions.contains(e.target)) {
            content.style.transform = '';
            el.classList.remove('swiped');
          }
        });
      });

      function showDeleteConfirm(el) {
        // 创建确认弹窗
        let confirm = document.querySelector('.swipe-delete-confirm');
        if (!confirm) {
          confirm = document.createElement('div');
          confirm.className = 'swipe-delete-confirm';
          confirm.innerHTML = `
            <h3>确认删除</h3>
            <p>删除后将无法恢复，确定要删除吗？</p>
            <div class="actions">
              <button class="btn btn-cancel">取消</button>
              <button class="btn btn-confirm">删除</button>
            </div>
          `;
          document.body.appendChild(confirm);
        }

        confirm.classList.add('show');

        const cancelBtn = confirm.querySelector('.btn-cancel');
        const confirmBtn = confirm.querySelector('.btn-confirm');

        cancelBtn.onclick = function() {
          confirm.classList.remove('show');
          content.style.transform = '';
          el.classList.remove('swiped');
        };

        confirmBtn.onclick = function() {
          confirm.classList.remove('show');
          performDelete(el);
        };

        // 点击遮罩关闭
        confirm.onclick = function(e) {
          if (e.target === confirm) {
            confirm.classList.remove('show');
            content.style.transform = '';
            el.classList.remove('swiped');
          }
        };
      }

      function performDelete(el) {
        el.classList.add('deleting');
        
        setTimeout(function() {
          config.onDelete(el).then(function() {
            el.remove();
          }).catch(function() {
            el.classList.remove('deleting');
            el.style.transform = '';
          });
        }, 300);
      }
    }
  };

  // ========== 触摸优化 ==========
  window.TouchOptimize = {
    init: function(options = {}) {
      const config = {
        selector: options.selector || '.touch-interactive, .card, .btn, a[href]'
      };

      const elements = document.querySelectorAll(config.selector);
      
      elements.forEach(function(el) {
        // 跳过已有特殊处理的元素
        if (el.dataset.touchBound) return;
        el.dataset.touchBound = 'true';
        
        // 添加缩放反馈
        el.classList.add('touch-scale');
        
        // 处理点击
        el.addEventListener('click', function(e) {
          // 如果是链接且有自定义点击处理，跳过
          if (el.tagName === 'A' && el.href) return;
          if (el.tagName === 'BUTTON' && el.type === 'submit') return;
        });
      });

      // 禁用双击缩放
      let lastTouchEnd = 0;
      document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      }, false);

      // 禁用手势缩放
      document.addEventListener('gesturend', function(e) {
        e.preventDefault();
      });

      // 增强的输入框处理
      const inputs = document.querySelectorAll('input, textarea');
      inputs.forEach(function(input) {
        input.classList.add('touch-scale');
        
        input.addEventListener('focus', function() {
          document.body.classList.add('input-focused');
          scrollIntoViewIfNeeded(input);
        });
        
        input.addEventListener('blur', function() {
          document.body.classList.remove('input-focused');
        });
      });

      function scrollIntoViewIfNeeded(element) {
        setTimeout(function() {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 300);
      }
    }
  };

  // ========== 键盘弹出检测 ==========
  window.KeyboardDetector = {
    isOpen: false,
    
    init: function() {
      // 使用resize事件检测键盘
      let lastHeight = window.innerHeight;
      
      window.addEventListener('resize', function() {
        const currentHeight = window.innerHeight;
        
        if (currentHeight < lastHeight) {
          // 键盘打开
          if (!KeyboardDetector.isOpen) {
            KeyboardDetector.isOpen = true;
            document.body.classList.add('keyboard-open');
            document.dispatchEvent(new CustomEvent('keyboardopen'));
          }
        } else {
          // 键盘关闭
          if (KeyboardDetector.isOpen) {
            KeyboardDetector.isOpen = false;
            document.body.classList.remove('keyboard-open');
            document.dispatchEvent(new CustomEvent('keyboardclose'));
          }
        }
        
        lastHeight = currentHeight;
      });

      // 监听输入框焦点
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(function(input) {
        input.addEventListener('focus', function() {
          setTimeout(function() {
            KeyboardDetector.isOpen = true;
            document.body.classList.add('keyboard-open');
          }, 100);
        });
        
        input.addEventListener('blur', function() {
          setTimeout(function() {
            if (document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'TEXTAREA' &&
                document.activeElement.tagName !== 'SELECT') {
              KeyboardDetector.isOpen = false;
              document.body.classList.remove('keyboard-open');
            }
          }, 100);
        });
      });
    }
  };

  // ========== 底部导航栏增强 ==========
  window.BottomTabBar = {
    init: function(options = {}) {
      const config = {
        selector: options.selector || '.bottom-tab-bar',
        activeClass: options.activeClass || 'active'
      };

      const tabBar = document.querySelector(config.selector);
      if (!tabBar) return;

      // 添加内容区域占位
      const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body.firstElementChild;
      if (mainContent) {
        mainContent.classList.add('has-bottom-tab-bar');
      }

      // 高亮当前页
      const currentPath = window.location.pathname;
      const tabs = tabBar.querySelectorAll('.bottom-tab-item');
      
      tabs.forEach(function(tab) {
        const href = tab.getAttribute('href');
        
        if (href) {
          const pageName = href.replace('.html', '').replace('./', '');
          
          if (currentPath.includes(pageName) || 
              (pageName === 'index' && (currentPath === '/' || currentPath.endsWith('index.html')))) {
            tab.classList.add(config.activeClass);
          }
        }

        // 点击反馈
        tab.addEventListener('touchstart', function() {
          tab.classList.add('touching');
        }, { passive: true });
        
        tab.addEventListener('touchend', function() {
          setTimeout(function() {
            tab.classList.remove('touching');
          }, 150);
        }, { passive: true });
      });

      // 显示徽章数字
      this.showBadge = function(tabIndex, count) {
        const tab = tabs[tabIndex];
        if (!tab) return;
        
        let badge = tab.querySelector('.tab-badge');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'tab-badge';
          const icon = tab.querySelector('.tab-icon');
          if (icon) {
            icon.appendChild(badge);
          }
        }
        
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      };

      return this;
    }
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
    
    // 初始化键盘检测
    KeyboardDetector.init();
  });

})();

/* ===================================
   移动端增强组件库
   功能：下拉刷新、上拉加载、ActionSheet、图片预览、网络状态
   =================================== */

// Toast 提示组件
var MobileToast = {
  show: function(message, duration) {
    duration = duration || 2000;
    var existingToast = document.querySelector('.mobile-toast');
    if (existingToast) existingToast.remove();
    
    var toast = document.createElement('div');
    toast.className = 'mobile-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    requestAnimationFrame(function() {
      toast.classList.add('show');
    });
    
    setTimeout(function() {
      toast.classList.remove('show');
      setTimeout(function() { toast.remove(); }, 300);
    }, duration);
  }
};

// ActionSheet 操作表组件
var MobileActionSheet = {
  show: function(options) {
    var items = options.items || [];
    var title = options.title || '';
    var onClose = options.onClose || function() {};
    
    var overlay = document.createElement('div');
    overlay.className = 'action-sheet-overlay';
    
    var itemsHtml = items.map(function(item, index) {
      return '<a href="#" class="action-sheet-item ' + (item.danger ? 'danger' : '') + '" data-index="' + index + '">' +
        (item.icon ? '<span>' + item.icon + '</span>' : '') +
        '<span>' + item.label + '</span></a>';
    }).join('');
    
    overlay.innerHTML = '<div class="action-sheet">' +
      (title ? '<div class="action-sheet-header"><div class="action-sheet-title">' + title + '</div></div>' : '') +
      '<div class="action-sheet-items">' + itemsHtml + '</div>' +
      '<a href="#" class="action-sheet-cancel">取消</a></div>';
    
    document.body.appendChild(overlay);
    
    requestAnimationFrame(function() {
      overlay.classList.add('show');
    });
    
    var close = function() {
      overlay.classList.remove('show');
      setTimeout(function() {
        overlay.remove();
        onClose();
      }, 300);
    };
    
    overlay.querySelectorAll('.action-sheet-item').forEach(function(item, index) {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        if (items[index].onClick) {
          items[index].onClick();
        }
        close();
      });
    });
    
    overlay.querySelector('.action-sheet-cancel').addEventListener('click', function(e) {
      e.preventDefault();
      close();
    });
    
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        close();
      }
    });
    
    return { close: close };
  }
};

// 图片预览组件
var ImagePreview = {
  show: function(images, startIndex) {
    startIndex = startIndex || 0;
    
    var overlay = document.createElement('div');
    overlay.className = 'image-preview-overlay';
    
    overlay.innerHTML = '<span class="image-preview-close">×</span>' +
      '<div class="image-preview-content"><img src="' + images[startIndex] + '" alt="Preview"></div>' +
      '<div class="image-preview-actions">' +
        '<a href="#" class="image-preview-action" data-action="share"><span>🔗</span><span>分享</span></a>' +
        '<a href="#" class="image-preview-action" data-action="save"><span>💾</span><span>保存</span></a>' +
      '</div>';
    
    document.body.appendChild(overlay);
    
    requestAnimationFrame(function() {
      overlay.classList.add('show');
    });
    
    var close = function() {
      overlay.classList.remove('show');
      setTimeout(function() { overlay.remove(); }, 300);
    };
    
    overlay.querySelector('.image-preview-close').addEventListener('click', close);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay || e.target.tagName === 'IMG') {
        close();
      }
    });
    
    overlay.querySelector('[data-action="save"]').addEventListener('click', function(e) {
      e.preventDefault();
      var link = document.createElement('a');
      link.href = images[startIndex];
      link.download = 'preview.jpg';
      link.click();
    });
    
    overlay.querySelector('[data-action="share"]').addEventListener('click', function(e) {
      e.preventDefault();
      if (navigator.share) {
        navigator.share({
          title: '游导旅游',
          image: images[startIndex],
          url: window.location.href
        });
      } else {
        MobileToast.show('分享功能暂不可用');
      }
    });
  }
};

// 网络状态监听
var NetworkStatus = {
  banner: null,
  init: function() {
    this.banner = document.createElement('div');
    this.banner.className = 'network-status-banner';
    document.body.appendChild(this.banner);
    
    this.updateStatus();
    
    window.addEventListener('online', this.updateStatus.bind(this));
    window.addEventListener('offline', this.updateStatus.bind(this));
  },
  updateStatus: function() {
    var isOnline = navigator.onLine;
    this.banner.classList.remove('offline', 'slow', 'online');
    
    if (!isOnline) {
      this.banner.classList.add('offline');
      this.banner.textContent = '网络已断开，请检查网络连接';
    } else {
      this.banner.classList.add('online');
    }
  }
};

// 图片预览点击处理
document.addEventListener('click', function(e) {
  var target = e.target.closest('[data-preview-image], [data-preview-images]');
  if (target) {
    e.preventDefault();
    var singleImage = target.dataset.previewImage;
    var multipleImages = target.dataset.previewImages;
    
    if (singleImage) {
      ImagePreview.show([singleImage]);
    } else if (multipleImages) {
      try {
        var images = JSON.parse(multipleImages);
        var startIndex = parseInt(target.dataset.previewIndex) || 0;
        ImagePreview.show(images, startIndex);
      } catch(err) {}
    }
  }
});

// 导出到全局
window.MobileToast = MobileToast;
window.MobileActionSheet = MobileActionSheet;
window.ImagePreview = ImagePreview;
window.NetworkStatus = NetworkStatus;

// 初始化网络状态
if ('ontouchstart' in window) {
  document.addEventListener('DOMContentLoaded', function() {
    NetworkStatus.init();
  });
}
