/**
 * ===================================
 * 专属成功动画模块
 * 预约成功、支付成功、注册成功、庆祝效果
 * ===================================
 */

(function() {
  'use strict';

  // 成功动画配置
  const SUCCESS_CONFIG = {
    duration: 2500,
    particleCount: 50,
    spread: 70,
    colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#4F86F7', '#10B981']
  };

  /**
   * 创建成功动画容器
   */
  function createSuccessContainer(type = 'default') {
    const container = document.createElement('div');
    container.className = `success-animation-overlay`;
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    
    const configs = {
      booking: {
        icon: '🎉',
        title: '预约成功',
        subtitle: '已为您安排专属导游，期待您的旅程~',
        color: '#10B981'
      },
      payment: {
        icon: '💰',
        title: '支付成功',
        subtitle: '订单已确认，感谢您的信任！',
        color: '#F59E0B'
      },
      register: {
        icon: '🎊',
        title: '注册成功',
        subtitle: '欢迎加入游导大家庭，开启精彩旅程~',
        color: '#4F86F7'
      },
      coupon: {
        icon: '🎁',
        title: '领取成功',
        subtitle: '优惠券已放入您的账户~',
        color: '#EC4899'
      },
      review: {
        icon: '⭐',
        title: '评价成功',
        subtitle: '感谢您的反馈，祝您旅途愉快~',
        color: '#8B5CF6'
      },
      default: {
        icon: '✨',
        title: '操作成功',
        subtitle: '已为您完成处理~',
        color: '#667eea'
      }
    };

    const config = configs[type] || configs.default;

    container.innerHTML = `
      <div class="success-animation-content" style="--success-color: ${config.color}">
        <div class="success-icon-container">
          <div class="success-icon-bg"></div>
          <div class="success-icon">${config.icon}</div>
        </div>
        <h2 class="success-title">${config.title}</h2>
        <p class="success-subtitle">${config.subtitle}</p>
        ${type !== 'default' ? '<div class="success-confetti" id="successConfetti"></div>' : ''}
      </div>
    `;

    // 添加样式
    if (!document.getElementById('success-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'success-animation-styles';
      style.textContent = getSuccessStyles();
      document.head.appendChild(style);
    }

    document.body.appendChild(container);

    // 触发彩纸效果
    if (type !== 'default') {
      setTimeout(() => createConfetti(container.querySelector('.success-confetti')), 300);
    }

    // 自动关闭
    setTimeout(() => {
      container.classList.add('success-fade-out');
      setTimeout(() => container.remove(), 500);
    }, SUCCESS_CONFIG.duration);

    return container;
  }

  /**
   * 创建彩色纸屑效果
   */
  function createConfetti(container) {
    if (!container || !window.confetti) return;

    const defaults = {
      particleCount: SUCCESS_CONFIG.particleCount,
      spread: SUCCESS_CONFIG.spread,
      colors: SUCCESS_CONFIG.colors,
      disableForReducedMotion: true
    };

    // 根据屏幕大小调整
    if (window.innerWidth < 600) {
      defaults.particleCount = 30;
    }

    confetti(defaults);
  }

  /**
   * 获取成功动画样式
   */
  function getSuccessStyles() {
    return `
      .success-animation-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(8px);
        z-index: 99999;
        animation: successOverlayIn 0.3s ease;
      }

      .success-animation-overlay.success-fade-out {
        animation: successOverlayOut 0.5s ease forwards;
      }

      @keyframes successOverlayIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes successOverlayOut {
        to { opacity: 0; }
      }

      .success-animation-content {
        background: white;
        border-radius: 24px;
        padding: 50px 60px;
        text-align: center;
        max-width: 400px;
        width: 90%;
        position: relative;
        animation: successCardIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      }

      @keyframes successCardIn {
        0% {
          opacity: 0;
          transform: scale(0.8) translateY(20px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .success-icon-container {
        position: relative;
        width: 120px;
        height: 120px;
        margin: 0 auto 30px;
      }

      .success-icon-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, var(--success-color), color-mix(in srgb, var(--success-color) 70%, white));
        border-radius: 50%;
        animation: successBgPulse 1.5s ease-in-out infinite;
      }

      @keyframes successBgPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }

      .success-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 60px;
        animation: successIconBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
      }

      @keyframes successIconBounce {
        0% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0) rotate(-20deg);
        }
        60% {
          transform: translate(-50%, -50%) scale(1.2) rotate(10deg);
        }
        100% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1) rotate(0deg);
        }
      }

      .success-title {
        font-size: 28px;
        font-weight: 700;
        color: #1a1a2e;
        margin-bottom: 12px;
        animation: successTitleIn 0.4s ease 0.3s both;
      }

      @keyframes successTitleIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .success-subtitle {
        font-size: 16px;
        color: #666;
        line-height: 1.6;
        animation: successSubtitleIn 0.4s ease 0.4s both;
      }

      @keyframes successSubtitleIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .success-confetti {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }

      /* 成功按钮样式 */
      .success-action {
        margin-top: 25px;
        animation: successActionIn 0.4s ease 0.5s both;
      }

      @keyframes successActionIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .success-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 14px 32px;
        background: linear-gradient(135deg, var(--success-color), color-mix(in srgb, var(--success-color) 80%, black));
        color: white;
        border: none;
        border-radius: 50px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        text-decoration: none;
      }

      .success-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      }

      /* 进度环成功 */
      .success-progress-ring {
        position: relative;
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
      }

      .success-progress-ring svg {
        transform: rotate(-90deg);
      }

      .success-progress-ring circle {
        fill: none;
        stroke-width: 6;
      }

      .success-progress-ring .bg {
        stroke: #e5e7eb;
      }

      .success-progress-ring .progress {
        stroke: var(--success-color);
        stroke-dasharray: 226;
        stroke-dashoffset: 226;
        stroke-linecap: round;
        animation: progressFill 1s ease forwards;
      }

      @keyframes progressFill {
        to { stroke-dashoffset: 0; }
      }

      /* 小型成功提示 */
      .success-toast {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        animation: toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }

      .success-toast.toast-fade-out {
        animation: toastSlideOut 0.3s ease forwards;
      }

      @keyframes toastSlideIn {
        to { transform: translateX(-50%) translateY(0); }
      }

      @keyframes toastSlideOut {
        to { transform: translateX(-50%) translateY(-100px); opacity: 0; }
      }

      .success-toast-icon {
        font-size: 24px;
      }

      .success-toast-text {
        font-size: 15px;
        color: #333;
        font-weight: 500;
      }

      /* 成功打勾动画 */
      .success-checkmark {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, #10B981, #059669);
        position: relative;
        animation: checkmarkScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes checkmarkScale {
        0% { transform: scale(0); }
        60% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }

      .success-checkmark::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 30px;
        height: 15px;
        border: 4px solid white;
        border-top: none;
        border-right: none;
        transform: translate(-50%, -60%) rotate(-45deg);
        animation: checkmarkDraw 0.3s ease 0.2s both;
      }

      @keyframes checkmarkDraw {
        from {
          clip-path: inset(100% 0 0 0);
        }
        to {
          clip-path: inset(0 0 0 0);
        }
      }

      @media (max-width: 480px) {
        .success-animation-content {
          padding: 40px 30px;
          width: 85%;
        }
        
        .success-icon-container {
          width: 100px;
          height: 100px;
        }
        
        .success-icon {
          font-size: 50px;
        }
        
        .success-title {
          font-size: 24px;
        }
        
        .success-subtitle {
          font-size: 15px;
        }
      }
    `;
  }

  /**
   * 显示成功动画
   */
  function showSuccess(type = 'default', options = {}) {
    const { autoClose = true, duration = SUCCESS_CONFIG.duration, onClose = null } = options;
    
    const container = createSuccessContainer(type);
    
    if (!autoClose) {
      return container;
    }

    if (onClose) {
      setTimeout(onClose, duration);
    }

    return container;
  }

  /**
   * 显示成功提示（轻量级）
   */
  function showSuccessToast(message, icon = '✓') {
    // 移除现有toast
    const existing = document.querySelector('.success-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
      <span class="success-toast-icon">${icon}</span>
      <span class="success-toast-text">${message}</span>
    `;

    // 添加样式
    if (!document.getElementById('success-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'success-animation-styles';
      style.textContent = getSuccessStyles();
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);

    return toast;
  }

  /**
   * 庆祝效果（无弹窗）
   */
  function celebrate(options = {}) {
    const {
      particleCount = 30,
      spread = 50,
      colors = SUCCESS_CONFIG.colors
    } = options;

    if (window.confetti) {
      confetti({
        particleCount,
        spread,
        colors,
        disableForReducedMotion: true
      });
    }
  }

  /**
   * 连续庆祝效果
   */
  function celebrateMulti(times = 3, interval = 1000) {
    let count = 0;
    const timer = setInterval(() => {
      celebrate();
      count++;
      if (count >= times) {
        clearInterval(timer);
      }
    }, interval);
  }

  /**
   * API 暴露
   */
  window.SuccessAnimation = {
    show: showSuccess,
    toast: showSuccessToast,
    celebrate: celebrate,
    celebrateMulti: celebrateMulti,
    types: ['booking', 'payment', 'register', 'coupon', 'review', 'default']
  };

})();
