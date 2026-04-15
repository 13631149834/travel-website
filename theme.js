/**
 * 主题切换模块
 * 功能：深色/浅色主题切换，本地存储持久化，系统偏好检测
 */

(function() {
  'use strict';

  const THEME_KEY = 'youdao_theme';
  const DARK_THEME = 'dark';
  const LIGHT_THEME = 'light';

  // 初始化主题
  function init() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 优先级：用户选择 > 系统偏好
    const theme = savedTheme || (systemPrefersDark ? DARK_THEME : LIGHT_THEME);
    applyTheme(theme);
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? DARK_THEME : LIGHT_THEME);
      }
    });
  }

  // 应用主题
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  // 切换主题
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    applyTheme(newTheme);
  }

  // 更新图标显示
  function updateThemeIcon(theme) {
    const buttons = document.querySelectorAll('.theme-toggle');
    buttons.forEach(btn => {
      btn.innerHTML = theme === DARK_THEME ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === DARK_THEME ? '切换到浅色模式' : '切换到深色模式');
      btn.title = theme === DARK_THEME ? '浅色模式' : '深色模式';
    });
  }

  // 获取当前主题
  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || LIGHT_THEME;
  }

  // 暴露全局方法
  window.toggleTheme = toggleTheme;
  window.getCurrentTheme = getCurrentTheme;

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
