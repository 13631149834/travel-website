/**
 * 用户反馈系统 JavaScript
 * 游导旅游平台 - youdao-travel.com
 */

// 反馈数据存储（本地模拟）
const FeedbackStore = {
  KEY: 'youdao_feedbacks',
  
  // 获取所有反馈
  getAll() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : this.getMockData();
  },
  
  // 保存反馈
  save(feedback) {
    const feedbacks = this.getAll();
    feedbacks.unshift(feedback);
    localStorage.setItem(this.KEY, JSON.stringify(feedbacks));
    return feedback;
  },
  
  // 更新反馈状态
  updateStatus(id, status, reply = null) {
    const feedbacks = this.getAll();
    const index = feedbacks.findIndex(f => f.id === id);
    if (index !== -1) {
      feedbacks[index].status = status;
      if (reply) {
        feedbacks[index].reply = reply;
        feedbacks[index].repliedAt = new Date().toISOString();
      }
      localStorage.setItem(this.KEY, JSON.stringify(feedbacks));
      return feedbacks[index];
    }
    return null;
  },
  
  // 生成唯一ID
  generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `FB-${timestamp}-${random}`.toUpperCase();
  },
  
  // 模拟数据
  getMockData() {
    return [
      {
        id: 'FB-L1K2M3-A4B5C6',
        type: 'bug',
        typeName: 'Bug报告',
        content: 'App在浏览路线详情页时，图片加载很慢，有时会卡住不动。希望能优化图片加载速度。',
        images: [],
        contact: 'zhang***@163.com',
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        reply: null,
        repliedAt: null
      },
      {
        id: 'FB-M4N5O6-P7Q8R9',
        type: 'suggestion',
        typeName: '功能建议',
        content: '希望能增加一个行程分享功能，可以把制定的行程一键分享给同行的小伙伴。',
        images: [],
        contact: '李明 138****5678',
        status: 'processing',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        reply: '感谢您的建议！我们已将此功能加入开发计划，预计下季度上线。',
        repliedAt: new Date(Date.now() - 86400000 * 4).toISOString()
      },
      {
        id: 'FB-S7T8U9-V1W2X3',
        type: 'suggestion',
        typeName: '功能建议',
        content: '希望增加境外支付功能，支持更多国际信用卡和支付宝国际版。',
        images: [],
        contact: 'wang***@gmail.com',
        status: 'resolved',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        reply: '您好！我们的国际支付功能已于上周上线，支持Visa、Mastercard及支付宝国际版，感谢您的建议！',
        repliedAt: new Date(Date.now() - 86400000 * 7).toISOString()
      },
      {
        id: 'FB-Y4Z5A6-B7C8D9',
        type: 'complaint',
        typeName: '投诉',
        content: '导游服务态度很差，行程中擅自更改路线且不提前通知，严重影响旅行体验。',
        images: ['uploaded_image_1.jpg'],
        contact: '陈先生 139****9012',
        status: 'resolved',
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        reply: '非常抱歉给您带来不愉快的体验。我们已对该导游进行批评教育并扣除相应信用分，同时为您提供了一张50元优惠券作为补偿。',
        repliedAt: new Date(Date.now() - 86400000 * 13).toISOString()
      },
      {
        id: 'FB-E1F2G3-H4I5J6',
        type: 'other',
        typeName: '其他',
        content: '平台的旅行攻略内容非常实用，学到了很多知识！希望能继续保持高质量内容输出。',
        images: [],
        contact: '小林同学',
        status: 'resolved',
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        reply: '感谢您的支持与鼓励！我们会继续努力为您提供更多优质内容！',
        repliedAt: new Date(Date.now() - 86400000 * 18).toISOString()
      }
    ];
  }
};

// 统计数据分析
const FeedbackStats = {
  // 按类型统计
  byType() {
    const feedbacks = FeedbackStore.getAll();
    const stats = {
      suggestion: { name: '功能建议', count: 0, color: '#10b981' },
      bug: { name: 'Bug报告', count: 0, color: '#ef4444' },
      complaint: { name: '投诉', count: 0, color: '#f59e0b' },
      other: { name: '其他', count: 0, color: '#6366f1' }
    };
    feedbacks.forEach(f => {
      if (stats[f.type]) stats[f.type].count++;
    });
    return stats;
  },
  
  // 按状态统计
  byStatus() {
    const feedbacks = FeedbackStore.getAll();
    return {
      pending: { name: '待处理', count: feedbacks.filter(f => f.status === 'pending').length },
      processing: { name: '处理中', count: feedbacks.filter(f => f.status === 'processing').length },
      resolved: { name: '已解决', count: feedbacks.filter(f => f.status === 'resolved').length }
    };
  },
  
  // 处理效率统计
  efficiency() {
    const feedbacks = FeedbackStore.getAll().filter(f => f.reply);
    if (feedbacks.length === 0) return { avg: 0, total: 0 };
    
    const totalHours = feedbacks.reduce((sum, f) => {
      const created = new Date(f.createdAt);
      const replied = new Date(f.repliedAt);
      return sum + (replied - created) / 3600000;
    }, 0);
    
    return {
      avg: Math.round(totalHours / feedbacks.length),
      total: feedbacks.length
    };
  },
  
  // 热门问题（关键词）
  hotTopics() {
    const keywords = ['支付', '图片加载', '行程', '导游', '地图', '通知', '优惠券', '客服', '签到', '社区'];
    const feedbacks = FeedbackStore.getAll();
    const counts = {};
    
    keywords.forEach(k => {
      counts[k] = feedbacks.filter(f => 
        f.content.toLowerCase().includes(k.toLowerCase())
      ).length;
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, count }));
  }
};

// 表单验证
const FeedbackValidator = {
  // 验证反馈类型
  validateType(type) {
    const validTypes = ['suggestion', 'bug', 'complaint', 'other'];
    if (!validTypes.includes(type)) {
      return { valid: false, message: '请选择反馈类型' };
    }
    return { valid: true };
  },
  
  // 验证内容
  validateContent(content) {
    if (!content || content.trim().length === 0) {
      return { valid: false, message: '请输入反馈内容' };
    }
    if (content.trim().length < 10) {
      return { valid: false, message: '反馈内容至少需要10个字符' };
    }
    if (content.trim().length > 1000) {
      return { valid: false, message: '反馈内容不能超过1000个字符' };
    }
    return { valid: true };
  },
  
  // 验证联系方式
  validateContact(contact) {
    if (!contact || contact.trim().length === 0) {
      return { valid: false, message: '请输入联系方式' };
    }
    return { valid: true };
  }
};

// Toast 提示
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// 状态徽章
function statusBadge(status) {
  const badges = {
    pending: '<span class="badge badge-warning">待处理</span>',
    processing: '<span class="badge badge-info">处理中</span>',
    resolved: '<span class="badge badge-success">已解决</span>'
  };
  return badges[status] || '';
}

// 类型徽章
function typeBadge(type, name) {
  const colors = {
    suggestion: 'badge-success',
    bug: 'badge-danger',
    complaint: 'badge-warning',
    other: 'badge-secondary'
  };
  return `<span class="badge ${colors[type] || 'badge-secondary'}">${name}</span>`;
}

// ==================== 反馈提交页面 ====================
function initFeedbackPage() {
  const form = document.getElementById('feedbackForm');
  if (!form) return;
  
  // 反馈类型选择
  const typeOptions = form.querySelectorAll('input[name="type"]');
  typeOptions.forEach(option => {
    option.addEventListener('change', () => {
      typeOptions.forEach(opt => opt.closest('.type-card').classList.remove('selected'));
      option.closest('.type-card').classList.add('selected');
    });
  });
  
  // 图片上传预览
  const imageInput = form.querySelector('#feedbackImages');
  const previewContainer = form.querySelector('.image-preview');
  
  if (imageInput) {
    imageInput.addEventListener('change', (e) => {
      const files = e.target.files;
      previewContainer.innerHTML = '';
      
      Array.from(files).slice(0, 3).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const preview = document.createElement('div');
            preview.className = 'preview-item';
            preview.innerHTML = `
              <img src="${e.target.result}" alt="预览">
              <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
            `;
            previewContainer.appendChild(preview);
          };
          reader.readAsDataURL(file);
        }
      });
    });
  }
  
  // 表单提交
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const type = form.querySelector('input[name="type"]:checked')?.value;
    const content = form.querySelector('#feedbackContent')?.value.trim();
    const contact = form.querySelector('#contact')?.value.trim();
    
    // 验证
    const typeResult = FeedbackValidator.validateType(type);
    if (!typeResult.valid) {
      showToast(typeResult.message, 'error');
      return;
    }
    
    const contentResult = FeedbackValidator.validateContent(content);
    if (!contentResult.valid) {
      showToast(contentResult.message, 'error');
      return;
    }
    
    const contactResult = FeedbackValidator.validateContact(contact);
    if (!contactResult.valid) {
      showToast(contactResult.message, 'error');
      return;
    }
    
    // 创建反馈
    const typeNames = {
      suggestion: '功能建议',
      bug: 'Bug报告',
      complaint: '投诉',
      other: '其他'
    };
    
    const feedback = {
      id: FeedbackStore.generateId(),
      type,
      typeName: typeNames[type],
      content,
      images: [],
      contact,
      status: 'pending',
      createdAt: new Date().toISOString(),
      reply: null,
      repliedAt: null
    };
    
    FeedbackStore.save(feedback);
    
    // 显示成功提示和反馈编号
    showToast('反馈提交成功！我们会尽快处理您的反馈。', 'success');
    
    // 显示反馈追踪信息
    const trackingInfo = document.getElementById('trackingInfo');
    if (trackingInfo) {
      trackingInfo.style.display = 'block';
      trackingInfo.querySelector('#trackingId').textContent = feedback.id;
    }
    
    // 重置表单
    form.reset();
    previewContainer.innerHTML = '';
    typeOptions.forEach(opt => opt.closest('.type-card').classList.remove('selected'));
  });
}

// ==================== 管理页面 ====================
function initAdminPage() {
  const container = document.getElementById('feedbackList');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('searchInput');
  const modal = document.getElementById('detailModal');
  
  if (!container) return;
  
  let currentFilter = 'all';
  let searchTerm = '';
  
  // 渲染反馈列表
  function renderList() {
    let feedbacks = FeedbackStore.getAll();
    
    // 筛选
    if (currentFilter !== 'all') {
      feedbacks = feedbacks.filter(f => f.status === currentFilter);
    }
    
    // 搜索
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      feedbacks = feedbacks.filter(f => 
        f.id.toLowerCase().includes(term) ||
        f.content.toLowerCase().includes(term) ||
        f.contact.toLowerCase().includes(term)
      );
    }
    
    if (feedbacks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <p>暂无反馈数据</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = feedbacks.map(f => `
      <div class="feedback-item" data-id="${f.id}">
        <div class="feedback-header">
          <div class="feedback-meta">
            ${typeBadge(f.type, f.typeName)}
            ${statusBadge(f.status)}
            <span class="feedback-id">${f.id}</span>
          </div>
          <span class="feedback-time">${formatDate(f.createdAt)}</span>
        </div>
        <div class="feedback-content">${f.content.substring(0, 150)}${f.content.length > 150 ? '...' : ''}</div>
        <div class="feedback-footer">
          <span class="feedback-contact">📧 ${f.contact}</span>
          <div class="feedback-actions">
            <button class="btn btn-sm btn-outline" onclick="viewDetail('${f.id}')">查看详情</button>
            <button class="btn btn-sm btn-primary" onclick="openReply('${f.id}')">${f.reply ? '查看回复' : '回复'}</button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // 筛选按钮
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderList();
    });
  });
  
  // 搜索
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim();
      renderList();
    });
  }
  
  // 渲染统计卡片
  renderStats();
  
  // 初始渲染
  renderList();
}

// 渲染统计卡片
function renderStats() {
  const statsContainer = document.getElementById('statsCards');
  if (!statsContainer) return;
  
  const typeStats = FeedbackStats.byType();
  const statusStats = FeedbackStats.byStatus();
  const efficiency = FeedbackStats.efficiency();
  
  const total = Object.values(typeStats).reduce((sum, t) => sum + t.count, 0);
  
  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">📊</div>
      <div class="stat-info">
        <div class="stat-value">${total}</div>
        <div class="stat-label">反馈总数</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">⏳</div>
      <div class="stat-info">
        <div class="stat-value">${statusStats.pending.count}</div>
        <div class="stat-label">待处理</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">⚙️</div>
      <div class="stat-info">
        <div class="stat-value">${statusStats.processing.count}</div>
        <div class="stat-label">处理中</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">✅</div>
      <div class="stat-info">
        <div class="stat-value">${statusStats.resolved.count}</div>
        <div class="stat-label">已解决</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">⏱️</div>
      <div class="stat-info">
        <div class="stat-value">${efficiency.avg}h</div>
        <div class="stat-label">平均处理时间</div>
      </div>
    </div>
  `;
}

// 查看详情
function viewDetail(id) {
  const feedbacks = FeedbackStore.getAll();
  const feedback = feedbacks.find(f => f.id === id);
  if (!feedback) return;
  
  const modal = document.getElementById('detailModal');
  const content = document.getElementById('detailContent');
  
  content.innerHTML = `
    <div class="detail-header">
      <div class="detail-meta">
        ${typeBadge(feedback.type, feedback.typeName)}
        ${statusBadge(feedback.status)}
        <span class="detail-id">${feedback.id}</span>
      </div>
      <div class="detail-time">提交时间: ${new Date(feedback.createdAt).toLocaleString('zh-CN')}</div>
    </div>
    <div class="detail-body">
      <h4>反馈内容</h4>
      <p class="detail-text">${feedback.content}</p>
      ${feedback.images && feedback.images.length > 0 ? `
        <div class="detail-images">
          <h4>附件图片</h4>
          <div class="images-grid">
            ${feedback.images.map(img => `<img src="${img}" alt="附件">`).join('')}
          </div>
        </div>
      ` : ''}
      <div class="detail-contact">
        <h4>联系方式</h4>
        <p>${feedback.contact}</p>
      </div>
      ${feedback.reply ? `
        <div class="detail-reply">
          <h4>官方回复</h4>
          <p>${feedback.reply}</p>
          <div class="reply-time">回复时间: ${new Date(feedback.repliedAt).toLocaleString('zh-CN')}</div>
        </div>
      ` : ''}
    </div>
    <div class="detail-footer">
      <button class="btn btn-outline" onclick="closeModal()">关闭</button>
      <button class="btn btn-primary" onclick="openReply('${id}')">${feedback.reply ? '修改回复' : '回复反馈'}</button>
    </div>
  `;
  
  modal.style.display = 'block';
}

// 打开回复弹窗
function openReply(id) {
  const feedbacks = FeedbackStore.getAll();
  const feedback = feedbacks.find(f => f.id === id);
  if (!feedback) return;
  
  const modal = document.getElementById('replyModal');
  const form = document.getElementById('replyForm');
  
  document.getElementById('replyFeedbackId').textContent = id;
  document.getElementById('replyContent').value = feedback.reply || '';
  
  form.onsubmit = (e) => {
    e.preventDefault();
    const replyText = document.getElementById('replyContent').value.trim();
    
    if (!replyText) {
      showToast('请输入回复内容', 'error');
      return;
    }
    
    const status = document.querySelector('input[name="replyStatus"]:checked')?.value || 'resolved';
    FeedbackStore.updateStatus(id, status, replyText);
    
    showToast('回复成功！', 'success');
    closeModal();
    closeReplyModal();
    renderList();
    renderStats();
  };
  
  modal.style.display = 'block';
}

// 关闭弹窗
function closeModal() {
  document.getElementById('detailModal').style.display = 'none';
}

function closeReplyModal() {
  document.getElementById('replyModal').style.display = 'none';
}

// ==================== 快速反馈悬浮组件 ====================
function initQuickFeedback() {
  // 创建悬浮按钮
  const fab = document.createElement('div');
  fab.className = 'quick-feedback-fab';
  fab.innerHTML = `
    <button class="fab-btn" id="quickFeedbackBtn" aria-label="快速反馈">
      <span class="fab-icon">💬</span>
    </button>
    <div class="fab-menu">
      <button class="fab-menu-item" onclick="openQuickFeedback('suggestion')" title="功能建议">💡</button>
      <button class="fab-menu-item" onclick="openQuickFeedback('bug')" title="报告Bug">🐛</button>
      <button class="fab-menu-item" onclick="openQuickFeedback('complaint')" title="投诉">😡</button>
    </div>
  `;
  document.body.appendChild(fab);
  
  // 展开/收起菜单
  fab.querySelector('#quickFeedbackBtn').addEventListener('click', () => {
    fab.classList.toggle('expanded');
  });
  
  // 点击其他地方关闭
  document.addEventListener('click', (e) => {
    if (!fab.contains(e.target)) {
      fab.classList.remove('expanded');
    }
  });
}

// 打开快速反馈
function openQuickFeedback(type) {
  const typeNames = {
    suggestion: '功能建议',
    bug: 'Bug报告',
    complaint: '投诉'
  };
  
  const modal = document.createElement('div');
  modal.className = 'quick-modal';
  modal.innerHTML = `
    <div class="quick-modal-content">
      <div class="quick-modal-header">
        <h3>快速反馈 - ${typeNames[type]}</h3>
        <button class="close-btn" onclick="this.closest('.quick-modal').remove()">×</button>
      </div>
      <form class="quick-form" onsubmit="submitQuickFeedback(event, '${type}')">
        <textarea id="quickContent" placeholder="请简要描述您的问题或建议..." required></textarea>
        <div class="quick-form-footer">
          <input type="text" id="quickContact" placeholder="联系方式（选填）" class="quick-contact">
          <button type="submit" class="btn btn-primary">提交</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  
  modal.querySelector('textarea').focus();
  
  // 点击遮罩关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// 提交快速反馈
function submitQuickFeedback(e, type) {
  e.preventDefault();
  
  const modal = e.target.closest('.quick-modal');
  const content = modal.querySelector('#quickContent').value.trim();
  const contact = modal.querySelector('#quickContact').value.trim() || '匿名用户';
  
  if (!content) {
    showToast('请输入反馈内容', 'error');
    return;
  }
  
  const typeNames = {
    suggestion: '功能建议',
    bug: 'Bug报告',
    complaint: '投诉'
  };
  
  const feedback = {
    id: FeedbackStore.generateId(),
    type,
    typeName: typeNames[type],
    content,
    images: [],
    contact,
    status: 'pending',
    createdAt: new Date().toISOString(),
    reply: null,
    repliedAt: null
  };
  
  FeedbackStore.save(feedback);
  
  modal.remove();
  document.querySelector('.quick-feedback-fab')?.classList.remove('expanded');
  
  showToast(`反馈已提交！编号: ${feedback.id}`, 'success');
}

// ==================== 反馈追踪页面 ====================
function initTrackingPage() {
  const form = document.getElementById('trackingForm');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = form.querySelector('#trackingId').value.trim().toUpperCase();
    const feedbacks = FeedbackStore.getAll();
    const feedback = feedbacks.find(f => f.id === id);
    
    const resultContainer = document.getElementById('trackingResult');
    
    if (!feedback) {
      resultContainer.innerHTML = `
        <div class="tracking-error">
          <div class="error-icon">🔍</div>
          <p>未找到编号为 ${id} 的反馈记录</p>
          <small>请确认反馈编号是否正确</small>
        </div>
      `;
      resultContainer.style.display = 'block';
      return;
    }
    
    const statusSteps = {
      pending: ['active', '', ''],
      processing: ['completed', 'active', ''],
      resolved: ['completed', 'completed', 'completed']
    };
    
    const steps = statusSteps[feedback.status];
    
    resultContainer.innerHTML = `
      <div class="tracking-card">
        <div class="tracking-header">
          <div class="tracking-id">${feedback.id}</div>
          ${statusBadge(feedback.status)}
        </div>
        <div class="tracking-progress">
          <div class="progress-step ${steps[0]}">
            <div class="step-icon">📝</div>
            <div class="step-label">已提交</div>
          </div>
          <div class="progress-line ${steps[1] !== '' ? 'active' : ''}"></div>
          <div class="progress-step ${steps[1]}">
            <div class="step-icon">⚙️</div>
            <div class="step-label">处理中</div>
          </div>
          <div class="progress-line ${steps[2] === 'completed' ? 'active' : ''}"></div>
          <div class="progress-step ${steps[2]}">
            <div class="step-icon">✅</div>
            <div class="step-label">已完成</div>
          </div>
        </div>
        <div class="tracking-detail">
          <div class="detail-row">
            <span class="label">类型：</span>
            <span>${typeBadge(feedback.type, feedback.typeName)}</span>
          </div>
          <div class="detail-row">
            <span class="label">提交时间：</span>
            <span>${new Date(feedback.createdAt).toLocaleString('zh-CN')}</span>
          </div>
          <div class="detail-row">
            <span class="label">内容：</span>
            <span class="content-text">${feedback.content}</span>
          </div>
          ${feedback.reply ? `
            <div class="detail-row reply-row">
              <span class="label">官方回复：</span>
              <span class="reply-text">${feedback.reply}</span>
              <span class="reply-time">${new Date(feedback.repliedAt).toLocaleString('zh-CN')}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    resultContainer.style.display = 'block';
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initFeedbackPage();
  initAdminPage();
  initTrackingPage();
  
  // 非管理页面加载快速反馈组件
  if (!document.getElementById('feedbackList')) {
    initQuickFeedback();
  }
});

// 导出函数供外部调用
window.viewDetail = viewDetail;
window.openReply = openReply;
window.closeModal = closeModal;
window.closeReplyModal = closeReplyModal;
window.renderList = renderList;
window.renderStats = renderStats;
window.openQuickFeedback = openQuickFeedback;
