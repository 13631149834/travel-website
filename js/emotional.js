// 情感化设计模块 v5.0-Y - 鼓励语、场景问候、仪式感动画、情感节奏、情绪触发点
// 精致化5.0-Y批次更新：新增情绪触发点文案（好奇/共鸣/焦虑缓解/成就/稀缺）
(function() {
  'use strict';

  // ========== 情绪触发点文案库 v5.0-Y ==========
  const EMOTION_TRIGGERS = {
    // 好奇触发
    curiosity: [
      '导游证到底难不难？答案和你想的不一样',
      '为什么有人一次上岸，有人考三次？',
      '零基础备考导游证，从哪开始？',
      '导游证考试通过率到底有多少？',
      '面试最难的部分居然是这个'
    ],
    // 共鸣触发
    empathy: [
      '第一次挂在笔试，不是不会，是方法不对',
      '背了忘，忘了背，是不是你？',
      '考试前焦虑到睡不着？',
      '看教材像看天书？',
      '别人都过了，我还没开始'
    ],
    // 焦虑缓解
    anxietyRelief: [
      '80%的人都在笔试这关卡住，不是你不行',
      '导游证备考有方法，曼曼带你走捷径',
      '别慌，按我的计划来，每天2小时稳稳上岸',
      '备考时间不够？教你高效利用碎片时间',
      '只要你坚持，就已经超过一半的人了'
    ],
    // 成就触发
    achievement: [
      '又攻克一个章节，你离上岸更近了',
      '完成今日学习计划，进步一点点',
      '连续打卡3天！好习惯正在养成',
      '恭喜完成本章学习，知识点已get',
      '今日学习目标达成，休息一下吧'
    ],
    // 稀缺触发（真实不夸张）
    scarcity: [
      '资料包随时可购，但早买早开始',
      'AI助手无限提问，随时等你来问',
      '1v1答疑通道开放，微信ximao101',
      '全套资料包¥69.9，362份文档',
      '现在入手，备考时间更充裕'
    ]
  };
  const ENCOURAGEMENTS = {
    // 章节完成
    chapterComplete: [
      '太棒了！这个章节掌握得很扎实，继续保持！🎉',
      '又攻克一个难点，你离上岸又近了一步！💪',
      '坚持就是胜利，每一个章节都是进步！🌟',
      '今天的努力，明天的底气！为你点赞！👍',
      '学习状态越来越好了，继续看好你！🔥'
    ],
    
    // 打卡
    checkin: [
      '打卡成功！今天的你比昨天更优秀！✨',
      '坚持打卡，为你骄傲！🏆',
      '一天不落地学习，上岸指日可待！📈',
      '早起打卡，勤奋的你最美！🌅',
      '又完成一天的学习计划，太厉害了！👏'
    ],
    
    // 闪卡完成
    flashcardComplete: [
      '闪卡全部掌握，口诀已经刻进脑子里了！🧠',
      '刷完闪卡，记忆效果翻倍！💯',
      '这些知识点已经牢牢记住了！⭐',
      '闪卡刷得好，考试没烦恼！📚',
      '又积累了一波知识，继续加油！🚀'
    ],
    
    // 刷题完成
    quizComplete: [
      '又进步了一点！💪',
      '题目做完了，及时复盘效果更好哦！📝',
      '做题认真又细心，为你点赞！✅',
      '这套题做下来，收获不小吧？🎯',
      '考试越来越近了，多练多总结！💪',
      '每一道题都是进步的阶梯！🌟'
    ],
    
    // 打卡里程碑
    streakMilestone: {
      3: '连续3天打卡！好习惯正在养成！🔥',
      7: '一周打卡达成！学习节奏很稳！⭐',
      14: '两周坚持下来了，你真棒！🌟',
      30: '一个月连续打卡！上岸稳了！🏆',
      60: '两个月连续打卡！真正的学霸！🚀',
      100: '百日坚持！你已经超越了大部分人！👑'
    },
    
    // 错误温和引导
    errorGentle: [
      '没关系，错了就是学习的机会 💪',
      '这道题没答对，正好查漏补缺',
      '不要气馁，继续加油！✨',
      '错误是最好的老师，下次一定行！',
      '备考路上，谁还没踩过几个坑呢 😊'
    ],
    
    // 安静专注（学习页面）
    focusMode: [
      '专注学习中，加油 💪',
      '沉下心来，你是最棒的',
      '专注的你闪闪发光 ✨'
    ],
    
    // 完成庆祝
    celebration: [
      '🎉 太棒了！又完成一次学习',
      '✨ 恭喜你完成了这个挑战',
      '💪 继续加油，你越来越强了',
      '🏆 这就是坚持的力量'
    ],
    
    // 精致化4.0: 空状态提示
    emptyState: {
      study: '还没有学习记录，今天开始吧！',
      search: '试试搜索导游证考点',
      favorites: '还没有收藏内容',
      wrongQuestions: '目前还没有错题，继续保持！'
    },
    
    // 精致化4.0: 错误提示
    error: {
      general: '出了点小状况，刷新试试？',
      network: '网络有点慢，稍后再试',
      server: '服务器开小差，马上回来'
    },
    
    // 精致化4.0: 加载提示
    loading: '马上就好...',
    
    // 精致化4.0: 成功提示
    success: '搞定！',
    
    // 精致化4.0: 确认删除
    confirmDelete: '确定要清除吗？学习记录找不回来哦',
    
    // 精致化4.0: 提醒语
    reminder: {
      daily: '今天还没学习哦',
      weekly: '这周还没打卡呢'
    },
    
    // 精致化4.0: 完成语
    complete: {
      daily: '太棒了，今天的任务全部完成！',
      chapter: '这个章节掌握得很扎实！',
      milestone: '里程碑达成，继续冲刺！'
    },
    
    // 精致化5.0-AA: 场景化文案（按时间段推送）
    scenario: {
      // 早晨6-9点
      earlyMorning: [
        '早安！新的一天从学习开始',
        '早起学习，今天效率翻倍',
        '清晨时光，适合静心备考'
      ],
      // 上午9-12点
      morning: [
        '上午正是学习好时光',
        '把握当下，备考路上更进一步'
      ],
      // 中午11-13点
      noon: [
        '午休时间，看两道题吧',
        '休息间隙抽空学习',
        '午餐后的小憩，不如做道题'
      ],
      // 下午14-18点
      afternoon: [
        '下午好，继续学习吧',
        '充实的一天，从学习开始'
      ],
      // 晚上20-23点
      evening: [
        '晚上好！今天学了吗？',
        '夜深人静，正是学习好时机',
        '晚上充电，明天更有底气'
      ],
      // 深夜23点后
      lateNight: [
        '夜深了，早点休息明天继续',
        '辛苦了，早点休息吧',
        '熬夜伤身，明天早起学习更有效率'
      ],
      // 周末
      weekend: [
        '周末充电好时机！',
        '周末不荒废，学习正当时',
        '周末学习一小步，上岸前进一大步'
      ],
      // 考前一个月
      examMonth: [
        '最后冲刺，坚持住！',
        '距离考试还有一个月，冲刺吧！',
        '备考倒计时，每一天都很关键'
      ],
      // 考前一周
      examWeek: [
        '最后一周，全力以赴！',
        '决战时刻，加油！'
      ],
      // 首次访问
      firstVisit: [
        '欢迎来到游导学习笔记！',
        '很高兴遇见你，一起加油备考！'
      ],
      // 回访用户
      returnVisit: [
        '欢迎回来，继续学习吧',
        '好久不见，你的学习进度还等着你呢'
      ]
    }
  };

  // ========== 精致化5.0-AA: 获取场景化问候 ==========
  function getScenarioGreeting() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;
    
    // 检查是否临近考试（假设11月考试，可根据实际情况调整）
    const examMonth = 10; // 0-indexed，11月考试
    const examCountdown = examMonth - now.getMonth();
    const isExamSeason = examCountdown >= 0 && examCountdown <= 1;
    
    let messages;
    
    if (isExamSeason) {
      // 考前一个月内
      messages = ENCOURAGEMENTS.scenario.examMonth;
    } else if (hour >= 23 || hour < 6) {
      // 深夜
      messages = ENCOURAGEMENTS.scenario.lateNight;
    } else if (hour >= 6 && hour < 9) {
      // 早晨
      messages = ENCOURAGEMENTS.scenario.earlyMorning;
    } else if (hour >= 11 && hour < 14) {
      // 中午
      messages = ENCOURAGEMENTS.scenario.noon;
    } else if (hour >= 20 && hour < 23) {
      // 晚上
      messages = ENCOURAGEMENTS.scenario.evening;
    } else if (isWeekend) {
      // 周末
      messages = ENCOURAGEMENTS.scenario.weekend;
    } else if (hour >= 9 && hour < 12) {
      // 上午
      messages = ENCOURAGEMENTS.scenario.morning;
    } else {
      // 下午
      messages = ENCOURAGEMENTS.scenario.afternoon;
    }
    
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  // 暴露到全局
  window.getScenarioGreeting = getScenarioGreeting;

  // ========== 场景问候 ==========
  // 暴露情绪触发点库到全局
  window.EMOTION_TRIGGERS = EMOTION_TRIGGERS;
  
  // 获取情绪触发文案
  function getEmotionTrigger(type) {
    const arr = EMOTION_TRIGGERS[type];
    if (!arr || !Array.isArray(arr)) return '';
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 9) {
      return '早上好呀';
    } else if (hour >= 9 && hour < 12) {
      return '上午好';
    } else if (hour >= 12 && hour < 14) {
      return '中午好';
    } else if (hour >= 14 && hour < 18) {
      return '下午好';
    } else if (hour >= 18 && hour < 22) {
      return '晚上好';
    } else {
      return '夜深了';
    }
  }

  function getMotivationalQuote() {
    const quotes = [
      '每一次努力，都是成功的积累',
      '坚持学习，终会遇见更好的自己',
      '今天多学一点，明天少背一点',
      '备考路上，你不是一个人在战斗',
      '走过弯路，所以更懂路',
      '每天进步一点点，上岸近一大步',
      '相信努力，相信自己',
      '用心备考，用实力说话'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // ========== 随机获取鼓励语 ==========
  function getRandomEncouragement(type) {
    const arr = ENCOURAGEMENTS[type];
    if (!arr) return '';
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getStreakEncouragement(streak) {
    const milestones = [30, 14, 7, 3];
    for (const m of milestones) {
      if (streak >= m) {
        return ENCOURAGEMENTS.streakMilestone[m];
      }
    }
    return getRandomEncouragement('checkin');
  }

  // ========== Toast提示 ==========
  function showEmotionalToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'emotional-toast toast-' + type;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = '<span class="toast-icon">' + getToastIcon(type) + '</span><span class="toast-message">' + message + '</span>';
    
    toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-20px);background:linear-gradient(135deg,#E65100,#FF6D00);color:#fff;padding:14px 24px;border-radius:12px;font-size:15px;z-index:99999;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(230,81,0,0.4);opacity:0;transition:all 0.3s ease;max-width:90%;text-align:center;';
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function getToastIcon(type) {
    const icons = { success: '🎉', warning: '⚠️', info: '💡', error: '❌', encouragement: '✨' };
    return icons[type] || '✨';
  }

  // ========== 撒花动画 ==========
  function showConfettiAnimation(duration = 2000) {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99998;overflow:hidden;';
    document.body.appendChild(container);
    
    const colors = ['#E65100', '#FF6D00', '#FFB74D', '#FFF3E0', '#FFCC80', '#FFE0B2'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = 'position:absolute;width:10px;height:10px;background:' + colors[Math.floor(Math.random() * colors.length)] + ';left:' + Math.random() * 100 + '%;top:-20px;border-radius:' + (Math.random() > 0.5 ? '50%' : '0') + ';opacity:0.9;';
      
      const animation = confetti.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: 'translateY(' + (window.innerHeight + 100) + 'px) rotate(' + (Math.random() * 720 - 360) + 'deg)', opacity: 0 }
      ], {
        duration: duration + Math.random() * 1000,
        delay: Math.random() * 500,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });
      
      container.appendChild(confetti);
      animation.onfinish = () => confetti.remove();
    }
    
    setTimeout(() => container.remove(), duration + 2000);
  }

  // ========== 成就解锁动画 ==========
  function showAchievementUnlock(achievement) {
    const modal = document.createElement('div');
    modal.className = 'confetti-container';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', '成就解锁');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:99999;display:flex;justify-content:center;align-items:center;opacity:0;transition:opacity 0.3s;';
    
    modal.innerHTML = '<div style="background:linear-gradient(135deg,#FFF3E0,#FFE0B2);border-radius:20px;padding:40px;text-align:center;max-width:320px;animation:achievementBounce 0.5s ease;"><div style="font-size:60px;margin-bottom:15px;">' + achievement.icon + '</div><div style="font-size:14px;color:#BF360C;margin-bottom:8px;">🏆 成就解锁</div><div style="font-size:22px;font-weight:800;color:#E65100;margin-bottom:10px;">' + achievement.title + '</div><div style="font-size:14px;color:#666;">' + achievement.desc + '</div><div style="margin-top:20px;font-size:12px;color:#999;">走过弯路，所以更懂路</div></div>';
    
    document.body.appendChild(modal);
    
    requestAnimationFrame(() => modal.style.opacity = '1');
    
    setTimeout(() => {
      modal.style.opacity = '0';
      setTimeout(() => modal.remove(), 300);
    }, 3000);
  }

  // ========== 打卡成功动画 ==========
  function showCheckinSuccessAnimation() {
    showConfettiAnimation(2000);
    const streak = Achievements ? Achievements.getStreak() : 0;
    const message = streak >= 3 ? getStreakEncouragement(streak) : getRandomEncouragement('checkin');
    showEmotionalToast(message, 'encouragement');
  }

  // ========== 章节完成提示 ==========
  function showChapterCompleteAnimation(chapterName) {
    showConfettiAnimation(1500);
    const message = getRandomEncouragement('chapterComplete');
    showEmotionalToast(message + ' 「' + chapterName + '」已学完！', 'success', 4000);
  }

  // ========== 更新问候语 ==========
  function updateGreetingElements() {
    const greeting = getTimeBasedGreeting();
    const quote = getMotivationalQuote();
    
    document.querySelectorAll('.greeting-text').forEach(el => el.textContent = greeting);
    document.querySelectorAll('.motivational-quote').forEach(el => el.textContent = quote);
  }

  // ========== 回访提示 ==========
  function getReturnVisitorMessage() {
    const lastVisit = localStorage.getItem('last_visit_date');
    const today = new Date().toDateString();
    
    if (lastVisit === today) {
      return null; // 今天已访问
    }
    
    localStorage.setItem('last_visit_date', today);
    
    const checkinData = JSON.parse(localStorage.getItem('daily_checkin') || '{"dates":[]}');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    const todayStr = new Date().toDateString();
    const hasCheckedInToday = checkinData.dates.some(d => new Date(d).toDateString() === todayStr);
    
    if (!hasCheckedInToday && lastVisit && new Date(lastVisit).toDateString() !== todayStr) {
      const lastDate = new Date(lastVisit);
      const daysAgo = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysAgo >= 2) {
        return { type: 'return', message: '好久不见！曼曼想你了，快回来学习吧～' + getTimeBasedGreeting() + '好！' };
      }
    }
    
    return { type: 'daily', message: getTimeBasedGreeting() + '！' + getMotivationalQuote() };
  }

  // ========== 上次学习位置 ==========
  function getLastStudyPosition() {
    const progress = JSON.parse(localStorage.getItem('study_progress') || '{}');
    const order = Achievements ? Achievements.getChapterOrder() : [];
    
    // 找到最后一个学习的章节
    for (let i = order.length - 1; i >= 0; i--) {
      if (progress[order[i]] && progress[order[i]].learned) {
        const chapterId = order[i];
        const chapterName = Achievements ? Achievements.getChapterName(chapterId) : chapterId;
        return { chapterId, chapterName, index: i + 1, total: order.length };
      }
    }
    
    return null;
  }

  // ========== 未打卡提示 ==========
  function getUncheckinReminder() {
    const checkinData = JSON.parse(localStorage.getItem('daily_checkin') || '{"dates":[]}');
    const todayStr = new Date().toDateString();
    const hasCheckedInToday = checkinData.dates.some(d => new Date(d).toDateString() === todayStr);
    
    if (!hasCheckedInToday) {
      const hour = new Date().getHours();
      if (hour < 12) {
        return '今日还未打卡哦，早起学习效率高！';
      } else if (hour < 18) {
        return '下午好，今天还没打卡呢～';
      } else {
        return '今天的学习打卡了吗？别忘了哦！';
      }
    }
    
    return null;
  }

  // ========== 导出API ==========
  window.Emotional = {
    getGreeting: getTimeBasedGreeting,
    getQuote: getMotivationalQuote,
    showToast: showEmotionalToast,
    showConfetti: showConfettiAnimation,
    showAchievement: showAchievementUnlock,
    showCheckinAnimation: showCheckinSuccessAnimation,
    showChapterComplete: showChapterCompleteAnimation,
    updateGreeting: updateGreetingElements,
    getReturnMessage: getReturnVisitorMessage,
    getLastPosition: getLastStudyPosition,
    getUncheckinReminder: getUncheckinReminder,
    getStreakMessage: getStreakEncouragement,
    encouragements: ENCOURAGEMENTS
  };

  // 页面加载时更新问候语
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateGreetingElements);
  } else {
    updateGreetingElements();
  }

})();
