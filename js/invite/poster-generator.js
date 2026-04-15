/**
 * 邀请海报生成器
 * 自动生成包含个人二维码的邀请海报
 */

class PosterGenerator {
  constructor(options = {}) {
    this.options = {
      width: options.width || 280,
      height: options.height || 400,
      backgroundColor: options.backgroundColor || '#FFF5F0',
      primaryColor: options.primaryColor || '#FF6B35',
      secondaryColor: options.secondaryColor || '#FF8C42',
      qrCodeSize: options.qrCodeSize || 120,
      padding: options.padding || 20,
      ...options
    };

    this.canvas = null;
    this.ctx = null;
  }

  /**
   * 初始化画布
   */
  initCanvas(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('找不到容器元素');
      return null;
    }

    // 创建canvas元素
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.options.width * 2; // 2倍清晰度
    this.canvas.height = this.options.height * 2;
    this.canvas.style.width = this.options.width + 'px';
    this.canvas.height = this.options.height + 'px';
    
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(2, 2); // 缩放以获得高清效果

    container.innerHTML = '';
    container.appendChild(this.canvas);

    return this.canvas;
  }

  /**
   * 绘制海报
   * @param {Object} data 海报数据
   */
  async draw(data) {
    if (!this.ctx) {
      console.error('请先初始化画布');
      return;
    }

    const { width, height, padding, primaryColor, backgroundColor } = this.options;

    // 清空画布
    this.ctx.clearRect(0, 0, width, height);

    // 绘制背景
    this.drawBackground();

    // 绘制装饰元素
    this.drawDecorations();

    // 绘制Logo
    this.drawLogo(data.logo);

    // 绘制品牌名
    this.drawBrandName(data.brandName || '游导旅游');

    // 绘制Slogan
    this.drawSlogan(data.slogan || '扫码注册 立享好礼');

    // 绘制邀请码
    this.drawInviteCode(data.inviteCode);

    // 绘制二维码
    if (data.qrCodeUrl) {
      await this.drawQRCode(data.qrCodeUrl);
    }

    // 绘制底部信息
    this.drawFooter();
  }

  /**
   * 绘制渐变背景
   */
  drawBackground() {
    const { width, height, primaryColor, secondaryColor } = this.options;

    // 创建渐变
    const gradient = this.ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#FFE5D9');
    gradient.addColorStop(0.5, '#FFF5F0');
    gradient.addColorStop(1, '#FFD6C4');

    // 填充背景
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * 绘制装饰元素
   */
  drawDecorations() {
    const { width, height, primaryColor } = this.options;

    // 绘制右上角装饰圆
    this.ctx.beginPath();
    this.ctx.arc(width - 30, 30, 60, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 107, 53, 0.1)';
    this.ctx.fill();

    // 绘制左下角装饰圆
    this.ctx.beginPath();
    this.ctx.arc(30, height - 30, 50, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 107, 53, 0.08)';
    this.ctx.fill();
  }

  /**
   * 绘制Logo
   */
  drawLogo(emoji) {
    const { width, padding } = this.options;

    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(emoji || '🧭', width / 2, 60 + padding);
  }

  /**
   * 绘制品牌名
   */
  drawBrandName(name) {
    const { width, primaryColor } = this.options;

    this.ctx.font = 'bold 22px "PingFang SC", "Microsoft YaHei", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = primaryColor;
    this.ctx.fillText(name, width / 2, 95);
  }

  /**
   * 绘制Slogan
   */
  drawSlogan(slogan) {
    const { width } = this.options;

    this.ctx.font = '14px "PingFang SC", "Microsoft YaHei", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#888888';
    this.ctx.fillText(slogan, width / 2, 115);
  }

  /**
   * 绘制邀请码
   */
  drawInviteCode(code) {
    const { width, primaryColor } = this.options;

    // 邀请码背景框
    this.ctx.fillStyle = '#FFFFFF';
    this.roundRect(20, 330, width - 40, 45, 10);
    this.ctx.fill();

    // 邀请码标签
    this.ctx.font = '12px "PingFang SC", "Microsoft YaHei", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#888888';
    this.ctx.fillText('邀请码', width / 2, 348);

    // 邀请码
    this.ctx.font = 'bold 18px "Courier New", monospace';
    this.ctx.fillStyle = primaryColor;
    this.ctx.fillText(code || 'XXXXXXXX', width / 2, 368);
  }

  /**
   * 绘制二维码
   */
  async drawQRCode(url) {
    const { width, qrCodeSize, primaryColor } = this.options;
    const x = (width - qrCodeSize) / 2;
    const y = 140;

    try {
      // 创建QRCode实例
      const qrContainer = document.createElement('div');
      qrContainer.style.position = 'absolute';
      qrContainer.style.visibility = 'hidden';
      document.body.appendChild(qrContainer);

      new QRCode(qrContainer, {
        text: url,
        width: qrCodeSize,
        height: qrCodeSize,
        colorDark: '#333333',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.H
      });

      // 等待二维码生成
      await new Promise(resolve => setTimeout(resolve, 100));

      const qrCanvas = qrContainer.querySelector('canvas');
      if (qrCanvas) {
        // 二维码白色背景
        this.ctx.fillStyle = '#FFFFFF';
        this.roundRect(x - 8, y - 8, qrCodeSize + 16, qrCodeSize + 16, 12);
        this.ctx.fill();

        // 绘制二维码
        this.ctx.drawImage(qrCanvas, x, y, qrCodeSize, qrCodeSize);

        // 添加阴影效果
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetY = 4;
      }

      document.body.removeChild(qrContainer);
    } catch (error) {
      console.error('二维码生成失败:', error);
      // 绘制占位符
      this.drawQRPlaceholder(x, y, qrCodeSize);
    }
  }

  /**
   * 绘制二维码占位符
   */
  drawQRPlaceholder(x, y, size) {
    this.ctx.fillStyle = '#FFFFFF';
    this.roundRect(x - 8, y - 8, size + 16, size + 16, 12);
    this.ctx.fill();

    this.ctx.font = '40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#CCCCCC';
    this.ctx.fillText('📱', x + size / 2, y + size / 2 + 15);
  }

  /**
   * 绘制底部信息
   */
  drawFooter() {
    const { width } = this.options;

    this.ctx.font = '11px "PingFang SC", "Microsoft YaHei", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#AAAAAA';
    this.ctx.fillText('youdao-travel.com', width / 2, 390);
  }

  /**
   * 绘制圆角矩形
   */
  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  /**
   * 导出海报为图片
   */
  exportImage(filename = 'invite-poster.png') {
    if (!this.canvas) {
      console.error('请先生成海报');
      return;
    }

    const link = document.createElement('a');
    link.download = filename;
    link.href = this.canvas.toDataURL('image/png', 1.0);
    link.click();
  }

  /**
   * 获取海报Base64
   */
  toDataURL() {
    if (!this.canvas) {
      console.error('请先生成海报');
      return null;
    }
    return this.canvas.toDataURL('image/png', 1.0);
  }
}

// 快捷函数：生成并下载海报
async function generateAndDownloadPoster(data, filename) {
  const generator = new PosterGenerator();
  generator.initCanvas('posterQRCode');
  await generator.draw(data);
  generator.exportImage(filename);
}

// 快捷函数：生成海报并返回Base64
async function generatePosterBase64(data) {
  const generator = new PosterGenerator();
  generator.initCanvas('posterQRCode');
  await generator.draw(data);
  return generator.toDataURL();
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PosterGenerator, generateAndDownloadPoster, generatePosterBase64 };
}
