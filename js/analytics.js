/**
 * 网站增长数据追踪 v10-0 (精致化5.0-W批次)
 * 功能：
 * 1. 关键按钮点击埋点 (data-track)
 * 2. 工具使用计数 (localStorage)
 * 3. 退出页识别与优化建议
 * 4. 学习数据统计
 * 5. localStorage版本控制与容量检测
 * 6. 页面停留时间追踪
 * 7. 退出率分析与优化方向
 * 8. 关键按钮点击热力图数据收集
 * 9. 首页跳出率监控 (精致化4.0)
 * 10. 平均停留时长监控 (精致化4.0)
 * 11. AI助手使用率追踪 (精致化4.0)
 * 12. 免费→资料包转化率追踪 (精致化4.0)
 * 13. 资料包→加微信转化率追踪 (精致化4.0)
 * 14. 页面生命周期管理 (精致化4.0)
 * 15. 章节阅读完成率追踪 (精致化5.0)
 * 16. 闪卡翻转完成率追踪 (精致化5.0)
 * 17. 刷题正确率趋势追踪 (精致化5.0)
 * 18. AI高频问题统计 (精致化5.0)
 * 19. 资料包页停留时长追踪 (精致化5.0)
 * 20. 转化漏斗全链路追踪 (精致化5.0-W批次)
 */

(function() {
  'use strict';
  
  const STORAGE_VERSION = '3.0.0';
  const STORAGE_KEY = 'site_analytics_v5';
  
  // 内存回退存储
  let memoryStorage = {};
  let useMemoryFallback = false;
  
  // 带try/catch的安全localStorage操作
  function safeGetItem(key) {
    try {
      if (useMemoryFallback) return memoryStorage[key] ? JSON.parse(JSON.stringify(memoryStorage[key])) : null;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('localStorage读取失败，使用内存回退:', e.message);
      useMemoryFallback = true;
      return memoryStorage[key] ? JSON.parse(JSON.stringify(memoryStorage[key])) : null;
    }
  }
  
  function safeSetItem(key, value) {
    try {
      if (useMemoryFallback) {
        memoryStorage[key] = JSON.parse(JSON.stringify(value));
        return true;
      }
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('localStorage写入失败，使用内存回退:', e.message);
      useMemoryFallback = true;
      memoryStorage[key] = JSON.parse(JSON.stringify(value));
      return false;
    }
  }

  // 初始化localStorage数据结构（带版本控制）
  function initStorage() {
    const existing = safeGetItem(STORAGE_KEY);
    
    if (!existing || existing.version !== STORAGE_VERSION) {
      const newData = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        tool_usage: {},
        page_views: {},
        cta_clicks: {},
        button_clicks: {},
        last_page: null,
        first_visit: null,
        // 停留时间统计
        page_stay_time: {},
        // 平均停留时长 (精致化4.0)
        engagement_stats: {
          total_engagement_ms: 0,
          page_count: 0,
          avg_engagement_ms: 0,
          homepage_bounces: 0,
          homepage_views: 0,
          bounce_rate: 0
        },
        // 退出页面统计
        exit_pages: {},
        bounce_pages: {},
        // AI助手使用率 (精致化4.0)
        ai_usage: {
          assistant_views: 0,
          questions_asked: 0,
          avg_session_duration: 0,
          usage_rate: 0,
          high_freq_questions: {}, // 高频问题统计 (精致化5.0)
          question_keywords: {}    // 问题关键词统计 (精致化5.0)
        },
        // 转化漏斗 (精致化4.0)
        funnel: {
          free_materials_views: 0,
          free_materials_to_resources: 0,
          resources_to_wechat: 0,
          conversion_free_to_resources: 0,
          conversion_resources_to_wechat: 0,
          materials_page_stay_time: { total: 0, count: 0, avg: 0 } // 资料包页停留时长 (精致化5.0)
        },
        quiz_stats: {
          total: 0,
          correct: 0,
          accuracy: 0,
          history: [],            // 历史记录 (精致化5.0)
          trend: []               // 正确率趋势 (精致化5.0)
        },
        flashcard_stats: {
          viewed: 0,
          mastered: 0,
          review: 0,
          flips: 0,               // 翻转次数 (精致化5.0)
          flip_completion_rate: 0 // 翻转完成率 (精致化5.0)
        },
        chapter_stats: {           // 章节阅读统计 (精致化5.0)
          chapters_read: 0,
          chapters_completed: {},
          completion_rate: 0,
          reading_progress: {}
        },
        timer_usage: 0,
        interview_questions: 0,
        // A/B测试数据
        ab_tests: {
          homepage_cta: { variant_a: 0, variant_b: 0 },
          pricing_display: { original: 0, simplified: 0 }
        }
      };
      safeSetItem(STORAGE_KEY, newData);
      return newData;
    }
    
    return existing;
  }
  
  // 获取统计数据
  function getStats() {
    initStorage();
    const data = safeGetItem(STORAGE_KEY);
    if (data && !data.version) {
      return data;
    }
    return data ? data : {};
  }
  
  // 保存统计数据
  function saveStats(stats) {
    stats.version = STORAGE_VERSION;
    stats.timestamp = Date.now();
    return safeSetItem(STORAGE_KEY, stats);
  }
  
  // 记录工具使用
  function trackToolUsage(toolName) {
    var stats = getStats();
    if (!stats.tool_usage) stats.tool_usage = {};
    stats.tool_usage[toolName] = (stats.tool_usage[toolName] || 0) + 1;
    saveStats(stats);
  }
  
  // 记录页面访问
  function trackPageView(pageName) {
    var stats = getStats();
    if (!stats.page_views) stats.page_views = {};
    stats.page_views[pageName] = (stats.page_views[pageName] || 0) + 1;
    stats.last_page = pageName;
    if (!stats.first_visit) {
      stats.first_visit = new Date().toISOString();
    }
    
    // 首页访问统计 (精致化4.0)
    if (pageName === 'index.html' || pageName === 'index' || pageName === '') {
      if (!stats.engagement_stats) stats.engagement_stats = {};
      stats.engagement_stats.homepage_views++;
    }
    
    // AI助手访问统计 (精致化4.0)
    if (pageName.includes('ai-assistant') || pageName.includes('chat')) {
      if (!stats.ai_usage) stats.ai_usage = {};
      stats.ai_usage.assistant_views++;
    }
    
    // 免费资料页访问 (精致化4.0)
    if (pageName.includes('free-materials') || pageName.includes('resources')) {
      if (!stats.funnel) stats.funnel = {};
      stats.funnel.free_materials_views++;
    }
    
    saveStats(stats);
  }
  
  // 记录关键按钮点击（增强版）
  function trackClick(btnName, context) {
    var stats = getStats();
    if (!stats.cta_clicks) stats.cta_clicks = {};
    if (!stats.button_clicks) stats.button_clicks = {};
    
    stats.cta_clicks[btnName] = (stats.cta_clicks[btnName] || 0) + 1;
    
    // 记录按钮点击上下文
    var clickKey = btnName + '|' + (context || 'default');
    stats.button_clicks[clickKey] = (stats.button_clicks[clickKey] || 0) + 1;
    
    // 转化追踪 - 免费→资料包 (精致化4.0)
    if (btnName.includes('免费') || btnName.includes('资料') || btnName.includes('resource')) {
      if (!stats.funnel) stats.funnel = {};
      stats.funnel.free_materials_to_resources++;
      if (stats.funnel.free_materials_views > 0) {
        stats.funnel.conversion_free_to_resources = Math.round(
          (stats.funnel.free_materials_to_resources / stats.funnel.free_materials_views) * 100
        );
      }
    }
    
    // 转化追踪 - 资料包→加微信 (精致化4.0)
    if (btnName.includes('微信') || btnName.includes('ximao') || btnName.includes('wechat')) {
      if (!stats.funnel) stats.funnel = {};
      stats.funnel.resources_to_wechat++;
      if (stats.funnel.free_materials_to_resources > 0) {
        stats.funnel.conversion_resources_to_wechat = Math.round(
          (stats.funnel.resources_to_wechat / stats.funnel.free_materials_to_resources) * 100
        );
      }
    }
    
    saveStats(stats);
  }
  
  // 追踪AI问题 (精致化4.0)
  function trackAIQuestion(questionText) {
    var stats = getStats();
    if (!stats.ai_usage) stats.ai_usage = {};
    stats.ai_usage.questions_asked++;
    
    // 高频问题统计 (精致化5.0)
    if (questionText) {
      // 提取关键词
      var keywords = extractKeywords(questionText);
      keywords.forEach(function(kw) {
        stats.ai_usage.question_keywords[kw] = (stats.ai_usage.question_keywords[kw] || 0) + 1;
      });
      
      // 记录问题原文（模糊匹配）
      var questionKey = questionText.substring(0, 30);
      stats.ai_usage.high_freq_questions[questionKey] = (stats.ai_usage.high_freq_questions[questionKey] || 0) + 1;
    }
    
    saveStats(stats);
  }
  
  // 提取关键词
  function extractKeywords(text) {
    var stopWords = ['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '怎么', '什么', '如何', '吗', '呢', '吧', '啊', '吗'];
    var words = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ').split(/\s+/);
    return words.filter(function(w) { 
      return w.length >= 2 && stopWords.indexOf(w) === -1; 
    }).slice(0, 3);
  }
  
  // 获取AI高频问题 (精致化5.0)
  function getAIHighFreqQuestions(limit) {
    var stats = getStats();
    var questions = stats.ai_usage && stats.ai_usage.high_freq_questions || {};
    var sorted = Object.entries(questions)
      .sort(function(a, b) { return b[1] - a[1]; })
      .slice(0, limit || 10);
    return sorted.map(function(item) { return { question: item[0], count: item[1] }; });
  }
  
  // 获取AI高频关键词 (精致化5.0)
  function getAIHighFreqKeywords(limit) {
    var stats = getStats();
    var keywords = stats.ai_usage && stats.ai_usage.question_keywords || {};
    var sorted = Object.entries(keywords)
      .sort(function(a, b) { return b[1] - a[1]; })
      .slice(0, limit || 20);
    return sorted.map(function(item) { return { keyword: item[0], count: item[1] }; });
  }
  
  // 记录页面停留时间
  function trackStayTime(pageName, durationSeconds) {
    var stats = getStats();
    if (!stats.page_stay_time) stats.page_stay_time = {};
    if (!stats.engagement_stats) stats.engagement_stats = {};
    
    var pageData = stats.page_stay_time[pageName] || { total: 0, count: 0, avg: 0 };
    pageData.total += durationSeconds;
    pageData.count += 1;
    pageData.avg = Math.round(pageData.total / pageData.count);
    
    // 标记高停留时间页面（用户可能遇到问题）
    if (pageData.avg > 300) {
      pageData.long_stay = true;
    }
    
    stats.page_stay_time[pageName] = pageData;
    
    // 资料包页停留时长追踪 (精致化5.0)
    if (pageName.includes('free-materials') || pageName.includes('resources')) {
      if (!stats.funnel) stats.funnel = {};
      if (!stats.funnel.materials_page_stay_time) {
        stats.funnel.materials_page_stay_time = { total: 0, count: 0, avg: 0 };
      }
      stats.funnel.materials_page_stay_time.total += durationSeconds;
      stats.funnel.materials_page_stay_time.count++;
      stats.funnel.materials_page_stay_time.avg = Math.round(
        stats.funnel.materials_page_stay_time.total / stats.funnel.materials_page_stay_time.count
      );
    }
    
    // 更新全局平均停留时长 (精致化4.0)
    stats.engagement_stats.total_engagement_ms += durationSeconds * 1000;
    stats.engagement_stats.page_count++;
    stats.engagement_stats.avg_engagement_ms = Math.round(
      stats.engagement_stats.total_engagement_ms / stats.engagement_stats.page_count
    );
    
    // 首页跳出判断 (精致化4.0)
    if ((pageName === 'index.html' || pageName === 'index' || pageName === '') && durationSeconds < 10) {
      stats.engagement_stats.homepage_bounces++;
    }
    
    // 计算首页跳出率
    if (stats.engagement_stats.homepage_views > 0) {
      stats.engagement_stats.bounce_rate = Math.round(
        (stats.engagement_stats.homepage_bounces / stats.engagement_stats.homepage_views) * 100
      );
    }
    
    // 更新AI助手平均会话时长 (精致化4.0)
    if (pageName.includes('ai-assistant') || pageName.includes('chat')) {
      if (!stats.ai_usage.session_durations) stats.ai_usage.session_durations = [];
      stats.ai_usage.session_durations.push(durationSeconds);
      var recentSessions = stats.ai_usage.session_durations.slice(-10);
      stats.ai_usage.avg_session_duration = Math.round(
        recentSessions.reduce(function(a, b) { return a + b; }, 0) / recentSessions.length
      );
    }
    
    saveStats(stats);
  }
  
  // 记录退出页面
  function trackExitPage(pageName) {
    var stats = getStats();
    if (!stats.exit_pages) stats.exit_pages = {};
    stats.exit_pages[pageName] = (stats.exit_pages[pageName] || 0) + 1;
    saveStats(stats);
  }
  
  // 章节阅读完成率追踪 (精致化5.0)
  function trackChapterProgress(chapterId, progress, completed) {
    var stats = getStats();
    if (!stats.chapter_stats) {
      stats.chapter_stats = {
        chapters_read: 0,
        chapters_completed: {},
        completion_rate: 0,
        reading_progress: {}
      };
    }
    
    stats.chapter_stats.reading_progress[chapterId] = progress;
    
    if (completed) {
      stats.chapter_stats.chapters_completed[chapterId] = true;
      var completedCount = Object.keys(stats.chapter_stats.chapters_completed).length;
      stats.chapter_stats.chapters_read = completedCount;
      // 假设总共9个章节
      stats.chapter_stats.completion_rate = Math.round((completedCount / 9) * 100);
    }
    
    saveStats(stats);
  }
  
  // 获取章节阅读完成率 (精致化5.0)
  function getChapterCompletionRate() {
    var stats = getStats();
    var chapterStats = stats.chapter_stats || {};
    return {
      completed: Object.keys(chapterStats.chapters_completed || {}).length,
      total: 9,
      rate: chapterStats.completion_rate || 0,
      progress: chapterStats.reading_progress || {}
    };
  }
  
  // 闪卡翻转完成率追踪 (精致化5.0)
  function trackFlashcardFlip(flipped, total) {
    var stats = getStats();
    if (!stats.flashcard_stats) {
      stats.flashcard_stats = {
        viewed: 0,
        mastered: 0,
        review: 0,
        flips: 0,
        flip_completion_rate: 0
      };
    }
    
    stats.flashcard_stats.flips++;
    
    if (flipped !== undefined && total !== undefined) {
      stats.flashcard_stats.flip_completion_rate = Math.round((flipped / total) * 100);
    }
    
    saveStats(stats);
  }
  
  // 获取闪卡翻转完成率 (精致化5.0)
  function getFlashcardFlipRate() {
    var stats = getStats();
    var fcStats = stats.flashcard_stats || {};
    return {
      flips: fcStats.flips || 0,
      completion_rate: fcStats.flip_completion_rate || 0,
      viewed: fcStats.viewed || 0,
      mastered: fcStats.mastered || 0
    };
  }
  
  // 刷题正确率趋势 (精致化5.0)
  function trackQuizAnswerWithTrend(correct, totalInSession) {
    var stats = getStats();
    if (!stats.quiz_stats) {
      stats.quiz_stats = {
        total: 0,
        correct: 0,
        accuracy: 0,
        history: [],
        trend: []
      };
    }
    stats.quiz_stats.total++;
    if (correct) stats.quiz_stats.correct++;
    if (stats.quiz_stats.total > 0) {
      stats.quiz_stats.accuracy = Math.round((stats.quiz_stats.correct / stats.quiz_stats.total) * 100);
    }
    
    // 记录历史批次 (每10题一组)
    if (totalInSession !== undefined) {
      var sessionCorrect = correct ? 1 : 0;
      var existingBatch = stats.quiz_stats.history.filter(function(h) { return h.sessionId === totalInSession; });
      if (existingBatch.length === 0) {
        stats.quiz_stats.history.push({
          sessionId: totalInSession,
          total: 1,
          correct: sessionCorrect,
          accuracy: sessionCorrect * 100,
          timestamp: Date.now()
        });
      } else {
        var batch = existingBatch[0];
        batch.total++;
        batch.correct += sessionCorrect;
        batch.accuracy = Math.round((batch.correct / batch.total) * 100);
      }
      
      // 保持最近20个批次
      if (stats.quiz_stats.history.length > 20) {
        stats.quiz_stats.history = stats.quiz_stats.history.slice(-20);
      }
      
      // 计算趋势 (最近5组平均)
      var recentBatches = stats.quiz_stats.history.slice(-5);
      if (recentBatches.length >= 2) {
        var trend = recentBatches[recentBatches.length - 1].accuracy - recentBatches[0].accuracy;
        stats.quiz_stats.trend = recentBatches.map(function(b) { return b.accuracy; });
        stats.quiz_stats.trend_direction = trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable';
      }
    }
    
    saveStats(stats);
  }
  
  // 获取刷题正确率趋势 (精致化5.0)
  function getQuizAccuracyTrend() {
    var stats = getStats();
    var quizStats = stats.quiz_stats || {};
    return {
      total: quizStats.total || 0,
      correct: quizStats.correct || 0,
      accuracy: quizStats.accuracy || 0,
      history: quizStats.history || [],
      trend: quizStats.trend || [],
      trend_direction: quizStats.trend_direction || 'stable'
    };
  }
  
  // 获取退出率分析
  function getExitRateAnalysis() {
    var stats = getStats();
    var pageViews = stats.page_views || {};
    var exitPages = stats.exit_pages || {};
    
    var analysis = [];
    for (var page in pageViews) {
      var views = pageViews[page] || 0;
      var exits = exitPages[page] || 0;
      var exitRate = views > 0 ? Math.round((exits / views) * 100) : 0;
      
      var recommendations = '';
      if (exitRate > 50) {
        recommendations = '高退出率，建议检查页面内容相关性和加载速度';
      } else if (exitRate > 30) {
        recommendations = '中等退出率，可优化CTA按钮位置或内容质量';
      } else {
        recommendations = '正常退出率';
      }
      
      analysis.push({
        page: page,
        views: views,
        exits: exits,
        exitRate: exitRate,
        recommendation: recommendations
      });
    }
    
    return analysis.sort(function(a, b) { return b.exitRate - a.exitRate; });
  }
  
  // 获取需要优化的页面列表
  function getHighBouncePages() {
    var analysis = getExitRateAnalysis();
    return analysis.filter(function(item) { 
      return item.exitRate > 40 || (item.exits > 10 && item.exitRate > 25); 
    });
  }
  
  // A/B测试分组
  function getABTestVariant(testName) {
    var stats = getStats();
    if (!stats.ab_tests) stats.ab_tests = {};
    if (!stats.ab_tests[testName]) {
      stats.ab_tests[testName] = { variant_a: 0, variant_b: 0 };
    }
    
    var hash = Math.random();
    var variant = hash < 0.5 ? 'variant_a' : 'variant_b';
    stats.ab_tests[testName][variant]++;
    saveStats(stats);
    
    return variant;
  }
  
  // 记录做题统计（兼容旧版本）
  function trackQuizAnswer(correct) {
    trackQuizAnswerWithTrend(correct);
  }
  
  // 记录闪卡使用（兼容旧版本）
  function trackFlashcard(action) {
    var stats = getStats();
    if (!stats.flashcard_stats) {
      stats.flashcard_stats = {
        viewed: 0,
        mastered: 0,
        review: 0,
        flips: 0,
        flip_completion_rate: 0
      };
    }
    if (action === 'view') stats.flashcard_stats.viewed++;
    else if (action === 'master') stats.flashcard_stats.mastered++;
    else if (action === 'review') stats.flashcard_stats.review++;
    saveStats(stats);
  }
  
  // 获取核心指标报告 (精致化5.0增强)
  function getMetricsReport() {
    var stats = getStats();
    var engagement = stats.engagement_stats || {};
    var aiUsage = stats.ai_usage || {};
    var funnel = stats.funnel || {};
    var quizStats = stats.quiz_stats || {};
    var fcStats = stats.flashcard_stats || {};
    var chapterStats = stats.chapter_stats || {};
    
    return {
      // 首页指标
      homepage: {
        views: engagement.homepage_views || 0,
        bounces: engagement.homepage_bounces || 0,
        bounce_rate: engagement.bounce_rate || 0,
        avg_stay_time: engagement.avg_engagement_ms ? Math.round(engagement.avg_engagement_ms / 1000) + '秒' : 'N/A'
      },
      // 全局停留指标
      engagement: {
        avg_time_ms: engagement.avg_engagement_ms || 0,
        avg_time_formatted: formatDuration(engagement.avg_engagement_ms || 0),
        total_pages: engagement.page_count || 0
      },
      // AI助手指标
      ai_assistant: {
        views: aiUsage.assistant_views || 0,
        questions: aiUsage.questions_asked || 0,
        avg_session: aiUsage.avg_session_duration ? aiUsage.avg_session_duration + '秒' : 'N/A',
        usage_rate: stats.page_views ? Math.round((aiUsage.assistant_views / Object.values(stats.page_views).reduce(function(a, b) { return a + b; }, 0)) * 100) + '%' : 'N/A',
        high_freq_keywords: getAIHighFreqKeywords(5)
      },
      // 转化漏斗
      conversion: {
        free_materials_views: funnel.free_materials_views || 0,
        to_resources: funnel.free_materials_to_resources || 0,
        to_wechat: funnel.resources_to_wechat || 0,
        rate_free_to_resources: funnel.conversion_free_to_resources || 0,
        rate_resources_to_wechat: funnel.conversion_resources_to_wechat || 0,
        materials_stay_avg: funnel.materials_page_stay_time ? Math.round(funnel.materials_page_stay_time.avg) + '秒' : 'N/A'
      },
      // 章节阅读完成率 (精致化5.0)
      chapter: {
        completed: chapterStats.chapters_read || 0,
        total: 9,
        rate: chapterStats.completion_rate || 0
      },
      // 闪卡翻转完成率 (精致化5.0)
      flashcard: {
        flips: fcStats.flips || 0,
        completion_rate: fcStats.flip_completion_rate || 0,
        viewed: fcStats.viewed || 0,
        mastered: fcStats.mastered || 0
      },
      // 刷题正确率趋势 (精致化5.0)
      quiz: {
        total: quizStats.total || 0,
        correct: quizStats.correct || 0,
        accuracy: quizStats.accuracy || 0,
        trend: quizStats.trend || [],
        trend_direction: quizStats.trend_direction || 'stable'
      }
    };
  }
  
  // 格式化时长
  function formatDuration(ms) {
    if (ms < 1000) return '<1秒';
    var seconds = Math.round(ms / 1000);
    if (seconds < 60) return seconds + '秒';
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    return minutes + '分' + remainingSeconds + '秒';
  }
  
  // 数据导出备份
  function exportData() {
    return safeGetItem(STORAGE_KEY);
  }
  
  // 页面进入时间戳
  var pageEnterTime = Date.now();
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var isPageVisible = true;
  
  // 初始化事件监听
  function init() {
    initStorage();
    
    // 记录当前页面
    trackPageView(currentPage);
    
    // 监听data-track属性按钮点击
    document.addEventListener('click', function(e) {
      var target = e.target.closest('[data-track]');
      if (target) {
        var trackName = target.getAttribute('data-track');
        var context = target.getAttribute('data-context') || window.location.pathname;
        
        if (trackName === 'cta') {
          var text = target.textContent.trim().substring(0, 20);
          var href = target.getAttribute('href') || '';
          trackClick(text + '|' + href, context);
        } else {
          trackClick(trackName, context);
        }
      }
      
      // AI提问追踪
      if (e.target.closest('[data-ai-question]')) {
        var questionEl = e.target.closest('[data-ai-question]');
        var questionText = questionEl.getAttribute('data-ai-question') || '';
        trackAIQuestion(questionText);
      }
      
      // 闪卡翻转追踪 (精致化5.0)
      if (e.target.closest('[data-flip-card]')) {
        trackFlashcardFlip();
      }
      
      // 章节完成追踪 (精致化5.0)
      if (e.target.closest('[data-chapter-complete]')) {
        var chapterEl = e.target.closest('[data-chapter-complete]');
        var chapterId = chapterEl.getAttribute('data-chapter-complete');
        trackChapterProgress(chapterId, 100, true);
      }
    });
    
    // 退出页识别 - beforeunload (精致化4.0增强)
    window.addEventListener('beforeunload', function() {
      if (!isPageVisible) return;
      recordPageExit();
    });
    
    // 页面可见性变化 (精致化4.0)
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        isPageVisible = false;
        pauseAnimations();
      } else {
        isPageVisible = true;
        resumeAnimations();
        pageEnterTime = Date.now();
      }
    });
    
    // 页面显示事件 - 从bfcache恢复 (精致化4.0)
    window.addEventListener('pageshow', function(e) {
      if (e.persisted) {
        pageEnterTime = Date.now();
        resumeAnimations();
      }
    });
    
    // 页面隐藏事件 (精致化4.0)
    window.addEventListener('pagehide', function(e) {
      if (!e.persisted) {
        recordPageExit();
        pauseAnimations();
      }
    });
    
    // 工具使用自动追踪
    var path = window.location.pathname;
    if (path.includes('flashcard')) trackToolUsage('flashcard');
    else if (path.includes('exam-simulator')) trackToolUsage('exam');
    else if (path.includes('interview-timer')) trackToolUsage('timer');
    else if (path.includes('voice')) trackToolUsage('voice');
    else if (path.includes('interview')) trackToolUsage('interview');
    else if (path.includes('study-progress')) trackToolUsage('progress');
    else if (path.includes('free-materials') || path.includes('resources')) trackToolUsage('materials');
  }
  
  // 记录页面退出
  function recordPageExit() {
    var stats = getStats();
    var stayDuration = Math.round((Date.now() - pageEnterTime) / 1000);
    
    stats.last_page = currentPage;
    stats.exit_pages = stats.exit_pages || {};
    stats.exit_pages[currentPage] = (stats.exit_pages[currentPage] || 0) + 1;
    
    // 更新停留时间
    if (!stats.page_stay_time) stats.page_stay_time = {};
    var pageData = stats.page_stay_time[currentPage] || { total: 0, count: 0, avg: 0 };
    pageData.total += stayDuration;
    pageData.count += 1;
    pageData.avg = Math.round(pageData.total / pageData.count);
    stats.page_stay_time[currentPage] = pageData;
    
    // 资料包页停留时长追踪 (精致化5.0)
    if (currentPage.includes('free-materials') || currentPage.includes('resources')) {
      if (!stats.funnel) stats.funnel = {};
      if (!stats.funnel.materials_page_stay_time) {
        stats.funnel.materials_page_stay_time = { total: 0, count: 0, avg: 0 };
      }
      stats.funnel.materials_page_stay_time.total += stayDuration;
      stats.funnel.materials_page_stay_time.count++;
      stats.funnel.materials_page_stay_time.avg = Math.round(
        stats.funnel.materials_page_stay_time.total / stats.funnel.materials_page_stay_time.count
      );
    }
    
    saveStats(stats);
  }
  
  // 暂停动画和计时器 (精致化4.0)
  function pauseAnimations() {
    document.body.style.animationPlayState = 'paused';
    document.body.style.webkitAnimationPlayState = 'paused';
    window.dispatchEvent(new CustomEvent('analytics:pause'));
  }
  
  // 恢复动画和计时器 (精致化4.0)
  function resumeAnimations() {
    document.body.style.animationPlayState = 'running';
    document.body.style.webkitAnimationPlayState = 'running';
    window.dispatchEvent(new CustomEvent('analytics:resume'));
  }
  
  // 全局错误处理 (精致化4.0)
  window.addEventListener('error', function(e) {
    if (e.message && !e.message.includes('ResizeObserver') && !e.message.includes('Non-Error')) {
      console.warn('页面错误已捕获:', e.message);
    }
  });
  
  // 暴露全局API
  window.SiteAnalytics = {
    trackToolUsage: trackToolUsage,
    trackPageView: trackPageView,
    trackClick: trackClick,
    trackAIQuestion: trackAIQuestion,
    trackQuizAnswer: trackQuizAnswer,
    trackQuizAnswerWithTrend: trackQuizAnswerWithTrend,
    trackFlashcard: trackFlashcard,
    trackFlashcardFlip: trackFlashcardFlip,
    trackChapterProgress: trackChapterProgress,
    trackStayTime: trackStayTime,
    trackExitPage: trackExitPage,
    getStats: getStats,
    getExitRateAnalysis: getExitRateAnalysis,
    getHighBouncePages: getHighBouncePages,
    getMetricsReport: getMetricsReport,
    getABTestVariant: getABTestVariant,
    getAIHighFreqQuestions: getAIHighFreqQuestions,
    getAIHighFreqKeywords: getAIHighFreqKeywords,
    getChapterCompletionRate: getChapterCompletionRate,
    getFlashcardFlipRate: getFlashcardFlipRate,
    getQuizAccuracyTrend: getQuizAccuracyTrend,
    exportData: exportData,
    pauseAnimations: pauseAnimations,
    resumeAnimations: resumeAnimations
  };
  
  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * 精致化5.0 - 数据驱动优化增强
 * 高退出页面分析原因优化
 * 低使用工具分析原因优化
 * 高转化路径分析成功因素复制
 * 用户反馈分类优先级排序迭代
 */

// 精致化5.0扩展
(function() {
  'use strict';
  
  // 高退出页面监控
  function trackExitPage(pageName) {
    try {
      var data = safeGetItem(STORAGE_KEY) || {};
      data.exit_pages = data.exit_pages || {};
      data.exit_pages[pageName] = (data.exit_pages[pageName] || 0) + 1;
      
      // 计算退出率
      var totalViews = data.page_views[pageName] || 1;
      var exitCount = data.exit_pages[pageName];
      var exitRate = (exitCount / totalViews * 100).toFixed(1);
      
      // 标记高退出率页面（>40%）
      if (exitRate > 40) {
        console.warn('[Analytics] 高退出率页面:', pageName, '退出率:', exitRate + '%');
      }
      
      safeSetItem(STORAGE_KEY, data);
    } catch (e) {
      console.warn('[Analytics] 退出页面追踪失败:', e.message);
    }
  }
  
  // 工具使用率追踪
  function trackToolUsage(toolName, action) {
    try {
      var data = safeGetItem(STORAGE_KEY) || {};
      data.tool_usage = data.tool_usage || {};
      data.tool_usage[toolName] = data.tool_usage[toolName] || { views: 0, actions: 0 };
      
      if (action === 'view') {
        data.tool_usage[toolName].views++;
      } else if (action === 'action') {
        data.tool_usage[toolName].actions++;
      }
      
      // 计算使用率（动作/浏览）
      var tool = data.tool_usage[toolName];
      var usageRate = tool.views > 0 ? (tool.actions / tool.views * 100).toFixed(1) : 0;
      
      // 标记低使用工具（<20%）
      if (usageRate < 20 && tool.views > 10) {
        console.warn('[Analytics] 低使用工具:', toolName, '使用率:', usageRate + '%');
      }
      
      safeSetItem(STORAGE_KEY, data);
    } catch (e) {}
  }
  
  // 转化漏斗追踪增强
  function trackFunnelStep(stepName, nextStep) {
    try {
      var data = safeGetItem(STORAGE_KEY) || {};
      data.funnel = data.funnel || {};
      data.funnel[stepName] = (data.funnel[stepName] || 0) + 1;
      
      // 追踪转化路径
      data.funnel.current_path = data.funnel.current_path || [];
      data.funnel.current_path.push(stepName);
      
      // 如果到达最终转化点，分析路径
      if (nextStep === 'converted') {
        console.log('[Analytics] 成功转化路径:', data.funnel.current_path.join(' → '));
      }
      
      safeSetItem(STORAGE_KEY, data);
    } catch (e) {}
  }
  
  // 用户反馈收集
  function collectFeedback(category, content, rating) {
    try {
      var data = safeGetItem(STORAGE_KEY) || {};
      data.feedback = data.feedback || [];
      
      data.feedback.push({
        category: category,
        content: content,
        rating: rating,
        timestamp: Date.now(),
        page: window.location.pathname
      });
      
      // 保持最近50条反馈
      if (data.feedback.length > 50) {
        data.feedback = data.feedback.slice(-50);
      }
      
      safeSetItem(STORAGE_KEY, data);
      
      // 分类统计
      var categoryCount = {};
      data.feedback.forEach(function(f) {
        categoryCount[f.category] = (categoryCount[f.category] || 0) + 1;
      });
      console.log('[Analytics] 反馈分类统计:', categoryCount);
      
    } catch (e) {}
  }
  
  // 获取分析报告
  window.getAnalyticsReport = function() {
    try {
      var data = safeGetItem(STORAGE_KEY) || {};
      
      var report = {
        // 基础统计
        totalViews: Object.values(data.page_views || {}).reduce(function(a, b) { return a + b; }, 0),
        
        // 高退出率页面（>40%）
        highExitPages: [],
        
        // 低使用工具（<20%）
        lowUsageTools: [],
        
        // 高转化路径
        topPaths: [],
        
        // 用户反馈汇总
        feedbackSummary: {}
      };
      
      // 计算退出率
      if (data.exit_pages && data.page_views) {
        Object.keys(data.exit_pages).forEach(function(page) {
          var views = data.page_views[page] || 1;
          var exits = data.exit_pages[page];
          var rate = (exits / views * 100).toFixed(1);
          if (rate > 40) {
            report.highExitPages.push({ page: page, exitRate: rate + '%', exits: exits });
          }
        });
      }
      
      // 计算工具使用率
      if (data.tool_usage) {
        Object.keys(data.tool_usage).forEach(function(tool) {
          var t = data.tool_usage[tool];
          var rate = t.views > 0 ? (t.actions / t.views * 100).toFixed(1) : 0;
          if (rate < 20 && t.views > 10) {
            report.lowUsageTools.push({ tool: tool, usageRate: rate + '%', views: t.views });
          }
        });
      }
      
      // 反馈汇总
      if (data.feedback) {
        var catCount = {};
        data.feedback.forEach(function(f) {
          catCount[f.category] = (catCount[f.category] || 0) + 1;
        });
        report.feedbackSummary = catCount;
      }
      
      return report;
    } catch (e) {
      return { error: e.message };
    }
  };
  
  // 暴露函数到全局
  window.trackExitPage = trackExitPage;
  window.trackToolUsage = trackToolUsage;
  window.trackFunnelStep = trackFunnelStep;
  window.collectFeedback = collectFeedback;
  
  // 页面卸载前记录退出
  window.addEventListener('beforeunload', function() {
    var pageName = window.location.pathname;
    trackExitPage(pageName);
  });
  
  console.log('[Analytics] 数据驱动优化增强已初始化');
})();
