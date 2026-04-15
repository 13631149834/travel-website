// ===== 在线客服功能 - 增强版 V2 =====
class CustomerService {
  constructor() {
    this.isOpen = false;
    this.isOffline = false;
    this.unreadCount = 0;
    this.currentTime = new Date();
    this.messages = [];
    this.quickReplies = [];
    this.init();
  }

  init() {
    this.checkWorkStatus();
    this.createFloatingButton();
    this.createModal();
    this.createOfflineForm();
    this.bindEvents();
    this.startTimeCheck();
    this.loadQuickReplies();
  }

  // 检查是否在工作时间
  checkWorkStatus() {
    const day = this.currentTime.getDay();
    const hour = this.currentTime.getHours();
    
    // 周六周日
    if (day === 0 || day === 6) {
      this.isOffline = hour < 10 || hour >= 18;
    } else {
      // 工作日
      this.isOffline = hour < 9 || hour >= 21;
    }
  }

  // 获取状态消息
  getStatusMessage() {
    const day = this.currentTime.getDay();
    const hour = this.currentTime.getHours();
    const weekend = day === 0 || day === 6;
    
    if (weekend) {
      return {
        status: hour >= 10 && hour < 18 ? 'online' : 'offline',
        message: hour >= 10 && hour < 18 ? '周末值班中' : '周末休息',
        subMessage: '可在下方留言，客服上线后第一时间回复'
      };
    } else {
      return {
        status: hour >= 9 && hour < 21 ? 'online' : 'offline',
        message: hour >= 9 && hour < 21 ? '服务中' : '服务已结束',
        subMessage: '可在下方留言，次日09:00前回复'
      };
    }
  }

  createFloatingButton() {
    const status = this.getStatusMessage();
    const statusClass = status.status === 'online' ? 'online' : 'offline';
    
    const html = `
      <div class="customer-service-float" id="customerServiceFloat">
        <!-- 消息气泡 -->
        <div class="cs-message-bubble" id="csMessageBubble" style="display: none;">
          <span class="bubble-text">有什么可以帮您？</span>
          <div class="bubble-arrow"></div>
        </div>
        
        <!-- 主按钮 -->
        <button class="cs-float-btn ${statusClass}" id="csFloatBtn" aria-label="联系客服" title="联系客服">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="cs-icon">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
          </svg>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="cs-icon-close" style="display:none;">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
          ${status.status === 'online' ? '<span class="online-indicator"></span>' : ''}
        </button>
        
        <!-- 快捷入口 -->
        <div class="cs-quick-access" id="csQuickAccess">
          <button class="cs-quick-btn" id="csPhoneBtn" title="电话咨询" aria-label="电话咨询">
            <span>📞</span>
          </button>
          <button class="cs-quick-btn" id="csWechatBtn" title="微信客服" aria-label="微信客服">
            <span>💬</span>
          </button>
          <button class="cs-quick-btn" id="csFaqBtn" title="常见问题" aria-label="常见问题">
            <span>❓</span>
          </button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    
    this.addQuickAccessStyles();
  }

  addQuickAccessStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .cs-quick-access {
        display: flex;
        flex-direction: column;
        gap: 8px;
        opacity: 0;
        transform: translateX(20px);
        transition: all 0.3s ease;
        pointer-events: none;
      }
      
      .customer-service-float:hover .cs-quick-access,
      .cs-quick-access.show {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
      }
      
      .cs-quick-btn {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid var(--gray-200);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .cs-quick-btn:hover {
        transform: scale(1.1);
        border-color: var(--primary);
        background: var(--primary-light);
      }
      
      .cs-message-bubble {
        position: relative;
        background: #fff;
        padding: 12px 16px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        margin-bottom: 8px;
        animation: bubbleBounce 0.5s ease;
      }
      
      .cs-message-bubble.show {
        display: block !important;
      }
      
      .bubble-text {
        font-size: 0.9rem;
        color: var(--gray-700);
      }
      
      .bubble-arrow {
        position: absolute;
        bottom: -8px;
        right: 20px;
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid #fff;
      }
      
      .online-indicator {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 14px;
        height: 14px;
        background: #10b981;
        border: 2px solid #fff;
        border-radius: 50%;
      }
      
      .cs-float-btn.offline .cs-icon {
        opacity: 0.7;
      }
      
      @keyframes bubbleBounce {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes pulseOnline {
        0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
        50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      }
      
      .cs-float-btn.online {
        animation: pulseOnline 2s infinite;
      }
    `;
    document.head.appendChild(style);
  }

  createModal() {
    const status = this.getStatusMessage();
    const offlineWarning = status.status === 'offline' ? `
      <div class="cs-offline-warning">
        <span class="warning-icon">🌙</span>
        <div class="warning-text">
          <strong>当前非工作时间</strong>
          <p>${status.subMessage}</p>
        </div>
      </div>
    ` : '';

    const html = `
      <div class="cs-modal-overlay" id="csModalOverlay"></div>
      <div class="cs-modal" id="csModal" role="dialog" aria-labelledby="csModalTitle" aria-modal="true">
        <div class="cs-modal-header">
          <div class="cs-modal-title">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
            <span id="csModalTitle">在线客服</span>
            <span class="cs-status-badge ${status.status}">${status.message}</span>
          </div>
          <button class="cs-modal-close" id="csModalClose" aria-label="关闭">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="cs-modal-body">
          ${offlineWarning}
          
          <!-- 联系方式卡片 -->
          <div class="cs-contact-cards">
            <a href="tel:400-888-8888" class="cs-contact-card" title="电话咨询">
              <div class="card-icon">📞</div>
              <div class="card-title">电话咨询</div>
              <div class="card-desc">400-888-8888</div>
            </a>
            <a href="mailto:service@youdao-travel.com" class="cs-contact-card" title="邮件联系">
              <div class="card-icon">✉️</div>
              <div class="card-title">邮件联系</div>
              <div class="card-desc">service@youdao.com</div>
            </a>
          </div>

          <!-- 微信二维码 -->
          <div class="cs-wechat-section">
            <div class="wechat-title">
              <span>👨‍💻</span>
              <span>扫码添加客服微信</span>
            </div>
            <div class="cs-wechat-qr">
              <div class="cs-wechat-qr-placeholder">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path fill="#07C160" d="M8.69 4.44A4.328 4.328 0 0 0 5.56 7.5 4.328 4.328 0 0 0 8.69 10.56C11.07 10.56 12.19 8.5 12.19 8.5s1.12 2.06 3.5 2.06A4.328 4.328 0 0 0 19.44 7.5a4.328 4.328 0 0 0-3.13-3.06l-7.62-.02z"/>
                </svg>
                <span style="font-size:12px;">微信二维码</span>
              </div>
            </div>
            <div class="cs-wechat-tip">长按识别二维码，好友秒回</div>
          </div>

          <!-- 工作时间 -->
          <div class="cs-worktime">
            <div class="cs-worktime-title">
              <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
              工作时间
            </div>
            <div class="cs-worktime-list">
              <div class="cs-worktime-item">
                <span class="day">周一至周五</span>
                <span class="time"><span class="online-dot"></span>09:00 - 21:00</span>
              </div>
              <div class="cs-worktime-item">
                <span class="day">周六至周日</span>
                <span class="time">10:00 - 18:00</span>
              </div>
              <div class="cs-worktime-item off">
                <span class="day">法定节假日</span>
                <span class="time">休息</span>
              </div>
            </div>
          </div>

          <!-- FAQ快捷入口 -->
          <div class="cs-faq-section">
            <div class="cs-faq-title">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
              常见问题
            </div>
            <div class="cs-faq-list">
              <a href="faq.html#booking" class="cs-faq-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                如何预约导游？
              </a>
              <a href="faq.html#refund" class="cs-faq-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                订单退款规则
              </a>
              <a href="faq.html#visa" class="cs-faq-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                签证办理流程
              </a>
              <a href="faq.html#payment" class="cs-faq-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                支付问题
              </a>
            </div>
            <div class="cs-faq-more">
              <a href="faq.html">查看更多问题 →</a>
            </div>
          </div>

          <!-- 离线留言表单 -->
          <div class="cs-offline-form" id="csOfflineForm" style="display: ${status.status === 'offline' ? 'block' : 'none'};">
            <div class="offline-form-title">
              <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
              离线留言
            </div>
            <div class="offline-form-body">
              <input type="text" id="offlineName" class="offline-input" placeholder="请输入您的姓名">
              <input type="tel" id="offlinePhone" class="offline-input" placeholder="请输入手机号码">
              <textarea id="offlineMessage" class="offline-textarea" placeholder="请描述您的问题..." rows="3"></textarea>
              <button type="button" class="offline-submit" id="offlineSubmit">
                提交留言
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    
    this.addOfflineFormStyles();
  }

  addOfflineFormStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .cs-status-badge {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-left: 8px;
      }
      
      .cs-status-badge.online {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
      }
      
      .cs-status-badge.offline {
        background: rgba(156, 163, 175, 0.2);
        color: #6b7280;
      }
      
      .cs-offline-warning {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border-radius: 12px;
        margin-bottom: 16px;
      }
      
      .cs-offline-warning .warning-icon {
        font-size: 1.5rem;
      }
      
      .cs-offline-warning .warning-text strong {
        display: block;
        font-size: 0.9rem;
        color: #92400e;
        margin-bottom: 2px;
      }
      
      .cs-offline-warning .warning-text p {
        font-size: 0.8rem;
        color: #b45309;
        margin: 0;
      }
      
      .cs-offline-form {
        margin-top: 20px;
        padding: 16px;
        background: var(--gray-50);
        border-radius: 12px;
        border: 2px dashed var(--gray-300);
      }
      
      .offline-form-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--gray-700);
      }
      
      .offline-form-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .offline-input,
      .offline-textarea {
        padding: 10px 12px;
        border: 1px solid var(--gray-200);
        border-radius: 8px;
        font-size: 0.9rem;
        transition: all 0.2s;
      }
      
      .offline-input:focus,
      .offline-textarea:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(79, 134, 247, 0.1);
      }
      
      .offline-textarea {
        resize: vertical;
        min-height: 80px;
      }
      
      .offline-submit {
        padding: 10px;
        background: var(--primary);
        color: #fff;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .offline-submit:hover {
        background: var(--primary-dark);
      }
      
      .offline-submit:disabled {
        background: var(--gray-300);
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
  }

  bindEvents() {
    const floatBtn = document.getElementById('csFloatBtn');
    const modal = document.getElementById('csModal');
    const overlay = document.getElementById('csModalOverlay');
    const closeBtn = document.getElementById('csModalClose');
    const quickBtns = document.querySelectorAll('.cs-quick-btn');
    const offlineSubmit = document.getElementById('offlineSubmit');

    // 点击悬浮按钮
    floatBtn?.addEventListener('click', () => this.toggle());

    // 点击关闭按钮
    closeBtn?.addEventListener('click', () => this.close());

    // 点击遮罩层
    overlay?.addEventListener('click', () => this.close());

    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // 防止弹窗内滚动穿透
    modal?.addEventListener('wheel', (e) => {
      e.stopPropagation();
    });

    // 快捷按钮
    quickBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.id === 'csPhoneBtn') {
          window.location.href = 'tel:400-888-8888';
        } else if (btn.id === 'csWechatBtn') {
          this.open();
        } else if (btn.id === 'csFaqBtn') {
          window.location.href = 'faq.html';
        }
      });
    });

    // 离线表单提交
    offlineSubmit?.addEventListener('click', () => this.submitOfflineForm());

    // 鼠标经过显示快捷入口
    const floatContainer = document.getElementById('customerServiceFloat');
    floatContainer?.addEventListener('mouseenter', () => {
      document.getElementById('csQuickAccess')?.classList.add('show');
    });
    
    floatContainer?.addEventListener('mouseleave', () => {
      document.getElementById('csQuickAccess')?.classList.remove('show');
    });

    // 3秒后显示气泡
    setTimeout(() => {
      const bubble = document.getElementById('csMessageBubble');
      if (bubble && !this.isOpen) {
        bubble.classList.add('show');
        setTimeout(() => {
          bubble.classList.remove('show');
        }, 5000);
      }
    }, 3000);
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    const modal = document.getElementById('csModal');
    const overlay = document.getElementById('csModalOverlay');
    const floatBtn = document.getElementById('csFloatBtn');
    const bubble = document.getElementById('csMessageBubble');
    
    modal?.classList.add('active');
    overlay?.classList.add('active');
    this.isOpen = true;
    
    // 隐藏气泡
    bubble?.classList.remove('show');
    
    // 切换图标
    const icon = floatBtn?.querySelector('.cs-icon');
    const closeIcon = floatBtn?.querySelector('.cs-icon-close');
    if (icon) icon.style.display = 'none';
    if (closeIcon) closeIcon.style.display = 'block';
    
    // 焦点管理
    const closeBtn = document.getElementById('csModalClose');
    closeBtn?.focus();
    
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
  }

  close() {
    const modal = document.getElementById('csModal');
    const overlay = document.getElementById('csModalOverlay');
    const floatBtn = document.getElementById('csFloatBtn');
    
    modal?.classList.remove('active');
    overlay?.classList.remove('active');
    this.isOpen = false;
    
    // 切换图标
    const icon = floatBtn?.querySelector('.cs-icon');
    const closeIcon = floatBtn?.querySelector('.cs-icon-close');
    if (icon) icon.style.display = 'block';
    if (closeIcon) closeIcon.style.display = 'none';
    
    // 恢复背景滚动
    document.body.style.overflow = '';
    
    // 返回焦点
    floatBtn?.focus();
  }

  loadQuickReplies() {
    // 加载快捷回复
    fetch('data/faq-quick-answers.json')
      .then(res => res.json())
      .then(data => {
        this.quickReplies = data;
      })
      .catch(() => {
        // 使用默认快捷回复
        this.quickReplies = [
          { id: 1, category: '预订', question: '如何预约导游？', answer: '您可以通过以下方式预约导游：1. 在网站首页选择目的地和日期；2. 浏览导游列表并选择合适的导游；3. 点击预约按钮填写订单信息；4. 完成支付后即可。' },
          { id: 2, category: '退款', question: '退款规则是什么？', answer: '我们的退款政策如下：距离服务开始时间72小时以上申请退款，全额退款；48-72小时申请退款，退还50%费用；48小时内申请退款，不予退款。如有特殊情况请联系客服。' },
          { id: 3, category: '支付', question: '支持哪些支付方式？', answer: '我们支持以下支付方式：微信支付、支付宝、银联卡、信用卡。您可以根据自己的习惯选择合适的支付方式。' }
        ];
      });
  }

  // 获取常见问题分类
  getCategories() {
    const categories = [...new Set(this.quickReplies.map(item => item.category))];
    return categories;
  }

  // 根据分类获取问题
  getQuestionsByCategory(category) {
    return this.quickReplies.filter(item => item.category === category);
  }

  submitOfflineForm() {
    const name = document.getElementById('offlineName')?.value;
    const phone = document.getElementById('offlinePhone')?.value;
    const message = document.getElementById('offlineMessage')?.value;
    const submitBtn = document.getElementById('offlineSubmit');

    // 验证
    if (!name || !phone || !message) {
      this.showToast('请填写完整信息', 'error');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      this.showToast('请输入正确的手机号码', 'error');
      return;
    }

    // 禁用按钮
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '提交中...';
    }

    // 模拟提交
    setTimeout(() => {
      this.showToast('留言已提交，客服将在次日09:00前回复您！', 'success');
      
      // 清空表单
      if (document.getElementById('offlineName')) document.getElementById('offlineName').value = '';
      if (document.getElementById('offlinePhone')) document.getElementById('offlinePhone').value = '';
      if (document.getElementById('offlineMessage')) document.getElementById('offlineMessage').value = '';
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '提交留言';
      }
      
      this.close();
    }, 1000);
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `cs-toast cs-toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
      <span class="toast-message">${message}</span>
    `;
    document.body.appendChild(toast);
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .cs-toast {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: #fff;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        transition: transform 0.3s ease;
      }
      .cs-toast.show {
        transform: translateX(-50%) translateY(0);
      }
      .cs-toast-success .toast-icon { color: #10b981; }
      .cs-toast-error .toast-icon { color: #ef4444; }
      .cs-toast-info .toast-icon { color: #4F86F7; }
      .toast-message { font-size: 0.9rem; color: #333; }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  startTimeCheck() {
    // 每分钟检查一次状态
    setInterval(() => {
      this.currentTime = new Date();
      this.checkWorkStatus();
    }, 60000);
  }

  // 更新未读消息数
  setUnreadCount(count) {
    this.unreadCount = count;
    const badge = document.querySelector('.cs-badge');
    if (badge) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  // 添加消息到对话列表
  addMessage(message) {
    this.messages.push({
      ...message,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });
    this.saveMessages();
  }

  // 保存消息记录
  saveMessages() {
    try {
      localStorage.setItem('cs_messages', JSON.stringify(this.messages));
    } catch (e) {
      console.warn('无法保存消息记录');
    }
  }

  // 加载消息记录
  loadMessages() {
    try {
      const saved = localStorage.getItem('cs_messages');
      if (saved) {
        this.messages = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('无法加载消息记录');
    }
  }
}

// 初始化客服功能
document.addEventListener('DOMContentLoaded', () => {
  window.customerService = new CustomerService();
});
