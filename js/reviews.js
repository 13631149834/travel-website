/**
 * 游导旅游 - 用户评论系统
 * Reviews System for Youdao Travel
 */

class ReviewsSystem {
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.dataUrl = options.dataUrl || './data/reviews.json';
    this.pageSize = options.pageSize || 10;
    this.currentPage = 1;
    this.currentFilter = 'all';
    this.currentSort = 'newest';
    this.reviews = [];
    this.statistics = null;
    this.myReviews = [];
    
    this.init();
  }

  async init() {
    await this.loadData();
    this.bindEvents();
  }

  async loadData() {
    try {
      const response = await fetch(this.dataUrl);
      const data = await response.json();
      this.reviews = data.reviews;
      this.statistics = data.statistics;
      this.myReviews = data.myReviews || [];
      this.allTags = data.tags || [];
    } catch (error) {
      console.error('Failed to load reviews data:', error);
      this.showToast('加载评论数据失败', 'error');
    }
  }

  bindEvents() {
    // 星级评分交互
    document.querySelectorAll('.star-rating-input').forEach(container => {
      const stars = container.querySelectorAll('.star');
      stars.forEach((star, index) => {
        star.addEventListener('click', () => this.handleStarClick(stars, index));
        star.addEventListener('mouseenter', () => this.handleStarHover(stars, index));
        star.addEventListener('mouseleave', () => this.resetStarDisplay(stars));
      });
    });

    // 图片上传
    const uploadBtn = document.querySelector('.upload-btn');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => this.triggerImageUpload());
    }

    // 提交评论
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => this.handleSubmit(e));
    }

    // 分页
    document.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = e.target.dataset.page;
        if (page) this.goToPage(parseInt(page));
      });
    });

    // 筛选标签
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.currentFilter = e.target.dataset.filter;
        this.updateFilterTabs();
        this.renderReviewsList();
      });
    });

    // 排序
    const sortSelect = document.querySelector('.sort-controls select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.renderReviewsList();
      });
    }

    // 举报模态框
    this.setupReportModal();
  }

  // 星级评分交互
  handleStarClick(stars, index) {
    stars.forEach((star, i) => {
      star.classList.toggle('active', i <= index);
    });
    const rating = index + 1;
    const input = stars[0].closest('.star-rating-input')?.querySelector('input');
    if (input) input.value = rating;
  }

  handleStarHover(stars, index) {
    stars.forEach((star, i) => {
      if (i <= index) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }

  resetStarDisplay(stars) {
    const activeIndex = this.getActiveStarIndex(stars);
    stars.forEach((star, i) => {
      star.classList.toggle('active', i <= activeIndex);
    });
  }

  getActiveStarIndex(stars) {
    for (let i = stars.length - 1; i >= 0; i--) {
      if (stars[i].classList.contains('active')) return i;
    }
    return -1;
  }

  // 图片上传
  triggerImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.addEventListener('change', (e) => this.handleImageSelect(e));
    input.click();
  }

  handleImageSelect(event) {
    const files = event.target.files;
    const container = document.querySelector('.image-upload');
    const uploadBtn = container.querySelector('.upload-btn');

    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('图片大小不能超过5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.createElement('div');
        preview.className = 'upload-preview';
        preview.innerHTML = `
          <img src="${e.target.result}" alt="预览">
          <button class="remove-btn" title="移除">×</button>
        `;
        preview.querySelector('.remove-btn').addEventListener('click', () => {
          preview.remove();
        });
        container.insertBefore(preview, uploadBtn);
      };
      reader.readAsDataURL(file);
    });
  }

  // 提交评论
  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target.closest('.review-form');
    const rating = parseInt(form.querySelector('input[name="rating"]')?.value) || 0;
    const content = form.querySelector('textarea[name="content"]')?.value?.trim() || '';

    if (rating === 0) {
      this.showToast('请选择评分', 'error');
      return;
    }

    if (content.length < 10) {
      this.showToast('评论内容至少10个字', 'error');
      return;
    }

    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '提交中...';

    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1500));

    this.showToast('评论提交成功，等待审核', 'success');
    submitBtn.disabled = false;
    submitBtn.textContent = '提交评价';

    // 重置表单
    form.reset();
    form.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
    form.querySelectorAll('.upload-preview').forEach(preview => preview.remove());
  }

  // 筛选与排序
  getFilteredReviews() {
    let filtered = [...this.reviews];

    // 筛选
    if (this.currentFilter !== 'all') {
      const rating = parseInt(this.currentFilter);
      filtered = filtered.filter(r => r.rating === rating);
    }

    // 排序
    switch (this.currentSort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'hottest':
        filtered.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }

    return filtered;
  }

  updateFilterTabs() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.filter === this.currentFilter);
    });
  }

  // 分页
  goToPage(page) {
    this.currentPage = page;
    this.renderReviewsList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPaginatedReviews() {
    const filtered = this.getFilteredReviews();
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return {
      reviews: filtered.slice(start, end),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / this.pageSize)
    };
  }

  // 渲染方法
  renderStatistics() {
    if (!this.statistics) return;

    const { totalReviews, averageRating, ratingDistribution, categoryRatings } = this.statistics;
    const total = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);

    // 渲染综合评分
    const scoreEl = document.querySelector('.overall-score');
    if (scoreEl) {
      scoreEl.innerHTML = `
        <div class="score-number">${averageRating.toFixed(1)}</div>
        ${this.renderStars(Math.round(averageRating))}
        <div class="score-label">${totalReviews} 条评价</div>
      `;
    }

    // 渲染评分分布
    const distEl = document.querySelector('.rating-distribution');
    if (distEl) {
      let barsHtml = '';
      for (let i = 5; i >= 1; i--) {
        const count = ratingDistribution[i] || 0;
        const percent = total > 0 ? (count / total * 100).toFixed(0) : 0;
        barsHtml += `
          <div class="rating-bar">
            <span class="star-label">${i}星 ${this.renderStars(i, true)}</span>
            <div class="bar-container">
              <div class="bar-fill" style="width: ${percent}%"></div>
            </div>
            <span class="count">${count}</span>
          </div>
        `;
      }
      distEl.innerHTML = `
        <h3>评分分布</h3>
        ${barsHtml}
        <div class="category-ratings">
          ${Object.entries(categoryRatings).map(([key, value]) => `
            <div class="category-item">
              <div class="category-name">${this.getCategoryName(key)}</div>
              <div class="category-score">${value.toFixed(1)}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  renderReviewsList() {
    const container = document.querySelector('.reviews-list');
    if (!container) return;

    const { reviews, totalPages } = this.getPaginatedReviews();

    if (reviews.length === 0) {
      container.innerHTML = this.renderEmptyState();
      this.renderPagination(0, totalPages);
      return;
    }

    container.innerHTML = reviews.map(review => this.renderReviewCard(review)).join('');
    this.renderPagination(this.currentPage, totalPages);
    this.bindReviewCardEvents();
  }

  renderReviewCard(review) {
    const date = new Date(review.createdAt);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const avatarText = review.userName.charAt(0);
    
    return `
      <div class="review-card" data-id="${review.id}">
        <div class="review-card-header">
          <div class="review-author">
            <div class="author-avatar">${avatarText}</div>
            <div class="author-info">
              <div class="author-name">${review.userName}</div>
              <div class="review-meta">
                ${this.renderStars(review.rating, true)}
                <span>${formattedDate}</span>
              </div>
            </div>
          </div>
          <div class="review-actions">
            <button class="action-btn helpful-btn" data-action="helpful" title="觉得有用">
              <span>👍</span>
              <span class="helpful-count">${review.helpfulCount}</span>
            </button>
            <button class="action-btn" data-action="report" title="举报">
              <span>⚠️</span>
            </button>
          </div>
        </div>
        <div class="review-content">
          <p class="review-text">${review.content}</p>
          ${review.tags && review.tags.length > 0 ? `
            <div class="review-tags">
              ${review.tags.map(tag => `<span class="review-tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
        ${review.images && review.images.length > 0 ? `
          <div class="review-images">
            ${review.images.map(img => `<img class="review-image" src="${img}" alt="评论图片" loading="lazy">`).join('')}
          </div>
        ` : ''}
        <div class="review-footer">
          <span class="review-date">发布于 ${formattedDate}</span>
          <div class="review-helpful">
            <button class="helpful-btn" data-action="vote">
              <span>👍</span>
              <span class="helpful-count">${review.helpfulCount}</span> 人觉得有用
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderPagination(currentPage, totalPages) {
    const container = document.querySelector('.pagination');
    if (!container || totalPages <= 1) {
      if (container) container.innerHTML = '';
      return;
    }

    let html = '';
    
    // 上一页
    html += `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;
    
    // 页码
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }
    } else {
      // 第一页
      html += `<button class="page-btn ${1 === currentPage ? 'active' : ''}" data-page="1">1</button>`;
      
      if (currentPage > 3) {
        html += `<span class="page-ellipsis">...</span>`;
      }
      
      // 中间页
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }
      
      if (currentPage < totalPages - 2) {
        html += `<span class="page-ellipsis">...</span>`;
      }
      
      // 最后一页
      html += `<button class="page-btn ${totalPages === currentPage ? 'active' : ''}" data-page="${totalPages}">${totalPages}</button>`;
    }
    
    // 下一页
    html += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;
    
    container.innerHTML = html;
  }

  renderStars(rating, isDisplay = false) {
    const className = isDisplay ? 'star-display' : 'star-rating-input';
    let html = `<div class="star-rating ${className}">`;
    for (let i = 1; i <= 5; i++) {
      const active = i <= rating ? 'active' : '';
      html += `<span class="star ${active}" data-value="${i}">★</span>`;
    }
    html += '</div>';
    return html;
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <h3>暂无评价</h3>
        <p>成为第一个评价的人吧</p>
      </div>
    `;
  }

  renderMyReviews() {
    const container = document.querySelector('.reviews-list');
    if (!container) return;

    if (this.myReviews.length === 0) {
      container.innerHTML = this.renderEmptyState();
      return;
    }

    container.innerHTML = this.myReviews.map(review => this.renderMyReviewCard(review)).join('');
    this.bindMyReviewEvents();
  }

  renderMyReviewCard(review) {
    const date = new Date(review.createdAt);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    const statusClass = review.status;
    const statusText = {
      approved: '已发布',
      pending: '待审核',
      rejected: '已驳回'
    }[review.status] || review.status;

    return `
      <div class="review-card my-review-card" data-id="${review.id}">
        <div class="guide-info">
          <div class="author-avatar">${review.guideName.charAt(0)}</div>
          <div class="author-info">
            <div class="guide-name">导游：${review.guideName}</div>
            <div class="guide-route">${review.routeName}</div>
          </div>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="review-rating">
          ${this.renderStars(review.rating, true)}
        </div>
        <div class="review-content">
          <p class="review-text">${review.content}</p>
        </div>
        <div class="review-footer">
          <span class="review-date">${formattedDate}</span>
          <span class="helpful-count">👍 ${review.helpfulCount} 人觉得有用</span>
        </div>
        ${review.status !== 'rejected' ? `
          <div class="review-manage-actions">
            <button class="manage-btn edit" data-action="edit">
              <span>✏️</span> 编辑
            </button>
            <button class="manage-btn delete" data-action="delete">
              <span>🗑️</span> 删除
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 事件绑定
  bindReviewCardEvents() {
    document.querySelectorAll('.review-card').forEach(card => {
      const helpfulBtn = card.querySelector('[data-action="helpful"]');
      const voteBtn = card.querySelector('[data-action="vote"]');
      const reportBtn = card.querySelector('[data-action="report"]');

      if (helpfulBtn) {
        helpfulBtn.addEventListener('click', () => this.handleHelpful(card.dataset.id, helpfulBtn));
      }

      if (voteBtn) {
        voteBtn.addEventListener('click', () => this.handleHelpful(card.dataset.id, voteBtn));
      }

      if (reportBtn) {
        reportBtn.addEventListener('click', () => this.openReportModal(card.dataset.id));
      }
    });

    // 图片点击放大
    document.querySelectorAll('.review-image').forEach(img => {
      img.addEventListener('click', () => this.showImageModal(img.src));
    });
  }

  bindMyReviewEvents() {
    document.querySelectorAll('.my-review-card').forEach(card => {
      const editBtn = card.querySelector('[data-action="edit"]');
      const deleteBtn = card.querySelector('[data-action="delete"]');

      if (editBtn) {
        editBtn.addEventListener('click', () => this.handleEdit(card.dataset.id));
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => this.openDeleteConfirm(card.dataset.id));
      }
    });
  }

  // 操作处理
  handleHelpful(reviewId, btn) {
    const countEl = btn.querySelector('.helpful-count');
    if (btn.classList.contains('voted')) {
      btn.classList.remove('voted');
      countEl.textContent = parseInt(countEl.textContent) - 1;
    } else {
      btn.classList.add('voted');
      countEl.textContent = parseInt(countEl.textContent) + 1;
    }
  }

  openReportModal(reviewId) {
    const modal = document.querySelector('.report-modal');
    if (modal) {
      modal.classList.add('show');
      modal.dataset.reviewId = reviewId;
    }
  }

  closeReportModal() {
    const modal = document.querySelector('.report-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  setupReportModal() {
    const modal = document.querySelector('.report-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.btn-cancel');
    const submitBtn = modal.querySelector('.btn-confirm');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeReportModal());
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const selectedReason = modal.querySelector('input[name="reason"]:checked');
        if (!selectedReason) {
          this.showToast('请选择举报原因', 'error');
          return;
        }
        this.submitReport(modal.dataset.reviewId, selectedReason.value);
        this.closeReportModal();
      });
    }

    // 点击外部关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeReportModal();
    });
  }

  submitReport(reviewId, reason) {
    console.log('Report submitted:', { reviewId, reason });
    this.showToast('举报已提交，感谢您的反馈', 'success');
  }

  handleEdit(reviewId) {
    const review = this.myReviews.find(r => r.id === reviewId);
    if (review) {
      // 填充表单
      const form = document.querySelector('.review-form');
      if (form) {
        form.querySelector('textarea[name="content"]').value = review.content;
        // 设置星级
        const stars = form.querySelectorAll('.star');
        stars.forEach((star, i) => {
          star.classList.toggle('active', i < review.rating);
        });
        // 滚动到表单
        form.scrollIntoView({ behavior: 'smooth' });
        this.showToast('已加载评论内容，请修改后提交', 'success');
      }
    }
  }

  openDeleteConfirm(reviewId) {
    const modal = document.querySelector('.confirm-modal');
    if (modal) {
      modal.classList.add('show');
      modal.dataset.reviewId = reviewId;
    }
  }

  closeDeleteConfirm() {
    const modal = document.querySelector('.confirm-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  handleDelete(reviewId) {
    this.myReviews = this.myReviews.filter(r => r.id !== reviewId);
    this.closeDeleteConfirm();
    this.renderMyReviews();
    this.showToast('评论已删除', 'success');
  }

  showImageModal(src) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      cursor: zoom-out;
    `;
    modal.innerHTML = `<img src="${src}" style="max-width: 90%; max-height: 90%; object-fit: contain;">`;
    modal.addEventListener('click', () => modal.remove());
    document.body.appendChild(modal);
  }

  // 工具方法
  getCategoryName(key) {
    const names = {
      professionalism: '专业度',
      service: '服务态度',
      knowledge: '讲解质量',
      punctuality: '准时守时'
    };
    return names[key] || key;
  }

  showToast(message, type = 'info') {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// 评论表单组件
class ReviewForm {
  constructor(container) {
    this.container = container;
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const form = this.container.querySelector('.review-form');
    if (!form) return;

    // 文字计数
    const textarea = form.querySelector('textarea');
    if (textarea) {
      textarea.addEventListener('input', () => {
        const count = textarea.value.length;
        const counter = form.querySelector('.char-count');
        if (counter) {
          counter.textContent = `${count}/500`;
          counter.style.color = count > 500 ? 'var(--danger-color)' : 'var(--gray-400)';
        }
      });
    }

    // 分类评分
    const categoryStars = this.container.querySelectorAll('.category-rating-item .star');
    categoryStars.forEach(star => {
      star.addEventListener('click', () => {
        const item = star.closest('.category-rating-item');
        const stars = item.querySelectorAll('.star');
        const rating = parseInt(star.dataset.value);
        stars.forEach((s, i) => {
          s.classList.toggle('active', i < rating);
        });
      });
    });
  }

  validate() {
    const form = this.container.querySelector('.review-form');
    const rating = form.querySelector('input[name="rating"]')?.value;
    const content = form.querySelector('textarea[name="content"]')?.value?.trim();

    if (!rating) {
      this.showError('请选择总体评分');
      return false;
    }

    if (!content || content.length < 10) {
      this.showError('评论内容至少10个字');
      return false;
    }

    if (content.length > 500) {
      this.showError('评论内容不能超过500字');
      return false;
    }

    return true;
  }

  getFormData() {
    const form = this.container.querySelector('.review-form');
    return {
      rating: parseInt(form.querySelector('input[name="rating"]')?.value) || 0,
      content: form.querySelector('textarea[name="content"]')?.value?.trim() || '',
      images: Array.from(form.querySelectorAll('.upload-preview img')).map(img => img.src)
    };
  }

  reset() {
    const form = this.container.querySelector('.review-form');
    form.reset();
    form.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
    form.querySelectorAll('.upload-preview').forEach(preview => preview.remove());
    const counter = form.querySelector('.char-count');
    if (counter) counter.textContent = '0/500';
  }

  showError(message) {
    const error = document.createElement('div');
    error.className = 'form-error';
    error.style.cssText = 'color: var(--danger-color); font-size: 13px; margin-top: 8px;';
    error.textContent = message;
    
    const existingError = this.container.querySelector('.form-error');
    if (existingError) existingError.remove();
    
    this.container.querySelector('.review-form').appendChild(error);
    setTimeout(() => error.remove(), 3000);
  }
}

// 导出
window.ReviewsSystem = ReviewsSystem;
window.ReviewForm = ReviewForm;
