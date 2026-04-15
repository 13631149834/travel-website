/**
 * 游导旅游 - 分步功能引导组件
 * 支持功能介绍气泡、跳过/完成控制、高亮目标元素
 */

(function() {
  'use strict';

  // 引导步骤配置
  const GUIDE_TOURS = {
    // 首页引导
    home: [
      {
        id: 'home-search',
        icon: '🔍',
        title: '搜索导游/目的地',
        content: '在搜索框中输入您想去的目的地或导游名字，快速找到心仪的选择。',
        position: 'bottom',
        target: '.search-box, .hero-search, #searchInput',
        spotlight: true
      },
      {
        id: 'home-guides',
        icon: '🧭',
        title: '浏览导游列表',
        content: '查看平台所有认证导游，了解他们的专业领域、评分和用户评价。',
        position: 'bottom',
        target: 'a[href="guides.html"], .nav-guides'
      },
      {
        id: 'home-routes',
        icon: '🗺️',
        title: '探索精品路线',
        content: '浏览精心策划的旅行路线，包含经典景点、特色体验和小众秘境。',
        position: 'bottom',
        target: 'a[href="routes.html"], .nav-routes'
      },
      {
        id: 'home-tools',
        icon: '🛠️',
        title: '实用旅行工具',
        content: '使用汇率换算、天气查询、签证指南等实用工具，为出行做好准备。',
        position: 'bottom',
        target: 'a[href="tools.html"], .nav-tools'
      },
      {
        id: 'home-profile',
        icon: '👤',
        title: '个人中心',
        content: '管理您的个人信息、订单历史、收藏夹和积分奖励。',
        position: 'bottom-left',
        target: '.user-avatar, .nav-profile, a[href*="profile"]'
      }
    ],
    
    // 导游详情页引导
    guideDetail: [
      {
        id: 'guide-avatar',
        icon: '👨‍🏫',
        title: '导游头像',
        content: '查看导游的真实照片和认证信息，了解导游的专业背景。',
        position: 'right',
        target: '.guide-avatar, .guide-photo'
      },
      {
        id: 'guide-intro',
        icon: '📝',
        title: '导游简介',
        content: '了解导游的专长领域、服务特色和从业经验。',
        position: 'bottom',
        target: '.guide-intro, .guide-about'
      },
      {
        id: 'guide-services',
        icon: '🎁',
        title: '服务项目',
        content: '查看导游提供的服务类型、价格标准和包含内容。',
        position: 'bottom',
        target: '.guide-services, .services-list'
      },
      {
        id: 'guide-reviews',
        icon: '⭐',
        title: '用户评价',
        content: '阅读其他游客的真实评价，了解导游的实际服务水平。',
        position: 'top',
        target: '.guide-reviews, .reviews-section'
      },
      {
        id: 'guide-book',
        icon: '📅',
        title: '立即预约',
        content: '选择日期和时间，一键预约心仪的导游服务。',
        position: 'top',
        target: '.book-btn, .book-now-btn, #bookBtn'
      }
    ],
    
    // 预订流程引导
    booking: [
      {
        id: 'booking-date',
        icon: '📅',
        title: '选择日期',
        content: '在日历中选择您希望的导游服务日期。',
        position: 'bottom',
        target: '.date-picker, .calendar-input'
      },
      {
        id: 'booking-time',
        icon: '⏰',
        title: '选择时间',
        content: '确定您希望的接单时间和服务时长。',
        position: 'bottom',
        target: '.time-slot, .time-picker'
      },
      {
        id: 'booking-passengers',
        icon: '👥',
        title: '填写人数',
        content: '输入同行人数，便于导游做好接待准备。',
        position: 'right',
        target: '.passenger-count, .guests-input'
      },
      {
        id: 'booking-contact',
        icon: '📱',
        title: '联系方式',
        content: '填写您的联系方式，导游将与您确认行程细节。',
        position: 'right',
        target: '.contact-info, .phone-input'
      },
      {
        id: 'booking-confirm',
        icon: '✅',
        title: '确认订单',
        content: '核对订单信息无误后提交，完成预订。',
        position: 'top',
        target: '.submit-btn, .confirm-booking'
      }
    ],
    
    // 个人中心引导
    profile: [
      {
        id: 'profile-info',
        icon: '👤',
        title: '基本信息',
        content: '完善您的个人资料，包括头像、昵称和简介。',
        position: 'right',
        target: '.profile-info, .user-info-section'
      },
      {
        id: 'profile-orders',
        icon: '📋',
        title: '我的订单',
        content: '查看和管理您的所有订单，包括待支付、进行中和已完成。',
        position: 'bottom',
        target: '.orders-tab, a[href*="orders"]'
      },
      {
        id: 'profile-favorites',
        icon: '❤️',
        title: '我的收藏',
        content: '收藏您喜欢的导游和路线，方便下次快速找到。',
        position: 'bottom',
        target: '.favorites-tab, a[href*="favorites"]'
      },
      {
        id: 'profile-rewards',
        icon: '🎁',
        title: '积分奖励',
        content: '完成任务获取积分，积分可兑换优惠券和礼品。',
        position: 'bottom',
        target: '.rewards-tab, .points-section'
      }
    ]
  };

  class GuideTour {
    constructor(options = {}) {
      this.tourType = options.tourType || 'home';
      this.steps = GUIDE_TOURS[this.tourType] || GUIDE_TOURS.home;
      this.currentStep = 0;
      this.isActive = false;
      this.elements = {};
      this.onComplete = options.onComplete || null;
      this.onSkip = options.onSkip || null;
      
      this.init();
    }

    init() {
      this.createElements();
      this.bindEvents();
    }

    createElements() {
      // 遮罩层
      const overlay = document.createElement('div');
      overlay.className = 'guide-overlay';
      overlay.id = 'guideOverlay';
      document.body.appendChild(overlay);
      this.elements.overlay = overlay;

      // 高亮框
      const spotlight = document.createElement('div');
      spotlight.className = 'guide-spotlight';
      spotlight.id = 'guideSpotlight';
      document.body.appendChild(spotlight);
      this.elements.spotlight = spotlight;

      // 引导卡片
      const card = document.createElement('div');
      card.className = 'guide-card';
      card.id = 'guideCard';
      document.body.appendChild(card);
      this.elements.card = card;

      // 箭头
      const arrow = document.createElement('div');
      arrow.className = 'guide-arrow';
      arrow.id = 'guideArrow';
      document.body.appendChild(arrow);
      this.elements.arrow = arrow;

      // 跳过按钮（固定在右上角）
      const skipBtn = document.createElement('button');
      skipBtn.className = 'guide-skip-btn';
      skipBtn.id = 'guideSkipBtn';
      skipBtn.innerHTML = '跳过引导 ×';
      document.body.appendChild(skipBtn);
      this.elements.skipBtn = skipBtn;
    }

    bindEvents() {
      // 点击遮罩关闭当前步骤（可选）
      this.elements.overlay.addEventListener('click', () => this.nextStep());
      
      // 键盘导航
      document.addEventListener('keydown', (e) => {
        if (!this.isActive) return;
        
        switch(e.key) {
          case 'Escape':
            this.skip();
            break;
          case 'ArrowRight':
          case 'Enter':
            this.nextStep();
            break;
          case 'ArrowLeft':
            this.prevStep();
            break;
        }
      });
    }

    start(stepIndex = 0) {
      if (this.isActive) return;
      
      this.isActive = true;
      this.currentStep = stepIndex;
      this.elements.overlay.classList.add('active');
      this.elements.skipBtn.classList.add('active');
      
      this.showStep(this.currentStep);
      this.saveProgress();
    }

    showStep(index) {
      const step = this.steps[index];
      if (!step) {
        this.complete();
        return;
      }

      // 更新卡片内容
      const card = this.elements.card;
      card.innerHTML = this.renderStepContent(step);
      
      // 定位高亮和卡片
      this.positionElements(step);
      
      // 显示动画
      setTimeout(() => {
        card.classList.add('active');
        if (step.spotlight) {
          this.elements.spotlight.classList.add('active');
        }
      }, 50);

      // 绑定卡片内按钮事件
      this.bindCardEvents(step);
    }

    renderStepContent(step) {
      const progress = this.getProgressHTML();
      const stepNum = this.currentStep + 1;
      const total = this.steps.length;
      
      return `
        <div class="guide-card-header">
          <div class="guide-icon">${step.icon}</div>
          <div class="guide-info">
            <h3 class="guide-title">${step.title}</h3>
            <span class="guide-step">${stepNum}/${total}</span>
          </div>
        </div>
        <div class="guide-card-body">
          <p class="guide-text">${step.content}</p>
        </div>
        <div class="guide-card-footer">
          ${progress}
          <div class="guide-actions">
            ${this.currentStep > 0 ? '<button class="guide-btn guide-btn-prev" id="guidePrev">上一步</button>' : ''}
            ${this.currentStep < this.steps.length - 1 
              ? '<button class="guide-btn guide-btn-next" id="guideNext">下一步</button>'
              : '<button class="guide-btn guide-btn-done" id="guideDone">完成</button>'
            }
          </div>
        </div>
      `;
    }

    getProgressHTML() {
      let dots = '';
      for (let i = 0; i < this.steps.length; i++) {
        let className = 'guide-dot';
        if (i === this.currentStep) className += ' active';
        else if (i < this.currentStep) className += ' completed';
        dots += `<span class="${className}"></span>`;
      }
      return `<div class="guide-progress">${dots}</div>`;
    }

    positionElements(step) {
      const card = this.elements.card;
      const spotlight = this.elements.spotlight;
      const arrow = this.elements.arrow;
      
      // 重置样式
      card.className = 'guide-card active';
      spotlight.className = 'guide-spotlight';
      arrow.className = 'guide-arrow';
      arrow.style.display = 'none';

      // 查找目标元素
      let targetRect = null;
      if (step.target) {
        const target = document.querySelector(step.target);
        if (target) {
          targetRect = target.getBoundingClientRect();
          
          // 如果需要高亮
          if (step.spotlight) {
            spotlight.style.cssText = `
              top: ${targetRect.top - 8}px;
              left: ${targetRect.left - 8}px;
              width: ${targetRect.width + 16}px;
              height: ${targetRect.height + 16}px;
            `;
          }
          
          // 滚动到目标元素
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      // 定位卡片
      const cardWidth = 340;
      const cardHeight = 260;
      const padding = 20;
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let cardTop, cardLeft;

      switch (step.position) {
        case 'bottom':
          cardTop = targetRect ? targetRect.bottom + padding + (step.spotlight ? 16 : 0) : viewport.height / 2;
          cardLeft = targetRect ? targetRect.left + targetRect.width / 2 - cardWidth / 2 : viewport.width / 2 - cardWidth / 2;
          if (cardTop + cardHeight > viewport.height - 20) {
            cardTop = targetRect ? targetRect.top - cardHeight - padding - (step.spotlight ? 16 : 0) : viewport.height / 2 - cardHeight / 2;
            step.arrowPosition = 'bottom';
          } else {
            step.arrowPosition = 'top';
          }
          break;
          
        case 'top':
          cardTop = targetRect ? targetRect.top - cardHeight - padding - (step.spotlight ? 16 : 0) : viewport.height / 2 - cardHeight / 2;
          cardLeft = targetRect ? targetRect.left + targetRect.width / 2 - cardWidth / 2 : viewport.width / 2 - cardWidth / 2;
          step.arrowPosition = 'bottom';
          break;
          
        case 'left':
          cardTop = targetRect ? targetRect.top + targetRect.height / 2 - cardHeight / 2 : viewport.height / 2 - cardHeight / 2;
          cardLeft = targetRect ? targetRect.left - cardWidth - padding - (step.spotlight ? 16 : 0) : viewport.width / 2 - cardWidth - padding;
          step.arrowPosition = 'right';
          break;
          
        case 'right':
          cardTop = targetRect ? targetRect.top + targetRect.height / 2 - cardHeight / 2 : viewport.height / 2 - cardHeight / 2;
          cardLeft = targetRect ? targetRect.right + padding + (step.spotlight ? 16 : 0) : viewport.width / 2 + padding;
          step.arrowPosition = 'left';
          break;
          
        case 'bottom-left':
          cardTop = viewport.height - cardHeight - 20;
          cardLeft = 20;
          step.arrowPosition = 'top-left';
          break;
          
        case 'center':
        default:
          cardTop = viewport.height / 2 - cardHeight / 2;
          cardLeft = viewport.width / 2 - cardWidth / 2;
          break;
      }

      // 边界检查
      cardLeft = Math.max(10, Math.min(cardLeft, viewport.width - cardWidth - 10));
      cardTop = Math.max(10, Math.min(cardTop, viewport.height - cardHeight - 10));

      card.style.top = `${cardTop}px`;
      card.style.left = `${cardLeft}px`;

      // 显示箭头
      if (step.arrowPosition && targetRect) {
        arrow.style.display = 'block';
        arrow.className = `guide-arrow ${step.arrowPosition}`;
        
        let arrowTop, arrowLeft;
        switch (step.arrowPosition) {
          case 'top':
            arrowTop = cardTop + cardHeight;
            arrowLeft = cardLeft + cardWidth / 2 - 10;
            break;
          case 'bottom':
            arrowTop = cardTop - 20;
            arrowLeft = cardLeft + cardWidth / 2 - 10;
            break;
          case 'left':
            arrowTop = cardTop + cardHeight / 2 - 10;
            arrowLeft = cardLeft + cardWidth;
            break;
          case 'right':
            arrowTop = cardTop + cardHeight / 2 - 10;
            arrowLeft = cardLeft - 20;
            break;
          case 'top-left':
            arrowTop = cardTop + cardHeight;
            arrowLeft = targetRect ? targetRect.left + targetRect.width / 2 - 10 : cardLeft + 50;
            break;
        }
        arrow.style.top = `${arrowTop}px`;
        arrow.style.left = `${arrowLeft}px`;
      }
    }

    bindCardEvents(step) {
      const nextBtn = document.getElementById('guideNext');
      const prevBtn = document.getElementById('guidePrev');
      const doneBtn = document.getElementById('guideDone');

      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.nextStep());
      }
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.prevStep());
      }
      
      if (doneBtn) {
        doneBtn.addEventListener('click', () => this.complete());
      }
    }

    nextStep() {
      this.elements.card.classList.remove('active');
      this.elements.spotlight.classList.remove('active');
      
      setTimeout(() => {
        this.currentStep++;
        if (this.currentStep >= this.steps.length) {
          this.complete();
        } else {
          this.showStep(this.currentStep);
          this.saveProgress();
        }
      }, 200);
    }

    prevStep() {
      if (this.currentStep <= 0) return;
      
      this.elements.card.classList.remove('active');
      this.elements.spotlight.classList.remove('active');
      
      setTimeout(() => {
        this.currentStep--;
        this.showStep(this.currentStep);
        this.saveProgress();
      }, 200);
    }

    skip() {
      this.hideAll();
      this.isActive = false;
      
      if (this.onSkip) {
        this.onSkip(this.currentStep, this.steps.length);
      }
      
      localStorage.setItem(`guide_${this.tourType}_skipped`, 'true');
    }

    complete() {
      this.hideAll();
      this.isActive = false;
      
      // 显示完成动画
      this.showCompletion();
      
      // 标记已完成
      localStorage.setItem(`guide_${this.tourType}_completed`, 'true');
      
      if (this.onComplete) {
        this.onComplete();
      }
    }

    showCompletion() {
      const overlay = document.createElement('div');
      overlay.className = 'guide-completion-overlay';
      overlay.innerHTML = `
        <div class="guide-completion">
          <div class="guide-completion-icon">🎉</div>
          <h3>引导完成！</h3>
          <p>恭喜您已完成功能引导，现在可以开始使用了</p>
          <button class="guide-btn guide-btn-primary" id="guideStartUsing">开始使用</button>
        </div>
      `;
      document.body.appendChild(overlay);
      
      document.getElementById('guideStartUsing').addEventListener('click', () => {
        overlay.remove();
      });
      
      setTimeout(() => overlay.remove(), 3000);
    }

    hideAll() {
      this.elements.overlay.classList.remove('active');
      this.elements.card.classList.remove('active');
      this.elements.spotlight.classList.remove('active');
      this.elements.skipBtn.classList.remove('active');
      this.elements.arrow.style.display = 'none';
    }

    saveProgress() {
      localStorage.setItem(`guide_${this.tourType}_step`, this.currentStep);
    }

    loadProgress() {
      return parseInt(localStorage.getItem(`guide_${this.tourType}_step`) || '0');
    }

    isCompleted() {
      return localStorage.getItem(`guide_${this.tourType}_completed`) === 'true';
    }

    isSkipped() {
      return localStorage.getItem(`guide_${this.tourType}_skipped`) === 'true';
    }

    reset() {
      localStorage.removeItem(`guide_${this.tourType}_completed`);
      localStorage.removeItem(`guide_${this.tourType}_skipped`);
      localStorage.removeItem(`guide_${this.tourType}_step`);
    }

    restart() {
      this.reset();
      this.start(0);
    }
  }

  // 导出到全局
  window.GuideTour = GuideTour;

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', function() {
    // 检测是否需要显示引导
    const urlParams = new URLSearchParams(window.location.search);
    const forceGuide = urlParams.get('guide');
    
    if (forceGuide) {
      const guide = new GuideTour({ tourType: forceGuide });
      setTimeout(() => guide.start(), 1000);
    }
  });

})();
