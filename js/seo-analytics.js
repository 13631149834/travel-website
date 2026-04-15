<!-- 
  游导旅游网站 - SEO统计代码配置
  =========================================
  
  使用说明：
  1. 替换下面的YOUR_BAIDU_ID为您的百度统计ID
  2. 替换下面的YOUR_GA_ID为您的Google Analytics ID
  3. 如不需要某个统计工具，注释掉相应代码
-->
<script>
// 百度统计配置 - 请替换为您的百度统计ID
// 申请地址: https://tongji.baidu.com/
var BAIDU_TONGJI_ID = 'YOUR_BAIDU_ID';

// 百度推送代码配置
// 申请地址: https://ziyuan.baidu.com/linksubmit/index
var BAIDU_PUSH_TOKEN = 'YOUR_BAIDU_PUSH_TOKEN';

// Google Analytics配置
// 申请地址: https://analytics.google.com/
var GOOGLE_ANALYTICS_ID = 'G-XXXXXXXXXX';

// ==================== 百度统计 ====================
(function() {
    if (BAIDU_TONGJI_ID === 'YOUR_BAIDU_ID') {
        console.log('百度统计: 请配置您的百度统计ID');
        return;
    }
    
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?" + BAIDU_TONGJI_ID;
    var s = document.getElementsByTagName("script")[0]; 
    s.parentNode.insertBefore(hm, s);
})();

// ==================== 百度自动推送 ====================
(function() {
    if (BAIDU_PUSH_TOKEN === 'YOUR_BAIDU_PUSH_TOKEN') {
        console.log('百度推送: 请配置您的推送Token');
        return;
    }
    
    var bp = document.createElement('script');
    bp.src = 'https://push.zhanzhang.baidu.com/push.js';
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(bp, s);
})();

// ==================== Google Analytics ====================
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', GOOGLE_ANALYTICS_ID);
</script>
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
