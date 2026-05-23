/**
 * 精致化5.0 - 季节性视觉系统
 * 根据当前月份微调页面色调
 * 春季3-5月：清新活跃感
 * 夏季6-8月：专注沉稳感
 * 秋季9-11月：紧张但有序（考试季）
 * 冬季12-2月：温暖期待感
 */
(function() {
  'use strict';
  
  const MONTH = new Date().getMonth() + 1; // 1-12
  
  // 季节配置
  const SEASONS = {
    spring: { months: [3, 4, 5], name: '春', accent: '#4CAF50', bg: '#E8F5E9', mood: '清新活跃' },
    summer: { months: [6, 7, 8], name: '夏', accent: '#2196F3', bg: '#E3F2FD', mood: '专注沉稳' },
    autumn: { months: [9, 10, 11], name: '秋', accent: '#FF9800', bg: '#FFF3E0', mood: '紧张有序' },
    winter: { months: [12, 1, 2], name: '冬', accent: '#E91E63', bg: '#FCE4EC', mood: '温暖期待' }
  };
  
  function getSeason() {
    if (MONTH >= 3 && MONTH <= 5) return SEASONS.spring;
    if (MONTH >= 6 && MONTH <= 8) return SEASONS.summer;
    if (MONTH >= 9 && MONTH <= 11) return SEASONS.autumn;
    return SEASONS.winter;
  }
  
  const currentSeason = getSeason();
  
  // 添加季节数据到body
  document.documentElement.dataset.season = currentSeason.name;
  document.documentElement.dataset.mood = currentSeason.mood;
  
  // 考试季特殊处理（9-11月）
  const isExamSeason = MONTH >= 9 && MONTH <= 11;
  if (isExamSeason) {
    document.documentElement.dataset.examSeason = 'true';
  }
  
  // 注入季节性样式微调
  function injectSeasonalStyles() {
    const style = document.createElement('style');
    style.id = 'seasonal-styles';
    
    // 秋季考试季特殊强调
    if (isExamSeason) {
      style.textContent = `
        /* 考试季氛围：增加紧迫感但不焦虑 */
        :root[data-exam-season="true"] {
          --season-accent: #E65100;
          --exam-tint: rgba(230, 81, 0, 0.05);
        }
        
        /* 考试季CTA按钮加强 */
        [data-exam-season="true"] .cta-primary,
        [data-exam-season="true"] .package-btn,
        [data-exam-season="true"] .btn-activate {
          animation: examPulse 2s ease-in-out infinite;
        }
        
        @keyframes examPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(230, 81, 0, 0.3); }
          50% { box-shadow: 0 4px 30px rgba(230, 81, 0, 0.5); }
        }
      `;
    } else {
      // 非考试季：季节色调微调
      const seasonColor = currentSeason.accent;
      style.textContent = `
        /* 季节色调微调 */
        :root[data-season="${currentSeason.name}"] {
          --season-accent: ${seasonColor};
          --season-bg: ${currentSeason.bg};
        }
        
        /* 季节性装饰 */
        body::before {
          content: '${currentSeason.mood}';
          position: fixed;
          bottom: 80px;
          left: 16px;
          font-size: 0.65rem;
          color: #bbb;
          opacity: 0.6;
          z-index: 100;
        }
      `;
    }
    
    document.head.appendChild(style);
  }
  
  // 季节性问候语
  function getSeasonalGreeting() {
    const greetings = {
      spring: ['万物复苏，春暖花开 🌸', '春天来了，学习正当时 🌱', '春意盎然，备考加油 🌷'],
      summer: ['夏日炎炎，学习不停 🌞', '专注当下，静心备考 🌻', '炎炎夏日，稳步前行 ☀️'],
      autumn: ['金秋时节，全力冲刺 🍂', '考试临近，从容应对 📚', '秋高气爽，备考正当时 🍁'],
      winter: ['冬日暖阳，蓄势待发 ❄️', '寒冷冬季，温暖学习 🔥', '年末将至，静待花开 🌺']
    };
    
    const seasonGreetings = greetings[currentSeason.name];
    return seasonGreetings[Math.floor(Math.random() * seasonGreetings.length)];
  }
  
  // 暴露API
  window.SeasonalTheme = {
    getSeason: getSeason,
    getSeasonalGreeting: getSeasonalGreeting,
    isExamSeason: isExamSeason
  };
  
  // DOM加载后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSeasonalStyles);
  } else {
    injectSeasonalStyles();
  }
})();
