/**
 * ============================================
 * 新增功能使用指南 - 游导旅游网站
 * ============================================
 * 
 * 本文件说明如何使用新增的组件和工具
 */

/**
 * ============================================
 * 1. Toast 提示组件
 * ============================================
 * 
 * 使用前提：在HTML中引入 toast.js
 * <script src="js/toast.js"></script>
 * 
 * 使用方法：
 * 
 * // 方法1: 直接调用
 * showToast('这是一条提示消息', 'success');  // 成功
 * showToast('操作失败', 'error');              // 错误
 * showToast('请注意', 'warning');             // 警告
 * showToast('提示信息', 'info');               // 信息
 * 
 * // 方法2: 使用快捷方法（推荐）
 * toast.success('保存成功！');
 * toast.error('网络错误，请重试');
 * toast.warning('内容未填写完整');
 * toast.info('有新版本可用');
 * 
 * // 自定义显示时间（毫秒）
 * toast.success('3秒后消失', 3000);  // 默认3000ms
 * toast.info('5秒后消失', 5000);
 */

// 使用示例（在表单提交成功/失败时）
/*
document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  // 模拟提交
  fetch('/api/contact', {
    method: 'POST',
    body: new FormData(this)
  })
  .then(res => {
    if (res.ok) {
      toast.success('提交成功！我们会尽快联系您');
      this.reset();
    } else {
      toast.error('提交失败，请稍后重试');
    }
  })
  .catch(() => {
    toast.error('网络错误，请检查您的连接');
  });
});
*/

/**
 * ============================================
 * 2. 骨架屏加载动画
 * ============================================
 * 
 * 使用前提：已在 style.css 中添加样式
 * 
 * 在页面加载时使用骨架屏代替实际内容：
 * 
 * HTML结构示例：
 * 
 * <!-- 文章列表骨架屏 -->
 * <div id="article-list">
 *   <div class="skeleton skeleton-card"></div>
 *   <div class="skeleton skeleton-card"></div>
 *   <div class="skeleton skeleton-card"></div>
 * </div>
 * 
 * <!-- 用户信息骨架屏 -->
 * <div class="user-profile">
 *   <div class="skeleton skeleton-avatar"></div>
 *   <div>
 *     <div class="skeleton skeleton-title"></div>
 *     <div class="skeleton skeleton-text" style="width:80%"></div>
 *   </div>
 * </div>
 * 
 * JavaScript控制：
 * 
 * function showLoading() {
 *   document.getElementById('content').innerHTML = `
 *     <div class="skeleton skeleton-card" style="height:300px"></div>
 *   `;
 * }
 * 
 * function hideLoading() {
 *   document.getElementById('content').innerHTML = actualContent;
 * }
 */

/**
 * ============================================
 * 3. XSS 安全过滤工具
 * ============================================
 * 
 * 使用前提：在HTML中引入 xss-filter.js
 * <script src="js/xss-filter.js"></script>
 * 
 * 过滤器类型：
 * 
 * // 基础过滤（转义危险字符）
 * XSSFilter.basic('<script>alert(1)</script>');
 * // 输出: &lt;script&gt;alert(1)&lt;/script&gt;
 * 
 * // 严格过滤（移除所有HTML标签）
 * XSSFilter.strict('<b>Hello</b> <script>alert(1)</script>');
 * // 输出: Hello
 * 
 * // 表单输入过滤（推荐用于所有表单字段）
 * XSSFilter.form('<input onload="alert(1)">');
 * // 输出: 转义后的安全文本
 * 
 * // URL过滤（验证URL安全性）
 * XSSFilter.url('javascript:alert(1)');
 * // 输出: '' (空字符串，危险URL被拒绝)
 * 
 * // 富文本过滤（保留部分安全格式）
 * XSSFilter.richText('<b>加粗</b><script>alert(1)</script>');
 * // 输出: <b>加粗</b>（script标签被移除）
 * 
 * // 自动过滤整个表单
 * // 在表单提交时自动过滤所有输入
 * document.getElementById('myForm').addEventListener('submit', function(e) {
 *   e.preventDefault();
 *   const changed = filterForm('#myForm');
 *   if (changed) {
 *     toast.info('输入内容已自动过滤特殊字符');
 *   }
 *   // 继续表单提交...
 * });
 * 
 * 推荐使用场景：
 * - 用户评论: XSSFilter.richText()
 * - 用户昵称: XSSFilter.strict()
 * - 搜索框: XSSFilter.form()
 * - URL跳转: XSSFilter.url()
 */

/**
 * ============================================
 * 4. Supabase 配置检查
 * ============================================
 * 
 * 已在 supabase-config.js 中自动集成
 * 
 * 功能：
 * - 页面加载时自动检测配置是否完成
 * - 未配置时在控制台显示警告
 * - 如果已加载toast.js，会显示页面提示
 * 
 * 手动检查：
 * if (checkSupabaseConfig()) {
 *   // 配置正确，可以正常使用
 * } else {
 *   // 显示配置引导
 * }
 */

/**
 * ============================================
 * 5. iOS 输入框缩放修复
 * ============================================
 * 
 * 已自动应用，无需额外操作
 * 
 * 效果：
 * - 所有 input, select, textarea 字体大小固定为 16px
 * - 防止iOS Safari在聚焦时自动缩放页面
 */
