/**
 * 表单体验增强脚本 V2.0
 * 功能：实时验证、输入格式化、密码强度、表单自动保存、错误提示优化
 */

(function() {
    'use strict';

    // 表单增强配置
    const FormConfig = {
        // 验证规则
        validators: {
            phone: {
                pattern: /^1[3-9]\d{9}$/,
                message: '请输入有效的11位手机号码',
                success: '✓ 手机号格式正确',
                async: true  // 需要异步验证
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
                success: '✓ 身份证格式正确',
                validate: function(value) {
                    if (!this.pattern.test(value)) return false;
                    // 校验码验证
                    let sum = 0;
                    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
                    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
                    for (let i = 0; i < 17; i++) {
                        sum += parseInt(value[i]) * weights[i];
                    }
                    const checkCode = checkCodes[sum % 11];
                    return checkCode.toUpperCase() === value[17].toUpperCase();
                }
            },
            certCode: {
                pattern: /^[A-Z]\d{7,}$/,
                message: '请输入正确的导游证号（字母开头+数字）',
                success: '✓ 导游证号格式正确'
            },
            url: {
                pattern: /^https?:\/\/.+/,
                message: '请输入有效的网址',
                success: '✓ 网址格式正确'
            },
            wechat: {
                pattern: /^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/,
                message: '请输入有效的微信号',
                success: '✓ 微信号格式正确'
            },
            captcha: {
                pattern: /^\d{4,6}$/,
                message: '请输入4-6位数字验证码',
                success: '✓ 验证码正确'
            }
        },

        // 防抖延迟(ms)
        debounceDelay: 300,
        
        // 颜色配置
        colors: {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        },

        // 自动保存配置
        autoSave: {
            enabled: true,
            storageKey: 'form_draft_',
            saveInterval: 2000,  // 2秒防抖
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7天过期
        }
    };

    // 密码强度检测
    const PasswordStrength = {
        check(password) {
            if (!password) return { level: 0, text: '', bars: 0 };
            
            let score = 0;
            
            // 长度检查
            if (password.length >= 6) score++;
            if (password.length >= 8) score++;
            if (password.length >= 12) score++;
            
            // 复杂度检查
            if (/[a-z]/.test(password)) score++;
            if (/[A-Z]/.test(password)) score++;
            if (/\d/.test(password)) score++;
            if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) score++;
            
            // 常见弱密码检查
            const weakPasswords = ['123456', 'password', '12345678', 'qwerty', 'abc123', 'monkey', '1234567'];
            if (weakPasswords.some(w => password.toLowerCase().includes(w))) {
                score = Math.min(score, 2);
            }
            
            let level, text, bars;
            if (score <= 2) {
                level = 'weak';
                text = '弱 - 建议使用字母、数字、符号组合';
                bars = 1;
            } else if (score <= 4) {
                level = 'medium';
                text = '中等 - 可以更安全';
                bars = 2;
            } else {
                level = 'strong';
                text = '强 - 密码很安全';
                bars = 3;
            }
            
            return { level, text, bars, score };
        }
    };

    // 表单自动保存
    const FormAutoSave = {
        cache: {},
        timers: {},

        init(formId, inputs) {
            if (!FormConfig.autoSave.enabled) return;
            
            const key = FormConfig.autoSave.storageKey + formId;
            this.cache[key] = {};
            
            // 监听输入变化
            inputs.forEach(input => {
                if (input.type === 'password' || input.type === 'file') return;
                
                const saveHandler = () => {
                    this.debouncedSave(key, formId, inputs);
                };
                
                input.addEventListener('input', saveHandler);
                input.addEventListener('change', saveHandler);
            });

            // 恢复已保存的数据
            this.restore(key, inputs);
            
            // 页面离开时保存
            window.addEventListener('beforeunload', () => {
                this.save(key, formId, inputs);
            });
        },

        debouncedSave(key, formId, inputs) {
            clearTimeout(this.timers[key]);
            this.timers[key] = setTimeout(() => {
                this.save(key, formId, inputs);
            }, FormConfig.autoSave.saveInterval);
        },

        save(key, formId, inputs) {
            const data = {};
            inputs.forEach(input => {
                if (input.type === 'password' || input.type === 'file' || input.type === 'checkbox') return;
                if (input.type === 'radio') {
                    if (input.checked) data[input.name] = input.value;
                } else {
                    data[input.id || input.name] = input.value;
                }
            });
            
            // 恢复复选框状态
            const checkboxes = document.querySelectorAll(`#${formId} input[type="checkbox"]`);
            checkboxes.forEach(cb => {
                data[cb.id || cb.name] = cb.checked;
            });
            
            const saveData = {
                data,
                timestamp: Date.now()
            };
            
            try {
                localStorage.setItem(key, JSON.stringify(saveData));
                this.cache[key] = data;
            } catch (e) {
                console.warn('表单自动保存失败:', e);
            }
        },

        restore(key, inputs) {
            try {
                const saved = localStorage.getItem(key);
                if (!saved) return;
                
                const { data, timestamp } = JSON.parse(saved);
                
                // 检查是否过期
                if (Date.now() - timestamp > FormConfig.autoSave.maxAge) {
                    localStorage.removeItem(key);
                    return;
                }
                
                // 恢复数据
                inputs.forEach(input => {
                    if (input.type === 'password' || input.type === 'file') return;
                    
                    const value = data[input.id || input.name];
                    if (value !== undefined) {
                        if (input.type === 'radio') {
                            if (input.value === value) input.checked = true;
                        } else {
                            input.value = value;
                        }
                    }
                });
                
                // 恢复复选框
                const checkboxes = document.querySelectorAll(`#${inputs[0]?.form?.id || ''} input[type="checkbox"]`);
                checkboxes.forEach(cb => {
                    if (data[cb.id || cb.name] !== undefined) {
                        cb.checked = data[cb.id || cb.name];
                        if (cb.closest('.checkbox-item')) {
                            cb.closest('.checkbox-item').classList.toggle('selected', cb.checked);
                        }
                    }
                });
                
                // 显示恢复提示
                this.showRestoreNotice();
                
            } catch (e) {
                console.warn('表单恢复失败:', e);
            }
        },

        showRestoreNotice() {
            const notice = document.createElement('div');
            notice.className = 'autosave-notice';
            notice.innerHTML = '📝 已自动恢复上次填写内容';
            notice.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #3B82F6;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 9999;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            `;
            document.body.appendChild(notice);
            
            setTimeout(() => {
                notice.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => notice.remove(), 300);
            }, 3000);
        },

        clear(formId) {
            const key = FormConfig.autoSave.storageKey + formId;
            localStorage.removeItem(key);
            delete this.cache[key];
        }
    };

    // 核心验证器
    const FormValidator = {
        validate(input, validatorKey, showFeedback = true) {
            const validator = FormConfig.validators[validatorKey];
            if (!validator) return { valid: true };
            
            const value = input.value.trim();
            const group = input.closest('.form-group');
            
            // 获取或创建反馈元素
            let feedback = group?.querySelector('.validation-feedback');
            if (showFeedback && !feedback) {
                feedback = this.createFeedback(input);
            }
            
            // 空值检查
            if (!value) {
                if (input.required) {
                    this.showError(feedback, input, '此字段为必填项');
                    return { valid: false, message: '此字段为必填项' };
                }
                this.clearState(input, feedback);
                return { valid: true };
            }
            
            // 格式验证
            let isValid;
            if (typeof validator.validate === 'function') {
                isValid = validator.validate(value);
            } else if (validator.pattern) {
                isValid = validator.pattern.test(value);
            } else {
                isValid = true;
            }
            
            if (isValid) {
                if (showFeedback) this.showSuccess(feedback, input, validator.success);
                return { valid: true };
            } else {
                if (showFeedback) this.showError(feedback, input, validator.message);
                return { valid: false, message: validator.message };
            }
        },

        createFeedback(input) {
            const feedback = document.createElement('div');
            feedback.className = 'validation-feedback';
            input.parentNode.appendChild(feedback);
            return feedback;
        },

        showError(feedback, input, message) {
            if (feedback) {
                feedback.className = 'validation-feedback error show';
                feedback.innerHTML = `<span class="validation-icon">✕</span>${message}`;
            }
            input.classList.remove('success');
            input.classList.add('error');
        },

        showSuccess(feedback, input, message) {
            if (feedback) {
                feedback.className = 'validation-feedback success show';
                feedback.innerHTML = `<span class="validation-icon">✓</span>${message}`;
            }
            input.classList.remove('error');
            input.classList.add('success');
        },

        clearState(input, feedback) {
            if (feedback) {
                feedback.classList.remove('show');
                feedback.className = 'validation-feedback';
            }
            input.classList.remove('error', 'success');
        }
    };

    // 输入格式化器
    const InputFormatter = {
        formatPhone(input) {
            let value = input.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            input.value = value;
        },
        
        formatIdCard(input) {
            let value = input.value.replace(/[\s\W]/g, '').toUpperCase();
            if (value.length > 18) value = value.slice(0, 18);
            input.value = value;
        },
        
        formatCaptcha(input) {
            input.value = input.value.replace(/\D/g, '').slice(0, 6);
        }
    };

    // 主初始化函数
    function initFormEnhance() {
        injectStyles();
        initPasswordToggles();
        initRealTimeValidation();
        initPasswordStrength();
        initInputFormatting();
        initFormAutoSave();
        initFormSubmit();
        initCharCounter();
    }

    // 注入CSS样式
    function injectStyles() {
        const css = `
            /* 验证反馈样式 */
            .validation-feedback {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                margin-top: 6px;
                padding: 6px 10px;
                border-radius: 6px;
                transition: all 0.3s ease;
                opacity: 0;
                max-height: 0;
                overflow: hidden;
            }

            .validation-feedback.show {
                opacity: 1;
                max-height: 50px;
            }

            .validation-feedback.success {
                color: ${FormConfig.colors.success};
                background: rgba(16, 185, 129, 0.1);
            }

            .validation-feedback.error {
                color: ${FormConfig.colors.error};
                background: rgba(239, 68, 68, 0.1);
            }

            .validation-feedback.warning {
                color: ${FormConfig.colors.warning};
                background: rgba(245, 158, 11, 0.1);
            }

            .validation-icon {
                font-size: 14px;
                flex-shrink: 0;
            }

            /* 密码强度指示器 */
            .password-strength-container {
                margin-top: 8px;
            }

            .password-strength {
                display: flex;
                gap: 4px;
                margin-bottom: 4px;
            }

            .strength-bar {
                flex: 1;
                height: 4px;
                background: #E2E8F0;
                border-radius: 2px;
                transition: all 0.3s ease;
            }

            .strength-bar.active.weak { background: ${FormConfig.colors.error}; }
            .strength-bar.active.medium { background: ${FormConfig.colors.warning}; }
            .strength-bar.active.strong { background: ${FormConfig.colors.success}; }

            .strength-text {
                font-size: 12px;
                transition: color 0.3s;
            }

            .strength-text.weak { color: ${FormConfig.colors.error}; }
            .strength-text.medium { color: ${FormConfig.colors.warning}; }
            .strength-text.strong { color: ${FormConfig.colors.success}; }

            /* 输入框状态 */
            .form-input.error,
            input.error,
            textarea.error,
            select.error {
                border-color: ${FormConfig.colors.error} !important;
                background-color: rgba(239, 68, 68, 0.03) !important;
            }

            .form-input.success,
            input.success,
            textarea.success,
            select.success {
                border-color: ${FormConfig.colors.success} !important;
                background-color: rgba(16, 185, 129, 0.03) !important;
            }

            /* 错误消息动画 */
            @keyframes formShake {
                0%, 100% { transform: translateX(0); }
                20% { transform: translateX(-4px); }
                40% { transform: translateX(4px); }
                60% { transform: translateX(-4px); }
                80% { transform: translateX(4px); }
            }

            input.error, select.error, textarea.error {
                animation: formShake 0.4s ease;
            }

            /* 字符计数器 */
            .char-counter {
                font-size: 11px;
                color: #94A3B8;
                text-align: right;
                margin-top: 4px;
                transition: color 0.2s;
            }

            .char-counter.warning { color: ${FormConfig.colors.warning}; }
            .char-counter.danger { color: ${FormConfig.colors.error}; }

            /* 自动保存提示动画 */
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }

            /* 按钮加载状态 */
            .btn-loading {
                position: relative;
                pointer-events: none;
                opacity: 0.8;
            }

            .btn-loading::after {
                content: '';
                position: absolute;
                width: 18px;
                height: 18px;
                top: 50%;
                left: 50%;
                margin-left: -9px;
                margin-top: -9px;
                border: 2px solid rgba(255,255,255,0.3);
                border-top-color: #fff;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .btn-success {
                background: ${FormConfig.colors.success} !important;
            }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // 初始化密码显示/隐藏切换
    function initPasswordToggles() {
        document.querySelectorAll('input[type="password"]').forEach(input => {
            if (input.parentElement.querySelector('.password-toggle')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'password-input-wrapper';
            wrapper.style.cssText = 'position: relative;';

            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'password-toggle';
            toggle.innerHTML = '👁';
            toggle.setAttribute('aria-label', '切换密码显示');
            toggle.style.cssText = `
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                cursor: pointer;
                font-size: 16px;
                opacity: 0.5;
                transition: opacity 0.2s;
                z-index: 2;
                padding: 4px;
            `;

            toggle.addEventListener('mouseenter', () => toggle.style.opacity = '1');
            toggle.addEventListener('mouseleave', () => toggle.style.opacity = '0.5');

            toggle.addEventListener('click', () => {
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.innerHTML = '🙈';
                } else {
                    input.type = 'password';
                    toggle.innerHTML = '👁';
                }
                input.focus();
            });

            wrapper.appendChild(toggle);
            input.style.paddingRight = '45px';
        });
    }

    // 初始化实时验证
    function initRealTimeValidation() {
        document.querySelectorAll('input[data-validate], input[data-type]').forEach(input => {
            const validatorKey = input.dataset.validate || input.dataset.type;
            const validator = FormConfig.validators[validatorKey];
            if (!validator) return;

            const group = input.closest('.form-group');
            if (!group) return;

            let feedback = group.querySelector('.validation-feedback');
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.className = 'validation-feedback';
                input.parentNode.appendChild(feedback);
            }

            let debounceTimer;

            const validateHandler = () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    FormValidator.validate(input, validatorKey);
                }, FormConfig.debounceDelay);
            };

            input.addEventListener('input', validateHandler);
            input.addEventListener('blur', () => {
                clearTimeout(debounceTimer);
                FormValidator.validate(input, validatorKey);
            });

            // 清除错误状态
            input.addEventListener('focus', () => {
                input.classList.remove('error');
                if (feedback) feedback.classList.remove('show');
            });
        });

        // 密码确认验证
        document.querySelectorAll('input[type="password"]').forEach(input => {
            if (!input.id) return;
            
            const isConfirm = input.id.toLowerCase().includes('confirm');
            const isPassword = input.id.toLowerCase().includes('password') && !isConfirm;
            
            if (isConfirm) {
                const passwordId = input.id.replace(/confirm/i, 'password').replace(/Confirm/i, 'Password');
                const passwordInput = document.getElementById(passwordId);
                
                if (passwordInput) {
                    const group = input.closest('.form-group');
                    let feedback = group?.querySelector('.validation-feedback');
                    if (!feedback) {
                        feedback = FormValidator.createFeedback(input);
                    }

                    const validateConfirm = () => {
                        const pwd = passwordInput.value;
                        const confirm = input.value;
                        
                        if (!confirm) {
                            FormValidator.clearState(input, feedback);
                            return;
                        }
                        
                        if (pwd === confirm && pwd.length > 0) {
                            FormValidator.showSuccess(feedback, input, '两次密码一致 ✓');
                        } else {
                            FormValidator.showError(feedback, input, '两次密码不一致');
                        }
                    };

                    input.addEventListener('input', validateConfirm);
                    input.addEventListener('blur', validateConfirm);
                }
            }
        });
    }

    // 初始化密码强度指示器
    function initPasswordStrength() {
        document.querySelectorAll('input[data-validate="password"], input[type="password"]').forEach(input => {
            // 只在主密码框添加强度指示器
            if (input.id && input.id.toLowerCase().includes('confirm')) return;
            if (input.closest('.password-strength-container')) return;

            const group = input.closest('.form-group');
            if (!group) return;

            const container = document.createElement('div');
            container.className = 'password-strength-container';
            container.innerHTML = `
                <div class="password-strength">
                    <div class="strength-bar"></div>
                    <div class="strength-bar"></div>
                    <div class="strength-bar"></div>
                </div>
                <div class="strength-text"></div>
            `;
            input.parentNode.appendChild(container);

            const bars = container.querySelectorAll('.strength-bar');
            const text = container.querySelector('.strength-text');

            input.addEventListener('input', () => {
                const { level, text: label, bars: activeBars } = PasswordStrength.check(input.value);

                bars.forEach((bar, i) => {
                    bar.classList.remove('active', 'weak', 'medium', 'strong');
                    if (i < activeBars) {
                        bar.classList.add('active', level);
                    }
                });

                text.textContent = input.value ? label : '';
                text.className = 'strength-text ' + (input.value ? level : '');
            });
        });
    }

    // 初始化输入格式化
    function initInputFormatting() {
        // 手机号格式化
        document.querySelectorAll('input[type="tel"], input[data-type="phone"], input[placeholder*="手机"]').forEach(input => {
            input.addEventListener('input', () => InputFormatter.formatPhone(input));
        });

        // 身份证格式化
        document.querySelectorAll('input[data-type="idcard"], input[placeholder*="身份证"]').forEach(input => {
            input.addEventListener('input', () => InputFormatter.formatIdCard(input));
        });

        // 验证码格式化
        document.querySelectorAll('input[data-type="captcha"], input[placeholder*="验证码"]').forEach(input => {
            input.addEventListener('input', () => InputFormatter.formatCaptcha(input));
        });
    }

    // 初始化表单自动保存
    function initFormAutoSave() {
        document.querySelectorAll('form[id]').forEach(form => {
            const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
            FormAutoSave.init(form.id, inputs);
        });
    }

    // 初始化表单提交验证
    function initFormSubmit() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (!submitBtn) return;

                // 收集所有需要验证的字段
                const inputs = form.querySelectorAll('input[data-validate], input[data-type], input[required]');
                let isValid = true;
                let firstInvalid = null;

                inputs.forEach(input => {
                    const validatorKey = input.dataset.validate || input.dataset.type;
                    if (validatorKey && FormConfig.validators[validatorKey]) {
                        const result = FormValidator.validate(input, validatorKey);
                        if (!result.valid) {
                            isValid = false;
                            if (!firstInvalid) firstInvalid = input;
                        }
                    } else if (input.required && !input.value.trim()) {
                        const group = input.closest('.form-group');
                        if (group) {
                            input.classList.add('error');
                            const feedback = group.querySelector('.validation-feedback');
                            if (feedback) {
                                FormValidator.showError(feedback, input, '此字段为必填项');
                            }
                        }
                        isValid = false;
                        if (!firstInvalid) firstInvalid = input;
                    }
                });

                if (!isValid) {
                    e.preventDefault();
                    firstInvalid?.focus();
                    return;
                }

                // 显示提交状态
                if (submitBtn.classList.contains('btn-loading')) return;
                
                submitBtn.classList.add('btn-loading');
                const originalText = submitBtn.textContent;
                submitBtn.dataset.originalText = originalText;
                submitBtn.textContent = '提交中...';
                submitBtn.disabled = true;

                // 表单提交后清理自动保存
                setTimeout(() => {
                    FormAutoSave.clear(form.id);
                }, 1000);
            });
        });
    }

    // 初始化字符计数器
    function initCharCounter() {
        document.querySelectorAll('textarea[maxlength], input[maxlength]').forEach(input => {
            const maxLength = parseInt(input.getAttribute('maxlength'));
            if (!maxLength || maxLength < 10) return;

            const group = input.closest('.form-group');
            if (!group) return;

            const counter = document.createElement('div');
            counter.className = 'char-counter';
            counter.textContent = `${input.value.length}/${maxLength}`;
            input.parentNode.appendChild(counter);

            input.addEventListener('input', () => {
                const length = input.value.length;
                counter.textContent = `${length}/${maxLength}`;
                
                counter.classList.remove('warning', 'danger');
                if (length >= maxLength) {
                    counter.classList.add('danger');
                } else if (length > maxLength * 0.8) {
                    counter.classList.add('warning');
                }
            });
        });
    }

    // 暴露API到全局
    window.FormValidator = FormValidator;
    window.FormAutoSave = FormAutoSave;
    window.PasswordStrength = PasswordStrength;

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFormEnhance);
    } else {
        initFormEnhance();
    }

})();
