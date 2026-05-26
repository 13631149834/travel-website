/**
 * 每日能量语 + 心情主题系统 v3.0
 * 能量卡颜色每天换，但全站保持薄荷青主色不变
 * 心情是辅助，备考才是主角
 */
(function() {
  'use strict';

  var energyQuotes = [
    { text: "今天的努力，是明天的底气", mood: "motivated" },
    { text: "每天进步一点点，上岸就在不远处", mood: "motivated" },
    { text: "坚持不下去的时候，想想当初为什么出发", mood: "motivated" },
    { text: "你不是在熬，你是在积累", mood: "motivated" },
    { text: "慢一点没关系，别停下来就好", mood: "motivated" },
    { text: "今天的你，比昨天更接近上岸", mood: "motivated" },
    { text: "每一道题都是通往证书的台阶", mood: "motivated" },
    { text: "备考路上没有白走的路，每一步都算数", mood: "motivated" },
    { text: "笔试不过？那就再来一次", mood: "strong" },
    { text: "挂了不可怕，可怕的是不敢再考", mood: "strong" },
    { text: "曼曼考了两次才上岸，你也可以", mood: "strong" },
    { text: "跌倒七次，爬起来八次", mood: "strong" },
    { text: "困难是暂时的，证书是永久的", mood: "strong" },
    { text: "你比想象中更厉害", mood: "strong" },
    { text: "累了就休息一下，别跟自己较劲", mood: "warm" },
    { text: "备考重要，但你的健康更重要", mood: "warm" },
    { text: "允许自己偶尔低落，明天又是新的一天", mood: "warm" },
    { text: "你已经很努力了，对自己好一点", mood: "warm" },
    { text: "慢慢来，比较快", mood: "warm" },
    { text: "焦虑是正常的，说明你在乎", mood: "warm" },
    { text: "别刷手机了，去背一道题", mood: "focus" },
    { text: "先做完这一套题，再想别的", mood: "focus" },
    { text: "别想太多，做就对了", mood: "focus" },
    { text: "专注当下，一题一题来", mood: "focus" },
    { text: "今天的任务今天完成，别留给明天", mood: "focus" },
    { text: "背不下来？试试口诀和框架", mood: "smart" },
    { text: "会的不丢分，就是最好的策略", mood: "smart" },
    { text: "考试不是考你全都会，是考你少犯错", mood: "smart" },
    { text: "错题比新题更有价值", mood: "smart" },
    { text: "别贪多，把做过的题搞懂就够了", mood: "smart" },
  ];

  // 每种心情只决定能量卡的渐变色，不影响全站
  var cardColors = {
    motivated: { name: "元气", icon: "🌟", gradient: "linear-gradient(135deg, #0D9488, #14B8A6)" },
    strong:    { name: "斗志", icon: "💪", gradient: "linear-gradient(135deg, #DC2626, #F97316)" },
    warm:      { name: "治愈", icon: "🌈", gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)" },
    focus:     { name: "专注", icon: "🎯", gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)" },
    smart:     { name: "智慧", icon: "✨", gradient: "linear-gradient(135deg, #2563EB, #60A5FA)" },
  };

  var moodKeys = Object.keys(cardColors);

  function getDayIndex() {
    var today = new Date();
    return Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  }

  function getDailyMood() {
    return moodKeys[getDayIndex() % moodKeys.length];
  }

  function getDailyQuote() {
    return energyQuotes[getDayIndex() % energyQuotes.length];
  }

  function getCurrentMood() {
    var today = new Date().toISOString().slice(0, 10);
    var stored = localStorage.getItem('youdao_mood');
    var storedDate = localStorage.getItem('youdao_mood_date');
    if (stored && storedDate === today && cardColors[stored]) return stored;
    return getDailyMood();
  }

  function setUserMood(mood) {
    if (cardColors[mood]) {
      var today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('youdao_mood', mood);
      localStorage.setItem('youdao_mood_date', today);
      renderEnergyCard();
    }
  }

  function renderEnergyCard() {
    var quote = getDailyQuote();
    var mood = getCurrentMood();
    var color = cardColors[mood];

    var container = document.getElementById('energyCardContainer');
    if (!container) {
      var slogan = document.querySelector('.hero-slogan');
      if (!slogan) return;
      container = document.createElement('div');
      container.id = 'energyCardContainer';
      slogan.parentNode.insertBefore(container, slogan.nextSibling);
    }

    // 小巧的能量卡，不抢视线
    container.innerHTML =
      '<div id="energyCard" style="' +
        'background:' + color.gradient + ';' +
        'border-radius:12px;padding:12px 16px;margin-bottom:16px;' +
        'position:relative;overflow:hidden;' +
        'transition:transform 0.3s;box-shadow:0 2px 8px rgba(0,0,0,0.08);' +
      '" onmouseover="this.style.transform=\'translateY(-1px)\'" onmouseout="this.style.transform=\'translateY(0)\'">' +
        '<div style="position:absolute;top:-12px;right:-12px;width:50px;height:50px;background:rgba(255,255,255,0.08);border-radius:50%;"></div>' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:1.2rem;">' + color.icon + '</span>' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:0.95rem;color:#FFFFFF;font-weight:600;line-height:1.5;">' +
              '「' + quote.text + '」' +
            '</div>' +
          '</div>' +
          '<button onclick="window.switchMoodNext()" style="' +
            'background:rgba(255,255,255,0.2);border:none;border-radius:8px;' +
            'color:#FFFFFF;padding:4px 8px;font-size:0.7rem;cursor:pointer;white-space:nowrap;' +
          '" title="换一种心情">换</button>' +
        '</div>' +
      '</div>';
  }

  // 点击"换"按钮，循环切换下一种心情
  window.switchMoodNext = function() {
    var current = getCurrentMood();
    var idx = moodKeys.indexOf(current);
    var next = moodKeys[(idx + 1) % moodKeys.length];
    setUserMood(next);
  };

  window.switchMood = function(mood) {
    setUserMood(mood);
  };

  function init() {
    renderEnergyCard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
