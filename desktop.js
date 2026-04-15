/* ===================================
   桌面端优化脚本 v2.0
   功能：快捷键、右键菜单、拖拽操作、窗口管理
   =================================== */

(function() {
  'use strict';

  // ===== 快捷键管理器 =====
  const KeyboardShortcuts = {
    shortcuts: {},
    modifierKeys: ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'],
    
    init() {
      this.registerDefaults();
      this.bindEvents();
      this.showShortcutsHelp();
    },
    
    registerDefaults() {
      // 通用快捷键
      this.register({
        key: 's',
        ctrl: true,
        action: () => this.focusSearch(),
        description: '搜索'
      });
      
      this.register({
        key: '/',
        action: () => this.focusSearch(),
        description: '搜索 (斜杠)'
      });
      
      this.register({
        key: 'g h',
        action: () => this.goHome(),
        description: '返回首页'
      });
      
      this.register({
        key: 'g p',
        action: () => this.goProfile(),
        description: '个人中心'
      });
      
      this.register({
        key: 'g m',
        action: () => this.goMessages(),
        description: '消息中心'
      });
      
      this.register({
        key: '?',
        shift: true,
        action: () => this.toggleShortcutsHelp(),
        description: '显示快捷键'
      });
      
      this.register({
        key: 'Escape',
        action: () => this.closeModals(),
        description: '关闭弹窗'
      });
      
      this.register({
        key: 'f',
        ctrl: true,
        action: () => this.toggleFullscreen(),
        description: '全屏模式'
      });
      
      this.register({
        key: 'd',
        ctrl: true,
        action: () => this.toggleDarkMode(),
        description: '深色模式'
      });
      
      this.register({
        key: 'r',
        ctrl: true,
        shift: true,
        action: () => this.refreshPage(),
        description: '强制刷新'
      });
      
      // 导航快捷键
      this.register({
        key: 'j',
        action: () => this.selectNext(),
        description: '下一项'
      });
      
      this.register({
        key: 'k',
        action: () => this.selectPrev(),
        description: '上一项'
      });
      
      this.register({
        key: 'Enter',
        action: () => this.openSelected(),
        description: '打开选中项'
      });
      
      // Tab快捷键
      this.register({
        key: 't',
        ctrl: true,
        action: () => this.newTab(),
        description: '新标签页'
      });
      
      this.register({
        key: 'w',
        ctrl: true,
        action: () => this.closeTab(),
        description: '关闭标签页'
      });
    },
    
    register({ key, ctrl = false, shift = false, alt = false, meta = false, action, description }) {
      const id = `${key}-${ctrl}-${shift}-${alt}-${meta}`;
      this.shortcuts[id] = {
        key: key.toLowerCase(),
        ctrl,
        shift,
        alt,
        meta,
        action,
        description
      };
    },
    
    bindEvents() {
      document.addEventListener('keydown', (e) => {
        // 忽略输入框中的快捷键
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
          // 特定快捷键仍然可用
          if (!(e.key === 'Escape' || (e.ctrlKey && e.key === 'Enter'))) {
            return;
          }
        }
        
        // 忽略修饰键单独按下
        if (this.modifierKeys.includes(e.key)) return;
        
        // 检查快捷键
        const id = this.getShortcutId(e);
        const shortcut = this.shortcuts[id];
        
        if (shortcut) {
          e.preventDefault();
          shortcut.action();
        }
      });
    },
    
    getShortcutId(e) {
      const key = e.key.toLowerCase();
      return `${key}-${e.ctrlKey}-${e.shiftKey}-${e.altKey}-${e.metaKey}`;
    },
    
    // 快捷键动作
    focusSearch() {
      const searchInput = document.querySelector('.search-input, input[type="search"], #search-input, .global-search input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    },
    
    goHome() {
      window.location.href = '/';
    },
    
    goProfile() {
      window.location.href = '/profile.html';
    },
    
    goMessages() {
      window.location.href = '/messages.html';
    },
    
    toggleShortcutsHelp() {
      const modal = document.getElementById('shortcuts-modal');
      if (modal) {
        modal.classList.toggle('show');
      } else {
        this.showShortcutsHelp();
      }
    },
    
    showShortcutsHelp() {
      if (document.getElementById('shortcuts-modal')) return;
      
      const modal = document.createElement('div');
      modal.id = 'shortcuts-modal';
      modal.className = 'shortcuts-modal';
      modal.innerHTML = `
        <div class="shortcuts-content">
          <div class="shortcuts-header">
            <h2>键盘快捷键</h2>
            <button class="shortcuts-close" aria-label="关闭">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
            </button>
          </div>
          <div class="shortcuts-body">
            <div class="shortcuts-section">
              <h3>通用</h3>
              <div class="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>S</kbd>
                <span>搜索</span>
              </div>
              <div class="shortcut-item">
                <kbd>?</kbd>
                <span>显示此帮助</span>
              </div>
              <div class="shortcut-item">
                <kbd>Esc</kbd>
                <span>关闭弹窗</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>D</kbd>
                <span>深色模式</span>
              </div>
            </div>
            <div class="shortcuts-section">
              <h3>导航</h3>
              <div class="shortcut-item">
                <kbd>G</kbd> <kbd>H</kbd>
                <span>返回首页</span>
              </div>
              <div class="shortcut-item">
                <kbd>G</kbd> <kbd>P</kbd>
                <span>个人中心</span>
              </div>
              <div class="shortcut-item">
                <kbd>J</kbd>
                <span>下一项</span>
              </div>
              <div class="shortcut-item">
                <kbd>K</kbd>
                <span>上一项</span>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // 添加样式
      const styles = `
        .shortcuts-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s;
        }
        .shortcuts-modal.show {
          opacity: 1;
          visibility: visible;
        }
        .shortcuts-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          transform: scale(0.9);
          transition: transform 0.2s;
        }
        .shortcuts-modal.show .shortcuts-content {
          transform: scale(1);
        }
        .shortcuts-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .shortcuts-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        .shortcuts-close {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          border-radius: 6px;
          color: #6b7280;
        }
        .shortcuts-close:hover {
          background: #f3f4f6;
        }
        .shortcuts-body {
          padding: 20px;
          overflow-y: auto;
          max-height: calc(80vh - 60px);
        }
        .shortcuts-section {
          margin-bottom: 24px;
        }
        .shortcuts-section:last-child {
          margin-bottom: 0;
        }
        .shortcuts-section h3 {
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 12px 0;
        }
        .shortcut-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          font-size: 14px;
        }
        .shortcut-item span {
          margin-left: auto;
          color: #6b7280;
        }
        kbd {
          display: inline-block;
          padding: 4px 8px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          color: #374151;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          box-shadow: 0 1px 0 #e5e7eb;
        }
      `;
      
      const styleEl = document.createElement('style');
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
      
      document.body.appendChild(modal);
      
      // 事件绑定
      modal.querySelector('.shortcuts-close').addEventListener('click', () => {
        modal.classList.remove('show');
      });
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
      
      // 延迟显示
      requestAnimationFrame(() => {
        modal.classList.add('show');
      });
    },
    
    closeModals() {
      document.querySelectorAll('.modal, .shortcuts-modal').forEach(modal => {
        modal.classList.remove('show');
      });
      
      // 关闭菜单
      document.querySelectorAll('.dropdown-menu, .nav-links').forEach(menu => {
        menu.classList.remove('open', 'active');
      });
    },
    
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log('全屏模式不可用', err);
        });
      } else {
        document.exitFullscreen();
      }
    },
    
    toggleDarkMode() {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('dark-mode', isDark);
    },
    
    refreshPage() {
      window.location.reload();
    },
    
    selectNext() {
      const items = document.querySelectorAll('.clickable-card, .list-item, [data-selectable]');
      const focused = document.activeElement;
      const index = Array.from(items).indexOf(focused);
      
      if (index < items.length - 1) {
        items[index + 1].focus();
      } else if (items.length > 0) {
        items[0].focus();
      }
    },
    
    selectPrev() {
      const items = document.querySelectorAll('.clickable-card, .list-item, [data-selectable]');
      const focused = document.activeElement;
      const index = Array.from(items).indexOf(focused);
      
      if (index > 0) {
        items[index - 1].focus();
      } else if (items.length > 0) {
        items[items.length - 1].focus();
      }
    },
    
    openSelected() {
      const focused = document.activeElement;
      if (focused && (focused.tagName === 'A' || focused.dataset.href)) {
        window.location.href = focused.dataset.href || focused.href;
      }
    },
    
    newTab() {
      window.open(window.location.href, '_blank');
    },
    
    closeTab() {
      window.close();
    }
  };

  // ===== 右键菜单管理器 =====
  const ContextMenu = {
    menus: {},
    
    init() {
      this.registerDefaultMenu();
      this.bindEvents();
    },
    
    registerDefaultMenu() {
      // 通用右键菜单
      this.register('[data-context-menu]', {
        items: [
          { label: '复制链接', action: (data) => this.copyToClipboard(data.url) },
          { label: '新标签页打开', action: (data) => window.open(data.url, '_blank') },
          { type: 'separator' },
          { label: '收藏', action: () => this.addToFavorites() },
          { label: '分享', action: (data) => this.sharePage(data.url) }
        ]
      });
      
      // 图片右键菜单
      this.register('img[data-context-menu]', {
        items: [
          { label: '复制图片', action: (data) => this.copyImage(data.src) },
          { label: '在新标签页打开图片', action: (data) => window.open(data.src, '_blank') },
          { type: 'separator' },
          { label: '保存图片', action: (data) => this.saveImage(data.src) }
        ]
      });
      
      // 文本右键菜单
      this.register('[data-copyable]', {
        items: [
          { label: '复制', action: (data) => this.copyToClipboard(data.text), shortcut: 'Ctrl+C' },
          { label: '搜索', action: (data) => this.searchText(data.text) }
        ]
      });
    },
    
    register(selector, menu) {
      this.menus[selector] = menu;
    },
    
    bindEvents() {
      document.addEventListener('contextmenu', (e) => {
        const target = e.target.closest(Object.keys(this.menus).join(','));
        
        if (target) {
          e.preventDefault();
          this.showMenu(e, target);
        }
      });
      
      document.addEventListener('click', () => this.hideMenu());
    },
    
    showMenu(e, target) {
      this.hideMenu();
      
      const selector = Object.keys(this.menus).find(s => target.matches(s));
      if (!selector) return;
      
      const menuConfig = this.menus[selector];
      const menu = document.createElement('div');
      menu.className = 'context-menu';
      menu.id = 'context-menu';
      
      const data = this.getMenuData(target);
      
      menuConfig.items.forEach(item => {
        if (item.type === 'separator') {
          const sep = document.createElement('div');
          sep.className = 'context-menu-separator';
          menu.appendChild(sep);
        } else {
          const menuItem = document.createElement('div');
          menuItem.className = 'context-menu-item';
          menuItem.innerHTML = `
            <span>${item.label}</span>
            ${item.shortcut ? `<small>${item.shortcut}</small>` : ''}
          `;
          menuItem.addEventListener('click', () => {
            item.action(data);
            this.hideMenu();
          });
          menu.appendChild(menuItem);
        }
      });
      
      // 定位
      const x = Math.min(e.clientX, window.innerWidth - 200);
      const y = Math.min(e.clientY, window.innerHeight - menu.offsetHeight - 20);
      
      menu.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        z-index: 10000;
      `;
      
      // 添加样式
      this.injectStyles();
      
      document.body.appendChild(menu);
    },
    
    hideMenu() {
      const menu = document.getElementById('context-menu');
      if (menu) menu.remove();
    },
    
    getMenuData(target) {
      return {
        url: target.href || target.dataset.url || window.location.href,
        src: target.src || target.dataset.src || '',
        text: target.textContent?.trim() || target.value || '',
        html: target.innerHTML || ''
      };
    },
    
    injectStyles() {
      if (document.getElementById('context-menu-styles')) return;
      
      const styles = `
        .context-menu {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          padding: 6px 0;
          min-width: 180px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .context-menu-item {
          padding: 10px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          color: #374151;
        }
        .context-menu-item:hover {
          background: #f3f4f6;
        }
        .context-menu-item small {
          color: #9ca3af;
          font-size: 12px;
        }
        .context-menu-separator {
          height: 1px;
          background: #e5e7eb;
          margin: 6px 0;
        }
      `;
      
      const styleEl = document.createElement('style');
      styleEl.id = 'context-menu-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    },
    
    // 菜单动作
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.showToast('已复制到剪贴板');
      } catch (err) {
        console.error('复制失败', err);
      }
    },
    
    async copyImage(src) {
      try {
        const response = await fetch(src);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        this.showToast('图片已复制');
      } catch (err) {
        console.error('图片复制失败', err);
      }
    },
    
    saveImage(src) {
      const a = document.createElement('a');
      a.href = src;
      a.download = src.split('/').pop();
      a.click();
    },
    
    addToFavorites() {
      if (window.external && window.external.addFavorite) {
        window.external.addFavorite(window.location.href, document.title);
      } else {
        this.showToast('请使用 Ctrl+D 添加收藏');
      }
    },
    
    sharePage(url) {
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: url
        });
      } else {
        this.copyToClipboard(url);
      }
    },
    
    searchText(text) {
      const query = encodeURIComponent(text.substring(0, 100));
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    },
    
    showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'context-toast';
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: #374151;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10001;
        transition: transform 0.3s;
      `;
      document.body.appendChild(toast);
      
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });
      
      setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }
  };

  // ===== 拖拽操作管理器 =====
  const DragDropManager = {
    draggedElement: null,
    dropTargets: [],
    
    init() {
      this.setupDraggable();
      this.setupDropZone();
    },
    
    setupDraggable() {
      document.querySelectorAll('[draggable="true"]').forEach(el => {
        el.addEventListener('dragstart', (e) => this.onDragStart(e, el));
        el.addEventListener('dragend', (e) => this.onDragEnd(e, el));
      });
    },
    
    setupDropZone() {
      document.querySelectorAll('[data-drop-zone]').forEach(zone => {
        zone.addEventListener('dragover', (e) => this.onDragOver(e, zone));
        zone.addEventListener('dragenter', (e) => this.onDragEnter(e, zone));
        zone.addEventListener('dragleave', (e) => this.onDragLeave(e, zone));
        zone.addEventListener('drop', (e) => this.onDrop(e, zone));
      });
    },
    
    onDragStart(e, el) {
      this.draggedElement = el;
      el.classList.add('dragging');
      
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', el.dataset.dragData || '');
      
      // 创建拖拽预览
      const preview = el.cloneNode(true);
      preview.style.cssText = `
        position: absolute;
        top: -1000px;
        opacity: 0.8;
      `;
      document.body.appendChild(preview);
      e.dataTransfer.setDragImage(preview, 0, 0);
      
      setTimeout(() => preview.remove(), 0);
    },
    
    onDragEnd(e, el) {
      el.classList.remove('dragging');
      this.draggedElement = null;
      
      document.querySelectorAll('.drop-target-active').forEach(zone => {
        zone.classList.remove('drop-target-active');
      });
    },
    
    onDragOver(e, zone) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('drop-target-over');
    },
    
    onDragEnter(e, zone) {
      e.preventDefault();
      zone.classList.add('drop-target-active');
    },
    
    onDragLeave(e, zone) {
      zone.classList.remove('drop-target-active', 'drop-target-over');
    },
    
    onDrop(e, zone) {
      e.preventDefault();
      zone.classList.remove('drop-target-active', 'drop-target-over');
      
      const data = e.dataTransfer.getData('text/plain');
      
      zone.dispatchEvent(new CustomEvent('dropped', {
        detail: {
          data,
          draggedElement: this.draggedElement
        }
      }));
    }
  };

  // ===== 窗口管理 =====
  const WindowManager = {
    init() {
      this.detectWindowFeatures();
      this.setupWindowControls();
    },
    
    detectWindowFeatures() {
      const features = {
        isFullScreen: !!document.fullscreenElement,
        isMaximized: window.outerWidth === screen.availWidth && window.outerHeight === screen.availHeight,
        isMinimized: document.hidden === undefined ? false : !document.visibilityState
      };
      
      document.body.classList.toggle('is-fullscreen', features.isFullScreen);
      document.body.classList.toggle('is-maximized', features.isMaximized);
      
      // 监听全屏变化
      document.addEventListener('fullscreenchange', () => {
        features.isFullScreen = !!document.fullscreenElement;
        document.body.classList.toggle('is-fullscreen', features.isFullScreen);
      });
    },
    
    setupWindowControls() {
      // ESC 退出全屏
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.fullscreenElement) {
          document.exitFullscreen();
        }
      });
    }
  };

  // ===== 初始化 =====
  function initDesktop() {
    // 只在非移动端初始化
    if (window.innerWidth <= 1024) return;
    
    KeyboardShortcuts.init();
    ContextMenu.init();
    DragDropManager.init();
    WindowManager.init();
    
    console.log('[Desktop] 桌面端功能已初始化');
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDesktop);
  } else {
    initDesktop();
  }

  // 导出全局对象
  window.DesktopUtils = {
    KeyboardShortcuts,
    ContextMenu,
    DragDropManager,
    WindowManager
  };

})();
