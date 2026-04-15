/**
 * 推送模块汇总导出 - Push Module Export
 * 游导旅游平台
 * 
 * 使用方式：
 * <script src="js/push/push-export.js"><\/script>
 * 
 * 提供以下全局对象：
 * - PushAPI: 统一的推送 API 接口
 * - PushManager: 消息管理器
 * - PushSettings: 推送设置
 * - PushStatistics: 推送统计
 * - BrowserPush: 浏览器推送
 */

// 按顺序加载所有模块
const pushModules = [
  'js/push/push-settings.js',
  'js/push/push-statistics.js',
  'js/push/browser-push.js',
  'js/push/push-manager.js',
  'js/push/push-init.js'
];

// 动态加载模块
function loadPushModules() {
  return new Promise((resolve, reject) => {
    let loaded = 0;
    const total = pushModules.length;

    pushModules.forEach(src => {
      // 检查是否已加载
      if (document.querySelector(`script[src="${src}"]`)) {
        loaded++;
        if (loaded === total) resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      
      script.onload = () => {
        loaded++;
        if (loaded === total) resolve();
      };
      
      script.onerror = () => {
        console.error(`加载模块失败: ${src}`);
        loaded++;
        if (loaded === total) resolve(); // 即使失败也继续
      };

      document.head.appendChild(script);
    });
  });
}

// 自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadPushModules);
} else {
  loadPushModules();
}

// 导出模块引用
window.PushModules = {
  load: loadPushModules,
  modules: pushModules,
  api: () => window.PushAPI,
  manager: () => window.PushManager,
  settings: () => window.PushSettings,
  statistics: () => window.PushStatistics,
  browser: () => window.BrowserPush
};
