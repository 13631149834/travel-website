/**
 * 每日能量语 + 心情主题系统
 * 每天自动切换鼓励语，支持5种心情主题
 */
(function() {
  'use strict';

  // ========== 每日能量语库 ==========
  const energyQuotes = [
    // 🌟 鼓励坚持
    { text: "今天的努力，是明天的底气", mood: "motivated" },
    { text: "每天进步一点点，上岸就在不远处", mood: "motivated" },
    { text: "坚持不下去的时候，想想当初为什么出发", mood: "motivated" },
    { text: "你不是在熬，你是在积累", mood: "motivated" },
    { text: "备考路上没有白走的路，每一步都算数", mood: "motivated" },
    { text: "慢一点没关系，别停下来就好", mood: "motivated" },
    { text: "今天的你，比昨天更接近上岸", mood: "motivated" },
    { text: "别人能做到的，你也可以", mood: "motivated" },
    { text: "每一道题都是通往证书的台阶", mood: "motivated" },
    { text: "努力不会骗人，时间会证明一切", mood: "motivated" },
    // 💪 励志打气
    { text: "笔试不过？那就再来一次", mood: "strong" },
    { text: "挂了不可怕，可怕的是不敢再考", mood: "strong" },
    { text: "曼曼考了两次才上岸，你也可以", mood: "strong" },
    { text: "别怕失败，怕的是不再尝试", mood: "strong" },
    { text: "跌倒七次，爬起来八次", mood: "strong" },
    { text: "困难是暂时的，证书是永久的", mood: "strong" },
    { text: "面试能过一次，就能过第二次", mood: "strong" },
    { text: "你比想象中更厉害", mood: "strong" },
    // 🌈 温暖治愈
    { text: "累了就休息一下，别跟自己较劲", mood: "warm" },
    { text: "备考重要，但你的健康更重要", mood: "warm" },
    { text: "允许自己偶尔低落，明天又是新的一天", mood: "warm" },
    { text: "你已经很努力了，对自己好一点", mood: "warm" },
    { text: "慢慢来，比较快", mood: "warm" },
    { text: "今天的你，值得被温柔以待", mood: "warm" },
    { text: "不完美的备考，也能换来完美的结果", mood: "warm" },
    { text: "焦虑是正常的，说明你在乎", mood: "warm" },
    // 🎯 专注提醒
    { text: "别刷手机了，去背一道题", mood: "focus" },
    { text: "距离上岸，就差今天的这杯茶和几道题", mood: "focus" },
    { text: "先做完这一套题，再想别的", mood: "focus" },
    { text: "别想太多，做就对了", mood: "focus" },
    { text: "专注当下，一题一题来", mood: "focus" },
    { text: "今天的任务今天完成，别留给明天", mood: "focus" },
    // ✨ 考试智慧
    { text: "背不下来？试试口诀和框架", mood: "smart" },
    { text: "会的不丢分，就是最好的策略", mood: "smart" },
    { text: "考试不是考你全都会，是考你少犯错", mood: "smart" },
    { text: "口诀记不住？录下来反复听", mood: "smart" },
    { text: "框架比死背更有效", mood: "smart" },
    { text: "错题比新题更有价值", mood: "smart" },
    { text: "别贪多，把做过的题搞懂就够了", mood: "smart" },
    { text: "模拟题不是真题，但能帮你找到节奏", mood: "smart" },
  ];

  // ========== 心情主题配色 ==========
  const moodThemes = {
    motivated: {
      name: "元气满满",
      icon: "🌟",
      gradient: "linear-gradient(135deg, #0D9488, #14B8A6)",
      bg: "#F0FDFA",
      accent: "#0D9488",
      light: "#CCFBF1",
      text: "#115E59",
    },
    strong: {
      name: "斗志昂扬",
      icon: "💪",
      gradient: "linear-gradient(135deg, #DC2626, #F97316)",
      bg: "#FFF7ED",
      accent: "#DC2626",
      light: "#FEE2E2",
      text: "#991B1B",
    },
    warm: {
      name: "温暖治愈",
      icon: "🌈",
      gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
      bg: "#FFFBEB",
      accent: "#F59E0B",
      light: "#FEF3C7",
      text: "#92400E",
    },
    focus: {
      name: "沉浸专注",
      icon: "🎯",
      gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)",
      bg: "#F5F3FF",
      accent: "#7C3AED",
      light: "#EDE9FE",
      text: "#5B21B6",
    },
    smart: {
      name: "智慧备考",
      icon: "✨",
      gradient: "linear-gradient(135deg, #2563EB, #60A5FA)",
      bg: "#EFF6FF",
      accent: "#2563EB",
      light: "#DBEAFE",
      text: "#1E40AF",
    },
  };

  // ========== 根据日期获取当天的能量语 ==========
  function getDailyQuote() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % energyQuotes.length;
    return energyQuotes[index];
  }

  // ========== 获取用户心情 ==========
  function getUserMood() {
    const stored = localStorage.getItem('youdao_mood');
    if (stored && moodThemes[stored]) return stored;
    // 默认根据当天能量语的mood
    return getDailyQuote().mood;
  }

  // ========== 设置用户心情 ==========
  function setUserMood(mood) {
    if (moodThemes[mood]) {
      localStorage.setItem('youdao_mood', mood);
      applyMoodTheme(mood);
    }
  }

  // ========== 应用心情主题 ==========
  function applyMoodTheme(mood) {
    const theme = moodThemes[mood];
    if (!theme) return;

    // 更新能量卡样式
    const card = document.getElementById('energyCard');
    if (card) {
      card.style.background = theme.gradient;
      card.querySelector('.energy-text').style.color = '#FFFFFF';
      card.querySelector('.energy-mood-label').textContent = theme.icon + ' ' + theme.name;
    }
  }

  // ========== 渲染能量卡 ==========
  function renderEnergyCard() {
    const quote = getDailyQuote();
    const mood = getUserMood();
    const theme = moodThemes[mood];

    // 查找或创建能量卡容器
    let container = document.getElementById('energyCardContainer');
    if (!container) {
      // 在hero-slogan后面插入
      const slogan = document.querySelector('.hero-slogan');
      if (!slogan) return;
      container = document.createElement('div');
      container.id = 'energyCardContainer';
      slogan.parentNode.insertBefore(container, slogan.nextSibling);
    }

    container.innerHTML = `
      <div id="energyCard" style="
        background: ${theme.gradient};
        border-radius: 16px;
        padding: 16px 20px;
        margin-bottom: 20px;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.3s, box-shadow 0.3s;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 24px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'">
        <div style="position:absolute;top:-20px;right:-20px;width:80px;height:80px;background:rgba(255,255,255,0.1);border-radius:50%;"></div>
        <div style="position:absolute;bottom:-15px;left:-15px;width:60px;height:60px;background:rgba(255,255,255,0.08);border-radius:50%;"></div>
        <div class="energy-mood-label" style="font-size:0.75rem;color:rgba(255,255,255,0.85);margin-bottom:8px;font-weight:600;">
          ${theme.icon} ${theme.name} · 每日能量
        </div>
        <div class="energy-text" style="font-size:1.1rem;color:#FFFFFF;font-weight:700;line-height:1.6;position:relative;z-index:1;">
          「${quote.text}」
        </div>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;" id="moodSwitcher">
          ${Object.entries(moodThemes).map(([key, t]) => `
            <button onclick="window.switchMood('${key}')" style="
              padding: 4px 10px;
              border-radius: 12px;
              border: 1px solid rgba(255,255,255,${key === mood ? '0.8' : '0.3'});
              background: ${key === mood ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'};
              color: #FFFFFF;
              font-size: 0.7rem;
              cursor: pointer;
              transition: all 0.2s;
            " onmouseover="this.style.background='rgba(255,255,255,0.25)'" onmouseout="this.style.background='${key === mood ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}'">
              ${t.icon} ${t.name}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ========== 全局方法 ==========
  window.switchMood = function(mood) {
    setUserMood(mood);
    renderEnergyCard();
  };

  // ========== 自动渲染 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderEnergyCard);
  } else {
    renderEnergyCard();
  }

})();
