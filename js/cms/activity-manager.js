/**
 * 活动管理系统 (Activity Manager)
 * 负责活动创建、配置、监控、效果分析
 */

const ActivityManager = (function() {
    'use strict';

    // 活动状态枚举
    const ActivityStatus = {
        DRAFT: 'draft',
        PENDING: 'pending',
        RUNNING: 'running',
        PAUSED: 'paused',
        ENDED: 'ended',
        CANCELLED: 'cancelled'
    };

    // 活动类型枚举
    const ActivityType = {
        PROMOTION: 'promotion',       // 促销活动
        CONTEST: 'contest',           // 竞赛活动
        GIVEAWAY: 'giveaway',         // 抽奖活动
        CHALLENGE: 'challenge',       // 挑战活动
        SEASONAL: 'seasonal',         // 季节性活动
        FESTIVAL: 'festival',         // 节日活动
        MEMBER: 'member'              // 会员专属
    };

    // 活动目标类型
    const GoalType = {
        REGISTRATION: 'registration',  // 参与人数
        PURCHASE: 'purchase',          // 购买转化
        ENGAGEMENT: 'engagement',       // 用户互动
        SHARING: 'sharing'              // 分享传播
    };

    // 存储键名
    const STORAGE_KEYS = {
        ACTIVITIES: 'activity_activities',
        PARTICIPANTS: 'activity_participants',
        ANALYTICS: 'activity_analytics',
        MONITORING: 'activity_monitoring'
    };

    // 生成唯一ID
    function generateId() {
        return 'activity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 创建活动
     */
    function createActivity(data) {
        const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
        
        const activity = {
            id: generateId(),
            name: data.name || '未命名活动',
            type: data.type || ActivityType.PROMOTION,
            status: data.status || ActivityStatus.DRAFT,
            
            // 基本信息
            description: data.description || '',
            coverImage: data.coverImage || '',
            detailImages: data.detailImages || [],
            rules: data.rules || '',
            
            // 时间设置
            startTime: data.startTime || null,
            endTime: data.endTime || null,
            timezone: data.timezone || 'Asia/Shanghai',
            
            // 目标设置
            goal: {
                type: data.goal?.type || GoalType.REGISTRATION,
                target: data.goal?.target || 1000,
                current: 0
            },
            
            // 奖励设置
            rewards: {
                totalBudget: data.rewards?.totalBudget || 0,
                usedBudget: 0,
                rewardTypes: data.rewards?.rewardTypes || ['coupon', 'points'],
                items: data.rewards?.items || []
            },
            
            // 参与限制
            restrictions: {
                maxParticipants: data.restrictions?.maxParticipants || null,
                minLevel: data.restrictions?.minLevel || 0,
                perUserLimit: data.restrictions?.perUserLimit || 1,
                requiredTags: data.restrictions?.requiredTags || []
            },
            
            // 目标人群
            targetAudience: {
                all: data.targetAudience?.all !== false,
                segments: data.targetAudience?.segments || [],
                excludedSegments: data.targetAudience?.excludedSegments || []
            },
            
            // 推广设置
            promotion: {
                channels: data.promotion?.channels || ['app', 'wechat'],
                notificationEnabled: data.promotion?.notificationEnabled !== false,
                pushTitle: data.promotion?.pushTitle || '',
                pushContent: data.promotion?.pushContent || ''
            },
            
            // 统计信息
            stats: {
                views: 0,
                participants: 0,
                conversions: 0,
                shares: 0,
                revenue: 0,
                engagement: 0
            },
            
            // 元数据
            creator: data.creator || '管理员',
            editor: data.creator || '管理员',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: null
        };

        activities.push(activity);
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
        
        ActivityLogger.log('create', activity.id, { name: activity.name });
        
        return activity;
    }

    /**
     * 获取活动列表
     */
    function getActivities(filters = {}) {
        const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
        
        // 更新活动状态
        const now = new Date();
        activities.forEach(activity => {
            if (activity.status === ActivityStatus.RUNNING) {
                if (activity.endTime && new Date(activity.endTime) < now) {
                    activity.status = ActivityStatus.ENDED;
                }
            }
        });
        
        return activities.filter(activity => {
            if (filters.status && activity.status !== filters.status) return false;
            if (filters.type && activity.type !== filters.type) return false;
            if (filters.keyword) {
                const keyword = filters.keyword.toLowerCase();
                if (!activity.name.toLowerCase().includes(keyword)) {
                    return false;
                }
            }
            if (filters.dateRange) {
                const start = new Date(activity.startTime);
                const end = new Date(activity.endTime);
                if (start > filters.dateRange.end || end < filters.dateRange.start) {
                    return false;
                }
            }
            return true;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * 获取单个活动
     */
    function getActivity(id) {
        const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
        return activities.find(a => a.id === id);
    }

    /**
     * 更新活动
     */
    function updateActivity(id, data) {
        const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
        const index = activities.findIndex(a => a.id === id);
        
        if (index === -1) {
            throw new Error('活动不存在');
        }

        const oldActivity = { ...activities[index] };
        activities[index] = {
            ...activities[index],
            ...data,
            editor: '管理员',
            updatedAt: new Date().toISOString()
        };

        // 如果发布
        if (data.status === ActivityStatus.RUNNING && oldActivity.status === ActivityStatus.DRAFT) {
            activities[index].publishedAt = new Date().toISOString();
        }

        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
        
        ActivityLogger.log('update', id, { 
            name: activities[index].name,
            changes: Object.keys(data)
        });

        return activities[index];
    }

    /**
     * 删除活动
     */
    function deleteActivity(id) {
        const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
        const activity = activities.find(a => a.id === id);
        
        if (!activity) {
            throw new Error('活动不存在');
        }

        const filtered = activities.filter(a => a.id !== id);
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(filtered));
        
        ActivityLogger.log('delete', id, { name: activity.name });

        return true;
    }

    /**
     * 活动参与
     */
    function participate(activityId, userId, userData = {}) {
        const activity = getActivity(activityId);
        if (!activity) {
            throw new Error('活动不存在');
        }

        // 检查活动状态
        const now = new Date();
        if (activity.status !== ActivityStatus.RUNNING) {
            throw new Error('活动未开始或已结束');
        }

        // 检查参与限制
        if (activity.startTime && new Date(activity.startTime) > now) {
            throw new Error('活动尚未开始');
        }
        if (activity.endTime && new Date(activity.endTime) < now) {
            throw new Error('活动已结束');
        }

        // 检查参与人数限制
        if (activity.restrictions.maxParticipants && 
            activity.stats.participants >= activity.restrictions.maxParticipants) {
            throw new Error('参与人数已满');
        }

        // 获取参与者列表
        const participants = JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTICIPANTS) || '[]');
        
        // 检查用户是否已参与
        const existing = participants.find(p => 
            p.activityId === activityId && p.userId === userId
        );
        if (existing) {
            throw new Error('您已参与过此活动');
        }

        // 创建参与记录
        const record = {
            id: generateId(),
            activityId: activityId,
            userId: userId,
            userData: userData,
            participatedAt: new Date().toISOString(),
            status: 'completed',
            rewards: []
        };

        participants.push(record);
        localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));

        // 更新活动统计
        updateActivityStats(activityId, {
            participants: 1
        });

        ActivityLogger.log('participate', activityId, { 
            userId: userId,
            activityName: activity.name
        });

        return record;
    }

    /**
     * 获取活动参与者
     */
    function getParticipants(activityId, filters = {}) {
        const participants = JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTICIPANTS) || '[]');
        
        return participants.filter(p => {
            if (activityId && p.activityId !== activityId) return false;
            if (filters.status && p.status !== filters.status) return false;
            if (filters.dateRange) {
                const date = new Date(p.participatedAt);
                if (date < filters.dateRange.start || date > filters.dateRange.end) {
                    return false;
                }
            }
            return true;
        }).sort((a, b) => new Date(b.participatedAt) - new Date(a.participatedAt));
    }

    /**
     * 更新活动统计
     */
    function updateActivityStats(activityId, delta) {
        const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
        const index = activities.findIndex(a => a.id === activityId);
        
        if (index === -1) return;

        if (delta.views !== undefined) {
            activities[index].stats.views += delta.views;
        }
        if (delta.participants !== undefined) {
            activities[index].stats.participants += delta.participants;
            activities[index].goal.current += delta.participants;
        }
        if (delta.conversions !== undefined) {
            activities[index].stats.conversions += delta.conversions;
        }
        if (delta.shares !== undefined) {
            activities[index].stats.shares += delta.shares;
        }
        if (delta.revenue !== undefined) {
            activities[index].stats.revenue += delta.revenue;
        }
        if (delta.engagement !== undefined) {
            activities[index].stats.engagement += delta.engagement;
        }

        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    }

    /**
     * 活动效果分析
     */
    const Analytics = {
        // 获取活动分析数据
        getActivityAnalytics(activityId) {
            const activity = getActivity(activityId);
            if (!activity) {
                throw new Error('活动不存在');
            }

            const participants = getParticipants(activityId);
            const { stats, goal, rewards } = activity;

            // 计算转化率
            const conversionRate = stats.views > 0 ? 
                (stats.participants / stats.views * 100).toFixed(2) : 0;
            
            // 计算目标完成度
            const goalCompletion = goal.target > 0 ? 
                (goal.current / goal.target * 100).toFixed(2) : 0;

            // 计算人均成本
            const costPerParticipant = stats.participants > 0 ? 
                (rewards.usedBudget / stats.participants).toFixed(2) : 0;

            // 计算ROI
            const roi = stats.revenue > 0 ? 
                ((stats.revenue - rewards.usedBudget) / rewards.usedBudget * 100).toFixed(2) : 0;

            // 时间维度分析
            const duration = activity.startTime && activity.endTime ?
                (new Date(activity.endTime) - new Date(activity.startTime)) / (1000 * 60 * 60 * 24) : 0;
            
            const daysPassed = activity.startTime ?
                (new Date() - new Date(activity.startTime)) / (1000 * 60 * 60 * 24) : 0;

            // 参与趋势（按天统计）
            const participationTrend = this.getParticipationTrend(activityId);

            return {
                basic: {
                    name: activity.name,
                    type: activity.type,
                    status: activity.status,
                    startTime: activity.startTime,
                    endTime: activity.endTime,
                    duration: duration.toFixed(1),
                    daysPassed: daysPassed.toFixed(1)
                },
                stats: {
                    views: stats.views,
                    participants: stats.participants,
                    conversions: stats.conversions,
                    shares: stats.shares,
                    revenue: stats.revenue.toFixed(2),
                    engagement: stats.engagement
                },
                metrics: {
                    conversionRate: parseFloat(conversionRate),
                    goalCompletion: parseFloat(goalCompletion),
                    costPerParticipant: parseFloat(costPerParticipant),
                    roi: parseFloat(roi),
                    avgEngagement: stats.views > 0 ? 
                        (stats.engagement / stats.views * 100).toFixed(2) : 0
                },
                rewards: {
                    totalBudget: rewards.totalBudget,
                    usedBudget: rewards.usedBudget.toFixed(2),
                    remainingBudget: (rewards.totalBudget - rewards.usedBudget).toFixed(2),
                    budgetUsageRate: rewards.totalBudget > 0 ? 
                        (rewards.usedBudget / rewards.totalBudget * 100).toFixed(2) : 0
                },
                goal: {
                    type: goal.type,
                    target: goal.target,
                    current: goal.current,
                    remaining: Math.max(0, goal.target - goal.current),
                    completionRate: parseFloat(goalCompletion)
                },
                participationTrend: participationTrend,
                topParticipants: participants.slice(0, 10).map(p => ({
                    userId: p.userId,
                    participatedAt: p.participatedAt,
                    status: p.status
                }))
            };
        },

        // 获取参与趋势
        getParticipationTrend(activityId, days = 7) {
            const participants = getParticipants(activityId);
            const trend = [];
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                const count = participants.filter(p => 
                    p.participatedAt.startsWith(dateStr)
                ).length;
                
                trend.push({
                    date: dateStr,
                    count: count
                });
            }
            
            return trend;
        },

        // 获取所有活动汇总
        getSummary(dateRange = null) {
            const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
            
            let filtered = activities;
            if (dateRange) {
                filtered = activities.filter(a => {
                    const start = new Date(a.startTime);
                    return start >= dateRange.start && start <= dateRange.end;
                });
            }

            const summary = {
                total: filtered.length,
                active: filtered.filter(a => a.status === ActivityStatus.RUNNING).length,
                ended: filtered.filter(a => a.status === ActivityStatus.ENDED).length,
                totalViews: 0,
                totalParticipants: 0,
                totalConversions: 0,
                totalRevenue: 0,
                avgConversionRate: 0,
                topActivities: []
            };

            filtered.forEach(activity => {
                summary.totalViews += activity.stats.views;
                summary.totalParticipants += activity.stats.participants;
                summary.totalConversions += activity.stats.conversions;
                summary.totalRevenue += activity.stats.revenue;
            });

            summary.avgConversionRate = summary.totalViews > 0 ?
                (summary.totalParticipants / summary.totalViews * 100).toFixed(2) : 0;

            // 获取TOP活动
            summary.topActivities = filtered
                .sort((a, b) => b.stats.participants - a.stats.participants)
                .slice(0, 5)
                .map(a => ({
                    id: a.id,
                    name: a.name,
                    type: a.type,
                    status: a.status,
                    participants: a.stats.participants,
                    conversionRate: a.stats.views > 0 ? 
                        (a.stats.participants / a.stats.views * 100).toFixed(2) : 0
                }));

            return summary;
        },

        // 导出报表
        exportReport(activityId, format = 'json') {
            const data = this.getActivityAnalytics(activityId);
            
            if (format === 'csv') {
                return this.toCSV(data);
            }
            
            return data;
        },

        toCSV(data) {
            let csv = '指标,数值\n';
            
            // 基本信息
            csv += `活动名称,${data.basic.name}\n`;
            csv += `活动类型,${data.basic.type}\n`;
            csv += `活动状态,${data.basic.status}\n`;
            
            // 统计数据
            csv += `\n统计数据\n`;
            csv += `浏览量,${data.stats.views}\n`;
            csv += `参与人数,${data.stats.participants}\n`;
            csv += `转化数,${data.stats.conversions}\n`;
            csv += `分享数,${data.stats.shares}\n`;
            csv += `收入,${data.stats.revenue}\n`;
            
            // 效果指标
            csv += `\n效果指标\n`;
            csv += `转化率,${data.metrics.conversionRate}%\n`;
            csv += `目标完成度,${data.metrics.goalCompletion}%\n`;
            csv += `人均成本,${data.metrics.costPerParticipant}\n`;
            csv += `ROI,${data.metrics.roi}%\n`;
            
            return csv;
        }
    };

    /**
     * 活动监控
     */
    const Monitoring = {
        // 实时监控数据
        getRealtimeData(activityId) {
            const activity = getActivity(activityId);
            if (!activity) {
                throw new Error('活动不存在');
            }

            const participants = getParticipants(activityId, {
                dateRange: {
                    start: new Date(Date.now() - 60 * 60 * 1000), // 最近1小时
                    end: new Date()
                }
            });

            const lastHour = participants.length;
            const lastMinute = participants.filter(p => {
                const diff = Date.now() - new Date(p.participatedAt).getTime();
                return diff < 60 * 1000;
            }).length;

            return {
                activityId: activityId,
                currentStatus: activity.status,
                currentParticipants: activity.stats.participants,
                lastHourParticipants: lastHour,
                lastMinuteParticipants: lastMinute,
                views: activity.stats.views,
                remainingBudget: activity.rewards.totalBudget - activity.rewards.usedBudget,
                goalProgress: activity.goal.current / activity.goal.target * 100
            };
        },

        // 获取告警信息
        getAlerts(activityId) {
            const alerts = [];
            const activity = getActivity(activityId);
            if (!activity) return alerts;

            // 预算告警
            const budgetUsage = activity.rewards.usedBudget / activity.rewards.totalBudget * 100;
            if (budgetUsage >= 90) {
                alerts.push({
                    type: 'danger',
                    message: '预算使用率已达90%，即将耗尽'
                });
            } else if (budgetUsage >= 70) {
                alerts.push({
                    type: 'warning',
                    message: '预算使用率已达70%'
                });
            }

            // 目标告警
            const goalProgress = activity.goal.current / activity.goal.target * 100;
            const remainingTime = new Date(activity.endTime) - new Date();
            const expectedProgress = (1 - remainingTime / (new Date(activity.endTime) - new Date(activity.startTime))) * 100;
            
            if (goalProgress < expectedProgress - 20) {
                alerts.push({
                    type: 'warning',
                    message: '参与进度低于预期，需要加大推广力度'
                });
            }

            // 参与者告警
            if (activity.restrictions.maxParticipants) {
                const remaining = activity.restrictions.maxParticipants - activity.stats.participants;
                if (remaining <= 100) {
                    alerts.push({
                        type: 'info',
                        message: `仅剩${remaining}个参与名额`
                    });
                }
            }

            return alerts;
        },

        // 健康检查
        healthCheck(activityId) {
            const activity = getActivity(activityId);
            if (!activity) {
                return { healthy: false, error: '活动不存在' };
            }

            const checks = [];

            // 检查活动状态
            if (activity.status === ActivityStatus.RUNNING) {
                checks.push({ name: 'status', passed: true, message: '活动运行中' });
            } else {
                checks.push({ 
                    name: 'status', 
                    passed: false, 
                    message: `活动状态: ${activity.status}` 
                });
            }

            // 检查时间设置
            if (activity.startTime && new Date(activity.startTime) > new Date()) {
                checks.push({ 
                    name: 'timing', 
                    passed: false, 
                    message: '活动尚未开始' 
                });
            } else {
                checks.push({ name: 'timing', passed: true, message: '时间设置正确' });
            }

            // 检查预算
            if (activity.rewards.totalBudget > activity.rewards.usedBudget) {
                checks.push({ 
                    name: 'budget', 
                    passed: true, 
                    message: '预算充足' 
                });
            } else {
                checks.push({ 
                    name: 'budget', 
                    passed: false, 
                    message: '预算已耗尽' 
                });
            }

            const healthy = checks.every(c => c.passed);

            return {
                healthy: healthy,
                activityId: activityId,
                checks: checks,
                timestamp: new Date().toISOString()
            };
        }
    };

    /**
     * 活动日志
     */
    const ActivityLogger = {
        logs: [],

        log(action, activityId, details = {}) {
            const log = {
                id: generateId(),
                timestamp: new Date().toISOString(),
                action: action,
                activityId: activityId,
                operator: '管理员',
                details: details
            };

            this.logs.unshift(log);
            
            if (this.logs.length > 500) {
                this.logs = this.logs.slice(0, 500);
            }
        },

        getLogs(activityId = null) {
            if (activityId) {
                return this.logs.filter(l => l.activityId === activityId);
            }
            return this.logs;
        }
    };

    // 初始化示例数据
    function initSampleData() {
        if (localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) return;

        const sampleActivities = [
            {
                id: 'activity_1',
                name: '春季旅游季特惠活动',
                type: ActivityType.SEASONAL,
                status: ActivityStatus.RUNNING,
                description: '春季出游最佳时机，享受限时优惠',
                coverImage: '',
                startTime: '2024-03-01T00:00:00.000Z',
                endTime: '2024-05-31T23:59:59.000Z',
                goal: {
                    type: GoalType.REGISTRATION,
                    target: 5000,
                    current: 3245
                },
                rewards: {
                    totalBudget: 100000,
                    usedBudget: 62300
                },
                stats: {
                    views: 25680,
                    participants: 3245,
                    conversions: 456,
                    shares: 892,
                    revenue: 156780
                },
                creator: '管理员',
                createdAt: '2024-02-20T10:00:00.000Z',
                updatedAt: '2024-03-15T14:30:00.000Z'
            },
            {
                id: 'activity_2',
                name: '五一劳动节抽奖活动',
                type: ActivityType.GIVEAWAY,
                status: ActivityStatus.PENDING,
                description: '五一假期抽奖赢取旅游基金',
                coverImage: '',
                startTime: '2024-05-01T00:00:00.000Z',
                endTime: '2024-05-05T23:59:59.000Z',
                goal: {
                    type: GoalType.ENGAGEMENT,
                    target: 10000,
                    current: 0
                },
                rewards: {
                    totalBudget: 50000,
                    usedBudget: 0
                },
                stats: {
                    views: 0,
                    participants: 0,
                    conversions: 0,
                    shares: 0,
                    revenue: 0
                },
                creator: '管理员',
                createdAt: '2024-03-10T09:00:00.000Z',
                updatedAt: '2024-03-10T09:00:00.000Z'
            }
        ];

        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(sampleActivities));
    }

    initSampleData();

    // 公共API
    return {
        // 枚举
        Status: ActivityStatus,
        Type: ActivityType,
        GoalType: GoalType,

        // 活动管理
        createActivity,
        getActivities,
        getActivity,
        updateActivity,
        deleteActivity,

        // 参与管理
        participate,
        getParticipants,

        // 统计分析
        Analytics,

        // 活动监控
        Monitoring,

        // 日志
        ActivityLogger,

        // 工具函数
        generateId
    };
})();

// 导出为全局变量
window.ActivityManager = ActivityManager;
