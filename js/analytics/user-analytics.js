/**
 * 用户分析模块 - User Analytics
 * 负责用户画像、行为分析、留存分析、活跃度分析
 */

const UserAnalytics = {
    // 配置
    config: {
        apiEndpoint: '/api/analytics/user',
        cacheTime: 5 * 60 * 1000, // 5分钟缓存
        chartColors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
    },

    // 缓存
    cache: new Map(),

    /**
     * 初始化用户分析模块
     */
    init() {
        this.loadUserProfile();
        this.loadBehaviorData();
        this.loadRetentionData();
        this.loadActivityData();
        this.initCharts();
    },

    /**
     * 获取用户画像数据
     */
    async loadUserProfile() {
        const cacheKey = 'userProfile';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        // 模拟数据 - 实际应从API获取
        const profileData = {
            total: 12568,
            newToday: 156,
            active: 8942,
            totalGrowth: 15.8,
            newGrowth: 23.5,
            activeGrowth: 8.2,
            activeRate: 71.1,
            retentionRate: 68.5,
            demographics: {
                age: [
                    { label: '18-24岁', value: 22.5 },
                    { label: '25-34岁', value: 38.2 },
                    { label: '35-44岁', value: 25.3 },
                    { label: '45岁以上', value: 14.0 }
                ],
                gender: [
                    { label: '男', value: 45.2 },
                    { label: '女', value: 54.8 }
                ],
                region: [
                    { label: '一线城市', value: 35.6 },
                    { label: '二线城市', value: 42.3 },
                    { label: '三线及以下', value: 22.1 }
                ],
                interest: [
                    { label: '历史文化', value: 42.5 },
                    { label: '自然风光', value: 38.2 },
                    { label: '美食探店', value: 35.8 },
                    { label: '户外探险', value: 28.6 },
                    { label: '亲子游', value: 22.3 },
                    { label: '城市观光', value: 45.2 }
                ]
            },
            devices: [
                { label: 'iOS', value: 52.3 },
                { label: 'Android', value: 38.6 },
                { label: 'Web', value: 9.1 }
            ]
        };

        this.setCache(cacheKey, profileData);
        this.renderUserProfile(profileData);
        return profileData;
    },

    /**
     * 获取用户行为数据
     */
    async loadBehaviorData() {
        const cacheKey = 'behaviorData';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const behaviorData = {
            dailyActive: this.generateDailyData(30, 2800, 4500),
            sessionAvg: 18.5,
            sessionGrowth: 12.3,
            pageViews: {
                labels: this.generateDateLabels(30),
                data: this.generateDailyData(30, 45000, 85000)
            },
            topActions: [
                { action: '浏览路线', count: 156230, percentage: 35.2 },
                { action: '搜索目的地', count: 98230, percentage: 22.1 },
                { action: '查看导游', count: 75680, percentage: 17.0 },
                { action: '收藏路线', count: 45620, percentage: 10.3 },
                { action: '分享内容', count: 32150, percentage: 7.2 },
                { action: '提交订单', count: 28560, percentage: 6.4 },
                { action: '撰写评价', count: 12560, percentage: 2.8 }
            ],
            funnel: [
                { stage: '访问', count: 125680, rate: 100 },
                { stage: '浏览路线', count: 89650, rate: 71.3 },
                { stage: '加入收藏', count: 35620, rate: 28.3 },
                { stage: '提交订单', count: 12560, rate: 10.0 },
                { stage: '完成支付', count: 11580, rate: 9.2 }
            ],
            peakHours: [
                { hour: '00', visits: 1200 },
                { hour: '01', visits: 800 },
                { hour: '02', visits: 500 },
                { hour: '03', visits: 300 },
                { hour: '04', visits: 200 },
                { hour: '05', visits: 400 },
                { hour: '06', visits: 1200 },
                { hour: '07', visits: 3500 },
                { hour: '08', visits: 6800 },
                { hour: '09', visits: 8500 },
                { hour: '10', visits: 9200 },
                { hour: '11', visits: 8800 },
                { hour: '12', visits: 6500 },
                { hour: '13', visits: 7200 },
                { hour: '14', visits: 8500 },
                { hour: '15', visits: 8900 },
                { hour: '16', visits: 8200 },
                { hour: '17', visits: 7800 },
                { hour: '18', visits: 6200 },
                { hour: '19', visits: 7500 },
                { hour: '20', visits: 8800 },
                { hour: '21', visits: 9200 },
                { hour: '22', visits: 7500 },
                { hour: '23', visits: 4500 }
            ]
        };

        this.setCache(cacheKey, behaviorData);
        this.renderBehaviorData(behaviorData);
        return behaviorData;
    },

    /**
     * 获取留存数据
     */
    async loadRetentionData() {
        const cacheKey = 'retentionData';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const retentionData = {
            daily: [
                { day: '次日', rate: 68.5, cohort: 1856 },
                { day: '3日', rate: 52.3, cohort: 1423 },
                { day: '7日', rate: 42.1, cohort: 1156 },
                { day: '14日', rate: 35.8, cohort: 986 },
                { day: '30日', rate: 28.5, cohort: 785 }
            ],
            weekly: [
                { week: '第1周', rate: 68.5, newUsers: 1856 },
                { week: '第2周', rate: 52.3, newUsers: 1652 },
                { week: '第3周', rate: 48.5, newUsers: 1789 },
                { week: '第4周', rate: 45.2, newUsers: 1923 }
            ],
            monthly: [
                { month: '1月', rate: 72.5, newUsers: 2156 },
                { month: '2月', rate: 68.3, newUsers: 1856 },
                { month: '3月', rate: 65.2, newUsers: 2234 },
                { month: '4月', rate: 62.8, newUsers: 2568 },
                { month: '5月', rate: 58.5, newUsers: 2890 },
                { month: '6月', rate: 55.2, newUsers: 3125 }
            ],
            churn: {
                rate: 3.2,
                trend: -0.5,
                atRisk: 856,
                lost: 423
            }
        };

        this.setCache(cacheKey, retentionData);
        this.renderRetentionData(retentionData);
        return retentionData;
    },

    /**
     * 获取活跃度数据
     */
    async loadActivityData() {
        const cacheKey = 'activityData';
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        const activityData = {
            distribution: [
                { type: '高度活跃', count: 3568, percentage: 28.4, color: '#10B981' },
                { type: '中度活跃', count: 5234, percentage: 41.6, color: '#667eea' },
                { type: '轻度活跃', count: 2856, percentage: 22.7, color: '#F59E0B' },
                { type: '沉默用户', count: 910, percentage: 7.3, color: '#EF4444' }
            ],
            engagement: {
                dau: 8942,
                wau: 15680,
                mau: 38560,
                dauGrowth: 8.2,
                wauGrowth: 12.5,
                mauGrowth: 18.6
            },
            frequency: [
                { range: '1次/周', count: 5234, percentage: 41.6 },
                { range: '2-3次/周', count: 3568, percentage: 28.4 },
                { range: '4-5次/周', count: 1856, percentage: 14.8 },
                { range: '5次以上/周', count: 1712, percentage: 13.6 },
                { range: '1次/月', count: 198, percentage: 1.6 }
            ],
            features: [
                { feature: '路线浏览', usage: 95.2, avgTime: '8.5分钟' },
                { feature: '导游搜索', usage: 82.5, avgTime: '5.2分钟' },
                { feature: '订单预订', usage: 68.9, avgTime: '12.3分钟' },
                { feature: '评价撰写', usage: 45.6, avgTime: '3.5分钟' },
                { feature: '社区互动', usage: 32.8, avgTime: '15.6分钟' }
            ]
        };

        this.setCache(cacheKey, activityData);
        this.renderActivityData(activityData);
        return activityData;
    },

    /**
     * 初始化图表
     */
    initCharts() {
        this.charts = {};
    },

    /**
     * 渲染用户画像
     */
    renderUserProfile(data) {
        // 更新统计卡片
        this.updateStatCard('totalUsers', data.total);
        this.updateStatCard('newUsers', data.newToday);
        this.updateStatCard('activeUsers', data.active);
        this.updateStatCard('activeRate', data.activeRate + '%');

        // 渲染用户画像图表
        this.renderDemographicsChart(data.demographics);
        this.renderDeviceChart(data.devices);
    },

    /**
     * 渲染行为数据
     */
    renderBehaviorData(data) {
        this.renderUserGrowthChart(data.dailyActive);
        this.renderActionChart(data.topActions);
        this.renderFunnelChart(data.funnel);
        this.renderHourlyChart(data.peakHours);
    },

    /**
     * 渲染留存数据
     */
    renderRetentionData(data) {
        this.renderRetentionChart(data.daily);
        this.renderCohortChart(data.weekly);
    },

    /**
     * 渲染活跃度数据
     */
    renderActivityData(data) {
        this.renderActivityDistribution(data.distribution);
        this.renderEngagementMetrics(data.engagement);
        this.renderFeatureUsage(data.features);
    },

    /**
     * 渲染用户增长图表
     */
    renderUserGrowthChart(data) {
        const ctx = document.getElementById('userGrowthChart');
        if (!ctx) return;

        if (this.charts.userGrowth) {
            this.charts.userGrowth.destroy();
        }

        this.charts.userGrowth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateDateLabels(data.length || 30),
                datasets: [{
                    label: '用户增长',
                    data: data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: this.getLineChartOptions()
        });
    },

    /**
     * 渲染用户活跃度图表
     */
    renderActivityDistribution(data) {
        const ctx = document.getElementById('userActivityChart');
        if (!ctx) return;

        if (this.charts.activity) {
            this.charts.activity.destroy();
        }

        this.charts.activity = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.type),
                datasets: [{
                    data: data.map(d => d.count),
                    backgroundColor: data.map(d => d.color)
                }]
            },
            options: this.getDoughnutOptions()
        });
    },

    /**
     * 渲染用户来源图表
     */
    renderDeviceChart(data) {
        const ctx = document.getElementById('userSourceChart');
        if (!ctx) return;

        if (this.charts.source) {
            this.charts.source.destroy();
        }

        this.charts.source = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    data: data.map(d => d.value),
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb']
                }]
            },
            options: this.getPieOptions()
        });
    },

    /**
     * 渲染留存率图表
     */
    renderRetentionChart(data) {
        const ctx = document.getElementById('retentionChart');
        if (!ctx) return;

        if (this.charts.retention) {
            this.charts.retention.destroy();
        }

        this.charts.retention = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.day),
                datasets: [{
                    label: '留存率(%)',
                    data: data.map(d => d.rate),
                    backgroundColor: '#667eea'
                }]
            },
            options: this.getBarChartOptions()
        });
    },

    /**
     * 渲染漏斗图
     */
    renderFunnelChart(data) {
        const ctx = document.getElementById('conversionFunnelChart');
        if (!ctx) return;

        if (this.charts.funnel) {
            this.charts.funnel.destroy();
        }

        this.charts.funnel = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.stage),
                datasets: [{
                    label: '用户数',
                    data: data.map(d => d.count),
                    backgroundColor: [
                        '#667eea', '#764ba2', '#a855f7', '#d946ef', '#ec4899'
                    ]
                }]
            },
            options: {
                ...this.getBarChartOptions(),
                indexAxis: 'y'
            }
        });
    },

    /**
     * 渲染用户画像饼图
     */
    renderDemographicsChart(demographics) {
        // 年龄分布
        const ageCtx = document.getElementById('ageDistributionChart');
        if (ageCtx) {
            if (this.charts.age) this.charts.age.destroy();
            this.charts.age = new Chart(ageCtx, {
                type: 'pie',
                data: {
                    labels: demographics.age.map(d => d.label),
                    datasets: [{
                        data: demographics.age.map(d => d.value),
                        backgroundColor: this.config.chartColors
                    }]
                },
                options: this.getPieOptions()
            });
        }

        // 性别分布
        const genderCtx = document.getElementById('genderDistributionChart');
        if (genderCtx) {
            if (this.charts.gender) this.charts.gender.destroy();
            this.charts.gender = new Chart(genderCtx, {
                type: 'doughnut',
                data: {
                    labels: demographics.gender.map(d => d.label),
                    datasets: [{
                        data: demographics.gender.map(d => d.value),
                        backgroundColor: ['#667eea', '#f093fb']
                    }]
                },
                options: this.getDoughnutOptions()
            });
        }
    },

    /**
     * 渲染功能使用率
     */
    renderFeatureUsage(data) {
        const ctx = document.getElementById('featureUsageChart');
        if (!ctx) return;

        if (this.charts.feature) {
            this.charts.feature.destroy();
        }

        this.charts.feature = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.map(d => d.feature),
                datasets: [{
                    label: '使用率(%)',
                    data: data.map(d => d.usage),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.2)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    },

    /**
     * 渲染Cohort分析
     */
    renderCohortChart(data) {
        const ctx = document.getElementById('cohortChart');
        if (!ctx) return;

        if (this.charts.cohort) {
            this.charts.cohort.destroy();
        }

        this.charts.cohort = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.week),
                datasets: [{
                    label: '留存率(%)',
                    data: data.map(d => d.rate),
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: this.getLineChartOptions()
        });
    },

    /**
     * 渲染行为分析
     */
    renderActionChart(data) {
        const ctx = document.getElementById('actionDistributionChart');
        if (!ctx) return;

        if (this.charts.action) {
            this.charts.action.destroy();
        }

        this.charts.action = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.action),
                datasets: [{
                    label: '次数',
                    data: data.map(d => d.count),
                    backgroundColor: this.config.chartColors
                }]
            },
            options: this.getBarChartOptions()
        });
    },

    /**
     * 渲染小时分布
     */
    renderHourlyChart(data) {
        const ctx = document.getElementById('hourlyActivityChart');
        if (!ctx) return;

        if (this.charts.hourly) {
            this.charts.hourly.destroy();
        }

        this.charts.hourly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.hour + ':00'),
                datasets: [{
                    label: '访问量',
                    data: data.map(d => d.visits),
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                ...this.getBarChartOptions(),
                plugins: {
                    legend: { display: false }
                }
            }
        });
    },

    /**
     * 渲染参与度指标
     */
    renderEngagementMetrics(data) {
        const container = document.getElementById('engagementMetrics');
        if (!container) return;

        container.innerHTML = `
            <div class="engagement-card">
                <div class="engagement-value">${this.formatNumber(data.dau)}</div>
                <div class="engagement-label">日活用户(DAU)</div>
                <div class="engagement-trend ${data.dauGrowth >= 0 ? 'up' : 'down'}">
                    ${data.dauGrowth >= 0 ? '↑' : '↓'} ${Math.abs(data.dauGrowth)}%
                </div>
            </div>
            <div class="engagement-card">
                <div class="engagement-value">${this.formatNumber(data.wau)}</div>
                <div class="engagement-label">周活用户(WAU)</div>
                <div class="engagement-trend ${data.wauGrowth >= 0 ? 'up' : 'down'}">
                    ${data.wauGrowth >= 0 ? '↑' : '↓'} ${Math.abs(data.wauGrowth)}%
                </div>
            </div>
            <div class="engagement-card">
                <div class="engagement-value">${this.formatNumber(data.mau)}</div>
                <div class="engagement-label">月活用户(MAU)</div>
                <div class="engagement-trend ${data.mauGrowth >= 0 ? 'up' : 'down'}">
                    ${data.mauGrowth >= 0 ? '↑' : '↓'} ${Math.abs(data.mauGrowth)}%
                </div>
            </div>
            <div class="engagement-card">
                <div class="engagement-value">${(data.dau / data.mau * 100).toFixed(1)}%</div>
                <div class="engagement-label">DAU/MAU比率</div>
                <div class="engagement-trend ${data.dauGrowth >= 0 ? 'up' : 'down'}">
                    活跃度指数
                </div>
            </div>
        `;
    },

    /**
     * 导出用户数据
     */
    async exportUserData(format = 'excel') {
        const data = {
            profile: await this.loadUserProfile(),
            behavior: await this.loadBehaviorData(),
            retention: await this.loadRetentionData(),
            activity: await this.loadActivityData()
        };

        return this.exportData(data, 'user_analytics', format);
    },

    // ========== 工具方法 ==========

    updateStatCard(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = typeof value === 'number' ? this.formatNumber(value) : value;
        }
    },

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

    getLineChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        };
    },

    getBarChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        };
    },

    getPieOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        };
    },

    getDoughnutOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            cutout: '60%'
        };
    },

    exportData(data, filename, format) {
        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            this.downloadBlob(blob, `${filename}.json`);
        } else if (format === 'csv') {
            const csv = this.jsonToCSV(data);
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
            this.downloadBlob(blob, `${filename}.csv`);
        } else {
            // Excel格式 (实际上是CSV带BOM)
            const csv = this.jsonToCSV(data);
            const blob = new Blob(['\ufeff' + csv], { type: 'application/vnd.ms-excel' });
            this.downloadBlob(blob, `${filename}.xls`);
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
window.UserAnalytics = UserAnalytics;
