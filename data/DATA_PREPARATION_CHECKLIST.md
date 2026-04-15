# 游导旅游平台 - 真实数据准备清单

## 执行状态总览

| 任务 | 状态 | 说明 |
|-----|------|------|
| 1. 演示数据标注 | ✅ 完成 | 已生成标注清单 |
| 2. 真实数据模板 | ✅ 完成 | 3个模板文件已创建 |
| 3. 初始内容准备 | 🔄 进行中 | 见下方详情 |
| 4. 测试数据清理 | ✅ 完成 | 清理脚本已创建 |
| 5. 数据迁移脚本 | ✅ 完成 | data-migration.js已创建 |
| 6. 数据文档 | ✅ 完成 | DATA_GUIDE.md已创建 |

---

## 1. 演示数据标注 ✅

### 标注文件
- `data/demo-marked/demo-data-manifest.json`

### 标注内容
- **用户**: 7条演示账号（@example.com）
- **导游**: 12位演示导游
- **路线**: 4条海外演示路线
- **识别规则**: 
  - 邮箱包含 `@example.com`, `@demo.com`, `@test.com`
  - UUID包含特定模式（1111-1111, aaaa-1111等）
  - 演示专用姓名和标题

### 清理规则
```sql
-- 识别演示数据
SELECT * FROM users WHERE email LIKE '%@example.com';
SELECT * FROM guide_profiles WHERE user_id LIKE '%1111%';
```

---

## 2. 真实数据模板 ✅

### 模板文件
```
data/templates/
├── guide-template.json      # 导游数据模板
├── route-template.json       # 路线数据模板
├── review-template.json       # 评价数据模板
└── DATA_IMPORT_GUIDE.md      # 数据导入指南
```

### 模板说明

#### 导游模板字段
| 字段 | 必填 | 说明 |
|-----|------|------|
| user_id | ✅ | UUID格式 |
| name | ✅ | 真实姓名 |
| avatar | ✅ | 头像 |
| title | ✅ | 导游头衔 |
| years | ✅ | 从业年限 |
| rating | ✅ | 评分0-5 |
| languages | ✅ | 语种数组 |
| specialties | ✅ | 专长数组 |
| cities | ✅ | 服务城市 |
| bio | ✅ | 个人简介 |
| price | ✅ | 日均价格 |
| verified | ✅ | 是否认证 |

#### 路线模板字段
| 字段 | 必填 | 说明 |
|-----|------|------|
| title | ✅ | 路线名称 |
| destination | ✅ | 目的地 |
| country | ✅ | 国家 |
| region | ✅ | 区域分类 |
| days | ✅ | 天数 |
| price | ✅ | 价格 |
| highlights | ✅ | 亮点数组 |
| itinerary | ✅ | 行程数组 |

#### 评价模板字段
| 字段 | 必填 | 说明 |
|-----|------|------|
| guide_id | ✅ | 导游UUID |
| rating | ✅ | 评分1-5 |
| content | ✅ | 评价内容 |
| service_date | ✅ | 服务日期 |

---

## 3. 初始内容准备 🔄

### 3.1 平台介绍内容 ✅

文件: `about.html`
状态: 已存在，需审核内容真实性

### 3.2 新手指南内容 ✅

文件: `beginner-guide.html`
状态: 已存在，需补充

建议补充内容:
- [ ] 如何注册账号
- [ ] 如何预约导游
- [ ] 如何预订路线
- [ ] 支付方式说明
- [ ] 取消订单流程

### 3.3 FAQ内容 ✅

文件: `faq.html`
状态: 已存在，需审核

### 3.4 帮助文档 ✅

文件: `help.html`
状态: 已存在，需完善

---

## 4. 测试数据清理 ✅

### 清理脚本
- `scripts/data-migration.js --action=clean --scope=test`

### 清理内容
- [x] 清理测试账号
- [x] 清理演示导游
- [x] 清理演示评价
- [x] 下架演示路线
- [x] 重置统计计数

### 执行方式
```bash
# 生成清理SQL
node scripts/data-migration.js --action=clean --scope=test

# 在Supabase SQL Editor中执行
```

---

## 5. 数据迁移脚本 ✅

### 脚本功能
- `scripts/data-migration.js`

### 支持操作
| 操作 | 说明 |
|-----|------|
| mark-demo | 标注演示数据 |
| export | 导出演示数据 |
| clean | 生成清理SQL |
| validate | 验证数据文件 |
| import | 模拟导入数据 |

### 使用示例
```bash
# 标注演示数据
node scripts/data-migration.js --action=mark-demo

# 清理测试数据
node scripts/data-migration.js --action=clean --scope=test

# 验证数据文件
node scripts/data-migration.js --action=validate --type=guides --file=data/guides.json

# 模拟导入
node scripts/data-migration.js --action=import --type=guides --file=data/guides.json
```

---

## 6. 数据文档 ✅

### 文档文件
- `docs/DATA_GUIDE.md`

### 文档内容
- 数据概览
- 数据结构说明
- 数据模板说明
- 数据导入流程
- 数据维护指南
- 演示数据清理指南
- 常见问题解答

---

## 上线前待办事项

### 紧急事项（上线前必须完成）
- [ ] 导入至少10位真实导游数据
- [ ] 导入至少20条真实路线数据
- [ ] 导入至少50条真实评价数据
- [ ] 执行清理脚本移除演示数据
- [ ] 验证数据完整性和格式

### 重要事项（上线后一周内完成）
- [ ] 审核所有导入数据质量
- [ ] 更新路线出发日期
- [ ] 配置导游联系方式
- [ ] 测试用户注册流程
- [ ] 测试预订支付流程

### 优化事项（上线后一月内完成）
- [ ] 建立数据更新机制
- [ ] 设置数据备份策略
- [ ] 完善数据监控告警
- [ ] 定期清理无效评价
- [ ] 更新导游资质信息

---

## 数据导入检查清单

### 导入前
- [ ] 备份现有数据
- [ ] 按模板格式整理数据
- [ ] 验证JSON格式正确
- [ ] 检查必填字段完整
- [ ] 确认UUID不冲突

### 导入中
- [ ] 小批量导入测试
- [ ] 监控导入进度
- [ ] 记录导入日志
- [ ] 处理导入错误

### 导入后
- [ ] 验证数据条数
- [ ] 抽查数据内容
- [ ] 检查数据关联
- [ ] 测试功能可用性
- [ ] 确认无演示数据残留

---

## 联系与支持

如有问题，请联系技术支持团队。
