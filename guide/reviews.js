// ===== 客人评价系统脚本 =====

// 预设标签
const REVIEW_TAGS = [
  '服务好', '专业', '友好', '耐心', '准时', '讲解精彩',
  '负责任', '热情', '幽默', '细心', '周到', '靠谱',
  '经验丰富', '行程合理', '知识渊博', '应变能力强'
];

// 数据管理
const ReviewsData = {
  STORAGE_KEY: 'guide_reviews',
  LIKES_KEY: 'review_likes',
  
  // 获取评价列表
  getReviews() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  // 保存评价
  saveReview(review) {
    const reviews = this.getReviews();
    review.id = Date.now().toString();
    review.createdAt = new Date().toISOString();
    review.likes = 0;
    review.tags = this.extractTags(review.content);
    reviews.unshift(review);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reviews));
    return review;
  },
  
  // 提取标签
  extractTags(content) {
    if (!content) return [];
    const matchedTags = REVIEW_TAGS.filter(tag => content.includes(tag));
    // 随机添加1-2个标签以丰富展示
    if (matchedTags.length === 0 && content.length > 10) {
      const randomTags = REVIEW_TAGS.filter(() => Math.random() > 0.7);
      return [...new Set(randomTags)].slice(0, 2);
    }
    return matchedTags.slice(0, 3);
  },
  
  // 获取点赞记录
  getLikes() {
    const data = localStorage.getItem(this.LIKES_KEY);
    return data ? JSON.parse(data) : {};
  },
  
  // 切换点赞
  toggleLike(reviewId) {
    const likes = this.getLikes();
    const reviews = this.getReviews();
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return false;
    
    if (likes[reviewId]) {
      delete likes[reviewId];
      review.likes = Math.max(0, (review.likes || 0) - 1);
    } else {
      likes[reviewId] = true;
      review.likes = (review.likes || 0) + 1;
    }
    
    localStorage.setItem(this.LIKES_KEY, JSON.stringify(likes));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reviews));
    return !likes[reviewId]; // 返回是否点赞成功
  },
  
  // 检查是否已点赞
  hasLiked(reviewId) {
    return !!this.getLikes()[reviewId];
  },
  
  // 更新评价
  updateReview(id, updates) {
    const reviews = this.getReviews();
    const index = reviews.findIndex(r => r.id === id);
    if (index !== -1) {
      reviews[index] = { ...reviews[index], ...updates };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reviews));
    }
  },
  
  // 删除评价
  deleteReview(id) {
    const likes = this.getLikes();
    delete likes[id];
    localStorage.setItem(this.LIKES_KEY, JSON.stringify(likes));
    const reviews = this.getReviews().filter(r => r.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reviews));
  },
  
  // 获取统计数据
  getStats() {
    const reviews = this.getReviews();
    
    if (reviews.length === 0) {
      return {
        total: 0,
        average: 0,
        goodRate: 0,
        avgService: 0,
        avgProfessional: 0,
        avgItinerary: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
    
    const total = reviews.length;
    const avgService = reviews.reduce((sum, r) => sum + r.serviceScore, 0) / total;
    const avgProfessional = reviews.reduce((sum, r) => sum + r.professionalScore, 0) / total;
    const avgItinerary = reviews.reduce((sum, r) => sum + r.itineraryScore, 0) / total;
    const average = (avgService + avgProfessional + avgItinerary) / 3;
    const goodReviews = reviews.filter(r => r.overallScore >= 4);
    const goodRate = (goodReviews.length / total) * 100;
    
    // 评分分布
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const score = Math.round(r.overallScore);
      if (distribution[score] !== undefined) {
        distribution[score]++;
      }
    });
    
    return {
      total,
      average: average.toFixed(1),
      goodRate: goodRate.toFixed(0),
      avgService: avgService.toFixed(1),
      avgProfessional: avgProfessional.toFixed(1),
      avgItinerary: avgItinerary.toFixed(1),
      distribution
    };
  },
  
  // 获取热门标签
  getPopularTags() {
    const reviews = this.getReviews();
    const tagCount = {};
    
    reviews.forEach(review => {
      (review.tags || []).forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag, count]) => ({ tag, count }));
  },
  
  // 获取每日平均分趋势
  getDailyTrend(days = 7) {
    const reviews = this.getReviews();
    const trend = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayReviews = reviews.filter(r => {
        const reviewDate = new Date(r.createdAt).toISOString().split('T')[0];
        return reviewDate === dateStr;
      });
      
      const avgScore = dayReviews.length > 0 
        ? (dayReviews.reduce((sum, r) => sum + r.overallScore, 0) / dayReviews.length).toFixed(1)
        : null;
      
      trend.push({
        date: dateStr,
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        score: avgScore,
        count: dayReviews.length
      });
    }
    
    return trend;
  }
};

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initReviewsPage();
});

function initReviewsPage() {
  setupEventListeners();
  renderReviews();
  renderStats();
  renderRatingDistribution();
  renderTagsCloud();
  initQRCode();
  initCharts();
}

// 设置事件监听
function setupEventListeners() {
  // 评价提交
  document.getElementById('reviewForm').addEventListener('submit', handleReviewSubmit);
  
  // 筛选标签
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderReviews();
    });
  });
  
  // 高级筛选 - 评分
  document.getElementById('filterRating').addEventListener('change', renderReviews);
  
  // 高级筛选 - 排序
  document.getElementById('filterSort').addEventListener('change', renderReviews);
  
  // 高级筛选 - 图片
  document.getElementById('filterImage').addEventListener('change', renderReviews);
  
  // 导出按钮
  document.getElementById('exportCsvBtn').addEventListener('click', exportToCsv);
  document.getElementById('exportPdfBtn').addEventListener('click', exportToPdf);
}

// 重置筛选
function resetFilters() {
  document.getElementById('filterRating').value = 'all';
  document.getElementById('filterSort').value = 'newest';
  document.getElementById('filterImage').value = 'all';
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.filter-tab[data-filter="all"]').classList.add('active');
  renderReviews();
}

// 获取当前筛选条件
function getCurrentFilters() {
  const activeFilterTab = document.querySelector('.filter-tab.active');
  return {
    type: activeFilterTab ? activeFilterTab.dataset.filter : 'all',
    rating: document.getElementById('filterRating')?.value || 'all',
    sort: document.getElementById('filterSort')?.value || 'newest',
    image: document.getElementById('filterImage')?.value || 'all'
  };
}

// 处理评价提交
function handleReviewSubmit(e) {
  e.preventDefault();
  
  const serviceScore = parseInt(document.querySelector('input[name="serviceScore"]:checked')?.value || 0);
  const professionalScore = parseInt(document.querySelector('input[name="professionalScore"]:checked')?.value || 0);
  const itineraryScore = parseInt(document.querySelector('input[name="itineraryScore"]:checked')?.value || 0);
  
  if (!serviceScore || !professionalScore || !itineraryScore) {
    showToast('请完成所有评分', 'error');
    return;
  }
  
  const review = {
    visitorName: document.getElementById('visitorName').value.trim() || '匿名游客',
    date: document.getElementById('reviewDate').value || new Date().toISOString().split('T')[0],
    serviceScore,
    professionalScore,
    itineraryScore,
    overallScore: ((serviceScore + professionalScore + itineraryScore) / 3).toFixed(1),
    content: document.getElementById('reviewContent').value.trim(),
    isFeatured: false,
    reply: ''
  };
  
  ReviewsData.saveReview(review);
  
  // 重置表单
  e.target.reset();
  document.querySelectorAll('.star-rating').forEach(rating => {
    rating.querySelectorAll('label').forEach(label => label.style.color = '');
  });
  document.getElementById('averageRating').textContent = '0.0';
  
  showToast('评价提交成功，感谢您的反馈！', 'success');
  
  // 重新渲染
  renderReviews();
  renderStats();
  initCharts();
}

// 渲染评价列表
function renderReviews() {
  const container = document.getElementById('reviewsList');
  const filters = getCurrentFilters();
  let reviews = ReviewsData.getReviews();
  
  // 基础筛选
  if (filters.type === 'good') {
    reviews = reviews.filter(r => r.overallScore >= 4.5);
  } else if (filters.type === 'medium') {
    reviews = reviews.filter(r => r.overallScore >= 3 && r.overallScore < 4.5);
  } else if (filters.type === 'bad') {
    reviews = reviews.filter(r => r.overallScore < 3);
  }
  
  // 按评分筛选
  if (filters.rating === '5') {
    reviews = reviews.filter(r => r.overallScore >= 5);
  } else if (filters.rating === '4') {
    reviews = reviews.filter(r => r.overallScore >= 4 && r.overallScore < 5);
  } else if (filters.rating === '3') {
    reviews = reviews.filter(r => r.overallScore < 4);
  }
  
  // 按图片筛选
  if (filters.image === 'withImage') {
    reviews = reviews.filter(r => r.images && r.images.length > 0);
  } else if (filters.image === 'noImage') {
    reviews = reviews.filter(r => !r.images || r.images.length === 0);
  }
  
  // 排序
  switch (filters.sort) {
    case 'oldest':
      reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'highest':
      reviews.sort((a, b) => b.overallScore - a.overallScore);
      break;
    case 'lowest':
      reviews.sort((a, b) => a.overallScore - b.overallScore);
      break;
    case 'mostLiked':
      reviews.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      break;
    default: // newest
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  // 更新筛选计数
  const countEl = document.getElementById('filteredCount');
  if (countEl) {
    countEl.textContent = `(${reviews.length} 条)`;
  }
  
  if (reviews.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📝</div>
        <h3>暂无符合条件的评价</h3>
        <p>尝试调整筛选条件</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = reviews.map(review => {
    const hasLiked = ReviewsData.hasLiked(review.id);
    const reviewTags = review.tags || [];
    
    return `
    <div class="review-card ${review.isFeatured ? 'featured' : ''}" data-id="${review.id}">
      <div class="review-card-header">
        <div class="review-card-info">
          <div class="review-avatar">${review.visitorName.charAt(0)}</div>
          <div>
            <div class="review-author">${review.visitorName}</div>
            <div class="review-date">${formatDate(review.date)}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          ${review.isFeatured ? '<span class="review-badge">精选</span>' : ''}
          <div class="review-stars">${'★'.repeat(Math.round(review.overallScore))}${'☆'.repeat(5 - Math.round(review.overallScore))} ${review.overallScore}</div>
        </div>
      </div>
      <div class="review-card-body">
        <p>${review.content || '该游客未留下文字评价'}</p>
        ${reviewTags.length > 0 ? `
          <div class="review-tags">
            ${reviewTags.map(tag => `<span class="review-tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
      </div>
      <div class="review-card-footer">
        <div class="review-scores">
          <span>服务态度: ${'★'.repeat(review.serviceScore)}</span>
          <span>专业程度: ${'★'.repeat(review.professionalScore)}</span>
          <span>行程安排: ${'★'.repeat(review.itineraryScore)}</span>
        </div>
        <div class="review-actions">
          <button class="btn btn-sm ${hasLiked ? 'btn-liked' : 'btn-like'}" onclick="handleLike('${review.id}')">
            ${hasLiked ? '❤️' : '🤍'} <span class="like-count">${review.likes || 0}</span>
          </button>
          <button class="btn btn-sm btn-secondary" onclick="toggleFeatured('${review.id}')">
            ${review.isFeatured ? '取消精选' : '设为精选'}
          </button>
          <button class="btn btn-sm btn-secondary" onclick="showReplyModal('${review.id}')">回复</button>
          <button class="btn btn-sm btn-danger" onclick="deleteReview('${review.id}')">删除</button>
        </div>
      </div>
      ${review.reply ? `
        <div class="review-reply">
          <div class="reply-header">🏠 导游回复</div>
          <div class="reply-content">${review.reply}</div>
        </div>
      ` : ''}
    </div>
  `}).join('');
}

// 处理点赞
function handleLike(reviewId) {
  const isLiked = ReviewsData.toggleLike(reviewId);
  renderReviews();
  showToast(isLiked ? '已点赞' : '已取消点赞', 'success');
}

// 渲染评分分布
function renderRatingDistribution() {
  const container = document.getElementById('ratingBars');
  const stats = ReviewsData.getStats();
  
  if (!container || stats.total === 0) {
    if (container) {
      container.innerHTML = '<p class="empty-text">暂无评价数据</p>';
    }
    return;
  }
  
  const maxCount = Math.max(...Object.values(stats.distribution), 1);
  const distribution = [5, 4, 3, 2, 1];
  
  container.innerHTML = distribution.map(score => {
    const count = stats.distribution[score] || 0;
    const percent = (count / maxCount) * 100;
    const totalPercent = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
    
    return `
      <div class="rating-bar-row">
        <span class="rating-bar-label">${score}星</span>
        <div class="rating-bar-track">
          <div class="rating-bar-fill rating-${score}" style="width: ${percent}%"></div>
        </div>
        <span class="rating-bar-count">${count} (${totalPercent}%)</span>
      </div>
    `;
  }).join('');
  
  // 更新汇总信息
  document.getElementById('summaryScore').textContent = stats.average;
  document.getElementById('summaryStars').textContent = '★'.repeat(Math.round(stats.average)) + '☆'.repeat(5 - Math.round(stats.average));
  document.getElementById('summaryCount').textContent = stats.total;
}

// 渲染标签云
function renderTagsCloud() {
  const container = document.getElementById('tagsCloud');
  const tags = ReviewsData.getPopularTags();
  
  if (!container) return;
  
  if (tags.length === 0) {
    container.innerHTML = '<p class="empty-text">暂无标签数据</p>';
    return;
  }
  
  const maxCount = Math.max(...tags.map(t => t.count));
  
  container.innerHTML = tags.map(({ tag, count }) => {
    const size = 0.9 + (count / maxCount) * 0.8;
    const opacity = 0.6 + (count / maxCount) * 0.4;
    return `<span class="tag-item" style="font-size: ${size}rem; opacity: ${opacity}" onclick="filterByTag('${tag}')">${tag}</span>`;
  }).join('');
}

// 按标签筛选
function filterByTag(tag) {
  const reviews = ReviewsData.getReviews();
  const matchingReviews = reviews.filter(r => (r.tags || []).includes(tag));
  showToast(`"${tag}" 相关评价: ${matchingReviews.length} 条`, 'success');
}

// 渲染好评墙
function renderFeaturedWall() {
  const container = document.getElementById('featuredWall');
  const reviews = ReviewsData.getReviews().filter(r => r.isFeatured && r.overallScore >= 4.5);
  
  if (reviews.length === 0) {
    container.innerHTML = '<p class="empty-text">暂无精选评价</p>';
    return;
  }
  
  container.innerHTML = reviews.slice(0, 6).map(review => `
    <div class="wall-card">
      <div class="wall-avatar">${review.visitorName.charAt(0)}</div>
      <div class="wall-name">${review.visitorName}</div>
      <div class="wall-stars">${'★'.repeat(Math.round(review.overallScore))}</div>
      <div class="wall-content">${review.content || '该游客未留下文字评价'}</div>
    </div>
  `).join('');
}

// 渲染统计
function renderStats() {
  const stats = ReviewsData.getStats();
  
  document.getElementById('totalReviews').textContent = stats.total;
  document.getElementById('averageScore').textContent = stats.average;
  document.getElementById('goodRate').textContent = stats.goodRate + '%';
  document.getElementById('avgService').textContent = stats.avgService;
  document.getElementById('avgProfessional').textContent = stats.avgProfessional;
  document.getElementById('avgItinerary').textContent = stats.avgItinerary;
  
  renderFeaturedWall();
  renderRatingDistribution();
  renderTagsCloud();
}

// 初始化图表
function initCharts() {
  renderTrendChart();
}

// 评分分布已由 renderRatingDistribution 替代

// 渲染趋势图
function renderTrendChart() {
  const ctx = document.getElementById('trendChart');
  if (!ctx) return;
  
  const trend = ReviewsData.getDailyTrend(7);
  const labels = trend.map(t => t.label);
  const scores = trend.map(t => t.score || 0);
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '平均评分',
        data: scores,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          min: 0,
          max: 5,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

// 初始化二维码
function initQRCode() {
  const container = document.getElementById('reviewQRCode');
  if (!container) return;
  
  container.innerHTML = '';
  
  // 生成评价页面的URL
  const currentPath = window.location.href;
  const baseUrl = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
  const url = baseUrl + 'review-submit.html';
  
  new QRCode(container, {
    text: url,
    width: 160,
    height: 160,
    colorDark: '#667eea',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

// 设为精选
function toggleFeatured(id) {
  const reviews = ReviewsData.getReviews();
  const review = reviews.find(r => r.id === id);
  if (review) {
    ReviewsData.updateReview(id, { isFeatured: !review.isFeatured });
    renderReviews();
    renderStats();
    showToast(review.isFeatured ? '已取消精选' : '已设为精选', 'success');
  }
}

// 显示回复模态框
function showReplyModal(id) {
  const modal = document.getElementById('replyModal');
  const review = ReviewsData.getReviews().find(r => r.id === id);
  
  if (review) {
    document.getElementById('replyContent').value = review.reply || '';
    document.getElementById('replyModal').dataset.id = id;
    modal.classList.add('open');
  }
}

function saveReply() {
  const modal = document.getElementById('replyModal');
  const id = modal.dataset.id;
  const reply = document.getElementById('replyContent').value.trim();
  
  ReviewsData.updateReview(id, { reply });
  modal.classList.remove('open');
  renderReviews();
  showToast('回复已保存', 'success');
}

// 删除评价
function deleteReview(id) {
  if (!confirm('确定要删除这条评价吗？')) return;
  
  ReviewsData.deleteReview(id);
  renderReviews();
  renderStats();
  initCharts();
  showToast('评价已删除', 'success');
}

// 导出CSV
function exportToCsv() {
  const reviews = ReviewsData.getReviews();
  if (reviews.length === 0) {
    showToast('暂无评价可导出', 'error');
    return;
  }
  
  const headers = ['评价人', '日期', '服务态度', '专业程度', '行程安排', '综合评分', '评价内容'];
  const rows = reviews.map(r => [
    r.visitorName,
    r.date,
    r.serviceScore + '星',
    r.professionalScore + '星',
    r.itineraryScore + '星',
    r.overallScore + '分',
    r.content.replace(/,/g, '，')
  ]);
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(csv, 'reviews.csv', 'text/csv');
  showToast('CSV导出成功', 'success');
}

// 导出PDF（打印友好版本）
function exportToPdf() {
  const reviews = ReviewsData.getReviews();
  if (reviews.length === 0) {
    showToast('暂无评价可导出', 'error');
    return;
  }
  
  // 打开打印对话框
  window.print();
}

// 下载文件
function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// 格式化日期
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Toast提示
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

// 关闭模态框
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('open');
}

// 星级评分交互
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.star-rating').forEach(rating => {
    rating.addEventListener('mouseover', e => {
      if (e.target.tagName === 'LABEL') {
        const labels = [...rating.querySelectorAll('label')];
        const index = labels.indexOf(e.target);
        labels.slice(0, index + 1).forEach(l => l.style.color = '#f59e0b');
        labels.slice(index + 1).forEach(l => l.style.color = '');
      }
    });
    
    rating.addEventListener('mouseout', () => {
      const checked = rating.querySelector('input:checked');
      if (checked) {
        const labels = [...rating.querySelectorAll('label')];
        const checkedIndex = labels.findIndex(l => l.htmlFor === checked.id);
        labels.slice(0, checkedIndex + 1).forEach(l => l.style.color = '#f59e0b');
        labels.slice(checkedIndex + 1).forEach(l => l.style.color = '');
      } else {
        rating.querySelectorAll('label').forEach(l => l.style.color = '');
      }
    });
    
    rating.addEventListener('change', () => {
      updateAverageRating();
    });
  });
});

function updateAverageRating() {
  const serviceScore = parseInt(document.querySelector('input[name="serviceScore"]:checked')?.value || 0);
  const professionalScore = parseInt(document.querySelector('input[name="professionalScore"]:checked')?.value || 0);
  const itineraryScore = parseInt(document.querySelector('input[name="itineraryScore"]:checked')?.value || 0);
  
  const avg = ((serviceScore + professionalScore + itineraryScore) / 3).toFixed(1);
  document.getElementById('averageRating').textContent = avg;
}
