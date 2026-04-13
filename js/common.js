// ===== 旅游网站共用JS =====

// 移动端导航切换
function toggleNav() {
  const nav = document.querySelector('.nav-links');
  nav && nav.classList.toggle('open');
}

// 标签页切换
function switchTab(tabId, btnElement) {
  // 隐藏所有标签内容
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  // 移除所有按钮激活状态
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  
  // 激活选中的标签
  const target = document.getElementById(tabId);
  if (target) {
    target.classList.add('active');
    target.classList.add('lazy-loaded'); // 标记已加载
  }
  if (btnElement) {
    btnElement.classList.add('active');
  }
}

// FAQ手风琴
function toggleFaq(element) {
  const item = element.closest('.faq-item');
  const wasOpen = item.classList.contains('open');
  
  // 关闭所有其他项
  document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
  
  // 切换当前项
  if (!wasOpen) {
    item.classList.add('open');
  }
}

// 懒加载图片
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '100px' });
  
  images.forEach(img => observer.observe(img));
}

// 内容懒加载（滚动到可见区域才加载）
function lazyLoadContent() {
  const sections = document.querySelectorAll('[data-lazy]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const loader = el.dataset.lazy;
        
        // 模拟加载数据
        loadContent(el, loader);
        observer.unobserve(el);
      }
    });
  }, { rootMargin: '100px' });
  
  sections.forEach(section => observer.observe(section));
}

// 内容加载器（按需加载各国内容）
const contentCache = {};
function loadContent(element, type) {
  if (contentCache[type]) {
    element.innerHTML = contentCache[type];
    return;
  }
  
  // 显示加载状态
  element.innerHTML = '<div class="loading"><div class="spinner"></div><p>加载中...</p></div>';
  
  // 模拟异步加载
  setTimeout(() => {
    const html = generateContent(type);
    contentCache[type] = html;
    element.innerHTML = html;
  }, 300);
}

// 根据类型生成内容
function generateContent(type) {
  const contents = {
    'japan': `
      <div class="content-card">
        <h2>🗾 日本旅行避坑</h2>
        <h3>签证注意</h3>
        <ul>
          <li>单次签证：年收入10万以上或存款证明</li>
          <li>三年多次：首次需冲绳或东北六县入境</li>
          <li>五年多次：年收入50万以上</li>
        </ul>
        <h3>交通陷阱</h3>
        <ul class="warning">
          <li>JR Pass不是万能的，城市内地铁票更便宜</li>
          <li>出租车费超贵，起步价约40元人民币</li>
          <li>西瓜卡余额不退，建议用完再回国</li>
        </ul>
        <h3>购物坑</h3>
        <ul class="danger">
          <li>药妆店价格差异大，多对比再买</li>
          <li>免税品有出境携带时限，注意保存小票</li>
        </ul>
      </div>
    `,
    'thailand': `
      <div class="content-card">
        <h2>🇹🇭 泰国旅行避坑</h2>
        <h3>签证注意</h3>
        <ul>
          <li>落地签：带2寸照片、往返机票、酒店预订单</li>
          <li>贴纸签：费用更便宜，停留更长</li>
          <li>免签政策：关注最新政策变动</li>
        </ul>
        <h3>交通注意</h3>
        <ul class="warning">
          <li>突突车要砍价，提前查好大概价格</li>
          <li>租车需国际驾照，罚款很重</li>
          <li>摩托车租金押金高，还车时仔细验车</li>
        </ul>
        <h3>安全提示</h3>
        <ul>
          <li>尊重皇室，议论王室违法</li>
          <li>佛教圣地注意着装，不可露肩露膝</li>
          <li>海鲜市场小心掉包，选活海鲜当场称重</li>
        </ul>
      </div>
    `,
    'europe': `
      <div class="content-card">
        <h2>🇪🇺 欧洲旅行避坑</h2>
        <h3>申根签证</h3>
        <ul>
          <li>向主要目的地国申请（停留最久的国家）</li>
          <li>提前2-3个月申请，不要卡时间</li>
          <li>银行流水余额建议3万以上</li>
        </ul>
        <h3>防盗要点</h3>
        <ul class="danger">
          <li>巴黎、罗马、巴塞罗那是重灾区</li>
          <li>不露富，包背前面，手机不插口袋</li>
          <li>遇到吉普赛人搭讪立即走开</li>
        </ul>
        <h3>交通坑</h3>
        <ul class="warning">
          <li>欧洲火车票提前订才有折扣</li>
          <li>廉航注意行李额，额外费用很贵</li>
          <li>自驾注意ZTL限行区，误入罚款高</li>
        </ul>
      </div>
    `,
    'usa': `
      <div class="content-card">
        <h2>🇺🇸 美国旅行避坑</h2>
        <h3>签证注意</h3>
        <ul>
          <li>B1/B2签证：需面签，准备充分材料</li>
          <li>DS-160表格认真填写，关联很大</li>
          <li>EVUS登记：出发前72小时完成</li>
        </ul>
        <h3>自驾注意</h3>
        <ul class="warning">
          <li>中国驾照+翻译件可在大部分州使用</li>
          <li>STOP标志必须停死，观察再走</li>
          <li>高速公路缴费用Cashless或租ETC</li>
        </ul>
        <h3>生活坑</h3>
        <ul>
          <li>小费文化：餐厅15-20%，行李2-5美元</li>
          <li>自来水可喝，但口感可能不好</li>
          <li>不要谈论政治、种族话题</li>
        </ul>
      </div>
    `
  };
  
  return contents[type] || '<p>暂无该地区内容</p>';
}

// 加载更多（分页）
function loadMore(page, containerId, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // 模拟加载
  const newItems = generateMoreItems(page, type);
  container.insertAdjacentHTML('beforeend', newItems);
  
  // 更新分页状态
  const btn = event.target;
  if (page >= 3) {
    btn.textContent = '没有更多了';
    btn.disabled = true;
  } else {
    btn.dataset.page = page + 1;
  }
}

// 生成更多项目
function generateMoreItems(page, type) {
  const titles = {
    'tips': ['打包技巧', '摄影构图', '省钱妙招', '时差调整', '语言沟通'],
    'stories': ['东京夜游记', '巴黎漫步', '冰岛极光', '马尔代夫度假', '非洲Safari'],
    'wonders': ['冰岛黑沙滩', '玻利维亚天空之境', '土耳其棉花堡', '新西兰萤火虫洞']
  };
  
  const items = titles[type] || [];
  return items.map(t => `<div class="card"><h3>${t}</h3><p>点击查看详情...</p></div>`).join('');
}

// 导航高亮
function highlightNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .sidebar-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ===== 用户认证相关 =====

// 检查登录状态并更新导航栏
async function checkAuthStatus() {
  const authLink = document.getElementById('authLink');
  if (!authLink) return;
  
  // 检查是否已登录（从localStorage快速判断）
  const sessionStr = localStorage.getItem('supabase.auth.token');
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session && session.currentSession) {
        authLink.href = 'user-center.html';
        authLink.innerHTML = '👤 我的';
        authLink.classList.add('logged-in');
        return;
      }
    } catch (e) {}
  }
  
  // 未登录状态
  authLink.href = 'login.html';
  authLink.innerHTML = '🔐 登录';
  authLink.classList.remove('logged-in');
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  highlightNav();
  checkAuthStatus();  // 检查登录状态
  lazyLoadImages();
  lazyLoadContent();
  
  // 初始化第一个标签
  const firstTab = document.querySelector('.tab');
  if (firstTab) {
    firstTab.click();
  }
  
  // 初始化第一个FAQ
  const firstFaq = document.querySelector('.faq-question');
  if (firstFaq) {
    firstFaq.click();
  }
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
