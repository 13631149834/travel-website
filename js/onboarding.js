/**
 * 新用户引导系统
 * 首次访问检测、分步骤引导、跳过/完成记录、可重新触发
 */

(function() {
  'use strict';

  // 引导步骤配置
  const ONBOARDING_STEPS = [
    {
      id: 'welcome',
      icon: '🌍',
      title: '欢迎来到游导旅游',
      content: '专业的导游与游客一站式旅行平台。我们为您提供全方位的旅行服务，让您的旅途更加轻松愉快。',
      position: 'center',
      arrow: null,
      target: null,
      showSkip: true
    },
    {
      id: 'find-guide',
      icon: '🧭',
      title: '快速找到心仪导游',
      content: '浏览海量专业导游，查看真实评价和评分，根据目的地、出行日期筛选，轻松找到最适合您的导游。',
      featureList: [
        { icon: '🔍', text: '智能筛选导游' },
        { icon: '⭐', text: '查看真实评价' },
        { icon: '📅', text: '预约可用时间' }
      ],
      position: 'bottom',
      arrow: 'top',
      target: 'a[href="guides.html"]',
      showSkip: true
    },
    {
      id: 'routes',
      icon: '🗺️',
      title: '精选旅行路线',
      content: '探索平台精心策划的精品路线，涵盖热门景点、小众秘境、文化体验等多种类型，让旅行更有深度。',
      position: 'bottom',
      arrow: 'top',
      target: 'a[href="routes.html"]',
      showSkip: true
    },
    {
      id: 'tools',
      icon: '🛠️',
      title: '实用旅行工具',
      content: '汇率换算、天气查询、世界时钟、签证指南...一站式解决出行前的各种准备问题。',
      featureList: [
        { icon: '💱', text: '实时汇率换算' },
        { icon: '🌤️', text: '目的地天气' },
        { icon: '📋', text: '签证清单' }
      ],
      position: 'bottom',
      arrow: 'top',
      target: 'a[href="tools.html"]',
      showSkip: true
    },
    {
      id: 'community',
      icon: '👥',
      title: '旅行社区互动',
      content: '分享您的旅行故事，参考其他旅行者的经验，发现更多旅行灵感，与志同道合的人一起探索世界。',
      position: 'bottom',
      arrow: 'top',
      target: 'a[href="community.html"]',
      showSkip: true
    },
    {
      id: 'help',
      icon: '❓',
      title: '需要帮助？',
      content: '随时可以通过右下角的帮助按钮获取支持，或联系我们的客服团队。也可以查看常见问题解答。',
      position: 'bottom-left',
      arrow: null,
      target: '.help-entry-btn',
      showSkip: true
    },
    {
      id: 'complete',
      icon: '🎉',
      title: '准备就绪！',
      content: '恭喜您已完成新手引导，现在可以开始探索平台啦！祝您旅途愉快！',
      position: 'center',
      arrow: null,
      target: null,
      isComplete: true,
      showSkip: false
    }
  ];

  // 存储键名
  const STORAGE_KEYS = {
    ONBOARDED: 'travel_onboarded',
    ONBOARDING_STEP: 'travel_onboarding_step',
    DISCOVERY_DISMISSED: 'travel_discovery_dismissed'
  };

  class OnboardingSystem {
    constructor() {
      this.currentStep = 0;
      this.isActive = false;
      this.elements = {};
      this.init();
    }

    init() {
      this.createElements();
      this.bindEvents();
      
      // 检测是否首次访问
      if (this.shouldStartOnboarding()) {
        setTimeout(() => this.start(), 1500);
      }
    }

    createElements() {
      // 创建遮罩层
      const overlay = document.createElement('div');
      overlay.className = 'onboarding-overlay';
      overlay.id = 'onboardingOverlay';
      document.body.appendChild(overlay);

      // 创建高亮区域
      const spotlight = document.createElement('div');
      spotlight.className = 'onboarding-spotlight';
      spotlight.id = 'onboardingSpotlight';
      document.body.appendChild(spotlight);

      // 创建引导卡片
      const card = document.createElement('div');
      card.className = 'onboarding-card';
      card.id = 'onboardingCard';
      card.innerHTML = this.renderCardContent(ONBOARDING_STEPS[0]);
      document.body.appendChild(card);

      // 创建帮助入口按钮
      const helpBtn = document.createElement('button');
      helpBtn.className = 'help-entry-btn';
      helpBtn.id = 'helpEntryBtn';
      helpBtn.innerHTML = '❓';
      helpBtn.setAttribute('aria-label', '获取帮助');
      helpBtn.title = '需要帮助？点击查看使用指南';
      document.body.appendChild(helpBtn);

      this.elements = {
        overlay,
        spotlight,
        card,
        helpBtn
      };
    }

    renderCardContent(step) {
      let featureListHtml = '';
      if (step.featureList) {
        featureListHtml = `
          <ul class="onboarding-feature-list">
            ${step.featureList.map(item => `
              <li>
                <span class="feature-icon">${item.icon}</span>
                <span>${item.text}</span>
              </li>
            `).join('')}
          </ul>
        `;
      }

      let completeHtml = '';
      if (step.isComplete) {
        completeHtml = `
          <div class="onboarding-complete">
            <div class="onboarding-complete-icon">✓</div>
            <h3>${step.title}</h3>
            <p>${step.content}</p>
          </div>
        `;
      }

      const progressDots = ONBOARDING_STEPS.slice(0, -1).map((_, i) => {
        let className = 'onboarding-progress-dot';
        if (i < this.currentStep) className += ' completed';
        if (i === this.currentStep) className += ' active';
        return `<span class="${className}"></span>`;
      }).join('');

      const stepBadge = step.isComplete ? '' : 
        `<span class="onboarding-step-badge">${this.currentStep + 1}/${ONBOARDING_STEPS.length - 1}</span>`;

      if (step.isComplete) {
        return `
          <div class="onboarding-card-header">
            <div class="onboarding-icon">${step.icon}</div>
          </div>
          <div class="onboarding-card-body">
            ${completeHtml}
          </div>
          <div class="onboarding-card-footer">
            <div class="onboarding-progress">${progressDots}</div>
            <div class="onboarding-actions">
              <button class="onboarding-btn onboarding-btn-primary" onclick="window.onboardingSystem.complete()">开始探索</button>
            </div>
          </div>
        `;
      }

      return `
        <div class="onboarding-card-header">
          <div class="onboarding-icon">${step.icon}</div>
          <h3 class="onboarding-title">${step.title}</h3>
          ${stepBadge}
        </div>
        <div class="onboarding-card-body">
          <p class="onboarding-text">${step.content}</p>
          ${featureListHtml}
        </div>
        <div class="onboarding-card-footer">
          <div class="onboarding-progress">${progressDots}</div>
          <div class="onboarding-actions">
            ${step.showSkip ? '<button class="onboarding-btn onboarding-btn-skip" onclick="window.onboardingSystem.skip()">跳过</button>' : ''}
            <button class="onboarding-btn onboarding-btn-primary" onclick="window.onboardingSystem.next()">
              ${this.currentStep === ONBOARDING_STEPS.length - 2 ? '完成' : '下一步'}
            </button>
          </div>
        </div>
      `;
    }

    bindEvents() {
      // 帮助按钮点击
      this.elements.helpBtn.addEventListener('click', () => {
        this.showHelpMenu();
      });

      // ESC键关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isActive) {
          this.skip();
        }
      });

      // 点击遮罩层跳过
      this.elements.overlay.addEventListener('click', () => {
        this.skip();
      });

      // 窗口调整时重新定位
      window.addEventListener('resize', () => {
        if (this.isActive) {
          this.updatePosition();
        }
      });
    }

    shouldStartOnboarding() {
      // 检查是否已完成引导
      const hasOnboarded = localStorage.getItem(STORAGE_KEYS.ONBOARDED);
      return !hasOnboarded;
    }

    start() {
      this.isActive = true;
      this.currentStep = 0;
      this.showStep(0);
    }

    restart() {
      localStorage.removeItem(STORAGE_KEYS.ONBOARDED);
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_STEP);
      this.start();
    }

    showStep(index) {
      const step = ONBOARDING_STEPS[index];
      
      // 更新卡片内容
      this.elements.card.innerHTML = this.renderCardContent(step);
      
      // 移除所有位置类
      this.elements.card.className = 'onboarding-card';
      this.elements.card.classList.add(`position-${step.position}`);
      
      // 显示遮罩和卡片
      this.elements.overlay.classList.add('active');
      this.elements.card.classList.add('active');
      
      // 更新高亮区域
      if (step.target) {
        const targetEl = document.querySelector(step.target);
        if (targetEl) {
          setTimeout(() => {
            this.showSpotlight(targetEl, step);
          }, 100);
        }
      } else {
        this.elements.spotlight.style.display = 'none';
      }
    }

    showSpotlight(targetEl, step) {
      const rect = targetEl.getBoundingClientRect();
      const padding = 8;
      
      this.elements.spotlight.style.display = 'block';
      this.elements.spotlight.style.top = `${rect.top - padding}px`;
      this.elements.spotlight.style.left = `${rect.left - padding}px`;
      this.elements.spotlight.style.width = `${rect.width + padding * 2}px`;
      this.elements.spotlight.style.height = `${rect.height + padding * 2}px`;
      
      // 调整卡片位置
      this.updateCardPosition(rect, step);
    }

    updateCardPosition(targetRect, step) {
      const cardRect = this.elements.card.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 20;
      
      let top, left;
      
      switch (step.position) {
        case 'bottom':
          top = targetRect.bottom + gap;
          left = targetRect.left + targetRect.width / 2 - cardRect.width / 2;
          break;
        case 'top':
          top = targetRect.top - cardRect.height - gap;
          left = targetRect.left + targetRect.width / 2 - cardRect.width / 2;
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2 - cardRect.height / 2;
          left = targetRect.left - cardRect.width - gap;
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2 - cardRect.height / 2;
          left = targetRect.right + gap;
          break;
        case 'bottom-left':
          top = targetRect.bottom + gap;
          left = targetRect.left;
          break;
        case 'bottom-right':
          top = targetRect.bottom + gap;
          left = targetRect.right - cardRect.width;
          break;
        default:
          left = (viewportWidth - cardRect.width) / 2;
          top = (viewportHeight - cardRect.height) / 2;
      }
      
      // 边界检测
      if (left < 16) left = 16;
      if (left + cardRect.width > viewportWidth - 16) {
        left = viewportWidth - cardRect.width - 16;
      }
      if (top < 16) top = targetRect.bottom + gap;
      if (top + cardRect.height > viewportHeight - 16) {
        top = viewportHeight - cardRect.height - 16;
      }
      
      this.elements.card.style.left = `${left}px`;
      this.elements.card.style.top = `${top}px`;
      this.elements.card.style.transform = 'none';
    }

    updatePosition() {
      if (!this.isActive) return;
      
      const step = ONBOARDING_STEPS[this.currentStep];
      if (step.target) {
        const targetEl = document.querySelector(step.target);
        if (targetEl) {
          this.showSpotlight(targetEl, step);
        }
      }
    }

    next() {
      if (this.currentStep < ONBOARDING_STEPS.length - 1) {
        this.currentStep++;
        this.saveProgress();
        this.showStep(this.currentStep);
      }
    }

    skip() {
      this.finish();
    }

    complete() {
      this.finish();
    }

    finish() {
      this.isActive = false;
      this.elements.overlay.classList.remove('active');
      this.elements.card.classList.remove('active');
      this.elements.spotlight.style.display = 'none';
      
      localStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_STEP);
      
      // 显示功能发现提示
      setTimeout(() => {
        this.showDiscoveryTips();
      }, 2000);
    }

    saveProgress() {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_STEP, this.currentStep.toString());
    }

    showDiscoveryTips() {
      const tips = [
        { target: 'a[href="guides.html"]', text: '试试找导游', icon: '🧭' },
        { target: '.side-toolbar', text: '快捷工具', icon: '🛠️' },
        { target: 'a[href="community.html"]', text: '旅行社区', icon: '👥' }
      ];
      
      // 只显示一个随机提示
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      const targetEl = document.querySelector(randomTip.target);
      
      if (targetEl && !localStorage.getItem(randomTip.target + '_dismissed')) {
        const tip = document.createElement('div');
        tip.className = 'discovery-tip';
        tip.innerHTML = `${randomTip.icon} ${randomTip.text}`;
        
        const rect = targetEl.getBoundingClientRect();
        tip.style.top = `${rect.bottom + 10}px`;
        tip.style.left = `${rect.left + rect.width / 2}px`;
        tip.style.transform = 'translateX(-50%)';
        
        tip.addEventListener('click', () => {
          tip.remove();
          localStorage.setItem(randomTip.target + '_dismissed', 'true');
        });
        
        document.body.appendChild(tip);
        setTimeout(() => {
          tip.classList.add('active');
        }, 100);
        
        // 5秒后自动消失
        setTimeout(() => {
          if (tip.parentNode) {
            tip.remove();
          }
        }, 5000);
      }
    }

    showHelpMenu() {
      // 创建帮助菜单
      const existingMenu = document.getElementById('helpMenu');
      if (existingMenu) {
        existingMenu.remove();
        return;
      }
      
      const menu = document.createElement('div');
      menu.id = 'helpMenu';
      menu.className = 'onboarding-card position-bottom-left active';
      menu.style.width = '280px';
      menu.innerHTML = `
        <div class="onboarding-card-header">
          <div class="onboarding-icon">❓</div>
          <h3 class="onboarding-title">需要帮助？</h3>
        </div>
        <div class="onboarding-card-body">
          <ul class="onboarding-feature-list">
            <li>
              <span class="feature-icon">📖</span>
              <span onclick="window.onboardingSystem.showGuide()" style="cursor:pointer">查看新手引导</span>
            </li>
            <li>
              <span class="feature-icon">📧</span>
              <span><a href="contact.html" style="color:inherit">联系客服</a></span>
            </li>
            <li>
              <span class="feature-icon">❔</span>
              <span><a href="faq.html" style="color:inherit">常见问题</a></span>
            </li>
          </ul>
        </div>
      `;
      
      document.body.appendChild(menu);
      
      // 点击外部关闭
      setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
          if (!menu.contains(e.target) && e.target !== document.getElementById('helpEntryBtn')) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
          }
        });
      }, 100);
    }

    showGuide() {
      const menu = document.getElementById('helpMenu');
      if (menu) menu.remove();
      
      this.restart();
    }
  }

  // 初始化引导系统
  window.onboardingSystem = new OnboardingSystem();
  
  // 提供全局方法供外部调用
  window.showOnboarding = function() {
    window.onboardingSystem.restart();
  };

})();
