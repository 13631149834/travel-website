// 资讯搜索页 JavaScript
// =========================

let newsData = null;
let allResults = [];
let currentCategory = '';
let currentTime = '';
let currentSort = 'time';
let currentKeyword = '';
let displayCount = 9;

document.addEventListener('DOMContentLoaded', async function() {
  await loadNewsData();
  initFromUrl();
  performSearch();
});

async function loadNewsData() {
  try {
    const response = await fetch('../data/news.json');
    newsData = await response.json();
  } catch (error) {
    console.error('加载新闻数据失败:', error);
  }
}

function initFromUrl() {
  const params = new URLSearchParams(window.location.search);
  
  const category = params.get('category');
  if (category) {
    currentCategory = category;
    updateCategoryUI(category);
  }
  
  const keyword = params.get('q');
  if (keyword) {
    currentKeyword = keyword;
    document.getElementById('searchInput').value = keyword;
  }
}

function performSearch() {
  const input = document.getElementById('searchInput');
  currentKeyword = input.value.trim();
  
  const articles = newsData.articles || [];
  const headlines = newsData.headlines || [];
  
  allResults = [...articles, ...headlines];
  
  if (currentKeyword) {
    const keyword = currentKeyword.toLowerCase();
    allResults = allResults.filter(article => 
      article.title.toLowerCase().includes(keyword) ||
      (article.summary && article.summary.toLowerCase().includes(keyword)) ||
      (article.content && article.content.toLowerCase().includes(keyword)) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(keyword)))
    );
  }
  
  if (currentCategory) {
    allResults = allResults.filter(article => article.category === currentCategory);
  }
  
  if (currentTime) {
    const now = new Date();
    allResults = allResults.filter(article => {
      const date = new Date(article.publishTime);
      const diff = now - date;
      
      switch (currentTime) {
        case 'today':
          return diff < 24 * 60 * 60 * 1000;
        case 'week':
          return diff < 7 * 24 * 60 * 60 * 1000;
        case 'month':
          return diff < 30 * 24 * 60 * 60 * 1000;
        case 'year':
          return diff < 365 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });
  }
  
  applySort();
  
  const keywordDisplay = document.getElementById('searchKeyword');
  keywordDisplay.textContent = currentKeyword ? ` - "${currentKeyword}"` : '';
  
  displayCount = 9;
  
  renderResults();
}

function applySort() {
  switch (currentSort) {
    case 'time':
      allResults.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));
      break;
    case 'views':
      allResults.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      break;
    case 'likes':
      allResults.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      break;
  }
}

function renderResults() {
  const container = document.getElementById('searchResults');
  const emptyState = document.getElementById('emptyState');
  const loadMore = document.getElementById('loadMore');
  const resultCount = document.getElementById('resultCount');
  
  resultCount.textContent = allResults.length;
  
  if (allResults.length === 0) {
    container.classList.add('hidden');
    emptyState.classList.remove('hidden');
    loadMore.classList.add('hidden');
    return;
  }
  
  container.classList.remove('hidden');
  emptyState.classList.add('hidden');
  
  const results = allResults.slice(0, displayCount);
  container.innerHTML = results.map(article => renderArticleCard(article)).join('');
  
  if (displayCount < allResults.length) {
    loadMore.classList.remove('hidden');
  } else {
    loadMore.classList.add('hidden');
  }
}

function renderArticleCard(article) {
  const cat = getCategoryInfo(article.category);
  
  return `
    <a href="detail.html?id=${article.id}" class="news-card bg-white rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div class="h-44 overflow-hidden">
        <img src="${article.image}" alt="${article.title}" class="news-card-image w-full h-full object-cover">
      </div>
      <div class="flex-1 p-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="news-tag text-white text-xs" style="background-color: ${cat.color};">${cat.icon} ${cat.name}</span>
          <span class="time-badge">${formatTime(article.publishTime)}</span>
        </div>
        <h3 class="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-primary transition">${article.title}</h3>
        <p class="text-sm text-gray-500 line-clamp-2 mb-3">${article.summary || ''}</p>
        <div class="flex items-center gap-4 text-xs text-gray-400 mt-auto">
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            ${formatNumber(article.viewCount || 0)}
          </span>
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            ${formatNumber(article.likeCount || 0)}
          </span>
        </div>
      </div>
    </a>
  `;
}

function loadMoreResults() {
  displayCount += 9;
  renderResults();
}

function filterByCategory(category) {
  currentCategory = category;
  updateCategoryUI(category);
  performSearch();
}

function updateCategoryUI(category) {
  document.querySelectorAll('[data-category]').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.category === category) {
      btn.classList.add('active');
    }
  });
}

function filterByTime(time) {
  currentTime = time;
  document.querySelectorAll('[data-time]').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.time === time) {
      btn.classList.add('active');
    }
  });
  performSearch();
}

function filterBySort(sort) {
  currentSort = sort;
  document.querySelectorAll('[data-sort]').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.sort === sort) {
      btn.classList.add('active');
    }
  });
  performSearch();
}

function getCategoryInfo(categoryId) {
  const category = newsData.categories.find(c => c.id === categoryId);
  if (!category) return { name: '其他', icon: '📰', color: '#6b7280' };
  return category;
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return minutes <= 0 ? '刚刚' : minutes + '分钟前';
  }
  
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return hours + '小时前';
  }
  
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return days + '天前';
  }
  
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('hidden');
}
