/**
 * 游导旅游 - 支付流程控制器
 * @description 管理支付流程的完整生命周期
 */

const PaymentFlow = {
  // 当前支付状态
  state: {
    orderId: null,
    amount: 0,
    paymentMethod: null,
    couponCode: null,
    discount: 0,
    status: 'idle', // idle | pending | processing | success | failed | timeout | cancelled
    startTime: null,
    countdown: 900, // 15分钟倒计时
    timer: null,
    paymentData: null,
  },

  // 支付方式配置
  paymentMethods: {
    wechat: {
      id: 'wechat',
      name: '微信支付',
      icon: '💙',
      color: '#E7F3FF',
      description: '推荐',
      type: 'qrcode',
      minAmount: 0.01,
      maxAmount: 50000,
      fee: 0
    },
    alipay: {
      id: 'alipay',
      name: '支付宝',
      icon: '💚',
      color: '#FFF5E6',
      description: '安全快捷',
      type: 'qrcode',
      minAmount: 0.01,
      maxAmount: 100000,
      fee: 0
    },
    bank: {
      id: 'bank',
      name: '银行卡',
      icon: '💳',
      color: '#F0F0F0',
      description: '支持主流银行卡',
      type: 'form',
      minAmount: 1,
      maxAmount: 100000,
      fee: 0
    },
    balance: {
      id: 'balance',
      name: '余额支付',
      icon: '💰',
      color: '#FEF3C7',
      description: '使用账户余额',
      type: 'direct',
      minAmount: 0.01,
      maxAmount: null,
      fee: 0,
      requirePassword: true
    },
    points: {
      id: 'points',
      name: '积分兑换',
      icon: '⭐',
      color: '#EDE9FE',
      description: '使用积分抵扣',
      type: 'direct',
      minAmount: 0,
      maxAmount: null,
      fee: 0,
      exchangeRate: 100 // 100积分=1元
    }
  },

  // 回调函数
  callbacks: {
    onStatusChange: null,
    onCountdownChange: null,
    onPaymentComplete: null,
    onError: null
  },

  /**
   * 初始化支付流程
   * @param {Object} options - 配置选项
   */
  init(options = {}) {
    // 合并配置
    if (options.callbacks) {
      Object.assign(this.callbacks, options.callbacks);
    }

    // 从URL参数获取订单信息
    const urlParams = new URLSearchParams(window.location.search);
    this.state.orderId = urlParams.get('orderId') || this.generateOrderId();
    this.state.amount = parseFloat(urlParams.get('amount')) || 0;
    this.state.countdown = parseInt(urlParams.get('timeout')) || 900;

    // 加载保存的支付状态
    this.loadState();

    // 启动倒计时
    this.startCountdown();

    console.log('支付流程已初始化', this.state);
    return this;
  },

  /**
   * 生成订单号
   */
  generateOrderId() {
    const date = new Date();
    const prefix = 'YD' + date.getFullYear() + 
      String(date.getMonth() + 1).padStart(2, '0') + 
      String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString().slice(2, 8);
    return prefix + random;
  },

  /**
   * 选择支付方式
   * @param {string} methodId - 支付方式ID
   */
  selectPaymentMethod(methodId) {
    const method = this.paymentMethods[methodId];
    if (!method) {
      this.handleError('不支持的支付方式');
      return false;
    }

    // 检查金额限制
    if (method.minAmount && this.state.amount < method.minAmount) {
      this.handleError(`该支付方式最低需要 ${method.minAmount} 元`);
      return false;
    }
    if (method.maxAmount && this.state.amount > method.maxAmount) {
      this.handleError(`该支付方式最高支持 ${method.maxAmount} 元`);
      return false;
    }

    this.state.paymentMethod = methodId;
    this.saveState();
    this.updatePaymentUI(method);
    return true;
  },

  /**
   * 更新支付UI
   */
  updatePaymentUI(method) {
    // 更新二维码区域
    const qrcodeSection = document.getElementById('qrcodeSection');
    if (qrcodeSection) {
      const tips = {
        wechat: { icon: '💙', name: '微信', action: '打开微信 → 扫一扫 → 扫描上方二维码' },
        alipay: { icon: '💚', name: '支付宝', action: '打开支付宝 → 扫一扫 → 扫描上方二维码' },
        bank: { icon: '💳', name: '银行卡', action: '请使用银行APP扫码支付' },
        balance: { icon: '💰', name: '余额', action: '确认后直接扣款' },
        points: { icon: '⭐', name: '积分', action: '使用积分兑换抵扣' }
      };

      if (method.type === 'qrcode') {
        qrcodeSection.innerHTML = `
          <div class="qrcode-container">
            <div class="qrcode-placeholder">${method.icon}</div>
          </div>
          <div class="qrcode-tip">
            请使用 <strong>${method.name}</strong> 扫描二维码完成支付
          </div>
          <div class="qrcode-action">${tips[methodId]?.action || ''}</div>
        `;
      } else if (method.type === 'direct') {
        qrcodeSection.innerHTML = `
          <div class="payment-direct-info">
            <div class="direct-icon">${method.icon}</div>
            <div class="direct-desc">${method.description}</div>
          </div>
        `;
      } else if (method.type === 'form') {
        qrcodeSection.innerHTML = `
          <div class="payment-form-container">
            <div class="bank-card-form">
              <div class="form-group">
                <label>持卡人姓名</label>
                <input type="text" id="cardName" placeholder="请输入持卡人姓名" maxlength="20">
              </div>
              <div class="form-group">
                <label>卡号</label>
                <input type="text" id="cardNumber" placeholder="请输入银行卡号" maxlength="19">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>有效期</label>
                  <input type="text" id="cardExpiry" placeholder="MM/YY" maxlength="5">
                </div>
                <div class="form-group">
                  <label>CVN</label>
                  <input type="password" id="cardCVN" placeholder="卡背面末3位" maxlength="3">
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }

    // 更新支付按钮文本
    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
      const finalAmount = this.getFinalAmount();
      payBtn.textContent = `确认支付 ¥${finalAmount.toFixed(2)}`;
    }

    // 触发状态变化回调
    this.triggerCallback('onStatusChange', { status: 'method_selected', method: methodId });
  },

  /**
   * 应用优惠券
   * @param {string} couponCode - 优惠券码
   * @returns {Promise<Object>}
   */
  async applyCoupon(couponCode) {
    if (!couponCode) {
      return { success: false, message: '请输入优惠券码' };
    }

    // 模拟优惠券验证
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟几种优惠券
        const coupons = {
          'SAVE10': { type: 'fixed', value: 10, desc: '立减10元' },
          'SAVE20': { type: 'fixed', value: 20, desc: '立减20元' },
          'HALF': { type: 'percent', value: 50, max: 100, desc: '5折优惠(最高减100元)' },
          'NEWUSER': { type: 'fixed', value: 50, desc: '新用户专享50元' },
          'VIP': { type: 'percent', value: 80, max: 200, desc: 'VIP8折(最高减200元)' }
        };

        const coupon = coupons[couponCode.toUpperCase()];
        if (!coupon) {
          resolve({ success: false, message: '优惠券码无效或已过期' });
          return;
        }

        // 检查是否满足使用条件
        if (coupon.type === 'fixed' && coupon.value > this.state.amount) {
          resolve({ success: false, message: '订单金额低于优惠券最低使用金额' });
          return;
        }

        // 计算折扣
        let discount = 0;
        if (coupon.type === 'fixed') {
          discount = coupon.value;
        } else {
          discount = Math.min(this.state.amount * (1 - coupon.value / 100), coupon.max);
        }

        this.state.couponCode = couponCode.toUpperCase();
        this.state.discount = discount;
        this.saveState();
        this.updateDiscountUI(discount, coupon.desc);

        resolve({ success: true, message: coupon.desc, discount });
      }, 500);
    });
  },

  /**
   * 移除优惠券
   */
  removeCoupon() {
    this.state.couponCode = null;
    this.state.discount = 0;
    this.saveState();
    this.updateDiscountUI(0, '');
  },

  /**
   * 更新折扣显示
   */
  updateDiscountUI(discount, desc) {
    const discountSection = document.getElementById('discountSection');
    const finalAmountEl = document.getElementById('finalAmount');
    const payBtn = document.getElementById('payBtn');

    if (discountSection) {
      if (discount > 0) {
        discountSection.innerHTML = `
          <div class="discount-row">
            <span class="discount-label">优惠券</span>
            <span class="discount-value">-${discount.toFixed(2)}</span>
          </div>
          <div class="discount-desc">${desc}</div>
        `;
        discountSection.style.display = 'block';
      } else {
        discountSection.style.display = 'none';
      }
    }

    const finalAmount = this.getFinalAmount();
    if (finalAmountEl) {
      finalAmountEl.textContent = '¥' + finalAmount.toFixed(2);
    }
    if (payBtn) {
      payBtn.textContent = `确认支付 ¥${finalAmount.toFixed(2)}`;
    }
  },

  /**
   * 获取最终金额
   */
  getFinalAmount() {
    return Math.max(0, this.state.amount - this.state.discount);
  },

  /**
   * 启动倒计时
   */
  startCountdown() {
    if (this.state.timer) {
      clearInterval(this.state.timer);
    }

    this.state.startTime = Date.now();
    this.state.timer = setInterval(() => {
      this.state.countdown--;

      // 更新显示
      const minutes = Math.floor(this.state.countdown / 60);
      const seconds = this.state.countdown % 60;
      
      const minutesEl = document.getElementById('minutes');
      const secondsEl = document.getElementById('seconds');
      const warningMsg = document.getElementById('warningMsg');

      if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
      if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');

      // 3分钟警告
      if (this.state.countdown === 180 && warningMsg) {
        warningMsg.style.display = 'flex';
      }

      // 1分钟警告
      if (this.state.countdown === 60 && warningMsg) {
        warningMsg.innerHTML = '⏰ 支付时间即将到期，请立即完成支付！';
        warningMsg.style.background = '#FEE2E2';
        warningMsg.style.color = '#991B1B';
      }

      // 超时
      if (this.state.countdown <= 0) {
        this.handleTimeout();
      }

      // 触发回调
      if (this.callbacks.onCountdownChange) {
        this.callbacks.onCountdownChange(this.state.countdown);
      }
    }, 1000);
  },

  /**
   * 停止倒计时
   */
  stopCountdown() {
    if (this.state.timer) {
      clearInterval(this.state.timer);
      this.state.timer = null;
    }
  },

  /**
   * 处理超时
   */
  handleTimeout() {
    this.stopCountdown();
    this.state.status = 'timeout';
    this.saveState();

    // 更新UI
    const countdownEl = document.getElementById('countdown');
    const payBtn = document.getElementById('payBtn');
    const qrcodeSection = document.getElementById('qrcodeSection');

    if (countdownEl) {
      countdownEl.innerHTML = '<span style="color: #EF4444;">已过期</span>';
    }
    if (payBtn) {
      payBtn.disabled = true;
      payBtn.textContent = '订单已过期';
    }
    if (qrcodeSection) {
      qrcodeSection.innerHTML = `
        <div class="payment-status">
          <div class="status-icon error">⏰</div>
          <div class="status-text" style="color: #EF4444;">订单已超时</div>
          <div class="status-desc">请返回重新下单</div>
        </div>
      `;
    }

    this.triggerCallback('onStatusChange', { status: 'timeout' });
  },

  /**
   * 执行支付
   */
  async executePayment() {
    if (this.state.countdown <= 0) {
      this.handleError('订单已超时');
      return { success: false, message: '订单已超时' };
    }

    if (!this.state.paymentMethod) {
      this.handleError('请选择支付方式');
      return { success: false, message: '请选择支付方式' };
    }

    this.state.status = 'processing';
    this.saveState();

    // 更新按钮状态
    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
      payBtn.disabled = true;
      payBtn.textContent = '支付中...';
    }

    try {
      // 风险检测
      const riskResult = await PaymentSecurity.performRiskCheck({
        amount: this.state.amount,
        method: this.state.paymentMethod
      });

      if (riskResult.requiresVerification && !PaymentSecurity.isVerified()) {
        // 需要额外验证
        this.state.status = 'pending';
        return {
          success: false,
          type: 'verification_required',
          message: '需要进行安全验证',
          riskResult
        };
      }

      // 根据支付方式执行
      const method = this.paymentMethods[this.state.paymentMethod];
      let result;

      switch (method.type) {
        case 'qrcode':
          result = await this.processQRCodePayment();
          break;
        case 'direct':
          result = await this.processDirectPayment();
          break;
        case 'form':
          result = await this.processBankCardPayment();
          break;
        default:
          result = await this.processDirectPayment();
      }

      if (result.success) {
        this.handlePaymentSuccess(result);
      } else {
        this.handlePaymentFailed(result);
      }

      return result;

    } catch (error) {
      this.handleError(error.message || '支付失败，请重试');
      return { success: false, message: error.message || '支付失败' };
    }
  },

  /**
   * 处理二维码支付
   */
  async processQRCodePayment() {
    return new Promise((resolve) => {
      // 模拟生成支付二维码
      const qrData = {
        orderId: this.state.orderId,
        amount: this.getFinalAmount(),
        method: this.state.paymentMethod,
        timestamp: Date.now()
      };

      console.log('生成支付二维码:', qrData);

      // 模拟支付等待（实际应该轮询支付状态）
      setTimeout(() => {
        // 模拟成功
        resolve({ success: true, message: '支付成功' });
      }, 2000);
    });
  },

  /**
   * 处理直接支付
   */
  async processDirectPayment() {
    const method = this.paymentMethods[this.state.paymentMethod];

    // 余额支付需要验证密码
    if (method.requirePassword) {
      // 弹出密码验证
      return this.requestPasswordVerification();
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: '支付成功' });
      }, 1000);
    });
  },

  /**
   * 处理银行卡支付
   */
  async processBankCardPayment() {
    // 验证表单
    const cardName = document.getElementById('cardName')?.value;
    const cardNumber = document.getElementById('cardNumber')?.value;
    const cardExpiry = document.getElementById('cardExpiry')?.value;
    const cardCVN = document.getElementById('cardCVN')?.value;

    if (!cardName || !cardNumber || !cardExpiry || !cardCVN) {
      return { success: false, message: '请填写完整的银行卡信息' };
    }

    // 简单验证
    if (!/^\d{16,19}$/.test(cardNumber.replace(/\s/g, ''))) {
      return { success: false, message: '银行卡号格式不正确' };
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: '支付成功' });
      }, 1500);
    });
  },

  /**
   * 请求密码验证
   */
  async requestPasswordVerification() {
    return {
      success: false,
      type: 'password_required',
      message: '请输入支付密码'
    };
  },

  /**
   * 处理支付成功
   */
  handlePaymentSuccess(result) {
    this.stopCountdown();
    this.state.status = 'success';
    this.saveState();

    // 记录支付历史
    this.recordPaymentHistory();

    // 触发回调
    this.triggerCallback('onPaymentComplete', { success: true, result });

    // 跳转到成功页面
    setTimeout(() => {
      window.location.href = `payment-result.html?status=success&orderId=${this.state.orderId}&amount=${this.getFinalAmount()}`;
    }, 500);
  },

  /**
   * 处理支付失败
   */
  handlePaymentFailed(result) {
    this.state.status = 'failed';
    this.saveState();

    // 恢复按钮
    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.textContent = `确认支付 ¥${this.getFinalAmount().toFixed(2)}`;
    }

    // 触发回调
    if (this.callbacks.onError) {
      this.callbacks.onError(result.message);
    }

    // 显示错误
    this.showPaymentError(result.message);
  },

  /**
   * 取消支付
   */
  cancelPayment() {
    if (this.state.status === 'processing') {
      if (!confirm('支付正在进行中，确定要取消吗？')) {
        return false;
      }
    }

    this.stopCountdown();
    this.state.status = 'cancelled';
    this.saveState();

    this.triggerCallback('onStatusChange', { status: 'cancelled' });
    window.location.href = 'order-confirm.html';
    return true;
  },

  /**
   * 重试支付
   */
  retryPayment() {
    this.state.status = 'idle';
    this.state.paymentMethod = null;
    this.state.countdown = 900;
    this.saveState();

    // 重置UI
    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.textContent = '请选择支付方式';
    }

    // 重新开始倒计时
    this.startCountdown();

    // 重新加载页面以重置支付方式选择
    window.location.reload();
  },

  /**
   * 记录支付历史
   */
  recordPaymentHistory() {
    const history = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
    history.unshift({
      orderId: this.state.orderId,
      amount: this.getFinalAmount(),
      originalAmount: this.state.amount,
      discount: this.state.discount,
      method: this.state.paymentMethod,
      time: Date.now(),
      status: 'success'
    });
    // 只保留最近50条
    localStorage.setItem('paymentHistory', JSON.stringify(history.slice(0, 50)));
  },

  /**
   * 获取支付历史
   */
  getPaymentHistory() {
    return JSON.parse(localStorage.getItem('paymentHistory') || '[]');
  },

  /**
   * 保存状态
   */
  saveState() {
    try {
      localStorage.setItem('paymentFlowState', JSON.stringify({
        orderId: this.state.orderId,
        amount: this.state.amount,
        paymentMethod: this.state.paymentMethod,
        couponCode: this.state.couponCode,
        discount: this.state.discount,
        status: this.state.status,
        countdown: this.state.countdown
      }));
    } catch (e) {
      console.warn('无法保存支付状态');
    }
  },

  /**
   * 加载状态
   */
  loadState() {
    try {
      const saved = localStorage.getItem('paymentFlowState');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 检查订单号是否匹配
        if (parsed.orderId === this.state.orderId) {
          // 恢复状态
          this.state.paymentMethod = parsed.paymentMethod;
          this.state.couponCode = parsed.couponCode;
          this.state.discount = parsed.discount;
          this.state.status = parsed.status;
        }
      }
    } catch (e) {
      console.warn('无法加载支付状态');
    }
  },

  /**
   * 显示错误信息
   */
  showPaymentError(message) {
    // 创建toast
    const toast = document.createElement('div');
    toast.className = 'payment-toast error';
    toast.innerHTML = `
      <span class="toast-icon">❌</span>
      <span class="toast-message">${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  /**
   * 处理错误
   */
  handleError(message) {
    console.error('支付错误:', message);
    this.showPaymentError(message);
    if (this.callbacks.onError) {
      this.callbacks.onError(message);
    }
  },

  /**
   * 触发回调
   */
  triggerCallback(name, data) {
    if (this.callbacks[name]) {
      this.callbacks[name](data);
    }
  },

  /**
   * 申请退款
   * @param {Object} options - 退款选项
   */
  async applyRefund(options = {}) {
    const refundData = {
      orderId: options.orderId || this.state.orderId,
      amount: options.amount || this.getFinalAmount(),
      reason: options.reason || '',
      type: options.type || 'normal' // normal | quick
    };

    // 保存退款申请
    const refunds = JSON.parse(localStorage.getItem('refundApplications') || '[]');
    refunds.unshift({
      ...refundData,
      id: 'REF' + Date.now(),
      status: 'pending',
      applyTime: Date.now(),
      estimatedTime: Date.now() + 3 * 24 * 60 * 60 * 1000 // 3天后
    });
    localStorage.setItem('refundApplications', JSON.stringify(refunds.slice(0, 20)));

    return {
      success: true,
      refundId: refunds[0].id,
      message: '退款申请已提交'
    };
  },

  /**
   * 获取退款状态
   */
  getRefundStatus(refundId) {
    const refunds = JSON.parse(localStorage.getItem('refundApplications') || '[]');
    return refunds.find(r => r.id === refundId) || null;
  },

  /**
   * 获取所有退款记录
   */
  getAllRefunds() {
    return JSON.parse(localStorage.getItem('refundApplications') || '[]');
  }
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  // 暴露到全局
  window.PaymentFlow = PaymentFlow;
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaymentFlow;
}
