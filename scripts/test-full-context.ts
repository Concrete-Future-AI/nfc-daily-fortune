#!/usr/bin/env tsx

/**
 * 完整上下文信息测试脚本
 * 测试出生地和当前所在地分离的功能
 */

import dotenv from 'dotenv';
import path from 'path';
import { getFullContextInfo, formatLocationInfo, formatWeatherInfo } from '../lib/location-weather';
import { generateAIPrompt, callAIService } from '../lib/ai';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testFullContext() {
  console.log('🔍 完整上下文信息测试开始\n');
  
  // 测试用户数据
  const testUsers = [
    {
      name: '张三',
      gender: '男',
      dateOfBirth: new Date('1990-05-15'),
      birthPlace: '北京市'
    },
    {
      name: '李四',
      gender: '女',
      dateOfBirth: new Date('1985-12-20'),
      birthPlace: '上海市'
    },
    {
      name: '王五',
      gender: '男',
      dateOfBirth: new Date('1995-08-10'),
      birthPlace: '广州市'
    }
  ];

  for (const user of testUsers) {
    console.log(`🧑 测试用户: ${user.name} (出生地: ${user.birthPlace})`);
    console.log('=' .repeat(60));
    
    // 1. 获取完整上下文信息
    console.log('📍 步骤1: 获取位置和天气信息...');
    const contextInfo = await getFullContextInfo(user.birthPlace);
    
    const currentTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    
    console.log(`✅ 当前时间: ${currentTime}`);
    
    if (contextInfo.currentLocation) {
      console.log(`✅ 当前所在地: ${formatLocationInfo(contextInfo.currentLocation)}`);
    } else {
      console.log('⚠️  无法获取当前所在地（IP定位失败）');
    }
    
    if (contextInfo.birthLocation) {
      console.log(`✅ 出生地位置: ${formatLocationInfo(contextInfo.birthLocation)}`);
    } else {
      console.log('❌ 无法获取出生地位置信息');
    }
    
    if (contextInfo.weather) {
      console.log(`✅ 天气信息: ${formatWeatherInfo(contextInfo.weather)}`);
      const weatherLocation = contextInfo.currentLocation || contextInfo.birthLocation;
      if (weatherLocation) {
        console.log(`   (天气来源: ${formatLocationInfo(weatherLocation)})`);
      }
    } else {
      console.log('❌ 无法获取天气信息');
    }
    
    // 2. 生成AI提示词
    console.log('\n🤖 步骤2: 生成AI提示词...');
    const aiContextInfo = {
      currentTime,
      currentLocation: contextInfo.currentLocation ? formatLocationInfo(contextInfo.currentLocation) : '未知',
      weather: contextInfo.weather ? formatWeatherInfo(contextInfo.weather) : '未知'
    };
    
    const prompt = generateAIPrompt(user, aiContextInfo);
    console.log('✅ AI提示词生成成功');
    
    // 检查提示词内容
    const hasCurrentLocation = contextInfo.currentLocation && prompt.includes(formatLocationInfo(contextInfo.currentLocation));
    const hasBirthPlace = prompt.includes(user.birthPlace);
    const hasWeather = contextInfo.weather && prompt.includes(formatWeatherInfo(contextInfo.weather));
    
    console.log('🔍 提示词内容检查:');
    console.log(`   包含出生地信息: ${hasBirthPlace ? '✅' : '❌'}`);
    console.log(`   包含当前位置信息: ${hasCurrentLocation ? '✅' : '⚠️  (IP定位失败)'}`);
    console.log(`   包含天气信息: ${hasWeather ? '✅' : '❌'}`);
    
    // 3. 调用AI服务
    console.log('\n🚀 步骤3: 调用AI服务...');
    try {
      const aiResponse = await callAIService(prompt);
      
      if (aiResponse.success) {
        console.log('✅ AI运势生成成功');
        console.log(`   整体评级: ${aiResponse.data.overallRating}星`);
        console.log(`   健康运势: ${aiResponse.data.healthFortune.substring(0, 50)}...`);
        console.log(`   幸运色: ${aiResponse.data.luckyColor}`);
        
        // 检查AI是否理解了位置信息
        const responseStr = JSON.stringify(aiResponse.data);
        const mentionsBirthPlace = responseStr.includes(user.birthPlace.replace('市', ''));
        const mentionsWeather = contextInfo.weather && (
          responseStr.includes('雨') || 
          responseStr.includes('天气') || 
          responseStr.includes('气温') ||
          responseStr.includes('湿')
        );
        
        console.log('🧠 AI理解检查:');
        console.log(`   AI提及出生地相关: ${mentionsBirthPlace ? '✅' : '❌'}`);
        console.log(`   AI提及天气相关: ${mentionsWeather ? '✅' : '❌'}`);
        
      } else {
        console.log('❌ AI运势生成失败:', aiResponse.error);
      }
      
    } catch (error) {
      console.log('❌ AI服务调用失败:', error);
    }
    
    console.log('\n' + '=' .repeat(60) + '\n');
  }
  
  console.log('📊 完整上下文信息测试完成');
}

// 运行测试
if (require.main === module) {
  testFullContext().catch(console.error);
}

export { testFullContext };