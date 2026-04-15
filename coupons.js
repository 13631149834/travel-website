/**
 * 优惠券系统核心模块
 * 功能：优惠券领取、使用、判断、过期检查
 */

const CouponsSystem = {
  // 配置
  config: {
    storageKey: 'youdao_user_coupons',
    couponsDataKey: 'youdao_coupons_data',
    notifyDaysBefore: 3 // 提前多少天提醒即将过期
  },

  // 状态
  coupons: [],
  userCoupons: [],
  categories: [],

  /**
   * 初始化
   */
  async init() {
    await this.loadCouponsData();
    this.loadUserCoupons();
    this.checkExpiringCoupons();
    this.renderMyCoupons();
  },

  /**
   * 加载优惠券数据
   */
  async loadCouponsData() {
    try {
      const response = await fetch('data/coupons.json');
      const data = await response.json();
      this.coupons = data.coupons || [];
      this.categories = data.categories || [];
      this.allUserCoupons = data.userCoupons || [];
    } catch (error) {
      console.error('加载优惠券数据失败:', error);
      this.coupons = [];
      this.categories = [];
    }
  },

  /**
   * 从本地存储加载用户优惠券
   */
  loadUserCoupons() {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        this.userCoupons = JSON.parse(stored);
      } else {
        // 使用默认数据初始化
        this.userCoupons = this.allUserCoupons.map(uc => {
          const coupon = this.coupons.find(c => c.id === uc.couponId);
          return {
            ...uc,
            couponData: coupon
          };
        });
        this.saveUserCoupons();
      }
    } catch (e) {
      this.userCoupons = [];
    }
  },

  /**
   * 保存用户优惠券到本地
   */
  saveUserCoupons() {
    localStorage.setItem(this.config.storageKey, JSON.stringify(this.userCoupons));
  },

  /**
   * 获取优惠券详情
   */
  getCouponById(couponId) {
    return this.coupons.find(c => c.id === couponId);
  },

  /**
   * 获取用户优惠券详情
   */
  getUserCouponById(userCouponId) {
    return this.userCoupons.find(uc => uc.id === userCouponId);
  },

  /**
   * 领取优惠券
   */
  claimCoupon(couponId) {
    // 检查是否已领取
    if (this.hasClaimed(couponId)) {
      this.showToast('您已领取过此优惠券', 'warning');
      return false;
    }

    // 获取优惠券信息
    const coupon = this.getCouponById(couponId);
    if (!coupon) {
      this.showToast('优惠券不存在', 'error');
      return false;
    }

    // 检查库存
    if (coupon.quantity > 0 && coupon.claimed >= coupon.quantity) {
      this.showToast('优惠券已领完', 'error');
      return false;
    }

    // 检查有效期
    const now = new Date();
    const validUntil = new Date(coupon.validUntil);
    if (validUntil < now) {
      this.showToast('优惠券已过期', 'error');
      return false;
    }

    // 检查会员等级
    if (coupon.requiresMembership) {
      const userLevel = this.getUserMembershipLevel();
      if (!this.meetsMembershipRequirement(userLevel, coupon.requiresMembership)) {
        this.showToast(`需要${this.getMembershipName(coupon.requiresMembership)}及以上会员`, 'warning');
        return false;
      }
    }

    // 计算过期时间
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 默认30天有效期

    // 创建用户优惠券记录
    const userCoupon = {
      id: 'UC' + Date.now(),
      couponId: coupon.id,
      status: 'available',
      claimedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      usedAt: null,
      usedOrderId: null,
      couponData: coupon
    };

    this.userCoupons.push(userCoupon);
    this.saveUserCoupons();

    // 更新领取数量
    coupon.claimed = (coupon.claimed || 0) + 1;

    this.showToast(`恭喜！成功领取 ${this.formatCouponValue(coupon)}`, 'success');
    
    // 触发事件
    window.dispatchEvent(new CustomEvent('couponClaimed', { detail: userCoupon }));

    return true;
  },

  /**
   * 检查是否已领取
   */
  hasClaimed(couponId) {
    return this.userCoupons.some(uc => uc.couponId === couponId && uc.status !== 'expired');
  },

  /**
   * 使用优惠券
   */
  useCoupon(userCouponId, orderId) {
    const userCoupon = this.getUserCouponById(userCouponId);
    if (!userCoupon) {
      this.showToast('优惠券不存在', 'error');
      return false;
    }

    if (userCoupon.status !== 'available') {
      this.showToast('优惠券不可用', 'error');
      return false;
    }

    // 检查是否过期
    if (this.isExpired(userCoupon)) {
      this.expireCoupon(userCouponId);
      this.showToast('优惠券已过期', 'error');
      return false;
    }

    // 更新状态
    userCoupon.status = 'used';
    userCoupon.usedAt = new Date().toISOString();
    userCoupon.usedOrderId = orderId;
    
    this.saveUserCoupons();
    this.showToast('优惠券使用成功', 'success');

    return true;
  },

  /**
   * 获取可用优惠券
   */
  getAvailableCoupons() {
    return this.userCoupons.filter(uc => {
      if (uc.status !== 'available') return false;
      return !this.isExpired(uc);
    });
  },

  /**
   * 获取已使用优惠券
   */
  getUsedCoupons() {
    return this.userCoupons.filter(uc => uc.status === 'used');
  },

  /**
   * 获取已过期优惠券
   */
  getExpiredCoupons() {
    return this.userCoupons.map(uc => {
      if (uc.status === 'available' && this.isExpired(uc)) {
        uc.status = 'expired';
      }
      return uc;
    }).filter(uc => uc.status === 'expired');
  },

  /**
   * 获取即将过期优惠券
   */
  getExpiringSoonCoupons() {
    const days = this.config.notifyDaysBefore;
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);

    return this.userCoupons.filter(uc => {
      if (uc.status !== 'available') return false;
      const expiresAt = new Date(uc.expiresAt);
      return expiresAt <= threshold && expiresAt > new Date();
    });
  },

  /**
   * 检查是否过期
   */
  isExpired(userCoupon) {
    if (userCoupon.status === 'expired') return true;
    const expiresAt = new Date(userCoupon.expiresAt);
    return expiresAt < new Date();
  },

  /**
   * 标记优惠券过期
   */
  expireCoupon(userCouponId) {
    const userCoupon = this.getUserCouponById(userCouponId);
    if (userCoupon) {
      userCoupon.status = 'expired';
      this.saveUserCoupons();
    }
  },

  /**
   * 检查即将过期的优惠券并提醒
   */
  checkExpiringCoupons() {
    const expiringSoon = this.getExpiringSoonCoupons();
    if (expiringSoon.length > 0) {
      this.showExpiringNotice(expiringSoon);
    }
  },

  /**
   * 显示即将过期提醒
   */
  showExpiringNotice(coupons) {
    const notice = document.createElement('div');
    notice.className = 'expiring-notice';
    notice.id = 'expiringNotice';
    notice.innerHTML = `
      <div class="icon">⏰</div>
      <div class="content">
        <h4>您有 ${coupons.length} 张优惠券即将过期</h4>
        <p>请尽快使用，避免损失</p>
      </div>
      <button class="close-btn" onclick="this.parentElement.remove()">×</button>
    `;
    
    // 插入到页面
    const container = document.querySelector('.my-coupons-container');
    if (container) {
      container.insertBefore(notice, container.firstChild);
    }
  },

  /**
   * 计算节省金额
   */
  calculateSavings() {
    const usedCoupons = this.getUsedCoupons();
    let total = 0;
    
    usedCoupons.forEach(uc => {
      if (uc.couponData) {
        if (uc.couponData.type === 'discount') {
          total += uc.couponData.value;
        } else if (uc.couponData.type === 'percent') {
          // 需要订单金额来计算，这里简化处理
          total += 100; // 默认节省100元
        }
      }
    });
    
    return total;
  },

  /**
   * 检查优惠券是否满足使用条件
   */
  canUseCoupon(userCouponId, orderAmount) {
    const userCoupon = this.getUserCouponById(userCouponId);
    if (!userCoupon) return false;
    
    if (userCoupon.status !== 'available') return false;
    if (this.isExpired(userCoupon)) return false;
    
    const coupon = userCoupon.couponData;
    if (!coupon) return false;
    
    // 检查最低消费金额
    if (coupon.minAmount && orderAmount < coupon.minAmount) {
      return false;
    }
    
    return true;
  },

  /**
   * 获取适合订单的优惠券
   */
  getApplicableCoupons(orderAmount, productType = 'all') {
    return this.getAvailableCoupons().filter(uc => {
      if (!this.canUseCoupon(uc.id, orderAmount)) return false;
      
      const coupon = uc.couponData;
      if (!coupon) return false;
      
      // 检查适用产品
      if (coupon.applicableProducts) {
        const applicable = coupon.applicableProducts;
        if (!applicable.includes('全部商品') && 
            !applicable.includes('全部路线') && 
            !applicable.includes(productType)) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => {
      // 按优惠力度排序
      const aValue = a.couponData.type === 'percent' ? orderAmount * (1 - a.couponData.value / 100) : a.couponData.value;
      const bValue = b.couponData.type === 'percent' ? orderAmount * (1 - b.couponData.value / 100) : b.couponData.value;
      return bValue - aValue;
    });
  },

  /**
   * 计算优惠券抵扣金额
   */
  calculateDiscount(userCouponId, orderAmount) {
    const userCoupon = this.getUserCouponById(userCouponId);
    if (!userCoupon || !userCoupon.couponData) return 0;
    
    const coupon = userCoupon.couponData;
    
    if (coupon.type === 'discount') {
      return coupon.value;
    } else if (coupon.type === 'percent') {
      return Math.floor(orderAmount * (coupon.value / 100));
    }
    
    return 0;
  },

  /**
   * 格式化优惠券值
   */
  formatCouponValue(coupon) {
    if (coupon.type === 'discount') {
      return `${coupon.value}元`;
    } else if (coupon.type === 'percent') {
      return `${coupon.value}折`;
    } else if (coupon.type === 'voucher') {
      return `${coupon.value}元代金券`;
    } else if (coupon.type === 'experience') {
      return '免费体验';
    } else if (coupon.type === 'exchange') {
      return '兑换券';
    }
    return coupon.value;
  },

  /**
   * 获取优惠券类型名称
   */
  getCouponTypeName(type) {
    const typeMap = {
      'discount': '满减券',
      'percent': '折扣券',
      'voucher': '代金券',
      'exchange': '兑换券',
      'experience': '体验券'
    };
    return typeMap[type] || '优惠券';
  },

  /**
   * 格式化日期
   */
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 获取剩余天数
   */
  getRemainingDays(expiresAt) {
    const now = new Date();
    const expire = new Date(expiresAt);
    const diff = expire - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  /**
   * 获取用户会员等级
   */
  getUserMembershipLevel() {
    // 实际应用中从用户信息获取
    const stored = localStorage.getItem('youdao_user');
    if (stored) {
      const user = JSON.parse(stored);
      return user.membershipLevel || 'normal';
    }
    return 'normal';
  },

  /**
   * 检查是否满足会员要求
   */
  meetsMembershipRequirement(userLevel, requiredLevel) {
    const levels = ['normal', 'bronze', 'silver', 'gold', 'enterprise'];
    const userIndex = levels.indexOf(userLevel);
    const requiredIndex = levels.indexOf(requiredLevel);
    return userIndex >= requiredIndex;
  },

  /**
   * 获取会员等级名称
   */
  getMembershipName(level) {
    const names = {
      'normal': '普通',
      'bronze': '铜卡',
      'silver': '银卡',
      'gold': '金卡',
      'enterprise': '企业'
    };
    return names[level] || level;
  },

  /**
   * 渲染我的优惠券列表
   */
  renderMyCoupons() {
    const container = document.getElementById('myCouponsList');
    if (!container) return;

    // 更新统计
    this.updateStats();

    // 渲染优惠券
    const available = this.getAvailableCoupons();
    const used = this.getUsedCoupons();
    const expired = this.getExpiredCoupons();

    // 默认显示可用
    const currentTab = window.currentCouponTab || 'available';
    let coupons = [];
    
    switch (currentTab) {
      case 'available':
        coupons = available;
        break;
      case 'used':
        coupons = used;
        break;
      case 'expired':
        coupons = expired;
        break;
    }

    if (coupons.length === 0) {
      container.innerHTML = this.renderEmptyState(currentTab);
      return;
    }

    container.innerHTML = `
      <div class="my-coupon-list">
        ${coupons.map(coupon => this.renderMyCouponCard(coupon)).join('')}
      </div>
    `;

    // 绑定事件
    this.bindCouponEvents();
  },

  /**
   * 渲染我的优惠券卡片
   */
  renderMyCouponCard(userCoupon) {
    const coupon = userCoupon.couponData;
    if (!coupon) return '';

    const remainingDays = this.getRemainingDays(userCoupon.expiresAt);
    const isExpiringSoon = remainingDays <= 7 && remainingDays > 0;
    const isExpired = userCoupon.status === 'expired' || remainingDays <= 0;

    let statusClass = '';
    let statusBadge = '';
    
    if (isExpired) {
      statusClass = 'expired';
      statusBadge = '<span class="coupon-status-badge expired">已过期</span>';
    } else if (userCoupon.status === 'used') {
      statusClass = 'used';
      statusBadge = '<span class="coupon-status-badge used">已使用</span>';
    } else if (isExpiringSoon) {
      statusBadge = `<span class="coupon-status-badge expiring-soon">${remainingDays}天后过期</span>`;
    } else {
      statusBadge = '<span class="coupon-status-badge available">未使用</span>';
    }

    return `
      <div class="my-coupon-card ${statusClass}" data-user-coupon-id="${userCoupon.id}">
        ${statusBadge}
        <div class="coupon-card">
          <div class="coupon-value-section" style="background: ${coupon.color}">
            <div class="coupon-value">
              ${coupon.type === 'percent' ? 
                `<span class="unit">折</span>${coupon.value}` : 
                coupon.type === 'experience' ? 
                  '免费<br>体验' :
                  coupon.type === 'exchange' ?
                    '兑换' :
                    `<span class="unit">¥</span>${coupon.value}`
              }
            </div>
            <span class="coupon-type-badge">${this.getCouponTypeName(coupon.type)}</span>
          </div>
          <div class="coupon-info-section">
            <div>
              <div class="coupon-name">${coupon.name}</div>
              <div class="coupon-condition">${coupon.condition}</div>
              <div class="coupon-meta">
                <span class="coupon-deadline">
                  ${isExpired ? '已过期' : `有效期至 ${this.formatDate(userCoupon.expiresAt)}`}
                </span>
                ${coupon.applicableProducts ? 
                  `<span class="applicable-tag">${coupon.applicableProducts[0]}</span>` : ''}
              </div>
            </div>
            ${!isExpired && userCoupon.status !== 'used' ? `
              <div class="coupon-action">
                <button class="claim-btn use-btn" onclick="CouponsSystem.showUseModal('${userCoupon.id}')">
                  立即使用
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 渲染空状态
   */
  renderEmptyState(tab) {
    const messages = {
      'available': {
        icon: '🎫',
        title: '暂无可用优惠券',
        desc: '快去领取更多优惠券吧',
        action: '去领取',
        link: 'coupons.html'
      },
      'used': {
        icon: '✅',
        title: '暂无已使用优惠券',
        desc: '使用优惠券享受优惠',
        action: null,
        link: null
      },
      'expired': {
        icon: '⏰',
        title: '暂无已过期优惠券',
        desc: '过期的优惠券会显示在这里',
        action: null,
        link: null
      }
    };

    const msg = messages[tab];

    return `
      <div class="empty-state">
        <div class="icon">${msg.icon}</div>
        <h3>${msg.title}</h3>
        <p>${msg.desc}</p>
        ${msg.action ? `<a href="${msg.link}" class="action-btn">${msg.action}</a>` : ''}
      </div>
    `;
  },

  /**
   * 更新统计数据
   */
  updateStats() {
    const available = this.getAvailableCoupons();
    const used = this.getUsedCoupons();
    const expired = this.getExpiredCoupons();

    const availableEl = document.getElementById('availableCount');
    const usedEl = document.getElementById('usedCount');
    const expiredEl = document.getElementById('expiredCount');
    const savingsEl = document.getElementById('totalSavings');

    if (availableEl) availableEl.textContent = available.length;
    if (usedEl) usedEl.textContent = used.length;
    if (expiredEl) expiredEl.textContent = expired.length;
    if (savingsEl) savingsEl.textContent = `¥${this.calculateSavings()}`;

    // 更新标签计数
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(item => {
      const tab = item.dataset.tab;
      const countEl = item.querySelector('.count');
      if (countEl) {
        switch (tab) {
          case 'available':
            countEl.textContent = available.length;
            break;
          case 'used':
            countEl.textContent = used.length;
            break;
          case 'expired':
            countEl.textContent = expired.length;
            break;
        }
      }
    });
  },

  /**
   * 绑定优惠券事件
   */
  bindCouponEvents() {
    // 标签切换
    document.querySelectorAll('.tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        window.currentCouponTab = tabName;
        
        // 更新标签样式
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // 渲染列表
        this.renderMyCoupons();
      });
    });
  },

  /**
   * 显示使用弹窗
   */
  showUseModal(userCouponId) {
    const userCoupon = this.getUserCouponById(userCouponId);
    if (!userCoupon || !userCoupon.couponData) return;

    const coupon = userCoupon.couponData;
    
    // 跳转到搜索页面选择产品
    window.location.href = `search.html?couponId=${userCouponId}`;
  },

  /**
   * 显示优惠券详情弹窗
   */
  showCouponDetailModal(couponId) {
    const coupon = this.getCouponById(couponId);
    if (!coupon) return;

    const modal = document.getElementById('couponDetailModal');
    if (!modal) return;

    document.getElementById('modalCouponName').textContent = coupon.name;
    document.getElementById('modalCouponValue').textContent = this.formatCouponValue(coupon);
    document.getElementById('modalCouponCondition').textContent = coupon.condition;
    document.getElementById('modalCouponExpire').textContent = coupon.validUntil;

    modal.classList.add('show');
  },

  /**
   * 关闭弹窗
   */
  closeModal() {
    const modal = document.getElementById('couponDetailModal');
    if (modal) {
      modal.classList.remove('show');
    }
  },

  /**
   * 显示提示信息
   */
  showToast(message, type = 'info') {
    const container = document.querySelector('.toast-container') || this.createToastContainer();
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="icon">${icons[type]}</span>
      <span class="message">${message}</span>
    `;
    
    container.appendChild(toast);

    // 自动移除
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  /**
   * 创建提示容器
   */
  createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  },

  /**
   * 获取统计摘要
   */
  getSummary() {
    return {
      total: this.userCoupons.length,
      available: this.getAvailableCoupons().length,
      used: this.getUsedCoupons().length,
      expired: this.getExpiredCoupons().length,
      expiringSoon: this.getExpiringSoonCoupons().length,
      totalSavings: this.calculateSavings()
    };
  }
};

/**
 * 优惠券领取中心模块
 */
const CouponCenter = {
  config: {
    categoryKey: 'youdao_coupon_category'
  },

  currentCategory: 'all',

  /**
   * 初始化
   */
  async init() {
    await CouponsSystem.loadCouponsData();
    this.loadCategories();
    this.renderCategories();
    this.renderCoupons();
    this.bindEvents();
  },

  /**
   * 加载分类
   */
  loadCategories() {
    this.categories = CouponsSystem.categories;
  },

  /**
   * 渲染分类标签
   */
  renderCategories() {
    const container = document.getElementById('categoryTabs');
    if (!container) return;

    container.innerHTML = this.categories.map(cat => `
      <div class="category-tab ${cat.id === this.currentCategory ? 'active' : ''}" 
           data-category="${cat.id}">
        <span>${cat.icon}</span>
        <span>${cat.name}</span>
        <span class="count">${cat.count}</span>
      </div>
    `).join('');
  },

  /**
   * 渲染优惠券列表
   */
  renderCoupons() {
    const container = document.getElementById('couponGrid');
    if (!container) return;

    // 筛选优惠券
    let coupons = CouponsSystem.coupons;
    if (this.currentCategory !== 'all') {
      coupons = coupons.filter(c => c.type === this.currentCategory);
    }

    // 只显示可领取的
    coupons = coupons.filter(c => {
      if (c.quantity > 0 && c.claimed >= c.quantity) return false;
      if (c.requiresMembership) return false; // 需要特殊会员
      if (c.autoIssue) return false; // 自动发放
      const validUntil = new Date(c.validUntil);
      return validUntil > new Date();
    });

    if (coupons.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">🎫</div>
          <h3>暂无此类优惠券</h3>
          <p>看看其他分类吧</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="coupon-grid">
        ${coupons.map(coupon => this.renderCouponCard(coupon)).join('')}
      </div>
    `;

    this.bindCouponEvents();
  },

  /**
   * 渲染优惠券卡片
   */
  renderCouponCard(coupon) {
    const isClaimed = CouponsSystem.hasClaimed(coupon.id);
    const progress = coupon.quantity > 0 ? (coupon.claimed / coupon.quantity * 100) : 0;
    const remaining = coupon.quantity - coupon.claimed;

    return `
      <div class="coupon-card" data-coupon-id="${coupon.id}">
        <div class="coupon-value-section" style="background: ${coupon.color}">
          <div class="coupon-value">
            ${coupon.type === 'percent' ? 
              `<span class="unit">折</span>${coupon.value}` : 
              coupon.type === 'experience' ? 
                '免费<br>体验' :
                coupon.type === 'exchange' ?
                  '兑换' :
                  `<span class="unit">¥</span>${coupon.value}`
            }
          </div>
          <span class="coupon-type-badge">${CouponsSystem.getCouponTypeName(coupon.type)}</span>
        </div>
        <div class="coupon-info-section">
          <div>
            <div class="coupon-name">${coupon.name}</div>
            <div class="coupon-condition">${coupon.condition}</div>
            <div class="coupon-desc">${coupon.description}</div>
            <div class="coupon-meta">
              <span class="coupon-deadline">有效期至 ${coupon.validUntil}</span>
              ${coupon.quantity > 0 ? `
                <div class="coupon-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                  </div>
                  <span class="progress-text">剩余 ${remaining}</span>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="coupon-action">
            ${isClaimed ? `
              <span class="coupon-claimed">
                <span class="check-icon">✓</span>已领取
              </span>
            ` : `
              <button class="claim-btn" onclick="CouponCenter.claimCoupon('${coupon.id}')">
                立即领取
              </button>
            `}
            <button class="detail-btn" onclick="CouponCenter.showCouponDetail('${coupon.id}')">
              详情
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 领取优惠券
   */
  claimCoupon(couponId) {
    const btn = document.querySelector(`[data-coupon-id="${couponId}"] .claim-btn`);
    if (btn) {
      btn.classList.add('claiming');
      setTimeout(() => btn.classList.remove('claiming'), 500);
    }

    const success = CouponsSystem.claimCoupon(couponId);
    
    if (success) {
      // 更新按钮状态
      setTimeout(() => {
        this.renderCoupons();
      }, 500);
    }
  },

  /**
   * 显示优惠券详情
   */
  showCouponDetail(couponId) {
    const coupon = CouponsSystem.getCouponById(couponId);
    if (!coupon) return;

    const modal = document.getElementById('couponDetailModal');
    if (!modal) return;

    // 填充详情
    document.getElementById('modalCouponName').textContent = coupon.name;
    document.getElementById('modalCouponValue').textContent = CouponsSystem.formatCouponValue(coupon);
    document.getElementById('modalCouponCondition').textContent = coupon.condition;
    document.getElementById('modalCouponExpire').textContent = coupon.validUntil;

    // 填充规则
    const rulesList = document.getElementById('modalCouponRules');
    if (rulesList) {
      rulesList.innerHTML = coupon.rules.map(rule => `<li>${rule}</li>`).join('');
    }

    // 显示/隐藏领取按钮
    const claimBtn = document.getElementById('modalClaimBtn');
    if (claimBtn) {
      if (CouponsSystem.hasClaimed(couponId)) {
        claimBtn.textContent = '已领取';
        claimBtn.disabled = true;
      } else {
        claimBtn.textContent = '立即领取';
        claimBtn.disabled = false;
        claimBtn.onclick = () => {
          this.claimCoupon(couponId);
          CouponsSystem.closeModal();
          setTimeout(() => this.renderCoupons(), 300);
        };
      }
    }

    modal.classList.add('show');
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    // 分类切换
    document.getElementById('categoryTabs')?.addEventListener('click', (e) => {
      const tab = e.target.closest('.category-tab');
      if (!tab) return;

      const category = tab.dataset.category;
      this.currentCategory = category;

      // 更新样式
      document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // 渲染列表
      this.renderCoupons();
    });

    // 关闭弹窗
    document.getElementById('couponDetailModal')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('coupon-modal-overlay') || 
          e.target.classList.contains('close-btn')) {
        CouponsSystem.closeModal();
      }
    });
  },

  /**
   * 绑定优惠券事件
   */
  bindCouponEvents() {
    // 详情按钮等已在HTML中绑定
  }
};

// 导出模块
window.CouponsSystem = CouponsSystem;
window.CouponCenter = CouponCenter;
