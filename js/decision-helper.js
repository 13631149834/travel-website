/**
 * 精致化5.0 - 决策简化工具
 * 功能：
 * 1. 每次选择≤3个选项
 * 2. 默认最安全选择
 * 3. 推荐有标记
 * 4. 复杂选择有对比表
 */
(function() {
  'use strict';
  
  // ========== 备考决策场景 ==========
  const STUDY_DECISIONS = {
    // 备考阶段选择
    stage: {
      question: '你现在处于哪个备考阶段',
      options: [
        { id: 'beginner', label: '刚开始备考', desc: '0-30天', recommended: true },
        { id: 'midterm', label: '已经学了一阵', desc: '30-90天' },
        { id: 'review', label: '复习冲刺阶段', desc: '考前30天', recommended: true }
      ]
    },
    
    // 每日学习时长
    time: {
      question: '每天能投入多少时间',
      options: [
        { id: 'short', label: '碎片时间', desc: '30分钟以内', recommended: true },
        { id: 'medium', label: '稳定学习', desc: '1-2小时' },
        { id: 'long', label: '全职备考', desc: '3小时以上' }
      ]
    },
    
    // 学习方式偏好
    style: {
      question: '你更喜欢哪种学习方式',
      options: [
        { id: 'visual', label: '看视频课程', icon: '🎬' },
        { id: 'reading', label: '看文字资料', icon: '📖', recommended: true },
        { id: 'practice', label: '刷题为主', icon: '✏️' }
      ]
    }
  };
  
  // ========== 渲染选择器 ==========
  function renderChoice(containerId, decisionKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const decision = STUDY_DECISIONS[decisionKey];
    if (!decision) return;
    
    let html = '<div class="decision-helper">';
    html += '<p class="decision-question">' + decision.question + '</p>';
    html += '<div class="decision-options">';
    
    decision.options.forEach((opt, idx) => {
      const recommended = opt.recommended ? ' recommended' : '';
      html += '<button class="decision-option' + recommended + '" data-id="' + opt.id + '">';
      if (opt.icon) html += '<span class="option-icon">' + opt.icon + '</span>';
      html += '<span class="option-label">' + opt.label + '</span>';
      if (opt.desc) html += '<span class="option-desc">' + opt.desc + '</span>';
      if (opt.recommended) html += '<span class="option-badge">推荐</span>';
      html += '</button>';
    });
    
    html += '</div></div>';
    container.innerHTML = html;
    
    // 绑定点击事件
    container.querySelectorAll('.decision-option').forEach(btn => {
      btn.addEventListener('click', function() {
        const selected = this.dataset.id;
        const callback = decision.onSelect;
        if (callback) callback(selected);
      });
    });
  }
  
  // ========== 渲染对比表 ==========
  function renderComparison(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '<div class="comparison-table">';
    html += '<table>';
    html += '<thead><tr><th>对比项</th>';
    items.forEach(item => {
      html += '<th>' + item.name + '</th>';
    });
    html += '</tr></thead><tbody>';
    
    const features = items[0] && items[0].features ? Object.keys(items[0].features) : [];
    
    features.forEach(feature => {
      html += '<tr><td>' + feature + '</td>';
      items.forEach(item => {
        const val = item.features[feature];
        html += '<td>' + (typeof val === 'boolean' ? (val ? '✓' : '—') : val) + '</td>';
      });
      html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
  }
  
  // ========== 获取推荐选项 ==========
  function getRecommended(decisionKey) {
    const decision = STUDY_DECISIONS[decisionKey];
    if (!decision) return null;
    return decision.options.find(opt => opt.recommended) || decision.options[0];
  }
  
  // ========== 推荐学习计划 ==========
  function getRecommendedPlan(stage, time, style) {
    const plans = {
      'beginner-short': { focus: '基础知识入门', tools: ['AI助手', '闪卡'], daily: '30分钟' },
      'beginner-medium': { focus: '系统学习理论', tools: ['知识库', '闪卡', '刷题'], daily: '1.5小时' },
      'beginner-long': { focus: '全面系统备考', tools: ['知识库', '刷题', '模拟考试'], daily: '3小时' },
      'midterm-short': { focus: '重点突破', tools: ['错题本', '闪卡'], daily: '45分钟' },
      'midterm-medium': { focus: '巩固提升', tools: ['知识库', '刷题', '闪卡'], daily: '2小时' },
      'review-short': { focus: '高频考点冲刺', tools: ['历年真题', '错题本'], daily: '1小时' },
      'review-medium': { focus: '模拟考试训练', tools: ['模拟考试', '错题复习'], daily: '2小时' },
      'review-long': { focus: '全真模拟+复盘', tools: ['模拟考试', '知识点速记'], daily: '4小时' }
    };
    
    return plans[stage + '-' + time] || plans['beginner-medium'];
  }
  
  // 暴露API
  window.DecisionHelper = {
    renderChoice: renderChoice,
    renderComparison: renderComparison,
    getRecommended: getRecommended,
    getRecommendedPlan: getRecommendedPlan,
    decisions: STUDY_DECISIONS
  };
  
})();
