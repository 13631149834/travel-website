/**
 * 精致化5.0 - 内容生命周期管理系统
 * 新内容发布→验证→推广→稳定
 * 稳定内容定期检查→更新→保持准确
 * 过时内容标注"已更新"→替换→归档
 * 废弃内容删除→301重定向→清理引用
 */

(function() {
  'use strict';
  
  // 内容状态枚举
  const CONTENT_STATUS = {
    DRAFT: 'draft',       // 草稿
    NEW: 'new',           // 新发布
    VALIDATED: 'validated', // 已验证
    STABLE: 'stable',     // 稳定
    UPDATED: 'updated',   // 已更新
    OUTDATED: 'outdated', // 过时
    ARCHIVED: 'archived'  // 归档
  };
  
  // 内容元数据结构
  window.CONTENT_META = window.CONTENT_META || {};
  
  // 获取内容状态
  function getContentStatus(contentId) {
    var meta = window.CONTENT_META[contentId] || {};
    return {
      status: meta.status || CONTENT_STATUS.STABLE,
      lastUpdated: meta.lastUpdated || null,
      nextReview: meta.nextReview || null,
      author: meta.author || 'ximao101'
    };
  }
  
  // 更新内容状态
  function updateContentStatus(contentId, updates) {
    window.CONTENT_META[contentId] = {
      ...window.CONTENT_META[contentId],
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    // 计算下次审查时间（根据状态）
    if (updates.status === CONTENT_STATUS.NEW) {
      // 新内容7天后审查
      var nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + 7);
      window.CONTENT_META[contentId].nextReview = nextReview.toISOString();
    } else if (updates.status === CONTENT_STATUS.UPDATED) {
      // 更新内容30天后审查
      var nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + 30);
      window.CONTENT_META[contentId].nextReview = nextReview.toISOString();
    } else if (updates.status === CONTENT_STATUS.STABLE) {
      // 稳定内容90天后审查
      var nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + 90);
      window.CONTENT_META[contentId].nextReview = nextReview.toISOString();
    }
    
    // 持久化到localStorage
    try {
      localStorage.setItem('content_meta', JSON.stringify(window.CONTENT_META));
    } catch (e) {}
  }
  
  // 检查内容是否需要审查
  function checkContentReview() {
    var now = new Date();
    var needsReview = [];
    
    Object.keys(window.CONTENT_META).forEach(function(contentId) {
      var meta = window.CONTENT_META[contentId];
      if (meta.nextReview) {
        var reviewDate = new Date(meta.nextReview);
        if (reviewDate <= now) {
          needsReview.push({
            id: contentId,
            status: meta.status,
            lastUpdated: meta.lastUpdated,
            nextReview: meta.nextReview
          });
        }
      }
    });
    
    if (needsReview.length > 0) {
      console.warn('[ContentLifecycle] 需要审查的内容:', needsReview);
    }
    
    return needsReview;
  }
  
  // 渲染内容状态标签
  function renderContentBadge(contentId) {
    var meta = getContentStatus(contentId);
    var badge = '';
    
    switch (meta.status) {
      case CONTENT_STATUS.NEW:
        badge = '<span class="content-new">NEW</span>';
        break;
      case CONTENT_STATUS.UPDATED:
        badge = '<span class="content-updated">已更新</span>';
        break;
      case CONTENT_STATUS.OUTDATED:
        badge = '<span class="content-outdated">内容已过期</span>';
        break;
      default:
        badge = '';
    }
    
    return badge;
  }
  
  // 初始化
  function init() {
    try {
      // 从localStorage加载
      var saved = localStorage.getItem('content_meta');
      if (saved) {
        window.CONTENT_META = JSON.parse(saved);
      }
      
      // 检查需要审查的内容
      var needsReview = checkContentReview();
      
      // 为需要审查的内容添加提示
      if (needsReview.length > 0 && typeof showToast === 'function') {
        setTimeout(function() {
          showToast('有' + needsReview.length + '篇内容需要审查', 'info');
        }, 3000);
      }
    } catch (e) {
      console.warn('[ContentLifecycle] 初始化失败:', e.message);
    }
  }
  
  // 暴露API
  window.ContentLifecycle = {
    STATUS: CONTENT_STATUS,
    getStatus: getContentStatus,
    updateStatus: updateContentStatus,
    checkReview: checkContentReview,
    renderBadge: renderContentBadge,
    init: init
  };
  
  // DOM加载后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
