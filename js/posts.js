/**
 * 游导旅游 - 动态发布功能模块
 * 支持发布动态、图片上传、点赞评论
 */

const PostsModule = (function() {
  'use strict';

  // 状态管理
  const state = {
    currentUser: null,
    posts: [],
    currentTab: 'all',
    isLoading: false
  };

  // 模拟帖子数据
  const mockPosts = [
    {
      id: 'p001',
      userId: 'g001',
      userName: '李导游',
      userAvatar: '🎤',
      userType: 'guide',
      content: '刚刚结束的法国深度游，埃菲尔铁塔夜景太美了！🏯✨ 这次带团去了当地人才知道的小众餐厅，烤蜗牛和法式鹅肝绝配！',
      images: ['https://picsum.photos/400/300?random=1'],
      location: '巴黎·法国',
      likes: 234,
      comments: 45,
      shares: 12,
      isLiked: false,
      createTime: Date.now() - 3600000,
      tags: ['法国游', '美食探店', '夜景打卡']
    },
    {
      id: 'p002',
      userId: 'u002',
      userName: '摄影达人',
      userAvatar: '📷',
      userType: 'user',
      content: '川西环线自驾分享｜这条路线太适合拍大片了！📸 从成都出发，经康定、新都桥到稻城亚丁，一路风景如画。强烈推荐秋天去！',
      images: [
        'https://picsum.photos/400/300?random=2',
        'https://picsum.photos/400/300?random=3',
        'https://picsum.photos/400/300?random=4'
      ],
      location: '川西·四川',
      likes: 567,
      comments: 89,
      shares: 45,
      isLiked: true,
      createTime: Date.now() - 7200000,
      tags: ['自驾游', '川西', '摄影']
    },
    {
      id: 'p003',
      userId: 'g003',
      userName: '美食导游',
      userAvatar: '🍜',
      userType: 'guide',
      content: '东京筑地市场攻略来了！🈺️ 清晨5点去排队，尝到了最新鲜的金枪鱼大腹和海胆寿司。提醒大家记得带现金，很多老店不支持刷卡哦~',
      images: ['https://picsum.photos/400/300?random=5'],
      location: '东京·日本',
      likes: 892,
      comments: 156,
      shares: 78,
      isLiked: false,
      createTime: Date.now() - 86400000,
      tags: ['日本美食', '筑地市场', '寿司']
    }
  ];

  // 初始化
  function init(userId) {
    state.currentUser = userId || 'u001';
    loadPosts();
    bindEvents();
  }

  // 加载帖子
  function loadPosts() {
    const saved = localStorage.getItem('posts_data');
    if (saved) {
      state.posts = JSON.parse(saved);
    } else {
      state.posts = [...mockPosts];
      savePosts();
    }
  }

  // 保存帖子
  function savePosts() {
    localStorage.setItem('posts_data', JSON.stringify(state.posts));
  }

  // 发布动态
  async function createPost(content, images, location, tags) {
    if (!content.trim()) {
      showToast('请输入内容', 'error');
      return false;
    }

    state.isLoading = true;
    showLoading(true);

    // 模拟上传延迟
    await sleep(800);

    const newPost = {
      id: 'p' + Date.now(),
      userId: state.currentUser,
      userName: '我',
      userAvatar: '🧳',
      userType: 'user',
      content: content,
      images: images || [],
      location: location || '',
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      createTime: Date.now(),
      tags: tags || []
    };

    state.posts.unshift(newPost);
    savePosts();
    
    state.isLoading = false;
    showLoading(false);
    showToast('发布成功！', 'success');

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('postCreated', { detail: newPost }));

    return true;
  }

  // 点赞/取消点赞
  async function toggleLike(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
    savePosts();

    updatePostUI(postId);
    
    // 触发动画
    const likeBtn = document.querySelector(`[data-like="${postId}"]`);
    if (likeBtn) {
      likeBtn.classList.add('liked');
      setTimeout(() => likeBtn.classList.remove('liked'), 300);
    }
  }

  // 更新帖子UI
  function updatePostUI(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    const likeEl = document.querySelector(`[data-like="${postId}"]`);
    const likesCountEl = document.querySelector(`[data-likes-count="${postId}"]`);
    const commentsCountEl = document.querySelector(`[data-comments-count="${postId}"]`);

    if (likeEl) {
      likeEl.classList.toggle('active', post.isLiked);
      likeEl.innerHTML = post.isLiked ? '❤️' : '🤍';
    }
    if (likesCountEl) likesCountEl.textContent = formatCount(post.likes);
    if (commentsCountEl) commentsCountEl.textContent = formatCount(post.comments);
  }

  // 打开评论
  function openComments(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    const modal = createCommentsModal(post);
    document.body.appendChild(modal);
  }

  // 创建评论模态框
  function createCommentsModal(post) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay comments-modal-overlay';
    overlay.innerHTML = `
      <div class="comments-modal">
        <div class="comments-header">
          <h3>评论 (${post.comments})</h3>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="comments-list" id="commentsList">
          ${generateCommentsHTML(post.id)}
        </div>
        <div class="comments-input">
          <input type="text" placeholder="写下你的评论..." id="commentInput" />
          <button onclick="PostsModule.submitComment('${post.id}')">发送</button>
        </div>
      </div>
    `;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    // 回车发送
    setTimeout(() => {
      const input = document.getElementById('commentInput');
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            PostsModule.submitComment(post.id);
          }
        });
        input.focus();
      }
    }, 100);
    return overlay;
  }

  // 生成模拟评论
  function generateCommentsHTML(postId) {
    const comments = [
      { user: '旅行家小王', avatar: '🧳', content: '太美了！下次一定要去', time: '2小时前' },
      { user: '张三', avatar: '😊', content: '求攻略！', time: '3小时前' },
      { user: '李四', avatar: '🙋', content: '收藏了，谢谢分享', time: '5小时前' }
    ];
    return comments.map(c => `
      <div class="comment-item">
        <span class="comment-avatar">${c.avatar}</span>
        <div class="comment-content">
          <div class="comment-user">${c.user}</div>
          <div class="comment-text">${c.content}</div>
          <div class="comment-time">${c.time}</div>
        </div>
      </div>
    `).join('');
  }

  // 提交评论
  function submitComment(postId) {
    const input = document.getElementById('commentInput');
    if (!input || !input.value.trim()) {
      showToast('请输入评论内容', 'error');
      return;
    }

    const post = state.posts.find(p => p.id === postId);
    if (post) {
      post.comments += 1;
      savePosts();
      updatePostUI(postId);
      showToast('评论成功', 'success');
      input.value = '';
      // 刷新评论列表
      const list = document.getElementById('commentsList');
      if (list) {
        list.innerHTML = generateCommentsHTML(postId);
      }
    }
  }

  // 分享帖子
  function sharePost(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    if (navigator.share) {
      navigator.share({
        title: `${post.userName}的旅行分享`,
        text: post.content.substring(0, 100),
        url: window.location.href
      });
    } else {
      // 复制链接
      copyToClipboard(window.location.href);
      showToast('链接已复制', 'success');
    }
  }

  // 打开发布弹窗
  function openPublishModal() {
    const modal = createPublishModal();
    document.body.appendChild(modal);
  }

  // 创建发布弹窗
  function createPublishModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay publish-modal-overlay';
    overlay.innerHTML = `
      <div class="publish-modal">
        <div class="publish-header">
          <h3>发布动态</h3>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="publish-body">
          <textarea id="postContent" placeholder="分享你的旅行故事..." maxlength="500"></textarea>
          <div class="image-preview" id="imagePreview"></div>
          <div class="publish-tools">
            <label class="tool-btn" title="添加图片">
              <input type="file" accept="image/*" multiple style="display:none" onchange="PostsModule.handleImageUpload(this)" />
              📷
            </label>
            <input type="text" class="location-input" id="postLocation" placeholder="添加位置" />
          </div>
          <input type="text" class="tags-input" id="postTags" placeholder="添加标签，用逗号分隔" />
        </div>
        <div class="publish-footer">
          <span class="char-count"><span id="charCount">0</span>/500</span>
          <button class="publish-btn" onclick="PostsModule.submitPost()">发布</button>
        </div>
      </div>
    `;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    // 字符计数
    setTimeout(() => {
      const textarea = document.getElementById('postContent');
      const charCount = document.getElementById('charCount');
      if (textarea && charCount) {
        textarea.addEventListener('input', () => {
          charCount.textContent = textarea.value.length;
        });
      }
    }, 100);
    return overlay;
  }

  // 处理图片上传
  function handleImageUpload(input) {
    const files = input.files;
    if (!files.length) return;

    const preview = document.getElementById('imagePreview');
    if (!preview) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'preview-img';
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }

  // 提交帖子
  async function submitPost() {
    const content = document.getElementById('postContent')?.value || '';
    const location = document.getElementById('postLocation')?.value || '';
    const tagsInput = document.getElementById('postTags')?.value || '';
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    
    const preview = document.getElementById('imagePreview');
    const images = [];
    if (preview) {
      preview.querySelectorAll('img').forEach(img => {
        images.push(img.src);
      });
    }

    const success = await createPost(content, images, location, tags);
    if (success) {
      const modal = document.querySelector('.publish-modal-overlay');
      if (modal) modal.remove();
    }
  }

  // 渲染帖子列表
  function renderPosts(containerId, posts) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = posts.map(post => generatePostHTML(post)).join('');
  }

  // 生成帖子HTML
  function generatePostHTML(post) {
    const timeAgo = formatTimeAgo(post.createTime);
    const imagesHTML = post.images.length > 0 ? `
      <div class="post-images ${post.images.length === 1 ? 'single' : 'multiple'}">
        ${post.images.map((img, i) => `
          <img src="${img}" alt="旅行照片${i + 1}" loading="lazy" />
        `).join('')}
      </div>
    ` : '';

    const tagsHTML = post.tags.length > 0 ? `
      <div class="post-tags">
        ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
      </div>
    ` : '';

    return `
      <div class="post-card" data-post-id="${post.id}">
        <div class="post-header">
          <div class="post-user">
            <span class="user-avatar">${post.userAvatar}</span>
            <div class="user-info">
              <span class="user-name">${post.userName}</span>
              ${post.userType === 'guide' ? '<span class="user-badge">认证导游</span>' : ''}
            </div>
          </div>
          <button class="follow-btn-small ${FollowModule?.isFollowing(post.userId) ? 'following' : ''}" 
                  data-follow-btn="${post.userId}">${FollowModule?.isFollowing(post.userId) ? '✓ 已关注' : '+ 关注'}</button>
        </div>
        <div class="post-content">${post.content}</div>
        ${imagesHTML}
        ${post.location ? `<div class="post-location">📍 ${post.location}</div>` : ''}
        ${tagsHTML}
        <div class="post-actions">
          <button class="action-btn like-btn ${post.isLiked ? 'active' : ''}" data-like="${post.id}" onclick="PostsModule.toggleLike('${post.id}')">
            ${post.isLiked ? '❤️' : '🤍'} <span data-likes-count="${post.id}">${formatCount(post.likes)}</span>
          </button>
          <button class="action-btn comment-btn" onclick="PostsModule.openComments('${post.id}')">
            💬 <span data-comments-count="${post.id}">${formatCount(post.comments)}</span>
          </button>
          <button class="action-btn share-btn" onclick="PostsModule.sharePost('${post.id}')">
            🔗 ${formatCount(post.shares)}
          </button>
        </div>
        <div class="post-time">${timeAgo}</div>
      </div>
    `;
  }

  // 工具函数
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function formatCount(num) {
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  }

  function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return '刚刚';
    if (seconds < 3600) return Math.floor(seconds / 60) + '分钟前';
    if (seconds < 86400) return Math.floor(seconds / 3600) + '小时前';
    if (seconds < 604800) return Math.floor(seconds / 86400) + '天前';
    return new Date(timestamp).toLocaleDateString('zh-CN');
  }

  function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  function showLoading(show) {
    // 实现加载状态
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // 绑定事件
  function bindEvents() {
    document.addEventListener('click', (e) => {
      // 点赞按钮
      const likeBtn = e.target.closest('[data-like]');
      if (likeBtn) {
        e.preventDefault();
        toggleLike(likeBtn.dataset.like);
      }
    });
  }

  // 获取所有帖子
  function getPosts() {
    return state.posts;
  }

  // 获取帖子数量
  function getPostsCount() {
    return state.posts.length;
  }

  // 公开API
  return {
    init,
    createPost,
    toggleLike,
    openComments,
    submitComment,
    sharePost,
    openPublishModal,
    handleImageUpload,
    submitPost,
    renderPosts,
    generatePostHTML,
    getPosts,
    getPostsCount
  };
})();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('[data-post-id], .post-card, [data-publish]')) {
    PostsModule.init();
  }
});
