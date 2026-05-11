# 读取文件
with open('province-exam.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到冲突标记
start_marker = "<<<<<<< HEAD"
separator = "======="
end_marker = ">>>>>>>"

start_pos = content.find(start_marker)
separator_pos = content.find(separator)
end_pos = content.find(end_marker)

if start_pos == -1 or separator_pos == -1 or end_pos == -1:
    print("未找到冲突标记")
    exit(1)

# 保留HEAD版本（从<<<<<<到=======之前）
before_conflict = content[:start_pos]
# HEAD版本内容
head_version = content[start_pos:separator_pos]
# 之后的内容（从>>>>>>>之后开始）
after_conflict_start = end_pos + len(end_marker)
# 找到>>>>>>>之后第一个换行
after_newline = content.find('\n', after_conflict_start)
if after_newline == -1:
    after_newline = len(content)
after_conflict = content[after_newline+1:]

# 组合新内容
new_content = before_conflict + head_version + after_conflict

# 写入文件
with open('province-exam.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("冲突已解决！")
