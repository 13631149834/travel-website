/**
 * 合作伙伴展示系统
 * 包含滚动展示、筛选、详情弹窗等功能
 */

(function() {
  'use strict';

  // 合作伙伴数据缓存
  let partnersData = null;
  let currentFilter = 'all';

  // 初始化
  async function init() {
    await loadPartnersData();
    initPartnerScroll();
    initPartnerFilter();
    initPartnerModal();
    initPartnerStats();
  }

  // 加载合作伙伴数据
  async function loadPartnersData() {
    try {
      const response = await fetch('data/partners.json');
      if (response.ok) {
        partnersData = await response.json();
        renderPartners();
        renderCategories();
        renderBenefits();
        renderProcess();
      }
    } catch (error) {
      console.warn('加载合作伙伴数据失败，使用默认数据');
      // 使用内联默认数据
      partnersData = getDefaultPartnersData();
      renderPartners();
    }
  }

  // 获取默认数据
  function getDefaultPartnersData() {
    return {
      partners: [
        { id: 'p001', name: '携程旅行', logo: '🏨', type: 'travel-platform', typeName: '旅游平台', description: '中国领先的在线旅游平台', website: 'https://www.ctrip.com', cooperation: '战略合作伙伴', since: '2023', featured: true },
        { id: 'p002', name: '马蜂窝', logo: '🧭', type: 'travel-platform', typeName: '旅游平台', description: '旅行灵感与攻略社区', website: 'https://www.mafengwo.cn', cooperation: '内容合作伙伴', since: '2023', featured: true },
        { id: 'h001', name: '万豪国际', logo: '🏰', type: 'hotel', typeName: '酒店集团', description: '全球领先的酒店集团', website: 'https://www.marriott.com', cooperation: '酒店合作伙伴', since: '2023', featured: true },
        { id: 'a001', name: '中国国际航空', logo: '✈️', type: 'airline', typeName: '航空公司', description: '中国唯一的载旗航空公司', website: 'https://www.airchina.com.cn', cooperation: '航司合作伙伴', since: '2023', featured: true },
        { id: 's001', name: '故宫博物院', logo: '🏛️', type: 'attraction', typeName: '景区', description: '世界文化遗产', website: 'https://www.dpm.org.cn', cooperation: '景区合作伙伴', since: '2023', featured: true },
        { id: 'pay001', name: '支付宝', logo: '💰', type: 'payment', typeName: '支付平台', description: '安全便捷的支付服务', website: 'https://www.alipay.com', cooperation: '支付合作伙伴', since: '2023', featured: true },
        { id: 'pay002', name: '微信支付', logo: '💳', type: 'payment', typeName: '支付平台', description: '覆盖线上线下全场景', website: 'https://pay.weixin.qq.com', cooperation: '支付合作伙伴', since: '2023', featured: true }
      ],
      categories: [
        { id: 'travel-platform', name: '旅游平台', icon: '🌐', count: 2, description: '与主流旅游平台的深度合作' },
        { id: 'hotel', name: '酒店合作', icon: '🏨', count: 1, description: '覆盖全球的酒店合作伙伴网络' },
        { id: 'airline', name: '航空公司', icon: '✈️', count: 1, description: '主要航空公司官方合作' },
        { id: 'attraction', name: '景区合作', icon: '🏞️', count: 1, description: '知名景区的专属讲解服务' },
        { id: 'payment', name: '支付平台', icon: '💳', count: 2, description: '安全便捷的支付解决方案' }
      ],
      benefits: [
        { title: '流量赋能', icon: '📈', description: '共享平台优质流量' },
        { title: '品牌背书', icon: '🏆', description: '严选认证体系' },
        { title: '技术赋能', icon: '🔧', description: 'API接口技术支持' },
        { title: '联合营销', icon: '🎯', description: '联合举办活动' }
      ],
      process: [
        { step: 1, title: '提交申请', icon: '📝', description: '填写入驻申请表' },
        { step: 2, title: '资质审核', icon: '🔍', description: '3个工作日内审核' },
        { step: 3, title: '商务洽谈', icon: '🤝', description: '确定合作模式' },
        { step: 4, title: '签署协议', icon: '📄', description: '签订合作协议' },
        { step: 5, title: '系统对接', icon: '💻', description: '完成技术对接' },
        { step: 6, title: '正式合作', icon: '🚀', description: '启动合作' }
      ],
      statistics: { totalPartners: 7, platforms: 2, hotels: 1, airlines: 1, attractions: 1, payments: 2 }
    };
  }

  // 渲染合作伙伴
  function renderPartners() {
    if (!partnersData) return;
    
    const container = document.getElementById('partners-grid');
    if (!container) return;

    const partners = currentFilter === 'all' 
      ? partnersData.partners 
      : partnersData.partners.filter(p => p.type === currentFilter);

    container.innerHTML = partners.map(partner => `
      <article class="partner-card" data-id="${partner.id}" onclick="window.PartnerSystem.openModal('${partner.id}')">
        <div class="partner-logo">${partner.logo}</div>
        <div class="partner-info">
          <h3>${partner.name}</h3>
          <span class="partner-type">${partner.typeName}</span>
          <p class="partner-desc">${partner.description}</p>
          ${partner.cooperation ? `<span class="partner-badge">${partner.cooperation}</span>` : ''}
        </div>
        <a href="${partner.website}" class="partner-link" target="_blank" rel="noopener" onclick="event.stopPropagation()">访问官网 →</a>
      </article>
    `).join('');
  }

  // 渲染分类标签
  function renderCategories() {
    if (!partnersData) return;
    
    const container = document.getElementById('partner-categories');
    if (!container) return;

    container.innerHTML = `
      <button class="category-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
        全部 <span class="count">${partnersData.partners.length}</span>
      </button>
      ${partnersData.categories.map(cat => `
        <button class="category-btn ${currentFilter === cat.id ? 'active' : ''}" data-filter="${cat.id}">
          ${cat.icon} ${cat.name} <span class="count">${cat.count}</span>
        </button>
      `).join('')}
    `;
  }

  // 渲染合作优势
  function renderBenefits() {
    if (!partnersData) return;
    
    const container = document.getElementById('benefits-grid');
    if (!container) return;

    container.innerHTML = partnersData.benefits.map(benefit => `
      <div class="benefit-card">
        <div class="benefit-icon">${benefit.icon}</div>
        <h4>${benefit.title}</h4>
        <p>${benefit.description}</p>
      </div>
    `).join('');
  }

  // 渲染入驻流程
  function renderProcess() {
    if (!partnersData) return;
    
    const container = document.getElementById('process-timeline');
    if (!container) return;

    container.innerHTML = partnersData.process.map(step => `
      <div class="process-step">
        <div class="step-number">${step.step}</div>
        <div class="step-icon">${step.icon}</div>
        <h4>${step.title}</h4>
        <p>${step.description}</p>
      </div>
    `).join('');
  }

  // 渲染统计数据
  function renderStats() {
    if (!partnersData || !partnersData.statistics) return;

    const stats = partnersData.statistics;
    const container = document.getElementById('partner-stats');
    if (!container) return;

    container.innerHTML = `
      <div class="stat-item">
        <div class="stat-number">${stats.totalPartners}+</div>
        <div class="stat-label">合作伙伴</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${stats.platforms}+</div>
        <div class="stat-label">旅游平台</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${stats.hotels}+</div>
        <div class="stat-label">酒店集团</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${stats.airlines}+</div>
        <div class="stat-label">航空公司</div>
      </div>
    `;
  }

  // 初始化合作伙伴滚动
  function initPartnerScroll() {
    const scrollContainer = document.getElementById('partner-scroll');
    if (!scrollContainer) return;

    let isScrolling = false;
    let scrollSpeed = 1;
    let animationId = null;

    // 鼠标悬停时停止滚动
    scrollContainer.addEventListener('mouseenter', () => {
      if (!scrollContainer.classList.contains('manual-scroll')) {
        cancelAnimationFrame(animationId);
      }
    });

    scrollContainer.addEventListener('mouseleave', () => {
      if (!scrollContainer.classList.contains('manual-scroll')) {
        startAutoScroll();
      }
    });

    // 支持手动滚动
    let startX = 0;
    let scrollLeft = 0;

    scrollContainer.addEventListener('mousedown', (e) => {
      startX = e.pageX - scrollContainer.offsetLeft;
      scrollLeft = scrollContainer.scrollLeft;
      scrollContainer.style.cursor = 'grabbing';
    });

    scrollContainer.addEventListener('mousemove', (e) => {
      if (startX === 0) return;
      e.preventDefault();
      const x = e.pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 2;
      scrollContainer.scrollLeft = scrollLeft - walk;
    });

    scrollContainer.addEventListener('mouseup', () => {
      scrollContainer.style.cursor = 'grab';
      startX = 0;
    });

    scrollContainer.addEventListener('mouseleave', () => {
      scrollContainer.style.cursor = 'grab';
      startX = 0;
    });

    // 自动滚动函数
    function startAutoScroll() {
      function scroll() {
        if (!isScrolling) {
          scrollContainer.scrollLeft += scrollSpeed;
          
          // 滚动到一半时重置
          if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
            scrollContainer.scrollLeft = 0;
          }
        }
        animationId = requestAnimationFrame(scroll);
      }
      scroll();
    }

    // 启动自动滚动
    startAutoScroll();
  }

  // 初始化合作伙伴筛选
  function initPartnerFilter() {
    const filterContainer = document.getElementById('partner-categories');
    if (!filterContainer) return;

    filterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-btn');
      if (!btn) return;

      const filter = btn.dataset.filter;
      if (filter === currentFilter) return;

      // 更新按钮状态
      filterContainer.querySelectorAll('.category-btn').forEach(b => {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      // 筛选合作伙伴
      currentFilter = filter;
      renderPartners();

      // 触发动画
      animateCards();
    });
  }

  // 卡片动画
  function animateCards() {
    const cards = document.querySelectorAll('.partner-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 50);
    });
  }

  // 初始化详情弹窗
  function initPartnerModal() {
    // 点击遮罩关闭弹窗
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('partner-modal-overlay')) {
        closeModal();
      }
    });

    // ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  // 打开弹窗
  function openModal(partnerId) {
    if (!partnersData) return;

    const partner = partnersData.partners.find(p => p.id === partnerId);
    if (!partner) return;

    const modal = document.getElementById('partner-detail-modal');
    if (!modal) return;

    const content = modal.querySelector('.modal-content');
    
    // 填充数据
    content.innerHTML = `
      <button class="modal-close" onclick="window.PartnerSystem.closeModal()">×</button>
      <div class="modal-header">
        <div class="modal-logo">${partner.logo}</div>
        <div class="modal-title">
          <h2>${partner.name}</h2>
          <span class="modal-type">${partner.typeName}</span>
          ${partner.cooperation ? `<span class="modal-badge">${partner.cooperation}</span>` : ''}
        </div>
      </div>
      <div class="modal-body">
        <div class="modal-info">
          <p class="modal-desc">${partner.description}</p>
          ${partner.since ? `<p class="modal-since">合作时间：${partner.since}年</p>` : ''}
        </div>
        ${partner.case ? `
          <div class="modal-case">
            <h4>📌 合作案例</h4>
            <div class="case-content">
              <h5>${partner.case.title}</h5>
              <p>${partner.case.description}</p>
            </div>
          </div>
        ` : ''}
        <div class="modal-actions">
          <a href="${partner.website}" class="btn btn-primary" target="_blank" rel="noopener">
            访问官网
          </a>
          <a href="partner-apply.html" class="btn btn-outline">
            申请合作
          </a>
        </div>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // 关闭弹窗
  function closeModal() {
    const modal = document.getElementById('partner-detail-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // 渲染精选合作伙伴（首页用）
  function renderFeaturedPartners(containerId) {
    if (!partnersData) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    const featured = partnersData.partners.filter(p => p.featured);
    
    // 复制一份用于循环滚动
    const doubled = [...featured, ...featured];
    
    container.innerHTML = doubled.map(partner => `
      <div class="scroll-partner-item" onclick="window.PartnerSystem.openModal('${partner.id}')">
        <div class="scroll-partner-logo">${partner.logo}</div>
        <span class="scroll-partner-name">${partner.name}</span>
      </div>
    `).join('');
  }

  // 渲染精选合作案例
  function renderFeaturedCases(containerId) {
    if (!partnersData) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    const cases = partnersData.partners.filter(p => p.case && p.case.title);
    
    container.innerHTML = cases.map((partner, index) => `
      <div class="case-card" data-index="${index}">
        <div class="case-header">
          <span class="case-logo">${partner.logo}</span>
          <span class="case-partner">${partner.name}</span>
        </div>
        <h4 class="case-title">${partner.case.title}</h4>
        <p class="case-desc">${partner.case.description}</p>
      </div>
    `).join('');
  }

  // 初始化统计数据
  function initPartnerStats() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStats();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    const statsSection = document.getElementById('partner-stats');
    if (statsSection) {
      observer.observe(statsSection);
    }
  }

  // 数字动画
  function animateStats() {
    const numbers = document.querySelectorAll('.stat-number');
    numbers.forEach(num => {
      const target = parseInt(num.textContent);
      let current = 0;
      const increment = target / 30;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          num.textContent = target + '+';
          clearInterval(timer);
        } else {
          num.textContent = Math.floor(current) + '+';
        }
      }, 50);
    });
  }

  // 导出公共接口
  window.PartnerSystem = {
    init,
    loadPartnersData,
    openModal,
    closeModal,
    renderFeaturedPartners,
    renderFeaturedCases,
    getPartners: () => partnersData,
    getCurrentFilter: () => currentFilter
  };

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// 首页合作伙伴滚动初始化
function initHomePartnersScroll() {
  const scrollContainer = document.getElementById('featured-partners-scroll');
  if (!scrollContainer) return;

  let scrollAmount = 0;
  const scrollSpeed = 1;
  const itemWidth = 140; // 每个合作伙伴项的宽度
  const gap = 20;

  function autoScroll() {
    scrollAmount += scrollSpeed;
    const totalWidth = scrollContainer.scrollWidth / 2;
    
    if (scrollAmount >= totalWidth) {
      scrollAmount = 0;
      scrollContainer.style.transition = 'none';
      scrollContainer.style.transform = `translateX(0)`;
      // 强制重绘
      scrollContainer.offsetHeight;
    } else {
      scrollContainer.style.transition = 'transform 0.1s linear';
      scrollContainer.style.transform = `translateX(-${scrollAmount}px)`;
    }
    
    requestAnimationFrame(autoScroll);
  }

  // 启动滚动
  autoScroll();

  // 悬停暂停
  scrollContainer.addEventListener('mouseenter', () => {
    scrollContainer.style.animationPlayState = 'paused';
  });

  scrollContainer.addEventListener('mouseleave', () => {
    scrollContainer.style.animationPlayState = 'running';
  });
}

// 数字滚动动画
function animateNumbers() {
  const counters = document.querySelectorAll('.partner-stat-number');
  
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };

    // 使用 Intersection Observer 触发动画
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          updateCounter();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(counter);
  });
}
