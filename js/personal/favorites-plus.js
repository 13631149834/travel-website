/**
 * 私人收藏增强功能
 * Personal Favorites Plus
 */

class PersonalFavoritesPlus {
  constructor() {
    this.storageKey = 'personal_favorites_plus';
    this.collectionsKey = 'personal_collections';
    this.remindersKey = 'personal_reminders';
    this.init();
  }

  init() {
    this.loadData();
    this.setupEventListeners();
    this.renderFavorites();
  }

  loadData() {
    this.favorites = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    this.collections = JSON.parse(localStorage.getItem(this.collectionsKey) || '[]');
    this.reminders = JSON.parse(localStorage.getItem(this.remindersKey) || '[]');
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
    localStorage.setItem(this.collectionsKey, JSON.stringify(this.collections));
    localStorage.setItem(this.remindersKey, JSON.stringify(this.reminders));
  }

  setupEventListeners() {
    // 监听收藏按钮点击
    document.addEventListener('click', (e) => {
      if (e.target.closest('.favorite-btn')) {
        const btn = e.target.closest('.favorite-btn');
        const itemId = btn.dataset.itemId;
        const itemType = btn.dataset.itemType;
        this.toggleFavorite(itemId, itemType);
      }
    });
  }

  // 添加收藏
  addFavorite(item) {
    const favoriteItem = {
      id: Date.now(),
      itemId: item.itemId,
      itemType: item.itemType,
      title: item.title,
      description: item.description || '',
      image: item.image || '',
      price: item.price || 0,
      addedAt: new Date().toISOString(),
      tags: item.tags || [],
      notes: '',
      isPrivate: true,
      shareLink: this.generateShareLink(item)
    };

    // 检查是否已收藏
    const exists = this.favorites.find(f => f.itemId === item.itemId);
    if (exists) {
      this.showToast('已在收藏夹中');
      return false;
    }

    this.favorites.unshift(favoriteItem);
    this.saveData();
    this.showToast('已添加到私人收藏');
    return true;
  }

  // 移除收藏
  removeFavorite(itemId) {
    this.favorites = this.favorites.filter(f => f.id !== itemId);
    this.saveData();
    this.renderFavorites();
    this.showToast('已从收藏夹移除');
  }

  // 切换收藏状态
  toggleFavorite(itemId, itemType) {
    const exists = this.favorites.find(f => f.itemId === itemId);
    if (exists) {
      this.removeFavorite(exists.id);
    } else {
      this.addFavorite({
        itemId,
        itemType,
        title: '收藏项目',
        description: ''
      });
    }
  }

  // 创建收藏集
  createCollection(name, description = '') {
    const collection = {
      id: Date.now(),
      name,
      description,
      items: [],
      createdAt: new Date().toISOString(),
      coverImage: '',
      isPublic: false
    };

    this.collections.push(collection);
    this.saveData();
    this.showToast('收藏集已创建');
    return collection;
  }

  // 添加到收藏集
  addToCollection(collectionId, itemId) {
    const collection = this.collections.find(c => c.id === collectionId);
    const item = this.favorites.find(f => f.id === itemId);

    if (collection && item) {
      if (!collection.items.includes(itemId)) {
        collection.items.push(itemId);
        this.saveData();
        this.showToast(`已添加到「${collection.name}」`);
      } else {
        this.showToast('该项目已在收藏集中');
      }
    }
  }

  // 创建提醒
  createReminder(itemId, remindAt, message) {
    const reminder = {
      id: Date.now(),
      itemId,
      remindAt,
      message,
      isTriggered: false,
      createdAt: new Date().toISOString()
    };

    this.reminders.push(reminder);
    this.saveData();
    this.scheduleReminder(reminder);
    this.showToast('提醒已设置');
    return reminder;
  }

  // 安排提醒
  scheduleReminder(reminder) {
    const now = new Date();
    const remindTime = new Date(reminder.remindAt);
    const delay = remindTime.getTime() - now.getTime();

    if (delay > 0 && delay < 2147483647) { // 最大延迟时间
      setTimeout(() => {
        this.triggerReminder(reminder);
      }, delay);
    }
  }

  // 触发提醒
  triggerReminder(reminder) {
    if (Notification.permission === 'granted') {
      new Notification('私人收藏提醒', {
        body: reminder.message,
        icon: 'images/favicon.ico'
      });
    }
    reminder.isTriggered = true;
    this.saveData();
  }

  // 生成分享链接
  generateShareLink(item) {
    const shareData = {
      id: item.itemId,
      type: item.itemType,
      title: item.title
    };
    return `https://youdao-travel.com/share?data=${btoa(JSON.stringify(shareData))}`;
  }

  // 分享收藏
  shareFavorite(itemId) {
    const item = this.favorites.find(f => f.id === itemId);
    if (item && navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: item.shareLink
      }).catch(() => {
        this.copyToClipboard(item.shareLink);
      });
    } else if (item) {
      this.copyToClipboard(item.shareLink);
    }
  }

  // 复制到剪贴板
  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('链接已复制到剪贴板');
    }).catch(() => {
      this.showToast('复制失败，请手动复制');
    });
  }

  // 更新收藏备注
  updateNotes(itemId, notes) {
    const item = this.favorites.find(f => f.id === itemId);
    if (item) {
      item.notes = notes;
      this.saveData();
      this.showToast('备注已更新');
    }
  }

  // 搜索收藏
  searchFavorites(query) {
    const lowerQuery = query.toLowerCase();
    return this.favorites.filter(f => 
      f.title.toLowerCase().includes(lowerQuery) ||
      f.description.toLowerCase().includes(lowerQuery) ||
      f.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }

  // 筛选收藏
  filterByType(type) {
    return this.favorites.filter(f => f.itemType === type);
  }

  // 按时间排序
  sortByDate(order = 'desc') {
    return [...this.favorites].sort((a, b) => {
      const dateA = new Date(a.addedAt);
      const dateB = new Date(b.addedAt);
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  // 导出收藏数据
  exportData() {
    const data = {
      favorites: this.favorites,
      collections: this.collections,
      reminders: this.reminders,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `私人收藏_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('收藏数据已导出');
  }

  // 导入收藏数据
  importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.favorites) this.favorites = data.favorites;
        if (data.collections) this.collections = data.collections;
        if (data.reminders) this.reminders = data.reminders;
        this.saveData();
        this.renderFavorites();
        this.showToast('收藏数据已导入');
      } catch (err) {
        this.showToast('导入失败，文件格式错误');
      }
    };
    reader.readAsText(file);
  }

  // 渲染收藏列表
  renderFavorites(containerId = 'favorites-list') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (this.favorites.length === 0) {
      container.innerHTML = this.renderEmptyState();
      return;
    }

    container.innerHTML = `
      <div class="favorites-grid">
        ${this.favorites.map(item => this.renderFavoriteCard(item)).join('')}
      </div>
    `;

    this.attachCardListeners();
  }

  // 渲染单个收藏卡片
  renderFavoriteCard(item) {
    const typeIcons = {
      guide: '🧑‍🏫',
      destination: '📍',
      activity: '🎯',
      route: '🗺️'
    };

    return `
      <div class="favorite-card" data-id="${item.id}">
        ${item.image ? `<img src="${item.image}" alt="${item.title}" class="favorite-image" loading="lazy">` : ''}
        <span class="vip-exclusive-tag">私人珍藏</span>
        <div class="favorite-content">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span>${typeIcons[item.itemType] || '⭐'}</span>
            <h4>${item.title}</h4>
          </div>
          ${item.description ? `<p>${item.description}</p>` : ''}
          ${item.notes ? `<p style="color: #D4AF37; font-style: italic;">📝 ${item.notes}</p>` : ''}
          <div class="favorite-meta">
            <span class="favorite-date">${this.formatDate(item.addedAt)}</span>
            <div class="favorite-actions">
              <button onclick="favoritesPlus.shareFavorite(${item.id})" title="分享">分享</button>
              <button onclick="favoritesPlus.editNotes(${item.id})" title="编辑备注">备注</button>
              <button onclick="favoritesPlus.removeFavorite(${item.id})" title="移除" style="color: #EF4444;">移除</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 渲染空状态
  renderEmptyState() {
    return `
      <div class="empty-state" style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 5rem; margin-bottom: 20px;">💎</div>
        <h3 style="color: #1f2937; margin-bottom: 12px;">您的私人收藏夹为空</h3>
        <p style="color: #6c757d; margin-bottom: 24px;">开始探索，收藏您心仪的旅行目的地和体验</p>
        <a href="destinations.html" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #fff; border-radius: 25px; text-decoration: none; font-weight: 600;">
          探索旅行目的地
        </a>
      </div>
    `;
  }

  // 附加卡片事件监听
  attachCardListeners() {
    // 卡片悬停效果
    document.querySelectorAll('.favorite-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });
  }

  // 编辑备注
  editNotes(itemId) {
    const item = this.favorites.find(f => f.id === itemId);
    if (!item) return;

    const notes = prompt('添加私人备注：', item.notes || '');
    if (notes !== null) {
      this.updateNotes(itemId, notes);
    }
  }

  // 格式化日期
  formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 显示提示消息
  showToast(message) {
    let toast = document.querySelector('.favorites-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'favorites-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        padding: 14px 28px;
        background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
        color: #fff;
        border-radius: 25px;
        font-size: 0.95rem;
        font-weight: 500;
        box-shadow: 0 8px 30px rgba(212, 175, 55, 0.4);
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.bottom = '30px';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.bottom = '50px';
    }, 2500);
  }

  // 获取统计数据
  getStats() {
    return {
      total: this.favorites.length,
      byType: this.favorites.reduce((acc, f) => {
        acc[f.itemType] = (acc[f.itemType] || 0) + 1;
        return acc;
      }, {}),
      collections: this.collections.length,
      reminders: this.reminders.filter(r => !r.isTriggered).length
    };
  }
}

// 全局实例
let favoritesPlus;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  favoritesPlus = new PersonalFavoritesPlus();
});

// 导出给全局使用
window.favoritesPlus = favoritesPlus;
