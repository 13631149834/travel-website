// Mobile Touch Fix + Bottom Tab Bar
(function(){
  // ========== 触摸修复 ==========
  function initTouch(){
    // 1. 导航菜单toggle
    var navBtn = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links') || document.getElementById('navLinks');
    if(navBtn && navLinks){
      navBtn.addEventListener('touchstart', function(e){
        e.preventDefault();
        navLinks.classList.toggle('show');
        navLinks.classList.toggle('open');
      }, {passive:false});
    }
    
    // 2. Tab按钮 - touchstart直接执行onclick内容
    document.querySelectorAll('.tab-btn, .detail-tab, .mode-tab').forEach(function(btn){
      btn.addEventListener('touchstart', function(e){
        e.preventDefault();
        var oc = btn.getAttribute('onclick');
        if(oc){ try { eval(oc); } catch(ex) { btn.click(); } }
      }, {passive:false});
    });
    
    // 3. 所有带onclick的可点击元素
    document.querySelectorAll('button[onclick], div[onclick]').forEach(function(el){
      if(el.classList.contains('tab-btn') || el.classList.contains('mode-tab') || el.classList.contains('detail-tab') || el.classList.contains('nav-toggle')) return;
      el.addEventListener('touchstart', function(e){
        e.preventDefault();
        var oc = el.getAttribute('onclick');
        if(oc){ try { eval(oc); } catch(ex) {} }
      }, {passive:false});
    });
    
    // 4. 事件委托：动态生成的元素
    document.addEventListener('touchstart', function(e){
      var dt = e.target.closest('.detail-tab, [onclick*="switchTab"], [onclick*="switchMode"], [onclick*="filterPosts"]');
      if(dt && !dt._touchBound){
        dt._touchBound = true;
        var oc = dt.getAttribute('onclick');
        if(oc){ try { eval(oc); } catch(ex) {} }
      }
    }, {passive:false});
  }
  
  // ========== 底部Tab Bar ==========
  function initTabBar(){
    // 只在移动端显示
    if(window.innerWidth > 768) return;
    
    // 如果已有底部栏就不重复创建
    if(document.getElementById('bottomBar')) return;
    
    var currentPage = location.pathname.split('/').pop() || 'index.html';
    
    var tabs = [
      {icon:'🏠', name:'首页', page:'index.html'},
      {icon:'📖', name:'备考', page:'exam-guide.html'},
      {icon:'📝', name:'刷题', page:'exam-simulator.html'},
      {icon:'🗺️', name:'省份', page:'province-exam.html'},
      {icon:'🤖', name:'助手', page:'chat.html'}
    ];
    
    var bar = document.createElement('div');
    bar.id = 'bottomBar';
    bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #E5E7EB;display:flex;z-index:9990;padding:4px 0 env(safe-area-inset-bottom);box-shadow:0 -2px 10px rgba(0,0,0,0.06);';
    
    tabs.forEach(function(tab){
      var isActive = currentPage === tab.page;
      var item = document.createElement('a');
      item.href = tab.page;
      item.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;padding:6px 0;text-decoration:none;' + 
        (isActive ? 'color:#4C8BF5;' : 'color:#999;');
      item.innerHTML = '<span style="font-size:18px;line-height:1">' + tab.icon + '</span>' +
        '<span style="font-size:10px;margin-top:2px;font-weight:' + (isActive?'600':'400') + '">' + tab.name + '</span>';
      bar.appendChild(item);
    });
    
    document.body.appendChild(bar);
    
    // 给body加padding避免内容被底部栏遮挡
    document.body.style.paddingBottom = '60px';
  }
  
  // ========== 清理浮动元素 ==========
  function cleanFloating(){
    // 隐藏game hint（左下角浮动提示）
    var ghint = document.getElementById('ghint');
    if(ghint) ghint.style.display = 'none';
    // 3秒后自动消失的也拦截
    var observer = new MutationObserver(function(mutations){
      var hint = document.getElementById('ghint');
      if(hint) hint.style.display = 'none';
    });
    observer.observe(document.body, {childList:true});
    
    // 隐藏back-to-top按钮（有底部栏了不需要）
    var btt = document.querySelector('.back-to-top');
    if(btt) btt.style.display = 'none';
    
    // 调整游戏按钮位置到右下角底部栏上方
    var gw = document.querySelector('.gw');
    if(gw) gw.style.bottom = '68px';
  }
  
  // ========== 初始化 ==========
  function init(){
    initTouch();
    initTabBar();
    cleanFloating();
  }
  
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
