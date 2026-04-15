/**
 * 内容管理系统 (Content Manager)
 * 负责文章管理、图片管理、富文本编辑、内容审核
 */

const ContentManager = (function() {
    'use strict';

    // 内容类型枚举
    const ContentType = {
        ARTICLE: 'article',
        GUIDE: 'guide',
        NEWS: 'news',
        ANNOUNCEMENT: 'announcement',
        FAQ: 'faq'
    };

    // 内容状态枚举
    const ContentStatus = {
        DRAFT: 'draft',
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        PUBLISHED: 'published',
        ARCHIVED: 'archived'
    };

    // 内容分类
    const ContentCategory = {
        DESTINATION: 'destination',
        TRAVEL_TIPS: 'travel_tips',
        CULTURE: 'culture',
        FOOD: 'food',
        ACTIVITY: 'activity',
        SAFETY: 'safety',
        POLICY: 'policy'
    };

    // 本地存储键名
    const STORAGE_KEYS = {
        ARTICLES: 'cms_articles',
        IMAGES: 'cms_images',
        DRAFTS: 'cms_drafts',
        AUDIT_LOGS: 'cms_audit_logs'
    };

    // 默认分类数据
    const DEFAULT_CATEGORIES = [
        { id: 'destination', name: '目的地攻略', icon: '🗺️', count: 0 },
        { id: 'travel_tips', name: '出行贴士', icon: '💡', count: 0 },
        { id: 'culture', name: '文化风俗', icon: '🏛️', count: 0 },
        { id: 'food', name: '美食推荐', icon: '🍜', count: 0 },
        { id: 'activity', name: '活动资讯', icon: '🎉', count: 0 },
        { id: 'safety', name: '安全须知', icon: '⚠️', count: 0 },
        { id: 'policy', name: '政策公告', icon: '📋', count: 0 }
    ];

    /**
     * 生成唯一ID
     */
    function generateId() {
        return 'content_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 获取文章列表
     */
    function getArticles(filters = {}) {
        const articles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES) || '[]');
        
        return articles.filter(article => {
            if (filters.type && article.type !== filters.type) return false;
            if (filters.status && article.status !== filters.status) return false;
            if (filters.category && article.category !== filters.category) return false;
            if (filters.keyword) {
                const keyword = filters.keyword.toLowerCase();
                if (!article.title.toLowerCase().includes(keyword) && 
                    !article.content.toLowerCase().includes(keyword)) {
                    return false;
                }
            }
            return true;
        }).sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt);
            const dateB = new Date(b.updatedAt || b.createdAt);
            return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }

    /**
     * 获取单篇文章
     */
    function getArticle(id) {
        const articles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES) || '[]');
        return articles.find(a => a.id === id);
    }

    /**
     * 创建文章
     */
    function createArticle(data) {
        const articles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES) || '[]');
        
        const article = {
            id: generateId(),
            title: data.title || '未命名文章',
            type: data.type || ContentType.ARTICLE,
            category: data.category || ContentCategory.DESTINATION,
            status: data.status || ContentStatus.DRAFT,
            content: data.content || '',
            summary: data.summary || '',
            coverImage: data.coverImage || '',
            author: data.author || '管理员',
            tags: data.tags || [],
            views: 0,
            likes: 0,
            comments: 0,
            seo: {
                title: data.seo?.title || '',
                description: data.seo?.description || '',
                keywords: data.seo?.keywords || []
            },
            metadata: {
                language: data.language || 'zh-CN',
                featured: data.featured || false,
                sticky: data.sticky || false
            },
            publishSchedule: data.publishSchedule || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: null
        };

        articles.push(article);
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
        
        // 记录操作日志
        OperationLogger.log('create', 'article', article.id, { title: article.title });
        
        return article;
    }

    /**
     * 更新文章
     */
    function updateArticle(id, data) {
        const articles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES) || '[]');
        const index = articles.findIndex(a => a.id === id);
        
        if (index === -1) {
            throw new Error('文章不存在');
        }

        const oldArticle = { ...articles[index] };
        articles[index] = {
            ...articles[index],
            ...data,
            updatedAt: new Date().toISOString()
        };

        // 如果状态变更为发布
        if (data.status === ContentStatus.PUBLISHED && oldArticle.status !== ContentStatus.PUBLISHED) {
            articles[index].publishedAt = new Date().toISOString();
        }

        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
        
        // 记录操作日志
        OperationLogger.log('update', 'article', id, { 
            title: articles[index].title,
            changes: Object.keys(data)
        });

        return articles[index];
    }

    /**
     * 删除文章
     */
    function deleteArticle(id) {
        const articles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES) || '[]');
        const article = articles.find(a => a.id === id);
        
        if (!article) {
            throw new Error('文章不存在');
        }

        const filtered = articles.filter(a => a.id !== id);
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(filtered));
        
        // 记录操作日志
        OperationLogger.log('delete', 'article', id, { title: article.title });

        return true;
    }

    /**
     * 批量操作文章
     */
    function batchUpdateArticles(ids, action, data = {}) {
        const articles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES) || '[]');
        const results = { success: [], failed: [] };

        ids.forEach(id => {
            const index = articles.findIndex(a => a.id === id);
            if (index === -1) {
                results.failed.push({ id, reason: '文章不存在' });
                return;
            }

            switch (action) {
                case 'publish':
                    articles[index].status = ContentStatus.PUBLISHED;
                    articles[index].publishedAt = new Date().toISOString();
                    break;
                case 'unpublish':
                    articles[index].status = ContentStatus.DRAFT;
                    break;
                case 'delete':
                    articles.splice(index, 1);
                    break;
                case 'category':
                    articles[index].category = data.category;
                    break;
                case 'tag':
                    articles[index].tags = data.tags || [];
                    break;
            }
            results.success.push(id);
        });

        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
        OperationLogger.log('batch', action, ids.join(','), { count: results.success.length });

        return results;
    }

    /**
     * 获取图片库
     */
    function getImages(filters = {}) {
        const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMAGES) || '[]');
        
        return images.filter(img => {
            if (filters.type && img.type !== filters.type) return false;
            if (filters.folder && img.folder !== filters.folder) return false;
            if (filters.keyword) {
                return img.name.toLowerCase().includes(filters.keyword.toLowerCase());
            }
            return true;
        }).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    }

    /**
     * 上传图片
     */
    function uploadImage(file, metadata = {}) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMAGES) || '[]');
                
                const imageData = {
                    id: generateId(),
                    name: file.name,
                    url: e.target.result,
                    size: file.size,
                    type: file.type,
                    width: metadata.width || 0,
                    height: metadata.height || 0,
                    folder: metadata.folder || 'default',
                    tags: metadata.tags || [],
                    alt: metadata.alt || '',
                    uploader: metadata.uploader || '管理员',
                    usageCount: 0,
                    uploadedAt: new Date().toISOString()
                };

                images.push(imageData);
                localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(images));
                
                OperationLogger.log('upload', 'image', imageData.id, { 
                    name: file.name, 
                    size: file.size 
                });

                resolve(imageData);
            };

            reader.onerror = function() {
                reject(new Error('文件读取失败'));
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * 删除图片
     */
    function deleteImage(id) {
        const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMAGES) || '[]');
        const image = images.find(i => i.id === id);
        
        if (!image) {
            throw new Error('图片不存在');
        }

        const filtered = images.filter(i => i.id !== id);
        localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(filtered));
        
        OperationLogger.log('delete', 'image', id, { name: image.name });

        return true;
    }

    /**
     * 富文本编辑器
     */
    class RichTextEditor {
        constructor(container, options = {}) {
            this.container = typeof container === 'string' ? 
                document.querySelector(container) : container;
            this.options = {
                placeholder: options.placeholder || '开始输入内容...',
                height: options.height || 400,
                plugins: options.plugins || ['bold', 'italic', 'underline', 'heading', 
                    'list', 'link', 'image', 'code', 'table'],
                ...options
            };
            this.content = '';
            this.init();
        }

        init() {
            this.createToolbar();
            this.createEditor();
            this.bindEvents();
        }

        createToolbar() {
            const toolbar = document.createElement('div');
            toolbar.className = 'rich-editor-toolbar';
            toolbar.innerHTML = this.getToolbarHTML();
            this.toolbar = toolbar;
            this.container.appendChild(toolbar);
        }

        getToolbarHTML() {
            const plugins = this.options.plugins;
            let html = '<div class="toolbar-group">';
            
            if (plugins.includes('bold')) {
                html += '<button type="button" data-command="bold" title="加粗"><b>B</b></button>';
            }
            if (plugins.includes('italic')) {
                html += '<button type="button" data-command="italic" title="斜体"><i>I</i></button>';
            }
            if (plugins.includes('underline')) {
                html += '<button type="button" data-command="underline" title="下划线"><u>U</u></button>';
            }
            
            html += '</div><div class="toolbar-divider"></div>';
            html += '<div class="toolbar-group">';
            
            if (plugins.includes('heading')) {
                html += '<select data-command="formatBlock"><option value="">标题</option>';
                html += '<option value="h1">H1</option><option value="h2">H2</option>';
                html += '<option value="h3">H3</option></select>';
            }
            
            if (plugins.includes('list')) {
                html += '<button type="button" data-command="insertUnorderedList" title="无序列表">•</button>';
                html += '<button type="button" data-command="insertOrderedList" title="有序列表">1.</button>';
            }
            
            html += '</div><div class="toolbar-divider"></div>';
            html += '<div class="toolbar-group">';
            
            if (plugins.includes('link')) {
                html += '<button type="button" data-command="createLink" title="插入链接">🔗</button>';
            }
            if (plugins.includes('image')) {
                html += '<button type="button" data-command="insertImage" title="插入图片">🖼️</button>';
            }
            
            html += '</div><div class="toolbar-divider"></div>';
            html += '<div class="toolbar-group">';
            
            if (plugins.includes('code')) {
                html += '<button type="button" data-command="code" title="代码">&lt;/&gt;</button>';
            }
            if (plugins.includes('table')) {
                html += '<button type="button" data-command="table" title="表格">▦</button>';
            }
            
            html += '</div>';
            
            return html;
        }

        createEditor() {
            this.editor = document.createElement('div');
            this.editor.className = 'rich-editor-content';
            this.editor.contentEditable = true;
            this.editor.style.height = this.options.height + 'px';
            this.editor.style.overflowY = 'auto';
            this.editor.innerHTML = this.content;
            
            if (!this.content) {
                this.editor.dataset.placeholder = this.options.placeholder;
            }
            
            this.container.appendChild(this.editor);
        }

        bindEvents() {
            this.toolbar.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;
                
                const command = btn.dataset.command;
                if (command) this.execCommand(command);
            });

            this.toolbar.addEventListener('change', (e) => {
                if (e.target.dataset.command === 'formatBlock') {
                    this.execCommand(e.target.dataset.command, e.target.value);
                }
            });

            this.editor.addEventListener('input', () => {
                this.content = this.editor.innerHTML;
                this.options.onChange?.(this.content);
            });

            this.editor.addEventListener('paste', (e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
            });
        }

        execCommand(command, value = null) {
            if (command === 'createLink') {
                const url = prompt('请输入链接地址:');
                if (url) document.execCommand(command, false, url);
            } else if (command === 'insertImage') {
                const url = prompt('请输入图片地址:');
                if (url) document.execCommand(command, false, url);
            } else if (command === 'table') {
                this.insertTable();
            } else if (command === 'code') {
                this.insertCode();
            } else {
                document.execCommand(command, false, value);
            }
            this.editor.focus();
        }

        insertTable() {
            const rows = prompt('行数:', '3');
            const cols = prompt('列数:', '3');
            if (!rows || !cols) return;

            let tableHTML = '<table class="editor-table">';
            for (let i = 0; i < rows; i++) {
                tableHTML += '<tr>';
                for (let j = 0; j < cols; j++) {
                    tableHTML += '<td contenteditable="true">单元格</td>';
                }
                tableHTML += '</tr>';
            }
            tableHTML += '</table><p></p>';
            
            document.execCommand('insertHTML', false, tableHTML);
        }

        insertCode() {
            const code = prompt('请输入代码:');
            if (code) {
                document.execCommand('insertHTML', false, 
                    `<pre class="editor-code"><code>${this.escapeHtml(code)}</code></pre><p></p>`);
            }
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        getContent() {
            return this.editor.innerHTML;
        }

        setContent(html) {
            this.content = html;
            this.editor.innerHTML = html;
        }

        getText() {
            return this.editor.innerText;
        }

        clear() {
            this.setContent('');
        }

        focus() {
            this.editor.focus();
        }
    }

    /**
     * 内容审核
     */
    const ContentAudit = {
        // 审核规则
        rules: {
            minLength: 50,
            maxLength: 50000,
            prohibitedWords: ['违规词1', '违规词2'],
            requiredFields: ['title', 'content', 'category']
        },

        // 敏感词检测
        checkProhibitedWords(content) {
            const found = [];
            this.rules.prohibitedWords.forEach(word => {
                if (content.toLowerCase().includes(word.toLowerCase())) {
                    found.push(word);
                }
            });
            return found;
        },

        // 内容审核
        audit(content) {
            const result = {
                passed: true,
                errors: [],
                warnings: []
            };

            // 检查标题长度
            if (!content.title || content.title.length < 5) {
                result.errors.push('标题长度不能少于5个字符');
            }
            if (content.title && content.title.length > 100) {
                result.errors.push('标题长度不能超过100个字符');
            }

            // 检查内容长度
            const contentLength = content.content?.length || 0;
            if (contentLength < this.rules.minLength) {
                result.errors.push(`内容长度不能少于${this.rules.minLength}个字符`);
            }
            if (contentLength > this.rules.maxLength) {
                result.errors.push(`内容长度不能超过${this.rules.maxLength}个字符`);
            }

            // 检查必填字段
            this.rules.requiredFields.forEach(field => {
                if (!content[field]) {
                    result.errors.push(`缺少必填字段: ${field}`);
                }
            });

            // 敏感词检测
            const fullText = JSON.stringify(content);
            const prohibitedFound = this.checkProhibitedWords(fullText);
            if (prohibitedFound.length > 0) {
                result.errors.push(`发现敏感词: ${prohibitedFound.join(', ')}`);
            }

            // 检查封面图
            if (!content.coverImage) {
                result.warnings.push('建议添加封面图片以提升阅读体验');
            }

            // 检查SEO信息
            if (!content.seo?.title) {
                result.warnings.push('建议填写SEO标题');
            }
            if (!content.seo?.description) {
                result.warnings.push('建议填写SEO描述');
            }

            result.passed = result.errors.length === 0;

            return result;
        },

        // 提交审核
        submitForReview(articleId) {
            const article = getArticle(articleId);
            if (!article) {
                throw new Error('文章不存在');
            }

            const auditResult = this.audit(article);
            if (!auditResult.passed) {
                return { success: false, result: auditResult };
            }

            updateArticle(articleId, { status: ContentStatus.PENDING });
            
            // 记录审核提交
            OperationLogger.log('submit_review', 'article', articleId, {
                title: article.title
            });

            return { success: true, result: auditResult };
        },

        // 审核通过
        approve(articleId, reviewer = '管理员') {
            const article = getArticle(articleId);
            if (!article) {
                throw new Error('文章不存在');
            }

            updateArticle(articleId, { 
                status: ContentStatus.APPROVED,
                reviewer: reviewer,
                reviewedAt: new Date().toISOString()
            });

            OperationLogger.log('approve', 'article', articleId, {
                title: article.title,
                reviewer: reviewer
            });

            return true;
        },

        // 审核拒绝
        reject(articleId, reason, reviewer = '管理员') {
            const article = getArticle(articleId);
            if (!article) {
                throw new Error('文章不存在');
            }

            updateArticle(articleId, { 
                status: ContentStatus.REJECTED,
                reviewer: reviewer,
                reviewedAt: new Date().toISOString(),
                rejectReason: reason
            });

            OperationLogger.log('reject', 'article', articleId, {
                title: article.title,
                reason: reason,
                reviewer: reviewer
            });

            return true;
        }
    };

    /**
     * 操作日志
     */
    const OperationLogger = {
        logs: JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]'),

        log(action, targetType, targetId, details = {}) {
            const log = {
                id: generateId(),
                timestamp: new Date().toISOString(),
                action: action,
                targetType: targetType,
                targetId: targetId,
                operator: '管理员',
                details: details,
                ip: '127.0.0.1'
            };

            this.logs.unshift(log);
            
            // 只保留最近1000条日志
            if (this.logs.length > 1000) {
                this.logs = this.logs.slice(0, 1000);
            }

            localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.logs));
        },

        getLogs(filters = {}) {
            return this.logs.filter(log => {
                if (filters.action && log.action !== filters.action) return false;
                if (filters.targetType && log.targetType !== filters.targetType) return false;
                if (filters.operator && log.operator !== filters.operator) return false;
                if (filters.dateRange) {
                    const logDate = new Date(log.timestamp);
                    if (logDate < filters.dateRange.start || logDate > filters.dateRange.end) {
                        return false;
                    }
                }
                return true;
            });
        },

        clearLogs() {
            this.logs = [];
            localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.logs));
        }
    };

    /**
     * 初始化示例数据
     */
    function initSampleData() {
        if (localStorage.getItem(STORAGE_KEYS.ARTICLES)) return;

        const sampleArticles = [
            {
                id: 'article_1',
                title: '云南丽江古城深度游玩攻略',
                type: ContentType.ARTICLE,
                category: ContentCategory.DESTINATION,
                status: ContentStatus.PUBLISHED,
                content: '<p>丽江古城是云南省最具代表性的旅游景点之一...</p>',
                summary: '本文为您详细介绍丽江古城的游玩攻略，包括必去景点、美食推荐、住宿建议等。',
                coverImage: '',
                author: '小明',
                tags: ['丽江', '古城', '云南'],
                views: 1523,
                likes: 89,
                comments: 23,
                seo: {
                    title: '丽江古城游玩攻略 | 游导旅游',
                    description: '最全面的丽江古城游玩攻略，包含景点、美食、住宿推荐',
                    keywords: ['丽江', '古城', '旅游攻略']
                },
                metadata: {
                    language: 'zh-CN',
                    featured: true,
                    sticky: false
                },
                createdAt: '2024-01-15T08:00:00.000Z',
                updatedAt: '2024-01-20T10:30:00.000Z',
                publishedAt: '2024-01-20T10:30:00.000Z'
            },
            {
                id: 'article_2',
                title: '出境游必备物品清单',
                type: ContentType.GUIDE,
                category: ContentCategory.TRAVEL_TIPS,
                status: ContentStatus.PENDING,
                content: '<p>准备出境游时，以下物品清单可以帮助您做好充分准备...</p>',
                summary: '出境游必备物品清单，涵盖证件、行李、电子设备等各类物品。',
                coverImage: '',
                author: '小红',
                tags: ['出境游', '清单', '必备'],
                views: 0,
                likes: 0,
                comments: 0,
                seo: {
                    title: '出境游必备物品清单 | 游导旅游',
                    description: '出境游需要准备哪些物品？本文为您详细列出',
                    keywords: ['出境游', '物品清单']
                },
                metadata: {
                    language: 'zh-CN',
                    featured: false,
                    sticky: false
                },
                createdAt: '2024-01-18T09:00:00.000Z',
                updatedAt: '2024-01-18T09:00:00.000Z',
                publishedAt: null
            }
        ];

        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(sampleArticles));
    }

    // 初始化示例数据
    initSampleData();

    // 公共API
    return {
        // 枚举
        ContentType,
        ContentStatus,
        ContentCategory,
        DEFAULT_CATEGORIES,

        // 文章管理
        getArticles,
        getArticle,
        createArticle,
        updateArticle,
        deleteArticle,
        batchUpdateArticles,

        // 图片管理
        getImages,
        uploadImage,
        deleteImage,

        // 富文本编辑器
        RichTextEditor,

        // 内容审核
        ContentAudit,

        // 操作日志
        OperationLogger,

        // 工具函数
        generateId
    };
})();

// 导出为全局变量
window.ContentManager = ContentManager;
