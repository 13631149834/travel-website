/**
 * 业务分析模块 - Business Analytics
 * 负责订单分析、转化漏斗、营收分析、导游分析
 */

const BusinessAnalytics = {
    // 配置
    config: {
        apiEndpoint: '/api/analytics/business',
        cacheTime: 5 * 60 * 1000,
        chartColors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7']
    },

    // 缓存
    cache: new Map(),

    /**
     * 初始化业务分析模块
     */
    init() {
        this.loadOrderData();
        this.loadRevenueData();
        this.loadGuideData();
        this.loadConversionData();
        this.initCharts();
    },

    /**
     * 获取订单数据
     */
    async loadOrderData() {
        const cacheKey = 'orderData';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const orderData = {
            summary: {
                totalOrders: 3568,
                totalGrowth: 22.5,
                pendingOrders: 156,
                pendingGrowth: -12.3,
                completedOrders: 3292,
                completedGrowth: 25.8,
                cancelledOrders: 120,
                cancelledRate: 3.4
            },
            daily: {
                labels: this.generateDateLabels(30),
                orders: this.generateDailyData(30, 80, 180),
                revenue: this.generateDailyData(30, 15000, 45000)
            },
            status: [
                { status: '已完成', count: 3292, percentage: 92.3, color: '#10B981' },
                { status: '进行中', count: 156, percentage: 4.4, color: '#3B82F6' },
                { status: '待支付', count: 85, percentage: 2.4, color: '#F59E0B' },
                { status: '已取消', count: 35, percentage: 0.9, color: '#EF4444' }
            ],
            topProducts: [
                { name: '北京故宫深度一日游', orders: 568, revenue: 186432, growth: 35.2 },
                { name: '杭州西湖精华两日游', orders: 456, revenue: 259008, growth: 28.5 },
                { name: '张家界天门山探险', orders: 398, revenue: 159200, growth: 42.1 },
                { name: '丽江古城休闲游', orders: 356, revenue: 142400, growth: 22.8 },
                { name: '上海外滩夜游', orders: 298, revenue: 74500, growth: 15.6 }
            ],
            paymentMethods: [
                { method: '微信支付', count: 1856, percentage: 52.0 },
                { method: '支付宝', count: 1423, percentage: 39.9 },
                { method: '银行卡', count: 245, percentage: 6.9 },
                { method: '其他', count: 44, percentage: 1.2 }
            ],
            avgOrderValue: 251,
            avgOrderGrowth: 15.8,
            completionRate: 92.3,
            refundRate: 4.5
        };

        this.setCache(cacheKey, orderData);
        this.renderOrderData(orderData);
        return orderData;
    },

    /**
     * 获取营收数据
     */
    async loadRevenueData() {
        const cacheKey = 'revenueData';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const revenueData = {
            summary: {
                totalRevenue: 896000,
                revenueGrowth: 35.8,
                avgDaily: 29867,
                avgGrowth: 28.5,
                grossProfit: 358400,
                profitMargin: 40.0,
                profitGrowth: 42.3
            },
            monthly: [
                { month: '1月', revenue: 125600, profit: 50240 },
                { month: '2月', revenue: 156800, profit: 62720 },
                { month: '3月', revenue: 89200, profit: 35680 },
                { month: '4月', revenue: 98600, profit: 39440 },
                { month: '5月', revenue: 145600, profit: 58240 },
                { month: '6月', revenue: 168000, profit: 67200 },
                { month: '7月', revenue: 112400, profit: 44960 }
            ],
            breakdown: [
                { category: '路线预订', amount: 568000, percentage: 63.4 },
                { category: '导游服务', amount: 198000, percentage: 22.1 },
                { category: '门票代购', amount: 86000, percentage: 9.6 },
                { category: '增值服务', amount: 44000, percentage: 4.9 }
            ],
            trends: this.generateDailyData(30, 25000, 50000),
            forecast: {
                nextMonth: 185000,
                confidence: 0.85,
                trend: 'up'
            },
            comparisons: {
                vsLastMonth: 18.5,
                vsLastYear: 65.2,
                vsTarget: 102.3
            }
        };

        this.setCache(cacheKey, revenueData);
        this.renderRevenueData(revenueData);
        return revenueData;
    },

    /**
     * 获取导游数据
     */
    async loadGuideData() {
        const cacheKey = 'guideData';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const guideData = {
            summary: {
                totalGuides: 856,
                totalGrowth: 12.3,
                activeGuides: 728,
                activeRate: 85.0,
                avgRating: 4.8,
                avgRatingGrowth: 0.2,
                totalServices: 12568,
                serviceGrowth: 28.5,
                totalIncome: 452000,
                incomeGrowth: 32.1
            },
            ratingDistribution: [
                { rating: '5星', count: 4256, percentage: 33.9 },
                { rating: '4星', count: 5212, percentage: 41.5 },
                { rating: '3星', count: 1865, percentage: 14.8 },
                { rating: '2星', count: 856, percentage: 6.8 },
                { rating: '1星', count: 379, percentage: 3.0 }
            ],
            expertiseDistribution: [
                { type: '历史文化', count: 285, percentage: 33.3 },
                { type: '自然风光', count: 268, percentage: 31.3 },
                { type: '美食探店', count: 156, percentage: 18.2 },
                { type: '户外探险', count: 98, percentage: 11.5 },
                { type: '亲子游', count: 49, percentage: 5.7 }
            ],
            regionDistribution: [
                { region: '北京', count: 186, revenue: 98560 },
                { region: '上海', count: 165, revenue: 89650 },
                { region: '杭州', count: 128, revenue: 68230 },
                { region: '成都', count: 115, revenue: 58920 },
                { region: '云南', count: 98, revenue: 52450 },
                { region: '其他', count: 164, revenue: 84190 }
            ],
            topGuides: [
                { name: '李明', specialty: '历史文化', region: '北京', rating: 4.9, services: 568, income: 28400, avatar: '👨‍🏫' },
                { name: '张伟', specialty: '美食探店', region: '成都', rating: 4.8, services: 512, income: 25600, avatar: '👨‍🍳' },
                { name: '王芳', specialty: '户外探险', region: '云南', rating: 4.8, services: 456, income: 22800, avatar: '👩‍🦯' },
                { name: '刘涛', specialty: '城市观光', region: '上海', rating: 4.7, services: 398, income: 19900, avatar: '👨‍💼' },
                { name: '陈静', specialty: '亲子游', region: '杭州', rating: 4.7, services: 365, income: 18250, avatar: '👩‍🏫' }
            ],
            performance: {
                avgResponseTime: 15.6,
                avgServiceTime: 4.5,
                repeatRate: 42.5,
                recommendRate: 89.2
            }
        };

        this.setCache(cacheKey, guideData);
        this.renderGuideData(guideData);
        return guideData;
    },

    /**
     * 获取转化数据
     */
    async loadConversionData() {
        const cacheKey = 'conversionData';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const conversionData = {
            funnel: [
                { stage: '页面访问', count: 125680, rate: 100, dropoff: 0 },
                { stage: '路线浏览', count: 89650, rate: 71.3, dropoff: 28.7 },
                { stage: '详情查看', count: 56230, rate: 44.7, dropoff: 26.6 },
                { stage: '加入购物车', count: 35620, rate: 28.3, dropoff: 16.4 },
                { stage: '提交订单', count: 12560, rate: 10.0, dropoff: 18.3 },
                { stage: '完成支付', count: 11580, rate: 9.2, dropoff: 0.8 }
            ],
            overall: {
                rate: 9.2,
                avgTime: 8.5,
                bestChannel: 'APP',
                bestProduct: '北京故宫深度一日游'
            },
            byChannel: [
                { channel: 'APP', rate: 12.5, volume: 56800 },
                { channel: '小程序', rate: 10.8, volume: 35200 },
                { channel: 'H5', rate: 8.2, volume: 28500 },
                { channel: '公众号', rate: 6.5, volume: 5180 }
            ],
            byProduct: [
                { product: '北京故宫深度一日游', rate: 15.8, volume: 568 },
                { product: '杭州西湖精华两日游', rate: 14.2, volume: 456 },
                { product: '张家界天门山探险', rate: 12.5, volume: 398 },
                { product: '丽江古城休闲游', rate: 11.8, volume: 356 },
                { product: '上海外滩夜游', rate: 10.2, volume: 298 }
            ],
            byTime: [
                { period: '周末', rate: 12.5, volume: 8560 },
                { period: '工作日', rate: 7.8, volume: 12560 },
                { period: '节假日', rate: 15.2, volume: 4560 }
            ]
        };

        this.setCache(cacheKey, conversionData);
        this.renderConversionData(conversionData);
        return conversionData;
    },

    /**
     * 初始化图表
     */
    initCharts() {
        this.charts = {};
    },

    /**
     * 渲染订单数据
     */
    renderOrderData(data) {
        this.renderOrderTrendChart(data.daily);
        this.renderOrderStatusChart(data.status);
        this.renderPaymentMethodChart(data.paymentMethods);
    },

    /**
     * 渲染营收数据
     */
    renderRevenueData(data) {
        this.renderRevenueTrendChart(data.monthly);
        this.renderRevenueBreakdownChart(data.breakdown);
        this.renderRevenueForecast(data.forecast);
    },

    /**
     * 渲染导游数据
     */
    renderGuideData(data) {
        this.renderGuideRatingChart(data.ratingDistribution);
        this.renderGuideExpertiseChart(data.expertiseDistribution);
        this.renderGuideRegionChart(data.regionDistribution);
    },

    /**
     * 渲染转化数据
     */
    renderConversionData(data) {
        this.renderConversionFunnelChart(data.funnel);
        this.renderChannelConversionChart(data.byChannel);
    },

    /**
     * 渲染订单趋势图
     */
    renderOrderTrendChart(data) {
        const ctx = document.getElementById('orderVolumeChart');
        if (!ctx) return;

        if (this.charts.orderTrend) {
            this.charts.orderTrend.destroy();
        }

        this.charts.orderTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '订单量',
                    data: data.orders,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                }, {
                    label: '销售额(百元)',
                    data: data.revenue.map(v => v / 100),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: '订单量' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: '销售额(百元)' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    },

    /**
     * 渲染订单状态图
     */
    renderOrderStatusChart(data) {
        const ctx = document.getElementById('orderStatusChart');
        if (!ctx) return;

        if (this.charts.orderStatus) {
            this.charts.orderStatus.destroy();
        }

        this.charts.orderStatus = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.status),
                datasets: [{
                    data: data.map(d => d.count),
                    backgroundColor: data.map(d => d.color)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },

    /**
     * 渲染支付方式图
     */
    renderPaymentMethodChart(data) {
        const ctx = document.getElementById('paymentMethodChart');
        if (!ctx) return;

        if (this.charts.payment) {
            this.charts.payment.destroy();
        }

        this.charts.payment = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(d => d.method),
                datasets: [{
                    data: data.map(d => d.percentage),
                    backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#6B7280']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },

    /**
     * 渲染营收趋势图
     */
    renderRevenueTrendChart(data) {
        const ctx = document.getElementById('salesRevenueChart');
        if (!ctx) return;

        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        this.charts.revenue = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.month),
                datasets: [{
                    label: '营收(万元)',
                    data: data.map(d => d.revenue / 10000),
                    backgroundColor: '#667eea'
                }, {
                    label: '利润(万元)',
                    data: data.map(d => d.profit / 10000),
                    backgroundColor: '#10B981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },

    /**
     * 渲染营收构成图
     */
    renderRevenueBreakdownChart(data) {
        const ctx = document.getElementById('revenueBreakdownChart');
        if (!ctx) return;

        if (this.charts.breakdown) {
            this.charts.breakdown.destroy();
        }

        this.charts.breakdown = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(d => d.category),
                datasets: [{
                    data: data.map(d => d.amount),
                    backgroundColor: this.config.chartColors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },

    /**
     * 渲染营收预测
     */
    renderRevenueForecast(data) {
        const container = document.getElementById('revenueForecast');
        if (!container) return;

        container.innerHTML = `
            <div class="forecast-card">
                <div class="forecast-label">下月预测营收</div>
                <div class="forecast-value">¥${(data.nextMonth / 10000).toFixed(1)}万</div>
                <div class="forecast-confidence">置信度: ${(data.confidence * 100).toFixed(0)}%</div>
                <div class="forecast-trend ${data.trend}">
                    ${data.trend === 'up' ? '📈 上升趋势' : '📉 下降趋势'}
                </div>
            </div>
        `;
    },

    /**
     * 渲染导游评分分布
     */
    renderGuideRatingChart(data) {
        const ctx = document.getElementById('guideRatingChart');
        if (!ctx) return;

        if (this.charts.guideRating) {
            this.charts.guideRating.destroy();
        }

        this.charts.guideRating = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.rating),
                datasets: [{
                    label: '评价数量',
                    data: data.map(d => d.count),
                    backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#F97316', '#EF4444']
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
     * 渲染导游专业分布
     */
    renderGuideExpertiseChart(data) {
        const ctx = document.getElementById('guideExpertiseChart');
        if (!ctx) return;

        if (this.charts.expertise) {
            this.charts.expertise.destroy();
        }

        this.charts.expertise = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(d => d.type),
                datasets: [{
                    data: data.map(d => d.count),
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
     * 渲染导游地区分布
     */
    renderGuideRegionChart(data) {
        const ctx = document.getElementById('guideRegionChart');
        if (!ctx) return;

        if (this.charts.region) {
            this.charts.region.destroy();
        }

        this.charts.region = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.region),
                datasets: [{
                    label: '导游数量',
                    data: data.map(d => d.count),
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
     * 渲染转化漏斗图
     */
    renderConversionFunnelChart(data) {
        const ctx = document.getElementById('conversionFunnelChart');
        if (!ctx) return;

        if (this.charts.conversionFunnel) {
            this.charts.conversionFunnel.destroy();
        }

        this.charts.conversionFunnel = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.stage),
                datasets: [{
                    label: '用户数',
                    data: data.map(d => d.count),
                    backgroundColor: data.map((d, i) => {
                        const colors = ['#667eea', '#764ba2', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];
                        return colors[i % colors.length];
                    })
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
     * 渲染渠道转化图
     */
    renderChannelConversionChart(data) {
        const ctx = document.getElementById('channelConversionChart');
        if (!ctx) return;

        if (this.charts.channel) {
            this.charts.channel.destroy();
        }

        this.charts.channel = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.channel),
                datasets: [{
                    label: '转化率(%)',
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
     * 导出业务数据
     */
    async exportBusinessData(format = 'excel') {
        const data = {
            orders: await this.loadOrderData(),
            revenue: await this.loadRevenueData(),
            guides: await this.loadGuideData(),
            conversion: await this.loadConversionData()
        };

        return this.exportData(data, 'business_analytics', format);
    },

    // ========== 工具方法 ==========

    formatNumber(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toLocaleString();
    },

    formatCurrency(num) {
        return '¥' + (num / 10000).toFixed(1) + '万';
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
window.BusinessAnalytics = BusinessAnalytics;
