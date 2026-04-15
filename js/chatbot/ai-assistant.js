/**
 * 游导旅游智能客服 - AI助手核心模块
 * 功能：自然语言理解、意图识别、多轮对话、上下文记忆
 */

const AIAssistant = (function() {
  // 配置
  const config = {
    maxContextLength: 10,        // 上下文记忆条数
    typingDelay: 800,            // 打字延迟(ms)
    confidenceThreshold: 0.6,    // 意图识别置信度阈值
    emotionThreshold: 0.7,      // 情绪检测阈值
    autoTransferDelay: 3000,     // 自动转人工延迟(ms)
  };

  // 对话上下文
  let conversationContext = {
    history: [],                 // 历史对话
    currentIntent: null,         // 当前意图
    entities: {},                // 提取的实体
    userProfile: {},             // 用户画像
    sentiment: 'neutral',        // 当前情绪
    sentimentScore: 0,           // 情绪分数
    turnCount: 0,                // 对话轮次
    lastTopic: null,             // 上一个话题
  };

  // 意图定义
  const intents = {
    // 目的地咨询
    'destination_inquiry': {
      keywords: ['去哪', '推荐', '好玩', '景点', '旅行地', '目的地', '去哪里', '地方'],
      responses: 'destinationResponse',
      requiredEntities: ['destination_type'],
    },
    // 签证咨询
    'visa_inquiry': {
      keywords: ['签证', '护照', '签', '入境', '通关'],
      responses: 'visaResponse',
      requiredEntities: ['country'],
    },
    // 导游咨询
    'guide_inquiry': {
      keywords: ['导游', '向导', '讲解', '包车', '私人向导'],
      responses: 'guideResponse',
      requiredEntities: ['destination'],
    },
    // 预算咨询
    'budget_inquiry': {
      keywords: ['多少钱', '预算', '花费', '价格', '费用', '成本'],
      responses: 'budgetResponse',
      requiredEntities: ['destination', 'duration'],
    },
    // 预订咨询
    'booking_inquiry': {
      keywords: ['预订', '预定', '预约', '订', '购买', '下单'],
      responses: 'bookingResponse',
      requiredEntities: ['service_type'],
    },
    // 投诉反馈
    'complaint': {
      keywords: ['投诉', '差评', '不满', '问题', '坑', '骗'],
      responses: 'complaintResponse',
      priority: 'high',
    },
    // 情绪表达
    'emotional_expression': {
      keywords: [],
      responses: 'emotionResponse',
      type: 'system',
    },
    // 问候
    'greeting': {
      keywords: ['你好', '您好', 'hi', 'hello', '嗨', '在吗', '在嘛'],
      responses: 'greetingResponse',
      contextReset: true,
    },
    // 感谢
    'thanks': {
      keywords: ['谢谢', '感谢', '谢啦', '感谢你'],
      responses: 'thanksResponse',
    },
    // 告别
    'goodbye': {
      keywords: ['再见', '拜拜', '走了', '结束'],
      responses: 'goodbyeResponse',
      endConversation: true,
    },
    // 帮助
    'help': {
      keywords: ['帮助', '怎么用', '使用', '功能', '能干'],
      responses: 'helpResponse',
    },
    // 路线规划
    'route_planning': {
      keywords: ['路线', '行程', '规划', '几天', '安排', '攻略'],
      responses: 'routeResponse',
      requiredEntities: ['destination', 'duration'],
    },
    // 交通咨询
    'transport_inquiry': {
      keywords: ['交通', '飞机', '火车', '大巴', '自驾', '怎么去'],
      responses: 'transportResponse',
      requiredEntities: ['from', 'to'],
    },
    // 美食推荐
    'food_inquiry': {
      keywords: ['美食', '好吃', '餐厅', '食物', '吃什么', '当地菜'],
      responses: 'foodResponse',
      requiredEntities: ['destination'],
    },
    // 天气咨询
    'weather_inquiry': {
      keywords: ['天气', '气温', '温度', '下雨', '气候'],
      responses: 'weatherResponse',
      requiredEntities: ['destination'],
    },
    // 转人工
    'human_transfer': {
      keywords: ['人工', '客服', '真人', '人工服务', '专人'],
      responses: 'transferResponse',
      priority: 'high',
    },
  };

  // 实体识别规则
  const entityPatterns = {
    country: /(日本|泰国|韩国|美国|法国|英国|德国|意大利|澳大利亚|新西兰|新加坡|马来西亚|印尼|巴厘岛|越南|印度|迪拜|阿联酋|西班牙|葡萄牙|瑞士|荷兰|希腊|土耳其|埃及|南非|巴西|阿根廷|加拿大|墨西哥)/g,
    city: /(东京|大阪|京都|北海道|曼谷|清迈|普吉岛|首尔|巴黎|伦敦|纽约|洛杉矶|悉尼|墨尔本|新加坡|巴厘岛|香港|澳门|台北)/g,
    duration: /(\d+)(天|日|周|个月)/g,
    budget: /(预算|花费|多少钱)(.*?)(\d+)(万|千|元)/g,
    month: /(1月|2月|3月|4月|5月|6月|7月|8月|9月|10月|11月|12月|一月|二月|三月|四月|五月|六月|七月|八月|九月|十月|十一月|十二月)/g,
  };

  // 情绪词典
  const emotionLexicon = {
    positive: ['开心', '高兴', '满意', '喜欢', '期待', '棒', '好', '不错', '谢谢', '感谢', '完美', '赞'],
    negative: ['生气', '失望', '不满', '投诉', '差评', '坑', '骗', '垃圾', '太差', '无语', '郁闷', '烦躁', '着急', '焦虑'],
    urgent: ['紧急', '马上', '立刻', '快点', '很急', '火速', '快'],
    worried: ['担心', '害怕', '顾虑', '忧虑', '不确定', '犹豫', '纠结'],
  };

  /**
   * 自然语言理解入口
   */
  function understand(input) {
    const result = {
      intent: null,
      confidence: 0,
      entities: {},
      sentiment: 'neutral',
      response: '',
      needTransfer: false,
      context: conversationContext,
    };

    // 情绪分析
    result.sentiment = analyzeSentiment(input);
    result.needTransfer = shouldTransferToHuman(result.sentiment);

    // 意图识别
    const intentResult = recognizeIntent(input);
    result.intent = intentResult.type;
    result.confidence = intentResult.confidence;
    
    // 实体提取
    result.entities = extractEntities(input);

    // 更新上下文
    updateContext(result);

    // 生成响应
    result.response = generateResponse(result);

    return result;
  }

  /**
   * 意图识别
   */
  function recognizeIntent(input) {
    const normalizedInput = input.toLowerCase();
    let bestMatch = { type: 'unknown', confidence: 0 };

    for (const [intentName, intentDef] of Object.entries(intents)) {
      if (intentDef.type === 'system') continue;
      
      let matchCount = 0;
      for (const keyword of intentDef.keywords) {
        if (normalizedInput.includes(keyword)) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        const confidence = Math.min(matchCount / Math.max(intentDef.keywords.length, 1), 1);
        if (confidence > bestMatch.confidence) {
          bestMatch = { type: intentName, confidence };
        }
      }
    }

    // 上下文补充：如果当前轮没有高置信度匹配，参考历史意图
    if (bestMatch.confidence < config.confidenceThreshold && conversationContext.currentIntent) {
      // 同一话题继续时，保持之前意图
      if (conversationContext.turnCount > 0) {
        bestMatch.confidence = 0.5;
        bestMatch.type = conversationContext.currentIntent;
      }
    }

    return bestMatch;
  }

  /**
   * 实体提取
   */
  function extractEntities(input) {
    const entities = {};

    for (const [entityType, pattern] of Object.entries(entityPatterns)) {
      const matches = input.match(pattern);
      if (matches) {
        entities[entityType] = matches[0];
      }
    }

    // 特殊处理：从上下文中补充实体
    if (conversationContext.entities) {
      for (const [key, value] of Object.entries(conversationContext.entities)) {
        if (!entities[key]) {
          entities[key] = value;
        }
      }
    }

    return entities;
  }

  /**
   * 情绪分析
   */
  function analyzeSentiment(input) {
    let scores = { positive: 0, negative: 0, urgent: 0, worried: 0 };
    
    for (const [emotion, words] of Object.entries(emotionLexicon)) {
      for (const word of words) {
        if (input.includes(word)) {
          scores[emotion]++;
        }
      }
    }

    // 计算情绪分数
    const totalScore = scores.positive + scores.negative;
    let sentiment = 'neutral';
    let sentimentScore = 0;

    if (scores.negative > 0) {
      sentiment = 'negative';
      sentimentScore = -scores.negative;
    } else if (scores.positive > 0) {
      sentiment = 'positive';
      sentimentScore = scores.positive;
    }

    if (scores.urgent > 0) {
      sentiment = 'urgent';
      sentimentScore = -5; // 紧急情况标记为强负面
    } else if (scores.worried > 0) {
      sentiment = 'worried';
      sentimentScore = -2;
    }

    return sentiment;
  }

  /**
   * 判断是否需要转人工
   */
  function shouldTransferToHuman(sentiment) {
    // 负面情绪、投诉、紧急情况需要转人工
    if (['negative', 'urgent'].includes(sentiment)) {
      return true;
    }
    
    // 检查是否明确要求转人工
    const intentResult = recognizeIntent(
      conversationContext.history.length > 0 
        ? conversationContext.history[conversationContext.history.length - 1].content 
        : ''
    );
    
    return intentResult.type === 'human_transfer';
  }

  /**
   * 更新上下文
   */
  function updateContext(result) {
    conversationContext.turnCount++;
    conversationContext.currentIntent = result.intent;
    conversationContext.entities = { ...conversationContext.entities, ...result.entities };
    conversationContext.sentiment = result.sentiment;
    conversationContext.sentimentScore = result.sentiment?.score || 0;

    // 限制历史长度
    if (conversationContext.history.length >= config.maxContextLength) {
      conversationContext.history.shift();
    }
  }

  /**
   * 生成响应
   */
  function generateResponse(result) {
    // 转人工
    if (result.needTransfer) {
      return generateTransferResponse(result);
    }

    // 根据意图生成响应
    const intent = result.intent;
    if (intent && intents[intent]?.responses) {
      const responseGenerator = window[intents[intent].responses];
      if (typeof responseGenerator === 'function') {
        return responseGenerator(result);
      }
    }

    // 默认响应
    return generateDefaultResponse(result);
  }

  /**
   * 生成转人工响应
   */
  function generateTransferResponse(result) {
    const messages = [
      '😊 我理解您的心情，为了更好地帮您解决问题，我将为您转接人工客服，请稍候...',
      '💬 感谢您的反馈，我将立即为您转接专业客服人员，请稍等片刻...',
      '🤝 我感受到您很重视这个问题，正在为您转接人工服务...',
    ];
    
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    
    return {
      type: 'transfer',
      content: randomMsg,
      autoAction: 'transfer_human',
    };
  }

  /**
   * 生成默认响应
   */
  function generateDefaultResponse(result) {
    const responses = [
      '😊 您的问题我已经收到，让我来帮您解答...',
      '感谢您的咨询，关于这个问题，我可以为您提供以下信息...',
      '好的，我来帮您分析一下...',
      '明白了，让我为您详细说明...',
    ];
    
    return {
      type: 'text',
      content: responses[Math.floor(Math.random() * responses.length)],
    };
  }

  /**
   * 多轮对话处理
   */
  function handleConversation(userInput) {
    const understanding = understand(userInput);
    
    // 记录对话历史
    conversationContext.history.push({
      role: 'user',
      content: userInput,
      intent: understanding.intent,
      entities: understanding.entities,
      timestamp: Date.now(),
    });

    // 生成回复
    const response = understanding.response;

    // 记录机器人回复
    conversationContext.history.push({
      role: 'bot',
      content: typeof response === 'string' ? response : response.content,
      intent: understanding.intent,
      timestamp: Date.now(),
    });

    return {
      ...understanding,
      response,
    };
  }

  /**
   * 获取对话历史
   */
  function getHistory() {
    return conversationContext.history;
  }

  /**
   * 获取当前上下文
   */
  function getContext() {
    return { ...conversationContext };
  }

  /**
   * 清空对话上下文
   */
  function resetContext() {
    conversationContext = {
      history: [],
      currentIntent: null,
      entities: {},
      userProfile: conversationContext.userProfile,
      sentiment: 'neutral',
      sentimentScore: 0,
      turnCount: 0,
      lastTopic: conversationContext.currentIntent,
    };
  }

  /**
   * 设置用户画像
   */
  function setUserProfile(profile) {
    conversationContext.userProfile = {
      ...conversationContext.userProfile,
      ...profile,
    };
  }

  /**
   * 获取用户画像
   */
  function getUserProfile() {
    return { ...conversationContext.userProfile };
  }

  // 公开API
  return {
    understand,
    handleConversation,
    getHistory,
    getContext,
    resetContext,
    setUserProfile,
    getUserProfile,
    config,
  };
})();

// 意图响应生成函数

/**
 * 目的地响应
 */
function destinationResponse(result) {
  const entities = result.entities;
  let content = '';

  if (entities.destination) {
    const dest = entities.destination;
    content = `您提到的${dest}是个很棒的选择！🏝️
    
我可以为您提供：
• 📋 详细的旅游攻略
• 🎯 必去景点推荐
• 🏨 住宿建议
• 💰 预算参考

您想了解哪个方面呢？`;
  } else {
    content = `🌍 很高兴为您推荐目的地！
    
根据您的需求，我推荐以下几个热门目的地：
    
🇯🇵 <strong>日本</strong> - 樱花、红叶、温泉、美食
🇹🇭 <strong>泰国</strong> - 海岛、寺庙、美食、性价比高
🇪🇺 <strong>欧洲</strong> - 艺术、建筑、浪漫之旅
🇦🇺 <strong>澳大利亚</strong> - 自然风光、海滩、野生动物
    
请问您更倾向于哪个地区？或者告诉我您想去几天、预算多少，我可以给出更精准的推荐！`;
  }

  return { type: 'text', content, suggestions: ['日本攻略', '泰国攻略', '欧洲攻略', '导游推荐'] };
}

/**
 * 签证响应
 */
function visaResponse(result) {
  const entities = result.entities;
  let content = '';

  if (entities.country) {
    const country = entities.country;
    const visaInfo = {
      '日本': '单次签证有效期90天，停留15/30天；多次签证需年收入或纳税证明',
      '泰国': '免签！停留最多30天',
      '韩国': '免签！停留最多90天',
      '美国': 'B1/B2签证，10年多次往返，需面签',
      '法国': '申根签证，可访问27个申根国',
      '澳大利亚': '电子签证，审理周期15-20天',
      '新加坡': '免签！停留最多30天',
      '迪拜': '免签！停留最多30天',
    };

    const info = visaInfo[country] || '请告诉我您想了解的具体签证类型';
    content = `🛂 关于${country}签证信息：

${info}

📝 办理小贴士：
• 确保护照有效期超过6个月
• 提前准备好银行流水、在职证明
• 预订往返机票和酒店（部分国家需要）

需要我帮您了解详细的办理流程吗？`;
  } else {
    content = `🛂 关于签证，我可以帮您解答以下问题：

• 各国签证政策与办理流程
• 所需材料清单
• 办理时间与费用
• 落地签与免签政策

请告诉我您想去哪个国家？`;
  }

  return { type: 'text', content, suggestions: ['日本签证', '泰国签证', '申根签证', '签证办理流程'] };
}

/**
 * 导游响应
 */
function guideResponse(result) {
  const entities = result.entities;
  
  const content = `🗣️ 关于导游服务，我很乐意为您推荐！

🌟 我们的导游优势：
• 专业持证导游，双语服务
• 当地资深向导，熟悉风土人情
• 私人定制行程，灵活调整
• 专属包车服务，全程接送

📍 热门目的地导游推荐：
• 🇯🇵 日本：东京、大阪、京都
• 🇹🇭 泰国：曼谷、清迈、普吉岛
• 🇪🇺 欧洲：法国、意大利、瑞士

您想去哪个目的地？需要什么类型的导游服务？`;

  return { type: 'text', content, suggestions: ['查看导游列表', '预约导游', '包车服务', '私人定制'] };
}

/**
 * 预算响应
 */
function budgetResponse(result) {
  const entities = result.entities;
  
  const content = `💰 关于旅游预算，我可以给您一些参考：

📊 热门目的地预算参考（按7天计算）：

🇯🇵 日本：8000-15000元/人
🇹🇭 泰国：4000-8000元/人
🇪🇺 欧洲：15000-30000元/人
🇦🇺 澳大利亚：12000-20000元/人
🇺🇸 美国：15000-25000元/人

💡 省钱建议：
• 提前预订机票和酒店
• 避开旺季出行
• 选择当地美食而非网红餐厅
• 利用城市通票游览

请问您想去哪里？准备玩几天呢？我可以为您做详细的预算规划！`;

  return { type: 'text', content, suggestions: ['日本预算', '泰国预算', '定制预算', '预算计算器'] };
}

/**
 * 预订响应
 */
function bookingResponse(result) {
  const content = `🎫 关于预订服务，我们可以帮您安排：

✅ 可预订项目：
• 🏨 酒店住宿（合作酒店享受优惠价）
• 🎫 景点门票（免排队优惠价）
• 🚗 包车服务（配司机）
• 🎟️ 体验活动（烹饪课、潜水、SPA等）
• ✈️ 接送机服务

💳 预订保障：
• 免费取消政策
• 24小时客服支持
• 先行赔付保障

请告诉我您想预订什么？或者让我为您推荐热门套餐！`;

  return { type: 'text', content, suggestions: ['预订酒店', '预订门票', '预订包车', '查看优惠套餐'] };
}

/**
 * 投诉响应
 */
function complaintResponse(result) {
  const content = `😔 非常抱歉给您带来不好的体验！

我们非常重视每一位用户的反馈。请您详细描述一下遇到的问题，我会立即为您处理。

您可以告诉我：
• 遇到问题的具体时间
• 涉及的导游或服务
• 问题的具体情况

我们将尽快核实并给您一个满意的解决方案！`;

  return { 
    type: 'text', 
    content, 
    priority: 'high',
    autoAction: 'create_ticket',
    suggestions: ['查看订单', '申请退款', '联系客服'] 
  };
}

/**
 * 问候响应
 */
function greetingResponse(result) {
  const hour = new Date().getHours();
  let greeting = '';
  
  if (hour < 12) greeting = '早上好';
  else if (hour < 18) greeting = '下午好';
  else greeting = '晚上好';

  const content = `👋 ${greeting}！欢迎来到游导旅游！

我是您的智能旅行助手，可以帮您：

🌍 <strong>目的地推荐</strong> - 根据您的喜好推荐旅行目的地
📋 <strong>签证咨询</strong> - 了解各国签证政策与办理流程
🗣️ <strong>导游预约</strong> - 找到最适合您的当地导游
💰 <strong>预算规划</strong> - 制定合理的旅行预算
📝 <strong>行程规划</strong> - 定制专属旅行路线

请问有什么可以帮您的？`;

  return { type: 'text', content, suggestions: ['日本旅游', '签证咨询', '预约导游', '制定行程'] };
}

/**
 * 感谢响应
 */
function thanksResponse(result) {
  const content = `😊 不客气！很高兴能帮到您！

如果您还有其他问题，随时可以问我。祝您旅途愉快！🌟

您还可以：
• 继续了解其他目的地
• 预约导游服务
• 获取更多旅行攻略`;

  return { type: 'text', content };
}

/**
 * 告别响应
 */
function goodbyeResponse(result) {
  const content = `👋 感谢使用游导旅游智能助手！

祝您旅途愉快，期待与您下次相遇！🌍✈️

再见！`;

  return { type: 'text', content, endConversation: true };
}

/**
 * 帮助响应
 */
function helpResponse(result) {
  const content = `📖 我是游导旅游智能助手，可以为您提供以下服务：

🎯 <strong>我能做什么</strong>
• 回答各类旅游相关问题
• 推荐热门目的地和景点
• 提供签证、货币、语言等实用信息
• 推荐合适的导游和旅行团
• 帮您规划行程和预算

💡 <strong>使用技巧</strong>
• 直接描述您的需求，如"我想去日本看樱花"
• 告诉我出行人数、时间、预算，获取更精准的推荐
• 使用快捷按钮快速咨询常见问题

🔧 <strong>遇到问题</strong>
• 如果我没有正确理解您的问题，请换个方式描述
• 如需人工服务，回复"人工"即可转接客服

请告诉我您想去哪里旅行？`;

  return { type: 'text', content };
}

/**
 * 路线规划响应
 */
function routeResponse(result) {
  const entities = result.entities;
  
  const content = `🗺️ 很高兴为您规划行程！

请告诉我以下信息，我可以为您定制专属路线：
• 📍 想去哪里（目的地）
• 📅 计划玩几天
• 👥 出行人数
• 💰 预算范围
• 🎯 偏好类型（亲子游、蜜月、文化游、探险等）

或者您可以选择以下热门路线：

🇯🇵 <strong>日本经典线</strong>：东京→京都→大阪 7日
🇹🇭 <strong>泰國海岛线</strong>：曼谷→普吉岛 6日
🇪🇺 <strong>欧洲文艺线</strong>：巴黎→罗马→佛罗伦萨 12日

您更倾向于哪个方向呢？`;

  return { type: 'text', content, suggestions: ['日本7日游', '泰国6日游', '欧洲12日游', '定制路线'] };
}

/**
 * 交通响应
 */
function transportResponse(result) {
  const entities = result.entities;
  
  const content = `✈️ 关于交通出行，我来为您解答：

🛫 <strong>飞机出行</strong>
• 提前1-3个月预订机票最优惠
• 关注航空公司大促
• 善用比价网站

🚄 <strong>铁路出行</strong>
• 日本：JR Pass通票
• 欧洲：欧铁通票
• 国内：高铁网络发达

🚗 <strong>当地交通</strong>
• 日本：西瓜卡、ICOCA卡
• 泰国：Grab打车
• 欧洲：城市通票

请告诉我您的具体行程，我可以给出更详细的交通建议！`;

  return { type: 'text', content, suggestions: ['机票预订', '日本交通', '欧洲交通', '包车服务'] };
}

/**
 * 美食响应
 */
function foodResponse(result) {
  const entities = result.entities;
  
  const content = `🍜 旅行中的美食可是重头戏！

🇯🇵 <strong>日本必吃</strong>：寿司、拉面、和牛、刺身、抹茶
🇹🇭 <strong>泰国必吃</strong>：冬阴功、泰式炒河粉、芒果糯米饭、椰汁鸡汤
🇪🇺 <strong>欧洲必吃</strong>：法餐、意大利披萨、西班牙海鲜饭
🇰🇷 <strong>韩国必吃</strong>：烤肉、参鸡汤、辣炒年糕、炸鸡啤酒

💡 <strong>觅食小技巧</strong>
• 跟当地人走，钻进小巷子
• 查看TripAdvisor/Yelp评分
• 避开景点附近的"游客餐厅"
• 问问酒店前台本地人推荐

您想去哪里？我可以为您推荐当地特色美食！`;

  return { type: 'text', content, suggestions: ['日本美食', '泰国美食', '欧洲美食', '网红餐厅'] };
}

/**
 * 天气响应
 */
function weatherResponse(result) {
  const entities = result.entities;
  
  const content = `🌤️ 关于天气，让我来帮您分析：

📅 <strong>最佳出行时间建议</strong>
• 🇯🇵 日本：3-5月（樱花）、9-11月（红叶）
• 🇹🇭 泰国：11月-4月（凉季）
• 🇪🇺 欧洲：4-6月、9-10月
• 🇺🇸 美国：4-10月（西海岸）

🌡️ <strong>出行准备</strong>
• 提前查看天气预报
• 准备适合的衣物
• 随身携带雨具

请告诉我您计划什么时候、去哪里旅行？`;

  return { type: 'text', content, suggestions: ['查看天气预报', '最佳出行时间', '日本天气', '泰国天气'] };
}

/**
 * 转人工响应
 */
function transferResponse(result) {
  return {
    type: 'transfer',
    content: '💬 好的，我将为您转接人工客服，请稍候...',
    autoAction: 'transfer_human',
  };
}

/**
 * 情绪响应
 */
function emotionResponse(result) {
  const sentiment = result.sentiment;
  let content = '';

  switch (sentiment) {
    case 'positive':
      content = '😊 很高兴您有愉快的旅行计划！';
      break;
    case 'negative':
      content = '😔 我理解您的心情，请告诉我具体问题，我会尽力帮您解决。';
      break;
    case 'worried':
      content = '🤔 我能感受到您的顾虑，让我来帮您分析和解答。';
      break;
    default:
      content = '💬 我在呢，请说~';
  }

  return { type: 'text', content };
}
