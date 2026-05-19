import os
import re

html_files = [
    "index.html", "exam-guide.html", "exam-simulator.html", 
    "ai-assistant.html", "free-materials.html", "resources.html", 
    "privacy.html", "province-exam.html", "travel-knowledge.html",
    "travel-tools.html", "voice.html", "guides.html"
]

# AI助手悬浮按钮的HTML和CSS
ai_button_css = '''
/* AI助手悬浮按钮 */
.ai-float-btn {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 54px;
  height: 54px;
  background: linear-gradient(135deg, #4C8BF5, #7C3AED);
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(76, 139, 245, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}
.ai-float-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(76, 139, 245, 0.5);
}
.ai-float-btn span {
  font-size: 1.5rem;
  filter: grayscale(0);
}
.ai-float-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #4C8BF5, #7C3AED);
  border-radius: 50%;
  animation: aiPulse 2s infinite;
  z-index: -1;
}
@keyframes aiPulse {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
}
'''

ai_button_html = '''
<!-- AI助手悬浮按钮 -->
<a href="chat.html" class="ai-float-btn" title="AI助手">
  <span>🤖</span>
  <div class="ai-float-pulse"></div>
</a>
'''

for f in html_files:
    if not os.path.exists(f):
        continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 检查是否已经有AI按钮
    if 'ai-float-btn' in content:
        print(f"SKIP {f} (already has AI button)")
        continue
    
    # 添加CSS（在</style>前添加）
    if '</style>' in content:
        content = content.replace('</style>', ai_button_css + '\n</style>')
    
    # 添加HTML（在</body>前添加）
    if '</body>' in content:
        content = content.replace('</body>', ai_button_html + '\n</body>')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Added AI button to {f}")

print("\n=== AI Floating Button Added ===")
