#!/usr/bin/env tsx

/**
 * 系统功能综合测试脚本
 * 整合了位置服务、天气服务、AI服务等多个模块的测试
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { getLocationByIP, getLocationByBirthPlace, getWeatherByAdcode, getLocationAndWeather, formatLocationInfo, formatWeatherInfo } from '../lib/location-weather';
import { generateAIPrompt, callAIService } from '../lib/ai';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') });

interface TestOptions {
  location?: boolean;
  weather?: boolean;
  ai?: boolean;
  integration?: boolean;
  all?: boolean;
}

// 测试用户数据
const testUser = {
  name: '张三',
  gender: '男' as const,
  dateOfBirth: new Date('1980-05-15'),
  birthPlace: '北京市'
};

async function testLocationServices() {
  console.log('🌍 位置服务测试\n');
  
  // 检查API密钥
  const apiKey = process.env.AMAP_API_KEY;
  if (!apiKey) {
    console.error('❌ 未找到AMAP_API_KEY环境变量');
    return false;
  }
  console.log(`✅ API密钥已配置: ${apiKey.substring(0, 10)}...\n`);
  
  // 1. 测试当前IP定位
  console.log('📍 测试1: 当前IP定位...');
  try {
    const currentLocation = await getLocationByIP();
    if (currentLocation) {
      console.log('✅ 当前IP定位成功');
      console.log(`   省份: ${currentLocation.province}`);
      console.log(`   城市: ${currentLocation.city}`);
      console.log(`   区域代码: ${currentLocation.adcode}`);
      console.log(`   格式化: ${formatLocationInfo(currentLocation)}`);
    } else {
      console.log('⚠️  当前IP定位失败或返回空值');
    }
  } catch (error) {
    console.error('❌ 当前IP定位异常:', error);
  }
  
  // 2. 测试指定IP定位
  const testIPs = ['114.114.114.114', '202.96.134.133'];
  console.log('\\n📍 测试2: 指定IP定位...');
  for (const ip of testIPs) {
    console.log(`\\n测试IP: ${ip}`);
    try {
      const location = await getLocationByIP(ip);
      if (location) {
        console.log('✅ IP定位成功');
        console.log(`   省份: ${location.province}`);
        console.log(`   城市: ${location.city}`);
        console.log(`   区域代码: ${location.adcode}`);
      } else {
        console.log('⚠️  IP定位失败');
      }
    } catch (error) {
      console.error('❌ IP定位异常:', error);
    }
  }
  
  // 3. 测试出生地定位
  console.log('\\n📍 测试3: 出生地定位...');
  const birthPlaces = ['北京市', '上海市', '广州市', '深圳市'];
  for (const place of birthPlaces) {
    try {
      const location = await getLocationByBirthPlace(place);
      if (location) {
        console.log(`✅ ${place} 定位成功: ${location.province} ${location.city} (${location.adcode})`);
      } else {
        console.log(`⚠️  ${place} 定位失败`);
      }
    } catch (error) {
      console.error(`❌ ${place} 定位异常:`, error);
    }
  }
  
  return true;
}

async function testWeatherServices() {
  console.log('\\n🌤️  天气服务测试\\n');
  
  // 获取当前位置用于天气测试
  try {
    const location = await getLocationByIP();
    if (!location) {
      console.log('⚠️  无法获取当前位置，跳过天气测试');
      return false;
    }
    
    console.log(`📍 使用位置: ${location.city} (${location.adcode})`);
    
    // 测试天气查询
    console.log('\\n🌤️  测试天气查询...');
    const weather = await getWeatherByAdcode(location.adcode);
    if (weather) {
      console.log('✅ 天气查询成功');
      console.log(`   天气: ${weather.weather}`);
      console.log(`   温度: ${weather.temperature}°C`);
      console.log(`   风向: ${weather.winddirection}`);
      console.log(`   风力: ${weather.windpower}级`);
      console.log(`   湿度: ${weather.humidity}%`);
      console.log(`   更新时间: ${weather.reporttime}`);
      console.log(`   格式化: ${formatWeatherInfo(weather)}`);
      return true;
    } else {
      console.log('⚠️  天气查询失败');
      return false;
    }
  } catch (error) {
    console.error('❌ 天气服务异常:', error);
    return false;
  }
}

async function testAIServices() {
  console.log('\\n🤖 AI服务测试\\n');
  
  // 检查AI服务配置
  const aiEndpoint = process.env.AI_ENDPOINT;
  const aiApiKey = process.env.AI_API_KEY;
  
  if (!aiEndpoint || !aiApiKey) {
    console.error('❌ AI服务配置不完整');
    console.error('   需要配置: AI_ENDPOINT, AI_API_KEY');
    return false;
  }
  
  console.log(`✅ AI服务已配置: ${aiEndpoint}`);
  
  // 1. 测试提示词生成
  console.log('\\n📝 测试1: 提示词生成...');
  try {
    const contextInfo = {
      currentTime: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      currentLocation: '上海市',
      weather: '晴，气温25°C，东北风≤3级，湿度70%'
    };
    
    const prompt = generateAIPrompt(testUser, contextInfo);
    console.log('✅ 提示词生成成功');
    console.log(`   长度: ${prompt.length} 字符`);
    console.log(`   预览: ${prompt.substring(0, 100)}...`);
  } catch (error) {
    console.error('❌ 提示词生成失败:', error);
    return false;
  }
  
  // 2. 测试AI调用
  console.log('\\n🔮 测试2: AI运势生成...');
  try {
    const contextInfo = {
      currentTime: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      currentLocation: '上海市',
      weather: '晴，气温25°C'
    };
    
    const prompt = generateAIPrompt(testUser, contextInfo);
    const result = await callAIService(prompt);
    if (result.success && result.data) {
      console.log('✅ AI运势生成成功');
      console.log(`   运势内容: ${result.data.healthFortune.substring(0, 100)}...`);
      return true;
    } else {
      console.log('⚠️  AI运势生成失败:', !result.success ? (result as any).error : '未知错误');
      return false;
    }
  } catch (error) {
    console.error('❌ AI服务调用异常:', error);
    return false;
  }
}

async function testIntegration() {
  console.log('\\n🔄 集成测试\\n');
  
  console.log('📋 测试用户信息:');
  console.log(`   姓名: ${testUser.name}`);
  console.log(`   性别: ${testUser.gender}`);
  console.log(`   出生日期: ${testUser.dateOfBirth.toISOString().split('T')[0]}`);
  console.log(`   出生地: ${testUser.birthPlace}`);
  
  // 测试完整的位置和天气获取
  console.log('\\n🌍 测试完整的位置和天气获取...');
  try {
    const { location, weather } = await getLocationAndWeather();
    
    if (location && weather) {
      console.log('✅ 位置和天气获取成功');
      
      const contextInfo = {
        currentTime: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        currentLocation: formatLocationInfo(location),
        weather: formatWeatherInfo(weather)
      };
      
      console.log('\\n🤖 测试完整的AI运势生成流程...');
      const prompt = generateAIPrompt(testUser, contextInfo);
      const result = await callAIService(prompt);
      
      if (result.success && result.data) {
        console.log('✅ 完整流程测试成功');
        console.log('\\n📊 最终结果:');
        console.log(`   位置: ${contextInfo.currentLocation}`);
        console.log(`   天气: ${contextInfo.weather}`);
        console.log(`   运势: ${result.data.healthFortune.substring(0, 200)}...`);
        return true;
      } else {
        console.log('⚠️  AI运势生成失败:', !result.success ? (result as any).error : '未知错误');
        return false;
      }
    } else {
      console.log('⚠️  位置或天气获取失败');
      return false;
    }
  } catch (error) {
    console.error('❌ 集成测试异常:', error);
    return false;
  }
}

function parseArguments(): TestOptions {
  const args = process.argv.slice(2);
  const options: TestOptions = {};
  
  if (args.length === 0) {
    options.all = true;
    return options;
  }
  
  for (const arg of args) {
    switch (arg) {
      case '--location':
      case '-l':
        options.location = true;
        break;
      case '--weather':
      case '-w':
        options.weather = true;
        break;
      case '--ai':
      case '-a':
        options.ai = true;
        break;
      case '--integration':
      case '-i':
        options.integration = true;
        break;
      case '--all':
        options.all = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
      default:
        console.error(`❌ 未知参数: ${arg}`);
        console.error('使用 --help 查看帮助信息');
        process.exit(1);
    }
  }
  
  return options;
}

function showHelp() {
  console.log(`
📚 系统功能测试脚本使用说明

🎯 功能：
   测试系统各个模块的功能，包括位置服务、天气服务、AI服务等

📝 语法：
   npx tsx scripts/test-system.ts [选项]

🔧 选项：
   --location, -l      仅测试位置服务
   --weather, -w       仅测试天气服务  
   --ai, -a           仅测试AI服务
   --integration, -i   仅测试集成功能
   --all              测试所有功能（默认）
   --help, -h         显示此帮助信息

🌟 示例：
   # 测试所有功能
   npx tsx scripts/test-system.ts

   # 仅测试位置服务
   npx tsx scripts/test-system.ts --location

   # 测试位置和天气服务
   npx tsx scripts/test-system.ts --location --weather

   # 测试集成功能
   npx tsx scripts/test-system.ts --integration
`);
}

async function runTests() {
  const options = parseArguments();
  
  console.log('🧪 系统功能测试开始');
  console.log('='.repeat(80));
  
  const results = {
    location: true,
    weather: true,
    ai: true,
    integration: true
  };
  
  try {
    if (options.all || options.location) {
      results.location = await testLocationServices();
    }
    
    if (options.all || options.weather) {
      results.weather = await testWeatherServices();
    }
    
    if (options.all || options.ai) {
      results.ai = await testAIServices();
    }
    
    if (options.all || options.integration) {
      results.integration = await testIntegration();
    }
    
    // 显示测试结果摘要
    console.log('\\n' + '='.repeat(80));
    console.log('📊 测试结果摘要');
    console.log('='.repeat(80));
    
    if (options.all || options.location) {
      console.log(`🌍 位置服务: ${results.location ? '✅ 通过' : '❌ 失败'}`);
    }
    if (options.all || options.weather) {
      console.log(`🌤️  天气服务: ${results.weather ? '✅ 通过' : '❌ 失败'}`);
    }
    if (options.all || options.ai) {
      console.log(`🤖 AI服务: ${results.ai ? '✅ 通过' : '❌ 失败'}`);
    }
    if (options.all || options.integration) {
      console.log(`🔄 集成测试: ${results.integration ? '✅ 通过' : '❌ 失败'}`);
    }
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\\n🎯 总体结果: ${allPassed ? '✅ 全部通过' : '⚠️  部分失败'}`);
    
  } catch (error) {
    console.error('❌ 测试过程中发生异常:', error);
    process.exit(1);
  }
}

// 主程序入口
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  });
}

export { runTests, testLocationServices, testWeatherServices, testAIServices, testIntegration };