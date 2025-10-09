# 脚本工具集

## 概述

这个目录包含了健康运势助手应用的各种管理和维护脚本，经过整理优化，提供了完整的数据库管理、用户生成、系统测试和验证功能。

## 核心脚本

### 📊 数据库管理
- **`export-database.ts`** - PostgreSQL数据库完整导出
- **`export-database-pg.ts`** - 增强版PostgreSQL导出工具
- **`clear-database.ts`** - 清空数据库数据

### 👥 用户管理
- **`generate-users.ts`** - 统一的用户生成工具（支持测试/生产环境）
- **`export-users-csv-advanced.ts`** - 高级用户数据CSV导出

### 🧪 系统测试
- **`test-system.ts`** - 综合系统功能测试（位置、天气、AI服务）
- **`verify-system.ts`** - 系统验证工具（数据库、数据流、错误处理）

### 🔧 工具脚本
- **`show-prompt.ts`** - AI提示词生成和显示
- **`analyze-ai-response.ts`** - AI响应分析工具

## 快速开始

### 数据库导出
```bash
# 导出完整数据库
npx tsx scripts/export-database.ts

# 使用PostgreSQL专用导出
npx tsx scripts/export-database-pg.ts --output ./backups
```

### 用户生成
```bash
# 生成测试用户
npx tsx scripts/generate-users.ts --count 10 --env test

# 生成生产用户（需要--force标志）
npx tsx scripts/generate-users.ts --count 100 --env prod --force
```

### 系统测试
```bash
# 运行完整系统测试
npx tsx scripts/test-system.ts

# 仅测试位置服务
npx tsx scripts/test-system.ts --location

# 仅测试AI服务
npx tsx scripts/test-system.ts --ai
```

### 系统验证
```bash
# 验证所有系统组件
npx tsx scripts/verify-system.ts

# 仅验证数据库
npx tsx scripts/verify-system.ts --database

# 仅验证数据流
npx tsx scripts/verify-system.ts --dataflow
```

## 详细功能说明

### 📊 数据库管理脚本

#### export-database.ts
- 导出完整的PostgreSQL数据库
- 支持选择性导出（仅结构或仅数据）
- 生成带时间戳的SQL文件
- 包含完整的表结构、索引、约束和数据

#### export-database-pg.ts
- 增强版PostgreSQL导出工具
- 支持更多自定义选项
- 优化的性能和错误处理

#### clear-database.ts
- 安全地清空数据库中的所有数据
- 保留表结构和约束
- 重置自增序列

### 👥 用户管理脚本

#### generate-users.ts
- 统一的用户生成工具
- 支持测试环境（TEST_前缀）和生产环境（PROD_前缀）
- 内置安全机制防止意外生成生产数据
- 可指定用户数量和环境类型

#### export-users-csv-advanced.ts
- 高级用户数据CSV导出
- 支持多种导出格式
- 包含运势数据关联

### 🧪 测试和验证脚本

#### test-system.ts
- 综合系统功能测试
- 测试位置服务（IP定位、出生地定位）
- 测试天气服务（实时天气查询）
- 测试AI服务（运势生成）
- 支持模块化测试和集成测试

#### verify-system.ts
- 系统验证工具
- 验证数据库数据完整性
- 验证数据流正确性
- 验证错误处理机制

### 🔧 工具脚本

#### show-prompt.ts
- 生成和显示AI提示词
- 用于调试和优化AI交互

#### analyze-ai-response.ts
- 分析AI响应质量
- 用于监控和改进AI服务

## 环境要求

- Node.js 18+
- TypeScript
- PostgreSQL数据库
- 必要的环境变量配置（.env.local）

## 配置说明

确保以下环境变量已正确配置：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/database"

# 高德地图API
AMAP_API_KEY="your_amap_api_key"

# AI服务配置
AI_ENDPOINT="your_ai_endpoint"
AI_API_KEY="your_ai_api_key"
```

## 最佳实践

1. **测试环境优先** - 始终在测试环境中验证脚本功能
2. **数据备份** - 运行数据修改脚本前先备份数据库
3. **环境隔离** - 使用不同的NFC UID前缀区分测试和生产数据
4. **定期验证** - 使用验证脚本定期检查系统健康状态
5. **监控日志** - 关注脚本执行日志，及时发现问题

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查DATABASE_URL配置
   - 确保数据库服务运行正常

2. **API调用失败**
   - 验证API密钥配置
   - 检查网络连接状态

3. **权限错误**
   - 确保数据库用户有足够权限
   - 检查文件系统写入权限

4. **内存不足**
   - 对于大型数据库，考虑分批处理
   - 增加Node.js内存限制：`node --max-old-space-size=4096`

## 获取帮助

每个脚本都支持 `--help` 参数查看详细使用说明：

```bash
npx tsx scripts/generate-users.ts --help
npx tsx scripts/test-system.ts --help
npx tsx scripts/verify-system.ts --help
```

## 相关文件

- `prisma/schema.prisma` - 数据库模式定义
- `.env.local` - 环境变量配置
- `lib/` - 共享库文件