/**
 * 反馈入口组件
 * 品牌铁律：主色#0D9488，版权©2025-2026
 */
(function() {
  'use strict';

  // 检查是否已存在反馈入口
  if (document.getElementById('feedback-widget')) return;

  // 创建反馈widget
  var widget = document.createElement('div');
  widget.id = 'feedback-widget';
  widget.innerHTML = `
    <style>
      #feedback-widget {
        position: fixed;
        bottom: 80px;
        right: 16px;
        z-index: 9998;
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
      }
      .feedback-trigger {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #0D9488, #14B8A6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(230, 81, 0, 0.35);
        transition: transform 0.2s, box-shadow 0.2s;
        border: none;
        color: #fff;
      }
      .feedback-trigger:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 20px rgba(230, 81, 0, 0.45);
      }
      .feedback-panel {
        display: none;
        position: absolute;
        bottom: 60px;
        right: 0;
        width: 280px;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        padding: 20px;
        animation: feedbackSlideUp 0.25s ease;
      }
      .feedback-panel.show {
        display: block;
      }
      @keyframes feedbackSlideUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .feedback-panel h4 {
        font-size: 1rem;
        color: #1A1A1A;
        margin-bottom: 12px;
        font-weight: 700;
      }
      .feedback-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .feedback-option {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background: #F0FDFA;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
        color: #1A1A1A;
        border: 1px solid transparent;
      }
      .feedback-option:hover {
        background: #CCFBF1;
        border-color: #0D9488;
      }
      .feedback-option span:first-child {
        font-size: 1.2rem;
      }
      .feedback-option span:last-child {
        font-size: 0.88rem;
        font-weight: 600;
      }
      .feedback-close {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 24px;
        height: 24px;
        background: #F0F0F0;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
      }
      .feedback-close:hover {
        background: #E0E0E0;
      }
    </style>
    <button class="feedback-trigger" onclick="toggleFeedbackPanel()" title="意见反馈">💬</button>
    <div class="feedback-panel" id="feedbackPanel">
      <button class="feedback-close" onclick="toggleFeedbackPanel()">✕</button>
      <h4>意见反馈</h4>
      <div class="feedback-options">
        <a href="javascript:void(0)" class="feedback-option" onclick="copyWechatAndClose()">
          <span>💡</span>
          <span>功能建议</span>
        </a>
        <a href="javascript:void(0)" class="feedback-option" onclick="reportError()">
          <span>🐛</span>
          <span>内容纠错</span>
        </a>
        <a href="https://qm.qq.com/cgi-bin/qm/qr?k=placeholder&w=yes" class="feedback-option" target="_blank">
          <span>📝</span>
          <span>留言反馈</span>
        </a>
        <a href="https://work.weixin.qq.com/kfid/placeholder" class="feedback-option" target="_blank">
          <span>🤝</span>
          <span>联系曼曼</span>
        </a>
      </div>
    </div>
    <script>
      function toggleFeedbackPanel() {
        var panel = document.getElementById('feedbackPanel');
        if (panel) panel.classList.toggle('show');
      }
      function copyWechatAndClose() {
        var wechatId = 'ximao101';
        if (navigator.clipboard) {
          navigator.clipboard.writeText(wechatId).then(function() {
            alert('微信号已复制：' + wechatId + '\\n请粘贴到微信添加好友');
          }).catch(function() {
            alert('微信号：' + wechatId);
          });
        } else {
          alert('微信号：' + wechatId);
        }
        toggleFeedbackPanel();
      }
      function reportError() {
        var currentPage = window.location.pathname;
        var pageTitle = document.title || '未知页面';
        var feedback = prompt('请描述页面内容的问题：\\n（当前页面：' + pageTitle + '）', '');
        if (feedback && feedback.trim()) {
          var msg = '【纠错反馈】\\n页面：' + currentPage + '\\n标题：' + pageTitle + '\\n问题：' + feedback;
          if (navigator.clipboard) {
            navigator.clipboard.writeText(msg).then(function() {
              alert('已复制纠错内容，请粘贴给曼曼微信：ximao101');
            });
          } else {
            alert(msg + '\\n\\n请复制以上内容发送至微信：ximao101');
          }
        }
        toggleFeedbackPanel();
      }
      // 点击外部关闭
      document.addEventListener('click', function(e) {
        var widget = document.getElementById('feedback-widget');
        var panel = document.getElementById('feedbackPanel');
        if (widget && panel && !widget.contains(e.target)) {
          panel.classList.remove('show');
        }
      });
    </script>
  `;
  
  // 插入到body末尾
  document.body.appendChild(widget);
})();
