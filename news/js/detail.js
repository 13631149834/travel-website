// 资讯详情页 JavaScript
// =========================

let newsData = null;
let currentArticle = null;
let comments = [];
let liked = false;

document.addEventListener('DOMContentLoaded', async function() {
  await loadNewsData();
  loadArticle();
  loadComments();
  renderRelatedArticles();
});

async function loadNewsData() {
  try {
    const response = await fetch('../data/news.json');
    newsData = await response.json();
  } catch (error) {
    console.error('加载新闻数据失败:', error);
  }
}

function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return minutes <= 0 ? '刚刚' : minutes + '分钟前';
  }
  
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return hours + '小时前';
  }
  
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return days + '天前';
  }
  
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

function getCategoryInfo(categoryId) {
  const category = newsData.categories.find(c => c.id === categoryId);
  if (!category) return { name: '其他', icon: '📰', color: '#6b7280' };
  return category;
}

function loadArticle() {
  const articleId = getUrlParam('id') || 'a001';
  
  currentArticle = newsData.articles.find(a => a.id === articleId) || 
                   newsData.headlines.find(h => h.id === articleId);
  
  if (!currentArticle) {
    currentArticle = newsData.articles[0];
  }
  
  const cat = getCategoryInfo(currentArticle.category);
  
  document.title = currentArticle.title + ' - 游导旅游';
  
  document.getElementById('breadcrumbCategory').innerHTML = 
    `<a href="search.html?category=${cat.id}" class="hover:text-primary">${cat.icon} ${cat.name}</a>`;
  document.getElementById('breadcrumbTitle').textContent = currentArticle.title;
  
  document.getElementById('articleCategory').style.backgroundColor = cat.color;
  document.getElementById('articleCategory').textContent = `${cat.icon} ${cat.name}`;
  document.getElementById('articleTime').textContent = formatDate(currentArticle.publishTime);
  document.getElementById('articleSource').textContent = '来源：' + (currentArticle.source || '游导旅游');
  document.getElementById('articleTitle').textContent = currentArticle.title;
  document.getElementById('articleSummary').textContent = currentArticle.summary;
  document.getElementById('articleImage').src = currentArticle.image;
  document.getElementById('articleImage').alt = currentArticle.title;
  
  const tagsContainer = document.getElementById('articleTags');
  if (currentArticle.tags && currentArticle.tags.length > 0) {
    tagsContainer.innerHTML = currentArticle.tags.map(tag => 
      `<a href="search.html?q=${encodeURIComponent(tag)}" class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-primary hover:text-white transition">#${tag}</a>`
    ).join('');
  }
  
  const contentContainer = document.getElementById('articleContent');
  if (currentArticle.content) {
    let html = currentArticle.content
      .split('\n')
      .map(line => {
        line = line.trim();
        if (!line) return '';
        if (/^\d+\./.test(line)) {
          return `<li>${line.replace(/^\d+\.\s*/, '')}</li>`;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return `<li>${line.substring(2)}</li>`;
        }
        if (/^#{1,3}\s/.test(line)) {
          const level = line.match(/^(#{1,3})\s/)[1].length;
          const text = line.replace(/^#{1,3}\s/, '');
          return `<h${level + 1}>${text}</h${level + 1}>`;
        }
        return `<p>${line}</p>`;
      })
      .join('');
    
    html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, '<ul>$&</ul>');
    
    contentContainer.innerHTML = html;
  }
  
  document.getElementById('likeCount').textContent = formatNumber(currentArticle.likeCount);
  document.getElementById('viewCount').textContent = formatNumber(currentArticle.viewCount);
  document.getElementById('commentCount').textContent = formatNumber(currentArticle.commentCount);
  document.getElementById('commentTotal').textContent = '(' + currentArticle.commentCount + ')';
}

function loadComments() {
  comments = [
    {
      id: 1,
      user: '旅行达人',
      avatar: '🎒',
      content: '这篇文章太实用了！正好计划去日本旅游，刚好看到这篇签证攻略，太及时了！',
      time: '2小时前',
      likes: 45
    },
    {
      id: 2,
      user: '小绿叶',
      avatar: '🍃',
      content: '感谢分享！有一点想补充一下，关于在职证明的格式，每个领区可能略有不同，建议提前咨询一下。',
      time: '5小时前',
      likes: 23
    },
    {
      id: 3,
      user: '背包客老张',
      avatar: '🎒',
      content: '签证材料确实简化了不少，去年办的时候还要房产证，现在不用了确实方便很多。',
      time: '1天前',
      likes: 12
    }
  ];
  
  renderComments();
}

function renderComments() {
  const container = document.getElementById('commentsList');
  
  container.innerHTML = comments.map(comment => `
    <div class="comment-item">
      <div class="flex gap-4">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg">
          ${comment.avatar}
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-semibold text-gray-800">${comment.user}</span>
            <span class="comment-time">${comment.time}</span>
          </div>
          <p class="text-gray-600 leading-relaxed">${comment.content}</p>
          <div class="flex items-center gap-4 mt-3">
            <button onclick="likeComment(${comment.id})" class="flex items-center gap-1 text-gray-400 hover:text-red-500 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <span class="text-sm">${comment.likes}</span>
            </button>
            <button onclick="replyComment(${comment.id})" class="flex items-center gap-1 text-gray-400 hover:text-primary transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
              </svg>
              <span class="text-sm">回复</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function handleLike() {
  liked = !liked;
  const likeCount = document.getElementById('likeCount');
  let count = parseInt(currentArticle.likeCount);
  
  if (liked) {
    count++;
    likeCount.parentElement.classList.add('text-red-500');
  } else {
    count--;
    likeCount.parentElement.classList.remove('text-red-500');
  }
  
  currentArticle.likeCount = count;
  likeCount.textContent = formatNumber(count);
  
  showToast(liked ? '已点赞 ❤️' : '取消点赞');
}

function likeComment(id) {
  const comment = comments.find(c => c.id === id);
  if (comment) {
    comment.likes++;
    renderComments();
  }
}

function replyComment(id) {
  const comment = comments.find(c => c.id === id);
  if (comment) {
    const input = document.getElementById('commentInput');
    input.value = `@${comment.user} `;
    input.focus();
    showToast('正在回复 ' + comment.user);
  }
}

function submitComment() {
  const input = document.getElementById('commentInput');
  const content = input.value.trim();
  
  if (!content) {
    showToast('请输入评论内容');
    return;
  }
  
  const newComment = {
    id: Date.now(),
    user: '我',
    avatar: '👤',
    content: content,
    time: '刚刚',
    likes: 0
  };
  
  comments.unshift(newComment);
  input.value = '';
  renderComments();
  
  const commentCount = document.getElementById('commentCount');
  const commentTotal = document.getElementById('commentTotal');
  currentArticle.commentCount++;
  commentCount.textContent = formatNumber(currentArticle.commentCount);
  commentTotal.textContent = '(' + currentArticle.commentCount + ')';
  
  showToast('评论发布成功！');
}

function shareTo(platform) {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(currentArticle.title);
  
  switch (platform) {
    case 'wechat':
      showToast('请复制链接分享到微信');
      break;
    case 'weibo':
      window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${title}`, '_blank');
      break;
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    showToast('链接已复制到剪贴板');
  }).catch(() => {
    showToast('复制失败，请手动复制');
  });
}

function renderRelatedArticles() {
  const container = document.getElementById('relatedArticles');
  
  if (!newsData.articles) return;
  
  const related = newsData.articles
    .filter(a => a.category === currentArticle.category && a.id !== currentArticle.id)
    .slice(0, 4);
  
  container.innerHTML = related.map(article => `
    <a href="detail.html?id=${article.id}" class="flex gap-3 group">
      <div class="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
        <img src="${article.image}" alt="${article.title}" class="w-full h-full object-cover group-hover:scale-110 transition duration-300">
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="font-medium text-gray-800 line-clamp-2 group-hover:text-primary transition text-sm">${article.title}</h4>
        <p class="text-xs text-gray-400 mt-1">${formatTime(article.publishTime)}</p>
      </div>
    </a>
  `).join('');
  
  if (related.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-sm">暂无相关资讯</p>';
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  toastMessage.textContent = message;
  toast.classList.remove('opacity-0');
  toast.classList.add('opacity-100');
  
  setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0');
  }, 2000);
}

function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('hidden');
}
