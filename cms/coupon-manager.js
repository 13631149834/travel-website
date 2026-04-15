/**
 * 优惠券管理系统 (Coupon Manager)
 * 负责优惠券创建、发放管理、使用统计、过期管理
 */

const CouponManager = (function() {
    'use strict';

    // 优惠券状态枚举
    const CouponStatus = {
        DRAFT: 'draft',
        ACTIVE: 'active',
        PAUSED: 'paused',
        EXPIRED: 'expired',
        ARCHIVED: 'archived'
    };

    // 优惠券类型枚举
    const CouponType = {
        DISCOUNT: 'discount',           // 折扣券
        CASH: 'cash',                   // 现金券
        GIFT: 'gift',                   // 礼品券
        SHIPPING: 'shipping',           // 运费券
        EXCHANGE: 'exchange'             // 兑换券
    };

    // 发放方式枚举
    const DistributeType = {
        MANUAL: 'manual',               // 手动发放
        AUTO: 'auto',                   // 自动发放
        CODE: 'code',                   // 兑换码
        INVITE: 'invite',               // 邀请奖励
        PURCHASE: 'purchase',           // 购买赠送
        BIRTHDAY: 'birthday'            // 生日券
    };

    // 存储键名
    const STORAGE_KEYS = {
        COUPONS: 'coupon_coupons',
        RECORDS: 'coupon_records',
        USER_COUPONS: 'coupon_user_coupons'
    };

    // 生成唯一ID
    function generateId() {
        return 'coupon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 生成兑换码
    function generateCode(prefix = 'CD') {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = prefix;
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * 创建优惠券
     */
    function createCoupon(data) {
        const coupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
        
        const coupon = {
            id: generateId(),
            name: data.name || '未命名优惠券',
            type: data.type || CouponType.DISCOUNT,
            status: data.status || CouponStatus.DRAFT,
            
            // 面值/折扣设置
            value: data.value || 0,  // 折扣值或金额
            discountType: data.discountType || 'fixed',  // fixed固定值, percentage百分比
            maxDiscount: data.maxDiscount || null,  // 最高折扣金额
            minOrderAmount: data.minOrderAmount || 0,  // 最低消费金额
            
            // 发行设置
            totalCount: data.totalCount || 100,
            issuedCount: 0,
            perUserLimit: data.perUserLimit || 1,
            
            // 时间设置
            validFrom: data.validFrom || null,
            validUntil: data.validUntil || null,
            validDays: data.validDays || null,  // 领取后多少天有效
            
            // 发放设置
            distributeType: data.distributeType || DistributeType.MANUAL,
            autoIssueRules: data.autoIssueRules || null,
            codes: data.codes || [],  // 兑换码列表
            
            // 使用限制
            applicableProducts: data.applicableProducts || [],  // 适用产品分类
            excludedProducts: data.excludedProducts || [],  // 排除产品分类
            applicableRegions: data.applicableRegions || [],  // 适用地区
            userLevels: data.userLevels || [],  // 适用用户等级
            
            // 描述
            description: data.description || '',
            usageNotes: data.usageNotes || '',
            
            // 统计
            stats: {
                viewed: 0,
                claimed: 0,
                used: 0,
                revenue: 0
            },
            
            // 附加权益
            benefits: data.benefits || {
                freeShipping: false,
                priorityService: false,
                exclusiveAccess: false
            },
            
            // 元数据
            creator: data.creator || '管理员',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: null
        };

        // 如果需要生成兑换码
        if (data.generateCodes && data.generateCodes > 0) {
            for (let i = 0; i < data.generateCodes; i++) {
                coupon.codes.push({
                    code: generateCode(),
                    claimed: false,
                    claimedBy: null,
                    claimedAt: null
                });
            }
            coupon.totalCount = data.generateCodes;
        }

        coupons.push(coupon);
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
        
        CouponLogger.log('create', coupon.id, { name: coupon.name });

        return coupon;
    }

    /**
     * 获取优惠券列表
     */
    function getCoupons(filters = {}) {
        const coupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
        
        // 更新过期状态
        const now = new Date();
        coupons.forEach(coupon => {
            if (coupon.status === CouponStatus.ACTIVE) {
                if (coupon.validUntil && new Date(coupon.validUntil) < now) {
                    coupon.status = CouponStatus.EXPIRED;
                }
            }
        });
        
        return coupons.filter(coupon => {
            if (filters.status && coupon.status !== filters.status) return false;
            if (filters.type && coupon.type !== filters.type) return false;
            if (filters.keyword) {
                const keyword = filters.keyword.toLowerCase();
                if (!coupon.name.toLowerCase().includes(keyword)) {
                    return false;
                }
            }
            if (filters.distributeType && coupon.distributeType !== filters.distributeType) {
                return false;
            }
            return true;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * 获取单个优惠券
     */
    function getCoupon(id) {
        const coupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
        return coupons.find(c => c.id === id);
    }

    /**
     * 更新优惠券
     */
    function updateCoupon(id, data) {
        const coupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
        const index = coupons.findIndex(c => c.id === id);
        
        if (index === -1) {
            throw new Error('优惠券不存在');
        }

        coupons[index] = {
            ...coupons[index],
            ...data,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
        
        CouponLogger.log('update', id, { 
            name: coupons[index].name,
            changes: Object.keys(data)
        });

        return coupons[index];
    }

    /**
     * 删除优惠券
     */
    function deleteCoupon(id) {
        const coupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
        const coupon = coupons.find(c => c.id === id);
        
        if (!coupon) {
            throw new Error('优惠券不存在');
        }

        const filtered = coupons.filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(filtered));
        
        CouponLogger.log('delete', id, { name: coupon.name });

        return true;
    }

    /**
     * 发放优惠券
     */
    function distributeCoupon(couponId, userId, quantity = 1) {
        const coupon = getCoupon(couponId);
        if (!coupon) {
            throw new Error('优惠券不存在');
        }

        // 检查发放状态
        if (coupon.status !== CouponStatus.ACTIVE) {
            throw new Error('优惠券未激活');
        }

        // 检查有效期
        const now = new Date();
        if (coupon.validFrom && new Date(coupon.validFrom) > now) {
            throw new Error('优惠券尚未开始发放');
        }
        if (coupon.validUntil && new Date(coupon.validUntil) < now) {
            throw new Error('优惠券已过期');
        }

        // 检查剩余数量
        const remaining = coupon.totalCount - coupon.issuedCount;
        if (remaining < quantity) {
            throw new Error(`优惠券库存不足，剩余${remaining}张`);
        }

        // 获取用户优惠券
        const userCoupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_COUPONS) || '[]');
        
        // 检查用户已领取数量
        const userExistingCount = userCoupons.filter(uc => 
            uc.couponId === couponId && uc.userId === userId && uc.status !== 'expired'
        ).length;
        
        if (userExistingCount + quantity > coupon.perUserLimit) {
            throw new Error(`该优惠券每人限领${coupon.perUserLimit}张`);
        }

        // 创建用户优惠券记录
        const records = [];
        for (let i = 0; i < quantity; i++) {
            const userCoupon = {
                id: generateId(),
                couponId: couponId,
                userId: userId,
                quantity: 1,
                status: 'unused',
                claimedAt: new Date().toISOString(),
                validFrom: coupon.validFrom,
                validUntil: coupon.validDays ? 
                    new Date(Date.now() + coupon.validDays * 24 * 60 * 60 * 1000).toISOString() :
                    coupon.validUntil,
                usedAt: null,
                orderId: null
            };
            
            userCoupons.push(userCoupon);
            records.push(userCoupon);
        }

        localStorage.setItem(STORAGE_KEYS.USER_COUPONS, JSON.stringify(userCoupons));

        // 更新优惠券发行数量
        updateCoupon(couponId, {
            issuedCount: coupon.issuedCount + quantity,
            'stats.claimed': coupon.stats.claimed + quantity
        });

        CouponLogger.log('distribute', couponId, { 
            userId: userId,
            quantity: quantity,
            couponName: coupon.name
        });

        return records;
    }

    /**
     * 使用优惠券
     */
    function useCoupon(userCouponId, orderId, orderAmount) {
        const userCoupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_COUPONS) || '[]');
        const index = userCoupons.findIndex(uc => uc.id === userCouponId);
        
        if (index === -1) {
            throw new Error('用户优惠券不存在');
        }

        const userCoupon = userCoupons[index];
        const coupon = getCoupon(userCoupon.couponId);
        
        if (!coupon) {
            throw new Error('优惠券不存在');
        }

        // 检查状态
        if (userCoupon.status === 'used') {
            throw new Error('优惠券已使用');
        }
        if (userCoupon.status === 'expired') {
            throw new Error('优惠券已过期');
        }

        // 检查有效期
        const now = new Date();
        if (userCoupon.validUntil && new Date(userCoupon.validUntil) < now) {
            userCoupons[index].status = 'expired';
            localStorage.setItem(STORAGE_KEYS.USER_COUPONS, JSON.stringify(userCoupons));
            throw new Error('优惠券已过期');
        }

        // 计算优惠金额
        let discountAmount = 0;
        if (coupon.discountType === 'fixed') {
            discountAmount = coupon.value;
        } else if (coupon.discountType === 'percentage') {
            discountAmount = orderAmount * (coupon.value / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        }

        // 更新用户优惠券
        userCoupons[index].status = 'used';
        userCoupons[index].usedAt = new Date().toISOString();
        userCoupons[index].orderId = orderId;
        userCoupons[index].discountAmount = discountAmount;

        localStorage.setItem(STORAGE_KEYS.USER_COUPONS, JSON.stringify(userCoupons));

        // 更新优惠券统计
        updateCoupon(coupon.id, {
            'stats.used': coupon.stats.used + 1,
            'stats.revenue': coupon.stats.revenue + discountAmount
        });

        CouponLogger.log('use', coupon.id, { 
            userCouponId: userCouponId,
            orderId: orderId,
            discountAmount: discountAmount
        });

        return {
            success: true,
            discountAmount: discountAmount,
            finalAmount: orderAmount - discountAmount
        };
    }

    /**
     * 批量发放优惠券
     */
    function batchDistribute(couponId, userIds) {
        const results = { success: [], failed: [] };
        
        userIds.forEach(userId => {
            try {
                const records = distributeCoupon(couponId, userId);
                results.success.push({ userId: userId, records: records });
            } catch (error) {
                results.failed.push({ userId: userId, reason: error.message });
            }
        });

        CouponLogger.log('batch_distribute', couponId, { 
            successCount: results.success.length,
            failedCount: results.failed.length
        });

        return results;
    }

    /**
     * 兑换码兑换
     */
    function redeemCode(code, userId) {
        const coupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
        
        let targetCoupon = null;
        let codeIndex = -1;
        
        coupons.forEach((coupon, cIdx) => {
            const found = coupon.codes.findIndex(c => c.code === code);
            if (found !== -1) {
                targetCoupon = coupon;
                codeIndex = found;
            }
        });

        if (!targetCoupon) {
            throw new Error('兑换码无效');
        }

        if (targetCoupon.codes[codeIndex].claimed) {
            throw new Error('该兑换码已被使用');
        }

        // 标记兑换码为已使用
        targetCoupon.codes[codeIndex].claimed = true;
        targetCoupon.codes[codeIndex].claimedBy = userId;
        targetCoupon.codes[codeIndex].claimedAt = new Date().toISOString();

        // 更新发行数量
        targetCoupon.issuedCount++;

        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));

        // 发放优惠券给用户
        return distributeCoupon(targetCoupon.id, userId);
    }

    /**
     * 获取用户优惠券
     */
    function getUserCoupons(userId, filters = {}) {
        const userCoupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_COUPONS) || '[]');
        
        const now = new Date();
        
        return userCoupons.filter(uc => {
            if (filters.userId && uc.userId !== filters.userId) return false;
            if (filters.status && uc.status !== filters.status) {
                // 处理过期状态
                if (filters.status === 'expired' && uc.status === 'unused') {
                    if (uc.validUntil && new Date(uc.validUntil) >= now) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            return true;
        }).map(uc => {
            const coupon = getCoupon(uc.couponId);
            return {
                ...uc,
                coupon: coupon
            };
        }).sort((a, b) => {
            // 优先显示可用的
            const aValid = a.status === 'unused' && (!a.validUntil || new Date(a.validUntil) > now);
            const bValid = b.status === 'unused' && (!b.validUntil || new Date(b.validUntil) > now);
            if (aValid && !bValid) return -1;
            if (!aValid && bValid) return 1;
            return new Date(b.claimedAt) - new Date(a.claimedAt);
        });
    }

    /**
     * 使用统计
     */
    const Statistics = {
        // 获取优惠券统计
        getCouponStats(couponId) {
            const coupon = getCoupon(couponId);
            if (!coupon) {
                throw new Error('优惠券不存在');
            }

            const userCoupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_COUPONS) || '[]');
            const relevant = userCoupons.filter(uc => uc.couponId === couponId);

            const unused = relevant.filter(uc => uc.status === 'unused').length;
            const used = relevant.filter(uc => uc.status === 'used').length;
            const expired = relevant.filter(uc => {
                if (uc.status === 'expired') return true;
                if (uc.status === 'unused' && uc.validUntil && new Date(uc.validUntil) < new Date()) {
                    return true;
                }
                return false;
            }).length;

            return {
                coupon: {
                    id: coupon.id,
                    name: coupon.name,
                    type: coupon.type,
                    status: coupon.status
                },
                distribution: {
                    total: coupon.totalCount,
                    issued: coupon.issuedCount,
                    remaining: coupon.totalCount - coupon.issuedCount,
                    issuanceRate: coupon.totalCount > 0 ? 
                        (coupon.issuedCount / coupon.totalCount * 100).toFixed(2) : 0
                },
                usage: {
                    total: relevant.length,
                    unused: unused,
                    used: used,
                    expired: expired,
                    usageRate: coupon.issuedCount > 0 ? 
                        (used / coupon.issuedCount * 100).toFixed(2) : 0
                },
                revenue: {
                    totalDiscount: coupon.stats.revenue,
                    revenuePerUse: used > 0 ? (coupon.stats.revenue / used).toFixed(2) : 0
                },
                recentUsage: relevant
                    .filter(uc => uc.status === 'used')
                    .sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt))
                    .slice(0, 10)
            };
        },

        // 获取使用趋势
        getUsageTrend(couponId, days = 7) {
            const userCoupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_COUPONS) || '[]');
            const relevant = userCoupons.filter(uc => uc.couponId === couponId);
            
            const trend = {
                claim: [],
                use: []
            };
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                trend.claim.push({
                    date: dateStr,
                    count: relevant.filter(uc => uc.claimedAt.startsWith(dateStr)).length
                });
                
                trend.use.push({
                    date: dateStr,
                    count: relevant.filter(uc => uc.usedAt && uc.usedAt.startsWith(dateStr)).length
                });
            }
            
            return trend;
        },

        // 全局统计
        getGlobalStats() {
            const coupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
            const userCoupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_COUPONS) || '[]');

            const totalIssued = coupons.reduce((sum, c) => sum + c.issuedCount, 0);
            const totalUsed = coupons.reduce((sum, c) => sum + c.stats.used, 0);
            const totalRevenue = coupons.reduce((sum, c) => sum + c.stats.revenue, 0);

            return {
                coupons: {
                    total: coupons.length,
                    active: coupons.filter(c => c.status === CouponStatus.ACTIVE).length,
                    expired: coupons.filter(c => c.status === CouponStatus.EXPIRED).length
                },
                distribution: {
                    totalIssued: totalIssued,
                    totalUsers: new Set(userCoupons.map(uc => uc.userId)).size,
                    avgPerUser: totalIssued > 0 ? 
                        (totalIssued / new Set(userCoupons.map(uc => uc.userId)).size).toFixed(2) : 0
                },
                usage: {
                    totalUsed: totalUsed,
                    usageRate: totalIssued > 0 ? (totalUsed / totalIssued * 100).toFixed(2) : 0
                },
                revenue: {
                    totalDiscount: totalRevenue,
                    revenuePerUse: totalUsed > 0 ? (totalRevenue / totalUsed).toFixed(2) : 0,
                    avgOrderValue: totalUsed > 0 ? (totalRevenue / totalUsed * 10).toFixed(2) : 0  // 估算
                }
            };
        },

        // 导出报表
        exportReport(couponId, format = 'json') {
            const data = this.getCouponStats(couponId);
            const trend = this.getUsageTrend(couponId);
            
            return {
                stats: data,
                trend: trend,
                exportedAt: new Date().toISOString()
            };
        }
    };

    /**
     * 过期管理
     */
    const ExpirationManager = {
        // 批量处理过期优惠券
        processExpired() {
            const coupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
            const userCoupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_COUPONS) || '[]');
            const now = new Date();
            
            let updatedCoupons = 0;
            let updatedUserCoupons = 0;

            // 更新优惠券状态
            coupons.forEach(coupon => {
                if (coupon.status === CouponStatus.ACTIVE) {
                    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
                        coupon.status = CouponStatus.EXPIRED;
                        updatedCoupons++;
                    }
                }
            });

            // 更新用户优惠券状态
            userCoupons.forEach(uc => {
                if (uc.status === 'unused') {
                    if (uc.validUntil && new Date(uc.validUntil) < now) {
                        uc.status = 'expired';
                        updatedUserCoupons++;
                    }
                }
            });

            localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
            localStorage.setItem(STORAGE_KEYS.USER_COUPONS, JSON.stringify(userCoupons));

            return {
                updatedCoupons,
                updatedUserCoupons,
                processedAt: now.toISOString()
            };
        },

        // 获取即将过期优惠券
        getExpiringSoon(days = 3) {
            const coupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() + days);

            return coupons.filter(c => {
                if (c.status !== CouponStatus.ACTIVE) return false;
                if (!c.validUntil) return false;
                const expiry = new Date(c.validUntil);
                return expiry > new Date() && expiry <= cutoff;
            }).map(c => ({
                id: c.id,
                name: c.name,
                type: c.type,
                expiresAt: c.validUntil,
                remainingCount: c.totalCount - c.issuedCount,
                remainingDays: Math.ceil((new Date(c.validUntil) - new Date()) / (1000 * 60 * 60 * 24))
            }));
        },

        // 获取过期优惠券
        getExpiredCoupons() {
            const coupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
            
            return coupons.filter(c => c.status === CouponStatus.EXPIRED)
                .map(c => ({
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    expiredAt: c.validUntil,
                    totalIssued: c.issuedCount,
                    totalUsed: c.stats.used,
                    utilizationRate: c.issuedCount > 0 ? 
                        (c.stats.used / c.issuedCount * 100).toFixed(2) : 0
                }))
                .sort((a, b) => new Date(b.expiredAt) - new Date(a.expiredAt));
        }
    };

    /**
     * 日志记录
     */
    const CouponLogger = {
        logs: [],

        log(action, couponId, details = {}) {
            const log = {
                id: generateId(),
                timestamp: new Date().toISOString(),
                action: action,
                couponId: couponId,
                operator: '管理员',
                details: details
            };

            this.logs.unshift(log);
            
            if (this.logs.length > 500) {
                this.logs = this.logs.slice(0, 500);
            }
        },

        getLogs(couponId = null) {
            if (couponId) {
                return this.logs.filter(l => l.couponId === couponId);
            }
            return this.logs;
        }
    };

    // 初始化示例数据
    function initSampleData() {
        if (localStorage.getItem(STORAGE_KEYS.COUPONS)) return;

        const sampleCoupons = [
            {
                id: 'coupon_1',
                name: '新用户专享券',
                type: CouponType.DISCOUNT,
                status: CouponStatus.ACTIVE,
                value: 50,
                discountType: 'fixed',
                minOrderAmount: 200,
                totalCount: 10000,
                issuedCount: 4567,
                perUserLimit: 1,
                validUntil: '2024-12-31T23:59:59.000Z',
                distributeType: DistributeType.AUTO,
                stats: {
                    viewed: 23456,
                    claimed: 4567,
                    used: 1234,
                    revenue: 61700
                },
                creator: '管理员',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-03-15T10:00:00.000Z'
            },
            {
                id: 'coupon_2',
                name: '春季旅游95折券',
                type: CouponType.DISCOUNT,
                status: CouponStatus.ACTIVE,
                value: 5,
                discountType: 'percentage',
                maxDiscount: 100,
                minOrderAmount: 100,
                totalCount: 5000,
                issuedCount: 2345,
                perUserLimit: 2,
                validUntil: '2024-05-31T23:59:59.000Z',
                distributeType: DistributeType.MANUAL,
                stats: {
                    viewed: 12345,
                    claimed: 2345,
                    used: 567,
                    revenue: 28350
                },
                creator: '管理员',
                createdAt: '2024-03-01T00:00:00.000Z',
                updatedAt: '2024-03-15T10:00:00.000Z'
            },
            {
                id: 'coupon_3',
                name: 'VIP会员专属礼包',
                type: CouponType.GIFT,
                status: CouponStatus.ACTIVE,
                value: 200,
                discountType: 'fixed',
                totalCount: 1000,
                issuedCount: 456,
                perUserLimit: 1,
                validUntil: '2024-06-30T23:59:59.000Z',
                distributeType: DistributeType.MANUAL,
                userLevels: ['vip', 'svip'],
                stats: {
                    viewed: 5678,
                    claimed: 456,
                    used: 234,
                    revenue: 46800
                },
                creator: '管理员',
                createdAt: '2024-03-01T00:00:00.000Z',
                updatedAt: '2024-03-15T10:00:00.000Z'
            }
        ];

        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(sampleCoupons));
    }

    initSampleData();

    // 公共API
    return {
        // 枚举
        Status: CouponStatus,
        Type: CouponType,
        DistributeType: DistributeType,

        // 优惠券管理
        createCoupon,
        getCoupons,
        getCoupon,
        updateCoupon,
        deleteCoupon,

        // 发放管理
        distributeCoupon,
        batchDistribute,
        redeemCode,

        // 用户优惠券
        getUserCoupons,
        useCoupon,

        // 统计分析
        Statistics,

        // 过期管理
        ExpirationManager,

        // 日志
        CouponLogger,

        // 工具函数
        generateId,
        generateCode
    };
})();

// 导出为全局变量
window.CouponManager = CouponManager;
