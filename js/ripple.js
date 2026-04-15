/**
 * ===================================
 * Material Design 波纹效果脚本
 * 功能：为按钮和可点击元素添加点击波纹效果
 * ===================================
 */

(function() {
  'use strict';

  // 波纹效果控制器
  const RippleEffect = {
    // 配置
    config: {
      duration: 600,           // 波纹动画持续时间(ms)
      color: 'rgba(255, 255, 255, 0.5)',  // 波纹颜色
      scaleRatio: 4,            // 波纹扩散比例
      centerClick: true        // 是否从点击位置开始
    },

    // 初始化
    init(options = {}) {
      // 合并配置
      Object.assign(this.config, options);
      
      // 为所有按钮添加波纹效果
      this.setupRippleButtons();
      
      // 监听动态添加的元素
      this.setupMutationObserver();
    },

    // 为按钮添加波纹效果
    setupRippleButtons() {
      const buttons = document.querySelectorAll('.btn, .btn-ripple, button, [data-ripple]');
      
      buttons.forEach(btn => {
        // 避免重复绑定
        if (btn.dataset.rippleBound) return;
        btn.dataset.rippleBound = 'true';
        
        btn.addEventListener('click', (e) => this.createRipple(e, btn));
      });
    },

    // 创建波纹元素
    createRipple(event, element) {
      // 获取点击位置
      const rect = element.getBoundingClientRect();
      let x, y;
      
      if (this.config.centerClick) {
        // 从元素中心开始
        x = rect.width / 2;
        y = rect.height / 2;
      } else {
        // 从实际点击位置开始
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
      }
      
      // 确保元素有相对定位
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.position === 'static') {
        element.style.position = 'relative';
      }
      element.style.overflow = 'hidden';
      
      // 创建波纹元素
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      
      // 计算波纹大小
      const size = Math.max(rect.width, rect.height) * this.config.scaleRatio;
      
      // 设置波纹样式
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        background: ${this.config.color};
        border-radius: 50%;
        transform: scale(0);
        animation: rippleEffect ${this.config.duration}ms linear;
        pointer-events: none;
      `;
      
      // 添加到元素
      element.appendChild(ripple);
      
      // 动画结束后移除
      setTimeout(() => {
        ripple.remove();
      }, this.config.duration);
    },

    // 创建彩色波纹（基于按钮颜色）
    createColoredRipple(event, element, color = 'rgba(255, 255, 255, 0.5)') {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.position === 'static') {
        element.style.position = 'relative';
      }
      element.style.overflow = 'hidden';
      
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      
      const size = Math.max(rect.width, rect.height) * this.config.scaleRatio;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        background: ${color};
        border-radius: 50%;
        transform: scale(0);
        animation: rippleEffect ${this.config.duration}ms linear;
        pointer-events: none;
      `;
      
      element.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, this.config.duration);
    },

    // 监听动态添加的元素
    setupMutationObserver() {
      if (typeof MutationObserver === 'undefined') return;
      
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // 检查新添加的元素
              if (node.matches('.btn, .btn-ripple, button, [data-ripple]')) {
                node.addEventListener('click', (e) => this.createRipple(e, node));
                node.dataset.rippleBound = 'true';
              }
              
              // 检查子元素
              const buttons = node.querySelectorAll?.('.btn, .btn-ripple, button, [data-ripple]');
              buttons?.forEach(btn => {
                if (!btn.dataset.rippleBound) {
                  btn.addEventListener('click', (e) => this.createRipple(e, btn));
                  btn.dataset.rippleBound = 'true';
                }
              });
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  };

  // 导出到全局
  window.RippleEffect = RippleEffect;

  // 自动初始化
  document.addEventListener('DOMContentLoaded', () => {
    RippleEffect.init();
  });

})();
