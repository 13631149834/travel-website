/**
 * 游导旅游 - 本地化工具模块
 * 支持货币、日期、时区、度量单位的本地化处理
 */

(function() {
  'use strict';

  // 本地化配置
  const LOCALIZE_CONFIG = {
    // 货币配置
    currencies: {
      CNY: { symbol: '¥', name: '人民币', position: 'before', decimals: 2 },
      USD: { symbol: '$', name: '美元', position: 'before', decimals: 2 },
      EUR: { symbol: '€', name: '欧元', position: 'before', decimals: 2 },
      GBP: { symbol: '£', name: '英镑', position: 'before', decimals: 2 },
      JPY: { symbol: '¥', name: '日元', position: 'before', decimals: 0 },
      KRW: { symbol: '₩', name: '韩元', position: 'before', decimals: 0 },
      THB: { symbol: '฿', name: '泰铢', position: 'before', decimals: 2 },
      RUB: { symbol: '₽', name: '卢布', position: 'after', decimals: 2 },
      AUD: { symbol: 'A$', name: '澳元', position: 'before', decimals: 2 },
      CAD: { symbol: 'C$', name: '加元', position: 'before', decimals: 2 }
    },

    // 汇率（示例，实际应从API获取）
    exchangeRates: {
      CNY: 1,
      USD: 7.24,
      EUR: 7.85,
      GBP: 9.12,
      JPY: 0.048,
      KRW: 0.0054,
      THB: 0.20,
      RUB: 0.079,
      AUD: 4.76,
      CAD: 5.32
    },

    // 区域设置
    locales: {
      zh: 'zh-CN',
      en: 'en-US',
      ja: 'ja-JP',
      ko: 'ko-KR',
      fr: 'fr-FR',
      de: 'de-DE',
      es: 'es-ES',
      ru: 'ru-RU'
    },

    // 时区设置
    timezones: {
      zh: 'Asia/Shanghai',
      en: 'America/New_York',
      ja: 'Asia/Tokyo',
      ko: 'Asia/Seoul',
      fr: 'Europe/Paris',
      de: 'Europe/Berlin',
      es: 'Europe/Madrid',
      ru: 'Europe/Moscow'
    },

    // 日期格式
    dateFormats: {
      short: {
        zh: 'YYYY/MM/DD',
        en: 'MM/DD/YYYY',
        ja: 'YYYY/MM/DD',
        ko: 'YYYY.MM.DD',
        fr: 'DD/MM/YYYY',
        de: 'DD.MM.YYYY',
        es: 'DD/MM/YYYY',
        ru: 'DD.MM.YYYY'
      },
      long: {
        zh: 'YYYY年MM月DD日',
        en: 'MMMM DD, YYYY',
        ja: 'YYYY年MM月DD日',
        ko: 'YYYY년 MM월 DD일',
        fr: 'DD MMMM YYYY',
        de: 'DD. MMMM YYYY',
        es: 'DD [de] MMMM [de] YYYY',
        ru: 'DD MMMM YYYY г.'
      },
      time: {
        zh: 'HH:mm',
        en: 'h:mm A',
        ja: 'HH:mm',
        ko: 'HH:mm',
        fr: 'HH:mm',
        de: 'HH:mm',
        es: 'HH:mm',
        ru: 'HH:mm'
      }
    },

    // 度量单位
    units: {
      distance: {
        metric: { km: '公里', m: '米', cm: '厘米' },
        imperial: { mi: '英里', ft: '英尺', in: '英寸' }
      },
      weight: {
        metric: { kg: '公斤', g: '克' },
        imperial: { lb: '磅', oz: '盎司' }
      },
      temperature: {
        celsius: '摄氏度',
        fahrenheit: '华氏度'
      },
      volume: {
        metric: { L: '升', mL: '毫升' },
        imperial: { gal: '加仑', qt: '夸脱' }
      }
    }
  };

  // 获取当前语言
  function getCurrentLang() {
    return localStorage.getItem('youdao_lang') || 'zh';
  }

  // 获取当前区域
  function getCurrentLocale() {
    const lang = getCurrentLang();
    return LOCALIZE_CONFIG.locales[lang] || 'zh-CN';
  }

  // 获取当前时区
  function getCurrentTimezone() {
    const lang = getCurrentLang();
    return LOCALIZE_CONFIG.timezones[lang] || 'Asia/Shanghai';
  }

  // ==================== 货币格式化 ====================
  
  /**
   * 格式化货币
   * @param {number} amount - 金额
   * @param {string} currency - 货币代码 (CNY, USD, EUR等)
   * @param {string} locale - 区域设置 (可选)
   */
  function formatCurrency(amount, currency = 'CNY', locale = null) {
    locale = locale || getCurrentLocale();
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: LOCALIZE_CONFIG.currencies[currency]?.decimals || 2,
        maximumFractionDigits: LOCALIZE_CONFIG.currencies[currency]?.decimals || 2
      }).format(amount);
    } catch (e) {
      // 回退方案
      const config = LOCALIZE_CONFIG.currencies[currency] || { symbol: currency, position: 'before' };
      const symbol = config.symbol || '';
      const formatted = amount.toFixed(config.decimals || 2);
      return config.position === 'after' ? `${formatted}${symbol}` : `${symbol}${formatted}`;
    }
  }

  /**
   * 转换货币
   * @param {number} amount - 金额
   * @param {string} from - 源货币
   * @param {string} to - 目标货币
   */
  function convertCurrency(amount, from = 'CNY', to = 'CNY') {
    const rates = LOCALIZE_CONFIG.exchangeRates;
    if (!rates[from] || !rates[to]) return amount;
    
    const inCNY = amount * rates[from];
    return inCNY / rates[to];
  }

  /**
   * 获取货币符号
   */
  function getCurrencySymbol(currency) {
    return LOCALIZE_CONFIG.currencies[currency]?.symbol || currency;
  }

  /**
   * 简化的货币显示（用于列表价格）
   */
  function formatPrice(amount, currency = 'CNY') {
    const symbol = getCurrencySymbol(currency);
    if (currency === 'JPY' || currency === 'KRW') {
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    }
    return `${symbol}${amount.toFixed(2)}`;
  }

  // ==================== 日期时间格式化 ====================

  /**
   * 格式化日期
   * @param {Date|string|number} date - 日期
   * @param {string} formatType - 格式类型 (short, long, time)
   * @param {string} locale - 区域设置 (可选)
   */
  function formatDate(date, formatType = 'short', locale = null) {
    locale = locale || getCurrentLocale();
    const d = date instanceof Date ? date : new Date(date);
    const lang = getCurrentLang();

    const formats = LOCALIZE_CONFIG.dateFormats[formatType];
    if (!formats) return d.toLocaleDateString(locale);

    const pattern = formats[lang] || formats.zh;
    return formatDateWithPattern(d, pattern, lang);
  }

  /**
   * 根据模式格式化日期
   */
  function formatDateWithPattern(date, pattern, lang) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const monthNames = {
      zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
      fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
      de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
      ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
    };

    const monthName = monthNames[lang] ? monthNames[lang][month] : monthNames.zh[month];

    return pattern
      .replace('YYYY', year)
      .replace('MMMM', monthName)
      .replace('MM', String(month + 1).padStart(2, '0'))
      .replace('DD', String(day).padStart(2, '0'))
      .replace('HH:mm', `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
  }

  /**
   * 格式化相对时间
   */
  function formatRelativeTime(date, locale = null) {
    locale = locale || getCurrentLocale();
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = now - d;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (days > 0) return rtf.format(-days, 'day');
    if (hours > 0) return rtf.format(-hours, 'hour');
    if (minutes > 0) return rtf.format(-minutes, 'minute');
    return rtf.format(-seconds, 'second');
  }

  /**
   * 获取世界时钟时间
   */
  function getWorldClockTime(city, timezone, locale = null) {
    locale = locale || getCurrentLocale();
    try {
      return new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: getCurrentLang() === 'en'
      }).format(new Date());
    } catch (e) {
      return '--:--:--';
    }
  }

  /**
   * 获取时区偏移
   */
  function getTimezoneOffset(timezone) {
    try {
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const targetTime = new Date(utcTime + (getTimezoneOffsetHours(timezone) * 3600000));
      return (targetTime - now) / 3600000;
    } catch (e) {
      return 0;
    }
  }

  function getTimezoneOffsetHours(timezone) {
    const offsets = {
      'Asia/Shanghai': 8,
      'Asia/Tokyo': 9,
      'Asia/Seoul': 9,
      'America/New_York': -5,
      'Europe/Paris': 1,
      'Europe/Berlin': 1,
      'Europe/Madrid': 1,
      'Europe/Moscow': 3
    };
    return offsets[timezone] || 0;
  }

  // ==================== 度量单位转换 ====================

  /**
   * 格式化距离
   */
  function formatDistance(km, system = 'metric') {
    const lang = getCurrentLang();
    const units = LOCALIZE_CONFIG.units.distance;

    if (system === 'metric') {
      if (km < 1) {
        return `${Math.round(km * 1000)} ${units.metric.m}`;
      }
      return `${km.toFixed(1)} ${units.metric.km}`;
    } else {
      const miles = km * 0.621371;
      return `${miles.toFixed(1)} ${units.imperial.mi}`;
    }
  }

  /**
   * 格式温度
   */
  function formatTemperature(celsius, system = 'celsius') {
    const lang = getCurrentLang();
    const units = LOCALIZE_CONFIG.units.temperature;

    if (system === 'fahrenheit') {
      const fahrenheit = celsius * 9 / 5 + 32;
      return `${fahrenheit.toFixed(0)}°F`;
    }
    return `${celsius.toFixed(0)}°C`;
  }

  /**
   * 转换温度
   */
  function convertTemperature(value, from, to) {
    if (from === to) return value;
    if (from === 'celsius' && to === 'fahrenheit') {
      return value * 9 / 5 + 32;
    }
    if (from === 'fahrenheit' && to === 'celsius') {
      return (value - 32) * 5 / 9;
    }
    return value;
  }

  /**
   * 格式体重/重量
   */
  function formatWeight(kg, system = 'metric') {
    const lang = getCurrentLang();
    const units = LOCALIZE_CONFIG.units.weight;

    if (system === 'metric') {
      if (kg < 1) {
        return `${Math.round(kg * 1000)} ${units.metric.g}`;
      }
      return `${kg.toFixed(1)} ${units.metric.kg}`;
    } else {
      const pounds = kg * 2.20462;
      return `${pounds.toFixed(1)} ${units.imperial.lb}`;
    }
  }

  /**
   * 格式体积
   */
  function formatVolume(liters, system = 'metric') {
    const units = LOCALIZE_CONFIG.units.volume;

    if (system === 'metric') {
      return `${liters.toFixed(1)} ${units.metric.L}`;
    } else {
      const gallons = liters * 0.264172;
      return `${gallons.toFixed(1)} ${units.imperial.gal}`;
    }
  }

  // ==================== 数字格式化 ====================

  /**
   * 格式化数字
   */
  function formatNumber(num, decimals = 2, locale = null) {
    locale = locale || getCurrentLocale();
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  }

  /**
   * 格式化百分比
   */
  function formatPercent(num, decimals = 0, locale = null) {
    locale = locale || getCurrentLocale();
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num / 100);
  }

  // ==================== 导出 ====================

  // 创建全局本地化对象
  window.Localizer = {
    // 货币
    formatCurrency,
    convertCurrency,
    getCurrencySymbol,
    formatPrice,

    // 日期时间
    formatDate,
    formatRelativeTime,
    getWorldClockTime,
    getTimezoneOffset,
    getCurrentTimezone,

    // 度量单位
    formatDistance,
    formatTemperature,
    convertTemperature,
    formatWeight,
    formatVolume,

    // 数字
    formatNumber,
    formatPercent,

    // 工具
    getCurrentLang,
    getCurrentLocale,
    CONFIG: LOCALIZE_CONFIG
  };

})();
