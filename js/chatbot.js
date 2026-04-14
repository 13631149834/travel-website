// ===== 智能客服JS专业版 =====

let chatbotOpen = false;

function toggleChatbot() {
  const popup = document.getElementById('chatbotPopup');
  if (popup) {
    popup.classList.toggle('open');
    chatbotOpen = popup.classList.contains('open');
    if (chatbotOpen && !popup.dataset.init) {
      showWelcomeMessage();
      popup.dataset.init = 'true';
      showQuickReplies();
    }
  }
}

function closeChatbot() {
  const popup = document.getElementById('chatbotPopup');
  if (popup) {
    popup.classList.remove('open');
    chatbotOpen = false;
  }
}

function openChatbot() {
  const popup = document.getElementById('chatbotPopup');
  if (popup && !popup.classList.contains('open')) {
    popup.classList.add('open');
    chatbotOpen = true;
    if (!popup.dataset.init) {
      showWelcomeMessage();
      popup.dataset.init = 'true';
      showQuickReplies();
    }
  }
}

function showWelcomeMessage() {
  const body = document.getElementById('chatbotBody');
  if (!body) return;
  body.innerHTML = `
    <div class="msg msg-bot"><p>👋 您好！我是游导旅游智能助手</p></div>
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
  body.scrollTop = body.scrollHeight;
}

// 快捷回复按钮
function showQuickReplies() {
  const container = document.getElementById('quickReplies');
  if (!container) return;
  container.innerHTML = `
    <div class="quick-btn" onclick="quickReply('日本旅游攻略')">🇯🇵 日本</div>
    <div class="quick-btn" onclick="quickReply('泰国旅游攻略')">🇹🇭 泰国</div>
    <div class="quick-btn" onclick="quickReply('欧洲旅游攻略')">🇪🇺 欧洲</div>
    <div class="quick-btn" onclick="quickReply('签证办理')">📋 签证</div>
    <div class="quick-btn" onclick="quickReply('联系顾问')">📞 人工</div>
  `;
}

function quickReply(message) {
  const input = document.getElementById('chatbotInput');
  if (input) { input.value = message; sendMessage(); }
}

function sendMessage() {
  const input = document.getElementById('chatbotInput');
  const body = document.getElementById('chatbotBody');
  if (!input || !body) return;
  const message = input.value.trim();
  if (!message) return;
  addMessage('user', message);
  input.value = '';
  setTimeout(() => {
    addMessage('bot', getBotReply(message));
    showQuickReplies();
  }, 500);
}

function addMessage(type, content) {
  const body = document.getElementById('chatbotBody');
  if (!body) return;
  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg msg-' + type;
  msgDiv.innerHTML = '<p>' + content.replace(/\n/g, '<br>') + '</p>';
  body.appendChild(msgDiv);
  body.scrollTop = body.scrollHeight;
}

function handleEnter(event) {
  if (event.key === 'Enter') { event.preventDefault(); sendMessage(); }
}

// 联系顾问卡片
const wechatCard = `<div style="margin-top:12px;padding:12px;background:#f0f9f4;border-radius:8px;text-align:center">
  <p style="margin-bottom:8px;color:#333">💬 需要专业顾问一对一服务？</p>
  <a href="wechat-contact.html" style="display:inline-block;padding:10px 20px;background:#07c160;color:#fff;border-radius:6px;font-weight:600;text-decoration:none">添加微信咨询</a>
</div>`;

// 知识库
const knowledge = {
  // 日本旅游
  japan: {
    title: '🇯🇵 日本旅游全攻略',
    content: `<strong>【最佳旅游时间】</strong><br>
• 春季（3-5月）：樱花季，气温舒适，需提前预订<br>
• 夏季（6-8月）：祭典多，注意梅雨季<br>
• 秋季（9-11月）：红叶季，气候宜人<br>
• 冬季（12-2月）：滑雪温泉，北海道最佳<br><br>
<strong>【必去景点】</strong><br>
• 东京：浅草寺、东京塔、秋叶原、银座<br>
• 京都：清水寺、伏见稻荷、金阁寺、祇园<br>
• 大阪：道顿堀、大阪城、环球影城<br>
• 北海道：小樽运河、富良野花田、温泉<br><br>
<strong>【签证信息】</strong><br>
• 单次签证：有效期90天，停留15/30天<br>
• 三年多次：首次需在冲绳或东北六县住宿<br>
• 五年多次：年收入50万以上<br>
• 办理周期：7-10个工作日<br><br>
<strong>【实用贴士】</strong><br>
• 交通：JR Pass适合跨城市，市内用西瓜卡<br>
• 语言：基本英语可沟通，下载翻译App<br>
• 支付：现金为主，大型商场可用支付宝<br>
${wechatCard}`
  },
  
  // 泰国旅游
  thailand: {
    title: '🇹🇭 泰国旅游全攻略',
    content: `<strong>【最佳旅游时间】</strong><br>
• 11月-2月：凉季，气温舒适，最佳旅游季<br>
• 3-5月：热季，气温可达40°C<br>
• 6-10月：雨季，价格便宜，人少<br><br>
<strong>【热门目的地】</strong><br>
• 曼谷：大皇宫、卧佛寺、考山路、暹罗广场<br>
• 清迈：古城、双龙寺、夜市、大象营<br>
• 普吉岛：海滩、潜水、夜生活<br>
• 苏梅岛：宁静海滩、满月派对<br><br>
<strong>【签证信息】</strong><br>
• 🎉 好消息：泰国对中国游客免签！<br>
• 停留期：最多30天<br>
• 需携带：护照（有效期6个月以上）、往返机票<br><br>
<strong>【实用贴士】</strong><br>
• 交通：突突车要砍价，Grab打车方便<br>
• 饮食：注意路边摊卫生，不吃生食<br>
• 宗教：寺庙需穿长裤长袖，脱鞋<br>
• 安全：远离赌博、大麻相关场所<br>
${wechatCard}`
  },
  
  // 欧洲旅游
  europe: {
    title: '🇪🇺 欧洲旅游全攻略',
    content: `<strong>【申根签证说明】</strong><br>
• 覆盖国家：法、德、意、瑞等27国<br>
• 有效期：通常90天内<br>
• 办理周期：10-15个工作日<br>
• 需准备：银行流水、行程单、酒店预订单<br><br>
<strong>【热门目的地】</strong><br>
• 法国：巴黎埃菲尔铁塔、卢浮宫、普罗旺斯<br>
• 意大利：罗马斗兽场、威尼斯、佛罗伦萨<br>
• 瑞士：少女峰、日内瓦湖、因特拉肯<br>
• 西班牙：巴塞罗那、马德里、塞维利亚<br><br>
<strong>【行程建议】</strong><br>
• 首次欧洲：法瑞意连线 12-15天<br>
• 蜜月之旅：巴黎+瑞士+意大利<br>
• 深度游：单国深度 10-14天<br><br>
<strong>【实用贴士】</strong><br>
• 安全：注意小偷，护照分开放<br>
• 交通：欧铁通票适合多国游<br>
• 语言：英语基本通用<br>
${wechatCard}`
  },
  
  // 澳新旅游
  australia: {
    title: '🇦🇺 澳大利亚新西兰旅游攻略',
    content: `<strong>【最佳旅游时间】</strong><br>
• 9-11月：春季，气候宜人<br>
• 12-2月：夏季，海滩最佳<br>
• 3-5月：秋季，赏枫叶<br>
• 6-8月：冬季，滑雪季<br><br>
<strong>【澳大利亚必去】</strong><br>
• 悉尼：歌剧院、海港大桥、邦迪海滩<br>
• 墨尔本：大洋路、企鹅岛、涂鸦巷<br>
• 凯恩斯：大堡礁、热带雨林<br>
• 黄金海岸：冲浪者天堂、主题公园<br><br>
<strong>【新西兰必去】</strong><br>
• 奥克兰：天空塔、火山徒步<br>
• 皇后镇：蹦极、滑雪、米尔福德峡湾<br>
• 霍比屯：指环王拍摄地<br><br>
<strong>【签证信息】</strong><br>
• 澳大利亚：电子签，办理周期15-20天<br>
• 新西兰：电子签，办理周期10-15天<br>
${wechatCard}`
  },
  
  // 美国旅游
  usa: {
    title: '🇺🇸 美国旅游全攻略',
    content: `<strong>【签证信息】</strong><br>
• 类型：B1/B2旅游签证<br>
• 有效期：10年多次往返<br>
• 费用：185美元<br>
• 办理流程：填表→预约→面签→等待<br><br>
<strong>【热门目的地】</strong><br>
• 西海岸：洛杉矶、旧金山、拉斯维加斯、大峡谷<br>
• 东海岸：纽约、华盛顿、波士顿、迈阿密<br>
• 国家公园：黄石、优胜美地、大峡谷<br>
• 夏威夷：海滩、火山、珍珠港<br><br>
<strong>【行程建议】</strong><br>
• 西海岸自驾：14-18天<br>
• 东海岸城市游：10-14天<br>
• 国家公园深度：14-21天<br><br>
<strong>【实用贴士】</strong><br>
• 自驾：需国际驾照，注意交规<br>
• 小费：餐厅15-20%，酒店1-2美元/晚<br>
• 安全：避免夜间独自行走<br>
${wechatCard}`
  },
  
  // 迪拜旅游
  dubai: {
    title: '🇦🇪 迪拜旅游全攻略',
    content: `<strong>【最佳旅游时间】</strong><br>
• 11月-3月：冬季，气温舒适<br>
• 4-10月：夏季，炎热但价格便宜<br><br>
<strong>【必去景点】</strong><br>
• 哈利法塔：世界最高建筑，观景台<br>
• 迪拜购物中心：全球最大购物中心<br>
• 棕榈岛：亚特兰蒂斯酒店、海滩<br>
• 沙漠冲沙：越野车、骆驼、日落<br><br>
<strong>【签证信息】</strong><br>
• 阿联酋对中国游客免签<br>
• 停留期：30天，可续签<br><br>
<strong>【实用贴士】</strong><br>
• 着装：尊重当地文化，避免过于暴露<br>
• 饮食：清真餐厅，禁酒（酒店除外）<br>
• 购物：免税购物天堂<br>
${wechatCard}`
  }
};

// 签证知识库
const visaInfo = {
  japan: `<strong>🇯🇵 日本签证详情</strong><br><br>
<strong>【签证类型】</strong><br>
• 单次签证：有效期90天，停留15/30天<br>
• 三年多次：有效期3年，停留30天<br>
• 五年多次：有效期5年，停留90天<br><br>
<strong>【所需材料】</strong><br>
• 护照原件（有效期6个月以上）<br>
• 2寸白底照片2张<br>
• 身份证、户口本复印件<br>
• 在职证明或营业执照副本<br>
• 银行流水（余额10万以上）<br>
• 行程单、酒店预订单<br><br>
<strong>【费用参考】</strong><br>
• 单次：300-500元<br>
• 三年多次：600-800元<br>
• 五年多次：1000-1500元<br><br>
<strong>【办理周期】</strong><br>7-10个工作日<br>
${wechatCard}`,
  
  schengen: `<strong>🇪🇺 申根签证详情</strong><br><br>
<strong>【覆盖国家】</strong><br>法国、德国、意大利、瑞士、西班牙、荷兰、比利时等27国<br><br>
<strong>【签证类型】</strong><br>
• 短期签证：停留90天内<br>
• 有效期：根据行程给，最长5年多次<br><br>
<strong>【所需材料】</strong><br>
• 护照原件（有效期6个月以上）<br>
• 2寸白底照片2张<br>
• 在职证明（中英文）<br>
• 银行流水（余额3-5万以上）<br>
• 行程单、机票预订单、酒店预订单<br>
• 保险（保额3万欧元以上）<br><br>
<strong>【费用参考】</strong><br>
• 签证费：约650元<br>
• 服务费：300-500元<br><br>
<strong>【办理周期】</strong><br>10-15个工作日<br>
${wechatCard}`,
  
  usa: `<strong>🇺🇸 美国签证详情</strong><br><br>
<strong>【签证类型】</strong><br>B1/B2旅游商务签证，有效期10年<br><br>
<strong>【申请流程】</strong><br>
1. 在线填写DS-160表格<br>
2. 缴纳签证费185美元<br>
3. 预约面签时间<br>
4. 准备材料去大使馆面签<br>
5. 等待签证（通常5-7个工作日）<br><br>
<strong>【面签建议】</strong><br>
• 诚实回答，不要紧张<br>
• 准备好行程、工作、资产证明<br>
• 表明会按时回国<br><br>
<strong>【通过率】</strong><br>首次申请约70-80%，有出国记录更高<br>
${wechatCard}`,
  
  korea: `<strong>🇰🇷 韩国签证详情</strong><br><br>
<strong>【签证类型】</strong><br>
• 单次签证：有效期90天，停留90天<br>
• 五年多次：有效期5年，每次停留90天<br>
• 十年多次：有效期10年（需满足特定条件）<br><br>
<strong>【简化政策】</strong><br>北京、上海户籍可简化材料<br><br>
<strong>【费用参考】</strong><br>
• 单次：280元<br>
• 五年多次：560元<br><br>
<strong>【办理周期】</strong><br>5-7个工作日<br>
${wechatCard}`
};

// 避坑指南
const pitfallGuide = {
  general: `<strong>⚠️ 旅行避坑指南</strong><br><br>
<strong>【交通避坑】</strong><br>
• 出租车：上车前确认打表或谈好价格<br>
• 租车：检查车况，拍照留证，了解保险<br>
• 网约车：用正规平台，核对车牌号<br><br>
<strong>【购物避坑】</strong><br>
• 景区商品价格虚高，货比三家<br>
• 免税店也要看价格，不一定便宜<br>
• 保留小票，有问题可维权<br><br>
<strong>【餐饮避坑】</strong><br>
• 避开景区餐厅，找本地人光顾的店<br>
• 看清菜单价格，确认是否含服务费<br>
• 海鲜注意新鲜度，避免肠胃问题<br><br>
<strong>【低价团陷阱】</strong><br>
• 明显低于市场价的团必有购物<br>
• 签订正规合同，保留证据<br>
• 遇到强制购物可投诉<br><br>
<a href="guide-content.html" style="color:#667eea">📋 查看完整避坑指南</a><br>
${wechatCard}`,
  
  japan: `<strong>🇯🇵 日本旅行避坑</strong><br><br>
<strong>【交通】</strong><br>
• JR Pass不是万能的，市区用西瓜卡更划算<br>
• 出租车起步价约40元，能坐地铁就别打车<br>
• 西瓜卡余额不退，用完再回国<br><br>
<strong>【购物】</strong><br>
• 药妆店价格差异大，多对比<br>
• 免税品有携带时限，保存好小票<br>
• 电子产品注意电压和保修<br><br>
<strong>【餐饮】</strong><br>
• 餐厅需要等位，高峰期早点去<br>
• 居酒屋有座席费，点餐前问清楚<br><br>
${wechatCard}`,
  
  thailand: `<strong>🇹🇭 泰国旅行避坑</strong><br><br>
<strong>【交通】</strong><br>
• 突突车、出租车一定要砍价<br>
• 租摩托车注意押金，还车时验车<br>
• 国际驾照才能合法驾驶<br><br>
<strong>【安全】</strong><br>
• 尊重皇室，议论王室违法<br>
• 寺庙注意着装，不露肩露膝<br>
• 海鲜市场注意掉包，当面称重<br>
• 远离赌博、大麻相关场所<br><br>
<strong>【消费】</strong><br>
• 小费给纸币，硬币是给乞丐的<br>
• 夜市砍价可砍到1/3<br>
${wechatCard}`
};

// 智能回复函数
function getBotReply(message) {
  const msg = message.toLowerCase();
  
  // === 国家/地区攻略 ===
  if (msg.includes('日本攻略') || msg.includes('日本旅游') || (msg.includes('日本') && (msg.includes('攻略') || msg.includes('介绍') || msg.includes('怎么玩')))) {
    return knowledge.japan.content;
  }
  
  if (msg.includes('泰国攻略') || msg.includes('泰国旅游') || (msg.includes('泰国') && (msg.includes('攻略') || msg.includes('介绍') || msg.includes('怎么玩')))) {
    return knowledge.thailand.content;
  }
  
  if (msg.includes('欧洲攻略') || msg.includes('欧洲旅游') || msg.includes('申根') && msg.includes('攻略')) {
    return knowledge.europe.content;
  }
  
  if (msg.includes('澳大利亚') || msg.includes('澳洲') || msg.includes('新西兰') || msg.includes('澳新')) {
    return knowledge.australia.content;
  }
  
  if (msg.includes('美国攻略') || msg.includes('美国旅游') || msg.includes('美签')) {
    return knowledge.usa.content;
  }
  
  if (msg.includes('迪拜') || msg.includes('阿联酋')) {
    return knowledge.dubai.content;
  }
  
  // === 签证咨询 ===
  if (msg.includes('签证')) {
    if (msg.includes('日本签证') || (msg.includes('日本') && msg.includes('签'))) {
      return visaInfo.japan;
    }
    if (msg.includes('申根') || msg.includes('欧洲签证') || msg.includes('欧洲签')) {
      return visaInfo.schengen;
    }
    if (msg.includes('美国签证') || msg.includes('美签')) {
      return visaInfo.usa;
    }
    if (msg.includes('韩国签证') || msg.includes('韩国签')) {
      return visaInfo.korea;
    }
    if (msg.includes('泰国签证') || msg.includes('泰国签')) {
      return `🇹🇭 <strong>泰国签证信息</strong><br><br>🎉 <strong>好消息！泰国对中国游客免签！</strong><br><br>• 停留期：最多30天<br>• 需携带：护照（有效期6个月以上）、往返机票<br>• 无需提前申请签证<br><br>${wechatCard}`;
    }
    
    return `<strong>📋 签证咨询</strong><br><br>请告诉我想去哪个国家，我提供详细签证攻略：<br><br>
    🇯🇵 日本签证 - 单次/三年/五年多次<br>
    🇪🇺 申根签证 - 27国通用<br>
    🇺🇸 美国签证 - 10年多次<br>
    🇰🇷 韩国签证 - 五年多次<br>
    🇹🇭 泰国签证 - 免签！<br>
    🇦🇺 澳新签证 - 电子签<br><br>
    ${wechatCard}`;
  }
  
  // === 避坑指南 ===
  if (msg.includes('避坑') || msg.includes('坑') || msg.includes('陷阱') || msg.includes('被骗') || msg.includes('骗')) {
    if (msg.includes('日本')) return pitfallGuide.japan;
    if (msg.includes('泰国')) return pitfallGuide.thailand;
    return pitfallGuide.general;
  }
  
  // === 导游服务 ===
  if (msg.includes('导游') || msg.includes('导览') || msg.includes('讲解')) {
    return `<strong>🎤 导游服务</strong><br><br>
    我们平台有认证导游为您提供专业服务！<br><br>
    <strong>【导游服务内容】</strong><br>
    • 景点讲解、历史文化介绍<br>
    • 行程规划、餐厅推荐<br>
    • 购物建议、避坑指南<br>
    • 紧急情况协助<br><br>
    <a href="guides.html" style="color:#667eea">👉 浏览导游列表</a><br><br>
    ${wechatCard}`;
  }
  
  // === 行程规划 ===
  if (msg.includes('行程') || msg.includes('路线') || msg.includes('规划') || msg.includes('攻略')) {
    return `<strong>🗺️ 行程规划服务</strong><br><br>
    <strong>【精品线路推荐】</strong><br>
    🇯🇵 日本东京-京都-大阪 7日游<br>
    🇹🇭 曼谷-清迈-普吉 8日游<br>
    🇪🇺 法瑞意三国 12日深度游<br>
    🇦🇺 悉尼-墨尔本-凯恩斯 10日游<br><br>
    <a href="routes.html" style="color:#667eea">👉 查看更多线路</a><br><br>
    <strong>需要定制专属行程？</strong><br>
    ${wechatCard}`;
  }
  
  // === 价格咨询 ===
  if (msg.includes('价格') || msg.includes('费用') || msg.includes('多少钱') || msg.includes('报价') || msg.includes('预算')) {
    return `<strong>💰 价格咨询</strong><br><br>
    旅游价格取决于以下因素：<br><br>
    <strong>【影响价格的因素】</strong><br>
    • 目的地：欧美较贵，东南亚较便宜<br>
    • 天数：行程越长费用越高<br>
    • 季节：旺季（寒暑假、节假日）价格上浮20-50%<br>
    • 住宿：五星酒店vs经济型酒店<br>
    • 服务：跟团游vs定制游vs自由行<br><br>
    <strong>【参考价格】</strong><br>
    🇯🇵 日本7日：8000-15000元<br>
    🇹🇭 泰国6日：4000-8000元<br>
    🇪🇺 欧洲12日：15000-30000元<br><br>
    <a href="routes.html" style="color:#667eea">👉 查看线路报价</a><br><br>
    需要精准报价？${wechatCard}`;
  }
  
  // === 美食推荐 ===
  if (msg.includes('美食') || msg.includes('吃') || msg.includes('餐厅') || msg.includes('好吃的')) {
    return `<strong>🍜 美食推荐</strong><br><br>
    告诉我想去哪个国家，我推荐当地必吃美食！<br><br>
    <strong>【热门目的地美食】</strong><br>
    🇯🇵 日本：寿司、拉面、和牛、居酒屋<br>
    🇹🇭 泰国：冬阴功、芒果饭、泰式烧烤<br>
    🇫🇷 法国：法餐、红酒、马卡龙<br>
    🇮🇹 意大利：披萨、意面、冰淇淋<br><br>
    ${wechatCard}`;
  }
  
  // === 购物指南 ===
  if (msg.includes('购物') || msg.includes('买') || msg.includes('免税店') || msg.includes('逛街')) {
    return `<strong>🛍️ 购物指南</strong><br><br>
    <strong>【热门购物目的地】</strong><br>
    🇯🇵 日本：药妆、电子产品、动漫周边<br>
    🇹🇭 泰国：乳胶枕、特产、夜市<br>
    🇫🇷 法国：奢侈品、香水、红酒<br>
    🇦🇪 迪拜：黄金、奢侈品、免税品<br><br>
    <strong>【省钱技巧】</strong><br>
    • 免税店不一定最便宜，对比价格<br>
    • 关注退税政策，能省5-15%<br>
    • 避开景区商店，去当地人光顾的地方<br><br>
    ${wechatCard}`;
  }
  
  // === 交通出行 ===
  if (msg.includes('交通') || msg.includes('机票') || msg.includes('航班') || msg.includes('怎么去')) {
    return `<strong>✈️ 交通出行</strong><br><br>
    <strong>【机票预订建议】</strong><br>
    • 提前1-2个月预订价格最优<br>
    • 避开节假日高峰期<br>
    • 关注航司促销活动<br><br>
    <strong>【当地交通】</strong><br>
    • 日本：JR Pass + 西瓜卡<br>
    • 泰国：Grab打车 + 突突车<br>
    • 欧洲：欧铁通票 + 地铁<br><br>
    需要具体目的地交通攻略？直接问我！<br><br>
    ${wechatCard}`;
  }
  
  // === 酒店住宿 ===
  if (msg.includes('酒店') || msg.includes('住宿') || msg.includes('住哪里') || msg.includes('民宿')) {
    return `<strong>🏨 酒店住宿</strong><br><br>
    <strong>【预订建议】</strong><br>
    • 提前预订，旺季房源紧张<br>
    • 对比多个平台价格<br>
    • 看清取消政策<br>
    • 注意酒店位置和交通便利性<br><br>
    <strong>【住宿类型】</strong><br>
    • 酒店：服务好，价格较高<br>
    • 民宿：体验当地生活<br>
    • 青旅：经济实惠，适合背包客<br><br>
    ${wechatCard}`;
  }
  
  // === 天气/汇率 ===
  if (msg.includes('天气') || msg.includes('气温')) {
    return `🌤️ <strong>天气查询</strong><br><br>出发前建议查看当地天气预报：<br>• 日本：四季分明，春秋最舒适<br>• 泰国：常年炎热，注意防晒<br>• 欧洲：夏季凉爽，冬季寒冷<br><br><a href="tools.html" style="color:#667eea">🌤️ 使用天气查询工具</a>`;
  }
  
  if (msg.includes('汇率') || msg.includes('换钱') || msg.includes('货币')) {
    return `💱 <strong>汇率换算</strong><br><br>建议出发前关注汇率，适时换汇：<br>• 日元：1人民币≈20日元<br>• 泰铢：1人民币≈5泰铢<br>• 欧元：1人民币≈0.13欧元<br><br><a href="tools.html" style="color:#667eea">💱 使用汇率换算工具</a>`;
  }
  
  // === 联系顾问 ===
  if (msg.includes('联系') && (msg.includes('顾问') || msg.includes('人工') || msg.includes('客服') || msg.includes('微信'))) {
    return `<strong>📞 联系专业顾问</strong><br><br>
    <a href="wechat-contact.html" style="display:inline-block;padding:12px 24px;background:#07c160;color:#fff;border-radius:8px;font-weight:600;text-decoration:none">💬 添加微信咨询</a><br><br>
    <strong>【服务内容】</strong><br>
    ✅ 签证代办<br>
    ✅ 行程定制<br>
    ✅ 导游预约<br>
    ✅ 机票酒店预订<br><br>
    <strong>工作时间：</strong>周一至周五 9:00-18:00`;
  }
  
  // === 问候 ===
  if (msg.includes('你好') || msg.includes('您好') || msg.includes('在吗') || msg.includes('hi') || msg.includes('hello')) {
    return `😊 您好！我是游导旅游智能助手，很高兴为您服务！<br><br>我可以帮您解答：<br>
    📋 签证政策与办理<br>
    🗺️ 行程规划与景点攻略<br>
    🎤 导游推荐与服务<br>
    ✈️ 机票酒店建议<br>
    🍜 美食购物指南<br>
    ⚠️ 避坑安全提示<br><br>请直接告诉我您想去哪里或想了解什么？`;
  }
  
  if (msg.includes('谢谢') || msg.includes('感谢') || msg.includes('辛苦')) {
    return `😊 不客气！希望能帮到您！<br><br>祝您旅途愉快！🌍✈️<br><br>还有其他问题随时问我~`;
  }
  
  // === 国家简称 ===
  if (msg === '日本' || msg === '去日本') {
    return knowledge.japan.content;
  }
  if (msg === '泰国' || msg === '去泰国') {
    return knowledge.thailand.content;
  }
  if (msg === '欧洲' || msg === '去欧洲') {
    return knowledge.europe.content;
  }
  
  // === 默认回复 ===
  return `🤔 我理解您的需求。请告诉我更具体的信息，比如：<br><br>
  • 「日本旅游攻略」- 日本详细攻略<br>
  • 「签证」- 各国签证信息<br>
  • 「避坑指南」- 旅行注意事项<br>
  • 「导游」- 导游服务介绍<br>
  • 「行程规划」- 线路推荐<br>
  • 「联系顾问」- 人工服务<br><br>
  或者直接告诉我您想去哪个国家？🌍`;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.querySelector('.chatbot-input button');
  if (sendBtn) { sendBtn.addEventListener('click', sendMessage); }
});
