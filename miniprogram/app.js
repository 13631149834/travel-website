/**
 * 游导旅游 - 小程序入口文件
 * 
 * 使用说明：
 * 1. 注册微信小程序账号，获取 AppID
 * 2. 将下方的 YOUR_APP_ID 替换为您的 AppID
 * 3. 使用微信开发者工具导入项目即可
 */

// 替换为您的 AppID
const APP_ID = 'YOUR_APP_ID';

App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    // API 基础地址，部署时替换为实际地址
    apiBase: 'https://api.youdau-travel.com',
    // 平台数据统计
    stats: {
      guides: 5200,
      destinations: 128,
      users: 150000,
      reviews: 85000
    }
  },
  
  onLaunch() {
    // 小程序启动时检查登录状态
    this.checkLoginStatus();
    
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);
    
    // 登录
    wx.login({
      success: res => {
        console.log('登录成功', res.code);
      }
    });
  },
  
  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.isLoggedIn = true;
      this.globalData.userInfo = userInfo;
    }
  },
  
  // 设置用户信息
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = true;
    wx.setStorageSync('userInfo', userInfo);
  },
  
  // 清除登录状态（退出登录）
  clearLoginStatus() {
    this.globalData.userInfo = null;
    this.globalData.isLoggedIn = false;
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
  }
});
