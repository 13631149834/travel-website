/**
 * 消息中心脚本
 * 游导旅游 - 消息通知系统
 */

(function() {
  'use strict';

  // 消息状态管理
  const MessageState = {
    messages: [],
    currentFilter: 'all',
    selectedIds: new Set(),
    isSelectMode: false,
    
    // 从localStorage加载
    load() {
      const stored = localStorage.getItem('userMessages');
      if (stored) {
        this.messages = JSON.parse(stored);
      }
      return this;
    },
    
    // 保存到localStorage
    save() {
      localStorage.setItem('userMessages', JSON.stringify(this.messages));
      this.dispatchUpdate();
    },
    
    // 获取未读数
    getUnreadCount() {
      return this.messages.filter(m => !m.isRead).length;
    },
    
    // 获取某类型未读数
    getUnreadCountByType(type) {
      return this.messages.filter(m => m.type === type && !m.isRead).length;
    },
    
    // 获取总数
    getTotalCount() {
      return this.messages.length;
    },
    
    // 获取某类型总数
    getTotalCountByType(type) {
      return this.messages.filter(m => m.type === type).length;
    },
    
    // 按筛选获取消息
    getFiltered() {
      let filtered = this.messages;
      if (this.currentFilter !== 'all') {
        filtered = this.messages.filter(m => m.type === this.currentFilter);
      }
      // 排序：置顶优先，然后按时间倒序
      return filtered.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    },
    
    // 标记已读
    markAsRead(id) {
      const msg = this.messages.find(m => m.id === id);
      if (msg) {
        msg.isRead = true;
        this.save();
      }
    },
    
    // 全部已读
    markAllAsRead() {
      this.messages.forEach(m => m.isRead = true);
      this.save();
    },
    
    // 标记选中已读
    markSelectedAsRead() {
      this.selectedIds.forEach(id => this.markAsRead(id));
    },
    
    // 删除消息
    delete(id) {
      this.messages = this.messages.filter(m => m.id !== id);
      this.save();
    },
    
    // 删除选中
    deleteSelected() {
      this.messages = this.messages.filter(m => !this.selectedIds.has(m.id));
      this.selectedIds.clear();
      this.isSelectMode = false;
      this.save();
    },
    
    // 获取消息详情
    getById(id) {
      return this.messages.find(m => m.id === id);
    },
    
    // 添加消息（模拟推送）
    add(message) {
      const newMsg = {
        id: 'msg-' + Date.now(),
        ...message,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      this.messages.unshift(newMsg);
      this.save();
      return newMsg;
    },
    
    // 派发更新事件
    dispatchUpdate() {
      window.dispatchEvent(new CustomEvent('messagesUpdated', {
        detail: { count: this.getUnreadCount() }
      }));
    }
  };

  // 格式化时间
  function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  // 格式化日期时间
  function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  // 获取类型信息
  const typeConfig = {
    system: { name: '系统通知', icon: '⚙️', color: '#64748b' },
    activity: { name: '活动通知', icon: '🎉', color: '#f59e0b' },
    interaction: { name: '互动消息', icon: '💬', color: '#8b5cf6' },
    order: { name: '订单消息', icon: '📦', color: '#10b981' }
  };

  // 渲染消息卡片
  function renderMessageCard(msg) {
    const config = typeConfig[msg.type];
    const isSelected = MessageState.selectedIds.has(msg.id);
    
    return `
      <div class="message-card ${msg.isRead ? '' : 'unread'} ${msg.isPinned ? 'pinned' : ''} ${isSelected ? 'selected' : ''} ${MessageState.isSelectMode ? 'selecting' : ''}" 
           onclick="handleCardClick('${msg.id}', event)"
           data-id="${msg.id}">
        <div class="message-checkbox" onclick="event.stopPropagation(); toggleSelect('${msg.id}')"></div>
        <div class="message-header">
          <span class="message-type ${msg.type}" style="background: ${config.color}15; color: ${config.color};">
            ${config.icon} ${config.name}
          </span>
          <div class="message-badges">
            ${msg.isPinned ? '<span class="pin-icon">📌</span>' : ''}
            ${!msg.isRead ? '<span class="unread-dot"></span>' : ''}
          </div>
        </div>
        <div class="message-title">${msg.title}</div>
        <div class="message-summary">${msg.summary || msg.content.substring(0, 100)}</div>
        <div class="message-footer">
          <span class="message-time">
            <span>🕐</span>
            ${formatTime(msg.createdAt)}
          </span>
          <div class="message-actions">
            ${!msg.isRead ? `<button class="message-action-btn" onclick="event.stopPropagation(); handleMarkAsRead('${msg.id}')">标为已读</button>` : ''}
            <button class="message-action-btn" onclick="event.stopPropagation(); handleDelete('${msg.id}')">删除</button>
          </div>
        </div>
      </div>
    `;
  }

  // 渲染消息列表
  function renderMessages() {
    const listEl = document.getElementById('messagesList');
    const emptyEl = document.getElementById('emptyState');
    
    if (!listEl) return;
    
    const messages = MessageState.getFiltered();
    
    if (messages.length === 0) {
      listEl.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }
    
    if (emptyEl) emptyEl.style.display = 'none';
    listEl.innerHTML = messages.map(renderMessageCard).join('');
    
    // 更新批量操作栏
    updateBatchBar();
  }

  // 更新统计数据
  function updateStats() {
    const total = MessageState.getTotalCount();
    const unread = MessageState.getUnreadCount();
    
    const totalEl = document.getElementById('totalCount');
    const unreadEl = document.getElementById('unreadCount');
    
    if (totalEl) totalEl.textContent = total;
    if (unreadEl) unreadEl.textContent = unread;
    
    // 更新各类型数量
    Object.keys(typeConfig).forEach(type => {
      const countEl = document.getElementById(`count${type.charAt(0).toUpperCase() + type.slice(1)}`);
      if (countEl) {
        countEl.textContent = MessageState.getTotalCountByType(type);
      }
    });
  }

  // 更新筛选标签状态
  function updateFilterTabs() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
      const filter = tab.dataset.filter;
      tab.classList.toggle('active', filter === MessageState.currentFilter);
    });
  }

  // 更新批量操作栏
  function updateBatchBar() {
    const batchBar = document.getElementById('batchActionsBar');
    const selectedCount = document.getElementById('selectedCount');
    const deleteBtn = document.getElementById('deleteBtn');
    
    if (batchBar) {
      batchBar.classList.toggle('show', MessageState.isSelectMode && MessageState.selectedIds.size > 0);
    }
    
    if (selectedCount) {
      selectedCount.textContent = MessageState.selectedIds.size;
    }
    
    if (deleteBtn) {
      deleteBtn.style.display = MessageState.isSelectMode ? 'inline-flex' : 'none';
    }
  }

  // 筛选消息
  function filterMessages(type) {
    MessageState.currentFilter = type;
    updateFilterTabs();
    renderMessages();
  }

  // 处理卡片点击
  function handleCardClick(id, event) {
    if (MessageState.isSelectMode) {
      toggleSelect(id);
    } else {
      // 标记为已读
      MessageState.markAsRead(id);
      renderMessages();
      updateStats();
      // 跳转详情
      window.location.href = `detail.html?id=${id}`;
    }
  }

  // 切换选择模式
  function toggleSelectMode() {
    MessageState.isSelectMode = !MessageState.isSelectMode;
    if (!MessageState.isSelectMode) {
      MessageState.selectedIds.clear();
    }
    
    document.querySelectorAll('.message-card').forEach(card => {
      card.classList.toggle('selecting', MessageState.isSelectMode);
    });
    
    updateBatchBar();
  }

  // 切换选择
  function toggleSelect(id) {
    if (MessageState.selectedIds.has(id)) {
      MessageState.selectedIds.delete(id);
    } else {
      MessageState.selectedIds.add(id);
    }
    
    const card = document.querySelector(`.message-card[data-id="${id}"]`);
    if (card) {
      card.classList.toggle('selected', MessageState.selectedIds.has(id));
    }
    
    updateBatchBar();
  }

  // 标记已读
  function handleMarkAsRead(id) {
    MessageState.markAsRead(id);
    renderMessages();
    updateStats();
    showNotification('已标记为已读', 'success');
  }

  // 全部已读
  function markAllRead() {
    MessageState.markAllAsRead();
    renderMessages();
    updateStats();
    showNotification('已全部标记为已读', 'success');
  }

  // 标记选中已读
  function markSelectedRead() {
    MessageState.markSelectedAsRead();
    MessageState.isSelectMode = false;
    renderMessages();
    updateStats();
    showNotification('已标记为已读', 'success');
  }

  // 删除消息
  function handleDelete(id) {
    MessageState.delete(id);
    renderMessages();
    updateStats();
    showNotification('消息已删除', 'success');
  }

  // 删除选中
  function deleteSelected() {
    if (MessageState.selectedIds.size === 0) return;
    
    const count = MessageState.selectedIds.size;
    MessageState.deleteSelected();
    renderMessages();
    updateStats();
    showNotification(`已删除 ${count} 条消息`, 'success');
  }

  // 显示通知
  function showNotification(message, type = 'info') {
    // 简单实现，可替换为toast组件
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      padding: 12px 24px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-left: 4px solid ${type === 'success' ? '#10b981' : '#3b82f6'};
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  // 全局暴露函数
  window.MessageCenter = {
    filter: filterMessages,
    markAllRead,
    markSelectedRead,
    toggleSelectMode,
    markAsRead: handleMarkAsRead,
    delete: handleDelete,
    deleteSelected,
    getState: () => MessageState
  };

  // 全局函数（兼容）
  window.handleCardClick = handleCardClick;
  window.toggleSelect = toggleSelect;
  window.handleMarkAsRead = handleMarkAsRead;
  window.handleDelete = handleDelete;
  window.markAllRead = markAllRead;
  window.markSelectedRead = markSelectedRead;
  window.toggleSelectMode = toggleSelectMode;
  window.deleteSelected = deleteSelected;
  window.filterMessages = filterMessages;

  // 初始化（如果在消息列表页面）
  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('messagesList')) {
      MessageState.load();
      renderMessages();
      updateStats();
      
      // 监听更新事件
      window.addEventListener('messagesUpdated', function() {
        renderMessages();
        updateStats();
      });
    }
  });

  // 添加动画样式
  if (!document.getElementById('messageAnimations')) {
    const style = document.createElement('style');
    style.id = 'messageAnimations';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

})();
