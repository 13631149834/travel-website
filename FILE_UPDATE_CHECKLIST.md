# 文件更新清单

## 核心配置文件

| 文件路径 | 说明 | 更新状态 |
|---------|------|---------|
| `js/supabase-config.js` | Supabase 核心配置（需要替换 URL 和 KEY）| ✅ 已更新 |
| `login.html` | 登录页面（已集成 Supabase 认证）| ✅ 已更新 |
| `register.html` | 注册页面（需手动更新）| ⚠️ 待更新 |
| `js/common.js` | 公共函数（登录状态检查）| ✅ 无需更新 |

## 数据库相关文件

| 文件路径 | 说明 |
|---------|------|
| `supabase-schema.sql` | 数据库表结构 SQL |
| `SUPABASE_GUIDE.md` | 完整配置指南 |
| `QUICK_START.md` | 快速配置指南 |
| `CONFIG_TEMPLATE.md` | 配置模板 |

---

## 待手动更新的文件

### 1. register.html（注册页面）

需要添加 Supabase SDK 引用并更新注册逻辑：

```html
<!-- 在 </body> 前添加 -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-config.js"></script>
```

注册逻辑需要更新为使用 Supabase Auth：

```javascript
// 注册函数示例
async function registerWithSupabase(email, password, nickname) {
    initSupabase();
    const { data, error } = await Auth.signUp(email, password, nickname);
    return { data, error };
}
```

### 2. 其他需要考虑更新的文件

如果您需要完全迁移到 Supabase，以下文件可能需要更新：

| 文件 | 当前使用 | 说明 |
|------|---------|------|
| `guide-profile.html` | localStorage | 导游资料管理 |
| `guide-apply.html` | localStorage | 导游申请 |
| `my-orders.html` | localStorage | 订单管理 |
| `user-center.html` | localStorage | 用户中心 |
| `guide-dashboard.html` | localStorage | 导游工作台 |

---

## 文件更新优先级

### 🔴 高优先级（必须）
1. ✅ `js/supabase-config.js` - 核心配置
2. ✅ `login.html` - 登录功能
3. ⬜ 注册页面 - 需要手动更新

### 🟡 中优先级（推荐）
- `guide-profile.html` - 导游资料
- `my-orders.html` - 订单管理

### 🟢 低优先级（可选）
- 其他使用 localStorage 的页面
- 可以逐步迁移

---

## 迁移进度检查表

### Phase 1: 基础认证（必须）
- [x] 更新 supabase-config.js
- [x] 更新 login.html
- [ ] 更新 register.html
- [ ] 配置 Supabase 数据库

### Phase 2: 用户数据（推荐）
- [ ] 更新用户中心
- [ ] 更新导游资料
- [ ] 迁移旧数据

### Phase 3: 业务数据（可选）
- [ ] 更新订单系统
- [ ] 更新评价系统
- [ ] 更新学习系统

---

## 文件更新说明

### 如何更新 register.html

1. 打开 `register.html` 文件
2. 在 `</body>` 标签前添加：
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-config.js"></script>
```

3. 找到注册表单提交的处理函数
4. 将 localStorage 注册逻辑替换为 Supabase Auth

### 如何验证更新成功

1. 配置 Supabase 密钥
2. 打开登录页面
3. 尝试注册新账号
4. 在 Supabase Dashboard 查看 users 表

---

## 注意事项

⚠️ **重要提示**：
1. 替换配置前请备份原文件
2. 测试环境先验证，再部署到生产
3. Supabase 密钥不要提交到 GitHub
4. 使用环境变量存储敏感信息（生产环境）

### 环境变量设置（可选，生产环境推荐）

```bash
# .env 文件
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

然后在代码中：
```javascript
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
```
