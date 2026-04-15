/**
 * ============================================
 * 安全模块索引 - 游导旅游平台
 * ============================================
 * 统一导出所有安全模块的引用
 * 
 * 使用方式:
 * <script src="js/security/index.js"></script>
 * 
 * 可用模块:
 * - Security: 主入口模块
 * - XSSFilter: XSS防护
 * - CSRFProtection: CSRF防护
 * - SecurityCrypto: 数据加密
 * - AccessControl: 访问控制
 * - SecurityAudit: 安全审计
 */

// 安全模块基础路径
const SECURITY_MODULE_BASE = '';

// 模块加载清单
const SECURITY_MODULES = {
  core: [
    'js/security/security.js',
    'js/security/xss-filter.js',
    'js/security/csrf-protection.js'
  ],
  crypto: [
    'js/security/encryption.js'
  ],
  access: [
    'js/security/access-control.js'
  ],
  audit: [
    'js/security/audit.js'
  ],
  all: [
    'js/security/security.js',
    'js/security/xss-filter.js',
    'js/security/csrf-protection.js',
    'js/security/encryption.js',
    'js/security/access-control.js',
    'js/security/audit.js'
  ]
};

/**
 * 动态加载安全模块
 * @param {Array<string>} scripts - 脚本路径数组
 * @returns {Promise} 加载完成Promise
 */
async function loadSecurityModules(scripts) {
  for (const src of scripts) {
    if (!document.querySelector(`script[src="${src}"]`)) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => {
          console.warn(`Failed to load security module: ${src}`);
          resolve(); // 不阻塞其他模块
        };
        document.head.appendChild(script);
      });
    }
  }
}

/**
 * 初始化所有安全模块
 * @param {Object} options - 初始化选项
 * @returns {Promise} 初始化完成Promise
 */
async function initSecurity(options = {}) {
  // 加载所有模块
  await loadSecurityModules(SECURITY_MODULES.all);
  
  // 调用主入口初始化
  if (window.Security?.init) {
    return await window.Security.init(options);
  }
  
  console.warn('Security main module not found');
  return null;
}

/**
 * 快捷方法：获取模块引用
 */
const SecurityModules = {
  // 获取主模块
  get security() { return window.Security; },
  
  // 获取XSS防护
  get xss() { return window.XSSFilter; },
  
  // 获取CSRF防护
  get csrf() { return window.CSRFProtection; },
  
  // 获取加密模块
  get crypto() { return window.SecurityCrypto; },
  
  // 获取访问控制
  get access() { return window.AccessControl; },
  
  // 获取审计模块
  get audit() { return window.SecurityAudit; },
  
  // 加载并初始化
  init: initSecurity,
  
  // 加载特定模块
  load: loadSecurityModules,
  
  // 检查模块是否已加载
  isLoaded(moduleName) {
    switch (moduleName) {
      case 'security': return !!window.Security;
      case 'xss': return !!window.XSSFilter;
      case 'csrf': return !!window.CSRFProtection;
      case 'crypto': return !!window.SecurityCrypto;
      case 'access': return !!window.AccessControl;
      case 'audit': return !!window.SecurityAudit;
      default: return false;
    }
  },
  
  // 获取所有模块状态
  getStatus() {
    return {
      security: !!window.Security,
      xss: !!window.XSSFilter,
      csrf: !!window.CSRFProtection,
      crypto: !!window.SecurityCrypto,
      access: !!window.AccessControl,
      audit: !!window.SecurityAudit
    };
  }
};

// 导出
window.SecurityModules = SecurityModules;

// 同时导出快捷方式
window.loadSecurityModules = loadSecurityModules;
window.initSecurity = initSecurity;

// 自动检测已加载的模块
document.addEventListener('DOMContentLoaded', () => {
  const status = SecurityModules.getStatus();
  console.log('Security modules status:', status);
  
  // 如果所有模块都已加载，发出提示
  const loadedCount = Object.values(status).filter(Boolean).length;
  if (loadedCount > 0) {
    console.log(`[Security] ${loadedCount}/6 modules ready`);
  }
});
