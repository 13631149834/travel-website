/**
 * 游导旅游智能客服 - 智能推荐模块
 * 功能：对话中推荐导游、路线、攻略
 */

const SmartRecommender = (function() {
  // 推荐数据
  const recommendationData = {
    // 热门目的地
    destinations: [
      { id: 'jp', name: '日本', emoji: '🇯🇵', tags: ['樱花', '温泉', '美食', '购物'], price: '8000-15000', days: '5-7天' },
      { id: 'th', name: '泰国', emoji: '🇹🇭', tags: ['海岛', '寺庙', '美食', '性价比'], price: '4000-8000', days: '5-7天' },
      { id: 'kr', name: '韩国', emoji: '🇰🇷', tags: ['购物', '美食', '韩流', '追星'], price: '3000-6000', days: '4-5天' },
      { id: 'eu', name: '欧洲', emoji: '🇪🇺', tags: ['艺术', '建筑', '浪漫', '多元文化'], price: '15000-30000', days: '10-15天' },
      { id: 'au', name: '澳大利亚', emoji: '🇦🇺', tags: ['自然', '海滩', '动物', '潜水'], price: '12000-20000', days: '7-10天' },
      { id: 'us', name: '美国', emoji: '🇺🇸', tags: ['都市', '自然景观', '主题公园', '购物'], price: '15000-25000', days: '10-15天' },
      { id: 'sg', name: '新加坡', emoji: '🇸🇬', tags: ['亲子', '美食', '现代化', '安全'], price: '5000-8000', days: '4-5天' },
      { id: 'ae', name: '阿联酋', emoji: '🇦🇪', tags: ['奢华', '购物', '沙漠', '建筑'], price: '10000-18000', days: '5-7天' },
    ],

    // 热门路线
    routes: [
      { id: 'r001', name: '日本关西精华7日游', destination: '日本', emoji: '🏯', highlights: ['大阪', '京都', '奈良'], price: 12800, days: 7 },
      { id: 'r002', name: '东京+富士山5日游', destination: '日本', emoji: '🗻', highlights: ['东京', '富士山', '镰仓'], price: 9800, days: 5 },
      { id: 'r003', name: '曼谷+清迈6日游', destination: '泰国', emoji: '🛕', highlights: ['曼谷', '清迈', '夜间动物园'], price: 5800, days: 6 },
      { id: 'r004', name: '普吉岛海岛5日游', destination: '泰国', emoji: '🏝️', highlights: ['普吉岛', '珊瑚岛', '皇帝岛'], price: 6500, days: 5 },
      { id: 'r005', name: '法意瑞12日经典', destination: '欧洲', emoji: '🗼', highlights: ['巴黎', '罗马', '瑞士雪山'], price: 26800, days: 12 },
      { id: 'r006', name: '巴厘岛蜜月5日', destination: '印度尼西亚', emoji: '🌺', highlights: ['情人崖', '乌布', '海神庙'], price: 7800, days: 5 },
      { id: 'r007', name: '迪拜奢华6日游', destination: '阿联酋', emoji: '🏙️', highlights: ['哈利法塔', '帆船酒店', '沙漠冲沙'], price: 15800, days: 6 },
    ],

    // 推荐导游
    guides: [
      { id: 'g001', name: '小林导游', avatar: '👨', destination: '日本', rating: 4.9, reviews: 328, specialties: ['东京深度游', '美食探索', '购物攻略'], languages: ['中文', '日语'], price: 800, available: true },
      { id: 'g002', name: '田中向导', avatar: '👩', destination: '日本', rating: 4.8, reviews: 256, specialties: ['京都文化', '寺庙游览', '和服体验'], languages: ['中文', '日语'], price: 700, available: true },
      { id: 'g003', name: '阿伟导游', avatar: '👨', destination: '泰国', rating: 4.9, reviews: 412, specialties: ['曼谷美食', '夜市攻略', '购物'], languages: ['中文', '泰语'], price: 500, available: true },
      { id: 'g004', name: '阿月向导', avatar: '👩', destination: '泰国', rating: 4.7, reviews: 289, specialties: ['海岛游', '潜水陪同', '亲子游'], languages: ['中文', '泰语'], price: 600, available: false },
      { id: 'g005', name: 'Marco', avatar: '👨‍🦱', destination: '欧洲', rating: 4.9, reviews: 198, specialties: ['法意瑞', '艺术讲解', '摄影'], languages: ['中文', '英语', '法语'], price: 1500, available: true },
      { id: 'g006', name: 'Sophie', avatar: '👩‍🦰', destination: '欧洲', rating: 4.8, reviews: 167, specialties: ['法国文化', '美食之旅', '酒庄'], languages: ['中文', '英语', '法语'], price: 1400, available: true },
    ],

    // 用户画像标签
    userTags: {
      budget: ['穷游', '经济', '舒适', '品质', '奢华'],
      travelStyle: ['打卡', '深度', '休闲', '探险', '亲子', '蜜月', '团建'],
      interests: ['美食', '购物', '摄影', '文化', '自然', '运动', '艺术'],
    },
  };

  // 用户上下文
  let userContext = {
    interests: [],
    budget: null,
    travelStyle: null,
    preferredDestinations: [],
    history: [],
  };

  /**
   * 分析用户输入，更新用户画像
   */
  function updateUserContext(input, entities = {}) {
    const normalizedInput = input.toLowerCase();

    // 识别预算关键词
    if (normalizedInput.includes('穷游') || normalizedInput.includes('省钱')) {
      userContext.budget = '穷游';
    } else if (normalizedInput.includes('奢华') || normalizedInput.includes('高端')) {
      userContext.budget = '奢华';
    } else if (normalizedInput.includes('经济') || normalizedInput.includes('实惠')) {
      userContext.budget = '经济';
    } else if (normalizedInput.includes('品质') || normalizedInput.includes('舒适')) {
      userContext.budget = '舒适';
    }

    // 识别旅行风格
    if (normalizedInput.includes('打卡') || normalizedInput.includes('必去')) {
      userContext.travelStyle = '打卡';
    } else if (normalizedInput.includes('深度') || normalizedInput.includes('慢慢玩')) {
      userContext.travelStyle = '深度';
    } else if (normalizedInput.includes('休闲') || normalizedInput.includes('放松')) {
      userContext.travelStyle = '休闲';
    } else if (normalizedInput.includes('探险') || normalizedInput.includes('刺激')) {
      userContext.travelStyle = '探险';
    } else if (normalizedInput.includes('亲子')) {
      userContext.travelStyle = '亲子';
    } else if (normalizedInput.includes('蜜月')) {
      userContext.travelStyle = '蜜月';
    }

    // 识别兴趣
    const interestKeywords = {
      '美食': ['好吃', '美食', '餐厅', '吃'],
      '购物': ['购物', '买', '逛街'],
      '摄影': ['拍照', '摄影', '好看'],
      '文化': ['文化', '历史', '博物馆'],
      '自然': ['风景', '自然', '海滩', '山'],
      '运动': ['潜水', '滑雪', '运动'],
    };

    for (const [interest, keywords] of Object.entries(interestKeywords)) {
      if (keywords.some(k => normalizedInput.includes(k))) {
        if (!userContext.interests.includes(interest)) {
          userContext.interests.push(interest);
        }
      }
    }

    // 记录目的地
    if (entities.destination) {
      if (!userContext.preferredDestinations.includes(entities.destination)) {
        userContext.preferredDestinations.push(entities.destination);
      }
    }

    // 记录历史
    userContext.history.push({
      input,
      entities,
      timestamp: Date.now(),
    });

    return userContext;
  }

  /**
   * 获取推荐
   */
  function recommend(type = 'all', options = {}) {
    const { destination, limit = 3, exclude = [] } = options;

    switch (type) {
      case 'destination':
        return recommendDestinations(options);
      case 'route':
        return recommendRoutes(destination, limit, exclude);
      case 'guide':
        return recommendGuides(destination, limit, exclude);
      case 'all':
        return {
          destinations: recommendDestinations({ limit: 3 }),
          routes: recommendRoutes(destination, limit, exclude),
          guides: recommendGuides(destination, limit, exclude),
        };
      default:
        return [];
    }
  }

  /**
   * 推荐目的地
   */
  function recommendDestinations(options = {}) {
    const { limit = 5, exclude = [] } = options;
    let destinations = [...recommendationData.destinations];

    // 根据用户画像过滤
    if (userContext.budget === '穷游') {
      // 优先推荐性价比高的
      destinations.sort((a, b) => {
        const aPrice = parseInt(a.price.split('-')[0]);
        const bPrice = parseInt(b.price.split('-')[0]);
        return aPrice - bPrice;
      });
    } else if (userContext.interests.length > 0) {
      // 根据兴趣匹配
      destinations = destinations.map(d => {
        const matchCount = d.tags.filter(tag => userContext.interests.includes(tag)).length;
        return { ...d, matchScore: matchCount };
      }).sort((a, b) => b.matchScore - a.matchScore);
    }

    // 排除已选
    destinations = destinations.filter(d => !exclude.includes(d.name));

    return destinations.slice(0, limit);
  }

  /**
   * 推荐路线
   */
  function recommendRoutes(destination, limit = 3, exclude = []) {
    let routes = [...recommendationData.routes];

    // 按目的地筛选
    if (destination) {
      routes = routes.filter(r => 
        r.destination.toLowerCase().includes(destination.toLowerCase()) ||
        r.highlights.some(h => h.toLowerCase().includes(destination.toLowerCase()))
      );
    }

    // 根据用户画像调整
    if (userContext.travelStyle === '亲子') {
      routes = routes.filter(r => 
        r.highlights.some(h => ['海岛', '乐园', '动物园'].includes(h))
      );
    } else if (userContext.travelStyle === '蜜月') {
      routes = routes.filter(r => 
        r.highlights.some(h => ['海岛', '浪漫'].includes(h)) || r.name.includes('蜜月')
      );
    }

    // 排除已选
    routes = routes.filter(r => !exclude.includes(r.id));

    return routes.slice(0, limit);
  }

  /**
   * 推荐导游
   */
  function recommendGuides(destination, limit = 3, exclude = []) {
    let guides = [...recommendationData.guides];

    // 按目的地筛选
    if (destination) {
      guides = guides.filter(g => 
        g.destination.toLowerCase().includes(destination.toLowerCase())
      );
    }

    // 优先推荐在线的
    guides.sort((a, b) => {
      if (a.available !== b.available) return b.available ? 1 : -1;
      return b.rating - a.rating;
    });

    // 排除已选
    guides = guides.filter(g => !exclude.includes(g.id));

    return guides.slice(0, limit);
  }

  /**
   * 智能上下文推荐
   */
  function contextualRecommend(context) {
    const { currentIntent, entities, sentiment } = context;
    const recommendations = [];

    // 根据意图推荐
    switch (currentIntent) {
      case 'destination_inquiry':
        // 目的地咨询 -> 推荐目的地和路线
        const dests = recommendDestinations({ limit: 3 });
        recommendations.push(...formatDestinationsAsCards(dests));
        break;

      case 'route_planning':
        // 路线规划 -> 推荐路线
        const routes = recommendRoutes(entities.destination, 3);
        recommendations.push(...formatRoutesAsCards(routes));
        break;

      case 'guide_inquiry':
        // 导游咨询 -> 推荐导游
        const guides = recommendGuides(entities.destination, 3);
        recommendations.push(...formatGuidesAsCards(guides));
        break;

      case 'budget_inquiry':
        // 预算咨询 -> 根据预算推荐
        const budgetRoutes = recommendRoutes(entities.destination, 3);
        recommendations.push(...formatRoutesAsCards(budgetRoutes));
        break;

      default:
        // 默认推荐热门
        const hotDests = recommendDestinations({ limit: 3 });
        recommendations.push(...formatDestinationsAsCards(hotDests));
    }

    return recommendations;
  }

  /**
   * 格式化目的地卡片
   */
  function formatDestinationsAsCards(destinations) {
    return destinations.map(dest => ({
      type: 'destination',
      id: dest.id,
      title: `${dest.emoji} ${dest.name}`,
      subtitle: dest.tags.join(' · '),
      data: dest,
      actions: [
        { text: '查看攻略', action: 'viewGuide' },
        { text: '预约导游', action: 'bookGuide' },
        { text: '制定路线', action: 'planRoute' },
      ],
    }));
  }

  /**
   * 格式化路线卡片
   */
  function formatRoutesAsCards(routes) {
    return routes.map(route => ({
      type: 'route',
      id: route.id,
      title: `${route.emoji} ${route.name}`,
      subtitle: `${route.destination} · ${route.days}天`,
      highlights: route.highlights.join(' / '),
      price: `¥${route.price.toLocaleString()}/人`,
      data: route,
      actions: [
        { text: '查看详情', action: 'viewRoute' },
        { text: '咨询预订', action: 'bookRoute' },
        { text: '定制行程', action: 'customizeRoute' },
      ],
    }));
  }

  /**
   * 格式化导游卡片
   */
  function formatGuidesAsCards(guides) {
    return guides.map(guide => ({
      type: 'guide',
      id: guide.id,
      title: `${guide.avatar} ${guide.name}`,
      subtitle: `${guide.rating}⭐ · ${guide.reviews}条评价`,
      specialties: guide.specialties,
      languages: guide.languages.join(' / '),
      price: `¥${guide.price}/天`,
      available: guide.available,
      data: guide,
      actions: [
        { text: '查看详情', action: 'viewGuideProfile' },
        { text: '立即预约', action: 'bookGuide', disabled: !guide.available },
      ],
    }));
  }

  /**
   * 生成推荐HTML
   */
  function generateRecommendationHTML(recommendations) {
    if (!recommendations || recommendations.length === 0) return '';

    return recommendations.map(rec => {
      if (rec.type === 'route') {
        return `
          <div class="recommendation-card route-card" data-id="${rec.id}" data-type="route">
            <div class="card-header">
              <span class="card-title">${rec.title}</span>
              <span class="card-badge ${rec.available === false ? 'badge-disabled' : 'badge-active'}">
                ${rec.available !== false ? '可预约' : '已约满'}
              </span>
            </div>
            <div class="card-subtitle">${rec.highlights}</div>
            <div class="card-price">${rec.price}</div>
            <div class="card-actions">
              ${rec.actions.map(a => `
                <button class="btn btn-sm ${a.disabled ? 'btn-secondary' : 'btn-primary'}" 
                        ${a.disabled ? 'disabled' : ''} 
                        onclick="SmartRecommender.handleAction('${a.action}', '${rec.id}')">
                  ${a.text}
                </button>
              `).join('')}
            </div>
          </div>
        `;
      } else if (rec.type === 'guide') {
        return `
          <div class="recommendation-card guide-card" data-id="${rec.id}" data-type="guide">
            <div class="card-header">
              <span class="card-title">${rec.title}</span>
              <span class="card-badge ${rec.available ? 'badge-active' : 'badge-disabled'}">
                ${rec.available ? '在线' : '离线'}
              </span>
            </div>
            <div class="card-subtitle">${rec.subtitle}</div>
            <div class="card-tags">
              ${rec.specialties.map(s => `<span class="tag">${s}</span>`).join('')}
            </div>
            <div class="card-meta">
              <span class="languages">${rec.languages}</span>
              <span class="price">${rec.price}</span>
            </div>
            <div class="card-actions">
              ${rec.actions.map(a => `
                <button class="btn btn-sm ${a.disabled ? 'btn-secondary' : 'btn-success'}" 
                        ${a.disabled ? 'disabled' : ''} 
                        onclick="SmartRecommender.handleAction('${a.action}', '${rec.id}')">
                  ${a.text}
                </button>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="recommendation-card destination-card" data-id="${rec.id}" data-type="destination">
            <div class="card-header">
              <span class="card-title">${rec.title}</span>
            </div>
            <div class="card-subtitle">${rec.subtitle}</div>
            <div class="card-meta">
              <span>预算: ${rec.data.price}</span>
              <span>建议: ${rec.data.days}</span>
            </div>
            <div class="card-actions">
              ${rec.actions.map(a => `
                <button class="btn btn-sm btn-primary" 
                        onclick="SmartRecommender.handleAction('${a.action}', '${rec.id}')">
                  ${a.text}
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }
    }).join('');
  }

  /**
   * 处理推荐卡片操作
   */
  function handleAction(action, id) {
    switch (action) {
      case 'viewGuide':
      case 'bookGuide':
        // 跳转到导游页面
        window.location.href = `guide-detail.html?id=${id}`;
        break;
      case 'viewRoute':
      case 'bookRoute':
        // 跳转到路线页面
        window.location.href = `route-detail.html?id=${id}`;
        break;
      case 'viewGuideProfile':
        // 显示导游详情
        showGuideDetail(id);
        break;
      case 'customizeRoute':
        // 自定义路线
        window.location.href = 'customize-route.html';
        break;
      case 'planRoute':
      case 'viewGuide':
        // 规划路线
        window.location.href = 'route-planning.html';
        break;
      default:
        console.log('Unknown action:', action, id);
    }
  }

  /**
   * 显示导游详情
   */
  function showGuideDetail(id) {
    const guide = recommendationData.guides.find(g => g.id === id);
    if (guide) {
      alert(`导游详情：\n\n姓名：${guide.name}\n评分：${guide.rating}⭐\n评价：${guide.reviews}条\n特长：${guide.specialties.join('、')}\n语言：${guide.languages.join('、')}\n价格：${guide.price}/天\n状态：${guide.available ? '可预约' : '已约满'}`);
    }
  }

  /**
   * 获取用户画像
   */
  function getUserProfile() {
    return { ...userContext };
  }

  /**
   * 更新用户画像
   */
  function setUserProfile(profile) {
    userContext = { ...userContext, ...profile };
    return userContext;
  }

  /**
   * 重置用户画像
   */
  function resetUserProfile() {
    userContext = {
      interests: [],
      budget: null,
      travelStyle: null,
      preferredDestinations: [],
      history: [],
    };
  }

  /**
   * 获取热门推荐
   */
  function getHotRecommendations(limit = 6) {
    return {
      destinations: recommendationData.destinations.slice(0, limit),
      routes: recommendationData.routes.slice(0, limit),
      guides: recommendationData.guides.filter(g => g.available).slice(0, limit),
    };
  }

  /**
   * 搜索推荐
   */
  function search(query) {
    const q = query.toLowerCase();
    const results = {
      destinations: [],
      routes: [],
      guides: [],
    };

    // 搜索目的地
    results.destinations = recommendationData.destinations.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q))
    );

    // 搜索路线
    results.routes = recommendationData.routes.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q) ||
      r.highlights.some(h => h.toLowerCase().includes(q))
    );

    // 搜索导游
    results.guides = recommendationData.guides.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.destination.toLowerCase().includes(q) ||
      g.specialties.some(s => s.toLowerCase().includes(q))
    );

    return results;
  }

  // 公开API
  return {
    updateUserContext,
    recommend,
    contextualRecommend,
    generateRecommendationHTML,
    handleAction,
    getUserProfile,
    setUserProfile,
    resetUserProfile,
    getHotRecommendations,
    search,
    getRecommendationData: () => recommendationData,
  };
})();
