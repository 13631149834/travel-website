/**
 * 分享功能模块
 * 支持微信、微博、QQ、复制链接等多平台分享
 */

const ShareModule = (function() {
  'use strict';

  // 分享统计存储
  const SHARE_STATS_KEY = 'travel_share_stats';
  
  // 默认配置
  const defaultConfig = {
    url: window.location.href,
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || '',
    image: document.querySelector('meta[property="og:image"]')?.content || 'images/og-image.png',
    platforms: ['wechat', 'weibo', 'qq', 'copy'],
    onSuccess: null,
    onError: null
  };

  // 初始化分享统计
  function initStats() {
    let stats = localStorage.getItem(SHARE_STATS_KEY);
    if (!stats) {
      stats = {
        wechat: 0,
        weibo: 0,
        qq: 0,
        copy: 0,
        total: 0
      };
      localStorage.setItem(SHARE_STATS_KEY, JSON.stringify(stats));
    }
    return JSON.parse(stats);
  }

  // 更新分享统计
  function updateStats(platform) {
    const stats = initStats();
    stats[platform]++;
    stats.total++;
    localStorage.setItem(SHARE_STATS_KEY, JSON.stringify(stats));
    return stats;
  }

  // 获取分享统计
  function getStats() {
    return initStats();
  }

  // 平台分享URL生成
  const shareUrls = {
    weibo: (data) => {
      const url = encodeURIComponent(data.url);
      const title = encodeURIComponent(data.title);
      const pic = encodeURIComponent(data.image);
      return `https://service.weibo.com/share/share.php?url=${url}&title=${title}&pic=${pic}`;
    },
    qq: (data) => {
      const url = encodeURIComponent(data.url);
      const title = encodeURIComponent(data.title);
      const desc = encodeURIComponent(data.description);
      return `https://connect.qq.com/widget/shareqq/iframe_index.html?url=${url}&title=${title}&desc=${desc}`;
    },
    qzone: (data) => {
      const url = encodeURIComponent(data.url);
      const title = encodeURIComponent(data.title);
      const desc = encodeURIComponent(data.description);
      const pic = encodeURIComponent(data.image);
      return `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${url}&title=${title}&desc=${desc}&summary=&pics=${pic}`;
    }
  };

  // 打开分享窗口
  function openShareWindow(url, width = 600, height = 500) {
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    const options = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no`;
    return window.open(url, 'share', options);
  }

  // 分享到微信（复制链接提示）
  function shareToWechat(data) {
    const qrcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.url)}`;
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'share-modal wechat-share-modal';
    modal.innerHTML = `
      <div class="share-modal-content">
        <button class="share-modal-close" aria-label="关闭">&times;</button>
        <h3>分享到微信</h3>
        <p class="share-tip">打开微信扫一扫，或长按识别二维码</p>
        <div class="wechat-qrcode">
          <img src="${qrcodeUrl}" alt="微信二维码" loading="lazy">
        </div>
        <div class="share-url-box">
          <input type="text" value="${data.url}" readonly class="share-url-input">
          <button class="share-copy-btn" data-url="${data.url}">复制链接</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    // 关闭事件
    const closeModal = () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    };
    
    modal.querySelector('.share-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // 复制链接按钮
    modal.querySelector('.share-copy-btn').addEventListener('click', function() {
      copyToClipboard(data.url);
      this.textContent = '已复制!';
      setTimeout(() => this.textContent = '复制链接', 2000);
    });

    updateStats('wechat');
  }

  // 分享到微博
  function shareToWeibo(data) {
    const url = shareUrls.weibo(data);
    openShareWindow(url);
    updateStats('weibo');
  }

  // 分享到QQ
  function shareToQQ(data) {
    const url = shareUrls.qq(data);
    openShareWindow(url);
    updateStats('qq');
  }

  // 分享到QQ空间
  function shareToQzone(data) {
    const url = shareUrls.qzone(data);
    openShareWindow(url);
    updateStats('qq');
  }

  // 复制链接到剪贴板
  async function copyLink(data) {
    try {
      await copyToClipboard(data.url);
      showToast('链接已复制到剪贴板', 'success');
      updateStats('copy');
      return true;
    } catch (err) {
      showToast('复制失败，请手动复制', 'error');
      return false;
    }
  }

  // 复制到剪贴板
  async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  // 显示提示
  function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.share-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `share-toast share-toast-${type}`;
    toast.innerHTML = `
      <span class="share-toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span class="share-toast-message">${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // 生成分享卡片HTML
  function generateShareCard(data) {
    return `
      <div class="share-card-preview">
        <div class="share-card-image">
          <img src="${data.image}" alt="${data.title}" onerror="this.src='images/placeholder.png'">
        </div>
        <div class="share-card-content">
          <h4 class="share-card-title">${data.title}</h4>
          <p class="share-card-desc">${data.description || '点击查看详情'}</p>
          <span class="share-card-source">游导旅游</span>
        </div>
      </div>
    `;
  }

  // 创建分享按钮组
  function createShareButtons(config = {}) {
    const data = { ...defaultConfig, ...config };
    const platforms = data.platforms;

    let buttonsHTML = '<div class="share-buttons">';

    if (platforms.includes('wechat')) {
      buttonsHTML += `
        <button class="share-btn share-btn-wechat" data-platform="wechat" aria-label="分享到微信">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 11.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 2C6.48 2 2 6.48 2 12c0 2.17.7 4.18 1.88 5.82L2 22l4.18-1.88C7.82 21.3 9.83 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
          <span>微信</span>
        </button>`;
    }

    if (platforms.includes('weibo')) {
      buttonsHTML += `
        <button class="share-btn share-btn-weibo" data-platform="weibo" aria-label="分享到微博">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.09 18c-3.69 0-7.09-1.69-7.09-4.28 0-1.35.87-2.91 2.37-4.32 2.14-2.01 4.72-3.06 5.86-2.4.28.16.39.48.23.72-.24.36-.67.44-.98.18-1.07-.87-3.06-1.05-4.35-.59C3.9 10.05 3 11.76 3 13.72c0 2.12 3.07 3.75 6.37 3.75 4.27 0 7.08-2.32 7.08-5.13 0-1.93-1.08-3.47-2.81-4.36-.4-.21-.83-.35-1.26-.41-.27.57-.68 1.31-.83 1.68-.17.4-.06.87.28 1.15.33.27.81.19 1.09-.17.2-.26.61-.77 1.01-1.23.8.62 1.32 1.52 1.32 2.57 0 3.31-3.17 5.78-7.16 5.78zm-.03-9.66c-1.04 0-1.88-.84-1.88-1.88s.84-1.88 1.88-1.88c1.04 0 1.88.84 1.88 1.88s-.84 1.88-1.88 1.88z"/></svg>
          <span>微博</span>
        </button>`;
    }

    if (platforms.includes('qq')) {
      buttonsHTML += `
        <button class="share-btn share-btn-qq" data-platform="qq" aria-label="分享到QQ">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.25 1.166.4 1.536.38.92 1.26 1.99 3.04 1.99.36 0 .72-.04 1.06-.1 2.18-.5 3.6-2.12 4.95-3.91.18.03.36.05.55.05 2.27 0 4.88-1.37 4.88-5.03V9.32c0-5.96-4.03-7.32-6.41-7.32zm-1.49 5.87c-.71 0-1.29-.58-1.29-1.29s.58-1.29 1.29-1.29 1.29.58 1.29 1.29-.58 1.29-1.29 1.29zm3.12 0c-.71 0-1.29-.58-1.29-1.29s.58-1.29 1.29-1.29 1.29.58 1.29 1.29-.58 1.29-1.29 1.29z"/></svg>
          <span>QQ</span>
        </button>`;
    }

    if (platforms.includes('qzone')) {
      buttonsHTML += `
        <button class="share-btn share-btn-qzone" data-platform="qzone" aria-label="分享到QQ空间">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm0-8H9V5h6v4z"/></svg>
          <span>QQ空间</span>
        </button>`;
    }

    if (platforms.includes('copy')) {
      buttonsHTML += `
        <button class="share-btn share-btn-copy" data-platform="copy" aria-label="复制链接">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
          <span>复制</span>
        </button>`;
    }

    buttonsHTML += '</div>';
    return buttonsHTML;
  }

  // 绑定分享按钮事件
  function bindShareEvents(container, config = {}) {
    const data = { ...defaultConfig, ...config };
    
    container.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const platform = this.dataset.platform;
        
        switch(platform) {
          case 'wechat':
            shareToWechat(data);
            break;
          case 'weibo':
            shareToWeibo(data);
            break;
          case 'qq':
            shareToQQ(data);
            break;
          case 'qzone':
            shareToQzone(data);
            break;
          case 'copy':
            copyLink(data);
            break;
        }

        if (data.onSuccess) {
          data.onSuccess(platform);
        }
      });
    });
  }

  // 初始化分享功能
  function init(containerSelector, config = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.warn('分享容器未找到:', containerSelector);
      return null;
    }

    const data = { ...defaultConfig, ...config };
    
    // 插入分享按钮
    container.innerHTML = createShareButtons(data);
    
    // 绑定事件
    bindShareEvents(container, data);
    
    return {
      updateData: (newData) => {
        Object.assign(data, newData);
      },
      share: (platform) => {
        if (platform && shareUrls[platform]) {
          shareUrls[platform](data);
        }
      },
      getStats: getStats
    };
  }

  // 为详情页生成分享数据
  function generateShareData(type, item) {
    const baseUrl = window.location.origin;
    let data = {
      url: window.location.href,
      title: document.title,
      description: '',
      image: ''
    };

    switch(type) {
      case 'guide':
        data = {
          url: `${baseUrl}/guide-detail.html?id=${item.id || ''}`,
          title: item.name ? `导游 ${item.name} - 游导旅游` : document.title,
          description: item.bio || item.intro || '专业导游，伴您畅游',
          image: item.avatar || item.photo || ''
        };
        break;
      case 'destination':
        data = {
          url: `${baseUrl}/destinations.html?city=${item.name || ''}`,
          title: item.name ? `${item.name}旅游攻略 - 游导旅游` : document.title,
          description: item.description || item.intro || '探索精彩目的地',
          image: item.image || item.cover || ''
        };
        break;
      case 'route':
        data = {
          url: `${baseUrl}/route-detail.html?id=${item.id || ''}`,
          title: item.name ? `【${item.name}】路线推荐 - 游导旅游` : document.title,
          description: item.description || item.intro || '精选旅游路线',
          image: item.image || item.cover || ''
        };
        break;
      case 'knowledge':
        data = {
          url: `${baseUrl}/knowledge-detail.html?id=${item.id || ''}`,
          title: item.title ? `${item.title} - 游导旅游` : document.title,
          description: item.summary || item.description || '实用旅游攻略',
          image: item.cover || ''
        };
        break;
    }

    return data;
  }

  // 导出公共接口
  return {
    init,
    createShareButtons,
    generateShareCard,
    generateShareData,
    shareToWechat,
    shareToWeibo,
    shareToQQ,
    shareToQzone,
    copyLink,
    getStats,
    updateStats
  };
})();

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
  // 如果页面有分享容器，自动初始化
  const shareContainer = document.querySelector('.share-container');
  if (shareContainer && !shareContainer.dataset.initialized) {
    shareContainer.dataset.initialized = 'true';
    
    // 获取页面类型和ID
    const pageType = shareContainer.dataset.type || 
                     (window.location.pathname.includes('guide-detail') ? 'guide' :
                      window.location.pathname.includes('route-detail') ? 'route' :
                      window.location.pathname.includes('destinations') ? 'destination' : null);
    
    const itemId = shareContainer.dataset.id || 
                   new URLSearchParams(window.location.search).get('id') || '';
    
    if (pageType) {
      ShareModule.init('.share-container', {
        ...ShareModule.generateShareData(pageType, { id: itemId })
      });
    }
  }
});
