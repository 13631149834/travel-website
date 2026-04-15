# 游导旅游智能客服系统 - 模块说明

## 📁 文件结构

```
travel-website/
├── js/
│   └── chatbot/
│       ├── ai-assistant.js      # AI助手核心模块
│       ├── knowledge.js         # 知识库系统
│       ├── emotion.js          # 情感分析模块
│       ├── recommender.js      # 智能推荐模块
│       ├── conversation-log.js  # 对话记录模块
│       └── chatbot-enhanced.js  # 增强版主文件
└── admin/
    └── chatbot-config.html      # 智能客服管理后台
```

## 🔧 模块介绍

### 1. AI助手 (ai-assistant.js)

**功能：**
- 自然语言理解
- 意图识别（17+种意图类型）
- 实体提取（国家、城市、时间、预算等）
- 多轮对话上下文记忆
- 意图响应生成

**使用方式：**
```javascript
// 理解用户输入
const result = AIAssistant.understand('我想去日本旅游');

// 处理完整对话
const result = AIAssistant.handleConversation('签证怎么办理');

// 获取对话历史
const history = AIAssistant.getHistory();

// 获取当前上下文
const context = AIAssistant.getContext();

// 重置上下文
AIAssistant.resetContext();
```

### 2. 知识库 (knowledge.js)

**功能：**
- FAQ管理（分类、搜索、匹配）
- 热门FAQ推荐
- 智能问答匹配
- 知识库增删改查
- 数据导入导出

**使用方式：**
```javascript
// 搜索FAQ
const results = KnowledgeBase.search('签证');

// 获取热门FAQ
const hotFAQs = KnowledgeBase.getHotFAQs(10);

// 获取目的地推荐
const rec = KnowledgeBase.getRecommendations('日本');

// 智能匹配
const match = KnowledgeBase.smartMatch('日本签证怎么办');

// 标记FAQ为有用
KnowledgeBase.markFAQHelpful('faq_001');

// 导出知识库
const jsonData = KnowledgeBase.exportData();

// 获取统计
const stats = KnowledgeBase.getStats();
```

### 3. 情感分析 (emotion.js)

**功能：**
- 实时情绪识别
- 5种情绪类型：正面、中性、负面、焦虑、紧急
- 情绪强度分析
- 自动转人工判断
- 情绪历史追踪

**使用方式：**
```javascript
// 分析文本情绪
const result = EmotionAnalyzer.analyze('这个服务太差了，我很生气！');

// 返回结果：
// {
//   type: 'negative',      // 情绪类型
//   score: -3,             // 情绪分数
//   intensity: 'strong',   // 强度
//   needTransfer: true,    // 是否需要转人工
//   sentiment: 'negative', // 整体情感
//   suggestions: [...]     // 建议
// }

// 获取当前情绪
const current = EmotionAnalyzer.getCurrentEmotion();

// 获取情绪统计
const stats = EmotionAnalyzer.getEmotionStats();
```

### 4. 智能推荐 (recommender.js)

**功能：**
- 目的地推荐
- 路线推荐
- 导游推荐
- 用户画像分析
- 上下文感知推荐

**使用方式：**
```javascript
// 推荐目的地
const destinations = SmartRecommender.recommend('destination', { limit: 3 });

// 推荐路线
const routes = SmartRecommender.recommend('route', { destination: '日本' });

// 推荐导游
const guides = SmartRecommender.recommend('guide', { destination: '日本' });

// 更新用户画像
SmartRecommender.updateUserContext('我想去日本看樱花', { destination: '日本' });

// 获取用户画像
const profile = SmartRecommender.getUserProfile();

// 搜索推荐
const results = SmartRecommender.search('海岛');
```

### 5. 对话记录 (conversation-log.js)

**功能：**
- 会话存储与管理
- 历史对话查看
- 多格式导出（JSON/TXT/CSV）
- 隐私加密
- 数据统计

**使用方式：**
```javascript
// 初始化会话
ConversationLogger.initSession({ userId: 'xxx' });

// 添加消息
ConversationLogger.addMessage('user', '我想去日本');

// 记录情绪
ConversationLogger.recordSentiment({ type: 'positive', score: 2 });

// 设置评分
ConversationLogger.setRating(5, '服务很好');

// 获取会话列表
const list = ConversationLogger.getSessionList({ page: 1, pageSize: 20 });

// 获取会话详情
const session = ConversationLogger.getSessionDetail('session_id');

// 导出对话
const json = ConversationLogger.exportConversation('session_id', 'json');

// 下载导出文件
ConversationLogger.downloadExport('session_id', 'txt');

// 获取统计
const stats = ConversationLogger.getStatistics();
```

### 6. 增强版主文件 (chatbot-enhanced.js)

整合所有模块，提供完整的聊天机器人功能。

**使用方法：**
```html
<!-- 引入所有模块 -->
<script src="js/chatbot/knowledge.js"></script>
<script src="js/chatbot/emotion.js"></script>
<script src="js/chatbot/ai-assistant.js"></script>
<script src="js/chatbot/recommender.js"></script>
<script src="js/chatbot/conversation-log.js"></script>
<script src="js/chatbot-enhanced.js"></script>

<!-- 调用API -->
<script>
  // 切换聊天窗口
  Chatbot.toggle();

  // 发送消息
  Chatbot.send();

  // 显示历史
  Chatbot.showHistory();

  // 清空历史
  Chatbot.clearHistory();

  // 修改配置
  Chatbot.setConfig({ enableAI: true });
</script>
```

## 🎨 管理后台

访问 `admin/chatbot-config.html` 进行管理：

### 功能模块
1. **总览** - 实时数据统计、情绪分布、意图分布
2. **知识库** - FAQ管理、添加/编辑/删除
3. **对话分析** - 历史对话查看、导出
4. **情绪监控** - 实时情绪监控、预警列表
5. **系统设置** - 功能开关、预警阈值配置

### 主要功能
- 📊 数据可视化统计
- 📚 FAQ管理（支持富文本）
- 💬 对话记录查看与导出
- 😊 情绪预警监控
- ⚙️ 灵活的功能配置

## 🔌 API 总结

| 模块 | 主要方法 |
|------|---------|
| AIAssistant | `understand()`, `handleConversation()`, `getHistory()`, `resetContext()` |
| KnowledgeBase | `search()`, `getHotFAQs()`, `getRecommendations()`, `addFAQ()` |
| EmotionAnalyzer | `analyze()`, `getCurrentEmotion()`, `getEmotionStats()` |
| SmartRecommender | `recommend()`, `updateUserContext()`, `getUserProfile()` |
| ConversationLogger | `initSession()`, `addMessage()`, `getSessionList()`, `exportConversation()` |

## 📝 注意事项

1. 模块之间存在依赖关系，引入时请按顺序加载
2. 所有模块都使用IIFE封装，不会污染全局命名空间
3. 对话记录使用localStorage存储，请注意数据安全
4. 情绪分析使用词典匹配，准确度取决于词典覆盖范围
5. 管理后台需要管理员权限才能访问

## 🚀 快速开始

1. 复制所有 `.js` 文件到 `js/chatbot/` 目录
2. 在页面中引入模块（按依赖顺序）
3. 确保页面有聊天窗口的DOM结构
4. 访问管理后台进行配置

---
*Version 1.0 | 游导旅游*
