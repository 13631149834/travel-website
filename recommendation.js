/**
 * 游导旅游 - 智能推荐系统
 * 基于用户行为、偏好和热门数据提供个性化推荐
 */

const RecommendationSystem = (function() {
    // 数据存储键名
    const STORAGE_KEYS = {
        BROWSING_HISTORY: 'travel_browsing_history',
        PREFERENCES: 'travel_user_preferences',
        FAVORITES: 'travel_favorites',
        SEARCH_HISTORY: 'travel_search_history'
    };

    // 模拟导游数据
    const guidesData = [
        { id: 1, name: '张导', avatar: '👨‍💼', title: '高级导游 | 10年经验', rating: 4.9, reviews: 328, languages: ['普通话', '英语'], specialties: ['历史文化', '摄影打卡'], cities: ['北京', '西安'], price: 580, isNew: false },
        { id: 2, name: '李姐', avatar: '👩‍💼', title: '金牌导游 | 8年经验', rating: 4.8, reviews: 256, languages: ['普通话', '粤语'], specialties: ['美食探店', '亲子研学'], cities: ['广州', '深圳'], price: 520, isNew: false },
        { id: 3, name: '王哥', avatar: '🧔', title: '资深导游 | 12年经验', rating: 5.0, reviews: 512, languages: ['普通话', '英语', '日语'], specialties: ['自然风光', '户外探险'], cities: ['成都', '杭州'], price: 680, isNew: false },
        { id: 4, name: '小林美咲', avatar: '👩‍💼', title: '日语导游 | 5年经验', rating: 5.0, reviews: 156, languages: ['中文', '日语', '英语'], specialties: ['日本文化', '购物指南'], cities: ['东京', '大阪'], price: 620, isNew: true },
        { id: 5, name: '陈静', avatar: '👩‍🎨', title: '泰语导游 | 6年经验', rating: 4.9, reviews: 412, languages: ['普通话', '泰语'], specialties: ['海岛度假', '佛教文化'], cities: ['曼谷', '清迈'], price: 480, isNew: false },
        { id: 6, name: 'Marco', avatar: '👨‍🏫', title: '英语导游 | 7年经验', rating: 4.7, reviews: 198, languages: ['英语', '法语', '中文'], specialties: ['欧洲艺术', '博物馆导览'], cities: ['巴黎', '罗马'], price: 750, isNew: true },
        { id: 7, name: '阿明', avatar: '🧔', title: '本地导游 | 4年经验', rating: 4.8, reviews: 89, languages: ['普通话', '闽南语'], specialties: ['闽南文化', '美食品鉴'], cities: ['厦门', '泉州'], price: 380, isNew: true },
        { id: 8, name: '韩雪', avatar: '👩‍🚀', title: '韩语导游 | 6年经验', rating: 4.9, reviews: 267, languages: ['普通话', '韩语', '英语'], specialties: ['韩流文化', '购物攻略'], cities: ['首尔', '济州岛'], price: 550, isNew: false }
    ];

    // 模拟路线数据
    const routesData = [
        { id: 1, name: '北京深度文化之旅', destination: '北京', days: 5, price: 3280, rating: 4.9, reviews: 128, tags: ['文化', '历史', '美食'], isNew: false },
        { id: 2, name: '日本温泉体验之旅', destination: '日本', days: 6, price: 5800, rating: 4.8, reviews: 256, tags: ['温泉', '美食', '购物'], isNew: false },
        { id: 3, name: '云南少数民族探秘', destination: '云南', days: 7, price: 4200, rating: 4.9, reviews: 189, tags: ['民俗', '自然', '摄影'], isNew: true },
        { id: 4, name: '欧洲艺术之旅', destination: '欧洲', days: 10, price: 12800, rating: 4.7, reviews: 98, tags: ['艺术', '博物馆', '建筑'], isNew: false },
        { id: 5, name: '泰国海岛度假游', destination: '泰国', days: 5, price: 3800, rating: 4.8, reviews: 312, tags: ['海岛', '度假', '美食'], isNew: false },
        { id: 6, name: '川西稻城亚丁', destination: '四川', days: 6, price: 4800, rating: 4.9, reviews: 167, tags: ['高原', '摄影', '徒步'], isNew: true },
        { id: 7, name: '新疆喀纳斯金秋', destination: '新疆', days: 8, price: 5600, rating: 4.9, reviews: 145, tags: ['自然', '摄影', '民俗'], isNew: true },
        { id: 8, name: '厦门鼓浪屿休闲', destination: '厦门', days: 4, price: 2200, rating: 4.7, reviews: 203, tags: ['海滨', '美食', '文艺'], isNew: false }
    ];

    /**
     * 记录浏览历史
     */
    function recordBrowsing(type, id, metadata = {}) {
        const history = getBrowsingHistory();
        const entry = {
            type,
            id,
            timestamp: Date.now(),
            ...metadata
        };
        
        // 去重：移除相同类型相同ID的旧记录
        const filtered = history.filter(h => !(h.type === type && h.id === id));
        filtered.unshift(entry);
        
        // 最多保留50条记录
        const trimmed = filtered.slice(0, 50);
        localStorage.setItem(STORAGE_KEYS.BROWSING_HISTORY, JSON.stringify(trimmed));
        
        // 更新偏好
        updatePreferencesFromBrowsing(entry);
    }

    /**
     * 获取浏览历史
     */
    function getBrowsingHistory() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.BROWSING_HISTORY)) || [];
        } catch {
            return [];
        }
    }

    /**
     * 根据浏览历史更新偏好
     */
    function updatePreferencesFromBrowsing(entry) {
        const prefs = getPreferences();
        
        if (entry.type === 'guide' && entry.specialties) {
            entry.specialties.forEach(s => {
                prefs.specialties[s] = (prefs.specialties[s] || 0) + 1;
            });
        }
        
        if (entry.type === 'route' && entry.tags) {
            entry.tags.forEach(t => {
                prefs.tags[t] = (prefs.tags[t] || 0) + 1;
            });
        }
        
        if (entry.destination) {
            prefs.destinations[entry.destination] = (prefs.destinations[entry.destination] || 0) + 1;
        }
        
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    }

    /**
     * 获取用户偏好
     */
    function getPreferences() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFERENCES)) || {
                specialties: {},
                tags: {},
                destinations: {}
            };
        } catch {
            return { specialties: {}, tags: {}, destinations: {} };
        }
    }

    /**
     * 基于浏览历史推荐
     */
    function getBasedOnBrowsing(limit = 4) {
        const history = getBrowsingHistory().slice(0, 10);
        const prefs = getPreferences();
        
        // 分析用户最近浏览的偏好
        const preferredSpecialties = Object.entries(prefs.specialties)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([s]) => s);
        
        const preferredDestinations = Object.entries(prefs.destinations)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([d]) => d);
        
        const preferredTags = Object.entries(prefs.tags)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([t]) => t);
        
        // 筛选匹配的导游
        let matchedGuides = guidesData.filter(g => {
            const browseIds = history.filter(h => h.type === 'guide').map(h => h.id);
            if (browseIds.includes(g.id)) return false; // 排除已浏览
            
            return g.specialties.some(s => preferredSpecialties.includes(s)) ||
                   g.cities.some(c => preferredDestinations.includes(c));
        });
        
        // 如果匹配不足，补充推荐
        if (matchedGuides.length < limit) {
            const remaining = guidesData.filter(g => {
                return !browseIds(history, 'guide').includes(g.id) &&
                       !matchedGuides.find(m => m.id === g.id);
            });
            matchedGuides = [...matchedGuides, ...remaining].slice(0, limit);
        }
        
        // 筛选匹配的路线
        let matchedRoutes = routesData.filter(r => {
            const browseIds = history.filter(h => h.type === 'route').map(h => h.id);
            if (browseIds.includes(r.id)) return false;
            
            return r.tags.some(t => preferredTags.includes(t)) ||
                   preferredDestinations.includes(r.destination);
        });
        
        if (matchedRoutes.length < limit) {
            const remaining = routesData.filter(r => {
                return !browseIds(history, 'route').includes(r.id) &&
                       !matchedRoutes.find(m => m.id === r.id);
            });
            matchedRoutes = [...matchedRoutes, ...remaining].slice(0, limit);
        }
        
        return { guides: matchedGuides.slice(0, limit), routes: matchedRoutes.slice(0, limit) };
    }

    function browseIds(history, type) {
        return history.filter(h => h.type === type).map(h => h.id);
    }

    /**
     * 基于偏好推荐
     */
    function getBasedOnPreferences(limit = 4) {
        const prefs = getPreferences();
        const hasPreferences = Object.keys(prefs.specialties).length > 0 ||
                              Object.keys(prefs.destinations).length > 0;
        
        if (!hasPreferences) {
            // 无偏好时返回热门推荐
            return getPopular(limit);
        }
        
        // 按偏好匹配度排序
        const sortedGuides = [...guidesData].sort((a, b) => {
            const scoreA = calculatePreferenceScore(a, prefs);
            const scoreB = calculatePreferenceScore(b, prefs);
            return scoreB - scoreA;
        });
        
        const sortedRoutes = [...routesData].sort((a, b) => {
            const scoreA = calculateRoutePreferenceScore(a, prefs);
            const scoreB = calculateRoutePreferenceScore(b, prefs);
            return scoreB - scoreA;
        });
        
        return {
            guides: sortedGuides.slice(0, limit),
            routes: sortedRoutes.slice(0, limit)
        };
    }

    function calculatePreferenceScore(guide, prefs) {
        let score = 0;
        
        guide.specialties.forEach(s => {
            score += prefs.specialties[s] || 0;
        });
        
        guide.cities.forEach(c => {
            score += (prefs.destinations[c] || 0) * 2;
        });
        
        return score;
    }

    function calculateRoutePreferenceScore(route, prefs) {
        let score = 0;
        
        route.tags.forEach(t => {
            score += prefs.tags[t] || 0;
        });
        
        score += (prefs.destinations[route.destination] || 0) * 2;
        
        return score;
    }

    /**
     * 热门推荐
     */
    function getPopular(limit = 4) {
        // 按评分和评论数综合排序
        const popularGuides = [...guidesData]
            .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
            .slice(0, limit);
        
        const popularRoutes = [...routesData]
            .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
            .slice(0, limit);
        
        return { guides: popularGuides, routes: popularRoutes };
    }

    /**
     * 新上线导游
     */
    function getNewGuides(limit = 4) {
        return guidesData
            .filter(g => g.isNew)
            .slice(0, limit);
    }

    /**
     * 相似导游推荐
     */
    function getSimilarGuides(guideId, limit = 3) {
        const currentGuide = guidesData.find(g => g.id === guideId);
        if (!currentGuide) return [];
        
        return guidesData
            .filter(g => g.id !== guideId)
            .map(g => {
                let similarity = 0;
                
                // 擅长领域相似度
                currentGuide.specialties.forEach(s => {
                    if (g.specialties.includes(s)) similarity += 3;
                });
                
                // 服务城市相似
                currentGuide.cities.forEach(c => {
                    if (g.cities.includes(c)) similarity += 2;
                });
                
                // 语言相似
                currentGuide.languages.forEach(l => {
                    if (g.languages.includes(l)) similarity += 1;
                });
                
                return { ...g, similarity };
            })
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }

    /**
     * 同区域导游
     */
    function getGuidesInRegion(cities, excludeId, limit = 3) {
        return guidesData
            .filter(g => g.id !== excludeId && g.cities.some(c => cities.includes(c)))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }

    /**
     * 相似路线推荐
     */
    function getSimilarRoutes(routeId, limit = 3) {
        const currentRoute = routesData.find(r => r.id === routeId);
        if (!currentRoute) return [];
        
        return routesData
            .filter(r => r.id !== routeId)
            .map(r => {
                let similarity = 0;
                
                // 标签相似度
                currentRoute.tags.forEach(t => {
                    if (r.tags.includes(t)) similarity += 3;
                });
                
                // 目的地相似
                if (r.destination === currentRoute.destination) similarity += 5;
                
                // 价格相近
                if (Math.abs(r.price - currentRoute.price) < 1000) similarity += 1;
                
                return { ...r, similarity };
            })
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }

    /**
     * 组合推荐（路线+导游）
     */
    function getComboRecommendations(limit = 3) {
        const popular = getPopular(limit);
        
        return popular.routes.map((route, index) => {
            const suitableGuide = popular.guides[index] || popular.guides[0];
            return {
                route,
                guide: suitableGuide,
                reason: `${route.destination}深度游 + ${suitableGuide.name}专属导览`
            };
        });
    }

    /**
     * 记录搜索历史
     */
    function recordSearch(keyword) {
        const history = getSearchHistory();
        const filtered = history.filter(h => h !== keyword);
        filtered.unshift(keyword);
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(filtered.slice(0, 20)));
    }

    /**
     * 获取搜索历史
     */
    function getSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)) || [];
        } catch {
            return [];
        }
    }

    /**
     * 清除所有推荐数据
     */
    function clearAll() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    // 导出公开接口
    return {
        recordBrowsing,
        getBasedOnBrowsing,
        getBasedOnPreferences,
        getPopular,
        getNewGuides,
        getSimilarGuides,
        getGuidesInRegion,
        getSimilarRoutes,
        getComboRecommendations,
        recordSearch,
        getSearchHistory,
        getPreferences,
        clearAll,
        guidesData,
        routesData
    };
})();

// 页面加载时自动初始化推荐模块
document.addEventListener('DOMContentLoaded', function() {
    // 如果在推荐模块容器中，初始化推荐内容
    initRecommendationModules();
});

function initRecommendationModules() {
    // 猜你喜欢
    const guessLikeContainer = document.getElementById('guessLikeContainer');
    if (guessLikeContainer) {
        renderGuessLike(guessLikeContainer);
    }
    
    // 热门推荐
    const popularContainer = document.getElementById('popularContainer');
    if (popularContainer) {
        renderPopular(popularContainer);
    }
    
    // 新上线导游
    const newGuidesContainer = document.getElementById('newGuidesContainer');
    if (newGuidesContainer) {
        renderNewGuides(newGuidesContainer);
    }
    
    // 相似导游推荐
    const similarGuidesContainer = document.getElementById('similarGuidesContainer');
    if (similarGuidesContainer) {
        const guideId = parseInt(new URLSearchParams(window.location.search).get('id')) || 1;
        renderSimilarGuides(similarGuidesContainer, guideId);
    }
    
    // 同区域导游
    const regionGuidesContainer = document.getElementById('regionGuidesContainer');
    if (regionGuidesContainer) {
        const guideId = parseInt(new URLSearchParams(window.location.search).get('id')) || 1;
        renderRegionGuides(regionGuidesContainer, guideId);
    }
    
    // 相似路线
    const similarRoutesContainer = document.getElementById('similarRoutesContainer');
    if (similarRoutesContainer) {
        const routeId = parseInt(new URLSearchParams(window.location.search).get('id')) || 1;
        renderSimilarRoutes(similarRoutesContainer, routeId);
    }
    
    // 组合推荐
    const comboContainer = document.getElementById('comboContainer');
    if (comboContainer) {
        renderComboRecommendations(comboContainer);
    }
}

// 渲染猜你喜欢
function renderGuessLike(container) {
    const data = RecommendationSystem.getBasedOnBrowsing(4);
    const items = [...data.guides, ...data.routes].slice(0, 4);
    
    if (items.length === 0) {
        container.innerHTML = '<p class="empty-tip">暂无推荐，先去逛逛吧~</p>';
        return;
    }
    
    container.innerHTML = items.map(item => {
        if (item.days) {
            // 路线
            return `
                <a href="route-detail.html?id=${item.id}" class="rec-card">
                    <div class="rec-card-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <span class="rec-card-emoji">🗺️</span>
                    </div>
                    <div class="rec-card-content">
                        <h4>${item.name}</h4>
                        <p class="rec-card-meta">${item.destination} · ${item.days}天</p>
                        <p class="rec-card-price">¥${item.price}起</p>
                    </div>
                </a>
            `;
        } else {
            // 导游
            return `
                <a href="guide-detail.html?id=${item.id}" class="rec-card">
                    <div class="rec-card-avatar">${item.avatar}</div>
                    <div class="rec-card-content">
                        <h4>${item.name}</h4>
                        <p class="rec-card-meta">${item.title}</p>
                        <p class="rec-card-rating">⭐ ${item.rating}</p>
                    </div>
                </a>
            `;
        }
    }).join('');
}

// 渲染热门推荐
function renderPopular(container) {
    const data = RecommendationSystem.getPopular(4);
    
    container.innerHTML = data.guides.map(g => `
        <a href="guide-detail.html?id=${g.id}" class="popular-guide-item">
            <div class="popular-rank">🔥</div>
            <div class="popular-avatar">${g.avatar}</div>
            <div class="popular-info">
                <h4>${g.name}</h4>
                <p>⭐ ${g.rating} · ${g.reviews}条评价</p>
            </div>
        </a>
    `).join('');
}

// 渲染新上线导游
function renderNewGuides(container) {
    const newGuides = RecommendationSystem.getNewGuides(4);
    
    if (newGuides.length === 0) {
        container.innerHTML = '<p class="empty-tip">暂无新导游</p>';
        return;
    }
    
    container.innerHTML = newGuides.map(g => `
        <a href="guide-detail.html?id=${g.id}" class="new-guide-card">
            <div class="new-guide-badge">新上线</div>
            <div class="new-guide-avatar">${g.avatar}</div>
            <div class="new-guide-info">
                <h4>${g.name}</h4>
                <p>${g.specialties[0]}</p>
                <span class="new-guide-price">¥${g.price}/天</span>
            </div>
        </a>
    `).join('');
}

// 渲染相似导游
function renderSimilarGuides(container, guideId) {
    const similar = RecommendationSystem.getSimilarGuides(guideId, 3);
    
    if (similar.length === 0) {
        container.innerHTML = '<p class="empty-tip">暂无相似导游</p>';
        return;
    }
    
    container.innerHTML = similar.map(g => `
        <a href="guide-detail.html?id=${g.id}" class="similar-card">
            <div class="similar-avatar">${g.avatar}</div>
            <div class="similar-info">
                <h4>${g.name}</h4>
                <p>${g.specialties.join(' · ')}</p>
                <span class="similar-rating">⭐ ${g.rating}</span>
            </div>
        </a>
    `).join('');
}

// 渲染同区域导游
function renderRegionGuides(container, guideId) {
    const guide = RecommendationSystem.guidesData.find(g => g.id === guideId);
    if (!guide) return;
    
    const regionGuides = RecommendationSystem.getGuidesInRegion(guide.cities, guideId, 3);
    
    if (regionGuides.length === 0) {
        container.innerHTML = '<p class="empty-tip">暂无同区域导游</p>';
        return;
    }
    
    container.innerHTML = regionGuides.map(g => `
        <a href="guide-detail.html?id=${g.id}" class="region-card">
            <div class="region-avatar">${g.avatar}</div>
            <div class="region-info">
                <h4>${g.name}</h4>
                <p>${g.cities.join('、')}</p>
                <span class="region-price">¥${g.price}/天</span>
            </div>
        </a>
    `).join('');
}

// 渲染相似路线
function renderSimilarRoutes(container, routeId) {
    const similar = RecommendationSystem.getSimilarRoutes(routeId, 3);
    
    if (similar.length === 0) {
        container.innerHTML = '<p class="empty-tip">暂无相似路线</p>';
        return;
    }
    
    container.innerHTML = similar.map(r => `
        <a href="route-detail.html?id=${r.id}" class="similar-route-card">
            <div class="similar-route-image" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <span>🗺️</span>
            </div>
            <div class="similar-route-info">
                <h4>${r.name}</h4>
                <p>${r.destination} · ${r.days}天</p>
                <span class="similar-route-price">¥${r.price}</span>
            </div>
        </a>
    `).join('');
}

// 渲染组合推荐
function renderComboRecommendations(container) {
    const combos = RecommendationSystem.getComboRecommendations(3);
    
    if (combos.length === 0) {
        container.innerHTML = '<p class="empty-tip">暂无推荐组合</p>';
        return;
    }
    
    container.innerHTML = combos.map(combo => `
        <div class="combo-card">
            <div class="combo-content">
                <div class="combo-route">
                    <span class="combo-icon">🗺️</span>
                    <span>${combo.route.name}</span>
                </div>
                <span class="combo-plus">+</span>
                <div class="combo-guide">
                    <span class="combo-icon">${combo.guide.avatar}</span>
                    <span>${combo.guide.name}导览</span>
                </div>
            </div>
            <p class="combo-reason">${combo.reason}</p>
            <div class="combo-price">¥${combo.route.price + combo.guide.price * 3}起</div>
            <a href="route-detail.html?id=${combo.route.id}" class="combo-btn">查看详情</a>
        </div>
    `).join('');
}

// 记录浏览的辅助函数（供页面调用）
function recordGuideView(guideId, specialties, cities) {
    RecommendationSystem.recordBrowsing('guide', guideId, { specialties, cities });
}

function recordRouteView(routeId, tags, destination) {
    RecommendationSystem.recordBrowsing('route', routeId, { tags, destination });
}
