/**
 * 任务调度系统 (Task Scheduler)
 * 负责定时任务、任务监控、执行日志、失败重试
 */

const TaskScheduler = (function() {
    'use strict';

    // 任务状态枚举
    const TaskStatus = {
        PENDING: 'pending',       // 待执行
        RUNNING: 'running',       // 执行中
        COMPLETED: 'completed',   // 已完成
        FAILED: 'failed',         // 失败
        CANCELLED: 'cancelled',   // 已取消
        RETRYING: 'retrying'      // 重试中
    };

    // 任务类型枚举
    const TaskType = {
        CRON: 'cron',             // 定时任务（Cron表达式）
        DELAYED: 'delayed',       // 延迟任务
        RECURRING: 'recurring',   // 循环任务
        ONCE: 'once'              // 单次任务
    };

    // 内置任务类型
    const BuiltInTasks = {
        // 优惠券相关
        COUPON_EXPIRE_CHECK: 'coupon_expire_check',       // 优惠券过期检查
        COUPON_REMINDER: 'coupon_reminder',               // 优惠券到期提醒
        
        // 会员相关
        MEMBER_LEVEL_CHECK: 'member_level_check',         // 会员等级检查
        POINTS_EXPIRE_CHECK: 'points_expire_check',       // 积分过期检查
        BIRTHDAY_CHECK: 'birthday_check',                  // 生日检查
        
        // 数据相关
        DATA_BACKUP: 'data_backup',                       // 数据备份
        STATISTICS_UPDATE: 'statistics_update',           // 统计更新
        CACHE_CLEANUP: 'cache_cleanup',                    // 缓存清理
        
        // 活动相关
        ACTIVITY_STATUS_CHECK: 'activity_status_check',    // 活动状态检查
        ACTIVITY_END_NOTIFY: 'activity_end_notify',        // 活动结束通知
        
        // 消息相关
        MESSAGE_CLEANUP: 'message_cleanup',                // 消息清理
        NOTIFICATION_SUMMARY: 'notification_summary'       // 通知汇总
    };

    // 存储键名
    const STORAGE_KEYS = {
        TASKS: 'task_tasks',
        EXECUTIONS: 'task_executions',
        CONFIG: 'task_config'
    };

    // 生成唯一ID
    function generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 任务处理器注册表
    const handlers = {};

    /**
     * 注册任务处理器
     */
    function registerHandler(taskType, handler) {
        handlers[taskType] = handler;
    }

    /**
     * 创建任务
     */
    function createTask(data) {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
        
        const task = {
            id: generateId(),
            name: data.name || '未命名任务',
            type: data.type || TaskType.ONCE,
            status: TaskStatus.PENDING,
            
            // 任务配置
            handler: data.handler || data.taskType,
            params: data.params || {},
            
            // 执行时间配置
            schedule: {
                // Cron表达式（用于CRON和RECURRING类型）
                cron: data.schedule?.cron || null,
                // 延迟时间（毫秒，用于DELAYED类型）
                delay: data.schedule?.delay || null,
                // 执行时间点（用于ONCE类型）
                executeAt: data.schedule?.executeAt || null,
                // 循环间隔（毫秒，用于RECURRING类型）
                interval: data.schedule?.interval || null
            },
            
            // 重试配置
            retry: {
                enabled: data.retry?.enabled !== false,
                maxRetries: data.retry?.maxRetries || 3,
                retryDelay: data.retry?.retryDelay || 60000,  // 默认1分钟
                backoff: data.retry?.backoff || 'exponential'  // exponential, linear
            },
            
            // 超时配置
            timeout: data.timeout || 300000,  // 默认5分钟
            
            // 通知配置
            notifications: {
                onStart: data.notifications?.onStart || false,
                onComplete: data.notifications?.onComplete || false,
                onFail: data.notifications?.onFail !== false,
                email: data.notifications?.email || null
            },
            
            // 统计
            stats: {
                totalRuns: 0,
                successRuns: 0,
                failedRuns: 0,
                avgDuration: 0,
                lastRunAt: null,
                lastSuccessAt: null,
                lastFailAt: null
            },
            
            // 元数据
            enabled: data.enabled !== false,
            createdBy: data.createdBy || '管理员',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            nextRunAt: calculateNextRun(data.schedule, data.type),
            lastRunAt: null
        };

        tasks.push(task);
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        
        TaskLogger.log('create', task.id, { name: task.name });

        return task;
    }

    /**
     * 获取任务列表
     */
    function getTasks(filters = {}) {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
        
        // 更新待执行任务的状态
        const now = new Date();
        tasks.forEach(task => {
            if (task.status === TaskStatus.RUNNING) {
                // 检查是否超时
                const executions = getExecutions(task.id);
                const running = executions.find(e => e.taskId === task.id && e.status === 'running');
                if (running) {
                    const elapsed = now - new Date(running.startedAt);
                    if (elapsed > task.timeout) {
                        // 标记为超时失败
                        running.status = 'timeout';
                        running.endedAt = now.toISOString();
                        running.error = 'Task execution timeout';
                        task.stats.failedRuns++;
                        task.status = TaskStatus.FAILED;
                    }
                }
            }
            
            // 更新下一次执行时间
            if (task.enabled && task.status !== TaskStatus.RUNNING) {
                task.nextRunAt = calculateNextRun(task.schedule, task.type);
            }
        });
        
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

        return tasks.filter(task => {
            if (filters.status && task.status !== filters.status) return false;
            if (filters.type && task.type !== filters.type) return false;
            if (filters.enabled !== undefined && task.enabled !== filters.enabled) return false;
            if (filters.keyword) {
                const keyword = filters.keyword.toLowerCase();
                if (!task.name.toLowerCase().includes(keyword)) {
                    return false;
                }
            }
            return true;
        }).sort((a, b) => {
            if (filters.sortBy === 'nextRun') {
                return new Date(a.nextRunAt || 0) - new Date(b.nextRunAt || 0);
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    /**
     * 获取单个任务
     */
    function getTask(id) {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
        return tasks.find(t => t.id === id);
    }

    /**
     * 更新任务
     */
    function updateTask(id, data) {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
        const index = tasks.findIndex(t => t.id === id);
        
        if (index === -1) {
            throw new Error('任务不存在');
        }

        // 不能更新运行中的任务
        if (tasks[index].status === TaskStatus.RUNNING) {
            throw new Error('任务正在执行中，无法更新');
        }

        tasks[index] = {
            ...tasks[index],
            ...data,
            updatedAt: new Date().toISOString()
        };

        // 重新计算下次执行时间
        if (data.schedule) {
            tasks[index].nextRunAt = calculateNextRun(tasks[index].schedule, tasks[index].type);
        }

        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        
        TaskLogger.log('update', id, { 
            name: tasks[index].name,
            changes: Object.keys(data)
        });

        return tasks[index];
    }

    /**
     * 删除任务
     */
    function deleteTask(id) {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
        const task = tasks.find(t => t.id === id);
        
        if (!task) {
            throw new Error('任务不存在');
        }

        if (task.status === TaskStatus.RUNNING) {
            throw new Error('任务正在执行中，无法删除');
        }

        const filtered = tasks.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
        
        TaskLogger.log('delete', id, { name: task.name });

        return true;
    }

    /**
     * 执行任务
     */
    async function executeTask(taskId) {
        const task = getTask(taskId);
        if (!task) {
            throw new Error('任务不存在');
        }

        if (!task.enabled) {
            throw new Error('任务已禁用');
        }

        if (task.status === TaskStatus.RUNNING) {
            throw new Error('任务正在执行中');
        }

        // 创建执行记录
        const execution = {
            id: generateId(),
            taskId: task.id,
            status: 'running',
            startedAt: new Date().toISOString(),
            endedAt: null,
            duration: null,
            result: null,
            error: null,
            retryCount: 0
        };

        const executions = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXECUTIONS) || '[]');
        executions.push(execution);
        localStorage.setItem(STORAGE_KEYS.EXECUTIONS, JSON.stringify(executions));

        // 更新任务状态
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        tasks[taskIndex].status = TaskStatus.RUNNING;
        tasks[taskIndex].stats.totalRuns++;
        tasks[taskIndex].lastRunAt = execution.startedAt;
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

        TaskLogger.log('execute_start', taskId, { taskName: task.name });

        // 执行任务
        try {
            const handler = handlers[task.handler];
            if (!handler) {
                throw new Error(`未找到任务处理器: ${task.handler}`);
            }

            // 设置超时
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Task timeout')), task.timeout);
            });

            const result = await Promise.race([
                handler(task.params),
                timeoutPromise
            ]);

            // 任务成功
            execution.status = 'completed';
            execution.endedAt = new Date().toISOString();
            execution.duration = new Date(execution.endedAt) - new Date(execution.startedAt);
            execution.result = result;

            // 更新任务统计
            const idx = tasks.findIndex(t => t.id === taskId);
            tasks[idx].status = task.type === TaskType.RECURRING ? TaskStatus.PENDING : TaskStatus.COMPLETED;
            tasks[idx].stats.successRuns++;
            tasks[idx].stats.lastSuccessAt = execution.endedAt;
            tasks[idx].nextRunAt = calculateNextRun(tasks[idx].schedule, tasks[idx].type);
            
            // 更新平均执行时间
            const avgDuration = tasks[idx].stats.avgDuration;
            const runs = tasks[idx].stats.successRuns;
            tasks[idx].stats.avgDuration = (avgDuration * (runs - 1) + execution.duration) / runs;

            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

            // 更新执行记录
            const execIndex = executions.findIndex(e => e.id === execution.id);
            executions[execIndex] = execution;
            localStorage.setItem(STORAGE_KEYS.EXECUTIONS, JSON.stringify(executions));

            TaskLogger.log('execute_complete', taskId, { 
                taskName: task.name,
                duration: execution.duration
            });

            return { success: true, execution, result };

        } catch (error) {
            // 任务失败
            execution.status = 'failed';
            execution.endedAt = new Date().toISOString();
            execution.duration = new Date(execution.endedAt) - new Date(execution.startedAt);
            execution.error = error.message;

            // 检查是否需要重试
            const shouldRetry = task.retry.enabled && 
                execution.retryCount < task.retry.maxRetries;

            // 更新任务统计
            const idx = tasks.findIndex(t => t.id === taskId);
            tasks[idx].stats.failedRuns++;
            tasks[idx].stats.lastFailAt = execution.endedAt;
            tasks[idx].status = shouldRetry ? TaskStatus.RETRYING : TaskStatus.FAILED;

            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

            // 更新执行记录
            const execIndex = executions.findIndex(e => e.id === execution.id);
            executions[execIndex] = execution;
            localStorage.setItem(STORAGE_KEYS.EXECUTIONS, JSON.stringify(executions));

            TaskLogger.log('execute_fail', taskId, { 
                taskName: task.name,
                error: error.message,
                willRetry: shouldRetry
            });

            // 如果需要重试，调度重试
            if (shouldRetry) {
                scheduleRetry(taskId, execution.id, task.retry);
            }

            return { success: false, execution, error: error.message };
        }
    }

    /**
     * 调度重试
     */
    function scheduleRetry(taskId, executionId, retryConfig) {
        let delay = retryConfig.retryDelay;
        
        if (retryConfig.backoff === 'exponential') {
            const executions = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXECUTIONS) || '[]');
            const execution = executions.find(e => e.id === executionId);
            if (execution) {
                delay = retryConfig.retryDelay * Math.pow(2, execution.retryCount);
                execution.retryCount++;
            }
        }

        setTimeout(() => {
            const task = getTask(taskId);
            if (task && task.enabled) {
                executeTask(taskId);
            }
        }, delay);
    }

    /**
     * 取消任务
     */
    function cancelTask(taskId) {
        const task = getTask(taskId);
        if (!task) {
            throw new Error('任务不存在');
        }

        if (task.status === TaskStatus.RUNNING) {
            throw new Error('任务正在执行中，无法取消');
        }

        updateTask(taskId, { status: TaskStatus.CANCELLED });
        
        return true;
    }

    /**
     * 启用/禁用任务
     */
    function toggleTask(taskId, enabled) {
        const task = getTask(taskId);
        if (!task) {
            throw new Error('任务不存在');
        }

        return updateTask(taskId, { enabled });
    }

    /**
     * 获取执行记录
     */
    function getExecutions(taskId, filters = {}) {
        const executions = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXECUTIONS) || '[]');
        
        return executions.filter(e => {
            if (taskId && e.taskId !== taskId) return false;
            if (filters.status && e.status !== filters.status) return false;
            if (filters.dateRange) {
                const date = new Date(e.startedAt);
                if (date < filters.dateRange.start || date > filters.dateRange.end) {
                    return false;
                }
            }
            return true;
        }).sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
    }

    /**
     * 计算下次执行时间
     */
    function calculateNextRun(schedule, type) {
        const now = new Date();

        switch (type) {
            case TaskType.CRON:
                // 简单的Cron解析（仅支持标准格式）
                if (schedule.cron) {
                    // 这里应该使用完整的Cron解析器，这里是简化版
                    return new Date(now.getTime() + 60000); // 默认1分钟后
                }
                break;

            case TaskType.DELAYED:
                if (schedule.delay) {
                    return new Date(now.getTime() + schedule.delay);
                }
                break;

            case TaskType.RECURRING:
                if (schedule.interval) {
                    return new Date(now.getTime() + schedule.interval);
                }
                break;

            case TaskType.ONCE:
                if (schedule.executeAt) {
                    return new Date(schedule.executeAt);
                }
                break;
        }

        return null;
    }

    /**
     * 任务监控
     */
    const Monitoring = {
        // 获取实时监控数据
        getRealtimeStatus() {
            const tasks = getTasks();
            const executions = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXECUTIONS) || '[]');
            
            const running = tasks.filter(t => t.status === TaskStatus.RUNNING);
            const pending = tasks.filter(t => t.status === TaskStatus.PENDING);
            const failed = tasks.filter(t => t.status === TaskStatus.FAILED);
            
            // 最近执行记录
            const recentExecutions = executions
                .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
                .slice(0, 10);

            // 即将执行的任务
            const upcomingTasks = tasks
                .filter(t => t.enabled && t.nextRunAt)
                .sort((a, b) => new Date(a.nextRunAt) - new Date(b.nextRunAt))
                .slice(0, 5);

            return {
                summary: {
                    total: tasks.length,
                    running: running.length,
                    pending: pending.length,
                    failed: failed.length,
                    scheduled: tasks.filter(t => t.enabled).length
                },
                runningTasks: running.map(t => ({
                    id: t.id,
                    name: t.name,
                    startedAt: t.lastRunAt,
                    duration: t.lastRunAt ? 
                        Date.now() - new Date(t.lastRunAt).getTime() : 0
                })),
                recentExecutions: recentExecutions,
                upcomingTasks: upcomingTasks.map(t => ({
                    id: t.id,
                    name: t.name,
                    nextRunAt: t.nextRunAt
                }))
            };
        },

        // 健康检查
        healthCheck() {
            const tasks = getTasks();
            const issues = [];

            // 检查长时间运行的任务
            const now = Date.now();
            tasks.filter(t => t.status === TaskStatus.RUNNING).forEach(task => {
                const executions = getExecutions(task.id);
                const running = executions.find(e => e.status === 'running');
                if (running) {
                    const duration = now - new Date(running.startedAt).getTime();
                    if (duration > task.timeout) {
                        issues.push({
                            type: 'timeout',
                            taskId: task.id,
                            taskName: task.name,
                            duration: duration,
                            message: `任务 ${task.name} 执行超时`
                        });
                    }
                }
            });

            // 检查连续失败的任务
            tasks.forEach(task => {
                if (task.stats.totalRuns > 0 && task.stats.failedRuns === task.stats.totalRuns) {
                    issues.push({
                        type: 'all_failed',
                        taskId: task.id,
                        taskName: task.name,
                        message: `任务 ${task.name} 所有执行均失败`
                    });
                }
            });

            return {
                healthy: issues.length === 0,
                issues: issues,
                checkedAt: new Date().toISOString()
            };
        }
    };

    /**
     * 任务统计
     */
    const Statistics = {
        // 获取任务统计
        getTaskStats(taskId) {
            const task = getTask(taskId);
            if (!task) {
                throw new Error('任务不存在');
            }

            return {
                task: {
                    id: task.id,
                    name: task.name,
                    type: task.type,
                    status: task.status,
                    enabled: task.enabled
                },
                stats: task.stats,
                successRate: task.stats.totalRuns > 0 ? 
                    (task.stats.successRuns / task.stats.totalRuns * 100).toFixed(2) : 0,
                avgDuration: task.stats.avgDuration ? 
                    (task.stats.avgDuration / 1000).toFixed(2) + 's' : 'N/A'
            };
        },

        // 获取执行趋势
        getExecutionTrend(taskId, days = 7) {
            const executions = getExecutions(taskId);
            const trend = [];
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                const dayExecutions = executions.filter(e => 
                    e.startedAt.startsWith(dateStr)
                );

                trend.push({
                    date: dateStr,
                    total: dayExecutions.length,
                    success: dayExecutions.filter(e => e.status === 'completed').length,
                    failed: dayExecutions.filter(e => e.status === 'failed').length,
                    avgDuration: dayExecutions.length > 0 ? 
                        (dayExecutions.reduce((sum, e) => sum + (e.duration || 0), 0) / dayExecutions.length / 1000).toFixed(2) : 0
                });
            }
            
            return trend;
        },

        // 全局统计
        getGlobalStats() {
            const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
            const executions = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXECUTIONS) || '[]');
            
            const totalRuns = tasks.reduce((sum, t) => sum + t.stats.totalRuns, 0);
            const totalSuccess = tasks.reduce((sum, t) => sum + t.stats.successRuns, 0);
            const totalFailed = tasks.reduce((sum, t) => sum + t.stats.failedRuns, 0);

            return {
                tasks: {
                    total: tasks.length,
                    enabled: tasks.filter(t => t.enabled).length,
                    byType: {
                        [TaskType.ONCE]: tasks.filter(t => t.type === TaskType.ONCE).length,
                        [TaskType.CRON]: tasks.filter(t => t.type === TaskType.CRON).length,
                        [TaskType.RECURRING]: tasks.filter(t => t.type === TaskType.RECURRING).length,
                        [TaskType.DELAYED]: tasks.filter(t => t.type === TaskType.DELAYED).length
                    },
                    byStatus: {
                        [TaskStatus.PENDING]: tasks.filter(t => t.status === TaskStatus.PENDING).length,
                        [TaskStatus.RUNNING]: tasks.filter(t => t.status === TaskStatus.RUNNING).length,
                        [TaskStatus.COMPLETED]: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
                        [TaskStatus.FAILED]: tasks.filter(t => t.status === TaskStatus.FAILED).length
                    }
                },
                executions: {
                    total: executions.length,
                    success: totalSuccess,
                    failed: totalFailed,
                    successRate: totalRuns > 0 ? (totalSuccess / totalRuns * 100).toFixed(2) : 0
                }
            };
        }
    };

    /**
     * 内置任务处理器
     */
    const BuiltInHandlers = {
        // 优惠券过期检查
        [BuiltInTasks.COUPON_EXPIRE_CHECK]: function(params) {
            console.log('执行优惠券过期检查...');
            if (window.CouponManager) {
                return window.CouponManager.ExpirationManager.processExpired();
            }
            return { processed: 0 };
        },

        // 优惠券到期提醒
        [BuiltInTasks.COUPON_REMINDER]: function(params) {
            console.log('执行优惠券到期提醒...');
            if (window.CouponManager) {
                const expiringSoon = window.CouponManager.ExpirationManager.getExpiringSoon(3);
                // 发送提醒消息
                expiringSoon.forEach(coupon => {
                    console.log(`优惠券 ${coupon.name} 即将在${coupon.remainingDays}天后过期`);
                });
                return { notified: expiringSoon.length };
            }
            return { notified: 0 };
        },

        // 会员等级检查
        [BuiltInTasks.MEMBER_LEVEL_CHECK]: function(params) {
            console.log('执行会员等级检查...');
            if (window.MemberManager) {
                const members = window.MemberManager.getMembers();
                members.forEach(member => {
                    const currentLevel = window.MemberManager.getLevel(member.level);
                    const newLevel = window.MemberManager.getLevelByPoints(member.points);
                    if (currentLevel.id !== newLevel.id) {
                        console.log(`会员 ${member.userId} 从 ${currentLevel.name} 升级到 ${newLevel.name}`);
                    }
                });
                return { checked: members.length };
            }
            return { checked: 0 };
        },

        // 积分过期检查
        [BuiltInTasks.POINTS_EXPIRE_CHECK]: function(params) {
            console.log('执行积分过期检查...');
            // 实现积分过期逻辑
            return { processed: 0 };
        },

        // 生日检查
        [BuiltInTasks.BIRTHDAY_CHECK]: function(params) {
            console.log('执行生日检查...');
            if (window.MemberManager) {
                const members = window.MemberManager.getMembers();
                const today = new Date();
                const birthdays = members.filter(m => {
                    if (!m.profile.birthday) return false;
                    const bday = new Date(m.profile.birthday);
                    return today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate();
                });
                birthdays.forEach(member => {
                    console.log(`今天是会员 ${member.userId} 的生日！`);
                });
                return { birthdays: birthdays.length };
            }
            return { birthdays: 0 };
        },

        // 数据备份
        [BuiltInTasks.DATA_BACKUP]: function(params) {
            console.log('执行数据备份...');
            const backup = {};
            Object.keys(localStorage).forEach(key => {
                try {
                    backup[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    backup[key] = localStorage.getItem(key);
                }
            });
            console.log('数据备份完成，共备份', Object.keys(backup).length, '项数据');
            return { backedUp: Object.keys(backup).length };
        },

        // 统计更新
        [BuiltInTasks.STATISTICS_UPDATE]: function(params) {
            console.log('执行统计更新...');
            return { updated: true };
        },

        // 缓存清理
        [BuiltInTasks.CACHE_CLEANUP]: function(params) {
            console.log('执行缓存清理...');
            // 清理过期的localStorage数据
            return { cleaned: 0 };
        },

        // 活动状态检查
        [BuiltInTasks.ACTIVITY_STATUS_CHECK]: function(params) {
            console.log('执行活动状态检查...');
            if (window.ActivityManager) {
                const activities = window.ActivityManager.getActivities();
                activities.forEach(activity => {
                    console.log(`活动 ${activity.name}: ${activity.status}`);
                });
                return { checked: activities.length };
            }
            return { checked: 0 };
        },

        // 消息清理
        [BuiltInTasks.MESSAGE_CLEANUP]: function(params) {
            console.log('执行消息清理...');
            const notifications = JSON.parse(localStorage.getItem('msg_user_notifications') || '[]');
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const filtered = notifications.filter(n => 
                new Date(n.createdAt) > thirtyDaysAgo
            );
            
            localStorage.setItem('msg_user_notifications', JSON.stringify(filtered));
            return { cleaned: notifications.length - filtered.length };
        }
    };

    // 注册内置处理器
    Object.keys(BuiltInHandlers).forEach(key => {
        registerHandler(key, BuiltInHandlers[key]);
    });

    /**
     * 日志记录
     */
    const TaskLogger = {
        logs: [],

        log(action, taskId, details = {}) {
            const log = {
                id: generateId(),
                timestamp: new Date().toISOString(),
                action: action,
                taskId: taskId,
                operator: '系统',
                details: details
            };

            this.logs.unshift(log);
            
            if (this.logs.length > 500) {
                this.logs = this.logs.slice(0, 500);
            }
        },

        getLogs(taskId = null) {
            if (taskId) {
                return this.logs.filter(l => l.taskId === taskId);
            }
            return this.logs;
        }
    };

    // 初始化示例数据
    function initSampleData() {
        if (localStorage.getItem(STORAGE_KEYS.TASKS)) return;

        const sampleTasks = [
            {
                id: 'task_1',
                name: '每日数据统计更新',
                type: TaskType.RECURRING,
                status: TaskStatus.PENDING,
                handler: BuiltInTasks.STATISTICS_UPDATE,
                schedule: { interval: 24 * 60 * 60 * 1000 },  // 每天执行
                enabled: true,
                stats: { totalRuns: 45, successRuns: 44, failedRuns: 1, avgDuration: 5000 },
                createdAt: '2024-01-01T00:00:00.000Z',
                nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'task_2',
                name: '优惠券过期检查',
                type: TaskType.RECURRING,
                status: TaskStatus.PENDING,
                handler: BuiltInTasks.COUPON_EXPIRE_CHECK,
                schedule: { interval: 60 * 60 * 1000 },  // 每小时执行
                enabled: true,
                stats: { totalRuns: 720, successRuns: 720, failedRuns: 0, avgDuration: 200 },
                createdAt: '2024-01-01T00:00:00.000Z',
                nextRunAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
            },
            {
                id: 'task_3',
                name: '会员生日检查',
                type: TaskType.RECURRING,
                status: TaskStatus.PENDING,
                handler: BuiltInTasks.BIRTHDAY_CHECK,
                schedule: { interval: 24 * 60 * 60 * 1000 },  // 每天执行
                enabled: true,
                stats: { totalRuns: 90, successRuns: 90, failedRuns: 0, avgDuration: 1000 },
                createdAt: '2024-01-01T00:00:00.000Z',
                nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'task_4',
                name: '每日数据备份',
                type: TaskType.RECURRING,
                status: TaskStatus.PENDING,
                handler: BuiltInTasks.DATA_BACKUP,
                schedule: { interval: 24 * 60 * 60 * 1000 },  // 每天凌晨2点
                enabled: true,
                stats: { totalRuns: 45, successRuns: 45, failedRuns: 0, avgDuration: 10000 },
                createdAt: '2024-01-01T00:00:00.000Z',
                nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'task_5',
                name: '消息清理',
                type: TaskType.RECURRING,
                status: TaskStatus.PENDING,
                handler: BuiltInTasks.MESSAGE_CLEANUP,
                schedule: { interval: 24 * 60 * 60 * 1000 },
                enabled: true,
                stats: { totalRuns: 30, successRuns: 30, failedRuns: 0, avgDuration: 500 },
                createdAt: '2024-01-01T00:00:00.000Z',
                nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(sampleTasks));
    }

    initSampleData();

    // 公共API
    return {
        // 枚举
        Status: TaskStatus,
        Type: TaskType,
        BuiltIn: BuiltInTasks,

        // 任务管理
        createTask,
        getTasks,
        getTask,
        updateTask,
        deleteTask,

        // 执行
        executeTask,
        cancelTask,
        toggleTask,

        // 执行记录
        getExecutions,

        // 处理器
        registerHandler,

        // 监控
        Monitoring,

        // 统计
        Statistics,

        // 日志
        TaskLogger,

        // 工具函数
        generateId
    };
})();

// 导出为全局变量
window.TaskScheduler = TaskScheduler;
