/**
 * ============================================
 * Toast 提示组件 - 游导旅游网站
 * ============================================
 * 支持成功/错误/警告三种类型
 * 自动消失（3秒）
 */

(function() {
  'use strict';

  // Toast样式注入
  const style = document.createElement('style');
  style.textContent = `
    /* Toast容器 */
    #toast-container {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    /* Toast消息 */
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 20px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      font-size: 14px;
      color: #333;
      pointer-events: auto;
      animation: toast-in 0.3s ease;
      max-width: 320px;
      min-width: 200px;
    }

    .toast.hiding {
      animation: toast-out 0.3s ease forwards;
    }

    /* Toast类型 */
    .toast.toast-success {
      border-left: 4px solid #10B981;
    }
    .toast.toast-success .toast-icon {
      color: #10B981;
    }

    .toast.toast-error {
      border-left: 4px solid #EF4444;
    }
    .toast.toast-error .toast-icon {
      color: #EF4444;
    }

    .toast.toast-warning {
      border-left: 4px solid #F59E0B;
    }
    .toast.toast-warning .toast-icon {
      color: #F59E0B;
    }

    .toast.toast-info {
      border-left: 4px solid #4F86F7;
    }
    .toast.toast-info .toast-icon {
      color: #4F86F7;
    }

    /* Toast图标 */
    .toast-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    /* Toast文字 */
    .toast-message {
      flex: 1;
      line-height: 1.4;
    }

    /* 动画 */
    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes toast-out {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-20px);
      }
    }

    /* 移动端适配 */
    @media (max-width: 480px) {
      #toast-container {
        top: 10px;
        width: calc(100% - 20px);
      }
      .toast {
        max-width: 100%;
      }
    }
  `;
  document.head.appendChild(style);

  // Toast图标映射
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  // 显示Toast
  function showToast(message, type = 'info', duration = 3000) {
    // 创建容器
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    // 创建Toast元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    // 自动消失
    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  // HTML转义防止XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 导出到全局
  window.showToast = showToast;
  window.toast = {
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    warning: (msg, duration) => showToast(msg, 'warning', duration),
    info: (msg, duration) => showToast(msg, 'info', duration)
  };

})();
