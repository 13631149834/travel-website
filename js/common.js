// 导游证备考网站 - 通用脚本

function toggleNav() {
  document.querySelector('.nav-links').classList.toggle('open');
}

// Toast提示
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:8px;color:white;font-size:14px;z-index:9999;animation:slideDown 0.3s ease';
  
  const colors = { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' };
  toast.style.backgroundColor = colors[type] || colors.info;
  
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// 页面加载时添加动画
document.addEventListener('DOMContentLoaded', function() {
  // 平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
