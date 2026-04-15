/**
 * 数据导出模块 - Data Export
 * 支持Excel、PDF、CSV、JSON格式的数据导出
 */

const DataExporter = {
    // 配置
    config: {
        excelMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csvMimeType: 'text/csv;charset=utf-8',
        pdfMimeType: 'application/pdf'
    },

    /**
     * 导出数据
     * @param {Object} data - 要导出的数据
     * @param {string} filename - 文件名（不含扩展名）
     * @param {string} format - 导出格式: excel, csv, pdf, json
     * @param {Object} options - 额外选项
     */
    async export(data, filename, format = 'excel', options = {}) {
        const defaultOptions = {
            sheetName: '数据',
            includeTimestamp: true,
            showLoader: true,
            ...options
        };

        try {
            switch (format.toLowerCase()) {
                case 'excel':
                case 'xlsx':
                    return this.exportToExcel(data, filename, defaultOptions);
                case 'csv':
                    return this.exportToCSV(data, filename, defaultOptions);
                case 'pdf':
                    return this.exportToPDF(data, filename, defaultOptions);
                case 'json':
                    return this.exportToJSON(data, filename, defaultOptions);
                default:
                    console.error('不支持的导出格式:', format);
                    return false;
            }
        } catch (error) {
            console.error('导出失败:', error);
            this.showError('导出失败，请重试');
            return false;
        }
    },

    /**
     * 导出为Excel
     */
    exportToExcel(data, filename, options) {
        const csv = this.convertToCSV(data);
        const bom = '\ufeff'; // UTF-8 BOM
        const blob = new Blob([bom + csv], {
            type: 'application/vnd.ms-excel;charset=utf-8'
        });
        
        this.downloadBlob(blob, `${filename}.xls`);
        this.showSuccess(`"${filename}" 导出成功`);
        return true;
    },

    /**
     * 导出为CSV
     */
    exportToCSV(data, filename, options) {
        const csv = this.convertToCSV(data);
        const bom = '\ufeff';
        const blob = new Blob([bom + csv], {
            type: 'text/csv;charset=utf-8'
        });
        
        this.downloadBlob(blob, `${filename}.csv`);
        this.showSuccess(`"${filename}" 导出成功`);
        return true;
    },

    /**
     * 导出为JSON
     */
    exportToJSON(data, filename, options) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], {
            type: 'application/json'
        });
        
        this.downloadBlob(blob, `${filename}.json`);
        this.showSuccess(`"${filename}" 导出成功`);
        return true;
    },

    /**
     * 导出为PDF（需要后端支持，这里生成简单的打印格式）
     */
    exportToPDF(data, filename, options) {
        // 打开新窗口生成可打印的HTML
        const printWindow = window.open('', '_blank');
        const html = this.generatePrintHTML(data, filename, options);
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
        
        this.showSuccess(`"${filename}" PDF生成中...`);
        return true;
    },

    /**
     * 将数据转换为CSV格式
     */
    convertToCSV(data) {
        if (Array.isArray(data)) {
            if (data.length === 0) return '';
            
            // 获取所有键
            const headers = this.getAllKeys(data[0]);
            
            // 生成表头行
            const headerRow = headers.map(h => this.escapeCSV(h)).join(',');
            
            // 生成数据行
            const dataRows = data.map(item => {
                return headers.map(key => {
                    const value = this.getNestedValue(item, key);
                    return this.escapeCSV(value);
                }).join(',');
            });
            
            return [headerRow, ...dataRows].join('\n');
        } else {
            // 单个对象，转换为键值对形式
            const rows = [];
            for (const key in data) {
                const value = data[key];
                if (typeof value === 'object' && value !== null) {
                    rows.push([key, JSON.stringify(value)]);
                } else {
                    rows.push([key, value]);
                }
            }
            return rows.map(([k, v]) => `${this.escapeCSV(k)},${this.escapeCSV(v)}`).join('\n');
        }
    },

    /**
     * 获取对象所有嵌套键
     */
    getAllKeys(obj, prefix = '') {
        const keys = [];
        for (const key in obj) {
            const fullKey = prefix ? `${prefix}_${key}` : key;
            const value = obj[key];
            
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                keys.push(...this.getAllKeys(value, fullKey));
            } else {
                keys.push(fullKey);
            }
        }
        return [...new Set(keys)]; // 去重
    },

    /**
     * 获取嵌套属性值
     */
    getNestedValue(obj, key) {
        const keys = key.split('_');
        let value = obj;
        
        for (const k of keys) {
            if (value === null || value === undefined) return '';
            value = value[k];
        }
        
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return value;
    },

    /**
     * 转义CSV特殊字符
     */
    escapeCSV(value) {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    },

    /**
     * 生成打印HTML
     */
    generatePrintHTML(data, title, options) {
        const timestamp = new Date().toLocaleString('zh-CN');
        
        let tableHTML = '';
        if (Array.isArray(data) && data.length > 0) {
            const headers = this.getAllKeys(data[0]);
            
            tableHTML = `
                <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            ${headers.map(h => `<th style="text-align: left;">${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => `
                            <tr>
                                ${headers.map(h => `<td>${this.getNestedValue(item, h)}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            tableHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        }
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
                    .meta { color: #666; margin-bottom: 20px; }
                    table { border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; }
                    th { background: #f5f5f5; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <div class="meta">生成时间: ${timestamp}</div>
                ${tableHTML}
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `;
    },

    /**
     * 下载Blob文件
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * 显示成功提示
     */
    showSuccess(message) {
        this.showToast(message, 'success');
    },

    /**
     * 显示错误提示
     */
    showError(message) {
        this.showToast(message, 'error');
    },

    /**
     * 显示Toast提示
     */
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 10px;
            color: white;
            font-size: 14px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#10B981' : '#EF4444'};
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * 批量导出多个数据集
     */
    async exportMultiple(datasets, zipFilename = 'export') {
        // 简化为逐个导出JSON
        for (const { data, filename } of datasets) {
            await this.export(data, filename, 'json');
            await new Promise(resolve => setTimeout(resolve, 500)); // 避免浏览器阻止
        }
        this.showSuccess('批量导出完成');
    },

    /**
     * 导出用户数据
     */
    async exportUserAnalytics() {
        const data = {
            userProfile: await UserAnalytics.loadUserProfile(),
            behavior: await UserAnalytics.loadBehaviorData(),
            retention: await UserAnalytics.loadRetentionData(),
            activity: await UserAnalytics.loadActivityData()
        };
        
        return this.export(data, `用户分析_${this.getDateStr()}`, 'excel');
    },

    /**
     * 导出业务数据
     */
    async exportBusinessAnalytics() {
        const data = {
            orders: await BusinessAnalytics.loadOrderData(),
            revenue: await BusinessAnalytics.loadRevenueData(),
            guides: await BusinessAnalytics.loadGuideData(),
            conversion: await BusinessAnalytics.loadConversionData()
        };
        
        return this.export(data, `业务分析_${this.getDateStr()}`, 'excel');
    },

    /**
     * 导出内容数据
     */
    async exportContentAnalytics() {
        const data = {
            pageAccess: await ContentAnalytics.loadPageAccessData(),
            hotContent: await ContentAnalytics.loadHotContentData(),
            search: await ContentAnalytics.loadSearchData(),
            share: await ContentAnalytics.loadShareData()
        };
        
        return this.export(data, `内容分析_${this.getDateStr()}`, 'excel');
    },

    /**
     * 导出运营数据
     */
    async exportOperationAnalytics() {
        const data = {
            activities: await OperationAnalytics.loadActivityData(),
            coupons: await OperationAnalytics.loadCouponData(),
            channels: await OperationAnalytics.loadChannelData(),
            roi: await OperationAnalytics.loadROIData()
        };
        
        return this.export(data, `运营分析_${this.getDateStr()}`, 'excel');
    },

    /**
     * 导出完整报表
     */
    async exportFullReport() {
        const datasets = [
            { data: await UserAnalytics.loadUserProfile(), filename: '用户画像' },
            { data: await UserAnalytics.loadBehaviorData(), filename: '用户行为' },
            { data: await BusinessAnalytics.loadOrderData(), filename: '订单统计' },
            { data: await BusinessAnalytics.loadRevenueData(), filename: '营收统计' },
            { data: await ContentAnalytics.loadPageAccessData(), filename: '页面访问' },
            { data: await OperationAnalytics.loadROIData(), filename: 'ROI分析' }
        ];
        
        return this.exportMultiple(datasets, '综合报表');
    },

    /**
     * 获取日期字符串
     */
    getDateStr(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }
};

// 导出模块
window.DataExporter = DataExporter;
