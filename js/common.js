// 游导学习笔记 - 公共JS模块 v5.1 (精致化5.0-Y批次)
// 新增：品牌人格化CONFIG/回访体验/价值锚定/视觉引导/模块加载优化
(function() {
  'use strict';

  // ========== 情感化微文案库 v5.0 ==========
  const MICRO_COPY = {
    // 空状态提示
    emptyState: {
      study: '还没有学习记录，今天开始吧',
      search: '试试搜索导游证考点',
      favorites: '还没有收藏内容'
    },
    // 错误提示
    error: {
      general: '出了点小状况，刷新试试',
      network: '网络有点慢，稍后再试',
      server: '服务器开小差，马上回来'
    },
    // 加载提示
    loading: '马上就好',
    // 成功提示
    success: '搞定',
    // 确认删除
    confirmDelete: '确定要清除吗？学习记录找不回来哦',
    // 鼓励语
    encouragement: {
      progress: '又进步了一点',
      daily: '今天的你比昨天更棒',
      streak: '坚持就是胜利，继续加油'
    },
    // 提醒语
    reminder: {
      daily: '今天还没学习哦',
      weekly: '这周还没打卡呢'
    },
    // 完成语
    complete: {
      daily: '太棒了，今天的任务全部完成',
      chapter: '这个章节掌握得很扎实',
      milestone: '里程碑达成，继续冲刺'
    },
    // 精致化5.0：回访提示
    welcomeBack: {
      short: '欢迎回来，继续学习',
      long: '欢迎回来，距离上次学习已过去{time}',
      chapter: '上次学到第{chapter}章，继续加油'
    }
  };

  // ========== 防滥用/节流配置 ==========
  const ANTI_ABUSE = {
    searchThrottle: 500,      // 搜索节流500ms
    aiThrottle: 2000,          // AI请求节流2秒
    apiWarning: '提问太频繁啦，休息一下吧',  // 频率限制提示
    searchWarning: '搜太快啦，慢慢来'
  };

  // ========== 常量定义（替换魔法数字）==========
  const CONFIG = {
    // 品牌信息
    BRAND_NAME: '游导学习笔记',
    SLOGAN: '走过弯路，所以更懂路',
    WECHAT: 'ximao101',
    PRICE: '¥69.9',
    PRICE_YUAN: 69.9,
    COPYRIGHT: '©2025-2026',
    
    // 精致化5.0-Y: 品牌人格化CONFIG
    MANMAN: {
      // 人设说明
      DESCRIPTION: '考了两次才上岸的过来人',
      TITLE: '帮你的人',
      IDENTITY: '曼曼',
      AI_NAME: '小游',
      // 人设文案
      GREETING: '你好，我是曼曼',
      GREETING_LONG: '我是曼曼，考了两次才上岸',
      TAGLINE: '走过弯路，所以更懂路',
      // 价值主张
      VALUE_PROPOSITION: '带你用框架+口诀高效备考导游证',
      // 情绪触发点文案
      TRIGGERS: {
        CURIOUSITY: '导游证到底难不难？',  // 好奇触发
        ANXIETY_RELEIF: '80%的人都在这里卡住',  // 焦虑缓解
        FIRST_FAIL: '第一次挂在笔试',  // 共鸣触发
        MILESTONE: '完成章节有进度对比'  // 成就触发
      },
      // 价值锚定文案
      VALUE_ANCHORS: {
        DAILY_COST: '每天不到0.2元',  // 362份资料对比一杯奶茶
        AI_UNLIMITED: 'AI助手无限问=请家教1小时的钱用一整年',
        WECHAT_QA: '1v1微信答疑=随时有人帮'
      }
    },
    
    // 精致化5.0-Y: 回访体验CONFIG
    RETURN_USER: {
      LAST_CHAPTER_PREFIX: '上次学到第',
      LAST_CHAPTER_SUFFIX: '章，继续加油',
      TODAY_NOT_CHECKIN: '今日还未打卡',
      NEW_CONTENT_HINT: '发现新内容',
      LAST_VISIT_KEY: 'last_visit_time',
      LEARNED_CHAPTER_KEY: 'last_learned_chapter',
      CHECKIN_KEY: 'today_checkin',
      NEW_CONTENT_KEY: 'new_content_date'
    },
    
    // 精致化5.0-Y: 视觉引导线CONFIG
    VISUAL_GUIDE: {
      // 颜色引导配置
      COLOR_GUIDE: {
        HIGHLIGHT: '#E65100',  // 橙色=看这里
        SECONDARY: '#BF360C',  // 深橙=重点
        BACKGROUND: '#FFF3E0',  // 暖底背景
        CTA_COLOR: '#E65100'   // CTA按钮色
      },
      // 大小引导配置
      SIZE_GUIDE: {
        HERO_TITLE: 'clamp(2.2rem, 8vw, 3.5rem)',
        SECTION_TITLE: '1.3rem',
        BODY_TEXT: '0.9rem'
      },
      // 间距引导配置
      SPACING_GUIDE: {
        RELATED_GAP: '8px',   // 紧密=相关
        INDEPENDENT_GAP: '24px'  // 疏远=独立
      }
    },
    
    // 时间常量（毫秒）
    TOAST_DURATION: 2500,
    TOAST_ANIMATION: 300,
    MODAL_ANIMATION: 300,
    BANNER_AUTO_HIDE: 180000,  // 3分钟
    SCROLL_DEBOUNCE: 500,
    INSTALL_PROMPT_DELAY: 30000,  // 30秒
    // 性能常量
    DOUBLE_CLICK_DELAY: 500,
    WORDS_PER_MINUTE: 300,
    // 层级常量
    Z_INDEX_SKIP_LINK: 999999,
    Z_INDEX_INSTALL_BANNER: 9999,
    Z_INDEX_TOAST: 99999,
    Z_INDEX_MODAL: 99998,
    // 颜色常量
    BRAND_PRIMARY: '#E65100',
    BRAND_DARK: '#BF360C',
    BRAND_LIGHT: '#FFF3E0',
    
    // 精致化5.0：A/B测试配置
    AB_TEST: {
      // CTA按钮文案测试
      ctaText: {
        variant_a: '开始学习',
        variant_b: '免费试用'
      },
      // 首页布局测试
      homeLayout: {
        variant_a: 'standard',  // 标准布局
        variant_b: 'compact'    // 紧凑布局
      },
      // 价格展示方式
      priceDisplay: {
        original: '¥69.9',      // 原始展示
        simplified: '69.9元',   // 简化展示
        attractive: '仅69.9'    // 吸引力展示
      }
    },
    // 精致化5.0：横屏设置
    LANDSCAPE: {
      MIN_WIDTH: 768,  // 触发横屏提示的最小宽度
      CONTENT_MAX_WIDTH: 600  // 横屏时内容最大宽度
    },
    // 精致化5.0：输入验证
    VALIDATION: {
      SEARCH_MIN_LENGTH: 1,
      SEARCH_MAX_LENGTH: 100,
      ACTIVATION_CODE_LENGTH: 11,
      ACTIVATION_CODE_PATTERN: /^XM\d{4}-[A-Z0-9]{4}$/,
      TIMER_MIN_SECONDS: 10,
      TIMER_MAX_SECONDS: 600
    },
    // 精致化5.0-AA：功能开关（Feature Flags）
    FEATURES: {
      // 新功能开关 - true开启，false关闭
      NEW_CHAPTER_NAV: true,           // 新章节导航样式
      ENHANCED_FLASHCARD: true,        // 增强版闪卡
      AI_CHAT_V2: true,                // AI聊天V2版本
      DAILY_CHECKIN: true,             // 每日打卡功能
      ACHIEVEMENTS_V2: true,           // 成就系统V2
      SMART_RECOMMEND: true,           // 智能推荐
      VOICE_READ: false,               // 语音朗读（可关闭）
      DARK_MODE: false,                // 深色模式
      STUDY_STREAK: true,               // 学习连续打卡
      INTERVIEW_TIMER: true,           // 面试计时器
      WEAK_TOPIC_HIGHLIGHT: true,      // 薄弱知识点高亮
      // 灰度发布控制
      ROLL_OUT_PERCENT: 100,           // 灰度百分比 0-100
      BETA_TESTERS: []                  // 特定测试用户ID
    },
    // 精致化5.0-AA：localStorage版本迁移配置
    STORAGE_VERSION: {
      CURRENT: '5.0',                   // 当前版本号
      KEYS: {
        VERSION: 'data_version',       // 版本号存储key
        MIGRATION_LOG: 'migration_log'  // 迁移日志key
      }
    }
  };
  
  // 暴露CONFIG到全局
  window.CONFIG = CONFIG;

  // ========== Skip导航链接（无障碍）==========
  function initSkipLink() {
    if (document.getElementById('skip-link')) return;
    const skipLink = document.createElement('a');
    skipLink.id = 'skip-link';
    skipLink.href = '#main-content';
    skipLink.textContent = '跳过导航，直达内容';
    skipLink.style.cssText = `
      position: fixed;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      background: ${CONFIG.BRAND_PRIMARY};
      color: #fff;
      padding: 12px 24px;
      border-radius: 0 0 12px 12px;
      font-size: 0.9rem;
      font-weight: 600;
      z-index: ${CONFIG.Z_INDEX_SKIP_LINK};
      transition: top 0.3s;
      text-decoration: none;
    `;
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-100px';
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // 确保main-content存在
    const main = document.querySelector('main') || document.querySelector('.container') || document.querySelector('.content');
    if (main && !main.id) {
      main.id = 'main-content';
    }
  }

  // ========== 滚动位置保存与恢复 ==========
  const ScrollManager = {
    KEY_PREFIX: 'scroll_',
    
    save() {
      const key = this.KEY_PREFIX + window.location.pathname;
      const scrollY = window.scrollY || window.pageYOffset;
      localStorage.setItem(key, scrollY.toString());
    },
    
    restore() {
      const key = this.KEY_PREFIX + window.location.pathname;
      const saved = localStorage.getItem(key);
      if (saved) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(saved, 10));
        }, 100);
      }
    },
    
    clear() {
      const key = this.KEY_PREFIX + window.location.pathname;
      localStorage.removeItem(key);
    }
  };

  // ========== 精致化5.0：回访检测与挽留 ==========
  const ReturnVisitor = {
    LAST_VISIT_KEY: 'last_visit_timestamp',
    LAST_CHAPTER_KEY: 'last_read_chapter',
    LAST_PAGE_KEY: 'last_page_url',
    
    // 初始化回访检测
    init() {
      const now = Date.now();
      const lastVisit = localStorage.getItem(this.LAST_VISIT_KEY);
      const isReturning = lastVisit && (now - parseInt(lastVisit, 10)) > 60000; // 离开超过1分钟
      
      if (isReturning) {
        this.showWelcomeBack(now - parseInt(lastVisit, 10));
      }
      
      // 更新最后访问时间
      localStorage.setItem(this.LAST_VISIT_KEY, now.toString());
      
      // 保存当前页面
      localStorage.setItem(this.LAST_PAGE_KEY, window.location.href);
      
      // 注册页面卸载时保存状态（不弹窗，仅记录）
      window.addEventListener('beforeunload', () => {
        localStorage.setItem(this.LAST_VISIT_KEY, Date.now().toString());
      });
    },
    
    // 显示欢迎回来提示
    showWelcomeBack(absenceMs) {
      const hours = Math.floor(absenceMs / (1000 * 60 * 60));
      const days = Math.floor(absenceMs / (1000 * 60 * 60 * 24));
      let timeText = '';
      
      if (days > 0) {
        timeText = `${days}天`;
      } else if (hours > 0) {
        timeText = `${hours}小时`;
      } else {
        const minutes = Math.floor(absenceMs / (1000 * 60));
        timeText = `${minutes}分钟`;
      }
      
      const lastChapter = localStorage.getItem(this.LAST_CHAPTER_KEY);
      const lastPage = localStorage.getItem(this.LAST_PAGE_KEY);
      
      let message = MICRO_COPY.welcomeBack.short;
      if (days > 0 || hours > 2) {
        message = MICRO_COPY.welcomeBack.long.replace('{time}', timeText);
        if (lastChapter) {
          message += '\n' + MICRO_COPY.welcomeBack.chapter.replace('{chapter}', lastChapter);
        }
      }
      
      // 延迟显示，避免干扰首次访问
      setTimeout(() => {
        this.showWelcomeToast(message, lastPage);
      }, 1500);
    },
    
    // 显示欢迎toast
    showWelcomeToast(message, lastPage) {
      if (window.showToast) {
        const toast = document.createElement('div');
        toast.className = 'global-toast toast-welcome';
        toast.innerHTML = `
          <div style="text-align:center">
            <div style="font-size:1.2rem;margin-bottom:4px">👋</div>
            <div style="font-size:0.9rem;font-weight:600">${message}</div>
            ${lastPage ? `<a href="${lastPage}" style="color:#FFE082;font-size:0.8rem;margin-top:6px;display:inline-block">继续上次位置 →</a>` : ''}
          </div>
        `;
        toast.style.cssText = `
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          padding: 16px 24px;
          border-radius: 16px;
          font-size: 0.9rem;
          font-weight: 600;
          z-index: ${CONFIG.Z_INDEX_TOAST};
          opacity: 0;
          transition: all 0.3s ease;
          pointer-events: auto;
          max-width: 90%;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          background: linear-gradient(135deg, #E65100, #FF6D00);
          color: #fff;
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        
        // 5秒后自动消失
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 300);
        }, 5000);
      }
    },
    
    // 保存当前学习章节
    saveChapter(chapterNum, chapterName) {
      localStorage.setItem(this.LAST_CHAPTER_KEY, chapterNum);
      localStorage.setItem('last_chapter_name', chapterName || '');
    },
    
    // 获取上次学习章节
    getLastChapter() {
      return {
        num: localStorage.getItem(this.LAST_CHAPTER_KEY),
        name: localStorage.getItem('last_chapter_name')
      };
    }
  };
  
  // 暴露到全局
  window.ReturnVisitor = ReturnVisitor;

  // ========== 精致化5.0：用户状态持久化管理 ==========
  const UserStateManager = {
    // 知识库阅读位置
    knowledgeBase: {
      save(chapterId, scrollPosition) {
        const key = 'kb_progress_' + chapterId;
        localStorage.setItem(key, JSON.stringify({
          position: scrollPosition,
          timestamp: Date.now()
        }));
      },
      get(chapterId) {
        const key = 'kb_progress_' + chapterId;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }
    },
    
    // 闪卡浏览位置
    flashcard: {
      save(currentIndex, total) {
        localStorage.setItem('fc_progress', JSON.stringify({
          index: currentIndex,
          total: total,
          timestamp: Date.now()
        }));
      },
      get() {
        const data = localStorage.getItem('fc_progress');
        return data ? JSON.parse(data) : null;
      },
      clear() {
        localStorage.removeItem('fc_progress');
      }
    },
    
    // 刷题进度
    quiz: {
      save(stats) {
        localStorage.setItem('quiz_progress', JSON.stringify({
          ...stats,
          timestamp: Date.now()
        }));
      },
      get() {
        const data = localStorage.getItem('quiz_progress');
        return data ? JSON.parse(data) : null;
      },
      clear() {
        localStorage.removeItem('quiz_progress');
      }
    },
    
    // 搜索历史
    searchHistory: {
      MAX_ITEMS: 20,
      save(query) {
        if (!query || query.trim().length < 1) return;
        let history = this.getAll();
        // 去重
        history = history.filter(item => item !== query);
        // 添加到开头
        history.unshift(query);
        // 限制数量
        if (history.length > this.MAX_ITEMS) {
          history = history.slice(0, this.MAX_ITEMS);
        }
        localStorage.setItem('search_history', JSON.stringify(history));
      },
      getAll() {
        const data = localStorage.getItem('search_history');
        return data ? JSON.parse(data) : [];
      },
      clear() {
        localStorage.removeItem('search_history');
      }
    },
    
    // 用户偏好
    preferences: {
      save(key, value) {
        let prefs = this.getAll();
        prefs[key] = value;
        localStorage.setItem('user_preferences', JSON.stringify(prefs));
      },
      get(key) {
        const prefs = this.getAll();
        return prefs[key];
      },
      getAll() {
        const data = localStorage.getItem('user_preferences');
        return data ? JSON.parse(data) : {};
      }
    }
  };
  
  window.UserStateManager = UserStateManager;

  // ========== 精致化5.0-AA：localStorage数据版本迁移 ==========
  const StorageMigration = {
    // 迁移规则定义
    migrations: {
      '4.0': {
        // 从4.0迁移到5.0
        description: '升级到5.0版本',
        migrate: (oldData) => {
          // 旧版成就数据迁移
          if (oldData.achievements_data && !oldData.achievements_data.version) {
            oldData.achievements_data.version = '5.0';
            oldData.achievements_data.lastMigrated = Date.now();
          }
          // 旧版学习进度迁移
          if (oldData.study_progress && typeof oldData.study_progress === 'object' && !Array.isArray(oldData.study_progress)) {
            // 确保数据结构兼容
            oldData.study_progress._migrated = true;
          }
          return oldData;
        }
      }
    },
    
    // 获取当前版本
    getVersion() {
      try {
        const version = localStorage.getItem(CONFIG.STORAGE_VERSION.KEYS.VERSION);
        return version || '0.0';  // 默认为0.0表示从未迁移
      } catch(e) {
        return '0.0';
      }
    },
    
    // 设置版本
    setVersion(version) {
      localStorage.setItem(CONFIG.STORAGE_VERSION.KEYS.VERSION, version);
    },
    
    // 执行迁移
    migrate() {
      const currentVersion = this.getVersion();
      const targetVersion = CONFIG.STORAGE_VERSION.CURRENT;
      
      // 如果已是最新版本，跳过
      if (currentVersion === targetVersion) {
        console.log('[StorageMigration] 数据已是最新版本 ' + targetVersion);
        return true;
      }
      
      try {
        // 按顺序执行迁移
        const migrationOrder = ['4.0']; // 可按需扩展
        const migrationLog = this.getMigrationLog();
        
        for (const version of migrationOrder) {
          if (this.compareVersion(version, currentVersion) > 0 && 
              this.compareVersion(version, targetVersion) <= 0 &&
              !migrationLog.includes(version)) {
            console.log('[StorageMigration] 正在迁移到版本 ' + version);
            
            // 获取需要迁移的数据
            const allData = this.getAllLocalStorageData();
            const migratedData = this.migrations[version].migrate(allData);
            
            // 保存迁移后的数据
            this.saveAllLocalStorageData(migratedData);
            
            // 记录迁移日志
            migrationLog.push(version);
            this.setMigrationLog(migrationLog);
            this.setVersion(version);
            
            console.log('[StorageMigration] 版本 ' + version + ' 迁移完成');
          }
        }
        
        // 最终版本更新
        this.setVersion(targetVersion);
        console.log('[StorageMigration] 数据迁移完成，当前版本: ' + targetVersion);
        return true;
      } catch(e) {
        console.error('[StorageMigration] 迁移失败:', e);
        // 迁移失败不影响功能，降级处理
        return false;
      }
    },
    
    // 获取迁移日志
    getMigrationLog() {
      try {
        const log = localStorage.getItem(CONFIG.STORAGE_VERSION.KEYS.MIGRATION_LOG);
        return log ? JSON.parse(log) : [];
      } catch(e) {
        return [];
      }
    },
    
    // 设置迁移日志
    setMigrationLog(log) {
      localStorage.setItem(CONFIG.STORAGE_VERSION.KEYS.MIGRATION_LOG, JSON.stringify(log));
    },
    
    // 获取所有localStorage数据
    getAllLocalStorageData() {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          data[key] = JSON.parse(localStorage.getItem(key));
        } catch(e) {
          data[key] = localStorage.getItem(key);
        }
      }
      return data;
    },
    
    // 保存所有localStorage数据
    saveAllLocalStorageData(data) {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const value = data[key];
          if (typeof value === 'object') {
            localStorage.setItem(key, JSON.stringify(value));
          } else {
            localStorage.setItem(key, value);
          }
        }
      }
    },
    
    // 版本比较：v1 > v2返回正数，v1 < v2返回负数
    compareVersion(v1, v2) {
      const parts1 = v1.split('.').map(Number);
      const parts2 = v2.split('.').map(Number);
      for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
      }
      return 0;
    },
    
    // 重置数据（谨慎使用）
    reset() {
      try {
        localStorage.removeItem(CONFIG.STORAGE_VERSION.KEYS.VERSION);
        localStorage.removeItem(CONFIG.STORAGE_VERSION.KEYS.MIGRATION_LOG);
        console.log('[StorageMigration] 版本记录已重置');
      } catch(e) {
        console.error('[StorageMigration] 重置失败:', e);
      }
    }
  };
  
  window.StorageMigration = StorageMigration;

  function initScrollManager() {
    // 恢复滚动位置
    ScrollManager.restore();
    
    // 保存滚动位置（防抖）
    const saveScroll = debounce(() => ScrollManager.save(), CONFIG.SCROLL_DEBOUNCE);
    window.addEventListener('scroll', saveScroll, { passive: true });
    
    // 页面卸载前保存
    window.addEventListener('beforeunload', () => ScrollManager.save());
  }

  // ========== 焦点管理（弹窗无障碍）==========
  const FocusManager = {
    modal: null,
    previousFocus: null,
    
    open(modalEl) {
      this.modal = modalEl;
      this.previousFocus = document.activeElement;
      
      // 锁定焦点在弹窗内
      modalEl.addEventListener('keydown', this.handleTab.bind(this));
      
      // 聚焦到弹窗内第一个可交互元素
      const focusable = modalEl.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) {
        focusable.focus();
      } else {
        modalEl.focus();
      }
      
      // 点击遮罩关闭
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
          this.close();
        }
      });
    },
    
    handleTab(e) {
      if (e.key !== 'Tab') return;
      
      const focusable = this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    
    close() {
      if (this.modal) {
        this.modal.removeEventListener('keydown', this.handleTab);
        this.modal = null;
      }
      
      // 焦点回到触发元素
      if (this.previousFocus && this.previousFocus.focus) {
        this.previousFocus.focus();
      }
    }
  };

  window.FocusManager = FocusManager;

  // ========== 阅读时长计算 ==========
  window.calcReadTime = function(text, wpm = CONFIG.WORDS_PER_MINUTE) {
    const words = (text || '').length;
    const minutes = Math.ceil(words / wpm);
    return minutes < 1 ? '<1' : minutes.toString();
  };

  // ========== 全局工具函数 ==========
  
  // 暴露情感化微文案到全局
  window.MICRO_COPY = MICRO_COPY;
  window.ANTI_ABUSE = ANTI_ABUSE;
  
  // 防抖函数
  window.debounce = function(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };
  
  // 节流函数（带防滥用提示）
  window.throttle = function(func, limit, warningMsg) {
    let inThrottle;
    let lastWarningTime = 0;
    const warningCooldown = 3000; // 警告冷却3秒
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      } else {
        // 显示频率限制提示
        const now = Date.now();
        if (warningMsg && now - lastWarningTime > warningCooldown) {
          lastWarningTime = now;
          if (window.showToast) {
            window.showToast(warningMsg, 'warning', 2000);
          }
        }
      }
    };
  };
  
  // 快速点击防护
  window.preventDoubleClick = function(callback, delay = CONFIG.DOUBLE_CLICK_DELAY) {
    let lastClick = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastClick < delay) return;
      lastClick = now;
      return callback.apply(this, args);
    };
  };
  
  // ========== PWA 安装提示 ==========
  let deferredPrompt = null;
  let isAppInstalled = localStorage.getItem('app_installed') === 'true';
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // 已安装则不提示
    if (isAppInstalled) return;
    
    // 延迟显示安装提示（用户首次访问后）
    setTimeout(() => {
      if (!isAppInstalled && deferredPrompt) {
        showInstallBanner();
      }
    }, CONFIG.INSTALL_PROMPT_DELAY);
  });
  
  window.addEventListener('appinstalled', () => {
    isAppInstalled = true;
    localStorage.setItem('app_installed', 'true');
    hideInstallBanner();
    showToast('🎉 已成功安装游导笔记！');
  });
  
  function showInstallBanner() {
    if (document.getElementById('pwa-install-banner')) return;
    
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="install-content">
        <span class="install-icon">📱</span>
        <span class="install-text">添加到主屏幕，更方便学习</span>
        <button class="install-btn" id="pwa-install-btn">安装</button>
        <button class="install-close" id="pwa-install-close">×</button>
      </div>
    `;
    banner.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 16px;
      right: 16px;
      background: linear-gradient(135deg, #E65100, #FF6D00);
      color: #fff;
      padding: 14px 16px;
      border-radius: 16px;
      z-index: ${CONFIG.Z_INDEX_INSTALL_BANNER};
      box-shadow: 0 4px 20px rgba(230, 81, 0, 0.3);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      .install-content { display: flex; align-items: center; gap: 10px; }
      .install-icon { font-size: 1.4rem; }
      .install-text { flex: 1; font-size: 0.9rem; font-weight: 600; }
      .install-btn { 
        background: #fff; color: #E65100; 
        border: none; padding: 8px 16px; 
        border-radius: 20px; font-size: 0.85rem; font-weight: 700;
        cursor: pointer;
      }
      .install-close { 
        background: none; border: none; 
        color: #fff; font-size: 1.2rem; 
        cursor: pointer; padding: 4px 8px;
        opacity: 0.8;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(banner);
    
    // 显示动画
    setTimeout(() => {
      banner.style.transform = 'translateY(0)';
      banner.style.opacity = '1';
    }, 100);
    
    // 安装按钮
    document.getElementById('pwa-install-btn').onclick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          isAppInstalled = true;
        }
        deferredPrompt = null;
      }
      hideInstallBanner();
    };
    
    // 关闭按钮
    document.getElementById('pwa-install-close').onclick = hideInstallBanner;
    
    // 3分钟后自动隐藏
    setTimeout(hideInstallBanner, CONFIG.BANNER_AUTO_HIDE);
  }
  
  function hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.style.transform = 'translateY(100px)';
      banner.style.opacity = '0';
      setTimeout(() => banner.remove(), 300);
    }
  }
  
  // ========== 情感系统 ==========
  const Emotional = {
    // 安静专注（学习页面）
    focus: () => {
      document.body.classList.remove('celebration', 'warning', 'error');
      document.body.classList.add('focus');
    },
    
    // 活泼庆祝（完成页面）
    celebrate: () => {
      document.body.classList.remove('focus', 'warning', 'error');
      document.body.classList.add('celebration');
      // 触发庆祝动画
      setTimeout(() => {
        if (document.body.classList.contains('celebration')) {
          triggerConfetti();
        }
      }, 500);
    },
    
    // 温和引导（错误页面）
    guide: () => {
      document.body.classList.remove('celebration', 'focus', 'error');
      document.body.classList.add('guide');
    },
    
    // 错误处理
    error: () => {
      document.body.classList.remove('celebration', 'focus', 'guide');
      document.body.classList.add('error');
    },
    
    // 重置
    reset: () => {
      document.body.classList.remove('celebration', 'focus', 'guide', 'error');
    }
  };
  
  window.Emotional = Emotional;
  
  // 庆祝动画（简易版）
  function triggerConfetti() {
    if (document.getElementById('confetti-container')) return;
    
    const container = document.createElement('div');
    container.id = 'confetti-container';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:${CONFIG.Z_INDEX_TOAST};overflow:hidden;';
    document.body.appendChild(container);
    
    const colors = ['#E65100', '#FF6D00', '#FFB74D', '#FFE082', '#FFF3E0'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: absolute;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}%;
        top: -20px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        animation: confettiFall ${Math.random() * 2 + 2}s linear forwards;
        opacity: ${Math.random() * 0.5 + 0.5};
      `;
      container.appendChild(confetti);
    }
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confettiFall {
        to {
          transform: translateY(100vh) rotate(${Math.random() * 720}deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => container.remove(), 4000);
  }
  
  // ========== Toast 提示系统 ==========
  window.showToast = function(message, type = 'info', duration = CONFIG.TOAST_DURATION) {
    const existing = document.querySelector('.global-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `global-toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .global-toast {
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 0.9rem;
        font-weight: 600;
        z-index: ${CONFIG.Z_INDEX_TOAST};
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      }
      .global-toast.show { opacity: 1; }
      .toast-info { background: #333; color: #fff; }
      .toast-success { background: #E65100; color: #fff; }
      .toast-warning { background: #FF9800; color: #fff; }
      .toast-error { background: #B91C1C; color: #fff; }
    `;
    if (!document.getElementById('toast-styles')) {
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };
  
  // ========== 成就解锁动画 ==========
  window.showAchievementUnlock = function(achievement) {
    const modal = document.createElement('div');
    modal.className = 'achievement-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', '成就解锁');
    modal.innerHTML = `
      <div class="achievement-popup">
        <div class="ach-icon">${achievement.icon}</div>
        <div class="ach-content">
          <div class="ach-label">🏆 成就解锁</div>
          <div class="ach-title">${achievement.title}</div>
          <div class="ach-desc">${achievement.desc}</div>
        </div>
      </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      .achievement-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: ${CONFIG.Z_INDEX_MODAL};
        animation: fadeIn 0.3s ease;
      }
      .achievement-popup {
        background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
        border-radius: 24px;
        padding: 32px;
        text-align: center;
        max-width: 320px;
        box-shadow: 0 20px 60px rgba(230,81,0,0.3);
        animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1);
      }
      .achievement-popup .ach-icon {
        font-size: 4rem;
        margin-bottom: 16px;
      }
      .achievement-popup .ach-label {
        color: #E65100;
        font-size: 0.85rem;
        font-weight: 700;
        margin-bottom: 8px;
      }
      .achievement-popup .ach-title {
        font-size: 1.3rem;
        font-weight: 800;
        color: #1A1A1A;
        margin-bottom: 8px;
      }
      .achievement-popup .ach-desc {
        font-size: 0.9rem;
        color: #666;
      }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes popIn {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', () => {
      modal.style.opacity = '0';
      setTimeout(() => modal.remove(), 300);
    });
    
    setTimeout(() => {
      if (modal.parentNode) {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
      }
    }, 3000);
  };
  
  // ========== 边界情况处理 ==========
  
  // 空搜索处理
  window.handleEmptySearch = function(query) {
    if (!query || query.trim() === '') {
      showToast('请输入搜索关键词', 'warning');
      return false;
    }
    if (query.length > 100) {
      showToast('搜索词过长，请精简', 'warning');
      return false;
    }
    return true;
  };
  
  // 输入安全处理
  window.sanitizeInput = function(input) {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .substring(0, 500);
  };
  
  // 超长文本截断
  window.truncateText = function(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // ========== localStorage过期数据清理 ==========
  const StorageCleaner = {
    // 清理过期数据（30天未访问的记录）
    cleanExpired: function(maxAge = 30 * 24 * 60 * 60 * 1000) {
      const now = Date.now();
      const keysToRemove = [];
      
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          
          // 跳过系统配置键
          if (key.startsWith('app_') || key === 'youdao_activated' || key === 'youdao_expire') continue;
          
          try {
            const value = localStorage.getItem(key);
            if (!value) continue;
            
            // 尝试解析JSON（包含timestamp字段的数据）
            const parsed = JSON.parse(value);
            if (parsed && parsed.timestamp && (now - parsed.timestamp) > maxAge) {
              keysToRemove.push(key);
            }
          } catch (e) {
            // 非JSON数据，检查scroll_等临时数据的存活时间
            if (key.startsWith('scroll_')) {
              const saved = localStorage.getItem(key);
              if (saved) {
                const age = now - parseInt(saved, 10);
                if (age > 7 * 24 * 60 * 60 * 1000) { // scroll数据7天过期
                  keysToRemove.push(key);
                }
              }
            }
          }
        }
        
        // 删除过期数据
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log('[StorageCleaner] Removed expired:', key);
        });
        
        if (keysToRemove.length > 0) {
          console.log('[StorageCleaner] Cleaned', keysToRemove.length, 'expired items');
        }
      } catch (e) {
        console.log('[StorageCleaner] Error during cleanup:', e);
      }
    },
    
    // 清理过大的数据（如聊天历史）
    cleanOversized: function(maxSize = 5 * 1024 * 1024) {
      const keysToRemove = [];
      
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          
          const size = localStorage.getItem(key)?.length || 0;
          if (size > maxSize) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log('[StorageCleaner] Removed oversized:', key);
        });
      } catch (e) {
        console.log('[StorageCleaner] Error during size cleanup:', e);
      }
    }
  };
  
  window.StorageCleaner = StorageCleaner;
  
  // ========== 初始化 ==========
  document.addEventListener('DOMContentLoaded', function() {
    // 精致化5.0-AA：执行localStorage数据版本迁移
    StorageMigration.migrate();
    
    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('SW registered');
      }).catch(err => {
        console.log('SW registration failed:', err);
      });
    }
    
    // 初始化无障碍功能（精致化3.0）
    initSkipLink();
    initScrollManager();
    
    // 精致化5.0：初始化回访检测
    ReturnVisitor.init();
    
    // 精致化5.0：横屏检测与提示
    initLandscapeHandler();
    
    // 清理过期localStorage数据（每天最多清理一次）
    const lastClean = localStorage.getItem('last_storage_clean');
    const oneDay = 24 * 60 * 60 * 1000;
    if (!lastClean || (Date.now() - parseInt(lastClean, 10)) > oneDay) {
      StorageCleaner.cleanExpired();
      StorageCleaner.cleanOversized();
      localStorage.setItem('last_storage_clean', Date.now().toString());
    }
    
    // 移除夜间模式功能（统一使用亮色主题，简化体验）
    
    // 回到顶部
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
      window.addEventListener('scroll', throttle(() => {
        backToTop.classList.toggle('visible', window.scrollY > 300);
      }, 200));
      backToTop.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }
    
    // ========== 精致化4.0: 页面生命周期管理 ==========
    
    // 页面可见性变化处理
    let animationTimers = [];
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 页面隐藏：暂停动画和计时器
        document.body.style.animationPlayState = 'paused';
        
        // 暂停所有 setInterval
        animationTimers.forEach(timer => {
          if (timer.type === 'interval') {
            clearInterval(timer.id);
          }
        });
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('page:hidden'));
      } else {
        // 页面可见：恢复动画
        document.body.style.animationPlayState = 'running';
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('page:visible'));
      }
    });
    
    // 页面显示事件（从bfcache恢复）
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        // 从bfcache恢复，重新初始化
        document.body.style.animationPlayState = 'running';
        window.dispatchEvent(new CustomEvent('page:restored'));
      }
    });
    
    // 页面隐藏事件
    window.addEventListener('pagehide', (e) => {
      if (!e.persisted) {
        // 非bfcache隐藏，保存状态
        ScrollManager.save();
        window.dispatchEvent(new CustomEvent('page:hide'));
      }
    });
    
    // 注册需要暂停的计时器
    window.registerTimer = (timerId, type = 'interval') => {
      animationTimers.push({ id: timerId, type });
    };
    
    // 取消注册
    window.unregisterTimer = (timerId) => {
      animationTimers = animationTimers.filter(t => t.id !== timerId);
    };
    
    // ========== 精致化4.0: 图片加载失败处理 ==========
    document.addEventListener('DOMContentLoaded', () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        img.addEventListener('error', function() {
          this.classList.add('error');
          this.alt = '图片加载失败';
        });
        img.addEventListener('load', function() {
          this.classList.add('loaded');
          this.classList.remove('error');
        });
      });
    });
    
    // ========== 精致化4.0: 网络状态监听 ==========
    function initNetworkListener() {
      // 检测online事件
      window.addEventListener('online', function() {
        // 显示网络恢复提示
        showToast('🌐 网络已恢复，正在同步...', 'success', 2000);
        
        // 触发数据同步
        setTimeout(function() {
          // 触发SW同步
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SYNC_DATA' });
          }
          // 触发页面级同步
          document.dispatchEvent(new CustomEvent('networkOnline'));
          showToast('✓ 数据同步完成', 'success', 1500);
        }, 1000);
      });
      
      // 检测offline事件
      window.addEventListener('offline', function() {
        showToast('📡 当前无网络，页面可离线使用', 'warning', 3000);
        document.dispatchEvent(new CustomEvent('networkOffline'));
      });
    }
    
    // 初始化网络监听
    initNetworkListener();
    
  });
  
  // ========== 精致化5.0：横屏检测与提示 ==========
  function initLandscapeHandler() {
    // 检测是否为横屏
    function isLandscape() {
      return window.innerWidth > window.innerHeight && window.innerWidth >= CONFIG.LANDSCAPE.MIN_WIDTH;
    }
    
    // 创建横屏提示
    function createLandscapeToast() {
      if (document.getElementById('landscape-toast')) return;
      
      const toast = document.createElement('div');
      toast.id = 'landscape-toast';
      toast.innerHTML = `
        <div class="landscape-content">
          <div class="landscape-icon">📱</div>
          <div class="landscape-text">
            <div class="landscape-title">建议竖屏使用</div>
            <div class="landscape-desc">横屏体验可能不佳，旋转设备可获得更好效果</div>
          </div>
          <button class="landscape-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
      `;
      
      const style = document.createElement('style');
      style.textContent = `
        #landscape-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #E65100, #FF6D00);
          color: #fff;
          padding: 12px 16px;
          border-radius: 16px;
          z-index: 99999;
          box-shadow: 0 4px 20px rgba(230,81,0,0.4);
          animation: slideDown 0.3s ease;
          max-width: 90%;
        }
        .landscape-content { display: flex; align-items: center; gap: 12px; }
        .landscape-icon { font-size: 1.8rem; flex-shrink: 0; }
        .landscape-text { flex: 1; }
        .landscape-title { font-size: 0.95rem; font-weight: 700; margin-bottom: 2px; }
        .landscape-desc { font-size: 0.75rem; opacity: 0.9; }
        .landscape-close {
          background: rgba(255,255,255,0.2);
          border: none;
          color: #fff;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          font-size: 1rem;
          cursor: pointer;
          flex-shrink: 0;
        }
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        /* 横屏时内容区限宽 */
        @media (orientation: landscape) and (min-width: 768px) {
          body { --content-max: ${CONFIG.LANDSCAPE.CONTENT_MAX_WIDTH}px; }
          .container, main, .content, .hero-inner, .package-inner, .wechat-inner {
            max-width: var(--content-max, 600px) !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(toast);
      
      // 10秒后自动消失
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 10000);
    }
    
    // 监听屏幕方向变化
    function handleOrientationChange() {
      if (isLandscape()) {
        createLandscapeToast();
        document.body.classList.add('landscape-mode');
      } else {
        const toast = document.getElementById('landscape-toast');
        if (toast) toast.remove();
        document.body.classList.remove('landscape-mode');
      }
    }
    
    // 初始化检测
    if (isLandscape()) {
      createLandscapeToast();
    }
    
    // 监听resize事件
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleOrientationChange, 100);
    });
    
    // 监听orientationchange事件
    window.addEventListener('orientationchange', () => {
      setTimeout(handleOrientationChange, 100);
    });
  }
  
  // ========== 精致化5.0：输入验证工具 ==========
  window.ValidationUtils = {
    // 搜索验证
    validateSearch(query) {
      if (!query || query.trim() === '') {
        return { valid: false, message: '请输入搜索关键词' };
      }
      const trimmed = query.trim();
      if (trimmed.length > CONFIG.VALIDATION.SEARCH_MAX_LENGTH) {
        return { valid: false, message: `搜索词过长，请控制在${CONFIG.VALIDATION.SEARCH_MAX_LENGTH}字以内` };
      }
      return { valid: true, value: trimmed };
    },
    
    // 激活码验证
    validateActivationCode(code) {
      if (!code || code.trim() === '') {
        return { valid: false, message: '请输入激活码' };
      }
      const trimmed = code.trim().toUpperCase();
      if (!CONFIG.VALIDATION.ACTIVATION_CODE_PATTERN.test(trimmed)) {
        return { valid: false, message: '激活码格式错误，示例：XM2026-ABCD' };
      }
      return { valid: true, value: trimmed };
    },
    
    // 计时器时间验证
    validateTimerInput(seconds) {
      const num = parseInt(seconds, 10);
      if (isNaN(num)) {
        return { valid: false, message: '请输入有效数字' };
      }
      if (num < CONFIG.VALIDATION.TIMER_MIN_SECONDS) {
        return { valid: false, message: `时间不能少于${CONFIG.VALIDATION.TIMER_MIN_SECONDS}秒` };
      }
      if (num > CONFIG.VALIDATION.TIMER_MAX_SECONDS) {
        return { valid: false, message: `时间不能超过${CONFIG.VALIDATION.TIMER_MAX_SECONDS}秒` };
      }
      return { valid: true, value: num };
    },
    
    // XSS防护
    sanitize(str) {
      if (typeof str !== 'string') return '';
      return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .substring(0, 500);
    }
  };

})();
