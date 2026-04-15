/**
 * 旅行计划工具 - JavaScript
 */

// 数据存储键名
const STORAGE_KEY = 'travel_plans';

/**
 * 获取所有计划
 */
function getAllPlans() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * 保存计划
 */
function savePlans(plans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

/**
 * 获取单个计划
 */
function getPlan(id) {
  const plans = getAllPlans();
  return plans.find(p => p.id === id);
}

/**
 * 创建新计划
 */
function createPlan(planData) {
  const plans = getAllPlans();
  const newPlan = {
    id: generateId(),
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...planData
  };
  plans.unshift(newPlan);
  savePlans(plans);
  return newPlan;
}

/**
 * 更新计划
 */
function updatePlan(id, updates) {
  const plans = getAllPlans();
  const index = plans.findIndex(p => p.id === id);
  if (index !== -1) {
    plans[index] = {
      ...plans[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    savePlans(plans);
    return plans[index];
  }
  return null;
}

/**
 * 删除计划
 */
function deletePlan(id) {
  const plans = getAllPlans();
  const filtered = plans.filter(p => p.id !== id);
  savePlans(filtered);
}

/**
 * 生成唯一ID
 */
function generateId() {
  return 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 显示提示消息
 */
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * 格式化日期
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * 格式化日期范围
 */
function formatDateRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startStr = startDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  const endStr = endDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  return `${startStr} - ${endStr}`;
}

/**
 * 计算天数
 */
function calculateDays(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * 获取状态标签
 */
function getStatusBadge(status) {
  const badges = {
    draft: '草稿',
    active: '进行中',
    completed: '已完成'
  };
  return badges[status] || status;
}

/**
 * 获取活动类型图标
 */
function getActivityIcon(type) {
  const icons = {
    attraction: '🏛️',
    food: '🍜',
    shopping: '🛍️',
    culture: '🎭',
    nature: '🌿',
    entertainment: '🎢',
    beach: '🏖️',
    sports: '🏄',
    nightlife: '🌃',
    theme_park: '🎠'
  };
  return icons[type] || '📍';
}

/**
 * 复制到剪贴板
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('链接已复制到剪贴板', 'success');
    return true;
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
}

/**
 * 生成分享链接
 */
function generateShareLink(planId) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/planner/detail.html?id=${planId}`;
}

/**
 * 生成二维码（使用SVG）
 */
function generateQRCodeSVG(text, size = 200) {
  // 简化版二维码生成（实际项目中建议使用 qrcode.js 库）
  const qrSize = 25;
  const cellSize = size / qrSize;
  
  // 生成模拟二维码图案
  const pattern = [];
  for (let i = 0; i < qrSize; i++) {
    pattern[i] = [];
    for (let j = 0; j < qrSize; j++) {
      // 定位图案
      if ((i < 7 && j < 7) || (i < 7 && j >= qrSize - 7) || (i >= qrSize - 7 && j < 7)) {
        pattern[i][j] = 1;
      } else if (i === 6 || j === 6 || i === qrSize - 7 || j === qrSize - 7) {
        pattern[i][j] = 1;
      } else if (i % 2 === j % 2) {
        pattern[i][j] = Math.random() > 0.5 ? 1 : 0;
      } else {
        pattern[i][j] = 0;
      }
    }
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  
  for (let i = 0; i < qrSize; i++) {
    for (let j = 0; j < qrSize; j++) {
      if (pattern[i][j]) {
        svg += `<rect x="${j * cellSize}" y="${i * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
      }
    }
  }
  
  svg += '</svg>';
  return svg;
}

/**
 * 导出为文本
 */
function exportAsText(plan) {
  let text = `📋 ${plan.name}\n`;
  text += `${'='.repeat(40)}\n\n`;
  text += `📍 目的地: ${plan.destination}\n`;
  text += `📅 日期: ${formatDateRange(plan.startDate, plan.endDate)}\n`;
  text += `👥 人数: ${plan.people || 1}人\n`;
  text += `🎯 风格: ${plan.style || '自由行'}\n\n`;
  text += `${'='.repeat(40)}\n`;
  text += `📆 详细行程\n`;
  text += `${'='.repeat(40)}\n\n`;

  if (plan.days && plan.days.length > 0) {
    plan.days.forEach(day => {
      text += `Day ${day.day} - ${day.theme || '行程'}\n`;
      text += `${'-'.repeat(20)}\n`;
      
      if (day.items && day.items.length > 0) {
        day.items.forEach(item => {
          text += `  ⏰ ${item.time} ${item.place}\n`;
          if (item.note) text += `     ${item.note}\n`;
        });
      }
      text += '\n';
    });
  }

  return text;
}

/**
 * 打印计划
 */
function printPlan() {
  window.print();
}

/**
 * 获取URL参数
 */
function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * 初始化移动端菜单
 */
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
      menu.classList.toggle('active');
    });
  }
}

/**
 * 打开模态框
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * 关闭模态框
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * 初始化模态框关闭
 */
function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
}

/**
 * 页面导航
 */
function navigateTo(page, params = {}) {
  let url = `../${page}`;
  const queryString = new URLSearchParams(params).toString();
  if (queryString) {
    url += '?' + queryString;
  }
  window.location.href = url;
}

/**
 * 加载模板数据
 */
async function loadTemplateData() {
  try {
    const response = await fetch('../data/planner.json');
    return await response.json();
  } catch (error) {
    console.error('加载模板数据失败:', error);
    return null;
  }
}

/**
 * 使用模板创建计划
 */
function createPlanFromTemplate(template) {
  const plan = {
    name: template.name,
    destination: template.destination,
    country: template.country,
    startDate: getNextWeekday(),
    endDate: getDateAfterDays(template.duration),
    people: 2,
    style: template.style,
    days: JSON.parse(JSON.stringify(template.days)),
    coverImage: template.coverImage
  };
  return plan;
}

/**
 * 获取下一个工作日
 */
function getNextWeekday() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
}

/**
 * 获取指定天数后的日期
 */
function getDateAfterDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + 7 + days - 1);
  return date.toISOString().split('T')[0];
}

/**
 * 从模板应用创建计划
 */
async function applyTemplateToNewPlan(templateId) {
  const data = await loadTemplateData();
  if (!data) {
    showToast('加载模板失败', 'error');
    return;
  }

  const template = data.templates.find(t => t.id === templateId);
  if (!template) {
    showToast('模板不存在', 'error');
    return;
  }

  const plan = createPlanFromTemplate(template);
  const newPlan = createPlan(plan);
  
  showToast('计划已创建！', 'success');
  setTimeout(() => {
    navigateTo('planner/schedule.html', { id: newPlan.id });
  }, 1000);
}

// 导出函数供其他页面使用
window.TravelPlanner = {
  getAllPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  showToast,
  formatDate,
  formatDateRange,
  calculateDays,
  getStatusBadge,
  getActivityIcon,
  copyToClipboard,
  generateShareLink,
  generateQRCodeSVG,
  exportAsText,
  printPlan,
  getUrlParam,
  openModal,
  closeModal,
  loadTemplateData,
  applyTemplateToNewPlan,
  navigateTo
};
