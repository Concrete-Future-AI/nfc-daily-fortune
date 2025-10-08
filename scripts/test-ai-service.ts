#!/usr/bin/env tsx

/**
 * AI服务测试脚本
 * 用于测试AI服务配置是否正常工作，包括时间、地点、天气功能集成
 */

import dotenv from 'dotenv';
import path from 'path';
import { generateAIPrompt, callAIService } from '../lib/ai';
import { getLocationAndWeather, formatLocationInfo, formatWeatherInfo, LocationInfo, WeatherInfo } from '../lib/location-weather';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') });

interface TestUser {
  name: string;
  gender: string;
  dateOfBirth: Date;
  birthPlace: string;
}

// 测试用户数据
const testUsers: TestUser[] = [
  {
    name: "张三",
    gender: "男",
    dateOfBirth: new Date("1990-05-15"),
    birthPlace: "北京市"
  },
  {
    name: "李四",
    gender: "女", 
    dateOfBirth: new Date("1985-12-20"),
    birthPlace: "上海市"
  },
  {
    name: "王五",
    gender: "男",
    dateOfBirth: new Date("1995-08-10"),
    birthPlace: "广州市"
  }
];

async function testAIServiceConfiguration() {
  console.log('🔧 AI服务配置测试开始...\n');
  
  // 检查环境变量
  const requiredEnvVars = ['AI_ENDPOINT', 'AI_API_KEY', 'AI_MODEL_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ 缺少必要的环境变量:', missingVars.join(', '));
    process.exit(1);
  }
  
  console.log('✅ 环境变量检查通过');
  console.log(`   AI_ENDPOINT: ${process.env.AI_ENDPOINT}`);
  console.log(`   AI_MODEL_NAME: ${process.env.AI_MODEL_NAME}`);
  console.log(`   AI_API_KEY: ${process.env.AI_API_KEY?.substring(0, 10)}...`);
  console.log();
}

async function testLocationWeatherService() {
  console.log('🌍 位置和天气服务测试...\n');
  
  try {
    const locationWeather = await getLocationAndWeather();
    const currentTime = new Date().toLocaleString('zh-CN');
    const locationStr = locationWeather.location ? formatLocationInfo(locationWeather.location) : "未知位置";
    const weatherStr = locationWeather.weather ? formatWeatherInfo(locationWeather.weather) : "晴朗";
    
    console.log('✅ 位置和天气服务正常');
    console.log(`   位置: ${locationStr}`);
    console.log(`   天气: ${weatherStr}`);
    console.log(`   时间: ${currentTime}`);
    console.log();
    
    return {
      currentTime,
      location: locationStr,
      weather: weatherStr
    };
  } catch (error) {
    console.error('❌ 位置和天气服务失败:', error);
    console.log('⚠️  将使用默认值继续测试...\n');
    return {
      currentTime: new Date().toLocaleString('zh-CN'),
      location: "未知位置",
      weather: "晴朗"
    };
  }
}

async function testAIFortuneGeneration(user: TestUser, contextInfo: any) {
  console.log(`🔮 测试用户 "${user.name}" 的运势生成...`);
  
  try {
    const prompt = generateAIPrompt(user, contextInfo);
    const response = await callAIService(prompt);
    
    if (response.success) {
      console.log('✅ AI运势生成成功');
      console.log(`   用户: ${user.name} (${user.gender}, ${user.dateOfBirth.toLocaleDateString()})`);
      console.log(`   出生地: ${user.birthPlace}`);
      console.log(`   整体评级: ${response.data.overallRating}星`);
      console.log(`   健康运势: ${response.data.healthFortune.substring(0, 50)}...`);
      console.log();
      return true;
    } else {
      console.error(`❌ AI运势生成失败 (${user.name}):`, response.error);
      console.log();
      return false;
    }
  } catch (error) {
    console.error(`❌ AI运势生成失败 (${user.name}):`, error);
    console.log();
    return false;
  }
}

async function runFullTest() {
  console.log('🚀 开始完整的AI服务测试\n');
  console.log('='.repeat(50));
  
  try {
    // 1. 测试配置
    await testAIServiceConfiguration();
    
    // 2. 测试位置天气服务
    const contextInfo = await testLocationWeatherService();
    
    // 3. 测试AI运势生成
    console.log('🤖 AI运势生成测试...\n');
    
    let successCount = 0;
    for (const user of testUsers) {
      const success = await testAIFortuneGeneration(user, contextInfo);
      if (success) successCount++;
    }
    
    // 4. 测试结果汇总
    console.log('='.repeat(50));
    console.log('📊 测试结果汇总:');
    console.log(`   总测试用户: ${testUsers.length}`);
    console.log(`   成功生成: ${successCount}`);
    console.log(`   失败数量: ${testUsers.length - successCount}`);
    console.log(`   成功率: ${((successCount / testUsers.length) * 100).toFixed(1)}%`);
    
    if (successCount === testUsers.length) {
      console.log('\n🎉 所有测试通过！AI服务配置正常工作。');
      process.exit(0);
    } else {
      console.log('\n⚠️  部分测试失败，请检查AI服务配置。');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 测试过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runFullTest().catch(console.error);
}

export { testAIServiceConfiguration, testLocationWeatherService, testAIFortuneGeneration };