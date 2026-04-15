/**
 * ===================================
 * 专属问候语模块
 * 功能：时段问候、会员专属问候、节日问候、个性化定制
 * ===================================
 */

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    // 问候显示时间（毫秒）
    displayDuration: 5000,
    // 淡入淡出时间（毫秒）
    fadeDuration: 400,
    // 问候语类型
    types: ['time', 'member', 'festival', 'weather', 'custom'],
    // 问候语出现位置（可自定义）
    position: 'bottom-right'
  };

  // 时段问候语配置
  const TIME_GREETINGS = {
    morning: {
      icon: '🌅',
      text: '早安',
      tips: [
        '清晨的阳光最适合规划今天的行程啦~',
        '早起的人儿有旅行灵感哦 ✨',
        '新的一天，从探索世界开始！',
        '早起的鸟儿有虫吃，早起的旅行者有好导游~'
      ]
    },
    afternoon: {
      icon: '☀️',
      text: '午安',
      tips: [
        '下午好，出行计划安排好了吗？',
        '阳光正好，风景正美~',
        '午后时光，适合来一场说走就走的旅行！',
        '下午茶时间，不如看看目的地推荐~'
      ]
    },
    evening: {
      icon: '🌆',
      text: '傍晚好',
      tips: [
        '傍晚时分，别忘了欣赏沿途的风景~',
        '夕阳西下，旅行的心是否已经出发？',
        '晚霞满天，正是规划明日行程的好时机~',
        '傍晚好，夜间出行注意安全哦~'
      ]
    },
    night: {
      icon: '🌙',
      text: '夜安',
      tips: [
        '夜深了，让明天的旅行伴你入眠~',
        '星光不问赶路人，时光不负有心旅 🌟',
        '晚安，好梦~明天去哪里探索呢？',
        '月色温柔，愿你做个美美的旅行梦~'
      ]
    }
  };

  // 会员等级问候
  const MEMBER_GREETINGS = {
    bronze: {
      title: '银卡会员',
      icon: '🥉',
      messages: [
        '欢迎回来，银卡会员！继续探索，解锁更多精彩~'
      ]
    },
    silver: {
      title: '银卡会员',
      icon: '🥈',
      messages: [
        '银卡会员专属问候来啦~您的旅行管家在线！'
      ]
    },
    gold: {
      title: '金卡会员',
      icon: '🥇',
      messages: [
        '🌟 尊贵的金卡会员，专属礼遇等您享！',
        '金卡会员特权：优先预订、专属折扣、VIP客服~'
      ]
    },
    platinum: {
      title: '铂金会员',
      icon: '💎',
      messages: [
        '✨ 铂金会员驾到！您就是我们的超级VIP~',
        '专属旅行顾问已就位，随时为您服务！'
      ]
    },
    diamond: {
      title: '钻石会员',
      icon: '👑',
      messages: [
        '👑 钻石会员尊享！极致服务，只为特别的您~',
        '您的专属旅行管家24小时待命，随时出发！'
      ]
    }
  };

  // 节日问候配置（公历）
  const FESTIVALS = [
    // 中国传统节日
    { name: '元旦', date: [1, 1], icon: '🎊', messages: ['新年快乐！新的一年，继续探索世界的美好~'] },
    { name: '春节', date: [1, 'lunar'], icon: '🧧', messages: ['春节快乐！恭贺新禧，旅途顺遂~'] },
    { name: '元宵节', date: [1, 15], icon: '🏮', messages: ['元宵节快乐！月圆人团圆，出行更圆满~'] },
    { name: '情人节', date: [2, 14], icon: '💕', messages: ['情人节快乐！和爱的人一起看世界~'] },
    { name: '妇女节', date: [3, 8], icon: '🌷', messages: ['女神节快乐！愿您永远优雅从容~'] },
    { name: '清明节', date: [4, 4], icon: '🌸', messages: ['清明时节，踏青赏春正当时~'] },
    { name: '劳动节', date: [5, 1], icon: '🔧', messages: ['劳动最光荣！向每一位旅行者致敬~'] },
    { name: '母亲节', date: [5, 'secondSunday'], icon: '💐', messages: ['妈妈，辛苦了！带她去旅行吧~'] },
    { name: '儿童节', date: [6, 1], icon: '🎈', messages: ['童心未泯，世界都是你的游乐场~'] },
    { name: '父亲节', date: [6, 'thirdSunday'], icon: '🎁', messages: ['父亲节快乐！带爸爸去看世界~'] },
    { name: '端午节', date: [5, 5, 'lunar'], icon: '🐉', messages: ['端午安康！龙舟竞渡，艾香四溢~'] },
    { name: '七夕', date: [7, 7], icon: '🌌', messages: ['七夕快乐！愿得一心人，白首不分离~'] },
    { name: '中秋节', date: [8, 15, 'lunar'], icon: '🥮', messages: ['中秋快乐！月圆人团圆，共赏好风光~'] },
    { name: '教师节', date: [9, 10], icon: '📚', messages: ['教师节快乐！旅行是最好的课堂~'] },
    { name: '国庆节', date: [10, 1], icon: '🎉', messages: ['国庆快乐！祝祖国繁荣昌盛~'] },
    { name: '重阳节', date: [9, 9, 'lunar'], icon: '🍂', messages: ['重阳节快乐！登高望远，秋色宜人~'] },
    { name: '万圣节', date: [10, 31], icon: '🎃', messages: ['万圣节快乐！不给糖就捣蛋~'] },
    { name: '感恩节', date: [11, 'fourthThursday'], icon: '🦃', messages: ['感恩节快乐！感谢一路有您~'] },
    { name: '圣诞节', date: [12, 25], icon: '🎄', messages: ['圣诞快乐！愿您的旅途充满惊喜~'] },
    { name: '跨年夜', date: [12, 31], icon: '🎆', messages: ['跨年夜快乐！迎接新的一年，新的旅程~'] }
  ];

  // 特殊日期问候
  const SPECIAL_DATES = {
    // 用户首次访问纪念日（需配合localStorage）
    firstVisit: {
      icon: '🎁',
      messages: [
        '记得今天吗？您已经陪伴我们{}天啦~',
        '感谢您{}天的陪伴，期待更多精彩旅程！'
      ]
    },
    // 生日（需要用户设置）
    birthday: {
      icon: '🎂',
      messages: [
        '生日快乐！🎉 今天的旅行，我们为您准备了惊喜~',
        '生辰吉乐！愿您新的一岁，走遍更多美丽的地方~'
      ]
    },
    // 会员升级日
    levelUp: {
      icon: '⬆️',
      messages: [
        '恭喜升级！您现在是{}会员啦~',
        '会员升级！解锁更多专属权益~'
      ]
    }
  };

  // 全局实例
  let currentGreeting = null;
  let greetingContainer = null;

  /**
   * 获取当前时段
   */
  function getTimePeriod() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 14) return 'afternoon';
    if (hour >= 14 && hour < 18) return 'evening';
    return 'night';
  }

  /**
   * 获取问候语集合
   */
  function getGreetingSet() {
    const period = getTimePeriod();
    const timeGreeting = TIME_GREETINGS[period];
    const randomTip = timeGreeting.tips[Math.floor(Math.random() * timeGreeting.tips.length)];
    
    return {
      icon: timeGreeting.icon,
      greeting: `${timeGreeting.text}，`,
      tip: randomTip
    };
  }

  /**
   * 获取节日问候
   */
  function getFestivalGreeting() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    
    for (const festival of FESTIVALS) {
      if (festival.date[0] === month && festival.date[1] === date) {
        return {
          isFestival: true,
          name: festival.name,
          icon: festival.icon,
          message: festival.messages[Math.floor(Math.random() * festival.messages.length)]
        };
      }
    }
    return null;
  }

  /**
   * 获取会员问候
   */
  function getMemberGreeting(memberLevel) {
    const level = memberLevel || 'guest';
    const member = MEMBER_GREETINGS[level];
    
    if (!member) return null;
    
    return {
      title: member.title,
      icon: member.icon,
      message: member.messages[Math.floor(Math.random() * member.messages.length)]
    };
  }

  /**
   * 计算节日日期（支持农历和特殊规则）
   */
  function getFestivalDate(festival) {
    if (festival.date.length === 3 && festival.date[2] === 'lunar') {
      // 农历节日简化处理（实际项目中需要农历转换库）
      return false;
    }
    
    if (typeof festival.date[1] === 'string') {
      // 特殊规则（如"父亲节是6月的第三个星期日"）
      const year = new Date().getFullYear();
      const month = festival.date[0];
      // 这里需要根据具体规则计算
      return false;
    }
    
    return festival.date[0] === new Date().getMonth() + 1 && 
           festival.date[1] === new Date().getDate();
  }

  /**
   * 创建问候气泡
   */
  function createGreetingBubble(data) {
    const container = document.createElement('div');
    container.className = 'personal-greeting';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    
    let content = '';
    
    // 节日问候优先显示
    if (data.festival) {
      content = `
        <div class="greeting-festival">
          <div class="greeting-icon">${data.festival.icon}</div>
          <div class="greeting-content">
            <div class="greeting-title">${data.festival.name}</div>
            <div class="greeting-message">${data.festival.message}</div>
          </div>
        </div>
      `;
    } else {
      // 常规问候
      content = `
        <div class="greeting-header">
          <span class="greeting-icon">${data.icon}</span>
          <span class="greeting-text">${data.greeting}</span>
          <span class="greeting-user">${data.userName || '旅行者'}</span>
        </div>
        <div class="greeting-tip">${data.tip}</div>
      `;
      
      // 会员专属
      if (data.member) {
        content += `
          <div class="greeting-member">
            <span class="member-icon">${data.member.icon}</span>
            <span class="member-text">${data.member.message}</span>
          </div>
        `;
      }
    }
    
    // 关闭按钮
    content += `
      <button class="greeting-close" aria-label="关闭问候" onclick="this.parentElement.remove()">
        <span>×</span>
      </button>
    `;
    
    container.innerHTML = content;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = getGreetingStyles();
    document.head.appendChild(style);
    
    return container;
  }

  /**
   * 获取问候气泡样式
   */
  function getGreetingStyles() {
    return `
      .personal-greeting {
        position: fixed;
        ${CONFIG.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : 'top: 20px; left: 20px;'}
        max-width: 360px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        padding: 20px;
        color: white;
        box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
        z-index: 10000;
        font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
        animation: greetingSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        opacity: 0;
        animation-fill-mode: forwards;
      }

      @keyframes greetingSlideIn {
        0% {
          opacity: 0;
          transform: translateY(20px) scale(0.9);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .personal-greeting.greeting-fade-out {
        animation: greetingFadeOut 0.4s ease forwards;
      }

      @keyframes greetingFadeOut {
        to {
          opacity: 0;
          transform: translateY(10px) scale(0.95);
        }
      }

      .greeting-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }

      .greeting-icon {
        font-size: 28px;
        animation: greetingIconBounce 2s ease-in-out infinite;
      }

      @keyframes greetingIconBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      .greeting-text {
        font-size: 18px;
        font-weight: 600;
      }

      .greeting-user {
        font-size: 18px;
        font-weight: 700;
        color: #ffd700;
      }

      .greeting-tip {
        font-size: 14px;
        opacity: 0.95;
        line-height: 1.6;
        margin-bottom: 12px;
      }

      .greeting-member {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 10px;
        font-size: 13px;
      }

      .member-icon {
        font-size: 20px;
      }

      .greeting-festival {
        text-align: center;
      }

      .greeting-festival .greeting-icon {
        font-size: 50px;
        display: block;
        margin-bottom: 15px;
      }

      .greeting-title {
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 10px;
        text-shadow: 0 2px 10px rgba(0,0,0,0.2);
      }

      .greeting-message {
        font-size: 15px;
        opacity: 0.95;
        line-height: 1.6;
      }

      .greeting-close {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 24px;
        height: 24px;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        color: white;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .greeting-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }

      .greeting-close:focus {
        outline: 2px solid white;
        outline-offset: 2px;
      }

      @media (max-width: 480px) {
        .personal-greeting {
          left: 10px !important;
          right: 10px !important;
          bottom: 10px !important;
          max-width: none;
        }
      }
    `;
  }

  /**
   * 显示问候
   */
  function showGreeting(options = {}) {
    const {
      userName = '',
      memberLevel = null,
      immediate = false,
      duration = CONFIG.displayDuration
    } = options;

    // 清除现有问候
    if (currentGreeting) {
      currentGreeting.remove();
    }

    // 获取问候数据
    const greetingSet = getGreetingSet();
    const festival = getFestivalGreeting();
    const member = getMemberGreeting(memberLevel);

    const data = {
      icon: greetingSet.icon,
      greeting: greetingSet.greeting,
      tip: greetingSet.tip,
      userName: userName,
      festival: festival,
      member: member
    };

    // 创建问候气泡
    const bubble = createGreetingBubble(data);
    document.body.appendChild(bubble);
    currentGreeting = bubble;

    // 触发事件
    window.dispatchEvent(new CustomEvent('greeting:shown', { detail: data }));

    // 自动关闭
    if (duration > 0) {
      setTimeout(() => {
        hideGreeting();
      }, duration);
    }
  }

  /**
   * 隐藏问候
   */
  function hideGreeting() {
    if (currentGreeting) {
      currentGreeting.classList.add('greeting-fade-out');
      setTimeout(() => {
        if (currentGreeting) {
          currentGreeting.remove();
          currentGreeting = null;
        }
      }, CONFIG.fadeDuration);
    }
  }

  /**
   * 初始化问候模块
   */
  function init(options = {}) {
    const {
      userName = '',
      memberLevel = null,
      showOnLoad = true,
      position = 'bottom-right'
    } = options;

    CONFIG.position = position;

    if (showOnLoad) {
      // 页面加载后显示问候
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => showGreeting({ userName, memberLevel }), 1000);
        });
      } else {
        setTimeout(() => showGreeting({ userName, memberLevel }), 1000);
      }
    }

    // 绑定键盘快捷键
    document.addEventListener('keydown', (e) => {
      // Alt + G 显示问候
      if (e.altKey && e.key === 'g') {
        e.preventDefault();
        showGreeting({ userName, memberLevel });
      }
      // Escape 关闭问候
      if (e.key === 'Escape' && currentGreeting) {
        hideGreeting();
      }
    });
  }

  /**
   * API 暴露
   */
  window.PersonalGreeting = {
    init: init,
    show: showGreeting,
    hide: hideGreeting,
    getTimePeriod: getTimePeriod,
    getFestivalGreeting: getFestivalGreeting,
    getMemberGreeting: getMemberGreeting
  };

  // 导出配置
  window.PersonalGreetingConfig = CONFIG;

})();
