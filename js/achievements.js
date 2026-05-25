// 成就系统模块 v2.0 - 包含通关成就、里程碑、刷题等级、成就展示页
(function() {
  'use strict';

  const ACHIEVEMENTS_KEY = 'achievements_data';
  const QUIZ_LEVEL_KEY = 'quiz_level';
  const CHAPTER_ORDER_KEY = 'chapter_order';
  const DAILY_CHECKIN_KEY = 'daily_checkin';

  // ========== 成就定义 ==========
  const ALL_ACHIEVEMENTS = {
    // 通关成就
    first_chapter: { id: 'first_chapter', title: '初识旅途', icon: '🌱', desc: '完成第一个章节', category: 'chapter', condition: { type: 'chapters', count: 1 } },
    five_chapters: { id: 'five_chapters', title: '渐入佳境', icon: '🌿', desc: '完成5个章节', category: 'chapter', condition: { type: 'chapters', count: 5 } },
    ten_chapters: { id: 'ten_chapters', title: '学有小成', icon: '🌳', desc: '完成10个章节', category: 'chapter', condition: { type: 'chapters', count: 10 } },
    half_chapters: { id: 'half_chapters', title: '半程跋涉', icon: '🏔️', desc: '完成20个章节', category: 'chapter', condition: { type: 'chapters', count: 20 } },
    all_chapters: { id: 'all_chapters', title: '学贯东西', icon: '🏆', desc: '完成全部章节', category: 'chapter', condition: { type: 'chapters', count: 40 } },

    // 打卡里程碑 - 7/14/30天
    streak_3: { id: 'streak_3', title: '初见坚持', icon: '🔥', desc: '连续打卡3天', category: 'streak', condition: { type: 'streak', count: 3 } },
    streak_7: { id: 'streak_7', title: '一周打卡王', icon: '⭐', desc: '连续打卡7天', category: 'streak', condition: { type: 'streak', count: 7 } },
    streak_14: { id: 'streak_14', title: '双周达人', icon: '🌟', desc: '连续打卡14天', category: 'streak', condition: { type: 'streak', count: 14 } },
    streak_30: { id: 'streak_30', title: '月度战神', icon: '💫', desc: '连续打卡30天', category: 'streak', condition: { type: 'streak', count: 30 } },
    streak_60: { id: 'streak_60', title: '季度强者', icon: '🚀', desc: '连续打卡60天', category: 'streak', condition: { type: 'streak', count: 60 } },
    streak_100: { id: 'streak_100', title: '百日英雄', icon: '👑', desc: '连续打卡100天', category: 'streak', condition: { type: 'streak', count: 100 } },

    // 闪卡成就
    first_flashcard: { id: 'first_flashcard', title: '闪卡新手', icon: '🃏', desc: '完成第一组闪卡', category: 'flashcard', condition: { type: 'flashcard_sessions', count: 1 } },
    flashcard_10: { id: 'flashcard_10', title: '闪卡达人', icon: '📚', desc: '完成10组闪卡', category: 'flashcard', condition: { type: 'flashcard_sessions', count: 10 } },
    flashcard_master: { id: 'flashcard_master', title: '口诀大师', icon: '🎓', desc: '掌握50张闪卡', category: 'flashcard', condition: { type: 'cards_mastered', count: 50 } },
    flashcard_100: { id: 'flashcard_100', title: '闪卡宗师', icon: '🏅', desc: '掌握100张闪卡', category: 'flashcard', condition: { type: 'cards_mastered', count: 100 } },

    // 刷题成就
    quiz_first: { id: 'quiz_first', title: '初试牛刀', icon: '✏️', desc: '完成第一套试题', category: 'quiz', condition: { type: 'quiz_sets', count: 1 } },
    quiz_10: { id: 'quiz_10', title: '题海战士', icon: '📝', desc: '完成10套试题', category: 'quiz', condition: { type: 'quiz_sets', count: 10 } },
    quiz_50: { id: 'quiz_50', title: '真题猎手', icon: '🎯', desc: '完成50套试题', category: 'quiz', condition: { type: 'quiz_sets', count: 50 } },
    quiz_100: { id: 'quiz_100', title: '刷题狂人', icon: '💯', desc: '完成100套试题', category: 'quiz', condition: { type: 'quiz_sets', count: 100 } },

    // 错题成就
    review_wrong: { id: 'review_wrong', title: '知错就改', icon: '🔧', desc: '回顾10道错题', category: 'mistake', condition: { type: 'mistakes_reviewed', count: 10 } },
    no_mistakes: { id: 'no_mistakes', title: '完美战士', icon: '💎', desc: '连续答对20题', category: 'quiz', condition: { type: 'perfect_streak', count: 20 } },

    // 收藏成就
    collect_5: { id: 'collect_5', title: '收藏夹主', icon: '📌', desc: '收藏5个章节', category: 'collect', condition: { type: 'favorites', count: 5 } },

    // 时间投入
    study_1hour: { id: 'study_1hour', title: '初学1小时', icon: '⏰', desc: '累计学习1小时', category: 'time', condition: { type: 'study_time', count: 60 } },
    study_10hours: { id: 'study_10hours', title: '沉浸学习', icon: '⏳', desc: '累计学习10小时', category: 'time', condition: { type: 'study_time', count: 600 } },
    study_50hours: { id: 'study_50hours', title: '学习达人', icon: '⌛', desc: '累计学习50小时', category: 'time', condition: { type: 'study_time', count: 3000 } },

    // 面试成就
    interview_first: { id: 'interview_first', title: '初次登台', icon: '🎤', desc: '完成第一次面试练习', category: 'interview', condition: { type: 'interview_sessions', count: 1 } },
    interview_10: { id: 'interview_10', title: '口若悬河', icon: '🗣️', desc: '完成10次面试练习', category: 'interview', condition: { type: 'interview_sessions', count: 10 } },

    // 里程碑通关标记
    pass_practice_1: { id: 'pass_practice_1', title: '初战告捷', icon: '🎖️', desc: '首次模拟考试通过', category: 'milestone', condition: { type: 'practice_pass', count: 1 } },
    
    // 精致化5.0-AA: 仪式感成就
    // 首日学习仪式 - "迈出第一步"
    first_day_study: { 
      id: 'first_day_study', 
      title: '迈出第一步', 
      icon: '🚀', 
      desc: '完成首日学习', 
      category: 'ritual',
      condition: { type: 'first_day', count: 1 },
      ritualTitle: '恭喜你迈出了备考第一步！',
      ritualMessage: '每一段旅程都始于第一步，你已经开始了！',
      shareable: true  // 可截图分享
    },
    // 完成全部章节仪式 - "通关"
    all_complete: { 
      id: 'all_complete', 
      title: '学贯东西', 
      icon: '🏆', 
      desc: '完成全部章节', 
      category: 'ritual',
      condition: { type: 'chapters', count: 40 },
      ritualTitle: '通关达成！',
      ritualMessage: '全部章节学习完成，你已经是准导游了！',
      shareable: true
    },
    // 打卡7天仪式 - "坚持一周"
    streak_7_ritual: { 
      id: 'streak_7_ritual', 
      title: '坚持一周', 
      icon: '🔥', 
      desc: '连续打卡7天', 
      category: 'ritual',
      condition: { type: 'streak', count: 7 },
      ritualTitle: '一周打卡达成！',
      ritualMessage: '坚持就是胜利，继续保持这个节奏！',
      shareable: true
    },
    // 打卡30天仪式
    streak_30_ritual: { 
      id: 'streak_30_ritual', 
      title: '月度战神', 
      icon: '💫', 
      desc: '连续打卡30天', 
      category: 'ritual',
      condition: { type: 'streak', count: 30 },
      ritualTitle: '一个月坚持完成！',
      ritualMessage: '真正的学霸就是你！距离上岸越来越近了！',
      shareable: true
    }
  };

  // 精致化5.0-AA: 仪式感成就展示
  const RitualCelebration = {
    // 显示仪式弹窗
    show(achievement) {
      if (!achievement || !achievement.ritualTitle) return;
      
      const modal = document.createElement('div');
      modal.className = 'ritual-modal';
      modal.innerHTML = `
        <div class="ritual-overlay" onclick="RitualCelebration.hide()"></div>
        <div class="ritual-content">
          <div class="ritual-icon">${achievement.icon}</div>
          <h2 class="ritual-title">${achievement.ritualTitle}</h2>
          <p class="ritual-message">${achievement.ritualMessage}</p>
          <div class="ritual-badge">
            <span class="badge-icon">🏅</span>
            <span class="badge-text">成就解锁</span>
          </div>
          <p class="ritual-achievement">${achievement.title}</p>
          ${achievement.shareable ? '<button class="ritual-share-btn" onclick="RitualCelebration.share()">分享到朋友圈</button>' : ''}
          <button class="ritual-close-btn" onclick="RitualCelebration.hide()">继续学习</button>
        </div>
      `;
      
      // 添加样式
      const style = document.createElement('style');
      style.textContent = `
        .ritual-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; }
        .ritual-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); }
        .ritual-content { position: relative; background: linear-gradient(135deg, #F0FDFA, #CCFBF1); border-radius: 24px; padding: 40px 32px; max-width: 340px; width: 90%; text-align: center; box-shadow: 0 20px 60px rgba(230,81,0,0.3); animation: ritualPop 0.5s ease; }
        @keyframes ritualPop { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } }
        .ritual-icon { font-size: 4rem; margin-bottom: 16px; }
        .ritual-title { font-size: 1.5rem; color: #1A1A1A; font-weight: 800; margin-bottom: 12px; }
        .ritual-message { font-size: 0.95rem; color: #666; line-height: 1.6; margin-bottom: 20px; }
        .ritual-badge { display: inline-flex; align-items: center; gap: 6px; background: #0D9488; color: #FFF; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; margin-bottom: 12px; }
        .ritual-achievement { font-size: 1rem; color: #115E59; font-weight: 700; margin-bottom: 20px; }
        .ritual-share-btn { width: 100%; padding: 12px; background: #07C160; color: #FFF; border: none; border-radius: 25px; font-size: 0.9rem; font-weight: 600; cursor: pointer; margin-bottom: 10px; }
        .ritual-close-btn { width: 100%; padding: 12px; background: #FFF; color: #0D9488; border: 2px solid #0D9488; border-radius: 25px; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
      `;
      document.head.appendChild(style);
      document.body.appendChild(modal);
      
      // 阻止背景滚动
      document.body.style.overflow = 'hidden';
      
      // 绑定隐藏事件
      modal._hide = () => {
        modal.remove();
        style.remove();
        document.body.style.overflow = '';
      };
      modal.querySelector('.ritual-close-btn').addEventListener('click', modal._hide);
      modal.querySelector('.ritual-overlay').addEventListener('click', modal._hide);
    },
    
    hide() {
      const modal = document.querySelector('.ritual-modal');
      if (modal && modal._hide) modal._hide();
    },
    
    share() {
      // 生成分享文案
      const text = '我在游导学习笔记完成了学习目标！走过弯路，所以更懂路 🚀';
      // 尝试调用微信分享（如果是微信环境）
      if (typeof wx !== 'undefined' && wx.miniProgram) {
        wx.miniProgram.postMessage({ data: { type: 'share', text } });
      }
      // 复制到剪贴板
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          alert('分享文案已复制，快去朋友圈炫耀吧！');
        });
      }
    },
    
    // 检查首日学习成就
    checkFirstDay() {
      const data = getAchievementData();
      const key = 'first_day_study';
      
      // 如果已经解锁过，不再检查
      if (data.unlocked.includes(key)) return;
      
      // 检查是否完成首日学习（至少学习1个章节或完成1套题）
      const progress = JSON.parse(localStorage.getItem('study_progress') || '{}');
      const chapterCount = Object.keys(progress).filter(k => progress[k] && progress[k].learned).length;
      const quizCount = data.stats.quiz_sets || 0;
      
      if (chapterCount >= 1 || quizCount >= 1) {
        // 解锁成就
        data.unlocked.push(key);
        data.unlockDates[key] = Date.now();
        saveAchievementData(data);
        
        // 显示仪式弹窗
        setTimeout(() => {
          this.show(ALL_ACHIEVEMENTS[key]);
        }, 500);
      }
    }
  };
  
  window.RitualCelebration = RitualCelebration;

  // ========== 刷题等级定义 ==========
  const QUIZ_LEVELS = [
    { level: 1, name: '小白', icon: '🌱', minScore: 0, desc: '刚起步的小白' },
    { level: 2, name: '学徒', icon: '📖', minScore: 10, desc: '开始入门了' },
    { level: 3, name: '考生', icon: '✏️', minScore: 30, desc: '正在备考中' },
    { level: 4, name: '进阶', icon: '📚', minScore: 60, desc: '积累了不少' },
    { level: 5, name: '熟手', icon: '🎯', minScore: 100, desc: '胸有成竹' },
    { level: 6, name: '高手', icon: '🏆', minScore: 200, desc: '实力不俗' },
    { level: 7, name: '专家', icon: '💎', minScore: 400, desc: '接近上岸水平' },
    { level: 8, name: '大师', icon: '👑', minScore: 700, desc: '所向披靡' }
  ];

  // ========== 本地存储操作 ==========
  function getAchievementData() {
    try {
      const data = localStorage.getItem(ACHIEVEMENTS_KEY);
      return data ? JSON.parse(data) : {
        unlocked: [],
        unlockDates: {},
        stats: {
          chapters: 0,
          streak: 0,
          flashcard_sessions: 0,
          cards_mastered: 0,
          quiz_sets: 0,
          quiz_score: 0,
          mistakes_reviewed: 0,
          perfect_streak: 0,
          current_perfect_streak: 0,
          favorites: 0,
          study_time: 0
        },
        last_checkin: null
      };
    } catch(e) {
      return { unlocked: [], unlockDates: {}, stats: {}, last_checkin: null };
    }
  }

  function saveAchievementData(data) {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(data));
  }

  // ========== 成就解锁检查 ==========
  function checkAndUnlock() {
    const data = getAchievementData();
    let newUnlocks = [];

    // 更新章节数
    const progress = JSON.parse(localStorage.getItem('study_progress') || '{}');
    const chapterCount = Object.keys(progress).filter(k => progress[k] && progress[k].learned).length;
    data.stats.chapters = chapterCount;

    // 更新打卡天数
    const streak = getCheckinStreak();
    data.stats.streak = streak;

    // 更新闪卡
    const flashcardProgress = JSON.parse(localStorage.getItem('flashcard_progress') || '{"mastered":[]}');
    data.stats.cards_mastered = flashcardProgress.mastered ? flashcardProgress.mastered.length : 0;

    // 检查章节成就
    const chapterAchievements = ['first_chapter', 'five_chapters', 'ten_chapters', 'half_chapters', 'all_chapters'];
    chapterAchievements.forEach(id => {
      const ach = ALL_ACHIEVEMENTS[id];
      if (!data.unlocked.includes(id) && chapterCount >= ach.condition.count) {
        data.unlocked.push(id);
        data.unlockDates[id] = new Date().toISOString();
        newUnlocks.push(ach);
      }
    });

    // 检查打卡成就
    const streakAchievements = ['streak_3', 'streak_7', 'streak_14', 'streak_30'];
    streakAchievements.forEach(id => {
      const ach = ALL_ACHIEVEMENTS[id];
      if (!data.unlocked.includes(id) && streak >= ach.condition.count) {
        data.unlocked.push(id);
        data.unlockDates[id] = new Date().toISOString();
        newUnlocks.push(ach);
      }
    });

    saveAchievementData(data);

    // 显示新解锁的成就
    if (newUnlocks.length > 0 && typeof showAchievementUnlock === 'function') {
      newUnlocks.forEach((ach, i) => {
        setTimeout(() => showAchievementUnlock(ach), i * 500);
      });
    }

    return newUnlocks;
  }

  function getCheckinStreak() {
    const checkinData = JSON.parse(localStorage.getItem('daily_checkin') || '{"dates":[]}');
    if (!checkinData.dates || checkinData.dates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let checkDate = new Date(today);

    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    const hasToday = checkinData.dates.includes(todayStr);

    if (!hasToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = checkDate.getFullYear() + '-' + String(checkDate.getMonth() + 1).padStart(2, '0') + '-' + String(checkDate.getDate()).padStart(2, '0');
      if (checkinData.dates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  // ========== 刷题等级 ==========
  function getQuizLevel() {
    const data = getAchievementData();
    const score = data.stats.quiz_score || 0;
    
    for (let i = QUIZ_LEVELS.length - 1; i >= 0; i--) {
      if (score >= QUIZ_LEVELS[i].minScore) {
        return QUIZ_LEVELS[i];
      }
    }
    return QUIZ_LEVELS[0];
  }

  function addQuizScore(points) {
    const data = getAchievementData();
    data.stats.quiz_score = (data.stats.quiz_score || 0) + points;
    saveAchievementData(data);
    checkAndUnlock();
    return getQuizLevel();
  }

  // ========== 章节推荐 ==========
  function getNextChapter(currentChapterId) {
    const order = getChapterOrder();
    const currentIndex = order.indexOf(currentChapterId);
    
    if (currentIndex === -1 || currentIndex >= order.length - 1) {
      const progress = JSON.parse(localStorage.getItem('study_progress') || '{}');
      for (let i = 0; i < order.length; i++) {
        if (!progress[order[i]] || !progress[order[i]].learned) {
          return order[i];
        }
      }
      return null;
    }
    
    return order[currentIndex + 1];
  }

  function getChapterOrder() {
    const cached = localStorage.getItem(CHAPTER_ORDER_KEY);
    if (cached) return JSON.parse(cached);
    
    const order = [
      'business-ch01', 'business-ch02', 'business-ch03', 'business-ch04', 'business-ch05',
      'business-ch06', 'business-ch07', 'business-ch08', 'business-ch09',
      'policy-ch01', 'policy-ch02', 'policy-ch03', 'policy-ch04', 'policy-ch06',
      'policy-ch07', 'policy-ch10', 'policy-ch11', 'policy-ch15', 'policy-ch18',
      'national-ch01', 'national-ch02', 'national-ch03', 'national-ch04', 'national-ch05',
      'national-ch06', 'national-ch07', 'national-ch08', 'national-ch09', 'national-ch10', 'national-ch11',
      'local-ch01', 'local-ch02', 'local-ch03', 'local-ch04', 'local-ch05',
      'local-ch06', 'local-ch07', 'local-ch08'
    ];
    
    localStorage.setItem(CHAPTER_ORDER_KEY, JSON.stringify(order));
    return order;
  }

  function getChapterName(chapterId) {
    const names = {
      'business-ch01': '导游服务', 'business-ch02': '导游带团', 'business-ch03': '团队管理', 'business-ch04': '散客服务',
      'business-ch05': '语言技能', 'business-ch06': '带团技巧', 'business-ch07': '讲解技能', 'business-ch08': '应急处理', 'business-ch09': '相关知识',
      'policy-ch01': '旅游法', 'policy-ch02': '合同', 'policy-ch03': '旅游者', 'policy-ch04': '旅游市场', 'policy-ch06': '导游管理',
      'policy-ch07': '安全', 'policy-ch10': '出入境', 'policy-ch11': '交通', 'policy-ch15': '保险', 'policy-ch18': '投诉',
      'national-ch01': '党史', 'national-ch02': '文化', 'national-ch03': '遗产', 'national-ch04': '文学', 'national-ch05': '建筑',
      'national-ch06': '园林', 'national-ch07': '餐饮', 'national-ch08': '工艺', 'national-ch09': '民族', 'national-ch10': '地理', 'national-ch11': '特产',
      'local-ch01': '地方知识1', 'local-ch02': '地方知识2', 'local-ch03': '地方知识3', 'local-ch04': '地方知识4',
      'local-ch05': '地方知识5', 'local-ch06': '地方知识6', 'local-ch07': '地方知识7', 'local-ch08': '地方知识8'
    };
    return names[chapterId] || chapterId;
  }

  // ========== 成就展示页 ==========
  function renderAchievementsPage(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = getAchievementData();
    const level = getQuizLevel();
    const stats = data.stats;

    let html = '<div class="achievement-header"><div class="ach-level"><span class="ach-level-icon">' + level.icon + '</span><span class="ach-level-name">' + level.name + '</span></div><div class="ach-level-desc">' + level.desc + '</div><div class="ach-score">刷题积分: <strong>' + (stats.quiz_score || 0) + '</strong></div></div><div class="ach-section"><h3 class="ach-section-title">📊 学习统计</h3><div class="ach-stats-grid"><div class="ach-stat-item"><div class="ach-stat-num">' + (stats.chapters || 0) + '</div><div class="ach-stat-label">已学章节</div></div><div class="ach-stat-item"><div class="ach-stat-num">' + (stats.streak || 0) + '</div><div class="ach-stat-label">连续打卡</div></div><div class="ach-stat-item"><div class="ach-stat-num">' + (stats.cards_mastered || 0) + '</div><div class="ach-stat-label">掌握闪卡</div></div><div class="ach-stat-item"><div class="ach-stat-num">' + (stats.quiz_sets || 0) + '</div><div class="ach-stat-label">完成套题</div></div></div></div><div class="ach-section"><h3 class="ach-section-title">🏆 已获成就 (' + data.unlocked.length + '/' + Object.keys(ALL_ACHIEVEMENTS).length + ')</h3><div class="ach-grid">';

    const categories = {
      chapter: { name: '通关成就', icon: '📚' },
      streak: { name: '打卡里程碑', icon: '🔥' },
      flashcard: { name: '闪卡成就', icon: '🃏' },
      quiz: { name: '刷题成就', icon: '✏️' },
      mistake: { name: '错题成就', icon: '🔧' },
      collect: { name: '收藏成就', icon: '📌' },
      time: { name: '时间成就', icon: '⏰' }
    };

    Object.keys(categories).forEach(cat => {
      html += '<div class="ach-category"><h4>' + categories[cat].icon + ' ' + categories[cat].name + '</h4><div class="ach-list">';
      
      Object.values(ALL_ACHIEVEMENTS)
        .filter(a => a.category === cat)
        .forEach(ach => {
          const unlocked = data.unlocked.includes(ach.id);
          const date = data.unlockDates[ach.id];
          html += '<div class="ach-item ' + (unlocked ? 'unlocked' : 'locked') + '"><div class="ach-icon">' + ach.icon + '</div><div class="ach-info"><div class="ach-title">' + ach.title + '</div><div class="ach-desc">' + ach.desc + '</div>' + (date ? '<div class="ach-date">解锁: ' + new Date(date).toLocaleDateString() + '</div>' : '') + '</div></div>';
        });
      
      html += '</div></div>';
    });

    html += '</div></div>';
    container.innerHTML = html;
  }

  // ========== 导出API ==========
  window.Achievements = {
    check: checkAndUnlock,
    getData: getAchievementData,
    getLevel: getQuizLevel,
    addQuizScore: addQuizScore,
    getNextChapter: getNextChapter,
    getChapterName: getChapterName,
    getChapterOrder: getChapterOrder,
    renderPage: renderAchievementsPage,
    getStreak: getCheckinStreak
  };

  setTimeout(checkAndUnlock, 1000);

})();
