/**
 * 快捷操作优化组件
 * 功能：悬浮按钮、底部导航、快捷搜索、一键操作
 */

(function() {
  'use strict';

  // 快捷操作管理器
  const QuickActions = {
    // 搜索历史存储键
    SEARCH_HISTORY_KEY: 'travel_search_history',
    MAX_HISTORY_ITEMS: 10,

    // 热门搜索词
    hotSearchTerms: [
      { text: '日本导游', icon: '🗾' },
      { text: '欧洲私人导游', icon: '🗼' },
      { text: '巴厘岛中文导游', icon: '🏝️' },
      { text: '泰国美食之旅', icon: '🍜' },
      { text: '马尔代夫度假', icon: '🌴' }
    ],

    // 初始化
    init() {
      this.initFloatingButtons();
      this.initBottomNav();
      this.initQuickSearch();
      this.initOneClickActions();
      this.initSmartRecommend();
    },

    // ===== 悬浮按钮 =====
    initFloatingButtons() {
      const backTopBtn = document.querySelector('.float-btn-backtop');
      if (backTopBtn) {
        // 滚动显示/隐藏
        window.addEventListener('scroll', this.throttle(() => {
          if (window.scrollY > 300) {
            backTopBtn.classList.add('visible');
          } else {
            backTopBtn.classList.remove('visible');
          }
        }, 100));

        // 点击返回顶部
        backTopBtn.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      // 展开菜单
      const expandTrigger = document.querySelector('.float-expand-trigger');
      if (expandTrigger) {
        expandTrigger.addEventListener('click', () => {
          expandTrigger.classList.toggle('expanded');
        });

        // 点击外部关闭
        document.addEventListener('click', (e) => {
          if (!expandTrigger.contains(e.target) && 
              !document.querySelector('.float-expand-menu')?.contains(e.target)) {
            expandTrigger.classList.remove('expanded');
          }
        });
      }

      // 在线客服
      const customerBtn = document.querySelector('.float-btn-customer');
      if (customerBtn) {
        customerBtn.addEventListener('click', () => {
          this.openCustomerService();
        });
      }

      // 快速预约
      const bookingBtn = document.querySelector('.float-btn-booking');
      if (bookingBtn) {
        bookingBtn.addEventListener('click', () => {
          this.openQuickBooking();
        });
      }

      // 意见反馈
      const feedbackBtn = document.querySelector('.float-btn-feedback');
      if (feedbackBtn) {
        feedbackBtn.addEventListener('click', () => {
          window.location.href = 'feedback.html';
        });
      }
    },

    // ===== 底部导航 =====
    initBottomNav() {
      const bottomNav = document.querySelector('.mobile-bottom-nav');
      if (!bottomNav) return;

      const navItems = bottomNav.querySelectorAll('.bottom-nav-item');
      const currentPath = window.location.pathname;

      navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.includes(href.replace('.html', ''))) {
          item.classList.add('active');
        }

        item.addEventListener('click', (e) => {
          // 移除其他active
          navItems.forEach(nav => nav.classList.remove('active'));
          item.classList.add('active');
        });
      });

      // 快捷预约按钮
      const quickBtn = bottomNav.querySelector('.bottom-nav-quick-btn');
      if (quickBtn) {
        quickBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.openQuickBooking();
        });
      }
    },

    // ===== 快捷搜索 =====
    initQuickSearch() {
      const searchBar = document.querySelector('.quick-search-bar');
      const searchInput = document.querySelector('.quick-search-input');
      const suggestions = document.querySelector('.quick-search-suggestions');
      const voiceBtn = document.querySelector('.quick-search-voice');

      if (!searchBar || !searchInput) return;

      // 搜索图标点击打开搜索
      const searchIcons = document.querySelectorAll('.search-trigger');
      searchIcons.forEach(icon => {
        icon.addEventListener('click', () => {
          searchBar.classList.add('active');
          searchInput.focus();
        });
      });

      // ESC关闭搜索
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchBar.classList.remove('active');
          suggestions?.classList.remove('active');
        }
      });

      // 点击外部关闭
      document.addEventListener('click', (e) => {
        if (!searchBar.contains(e.target)) {
          searchBar.classList.remove('active');
          suggestions?.classList.remove('active');
        }
      });

      // 输入事件
      searchInput.addEventListener('input', this.debounce((e) => {
        const query = e.target.value.trim();
        if (query.length > 0) {
          this.showSearchSuggestions(query);
        } else {
          suggestions?.classList.remove('active');
        }
      }, 300));

      // 回车搜索
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.doSearch(searchInput.value);
        }
      });

      // 语音搜索（模拟）
      if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
          this.startVoiceSearch(voiceBtn, searchInput);
        });
      }
    },

    // 显示搜索建议
    showSearchSuggestions(query) {
      let suggestions = document.querySelector('.quick-search-suggestions');
      if (!suggestions) return;

      // 动态生成建议（实际项目中应该调用API）
      const history = this.getSearchHistory();
      const filteredHistory = history.filter(h => h.includes(query));
      
      let html = '';

      // 搜索历史
      if (filteredHistory.length > 0) {
        html += `
          <div class="suggestion-section">
            <div class="suggestion-title">搜索历史</div>
            <div class="search-history-tags">
              ${filteredHistory.slice(0, 5).map(h => `
                <button class="history-tag" onclick="QuickActions.selectHistory('${h}')">
                  ${h}
                  <span class="delete-tag" onclick="QuickActions.deleteHistory('${h}', event)">×</span>
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }

      // 热门搜索
      html += `
        <div class="suggestion-section">
          <div class="suggestion-title">热门搜索</div>
          ${this.hotSearchTerms.map(term => `
            <div class="suggestion-item" onclick="QuickActions.doSearch('${term.text}')">
              <span class="suggestion-icon">${term.icon}</span>
              <span class="suggestion-text">${term.text}</span>
              <span class="suggestion-hot">HOT</span>
            </div>
          `).join('')}
        </div>
      `;

      suggestions.innerHTML = html;
      suggestions.classList.add('active');
    },

    // 执行搜索
    doSearch(query) {
      if (!query || !query.trim()) return;
      
      query = query.trim();
      this.addSearchHistory(query);
      
      // 跳转到搜索页面
      window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    },

    // 搜索历史操作
    getSearchHistory() {
      try {
        return JSON.parse(localStorage.getItem(this.SEARCH_HISTORY_KEY)) || [];
      } catch {
        return [];
      }
    },

    addSearchHistory(query) {
      let history = this.getSearchHistory();
      // 去重
      history = history.filter(h => h !== query);
      // 添加到开头
      history.unshift(query);
      // 限制数量
      history = history.slice(0, this.MAX_HISTORY_ITEMS);
      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(history));
    },

    selectHistory(query) {
      document.querySelector('.quick-search-input').value = query;
      this.doSearch(query);
    },

    deleteHistory(query, event) {
      event.stopPropagation();
      let history = this.getSearchHistory();
      history = history.filter(h => h !== query);
      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(history));
      // 重新渲染
      const input = document.querySelector('.quick-search-input');
      if (input && input.value) {
        this.showSearchSuggestions(input.value);
      }
    },

    // 语音搜索（模拟）
    startVoiceSearch(btn, input) {
      btn.classList.add('listening');
      this.showToast('正在聆听...', '', 3000);

      // 模拟语音识别（实际需要Web Speech API）
      setTimeout(() => {
        btn.classList.remove('listening');
        // 模拟识别结果
        const mockResults = ['日本导游推荐', '欧洲旅游攻略', '泰国自由行'];
        const result = mockResults[Math.floor(Math.random() * mockResults.length)];
        input.value = result;
        this.doSearch(result);
      }, 2000);
    },

    // ===== 一键操作 =====
    initOneClickActions() {
      // 一键预约导游
      document.querySelectorAll('[data-action="book-guide"]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.oneClickBookGuide();
        });
      });

      // 一键收藏
      document.querySelectorAll('[data-action="favorite"]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.toggleFavorite(btn);
        });
      });

      // 一键分享
      document.querySelectorAll('[data-action="share"]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.oneClickShare(btn);
        });
      });

      // 一键联系
      document.querySelectorAll('[data-action="contact"]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.oneClickContact(btn);
        });
      });
    },

    // 一键预约导游
    oneClickBookGuide() {
      this.openQuickBooking();
    },

    // 切换收藏
    toggleFavorite(btn) {
      const guideId = btn.dataset.guideId;
      const icon = btn.querySelector('span') || btn;
      const isFavorited = btn.classList.contains('favorited');

      if (isFavorited) {
        // 取消收藏
        btn.classList.remove('favorited');
        if (btn.dataset.action === 'favorite') {
          icon.textContent = '🤍';
        }
        this.showToast('已取消收藏', '', 2000);
      } else {
        // 添加收藏
        btn.classList.add('favorited');
        if (btn.dataset.action === 'favorite') {
          icon.textContent = '❤️';
        }
        this.showToast('收藏成功', 'success', 2000);
        
        // 保存到本地（实际项目应调用API）
        const favorites = JSON.parse(localStorage.getItem('travel_favorites') || '[]');
        if (!favorites.includes(guideId)) {
          favorites.push(guideId);
          localStorage.setItem('travel_favorites', JSON.stringify(favorites));
        }
      }
    },

    // 一键分享
    oneClickShare(btn) {
      const shareData = {
        title: document.title,
        text: '我在游导旅游发现了一个超棒的导游！',
        url: window.location.href
      };

      if (navigator.share) {
        navigator.share(shareData).catch(() => {});
      } else {
        // 复制链接
        this.copyToClipboard(window.location.href);
        this.showToast('链接已复制到剪贴板', 'success', 2000);
      }
    },

    // 一键联系
    oneClickContact(btn) {
      const phone = btn.dataset.phone || '400-888-8888';
      const wechat = btn.dataset.wechat || 'ximao101';
      
      // 显示联系选项
      const options = `
        <div style="display:flex;flex-direction:column;gap:12px;padding:8px 0;">
          <a href="tel:${phone}" style="display:flex;align-items:center;gap:10px;padding:14px;background:#f3f4f6;border-radius:12px;text-decoration:none;color:#333;">
            <span style="font-size:1.3rem;">📞</span>
            <span>拨打热线 ${phone}</span>
          </a>
          <a href="javascript:;" onclick="QuickActions.copyWechat('${wechat}')" style="display:flex;align-items:center;gap:10px;padding:14px;background:#f3f4f6;border-radius:12px;text-decoration:none;color:#333;">
            <span style="font-size:1.3rem;">💬</span>
            <span>添加微信: ${wechat}</span>
          </a>
        </div>
      `;
      
      this.showModal('联系我们', options);
    },

    // 复制微信号
    copyWechat(wechat) {
      this.copyToClipboard(wechat);
      this.showToast('微信号已复制', 'success', 2000);
      this.closeModal();
    },

    // ===== 智能推荐 =====
    initSmartRecommend() {
      const tabs = document.querySelectorAll('.recommend-tab');
      if (tabs.length === 0) return;

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          const type = tab.dataset.type;
          this.loadRecommendList(type);
        });
      });
    },

    // 加载推荐列表
    loadRecommendList(type) {
      // 实际项目中应调用API获取数据
      console.log('加载推荐列表:', type);
    },

    // ===== 快速预约弹窗 =====
    openQuickBooking() {
      let popup = document.querySelector('.quick-booking-popup');
      if (!popup) {
        popup = this.createBookingPopup();
        document.body.appendChild(popup);
      }
      popup.classList.add('active');
      
      // 阻止背景滚动
      document.body.style.overflow = 'hidden';
    },

    createBookingPopup() {
      const popup = document.createElement('div');
      popup.className = 'quick-booking-popup';
      popup.innerHTML = `
        <div class="quick-booking-header">
          <h3 class="quick-booking-title">快速预约导游</h3>
          <button class="quick-booking-close" onclick="QuickActions.closeBooking()">×</button>
        </div>
        <div class="quick-booking-body">
          <form class="quick-booking-form" onsubmit="QuickActions.submitBooking(event)">
            <div class="form-group">
              <input type="text" name="name" placeholder="您的姓名" required>
            </div>
            <div class="form-group">
              <input type="tel" name="phone" placeholder="手机号码" required>
            </div>
            <div class="form-group">
              <select name="destination" required>
                <option value="">选择目的地</option>
                <option value="japan">日本</option>
                <option value="europe">欧洲</option>
                <option value="southeast">东南亚</option>
                <option value="australia">澳洲</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div class="form-group">
              <input type="date" name="date" required>
            </div>
            <button type="submit" class="quick-booking-submit">立即预约</button>
          </form>
        </div>
      `;
      return popup;
    },

    closeBooking() {
      const popup = document.querySelector('.quick-booking-popup');
      if (popup) {
        popup.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    submitBooking(event) {
      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);
      
      // 收集数据
      const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        destination: formData.get('destination'),
        date: formData.get('date')
      };

      // 模拟提交
      console.log('预约数据:', data);
      this.showToast('预约成功！我们将尽快与您联系', 'success', 3000);
      this.closeBooking();
      
      // 重置表单
      form.reset();
    },

    // ===== 在线客服 =====
    openCustomerService() {
      // 打开客服聊天窗口（实际项目中调用客服系统）
      if (typeof window.openChat !== 'undefined') {
        window.openChat();
      } else {
        window.location.href = 'contact.html';
      }
    },

    // ===== 工具方法 =====
    showToast(message, type = '', duration = 2000) {
      let toast = document.querySelector('.quick-action-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'quick-action-toast';
        document.body.appendChild(toast);
      }
      
      toast.textContent = message;
      toast.className = 'quick-action-toast';
      if (type) toast.classList.add(type);
      
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });

      setTimeout(() => {
        toast.classList.remove('show');
      }, duration);
    },

    showModal(title, content) {
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.style.cssText = `
        position:fixed;top:0;left:0;right:0;bottom:0;
        background:rgba(0,0,0,0.5);z-index:10000;
        display:flex;align-items:center;justify-content:center;
        padding:20px;
      `;
      modal.innerHTML = `
        <div style="background:white;border-radius:16px;width:100%;max-width:360px;overflow:hidden;">
          <div style="padding:16px 20px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
            <h3 style="font-size:16px;font-weight:600;">${title}</h3>
            <button onclick="QuickActions.closeModal()" style="width:28px;height:28px;border-radius:50%;border:none;background:#f5f5f5;cursor:pointer;">×</button>
          </div>
          <div style="padding:20px;">
            ${content}
          </div>
        </div>
      `;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
      document.body.appendChild(modal);
      this._modal = modal;
    },

    closeModal() {
      if (this._modal) {
        this._modal.remove();
        this._modal = null;
      }
    },

    copyToClipboard(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    },

    throttle(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
  };

  // 暴露到全局
  window.QuickActions = QuickActions;

  // DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => QuickActions.init());
  } else {
    QuickActions.init();
  }

})();
