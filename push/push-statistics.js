/**
 * 推送统计模块 - Push Statistics Module
 * 游导旅游平台
 * 功能：推送成功率、打开率、转化率、效果分析
 */

class PushStatistics {
  constructor() {
    this.storageKey = 'youdau_push_statistics';
    this.eventsKey = 'youdau_push_events';
    this.init();
  }

  // 初始化
  init() {
    // 加载事件数据
    this.events = this.loadEvents();
  }

  // ========== 事件记录 ==========

  // 记录发送事件
  recordSend(message) {
    const event = {
      id: message.id || this.generateId(),
      type: 'send',
      messageType: message.type,
      messageCategory: message.category,
      timestamp: Date.now(),
      success: true,
      metadata: {
        title: message.title,
        priority: message.priority
      }
    };

    this.addEvent(event);
    return event;
  }

  // 记录发送失败
  recordSendFailed(message, error) {
    const event = {
      id: message.id || this.generateId(),
      type: 'send_failed',
      messageType: message.type,
      timestamp: Date.now(),
      success: false,
      error: error
    };

    this.addEvent(event);
    return event;
  }

  // 记录展示事件
  recordImpression(messageId) {
    const event = {
      id: this.generateId(),
      type: 'impression',
      messageId,
      timestamp: Date.now()
    };

    this.addEvent(event);
    return event;
  }

  // 记录点击事件
  recordClick(messageId, action = 'default') {
    const event = {
      id: this.generateId(),
      type: 'click',
      messageId,
      action,
      timestamp: Date.now()
    };

    this.addEvent(event);
    return event;
  }

  // 记录转化事件
  recordConversion(messageId, conversionType, value = 0) {
    const event = {
      id: this.generateId(),
      type: 'conversion',
      messageId,
      conversionType,
      value,
      timestamp: Date.now()
    };

    this.addEvent(event);
    return event;
  }

  // 记录关闭事件
  recordDismiss(messageId) {
    const event = {
      id: this.generateId(),
      type: 'dismiss',
      messageId,
      timestamp: Date.now()
    };

    this.addEvent(event);
    return event;
  }

  // 添加事件
  addEvent(event) {
    this.events.push(event);
    this.saveEvents();
  }

  // ========== 统计计算 ==========

  // 获取基础统计
  getBasicStats(dateRange = null) {
    const events = this.filterByDateRange(this.events, dateRange);
    
    const sent = events.filter(e => e.type === 'send' || e.type === 'send_failed');
    const sentSuccess = events.filter(e => e.type === 'send');
    const clicked = events.filter(e => e.type === 'click');
    const converted = events.filter(e => e.type === 'conversion');
    const dismissed = events.filter(e => e.type === 'dismiss');
    const impressed = events.filter(e => e.type === 'impression');

    const totalSent = sent.length;
    const totalSentSuccess = sentSuccess.length;
    const totalClicked = clicked.length;
    const totalConverted = converted.length;

    // 计算各项指标
    const successRate = totalSent > 0 ? (totalSentSuccess / totalSent * 100) : 0;
    const clickRate = totalSentSuccess > 0 ? (totalClicked / totalSentSuccess * 100) : 0;
    const conversionRate = totalClicked > 0 ? (totalConverted / totalClicked * 100) : 0;
    const dismissRate = totalSentSuccess > 0 ? (dismissed.length / totalSentSuccess * 100) : 0;
    const impressionRate = totalSentSuccess > 0 ? (impressed.length / totalSentSuccess * 100) : 0;

    // 计算转化价值
    const totalValue = converted.reduce((sum, c) => sum + (c.value || 0), 0);
    const avgValuePerConversion = totalConverted > 0 ? (totalValue / totalConverted) : 0;

    return {
      sent: {
        total: totalSent,
        success: totalSentSuccess,
        failed: totalSent - totalSentSuccess
      },
      performance: {
        successRate: successRate.toFixed(2),
        clickRate: clickRate.toFixed(2),
        conversionRate: conversionRate.toFixed(2),
        dismissRate: dismissRate.toFixed(2),
        impressionRate: impressionRate.toFixed(2)
      },
      conversion: {
        total: totalConverted,
        value: totalValue,
        avgValuePerConversion: avgValuePerConversion.toFixed(2)
      },
      trends: this.calculateTrends(events)
    };
  }

  // 按类型统计
  getStatsByType(dateRange = null) {
    const events = this.filterByDateRange(this.events, dateRange);
    const stats = {};

    // 获取所有消息类型
    const types = [...new Set(events.filter(e => e.messageType).map(e => e.messageType))];

    types.forEach(type => {
      const typeEvents = events.filter(e => e.messageType === type);
      const sent = typeEvents.filter(e => e.type === 'send' || e.type === 'send_failed');
      const success = typeEvents.filter(e => e.type === 'send');
      const clicked = typeEvents.filter(e => e.type === 'click');
      const converted = typeEvents.filter(e => e.type === 'conversion');

      stats[type] = {
        totalSent: sent.length,
        successSent: success.length,
        clicked: clicked.length,
        converted: converted.length,
        clickRate: success.length > 0 ? (clicked.length / success.length * 100).toFixed(2) : '0.00',
        conversionRate: clicked.length > 0 ? (converted.length / clicked.length * 100).toFixed(2) : '0.00'
      };
    });

    return stats;
  }

  // 按时间统计（小时/天/周/月）
  getTimeStats(granularity = 'day', dateRange = null) {
    const events = this.filterByDateRange(this.events, dateRange);
    const stats = {};

    events.forEach(event => {
      const key = this.getTimeKey(event.timestamp, granularity);
      if (!stats[key]) {
        stats[key] = {
          sent: 0,
          clicked: 0,
          converted: 0,
          value: 0
        };
      }

      if (event.type === 'send') stats[key].sent++;
      if (event.type === 'click') stats[key].clicked++;
      if (event.type === 'conversion') {
        stats[key].converted++;
        stats[key].value += event.value || 0;
      }
    });

    return Object.entries(stats).map(([time, data]) => ({
      time,
      ...data,
      clickRate: data.sent > 0 ? (data.clicked / data.sent * 100).toFixed(2) : '0.00',
      conversionRate: data.clicked > 0 ? (data.converted / data.clicked * 100).toFixed(2) : '0.00'
    }));
  }

  // 获取趋势数据
  calculateTrends(events) {
    const now = Date.now();
    const day = 86400000;
    
    // 计算 7 天趋势
    const recentEvents = events.filter(e => now - e.timestamp <= 7 * day);
    const previousEvents = events.filter(e => now - e.timestamp > 7 * day && now - e.timestamp <= 14 * day);

    const recentStats = this.calculatePeriodStats(recentEvents);
    const previousStats = this.calculatePeriodStats(previousEvents);

    return {
      sent: this.calculateChange(recentStats.sent, previousStats.sent),
      clicked: this.calculateChange(recentStats.clicked, previousStats.clicked),
      converted: this.calculateChange(recentStats.converted, previousStats.converted),
      clickRate: this.calculateChange(recentStats.clickRate, previousStats.clickRate),
      conversionRate: this.calculateChange(recentStats.conversionRate, previousStats.conversionRate)
    };
  }

  calculatePeriodStats(events) {
    const sent = events.filter(e => e.type === 'send').length;
    const clicked = events.filter(e => e.type === 'click').length;
    const converted = events.filter(e => e.type === 'conversion').length;

    return {
      sent,
      clicked,
      converted,
      clickRate: sent > 0 ? (clicked / sent * 100) : 0,
      conversionRate: clicked > 0 ? (converted / clicked * 100) : 0
    };
  }

  calculateChange(current, previous) {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous * 100).toFixed(1);
  }

  // ========== 效果分析 ==========

  // 获取最佳推送时段
  getBestTimeSlots() {
    const events = this.events.filter(e => e.type === 'click');
    const slotStats = {};

    events.forEach(event => {
      const date = new Date(event.timestamp);
      const hour = date.getHours();
      const slot = `${hour}:00`;

      if (!slotStats[slot]) {
        slotStats[slot] = { clicks: 0, conversions: 0 };
      }
      slotStats[slot].clicks++;
    });

    return Object.entries(slotStats)
      .map(([slot, stats]) => ({
        slot,
        clicks: stats.clicks,
        conversions: stats.conversions,
        score: stats.clicks + stats.conversions * 2
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  // 获取消息类型效果排行
  getTypeRanking() {
    const byType = this.getStatsByType();
    
    return Object.entries(byType)
      .map(([type, stats]) => ({
        type,
        ...stats,
        overallScore: (parseFloat(stats.clickRate) * 0.4 + parseFloat(stats.conversionRate) * 0.6)
      }))
      .sort((a, b) => b.overallScore - a.overallScore);
  }

  // 获取用户参与度分析
  getEngagementAnalysis(userId = null) {
    const events = this.events.filter(e => {
      if (userId && e.userId !== userId) return false;
      return e.type === 'send';
    });

    const userEngagement = {};
    
    events.forEach(event => {
      const date = new Date(event.timestamp).toDateString();
      if (!userEngagement[date]) {
        userEngagement[date] = { received: 0, clicked: 0, converted: 0 };
      }
      userEngagement[date].received++;
    });

    // 添加点击和转化数据
    this.events.filter(e => e.type === 'click' && (!userId || e.userId === userId)).forEach(e => {
      const date = new Date(e.timestamp).toDateString();
      if (userEngagement[date]) userEngagement[date].clicked++;
    });

    this.events.filter(e => e.type === 'conversion' && (!userId || e.userId === userId)).forEach(e => {
      const date = new Date(e.timestamp).toDateString();
      if (userEngagement[date]) userEngagement[date].converted++;
    });

    return Object.entries(userEngagement)
      .map(([date, stats]) => ({
        date,
        ...stats,
        clickRate: stats.received > 0 ? (stats.clicked / stats.received * 100).toFixed(2) : '0.00',
        conversionRate: stats.clicked > 0 ? (stats.converted / stats.clicked * 100).toFixed(2) : '0.00'
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // ========== 数据管理 ==========

  // 加载事件
  loadEvents() {
    try {
      const stored = localStorage.getItem(this.eventsKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // 保存事件
  saveEvents() {
    try {
      // 保留最近 90 天数据
      const cutoff = Date.now() - 90 * 86400000;
      this.events = this.events.filter(e => e.timestamp >= cutoff);
      
      // 限制总数
      if (this.events.length > 10000) {
        this.events = this.events.slice(-10000);
      }
      
      localStorage.setItem(this.eventsKey, JSON.stringify(this.events));
    } catch (error) {
      console.error('保存事件失败:', error);
    }
  }

  // 按日期范围筛选
  filterByDateRange(events, dateRange) {
    if (!dateRange) return events;

    const now = Date.now();
    let startTime, endTime = now;

    switch (dateRange) {
      case 'today':
        startTime = new Date().setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startTime = new Date().setHours(0, 0, 0, 0) - 86400000;
        endTime = new Date().setHours(0, 0, 0, 0);
        break;
      case 'week':
        startTime = now - 7 * 86400000;
        break;
      case 'month':
        startTime = now - 30 * 86400000;
        break;
      case 'quarter':
        startTime = now - 90 * 86400000;
        break;
      default:
        startTime = 0;
    }

    return events.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
  }

  // 获取时间键
  getTimeKey(timestamp, granularity) {
    const date = new Date(timestamp);
    
    switch (granularity) {
      case 'hour':
        return `${date.toISOString().slice(0, 13)}:00`;
      case 'day':
        return date.toISOString().slice(0, 10);
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().slice(0, 10);
      case 'month':
        return date.toISOString().slice(0, 7);
      default:
        return date.toISOString().slice(0, 10);
    }
  }

  // ========== 报告生成 ==========

  // 生成统计报告
  generateReport(dateRange = 'week') {
    const stats = this.getBasicStats(dateRange);
    const byType = this.getStatsByType(dateRange);
    const byTime = this.getTimeStats('day', dateRange);
    const bestTimes = this.getBestTimeSlots();
    const typeRanking = this.getTypeRanking().slice(0, 5);

    return {
      summary: stats,
      byType,
      byTime,
      insights: {
        bestTimeSlots: bestTimes,
        topTypes: typeRanking
      },
      generatedAt: new Date().toISOString(),
      period: dateRange
    };
  }

  // 导出数据
  exportData(format = 'json') {
    if (format === 'json') {
      return JSON.stringify({
        events: this.events,
        exportedAt: new Date().toISOString()
      }, null, 2);
    }

    if (format === 'csv') {
      const headers = ['ID', '类型', '消息ID', '消息类型', '时间', '操作', '值'];
      const rows = this.events.map(e => [
        e.id,
        e.type,
        e.messageId || '',
        e.messageType || '',
        new Date(e.timestamp).toISOString(),
        e.action || '',
        e.value || ''
      ]);
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return '';
  }

  // 清除历史数据
  clearData(beforeDate = null) {
    if (beforeDate) {
      const cutoff = typeof beforeDate === 'number' ? beforeDate : new Date(beforeDate).getTime();
      this.events = this.events.filter(e => e.timestamp >= cutoff);
    } else {
      this.events = [];
    }
    this.saveEvents();
  }

  // ========== 工具方法 ==========

  generateId() {
    return 'stat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 格式化数字
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // 格式化百分比
  formatPercent(value) {
    return parseFloat(value).toFixed(2) + '%';
  }

  // 格式化金额
  formatCurrency(value) {
    return '¥' + parseFloat(value).toFixed(2);
  }
}

// 导出全局实例
window.PushStatistics = PushStatistics;
