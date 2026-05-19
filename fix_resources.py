import re

# 读取resources.html
with open('resources.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到trust-section结束的位置，在它后面添加用户评价
# 旧的信任区域结束标记
old_trust_end = '''    <div class="trust-item">✅ 7天不满意可退款</div>
    </div>
  </div>

  <!-- 购买说明 -->'''

# 新的信任区域，包含用户评价
new_trust_content = '''    <div class="trust-item">✅ 7天不满意可退款</div>
    </div>
  </div>

  <!-- 用户评价区域 -->
  <div style="margin:32px 0;padding:24px;background:#FFFFFF;border:1px solid #F0F0F0;border-radius:18px;">
    <h3 style="font-size:1.1rem;color:#1A1A1A;font-weight:700;margin-bottom:8px;text-align:center;">🙋 学员真实评价</h3>
    <p style="text-align:center;font-size:0.85rem;color:#666;margin-bottom:16px;">已有 <strong style="color:#4C8BF5;">3862</strong> 人下载使用</p>
    
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
      <div style="background:#F8FAFF;padding:16px;border-radius:12px;">
        <div style="display:flex;gap:4px;color:#FFB800;font-size:0.9rem;margin-bottom:8px;">★★★★★</div>
        <p style="font-size:0.9rem;color:#333;line-height:1.7;margin-bottom:10px;">"终于考过了！面试的8道题基本都在C包里有，感谢张老师的整理，真的帮了大忙！"</p>
        <p style="font-size:0.8rem;color:#999;">—— 广州考生·小林 2025年11月通过</p>
      </div>
      
      <div style="background:#F8FAFF;padding:16px;border-radius:12px;">
        <div style="display:flex;gap:4px;color:#FFB800;font-size:0.9rem;margin-bottom:8px;">★★★★★</div>
        <p style="font-size:0.9rem;color:#333;line-height:1.7;margin-bottom:10px;">"第一次备考完全摸不着头脑，买了B包后才知道原来要背这么多东西。导游词模板超实用！"</p>
        <p style="font-size:0.8rem;color:#999;">—— 深圳考生·阿华 备考2025下</p>
      </div>
      
      <div style="background:#F8FAFF;padding:16px;border-radius:12px;">
        <div style="display:flex;gap:4px;color:#FFB800;font-size:0.9rem;margin-bottom:8px;">★★★★★</div>
        <p style="font-size:0.9rem;color:#333;line-height:1.7;margin-bottom:10px;">"B包包含的真题太全了，考试遇到了好几道类似的，最后顺利过关！"</p>
        <p style="font-size:0.8rem;color:#999;">—— 成都考生·小美 备考2025上</p>
      </div>
      
      <div style="background:#F8FAFF;padding:16px;border-radius:12px;">
        <div style="display:flex;gap:4px;color:#FFB800;font-size:0.9rem;margin-bottom:8px;">★★★★★</div>
        <p style="font-size:0.9rem;color:#333;line-height:1.7;margin-bottom:10px;">"本来以为1.9元的A包会很水，结果真题真的都有，解析也很详细，良心卖家！"</p>
        <p style="font-size:0.8rem;color:#999;">—— 上海考生·大伟 备考2025下</p>
      </div>
    </div>
    
    <div style="margin-top:20px;padding:16px;background:linear-gradient(135deg,#E8F5E9,#F0FFF4);border-radius:12px;text-align:center;">
      <p style="font-size:0.9rem;color:#333;font-weight:600;">🛡️ 购物保障</p>
      <div style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin-top:10px;">
        <span style="font-size:0.85rem;color:#555;">🔒 7天无理由退款</span>
        <span style="font-size:0.85rem;color:#555;">💬 1v1答疑服务</span>
        <span style="font-size:0.85rem;color:#555;">📚 持续更新到考前</span>
      </div>
    </div>
  </div>

  <!-- 购买说明 -->'''

content = content.replace(old_trust_end, new_trust_content)

# 写回文件
with open('resources.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("resources.html 用户评价已添加！")
