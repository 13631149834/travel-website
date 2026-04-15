/**
 * 游导旅游 - 功能发现与提示系统
 * 新功能标记、红点提示、功能说明卡片、智能提示
 */

(function() {
  'use strict';

  // 功能发现配置
  const DISCOVERIES = {
    // 首页功能发现
    home: [
      {
        id: 'new_search_filter',
        icon: '✨',
        title: '智能筛选升级',
        description: '新增目的地筛选，更快找到心仪导游',
        type: 'new',
        target: '.filter-section, .search-filters',
        position: 'bottom',
        trigger: 'auto' // auto-自动显示, click-点击触发, manual-手动触发
      },
      {
        id: 'ai_recommend',
        icon: '🤖',
        title: 'AI智能推荐',
        description: '基于您的偏好，AI为您推荐最适合的导游',
        type: 'tip',
        target: '.ai-recommend, .smart-recommend',
        position: 'right'
      }
    ],
    
    // 导游列表页
    guides: [
      {
        id: 'map_view',
        icon: '🗺️',
        title: '地图模式',
        description: '切换到地图视图，查看导游地理位置',
        type: 'new',
        target: '.view-toggle, .map-view-btn',
        position: 'bottom'
      },
      {
        id: 'compare_guides',
        icon: '⚖️',
        title: '导游对比',
        description: '选择多位导游进行对比，选择更轻松',
        type: 'tip',
        target: '.compare-btn, .compare-checkbox',
        position: 'left'
      }
    ],
    
    // 个人中心
    profile: [
      {
        id: 'vip_benefits',
        icon: '👑',
        title: 'VIP特权',
        description: '开通VIP享受更多专属权益',
        type: 'promotion',
        target: '.vip-section, .vip-banner',
        position: 'top'
      },
      {
        id: 'points_mall',
        icon: '🎁',
        title: '积分商城',
        description: '积分可兑换优惠券和精选礼品',
        type: 'tip',
        target: '.points-mall, .rewards-link',
        position: 'bottom'
      }
    ]
  };

  // 常见操作提示配置
  const HELPFUL_TIPS = {
    'search-input': {
      icon: '💡',
      title: '搜索技巧',
      tips: [
        '输入目的地名称快速查找当地导游',
        '尝试输入导游特长，如"摄影"、"美食"',
        '使用日期筛选找到有空档的导游'
      ]
    },
    'guide-card': {
      icon: '👆',
      title: '导游卡片',
      tips: [
        '点击卡片查看导游详细信息',
        '点击心形图标收藏导游',
        '查看评分和评价了解服务质量'
      ]
    },
    'booking-btn': {
      icon: '📅',
      title: '预约流程',
      tips: [
        '选择您需要的日期和时间',
        '确认服务人数和特殊需求',
        '完成支付后等待导游确认'
      ]
    },
    'favorite-btn': {
      icon: '❤️',
      title: '收藏功能',
      tips: [
        '收藏后可在个人中心快速访问',
        '收藏导游可获得积分奖励',
        '取消收藏请再次点击心形图标'
      ]
    }
  };

  class FeatureDiscovery {
    constructor() {
      this.activeDiscovery = null;
      this.tips = {};
      this.init();
    }

    init() {
      this.detectPageType();
      this.initHelpfulTips();
      this.bindEvents();
    }

    // 检测页面类型
    detectPageType() {
      const path = window.location.pathname;
      let pageType = 'home';

      if (path.includes('guides') || path.includes('guide-list')) {
        pageType = 'guides';
      } else if (path.includes('profile') || path.includes('user')) {
        pageType = 'profile';
      }

      // 自动显示该页面的功能发现
      setTimeout(() => {
        this.autoShowDiscoveries(pageType);
      }, 2000);
    }

    // 自动显示功能发现
    autoShowDiscoveries(pageType) {
      const discoveries = DISCOVERIES[pageType] || [];
      
      discoveries.forEach((discovery, index) => {
        if (discovery.trigger === 'auto') {
          setTimeout(() => {
            this.showDiscovery(discovery);
          }, index * 3000);
        }
      });
    }

    // 显示功能发现气泡
    showDiscovery(config) {
      // 检查是否已忽略
      const dismissed = localStorage.getItem(`discovery_dismissed_${config.id}`);
      if (dismissed) return;

      const target = config.target ? document.querySelector(config.target) : null;
      
      const bubble = document.createElement('div');
      bubble.className = `discovery-bubble discovery-${config.type}`;
      bubble.dataset.id = config.id;
      
      // 类型样式
      let typeIcon = '';
      if (config.type === 'new') {
        typeIcon = '<span class="discovery-new-tag">新功能</span>';
      } else if (config.type === 'tip') {
        typeIcon = '<span class="discovery-tip-tag">小技巧</span>';
      }

      bubble.innerHTML = `
        ${typeIcon}
        <div class="discovery-content">
          <span class="discovery-icon">${config.icon}</span>
          <div class="discovery-text">
            <h4>${config.title}</h4>
            <p>${config.description}</p>
          </div>
        </div>
        <button class="discovery-close" aria-label="关闭">×</button>
      `;

      // 定位
      if (target) {
        const rect = target.getBoundingClientRect();
        bubble.classList.add(`position-${config.position}`);
        
        switch (config.position) {
          case 'bottom':
            bubble.style.top = `${rect.bottom + 10}px`;
            bubble.style.left = `${rect.left + rect.width / 2}px`;
            bubble.style.transform = 'translateX(-50%)';
            break;
          case 'top':
            bubble.style.top = `${rect.top - 10}px`;
            bubble.style.left = `${rect.left + rect.width / 2}px`;
            bubble.style.transform = 'translateX(-50%) translateY(-100%)';
            break;
          case 'left':
            bubble.style.top = `${rect.top + rect.height / 2}px`;
            bubble.style.left = `${rect.left - 10}px`;
            bubble.style.transform = 'translateY(-50%) translateX(-100%)';
            break;
          case 'right':
            bubble.style.top = `${rect.top + rect.height / 2}px`;
            bubble.style.left = `${rect.right + 10}px`;
            bubble.style.transform = 'translateY(-50%)';
            break;
        }

        // 滚动到目标
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        bubble.classList.add('position-center');
      }

      document.body.appendChild(bubble);
      
      // 添加动画类
      setTimeout(() => bubble.classList.add('active'), 50);

      // 绑定事件
      bubble.querySelector('.discovery-close').addEventListener('click', () => {
        this.dismissDiscovery(config.id);
      });

      // 点击目标元素时关闭
      if (target) {
        target.addEventListener('click', () => {
          this.dismissDiscovery(config.id);
        }, { once: true });
      }

      // 3秒后自动淡出
      setTimeout(() => {
        if (bubble.parentNode) {
          bubble.classList.remove('active');
          setTimeout(() => bubble.remove(), 300);
        }
      }, 6000);
    }

    // 关闭功能发现
    dismissDiscovery(id) {
      const bubble = document.querySelector(`.discovery-bubble[data-id="${id}"]`);
      if (bubble) {
        bubble.classList.remove('active');
        setTimeout(() => bubble.remove(), 300);
      }
      localStorage.setItem(`discovery_dismissed_${id}`, 'true');
    }

    // 初始化帮助提示
    initHelpfulTips() {
      // 为特定元素添加悬停提示
      Object.keys(HELPFUL_TIPS).forEach(selector => {
        const elements = document.querySelectorAll(`[data-tip="${selector}"], .${selector}`);
        elements.forEach(el => {
          el.classList.add('has-helpful-tip');
          el.dataset.helpTip = selector;
        });
      });

      // 悬停显示提示
      document.addEventListener('mouseenter', (e) => {
        if (e.target.classList.contains('has-helpful-tip')) {
          const tipKey = e.target.dataset.helpTip;
          this.showHelpfulTip(tipKey, e.target);
        }
      }, true);
    }

    // 显示帮助提示
    showHelpfulTip(tipKey, target) {
      const tipConfig = HELPFUL_TIPS[tipKey];
      if (!tipConfig) return;

      // 检查是否已显示过
      const shownKey = `tip_shown_${tipKey}`;
      if (localStorage.getItem(shownKey)) return;

      const tip = document.createElement('div');
      tip.className = 'helpful-tip';
      tip.innerHTML = `
        <div class="helpful-tip-header">
          <span class="helpful-tip-icon">${tipConfig.icon}</span>
          <span class="helpful-tip-title">${tipConfig.title}</span>
          <button class="helpful-tip-close" aria-label="关闭">×</button>
        </div>
        <ul class="helpful-tip-list">
          ${tipConfig.tips.map(t => `<li>${t}</li>`).join('')}
        </ul>
      `;

      // 定位到目标元素
      const rect = target.getBoundingClientRect();
      tip.style.top = `${rect.bottom + 10}px`;
      tip.style.left = `${rect.left}px`;

      document.body.appendChild(tip);
      setTimeout(() => tip.classList.add('active'), 50);

      // 标记已显示
      localStorage.setItem(shownKey, 'true');

      // 关闭事件
      tip.querySelector('.helpful-tip-close').addEventListener('click', () => {
        tip.classList.remove('active');
        setTimeout(() => tip.remove(), 300);
      });

      // 目标点击时关闭
      target.addEventListener('click', () => {
        tip.classList.remove('active');
        setTimeout(() => tip.remove(), 300);
      }, { once: true });
    }

    // 显示红点提示
    showRedDot(target, message = '') {
      const dot = document.createElement('div');
      dot.className = 'feature-red-dot';
      if (message) {
        dot.innerHTML = `<span class="red-dot-message">${message}</span>`;
      }
      
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) {
        el.classList.add('has-red-dot');
        el.appendChild(dot);
      }
      
      return dot;
    }

    // 移除红点
    removeRedDot(target) {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) {
        const dot = el.querySelector('.feature-red-dot');
        if (dot) dot.remove();
        el.classList.remove('has-red-dot');
      }
    }

    // 显示新功能标记
    showNewBadge(target, text = 'NEW') {
      const badge = document.createElement('span');
      badge.className = 'new-feature-badge';
      badge.textContent = text;
      
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) {
        el.classList.add('has-new-badge');
        el.appendChild(badge);
      }
      
      return badge;
    }

    // 移除新功能标记
    removeNewBadge(target) {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) {
        const badge = el.querySelector('.new-feature-badge');
        if (badge) badge.remove();
        el.classList.remove('has-new-badge');
      }
    }

    // 绑定事件
    bindEvents() {
      // 点击页面任意位置关闭当前提示
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.discovery-bubble') && 
            !e.target.closest('.helpful-tip')) {
          // 可选：关闭所有打开的提示
        }
      });

      // ESC键关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const bubbles = document.querySelectorAll('.discovery-bubble.active');
          bubbles.forEach(b => {
            b.classList.remove('active');
            setTimeout(() => b.remove(), 300);
          });
        }
      });
    }

    // 手动显示指定功能发现
    show(configId, pageType = 'home') {
      const discoveries = DISCOVERIES[pageType] || [];
      const config = discoveries.find(d => d.id === configId);
      if (config) {
        this.showDiscovery(config);
      }
    }

    // 手动显示帮助提示
    showTip(tipKey) {
      const elements = document.querySelectorAll(`[data-tip="${tipKey}"], .${tipKey}`);
      if (elements.length > 0) {
        this.showHelpfulTip(tipKey, elements[0]);
      }
    }

    // 重置所有提示状态
    reset() {
      Object.keys(HELPFUL_TIPS).forEach(key => {
        localStorage.removeItem(`tip_shown_${key}`);
      });
    }
  }

  // 导出到全局
  window.FeatureDiscovery = FeatureDiscovery;

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', function() {
    window.featureDiscovery = new FeatureDiscovery();
  });

})();
