/**
 * 消息管理系统 (Message Manager)
 * 负责站内消息、推送通知、邮件发送、短信发送
 */

const MessageManager = (function() {
    'use strict';

    // 消息类型枚举
    const MessageType = {
        SYSTEM: 'system',           // 系统消息
        USER: 'user',             // 用户消息
        ORDER: 'order',           // 订单消息
        PROMOTION: 'promotion',   // 促销消息
        NOTIFICATION: 'notification', // 通知消息
        ACTIVITY: 'activity',     // 活动消息
        REVIEW: 'review'          // 评价消息
    };

    // 消息状态枚举
    const MessageStatus = {
        DRAFT: 'draft',
        PENDING: 'pending',
        SENDING: 'sending',
        SENT: 'sent',
        FAILED: 'failed',
        READ: 'read'
    };

    // 发送渠道枚举
    const Channel = {
        IN_APP: 'in_app',
        PUSH: 'push',
        EMAIL: 'email',
        SMS: 'sms',
        WECHAT: 'wechat'
    };

    // 存储键名
    const STORAGE_KEYS = {
        MESSAGES: 'msg_messages',
        PUSH_CONFIG: 'msg_push_config',
        TEMPLATES: 'msg_templates',
        SENT_RECORDS: 'msg_sent_records',
        USER_NOTIFICATIONS: 'msg_user_notifications'
    };

    // 生成唯一ID
    function generateId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 创建消息模板
     */
    function createTemplate(data) {
        const templates = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPLATES) || '[]');
        
        const template = {
            id: generateId(),
            name: data.name || '未命名模板',
            type: data.type || MessageType.NOTIFICATION,
            channels: data.channels || [Channel.IN_APP],
            
            // 内容
            title: data.title || '',
            content: data.content || '',
            contentVariables: data.contentVariables || [],  // 内容变量
            link: data.link || '',
            
            // 样式
            style: {
                priority: data.style?.priority || 'normal',
                icon: data.style?.icon || '📢',
                color: data.style?.color || '#3B82F6',
                image: data.style?.image || ''
            },
            
            // 目标设置
            targetAudience: {
                type: data.targetAudience?.type || 'all',  // all, segment, specific
                segments: data.targetAudience?.segments || [],
                userIds: data.targetAudience?.userIds || []
            },
            
            // 发送设置
            schedule: {
                type: data.schedule?.type || 'now',  // now, schedule, triggered
                sendTime: data.schedule?.sendTime || null,
                triggerEvent: data.schedule?.triggerEvent || null
            },
            
            // 统计
            stats: {
                sent: 0,
                delivered: 0,
                read: 0,
                clicked: 0
            },
            
            // 元数据
            creator: data.creator || '管理员',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastUsedAt: null
        };

        templates.push(template);
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
        
        MessageLogger.log('create_template', template.id, { name: template.name });

        return template;
    }

    /**
     * 获取消息模板列表
     */
    function getTemplates(filters = {}) {
        const templates = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPLATES) || '[]');
        
        return templates.filter(t => {
            if (filters.type && t.type !== filters.type) return false;
            if (filters.channel && !t.channels.includes(filters.channel)) return false;
            if (filters.keyword) {
                const keyword = filters.keyword.toLowerCase();
                if (!t.name.toLowerCase().includes(keyword) &&
                    !t.title.toLowerCase().includes(keyword)) {
                    return false;
                }
            }
            return true;
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    /**
     * 获取单个模板
     */
    function getTemplate(id) {
        const templates = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPLATES) || '[]');
        return templates.find(t => t.id === id);
    }

    /**
     * 更新模板
     */
    function updateTemplate(id, data) {
        const templates = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPLATES) || '[]');
        const index = templates.findIndex(t => t.id === id);
        
        if (index === -1) {
            throw new Error('模板不存在');
        }

        templates[index] = {
            ...templates[index],
            ...data,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
        
        MessageLogger.log('update_template', id, { name: templates[index].name });

        return templates[index];
    }

    /**
     * 删除模板
     */
    function deleteTemplate(id) {
        const templates = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPLATES) || '[]');
        const template = templates.find(t => t.id === id);
        
        if (!template) {
            throw new Error('模板不存在');
        }

        const filtered = templates.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered));
        
        MessageLogger.log('delete_template', id, { name: template.name });

        return true;
    }

    /**
     * 发送消息
     */
    function sendMessage(data) {
        const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
        const records = [];
        
        const message = {
            id: generateId(),
            type: data.type || MessageType.NOTIFICATION,
            channel: data.channel || Channel.IN_APP,
            status: MessageStatus.PENDING,
            
            // 内容
            title: data.title,
            content: data.content,
            link: data.link || '',
            
            // 发送设置
            sender: data.sender || '系统',
            recipients: data.recipients || [],  // 用户ID列表
            
            // 目标设置
            targetAudience: data.targetAudience || {
                type: 'all',
                segments: [],
                userIds: []
            },
            
            // 统计
            stats: {
                total: data.recipients?.length || 0,
                sent: 0,
                delivered: 0,
                read: 0,
                failed: 0
            },
            
            // 发送时间
            scheduledAt: data.scheduledAt || null,
            sentAt: null,
            completedAt: null,
            
            // 元数据
            templateId: data.templateId || null,
            createdAt: new Date().toISOString()
        };

        messages.push(message);
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
        
        MessageLogger.log('send_message', message.id, { 
            title: message.title,
            channel: message.channel,
            recipientCount: message.stats.total
        });

        return message;
    }

    /**
     * 批量发送消息
     */
    function batchSend(templateId, recipients = []) {
        const template = getTemplate(templateId);
        if (!template) {
            throw new Error('模板不存在');
        }

        // 替换内容变量
        const title = template.title;
        const content = template.content;

        const results = {
            success: [],
            failed: []
        };

        recipients.forEach(userId => {
            try {
                const message = sendMessage({
                    type: template.type,
                    channel: template.channels[0],
                    title: title,
                    content: content,
                    link: template.link,
                    recipients: [userId],
                    templateId: templateId
                });
                results.success.push({ userId, messageId: message.id });
            } catch (error) {
                results.failed.push({ userId, reason: error.message });
            }
        });

        // 更新模板统计
        updateTemplate(templateId, {
            lastUsedAt: new Date().toISOString(),
            'stats.sent': template.stats.sent + results.success.length
        });

        MessageLogger.log('batch_send', templateId, { 
            successCount: results.success.length,
            failedCount: results.failed.length
        });

        return results;
    }

    /**
     * 获取发送记录
     */
    function getMessages(filters = {}) {
        const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
        
        return messages.filter(m => {
            if (filters.type && m.type !== filters.type) return false;
            if (filters.channel && m.channel !== filters.channel) return false;
            if (filters.status && m.status !== filters.status) return false;
            if (filters.templateId && m.templateId !== filters.templateId) return false;
            if (filters.dateRange) {
                const date = new Date(m.createdAt);
                if (date < filters.dateRange.start || date > filters.dateRange.end) {
                    return false;
                }
            }
            return true;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * 获取消息详情
     */
    function getMessage(id) {
        const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
        return messages.find(m => m.id === id);
    }

    /**
     * 发送站内消息
     */
    function sendInAppMessage(userId, data) {
        const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_NOTIFICATIONS) || '[]');
        
        const notification = {
            id: generateId(),
            userId: userId,
            type: data.type || MessageType.NOTIFICATION,
            title: data.title,
            content: data.content,
            link: data.link || '',
            
            // 样式
            style: {
                icon: data.icon || '📢',
                color: data.color || '#3B82F6'
            },
            
            status: 'unread',
            createdAt: new Date().toISOString(),
            readAt: null
        };

        notifications.push(notification);
        localStorage.setItem(STORAGE_KEYS.USER_NOTIFICATIONS, JSON.stringify(notifications));
        
        MessageLogger.log('send_in_app', userId, { 
            title: notification.title,
            notificationId: notification.id
        });

        return notification;
    }

    /**
     * 获取用户消息
     */
    function getUserMessages(userId, filters = {}) {
        const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_NOTIFICATIONS) || '[]');
        
        return notifications.filter(n => {
            if (n.userId !== userId) return false;
            if (filters.status && n.status !== filters.status) return false;
            if (filters.type && n.type !== filters.type) return false;
            return true;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * 标记消息已读
     */
    function markAsRead(notificationId, userId) {
        const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_NOTIFICATIONS) || '[]');
        const index = notifications.findIndex(n => n.id === notificationId && n.userId === userId);
        
        if (index === -1) {
            throw new Error('消息不存在');
        }

        notifications[index].status = 'read';
        notifications[index].readAt = new Date().toISOString();

        localStorage.setItem(STORAGE_KEYS.USER_NOTIFICATIONS, JSON.stringify(notifications));
        
        return notifications[index];
    }

    /**
     * 标记全部已读
     */
    function markAllAsRead(userId) {
        const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_NOTIFICATIONS) || '[]');
        const now = new Date().toISOString();
        
        let count = 0;
        notifications.forEach((n, i) => {
            if (n.userId === userId && n.status === 'unread') {
                notifications[i].status = 'read';
                notifications[i].readAt = now;
                count++;
            }
        });

        localStorage.setItem(STORAGE_KEYS.USER_NOTIFICATIONS, JSON.stringify(notifications));
        
        return { markedCount: count };
    }

    /**
     * 删除消息
     */
    function deleteMessage(notificationId, userId) {
        const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_NOTIFICATIONS) || '[]');
        const filtered = notifications.filter(n => !(n.id === notificationId && n.userId === userId));
        
        localStorage.setItem(STORAGE_KEYS.USER_NOTIFICATIONS, JSON.stringify(filtered));
        
        return true;
    }

    /**
     * 获取未读消息数
     */
    function getUnreadCount(userId) {
        const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_NOTIFICATIONS) || '[]');
        return notifications.filter(n => n.userId === userId && n.status === 'unread').length;
    }

    /**
     * 推送通知配置
     */
    const PushConfig = {
        config: {
            // 推送渠道配置
            channels: {
                [Channel.PUSH]: {
                    enabled: true,
                    provider: 'fcm',
                    settings: {
                        sound: true,
                        vibration: true,
                        badge: true
                    }
                },
                [Channel.EMAIL]: {
                    enabled: true,
                    provider: 'smtp',
                    settings: {
                        fromName: '游导旅游',
                        fromEmail: 'noreply@youdao.com'
                    }
                },
                [Channel.SMS]: {
                    enabled: false,
                    provider: 'aliyun',
                    settings: {
                        signName: '游导旅游'
                    }
                }
            },
            
            // 通知设置
            notificationSettings: {
                orderUpdates: true,
                promotionUpdates: true,
                systemAnnouncements: true,
                activityUpdates: true
            },
            
            // 静默时间（不发送推送的时间段）
            quietHours: {
                enabled: true,
                start: '22:00',
                end: '08:00'
            }
        },

        // 获取配置
        getConfig() {
            let config = JSON.parse(localStorage.getItem(STORAGE_KEYS.PUSH_CONFIG) || 'null');
            if (!config) {
                config = this.config;
                localStorage.setItem(STORAGE_KEYS.PUSH_CONFIG, JSON.stringify(config));
            }
            return config;
        },

        // 更新配置
        updateConfig(data) {
            const config = this.getConfig();
            Object.assign(config, data);
            localStorage.setItem(STORAGE_KEYS.PUSH_CONFIG, JSON.stringify(config));
            return config;
        },

        // 启用/禁用渠道
        toggleChannel(channel, enabled) {
            const config = this.getConfig();
            if (config.channels[channel]) {
                config.channels[channel].enabled = enabled;
                localStorage.setItem(STORAGE_KEYS.PUSH_CONFIG, JSON.stringify(config));
            }
            return config;
        }
    };

    /**
     * 模拟发送邮件
     */
    const EmailService = {
        // 发送邮件
        async send(data) {
            // 模拟邮件发送
            console.log('📧 发送邮件:', {
                to: data.to,
                subject: data.subject,
                content: data.content
            });

            const record = {
                id: generateId(),
                type: Channel.EMAIL,
                to: data.to,
                subject: data.subject,
                content: data.content,
                status: 'sent',
                sentAt: new Date().toISOString()
            };

            // 保存发送记录
            const records = JSON.parse(localStorage.getItem(STORAGE_KEYS.SENT_RECORDS) || '[]');
            records.push(record);
            localStorage.setItem(STORAGE_KEYS.SENT_RECORDS, JSON.stringify(records));

            MessageLogger.log('send_email', record.id, { 
                to: data.to,
                subject: data.subject
            });

            return { success: true, record };
        },

        // 批量发送
        async batchSend(recipients, data) {
            const results = { success: 0, failed: 0 };
            
            for (const recipient of recipients) {
                try {
                    await this.send({
                        to: recipient.email,
                        subject: data.subject,
                        content: data.content
                    });
                    results.success++;
                } catch (error) {
                    results.failed++;
                }
            }

            return results;
        },

        // 发送验证码
        async sendVerificationCode(email, code) {
            return this.send({
                to: email,
                subject: '【游导旅游】您的验证码',
                content: `您的验证码是：${code}，5分钟内有效。请勿泄露给他人。`
            });
        }
    };

    /**
     * 模拟发送短信
     */
    const SMSService = {
        // 发送短信
        async send(data) {
            // 模拟短信发送
            console.log('📱 发送短信:', {
                to: data.to,
                content: data.content
            });

            const record = {
                id: generateId(),
                type: Channel.SMS,
                to: data.to,
                content: data.content,
                status: 'sent',
                sentAt: new Date().toISOString()
            };

            // 保存发送记录
            const records = JSON.parse(localStorage.getItem(STORAGE_KEYS.SENT_RECORDS) || '[]');
            records.push(record);
            localStorage.setItem(STORAGE_KEYS.SENT_RECORDS, JSON.stringify(records));

            MessageLogger.log('send_sms', record.id, { to: data.to });

            return { success: true, record };
        },

        // 发送验证码
        async sendVerificationCode(phone, code) {
            return this.send({
                to: phone,
                content: `【游导旅游】您的验证码是：${code}，5分钟内有效。`
            });
        },

        // 发送通知
        async sendNotification(phone, message) {
            return this.send({
                to: phone,
                content: `【游导旅游】${message}`
            });
        }
    };

    /**
     * 消息统计
     */
    const Statistics = {
        // 获取消息统计
        getMessageStats(messageId) {
            const message = getMessage(messageId);
            if (!message) {
                throw new Error('消息不存在');
            }

            return {
                message: {
                    id: message.id,
                    title: message.title,
                    type: message.type,
                    channel: message.channel,
                    status: message.status
                },
                stats: message.stats,
                deliveryRate: message.stats.total > 0 ? 
                    (message.stats.delivered / message.stats.total * 100).toFixed(2) : 0,
                readRate: message.stats.delivered > 0 ? 
                    (message.stats.read / message.stats.delivered * 100).toFixed(2) : 0,
                clickRate: message.stats.delivered > 0 ? 
                    (message.stats.clicked / message.stats.delivered * 100).toFixed(2) : 0
            };
        },

        // 获取发送记录统计
        getSentRecords(filters = {}) {
            const records = JSON.parse(localStorage.getItem(STORAGE_KEYS.SENT_RECORDS) || '[]');
            
            return records.filter(r => {
                if (filters.type && r.type !== filters.type) return false;
                if (filters.status && r.status !== filters.status) return false;
                if (filters.dateRange) {
                    const date = new Date(r.sentAt);
                    if (date < filters.dateRange.start || date > filters.dateRange.end) {
                        return false;
                    }
                }
                return true;
            }).sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
        },

        // 全局统计
        getGlobalStats() {
            const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
            const records = JSON.parse(localStorage.getItem(STORAGE_KEYS.SENT_RECORDS) || '[]');
            const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_NOTIFICATIONS) || '[]');
            
            const totalSent = records.length;
            const byChannel = {};
            
            Object.values(Channel).forEach(channel => {
                byChannel[channel] = records.filter(r => r.type === channel).length;
            });

            return {
                messages: {
                    total: messages.length,
                    pending: messages.filter(m => m.status === MessageStatus.PENDING).length,
                    sent: messages.filter(m => m.status === MessageStatus.SENT).length,
                    failed: messages.filter(m => m.status === MessageStatus.FAILED).length
                },
                sentRecords: {
                    total: totalSent,
                    byChannel: byChannel
                },
                userNotifications: {
                    total: notifications.length,
                    unread: notifications.filter(n => n.status === 'unread').length
                }
            };
        },

        // 获取趋势数据
        getTrend(days = 7) {
            const records = JSON.parse(localStorage.getItem(STORAGE_KEYS.SENT_RECORDS) || '[]');
            const trend = [];
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                const dayRecords = records.filter(r => r.sentAt.startsWith(dateStr));
                
                trend.push({
                    date: dateStr,
                    email: dayRecords.filter(r => r.type === Channel.EMAIL).length,
                    sms: dayRecords.filter(r => r.type === Channel.SMS).length,
                    push: dayRecords.filter(r => r.type === Channel.PUSH).length,
                    total: dayRecords.length
                });
            }
            
            return trend;
        }
    };

    /**
     * 日志记录
     */
    const MessageLogger = {
        logs: [],

        log(action, messageId, details = {}) {
            const log = {
                id: generateId(),
                timestamp: new Date().toISOString(),
                action: action,
                messageId: messageId,
                operator: '管理员',
                details: details
            };

            this.logs.unshift(log);
            
            if (this.logs.length > 500) {
                this.logs = this.logs.slice(0, 500);
            }
        },

        getLogs(messageId = null) {
            if (messageId) {
                return this.logs.filter(l => l.messageId === messageId);
            }
            return this.logs;
        }
    };

    // 初始化示例数据
    function initSampleData() {
        if (localStorage.getItem(STORAGE_KEYS.TEMPLATES)) return;

        const sampleTemplates = [
            {
                id: 'template_1',
                name: '订单确认通知',
                type: MessageType.ORDER,
                channels: [Channel.IN_APP, Channel.PUSH, Channel.SMS],
                title: '订单确认通知',
                content: '您的订单 #{orderId} 已确认，感谢您选择游导旅游！',
                link: '/my-orders.html',
                stats: { sent: 1234, delivered: 1230, read: 980, clicked: 456 },
                creator: '管理员',
                createdAt: '2024-01-01T00:00:00.000Z',
                lastUsedAt: '2024-03-15T10:00:00.000Z'
            },
            {
                id: 'template_2',
                name: '新用户欢迎消息',
                type: MessageType.SYSTEM,
                channels: [Channel.IN_APP, Channel.EMAIL],
                title: '欢迎加入游导旅游！',
                content: '亲爱的用户，欢迎您加入游导旅游大家庭。立即探索精彩旅行目的地，享受专属优惠！',
                link: '/destinations.html',
                stats: { sent: 567, delivered: 565, read: 540, clicked: 234 },
                creator: '管理员',
                createdAt: '2024-01-01T00:00:00.000Z',
                lastUsedAt: '2024-03-15T10:00:00.000Z'
            },
            {
                id: 'template_3',
                name: '促销活动通知',
                type: MessageType.PROMOTION,
                channels: [Channel.IN_APP, Channel.PUSH, Channel.EMAIL],
                title: '🎉 限时优惠来袭！',
                content: '春季大促进行中，全场8折起，还有更多好礼等你来拿！',
                link: '/promotions.html',
                stats: { sent: 3456, delivered: 3400, read: 2100, clicked: 890 },
                creator: '管理员',
                createdAt: '2024-03-01T00:00:00.000Z',
                lastUsedAt: '2024-03-15T10:00:00.000Z'
            }
        ];

        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(sampleTemplates));
    }

    initSampleData();

    // 公共API
    return {
        // 枚举
        Type: MessageType,
        Status: MessageStatus,
        Channel: Channel,

        // 模板管理
        createTemplate,
        getTemplates,
        getTemplate,
        updateTemplate,
        deleteTemplate,

        // 消息发送
        sendMessage,
        batchSend,
        getMessages,
        getMessage,

        // 站内消息
        sendInAppMessage,
        getUserMessages,
        markAsRead,
        markAllAsRead,
        deleteMessage,
        getUnreadCount,

        // 服务
        PushConfig,
        EmailService,
        SMSService,

        // 统计
        Statistics,

        // 日志
        MessageLogger,

        // 工具函数
        generateId
    };
})();

// 导出为全局变量
window.MessageManager = MessageManager;
