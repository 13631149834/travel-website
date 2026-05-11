#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""修复甘肃省份数据 - 添加世界遗产板块"""

import re

def count_text(text):
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'[^\u4e00-\u9fa5a-zA-Z0-9]', '', text)
    return len(text)

# 甘肃 世界遗产与重要景区
GANSU_HERITAGE = "{title:'世界遗产与重要景区',items:['【敦煌莫高窟】世界文化遗产，位于甘肃省酒泉市敦煌市东南25公里处的鸣沙山东麓断崖上。始建于十六国的前秦时期（公元366年），历经十六国、北朝、隋、唐、五代、西夏、元等朝代的连续营造，形成了现存735个洞窟、4.5万平方米壁画和2400余尊彩塑的宏大艺术宝库，是世界上现存规模最大、内容最丰富的佛教艺术圣地。莫高窟被誉为\"东方卢浮宫\"，1987年被列入世界文化遗产名录。其壁画内容涵盖佛教故事、历史事件、社会生活、歌舞音乐、建筑服饰等多个方面。著名洞窟有第96窟（九层楼）、第130窟、第17窟（藏经洞）、第428窟等。藏经洞内曾藏有经卷文书等5万余件文物。导游词要点：莫高窟是丝绸之路的艺术瑰宝；洞窟内严禁拍照；建议提前30天预约。\\n\\n【嘉峪关关城】世界文化遗产，位于甘肃省嘉峪关市西5公里处。始建于明洪武五年（1372年），是明代万里长城的西端起点，有\"天下第一雄关\"之称。关城由内城、外城、罗城、瓮城等组成。景区还包括长城第一墩和悬壁长城。导游词要点：嘉峪关是明代长城的最西端；\"三重城郭\"防御体系。\\n\\n【天水麦积山石窟】世界文化遗产预备名单，位于甘肃省天水市麦积区。始建于后秦（公元384-417年），形成现有221个洞窟、10632身泥塑的艺术宝库。与敦煌莫高窟、云冈石窟、龙门石窟并称为中国四大石窟，被誉为\"东方雕塑陈列馆\"。著名洞窟有第4窟（散花楼）、第44窟（东方微笑）等。导游词要点：麦积山以泥塑艺术著称。\\n\\n【张掖丹霞地貌】国家5A级旅游景区，位于甘肃省张掖市临泽县和肃南县境内。总面积约510平方公里，被誉为\"世界十大神奇地理奇观\"之一。著名景点有七彩丹霞、冰沟丹霞等。最佳观赏时间是日出和日落时分。2019年评为国家5A级景区。导游词要点：丹霞地貌形成过程；七彩丹霞的特点。\\n\\n【鸣沙山月牙泉】国家5A级旅游景区，位于甘肃省敦煌市城南5公里处。鸣沙山因沙动成响而得名。月牙泉因形似新月而得名，是沙漠中的绿洲奇观。\"山泉共处、沙水共生\"被誉为\"塞外风光之一绝\"。导游词要点：鸣沙山发声原理；月牙泉形成条件。\\n\\n【炳灵寺石窟】全国重点文物保护单位，位于甘肃省临夏回族自治州永靖县。始建于西秦建弘元年（420年），是丝绸之路东段南道的重要石窟寺。导游词要点：炳灵寺是甘肃三大石窟之一。\\n\\n【崆峒山】国家5A级旅游景区，位于甘肃省平凉市崆峒区。主峰海拔2123米，是道教圣地，被誉为\"西来第一山\"。相传黄帝曾问道于广成子于此。导游词要点：崆峒山是道教名山；黄帝问道广成子的典故。\\n\\n【黄河石林】国家4A级旅游景区，位于甘肃省白银市景泰县。总面积约50平方公里，是集雅丹、丹霞、石林地貌于一体的自然奇观。导游词要点：石林是地质奇观。\\n\\n【拉卜楞寺】全国重点文物保护单位，位于甘肃省甘南藏族自治州夏河县。是藏传佛教格鲁派六大寺院之一，有\"世界藏学府\"之称。寺院始建于清康熙四十八年（1709年）。导游词要点：格鲁派六大寺院之一；转经筒的文化意义。\\n\\n【甘加八角城】全国重点文物保护单位，位于甘肃省甘南藏族自治州夏河县甘加镇。是唐代西北重要的军事城堡，始建于唐代，距今1300多年。八角城因有八个城角而得名。导游词要点：八角城始建于唐代；八角形布局的独特性。']}"

def main():
    with open('province-exam.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("=== 开始修复 ===\n")
    
    # 为甘肃添加世界遗产板块
    print("1. 为甘肃添加'世界遗产与重要景区'板块...")
    
    gansu_idx = content.find("甘肃:{")
    if gansu_idx != -1:
        gansu_extra = content.find("extra:[", gansu_idx)
        if gansu_extra != -1:
            insert_pos = gansu_extra + 7
            while insert_pos < len(content) and content[insert_pos] == '\n':
                insert_pos += 1
            
            content = content[:insert_pos] + "\n" + GANSU_HERITAGE + ",\n" + content[insert_pos:]
            print("   甘肃世界遗产板块已添加")
    
    # 验证
    print("\n=== 字数验证 ===")
    gansu_idx = content.find("甘肃:{")
    if gansu_idx != -1:
        extra_start = content.find("extra:[", gansu_idx)
        if extra_start != -1:
            # 找到结束位置
            bracket_level = 0
            end = extra_start
            for i in range(extra_start + 7, len(content)):
                c = content[i]
                if c == '[':
                    bracket_level += 1
                elif c == ']':
                    if bracket_level == 0:
                        end = i + 1
                        break
                    bracket_level -= 1
            
            extra_content = content[extra_start:end]
            char_count = count_text(extra_content)
            sections = re.findall(r"title:'([^']+)'", extra_content)
            print(f"甘肃: {len(sections)}个板块, 总字数{char_count}")
            for title in sections:
                print(f"   - {title}")
    
    with open('province-exam.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n=== 修复完成 ===")

if __name__ == "__main__":
    main()
