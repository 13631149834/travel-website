import re

with open('exam-simulator.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 修改exam-progress区域，添加"今日已刷"
old_progress = '''<div class="exam-progress">
<span id="answeredCount">0</span>/<span id="totalQuestions">0</span> 已答
<div class="progress-bar"><div class="fill" id="progressFill"></div></div>
</div>'''

new_progress = '''<div class="exam-progress" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
  <div>
    <span id="answeredCount">0</span>/<span id="totalQuestions">0</span> 已答
    <span id="todayCount" style="margin-left:12px;padding:2px 8px;background:#E8F5E9;color:#065F46;border-radius:10px;font-size:0.8rem;font-weight:600;"></span>
  </div>
  <div class="progress-bar" style="flex:1;min-width:120px;margin-bottom:0;"><div class="fill" id="progressFill"></div></div>
</div>'''

content = content.replace(old_progress, new_progress)

# 2. 在updateProgress函数后添加今日统计函数
old_update_progress = '''function updateProgress() {
const answered = Object.keys(userAnswers).length;
const total = examQuestions.length;
(document.getElementById('answeredCount')||{}).textContent= answered;
document.getElementById('progressFill').style.width = `${(answered / total) * 100}%`;
}'''

new_update_progress = '''function updateProgress() {
const answered = Object.keys(userAnswers).length;
const total = examQuestions.length;
(document.getElementById('answeredCount')||{}).textContent= answered;
document.getElementById('progressFill').style.width = `${(answered / total) * 100}%`;
updateTodayCount();
}

function updateTodayCount() {
  const today = new Date().toDateString();
  const storageKey = 'examToday_' + today;
  const totalAnswered = Object.keys(userAnswers).length;
  
  // 获取今日记录
  let todayData = {count: 0, questions: []};
  try {
    todayData = JSON.parse(localStorage.getItem(storageKey) || '{"count":0,"questions":[]}');
  } catch(e) {}
  
  // 获取当前session新增的答题数
  const sessionKey = 'examSession_' + today;
  let sessionCount = parseInt(localStorage.getItem(sessionKey) || '0');
  
  // 每次updateProgress被调用时更新session计数
  const newSessionCount = totalAnswered;
  if (newSessionCount > sessionCount) {
    sessionCount = newSessionCount;
    localStorage.setItem(sessionKey, sessionCount.toString());
  }
  
  // 更新显示：今日已刷 = localStorage记录的累计 + 当前session
  const displayCount = todayData.count + sessionCount;
  const el = document.getElementById('todayCount');
  if (el) {
    if (displayCount > 0) {
      el.textContent = '今日已刷 ' + displayCount + ' 道';
    } else {
      el.textContent = '';
    }
  }
}

function saveTodayStats() {
  // 交卷时保存今日统计
  const today = new Date().toDateString();
  const storageKey = 'examToday_' + today;
  const sessionKey = 'examSession_' + today;
  
  let todayData = {count: 0, questions: []};
  try {
    todayData = JSON.parse(localStorage.getItem(storageKey) || '{"count":0,"questions":[]}');
  } catch(e) {}
  
  const sessionCount = parseInt(localStorage.getItem(sessionKey) || '0');
  todayData.count += sessionCount;
  
  // 合并错题
  const wrongQ = getWrongQuestions();
  todayData.questions = [...new Set([...todayData.questions, ...wrongQ.map(w => w.q)])];
  
  localStorage.setItem(storageKey, JSON.stringify(todayData));
  localStorage.removeItem(sessionKey);
}'''

content = content.replace(old_update_progress, new_update_progress)

# 3. 在submitExam函数中添加保存统计的调用
# 找到submitExam函数，在return前添加saveTodayStats()
old_submit = '''function submitExam() {
  clearInterval(timerInterval);
  timerInterval = null;'''
  
new_submit = '''function submitExam() {
  clearInterval(timerInterval);
  timerInterval = null;
  saveTodayStats(); // 保存今日统计'''

content = content.replace(old_submit, new_submit)

with open('exam-simulator.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("exam-simulator.html 今日已刷功能已添加！")
