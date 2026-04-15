// ===== 在线客服功能 =====
class CustomerService {
  constructor() {
    this.isOpen = false;
    this.init();
  }

  init() {
    // 创建客服按钮和弹窗
    this.createFloatingButton();
    this.createModal();
    this.bindEvents();
  }

  createFloatingButton() {
    const html = `
      <div class="customer-service-float" id="customerServiceFloat">
        <button class="cs-float-btn" id="csFloatBtn" aria-label="联系客服" title="联系客服">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
          </svg>
        </button>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  createModal() {
    const html = `
      <div class="cs-modal-overlay" id="csModalOverlay"></div>
      <div class="cs-modal" id="csModal" role="dialog" aria-labelledby="csModalTitle" aria-modal="true">
        <div class="cs-modal-header">
          <div class="cs-modal-title">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
            <span id="csModalTitle">在线客服</span>
          </div>
          <button class="cs-modal-close" id="csModalClose" aria-label="关闭">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="cs-modal-body">
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
              <img src="images/wechat-qr.png" alt="客服微信二维码" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <div class="cs-wechat-qr-placeholder" style="display:none;">
                <svg viewBox="0 0 24 24"><path d="M8.69 4.44A4.328 4.328 0 0 0 5.56 7.5M5.56 7.5C5.56 7.5 2.56 9.5 2.56 13c0 2.21 1.33 4.17 3.33 5.5-.5 1.17-1.67 2.5-4 2.5m14-11.56c0-.17-.01-.33-.03-.5m-9.47 8.56c-2.21.98-5.03.98-7.24 0C.78 12.19 0 13.55 0 15.06c0 3.92 3.56 7.11 7.94 7.11 4.38 0 7.94-3.19 7.94-7.11 0-1.51-.78-2.87-1.94-3.56zm3.56 5.56c0-.33-.03-.65-.08-.97m-3.48 2.97c-.87-.33-1.87-.52-2.94-.52-1.07 0-2.07.19-2.94.52m9.87 4.06c-.5-1.17-1.67-2.5-4-2.5m-4.24-.5c.65-.17 1.26-.44 1.82-.81"/></svg>
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
              <a href="faq.html" class="cs-faq-item">
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
              <a href="faq.html#safety" class="cs-faq-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                旅行安全保障
              </a>
            </div>
            <div class="cs-faq-more">
              <a href="faq.html">查看更多问题 →</a>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  bindEvents() {
    const floatBtn = document.getElementById('csFloatBtn');
    const modal = document.getElementById('csModal');
    const overlay = document.getElementById('csModalOverlay');
    const closeBtn = document.getElementById('csModalClose');

    // 点击悬浮按钮
    floatBtn?.addEventListener('click', () => this.open());

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
  }

  open() {
    const modal = document.getElementById('csModal');
    const overlay = document.getElementById('csModalOverlay');
    
    modal?.classList.add('active');
    overlay?.classList.add('active');
    this.isOpen = true;
    
    // 焦点管理
    const closeBtn = document.getElementById('csModalClose');
    closeBtn?.focus();
    
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
  }

  close() {
    const modal = document.getElementById('csModal');
    const overlay = document.getElementById('csModalOverlay');
    
    modal?.classList.remove('active');
    overlay?.classList.remove('active');
    this.isOpen = false;
    
    // 恢复背景滚动
    document.body.style.overflow = '';
    
    // 返回焦点
    const floatBtn = document.getElementById('csFloatBtn');
    floatBtn?.focus();
  }
}

// 初始化客服功能
document.addEventListener('DOMContentLoaded', () => {
  window.customerService = new CustomerService();
});
