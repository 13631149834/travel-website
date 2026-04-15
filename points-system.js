/**
 * 游导旅游 - 积分与用户等级系统
 * 包含积分计算、等级判断、历史记录等功能
 */

const PointsSystem = (function() {
  'use strict';

  // ========== 等级配置 ==========
  const MEMBERSHIP_LEVELS = {
    normal: {
      id: 'normal',
      name: '普通会员',
      icon: '👤',
      color: '#9CA3AF',
      gradient: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
      minPoints: 0,
      maxPoints: 999,
      benefits: [
        '基础浏览功能',
        '收藏导游服务',
        '参与社区互动',
        '获取积分奖励'
      ]
    },
    silver: {
      id: 'silver',
      name: '银牌会员',
      icon: '🥈',
      color: '#94A3B8',
      gradient: 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)',
      minPoints: 1000,
      maxPoints: 4999,
      benefits: [
        '普通会员全部权益',
        '预订享受98折优惠',
        '专属客服优先响应',
        '生日当月双倍积分',
        '年度旅游攻略推送'
      ]
    },
    gold: {
      id: 'gold',
      name: '金牌会员',
      icon: '🥇',
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
      minPoints: 5000,
      maxPoints: 19999,
      benefits: [
        '银牌会员全部权益',
        '预订享受95折优惠',
        '免费升级VIP休息室',
        '专属导游优先匹配',
        '参与会员专属活动',
        '每月2张优惠券'
      ]
    },
    diamond: {
      id: 'diamond',
      name: '钻石会员',
      icon: '💎',
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
      minPoints: 20000,
      maxPoints: Infinity,
      benefits: [
        '金牌会员全部权益',
        '预订享受9折优惠',
        '24小时专属顾问',
        '免费接送机服务',
        '私人定制行程',
        '高端酒店VIP待遇',
        '无限次优惠券使用'
      ]
    }
  };

  // ========== 积分规则配置 ==========
  const POINTS_RULES = {
    // 行为类型：获取积分数
    actions: {
      register: { points: 100, description: '新用户注册' },
      login: { points: 5, description: '每日登录', dailyLimit: 1 },
      completeProfile: { points: 50, description: '完善个人资料' },
      verifyPhone: { points: 30, description: '手机号验证' },
      verifyEmail: { points: 20, description: '邮箱验证' },
      
      // 收藏
      favoriteGuide: { points: 10, description: '收藏导游' },
      favoriteRoute: { points: 5, description: '收藏路线' },
      
      // 评价
      writeReview: { points: 30, description: '撰写评价' },
      reviewWithPhoto: { points: 20, description: '图文评价奖励' },
      helpfulReview: { points: 10, description: '评价被点赞' },
      
      // 订单相关
      bookGuide: { points: 50, description: '预订导游服务', perAmount: 100 }, // 每消费100元
      completeTrip: { points: 100, description: '完成行程' },
      
      // 社交互动
      shareContent: { points: 15, description: '分享内容' },
      inviteFriend: { points: 200, description: '邀请好友注册' },
      friendFirstBook: { points: 100, description: '好友首次预订' },
      
      // 社区贡献
      postInForum: { points: 20, description: '发布帖子' },
      uploadPhoto: { points: 10, description: '上传旅行照片' },
      
      // 其他
      birthday: { points: 200, description: '生日积分' },
      anniversary: { points: 100, description: '周年纪念积分' }
    },
    
    // 积分扣除场景
    deductions: {
      cancelBooking: { points: -50, description: '取消预订' },
      refund: { points: -30, description: '退款处理' },
      lateCancellation: { points: -100, description: '迟到取消' },
      violation: { points: -200, description: '违规扣分' }
    },
    
    // 积分有效期（月）
    pointsValidity: 24,
    
    // 积分与人民币兑换比例
    exchangeRate: {
      pointsPerYuan: 1,  // 1元 = 1积分
      yuanPerPoints: 0.01  // 100积分 = 1元
    }
  };

  // ========== 本地存储键名 ==========
  const STORAGE_KEYS = {
    userPoints: 'yd_user_points',
    pointsHistory: 'yd_points_history',
    userLevel: 'yd_user_level',
    dailyLogin: 'yd_daily_login',
    lastLoginDate: 'yd_last_login_date'
  };

  // ========== 核心功能 ==========

  /**
   * 获取用户当前积分
   */
  function getUserPoints() {
    const points = localStorage.getItem(STORAGE_KEYS.userPoints);
    return points ? parseInt(points, 10) : 0;
  }

  /**
   * 设置用户积分
   */
  function setUserPoints(points) {
    localStorage.setItem(STORAGE_KEYS.userPoints, points.toString());
    updateUserLevel(points);
    return points;
  }

  /**
   * 根据积分获取等级信息
   */
  function getLevelByPoints(points) {
    if (points >= MEMBERSHIP_LEVELS.diamond.minPoints) return MEMBERSHIP_LEVELS.diamond;
    if (points >= MEMBERSHIP_LEVELS.gold.minPoints) return MEMBERSHIP_LEVELS.gold;
    if (points >= MEMBERSHIP_LEVELS.silver.minPoints) return MEMBERSHIP_LEVELS.silver;
    return MEMBERSHIP_LEVELS.normal;
  }

  /**
   * 获取用户当前等级
   */
  function getCurrentLevel() {
    const points = getUserPoints();
    return getLevelByPoints(points);
  }

  /**
   * 更新用户等级
   */
  function updateUserLevel(points) {
    const level = getLevelByPoints(points);
    localStorage.setItem(STORAGE_KEYS.userLevel, JSON.stringify(level));
    return level;
  }

  /**
   * 获取等级进度
   */
  function getLevelProgress() {
    const points = getUserPoints();
    const currentLevel = getLevelByPoints(points);
    
    // 计算下一等级
    let nextLevel = null;
    let pointsNeeded = 0;
    let progressPercent = 100;
    
    if (currentLevel.id === 'normal') {
      nextLevel = MEMBERSHIP_LEVELS.silver;
      pointsNeeded = MEMBERSHIP_LEVELS.silver.minPoints - points;
      progressPercent = (points / MEMBERSHIP_LEVELS.silver.minPoints) * 100;
    } else if (currentLevel.id === 'silver') {
      nextLevel = MEMBERSHIP_LEVELS.gold;
      pointsNeeded = MEMBERSHIP_LEVELS.gold.minPoints - points;
      progressPercent = ((points - MEMBERSHIP_LEVELS.silver.minPoints) / 
        (MEMBERSHIP_LEVELS.gold.minPoints - MEMBERSHIP_LEVELS.silver.minPoints)) * 100;
    } else if (currentLevel.id === 'gold') {
      nextLevel = MEMBERSHIP_LEVELS.diamond;
      pointsNeeded = MEMBERSHIP_LEVELS.diamond.minPoints - points;
      progressPercent = ((points - MEMBERSHIP_LEVELS.gold.minPoints) / 
        (MEMBERSHIP_LEVELS.diamond.minPoints - MEMBERSHIP_LEVELS.gold.minPoints)) * 100;
    } else {
      // 已是最高等级
      progressPercent = 100;
      pointsNeeded = 0;
    }
    
    return {
      currentLevel,
      nextLevel,
      currentPoints: points,
      pointsNeeded,
      progressPercent: Math.min(progressPercent, 100),
      isMaxLevel: currentLevel.id === 'diamond'
    };
  }

  /**
   * 添加积分
   */
  function addPoints(actionType, customPoints = null) {
    const rule = POINTS_RULES.actions[actionType];
    if (!rule) return { success: false, message: '未知的积分行为' };
    
    // 检查每日限制
    if (rule.dailyLimit) {
      const today = new Date().toDateString();
      const lastLogin = localStorage.getItem(STORAGE_KEYS.lastLoginDate);
      const dailyCount = parseInt(localStorage.getItem(STORAGE_KEYS.dailyLogin) || '0', 10);
      
      if (lastLogin === today && dailyCount >= rule.dailyLimit) {
        return { success: false, message: '今日已达上限' };
      }
    }
    
    // 计算积分数
    let points = customPoints !== null ? customPoints : rule.points;
    
    // 更新积分
    const currentPoints = getUserPoints();
    const newPoints = currentPoints + points;
    setUserPoints(newPoints);
    
    // 更新每日登录记录
    if (actionType === 'login') {
      const today = new Date().toDateString();
      const lastLogin = localStorage.getItem(STORAGE_KEYS.lastLoginDate);
      const dailyCount = parseInt(localStorage.getItem(STORAGE_KEYS.dailyLogin) || '0', 10);
      
      if (lastLogin === today) {
        localStorage.setItem(STORAGE_KEYS.dailyLogin, (dailyCount + 1).toString());
      } else {
        localStorage.setItem(STORAGE_KEYS.dailyLogin, '1');
        localStorage.setItem(STORAGE_KEYS.lastLoginDate, today);
      }
    }
    
    // 记录历史
    addPointsHistory({
      type: 'earn',
      action: actionType,
      points: points,
      description: rule.description,
      timestamp: Date.now()
    });
    
    return {
      success: true,
      points: points,
      totalPoints: newPoints,
      newLevel: getCurrentLevel()
    };
  }

  /**
   * 扣除积分
   */
  function deductPoints(actionType, customPoints = null) {
    const rule = POINTS_RULES.deductions[actionType];
    if (!rule) return { success: false, message: '未知的扣分行为' };
    
    let points = customPoints !== null ? customPoints : Math.abs(rule.points);
    
    const currentPoints = getUserPoints();
    if (currentPoints < points) {
      return { success: false, message: '积分不足' };
    }
    
    const newPoints = currentPoints - points;
    setUserPoints(newPoints);
    
    // 记录历史
    addPointsHistory({
      type: 'deduct',
      action: actionType,
      points: -points,
      description: rule.description,
      timestamp: Date.now()
    });
    
    return {
      success: true,
      points: -points,
      totalPoints: newPoints,
      newLevel: getCurrentLevel()
    };
  }

  /**
   * 添加积分历史记录
   */
  function addPointsHistory(record) {
    const history = getPointsHistory();
    history.unshift({
      ...record,
      id: Date.now()
    });
    
    // 只保留最近100条记录
    if (history.length > 100) {
      history.pop();
    }
    
    localStorage.setItem(STORAGE_KEYS.pointsHistory, JSON.stringify(history));
  }

  /**
   * 获取积分历史记录
   */
  function getPointsHistory(limit = 20) {
    const history = localStorage.getItem(STORAGE_KEYS.pointsHistory);
    if (!history) return [];
    
    try {
      const parsed = JSON.parse(history);
      return limit ? parsed.slice(0, limit) : parsed;
    } catch (e) {
      console.error('解析积分历史失败:', e);
      return [];
    }
  }

  /**
   * 消费积分（抵扣订单）
   */
  function spendPointsForOrder(orderAmount, pointsToSpend) {
    // 计算最大可抵扣金额
    const maxPoints = Math.floor(orderAmount / POINTS_RULES.exchangeRate.yuanPerPoints);
    const actualPoints = Math.min(pointsToSpend, maxPoints, getUserPoints());
    const discountAmount = actualPoints * POINTS_RULES.exchangeRate.yuanPerPoints;
    
    if (actualPoints > 0) {
      deductPoints('custom', actualPoints);
    }
    
    return {
      pointsSpent: actualPoints,
      discountAmount: discountAmount,
      finalAmount: orderAmount - discountAmount
    };
  }

  /**
   * 初始化用户数据
   */
  function initUserData(defaultPoints = 500) {
    if (!localStorage.getItem(STORAGE_KEYS.userPoints)) {
      setUserPoints(defaultPoints);
      addPointsHistory({
        type: 'earn',
        action: 'init',
        points: defaultPoints,
        description: '新用户初始积分',
        timestamp: Date.now()
      });
    }
  }

  /**
   * 计算订单可获得积分
   */
  function calculateOrderPoints(orderAmount) {
    const basePoints = Math.floor(orderAmount * POINTS_RULES.exchangeRate.pointsPerYuan);
    const currentLevel = getCurrentLevel();
    
    // 等级加成
    const multipliers = {
      normal: 1,
      silver: 1.2,
      gold: 1.5,
      diamond: 2
    };
    
    return Math.floor(basePoints * (multipliers[currentLevel.id] || 1));
  }

  // ========== UI 渲染 ==========

  /**
   * 渲染等级徽章
   */
  function renderBadge(level, size = 'medium') {
    const sizes = {
      small: { fontSize: '1rem', padding: '2px 8px' },
      medium: { fontSize: '0.85rem', padding: '4px 12px' },
      large: { fontSize: '1rem', padding: '6px 16px' }
    };
    
    const style = sizes[size] || sizes.medium;
    
    return `
      <span class="membership-badge" style="
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: ${level.gradient};
        color: ${level.id === 'silver' || level.id === 'normal' ? '#fff' : '#fff'};
        border-radius: 20px;
        font-size: ${style.fontSize};
        padding: ${style.padding};
        font-weight: 500;
        box-shadow: 0 2px 8px ${level.color}40;
      ">
        ${level.icon} ${level.name}
      </span>
    `;
  }

  /**
   * 渲染等级进度条
   */
  function renderProgressBar(progress, containerId = 'level-progress') {
    const progressData = progress || getLevelProgress();
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    container.innerHTML = `
      <div class="level-progress-container" style="
        background: #f3f4f6;
        border-radius: 10px;
        padding: 16px;
        margin-top: 12px;
      ">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="display: flex; align-items: center; gap: 6px;">
            <span>${progressData.currentLevel.icon}</span>
            <strong>${progressData.currentLevel.name}</strong>
          </span>
          <span style="color: #6b7280; font-size: 0.85rem;">
            ${progressData.currentPoints.toLocaleString()} 积分
          </span>
        </div>
        <div style="
          background: #e5e7eb;
          border-radius: 6px;
          height: 10px;
          overflow: hidden;
          position: relative;
        ">
          <div style="
            background: ${progressData.currentLevel.gradient};
            height: 100%;
            width: ${progressData.progressPercent}%;
            border-radius: 6px;
            transition: width 0.5s ease;
          "></div>
        </div>
        ${!progressData.isMaxLevel ? `
          <div style="
            display: flex;
            justify-content: space-between;
            margin-top: 8px;
            font-size: 0.8rem;
            color: #6b7280;
          ">
            <span>距离升级还需 ${progressData.pointsNeeded.toLocaleString()} 积分</span>
            <span>${Math.round(progressData.progressPercent)}%</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 8px;">
            <span style="font-size: 0.85rem;">下一级：</span>
            <span style="background: ${progressData.nextLevel.gradient}; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 0.8rem;">
              ${progressData.nextLevel.icon} ${progressData.nextLevel.name}
            </span>
          </div>
        ` : `
          <div style="
            text-align: center;
            margin-top: 8px;
            color: ${progressData.currentLevel.color};
            font-weight: 500;
          ">
            🌟 已是最高等级，尽享尊贵特权！
          </div>
        `}
      </div>
    `;
  }

  /**
   * 渲染积分历史列表
   */
  function renderHistoryList(history, containerId = 'points-history-list') {
    const container = document.getElementById(containerId);
    if (!container || !history.length) {
      if (container) container.innerHTML = '<div class="no-history">暂无积分记录</div>';
      return;
    }
    
    const html = history.map(item => {
      const date = new Date(item.timestamp);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
      const isPositive = item.points > 0;
      
      return `
        <div class="history-item" style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid #f3f4f6;
        ">
          <div>
            <div style="font-weight: 500; margin-bottom: 4px;">${item.description}</div>
            <div style="font-size: 0.8rem; color: #6b7280;">${dateStr}</div>
          </div>
          <div style="
            font-weight: 600;
            color: ${isPositive ? '#10B981' : '#EF4444'};
          ">
            ${isPositive ? '+' : ''}${item.points}
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = html;
  }

  /**
   * 渲染权益对比卡片
   */
  function renderMembershipComparison(containerId = 'membership-comparison') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const levels = [MEMBERSHIP_LEVELS.normal, MEMBERSHIP_LEVELS.silver, 
                    MEMBERSHIP_LEVELS.gold, MEMBERSHIP_LEVELS.diamond];
    
    const html = `
      <div class="membership-cards" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
        ${levels.map(level => `
          <div class="membership-card" style="
            background: ${level.gradient};
            border-radius: 16px;
            padding: 24px;
            color: #fff;
            text-align: center;
            position: relative;
            overflow: hidden;
          ">
            <div style="
              position: absolute;
              top: -20px;
              right: -20px;
              width: 80px;
              height: 80px;
              background: rgba(255,255,255,0.1);
              border-radius: 50%;
            "></div>
            <div style="font-size: 3rem; margin-bottom: 12px;">${level.icon}</div>
            <h3 style="font-size: 1.2rem; margin-bottom: 8px;">${level.name}</h3>
            <div style="
              background: rgba(255,255,255,0.2);
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 0.85rem;
              margin-bottom: 16px;
            ">
              ${level.minPoints.toLocaleString()}+ 积分
            </div>
            <ul style="
              list-style: none;
              padding: 0;
              margin: 0;
              text-align: left;
              font-size: 0.85rem;
              line-height: 1.8;
            ">
              ${level.benefits.map(benefit => `
                <li style="display: flex; align-items: center; gap: 6px;">
                  <span>✓</span> ${benefit}
                </li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    `;
    
    container.innerHTML = html;
  }

  // ========== 公开API ==========
  return {
    // 等级常量
    LEVELS: MEMBERSHIP_LEVELS,
    RULES: POINTS_RULES,
    
    // 数据操作
    getUserPoints,
    setUserPoints,
    getCurrentLevel,
    getLevelByPoints,
    getLevelProgress,
    addPoints,
    deductPoints,
    getPointsHistory,
    spendPointsForOrder,
    initUserData,
    calculateOrderPoints,
    
    // UI渲染
    renderBadge,
    renderProgressBar,
    renderHistoryList,
    renderMembershipComparison
  };
})();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 自动初始化用户积分数据（如果不存在）
  PointsSystem.initUserData(500);
  
  // 如果在用户中心页面，自动渲染等级信息
  if (document.getElementById('user-center-content')) {
    initUserCenterLevel();
  }
});

/**
 * 初始化用户中心等级显示
 */
function initUserCenterLevel() {
  const progress = PointsSystem.getLevelProgress();
  const currentLevel = progress.currentLevel;
  
  // 更新等级徽章
  const badgeElement = document.querySelector('.profile-badge');
  if (badgeElement) {
    badgeElement.outerHTML = PointsSystem.renderBadge(currentLevel, 'medium');
  }
  
  // 渲染进度条
  PointsSystem.renderProgressBar(progress);
  
  // 添加会员中心链接到侧边栏
  const sidebarMenu = document.querySelector('.sidebar-menu');
  if (sidebarMenu) {
    const membershipLink = document.createElement('a');
    membershipLink.href = 'membership.html';
    membershipLink.className = 'menu-item';
    membershipLink.innerHTML = '<span class="menu-icon">👑</span><span class="menu-text">会员中心</span>';
    
    // 插入到菜单分隔符之前
    const divider = sidebarMenu.querySelector('.menu-divider');
    if (divider) {
      sidebarMenu.insertBefore(membershipLink, divider);
    } else {
      sidebarMenu.appendChild(membershipLink);
    }
  }
}
