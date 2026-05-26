/**
 * 每日能量语 v4.0
 * 每天换一句鼓励语，颜色统一薄荷青，全站协调
 */
(function() {
  'use strict';

  var quotes = [
    { text: "今天的努力，是明天的底气", icon: "🌟" },
    { text: "每天进步一点点，上岸就在不远处", icon: "🌱" },
    { text: "坚持不下去的时候，想想当初为什么出发", icon: "💪" },
    { text: "你不是在熬，你是在积累", icon: "📚" },
    { text: "慢一点没关系，别停下来就好", icon: "🚶" },
    { text: "今天的你，比昨天更接近上岸", icon: "🎯" },
    { text: "每一道题都是通往证书的台阶", icon: "✏️" },
    { text: "备考路上没有白走的路，每一步都算数", icon: "🛤️" },
    { text: "努力不会骗人，时间会证明一切", icon: "⏳" },
    { text: "笔试不过？那就再来一次", icon: "🔄" },
    { text: "挂了不可怕，可怕的是不敢再考", icon: "🔥" },
    { text: "曼曼考了两次才上岸，你也可以", icon: "🙋" },
    { text: "跌倒七次，爬起来八次", icon: "💪" },
    { text: "困难是暂时的，证书是永久的", icon: "🏆" },
    { text: "你比想象中更厉害", icon: "✨" },
    { text: "累了就休息一下，别跟自己较劲", icon: "☕" },
    { text: "备考重要，但你的健康更重要", icon: "💚" },
    { text: "允许自己偶尔低落，明天又是新的一天", icon: "🌈" },
    { text: "你已经很努力了，对自己好一点", icon: "🤗" },
    { text: "慢慢来，比较快", icon: "🐢" },
    { text: "焦虑是正常的，说明你在乎", icon: "💙" },
    { text: "别刷手机了，去背一道题", icon: "📱" },
    { text: "先做完这一套题，再想别的", icon: "✅" },
    { text: "别想太多，做就对了", icon: "▶️" },
    { text: "专注当下，一题一题来", icon: "🎯" },
    { text: "今天的任务今天完成，别留给明天", icon: "📅" },
    { text: "背不下来？试试口诀和框架", icon: "🧠" },
    { text: "会的不丢分，就是最好的策略", icon: "💡" },
    { text: "错题比新题更有价值", icon: "📝" },
    { text: "别贪多，把做过的题搞懂就够了", icon: "📖" },
  ];

  function getDayIndex() {
    var today = new Date();
    return Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (86400000));
  }

  function init() {
    var q = quotes[getDayIndex() % quotes.length];
    var slogan = document.querySelector('.hero-slogan');
    if (!slogan) return;

    var container = document.getElementById('energyCardContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'energyCardContainer';
      slogan.parentNode.insertBefore(container, slogan.nextSibling);
    }

    container.innerHTML =
      '<div style="' +
        'background:linear-gradient(135deg,#0F766E,#0D9488);' +
        'border-radius:12px;padding:12px 16px;margin-bottom:16px;' +
        'position:relative;overflow:hidden;' +
        'transition:transform 0.3s;box-shadow:0 2px 8px rgba(13,148,136,0.15);' +
      '" onmouseover="this.style.transform=\'translateY(-1px)\'" onmouseout="this.style.transform=\'translateY(0)\'">' +
        '<div style="position:absolute;top:-12px;right:-12px;width:50px;height:50px;background:rgba(255,255,255,0.06);border-radius:50%;"></div>' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:1.2rem;">' + q.icon + '</span>' +
          '<div style="font-size:0.95rem;color:#FFFFFF;font-weight:600;line-height:1.5;">' +
            '「' + q.text + '」' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
