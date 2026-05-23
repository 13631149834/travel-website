/**
 * 游导学习笔记 - 精致化5.0 转化漏斗追踪
 * 漏斗5层追踪：搜索进入→浏览免费→使用AI/刷题→查看资料包→加微信
 */
(function() {
  'use strict';

  const FUNNEL_CONFIG = {
    STAGES: [
      { id: 'search_enter', name: '搜索进入', icon: '🔍' },
      { id: 'browse_free', name: '浏览免费', icon: '📖' },
      { id: 'use_tool', name: '使用工具', icon: '🛠️' },
      { id: 'view_package', name: '查看资料包', icon: '📦' },
      { id: 'add_wechat', name: '加微信', icon: '💬' }
    ]
  };

  const FunnelTracker = {
    sessionData: {
      startTime: Date.now(),
      stagesReached: [],
      events: []
    },
    
    init() {
      this.restoreSession();
      this.trackStage(FUNNEL_CONFIG.STAGES[0].id);
      this.bindAutoTrack();
      window.addEventListener('beforeunload', () => this.saveSession());
    },
    
    trackStage(stageId) {
      if (this.sessionData.stagesReached.includes(stageId)) return;
      this.sessionData.stagesReached.push(stageId);
      this.sessionData.lastStage = stageId;
      this.saveSession();
    },
    
    trackEvent(eventType, data = {}) {
      this.sessionData.events.push({
        type: eventType,
        timestamp: Date.now(),
        ...data
      });
      if (this.sessionData.events.length > 100) {
        this.sessionData.events = this.sessionData.events.slice(-100);
      }
    },
    
    saveSession() {
      try {
        localStorage.setItem('funnel_session', JSON.stringify({
          stagesReached: this.sessionData.stagesReached,
          lastStage: this.sessionData.lastStage,
          events: this.sessionData.events.slice(-20)
        }));
      } catch (e) {}
    },
    
    restoreSession() {
      try {
        const saved = localStorage.getItem('funnel_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.lastStageTime && Date.now() - parsed.lastStageTime < 30 * 60 * 1000) {
            this.sessionData.stagesReached = parsed.stagesReached || [];
            this.sessionData.lastStage = parsed.lastStage;
          }
        }
      } catch (e) {}
    },
    
    bindAutoTrack() {
      document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button');
        if (!target) return;
        
        const href = target.href || '';
        const text = target.textContent.trim();
        
        if (href.includes('resources') || text.includes('资料包') || text.includes('全套')) {
          this.trackStage('view_package');
        }
        if (href.includes('ai-assistant') || text.includes('AI助手')) {
          this.trackStage('use_tool');
        }
        if (href.includes('wechat') || text.includes('ximao101')) {
          this.trackStage('add_wechat');
        }
        if (href.includes('knowledge')) {
          this.trackStage('browse_free');
        }
      });
    },
    
    getFunnelData() {
      return {
        currentStage: this.sessionData.lastStage,
        stagesReached: this.sessionData.stagesReached,
        conversionRates: {}
      };
    },
    
    getOptimizationSuggestions() {
      const suggestions = [];
      const stages = this.sessionData.stagesReached;
      
      if (!stages.includes('browse_free')) {
        suggestions.push({ priority: 'high', stage: 'search_enter', suggestion: '优化首屏内容，确保价值主张清晰可见' });
      }
      if (stages.includes('browse_free') && !stages.includes('use_tool')) {
        suggestions.push({ priority: 'medium', stage: 'browse_free', suggestion: '在内容页增加工具入口提示' });
      }
      if (stages.includes('use_tool') && !stages.includes('view_package')) {
        suggestions.push({ priority: 'medium', stage: 'use_tool', suggestion: '在使用工具流程中植入价值锚点' });
      }
      if (stages.includes('view_package') && !stages.includes('add_wechat')) {
        suggestions.push({ priority: 'high', stage: 'view_package', suggestion: '优化资料包页面转化路径' });
      }
      
      return suggestions;
    }
  };

  window.FunnelTracker = FunnelTracker;
  window.FUNNEL_CONFIG = FUNNEL_CONFIG;

  document.addEventListener('DOMContentLoaded', () => {
    FunnelTracker.init();
  });

})();
