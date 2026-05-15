// ==========================================
// 游导旅游 - 游戏化备考系统 v1.0
// ==========================================
(function(){
  'use strict';

  // === 数据存储 ===
  const GS_KEY = 'youdao_game_state';
  
  function getState() {
    try {
      const s = localStorage.getItem(GS_KEY);
      return s ? JSON.parse(s) : null;
    } catch(e) { return null; }
  }
  
  function saveState(state) {
    try { localStorage.setItem(GS_KEY, JSON.stringify(state)); } catch(e) {}
  }
  
  function initState() {
    const s = getState();
    if (s) return s;
    const fresh = {
      xp: 0, level: 1, streak: 0, lastCheckIn: null,
      totalCheckIns: 0, totalQuestions: 0, totalGuides: 0, totalExams: 0, totalAIChats: 0,
      provincesVisited: [], achievements: [], dailyTasks: {},
      dailyTaskDate: null, petMood: 100, petLevel: 1,
      createdAt: Date.now()
    };
    saveState(fresh);
    return fresh;
  }

  // === 等级系统 ===
  const LEVELS = [
    {lv:1,name:'新手上路',icon:'🌱',xpNeed:0},
    {lv:2,name:'初窥门径',icon:'📖',xpNeed:50},
    {lv:3,name:'知识萌新',icon:'✏️',xpNeed:120},
    {lv:4,name:'备考学徒',icon:'📝',xpNeed:220},
    {lv:5,name:'勤奋学子',icon:'📚',xpNeed:350},
    {lv:6,name:'法规达人',icon:'⚖️',xpNeed:520},
    {lv:7,name:'导游新秀',icon:'🎒',xpNeed:730},
    {lv:8,name:'知识达人',icon:'🎓',xpNeed:980},
    {lv:9,name:'面试高手',icon:'🎯',xpNeed:1280},
    {lv:10,name:'通关王者',icon:'👑',xpNeed:1630},
    {lv:11,name:'导游精英',icon:'⭐',xpNeed:2050},
    {lv:12,name:'证书猎手',icon:'🏆',xpNeed:2550},
    {lv:13,name:'金牌导游',icon:'🏅',xpNeed:3150},
    {lv:14,name:'传奇导游',icon:'💫',xpNeed:3850},
    {lv:15,name:'至尊导游',icon:'🌟',xpNeed:4700},
  ];
  
  function getLevelInfo(lv) {
    return LEVELS.find(l => l.lv === lv) || LEVELS[LEVELS.length-1];
  }
  
  function getNextLevel(lv) {
    return LEVELS.find(l => l.lv === lv+1) || null;
  }
  
  function getXPProgress(xp, lv) {
    const curr = getLevelInfo(lv);
    const next = getNextLevel(lv);
    if (!next) return 100;
    return Math.floor(((xp - curr.xpNeed) / (next.xpNeed - curr.xpNeed)) * 100);
  }

  // === 成就系统 ===
  const ACHIEVEMENTS = [
    {id:'first_login',name:'初来乍到',icon:'🎉',desc:'首次访问网站',check:s=>s.totalCheckIns>=1},
    {id:'streak_3',name:'三日不断',icon:'🔥',desc:'连续签到3天',check:s=>s.streak>=3},
    {id:'streak_7',name:'一周坚持',icon:'💪',desc:'连续签到7天',check:s=>s.streak>=7},
    {id:'streak_14',name:'半月不懈',icon:'⚡',desc:'连续签到14天',check:s=>s.streak>=14},
    {id:'streak_30',name:'月度学霸',icon:'🏆',desc:'连续签到30天',check:s=>s.streak>=30},
    {id:'q_10',name:'初试锋芒',icon:'✍️',desc:'累计答题10道',check:s=>s.totalQuestions>=10},
    {id:'q_50',name:'百题斩',icon:'⚔️',desc:'累计答题50道',check:s=>s.totalQuestions>=50},
    {id:'q_100',name:'题海战术',icon:'🌊',desc:'累计答题100道',check:s=>s.totalQuestions>=100},
    {id:'q_200',name:'题神降临',icon:'🧠',desc:'累计答题200道',check:s=>s.totalQuestions>=200},
    {id:'guide_5',name:'初识名胜',icon:'🏔️',desc:'阅读5篇导游词',check:s=>s.totalGuides>=5},
    {id:'guide_15',name:'博古通今',icon:'🏛️',desc:'阅读15篇导游词',check:s=>s.totalGuides>=15},
    {id:'guide_30',name:'行万里路',icon:'🗺️',desc:'阅读30篇导游词',check:s=>s.totalGuides>=30},
    {id:'prov_5',name:'五省通游',icon:'🧳',desc:'查看5个省份',check:s=>s.provincesVisited.length>=5},
    {id:'prov_15',name:'半壁江山',icon:'🏯',desc:'查看15个省份',check:s=>s.provincesVisited.length>=15},
    {id:'prov_34',name:'走遍全国',icon:'🌏',desc:'查看全部34个省份',check:s=>s.provincesVisited.length>=34},
    {id:'exam_1',name:'初次试水',icon:'🏊',desc:'完成1次模拟考试',check:s=>s.totalExams>=1},
    {id:'exam_5',name:'身经百战',icon:'🛡️',desc:'完成5次模拟考试',check:s=>s.totalExams>=5},
    {id:'ai_5',name:'AI学伴',icon:'🤖',desc:'向AI提问5次',check:s=>s.totalAIChats>=5},
    {id:'ai_20',name:'AI挚友',icon:'🤝',desc:'向AI提问20次',check:s=>s.totalAIChats>=20},
    {id:'lv5',name:'通关新秀',icon:'⭐',desc:'达到5级',check:s=>s.level>=5},
    {id:'lv10',name:'通关王者',icon:'👑',desc:'达到10级',check:s=>s.level>=10},
    {id:'lv15',name:'至尊导游',icon:'🌟',desc:'达到15级',check:s=>s.level>=15},
    {id:'early_bird',name:'早起鸟',icon:'🌅',desc:'6:00-8:00签到',check:null},
    {id:'night_owl',name:'夜猫子',icon:'🦉',desc:'22:00-次日2:00学习',check:null},
  ];

  // === 每日任务 ===
  const DAILY_TASKS = [
    {id:'daily_checkin',name:'每日签到',icon:'📅',target:1,type:'checkin',xp:10},
    {id:'daily_questions',name:'答5道题',icon:'✍️',target:5,type:'questions',xp:25},
    {id:'daily_guide',name:'读1篇导游词',icon:'📖',target:1,type:'guides',xp:15},
    {id:'daily_explore',name:'浏览1个省份',icon:'🗺️',target:1,type:'explore',xp:10},
  ];

  // === 宠物系统 ===
  const PET_STAGES = [
    {lv:1,name:'导游蛋',icon:'🥚',mood:''},
    {lv:2,name:'萌新猫',icon:'🐱',mood:''},
    {lv:3,name:'学霸猫',icon:'😺',mood:''},
    {lv:4,name:'导游猫',icon:'🧭',mood:''},
    {lv:5,name:'大师猫',icon:'👑',mood:''},
  ];

  // === 核心逻辑 ===
  window.GameSystem = {
    state: null,
    
    init() {
      this.state = initState();
      this.checkDailyReset();
      this.render();
    },
    
    checkDailyReset() {
      const today = new Date().toDateString();
      if (this.state.dailyTaskDate !== today) {
        this.state.dailyTasks = {};
        this.state.dailyTaskDate = today;
        saveState(this.state);
      }
    },
    
    addXP(amount, source) {
      this.state.xp += amount;
      // 检查升级
      const next = getNextLevel(this.state.level);
      if (next && this.state.xp >= next.xpNeed) {
        this.state.level = next.lv;
        this.showLevelUp(next);
      }
      this.checkAchievements();
      saveState(this.state);
      this.updateWidget();
      this.showXPFloat(amount, source);
    },
    
    checkIn() {
      const today = new Date().toDateString();
      if (this.state.lastCheckIn === today) return false;
      
      const yesterday = new Date(Date.now()-86400000).toDateString();
      if (this.state.lastCheckIn === yesterday) {
        this.state.streak++;
      } else {
        this.state.streak = 1;
      }
      
      this.state.lastCheckIn = today;
      this.state.totalCheckIns++;
      
      // 连续签到奖励
      let bonus = 10;
      if (this.state.streak >= 7) bonus = 30;
      else if (this.state.streak >= 3) bonus = 20;
      
      // 早起鸟成就
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 8) {
        this.unlockAchievement('early_bird');
      }
      
      this.state.dailyTasks.daily_checkin = (this.state.dailyTasks.daily_checkin||0)+1;
      this.addXP(bonus, '签到');
      return true;
    },
    
    addQuestion() {
      this.state.totalQuestions++;
      this.state.dailyTasks.daily_questions = (this.state.dailyTasks.daily_questions||0)+1;
      this.addXP(5, '答题');
    },
    
    addGuide() {
      this.state.totalGuides++;
      this.state.dailyTasks.daily_guide = (this.state.dailyTasks.daily_guide||0)+1;
      this.addXP(15, '读导游词');
    },
    
    addExam() {
      this.state.totalExams++;
      this.addXP(50, '模拟考试');
    },
    
    addAIChat() {
      this.state.totalAIChats++;
      this.state.dailyTasks.daily_ai = (this.state.dailyTasks.daily_ai||0)+1;
      this.addXP(5, 'AI提问');
    },
    
    addProvinceVisit(province) {
      if (!this.state.provincesVisited.includes(province)) {
        this.state.provincesVisited.push(province);
        this.state.dailyTasks.daily_explore = (this.state.dailyTasks.daily_explore||0)+1;
        this.addXP(10, '探索省份');
      }
    },
    
    nightOwlCheck() {
      const hour = new Date().getHours();
      if (hour >= 22 || hour < 2) {
        this.unlockAchievement('night_owl');
      }
    },
    
    unlockAchievement(id) {
      if (!this.state.achievements.includes(id)) {
        this.state.achievements.push(id);
        saveState(this.state);
        const ach = ACHIEVEMENTS.find(a=>a.id===id);
        if (ach) this.showAchievementPopup(ach);
      }
    },
    
    checkAchievements() {
      for (const ach of ACHIEVEMENTS) {
        if (!this.state.achievements.includes(ach.id) && ach.check && ach.check(this.state)) {
          this.unlockAchievement(ach.id);
        }
      }
    },
    
    getPetInfo() {
      const pl = Math.min(Math.ceil(this.state.level/3), 5);
      return PET_STAGES[pl-1];
    },
    
    // === UI渲染 ===
    render() {
      if (document.getElementById('game-widget')) return;
      
      const w = document.createElement('div');
      w.id = 'game-widget';
      w.innerHTML = `
        <div id="game-float-btn" onclick="GameSystem.togglePanel()">
          <span id="game-pet-icon">${this.getPetInfo().icon}</span>
          <span id="game-lv-badge">Lv${this.state.level}</span>
          <div id="game-xp-bar-mini"><div id="game-xp-fill-mini"></div></div>
        </div>
        <div id="game-panel" style="display:none">
          <div id="game-panel-header">
            <div id="game-user-info">
              <span id="game-lv-icon">${getLevelInfo(this.state.level).icon}</span>
              <div>
                <div id="game-lv-name">${getLevelInfo(this.state.level).name}</div>
                <div id="game-lv-num">Lv.${this.state.level}</div>
              </div>
            </div>
            <button id="game-close-btn" onclick="GameSystem.togglePanel()">✕</button>
          </div>
          <div id="game-xp-section">
            <div id="game-xp-bar"><div id="game-xp-fill"></div></div>
            <div id="game-xp-text"></div>
          </div>
          <div id="game-tabs-nav">
            <div class="game-tab-btn active" data-gtab="checkin" onclick="GameSystem.switchGameTab('checkin')">📅签到</div>
            <div class="game-tab-btn" data-gtab="tasks" onclick="GameSystem.switchGameTab('tasks')">🎯任务</div>
            <div class="game-tab-btn" data-gtab="achievements" onclick="GameSystem.switchGameTab('achievements')">🏅成就</div>
            <div class="game-tab-btn" data-gtab="collection" onclick="GameSystem.switchGameTab('collection')">🗺️图鉴</div>
          </div>
          <div id="game-tab-content"></div>
        </div>
      `;
      document.body.appendChild(w);
      
      // 注入CSS
      if (!document.getElementById('game-css')) {
        const style = document.createElement('style');
        style.id = 'game-css';
        style.textContent = this.getCSS();
        document.head.appendChild(style);
      }
      
      this.updateWidget();
      this.nightOwlCheck();
    },
    
    getCSS() {
      return `
#game-widget{position:fixed;bottom:80px;right:12px;z-index:9999;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif}
#game-float-btn{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#4C8BF5,#7C3AED);display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(76,139,245,0.4);cursor:pointer;transition:transform .2s;position:relative}
#game-float-btn:active{transform:scale(0.92)}
#game-pet-icon{font-size:22px;line-height:1}
#game-lv-badge{position:absolute;top:-4px;right:-4px;background:#FF6B35;color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:8px;line-height:1.4}
#game-xp-bar-mini{position:absolute;bottom:2px;left:10px;right:10px;height:3px;background:rgba(255,255,255,0.3);border-radius:2px}
#game-xp-fill-mini{height:100%;background:#FFD700;border-radius:2px;transition:width .5s}
#game-panel{position:absolute;bottom:64px;right:0;width:300px;max-height:70vh;background:#fff;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,0.15);overflow:hidden;animation:slideUp .3s ease}
@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
#game-panel-header{background:linear-gradient(135deg,#4C8BF5,#7C3AED);padding:16px;display:flex;justify-content:space-between;align-items:center}
#game-user-info{display:flex;align-items:center;gap:10px;color:#fff}
#game-lv-icon{font-size:28px}
#game-lv-name{font-size:14px;font-weight:600}
#game-lv-num{font-size:11px;opacity:.8}
#game-close-btn{background:rgba(255,255,255,0.2);border:none;color:#fff;width:24px;height:24px;border-radius:50%;font-size:12px;cursor:pointer}
#game-xp-section{padding:12px 16px 8px}
#game-xp-bar{height:8px;background:#E5E7EB;border-radius:4px;overflow:hidden}
#game-xp-fill{height:100%;background:linear-gradient(90deg,#4C8BF5,#7C3AED);border-radius:4px;transition:width .5s}
#game-xp-text{font-size:11px;color:#999;margin-top:4px;text-align:center}
#game-tabs-nav{display:flex;border-bottom:1px solid #E5E7EB;padding:0 8px}
.game-tab-btn{flex:1;text-align:center;padding:8px 4px;font-size:12px;color:#666;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s}
.game-tab-btn.active{color:#4C8BF5;border-bottom-color:#4C8BF5;font-weight:600}
#game-tab-content{padding:12px 16px;max-height:40vh;overflow-y:auto}
.game-checkin-area{text-align:center;padding:10px 0}
.game-checkin-btn{background:linear-gradient(135deg,#4C8BF5,#7C3AED);color:#fff;border:none;padding:12px 40px;border-radius:25px;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(76,139,245,0.3);transition:transform .2s}
.game-checkin-btn:active{transform:scale(0.95)}
.game-checkin-btn.checked{background:#E5E7EB;color:#999;box-shadow:none;cursor:default}
.game-streak{display:flex;justify-content:center;gap:6px;margin:12px 0}
.game-streak-day{width:32px;height:32px;border-radius:50%;border:2px solid #E5E7EB;display:flex;align-items:center;justify-content:center;font-size:11px;color:#999}
.game-streak-day.done{background:#4C8BF5;border-color:#4C8BF5;color:#fff}
.game-streak-day.today{border-color:#4C8BF5;color:#4C8BF5;font-weight:600}
.game-task-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #F3F4F6}
.game-task-icon{font-size:20px}
.game-task-info{flex:1}
.game-task-name{font-size:13px;font-weight:500;color:#1A1A1A}
.game-task-progress{font-size:11px;color:#999;margin-top:2px}
.game-task-bar{height:4px;background:#E5E7EB;border-radius:2px;margin-top:4px;overflow:hidden}
.game-task-bar-fill{height:100%;background:#4C8BF5;border-radius:2px;transition:width .3s}
.game-task-xp{font-size:12px;color:#FF6B35;font-weight:600}
.game-ach-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.game-ach-item{text-align:center;padding:8px 4px;border-radius:10px;background:#F9FAFB}
.game-ach-item.unlocked{background:linear-gradient(135deg,#FEF3C7,#FDE68A)}
.game-ach-item.locked{opacity:.4}
.game-ach-icon{font-size:22px}
.game-ach-name{font-size:9px;color:#666;margin-top:2px;line-height:1.2}
.game-coll-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:4px}
.game-coll-item{text-align:center;padding:4px;border-radius:6px;font-size:9px;line-height:1.2}
.game-coll-item.visited{background:#DBEAFE;color:#1E40AF}
.game-coll-item.not-visited{background:#F3F4F6;color:#999}
#game-xp-float{position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.75);color:#FFD700;padding:8px 20px;border-radius:20px;font-size:16px;font-weight:700;pointer-events:none;z-index:99999;animation:xpFloat 1.2s ease forwards}
@keyframes xpFloat{0%{opacity:1;transform:translate(-50%,-50%) scale(0.5)}30%{opacity:1;transform:translate(-50%,-50%) scale(1.2)}50%{transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-70%)}}
#game-levelup-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;animation:fadeIn .3s}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.game-levelup-box{background:#fff;border-radius:20px;padding:30px;text-align:center;animation:popIn .4s ease;max-width:280px}
@keyframes popIn{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
.game-levelup-icon{font-size:48px;margin-bottom:8px}
.game-levelup-title{font-size:20px;font-weight:700;color:#4C8BF5;margin-bottom:4px}
.game-levelup-name{font-size:14px;color:#666;margin-bottom:16px}
.game-levelup-btn{background:linear-gradient(135deg,#4C8BF5,#7C3AED);color:#fff;border:none;padding:10px 30px;border-radius:20px;font-size:14px;font-weight:600;cursor:pointer}
.game-ach-popup{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#FEF3C7,#FDE68A);padding:10px 20px;border-radius:12px;display:flex;align-items:center;gap:8px;z-index:99999;animation:slideDown .4s ease;box-shadow:0 4px 12px rgba(0,0,0,0.1)}
@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.game-ach-popup-icon{font-size:24px}
.game-ach-popup-text{font-size:12px;color:#92400E}
.game-ach-popup-name{font-weight:700;color:#78350F}
`;
    },
    
    togglePanel() {
      const panel = document.getElementById('game-panel');
      if (!panel) return;
      const isHidden = panel.style.display === 'none';
      panel.style.display = isHidden ? 'block' : 'none';
      if (isHidden) this.switchGameTab('checkin');
    },
    
    switchGameTab(tab) {
      document.querySelectorAll('.game-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.gtab === tab));
      const content = document.getElementById('game-tab-content');
      if (!content) return;
      
      switch(tab) {
        case 'checkin': this.renderCheckin(content); break;
        case 'tasks': this.renderTasks(content); break;
        case 'achievements': this.renderAchievements(content); break;
        case 'collection': this.renderCollection(content); break;
      }
    },
    
    renderCheckin(el) {
      const today = new Date().toDateString();
      const checked = this.state.lastCheckIn === today;
      const dayNames = ['日','一','二','三','四','五','六'];
      
      let streakHTML = '';
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i*86400000);
        const ds = d.toDateString();
        const isToday = i === 0;
        const isDone = this.state.lastCheckIn === ds || (i > 0 && this.state.streak > i);
        const cls = isDone ? 'done' : (isToday ? 'today' : '');
        streakHTML += `<div class="game-streak-day ${cls}">${isToday?'今':dayNames[d.getDay()]}</div>`;
      }
      
      el.innerHTML = `
        <div class="game-checkin-area">
          <div style="font-size:36px;margin-bottom:8px">${this.getPetInfo().icon}</div>
          <div style="font-size:12px;color:#999;margin-bottom:4px">我的备考伙伴</div>
          <div style="font-size:14px;font-weight:600;margin-bottom:12px">${this.getPetInfo().name} · 陪伴你${this.state.totalCheckIns}天</div>
          <button class="game-checkin-btn ${checked?'checked':''}" onclick="GameSystem.doCheckIn()" ${checked?'disabled':''}>
            ${checked ? '✅ 已签到' : '📅 签到打卡'}
          </button>
          <div style="margin-top:12px;font-size:12px;color:#666">
            🔥 连续签到 <strong style="color:#FF6B35">${this.state.streak}</strong> 天
            ${this.state.streak>=7?' · 奖励30XP/天':this.state.streak>=3?' · 奖励20XP/天':''}
          </div>
          <div class="game-streak">${streakHTML}</div>
          <div style="font-size:11px;color:#999;margin-top:8px">
            累计签到${this.state.totalCheckIns}天 · 答题${this.state.totalQuestions}道 · 读导游词${this.state.totalGuides}篇
          </div>
        </div>`;
    },
    
    renderTasks(el) {
      let html = '<div style="font-size:12px;color:#999;margin-bottom:8px">📋 今日任务</div>';
      for (const t of DAILY_TASKS) {
        const curr = this.state.dailyTasks[t.id] || 0;
        const done = curr >= t.target;
        const pct = Math.min(100, Math.floor((curr/t.target)*100));
        html += `
          <div class="game-task-item">
            <span class="game-task-icon">${t.icon}</span>
            <div class="game-task-info">
              <div class="game-task-name">${t.name} ${done?'✅':''}</div>
              <div class="game-task-progress">${curr}/${t.target}</div>
              <div class="game-task-bar"><div class="game-task-bar-fill" style="width:${pct}%"></div></div>
            </div>
            <span class="game-task-xp">+${t.xp}XP</span>
          </div>`;
      }
      html += '<div style="text-align:center;margin-top:12px;font-size:11px;color:#999">完成任务获得经验值升级 🎮</div>';
      el.innerHTML = html;
    },
    
    renderAchievements(el) {
      let html = `<div style="font-size:12px;color:#999;margin-bottom:8px">🏅 ${this.state.achievements.length}/${ACHIEVEMENTS.length} 已解锁</div><div class="game-ach-grid">`;
      for (const a of ACHIEVEMENTS) {
        const unlocked = this.state.achievements.includes(a.id);
        html += `
          <div class="game-ach-item ${unlocked?'unlocked':'locked'}" title="${a.desc}">
            <div class="game-ach-icon">${unlocked?a.icon:'🔒'}</div>
            <div class="game-ach-name">${unlocked?a.name:'???'}</div>
          </div>`;
      }
      html += '</div>';
      el.innerHTML = html;
    },
    
    renderCollection(el) {
      const ALL_PROVS = ['北京','天津','河北','山西','内蒙古','辽宁','吉林','黑龙江',
        '上海','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南',
        '广东','广西','海南','重庆','四川','贵州','云南','西藏','陕西','甘肃',
        '青海','宁夏','新疆','香港','澳门','台湾'];
      
      let html = `<div style="font-size:12px;color:#999;margin-bottom:8px">🗺️ ${this.state.provincesVisited.length}/34 省份已探索</div><div class="game-coll-grid">`;
      for (const p of ALL_PROVS) {
        const visited = this.state.provincesVisited.includes(p);
        html += `<div class="game-coll-item ${visited?'visited':'not-visited'}">${p.substring(0,2)}</div>`;
      }
      html += '</div>';
      
      // 宠物信息
      const pet = this.getPetInfo();
      html += `
        <div style="margin-top:16px;padding:12px;background:#F9FAFB;border-radius:10px;text-align:center">
          <div style="font-size:32px">${pet.icon}</div>
          <div style="font-size:13px;font-weight:600;margin-top:4px">${pet.name}</div>
          <div style="font-size:11px;color:#999">Lv.${this.state.level} · 随你等级进化</div>
        </div>`;
      el.innerHTML = html;
    },
    
    updateWidget() {
      const fill = document.getElementById('game-xp-fill');
      const fillMini = document.getElementById('game-xp-fill-mini');
      const text = document.getElementById('game-xp-text');
      const lvName = document.getElementById('game-lv-name');
      const lvNum = document.getElementById('game-lv-num');
      const lvIcon = document.getElementById('game-lv-icon');
      const lvBadge = document.getElementById('game-lv-badge');
      const petIcon = document.getElementById('game-pet-icon');
      
      const pct = getXPProgress(this.state.xp, this.state.level);
      const next = getNextLevel(this.state.level);
      const info = getLevelInfo(this.state.level);
      
      if (fill) fill.style.width = pct + '%';
      if (fillMini) fillMini.style.width = pct + '%';
      if (text) text.textContent = next ? `${this.state.xp}/${next.xpNeed} XP` : 'MAX';
      if (lvName) lvName.textContent = info.name;
      if (lvNum) lvNum.textContent = 'Lv.' + this.state.level;
      if (lvIcon) lvIcon.textContent = info.icon;
      if (lvBadge) lvBadge.textContent = 'Lv' + this.state.level;
      if (petIcon) petIcon.textContent = this.getPetInfo().icon;
    },
    
    doCheckIn() {
      if (this.checkIn()) {
        this.switchGameTab('checkin');
      }
    },
    
    showXPFloat(amount, source) {
      const el = document.createElement('div');
      el.id = 'game-xp-float';
      el.textContent = `+${amount}XP ${source||''}`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1300);
    },
    
    showLevelUp(levelInfo) {
      const overlay = document.createElement('div');
      overlay.id = 'game-levelup-overlay';
      overlay.innerHTML = `
        <div class="game-levelup-box">
          <div class="game-levelup-icon">${levelInfo.icon}</div>
          <div class="game-levelup-title">升级啦！</div>
          <div class="game-levelup-name">Lv.${levelInfo.lv} ${levelInfo.name}</div>
          <button class="game-levelup-btn" onclick="this.closest('#game-levelup-overlay').remove()">太棒了！</button>
        </div>`;
      document.body.appendChild(overlay);
    },
    
    showAchievementPopup(ach) {
      const el = document.createElement('div');
      el.className = 'game-ach-popup';
      el.innerHTML = `
        <span class="game-ach-popup-icon">${ach.icon}</span>
        <div class="game-ach-popup-text">
          成就解锁！<br>
          <span class="game-ach-popup-name">${ach.name}</span> - ${ach.desc}
        </div>`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  };
  
  // 自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GameSystem.init());
  } else {
    GameSystem.init();
  }
})();
