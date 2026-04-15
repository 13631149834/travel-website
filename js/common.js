// ===== 游导旅游共用JS =====

// 移动端导航切换
function toggleNav() {
  const nav = document.querySelector('.nav-links');
  if (nav) {
    nav.classList.toggle('open');
  }
  const toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.classList.toggle('active');
  }
}

// 关闭移动端导航
document.addEventListener('click', function(e) {
  const nav = document.querySelector('.nav-links');
  const toggle = document.querySelector('.nav-toggle');
  if (nav && toggle && !nav.contains(e.target) && !toggle.contains(e.target)) {
    nav.classList.remove('open');
    toggle.classList.remove('active');
  }
});

// 懒加载动画
function initLazyAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  elements.forEach(el => observer.observe(el));
}

// FAQ手风琴
function toggleFaq(element) {
  const item = element.closest('.faq-item');
  if (!item) return;
  
  const wasOpen = item.classList.contains('open');
  
  // 关闭所有
  document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
  
  // 切换当前
  if (!wasOpen) {
    item.classList.add('open');
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  initLazyAnimations();
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href.length > 1) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});
