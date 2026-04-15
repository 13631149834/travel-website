/**
 * ===================================
 * 专属彩蛋模块
 * 隐藏彩蛋、特殊日期彩蛋、互动小游戏
 * ===================================
 */

(function() {
  'use strict';

  // 彩蛋配置
  const CONFIG = {
    // 彩蛋触发次数限制（0 = 无限制）
    triggerLimit: 3,
    // 彩蛋冷却时间（毫秒）
    cooldown: 60000,
    // 特殊日期配置
    specialDates: [
      { month: 4, day: 1, name: '愚人节', emoji: '🤪', message: '愚人节快乐！今天你被套路了吗？' },
      { month: 10, day: 31, name: '万圣节', emoji: '🎃', message: '不给糖就捣蛋！Trick or Treat~' },
      { month: 12, day: 24, name: '平安夜', emoji: '🎄', message: '平安夜快乐！许个愿吧~' },
      { month: 12, day: 25, name: '圣诞节', emoji: '🎅', message: '圣诞快乐！想要什么礼物？' },
      { month: 12, day: 31, name: '跨年夜', emoji: '🎆', message: '新的一年即将到来！' }
    ]
  };

  // 彩蛋集合
  const EASTER_EGGS = {
    // 1. 科罗娜彩蛋 - 输入"KTV"触发
    ktv: {
      trigger: ['KTV', 'ktv', '唱歌'],
      type: 'animation',
      action: function() {
        showSecretMessage('🎤 想去唱K？不如先规划一场旅行，让旅途成为最好的前奏！');
      }
    },

    // 2. 摸鱼彩蛋 - 连续点击logo 5次
    fish: {
      type: 'sequence',
      sequence: 'logo',
      count: 5,
      action: function() {
        showSecretMessage('🐟 摸鱼一时爽，一直摸鱼一直爽...但别忘了旅行哦！');
      }
    },

    // 3. 开发者彩蛋 - 输入"iloveyoudao"
    developer: {
      trigger: ['iloveyoudao', 'loveyoudao', 'ilove游导'],
      type: 'animation',
      action: function() {
        celebrateEasterEgg();
        showSecretMessage('💝 感谢你对游导的喜爱！我们也在偷偷爱你哦~');
      }
    },

    // 4. 幸运数字彩蛋 - 鼠标点击10次后输入"777"
    lucky777: {
      trigger: ['777', '七七七'],
      type: 'animation',
      action: function() {
        showCouponEasterEgg('LUCKY777', '77元旅行红包');
      }
    },

    // 5. 倒置彩蛋 - 页面滚动到底部后快速回到顶部3次
    rollercoaster: {
      type: 'scroll',
      scrollUpCount: 3,
      action: function() {
        showSecretMessage('🎢 惊险刺激！这就是旅行的快感~');
        celebrateEasterEgg();
      }
    },

    // 6. 秘密关键词彩蛋
    secret: {
      trigger: ['秘密', 'secret', '彩蛋在哪里', '隐藏功能'],
      type: 'animation',
      action: function() {
        showSecretMessage('🎁 恭喜你发现了彩蛋！游导还有更多惊喜等你发现...\n\n提示：试试"游导最棒"或"生日惊喜"？');
      }
    },

    // 7. 点赞彩蛋 - 同时按下 Ctrl + Shift + L
    like: {
      type: 'shortcut',
      keys: ['ctrl', 'shift', 'l'],
      action: function() {
        showSecretMessage('👍 感谢你的点赞！游导会继续努力的~');
      }
    },

    // 8. Konami代码彩蛋
    konami: {
      type: 'sequence',
      sequence: ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'],
      action: function() {
        showSecretMessage('🎮 科乐美代码！你是游戏达人吗？');
        celebrateEasterEgg();
        celebrateEasterEgg();
      }
    },

    // 9. 生日彩蛋
    birthday: {
      trigger: ['生日惊喜', '今天我生日', 'happy birthday'],
      type: 'animation',
      action: function() {
        showBirthdayEasterEgg();
      }
    },

    // 10. 晚安彩蛋 - 晚上11点后访问
    goodnight: {
      trigger: ['晚安', '睡了', '困了'],
      type: 'time',
      checkTime: function() {
        const hour = new Date().getHours();
        return hour >= 22 || hour < 5;
      },
      action: function() {
        showSecretMessage('🌙 晚安~好梦~明天我们继续探索世界~');
      }
    },

    // 11. 早起彩蛋 - 早上6点前访问
    earlybird: {
      trigger: ['早', '起了', '出发'],
      type: 'time',
      checkTime: function() {
        const hour = new Date().getHours();
        return hour >= 5 && hour < 7;
      },
      action: function() {
        showSecretMessage('🌅 早起的鸟儿有虫吃！你是最棒的旅行者~');
      }
    },

    // 12. 心情彩蛋
    mood: {
      trigger: ['开心', '不高兴', '心情', 'emo'],
      type: 'animation',
      action: function(e) {
        const triggers = {
          '开心': '😊 开心是最好的旅行伴侣！',
          '不高兴': '😢 没关系，旅行是最好的治愈~',
          '心情': '💭 无论什么心情，都值得被认真对待',
          'emo': '🎵 来点音乐，或者去旅行吧~'
        };
        const msg = Object.entries(triggers).find(([k]) => 
          e.triggerWord.toLowerCase().includes(k.toLowerCase())
        );
        showSecretMessage(msg ? msg[1] : '🌟 无论心情如何，旅行都能治愈~');
      }
    }
  };

  // 状态
  let clickCount = 0;
  let clickTimer = null;
  let lastTrigger = 0;
  let triggeredEggs = {};
  let konamiIndex = 0;

  /**
   * 创建彩蛋样式
   */
  function createStyles() {
    if (document.getElementById('easter-egg-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'easter-egg-styles';
    style.textContent = `
      /* 彩蛋提示框 */
      .easter-egg-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 50px;
        border-radius: 24px;
        text-align: center;
        color: white;
        z-index: 100001;
        box-shadow: 0 20px 60px rgba(102, 126, 234, 0.5);
        animation: eggPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        max-width: 400px;
        width: 90%;
      }

      @keyframes eggPopIn {
        to { transform: translate(-50%, -50%) scale(1); }
      }

      .easter-egg-popup.egg-pop-out {
        animation: eggPopOut 0.3s ease forwards;
      }

      @keyframes eggPopOut {
        to { transform: translate(-50%, -50%) scale(0); opacity: 0; }
      }

      .easter-egg-icon {
        font-size: 60px;
        margin-bottom: 15px;
        animation: eggIconBounce 0.6s ease infinite;
      }

      @keyframes eggIconBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      .easter-egg-title {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 12px;
        text-shadow: 0 2px 10px rgba(0,0,0,0.2);
      }

      .easter-egg-message {
        font-size: 16px;
        line-height: 1.6;
        opacity: 0.95;
        white-space: pre-line;
      }

      .easter-egg-close {
        margin-top: 20px;
        padding: 10px 25px;
        background: rgba(255,255,255,0.2);
        border: none;
        border-radius: 25px;
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .easter-egg-close:hover {
        background: rgba(255,255,255,0.3);
        transform: scale(1.05);
      }

      /* 彩蛋优惠券 */
      .easter-egg-coupon {
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: #333;
        padding: 30px 40px;
      }

      .easter-egg-coupon .coupon-amount {
        font-size: 48px;
        font-weight: 800;
        color: #d32f2f;
      }

      .easter-egg-coupon .coupon-desc {
        font-size: 14px;
        color: #666;
        margin-top: 8px;
      }

      .easter-egg-coupon .coupon-code {
        background: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 3px;
        margin-top: 20px;
        display: inline-block;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      }

      /* 生日彩蛋 */
      .easter-egg-birthday {
        background: linear-gradient(135deg, #FF6B6B, #FFE66D);
      }

      .birthday-cake {
        font-size: 70px;
        animation: cakeWiggle 0.5s ease infinite;
      }

      @keyframes cakeWiggle {
        0%, 100% { transform: rotate(-3deg); }
        50% { transform: rotate(3deg); }
      }

      /* 背景遮罩 */
      .easter-egg-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(5px);
        z-index: 100000;
        animation: overlayFadeIn 0.3s ease;
      }

      @keyframes overlayFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* 浮动表情 */
      .floating-emoji {
        position: fixed;
        font-size: 40px;
        z-index: 100002;
        animation: floatUp 3s ease-out forwards;
        pointer-events: none;
      }

      @keyframes floatUp {
        0% {
          opacity: 1;
          transform: translateY(0) rotate(0deg) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateY(-300px) rotate(360deg) scale(0.5);
        }
      }

      /* 彩蛋发现提示 */
      .egg-hint {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        animation: hintSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        max-width: 300px;
      }

      @keyframes hintSlideIn {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
      }

      .egg-hint.hint-fade-out {
        animation: hintSlideOut 0.3s ease forwards;
      }

      @keyframes hintSlideOut {
        to { opacity: 0; transform: translateX(100px); }
      }

      .egg-hint-icon {
        font-size: 30px;
      }

      .egg-hint-text {
        font-size: 14px;
        color: #333;
        line-height: 1.5;
      }

      .egg-hint-close {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 20px;
        height: 20px;
        border: none;
        background: #f0f0f0;
        border-radius: 50%;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 显示彩蛋弹窗
   */
  function showEasterEgg(icon, title, message, type = 'default') {
    // 移除现有弹窗
    const existing = document.querySelector('.easter-egg-popup');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'easter-egg-overlay';
    
    const popup = document.createElement('div');
    popup.className = `easter-egg-popup easter-egg-${type}`;
    popup.innerHTML = `
      <div class="easter-egg-icon">${icon}</div>
      <div class="easter-egg-title">${title}</div>
      <div class="easter-egg-message">${message}</div>
      <button class="easter-egg-close" onclick="this.closest('.easter-egg-popup').remove(); document.querySelector('.easter-egg-overlay')?.remove();">
        知道了！
      </button>
    `;

    createStyles();
    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    // 点击遮罩关闭
    overlay.addEventListener('click', () => {
      popup.remove();
      overlay.remove();
    });

    // 自动关闭
    setTimeout(() => {
      if (document.body.contains(popup)) {
        popup.classList.add('egg-pop-out');
        setTimeout(() => {
          popup.remove();
          overlay.remove();
        }, 300);
      }
    }, 5000);
  }

  /**
   * 显示秘密消息
   */
  function showSecretMessage(message) {
    showEasterEgg('🎁', '🎉 你发现了彩蛋！', message);
  }

  /**
   * 显示优惠券彩蛋
   */
  function showCouponEasterEgg(code, desc) {
    const popup = document.createElement('div');
    popup.className = 'easter-egg-popup easter-egg-coupon';
    popup.innerHTML = `
      <div class="easter-egg-icon">🎉</div>
      <div class="easter-egg-title">恭喜获得惊喜红包！</div>
      <div class="coupon-amount">¥77</div>
      <div class="coupon-desc">${desc}</div>
      <div class="coupon-code">${code}</div>
      <button class="easter-egg-close" style="background: #333; color: white;">
        立即领取
      </button>
    `;
    
    createStyles();
    
    const overlay = document.createElement('div');
    overlay.className = 'easter-egg-overlay';
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    
    overlay.addEventListener('click', () => {
      popup.remove();
      overlay.remove();
    });
  }

  /**
   * 显示生日彩蛋
   */
  function showBirthdayEasterEgg() {
    showEasterEgg(
      '🎂',
      '生日快乐！🎉',
      '祝您生日快乐！🎂\n\n愿您的每一个生日都充满惊喜，\n每一段旅程都留下美好回忆~\n\n🎁 专属生日礼包已发放至您的账户！',
      'birthday'
    );
    celebrateEasterEgg();
  }

  /**
   * 庆祝彩蛋效果
   */
  function celebrateEasterEgg() {
    if (window.confetti) {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
      });
    }
    
    // 浮动表情
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const emoji = document.createElement('div');
        emoji.className = 'floating-emoji';
        emoji.textContent = ['🎈', '🎊', '🎉', '✨', '🌟', '💫', '🎁', '🎂'][Math.floor(Math.random() * 8)];
        emoji.style.left = Math.random() * window.innerWidth + 'px';
        emoji.style.top = window.innerHeight * 0.7 + 'px';
        document.body.appendChild(emoji);
        setTimeout(() => emoji.remove(), 3000);
      }, i * 100);
    }
  }

  /**
   * 检查关键词彩蛋
   */
  function checkKeywordEasterEgg(text) {
    text = text.toLowerCase();
    
    for (const [key, egg] of Object.entries(EASTER_EGGS)) {
      if (egg.type !== 'animation') continue;
      
      // 检查触发限制
      if (CONFIG.triggerLimit > 0) {
        triggeredEggs[key] = triggeredEggs[key] || 0;
        if (triggeredEggs[key] >= CONFIG.triggerLimit) continue;
      }
      
      // 检查冷却
      if (Date.now() - lastTrigger < CONFIG.cooldown) continue;
      
      // 检查关键词
      const triggers = egg.trigger || [];
      const matched = triggers.find(t => text.includes(t.toLowerCase()));
      
      if (matched) {
        lastTrigger = Date.now();
        triggeredEggs[key] = (triggeredEggs[key] || 0) + 1;
        
        if (egg.action) {
          egg.action({ triggerWord: matched });
        }
        
        // 触发提示
        showEggHint(`🎁 你发现了彩蛋！`);
        
        return true;
      }
    }
    
    return false;
  }

  /**
   * 显示彩蛋发现提示
   */
  function showEggHint(message) {
    const existing = document.querySelector('.egg-hint');
    if (existing) existing.remove();
    
    const hint = document.createElement('div');
    hint.className = 'egg-hint';
    hint.innerHTML = `
      <span class="egg-hint-icon">🎁</span>
      <span class="egg-hint-text">${message}</span>
      <button class="egg-hint-close">×</button>
    `;
    
    document.body.appendChild(hint);
    
    hint.querySelector('.egg-hint-close').addEventListener('click', () => {
      hint.classList.add('hint-fade-out');
      setTimeout(() => hint.remove(), 300);
    });
    
    setTimeout(() => {
      if (document.body.contains(hint)) {
        hint.classList.add('hint-fade-out');
        setTimeout(() => hint.remove(), 300);
      }
    }, 4000);
  }

  /**
   * 检查特殊日期彩蛋
   */
  function checkSpecialDateEasterEgg() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    for (const special of CONFIG.specialDates) {
      if (special.month === month && special.day === day) {
        setTimeout(() => {
          showEasterEgg(
            special.emoji,
            `${special.name}快乐！`,
            special.message
          );
          celebrateEasterEgg();
        }, 2000);
        return true;
      }
    }
    
    return false;
  }

  /**
   * 键盘事件处理 - Konami代码
   */
  function handleKeydown(e) {
    const konamiEgg = EASTER_EGGS.konami;
    const sequence = konamiEgg.sequence;
    
    const keyMap = {
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'b': 'b',
      'a': 'a'
    };
    
    const key = keyMap[e.key];
    if (!key) {
      konamiIndex = 0;
      return;
    }
    
    if (key === sequence[konamiIndex]) {
      konamiIndex++;
      
      if (konamiIndex === sequence.length) {
        konamiIndex = 0;
        if (konamiEgg.action) {
          konamiEgg.action();
        }
      }
    } else {
      konamiIndex = 0;
    }
  }

  /**
   * 初始化彩蛋系统
   */
  function init() {
    // 创建样式
    createStyles();
    
    // 检查特殊日期
    checkSpecialDateEasterEgg();
    
    // 绑定键盘事件
    document.addEventListener('keydown', handleKeydown);
    
    // 监听搜索框输入
    const searchInputs = document.querySelectorAll('input[type="search"], input[type="text"]');
    searchInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        checkKeywordEasterEgg(e.target.value);
      });
    });

    // 监听表单提交
    document.addEventListener('submit', (e) => {
      const formData = new FormData(e.target);
      let allText = '';
      for (let [key, value] of formData.entries()) {
        allText += ' ' + value;
      }
      checkKeywordEasterEgg(allText);
    });

    console.log('%c🎁 游导彩蛋系统已就绪！', 'color: #667eea; font-size: 16px;');
    console.log('%c想知道彩蛋在哪里？试试在搜索框输入 "秘密" 或 "iloveyoudao"？', 'color: #666; font-size: 12px;');
  }

  /**
   * API 暴露
   */
  window.EasterEgg = {
    init: init,
    show: showEasterEgg,
    celebrate: celebrateEasterEgg,
    check: checkKeywordEasterEgg,
    config: CONFIG
  };

})();
