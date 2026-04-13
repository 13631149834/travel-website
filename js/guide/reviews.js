// ===== 客人评价系统脚本 =====

// 数据管理
const ReviewsData = {
  STORAGE_KEY: 'guide_reviews',
  
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
    reviews.unshift(review);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reviews));
    return review;
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
      renderReviews(tab.dataset.filter);
    });
  });
  
  // 导出按钮
  document.getElementById('exportCsvBtn').addEventListener('click', exportToCsv);
  document.getElementById('exportPdfBtn').addEventListener('click', exportToPdf);
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
function renderReviews(filter = 'all') {
  const container = document.getElementById('reviewsList');
  let reviews = ReviewsData.getReviews();
  
  // 筛选
  if (filter === 'good') {
    reviews = reviews.filter(r => r.overallScore >= 4.5);
  } else if (filter === 'medium') {
    reviews = reviews.filter(r => r.overallScore >= 3 && r.overallScore < 4.5);
  } else if (filter === 'bad') {
    reviews = reviews.filter(r => r.overallScore < 3);
  }
  
  if (reviews.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📝</div>
        <h3>暂无评价</h3>
        <p>扫码或填写表单获取游客评价</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = reviews.map(review => `
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
      <div class="review-card-body">${review.content || '该游客未留下文字评价'}</div>
      <div class="review-card-footer">
        <div class="review-scores">
          <span>服务态度: ${'★'.repeat(review.serviceScore)}</span>
          <span>专业程度: ${'★'.repeat(review.professionalScore)}</span>
          <span>行程安排: ${'★'.repeat(review.itineraryScore)}</span>
        </div>
        <div class="review-actions">
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
  `).join('');
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
}

// 初始化图表
function initCharts() {
  renderTrendChart();
  renderDistributionChart();
}

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

function renderDistributionChart() {
  const ctx = document.getElementById('distributionChart');
  if (!ctx) return;
  
  const stats = ReviewsData.getStats();
  const data = [5, 4, 3, 2, 1].map(score => stats.distribution[score]);
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['5星', '4星', '3星', '2星', '1星'],
      datasets: [{
        data,
        backgroundColor: ['#10b981', '#22c55e', '#f59e0b', '#f97316', '#ef4444']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
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
