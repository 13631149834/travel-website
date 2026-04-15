/**
 * 内容审核组件 - 游导旅游
 * 提供敏感词检测、自动审核、人工审核等功能
 */

class ContentReview {
    constructor() {
        this.sensitiveWords = {};
        this.reviewRules = {};
        this.reviewQueue = [];
        this.reviewHistory = [];
    }

    /**
     * 初始化审核组件
     */
    async init() {
        await this.loadSensitiveWords();
        await this.loadReviewRules();
        return this;
    }

    /**
     * 加载敏感词库
     */
    async loadSensitiveWords() {
        try {
            const response = await fetch('../data/sensitive-words.json');
            const data = await response.json();
            this.sensitiveWords = data;
        } catch (error) {
            console.error('加载敏感词库失败:', error);
            this.sensitiveWords = { categories: {}, custom_words: [] };
        }
    }

    /**
     * 加载审核规则
     */
    async loadReviewRules() {
        try {
            const response = await fetch('../config/review-rules.json');
            const data = await response.json();
            this.reviewRules = data;
        } catch (error) {
            console.error('加载审核规则失败:', error);
            this.reviewRules = { review_types: {}, auto_review_rules: {} };
        }
    }

    /**
     * 检测敏感词
     * @param {string} text - 待检测文本
     * @returns {Object} 检测结果
     */
    detectSensitiveWords(text) {
        const results = {
            hasSensitive: false,
            matchedWords: [],
            categories: {},
            riskLevel: 'low',
            action: 'pass'
        };

        if (!text) return results;

        const normalizedText = text.toLowerCase();

        // 检查各类别敏感词
        for (const [categoryKey, category] of Object.entries(this.sensitiveWords.categories || {})) {
            const matchedInCategory = [];
            
            for (const word of category.words || []) {
                if (normalizedText.includes(word.toLowerCase())) {
                    matchedInCategory.push(word);
                    results.matchedWords.push({
                        word: word,
                        category: categoryKey,
                        categoryName: category.name,
                        position: normalizedText.indexOf(word.toLowerCase())
                    });
                }
            }

            if (matchedInCategory.length > 0) {
                results.categories[categoryKey] = {
                    name: category.name,
                    matchedWords: matchedInCategory,
                    count: matchedInCategory.length
                };
                results.hasSensitive = true;
            }
        }

        // 检查自定义敏感词
        for (const customWord of this.sensitiveWords.custom_words || []) {
            if (normalizedText.includes(customWord.word.toLowerCase())) {
                results.matchedWords.push({
                    word: customWord.word,
                    category: 'custom',
                    reason: customWord.reason,
                    position: normalizedText.indexOf(customWord.word.toLowerCase())
                });
                results.hasSensitive = true;
            }
        }

        // 计算风险等级
        if (results.hasSensitive) {
            const highRiskCategories = ['politics', 'pornography', 'gambling', 'violence'];
            const hasHighRisk = results.matchedWords.some(m => highRiskCategories.includes(m.category));
            
            if (hasHighRisk) {
                results.riskLevel = 'high';
                results.action = 'reject';
            } else {
                results.riskLevel = 'medium';
                results.action = this.reviewRules.auto_review_rules?.sensitive_word_check?.auto_reject_levels?.length ? 'review' : 'pass';
            }
        }

        return results;
    }

    /**
     * 替换敏感词
     * @param {string} text - 原始文本
     * @param {string} replaceChar - 替换字符
     * @returns {Object} 替换结果
     */
    replaceSensitiveWords(text, replaceChar = '*') {
        if (!text) return { text: '', replacedCount: 0 };

        let result = text;
        let replacedCount = 0;
        const sensitiveResult = this.detectSensitiveWords(text);

        for (const matched of sensitiveResult.matchedWords) {
            const category = this.sensitiveWords.categories?.[matched.category];
            const replacePattern = category?.replace || replaceChar;
            
            if (replacePattern) {
                const regex = new RegExp(matched.word, 'gi');
                result = result.replace(regex, replacePattern.repeat(matched.word.length));
                replacedCount++;
            }
        }

        return { text: result, replacedCount };
    }

    /**
     * 内容自动审核
     * @param {Object} content - 待审核内容
     * @returns {Object} 审核结果
     */
    async autoReview(content) {
        const result = {
            contentId: content.id || this.generateId(),
            contentType: content.type,
            status: 'pending',
            autoResult: null,
            needsManualReview: false,
            issues: [],
            score: 100,
            timestamp: new Date().toISOString()
        };

        // 敏感词检测
        const sensitiveResult = this.detectSensitiveWords(content.text || '');
        if (sensitiveResult.hasSensitive) {
            result.issues.push({
                type: 'sensitive_word',
                severity: sensitiveResult.riskLevel,
                details: sensitiveResult.matchedWords
            });

            if (sensitiveResult.action === 'reject') {
                result.status = 'rejected';
                result.autoResult = 'reject';
                result.score -= 50;
            } else {
                result.needsManualReview = true;
                result.score -= 20;
            }
        }

        // 长度检查
        const lengthRule = this.reviewRules.auto_review_rules?.length_check;
        if (lengthRule?.enabled) {
            const textLength = (content.text || '').length;
            if (textLength < lengthRule.min_length || textLength > lengthRule.max_length) {
                result.issues.push({
                    type: 'length_check',
                    severity: 'medium',
                    details: {
                        actual: textLength,
                        min: lengthRule.min_length,
                        max: lengthRule.max_length
                    }
                });
                result.needsManualReview = true;
            }
        }

        // 垃圾信息检测
        const spamRule = this.reviewRules.auto_review_rules?.spam_check;
        if (spamRule?.enabled && content.text) {
            const spamIndicators = this.detectSpam(content.text);
            if (spamIndicators.length > 0) {
                result.issues.push({
                    type: 'spam',
                    severity: 'medium',
                    details: spamIndicators
                });
                result.needsManualReview = true;
                result.score -= 15;
            }
        }

        // 图片检测（模拟）
        if (content.images && content.images.length > 0) {
            const imageResult = this.checkImages(content.images);
            if (!imageResult.pass) {
                result.issues.push({
                    type: 'image_check',
                    severity: 'high',
                    details: imageResult.issues
                });
                result.needsManualReview = true;
                result.score -= 10;
            }
        }

        // 链接检测
        if (content.text && spamRule?.enabled) {
            const links = this.extractLinks(content.text);
            const externalLinks = links.filter(link => !this.isAllowedDomain(link));
            if (externalLinks.length > 0) {
                result.issues.push({
                    type: 'external_link',
                    severity: 'low',
                    details: externalLinks
                });
                result.score -= 5;
            }
        }

        // 确定最终状态
        if (result.status !== 'rejected') {
            if (result.needsManualReview) {
                result.status = 'pending_review';
                result.autoResult = 'review';
            } else {
                result.status = 'approved';
                result.autoResult = 'approve';
            }
        }

        return result;
    }

    /**
     * 检测垃圾信息
     * @param {string} text 
     * @returns {Array} 垃圾指标
     */
    detectSpam(text) {
        const indicators = [];
        
        // 重复内容检测
        const words = text.split(/\s+/);
        const wordCount = {};
        words.forEach(w => {
            wordCount[w] = (wordCount[w] || 0) + 1;
        });
        const maxRepeat = Math.max(...Object.values(wordCount));
        if (maxRepeat > 3) {
            indicators.push('repetitive_content');
        }

        // 链接数量
        const links = this.extractLinks(text);
        if (links.length > 2) {
            indicators.push('too_many_links');
        }

        // 全大写检测
        const upperRatio = (text.match(/[A-Z]/g) || []).length / text.length;
        if (upperRatio > 0.5 && text.length > 20) {
            indicators.push('excessive_caps');
        }

        return indicators;
    }

    /**
     * 提取链接
     * @param {string} text 
     * @returns {Array} 链接列表
     */
    extractLinks(text) {
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
        return text.match(urlRegex) || [];
    }

    /**
     * 检查域名是否允许
     * @param {string} url 
     * @returns {boolean}
     */
    isAllowedDomain(url) {
        const allowedDomains = this.reviewRules.auto_review_rules?.link_check?.allowed_domains || [];
        try {
            const domain = new URL(url).hostname;
            return allowedDomains.some(d => domain.includes(d));
        } catch {
            return false;
        }
    }

    /**
     * 检查图片（模拟）
     * @param {Array} images 
     * @returns {Object}
     */
    checkImages(images) {
        const issues = [];
        const imageRule = this.reviewRules.auto_review_rules?.image_check;

        if (images.length > (imageRule?.max_images || 20)) {
            issues.push(`图片数量超过限制: ${images.length} > ${imageRule?.max_images}`);
        }

        for (const img of images) {
            if (img.size > (imageRule?.max_file_size || 5242880)) {
                issues.push(`图片过大: ${img.name} (${(img.size / 1024 / 1024).toFixed(2)}MB)`);
            }
        }

        return {
            pass: issues.length === 0,
            issues
        };
    }

    /**
     * 人工审核
     * @param {string} contentId - 内容ID
     * @param {string} action - 审核动作 (approve/reject)
     * @param {string} reason - 审核理由
     * @param {Object} reviewer - 审核人信息
     */
    manualReview(contentId, action, reason, reviewer) {
        const reviewRecord = {
            id: this.generateId(),
            contentId,
            action,
            reason,
            reviewer: reviewer.name || '管理员',
            reviewerId: reviewer.id,
            timestamp: new Date().toISOString(),
            type: 'manual'
        };

        this.reviewHistory.push(reviewRecord);
        this.saveReviewRecord(reviewRecord);

        return reviewRecord;
    }

    /**
     * 批量审核
     * @param {Array} contentIds - 内容ID列表
     * @param {string} action - 审核动作
     * @param {Object} reviewer - 审核人信息
     */
    async batchReview(contentIds, action, reviewer) {
        const results = [];
        
        for (const contentId of contentIds) {
            const result = this.manualReview(contentId, action, '批量审核', reviewer);
            results.push(result);
        }

        return {
            total: contentIds.length,
            success: results.length,
            results
        };
    }

    /**
     * 申诉处理
     * @param {string} contentId - 内容ID
     * @param {string} appealReason - 申诉理由
     * @param {Object} appealer - 申诉人信息
     */
    createAppeal(contentId, appealReason, appealer) {
        const appeal = {
            id: this.generateId(),
            contentId,
            appealReason,
            appealer: appealer.name,
            appealerId: appealer.id,
            status: 'pending',
            createTime: new Date().toISOString()
        };

        return appeal;
    }

    /**
     * 获取审核统计
     * @param {Object} filters - 筛选条件
     */
    getReviewStats(filters = {}) {
        const stats = {
            total: this.reviewHistory.length,
            approved: 0,
            rejected: 0,
            pending: 0,
            byType: {},
            byDate: {}
        };

        this.reviewHistory.forEach(record => {
            if (record.action === 'approve') stats.approved++;
            if (record.action === 'reject') stats.rejected++;
            
            const date = record.timestamp.split('T')[0];
            stats.byDate[date] = (stats.byDate[date] || 0) + 1;
        });

        return stats;
    }

    /**
     * 保存审核记录
     */
    saveReviewRecord(record) {
        const logs = JSON.parse(localStorage.getItem('review_logs') || '[]');
        logs.push(record);
        localStorage.setItem('review_logs', JSON.stringify(logs.slice(-1000)));
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return 'CR' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    /**
     * 导出审核记录
     */
    exportLogs(format = 'json') {
        const logs = JSON.parse(localStorage.getItem('review_logs') || '[]');
        
        if (format === 'csv') {
            const headers = ['ID', '内容ID', '操作', '理由', '审核人', '时间'];
            const rows = logs.map(l => [
                l.id, l.contentId, l.action, l.reason, l.reviewer, l.timestamp
            ]);
            return [headers, ...rows].map(r => r.join(',')).join('\n');
        }

        return JSON.stringify(logs, null, 2);
    }
}

// 创建全局实例
const contentReview = new ContentReview();

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    contentReview.init();
});
