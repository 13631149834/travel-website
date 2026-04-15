/**
 * 活动运营模块
 * 功能：活动Banner、弹窗、列表、详情、报名
 */

const ActivityModule = {
  // 活动数据
  activities: [],
  settings: {},
  
  // 初始化
  async init() {
    await this.loadData();
    this.bindEvents();
    this.initBanner();
    this.initPopup();
    this.initSidebar();
  },
  
  // 加载活动数据
  async loadData() {
    try {
      const response = await fetch('data/events.json');
      const data = await response.json();
      this.activities = data.activities;
      this.settings = data.settings;
    } catch (error) {
      console.error('加载活动数据失败:', error);
      // 使用默认数据
      this.activities = [];
      this.settings = {
        popupEnabled: true,
        popupDelay: 2000,
        popupCookieDays: 1
      };
    }
  },
  
  // 绑定事件
  bindEvents() {
    // 关闭弹窗
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('activity-popup-overlay')) {
        this.closePopup();
      }
    });
    
    // ESC关闭弹窗
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closePopup();
      }
    });
  },
  
  // 初始化Banner
  initBanner() {
    const bannerContainer = document.getElementById('activityBanner');
    if (!bannerContainer) return;
    
    // 获取高亮活动
    const highlightActivities = this.activities.filter(a => a.highlight && a.status !== 'ended');
    if (highlightActivities.length === 0) {
      bannerContainer.style.display = 'none';
      return;
    }
    
    // 显示第一个高亮活动
    const activity = highlightActivities[0];
    this.renderBanner(bannerContainer, activity);
    
    // 绑定关闭事件
    const closeBtn = bannerContainer.querySelector('.activity-banner-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeBanner(bannerContainer);
      });
    }
    
    // 绑定点击跳转
    const link = bannerContainer.querySelector('.activity-banner-link');
    if (link) {
      link.addEventListener('click', () => {
        this.trackBannerClick(activity);
      });
    }
  },
  
  // 渲染Banner
  renderBanner(container, activity) {
    container.innerHTML = `
      <a href="${activity.link}" class="activity-banner-link">
        <div class="activity-banner-bg" style="background-image: url('${activity.image}');"></div>
        <div class="activity-banner-particles">
          <span style="left: 10%; animation-delay: 0s;"></span>
          <span style="left: 30%; animation-delay: 1s;"></span>
          <span style="left: 50%; animation-delay: 2s;"></span>
          <span style="left: 70%; animation-delay: 0.5s;"></span>
          <span style="left: 90%; animation-delay: 1.5s;"></span>
        </div>
        <button class="activity-banner-close" aria-label="关闭">×</button>
        <div class="activity-banner-content">
          <div class="activity-banner-left">
            <div class="activity-banner-icon">🎉</div>
            <div class="activity-banner-text">
              <h3>${activity.title}</h3>
              <p>${activity.subtitle}</p>
            </div>
          </div>
          <div class="activity-banner-right">
            <span class="activity-banner-btn">立即参与 →</span>
          </div>
        </div>
      </a>
    `;
  },
  
  // 关闭Banner
  closeBanner(container) {
    container.style.maxHeight = '0';
    container.style.marginBottom = '0';
    container.style.opacity = '0';
    container.style.overflow = 'hidden';
    container.style.transition = 'all 0.5s ease';
    
    // 保存到本地存储，一天内不显示
    localStorage.setItem('activityBannerClosed', Date.now().toString());
  },
  
  // 初始化弹窗
  initPopup() {
    // 检查是否已显示过弹窗
    const lastShow = localStorage.getItem('activityPopupLastShow');
    const today = new Date().toDateString();
    
    if (lastShow === today) return;
    
    // 获取需要弹窗的活动
    const popupActivity = this.activities.find(a => a.popup && a.status !== 'ended');
    if (!popupActivity) return;
    
    // 延迟显示
    setTimeout(() => {
      this.showPopup(popupActivity);
      localStorage.setItem('activityPopupLastShow', today);
    }, this.settings.popupDelay || 2000);
  },
  
  // 显示弹窗
  showPopup(activity) {
    const overlay = document.getElementById('activityPopup');
    if (!overlay) return;
    
    const content = overlay.querySelector('.activity-popup');
    if (!content) return;
    
    // 渲染内容
    content.innerHTML = `
      <button class="activity-popup-close" aria-label="关闭">×</button>
      <img src="${activity.image}" alt="${activity.title}" class="activity-popup-image">
      <div class="activity-popup-content">
        <span class="activity-popup-badge">${this.getTypeName(activity.type)}</span>
        <h2 class="activity-popup-title">${activity.title}</h2>
        <p class="activity-popup-subtitle">${activity.subtitle}</p>
        <p class="activity-popup-desc">${activity.description}</p>
        <div class="activity-popup-meta">
          <div class="activity-popup-meta-item">
            📅 开始：<span>${this.formatDate(activity.startDate)}</span>
          </div>
          <div class="activity-popup-meta-item">
            🏁 结束：<span>${this.formatDate(activity.endDate)}</span>
          </div>
        </div>
        <div class="activity-popup-actions">
          <button class="activity-popup-btn activity-popup-btn-primary" onclick="ActivityModule.goToActivity('${activity.id}')">
            立即参加
          </button>
          <button class="activity-popup-btn activity-popup-btn-secondary" onclick="ActivityModule.closePopup()">
            先看看
          </button>
        </div>
        <div class="activity-popup-tips">
          <strong>💡 温馨提示</strong>
          活动时间有限，名额有限，先到先得。如有疑问请联系客服。
        </div>
      </div>
    `;
    
    // 绑定关闭按钮
    const closeBtn = content.querySelector('.activity-popup-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closePopup());
    }
    
    // 显示弹窗
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // 追踪弹窗展示
    this.trackPopupShow(activity);
  },
  
  // 关闭弹窗
  closePopup() {
    const overlay = document.getElementById('activityPopup');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  },
  
  // 跳转活动详情
  goToActivity(id) {
    this.closePopup();
    window.location.href = `activity-detail.html?id=${id}`;
  },
  
  // 初始化侧边栏
  initSidebar() {
    const sidebar = document.getElementById('activitySidebar');
    if (!sidebar) return;
    
    // 检查是否需要显示
    const hasActiveActivities = this.activities.some(a => a.status === 'ongoing');
    if (!hasActiveActivities) {
      sidebar.style.display = 'none';
      return;
    }
    
    // 渲染侧边栏
    this.renderSidebar(sidebar);
  },
  
  // 渲染侧边栏
  renderSidebar(sidebar) {
    sidebar.innerHTML = `
      <a href="activities.html" class="activity-sidebar-item" title="活动中心">
        <span>🎯</span>
        <span class="sidebar-tooltip">活动中心</span>
      </a>
      <a href="activities.html#signup" class="activity-sidebar-item" title="立即报名">
        <span>✍️</span>
        <span class="sidebar-tooltip">立即报名</span>
      </a>
      <a href="promotion.html" class="activity-sidebar-item" title="邀请有礼">
        <span>🎁</span>
        <span class="sidebar-badge">热</span>
        <span class="sidebar-tooltip">邀请有礼</span>
      </a>
    `;
  },
  
  // 工具方法
  getTypeName(type) {
    const typeMap = {
      'promotion': '🎉 优惠活动',
      'recruit': '🌟 招募计划',
      'event': '🎊 精彩活动',
      'celebration': '🎊 庆典活动',
      'game': '🎮 游戏活动'
    };
    return typeMap[type] || '📌 活动';
  },
  
  getStatusName(status) {
    const statusMap = {
      'ongoing': '进行中',
      'upcoming': '即将开始',
      'ended': '已结束'
    };
    return statusMap[status] || status;
  },
  
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },
  
  // 追踪方法
  trackBannerClick(activity) {
    console.log('Banner点击:', activity.title);
    // 可接入统计分析
  },
  
  trackPopupShow(activity) {
    console.log('弹窗展示:', activity.title);
    // 可接入统计分析
  },
  
  trackSignup(activity, formData) {
    console.log('活动报名:', activity.title, formData);
    // 可接入统计分析
  }
};

// 活动列表页功能
const ActivityList = {
  activities: [],
  currentFilter: 'all',
  
  async init() {
    await this.loadData();
    this.renderFilters();
    this.renderActivities();
  },
  
  async loadData() {
    try {
      const response = await fetch('data/events.json');
      const data = await response.json();
      this.activities = data.activities;
    } catch (error) {
      console.error('加载活动数据失败:', error);
      this.activities = [];
    }
  },
  
  renderFilters() {
    const container = document.getElementById('activityFilters');
    if (!container) return;
    
    const filters = [
      { key: 'all', name: '全部活动' },
      { key: 'ongoing', name: '进行中' },
      { key: 'upcoming', name: '即将开始' },
      { key: 'promotion', name: '优惠' },
      { key: 'event', name: '精彩活动' },
      { key: 'recruit', name: '招募' }
    ];
    
    container.innerHTML = filters.map(f => `
      <button class="filter-btn ${this.currentFilter === f.key ? 'active' : ''}" 
              data-filter="${f.key}" 
              onclick="ActivityList.setFilter('${f.key}')">
        ${f.name}
      </button>
    `).join('');
  },
  
  setFilter(filter) {
    this.currentFilter = filter;
    this.renderFilters();
    this.renderActivities();
  },
  
  renderActivities() {
    const container = document.getElementById('activityList');
    if (!container) return;
    
    let filtered = this.activities;
    
    // 根据筛选过滤
    if (this.currentFilter !== 'all') {
      if (['ongoing', 'upcoming', 'ended'].includes(this.currentFilter)) {
        filtered = filtered.filter(a => a.status === this.currentFilter);
      } else {
        filtered = filtered.filter(a => a.type === this.currentFilter);
      }
    }
    
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 60px 20px; color: #6b7280;">
          <div style="font-size: 3rem; margin-bottom: 15px;">🔍</div>
          <p>暂无相关活动</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <div class="activities-grid">
        ${filtered.map(activity => this.renderActivityCard(activity)).join('')}
      </div>
    `;
  },
  
  renderActivityCard(activity) {
    return `
      <article class="activity-card" id="${activity.id}">
        <div class="activity-card-image">
          <img src="${activity.image}" alt="${activity.title}" loading="lazy">
          <span class="activity-card-badge">${ActivityModule.getTypeName(activity.type)}</span>
          <span class="activity-card-status ${activity.status}">${ActivityModule.getStatusName(activity.status)}</span>
        </div>
        <div class="activity-card-content">
          <div class="activity-card-tags">
            ${activity.tags.map(tag => `<span class="activity-card-tag">${tag}</span>`).join('')}
          </div>
          <h3 class="activity-card-title">${activity.title}</h3>
          <p class="activity-card-subtitle">${activity.subtitle}</p>
          <p class="activity-card-desc">${activity.description}</p>
          <div class="activity-card-footer">
            <span class="activity-card-date">📅 ${activity.startDate} - ${activity.endDate}</span>
            <a href="activity-detail.html?id=${activity.id}" class="activity-card-btn">查看详情</a>
          </div>
        </div>
      </article>
    `;
  }
};

// 活动详情页功能
const ActivityDetail = {
  activity: null,
  
  async init() {
    await this.loadData();
    this.renderDetail();
    this.initSignupForm();
  },
  
  async loadData() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    try {
      const response = await fetch('data/events.json');
      const data = await response.json();
      this.activity = data.activities.find(a => a.id === id);
      
      // 如果没找到，尝试hash
      if (!this.activity && window.location.hash) {
        const hashId = window.location.hash.replace('#', '');
        this.activity = data.activities.find(a => a.id === hashId);
      }
    } catch (error) {
      console.error('加载活动数据失败:', error);
    }
  },
  
  renderDetail() {
    const container = document.getElementById('activityDetail');
    if (!container || !this.activity) {
      this.renderNotFound();
      return;
    }
    
    const activity = this.activity;
    
    container.innerHTML = `
      <div class="activity-detail-hero">
        <img src="${activity.image}" alt="${activity.title}">
        <div class="activity-detail-hero-overlay">
          <span class="activity-detail-badge">${ActivityModule.getTypeName(activity.type)}</span>
          <h1 class="activity-detail-title">${activity.title}</h1>
          <p class="activity-detail-subtitle">${activity.subtitle}</p>
        </div>
      </div>
      
      <div class="activity-detail-content">
        <div class="activity-detail-main">
          <div class="activity-detail-section">
            <h3>📌 活动介绍</h3>
            <p>${activity.description}</p>
          </div>
          
          <div class="activity-detail-section">
            <h3>📅 活动时间</h3>
            <p>${activity.startDate} 至 ${activity.endDate}</p>
          </div>
          
          <div class="activity-detail-section">
            <h3>🏷️ 相关标签</h3>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              ${activity.tags.map(tag => `<span class="activity-card-tag">${tag}</span>`).join('')}
            </div>
          </div>
          
          <div class="activity-detail-section">
            <h3>📤 分享活动</h3>
            <div class="share-buttons">
              <button class="share-btn share-btn-wechat" onclick="ActivityDetail.shareWechat()" title="分享到微信">💬</button>
              <button class="share-btn share-btn-weibo" onclick="ActivityDetail.shareWeibo()" title="分享到微博">📱</button>
              <button class="share-btn share-btn-qq" onclick="ActivityDetail.shareQQ()" title="分享到QQ">🐧</button>
              <button class="share-btn share-btn-copy" onclick="ActivityDetail.copyLink()" title="复制链接">🔗</button>
            </div>
          </div>
        </div>
        
        <div class="activity-detail-sidebar">
          <div class="signup-card" id="signup">
            <h3>✍️ 立即报名</h3>
            <form id="signupForm" onsubmit="ActivityDetail.handleSignup(event)">
              <div class="signup-form-group">
                <label for="name">您的姓名</label>
                <input type="text" id="name" name="name" required placeholder="请输入姓名">
              </div>
              <div class="signup-form-group">
                <label for="phone">联系电话</label>
                <input type="tel" id="phone" name="phone" required placeholder="请输入手机号">
              </div>
              <div class="signup-form-group">
                <label for="email">电子邮箱</label>
                <input type="email" id="email" name="email" placeholder="选填">
              </div>
              <div class="signup-form-group">
                <label for="remark">备注信息</label>
                <textarea id="remark" name="remark" rows="3" placeholder="选填，可描述您的需求"></textarea>
              </div>
              <button type="submit" class="signup-card-btn">提交报名</button>
            </form>
            <div class="signup-tips">
              💡 提交报名后，我们的客服将在24小时内与您联系
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  renderNotFound() {
    const container = document.getElementById('activityDetail');
    if (!container) return;
    
    container.innerHTML = `
      <div style="text-align: center; padding: 100px 20px;">
        <div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>
        <h2 style="font-size: 1.5rem; margin-bottom: 10px;">未找到活动</h2>
        <p style="color: #6b7280; margin-bottom: 30px;">抱歉，您访问的活动不存在或已结束</p>
        <a href="activities.html" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 25px; text-decoration: none; font-weight: 600;">
          浏览全部活动
        </a>
      </div>
    `;
  },
  
  initSignupForm() {
    // 表单验证和提交处理在 renderDetail 中通过 onsubmit 绑定
  },
  
  handleSignup(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(data.phone)) {
      alert('请输入正确的手机号码');
      return;
    }
    
    // 模拟提交
    ActivityModule.trackSignup(this.activity, data);
    
    // 显示成功提示
    alert('报名成功！我们的客服将在24小时内与您联系。');
    form.reset();
  },
  
  // 分享功能
  shareWechat() {
    alert('请点击右上角分享到朋友圈');
  },
  
  shareWeibo() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(this.activity?.title || '游导旅游活动');
    window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${title}`, '_blank');
  },
  
  shareQQ() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(this.activity?.title || '游导旅游活动');
    window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}`, '_blank');
  },
  
  copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('链接已复制到剪贴板');
    }).catch(() => {
      alert('复制失败，请手动复制');
    });
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 根据页面初始化对应功能
  if (document.getElementById('activityBanner') || 
      document.getElementById('activityPopup') || 
      document.getElementById('activitySidebar')) {
    ActivityModule.init();
  }
  
  if (document.getElementById('activityFilters')) {
    ActivityList.init();
  }
  
  if (document.getElementById('activityDetail')) {
    ActivityDetail.init();
  }
});
