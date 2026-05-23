// 闪卡增强模块 v2.0 - 掌握标记、筛选、洗牌功能

(function() {
  'use strict';
  
  const FLASHCARD_PROGRESS_KEY = 'flashcard_progress';
  const FLASHCARD_ORDER_KEY = 'flashcard_order';
  const FLASHCARD_WRONG_KEY = 'flashcard_wrong';
  
  // 获取闪卡进度数据
  function getCardProgress() {
    try {
      const data = localStorage.getItem(FLASHCARD_PROGRESS_KEY);
      return data ? JSON.parse(data) : { mastered: [], reviewing: [] };
    } catch(e) {
      return { mastered: [], reviewing: [] };
    }
  }
  
  // 保存闪卡进度
  function saveCardProgress(progress) {
    localStorage.setItem(FLASHCARD_PROGRESS_KEY, JSON.stringify(progress));
  }
  
  // 获取错题列表
  function getWrongCards() {
    try {
      const data = localStorage.getItem(FLASHCARD_WRONG_KEY);
      return data ? JSON.parse(data) : [];
    } catch(e) {
      return [];
    }
  }
  
  // 保存错题
  function saveWrongCard(cardIndex) {
    const wrongCards = getWrongCards();
    if (!wrongCards.includes(cardIndex)) {
      wrongCards.push(cardIndex);
      localStorage.setItem(FLASHCARD_WRONG_KEY, JSON.stringify(wrongCards));
    }
  }
  
  // 清除错题记录
  function clearWrongCards() {
    localStorage.removeItem(FLASHCARD_WRONG_KEY);
  }
  
  // 标记卡片状态
  function markCardStatus(cardIndex, status) {
    // status: 'mastered', 'reviewing', null(未标记)
    const progress = getCardProgress();
    const idx = progress.mastered.indexOf(cardIndex);
    const idx2 = progress.reviewing.indexOf(cardIndex);
    
    // 先移除
    if (idx > -1) progress.mastered.splice(idx, 1);
    if (idx2 > -1) progress.reviewing.splice(idx2, 1);
    
    // 添加新状态
    if (status === 'mastered') {
      progress.mastered.push(cardIndex);
      // 从错题中移除
      const wrongCards = getWrongCards();
      const wrongIdx = wrongCards.indexOf(cardIndex);
      if (wrongIdx > -1) wrongCards.splice(wrongIdx, 1);
      localStorage.setItem(FLASHCARD_WRONG_KEY, JSON.stringify(wrongCards));
    } else if (status === 'reviewing') {
      progress.reviewing.push(cardIndex);
      // 添加到错题
      saveWrongCard(cardIndex);
    }
    
    saveCardProgress(progress);
  }
  
  // 检查卡片状态
  function getCardStatus(cardIndex) {
    const progress = getCardProgress();
    if (progress.mastered.includes(cardIndex)) return 'mastered';
    if (progress.reviewing.includes(cardIndex)) return 'reviewing';
    return null;
  }
  
  // 获取统计数据
  function getFlashcardStats(total) {
    const progress = getCardProgress();
    return {
      total: total,
      mastered: progress.mastered.length,
      reviewing: progress.reviewing.length,
      unstudied: total - progress.mastered.length - progress.reviewing.length
    };
  }
  
  // 洗牌功能
  function shuffleCards(cards, orderKey) {
    // 创建基于卡牌内容的稳定hash作为随机种子的一部分
    const seed = localStorage.getItem(orderKey + '_seed');
    const newSeed = seed ? (parseInt(seed) + 1) % 10000 : Math.floor(Math.random() * 10000);
    localStorage.setItem(orderKey + '_seed', newSeed);
    
    // 使用Fisher-Yates洗牌算法
    const shuffled = [...cards];
    let currentSeed = newSeed;
    for (let i = shuffled.length - 1; i > 0; i--) {
      currentSeed = (currentSeed * 1103515245 + 12345) % (2^31);
      const j = currentSeed % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // 重置顺序
  function resetCardOrder() {
    localStorage.removeItem(FLASHCARD_ORDER_KEY + '_seed');
  }
  
  // 获取筛选后的卡片
  function filterCards(cards, filterType) {
    const progress = getCardProgress();
    const wrongCards = getWrongCards();
    
    switch(filterType) {
      case 'all':
        return cards;
      case 'unstudied':
        return cards.filter((_, idx) => 
          !progress.mastered.includes(idx) && !progress.reviewing.includes(idx)
        );
      case 'mastered':
        return cards.filter((_, idx) => progress.mastered.includes(idx));
      case 'reviewing':
        // 优先显示需复习的卡片
        return cards.filter((_, idx) => progress.reviewing.includes(idx));
      case 'wrong':
        // 只看错题模式
        return cards.filter((_, idx) => wrongCards.includes(idx));
      default:
        return cards;
    }
  }
  
  // 按优先级排序卡片（需复习的排在前面）
  function sortByPriority(cards) {
    const progress = getCardProgress();
    return cards.sort((a, b) => {
      const aReview = progress.reviewing.includes(a.index);
      const bReview = progress.reviewing.includes(b.index);
      if (aReview && !bReview) return -1;
      if (!aReview && bReview) return 1;
      return 0;
    });
  }
  
  // 更新筛选按钮状态
  function updateFilterButtons(activeFilter) {
    const filters = ['all', 'unstudied', 'mastered', 'reviewing', 'wrong'];
    filters.forEach(f => {
      const btn = document.getElementById('filter' + f.charAt(0).toUpperCase() + f.slice(1));
      if (btn) {
        btn.classList.toggle('active', f === activeFilter);
      }
    });
  }
  
  // 获取筛选按钮统计
  function getFilterCounts(total) {
    const progress = getCardProgress();
    const wrongCards = getWrongCards();
    return {
      all: total,
      unstudied: total - progress.mastered.length - progress.reviewing.length,
      mastered: progress.mastered.length,
      reviewing: progress.reviewing.length,
      wrong: wrongCards.length
    };
  }
  
  // 渲染筛选栏
  function renderFilterBar(containerId, total) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const counts = getFilterCounts(total);
    const filters = [
      { key: 'all', label: '全部', icon: '📋' },
      { key: 'unstudied', label: '未学', icon: '📖' },
      { key: 'mastered', label: '已掌握', icon: '✅' },
      { key: 'reviewing', label: '需复习', icon: '🔄' },
      { key: 'wrong', label: '只看错题', icon: '❌' }
    ];
    
    let html = '<div class="fc-filter-bar">';
    filters.forEach(f => {
      const count = counts[f.key] || 0;
      html += `<button class="fc-filter-btn" id="filter${f.key.charAt(0).toUpperCase() + f.key.slice(1)}" onclick="FlashcardEnhanced.setFilter('${f.key}')">
        ${f.icon} ${f.label} <span class="count">${count}</span>
      </button>`;
    });
    html += '</div>';
    
    // 操作按钮
    html += '<div class="fc-action-bar">';
    html += '<button class="fc-action-btn" onclick="FlashcardEnhanced.shuffle()">🔀 洗牌</button>';
    html += '<button class="fc-action-btn" onclick="FlashcardEnhanced.resetOrder()">↩️ 恢复顺序</button>';
    html += '</div>';
    
    container.innerHTML = html;
  }
  
  // Toast提示
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fc-toast fc-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
  
  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    /* 闪卡增强样式 */
    .fc-filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin: 12px 0;
      padding: 12px;
      background: #FFF8E1;
      border-radius: 12px;
    }
    .fc-filter-btn {
      padding: 8px 16px;
      border: 2px solid #E0E0E0;
      background: #fff;
      color: #666;
      border-radius: 20px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .fc-filter-btn:hover {
      border-color: #E65100;
      color: #E65100;
    }
    .fc-filter-btn.active {
      border-color: #E65100;
      background: #E65100;
      color: #fff;
    }
    .fc-filter-btn .count {
      background: rgba(255,255,255,0.3);
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 0.75rem;
    }
    .fc-filter-btn.active .count {
      background: rgba(255,255,255,0.3);
    }
    .fc-filter-btn:not(.active) .count {
      background: #FFF3E0;
      color: #E65100;
    }
    
    .fc-action-bar {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin: 12px 0;
    }
    .fc-action-btn {
      padding: 10px 20px;
      border: 2px solid #E0E0E0;
      background: #fff;
      color: #666;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .fc-action-btn:hover {
      border-color: #E65100;
      background: #FFF3E0;
      color: #E65100;
    }
    .fc-action-btn.shuffle {
      background: linear-gradient(135deg, #E65100, #FF6D00);
      color: #fff;
      border: none;
    }
    .fc-action-btn.shuffle:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(230,81,0,0.3);
    }
    
    /* 卡片状态标记 */
    .fc-card-status {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 700;
      z-index: 5;
    }
    .fc-card-status.mastered {
      background: #E65100;
      color: #fff;
    }
    .fc-card-status.reviewing {
      background: #FF9800;
      color: #fff;
    }
    
    /* Toast样式 */
    .fc-toast {
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      z-index: 99999;
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: none;
    }
    .fc-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .fc-toast-success { background: #E65100; color: #fff; }
    .fc-toast-info { background: #666; color: #fff; }
    .fc-toast-warning { background: #FF9800; color: #fff; }
    
    /* 进度条样式 */
    .fc-progress-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      background: #FAFAFA;
      border-radius: 10px;
      margin: 10px 0;
    }
    .fc-progress-track {
      flex: 1;
      height: 8px;
      background: #E0E0E0;
      border-radius: 4px;
      overflow: hidden;
    }
    .fc-progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .fc-progress-mastered {
      background: #E65100;
    }
    .fc-progress-reviewing {
      background: #FF9800;
    }
    .fc-progress-label {
      font-size: 0.78rem;
      color: #666;
      white-space: nowrap;
    }
  `;
  document.head.appendChild(style);
  
  // 导出到全局
  window.FlashcardEnhanced = {
    getCardProgress: getCardProgress,
    markCardStatus: markCardStatus,
    getCardStatus: getCardStatus,
    getFlashcardStats: getFlashcardStats,
    shuffleCards: shuffleCards,
    resetCardOrder: resetCardOrder,
    filterCards: filterCards,
    updateFilterButtons: updateFilterButtons,
    getFilterCounts: getFilterCounts,
    renderFilterBar: renderFilterBar,
    showToast: showToast,
    getWrongCards: getWrongCards,
    clearWrongCards: clearWrongCards,
    setFilter: function(filter) {
      window.currentFilter = filter;
      updateFilterButtons(filter);
      if (typeof onFilterChange === 'function') {
        onFilterChange(filter);
      }
    }
  };
  
})();
