/**
 * 游导旅游 - 会员等级系统 JavaScript
 * 提供等级判断、权益检查、成长值计算等功能
 */

// 会员系统核心模块
const MembershipSystem = {
  // 配置数据
  config: null,
  
  // 用户数据
  userData: {
    userId: null,
    nickname: '',
    avatar: '👤',
    level: 'NORMAL',
    growthValue: 0,
    points: 0,
    memberSince: null,
    memberExpire: null,
    isLoggedIn: false
  },

  /**
   * 初始化会员系统
   */
  async init() {
    // 加载配置
    await this.loadConfig();
    // 获取用户数据
    this.loadUserData();
    // 绑定事件
    this.bindEvents();
    // 更新UI
    this.updateUI();
  },

  /**
   * 加载会员配置
   */
  async loadConfig() {
    try {
      const response = await fetch('config/membership.json');
      if (response.ok) {
        this.config = await response.json();
      }
    } catch (error) {
      console.warn('无法加载会员配置，使用默认配置');
      this.config = this.getDefaultConfig();
    }
  },

  /**
   * 获取默认配置
   */
  getDefaultConfig() {
    return {
      levels: [
        { id: 1, code: 'NORMAL', name: '普通会员', icon: '👤', price: 0, minGrowth: 0, maxGrowth: 500 },
        { id: 2, code: 'VIP', name: 'VIP会员', icon: '⭐', price: 99, minGrowth: 500, maxGrowth: 2000 },
        { id: 3, code: 'SVIP', name: 'SVIP会员', icon: '🌟', price: 299, minGrowth: 2000, maxGrowth: 5000 },
        { id: 4, code: 'ULTIMATE', name: '至尊VIP', icon: '👑', price: 999, minGrowth: 5000, maxGrowth: 999999 }
      ],
      growthRules: {
        rules: [
          { action: 'register', name: '注册', growthValue: 50 },
          { action: 'daily_signin', name: '每日签到', growthValue: 10 },
          { action: 'booking', name: '完成预订', growthValue: 100 },
          { action: 'review', name: '发表评价', growthValue: 30 },
          { action: 'share', name: '分享内容', growthValue: 20 },
          { action: 'invite', name: '邀请好友', growthValue: 200 },
          { action: 'complete_trip', name: '完成旅行', growthValue: 300 }
        ]
      }
    };
  },

  /**
   * 加载用户数据
   */
  loadUserData() {
    // 从 localStorage 读取
    const stored = localStorage.getItem('membershipUser');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.userData = { ...this.userData, ...parsed };
      } catch (e) {
        console.warn('用户数据解析失败');
      }
    }
    
    // 模拟登录用户数据（演示用）
    if (!this.userData.isLoggedIn) {
      this.userData = {
        ...this.userData,
        userId: 'user_' + Date.now(),
        nickname: '旅行者_' + Math.floor(Math.random() * 10000),
        avatar: '🧳',
        level: 'VIP',
        growthValue: 1280,
        points: 3650,
        memberSince: '2024-03-15',
        memberExpire: '2025-03-15',
        isLoggedIn: true
      };
    }
  },

  /**
   * 保存用户数据
   */
  saveUserData() {
    localStorage.setItem('membershipUser', JSON.stringify(this.userData));
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    // 开通会员按钮
    document.querySelectorAll('[data-action="open-membership"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const level = e.currentTarget.dataset.level || 'VIP';
        this.handleOpenMembership(level);
      });
    });

    // 升级按钮
    document.querySelectorAll('[data-action="upgrade-membership"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const level = e.currentTarget.dataset.level || 'SVIP';
        this.handleUpgrade(level);
      });
    });
  },

  /**
   * 更新UI
   */
  updateUI() {
    // 更新等级徽章
    this.updateLevelBadges();
    // 更新进度条
    this.updateProgressBars();
    // 更新成长值显示
    this.updateGrowthDisplay();
    // 更新权益列表
    this.updatePrivileges();
  },

  /**
   * 获取当前等级信息
   */
  getCurrentLevel() {
    const currentLevel = this.config?.levels.find(l => l.code === this.userData.level);
    return currentLevel || this.config?.levels[0];
  },

  /**
   * 获取下一个等级
   */
  getNextLevel() {
    const current = this.getCurrentLevel();
    const levels = this.config?.levels || [];
    const currentIndex = levels.findIndex(l => l.code === this.userData.level);
    return currentIndex >= 0 && currentIndex < levels.length - 1 
      ? levels[currentIndex + 1] 
      : null;
  },

  /**
   * 判断等级
   */
  isLevel(levelCode) {
    return this.userData.level === levelCode;
  },

  /**
   * 判断是否达到指定等级
   */
  hasReachedLevel(levelCode) {
    const levels = this.config?.levels || [];
    const currentIndex = levels.findIndex(l => l.code === this.userData.level);
    const targetIndex = levels.findIndex(l => l.code === levelCode);
    return currentIndex >= targetIndex;
  },

  /**
   * 检查权益
   */
  hasPrivilege(privilegeId) {
    const currentLevel = this.getCurrentLevel();
    if (!currentLevel.privileges) return false;
    return currentLevel.privileges.some(p => p.id === privilegeId);
  },

  /**
   * 计算成长值
   */
  calculateGrowth(action) {
    const rules = this.config?.growthRules?.rules || [];
    const rule = rules.find(r => r.action === action);
    return rule ? rule.growthValue : 0;
  },

  /**
   * 添加成长值
   */
  addGrowth(action, multiplier = 1) {
    const growth = this.calculateGrowth(action) * multiplier;
    if (growth > 0) {
      this.userData.growthValue += growth;
      this.checkLevelUp();
      this.saveUserData();
      return growth;
    }
    return 0;
  },

  /**
   * 检查是否升级
   */
  checkLevelUp() {
    const currentLevel = this.getCurrentLevel();
    const nextLevel = this.getNextLevel();
    
    if (nextLevel && this.userData.growthValue >= nextLevel.minGrowth) {
      // 自动升级
      this.upgradeTo(nextLevel.code);
      return true;
    }
    return false;
  },

  /**
   * 升级到指定等级
   */
  upgradeTo(levelCode) {
    const level = this.config?.levels.find(l => l.code === levelCode);
    if (level) {
      this.userData.level = levelCode;
      this.userData.memberExpire = this.getExpireDate(1);
      if (!this.userData.memberSince) {
        this.userData.memberSince = new Date().toISOString().split('T')[0];
      }
      this.saveUserData();
      this.updateUI();
      
      // 触发升级事件
      this.onLevelUp(level);
    }
  },

  /**
   * 获取到期日期
   */
  getExpireDate(years = 1) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + years);
    return date.toISOString().split('T')[0];
  },

  /**
   * 升级成功回调
   */
  onLevelUp(level) {
    console.log(`恭喜升级到 ${level.name}`);
    // 可扩展：显示升级提示、发送通知等
  },

  /**
   * 获取等级样式类名
   */
  getLevelClass(levelCode) {
    const classMap = {
      'NORMAL': 'normal',
      'VIP': 'vip',
      'SVIP': 'svip',
      'ULTIMATE': 'ultimate'
    };
    return classMap[levelCode] || 'normal';
  },

  /**
   * 更新等级徽章
   */
  updateLevelBadges() {
    document.querySelectorAll('[data-level-badge]').forEach(el => {
      const level = this.getCurrentLevel();
      el.innerHTML = `${level.icon} ${level.name}`;
      el.className = `level-badge ${this.getLevelClass(this.userData.level)}`;
    });
  },

  /**
   * 更新进度条
   */
  updateProgressBars() {
    const currentLevel = this.getCurrentLevel();
    const nextLevel = this.getNextLevel();
    
    if (!nextLevel) {
      // 已达最高等级
      document.querySelectorAll('[data-progress-bar]').forEach(el => {
        el.style.width = '100%';
      });
      return;
    }

    const currentMin = currentLevel.minGrowth;
    const currentMax = nextLevel.minGrowth;
    const progress = ((this.userData.growthValue - currentMin) / (currentMax - currentMin)) * 100;
    const clampedProgress = Math.min(100, Math.max(0, progress));

    document.querySelectorAll('[data-progress-bar]').forEach(el => {
      el.style.width = `${clampedProgress}%`;
    });

    document.querySelectorAll('[data-progress-text]').forEach(el => {
      el.textContent = `${Math.floor(clampedProgress)}%`;
    });
  },

  /**
   * 更新成长值显示
   */
  updateGrowthDisplay() {
    document.querySelectorAll('[data-growth-value]').forEach(el => {
      el.textContent = this.userData.growthValue;
    });

    document.querySelectorAll('[data-govth-value]').forEach(el => {
      el.textContent = this.userData.growthValue;
    });
  },

  /**
   * 更新权益列表
   */
  updatePrivileges() {
    const currentLevel = this.getCurrentLevel();
    const privileges = currentLevel.privileges || [];

    document.querySelectorAll('[data-privileges-list]').forEach(el => {
      el.innerHTML = privileges.map(p => `
        <li class="privilege-item">
          <span class="privilege-icon">${p.icon}</span>
          <span class="privilege-name">${p.name}</span>
        </li>
      `).join('');
    });
  },

  /**
   * 处理开通会员
   */
  handleOpenMembership(level) {
    const targetLevel = this.config?.levels.find(l => l.code === level);
    if (!targetLevel) return;

    if (this.userData.isLoggedIn) {
      // 已登录用户直接开通
      this.upgradeTo(level);
      this.showMessage(`已成功开通${targetLevel.name}！`, 'success');
    } else {
      // 未登录跳转到登录页
      window.location.href = `login.html?redirect=membership&action=upgrade&level=${level}`;
    }
  },

  /**
   * 处理升级
   */
  handleUpgrade(level) {
    this.handleOpenMembership(level);
  },

  /**
   * 显示消息
   */
  showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `membership-message ${type}`;
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      message.classList.remove('show');
      setTimeout(() => message.remove(), 300);
    }, 3000);
  },

  /**
   * 渲染会员卡片
   */
  renderMembershipCards(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !this.config) return;

    container.innerHTML = this.config.levels.map(level => {
      const isCurrentLevel = level.code === this.userData.level;
      const isPopular = level.code === 'SVIP';
      const levelClass = this.getLevelClass(level.code);
      
      return `
        <div class="membership-card ${levelClass} ${isPopular ? 'popular' : ''}">
          <div class="membership-card-icon">${level.icon}</div>
          <h3 class="membership-card-title">${level.name}</h3>
          <p class="membership-card-subtitle">${level.description || ''}</p>
          <div class="membership-card-price ${level.price === 0 ? 'free' : ''}">
            ${level.price === 0 ? '免费' : `¥${level.price}`}
            ${level.price > 0 ? '<small>/年</small>' : ''}
          </div>
          <ul class="membership-card-benefits">
            ${(level.privileges || []).map(p => `
              <li>
                <span class="benefit-icon">${p.icon}</span>
                <span>${p.name}</span>
              </li>
            `).join('')}
          </ul>
          ${isCurrentLevel ? 
            '<button class="membership-card-btn secondary" disabled>当前等级</button>' :
            `<a href="payment.html?type=membership&level=${level.code}" class="membership-card-btn primary">立即开通</a>`
          }
        </div>
      `;
    }).join('');
  },

  /**
   * 渲染权益对比表
   */
  renderBenefitsTable(tableId) {
    const table = document.getElementById(tableId);
    if (!table || !this.config) return;

    const features = this.config.benefitsComparison?.features || [];
    
    table.innerHTML = `
      <thead>
        <tr>
          <th>权益项目</th>
          ${this.config.levels.map(l => `
            <th>
              <span class="level-icon">${l.icon}</span>
              ${l.name}
            </th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
        ${features.map(f => `
          <tr>
            <td>${f.feature}</td>
            <td class="${this.userData.level !== 'NORMAL' ? 'highlight' : ''}">${f.normal}</td>
            <td class="${this.userData.level === 'NORMAL' && f.vip !== '✗' ? 'highlight' : ''}">${f.vip}</td>
            <td class="${this.userData.level !== 'NORMAL' && f.svip !== '✗' ? 'highlight' : ''}">${f.svip}</td>
            <td class="${f.ultimate !== '✗' ? 'highlight' : ''}">${f.ultimate}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
  },

  /**
   * 渲染等级进度
   */
  renderLevelProgress(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !this.config) return;

    const levels = this.config.levels;
    const currentIndex = levels.findIndex(l => l.code === this.userData.level);

    container.innerHTML = `
      <div class="level-progress-header">
        <h3>
          <span>📈</span>
          成长进度
        </h3>
        <span class="level-progress-info">
          当前 ${this.userData.growthValue} 成长值
        </span>
      </div>
      <div class="level-steps">
        ${levels.map((level, index) => {
          let stepClass = 'locked';
          if (index < currentIndex) stepClass = 'completed';
          if (index === currentIndex) stepClass = 'current';
          
          return `
            <div class="level-step ${stepClass}">
              <div class="level-step-icon">${level.icon}</div>
              <span class="level-step-name">${level.name}</span>
            </div>
          `;
        }).join('')}
      </div>
      ${this.getNextLevel() ? `
        <div class="level-progress-bar">
          <div class="level-progress-fill" data-progress-bar style="width: ${this.getProgressPercent()}%"></div>
        </div>
        <div class="level-progress-text">
          <span>还需 ${this.getNextLevel().minGrowth - this.userData.growthValue} 成长值</span>
          <span>距离 ${this.getNextLevel().name}</span>
        </div>
      ` : `
        <div class="level-progress-bar">
          <div class="level-progress-fill" style="width: 100%"></div>
        </div>
        <div class="level-progress-text">
          <span>已达到最高等级</span>
        </div>
      `}
    `;
  },

  /**
   * 获取进度百分比
   */
  getProgressPercent() {
    const currentLevel = this.getCurrentLevel();
    const nextLevel = this.getNextLevel();
    if (!nextLevel) return 100;
    
    const progress = ((this.userData.growthValue - currentLevel.minGrowth) / 
                      (nextLevel.minGrowth - currentLevel.minGrowth)) * 100;
    return Math.min(100, Math.max(0, progress));
  }
};

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  MembershipSystem.init();
});

// 导出
window.MembershipSystem = MembershipSystem;
