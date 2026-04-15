# Supabase 配置文件模板

## 使用方法

1. 复制此文件内容
2. 替换以下占位符：
   - `YOUR_PROJECT_ID` → 您的 Supabase 项目 ID（在 Project Settings 中查看）
   - `YOUR_ANON_KEY` → 您的 anon public 密钥

## 配置示例

```javascript
// ============================================
// Supabase 配置 - 游导旅游网站
// ============================================

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

// ============================================
// 以下代码无需修改
// ============================================
```

## 快速查找配置信息

### Project URL
- 位置：Settings → API → Project URL
- 格式：`https://xxxxx.supabase.co`

### Anon Public Key
- 位置：Settings → API → anon public
- 格式：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 验证配置

配置完成后，在浏览器控制台执行：
```javascript
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_ANON_KEY ? '已设置' : '未设置');
console.log('配置正确:', SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co');
```

## 常见错误

| 错误信息 | 解决方法 |
|---------|---------|
| Invalid API key | 检查 ANON_KEY 是否正确复制 |
| Project not found | 检查 URL 中的项目 ID 是否正确 |
| Connection refused | 等待项目创建完成（通常1-3分钟）|
