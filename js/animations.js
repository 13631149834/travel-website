/**
 * ===================================
 * 页面过渡动画控制脚本
 * 功能：页面加载动画、滚动触发动画、按钮点击效果
 * ===================================
 */

(function() {
  'use strict';

  // 动画控制类
  const AnimationController = {
    // 配置
    config: {
      threshold: 0.15,           // 元素可见比例阈值
      rootMargin: '0px 0px -50px 0px', // 提前触发
      pageTransitionDelay: 400,  // 页面过渡延迟
      scrollRevealDelay: 100     // 交错延迟
    },

    // 初始化
    init() {
      this.setupPageTransition();
      this.setupScrollReveal();
      this.setupButtonEffects();
      this.setupCardAnimations();
      this.setupNavAnimations();
    },

    // 页面加载过渡
    setupPageTransition() {
      const overlay = document.querySelector('.page-transition-overlay');
      if (!overlay) return;

      // 页面加载完成后淡出
      window.addEventListener('load', () => {
        setTimeout(() => {
          overlay.classList.add('fade-out');
          // 触发初始内容动画
          this.triggerInitialAnimations();
        }, 300);
        
        // 动画结束后移除
        setTimeout(() => {
          overlay.remove();
        }, 700);
      });
    },

    // 触发初始动画
    triggerInitialAnimations() {
      const elements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-down, .fade-in-left, .fade-in-right, .fade-in-scale');
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, index * 80);
      });
    },

    // 滚动触发动画 - 使用 Intersection Observer
    setupScrollReveal() {
      const observerOptions = {
        threshold: this.config.threshold,
        rootMargin: this.config.rootMargin
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // 添加延迟以实现交错效果
            const delay = entry.target.dataset.delay || 
                          (index % 5) * this.config.scrollRevealDelay;
            
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, delay);
            
            // 动画完成后停止观察
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // 观察所有需要滚动触发的元素
      const elements = document.querySelectorAll('.scroll-reveal, .scroll-slide-left, .scroll-slide-right, .scroll-zoom, .scroll-flip');
      elements.forEach(el => observer.observe(el));
    },

    // 按钮点击效果
    setupButtonEffects() {
      // 涟漪效果按钮
      document.querySelectorAll('.btn-ripple').forEach(btn => {
        btn.addEventListener('click', function(e) {
          const rect = this.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // 创建涟漪元素
          const ripple = document.createElement('span');
          ripple.className = 'ripple-effect';
          ripple.style.cssText = `
            position: absolute;
            background: rgba(255,255,255,0.4);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            width: 100px;
            height: 100px;
            left: ${x - 50}px;
            top: ${y - 50}px;
          `;
          
          this.style.position = 'relative';
          this.style.overflow = 'hidden';
          this.appendChild(ripple);
          
          setTimeout(() => ripple.remove(), 600);
        });
      });

      // 添加涟漪动画样式
      if (!document.getElementById('ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }
    },

    // 卡片动画
    setupCardAnimations() {
      const cards = document.querySelectorAll('.card-hover, .card-3d-hover, .card-border-hover');
      
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.classList.add('is-hovering');
        });
        
        card.addEventListener('mouseleave', () => {
          card.classList.remove('is-hovering');
        });
      });
    },

    // 导航链接动画
    setupNavAnimations() {
      const navLinks = document.querySelectorAll('.nav-link-animate');
      
      navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
          link.classList.add('hovering');
        });
        
        link.addEventListener('mouseleave', () => {
          link.classList.remove('hovering');
        });
      });
    },

    // 页面切换动画
    animatePageTransition(direction = 'in') {
      const mainContent = document.querySelector('main') || document.body;
      
      if (direction === 'out') {
        mainContent.classList.add('page-fade-out');
      } else {
        mainContent.classList.add('page-fade-in');
        setTimeout(() => {
          mainContent.classList.remove('page-fade-in');
        }, this.config.pageTransitionDelay);
      }
    },

    // 手动触发元素动画
    revealElement(selector, delay = 0) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('revealed', 'visible');
        }, delay + index * 100);
      });
    },

    // 页面可见性变化时重新触发动画
    handleVisibilityChange() {
      if (!document.hidden) {
        this.setupScrollReveal();
      }
    }
  };

  // 防抖函数
  function debounce(func, wait = 10) {
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

  // 滚动进度指示器
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min((scrollTop / docHeight) * 100, 100);
    
    let progressBar = document.querySelector('.scroll-progress-bar');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress-bar';
      progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #4F86F7, #10B981);
        z-index: 10000;
        transition: width 0.1s ease;
      `;
      document.body.appendChild(progressBar);
    }
    
    progressBar.style.width = `${progress}%`;
  }

  // 初始化
  document.addEventListener('DOMContentLoaded', () => {
    AnimationController.init();
    
    // 可选：添加滚动进度
    if (window.innerWidth > 768) {
      window.addEventListener('scroll', debounce(updateScrollProgress, 5));
    }
    
    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      AnimationController.handleVisibilityChange();
    });
  });

  // 页面离开时触发动画
  window.addEventListener('beforeunload', () => {
    // 简单的淡出效果
    document.body.style.transition = 'opacity 0.2s ease';
    document.body.style.opacity = '0.8';
  });

  // 导出到全局
  window.AnimationController = AnimationController;

})();
