# Supabase 快速配置指南

## 🚀 5分钟快速上手

### 第一步：复制 SQL 文件内容
打开 `supabase-schema.sql` 文件，复制全部内容。

### 第二步：在 Supabase 执行 SQL
1. 登录 [Supabase Dashboard](https://supabase.com)
2. 选择您的项目
3. 点击左侧菜单 **"SQL Editor"**
4. 点击 **"New query"**
5. 粘贴 SQL 内容
6. 点击 **"RUN"**

### 第三步：获取配置信息
1. 进入 **Settings → API**
2. 复制 **Project URL**
3. 复制 **anon public** 密钥

### 第四步：更新配置文件
编辑 `js/supabase-config.js`，替换：
```javascript
const SUPABASE_URL = 'https://您的项目ID.supabase.co';
const SUPABASE_ANON_KEY = '您的anon密钥';
```

### 第五步：测试
1. 打开网站注册页面
2. 使用邮箱注册新账号
3. 检查 Supabase → Table Editor → profiles 表，确认数据已写入

---

## 📋 完整配置清单

| 步骤 | 操作 | 状态 |
|------|------|------|
| 1 | 注册 Supabase 账号 | ⬜ |
| 2 | 创建新项目 | ⬜ |
| 3 | 执行 supabase-schema.sql | ⬜ |
| 4 | 获取 API 密钥 | ⬜ |
| 5 | 更新 supabase-config.js | ⬜ |
| 6 | 测试注册/登录 | ⬜ |

---

## 🔧 配置检查清单

### 确认以下文件已更新：
- [ ] `js/supabase-config.js` - SUPABASE_URL 和 SUPABASE_ANON_KEY

### 确认数据库表已创建：
- [ ] profiles
- [ ] guide_profiles
- [ ] orders
- [ ] reviews
- [ ] learning_records
- [ ] learning_stats
- [ ] favorites

### 测试功能：
- [ ] 新用户注册
- [ ] 用户登录
- [ ] 退出登录
- [ ] 游客预约导游
- [ ] 导游管理订单

---

## ❓ 常见问题

### Q: 执行 SQL 时报错怎么办？
**A:** 
1. 检查是否选择了正确的数据库
2. 确保以项目所有者的身份执行
3. 查看错误信息，通常是表已存在等提示，可以忽略

### Q: 忘记数据库密码怎么办？
**A:** Settings → Database → Reset database password

### Q: 如何查看我的 API 密钥？
**A:** Settings → API 页面，Project URL 和 anon public 密钥

### Q: 迁移后旧数据怎么办？
**A:** 使用 `Utils.migrateFromLocalStorage(userId)` 方法迁移

---

## 📞 需要帮助？

- 📖 完整指南：[SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md)
- 🌐 Supabase 文档：https://supabase.com/docs
- 💬 Discord 社区：https://discord.gg/supabase
