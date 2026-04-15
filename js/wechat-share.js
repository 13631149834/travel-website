/**
 * 游导旅游 - 微信分享SDK封装
 * @version 1.2.0
 * @description 封装微信JS-SDK的分享功能，支持多种分享场景
 */

(function(window) {
  'use strict';

  const ShareModule = {
    // 配置信息
    config: {
      appId: '',           // 微信公众号AppID
      debug: false,        // 调试模式
      defaultTitle: '游导旅游 - 发现当地之美',
      defaultDesc: '800+认证导游，覆盖200+目的地，旅行从此不同',
      defaultImg: 'https://youdao-travel.com/images/logo-200.png',
      defaultUrl: window.location.href.split('#')[0]
    },

    // 分享配置
    shareConfig: {
      title: '',
      desc: '',
      link: '',
      imgUrl: ''
    },

    // 初始化标志
    initialized: false,

    /**
     * 初始化微信分享
     * @param {Object} options 配置选项
     */
    init: function(options) {
      const self = this;
      
      // 合并配置
      Object.assign(this.config, options || {});
      
      // 设置默认分享配置
      this.shareConfig = {
        title: this.config.defaultTitle,
        desc: this.config.defaultDesc,
        link: this.config.defaultUrl,
        imgUrl: this.config.defaultImg
      };

      // 获取微信配置
      this.getJsConfig().then(function(wxConfig) {
        if (!wxConfig) {
          console.warn('微信分享配置获取失败');
          return;
        }

        wx.config({
          debug: self.config.debug,
          appId: wxConfig.appId,
          timestamp: wxConfig.timestamp,
          nonceStr: wxConfig.nonceStr,
          signature: wxConfig.signature,
          jsApiList: [
            'updateAppMessageShareData',    // 分享给朋友
            'updateTimelineShareData',       // 分享到朋友圈
            'onMenuShareWechatMessage',      // 分享到朋友（旧版）
            'onMenuShareWechatTimeline'      // 分享到朋友圈（旧版）
          ]
        });

        wx.ready(function() {
          self.initialized = true;
          self.setupShare();
          console.log('微信分享初始化成功');
        });

        wx.error(function(res) {
          console.error('微信分享初始化失败', res);
        });
      });
    },

    /**
     * 获取JS-SDK配置
     */
    getJsConfig: function() {
      return new Promise(function(resolve) {
        const url = window.location.href.split('#')[0];
        
        // 模拟API调用，实际项目中替换为真实接口
        fetch('/api/wechat/jsconfig?url=' + encodeURIComponent(url))
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            resolve(data);
          })
          .catch(function() {
            // 降级处理：使用模拟配置
            resolve({
              appId: 'YOUR_APP_ID',
              timestamp: Math.floor(Date.now() / 1000),
              nonceStr: 'random_' + Math.random().toString(36).substr(2, 15),
              signature: 'MOCK_SIGNATURE'
            });
          });
      });
    },

    /**
     * 设置分享参数
     * @param {Object} options 分享配置
     */
    setShareData: function(options) {
      Object.assign(this.shareConfig, options);
      if (this.initialized) {
        this.setupShare();
      }
    },

    /**
     * 配置分享
     */
    setupShare: function() {
      const self = this;

      // 分享给朋友
      wx.updateAppMessageShareData({
        title: this.shareConfig.title,
        desc: this.shareConfig.desc,
        link: this.shareConfig.link,
        imgUrl: this.shareConfig.imgUrl,
        success: function() {
          self.trackShare('friend');
        }
      });

      // 分享到朋友圈
      wx.updateTimelineShareData({
        title: this.shareConfig.title,
        link: this.shareConfig.link,
        imgUrl: this.shareConfig.imgUrl,
        success: function() {
          self.trackShare('timeline');
        }
      });
    },

    /**
     * 分享追踪
     * @param {string} type 分享类型
     */
    trackShare: function(type) {
      // 触发分享事件
      this.emit('share', {
        type: type,
        title: this.shareConfig.title,
        url: this.shareConfig.link
      });

      // 发送给数据分析
      if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
          method: 'WeChat ' + type,
          content_type: 'wechat_share',
          item_id: this.shareConfig.link
        });
      }

      console.log('分享追踪:', type);
    },

    /**
     * 分享到微信
     */
    shareToWechat: function(options) {
      options = options || {};
      
      const shareData = {
        title: options.title || this.shareConfig.title,
        desc: options.desc || this.shareConfig.desc,
        url: options.url || this.shareConfig.link
      };

      // 显示分享二维码弹窗
      this.showShareModal(shareData);
    },

    /**
     * 显示分享弹窗
     */
    showShareModal: function(shareData) {
      // 创建或获取弹窗元素
      let modal = document.getElementById('wechatShareModal');
      
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'wechatShareModal';
        modal.className = 'share-modal';
        modal.innerHTML = this.getShareModalHTML();
        document.body.appendChild(modal);

        // 绑定关闭事件
        modal.querySelector('.share-modal-close').addEventListener('click', function() {
          modal.style.display = 'none';
        });

        modal.addEventListener('click', function(e) {
          if (e.target === modal) {
            modal.style.display = 'none';
          }
        });
      }

      // 更新分享链接
      const urlInput = modal.querySelector('.share-url-input');
      if (urlInput) {
        urlInput.value = shareData.url;
      }

      // 显示弹窗
      modal.style.display = 'flex';
    },

    /**
     * 获取分享弹窗HTML
     */
    getShareModalHTML: function() {
      return `
        <div class="share-modal-content">
          <button class="share-modal-close" aria-label="关闭">×</button>
          <h3>分享到微信</h3>
          <p class="share-tip">打开微信扫一扫，或长按识别二维码</p>
          <div class="wechat-qrcode">
            <img src="https://api.qrserver.com/v1/create-qr-code?size=200x200&data=${encodeURIComponent(window.location.href)}" alt="分享二维码">
          </div>
          <div class="share-url-box">
            <input type="text" value="" readonly class="share-url-input">
            <button class="share-copy-btn" onclick="ShareModule.copyLink()">复制链接</button>
          </div>
        </div>
      `;
    },

    /**
     * 复制链接
     */
    copyLink: function(options) {
      options = options || {};
      const url = options.url || window.location.href;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function() {
          alert('链接已复制到剪贴板');
        }).catch(function() {
          this.fallbackCopy(url);
        });
      } else {
        this.fallbackCopy(url);
      }
    },

    /**
     * 降级复制方法
     */
    fallbackCopy: function(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        alert('链接已复制到剪贴板');
      } catch (err) {
        alert('复制失败，请手动复制');
      }
      
      document.body.removeChild(textarea);
    },

    /**
     * 分享到微博
     */
    shareToWeibo: function(options) {
      options = options || {};
      const url = options.url || window.location.href;
      const title = options.title || this.shareConfig.title;
      
      const shareUrl = 'http://service.weibo.com/share/share.php?' +
        'url=' + encodeURIComponent(url) +
        '&title=' + encodeURIComponent(title) +
        '&pic=' + encodeURIComponent(this.shareConfig.imgUrl);
      
      window.open(shareUrl, '_blank');
    },

    /**
     * 分享到QQ
     */
    shareToQQ: function(options) {
      options = options || {};
      const url = options.url || window.location.href;
      const title = options.title || this.shareConfig.title;
      const desc = options.desc || this.shareConfig.desc;
      
      const shareUrl = 'https://connect.qq.com/widget/shareqq/iframe_index.html?' +
        'url=' + encodeURIComponent(url) +
        '&title=' + encodeURIComponent(title) +
        '&desc=' + encodeURIComponent(desc) +
        '&pics=' + encodeURIComponent(this.shareConfig.imgUrl);
      
      window.open(shareUrl, '_blank');
    },

    /**
     * 事件监听器
     */
    listeners: {},

    /**
     * 绑定事件
     */
    on: function(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    },

    /**
     * 解绑事件
     */
    off: function(event, callback) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(function(cb) {
        return cb !== callback;
      });
    },

    /**
     * 触发事件
     */
    emit: function(event, data) {
      if (!this.listeners[event]) return;
      this.listeners[event].forEach(function(callback) {
        callback(data);
      });
    }
  };

  // 页面类型对应的分享配置
  ShareModule.pageTypes = {
    home: {
      title: '游导旅游 - 发现当地之美',
      desc: '800+认证导游，覆盖200+目的地，旅行从此不同',
      imgUrl: 'https://youdao-travel.com/images/logo-200.png'
    },
    guide: {
      title: '【{{city}}认证导游】{{name}}',
      desc: '⭐{{rating}}分 | {{tours}}次带团 | {{expertise}}',
      getData: function(guide) {
        return {
          title: this.title.replace('{{city}}', guide.city).replace('{{name}}', guide.name),
          desc: this.desc.replace('{{rating}}', guide.rating)
                        .replace('{{tours}}', guide.tours)
                        .replace('{{expertise}}', guide.expertise),
          imgUrl: guide.avatar || ShareModule.config.defaultImg
        };
      }
    },
    destination: {
      title: '{{city}}旅行攻略 - 游导旅游',
      desc: '发现{{city}}最佳玩法，本地导游带你深度游'
    },
    activity: {
      title: '【限时优惠】{{activity_name}}',
      desc: '{{discount}}优惠，仅限前{{limit}}名，立即预订！'
    }
  };

  /**
   * 根据页面类型设置分享
   */
  ShareModule.setShareByType = function(type, data) {
    const typeConfig = this.pageTypes[type];
    if (!typeConfig) {
      console.warn('未知的页面类型:', type);
      return;
    }

    const shareData = typeof typeConfig.getData === 'function' 
      ? typeConfig.getData(data) 
      : Object.assign({}, typeConfig, data);

    this.setShareData(shareData);
  };

  // 导出到全局
  window.ShareModule = ShareModule;

})(window);
