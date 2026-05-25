/**
 * 游导学习笔记 - 精致化5.0 内容度量工具
 * 章节阅读完成率、闪卡翻转完成率、刷题正确率趋势、AI高频问题统计、资料包页停留时长
 */
(function() {
  'use strict';

  // ========== 度量配置 ==========
  const METRICS_CONFIG = {
    // 数据保留天数
    RETENTION_DAYS: 30,
    
    // 采样率（用于减少存储）
    SAMPLING_RATE: 1, // 100%采样
    
    // 批量保存阈值
    BATCH_SIZE: 10
  };

  // ========== 内容度量器 ==========
  const ContentMetrics = {
    // 待保存的事件
    pendingEvents: [],
    
    // 初始化
    init() {
      // 绑定自动追踪
      this.bindAutoTrack();
      
      // 定期保存pending事件
      setInterval(() => this.flush(), 5000);
      
      // 页面离开时保存
      window.addEventListener('beforeunload', () => this.flush());
    },
    
    // ========== 阅读度量 ==========
    trackChapterRead(chapterId, data = {}) {
      this.addEvent({
        type: 'chapter_read',
        chapterId,
        scrollDepth: data.scrollDepth || 0,
        timeSpent: data.timeSpent || 0,
        completed: data.completed || false,
        timestamp: Date.now()
      });
      
      // 更新章节进度
      this.updateChapterProgress(chapterId, data);
    },
    
    // 更新章节进度
    updateChapterProgress(chapterId, data) {
      try {
        const key = 'chapter_metrics';
        const existing = JSON.parse(localStorage.getItem(key) || '{}');
        
        existing[chapterId] = {
          readCount: (existing[chapterId]?.readCount || 0) + 1,
          lastRead: Date.now(),
          scrollDepth: data.scrollDepth || 0,
          completed: data.completed || existing[chapterId]?.completed || false,
          totalTime: (existing[chapterId]?.totalTime || 0) + (data.timeSpent || 0)
        };
        
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (e) {}
    },
    
    // 获取章节完成率
    getChapterCompletionRate() {
      try {
        const metrics = JSON.parse(localStorage.getItem('chapter_metrics') || '{}');
        const total = this.getChapterTotal();
        
        if (total === 0) return { completed: 0, total: 0, rate: 0 };
        
        const completed = Object.values(metrics).filter(c => c.completed).length;
        
        return {
          completed,
          total,
          rate: ((completed / total) * 100).toFixed(1)
        };
      } catch (e) {
        return { completed: 0, total: 0, rate: 0 };
      }
    },
    
    // 获取章节总数（需要根据实际数据调整）
    getChapterTotal() {
      // 笔试4科 + 面试3部分
      return 7;
    },
    
    // ========== 闪卡度量 ==========
    trackFlashcardFlip(cardId, data = {}) {
      this.addEvent({
        type: 'flashcard_flip',
        cardId,
        timestamp: Date.now()
      });
      
      // 更新闪卡进度
      this.updateFlashcardProgress(cardId, data);
    },
    
    // 更新闪卡进度
    updateFlashcardProgress(cardId, data) {
      try {
        const key = 'flashcard_metrics';
        const existing = JSON.parse(localStorage.getItem(key) || '{}');
        
        existing[cardId] = {
          flipCount: (existing[cardId]?.flipCount || 0) + 1,
          lastFlip: Date.now(),
          marked: data.marked || existing[cardId]?.marked || false
        };
        
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (e) {}
    },
    
    // 获取闪卡翻转完成率
    getFlashcardCompletionRate() {
      try {
        const metrics = JSON.parse(localStorage.getItem('flashcard_metrics') || '{}');
        const keys = Object.keys(metrics);
        
        if (keys.length === 0) return { flipped: 0, total: 0, rate: 0 };
        
        const flipped = keys.length;
        // 假设总数（需要根据实际数据调整）
        const total = 100;
        
        return {
          flipped,
          total,
          rate: ((flipped / total) * 100).toFixed(1)
        };
      } catch (e) {
        return { flipped: 0, total: 0, rate: 0 };
      }
    },
    
    // ========== 刷题度量 ==========
    trackQuizAnswer(questionId, data = {}) {
      this.addEvent({
        type: 'quiz_answer',
        questionId,
        correct: data.correct || false,
        timestamp: Date.now()
      });
      
      // 更新刷题统计
      this.updateQuizStats(data);
    },
    
    // 更新刷题统计
    updateQuizStats(data) {
      try {
        const key = 'quiz_stats';
        const existing = JSON.parse(localStorage.getItem(key) || '{}');
        
        existing.total = (existing.total || 0) + 1;
        existing.correct = (existing.correct || 0) + (data.correct ? 1 : 0);
        existing.lastQuiz = Date.now();
        
        // 计算趋势（最近50题正确率）
        this.updateQuizTrend(data.correct);
        
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (e) {}
    },
    
    // 更新刷题趋势
    updateQuizTrend(isCorrect) {
      try {
        const key = 'quiz_trend';
        let trend = JSON.parse(localStorage.getItem(key) || '[]');
        
        trend.push({
          correct: isCorrect,
          timestamp: Date.now()
        });
        
        // 只保留最近50条
        if (trend.length > 50) {
          trend = trend.slice(-50);
        }
        
        localStorage.setItem(key, JSON.stringify(trend));
      } catch (e) {}
    },
    
    // 获取刷题正确率趋势
    getQuizAccuracyTrend() {
      try {
        const trend = JSON.parse(localStorage.getItem('quiz_trend') || '[]');
        
        if (trend.length === 0) return { recent: 0, history: [] };
        
        const recent = trend.slice(-10);
        const recentCorrect = recent.filter(t => t.correct).length;
        
        return {
          recent: ((recentCorrect / recent.length) * 100).toFixed(1),
          history: trend.map(t => t.correct ? 1 : 0)
        };
      } catch (e) {
        return { recent: 0, history: [] };
      }
    },
    
    // 获取刷题统计
    getQuizStats() {
      try {
        const stats = JSON.parse(localStorage.getItem('quiz_stats') || '{}');
        
        return {
          total: stats.total || 0,
          correct: stats.correct || 0,
          accuracy: stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : 0
        };
      } catch (e) {
        return { total: 0, correct: 0, accuracy: 0 };
      }
    },
    
    // ========== AI使用度量 ==========
    trackAIQuestion(question, data = {}) {
      this.addEvent({
        type: 'ai_question',
        questionLength: question.length,
        timestamp: Date.now()
      });
      
      // 记录高频关键词
      this.trackAIKeywords(question);
    },
    
    // 追踪AI高频关键词
    trackAIKeywords(question) {
      try {
        const key = 'ai_keywords';
        const keywords = JSON.parse(localStorage.getItem(key) || '{}');
        
        // 简单分词（中文）
        const words = question.match(/[\u4e00-\u9fa5]{2,}/g) || [];
        
        words.forEach(word => {
          if (word.length >= 2) {
            keywords[word] = (keywords[word] || 0) + 1;
          }
        });
        
        // 限制数量
        const sorted = Object.entries(keywords).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 50) {
          const trimmed = sorted.slice(0, 50);
          const result = {};
          trimmed.forEach(([k, v]) => result[k] = v);
          localStorage.setItem(key, JSON.stringify(result));
        } else {
          localStorage.setItem(key, JSON.stringify(keywords));
        }
      } catch (e) {}
    },
    
    // 获取AI高频问题
    getAIHotQuestions() {
      try {
        const keywords = JSON.parse(localStorage.getItem('ai_keywords') || '{}');
        
        return Object.entries(keywords)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([word, count]) => ({ word, count }));
      } catch (e) {
        return [];
      }
    },
    
    // ========== 页面停留度量 ==========
    trackPageView(pageId) {
      this.addEvent({
        type: 'page_view',
        pageId,
        enterTime: Date.now()
      });
    },
    
    trackPageLeave(pageId, enterTime) {
      const duration = Date.now() - enterTime;
      
      this.addEvent({
        type: 'page_leave',
        pageId,
        duration
      });
      
      // 更新页面停留统计
      this.updatePageStayStats(pageId, duration);
    },
    
    // 更新页面停留统计
    updatePageStayStats(pageId, duration) {
      try {
        const key = 'page_stay';
        const existing = JSON.parse(localStorage.getItem(key) || '{}');
        
        if (!existing[pageId]) {
          existing[pageId] = { total: 0, count: 0 };
        }
        
        existing[pageId].total += duration;
        existing[pageId].count += 1;
        
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (e) {}
    },
    
    // 获取资料包页面停留时长
    getPackageStayTime() {
      try {
        const stats = JSON.parse(localStorage.getItem('page_stay') || '{}');
        const packageStats = stats['resources.html'] || stats['package'];
        
        if (!packageStats) return { avg: 0, count: 0 };
        
        return {
          avg: Math.round(packageStats.total / packageStats.count / 1000), // 秒
          count: packageStats.count
        };
      } catch (e) {
        return { avg: 0, count: 0 };
      }
    },
    
    // ========== 通用事件处理 ==========
    addEvent(event) {
      // 采样
      if (Math.random() > METRICS_CONFIG.SAMPLING_RATE) return;
      
      this.pendingEvents.push(event);
      
      if (this.pendingEvents.length >= METRICS_CONFIG.BATCH_SIZE) {
        this.flush();
      }
    },
    
    // 保存事件
    flush() {
      if (this.pendingEvents.length === 0) return;
      
      try {
        const key = 'metrics_events';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        
        // 合并事件
        const events = [...existing, ...this.pendingEvents];
        
        // 限制数量
        if (events.length > 500) {
          events.splice(0, events.length - 500);
        }
        
        localStorage.setItem(key, JSON.stringify(events));
        this.pendingEvents = [];
      } catch (e) {}
    },
    
    // ========== 自动绑定 ==========
    bindAutoTrack() {
      // 阅读完成检测
      const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollDepth = Math.round((scrollTop / scrollHeight) * 100);
        
        // 阅读超过80%视为完成
        if (scrollDepth >= 80) {
          const chapterId = this.getCurrentChapterId();
          if (chapterId) {
            this.trackChapterRead(chapterId, { scrollDepth, completed: true });
          }
        }
      };
      
      // 防抖处理
      let scrollTimer;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(handleScroll, 1000);
      });
      
      // 页面离开检测
      window.addEventListener('beforeunload', () => {
        const chapterId = this.getCurrentChapterId();
        if (chapterId) {
          const enterTime = parseInt(sessionStorage.getItem(`enter_${chapterId}`) || Date.now());
          this.trackPageLeave(chapterId, enterTime);
        }
      });
      
      // AI问题提交检测
      document.addEventListener('submit', (e) => {
        const form = e.target;
        if (form.id?.includes('ai') || form.classList.contains('ai-form')) {
          const input = form.querySelector('input[type="text"], textarea');
          if (input?.value) {
            this.trackAIQuestion(input.value);
          }
        }
      });
      
      // 刷题答案检测
      document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-answer], .quiz-option, .option-item');
        if (target) {
          const isCorrect = target.dataset.correct === 'true' || target.classList.contains('correct');
          const questionId = target.dataset.question || target.closest('[data-question-id]')?.dataset.questionId;
          if (questionId) {
            this.trackQuizAnswer(questionId, { correct: isCorrect });
          }
        }
      });
    },
    
    // 获取当前章节ID
    getCurrentChapterId() {
      // 从URL提取
      const path = window.location.pathname;
      const match = path.match(/ch(\d+)/);
      return match ? match[0] : path.split('/').pop().replace('.html', '');
    },
    
    // ========== 数据展示 ==========
    // 获取仪表盘数据
    getDashboard() {
      return {
        chapter: this.getChapterCompletionRate(),
        flashcard: this.getFlashcardCompletionRate(),
        quiz: this.getQuizStats(),
        quizTrend: this.getQuizAccuracyTrend(),
        aiHot: this.getAIHotQuestions(),
        packageStay: this.getPackageStayTime()
      };
    },
    
    // 渲染仪表盘
    renderDashboard(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const data = this.getDashboard();
      
      container.innerHTML = `
        <div class="metrics-dashboard">
          <div class="metrics-title">📊 学习数据</div>
          
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-icon">📖</div>
              <div class="metric-content">
                <div class="metric-value">${data.chapter.rate}%</div>
                <div class="metric-label">章节完成率</div>
                <div class="metric-detail">${data.chapter.completed}/${data.chapter.total}章</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">🃏</div>
              <div class="metric-content">
                <div class="metric-value">${data.flashcard.rate}%</div>
                <div class="metric-label">闪卡翻转率</div>
                <div class="metric-detail">${data.flashcard.flipped}张</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">✍️</div>
              <div class="metric-content">
                <div class="metric-value">${data.quiz.accuracy}%</div>
                <div class="metric-label">刷题正确率</div>
                <div class="metric-detail">${data.quiz.total}题</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">⏱️</div>
              <div class="metric-content">
                <div class="metric-value">${data.packageStay.avg}秒</div>
                <div class="metric-label">资料包停留</div>
                <div class="metric-detail">${data.packageStay.count}次</div>
              </div>
            </div>
          </div>
          
          ${data.aiHot.length > 0 ? `
            <div class="ai-hot-section">
              <div class="section-title">🔥 AI高频问题</div>
              <div class="hot-tags">
                ${data.aiHot.map(item => `
                  <span class="hot-tag">${item.word} <span class="hot-count">${item.count}</span></span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
      
      // 注入样式
      this.injectStyles();
    },
    
    // 注入样式
    injectStyles() {
      if (document.getElementById('content-metrics-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'content-metrics-styles';
      style.textContent = `
        .metrics-dashboard {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 20px;
        }
        .metrics-title {
          font-size: 1rem;
          font-weight: 700;
          color: #0D9488;
          margin-bottom: 16px;
          text-align: center;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .metric-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #F0FDFA;
          border-radius: 12px;
          padding: 14px;
        }
        .metric-icon {
          font-size: 1.6rem;
        }
        .metric-value {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0D9488;
        }
        .metric-label {
          font-size: 0.75rem;
          color: #666;
        }
        .metric-detail {
          font-size: 0.7rem;
          color: #999;
        }
        .ai-hot-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #F0F0F0;
        }
        .section-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
        }
        .hot-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .hot-tag {
          background: #CCFBF1;
          color: #333;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.78rem;
        }
        .hot-count {
          color: #0D9488;
          font-weight: 700;
        }
      `;
      document.head.appendChild(style);
    },
    
    // 清理过期数据
    cleanExpired() {
      const now = Date.now();
      const maxAge = METRICS_CONFIG.RETENTION_DAYS * 24 * 60 * 60 * 1000;
      
      try {
        // 清理事件数据
        const events = JSON.parse(localStorage.getItem('metrics_events') || '[]');
        const filtered = events.filter(e => now - e.timestamp < maxAge);
        localStorage.setItem('metrics_events', JSON.stringify(filtered));
        
        // 清理趋势数据
        const trend = JSON.parse(localStorage.getItem('quiz_trend') || '[]');
        const filteredTrend = trend.filter(t => now - t.timestamp < maxAge);
        localStorage.setItem('quiz_trend', JSON.stringify(filteredTrend));
      } catch (e) {}
    }
  };

  // ========== 暴露到全局 ==========
  window.ContentMetrics = ContentMetrics;
  window.METRICS_CONFIG = METRICS_CONFIG;

  // ========== 自动初始化 ==========
  document.addEventListener('DOMContentLoaded', () => {
    ContentMetrics.init();
    
    // 每天清理一次过期数据
    const lastClean = localStorage.getItem('metrics_last_clean');
    if (!lastClean || Date.now() - parseInt(lastClean) > 24 * 60 * 60 * 1000) {
      ContentMetrics.cleanExpired();
      localStorage.setItem('metrics_last_clean', Date.now().toString());
    }
  });

})();
