// 旅游资讯中心 JavaScript
// =========================

let newsData = null;
let currentSlide = 0;
let slideInterval = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
  await loadNewsData();
  initCarousel();
  renderCategories();
  renderLatestNews();
  renderHotNews();
  startAutoSlide();
});

// 加载新闻数据
async function loadNewsData() {
  try {
    const response = await fetch('../data/news.json');
    newsData = await response.json();
  } catch (error) {
    console.error('加载新闻数据失败:', error);
    newsData = { categories: [], headlines: [], articles: [] };
  }
}

// 格式化时间
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

// 格式化数字
function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

// 获取分类信息
function getCategoryInfo(categoryId) {
  const category = newsData.categories.find(c => c.id === categoryId);
  if (!category) return { name: '其他', icon: '📰', color: '#6b7280' };
  return category;
}

// 初始化轮播
function initCarousel() {
  const slidesContainer = document.getElementById('headlineSlides');
  const dotsContainer = document.getElementById('headlineDots');
  
  if (!slidesContainer || !newsData.headlines) return;
  
  const headlines = newsData.headlines;
  
  slidesContainer.innerHTML = headlines.map((item, index) => `
    <a href="detail.html?id=${item.id}" class="block relative">
      <div class="relative h-64 md:h-80 lg:h-96">
        <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          ${item.hot ? '<span class="inline-block px-3 py-1 bg-red-500 text-white text-xs rounded-full mb-3">🔥 热门</span>' : ''}
          <h3 class="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">${item.title}</h3>
          <p class="text-white/80 text-sm line-clamp-2 hidden md:block">${item.summary}</p>
          <div class="flex items-center gap-4 mt-3">
            <span class="news-tag bg-white/20 text-white text-xs">${getCategoryInfo(item.category).icon} ${getCategoryInfo(item.category).name}</span>
            <span class="text-white/60 text-sm">${formatTime(item.publishTime)}</span>
          </div>
        </div>
      </div>
    </a>
  `).join('');
  
  dotsContainer.innerHTML = headlines.map((_, index) => `
    <button onclick="goToSlide(${index})" class="headline-dot ${index === 0 ? 'active' : ''}" aria-label="切换到第${index + 1}张"></button>
  `).join('');
  
  if (slidesContainer.firstChild) {
    slidesContainer.firstChild.classList.add('active');
  }
}

function goToSlide(index) {
  const slides = document.querySelectorAll('#headlineSlides > a');
  const dots = document.querySelectorAll('.headline-dot');
  
  if (slides.length === 0) return;
  
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  currentSlide = index;
  if (currentSlide >= slides.length) currentSlide = 0;
  if (currentSlide < 0) currentSlide = slides.length - 1;
  
  slides[currentSlide].classList.add('active');
  if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

function startAutoSlide() {
  slideInterval = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const carousel = document.querySelector('.headline-carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', stopAutoSlide);
    carousel.addEventListener('mouseleave', startAutoSlide);
  }
});

function renderCategories() {
  const container = document.getElementById('categoriesGrid');
  if (!container || !newsData.categories) return;
  
  container.innerHTML = newsData.categories.map(cat => `
    <a href="search.html?category=${cat.id}" class="news-category-card bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-lg">
      <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl" style="background-color: ${cat.color}15;">
        ${cat.icon}
      </div>
      <h3 class="font-semibold text-gray-800 mb-1">${cat.name}</h3>
      <p class="text-xs text-gray-500 line-clamp-2">${cat.description}</p>
    </a>
  `).join('');
}

function renderLatestNews() {
  const container = document.getElementById('latestNews');
  if (!container || !newsData.articles) return;
  
  const latest = newsData.articles.slice(0, 6);
  
  container.innerHTML = latest.map(article => {
    const cat = getCategoryInfo(article.category);
    return `
      <a href="detail.html?id=${article.id}" class="news-card bg-white rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
        <div class="md:w-48 h-40 md:h-auto overflow-hidden">
          <img src="${article.image}" alt="${article.title}" class="news-card-image w-full h-full object-cover">
        </div>
        <div class="flex-1 p-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="news-tag text-white text-xs" style="background-color: ${cat.color};">${cat.icon} ${cat.name}</span>
            <span class="time-badge">${formatTime(article.publishTime)}</span>
          </div>
          <h3 class="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-primary transition">${article.title}</h3>
          <p class="text-sm text-gray-500 line-clamp-2">${article.summary}</p>
          <div class="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              ${formatNumber(article.viewCount)}
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              ${formatNumber(article.likeCount)}
            </span>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

function renderHotNews() {
  const container = document.getElementById('hotNews');
  if (!container || !newsData.articles) return;
  
  const hotNews = [...newsData.articles].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  
  container.innerHTML = hotNews.map((article, index) => {
    const cat = getCategoryInfo(article.category);
    return `
      <a href="detail.html?id=${article.id}" class="flex gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition group">
        <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
          index === 0 ? 'bg-red-500 text-white' :
          index === 1 ? 'bg-orange-500 text-white' :
          index === 2 ? 'bg-yellow-500 text-white' :
          'bg-gray-100 text-gray-600'
        }">
          ${index + 1}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs" style="color: ${cat.color};">${cat.icon} ${cat.name}</span>
            <span class="text-xs text-gray-400">${formatTime(article.publishTime)}</span>
          </div>
          <h4 class="font-medium text-gray-800 line-clamp-1 group-hover:text-primary transition">${article.title}</h4>
          <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>👁️ ${formatNumber(article.viewCount)}</span>
            <span>❤️ ${formatNumber(article.likeCount)}</span>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('hidden');
}

function toggleSearch() {
  const modal = document.getElementById('searchModal');
  modal.classList.remove('hidden');
  document.getElementById('searchInput').focus();
}

function closeSearch() {
  const modal = document.getElementById('searchModal');
  modal.classList.add('hidden');
}

function searchKeyword(keyword) {
  window.location.href = `search.html?q=${encodeURIComponent(keyword)}`;
}

function goSearch() {
  const input = document.getElementById('searchInput');
  if (input.value.trim()) {
    window.location.href = `search.html?q=${encodeURIComponent(input.value.trim())}`;
  }
}

document.addEventListener('click', function(e) {
  const modal = document.getElementById('searchModal');
  if (e.target === modal) {
    closeSearch();
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeSearch();
  }
});

window.NewsApp = {
  getNewsData: () => newsData,
  formatTime,
  formatNumber,
  getCategoryInfo
};
