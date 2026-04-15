/**
 * 游导旅游 - 作品库 JavaScript
 */

// 全局变量
let galleryData = null;
let currentFilter = { destination: 'all', theme: 'all', style: 'all' };
let currentWorkIndex = 0;

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadGalleryData();
  initMasonry();
  initLazyLoad();
  initLightbox();
  initCategoryFilter();
  initUploadForm();
});

// 加载数据
async function loadGalleryData() {
  try {
    const response = await fetch('data/gallery.json');
    galleryData = await response.json();
    
    // 如果在首页，渲染作品
    if (document.getElementById('worksGrid')) {
      renderWorks(galleryData.works);
      renderPopularRankings(galleryData.popularRankings);
    }
    
    // 如果在详情页，渲染详情
    if (document.getElementById('detailPage')) {
      renderWorkDetail();
    }
    
    // 如果在摄影师页，渲染摄影师信息
    if (document.getElementById('photographerPage')) {
      renderPhotographerProfile();
    }
    
    // 如果在专辑页，渲染专辑列表
    if (document.getElementById('albumsGrid')) {
      renderAlbums();
    }
    
    // 如果在技巧页，渲染技巧列表
    if (document.getElementById('tipsGrid')) {
      renderTips();
    }
  } catch (error) {
    console.error('加载作品数据失败:', error);
  }
}

// 初始化瀑布流
function initMasonry() {
  const grid = document.getElementById('worksGrid');
  if (!grid) return;
  
  // 简单的CSS瀑布流实现
  const items = grid.querySelectorAll('.masonry-item');
  
  // 添加交错动画
  items.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
  });
}

// 初始化懒加载
function initLazyLoad() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px'
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// 渲染作品列表
function renderWorks(works, append = false) {
  const grid = document.getElementById('worksGrid');
  if (!grid) return;
  
  if (!append) {
    grid.innerHTML = '';
  }
  
  const filteredWorks = filterWorks(works);
  
  filteredWorks.forEach((work, index) => {
    const photographer = galleryData.photographers.find(p => p.id === work.photographer);
    const item = document.createElement('div');
    item.className = 'masonry-item';
    item.innerHTML = `
      <div class="work-card" onclick="goToDetail('${work.id}')">
        <div class="work-card-image">
          <img src="${work.thumbnail}" alt="${work.title}" loading="lazy">
          <div class="work-card-overlay">
            <div class="work-card-actions">
              <button class="work-card-action" onclick="event.stopPropagation(); toggleLike('${work.id}')" title="点赞">
                <span>❤️</span>
              </button>
              <button class="work-card-action" onclick="event.stopPropagation(); toggleFavorite('${work.id}')" title="收藏">
                <span>⭐</span>
              </button>
              <button class="work-card-action" onclick="event.stopPropagation(); shareWork('${work.id}')" title="分享">
                <span>📤</span>
              </button>
            </div>
          </div>
        </div>
        <div class="work-card-info">
          <h3 class="work-card-title">${work.title}</h3>
          <div class="work-card-meta">
            <div class="work-card-author">
              <img src="${photographer?.avatar || 'https://via.placeholder.com/24'}" alt="${photographer?.name}">
              <span>${photographer?.name || '匿名'}</span>
            </div>
            <div class="work-card-stats">
              <span>❤️ ${formatNumber(work.likes)}</span>
              <span>👁️ ${formatNumber(work.views)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(item);
  });
  
  // 更新瀑布流
  setTimeout(() => initMasonry(), 100);
}

// 筛选作品
function filterWorks(works) {
  return works.filter(work => {
    if (currentFilter.destination !== 'all' && !work.categories.includes(currentFilter.destination)) {
      return false;
    }
    if (currentFilter.theme !== 'all' && !work.categories.includes(currentFilter.theme)) {
      return false;
    }
    if (currentFilter.style !== 'all' && !work.categories.includes(currentFilter.style)) {
      return false;
    }
    return true;
  });
}

// 渲染热门排行
function renderPopularRankings(rankings) {
  const list = document.getElementById('popularList');
  if (!list) return;
  
  list.innerHTML = '';
  
  rankings.slice(0, 8).forEach((workId, index) => {
    const work = galleryData.works.find(w => w.id === workId);
    if (!work) return;
    
    const item = document.createElement('div');
    item.className = 'popular-item';
    item.onclick = () => goToDetail(work.id);
    item.innerHTML = `
      <div class="popular-rank ${index < 3 ? 'top3' : ''}">${index + 1}</div>
      <div class="popular-item-image">
        <img src="${work.thumbnail}" alt="${work.title}">
      </div>
      <div class="popular-item-info">
        <div class="popular-item-title">${work.title}</div>
        <div class="popular-item-likes">❤️ ${formatNumber(work.likes)} 点赞</div>
      </div>
    `;
    list.appendChild(item);
  });
}

// 渲染作品详情
function renderWorkDetail() {
  const params = new URLSearchParams(window.location.search);
  const workId = params.get('id') || 'w001';
  
  const work = galleryData.works.find(w => w.id === workId);
  const photographer = galleryData.photographers.find(p => p.id === work?.photographer);
  
  if (!work) {
    document.getElementById('detailPage').innerHTML = '<div class="empty-state"><div class="empty-state-icon">📷</div><h2 class="empty-state-title">作品不存在</h2></div>';
    return;
  }
  
  // 更新页面标题
  document.title = `${work.title} - 游导旅游作品库`;
  
  // 渲染图片
  document.getElementById('detailImage').src = work.image;
  document.getElementById('detailImage').onclick = () => openLightbox(work.image);
  
  // 渲染基本信息
  document.getElementById('detailTitle').textContent = work.title;
  document.getElementById('detailLocation').innerHTML = `<span>📍</span> ${work.location}`;
  document.getElementById('detailShotAt').innerHTML = `<span>📅</span> ${work.shotAt}`;
  document.getElementById('detailDescription').textContent = work.description || '暂无描述';
  
  // 渲染统计数据
  document.getElementById('likeCount').textContent = formatNumber(work.likes);
  document.getElementById('viewCount').textContent = formatNumber(work.views);
  document.getElementById('favoriteCount').textContent = formatNumber(work.favorites);
  
  // 渲染相机参数
  document.getElementById('cameraModel').textContent = work.camera;
  document.getElementById('lensModel').textContent = work.lens;
  document.getElementById('shotSettings').textContent = work.settings;
  
  // 渲染标签
  const tagsContainer = document.getElementById('workTags');
  tagsContainer.innerHTML = work.tags.map(tag => 
    `<span class="category-tag" style="cursor:default">${tag}</span>`
  ).join('');
  
  // 渲染作者信息
  if (photographer) {
    document.getElementById('authorAvatar').src = photographer.avatar;
    document.getElementById('authorName').textContent = photographer.name;
    document.getElementById('authorLocation').textContent = photographer.location;
    document.getElementById('authorFollowers').textContent = `${formatNumber(photographer.followers)} 粉丝`;
    
    // 绑定作者链接
    document.getElementById('authorCard').onclick = () => {
      window.location.href = `photographer.html?id=${photographer.id}`;
    };
  }
  
  // 渲染相关推荐
  renderRelatedWorks(work);
  
  // 存储当前作品索引
  currentWorkIndex = galleryData.works.findIndex(w => w.id === workId);
}

// 渲染相关作品
function renderRelatedWorks(currentWork) {
  const container = document.getElementById('relatedWorks');
  if (!container) return;
  
  container.innerHTML = '';
  
  // 根据分类获取相关作品
  const relatedWorks = galleryData.works
    .filter(w => w.id !== currentWork.id)
    .filter(w => w.categories.some(c => currentWork.categories.includes(c)))
    .slice(0, 4);
  
  relatedWorks.forEach(work => {
    const photographer = galleryData.photographers.find(p => p.id === work.photographer);
    const card = document.createElement('a');
    card.href = `detail.html?id=${work.id}`;
    card.className = 'work-card';
    card.innerHTML = `
      <div class="work-card-image">
        <img src="${work.thumbnail}" alt="${work.title}" loading="lazy">
      </div>
      <div class="work-card-info">
        <h3 class="work-card-title">${work.title}</h3>
        <div class="work-card-meta">
          <div class="work-card-author">
            <span>${photographer?.name || '匿名'}</span>
          </div>
          <div class="work-card-stats">
            <span>❤️ ${formatNumber(work.likes)}</span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// 渲染摄影师主页
function renderPhotographerProfile() {
  const params = new URLSearchParams(window.location.search);
  const photographerId = params.get('id') || 'p001';
  
  const photographer = galleryData.photographers.find(p => p.id === photographerId);
  
  if (!photographer) {
    document.getElementById('photographerPage').innerHTML = '<div class="empty-state"><div class="empty-state-icon">👤</div><h2 class="empty-state-title">摄影师不存在</h2></div>';
    return;
  }
  
  // 更新页面标题
  document.title = `${photographer.name} - 游导旅游作品库`;
  
  // 渲染基本信息
  document.getElementById('photographerAvatar').src = photographer.avatar;
  document.getElementById('photographerName').textContent = photographer.name;
  document.getElementById('photographerLocation').innerHTML = `<span>📍</span> ${photographer.location}`;
  document.getElementById('photographerBio').textContent = photographer.bio;
  
  // 渲染统计数据
  document.getElementById('followerCount').textContent = formatNumber(photographer.followers);
  document.getElementById('totalLikes').textContent = formatNumber(photographer.likes);
  document.getElementById('workCount').textContent = photographer.works;
  
  // 渲染徽章
  const badgesContainer = document.getElementById('photographerBadges');
  badgesContainer.innerHTML = photographer.badges.map(badge => 
    `<span class="badge">${badge}</span>`
  ).join('');
  
  // 渲染作品
  renderPhotographerWorks(photographer.id);
}

// 渲染摄影师作品
function renderPhotographerWorks(photographerId) {
  const container = document.getElementById('photographerWorks');
  if (!container) return;
  
  container.innerHTML = '';
  
  const works = galleryData.works.filter(w => w.photographer === photographerId);
  
  works.forEach(work => {
    const item = document.createElement('div');
    item.className = 'masonry-item';
    item.innerHTML = `
      <div class="work-card" onclick="goToDetail('${work.id}')">
        <div class="work-card-image">
          <img src="${work.thumbnail}" alt="${work.title}" loading="lazy">
          <div class="work-card-overlay">
            <div class="work-card-actions">
              <button class="work-card-action" onclick="event.stopPropagation(); toggleLike('${work.id}')" title="点赞">
                <span>❤️</span>
              </button>
              <button class="work-card-action" onclick="event.stopPropagation(); toggleFavorite('${work.id}')" title="收藏">
                <span>⭐</span>
              </button>
            </div>
          </div>
        </div>
        <div class="work-card-info">
          <h3 class="work-card-title">${work.title}</h3>
          <div class="work-card-meta">
            <div class="work-card-stats">
              <span>❤️ ${formatNumber(work.likes)}</span>
              <span>👁️ ${formatNumber(work.views)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(item);
  });
  
  setTimeout(() => initMasonry(), 100);
}

// 渲染专辑列表
function renderAlbums() {
  const container = document.getElementById('albumsGrid');
  if (!container) return;
  
  container.innerHTML = '';
  
  galleryData.albums.forEach(album => {
    const photographer = galleryData.photographers.find(p => p.id === album.photographer);
    const card = document.createElement('div');
    card.className = 'album-card';
    card.onclick = () => {
      // 专辑详情页暂时跳转到筛选该摄影师的作品
      window.location.href = `index.html?photographer=${album.photographer}`;
    };
    card.innerHTML = `
      <div class="album-card-image">
        <img src="${album.cover}" alt="${album.title}" loading="lazy">
        <div class="album-card-overlay">
          <div class="album-card-works">📷 ${album.works} 张作品</div>
        </div>
      </div>
      <div class="album-card-content">
        <h3 class="album-card-title">${album.title}</h3>
        <p class="album-card-desc">${album.description}</p>
        <div class="album-card-footer">
          <span>👤 ${photographer?.name || '匿名'}</span>
          <span>❤️ ${formatNumber(album.likes)}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// 渲染技巧列表
function renderTips() {
  const container = document.getElementById('tipsGrid');
  if (!container) return;
  
  container.innerHTML = '';
  
  galleryData.tips.forEach(tip => {
    const categoryNames = {
      camera: '器材推荐',
      technique: '拍摄技巧',
      location: '拍摄地点',
      post: '后期处理'
    };
    
    const card = document.createElement('div');
    card.className = 'tip-card';
    card.innerHTML = `
      <div class="tip-card-image">
        <img src="${tip.image}" alt="${tip.title}" loading="lazy">
      </div>
      <div class="tip-card-content">
        <span class="tip-card-category">${categoryNames[tip.category] || tip.category}</span>
        <h3 class="tip-card-title">${tip.title}</h3>
        <p class="tip-card-summary">${tip.summary}</p>
        <div class="tip-card-footer">
          <span>👁️ ${formatNumber(tip.views)} 阅读</span>
          <span>❤️ ${formatNumber(tip.likes)} 点赞</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// 初始化分类筛选
function initCategoryFilter() {
  document.querySelectorAll('.category-tag[data-filter]').forEach(tag => {
    tag.addEventListener('click', () => {
      const filterType = tag.dataset.filterType;
      const filterValue = tag.dataset.filter;
      
      // 更新选中状态
      document.querySelectorAll(`.category-tag[data-filter-type="${filterType}"]`).forEach(t => {
        t.classList.remove('active');
      });
      tag.classList.add('active');
      
      // 更新筛选条件
      currentFilter[filterType] = filterValue;
      
      // 重新渲染作品
      renderWorks(galleryData.works);
    });
  });
}

// 初始化上传表单
function initUploadForm() {
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('fileInput');
  const previewContainer = document.getElementById('uploadPreview');
  const tagInput = document.getElementById('tagInput');
  const tagContainer = document.getElementById('tagContainer');
  
  if (!dropzone) return;
  
  let uploadedFiles = [];
  let tags = [];
  
  // 点击上传
  dropzone.addEventListener('click', () => fileInput.click());
  
  // 文件选择
  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });
  
  // 拖拽上传
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--primary)';
  });
  
  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'var(--border)';
  });
  
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--border)';
    handleFiles(e.dataTransfer.files);
  });
  
  // 处理文件
  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        uploadedFiles.push(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = document.createElement('div');
          preview.className = 'upload-preview-item';
          preview.innerHTML = `
            <img src="${e.target.result}" alt="预览">
            <button class="upload-preview-remove" onclick="removeFile(${uploadedFiles.length - 1})">×</button>
          `;
          previewContainer.appendChild(preview);
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // 移除文件
  window.removeFile = (index) => {
    uploadedFiles.splice(index, 1);
    previewContainer.innerHTML = '';
    uploadedFiles.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.createElement('div');
        preview.className = 'upload-preview-item';
        preview.innerHTML = `
          <img src="${e.target.result}" alt="预览">
          <button class="upload-preview-remove" onclick="removeFile(${i})">×</button>
        `;
        previewContainer.appendChild(preview);
      };
      reader.readAsDataURL(file);
    });
  };
  
  // 标签输入
  if (tagInput) {
    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const value = tagInput.value.trim().replace(',', '');
        if (value && !tags.includes(value)) {
          tags.push(value);
          renderTags();
        }
        tagInput.value = '';
      }
    });
  }
  
  function renderTags() {
    if (!tagContainer) return;
    tagContainer.innerHTML = tags.map(tag => `
      <span class="tag-item">
        ${tag}
        <button onclick="removeTag('${tag}')">×</button>
      </span>
    `).join('');
  }
  
  window.removeTag = (tag) => {
    tags = tags.filter(t => t !== tag);
    renderTags();
  };
  
  // 表单提交
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (uploadedFiles.length === 0) {
        alert('请至少上传一张图片');
        return;
      }
      
      // 模拟提交
      const submitBtn = uploadForm.querySelector('.btn-primary');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '上传中...';
      submitBtn.disabled = true;
      
      setTimeout(() => {
        alert('作品上传成功！等待审核后即可展示。');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        // 重置表单
        uploadForm.reset();
        uploadedFiles = [];
        tags = [];
        previewContainer.innerHTML = '';
        renderTags();
      }, 2000);
    });
  }
}

// 初始化灯箱
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
    if (e.key === 'ArrowLeft') {
      navigateLightbox(-1);
    }
    if (e.key === 'ArrowRight') {
      navigateLightbox(1);
    }
  });
}

// 打开灯箱
function openLightbox(imageSrc) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  
  if (!lightbox || !lightboxImage) return;
  
  lightboxImage.src = imageSrc;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// 关闭灯箱
function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

// 灯箱导航
function navigateLightbox(direction) {
  if (!galleryData || currentWorkIndex === undefined) return;
  
  let newIndex = currentWorkIndex + direction;
  if (newIndex < 0) newIndex = galleryData.works.length - 1;
  if (newIndex >= galleryData.works.length) newIndex = 0;
  
  currentWorkIndex = newIndex;
  const newWork = galleryData.works[newIndex];
  document.getElementById('lightboxImage').src = newWork.image;
}

// 跳转详情页
function goToDetail(workId) {
  window.location.href = `detail.html?id=${workId}`;
}

// 点赞
function toggleLike(workId) {
  const work = galleryData.works.find(w => w.id === workId);
  if (work) {
    work.likes += 1;
    // 模拟本地存储
    const liked = JSON.parse(localStorage.getItem('gallery_liked') || '[]');
    if (!liked.includes(workId)) {
      liked.push(workId);
      localStorage.setItem('gallery_liked', JSON.stringify(liked));
      renderWorks(galleryData.works);
    }
  }
}

// 收藏
function toggleFavorite(workId) {
  const favorites = JSON.parse(localStorage.getItem('gallery_favorites') || '[]');
  const index = favorites.indexOf(workId);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(workId);
    alert('已添加到收藏夹');
  }
  
  localStorage.setItem('gallery_favorites', JSON.stringify(favorites));
}

// 分享
function shareWork(workId) {
  const work = galleryData.works.find(w => w.id === workId);
  if (work && navigator.share) {
    navigator.share({
      title: work.title,
      text: `来看看我在游导旅游作品库分享的作品：${work.title}`,
      url: window.location.origin + `/gallery/detail.html?id=${workId}`
    });
  } else {
    // 复制链接
    const url = window.location.origin + `/gallery/detail.html?id=${workId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('链接已复制到剪贴板');
    });
  }
}

// 工具函数
function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// 滚动加载更多
let isLoading = false;
window.addEventListener('scroll', () => {
  if (isLoading) return;
  
  const scrollPosition = window.innerHeight + window.scrollY;
  const pageHeight = document.documentElement.scrollHeight;
  
  if (scrollPosition >= pageHeight - 500) {
    // 模拟加载更多
    isLoading = true;
    setTimeout(() => {
      // 可以在这里加载更多数据
      isLoading = false;
    }, 1000);
  }
});
