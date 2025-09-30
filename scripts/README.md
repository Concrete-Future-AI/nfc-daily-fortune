# 数据库导出脚本

## 概述

这个脚本用于导出健康运势助手应用的完整数据库，包括表结构和数据，生成可在全新服务器上部署的SQL文件。

## 功能特性

- ✅ 导出完整的表结构（CREATE TABLE语句）
- ✅ 导出所有数据（INSERT语句）
- ✅ 包含索引和外键约束
- ✅ 包含触发器和函数
- ✅ 自动重置序列值
- ✅ 支持选择性导出（仅结构或仅数据）
- ✅ 生成带时间戳的文件名
- ✅ 包含导出统计信息

## 使用方法

### 基本用法

```bash
# 导出完整数据库（表结构 + 数据）
npm run db:export

# 或者直接运行脚本
npx tsx scripts/export-database.ts
```

### 高级选项

```bash
# 仅导出表结构，不包含数据
npm run db:export -- --no-data

# 仅导出数据，不包含表结构
npm run db:export -- --no-schema

# 指定输出目录
npm run db:export -- --output ./backups

# 组合使用
npm run db:export -- --output ./backups --no-data

# 查看帮助
npm run db:export -- --help
```

## 输出文件

导出的SQL文件将保存在以下位置：
- 默认路径：`./exports/database-export-YYYY-MM-DDTHH-mm-ss-sssZ.sql`
- 自定义路径：`<指定目录>/database-export-YYYY-MM-DDTHH-mm-ss-sssZ.sql`

## 文件结构

生成的SQL文件包含以下部分：

1. **文件头注释** - 导出信息和元数据
2. **数据库设置** - 编码和配置
3. **表结构定义** - CREATE TABLE语句
4. **索引和约束** - 索引、外键、唯一约束
5. **触发器和函数** - 自动更新时间戳等
6. **数据导出** - INSERT语句
7. **序列重置** - 确保自增ID正确
8. **统计信息** - 导出记录数量等

## 在新服务器部署

1. 在新服务器上创建PostgreSQL数据库：
   ```sql
   CREATE DATABASE fortune_app WITH ENCODING 'UTF8';
   ```

2. 连接到数据库并执行导出的SQL文件：
   ```bash
   psql -U username -d fortune_app -f database-export-YYYY-MM-DDTHH-mm-ss-sssZ.sql
   ```

3. 验证数据导入：
   ```sql
   -- 检查表是否创建成功
   \dt
   
   -- 检查数据是否导入成功
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM fortunes;
   ```

## 注意事项

- 确保目标数据库支持PostgreSQL语法
- 导出前确保数据库连接正常
- 大量数据导出可能需要较长时间
- 建议在导出前备份现有数据
- 导入时确保目标数据库为空或使用DROP TABLE语句

## 故障排除

### 常见错误

1. **数据库连接失败**
   - 检查 `.env` 文件中的 `DATABASE_URL` 配置
   - 确保数据库服务正在运行

2. **权限不足**
   - 确保数据库用户有读取权限
   - 检查文件系统写入权限

3. **内存不足**
   - 对于大型数据库，考虑分批导出
   - 增加Node.js内存限制：`node --max-old-space-size=4096`

### 调试模式

如需调试，可以直接运行TypeScript文件：
```bash
npx tsx scripts/export-database.ts --help
```

## 相关文件

- `scripts/export-database.ts` - 主导出脚本
- `prisma/schema.prisma` - 数据库模式定义
- `package.json` - npm脚本配置