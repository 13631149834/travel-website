/**
 * 精致化5.0 - 用户留存策略
 * 功能：
 * 1. 每日推送有价值内容
 * 2. 打卡有激励
 * 3. 内容更新有通知
 * 4. 进度可视化
 */
(function() {
  'use strict';
  
  const RETENTION_KEY = 'retention_data';
  
  // 获取/初始化留存数据
  function getRetentionData() {
    try {
      const data = localStorage.getItem(RETENTION_KEY);
      return data ? JSON.parse(data) : initRetentionData();
    } catch (e) {
      return initRetentionData();
    }
  }
  
  function initRetentionData() {
    return {
      firstVisit: Date.now(),
      lastVisit: Date.now(),
      visitCount: 1,
      checkinStreak: 0,
      maxStreak: 0,
      totalStudyDays: 0,
      completedChapters: [],
      completedFlashcards: 0,
      totalExercises: 0,
      lastCheckin: null,
      achievements: [],
      lastNotification: null
    };
  }
  
  function saveRetentionData(data) {
    localStorage.setItem(RETENTION_KEY, JSON.stringify(data));
  }
  
  // 更新访问数据
  function trackVisit() {
    const data = getRetentionData();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    // 检查是否是同一天
    const lastVisitDay = new Date(data.lastVisit).setHours(0, 0, 0, 0);
    const today = new Date(now).setHours(0, 0, 0, 0);
    
    if (lastVisitDay < today) {
      // 新的一天
      data.visitCount++;
      
      // 检查连续打卡
      const dayDiff = Math.floor((today - lastVisitDay) / dayMs);
      if (dayDiff === 1) {
        data.checkinStreak++;
        if (data.checkinStreak > data.maxStreak) {
          data.maxStreak = data.checkinStreak;
        }
      } else if (dayDiff > 1) {
        data.checkinStreak = 1;
      }
    }
    
    data.lastVisit = now;
    saveRetentionData(data);
    
    return data;
  }
  
  // 打卡
  function checkin() {
    const data = getRetentionData();
    const now = Date.now();
    const today = new Date(now).toDateString();
    
    if (data.lastCheckin === today) {
      return { success: false, message: '今日已打卡' };
    }
    
    data.lastCheckin = today;
    data.checkinStreak++;
    data.totalStudyDays++;
    
    if (data.checkinStreak > data.maxStreak) {
      data.maxStreak = data.checkinStreak;
    }
    
    // 打卡里程碑检测
    const milestones = [3, 7, 14, 30, 100];
    let achieved = null;
    if (milestones.includes(data.checkinStreak)) {
      achieved = data.checkinStreak;
      data.achievements.push({ type: 'streak', value: achieved, time: now });
    }
    
    saveRetentionData(data);
    
    return {
      success: true,
      streak: data.checkinStreak,
      milestone: achieved,
      message: achieved ? '🎉 达成' + achieved + '天连续打卡！' : '打卡成功！连续' + data.checkinStreak + '天'
    };
  }
  
  // 获取用户等级
  function getUserLevel() {
    const data = getRetentionData();
    const score = data.checkinStreak + data.completedChapters.length * 2;
    
    if (score >= 100) return { level: 'master', label: '备考大师', color: '#FFD700' };
    if (score >= 50) return { level: 'senior', label: '资深备考', color: '#C0C0C0' };
    if (score >= 20) return { level: 'intermediate', label: '进阶学员', color: '#CD7F32' };
    return { level: 'beginner', label: '备考新手', color: '#E65100' };
  }
  
  // 获取进度数据
  function getProgress() {
    const data = getRetentionData();
    const level = getUserLevel();
    
    return {
      streak: data.checkinStreak,
      maxStreak: data.maxStreak,
      chapters: data.completedChapters.length,
      flashcards: data.completedFlashcards,
      exercises: data.totalExercises,
      days: data.totalStudyDays,
      level: level,
      levelScore: data.checkinStreak + data.completedChapters.length * 2
    };
  }
  
  // 渲染进度卡片
  function renderProgressCard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const progress = getProgress();
    const level = progress.level;
    
    let html = '<div class="progress-card">';
    html += '<div class="progress-header">';
    html += '<span class="level-badge" style="background:' + level.color + '">' + level.label + '</span>';
    html += '<span class="streak-badge">🔥 ' + progress.streak + '天</span>';
    html += '</div>';
    
    html += '<div class="progress-stats">';
    html += '<div class="stat-item"><span class="stat-num">' + progress.chapters + '</span><span class="stat-label">章节</span></div>';
    html += '<div class="stat-item"><span class="stat-num">' + progress.flashcards + '</span><span class="stat-label">闪卡</span></div>';
    html += '<div class="stat-item"><span class="stat-num">' + progress.exercises + '</span><span class="stat-label">刷题</span></div>';
    html += '</div>';
    
    html += '<div class="progress-bar-wrapper">';
    html += '<div class="progress-bar" style="width:' + Math.min(progress.levelScore, 100) + '%"></div>';
    html += '</div>';
    html += '<div class="progress-tip">距离下一等级还需' + (50 - progress.levelScore) + '积分</div>';
    
    html += '</div>';
    container.innerHTML = html;
  }
  
  // 暴露API
  window.RetentionTracker = {
    trackVisit,
    checkin,
    getProgress,
    getUserLevel,
    renderProgressCard,
    getRetentionData
  };
  
  // 页面加载时自动追踪
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackVisit);
  } else {
    trackVisit();
  }
  
})();
