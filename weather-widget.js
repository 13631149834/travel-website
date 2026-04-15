/**
 * 天气服务模块
 * 提供天气查询、展示、穿衣建议等功能
 */

const WeatherModule = (function() {
  // 天气数据缓存
  let weatherData = null;
  let currentCity = null;
  
  // 初始化
  async function init() {
    await loadWeatherData();
    setupEventListeners();
  }
  
  // 加载天气数据
  async function loadWeatherData() {
    try {
      const response = await fetch('./data/weather.json');
      weatherData = await response.json();
      return weatherData;
    } catch (error) {
      console.error('加载天气数据失败:', error);
      return null;
    }
  }
  
  // 设置事件监听
  function setupEventListeners() {
    const searchInput = document.getElementById('weather-search-input');
    const searchBtn = document.getElementById('weather-search-btn');
    
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          searchCity(searchInput.value);
        }
      });
    }
    
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        searchCity(searchInput.value);
      });
    }
    
    // 热门城市点击
    document.querySelectorAll('.hot-city-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const cityId = tag.dataset.city;
        searchCityById(cityId);
        
        // 更新选中状态
        document.querySelectorAll('.hot-city-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
      });
    });
  }
  
  // 按名称搜索城市
  function searchCity(query) {
    if (!weatherData || !query) return;
    
    const normalizedQuery = query.trim().toLowerCase();
    
    // 查找匹配的城市
    let foundCity = null;
    for (const [id, city] of Object.entries(weatherData.cities)) {
      if (city.name.includes(query) || 
          city.name_en.toLowerCase().includes(normalizedQuery) ||
          id === normalizedQuery) {
        foundCity = city;
        break;
      }
    }
    
    if (foundCity) {
      displayWeather(foundCity);
    } else {
      showError('未找到该城市，请尝试其他城市名称');
    }
  }
  
  // 按ID搜索城市
  function searchCityById(cityId) {
    if (!weatherData) return;
    
    const city = weatherData.cities[cityId];
    if (city) {
      displayWeather(city);
    } else {
      showError('未找到该城市');
    }
  }
  
  // 显示天气信息
  function displayWeather(city) {
    currentCity = city;
    
    // 更新当前天气
    displayCurrentWeather(city);
    
    // 更新天气预报
    displayForecast(city);
    
    // 更新指数
    displayIndices(city);
    
    // 更新穿衣建议
    displayDressingAdvice(city);
    
    // 更新出行建议
    displayTravelSuggestions(city);
    
    // 隐藏错误提示
    hideError();
    
    // 滚动到天气区域
    const weatherSection = document.querySelector('.weather-content');
    if (weatherSection) {
      weatherSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  // 显示当前天气
  function displayCurrentWeather(city) {
    const container = document.getElementById('current-weather');
    if (!container) return;
    
    const weatherIcon = getWeatherIcon(city.current.weather_code);
    const aqiLevel = getAQIDescription(city.current.aqi);
    
    container.innerHTML = `
      <div class="weather-main fade-in">
        <div class="weather-info">
          <div class="weather-location">
            <span class="location-icon">📍</span>
            <span class="city-name">${city.name}</span>
          </div>
          <div class="weather-temp">
            <span class="temp-value">${city.current.temp}</span>
            <span class="temp-unit">°C</span>
          </div>
          <div class="weather-desc">${city.current.weather}</div>
          <div class="weather-feels">体感温度 ${city.current.feels_like}°C · ${city.current.wind_dir} ${city.current.wind_speed}km/h</div>
        </div>
        <div class="weather-icon-large">${weatherIcon}</div>
      </div>
      <div class="weather-details fade-in" style="animation-delay: 0.2s">
        <div class="weather-detail-item">
          <div class="detail-icon">💧</div>
          <div class="detail-label">湿度</div>
          <div class="detail-value">${city.current.humidity}%</div>
        </div>
        <div class="weather-detail-item">
          <div class="detail-icon">🌬️</div>
          <div class="detail-label">风速</div>
          <div class="detail-value">${city.current.wind_speed}km/h</div>
        </div>
        <div class="weather-detail-item">
          <div class="detail-icon">☀️</div>
          <div class="detail-label">紫外线</div>
          <div class="detail-value">${city.current.uv_index}</div>
        </div>
        <div class="weather-detail-item">
          <div class="detail-icon">🌫️</div>
          <div class="detail-label">能见度</div>
          <div class="detail-value">${city.current.visibility}km</div>
        </div>
      </div>
    `;
  }
  
  // 显示天气预报
  function displayForecast(city) {
    const container = document.getElementById('forecast-grid');
    if (!container || !city.forecast) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    container.innerHTML = city.forecast.map((day, index) => {
      const isToday = day.date === today;
      return `
        <div class="forecast-card ${isToday ? 'today' : ''} ${isToday ? 'slide-up' : ''}" 
             style="animation-delay: ${index * 0.1}s">
          <div class="day">${isToday ? '今天' : day.day}</div>
          <div class="weather-icon">${getWeatherIcon(day.weather_code)}</div>
          <div class="temp-high">${day.temp_high}°</div>
          <div class="temp-low">${day.temp_low}°</div>
        </div>
      `;
    }).join('');
  }
  
  // 显示指数信息
  function displayIndices(city) {
    const container = document.getElementById('indices-grid');
    if (!container) return;
    
    const dressingLevel = getDressingLevel(city.current.temp);
    const dressingAdvice = weatherData.indices.dressing[dressingLevel];
    
    const uvLevel = getUVLevel(city.current.uv_index);
    const uvInfo = weatherData.indices.uv[uvLevel];
    
    const travelLevel = getTravelLevel(city);
    const travelInfo = weatherData.indices.travel[travelLevel];
    
    const aqiLevel = getAQIDescription(city.current.aqi);
    
    container.innerHTML = `
      <div class="index-card fade-in" style="animation-delay: 0.1s">
        <div class="index-icon-wrapper dressing">👔</div>
        <div class="index-content">
          <div class="index-header">
            <span class="index-name">穿衣指数</span>
            <span class="index-level moderate">${getDressingLevelName(dressingLevel)}</span>
          </div>
          <p class="index-desc">${dressingAdvice}</p>
        </div>
      </div>
      
      <div class="index-card fade-in" style="animation-delay: 0.2s">
        <div class="index-icon-wrapper uv">☂️</div>
        <div class="index-content">
          <div class="index-header">
            <span class="index-name">紫外线指数</span>
            <span class="index-level ${getUVLevelClass(uvLevel)}">${uvInfo.level}</span>
          </div>
          <p class="index-desc">${uvInfo.desc} ${uvInfo.icon}</p>
        </div>
      </div>
      
      <div class="index-card fade-in" style="animation-delay: 0.3s">
        <div class="index-icon-wrapper travel">🎒</div>
        <div class="index-content">
          <div class="index-header">
            <span class="index-name">旅游适宜度</span>
            <span class="index-level ${travelLevel}">${travelInfo.level}</span>
          </div>
          <p class="index-desc">${travelInfo.desc}</p>
        </div>
      </div>
      
      <div class="index-card fade-in" style="animation-delay: 0.4s">
        <div class="index-icon-wrapper air">🌬️</div>
        <div class="index-content">
          <div class="index-header">
            <span class="index-name">空气质量</span>
            <span class="index-level ${getAQILevelClass(city.current.aqi)}">${aqiLevel}</span>
          </div>
          <p class="index-desc">AQI ${city.current.aqi} · ${getAQITip(city.current.aqi)}</p>
        </div>
      </div>
    `;
  }
  
  // 显示穿衣建议
  function displayDressingAdvice(city) {
    const container = document.getElementById('dressing-advice');
    if (!container) return;
    
    const dressingItems = getDressingItems(city.current.temp, city.current.weather_code);
    
    container.innerHTML = `
      <div class="dressing-items">
        ${dressingItems.map(item => `
          <div class="dressing-item">
            <span>${item.icon}</span>
            <span>${item.name}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // 显示出行建议
  function displayTravelSuggestions(city) {
    const container = document.getElementById('travel-suggestions');
    if (!container) return;
    
    const suggestions = getTravelSuggestions(city);
    
    container.innerHTML = `
      <div class="suggestions-grid">
        ${suggestions.map(item => `
          <div class="suggestion-item">
            <div class="suggestion-icon">${item.icon}</div>
            <div class="suggestion-text">
              <h4>${item.title}</h4>
              <p>${item.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // 显示最佳出行时间
  function displayBestTime(cityId) {
    const container = document.getElementById('best-time');
    if (!container) return;
    
    const city = weatherData?.cities[cityId];
    if (!city) return;
    
    const bestMonths = getBestTravelMonths(cityId);
    const currentMonth = new Date().getMonth() + 1;
    
    container.innerHTML = `
      <div class="best-time-header">
        <span class="icon">⏰</span>
        <h3>最佳出行时间</h3>
      </div>
      <div class="best-time-content">
        ${bestMonths.map(month => `
          <div class="best-time-item">
            <span class="month">${month.name}</span>
            <span class="desc">${month.desc}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // 获取天气图标
  function getWeatherIcon(code) {
    const icons = weatherData?.weather_icons || {
      sunny: '☀️',
      cloudy: '☁️',
      partly_cloudy: '⛅',
      overcast: '🌥️',
      rain: '🌧️',
      heavy_rain: '⛈️',
      thunderstorm: '⚡',
      snow: '❄️',
      fog: '🌫️',
      wind: '💨'
    };
    return icons[code] || '☀️';
  }
  
  // 获取穿衣指数级别
  function getDressingLevel(temp) {
    if (temp < -10) return 1;
    if (temp < 0) return 2;
    if (temp < 10) return 3;
    if (temp < 15) return 4;
    if (temp < 20) return 5;
    if (temp < 25) return 6;
    if (temp < 30) return 7;
    if (temp < 35) return 8;
    return 9;
  }
  
  // 获取穿衣指数级别名称
  function getDressingLevelName(level) {
    const names = {
      1: '极冷',
      2: '很冷',
      3: '寒冷',
      4: '较冷',
      5: '凉爽',
      6: '舒适',
      7: '微热',
      8: '闷热',
      9: '酷热'
    };
    return names[level] || '舒适';
  }
  
  // 获取紫外线级别
  function getUVLevel(uv) {
    if (uv <= 2) return 1;
    if (uv <= 4) return 2;
    if (uv <= 6) return 3;
    if (uv <= 8) return 4;
    if (uv <= 10) return 5;
    return 6;
  }
  
  // 获取紫外线级别样式
  function getUVLevelClass(level) {
    const classes = {
      1: 'excellent',
      2: 'good',
      3: 'moderate',
      4: 'poor',
      5: 'poor',
      6: 'poor'
    };
    return classes[level] || 'moderate';
  }
  
  // 获取旅游适宜度级别
  function getTravelLevel(city) {
    const temp = city.current.temp;
    const weather = city.current.weather_code;
    const rain = weather === 'rain' || weather === 'heavy_rain' || weather === 'thunderstorm';
    
    if (rain) return 'poor';
    if (temp < 0 || temp > 35) return 'poor';
    if (temp >= 15 && temp <= 28 && !rain) return 'excellent';
    if (temp >= 10 && temp <= 30) return 'good';
    return 'moderate';
  }
  
  // 获取AQI描述
  function getAQIDescription(aqi) {
    if (aqi <= 50) return '优';
    if (aqi <= 100) return '良';
    if (aqi <= 150) return '轻度污染';
    if (aqi <= 200) return '中度污染';
    if (aqi <= 300) return '重度污染';
    return '严重污染';
  }
  
  // 获取AQI级别样式
  function getAQILevelClass(aqi) {
    if (aqi <= 50) return 'excellent';
    if (aqi <= 100) return 'good';
    if (aqi <= 150) return 'moderate';
    return 'poor';
  }
  
  // 获取AQI提示
  function getAQITip(aqi) {
    if (aqi <= 50) return '空气质量非常好，适合户外活动';
    if (aqi <= 100) return '空气质量良好，可正常活动';
    if (aqi <= 150) return '敏感人群减少户外活动';
    if (aqi <= 200) return '减少户外活动，佩戴口罩';
    if (aqi <= 300) return '避免户外活动';
    return '停止户外活动';
  }
  
  // 获取穿衣物品建议
  function getDressingItems(temp, weatherCode) {
    const items = [];
    
    if (temp < 5) {
      items.push({ icon: '🧥', name: '羽绒服' }, { icon: '🧣', name: '围巾' }, { icon: '🧤', name: '手套' }, { icon: '🎩', name: '帽子' });
    } else if (temp < 15) {
      items.push({ icon: '🧥', name: '外套' }, { icon: '👕', name: '毛衣' }, { icon: '👖', name: '牛仔裤' });
    } else if (temp < 25) {
      items.push({ icon: '👕', name: '长袖' }, { icon: '👖', name: '长裤' }, { icon: '🧥', name: '薄外套' });
    } else {
      items.push({ icon: '👕', name: '短袖' }, { icon: '🩳', name: '短裤' }, { icon: '👒', name: '遮阳帽' });
    }
    
    if (weatherCode === 'rain' || weatherCode === 'heavy_rain' || weatherCode === 'thunderstorm') {
      items.unshift({ icon: '☂️', name: '雨伞' });
    }
    
    if (weatherCode === 'sunny' || weatherCode === 'partly_cloudy') {
      items.unshift({ icon: '🕶️', name: '墨镜' });
    }
    
    return items.slice(0, 6);
  }
  
  // 获取出行建议
  function getTravelSuggestions(city) {
    const suggestions = [];
    const temp = city.current.temp;
    const weather = city.current.weather_code;
    const uv = city.current.uv_index;
    
    // 温度建议
    if (temp < 10) {
      suggestions.push({
        icon: '🌡️',
        title: '注意保暖',
        desc: '气温较低，建议穿着保暖衣物，携带暖宝宝'
      });
    } else if (temp > 30) {
      suggestions.push({
        icon: '🥵',
        title: '防暑降温',
        desc: '气温较高，注意补充水分，避免中暑'
      });
    } else {
      suggestions.push({
        icon: '😊',
        title: '气温宜人',
        desc: '天气舒适，适合户外活动和观光游览'
      });
    }
    
    // 天气建议
    if (weather === 'rain' || weather === 'heavy_rain' || weather === 'thunderstorm') {
      suggestions.push({
        icon: '🌧️',
        title: '携带雨具',
        desc: '今天有雨，请随身携带雨伞或雨衣'
      });
    } else if (weather === 'sunny') {
      suggestions.push({
        icon: '☀️',
        title: '注意防晒',
        desc: '阳光强烈，外出请做好防晒措施'
      });
    }
    
    // 紫外线建议
    if (uv >= 7) {
      suggestions.push({
        icon: '🧴',
        title: '高紫外线',
        desc: '紫外线强度高，建议使用SPF50+防晒霜'
      });
    }
    
    // 空气建议
    if (city.current.aqi > 100) {
      suggestions.push({
        icon: '😷',
        title: '空气较差',
        desc: '空气质量欠佳，建议佩戴口罩'
      });
    }
    
    // 默认建议
    if (suggestions.length < 2) {
      suggestions.push({
        icon: '🎒',
        title: '轻装出行',
        desc: '天气状况良好，建议穿着轻便舒适的衣物'
      });
    }
    
    return suggestions;
  }
  
  // 获取最佳出行月份
  function getBestTravelMonths(cityId) {
    const bestTimes = {
      beijing: [
        { name: '4月-5月', desc: '春花烂漫' },
        { name: '9月-10月', desc: '秋高气爽' }
      ],
      shanghai: [
        { name: '3月-5月', desc: '春暖花开' },
        { name: '9月-11月', desc: '秋意渐浓' }
      ],
      hangzhou: [
        { name: '3月-5月', desc: '西湖春色' },
        { name: '9月-11月', desc: '桂香满城' }
      ],
      chengdu: [
        { name: '3月-6月', desc: '熊猫与花' },
        { name: '9月-11月', desc: '秋色宜人' }
      ],
      xian: [
        { name: '3月-5月', desc: '历史与春天' },
        { name: '9月-11月', desc: '秋意浓' }
      ],
      guangzhou: [
        { name: '10月-12月', desc: '秋高气爽' },
        { name: '3月-4月', desc: '花城春色' }
      ],
      sanya: [
        { name: '11月-3月', desc: '避寒胜地' },
        { name: '4月-5月', desc: '淡季优惠' }
      ],
      lijiang: [
        { name: '3月-5月', desc: '花开成海' },
        { name: '9月-11月', desc: '秋色金黄' }
      ],
      kunming: [
        { name: '全年皆宜', desc: '春城无四季' }
      ],
      harbin: [
        { name: '12月-2月', desc: '冰雪奇缘' },
        { name: '7月-8月', desc: '避暑天堂' }
      ],
      default: [
        { name: '4月-6月', desc: '春季最美' },
        { name: '9月-11月', desc: '秋季宜人' }
      ]
    };
    
    return bestTimes[cityId] || bestTimes.default;
  }
  
  // 显示错误
  function showError(message) {
    const errorEl = document.getElementById('weather-error');
    if (errorEl) {
      errorEl.innerHTML = `
        <div class="weather-error-icon">🔍</div>
        <h3>查询失败</h3>
        <p>${message}</p>
      `;
      errorEl.style.display = 'block';
    }
  }
  
  // 隐藏错误
  function hideError() {
    const errorEl = document.getElementById('weather-error');
    if (errorEl) {
      errorEl.style.display = 'none';
    }
  }
  
  // 获取所有城市列表
  function getAllCities() {
    if (!weatherData) return [];
    return Object.values(weatherData.cities);
  }
  
  // 搜索城市（自动补全用）
  function searchCities(query) {
    if (!weatherData || !query) return [];
    
    const normalizedQuery = query.toLowerCase();
    return Object.values(weatherData.cities).filter(city => 
      city.name.includes(query) || 
      city.name_en.toLowerCase().includes(normalizedQuery)
    ).slice(0, 5);
  }
  
  // 导出公共接口
  return {
    init,
    loadWeatherData,
    searchCity,
    searchCityById,
    displayWeather,
    getAllCities,
    searchCities,
    getWeatherIcon,
    getCurrentCity: () => currentCity,
    getWeatherData: () => weatherData
  };
})();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelector('.weather-page')) {
    WeatherModule.init().then(() => {
      // 默认显示北京天气
      const urlParams = new URLSearchParams(window.location.search);
      const cityParam = urlParams.get('city');
      
      if (cityParam) {
        WeatherModule.searchCityById(cityParam);
      } else {
        WeatherModule.searchCityById('beijing');
        // 激活北京标签
        const beijingTag = document.querySelector('[data-city="beijing"]');
        if (beijingTag) beijingTag.classList.add('active');
      }
    });
  }
});

// 导出为全局变量
window.WeatherModule = WeatherModule;
