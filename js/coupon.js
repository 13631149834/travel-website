/**
 * 优惠券模块
 * 功能：优惠券领取、使用、我的优惠券管理
 */

const CouponModule = {
  // 存储键名
  STORAGE_KEY: 'youdao_coupons',
  CLAIMED_KEY: 'youdao_claimed_coupons',
  
  // 优惠券数据
  coupons: [
    { id: 'c001', value: 100, condition: '满500元可用', expire: '2026-06-30', type: 'discount', desc: '新人专享优惠券' },
    { id: 'c002', value: 200, condition: '满1000元可用', expire: '2026-06-30', type: 'discount', desc: '满千减二百' },
    { id: 'c003', value: 8, condition: '无门槛使用', expire: '2026-05-31', type: 'percent', desc: '八折优惠券' },
    { id: 'c004', value: 50, condition: '新人专享', expire: '2026-12-31', type: 'discount', desc: '新人首单礼' },
    { id: 'c005', value: 150, condition: '满800元可用', expire: '2026-05-15', type: 'discount', desc: '周末出行优惠' },
    { id: 'c006', value: 300, condition: '满1500元可用', expire: '2026-06-30', type: 'discount', desc: '长途旅行优惠' },
    { id: 'c007', value: 9, condition: '无门槛使用', expire: '2026-04-30', type: 'percent', desc: '九折通用券' },
    { id: 'c008', value: 80, condition: '满400元可用', expire: '2026-05-20', type: 'discount', desc: '母亲节专属' }
  ],
  
  // 初始化
  init() {
    this.loadClaimedCoupons();
    this.renderMyCoupons();
    this.bindEvents();
  },
  
  // 初始化我的优惠券（从localStorage加载已领取的）
  initMyCoupons() {
    this.loadClaimedCoupons();
    this.renderMyCoupons();
  },
  
  // 加载已领取的优惠券
  loadClaimedCoupons() {
    try {
      const claimed = localStorage.getItem(this.CLAIMED_KEY);
      this.claimedCoupons = claimed ? JSON.parse(claimed) : [];
    } catch (e) {
      this.claimedCoupons = [];
    }
  },
  
  // 保存已领取的优惠券
  saveClaimedCoupons() {
    localStorage.setItem(this.CLAIMED_KEY, JSON.stringify(this.claimedCoupons));
  },
  
  // 领取优惠券
  claimCoupon(couponId, value) {
    // 检查是否已领取
    if (this.isCouponClaimed(couponId)) {
      this.showToast('您已领取过此优惠券', 'warning');
      return;
    }
    
    // 检查是否过期
    const coupon = this.coupons.find(c => c.id === couponId);
    if (!coupon) return;
    
    const expireDate = new Date(coupon.expire);
    if (expireDate < new Date()) {
      this.showToast('此优惠券已过期', 'error');
      return;
    }
    
    // 添加到已领取列表
    const claimedCoupon = {
      ...coupon,
      claimedAt: new Date().toISOString(),
      status: 'available'
    };
    
    this.claimedCoupons.push(claimedCoupon);
    this.saveClaimedCoupons();
    
    // 更新UI
    const couponCard = document.querySelector(`[data-coupon-id="${couponId}"]`);
    if (couponCard) {
      const btn = couponCard.querySelector('.coupon-claim-btn');
      if (btn) {
        btn.textContent = '已领取';
        btn.classList.add('coupon-claimed');
        btn.disabled = true;
        btn.onclick = null;
      }
    }
    
    this.showToast(`恭喜！成功领取 ${value}元优惠券`, 'success');
    
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('couponClaimed', { detail: claimedCoupon }));
  },
  
  // 检查优惠券是否已领取
  isCouponClaimed(couponId) {
    return this.claimedCoupons.some(c => c.id === couponId);
  },
  
  // 使用优惠券
  useCoupon(couponId, orderAmount) {
    const coupon = this.claimedCoupons.find(c => c.id === couponId);
    if (!coupon) {
      this.showToast('优惠券不存在', 'error');
      return null;
    }
    
    if (coupon.status !== 'available') {
      this.showToast('此优惠券不可用', 'error');
      return null;
    }
    
    // 检查有效期
    const expireDate = new Date(coupon.expire);
    if (expireDate < new Date()) {
      this.showToast('优惠券已过期', 'error');
      return null;
    }
    
    // 检查使用条件
    const conditionAmount = parseInt(coupon.condition.replace(/[^0-9]/g, '')) || 0;
    if (conditionAmount > 0 && orderAmount < conditionAmount) {
      this.showToast(`订单金额需满${conditionAmount}元才能使用此优惠券`, 'warning');
      return null;
    }
    
    // 计算优惠金额
    let discount = 0;
    if (coupon.type === 'percent') {
      discount = orderAmount * (1 - coupon.value / 10);
    } else {
      discount = coupon.value;
    }
    
    // 确保优惠不超过订单金额
    discount = Math.min(discount, orderAmount);
    
    // 更新优惠券状态
    coupon.status = 'used';
    coupon.usedAt = new Date().toISOString();
    coupon.usedOrder = orderAmount;
    this.saveClaimedCoupons();
    
    this.showToast(`成功使用优惠券，节省${Math.round(discount)}元`, 'success');
    
    return {
      discount: Math.round(discount),
      coupon: coupon
    };
  },
  
  // 获取可用优惠券
  getAvailableCoupons() {
    const now = new Date();
    return this.claimedCoupons.filter(c => {
      if (c.status !== 'available') return false;
      const expireDate = new Date(c.expire);
      return expireDate >= now;
    });
  },
  
  // 获取已使用优惠券
  getUsedCoupons() {
    return this.claimedCoupons.filter(c => c.status === 'used');
  },
  
  // 获取已过期优惠券
  getExpiredCoupons() {
    const now = new Date();
    return this.claimedCoupons.filter(c => {
      if (c.status !== 'available') return false;
      const expireDate = new Date(c.expire);
      return expireDate < now;
    });
  },
  
  // 计算订单可用的最优优惠券
  calculateBestCoupon(orderAmount) {
    const available = this.getAvailableCoupons();
    let bestCoupon = null;
    let bestDiscount = 0;
    
    available.forEach(coupon => {
      // 检查使用条件
      const conditionAmount = parseInt(coupon.condition.replace(/[^0-9]/g, '')) || 0;
      if (conditionAmount > 0 && orderAmount < conditionAmount) return;
      
      // 计算优惠
      let discount = 0;
      if (coupon.type === 'percent') {
        discount = orderAmount * (1 - coupon.value / 10);
      } else {
        discount = coupon.value;
      }
      
      if (discount > bestDiscount) {
        bestDiscount = discount;
        bestCoupon = coupon;
      }
    });
    
    return bestCoupon ? { ...bestCoupon, discount: Math.round(bestDiscount) } : null;
  },
  
  // 渲染我的优惠券列表
  renderMyCoupons() {
    const container = document.getElementById('myCouponsList');
    if (!container) return;
    
    const available = this.getAvailableCoupons();
    const used = this.getUsedCoupons();
    const expired = this.getExpiredCoupons();
    
    let html = '';
    
    // 可用优惠券
    if (available.length > 0) {
      html += '<div class="coupon-list-section"><h3>可用优惠券 (' + available.length + ')</h3>';
      html += '<div class="coupon-list-grid">';
      available.forEach(coupon => {
        html += this.renderCouponCard(coupon, 'available');
      });
      html += '</div></div>';
    }
    
    // 已使用优惠券
    if (used.length > 0) {
      html += '<div class="coupon-list-section"><h3>已使用 (' + used.length + ')</h3>';
      html += '<div class="coupon-list-grid">';
      used.forEach(coupon => {
        html += this.renderCouponCard(coupon, 'used');
      });
      html += '</div></div>';
    }
    
    // 已过期优惠券
    if (expired.length > 0) {
      html += '<div class="coupon-list-section"><h3>已过期 (' + expired.length + ')</h3>';
      html += '<div class="coupon-list-grid">';
      expired.forEach(coupon => {
        html += this.renderCouponCard(coupon, 'expired');
      });
      html += '</div></div>';
    }
    
    if (this.claimedCoupons.length === 0) {
      html = '<div class="empty-state"><p>您还没有领取任何优惠券</p><a href="promotions.html" class="btn btn-primary">去领取</a></div>';
    }
    
    container.innerHTML = html;
  },
  
  // 渲染单个优惠券卡片
  renderCouponCard(coupon, status = 'available') {
    const statusClass = status === 'available' ? '' : (status === 'used' ? 'used' : 'expired');
    const valueDisplay = coupon.type === 'percent' ? `${coupon.value}折` : `${coupon.value}元`;
    const statusText = status === 'available' ? '待使用' : (status === 'used' ? '已使用' : '已过期');
    
    return `
      <div class="coupon-item ${statusClass}" data-coupon-id="${coupon.id}">
        <div class="coupon-item-left">
          <div class="coupon-value-display">${valueDisplay}</div>
          <div class="coupon-condition-display">${coupon.condition}</div>
        </div>
        <div class="coupon-item-right">
          <div class="coupon-name">${coupon.desc}</div>
          <div class="coupon-expire">有效期至 ${coupon.expire}</div>
          <div class="coupon-status">${statusText}</div>
          ${status === 'available' ? '<button class="coupon-use-btn" onclick="CouponModule.showUseDialog(\'' + coupon.id + '\')">立即使用</button>' : ''}
        </div>
      </div>
    `;
  },
  
  // 显示使用优惠券对话框
  showUseDialog(couponId) {
    const amount = prompt('请输入订单金额（元）：');
    if (!amount || isNaN(parseFloat(amount))) {
      this.showToast('请输入有效的订单金额', 'warning');
      return;
    }
    
    const result = this.useCoupon(couponId, parseFloat(amount));
    if (result) {
      // 刷新列表
      this.renderMyCoupons();
    }
  },
  
  // 绑定事件
  bindEvents() {
    // 监听优惠券领取事件
    window.addEventListener('couponClaimed', (e) => {
      console.log('优惠券领取成功:', e.detail);
    });
  },
  
  // 显示提示消息
  showToast(message, type = 'info') {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `coupon-toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : (type === 'error' ? '✕' : (type === 'warning' ? '!' : 'i'))}</span>
      <span class="toast-message">${message}</span>
    `;
    
    // 添加样式
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : (type === 'warning' ? '#f59e0b' : '#4F86F7'))};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 10000;
      animation: slideDown 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // 添加动画样式
    if (!document.getElementById('toast-animation-style')) {
      const style = document.createElement('style');
      style.id = 'toast-animation-style';
      style.textContent = `
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // 3秒后移除
    setTimeout(() => {
      toast.style.animation = 'slideUp 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },
  
  // 导出数据（用于调试或备份）
  exportCoupons() {
    return {
      claimed: this.claimedCoupons,
      exportTime: new Date().toISOString()
    };
  },
  
  // 导入数据（用于恢复）
  importCoupons(data) {
    if (data && Array.isArray(data.claimed)) {
      this.claimedCoupons = data.claimed;
      this.saveClaimedCoupons();
      this.renderMyCoupons();
      return true;
    }
    return false;
  },
  
  // 清空所有优惠券（测试用）
  clearAllCoupons() {
    if (confirm('确定要清空所有已领取的优惠券吗？')) {
      this.claimedCoupons = [];
      this.saveClaimedCoupons();
      this.renderMyCoupons();
      this.showToast('已清空所有优惠券', 'info');
    }
  }
};

// 如果在支持模块化的环境中
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CouponModule;
}
