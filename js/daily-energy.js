/**
 * 每日能量语 + 心情主题系统 v2.0
 * 每天自动切换心情+配色+鼓励语，网站每天都不同
 * 用户手动选的心情只当天有效，第二天自动换新
 */
(function() {
  'use strict';

  // ========== 每日能量语库 ==========
  const energyQuotes = [
    { text: "今天的努力，是明天的底气", mood: "motivated" },
    { text: "每天进步一点点，上岸就在不远处", mood: "motivated" },
    { text: "坚持不下去的时候，想想当初为什么出发", mood: "motivated" },
    { text: "你不是在熬，你是在积累", mood: "motivated" },
    { text: "慢一点没关系，别停下来就好", mood: "motivated" },
    { text: "今天的你，比昨天更接近上岸", mood: "motivated" },
    { text: "别人能做到的，你也可以", mood: "motivated" },
    { text: "每一道题都是通往证书的台阶", mood: "motivated" },
    { text: "努力不会骗人，时间会证明一切", mood: "motivated" },
    { text: "备考路上没有白走的路，每一步都算数", mood: "motivated" },
    { text: "笔试不过？那就再来一次", mood: "strong" },
    { text: "挂了不可怕，可怕的是不敢再考", mood: "strong" },
    { text: "曼曼考了两次才上岸，你也可以", mood: "strong" },
    { text: "别怕失败，怕的是不再尝试", mood: "strong" },
    { text: "跌倒七次，爬起来八次", mood: "strong" },
    { text: "困难是暂时的，证书是永久的", mood: "strong" },
    { text: "面试能过一次，就能过第二次", mood: "strong" },
    { text: "你比想象中更厉害", mood: "strong" },
    { text: "累了就休息一下，别跟自己较劲", mood: "warm" },
    { text: "备考重要，但你的健康更重要", mood: "warm" },
    { text: "允许自己偶尔低落，明天又是新的一天", mood: "warm" },
    { text: "你已经很努力了，对自己好一点", mood: "warm" },
    { text: "慢慢来，比较快", mood: "warm" },
    { text: "今天的你，值得被温柔以待", mood: "warm" },
    { text: "不完美的备考，也能换来完美的结果", mood: "warm" },
    { text: "焦虑是正常的，说明你在乎", mood: "warm" },
    { text: "别刷手机了，去背一道题", mood: "focus" },
    { text: "距离上岸，就差今天的这杯茶和几道题", mood: "focus" },
    { text: "先做完这一套题，再想别的", mood: "focus" },
    { text: "别想太多，做就对了", mood: "focus" },
    { text: "专注当下，一题一题来", mood: "focus" },
    { text: "今天的任务今天完成，别留给明天", mood: "focus" },
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
      shadow: "rgba(13,148,136,0.25)",
      navBg: "#0D9488",
    },
    strong: {
      name: "斗志昂扬",
      icon: "💪",
      gradient: "linear-gradient(135deg, #DC2626, #F97316)",
      bg: "#FFF7ED",
      accent: "#DC2626",
      light: "#FEE2E2",
      text: "#991B1B",
      shadow: "rgba(220,38,38,0.25)",
      navBg: "#DC2626",
    },
    warm: {
      name: "温暖治愈",
      icon: "🌈",
      gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
      bg: "#FFFBEB",
      accent: "#F59E0B",
      light: "#FEF3C7",
      text: "#92400E",
      shadow: "rgba(245,158,11,0.25)",
      navBg: "#F59E0B",
    },
    focus: {
      name: "沉浸专注",
      icon: "🎯",
      gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)",
      bg: "#F5F3FF",
      accent: "#7C3AED",
      light: "#EDE9FE",
      text: "#5B21B6",
      shadow: "rgba(124,58,237,0.25)",
      navBg: "#7C3AED",
    },
    smart: {
      name: "智慧备考",
      icon: "✨",
      gradient: "linear-gradient(135deg, #2563EB, #60A5FA)",
      bg: "#EFF6FF",
      accent: "#2563EB",
      light: "#DBEAFE",
      text: "#1E40AF",
      shadow: "rgba(37,99,235,0.25)",
      navBg: "#2563EB",
    },
  };

  const moodKeys = Object.keys(moodThemes); // ['motivated','strong','warm','focus','smart']

  // ========== 根据日期获取当天的心情 ==========
  function getDailyMood() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return moodKeys[dayOfYear % moodKeys.length];
  }

  // ========== 根据日期获取当天的能量语 ==========
  function getDailyQuote() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % energyQuotes.length;
    return energyQuotes[index];
  }

  // ========== 获取当前心情（当天手动选的 or 当天默认） ==========
  function getCurrentMood() {
    const today = new Date().toISOString().slice(0, 10); // "2026-05-26"
    const stored = localStorage.getItem('youdao_mood');
    const storedDate = localStorage.getItem('youdao_mood_date');
    // 如果今天选过心情，用选的；否则用当天默认
    if (stored && storedDate === today && moodThemes[stored]) return stored;
    return getDailyMood();
  }

  // ========== 设置用户心情（仅当天有效） ==========
  function setUserMood(mood) {
    if (moodThemes[mood]) {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('youdao_mood', mood);
      localStorage.setItem('youdao_mood_date', today);
      applyMoodTheme(mood);
      renderEnergyCard();
    }
  }

  // ========== 应用心情主题到全站 ==========
  function applyMoodTheme(mood) {
    const theme = moodThemes[mood];
    if (!theme) return;

    // 写入CSS变量，全站生效
    const root = document.documentElement;
    root.style.setProperty('--mood-accent', theme.accent);
    root.style.setProperty('--mood-bg', theme.bg);
    root.style.setProperty('--mood-light', theme.light);
    root.style.setProperty('--mood-text', theme.text);
    root.style.setProperty('--mood-shadow', theme.shadow);
    root.style.setProperty('--mood-gradient', theme.gradient);
    root.style.setProperty('--mood-nav-bg', theme.navBg);

    // 更新导航栏active颜色
    document.querySelectorAll('.nav-links a.active').forEach(function(el) {
      el.style.background = theme.accent;
    });

    // 更新CTA主按钮
    document.querySelectorAll('.cta-primary').forEach(function(el) {
      el.style.background = theme.accent;
      el.style.boxShadow = '0 4px 20px ' + theme.shadow;
    });

    // 更新快速入口hover
    document.querySelectorAll('.quick-item').forEach(function(el) {
      el.onmouseenter = function() { this.style.borderColor = theme.accent; this.style.background = theme.light; };
      el.onmouseleave = function() { this.style.borderColor = '#F0F0F0'; this.style.background = '#FAFAFA'; };
    });

    // 更新考试倒计时pill
    document.querySelectorAll('.countdown-pill').forEach(function(el) {
      el.style.background = theme.gradient;
    });

    // 更新页面body背景色调
    document.body.style.backgroundColor = theme.bg;
  }

  // ========== 渲染能量卡 ==========
  function renderEnergyCard() {
    const quote = getDailyQuote();
    const mood = getCurrentMood();
    const theme = moodThemes[mood];
    const dailyMood = getDailyMood();
    const dailyTheme = moodThemes[dailyMood];

    let container = document.getElementById('energyCardContainer');
    if (!container) {
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
        transition: transform 0.3s, box-shadow 0.3s;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 24px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'">
        <div style="position:absolute;top:-20px;right:-20px;width:80px;height:80px;background:rgba(255,255,255,0.1);border-radius:50%;"></div>
        <div style="position:absolute;bottom:-15px;left:-15px;width:60px;height:60px;background:rgba(255,255,255,0.08);border-radius:50%;"></div>
        <div style="font-size:0.75rem;color:rgba(255,255,255,0.85);margin-bottom:8px;font-weight:600;">
          ${theme.icon} ${theme.name} · 每日能量
        </div>
        <div style="font-size:1.1rem;color:#FFFFFF;font-weight:700;line-height:1.6;position:relative;z-index:1;">
          「${quote.text}」
        </div>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
          ${moodKeys.map(function(key) {
            var t = moodThemes[key];
            var isActive = key === mood;
            return '<button onclick="window.switchMood(\'' + key + '\')" style="' +
              'padding:4px 10px;border-radius:12px;' +
              'border:1px solid rgba(255,255,255,' + (isActive ? '0.8' : '0.3') + ');' +
              'background:' + (isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)') + ';' +
              'color:#FFFFFF;font-size:0.7rem;cursor:pointer;transition:all 0.2s;' +
              '" onmouseover="this.style.background=\'rgba(255,255,255,0.25)\'" onmouseout="this.style.background=\'' + (isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)') + '\'">' +
              t.icon + ' ' + t.name +
              '</button>';
          }).join('')}
        </div>
        <div style="margin-top:6px;font-size:0.65rem;color:rgba(255,255,255,0.6);">
          今日默认：${dailyTheme.icon} ${dailyTheme.name} · 切换仅当天有效
        </div>
      </div>
    `;
  }

  // ========== 全局方法 ==========
  window.switchMood = function(mood) {
    setUserMood(mood);
  };

  // ========== 自动渲染 + 应用主题 ==========
  function init() {
    var mood = getCurrentMood();
    applyMoodTheme(mood);
    renderEnergyCard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
