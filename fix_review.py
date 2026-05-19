import re
import os

html_files = [
    "index.html", "exam-guide.html", "exam-simulator.html", "chat.html",
    "ai-assistant.html", "free-materials.html", "resources.html", 
    "privacy.html", "province-exam.html", "travel-knowledge.html",
    "travel-tools.html", "voice.html", "guides.html"
]

# 1. 修复底部标签栏"资料"→"套餐"
for f in html_files:
    if not os.path.exists(f):
        continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 替换底部标签栏的"资料"为"套餐"
    old = '<span>资料</span></a>'
    new = '<span>套餐</span></a>'
    if old in content:
        content = content.replace(old, new)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Fixed bottom tabs in {f}")

print("\n=== Step 1 Complete: Bottom tabs '资料' → '套餐' ===\n")

