/**
 * 游导旅游 - 新用户引导系统主入口
 * 整合欢迎弹窗、引导组件、新手任务、功能发现
 */

(function() {
  'use strict';

  // 首次访问欢迎弹窗配置
  const WELCOME_CONFIG = {
    enabled: true,
    delay: 1500, // 延迟显示时间(ms)
    autoClose: 10000, // 自动关闭时间(ms), 0表示不自动关闭
    title: '欢迎来到游导旅游！',
    subtitle: '专业的导游预约平台',
    features: [
      { icon: '🧭', text: '严选认证导游' },
      { icon: '⭐', text: '真实用户评价' },
      { icon: '🔒', text: '资金安全保障' },
      { icon: '💬', text: '24小时客服' }
    ],
    actions: [
      { text: '开始探索', primary: true, action: 'start' },
      { text: '查看新手指南', primary: false, action: 'guide' }
    ]
  };

  // 核心引导系统
  class OnboardingMaster {
    constructor() {
      this.isNewUser = this.checkIsNewUser();
      this.isFirstVisit = this.checkIsFirstVisit();
      this.init();
    }

    init() {
      if (this.isFirstVisit) {
        this.startWelcomeFlow();
      }
      
      // 初始化帮助入口按钮
      this.createHelpEntry();
      
      // 监听URL参数触发引导
      this.listenUrlParams();
    }

    // 检测是否新用户
    checkIsNewUser() {
      return !localStorage.getItem('travel_onboarded');
    }

    // 检测是否首次访问
    checkIsFirstVisit() {
      return !localStorage.getItem('travel_visited');
    }

    // 标记已访问
    markVisited() {
      localStorage.setItem('travel_visited', 'true');
    }

    // 开始欢迎流程
    startWelcomeFlow() {
      this.markVisited();
      
      setTimeout(() => {
        this.showWelcomeModal();
      }, WELCOME_CONFIG.delay);
    }

    // 显示欢迎弹窗
    showWelcomeModal() {
      const overlay = document.createElement('div');
      overlay.id = 'welcomeModal';
      overlay.className = 'welcome-modal-overlay';
      
      overlay.innerHTML = `
        <div class="welcome-modal">
          <button class="welcome-modal-close" id="welcomeCloseBtn" aria-label="关闭">×</button>
          
          <div class="welcome-modal-header">
            <div class="welcome-logo">🌍</div>
            <h2>${WELCOME_CONFIG.title}</h2>
            <p>${WELCOME_CONFIG.subtitle}</p>
          </div>
          
          <div class="welcome-features">
            ${WELCOME_CONFIG.features.map(f => `
              <div class="welcome-feature-item">
                <span class="feature-icon">${f.icon}</span>
                <span class="feature-text">${f.text}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="welcome-actions">
            ${WELCOME_CONFIG.actions.map(action => `
              <button class="welcome-btn ${action.primary ? 'welcome-btn-primary' : 'welcome-btn-secondary'}" 
                      data-action="${action.action}">
                ${action.text}
              </button>
            `).join('')}
          </div>
          
          <p class="welcome-tip">完成新手任务可获得积分奖励 →</p>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      // 动画显示
      setTimeout(() => overlay.classList.add('active'), 50);
      
      // 绑定事件
      this.bindWelcomeEvents(overlay);
      
      // 自动关闭
      if (WELCOME_CONFIG.autoClose > 0) {
        setTimeout(() => {
          if (overlay.parentNode) this.closeWelcomeModal(overlay);
        }, WELCOME_CONFIG.autoClose);
      }
    }

    // 绑定欢迎弹窗事件
    bindWelcomeEvents(overlay) {
      // 关闭按钮
      document.getElementById('welcomeCloseBtn').addEventListener('click', () => {
        this.closeWelcomeModal(overlay);
      });
      
      // 操作按钮
      overlay.querySelectorAll('.welcome-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          this.closeWelcomeModal(overlay);
          
          switch(action) {
            case 'start':
              // 开始功能引导
              if (window.GuideTour) {
                const guide = new GuideTour({ tourType: 'home' });
                guide.start();
              }
              break;
            case 'guide':
              // 跳转到新手指南
              window.location.href = 'getting-started.html';
              break;
          }
        });
      });
      
      // 点击遮罩关闭
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeWelcomeModal(overlay);
        }
      });
    }

    // 关闭欢迎弹窗
    closeWelcomeModal(overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
      
      // 延迟启动新手任务
      setTimeout(() => {
        if (window.BeginnerTasks && !window.beginnerTasks) {
          window.beginnerTasks = new BeginnerTasks();
        }
      }, 500);
    }

    // 创建帮助入口
    createHelpEntry() {
      const existing = document.getElementById('helpEntryBtn');
      if (existing) return;
      
      const btn = document.createElement('button');
      btn.id = 'helpEntryBtn';
      btn.className = 'help-entry-btn';
      btn.innerHTML = '❓';
      btn.setAttribute('aria-label', '获取帮助');
      btn.title = '需要帮助？点击查看使用指南';
      
      btn.addEventListener('click', () => {
        // 显示帮助菜单
        this.showHelpMenu();
      });
      
      document.body.appendChild(btn);
    }

    // 显示帮助菜单
    showHelpMenu() {
      const existing = document.getElementById('helpMenu');
      if (existing) {
        existing.classList.toggle('active');
        return;
      }
      
      const menu = document.createElement('div');
      menu.id = 'helpMenu';
      menu.className = 'help-menu';
      menu.innerHTML = `
        <div class="help-menu-header">
          <span class="help-menu-title">需要帮助？</span>
          <button class="help-menu-close" aria-label="关闭">×</button>
        </div>
        <div class="help-menu-list">
          <a href="getting-started.html" class="help-menu-item">
            <span class="item-icon">📖</span>
            <span class="item-text">新手指南</span>
          </a>
          <a href="#" class="help-menu-item" onclick="window.showOnboarding && window.showOnboarding(); return false;">
            <span class="item-icon">🧭</span>
            <span class="item-text">功能引导</span>
          </a>
          <a href="faq.html" class="help-menu-item">
            <span class="item-icon">❓</span>
            <span class="item-text">常见问题</span>
          </a>
          <button class="help-menu-item" id="openChatBtn">
            <span class="item-icon">💬</span>
            <span class="item-text">在线咨询</span>
          </button>
        </div>
      `;
      
      document.body.appendChild(menu);
      
      // 定位到帮助按钮旁边
      const helpBtn = document.getElementById('helpEntryBtn');
      const rect = helpBtn.getBoundingClientRect();
      menu.style.bottom = `${window.innerHeight - rect.top + 10}px`;
      menu.style.left = `${rect.left}px`;
      
      setTimeout(() => menu.classList.add('active'), 50);
      
      // 绑定关闭事件
      menu.querySelector('.help-menu-close').addEventListener('click', () => {
        menu.classList.remove('active');
        setTimeout(() => menu.remove(), 300);
      });
      
      // 在线咨询
      const chatBtn = document.getElementById('openChatBtn');
      if (chatBtn) {
        chatBtn.addEventListener('click', () => {
          if (window.CustomerServiceWidget) {
            window.CustomerServiceWidget.open();
          }
          menu.classList.remove('active');
          setTimeout(() => menu.remove(), 300);
        });
      }
      
      // 点击其他地方关闭
      setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
          if (!menu.contains(e.target) && e.target !== helpBtn) {
            menu.classList.remove('active');
            setTimeout(() => menu.remove(), 300);
            document.removeEventListener('click', closeMenu);
          }
        });
      }, 100);
    }

    // 监听URL参数
    listenUrlParams() {
      const params = new URLSearchParams(window.location.search);
      
      // ?guide=home 触发引导
      if (params.has('guide')) {
        const guideType = params.get('guide');
        setTimeout(() => {
          if (window.GuideTour) {
            const guide = new GuideTour({ tourType: guideType });
            guide.start();
          }
        }, 1000);
      }
      
      // ?welcome=true 强制显示欢迎弹窗
      if (params.has('welcome')) {
        this.showWelcomeModal();
      }
      
      // ?tasks=true 显示新手任务
      if (params.has('tasks')) {
        setTimeout(() => {
          if (window.beginnerTasks) {
            window.beginnerTasks.showPanel();
          }
        }, 1000);
      }
    }

    // 公开方法：显示引导
    showGuide(tourType = 'home') {
      if (window.GuideTour) {
        const guide = new GuideTour({ tourType });
        guide.start();
      }
    }

    // 公开方法：显示新手任务
    showTasks() {
      if (window.beginnerTasks) {
        window.beginnerTasks.showPanel();
      }
    }

    // 公开方法：标记引导完成
    completeOnboarding() {
      localStorage.setItem('travel_onboarded', 'true');
    }

    // 公开方法：重置引导
    resetOnboarding() {
      localStorage.removeItem('travel_onboarded');
      localStorage.removeItem('travel_visited');
      this.isNewUser = true;
      this.isFirstVisit = true;
      this.showWelcomeModal();
    }
  }

  // 初始化
  const master = new OnboardingMaster();
  
  // 导出到全局
  window.OnboardingMaster = OnboardingMaster;
  window.onboardingMaster = master;
  
  // 快捷方法
  window.showOnboarding = () => master.showGuide('home');
  window.showTasks = () => master.showTasks();
  window.resetOnboarding = () => master.resetOnboarding();

  // 页面加载完成后初始化各个模块
  document.addEventListener('DOMContentLoaded', function() {
    // 延迟加载其他模块
    setTimeout(() => {
      // 加载分步引导（如果需要）
      // GuideTour 会在需要时由用户触发
      
      // 加载新手任务（仅新用户）
      if (master.isNewUser && !window.beginnerTasks) {
        // 等待欢迎弹窗关闭后再加载
      }
    }, 100);
  });

})();
