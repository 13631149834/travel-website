/**
 * 游导旅游 - 个人中心页
 */
const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      id: '10001',
      nickname: '旅行者',
      avatar: '👤'
    }
  },
  
  onLoad() {
    this.checkLoginStatus();
  },
  
  onShow() {
    this.checkLoginStatus();
  },
  
  // 检查登录状态
  checkLoginStatus() {
    this.setData({
      isLoggedIn: app.globalData.isLoggedIn,
      userInfo: app.globalData.userInfo || this.data.userInfo
    });
  },
  
  // 头像点击
  onAvatarTap() {
    if (!this.data.isLoggedIn) {
      this.login();
    }
  },
  
  // 登录
  login() {
    wx.showModal({
      title: '提示',
      content: '登录功能开发中，请稍后...',
      showCancel: false
    });
  },
  
  // 订单入口
  onOrdersTap() {
    wx.showToast({
      title: '订单功能开发中',
      icon: 'none'
    });
  },
  
  // 订单类型点击
  onOrderTap(e) {
    const type = e.currentTarget.dataset.type;
    wx.showToast({
      title: '订单功能开发中',
      icon: 'none'
    });
  },
  
  // 菜单点击
  onMenuTap(e) {
    const type = e.currentTarget.dataset.type;
    
    if (!this.data.isLoggedIn && ['favorites', 'reviews', 'coupons'].includes(type)) {
      this.login();
      return;
    }
    
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },
  
  // 退出登录
  onLogoutTap() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.clearLoginStatus();
          this.setData({
            isLoggedIn: false,
            userInfo: {
              id: '',
              nickname: '旅行者',
              avatar: '👤'
            }
          });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  }
});
