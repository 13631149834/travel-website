/**
 * 精致化5.0 - 骨架屏组件
 * 功能：
 * 1. 骨架屏渲染
 * 2. 内容加载后淡出
 * 3. 品牌色浅色占位
 */
(function() {
  'use strict';
  
  // 骨架屏类型定义
  const SKELETON_TYPES = {
    card: {
      html: '<div class="skeleton-card"><div class="skeleton skeleton-line long"></div><div class="skeleton skeleton-line medium"></div><div class="skeleton skeleton-line short"></div></div>'
    },
    list: {
      html: '<div class="skeleton-card"><div class="skeleton skeleton-line long"></div></div>'.repeat(3)
    },
    hero: {
      html: '<div class="skeleton" style="height:200px;margin:16px;border-radius:12px;"></div>'
    },
    profile: {
      html: '<div style="display:flex;gap:12px;align-items:center;padding:16px;"><div class="skeleton skeleton-circle"></div><div style="flex:1;"><div class="skeleton skeleton-line medium"></div><div class="skeleton skeleton-line short"></div></div></div>'
    }
  };
  
  // 显示骨架屏
  function show(containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const skeleton = SKELETON_TYPES[type] || SKELETON_TYPES.card;
    container.innerHTML = skeleton.html;
    container.classList.add('skeleton-active');
  }
  
  // 隐藏骨架屏，显示内容
  function hide(containerId, content) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.classList.add('skeleton-fade-out');
    
    setTimeout(function() {
      if (typeof content === 'string') {
        container.innerHTML = content;
      }
      container.classList.remove('skeleton-active', 'skeleton-fade-out');
    }, 300);
  }
  
  // 模拟加载
  function loading(containerId, type, promise) {
    show(containerId, type);
    
    promise
      .then(function(content) {
        hide(containerId, content);
      })
      .catch(function() {
        hide(containerId, '<div class="error-fallback">加载失败，请刷新重试</div>');
      });
  }
  
  window.SkeletonUI = {
    show: show,
    hide: hide,
    loading: loading,
    types: SKELETON_TYPES
  };
  
})();
