/**
 * 数据导入工具模块
 * @description 提供数据导入、验证、映射等功能
 */

const ImportUtils = {
    // 存储键名
    STORAGE_KEYS: {
        GUIDES: 'travel_guides',
        ROUTES: 'travel_routes',
        DESTINATIONS: 'travel_destinations'
    },

    // 导入类型
    IMPORT_TYPE: {
        GUIDE: 'guide',
        ROUTE: 'route',
        DESTINATION: 'destination'
    },

    // 字段映射配置
    FIELD_MAPS: {
        guide: {
            // 源字段 -> 目标字段
            '姓名': 'name',
            '名字': 'name',
            '姓名/Name': 'name',
            '邮箱': 'email',
            '电子邮件': 'email',
            'Email': 'email',
            '邮箱/Email': 'email',
            '电话': 'phone',
            '手机': 'phone',
            '手机号': 'phone',
            'Phone': 'phone',
            '电话/Phone': 'phone',
            '语言': 'languages',
            '擅长语言': 'languages',
            'Languages': 'languages',
            '专长': 'specialties',
            '擅长领域': 'specialties',
            'Specialties': 'specialties',
            '专长/Specialties': 'specialties',
            '评分': 'rating',
            'Rating': 'rating',
            '状态': 'status',
            'Status': 'status',
            '城市': 'city',
            '所在城市': 'city',
            'City': 'city',
            '简介': 'bio',
            '个人简介': 'bio',
            'Bio': 'bio',
            '价格': 'hourlyRate',
            '时薪': 'hourlyRate',
            'Hourly Rate': 'hourlyRate',
            '时薪/Hourly Rate': 'hourlyRate',
            '头像': 'avatar',
            '头像URL': 'avatar'
        },
        route: {
            '路线名称': 'name',
            '名称': 'name',
            'Name': 'name',
            '目的地': 'destination',
            '旅游地': 'destination',
            'Destination': 'destination',
            '时长': 'duration',
            '天数': 'duration',
            'Duration': 'duration',
            '价格': 'price',
            'Price': 'price',
            '价格/Price': 'price',
            '最大人数': 'maxGroupSize',
            '人数上限': 'maxGroupSize',
            'Max Group Size': 'maxGroupSize',
            '难度': 'difficulty',
            'Difficulty': 'difficulty',
            '描述': 'description',
            '简介': 'description',
            'Description': 'description',
            '状态': 'status',
            'Status': 'status',
            '包含内容': 'includes',
            'Includes': 'includes'
        },
        destination: {
            '目的地名称': 'name',
            '名称': 'name',
            'Name': 'name',
            '国家': 'country',
            'Country': 'country',
            '城市': 'city',
            'City': 'city',
            '描述': 'description',
            'Description': 'description',
            '热门程度': 'popularity',
            'Popularity': 'popularity',
            '最佳季节': 'bestSeason',
            '最佳旅行季节': 'bestSeason',
            'Best Season': 'bestSeason'
        }
    },

    /**
     * 自动映射字段
     * @param {string[]} headers - 表头
     * @param {string} type - 导入类型
     * @returns {Object} - 映射后的字段
     */
    autoMapFields(headers, type) {
        const fieldMap = this.FIELD_MAPS[type] || {};
        const mapping = {};
        
        headers.forEach(header => {
            const trimmedHeader = header.trim();
            
            // 精确匹配
            if (fieldMap[trimmedHeader]) {
                mapping[trimmedHeader] = fieldMap[trimmedHeader];
                return;
            }
            
            // 不区分大小写匹配
            const lowerHeader = trimmedHeader.toLowerCase();
            for (const [key, value] of Object.entries(fieldMap)) {
                if (key.toLowerCase() === lowerHeader) {
                    mapping[trimmedHeader] = value;
                    return;
                }
            }
            
            // 部分匹配
            for (const [key, value] of Object.entries(fieldMap)) {
                if (lowerHeader.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerHeader)) {
                    mapping[trimmedHeader] = value;
                    return;
                }
            }
        });
        
        return mapping;
    },

    /**
     * 验证导入数据
     * @param {any[]} data - 数据数组
     * @param {string} type - 导入类型
     * @returns {Object} - 验证结果
     */
    validateData(data, type) {
        const errors = [];
        const warnings = [];
        const validData = [];

        const rules = this.getValidationRules(type);

        data.forEach((row, index) => {
            const rowErrors = [];
            const rowWarnings = [];

            // 必填字段验证
            rules.required.forEach(field => {
                if (!row[field] || String(row[field]).trim() === '') {
                    rowErrors.push(`缺少必填字段: ${field}`);
                }
            });

            // 格式验证
            if (row.email && !this.validateEmail(row.email)) {
                rowWarnings.push(`邮箱格式不正确: ${row.email}`);
            }
            if (row.phone && !this.validatePhone(row.phone)) {
                rowWarnings.push(`电话格式不正确: ${row.phone}`);
            }
            if (row.rating && (isNaN(row.rating) || row.rating < 0 || row.rating > 5)) {
                rowWarnings.push(`评分应在0-5之间: ${row.rating}`);
            }
            if (row.price && isNaN(row.price)) {
                rowWarnings.push(`价格应为数字: ${row.price}`);
            }

            // 检查重复
            if (this.checkDuplicate(row, type)) {
                rowWarnings.push('数据可能已存在');
            }

            if (rowErrors.length > 0) {
                errors.push({ row: index + 1, errors: rowErrors });
            } else {
                if (rowWarnings.length > 0) {
                    warnings.push({ row: index + 1, warnings: rowWarnings });
                }
                validData.push(row);
            }
        });

        return {
            isValid: errors.length === 0,
            totalRows: data.length,
            validRows: validData.length,
            errorRows: errors.length,
            warningRows: warnings.length,
            errors,
            warnings,
            validData
        };
    },

    /**
     * 获取验证规则
     * @param {string} type - 导入类型
     * @returns {Object}
     */
    getValidationRules(type) {
        const rules = {
            guide: {
                required: ['name', 'email'],
                optional: ['phone', 'languages', 'specialties', 'rating', 'city', 'bio', 'hourlyRate']
            },
            route: {
                required: ['name', 'destination'],
                optional: ['duration', 'price', 'maxGroupSize', 'difficulty', 'description', 'includes']
            },
            destination: {
                required: ['name'],
                optional: ['country', 'city', 'description', 'popularity', 'bestSeason']
            }
        };
        return rules[type] || { required: [], optional: [] };
    },

    /**
     * 验证邮箱格式
     * @param {string} email - 邮箱
     * @returns {boolean}
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * 验证电话格式
     * @param {string} phone - 电话
     * @returns {boolean}
     */
    validatePhone(phone) {
        const re = /^1[3-9]\d{9}$/;
        return re.test(phone);
    },

    /**
     * 检查数据是否重复
     * @param {Object} row - 数据行
     * @param {string} type - 类型
     * @returns {boolean}
     */
    checkDuplicate(row, type) {
        const storageKey = this.STORAGE_KEYS[type.toUpperCase()];
        const existingData = FileUtils.getLocalData(storageKey) || [];
        
        return existingData.some(item => 
            (item.email && item.email === row.email) ||
            (item.name && item.name === row.name && item.phone === row.phone)
        );
    },

    /**
     * 导入导游数据
     * @param {any[]} data - 数据数组
     * @param {Object} options - 选项
     * @returns {Object}
     */
    importGuides(data, options = {}) {
        const { skipDuplicates = true } = options;
        const storageKey = this.STORAGE_KEYS.GUIDES;
        const existingData = FileUtils.getLocalData(storageKey) || [];
        
        let imported = 0;
        let skipped = 0;
        const importedItems = [];

        data.forEach(row => {
            // 处理特殊字段
            const item = this.processGuideData(row);
            
            // 检查重复
            const isDuplicate = existingData.some(item => item.email === row.email);
            
            if (isDuplicate && skipDuplicates) {
                skipped++;
                return;
            }

            // 添加ID和创建时间
            item.id = item.id || FileUtils.generateId();
            item.createdAt = item.createdAt || new Date().toISOString();
            item.updatedAt = new Date().toISOString();
            
            existingData.push(item);
            importedItems.push(item);
            imported++;
        });

        FileUtils.setLocalData(storageKey, existingData);
        
        return {
            success: true,
            imported,
            skipped,
            total: data.length,
            items: importedItems
        };
    },

    /**
     * 导入路线数据
     * @param {any[]} data - 数据数组
     * @param {Object} options - 选项
     * @returns {Object}
     */
    importRoutes(data, options = {}) {
        const { skipDuplicates = true } = options;
        const storageKey = this.STORAGE_KEYS.ROUTES;
        const existingData = FileUtils.getLocalData(storageKey) || [];
        
        let imported = 0;
        let skipped = 0;
        const importedItems = [];

        data.forEach(row => {
            const item = this.processRouteData(row);
            
            const isDuplicate = existingData.some(item => 
                item.name === row.name && item.destination === row.destination
            );
            
            if (isDuplicate && skipDuplicates) {
                skipped++;
                return;
            }

            item.id = item.id || FileUtils.generateId();
            item.createdAt = item.createdAt || new Date().toISOString();
            item.updatedAt = new Date().toISOString();
            
            existingData.push(item);
            importedItems.push(item);
            imported++;
        });

        FileUtils.setLocalData(storageKey, existingData);
        
        return {
            success: true,
            imported,
            skipped,
            total: data.length,
            items: importedItems
        };
    },

    /**
     * 导入目的地数据
     * @param {any[]} data - 数据数组
     * @param {Object} options - 选项
     * @returns {Object}
     */
    importDestinations(data, options = {}) {
        const { skipDuplicates = true } = options;
        const storageKey = this.STORAGE_KEYS.DESTINATIONS;
        const existingData = FileUtils.getLocalData(storageKey) || [];
        
        let imported = 0;
        let skipped = 0;
        const importedItems = [];

        data.forEach(row => {
            const item = this.processDestinationData(row);
            
            const isDuplicate = existingData.some(item => item.name === row.name);
            
            if (isDuplicate && skipDuplicates) {
                skipped++;
                return;
            }

            item.id = item.id || FileUtils.generateId();
            item.createdAt = item.createdAt || new Date().toISOString();
            item.updatedAt = new Date().toISOString();
            
            existingData.push(item);
            importedItems.push(item);
            imported++;
        });

        FileUtils.setLocalData(storageKey, existingData);
        
        return {
            success: true,
            imported,
            skipped,
            total: data.length,
            items: importedItems
        };
    },

    /**
     * 处理导游数据
     * @param {Object} row - 数据行
     * @returns {Object}
     */
    processGuideData(row) {
        return {
            name: row.name || '',
            email: row.email || '',
            phone: row.phone || '',
            languages: this.parseListField(row.languages),
            specialties: this.parseListField(row.specialties),
            rating: parseFloat(row.rating) || 0,
            status: row.status || 'pending',
            city: row.city || '',
            bio: row.bio || '',
            hourlyRate: parseFloat(row.hourlyRate) || 0,
            avatar: row.avatar || '',
            verified: false,
            reviewCount: 0
        };
    },

    /**
     * 处理路线数据
     * @param {Object} row - 数据行
     * @returns {Object}
     */
    processRouteData(row) {
        return {
            name: row.name || '',
            destination: row.destination || '',
            duration: row.duration || '',
            price: parseFloat(row.price) || 0,
            maxGroupSize: parseInt(row.maxGroupSize) || 10,
            difficulty: row.difficulty || 'moderate',
            description: row.description || '',
            includes: this.parseListField(row.includes),
            status: row.status || 'active',
            rating: parseFloat(row.rating) || 0,
            reviewCount: 0
        };
    },

    /**
     * 处理目的地数据
     * @param {Object} row - 数据行
     * @returns {Object}
     */
    processDestinationData(row) {
        return {
            name: row.name || '',
            country: row.country || '',
            city: row.city || '',
            description: row.description || '',
            popularity: parseInt(row.popularity) || 0,
            bestSeason: row.bestSeason || '',
            image: row.image || '',
            featured: false
        };
    },

    /**
     * 解析列表字段（逗号分隔）
     * @param {string} value - 字段值
     * @returns {string[]}
     */
    parseListField(value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        return String(value).split(/[,，;；]/).map(v => v.trim()).filter(v => v);
    },

    /**
     * 批量导入
     * @param {any[]} data - 数据数组
     * @param {string} type - 类型
     * @param {Object} options - 选项
     * @returns {Object}
     */
    batchImport(data, type, options = {}) {
        switch (type) {
            case this.IMPORT_TYPE.GUIDE:
                return this.importGuides(data, options);
            case this.IMPORT_TYPE.ROUTE:
                return this.importRoutes(data, options);
            case this.IMPORT_TYPE.DESTINATION:
                return this.importDestinations(data, options);
            default:
                return { success: false, error: '未知的导入类型' };
        }
    },

    /**
     * 获取导入历史
     * @returns {any[]}
     */
    getImportHistory() {
        return FileUtils.getLocalData('import_history') || [];
    },

    /**
     * 记录导入历史
     * @param {Object} result - 导入结果
     * @param {string} type - 类型
     */
    recordImportHistory(result, type) {
        const history = this.getImportHistory();
        history.unshift({
            id: FileUtils.generateId(),
            type,
            ...result,
            timestamp: new Date().toISOString()
        });
        // 只保留最近100条
        FileUtils.setLocalData('import_history', history.slice(0, 100));
    }
};
