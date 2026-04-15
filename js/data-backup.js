/**
 * ============================================
 * 数据备份工具 - 游导旅游网站
 * ============================================
 * 功能：
 * - 导出用户数据为JSON文件
 * - 从JSON文件导入恢复数据
 * - 清除本地用户数据
 * - 数据完整性校验
 */

const DataBackup = {
    // 备份数据键名配置
    STORAGE_KEYS: {
        USER_INFO: 'userInfo',
        USER_PROFILE: 'userProfile',
        FAVORITES: 'userFavorites',
        ORDERS: 'userOrders',
        NOTES: 'userNotes',
        SETTINGS: 'userSettings',
        TRIPS: 'userTrips',
        REVIEWS: 'userReviews',
        POINTS: 'userPoints',
        BUCKET_LIST: 'bucketList'
    },

    // 备份版本号
    BACKUP_VERSION: '1.0.0',

    /**
     * 获取本地存储数据
     * @param {string} key 存储键名
     * @returns {any} 存储的数据
     */
    getLocalData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(`读取 ${key} 失败:`, e);
            return null;
        }
    },

    /**
     * 设置本地存储数据
     * @param {string} key 存储键名
     * @param {any} value 数据值
     */
    setLocalData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`写入 ${key} 失败:`, e);
            return false;
        }
    },

    /**
     * 收集所有用户数据
     * @returns {Object} 收集到的所有数据
     */
    collectUserData() {
        const data = {
            metadata: {
                version: this.BACKUP_VERSION,
                exportTime: new Date().toISOString(),
                website: '游导旅游',
                websiteUrl: 'youdao-travel.com'
            },
            userInfo: this.getLocalData(this.STORAGE_KEYS.USER_INFO),
            userProfile: this.getLocalData(this.STORAGE_KEYS.USER_PROFILE),
            favorites: this.getLocalData(this.STORAGE_KEYS.FAVORITES),
            orders: this.getLocalData(this.STORAGE_KEYS.ORDERS),
            notes: this.getLocalData(this.STORAGE_KEYS.NOTES),
            settings: this.getLocalData(this.STORAGE_KEYS.SETTINGS),
            trips: this.getLocalData(this.STORAGE_KEYS.TRIPS),
            reviews: this.getLocalData(this.STORAGE_KEYS.REVIEWS),
            points: this.getLocalData(this.STORAGE_KEYS.POINTS),
            bucketList: this.getLocalData(this.STORAGE_KEYS.BUCKET_LIST)
        };

        // 计算数据统计
        data.statistics = this.calculateStatistics(data);

        return data;
    },

    /**
     * 计算数据统计
     * @param {Object} data 备份数据
     * @returns {Object} 统计数据
     */
    calculateStatistics(data) {
        return {
            hasUserInfo: !!data.userInfo,
            hasUserProfile: !!data.userProfile,
            favoritesCount: Array.isArray(data.favorites) ? data.favorites.length : 0,
            ordersCount: Array.isArray(data.orders) ? data.orders.length : 0,
            notesCount: Array.isArray(data.notes) ? data.notes.length : 0,
            tripsCount: Array.isArray(data.trips) ? data.trips.length : 0,
            reviewsCount: Array.isArray(data.reviews) ? data.reviews.length : 0,
            bucketListCount: Array.isArray(data.bucketList) ? data.bucketList.length : 0
        };
    },

    /**
     * 导出数据为JSON文件
     * @returns {boolean} 是否导出成功
     */
    exportToJSON() {
        try {
            const data = this.collectUserData();
            
            // 检查是否有数据可导出
            if (!this.hasAnyData(data)) {
                alert('没有可导出的用户数据');
                return false;
            }

            // 转换为JSON字符串（格式化输出）
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });

            // 生成文件名（包含日期）
            const date = new Date();
            const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
            const filename = `youdao-backup-${dateStr}.json`;

            // 创建下载链接
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            console.log('✅ 数据导出成功:', filename);
            return true;
        } catch (e) {
            console.error('❌ 数据导出失败:', e);
            alert('数据导出失败: ' + e.message);
            return false;
        }
    },

    /**
     * 检查是否有任何数据
     * @param {Object} data 备份数据
     * @returns {boolean} 是否有数据
     */
    hasAnyData(data) {
        return data.userInfo || data.userProfile || 
               data.statistics.favoritesCount > 0 ||
               data.statistics.ordersCount > 0 ||
               data.statistics.notesCount > 0 ||
               data.statistics.tripsCount > 0 ||
               data.statistics.reviewsCount > 0 ||
               data.statistics.bucketListCount > 0;
    },

    /**
     * 从JSON文件导入数据
     * @param {File} file JSON文件
     * @returns {Promise<Object>} 导入结果
     */
    async importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // 验证数据格式
                    if (!this.validateBackupData(data)) {
                        reject(new Error('备份文件格式不正确'));
                        return;
                    }

                    // 确认导入
                    const confirmed = confirm(
                        `即将导入备份数据（${data.metadata.exportTime}）\n\n` +
                        `收藏: ${data.statistics.favoritesCount} 项\n` +
                        `订单: ${data.statistics.ordersCount} 项\n` +
                        `笔记: ${data.statistics.notesCount} 项\n` +
                        `行程: ${data.statistics.tripsCount} 项\n\n` +
                        `⚠️ 注意：这将覆盖您现有的本地数据。`
                    );

                    if (!confirmed) {
                        resolve({ success: false, message: '用户取消' });
                        return;
                    }

                    // 执行导入
                    this.restoreData(data);

                    resolve({
                        success: true,
                        message: '数据导入成功',
                        statistics: data.statistics
                    });
                } catch (e) {
                    reject(new Error('文件解析失败: ' + e.message));
                }
            };

            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };

            reader.readAsText(file);
        });
    },

    /**
     * 验证备份数据格式
     * @param {Object} data 备份数据
     * @returns {boolean} 是否有效
     */
    validateBackupData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.metadata || !data.metadata.version) return false;
        return true;
    },

    /**
     * 恢复数据到本地存储
     * @param {Object} data 备份数据
     */
    restoreData(data) {
        // 恢复各项数据
        if (data.userInfo) {
            this.setLocalData(this.STORAGE_KEYS.USER_INFO, data.userInfo);
        }
        if (data.userProfile) {
            this.setLocalData(this.STORAGE_KEYS.USER_PROFILE, data.userProfile);
        }
        if (data.favorites) {
            this.setLocalData(this.STORAGE_KEYS.FAVORITES, data.favorites);
        }
        if (data.orders) {
            this.setLocalData(this.STORAGE_KEYS.ORDERS, data.orders);
        }
        if (data.notes) {
            this.setLocalData(this.STORAGE_KEYS.NOTES, data.notes);
        }
        if (data.settings) {
            this.setLocalData(this.STORAGE_KEYS.SETTINGS, data.settings);
        }
        if (data.trips) {
            this.setLocalData(this.STORAGE_KEYS.TRIPS, data.trips);
        }
        if (data.reviews) {
            this.setLocalData(this.STORAGE_KEYS.REVIEWS, data.reviews);
        }
        if (data.points) {
            this.setLocalData(this.STORAGE_KEYS.POINTS, data.points);
        }
        if (data.bucketList) {
            this.setLocalData(this.STORAGE_KEYS.BUCKET_LIST, data.bucketList);
        }

        console.log('✅ 数据恢复成功');
    },

    /**
     * 清除所有用户数据
     * @returns {boolean} 是否清除成功
     */
    clearAllData() {
        const confirmed = confirm(
            '⚠️ 确定要清除所有本地用户数据吗？\n\n' +
            '这将删除：\n' +
            '- 用户信息\n' +
            '- 收藏记录\n' +
            '- 订单数据\n' +
            '- 笔记内容\n' +
            '- 行程计划\n' +
            '- 设置偏好\n\n' +
            '此操作不可恢复！'
        );

        if (!confirmed) return false;

        // 二次确认
        const doubleConfirm = confirm('最后确认：所有数据将被永久删除！');

        if (!doubleConfirm) return false;

        try {
            // 清除所有本地存储
            Object.values(this.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });

            // 清除会话存储
            sessionStorage.clear();

            console.log('✅ 所有用户数据已清除');

            // 刷新页面
            setTimeout(() => {
                window.location.reload();
            }, 500);

            return true;
        } catch (e) {
            console.error('❌ 清除数据失败:', e);
            alert('清除数据失败: ' + e.message);
            return false;
        }
    },

    /**
     * 清除特定类型的数据
     * @param {string} dataType 数据类型
     * @returns {boolean} 是否清除成功
     */
    clearSpecificData(dataType) {
        const dataTypeNames = {
            favorites: '收藏',
            orders: '订单',
            notes: '笔记',
            trips: '行程',
            reviews: '评价',
            settings: '设置',
            bucketList: '愿望清单'
        };

        const confirmed = confirm(
            `确定要清除所有${dataTypeNames[dataType] || dataType}数据吗？`
        );

        if (!confirmed) return false;

        try {
            const keyMap = {
                favorites: this.STORAGE_KEYS.FAVORITES,
                orders: this.STORAGE_KEYS.ORDERS,
                notes: this.STORAGE_KEYS.NOTES,
                trips: this.STORAGE_KEYS.TRIPS,
                reviews: this.STORAGE_KEYS.REVIEWS,
                settings: this.STORAGE_KEYS.SETTINGS,
                bucketList: this.STORAGE_KEYS.BUCKET_LIST
            };

            const key = keyMap[dataType];
            if (key) {
                localStorage.removeItem(key);
                console.log(`✅ ${dataTypeNames[dataType]}数据已清除`);
            }

            return true;
        } catch (e) {
            console.error(`❌ 清除${dataType}数据失败:`, e);
            return false;
        }
    },

    /**
     * 获取备份预览信息
     * @returns {Object} 预览信息
     */
    getBackupPreview() {
        const data = this.collectUserData();
        return {
            hasData: this.hasAnyData(data),
            statistics: data.statistics,
            estimatedSize: JSON.stringify(data).length
        };
    },

    /**
     * 格式化文件大小
     * @param {number} bytes 字节数
     * @returns {string} 格式化后的大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// ============================================
// 页面交互逻辑
// ============================================

// 显示加载状态
function showLoading(message = '处理中...') {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
    `;
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    document.body.appendChild(overlay);
}

// 隐藏加载状态
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// 显示消息提示
function showMessage(message, type = 'success') {
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
    };

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        <span class="toast-text">${message}</span>
    `;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type]};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 10000;
        animation: slideDown 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .toast-message .toast-icon { font-size: 1.2em; }
        .toast-message .toast-text { font-size: 14px; }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);

    // 3秒后自动移除
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 添加slideUp动画
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes slideUp {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(toastStyle);

// 导出数据
function handleExport() {
    showLoading('正在导出数据...');
    
    setTimeout(() => {
        hideLoading();
        const success = DataBackup.exportToJSON();
        if (success) {
            showMessage('数据导出成功！请查看下载文件。', 'success');
        }
    }, 500);
}

// 导入数据
async function handleImport(file) {
    if (!file) {
        showMessage('请选择要导入的备份文件', 'warning');
        return;
    }

    if (!file.name.endsWith('.json')) {
        showMessage('请选择JSON格式的备份文件', 'error');
        return;
    }

    showLoading('正在导入数据...');

    try {
        const result = await DataBackup.importFromJSON(file);
        hideLoading();
        
        if (result.success) {
            showMessage('数据导入成功！', 'success');
            // 刷新页面显示新数据
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showMessage(result.message, 'info');
        }
    } catch (e) {
        hideLoading();
        showMessage(e.message, 'error');
    }
}

// 清除数据
function handleClearAll() {
    const success = DataBackup.clearAllData();
    if (success) {
        showMessage('所有数据已清除', 'success');
    }
}

// 清除特定数据
function handleClearSpecific(type) {
    const success = DataBackup.clearSpecificData(type);
    if (success) {
        showMessage('数据已清除', 'success');
        // 刷新预览
        updatePreview();
    }
}

// 更新数据预览
function updatePreview() {
    const preview = DataBackup.getBackupPreview();
    const stats = preview.statistics;

    // 更新统计显示
    const statsElements = {
        'stat-favorites': stats.favoritesCount,
        'stat-orders': stats.ordersCount,
        'stat-notes': stats.notesCount,
        'stat-trips': stats.tripsCount,
        'stat-reviews': stats.reviewsCount,
        'stat-bucketlist': stats.bucketListCount
    };

    Object.entries(statsElements).forEach(([id, count]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = count;
    });

    // 更新预计文件大小
    const sizeEl = document.getElementById('estimated-size');
    if (sizeEl) {
        sizeEl.textContent = DataBackup.formatFileSize(preview.estimatedSize);
    }

    // 更新状态提示
    const statusEl = document.getElementById('data-status');
    if (statusEl) {
        statusEl.innerHTML = preview.hasData 
            ? '<span style="color: #10B981;">✅ 检测到本地用户数据</span>'
            : '<span style="color: #F59E0B;">⚠️ 未检测到本地用户数据</span>';
    }
}

// 文件选择处理
function setupFileInput() {
    const fileInput = document.getElementById('backup-file');
    const fileNameDisplay = document.getElementById('selected-file-name');

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileNameDisplay.textContent = `已选择: ${file.name}`;
                fileNameDisplay.style.display = 'block';
            }
        });
    }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    updatePreview();
    setupFileInput();
});
