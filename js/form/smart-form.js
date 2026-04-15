/**
 * 智能表单模块 V3.0
 * 功能：自动填充、智能提示、历史记录、表单记忆、实时验证、输入增强、移动端优化、无障碍支持
 */

(function() {
    'use strict';

    // 智能表单配置
    const SmartFormConfig = {
        // 自动保存配置
        autoSave: {
            enabled: true,
            storageKey: 'smart_form_draft_',
            saveInterval: 1000,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7天过期
        },

        // 自动填充配置
        autofill: {
            enabled: true,
            sources: ['history', 'localStorage', 'profile']
        },

        // 智能提示配置
        suggestions: {
            enabled: true,
            maxItems: 8,
            debounceDelay: 150,
            highlightMatch: true
        },

        // 历史记录配置
        history: {
            enabled: true,
            maxItems: 20,
            storageKey: 'smart_form_history_'
        },

        // 输入格式化配置
        formatting: {
            phone: { pattern: /(\d{3})(\d{4})(\d{4})/, replacement: '$1-$2-$3' },
            idcard: { pattern: /(\d{6})(\d{8})(\d{4})/, replacement: '$1 $2 $3' },
            bankcard: { pattern: /(\d{4})(?=(\d{4})+$)/g, replacement: '$1 ' },
            currency: { decimals: 2, prefix: '¥', thousandSeparator: true }
        },

        // 防抖延迟
        debounceDelay: 200,

        // 验证延迟
        validationDelay: 300
    };

    // 智能表单类
    class SmartForm {
        constructor(form, options = {}) {
            this.form = typeof form === 'string' ? document.querySelector(form) : form;
            this.options = { ...SmartFormConfig, ...options };
            this.fields = new Map();
            this.history = new Map();
            this.suggestions = new Map();
            this.undoStack = [];
            this.redoStack = [];
            this.isInitialized = false;

            if (this.form) {
                this.init();
            }
        }

        init() {
            this.scanFields();
            this.setupAutoSave();
            this.setupAutoFill();
            this.setupHistoryTracking();
            this.setupInputEnhancement();
            this.setupMobileOptimization();
            this.setupAccessibility();
            this.setupKeyboardShortcuts();
            this.isInitialized = true;
            this.dispatchEvent('smartform:initialized', { form: this.form });
        }

        // 扫描表单字段
        scanFields() {
            const inputs = this.form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                const fieldName = input.name || input.id || Math.random().toString(36).substr(2, 9);
                
                // 获取字段配置
                const config = this.getFieldConfig(input);
                
                // 创建字段实例
                const field = new SmartField(input, fieldName, config, this.options);
                this.fields.set(fieldName, field);
                
                // 设置验证规则
                if (config.validators) {
                    field.setValidators(config.validators);
                }
                
                // 设置格式化规则
                if (config.formatter) {
                    field.setFormatter(config.formatter);
                }
                
                // 设置自动完成
                if (config.autocomplete) {
                    field.enableAutocomplete(config.autocomplete);
                }
            });
        }

        // 获取字段配置
        getFieldConfig(input) {
            const config = {
                validators: [],
                formatter: null,
                autocomplete: null
            };

            // 从data属性读取配置
            const dataConfig = input.dataset.smartForm;
            if (dataConfig) {
                try {
                    const parsed = JSON.parse(dataConfig);
                    Object.assign(config, parsed);
                } catch (e) {
                    console.warn('SmartForm: Invalid data-smart-form config', e);
                }
            }

            // 自动检测类型
            const type = input.type || input.tagName.toLowerCase();
            const fieldType = input.dataset.fieldType;

            // 根据输入类型自动设置验证器
            if (!config.validators.length) {
                switch (fieldType || type) {
                    case 'phone':
                    case 'tel':
                        config.validators = ['phone'];
                        config.formatter = 'phone';
                        config.autocomplete = 'tel';
                        break;
                    case 'email':
                        config.validators = ['email'];
                        config.autocomplete = 'email';
                        break;
                    case 'password':
                        config.validators = ['password'];
                        config.autocomplete = 'new-password';
                        break;
                    case 'name':
                    case 'username':
                        config.validators = ['name'];
                        config.autocomplete = 'name';
                        break;
                    case 'idcard':
                        config.validators = ['idcard'];
                        config.formatter = 'idcard';
                        break;
                    case 'bankcard':
                        config.formatter = 'bankcard';
                        break;
                    case 'url':
                        config.validators = ['url'];
                        break;
                    case 'captcha':
                        config.validators = ['captcha'];
                        break;
                    case 'date':
                        config.autocomplete = 'bday';
                        break;
                }
            }

            return config;
        }

        // 设置自动保存
        setupAutoSave() {
            if (!this.options.autoSave.enabled) return;

            const formId = this.form.id || 'default';
            const storageKey = this.options.autoSave.storageKey + formId;

            // 加载草稿
            this.loadDraft(storageKey);

            // 监听输入变化
            this.form.addEventListener('input', this.debounce(() => {
                this.saveDraft(storageKey);
            }, this.options.autoSave.saveInterval));

            // 页面离开前保存
            window.addEventListener('beforeunload', () => {
                this.saveDraft(storageKey);
            });

            // 表单提交时清除草稿
            this.form.addEventListener('submit', () => {
                this.clearDraft(storageKey);
            });
        }

        // 保存草稿
        saveDraft(storageKey) {
            const data = {};
            this.fields.forEach((field, name) => {
                const value = field.getValue();
                if (value && field.options.saveToHistory) {
                    data[name] = value;
                }
            });
            data._timestamp = Date.now();
            
            try {
                localStorage.setItem(storageKey, JSON.stringify(data));
                this.dispatchEvent('smartform:draftsaved', { data });
            } catch (e) {
                console.warn('SmartForm: Failed to save draft', e);
            }
        }

        // 加载草稿
        loadDraft(storageKey) {
            try {
                const saved = localStorage.getItem(storageKey);
                if (!saved) return;

                const data = JSON.parse(saved);
                
                // 检查是否过期
                if (data._timestamp && 
                    Date.now() - data._timestamp > this.options.autoSave.maxAge) {
                    this.clearDraft(storageKey);
                    return;
                }

                // 填充表单
                Object.entries(data).forEach(([name, value]) => {
                    if (name === '_timestamp') return;
                    const field = this.fields.get(name);
                    if (field && value) {
                        field.setValue(value, false); // 不触发保存
                    }
                });

                this.dispatchEvent('smartform:draftloaded', { data });
            } catch (e) {
                console.warn('SmartForm: Failed to load draft', e);
            }
        }

        // 清除草稿
        clearDraft(storageKey) {
            try {
                localStorage.removeItem(storageKey);
            } catch (e) {
                console.warn('SmartForm: Failed to clear draft', e);
            }
        }

        // 设置自动填充
        setupAutoFill() {
            if (!this.options.autofill.enabled) return;

            // 监听 autofill 事件
            this.form.addEventListener('animationstart', (e) => {
                if (e.animationName === 'smartFormAutoFill') {
                    this.handleAutoFill(e.target);
                }
            });

            // 使用 MutationObserver 监听输入变化
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                        this.handleAutoFill(mutation.target);
                    }
                });
            });

            this.fields.forEach((field) => {
                observer.observe(field.element, { attributes: true, subtree: true });
            });
        }

        // 处理自动填充
        handleAutoFill(input) {
            const field = this.getFieldByElement(input);
            if (field) {
                field.validate();
                this.dispatchEvent('smartform:autofill', { field, value: input.value });
            }
        }

        // 设置历史记录追踪
        setupHistoryTracking() {
            if (!this.options.history.enabled) return;

            this.fields.forEach((field, name) => {
                // 加载历史记录
                const historyData = this.getHistory(name);
                field.setHistory(historyData);

                // 监听输入变化
                field.element.addEventListener('smartfield:change', () => {
                    this.addToHistory(name, field.getValue());
                });
            });
        }

        // 获取历史记录
        getHistory(fieldName) {
            const storageKey = this.options.history.storageKey + fieldName;
            try {
                const data = localStorage.getItem(storageKey);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                return [];
            }
        }

        // 添加到历史记录
        addToHistory(fieldName, value) {
            if (!value || value.length < 2) return;

            const storageKey = this.options.history.storageKey + fieldName;
            let history = this.getHistory(fieldName);

            // 去重
            history = history.filter(item => item !== value);
            
            // 添加到开头
            history.unshift(value);
            
            // 限制数量
            history = history.slice(0, this.options.history.maxItems);

            try {
                localStorage.setItem(storageKey, JSON.stringify(history));
            } catch (e) {
                console.warn('SmartForm: Failed to save history', e);
            }
        }

        // 设置输入增强
        setupInputEnhancement() {
            this.fields.forEach((field) => {
                field.setupEnhancement();
            });
        }

        // 设置移动端优化
        setupMobileOptimization() {
            // 检测是否为移动设备
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (!isMobile) return;

            // 防止缩放
            this.preventZoom();

            // 键盘适配
            this.setupKeyboardAdaptation();

            // 触摸优化
            this.setupTouchOptimization();
        }

        // 防止缩放
        preventZoom() {
            const metaViewport = document.querySelector('meta[name="viewport"]');
            if (!metaViewport) return;

            // 监听字体大小变化
            document.addEventListener('selectionchange', () => {
                document.documentElement.style.fontSize = window.innerWidth / 375 * 16 + 'px';
            });
        }

        // 键盘适配
        setupKeyboardAdaptation() {
            let activeField = null;

            this.fields.forEach((field) => {
                field.element.addEventListener('focus', () => {
                    activeField = field;
                    this.adjustViewport();
                });

                field.element.addEventListener('blur', () => {
                    activeField = null;
                    this.resetViewport();
                });
            });

            // 监听键盘弹出
            window.addEventListener('resize', () => {
                if (activeField && window.innerHeight < 400) {
                    this.scrollFieldIntoView(activeField);
                }
            });
        }

        // 调整视口
        adjustViewport() {
            const activeElement = document.activeElement;
            if (!activeElement) return;

            setTimeout(() => {
                activeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 300);
        }

        // 重置视口
        resetViewport() {
            // 可以添加重置逻辑
        }

        // 滚动字段到视图
        scrollFieldIntoView(field) {
            const rect = field.element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            if (rect.bottom > viewportHeight - 50) {
                const scrollTop = window.pageYOffset + rect.bottom - viewportHeight + 100;
                window.scrollTo({
                    top: scrollTop,
                    behavior: 'smooth'
                });
            }
        }

        // 触摸优化
        setupTouchOptimization() {
            // 扩大触摸目标
            this.fields.forEach((field) => {
                const input = field.element;
                if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
                    input.style.minHeight = '44px';
                    input.style.fontSize = '16px'; // 防止iOS自动缩放
                }
            });

            // 禁用双击缩放
            this.form.addEventListener('touchstart', (e) => {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });
        }

        // 设置无障碍支持
        setupAccessibility() {
            this.fields.forEach((field) => {
                field.setupAccessibility();
            });
        }

        // 设置键盘快捷键
        setupKeyboardShortcuts() {
            // Ctrl/Cmd + Enter 提交表单
            this.form.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    this.form.dispatchEvent(new Event('submit'));
                }

                // Ctrl/Cmd + Z 撤销
                if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.undo();
                }

                // Ctrl/Cmd + Shift + Z 重做
                if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                    e.preventDefault();
                    this.redo();
                }

                // Escape 取消编辑
                if (e.key === 'Escape') {
                    this.form.querySelectorAll('.suggestions-dropdown').forEach(el => {
                        el.classList.remove('active');
                    });
                }
            });
        }

        // 撤销
        undo() {
            if (this.undoStack.length === 0) return;

            const state = this.undoStack.pop();
            this.redoStack.push(this.getCurrentState());
            this.restoreState(state);
            
            this.dispatchEvent('smartform:undo', { state });
        }

        // 重做
        redo() {
            if (this.redoStack.length === 0) return;

            const state = this.redoStack.pop();
            this.undoStack.push(this.getCurrentState());
            this.restoreState(state);
            
            this.dispatchEvent('smartform:redo', { state });
        }

        // 获取当前状态
        getCurrentState() {
            const state = {};
            this.fields.forEach((field, name) => {
                state[name] = field.getValue();
            });
            return state;
        }

        // 恢复状态
        restoreState(state) {
            Object.entries(state).forEach(([name, value]) => {
                const field = this.fields.get(name);
                if (field) {
                    field.setValue(value);
                }
            });
        }

        // 验证表单
        validate() {
            let isValid = true;
            const errors = [];

            this.fields.forEach((field, name) => {
                const result = field.validate();
                if (!result.valid) {
                    isValid = false;
                    errors.push({ field: name, errors: result.errors });
                }
            });

            return { valid: isValid, errors };
        }

        // 获取字段
        getField(name) {
            return this.fields.get(name);
        }

        // 获取字段通过元素
        getFieldByElement(element) {
            for (const [name, field] of this.fields) {
                if (field.element === element) {
                    return field;
                }
            }
            return null;
        }

        // 启用字段
        enableField(name) {
            const field = this.fields.get(name);
            if (field) {
                field.enable();
            }
        }

        // 禁用字段
        disableField(name) {
            const field = this.fields.get(name);
            if (field) {
                field.disable();
            }
        }

        // 重置表单
        reset() {
            this.form.reset();
            this.fields.forEach((field) => {
                field.reset();
            });
            this.undoStack = [];
            this.redoStack = [];
            
            this.dispatchEvent('smartform:reset', { form: this.form });
        }

        // 销毁
        destroy() {
            this.fields.forEach((field) => {
                field.destroy();
            });
            this.fields.clear();
            this.history.clear();
            this.suggestions.clear();
            this.undoStack = [];
            this.redoStack = [];
            this.isInitialized = false;
        }

        // 防抖
        debounce(fn, delay) {
            let timer = null;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => fn.apply(this, args), delay);
            };
        }

        // 发送事件
        dispatchEvent(name, detail = {}) {
            const event = new CustomEvent(name, {
                bubbles: true,
                detail
            });
            this.form.dispatchEvent(event);
        }
    }

    // 智能字段类
    class SmartField {
        constructor(element, name, config, globalOptions) {
            this.element = typeof element === 'string' ? document.querySelector(element) : element;
            this.name = name;
            this.config = config;
            this.options = globalOptions;
            this.validators = [];
            this.formatter = null;
            this.history = [];
            this.suggestionDropdown = null;
            this.isValidating = false;
            this.isEnabled = true;
            this.errorMessage = '';
            this.successMessage = '';

            // 保存原始值用于撤销
            this.originalValue = this.element.value;

            this.init();
        }

        init() {
            this.createSuggestionDropdown();
            this.setupValidation();
            this.setupFormatting();
            this.setupPasteHandling();
        }

        // 设置验证
        setupValidation() {
            // 失焦验证
            this.element.addEventListener('blur', () => {
                if (this.element.value) {
                    this.validate();
                }
            });

            // 输入时验证（可选，通过data属性启用）
            if (this.element.dataset.validateOnInput === 'true') {
                this.element.addEventListener('input', () => {
                    this.validate();
                });
            }

            // 创建验证提示容器
            this.createValidationMessage();
        }

        // 创建验证提示
        createValidationMessage() {
            const container = document.createElement('div');
            container.className = 'field-validation-message';
            container.setAttribute('role', 'alert');
            container.setAttribute('aria-live', 'polite');

            this.element.parentNode.insertBefore(container, this.element.nextSibling);
            this.validationContainer = container;
        }

        // 设置格式化
        setupFormatting() {
            if (!this.config.formatter) return;

            this.element.addEventListener('input', (e) => {
                const formatted = this.formatValue(e.target.value);
                if (formatted !== e.target.value) {
                    const cursorPos = e.target.selectionStart;
                    const oldLength = e.target.value.length;
                    e.target.value = formatted;
                    // 调整光标位置
                    const newLength = formatted.length;
                    const newPos = cursorPos + (newLength - oldLength);
                    e.target.setSelectionRange(newPos, newPos);
                }
            });
        }

        // 格式化值
        formatValue(value) {
            const formatterConfig = this.options.formatting[this.config.formatter];
            if (!formatterConfig) return value;

            switch (this.config.formatter) {
                case 'phone':
                    const phoneDigits = value.replace(/\D/g, '');
                    if (phoneDigits.length <= 3) return phoneDigits;
                    if (phoneDigits.length <= 7) return `${phoneDigits.slice(0, 3)}-${phoneDigits.slice(3)}`;
                    return `${phoneDigits.slice(0, 3)}-${phoneDigits.slice(3, 7)}-${phoneDigits.slice(7, 11)}`;

                case 'idcard':
                    const idcardDigits = value.replace(/\D/g, '');
                    if (idcardDigits.length <= 6) return idcardDigits;
                    if (idcardDigits.length <= 14) return `${idcardDigits.slice(0, 6)} ${idcardDigits.slice(6)}`;
                    return `${idcardDigits.slice(0, 6)} ${idcardDigits.slice(6, 14)} ${idcardDigits.slice(14, 18)}`;

                case 'bankcard':
                    return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();

                default:
                    return value;
            }
        }

        // 设置粘贴处理
        setupPasteHandling() {
            this.element.addEventListener('paste', (e) => {
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                
                // 数字字段：自动去除非数字字符
                if (this.config.formatter === 'phone' || this.config.formatter === 'bankcard' || 
                    this.element.dataset.fieldType === 'phone' || this.element.dataset.fieldType === 'captcha') {
                    e.preventDefault();
                    const cleaned = pastedText.replace(/\D/g, '');
                    const start = this.element.selectionStart;
                    const end = this.element.selectionEnd;
                    const currentValue = this.element.value;
                    const newValue = currentValue.substring(0, start) + cleaned + currentValue.substring(end);
                    this.element.value = this.formatValue(newValue);
                    
                    // 触发input事件
                    this.element.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        }

        // 设置验证器
        setValidators(validators) {
            this.validators = validators.map(v => {
                if (typeof v === 'string') {
                    return this.getValidator(v);
                }
                return v;
            }).filter(Boolean);
        }

        // 获取验证器
        getValidator(name) {
            const validators = {
                required: {
                    validate: (value) => !!value && value.trim() !== '',
                    message: '此字段为必填项',
                    success: ''
                },
                phone: {
                    pattern: /^1[3-9]\d{9}$/,
                    message: '请输入有效的11位手机号码',
                    success: '✓ 手机号格式正确'
                },
                email: {
                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: '请输入有效的邮箱地址',
                    success: '✓ 邮箱格式正确'
                },
                password: {
                    pattern: /^.{6,20}$/,
                    message: '密码长度6-20位',
                    success: '✓ 密码格式正确'
                },
                name: {
                    pattern: /^[\u4e00-\u9fa5·]{2,10}$/,
                    message: '请输入2-10位中文姓名',
                    success: '✓ 姓名格式正确'
                },
                idcard: {
                    pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
                    message: '请输入有效的18位身份证号码',
                    success: '✓ 身份证格式正确'
                },
                url: {
                    pattern: /^https?:\/\/.+/,
                    message: '请输入有效的网址',
                    success: '✓ 网址格式正确'
                },
                captcha: {
                    pattern: /^\d{4,6}$/,
                    message: '请输入4-6位数字验证码',
                    success: '✓ 验证码正确'
                }
            };

            return validators[name];
        }

        // 设置格式化器
        setFormatter(formatterName) {
            this.config.formatter = formatterName;
        }

        // 启用自动完成
        enableAutocomplete(type) {
            this.config.autocomplete = type;
            this.element.setAttribute('autocomplete', type);
        }

        // 设置历史记录
        setHistory(history) {
            this.history = history;
        }

        // 设置输入增强
        setupEnhancement() {
            // 自动完成
            if (this.history.length > 0) {
                this.setupAutocomplete();
            }

            // 数字输入限制
            if (this.element.type === 'number' || this.element.dataset.fieldType === 'number') {
                this.setupNumberInput();
            }

            // 字符长度限制
            this.setupLengthLimit();
        }

        // 设置自动完成
        setupAutocomplete() {
            // 监听focus事件显示历史记录
            this.element.addEventListener('focus', () => {
                if (this.history.length > 0) {
                    this.showSuggestions(this.history);
                }
            });

            // 监听输入显示匹配建议
            this.element.addEventListener('input', () => {
                const value = this.element.value.trim().toLowerCase();
                if (value.length >= 1) {
                    const matches = this.history.filter(item => 
                        item.toLowerCase().includes(value)
                    );
                    if (matches.length > 0) {
                        this.showSuggestions(matches);
                    } else {
                        this.hideSuggestions();
                    }
                } else {
                    this.hideSuggestions();
                }
            });

            // 隐藏建议
            this.element.addEventListener('blur', () => {
                setTimeout(() => this.hideSuggestions(), 200);
            });
        }

        // 创建建议下拉框
        createSuggestionDropdown() {
            const dropdown = document.createElement('div');
            dropdown.className = 'suggestions-dropdown';
            dropdown.setAttribute('role', 'listbox');
            dropdown.setAttribute('aria-label', '历史记录建议');
            dropdown.style.display = 'none';

            this.element.parentNode.appendChild(dropdown);
            this.suggestionDropdown = dropdown;
        }

        // 显示建议
        showSuggestions(items) {
            if (!this.suggestionDropdown) return;

            const maxItems = this.options.suggestions.maxItems;
            const displayItems = items.slice(0, maxItems);

            this.suggestionDropdown.innerHTML = displayItems.map((item, index) => `
                <div class="suggestion-item" role="option" tabindex="-1" data-index="${index}">
                    <span class="suggestion-icon">📋</span>
                    <span class="suggestion-text">${this.escapeHtml(item)}</span>
                </div>
            `).join('');

            // 绑定点击事件
            this.suggestionDropdown.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.dataset.index);
                    this.selectSuggestion(displayItems[index]);
                });

                item.addEventListener('mousedown', (e) => {
                    e.preventDefault(); // 防止失去焦点
                });
            });

            this.suggestionDropdown.style.display = 'block';
            this.suggestionDropdown.classList.add('active');
        }

        // 隐藏建议
        hideSuggestions() {
            if (this.suggestionDropdown) {
                this.suggestionDropdown.style.display = 'none';
                this.suggestionDropdown.classList.remove('active');
            }
        }

        // 选择建议
        selectSuggestion(value) {
            this.element.value = value;
            this.hideSuggestions();
            this.element.dispatchEvent(new Event('input', { bubbles: true }));
            this.element.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // 设置数字输入
        setupNumberInput() {
            this.element.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^\d.-]/g, '');
                
                // 处理负数
                if (value.includes('-')) {
                    value = '-' + value.replace(/-/g, '');
                }
                
                // 处理小数
                if (this.element.step && this.element.step.includes('.')) {
                    const decimals = this.element.step.split('.')[1]?.length || 0;
                    if (value.includes('.')) {
                        const parts = value.split('.');
                        value = parts[0] + '.' + parts[1].slice(0, decimals);
                    }
                }

                // 处理范围
                if (this.element.min !== undefined) {
                    value = Math.max(parseFloat(this.element.min) || -Infinity, parseFloat(value) || 0);
                }
                if (this.element.max !== undefined) {
                    value = Math.min(parseFloat(this.element.max) || Infinity, parseFloat(value) || 0);
                }

                e.target.value = value;
            });
        }

        // 设置长度限制
        setupLengthLimit() {
            const maxLength = this.element.getAttribute('maxlength');
            if (!maxLength) return;

            // 添加字符计数
            const counter = document.createElement('div');
            counter.className = 'input-char-counter';
            counter.innerHTML = `<span class="current">0</span>/${maxLength}`;

            this.element.parentNode.appendChild(counter);
            this.charCounter = counter;

            this.element.addEventListener('input', () => {
                const length = this.element.value.length;
                counter.querySelector('.current').textContent = length;
                
                if (length >= maxLength * 0.9) {
                    counter.classList.add('warning');
                } else {
                    counter.classList.remove('warning');
                }
            });
        }

        // 设置无障碍
        setupAccessibility() {
            // 确保有label关联
            const label = this.element.id ? 
                document.querySelector(`label[for="${this.element.id}"]`) : 
                this.element.closest('label');

            if (!label && this.element.name) {
                // 自动创建aria-label
                const labelText = this.getLabelText();
                if (labelText) {
                    this.element.setAttribute('aria-label', labelText);
                }
            }

            // 设置aria-describedby
            if (this.validationContainer) {
                this.element.setAttribute('aria-describedby', this.validationContainer.id || 'validation-' + this.name);
            }

            // 确保可访问键盘导航
            if (this.suggestionDropdown) {
                this.element.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowDown' && this.suggestionDropdown.classList.contains('active')) {
                        e.preventDefault();
                        const firstItem = this.suggestionDropdown.querySelector('.suggestion-item');
                        if (firstItem) firstItem.focus();
                    }
                });
            }
        }

        // 获取标签文本
        getLabelText() {
            const label = this.element.id ? 
                document.querySelector(`label[for="${this.element.id}"]`) : 
                this.element.closest('label');
            
            return label ? label.textContent.trim() : '';
        }

        // 验证
        validate() {
            if (!this.isEnabled) return { valid: true, errors: [] };

            const value = this.element.value;
            const errors = [];

            // 必填验证
            const requiredValidator = this.validators.find(v => v && v.validate.toString().includes('!!value'));
            if (requiredValidator && !value.trim()) {
                errors.push(requiredValidator.message);
            }

            // 格式验证
            for (const validator of this.validators) {
                if (!validator || !validator.pattern) continue;
                if (value && !validator.pattern.test(value)) {
                    if (!errors.includes(validator.message)) {
                        errors.push(validator.message);
                    }
                }
            }

            // 自定义验证函数
            for (const validator of this.validators) {
                if (!validator || !validator.validate) continue;
                if (typeof validator.validate === 'function' && !validator.validate(value)) {
                    if (!errors.includes(validator.message)) {
                        errors.push(validator.message);
                    }
                }
            }

            // 显示验证结果
            this.showValidationResult(errors);

            return { valid: errors.length === 0, errors };
        }

        // 显示验证结果
        showValidationResult(errors) {
            if (!this.validationContainer) return;

            this.element.classList.remove('is-valid', 'is-invalid');
            this.validationContainer.innerHTML = '';

            if (errors.length > 0) {
                this.element.classList.add('is-invalid');
                this.element.setAttribute('aria-invalid', 'true');
                
                errors.forEach(error => {
                    const errorEl = document.createElement('span');
                    errorEl.className = 'validation-error';
                    errorEl.textContent = error;
                    this.validationContainer.appendChild(errorEl);
                });

                this.dispatchEvent('smartfield:error', { errors });
            } else if (this.element.value) {
                this.element.classList.add('is-valid');
                this.element.setAttribute('aria-invalid', 'false');

                // 显示成功提示
                const successValidator = this.validators.find(v => v && v.success);
                if (successValidator && successValidator.success) {
                    const successEl = document.createElement('span');
                    successEl.className = 'validation-success';
                    successEl.textContent = successValidator.success;
                    this.validationContainer.appendChild(successEl);
                }

                this.dispatchEvent('smartfield:valid');
            }

            this.dispatchEvent('smartfield:validate', { valid: errors.length === 0, errors });
        }

        // 获取值
        getValue() {
            return this.element.value;
        }

        // 设置值
        setValue(value, triggerSave = true) {
            this.element.value = value;
            this.element.dispatchEvent(new Event('input', { bubbles: true }));
            
            if (triggerSave) {
                this.dispatchEvent('smartfield:change', { value });
            }
        }

        // 启用
        enable() {
            this.isEnabled = true;
            this.element.disabled = false;
            this.element.removeAttribute('readonly');
            this.element.classList.remove('is-disabled');
        }

        // 禁用
        disable() {
            this.isEnabled = false;
            this.element.disabled = true;
            this.element.classList.add('is-disabled');
        }

        // 重置
        reset() {
            this.element.value = this.originalValue;
            this.element.classList.remove('is-valid', 'is-invalid');
            if (this.validationContainer) {
                this.validationContainer.innerHTML = '';
            }
        }

        // 销毁
        destroy() {
            if (this.suggestionDropdown) {
                this.suggestionDropdown.remove();
            }
            if (this.validationContainer) {
                this.validationContainer.remove();
            }
            if (this.charCounter) {
                this.charCounter.remove();
            }
        }

        // HTML转义
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // 发送事件
        dispatchEvent(name, detail = {}) {
            const event = new CustomEvent(name, {
                bubbles: true,
                detail
            });
            this.element.dispatchEvent(event);
        }
    }

    // 密码强度检测
    SmartForm.PasswordStrength = {
        check(password) {
            if (!password) return { level: 0, text: '', color: '', bars: 0 };
            
            let score = 0;
            
            // 长度检查
            if (password.length >= 6) score++;
            if (password.length >= 8) score++;
            if (password.length >= 12) score++;
            
            // 复杂度检查
            if (/[a-z]/.test(password)) score++;
            if (/[A-Z]/.test(password)) score++;
            if (/[0-9]/.test(password)) score++;
            if (/[^a-zA-Z0-9]/.test(password)) score++;

            // 计算强度等级
            let level, text, color, bars;
            
            if (score <= 2) {
                level = 1;
                text = '弱';
                color = '#EF4444';
                bars = 1;
            } else if (score <= 4) {
                level = 2;
                text = '中等';
                color = '#F59E0B';
                bars = 2;
            } else if (score <= 6) {
                level = 3;
                text = '良好';
                color = '#10B981';
                bars = 3;
            } else {
                level = 4;
                text = '强';
                color = '#059669';
                bars = 4;
            }

            return { level, text, color, bars, score };
        },

        // 渲染密码强度条
        render(element, password) {
            const result = this.check(password);
            
            element.innerHTML = `
                <div class="password-strength">
                    <div class="strength-bars">
                        ${[1, 2, 3, 4].map(i => `
                            <div class="strength-bar ${i <= result.bars ? 'active' : ''}" 
                                 style="${i <= result.bars ? `background-color: ${result.color}` : ''}"></div>
                        `).join('')}
                    </div>
                    <span class="strength-text" style="color: ${result.color}">${result.text}</span>
                </div>
            `;
            
            return result;
        }
    };

    // 导出到全局
    window.SmartForm = SmartForm;

    // 自动初始化
    document.addEventListener('DOMContentLoaded', () => {
        // 查找需要自动初始化的表单
        document.querySelectorAll('[data-smart-form]').forEach(form => {
            new SmartForm(form);
        });
    });

})();
