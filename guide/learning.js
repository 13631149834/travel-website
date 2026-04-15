// ===== 学习成长体系脚本 =====

// 全局数据
let questions = [];
let achievements = {};
let userData = {
  answeredQuestions: [],
  wrongQuestions: [],
  favoriteQuestions: [],
  examHistory: [],
  stats: {
    totalAnswered: 0,
    totalCorrect: 0,
    learningDays: [],
    totalPoints: 0,
    unlockedBadges: [],
    lastStudyDate: null,
    currentStreak: 0
  }
};

// 数据管理
const LearningData = {
  QUESTIONS_KEY: 'learning_questions',
  USER_DATA_KEY: 'learning_user_data',
  
  // 加载题库
  async loadQuestions() {
    try {
      const response = await fetch('data/questions.json');
      questions = await response.json();
      return questions;
    } catch (err) {
      console.error('加载题库失败', err);
      return [];
    }
  },
  
  // 获取用户数据
  getUserData() {
    const data = localStorage.getItem(this.USER_DATA_KEY);
    return data ? JSON.parse(data) : userData;
  },
  
  // 保存用户数据
  saveUserData(data) {
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(data));
  },
  
  // 更新统计
  updateStats(type, value = 1) {
    const data = this.getUserData();
    data.stats.totalAnswered++;
    
    if (type === 'correct') {
      data.stats.totalCorrect++;
    }
    
    // 更新学习日期
    const today = new Date().toISOString().split('T')[0];
    if (data.stats.lastStudyDate !== today) {
      if (!data.stats.learningDays.includes(today)) {
        data.stats.learningDays.push(today);
      }
      data.stats.currentStreak++;
      data.stats.lastStudyDate = today;
    }
    
    this.saveUserData(data);
    return data;
  },
  
  // 添加积分
  addPoints(points) {
    const data = this.getUserData();
    data.stats.totalPoints += points;
    this.saveUserData(data);
    return data;
  },
  
  // 检查成就解锁
  checkAchievements() {
    const data = this.getUserData();
    const stats = data.stats;
    
    // 初出茅庐
    if (stats.totalAnswered >= 10 && !stats.unlockedBadges.includes('newcomer')) {
      this.unlockBadge('newcomer', 10);
    }
    
    // 学习达人
    if (stats.totalAnswered >= 100 && !stats.unlockedBadges.includes('scholar')) {
      this.unlockBadge('scholar', 100);
    }
    
    // 学习专家
    if (stats.totalAnswered >= 500 && !stats.unlockedBadges.includes('expert')) {
      this.unlockBadge('expert', 500);
    }
    
    // 知识大师
    if (stats.totalAnswered >= 1000 && !stats.unlockedBadges.includes('master')) {
      this.unlockBadge('master', 1000);
    }
    
    // 答题高手
    const accuracy = stats.totalAnswered > 0 ? stats.totalCorrect / stats.totalAnswered : 0;
    if (stats.totalAnswered >= 50 && accuracy >= 0.5 && !stats.unlockedBadges.includes('correct-50')) {
      this.unlockBadge('correct-50', 50);
    }
    
    // 精准达人
    if (stats.totalAnswered >= 100 && accuracy >= 0.8 && !stats.unlockedBadges.includes('correct-80')) {
      this.unlockBadge('correct-80', 80);
    }
    
    // 完美答者
    if (stats.totalAnswered >= 200 && accuracy >= 0.95 && !stats.unlockedBadges.includes('correct-95')) {
      this.unlockBadge('correct-95', 150);
    }
    
    // 坚持打卡
    if (stats.currentStreak >= 3 && !stats.unlockedBadges.includes('streak-3')) {
      this.unlockBadge('streak-3', 30);
    }
    
    // 持之以恒
    if (stats.currentStreak >= 7 && !stats.unlockedBadges.includes('streak-7')) {
      this.unlockBadge('streak-7', 70);
    }
    
    return data;
  },
  
  // 解锁徽章
  unlockBadge(badgeId, points) {
    const data = this.getUserData();
    if (!data.stats.unlockedBadges.includes(badgeId)) {
      data.stats.unlockedBadges.push(badgeId);
      data.stats.totalPoints += points;
      this.saveUserData(data);
      const badge = achievements.badges?.find(b => b.id === badgeId);
      showToast(`🎉 恭喜解锁成就：${badge?.name || badgeId}`, 'success');
    }
  }
};

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
  await initLearningPage();
});

async function initLearningPage() {
  // 加载数据
  await LearningData.loadQuestions();
  
  // 加载成就数据
  try {
    const response = await fetch('data/achievements.json');
    achievements = await response.json();
    initKnowledgeBase();
  } catch (err) {
    console.error('加载成就数据失败', err);
  }
  
  userData = LearningData.getUserData();
  
  setupEventListeners();
  renderStats();
  renderAchievements();
  renderQuestionBank();
}

// 设置事件监听
function setupEventListeners() {
  // 标签页切换
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      showSection(tab.dataset.section);
    });
  });
  
  // 开始练习
  document.getElementById('startPracticeBtn')?.addEventListener('click', startPractice);
  
  // 开始考试
  document.getElementById('startExamBtn')?.addEventListener('click', startExam);
  
  // 提交答案
  document.getElementById('submitAnswerBtn')?.addEventListener('click', submitAnswer);
  
  // 下一题
  document.getElementById('nextQuestionBtn')?.addEventListener('click', nextQuestion);
  
  // 结束考试
  document.getElementById('finishExamBtn')?.addEventListener('click', finishExam);
}

// 显示区块
function showSection(section) {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  const sectionEl = document.getElementById(section + 'Section');
  if (sectionEl) {
    sectionEl.style.display = 'block';
  }
  
  // 渲染对应内容
  if (section === 'wrong') {
    renderWrongQuestions();
  } else if (section === 'favorite') {
    renderFavoriteQuestions();
  }
}

// 渲染统计
function renderStats() {
  const stats = userData.stats;
  
  document.getElementById('totalAnswered').textContent = stats.totalAnswered;
  
  const accuracy = stats.totalAnswered > 0 
    ? ((stats.totalCorrect / stats.totalAnswered) * 100).toFixed(0) + '%'
    : '0%';
  document.getElementById('accuracyRate').textContent = accuracy;
  
  document.getElementById('currentStreak').textContent = stats.currentStreak;
  document.getElementById('totalPoints').textContent = stats.totalPoints;
  
  // 等级
  const level = getLevel(stats.totalPoints);
  document.getElementById('levelIcon').textContent = level.icon;
  document.getElementById('levelName').textContent = level.name;
  
  const progress = getLevelProgress(stats.totalPoints);
  document.getElementById('levelProgress').style.width = progress + '%';
  document.getElementById('levelPoints').textContent = `${stats.totalPoints} / ${level.maxPoints || '∞'} 积分`;
}

// 获取等级
function getLevel(points) {
  const levels = achievements.levels || [
    { name: '青铜', icon: '🥉', minPoints: 0, maxPoints: 100 },
    { name: '白银', icon: '🥈', minPoints: 101, maxPoints: 300 },
    { name: '黄金', icon: '🥇', minPoints: 301, maxPoints: 600 },
    { name: '钻石', icon: '💎', minPoints: 601, maxPoints: Infinity }
  ];
  
  for (const level of levels) {
    if (points >= level.minPoints && points <= level.maxPoints) {
      return level;
    }
  }
  return levels[0];
}

// 获取等级进度
function getLevelProgress(points) {
  const level = getLevel(points);
  if (!level.maxPoints || level.maxPoints === Infinity) return 100;
  const range = level.maxPoints - level.minPoints;
  const progress = points - level.minPoints;
  return Math.min(100, (progress / range) * 100);
}

// 渲染成就
function renderAchievements() {
  const container = document.getElementById('badgesGrid');
  if (!container) return;
  
  const unlocked = userData.stats.unlockedBadges || [];
  const badges = achievements.badges || [];
  
  container.innerHTML = badges.map(badge => {
    const isUnlocked = unlocked.includes(badge.id);
    return `
      <div class="badge-item ${isUnlocked ? 'unlocked' : 'locked'}" onclick="showBadgeDetail('${badge.id}')">
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-name">${badge.name}</div>
        <div class="badge-desc">${badge.description}</div>
      </div>
    `;
  }).join('');
}

// 显示徽章详情
function showBadgeDetail(badgeId) {
  const badge = achievements.badges?.find(b => b.id === badgeId);
  if (!badge) return;
  
  alert(`${badge.icon} ${badge.name}\n\n${badge.description}\n\n解锁条件: ${badge.condition}\n奖励积分: ${badge.points}`);
}

// 渲染题库统计
function renderQuestionBank() {
  const container = document.getElementById('questionCount');
  if (container) {
    const categories = [...new Set(questions.map(q => q.category))];
    container.innerHTML = `
      <div style="margin-bottom: 12px;">总题数: <strong>${questions.length}</strong> 题</div>
      <div>科目: <strong>${categories.length}</strong> 个</div>
    `;
  }
}

// 开始练习
function startPractice() {
  const categoryInput = document.querySelector('[name="practiceCategory"]');
  const countInput = document.querySelector('[name="practiceCount"]');
  
  const category = categoryInput?.value || 'all';
  const count = parseInt(countInput?.value) || 10;
  
  let filtered = questions;
  if (category !== 'all') {
    filtered = questions.filter(q => q.category === category);
  }
  
  if (filtered.length === 0) {
    showToast('暂无相关题目', 'error');
    return;
  }
  
  // 随机选题
  const selected = shuffleArray([...filtered]).slice(0, Math.min(count, filtered.length));
  
  showPracticeMode(selected);
}

// 开始考试
function startExam() {
  const countInput = document.querySelector('[name="examCount"]');
  const durationInput = document.querySelector('[name="examDuration"]');
  
  const count = parseInt(countInput?.value) || 20;
  const duration = parseInt(durationInput?.value) || 30;
  
  const selected = shuffleArray([...questions]).slice(0, Math.min(count, questions.length));
  
  showExamMode(selected, duration);
}

// 显示练习模式
function showPracticeMode(selectedQuestions) {
  window.practiceData = {
    questions: selectedQuestions,
    currentIndex: 0,
    answers: [],
    isExam: false
  };
  
  document.getElementById('practiceSettings').style.display = 'none';
  document.getElementById('practiceArea').style.display = 'block';
  
  renderQuestion();
}

// 显示考试模式
function showExamMode(selectedQuestions, duration) {
  window.practiceData = {
    questions: selectedQuestions,
    currentIndex: 0,
    answers: [],
    isExam: true,
    startTime: Date.now(),
    duration: duration * 60 * 1000,
    timer: null
  };
  
  document.getElementById('practiceSettings').style.display = 'none';
  document.getElementById('practiceArea').style.display = 'block';
  
  // 启动计时器
  startTimer();
  
  renderQuestion();
}

// 计时器
function startTimer() {
  updateTimerDisplay();
  
  window.practiceData.timer = setInterval(() => {
    const elapsed = Date.now() - window.practiceData.startTime;
    const remaining = window.practiceData.duration - elapsed;
    
    if (remaining <= 0) {
      clearInterval(window.practiceData.timer);
      showToast('考试时间到！', 'error');
      finishExam();
      return;
    }
    
    window.practiceData.remainingTime = remaining;
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const elapsed = Date.now() - window.practiceData.startTime;
  const remaining = window.practiceData.duration - elapsed;
  
  const minutes = Math.floor(Math.abs(remaining) / 60000);
  const seconds = Math.floor((Math.abs(remaining) % 60000) / 1000);
  
  const timerEl = document.getElementById('examTimer');
  if (timerEl) {
    timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    timerEl.classList.remove('warning', 'danger');
    if (remaining < 60000) {
      timerEl.classList.add('danger');
    } else if (remaining < 300000) {
      timerEl.classList.add('warning');
    }
  }
}

// 渲染题目
function renderQuestion() {
  const data = window.practiceData;
  if (!data || !data.questions) return;
  
  const q = data.questions[data.currentIndex];
  if (!q) return;
  
  // 更新进度
  document.getElementById('questionNumber').textContent = data.currentIndex + 1;
  document.getElementById('totalQuestions').textContent = data.questions.length;
  
  // 渲染题目内容
  const difficultyClass = `difficulty-${q.difficulty}`;
  
  let optionsHtml = '';
  if (q.type === 'judge') {
    optionsHtml = `
      <div class="judge-options">
        <div class="judge-option" data-value="正确" onclick="selectOption(this, '正确')">✓ 正确</div>
        <div class="judge-option" data-value="错误" onclick="selectOption(this, '错误')">✗ 错误</div>
      </div>
    `;
  } else {
    optionsHtml = `
      <div class="options-list">
        ${(q.options || []).map((opt, i) => {
          const letter = q.type === 'multiple' ? ['A', 'B', 'C', 'D', 'E', 'F'][i] : String.fromCharCode(65 + i);
          return `
            <div class="option-item" data-value="${letter}" onclick="selectOption(this, '${letter}')">
              <div class="option-letter">${letter}</div>
              <div class="option-text">${opt}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
  
  document.getElementById('questionContent').innerHTML = `
    <div class="question-meta">
      <span class="question-tag">${q.category}</span>
      <span class="question-tag">${q.type === 'single' ? '单选' : q.type === 'multiple' ? '多选' : '判断'}</span>
      <span class="question-tag ${difficultyClass}">
        ${q.difficulty === 'easy' ? '简单' : q.difficulty === 'medium' ? '中等' : '困难'}
      </span>
    </div>
    <div class="question-content">${q.question}</div>
    ${optionsHtml}
  `;
  
  // 收藏按钮
  const isFavorited = userData.favoriteQuestions.includes(q.id);
  document.getElementById('favoriteBtn').classList.toggle('active', isFavorited);
  document.getElementById('favoriteBtn').innerHTML = isFavorited ? '★ 已收藏' : '☆ 收藏';
  
  // 隐藏解析
  document.getElementById('explanationArea').style.display = 'none';
  document.getElementById('submitAnswerBtn').style.display = 'inline-flex';
  document.getElementById('nextQuestionBtn').style.display = 'none';
  
  // 更新导航
  updateQuestionNav();
}

// 选择选项
function selectOption(element, value) {
  const container = element.parentElement;
  
  if (container.classList.contains('judge-options')) {
    container.querySelectorAll('.judge-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
  } else {
    const q = window.practiceData.questions[window.practiceData.currentIndex];
    
    if (q.type === 'multiple') {
      element.classList.toggle('selected');
    } else {
      container.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
      element.classList.add('selected');
    }
  }
  
  window.practiceData.selectedValue = value;
}

// 获取选择的值
function getSelectedValue() {
  const container = document.querySelector('.options-list, .judge-options');
  const selected = container?.querySelector('.selected');
  if (selected) {
    return selected.dataset.value;
  }
  return window.practiceData.selectedValue;
}

// 提交答案
function submitAnswer() {
  const data = window.practiceData;
  const q = data.questions[data.currentIndex];
  const selected = getSelectedValue();
  
  if (!selected) {
    showToast('请选择答案', 'error');
    return;
  }
  
  // 标记已答
  if (!data.answers[data.currentIndex]) {
    data.answers[data.currentIndex] = {};
  }
  data.answers[data.currentIndex].selected = selected;
  data.answers[data.currentIndex].answered = true;
  
  // 检查答案
  const isCorrect = checkAnswer(selected, q.answer);
  data.answers[data.currentIndex].correct = isCorrect;
  
  // 显示结果样式
  const container = document.querySelector('.options-list, .judge-options');
  if (container) {
    if (q.type === 'judge') {
      container.querySelectorAll('.judge-option').forEach(el => {
        if (el.dataset.value === q.answer) {
          el.classList.add('correct');
        }
        if (!isCorrect && el.classList.contains('selected')) {
          el.classList.add('incorrect');
        }
      });
    } else {
      container.querySelectorAll('.option-item').forEach(el => {
        const value = el.dataset.value;
        const correctAnswers = Array.isArray(q.answer) ? q.answer : [q.answer];
        
        if (correctAnswers.includes(value)) {
          el.classList.add('correct');
        }
        
        if (!isCorrect && value === selected && el.classList.contains('selected')) {
          el.classList.add('incorrect');
        }
      });
    }
  }
  
  // 显示解析
  document.getElementById('explanationArea').style.display = 'block';
  document.getElementById('explanationContent').innerHTML = `
    <h4>${isCorrect ? '✓ 回答正确' : '✗ 回答错误'}</h4>
    <p><strong>正确答案：</strong>${Array.isArray(q.answer) ? q.answer.join('、') : q.answer}</p>
    <p style="margin-top: 12px;"><strong>解析：</strong>${q.explanation}</p>
  `;
  document.getElementById('explanationArea').className = `explanation ${isCorrect ? 'correct' : 'incorrect'}`;
  
  // 更新统计（非考试模式）
  if (!data.isExam) {
    userData.answeredQuestions.push(q.id);
    userData.stats.totalAnswered++;
    
    if (isCorrect) {
      userData.stats.totalCorrect++;
      LearningData.addPoints(1);
    } else {
      // 添加到错题本
      if (!userData.wrongQuestions.find(wq => wq.id === q.id)) {
        userData.wrongQuestions.push({ ...q, wrongTime: Date.now() });
      }
    }
    
    userData = LearningData.checkAchievements();
    LearningData.saveUserData(userData);
    renderStats();
    renderAchievements();
  }
  
  // 更新按钮
  document.getElementById('submitAnswerBtn').style.display = 'none';
  document.getElementById('nextQuestionBtn').style.display = 'inline-flex';
  
  // 更新导航
  updateQuestionNav();
}

// 检查答案
function checkAnswer(selected, correct) {
  if (Array.isArray(correct)) {
    if (Array.isArray(selected)) {
      return JSON.stringify(selected.sort()) === JSON.stringify(correct.sort());
    }
    return correct.includes(selected);
  }
  return selected === correct;
}

// 下一题
function nextQuestion() {
  const data = window.practiceData;
  
  if (data.currentIndex < data.questions.length - 1) {
    data.currentIndex++;
    renderQuestion();
    updateQuestionNav();
  } else {
    // 练习结束
    if (data.isExam) {
      finishExam();
    } else {
      showPracticeComplete();
    }
  }
}

// 更新题目导航
function updateQuestionNav() {
  const container = document.getElementById('questionNav');
  const data = window.practiceData;
  if (!container || !data) return;
  
  container.innerHTML = data.questions.map((q, i) => {
    let className = 'nav-dot';
    if (i === data.currentIndex) className += ' current';
    if (data.answers[i]?.answered) {
      className += data.answers[i].correct ? ' answered' : ' wrong';
    }
    if (userData.favoriteQuestions.includes(q.id)) {
      className += ' favorite';
    }
    return `<div class="${className}" onclick="jumpToQuestion(${i})">${i + 1}</div>`;
  }).join('');
}

// 跳转到题目
function jumpToQuestion(index) {
  if (window.practiceData) {
    window.practiceData.currentIndex = index;
    renderQuestion();
    updateQuestionNav();
  }
}

// 显示练习完成
function showPracticeComplete() {
  const data = window.practiceData;
  const answered = data.answers.filter(a => a?.answered).length;
  const correct = data.answers.filter(a => a?.correct).length;
  const accuracy = answered > 0 ? ((correct / answered) * 100).toFixed(0) : 0;
  
  document.getElementById('practiceArea').innerHTML = `
    <div class="exam-result">
      <div class="result-score">${accuracy}%</div>
      <div class="result-status ${accuracy >= 60 ? 'pass' : 'fail'}">
        ${accuracy >= 60 ? '🎉 练习完成！' : '📚 继续加油！'}
      </div>
      <div class="result-stats">
        <div class="result-stat">
          <div class="stat-value">${answered}</div>
          <div class="stat-label">已答题</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${correct}</div>
          <div class="stat-label">正确</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${answered - correct}</div>
          <div class="stat-label">错误</div>
        </div>
      </div>
      <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
        <button class="btn btn-primary" onclick="location.reload()">返回首页</button>
        <button class="btn btn-secondary" onclick="reviewWrongQuestions()">复习错题</button>
      </div>
    </div>
  `;
}

// 完成考试
function finishExam() {
  const data = window.practiceData;
  
  if (data.timer) {
    clearInterval(data.timer);
  }
  
  const answered = data.answers.filter(a => a?.answered).length;
  const correct = data.answers.filter(a => a?.correct).length;
  const score = answered > 0 ? ((correct / answered) * 100).toFixed(0) : 0;
  const timeSpent = Math.round((Date.now() - data.startTime) / 60000);
  
  // 保存考试记录
  userData.examHistory.push({
    date: new Date().toISOString(),
    score,
    correct,
    total: answered,
    timeSpent
  });
  
  // 添加积分
  LearningData.addPoints(10 + Math.floor(score / 10));
  
  // 解锁成就
  if (score >= 60 && !userData.stats.unlockedBadges.includes('exam-pass')) {
    LearningData.unlockBadge('exam-pass', 50);
  }
  
  userData = LearningData.checkAchievements();
  LearningData.saveUserData(userData);
  
  // 显示结果
  document.getElementById('practiceArea').innerHTML = `
    <div class="exam-result">
      <div class="result-score">${score}分</div>
      <div class="result-status ${score >= 60 ? 'pass' : 'fail'}">
        ${score >= 60 ? '🎉 考试通过！' : '📚 未通过，继续努力！'}
      </div>
      <div class="result-stats">
        <div class="result-stat">
          <div class="stat-value">${correct}/${answered}</div>
          <div class="stat-label">正确/已答</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${timeSpent}分钟</div>
          <div class="stat-label">用时</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${data.questions.length - answered}</div>
          <div class="stat-label">未答</div>
        </div>
      </div>
      <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
        <button class="btn btn-primary" onclick="location.reload()">返回首页</button>
        <button class="btn btn-secondary" onclick="reviewWrongQuestions()">复习错题</button>
      </div>
    </div>
  `;
  
  renderStats();
  renderAchievements();
}

// 复习错题
function reviewWrongQuestions() {
  const data = window.practiceData;
  const wrongQuestions = data 
    ? data.questions.filter((q, i) => data.answers[i]?.correct === false)
    : userData.wrongQuestions;
  
  if (wrongQuestions.length === 0) {
    showToast('本次练习无错题', 'info');
    return;
  }
  
  showPracticeMode(wrongQuestions.slice(0, Math.min(10, wrongQuestions.length)));
}

// 收藏题目
function toggleFavorite() {
  const data = window.practiceData;
  if (!data) return;
  
  const q = data.questions[data.currentIndex];
  
  const index = userData.favoriteQuestions.indexOf(q.id);
  if (index === -1) {
    userData.favoriteQuestions.push(q.id);
    showToast('已添加到收藏', 'success');
  } else {
    userData.favoriteQuestions.splice(index, 1);
    showToast('已取消收藏', 'success');
  }
  
  LearningData.saveUserData(userData);
  renderQuestion();
  updateQuestionNav();
}

// 渲染错题本
function renderWrongQuestions() {
  const container = document.getElementById('wrongList');
  if (!container) return;
  
  const wrong = userData.wrongQuestions;
  
  if (wrong.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📝</div>
        <h3>暂无错题</h3>
        <p>继续加油，保持高正确率！</p>
      </div>
    `;
    document.getElementById('reviewWrongBtn').style.display = 'none';
    return;
  }
  
  document.getElementById('reviewWrongBtn').style.display = 'block';
  
  container.innerHTML = wrong.slice(0, 10).map(q => `
    <div class="wrong-item" onclick="viewWrongQuestion(${q.id})">
      <div class="wrong-item-header">
        <div class="wrong-item-info">
          <span class="question-tag">${q.category}</span>
          <span class="question-tag">${q.type === 'single' ? '单选' : q.type === 'multiple' ? '多选' : '判断'}</span>
        </div>
        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); removeFromWrong(${q.id})">移除</button>
      </div>
      <div class="question-content" style="margin-top: 8px;">${q.question}</div>
    </div>
  `).join('');
}

function viewWrongQuestion(id) {
  const q = userData.wrongQuestions.find(wq => wq.id === id);
  if (q) {
    showPracticeMode([q]);
  }
}

function removeFromWrong(id) {
  userData.wrongQuestions = userData.wrongQuestions.filter(wq => wq.id !== id);
  LearningData.saveUserData(userData);
  renderWrongQuestions();
  showToast('已从错题本移除', 'success');
}

// 渲染收藏夹
function renderFavoriteQuestions() {
  const container = document.getElementById('favoriteList');
  if (!container) return;
  
  const favorites = questions.filter(q => userData.favoriteQuestions.includes(q.id));
  
  if (favorites.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">⭐</div>
        <h3>暂无收藏</h3>
        <p>练习时点击收藏按钮添加</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = favorites.map(q => `
    <div class="favorite-item" onclick="viewFavoriteQuestion(${q.id})">
      <div class="favorite-item-info">
        <div class="favorite-item-question">${q.question.substring(0, 50)}${q.question.length > 50 ? '...' : ''}</div>
        <div class="favorite-item-meta">
          <span class="question-tag">${q.category}</span>
          <span class="question-tag">${q.type === 'single' ? '单选' : q.type === 'multiple' ? '多选' : '判断'}</span>
        </div>
      </div>
      <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); removeFromFavorite(${q.id})">移除</button>
    </div>
  `).join('');
}

function viewFavoriteQuestion(id) {
  const q = questions.find(q => q.id === id);
  if (q) {
    showPracticeMode([q]);
  }
}

function removeFromFavorite(id) {
  userData.favoriteQuestions = userData.favoriteQuestions.filter(fid => fid !== id);
  LearningData.saveUserData(userData);
  renderFavoriteQuestions();
  showToast('已取消收藏', 'success');
}

// 初始化知识库
function initKnowledgeBase() {
  if (!achievements.knowledgeBase) return;
  
  // 导游必备知识
  const essentialContainer = document.getElementById('essentialKnowledge');
  if (essentialContainer) {
    essentialContainer.innerHTML = (achievements.knowledgeBase.essential || []).map(item => `
      <div class="knowledge-item">
        <h4>📌 ${item.title}</h4>
        <p>${item.content}</p>
      </div>
    `).join('');
  }
  
  // 政策法规解读
  const policyContainer = document.getElementById('policyKnowledge');
  if (policyContainer) {
    policyContainer.innerHTML = (achievements.knowledgeBase.policyInterpretation || []).map(item => `
      <div class="knowledge-item">
        <h4>⚖️ ${item.title}</h4>
        <p>${item.content}</p>
      </div>
    `).join('');
  }
  
  // 实用技巧
  const tipsContainer = document.getElementById('tipsKnowledge');
  if (tipsContainer) {
    tipsContainer.innerHTML = (achievements.knowledgeBase.practicalTips || []).map(item => `
      <div class="knowledge-item">
        <h4>💡 ${item.title}</h4>
        <p>${item.content}</p>
      </div>
    `).join('');
  }
}

// 工具函数
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Toast提示
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
      toast.className = 'toast';
    }, 3000);
  }
}

// 返回按钮
function goBack() {
  if (window.practiceData?.timer) {
    clearInterval(window.practiceData.timer);
  }
  window.practiceData = null;
  document.getElementById('practiceSettings').style.display = 'block';
  document.getElementById('practiceArea').style.display = 'none';
}
