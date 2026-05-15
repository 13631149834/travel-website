(function(){
function initTouch(){
  // Nav toggle - use click instead of touchstart+preventDefault
  var nb=document.querySelector('.nav-toggle'),nl=document.querySelector('.nav-links')||document.getElementById('navLinks');
  if(nb&&nl){nb.addEventListener('click',function(e){e.preventDefault();nl.classList.toggle('show');nl.classList.toggle('open');});}
  // All interactive elements use click + touch-action:manipulation CSS
  // NO touchstart+preventDefault - it blocks scrolling!
  // touch-action:manipulation removes 300ms delay without breaking scroll
}

  // Quiz option - use click naturally, touch-action:manipulation handles delay
  // Removed touchstart+preventDefault to preserve scrolling
var S={
home:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m11-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0s0-6 0-7a1 1 0 011-1h4a1 1 0 011 1v7m-6 0h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
study:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M9 7h6M9 11h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
quiz:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="5" y="5" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M9 5a3 3 0 016 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
map:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 6.75L15 5.25M9 6.75L3 8.25V18.75L9 17.25M9 6.75V17.25M15 5.25L21 3.75V14.25L15 15.75M15 5.25V15.75M9 17.25L15 15.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="11" r="1.5" fill="currentColor"/><path d="M12 12.5v2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
me:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M4 21v-1a6 6 0 0112 0v1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M21 21v-1a6 6 0 00-4-5.66" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/></svg>'
};
function initBar(){
  if(window.innerWidth>768||document.getElementById('bb'))return;
  var pg=location.pathname.split('/').pop()||'index.html';
  var S2='\x3csvg width="22" height="22" viewBox="0 0 24 24" fill="none"\x3e\x3cpath d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/\x3e\x3c/svg\x3e';var ts=[{s:S.home,n:'首页',p:'index.html'},{s:S.study,n:'学习',p:'exam-guide.html'},{s:S2,n:'AI',p:'chat.html'},{s:S.quiz,n:'刷题',p:'exam-simulator.html'},{s:S.me,n:'我的',p:'resources.html'}];
  var b=document.createElement('div');b.id='bb';
  b.style.cssText='position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #E5E7EB;display:flex;z-index:9990;padding:5px 0;padding-bottom:calc(5px + env(safe-area-inset-bottom));box-shadow:0 -1px 8px rgba(0,0,0,0.05);';
  ts.forEach(function(t){
    var a=pg===t.p,el=document.createElement('a');el.href=t.p;
    el.style.cssText='flex:1;display:flex;flex-direction:column;align-items:center;text-decoration:none;gap:1px;transition:color .15s;'+(a?'color:#4C8BF5;':'color:#bbb;');
    el.innerHTML=t.s+'<span style="font-size:10px;font-weight:'+(a?'600':'400')+'">'+t.n+'</span>';
    b.appendChild(el);
  });
  document.body.appendChild(b);document.body.style.paddingBottom='60px';
}
function clean(){
  var h=document.getElementById('ghint');if(h)h.remove();
  new MutationObserver(function(){var h=document.getElementById('ghint');if(h)h.remove();}).observe(document.body,{childList:true});
  var b=document.querySelector('.back-to-top');if(b)b.style.display='none';
  var g=document.querySelector('.gw');if(g)g.style.bottom='68px';
}
function init(){initTouch();initBar();clean();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

// CSS Enhancements
(function(){
  var s=document.createElement('style');
  s.textContent=`
    /* Global touch-action to remove 300ms delay WITHOUT breaking scroll */
    button,a,.tab-btn,.detail-tab,.mode-tab,.gqopt,.gst[onclick],.nav-toggle,[onclick]{touch-action:manipulation!important;-webkit-tap-highlight-color:transparent;}
    /* Tab nav horizontal scroll fix */
    .tab-nav,.tab-bar,.tabs{overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;touch-action:pan-x manipulation!important;}
    .tab-nav::-webkit-scrollbar,.tab-bar::-webkit-scrollbar,.tabs::-webkit-scrollbar{display:none!important;}
    .tab-btn{min-height:38px;min-width:48px;padding:7px 12px!important;border-radius:20px!important;font-size:0.85rem!important;font-weight:500!important;transition:all .15s!important;white-space:nowrap!important;}
    .tab-btn.active{background:#4C8BF5!important;color:#fff!important;box-shadow:0 2px 8px rgba(76,139,245,.25)!important;}
    .tab-bar,.tabs{gap:5px!important;flex-wrap:nowrap!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;padding:4px 0!important;scrollbar-width:none;}
    .tab-bar::-webkit-scrollbar,.tabs::-webkit-scrollbar{display:none;}
    .glass-card:active{transform:scale(0.98);}
    .section{padding:14px 0!important;}
    .pricing-card.featured{box-shadow:0 0 0 2px #4C8BF5,0 8px 24px rgba(76,139,245,.18)!important;}
    .btn-primary:active,.btn-secondary:active{transform:scale(0.97)!important;opacity:0.9;}
    .hero{padding:50px 16px 30px!important;}
    .hero h1{font-size:clamp(1.8rem,7vw,2.8rem)!important;margin-bottom:8px!important;}
    .hero p{font-size:0.95rem!important;}
    .container{padding:0 14px!important;}
    .card{padding:18px!important;}
    .game-entry-card{animation:gpulse 3s ease-in-out infinite;}
    @keyframes gpulse{0%,100%{box-shadow:0 4px 15px rgba(76,139,245,.15)}50%{box-shadow:0 4px 25px rgba(76,139,245,.35)}}
    .core-card{position:relative;overflow:hidden;}
    footer,.footer{margin-bottom:60px!important;}
    .mode-tab{min-height:60px!important;touch-action:manipulation!important;}
    .detail-tab{min-height:36px;min-width:60px;padding:6px 12px!important;border-radius:16px!important;font-size:0.82rem!important;}
    .detail-tab.active{background:#4C8BF5!important;color:#fff!important;}
    .page-header{padding:18px 16px 10px!important;}
    .page-header h1{font-size:1.3rem!important;margin-bottom:4px!important;}
    .page-desc{font-size:0.82rem!important;}
    .section-title{font-size:1.05rem!important;margin-bottom:12px!important;}
    .core-card{padding:16px!important;}
    .core-card h3{font-size:0.95rem!important;}
    .core-card p{font-size:0.82rem!important;margin-bottom:8px!important;}
    .card{padding:14px!important;margin-bottom:10px!important;}
    .faq-list{margin-top:12px!important;}
    .faq-question,.faq-q{font-size:0.88rem!important;padding:10px 12px!important;}
    .faq-answer,.faq-a{font-size:0.82rem!important;padding:8px 12px!important;}

    .gqopt:active{transform:scale(0.97);border-color:#4C8BF5!important;background:#F0F5FF!important;}
    .gst[onclick]{cursor:pointer;transition:background .15s;}
    .gst[onclick]:active{background:#F0F5FF;border-radius:8px;}
    .gst[onclick]:hover{background:#F9FAFB;border-radius:8px;}

  `;
  document.head.appendChild(s);
})();

// First visit guide
(function(){
  if(localStorage.getItem('yd_g2'))return;
  setTimeout(function(){
    var h=document.createElement('div');h.id='gOv';
    h.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
    h.innerHTML='<div style="background:#fff;border-radius:20px;padding:28px 24px;max-width:300px;text-align:center;animation:gP .4s ease"><div style="font-size:44px;margin-bottom:10px">🎮</div><div style="font-size:17px;font-weight:700;color:#1A1A1A;margin-bottom:6px">欢迎来到游导旅游</div><div style="font-size:13px;color:#666;margin-bottom:16px;line-height:1.7">像玩游戏一样备考导游证<br>闯关·刷题·升级·拿证</div><button onclick="document.getElementById(\'gOv\').remove();localStorage.setItem(\'yd_g2\',\'1\')" style="background:linear-gradient(135deg,#4C8BF5,#7C3AED);color:#fff;border:none;padding:12px 36px;border-radius:24px;font-size:14px;font-weight:600;cursor:pointer">开始冒险 →</button></div>';
    document.body.appendChild(h);
  },1200);
})();


// Privacy consent banner
(function(){
  if(localStorage.getItem('yd_privacy_ok'))return;
  setTimeout(function(){
    var b=document.createElement('div');b.id='pCon';
    b.style.cssText='position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #E5E7EB;padding:14px 16px;padding-bottom:calc(14px + env(safe-area-inset-bottom));z-index:99999;box-shadow:0 -2px 12px rgba(0,0,0,0.1);';
    b.innerHTML='<div style="max-width:480px;margin:0 auto;"><div style="font-size:0.82rem;color:#666;line-height:1.6;margin-bottom:10px;">🔒 我们使用浏览器本地存储保存你的学习进度（不收集个人信息），AI对话会发送到第三方处理。<a href="privacy.html" style="color:#4C8BF5;font-weight:500;">查看隐私政策</a></div><div style="display:flex;gap:8px;justify-content:flex-end;"><button onclick="document.getElementById(\'pCon\').remove();localStorage.setItem(\'yd_privacy_ok\',\'1\')" style="background:#4C8BF5;color:#fff;border:none;padding:8px 20px;border-radius:18px;font-size:0.82rem;font-weight:600;cursor:pointer;">我知道了</button></div></div>';
    document.body.appendChild(b);
    // Adjust bottom bar if exists
    var bb=document.getElementById('bb');if(bb)bb.style.bottom='80px';
    // Remove adjustment after consent
    var origRemove=b.remove.bind(b);
  },2500);
})();
