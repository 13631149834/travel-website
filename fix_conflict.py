# 读取文件
with open('province-exam.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到冲突标记
start_marker = "<<<<<<< HEAD"
separator = "======="
end_marker = ">>>>>>> "

start_pos = content.find(start_marker)
separator_pos = content.find(separator)
end_pos = content.find(end_marker)

if start_pos == -1 or separator_pos == -1 or end_pos == -1:
    print("未找到冲突标记")
    exit(1)

# 保留HEAD版本（<<<<<< 到 ======= 之前的内容）
# 找到<<<<<<之前的正确内容
before_conflict_end = start_pos
# 找到>>>>>>>之后的正确内容
after_conflict_start = end_pos + len(end_marker)
after_conflict_end_line = content.find('\n', after_conflict_start)
if after_conflict_end_line == -1:
    after_conflict_end_line = len(content)

# 提取冲突区域之前的部分
before_conflict = content[:start_pos]
# 提取HEAD版本（从start_marker到separator）
head_version = content[start_pos:separator_pos]
# 提取冲突区域之后的部分
after_conflict = content[after_conflict_end_line+1:]

# 组合新内容
new_content = before_conflict + head_version + after_conflict

# 写入文件
with open('province-exam.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("冲突已解决！")
