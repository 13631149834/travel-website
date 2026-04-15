/**
 * 游导旅游 - 目的地页
 */
Page({
  data: {
    currentCategory: 'all',
    
    // 轮播推荐
    featuredDestinations: [
      {
        id: 1,
        name: '日本',
        emoji: '🗾',
        desc: '樱花、红叶、温泉、美食，一个值得反复探索的国度',
        guideCount: 856,
        routesCount: 128,
        bgColor: 'linear-gradient(135deg, #FFB7C5 0%, #FF69B4 100%)'
      },
      {
        id: 2,
        name: '泰国',
        emoji: '🇹🇭',
        desc: '微笑国度，寺庙林立，海岛风光与都市繁华并存',
        guideCount: 723,
        routesCount: 96,
        bgColor: 'linear-gradient(135deg, #87CEEB 0%, #4169E1 100%)'
      },
      {
        id: 3,
        name: '欧洲',
        emoji: '🏰',
        desc: '古典与现代交融，艺术的殿堂，浪漫的起点',
        guideCount: 634,
        routesCount: 156,
        bgColor: 'linear-gradient(135deg, #98FB98 0%, #228B22 100%)'
      }
    ],
    
    // 目的地列表
    destinations: [
      {
        id: 1,
        name: '日本',
        emoji: '🗾',
        desc: '樱花烂漫，温泉养生',
        guideCount: 856,
        startPrice: 600,
        isHot: true,
        bgColor: 'linear-gradient(135deg, #FFB7C5 0%, #FF69B4 100%)',
        category: 'asia'
      },
      {
        id: 2,
        name: '泰国',
        emoji: '🇹🇭',
        desc: '微笑国度，寺庙林立',
        guideCount: 723,
        startPrice: 400,
        isHot: true,
        bgColor: 'linear-gradient(135deg, #87CEEB 0%, #4169E1 100%)',
        category: 'asia'
      },
      {
        id: 3,
        name: '韩国',
        emoji: '🇰🇷',
        desc: '潮流文化，购物天堂',
        guideCount: 589,
        startPrice: 350,
        isHot: false,
        bgColor: 'linear-gradient(135deg, #E6E6FA 0%, #9370DB 100%)',
        category: 'asia'
      },
      {
        id: 4,
        name: '法国',
        emoji: '🇫🇷',
        desc: '浪漫之都，艺术殿堂',
        guideCount: 456,
        startPrice: 800,
        isHot: true,
        bgColor: 'linear-gradient(135deg, #87CEFA 0%, #1E90FF 100%)',
        category: 'europe'
      },
      {
        id: 5,
        name: '意大利',
        emoji: '🇮🇹',
        desc: '古罗马文明，时尚之都',
        guideCount: 389,
        startPrice: 750,
        isHot: false,
        bgColor: 'linear-gradient(135deg, #98FB98 0%, #32CD32 100%)',
        category: 'europe'
      },
      {
        id: 6,
        name: '瑞士',
        emoji: '🇨🇭',
        desc: '雪山湖泊，童话世界',
        guideCount: 278,
        startPrice: 900,
        isHot: false,
        bgColor: 'linear-gradient(135deg, #ADD8E6 0%, #4169E1 100%)',
        category: 'europe'
      },
      {
        id: 7,
        name: '美国',
        emoji: '🗽',
        desc: '多元文化，梦想之地',
        guideCount: 456,
        startPrice: 850,
        isHot: true,
        bgColor: 'linear-gradient(135deg, #B0C4DE 0%, #4682B4 100%)',
        category: 'america'
      },
      {
        id: 8,
        name: '澳大利亚',
        emoji: '🦘',
        desc: '自然奇观，海岸风光',
        guideCount: 234,
        startPrice: 780,
        isHot: false,
        bgColor: 'linear-gradient(135deg, #F0E68C 0%, #DAA520 100%)',
        category: 'oceania'
      }
    ]
  },
  
  onLoad() {
    console.log('目的地页加载');
  },
  
  // 分类切换
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category });
  },
  
  // 目的地点击
  onDestinationTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/destination/detail?id=${id}`
    });
  }
});
