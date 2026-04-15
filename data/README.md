# 游导旅游平台 - 数据准备工具箱

## 📦 概览

本工具箱提供完整的数据管理解决方案，用于准备真实运营数据上线。

---

## 📁 文件结构

```
travel-website/
├── data/
│   ├── demo-marked/              # 演示数据标注
│   │   └── demo-data-manifest.json
│   ├── templates/                # 数据模板
│   │   ├── guide-template.json   # 导游数据模板
│   │   ├── route-template.json   # 路线数据模板
│   │   ├── review-template.json  # 评价数据模板
│   │   └── DATA_IMPORT_GUIDE.md  # 数据导入指南
│   ├── clean-test-data.sql       # 测试数据清理SQL
│   └── DATA_PREPARATION_CHECKLIST.md
├── scripts/
│   └── data-migration.js         # 数据迁移脚本
└── docs/
    └── DATA_GUIDE.md             # 数据管理指南
```

---

## 🚀 快速开始

### 1. 标注演示数据
```bash
node scripts/data-migration.js --action=mark-demo
```

### 2. 清理测试数据
```bash
node scripts/data-migration.js --action=clean --scope=test
```

### 3. 导入真实数据
```bash
# 验证数据文件
node scripts/data-migration.js --action=validate --type=guides --file=data/guides.json

# 模拟导入
node scripts/data-migration.js --action=import --type=guides --file=data/guides.json
```

---

## 📋 任务清单

| 任务 | 状态 | 文件 |
|-----|------|------|
| 演示数据标注 | ✅ 完成 | data/demo-marked/ |
| 真实数据模板 | ✅ 完成 | data/templates/ |
| 测试数据清理 | ✅ 完成 | data/clean-test-data.sql |
| 数据迁移脚本 | ✅ 完成 | scripts/data-migration.js |
| 数据文档 | ✅ 完成 | docs/DATA_GUIDE.md |

---

## 📖 使用文档

- [数据导入指南](data/templates/DATA_IMPORT_GUIDE.md)
- [数据管理指南](docs/DATA_GUIDE.md)
- [准备清单](data/DATA_PREPARATION_CHECKLIST.md)

---

## 🔧 常用操作

### 清理测试数据
在 Supabase SQL Editor 中执行：
```sql
-- 先执行备份
CREATE TABLE users_backup AS SELECT * FROM users;

-- 然后执行清理
\i data/clean-test-data.sql
```

### 导入新数据
1. 准备符合模板格式的数据文件
2. 验证格式：`node scripts/data-migration.js --action=validate --type=guides --file=data/guides.json`
3. 执行导入
4. 验证结果

### 查看演示数据清单
```bash
cat data/demo-marked/demo-data-manifest.json | jq '.'
```

---

## ⚠️ 注意事项

1. **上线前必做**：清理所有演示数据
2. **导入前必做**：备份现有数据
3. **验证格式**：使用验证工具检查数据格式
4. **检查完整性**：确保必填字段完整

---

## 📞 支持

如有问题，请查看详细文档或联系技术支持。
