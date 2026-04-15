/**
 * 会员管理系统 (Member Manager)
 * 负责会员等级、积分管理、权益配置、成长体系
 */

const MemberManager = (function() {
    'use strict';

    // 会员等级枚举
    const MemberLevel = {
        GUEST: 'guest',           // 游客
        MEMBER: 'member',        // 普通会员
        SILVER: 'silver',        // 银卡会员
        GOLD: 'gold',            // 金卡会员
        PLATINUM: 'platinum',    // 白金会员
        DIAMOND: 'diamond'        // 钻石会员
    };

    // 积分来源枚举
    const PointSource = {
        REGISTER: 'register',         // 注册
        LOGIN: 'login',               // 登录
        CONSUMPTION: 'consumption',   // 消费
        REVIEW: 'review',             // 评价
        SHARING: 'sharing',           // 分享
        SIGN: 'sign',                 // 签到
        INVITATION: 'invitation',    // 邀请
        ACTIVITY: 'activity'          // 参与活动
    };

    // 积分类型
    const PointType = {
        EARN: 'earn',     // 获得
        REDEEM: 'redeem', // 消费
        EXPIRE: 'expire', // 过期
        ADJUST: 'adjust'  // 调整
    };

    // 存储键名
    const STORAGE_KEYS = {
        LEVELS: 'member_levels',
        MEMBERS: 'member_members',
        POINTS_HISTORY: 'member_points_history',
        BENEFITS: 'member_benefits',
        GROWTH_CONFIG: 'member_growth_config'
    };

    // 生成唯一ID
    function generateId() {
        return 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 初始化默认会员等级
     */
    function initDefaultLevels() {
        const levels = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEVELS) || '[]');
        
        if (levels.length === 0) {
            const defaultLevels = [
                {
                    id: MemberLevel.GUEST,
                    name: '游客',
                    icon: '👤',
                    minPoints: 0,
                    maxPoints: 99,
                    color: '#9CA3AF',
                    benefits: [],
                    privileges: ['basic_access']
                },
                {
                    id: MemberLevel.MEMBER,
                    name: '普通会员',
                    icon: '⭐',
                    minPoints: 100,
                    maxPoints: 999,
                    color: '#3B82F6',
                    benefits: ['basic_access', 'points_earning'],
                    privileges: ['basic_access', 'points_earning', '5%_discount']
                },
                {
                    id: MemberLevel.SILVER,
                    name: '银卡会员',
                    icon: '🥈',
                    minPoints: 1000,
                    maxPoints: 4999,
                    color: '#9CA3AF',
                    benefits: ['basic_access', 'points_earning', '8%_discount', 'priority_support'],
                    privileges: ['basic_access', 'points_earning', '8%_discount', 'priority_support', 'free_shipping_over_200']
                },
                {
                    id: MemberLevel.GOLD,
                    name: '金卡会员',
                    icon: '🥇',
                    minPoints: 5000,
                    maxPoints: 19999,
                    color: '#F59E0B',
                    benefits: ['basic_access', 'points_earning', '10%_discount', 'priority_support', 
                        'free_shipping', 'exclusive_events'],
                    privileges: ['basic_access', 'points_earning', '10%_discount', 'priority_support', 
                        'free_shipping', 'exclusive_events', 'birthday_bonus']
                },
                {
                    id: MemberLevel.PLATINUM,
                    name: '白金会员',
                    icon: '💎',
                    minPoints: 20000,
                    maxPoints: 99999,
                    color: '#8B5CF6',
                    benefits: ['basic_access', 'points_earning', '12%_discount', 'priority_support', 
                        'free_shipping', 'exclusive_events', 'personal_concierge'],
                    privileges: ['basic_access', 'points_earning', '12%_discount', 'priority_support', 
                        'free_shipping', 'exclusive_events', 'personal_concierge', 'vip_hotline']
                },
                {
                    id: MemberLevel.DIAMOND,
                    name: '钻石会员',
                    icon: '👑',
                    minPoints: 100000,
                    maxPoints: Infinity,
                    color: '#EC4899',
                    benefits: ['all_benefits'],
                    privileges: ['all_benefits', 'customized_service', 'annual_gift', 'exclusive_travel_planner']
                }
            ];
            
            localStorage.setItem(STORAGE_KEYS.LEVELS, JSON.stringify(defaultLevels));
            return defaultLevels;
        }
        
        return levels;
    }

    /**
     * 获取会员等级列表
     */
    function getLevels() {
        return initDefaultLevels();
    }

    /**
     * 获取单个会员等级
     */
    function getLevel(levelId) {
        const levels = initDefaultLevels();
        return levels.find(l => l.id === levelId);
    }

    /**
     * 根据积分获取会员等级
     */
    function getLevelByPoints(points) {
        const levels = initDefaultLevels();
        return levels.find(l => points >= l.minPoints && points <= l.maxPoints) || levels[0];
    }

    /**
     * 更新会员等级配置
     */
    function updateLevel(levelId, data) {
        const levels = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEVELS) || '[]');
        const index = levels.findIndex(l => l.id === levelId);
        
        if (index === -1) {
            throw new Error('会员等级不存在');
        }

        levels[index] = {
            ...levels[index],
            ...data
        };

        localStorage.setItem(STORAGE_KEYS.LEVELS, JSON.stringify(levels));
        
        MemberLogger.log('update_level', levelId, { levelName: levels[index].name });

        return levels[index];
    }

    /**
     * 创建/更新会员
     */
    function upsertMember(userId, data = {}) {
        const members = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || '[]');
        const index = members.findIndex(m => m.userId === userId);
        
        if (index === -1) {
            // 创建新会员
            const member = {
                id: generateId(),
                userId: userId,
                level: data.level || MemberLevel.MEMBER,
                points: data.points || 0,
                totalPoints: data.totalPoints || 0,  // 历史累计积分
                spentAmount: data.spentAmount || 0,
                orderCount: data.orderCount || 0,
                pointsHistory: [],
                benefits: {
                    available: [],
                    used: [],
                    expired: []
                },
                profile: {
                    name: data.name || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    birthday: data.birthday || null,
                    avatar: data.avatar || ''
                },
                stats: {
                    loginDays: 0,
                    lastLoginAt: null,
                    totalReviews: 0,
                    sharedCount: 0,
                    invitedCount: 0
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                levelUpAt: new Date().toISOString()
            };

            members.push(member);
            localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
            
            return member;
        } else {
            // 更新现有会员
            members[index] = {
                ...members[index],
                ...data,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
            
            return members[index];
        }
    }

    /**
     * 获取会员信息
     */
    function getMember(userId) {
        const members = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || '[]');
        const member = members.find(m => m.userId === userId);
        
        if (member) {
            // 更新等级
            const levelInfo = getLevelByPoints(member.points);
            if (member.level !== levelInfo.id) {
                member.level = levelInfo.id;
                member.levelUpAt = new Date().toISOString();
                localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
            }
        }
        
        return member;
    }

    /**
     * 获取会员列表
     */
    function getMembers(filters = {}) {
        const members = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || '[]');
        
        return members.filter(member => {
            if (filters.level && member.level !== filters.level) return false;
            if (filters.keyword) {
                const keyword = filters.keyword.toLowerCase();
                if (!member.userId.toLowerCase().includes(keyword) &&
                    !member.profile.name.toLowerCase().includes(keyword) &&
                    !(member.profile.phone || '').includes(keyword)) {
                    return false;
                }
            }
            if (filters.minPoints && member.points < filters.minPoints) return false;
            if (filters.maxPoints && member.points > filters.maxPoints) return false;
            return true;
        }).sort((a, b) => {
            if (filters.sortBy === 'points') {
                return filters.sortOrder === 'asc' ? a.points - b.points : b.points - a.points;
            }
            if (filters.sortBy === 'spent') {
                return filters.sortOrder === 'asc' ? a.spentAmount - b.spentAmount : b.spentAmount - a.spentAmount;
            }
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    }

    /**
     * 添加积分
     */
    function addPoints(userId, amount, source, description = '') {
        const member = getMember(userId);
        if (!member) {
            // 自动创建会员
            upsertMember(userId);
            return addPoints(userId, amount, source, description);
        }

        const history = {
            id: generateId(),
            type: PointType.EARN,
            amount: amount,
            source: source,
            description: description,
            balance: member.points + amount,
            createdAt: new Date().toISOString(),
            operator: '系统'
        };

        const members = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || '[]');
        const index = members.findIndex(m => m.userId === userId);
        
        members[index].points += amount;
        members[index].totalPoints += amount;
        members[index].pointsHistory.unshift(history);
        members[index].updatedAt = new Date().toISOString();

        // 检查是否需要升级
        const newLevel = getLevelByPoints(members[index].points);
        if (newLevel.id !== members[index].level) {
            members[index].level = newLevel.id;
            members[index].levelUpAt = new Date().toISOString();
            history.levelUp = newLevel.id;
        }

        // 只保留最近100条积分记录
        if (members[index].pointsHistory.length > 100) {
            members[index].pointsHistory = members[index].pointsHistory.slice(0, 100);
        }

        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
        
        MemberLogger.log('add_points', userId, { 
            amount: amount, 
            source: source,
            newBalance: members[index].points
        });

        return {
            member: members[index],
            history: history
        };
    }

    /**
     * 扣除积分
     */
    function deductPoints(userId, amount, source, description = '') {
        const member = getMember(userId);
        if (!member) {
            throw new Error('会员不存在');
        }

        if (member.points < amount) {
            throw new Error('积分不足');
        }

        const history = {
            id: generateId(),
            type: PointType.REDEEM,
            amount: -amount,
            source: source,
            description: description,
            balance: member.points - amount,
            createdAt: new Date().toISOString(),
            operator: '系统'
        };

        const members = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || '[]');
        const index = members.findIndex(m => m.userId === userId);
        
        members[index].points -= amount;
        members[index].pointsHistory.unshift(history);
        members[index].updatedAt = new Date().toISOString();

        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
        
        MemberLogger.log('deduct_points', userId, { 
            amount: amount, 
            source: source,
            newBalance: members[index].points
        });

        return {
            member: members[index],
            history: history
        };
    }

    /**
     * 获取积分历史
     */
    function getPointsHistory(userId, filters = {}) {
        const member = getMember(userId);
        if (!member) return [];

        let history = member.pointsHistory || [];
        
        if (filters.source) {
            history = history.filter(h => h.source === filters.source);
        }
        if (filters.type) {
            history = history.filter(h => h.type === filters.type);
        }
        if (filters.dateRange) {
            history = history.filter(h => {
                const date = new Date(h.createdAt);
                return date >= filters.dateRange.start && date <= filters.dateRange.end;
            });
        }

        return history;
    }

    /**
     * 积分规则配置
     */
    const PointsRules = {
        rules: {
            [PointSource.REGISTER]: { points: 100, description: '注册奖励' },
            [PointSource.LOGIN]: { points: 5, description: '每日登录', dailyLimit: 1 },
            [PointSource.CONSUMPTION]: { pointsPerYuan: 1, description: '消费返积分' },
            [PointSource.REVIEW]: { points: 20, description: '评价奖励', dailyLimit: 3 },
            [PointSource.SHARING]: { points: 10, description: '分享奖励', dailyLimit: 5 },
            [PointSource.SIGN]: { points: 5, description: '签到奖励', streak: [7, 30, 90] },
            [PointSource.INVITATION]: { points: 50, description: '邀请奖励' }
        },

        // 计算消费积分
        calculateConsumptionPoints(amount) {
            return Math.floor(amount * this.rules[PointSource.CONSUMPTION].pointsPerYuan);
        },

        // 获取规则
        getRule(source) {
            return this.rules[source];
        },

        // 获取所有规则
        getAllRules() {
            return { ...this.rules };
        },

        // 更新规则
        updateRule(source, data) {
            if (!this.rules[source]) {
                throw new Error('积分来源不存在');
            }
            this.rules[source] = { ...this.rules[source], ...data };
            return this.rules[source];
        }
    };

    /**
     * 权益配置
     */
    const BenefitsManager = {
        // 默认权益列表
        defaultBenefits: [
            {
                id: 'basic_access',
                name: '基础访问',
                description: '访问平台基础功能',
                icon: '🔓'
            },
            {
                id: 'points_earning',
                name: '积分获取',
                description: '消费可获得积分奖励',
                icon: '💰'
            },
            {
                id: '5%_discount',
                name: '5%折扣',
                description: '订单享受5%折扣优惠',
                icon: '🏷️'
            },
            {
                id: '8%_discount',
                name: '8%折扣',
                description: '订单享受8%折扣优惠',
                icon: '🏷️'
            },
            {
                id: '10%_discount',
                name: '10%折扣',
                description: '订单享受10%折扣优惠',
                icon: '🏷️'
            },
            {
                id: '12%_discount',
                name: '12%折扣',
                description: '订单享受12%折扣优惠',
                icon: '🏷️'
            },
            {
                id: 'priority_support',
                name: '优先客服',
                description: '享受优先客服响应',
                icon: '🎧'
            },
            {
                id: 'free_shipping',
                name: '免运费',
                description: '全站免运费特权',
                icon: '📦'
            },
            {
                id: 'free_shipping_over_200',
                name: '满额免运费',
                description: '满200元免运费',
                icon: '📦'
            },
            {
                id: 'exclusive_events',
                name: '专属活动',
                description: '参与会员专属活动',
                icon: '🎁'
            },
            {
                id: 'birthday_bonus',
                name: '生日礼包',
                description: '生日当月领取专属礼包',
                icon: '🎂'
            },
            {
                id: 'personal_concierge',
                name: '专属管家',
                description: '一对一专属服务管家',
                icon: '👨‍💼'
            },
            {
                id: 'vip_hotline',
                name: 'VIP热线',
                description: '24小时VIP专属热线',
                icon: '📞'
            },
            {
                id: 'customized_service',
                name: '定制服务',
                description: '个性化旅行定制服务',
                icon: '✨'
            },
            {
                id: 'annual_gift',
                name: '年度礼包',
                description: '每年领取年度大礼包',
                icon: '🎉'
            },
            {
                id: 'exclusive_travel_planner',
                name: '专属旅行规划师',
                description: '顶级旅行规划师专属服务',
                icon: '🗺️'
            },
            {
                id: 'all_benefits',
                name: '全部权益',
                description: '享受平台全部权益',
                icon: '👑'
            }
        ],

        // 获取权益列表
        getBenefits() {
            let benefits = JSON.parse(localStorage.getItem(STORAGE_KEYS.BENEFITS) || '[]');
            if (benefits.length === 0) {
                benefits = this.defaultBenefits;
                localStorage.setItem(STORAGE_KEYS.BENEFITS, JSON.stringify(benefits));
            }
            return benefits;
        },

        // 获取会员可用的权益
        getMemberBenefits(levelId) {
            const level = getLevel(levelId);
            if (!level) return [];
            
            const allBenefits = this.getBenefits();
            return allBenefits.filter(b => level.privileges.includes(b.id));
        },

        // 检查会员是否有某项权益
        hasBenefit(levelId, benefitId) {
            const level = getLevel(levelId);
            if (!level) return false;
            return level.privileges.includes(benefitId) || level.privileges.includes('all_benefits');
        }
    };

    /**
     * 成长体系配置
     */
    const GrowthConfig = {
        config: {
            // 成长值计算规则
            calculation: {
                consumption: { rate: 1 },      // 每消费1元获得1成长值
                review: { points: 10 },         // 每评价获得10成长值
                sharing: { points: 5 },          // 每分享获得5成长值
                invitation: { points: 100 }     // 每邀请获得100成长值
            },
            // 有效期设置
            validity: {
                pointsExpire: true,            // 积分是否过期
                expireMonths: 24,               // 积分24个月后过期
                levelMaintain: true,           // 等级是否需要维护
                maintainPeriod: 12             // 等级维护周期（月）
            },
            // 特殊规则
            specialRules: {
                birthdayBonus: true,           // 生日双倍成长
                festivalBonus: true,            // 节日双倍成长
                newUserGrace: true,              // 新用户保护期
                graceMonths: 3                  // 保护期月数
            }
        },

        // 获取配置
        getConfig() {
            let config = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROWTH_CONFIG) || 'null');
            if (!config) {
                config = this.config;
                localStorage.setItem(STORAGE_KEYS.GROWTH_CONFIG, JSON.stringify(config));
            }
            return config;
        },

        // 更新配置
        updateConfig(data) {
            const config = this.getConfig();
            Object.assign(config, data);
            localStorage.setItem(STORAGE_KEYS.GROWTH_CONFIG, JSON.stringify(config));
            return config;
        },

        // 计算成长值
        calculateGrowth(userId, action, amount = 1) {
            const cfg = this.getConfig();
            let growth = 0;

            switch (action) {
                case 'consumption':
                    growth = amount * cfg.calculation.consumption.rate;
                    break;
                case 'review':
                    growth = cfg.calculation.review.points;
                    break;
                case 'sharing':
                    growth = cfg.calculation.sharing.points;
                    break;
                case 'invitation':
                    growth = cfg.calculation.invitation.points;
                    break;
            }

            // 检查特殊规则
            const member = getMember(userId);
            if (member) {
                // 生日双倍
                if (cfg.specialRules.birthdayBonus && member.profile.birthday) {
                    const today = new Date();
                    const birthday = new Date(member.profile.birthday);
                    if (today.getMonth() === birthday.getMonth() && today.getDate() === birthday.getDate()) {
                        growth *= 2;
                    }
                }

                // 新用户保护期
                if (cfg.specialRules.newUserGrace) {
                    const joinDate = new Date(member.createdAt);
                    const monthsDiff = (today - joinDate) / (1000 * 60 * 60 * 24 * 30);
                    if (monthsDiff <= cfg.specialRules.graceMonths) {
                        growth *= 1.5; // 保护期1.5倍
                    }
                }
            }

            return Math.floor(growth);
        }
    };

    /**
     * 会员统计
     */
    const Statistics = {
        // 获取会员统计
        getMemberStats(userId) {
            const member = getMember(userId);
            if (!member) {
                throw new Error('会员不存在');
            }

            const levelInfo = getLevel(member.level);
            const nextLevel = this.getNextLevel(member.level);
            const progress = nextLevel ? 
                ((member.points - levelInfo.minPoints) / (nextLevel.minPoints - levelInfo.minPoints) * 100).toFixed(1) : 100;

            // 积分统计
            const pointsStats = {
                total: member.totalPoints,
                current: member.points,
                earned: member.pointsHistory.filter(h => h.type === PointType.EARN).reduce((sum, h) => sum + h.amount, 0),
                spent: Math.abs(member.pointsHistory.filter(h => h.type === PointType.REDEEM).reduce((sum, h) => sum + h.amount, 0)),
                expired: Math.abs(member.pointsHistory.filter(h => h.type === PointType.EXPIRE).reduce((sum, h) => sum + h.amount, 0))
            };

            // 消费统计
            const consumptionStats = {
                totalSpent: member.spentAmount,
                orderCount: member.orderCount,
                avgOrderValue: member.orderCount > 0 ? (member.spentAmount / member.orderCount).toFixed(2) : 0
            };

            // 活跃度统计
            const activityStats = {
                loginDays: member.stats.loginDays,
                reviews: member.stats.totalReviews,
                shares: member.stats.sharedCount,
                invitations: member.stats.invitedCount
            };

            return {
                level: levelInfo,
                nextLevel: nextLevel,
                progress: parseFloat(progress),
                points: pointsStats,
                consumption: consumptionStats,
                activity: activityStats,
                memberSince: member.createdAt,
                lastActive: member.updatedAt
            };
        },

        // 获取下一等级
        getNextLevel(currentLevel) {
            const levels = getLevels();
            const currentIndex = levels.findIndex(l => l.id === currentLevel);
            if (currentIndex === -1 || currentIndex === levels.length - 1) {
                return null;
            }
            return levels[currentIndex + 1];
        },

        // 获取等级分布
        getLevelDistribution() {
            const members = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || '[]');
            const levels = getLevels();
            
            const distribution = levels.map(level => ({
                level: level,
                count: members.filter(m => m.level === level.id).length
            }));

            const total = members.length;
            distribution.forEach(d => {
                d.percentage = total > 0 ? (d.count / total * 100).toFixed(2) : 0;
            });

            return distribution;
        },

        // 全局统计
        getGlobalStats() {
            const members = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || '[]');
            
            const totalPoints = members.reduce((sum, m) => sum + m.points, 0);
            const totalSpent = members.reduce((sum, m) => sum + m.spentAmount, 0);
            
            return {
                totalMembers: members.length,
                byLevel: this.getLevelDistribution(),
                points: {
                    total: totalPoints,
                    avgPerMember: members.length > 0 ? (totalPoints / members.length).toFixed(0) : 0
                },
                consumption: {
                    total: totalSpent,
                    avgPerMember: members.length > 0 ? (totalSpent / members.length).toFixed(2) : 0
                }
            };
        }
    };

    /**
     * 日志记录
     */
    const MemberLogger = {
        logs: [],

        log(action, userId, details = {}) {
            const log = {
                id: generateId(),
                timestamp: new Date().toISOString(),
                action: action,
                userId: userId,
                operator: '管理员',
                details: details
            };

            this.logs.unshift(log);
            
            if (this.logs.length > 500) {
                this.logs = this.logs.slice(0, 500);
            }
        },

        getLogs(userId = null) {
            if (userId) {
                return this.logs.filter(l => l.userId === userId);
            }
            return this.logs;
        }
    };

    // 初始化默认等级
    initDefaultLevels();

    // 公共API
    return {
        // 枚举
        Level: MemberLevel,
        PointSource: PointSource,
        PointType: PointType,

        // 等级管理
        getLevels,
        getLevel,
        getLevelByPoints,
        updateLevel,

        // 会员管理
        upsertMember,
        getMember,
        getMembers,

        // 积分管理
        addPoints,
        deductPoints,
        getPointsHistory,
        PointsRules,

        // 权益管理
        BenefitsManager,

        // 成长体系
        GrowthConfig,

        // 统计
        Statistics,

        // 日志
        MemberLogger,

        // 工具函数
        generateId
    };
})();

// 导出为全局变量
window.MemberManager = MemberManager;
