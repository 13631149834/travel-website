/**
 * 主人专属印记脚本 - Exclusive Mark JavaScript
 * 功能：水印、印记、分享等交互
 */

(function() {
    'use strict';

    // 配置
    const CONFIG = {
        watermark: {
            enabled: true,
            position: 'bottom-right',
            opacity: 0.15,
            image: 'images/stamps/watermark-exclusive.jpg'
        },
        cornerBadge: {
            enabled: true,
            text: '游导旅游'
        },
        floatBadge: {
            enabled: true,
            image: 'images/badges/badge-founder.jpg',
            title: '专属印记'
        }
    };

    /**
     * 初始化专属印记
     */
    function initExclusiveMarks() {
        if (CONFIG.watermark.enabled) {
            addWatermark();
        }
        if (CONFIG.cornerBadge.enabled) {
            addCornerBadge();
        }
        if (CONFIG.floatBadge.enabled) {
            addFloatBadge();
        }
        addFooterMark();
    }

    /**
     * 添加页面水印
     */
    function addWatermark() {
        const watermark = document.createElement('div');
        watermark.className = 'watermark-corner';
        watermark.innerHTML = `<img src="${CONFIG.watermark.image}" alt="专属印记" style="opacity: ${CONFIG.watermark.opacity}">`;
        document.body.appendChild(watermark);
    }

    /**
     * 添加角标
     */
    function addCornerBadge() {
        const badge = document.createElement('div');
        badge.className = 'corner-badge';
        badge.textContent = CONFIG.cornerBadge.text;
        document.body.appendChild(badge);
    }

    /**
     * 添加悬浮印记
     */
    function addFloatBadge() {
        const floatBadge = document.createElement('div');
        floatBadge.className = 'float-badge';
        floatBadge.innerHTML = `
            <img src="${CONFIG.floatBadge.image}" alt="${CONFIG.floatBadge.title}" title="${CONFIG.floatBadge.title}">
        `;
        floatBadge.addEventListener('click', showMarkDialog);
        document.body.appendChild(floatBadge);
    }

    /**
     * 显示印记弹窗
     */
    function showMarkDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'exclusive-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <button class="dialog-close">&times;</button>
                <h3>🌍 游导旅游 · 专属印记</h3>
                <div class="mark-showcase">
                    <img src="images/signature/founder-signature-1.jpg" alt="创始人签名">
                    <img src="images/stamps/watermark-official.jpg" alt="官方印章">
                    <img src="images/stamps/stamp-quality.jpg" alt="品质保证">
                </div>
                <p class="mark-quote">"让旅行更有温度"</p>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .exclusive-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                animation: fadeIn 0.3s ease;
            }
            .dialog-content {
                background: #fff;
                padding: 30px;
                border-radius: 16px;
                max-width: 400px;
                text-align: center;
                position: relative;
                animation: slideUp 0.3s ease;
            }
            .dialog-close {
                position: absolute;
                top: 10px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
            }
            .dialog-close:hover { color: #333; }
            .mark-showcase {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin: 20px 0;
            }
            .mark-showcase img {
                width: 80px;
                height: 80px;
                object-fit: contain;
                border-radius: 8px;
            }
            .mark-quote {
                font-style: italic;
                color: #666;
                margin-top: 15px;
            }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(20px); } to { transform: translateY(0); } }
        `;
        document.head.appendChild(style);
        document.body.appendChild(dialog);

        // 关闭事件
        dialog.querySelector('.dialog-close').addEventListener('click', () => {
            dialog.remove();
        });
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) dialog.remove();
        });
    }

    /**
     * 添加页脚印记
     */
    function addFooterMark() {
        const footer = document.querySelector('#main-footer');
        if (!footer) return;

        const markDiv = document.createElement('div');
        markDiv.className = 'footer-exclusive-section';
        markDiv.innerHTML = `
            <div class="footer-exclusive-mark">
                <img src="images/stamps/watermark-exclusive.jpg" alt="专属印记">
                <img src="images/signature/founder-signature-1.jpg" alt="签名" class="signature-image">
                <span>© ${new Date().getFullYear()} 游导旅游 · 专属印记</span>
            </div>
            <div class="exclusive-declaration">
                <p><strong>独家声明：</strong>本网站所有内容、设计、图片及资料均受中国法律及国际版权公约保护。未经授权，任何人不得复制、传播或用于商业目的。</p>
            </div>
        `;
        
        const bottomDiv = footer.querySelector('.footer-bottom-new');
        if (bottomDiv) {
            bottomDiv.insertBefore(markDiv, bottomDiv.firstChild);
        }
    }

    /**
     * 分享给好友
     */
    window.shareToFriend = function() {
        const shareData = {
            title: '游导旅游 - 让旅行更有温度',
            text: '专业的导游预约平台，严选认证导游，让旅行更简单',
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData)
                .catch(err => console.log('分享取消'));
        } else {
            // 复制链接
            const input = document.createElement('input');
            input.value = window.location.href;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            alert('链接已复制到剪贴板，快去分享吧！');
        }
    };

    /**
     * 打印印记
     */
    window.addPrintStamp = function() {
        const printStamp = document.createElement('div');
        printStamp.className = 'print-stamp';
        printStamp.innerHTML = `<img src="images/stamps/stamp-quality.jpg" alt="打印印记">`;
        document.body.appendChild(printStamp);
        window.print();
        setTimeout(() => printStamp.remove(), 100);
    };

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExclusiveMarks);
    } else {
        initExclusiveMarks();
    }

})();
