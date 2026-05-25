/**
 * 游导学习笔记 - 精致化5.0 品牌色比例工具
 * #0D9488≤15%仅强调、#F0FDFA 30-40%大面积背景、白30-40%、深灰#333 10-15%、浅灰#eee 5-10%
 */
(function() {
  'use strict';

  // ========== 品牌色配置 ==========
  const BRAND_COLORS = {
    // 主色系
    primary: {
      main: '#0D9488',      // 主青
      dark: '#115E59',      // 深青
      darker: '#115E59',    // 更深
      light: '#5EEAD4',     // 浅青
      lighter: '#CCFBF1'    // 更浅
    },
    
    // 背景色系
    background: {
      warm: '#F0FDFA',      // 薄荷底背景
      warmDark: '#CCFBF1',  // 薄荷深底
      card: '#FFFFFF',      // 卡片白
      subtle: '#FAFAFA'     // 浅灰底
    },
    
    // 灰色阶
    gray: {
      dark: '#333333',      // 深灰（文字）
      medium: '#666666',   // 中灰
      light: '#999999',    // 浅灰
      lighter: '#CCCCCC',   // 更浅灰
      border: '#EEEEEE',   // 边框灰
      bg: '#F5F5F5'        // 背景灰
    },
    
    // 功能色
    functional: {
      success: '#0D9488',   // 成功色用品牌橙
      warning: '#F6AD55',   // 警告色
      error: '#E53E3E',     // 错误色
      info: '#3182CE'       // 信息色
    }
  };

  // ========== 品牌色比例配置 ==========
  const BRAND_RATIO = {
    // 推荐使用比例
    recommended: {
      primary: 15,      // #0D9488 ≤15% 仅强调
      background: 35,   // #F0FDFA 30-40% 大面积背景
      white: 35,       // 白 30-40%
      darkGray: 12,     // 深灰#333 10-15%
      lightGray: 8      // 浅灰#eee 5-10%
    },
    
    // 各场景使用指南
    scenarios: {
      // 首页（低密度）
      home: {
        primary: 10,
        background: 45,
        white: 35,
        darkGray: 8,
        lightGray: 2
      },
      
      // 列表页（中密度）
      list: {
        primary: 12,
        background: 35,
        white: 38,
        darkGray: 10,
        lightGray: 5
      },
      
      // 详情页（高密度）
      detail: {
        primary: 15,
        background: 30,
        white: 35,
        darkGray: 15,
        lightGray: 5
      },
      
      // 工具页（最低密度）
      tool: {
        primary: 8,
        background: 40,
        white: 40,
        darkGray: 7,
        lightGray: 5
      }
    }
  };

  // ========== 品牌色工具 ==========
  const BrandColorTool = {
    // 获取颜色变量
    getColors() {
      return BRAND_COLORS;
    },
    
    // 获取推荐比例
    getRecommendedRatio() {
      return BRAND_RATIO.recommended;
    },
    
    // 获取场景比例
    getScenarioRatio(scenario) {
      return BRAND_RATIO.scenarios[scenario] || BRAND_RATIO.recommended;
    },
    
    // 生成CSS变量
    generateCSSVariables() {
      const vars = [];
      
      // 主色
      for (const [key, value] of Object.entries(BRAND_COLORS.primary)) {
        vars.push(`--color-primary-${key}: ${value}`);
      }
      
      // 背景色
      for (const [key, value] of Object.entries(BRAND_COLORS.background)) {
        vars.push(`--color-bg-${key}: ${value}`);
      }
      
      // 灰色阶
      for (const [key, value] of Object.entries(BRAND_COLORS.gray)) {
        vars.push(`--color-gray-${key}: ${value}`);
      }
      
      // 功能色
      for (const [key, value] of Object.entries(BRAND_COLORS.functional)) {
        vars.push(`--color-${key}: ${value}`);
      }
      
      return vars.join(';\n  ');
    },
    
    // 注入品牌色变量
    injectColorVariables() {
      const styleId = 'brand-color-variables';
      if (document.getElementById(styleId)) return;
      
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        :root {
          /* 品牌色变量 */
          /* 主色系 */
          --color-primary-main: #0D9488;
          --color-primary-dark: #115E59;
          --color-primary-darker: #115E59;
          --color-primary-light: #5EEAD4;
          --color-primary-lighter: #CCFBF1;
          
          /* 背景色系 */
          --color-bg-warm: #F0FDFA;
          --color-bg-warm-dark: #CCFBF1;
          --color-bg-card: #FFFFFF;
          --color-bg-subtle: #FAFAFA;
          
          /* 灰色阶 */
          --color-gray-dark: #333333;
          --color-gray-medium: #666666;
          --color-gray-light: #999999;
          --color-gray-lighter: #CCCCCC;
          --color-gray-border: #EEEEEE;
          --color-gray-bg: #F5F5F5;
          
          /* 功能色 */
          --color-success: #0D9488;
          --color-warning: #F6AD55;
          --color-error: #E53E3E;
          --color-info: #3182CE;
          
          /* 别名 */
          --color-primary: var(--color-primary-main);
          --color-text: var(--color-gray-dark);
          --color-text-secondary: var(--color-gray-medium);
          --color-text-muted: var(--color-gray-light);
          --color-border: var(--color-gray-border);
          --color-bg: var(--color-bg-warm);
        }
        
        /* 品牌色使用指南 */
        /* 
         * 推荐使用比例：
         * - #0D9488 ≤15% 仅用于强调
         * - #F0FDFA 30-40% 大面积背景
         * - 白 30-40%
         * - #333 10-15% 深灰文字
         * - #eee 5-10% 浅灰边框/分割
         */
      `;
      
      document.head.appendChild(style);
    },
    
    // 检查颜色使用比例（开发调试用）
    analyzeColorUsage() {
      if (!window.getComputedStyle) return null;
      
      const body = document.body;
      const computed = window.getComputedStyle(body);
      
      // 简化分析：检查背景色
      const bgColor = computed.backgroundColor;
      
      return {
        backgroundColor: bgColor,
        message: '建议背景使用 #F0FDFA 或 #FFFFFF'
      };
    },
    
    // 生成品牌色检测报告
    generateReport() {
      const colors = this.getColors();
      const ratio = this.getRecommendedRatio();
      
      return {
        colors,
        ratio,
        tips: [
          '主色#0D9488仅用于按钮、高亮、图标等强调元素',
          '薄荷底#F0FDFA用于页面背景，营造清爽氛围',
          '白色用于卡片、弹窗等需要突出的内容',
          '深灰#333用于正文文字',
          '浅灰#eee/#ccc用于边框、分隔线等辅助元素'
        ]
      };
    },
    
    // 渲染颜色使用指南
    renderColorGuide(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const colors = this.getColors();
      const ratio = this.getRecommendedRatio();
      
      container.innerHTML = `
        <div class="color-guide">
          <h3>🎨 品牌色使用指南</h3>
          
          <div class="color-section">
            <h4>主色系</h4>
            <div class="color-swatches">
              <div class="color-swatch" style="background: ${colors.primary.main}">
                <span>主青 #0D9488</span>
                <small>≤${ratio.primary}%</small>
              </div>
              <div class="color-swatch" style="background: ${colors.primary.dark}">
                <span>深青 #115E59</span>
              </div>
              <div class="color-swatch" style="background: ${colors.primary.light}">
                <span>浅青 #5EEAD4</span>
              </div>
            </div>
          </div>
          
          <div class="color-section">
            <h4>背景色系</h4>
            <div class="color-swatches">
              <div class="color-swatch" style="background: ${colors.background.warm}">
                <span>暖底 #F0FDFA</span>
                <small>${ratio.background}%</small>
              </div>
              <div class="color-swatch" style="background: ${colors.background.card}; border: 1px solid #eee">
                <span>卡片白 #FFF</span>
                <small>${ratio.white}%</small>
              </div>
            </div>
          </div>
          
          <div class="color-section">
            <h4>灰色阶</h4>
            <div class="color-swatches">
              <div class="color-swatch" style="background: ${colors.gray.dark}; color: #fff">
                <span>深灰 #333</span>
                <small>${ratio.darkGray}%</small>
              </div>
              <div class="color-swatch" style="background: ${colors.gray.medium}; color: #fff">
                <span>中灰 #666</span>
              </div>
              <div class="color-swatch" style="background: ${colors.gray.light}">
                <span>浅灰 #999</span>
              </div>
            </div>
          </div>
          
          <div class="color-tips">
            <h4>💡 使用建议</h4>
            <ul>
              <li>主色仅用于强调元素（按钮、图标、高亮）</li>
              <li>薄荷底用于页面背景</li>
              <li>白色用于卡片和浮层</li>
              <li>深灰用于正文文字</li>
              <li>浅灰用于边框和分割</li>
            </ul>
          </div>
        </div>
      `;
      
      // 注入样式
      this.injectGuideStyles();
    },
    
    // 注入指南样式
    injectGuideStyles() {
      const styleId = 'brand-color-guide-styles';
      if (document.getElementById(styleId)) return;
      
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .color-guide {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 20px;
          max-width: 500px;
        }
        .color-guide h3 {
          font-size: 1rem;
          color: #0D9488;
          margin-bottom: 16px;
        }
        .color-section {
          margin-bottom: 16px;
        }
        .color-section h4 {
          font-size: 0.85rem;
          color: #333;
          margin-bottom: 8px;
        }
        .color-swatches {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .color-swatch {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 60px;
          border-radius: 8px;
          font-size: 0.7rem;
          color: #333;
          position: relative;
        }
        .color-swatch small {
          font-size: 0.65rem;
          opacity: 0.8;
          margin-top: 4px;
        }
        .color-tips {
          background: #F0FDFA;
          border-radius: 12px;
          padding: 14px;
        }
        .color-tips h4 {
          font-size: 0.85rem;
          color: #0D9488;
          margin-bottom: 8px;
        }
        .color-tips ul {
          margin: 0;
          padding-left: 18px;
        }
        .color-tips li {
          font-size: 0.78rem;
          color: #666;
          margin-bottom: 4px;
        }
      `;
      document.head.appendChild(style);
    }
  };

  // ========== 暴露到全局 ==========
  window.BrandColorTool = BrandColorTool;
  window.BRAND_COLORS = BRAND_COLORS;
  window.BRAND_RATIO = BRAND_RATIO;

  // ========== 自动初始化 ==========
  document.addEventListener('DOMContentLoaded', () => {
    BrandColorTool.injectColorVariables();
  });

})();
