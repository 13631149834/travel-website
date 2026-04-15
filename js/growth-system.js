/**
 * 游导旅游 - 用户成长体系 JavaScript
 */

// 用户成长数据管理
const GrowthSystem = {
  // 用户数据
  userData: {
    userId: 'user_12345',
    nickname: '旅行者_12345',
    avatar: '👤',
    email: 'user@example.com',
    currentLevel: 2,
    currentPoints: 2850,
    totalPoints: 3850,
    expPoints: 750,
    joinDate: '2024-06-15',
    badges: [],
    achievements: [],
    tasks: {}
  },

  // 等级配置
  levels: [
    {
      id: 1,
      name: '注册用户',
      icon: '👶',
      minPoints: 0,
      maxPoints: 500,
      color: '#9CA3AF',
      privileges: ['基础功能', '新手引导']
    },
    {
      id: 2,
      name: '铜牌会员',
      icon: '🥉',
      minPoints: 500,
      maxPoints: 2000,
      color: '#CD7F32',
      privileges: ['优先客服', '积分加成5%', '专属活动']
    },
    {
      id: 3,
      name: '银牌会员',
      icon: '🥈',
      minPoints: 2000,
      maxPoints: 5000,
      color: '#C0C0C0',
      privileges: ['专属顾问', '积分加成10%', '生日礼包', '优先预约']
    },
    {
      id: 4,
      name: '金牌会员',
      icon: '🥇',
      minPoints: 5000,
      maxPoints: 15000,
      color: '#FFD700',
      privileges: ['VIP客服', '积分加成15%', '免费升舱', '专属导游']
    },
    {
      id: 5,
      name: '钻石会员',
      icon: '💎',
      minPoints: 15000,
      maxPoints: Infinity,
      color: '#818CF8',
      privileges: ['24小时专属管家', '积分加成20%', '免费定制行程', '全球机场贵宾厅']
    }
  ],

  // 任务配置
  tasks: {
    daily: [
      { id: 'd1', name: '每日签到', desc: '连续签到可获得额外奖励', icon: '📅', points: 10, completed: false, claimed: false },
      { id: 'd2', name: '浏览目的地', desc: '浏览3个目的地详情', icon: '🔍', points: 15, completed: true, claimed: false },
      { id: 'd3', name: '分享旅行攻略', desc: '分享任意攻略到社交平台', icon: '📤', points: 20, completed: true, claimed: true }
    ],
    weekly: [
      { id: 'w1', name: '完成首次预订', desc: '本周完成一次导游预约', icon: '🎫', points: 100, completed: false, locked: false },
      { id: 'w2', name: '发布旅行笔记', desc: '本周发布1篇旅行笔记', icon: '✍️', points: 80, completed: false, locked: false },
      { id: 'w3', name: '评价导游服务', desc: '本周完成3次服务评价', icon: '⭐', points: 60, completed: false, locked: true }
    ],
    special: [
      { id: 's1', name: '邀请好友注册', desc: '成功邀请1位新用户', icon: '👥', points: 200, completed: false },
      { id: 's2', name: '国庆特别任务', desc: '国庆期间完成3次旅行', icon: '🎉', points: 500, completed: false, endDate: '2024-10-07' }
    ]
  },

  // 成就配置
  achievements: [
    { id: 'a1', name: '初次探索', icon: '🗺️', desc: '完成第一次旅行', progress: 100, target: 1, reward: 100, unlocked: true, unlockedDate: '2024-07-20' },
    { id: 'a2', name: '旅行达人', icon: '🏃', desc: '累计完成10次旅行', progress: 6, target: 10, reward: 500, unlocked: false },
    { id: 'a3', name: '点评专家', icon: '📝', desc: '发表30条有效评价', progress: 12, target: 30, reward: 300, unlocked: false },
    { id: 'a4', name: '收藏家', icon: '❤️', desc: '收藏50个目的地', progress: 28, target: 50, reward: 200, unlocked: false },
    { id: 'a5', name: '社交达人', icon: '🤝', desc: '成功邀请10位好友', progress: 3, target: 10, reward: 800, unlocked: false },
    { id: 'a6', name: '积分达人', icon: '💰', desc: '累计获得10000积分', progress: 3850, target: 10000, reward: 1000, unlocked: false },
    { id: 'a7', name: '金牌会员', icon: '🥇', desc: '达到金牌会员等级', progress: 2850, target: 5000, reward: 2000, unlocked: false },
    { id: 'a8', name: '忠实用户', icon: '🌟', desc: '连续登录365天', progress: 127, target: 365, reward: 3000, unlocked: false }
  ],

  // 勋章配置
  badges: [
    { id: 'b1', name: '初次旅行', icon: '✈️', earned: true, earnedDate: '2024-07-20' },
    { id: 'b2', name: '出境达人', icon: '🌍', earned: true, earnedDate: '2024-08-15' },
    { id: 'b3', name: '美食家', icon: '🍜', earned: true, earnedDate: '2024-09-01' },
    { id: 'b4', name: '摄影达人', icon: '📸', earned: false },
    { id: 'b5', name: '文化探索者', icon: '🏛️', earned: false },
    { id: 'b6', name: '户外冒险家', icon: '🏔️', earned: false },
    { id: 'b7', name: '海岛爱好者', icon: '🏝️', earned: false },
    { id: 'b8', name: '历史爱好者', icon: '📜', earned: false },
    { id: 'b9', name: '自然探索', icon: '🌲', earned: false },
    { id: 'b10', name: '城市漫步', icon: '🏙️', earned: false },
    { id: 'b11', name: '家庭旅行', icon: '👨‍👩‍👧', earned: true, earnedDate: '2024-10-01' },
    { id: 'b12', name: '年度旅行者', icon: '🏆', earned: false }
  ],

  // 积分历史
  pointsHistory: [
    { id: 'p1', type: 'income', title: '完成旅行 - 丽江古城', points: 200, date: '2024-12-15', icon: '✈️' },
    { id: 'p2', type: 'income', title: '评价导游服务', points: 50, date: '2024-12-14', icon: '⭐' },
    { id: 'p3', type: 'expense', title: '兑换优惠券', points: -100, date: '2024-12-13', icon: '🎫' },
    { id: 'p4', type: 'income', title: '每日签到', points: 10, date: '2024-12-13', icon: '📅' },
    { id: 'p5', type: 'income', title: '邀请好友奖励', points: 150, date: '2024-12-12', icon: '👥' },
    { id: 'p6', type: 'expense', title: '积分商城兑换', points: -500, date: '2024-12-10', icon: '🎁' },
    { id: 'p7', type: 'income', title: '完成旅行 - 三亚海滩', points: 300, date: '2024-12-08', icon: '✈️' },
    { id: 'p8', type: 'income', title: '分享旅行攻略', points: 30, date: '2024-12-06', icon: '📤' }
  ],

  // 成长时间线
  growthTimeline: [
    { date: '2024-06-15', type: 'milestone', title: '注册游导旅游', desc: '成为游导旅游大家庭的一员', icon: '🎉' },
    { date: '2024-07-20', type: 'achievement', title: '解锁成就：初次探索', desc: '完成第一次旅行，开启精彩旅程', icon: '🏅' },
    { date: '2024-08-01', type: 'level-up', title: '升级到铜牌会员', desc: '累计获得500积分，解锁更多权益', icon: '🥉' },
    { date: '2024-09-15', type: 'achievement', title: '解锁勋章：出境达人', desc: '完成第一次出境旅行', icon: '🌍' },
    { date: '2024-10-01', type: 'achievement', title: '解锁勋章：美食家', desc: '探索了10个城市的特色美食', icon: '🍜' },
    { date: '2024-11-20', type: 'level-up', title: '升级到银牌会员', desc: '累计获得2000积分，享受更多特权', icon: '🥈' },
    { date: '2024-12-10', type: 'milestone', title: '年度旅行达人', desc: '本年度已完成6次旅行，继续探索世界！', icon: '🏃' }
  ],

  // 初始化
  init() {
    this.loadUserData();
    this.render();
    this.bindEvents();
  },

  // 加载用户数据
  loadUserData() {
    // 模拟从后端加载数据
    const savedData = localStorage.getItem('growthUserData');
    if (savedData) {
      this.userData = { ...this.userData, ...JSON.parse(savedData) };
    }
  },

  // 保存用户数据
  saveUserData() {
    localStorage.setItem('growthUserData', JSON.stringify(this.userData));
  },

  // 获取当前等级
  getCurrentLevel() {
    return this.levels[this.userData.currentLevel - 1] || this.levels[0];
  },

  // 获取下一等级
  getNextLevel() {
    return this.levels[this.userData.currentLevel] || null;
  },

  // 计算等级进度
  getLevelProgress() {
    const current = this.getCurrentLevel();
    const next = this.getNextLevel();
    
    if (!next) return 100;
    
    const progress = ((this.userData.totalPoints - current.minPoints) / (next.minPoints - current.minPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  },

  // 获取距离下一等级所需积分
  getPointsToNextLevel() {
    const next = this.getNextLevel();
    if (!next) return 0;
    return next.minPoints - this.userData.totalPoints;
  },

  // 渲染页面
  render() {
    this.renderLevelOverview();
    this.renderStatsGrid();
    this.renderTabs();
    this.renderLevelCards();
    this.renderTasks();
    this.renderAchievements();
    this.renderBadges();
    this.renderPointsHistory();
    this.renderGrowthReport();
  },

  // 渲染等级概览
  renderLevelOverview() {
    const level = this.getCurrentLevel();
    const progress = this.getLevelProgress();
    const nextLevel = this.getNextLevel();
    
    const container = document.getElementById('level-overview');
    if (!container) return;

    container.innerHTML = `
      <div class="user-level-overview">
        <div class="level-overview-content">
          <div class="level-badge-container">
            <div class="level-badge">${level.icon}</div>
            <div class="level-info">
              <h2>
                ${level.name}
                <span class="level-title">Lv.${level.id}</span>
              </h2>
              <p>欢迎回来，继续你的旅行探索之旅</p>
              <div class="level-privileges">
                ${level.privileges.slice(0, 3).map(p => `<span>${p}</span>`).join('')}
              </div>
            </div>
          </div>
          <div class="user-points-overview">
            <div class="points-value">${this.userData.currentPoints.toLocaleString()}</div>
            <div class="points-label">可用积分</div>
            <div class="points-trend">
              <span>📈</span> 本月 +385
            </div>
          </div>
        </div>
        ${nextLevel ? `
        <div class="level-progress-section">
          <div class="progress-header">
            <h3>
              <span>⚡</span>
              距离 ${nextLevel.icon} ${nextLevel.name} 还差
            </h3>
            <span>${this.getPointsToNextLevel().toLocaleString()} 积分</span>
          </div>
          <div class="progress-steps">
            ${this.levels.slice(0, 5).map((l, i) => `
              <div class="progress-step ${i < this.userData.currentLevel - 1 ? 'completed' : ''} ${i === this.userData.currentLevel - 1 ? 'current' : ''}">
                <div class="step-icon">${l.icon}</div>
                <span class="step-label">${l.name}</span>
              </div>
            `).join('')}
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${progress}%"></div>
          </div>
          <div class="progress-info">
            <span>${this.userData.totalPoints.toLocaleString()} 积分</span>
            <span>${nextLevel.minPoints.toLocaleString()} 积分</span>
          </div>
        </div>
        ` : `
        <div class="level-progress-section">
          <div class="progress-header">
            <h3><span>🎊</span> 已达到最高等级！</h3>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: 100%"></div>
          </div>
        </div>
        `}
      </div>
    `;
  },

  // 渲染统计卡片
  renderStatsGrid() {
    const container = document.getElementById('stats-grid');
    if (!container) return;

    container.innerHTML = `
      <div class="stat-card animate-in stagger-1">
        <div class="stat-card-icon">✈️</div>
        <div class="stat-card-value">6</div>
        <div class="stat-card-label">已完成旅行</div>
        <div class="stat-card-trend up">📈 +2 本月</div>
      </div>
      <div class="stat-card animate-in stagger-2">
        <div class="stat-card-icon">⭐</div>
        <div class="stat-card-value">12</div>
        <div class="stat-card-label">发表评价</div>
        <div class="stat-card-trend up">📈 +3 本月</div>
      </div>
      <div class="stat-card animate-in stagger-3">
        <div class="stat-card-icon">❤️</div>
        <div class="stat-card-value">28</div>
        <div class="stat-card-label">收藏目的地</div>
        <div class="stat-card-trend up">📈 +5 本月</div>
      </div>
      <div class="stat-card animate-in stagger-4">
        <div class="stat-card-icon">🏆</div>
        <div class="stat-card-value">3</div>
        <div class="stat-card-label">获得勋章</div>
        <div class="stat-card-trend down">📉 0 本月</div>
      </div>
    `;
  },

  // 渲染标签页
  renderTabs() {
    const container = document.getElementById('growth-tabs');
    if (!container) return;

    const incompleteTasks = this.tasks.daily.filter(t => t.completed && !t.claimed).length;
    const lockedAchievements = this.achievements.filter(a => !a.unlocked).length;

    container.innerHTML = `
      <button class="growth-tab active" data-tab="overview">
        <span>📊</span> 成长概览
      </button>
      <button class="growth-tab" data-tab="levels">
        <span>🏅</span> 等级权益
      </button>
      <button class="growth-tab" data-tab="tasks">
        <span>📝</span> 任务中心
        ${incompleteTasks > 0 ? `<span class="tab-badge">${incompleteTasks}</span>` : ''}
      </button>
      <button class="growth-tab" data-tab="achievements">
        <span>🏆</span> 成就
        ${lockedAchievements > 0 ? `<span class="tab-badge">${lockedAchievements}</span>` : ''}
      </button>
      <button class="growth-tab" data-tab="badges">
        <span>🎖️</span> 勋章墙
      </button>
      <button class="growth-tab" data-tab="points">
        <span>💰</span> 积分明细
      </button>
      <button class="growth-tab" data-tab="report">
        <span>📈</span> 成长报告
      </button>
    `;
  },

  // 渲染等级卡片
  renderLevelCards() {
    const container = document.getElementById('level-cards');
    if (!container) return;

    container.innerHTML = this.levels.map(level => `
      <div class="level-card ${level.id === this.userData.currentLevel ? 'current' : ''} ${level.id === 1 ? 'registered' : level.id === 2 ? 'bronze' : level.id === 3 ? 'silver' : level.id === 4 ? 'gold' : 'diamond'}">
        <div class="level-card-icon">${level.icon}</div>
        <div class="level-card-name">${level.name}</div>
        <div class="level-card-points">${level.minPoints.toLocaleString()}+ 积分</div>
        <ul class="level-card-privileges">
          ${level.privileges.map(p => `<li><span class="check">✓</span> ${p}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  },

  // 渲染任务
  renderTasks() {
    const container = document.getElementById('tasks-grid');
    if (!container) return;

    const allTasks = [
      ...this.tasks.daily.map(t => ({ ...t, category: 'daily' })),
      ...this.tasks.weekly.map(t => ({ ...t, category: 'weekly' }))
    ];

    container.innerHTML = allTasks.map(task => `
      <div class="task-card ${task.category} ${task.completed ? 'completed' : ''} ${task.locked ? 'locked' : ''}">
        <div class="task-icon">${task.icon}</div>
        <div class="task-info">
          <h3>${task.name}</h3>
          <p>${task.desc}</p>
        </div>
        <div class="task-reward">
          <span class="points">+${task.points}</span>
          ${task.completed && !task.claimed ? 
            `<button class="task-btn claim" onclick="GrowthSystem.claimTask('${task.id}')">领取</button>` :
            task.claimed ?
            `<button class="task-btn completed">已完成</button>` :
            !task.locked ?
            `<button class="task-btn go" onclick="GrowthSystem.doTask('${task.id}')">去完成</button>` :
            `<button class="task-btn completed" disabled>未解锁</button>`
          }
        </div>
      </div>
    `).join('');
  },

  // 渲染成就
  renderAchievements() {
    const container = document.getElementById('achievements-grid');
    if (!container) return;

    container.innerHTML = this.achievements.map(a => `
      <div class="achievement-card ${a.unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-name">${a.name}</div>
        <div class="achievement-desc">${a.desc}</div>
        ${!a.unlocked ? `
          <div class="achievement-progress">
            <div class="achievement-progress-fill" style="width: ${(a.progress / a.target) * 100}%"></div>
          </div>
          <div class="achievement-progress-text">${a.progress} / ${a.target}</div>
        ` : ''}
        <div class="achievement-reward">+${a.reward} 积分</div>
      </div>
    `).join('');
  },

  // 渲染勋章
  renderBadges() {
    const container = document.getElementById('badges-grid');
    if (!container) return;

    container.innerHTML = this.badges.map(badge => `
      <div class="badge-item ${badge.earned ? 'earned' : 'locked'}" ${badge.earned ? `title="获得时间：${badge.earnedDate}"` : 'title="未解锁"'}>
        <div class="badge-circle">${badge.icon}</div>
        <div class="badge-name">${badge.name}</div>
      </div>
    `).join('');
  },

  // 渲染积分明细
  renderPointsHistory(filter = 'all') {
    const container = document.getElementById('points-history-list');
    if (!container) return;

    let filteredHistory = this.pointsHistory;
    if (filter === 'income') {
      filteredHistory = this.pointsHistory.filter(p => p.type === 'income');
    } else if (filter === 'expense') {
      filteredHistory = this.pointsHistory.filter(p => p.type === 'expense');
    }

    if (filteredHistory.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <h3>暂无记录</h3>
          <p>完成更多任务获取积分吧</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredHistory.map(item => `
      <div class="points-history-item ${item.type}">
        <div class="points-icon">${item.icon}</div>
        <div class="points-details">
          <h4>${item.title}</h4>
          <p>${item.date}</p>
        </div>
        <div class="points-amount">${item.type === 'income' ? '+' : ''}${item.points}</div>
      </div>
    `).join('');
  },

  // 渲染成长报告
  renderGrowthReport() {
    this.renderGrowthTimeline();
    this.renderGrowthComparison();
    this.renderGrowthSuggestions();
    this.renderGrowthMilestones();
  },

  // 渲染成长时间线
  renderGrowthTimeline() {
    const container = document.getElementById('growth-timeline');
    if (!container) return;

    container.innerHTML = this.growthTimeline.map(item => `
      <div class="timeline-item ${item.type}">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-date">${item.date}</div>
          <div class="timeline-title">${item.icon} ${item.title}</div>
          <div class="timeline-desc">${item.desc}</div>
        </div>
      </div>
    `).join('');
  },

  // 渲染成长对比
  renderGrowthComparison() {
    const container = document.getElementById('growth-comparison');
    if (!container) return;

    container.innerHTML = `
      <div class="comparison-card">
        <h4>旅行次数</h4>
        <div class="comparison-value">6</div>
        <div class="comparison-trend up">📈 +200%</div>
      </div>
      <div class="comparison-card">
        <h4>累计积分</h4>
        <div class="comparison-value">3,850</div>
        <div class="comparison-trend up">📈 +85%</div>
      </div>
      <div class="comparison-card">
        <h4>获得勋章</h4>
        <div class="comparison-value">3</div>
        <div class="comparison-trend up">📈 +50%</div>
      </div>
    `;
  },

  // 渲染成长建议
  renderGrowthSuggestions() {
    const container = document.getElementById('growth-suggestions');
    if (!container) return;

    container.innerHTML = `
      <div class="suggestion-item">
        <div class="suggestion-icon">📸</div>
        <div class="suggestion-content">
          <h4>解锁"摄影达人"勋章</h4>
          <p>再上传5张旅行照片即可获得</p>
        </div>
        <button class="suggestion-action" onclick="window.location.href='travel-circle.html'">去完成</button>
      </div>
      <div class="suggestion-item">
        <div class="suggestion-icon">⭐</div>
        <div class="suggestion-content">
          <h4>提升会员等级</h4>
          <p>再获取2,150积分即可升级到金牌会员</p>
        </div>
        <button class="suggestion-action" onclick="GrowthSystem.switchTab('tasks')">做任务</button>
      </div>
      <div class="suggestion-item">
        <div class="suggestion-icon">👥</div>
        <div class="suggestion-content">
          <h4>邀请好友赢积分</h4>
          <p>每邀请1位好友可获得200积分奖励</p>
        </div>
        <button class="suggestion-action" onclick="window.location.href='invite.html'">邀请</button>
      </div>
    `;
  },

  // 渲染成长里程碑
  renderGrowthMilestones() {
    const container = document.getElementById('growth-milestones');
    if (!container) return;

    container.innerHTML = `
      <div class="milestone-card">
        <div class="milestone-icon">🎊</div>
        <h4>首次旅行纪念</h4>
        <p>2024年7月20日，丽江古城</p>
        <div class="milestone-date">📅 127天前</div>
      </div>
      <div class="milestone-card">
        <div class="milestone-icon">🏅</div>
        <h4>银牌会员</h4>
        <p>2024年11月20日达成</p>
        <div class="milestone-date">📅 25天前</div>
      </div>
      <div class="milestone-card">
        <div class="milestone-icon">🎉</div>
        <h4>年度旅行者</h4>
        <p>2024年度完成6次旅行</p>
        <div class="milestone-date">📅 本年度</div>
      </div>
    `;
  },

  // 绑定事件
  bindEvents() {
    // 标签页切换
    document.querySelectorAll('.growth-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabId = e.currentTarget.dataset.tab;
        this.switchTab(tabId);
      });
    });

    // 积分筛选
    document.querySelectorAll('.points-filter button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.points-filter button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.renderPointsHistory(e.target.dataset.filter);
      });
    });

    // 周期选择
    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        // 切换报告周期
      });
    });
  },

  // 切换标签页
  switchTab(tabId) {
    // 更新标签状态
    document.querySelectorAll('.growth-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabId);
    });

    // 更新内容显示
    document.querySelectorAll('.growth-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tabId}`);
    });

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // 完成任务
  doTask(taskId) {
    // 模拟任务完成
    const task = this.tasks.daily.find(t => t.id === taskId) || 
                 this.tasks.weekly.find(t => t.id === taskId);
    if (task) {
      task.completed = true;
      this.renderTasks();
      this.showToast('任务完成！快去领取奖励吧~');
    }
  },

  // 领取任务奖励
  claimTask(taskId) {
    const task = this.tasks.daily.find(t => t.id === taskId) || 
                 this.tasks.weekly.find(t => t.id === taskId);
    if (task && task.completed) {
      task.claimed = true;
      this.userData.currentPoints += task.points;
      this.userData.totalPoints += task.points;
      this.saveUserData();
      this.render();
      this.showRewardModal(task);
    }
  },

  // 显示奖励弹窗
  showRewardModal(task) {
    const modal = document.getElementById('reward-modal');
    if (modal) {
      document.getElementById('modal-icon').textContent = '🎉';
      document.getElementById('modal-title').textContent = '恭喜获得！';
      document.getElementById('modal-points').textContent = `+${task.points} 积分`;
      modal.classList.add('active');
    }
  },

  // 关闭弹窗
  closeModal() {
    const modal = document.getElementById('reward-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  },

  // 显示提示
  showToast(message) {
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--brand-gray-900);
      color: #fff;
      padding: 12px 24px;
      border-radius: 24px;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
};

// 添加淡出动画
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; transform: translateX(-50%); }
    to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
  }
`;
document.head.appendChild(style);

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  GrowthSystem.init();
});

// 导出到全局
window.GrowthSystem = GrowthSystem;
