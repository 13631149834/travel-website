/**
 * 游导旅游平台 - 数据导出工具
 * 支持 Excel、PDF、CSV、图片等多种导出格式
 */

// 导出工具类
class ExportUtility {
    constructor() {
        this.supportedFormats = ['excel', 'pdf', 'csv', 'png', 'json'];
        this.chartInstances = new Map();
    }

    // 导出为Excel
    async exportToExcel(data, filename, options = {}) {
        try {
            const {
                sheetName = '数据报告',
                includeHeaders = true,
                autoWidth = true
            } = options;

            // 创建工作簿
            const workbook = {
                sheets: [{
                    name: sheetName,
                    data: this.prepareTableData(data, includeHeaders)
                }]
            };

            // 生成Excel文件（模拟，实际需要使用xlsx库）
            const excelContent = this.generateExcelContent(workbook);
            const blob = new Blob([excelContent], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            this.downloadBlob(blob, `${filename}.xlsx`);
            
            return { success: true, message: 'Excel导出成功', filename: `${filename}.xlsx` };
        } catch (error) {
            console.error('Excel导出失败:', error);
            return { success: false, message: 'Excel导出失败: ' + error.message };
        }
    }

    // 导出为CSV
    async exportToCSV(data, filename, options = {}) {
        try {
            const {
                delimiter = ',',
                includeHeaders = true,
                encoding = 'utf-8'
            } = options;

            let csvContent = '';
            
            if (Array.isArray(data) && data.length > 0) {
                // 处理数组数据
                const headers = Object.keys(data[0]);
                
                if (includeHeaders) {
                    csvContent += headers.join(delimiter) + '\n';
                }
                
                data.forEach(row => {
                    const values = headers.map(header => {
                        let value = row[header];
                        // 处理包含逗号或引号的值
                        if (typeof value === 'string' && (value.includes(delimiter) || value.includes('"'))) {
                            value = `"${value.replace(/"/g, '""')}"`;
                        }
                        return value;
                    });
                    csvContent += values.join(delimiter) + '\n';
                });
            } else if (typeof data === 'object') {
                // 处理对象数据
                Object.entries(data).forEach(([key, value]) => {
                    let val = typeof value === 'object' ? JSON.stringify(value) : value;
                    csvContent += `${key}${delimiter}${val}\n`;
                });
            }

            // 添加BOM以支持中文
            const bom = '\ufeff';
            const blob = new Blob([bom + csvContent], {
                type: `text/csv;charset=${encoding}`
            });

            this.downloadBlob(blob, `${filename}.csv`);
            
            return { success: true, message: 'CSV导出成功', filename: `${filename}.csv` };
        } catch (error) {
            console.error('CSV导出失败:', error);
            return { success: false, message: 'CSV导出失败: ' + error.message };
        }
    }

    // 导出为PDF
    async exportToPDF(data, filename, options = {}) {
        try {
            const {
                title = '数据报告',
                orientation = 'portrait',
                margins = { top: 20, right: 20, bottom: 20, left: 20 }
            } = options;

            // 生成PDF内容（模拟，实际需要使用jsPDF库）
            const pdfContent = this.generatePDFContent(data, { title, orientation, margins });
            const blob = new Blob([pdfContent], { type: 'application/pdf' });

            this.downloadBlob(blob, `${filename}.pdf`);
            
            return { success: true, message: 'PDF导出成功', filename: `${filename}.pdf` };
        } catch (error) {
            console.error('PDF导出失败:', error);
            return { success: false, message: 'PDF导出失败: ' + error.message };
        }
    }

    // 导出图表为图片
    async exportChartToImage(chartElement, filename, options = {}) {
        try {
            const {
                format = 'png',
                quality = 1,
                width = null,
                height = null
            } = options;

            let imageData;
            
            if (chartElement instanceof HTMLCanvasElement) {
                // 直接从canvas导出
                imageData = chartElement.toDataURL(`image/${format}`, quality);
            } else if (chartElement.querySelector('canvas')) {
                // 从包含canvas的DOM元素导出
                const canvas = chartElement.querySelector('canvas');
                imageData = canvas.toDataURL(`image/${format}`, quality);
            } else {
                // 使用html2canvas（如果可用）
                if (typeof html2canvas !== 'undefined') {
                    const canvas = await html2canvas(chartElement, {
                        scale: 2,
                        useCORS: true,
                        backgroundColor: '#ffffff'
                    });
                    imageData = canvas.toDataURL(`image/${format}`, quality);
                } else {
                    throw new Error('无法获取图表数据');
                }
            }

            // 下载图片
            const link = document.createElement('a');
            link.href = imageData;
            link.download = `${filename}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            return { success: true, message: '图片导出成功', filename: `${filename}.${format}` };
        } catch (error) {
            console.error('图片导出失败:', error);
            return { success: false, message: '图片导出失败: ' + error.message };
        }
    }

    // 导出为JSON
    async exportToJSON(data, filename, options = {}) {
        try {
            const {
                prettyPrint = true,
                replacer = null
            } = options;

            const jsonContent = prettyPrint 
                ? JSON.stringify(data, replacer, 2)
                : JSON.stringify(data, replacer);

            const blob = new Blob([jsonContent], { type: 'application/json' });
            this.downloadBlob(blob, `${filename}.json`);
            
            return { success: true, message: 'JSON导出成功', filename: `${filename}.json` };
        } catch (error) {
            console.error('JSON导出失败:', error);
            return { success: false, message: 'JSON导出失败: ' + error.message };
        }
    }

    // 批量导出
    async batchExport(items, filename, format = 'zip') {
        try {
            const results = [];
            
            for (const item of items) {
                const { data, name, type } = item;
                let result;
                
                switch (type) {
                    case 'excel':
                        result = await this.exportToExcel(data, name);
                        break;
                    case 'csv':
                        result = await this.exportToCSV(data, name);
                        break;
                    case 'pdf':
                        result = await this.exportToPDF(data, name);
                        break;
                    case 'json':
                        result = await this.exportToJSON(data, name);
                        break;
                    default:
                        result = { success: false, message: '不支持的格式' };
                }
                
                results.push({ name, ...result });
            }

            // 创建汇总文件
            const summary = results.map(r => 
                `${r.name}: ${r.success ? '成功' : '失败'}`
            ).join('\n');

            const successCount = results.filter(r => r.success).length;
            
            return {
                success: true,
                message: `批量导出完成 (${successCount}/${results.length})`,
                details: results,
                summary
            };
        } catch (error) {
            console.error('批量导出失败:', error);
            return { success: false, message: '批量导出失败: ' + error.message };
        }
    }

    // 定时导出任务
    scheduleExport(taskConfig) {
        const {
            id,
            dataSource,
            format,
            filename,
            schedule,
            onComplete
        } = taskConfig;

        // 保存任务配置
        const tasks = this.getScheduledTasks();
        const task = {
            id: id || `export_${Date.now()}`,
            dataSource,
            format,
            filename,
            schedule,
            enabled: true,
            lastRun: null,
            nextRun: this.calculateNextRun(schedule),
            createdAt: new Date().toISOString()
        };

        tasks.push(task);
        this.saveScheduledTasks(tasks);

        // 设置定时器
        this.startScheduler(task, onComplete);

        return task;
    }

    // 计算下次执行时间
    calculateNextRun(schedule) {
        const now = new Date();
        
        switch (schedule.frequency) {
            case 'daily':
                const [hours, minutes] = (schedule.time || '09:00').split(':');
                const next = new Date(now);
                next.setHours(parseInt(hours), parseInt(minutes), 0);
                if (next <= now) next.setDate(next.getDate() + 1);
                return next.toISOString();
                
            case 'weekly':
                const weekDay = schedule.dayOfWeek || 1; // 默认周一
                const nextWeek = new Date(now);
                const diff = (weekDay - now.getDay() + 7) % 7 || 7;
                nextWeek.setDate(nextWeek.getDate() + diff);
                return nextWeek.toISOString();
                
            case 'monthly':
                const dayOfMonth = schedule.dayOfMonth || 1;
                const nextMonth = new Date(now);
                nextMonth.setDate(dayOfMonth);
                if (nextMonth <= now) nextMonth.setMonth(nextMonth.getMonth() + 1);
                return nextMonth.toISOString();
                
            default:
                return null;
        }
    }

    // 启动调度器
    startScheduler(task, callback) {
        const interval = setInterval(() => {
            if (!task.enabled) {
                clearInterval(interval);
                return;
            }

            const now = new Date();
            const nextRun = new Date(task.nextRun);

            if (now >= nextRun) {
                // 执行导出
                this.executeScheduledExport(task)
                    .then(result => {
                        if (callback) callback(result);
                    });

                // 更新下次执行时间
                task.lastRun = now.toISOString();
                task.nextRun = this.calculateNextRun(task.schedule);
            }
        }, 60000); // 每分钟检查一次
    }

    // 执行定时导出
    async executeScheduledExport(task) {
        try {
            // 获取数据
            let data;
            if (typeof task.dataSource === 'function') {
                data = await task.dataSource();
            } else {
                data = task.dataSource;
            }

            // 执行导出
            let result;
            switch (task.format) {
                case 'excel':
                    result = await this.exportToExcel(data, task.filename);
                    break;
                case 'csv':
                    result = await this.exportToCSV(data, task.filename);
                    break;
                case 'pdf':
                    result = await this.exportToPDF(data, task.filename);
                    break;
                default:
                    result = { success: false, message: '不支持的格式' };
            }

            return result;
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // 获取定时任务列表
    getScheduledTasks() {
        return JSON.parse(localStorage.getItem('scheduledExports') || '[]');
    }

    // 保存定时任务列表
    saveScheduledTasks(tasks) {
        localStorage.setItem('scheduledExports', JSON.stringify(tasks));
    }

    // 取消定时任务
    cancelScheduledTask(taskId) {
        const tasks = this.getScheduledTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        
        if (index !== -1) {
            tasks[index].enabled = false;
            this.saveScheduledTasks(tasks);
            return { success: true };
        }
        
        return { success: false, message: '任务不存在' };
    }

    // 辅助方法
    prepareTableData(data, includeHeaders) {
        if (Array.isArray(data)) {
            if (data.length === 0) return [];
            
            const headers = Object.keys(data[0]);
            const rows = data.map(item => headers.map(h => item[h]));
            
            if (includeHeaders) {
                return [headers, ...rows];
            }
            return rows;
        }
        
        return [];
    }

    generateExcelContent(workbook) {
        // 简化的Excel内容生成
        // 实际应该使用xlsx库生成真实的Excel文件
        let content = 'Sheet1\n';
        
        workbook.sheets.forEach(sheet => {
            content += `=== ${sheet.name} ===\n`;
            sheet.data.forEach(row => {
                content += row.join('\t') + '\n';
            });
            content += '\n';
        });
        
        return content;
    }

    generatePDFContent(data, options) {
        // 简化的PDF内容生成
        // 实际应该使用jsPDF库生成真实的PDF文件
        let content = `%PDF-1.4\n`;
        content += `% ${options.title}\n`;
        content += `% 生成时间: ${new Date().toLocaleString()}\n`;
        content += `% 数据内容已省略\n`;
        return content;
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// 数据格式化工具
const DataFormatters = {
    // 格式化货币
    currency(value, currency = 'CNY', locale = 'zh-CN') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency
        }).format(value);
    },

    // 格式化数字
    number(value, decimals = 0, locale = 'zh-CN') {
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    },

    // 格式化百分比
    percent(value, decimals = 1) {
        return `${(value * 100).toFixed(decimals)}%`;
    },

    // 格式化日期
    date(value, format = 'full') {
        const date = new Date(value);
        const formats = {
            full: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
            long: { year: 'numeric', month: 'long', day: 'numeric' },
            short: { year: 'numeric', month: '2-digit', day: '2-digit' },
            time: { hour: '2-digit', minute: '2-digit' }
        };
        return new Intl.DateTimeFormat('zh-CN', formats[format] || formats.full).format(date);
    },

    // 格式化文件大小
    fileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 格式化时长
    duration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟${secs}秒`;
        }
        return `${secs}秒`;
    },

    // 截断文本
    truncate(text, maxLength, suffix = '...') {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    }
};

// 导出实例
window.ExportUtility = new ExportUtility();
window.DataFormatters = DataFormatters;

// 便捷导出函数
const ExportHelper = {
    // 快速导出表格数据
    exportTable(tableId, filename, format = 'csv') {
        const table = document.getElementById(tableId);
        if (!table) {
            return { success: false, message: '表格不存在' };
        }

        const rows = [];
        const headers = [];
        
        // 获取表头
        table.querySelectorAll('thead th').forEach(th => {
            headers.push(th.textContent.trim());
        });
        
        // 获取数据行
        table.querySelectorAll('tbody tr').forEach(tr => {
            const row = [];
            tr.querySelectorAll('td').forEach(td => {
                row.push(td.textContent.trim());
            });
            rows.push(row);
        });

        const data = rows.map(row => {
            const obj = {};
            headers.forEach((h, i) => {
                obj[h] = row[i];
            });
            return obj;
        });

        const exporter = window.ExportUtility;
        
        switch (format) {
            case 'excel':
                return exporter.exportToExcel(data, filename);
            case 'csv':
                return exporter.exportToCSV(data, filename);
            case 'pdf':
                return exporter.exportToPDF(data, filename);
            default:
                return { success: false, message: '不支持的格式' };
        }
    },

    // 快速导出图表
    exportChart(chartId, filename, format = 'png') {
        const chartElement = document.getElementById(chartId);
        if (!chartElement) {
            return { success: false, message: '图表不存在' };
        }

        return window.ExportUtility.exportChartToImage(chartElement, filename, { format });
    },

    // 快速导出JSON
    exportJSON(data, filename) {
        return window.ExportUtility.exportToJSON(data, filename);
    }
};

window.ExportHelper = ExportHelper;
