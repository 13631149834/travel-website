/**
 * 游导旅游智能客服 - 对话记录模块
 * 功能：历史对话查看、对话导出、隐私保护
 */

const ConversationLogger = (function() {
  // 配置
  const config = {
    maxHistoryDays: 90,           // 保留天数
    maxMessagesPerConversation: 500,  // 单次对话最大消息数
    autoSaveInterval: 30000,     // 自动保存间隔(ms)
    enableEncryption: true,      // 是否加密
    exportFormat: ['json', 'txt', 'csv'],
  };

  // 存储键名
  const STORAGE_KEYS = {
    conversations: 'chatbot_conversations',
    userSettings: 'chatbot_user_settings',
    statistics: 'chatbot_statistics',
  };

  // 当前会话数据
  let currentSession = {
    id: null,
    messages: [],
    startTime: null,
    lastActivity: null,
    userInfo: {},
    sentimentHistory: [],
    rating: null,
  };

  // 统计数据
  let statistics = {
    totalConversations: 0,
    totalMessages: 0,
    averageSessionLength: 0,
    lastConversationDate: null,
    intentDistribution: {},
    satisfactionRate: 0,
  };

  /**
   * 初始化会话
   */
  function initSession(userInfo = {}) {
    // 生成会话ID
    currentSession = {
      id: generateSessionId(),
      messages: [],
      startTime: Date.now(),
      lastActivity: Date.now(),
      userInfo: {
        ...userInfo,
        userAgent: navigator.userAgent,
        language: navigator.language,
      },
      sentimentHistory: [],
      rating: null,
    };

    // 保存到存储
    saveCurrentSession();

    return currentSession;
  }

  /**
   * 生成会话ID
   */
  function generateSessionId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 6);
    return `chat_${dateStr}_${random}`;
  }

  /**
   * 添加消息
   */
  function addMessage(type, content, metadata = {}) {
    const message = {
      id: generateMessageId(),
      type, // 'user' | 'bot' | 'system'
      content,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        sessionId: currentSession.id,
      },
    };

    currentSession.messages.push(message);
    currentSession.lastActivity = Date.now();

    // 检查消息数量限制
    if (currentSession.messages.length > config.maxMessagesPerConversation) {
      currentSession.messages = currentSession.messages.slice(-config.maxMessagesPerConversation);
    }

    // 自动保存
    saveCurrentSession();

    return message;
  }

  /**
   * 生成消息ID
   */
  function generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 记录情绪历史
   */
  function recordSentiment(sentiment) {
    currentSession.sentimentHistory.push({
      ...sentiment,
      timestamp: Date.now(),
    });
  }

  /**
   * 设置会话评分
   */
  function setRating(rating, comment = '') {
    currentSession.rating = { rating, comment, timestamp: Date.now() };
    saveCurrentSession();
  }

  /**
   * 保存当前会话
   */
  function saveCurrentSession() {
    try {
      const sessions = getAllSessions();
      
      // 查找并更新或添加
      const index = sessions.findIndex(s => s.id === currentSession.id);
      if (index !== -1) {
        sessions[index] = currentSession;
      } else {
        sessions.push(currentSession);
      }

      // 按时间排序
      sessions.sort((a, b) => b.startTime - a.startTime);

      // 清理过期会话
      cleanupExpiredSessions(sessions);

      // 保存
      const dataToSave = config.enableEncryption 
        ? encrypt(JSON.stringify(sessions))
        : JSON.stringify(sessions);
      
      localStorage.setItem(STORAGE_KEYS.conversations, dataToSave);

      // 更新统计
      updateStatistics();

    } catch (e) {
      console.error('保存会话失败:', e);
    }
  }

  /**
   * 获取所有会话
   */
  function getAllSessions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.conversations);
      if (!stored) return [];

      const data = config.enableEncryption ? decrypt(stored) : stored;
      return JSON.parse(data);
    } catch (e) {
      console.error('读取会话失败:', e);
      return [];
    }
  }

  /**
   * 获取会话列表
   */
  function getSessionList(options = {}) {
    const { page = 1, pageSize = 20, searchKeyword = '' } = options;
    let sessions = getAllSessions();

    // 搜索过滤
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      sessions = sessions.filter(s => 
        s.messages.some(m => m.content.toLowerCase().includes(keyword))
      );
    }

    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedSessions = sessions.slice(start, end);

    return {
      sessions: paginatedSessions.map(s => formatSessionSummary(s)),
      total: sessions.length,
      page,
      pageSize,
      totalPages: Math.ceil(sessions.length / pageSize),
    };
  }

  /**
   * 格式化会话摘要
   */
  function formatSessionSummary(session) {
    const firstMessage = session.messages.find(m => m.type === 'user');
    const lastMessage = session.messages[session.messages.length - 1];
    
    return {
      id: session.id,
      preview: firstMessage ? firstMessage.content.slice(0, 50) + '...' : '新对话',
      lastMessage: lastMessage ? lastMessage.content.slice(0, 30) + '...' : '',
      messageCount: session.messages.length,
      startTime: session.startTime,
      lastActivity: session.lastActivity,
      rating: session.rating,
      duration: session.lastActivity - session.startTime,
    };
  }

  /**
   * 获取会话详情
   */
  function getSessionDetail(sessionId) {
    const sessions = getAllSessions();
    return sessions.find(s => s.id === sessionId);
  }

  /**
   * 获取当前会话
   */
  function getCurrentSession() {
    return { ...currentSession };
  }

  /**
   * 恢复会话
   */
  function resumeSession(sessionId) {
    const session = getSessionDetail(sessionId);
    if (session) {
      currentSession = session;
      return currentSession;
    }
    return null;
  }

  /**
   * 删除会话
   */
  function deleteSession(sessionId) {
    try {
      const sessions = getAllSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      const dataToSave = config.enableEncryption 
        ? encrypt(JSON.stringify(filtered))
        : JSON.stringify(filtered);
      localStorage.setItem(STORAGE_KEYS.conversations, dataToSave);
      return true;
    } catch (e) {
      console.error('删除会话失败:', e);
      return false;
    }
  }

  /**
   * 清空所有会话
   */
  function clearAllSessions() {
    try {
      localStorage.removeItem(STORAGE_KEYS.conversations);
      currentSession = initSession();
      return true;
    } catch (e) {
      console.error('清空会话失败:', e);
      return false;
    }
  }

  /**
   * 清理过期会话
   */
  function cleanupExpiredSessions(sessions) {
    const expireTime = Date.now() - (config.maxHistoryDays * 24 * 60 * 60 * 1000);
    return sessions.filter(s => s.lastActivity > expireTime);
  }

  /**
   * 导出对话
   */
  function exportConversation(sessionId, format = 'json') {
    const session = sessionId ? getSessionDetail(sessionId) : currentSession;
    if (!session) return null;

    switch (format) {
      case 'json':
        return exportAsJSON(session);
      case 'txt':
        return exportAsTXT(session);
      case 'csv':
        return exportAsCSV(session);
      default:
        return exportAsJSON(session);
    }
  }

  /**
   * 导出为JSON
   */
  function exportAsJSON(session) {
    const exportData = {
      exportTime: new Date().toISOString(),
      sessionInfo: {
        id: session.id,
        startTime: new Date(session.startTime).toISOString(),
        endTime: new Date(session.lastActivity).toISOString(),
        duration: session.lastActivity - session.startTime,
      },
      userInfo: session.userInfo,
      statistics: {
        messageCount: session.messages.length,
        rating: session.rating,
      },
      messages: session.messages.map(m => ({
        type: m.type,
        content: m.content,
        timestamp: new Date(m.timestamp).toISOString(),
      })),
      sentimentHistory: session.sentimentHistory,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 导出为TXT
   */
  function exportAsTXT(session) {
    let content = `游导旅游 - 对话记录\n`;
    content += `导出时间: ${new Date().toLocaleString()}\n`;
    content += `会话ID: ${session.id}\n`;
    content += `${'='.repeat(50)}\n\n`;

    session.messages.forEach(m => {
      const time = new Date(m.timestamp).toLocaleTimeString();
      const role = m.type === 'user' ? '用户' : m.type === 'bot' ? '助手' : '系统';
      content += `[${time}] ${role}: ${m.content}\n\n`;
    });

    return content;
  }

  /**
   * 导出为CSV
   */
  function exportAsCSV(session) {
    let content = '时间,角色,消息\n';
    
    session.messages.forEach(m => {
      const time = new Date(m.timestamp).toISOString();
      const role = m.type === 'user' ? '用户' : '助手';
      // 转义引号
      const message = m.content.replace(/"/g, '""');
      content += `"${time}","${role}","${message}"\n`;
    });

    return content;
  }

  /**
   * 下载导出文件
   */
  function downloadExport(sessionId, format = 'json') {
    const content = exportConversation(sessionId, format);
    if (!content) return false;

    const session = getSessionDetail(sessionId) || currentSession;
    const filename = `chatbot_${session.id}_${new Date().toISOString().slice(0, 10)}.${format}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    return true;
  }

  /**
   * 更新统计数据
   */
  function updateStatistics() {
    const sessions = getAllSessions();
    
    statistics = {
      totalConversations: sessions.length,
      totalMessages: sessions.reduce((sum, s) => sum + s.messages.length, 0),
      averageSessionLength: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + s.messages.length, 0) / sessions.length 
        : 0,
      lastConversationDate: sessions.length > 0 
        ? Math.max(...sessions.map(s => s.lastActivity)) 
        : null,
      intentDistribution: {},
      satisfactionRate: calculateSatisfactionRate(sessions),
    };

    // 统计意图分布
    sessions.forEach(s => {
      s.messages.forEach(m => {
        if (m.metadata?.intent) {
          statistics.intentDistribution[m.metadata.intent] = 
            (statistics.intentDistribution[m.metadata.intent] || 0) + 1;
        }
      });
    });

    // 保存统计
    localStorage.setItem(STORAGE_KEYS.statistics, JSON.stringify(statistics));

    return statistics;
  }

  /**
   * 计算满意度
   */
  function calculateSatisfactionRate(sessions) {
    const ratedSessions = sessions.filter(s => s.rating);
    if (ratedSessions.length === 0) return 0;
    
    const totalRating = ratedSessions.reduce((sum, s) => sum + s.rating.rating, 0);
    return (totalRating / (ratedSessions.length * 5)) * 100;
  }

  /**
   * 获取统计数据
   */
  function getStatistics() {
    const stored = localStorage.getItem(STORAGE_KEYS.statistics);
    if (stored) {
      statistics = { ...statistics, ...JSON.parse(stored) };
    }
    return statistics;
  }

  /**
   * 获取用户设置
   */
  function getUserSettings() {
    const stored = localStorage.getItem(STORAGE_KEYS.userSettings);
    return stored ? JSON.parse(stored) : {
      enableHistory: true,
      enableEncryption: true,
      autoSave: true,
      soundEnabled: true,
    };
  }

  /**
   * 保存用户设置
   */
  function saveUserSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.userSettings, JSON.stringify(settings));
    config.enableEncryption = settings.enableEncryption;
  }

  /**
   * 简单加密（基础实现）
   */
  function encrypt(data) {
    // 实际项目中应使用更安全的加密方式
    return btoa(encodeURIComponent(data));
  }

  /**
   * 简单解密
   */
  function decrypt(data) {
    try {
      return decodeURIComponent(atob(data));
    } catch (e) {
      return data;
    }
  }

  /**
   * 生成HTML格式的对话历史
   */
  function generateHTMLHistory(sessionId) {
    const session = getSessionDetail(sessionId);
    if (!session) return '';

    let html = `
      <div class="conversation-history">
        <div class="history-header">
          <h3>对话记录</h3>
          <div class="history-meta">
            <span>开始时间: ${new Date(session.startTime).toLocaleString()}</span>
            <span>消息数: ${session.messages.length}</span>
            ${session.rating ? `<span>评分: ${'⭐'.repeat(session.rating.rating)}</span>` : ''}
          </div>
        </div>
        <div class="history-messages">
    `;

    session.messages.forEach(m => {
      const roleClass = m.type === 'user' ? 'user-message' : 'bot-message';
      const time = new Date(m.timestamp).toLocaleTimeString();
      
      html += `
        <div class="message ${roleClass}">
          <div class="message-header">
            <span class="message-role">${m.type === 'user' ? '您' : '助手'}</span>
            <span class="message-time">${time}</span>
          </div>
          <div class="message-content">${m.content.replace(/\n/g, '<br>')}</div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    return html;
  }

  // 公开API
  return {
    initSession,
    addMessage,
    recordSentiment,
    setRating,
    getCurrentSession,
    getSessionList,
    getSessionDetail,
    resumeSession,
    deleteSession,
    clearAllSessions,
    exportConversation,
    downloadExport,
    getStatistics,
    getUserSettings,
    saveUserSettings,
    generateHTMLHistory,
  };
})();
