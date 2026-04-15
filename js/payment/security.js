/**
 * 游导旅游 - 支付安全模块
 * @description 提供支付密码、短信验证、风险检测、反欺诈等功能
 */

const PaymentSecurity = {
  // 配置
  config: {
    enablePassword: true,
    enableSMS: true,
    enableRiskCheck: true,
    maxAttempts: 3,
    lockoutDuration: 300000, // 5分钟
    smsCodeLength: 6,
    smsCodeExpiry: 120, // 2分钟
  },

  // 状态
  state: {
    isVerified: false,
    attempts: 0,
    lockedUntil: null,
    lastRiskScore: 0,
  },

  /**
   * 初始化安全模块
   */
  init() {
    this.loadState();
    this.checkLockout();
    this.setupRiskMonitoring();
  },

  /**
   * 从本地存储加载状态
   */
  loadState() {
    try {
      const saved = localStorage.getItem('paymentSecurityState');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state.attempts = parsed.attempts || 0;
        this.state.lockedUntil = parsed.lockedUntil ? new Date(parsed.lockedUntil) : null;
      }
    } catch (e) {
      console.warn('无法加载支付安全状态');
    }
  },

  /**
   * 保存状态到本地存储
   */
  saveState() {
    try {
      localStorage.setItem('paymentSecurityState', JSON.stringify({
        attempts: this.state.attempts,
        lockedUntil: this.state.lockedUntil,
      }));
    } catch (e) {
      console.warn('无法保存支付安全状态');
    }
  },

  /**
   * 检查是否被锁定
   */
  checkLockout() {
    if (this.state.lockedUntil && new Date() < this.state.lockedUntil) {
      const remaining = Math.ceil((this.state.lockedUntil - new Date()) / 1000);
      return {
        locked: true,
        remainingSeconds: remaining,
        message: `支付功能已锁定，请在 ${Math.ceil(remaining / 60)} 分钟后重试`
      };
    }
    this.state.lockedUntil = null;
    return { locked: false };
  },

  /**
   * 锁定支付功能
   */
  lock() {
    this.state.lockedUntil = new Date(Date.now() + this.config.lockoutDuration);
    this.state.attempts = 0;
    this.saveState();
  },

  /**
   * 重置尝试次数
   */
  resetAttempts() {
    this.state.attempts = 0;
    this.state.lockedUntil = null;
    this.saveState();
  },

  /**
   * 增加尝试次数
   */
  incrementAttempts() {
    this.state.attempts++;
    this.saveState();
    if (this.state.attempts >= this.config.maxAttempts) {
      this.lock();
      return true; // 已锁定
    }
    return false;
  },

  // ==================== 支付密码 ====================

  /**
   * 验证支付密码
   * @param {string} password - 输入的密码
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async verifyPassword(password) {
    const lockStatus = this.checkLockout();
    if (lockStatus.locked) {
      return { success: false, message: lockStatus.message };
    }

    // 模拟密码验证（实际应该调用后端API）
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟：123456 为正确密码
        if (password === '123456') {
          this.resetAttempts();
          this.state.isVerified = true;
          resolve({ success: true, message: '支付密码验证成功' });
        } else {
          const isLocked = this.incrementAttempts();
          const remaining = this.config.maxAttempts - this.state.attempts;
          if (isLocked) {
            resolve({ 
              success: false, 
              message: '支付密码错误次数过多，账户已锁定5分钟',
              locked: true
            });
          } else {
            resolve({ 
              success: false, 
              message: `支付密码错误，剩余 ${remaining} 次尝试机会`,
              attempts: remaining
            });
          }
        }
      }, 500);
    });
  },

  /**
   * 设置支付密码
   * @param {string} password - 新密码
   * @param {string} confirmPassword - 确认密码
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async setPassword(password, confirmPassword) {
    if (password.length < 6 || password.length > 20) {
      return { success: false, message: '密码长度需在6-20位之间' };
    }
    if (!/^\d+$/.test(password)) {
      return { success: false, message: '密码必须全部为数字' };
    }
    if (password === '123456') {
      return { success: false, message: '不能使用过于简单的密码' };
    }
    if (password !== confirmPassword) {
      return { success: false, message: '两次输入的密码不一致' };
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('userPaymentPassword', this.hashPassword(password));
        resolve({ success: true, message: '支付密码设置成功' });
      }, 500);
    });
  },

  /**
   * 修改支付密码
   */
  async changePassword(oldPassword, newPassword) {
    const verifyResult = await this.verifyPassword(oldPassword);
    if (!verifyResult.success) {
      return { success: false, message: '原密码验证失败' };
    }
    return this.setPassword(newPassword, newPassword);
  },

  /**
   * 简单密码哈希（实际应使用更安全的方式）
   */
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  },

  // ==================== 短信验证 ====================

  /**
   * 发送短信验证码
   * @param {string} phone - 手机号
   * @returns {Promise<{success: boolean, message: string, expiresIn: number}>}
   */
  async sendSMSCode(phone) {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return { success: false, message: '请输入正确的手机号' };
    }

    // 检查发送频率（60秒内不能重复发送）
    const lastSend = localStorage.getItem('lastSMSSendTime');
    if (lastSend && Date.now() - parseInt(lastSend) < 60000) {
      const remaining = 60 - Math.floor((Date.now() - parseInt(lastSend)) / 1000);
      return { 
        success: false, 
        message: `请 ${remaining} 秒后再试`,
        waitSeconds: remaining
      };
    }

    // 生成6位验证码
    const code = Math.random().toString().slice(2, 8);
    const hashedCode = this.hashPassword(code);

    // 存储验证码和过期时间
    localStorage.setItem('smsVerification', JSON.stringify({
      code: hashedCode,
      phone: phone,
      expiresAt: Date.now() + this.config.smsCodeExpiry * 1000,
      attempts: 0
    }));
    localStorage.setItem('lastSMSSendTime', Date.now().toString());

    // 模拟发送短信（实际应调用后端API）
    console.log(`【游导旅游】您的验证码是 ${code}，2分钟内有效！`);
    
    return { 
      success: true, 
      message: '验证码已发送',
      expiresIn: this.config.smsCodeExpiry
    };
  },

  /**
   * 验证短信验证码
   * @param {string} code - 输入的验证码
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async verifySMSCode(code) {
    const lockStatus = this.checkLockout();
    if (lockStatus.locked) {
      return { success: false, message: lockStatus.message };
    }

    const stored = localStorage.getItem('smsVerification');
    if (!stored) {
      return { success: false, message: '请先获取验证码' };
    }

    const verification = JSON.parse(stored);

    // 检查是否过期
    if (Date.now() > verification.expiresAt) {
      localStorage.removeItem('smsVerification');
      return { success: false, message: '验证码已过期，请重新获取' };
    }

    // 检查尝试次数
    if (verification.attempts >= 5) {
      localStorage.removeItem('smsVerification');
      return { success: false, message: '验证码错误次数过多，请重新获取' };
    }

    // 验证
    verification.attempts++;
    localStorage.setItem('smsVerification', JSON.stringify(verification));

    if (this.hashPassword(code) === verification.code) {
      localStorage.removeItem('smsVerification');
      this.resetAttempts();
      return { success: true, message: '验证成功' };
    }

    const remaining = 5 - verification.attempts;
    return { 
      success: false, 
      message: `验证码错误，剩余 ${remaining} 次机会`,
      attempts: remaining
    };
  },

  // ==================== 风险检测 ====================

  /**
   * 执行风险检测
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<{passed: boolean, riskLevel: string, factors: Array, score: number}>}
   */
  async performRiskCheck(paymentData) {
    const factors = [];
    let riskScore = 0;

    // 1. 金额检测
    if (paymentData.amount > 10000) {
      factors.push({ type: 'high_amount', level: 'warning', message: '大额交易' });
      riskScore += 30;
    }
    if (paymentData.amount > 50000) {
      factors.push({ type: 'very_high_amount', level: 'danger', message: '超高额交易' });
      riskScore += 20;
    }

    // 2. 设备检测
    const isNewDevice = this.detectNewDevice();
    if (isNewDevice) {
      factors.push({ type: 'new_device', level: 'info', message: '新设备登录' });
      riskScore += 20;
    }

    // 3. 位置检测
    const isNewLocation = this.detectNewLocation();
    if (isNewLocation) {
      factors.push({ type: 'new_location', level: 'warning', message: '异地登录' });
      riskScore += 25;
    }

    // 4. 频率检测
    const frequentPayments = this.detectFrequentPayments();
    if (frequentPayments) {
      factors.push({ type: 'frequent', level: 'info', message: '短时间内多次交易' });
      riskScore += 15;
    }

    // 5. 时间异常检测
    const unusualTime = this.detectUnusualTime();
    if (unusualTime) {
      factors.push({ type: 'unusual_time', level: 'info', message: '非正常时段交易' });
      riskScore += 10;
    }

    // 6. 账户历史检测
    const hasBadHistory = this.checkPaymentHistory();
    if (hasBadHistory) {
      factors.push({ type: 'bad_history', level: 'danger', message: '存在不良支付记录' });
      riskScore += 40;
    }

    this.state.lastRiskScore = riskScore;

    // 判断风险等级
    let riskLevel = 'low';
    if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';

    return {
      passed: riskLevel === 'low' || riskLevel === 'medium',
      riskLevel: riskLevel,
      factors: factors,
      score: riskScore,
      requiresVerification: riskScore >= 30
    };
  },

  /**
   * 检测是否新设备
   */
  detectNewDevice() {
    const deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      localStorage.setItem('deviceId', this.generateDeviceId());
      return true;
    }
    return false;
  },

  /**
   * 生成设备ID
   */
  generateDeviceId() {
    return 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  /**
   * 检测是否异地
   */
  detectNewLocation() {
    // 简化实现，实际应结合IP地理位置
    const lastIP = localStorage.getItem('lastLoginIP');
    const currentIP = this.getCurrentIP();
    if (lastIP && currentIP && lastIP !== currentIP) {
      return true;
    }
    return false;
  },

  /**
   * 获取当前IP（模拟）
   */
  getCurrentIP() {
    return localStorage.getItem('currentIP') || 'unknown';
  },

  /**
   * 检测频繁交易
   */
  detectFrequentPayments() {
    const recentPayments = localStorage.getItem('recentPaymentCount') || '0';
    const count = parseInt(recentPayments);
    return count >= 3;
  },

  /**
   * 检测异常时间
   */
  detectUnusualTime() {
    const hour = new Date().getHours();
    return hour < 2 || hour > 23;
  },

  /**
   * 检查支付历史
   */
  checkPaymentHistory() {
    // 简化实现
    return false;
  },

  // ==================== 反欺诈 ====================

  /**
   * 启动反欺诈监控
   */
  setupRiskMonitoring() {
    // 鼠标行为分析
    this.trackMouseMovement();
    // 键盘输入分析
    this.trackKeyboardPattern();
    // 点击节奏分析
    this.trackClickRhythm();
  },

  /**
   * 跟踪鼠标移动
   */
  trackMouseMovement() {
    let mouseEvents = [];
    let lastTime = 0;

    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (lastTime > 0) {
        mouseEvents.push({
          x: e.clientX,
          y: e.clientY,
          t: now - lastTime
        });
        // 保留最近100个事件
        if (mouseEvents.length > 100) {
          mouseEvents.shift();
        }
      }
      lastTime = now;
    });
  },

  /**
   * 跟踪键盘输入模式
   */
  trackKeyboardPattern() {
    let keystrokes = [];
    document.addEventListener('keydown', (e) => {
      keystrokes.push({
        key: e.key,
        time: Date.now()
      });
      if (keystrokes.length > 50) {
        keystrokes.shift();
      }
    });
  },

  /**
   * 跟踪点击节奏
   */
  trackClickRhythm() {
    let clickTimes = [];
    document.addEventListener('click', (e) => {
      clickTimes.push(Date.now());
      if (clickTimes.length > 20) {
        clickTimes.shift();
      }
    });
  },

  /**
   * 设备指纹
   */
  getDeviceFingerprint() {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown'
    ];
    return components.join('|');
  },

  /**
   * 获取反欺诈数据
   */
  getAntiFraudData() {
    return {
      fingerprint: this.getDeviceFingerprint(),
      timestamp: Date.now(),
      url: window.location.href,
      referrer: document.referrer
    };
  },

  // ==================== 支付安全验证流程 ====================

  /**
   * 执行完整的支付安全验证
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<Object>}
   */
  async performFullVerification(paymentData) {
    // 1. 锁定检查
    const lockStatus = this.checkLockout();
    if (lockStatus.locked) {
      return { success: false, type: 'locked', message: lockStatus.message };
    }

    // 2. 风险检测
    const riskResult = await this.performRiskCheck(paymentData);
    
    // 3. 根据风险等级决定验证方式
    if (riskResult.requiresVerification) {
      // 需要额外验证
      if (this.state.isVerified) {
        return { success: true, riskResult };
      }
      return {
        success: false,
        type: 'verification_required',
        riskResult,
        message: '检测到异常，需要进行安全验证'
      };
    }

    return { success: true, riskResult };
  },

  /**
   * 清除验证状态
   */
  clearVerification() {
    this.state.isVerified = false;
  },

  /**
   * 验证是否已通过安全验证
   */
  isVerified() {
    return this.state.isVerified;
  }
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  if (typeof PaymentSecurity !== 'undefined') {
    PaymentSecurity.init();
  }
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaymentSecurity;
}
