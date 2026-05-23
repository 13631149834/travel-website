/**
 * 精致化5.0 - 内容循环推荐系统
 * 功能：
 * 1. 学完一章推荐下一章
 * 2. 刷完题推荐错题复习
 * 3. 打完卡推荐未完成项
 */
(function() {
  'use strict';
  
  const CHAPTER_ORDER = [
    { id: 'business-ch01', name: '导游服务', category: '笔试', book: '业务' },
    { id: 'business-ch02', name: '导游概述', category: '笔试', book: '业务' },
    { id: 'business-ch03', name: '团队服务', category: '笔试', book: '业务' },
    { id: 'business-ch04', name: '散客服务', category: '笔试', book: '业务' },
    { id: 'business-ch05', name: '语言技能', category: '笔试', book: '业务' },
    { id: 'policy-ch01', name: '旅游法', category: '笔试', book: '政策' },
    { id: 'policy-ch02', name: '合同法', category: '笔试', book: '政策' },
    { id: 'national-ch01', name: '旅游资源', category: '笔试', book: '导基' },
    { id: 'local-ch01', name: '华北地区', category: '笔试', book: '地方' },
    { id: 'interview', name: '面试技巧', category: '面试', book: '面试' }
  ];
  
  // 学完一章推荐下一章
  function recommendNextChapter(currentChapterId) {
    const currentIdx = CHAPTER_ORDER.findIndex(c => c.id === currentChapterId);
    
    if (currentIdx === -1) {
      return {
        type: 'start',
        message: '选择一个章节开始学习',
        chapters: CHAPTER_ORDER.slice(0, 3)
      };
    }
    
    if (currentIdx >= CHAPTER_ORDER.length - 1) {
      return {
        type: 'complete',
        message: '恭喜！基础知识已全部学完',
        action: '面试准备'
      };
    }
    
    const next = CHAPTER_ORDER[currentIdx + 1];
    const nextNext = CHAPTER_ORDER[currentIdx + 2];
    
    return {
      type: 'next',
      current: CHAPTER_ORDER[currentIdx],
      next: next,
      alternatives: nextNext ? [nextNext] : [],
      message: '学完《' + CHAPTER_ORDER[currentIdx].name + '》后，推荐学习：' + next.name
    };
  }
  
  // 刷完题推荐错题复习
  function recommendAfterExercise(stats) {
    const { correct, wrong, total, accuracy } = stats;
    
    if (wrong === 0 && accuracy >= 90) {
      return {
        type: 'excellent',
        message: '太棒了！正确率' + accuracy + '%',
        action: '继续挑战'
      };
    }
    
    if (wrong > 0) {
      return {
        type: 'review',
        message: '有' + wrong + '道错题待复习',
        action: '复习错题',
        priority: wrong
      };
    }
    
    if (accuracy < 70) {
      return {
        type: 'weak',
        message: '正确率只有' + accuracy + '%，建议先复习知识点',
        action: '回顾章节'
      };
    }
    
    return {
      type: 'continue',
      message: '今日练习完成，继续保持',
      action: '每日打卡'
    };
  }
  
  // 打完卡推荐未完成
  function recommendAfterCheckin(checkinData) {
    const { completed, total, streak } = checkinData;
    const remaining = total - completed;
    
    if (remaining <= 0) {
      return {
        type: 'all_done',
        message: '今日任务全部完成！',
        streak: streak,
        shareable: true
      };
    }
    
    return {
      type: 'continue',
      remaining: remaining,
      message: '还有' + remaining + '项待完成，继续加油',
      suggestions: getSuggestions(remaining)
    };
  }
  
  // 获取建议
  function getSuggestions(count) {
    const all = [
      { type: 'knowledge', label: '学习新章节', icon: '📖' },
      { type: 'flashcard', label: '复习闪卡', icon: '🃏' },
      { type: 'exercise', label: '刷几道题', icon: '✏️' },
      { type: 'wrong', label: '复习错题', icon: '📝' },
      { type: 'interview', label: '准备面试', icon: '🎤' }
    ];
    return all.slice(0, count);
  }
  
  // 获取章节链接
  function getChapterLink(chapterId) {
    const chapter = CHAPTER_ORDER.find(c => c.id === chapterId);
    if (!chapter) return '#';
    
    if (chapterId === 'interview') return 'interview.html';
    return 'knowledge/' + chapter.book.toLowerCase() + '/' + chapterId + '.html';
  }
  
  // 渲染推荐卡片
  function renderRecommendCard(containerId, recommendData) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const data = typeof recommendData === 'string' ? recommendNextChapter(recommendData) : recommendData;
    
    let html = '<div class="recommend-card">';
    
    if (data.type === 'next') {
      html += '<div class="recommend-label">学完啦！推荐继续</div>';
      html += '<a href="' + getChapterLink(data.next.id) + '" class="recommend-item">';
      html += '<span class="recommend-icon">📖</span>';
      html += '<div class="recommend-info">';
      html += '<span class="recommend-name">' + data.next.name + '</span>';
      html += '<span class="recommend-category">' + data.next.category + '</span>';
      html += '</div>';
      html += '<span class="recommend-arrow">→</span>';
      html += '</a>';
    } else if (data.type === 'review') {
      html += '<div class="recommend-label">错题待复习</div>';
      html += '<a href="exam-simulator.html?mode=wrong" class="recommend-item highlight">';
      html += '<span class="recommend-icon">📝</span>';
      html += '<div class="recommend-info">';
      html += '<span class="recommend-name">复习错题 (' + data.priority + '道)</span>';
      html += '<span class="recommend-category">查漏补缺</span>';
      html += '</div>';
      html += '<span class="recommend-arrow">→</span>';
      html += '</a>';
    }
    
    html += '</div>';
    container.innerHTML = html;
  }
  
  // 暴露API
  window.ContentRecommender = {
    recommendNextChapter,
    recommendAfterExercise,
    recommendAfterCheckin,
    getChapterLink,
    renderRecommendCard,
    CHAPTER_ORDER
  };
  
})();
