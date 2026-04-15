/**
 * 表单初始化与集成脚本 V3.0
 * 将智能表单模块和表单样式库集成到页面中
 */

(function() {
    'use strict';

    // 表单页面配置
    const FormPageConfig = {
        // 需要加载表单增强的页面选择器
        formSelectors: [
            'form[data-smart-form]',
            'form.feedback-form',
            'form.contact-form',
            'form.guide-apply-form',
            'form.register-form',
            'form.login-form',
            'form.review-form',
            'form[name="guideApplyForm"]',
            'form[id$="Form"]'
        ],

        // 自动加载表单样式的页面
        formPages: [
            'feedback.html',
            'contact.html',
            'guide-apply.html',
            'login.html',
            'register.html',
            'profile-edit.html',
            'guide-verification.html',
            'review-submit.html'
        ]
    };

    // 初始化表单模块
    function initFormEnhancements() {
        // 加载表单样式库
        loadFormStyles();

        // 初始化所有智能表单
        initSmartForms();

        // 初始化表单组件
        initFormComponents();

        // 初始化移动端优化
        initMobileOptimizations();

        // 初始化无障碍增强
        initAccessibilityEnhancements();
    }

    // 加载表单样式库
    function loadFormStyles() {
        const formStylesheet = document.createElement('link');
        formStylesheet.rel = 'stylesheet';
        formStylesheet.href = 'css/form/form-components.css';
        
        // 插入到head中
        document.head.appendChild(formStylesheet);
    }

    // 初始化所有智能表单
    function initSmartForms() {
        // 查找所有表单
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // 检查是否已初始化
            if (form.dataset.smartFormInitialized) return;

            // 检查是否为需要增强的表单
            const shouldEnhance = FormPageConfig.formSelectors.some(selector => {
                return form.matches(selector) || form.querySelector(selector);
            });

            if (shouldEnhance || form.dataset.smartForm !== undefined) {
                try {
                    new window.SmartForm(form);
                    form.dataset.smartFormInitialized = 'true';
                } catch (e) {
                    console.warn('SmartForm: Failed to initialize form', e);
                }
            }
        });
    }

    // 初始化表单组件
    function initFormComponents() {
        // 美化标准输入框
        enhanceInputs();

        // 美化文本域
        enhanceTextareas();

        // 美化选择器
        enhanceSelects();

        // 美化日期输入
        enhanceDateInputs();

        // 美化文件上传
        enhanceFileUploads();

        // 美化复选框和单选框
        enhanceCheckboxesAndRadios();

        // 美化开关
        enhanceSwitches();

        // 添加密码强度指示器
        enhancePasswordInputs();
    }

    // 美化输入框
    function enhanceInputs() {
        const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"])');
        
        inputs.forEach(input => {
            // 跳过已有自定义样式的输入框
            if (input.closest('.custom-input')) return;

            // 添加基础类名
            if (!input.classList.contains('form-input')) {
                input.classList.add('form-input');
            }

            // 设置移动端字体大小
            input.style.fontSize = '16px';
        });
    }

    // 美化文本域
    function enhanceTextareas() {
        const textareas = document.querySelectorAll('textarea');
        
        textareas.forEach(textarea => {
            if (!textarea.classList.contains('form-textarea')) {
                textarea.classList.add('form-textarea');
            }
            
            // 自动高度调整
            setupAutoResize(textarea);
            
            // 字符计数
            setupCharCounter(textarea);
        });
    }

    // 自动调整文本域高度
    function setupAutoResize(textarea) {
        if (textarea.dataset.autoResize !== 'true') return;

        const resize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        };

        textarea.addEventListener('input', resize);
        resize();
    }

    // 设置字符计数器
    function setupCharCounter(textarea) {
        const maxLength = textarea.getAttribute('maxlength');
        if (!maxLength) return;

        // 查找已有的计数器
        let counter = textarea.parentElement.querySelector('.input-char-counter');
        
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'input-char-counter';
            counter.innerHTML = `<span class="current">0</span>/${maxLength}`;
            textarea.parentElement.style.position = 'relative';
            textarea.parentElement.appendChild(counter);
        }

        const updateCounter = () => {
            const length = textarea.value.length;
            counter.querySelector('.current').textContent = length;
            
            if (length >= maxLength * 0.9) {
                counter.classList.add('warning');
            } else {
                counter.classList.remove('warning');
            }
        };

        textarea.addEventListener('input', updateCounter);
        updateCounter();
    }

    // 美化选择器
    function enhanceSelects() {
        const selects = document.querySelectorAll('select');
        
        selects.forEach(select => {
            if (!select.classList.contains('form-select')) {
                select.classList.add('form-select');
            }
        });
    }

    // 美化日期输入
    function enhanceDateInputs() {
        const dateInputs = document.querySelectorAll('input[type="date"], input[type="time"], input[type="datetime-local"]');
        
        dateInputs.forEach(input => {
            const wrapper = document.createElement('div');
            wrapper.className = 'form-date';
            input.parentElement.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            
            if (!input.classList.contains('form-input')) {
                input.classList.add('form-input');
            }
        });
    }

    // 美化文件上传
    function enhanceFileUploads() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            // 跳过已有自定义样式的上传框
            if (input.closest('.file-upload-wrapper')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'file-upload-wrapper';
            
            const area = document.createElement('div');
            area.className = 'file-upload-area';
            area.innerHTML = `
                <div class="file-upload-icon">📁</div>
                <div class="file-upload-text">
                    <strong>点击上传</strong> 或拖拽文件到这里
                </div>
                <div class="file-upload-hint">支持 JPG、PNG、PDF 格式</div>
            `;
            
            input.parentElement.insertBefore(wrapper, input);
            wrapper.appendChild(area);
            area.appendChild(input);

            // 拖拽效果
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.classList.add('dragover');
            });

            area.addEventListener('dragleave', () => {
                area.classList.remove('dragover');
            });

            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.classList.remove('dragover');
                input.files = e.dataTransfer.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            });

            // 文件列表显示
            input.addEventListener('change', () => {
                updateFileList(input, wrapper);
            });
        });
    }

    // 更新文件列表
    function updateFileList(input, wrapper) {
        let fileList = wrapper.querySelector('.file-list');
        
        if (!fileList) {
            fileList = document.createElement('div');
            fileList.className = 'file-list';
            wrapper.appendChild(fileList);
        }

        fileList.innerHTML = '';
        
        Array.from(input.files).forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-item-icon">📄</div>
                <div class="file-item-info">
                    <div class="file-item-name">${file.name}</div>
                    <div class="file-item-size">${formatFileSize(file.size)}</div>
                </div>
                <div class="file-item-actions">
                    <button type="button" class="file-item-btn delete" data-index="${index}">
                        ✕
                    </button>
                </div>
            `;
            
            fileItem.querySelector('.file-item-btn.delete').addEventListener('click', () => {
                removeFile(input, index);
            });
            
            fileList.appendChild(fileItem);
        });
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 移除文件
    function removeFile(input, index) {
        const dt = new DataTransfer();
        Array.from(input.files).forEach((file, i) => {
            if (i !== index) dt.items.add(file);
        });
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 美化复选框和单选框
    function enhanceCheckboxesAndRadios() {
        // 复选框
        document.querySelectorAll('input[type="checkbox"]').forEach(input => {
            if (input.closest('.form-checkbox')) return;
            
            const wrapper = document.createElement('label');
            wrapper.className = 'form-checkbox';
            input.parentElement.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            
            const custom = document.createElement('span');
            custom.className = 'checkbox-custom';
            input.parentElement.insertBefore(custom, input.nextSibling);
        });

        // 单选框
        document.querySelectorAll('input[type="radio"]').forEach(input => {
            if (input.closest('.form-radio')) return;
            
            const wrapper = document.createElement('label');
            wrapper.className = 'form-radio';
            input.parentElement.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            
            const custom = document.createElement('span');
            custom.className = 'radio-custom';
            input.parentElement.insertBefore(custom, input.nextSibling);
        });
    }

    // 美化开关
    function enhanceSwitches() {
        document.querySelectorAll('input[type="checkbox"][data-switch]').forEach(input => {
            if (input.closest('.form-switch')) return;
            
            const wrapper = document.createElement('label');
            wrapper.className = 'form-switch';
            
            const size = input.dataset.switchSize || '';
            if (size) wrapper.classList.add(`switch-${size}`);
            
            input.parentElement.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            
            const track = document.createElement('span');
            track.className = 'switch-track';
            
            const thumb = document.createElement('span');
            thumb.className = 'switch-thumb';
            track.appendChild(thumb);
            
            input.parentElement.insertBefore(track, input.nextSibling);
        });
    }

    // 增强密码输入
    function enhancePasswordInputs() {
        document.querySelectorAll('input[type="password"]').forEach(input => {
            // 添加切换密码可见性的按钮
            const wrapper = input.closest('.input-icon-wrapper') || input.parentElement;
            
            if (!wrapper.querySelector('.toggle-password')) {
                const toggleBtn = document.createElement('button');
                toggleBtn.type = 'button';
                toggleBtn.className = 'input-icon input-icon-right toggle-password';
                toggleBtn.innerHTML = '👁';
                toggleBtn.setAttribute('aria-label', '切换密码可见性');
                
                wrapper.style.position = 'relative';
                wrapper.appendChild(toggleBtn);
                
                toggleBtn.addEventListener('click', () => {
                    if (input.type === 'password') {
                        input.type = 'text';
                        toggleBtn.innerHTML = '🙈';
                    } else {
                        input.type = 'password';
                        toggleBtn.innerHTML = '👁';
                    }
                });
            }

            // 添加密码强度指示器
            const strengthContainer = input.closest('.form-group');
            if (strengthContainer && !strengthContainer.querySelector('.password-strength')) {
                const strengthEl = document.createElement('div');
                strengthEl.className = 'password-strength-container';
                input.parentElement.appendChild(strengthEl);
                
                input.addEventListener('input', () => {
                    window.SmartForm.PasswordStrength.render(strengthEl, input.value);
                });
            }
        });
    }

    // 初始化移动端优化
    function initMobileOptimizations() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (!isMobile) return;

        // 确保输入框字体大小为16px以防止iOS缩放
        document.querySelectorAll('input, textarea, select').forEach(el => {
            if (getComputedStyle(el).fontSize === '14px') {
                el.style.fontSize = '16px';
            }
        });

        // 防止键盘弹出时页面缩放
        const metaViewport = document.querySelector('meta[name="viewport"]');
        if (metaViewport && !metaViewport.content.includes('minimum-scale=1')) {
            metaViewport.content += ', minimum-scale=1, maximum-scale=1';
        }
    }

    // 初始化无障碍增强
    function initAccessibilityEnhancements() {
        // 为所有表单元素添加 aria-required 属性
        document.querySelectorAll('[required]').forEach(el => {
            el.setAttribute('aria-required', 'true');
        });

        // 为所有有占位符的输入框添加 aria-describedby
        document.querySelectorAll('input[placeholder]').forEach(input => {
            const id = 'placeholder-' + Math.random().toString(36).substr(2, 9);
            input.id = input.id || id;
            
            const describedBy = input.getAttribute('aria-describedby') || '';
            if (!describedBy.includes('placeholder')) {
                input.setAttribute('aria-describedby', (describedBy + ' ' + id).trim());
            }
        });

        // 确保错误消息可被屏幕阅读器访问
        document.querySelectorAll('.validation-error, .error-message').forEach(el => {
            el.setAttribute('role', 'alert');
            el.setAttribute('aria-live', 'polite');
        });
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFormEnhancements);
    } else {
        initFormEnhancements();
    }

    // 监听动态添加的表单
    const formObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.tagName === 'FORM') {
                    try {
                        new window.SmartForm(node);
                        node.dataset.smartFormInitialized = 'true';
                    } catch (e) {
                        console.warn('SmartForm: Failed to initialize dynamically added form', e);
                    }
                }
            });
        });
    });

    formObserver.observe(document.body, { childList: true, subtree: true });

    // 导出到全局
    window.FormEnhancer = {
        init: initFormEnhancements,
        initSmartForms,
        initFormComponents,
        enhanceInputs,
        enhanceTextareas,
        enhanceSelects,
        enhanceDateInputs,
        enhanceFileUploads,
        enhanceCheckboxesAndRadios,
        enhanceSwitches,
        enhancePasswordInputs
    };

})();
