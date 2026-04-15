/**
 * 游导旅游智能客服 - 知识库模块
 * 功能：常见问题库、智能匹配、自动学习
 */

const KnowledgeBase = (function() {
  // 知识库数据
  let knowledgeData = {
    // FAQ分类
    categories: {
      'visa': { name: '签证相关', icon: '🛂', priority: 1 },
      'destination': { name: '目的地咨询', icon: '🌍', priority: 2 },
      'guide': { name: '导游服务', icon: '🗣️', priority: 3 },
      'booking': { name: '预订问题', icon: '🎫', priority: 4 },
      'payment': { name: '支付问题', icon: '💳', priority: 5 },
      'refund': { name: '退款售后', icon: '💰', priority: 6 },
      'account': { name: '账户问题', icon: '👤', priority: 7 },
      'other': { name: '其他问题', icon: '❓', priority: 8 },
    },

    // FAQ条目
    faqs: [
      // 签证类
      {
        id: 'visa_001',
        category: 'visa',
        question: '日本签证怎么办理',
        keywords: ['日本签证', '日本签', '赴日签证'],
        answer: `🇯🇵 <strong>日本签证办理指南</strong>

📋 <strong>签证类型</strong>
• 单次签证：有效期90天，停留15天
• 三年多次：首次需在冲绳或东北六县住宿
• 五年多次：需年收入50万以上

📝 <strong>所需材料</strong>
• 护照原件（有效期6个月以上）
• 签证申请表
• 2寸白底照片2张
• 身份证、户口本复印件
• 在职证明、银行流水
• 行程单、酒店预订单

⏰ <strong>办理时间</strong>
• 正常：7-10个工作日
• 加急：3-5个工作日

💰 <strong>费用参考</strong>
• 单次：200-300元
• 三年多次：400-600元

需要了解具体办理流程可以联系顾问~`,
        viewCount: 12580,
        helpfulCount: 892,
        createdAt: '2024-01-15',
      },
      {
        id: 'visa_002',
        category: 'visa',
        question: '泰国签证政策',
        keywords: ['泰国签证', '泰签', '赴泰'],
        answer: `🇹🇭 <strong>泰国签证最新政策</strong>

🎉 <strong>好消息：中国公民免签！</strong>

📋 <strong>免签条件</strong>
• 停留期：不超过30天
• 护照有效期：6个月以上
• 需携带：往返机票、酒店预订单

✈️ <strong>说走就走的旅行</strong>
准备好护照，马上出发去泰国！

🌴 <strong>热门目的地</strong>
• 曼谷：首都，寺庙众多
• 清迈：文艺古城
• 普吉岛：海岛度假
• 苏梅岛：宁静放松

有任何问题随时问我~`,
        viewCount: 18234,
        helpfulCount: 1567,
        createdAt: '2024-02-01',
      },
      {
        id: 'visa_003',
        category: 'visa',
        question: '申根签证怎么办理',
        keywords: ['申根签证', '欧洲签证', '法签', '德签', '意大利签证'],
        answer: `🇪🇺 <strong>申根签证办理指南</strong>

📍 <strong>申根国家（27个）</strong>
法国、德国、意大利、瑞士、荷兰、比利时、西班牙、葡萄牙、希腊、奥地利、捷克、波兰、匈牙利、斯洛伐克、斯洛文尼亚、立陶宛、拉脱维亚、爱沙尼亚、芬兰、挪威、丹麦、冰岛、瑞典、卢森堡、列支敦士登、马耳他、克罗地亚

📋 <strong>办理流程</strong>
1. 确定申请国家（通常选择停留时间最长的国家）
2. 在对应国家签证中心官网预约
3. 准备材料
4. 前往签证中心递交材料、录指纹
5. 等待审核（通常10-15个工作日）

📝 <strong>核心材料</strong>
• 护照（2年以上有效期）
• 签证申请表
• 往返机票预订单
• 酒店预订单
• 行程单
• 在职证明
• 3-6个月银行流水
• 旅行保险（30万以上保额）

💰 <strong>费用</strong>
• 签证费：80欧元
• 服务费：约200元人民币

需要更详细的申根国攻略吗？`,
        viewCount: 9876,
        helpfulCount: 734,
        createdAt: ' '2024-01-20',
      },

      // 目的地类
      {
        id: 'dest_001',
        category: 'destination',
        question: '日本旅游最佳时间',
        keywords: ['日本最佳时间', '日本什么时候去', '日本季节'],
        answer: `🇯🇵 <strong>日本最佳旅游时间</strong>

🌸 <strong>春季（3-5月）- 樱花季</strong>
• 3月中旬-4月中旬是樱花盛开季
• 东京、京都、大阪樱花最美
• 人多，需提前预订酒店

☀️ <strong>夏季（6-8月）</strong>
• 梅雨季（6月），注意带伞
• 7-8月祭典众多
• 薰衣草盛开（富良野）

🍁 <strong>秋季（9-11月）- 红叶季</strong>
• 9月下旬-11月中旬
• 红叶与寺庙相映成趣
• 天气舒适，最推荐！

❄️ <strong>冬季（12-2月）</strong>
• 滑雪、温泉季节
• 北海道雪景绝美
• 新年气氛浓厚

💡 <strong>我的建议</strong>
首次去日本推荐：4月（赏樱）或10-11月（赏枫）`,
        viewCount: 15678,
        helpfulCount: 1234,
        createdAt: '2024-01-10',
      },
      {
        id: 'dest_002',
        category: 'destination',
        question: '第一次去日本去哪里好',
        keywords: ['日本推荐', '日本必去', '日本经典路线'],
        answer: `🇯🇵 <strong>日本经典路线推荐</strong>

🗾 <strong>第一次日本，推荐这条线路：</strong>

📍 <strong>关西精华线 7天</strong>
Day1-2: ✈️ 抵达大阪
• 道顿堀美食
• 大阪城公园
• 心斋桥购物

Day3: 🚄 大阪→京都
• 伏见稻荷大社（千鸟居）
• 清水寺
• 祇园花见小路

Day4: 🏯 京都一日游
• 金阁寺
• 岚山竹林
• 三十三间堂

Day5-6: 🚄 京都→奈良→大阪
• 奈良公园喂小鹿
• 东大寺

Day7: ✈️ 大阪返程

💰 <strong>预算参考</strong>
• 机票：2000-4000元/人
• 酒店：600-1500元/晚
• 交通：JR Pass 7日约1400元
• 总计：8000-15000元/人

🏯 <strong>必体验</strong>
• 穿和服游京都
• 泡温泉
• 吃寿司、吃拉面
• 逛便利店`,
        viewCount: 21345,
        helpfulCount: 1876,
        createdAt: '2024-01-05',
      },
      {
        id: 'dest_003',
        category: 'destination',
        question: '泰国旅游安全吗',
        keywords: ['泰国安全', '泰国注意', '泰国坑'],
        answer: `🇹🇭 <strong>泰国旅游安全指南</strong>

✅ <strong>整体安全性</strong>
泰国是热门旅游国家，整体相对安全，但需注意：

🚫 <strong>需要注意的事项</strong>
• 交通安全：靠左行驶，谨慎过马路
• 财物安全：人多地方注意防盗
• 远离赌博：泰国赌博违法
• 远离大麻：认准绿色叶子标志的店铺不要进
• 宗教礼仪：尊重佛教文化

🍜 <strong>美食安全</strong>
• 选择干净餐厅用餐
• 适量饮用冰块饮品
• 肠胃较弱带好药品

💡 <strong>防坑指南</strong>
• 嘟嘟车要砍价（拦腰砍再慢慢加）
• 景点门票建议网上预订
• 避开主动搭讪的导游
• 购物去正规商场

📱 <strong>紧急联系</strong>
• 报警：191
• 旅游警察：1155
• 中国驻泰使馆：02-2450088

祝您旅途愉快！🌴`,
        viewCount: 8765,
        helpfulCount: 654,
        createdAt: '2024-02-10',
      },

      // 导游服务类
      {
        id: 'guide_001',
        category: 'guide',
        question: '如何预约导游',
        keywords: ['预约导游', '找导游', '导游服务', '私人导游'],
        answer: `🗣️ <strong>如何预约导游服务</strong>

📋 <strong>预约流程</strong>
1. 告诉我您想去的目的地
2. 选择导游类型
3. 确认服务日期和行程
4. 完成预订支付
5. 出发前与导游沟通行程

👤 <strong>导游类型</strong>
• 🌟 <strong>普通导游</strong>：持证中文导游，标准讲解
• 💎 <strong>高级导游</strong>：资深导游，深入讲解当地文化
• 👑 <strong>私人向导</strong>：专属服务，行程灵活调整
• 🚗 <strong>包车+导游</strong>：含司机，含车辆，全程接送

💰 <strong>价格参考</strong>
• 半日游（4小时）：300-600元
• 全日游（8小时）：500-1200元
• 包车+导游：800-2000元/天

📍 <strong>热门目的地导游</strong>
• 日本：东京、大阪、京都
• 泰国：曼谷、清迈、普吉岛
• 欧洲：巴黎、罗马、伦敦

请告诉我您想去哪里，需要什么类型的导游服务？`,
        viewCount: 7654,
        helpfulCount: 567,
        createdAt: '2024-01-25',
      },
      {
        id: 'guide_002',
        category: 'guide',
        question: '导游服务包含什么',
        keywords: ['导游包含', '导游内容', '向导服务'],
        answer: `🗣️ <strong>导游服务内容</strong>

✅ <strong>标准服务</strong>
• 🎤 专业中文讲解
• 🏛️ 景点门票建议与规划
• 🍜 当地美食推荐
• 🛍️ 购物指南
• 📸 拍照点位推荐

✅ <strong>增值服务</strong>
• 🚗 包车服务（配司机）
• 🎫 景点门票代订（优惠价）
• 🏨 酒店推荐与预订
• ✈️ 接送机服务

⏰ <strong>服务时长</strong>
• 半日游：4小时
• 全日游：8小时
• 定制：按需安排

💡 <strong>我们的优势</strong>
• 严格筛选的持证导游
• 丰富的当地生活经验
• 24小时行程支持
• 先行赔付保障

您对导游服务还有什么疑问吗？`,
        viewCount: 5432,
        helpfulCount: 432,
        createdAt: '2024-02-01',
      },

      // 预订问题类
      {
        id: 'book_001',
        category: 'booking',
        question: '如何预订酒店',
        keywords: ['预订酒店', '订房', '酒店预约'],
        answer: `🏨 <strong>酒店预订指南</strong>

📱 <strong>预订方式</strong>
1. 告诉顾问您的需求（目的地、日期、人数、预算）
2. 顾问为您推荐合适酒店
3. 确认后完成预订
4. 收到确认函出发

💰 <strong>支付方式</strong>
• 支持支付宝、微信、银行卡
• 部分酒店到店支付

📋 <strong>预订信息</strong>
• 目的地
• 入住/退房日期
• 房间数量
• 入住人姓名
• 特殊要求（无烟房、高楼层等）

✅ <strong>取消政策</strong>
• 预订时可见具体政策
• 免费取消期内可全额退款
• 超时按酒店规定执行

请告诉我您的出行计划，我为您推荐合适的酒店！`,
        viewCount: 9876,
        helpfulCount: 765,
        createdAt: '2024-01-18',
      },
      {
        id: 'book_002',
        category: 'booking',
        question: '景点门票怎么买',
        keywords: ['景点门票', '买票', '门票预订'],
        answer: `🎫 <strong>景点门票预订</strong>

🌟 <strong>为什么选择我们预订？</strong>
• 💰 比现场便宜 5-30%
• ⏰ 免排队，直接入园
• 📱 手机出示即可入园
• 🕐 部分可随时退改

🎢 <strong>热门景点推荐</strong>

🇯🇵 <strong>日本</strong>
• 东京迪士尼乐园/海洋
• 大阪环球影城 USJ
• 京都伏见稻荷

🇹🇭 <strong>泰国</strong>
• 大皇宫
• 真理寺
• 珊瑚岛一日游

🇪🇺 <strong>欧洲</strong>
• 卢浮宫
• 埃菲尔铁塔
• 罗马斗兽场

📋 <strong>预订信息</strong>
• 景点名称
• 游玩日期
• 人数
• 票种（成人票/儿童票/老人票）

请告诉我您想去哪个景点？`,
        viewCount: 8765,
        helpfulCount: 678,
        createdAt: '2024-02-05',
      },

      // 支付问题类
      {
        id: 'pay_001',
        category: 'payment',
        question: '支持哪些支付方式',
        keywords: ['支付方式', '怎么付款', '微信支付', '支付宝'],
        answer: `💳 <strong>支持的支付方式</strong>

✅ <strong>线上支付</strong>
• 💚 微信支付
• 💙 支付宝
• 💳 银行卡（借记卡/信用卡）
• 📱 Apple Pay / Google Pay

✅ <strong>支付流程</strong>
1. 选择服务，确认订单
2. 选择支付方式
3. 完成支付
4. 收到确认通知

💡 <strong>支付安全</strong>
• 平台全程加密保护
• 不存储银行卡信息
• 72小时退款保障

有任何支付问题可以联系客服~`,
        viewCount: 6543,
        helpfulCount: 543,
        createdAt: '2024-01-22',
      },

      // 退款售后类
      {
        id: 'refund_001',
        category: 'refund',
        question: '如何申请退款',
        keywords: ['退款', '取消订单', '退钱'],
        answer: `💰 <strong>退款政策说明</strong>

📋 <strong>退款类型</strong>

🎫 <strong>景点门票</strong>
• 使用日期前24小时：全额退款
• 使用日期前24小时内：不可退款
• 部分特殊票种以详情为准

🏨 <strong>酒店预订</strong>
• 免费取消期内：全额退款
• 超过免费取消期：按酒店政策退款
• 预订成功后联系顾问处理

🗣️ <strong>导游服务</strong>
• 服务开始前48小时：全额退款
• 服务开始前24-48小时：退还50%
• 服务开始前24小时内：不可退款

📝 <strong>退款流程</strong>
1. 登录账号 → 我的订单
2. 选择需要退款的订单
3. 点击"申请退款"
4. 等待审核（1-3个工作日）
5. 退款原路返回

💡 <strong>特殊情况</strong>
• 航班取消、恶劣天气等不可抗力可全额退款
• 服务不满意可申请部分退款

请告诉我您的具体订单情况~`,
        viewCount: 7654,
        helpfulCount: 612,
        createdAt: '2024-02-08',
      },

      // 账户问题类
      {
        id: 'account_001',
        category: 'account',
        question: '如何修改密码',
        keywords: ['修改密码', '忘记密码', '密码找回', '登录问题'],
        answer: `👤 <strong>账户问题解决方案</strong>

🔑 <strong>忘记密码</strong>
1. 登录页面点击"忘记密码"
2. 输入注册手机号/邮箱
3. 收到验证码
4. 设置新密码

🔒 <strong>修改密码</strong>
1. 登录账号
2. 进入"我的" → "设置"
3. 点击"修改密码"
4. 输入原密码和新密码
5. 确认修改

📱 <strong>手机号更换</strong>
• 联系客服协助修改
• 需要验证身份信息

💡 <strong>登录常见问题</strong>
• 验证码收不到：检查短信拦截
• 账号被锁定：24小时后自动解锁或联系客服
• 异地登录：点击"这不是我"并修改密码

还有疑问可以联系人工客服~`,
        viewCount: 4321,
        helpfulCount: 321,
        createdAt: '2024-01-28',
      },
    ],

    // 智能推荐数据
    recommendations: {
      '日本': {
        guides: [
          { id: 'g001', name: '小林导游', rating: 4.9, specialties: ['东京深度游', '美食探索'], price: 800 },
          { id: 'g002', name: '田中向导', rating: 4.8, specialties: ['京都文化', '寺庙游览'], price: 700 },
        ],
        routes: [
          { id: 'r001', name: '关西7日精华游', highlights: ['大阪', '京都', '奈良'], price: 12000 },
          { id: 'r002', name: '东京5日自由行', highlights: ['东京', '富士山', '镰仓'], price: 8000 },
        ],
        tips: [
          'JR Pass通票适合跨城市出行',
          '西瓜卡可用于大部分公共交通和便利店',
          '樱花季需提前3个月预订酒店',
        ],
      },
      '泰国': {
        guides: [
          { id: 'g003', name: '阿伟导游', rating: 4.9, specialties: ['曼谷美食', '夜市攻略'], price: 500 },
          { id: 'g004', name: '阿月向导', rating: 4.7, specialties: ['海岛游', '潜水'], price: 600 },
        ],
        routes: [
          { id: 'r003', name: '泰北清迈5日游', highlights: ['清迈古城', '双龙寺', '夜间动物园'], price: 5000 },
          { id: 'r004', name: '曼谷+芭提雅6日', highlights: ['大皇宫', '四面佛', '海岛'], price: 6000 },
        ],
        tips: [
          '曼谷堵车严重，建议错峰出行',
          '嘟嘟车记得砍价',
          '寺庙需穿长裤长袖',
        ],
      },
      '欧洲': {
        guides: [
          { id: 'g005', name: 'Marco', rating: 4.9, specialties: ['法意瑞', '艺术讲解'], price: 1500 },
          { id: 'g006', name: 'Sophie', rating: 4.8, specialties: ['法国文化', '美食之旅'], price: 1400 },
        ],
        routes: [
          { id: 'r005', name: '法意瑞12日经典', highlights: ['巴黎', '罗马', '瑞士雪山'], price: 25000 },
          { id: 'r006', name: '西班牙10日深度', highlights: ['巴塞罗那', '马德里', '塞维利亚'], price: 18000 },
        ],
        tips: [
          '申根签证可访问27国',
          '欧铁通票适合多国游',
          '防盗是欧洲旅行重中之重',
        ],
      },
    },
  };

  // 搜索索引（用于快速匹配）
  let searchIndex = buildSearchIndex();

  /**
   * 构建搜索索引
   */
  function buildSearchIndex() {
    const index = new Map();
    
    knowledgeData.faqs.forEach(faq => {
      // 按关键词索引
      faq.keywords.forEach(keyword => {
        if (!index.has(keyword)) {
          index.set(keyword, []);
        }
        index.get(keyword).push(faq.id);
      });
      
      // 按问题索引
      const words = faq.question.split('');
      words.forEach(word => {
        if (!index.has(word)) {
          index.set(word, []);
        }
        if (!index.get(word).includes(faq.id)) {
          index.get(word).push(faq.id);
        }
      });
    });
    
    return index;
  }

  /**
   * 搜索FAQ
   */
  function search(query, limit = 5) {
    if (!query) return [];
    
    const normalizedQuery = query.toLowerCase();
    const results = new Map();
    
    // 关键词匹配
    searchIndex.forEach((faqIds, keyword) => {
      if (normalizedQuery.includes(keyword) || keyword.includes(normalizedQuery)) {
        faqIds.forEach(id => {
          const faq = getFAQById(id);
          if (faq) {
            const score = keyword.length / Math.max(normalizedQuery.length, keyword.length);
            results.set(id, { faq, score: score + (results.get(id)?.score || 0) });
          }
        });
      }
    });
    
    // 全文搜索
    knowledgeData.faqs.forEach(faq => {
      if (faq.question.toLowerCase().includes(normalizedQuery) || 
          faq.answer.toLowerCase().includes(normalizedQuery)) {
        if (results.has(faq.id)) {
          results.get(faq.id).score += 0.5;
        } else {
          results.set(faq.id, { faq, score: 0.5 });
        }
      }
    });
    
    // 排序并返回
    return Array.from(results.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.faq);
  }

  /**
   * 根据ID获取FAQ
   */
  function getFAQById(id) {
    return knowledgeData.faqs.find(faq => faq.id === id);
  }

  /**
   * 按分类获取FAQ
   */
  function getFAQsByCategory(category) {
    return knowledgeData.faqs.filter(faq => faq.category === category);
  }

  /**
   * 获取分类信息
   */
  function getCategories() {
    return knowledgeData.categories;
  }

  /**
   * 获取推荐内容
   */
  function getRecommendations(destination) {
    return knowledgeData.recommendations[destination] || null;
  }

  /**
   * 获取热门FAQ
   */
  function getHotFAQs(limit = 10) {
    return [...knowledgeData.faqs]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  }

  /**
   * 标记FAQ为有用
   */
  function markFAQHelpful(id) {
    const faq = getFAQById(id);
    if (faq) {
      faq.helpfulCount++;
      return true;
    }
    return false;
  }

  /**
   * 记录FAQ查看
   */
  function recordFAQView(id) {
    const faq = getFAQById(id);
    if (faq) {
      faq.viewCount++;
      return true;
    }
    return false;
  }

  /**
   * 智能问答匹配
   */
  function smartMatch(query, context = {}) {
    // 先搜索相关FAQ
    const searchResults = search(query, 3);
    
    if (searchResults.length > 0) {
      return {
        type: 'faq',
        data: searchResults[0],
        alternatives: searchResults.slice(1),
      };
    }
    
    // 意图匹配
    const intent = AIAssistant?.understand?.(query);
    if (intent?.intent) {
      return {
        type: 'intent',
        intent: intent.intent,
        entities: intent.entities,
      };
    }
    
    return null;
  }

  /**
   * 添加新FAQ（用于自动学习）
   */
  function addFAQ(faq) {
    const id = 'faq_' + Date.now();
    const newFAQ = {
      id,
      ...faq,
      viewCount: 0,
      helpfulCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    knowledgeData.faqs.push(newFAQ);
    
    // 更新索引
    newFAQ.keywords.forEach(keyword => {
      if (!searchIndex.has(keyword)) {
        searchIndex.set(keyword, []);
      }
      searchIndex.get(keyword).push(id);
    });
    
    return newFAQ;
  }

  /**
   * 更新FAQ
   */
  function updateFAQ(id, updates) {
    const index = knowledgeData.faqs.findIndex(faq => faq.id === id);
    if (index !== -1) {
      knowledgeData.faqs[index] = { ...knowledgeData.faqs[index], ...updates };
      return knowledgeData.faqs[index];
    }
    return null;
  }

  /**
   * 删除FAQ
   */
  function deleteFAQ(id) {
    const index = knowledgeData.faqs.findIndex(faq => faq.id === id);
    if (index !== -1) {
      knowledgeData.faqs.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 导出知识库数据
   */
  function exportData() {
    return JSON.stringify(knowledgeData, null, 2);
  }

  /**
   * 导入知识库数据
   */
  function importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      knowledgeData = { ...knowledgeData, ...data };
      searchIndex = buildSearchIndex();
      return true;
    } catch (e) {
      console.error('导入知识库失败:', e);
      return false;
    }
  }

  /**
   * 获取知识库统计
   */
  function getStats() {
    return {
      totalFAQs: knowledgeData.faqs.length,
      totalCategories: Object.keys(knowledgeData.categories).length,
      totalViews: knowledgeData.faqs.reduce((sum, faq) => sum + faq.viewCount, 0),
      totalHelpful: knowledgeData.faqs.reduce((sum, faq) => sum + faq.helpfulCount, 0),
      categoryStats: Object.entries(knowledgeData.categories).map(([key, cat]) => ({
        ...cat,
        key,
        count: knowledgeData.faqs.filter(faq => faq.category === key).length,
      })),
    };
  }

  // 公开API
  return {
    search,
    getFAQById,
    getFAQsByCategory,
    getCategories,
    getRecommendations,
    getHotFAQs,
    markFAQHelpful,
    recordFAQView,
    smartMatch,
    addFAQ,
    updateFAQ,
    deleteFAQ,
    exportData,
    importData,
    getStats,
    getAllFAQs: () => knowledgeData.faqs,
  };
})();
