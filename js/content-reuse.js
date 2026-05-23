/**
 * 精致化5.0 - 内容复用工具
 * 功能：
 * 1. 知识库内容生成闪卡
 * 2. 章节重点生成练习题
 * 3. 口诀生成海报
 */
(function() {
  'use strict';
  
  // ========== 知识点转闪卡 ==========
  function知识点To闪卡(knowledgePoint) {
    const { question, answer, keywords, example } = knowledgePoint;
    
    return {
      front: question,
      back: answer,
      mnemonic: keywords ? keywords.join('、') : '',
      example: example || '',
      tags: extractTags(question)
    };
  }
  
  // 提取标签
  function extractTags(text) {
    const tagMap = {
      '服务': '业务',
      '导游': '业务',
      '团队': '业务',
      '散客': '业务',
      '合同': '政策',
      '安全': '业务',
      '法律': '政策',
      '景点': '导基',
      '民俗': '导基'
    };
    
    const tags = [];
    for (const [key, value] of Object.entries(tagMap)) {
      if (text.includes(key)) {
        tags.push(value);
      }
    }
    return [...new Set(tags)];
  }
  
  // ========== 章节重点转练习题 ==========
  function重点To练习题(keyPoints) {
    return keyPoints.map((point, idx) => ({
      id: 'auto_' + Date.now() + '_' + idx,
      type: 'single',
      question: '【考点】' + point.title,
      options: generateOptions(point.answer),
      answer: 0, // 正确答案index
      explanation: point.explanation || point.answer,
      difficulty: point.difficulty || 1
    }));
  }
  
  // 生成选项
  function generateOptions(correctAnswer) {
    const wrongAnswers = [
      '导游服务规范',
      '旅游安全管理',
      '应急预案处理',
      '游客投诉处理',
      '行程变更程序'
    ];
    
    const options = [correctAnswer];
    while (options.length < 4) {
      const wrong = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
      if (!options.includes(wrong)) {
        options.push(wrong);
      }
    }
    
    // 打乱顺序
    return shuffleArray(options);
  }
  
  function shuffleArray(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  
  // ========== 口诀转海报 ==========
  function口诀To海报(mnemonic) {
    const { title, keywords, verse, meaning } = mnemonic;
    
    return {
      type: 'poster',
      elements: [
        { type: 'title', text: title, style: { fontSize: 24, color: '#E65100' } },
        { type: 'verse', text: verse, style: { fontSize: 18, color: '#333' } },
        { type: 'meaning', text: meaning, style: { fontSize: 14, color: '#666' } },
        { type: 'keywords', text: keywords.join('、'), style: { fontSize: 12, color: '#999' } },
        { type: 'brand', text: '走过弯路，所以更懂路', style: { fontSize: 10, color: '#BF360C' } }
      ],
      format: 'share',
      background: '#FFF3E0'
    };
  }
  
  // ========== 生成可分享内容 ==========
  function generateShareContent(type, data) {
    const templates = {
      checkin: {
        text: '📚 备考打卡第{data.streak}天\n今天学习了{data.chapter}\n走过弯路，所以更懂路',
        hashtags: ['导游证备考', '考证打卡', '学习记录']
      },
      milestone: {
        text: '🎉 达成{data.milestone}天连续打卡！\n坚持就是胜利，加油！\n走过弯路，所以更懂路',
        hashtags: ['导游证', '备考里程碑', '考证加油']
      },
      flashcard: {
        text: '🃏 今日闪卡完成{data.count}张\n记住口诀，考试不慌\n走过弯路，所以更懂路',
        hashtags: ['导游证备考', '口诀记忆', '笔试技巧']
      }
    };
    
    const template = templates[type];
    if (!template) return null;
    
    let text = template.text;
    for (const [key, value] of Object.entries(data)) {
      text = text.replace('{' + key + '}', value);
    }
    
    return {
      text: text,
      hashtags: template.hashtags
    };
  }
  
  // 暴露API
  window.ContentReuse = {
    知识点To闪卡,
    重点To练习题,
    口诀To海报,
    generateShareContent,
    generateOptions,
    extractTags
  };
  
})();
