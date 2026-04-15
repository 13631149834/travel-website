// 积分系统核心模块
const PointsSystem = {
  STORAGE_KEY: 'youdao_points_data',

  // 初始化用户数据
  initUserData() {
    let data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      const defaultData = {
        points: 0,
        history: [],
        tasks: {
          daily: {
            signin: { lastTime: null, completed: false },
            browse: { count: 0, lastTime: null },
            search: { count: 0, lastTime: null },
            share: { count: 0, lastTime: null }
          },
          achievement: {}
        },
        exchangeHistory: [],
        profileComplete: false
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(data);
  },

  // 保存数据
  saveData(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },

  // 获取用户数据
  getUserData() {
    return this.initUserData();
  },

  // 获取积分余额
  getPoints() {
    const data = this.getUserData();
    return data.points;
  },

  // 添加积分
  addPoints(points, source, description) {
    const data = this.getUserData();
    data.points += points;
    data.history.unshift({
      id: Date.now(),
      type: 'income',
      points: points,
      source: source,
      description: description,
      time: new Date().toISOString()
    });
    this.saveData(data);
    this.showToast(`+${points}积分`, 'success');
    return data.points;
  },

  // 扣除积分
  deductPoints(points, reason) {
    const data = this.getUserData();
    if (data.points < points) {
      this.showToast('积分不足', 'error');
      return false;
    }
    data.points -= points;
    data.history.unshift({
      id: Date.now(),
      type: 'expense',
      points: points,
      source: 'exchange',
      description: reason,
      time: new Date().toISOString()
    });
    this.saveData(data);
    return true;
  },

  // 每日签到
  dailySignIn() {
    const data = this.getUserData();
    const today = new Date().toDateString();
    const lastSignIn = data.tasks.daily.signin.lastTime;

    if (lastSignIn === today) {
      this.showToast('今日已签到', 'info');
      return false;
    }

    data.tasks.daily.signin.lastTime = today;
    data.tasks.daily.signin.completed = true;
    this.addPoints(10, 'daily_signin', '每日签到');
    return true;
  },

  // 发布游记奖励
  publishTravelReward() {
    this.addPoints(50, 'publish_travel', '发布游记');
  },

  // 发表评论奖励
  postCommentReward() {
    this.addPoints(5, 'post_comment', '发表评论');
  },

  // 邀请好友奖励
  inviteFriendReward() {
    this.addPoints(100, 'invite_friend', '邀请好友注册');
  },

  // 完善资料奖励
  completeProfileReward() {
    const data = this.getUserData();
    if (!data.profileComplete) {
      data.profileComplete = true;
      this.addPoints(20, 'complete_profile', '完善个人资料');
    }
  },

  // 完成日常任务
  completeDailyTask(taskId) {
    const data = this.getUserData();
    const taskPoints = { browse: 5, search: 3, share: 8 };
    
    if (taskPoints[taskId]) {
      data.tasks.daily[taskId].count++;
      data.tasks.daily[taskId].lastTime = new Date().toISOString();
      this.addPoints(taskPoints[taskId], `daily_${taskId}`, `每日任务-${taskId}`);
      return true;
    }
    return false;
  },

  // 兑换商品
  exchangeProduct(product) {
    const data = this.getUserData();
    if (data.points < product.points) {
      this.showToast('积分不足，无法兑换', 'error');
      return false;
    }
    if (product.stock <= 0) {
      this.showToast('库存不足', 'error');
      return false;
    }

    const success = this.deductPoints(product.points, `兑换：${product.name}`);
    if (success) {
      const exchangeRecord = {
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        points: product.points,
        exchangeTime: new Date().toISOString(),
        status: 'pending',
        logistics: null
      };
      data.exchangeHistory.unshift(exchangeRecord);
      this.saveData(data);
      this.showToast('兑换成功！', 'success');
      return true;
    }
    return false;
  },

  // 获取兑换记录
  getExchangeHistory() {
    const data = this.getUserData();
    return data.exchangeHistory;
  },

  // 获取积分明细
  getPointsHistory() {
    const data = this.getUserData();
    return data.history;
  },

  // 取消兑换
  cancelExchange(exchangeId) {
    const data = this.getUserData();
    const index = data.exchangeHistory.findIndex(e => e.id === parseInt(exchangeId));
    if (index !== -1) {
      const exchange = data.exchangeHistory[index];
      if (exchange.status === 'pending') {
        // 退还积分
        data.points += exchange.points;
        // 标记为已取消
        exchange.status = 'cancelled';
        this.saveData(data);
        this.showToast('已取消兑换，积分已返还', 'success');
        return true;
      }
    }
    return false;
  },

  // 模拟物流更新
  updateLogistics(exchangeId, status, logisticsInfo) {
    const data = this.getUserData();
    const exchange = data.exchangeHistory.find(e => e.id === parseInt(exchangeId));
    if (exchange) {
      exchange.status = status;
      exchange.logistics = logisticsInfo;
      this.saveData(data);
      return true;
    }
    return false;
  },

  // 获取统计数据
  getStats() {
    const data = this.getUserData();
    const income = data.history.filter(h => h.type === 'income');
    const expense = data.history.filter(h => h.type === 'expense');
    
    const stats = {
      totalIncome: income.reduce((sum, h) => sum + h.points, 0),
      totalExpense: expense.reduce((sum, h) => sum + h.points, 0),
      exchangeCount: data.exchangeHistory.length,
      incomeBySource: {},
      validDays: new Set(income.filter(h => h.source === 'daily_signin').map(h => new Date(h.time).toDateString())).size
    };

    income.forEach(h => {
      stats.incomeBySource[h.source] = (stats.incomeBySource[h.source] || 0) + h.points;
    });

    return stats;
  },

  // 检查积分有效期（模拟）
  getPointsExpiry() {
    return {
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 365,
      note: '积分有效期为获得后1年，请及时使用'
    };
  },

  // Toast提示
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500'
    };
    toast.className = `fixed top-20 left-1/2 transform -translate-x-1/2 ${colors[type]} text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  },

  // 格式化时间
  formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    
    return date.toLocaleDateString('zh-CN');
  },

  // 格式化日期
  formatDate(isoString) {
    return new Date(isoString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  PointsSystem.initUserData();
});
