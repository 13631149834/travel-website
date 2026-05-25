/**
 * 精致化5.0 - 学习路径可视化增强
 * 当前位置高亮
 * 已完成节点有✓标记
 * 未解锁节点灰色但可见
 * 路径图可缩放/滚动查看
 */

(function() {
  'use strict';
  
  // 学习阶段定义
  var PHASES = [
    { id: 'phase1', name: '基础阶段', weeks: '1-4周', status: 'done' },
    { id: 'phase2', name: '强化阶段', weeks: '5-8周', status: 'current' },
    { id: 'phase3', name: '冲刺阶段', weeks: '9-11周', status: 'pending' },
    { id: 'phase4', name: '模拟阶段', weeks: '12-14周', status: 'locked' },
    { id: 'phase5', name: '考前调整', weeks: '15-16周', status: 'locked' }
  ];
  
  // 获取当前阶段
  function getCurrentPhase() {
    var progress = window.safeStorage.get('study_progress', {});
    var currentPhase = 1;
    
    if (progress.completedChapters) {
      if (progress.completedChapters >= 46) currentPhase = 5;
      else if (progress.completedChapters >= 35) currentPhase = 4;
      else if (progress.completedChapters >= 23) currentPhase = 3;
      else if (progress.completedChapters >= 10) currentPhase = 2;
    }
    
    return currentPhase;
  }
  
  // 渲染路径节点
  function renderRoadmapNode(phase, index) {
    var statusClass = '';
    var statusIcon = '';
    
    switch (phase.status) {
      case 'done':
        statusClass = 'roadmap-done';
        statusIcon = '✓';
        break;
      case 'current':
        statusClass = 'roadmap-current';
        statusIcon = '▶';
        break;
      case 'locked':
        statusClass = 'roadmap-locked';
        statusIcon = '🔒';
        break;
      default:
        statusIcon = (index + 1);
    }
    
    return `
      <div class="roadmap-node ${statusClass}" data-phase="${phase.id}">
        <div class="node-icon">${statusIcon}</div>
        <div class="node-info">
          <div class="node-name">${phase.name}</div>
          <div class="node-weeks">${phase.weeks}</div>
        </div>
      </div>
    `;
  }
  
  // 初始化路径图
  function initRoadmap() {
    var container = document.getElementById('roadmap-container');
    if (!container) return;
    
    var currentPhase = getCurrentPhase();
    
    var html = '<div class="roadmap-container">';
    html += '<div class="roadmap-track">';
    
    PHASES.forEach(function(phase, index) {
      // 更新状态
      if (index + 1 < currentPhase) {
        phase.status = 'done';
      } else if (index + 1 === currentPhase) {
        phase.status = 'current';
      } else {
        phase.status = 'locked';
      }
      
      html += renderRoadmapNode(phase, index);
      
      // 添加连接线
      if (index < PHASES.length - 1) {
        var lineClass = phase.status === 'done' ? 'track-done' : '';
        html += `<div class="roadmap-track-line ${lineClass}"></div>`;
      }
    });
    
    html += '</div></div>';
    container.innerHTML = html;
    
    // 添加路径图样式
    addRoadmapStyles();
  }
  
  // 添加路径图样式
  function addRoadmapStyles() {
    var style = document.getElementById('roadmap-styles');
    if (style) return;
    
    style = document.createElement('style');
    style.id = 'roadmap-styles';
    style.textContent = `
      .roadmap-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        padding: 20px 0;
      }
      .roadmap-track {
        display: flex;
        align-items: center;
        gap: 0;
        min-width: max-content;
      }
      .roadmap-node {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px 24px;
        background: #FFF;
        border: 2px solid #E0E0E0;
        border-radius: 12px;
        transition: all 0.3s;
      }
      .roadmap-node:hover {
        transform: translateY(-2px);
      }
      .roadmap-done {
        border-color: #0D9488;
        background: #E8F5E9;
      }
      .roadmap-current {
        border-color: #0D9488;
        background: #F0FDFA;
        box-shadow: 0 4px 12px rgba(230, 81, 0, 0.3);
      }
      .roadmap-locked {
        opacity: 0.5;
        filter: grayscale(30%);
      }
      .node-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #FFF;
        border: 2px solid #E0E0E0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
      }
      .roadmap-done .node-icon {
        background: #0D9488;
        border-color: #0D9488;
        color: #FFF;
      }
      .roadmap-current .node-icon {
        background: #0D9488;
        border-color: #0D9488;
        color: #FFF;
      }
      .roadmap-track-line {
        width: 60px;
        height: 4px;
        background: #E0E0E0;
        border-radius: 2px;
      }
      .roadmap-track-line.track-done {
        background: #0D9488;
      }
    `;
    document.head.appendChild(style);
  }
  
  // 缩放功能
  function initZoom() {
    var container = document.getElementById('roadmap-container');
    if (!container) return;
    
    var scale = 1;
    var minScale = 0.8;
    var maxScale = 1.5;
    
    // 双指缩放
    container.addEventListener('touchmove', function(e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        var touch = e.touches;
        var dist = Math.hypot(
          touch[0].pageX - touch[1].pageX,
          touch[0].pageY - touch[1].pageY
        );
        
        if (!container.lastDist) {
          container.lastDist = dist;
          return;
        }
        
        var delta = (dist - container.lastDist) / 100;
        scale = Math.max(minScale, Math.min(maxScale, scale + delta));
        container.style.transform = 'scale(' + scale + ')';
        container.lastDist = dist;
      }
    });
    
    container.addEventListener('touchend', function() {
      container.lastDist = null;
    });
    
    // 鼠标滚轮缩放
    container.addEventListener('wheel', function(e) {
      e.preventDefault();
      var delta = e.deltaY > 0 ? -0.1 : 0.1;
      scale = Math.max(minScale, Math.min(maxScale, scale + delta));
      container.style.transform = 'scale(' + scale + ')';
    });
  }
  
  // 暴露API
  window.RoadmapViz = {
    init: initRoadmap,
    initZoom: initZoom,
    getCurrentPhase: getCurrentPhase,
    PHASES: PHASES
  };
  
  // DOM加载后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initRoadmap();
      initZoom();
    });
  } else {
    initRoadmap();
    initZoom();
  }
})();
