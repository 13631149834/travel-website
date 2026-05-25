#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
激活码批量生成工具
格式：XM2026-XXXX（4位大写字母数字）
使用方法：python generate_code.py [数量]
"""

import random
import string
import json
from datetime import datetime, timedelta

def generate_code(prefix="XM2026", length=4):
    """生成单个激活码"""
    chars = string.ascii_uppercase + string.digits
    suffix = ''.join(random.choices(chars, k=length))
    return f"{prefix}-{suffix}"

def generate_batch(count=10, output_file="activation_codes.json"):
    """批量生成激活码"""
    codes = []
    expire_date = (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d")
    
    for i in range(count):
        code = generate_code()
        codes.append({
            "code": code,
            "created": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "expires": expire_date,
            "used": False,
            "used_at": None,
            "used_by": None
        })
    
    # 保存到文件
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(codes, f, ensure_ascii=False, indent=2)
    
    # 打印激活码
    print(f"\n✅ 成功生成 {count} 个激活码")
    print(f"📁 已保存到: {output_file}")
    print(f"📅 有效期: {expire_date}")
    print("\n" + "="*40)
    print("激活码列表：")
    print("="*40)
    for i, c in enumerate(codes, 1):
        print(f"{i:3d}. {c['code']}")
    print("="*40)
    
    return codes

if __name__ == "__main__":
    import sys
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    generate_batch(count)
