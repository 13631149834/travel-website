/**
 * 文件处理工具模块
 * @description 提供文件读取、解析、下载等功能
 */

const FileUtils = {
    // 支持的文件类型
    FILE_TYPES: {
        CSV: 'csv',
        EXCEL: 'excel',
        JSON: 'json'
    },

    // Excel MIME类型
    EXCEL_MIME_TYPES: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
    ],

    /**
     * 验证文件类型
     * @param {File} file - 文件对象
     * @param {string[]} allowedTypes - 允许的类型数组
     * @returns {boolean}
     */
    validateFileType(file, allowedTypes = ['csv', 'xlsx', 'xls']) {
        const fileName = file.name.toLowerCase();
        const extension = fileName.split('.').pop();
        return allowedTypes.includes(extension);
    },

    /**
     * 读取CSV文件
     * @param {File} file - 文件对象
     * @returns {Promise<{headers: string[], data: any[]}>}
     */
    async readCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const lines = this.parseCSVLines(text);
                    
                    if (lines.length === 0) {
                        reject(new Error('CSV文件为空'));
                        return;
                    }

                    const headers = this.parseCSVLine(lines[0]);
                    const data = [];
                    
                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i].trim()) {
                            const row = this.parseCSVLine(lines[i]);
                            const rowObj = {};
                            headers.forEach((header, index) => {
                                rowObj[header] = row[index] || '';
                            });
                            data.push(rowObj);
                        }
                    }
                    
                    resolve({ headers, data });
                } catch (error) {
                    reject(new Error('CSV解析失败: ' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file, 'UTF-8');
        });
    },

    /**
     * 解析CSV行（处理引号）
     * @param {string} line - CSV行
     * @returns {string[]}
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    },

    /**
     * 解析CSV文本为行
     * @param {string} text - CSV文本
     * @returns {string[]}
     */
    parseCSVLines(text) {
        // 处理不同的换行符
        return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    },

    /**
     * 读取Excel文件（基础解析，支持.xlsx和.xls）
     * @param {File} file - 文件对象
     * @returns {Promise<{headers: string[], data: any[]}>}
     */
    async readExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    
                    if (jsonData.length === 0) {
                        reject(new Error('Excel文件为空'));
                        return;
                    }

                    const headers = jsonData[0].map(h => String(h || ''));
                    const rows = [];
                    
                    for (let i = 1; i < jsonData.length; i++) {
                        if (jsonData[i] && jsonData[i].some(cell => cell !== undefined && cell !== null && cell !== '')) {
                            const rowObj = {};
                            headers.forEach((header, index) => {
                                let value = jsonData[i][index];
                                // 处理日期
                                if (value && typeof value === 'object' && value.constructor.name === 'Date') {
                                    value = value.toISOString().split('T')[0];
                                }
                                rowObj[header] = value !== undefined ? String(value) : '';
                            });
                            rows.push(rowObj);
                        }
                    }
                    
                    resolve({ headers, data: rows });
                } catch (error) {
                    reject(new Error('Excel解析失败: ' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * 读取文件（自动检测类型）
     * @param {File} file - 文件对象
     * @returns {Promise<{headers: string[], data: any[]}>}
     */
    async readFile(file) {
        const extension = file.name.toLowerCase().split('.').pop();
        
        if (extension === 'csv') {
            return this.readCSV(file);
        } else if (extension === 'xlsx' || extension === 'xls') {
            return this.readExcel(file);
        } else {
            throw new Error('不支持的文件格式');
        }
    },

    /**
     * 下载CSV文件
     * @param {any[]} data - 数据数组
     * @param {string[]} headers - 表头
     * @param {string} filename - 文件名
     */
    downloadCSV(data, headers, filename) {
        const csvContent = this.arrayToCSV(data, headers);
        this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8');
    },

    /**
     * 数组转CSV
     * @param {any[]} data - 数据数组
     * @param {string[]} headers - 表头
     * @returns {string}
     */
    arrayToCSV(data, headers) {
        const escapeCSV = (value) => {
            if (value === null || value === undefined) return '';
            const str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        };

        const headerRow = headers.map(escapeCSV).join(',');
        const dataRows = data.map(row => 
            headers.map(header => escapeCSV(row[header])).join(',')
        );
        
        return '\uFEFF' + [headerRow, ...dataRows].join('\n');
    },

    /**
     * 下载Excel文件
     * @param {any[]} data - 数据数组
     * @param {string[]} headers - 表头
     * @param {string} filename - 文件名
     */
    downloadExcel(data, headers, filename) {
        const exportData = data.map(row => {
            const newRow = {};
            headers.forEach(header => {
                newRow[header] = row[header] || '';
            });
            return newRow;
        });

        const ws = XLSX.utils.json_to_sheet(exportData, { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        this.downloadBlob(blob, filename);
    },

    /**
     * 下载文件
     * @param {string} content - 文件内容
     * @param {string} filename - 文件名
     * @param {string} mimeType - MIME类型
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        this.downloadBlob(blob, filename);
    },

    /**
     * 下载Blob
     * @param {Blob} blob - Blob对象
     * @param {string} filename - 文件名
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * 下载JSON文件
     * @param {any} data - 数据
     * @param {string} filename - 文件名
     */
    downloadJSON(data, filename) {
        const jsonStr = JSON.stringify(data, null, 2);
        this.downloadFile(jsonStr, filename, 'application/json');
    },

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string}
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * 验证文件大小
     * @param {File} file - 文件对象
     * @param {number} maxSizeMB - 最大大小（MB）
     * @returns {boolean}
     */
    validateFileSize(file, maxSizeMB = 10) {
        return file.size <= maxSizeMB * 1024 * 1024;
    },

    /**
     * 生成唯一ID
     * @returns {string}
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    /**
     * 格式化日期
     * @param {Date|string} date - 日期
     * @param {string} format - 格式
     * @returns {string}
     */
    formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    /**
     * 读取本地存储数据
     * @param {string} key - 键名
     * @returns {any}
     */
    getLocalData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('读取本地数据失败:', e);
            return null;
        }
    },

    /**
     * 保存数据到本地存储
     * @param {string} key - 键名
     * @param {any} data - 数据
     */
    setLocalData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('保存本地数据失败:', e);
            return false;
        }
    }
};

// 如果在浏览器环境，加载XLSX库
if (typeof window !== 'undefined') {
    if (!window.XLSX) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        document.head.appendChild(script);
    }
}
