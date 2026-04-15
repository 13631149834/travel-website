/**
 * 游导旅游 - 错误展示模块
 * 负责展示友好错误提示、错误分类、重试机制等
 */

const ErrorDisplay = (function() {
  'use strict';

  // 配置
  const config = {
    containerId: 'error-display-container',
    autoHide: false,
    autoHideDelay: 5000,
    enableToast: true,
    enableModal: true,
    enableInline: true,
    customerServicePhone: '400-123-4567',
    customerServiceWechat: 'youdao_travel',
    showDetails: false
  };

  // 错误类型配置
  const errorTypes = {
    network: {
      title: '网络连接失败',
      icon: '📡',
      color: '#f59e0b',
      suggestion: '请检查您的网络连接后重试',
      canRetry: true
    },
    server: {
      title: '服务器错误',
      icon: '🔧',
      color: '#ef4444',
      suggestion: '服务器正在维护中，请稍后再试',
      canRetry: true
    },
    timeout: {
      title: '请求超时',
      icon: '⏱️',
      color: '#f59e0b',
      suggestion: '请求超时，请检查网络或稍后重试',
      canRetry: true
    },
    auth: {
      title: '认证失败',
      icon: '🔒',
      color: '#8b5cf6',
      suggestion: '请重新登录后继续操作',
      canRetry: false
    },
    permission: {
      title: '权限不足',
      icon: '🚫',
      color: '#6366f1',
      suggestion: '您没有权限执行此操作',
      canRetry: false
    },
    validation: {
      title: '数据验证失败',
      icon: '📝',
      color: '#ec4899',
      suggestion: '请检查输入的数据是否正确',
      canRetry: false
    },
    resource: {
      title: '资源加载失败',
      icon: '📦',
      color: '#14b8a6',
      suggestion: '页面资源加载失败，请刷新页面',
      canRetry: true
    },
    unknown: {
      title: '操作失败',
      icon: '❌',
      color: '#64748b',
      suggestion: '发生了未知错误，请稍后重试',
      canRetry: true
    }
  };

  let container = null;

  /**
   * 初始化
   */
  function init(options) {
    if (options) {
      Object.assign(config, options);
    }
    createContainer();
    initGlobalHandlers();
    console.log('ErrorDisplay initialized');
  }

  /**
   * 创建容器
   */
  function createContainer() {
    if (document.getElementById(config.containerId)) {
      container = document.getElementById(config.containerId);
      return;
    }

    container = document.createElement('div');
    container.id = config.containerId;
    container.className = 'error-display-container';
    container.innerHTML = `
      <style>
        .error-display-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 99999;
          max-width: 400px;
          font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
        }

        .error-toast {
          background: white;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          animation: slideIn 0.3s ease;
          border-left: 4px solid #64748b;
        }

        .error-toast.error-type-network { border-left-color: #f59e0b; }
        .error-toast.error-type-server { border-left-color: #ef4444; }
        .error-toast.error-type-timeout { border-left-color: #f59e0b; }
        .error-toast.error-type-auth { border-left-color: #8b5cf6; }
        .error-toast.error-type-permission { border-left-color: #6366f1; }
        .error-toast.error-type-validation { border-left-color: #ec4899; }
        .error-toast.error-type-resource { border-left-color: #14b8a6; }

        .error-toast-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .error-toast-icon {
          font-size: 1.5rem;
        }

        .error-toast-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .error-toast-close {
          margin-left: auto;
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #9ca3af;
          padding: 0;
          line-height: 1;
        }

        .error-toast-close:hover {
          color: #6b7280;
        }

        .error-toast-message {
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .error-toast-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .error-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .error-btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .error-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .error-btn-secondary {
          background: #f3f4f6;
          color: #6b7280;
        }

        .error-btn-secondary:hover {
          background: #e5e7eb;
        }

        .error-btn-contact {
          background: #10b981;
          color: white;
        }

        .error-btn-contact:hover {
          background: #059669;
        }

        .error-details {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          font-size: 0.8rem;
          color: #9ca3af;
          font-family: monospace;
          white-space: pre-wrap;
          word-break: break-all;
          max-height: 100px;
          overflow-y: auto;
        }

        .error-details-toggle {
          color: #667eea;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .error-details-toggle:hover {
          text-decoration: underline;
        }

        .error-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100000;
          animation: fadeIn 0.3s ease;
        }

        .error-modal {
          background: white;
          border-radius: 16px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          text-align: center;
          animation: scaleIn 0.3s ease;
        }

        .error-modal-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .error-modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 12px;
        }

        .error-modal-message {
          font-size: 1rem;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .error-inline {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px 16px;
          margin: 10px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .error-inline-icon { font-size: 1.2rem; }
        .error-inline-message { color: #dc2626; font-size: 0.9rem; }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      </style>
    `;
    document.body.appendChild(container);
  }

  /**
   * 初始化全局处理
   */
  function initGlobalHandlers() {
    // 处理 ErrorDisplay.show() 调用
    window.showError = function(options) {
      ErrorDisplay.show(options);
    };

    // 处理 ErrorDisplay.toast() 调用
    window.showErrorToast = function(options) {
      ErrorDisplay.toast(options);
    };

    // 处理 ErrorDisplay.modal() 调用
    window.showErrorModal = function(options) {
      ErrorDisplay.modal(options);
    };
  }

  /**
   * 显示错误 - 通用方法
   */
  function show(options) {
    const type = options.type || 'unknown';
    const typeConfig = errorTypes[type] || errorTypes.unknown;

    return {
      toast: function() { toast(options); },
      modal: function() { modal(options); },
      inline: function(element) { inline(options, element); },
      type: type,
      config: typeConfig
    };
  }

  /**
   * Toast提示
   */
  function toast(options) {
    if (!container) createContainer();

    const type = options.type || 'unknown';
    const typeConfig = errorTypes[type] || errorTypes.unknown;
    const message = options.message || typeConfig.suggestion;
    const canRetry = options.canRetry !== undefined ? options.canRetry : typeConfig.canRetry;
    const onRetry = options.onRetry;

    const toastEl = document.createElement('div');
    toastEl.className = 'error-toast error-type-' + type;

    const detailsId = 'error-details-' + Date.now();
    
    toastEl.innerHTML = `
      <div class="error-toast-header">
        <span class="error-toast-icon">${typeConfig.icon}</span>
        <span class="error-toast-title">${typeConfig.title}</span>
        <button class="error-toast-close" onclick="this.closest('.error-toast').remove()">×</button>
      </div>
      <div class="error-toast-message">${escapeHtml(message)}</div>
      <div class="error-toast-actions">
        ${canRetry ? '<button class="error-btn error-btn-primary btn-retry">重试</button>' : ''}
        <button class="error-btn error-btn-secondary btn-contact">联系客服</button>
      </div>
      ${config.showDetails && options.details ? `
        <div class="error-details-toggle" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
          查看详情
        </div>
        <div class="error-details" style="display:none">${escapeHtml(options.details)}</div>
      ` : ''}
    `;

    // 绑定重试按钮
    const retryBtn = toastEl.querySelector('.btn-retry');
    if (retryBtn && onRetry) {
      retryBtn.addEventListener('click', function() {
        toastEl.remove();
        onRetry();
      });
    } else if (retryBtn) {
      retryBtn.addEventListener('click', function() {
        toastEl.remove();
        location.reload();
      });
    }

    // 绑定联系客服按钮
    const contactBtn = toastEl.querySelector('.btn-contact');
    if (contactBtn) {
      contactBtn.addEventListener('click', function() {
        showCustomerServiceModal(typeConfig.title, message);
      });
    }

    container.appendChild(toastEl);

    // 自动隐藏
    if (config.autoHide) {
      setTimeout(function() {
        if (toastEl.parentNode) {
          toastEl.remove();
        }
      }, config.autoHideDelay);
    }

    return toastEl;
  }

  /**
   * 模态框提示
   */
  function modal(options) {
    const type = options.type || 'unknown';
    const typeConfig = errorTypes[type] || errorTypes.unknown;
    const message = options.message || typeConfig.suggestion;
    const canRetry = options.canRetry !== undefined ? options.canRetry : typeConfig.canRetry;
    const onRetry = options.onRetry;
    const onClose = options.onClose;

    const overlay = document.createElement('div');
    overlay.className = 'error-modal-overlay';

    overlay.innerHTML = `
      <div class="error-modal">
        <div class="error-modal-icon">${typeConfig.icon}</div>
        <div class="error-modal-title">${typeConfig.title}</div>
        <div class="error-modal-message">${escapeHtml(message)}</div>
        <div class="error-toast-actions" style="justify-content: center;">
          ${canRetry ? '<button class="error-btn error-btn-primary btn-retry">重试</button>' : ''}
          <button class="error-btn error-btn-secondary btn-contact">联系客服</button>
          <button class="error-btn error-btn-secondary btn-close">关闭</button>
        </div>
      </div>
    `;

    // 绑定事件
    const retryBtn = overlay.querySelector('.btn-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', function() {
        overlay.remove();
        if (onRetry) onRetry();
      });
    }

    const contactBtn = overlay.querySelector('.btn-contact');
    if (contactBtn) {
      contactBtn.addEventListener('click', function() {
        showCustomerServiceModal(typeConfig.title, message);
      });
    }

    const closeBtn = overlay.querySelector('.btn-close');
    closeBtn.addEventListener('click', function() {
      overlay.remove();
      if (onClose) onClose();
    });

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.remove();
        if (onClose) onClose();
      }
    });

    document.body.appendChild(overlay);
    return overlay;
  }

  /**
   * 行内错误提示
   */
  function inline(options, element) {
    const type = options.type || 'validation';
    const typeConfig = errorTypes[type] || errorTypes.unknown;
    const message = options.message || typeConfig.suggestion;

    const inlineEl = document.createElement('div');
    inlineEl.className = 'error-inline';
    inlineEl.innerHTML = `
      <span class="error-inline-icon">${typeConfig.icon}</span>
      <span class="error-inline-message">${escapeHtml(message)}</span>
    `;

    if (typeof element === 'string') {
      element = document.querySelector(element);
    }

    if (element) {
      element.parentNode.insertBefore(inlineEl, element.nextSibling);
      return inlineEl;
    }

    return inlineEl;
  }

  /**
   * 显示客服模态框
   */
  function showCustomerServiceModal(title, message) {
    const overlay = document.createElement('div');
    overlay.className = 'error-modal-overlay';

    overlay.innerHTML = `
      <div class="error-modal">
        <div class="error-modal-icon">🤝</div>
        <div class="error-modal-title">需要帮助？</div>
        <div class="error-modal-message">
          ${title ? '遇到问题：' + title + '<br><br>' : ''}
          我们的客服团队随时为您服务
        </div>
        <div class="error-toast-actions" style="justify-content: center; flex-direction: column; gap: 12px;">
          <button class="error-btn error-btn-primary btn-phone" style="width: 100%;">
            📞 ${config.customerServicePhone}
          </button>
          <button class="error-btn error-btn-contact btn-wechat" style="width: 100%;">
            💬 微信: ${config.customerServiceWechat}
          </button>
          <button class="error-btn error-btn-secondary btn-close" style="width: 100%;">
            关闭
          </button>
        </div>
      </div>
    `;

    const phoneBtn = overlay.querySelector('.btn-phone');
    phoneBtn.addEventListener('click', function() {
      window.location.href = 'tel:' + config.customerServicePhone;
    });

    const closeBtn = overlay.querySelector('.btn-close');
    closeBtn.addEventListener('click', function() {
      overlay.remove();
    });

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    document.body.appendChild(overlay);
  }

  /**
   * 显示网络错误
   */
  function showNetworkError(message, onRetry) {
    return toast({
      type: 'network',
      message: message,
      canRetry: true,
      onRetry: onRetry
    });
  }

  /**
   * 显示服务器错误
   */
  function showServerError(message, onRetry) {
    return toast({
      type: 'server',
      message: message,
      canRetry: true,
      onRetry: onRetry
    });
  }

  /**
   * 显示超时错误
   */
  function showTimeoutError(message, onRetry) {
    return toast({
      type: 'timeout',
      message: message,
      canRetry: true,
      onRetry: onRetry
    });
  }

  /**
   * 显示认证错误
   */
  function showAuthError(message, onRetry) {
    return toast({
      type: 'auth',
      message: message,
      canRetry: false,
      onRetry: onRetry
    });
  }

  /**
   * 隐藏所有错误
   */
  function hideAll() {
    if (container) {
      container.innerHTML = '';
    }
    document.querySelectorAll('.error-modal-overlay').forEach(function(el) {
      el.remove();
    });
  }

  /**
   * HTML转义
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 公开API
  return {
    init: init,
    show: show,
    toast: toast,
    modal: modal,
    inline: inline,
    showNetworkError: showNetworkError,
    showServerError: showServerError,
    showTimeoutError: showTimeoutError,
    showAuthError: showAuthError,
    showCustomerServiceModal: showCustomerServiceModal,
    hideAll: hideAll,
    errorTypes: errorTypes,
    config: config
  };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorDisplay;
}
