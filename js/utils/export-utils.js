/**
 * 数据导出工具模块
 * @description 提供各类数据导出功能
 */

const ExportUtils = {
    // 存储键名
    STORAGE_KEYS: {
        GUIDES: 'travel_guides',
        ROUTES: 'travel_routes',
        USERS: 'travel_users',
        BOOKINGS: 'travel_bookings'
    },

    // 导出格式
    FORMAT: {
        CSV: 'csv',
        EXCEL: 'xlsx',
        JSON: 'json'
    },

    /**
     * 导出导游数据
     * @param {Object} options - 导出选项
     * @returns {Promise<void>}
     */
    async exportGuides(options = {}) {
        const { format = 'csv', filters = {} } = options;
        let guides = FileUtils.getLocalData(this.STORAGE_KEYS.GUIDES) || [];
        
        // 应用筛选
        if (filters.status) {
            guides = guides.filter(g => g.status === filters.status);
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            guides = guides.filter(g => 
                g.name?.toLowerCase().includes(search) ||
                g.email?.toLowerCase().includes(search)
            );
        }

        const headers = ['name', 'email', 'phone', 'languages', 'specialties', 'rating', 'status', 'createdAt'];
        const filename = `guides_export_${FileUtils.formatDate(new Date(), 'YYYYMMDD_HHmmss')}.${format}`;

        if (format === this.FORMAT.JSON) {
            FileUtils.downloadJSON(guides, filename);
        } else if (format === this.FORMAT.EXCEL) {
            FileUtils.downloadExcel(guides, headers, filename);
        } else {
            FileUtils.downloadCSV(guides, headers, filename);
        }

        return { success: true, count: guides.length, filename };
    },

    /**
     * 导出路线数据
     * @param {Object} options - 导出选项
     * @returns {Promise<void>}
     */
    async exportRoutes(options = {}) {
        const { format = 'csv', filters = {} } = options;
        let routes = FileUtils.getLocalData(this.STORAGE_KEYS.ROUTES) || [];
        
        // 应用筛选
        if (filters.destination) {
            routes = routes.filter(r => r.destination === filters.destination);
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            routes = routes.filter(r => 
                r.name?.toLowerCase().includes(search) ||
                r.description?.toLowerCase().includes(search)
            );
        }

        const headers = ['name', 'destination', 'duration', 'price', 'maxGroupSize', 'difficulty', 'rating', 'status'];
        const filename = `routes_export_${FileUtils.formatDate(new Date(), 'YYYYMMDD_HHmmss')}.${format}`;

        if (format === this.FORMAT.JSON) {
            FileUtils.downloadJSON(routes, filename);
        } else if (format === this.FORMAT.EXCEL) {
            FileUtils.downloadExcel(routes, headers, filename);
        } else {
            FileUtils.downloadCSV(routes, headers, filename);
        }

        return { success: true, count: routes.length, filename };
    },

    /**
     * 导出用户数据
     * @param {Object} options - 导出选项
     * @returns {Promise<void>}
     */
    async exportUsers(options = {}) {
        const { format = 'csv', filters = {} } = options;
        let users = FileUtils.getLocalData(this.STORAGE_KEYS.USERS) || [];
        
        // 应用筛选
        if (filters.role) {
            users = users.filter(u => u.role === filters.role);
        }
        if (filters.status) {
            users = users.filter(u => u.status === filters.status);
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            users = users.filter(u => 
                u.name?.toLowerCase().includes(search) ||
                u.email?.toLowerCase().includes(search)
            );
        }

        // 移除敏感信息
        const safeUsers = users.map(u => ({
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            status: u.status,
            points: u.points || 0,
            createdAt: u.createdAt
        }));

        const headers = ['name', 'email', 'phone', 'role', 'status', 'points', 'createdAt'];
        const filename = `users_export_${FileUtils.formatDate(new Date(), 'YYYYMMDD_HHmmss')}.${format}`;

        if (format === this.FORMAT.JSON) {
            FileUtils.downloadJSON(safeUsers, filename);
        } else if (format === this.FORMAT.EXCEL) {
            FileUtils.downloadExcel(safeUsers, headers, filename);
        } else {
            FileUtils.downloadCSV(safeUsers, headers, filename);
        }

        return { success: true, count: safeUsers.length, filename };
    },

    /**
     * 导出预约记录
     * @param {Object} options - 导出选项
     * @returns {Promise<void>}
     */
    async exportBookings(options = {}) {
        const { format = 'csv', filters = {} } = options;
        let bookings = FileUtils.getLocalData(this.STORAGE_KEYS.BOOKINGS) || [];
        
        // 应用筛选
        if (filters.status) {
            bookings = bookings.filter(b => b.status === filters.status);
        }
        if (filters.guideId) {
            bookings = bookings.filter(b => b.guideId === filters.guideId);
        }
        if (filters.dateFrom) {
            bookings = bookings.filter(b => new Date(b.date) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            bookings = bookings.filter(b => new Date(b.date) <= new Date(filters.dateTo));
        }

        const headers = ['id', 'userName', 'userEmail', 'guideName', 'routeName', 'date', 'time', 'groupSize', 'totalPrice', 'status', 'paymentStatus', 'createdAt'];
        const filename = `bookings_export_${FileUtils.formatDate(new Date(), 'YYYYMMDD_HHmmss')}.${format}`;

        if (format === this.FORMAT.JSON) {
            FileUtils.downloadJSON(bookings, filename);
        } else if (format === this.FORMAT.EXCEL) {
            FileUtils.downloadExcel(bookings, headers, filename);
        } else {
            FileUtils.downloadCSV(bookings, headers, filename);
        }

        return { success: true, count: bookings.length, filename };
    },

    /**
     * 批量导出所有数据
     * @param {Object} options - 导出选项
     * @returns {Promise<Object>}
     */
    async exportAll(options = {}) {
        const { format = 'json' } = options;
        const timestamp = FileUtils.formatDate(new Date(), 'YYYYMMDD_HHmmss');
        
        const allData = {
            exportTime: new Date().toISOString(),
            guides: FileUtils.getLocalData(this.STORAGE_KEYS.GUIDES) || [],
            routes: FileUtils.getLocalData(this.STORAGE_KEYS.ROUTES) || [],
            users: FileUtils.getLocalData(this.STORAGE_KEYS.USERS) || [],
            bookings: FileUtils.getLocalData(this.STORAGE_KEYS.BOOKINGS) || []
        };

        const filename = `full_backup_${timestamp}.${format}`;
        
        if (format === 'json') {
            FileUtils.downloadJSON(allData, filename);
        } else if (format === 'csv') {
            // 导出为多个CSV文件
            await this.exportGuides({ format: 'csv' });
            await this.exportRoutes({ format: 'csv' });
            await this.exportUsers({ format: 'csv' });
            await this.exportBookings({ format: 'csv' });
            return { success: true, message: '数据已导出为多个CSV文件' };
        }

        return { 
            success: true, 
            count: {
                guides: allData.guides.length,
                routes: allData.routes.length,
                users: allData.users.length,
                bookings: allData.bookings.length
            },
            filename 
        };
    },

    /**
     * 获取导出统计
     * @returns {Object}
     */
    getExportStats() {
        return {
            guides: (FileUtils.getLocalData(this.STORAGE_KEYS.GUIDES) || []).length,
            routes: (FileUtils.getLocalData(this.STORAGE_KEYS.ROUTES) || []).length,
            users: (FileUtils.getLocalData(this.STORAGE_KEYS.USERS) || []).length,
            bookings: (FileUtils.getLocalData(this.STORAGE_KEYS.BOOKINGS) || []).length,
            total: [
                ...(FileUtils.getLocalData(this.STORAGE_KEYS.GUIDES) || []),
                ...(FileUtils.getLocalData(this.STORAGE_KEYS.ROUTES) || []),
                ...(FileUtils.getLocalData(this.STORAGE_KEYS.USERS) || []),
                ...(FileUtils.getLocalData(this.STORAGE_KEYS.BOOKINGS) || [])
            ].length
        };
    }
};
