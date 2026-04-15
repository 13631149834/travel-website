/**
 * 游导旅游平台 - 数据分析报告系统
 * 包含运营报告、用户报告、业务报告、营销报告等功能
 */

// 报告配置
const ReportConfig = {
    apiBase: '/api/reports',
    exportFormats: ['excel', 'pdf', 'csv'],
    defaultPeriod: 'daily',
    autoSendEnabled: true
};

// 报告类型枚举
const ReportType = {
    OPERATION: 'operation',
    USER: 'user',
    BUSINESS: 'business',
    MARKETING: 'marketing'
};

// 报告周期枚举
const ReportPeriod = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
};

// 报告管理器类
class ReportManager {
    constructor() {
        this.charts = {};
        this.currentReportType = ReportType.OPERATION;
        this.currentPeriod = ReportPeriod.DAILY;
        this.dateRange = this.getDefaultDateRange();
        this.reportCache = new Map();
    }

    // 获取默认日期范围
    getDefaultDateRange() {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        return {
            start: this.formatDate(start),
            end: this.formatDate(end)
        };
    }

    // 格式化日期
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // 生成日报
    async generateDailyReport(date = new Date()) {
        const dateStr = this.formatDate(date);
        const reportData = {
            type: ReportType.OPERATION,
            period: ReportPeriod.DAILY,
            date: dateStr,
            generatedAt: new Date().toISOString(),
            summary: await this.getDailySummary(date),
            metrics: await this.getDailyMetrics(date),
            charts: await this.getDailyCharts(date),
            alerts: await this.getDailyAlerts(date)
        };
        
        this.reportCache.set(`daily_${dateStr}`, reportData);
        return reportData;
    }

    // 生成周报
    async generateWeeklyReport(startDate, endDate) {
        const reportData = {
            type: ReportType.OPERATION,
            period: ReportPeriod.WEEKLY,
            dateRange: { start: startDate, end: endDate },
            generatedAt: new Date().toISOString(),
            summary: await this.getWeeklySummary(startDate, endDate),
            metrics: await this.getWeeklyMetrics(startDate, endDate),
            trends: await this.getWeeklyTrends(startDate, endDate),
            comparisons: await this.compareWithPreviousPeriod(startDate, endDate),
            topPerformers: await this.getTopPerformers(startDate, endDate),
            issues: await this.getWeeklyIssues(startDate, endDate)
        };
        
        this.reportCache.set(`weekly_${startDate}_${endDate}`, reportData);
        return reportData;
    }

    // 生成月报
    async generateMonthlyReport(year, month) {
        const reportData = {
            type: ReportType.OPERATION,
            period: ReportPeriod.MONTHLY,
            year,
            month,
            generatedAt: new Date().toISOString(),
            summary: await this.getMonthlySummary(year, month),
            metrics: await this.getMonthlyMetrics(year, month),
            trends: await this.getMonthlyTrends(year, month),
            achievements: await this.getMonthlyAchievements(year, month),
            forecasts: await this.generateForecast(year, month),
            recommendations: await this.getMonthlyRecommendations(year, month)
        };
        
        this.reportCache.set(`monthly_${year}_${month}`, reportData);
        return reportData;
    }

    // 获取日汇总数据
    async getDailySummary(date) {
        return {
            totalOrders: Math.floor(Math.random() * 500) + 200,
            totalRevenue: Math.floor(Math.random() * 500000) + 100000,
            newUsers: Math.floor(Math.random() * 100) + 50,
            activeUsers: Math.floor(Math.random() * 2000) + 1000,
            avgRating: (4.5 + Math.random() * 0.5).toFixed(2),
            completionRate: (Math.random() * 20 + 80).toFixed(1)
        };
    }

    // 获取日指标数据
    async getDailyMetrics(date) {
        return {
            orders: {
                total: Math.floor(Math.random() * 500) + 200,
                completed: Math.floor(Math.random() * 400) + 150,
                pending: Math.floor(Math.random() * 50) + 20,
                cancelled: Math.floor(Math.random() * 30) + 10
            },
            revenue: {
                total: Math.floor(Math.random() * 500000) + 100000,
                avgOrderValue: Math.floor(Math.random() * 2000) + 500,
                refund: Math.floor(Math.random() * 20000) + 5000
            },
            users: {
                new: Math.floor(Math.random() * 100) + 50,
                active: Math.floor(Math.random() * 2000) + 1000,
                retained: Math.floor(Math.random() * 800) + 400
            },
            guides: {
                total: Math.floor(Math.random() * 100) + 50,
                online: Math.floor(Math.random() * 80) + 30,
                avgRating: (4.3 + Math.random() * 0.7).toFixed(2)
            }
        };
    }

    // 获取日图表数据
    async getDailyCharts(date) {
        const dateStr = this.formatDate(date);
        return {
            hourlyOrders: this.generateHourlyData(),
            orderStatus: this.generatePieData(['已完成', '进行中', '待确认', '已取消'], [45, 25, 20, 10]),
            revenueByCategory: this.generateBarData(['一日游', '多日游', '定制游', '团体游'], [30000, 50000, 40000, 20000]),
            userGrowth: this.generateLineData(7),
            topRoutes: this.generateTopRoutesData()
        };
    }

    // 获取日警报数据
    async getDailyAlerts(date) {
        return [
            {
                type: 'warning',
                category: '订单',
                message: '今日订单量较昨日下降15%',
                timestamp: new Date().toISOString()
            },
            {
                type: 'info',
                category: '导游',
                message: '3名导游即将达到月接单上限',
                timestamp: new Date().toISOString()
            },
            {
                type: 'success',
                category: '营收',
                message: '定制游收入突破历史新高',
                timestamp: new Date().toISOString()
            }
        ];
    }

    // 获取周汇总数据
    async getWeeklySummary(startDate, endDate) {
        return {
            totalOrders: Math.floor(Math.random() * 3000) + 1000,
            totalRevenue: Math.floor(Math.random() * 3000000) + 1000000,
            avgDailyOrders: Math.floor(Math.random() * 400) + 200,
            avgDailyRevenue: Math.floor(Math.random() * 400000) + 150000,
            userGrowth: (Math.random() * 30 + 10).toFixed(1),
            satisfactionRate: (Math.random() * 10 + 90).toFixed(1)
        };
    }

    // 获取周指标数据
    async getWeeklyMetrics(startDate, endDate) {
        return {
            orders: {
                total: Math.floor(Math.random() * 3000) + 1000,
                completed: Math.floor(Math.random() * 2500) + 800,
                cancelled: Math.floor(Math.random() * 200) + 50,
                cancelRate: (Math.random() * 5 + 2).toFixed(1)
            },
            revenue: {
                total: Math.floor(Math.random() * 3000000) + 1000000,
                avgOrderValue: Math.floor(Math.random() * 1800) + 600,
                refundRate: (Math.random() * 3 + 1).toFixed(1)
            },
            users: {
                new: Math.floor(Math.random() * 600) + 200,
                active: Math.floor(Math.random() * 10000) + 5000,
                retention: (Math.random() * 15 + 75).toFixed(1)
            },
            conversion: {
                visitToRegister: (Math.random() * 10 + 5).toFixed(1),
                registerToOrder: (Math.random() * 30 + 20).toFixed(1),
                orderToPay: (Math.random() * 20 + 70).toFixed(1)
            }
        };
    }

    // 获取周趋势数据
    async getWeeklyTrends(startDate, endDate) {
        return {
            orders: this.generateTrendData(7, 'up'),
            revenue: this.generateTrendData(7, 'up'),
            users: this.generateTrendData(7, 'up'),
            satisfaction: this.generateTrendData(7, 'stable')
        };
    }

    // 与上一周期对比
    async compareWithPreviousPeriod(startDate, endDate) {
        return {
            orders: { change: '+12.5%', trend: 'up' },
            revenue: { change: '+18.3%', trend: 'up' },
            users: { change: '+8.7%', trend: 'up' },
            satisfaction: { change: '+2.1%', trend: 'up' }
        };
    }

    // 获取表现最佳
    async getTopPerformers(startDate, endDate) {
        return {
            routes: [
                { name: '桂林山水一日游', orders: 156, revenue: 46800 },
                { name: '张家界玻璃桥两日游', orders: 134, revenue: 53600 },
                { name: '丽江古城深度游', orders: 98, revenue: 68600 },
                { name: '九寨沟三日游', orders: 87, revenue: 78300 },
                { name: '西湖文化之旅', orders: 76, revenue: 30400 }
            ],
            guides: [
                { name: '李导', orders: 45, rating: 4.9, revenue: 135000 },
                { name: '王导', orders: 42, rating: 4.8, revenue: 126000 },
                { name: '张导', orders: 38, rating: 4.9, revenue: 114000 }
            ]
        };
    }

    // 获取周问题数据
    async getWeeklyIssues(startDate, endDate) {
        return [
            { category: '服务', count: 15, description: '导游迟到投诉' },
            { category: '订单', count: 8, description: '退款纠纷' },
            { category: '体验', count: 12, description: '行程与描述不符' }
        ];
    }

    // 获取月汇总数据
    async getMonthlySummary(year, month) {
        return {
            totalOrders: Math.floor(Math.random() * 12000) + 5000,
            totalRevenue: Math.floor(Math.random() * 15000000) + 5000000,
            avgDailyOrders: Math.floor(Math.random() * 400) + 150,
            avgDailyRevenue: Math.floor(Math.random() * 500000) + 180000,
            userGrowth: (Math.random() * 40 + 15).toFixed(1),
            satisfaction: (Math.random() * 5 + 93).toFixed(1),
            targetAchievement: (Math.random() * 20 + 90).toFixed(1)
        };
    }

    // 获取月指标数据
    async getMonthlyMetrics(year, month) {
        return {
            orders: {
                total: Math.floor(Math.random() * 12000) + 5000,
                completed: Math.floor(Math.random() * 10000) + 4000,
                cancelled: Math.floor(Math.random() * 800) + 200,
                repeatRate: (Math.random() * 20 + 30).toFixed(1)
            },
            revenue: {
                total: Math.floor(Math.random() * 15000000) + 5000000,
                avgOrderValue: Math.floor(Math.random() * 1600) + 550,
                profit: Math.floor(Math.random() * 5000000) + 1500000
            },
            users: {
                new: Math.floor(Math.random() * 3000) + 1000,
                active: Math.floor(Math.random() * 50000) + 20000,
                vip: Math.floor(Math.random() * 500) + 200
            },
            marketing: {
                couponUsed: Math.floor(Math.random() * 5000) + 2000,
                referralOrders: Math.floor(Math.random() * 800) + 300,
                campaignROI: (Math.random() * 3 + 2).toFixed(2)
            }
        };
    }

    // 获取月趋势数据
    async getMonthlyTrends(year, month) {
        return {
            daily: this.generateTrendData(30, 'up'),
            weekly: this.generateTrendData(4, 'up'),
            hourly: this.generateHourlyData(),
            category: this.generatePieData(['一日游', '多日游', '定制游', '团体游'], [35, 30, 25, 10])
        };
    }

    // 获取月成就数据
    async getMonthlyAchievements(year, month) {
        return [
            { metric: '订单量', target: 10000, actual: 11500, achievement: 115 },
            { metric: '营收额', target: 10000000, actual: 12500000, achievement: 125 },
            { metric: '用户增长', target: 2000, actual: 2450, achievement: 122.5 },
            { metric: '满意度', target: 95, actual: 96.5, achievement: 101.6 }
        ];
    }

    // 生成预测数据
    async generateForecast(year, month) {
        return {
            nextMonth: {
                orders: Math.floor(Math.random() * 15000) + 8000,
                revenue: Math.floor(Math.random() * 20000000) + 8000000,
                users: Math.floor(Math.random() * 4000) + 1500
            },
            confidence: (Math.random() * 20 + 75).toFixed(1)
        };
    }

    // 获取月建议数据
    async getMonthlyRecommendations(year, month) {
        return [
            { priority: 'high', category: '运营', recommendation: '增加热门路线的导游配置' },
            { priority: 'medium', category: '营销', recommendation: '开展淡季促销活动' },
            { priority: 'low', category: '产品', recommendation: '优化定制游服务流程' }
        ];
    }

    // ==================== 用户报告 ====================

    // 生成用户增长报告
    async generateUserGrowthReport(dateRange) {
        return {
            type: 'user_growth',
            period: dateRange,
            summary: {
                totalUsers: Math.floor(Math.random() * 100000) + 50000,
                newUsers: Math.floor(Math.random() * 5000) + 2000,
                growthRate: (Math.random() * 15 + 5).toFixed(1),
                target: 100000
            },
            dailyNew: this.generateTrendData(30, 'up'),
            source: this.generatePieData(['自然流量', '搜索引擎', '社交媒体', '推荐', '广告'], [40, 25, 15, 12, 8]),
            demographics: {
                age: this.generatePieData(['18-25', '26-35', '36-45', '46-55', '55+'], [30, 40, 20, 7, 3]),
                gender: this.generatePieData(['男', '女'], [45, 55]),
                location: this.generateTopLocations()
            }
        };
    }

    // 生成用户活跃报告
    async generateUserActivityReport(dateRange) {
        return {
            type: 'user_activity',
            period: dateRange,
            summary: {
                dau: Math.floor(Math.random() * 10000) + 5000,
                mau: Math.floor(Math.random() * 50000) + 25000,
                dauMauRatio: (Math.random() * 10 + 15).toFixed(1),
                avgSessionDuration: Math.floor(Math.random() * 600) + 180
            },
            dailyActive: this.generateTrendData(30, 'stable'),
            sessionDistribution: this.generateBarData(['<1min', '1-5min', '5-15min', '15-30min', '>30min'], [15, 35, 30, 15, 5]),
            engagement: {
                dailyOpen: (Math.random() * 30 + 40).toFixed(1),
                weeklyOpen: (Math.random() * 50 + 70).toFixed(1),
                monthlyOpen: (Math.random() * 70 + 90).toFixed(1)
            }
        };
    }

    // 生成用户留存报告
    async generateUserRetentionReport(dateRange) {
        return {
            type: 'user_retention',
            period: dateRange,
            summary: {
                d1: (Math.random() * 30 + 40).toFixed(1),
                d7: (Math.random() * 15 + 20).toFixed(1),
                d30: (Math.random() * 8 + 10).toFixed(1),
                cohortRetention: this.generateCohortData()
            },
            churnRisk: {
                high: Math.floor(Math.random() * 500) + 200,
                medium: Math.floor(Math.random() * 1000) + 500,
                low: Math.floor(Math.random() * 2000) + 1000
            },
            recommendations: [
                '针对高流失风险用户推送专属优惠',
                '优化新手引导流程',
                '增加用户激励机制'
            ]
        };
    }

    // 生成用户画像报告
    async generateUserProfileReport() {
        return {
            type: 'user_profile',
            generatedAt: new Date().toISOString(),
            total: Math.floor(Math.random() * 100000) + 50000,
            segments: [
                { name: '高价值用户', count: Math.floor(Math.random() * 2000) + 1000, percentage: 3 },
                { name: '活跃用户', count: Math.floor(Math.random() * 10000) + 5000, percentage: 15 },
                { name: '普通用户', count: Math.floor(Math.random() * 40000) + 20000, percentage: 55 },
                { name: '沉睡用户', count: Math.floor(Math.random() * 20000) + 10000, percentage: 27 }
            ],
            preferences: {
                travelStyle: this.generatePieData(['亲子游', '情侣游', '朋友出游', '独自旅行', '团队游'], [30, 25, 20, 15, 10]),
                budget: this.generatePieData(['经济型', '舒适型', '品质型', '奢华型'], [25, 40, 25, 10]),
                duration: this.generatePieData(['当日往返', '1-3天', '4-7天', '7天以上'], [20, 45, 25, 10])
            },
            behavior: {
                avgBookingFrequency: (Math.random() * 3 + 1).toFixed(1),
                avgOrderValue: Math.floor(Math.random() * 2000) + 500,
                preferredPayment: this.generatePieData(['微信支付', '支付宝', '银行卡'], [60, 35, 5])
            }
        };
    }

    // ==================== 业务报告 ====================

    // 生成订单报告
    async generateOrderReport(dateRange) {
        return {
            type: 'order',
            period: dateRange,
            summary: {
                totalOrders: Math.floor(Math.random() * 5000) + 2000,
                completedOrders: Math.floor(Math.random() * 4000) + 1500,
                cancelledOrders: Math.floor(Math.random() * 300) + 100,
                completionRate: (Math.random() * 10 + 85).toFixed(1)
            },
            statusDistribution: this.generatePieData(['已完成', '进行中', '待确认', '已取消', '退款中'], [60, 15, 12, 8, 5]),
            trends: this.generateTrendData(30, 'up'),
            peakHours: this.generateBarData(['8:00', '10:00', '12:00', '14:00', '16:00', '18:00'], [20, 35, 25, 30, 25, 15]),
            topCategories: this.generateTopCategories()
        };
    }

    // 生成营收报告
    async generateRevenueReport(dateRange) {
        return {
            type: 'revenue',
            period: dateRange,
            summary: {
                totalRevenue: Math.floor(Math.random() * 5000000) + 2000000,
                totalProfit: Math.floor(Math.random() * 1500000) + 800000,
                profitMargin: (Math.random() * 15 + 25).toFixed(1),
                avgOrderValue: Math.floor(Math.random() * 1500) + 600
            },
            breakdown: {
                byCategory: this.generatePieData(['一日游', '多日游', '定制游', '团体游'], [35, 30, 25, 10]),
                byPayment: this.generatePieData(['微信支付', '支付宝', '银行卡'], [55, 40, 5])
            },
            trends: this.generateTrendData(30, 'up'),
            forecasts: {
                nextMonth: Math.floor(Math.random() * 6000000) + 2500000,
                confidence: 85
            }
        };
    }

    // 生成导游报告
    async generateGuideReport(dateRange) {
        return {
            type: 'guide',
            period: dateRange,
            summary: {
                totalGuides: Math.floor(Math.random() * 500) + 200,
                activeGuides: Math.floor(Math.random() * 400) + 150,
                avgRating: (4.5 + Math.random() * 0.4).toFixed(2),
                totalOrders: Math.floor(Math.random() * 3000) + 1000
            },
            ratingDistribution: this.generatePieData(['5星', '4星', '3星', '2星', '1星'], [65, 25, 7, 2, 1]),
            performance: {
                topEarners: this.generateTopGuides(),
                mostBooked: this.generateMostBookedGuides(),
                risingStars: this.generateRisingStars()
            },
            workload: {
                overloaded: Math.floor(Math.random() * 30) + 10,
                optimal: Math.floor(Math.random() * 100) + 50,
                underutilized: Math.floor(Math.random() * 50) + 20
            }
        };
    }

    // 生成路线报告
    async generateRouteReport(dateRange) {
        return {
            type: 'route',
            period: dateRange,
            summary: {
                totalRoutes: Math.floor(Math.random() * 300) + 100,
                activeRoutes: Math.floor(Math.random() * 200) + 80,
                totalBookings: Math.floor(Math.random() * 5000) + 2000,
                avgSatisfaction: (4.5 + Math.random() * 0.4).toFixed(2)
            },
            topRoutes: this.generateTopRoutes(),
            categoryPerformance: this.generateCategoryPerformance(),
            seasonality: this.generateSeasonalityData(),
            recommendations: [
                '增加热门路线库存',
                '优化冷门路线曝光',
                '开发季节性特色路线'
            ]
        };
    }

    // ==================== 营销报告 ====================

    // 生成活动报告
    async generateCampaignReport(dateRange) {
        return {
            type: 'campaign',
            period: dateRange,
            summary: {
                totalCampaigns: Math.floor(Math.random() * 20) + 10,
                activeCampaigns: Math.floor(Math.random() * 5) + 2,
                totalReach: Math.floor(Math.random() * 500000) + 200000,
                totalConversions: Math.floor(Math.random() * 5000) + 2000
            },
            campaigns: this.generateCampaigns(),
            channelPerformance: this.generateChannelPerformance(),
            roi: (Math.random() * 3 + 2).toFixed(2)
        };
    }

    // 生成渠道报告
    async generateChannelReport(dateRange) {
        return {
            type: 'channel',
            period: dateRange,
            summary: {
                totalChannels: 5,
                topChannel: '微信小程序',
                totalTraffic: Math.floor(Math.random() * 1000000) + 500000,
                totalConversions: Math.floor(Math.random() * 10000) + 5000
            },
            channels: [
                { name: '微信小程序', traffic: 450000, conversion: 3.5, revenue: 1500000 },
                { name: 'APP', traffic: 200000, conversion: 4.2, revenue: 800000 },
                { name: 'H5网站', traffic: 150000, conversion: 2.8, revenue: 420000 },
                { name: '第三方平台', traffic: 100000, conversion: 1.5, revenue: 150000 },
                { name: '线下渠道', traffic: 50000, conversion: 8.0, revenue: 400000 }
            ],
            recommendations: [
                '加强APP端的用户引导',
                '优化H5站点的加载速度',
                '扩展线下渠道合作'
            ]
        };
    }

    // 生成转化报告
    async generateConversionReport(dateRange) {
        return {
            type: 'conversion',
            period: dateRange,
            funnel: {
                visit: Math.floor(Math.random() * 100000) + 50000,
                register: Math.floor(Math.random() * 10000) + 5000,
                browse: Math.floor(Math.random() * 8000) + 4000,
                addCart: Math.floor(Math.random() * 3000) + 1500,
                order: Math.floor(Math.random() * 1500) + 800,
                pay: Math.floor(Math.random() * 1200) + 600
            },
            conversionRates: {
                visitToRegister: (Math.random() * 10 + 8).toFixed(1),
                registerToBrowse: (Math.random() * 20 + 70).toFixed(1),
                browseToOrder: (Math.random() * 15 + 15).toFixed(1),
                orderToPay: (Math.random() * 15 + 75).toFixed(1),
                overall: (Math.random() * 2 + 1).toFixed(1)
            },
            dropOffAnalysis: this.generateDropOffAnalysis(),
            optimizationSuggestions: [
                '简化注册流程',
                '优化商品详情页',
                '增加支付优惠'
            ]
        };
    }

    // 生成ROI报告
    async generateROIReport(dateRange) {
        return {
            type: 'roi',
            period: dateRange,
            summary: {
                totalInvestment: Math.floor(Math.random() * 500000) + 200000,
                totalReturn: Math.floor(Math.random() * 1500000) + 600000,
                overallROI: (Math.random() * 2 + 2).toFixed(2),
                breakEvenDays: Math.floor(Math.random() * 30) + 15
            },
            byChannel: this.generateChannelROI(),
            byCampaign: this.generateCampaignROI(),
            recommendations: [
                '加大高ROI渠道投入',
                '优化低效渠道策略',
                '测试新渠道效果'
            ]
        };
    }

    // ==================== 导出功能 ====================

    // 导出为Excel
    async exportToExcel(reportData, filename) {
        try {
            // 创建工作簿数据
            const workbook = this.createWorkbookStructure(reportData);
            
            // 模拟Excel生成
            const blob = new Blob([JSON.stringify(workbook)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            this.downloadFile(blob, `${filename}.xlsx`);
            
            return { success: true, message: 'Excel导出成功' };
        } catch (error) {
            return { success: false, message: 'Excel导出失败: ' + error.message };
        }
    }

    // 导出为PDF
    async exportToPDF(reportData, filename) {
        try {
            // 创建PDF内容
            const pdfContent = this.createPDFContent(reportData);
            
            const blob = new Blob([pdfContent], { type: 'application/pdf' });
            this.downloadFile(blob, `${filename}.pdf`);
            
            return { success: true, message: 'PDF导出成功' };
        } catch (error) {
            return { success: false, message: 'PDF导出失败: ' + error.message };
        }
    }

    // 导出为CSV
    async exportToCSV(reportData, filename) {
        try {
            const csvContent = this.convertToCSV(reportData);
            
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
            this.downloadFile(blob, `${filename}.csv`);
            
            return { success: true, message: 'CSV导出成功' };
        } catch (error) {
            return { success: false, message: 'CSV导出失败: ' + error.message };
        }
    }

    // 创建工作簿结构
    createWorkbookStructure(reportData) {
        const sheets = [];
        
        // 汇总表
        if (reportData.summary) {
            sheets.push({
                name: '汇总数据',
                data: this.objectToArray(reportData.summary)
            });
        }
        
        // 指标表
        if (reportData.metrics) {
            sheets.push({
                name: '详细指标',
                data: this.flattenObject(reportData.metrics)
            });
        }
        
        // 趋势数据
        if (reportData.trends) {
            sheets.push({
                name: '趋势数据',
                data: this.trendsToArray(reportData.trends)
            });
        }
        
        return { sheets };
    }

    // 对象转数组
    objectToArray(obj) {
        const result = [];
        for (const [key, value] of Object.entries(obj)) {
            result.push([this.formatKey(key), value]);
        }
        return result;
    }

    // 格式化键名
    formatKey(key) {
        return key.replace(/([A-Z])/g, '_$1').toUpperCase();
    }

    // 扁平化对象
    flattenObject(obj, prefix = '') {
        const result = [];
        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}_${key}` : key;
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                result.push(...this.flattenObject(value, newKey));
            } else {
                result.push([this.formatKey(newKey), value]);
            }
        }
        return result;
    }

    // 趋势数据转数组
    trendsToArray(trends) {
        const result = [];
        for (const [key, values] of Object.entries(trends)) {
            if (Array.isArray(values)) {
                result.push([this.formatKey(key), ...values.map(v => v.value || v)]);
            }
        }
        return result;
    }

    // 创建PDF内容
    createPDFContent(reportData) {
        let content = `游导旅游平台数据分析报告\n`;
        content += `生成时间: ${new Date().toLocaleString()}\n\n`;
        
        if (reportData.summary) {
            content += `【汇总数据】\n`;
            for (const [key, value] of Object.entries(reportData.summary)) {
                content += `${this.formatKey(key)}: ${value}\n`;
            }
        }
        
        return content;
    }

    // 转换为CSV
    convertToCSV(data) {
        const rows = [];
        this.parseCSVObject(data, rows);
        return rows.map(row => row.join(',')).join('\n');
    }

    parseCSVObject(obj, rows, prefix = '') {
        for (const [key, value] of Object.entries(obj)) {
            const header = prefix ? `${prefix}_${key}` : key;
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                this.parseCSVObject(value, rows, header);
            } else if (Array.isArray(value)) {
                rows.push([header, JSON.stringify(value)]);
            } else {
                rows.push([header, value]);
            }
        }
    }

    // 下载文件
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 导出图表为图片
    async exportChartAsImage(chartId, filename) {
        const chart = this.charts[chartId];
        if (!chart) {
            return { success: false, message: '图表不存在' };
        }
        
        try {
            const imageUrl = chart.toBase64Image();
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = `${filename}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            return { success: true, message: '图片导出成功' };
        } catch (error) {
            return { success: false, message: '图片导出失败' };
        }
    }

    // ==================== 自动发送功能 ====================

    // 设置定时发送任务
    scheduleReport(reportType, period, recipients) {
        const taskId = `report_${reportType}_${period}_${Date.now()}`;
        
        // 保存任务配置
        const task = {
            id: taskId,
            type: reportType,
            period,
            recipients,
            enabled: true,
            createdAt: new Date().toISOString()
        };
        
        // 存储到本地
        const tasks = JSON.parse(localStorage.getItem('reportTasks') || '[]');
        tasks.push(task);
        localStorage.setItem('reportTasks', JSON.stringify(tasks));
        
        // 设置定时器
        this.setupScheduler(task);
        
        return task;
    }

    // 设置调度器
    setupScheduler(task) {
        let cronExpression = '';
        
        switch (task.period) {
            case ReportPeriod.DAILY:
                cronExpression = '0 9 * * *'; // 每天9点
                break;
            case ReportPeriod.WEEKLY:
                cronExpression = '0 9 * * 1'; // 每周一9点
                break;
            case ReportPeriod.MONTHLY:
                cronExpression = '0 9 1 * *'; // 每月1号9点
                break;
        }
        
        // 模拟定时任务
        const checkAndSend = () => {
            if (!task.enabled) return;
            
            const now = new Date();
            const shouldSend = this.checkCronMatch(cronExpression, now);
            
            if (shouldSend) {
                this.sendScheduledReport(task);
            }
        };
        
        // 每分钟检查一次
        setInterval(checkAndSend, 60000);
    }

    // 检查Cron表达式匹配
    checkCronMatch(expression, date) {
        // 简化实现
        const hour = date.getHours();
        const day = date.getDate();
        const dayOfWeek = date.getDay();
        
        return hour === 9 && day === 1;
    }

    // 发送预定报告
    async sendScheduledReport(task) {
        let reportData;
        
        switch (task.type) {
            case ReportType.OPERATION:
                reportData = task.period === ReportPeriod.DAILY 
                    ? await this.generateDailyReport()
                    : task.period === ReportPeriod.WEEKLY
                        ? await this.generateWeeklyReport(this.dateRange.start, this.dateRange.end)
                        : await this.generateMonthlyReport(new Date().getFullYear(), new Date().getMonth() + 1);
                break;
            case ReportType.USER:
                reportData = await this.generateUserGrowthReport(this.dateRange);
                break;
            case ReportType.BUSINESS:
                reportData = await this.generateOrderReport(this.dateRange);
                break;
            case ReportType.MARKETING:
                reportData = await this.generateCampaignReport(this.dateRange);
                break;
        }
        
        // 模拟发送邮件
        console.log(`报告已发送给: ${task.recipients.join(', ')}`);
        console.log('报告数据:', reportData);
        
        return { success: true, message: '报告已发送' };
    }

    // 取消定时任务
    cancelScheduledTask(taskId) {
        const tasks = JSON.parse(localStorage.getItem('reportTasks') || '[]');
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].enabled = false;
            localStorage.setItem('reportTasks', JSON.stringify(tasks));
            return { success: true };
        }
        
        return { success: false, message: '任务不存在' };
    }

    // 获取所有定时任务
    getScheduledTasks() {
        return JSON.parse(localStorage.getItem('reportTasks') || '[]');
    }

    // ==================== 辅助方法 ====================

    // 生成小时数据
    generateHourlyData() {
        const hours = [];
        for (let i = 0; i < 24; i++) {
            hours.push({
                hour: `${i}:00`,
                value: Math.floor(Math.random() * 100) + 20
            });
        }
        return hours;
    }

    // 生成饼图数据
    generatePieData(labels, values) {
        return {
            labels,
            values,
            colors: this.generateColors(labels.length)
        };
    }

    // 生成柱状图数据
    generateBarData(labels, values) {
        return {
            labels,
            values,
            colors: this.generateColors(labels.length)
        };
    }

    // 生成折线图数据
    generateLineData(points) {
        const data = [];
        let value = Math.floor(Math.random() * 100) + 50;
        
        for (let i = 0; i < points; i++) {
            value += Math.floor(Math.random() * 20) - 8;
            value = Math.max(20, value);
            data.push({ date: this.getDateString(-points + i + 1), value });
        }
        
        return data;
    }

    // 生成趋势数据
    generateTrendData(points, trend) {
        const data = [];
        let baseValue = Math.floor(Math.random() * 100) + 50;
        
        for (let i = 0; i < points; i++) {
            let change = 0;
            
            switch (trend) {
                case 'up':
                    change = Math.floor(Math.random() * 15) + 3;
                    break;
                case 'down':
                    change = -Math.floor(Math.random() * 15) - 3;
                    break;
                case 'stable':
                    change = Math.floor(Math.random() * 10) - 5;
                    break;
            }
            
            baseValue = Math.max(10, baseValue + change);
            data.push({ date: this.getDateString(-points + i + 1), value: baseValue });
        }
        
        return data;
    }

    // 获取日期字符串
    getDateString(offset) {
        const date = new Date();
        date.setDate(date.getDate() + offset);
        return this.formatDate(date);
    }

    // 生成颜色数组
    generateColors(count) {
        const baseColors = [
            '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe',
            '#00f2fe', '#43e97b', '#38f9d7', '#ffecd2', '#fcb69f',
            '#a8edea', '#fed6e3', '#d299c2', '#fef9d7', '#89f7fe'
        ];
        
        return baseColors.slice(0, count);
    }

    // 生成热门路线数据
    generateTopRoutesData() {
        const routes = ['桂林山水一日游', '张家界两日游', '丽江古城游', '九寨沟三日游', '西湖文化之旅'];
        return routes.map(name => ({
            name,
            orders: Math.floor(Math.random() * 100) + 30,
            revenue: Math.floor(Math.random() * 50000) + 15000
        }));
    }

    // 生成热门地点
    generateTopLocations() {
        return [
            { name: '北京', value: Math.floor(Math.random() * 5000) + 2000 },
            { name: '上海', value: Math.floor(Math.random() * 4500) + 1800 },
            { name: '广州', value: Math.floor(Math.random() * 3500) + 1500 },
            { name: '深圳', value: Math.floor(Math.random() * 3000) + 1200 },
            { name: '成都', value: Math.floor(Math.random() * 2500) + 1000 }
        ];
    }

    // 生成队列数据
    generateCohortData() {
        const months = ['1月', '2月', '3月', '4月'];
        return months.map(month => ({
            month,
            retention: (Math.random() * 20 + 60).toFixed(1)
        }));
    }

    // 生成热门类别
    generateTopCategories() {
        return [
            { name: '一日游', orders: 1500, revenue: 450000 },
            { name: '多日游', orders: 1200, revenue: 600000 },
            { name: '定制游', orders: 800, revenue: 800000 },
            { name: '团体游', orders: 500, revenue: 350000 }
        ];
    }

    // 生成顶级导游
    generateTopGuides() {
        return [
            { name: '李导', orders: 150, revenue: 450000, rating: 4.9 },
            { name: '王导', orders: 140, revenue: 420000, rating: 4.8 },
            { name: '张导', orders: 130, revenue: 390000, rating: 4.9 }
        ];
    }

    // 生成最受欢迎导游
    generateMostBookedGuides() {
        return [
            { name: '李导', bookings: 200, completionRate: 98.5 },
            { name: '王导', bookings: 180, completionRate: 97.2 },
            { name: '张导', bookings: 165, completionRate: 99.1 }
        ];
    }

    // 生成新星导游
    generateRisingStars() {
        return [
            { name: '赵导', growth: '+45%', rating: 4.7 },
            { name: '刘导', growth: '+38%', rating: 4.6 },
            { name: '陈导', growth: '+32%', rating: 4.8 }
        ];
    }

    // 生成热门路线
    generateTopRoutes() {
        return [
            { name: '桂林山水一日游', bookings: 500, rating: 4.8, revenue: 150000 },
            { name: '张家界两日游', bookings: 450, rating: 4.7, revenue: 180000 },
            { name: '丽江古城游', bookings: 400, rating: 4.9, revenue: 200000 }
        ];
    }

    // 生成类别表现
    generateCategoryPerformance() {
        return [
            { category: '一日游', growth: '+15%', satisfaction: 4.6 },
            { category: '多日游', growth: '+22%', satisfaction: 4.8 },
            { category: '定制游', growth: '+35%', satisfaction: 4.9 },
            { category: '团体游', growth: '+8%', satisfaction: 4.5 }
        ];
    }

    // 生成季节性数据
    generateSeasonalityData() {
        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        return months.map(month => ({
            month,
            bookings: Math.floor(Math.random() * 500) + 100
        }));
    }

    // 生成活动
    generateCampaigns() {
        return [
            { name: '五一促销', status: '进行中', reach: 50000, conversions: 1200, roi: 3.5 },
            { name: '端午优惠', status: '预热', reach: 30000, conversions: 0, roi: 0 },
            { name: '会员日活动', status: '已结束', reach: 80000, conversions: 2500, roi: 4.2 }
        ];
    }

    // 生成渠道表现
    generateChannelPerformance() {
        return [
            { channel: '微信', reach: 200000, conversions: 5000, roi: 3.8 },
            { channel: 'APP', reach: 100000, conversions: 3500, roi: 4.2 },
            { channel: '搜索引擎', reach: 80000, conversions: 2000, roi: 2.8 }
        ];
    }

    // 生成流失分析
    generateDropOffAnalysis() {
        return [
            { stage: '浏览-加入购物车', dropRate: 45 },
            { stage: '加入购物车-提交订单', dropRate: 55 },
            { stage: '提交订单-支付', dropRate: 20 }
        ];
    }

    // 生成渠道ROI
    generateChannelROI() {
        return [
            { channel: '微信', investment: 100000, return: 350000, roi: 3.5 },
            { channel: 'APP', investment: 80000, return: 320000, roi: 4.0 },
            { channel: '搜索引擎', investment: 60000, return: 180000, roi: 3.0 }
        ];
    }

    // 生成活动ROI
    generateCampaignROI() {
        return [
            { name: '五一促销', investment: 50000, return: 175000, roi: 3.5 },
            { name: '会员日活动', investment: 30000, return: 126000, roi: 4.2 },
            { name: '新用户礼包', investment: 20000, return: 80000, roi: 4.0 }
        ];
    }

    // ==================== 图表渲染 ====================

    // 渲染订单趋势图
    renderOrderTrendChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        
        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: '订单量',
                    data: data.map(d => d.value),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' }
                }
            }
        });
    }

    // 渲染饼图
    renderPieChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        
        this.charts[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: data.colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // 渲染柱状图
    renderBarChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        
        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '数值',
                    data: data.values,
                    backgroundColor: data.colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // 销毁图表
    destroyChart(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    }

    // 销毁所有图表
    destroyAllCharts() {
        Object.keys(this.charts).forEach(id => this.destroyChart(id));
    }
}

// 导出报告管理器实例
window.ReportManager = new ReportManager();

// 报告辅助函数
const ReportHelpers = {
    // 格式化金额
    formatCurrency(value) {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY'
        }).format(value);
    },

    // 格式化数字
    formatNumber(value) {
        return new Intl.NumberFormat('zh-CN').format(value);
    },

    // 格式化百分比
    formatPercent(value) {
        return `${value}%`;
    },

    // 格式化时间戳
    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString('zh-CN');
    },

    // 获取趋势图标
    getTrendIcon(trend) {
        switch (trend) {
            case 'up': return '📈';
            case 'down': return '📉';
            default: return '➡️';
        }
    },

    // 获取状态颜色
    getStatusColor(status) {
        const colors = {
            'success': '#10B981',
            'warning': '#F59E0B',
            'danger': '#EF4444',
            'info': '#3B82F6'
        };
        return colors[status] || '#6B7280';
    }
};

// 导出辅助函数
window.ReportHelpers = ReportHelpers;
