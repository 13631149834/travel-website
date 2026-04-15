/**
 * 内容分析模块 - Content Analytics
 * 负责页面访问、热门内容、搜索分析、分享分析
 */

const ContentAnalytics = {
    // 配置
    config: {
        apiEndpoint: '/api/analytics/content',
        cacheTime: 5 * 60 * 1000,
        chartColors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
    },

    // 缓存
    cache: new Map(),

    /**
     * 初始化内容分析模块
     */
    init() {
        this.loadPageAccessData();
        this.loadHotContentData();
        this.loadSearchData();
        this.loadShareData();
        this.initCharts();
    },

    /**
     * 获取页面访问数据
     */
    async loadPageAccessData() {
        const cacheKey = 'pageAccess';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const pageData = {
            summary: {
                totalPV: 1256800,
                totalUV: 385600,
                avgDuration: 8.5,
                bounceRate: 32.5,
                pvGrowth: 45.2,
                uvGrowth: 38.6
            },
            daily: {
                labels: this.generateDateLabels(30),
                pv: this.generateDailyData(30, 35000, 55000),
                uv: this.generateDailyData(30, 10000, 18000)
            },
            hourly: [
                { hour: '00', pv: 12000, uv: 5600 },
                { hour: '01', pv: 8500, uv: 4200 },
                { hour: '02', pv: 5200, uv: 2800 },
                { hour: '03', pv: 3500, uv: 1800 },
                { hour: '04', pv: 2800, uv: 1500 },
                { hour: '05', pv: 4200, uv: 2200 },
                { hour: '06', pv: 12500, uv: 6800 },
                { hour: '07', pv: 28500, uv: 12500 },
                { hour: '08', pv: 45000, uv: 18500 },
                { hour: '09', pv: 52000, uv: 22000 },
                { hour: '10', pv: 58000, uv: 25000 },
                { hour: '11', pv: 55000, uv: 23500 },
                { hour: '12', pv: 42000, uv: 18500 },
                { hour: '13', pv: 48000, uv: 21000 },
                { hour: '14', pv: 55000, uv: 24000 },
                { hour: '15', pv: 58000, uv: 25200 },
                { hour: '16', pv: 52000, uv: 22800 },
                { hour: '17', pv: 48000, uv: 20500 },
                { hour: '18', pv: 42000, uv: 18500 },
                { hour: '19', pv: 52000, uv: 22500 },
                { hour: '20', pv: 58000, uv: 24800 },
                { hour: '21', pv: 62000, uv: 26500 },
                { hour: '22', pv: 48000, uv: 20500 },
                { hour: '23', pv: 28000, uv: 12500 }
            ],
            topPages: [
                { page: '首页', pv: 256800, uv: 185600, avgDuration: '2.5分钟', bounceRate: '25.8%' },
                { page: '路线列表', pv: 186500, uv: 98600, avgDuration: '5.2分钟', bounceRate: '28.5%' },
                { page: '导游列表', pv: 156200, uv: 85600, avgDuration: '4.8分钟', bounceRate: '32.1%' },
                { page: '目的地', pv: 125600, uv: 72500, avgDuration: '6.5分钟', bounceRate: '35.2%' },
                { page: '活动页面', pv: 98600, uv: 56200, avgDuration: '3.2分钟', bounceRate: '38.6%' },
                { page: '游记分享', pv: 85600, uv: 48500, avgDuration: '8.5分钟', bounceRate: '42.3%' },
                { page: '个人中心', pv: 68500, uv: 42500, avgDuration: '2.8分钟', bounceRate: '45.2%' },
                { page: '订单确认', pv: 52500, uv: 35800, avgDuration: '3.5分钟', bounceRate: '12.5%' }
            ],
            deviceBreakdown: [
                { device: '移动端', pv: 856000, percentage: 68.1 },
                { device: 'PC端', pv: 285000, percentage: 22.7 },
                { device: '平板', pv: 115800, percentage: 9.2 }
            ],
            sourceBreakdown: [
                { source: '直接访问', count: 485600, percentage: 38.6 },
                { source: '搜索引擎', count: 356200, percentage: 28.3 },
                { source: '社交媒体', count: 225800, percentage: 18.0 },
                { source: '外部链接', count: 125600, percentage: 10.0 },
                { source: '广告投放', count: 63600, percentage: 5.1 }
            ]
        };

        this.setCache(cacheKey, pageData);
        this.renderPageAccessData(pageData);
        return pageData;
    },

    /**
     * 获取热门内容数据
     */
    async loadHotContentData() {
        const cacheKey = 'hotContent';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const contentData = {
            summary: {
                totalContent: 8560,
                newContent: 356,
                totalInteractions: 2568000,
                interactionGrowth: 68.5
            },
            routes: [
                { id: 1, title: '北京故宫深度一日游', category: '历史文化', region: '北京', views: 125600, likes: 5680, shares: 1256, bookings: 568, score: 98.5 },
                { id: 2, title: '杭州西湖精华两日游', category: '城市观光', region: '杭州', views: 98600, likes: 4560, shares: 986, bookings: 456, score: 95.2 },
                { id: 3, title: '张家界天门山探险', category: '户外探险', region: '张家界', views: 85600, likes: 3980, shares: 856, bookings: 398, score: 92.8 },
                { id: 4, title: '丽江古城休闲游', category: '休闲度假', region: '丽江', views: 72500, likes: 3560, shares: 725, bookings: 356, score: 91.5 },
                { id: 5, title: '上海外滩夜游', category: '城市观光', region: '上海', views: 68500, likes: 3280, shares: 685, bookings: 298, score: 89.2 },
                { id: 6, title: '成都熊猫基地探秘', category: '亲子游', region: '成都', views: 65200, likes: 3150, shares: 652, bookings: 285, score: 88.6 },
                { id: 7, title: '厦门鼓浪屿浪漫之旅', category: '休闲度假', region: '厦门', views: 62500, likes: 2980, shares: 625, bookings: 265, score: 87.5 },
                { id: 8, title: '西安兵马俑历史探访', category: '历史文化', region: '西安', views: 59800, likes: 2860, shares: 598, bookings: 245, score: 86.8 },
                { id: 9, title: '桂林漓江山水画中游', category: '自然风光', region: '桂林', views: 56500, likes: 2680, shares: 565, bookings: 225, score: 85.2 },
                { id: 10, title: '青岛海滨休闲游', category: '休闲度假', region: '青岛', views: 52800, likes: 2450, shares: 528, bookings: 198, score: 83.5 }
            ],
            guides: [
                { id: 1, name: '李明导游', specialty: '历史文化', region: '北京', views: 85600, followers: 12580, rating: 4.9, bookings: 568 },
                { id: 2, name: '张伟导游', specialty: '美食探店', region: '成都', views: 72500, followers: 9860, rating: 4.8, bookings: 512 },
                { id: 3, name: '王芳导游', specialty: '户外探险', region: '云南', views: 68500, followers: 8560, rating: 4.8, bookings: 456 },
                { id: 4, name: '刘涛导游', specialty: '城市观光', region: '上海', views: 62500, followers: 7250, rating: 4.7, bookings: 398 },
                { id: 5, name: '陈静导游', specialty: '亲子游', region: '杭州', views: 56800, followers: 6520, rating: 4.7, bookings: 365 }
            ],
            categories: [
                { name: '历史文化', content: 2560, growth: 45.2, engagement: 78.5 },
                { name: '城市观光', content: 1980, growth: 52.8, engagement: 82.3 },
                { name: '自然风光', content: 1650, growth: 38.6, engagement: 75.2 },
                { name: '休闲度假', content: 1250, growth: 65.2, engagement: 85.6 },
                { name: '户外探险', content: 620, growth: 85.6, engagement: 92.5 },
                { name: '亲子游', content: 500, growth: 72.3, engagement: 88.2 }
            ],
            trends: {
                rising: ['户外探险', '亲子游', '美食探店'],
                declining: ['商务出行', '会议团建']
            }
        };

        this.setCache(cacheKey, contentData);
        this.renderHotContentData(contentData);
        return contentData;
    },

    /**
     * 获取搜索数据
     */
    async loadSearchData() {
        const cacheKey = 'searchData';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const searchData = {
            summary: {
                totalSearches: 568000,
                searchUsers: 125600,
                avgSearchesPerUser: 4.5,
                searchGrowth: 38.5,
                zeroResultRate: 5.2,
                clickThroughRate: 68.5
            },
            topKeywords: [
                { keyword: '北京旅游', searches: 28560, ctr: 72.5, conversions: 1256 },
                { keyword: '故宫一日游', searches: 22850, ctr: 78.2, conversions: 986 },
                { keyword: '杭州西湖', searches: 19860, ctr: 75.8, conversions: 856 },
                { keyword: '张家界', searches: 18560, ctr: 68.5, conversions: 725 },
                { keyword: '丽江古城', searches: 16520, ctr: 65.2, conversions: 652 },
                { keyword: '上海外滩', searches: 15230, ctr: 82.5, conversions: 598 },
                { keyword: '成都美食', searches: 14560, ctr: 58.6, conversions: 525 },
                { keyword: '亲子游推荐', searches: 12850, ctr: 62.3, conversions: 486 },
                { keyword: '厦门鼓浪屿', searches: 11560, ctr: 68.2, conversions: 425 },
                { keyword: '西安兵马俑', searches: 10850, ctr: 72.8, conversions: 398 }
            ],
            hotDestinations: [
                { destination: '北京', searches: 85600, bookings: 3856, conversion: 4.5 },
                { destination: '杭州', searches: 72500, bookings: 2890, conversion: 4.0 },
                { destination: '成都', searches: 68500, bookings: 2568, conversion: 3.7 },
                { destination: '上海', searches: 65200, bookings: 2285, conversion: 3.5 },
                { destination: '云南', searches: 59800, bookings: 2156, conversion: 3.6 },
                { destination: '厦门', searches: 52500, bookings: 1856, conversion: 3.5 },
                { destination: '西安', searches: 48500, bookings: 1652, conversion: 3.4 },
                { destination: '张家界', searches: 45200, bookings: 1528, conversion: 3.4 },
                { destination: '青岛', searches: 42500, bookings: 1386, conversion: 3.3 },
                { destination: '桂林', searches: 39800, bookings: 1268, conversion: 3.2 }
            ],
            intentDistribution: [
                { intent: '游玩攻略', percentage: 35.2, searches: 199936 },
                { intent: '路线规划', percentage: 28.5, searches: 161880 },
                { intent: '导游预订', percentage: 18.6, searches: 105648 },
                { intent: '门票价格', percentage: 12.5, searches: 71000 },
                { intent: '美食推荐', percentage: 5.2, searches: 29536 }
            ],
            relatedSearches: [
                { query: '北京三日游', related: ['北京五日游', '北京自由行', '北京景点门票'] },
                { query: '杭州西湖', related: ['西湖周边住宿', '西湖一日游', '杭州美食'] },
                { query: '张家界旅游', related: ['天门山玻璃栈道', '张家界国家森林公园', '凤凰古城'] }
            ],
            trends: this.generateDailyData(30, 15000, 25000)
        };

        this.setCache(cacheKey, searchData);
        this.renderSearchData(searchData);
        return searchData;
    },

    /**
     * 获取分享数据
     */
    async loadShareData() {
        const cacheKey = 'shareData';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const shareData = {
            summary: {
                totalShares: 85600,
                totalClicks: 1256800,
                totalConversions: 18560,
                shareGrowth: 68.5,
                clickThroughRate: 14.7,
                conversionRate: 1.5
            },
            byPlatform: [
                { platform: '微信', shares: 35200, clicks: 568000, conversions: 8256, rate: 23.5 },
                { platform: '朋友圈', shares: 28500, clicks: 425600, conversions: 6850, rate: 24.0 },
                { platform: '微博', shares: 12500, clicks: 156200, conversions: 1856, rate: 14.8 },
                { platform: 'QQ', shares: 5600, clicks: 68200, conversions: 985, rate: 17.6 },
                { platform: '其他', shares: 3800, clicks: 38200, conversions: 613, rate: 16.1 }
            ],
            topContent: [
                { title: '北京故宫深度一日游', platform: '微信', shares: 2856, clicks: 42560, conversions: 568 },
                { title: '杭州西湖精华两日游', platform: '朋友圈', shares: 2285, clicks: 35860, conversions: 456 },
                { title: '张家界天门山探险', platform: '微博', shares: 1856, clicks: 25680, conversions: 398 },
                { title: '成都熊猫基地探秘', platform: '微信', shares: 1652, clicks: 22850, conversions: 285 },
                { title: '厦门鼓浪屿浪漫之旅', platform: '朋友圈', shares: 1425, clicks: 19850, conversions: 265 }
            ],
            byContentType: [
                { type: '路线分享', shares: 42560, percentage: 49.7, ctr: 15.2 },
                { type: '游记攻略', shares: 25600, percentage: 29.9, ctr: 18.5 },
                { type: '导游推荐', shares: 12500, percentage: 14.6, ctr: 12.8 },
                { type: '活动推广', shares: 4940, percentage: 5.8, ctr: 8.5 }
            ],
            timeline: this.generateDailyData(30, 2500, 3500)
        };

        this.setCache(cacheKey, shareData);
        this.renderShareData(shareData);
        return shareData;
    },

    /**
     * 初始化图表
     */
    initCharts() {
        this.charts = {};
    },

    /**
     * 渲染页面访问数据
     */
    renderPageAccessData(data) {
        this.renderPVUVChart(data.daily);
        this.renderHourlyChart(data.hourly);
        this.renderDeviceChart(data.deviceBreakdown);
        this.renderSourceChart(data.sourceBreakdown);
    },

    /**
     * 渲染热门内容数据
     */
    renderHotContentData(data) {
        this.renderCategoryChart(data.categories);
    },

    /**
     * 渲染搜索数据
     */
    renderSearchData(data) {
        this.renderSearchTrendChart(data.trends);
        this.renderIntentChart(data.intentDistribution);
    },

    /**
     * 渲染分享数据
     */
    renderShareData(data) {
        this.renderSharePlatformChart(data.byPlatform);
        this.renderShareTypeChart(data.byContentType);
    },

    /**
     * 渲染PV/UV图表
     */
    renderPVUVChart(data) {
        const ctx = document.getElementById('pvuvChart');
        if (!ctx) return;

        if (this.charts.pvuv) {
            this.charts.pvuv.destroy();
        }

        this.charts.pvuv = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'PV',
                    data: data.pv,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'UV',
                    data: data.uv,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
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
     * 渲染小时分布图
     */
    renderHourlyChart(data) {
        const ctx = document.getElementById('hourlyPageChart');
        if (!ctx) return;

        if (this.charts.hourly) {
            this.charts.hourly.destroy();
        }

        this.charts.hourly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.hour + ':00'),
                datasets: [{
                    label: 'PV',
                    data: data.map(d => d.pv),
                    backgroundColor: '#667eea'
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
     * 渲染设备分布图
     */
    renderDeviceChart(data) {
        const ctx = document.getElementById('deviceBreakdownChart');
        if (!ctx) return;

        if (this.charts.device) {
            this.charts.device.destroy();
        }

        this.charts.device = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.device),
                datasets: [{
                    data: data.map(d => d.percentage),
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    /**
     * 渲染来源分布图
     */
    renderSourceChart(data) {
        const ctx = document.getElementById('sourceBreakdownChart');
        if (!ctx) return;

        if (this.charts.source) {
            this.charts.source.destroy();
        }

        this.charts.source = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(d => d.source),
                datasets: [{
                    data: data.map(d => d.percentage),
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
     * 渲染分类图表
     */
    renderCategoryChart(data) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        if (this.charts.category) {
            this.charts.category.destroy();
        }

        this.charts.category = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    label: '内容量',
                    data: data.map(d => d.content / 100),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.2)'
                }, {
                    label: '互动率(%)',
                    data: data.map(d => d.engagement),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { r: { beginAtZero: true } }
            }
        });
    },

    /**
     * 渲染搜索趋势图
     */
    renderSearchTrendChart(data) {
        const ctx = document.getElementById('searchTrendChart');
        if (!ctx) return;

        if (this.charts.searchTrend) {
            this.charts.searchTrend.destroy();
        }

        this.charts.searchTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateDateLabels(data.length || 30),
                datasets: [{
                    label: '搜索量',
                    data: data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
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
     * 渲染搜索意图图
     */
    renderIntentChart(data) {
        const ctx = document.getElementById('searchIntentChart');
        if (!ctx) return;

        if (this.charts.intent) {
            this.charts.intent.destroy();
        }

        this.charts.intent = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(d => d.intent),
                datasets: [{
                    data: data.map(d => d.percentage),
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
     * 渲染分享平台图
     */
    renderSharePlatformChart(data) {
        const ctx = document.getElementById('sharePlatformChart');
        if (!ctx) return;

        if (this.charts.sharePlatform) {
            this.charts.sharePlatform.destroy();
        }

        this.charts.sharePlatform = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.platform),
                datasets: [{
                    label: '分享次数',
                    data: data.map(d => d.shares),
                    backgroundColor: '#667eea'
                }, {
                    label: '点击次数',
                    data: data.map(d => d.clicks / 10),
                    backgroundColor: '#10B981'
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
     * 渲染分享内容类型图
     */
    renderShareTypeChart(data) {
        const ctx = document.getElementById('shareTypeChart');
        if (!ctx) return;

        if (this.charts.shareType) {
            this.charts.shareType.destroy();
        }

        this.charts.shareType = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.type),
                datasets: [{
                    data: data.map(d => d.shares),
                    backgroundColor: this.config.chartColors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    /**
     * 导出内容数据
     */
    async exportContentData(format = 'excel') {
        const data = {
            pageAccess: await this.loadPageAccessData(),
            hotContent: await this.loadHotContentData(),
            search: await this.loadSearchData(),
            share: await this.loadShareData()
        };

        return this.exportData(data, 'content_analytics', format);
    },

    // ========== 工具方法 ==========

    formatNumber(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toLocaleString();
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
window.ContentAnalytics = ContentAnalytics;
