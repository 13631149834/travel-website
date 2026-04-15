/**
 * 游导旅游智能客服 - 情感分析模块
 * 功能：用户情绪识别、负面情绪预警、自动转人工
 */

const EmotionAnalyzer = (function() {
  // 情绪词典
  const emotionLexicon = {
    // 正面情绪词
    positive: {
      words: [
        '开心', '高兴', '快乐', '愉快', '满意', '喜欢', '爱', '爱了',
        '期待', '盼望', '兴奋', '激动', '棒', '好', '不错', '很好',
        '完美', '赞', '赞的', '点赞', '优秀', '出色', '太棒了',
        '太感谢', '太给力', '给力', '靠谱', '专业', '贴心',
        '舒服', '舒适', '方便', '快捷', '效率高', '实惠', '划算',
        '推荐', '值得', '物超所值', '惊喜', '幸福', '满足',
      ],
      weight: 1.0,
    },
    
    // 负面情绪词
    negative: {
      words: [
        '生气', '愤怒', '气愤', '恼火', '火大', '发火', '怒',
        '失望', '失望透顶', '彻底失望', '太失望', '心寒',
        '不满', '不满意', '不满意', '差', '太差', '很差',
        '投诉', '要投诉', '举报', '差评', '给差评', '坑',
        '骗', '被骗', '欺诈', '坑人', '黑店', '宰客',
        '垃圾', '太差劲', '无语', '无话可说', '没话说了',
        '郁闷', '烦躁', '烦恼', '糟心', '窝火', '憋屈',
        '后悔', '后悔选择', '再也不来', '拉黑', '差劲',
        '恶心', '恶劣', '态度差', '服务差', '敷衍',
        '不专业', '不靠谱', '欺骗', '虚假', '骗子',
      ],
      weight: 1.5,
    },
    
    // 紧急情绪词
    urgent: {
      words: [
        '紧急', '十万火急', '马上', '立刻', '快点', '赶紧',
        '很急', '非常急', '急死了', '火速', '快', '快点快点',
        '立刻马上', '现在就要', '等不了', '马上要',
      ],
      weight: 2.0,
      type: 'urgent',
    },
    
    // 焦虑情绪词
    worried: {
      words: [
        '担心', '担忧', '害怕', '恐惧', '顾虑', '忧虑', '焦虑',
        '不确定', '犹豫', '纠结', '迷茫', '困惑', '迷糊',
        '害怕', '会不会', '能不能', '可以吗', '行不行',
        '怎么办', '怎么办啊', '好担心', '好害怕',
      ],
      weight: 1.2,
      type: 'worried',
    },
    
    // 悲伤情绪词
    sad: {
      words: [
        '难过', '伤心', '心碎', '痛苦', '悲伤', '哭', '哭泣',
        '泪', '心酸', '心塞', '崩溃', '绝望', '无助',
        '可怜', '心疼', '遗憾', '惋惜', '可惜',
      ],
      weight: 1.3,
      type: 'sad',
    },
    
    // 讽刺/反话
    sarcastic: {
      patterns: [
        /真是.*好啊/, /真不错.*啊/, /可真是.*/, /真是笑死我了/,
        /呵呵/, /我谢谢您/, /可太.*了/, /太.*了吧/,
      ],
      weight: 1.2,
      type: 'sarcastic',
    },
  };

  // 否定词（反转情绪极性）
  const negationWords = [
    '不', '没', '无', '非', '别', '莫', '休', '未', '否', '毫无',
    '不是', '没有', '并非', '绝不会', '绝对不会', '一点也不',
  ];

  // 程度副词（加强/减弱情绪）
  const intensifiers = {
    strong: ['非常', '特别', '极其', '超级', '十分', '格外', '太', '好', '真', '实在', '相当'],
    weak: ['有点', '稍微', '略微', '有些', '不太', '一点', '一丝', '稍稍'],
  };

  // 状态存储
  let emotionHistory = [];
  let currentEmotion = {
    type: 'neutral',
    score: 0,
    intensity: 'normal',
    keywords: [],
    timestamp: Date.now(),
  };

  /**
   * 分析文本情绪
   */
  function analyze(text) {
    if (!text || typeof text !== 'string') {
      return createNeutralResult();
    }

    const normalizedText = text.toLowerCase();
    let scores = {
      positive: 0,
      negative: 0,
      urgent: 0,
      worried: 0,
      sad: 0,
      sarcastic: 0,
    };
    
    let foundKeywords = [];
    let intensifierMultiplier = 1;

    // 检查程度副词
    intensifiers.strong.forEach(word => {
      if (normalizedText.includes(word)) intensifierMultiplier = 1.5;
    });
    intensifiers.weak.forEach(word => {
      if (normalizedText.includes(word)) intensifierMultiplier = 0.7;
    });

    // 检查讽刺模式
    emotionLexicon.sarcastic.patterns.forEach(pattern => {
      if (pattern.test(text)) {
        scores.sarcastic += emotionLexicon.sarcastic.weight * intensifierMultiplier;
      }
    });

    // 遍历各情绪类别
    for (const [emotionType, emotionData] of Object.entries(emotionLexicon)) {
      if (emotionType === 'sarcastic') continue; // 已处理
      
      let hasNegation = false;
      
      emotionData.words.forEach(word => {
        const wordLower = word.toLowerCase();
        if (normalizedText.includes(wordLower)) {
          // 检查否定词
          const wordIndex = normalizedText.indexOf(wordLower);
          for (const negWord of negationWords) {
            const negIndex = normalizedText.lastIndexOf(negWord, wordIndex);
            if (negIndex !== -1 && wordIndex - negIndex < 10) {
              hasNegation = true;
              break;
            }
          }

          let score = emotionData.weight * intensifierMultiplier;
          
          if (hasNegation) {
            // 否定词反转情绪
            if (emotionType === 'negative') {
              // "不生气" -> 正面
              scores.positive += score * 0.5;
              foundKeywords.push({ word, type: 'negative_cancelled' });
            } else if (emotionType === 'positive') {
              // "不开心" -> 负面
              scores.negative += score * 0.8;
              foundKeywords.push({ word, type: 'positive_cancelled' });
            }
          } else {
            scores[emotionType] += score;
            foundKeywords.push({ word, type: emotionType });
          }
        }
      });
    }

    // 确定主导情绪
    const dominantEmotion = determineDominantEmotion(scores);
    
    // 计算情绪分数
    const totalNegative = scores.negative + scores.urgent + scores.worried + scores.sad;
    const totalPositive = scores.positive;
    let sentimentScore = totalPositive - totalNegative;
    
    // 紧急情况特殊处理
    if (scores.urgent > 0) {
      sentimentScore = -10;
    }

    // 更新当前情绪
    currentEmotion = {
      type: dominantEmotion.type,
      score: sentimentScore,
      intensity: dominantEmotion.intensity,
      keywords: foundKeywords,
      timestamp: Date.now(),
      scores: scores,
    };

    // 记录历史
    emotionHistory.push(currentEmotion);
    if (emotionHistory.length > 20) {
      emotionHistory.shift();
    }

    // 构建结果
    return {
      type: dominantEmotion.type,
      score: sentimentScore,
      intensity: dominantEmotion.intensity,
      keywords: foundKeywords,
      needTransfer: shouldTransferToHuman(dominantEmotion, scores),
      transferReason: getTransferReason(dominantEmotion, scores),
      sentiment: sentimentScore > 0 ? 'positive' : sentimentScore < 0 ? 'negative' : 'neutral',
      confidence: dominantEmotion.confidence,
      suggestions: getSuggestions(dominantEmotion),
    };
  }

  /**
   * 创建中性结果
   */
  function createNeutralResult() {
    return {
      type: 'neutral',
      score: 0,
      intensity: 'normal',
      keywords: [],
      needTransfer: false,
      transferReason: null,
      sentiment: 'neutral',
      confidence: 1.0,
      suggestions: [],
    };
  }

  /**
   * 确定主导情绪
   */
  function determineDominantEmotion(scores) {
    let maxScore = 0;
    let dominantType = 'neutral';
    let confidence = 0.5;

    // 优先级：紧急 > 负面 > 焦虑 > 悲伤 > 正面 > 中性
    const priorityOrder = ['urgent', 'negative', 'worried', 'sad', 'positive', 'neutral'];
    
    for (const type of priorityOrder) {
      if (scores[type] > maxScore) {
        maxScore = scores[type];
        dominantType = type;
      }
    }

    // 计算置信度
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    if (total > 0) {
      confidence = maxScore / total;
    }

    // 确定强度
    let intensity = 'normal';
    if (maxScore >= 4) intensity = 'strong';
    else if (maxScore >= 2) intensity = 'moderate';
    else if (maxScore >= 1) intensity = 'mild';
    else intensity = 'normal';

    return {
      type: dominantType,
      intensity,
      confidence: Math.min(confidence, 1),
      score: maxScore,
    };
  }

  /**
   * 判断是否需要转人工
   */
  function shouldTransferToHuman(dominantEmotion, scores) {
    // 紧急情况必须转人工
    if (dominantEmotion.type === 'urgent' && dominantEmotion.score >= 2) {
      return true;
    }

    // 强负面情绪转人工
    if (dominantEmotion.type === 'negative' && dominantEmotion.intensity === 'strong') {
      return true;
    }

    // 讽刺可能表示不满
    if (scores.sarcastic >= 2) {
      return true;
    }

    // 历史记录中连续负面情绪
    if (emotionHistory.length >= 2) {
      const recentEmotions = emotionHistory.slice(-2);
      if (recentEmotions.every(e => e.type === 'negative')) {
        return true;
      }
    }

    return false;
  }

  /**
   * 获取转人工原因
   */
  function getTransferReason(dominantEmotion, scores) {
    if (dominantEmotion.type === 'urgent') {
      return '用户表达了紧急需求，需要人工快速响应';
    }
    if (dominantEmotion.type === 'negative' && dominantEmotion.intensity === 'strong') {
      return '用户情绪激动，强烈不满，需要人工安抚和解决';
    }
    if (scores.sarcastic >= 2) {
      return '用户可能在使用反讽，表达不满情绪';
    }
    if (emotionHistory.length >= 2) {
      return '用户持续表达负面情绪，需要人工跟进';
    }
    return '系统判定需要人工介入';
  }

  /**
   * 获取建议
   */
  function getSuggestions(dominantEmotion) {
    switch (dominantEmotion.type) {
      case 'positive':
        return [
          '保持友好热情的服务态度',
          '适时推荐相关服务',
          '表达感谢并邀请用户再次光临',
        ];
      case 'negative':
        return [
          '表达歉意和理解',
          '迅速定位问题原因',
          '提供解决方案',
          '必要时转接人工',
        ];
      case 'worried':
        return [
          '给予安慰和信心',
          '提供详细的信息支持',
          '强调保障措施',
        ];
      case 'sad':
        return [
          '表达同情和理解',
          '提供力所能及的帮助',
          '适当使用温暖的语言',
        ];
      case 'urgent':
        return [
          '立即响应，不要等待',
          '优先处理紧急请求',
          '必要时直接转接人工',
        ];
      default:
        return [
          '保持正常服务态度',
          '积极了解用户需求',
        ];
    }
  }

  /**
   * 获取当前情绪
   */
  function getCurrentEmotion() {
    return { ...currentEmotion };
  }

  /**
   * 获取情绪历史
   */
  function getEmotionHistory() {
    return [...emotionHistory];
  }

  /**
   * 获取情绪统计
   */
  function getEmotionStats() {
    const stats = {
      total: emotionHistory.length,
      byType: {},
      averageScore: 0,
      transferCount: 0,
    };

    let totalScore = 0;

    emotionHistory.forEach(emotion => {
      stats.byType[emotion.type] = (stats.byType[emotion.type] || 0) + 1;
      totalScore += emotion.score;
    });

    if (stats.total > 0) {
      stats.averageScore = totalScore / stats.total;
    }

    return stats;
  }

  /**
   * 清空历史
   */
  function clearHistory() {
    emotionHistory = [];
  }

  /**
   * 重置当前情绪
   */
  function reset() {
    currentEmotion = {
      type: 'neutral',
      score: 0,
      intensity: 'normal',
      keywords: [],
      timestamp: Date.now(),
    };
  }

  /**
   * 批量分析对话
   */
  function analyzeConversation(messages) {
    const results = [];
    
    messages.forEach(msg => {
      const result = analyze(msg.content);
      results.push({
        ...result,
        messageId: msg.id,
        timestamp: msg.timestamp,
      });
    });

    return {
      results,
      overallSentiment: getConversationSentiment(results),
      emotionalJourney: getEmotionalJourney(results),
    };
  }

  /**
   * 获取对话整体情绪
   */
  function getConversationSentiment(results) {
    if (results.length === 0) return 'neutral';
    
    const negativeCount = results.filter(r => r.type === 'negative' || r.type === 'urgent').length;
    const positiveCount = results.filter(r => r.type === 'positive').length;
    const total = results.length;

    if (negativeCount / total > 0.5) return 'negative';
    if (positiveCount / total > 0.5) return 'positive';
    return 'neutral';
  }

  /**
   * 获取情绪变化曲线
   */
  function getEmotionalJourney(results) {
    return results.map((r, index) => ({
      index,
      type: r.type,
      score: r.score,
      timestamp: r.timestamp,
    }));
  }

  // 公开API
  return {
    analyze,
    getCurrentEmotion,
    getEmotionHistory,
    getEmotionStats,
    clearHistory,
    reset,
    analyzeConversation,
    getConversationSentiment,
    getEmotionalJourney,
  };
})();
