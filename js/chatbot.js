// ===== 智能客服JS（按需加载） =====

let chatbotLoaded = false;
let chatbotOpen = false;

// 知识库（可扩展）
const knowledgeBase = {
  greetings: ['你好！我是旅行小助手', '有什么可以帮到你的吗？'],
  visa: {
    keywords: ['签证', 'visa', '护照'],
    answers: [
      '热门国家签证信息：\n• 日本：单次500元起，需7-10工作日\n• 泰国：落地签方便，230元\n• 申根：800元起，需提前预约\n\n需要了解哪个国家？'
    ]
  },
  transport: {
    keywords: ['交通', '机票', '火车'],
    answers: [
      '交通攻略建议：\n• 国际机票：提前1-2个月预订最划算\n• 境内交通：提前查好公共交通\n• 包车游：人多更划算\n\n你的目的地是哪里？'
    ]
  },
  hotel: {
    keywords: ['酒店', '住宿', '民宿'],
    answers: [
      '住宿选择建议：\n• 酒店：标准服务，安全可靠\n• 民宿：体验当地生活，价格实惠\n• 青旅：适合背包客，社交属性强\n\n需要推荐具体城市吗？'
    ]
  },
  emergency: {
    keywords: ['紧急', '报警', '急救'],
    answers: [
      '⚠️ 如遇紧急情况：\n\n🆘 全球通用求救电话：112\n🆘 中国外交部全球热线：+86-10-12308\n\n请立即联系当地警方或使馆！'
    ]
  },
  default: [
    '抱歉，我没理解你的问题',
    '你可以试着问：签证、交通、住宿、紧急求助等',
    '或者点击菜单快速获取帮助'
  ]
};

// 加载客服
function loadChatbot() {
  if (chatbotLoaded) return;
  chatbotLoaded = true;
  
  // 动态加载客服样式（如果需要额外样式）
  console.log('智能客服已就绪');
}

// 切换客服窗口
function toggleChatbot() {
  const popup = document.getElementById('chatbotPopup');
  if (!popup) return;
  
  chatbotOpen = !chatbotOpen;
  popup.classList.toggle('open', chatbotOpen);
  
  if (chatbotOpen && !chatbotLoaded) {
    loadChatbot();
    // 欢迎消息
    addBotMessage(knowledgeBase.greetings[0]);
  }
}

// 添加用户消息
function sendMessage() {
  const input = document.getElementById('chatbotInput');
  const message = input.value.trim();
  if (!message) return;
  
  addUserMessage(message);
  input.value = '';
  
  // 模拟AI回复
  setTimeout(() => {
    const reply = getBotReply(message);
    addBotMessage(reply);
  }, 500 + Math.random() * 500);
}

// 添加用户消息到聊天区
function addUserMessage(message) {
  const body = document.getElementById('chatbotBody');
  if (!body) return;
  
  const div = document.createElement('div');
  div.className = 'msg msg-user';
  div.textContent = message;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

// 添加机器人消息
function addBotMessage(message) {
  const body = document.getElementById('chatbotBody');
  if (!body) return;
  
  const div = document.createElement('div');
  div.className = 'msg msg-bot';
  div.textContent = message;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

// 获取机器人回复
function getBotReply(message) {
  const lowerMsg = message.toLowerCase();
  
  // 检查关键词
  for (const [key, value] of Object.entries(knowledgeBase)) {
    if (key === 'greetings' || key === 'default') continue;
    
    if (value.keywords && value.keywords.some(kw => lowerMsg.includes(kw))) {
      return value.answers[0];
    }
  }
  
  // 紧急情况优先
  if (lowerMsg.includes('紧急') || lowerMsg.includes('报警') || lowerMsg.includes('出事')) {
    return knowledgeBase.emergency.answers[0];
  }
  
  // 默认回复
  return knowledgeBase.default[Math.floor(Math.random() * knowledgeBase.default.length)];
}

// Enter键发送
function handleEnter(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

// 关闭客服
function closeChatbot() {
  const popup = document.getElementById('chatbotPopup');
  if (popup) {
    popup.classList.remove('open');
    chatbotOpen = false;
  }
}

// 点击外部关闭
document.addEventListener('click', (e) => {
  const popup = document.getElementById('chatbotPopup');
  const btn = document.querySelector('.chatbot-btn');
  
  if (popup && chatbotOpen && 
      !popup.contains(e.target) && 
      !btn.contains(e.target)) {
    closeChatbot();
  }
});
