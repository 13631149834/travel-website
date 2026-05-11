import re

def esc(s):
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ')

def find_block_end(html, start):
    """Find the end of a JS block by matching braces, respecting string literals"""
    brace_count = 0
    in_str = False
    str_char = None
    i = start
    while i < len(html):
        c = html[i]
        if in_str:
            if c == str_char and (i == 0 or html[i-1] != '\\'):
                in_str = False
        else:
            if c in ("'", '"'):
                in_str = True
                str_char = c
            elif c == '{': 
                brace_count += 1
            elif c == '}':
                brace_count -= 1
                if brace_count == 0: 
                    return i + 1
        i += 1
    return len(html)

# Read the HTML file
with open('province-exam.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of 新疆 block
search_str = '新疆:{'
start_pos = content.find(search_str)
if start_pos == -1:
    print("ERROR: Cannot find '新疆:{")
    exit(1)

print("Found '新疆:{' at position", start_pos)

# Find the end of the block
end_pos = find_block_end(content, start_pos)
print("Block ends at position", end_pos)

# Prepare new content for Xinjiang - expanded to 2000+ Chinese characters
new_xinjiang = """新疆:{
region:'西北',
official:{site:'https://wlt.xinjiang.gov.cn',notice:'关注新疆维吾尔自治区文化和旅游厅官网',policy:'无特殊限制'},
extra:[
{title:'世界遗产与重要景区',items:['新疆天山（2013年列入世界自然遗产）','天山天池（瑶池传说，西王母宴请周穆王之地）','喀纳斯（变色湖、湖怪传说、图瓦人村落）','那拉提草原（空中草原，哈萨克族游牧文化）','赛里木湖（大西洋最后一滴眼泪，高山湖泊）','喀什老城（迷宫式伊斯兰建筑群，艾提尕尔清真寺）','交河故城（世界上最大最古老的生土建筑城市）','克孜尔千佛洞（比莫高窟早一世纪，佛教东传见证）']},
{title:'省份概况',items:['面积166.49万平方公里，全国最大，占国土面积六分之一','地形特征：三山夹两盆（阿尔泰山、天山、昆仑山夹准噶尔盆地和塔里木盆地）','首府乌鲁木齐市，丝绸之路经济带核心区','与8个国家接壤（哈萨克斯坦、吉尔吉斯斯坦、塔吉克斯坦、巴基斯坦、蒙古、印度、阿富汗、俄罗斯）','古丝绸之路核心区，是东西方文明交流的重要通道','深居亚欧大陆腹地，气候干旱少雨，昼夜温差大','是多个民族聚居区，维吾尔族为主，还有哈萨克族、汉族、回族、柯尔克孜族等47个民族']},
{title:'特色美食',items:['大盘鸡（新疆第一菜，起源于沙湾县，土豆皮带面）','烤羊肉串（维吾尔语"喀瓦普"，孜然辣椒调味）','手抓饭（维吾尔语"波劳"，羊肉黄萝卜焖制，逢年过节待客必备）','馕（新疆特色面饼，可保存数月，是维吾尔族主食）','拉条子（新疆拌面，手工拉制，配各种炒菜）','烤包子（羊肉丁、洋葱、孜然做馅，皮脆肉香）','手抓肉（哈萨克族传统美食，清炖羊肉保留原味）','缸子肉（搪瓷缸炖制的清炖羊肉，汤鲜肉嫩）','酸奶粽子（和田夜市网红美食，酸奶蜂蜜配糯米粽）','新疆瓜果（吐鲁番葡萄、哈密瓜、库尔勒香梨享誉全国）']},
{title:'传统节日',items:['古尔邦节（伊斯兰教重要节日，维吾尔语"库尔邦节"，意为"宰牲节"，放假3天）','开斋节（斋月结束后的第一个三天，维吾尔族最重要的节日之一）','诺鲁孜节（波斯语"新年第一天"，相当于春节，各民族共庆）','那达慕大会（蒙古族传统盛会，摔跤、赛马、射箭"男子三艺"）','天马节（昭苏县，天马故乡，7月举办）','葡萄节（吐鲁番，8-9月葡萄成熟季）','麦西来甫（维吾尔族群众性娱乐活动，包含歌舞、游戏、说唱）','雪顿节（藏传佛教节日，酸奶宴请僧侣，后逐渐成为藏族地区重要节日）']},
{title:'旅游攻略',items:['最佳旅游时间：北疆6-9月（避暑胜地），南疆9-11月（胡杨林金秋）','独库公路（中国最美公路，6-10月开放，穿越天山，561公里）','北疆大环线7日游：乌鲁木齐-可可托海-喀纳斯-禾木-赛里木湖-那拉提-巴音布鲁克-乌鲁木齐','南疆5日游：乌鲁木齐-库车（龟兹故地）-阿克苏-喀什-塔什库尔干','喀纳斯深度游3日：喀纳斯湖-禾木村-白哈巴村（西北第一村）','吐鲁番一日游：火焰山-葡萄沟-坎儿井-交河故城-维吾尔古村','伊犁河谷深度游：那拉提-喀拉峻-琼库什台-夏塔古道-霍尔果斯口岸','注意事项：带好防晒用品，温差大需备外套，尊重各民族习俗，清真饮食']}
],
questions:[
{q:'新疆天山于哪一年被列入世界自然遗产？',options:['2010年','2011年','2012年','2013年'],answer:3,explain:'2013年6月21日，新疆天山被列入世界自然遗产名录'},{q:'"大西洋最后一滴眼泪"指的是哪个景点？',options:['喀纳斯湖','赛里木湖','天池','博斯腾湖'],answer:1,explain:'赛里木湖位于新疆博尔塔拉蒙古自治州，因其深邃的蓝色湖水被誉为"大西洋最后一滴眼泪"'},{q:'那拉提草原位于新疆哪个地区？',options:['北疆','南疆','东疆','乌鲁木齐'],answer:0,explain:'那拉提草原位于新疆伊犁哈萨克自治州新源县境内，是北疆著名草原'},{q:'交河故城的建筑材料主要是？',options:['砖瓦','木材','生土（泥土）','石材'],answer:2,explain:'交河故城是世界上最大最古老的生土建筑城市，建筑材料以泥土为主'},{q:'新疆地形特征概括为？',options:['五山三盆','三山夹两盆','两山夹一盆','七山一水'],answer:1,explain:'新疆地形可概括为"三山夹两盆"：阿尔泰山、天山、昆仑山夹准噶尔盆地和塔里木盆地'}
]
}"""

# Replace the old block with new content
new_content = content[:start_pos] + new_xinjiang + content[end_pos:]

# Write the result
with open('province-exam.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replacement completed!")

# Verify the new content
with open('province-exam.html', 'r', encoding='utf-8') as f:
    new_file = f.read()

# Find the new Xinjiang block
xinjiang_start = new_file.find('新疆:{')
xinjiang_end = new_file.find('};', xinjiang_start) + 2
xinjiang_block = new_file[xinjiang_start:xinjiang_end]

# Count Chinese characters in the extra section
extra_start = xinjiang_block.find('extra:[')
extra_end = xinjiang_block.find('],', extra_start)
extra_content = xinjiang_block[extra_start:extra_end]

# Count Chinese characters
chinese_chars = re.findall(r'[\u4e00-\u9fff]', extra_content)
print("\nVerification:")
print("Chinese character count in 'extra' section:", len(chinese_chars))
if len(chinese_chars) >= 2000:
    print("✓ Meets the 2000+ character requirement!")
else:
    print("✗ Only", len(chinese_chars), "characters, needs more content")
