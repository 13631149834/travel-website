/**
 * 游导旅游 - 新用户引导系统集成指南
 * 
 * 本系统包含以下模块：
 * 1. guide-tour.js - 分步功能引导
 * 2. beginner-tasks.js - 新手任务系统
 * 3. feature-discovery.js - 功能发现与提示
 * 4. onboarding-master.js - 主入口（整合所有模块）
 */

/**
 * ============================================
 * 在页面中集成引导系统
 * ============================================
 */

// 方法一：使用主入口自动集成（推荐）
// 在页面底部添加以下脚本引用：
/*
<script src="js/onboarding/onboarding-master.js"></script>
*/

// 方法二：按需加载各个模块
/*
<script src="js/onboarding/guide-tour.js"></script>
<script src="js/onboarding/beginner-tasks.js"></script>
<script src="js/onboarding/feature-discovery.js"></script>
*/

/**
 * ============================================
 * 使用示例
 * ============================================
 */

// 1. 触发功能引导
// 在页面加载后调用
window.showOnboarding(); // 显示首页引导

// 或者指定引导类型
if (window.onboardingMaster) {
  window.onboardingMaster.showGuide('home');       // 首页引导
  window.onboardingMaster.showGuide('guideDetail'); // 导游详情页引导
  window.onboardingMaster.showGuide('booking');   // 预订流程引导
  window.onboardingMaster.showGuide('profile');    // 个人中心引导
}

// 2. 显示新手任务面板
window.showTasks();

// 3. 重置引导状态（用于测试）
window.resetOnboarding();

// 4. 手动创建特定类型的引导
const guide = new GuideTour({
  tourType: 'home',
  onComplete: function() {
    console.log('引导已完成');
  },
  onSkip: function(currentStep, totalSteps) {
    console.log(`引导跳过，当前步骤: ${currentStep + 1}/${totalSteps}`);
  }
});
guide.start();

// 5. 初始化新手任务系统
const tasks = new BeginnerTasks({
  onTaskComplete: function(taskId, status) {
    console.log(`任务完成: ${taskId}`, status);
  },
  onAllComplete: function() {
    console.log('所有新手任务已完成！');
  }
});

// 6. 显示功能发现提示
if (window.featureDiscovery) {
  window.featureDiscovery.show('new_search_filter', 'home');
  window.featureDiscovery.showTip('search-input');
}

// 7. 显示红点提示
if (window.featureDiscovery) {
  window.featureDiscovery.showRedDot('.new-feature-selector');
  window.featureDiscovery.showNewBadge('.vip-button', 'VIP');
}

// 8. 隐藏红点提示
if (window.featureDiscovery) {
  window.featureDiscovery.removeRedDot('.new-feature-selector');
  window.featureDiscovery.removeNewBadge('.vip-button');
}

/**
 * ============================================
 * URL 参数触发
 * ============================================
 */

// 在URL中添加参数可触发特定功能：
// ?guide=home      - 触发首页引导
// ?guide=booking   - 触发预订流程引导
// ?welcome=true    - 强制显示欢迎弹窗
// ?tasks=true      - 显示新手任务面板

/**
 * ============================================
 * 任务追踪
 * ============================================
 */

// 从其他模块触发任务完成
if (window.beginnerTasks) {
  window.beginnerTasks.completeTask('complete_profile');
  window.beginnerTasks.completeTask('bind_phone');
  window.beginnerTasks.completeTask('first_favorite');
}

// 获取任务状态
if (window.beginnerTasks) {
  const status = window.beginnerTasks.getStatus();
  console.log('已完成:', status.completedCount);
  console.log('总积分:', status.points);
}

/**
 * ============================================
 * CSS 类名参考
 * ============================================
 */

/* 引导相关 */
.guide-overlay       // 引导遮罩层
.guide-spotlight     // 高亮区域
.guide-card          // 引导卡片
.guide-arrow         // 引导箭头
.guide-skip-btn      // 跳过按钮
.guide-progress      // 进度指示器

/* 任务相关 */
.tasks-panel         // 任务面板
.tasks-float-btn     // 悬浮按钮
.tasks-welcome-overlay // 欢迎弹窗
.task-item           // 任务项
.task-claim-btn      // 领取按钮

/* 功能发现 */
.discovery-bubble    // 发现气泡
.helpful-tip         // 帮助提示
.feature-red-dot     // 红点提示
.new-feature-badge   // 新功能标记

/* 帮助入口 */
.help-entry-btn      // 帮助入口按钮
.help-menu           // 帮助菜单

/* 欢迎弹窗 */
.welcome-modal-overlay // 欢迎弹窗遮罩
.welcome-modal         // 欢迎弹窗内容

/**
 * ============================================
 * 数据存储键名
 * ============================================
 */

// localStorage 键名：
// travel_onboarded              - 引导完成标记
// travel_visited                - 首次访问标记
// travel_user_tasks             - 任务进度数据
// travel_user_points            - 用户积分
// guide_{type}_step             - 引导步骤进度
// guide_{type}_completed        - 引导完成标记
// guide_{type}_skipped          - 引导跳过标记
// discovery_dismissed_{id}      - 功能发现忽略标记
// tip_shown_{key}               - 提示已显示标记
// travel_tasks_welcomed          - 任务欢迎已显示

/**
 * ============================================
 * 推荐集成位置
 * ============================================
 */

// 在 index.html（首页）中：
// 1. 添加脚本引用（在 </body> 前）
// 2. 在页面加载完成后触发首页引导

// 在 guides.html（导游列表）中：
// 1. 添加脚本引用
// 2. 在页面加载完成后触发导游列表引导

// 在 guide-detail.html（导游详情）中：
// 1. 添加脚本引用
// 2. 在页面加载完成后触发详情页引导

// 在 profile.html（个人中心）中：
// 1. 添加脚本引用
// 2. 初始化新手任务系统
