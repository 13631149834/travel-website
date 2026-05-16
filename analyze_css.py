import re
from collections import defaultdict

# 提取每个页面的CSS
pages_css = {}
for page in ['index.html', 'exam-guide.html', 'exam-simulator.html', 'chat.html', 
             'free-materials.html', 'ai-assistant.html', 'travel-knowledge.html',
             'travel-tools.html', 'voice.html', 'province-exam.html', 'resources.html']:
    try:
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        # 提取<style>标签内容
        style_match = re.search(r'<style[^>]*>(.*?)</style>', content, re.DOTALL)
        if style_match:
            pages_css[page] = style_match.group(1)
    except:
        pass

# 提取CSS规则
def extract_rules(css):
    rules = re.findall(r'([.#]?[a-zA-Z][a-zA-Z0-9_-]*)\s*\{[^}]*\}', css, re.DOTALL)
    return set(rules)

# 统计每个规则的出现在多少页面
rule_count = defaultdict(list)
for page, css in pages_css.items():
    rules = extract_rules(css)
    for rule in rules:
        rule_count[rule].append(page)

# 输出重复规则
print("出现次数\t规则名\t出现在哪些页面")
for rule, pages in sorted(rule_count.items(), key=lambda x: -len(x[1])):
    if len(pages) >= 5:  # 至少在5个页面出现
        print(f"{len(pages)}\t{rule}\t{', '.join(pages[:3])}...")
