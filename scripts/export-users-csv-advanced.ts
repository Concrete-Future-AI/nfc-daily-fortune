import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 导出选项接口
interface ExportOptions {
  includePreRegistered?: boolean;  // 是否包含预注册用户
  includeRegistered?: boolean;     // 是否包含已注册用户
  dateFrom?: Date;                 // 创建时间起始日期
  dateTo?: Date;                   // 创建时间结束日期
  outputFileName?: string;         // 自定义输出文件名
}

// 转义CSV字段中的特殊字符
function escapeCsvField(field: string | null | undefined): string {
  if (field === null || field === undefined) {
    return '';
  }
  
  const str = String(field);
  // 如果包含逗号、双引号或换行符，需要用双引号包围并转义内部的双引号
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// 格式化日期为YYYY-MM-DD格式
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// 格式化日期时间为YYYY-MM-DD HH:mm:ss格式
function formatDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
}

async function exportUsersToCSV(options: ExportOptions = {}) {
  const {
    includePreRegistered = true,
    includeRegistered = true,
    dateFrom,
    dateTo,
    outputFileName
  } = options;
  
  console.log('📊 开始导出用户数据到CSV文件...\n');
  console.log('🔧 导出选项:');
  console.log(`   包含预注册用户: ${includePreRegistered ? '是' : '否'}`);
  console.log(`   包含已注册用户: ${includeRegistered ? '是' : '否'}`);
  if (dateFrom) console.log(`   创建时间起始: ${formatDate(dateFrom)}`);
  if (dateTo) console.log(`   创建时间结束: ${formatDate(dateTo)}`);
  console.log('');
  
  try {
    // 构建查询条件
    const whereConditions: any[] = [];
    
    // 用户类型过滤
    if (!includePreRegistered || !includeRegistered) {
      if (includePreRegistered && !includeRegistered) {
        whereConditions.push({
          name: { startsWith: '待注册用户_' }
        });
      } else if (!includePreRegistered && includeRegistered) {
        whereConditions.push({
          name: { not: { startsWith: '待注册用户_' } }
        });
      }
    }
    
    // 日期范围过滤
    if (dateFrom || dateTo) {
      const dateFilter: any = {};
      if (dateFrom) dateFilter.gte = dateFrom;
      if (dateTo) dateFilter.lte = dateTo;
      whereConditions.push({
        createdAt: dateFilter
      });
    }
    
    // 获取用户数据
    console.log('🔍 正在查询用户数据...');
    const users = await prisma.user.findMany({
      where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
      orderBy: [
        { id: 'asc' }
      ]
    });
    
    console.log(`📋 找到 ${users.length} 个用户记录`);
    
    if (users.length === 0) {
      console.log('⚠️  没有找到符合条件的用户数据');
      return;
    }
    
    // 创建CSV内容
    const csvHeaders = [
      'ID',
      'NFC_UID',
      '用户名',
      '性别',
      '出生日期',
      '出生地',
      '创建时间',
      '更新时间',
      '用户类型',
      '注册状态'
    ];
    
    // 构建CSV内容
    let csvContent = csvHeaders.join(',') + '\n';
    
    users.forEach(user => {
      // 判断用户类型和注册状态
      const isPreRegistered = user.name.startsWith('待注册用户_');
      const userType = isPreRegistered ? '预注册用户' : '已注册用户';
      const registrationStatus = isPreRegistered ? '未注册' : '已注册';
      
      const row = [
        escapeCsvField(user.id.toString()),
        escapeCsvField(user.nfcUid),
        escapeCsvField(user.name),
        escapeCsvField(user.gender),
        escapeCsvField(formatDate(user.dateOfBirth)),
        escapeCsvField(user.birthPlace),
        escapeCsvField(formatDateTime(user.createdAt)),
        escapeCsvField(formatDateTime(user.updatedAt)),
        escapeCsvField(userType),
        escapeCsvField(registrationStatus)
      ];
      
      csvContent += row.join(',') + '\n';
    });
    
    // 生成文件名
    let fileName: string;
    if (outputFileName) {
      fileName = outputFileName.endsWith('.csv') ? outputFileName : `${outputFileName}.csv`;
    } else {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
      const typeFilter = !includePreRegistered ? '-registered-only' : 
                        !includeRegistered ? '-preregistered-only' : '';
      const dateFilter = dateFrom || dateTo ? `-filtered` : '';
      fileName = `users-export${typeFilter}${dateFilter}-${timestamp}.csv`;
    }
    
    const filePath = path.join(process.cwd(), 'exports', fileName);
    
    // 确保exports目录存在
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
      console.log('📁 创建了exports目录');
    }
    
    // 写入CSV文件
    console.log('💾 正在写入CSV文件...');
    fs.writeFileSync(filePath, '\uFEFF' + csvContent, 'utf8'); // 添加BOM以支持Excel中文显示
    
    console.log(`✅ CSV文件导出成功！`);
    console.log(`📄 文件路径: ${filePath}`);
    console.log(`📊 导出记录数: ${users.length}`);
    
    // 统计信息
    const preRegisteredCount = users.filter(user => user.name.startsWith('待注册用户_')).length;
    const registeredCount = users.length - preRegisteredCount;
    
    console.log(`\n📈 数据统计:`);
    console.log(`   总导出用户数: ${users.length}`);
    console.log(`   已注册用户: ${registeredCount}`);
    console.log(`   预注册用户: ${preRegisteredCount}`);
    
    // 显示文件大小
    const stats = fs.statSync(filePath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   文件大小: ${fileSizeKB} KB`);
    
    console.log(`\n🎉 导出完成！您可以在exports目录中找到CSV文件。`);
    
  } catch (error) {
    console.error('❌ 导出过程中发生错误:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 解析命令行参数
function parseCommandLineArgs(): ExportOptions {
  const args = process.argv.slice(2);
  const options: ExportOptions = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--registered-only':
        options.includePreRegistered = false;
        options.includeRegistered = true;
        break;
      case '--preregistered-only':
        options.includePreRegistered = true;
        options.includeRegistered = false;
        break;
      case '--date-from':
        if (i + 1 < args.length) {
          options.dateFrom = new Date(args[++i]);
        }
        break;
      case '--date-to':
        if (i + 1 < args.length) {
          options.dateTo = new Date(args[++i]);
        }
        break;
      case '--output':
        if (i + 1 < args.length) {
          options.outputFileName = args[++i];
        }
        break;
      case '--help':
        console.log(`
用户数据导出脚本使用说明:

基本用法:
  npx tsx scripts/export-users-csv-advanced.ts

选项:
  --registered-only      只导出已注册用户
  --preregistered-only   只导出预注册用户
  --date-from YYYY-MM-DD 导出指定日期之后创建的用户
  --date-to YYYY-MM-DD   导出指定日期之前创建的用户
  --output FILENAME      指定输出文件名
  --help                 显示此帮助信息

示例:
  # 导出所有用户
  npx tsx scripts/export-users-csv-advanced.ts
  
  # 只导出已注册用户
  npx tsx scripts/export-users-csv-advanced.ts --registered-only
  
  # 导出2025年10月9日之后创建的用户
  npx tsx scripts/export-users-csv-advanced.ts --date-from 2025-10-09
  
  # 导出指定日期范围的预注册用户
  npx tsx scripts/export-users-csv-advanced.ts --preregistered-only --date-from 2025-10-01 --date-to 2025-10-31
        `);
        process.exit(0);
    }
  }
  
  return options;
}

// 执行导出
if (require.main === module) {
  const options = parseCommandLineArgs();
  exportUsersToCSV(options)
    .catch((error) => {
      console.error('❌ 导出脚本执行失败:', error);
      process.exit(1);
    });
}