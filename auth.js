/**
 * 会员激活鉴权系统 v3
 * - 激活码有效期1年，到期需续费
 * - 免费体验页：首页/激活/隐私/免费资料/知识库/省份/指南/学习路径/AI对话(限3次)
 * - 付费完整页：刷题/闪卡/面试/资料包下载/错题本/收藏/搜索(完整)
 */
(function() {
  var path = window.location.pathname;
  var page = path.split('/').pop() || 'index.html';

  var publicPages = [
    'index.html', 'activate.html', 'privacy.html', '404.html', '',
    'free-materials.html',    // 免费资料 - 体验内容质量
    'travel-knowledge.html',  // 知识库目录 - 看到内容丰富度
    'province-exam.html',     // 省份信息 - 公开信息
    'guides.html',            // 备考指南 - 建立信任
    'study-roadmap.html',     // 学习路径 - 看到计划
    'chat.html',              // AI对话 - 每天3次免费
    'after-pass.html',        // 考后信息
    'exam-guide.html',        // 考试指南
    'resources.html',         // 资料包介绍 - 看到价值再买
    'exam-simulator.html',    // 刷题 - 每天免费5题
    'interview.html',         // 面试指导 - 部分免费预览
    'flashcard.html',         // 闪卡 - 每天免费10张
    'voice.html',             // 导游词示范 - 免费试听
    'search.html',            // 搜索 - 免费使用
    'mistakes.html',          // 易错点 - 部分免费
    'favorites.html',         // 收藏 - 免费使用
  ];

  // 知识库子页面也允许免费访问（让用户体验内容质量）
  var isKnowledgePage = page.indexOf('knowledge/') === 0 || path.indexOf('/knowledge/') !== -1;
  if (isKnowledgePage) return;

  if (publicPages.indexOf(page) !== -1) return;

  var activated = localStorage.getItem('youdao_activated');
  var expireTime = localStorage.getItem('youdao_expire');

  // 未激活
  if (activated !== 'true' || !expireTime) {
    window.location.href = 'activate.html';
    return;
  }

  // 已过期
  var now = new Date().getTime();
  var expire = new Date(expireTime).getTime();
  if (now > expire) {
    localStorage.removeItem('youdao_activated');
    localStorage.removeItem('youdao_expire');
    localStorage.setItem('youdao_expired', 'true');
    window.location.href = 'activate.html';
  }
})();

/**
 * 验证激活码
 */
function verifyCode(code) {
  if (!code) return false;
  code = code.trim().toUpperCase();
  var pattern = /^XM2026-[A-Z0-9]{4}$/;
  if (!pattern.test(code)) return false;
  var suffix = code.split('-')[1];
  var sum = 0;
  for (var i = 0; i < suffix.length; i++) {
    sum += suffix.charCodeAt(i);
  }
  return sum % 2 === 0;
}
