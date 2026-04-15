/**
 * 页面加载进度条功能
 * 使用方法：在HTML中引入此脚本即可自动启用进度条
 */
(function() {
  // 创建进度条元素
  function createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.id = 'pageProgress';
    progressBar.className = 'page-progress';
    progressBar.style.width = '0%';
    document.body.appendChild(progressBar);
    return progressBar;
  }

  // 更新进度条宽度
  function setProgress(width) {
    const progressBar = document.getElementById('pageProgress');
    if (progressBar) {
      progressBar.style.width = width + '%';
    }
  }

  // 隐藏进度条（完成加载）
  function hideProgress() {
    const progressBar = document.getElementById('pageProgress');
    if (progressBar) {
      progressBar.style.width = '100%';
      setTimeout(function() {
        progressBar.style.opacity = '0';
        setTimeout(function() {
          progressBar.remove();
        }, 300);
      }, 200);
    }
  }

  // 初始化进度条
  function init() {
    const progressBar = createProgressBar();
    
    // 初始加载动画
    setProgress(20);
    
    // 模拟加载进度
    let progress = 20;
    const interval = setInterval(function() {
      progress += Math.random() * 15;
      if (progress >= 90) {
        clearInterval(interval);
        setProgress(90);
      } else {
        setProgress(progress);
      }
    }, 200);

    // 页面完全加载后隐藏进度条
    window.addEventListener('load', function() {
      clearInterval(interval);
      setProgress(100);
      hideProgress();
    });

    // 如果 load 事件已触发，直接隐藏
    if (document.readyState === 'complete') {
      clearInterval(interval);
      setProgress(100);
      hideProgress();
    }
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 暴露 API 供手动控制
  window.PageProgress = {
    setProgress: setProgress,
    hide: hideProgress,
    show: function() {
      const bar = document.getElementById('pageProgress') || createProgressBar();
      bar.style.opacity = '1';
      setProgress(0);
    }
  };
})();
