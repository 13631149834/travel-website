/**
 * 搜索功能增强模块
 * 提供实时搜索建议、搜索历史、热门搜索和结果高亮功能
 */

(function() {
  'use strict';

  // 搜索数据配置
  const SearchConfig = {
    // 最大历史记录数
    MAX_HISTORY: 10,
    // 本地存储键名
    HISTORY_KEY: 'travel_search_history',
    // 搜索建议防抖时间(ms)
    DEBOUNCE_DELAY: 150,
    // 最大建议数量
    MAX_SUGGESTIONS: 10
  };

  // 搜索数据类型图标
  const SearchIcons = {
    guide: '🎤',
    attraction: '🏛️',
    route: '🗺️',
    visa: '📋',
    article: '📖',
    hotel: '🏨',
    restaurant: '🍽️',
    hot: '🔥'
  };

  const SearchTypeNames = {
    guide: '导游',
    attraction: '景点',
    route: '线路',
    visa: '签证',
    article: '攻略',
    hotel: '酒店',
    restaurant: '餐厅',
    hot: '热门'
  };

  /**
   * 搜索历史管理
   */
  const SearchHistory = {
    get: function() {
      try {
        return JSON.parse(localStorage.getItem(SearchConfig.HISTORY_KEY)) || [];
      } catch {
        return [];
      }
    },

    save: function(keyword) {
      if (!keyword || !keyword.trim()) return;
      const history = this.get();
      // 移除已存在的相同关键词
      const filtered = history.filter(h => h !== keyword);
      // 添加到开头
      filtered.unshift(keyword);
      // 限制数量
      if (filtered.length > SearchConfig.MAX_HISTORY) {
        filtered.splice(SearchConfig.MAX_HISTORY);
      }
      localStorage.setItem(SearchConfig.HISTORY_KEY, JSON.stringify(filtered));
    },

    delete: function(keyword) {
      const history = this.get().filter(h => h !== keyword);
      localStorage.setItem(SearchConfig.HISTORY_KEY, JSON.stringify(history));
    },

    clear: function() {
      localStorage.removeItem(SearchConfig.HISTORY_KEY);
    },

    render: function(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const history = this.get();
      if (history.length === 0) {
        container.style.display = 'none';
        return;
      }

      container.style.display = 'block';
      container.innerHTML = history.map(h => `
        <span class="history-tag" data-keyword="${h}">
          ${h}
          <span class="del-icon" data-action="delete" data-keyword="${h}">✕</span>
        </span>
      `).join('');
    }
  };

  /**
   * 关键词高亮
   */
  function highlightKeyword(text, keyword) {
    if (!keyword || !text) return text;
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * 防抖函数
   */
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * 搜索建议生成
   */
  function generateSuggestions(keyword, searchData) {
    if (!keyword || !searchData) return [];
    
    const lowerKeyword = keyword.toLowerCase();
    const results = [];
    const seen = new Set();

    // 遍历所有数据类型
    Object.entries(searchData).forEach(([type, items]) => {
      items.forEach(item => {
        const matchFields = [item.name, item.country, item.desc, item.type].filter(Boolean);
        const isMatch = matchFields.some(field => 
          field.toLowerCase().includes(lowerKeyword)
        );
        
        if (isMatch && !seen.has(item.name)) {
          seen.add(item.name);
          results.push({
            text: item.name,
            type: type,
            typeName: SearchTypeNames[type] || type,
            icon: SearchIcons[type] || '📄'
          });
        }
      });
    });

    return results.slice(0, SearchConfig.MAX_SUGGESTIONS);
  }

  /**
   * 渲染搜索建议
   */
  function renderSuggestions(suggestions, containerId, keyword, onSelect) {
    const container = document.getElementById(containerId);
    if (!container || suggestions.length === 0) {
      container && (container.classList.remove('show'));
      return;
    }

    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');

    container.innerHTML = suggestions.map(item => {
      const highlighted = item.text.replace(regex, '<span class="highlight">$1</span>');
      return `
        <div class="suggestion-item" data-keyword="${item.text}">
          <span class="suggestion-icon">${item.icon}</span>
          <span>${highlighted}</span>
          <span class="suggestion-type">${item.typeName}</span>
        </div>
      `;
    }).join('');

    container.classList.add('show');

    // 绑定点击事件
    container.querySelectorAll('.suggestion-item').forEach(el => {
      el.addEventListener('click', () => {
        const kw = el.dataset.keyword;
        onSelect && onSelect(kw);
        container.classList.remove('show');
      });
    });
  }

  /**
   * 搜索结果高亮渲染
   */
  function renderSearchResults(results, containerId, keyword) {
    const container = document.getElementById(containerId);
    if (!container || !results) return;

    let totalCount = 0;
    let html = '';

    // 导游结果
    if (results.guide && results.guide.length > 0) {
      totalCount += results.guide.length;
      html += renderResultSection('🎤', '导游', results.guide, keyword, 'guide');
    }

    // 景点结果
    if (results.attraction && results.attraction.length > 0) {
      totalCount += results.attraction.length;
      html += renderResultSection('🏛️', '景点', results.attraction, keyword, 'attraction');
    }

    // 线路结果
    if (results.route && results.route.length > 0) {
      totalCount += results.route.length;
      html += renderResultSection('🗺️', '线路', results.route, keyword, 'route');
    }

    // 签证结果
    if (results.visa && results.visa.length > 0) {
      totalCount += results.visa.length;
      html += renderResultSection('📋', '签证', results.visa, keyword, 'visa');
    }

    // 文章结果
    if (results.article && results.article.length > 0) {
      totalCount += results.article.length;
      html += renderResultSection('📖', '攻略', results.article, keyword, 'article');
    }

    if (totalCount === 0) {
      container.innerHTML = '';
      const noResults = document.getElementById('noResults');
      if (noResults) noResults.style.display = 'block';
    } else {
      const noResults = document.getElementById('noResults');
      if (noResults) noResults.style.display = 'none';
      
      container.innerHTML = `
        <div class="results-header">
          <h2>搜索结果</h2>
          <span class="results-count">共找到 ${totalCount} 个结果</span>
        </div>
        ${html}
      `;
    }
  }

  function renderResultSection(icon, title, items, keyword, tag) {
    return `
      <div class="result-section">
        <h3>${icon} ${title} (${items.length})</h3>
        <div class="result-list">
          ${items.map(item => `
            <a href="${item.link || '#'}" class="result-item">
              <div class="result-icon">${icon}</div>
              <div class="result-info">
                <h4>${highlightKeyword(item.name, keyword)}</h4>
                <p>${formatResultDesc(item, keyword)}</p>
              </div>
              <span class="result-tag">${tag}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  function formatResultDesc(item, keyword) {
    const parts = [];
    if (item.country) parts.push(highlightKeyword(item.country, keyword));
    if (item.lang) parts.push(item.lang);
    if (item.desc) parts.push(highlightKeyword(item.desc, keyword));
    if (item.type) parts.push(highlightKeyword(item.type, keyword));
    if (item.duration) parts.push(item.duration);
    if (item.price) parts.push(item.price);
    if (item.rating) parts.push(`评分 ${item.rating}`);
    return parts.join(' · ');
  }

  /**
   * 初始化搜索框
   */
  function initSearchBox(options) {
    const {
      inputId,
      suggestionsId,
      historyId,
      historyClearId,
      searchBtnId,
      onSearch,
      searchData
    } = options;

    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);
    const historyContainer = document.getElementById(historyId);
    const historyClear = document.getElementById(historyClearId);
    const searchBtn = document.getElementById(searchBtnId);

    if (!input) return;

    // 渲染历史记录
    if (historyContainer) {
      SearchHistory.render(historyId);
      
      // 历史标签点击
      historyContainer.addEventListener('click', (e) => {
        const tag = e.target.closest('.history-tag');
        if (!tag) return;
        
        const action = e.target.dataset.action;
        const keyword = tag.dataset.keyword;
        
        if (action === 'delete') {
          SearchHistory.delete(keyword);
          SearchHistory.render(historyId);
        } else {
          input.value = keyword;
          onSearch && onSearch(keyword);
        }
      });
    }

    // 清除历史
    if (historyClear) {
      historyClear.addEventListener('click', () => {
        SearchHistory.clear();
        SearchHistory.render(historyId);
      });
    }

    // 输入事件（防抖）
    const debouncedSuggest = debounce((keyword) => {
      if (keyword.length > 0 && suggestions) {
        const results = generateSuggestions(keyword, searchData);
        renderSuggestions(results, suggestionsId, keyword, (kw) => {
          input.value = kw;
          SearchHistory.save(kw);
          onSearch && onSearch(kw);
        });
      } else if (suggestions) {
        suggestions.classList.remove('show');
      }
    }, SearchConfig.DEBOUNCE_DELAY);

    input.addEventListener('input', (e) => {
      debouncedSuggest(e.target.value.trim());
    });

    // 回车搜索
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        suggestions && suggestions.classList.remove('show');
        const keyword = input.value.trim();
        if (keyword) {
          SearchHistory.save(keyword);
          SearchHistory.render(historyId);
          onSearch && onSearch(keyword);
        }
      }
    });

    // 搜索按钮
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        suggestions && suggestions.classList.remove('show');
        const keyword = input.value.trim();
        if (keyword) {
          SearchHistory.save(keyword);
          SearchHistory.render(historyId);
          onSearch && onSearch(keyword);
        }
      });
    }

    // 点击其他地方关闭建议
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-box')) {
        suggestions && suggestions.classList.remove('show');
      }
    });
  }

  // 导出到全局
  window.SearchEnhanced = {
    History: SearchHistory,
    highlight: highlightKeyword,
    generateSuggestions,
    renderSuggestions,
    renderResults: renderSearchResults,
    init: initSearchBox,
    config: SearchConfig,
    icons: SearchIcons
  };

})();
