// 游导旅游 - 通用脚本
document.addEventListener('DOMContentLoaded', function() {
  initFavorite();
  initShare();
  initFilterTabs();
});

// 收藏功能
function initFavorite() {
  const favoriteBtn = document.querySelector('.favorite-btn');
  if (!favoriteBtn) return;
  
  // 从localStorage读取收藏状态
  const destination = favoriteBtn.dataset.destination;
  const isFavorited = localStorage.getItem('favorite_' + destination) === 'true';
  
  if (isFavorited) {
    favoriteBtn.classList.add('liked');
    favoriteBtn.querySelector('.icon').textContent = '❤️';
  }
  
  favoriteBtn.addEventListener('click', function() {
    const isLiked = this.classList.toggle('liked');
    localStorage.setItem('favorite_' + destination, isLiked);
    
    if (isLiked) {
      this.querySelector('.icon').textContent = '❤️';
      showToast('已添加到收藏');
    } else {
      this.querySelector('.icon').textContent = '🤍';
      showToast('已取消收藏');
    }
  });
}

// 分享功能
function initShare() {
  const shareBtn = document.querySelector('.share-btn');
  const modal = document.getElementById('shareModal');
  
  if (!shareBtn || !modal) return;
  
  shareBtn.addEventListener('click', function() {
    modal.classList.add('active');
  });
  
  modal.addEventListener('click', function(e) {
    if (e.target === this) {
      this.classList.remove('active');
    }
  });
  
  // 分享平台
  document.querySelectorAll('.share-platform').forEach(btn => {
    btn.addEventListener('click', function() {
      const type = this.dataset.type;
      shareTo(type);
      modal.classList.remove('active');
    });
  });
  
  // 复制链接
  document.querySelector('.share-copy')?.addEventListener('click', function() {
    copyLink();
  });
}

function shareTo(type) {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  
  const shareUrls = {
    wechat: 'weixin://',
    weibo: `https://service.weibo.com/share/share.php?url=${url}&title=${title}`,
    qq: `https://connect.qq.com/widget/shareqq/iframe_index.html?url=${url}&title=${title}`,
    qzone: `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${url}&title=${title}`
  };
  
  if (shareUrls[type]) {
    window.open(shareUrls[type], '_blank', 'width=600,height=400');
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    showToast('链接已复制到剪贴板');
  }).catch(() => {
    showToast('复制失败，请手动复制');
  });
}

// 筛选标签
function initFilterTabs() {
  const tabs = document.querySelectorAll('.filter-tab');
  const contents = document.querySelectorAll('.filter-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const filter = this.dataset.filter;
      
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      contents.forEach(content => {
        if (filter === 'all' || content.dataset.category === filter) {
          content.style.display = '';
        } else {
          content.style.display = 'none';
        }
      });
    });
  });
}

// Toast提示
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// 导游预约
function bookGuide(guideId) {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.add('active');
  }
}
