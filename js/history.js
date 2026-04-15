/**
 * 游导旅游 - 历史记录管理系统
 * 基于 localStorage 的浏览历史、搜索历史、阅读历史管理
 */

const HistoryManager = {
  // 存储键名
  KEYS: {
    BROWSE: 'travel_browse_history',
    SEARCH: 'travel_search_history',
    READING: 'travel_reading_history',
    FOOTPRINT: 'travel_footprint_history',
    STATS: 'travel_stats'
  },

  // 最大存储条数
  MAX_ITEMS: 1000,

  // 数据过期时间（7天）
  EXPIRE_DAYS: 7,

  /**
   * 获取浏览历史
   */
  getBrowseHistory() {
    const data = localStorage.getItem(this.KEYS.BROWSE);
    return data ? JSON.parse(data) : [];
  },

  /**
   * 添加浏览记录
   */
  addBrowseHistory(item) {
    const history = this.getBrowseHistory();
    const newItem = {
      id: Date.now().toString(),
      url: item.url || window.location.href,
      title: item.title || document.title,
      type: item.type || 'page',
      thumbnail: item.thumbnail || null,
      excerpt: item.excerpt || null,
      timestamp: new Date().toISOString(),
      metadata: item.metadata || {}
    };

    // 去重：移除相同URL的记录
    const filtered = history.filter(h => h.url !== newItem.url);
    
    // 添加到开头
    filtered.unshift(newItem);
    
    // 限制数量
    const limited = filtered.slice(0, this.MAX_ITEMS);
    
    localStorage.setItem(this.KEYS.BROWSE, JSON.stringify(limited));
    this.updateStats('browse');
    
    return newItem;
  },

  /**
   * 删除单条浏览记录
   */
  removeBrowseHistory(id) {
    const history = this.getBrowseHistory();
    const filtered = history.filter(h => h.id !== id);
    localStorage.setItem(this.KEYS.BROWSE, JSON.stringify(filtered));
    return filtered;
  },

  /**
   * 清除所有浏览历史
   */
  clearBrowseHistory() {
    localStorage.removeItem(this.KEYS.BROWSE);
    this.updateStats('browse', true);
  },

  /**
   * 获取搜索历史
   */
  getSearchHistory() {
    const data = localStorage.getItem(this.KEYS.SEARCH);
    return data ? JSON.parse(data) : [];
  },

  /**
   * 添加搜索词
   */
  addSearchHistory(keyword) {
    if (!keyword || !keyword.trim()) return null;
    
    const history = this.getSearchHistory();
    const newItem = {
      id: Date.now().toString(),
      keyword: keyword.trim(),
      timestamp: new Date().toISOString(),
      count: 1
    };

    // 去重：增加已有词的计数
    const existingIndex = history.findIndex(h => h.keyword === newItem.keyword);
    if (existingIndex > -1) {
      history[existingIndex].count++;
      history[existingIndex].timestamp = newItem.timestamp;
      localStorage.setItem(this.KEYS.SEARCH, JSON.stringify(history));
      return history[existingIndex];
    }
    
    // 添加到开头
    history.unshift(newItem);
    
    // 限制数量
    const limited = history.slice(0, 100);
    
    localStorage.setItem(this.KEYS.SEARCH, JSON.stringify(limited));
    return newItem;
  },

  /**
   * 删除搜索词
   */
  removeSearchHistory(id) {
    const history = this.getSearchHistory();
    const filtered = history.filter(h => h.id !== id);
    localStorage.setItem(this.KEYS.SEARCH, JSON.stringify(filtered));
    return filtered;
  },

  /**
   * 清除所有搜索历史
   */
  clearSearchHistory() {
    localStorage.removeItem(this.KEYS.SEARCH);
  },

  /**
   * 获取阅读历史
   */
  getReadingHistory() {
    const data = localStorage.getItem(this.KEYS.READING);
    return data ? JSON.parse(data) : [];
  },

  /**
   * 添加/更新阅读记录
   */
  addReadingHistory(item) {
    const history = this.getReadingHistory();
    const existingIndex = history.findIndex(h => h.url === item.url);
    
    const newItem = {
      id: existingIndex > -1 ? history[existingIndex].id : Date.now().toString(),
      url: item.url,
      title: item.title,
      type: item.type || 'article',
      thumbnail: item.thumbnail || null,
      progress: item.progress || 0,
      readTime: item.readTime || 0,
      lastReadAt: new Date().toISOString(),
      createdAt: existingIndex > -1 ? history[existingIndex].createdAt : new Date().toISOString(),
      totalTime: existingIndex > -1 ? (history[existingIndex].totalTime || 0) + (item.readTime || 0) : (item.readTime || 0)
    };

    if (existingIndex > -1) {
      history[existingIndex] = newItem;
    } else {
      history.unshift(newItem);
    }
    
    // 限制数量
    const limited = history.slice(0, this.MAX_ITEMS);
    
    localStorage.setItem(this.KEYS.READING, JSON.stringify(limited));
    return newItem;
  },

  /**
   * 更新阅读进度
   */
  updateReadingProgress(url, progress, readTime) {
    const history = this.getReadingHistory();
    const index = history.findIndex(h => h.url === url);
    
    if (index > -1) {
      history[index].progress = progress;
      history[index].readTime = readTime;
      history[index].lastReadAt = new Date().toISOString();
      localStorage.setItem(this.KEYS.READING, JSON.stringify(history));
    }
    
    return history;
  },

  /**
   * 删除阅读记录
   */
  removeReadingHistory(id) {
    const history = this.getReadingHistory();
    const filtered = history.filter(h => h.id !== id);
    localStorage.setItem(this.KEYS.READING, JSON.stringify(filtered));
    return filtered;
  },

  /**
   * 清除所有阅读历史
   */
  clearReadingHistory() {
    localStorage.removeItem(this.KEYS.READING);
  },

  /**
   * 获取足迹数据
   */
  getFootprintHistory() {
    const data = localStorage.getItem(this.KEYS.FOOTPRINT);
    return data ? JSON.parse(data) : [];
  },

  /**
   * 添加足迹
   */
  addFootprint(destination) {
    const history = this.getFootprintHistory();
    const newItem = {
      id: Date.now().toString(),
      destinationId: destination.id,
      name: destination.name,
      country: destination.country || '',
      coordinates: destination.coordinates || null,
      thumbnail: destination.thumbnail || null,
      timestamp: new Date().toISOString(),
      viewCount: 1
    };

    // 去重
    const existingIndex = history.findIndex(h => h.destinationId === newItem.destinationId);
    if (existingIndex > -1) {
      history[existingIndex].viewCount++;
      history[existingIndex].timestamp = newItem.timestamp;
      localStorage.setItem(this.KEYS.FOOTPRINT, JSON.stringify(history));
      return history[existingIndex];
    }
    
    history.unshift(newItem);
    const limited = history.slice(0, 200);
    
    localStorage.setItem(this.KEYS.FOOTPRINT, JSON.stringify(limited));
    return newItem;
  },

  /**
   * 清除足迹
   */
  clearFootprintHistory() {
    localStorage.removeItem(this.KEYS.FOOTPRINT);
  },

  /**
   * 获取统计数据
   */
  getStats() {
    const data = localStorage.getItem(this.KEYS.STATS);
    return data ? JSON.parse(data) : {
      totalBrowse: 0,
      totalSearch: 0,
      totalReading: 0,
      totalFootprint: 0,
      lastActive: null,
      categoryStats: {},
      hourlyStats: {}
    };
  },

  /**
   * 更新统计
   */
  updateStats(type, reset = false) {
    const stats = this.getStats();
    
    if (reset) {
      stats[`total${type.charAt(0).toUpperCase() + type.slice(1)}`] = 0;
    } else {
      stats[`total${type.charAt(0).toUpperCase() + type.slice(1)}`]++;
    }
    
    stats.lastActive = new Date().toISOString();
    
    // 更新每小时统计
    const hour = new Date().getHours();
    stats.hourlyStats[hour] = (stats.hourlyStats[hour] || 0) + (reset ? 0 : 1);
    
    localStorage.setItem(this.KEYS.STATS, JSON.stringify(stats));
    return stats;
  },

  /**
   * 按日期分组
   */
  groupByDate(items) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const groups = {
      today: [],
      yesterday: [],
      earlier: []
    };
    
    items.forEach(item => {
      const itemDate = new Date(item.timestamp || item.lastReadAt);
      const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
      
      if (itemDay.getTime() === today.getTime()) {
        groups.today.push(item);
      } else if (itemDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(item);
      } else {
        groups.earlier.push(item);
      }
    });
    
    return groups;
  },

  /**
   * 清理过期数据
   */
  cleanupExpired() {
    const expireTime = new Date().getTime() - this.EXPIRE_DAYS * 24 * 60 * 60 * 1000;
    
    // 清理浏览历史
    let browseHistory = this.getBrowseHistory();
    browseHistory = browseHistory.filter(h => new Date(h.timestamp).getTime() > expireTime);
    localStorage.setItem(this.KEYS.BROWSE, JSON.stringify(browseHistory));
    
    // 清理阅读历史
    let readingHistory = this.getReadingHistory();
    readingHistory = readingHistory.filter(h => new Date(h.lastReadAt).getTime() > expireTime);
    localStorage.setItem(this.KEYS.READING, JSON.stringify(readingHistory));
    
    // 清理足迹
    let footprintHistory = this.getFootprintHistory();
    footprintHistory = footprintHistory.filter(h => new Date(h.timestamp).getTime() > expireTime);
    localStorage.setItem(this.KEYS.FOOTPRINT, JSON.stringify(footprintHistory));
    
    return {
      browseCount: browseHistory.length,
      readingCount: readingHistory.length,
      footprintCount: footprintHistory.length
    };
  },

  /**
   * 搜索历史记录
   */
  searchHistory(keyword) {
    const history = this.getBrowseHistory();
    const lowerKeyword = keyword.toLowerCase();
    
    return history.filter(item => 
      item.title.toLowerCase().includes(lowerKeyword) ||
      (item.excerpt && item.excerpt.toLowerCase().includes(lowerKeyword)) ||
      item.url.toLowerCase().includes(lowerKeyword)
    );
  },

  /**
   * 获取热门目的地
   */
  getTopDestinations(limit = 10) {
    const footprint = this.getFootprintHistory();
    return footprint
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  },

  /**
   * 获取总阅读时长
   */
  getTotalReadTime() {
    const history = this.getReadingHistory();
    return history.reduce((total, item) => total + (item.totalTime || 0), 0);
  },

  /**
   * 导出历史数据
   */
  exportData() {
    return {
      browseHistory: this.getBrowseHistory(),
      searchHistory: this.getSearchHistory(),
      readingHistory: this.getReadingHistory(),
      footprintHistory: this.getFootprintHistory(),
      stats: this.getStats(),
      exportedAt: new Date().toISOString()
    };
  },

  /**
   * 导入历史数据
   */
  importData(data) {
    if (data.browseHistory) {
      localStorage.setItem(this.KEYS.BROWSE, JSON.stringify(data.browseHistory));
    }
    if (data.searchHistory) {
      localStorage.setItem(this.KEYS.SEARCH, JSON.stringify(data.searchHistory));
    }
    if (data.readingHistory) {
      localStorage.setItem(this.KEYS.READING, JSON.stringify(data.readingHistory));
    }
    if (data.footprintHistory) {
      localStorage.setItem(this.KEYS.FOOTPRINT, JSON.stringify(data.footprintHistory));
    }
    if (data.stats) {
      localStorage.setItem(this.KEYS.STATS, JSON.stringify(data.stats));
    }
  }
};

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
  // 清理过期数据
  HistoryManager.cleanupExpired();
  
  // 记录当前页面访问
  if (window.location.pathname !== '/history/' && 
      !window.location.pathname.includes('/history/')) {
    HistoryManager.addBrowseHistory({
      url: window.location.href,
      title: document.title,
      type: 'page'
    });
  }
});

// 页面自动记录脚本
function initPageTracking() {
  // 记录页面浏览
  HistoryManager.addBrowseHistory({
    url: window.location.href,
    title: document.title,
    type: getPageType()
  });
}

function getPageType() {
  const path = window.location.pathname;
  if (path.includes('destination')) return 'destination';
  if (path.includes('route')) return 'route';
  if (path.includes('guide')) return 'guide';
  if (path.includes('article') || path.includes('knowledge')) return 'article';
  if (path.includes('tool')) return 'tool';
  return 'page';
}
