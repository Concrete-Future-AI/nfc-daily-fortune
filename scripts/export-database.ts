import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ExportOptions {
  outputPath?: string
  includeData?: boolean
  includeSchema?: boolean
}

class DatabaseExporter {
  private outputPath: string
  private includeData: boolean
  private includeSchema: boolean

  constructor(options: ExportOptions = {}) {
    this.outputPath = options.outputPath || path.join(__dirname, '..', 'exports')
    this.includeData = options.includeData !== false
    this.includeSchema = options.includeSchema !== false
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('测试数据库连接...')
      await prisma.$connect()
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ 数据库连接成功')
      return true
    } catch (error) {
      console.error('❌ 数据库连接失败:', error)
      console.error('请检查以下项目:')
      console.error('1. PostgreSQL服务是否运行')
      console.error('2. .env.local文件中的DATABASE_URL是否正确')
      console.error('3. 数据库是否存在')
      console.error('4. 用户名和密码是否正确')
      return false
    }
  }

  async export(): Promise<void> {
    try {
      console.log('开始导出数据库...')
      
      // 测试数据库连接
      const isConnected = await this.testConnection()
      if (!isConnected) {
        throw new Error('数据库连接失败，无法继续导出')
      }

      // 确保输出目录存在
      if (!fs.existsSync(this.outputPath)) {
        fs.mkdirSync(this.outputPath, { recursive: true })
        console.log(`创建输出目录: ${this.outputPath}`)
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const sqlFilePath = path.join(this.outputPath, `database-export-${timestamp}.sql`)
      
      let sqlContent = ''

      // 添加文件头注释
      sqlContent += this.generateHeader()

      if (this.includeSchema) {
        console.log('导出表结构...')
        sqlContent += await this.generateSchema()
      }

      if (this.includeData) {
        console.log('导出数据...')
        sqlContent += await this.generateData()
      }

      // 写入文件
      fs.writeFileSync(sqlFilePath, sqlContent, 'utf8')
      
      console.log(`✅ 数据库导出完成！`)
      console.log(`📁 文件路径: ${sqlFilePath}`)
      console.log(`📊 文件大小: ${(fs.statSync(sqlFilePath).size / 1024).toFixed(2)} KB`)

    } catch (error) {
      console.error('❌ 导出失败:', error)
      throw error
    } finally {
      await prisma.$disconnect()
    }
  }

  private generateHeader(): string {
    const now = new Date().toISOString()
    return `-- =============================================
-- 健康运势助手数据库导出
-- 导出时间: ${now}
-- 数据库类型: PostgreSQL
-- 包含表结构: ${this.includeSchema ? '是' : '否'}
-- 包含数据: ${this.includeData ? '是' : '否'}
-- =============================================

-- 设置客户端编码
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- 创建数据库（如果不存在）
-- CREATE DATABASE fortune_app WITH ENCODING 'UTF8';
-- \\c fortune_app;

`
  }

  private async generateSchema(): Promise<string> {
    let schema = `-- =============================================
-- 表结构定义
-- =============================================

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS "fortunes" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- 创建用户表
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "nfc_uid" VARCHAR(255) UNIQUE NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(10),
    "date_of_birth" DATE NOT NULL,
    "birth_place" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建运势表
CREATE TABLE "fortunes" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "fortune_date" DATE NOT NULL,
    "overall_rating" INTEGER NOT NULL,
    "health_fortune" TEXT NOT NULL,
    "health_suggestion" TEXT NOT NULL,
    "wealth_fortune" TEXT NOT NULL,
    "interpersonal_fortune" TEXT NOT NULL,
    "lucky_color" VARCHAR(50) NOT NULL,
    "action_suggestion" TEXT NOT NULL,
    "raw_ai_response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fortunes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 创建索引
CREATE UNIQUE INDEX "users_nfc_uid_key" ON "users"("nfc_uid");
CREATE UNIQUE INDEX "fortunes_user_id_fortune_date_key" ON "fortunes"("user_id", "fortune_date");
CREATE INDEX "fortunes_user_id_idx" ON "fortunes"("user_id");
CREATE INDEX "fortunes_fortune_date_idx" ON "fortunes"("fortune_date");

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为用户表创建更新时间触发器
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON "users" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

`
    return schema
  }

  private async generateData(): Promise<string> {
    let data = `-- =============================================
-- 数据导出
-- =============================================

`

    try {
      // 导出用户数据
      console.log('正在查询用户数据...')
      const users = await prisma.user.findMany({
        orderBy: { id: 'asc' }
      })

      if (users.length > 0) {
        console.log(`找到 ${users.length} 条用户记录`)
        data += `-- 用户数据 (${users.length} 条记录)\n`
        data += `INSERT INTO "users" ("id", "nfc_uid", "name", "gender", "date_of_birth", "birth_place", "created_at", "updated_at") VALUES\n`
        
        const userValues = users.map(user => {
          const values = [
            user.id,
            this.escapeString(user.nfcUid),
            this.escapeString(user.name),
            user.gender ? this.escapeString(user.gender) : 'NULL',
            `'${user.dateOfBirth.toISOString().split('T')[0]}'`,
            user.birthPlace ? this.escapeString(user.birthPlace) : 'NULL',
            `'${user.createdAt.toISOString()}'`,
            `'${user.updatedAt.toISOString()}'`
          ]
          return `(${values.join(', ')})`
        })
        
        data += userValues.join(',\n') + ';\n\n'

        // 重置用户表序列
        data += `-- 重置用户表序列\n`
        data += `SELECT setval('users_id_seq', (SELECT MAX(id) FROM "users"));\n\n`
      } else {
        console.log('未找到用户数据')
        data += `-- 未找到用户数据\n\n`
      }

      // 导出运势数据
      console.log('正在查询运势数据...')
      const fortunes = await prisma.fortune.findMany({
        orderBy: { id: 'asc' }
      })

      if (fortunes.length > 0) {
        console.log(`找到 ${fortunes.length} 条运势记录`)
        data += `-- 运势数据 (${fortunes.length} 条记录)\n`
        data += `INSERT INTO "fortunes" ("id", "user_id", "fortune_date", "overall_rating", "health_fortune", "health_suggestion", "wealth_fortune", "interpersonal_fortune", "lucky_color", "action_suggestion", "raw_ai_response", "created_at") VALUES\n`
        
        const fortuneValues = fortunes.map(fortune => {
          const values = [
            fortune.id,
            fortune.userId,
            `'${fortune.fortuneDate.toISOString().split('T')[0]}'`,
            fortune.overallRating,
            this.escapeString(fortune.healthFortune),
            this.escapeString(fortune.healthSuggestion),
            this.escapeString(fortune.wealthFortune),
            this.escapeString(fortune.interpersonalFortune),
            this.escapeString(fortune.luckyColor),
            this.escapeString(fortune.actionSuggestion),
            fortune.rawAiResponse ? this.escapeString(JSON.stringify(fortune.rawAiResponse)) : 'NULL',
            `'${fortune.createdAt.toISOString()}'`
          ]
          return `(${values.join(', ')})`
        })
        
        data += fortuneValues.join(',\n') + ';\n\n'

        // 重置运势表序列
        data += `-- 重置运势表序列\n`
        data += `SELECT setval('fortunes_id_seq', (SELECT MAX(id) FROM "fortunes"));\n\n`
      } else {
        console.log('未找到运势数据')
        data += `-- 未找到运势数据\n\n`
      }

      // 添加统计信息
      data += `-- =============================================
-- 导出统计
-- =============================================
-- 用户总数: ${users.length}
-- 运势记录总数: ${fortunes.length}
-- 导出完成时间: ${new Date().toISOString()}
-- =============================================

`

    } catch (error) {
      console.error('查询数据时出错:', error)
      data += `-- 数据导出失败: ${error}\n\n`
    }

    return data
  }

  private escapeString(str: string): string {
    if (str === null || str === undefined) {
      return 'NULL'
    }
    // 转义单引号和反斜杠
    const escaped = str.replace(/'/g, "''").replace(/\\/g, '\\\\')
    return `'${escaped}'`
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2)
  const options: ExportOptions = {}

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--output':
      case '-o':
        options.outputPath = args[++i]
        break
      case '--no-data':
        options.includeData = false
        break
      case '--no-schema':
        options.includeSchema = false
        break
      case '--help':
      case '-h':
        console.log(`
使用方法: npm run export-db [选项]

选项:
  -o, --output <路径>    指定输出目录 (默认: ./exports)
  --no-data             不导出数据，仅导出表结构
  --no-schema           不导出表结构，仅导出数据
  -h, --help            显示帮助信息

示例:
  npm run export-db                    # 导出完整数据库
  npm run export-db --no-data          # 仅导出表结构
  npm run export-db -o ./backups       # 导出到指定目录
        `)
        process.exit(0)
        break
    }
  }

  const exporter = new DatabaseExporter(options)
  await exporter.export()
}

// 运行脚本
if (require.main === module) {
  main().catch(error => {
    console.error('导出失败:', error)
    process.exit(1)
  })
}

export { DatabaseExporter }