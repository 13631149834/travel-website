/**
 * 游导学习笔记 - 精致化5.0 场景文案工具
 * 早晨/中午/晚上/深夜/周末/考前的场景化文案
 */
(function() {
  'use strict';

  // ========== 场景文案配置 ==========
  const SCENE_CONFIG = {
    // 早晨6-9点
    morning: {
      timeRange: [6, 9],
      greeting: '早安',
      templates: [
        '新的一天，从学习开始',
        '早晨记忆力好，抓紧时间',
        '今天也要加油鸭',
        '美好的一天，从备考开始'
      ],
      cta: '开始学习'
    },
    
    // 中午11-13点
    noon: {
      timeRange: [11, 13],
      greeting: '午休',
      templates: [
        '午休时间，来两道题',
        '休息一下，看看知识点',
        '利用碎片时间备考',
        '饭后百步走，顺便刷个题'
      ],
      cta: '刷两道题'
    },
    
    // 下午13-18点
    afternoon: {
      timeRange: [13, 18],
      greeting: '下午好',
      templates: [
        '下午茶时间，学习一下',
        '坚持就是胜利',
        '努力就会有收获',
        '备考路上，你不是一个人'
      ],
      cta: '继续学习'
    },
    
    // 晚上18-23点
    evening: {
      timeRange: [18, 23],
      greeting: '晚上好',
      templates: [
        '晚上学习效率高',
        '今天学了吗',
        '夜深人静，适合备考',
        '学完今天的内容再休息'
      ],
      cta: '今晚学习'
    },
    
    // 深夜23点后
    lateNight: {
      timeRange: [23, 24],
      greeting: '夜深了',
      templates: [
        '早点休息，明天继续',
        '身体是革命的本钱',
        '别熬太晚哦',
        '明天精神好才能高效学习'
      ],
      cta: '收藏明天看'
    },
    
    // 凌晨0-6点
    dawn: {
      timeRange: [0, 6],
      greeting: '夜猫子',
      templates: [
        '这么晚还没睡？',
        '注意休息哦',
        '熬夜伤身，早点睡',
        '收藏内容明天看'
      ],
      cta: '收藏明天看'
    },
    
    // 周末
    weekend: {
      weekday: [0, 6], // 周日=0，周六=6
      greeting: '周末愉快',
      templates: [
        '充电好时机',
        '周末学习效率高',
        '弯道超车的好时候',
        '别人休息时你在学习'
      ],
      cta: '周末特训'
    },
    
    // 考前冲刺
    examRush: {
      threshold: 30, // 考前30天
      greeting: '冲刺阶段',
      templates: [
        '距离考试不远了',
        '坚持就是胜利',
        '冲刺阶段，加油',
        '最后阶段，不放弃'
      ],
      cta: '开始冲刺'
    }
  };

  // ========== 情绪触发配置 ==========
  const EMOTION_TRIGGERS = {
    curiosity: {
      // 好奇触发
      tag: '好奇',
      colors: ['#E65100', '#FF6D00'],
      templates: [
        '导游证到底难不难？',
        '一次考过的人是怎么学的？',
        '为什么有人考两次才过？',
        '导游词要背多少篇？'
      ]
    },
    resonance: {
      // 共鸣触发
      tag: '共鸣',
      colors: ['#BF360C', '#E65100'],
      templates: [
        '第一次挂在笔试',
        '面试紧张说不出来话',
        '知识点太多记不住',
        '做题总是差几分'
      ]
    },
    anxietyRelief: {
      // 焦虑缓解
      tag: '释压',
      colors: ['#FF8A65', '#FFAB91'],
      templates: [
        '80%的人都在这里卡住',
        '大部分人都要考两次',
        '备考路上你不是一个人',
        '走过弯路，所以更懂路'
      ]
    },
    achievement: {
      // 成就触发
      tag: '成就',
      colors: ['#FFB74D', '#FFD54F'],
      templates: [
        '完成章节有进度对比',
        '连续打卡7天了',
        '正确率达到80%',
        '又解锁了新成就'
      ]
    },
    scarcity: {
      // 稀缺触发
      tag: '稀缺',
      colors: ['#FF7043', '#FF8A65'],
      templates: [
        '限时资料包',
        '名额有限',
        '即将涨价',
        '仅剩少量名额'
      ]
    }
  };

  // ========== 场景文案工具 ==========
  const SceneCopy = {
    // 获取当前时间场景
    getCurrentScene() {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      const isWeekend = day === 0 || day === 6;
      
      let scene = null;
      
      // 按时间判断
      if (hour >= 0 && hour < 6) {
        scene = SCENE_CONFIG.dawn;
      } else if (hour >= 6 && hour < 11) {
        scene = SCENE_CONFIG.morning;
      } else if (hour >= 11 && hour < 13) {
        scene = SCENE_CONFIG.noon;
      } else if (hour >= 13 && hour < 18) {
        scene = SCENE_CONFIG.afternoon;
      } else if (hour >= 18 && hour < 23) {
        scene = SCENE_CONFIG.evening;
      } else {
        scene = SCENE_CONFIG.lateNight;
      }
      
      // 周末覆盖
      if (isWeekend && scene) {
        scene = { ...scene, ...SCENE_CONFIG.weekend };
      }
      
      return {
        ...scene,
        hour,
        day,
        isWeekend
      };
    },
    
    // 获取问候语
    getGreeting() {
      const scene = this.getCurrentScene();
      
      // 周末特殊问候
      if (scene.isWeekend) {
        return SCENE_CONFIG.weekend.greeting;
      }
      
      return scene.greeting;
    },
    
    // 获取随机文案
    getRandomCopy() {
      const scene = this.getCurrentScene();
      const templates = scene.templates || [];
      return templates[Math.floor(Math.random() * templates.length)];
    },
    
    // 获取完整场景文案
    getSceneMessage() {
      const greeting = this.getGreeting();
      const copy = this.getRandomCopy();
      const cta = this.getCTA();
      
      return {
        greeting,
        copy,
        cta,
        full: `${greeting}！${copy}`
      };
    },
    
    // 获取CTA文案
    getCTA() {
      const scene = this.getCurrentScene();
      return scene.cta;
    },
    
    // 检查是否考前冲刺
    isExamRush(examDate) {
      if (!examDate) {
        // 默认考试日期（假设每年11月第三个周六）
        const now = new Date();
        const year = now.getMonth() < 10 ? year : now.getFullYear();
        examDate = new Date(`${year}-11-15`); // 粗略估计
      }
      
      const daysUntil = Math.ceil((examDate - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntil <= SCENE_CONFIG.examRush.threshold && daysUntil > 0;
    },
    
    // 获取情绪触发文案
    getEmotionCopy(triggerType) {
      const trigger = EMOTION_TRIGGERS[triggerType];
      if (!trigger) return null;
      
      const templates = trigger.templates || [];
      const randomIndex = Math.floor(Math.random() * templates.length);
      
      return {
        tag: trigger.tag,
        color: trigger.colors[Math.floor(Math.random() * trigger.colors.length)],
        text: templates[randomIndex]
      };
    },
    
    // 获取情绪触发区域HTML
    renderEmotionTrigger(containerId, triggerTypes) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const html = triggerTypes.map(type => {
        const copy = this.getEmotionCopy(type);
        if (!copy) return '';
        
        return `
          <span class="emotion-trigger emotion-${type}" style="background: ${copy.color}">
            <span class="trigger-tag">${copy.tag}</span>
            <span class="trigger-text">${copy.text}</span>
          </span>
        `;
      }).join('');
      
      container.innerHTML = html;
      
      // 注入样式
      this.injectStyles();
    },
    
    // 注入样式
    injectStyles() {
      if (document.getElementById('scene-copy-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'scene-copy-styles';
      style.textContent = `
        .emotion-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #FFF;
          cursor: pointer;
          transition: all 0.2s;
          animation: emotionPulse 2s infinite;
        }
        .emotion-trigger:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .trigger-tag {
          font-weight: 700;
          background: rgba(255,255,255,0.3);
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 0.7rem;
        }
        .trigger-text {
          font-weight: 500;
        }
        @keyframes emotionPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        
        /* 场景提示样式 */
        .scene-toast {
          background: linear-gradient(135deg, #E65100, #FF6D00);
          color: #FFF;
          padding: 12px 20px;
          border-radius: 24px;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          animation: slideDown 0.3s ease;
        }
        .scene-toast .greeting {
          font-weight: 700;
        }
        .scene-toast .copy {
          opacity: 0.9;
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    },
    
    // 场景化欢迎提示
    showSceneWelcome(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const message = this.getSceneMessage();
      
      container.innerHTML = `
        <div class="scene-welcome">
          <div class="scene-greeting">${message.greeting}</div>
          <div class="scene-copy">${message.copy}</div>
        </div>
      `;
    },
    
    // 获取Slogan（品牌铁律）
    getSlogan() {
      return '走过弯路，所以更懂路';
    },
    
    // 渲染场景化Banner
    renderSceneBanner(containerId, options = {}) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const defaults = {
        showGreeting: true,
        showSlogan: true,
        showCTA: true,
        compact: false
      };
      options = { ...defaults, ...options };
      
      const scene = this.getSceneMessage();
      
      container.innerHTML = `
        <div class="scene-banner ${options.compact ? 'compact' : ''}">
          ${options.showGreeting ? `<div class="banner-greeting">${scene.greeting}</div>` : ''}
          ${options.showSlogan ? `<div class="banner-slogan">${this.getSlogan()}</div>` : ''}
          ${options.showCTA ? `<div class="banner-cta">${scene.cta}</div>` : ''}
        </div>
      `;
      
      // 注入样式
      const styleId = 'scene-banner-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .scene-banner {
            background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            border: 1px solid #FFE0B2;
          }
          .scene-banner.compact {
            padding: 12px 16px;
          }
          .banner-greeting {
            font-size: 1.2rem;
            font-weight: 700;
            color: #E65100;
            margin-bottom: 4px;
          }
          .banner-slogan {
            font-size: 0.85rem;
            color: #BF360C;
            margin-bottom: 8px;
          }
          .banner-cta {
            display: inline-block;
            background: #E65100;
            color: #FFF;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
          }
        `;
        document.head.appendChild(style);
      }
    }
  };

  // ========== 暴露到全局 ==========
  window.SceneCopy = SceneCopy;
  window.SCENE_CONFIG = SCENE_CONFIG;
  window.EMOTION_TRIGGERS = EMOTION_TRIGGERS;

})();
