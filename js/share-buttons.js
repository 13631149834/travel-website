/**
 * 分享模块 - Share Module
 * 游导旅游 youdao-travel.com
 * 
 * 功能：
 * - 多平台分享
 * - 复制链接
 * - 二维码生成
 * - 分享统计（模拟）
 * - Toast 提示
 */

const ShareModule = (function() {
  'use strict';

  // 默认配置
  const defaultConfig = {
    url: window.location.href,
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.content || '游导旅游 - 发现你的下一次旅行',
    image: document.querySelector('meta[property="og:image"]')?.content || '',
    siteName: '游导旅游',
    miniProgramPath: ''
  };

  // 分享数据存储
  let shareData = { ...defaultConfig };
  
  // 统计存储
  const STATS_KEY = 'youdao_share_stats';
  let stats = loadStats();

  /**
   * 加载统计
   */
  function loadStats() {
    try {
      const stored = localStorage.getItem(STATS_KEY);
      return stored ? JSON.parse(stored) : {
        total: 0,
        wechat: 0,
        weibo: 0,
        qq: 0,
        qzone: 0,
        douban: 0,
        linkedin: 0,
        copy: 0
      };
    } catch (e) {
      return {
        total: 0,
        wechat: 0,
        weibo: 0,
        qq: 0,
        qzone: 0,
        douban: 0,
        linkedin: 0,
        copy: 0
      };
    }
  }

  /**
   * 保存统计
   */
  function saveStats() {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('无法保存分享统计');
    }
  }

  /**
   * 更新统计
   */
  function updateStats(platform) {
    stats.total++;
    if (stats[platform] !== undefined) {
      stats[platform]++;
    }
    saveStats();
    updateStatsUI();
  }

  /**
   * 更新统计UI
   */
  function updateStatsUI() {
    const totalEl = document.getElementById('statTotalShares');
    const wechatEl = document.getElementById('statWechatShares');
    const weiboEl = document.getElementById('statWeiboShares');
    const qqEl = document.getElementById('statQQShares');
    const copyEl = document.getElementById('statCopyShares');

    if (totalEl) totalEl.textContent = stats.total;
    if (wechatEl) wechatEl.textContent = stats.wechat;
    if (weiboEl) weiboEl.textContent = stats.weibo;
    if (qqEl) qqEl.textContent = stats.qq;
    if (copyEl) copyEl.textContent = stats.copy;

    // 更新平台分布图
    updatePlatformChart();
  }

  /**
   * 更新平台分布图
   */
  function updatePlatformChart() {
    if (stats.total === 0) return;

    const platforms = ['wechat', 'weibo', 'qq', 'qzone', 'douban', 'linkedin'];
    const colors = {
      wechat: 'wechat',
      weibo: 'weibo',
      qq: 'qq',
      qzone: 'qzone',
      douban: 'douban',
      linkedin: 'linkedin'
    };

    platforms.forEach(platform => {
      const percent = ((stats[platform] / stats.total) * 100).toFixed(1);
      const barEl = document.getElementById('bar' + platform.charAt(0).toUpperCase() + platform.slice(1));
      const percentEl = document.getElementById('percent' + platform.charAt(0).toUpperCase() + platform.slice(1));

      if (barEl) {
        barEl.style.width = percent + '%';
      }
      if (percentEl) {
        percentEl.textContent = percent + '%';
      }
    });
  }

  /**
   * 显示 Toast 提示
   */
  function showToast(message, type = 'success') {
    let toast = document.getElementById('shareToast');
    
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'shareToast';
      toast.className = 'share-toast';
      toast.innerHTML = `
        <div class="share-toast-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
        <span class="share-toast-message"></span>
      `;
      document.body.appendChild(toast);
    }

    const iconContainer = toast.querySelector('.share-toast-icon');
    toast.className = 'share-toast share-toast-' + type;
    toast.querySelector('.share-toast-message').textContent = message;

    if (type === 'success') {
      iconContainer.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      `;
    } else if (type === 'error') {
      iconContainer.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      `;
    } else {
      iconContainer.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      `;
    }

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  /**
   * 复制文本到剪贴板
   */
  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const result = document.execCommand('copy');
        document.body.removeChild(textarea);
        return result;
      }
    } catch (e) {
      console.error('复制失败:', e);
      return false;
    }
  }

  /**
   * 打开微信分享弹窗
   */
  function openWechatModal() {
    const modal = document.getElementById('wechatShareModal');
    if (!modal) {
      console.error('未找到微信分享弹窗');
      return;
    }

    // 生成二维码
    const qrContainer = document.getElementById('wechatQrcode');
    const shareUrlInput = document.getElementById('wechatShareUrl');

    if (qrContainer && typeof QRCode !== 'undefined') {
      qrContainer.innerHTML = '';
      QRCode.toCanvas(qrContainer, shareData.url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }).catch(err => {
        console.error('二维码生成失败:', err);
        qrContainer.innerHTML = '<p style="padding: 40px; color: #999;">二维码生成失败</p>';
      });
    }

    if (shareUrlInput) {
      shareUrlInput.value = shareData.url;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /**
   * 关闭微信分享弹窗
   */
  function closeWechatModal() {
    const modal = document.getElementById('wechatShareModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  /**
   * 复制微信分享链接
   */
  async function copyWechatUrl() {
    const success = await copyToClipboard(shareData.url);
    if (success) {
      showToast('链接已复制到剪贴板', 'success');
    } else {
      showToast('复制失败，请手动复制', 'error');
    }
  }

  /**
   * 分享到微信
   */
  function shareToWechat() {
    updateStats('wechat');
    
    // 检测是否在微信中
    const isWechat = /MicroMessenger/i.test(navigator.userAgent);
    
    if (isWechat) {
      // 微信内置浏览器，显示提示
      showToast('请点击右上角菜单进行分享', 'info');
    } else {
      // 非微信环境，打开弹窗显示二维码
      openWechatModal();
    }
  }

  /**
   * 分享到微博
   */
  function shareToWeibo() {
    updateStats('weibo');
    
    const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title + ' - ' + shareData.desc)}&pic=${encodeURIComponent(shareData.image)}`;
    
    window.open(shareUrl, '_blank', 'width=600,height=500,scrollbars=yes');
  }

  /**
   * 分享到QQ
   */
  function shareToQQ() {
    updateStats('qq');
    
    const shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&desc=${encodeURIComponent(shareData.desc)}&pics=${encodeURIComponent(shareData.image)}`;
    
    window.open(shareUrl, '_blank', 'width=600,height=500,scrollbars=yes');
  }

  /**
   * 分享到QQ空间
   */
  function shareToQzone() {
    updateStats('qzone');
    
    const shareUrl = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&desc=${encodeURIComponent(shareData.desc)}&summary=${encodeURIComponent(shareData.desc)}&pics=${encodeURIComponent(shareData.image)}`;
    
    window.open(shareUrl, '_blank', 'width=600,height=500,scrollbars=yes');
  }

  /**
   * 分享到豆瓣
   */
  function shareToDouban() {
    updateStats('douban');
    
    const shareUrl = `https://www.douban.com/share/service?href=${encodeURIComponent(shareData.url)}&name=${encodeURIComponent(shareData.title)}&text=${encodeURIComponent(shareData.desc)}`;
    
    window.open(shareUrl, '_blank', 'width=600,height=500,scrollbars=yes');
  }

  /**
   * 分享到领英
   */
  function shareToLinkedin() {
    updateStats('linkedin');
    
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`;
    
    window.open(shareUrl, '_blank', 'width=600,height=500,scrollbars=yes');
  }

  /**
   * 复制链接
   */
  async function copyLink() {
    updateStats('copy');
    
    const success = await copyToClipboard(shareData.url);
    if (success) {
      showToast('链接已复制到剪贴板', 'success');
    } else {
      showToast('复制失败，请手动复制', 'error');
    }
  }

  /**
   * 打开海报生成器
   */
  function openPosterGenerator() {
    // 跳转到海报生成页面，携带当前分享数据
    const posterUrl = new URL('share/poster.html', window.location.origin);
    posterUrl.searchParams.set('title', shareData.title);
    posterUrl.searchParams.set('desc', shareData.desc);
    posterUrl.searchParams.set('url', shareData.url);
    posterUrl.searchParams.set('image', shareData.image);
    
    window.location.href = posterUrl.toString();
  }

  /**
   * 设置分享数据
   */
  function setShareData(data) {
    shareData = { ...shareData, ...data };
  }

  /**
   * 获取分享数据
   */
  function getShareData() {
    return { ...shareData };
  }

  /**
   * 获取统计数据
   */
  function getStats() {
    return { ...stats };
  }

  /**
   * 重置统计数据
   */
  function resetStats() {
    stats = {
      total: 0,
      wechat: 0,
      weibo: 0,
      qq: 0,
      qzone: 0,
      douban: 0,
      linkedin: 0,
      copy: 0
    };
    saveStats();
    updateStatsUI();
  }

  /**
   * 初始化分享模块
   */
  function init(config = {}) {
    // 合并配置
    shareData = { ...defaultConfig, ...config };

    // 从页面读取 OG 标签
    const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
    const ogDesc = document.querySelector('meta[property="og:description"]')?.content;
    const ogImage = document.querySelector('meta[property="og:image"]')?.content;
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content;

    if (ogTitle) shareData.title = ogTitle;
    if (ogDesc) shareData.desc = ogDesc;
    if (ogImage) shareData.image = ogImage;
    if (ogUrl) shareData.url = ogUrl;

    // 更新按钮 data 属性
    const shareContainer = document.querySelector('.share-buttons-group');
    if (shareContainer) {
      shareContainer.dataset.url = shareData.url;
      shareContainer.dataset.title = shareData.title;
      shareContainer.dataset.desc = shareData.desc;
      shareContainer.dataset.image = shareData.image;
    }

    // 绑定弹窗关闭事件
    const modal = document.getElementById('wechatShareModal');
    if (modal) {
      const overlay = modal.querySelector('.share-modal-overlay');
      if (overlay) {
        overlay.addEventListener('click', closeWechatModal);
      }

      // ESC 关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          closeWechatModal();
        }
      });
    }

    // 更新统计 UI
    updateStatsUI();

    console.log('Share Module 初始化完成', shareData);
  }

  // 导出公共接口
  return {
    init,
    shareToWechat,
    shareToWeibo,
    shareToQQ,
    shareToQzone,
    shareToDouban,
    shareToLinkedin,
    copyLink,
    copyWechatUrl,
    openPosterGenerator,
    openWechatModal,
    closeWechatModal,
    setShareData,
    getShareData,
    getStats,
    resetStats,
    showToast
  };
})();

// 自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ShareModule.init());
} else {
  ShareModule.init();
}

// 导出到全局
window.ShareModule = ShareModule;
