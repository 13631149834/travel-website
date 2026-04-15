/**
 * 骨架屏管理系统 - 游导旅游平台
 * 功能：骨架屏渲染、动画控制、渐隐效果
 */

(function(global) {
  'use strict';

  const SkeletonScreen = {
    // 骨架屏配置
    config: {
      animationDuration: 600,
      fadeOutDuration: 400,
      selector: '[data-skeleton]',
      autoInit: true,
      minDisplayTime: 300,  // 最小显示时间，避免闪烁
      showDelay: import.meta?.url ? 100 : 50
    },

    // 骨架屏样式
    styles: `
      .skeleton-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #fff;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        transition: opacity 0.4s ease-out;
      }
      
      .skeleton-container.hidden {
        opacity: 0;
        pointer-events: none;
      }
      
      .skeleton-nav {
        height: 60px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s ease-in-out infinite;
      }
      
      .skeleton-hero {
        height: 300px;
        margin: 20px;
        border-radius: 12px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s ease-in-out infinite;
      }
      
      .skeleton-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        padding: 20px;
      }
      
      .skeleton-card {
        height: 200px;
        border-radius: 12px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s ease-in-out infinite;
      }
      
      .skeleton-card:nth-child(2) { animation-delay: 0.1s; }
      .skeleton-card:nth-child(3) { animation-delay: 0.2s; }
      .skeleton-card:nth-child(4) { animation-delay: 0.3s; }
      
      .skeleton-list {
        padding: 20px;
      }
      
      .skeleton-list-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 0;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .skeleton-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s ease-in-out infinite;
        flex-shrink: 0;
      }
      
      .skeleton-content {
        flex: 1;
      }
      
      .skeleton-line {
        height: 16px;
        border-radius: 4px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s ease-in-out infinite;
        margin-bottom: 8px;
      }
      
      .skeleton-line.short {
        width: 60%;
      }
      
      .skeleton-line.medium {
        width: 80%;
      }
      
      .skeleton-line.full {
        width: 100%;
      }
      
      .skeleton-search {
        height: 48px;
        margin: 16px 20px;
        border-radius: 24px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s ease-in-out infinite;
      }
      
      .skeleton-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        padding: 20px;
      }
      
      .skeleton-grid-item {
        aspect-ratio: 1;
        border-radius: 8px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s ease-in-out infinite;
      }
      
      @keyframes skeleton-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* 深色模式支持 */
      @media (prefers-color-scheme: dark) {
        .skeleton-container {
          background: #1a1a1a;
        }
        .skeleton-nav,
        .skeleton-hero,
        .skeleton-card,
        .skeleton-avatar,
        .skeleton-line,
        .skeleton-search,
        .skeleton-grid-item {
          background: linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%);
          background-size: 200% 100%;
        }
        .skeleton-list-item {
          border-bottom-color: #333;
        }
      }
    `,

    // 骨架屏模板
    templates: {
      // 首页骨架屏
      home: `
        <div class="skeleton-nav"></div>
        <div class="skeleton-search"></div>
        <div class="skeleton-hero"></div>
        <div class="skeleton-cards">
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
        </div>
        <div class="skeleton-list">
          <div class="skeleton-list-item">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-content">
              <div class="skeleton-line medium"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
          <div class="skeleton-list-item">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-content">
              <div class="skeleton-line medium"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
          <div class="skeleton-list-item">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-content">
              <div class="skeleton-line medium"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
        </div>
      `,
      
      // 列表页骨架屏
      list: `
        <div class="skeleton-nav"></div>
        <div class="skeleton-search"></div>
        <div class="skeleton-list">
          <div class="skeleton-list-item">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-content">
              <div class="skeleton-line medium"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
          <div class="skeleton-list-item">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-content">
              <div class="skeleton-line medium"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
          <div class="skeleton-list-item">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-content">
              <div class="skeleton-line medium"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
          <div class="skeleton-list-item">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-content">
              <div class="skeleton-line medium"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
        </div>
      `,
      
      // 网格页骨架屏
      grid: `
        <div class="skeleton-nav"></div>
        <div class="skeleton-search"></div>
        <div class="skeleton-grid">
          <div class="skeleton-grid-item"></div>
          <div class="skeleton-grid-item"></div>
          <div class="skeleton-grid-item"></div>
          <div class="skeleton-grid-item"></div>
          <div class="skeleton-grid-item"></div>
          <div class="skeleton-grid-item"></div>
          <div class="skeleton-grid-item"></div>
          <div class="skeleton-grid-item"></div>
        </div>
      `,
      
      // 详情页骨架屏
      detail: `
        <div class="skeleton-nav"></div>
        <div class="skeleton-hero"></div>
        <div class="skeleton-list" style="padding: 20px 40px;">
          <div class="skeleton-line full" style="height: 24px; margin-bottom: 16px;"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line full"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line full"></div>
          <div class="skeleton-line short" style="margin-top: 16px;"></div>
        </div>
      `
    },

    container: null,
    startTime: null,
    isShown: false,

    // 初始化
    init(options = {}) {
      Object.assign(this.config, options);
      
      // 注入样式
      this.injectStyles();
      
      // 创建骨架屏容器
      this.createContainer();
      
      // 自动显示
      if (this.config.autoInit) {
        this.show();
      }

      // 监听内容加载
      this.observeContentLoad();

      return this;
    },

    // 注入样式
    injectStyles() {
      if (document.getElementById('skeleton-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'skeleton-styles';
      style.textContent = this.styles;
      document.head.appendChild(style);
    },

    // 创建容器
    createContainer() {
      this.container = document.createElement('div');
      this.container.id = 'skeleton-screen';
      this.container.className = 'skeleton-container';
      document.body.appendChild(this.container);
    },

    // 显示骨架屏
    show(type = 'home') {
      if (this.isShown) return;
      
      this.startTime = Date.now();
      this.isShown = true;
      
      const template = this.templates[type] || this.templates.home;
      this.container.innerHTML = template;
      this.container.classList.remove('hidden');

      // 触发显示事件
      window.dispatchEvent(new CustomEvent('skeleton:show', { detail: { type } }));
    },

    // 隐藏骨架屏
    hide() {
      if (!this.isShown) return;

      // 确保最小显示时间
      const elapsed = Date.now() - this.startTime;
      const delay = Math.max(0, this.config.minDisplayTime - elapsed);

      setTimeout(() => {
        this.container.classList.add('hidden');
        
        // 动画结束后移除
        setTimeout(() => {
          this.container.remove();
          this.isShown = false;
          
          // 触发隐藏事件
          window.dispatchEvent(new CustomEvent('skeleton:hide', { 
            detail: { duration: Date.now() - this.startTime } 
          }));
        }, this.config.fadeOutDuration);
      }, delay);
    },

    // 监听内容加载
    observeContentLoad() {
      // 监听DOMContentLoaded
      document.addEventListener('DOMContentLoaded', () => {
        // 延迟检查，确保关键内容已渲染
        setTimeout(() => this.hide(), 100);
      });

      // 监听load事件作为后备
      window.addEventListener('load', () => {
        setTimeout(() => this.hide(), 50);
      });

      // 监听图片加载
      if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.complete) {
              imgObserver.unobserve(entry.target);
            }
          });
        });

        document.querySelectorAll('img').forEach(img => {
          if (img.complete) {
            imgObserver.observe(img);
          }
        });
      }
    },

    // 更新骨架屏类型
    updateType(type) {
      if (!this.isShown) return;
      
      const template = this.templates[type] || this.templates.home;
      this.container.innerHTML = template;
    }
  };

  // 导出
  global.SkeletonScreen = SkeletonScreen;

  // 自动初始化（可选）
  // SkeletonScreen.init();

})(typeof window !== 'undefined' ? window : this);
