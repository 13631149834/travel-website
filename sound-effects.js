/**
 * ===================================
 * 专属音效模块
 * 点击音效、成功音效、通知音效、音效开关
 * ===================================
 */

(function() {
  'use strict';

  // 音效配置
  const CONFIG = {
    // 音效音量 (0-1)
    volume: 0.5,
    // 是否启用音效
    enabled: true,
    // 音效文件路径（使用Web Audio API生成合成音效）
    audioPath: ''
  };

  // 音频上下文
  let audioContext = null;

  /**
   * 初始化音频上下文
   */
  function initAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  }

  /**
   * 播放指定频率的声音
   */
  function playTone(frequency, duration, type = 'sine', volume = CONFIG.volume) {
    if (!CONFIG.enabled) return;
    
    try {
      const ctx = initAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      
      // 音量包络
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('音效播放失败:', e);
    }
  }

  /**
   * 播放音效序列
   */
  function playSequence(notes, tempo = 120) {
    if (!CONFIG.enabled) return;
    
    const beatDuration = 60 / tempo / 4; // 16分音符
    
    notes.forEach((note, index) => {
      setTimeout(() => {
        if (note.freq) {
          playTone(note.freq, note.duration || 0.1, note.type || 'sine', note.volume || CONFIG.volume);
        }
      }, index * beatDuration * 1000);
    });
  }

  /**
   * 点击音效 - 轻柔的"叮"声
   */
  function playClick() {
    playTone(880, 0.05, 'sine', CONFIG.volume * 0.5);
  }

  /**
   * 按钮点击音效
   */
  function playButtonClick() {
    playSequence([
      { freq: 523, duration: 0.05 },  // C5
      { freq: 659, duration: 0.08 }   // E5
    ], 240);
  }

  /**
   * 成功音效 - 欢快的上行音阶
   */
  function playSuccess() {
    playSequence([
      { freq: 523, duration: 0.1 },   // C5
      { freq: 587, duration: 0.1 },    // D5
      { freq: 659, duration: 0.1 },    // E5
      { freq: 784, duration: 0.15 },   // G5
      { freq: 1047, duration: 0.3 }    // C6
    ], 180);
  }

  /**
   * 错误音效 - 下行音调
   */
  function playError() {
    playSequence([
      { freq: 400, duration: 0.1 },
      { freq: 350, duration: 0.1 },
      { freq: 300, duration: 0.2 }
    ], 120);
  }

  /**
   * 通知音效 - 悦耳的双音
   */
  function playNotification() {
    playSequence([
      { freq: 698, duration: 0.08 },   // F5
      { freq: 880, duration: 0.15 }    // A5
    ], 200);
  }

  /**
   * 警告音效
   */
  function playWarning() {
    playSequence([
      { freq: 600, duration: 0.1 },
      { freq: 600, duration: 0.1 },
      { freq: 600, duration: 0.1 }
    ], 180);
  }

  /**
   * 加载完成音效
   */
  function playLoadingComplete() {
    playSequence([
      { freq: 523, duration: 0.08 },   // C5
      { freq: 659, duration: 0.08 },   // E5
      { freq: 784, duration: 0.08 },   // G5
      { freq: 1047, duration: 0.2 }    // C6
    ], 200);
  }

  /**
   * 开关切换音效
   */
  function playToggle() {
    playTone(660, 0.05, 'square', CONFIG.volume * 0.3);
  }

  /**
   * 输入反馈音效
   */
  function playType() {
    playTone(440 + Math.random() * 200, 0.02, 'sine', CONFIG.volume * 0.2);
  }

  /**
   * 弹窗出现音效
   */
  function playPopup() {
    playSequence([
      { freq: 523, duration: 0.05 },
      { freq: 659, duration: 0.08 },
      { freq: 784, duration: 0.08 }
    ], 300);
  }

  /**
   * 弹窗关闭音效
   */
  function playPopupClose() {
    playSequence([
      { freq: 784, duration: 0.05 },
      { freq: 659, duration: 0.08 },
      { freq: 523, duration: 0.08 }
    ], 300);
  }

  /**
   * 滚动切换音效
   */
  function playScroll() {
    playTone(330, 0.03, 'sine', CONFIG.volume * 0.15);
  }

  /**
   * 选中音效
   */
  function playSelect() {
    playSequence([
      { freq: 784, duration: 0.05 },
      { freq: 988, duration: 0.1 }
    ], 240);
  }

  /**
   * 取消音效
   */
  function playCancel() {
    playSequence([
      { freq: 400, duration: 0.08 },
      { freq: 300, duration: 0.12 }
    ], 120);
  }

  /**
   * 祝福音效（特殊日期）
   */
  function playCelebration() {
    const melody = [
      { freq: 523, duration: 0.1 },
      { freq: 523, duration: 0.1 },
      { freq: 523, duration: 0.1 },
      { freq: 523, duration: 0.15 },
      { freq: 415, duration: 0.05 },
      { freq: 466, duration: 0.05 },
      { freq: 523, duration: 0.15 },
      { freq: 466, duration: 0.05 },
      { freq: 523, duration: 0.2 }
    ];
    playSequence(melody, 180);
  }

  /**
   * 彩蛋发现音效
   */
  function playEasterEgg() {
    const melody = [
      { freq: 523, duration: 0.08 },   // C5
      { freq: 659, duration: 0.08 },   // E5
      { freq: 784, duration: 0.08 },   // G5
      { freq: 1047, duration: 0.08 },  // C6
      { freq: 784, duration: 0.08 },   // G5
      { freq: 1047, duration: 0.15 },  // C6
      { freq: 1319, duration: 0.3 }     // E6
    ];
    playSequence(melody, 200);
  }

  /**
   * 刮刮乐/抽奖音效
   */
  function playScratch() {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        playTone(200 + Math.random() * 400, 0.02, 'sawtooth', CONFIG.volume * 0.1);
      }, i * 30);
    }
  }

  /**
   * 设置音量
   */
  function setVolume(volume) {
    CONFIG.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('soundVolume', CONFIG.volume);
  }

  /**
   * 获取音量
   */
  function getVolume() {
    return CONFIG.volume;
  }

  /**
   * 启用音效
   */
  function enable() {
    CONFIG.enabled = true;
    localStorage.setItem('soundEnabled', 'true');
    // 初始化音频上下文（需要用户交互）
    initAudioContext();
  }

  /**
   * 禁用音效
   */
  function disable() {
    CONFIG.enabled = false;
    localStorage.setItem('soundEnabled', 'false');
  }

  /**
   * 切换音效状态
   */
  function toggle() {
    if (CONFIG.enabled) {
      disable();
    } else {
      enable();
    }
    return CONFIG.enabled;
  }

  /**
   * 获取音效状态
   */
  function isEnabled() {
    return CONFIG.enabled;
  }

  /**
   * 创建音效开关UI
   */
  function createSoundToggle(container) {
    const toggle = document.createElement('div');
    toggle.className = 'sound-toggle';
    toggle.innerHTML = `
      <button class="sound-toggle-btn" aria-label="${CONFIG.enabled ? '关闭' : '开启'}音效" title="音效开关">
        <span class="sound-icon">${CONFIG.enabled ? '🔊' : '🔇'}</span>
      </button>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      .sound-toggle {
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 9999;
      }
      
      .sound-toggle-btn {
        width: 44px;
        height: 44px;
        border: none;
        border-radius: 50%;
        background: white;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      
      .sound-toggle-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }
      
      .sound-toggle-btn:active {
        transform: scale(0.95);
      }
      
      .sound-icon {
        font-size: 20px;
      }
      
      @media (max-width: 480px) {
        .sound-toggle {
          bottom: 15px;
          left: 15px;
        }
        
        .sound-toggle-btn {
          width: 40px;
          height: 40px;
        }
      }
    `;
    document.head.appendChild(style);
    
    toggle.querySelector('.sound-toggle-btn').addEventListener('click', () => {
      const enabled = toggle();
      toggle.querySelector('.sound-icon').textContent = enabled ? '🔊' : '🔇';
      toggle.querySelector('.sound-toggle-btn').setAttribute('aria-label', enabled ? '关闭音效' : '开启音效');
    });
    
    if (container) {
      container.appendChild(toggle);
    } else {
      document.body.appendChild(toggle);
    }
    
    return toggle;
  }

  /**
   * 绑定页面交互音效
   */
  function bindPageSounds() {
    // 点击音效
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        playButtonClick();
      } else if (e.target.tagName === 'A' || e.target.closest('a')) {
        playClick();
      }
    }, { passive: true });

    // 输入框音效
    document.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', () => playType());
    });
  }

  /**
   * 初始化
   */
  function init(options = {}) {
    const {
      volume = 0.5,
      enabled = true,
      autoBind = true
    } = options;

    // 从localStorage恢复设置
    const savedVolume = localStorage.getItem('soundVolume');
    const savedEnabled = localStorage.getItem('soundEnabled');

    CONFIG.volume = savedVolume !== null ? parseFloat(savedVolume) : volume;
    CONFIG.enabled = savedEnabled !== null ? savedEnabled === 'true' : enabled;

    if (autoBind) {
      // 用户首次交互时初始化音频上下文
      const initOnInteraction = () => {
        initAudioContext();
        document.removeEventListener('click', initOnInteraction);
        document.removeEventListener('keydown', initOnInteraction);
      };
      
      document.addEventListener('click', initOnInteraction, { once: true });
      document.addEventListener('keydown', initOnInteraction, { once: true });
    }
  }

  /**
   * API 暴露
   */
  window.SoundEffects = {
    // 音效方法
    play: playTone,
    playClick: playClick,
    playButtonClick: playButtonClick,
    playSuccess: playSuccess,
    playError: playError,
    playNotification: playNotification,
    playWarning: playWarning,
    playLoadingComplete: playLoadingComplete,
    playToggle: playToggle,
    playType: playType,
    playPopup: playPopup,
    playPopupClose: playPopupClose,
    playScroll: playScroll,
    playSelect: playSelect,
    playCancel: playCancel,
    playCelebration: playCelebration,
    playEasterEgg: playEasterEgg,
    playScratch: playScratch,
    
    // 控制方法
    setVolume: setVolume,
    getVolume: getVolume,
    enable: enable,
    disable: disable,
    toggle: toggle,
    isEnabled: isEnabled,
    init: init,
    bind: bindPageSounds,
    createToggle: createSoundToggle
  };

})();
