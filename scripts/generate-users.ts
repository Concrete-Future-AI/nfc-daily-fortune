import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GenerateOptions {
  count: number;
  environment: 'test' | 'prod';
  force?: boolean;
}

// 生成随机字符串（用于NFC UID）
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 生成唯一的NFC UID
async function generateUniqueNfcUid(environment: 'test' | 'prod'): Promise<string> {
  let nfcUid: string;
  let exists = true;
  
  while (exists) {
    // 根据环境生成不同前缀：TEST_ 或 PROD_
    const prefix = environment === 'test' ? 'TEST_' : 'PROD_';
    nfcUid = `${prefix}${generateRandomString(8)}`;
    
    // 检查是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { nfcUid }
    });
    
    exists = !!existingUser;
  }
  
  return nfcUid!;
}

// 检查数据库是否为生产环境
async function checkProductionEnvironment(): Promise<boolean> {
  // 检查是否有真实用户数据（非"待注册用户_"开头的用户）
  const realUsers = await prisma.user.count({
    where: {
      name: {
        not: {
          startsWith: '待注册用户_'
        }
      }
    }
  });
  
  return realUsers > 0;
}

async function generateUsers(options: GenerateOptions) {
  const { count, environment, force = false } = options;
  
  console.log(`🚀 开始生成${count}个${environment === 'test' ? '测试' : '生产'}环境的未注册用户...`);
  
  // 安全检查：如果是生产环境且数据库已有真实数据，需要force参数
  const isProductionDB = await checkProductionEnvironment();
  if (environment === 'prod' && isProductionDB && !force) {
    console.error('❌ 错误：检测到数据库已投入生产使用！');
    console.error('   为了安全起见，禁止生成生产环境数据。');
    console.error('   如果您确实需要生成测试数据，请使用 --env test 参数。');
    console.error('   如果您确实需要在生产环境中添加数据，请使用 --force 参数（谨慎使用）。');
    process.exit(1);
  }
  
  if (environment === 'prod' && isProductionDB && force) {
    console.warn('⚠️  警告：您正在生产数据库中生成数据！');
    console.warn('   请确保您知道自己在做什么。');
  }
  
  const users = [];
  const batchSize = 50; // 每批处理50个用户
  let successCount = 0;
  let errorCount = 0;
  
  try {
    for (let i = 0; i < count; i++) {
      const nfcUid = await generateUniqueNfcUid(environment);
      const userName = `待注册用户_${nfcUid}`;
      
      users.push({
        nfcUid,
        name: userName,
        gender: null,
        dateOfBirth: new Date('1899-12-31'),
        birthPlace: null,
      });
      
      // 每达到批次大小或最后一批时，执行数据库插入
      if (users.length === batchSize || i === count - 1) {
        try {
          await prisma.user.createMany({
            data: users,
            skipDuplicates: true
          });
          
          successCount += users.length;
          console.log(`✅ 成功创建第 ${Math.ceil((i + 1) / batchSize)} 批用户 (${users.length} 个)`);
          
          // 清空数组准备下一批
          users.length = 0;
        } catch (error) {
          console.error(`❌ 第 ${Math.ceil((i + 1) / batchSize)} 批用户创建失败:`, error);
          errorCount += users.length;
          users.length = 0;
        }
      }
    }
    
    // 显示最终统计
    console.log(`\n📊 生成完成！`);
    console.log(`✅ 成功创建: ${successCount} 个用户`);
    console.log(`❌ 创建失败: ${errorCount} 个用户`);
    
    // 显示数据库统计
    const totalUsers = await prisma.user.count();
    const preGeneratedUsers = await prisma.user.count({
      where: {
        name: {
          startsWith: '待注册用户_'
        }
      }
    });
    const registeredUsers = totalUsers - preGeneratedUsers;
    
    console.log(`\n📈 数据库统计:`);
    console.log(`👥 总用户数: ${totalUsers}`);
    console.log(`✅ 已注册用户数: ${registeredUsers}`);
    console.log(`👤 预注册用户数: ${preGeneratedUsers}`);
    
  } catch (error) {
    console.error('❌ 生成用户时发生错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 解析命令行参数
function parseArguments(): GenerateOptions {
  const args = process.argv.slice(2);
  const options: GenerateOptions = {
    count: 100, // 默认生成100个用户
    environment: 'test' // 默认测试环境
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
        
      case '--count':
      case '-c':
        const countValue = parseInt(args[i + 1]);
        if (isNaN(countValue) || countValue <= 0) {
          console.error('❌ 错误：count 参数必须是正整数');
          process.exit(1);
        }
        options.count = countValue;
        i++; // 跳过下一个参数
        break;
        
      case '--env':
      case '--environment':
        const envValue = args[i + 1];
        if (envValue !== 'test' && envValue !== 'prod') {
          console.error('❌ 错误：environment 参数必须是 test 或 prod');
          process.exit(1);
        }
        options.environment = envValue;
        i++; // 跳过下一个参数
        break;
        
      case '--force':
        options.force = true;
        break;
        
      default:
        if (arg.startsWith('-')) {
          console.error(`❌ 错误：未知参数 ${arg}`);
          console.error('使用 --help 查看帮助信息');
          process.exit(1);
        }
        break;
    }
  }
  
  return options;
}

function showHelp() {
  console.log(`
📚 用户生成脚本使用说明

🎯 功能：
   生成指定数量的预注册用户数据

📝 语法：
   npx tsx scripts/generate-users.ts [选项]

🔧 选项：
   --count, -c <数量>        生成用户数量 (默认: 100)
   --env, --environment <环境>  环境类型: test 或 prod (默认: test)
   --force                   强制在生产数据库中生成数据（谨慎使用）
   --help, -h               显示此帮助信息

🌟 示例：
   # 生成100个测试用户（默认）
   npx tsx scripts/generate-users.ts

   # 生成500个测试用户
   npx tsx scripts/generate-users.ts --count 500

   # 生成1000个测试用户
   npx tsx scripts/generate-users.ts --count 1000 --env test

   # 查看帮助
   npx tsx scripts/generate-users.ts --help

⚠️  安全说明：
   - 默认只能生成测试环境数据（TEST_前缀）
   - 如果数据库已投入生产使用，将自动阻止生成生产数据
   - 生产环境数据生成需要 --force 参数（极不推荐）

🔒 数据格式：
   - 测试环境：NFC UID 格式为 TEST_XXXXXXXX
   - 生产环境：NFC UID 格式为 PROD_XXXXXXXX
   - 用户名格式：待注册用户_[NFC_UID]
   - 默认出生日期：1899-12-31
   - 性别和出生地：NULL
`);
}

// 主程序入口
if (require.main === module) {
  const options = parseArguments();
  generateUsers(options)
    .catch(error => {
      console.error('❌ 程序执行失败:', error);
      process.exit(1);
    });
}

export { generateUsers };
export type { GenerateOptions };
