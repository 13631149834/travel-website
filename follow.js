/**
 * 游导旅游 - 关注功能模块
 * 支持关注导游、关注用户、粉丝列表
 */

const FollowModule = (function() {
  'use strict';

  // 状态管理
  const state = {
    currentUser: null,
    following: new Set(),
    followers: [],
    isLoading: false
  };

  // API 模拟数据
  const mockUsers = [
    { id: 'g001', name: '李导游', type: 'guide', avatar: '🎤', followers: 1256, following: 89, bio: '专注欧洲深度游10年' },
    { id: 'g002', name: '张导', type: 'guide', avatar: '🗺️', followers: 892, following: 156, bio: '日本专业地接' },
    { id: 'u001', name: '旅行家小王', type: 'user', avatar: '🧳', followers: 456, following: 234, bio: '环球旅行者' },
    { id: 'u002', name: '摄影达人', type: 'user', avatar: '📷', followers: 2103, following: 567, bio: '用镜头记录世界' },
    { id: 'g003', name: '美食导游', type: 'guide', avatar: '🍜', followers: 789, following: 123, bio: '舌尖上的旅行' }
  ];

  // 初始化
  function init(userId) {
    state.currentUser = userId || 'u001';
    loadUserFollowing();
    bindEvents();
    renderFollowButtons();
  }

  // 加载用户关注列表
  function loadUserFollowing() {
    // 模拟：从localStorage获取已关注的用户
    const saved = localStorage.getItem(`following_${state.currentUser}`);
    if (saved) {
      state.following = new Set(JSON.parse(saved));
    } else {
      // 默认关注一些用户
      state.following = new Set(['g001', 'g002']);
      saveFollowing();
    }
    updateFollowCounts();
  }

  // 保存关注列表
  function saveFollowing() {
    localStorage.setItem(`following_${state.currentUser}`, 
      JSON.stringify([...state.following]));
  }

  // 更新关注数量显示
  function updateFollowCounts() {
    document.querySelectorAll('[data-follower-count]').forEach(el => {
      const userId = el.dataset.userId;
      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        el.textContent = formatCount(user.followers + (state.following.has(userId) ? 1 : 0));
      }
    });
  }

  // 数字格式化
  function formatCount(num) {
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  }

  // 关注用户
  async function follow(userId) {
    if (state.isLoading) return;
    state.isLoading = true;

    const btn = document.querySelector(`[data-follow-btn="${userId}"]`);
    if (btn) btn.disabled = true;

    // 模拟API延迟
    await sleep(300);

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      showToast('用户不存在', 'error');
      state.isLoading = false;
      if (btn) btn.disabled = false;
      return;
    }

    if (state.following.has(userId)) {
      // 取消关注
      state.following.delete(userId);
      user.followers = Math.max(0, user.followers - 1);
      updateFollowButton(userId, false);
      showToast(`已取消关注 ${user.name}`, 'info');
    } else {
      // 添加关注
      state.following.add(userId);
      user.followers += 1;
      updateFollowButton(userId, true);
      showToast(`已关注 ${user.name}`, 'success');
    }

    saveFollowing();
    updateFollowCounts();
    state.isLoading = false;
    if (btn) btn.disabled = false;

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('followChange', {
      detail: { userId, following: state.following.has(userId) }
    }));
  }

  // 更新关注按钮状态
  function updateFollowButton(userId, isFollowing) {
    const btn = document.querySelector(`[data-follow-btn="${userId}"]`);
    if (!btn) return;

    if (isFollowing) {
      btn.classList.add('following');
      btn.innerHTML = '✓ 已关注';
    } else {
      btn.classList.remove('following');
      btn.innerHTML = '+ 关注';
    }
  }

  // 渲染所有关注按钮
  function renderFollowButtons() {
    document.querySelectorAll('[data-follow-btn]').forEach(btn => {
      const userId = btn.dataset.followBtn;
      if (state.following.has(userId)) {
        btn.classList.add('following');
        btn.innerHTML = '✓ 已关注';
      }
    });
  }

  // 打开粉丝列表
  function openFollowersModal(userId) {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return;

    const modal = createModal('粉丝列表', `
      <div class="followers-list">
        ${mockUsers.slice(0, 5).map(u => `
          <div class="follow-item">
            <div class="follow-avatar">${u.avatar}</div>
            <div class="follow-info">
              <div class="follow-name">${u.name}</div>
              <div class="follow-bio">${u.bio}</div>
            </div>
            <button class="follow-btn-sm ${state.following.has(u.id) ? 'following' : ''}" 
                    data-follow-btn="${u.id}" onclick="FollowModule.follow('${u.id}')">
              ${state.following.has(u.id) ? '✓ 已关注' : '+ 关注'}
            </button>
          </div>
        `).join('')}
      </div>
    `);
    document.body.appendChild(modal);
  }

  // 打开关注列表
  function openFollowingModal(userId) {
    const modal = createModal('关注列表', `
      <div class="following-list">
        ${[...state.following].map(fId => {
          const u = mockUsers.find(x => x.id === fId);
          if (!u) return '';
          return `
            <div class="follow-item">
              <div class="follow-avatar">${u.avatar}</div>
              <div class="follow-info">
                <div class="follow-name">${u.name}</div>
                <div class="follow-bio">${u.bio}</div>
              </div>
              <button class="follow-btn-sm following" data-follow-btn="${u.id}" onclick="FollowModule.follow('${u.id}')">
                ✓ 已关注
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `);
    document.body.appendChild(modal);
  }

  // 创建模态框
  function createModal(title, content) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box follow-modal">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">${content}</div>
      </div>
    `;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    return overlay;
  }

  // Toast提示
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

  // 工具函数
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 绑定事件
  function bindEvents() {
    document.addEventListener('click', (e) => {
      const followBtn = e.target.closest('[data-follow-btn]');
      if (followBtn) {
        e.preventDefault();
        follow(followBtn.dataset.followBtn);
      }

      const followersLink = e.target.closest('[data-followers]');
      if (followersLink) {
        e.preventDefault();
        openFollowersModal(followersLink.dataset.followers);
      }

      const followingLink = e.target.closest('[data-following]');
      if (followingLink) {
        e.preventDefault();
        openFollowingModal(followingLink.dataset.following);
      }
    });
  }

  // 获取关注状态
  function isFollowing(userId) {
    return state.following.has(userId);
  }

  // 获取关注列表
  function getFollowingList() {
    return [...state.following].map(id => mockUsers.find(u => u.id === id)).filter(Boolean);
  }

  // 获取粉丝列表
  function getFollowersList(userId) {
    // 模拟返回粉丝列表
    return mockUsers.filter(u => u.id !== userId).slice(0, 5);
  }

  // 公开API
  return {
    init,
    follow,
    isFollowing,
    getFollowingList,
    getFollowersList,
    openFollowersModal,
    openFollowingModal
  };
})();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否存在需要初始化的关注模块
  if (document.querySelector('[data-follow-btn], [data-followers], [data-following]')) {
    FollowModule.init();
  }
});
