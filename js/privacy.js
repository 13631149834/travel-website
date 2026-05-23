/**
 * 精致化5.0 - 隐私保护深化
 * 功能：
 * 1. localStorage数据用途说明
 * 2. 提供清除功能
 * 3. 无第三方追踪
 * 4. 不收集IP/位置
 */
(function() {
  'use strict';
  
  // 数据用途说明
  const DATA_PURPOSE = {
    app_version: '应用版本控制，用于数据迁移',
    study_progress: '学习进度，刷新后恢复',
    user_preferences: '用户偏好设置',
    search_history: '搜索历史，方便快速查询',
    favorites: '收藏内容',
    daily_checkin: '每日打卡记录',
    flashcard_progress: '闪卡学习进度',
    exam_stats: '刷题统计数据',
    weak_topics: '薄弱知识点记录',
    last_visit_time: '最后访问时间，用于回访提示'
  };
  
  // 获取数据摘要
  function getDataSummary() {
    const summary = [];
    for (const key in DATA_PURPOSE) {
      const value = localStorage.getItem(key);
      summary.push({
        key: key,
        purpose: DATA_PURPOSE[key],
        hasData: value !== null,
        size: value ? new Blob([value]).size : 0
      });
    }
    return summary;
  }
  
  // 渲染隐私面板
  function renderPrivacyPanel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const summary = getDataSummary();
    let html = `
      <div class="privacy-panel">
        <div class="privacy-header">
          <h3>本地数据说明</h3>
          <p class="privacy-note">以下数据仅保存在您的设备中，不会上传到任何服务器</p>
        </div>
        <ul class="privacy-list">
    `;
    
    summary.forEach(item => {
      html += `
        <li class="privacy-item">
          <div class="privacy-key">${item.key}</div>
          <div class="privacy-purpose">${item.purpose}</div>
          <div class="privacy-status ${item.hasData ? 'has-data' : ''}">
            ${item.hasData ? '✓ 已有数据' : '○ 无数据'}
            ${item.size > 0 ? '(' + Math.round(item.size / 1024 * 100) / 100 + 'KB)' : ''}
          </div>
          ${item.hasData ? '<button class="privacy-clear" data-key="' + item.key + '">清除</button>' : ''}
        </li>
      `;
    });
    
    html += `
        </ul>
        <div class="privacy-footer">
          <button class="privacy-clear-all">清除所有本地数据</button>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // 绑定事件
    container.querySelectorAll('.privacy-clear').forEach(btn => {
      btn.addEventListener('click', function() {
        const key = this.dataset.key;
        if (confirm('确定要清除 ' + key + ' 吗？')) {
          localStorage.removeItem(key);
          renderPrivacyPanel(containerId);
          showToast('已清除', 'success');
        }
      });
    });
    
    const clearAllBtn = container.querySelector('.privacy-clear-all');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', function() {
        if (confirm('确定要清除所有本地数据吗？学习记录将无法恢复！')) {
          Object.keys(DATA_PURPOSE).forEach(key => localStorage.removeItem(key));
          renderPrivacyPanel(containerId);
          showToast('已清除所有数据', 'success');
        }
      });
    }
  }
  
  // 暴露API
  window.PrivacyPanel = {
    getDataSummary: getDataSummary,
    render: renderPrivacyPanel
  };
  
})();
