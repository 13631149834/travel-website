/**
 * 游导旅游 - 智能搜索模块
 * 功能：搜索建议、拼音搜索、模糊匹配、搜索纠错、搜索历史、搜索分析
 */

(function() {
  'use strict';

  // ============================================
  // 配置常量
  // ============================================
  const CONFIG = {
    // 存储键名
    STORAGE_KEYS: {
      HISTORY: 'travel_search_history',
      HOT: 'travel_hot_searches',
      ANALYTICS: 'travel_search_analytics',
      NO_RESULT: 'travel_no_result_words',
      PRIVACY: 'travel_privacy_mode'
    },
    // 限制参数
    MAX_HISTORY: 20,
    MAX_SUGGESTIONS: 12,
    MAX_HOT_SEARCHES: 20,
    // 防抖延迟(ms)
    DEBOUNCE_DELAY: 150,
    // 拼音匹配容错率
    PINYIN_MATCH_RATE: 0.6,
    // 模糊匹配容错率
    FUZZY_MATCH_RATE: 0.5
  };

  // 类型配置
  const TYPE_CONFIG = {
    guide: { icon: '🎤', label: '导游', color: '#6366f1' },
    attraction: { icon: '🏛️', label: '景点', color: '#8b5cf6' },
    route: { icon: '🗺️', label: '线路', color: '#ec4899' },
    visa: { icon: '📋', label: '签证', color: '#14b8a6' },
    article: { icon: '📖', label: '攻略', color: '#f59e0b' },
    hotel: { icon: '🏨', label: '酒店', color: '#3b82f6' },
    restaurant: { icon: '🍽️', label: '餐厅', color: '#10b981' }
  };

  // ============================================
  // 拼音转换模块
  // ============================================
  const PinyinEngine = {
    // 常用汉字拼音映射（简化版）
    pinyinMap: {
      '日': 'ri', '本': 'ben', '泰': 'tai', '国': 'guo', '欧': 'ou',
      '洲': 'zhou', '申': 'shen', '根': 'gen', '签': 'qian', '证': 'zheng',
      '马': 'ma', '尔': 'er', '代': 'dai', '夫': 'fu', '迪': 'di',
      '拜': 'bai', '美': 'mei', '国': 'guo', '韩': 'han', '国': 'guo',
      '新': 'xin', '加': 'jia', '坡': 'po', '澳': 'ao', '大': 'da',
      '利': 'li', '亚': 'ya', '英': 'ying', '法': 'fa', '德': 'de',
      '意': 'yi', '西': 'xi', '班': 'ban', '牙': 'ya', '荷': 'he',
      '瑞': 'rui', '典': 'dian', '挪': 'nuo', '威': 'wei', '芬': 'fen',
      '兰': 'lan', '冰': 'bing', '岛': 'dao', '捷': 'jie', '克': 'ke',
      '匈': 'xiong', '牙': 'ya', '利': 'li', '波': 'bo', '兰': 'lan',
      '希': 'xi', '腊': 'la', '葡': 'pu', '萄': 'tao', '牙': 'ya',
      '俄': 'e', '罗': 'luo', '斯': 'si', '土': 'tu', '耳': 'er',
      '其': 'qi', '埃': 'ai', '及': 'ji', '度': 'du', '度': 'du',
      '尼': 'ni', '泊': 'bo', '尔': 'er', '西': 'xi', '藏': 'zang',
      '兰': 'lan', '九': 'jiu', '寨': 'zhai', '沟': 'gou', '张': 'zhang',
      '家': 'jia', '界': 'jie', '凤': 'feng', '凰': 'huang', '黄': 'huang',
      '山': 'shan', '桂': 'gui', '林': 'lin', '阳': 'yang', '朔': 'shuo',
      '厦': 'xia', '门': 'men', '丽': 'li', '江': 'jiang', '大': 'da',
      '理': 'li', '香': 'xiang', '港': 'gang', '澳': 'ao', '门': 'men',
      '台': 'tai', '湾': 'wan', '东': 'dong', '北': 'bei', '京': 'jing',
      '上': 'shang', '海': 'hai', '广': 'guang', '州': 'zhou', '深': 'shen',
      '成': 'cheng', '都': 'du', '重': 'zhong', '庆': 'qing', '天': 'tian',
      '津': 'jin', '苏': 'su', '州': 'zhou', '无': 'wu', '锡': 'xi',
      '杭': 'hang', '宁': 'ning', '波': 'bo', '青': 'qing', '岛': 'dao',
      '济': 'ji', '南': 'nan', '郑': 'zheng', '州': 'zhou', '长': 'chang',
      '沙': 'sha', '合': 'he', '肥': 'fei', '合': 'he', '肥': 'fei',
      '福': 'fu', '州': 'zhou', '厦': 'xia', '门': 'men', '南': 'nan',
      '昌': 'chang', '贵': 'gui', '阳': 'yang', '昆': 'kun', '明': 'ming',
      '拉': 'la', '萨': 'sa', '西': 'xi', '宁': 'ning', '银': 'yin',
      '川': 'chuan', '乌': 'wu', '鲁': 'lu', '齐': 'qi', '石': 'shi',
      '家': 'jia', '庄': 'zhuang', '太': 'tai', '原': 'yuan', '呼': 'hu',
      '和': 'he', '浩': 'hao', '特': 'te', '洛': 'luo', '阳': 'yang',
      '开': 'kai', '封': 'feng', '洛': 'luo', '阳': 'yang', '武': 'wu',
      '汉': 'han', '宜': 'yi', '昌': 'chang', '长': 'chang', '沙': 'sha',
      '岳': 'yue', '阳': 'yang', '桂': 'gui', '林': 'lin', '北': 'bei',
      '海': 'hai', '柳': 'liu', '州': 'zhou', '海': 'hai', '口': 'kou',
      '三': 'san', '亚': 'ya', '珠': 'zhu', '海': 'hai', '万': 'wan',
      '宁': 'ning', '三': 'san', '亚': 'ya'
    },

    // 获取汉字拼音
    getPinyin(char) {
      return this.pinyinMap[char] || char;
    },

    // 字符串转拼音
    toPinyin(str) {
      return str.split('').map(c => this.getPinyin(c)).join('');
    },

    // 拼音模糊匹配
    match(query, target) {
      if (!query || !target) return 0;
      
      const queryPinyin = this.toPinyin(query.toLowerCase());
      const targetPinyin = this.toPinyin(target.toLowerCase());
      
      if (targetPinyin.includes(queryPinyin)) return 1;
      
      // 计算编辑距离相似度
      const similarity = this.calculateSimilarity(queryPinyin, targetPinyin);
      return similarity;
    },

    // 计算字符串相似度（Levenshtein距离）
    calculateSimilarity(str1, str2) {
      const len1 = str1.length;
      const len2 = str2.length;
      
      if (len1 === 0) return len2 === 0 ? 1 : 0;
      if (len2 === 0) return 0;

      const matrix = [];
      for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
      }

      for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
          const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost
          );
        }
      }

      const maxLen = Math.max(len1, len2);
      return 1 - matrix[len1][len2] / maxLen;
    }
  };

  // ============================================
  // 搜索纠错模块
  // ============================================
  const SpellChecker = {
    // 常见错别字词典
    corrections: {
      '旅游': '旅行',
      '导胡': '导游',
      '导唬': '导游',
      '导护': '导游',
      '导杭': '导游',
      '导汗': '导游',
      '导行': '导游',
      '日本': '日本',
      '泰过': '泰国',
      '欧洲': '欧洲',
      '马而代府': '马尔代夫',
      '马尔代夫': '马尔代夫',
      '迪拜': '迪拜',
      '美国': '美国',
      '新加波': '新加坡',
      '悉尼': '悉尼',
      '巴黎': '巴黎',
      '伦敦': '伦敦',
      '罗马': '罗马',
      '签证': '签证',
      '申根': '申根',
      '攻略': '攻略',
      '线路': '线路',
      '自由行': '自由行',
      '跟团游': '跟团游'
    },

    // 常见拼写错误
    pinyinCorrections: {
      'riben': '日本',
      'taiguo': '泰国',
      'ouzhou': '欧洲',
      'maerdaifu': '马尔代夫',
      'dibai': '迪拜',
      'meiguo': '美国',
      'xinjiapo': '新加坡',
      'xili': '悉尼',
      'bali': '巴黎',
      'lundun': '伦敦',
      'luoma': '罗马',
      'qianzheng': '签证',
      'shengen': '申根',
      'gonglue': '攻略',
      'xianlu': '线路'
    },

    // 检查并纠正
    correct(word) {
      if (!word) return { corrected: word, isCorrected: false };

      // 先检查直接匹配
      if (this.corrections[word]) {
        return { corrected: this.corrections[word], isCorrected: word !== this.corrections[word] };
      }

      // 检查拼音匹配
      const pinyin = PinyinEngine.toPinyin(word);
      if (this.pinyinCorrections[pinyin]) {
        return { corrected: this.pinyinCorrections[pinyin], isCorrected: true };
      }

      // 使用拼音相似度匹配
      let bestMatch = word;
      let bestScore = 0;

      for (const [key, value] of Object.entries(this.pinyinCorrections)) {
        const score = PinyinEngine.calculateSimilarity(pinyin, key);
        if (score > bestScore && score >= CONFIG.PINYIN_MATCH_RATE) {
          bestScore = score;
          bestMatch = value;
        }
      }

      return { corrected: bestMatch, isCorrected: bestMatch !== word };
    }
  };

  // ============================================
  // 搜索历史管理
  // ============================================
  const SearchHistory = {
    isPrivacyMode() {
      return localStorage.getItem(CONFIG.STORAGE_KEYS.PRIVACY) === 'true';
    },

    get() {
      if (this.isPrivacyMode()) return [];
      try {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY)) || [];
      } catch {
        return [];
      }
    },

    save(keyword) {
      if (!keyword || !keyword.trim() || this.isPrivacyMode()) return;
      
      const history = this.get();
      const trimmed = keyword.trim();
      
      // 移除已存在的相同关键词
      const filtered = history.filter(h => h !== trimmed);
      // 添加到开头并记录时间
      filtered.unshift({
        keyword: trimmed,
        timestamp: Date.now()
      });
      
      // 限制数量
      if (filtered.length > CONFIG.MAX_HISTORY) {
        filtered.splice(CONFIG.MAX_HISTORY);
      }
      
      localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
      
      // 更新热门搜索
      HotSearches.increment(trimmed);
    },

    delete(keyword) {
      const history = this.get().filter(h => h.keyword !== keyword);
      localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORY, JSON.stringify(history));
    },

    clear() {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.HISTORY);
    },

    togglePrivacyMode() {
      const current = this.isPrivacyMode();
      localStorage.setItem(CONFIG.STORAGE_KEYS.PRIVACY, (!current).toString());
      if (!current) {
        this.clear(); // 关闭隐私模式时清除历史
      }
      return !current;
    },

    render(containerId, onSelect, onDelete) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const history = this.get();
      if (history.length === 0) {
        container.style.display = 'none';
        return;
      }

      container.style.display = 'block';
      container.innerHTML = history.slice(0, 10).map(item => {
        const keyword = typeof item === 'string' ? item : item.keyword;
        return `
          <span class="history-tag" data-keyword="${keyword}" title="${keyword}">
            <span class="history-icon">🕐</span>
            ${keyword}
            <span class="del-icon" data-action="delete" data-keyword="${keyword}">✕</span>
          </span>
        `;
      }).join('');
    }
  };

  // ============================================
  // 热门搜索管理
  // ============================================
  const HotSearches = {
    defaultHot: [
      { keyword: '日本', count: 1256, trend: 'up' },
      { keyword: '泰国', count: 1089, trend: 'up' },
      { keyword: '欧洲', count: 967, trend: 'stable' },
      { keyword: '申根签证', count: 845, trend: 'up' },
      { keyword: '日本签证', count: 723, trend: 'stable' },
      { keyword: '马尔代夫', count: 698, trend: 'up' },
      { keyword: '迪拜', count: 612, trend: 'stable' },
      { keyword: '美国签证', count: 589, trend: 'down' },
      { keyword: '新加坡', count: 534, trend: 'up' },
      { keyword: '海岛度假', count: 498, trend: 'up' },
      { keyword: '自由行', count: 467, trend: 'stable' },
      { keyword: '金牌导游', count: 423, trend: 'up' }
    ],

    get() {
      try {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.HOT);
        return stored ? JSON.parse(stored) : this.defaultHot;
      } catch {
        return this.defaultHot;
      }
    },

    increment(keyword) {
      const hot = this.get();
      const existing = hot.find(h => h.keyword === keyword);
      
      if (existing) {
        existing.count++;
        existing.trend = 'up';
      } else {
        hot.push({ keyword, count: 1, trend: 'new' });
      }
      
      // 按热度排序
      hot.sort((a, b) => b.count - a.count);
      
      // 限制数量
      if (hot.length > CONFIG.MAX_HOT_SEARCHES) {
        hot.splice(CONFIG.MAX_HOT_SEARCHES);
      }
      
      localStorage.setItem(CONFIG.STORAGE_KEYS.HOT, JSON.stringify(hot));
    },

    render(containerId, onClick) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const hot = this.get().slice(0, 12);
      
      container.innerHTML = hot.map((item, index) => {
        const rankClass = index < 3 ? `rank-${index + 1}` : '';
        const trendIcon = item.trend === 'up' ? '📈' : item.trend === 'down' ? '📉' : '➖';
        return `
          <span class="hot-tag ${rankClass}" data-keyword="${item.keyword}" title="搜索 ${item.count} 次">
            <span class="rank">${index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}</span>
            ${item.keyword}
            <span class="trend">${trendIcon}</span>
          </span>
        `;
      }).join('');
    }
  };

  // ============================================
  // 搜索分析
  // ============================================
  const SearchAnalytics = {
    get() {
      try {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.ANALYTICS);
        return stored ? JSON.parse(stored) : {
          totalSearches: 0,
          successfulSearches: 0,
          noResultSearches: 0,
          averageResults: 0,
          popularSearches: {},
          searchByHour: {},
          searchByDay: {}
        };
      } catch {
        return {
          totalSearches: 0,
          successfulSearches: 0,
          noResultSearches: 0,
          averageResults: 0,
          popularSearches: {},
          searchByHour: {},
          searchByDay: {}
        };
      }
    },

    save(data) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.ANALYTICS, JSON.stringify(data));
    },

    track(keyword, resultsCount) {
      const analytics = this.get();
      
      // 更新总数
      analytics.totalSearches++;
      
      if (resultsCount > 0) {
        analytics.successfulSearches++;
      } else {
        analytics.noResultSearches++;
        // 记录无结果词
        this.trackNoResult(keyword);
      }
      
      // 更新热门搜索
      analytics.popularSearches[keyword] = (analytics.popularSearches[keyword] || 0) + 1;
      
      // 更新按时段统计
      const hour = new Date().getHours();
      analytics.searchByHour[hour] = (analytics.searchByHour[hour] || 0) + 1;
      
      // 更新按天统计
      const day = new Date().toISOString().split('T')[0];
      analytics.searchByDay[day] = (analytics.searchByDay[day] || 0) + 1;
      
      // 计算平均结果数
      analytics.averageResults = (
        (analytics.averageResults * (analytics.totalSearches - 1) + resultsCount) 
        / analytics.totalSearches
      );
      
      this.save(analytics);
    },

    trackNoResult(keyword) {
      try {
        let noResults = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.NO_RESULT) || '[]');
        const existing = noResults.find(n => n.keyword === keyword);
        
        if (existing) {
          existing.count++;
        } else {
          noResults.push({ keyword, count: 1 });
        }
        
        noResults.sort((a, b) => b.count - a.count);
        if (noResults.length > 100) noResults.splice(100);
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.NO_RESULT, JSON.stringify(noResults));
      } catch {}
    },

    getConversionRate() {
      const analytics = this.get();
      if (analytics.totalSearches === 0) return 0;
      return ((analytics.successfulSearches / analytics.totalSearches) * 100).toFixed(1);
    },

    getTopSearches(limit = 10) {
      const analytics = this.get();
      return Object.entries(analytics.popularSearches)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([keyword, count]) => ({ keyword, count }));
    },

    getNoResultWords(limit = 10) {
      try {
        const noResults = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.NO_RESULT) || '[]');
        return noResults.slice(0, limit);
      } catch {
        return [];
      }
    },

    getOptimizationSuggestions() {
      const suggestions = [];
      const analytics = this.get();
      
      // 转化率建议
      const convRate = this.getConversionRate();
      if (convRate < 70) {
        suggestions.push({
          type: 'warning',
          message: `搜索转化率为 ${convRate}%，建议优化热门无结果词的搜索结果`
        });
      }
      
      // 无结果词建议
      const noResultWords = this.getNoResultWords(5);
      if (noResultWords.length > 0) {
        suggestions.push({
          type: 'info',
          message: `以下词无结果较多: ${noResultWords.map(n => n.keyword).join(', ')}`
        });
      }
      
      // 时段建议
      const peakHour = Object.entries(analytics.searchByHour)
        .sort((a, b) => b[1] - a[1])[0];
      if (peakHour) {
        suggestions.push({
          type: 'tip',
          message: `搜索高峰时段: ${peakHour[0]}:00 - ${parseInt(peakHour[0]) + 1}:00`
        });
      }
      
      return suggestions;
    }
  };

  // ============================================
  // 智能搜索核心
  // ============================================
  const SmartSearch = {
    // 搜索数据
    searchData: null,

    // 初始化
    init(searchData) {
      this.searchData = searchData;
    },

    // 执行搜索
    search(keyword, options = {}) {
      const {
        type = 'all',
        minPrice = 0,
        maxPrice = Infinity,
        minRating = 0,
        tags = []
      } = options;

      if (!keyword || !this.searchData) {
        return { results: [], corrections: null, totalCount: 0 };
      }

      const lowerKeyword = keyword.toLowerCase();
      const results = [];
      const seen = new Set();

      // 搜索纠错
      const correction = SpellChecker.correct(keyword);
      const searchKeyword = correction.corrected.toLowerCase();

      // 确定要搜索的类型
      const typesToSearch = type === 'all' 
        ? Object.keys(TYPE_CONFIG) 
        : [type];

      // 执行搜索
      typesToSearch.forEach(t => {
        const items = this.searchData[t] || [];
        
        items.forEach(item => {
          const matchResult = this.matchItem(item, searchKeyword);
          
          if (matchResult.score > 0) {
            // 应用筛选条件
            const priceMatch = this.matchPrice(item, minPrice, maxPrice);
            const ratingMatch = this.matchRating(item, minRating);
            const tagMatch = tags.length === 0 || this.matchTags(item, tags);

            if (priceMatch && ratingMatch && tagMatch) {
              const key = `${t}-${item.name}`;
              if (!seen.has(key)) {
                seen.add(key);
                results.push({
                  ...item,
                  type: t,
                  score: matchResult.score,
                  matchField: matchResult.field,
                  highlight: matchResult.highlight
                });
              }
            }
          }
        });
      });

      // 按匹配度排序
      results.sort((a, b) => b.score - a.score);

      return {
        results: results.slice(0, 50),
        corrections: correction.isCorrected ? correction : null,
        totalCount: results.length,
        correctedKeyword: correction.isCorrected ? correction.corrected : null
      };
    },

    // 匹配单个项目
    matchItem(item, keyword) {
      const fields = ['name', 'country', 'desc', 'type', 'city', 'tags'];
      let bestScore = 0;
      let bestField = '';
      let highlight = '';

      fields.forEach(field => {
        const value = item[field];
        if (!value) return;

        const strValue = Array.isArray(value) ? value.join(' ') : String(value);
        const lowerValue = strValue.toLowerCase();

        // 精确匹配
        if (lowerValue === keyword) {
          if (bestScore < 1.0) {
            bestScore = 1.0;
            bestField = field;
            highlight = strValue;
          }
          return;
        }

        // 开头匹配
        if (lowerValue.startsWith(keyword)) {
          if (bestScore < 0.95) {
            bestScore = 0.95;
            bestField = field;
            highlight = strValue;
          }
          return;
        }

        // 包含匹配
        if (lowerValue.includes(keyword)) {
          const score = 0.8;
          if (score > bestScore) {
            bestScore = score;
            bestField = field;
            highlight = strValue;
          }
          return;
        }

        // 拼音匹配
        const pinyinScore = PinyinEngine.match(keyword, strValue);
        if (pinyinScore >= CONFIG.PINYIN_MATCH_RATE && pinyinScore > bestScore) {
          bestScore = pinyinScore;
          bestField = field;
          highlight = strValue;
        }

        // 模糊匹配
        const fuzzyScore = this.fuzzyMatch(keyword, lowerValue);
        if (fuzzyScore > bestScore) {
          bestScore = fuzzyScore;
          bestField = field;
          highlight = strValue;
        }
      });

      return { score: bestScore, field: bestField, highlight };
    },

    // 模糊匹配
    fuzzyMatch(query, target) {
      if (target.includes(query)) return 0.7;
      
      // 子串匹配
      for (let i = 0; i < query.length; i++) {
        for (let j = i + 1; j <= query.length; j++) {
          const sub = query.slice(i, j);
          if (sub.length >= 2 && target.includes(sub)) {
            return CONFIG.FUZZY_MATCH_RATE * (sub.length / query.length);
          }
        }
      }
      
      return 0;
    },

    // 价格匹配
    matchPrice(item, min, max) {
      if (!item.price) return true;
      const price = this.extractPrice(item.price);
      return price >= min && price <= max;
    },

    // 评分匹配
    matchRating(item, min) {
      if (!item.rating || min === 0) return true;
      return parseFloat(item.rating) >= min;
    },

    // 标签匹配
    matchTags(item, tags) {
      if (!item.tags) return false;
      return tags.some(tag => item.tags.includes(tag));
    },

    // 提取价格数值
    extractPrice(priceStr) {
      if (typeof priceStr === 'number') return priceStr;
      const match = String(priceStr).match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    },

    // 生成搜索建议
    getSuggestions(keyword, maxResults = CONFIG.MAX_SUGGESTIONS) {
      if (!keyword || !this.searchData) return [];
      
      const suggestions = [];
      const seen = new Set();
      const lowerKeyword = keyword.toLowerCase();

      Object.entries(this.searchData).forEach(([type, items]) => {
        items.forEach(item => {
          const name = item.name?.toLowerCase() || '';
          
          if (name.includes(lowerKeyword) && !seen.has(name)) {
            seen.add(name);
            suggestions.push({
              text: item.name,
              type: type,
              icon: TYPE_CONFIG[type]?.icon || '📄',
              label: TYPE_CONFIG[type]?.label || type,
              score: this.calculateSuggestionScore(item.name, keyword)
            });
          }
        });
      });

      // 添加相关搜索建议
      const related = this.getRelatedSearches(keyword);
      related.forEach(r => {
        if (!seen.has(r) && suggestions.length < maxResults) {
          seen.add(r);
          suggestions.push({
            text: r,
            type: 'related',
            icon: '🔗',
            label: '相关',
            score: 0.5
          });
        }
      });

      // 排序并限制数量
      return suggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);
    },

    // 计算建议得分
    calculateSuggestionScore(text, keyword) {
      const lower = text.toLowerCase();
      const lowerKeyword = keyword.toLowerCase();
      
      if (lower === lowerKeyword) return 1.0;
      if (lower.startsWith(lowerKeyword)) return 0.9;
      if (lower.includes(lowerKeyword)) return 0.7;
      
      // 拼音匹配
      return PinyinEngine.match(keyword, text) * 0.6;
    },

    // 获取相关搜索
    getRelatedSearches(keyword) {
      const related = {
        '日本': ['东京', '大阪', '京都', '北海道', '冲绳', '日本签证'],
        '泰国': ['曼谷', '清迈', '普吉岛', '芭提雅', '泰国签证'],
        '欧洲': ['法国', '意大利', '德国', '瑞士', '英国', '申根签证'],
        '马尔代夫': ['马累', '度假村', '蜜月', '海岛游'],
        '迪拜': ['阿布扎比', '沙漠', '购物', '帆船酒店'],
        '美国': ['纽约', '洛杉矶', '旧金山', '夏威夷', '美国签证'],
        '新加坡': ['圣淘沙', '环球影城', '鱼尾狮', '美食'],
        '韩国': ['首尔', '济州岛', '购物', '美食', '韩国签证'],
        '签证': ['申根签证', '美国签证', '日本签证', '泰国签证'],
        '导游': ['金牌导游', '中文导游', '英文导游', '当地向导']
      };
      
      return related[keyword] || [];
    }
  };

  // ============================================
  // 搜索分析面板
  // ============================================
  const SearchAnalyticsPanel = {
    render(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const analytics = SearchAnalytics.get();
      const topSearches = SearchAnalytics.getTopSearches(5);
      const noResultWords = SearchAnalytics.getNoResultWords(5);
      const suggestions = SearchAnalytics.getOptimizationSuggestions();

      container.innerHTML = `
        <div class="analytics-panel">
          <h3>📊 搜索分析</h3>
          
          <div class="analytics-stats">
            <div class="stat-item">
              <span class="stat-value">${analytics.totalSearches}</span>
              <span class="stat-label">总搜索次数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${SearchAnalytics.getConversionRate()}%</span>
              <span class="stat-label">搜索转化率</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${analytics.averageResults.toFixed(1)}</span>
              <span class="stat-label">平均结果数</span>
            </div>
          </div>
          
          ${topSearches.length > 0 ? `
            <div class="analytics-section">
              <h4>🔥 热门搜索词</h4>
              <div class="top-searches">
                ${topSearches.map((s, i) => `
                  <div class="top-search-item">
                    <span class="rank">${i + 1}</span>
                    <span class="keyword">${s.keyword}</span>
                    <span class="count">${s.count}次</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${noResultWords.length > 0 ? `
            <div class="analytics-section">
              <h4>⚠️ 无结果词</h4>
              <div class="no-result-words">
                ${noResultWords.map(w => `
                  <span class="no-result-tag">${w.keyword} (${w.count}次)</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${suggestions.length > 0 ? `
            <div class="analytics-section">
              <h4>💡 优化建议</h4>
              <div class="suggestions">
                ${suggestions.map(s => `
                  <div class="suggestion-item ${s.type}">${s.message}</div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }
  };

  // ============================================
  // 防抖工具
  // ============================================
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // ============================================
  // 高亮工具
  // ============================================
  function highlightKeyword(text, keyword) {
    if (!keyword || !text) return text;
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // ============================================
  // 全局初始化函数
  // ============================================
  window.SmartSearch = SmartSearch;
  window.SearchHistory = SearchHistory;
  window.HotSearches = HotSearches;
  window.SearchAnalytics = SearchAnalytics;
  window.SearchAnalyticsPanel = SearchAnalyticsPanel;
  window.highlightKeyword = highlightKeyword;

  // 导出配置供外部使用
  window.SEARCH_CONFIG = CONFIG;
  window.TYPE_CONFIG = TYPE_CONFIG;

})();
