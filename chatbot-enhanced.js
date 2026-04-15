/**
 * 游导旅游智能客服 - 增强版主文件
 * 整合AI助手、知识库、情感分析、智能推荐、对话记录
 */

(function() {
  'use strict';

  // 配置
  const chatbotConfig = {
    enableAI: true,           // 启用AI理解
    enableEmotion: true,       // 启用情绪分析
    enableKnowledge: true,     // 启用知识库
    enableRecommend: true,     // 启用智能推荐
    enableHistory: true,       // 启用对话记录
    typingSpeed: 50,           // 打字速度(ms/字)
    maxSuggestions: 3,         // 最大建议数
  };

  // 状态
  let chatbotOpen = false;
  let isTyping = false;
  let sessionInitialized = false;

  // DOM引用
  const elements = {};

  /**
   * 初始化
   */
  function init() {
    // 等待DOM加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
  }

  /**
   * DOM就绪
   */
  function onReady() {
    // 缓存DOM元素
    cacheElements();

    // 绑定事件
    bindEvents();

    // 初始化会话
    if (chatbotConfig.enableHistory) {
      ConversationLogger.initSession({
        platform: 'web',
        page: window.location.pathname,
      });
      sessionInitialized = true;
    }

    // 加载设置
    loadSettings();

    console.log('🤖 游导智能客服已就绪');
  }

  /**
   * 缓存DOM元素
   */
  function cacheElements() {
    elements.popup = document.getElementById('chatbotPopup');
    elements.body = document.getElementById('chatbotBody');
    elements.input = document.getElementById('chatbotInput');
    elements.sendBtn = document.getElementById('chatbotSend');
    elements.quickReplies = document.getElementById('quickReplies');
    elements.toggleBtn = document.getElementById('chatbotToggle');
    elements.historyBtn = document.getElementById('chatbotHistory');
  }

  /**
   * 绑定事件
   */
  function bindEvents() {
    // 切换按钮
    if (elements.toggleBtn) {
      elements.toggleBtn.addEventListener('click', toggleChatbot);
    }

    // 发送按钮
    if (elements.sendBtn) {
      elements.sendBtn.addEventListener('click', sendMessage);
    }

    // 输入框回车
    if (elements.input) {
      elements.input.addEventListener('keypress', handleEnter);
    }

    // 历史记录按钮
    if (elements.historyBtn) {
      elements.historyBtn.addEventListener('click', showHistory);
    }
  }

  /**
   * 切换聊天窗口
   */
  function toggleChatbot() {
    if (!elements.popup) return;
    
    chatbotOpen = !chatbotOpen;
    elements.popup.classList.toggle('open', chatbotOpen);

    if (chatbotOpen && !elements.popup.dataset.init) {
      showWelcome();
      elements.popup.dataset.init = 'true';
    }
  }

  /**
   * 显示欢迎信息
   */
  function showWelcome() {
    const welcomeHTML = `
      <div class="msg msg-bot">
        <p>👋 您好！我是游导旅游智能助手</p>
      </div>
      <div class="msg msg-bot">
        <p>我可以帮您解答：</p>
        <ul style="margin:8px 0 0 0;padding-left:20px;text-align:left">
          <li>📋 各国签证政策与办理流程</li>
          <li>🎤 导游推荐与服务介绍</li>
          <li>🗺️ 行程规划与景点攻略</li>
          <li>✈️ 机票、酒店预订建议</li>
          <li>🍜 美食、购物、交通指南</li>
          <li>⚠️ 避坑指南与安全提示</li>
        </ul>
      </div>
    `;
    
    appendMessage(welcomeHTML);
    showQuickButtons();
  }

  /**
   * 快捷按钮
   */
  function showQuickButtons() {
    if (!elements.quickReplies) return;
    
    elements.quickReplies.innerHTML = `
      <div class="quick-btn" data-action="japan">🇯🇵 日本</div>
      <div class="quick-btn" data-action="thailand">🇹🇭 泰国</div>
      <div class="quick-btn" data-action="europe">🇪🇺 欧洲</div>
      <div class="quick-btn" data-action="visa">📋 签证</div>
      <div class="quick-btn" data-action="guide">🗣️ 导游</div>
      <div class="quick-btn" data-action="human">📞 人工</div>
    `;

    // 绑定点击事件
    elements.quickReplies.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const action = this.dataset.action;
        handleQuickAction(action);
      });
    });
  }

  /**
   * 处理快捷操作
   */
  function handleQuickAction(action) {
    const actions = {
      japan: '日本旅游攻略',
      thailand: '泰国旅游攻略',
      europe: '欧洲旅游攻略',
      visa: '签证怎么办理',
      guide: '如何预约导游',
      human: '转人工服务',
    };

    const message = actions[action] || action;
    if (elements.input) elements.input.value = message;
    sendMessage();
  }

  /**
   * 发送消息
   */
  function sendMessage() {
    if (!elements.input || !elements.body) return;
    
    const message = elements.input.value.trim();
    if (!message) return;

    // 添加用户消息
    addUserMessage(message);
    elements.input.value = '';

    // 清空快捷按钮
    if (elements.quickReplies) elements.quickReplies.innerHTML = '';

    // 记录对话
    if (sessionInitialized) {
      ConversationLogger.addMessage('user', message);
    }

    // 处理并回复
    processMessage(message);
  }

  /**
   * 添加用户消息
   */
  function addUserMessage(content) {
    const html = `<div class="msg msg-user"><p>${escapeHtml(content)}</p></div>`;
    appendMessage(html);
  }

  /**
   * 添加机器人消息
   */
  function addBotMessage(content, options = {}) {
    const { isHTML = true } = options;
    const html = `<div class="msg msg-bot"><p>${isHTML ? content : escapeHtml(content)}</p></div>`;
    appendMessage(html);
    
    if (sessionInitialized) {
      ConversationLogger.addMessage('bot', isHTML ? content.replace(/<[^>]*>/g, '') : content);
    }
  }

  /**
   * 追加消息到聊天区域
   */
  function appendMessage(html) {
    if (!elements.body) return;
    
    const div = document.createElement('div');
    div.innerHTML = html;
    elements.body.appendChild(div);
    elements.body.scrollTop = elements.body.scrollHeight;
  }

  /**
   * 处理消息
   */
  function processMessage(message) {
    isTyping = true;
    showTyping();

    // 情绪分析
    if (chatbotConfig.enableEmotion && window.EmotionAnalyzer) {
      const emotion = EmotionAnalyzer.analyze(message);
      if (sessionInitialized) {
        ConversationLogger.recordSentiment(emotion);
      }

      // 负面情绪预警
      if (emotion.needTransfer) {
        handleTransfer(emotion);
        return;
      }
    }

    // AI理解
    if (chatbotConfig.enableAI && window.AIAssistant) {
      const understanding = AIAssistant.handleConversation(message);
      
      // 更新用户画像
      if (chatbotConfig.enableRecommend && window.SmartRecommender) {
        SmartRecommender.updateUserContext(message, understanding.entities);
      }

      // 生成回复
      setTimeout(() => {
        hideTyping();
        isTyping = false;
        
        const response = understanding.response;
        if (typeof response === 'object') {
          addBotMessage(response.content);
          showSuggestions(response.suggestions);
        } else {
          addBotMessage(response);
        }
      }, 500 + Math.random() * 500);
    } else {
      // 降级到基础知识库
      setTimeout(() => {
        hideTyping();
        isTyping = false;
        const reply = getBasicReply(message);
        addBotMessage(reply);
      }, 500);
    }
  }

  /**
   * 基础回复（无AI时使用）
   */
  function getBasicReply(message) {
    const lowerMsg = message.toLowerCase();

    // 知识库匹配
    if (window.KnowledgeBase && chatbotConfig.enableKnowledge) {
      const match = KnowledgeBase.smartMatch(message);
      if (match && match.type === 'faq') {
        KnowledgeBase.recordFAQView(match.data.id);
        return match.data.answer;
      }
    }

    // 关键词匹配
    if (lowerMsg.includes('日本')) {
      return getKnowledgeContent('japan');
    }
    if (lowerMsg.includes('泰国')) {
      return getKnowledgeContent('thailand');
    }
    if (lowerMsg.includes('欧洲')) {
      return getKnowledgeContent('europe');
    }
    if (lowerMsg.includes('签证')) {
      return getKnowledgeContent('visa');
    }
    if (lowerMsg.includes('导游')) {
      return getKnowledgeContent('guide');
    }
    if (lowerMsg.includes('人工') || lowerMsg.includes('客服')) {
      return getKnowledgeContent('human');
    }
    if (lowerMsg.includes('预算') || lowerMsg.includes('多少钱')) {
      return getKnowledgeContent('budget');
    }
    if (lowerMsg.includes('你好') || lowerMsg.includes('您好') || lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
      return getKnowledgeContent('greeting');
    }

    // 默认回复
    return `感谢您的咨询！"${message}"这个问题我来帮您解答...<br><br>
    您可以：<br>
    • 告诉我您想去的目的地<br>
    • 询问签证、导游等问题<br>
    • 或者直接点击快捷按钮获取帮助`;
  }

  /**
   * 获取知识库内容
   */
  function getKnowledgeContent(type) {
    const contents = {
      japan: `<strong>🇯🇵 日本旅游指南</strong><br><br>
<b>【最佳时间】</b>春季赏樱(3-4月)、秋季枫叶(10-11月)<br><br>
<b>【签证】</b>单次签90天/多次签3-5年，需资产证明<br><br>
<b>【必去】</b>东京、京都、大阪、北海道<br><br>
<b>【交通】</b>JR Pass通票+西瓜卡，机场可购<br><br>
<b>【美食】</b>寿司、拉面、和牛、抹茶甜点<br><br>
需要更详细的攻略吗？`,
      
      thailand: `<strong>🇹🇭 泰国旅游指南</strong><br><br>
<b>【好消息】</b>泰国免签！带护照就走！<br><br>
<b>【目的地】</b><br>
• 曼谷：大皇宫、考山路、暹罗广场<br>
• 清迈：古城、夜市、寺庙<br>
• 普吉岛：海岛风光、潜水<br><br>
<b>【美食】</b>冬阴功、芒果糯米饭、泰式炒河粉<br><br>
<b>【注意】</b>寺庙需穿长裤、远离大麻场所<br><br>
需要了解具体行程吗？`,
      
      europe: `<strong>🇪🇺 欧洲旅游指南</strong><br><br>
<b>【签证】</b>申根签证覆盖27国，有效期90天<br><br>
<b>【推荐路线】</b><br>
• 法瑞意12日：巴黎→罗马→瑞士<br>
• 西班牙10日：巴塞罗那→马德里<br>
• 北欧峡湾：挪威→瑞典<br><br>
<b>【预算】</b>淡季2-3万，旺季3-5万/人<br><br>
<b>【贴士】</b>防盗第一，欧铁通票很划算<br><br>
想了解具体路线吗？`,
      
      visa: `<strong>🛂 签证办理指南</strong><br><br>
<b>【热门国家签证】</b><br>
• 🇯🇵 日本：单次200元，多次400-600元<br>
• 🇹🇭 泰国：免签！<br>
• 🇪🇺 申根：80欧元+服务费<br>
• 🇺🇸 美国：B1/B2，185美元<br><br>
<b>【通用材料】</b><br>
• 护照（6个月以上有效期）<br>
• 照片、申请表、行程单<br>
• 银行流水、在职证明<br><br>
需要了解哪个国家的签证详情？`,
      
      guide: `<strong>🗣️ 导游预约服务</strong><br><br>
<b>【服务类型】</b><br>
• 🌟 普通导游：标准讲解，500-800元/天<br>
• 💎 高级导游：深度讲解，800-1200元/天<br>
• 👑 私人向导：专属服务，1200-2000元/天<br><br>
<b>【热门目的地】</b><br>
• 日本：东京、大阪、京都<br>
• 泰国：曼谷、清迈、普吉岛<br>
• 欧洲：巴黎、罗马、伦敦<br><br>
告诉我您想去哪里，我来为您推荐！`,
      
      human: `<strong>💬 转接人工服务</strong><br><br>
好的，我将为您转接专业客服人员，请稍候...<br><br>
<i>预计等待时间：1-3分钟</i><br><br>
您也可以通过以下方式联系我们：<br>
• 📧 邮箱：service@youdautrip.com<br>
• 📞 电话：400-888-8888<br>
• 💬 微信：youdautrip<br><br>
感谢您的耐心等待！`,
      
      budget: `<strong>💰 旅游预算参考</strong><br><br>
<b>【按目的地】</b><br>
• 🇯🇵 日本：8000-15000元/人<br>
• 🇹🇭 泰国：4000-8000元/人<br>
• 🇪🇺 欧洲：15000-30000元/人<br>
• 🇦🇺 澳洲：12000-20000元/人<br><br>
<b>【省钱建议】</b><br>
• 提前1-3个月订机票<br>
• 避开节假日旺季<br>
• 选择民宿或经济酒店<br>
• 品尝当地街头美食<br><br>
告诉我目的地和天数，帮您做详细预算！`,
      
      greeting: `👋 您好！欢迎使用游导旅游智能助手！<br><br>
很高兴为您服务！请告诉我：<br><br>
• 您想去哪个目的地？<br>
• 需要办理什么签证？<br>
• 想预约导游服务？<br>
• 还是有其他问题？<br><br>
我会尽力帮您解答！🌍`,
    };

    return contents[type] || contents.greeting;
  }

  /**
   * 处理转人工
   */
  function handleTransfer(emotion) {
    hideTyping();
    isTyping = false;

    const transferMsg = `
      <div style="background:#FFF3CD;padding:12px;border-radius:8px;margin-top:10px;">
        <p>⚠️ ${emotion.transferReason || '系统检测到您可能需要人工帮助'}</p>
        <p style="margin-top:8px;">正在为您转接人工客服，请稍候...</p>
      </div>
    `;
    addBotMessage(transferMsg);

    // 显示联系方式作为备选
    setTimeout(() => {
      addBotMessage(`
        <div style="margin-top:10px;">
          <p>或者您也可以直接联系我们：</p>
          <p>📞 电话：400-888-8888</p>
          <p>💬 微信：youdautrip</p>
        </div>
      `);
    }, 1000);

    // 重新显示快捷按钮
    setTimeout(showQuickButtons, 2000);
  }

  /**
   * 显示建议
   */
  function showSuggestions(suggestions) {
    if (!suggestions || suggestions.length === 0) return;

    const buttons = suggestions.slice(0, chatbotConfig.maxSuggestions)
      .map(s => `<div class="quick-btn" data-action="suggest:${s}">${s}</div>`)
      .join('');

    if (elements.quickReplies) {
      elements.quickReplies.innerHTML = buttons;
      elements.quickReplies.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const action = this.dataset.action;
          const text = action.replace('suggest:', '');
          if (elements.input) elements.input.value = text;
          sendMessage();
        });
      });
    }
  }

  /**
   * 显示正在输入
   */
  function showTyping() {
    const typingHTML = `
      <div class="msg msg-bot typing" id="typingIndicator">
        <p>🤖 正在思考...</p>
      </div>
    `;
    appendMessage(typingHTML);
  }

  /**
   * 隐藏正在输入
   */
  function hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
  }

  /**
   * 处理回车键
   */
  function handleEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  /**
   * 显示历史记录
   */
  function showHistory() {
    if (!window.ConversationLogger) {
      alert('对话记录功能暂不可用');
      return;
    }

    const sessions = ConversationLogger.getSessionList({ pageSize: 10 });
    
    if (sessions.total === 0) {
      alert('暂无历史对话记录');
      return;
    }

    let html = '<div style="max-height:400px;overflow-y:auto;">';
    html += '<h3 style="margin-bottom:15px;">📜 历史对话</h3>';
    
    sessions.sessions.forEach(s => {
      const time = new Date(s.startTime).toLocaleString();
      const rating = s.rating ? '⭐'.repeat(s.rating.rating) : '-';
      html += `
        <div style="padding:12px;border-bottom:1px solid #eee;cursor:pointer;" 
             onclick="Chatbot.resumeSession('${s.id}')">
          <div style="font-weight:600;">${s.preview}</div>
          <div style="font-size:12px;color:#666;margin-top:4px;">
            ${time} | ${s.messageCount}条消息 | 评分: ${rating}
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    html += '<button class="btn btn-secondary" style="margin-top:15px;" onclick="Chatbot.clearHistory()">清空历史</button>';

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div style="background:white;border-radius:15px;padding:25px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;">
        ${html}
        <button class="btn btn-secondary" style="margin-top:15px;width:100%;" onclick="this.closest('div').parentElement.remove()">关闭</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  /**
   * 恢复会话
   */
  function resumeSession(sessionId) {
    const session = ConversationLogger.resumeSession(sessionId);
    if (session) {
      toggleChatbot();
      elements.body.innerHTML = '';
      
      session.messages.forEach(m => {
        if (m.type === 'user') {
          addUserMessage(m.content);
        } else if (m.type === 'bot') {
          addBotMessage(m.content);
        }
      });

      // 关闭模态框
      document.querySelectorAll('[style*="z-index:1000"]').forEach(el => el.remove());
    }
  }

  /**
   * 清空历史
   */
  function clearHistory() {
    if (confirm('确定要清空所有对话历史吗？')) {
      ConversationLogger.clearAllSessions();
      alert('历史记录已清空');
      document.querySelectorAll('[style*="z-index:1000"]').forEach(el => el.remove());
    }
  }

  /**
   * 加载设置
   */
  function loadSettings() {
    if (window.ConversationLogger) {
      const settings = ConversationLogger.getUserSettings();
      Object.assign(chatbotConfig, settings);
    }
  }

  /**
   * HTML转义
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 公开API
  window.Chatbot = {
    toggle: toggleChatbot,
    send: sendMessage,
    showHistory,
    resumeSession,
    clearHistory,
    getConfig: () => ({ ...chatbotConfig }),
    setConfig: (config) => Object.assign(chatbotConfig, config),
  };

  // 启动
  init();

})();
