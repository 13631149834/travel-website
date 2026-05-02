// 导游证备考网站 - 通用脚本

function toggleNav() {
  document.querySelector('.nav-links').classList.toggle('open');
}

// Toast提示
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:8px;color:white;font-size:14px;z-index:9999;animation:slideDown 0.3s ease';
  
  const colors = { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' };
  toast.style.backgroundColor = colors[type] || colors.info;
  
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// 微信弹窗功能
function openWechatModal() {
    const wechatId = 'ximao101';
    // 复制到剪贴板
    if (navigator.clipboard) {
        navigator.clipboard.writeText(wechatId).then(() => {
            showWechatDialog(wechatId, true);
        }).catch(() => {
            showWechatDialog(wechatId, false);
        });
    } else {
        showWechatDialog(wechatId, false);
    }
}

function showWechatDialog(wechatId, copied) {
    // 移除已存在的弹窗
    const existingModal = document.getElementById('wechat-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'wechat-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;display:flex;justify-content:center;align-items:center;';
    modal.innerHTML = '<div style="background:#fff;border-radius:16px;padding:40px;max-width:320px;text-align:center;animation:fadeIn 0.3s ease;"><div style="font-size:60px;margin-bottom:15px;">💬</div><h3 style="font-size:20px;margin-bottom:15px;color:#333;">添加客服微信</h3><div style="background:#f5f5f5;padding:15px;border-radius:8px;font-size:24px;font-weight:bold;color:#07c160;margin-bottom:15px;">' + wechatId + '</div><p style="color:#666;font-size:14px;margin-bottom:20px;">' + (copied ? '✅ 微信号已复制到剪贴板<br>' : '') + '长按复制微信号，打开微信添加好友<br>添加时请备注"导游资料"</p><button onclick="document.getElementById(\'wechat-modal\').remove()" style="background:#e5e5e5;border:none;padding:12px 30px;border-radius:8px;cursor:pointer;font-size:16px;">关闭</button></div>';
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
}

// 复制微信到剪贴板
function copyWechat() {
    const wechatId = 'ximao101';
    if (navigator.clipboard) {
        navigator.clipboard.writeText(wechatId).then(() => {
            showToast('微信号已复制！', 'success');
        }).catch(() => {
            openWechatModal();
        });
    } else {
        openWechatModal();
    }
}

// 表单提交处理
function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    // 显示感谢弹窗
    showFormSuccessModal();
    
    // 重置表单
    form.reset();
}

function showFormSuccessModal() {
    // 移除已存在的弹窗
    const existingModal = document.getElementById('success-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'success-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:2000;display:flex;justify-content:center;align-items:center;';
    modal.innerHTML = '<div style="background:#fff;border-radius:20px;padding:40px;max-width:360px;text-align:center;animation:fadeIn 0.3s ease;"><div style="font-size:60px;margin-bottom:15px;">🎉</div><h3 style="font-size:22px;margin-bottom:12px;color:#333;">提交成功！</h3><p style="color:#666;margin-bottom:20px;font-size:15px;line-height:1.6;">请添加客服微信领取资料<br><strong style="color:#07c160;font-size:24px;">ximao101</strong><br><span style="font-size:13px;">备注"领资料"，24小时内发送</span></p><button onclick="document.getElementById(\'success-modal\').remove()" style="background:#07c160;color:#fff;border:none;padding:14px 30px;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;">我知道了</button></div>';
    document.body.appendChild(modal);
}

// 页面加载时添加动画
document.addEventListener('DOMContentLoaded', function() {
  // 平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // 移动端导航
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleNav();
    });
    
    // 点击链接后关闭菜单
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }
});

// 添加淡入动画样式
const style = document.createElement('style');
style.textContent = '@keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }';
document.head.appendChild(style);
