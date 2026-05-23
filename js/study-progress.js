// 学习进度追踪模块
// 管理学习进度、打卡、收藏功能

(function() {
  'use strict';
  
  // ==================== 学习进度 ====================
  const STUDY_KEY = 'study_progress';
  const CHAPTER_COUNT = 40; // 总章节数，需要根据实际情况更新
  
  // 获取所有章节ID列表
  function getAllChapterIds() {
    return [
      // 导游业务
      'business-ch01', 'business-ch02', 'business-ch03', 'business-ch04', 'business-ch05',
      'business-ch06', 'business-ch07', 'business-ch08', 'business-ch09',
      // 政策法规
      'policy-ch01', 'policy-ch02', 'policy-ch03', 'policy-ch04', 'policy-ch06', 
      'policy-ch07', 'policy-ch10', 'policy-ch11', 'policy-ch15', 'policy-ch18',
      // 全国导基
      'national-ch01', 'national-ch02', 'national-ch03', 'national-ch04', 'national-ch05',
      'national-ch06', 'national-ch07', 'national-ch08', 'national-ch09', 'national-ch10', 'national-ch11',
      // 地方导基
      'local-ch01', 'local-ch02', 'local-ch03', 'local-ch04', 'local-ch05',
      'local-ch06', 'local-ch07', 'local-ch08'
    ];
  }
  
  // 获取学习进度
  function getStudyProgress() {
    try {
      const data = localStorage.getItem(STUDY_KEY);
      return data ? JSON.parse(data) : {};
    } catch(e) {
      return {};
    }
  }
  
  // 保存学习进度
  function saveStudyProgress(progress) {
    localStorage.setItem(STUDY_KEY, JSON.stringify(progress));
  }
  
  // 标记章节已学习
  function markChapterLearned(chapterId) {
    const progress = getStudyProgress();
    progress[chapterId] = {
      learned: true,
      timestamp: Date.now()
    };
    saveStudyProgress(progress);
    updateStudyStats();
    // 精致化4.0: 情感化成功提示
    const msgs = ['搞定！', '已标记为已学习', '又进步了一点！'];
    showToast(msgs[Math.floor(Math.random() * msgs.length)], 'success');
    // 隐藏空状态
    hideEmptyState();
  }
  
  // 取消章节学习标记
  function unmarkChapterLearned(chapterId) {
    const progress = getStudyProgress();
    if (progress[chapterId]) {
      delete progress[chapterId];
      saveStudyProgress(progress);
      updateStudyStats();
    }
  }
  
  // 检查章节是否已学习
  function isChapterLearned(chapterId) {
    const progress = getStudyProgress();
    return progress[chapterId] && progress[chapterId].learned;
  }
  
  // 获取学习统计数据
  function getStudyStats() {
    const progress = getStudyProgress();
    const allChapters = getAllChapterIds();
    const learned = Object.keys(progress).filter(id => progress[id].learned).length;
    return {
      learned: learned,
      total: allChapters.length,
      percentage: Math.round((learned / allChapters.length) * 100)
    };
  }
  
  // 更新页面上的学习统计显示
  function updateStudyStats() {
    const stats = getStudyStats();
    const learnedEl = document.getElementById('studyLearned');
    const totalEl = document.getElementById('studyTotal');
    const percentEl = document.getElementById('studyPercent');
    const progressBar = document.getElementById('studyProgressBar');
    
    if (learnedEl) learnedEl.textContent = stats.learned;
    if (totalEl) totalEl.textContent = stats.total;
    if (percentEl) percentEl.textContent = stats.percentage + '%';
    if (progressBar) progressBar.style.width = stats.percentage + '%';
  }
  
  // 渲染章节学习按钮
  function renderStudyButton(chapterId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const learned = isChapterLearned(chapterId);
    container.innerHTML = `
      <button class="study-btn ${learned ? 'learned' : ''}" onclick="toggleStudyChapter('${chapterId}')">
        ${learned ? '✅ 已学习' : '📖 标记已学'}
      </button>
    `;
  }
  
  // 切换章节学习状态
  window.toggleStudyChapter = function(chapterId) {
    if (isChapterLearned(chapterId)) {
      unmarkChapterLearned(chapterId);
    } else {
      markChapterLearned(chapterId);
    }
    // 更新按钮状态
    const btn = document.querySelector(`[data-chapter="${chapterId}"]`);
    if (btn) {
      const isLearned = isChapterLearned(chapterId);
      btn.className = `study-btn ${isLearned ? 'learned' : ''}`;
      btn.innerHTML = isLearned ? '✅ 已学习' : '📖 标记已学';
    }
  };
  
  // ==================== 每日打卡 ====================
  const CHECKIN_KEY = 'daily_checkin';
  
  // 获取打卡数据
  function getCheckinData() {
    try {
      const data = localStorage.getItem(CHECKIN_KEY);
      return data ? JSON.parse(data) : { dates: [], streak: 0 };
    } catch(e) {
      return { dates: [], streak: 0 };
    }
  }
  
  // 保存打卡数据
  function saveCheckinData(data) {
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(data));
  }
  
  // 获取今天的日期字符串
  function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  
  // 今日是否已打卡
  function isCheckedInToday() {
    const data = getCheckinData();
    return data.dates.includes(getTodayString());
  }
  
  // 执行打卡
  function doCheckin() {
    const data = getCheckinData();
    const today = getTodayString();
    
    if (data.dates.includes(today)) {
      // 精致化4.0: 情感化提示
      showToast('今天已经打卡过了，明天再来吧~', 'info');
      return;
    }
    
    // 计算连续天数
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    if (data.dates.includes(yesterdayStr)) {
      data.streak = (data.streak || 0) + 1;
    } else {
      data.streak = 1;
    }
    
    data.dates.push(today);
    saveCheckinData(data);
    updateCheckinUI();
    
    // 精致化4.0: 情感化打卡成功提示
    const encouragements = [
      '太棒了，今天的任务全部完成！🎉',
      '打卡成功！坚持就是胜利！💪',
      '今天的你比昨天更优秀！✨',
      '完成一次学习，离上岸又近了一步！🌟'
    ];
    const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
    showToast(msg, 'success');
  }
  
  // 获取连续打卡天数
  function getCheckinStreak() {
    const data = getCheckinData();
    return data.streak || 0;
  }
  
  // 获取最近7天的打卡情况
  function getLast7DaysCheckin() {
    const data = getCheckinData();
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      result.push({
        date: dateStr,
        checked: data.dates.includes(dateStr),
        day: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
      });
    }
    
    return result;
  }
  
  // 更新打卡UI
  function updateCheckinUI() {
    const streakEl = document.getElementById('checkinStreak');
    const todayBtn = document.getElementById('checkinBtn');
    const calendarEl = document.getElementById('checkinCalendar');
    
    const streak = getCheckinStreak();
    const todayDone = isCheckedInToday();
    
    if (streakEl) streakEl.textContent = streak;
    if (todayBtn) {
      todayBtn.disabled = todayDone;
      todayBtn.innerHTML = todayDone ? '✅ 今日已打卡' : '📝 今日打卡';
      todayBtn.className = todayDone ? 'checkin-btn done' : 'checkin-btn';
    }
    
    // 渲染7天日历
    if (calendarEl) {
      const days = getLast7DaysCheckin();
      calendarEl.innerHTML = days.map(day => `
        <div class="checkin-day ${day.checked ? 'checked' : ''}">
          <span class="day-name">${day.day}</span>
          <span class="day-dot">${day.checked ? '✓' : '·'}</span>
        </div>
      `).join('');
    }
  }
  
  // 渲染打卡组件
  function renderCheckinWidget(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="checkin-widget">
        <div class="checkin-header">
          <div class="streak-info">
            <span class="streak-num" id="checkinStreak">0</span>
            <span class="streak-label">连续打卡天数</span>
          </div>
          <button class="checkin-btn" id="checkinBtn" onclick="doCheckin()">📝 今日打卡</button>
        </div>
        <div class="checkin-calendar" id="checkinCalendar"></div>
        <p class="slogan-checkin">走过弯路，所以更懂路</p>
      </div>
    `;
    updateCheckinUI();
  }
  
  // 暴露打卡函数到全局
  window.doCheckin = doCheckin;
  
  // ==================== 收藏功能 ====================
  const FAVORITE_KEY = 'chapter_favorites';
  
  // 获取收藏列表
  function getFavorites() {
    try {
      const data = localStorage.getItem(FAVORITE_KEY);
      return data ? JSON.parse(data) : [];
    } catch(e) {
      return [];
    }
  }
  
  // 保存收藏列表
  function saveFavorites(favorites) {
    localStorage.setItem(FAVORITE_KEY, JSON.stringify(favorites));
  }
  
  // 切换收藏状态
  function toggleFavorite(chapterId, chapterTitle, chapterUrl) {
    let favorites = getFavorites();
    const index = favorites.findIndex(f => f.id === chapterId);
    
    if (index > -1) {
      favorites.splice(index, 1);
      showToast('已取消收藏', 'info');
    } else {
      favorites.push({
        id: chapterId,
        title: chapterTitle,
        url: chapterUrl,
        timestamp: Date.now()
      });
      showToast('已添加到收藏', 'success');
    }
    
    saveFavorites(favorites);
    updateFavoriteUI(chapterId);
    return index === -1; // 返回是否收藏成功
  }
  
  // 检查是否已收藏
  function isFavorited(chapterId) {
    const favorites = getFavorites();
    return favorites.some(f => f.id === chapterId);
  }
  
  // 更新收藏按钮UI
  function updateFavoriteUI(chapterId) {
    const btn = document.querySelector(`[data-favorite="${chapterId}"]`);
    if (btn) {
      const favorited = isFavorited(chapterId);
      btn.className = `favorite-btn ${favorited ? 'favorited' : ''}`;
      btn.innerHTML = favorited ? '⭐ 已收藏' : '☆ 收藏';
    }
  }
  
  // 渲染收藏按钮
  function renderFavoriteButton(chapterId, chapterTitle, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const favorited = isFavorited(chapterId);
    container.innerHTML = `
      <button class="favorite-btn ${favorited ? 'favorited' : ''}" 
              data-favorite="${chapterId}"
              onclick="toggleFavoriteChapter('${chapterId}', '${chapterTitle.replace(/'/g, "\\'")}', window.location.pathname)">
        ${favorited ? '⭐ 已收藏' : '☆ 收藏'}
      </button>
    `;
  }
  
  // 全局切换收藏
  window.toggleFavoriteChapter = function(chapterId, chapterTitle, chapterUrl) {
    toggleFavorite(chapterId, chapterTitle, chapterUrl);
  };
  
  // 获取收藏列表HTML（用于收藏页）
  function getFavoritesListHTML() {
    const favorites = getFavorites();
    
    if (favorites.length === 0) {
      return `
        <div class="favorites-empty">
          <div style="font-size:3rem;margin-bottom:16px;">⭐</div>
          <p style="color:#666;font-size:.95rem;">还没有收藏任何章节</p>
          <a href="travel-knowledge.html" class="cta-link">去知识库看看 →</a>
        </div>
      `;
    }
    
    return favorites.map(f => `
      <a href="${f.url}" class="favorite-item">
        <div class="favorite-title">${f.title}</div>
        <div class="favorite-actions">
          <button class="favorite-remove" onclick="event.preventDefault();event.stopPropagation();removeFavorite('${f.id}')">取消收藏</button>
        </div>
      </a>
    `).join('');
  }
  
  // 移除收藏
  window.removeFavorite = function(chapterId) {
    let favorites = getFavorites();
    favorites = favorites.filter(f => f.id !== chapterId);
    saveFavorites(favorites);
    showToast('已取消收藏', 'info');
    // 刷新列表
    const listEl = document.getElementById('favoritesList');
    if (listEl) {
      listEl.innerHTML = getFavoritesListHTML();
    }
  };
  
  // ==================== Toast提示 ====================
  window.showToast = function(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `study-toast study-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  };
  
  // ==================== 初始化 ====================
  // 添加全局样式
  const style = document.createElement('style');
  style.textContent = `
    /* 学习进度相关样式 */
    .study-btn {
      padding: 8px 16px;
      border: 2px solid #E65100;
      background: #fff;
      color: #E65100;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .study-btn:hover {
      background: #FFF3E0;
    }
    .study-btn.learned {
      background: #E65100;
      color: #fff;
    }
    
    /* 打卡组件样式 */
    .checkin-widget {
      background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
      border-radius: 16px;
      padding: 20px;
      margin: 16px 0;
      border: 1px solid #FFE0B2;
    }
    .checkin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .streak-info {
      text-align: center;
    }
    .streak-num {
      font-size: 2.5rem;
      font-weight: 800;
      color: #E65100;
      display: block;
      line-height: 1;
    }
    .streak-label {
      font-size: 0.8rem;
      color: #666;
    }
    .checkin-btn {
      padding: 12px 24px;
      background: #E65100;
      color: #fff;
      border: none;
      border-radius: 25px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .checkin-btn:hover:not(:disabled) {
      background: #BF360C;
      transform: scale(1.05);
    }
    .checkin-btn.done {
      background: #E65100;
    }
    .checkin-btn:disabled {
      cursor: default;
    }
    .checkin-calendar {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
    .checkin-day {
      flex: 1;
      text-align: center;
      padding: 8px 4px;
      background: rgba(255,255,255,0.6);
      border-radius: 8px;
    }
    .checkin-day.checked {
      background: #E65100;
      color: #fff;
    }
    .day-name {
      display: block;
      font-size: 0.75rem;
      color: #666;
    }
    .checkin-day.checked .day-name {
      color: #fff;
    }
    .day-dot {
      display: block;
      font-size: 1.2rem;
      margin-top: 4px;
    }
    .slogan-checkin {
      text-align: center;
      font-size: 0.8rem;
      color: #BF360C;
      margin-top: 12px;
      font-weight: 600;
    }
    
    /* 收藏按钮样式 */
    .favorite-btn {
      padding: 8px 16px;
      border: 2px solid #FFC107;
      background: #fff;
      color: #FFC107;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .favorite-btn:hover {
      background: #FFF8E1;
    }
    .favorite-btn.favorited {
      background: #FFC107;
      color: #fff;
    }
    
    /* Toast样式 */
    .study-toast {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      z-index: 99999;
      transition: transform 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .study-toast.show {
      transform: translateX(-50%) translateY(0);
    }
    .study-toast-success { background: #E65100; color: #fff; }
    .study-toast-info { background: #666; color: #fff; }
    .study-toast-error { background: #EF4444; color: #fff; }
    
    /* 收藏列表样式 */
    .favorites-empty {
      text-align: center;
      padding: 40px 20px;
    }
    .favorite-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #fff;
      border: 1px solid #F0F0F0;
      border-radius: 12px;
      margin-bottom: 10px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .favorite-item:hover {
      border-color: #E65100;
      box-shadow: 0 2px 8px rgba(230,81,0,0.1);
    }
    .favorite-title {
      color: #1A1A1A;
      font-weight: 600;
    }
    .favorite-remove {
      padding: 6px 12px;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 16px;
      font-size: 0.78rem;
      color: #999;
      cursor: pointer;
    }
    .favorite-remove:hover {
      border-color: #EF4444;
      color: #EF4444;
    }
    .cta-link {
      display: inline-block;
      margin-top: 16px;
      color: #E65100;
      font-weight: 600;
    }
    
    /* 学习进度卡片样式 */
    .study-progress-card {
      background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
      border-radius: 16px;
      padding: 20px;
      margin: 16px 0;
    }
    .study-progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .study-progress-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1A1A1A;
    }
    .study-progress-stats {
      font-size: 0.9rem;
      color: #666;
    }
    .study-progress-stats strong {
      color: #E65100;
    }
    .study-progress-bar {
      height: 8px;
      background: rgba(255,255,255,0.8);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .study-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #E65100, #FF6D00);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .study-progress-percent {
      font-size: 0.8rem;
      color: #666;
      text-align: right;
    }
    .study-progress-link {
      display: block;
      text-align: center;
      margin-top: 12px;
      color: #E65100;
      font-weight: 600;
      font-size: 0.9rem;
    }
  `;
  document.head.appendChild(style);
  
  // 精致化4.0: 空状态检查
  function checkEmptyState() {
    const stats = getStudyStats();
    const emptyTip = document.getElementById('emptyStateTip');
    const uncheckinTip = document.getElementById('uncheckinTip');
    
    // 如果没有任何学习记录，显示空状态
    if (stats.learned === 0 && !isCheckedInToday()) {
      if (emptyTip) emptyTip.style.display = 'block';
    } else {
      if (emptyTip) emptyTip.style.display = 'none';
    }
    
    // 如果今天还没打卡但有学习记录，显示提醒
    if (stats.learned > 0 && !isCheckedInToday()) {
      if (uncheckinTip) uncheckinTip.style.display = 'flex';
    } else {
      if (uncheckinTip) uncheckinTip.style.display = 'none';
    }
  }
  
  function hideEmptyState() {
    const emptyTip = document.getElementById('emptyStateTip');
    if (emptyTip) emptyTip.style.display = 'none';
  }
  
  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', function() {
    // 更新学习统计
    updateStudyStats();
    // 更新打卡UI
    updateCheckinUI();
    // 精致化4.0: 检查空状态
    checkEmptyState();
  });
  
  // 导出公共函数
  window.StudyProgress = {
    getStudyStats: getStudyStats,
    updateStudyStats: updateStudyStats,
    markChapterLearned: markChapterLearned,
    isChapterLearned: isChapterLearned,
    getCheckinStreak: getCheckinStreak,
    isCheckedInToday: isCheckedInToday,
    doCheckin: doCheckin,
    getFavorites: getFavorites,
    getFavoritesListHTML: getFavoritesListHTML,
    toggleFavorite: toggleFavorite,
    isFavorited: isFavorited,
    renderStudyButton: renderStudyButton,
    renderFavoriteButton: renderFavoriteButton,
    renderCheckinWidget: renderCheckinWidget
  };
  
})();
