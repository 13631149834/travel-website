/**
 * 游导旅游 - 导游列表页
 */
Page({
  data: {
    currentFilter: 'all',
    sortType: 'rating',
    sortText: '评分最高',
    hasMore: true,
    page: 1,
    pageSize: 10,
    
    // 导游列表数据
    guides: [
      {
        id: 1,
        avatar: '👩‍💼',
        name: '李婷',
        languages: '🇨🇳 中文 · 🇯🇵 日语',
        rating: '4.9',
        reviewCount: 328,
        specialty: '日本深度游 · 樱花季专家 · 商务接待',
        price: 800,
        isHot: true,
        isRecommended: true
      },
      {
        id: 2,
        avatar: '👨‍🏫',
        name: '王磊',
        languages: '🇨🇳 中文 · 🇬🇧 英语 · 🇫🇷 法语',
        rating: '4.8',
        reviewCount: 256,
        specialty: '欧洲艺术史 · 文化深度游 · 名胜古迹',
        price: 1000,
        isHot: false,
        isRecommended: true
      },
      {
        id: 3,
        avatar: '👩‍🎨',
        name: '陈静',
        languages: '🇨🇳 中文 · 🇹🇭 泰语',
        rating: '4.9',
        reviewCount: 412,
        specialty: '东南亚自由行 · 海岛度假 · 美食探索',
        price: 600,
        isHot: true,
        isRecommended: true
      },
      {
        id: 4,
        avatar: '👨‍✈️',
        name: '张伟',
        languages: '🇨🇳 中文 · 🇫🇷 法语',
        rating: '4.7',
        reviewCount: 189,
        specialty: '法语区深度游 · 定制旅行 · 摄影之旅',
        price: 900,
        isHot: false,
        isRecommended: false
      },
      {
        id: 5,
        avatar: '🧑‍🎓',
        name: '刘洋',
        languages: '🇨🇳 中文 · 🇰🇷 韩语',
        rating: '4.8',
        reviewCount: 301,
        specialty: '韩国潮流文化 · 购物攻略 · 追星指南',
        price: 550,
        isHot: true,
        isRecommended: true
      },
      {
        id: 6,
        avatar: '👩‍🔬',
        name: '赵雪',
        languages: '🇨🇳 中文 · 🇩🇪 德语 · 🇬🇧 英语',
        rating: '4.6',
        reviewCount: 145,
        specialty: '德国工业游 · 啤酒文化 · 博物馆之旅',
        price: 850,
        isHot: false,
        isRecommended: false
      }
    ]
  },
  
  onLoad(options) {
    // 接收筛选参数
    if (options.filter) {
      this.setData({ currentFilter: options.filter });
    }
  },
  
  // 筛选切换
  onFilterTap(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ 
      currentFilter: filter,
      page: 1
    });
    this.loadGuides();
  },
  
  // 排序切换
  onSortTap() {
    const sortTypes = ['rating', 'price_asc', 'price_desc', 'reviews'];
    const sortTexts = ['评分最高', '价格从低到高', '价格从高到低', '评价最多'];
    const currentIndex = sortTypes.indexOf(this.data.sortType);
    const nextIndex = (currentIndex + 1) % sortTypes.length;
    
    this.setData({
      sortType: sortTypes[nextIndex],
      sortText: sortTexts[nextIndex]
    });
    this.loadGuides();
  },
  
  // 加载导游列表
  loadGuides() {
    // 实际项目中调用API获取数据
    console.log('加载导游列表', this.data.currentFilter, this.data.sortType);
  },
  
  // 加载更多
  loadMore() {
    this.data.page++;
    this.setData({ page: this.data.page });
    this.loadGuides();
  },
  
  // 导游卡片点击
  onGuideTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/guide/detail?id=${id}`
    });
  }
});
