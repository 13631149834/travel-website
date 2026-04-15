// ===== 导游个人主页脚本 =====

// 数据管理
const ProfileData = {
  STORAGE_KEY: 'guide_profile',
  
  // 获取数据
  getData() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : this.getDefaultData();
  },
  
  // 获取默认数据
  getDefaultData() {
    return {
      name: '',
      nickname: '',
      avatar: '',
      intro: '',
      years: 0,
      languages: [],
      licenseNumber: '',
      licenseLevel: '初级',
      licenseImage: '',
      expertise: [],
      routes: [],
      cities: [],
      serviceTypes: [],
      phone: '',
      wechat: '',
      email: '',
      updatedAt: ''
    };
  },
  
  // 保存数据
  saveData(data) {
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },
  
  // 图片转Base64
  imageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initProfilePage();
});

function initProfilePage() {
  loadProfileData();
  setupEventListeners();
  initQRCode();
}

// 加载数据
function loadProfileData() {
  const data = ProfileData.getData();
  
  // 基本信息
  document.getElementById('name').value = data.name || '';
  document.getElementById('nickname').value = data.nickname || '';
  document.getElementById('intro').value = data.intro || '';
  document.getElementById('years').value = data.years || '';
  
  // 头像
  if (data.avatar) {
    document.getElementById('avatarPreview').src = data.avatar;
    document.getElementById('avatarPlaceholder').style.display = 'none';
  }
  
  // 语言选择
  const languages = data.languages || [];
  document.querySelectorAll('.language-option').forEach(el => {
    const lang = el.dataset.lang;
    if (languages.includes(lang)) {
      el.classList.add('selected');
    }
  });
  
  // 资质证书
  document.getElementById('licenseNumber').value = data.licenseNumber || '';
  document.getElementById('licenseLevel').value = data.licenseLevel || '初级';
  
  if (data.licenseImage) {
    document.getElementById('licensePreview').src = data.licenseImage;
    document.getElementById('licensePlaceholder').style.display = 'none';
  }
  
  // 擅长领域
  renderExpertiseTags(data.expertise || []);
  
  // 擅长线路
  renderRoutes(data.routes || []);
  
  // 服务城市
  const cities = data.cities || [];
  document.querySelectorAll('.city-option').forEach(el => {
    if (cities.includes(el.dataset.city)) {
      el.classList.add('selected');
    }
  });
  
  // 服务类型
  const serviceTypes = data.serviceTypes || [];
  document.querySelectorAll('.service-type').forEach(el => {
    if (serviceTypes.includes(el.dataset.type)) {
      el.classList.add('selected');
    }
  });
  
  // 联系方式
  document.getElementById('phone').value = data.phone || '';
  document.getElementById('wechat').value = data.wechat || '';
  document.getElementById('email').value = data.email || '';
}

// 设置事件监听
function setupEventListeners() {
  // 头像上传
  document.getElementById('avatarInput').addEventListener('change', handleAvatarUpload);
  
  // 证书上传
  document.getElementById('licenseInput').addEventListener('change', handleLicenseUpload);
  
  // 语言选择
  document.querySelectorAll('.language-option').forEach(el => {
    el.addEventListener('click', () => toggleSelection(el, 'languages'));
  });
  
  // 城市选择
  document.querySelectorAll('.city-option').forEach(el => {
    el.addEventListener('click', () => toggleSelection(el, 'cities'));
  });
  
  // 服务类型选择
  document.querySelectorAll('.service-type').forEach(el => {
    el.addEventListener('click', () => toggleSelection(el, 'serviceTypes'));
  });
  
  // 擅长领域输入
  document.getElementById('expertiseInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExpertise();
    }
  });
  
  // 线路添加
  document.getElementById('addRouteBtn').addEventListener('click', showAddRouteModal);
  
  // 保存按钮
  document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
  
  // 预览模式切换
  document.getElementById('previewToggle').addEventListener('click', togglePreviewMode);
  
  // 打印按钮
  document.getElementById('printBtn').addEventListener('click', printProfile);
  
  // 复制链接
  document.getElementById('copyLinkBtn').addEventListener('click', copyProfileLink);
  
  // 分享按钮
  document.getElementById('shareBtn').addEventListener('click', shareProfile);
  
  // 在线咨询
  document.getElementById('consultBtn').addEventListener('click', copyWechat);
}

// 头像上传处理
async function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const base64 = await ProfileData.imageToBase64(file);
    document.getElementById('avatarPreview').src = base64;
    document.getElementById('avatarPlaceholder').style.display = 'none';
    showToast('头像上传成功', 'success');
  } catch (err) {
    showToast('头像上传失败', 'error');
  }
}

// 证书上传处理
async function handleLicenseUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const base64 = await ProfileData.imageToBase64(file);
    document.getElementById('licensePreview').src = base64;
    document.getElementById('licensePlaceholder').style.display = 'none';
    showToast('证书上传成功', 'success');
  } catch (err) {
    showToast('证书上传失败', 'error');
  }
}

// 选择切换
function toggleSelection(element, field) {
  element.classList.toggle('selected');
}

// 擅长领域
function addExpertise() {
  const input = document.getElementById('expertiseInput');
  const value = input.value.trim();
  
  if (!value) return;
  
  const data = ProfileData.getData();
  if (!data.expertise) data.expertise = [];
  
  if (!data.expertise.includes(value)) {
    data.expertise.push(value);
    renderExpertiseTags(data.expertise);
  }
  
  input.value = '';
}

function renderExpertiseTags(tags) {
  const container = document.getElementById('expertiseTags');
  container.innerHTML = tags.map(tag => `
    <span class="tag">
      ${tag}
      <span class="remove-tag" onclick="removeExpertise('${tag}')">&times;</span>
    </span>
  `).join('');
}

function removeExpertise(tag) {
  const data = ProfileData.getData();
  data.expertise = data.expertise.filter(t => t !== tag);
  renderExpertiseTags(data.expertise);
}

// 线路管理
function showAddRouteModal() {
  const modal = document.getElementById('routeModal');
  document.getElementById('routeName').value = '';
  document.getElementById('routeDesc').value = '';
  document.getElementById('routeModal').dataset.mode = 'add';
  modal.classList.add('open');
}

function showEditRouteModal(index) {
  const data = ProfileData.getData();
  const route = data.routes[index];
  
  document.getElementById('routeName').value = route.name;
  document.getElementById('routeDesc').value = route.description;
  document.getElementById('routeModal').dataset.mode = 'edit';
  document.getElementById('routeModal').dataset.index = index;
  document.getElementById('routeModal').classList.add('open');
}

function saveRoute() {
  const modal = document.getElementById('routeModal');
  const mode = modal.dataset.mode;
  const name = document.getElementById('routeName').value.trim();
  const desc = document.getElementById('routeDesc').value.trim();
  
  if (!name) {
    showToast('请输入线路名称', 'error');
    return;
  }
  
  const data = ProfileData.getData();
  if (!data.routes) data.routes = [];
  
  if (mode === 'add') {
    data.routes.push({ name, description: desc });
  } else {
    const index = parseInt(modal.dataset.index);
    data.routes[index] = { name, description: desc };
  }
  
  ProfileData.saveData(data);
  renderRoutes(data.routes);
  modal.classList.remove('open');
  showToast('线路保存成功', 'success');
}

function deleteRoute(index) {
  if (!confirm('确定要删除这条线路吗？')) return;
  
  const data = ProfileData.getData();
  data.routes.splice(index, 1);
  ProfileData.saveData(data);
  renderRoutes(data.routes);
  showToast('线路已删除', 'success');
}

function renderRoutes(routes) {
  const container = document.getElementById('routesContainer');
  
  if (routes.length === 0) {
    container.innerHTML = '<p class="empty-text">暂无擅长线路，添加一条吧</p>';
    return;
  }
  
  container.innerHTML = routes.map((route, index) => `
    <div class="route-item">
      <div class="route-item-info">
        <div class="route-item-name">${route.name}</div>
        <div class="route-item-desc">${route.description || '暂无描述'}</div>
      </div>
      <div class="route-item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showEditRouteModal(${index})">编辑</button>
        <button class="btn btn-sm btn-danger" onclick="deleteRoute(${index})">删除</button>
      </div>
    </div>
  `).join('');
}

// 保存个人信息
function saveProfile() {
  const data = ProfileData.getData();
  
  // 基本信息
  data.name = document.getElementById('name').value.trim();
  data.nickname = document.getElementById('nickname').value.trim();
  data.intro = document.getElementById('intro').value.trim();
  data.years = parseInt(document.getElementById('years').value) || 0;
  data.avatar = document.getElementById('avatarPreview').src || '';
  
  // 语言
  data.languages = Array.from(document.querySelectorAll('.language-option.selected'))
    .map(el => el.dataset.lang);
  
  // 资质证书
  data.licenseNumber = document.getElementById('licenseNumber').value.trim();
  data.licenseLevel = document.getElementById('licenseLevel').value;
  data.licenseImage = document.getElementById('licensePreview').src || '';
  
  // 服务城市
  data.cities = Array.from(document.querySelectorAll('.city-option.selected'))
    .map(el => el.dataset.city);
  
  // 服务类型
  data.serviceTypes = Array.from(document.querySelectorAll('.service-type.selected'))
    .map(el => el.dataset.type);
  
  // 联系方式
  data.phone = document.getElementById('phone').value.trim();
  data.wechat = document.getElementById('wechat').value.trim();
  data.email = document.getElementById('email').value.trim();
  
  ProfileData.saveData(data);
  showToast('个人信息保存成功', 'success');
}

// 预览模式
function togglePreviewMode() {
  const isPreview = document.body.classList.toggle('preview-mode');
  document.getElementById('previewToggle').textContent = isPreview ? '🔙 返回编辑' : '👁️ 预览主页';
  
  if (isPreview) {
    renderPreviewMode();
  }
}

function renderPreviewMode() {
  const data = ProfileData.getData();
  
  // 更新预览内容
  const avatarEl = document.getElementById('previewAvatar');
  avatarEl.src = data.avatar || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" x="50" text-anchor="middle" font-size="50">👤</text></svg>';
  
  document.getElementById('previewName').textContent = data.nickname || data.name || '导游昵称';
  document.getElementById('previewTitle').textContent = `${data.licenseLevel || '初级'}导游 · 从业${data.years || 0}年`;
  document.getElementById('previewIntro').textContent = data.intro || '暂无简介';
  document.getElementById('previewLanguages').textContent = data.languages.join(' / ') || '中文';
  document.getElementById('previewRoutes').textContent = data.routes.length > 0 ? data.routes.map(r => r.name).join('、') : '暂无擅长线路';
  document.getElementById('previewCities').textContent = data.cities.join('、') || '全国';
  document.getElementById('previewPhone').textContent = data.phone || '暂无';
  document.getElementById('previewWechat').textContent = data.wechat || '暂无';
  document.getElementById('previewEmail').textContent = data.email || '暂无';
  
  // 标签
  const tagsContainer = document.getElementById('previewExpertise');
  tagsContainer.innerHTML = (data.expertise || []).map(tag => 
    `<span class="preview-tag">${tag}</span>`
  ).join('');
  
  // 服务类型
  const typeMap = { group: '跟团游', custom: '定制游', private: '私家团' };
  const types = (data.serviceTypes || []).map(t => typeMap[t] || t);
  document.getElementById('previewServiceTypes').textContent = types.join(' / ') || '全部类型';
}

// 打印
function printProfile() {
  window.print();
}

// 初始化二维码
function initQRCode() {
  const container = document.getElementById('qrcodeContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  // 生成当前页面的URL作为二维码内容
  const currentPath = window.location.href;
  const baseUrl = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
  const url = baseUrl + 'profile-preview.html';
  
  new QRCode(container, {
    text: url,
    width: 180,
    height: 180,
    colorDark: '#667eea',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

// 复制链接
function copyProfileLink() {
  const currentPath = window.location.href;
  const baseUrl = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
  const url = baseUrl + 'profile-preview.html';
  navigator.clipboard.writeText(url).then(() => {
    showToast('链接已复制到剪贴板', 'success');
  });
}

// 分享
function shareProfile() {
  const currentPath = window.location.href;
  const baseUrl = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
  const url = baseUrl + 'profile-preview.html';
  const title = '导游个人主页';
  
  if (navigator.share) {
    navigator.share({
      title: title,
      text: '查看导游个人主页',
      url: url
    }).catch(() => {});
  } else {
    copyProfileLink();
  }
}

// 复制微信号
function copyWechat() {
  const wechat = document.getElementById('wechat').value.trim();
  if (!wechat) {
    showToast('请先填写微信号', 'error');
    return;
  }
  
  navigator.clipboard.writeText(wechat).then(() => {
    showToast('微信号已复制', 'success');
  });
}

// Toast提示
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

// 关闭模态框
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('open');
}
