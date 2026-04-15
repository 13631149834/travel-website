/**
 * 游导旅游 - 首页逻辑
 */
const app = getApp();

Page({
  data: {
    // 明星导游列表
    topGuides: [
      {
        id: 1,
        avatar: '👩‍💼',
        name: '李婷',
        languages: '🇨🇳 中文 · 🇯🇵 日语',
        rating: '4.9',
        reviewCount: 328,
        specialty: '日本深度游 · 樱花季专家',
        isHot: true
      },
      {
        id: 2,
        avatar: '👨‍🏫',
        name: '王磊',
        languages: '🇨🇳 中文 · 🇬🇧 英语',
        rating: '4.8',
        reviewCount: 256,
        specialty: '欧洲艺术史 · 文化深度游',
        isHot: false
      },
      {
        id: 3,
        avatar: '👩‍🎨',
        name: '陈静',
        languages: '🇨🇳 中文 · 🇹🇭 泰语',
        rating: '4.9',
        reviewCount: 412,
        specialty: '东南亚自由行 · 海岛度假',
        isHot: true
      },
      {
        id: 4,
        avatar: '👨‍✈️',
        name: '张伟',
        languages: '🇨🇳 中文 · 🇫🇷 法语',
        rating: '4.7',
        reviewCount: 189,
        specialty: '法语区深度游 · 定制旅行',
        isHot: false
      },
      {
        id: 5,
        avatar: '🧑‍🎓',
        name: '刘洋',
        languages: '🇨🇳 中文 · 🇰🇷 韩语',
        rating: '4.8',
        reviewCount: 301,
        specialty: '韩国潮流文化 · 购物攻略',
        isHot: false
      }
    ],
    
    // 热门目的地
    topDestinations: [
      { id: 1, name: '日本', emoji: '🗾', guideCount: 856, bgColor: 'linear-gradient(135deg, #FFB7C5 0%, #FF69B4 100%)' },
      { id: 2, name: '泰国', emoji: '🇹🇭', guideCount: 723, bgColor: 'linear-gradient(135deg, #87CEEB 0%, #4169E1 100%)' },
      { id: 3, name: '欧洲', emoji: '🏰', guideCount: 634, bgColor: 'linear-gradient(135deg, #98FB98 0%, #228B22 100%)' },
      { id: 4, name: '韩国', emoji: '🇰🇷', guideCount: 589, bgColor: 'linear-gradient(135deg, #E6E6FA 0%, #9370DB 100%)' },
      { id: 5, name: '美国', emoji: '🗽', guideCount: 456, bgColor: 'linear-gradient(135deg, #87CEFA 0%, #1E90FF 100%)' },
      { id: 6, name: '海岛', emoji: '🏝️', guideCount: 398, bgColor: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }
    ],
    
    // 旅行工具
    tools: [
      { id: 1, name: '天气查询', icon: '🌤️', desc: '实时天气', bgColor: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },
      { id: 2, name: '汇率换算', icon: '💱', desc: '实时汇率', bgColor: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)' },
      { id: 3, name: '世界时钟', icon: '⏰', desc: '全球时间', bgColor: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)' },
      { id: 4, name: '应急资源', icon: '🆘', desc: '紧急求助', bgColor: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)' },
      { id: 5, name: '签证中心', icon: '📋', desc: '签证攻略', bgColor: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)' },
      { id: 6, name: '避坑指南', icon: '⚠️', desc: '防骗必看', bgColor: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)' }
    ]
  },
  
  onLoad() {
    // 页面加载
    console.log('首页加载');
  },
  
  onShow() {
    // 检查登录状态
    const isLoggedIn = app.globalData.isLoggedIn;
    this.setData({ isLoggedIn });
  },
  
  // 搜索点击
  onSearchTap() {
    wx.showToast({
      title: '搜索功能开发中',
      icon: 'none'
    });
  },
  
  // 跳转导游列表
  navigateToGuides() {
    wx.switchTab({
      url: '/pages/guide/list'
    });
  },
  
  // 跳转目的地
  navigateToDestinations() {
    wx.switchTab({
      url: '/pages/destination/list'
    });
  },
  
  // 跳转签证
  navigateToVisa() {
    wx.showToast({
      title: '签证功能开发中',
      icon: 'none'
    });
  },
  
  // 跳转工具
  navigateToTools() {
    wx.showToast({
      title: '工具功能开发中',
      icon: 'none'
    });
  },
  
  // 导游卡片点击
  onGuideTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/guide/detail?id=${id}`
    });
  },
  
  // 目的地卡片点击
  onDestinationTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/destination/detail?id=${id}`
    });
  },
  
  // 工具卡片点击
  onToolTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  }
});
