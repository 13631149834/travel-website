/**
 * ===================================
 * 专属互动体验集成模块
 * 整合问候、加载动画、成功动画、彩蛋、音效
 * ===================================
 */

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    // 是否启用各模块
    modules: {
      greeting: true,      // 问候语
      easterEgg: true,    // 彩蛋
      sound: true          // 音效
    },
    // 用户信息
    user: {
      name: '',
      memberLevel: null,
      isLoggedIn: false
    }
  };

  /**
   * 初始化所有互动模块
   */
  function init(options = {}) {
    const {
      modules = CONFIG.modules,
      user = CONFIG.user
    } = options;

    // 合并用户配置
    CONFIG.modules = { ...CONFIG.modules, ...modules };
    CONFIG.user = { ...CONFIG.user, ...user };

    // 加载必要样式
    loadStyles();

    // 初始化各模块
    if (CONFIG.modules.easterEgg && window.EasterEgg) {
      EasterEgg.init();
    }

    if (CONFIG.modules.sound && window.SoundEffects) {
      SoundEffects.init({ autoBind: false });
    }

    if (CONFIG.modules.greeting && window.PersonalGreeting) {
      PersonalGreeting.init({
        userName: CONFIG.user.name,
        memberLevel: CONFIG.user.memberLevel,
        showOnLoad: CONFIG.user.isLoggedIn
      });
    }

    // 绑定页面交互
    bindInteractions();

    console.log('%c✨ 游导专属互动体验已就绪！', 'color: #667eea; font-size: 14px;');
  }

  /**
   * 加载必要样式
   */
  function loadStyles() {
    // 检查是否已加载
    if (document.getElementById('interaction-styles-loaded')) return;
    
    const styles = `
      /* 问候气泡 */
      .personal-greeting { /* 详见 greeting.js */ }
      
      /* 成功动画 */
      .success-animation-overlay { /* 详见 success-animation.js */ }
      
      /* 彩蛋 */
      .easter-egg-popup { /* 详见 easter-eggs.js */ }
      
      /* 加载动画 */
      .loading-splash { /* 详见 loading-animation.css */ }
      
      /* 音效开关 */
      .sound-toggle { /* 详见 sound-effects.js */ }
    `;
    
    const style = document.createElement('style');
    style.id = 'interaction-styles-loaded';
    style.textContent = styles;
    document.head.appendChild(style);
  }

  /**
   * 绑定页面交互事件
   */
  function bindInteractions() {
    // 绑定音效
    if (CONFIG.modules.sound) {
      SoundEffects.bind();
    }
  }

  /**
   * 显示完整成功动画
   */
  function showSuccess(type, options = {}) {
    return SuccessAnimation.show(type, options);
  }

  /**
   * 显示成功提示
   */
  function showSuccessToast(message, icon) {
    return SuccessAnimation.toast(message, icon);
  }

  /**
   * 显示庆祝效果
   */
  function celebrate(options) {
    return SuccessAnimation.celebrate(options);
  }

  /**
   * 显示问候
   */
  function showGreeting(options) {
    return PersonalGreeting.show(options);
  }

  /**
   * 显示彩蛋
   */
  function showEasterEgg(icon, title, message) {
    return EasterEgg.show(icon, title, message);
  }

  /**
   * 触发彩蛋庆祝
   */
  function triggerCelebration() {
    return EasterEgg.celebrate();
  }

  /**
   * 播放音效
   */
  function playSound(type) {
    if (!CONFIG.modules.sound) return;
    
    const sounds = {
      click: SoundEffects.playClick,
      button: SoundEffects.playButtonClick,
      success: SoundEffects.playSuccess,
      error: SoundEffects.playError,
      notification: SoundEffects.playNotification,
      toggle: SoundEffects.playToggle,
      type: SoundEffects.playType,
      popup: SoundEffects.playPopup,
      celebration: SoundEffects.playCelebration,
      easterEgg: SoundEffects.playEasterEgg
    };
    
    if (sounds[type]) {
      sounds[type]();
    }
  }

  /**
   * 切换音效
   */
  function toggleSound() {
    return SoundEffects.toggle();
  }

  /**
   * 创建加载页面
   */
  function createLoadingScreen(options = {}) {
    const {
      autoHide = true,
      duration = 2000,
      showProgress = true,
      onComplete = null
    } = options;

    const splash = document.createElement('div');
    splash.className = 'loading-splash';
    splash.innerHTML = `
      <div class="loading-logo-container">
        <div class="loading-logo-glow"></div>
        <div class="loading-logo">
          <span class="loading-logo-icon">🧭</span>
        </div>
        <div class="loading-logo-text">游导旅游</div>
      </div>
      ${showProgress ? `
        <div class="loading-progress-wrapper">
          <div class="loading-progress-text">
            <span>正在加载精彩...</span>
            <span class="loading-progress-percentage">0%</span>
          </div>
          <div class="loading-progress-bar">
            <div class="loading-progress-fill"></div>
          </div>
        </div>
      ` : ''}
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p class="loading-hint">正在为您准备精彩的旅行体验~</p>
    `;

    document.body.appendChild(splash);

    // 进度动画
    if (showProgress) {
      const percentage = splash.querySelector('.loading-progress-percentage');
      const fill = splash.querySelector('.loading-progress-fill');
      let progress = 0;
      
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        percentage.textContent = Math.round(progress) + '%';
        fill.style.width = progress + '%';
      }, duration / 10);
    }

    // 自动隐藏
    if (autoHide) {
      setTimeout(() => {
        splash.classList.add('loading-hidden');
        setTimeout(() => {
          splash.remove();
          if (onComplete) onComplete();
        }, 600);
      }, duration);
    }

    return splash;
  }

  /**
   * 隐藏加载页面
   */
  function hideLoadingScreen() {
    const splash = document.querySelector('.loading-splash');
    if (splash) {
      splash.classList.add('loading-hidden');
      setTimeout(() => splash.remove(), 600);
    }
  }

  /**
   * API 暴露
   */
  window.PersonalExperience = {
    // 初始化
    init: init,
    
    // 成功动画
    success: {
      show: showSuccess,
      toast: showSuccessToast,
      celebrate: celebrate
    },
    
    // 问候语
    greeting: {
      show: showGreeting
    },
    
    // 彩蛋
    easterEgg: {
      show: showEasterEgg,
      celebrate: triggerCelebration
    },
    
    // 音效
    sound: {
      play: playSound,
      toggle: toggleSound
    },
    
    // 加载
    loading: {
      create: createLoadingScreen,
      hide: hideLoadingScreen
    },
    
    // 配置
    config: CONFIG
  };

})();

// 自动初始化（可选）
// document.addEventListener('DOMContentLoaded', () => {
//   PersonalExperience.init();
// });
