/**
 * ===================================
 * 滚动显示动画与交互效果脚本
 * 功能：滚动触发动画、数字计数动画、返回顶部按钮
 * ===================================
 */

(function() {
  'use strict';

  // 滚动动画控制器
  const ScrollReveal = {
    // 配置
    config: {
      threshold: 0.15,           // 元素可见比例阈值
      rootMargin: '0px 0px -50px 0px',  // 提前触发距离
      staggerDelay: 100,         // 交错动画延迟
      countDuration: 2000,       // 数字计数动画时长(ms)
      countInterval: 50,         // 数字更新间隔(ms)
      backToTopOffset: 300       // 显示返回顶部按钮的滚动距离
    },

    // 初始化
    init(options = {}) {
      Object.assign(this.config, options);
      
      this.setupScrollReveal();
      this.setupCountAnimation();
      this.setupBackToTop();
      this.setupParallaxEffects();
    },

    // 滚动显示动画
    setupScrollReveal() {
      const observerOptions = {
        threshold: this.config.threshold,
        rootMargin: this.config.rootMargin
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // 获取延迟设置
            const delay = entry.target.dataset.delay || 
                         (index % 5) * this.config.staggerDelay;
            
            setTimeout(() => {
              entry.target.classList.add('revealed');
              
              // 触发数字计数动画
              if (entry.target.classList.contains('count-trigger')) {
                this.animateCountNumber(entry.target);
              }
            }, delay);
            
            // 动画完成后停止观察
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // 观察所有需要滚动触发的元素
      const elements = document.querySelectorAll(
        '.scroll-reveal, .scroll-slide-left, .scroll-slide-right, .scroll-zoom, .scroll-flip, .count-trigger'
      );
      
      elements.forEach(el => observer.observe(el));
    },

    // 数字计数动画
    setupCountAnimation() {
      // 获取所有需要计数的元素
      const countElements = document.querySelectorAll('[data-count], .count-number');
      
      countElements.forEach(el => {
        // 保存原始值
        if (!el.dataset.originalValue) {
          el.dataset.originalValue = el.textContent;
        }
      });
    },

    // 触发现有计数元素动画
    animateCountNumber(element) {
      const target = parseFloat(element.dataset.count || element.textContent);
      const duration = parseInt(element.dataset.countDuration) || this.config.countDuration;
      const isDecimal = target % 1 !== 0;
      const prefix = element.dataset.countPrefix || '';
      const suffix = element.dataset.countSuffix || '';
      
      let start = 0;
      const increment = target / (duration / this.config.countInterval);
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 缓动函数 - easeOutCubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        let current = start + (target - start) * easeProgress;
        
        // 格式化数字
        let displayValue;
        if (isDecimal) {
          displayValue = current.toFixed(1);
        } else {
          displayValue = Math.floor(current).toLocaleString();
        }
        
        element.textContent = prefix + displayValue + suffix;
        
        // 添加动画类
        element.classList.add('animating');
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.classList.remove('animating');
          element.textContent = prefix + (isDecimal ? target.toFixed(1) : Math.floor(target).toLocaleString()) + suffix;
        }
      };
      
      requestAnimationFrame(animate);
    },

    // 批量触发动画
    revealAll(selector, delay = 0) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('revealed');
        }, delay + index * 80);
      });
    },

    // 返回顶部按钮
    setupBackToTop() {
      // 创建按钮
      const btn = document.createElement('button');
      btn.className = 'back-to-top';
      btn.innerHTML = '↑';
      btn.setAttribute('aria-label', '返回顶部');
      btn.title = '返回顶部';
      
      document.body.appendChild(btn);
      
      // 滚动事件
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            this.handleScroll(btn);
            ticking = false;
          });
          ticking = true;
        }
      });
      
      // 点击事件
      btn.addEventListener('click', () => {
        this.scrollToTop();
      });
      
      // 初始检查
      this.handleScroll(btn);
    },

    // 处理滚动
    handleScroll(btn) {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      
      if (scrollY > this.config.backToTopOffset) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    },

    // 滚动到顶部
    scrollToTop() {
      const currentScroll = window.scrollY;
      const duration = 500;
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 缓动函数 - easeOutCubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        window.scrollTo(0, currentScroll * (1 - easeProgress));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    },

    // 视差效果
    setupParallaxEffects() {
      const parallaxElements = document.querySelectorAll('[data-parallax]');
      
      if (parallaxElements.length === 0) return;
      
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            parallaxElements.forEach(el => {
              const speed = parseFloat(el.dataset.parallax) || 0.5;
              const rect = el.getBoundingClientRect();
              const scrollY = window.scrollY;
              const offsetTop = rect.top + scrollY;
              const distance = scrollY - offsetTop;
              
              el.style.transform = `translateY(${distance * speed}px)`;
            });
            ticking = false;
          });
          ticking = true;
        }
      });
    }
  };

  // 数字计数器类
  class Counter {
    constructor(element, options = {}) {
      this.element = element;
      this.target = parseFloat(element.dataset.count || element.textContent);
      this.duration = options.duration || 2000;
      this.isDecimal = this.target % 1 !== 0;
      this.prefix = options.prefix || '';
      this.suffix = options.suffix || '';
      this.onComplete = options.onComplete || null;
    }

    start() {
      const startTime = performance.now();
      const increment = this.target / (this.duration / 16);
      let current = 0;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        // 缓动函数
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        current = this.target * easeProgress;
        
        let displayValue;
        if (this.isDecimal) {
          displayValue = current.toFixed(1);
        } else {
          displayValue = Math.floor(current).toLocaleString();
        }
        
        this.element.textContent = this.prefix + displayValue + this.suffix;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (this.onComplete) {
            this.onComplete();
          }
        }
      };

      requestAnimationFrame(animate);
    }
  }

  // 导出到全局
  window.ScrollReveal = ScrollReveal;
  window.Counter = Counter;

  // 自动初始化
  document.addEventListener('DOMContentLoaded', () => {
    ScrollReveal.init();
  });

  // 页面可见性变化时重新触发动画
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // 重新观察未触发的元素
      const elements = document.querySelectorAll(
        '.scroll-reveal:not(.revealed), .scroll-slide-left:not(.revealed), .scroll-slide-right:not(.revealed), .scroll-zoom:not(.revealed)'
      );
      elements.forEach(el => ScrollReveal.setupScrollReveal());
    }
  });

})();
