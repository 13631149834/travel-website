/**
 * 运营分析模块 - Operation Analytics
 * 负责活动效果、优惠券使用、推广渠道、ROI分析
 */

const OperationAnalytics = {
    // 配置
    config: {
        apiEndpoint: '/api/analytics/operation',
        cacheTime: 5 * 60 * 1000,
        chartColors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7']
    },

    // 缓存
    cache: new Map(),

    /**
     * 初始化运营分析模块
     */
    init() {
        this.loadActivityData();
        this.loadCouponData();
        this.loadChannelData();
        this.loadROIData();
        this.initCharts();
    },

    /**
     * 获取活动数据
     */
    async loadActivityData() {
        const cacheKey = 'activityData';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const activityData = {
            summary: {
                totalActivities: 85,
                ongoing: 12,
                totalBudget: 2580000,
                totalRevenue: 5680000,
                totalROI: 120.2,
                avgParticipation: 8560
            },
            activeCampaigns: [
                {
                    id: 1,
                    name: '暑期亲子游特惠',
                    type: 'discount',
                    startDate: '2024-07-01',
                    endDate: '2024-08-31',
                    budget: 350000,
                    spent: 185000,
                    revenue: 568000,
                    participants: 12560,
                    conversions: 856,
                    roi: 207.0
                },
                {
                    id: 2,
                    name: '新用户首单立减',
                    type: 'cashback',
                    startDate: '2024-06-01',
                    endDate: '2024-12-31',
                    budget: 500000,
                    spent: 156000,
                    revenue: 892000,
                    participants: 15680,
                    conversions: 5680,
                    roi: 472.0
                },
                {
                    id: 3,
                    name: '会员日专属福利',
                    type: 'points',
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    budget: 200000,
                    spent: 125000,
                    revenue: 456000,
                    participants: 8560,
                    conversions: 3256,
                    roi: 265.0
                },
                {
                    id: 4,
                    name: '邀请好友返现',
                    type: 'referral',
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    budget: 300000,
                    spent: 98600,
                    revenue: 325600,
                    participants: 5680,
                    conversions: 1568,
                    roi: 230.0
                },
                {
                    id: 5,
                    name: '节日限定活动',
                    type: 'seasonal',
                    startDate: '2024-06-01',
                    endDate: '2024-06-30',
                    budget: 150000,
                    spent: 128000,
                    revenue: 285600,
                    participants: 8560,
                    conversions: 1256,
                    roi: 123.0
                }
            ],
            byType: [
                { type: '折扣优惠', activities: 28, avgROI: 185.5 },
                { type: '返现活动', activities: 22, avgROI: 245.2 },
                { type: '积分奖励', activities: 18, avgROI: 165.8 },
                { type: '邀请有礼', activities: 12, avgROI: 198.5 },
                { type: '节日活动', activities: 5, avgROI: 135.2 }
            ],
            timeline: [
                { month: '1月', activities: 8, revenue: 425600, roi: 115.5 },
                { month: '2月', activities: 12, revenue: 568000, roi: 128.6 },
                { month: '3月', activities: 6, revenue: 356200, roi: 98.5 },
                { month: '4月', activities: 9, revenue: 425800, roi: 112.3 },
                { month: '5月', activities: 15, revenue: 586000, roi: 145.8 },
                { month: '6月', activities: 18, revenue: 685000, roi: 156.2 },
                { month: '7月', activities: 17, revenue: 785600, roi: 168.5 }
            ],
            effects: {
                userAcquisition: 25680,
                retention: 15.8,
                engagement: 32.5,
                revenue: 5680000
            }
        };

        this.setCache(cacheKey, activityData);
        this.renderActivityData(activityData);
        return activityData;
    },

    /**
     * 获取优惠券数据
     */
    async loadCouponData() {
        const cacheKey = 'couponData';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const couponData = {
            summary: {
                totalIssued: 568000,
                totalUsed: 125680,
                totalDiscount: 5680000,
                usageRate: 22.1,
                avgDiscount: 45.2,
                avgOrder: 251.5,
                ROI: 8.5
            },
            byType: [
                { type: '满减券', issued: 256000, used: 68500, rate: 26.8, avgDiscount: 28.5 },
                { type: '折扣券', issued: 185000, used: 35800, rate: 19.4, avgDiscount: 35.2 },
                { type: '立减券', issued: 85000, used: 15280, rate: 18.0, avgDiscount: 15.8 },
                { type: '新用户券', issued: 42000, used: 6100, rate: 14.5, avgDiscount: 58.6 }
            ],
            usage: {
                labels: this.generateDateLabels(30),
                issued: this.generateDailyData(30, 15000, 25000),
                used: this.generateDailyData(30, 3500, 5500)
            },
            topCoupons: [
                { name: '新人首单100元券', issued: 42000, used: 6100, rate: 14.5, revenue: 1856000 },
                { name: '满500减80', issued: 85600, used: 22850, rate: 26.7, revenue: 1256800 },
                { name: '满300减50', issued: 125600, used: 32850, rate: 26.1, revenue: 985000 },
                { name: '8折优惠券', issued: 98500, used: 18560, rate: 18.8, revenue: 856200 },
                { name: '周末专属85折', issued: 56500, used: 8560, rate: 15.2, revenue: 425800 },
                { name: '会员专享95折', issued: 45800, used: 6850, rate: 15.0, revenue: 285600 },
                { name: '节日特惠立减50', issued: 38500, used: 4520, rate: 11.7, revenue: 225600 },
                { name: '亲子游专属9折', issued: 28500, used: 3580, rate: 12.6, revenue: 185600 }
            ],
            byUserSegment: [
                { segment: '新用户', issued: 125000, used: 28500, rate: 22.8 },
                { segment: '活跃用户', issued: 285000, used: 72500, rate: 25.4 },
                { segment: '沉默用户', issued: 98500, used: 15680, rate: 15.9 },
                { segment: '流失用户', issued: 59500, used: 9000, rate: 15.1 }
            ],
            conversion: {
                viewed: 568000,
                clicked: 285600,
                claimed: 185600,
                used: 125680,
                rates: { viewToClick: 50.3, clickToClaim: 65.0, claimToUse: 67.7 }
            }
        };

        this.setCache(cacheKey, couponData);
        this.renderCouponData(couponData);
        return couponData;
    },

    /**
     * 获取渠道数据
     */
    async loadChannelData() {
        const cacheKey = 'channelData';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const channelData = {
            summary: {
                totalSpend: 1256000,
                totalUsers: 85680,
                totalRevenue: 5680000,
                overallROI: 352.2,
                avgCPA: 14.66,
                avgLTV: 66.32
            },
            channels: [
                {
                    name: '微信朋友圈广告',
                    spend: 356000,
                    users: 28560,
                    revenue: 1256800,
                    roi: 253.0,
                    cpa: 12.46,
                    ltv: 44.0,
                    impressions: 5680000,
                    clicks: 285600,
                    ctr: 5.03
                },
                {
                    name: '抖音信息流',
                    spend: 285000,
                    users: 22850,
                    revenue: 985600,
                    roi: 245.8,
                    cpa: 12.47,
                    ltv: 43.1,
                    impressions: 8560000,
                    clicks: 425600,
                    ctr: 4.97
                },
                {
                    name: '小红书KOL',
                    spend: 198000,
                    users: 15680,
                    revenue: 856000,
                    roi: 332.3,
                    cpa: 12.63,
                    ltv: 54.6,
                    impressions: 2850000,
                    clicks: 185600,
                    ctr: 6.51
                },
                {
                    name: '百度搜索推广',
                    spend: 165000,
                    users: 9850,
                    revenue: 568000,
                    roi: 244.2,
                    cpa: 16.75,
                    ltv: 57.7,
                    impressions: 3250000,
                    clicks: 156200,
                    ctr: 4.81
                },
                {
                    name: '微博粉丝通',
                    spend: 98500,
                    users: 5680,
                    revenue: 285600,
                    roi: 190.0,
                    cpa: 17.34,
                    ltv: 50.3,
                    impressions: 1850000,
                    clicks: 92500,
                    ctr: 5.0
                },
                {
                    name: 'APP应用市场',
                    spend: 78500,
                    users: 3560,
                    revenue: 185600,
                    roi: 136.4,
                    cpa: 22.05,
                    ltv: 52.1,
                    impressions: 1250000,
                    clicks: 62500,
                    ctr: 5.0
                }
            ],
            byTime: [
                { week: '第1周', wechat: 85600, tiktok: 68500, xiaohongshu: 45600, baidu: 28500 },
                { week: '第2周', wechat: 92500, tiktok: 72500, xiaohongshu: 48500, baidu: 32500 },
                { week: '第3周', wechat: 98500, tiktok: 78500, xiaohongshu: 52800, baidu: 35600 },
                { week: '第4周', wechat: 105600, tiktok: 85600, xiaohongshu: 56800, baidu: 38500 }
            ],
            attribution: {
                firstTouch: 45.2,
                lastTouch: 32.5,
                linear: 22.3
            },
            performance: {
                bestChannel: '小红书KOL',
                bestROI: 332.3,
                lowestCPA: '微信朋友圈广告',
                lowestCPAValue: 12.46,
                highestLTV: '百度搜索推广',
                highestLTVValue: 57.7
            }
        };

        this.setCache(cacheKey, channelData);
        this.renderChannelData(channelData);
        return channelData;
    },

    /**
     * 获取ROI数据
     */
    async loadROIData() {
        const cacheKey = 'roiData';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const roiData = {
            summary: {
                totalInvestment: 2580000,
                totalReturn: 9865000,
                overallROI: 282.4,
                avgROI: 185.6,
                paybackPeriod: 45,
                ltv: 68.5
            },
            byCategory: [
                { category: '广告投放', investment: 1256000, return: 4568000, roi: 263.7, users: 85680 },
                { category: '活动运营', investment: 580000, return: 2856000, roi: 392.4, users: 56800 },
                { category: '用户补贴', investment: 450000, return: 1680000, roi: 273.3, users: 85680 },
                { category: '内容营销', investment: 195000, return: 568000, roi: 191.3, users: 42500 },
                { category: '渠道合作', investment: 98000, return: 185000, roi: 88.8, users: 12560 }
            ],
            timeline: [
                { month: '1月', investment: 385000, return: 985600, roi: 156.0 },
                { month: '2月', investment: 425000, return: 1256800, roi: 195.7 },
                { month: '3月', investment: 285000, return: 856000, roi: 200.4 },
                { month: '4月', investment: 325000, return: 986500, roi: 203.5 },
                { month: '5月', investment: 365000, return: 1256000, roi: 244.1 },
                { month: '6月', investment: 425000, return: 1568000, roi: 268.9 },
                { month: '7月', investment: 385000, return: 1485600, roi: 285.9 }
            ],
            byProduct: [
                { product: '北京故宫一日游', investment: 156000, return: 568000, roi: 264.1 },
                { product: '杭州西湖两日游', investment: 125000, return: 425600, roi: 240.5 },
                { product: '张家界探险游', investment: 98500, return: 325600, roi: 230.6 },
                { product: '丽江古城游', investment: 85600, return: 285600, roi: 233.6 },
                { product: '上海外滩夜游', investment: 65800, return: 185600, roi: 182.1 }
            ],
            ltvAnalysis: {
                cohort: [
                    { month: '1月', users: 8560, ltv1: 45.2, ltv3: 68.5, ltv6: 85.2, ltv12: 95.6 },
                    { month: '2月', users: 9250, ltv1: 48.5, ltv3: 72.1, ltv6: 88.5, ltv12: 0 },
                    { month: '3月', users: 8650, ltv1: 52.3, ltv3: 78.5, ltv6: 92.1, ltv12: 0 },
                    { month: '4月', users: 9250, ltv1: 55.6, ltv3: 82.3, ltv6: 0, ltv12: 0 },
                    { month: '5月', users: 10250, ltv1: 58.2, ltv3: 85.6, ltv6: 0, ltv12: 0 },
                    { month: '6月', users: 11560, ltv1: 62.5, ltv3: 0, ltv6: 0, ltv12: 0 }
                ],
                avgLTV: 68.5,
                avgPayback: 45
            }
        };

        this.setCache(cacheKey, roiData);
        this.renderROIData(roiData);
        return roiData;
    },

    /**
     * 初始化图表
     */
    initCharts() {
        this.charts = {};
    },

    /**
     * 渲染活动数据
     */
    renderActivityData(data) {
        this.renderActivityTrendChart(data.timeline);
        this.renderActivityTypeChart(data.byType);
    },

    /**
     * 渲染优惠券数据
     */
    renderCouponData(data) {
        this.renderCouponUsageChart(data.usage);
        this.renderCouponTypeChart(data.byType);
        this.renderCouponConversionChart(data.conversion);
    },

    /**
     * 渲染渠道数据
     */
    renderChannelData(data) {
        this.renderChannelCompareChart(data.channels);
        this.renderChannelTrendChart(data.byTime);
    },

    /**
     * 渲染ROI数据
     */
    renderROIData(data) {
        this.renderROITimelineChart(data.timeline);
        this.renderROICategoryChart(data.byCategory);
        this.renderLTVChart(data.ltvAnalysis);
    },

    /**
     * 渲染活动趋势图
     */
    renderActivityTrendChart(data) {
        const ctx = document.getElementById('activityTrendChart');
        if (!ctx) return;

        if (this.charts.activityTrend) {
            this.charts.activityTrend.destroy();
        }

        this.charts.activityTrend = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.month),
                datasets: [{
                    label: '营收(万元)',
                    data: data.map(d => d.revenue / 10000),
                    backgroundColor: '#667eea'
                }, {
                    label: 'ROI(%)',
                    data: data.map(d => d.roi),
                    type: 'line',
                    borderColor: '#10B981',
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    /**
     * 渲染活动类型图
     */
    renderActivityTypeChart(data) {
        const ctx = document.getElementById('activityTypeChart');
        if (!ctx) return;

        if (this.charts.activityType) {
            this.charts.activityType.destroy();
        }

        this.charts.activityType = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(d => d.type),
                datasets: [{
                    data: data.map(d => d.activities),
                    backgroundColor: this.config.chartColors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    /**
     * 渲染优惠券使用趋势图
     */
    renderCouponUsageChart(data) {
        const ctx = document.getElementById('couponUsageChart');
        if (!ctx) return;

        if (this.charts.couponUsage) {
            this.charts.couponUsage.destroy();
        }

        this.charts.couponUsage = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '发放量',
                    data: data.issued,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true
                }, {
                    label: '使用量',
                    data: data.used,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    /**
     * 渲染优惠券类型图
     */
    renderCouponTypeChart(data) {
        const ctx = document.getElementById('couponTypeChart');
        if (!ctx) return;

        if (this.charts.couponType) {
            this.charts.couponType.destroy();
        }

        this.charts.couponType = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.type),
                datasets: [{
                    label: '使用率(%)',
                    data: data.map(d => d.rate),
                    backgroundColor: this.config.chartColors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    },

    /**
     * 渲染优惠券转化漏斗
     */
    renderCouponConversionChart(data) {
        const ctx = document.getElementById('couponConversionChart');
        if (!ctx) return;

        if (this.charts.couponConversion) {
            this.charts.couponConversion.destroy();
        }

        this.charts.couponConversion = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['浏览', '点击', '领取', '使用'],
                datasets: [{
                    data: [data.viewed, data.clicked, data.claimed, data.used],
                    backgroundColor: ['#667eea', '#764ba2', '#a855f7', '#10B981']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } }
            }
        });
    },

    /**
     * 渲染渠道对比图
     */
    renderChannelCompareChart(data) {
        const ctx = document.getElementById('channelCompareChart');
        if (!ctx) return;

        if (this.charts.channelCompare) {
            this.charts.channelCompare.destroy();
        }

        this.charts.channelCompare = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    label: 'ROI(%)',
                    data: data.map(d => d.roi),
                    backgroundColor: this.config.chartColors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } }
            }
        });
    },

    /**
     * 渲染渠道趋势图
     */
    renderChannelTrendChart(data) {
        const ctx = document.getElementById('channelTrendChart');
        if (!ctx) return;

        if (this.charts.channelTrend) {
            this.charts.channelTrend.destroy();
        }

        this.charts.channelTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.week),
                datasets: [{
                    label: '微信',
                    data: data.map(d => d.wechat),
                    borderColor: '#10B981',
                    tension: 0.4
                }, {
                    label: '抖音',
                    data: data.map(d => d.tiktok),
                    borderColor: '#667eea',
                    tension: 0.4
                }, {
                    label: '小红书',
                    data: data.map(d => d.xiaohongshu),
                    borderColor: '#f5576c',
                    tension: 0.4
                }, {
                    label: '百度',
                    data: data.map(d => d.baidu),
                    borderColor: '#764ba2',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    /**
     * 渲染ROI趋势图
     */
    renderROITimelineChart(data) {
        const ctx = document.getElementById('roiTrendChart');
        if (!ctx) return;

        if (this.charts.roiTrend) {
            this.charts.roiTrend.destroy();
        }

        this.charts.roiTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.month),
                datasets: [{
                    label: '投入(万元)',
                    data: data.map(d => d.investment / 10000),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true
                }, {
                    label: '产出(万元)',
                    data: data.map(d => d.return / 10000),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    /**
     * 渲染ROI分类图
     */
    renderROICategoryChart(data) {
        const ctx = document.getElementById('roiCategoryChart');
        if (!ctx) return;

        if (this.charts.roiCategory) {
            this.charts.roiCategory.destroy();
        }

        this.charts.roiCategory = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.category),
                datasets: [{
                    label: 'ROI(%)',
                    data: data.map(d => d.roi),
                    backgroundColor: this.config.chartColors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    },

    /**
     * 渲染LTV图
     */
    renderLTVChart(data) {
        const ctx = document.getElementById('ltvChart');
        if (!ctx) return;

        if (this.charts.ltv) {
            this.charts.ltv.destroy();
        }

        const recentCohorts = data.cohort.filter(c => c.ltv3 > 0);
        this.charts.ltv = new Chart(ctx, {
            type: 'line',
            data: {
                labels: recentCohorts.map(d => d.month),
                datasets: [{
                    label: 'LTV 1月',
                    data: recentCohorts.map(d => d.ltv1),
                    borderColor: '#667eea',
                    tension: 0.4
                }, {
                    label: 'LTV 3月',
                    data: recentCohorts.map(d => d.ltv3),
                    borderColor: '#10B981',
                    tension: 0.4
                }, {
                    label: 'LTV 6月',
                    data: recentCohorts.map(d => d.ltv6),
                    borderColor: '#f5576c',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    /**
     * 导出运营数据
     */
    async exportOperationData(format = 'excel') {
        const data = {
            activities: await this.loadActivityData(),
            coupons: await this.loadCouponData(),
            channels: await this.loadChannelData(),
            roi: await this.loadROIData()
        };

        return this.exportData(data, 'operation_analytics', format);
    },

    // ========== 工具方法 ==========

    formatNumber(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toLocaleString();
    },

    formatCurrency(num) {
        return '¥' + this.formatNumber(num);
    },

    generateDateLabels(days) {
        const labels = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
        }
        return labels;
    },

    generateDailyData(days, min, max) {
        const data = [];
        for (let i = 0; i < days; i++) {
            data.push(Math.floor(Math.random() * (max - min) + min));
        }
        return data;
    },

    isCacheValid(key) {
        const cached = this.cache.get(key);
        return cached && (Date.now() - cached.timestamp < this.config.cacheTime);
    },

    setCache(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    },

    exportData(data, filename, format) {
        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            this.downloadBlob(blob, `${filename}.json`);
        } else {
            const csv = this.jsonToCSV(data);
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
            this.downloadBlob(blob, `${filename}.csv`);
        }
        return true;
    },

    jsonToCSV(data) {
        const rows = [];
        const flatten = (obj, prefix = '') => {
            for (const key in obj) {
                const value = obj[key];
                const newKey = prefix ? `${prefix}_${key}` : key;
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    flatten(value, newKey);
                } else {
                    rows.push([newKey, JSON.stringify(value)]);
                }
            }
        };
        flatten(data);
        return rows.map(row => row.join(',')).join('\n');
    },

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// 导出模块
window.OperationAnalytics = OperationAnalytics;
