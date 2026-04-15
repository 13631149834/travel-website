/**
 * 游导旅游 - 新手任务系统
 * 完善资料任务、浏览任务、收藏任务、奖励积分
 */

(function() {
  'use strict';

  // 任务配置
  const TASKS = [
    {
      id: 'complete_profile',
      icon: '👤',
      title: '完善个人资料',
      description: '上传头像并填写昵称',
      points: 50,
      type: 'profile',
      action: 'complete_profile',
      target: '.profile-avatar, .user-avatar',
      threshold: 1
    },
    {
      id: 'bind_phone',
      icon: '📱',
      title: '绑定手机号',
      description: '绑定手机号以便接收订单通知',
      points: 30,
      type: 'profile',
      action: 'bind_phone',
      threshold: 1
    },
    {
      id: 'bind_email',
      icon: '✉️',
      title: '绑定邮箱',
      description: '绑定邮箱便于接收行程通知',
      points: 20,
      type: 'profile',
      action: 'bind_email',
      threshold: 1
    },
    {
      id: 'first_search',
      icon: '🔍',
      title: '首次搜索',
      description: '使用搜索功能查找导游或目的地',
      points: 10,
      type: 'browse',
      action: 'search',
      threshold: 1
    },
    {
      id: 'browse_guides',
      icon: '🧭',
      title: '浏览导游',
      description: '浏览至少3位导游的详情页',
      points: 20,
      type: 'browse',
      action: 'browse_guide',
      threshold: 3
    },
    {
      id: 'browse_routes',
      icon: '🗺️',
      title: '探索路线',
      description: '浏览至少5条旅行路线',
      points: 15,
      type: 'browse',
      action: 'browse_route',
      threshold: 5
    },
    {
      id: 'first_favorite',
      icon: '❤️',
      title: '首次收藏',
      description: '收藏一位心仪的导游或路线',
      points: 15,
      type: 'favorite',
      action: 'favorite',
      threshold: 1
    },
    {
      id: 'share_app',
      icon: '📤',
      title: '分享平台',
      description: '将平台分享给好友',
      points: 30,
      type: 'share',
      action: 'share',
      threshold: 1
    },
    {
      id: 'view_community',
      icon: '👥',
      title: '浏览社区',
      description: '查看社区动态和旅行分享',
      points: 10,
      type: 'browse',
      action: 'browse_community',
      threshold: 1
    },
    {
      id: 'first_review',
      icon: '⭐',
      title: '发表评价',
      description: '对已完成的订单发表评价',
      points: 25,
      type: 'review',
      action: 'review',
      threshold: 1
    }
  ];

  // 存储键名
  const STORAGE_KEYS = {
    USER_TASKS: 'travel_user_tasks',
    USER_POINTS: 'travel_user_points',
    TASK_PROGRESS: 'travel_task_progress'
  };

  class BeginnerTasks {
    constructor(options = {}) {
      this.container = options.container || document.body;
      this.onTaskComplete = options.onTaskComplete || null;
      this.onAllComplete = options.onAllComplete || null;
      
      this.tasks = this.loadTasks();
      this.points = this.loadPoints();
      this.init();
    }

    init() {
      this.render();
      this.bindGlobalEvents();
      this.showWelcome();
    }

    // 加载已完成任务
    loadTasks() {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_TASKS);
      return saved ? JSON.parse(saved) : {};
    }

    // 保存任务状态
    saveTasks() {
      localStorage.setItem(STORAGE_KEYS.USER_TASKS, JSON.stringify(this.tasks));
    }

    // 加载积分
    loadPoints() {
      return parseInt(localStorage.getItem(STORAGE_KEYS.USER_POINTS) || '0');
    }

    // 保存积分
    savePoints() {
      localStorage.setItem(STORAGE_KEYS.USER_POINTS, this.points.toString());
    }

    // 渲染任务面板
    render() {
      // 移除已存在的面板
      const existing = document.getElementById('beginnerTasksPanel');
      if (existing) existing.remove();

      const panel = document.createElement('div');
      panel.id = 'beginnerTasksPanel';
      panel.className = 'tasks-panel';
      panel.innerHTML = this.getPanelHTML();
      this.container.appendChild(panel);

      // 创建悬浮入口
      this.createFloatingButton();
      
      // 绑定事件
      this.bindEvents();
    }

    getPanelHTML() {
      const completedCount = Object.keys(this.tasks).filter(id => this.tasks[id]?.completed).length;
      const totalPoints = TASKS.reduce((sum, t) => sum + t.points, 0);
      const earnedPoints = TASKS.filter(t => this.tasks[t.id]?.completed).reduce((sum, t) => sum + t.points, 0);
      const progress = Math.round((completedCount / TASKS.length) * 100);

      return `
        <div class="tasks-panel-header">
          <div class="tasks-title">
            <span class="tasks-icon">🎯</span>
            <h3>新手任务</h3>
          </div>
          <button class="tasks-close" id="tasksCloseBtn" aria-label="关闭">×</button>
        </div>
        
        <div class="tasks-summary">
          <div class="tasks-progress-bar">
            <div class="tasks-progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="tasks-stats">
            <span class="tasks-completed">已完成 ${completedCount}/${TASKS.length}</span>
            <span class="tasks-points">
              <span class="points-icon">⭐</span>
              ${earnedPoints}/${totalPoints} 积分
            </span>
          </div>
        </div>

        <div class="tasks-list">
          ${TASKS.map(task => this.getTaskItemHTML(task)).join('')}
        </div>

        <div class="tasks-rewards">
          <div class="rewards-badge">
            <span class="badge-icon">🏆</span>
            <span class="badge-text">全部完成额外奖励 100 积分</span>
          </div>
        </div>
      `;
    }

    getTaskItemHTML(task) {
      const status = this.tasks[task.id] || { completed: false, progress: 0 };
      const isCompleted = status.completed;
      const progress = status.progress || 0;
      const canClaim = !isCompleted && progress >= task.threshold;

      let statusClass = '';
      if (isCompleted) statusClass = 'completed';
      else if (canClaim) statusClass = 'claimable';

      return `
        <div class="task-item ${statusClass}" data-task-id="${task.id}">
          <div class="task-icon">${task.icon}</div>
          <div class="task-info">
            <h4 class="task-title">${task.title}</h4>
            <p class="task-desc">${task.description}</p>
            ${!isCompleted && task.threshold > 1 ? `
              <div class="task-progress">
                <div class="task-progress-bar">
                  <div class="task-progress-fill" style="width: ${Math.min(100, (progress / task.threshold) * 100)}%"></div>
                </div>
                <span class="task-progress-text">${progress}/${task.threshold}</span>
              </div>
            ` : ''}
          </div>
          <div class="task-action">
            ${isCompleted ? `
              <span class="task-check">✓</span>
            ` : canClaim ? `
              <button class="task-claim-btn" data-action="${task.action}">领取</button>
            ` : `
              <span class="task-points">+${task.points}</span>
            `}
          </div>
        </div>
      `;
    }

    // 创建悬浮按钮
    createFloatingButton() {
      const existing = document.getElementById('tasksFloatBtn');
      if (existing) existing.remove();

      const btn = document.createElement('button');
      btn.id = 'tasksFloatBtn';
      btn.className = 'tasks-float-btn';
      
      const completedCount = Object.keys(this.tasks).filter(id => this.tasks[id]?.completed).length;
      const hasUnclaimed = TASKS.some(t => {
        const status = this.tasks[t.id];
        return !status?.completed && (status?.progress || 0) >= t.threshold;
      });
      
      btn.innerHTML = `
        <span class="float-icon">🎯</span>
        ${hasUnclaimed ? '<span class="float-badge">!</span>' : ''}
      `;
      btn.title = '新手任务';
      
      this.container.appendChild(btn);
    }

    // 绑定面板内事件
    bindEvents() {
      const closeBtn = document.getElementById('tasksCloseBtn');
      const floatBtn = document.getElementById('tasksFloatBtn');
      const panel = document.getElementById('beginnerTasksPanel');
      const claimBtns = document.querySelectorAll('.task-claim-btn');

      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hidePanel());
      }

      if (floatBtn) {
        floatBtn.addEventListener('click', () => this.togglePanel());
      }

      claimBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const taskId = e.target.closest('.task-item').dataset.taskId;
          this.claimTask(taskId);
        });
      });
    }

    // 绑定全局事件用于自动追踪进度
    bindGlobalEvents() {
      // 搜索事件
      document.addEventListener('submit', (e) => {
        if (e.target.matches('.search-form, #searchForm')) {
          this.trackAction('search');
        }
      });

      // 收藏事件
      document.addEventListener('click', (e) => {
        if (e.target.matches('.favorite-btn, .btn-favorite, [data-action="favorite"]')) {
          this.trackAction('favorite');
        }
        if (e.target.matches('.share-btn, .btn-share, [data-action="share"]')) {
          this.trackAction('share');
        }
      });

      // 页面浏览追踪
      this.trackPageViews();
    }

    // 追踪页面浏览
    trackPageViews() {
      const path = window.location.pathname;
      
      if (path.includes('guide') || path.includes('guide-detail')) {
        this.trackAction('browse_guide');
      } else if (path.includes('route')) {
        this.trackAction('browse_route');
      } else if (path.includes('community')) {
        this.trackAction('browse_community');
      }
    }

    // 追踪用户动作
    trackAction(action) {
      const task = TASKS.find(t => t.action === action);
      if (!task) return;

      const taskId = task.id;
      if (!this.tasks[taskId]) {
        this.tasks[taskId] = { completed: false, progress: 0 };
      }

      // 增加进度
      this.tasks[taskId].progress++;
      
      // 检查是否完成
      if (this.tasks[taskId].progress >= task.threshold && !this.tasks[taskId].completed) {
        // 可以领取但不自
动领取动发放，需要用户点击
      }

      this.saveTasks();
      this.updateUI();

      // 触发回调
      if (this.onTaskComplete) {
        this.onTaskComplete(taskId, this.tasks[taskId]);
      }
    }

    // 领取任务奖励
    claimTask(taskId) {
      const task = TASKS.find(t => t.id === taskId);
      if (!task) return;

      const status = this.tasks[taskId];
      if (!status || status.completed || status.progress < task.threshold) return;

      // 标记完成
      status.completed = true;
      this.points += task.points;
      
      this.saveTasks();
      this.savePoints();
      this.updateUI();

      // 显示奖励动画
      this.showRewardAnimation(task.points);

      // 检查是否全部完成
      const allCompleted = TASKS.every(t => this.tasks[t.id]?.completed);
      if (allCompleted) {
        // 发放额外奖励
        this.points += 100;
        this.savePoints();
        
        setTimeout(() => {
          this.showCompletionAnimation();
          if (this.onAllComplete) {
            this.onAllComplete();
          }
        }, 1000);
      }
    }

    // 手动完成任务（如从其他模块触发）
    completeTask(taskId) {
      const task = TASKS.find(t => t.id === taskId);
      if (!task) return;

      if (!this.tasks[taskId]) {
        this.tasks[taskId] = { completed: false, progress: 0 };
      }

      if (!this.tasks[taskId].completed) {
        this.tasks[taskId].progress = task.threshold;
        this.claimTask(taskId);
      }
    }

    // 更新UI
    updateUI() {
      const panel = document.getElementById('beginnerTasksPanel');
      if (panel) {
        panel.innerHTML = this.getPanelHTML();
        this.bindEvents();
      }
      
      this.createFloatingButton();
      
      // 更新页面上的积分显示
      const pointsDisplays = document.querySelectorAll('.user-points-display');
      pointsDisplays.forEach(el => {
        el.textContent = this.points;
      });
    }

    // 显示/隐藏面板
    togglePanel() {
      const panel = document.getElementById('beginnerTasksPanel');
      if (panel) {
        panel.classList.toggle('active');
      }
    }

    hidePanel() {
      const panel = document.getElementById('beginnerTasksPanel');
      if (panel) {
        panel.classList.remove('active');
      }
    }

    showPanel() {
      const panel = document.getElementById('beginnerTasksPanel');
      if (panel) {
        panel.classList.add('active');
      }
    }

    // 首次欢迎提示
    showWelcome() {
      const hasSeenWelcome = localStorage.getItem('travel_tasks_welcomed');
      if (hasSeenWelcome) return;

      const overlay = document.createElement('div');
      overlay.className = 'tasks-welcome-overlay';
      overlay.innerHTML = `
        <div class="tasks-welcome">
          <div class="welcome-icon">🎁</div>
          <h3>欢迎来到游导旅游！</h3>
          <p>完成新手任务，领取丰厚积分奖励</p>
          <div class="welcome-rewards">
            <span class="reward-item">👤 完善资料 +50积分</span>
            <span class="reward-item">❤️ 收藏导游 +15积分</span>
            <span class="reward-item">📤 分享平台 +30积分</span>
          </div>
          <button class="welcome-btn" id="welcomeStartBtn">立即领取</button>
        </div>
      `;
      document.body.appendChild(overlay);

      document.getElementById('welcomeStartBtn').addEventListener('click', () => {
        overlay.remove();
        localStorage.setItem('travel_tasks_welcomed', 'true');
        this.showPanel();
      });

      // 3秒后自动消失（点击其他地方也可关闭）
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.remove();
          localStorage.setItem('travel_tasks_welcomed', 'true');
        }
      }, 8000);
    }

    // 奖励动画
    showRewardAnimation(points) {
      const anim = document.createElement('div');
      anim.className = 'reward-animation';
      anim.innerHTML = `
        <div class="reward-popup">
          <span class="reward-icon">⭐</span>
          <span class="reward-text">+${points}积分</span>
        </div>
      `;
      document.body.appendChild(anim);
      
      setTimeout(() => anim.remove(), 1500);
    }

    // 全部完成动画
    showCompletionAnimation() {
      const overlay = document.createElement('div');
      overlay.className = 'tasks-completion-overlay';
      overlay.innerHTML = `
        <div class="tasks-completion">
          <div class="completion-confetti">🎉</div>
          <h3>恭喜全部完成！</h3>
          <p>您已获得全部任务积分 + 额外奖励100积分</p>
          <div class="completion-total">
            <span class="total-icon">⭐</span>
            <span class="total-points">${this.points}</span>
          </div>
          <button class="completion-btn" id="completionCloseBtn">太棒了！</button>
        </div>
      `;
      document.body.appendChild(overlay);

      document.getElementById('completionCloseBtn').addEventListener('click', () => {
        overlay.remove();
      });
    }

    // 获取当前状态
    getStatus() {
      return {
        tasks: this.tasks,
        points: this.points,
        completedCount: Object.keys(this.tasks).filter(id => this.tasks[id]?.completed).length,
        totalCount: TASKS.length
      };
    }

    // 重置任务进度
    reset() {
      this.tasks = {};
      this.points = 0;
      this.saveTasks();
      this.savePoints();
      localStorage.removeItem('travel_tasks_welcomed');
      this.updateUI();
    }
  }

  // 导出到全局
  window.BeginnerTasks = BeginnerTasks;

  // 自动初始化（页面加载完成后）
  document.addEventListener('DOMContentLoaded', function() {
    // 检查是否为新用户
    const isNewUser = !localStorage.getItem('travel_onboarded');
    
    if (isNewUser) {
      // 引导完成后延迟显示任务系统
      setTimeout(() => {
        window.beginnerTasks = new BeginnerTasks({
          onAllComplete: function() {
            console.log('所有新手任务已完成');
          }
        });
      }, 3000);
    } else {
      // 老用户也可以查看任务面板
      window.beginnerTasks = new BeginnerTasks();
    }
  });

})();
