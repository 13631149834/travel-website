/**
 * 游导旅游 - 错误处理系统入口
 * 整合全局错误捕获、上报、展示、恢复、统计等模块
 */

(function() {
  'use strict';

  // 配置
  const config = {
    enableGlobalHandler: true,
    enableReporter: true,
    enableDisplay: true,
    enableRecovery: true,
    enableStats: true,
    apiUrl: '/api/error/report',
    env: 'production',
    version: '1.0.0'
  };

  /**
   * 初始化错误处理系统
   */
  function init(options) {
    if (options) {
      Object.assign(config, options);
    }

    // 确保模块已加载
    if (!window.GlobalErrorHandler) {
      console.warn('GlobalErrorHandler not loaded');
      return false;
    }

    // 初始化统计模块
    if (config.enableStats && window.ErrorStats) {
      ErrorStats.init();
    }

    // 初始化上报模块
    if (config.enableReporter && window.ErrorReporter) {
      ErrorReporter.init({
        apiUrl: config.apiUrl,
        env: config.env,
        version: config.version
      });
      ErrorReporter.initBehaviorTracker();
    }

    // 初始化恢复模块
    if (config.enableRecovery && window.ErrorRecovery) {
      ErrorRecovery.init();
    }

    // 初始化展示模块
    if (config.enableDisplay && window.ErrorDisplay) {
      ErrorDisplay.init({
        customerServicePhone: '400-123-4567',
        customerServiceWechat: 'youdao_travel'
      });
    }

    // 初始化全局错误捕获
    if (config.enableGlobalHandler && window.GlobalErrorHandler) {
      GlobalErrorHandler.init({}, function(errorInfo) {
        // 错误捕获后的回调
        handleError(errorInfo);
      });
    }

    // 设置全局错误处理函数
    window.handleError = handleError;
    window.showError = showError;
    window.showErrorToast = showErrorToast;
    window.showErrorModal = showErrorModal;
    window.retryOperation = retryOperation;

    console.log('ErrorHandling System initialized');
    return true;
  }

  /**
   * 处理错误
   */
  function handleError(errorInfo) {
    // 记录到统计
    if (window.ErrorStats) {
      ErrorStats.recordError(errorInfo);
    }

    // 上报到服务器
    if (window.ErrorReporter) {
      ErrorReporter.report(errorInfo);
    }

    // 显示友好提示（根据错误类型）
    if (window.ErrorDisplay && shouldDisplayError(errorInfo)) {
      displayFriendlyError(errorInfo);
    }
  }

  /**
   * 是否显示错误提示
   */
  function shouldDisplayError(errorInfo) {
    // 某些错误类型不需要显示
    const silentTypes = ['console_error', 'page_reload'];
    return silentTypes.indexOf(errorInfo.type) === -1;
  }

  /**
   * 显示友好错误
   */
  function displayFriendlyError(errorInfo) {
    const type = mapErrorType(errorInfo.type);
    const message = getErrorMessage(errorInfo);
    const canRetry = canRetryError(errorInfo.type);

    ErrorDisplay.toast({
      type: type,
      message: message,
      canRetry: canRetry,
      details: errorInfo.stack,
      onRetry: function() {
        retryLastOperation();
      }
    });
  }

  /**
   * 映射错误类型
   */
  function mapErrorType(type) {
    const typeMap = {
      'js_error': 'unknown',
      'promise_error': 'unknown',
      'resource_error': 'resource',
      'network_error': 'network',
      'console_error': 'unknown',
      'unhandledrejection': 'unknown'
    };
    return typeMap[type] || 'unknown';
  }

  /**
   * 获取友好错误消息
   */
  function getErrorMessage(errorInfo) {
    if (errorInfo.message) {
      // 截断过长的错误消息
      if (errorInfo.message.length > 100) {
        return errorInfo.message.substring(0, 100) + '...';
      }
      return errorInfo.message;
    }
    return null;
  }

  /**
   * 是否可以重试
   */
  function canRetryError(type) {
    const retryableTypes = ['network', 'timeout', 'server'];
    return retryableTypes.indexOf(type) !== -1;
  }

  /**
   * 显示错误Toast
   */
  function showErrorToast(options) {
    if (window.ErrorDisplay) {
      ErrorDisplay.toast(options);
    }
  }

  /**
   * 显示错误模态框
   */
  function showErrorModal(options) {
    if (window.ErrorDisplay) {
      ErrorDisplay.modal(options);
    }
  }

  /**
   * 重试操作
   */
  function retryOperation(fn, options) {
    if (window.ErrorRecovery) {
      return ErrorRecovery.retry(fn, options);
    }
    // 降级处理
    return fn({}).catch(function(error) {
      throw error;
    });
  }

  /**
   * 重试最后操作
   */
  var lastOperation = null;
  
  function setLastOperation(operation) {
    lastOperation = operation;
  }

  function retryLastOperation() {
    if (lastOperation && typeof lastOperation === 'function') {
      lastOperation();
    } else {
      location.reload();
    }
  }

  // 保存重试函数
  window.setLastOperation = setLastOperation;

  /**
   * 带缓存的请求
   */
  function cachedRequest(key, fn, options) {
    if (window.ErrorRecovery) {
      return ErrorRecovery.cachedRequest(key, fn, options);
    }
    return fn();
  }

  /**
   * API降级处理
   */
  function apiDegrade(apiName, originalFn, cacheKey) {
    if (window.ErrorRecovery) {
      return ErrorRecovery.apiDegrade(apiName, originalFn, cacheKey);
    }
    return originalFn();
  }

  /**
   * 获取错误统计
   */
  function getErrorStats() {
    if (window.ErrorStats) {
      return ErrorStats.getSummary();
    }
    return null;
  }

  /**
   * 获取错误列表
   */
  function getErrorList(options) {
    if (window.ErrorStats) {
      return ErrorStats.getErrors(options);
    }
    return { list: [], total: 0 };
  }

  /**
   * 标记错误已修复
   */
  function markErrorResolved(errorKey) {
    if (window.ErrorStats) {
      return ErrorStats.markResolved(errorKey);
    }
    return false;
  }

  /**
   * 清除错误统计
   */
  function clearErrorStats() {
    if (window.ErrorStats) {
      ErrorStats.clearStats();
    }
  }

  /**
   * 导出错误数据
   */
  function exportErrors(format) {
    if (window.ErrorStats) {
      return ErrorStats.exportData(format);
    }
    return null;
  }

  /**
   * 检查网络状态
   */
  function checkOnline() {
    if (window.ErrorRecovery) {
      return ErrorRecovery.checkOnline();
    }
    return navigator.onLine;
  }

  /**
   * 监听网络状态变化
   */
  function onOfflineStatusChange(callback) {
    if (window.ErrorRecovery) {
      return ErrorRecovery.onOfflineStatusChange(callback);
    }
    return function() {};
  }

  // 导出公共API
  window.ErrorHandling = {
    init: init,
    handleError: handleError,
    showErrorToast: showErrorToast,
    showErrorModal: showErrorModal,
    retryOperation: retryOperation,
    setLastOperation: setLastOperation,
    cachedRequest: cachedRequest,
    apiDegrade: apiDegrade,
    getErrorStats: getErrorStats,
    getErrorList: getErrorList,
    markErrorResolved: markErrorResolved,
    clearErrorStats: clearErrorStats,
    exportErrors: exportErrors,
    checkOnline: checkOnline,
    onOfflineStatusChange: onOfflineStatusChange
  };

  // 自动初始化（可选）
  // 延迟加载，确保依赖模块已加载
  // setTimeout(function() {
  //   if (window.GlobalErrorHandler && window.ErrorReporter) {
  //     init();
  //   }
  // }, 100);
})();
