/**
 * 游导旅游 - 渠道追踪与UTM参数处理
 * 功能：渠道标记、来源追踪、转化归因、ROI计算
 */

(function() {
    'use strict';

    // 渠道追踪配置
    const ChannelTrackingConfig = {
        // UTM参数名称
        utm: {
            source: 'utm_source',      // 来源
            medium: 'utm_medium',      // 媒介
            campaign: 'utm_campaign',  // 活动
            term: 'utm_term',          // 关键词
            content: 'utm_content'     // 内容
        },
        
        // 自定义参数
        custom: {
            channel: 'channel',       // 渠道标识
            subChannel: 'sub_channel', // 子渠道
            creative: 'creative',      // 创意ID
            placement: 'placement'     // 广告位置
        },
        
        // 会话有效期（毫秒）
        sessionDuration: 30 * 60 * 1000, // 30分钟
        
        // 归因模式
        attribution: {
            // 首次触达归因
            firstClick: {
                name: '首次触达',
                weight: {
                    first: 1.0,
                    last: 0,
                    linear: null
                }
            },
            // 最后触达归因
            lastClick: {
                name: '最后触达',
                weight: {
                    first: 0,
                    last: 1.0,
                    linear: null
                }
            },
            // 线性归因
            linear: {
                name: '线性归因',
                weight: {
                    first: 0,
                    last: 0,
                    linear: 1.0
                }
            },
            // 位置归因
            positionBased: {
                name: '位置归因',
                weight: {
                    first: 0.4,
                    last: 0.4,
                    linear: 0.2
                }
            }
        },
        
        // 渠道映射表
        channelMapping: {
            // 搜索引擎
            'google': { name: 'Google', medium: 'organic', category: '搜索引擎' },
            'baidu': { name: '百度', medium: 'organic', category: '搜索引擎' },
            'bing': { name: 'Bing', medium: 'organic', category: '搜索引擎' },
            'sogou': { name: '搜狗', medium: 'organic', category: '搜索引擎' },
            'shenma': { name: '神马', medium: 'organic', category: '搜索引擎' },
            
            // 社交媒体
            'weibo': { name: '微博', medium: 'social', category: '社交媒体' },
            'weixin': { name: '微信', medium: 'social', category: '社交媒体' },
            'xiaohongshu': { name: '小红书', medium: 'social', category: '社交媒体' },
            'douyin': { name: '抖音', medium: 'social', category: '社交媒体' },
            'bilibili': { name: 'B站', medium: 'social', category: '社交媒体' },
            
            // 付费广告
            'baidu_sem': { name: '百度推广', medium: 'cpc', category: '付费广告' },
            'google_ads': { name: 'Google Ads', medium: 'cpc', category: '付费广告' },
            'toutiao_ads': { name: '头条广告', medium: 'cpc', category: '付费广告' },
            'weibo_ads': { name: '微博广告', medium: 'cpc', category: '付费广告' },
            
            // 邮件营销
            'email': { name: '邮件营销', medium: 'email', category: '邮件' },
            'newsletter': { name: 'Newsletter', medium: 'email', category: '邮件' },
            
            // 直接流量
            'direct': { name: '直接访问', medium: 'none', category: '直接' },
            
            // 引荐流量
            'referral': { name: '引荐链接', medium: 'referral', category: '引荐' }
        },
        
        // 预算配置（示例）
        budgets: {
            'google_ads': 10000,      // 月预算
            'baidu_sem': 15000,
            'toutiao_ads': 8000,
            'weibo_ads': 5000
        }
    };

    // 渠道追踪类
    class ChannelTracker {
        constructor() {
            this.currentSession = null;
            this.conversionData = {};
            this.attributionModel = 'lastClick'; // 默认最后触达归因
            
            this._init();
        }

        // 初始化
        _init() {
            // 检查并保存UTM参数
            this._captureUTMParams();
            
            // 检查引荐来源
            this._captureReferrer();
            
            // 检查是否为直接访问
            this._checkDirectTraffic();
            
            // 保存当前会话数据
            this._saveSessionData();
            
            // 监听页面卸载，保存会话结束数据
            this._setupUnloadListener();
        }

        // 获取UTM参数
        _captureUTMParams() {
            const params = new URLSearchParams(window.location.search);
            const utmData = {};
            
            // 标准UTM参数
            const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
            utmKeys.forEach(key => {
                const value = params.get(key);
                if (value) {
                    utmData[key] = value;
                }
            });
            
            // 自定义参数
            const customKeys = ['channel', 'sub_channel', 'creative', 'placement'];
            customKeys.forEach(key => {
                const value = params.get(key);
                if (value) {
                    utmData[key] = value;
                }
            });
            
            // 存储UTM数据
            if (Object.keys(utmData).length > 0) {
                sessionStorage.setItem('youdao_utm', JSON.stringify(utmData));
                sessionStorage.setItem('youdao_utm_timestamp', Date.now().toString());
                
                this.log('UTM params captured:', utmData);
            }
        }

        // 获取引荐来源
        _captureReferrer() {
            const referrer = document.referrer;
            
            if (!referrer) return null;
            
            try {
                const referrerUrl = new URL(referrer);
                const referrerDomain = referrerUrl.hostname.replace('www.', '');
                
                // 检查是否已有UTM参数（如果已有UTM参数，则引荐来源不覆盖）
                const existingUTM = sessionStorage.getItem('youdao_utm');
                if (existingUTM) return null;
                
                // 识别渠道类型
                const channelInfo = this._identifyChannel(referrerDomain);
                
                if (channelInfo && !sessionStorage.getItem('youdao_referrer')) {
                    sessionStorage.setItem('youdao_referrer', JSON.stringify({
                        domain: referrerDomain,
                        url: referrer,
                        ...channelInfo,
                        timestamp: Date.now()
                    }));
                    
                    this.log('Referrer captured:', referrerDomain, channelInfo);
                }
            } catch (e) {
                this.log('Error parsing referrer:', e);
            }
            
            return null;
        }

        // 识别渠道
        _identifyChannel(domain) {
            const lowerDomain = domain.toLowerCase();
            
            // 检查渠道映射表
            for (const [key, info] of Object.entries(ChannelTrackingConfig.channelMapping)) {
                if (lowerDomain.includes(key)) {
                    return {
                        channel: key,
                        channelName: info.name,
                        medium: info.medium,
                        category: info.category
                    };
                }
            }
            
            // 默认归为引荐流量
            return {
                channel: domain,
                channelName: domain,
                medium: 'referral',
                category: '引荐'
            };
        }

        // 检查直接流量
        _checkDirectTraffic() {
            const existingData = sessionStorage.getItem('youdao_utm') || sessionStorage.getItem('youdao_referrer');
            
            if (!existingData && !sessionStorage.getItem('youdao_direct')) {
                sessionStorage.setItem('youdao_direct', JSON.stringify({
                    timestamp: Date.now(),
                    url: window.location.href
                }));
            }
        }

        // 保存会话数据
        _saveSessionData() {
            const sessionId = 'sess_' + Date.now().toString(36);
            
            this.currentSession = {
                sessionId,
                startTime: Date.now(),
                landingPage: window.location.href,
                landingPath: window.location.pathname,
                utm: this._getUTMData(),
                referrer: this._getReferrerData(),
                userId: this._getUserId()
            };
            
            // 存储会话ID
            sessionStorage.setItem('youdao_session_id', sessionId);
            
            this.log('Session saved:', this.currentSession);
        }

        // 设置页面卸载监听
        _setupUnloadListener() {
            const self = this;
            
            window.addEventListener('beforeunload', function() {
                self._endSession();
            });
            
            // 也监听 visibilitychange
            document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'hidden') {
                    self._endSession();
                }
            });
        }

        // 结束会话
        _endSession() {
            if (!this.currentSession) return;
            
            this.currentSession.endTime = Date.now();
            this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
            this.currentSession.pageViews = this._countPageViews();
            
            // 保存会话数据到localStorage
            this._saveSession();
        }

        // 获取UTM数据
        _getUTMData() {
            const data = sessionStorage.getItem('youdao_utm');
            return data ? JSON.parse(data) : null;
        }

        // 获取引荐数据
        _getReferrerData() {
            const data = sessionStorage.getItem('youdao_referrer');
            return data ? JSON.parse(data) : null;
        }

        // 获取用户ID
        _getUserId() {
            const user = localStorage.getItem('user');
            if (user) {
                try {
                    return JSON.parse(user).id;
                } catch (e) {
                    return null;
                }
            }
            return null;
        }

        // 统计页面浏览数
        _countPageViews() {
            const key = 'youdao_page_views';
            let count = parseInt(sessionStorage.getItem(key) || '0');
            count++;
            sessionStorage.setItem(key, count.toString());
            return count;
        }

        // 保存会话
        _saveSession() {
            if (!this.currentSession) return;
            
            const key = 'youdao_sessions';
            let sessions = [];
            
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    sessions = JSON.parse(data);
                }
            } catch (e) {
                sessions = [];
            }
            
            sessions.push(this.currentSession);
            
            // 只保留最近1000个会话
            if (sessions.length > 1000) {
                sessions = sessions.slice(-1000);
            }
            
            localStorage.setItem(key, JSON.stringify(sessions));
        }

        // 获取当前会话信息
        getSessionInfo() {
            return this.currentSession;
        }

        // 获取渠道信息
        getChannelInfo() {
            const utm = this._getUTMData();
            const referrer = this._getReferrerData();
            
            if (utm) {
                const channelKey = utm.utm_source || utm.channel;
                const mapped = ChannelTrackingConfig.channelMapping[channelKey] || {
                    name: channelKey,
                    medium: utm.utm_medium || 'unknown',
                    category: '其他'
                };
                
                return {
                    type: 'utm',
                    source: utm.utm_source || channelKey,
                    medium: utm.utm_medium || mapped.medium,
                    campaign: utm.utm_campaign || null,
                    channelName: mapped.name,
                    category: mapped.category,
                    raw: utm
                };
            }
            
            if (referrer) {
                return {
                    type: 'referral',
                    source: referrer.domain,
                    medium: referrer.medium,
                    channelName: referrer.channelName,
                    category: referrer.category,
                    raw: referrer
                };
            }
            
            return {
                type: 'direct',
                source: 'direct',
                medium: 'none',
                channelName: '直接访问',
                category: '直接'
            };
        }

        // 记录转化
        recordConversion(conversionType, value, orderId) {
            const channelInfo = this.getChannelInfo();
            
            const conversion = {
                id: 'conv_' + Date.now().toString(36),
                type: conversionType,
                value: value || 0,
                orderId: orderId || null,
                timestamp: Date.now(),
                channel: channelInfo,
                sessionId: sessionStorage.getItem('youdao_session_id'),
                userId: this._getUserId()
            };
            
            // 保存转化数据
            this._saveConversion(conversion);
            
            // 更新转化归因
            this._updateAttribution(conversion);
            
            this.log('Conversion recorded:', conversion);
            
            return conversion;
        }

        // 保存转化数据
        _saveConversion(conversion) {
            const key = 'youdao_conversions';
            let conversions = [];
            
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    conversions = JSON.parse(data);
                }
            } catch (e) {
                conversions = [];
            }
            
            conversions.push(conversion);
            
            // 只保留最近10000个转化
            if (conversions.length > 10000) {
                conversions = conversions.slice(-10000);
            }
            
            localStorage.setItem(key, JSON.stringify(conversions));
        }

        // 更新归因数据
        _updateAttribution(conversion) {
            const key = 'youdao_attribution';
            let attribution = {};
            
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    attribution = JSON.parse(data);
                }
            } catch (e) {
                attribution = {};
            }
            
            // 累加各渠道的转化价值
            const channel = conversion.channel.source;
            attribution[channel] = attribution[channel] || {
                conversions: 0,
                value: 0
            };
            attribution[channel].conversions++;
            attribution[channel].value += conversion.value;
            
            localStorage.setItem(key, JSON.stringify(attribution));
        }

        // 计算ROI
        calculateROI(channel) {
            const budget = ChannelTrackingConfig.budgets[channel] || 0;
            const attribution = this._getAttributionData();
            const channelData = attribution[channel] || { conversions: 0, value: 0 };
            
            const revenue = channelData.value;
            const cost = budget;
            const profit = revenue - cost;
            const roi = cost > 0 ? ((profit / cost) * 100).toFixed(2) : 0;
            
            return {
                channel,
                budget,
                revenue,
                profit,
                roi: parseFloat(roi),
                conversions: channelData.conversions,
                cpa: channelData.conversions > 0 ? (cost / channelData.conversions).toFixed(2) : 0
            };
        }

        // 获取归因数据
        _getAttributionData() {
            try {
                const data = localStorage.getItem('youdao_attribution');
                return data ? JSON.parse(data) : {};
            } catch (e) {
                return {};
            }
        }

        // 获取渠道报告
        getChannelReport() {
            const attribution = this._getAttributionData();
            const sessions = this._getSessions();
            
            // 按渠道分组
            const channels = {};
            
            // 统计会话
            sessions.forEach(session => {
                const channel = session.utm?.utm_source || session.referrer?.domain || 'direct';
                
                if (!channels[channel]) {
                    channels[channel] = {
                        name: channel,
                        sessions: 0,
                        conversions: 0,
                        value: 0,
                        bounceRate: 0
                    };
                }
                
                channels[channel].sessions++;
                
                if (session.pageViews === 1) {
                    channels[channel].bounceRate++;
                }
            });
            
            // 合并转化数据
            Object.keys(attribution).forEach(channel => {
                if (channels[channel]) {
                    channels[channel].value = attribution[channel].value;
                    channels[channel].conversions = attribution[channel].conversions;
                }
            });
            
            // 计算转化率
            Object.values(channels).forEach(ch => {
                ch.conversionRate = ch.sessions > 0 ? ((ch.conversions / ch.sessions) * 100).toFixed(2) : 0;
                ch.bounceRate = ch.sessions > 0 ? ((ch.bounceRate / ch.sessions) * 100).toFixed(2) : 0;
                ch.roi = ch.value > 0 && ChannelTrackingConfig.budgets[ch.name] > 0 
                    ? (((ch.value - ChannelTrackingConfig.budgets[ch.name]) / ChannelTrackingConfig.budgets[ch.name]) * 100).toFixed(2) 
                    : 0;
            });
            
            return Object.values(channels).sort((a, b) => b.value - a.value);
        }

        // 获取会话数据
        _getSessions() {
            try {
                const data = localStorage.getItem('youdao_sessions');
                return data ? JSON.parse(data) : [];
            } catch (e) {
                return [];
            }
        }

        // 生成UTM链接
        generateUTMLink(baseUrl, params) {
            const url = new URL(baseUrl);
            
            Object.keys(params).forEach(key => {
                if (params[key]) {
                    url.searchParams.set('utm_' + key, params[key]);
                }
            });
            
            return url.toString();
        }

        // 清除所有追踪数据
        clearAllData() {
            localStorage.removeItem('youdao_utm');
            localStorage.removeItem('youdao_referrer');
            localStorage.removeItem('youdao_direct');
            localStorage.removeItem('youdao_session_id');
            localStorage.removeItem('youdao_sessions');
            localStorage.removeItem('youdao_conversions');
            localStorage.removeItem('youdao_attribution');
            sessionStorage.removeItem('youdao_utm');
            sessionStorage.removeItem('youdao_utm_timestamp');
            sessionStorage.removeItem('youdao_referrer');
            sessionStorage.removeItem('youdao_page_views');
            
            this.log('All tracking data cleared');
        }

        // 日志
        log() {
            console.log('[ChannelTracker]', Array.prototype.slice.call(arguments).join(' '));
        }
    }

    // 导出到全局
    window.ChannelTracker = {
        instance: null,
        
        init: function() {
            if (!this.instance) {
                this.instance = new ChannelTracker();
            }
            return this.instance;
        },
        
        getSessionInfo: function() {
            return this.init().getSessionInfo();
        },
        
        getChannelInfo: function() {
            return this.init().getChannelInfo();
        },
        
        recordConversion: function(type, value, orderId) {
            return this.init().recordConversion(type, value, orderId);
        },
        
        calculateROI: function(channel) {
            return this.init().calculateROI(channel);
        },
        
        getChannelReport: function() {
            return this.init().getChannelReport();
        },
        
        generateUTMLink: function(baseUrl, params) {
            return this.init().generateUTMLink(baseUrl, params);
        },
        
        clearAllData: function() {
            return this.init().clearAllData();
        }
    };

    // 自动初始化
    document.addEventListener('DOMContentLoaded', function() {
        ChannelTracker.init();
    });

})();
