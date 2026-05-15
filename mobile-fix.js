(function(){
function initTouch(){
  var nb=document.querySelector('.nav-toggle'),nl=document.querySelector('.nav-links')||document.getElementById('navLinks');
  if(nb&&nl){nb.addEventListener('touchstart',function(e){e.preventDefault();nl.classList.toggle('show');nl.classList.toggle('open');},{passive:false});}
  document.querySelectorAll('.tab-btn,.detail-tab,.mode-tab').forEach(function(b){b.addEventListener('touchstart',function(e){e.preventDefault();var o=b.getAttribute('onclick');if(o){try{eval(o)}catch(x){b.click()}}},{passive:false});});
  document.querySelectorAll('button[onclick],div[onclick]').forEach(function(el){
    if(el.classList.contains('tab-btn')||el.classList.contains('mode-tab')||el.classList.contains('detail-tab')||el.classList.contains('nav-toggle'))return;
    el.addEventListener('touchstart',function(e){e.preventDefault();var o=el.getAttribute('onclick');if(o){try{eval(o)}catch(x){}}},{passive:false});
  });
  document.addEventListener('touchstart',function(e){var d=e.target.closest('.detail-tab,[onclick*="switchTab"],[onclick*="switchMode"],[onclick*="filterPosts"]');if(d&&!d._tb){d._tb=1;var o=d.getAttribute('onclick');if(o){try{eval(o)}catch(x){}}}},{passive:false});
}
var S={
home:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m11-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0s0-6 0-7a1 1 0 011-1h4a1 1 0 011 1v7m-6 0h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
study:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M9 7h6M9 11h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
quiz:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="5" y="5" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M9 5a3 3 0 016 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
map:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 6.75L15 5.25M9 6.75L3 8.25V18.75L9 17.25M9 6.75V17.25M15 5.25L21 3.75V14.25L15 15.75M15 5.25V15.75M9 17.25L15 15.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="11" r="1.5" fill="currentColor"/><path d="M12 12.5v2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
ai:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="currentColor"/><circle cx="8" cy="10" r="1" fill="currentColor"/><circle cx="16" cy="10" r="1" fill="currentColor"/><path d="M9 15c.8.8 1.9 1.2 3 1.2s2.2-.4 3-1.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
};
function initBar(){
  if(window.innerWidth>768||document.getElementById('bb'))return;
  var pg=location.pathname.split('/').pop()||'index.html';
  var ts=[{s:S.home,n:'首页',p:'index.html'},{s:S.study,n:'学习',p:'exam-guide.html'},{s:S.quiz,n:'刷题',p:'exam-simulator.html'},{s:S.map,n:'省份',p:'province-exam.html'},{s:S.ai,n:'AI',p:'chat.html'}];
  var b=document.createElement('div');b.id='bb';
  b.style.cssText='position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #E5E7EB;display:flex;z-index:9990;padding:6px 0;padding-bottom:calc(6px + env(safe-area-inset-bottom));box-shadow:0 -1px 8px rgba(0,0,0,0.05);';
  ts.forEach(function(t){
    var a=pg===t.p,el=document.createElement('a');el.href=t.p;
    el.style.cssText='flex:1;display:flex;flex-direction:column;align-items:center;text-decoration:none;gap:1px;transition:color .15s;'+(a?'color:#4C8BF5;':'color:#aaa;');
    el.innerHTML=t.s+'<span style="font-size:10px;font-weight:'+(a?'600':'400')+'">'+t.n+'</span>';
    b.appendChild(el);
  });
  document.body.appendChild(b);document.body.style.paddingBottom='64px';
}
function clean(){
  var h=document.getElementById('ghint');if(h)h.remove();
  new MutationObserver(function(){var h=document.getElementById('ghint');if(h)h.remove();}).observe(document.body,{childList:true});
  var b=document.querySelector('.back-to-top');if(b)b.style.display='none';
  var g=document.querySelector('.gw');if(g)g.style.bottom='72px';
}
function init(){initTouch();initBar();clean();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

// Global CSS Enhancements
(function(){
  var s=document.createElement('style');
  s.textContent=`
    /* Tab按钮增强 - 更大触摸区域+醒目选中态 */
    .tab-btn{min-height:40px;min-width:52px;padding:8px 14px!important;border-radius:20px!important;font-size:0.88rem!important;font-weight:500!important;transition:all .2s!important;}
    .tab-btn.active{background:#4C8BF5!important;color:#fff!important;box-shadow:0 2px 8px rgba(76,139,245,.3)!important;transform:scale(1.02);}
    .tab-bar{gap:6px!important;flex-wrap:nowrap!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;padding:4px 0!important;}
    .tab-bar::-webkit-scrollbar{display:none;}
    
    /* 卡片hover更明显 */
    .glass-card:active{transform:scale(0.98);box-shadow:0 1px 4px rgba(0,0,0,0.08);}
    
    /* section间距优化 - 不再需要滑太多 */
    .section{padding:16px 0!important;}
    .section-title{font-size:1.3rem!important;margin-bottom:6px!important;}
    
    /* 价格卡片突出 */
    .pricing-card.featured{box-shadow:0 0 0 2px #4C8BF5,0 8px 24px rgba(76,139,245,.2)!important;transform:scale(1)!important;}
    
    /* 按钮触摸反馈 */
    .btn-primary:active,.btn-secondary:active,.core-card:active{transform:scale(0.97)!important;opacity:0.9;}
    
    /* hero区更紧凑 */
    .hero{padding:60px 20px 40px!important;}
    .hero h1{font-size:clamp(2rem,7vw,3rem)!important;margin-bottom:10px!important;}
    
    /* 导航栏优化 */
    .nav-links a{padding:10px 14px!important;border-radius:12px!important;font-size:0.9rem!important;}
    .nav-links a:active{background:#F0F5FF!important;}
    
    /* 内容呼吸感 */
    .container{padding:0 16px!important;}
    .card{padding:20px!important;}
    
    /* 游戏入口卡片脉冲动画 */
    .game-entry-card{animation:gpulse 3s ease-in-out infinite;}
    @keyframes gpulse{0%,100%{box-shadow:0 4px 15px rgba(76,139,245,.2)}50%{box-shadow:0 4px 25px rgba(76,139,245,.4)}}
    
    /* 核心卡片高亮 */
    .core-card{position:relative;overflow:hidden;}
    .core-card::after{content:'';position:absolute;top:0;right:0;width:60px;height:60px;background:radial-gradient(circle,rgba(76,139,245,.08),transparent);border-radius:0 14px 0 0;}
    
    /* 页面底部留白给tab bar */
    footer,.footer{margin-bottom:64px!important;}
  `;
  document.head.appendChild(s);
})();

// 首次访问引导
(function(){
  if(localStorage.getItem('yd_guided'))return;
  setTimeout(function(){
    var h=document.createElement('div');
    h.id='guideOverlay';
    h.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
    h.innerHTML='<div style="background:#fff;border-radius:20px;padding:28px;max-width:320px;text-align:center;animation:gP .4s ease"><div style="font-size:48px;margin-bottom:12px">🎮</div><div style="font-size:18px;font-weight:700;color:#1A1A1A;margin-bottom:8px">欢迎来到游导旅游</div><div style="font-size:14px;color:#666;margin-bottom:16px;line-height:1.6">像玩游戏一样备考导游证<br>闯关·刷题·升级·拿证</div><button onclick="document.getElementById(\'guideOverlay\').remove();localStorage.setItem(\'yd_guided\',\'1\')" style="background:linear-gradient(135deg,#4C8BF5,#7C3AED);color:#fff;border:none;padding:12px 36px;border-radius:24px;font-size:15px;font-weight:600;cursor:pointer">开始冒险 →</button></div>';
    document.body.appendChild(h);
  },1500);
})();
